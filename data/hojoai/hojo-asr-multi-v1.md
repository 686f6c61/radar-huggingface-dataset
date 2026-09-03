# HojoAI/Hojo-ASR-Multi-V1

## Resumen

Hojo-ASR-Multi-V1 es un modelo de reconocimiento automático del habla (ASR) conversacional multilingüe desarrollado por HojoAI. Está construido sobre el decoder LLM Qwen3-4B-Instruct-2507 y adopta la arquitectura clásica Encoder-Adapter-LLM con una estructura personalizada de fusión acústica multi-frame. El modelo combina características acústicas de grano fino con la capacidad semántica del modelo de lenguaje, lo que le permite manejar escenarios reales complejos como entornos ruidosos, pronunciación informal y corrección oral.

El modelo se ha optimizado mediante entrenamiento modular en varias etapas y aprendizaje por refuerzo, y amplía su capacidad de reconocimiento a múltiples idiomas: alemán, francés, español, portugués, italiano, japonés, árabe, coreano y ruso, según la documentación oficial. La model card en Hugging Face declara soporte para cinco idiomas (de, fr, it, pt, es), aunque el texto del README menciona nueve. El repositorio pesa 12 GB y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y secundario.

La relevancia de este modelo radica en su posición como sistema ASR abierto multilingüe de alto rendimiento. Según el autor, alcanza una tasa media de error de palabra (WER) del 3,54 % en cinco idiomas y se sitúa como el primer modelo abierto en el Open ASR Leaderboard, compitiendo con sistemas propietarios líderes. Su integración con el ecosistema Qwen3 facilita el despliegue en aplicaciones de transcripción y diálogo por voz.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-Adapter-LLM con decoder Qwen3-4B-Instruct-2507 |
| Parametros totales | No disponible (el LLM base tiene 4B; el total incluye encoder y adapter) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente BF16/FP16) |
| Idiomas soportados | de, fr, it, pt, es (según metadata); el README añade ja, ar, ko, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Hojo-ASR-Multi-V1 sigue el esquema Encoder-Adapter-LLM, donde un encoder acústico procesa la señal de audio, un adaptador proyecta las representaciones al espacio del LLM y el decoder Qwen3-4B-Instruct-2507 genera la transcripción. La innovación principal es la estructura de fusión acústica multi-frame, que combina múltiples tramas de características acústicas para capturar información temporal detallada antes de pasarla al modelo de lenguaje. Esta configuración aprovecha tanto la granularidad acústica como la capacidad semántica del LLM para mejorar la precisión en condiciones adversas.

El entrenamiento se realizó en varias etapas modulares, seguidas de aprendizaje por refuerzo. No se han publicado detalles sobre el volumen de datos de entrenamiento ni la composición exacta de los datasets. El modelo se apoya en trabajos open source como Qwen, WenetSpeech-Yue y WenetSpeech-Chuan, lo que sugiere que parte de los datos de preentrenamiento acústico provienen de esos corpus. El proceso de optimización incluye corrección oral y manejo de pronunciación informal, lo que indica un ajuste específico para habla espontánea.

## Capacidades

- Reconocimiento de voz conversacional multilingüe: transcribe audio en alemán, francés, español, portugués e italiano (declarados), y según el README también japonés, árabe, coreano y ruso.
- Robustez ante ruido y pronunciación no estándar: el modelo se ha optimizado para entornos ruidosos, habla informal y corrección oral.
- Fusión acústica multi-frame: procesa características acústicas de alta resolución temporal para mejorar la precisión en fonética compleja.
- Integración con LLM: al usar Qwen3 como decoder, puede aprovechar el conocimiento semántico del modelo de lenguaje para desambiguar homófonos y mejorar la transcripción en contexto.
- Interfaz de inferencia simple: proporciona un paquete Python `hojo-asr` con carga de modelo y transcripción por lotes, aceptando rutas de archivos WAV, archivos SCP o bytes de audio.
- Compatible con pipelines de procesamiento por lotes: el parámetro `batch_size` permite agrupar múltiples audios en una sola pasada.

## Casos de uso

- Transcripción de reuniones y entrevistas multilingües: el modelo puede transcribir audio en varios idiomas europeos con una sola instalación, lo que simplifica el flujo de trabajo en empresas internacionales. Su robustez ante ruido de fondo lo hace adecuado para salas de reuniones sin acondicionamiento acústico.
- Subtitulado automático de vídeo: al aceptar listas de archivos WAV y procesar por lotes, permite generar subtítulos para contenidos en alemán, francés, español, portugués o italiano, reduciendo el coste de subtitulado manual. La integración con LLM ayuda a corregir errores de homófonos en el contexto de la frase.
- Asistentes de voz para atención al cliente: la capacidad de manejar pronunciación informal y corrección oral es útil en centros de llamadas donde los usuarios hablan de forma rápida o con acentos regionales. El modelo puede transcribir interacciones en tiempo real o en diferido para análisis posterior.
- Análisis de llamadas de telemarketing o soporte técnico: con la API de inferencia por lotes, se pueden procesar grandes volúmenes de grabaciones y extraer texto para minería de opiniones o detección de problemas recurrentes. La licencia Apache 2.0 permite integración comercial sin restricciones.
- Creación de corpus de entrenamiento para otros modelos: el modelo puede generar transcripciones de alta calidad que sirvan como datos etiquetados para afinar sistemas de diálogo por voz o modelos de lenguaje específicos de dominio.
- Traducción asistida por voz: combinado con un sistema de traducción automática, el modelo puede transcribir audio en un idioma y pasar el texto a un traductor, habilitando servicios de interpretación automática en tiempo real para conversaciones multilingües.

## Benchmarks y rendimiento

La model card publica resultados de WER (tasa de error de palabra, menor es mejor) en datasets públicos multilingües:

| Dataset | WER (%) |
|---|---|
| Alemán CoVoST | 3,85 |
| Alemán FLEURS | 4,08 |
| Francés CoVoST | 4,53 |
| Francés MLS | 2,95 |
| Francés FLEURS | 3,33 |
| Italiano CoVoST | 2,44 |
| Italiano MLS | 5,35 |
| Italiano FLEURS | 2,30 |
| Español CoVoST | 3,27 |
| Español MLS | 3,31 |
| Español FLEURS | 2,66 |
| Portugués MLS | 4,07 |
| Portugués FLEURS | 3,61 |

El autor afirma en redes sociales un WER medio del 3,54 % en cinco idiomas y su posición como #7 global y #1 entre modelos ASR multilingües abiertos en el Open ASR Leaderboard. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3-4B ocupa aproximadamente 8 GB en FP16. Con el encoder y el adaptador, el uso total podría superar los 10 GB. En cuantización INT8, podría reducirse a unos 5-6 GB, aunque no se ofrecen pesos cuantizados oficiales.
- GPUs recomendadas: para FP16, se necesita una GPU con al menos 12 GB de VRAM (RTX 3060 12GB, RTX 4070, A10, L4). Para cuantización ligera, una RTX 4060 de 8 GB podría ser suficiente, pero no está confirmado.
- Compatibilidad con GPUs de consumo: sí, modelos como RTX 3090/4090 (24 GB) o RTX 4070 Ti (12 GB) pueden ejecutar la inferencia sin problemas.
- Opciones de despliegue: el paquete `hojo-asr` proporciona una API de Python con carga de modelo y transcripción por lotes. No se menciona soporte para vLLM, TGI o llama.cpp; el despliegue se realiza probablemente a través del pipeline propio de la librería.
- Latencia y throughput: no se han publicado datos. En una GPU de 24 GB, un modelo de 4B en FP16 puede procesar varios audios por segundo, pero la cifra exacta depende de la duración del audio y del batch size.

## Comparativa con modelos similares

No se dispone de datos comparativos verificados en la información proporcionada. El autor afirma que Hojo-ASR-Multi-V1 es el #1 entre los modelos ASR multilingües abiertos, pero no se incluyen comparaciones numéricas con alternativas como Whisper large-v3, SeamlessM4T o Qwen2-Audio. Para una evaluación rigurosa, se recomienda consultar el Open ASR Leaderboard mencionado en el tweet del autor.

## Limitaciones y advertencias

- No se han publicado detalles sobre los datos de entrenamiento, la composición de los datasets ni el proceso de filtrado, lo que dificulta evaluar posibles sesgos.
- La model card solo declara cinco idiomas en los metadatos (de, fr, it, pt, es), aunque el README menciona nueve. Esta discrepancia puede indicar que el soporte para japonés, árabe, coreano y ruso es experimental o no está totalmente validado.
- No se especifica la longitud de contexto del audio ni el límite de duración por archivo. Los audios muy largos podrían requerir segmentación.
- El modelo solo acepta entrada de audio; no genera texto libre ni realiza tareas de diálogo, aunque al estar basado en Qwen3 podría adaptarse para fines conversacionales.
- La licencia Apache 2.0 permite uso comercial, pero el soporte comercial oficial se ofrece por separado a través de HojoAI, lo que sugiere que el modelo base es gratuito pero el acompañamiento técnico es de pago.
- No se proporcionan pesos cuantizados, por lo que el despliegue en entornos con poca VRAM requiere herramientas externas de cuantización no validadas por el autor.
- El repositorio es relativamente nuevo (creado en agosto de 2026) y tiene pocas descargas (65), lo que implica una comunidad de usuarios reducida y posible menor madurez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HojoAI/Hojo-ASR-Multi-V1
- Repositorio GitHub: https://github.com/HojoAI/Hojo-ASR
- Paquete Python `hojo-asr` en PyPI: https://pypi.org/project/hojo-asr/
- Anuncio del autor en X/Twitter: https://x.com/hojoHQ/status/2094766358018113781
- Modelo anterior Hojo-ASR-V1 (versión monolingüe): https://huggingface.co/HojoAI/Hojo-ASR-V1
