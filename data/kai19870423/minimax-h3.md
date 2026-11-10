# kai19870423/MiniMax-H3

## Resumen

MiniMax H3 es un sistema generativo omni-modal desarrollado por MiniMax (la empresa detrás de Hailuo AI) que unifica la comprensión de contextos multimodales compuestos por texto, imágenes, vídeo y audio, y genera vídeo con audio estéreo nativo. El sistema produce clips de 4 a 15 segundos a 24 FPS, con una resolución por defecto de 768 píxeles en el lado corto y capacidad de alcanzar 2K mediante el módulo H3-Regenerate-2K. El audio se emite a 32 kHz en estéreo y el modelo soporta diálogos estables en 11 idiomas.

A diferencia de los modelos de difusión de vídeo convencionales, H3 se plantea como un sistema de tres módulos: H3-Context-IR (interpretación y refinamiento de la instrucción multimodal), H3-Base (generación de audio y vídeo a 768p) y H3-Regenerate-2K (reascentado a 2K reutilizando el contexto original). Esta arquitectura orientada a la generalización de tareas permite al modelo manejar instrucciones multimodales complejas desde la fase de preentrenamiento.

El repositorio publicado en Hugging Face bajo el identificador `kai19870423/MiniMax-H3` ocupa 353,9 GB y emplea la librería `minimax-h3` junto con `diffusers`. La licencia es la MiniMax-H3 Community License Agreement, lo que implica condiciones específicas para uso comercial que conviene revisar antes de desplegar el modelo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema omni-modal de generación de vídeo y audio (módulos H3-Context-IR, H3-Base y H3-Regenerate-2K); detalles internos de la red no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la entrada se define por límites multimodales: hasta 9 imágenes, 3 clips de vídeo y 3 clips de audio, máximo 12 archivos mixtos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Sueco, inglés, francés, alemán, español y neerlandés (etiquetas del repo); diálogo estable en árabe, chino, inglés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español |
| Licencia | MiniMax-H3 Community License Agreement |
| Formato de pesos | safetensors (repo de 353,9 GB) |

## Arquitectura y entrenamiento

MiniMax H3 se describe como un sistema generativo omni-modal de propósito general, diseñado en torno a la generalización de tareas. La información disponible no detalla la arquitectura interna de la red (si es un transformer de difusión, un modelo híbrido o una combinación de módulos), pero sí especifica que el sistema completo se compone de tres piezas: H3-Context-IR, que interpreta y refina la instrucción multimodal convirtiéndola en una Representación Intermedia de Contexto; H3-Base, que genera audio y vídeo sincronizados a 768p; y H3-Regenerate-2K, que reinyecta el resultado de 768p junto con el contexto original para regenerar la salida a 2K.

El modelo soporta dos variantes de entrada: H3-Base-FL2VA, orientada a modos de primer y último fotograma (con cero, una o dos imágenes de entrada, lo que cubre text-to-video, first/last-frame-to-video y first-and-last-frame-to-video), y H3-Base-Ref2VA, en modo de referencia omni-modal, que acepta hasta 9 imágenes, 3 clips de vídeo de 2 a 15 segundos cada uno y 3 clips de audio de 2 a 15 segundos, con un máximo de 12 archivos combinados. No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto, imagen, vídeo, audio o combinaciones multimodales de todos ellos.
- Generación de audio nativo sincronizado con el vídeo, en estéreo a 32 kHz.
- Resolución de salida configurable: 768p por defecto y 2K mediante H3-Regenerate-2K.
- Duración de salida de 4 a 15 segundos a 24 FPS.
- Relaciones de aspecto flexibles: 21:9, 16:9, 4:3, 1:1, 3:4, 9:16 y otras.
- Modos de entrada: text-to-video, image-to-video, first-and-last-frame-to-video, video-to-video, text-to-audio-video, image-to-audio-video, video-to-audio-video, audio-to-audio-video y reference-to-audio-video.
- Comprensión de contextos multimodales complejos gracias a H3-Context-IR, que refina la instrucción antes de la generación.
- Diálogo con soporte estable en 11 idiomas (árabe, chino, inglés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español), con otros idiomas soportados en grado variable.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso basado en agentes; el modelo es generativo audiovisual, no un LLM de propósito general.

## Casos de uso

- Producción de vídeo publicitario de formato corto: el modelo genera clips de 4 a 15 segundos con audio sincronizado y relaciones de aspecto adaptadas a cada plataforma (9:16 para móvil, 16:9 para web), lo que permite iterar creatividades sin rodaje.
- Doblaje y localización de vídeo: con el modo video-to-audio-video y soporte de diálogo en 11 idiomas, se puede regenerar la pista de audio de un clip existente manteniendo la sincronización labial y el contenido visual.
- Creación de contenido para redes sociales a partir de una sola imagen: el modo first-frame-to-video permite animar un fotograma estático con audio generado, útil para estudios pequeños sin pipeline de animación.
- Prototipado rápido en preproducción cinematográfica: el modo first-and-last-frame-to-video permite validar transiciones entre dos fotogramas clave antes de invertir en renderizado final.
- Generación de vídeo con referencias de estilo: el modo Ref2VA acepta hasta 9 imágenes y 3 clips de referencia, lo que sirve para mantener coherencia visual de personaje o producto en una serie de clips.
- Síntesis de audio y vídeo para formación corporativa: combinando text-to-audio-video se pueden producir píldoras formativas breves con narración en varios idiomas sin equipo de grabación.
- Restauración y reescalado de material existente: H3-Regenerate-2K reinyecta el contexto original para producir salidas a 2K con mayor fidelidad, aplicable a material de archivo de baja resolución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio de pesos ocupa 353,9 GB, por lo que el almacenamiento necesario para el checkpoint completo en safetensors es de al menos ese tamaño.
- No se dispone de datos oficiales sobre VRAM necesaria para inferencia; el tamaño del repo sugiere que la ejecución en precisión nativa requiere múltiples GPUs de gama alta (A100 80 GB, H100 80 GB) o técnicas de offloading y cuantización no documentadas.
- No se confirma que el modelo quepa en GPUs de consumo (RTX 4090, 3090, etc.) en su configuración completa; se requiere verificación empírica.
- Opciones de despliegue: la librería declarada es `minimax-h3` con integración en `diffusers`; no se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un modelo generativo de vídeo.
- Latencia y throughput estimados: no disponibles.
- Existe una API online (platform.minimax.io y platform.minimaxi.com) y aplicaciones web y de escritorio (hailuoai.video, hailuoai.com, hub.minimax.io, hub.minimaxi.com) como alternativas al despliegue local.

## Comparativa con modelos similares

| Modelo | Tipo | Duración de salida | Resolución | Audio nativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniMax H3 | Omni-modal vídeo+audio | 4-15 s | 768p / 2K | Sí, estéreo 32 kHz | MiniMax-H3 Community License | Pesos en HF, API y apps |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos comparables de otros modelos de generación de vídeo con audio (parámetros, contexto, benchmarks) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La licencia MiniMax-H3 Community License Agreement no es una licencia open source estándar; es imprescindible revisar sus términos antes de cualquier uso comercial, especialmente en lo relativo a atribución, restricciones de uso y redistribución.
- El sistema depende críticamente de H3-Context-IR: la propia documentación advierte que su inclusión en el pipeline es determinante para la calidad de la salida. Omitirlo degrada los resultados de forma significativa.
- La duración máxima de salida es de 15 segundos, lo que limita su uso para piezas de mayor metraje sin concatenación manual.
- El repositorio es una réplica publicada por un usuario (`kai19870423`), no el repositorio oficial de MiniMax; conviene contrastar la integridad de los pesos con el repo oficial `MiniMaxAI/MiniMax-H3`.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad del modelo en la información disponible.
- El soporte multilingüe es desigual: 11 idiomas con soporte estable para diálogo y otros con soporte variable; las etiquetas del repo solo listan seis idiomas, lo que puede reflejar un subconjunto de evaluación.
- El tamaño del checkpoint (353,9 GB) impone requisitos de almacenamiento y ancho de banda considerables para cualquier despliegue local.
- No hay información sobre latencia, throughput ni consumo energético, factores críticos para planificar producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kai19870423/MiniMax-H3
- Repositorio oficial en Hugging Face: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- GitHub oficial: https://github.com/MiniMax-AI/MiniMax-H3
- Skills para escritura de prompts: https://github.com/MiniMax-AI/MiniMax-H3/tree/main/skills
- API global: https://platform.minimax.io/docs/api-reference/video-generation-v2-create
- API China: https://platform.minimaxi.com/docs/api-reference/video-generation-v2-create
- Documentación de generación de texto: https://platform.minimax.io/docs/guides/text-generation
- WebApp global: https://hailuoai.video/tools/minimax-h3
- WebApp China: https://hailuoai.com/
- Desktop global: https://hub.minimax.io/
- Desktop China: https://hub.minimaxi.com/
- Web oficial de MiniMax: https://www.minimax.io
- ModelScope: https://modelscope.cn/organization/minimax
- Discord: https://discord.com/invite/dbMxutw7tP
- Contacto WeChat: https://platform.minimaxi.com/docs/faq/contact-us
