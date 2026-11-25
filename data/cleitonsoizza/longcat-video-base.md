# cleitonsoizza/LongCat-Video-base

## Resumen

LongCat-Video es un modelo fundacional de generación de vídeo de 13.600 millones de parámetros desarrollado por Meituan LongCat. Unifica en una sola arquitectura tres tareas —texto a vídeo, imagen a vídeo y continuación de vídeo— y está específicamente optimizado para la generación de vídeos largos de varios minutos sin deriva de color ni degradación de calidad, lo que lo posiciona como un primer paso hacia los denominados "world models".

El modelo se distribuye bajo licencia MIT y se publica en formato diffusers/safetensors con un repositorio de 23,3 GB. Emplea una estrategia de generación de grueso a fino (coarse-to-fine) en los ejes temporal y espacial, junto con Block Sparse Attention para mantener la eficiencia a altas resoluciones, y produce vídeo a 720p y 30 fps en cuestión de minutos.

Su relevancia actual radica en que combina tres tareas de generación de vídeo en un único modelo nativo, admite generación interactiva y de vídeo largo, y ha sido afinado con RLHF multi-recompensa mediante GRPO, lo que según el autor lo sitúa a la altura de los principales modelos open source y soluciones comerciales de generación de vídeo. Esta ficha documenta la copia alojada por el usuario `cleitonsoizza`, no el repositorio oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para generación de vídeo (detalles de la red no disponibles) |
| Parametros totales | 13,6 mil millones (13.6B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica como ventana de tokens; genera vídeos de varios minutos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

LongCat-Video es un modelo de generación de vídeo de 13.6B parámetros construido sobre un framework de difusión (librería diffusers). Su rasgo arquitectónico principal es la unificación nativa de las tareas de texto a vídeo, imagen a vídeo y continuación de vídeo en un único modelo, lo que permite abordar las tres sin variantes separadas. La generación se realiza con una estrategia coarse-to-fine sobre los ejes temporal y espacial, complementada con Block Sparse Attention para mejorar la eficiencia a resoluciones altas. El modelo está preentrenado de forma nativa en la tarea de continuación de vídeo, lo que habilita la generación de vídeos de varios minutos sin deriva de color ni pérdida de calidad.

En cuanto al entrenamiento, el autor indica que el modelo ha sido afinado con RLHF multi-recompensa mediante Group Relative Policy Optimization (GRPO), lo que según sus evaluaciones internas y públicas le permite alcanzar un rendimiento comparable a los principales modelos open source de generación de vídeo y a soluciones comerciales recientes. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles de la arquitectura interna de la red (tipo de backbone, VAE, text encoder). El soporte de FlashAttention-2 está habilitado por defecto, con opción de configurar FlashAttention-3 o xformers.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de una imagen (image-to-video).
- Continuación de vídeo (video-continuation), preentrenada de forma nativa.
- Generación de vídeo largo de varios minutos sin deriva de color ni degradación de calidad.
- Generación de vídeo a 720p y 30 fps en cuestión de minutos mediante estrategia coarse-to-fine.
- Generación de vídeo interactiva (demo interactiva incluida en el repositorio oficial).
- Soporte de inferencia multi-GPU mediante context parallelism.
- Soporte de compilación del modelo (`--enable_compile`) para acelerar la inferencia.
- Capacidades multilingües limitadas a inglés (en) y chino (zh) en las indicaciones de texto.
- No se documentan en la información disponible capacidades de tool calling, agentes ni audio.

## Casos de uso

- Generación de clips publicitarios a partir de texto: el modelo produce vídeo a 720p y 30 fps en minutos, adecuado para prototipado rápido de anuncios y storyboards antes de la producción final.
- Animación de imágenes fijas para redes sociales: mediante image-to-video se puede dar movimiento a fotografías o ilustraciones de producto, aprovechando la coherencia temporal del modelo.
- Creación de vídeos largos de formato documental o narrativo: la continuación de vídeo nativa permite generar secuencias de varios minutos sin cortes visibles ni deriva de color, útil para contenido de fondo o escenas extensas.
- Extensiones de metraje existente: la tarea de video-continuation permite alargar clips ya grabados manteniendo el estilo y la paleta de color, útil en posproducción y VFX.
- Generación interactiva para prototipado creativo: la demo interactiva del repositorio oficial permite iterar sobre prompts y variaciones en tiempo real durante sesiones de diseño.
- Investigación en world models y generación de vídeo: al ser un modelo fundacional con pesos abiertos y licencia MIT, sirve como base para experimentación académica en generación de vídeo y dinámicas temporales.
- Despliegue en pipelines de creación de contenido automatizado: la inferencia multi-GPU con context parallelism y la compilación del modelo permiten integrarlo en flujos de producción por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente afirma que las evaluaciones internas y públicas del autor muestran un rendimiento comparable a los principales modelos open source de generación de vídeo y a soluciones comerciales recientes, sin aportar cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 13,6B parámetros en precisión de 16 bits, los pesos ocuparían aproximadamente 27 GB, por lo que se requiere al menos una GPU con 32 GB o más para inferencia en FP16/BF16; el repositorio de pesos ocupa 23,3 GB.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por el tamaño del modelo, se orienta a GPUs de datacenter tipo A100 (40/80 GB) o H100.
- ¿Cabe en GPU de consumo? No confirmado. Una RTX 4090 (24 GB) probablemente no sea suficiente en FP16 sin cuantización u offloading, y no se documentan opciones de cuantización.
- Opciones de despliegue: scripts oficiales con `torchrun` (text-to-video, image-to-video, video-continuation, long-video e interactive), inferencia multi-GPU con `--context_parallel_size`, compilación con `--enable_compile` y una interfaz Streamlit (`run_streamlit.py`). Soporta FlashAttention-2 (por defecto), FlashAttention-3 o xformers. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: se indica que genera vídeo a 720p y 30 fps "en cuestión de minutos", sin cifras concretas de latencia ni throughput por GPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de parámetros, contexto, rendimiento ni licencia de modelos alternativos de generación de vídeo que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como modelo generativo entrenado con datos a gran escala, es probable que herede sesgos de sus datos de entrenamiento.
- Riesgo de alucinación: no evaluado en la información disponible; en generación de vídeo se traduce en posibles inconsistencias físicas, temporales o de contenido respecto al prompt.
- Limitaciones de idioma: las indicaciones de texto solo se documentan en inglés y chino.
- Restricciones de licencia: licencia MIT, que permite uso comercial con atribución; conviene revisar el fichero LICENSE del repositorio oficial para los términos exactos.
- Esta ficha corresponde a una copia alojada por el usuario `cleitonsoizza` (0 descargas, 0 likes), no al repositorio oficial `meituan-longcat/LongCat-Video`; para producción se recomienda usar la versión oficial.
- No se documentan opciones de cuantización ni requisitos mínimos de VRAM, lo que dificulta el despliegue en hardware de consumo.
- No se especifican detalles de la arquitectura interna (backbone, VAE, text encoder), lo que limita la evaluación técnica independiente.
- Los requisitos de hardware y las latencias reales no están cuantificados; el despliegue en producción requiere validación propia.

## Enlaces

- Copia en Hugging Face: https://huggingface.co/cleitonsoizza/LongCat-Video-base
- Repositorio oficial en Hugging Face: https://huggingface.co/meituan-longcat/LongCat-Video
- Página del proyecto: https://meituan-longcat.github.io/LongCat-Video/
- Paper (arXiv 2510.22200): https://huggingface.co/papers/2510.22200
- Repositorio GitHub: https://github.com/meituan-longcat/LongCat-Video
- Licencia: https://huggingface.co/meituan-longcat/LongCat-Video/blob/main/LICENSE
- Twitter/X de LongCat: https://x.com/Meituan_LongCat
