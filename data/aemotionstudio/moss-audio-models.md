# AEmotionStudio/moss-audio-models

## Resumen

MOSS-Audio 4B-Instruct es un modelo de comprensión auditiva de código abierto desarrollado por el equipo OpenMOSS (MOSI.AI, OpenMOSS team y Shanghai Innovation Institute). Se trata de un modelo de audio-texto que unifica tareas como el reconocimiento de voz con marcas temporales, la detección de hablantes y emociones, la comprensión de sonidos ambientales, el análisis musical, la generación de descripciones de audio y el razonamiento complejo sobre contenido auditivo. Su arquitectura combina un codificador de audio estilo Whisper con un modelo de lenguaje Qwen3-4B, al que se le inyectan características temporales mediante el mecanismo DeepStack.

La versión alojada en `AEmotionStudio/moss-audio-models` es un espejo (mirror) verificado del repositorio original `OpenMOSS-Team/MOSS-Audio-4B-Instruct`, empaquetado específicamente para el runtime offline del DAW MAESTRO. Los pesos son idénticos byte a byte a los del upstream (verificados por SHA-256), y se distribuyen en formato bf16 con licencia Apache-2.0. Este mirror no incluye los archivos de código remoto, ya que MAESTRO utiliza el paquete de inferencia del repositorio GitHub oficial.

La relevancia actual de este modelo radica en su capacidad para procesar audio del mundo real de forma unificada, sin necesidad de múltiples sistemas especializados. Al estar basado en Qwen3, hereda las capacidades de razonamiento y generación de texto del LLM, lo que permite responder preguntas abiertas sobre el contenido auditivo con conciencia temporal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio estilo Whisper + LLM Qwen3-4B con inyeccion DeepStack |
| Parametros totales | 4 mil millones (4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo solo incluye bf16) |
| Idiomas soportados | No disponible (probablemente multilingue, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura de MOSS-Audio 4B-Instruct combina un codificador de audio (similar al de Whisper) que convierte la senal acustica en representaciones latentes, con un modelo de lenguaje Qwen3-4B como decodificador. La innovacion principal es el mecanismo DeepStack, que inyecta caracteristicas temporales en las capas del LLM, permitiendo al modelo comprender la secuencia temporal de eventos dentro del audio (por ejemplo, cuando ocurre un sonido concreto o cuando habla cada persona). Esta inyeccion se realiza a lo largo de las capas del transformer, en lugar de limitarse a la entrada, lo que mejora la conciencia temporal del modelo.

No se dispone de informacion detallada sobre el entrenamiento: ni el numero de tokens, ni la composicion del dataset, ni si se aplicaron tecnicas como RLHF o DPO. El modelo se publica como un checkpoint instruct afinado, pero los detalles del proceso de entrenamiento no estan disponibles en la informacion proporcionada.

## Capacidades

- Transcripcion de voz con marcas temporales (ASR con timestamps).
- Deteccion de hablantes y atribucion de turnos de palabra.
- Reconocimiento de emociones en el habla.
- Comprension de sonidos ambientales (clasificacion y descripcion de eventos sonoros).
- Analisis musical (deteccion de instrumentos, genero, estructura, etc.).
- Generacion de descripciones de audio (audio captioning).
- Respuesta a preguntas abiertas sobre el contenido del audio (QA).
- Razonamiento con conciencia temporal: puede responder a preguntas como "que sonido ocurrio primero?" o "cuando empezo a hablar la segunda persona?".
- Razonamiento complejo sobre multiples pistas de audio simultaneas.

## Casos de uso

- Transcripcion de reuniones y entrevistas: el modelo puede generar transcripciones con timestamps y atribuir cada intervencion a su hablante, lo que facilita la creacion de actas y busquedas posteriores en el contenido.
- Analisis de llamadas de atencion al cliente: permite detectar el tono emocional del cliente y del agente, identificar momentos de friccion y extraer metricas de calidad de servicio de forma automatica.
- Moderacion de contenido audiovisual: puede detectar sonidos inapropiados, gritos, disparos u otros eventos acusticos en videos subidos por usuarios, ayudando a filtrar contenido antes de su publicacion.
- Accesibilidad para personas con discapacidad auditiva: genera subtitulos descriptivos que incluyen no solo el dialogo, sino tambien sonidos relevantes (por ejemplo, "suena una alarma", "se oye un portazo"), mejorando la experiencia de visionado.
- Analisis musical para productores y sellos discograficos: permite catalogar bibliotecas de audio describiendo genero, instrumentacion, tempo y estructura, o buscar pistas por descripcion textual.
- Asistentes de voz con memoria de contexto: al integrarse en un asistente, puede recordar que se dijo en una conversacion anterior y responder preguntas sobre ella, gracias a su capacidad de QA temporal.
- Investigacion en psicologia y linguistica: analisis de grabaciones de sesiones de terapia o entrevistas para detectar patrones emocionales y de habla, con marcas temporales precisas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni en benchmarks especificos de audio como FLEURS, LibriSpeech o AudioCaps. El repositorio original no incluye tablas comparativas en la documentacion accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 4B parametros en bf16, lo que supone aproximadamente 8 GB solo para los pesos. Con overhead de activaciones y cache, se estima un consumo de 10-12 GB en inferencia con contexto corto.
- GPU recomendadas: una GPU con 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A10G) es suficiente para ejecutar el modelo en bf16. Para despliegues con mayor concurrencia, se recomienda A100 (40 GB) o H100.
- En GPU de consumo: cabe en tarjetas de 16 GB, como la RTX 4080 o 4090. En tarjetas de 12 GB (RTX 3080, 4070) podria ser necesario cuantizar a 8 bits, aunque no se proporcionan cuantizaciones oficiales.
- Opciones de despliegue: al ser un modelo basado en Qwen3, es compatible con vLLM, TGI y llama.cpp (si se convierte a GGUF). El repositorio de MAESTRO incluye un paquete de inferencia propio basado en el codigo de GitHub.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de 4B en bf16 en una RTX 4090 suele generar entre 30 y 60 tokens por segundo, pero la latencia dependera del tamaño del audio de entrada y de la longitud de la respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Audio 4B-Instruct | 4B | No disponible | Audio-texto unificado con timestamps | Apache-2.0 | HuggingFace, GitHub |
| Whisper large-v3 | 1.5B | 30 s de audio | Solo ASR y traduccion | MIT | HuggingFace |
| Qwen2-Audio | 7B | No disponible | Audio-texto, sin timestamps | Apache-2.0 | HuggingFace |
| SALMONN | 7B | No disponible | Audio-texto, sin timestamps | MIT | HuggingFace |

MOSS-Audio se diferencia de Whisper por su capacidad de razonamiento y comprension de sonidos no verbales. Frente a Qwen2-Audio, anade la conciencia temporal y la deteccion de hablantes. Su principal ventaja es la unificacion de tareas en un solo modelo, aunque su tamano (4B) es menor que el de Qwen2-Audio (7B), lo que puede implicar menor capacidad bruta en tareas generativas complejas.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos especificos del modelo, pero al estar entrenado sobre datos de audio del mundo real, es probable que presente sesgos en el reconocimiento de acentos, dialectos o idiomas poco representados.
- Riesgo de alucinacion en la generacion de descripciones: como cualquier LLM, puede inventar detalles que no estan presentes en el audio, especialmente en tareas de captioning o QA abierta.
- La longitud de contexto no esta documentada, por lo que no se conoce el limite de duracion de audio que puede procesar de una sola vez. Es probable que este limitado a unos pocos minutos.
- El mirror de AEmotionStudio no incluye los archivos de codigo remoto; para usarlo fuera de MAESTRO es necesario instalar el paquete de inferencia desde el repositorio GitHub oficial.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribucion al equipo OpenMOSS.
- No se proporcionan cuantizaciones oficiales; el unico formato disponible es bf16, lo que puede limitar su despliegue en hardware con poca VRAM.

## Enlaces

- Repositorio HuggingFace del mirror: https://huggingface.co/AEmotionStudio/moss-audio-models
- Repositorio HuggingFace original: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-4B-Instruct
- Pagina oficial del modelo: https://openmoss.ai/MOSS-Audio/
- Repositorio GitHub con el codigo de inferencia: https://github.com/OpenMOSS/MOSS-Audio
- Articulo de noticias sobre el modelo: https://kiadev.net/news/2026-04-27-moss-audio-unified-audio-model
