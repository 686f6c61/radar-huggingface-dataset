# Kiyan122/whisper-small-fa-neyshekar

## Resumen

whisper-small-fa-neyshekar es un modelo de reconocimiento automático del habla (ASR) en persa (farsi), resultado de un fine-tuning de openai/whisper-small sobre un conjunto de datos no especificado en la model card, aunque el nombre del modelo y su referencia al proyecto Neyshekar sugieren que se entrenó con datos de habla persa. El autor es Kiyan122, y el modelo se publica bajo licencia Apache 2.0.

El modelo conserva la arquitectura encoder-decoder de Whisper Small, con aproximadamente 241,7 millones de parámetros, y está diseñado para transcribir audio a texto en persa. Su relevancia radica en que el persa es un idioma con escasos recursos de ASR de código abierto de calidad, y este fine-tuning busca adaptar un modelo base multilingüe a las particularidades fonéticas y ortográficas del farsi. La ventana de audio de Whisper es de 30 segundos por segmento, lo que permite transcribir audios largos mediante segmentación.

El repositorio se generó automáticamente con el Trainer de Hugging Face y la model card apenas contiene información adicional, por lo que muchos detalles técnicos (dataset exacto, métricas de evaluación, composición de los datos) no están disponibles públicamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Whisper) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por segmento (ventana fija de Whisper) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Persa (farsi), inferido del nombre y del dataset; el modelo base Whisper Small soporta 99 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper Small: un transformer encoder-decoder con atención estándar, entrenado originalmente por OpenAI sobre 680.000 horas de audio débilmente supervisado en 99 idiomas. Whisper procesa el audio en fragmentos de 30 segundos, convierte el espectrograma log-Mel en una secuencia de embeddings mediante un encoder, y genera el texto token a token con el decoder. El fine-tuning aquí descrito adapta los pesos del modelo base al persa.

Según la model card, el entrenamiento se realizó con los siguientes hiperparámetros: learning rate de 1e-05, batch de entrenamiento de 32 por dispositivo (256 efectivo con acumulación de gradientes de 4 pasos en 2 GPUs), optimizador AdamW con betas (0.9, 0.999) y épsilon 1e-08, scheduler cosine_with_min_lr con 40 pasos de warmup y 400 pasos totales. Se usó mixed precision nativa (AMP). No se especifica el dataset de entrenamiento, el número de horas de audio ni el proceso de evaluación. La versión de Transformers empleada fue 5.0.0, con PyTorch 2.10.0 y Datasets 5.0.0.

## Capacidades

- Transcripción de audio en persa (farsi) a texto, con salida en caracteres persas.
- Reconocimiento del habla con manejo de ruido de fondo y acentos, gracias a la robustez del modelo base Whisper.
- Segmentación de audio largo en ventanas de 30 segundos para transcribir grabaciones extensas.
- Posibilidad de transcripción con timestamp a nivel de segmento, útil para subtitulado.
- El modelo base Whisper Small soporta 99 idiomas, por lo que el fine-tuning podría conservar capacidades multilingües residuales, aunque no hay datos que lo confirmen.
- No se documenta soporte de tool calling, agentes, visión ni modos de razonamiento extendido: es exclusivamente un modelo de ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en persa: el modelo puede procesar grabaciones de audio de reuniones de trabajo o entrevistas de investigación, segmentándolas en ventanas de 30 segundos y generando transcripciones con marcas de tiempo para su posterior análisis.
- Subtitulado automático de vídeos en persa: integrado en un pipeline de postproducción, el modelo genera subtítulos en farsi para contenido de YouTube, cursos online o material audiovisual, reduciendo el coste de subtitulado manual.
- Asistentes de voz para aplicaciones móviles en persa: combinado con un sistema de comprensión del lenguaje natural, permite convertir comandos de voz del usuario en texto que una aplicación procesa para ejecutar acciones.
- Archivado y búsqueda de contenido audiovisual: transcripción de archivos de audio históricos o podcasts persas para indexarlos en bases de datos y habilitar búsqueda por texto dentro del contenido hablado.
- Investigación lingüística y fonética del persa: el modelo sirve como herramienta de transcripción automática para corpus de habla espontánea, facilitando el estudio de variaciones dialectales y fenómenos fonéticos.
- Atención al cliente con IVR en persa: despliegue en un sistema de respuesta de voz interactiva que transcribe las consultas del cliente para enrutarlas al departamento adecuado o alimentar un chatbot.
- Generación de actas médicas o legales: transcripción de dictados o grabaciones de consultas médicas y declaraciones legales en persa, con la precisión suficiente para un primer borrador que un profesional revisa posteriormente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo model-index de la model card contiene una lista vacía de resultados, y no se encontraron métricas de WER (Word Error Rate) ni comparativas con otros modelos en la documentación pública.

## Requisitos de hardware

- VRAM estimada para inferencia: Whisper Small en FP32 requiere aproximadamente 1,5 GB de VRAM; en FP16 o con cuantización INT8, alrededor de 0,8-1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Una RTX 3060, RTX 4060 o superior ofrece latencias de inferencia de entre 1x y 3x tiempo real para audio de 30 segundos.
- Compatible con GPU de consumo: sí, cabe en GPUs de gama media como RTX 3060 (12 GB) o incluso en GPUs integradas con cuantización agresiva.
- Opciones de despliegue: transformers con pipeline de ASR, faster-whisper (implementación CTranslate2), whisper.cpp para CPU, o servidores de inferencia como vLLM (con soporte experimental para Whisper) y TGI.
- Latencia estimada: en una RTX 4090, la transcripción de un segmento de 30 segundos suele completarse en menos de 1 segundo con faster-whisper en FP16. En CPU con whisper.cpp, la latencia puede ser de 2 a 5 veces el tiempo real según el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-fa-neyshekar | 241,7 M | 30 s audio | Persa (fine-tuning) | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s audio | 99 idiomas | MIT | Hugging Face |
| openai/whisper-large-v3 | 1.550 M | 30 s audio | 99 idiomas | MIT | Hugging Face |
| shekar-ai/neyshekar-v4-persian-asr-fa | no disponible | no disponible | Persa | CC0 1.0 (dataset) | Hugging Face (dataset) |

La comparativa directa con otros modelos persas de ASR no está disponible en la información pública. El modelo base Whisper Small es el punto de referencia natural: este fine-tuning debería mejorar el WER en persa frente al modelo base, aunque no hay métricas publicadas que lo confirmen.

## Limitaciones y advertencias

- No se han publicado métricas de evaluación (WER, CER) en la model card, por lo que el rendimiento real en persa es desconocido.
- El dataset de entrenamiento no está especificado: no se sabe cuántas horas de audio persa se usaron ni su composición (registro, acentos, calidad de grabación).
- Sesgos potenciales: si el dataset Neyshekar se recopiló mediante crowdsourcing comunitario, podría estar sesgado hacia variedades urbanas del persa, con menor cobertura de dialectos regionales o habla informal.
- Riesgo de alucinación: como todos los modelos Whisper, puede generar texto plausible pero incorrecto en segmentos de audio ambiguos o con mucho ruido, especialmente en idiomas con pocos datos de entrenamiento.
- Limitación de contexto: la ventana fija de 30 segundos requiere segmentación del audio; los cortes en mitad de una palabra pueden degradar la transcripción.
- La model card no documenta el proceso de evaluación ni los resultados de validación durante el entrenamiento.
- La licencia Apache 2.0 permite uso comercial sin restricciones de atribución obligatoria, pero el modelo hereda los pesos de Whisper Small (MIT), por lo que no hay conflicto de licencias conocido.
- No se especifican restricciones de uso en la model card más allá de la licencia Apache 2.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kiyan122/whisper-small-fa-neyshekar
- Modelo base openai/whisper-small: https://huggingface.co/openai/whisper-small
- Repositorio GitHub de Whisper: https://github.com/openai/whisper
- Proyecto Neyshekar (dataset persa): https://shekar.ai/projects/neyshekar.html
- Sitio de Shekar AI (NLP persa): https://shekar.ai/
- Dataset neyshekar-v4-persian-asr-fa: https://huggingface.co/datasets/shekar-ai/neyshekar-v4-persian-asr-fa/tree/main
