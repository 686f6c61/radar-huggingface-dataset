# ldov/Nemotron-3-Diarization

## Resumen

Nemotron 3 Diarization es un modelo de diarización de hablantes (identificación de "quién habla y cuándo") desarrollado por NVIDIA y publicado como pesos abiertos. Resuelve el problema de segmentar audio multiturno en función del hablante activo, con soporte tanto para inferencia en streaming como en modo offline, y con capacidad para gestionar hasta ocho hablantes simultáneos. Sigue la estela de Sortformer, ordenando los canales de salida según la primera aparición de cada hablante en el audio de entrada.

Arquitectónicamente es un transformer de diarización basado en el esquema Streaming Sortformer, con unos 99,2 millones de parámetros (aproximadamente 100 M), lo que lo sitúa en una franja muy ligera y desplegable en hardware de consumo. Un único checkpoint cubre distintos regímenes de latencia: desde buffers de entrada de tan solo 80 ms hasta configuraciones tipo offline con buffers de 30,4 s, con resolución de salida configurable en múltiplos de 10 ms.

Es relevante ahora porque unifica streaming y procesamiento offline en un solo modelo, algo poco habitual en diarización, y porque su licencia (OpenMDW-1.1) permite uso comercial sin restricciones significativas. Con NeMo-Speech.cpp se puede ejecutar de forma nativa en C++ sin necesidad de Python, lo que facilita su integración en productos de transcripción y análisis de reuniones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de diarizacion tipo Streaming Sortformer (encoder + modulos Sortformer con Arrival-Order Speaker Cache y cola FIFO) |
| Parametros totales | 99.226.504 (~100 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Basada en audio: buffer de entrada configurable de 80 ms a 30,4 s; inferencia por chunks sin limite de duracion total |
| Tipos de cuantizacion | GGUF disponible; pesos safetensors (precisiones exactas no disponibles) |
| Idiomas soportados | no disponible (modelo agnostico al idioma, opera sobre audio) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors, GGUF, .nemo |

## Arquitectura y entrenamiento

El modelo se apoya en el paradigma Sortformer, en el que un encoder procesa el audio y un decodificador especifico produce probabilidades de actividad por hablante y por trama. La permutacion de hablantes se resuelve ordenando los canales de salida segun la primera llegada de cada voz. Para el modo streaming incorpora la Arrival-Order Speaker Cache (AOSC), que conserva informacion de hablantes de chunks anteriores para mantener identidades estables, y una cola FIFO que aporta contexto reciente en cada paso de procesamiento. Los parametros de streaming (SPKCACHE_LEN, FIFO_LEN, CHUNK_LEN, RIGHT_CONTEXT, UPDATE_PERIOD) estan medidos en tramas de 80 ms y son configurables.

No se detalla en la informacion disponible el numero exacto de tokens de audio ni la composicion completa del dataset. La model card y la documentacion de NVIDIA indican que el entrenamiento combina conversaciones reales y audio multihablante. No se especifica si hubo fases de RLHF o DPO, algo por otra parte habitual no aplicar en modelos de diarizacion. La innovacion tecnica principal es la coexistencia de modo streaming y offline en un unico checkpoint, con latencia de buffer tan baja como 80 ms y resolucion de salida configurable.

## Capacidades

- Diarizacion de hablantes ("who spoke when") en audio real, con hasta ocho hablantes simultaneos.
- Inferencia en streaming y en modo offline con el mismo checkpoint.
- Latencia configurable: buffer de entrada desde 80 ms (recomendado minimo 0,32 s) hasta configuracion offline con buffer de 30,4 s.
- Resolucion de salida de tramas configurable en multiplos de 10 ms.
- Procesamiento por chunks, sin limite en la duracion total del audio.
- Deteccion de actividad de voz (pipeline declarado: voice-activity-detection).
- Speaker tagging a nivel de palabra cuando se combina con transcripcion (`nemo-speech transcribe --diarize --json`).
- Ejecucion local nativa en C++ mediante NeMo-Speech.cpp.
- Entrada por archivo de audio, lista de archivos, arrays de numpy o manifiesto JSONL.

## Casos de uso

- Transcripcion de reuniones con etiquetado por hablante: el modelo asigna etiquetas de hablante a nivel de palabra y se integra con ASR para producir transcripciones tipo "Habrante 1: ...", util en actas automaticas.
- Analisis de llamadas de atencion al cliente: permite separar agente y cliente en el audio, medir tiempos de habla y turnos, y alimentar metricas de calidad sin subir el audio a servicios externos.
- Subtitulado y postproduccion de podcasts o entrevistas: la salida con marcas temporales por hablante facilita la segmentacion y el montaje automatico.
- Sistemas de reuniones en tiempo real (diarizacion en streaming): con buffer de 0,32 s se puede mostrar quien habla en vivo durante videoconferencias.
- Investigacion en linguistica y analisis conversacional: extraccion de patrones de turnos de palabra, solapamientos e interrupciones en corpus multihablante.
- Indexacion y busqueda de archivos de audio: combinado con ASR, permite buscar por hablante dentro de grandes archivos de audio o video.
- Asistentes de accesibilidad: identificacion de hablantes para transcripcion en vivo con distincion de interlocutores.
- Monitorizacion de salas y actas automaticas en entornos con varios participantes (hasta ocho voces).

## Benchmarks y rendimiento

| Benchmark | Resultado | Fuente |
|---|---|---|
| DER (Diarization Error Rate) | 14,72 % | explainx.ai (reporte sobre el modelo) |

No se han publicado en la informacion disponible resultados adicionales del tipo MMLU, HumanEval o GSM8K, ya que el modelo no es de lenguaje general sino de diarizacion de audio. La cifra de DER anterior procede de una fuente secundaria y no se ha podido verificar contra una tabla oficial de NVIDIA.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16 en torno a 0,2 GB de pesos (mas activaciones y buffers de estado), en torno a 0,4 GB en FP32; con INT8/GGUF, por debajo de 0,15 GB de pesos.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 3060 o superior, o incluso GPU integrada, cubre el modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU NVIDIA con al menos 1-2 GB libres de VRAM, e incluso en CPU.
- Opciones de despliegue: NeMo ToolKit (Python 3.12+, `nemo-toolkit[asr]`), NeMo-Speech.cpp (runtime C++ nativo), integracion con transformers.
- Latencia y throughput estimados: no disponibles de forma numerica. La latencia de buffer de entrada puede configurarse desde 80 ms, con recomendacion minima de 0,32 s; la configuracion offline usa un buffer de 30,4 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/streaming | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nemotron 3 Diarization (NVIDIA) | ~100 M | Hasta 8 hablantes, streaming y offline, buffer 80 ms - 30,4 s | openmdw-1.1 (uso comercial permitido) | Pesos abiertos en HuggingFace |
| Sortformer (NVIDIA, predecesor) | no disponible | Offline, referenciado como base arquitectonica | no disponible | no disponible |
| Streaming Sortformer (NVIDIA) | no disponible | Streaming con AOSC y cola FIFO | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos verificados frente a alternativas como pyannote u otros sistemas de diarizacion en la informacion proporcionada, por lo que la comparacion queda limitada a la referencia arquitectonica del propio linaje Sortformer.

## Limitaciones y advertencias

- Limite estricto de ocho hablantes; en escenarios con mas voces la asignacion puede degradarse.
- Riesgo de confusion o intercambio de identidades en cambios de turno rapidos, solapamientos prolongados o audio de baja calidad.
- La resolucion de salida es de 10 ms como minimo; para aplicaciones que requieran precision inferior no es adecuado.
- No se documentan idiomas soportados; al operar sobre audio, el rendimiento puede variar segun acento, ruido de fondo y condiciones de grabacion.
- El DER reportado (14,72 %) procede de una fuente secundaria y no ha sido verificado contra una tabla oficial; puede no corresponder a todos los dominios.
- El identificador de HuggingFace facilitado en la informacion de origen (ldov/Nemotron-3-Diarization) difiere del repositorio oficial de NVIDIA (nvidia/Nemotron-3-Diarization); conviene usar la fuente oficial para descargas y soporte.
- Aunque la licencia openmdw-1.1 permite uso comercial segun la model card, conviene revisar los terminos exactos del texto de licencia antes de integrarlo en producto.
- Las fechas de publicacion indicadas (septiembre de 2026) son las reportadas en la model card; verificar la vigencia de la informacion.

## Enlaces

- HuggingFace (repositorio indicado en la informacion): https://huggingface.co/ldov/Nemotron-3-Diarization
- HuggingFace (repositorio oficial de NVIDIA): https://huggingface.co/nvidia/Nemotron-3-Diarization
- Blog de NVIDIA en HuggingFace: https://huggingface.co/blog/nvidia/nemotron-diarization
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/nvidia/nemotron-diarization
- NVIDIA NeMo Speech (repositorio): https://github.com/NVIDIA-NeMo/Speech
- NeMo-Speech.cpp (runtime C++): https://github.com/NVIDIA/NeMo-Speech.cpp
- Guia de diarizacion de NeMo-Speech.cpp: https://github.com/NVIDIA/NeMo-Speech.cpp/blob/main/docs/cli.md#diarize-audio
- Documentacion del modelo en transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/nemotron3_diarization.md
- Referencia Sortformer (arXiv:2409.06656): https://arxiv.org/abs/2409.06656
- Referencia Streaming Sortformer (arXiv:2507.18446): https://arxiv.org/abs/2507.18446
- Referencia adicional (arXiv:2605.15442): https://arxiv.org/abs/2605.15442
- Referencia adicional (arXiv:2507.09226): https://arxiv.org/abs/2507.09226
- Referencia adicional (arXiv:2408.13106): https://arxiv.org/abs/2408.13106
- Ficha en explainx.ai: https://www.explainx.ai/blog/nvidia-nemotron-3-diarization-open-weight-eight-speakers-2026
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/nemotron-3-diarization-nvidia
