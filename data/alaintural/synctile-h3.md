# alaintural/synctile-h3

## Resumen

SyncTile H3 es un conjunto de herramientas de código abierto, publicado por Alain Tural (Pixedi AI Lab), que permite escalar vídeos generados con MiniMax H3 hasta resolución 1080p, 2K y 4K sin costuras visibles. No se trata de un modelo con pesos propios: el repositorio de Hugging Face no contiene checkpoints, sino que actúa como punto de entrada a un nodo de ComfyUI y a una pipeline de refinamiento por teselas sincronizadas, cuyo código vive en GitHub. La relevancia actual reside en que MiniMax H3, el modelo de generación de vídeo subyacente, se queda en torno a 1344 x 768 en una GPU de 24 GB, y SyncTile amplía ese techo hasta 3840 x 2160 en el mismo hardware.

La técnica central es una adaptación de MultiDiffusion (Bar-Tal et al., ICML 2023) al latente audio-vídeo de MiniMax H3: se agranda el latente del clip con el upscaler nativo del modelo y, después de cada paso de muestreo, se fusionan en el espacio latente teselas solapadas, de modo que todas convergen antes del siguiente paso y se evita el efecto de costura. El resultado se decodifica en una sola pasada.

El proyecto se distribuye bajo licencia MIT para el código, con la advertencia explícita de que dicha licencia no cubre los pesos de MiniMax H3, cuyos términos deben consultarse por región y caso de uso. Está etiquetado para inglés y orientado a flujos de trabajo locales en ComfyUI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal propio; pipeline de refinamiento por teselas (MultiDiffusion) sobre el latente de MiniMax H3 |
| Parámetros totales | No disponible (no se publican pesos; se usan los de MiniMax H3 aportados por el usuario) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible (no aplica; el límite práctico documentado son clips de 5 segundos en horizontal) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (etiqueta `en` en el repositorio) |
| Licencia | MIT para el código; los pesos de MiniMax H3 se rigen por su propia licencia |
| Formato de pesos | No disponible (el repositorio no contiene pesos; el código es Python y el workflow es JSON de ComfyUI) |

## Arquitectura y entrenamiento

SyncTile no entrena ningún modelo. Es una capa de inferencia que opera sobre el espacio latente audio-vídeo de MiniMax H3. El procedimiento consta de tres fases: primero, el upscaler latente de MiniMax H3 amplía el latente del clip original; segundo, un conjunto de teselas solapadas refina ese latente y, tras cada paso de muestreo, las teselas se mezclan en el espacio latente para que coincidan antes del paso siguiente; tercero, se realiza una única decodificación que produce el vídeo final. Esta fusión inter-paso es la aportación heredada de MultiDiffusion (Bar-Tal, Yariv, Lipman y Dekel, ICML 2023), aplicada aquí por primera vez, según el autor, al latente audio-vídeo de MiniMax H3.

El proyecto incluye tres componentes: `SyncTileRefine`, un nodo de ComfyUI con workflow listo para usar que recibe un vídeo y devuelve la misma pieza a 1080p, 2K o 4K; SyncTile Studio, una pipeline que genera un vídeo completo a partir de un fichero JSON de escena (planos, personas, imágenes de referencia, de 720 a 4K) con una pasada de ojos, una pasada de cara y movimiento y una pasada final de RTX Video Super Resolution para 4K horizontal; y `synctile_h3.py`, el script original con las mediciones de velocidad y calidad. No se documentan datos de entrenamiento, número de tokens ni técnicas de alineación como RLHF o DPO, porque no hay entrenamiento implicado.

## Capacidades

- Escalado de vídeo generado por MiniMax H3 a 1080p (1920 x 1088), 2K (2560 x 1440) y 4K (3840 x 2160) sin costuras visibles entre teselas.
- Refinamiento por teselas solapadas con fusión en espacio latente en cada paso de muestreo.
- Integración como nodo nativo de ComfyUI (`SyncTileRefine`) con workflow JSON incluido.
- Generación de vídeo completo a partir de un fichero JSON de escena mediante SyncTile Studio, incluyendo gestión de planos, personas e imágenes de referencia.
- Pasadas especializadas de posprocesado: pasada de ojos a fotograma completo, pasada de cara y movimiento, y pasada de RTX Video Super Resolution para 4K horizontal.
- Procesamiento de clips de 5 segundos en horizontal (único caso documentado y probado por el autor).
- Soporte de un único idioma declarado: inglés.

## Casos de uso

- Escalado de clips generados con MiniMax H3 en local: un estudio con una RTX 4090 puede tomar una generación de aproximadamente 1344 x 768 y llevarla a 4K en unos 4,5 minutos, sin necesidad de renderizar de nuevo a resolución nativa ni de contratar cómputo en la nube.
- Producción de material para redes y publicidad en 1080p o 2K: con 4 teselas y unos 2 minutos por clip de 5 segundos, encaja en iteraciones rápidas de agencias que necesitan varias versiones de un mismo plano.
- Creación de vídeo narrativo a partir de guion estructurado: SyncTile Studio consume un JSON de escena con planos, personas e imágenes de referencia y produce el vídeo completo de 720 a 4K, útil para prototipos de cortometrajes o storyboards animados.
- Restauración o mejora de material de archivo generado previamente: la pasada de ojos a fotograma completo y la pasada de cara y movimiento permiten recuperar detalle facial en primeros planos que el upscaling latente por sí solo dejaría borroso.
- Integración en pipelines de ComfyUI existentes: al ser un nodo que se arrastra como workflow JSON, se puede encadenar con otros nodos de generación, edición o posprocesado sin reescribir la infraestructura.
- Investigación sobre difusión por teselas: el código y las mediciones de velocidad publicadas sirven como base reproducible para experimentar con MultiDiffusion aplicado a latentes audio-vídeo, un terreno poco explorado según el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor sí publica mediciones de tiempo de ejecución en una única máquina Windows con una RTX 4090:

| Resolución | Dimensiones | Teselas | Tiempo (clip de 5 s) |
|---|---|---|---|
| 1080p | 1920 x 1088 | 4 | ~2 minutos |
| 2K | 2560 x 1440 | 4 | ~2 minutos |
| 4K | 3840 x 2160 | 9 | ~4,5 minutos |

## Requisitos de hardware

- VRAM estimada: no se publica una cifra exacta; el autor indica que MiniMax H3 se queda en torno a 1344 x 768 en una tarjeta de 24 GB y que SyncTile alcanza 4K en esa misma tarjeta.
- GPU recomendada y única probada: NVIDIA RTX 4090 (24 GB).
- Cabe en GPU de consumo: sí, al menos en RTX 4090 según la validación del autor; no hay datos para otras tarjetas de consumo.
- Opciones de despliegue: ComfyUI (nodo `SyncTileRefine` y workflow `workflow_synctile_upscale.json`); SyncTile Studio como pipeline independiente; el script `synctile_h3.py` para uso directo.
- Latencia y throughput: aproximadamente 2 minutos por clip de 5 segundos a 1080p y 2K, y 4,5 minutos a 4K, con el workflow probado en RTX 4090.
- Requisito adicional: el usuario debe aportar sus propios pesos de MiniMax H3; el repositorio no los incluye.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de escalado de vídeo por teselas ni datos de rendimiento frente a alternativas como upscalers dedicados o pipelines de difusión por regiones.

## Limitaciones y advertencias

- Validación muy limitada: el autor solo ha probado el sistema en una máquina Windows con una RTX 4090 y con clips horizontales de 5 segundos; el comportamiento en otros tamaños, relaciones de aspecto o duraciones no está documentado.
- SyncTile Studio se presenta como "research release" y el propio autor remite a la sección "Limits" de `STUDIO.md` en GitHub antes de usarlo en producción.
- El repositorio de Hugging Face no contiene pesos; sin los checkpoints de MiniMax H3 el nodo no funciona, y su obtención y licencia quedan fuera del alcance del proyecto.
- La licencia MIT cubre únicamente el código; los términos de MiniMax H3 pueden restringir el uso comercial según la región y el caso de uso, y deben verificarse por separado.
- Idioma declarado únicamente inglés, lo que limita prompts y documentación en otros idiomas.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de calidad objetivas; la calidad depende enteramente del modelo base MiniMax H3 y del prompt de descripción del vídeo.
- Riesgo de artefactos en las uniones de teselas fuera de las condiciones probadas, dado que la fusión latente está calibrada para 4 y 9 teselas en resoluciones concretas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/alaintural/synctile-h3
- Código, workflow y vídeos de ejemplo en GitHub: https://github.com/alaintural/synctile-h3
- Vídeo de ejemplo 4K con pasada RTX: https://github.com/alaintural/synctile-h3/releases/download/v0.2.0/pickle-jar-4k-rtx.mp4
- Vídeo de ejemplo 4K sin pasada RTX: https://github.com/alaintural/synctile-h3/releases/download/v0.2.0/pickle-jar-4k.mp4
- Vídeo de ejemplo 1080p: https://github.com/alaintural/synctile-h3/releases/download/v0.2.0/pickle-jar-1080.mp4
- Vídeo de ejemplo 720p, toma única de 30 segundos: https://github.com/alaintural/synctile-h3/releases/download/v0.2.0/coffee-single-take-720.mp4
- Referencia del paper MultiDiffusion (Bar-Tal, Yariv, Lipman, Dekel, ICML 2023): no disponible como enlace en la información proporcionada
- Cita académica (Zenodo): https://doi.org/10.5281/zenodo.23196934
- Perfil del autor: https://github.com/alaintural
- Pixedi AI Lab: https://pixedi.com/lab
