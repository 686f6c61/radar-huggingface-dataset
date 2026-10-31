# nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-NVFP4

## Resumen

NVIDIA Nemotron 3.5 Transcribe 30B A4B NVFP4 es un modelo de audio y voz de pesos abiertos desarrollado por NVIDIA, diseñado para transcripción multilingüe (40 idiomas), traducción de voz, transcripción contextual, transcripción con atribución de hablante, timestamps, identificación de idioma y respuesta de preguntas sobre audio. Se trata de una variante cuantizada en NVFP4 del modelo base NVIDIA-Nemotron-3.5-Transcribe-30B-A4B, obtenida mediante cuantización post-entrenamiento con ModelOpt.

Su relevancia radica en que resuelve, con un único modelo de voz (Speech-Augmented Language Model, SALM), tareas que tradicionalmente requerían pipelines con varios componentes (ASR, diarización, alineación temporal, traducción). Su arquitectura híbrida Mamba-2-Transformer de tipo Mixture of Experts activa aproximadamente 4.300 millones de parámetros por token (sobre 34B totales, incluido el codificador de audio), lo que permite procesar grabaciones de hasta una hora con una ventana de contexto de 65.536 tokens con coste de inferencia contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrido Mamba-2-Transformer Mixture of Experts con Parallel Expert Encoder (codificador ASR Transformer + codificador de hablante) |
| Parametros totales | 34B segun model card (18.710.697.253 segun safetensors del repositorio) |
| Parametros activos | ~4,3B (incluido el codificador de audio) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | NVFP4 en el decoder con capas FP8 (ModelOpt, post-training quantization); variantes BF16 y FP8 disponibles por separado |
| Idiomas soportados | 40: aleman, arabe, bengali, búlgaro, chino, croata, danes, eslovaco, esloveno, espanol, estonio, euskera no incluido (ver lista), finlandes, frances, griego, hebreo, hindi, húngaro, ingles, italiano, japones, letón, lituano, malayo, maltes, marati, neerlandes, polaco, portugues, rumano, ruso, sueco, tagalo, tailandes, tamil, telugu, turco, ucraniano, vietnamita, checo, coreano |
| Licencia | OpenMDW-1.1 (other en HuggingFace), apto para uso comercial y no comercial |
| Formato de pesos | Safetensors (libreria NeMo, PyTorch), tamanio del repositorio 21,6 GB |

## Arquitectura y entrenamiento

El modelo es un SALM (Speech-Augmented Language Model): un language model hibrido Mamba-2-Transformer con arquitectura Mixture of Experts, al que se anade un Parallel Expert Encoder compuesto por un codificador ASR de tipo Transformer y un codificador de hablantes (speaker encoder). Esta combinacion permite procesar audio crudo junto con instrucciones textuales y contexto opcional, generando respuestas textuales. La activacion de solo ~4,3B de parametros por token (de 34B totales) reduce el coste computacional manteniendo la capacidad de un modelo grande, y la presencia de capas Mamba-2 favorece el manejo de audio largo (hasta una hora por grabacion).

El entrenamiento se apoya en el dataset nvidia/Granary-v2, publicado por NVIDIA. La mezcla de entrenamiento incluye tareas de transcripcion multilingue, traduccion de voz, transcripcion contextual y con atribucion de hablante, timestamps, identificacion de idioma, preguntas sobre audio, seguimiento de instrucciones textuales y etiquetado/redaccion de PII. No se dispone de detalles publicados sobre numero de tokens, composicion detallada ni uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Transcripcion automatica (ASR) en 40 idiomas, incluyendo espanol
- Transcripcion de grabaciones largas de hasta una hora (long-form audio)
- Transcripcion contextual: acepta contexto textual opcional para mejorar la precision (nombres propios, terminologia)
- Transcripcion con atribucion de hablante (speaker diarization)
- Transcripcion enriquecida (rich transcription) con prediccion de timestamps
- Traduccion de voz (speech translation)
- Identificacion de idioma (language identification)
- Manejo de code-switching (cambio de idioma dentro de una misma grabacion)
- Respuesta de preguntas sobre audio (audio question answering)
- Seguimiento de instrucciones en texto, incluido etiquetado y redaccion de PII
- Estilizado de la transcripcion mediante instrucciones (el usuario selecciona el formato deseado)

## Casos de uso

- Transcripcion de reuniones y videoconferencias: puede procesar grabaciones de hasta una hora con diarizacion y timestamps, generando actas con atribucion de hablante sin dividir el audio manualmente.
- Subtitulado y accesibilidad: la prediccion de timestamps y el soporte multilingue permiten generar subtitulos sincronizados en 40 idiomas para video bajo demanda.
- Traduccion de contenido audiovisual: la tarea de speech translation permite subtitular o traducir conferencias y podcasts directamente desde el audio de origen.
- Analisis de call centers: la transcripcion con atribucion de hablante y el etiquetado/redaccion de PII facilitan el cumplimiento normativo (proteccion de datos) antes de almacenar o analizar conversaciones.
- Atencion al cliente y asistentes de voz offline: al ser un modelo offline de pesos abiertos, puede desplegarse on-premise para transcribir interacciones sin enviar audio a servicios de terceros.
- Preguntas sobre grabaciones de audio: el audio question answering permite consultar directamente el contenido de una grabacion ("¿que acuerdo se tomo en la reunion?") sin leer la transcripcion completa.
- Procesamiento de contenido multilingüe con code-switching: util en contextos donde los hablantes alternan idiomas (por ejemplo, espanol-ingles) dentro de una misma frase o conversacion.
- Generacion de transcripciones con formato personalizado: mediante instrucciones textuales se puede solicitar la salida en el estilo requerido (literal, limpio, con puntuacion especifica, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos concretos en la informacion disponible. El unico dato de rendimiento facilitado es que, promediado sobre los benchmarks de transcripcion, este checkpoint NVFP4 tiene una tasa de error un 3,6% mayor en terminos relativos que el modelo BF16 original (cuyos resultados completos figuran en la model card de la variante BF16 y en el informe tecnico).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 21,6 GB en NVFP4, por lo que cabe razonablemente en GPUs con 24 GB de VRAM o mas (estimacion basada en el tamanio de los pesos; no confirmado por la model card)
- GPU recomendadas: no disponible; por el formato NVFP4 y capas FP8, se orientan a GPUs NVIDIA con soporte de estos formatos (arquitecturas Blackwell/Hopper); no se confirma compatibilidad con GPUs de consumo
- Consumer GPU: no confirmado; dada la cuantizacion NVFP4/FP8, el despliegue en GPUs de consumo no esta documentado en la informacion disponible
- Opciones de despliegue: libreria NeMo (nvidia/NeMo Speech en GitHub para fine-tuning y serving); no se mencionan vLLM, llama.cpp, Ollama ni TGI en la model card
- Latencia y throughput: no disponible

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| Nemotron 3.5 Transcribe 30B A4B NVFP4 | 34B (4,3B activos) | Mamba-2-Transformer MoE + encoder de audio | 65.536 tokens | 40 | OpenMDW-1.1 |
| Nemotron 3.5 Transcribe 30B A4B (BF16) | 34B (4,3B activos) | Identica (precision BF16) | 65.536 tokens | 40 | OpenMDW-1.1 |
| Alternativas de terceros (Whisper large-v3, etc.) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado datos suficientes para una comparativa detallada con modelos de otras familias; la comparacion mas directa es con las variantes BF16 y FP8 del propio modelo, disponibles en el perfil de NVIDIA en HuggingFace.

## Limitaciones y advertencias

- La cuantizacion NVFP4 degrada la tasa de error de transcripcion un 3,6% en terminos relativos respecto al modelo BF16; para maxima precision conviene usar la variante BF16 o FP8.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como en todo modelo ASR generativo, puede inventar contenido en segmentos de audio ininteligible o ruidoso.
- Los benchmarks publicados corresponden al modelo BF16; los resultados del checkpoint NVFP4 no se han evaluado individualmente en la model card.
- Solo ~4,3B de parametros estan activos por token; el rendimiento depende criticamente de la calidad del audio y del idioma, y no se publican desgloses por idioma en la informacion proporcionada.
- Licencia OpenMDW-1.1: permite uso comercial y no comercial, pero se trata de una licencia "other" en HuggingFace; conviene revisar el texto completo en openmdw.ai antes de despliegues en produccion.
- El modelo procesa grabaciones de hasta una hora; audios mas largos requieren segmentacion por parte del desarrollador.
- Requiere la libreria NeMo para inferencia, lo que puede complicar la integracion frente a formatos estandar como GGUF.
- Sesgos: no documentados especificamente en la informacion disponible; la model card incluye una seccion de consideraciones eticas que debe consultarse en el repositorio original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-NVFP4
- Modelo base (BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Variante FP8: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-FP8
- Pagina de desarrolladores Nemotron: https://developer.nvidia.com/nemotron
- NeMo Speech (GitHub, fine-tuning y serving): https://github.com/NVIDIA-NeMo/Speech
- Informe tecnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Transcribe-Technical-Report.pdf
- Demo en vivo: https://huggingface.co/spaces/nvidia/nemotron-transcribe
- Dataset Granary-v2: https://huggingface.co/datasets/nvidia/Granary-v2
- Paper SALM: https://arxiv.org/abs/2310.09424
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
