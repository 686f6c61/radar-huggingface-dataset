# Mk1227/MiniMax-H3

## Resumen

MiniMax H3 es un sistema generativo omni-modal de propósito general desarrollado por MiniMax. A diferencia de los modelos de generación de vídeo tradicionales, H3 unifica la comprensión de contextos multimodales compuestos por texto, imágenes, vídeo y audio, y es capaz de generar vídeo con audio estéreo nativo sincronizado, resoluciones de hasta 2K y duraciones de hasta 15 segundos. Su diseño orientado a la generalización de tareas le permite seguir instrucciones multimodales complejas ya desde la fase de pre-entrenamiento.

El sistema completo se compone de tres módulos: H3-Context-IR, un sistema dedicado a interpretar y refinar instrucciones multimodales complejas convirtiéndolas en una representación intermedia (Context Intermediate Representation); H3-Base, que genera audio y vídeo a resolución 768p a partir de esa representación; y H3-Regenerate-2K, que regenera el resultado a 2K aprovechando tanto la capacidad generativa del modelo como la información del contexto original.

El repositorio está publicado en HuggingFace bajo la licencia comunitaria de MiniMax (minimax-h3-community-license-agreement), con un tamaño de repositorio de 353,9 GB y formato de pesos safetensors, compatible con la librería diffusers. Se puede usar también vía API en plataforma (global y China), mediante la webapp Hailuo AI o mediante aplicaciones de escritorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sistema omni-modal generativo en tres módulos: H3-Context-IR, H3-Base, H3-Regenerate-2K) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (hasta 12 archivos de referencia en modo omni-reference) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 11 idiomas con soporte estable: árabe, chino, inglés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español; otros idiomas con soporte variable |
| Licencia | minimax-h3-community-license-agreement (other) |
| Formato de pesos | safetensors |

Especificaciones de salida y entrada declaradas por el autor:

| Categoria | Especificacion |
|---|---|
| Duracion de salida | 4–15 segundos |
| Relaciones de aspecto | 21:9, 16:9, 4:3, 1:1, 3:4, 9:16 y otras |
| Resolucion de salida | lado corto por defecto 768 px; 2K mediante H3-Regenerate-2K |
| Frecuencia de fotogramas | 24 FPS |
| Audio de salida | 32 kHz estereo |

## Arquitectura y entrenamiento

MiniMax H3 no es un modelo único, sino un sistema modular de tres componentes. H3-Context-IR actúa como capa de comprensión profunda de las instrucciones multimodales de entrada y las transforma en una representación intermedia que el modelo generativo puede procesar de forma eficiente; MiniMax recomienda encarecidamente incorporarlo al pipeline de generación o replicar su función siguiendo la guía de prompting oficial. H3-Base es el módulo generativo que produce vídeo con audio sincronizado a 768p, y H3-Regenerate-2K realiza un segundo paso de regeneración que eleva la salida a 2K reintroduciendo el resultado y el contexto original en el sistema.

El modelo posee capacidades de comprensión y generación multimodal amplias ya desde el pre-entrenamiento, según la model card. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de ajuste como RLHF o DPO. No se han detallado tampoco las innovaciones técnicas internas (tipo de transformer, mecanismos de atención o técnicas de decodificación) más allá de la arquitectura modular descrita.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), de imágenes (image-to-video) y de combinaciones de texto e imagen (image-text-to-video).
- Generación de vídeo con audio estéreo nativo sincronizado (32 kHz), incluyendo modos text-to-audio-video, image-to-audio-video, video-to-audio-video y audio-to-audio-video.
- Modo first-and-last-frame (H3-Base-FL2VA): generación a partir de cero, una o dos imágenes (primer fotograma, último fotograma o ambos).
- Modo omni-reference (H3-Base-Ref2VA): acepta hasta 9 imágenes, hasta 3 clips de vídeo (2–15 s cada uno, total ≤ 15 s), hasta 3 clips de audio (mismas restricciones) y hasta 12 archivos mixtos en total.
- Vídeo a vídeo (video-to-video) y generación con referencias (reference-to-audio-video).
- Resoluciones variables con lado corto de 768 px por defecto y regeneración a 2K.
- Comprensión unificada de contextos multimodales (texto, imagen, vídeo y audio) y seguimiento de instrucciones multimodales complejas.
- Soporte estable de diálogo en 11 idiomas.
- Skills oficiales para mejorar la escritura de prompts, disponibles en el repositorio de GitHub.
- No hay información sobre tool calling, function calling ni capacidades de agente.

## Casos de uso

- Producción de contenido audiovisual para redes sociales: la generación con relaciones de aspecto 9:16, 1:1 o 16:9 y duraciones de 4 a 15 segundos se ajusta directamente a formatos de reels, shorts y posts, con audio sincronizado incluido.
- Publicidad y marketing con referencias de marca: el modo omni-reference permite suministrar hasta 9 imágenes de producto o logotipos para generar vídeos coherentes con la identidad visual de la marca.
- Animación a partir de storyboards: el modo first-and-last-frame permite definir el fotograma inicial y final de una escena y dejar que el modelo genere la transición, útil en previsualización cinematográfica.
- Generación de contenido con locución y sonido: al producir audio estéreo nativo sincronizado, evita un paso posterior de doblaje o diseño sonoro en vídeos explicativos o demos.
- Upscaling de vídeo generado: el módulo H3-Regenerate-2K permite partir de una salida 768p y regenerarla a 2K para entregas de mayor calidad.
- Edición y transformación de vídeo existente: el modo video-to-video permite modificar clips de entrada (2–15 s) manteniendo coherencia temporal.
- Prototipado de efectos y escenas para videojuegos o VFX: la generación con referencias mixtas (imágenes, vídeo y audio) facilita iteraciones rápidas de escenas conceptuales.
- Automatización vía API: la disponibilidad en platform.minimax.io permite integrar la generación en pipelines automatizados de producción de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se ha publicado información sobre VRAM estimada para inferencia local. El tamaño del repositorio es de 353,9 GB, lo que sugiere que la ejecución local requiere hardware de gama alta y almacenamiento y memoria considerables.
- No se han especificado GPU recomendadas ni si el modelo cabe en GPUs de consumo.
- Opciones de despliegue: la librería declarada es minimax-h3 con compatibilidad diffusers (pipeline image-text-to-video); no se menciona soporte para vLLM, llama.cpp, Ollama o TGI. Para la mayoría de usuarios, la vía práctica es la API oficial (platform.minimax.io / platform.minimaxi.com), la webapp Hailuo AI (hailuoai.video / hailuoai.com) o las aplicaciones de escritorio (hub.minimax.io / hub.minimaxi.com).
- No se han publicado cifras de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables publicados para MiniMax H3, por lo que la siguiente comparativa se limita a caracteristicas declaradas:

| Modelo | Modalidad | Duracion maxima | Resolucion maxima | Audio nativo | Licencia |
|---|---|---|---|---|---|
| MiniMax H3 | texto/imagen/vídeo/audio a vídeo+audio | 15 s | 2K | Sí (32 kHz estéreo) | minimax-h3-community-license-agreement |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado alternativas con datos suficientes en la información proporcionada para una comparativa rigurosa de parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- La licencia es "other" (minimax-h3-community-license-agreement): antes de cualquier uso comercial debe revisarse el texto completo de la licencia, ya que las licencias comunitarias suelen incluir restricciones de uso, límites de ingresos o requisitos de registro.
- Duración de salida limitada a 15 segundos, lo que restringe su uso para contenido largo sin encadenar generaciones.
- El audio de salida está fijado a 32 kHz estéreo y el frame rate a 24 FPS; no hay indicios de configurabilidad de estos parámetros.
- En el modo omni-reference, los clips de vídeo y audio deben durar entre 2 y 15 segundos con un total máximo de 15 segundos, y el número total de archivos mixtos no puede exceder 12.
- La calidad del resultado depende críticamente de H3-Context-IR; el propio MiniMax advierte que omitirlo o no seguir la guía de prompting degrada la salida.
- No hay información sobre sesgos conocidos, riesgo de alucinación ni salvaguardas de contenido generativo.
- El repositorio analizado (Mk1227/MiniMax-H3) es una réplica con 227 descargas; el repositorio oficial es MiniMaxAI/MiniMax-H3, recomendable para garantizar la autenticidad de los pesos.
- No se ha publicado documentación sobre cuantización ni despliegue local, por lo que la inferencia self-hosted puede ser poco práctica.

## Enlaces

- Repositorio analizado: https://huggingface.co/Mk1227/MiniMax-H3
- Repositorio oficial en HuggingFace: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- GitHub: https://github.com/MiniMax-AI/MiniMax-H3
- Skills de prompting: https://github.com/MiniMax-AI/MiniMax-H3/tree/main/skills
- API global: https://platform.minimax.io/docs/api-reference/video-generation-v2-create
- API China: https://platform.minimaxi.com/docs/api-reference/video-generation-v2-create
- WebApp global: https://hailuoai.video/tools/minimax-h3
- WebApp China: https://hailuoai.com/
- Escritorio global: https://hub.minimax.io/
- Escritorio China: https://hub.minimaxi.com/
- ModelScope: https://modelscope.cn/organization/minimax
- Web de MiniMax: https://www.minimax.io
- Discord: https://discord.com/invite/dbMxutw7tP
