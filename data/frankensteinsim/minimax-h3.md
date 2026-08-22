# FrankensteinSim/MiniMax-H3

## Resumen

MiniMax H3 es un sistema generativo omni-modal desarrollado por MiniMax AI, publicado en abierto a través de Hugging Face y disponible en el repositorio de referencia MiniMaxAI/MiniMax-H3. El repositorio FrankensteinSim/MiniMax-H3 es un mirror del modelo original que incluye los pesos completos en formato safetensors (354 GB). El modelo resuelve el problema de la generación de video con audio nativo sincronizado, aceptando entradas multimodales compuestas por texto, imágenes, video y audio, y produciendo clips de hasta 15 segundos a resolución 2K con sonido estéreo de 32 kHz.

El sistema se compone de tres módulos integrados: H3-Context-IR, que interpreta y refina las instrucciones multimodales de entrada; H3-Base, que genera el video y audio a 768p; y H3-Regenerate-2K, que re-genera el resultado a 2K usando el contexto original. Soporta dos variantes principales de entrada: modo first-and-last-frame (FL2VA) para generación a partir de cero, una o dos imágenes, y modo omni-reference (Ref2VA) para entradas mixtas de hasta 12 archivos entre imágenes, clips de video y clips de audio.

La relevancia actual del modelo radica en su enfoque de sistema unificado para tareas de generación audiovisual, cubriendo desde text-to-video hasta video-to-video con referencia multimodal, lo que lo posiciona como una alternativa abierta a sistemas propietarios como Sora o Kling AI. Está publicado con licencia comunitaria específica y cuenta con soporte para 11 idiomas de diálogo, incluyendo español.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sistema omni-modal con módulos Context-IR, Base y Regenerate-2K) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | multimodal; hasta 9 imágenes, 3 clips de video (2-15 s), 3 clips de audio, max 12 archivos en modo omni-reference |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Árabe, chino, inglés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español (11 idiomas con soporte estable; otros con soporte parcial) |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se han publicado detalles específicos sobre la arquitectura interna (número de parámetros, tipo de backbone, uso de atención, etc.) ni sobre el proceso de entrenamiento (composición del dataset, número de tokens, técnicas de alineación como RLHF o DPO) en la información disponible. Lo que sí se conoce es la arquitectura de sistema de tres módulos: H3-Context-IR actúa como un módulo de comprensión y refinamiento de instrucciones multimodales, convirtiendo la entrada compleja en una representación intermedia; H3-Base es el generador principal de video y audio a 768p; y H3-Regenerate-2K realiza un segundo paso de generación a 2K aprovechando tanto la salida de 768p como el contexto original. Esta diseño orientado a la generalización de tareas permite que el modelo ya posea capacidades de comprensión y generación multimodal en la etapa de pre-entrenamiento, sin necesidad de ajuste fino específico por tarea.

## Capacidades

- Generación de video a partir de texto (text-to-video), con duración de 4 a 15 segundos y resoluciones variables (el lado menor por defecto a 768 píxeles).
- Generación de video a partir de una imagen (first-frame-to-video o last-frame-to-video).
- Generación de video a partir de dos imágenes (first-and-last-frame-to-video).
- Generación de video con referencia omni-modal: hasta 9 imágenes de referencia, hasta 3 clips de video (cada uno de 2 a 15 segundos), hasta 3 clips de audio, con un máximo de 12 archivos en total.
- Generación de audio nativo sincronizado con el video: salida de audio estéreo a 32 kHz.
- Comprensión y seguimiento de instrucciones multimodales complejas, gracias al módulo H3-Context-IR que refina las entradas.
- Soporte de diálogo en 11 idiomas estables: árabe, chino, coreano, español, francés, inglés, italiano, japonés, portugués y ruso.
- Variación de aspect ratio amplio: 21:9, 16:9, 4:3, 1:1, 3:4, 9:16, entre otros.
- Regeneración a 2K mediante el módulo H3-Regenerate-2K para mayor fidelidad de detalles.
- Capacidad de entrada de audio como referencia para generar video sincronizado con audio de entrada (audio-to-video).

## Casos de uso

- Creación de contenido audiovisual para redes sociales: el modelo permite generar clips de 4 a 15 segundos con audio nativo, ideal para producir vídeos cortos para TikTok, Instagram Reels o YouTube Shorts directamente desde un prompt de texto, sin necesidad de edición posterior de audio.
- Doblaje y localización de video: gracias al soporte de 11 idiomas y la generación de audio sincronizado, se puede tomar un clip de video de entrada y generar una nueva versión con voz y audio en otro idioma, manteniendo la sincronía labial y los efectos sonoros.
- Prototipado rápido de escenas en producción audiovisual: los equipos de diseño pueden generar animáticas o previas de escenas a partir de storyboards (imágenes) y guiones (texto), evaluando encuadres, movimientos y sonido antes de la producción real.
- Generación de video con referencia de personaje: con el modo omni-reference, se pueden proporcionar hasta 9 imágenes de un personaje o objeto para que el modelo mantenga la consistencia visual en el video generado, útil para crear contenido de marca o personajes recurrentes.
- Creación de material educativo interactivo: generar explicaciones visuales con audio narrado a partir de texto o imágenes, para cursos online, tutoriales técnicos o demostraciones de productos, con la posibilidad de incluir clips de video de referencia.
- Postproducción y mejora de resolución: el módulo H3-Regenerate-2K permite tomar un video generado a 768p y regenerarlo a 2K, mejorando los detalles y la fidelidad, lo que es útil para entregables en alta resolución en proyectos de video profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La búsqueda web menciona una comparativa entre MiniMax H3 y otros modelos como Seedance 2.5, Wan 2.1, Kling AI, Sora y CogVideoX, pero no se incluyen los datos numéricos concretos en los resultados de búsqueda. Por tanto, no se puede presentar una tabla comparativa con datos verificables.

## Requisitos de hardware

- El tamaño del repositorio es de 354 GB, lo que indica que los pesos completos requieren un almacenamiento significativo y un sistema con VRAM elevada para inferencia.
- No se especifica la VRAM mínima, pero dado el tamaño y la naturaleza multimodal (video + audio), se espera que la inferencia completa requiera al menos una GPU de clase data center (A100, H100, o equivalente) con 80 GB de VRAM para la variante completa a 2K.
- No se indica si cabe en GPU de consumo como RTX 4090 (24 GB VRAM); probablemente no sea viable con los pesos completos sin cuantización, y no se han publicado cuantizaciones.
- Opciones de despliegue: se menciona compatibilidad con Diffusers y la librería `minimax-h3`. El repositorio oficial incluye guías de despliegue en GitHub y tutoriales en design.minimax.io. No se mencionan explícitamente vLLM, llama.cpp u Ollama, que son más comunes para modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos concretos de benchmarks comparativos en la información proporcionada. La búsqueda web indica que existe una comparación con Seedance 2.5, Wan 2.1, Kling AI, Sora y CogVideoX, pero sin cifras específicas. Los parámetros, contexto y rendimiento de estos modelos no se detallan en los resultados de búsqueda. Por tanto, no se puede presentar una comparativa numérica fiable.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia `minimax-h3-community-license-agreement` no es una licencia open source estándar (por ejemplo, Apache 2.0 o MIT). Es necesario revisar los términos para uso comercial, especialmente si se va a integrar en productos propietarios.
- Alucinaciones visuales y de audio: como cualquier modelo generativo, puede producir inconsistencias en los detalles del video, como texto en imágenes, movimiento de objetos, o sonido desincronizado con la acción.
- Limitación de duración y resolución: el modelo está restringido a clips de 4 a 15 segundos y a resoluciones máximas de 2K (con el módulo de regeneración). No admite duraciones más largas sin post-procesamiento externo.
- Dependencia del módulo de contexto: el módulo H3-Context-IR es crítico para la calidad del resultado. Si no se usa correctamente o se intenta saltar, la calidad del video puede degradarse significativamente.
- Restricciones de uso: no se especifica si el modelo puede usarse para generación de contenido con personas reales o contenido sensible; es probable que haya restricciones de uso en la licencia.
- Requisitos de hardware muy elevados: los 354 GB de pesos y la inferencia multimodal requieren infraestructura de GPU de alto rendimiento, lo que limita su uso en entornos de desarrollo o en equipos personales.

## Enlaces

- Repositorio Hugging Face (oficial): https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio Hugging Face (mirror, el que se describe en esta ficha): https://huggingface.co/FrankensteinSim/MiniMax-H3
- GitHub oficial: https://github.com/MiniMax-AI/MiniMax-H3
- Página web de MiniMax: https://www.minimax.io
- WebApp de Hailuo AI: https://hailuoai.video
- Documentación de API: https://platform.minimax.io/docs/guides/text-generation
- ModelScope (organización MiniMax): https://modelscope.cn/organization/minimax
- Tutoriales y despliegue (design.minimax.io): https://design.minimax.io/h3
- Repositorio de workflows ComfyUI: https://github.com/ai-models-lab/minimax-h3
- Página de descarga de archivos del modelo: https://minimaxh3.run/minimax-h3-model-files-downloads
