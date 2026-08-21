# FireRedTeam/FireRedAudio

## Resumen

FireRedAudio es un modelo de lenguaje de audio de propósito general desarrollado por el equipo FireRed de Xiaohongshu (RedNote), presentado en agosto de 2026. Se trata de un modelo unificado de 9.000 millones de parámetros que combina comprensión y generación de audio en una única arquitectura, con representaciones continuas desacopladas: un codificador de audio (Audio Encoder) para tareas de entendimiento y una vía RedAE para la generación de habla. El modelo soporta reconocimiento de voz (ASR), comprensión de audio amplia y detallada, clonación de voz en zero-shot, TTS por instrucciones y edición de habla semántica y acústica, además de poder localizar temporalmente contenido en grabaciones de hasta una hora.

El diseño destaca por compartir un mismo backbone de lenguaje y razonamiento entre las tareas de comprensión y generación, lo que permite un único modelo para todo el espectro de procesamiento de audio. Es el primer modelo de este tipo con representaciones continuas desacopladas en una arquitectura pública, según sus autores. La licencia es Apache 2.0, lo que facilita su uso en investigación y aplicaciones comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM de 9B parámetros con representaciones continuas desacopladas (Audio Encoder + RedAE decoder) |
| Parametros totales | 9.000 millones (9B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (la documentación menciona soporte de grabaciones de hasta una hora) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los ejemplos muestran chino e inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

FireRedAudio se basa en un LLM compartido de 9B parámetros que actúa como backbone para dos rutas con representaciones continuas desacopladas. La ruta de comprensión utiliza un Audio Encoder que convierte el audio en representaciones continuas que el LLM procesa para tareas como ASR o razonamiento auditivo. La ruta de generación emplea un decodificador RedAE que transforma las representaciones generadas por el LLM en formas de onda de audio. Este diseño permite que el modelo comparta el razonamiento y el conocimiento lingüístico entre ambas tareas sin acoplar las representaciones intermedias.

No se han publicado detalles sobre el proceso de entrenamiento (número de tokens, composición del dataset, fases de RLHF o DPO) en la información proporcionada. La model card indica que el modelo se entrena para manejar tareas de comprensión y generación de forma conjunta, y que la edición acústica requiere el uso de plantillas de instrucción específicas, lo que sugiere un entrenamiento supervisado con datos anotados para cada tipo de tarea.

## Capacidades

- **Reconocimiento de voz (ASR)**: transcripción de audio a texto, con soporte de idiomas como chino e inglés (según ejemplos).
- **Comprensión de audio amplia y detallada**: identificación de hablantes, análisis de eventos, razonamiento sobre el contenido auditivo, con opción de cadena de pensamiento (chain-of-thought).
- **TTS zero-shot (clonación de voz)**: genera voz a partir de un texto objetivo y un clip de referencia de un hablante, replicando el estilo y timbre.
- **TTS por instrucciones**: permite diseñar la voz mediante descripciones en lenguaje natural (por ejemplo, "voz grave y lenta").
- **Edición de habla semántica**: reescribe, sustituye, inserta o elimina contenido en un clip de audio, manteniendo la voz original.
- **Edición de habla acústica**: ajusta pitch, velocidad y volumen siguiendo plantillas específicas (p.ej. "shift the pitch by N step(s)").
- **Localización temporal**: puede organizar y recuperar contenido en grabaciones de hasta una hora, devolviendo timestamps y resúmenes fundamentados.

## Casos de uso

- **Transcripción y subtitulado automático**: el modelo puede generar subtítulos para vídeos o podcasts mediante la tarea ASR, con precisión y soporte para audio largo (hasta una hora).
- **Asistentes de voz con comprensión contextual**: un asistente puede entender comandos de voz y razonar sobre el contenido auditivo, por ejemplo, responder preguntas sobre una reunión grabada.
- **Clonación de voz para doblaje**: dado un clip de referencia de un locutor, el modelo puede generar nuevos textos con su voz, útil para localización de contenidos o audiobooks.
- **Edición de podcasts**: permite corregir errores de habla (borrar palabras, reemplazar frases) sin regrabar, manteniendo el tono y estilo original.
- **Diseño de voz para personajes**: con la instrucción TTS, se puede crear una voz con características específicas (tono, velocidad, timbre) para avatares o videojuegos.
- **Análisis forense de audio**: la localización temporal permite buscar eventos concretos en grabaciones largas, como identificar cuándo se menciona una palabra o un suceso.
- **Accesibilidad**: conversión de texto a voz para personas con discapacidad visual, o transcripción de audio para personas sordas.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que el modelo obtiene resultados competitivos o líderes en los conjuntos de evaluación MMAU, MMSU, Seed-TTS-Eval, InstructTTSEval y Ming-Freeform-Audio-Edit, pero no se aportan cifras concretas.

## Requisitos de hardware

- No se proporcionan requisitos específicos de hardware en la documentación del modelo.
- Dado el tamaño de 9B parámetros, se recomienda una GPU con al menos 24 GB de VRAM para inferencia en precisión fp16 (por ejemplo, NVIDIA RTX 4090, A100 o H100).
- Para tareas de generación, se necesita además el decodificador RedAE, lo que puede aumentar el uso de memoria.
- El modelo se ejecuta en GPU con CUDA, y requiere compilar kernels de causal-conv1d y flash-attention durante la instalación.
- Se puede desplegar con el código oficial de PyTorch, y no se mencionan integraciones con vLLM o llama.cpp en la documentación.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de audio unificados en la información proporcionada. Sin embargo, FireRedAudio se enmarca en la categoría de modelos de lenguaje de audio (audio LLM) junto a otros como Qwen2-Audio o SALMONN, aunque no hay cifras disponibles para una comparación objetiva.

## Limitaciones y advertencias

- La edición acústica requiere instrucciones con plantillas exactas (por ejemplo, "shift the pitch by N step(s)"), no acepta lenguaje libre, lo que limita su flexibilidad en ese aspecto.
- El modelo puede ser utilizado para clonar voces, lo que plantea riesgos de suplantación de identidad o contenido engañoso. Se recomienda implementar medidas de consentimiento y verificación en aplicaciones reales.
- No se especifican los idiomas soportados oficialmente; los ejemplos solo muestran chino e inglés, por lo que el rendimiento en otros idiomas no está garantizado.
- La documentación no incluye información sobre sesgos o alucinaciones específicas, pero como modelo de lenguaje, puede generar respuestas incorrectas o inventadas en tareas de comprensión.
- El tamaño del repositorio es de 29.7 GB, lo que implica una descarga considerable y requisitos de almacenamiento y memoria elevados.
- No se proporcionan datos de rendimiento (latencia, throughput) ni de requisitos de VRAM concretos, por lo que el despliegue en producción requiere pruebas propias.

## Enlaces

- [Hugging Face: FireRedTeam/FireRedAudio](https://huggingface.co/FireRedTeam/FireRedAudio)
- [GitHub del proyecto FireRedAudio](https://github.com/FireRedTeam/FireRedAudio) (enlace inferido, no confirmado en la información)
- [Demo oficial](https://fireredteam.github.io/demos/fireredaudio/)
- [Paper en ArXiv](https://arxiv.org/) (no se ha proporcionado URL concreta)
- [Página del equipo FireRed](https://fireredteam.github.io/)

Nota: los enlaces a GitHub y al paper no se han verificado en la información proporcionada; se indican como referencias probables según la estructura de la model card.
