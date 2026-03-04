/**
 * 1. THE LOADER INJECTION
 */
function injectPixelSequenceLoader(isExit = false) {
    // If it's an exit animation, we want the pixels to start HIDDEN then cover the screen
    const initialTileClass = isExit ? 'pixel-tile' : 'pixel-tile pixel-visible';
    const targetTileClass = isExit ? 'pixel-visible' : '';

    const loaderHTML = `
        <div id="pixel-wrapper" style="position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:9999; pointer-events:none; display:grid; grid-template-columns: repeat(10, 1fr); grid-auto-rows: 10vw;">
            ${Array(200).fill(`<div class="pixel-tile ${isExit ? '' : 'pixel-visible'}"></div>`).join('')}
        </div>
        <div id="loader-content" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); z-index:10000; text-align:center; opacity: ${isExit ? 0 : 1}; transition: opacity 0.5s ease;">
            <img id="loader-logo" class="${isExit ? '' : 'is-pulsing'}" src="assets/img/brand/southflock-logo-horizontal-1.svg" 
                 style="width:280px; height:auto; transform: scale(1); transition: all 0.7s ease;">
        </div>
        <style>
            body.is-loading { overflow: hidden; }
            .pixel-tile { background: #0e0e0e; width: 100%; aspect-ratio: 1/1; opacity: 0; transform: scale(1.1); transition: opacity 0.3s ease, transform 0.3s ease; }
            .pixel-visible { opacity: 1; transform: scale(1); }
            @keyframes logoBreath {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(0.98); }
                100% { opacity: 1; transform: scale(1); }
            }
            .is-pulsing { animation: logoBreath 2.5s ease-in-out infinite; }
        </style>
    `;

    document.body.insertAdjacentHTML('afterbegin', loaderHTML);
    if (!isExit) document.body.classList.add('is-loading');
}

/**
 * 2. ENTRANCE LOGIC (When page starts)
 */
function playEntrance() {
    injectPixelSequenceLoader(false);
    const tiles = document.querySelectorAll('.pixel-tile');
    const content = document.getElementById('loader-content');

    setTimeout(() => {
        content.style.opacity = "0"; // Fade logo
        setTimeout(() => {
            tiles.forEach((tile, index) => {
                const delay = (index % 10 + Math.floor(index / 10)) * 20;
                setTimeout(() => tile.classList.remove('pixel-visible'), delay);
            });
            document.body.classList.remove('is-loading');
            setTimeout(() => {
                document.getElementById('pixel-wrapper')?.remove();
                content?.remove();
            }, 1000);
        }, 400);
    }, 800);
}

/**
 * 3. EXIT LOGIC (When clicking a link)
 */
function playExit(destination) {
    injectPixelSequenceLoader(true);
    const tiles = document.querySelectorAll('.pixel-tile');

    // Sweep pixels ON to cover the screen
    tiles.forEach((tile, index) => {
        const delay = (index % 10 + Math.floor(index / 10)) * 20;
        setTimeout(() => tile.classList.add('pixel-visible'), delay);
    });

    // Navigate away once the screen is fully black
    setTimeout(() => {
        window.location.href = destination;
    }, 800);
}

// Start Entrance on Load
window.addEventListener('DOMContentLoaded', playEntrance);

// Intercept Links for Smooth Exit
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link &&
        link.href &&
        link.href.includes(window.location.origin) && // Internal links only
        !link.hash && // Not anchor links
        link.target !== "_blank" // Not new tabs
    ) {
        e.preventDefault();
        playExit(link.href);
    }
});