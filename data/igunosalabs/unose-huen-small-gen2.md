# igunosalabs/Unose-Huen-Small-Gen2

## Resumen

Unose-Huen-Small-Gen2 es un modelo de reconocimiento automatico del habla (ASR) publicado por el usuario igunosalabs en Hugging Face. Se trata de un fine-tuning del modelo base igunosalabs/Unose-Huen-Small, del que hereda la arquitectura tipo Whisper segun indican los tags del repositorio. El modelo cuenta con 241.734.912 parametros (aproximadamente 242 millones) y se distribuye en formato safetensors bajo licencia Apache 2.0.

El modelo se presenta como un ajuste fino orientado a transcripcion de audio, con un word error rate (WER) declarado de 56,52 en el conjunto de evaluacion, una cifra que indica un rendimiento limitado para uso en produccion. La model card es practicamente un esqueleto autogenerado por el Trainer de Hugging Face: no documenta el dataset de entrenamiento, los idiomas soportados ni los usos previstos, y el model-index no incluye resultados de benchmarks.

Su relevancia actual es escasa fuera del ambito experimental: se trata de un checkpoint de investigacion con muy poca traccion (62 descargas y 0 likes en el momento de la consulta), sin documentacion tecnica sustantiva. Resulta util unicamente como referencia de un proceso de fine-tuning sobre el modelo base, no como herramienta lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR, segun tags del repo) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper, segun los tags del repositorio (`whisper`, `automatic-speech-recognition`), aunque la model card no describe la arquitectura de forma explicita. Con 241,7 millones de parametros, el tamano encaja con una variante compacta de la familia Whisper, adecuada para inferencia en hardware modesto. Al ser un fine-tuning de igunosalabs/Unose-Huen-Small, hereda la estructura del modelo base sin cambios arquitectonicos declarados.

El entrenamiento se realizo con el Trainer de Hugging Face sobre un dataset no especificado. Los hiperparametros documentados son: learning rate de 5e-06, batch size de entrenamiento de 8 con acumulacion de gradientes de 4 (batch efectivo de 32), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 150 pasos de warmup, semilla 42 y 1200 pasos totales de entrenamiento. No se documenta el numero de tokens de audio, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en ASR). Tampoco se indica si hubo aumentacion de datos o estrategias de decodificacion especulativa.

## Capacidades

- Reconocimiento automatico del habla: transcripcion de audio a texto, segun la pipeline declarada (`automatic-speech-recognition`).
- Generacion de transcripciones con puntuacion y mayusculas: no confirmado en la documentacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; la model card no especifica idiomas.
- Capacidades especiales (vision, audio, thinking mode): unicamente audio de entrada, por la naturaleza del modelo.
- Timestamps a nivel de palabra o segmento: no confirmado.

## Casos de uso

- Prototipado de pipelines ASR: el modelo puede integrarse en un flujo de transcripcion basico con la pipeline de transformers para validar la infraestructura antes de sustituirlo por un modelo con mejor WER.
- Experimentacion academica con fine-tuning de Whisper: sirve como punto de partida reproducible para estudiar el efecto de hiperparametros concretos (lr 5e-06, 1200 pasos) sobre un modelo base de ~242 M de parametros.
- Transcripcion de audio en entornos con recursos limitados: su tamano compacto permite ejecutarlo en GPU de consumo, util para pruebas offline en portatiles.
- Generacion de datasets pseudo-etiquetados: con un WER de 56,5 el modelo no es fiable para etiquetado automatico de calidad, pero puede emplearse en tareas de filtrado o deteccion gruesa de actividad de voz.
- Comparacion de checkpoints en investigacion: util para contrastar la evolucion entre el modelo base y esta generacion (Gen2) en estudios de ablacion.
- Demostraciones educativas de ASR: apropiado para talleres o cursos donde se explica el ciclo completo de fine-tuning de un modelo de voz, dado que la model card documenta los hiperparametros y las curvas de entrenamiento.

## Benchmarks y rendimiento

La model card declara los siguientes resultados en el conjunto de evaluacion (datos del autor, sin especificar el dataset):

| Metrica | Valor |
|---|---|
| Loss (validacion) | 1,5754 |
| WER | 56,5212 |

Evolucion durante el entrenamiento (seleccion de checkpoints):

| Step | Epoch | Validation loss | WER |
|---|---|---|---|
| 200 | 2,33 | 1,5035 | 56,9308 |
| 400 | 4,66 | 1,5668 | 57,0459 |
| 600 | 6,99 | 1,5537 | 57,6219 |
| 800 | 9,31 | 1,5739 | 56,4572 |
| 1000 | 11,63 | 1,5776 | 56,5852 |
| 1200 | 13,96 | 1,5754 | 56,5212 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, LibriSpeech, Common Voice) en la informacion disponible. El model-index del autor esta vacio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para los pesos (242 M de parametros x 4 bytes), mas overhead de activaciones y buffers de audio; en la practica, entre 1,5 y 2,5 GB.
- VRAM estimada en fp16/bf16: alrededor de 0,5 GB para pesos, con un total practico de 1-1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se puede ejecutar en RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin problema.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna e incluso en CPU (con mayor latencia).
- Opciones de despliegue: transformers (pipeline de ASR), vLLM no aplica de forma estandar a Whisper, llama.cpp no soporta esta arquitectura de forma nativa, TGI no esta orientado a ASR; despliegue tipico mediante transformers o servicios como Whisper de OpenAI no aplican a este checkpoint.
- Latencia y throughput: no disponibles; dependen del hardware y de la duracion del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unose-Huen-Small-Gen2 | 241,7 M | no disponible | WER 56,52 (dataset no especificado) | Apache 2.0 | Hugging Face (62 descargas) |
| openai/whisper-small | ~244 M | 30 s de audio por ventana | WER ~5-10 en LibriSpeech (referencia publica) | MIT | Hugging Face, ampliamente usado |
| openai/whisper-base | ~74 M | 30 s de audio por ventana | WER mayor que small en benchmarks publicos | MIT | Hugging Face |
| igunosalabs/Unose-Huen-Small (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparacion con whisper-small es la mas directa por tamano, pero el WER declarado por Unose-Huen-Small-Gen2 es muy superior al de la referencia publica de Whisper, lo que sugiere un dataset de evaluacion distinto o un ajuste insuficiente. No hay datos publicos del modelo base Unose-Huen-Small para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- WER de 56,52: un valor muy alto para ASR en produccion, lo que implica que mas de la mitad de las palabras transcritas son erroneas en el conjunto de evaluacion declarado.
- Dataset de entrenamiento y evaluacion no documentados: imposible reproducir los resultados ni conocer la distribucion de dominio.
- Idiomas no especificados: no se puede asumir soporte multilingue ni monoclingue concreto.
- Sesgos desconocidos: al no documentarse los datos, no se pueden evaluar sesgos de acento, genero, edad o dialecto.
- Riesgo de alucinacion: los modelos Whisper pueden generar texto plausible en silencios o ruido; sin evaluacion especifica, el riesgo persiste.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de garantias y de documentacion hace desaconsejable su uso en produccion sin validacion previa.
- Model card autogenerada y sin revisar: el propio autor indica que debe completarse; la informacion tecnica es minima.
- Traccion muy baja (62 descargas, 0 likes): no hay comunidad, issues ni soporte.
- Fecha de creacion futura (2026-10-31): inconsistencia en los metadatos que conviene verificar antes de confiar en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/igunosalabs/Unose-Huen-Small-Gen2
- Modelo base: https://huggingface.co/igunosalabs/Unose-Huen-Small
- Repositorio de Whisper (arquitectura de referencia): https://github.com/openai/whisper
- Documentacion de la pipeline ASR de transformers: https://huggingface.co/docs/transformers/tasks/asr
