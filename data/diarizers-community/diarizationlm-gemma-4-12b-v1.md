# diarizers-community/DiarizationLM-Gemma-4-12B-v1

## Resumen

DiarizationLM-Gemma-4-12B-v1 es un modelo de lenguaje especializado en el post-procesado de salidas de sistemas de reconocimiento automático del habla (ASR) y de diarización de hablantes. Lo desarrolla la comunidad `diarizers-community` a partir del modelo fundacional `google/gemma-4-12B`, un transformer denso de aproximadamente 12.000 millones de parámetros. Su función no es transcribir audio directamente, sino corregir y optimizar transcripciones ya etiquetadas por hablante, reduciendo errores de atribución y mejorando la coherencia de los turnos de conversación.

El modelo implementa el marco DiarizationLM descrito en el paper arXiv:2401.03506, que plantea el refinamiento de la diarización como una tarea de generación de texto: se le entrega una transcripción con etiquetas de hablante y el modelo devuelve una versión corregida. Esta versión de 12B se entrena con datos sintéticos multilingües y se publica junto a variantes de 4B (E4B-v1 y E4B-v2), lo que permite elegir entre calidad y coste de inferencia.

Es relevante porque cubre un hueco práctico: los pipelines de ASR y diarización open source cometen errores sistemáticos en la asignación de hablantes, y un post-procesador basado en LLM reduce métricas como WDER y cpWER de forma medible y estadísticamente significativa, sin necesidad de reentrenar el sistema de diarización completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4), pipeline `image-text-to-text` en transformers |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (etiquetado como `long-context`) |
| Tipos de cuantizacion | bfloat16 (safetensors) y GGUF Q4_K_M; otras cuantizaciones no confirmadas |
| Idiomas soportados | Multilingue segun la model card; lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16, ~23,9 GB) y GGUF Q4_K_M (~7,38 GB) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B`, un transformer denso de decodificador con unos 12B de parámetros. Sobre esa base se aplica un ajuste específico para la tarea DiarizationLM: el modelo recibe una transcripción con marcas de hablante y genera la transcripción corregida, incluyendo reasignaciones de turno y correcciones de texto. La model card indica que se entrena del mismo modo que `DiarizationLM-Gemma-4-E4B-v2`, empleando datos sintéticos no ingleses para dotar de soporte multilingüe.

No se detallan en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Tampoco se especifican innovaciones de decodificación (por ejemplo, decodificación especulativa) más allá del uso del marco DiarizationLM y de la variante de prompting LG-TPST empleada en los benchmarks. El repositorio incluye `chat_template.jinja` y `processor_config.json`, lo que sugiere un uso conversacional con plantilla de chat y soporte multimodal heredado del modelo base.

## Capacidades

- Post-procesado de transcripciones ASR con etiquetas de hablante: corrige asignaciones erróneas y mejora la coherencia de turnos.
- Refinamiento de diarización multi-hablante en conversaciones (reuniones, llamadas, entrevistas).
- Generación de texto y razonamiento heredados del modelo base Gemma 4 12B.
- Soporte multilingüe mediante entrenamiento con datos sintéticos no ingleses (idiomas concretos no especificados).
- Integración con pipelines de ASR y diarización open source a través de las librerías `diarizers` y `diarizationlm`.
- Compatibilidad con `transformers`, `llama.cpp`, Ollama y `llama-cpp-python` gracias a los pesos GGUF.
- Capacidad multimodal declarada por el pipeline `image-text-to-text` del modelo base (no validada para la tarea de diarización).
- No se documenta soporte explícito de tool calling ni de modo thinking en la información disponible.

## Casos de uso

- Post-procesado de actas de reuniones: se ejecuta el modelo sobre la salida de un sistema de diarización (por ejemplo, pyannote + Whisper) para corregir turnos mal asignados antes de generar el acta, aprovechando la reducción de WDER observada en AMI e ICSI.
- Transcripción de llamadas de atención al cliente: el modelo reasigna hablantes en conversaciones de dos personas (Fisher, Callhome) y mejora la separación agente/cliente, lo que facilita el análisis posterior y el cumplimiento normativo.
- Investigación en diarización: sirve como componente de referencia para comparar mejoras de frontends de diarización, dado que la model card publica intervalos de confianza bootstrap y tests pareados.
- Generación de subtítulos con hablante identificado: en contenido multimedia con múltiples interlocutores, el modelo corrige etiquetas antes de publicar subtítulos, reduciendo el coste de revisión manual.
- Pipelines de datos para entrenamiento de ASR: se usa para limpiar y etiquetar corpus conversacionales a gran escala antes de reutilizarlos como datos de entrenamiento.
- Despliegue en local con cuantización Q4_K_M: el GGUF de ~7,38 GB permite ejecutar el post-procesado en estaciones de trabajo sin GPU de datacenter, integrándolo en herramientas de transcripción de escritorio.
- Análisis de reuniones clínicas o legales: la mejora de cpWER en ICSI (43,21 frente a 43,90 de la línea base) resulta útil cuando la atribución correcta de intervenciones es crítica.

## Benchmarks y rendimiento

Resultados publicados en la model card con frontend USM + Turn-to-Diarize (intervalos de confianza bootstrap al 95%):

| Benchmark | Sistema | WER (%) | WDER (%) [95% CI] | cpWER (%) [95% CI] | SpkCntMAE [95% CI] |
|---|---|---|---|---|---|
| Fisher (172 sesiones) | Baseline | 15,37 | 5,32 [4,93; 5,74] | 20,88 [19,97; 21,88] | 0,215 [0,151; 0,291] |
| Fisher | DiarizationLM-8b-Fisher-v2 (Llama 3 8B) | 15,37 | 3,28 | 18,37 | no disponible |
| Fisher | DiarizationLM-Gemma-4-E4B-v1 (4B) | 15,37 | 2,99 [2,65; 3,37] | 17,62 [16,76; 18,56] | 0,093 [0,047; 0,145] |
| Fisher | DiarizationLM-Gemma-4-E4B-v2 (4B) | 15,37 | 3,03 [2,70; 3,40] | 17,63 [16,77; 18,55] | 0,105 [0,058; 0,157] |
| Fisher | **DiarizationLM-Gemma-4-12B-v1** | 15,37 | **2,89 [2,56; 3,27]** | **17,44 [16,57; 18,36]** | **0,087 [0,041; 0,140]** |
| Callhome (20 llamadas) | Baseline | 15,22 | 7,74 [6,07; 9,65] | 24,31 [21,27; 27,43] | 0,050 [0,000; 0,150] |
| Callhome | DiarizationLM-8b-Fisher-v2 | 15,22 | 6,66 | 23,57 | no disponible |
| Callhome | DiarizationLM-Gemma-4-E4B-v1 | 15,22 | **4,92 [3,46; 6,75]** | **20,69 [17,98; 23,66]** | 0,000 |
| Callhome | DiarizationLM-Gemma-4-E4B-v2 | 15,22 | 5,20 [3,58; 7,15] | 21,03 [18,19; 24,08] | 0,000 |
| Callhome | **DiarizationLM-Gemma-4-12B-v1** | 15,22 | 5,01 [3,64; 6,53] | 20,70 [18,11; 23,38] | 0,000 |
| ICSI (3 sesiones) | Baseline | 29,42 | 14,70 [11,65; 20,29] | 43,90 [39,10; 51,67] | 0,333 |
| ICSI | DiarizationLM-Gemma-4-E4B-v1 | 29,42 | 14,10 [10,77; 19,94] | 43,32 [38,38; 51,20] | 0,333 |
| ICSI | DiarizationLM-Gemma-4-E4B-v2 | 29,42 | 13,96 [10,70; 19,26] | 43,28 [38,41; 50,57] | 0,333 |
| ICSI | **DiarizationLM-Gemma-4-12B-v1** | 29,42 | **13,93 [10,49; 19,70]** | **43,21 [38,17; 51,04]** | 0,333 |
| AMI (16 sesiones) | Baseline | 24,33 | 15,68 [10,64; 21,11] | 40,32 [32,43; 48,00] | 0,500 [0,188; 0,812] |
| AMI | DiarizationLM-Gemma-4-E4B-v1 | 24,33 | 14,89 [9,80; 20,38] | 39,57 [31,57; 47,29] | **0,438 [0,188; 0,750]** |
| AMI | DiarizationLM-Gemma-4-E4B-v2 | 24,33 | 14,82 [9,80; 20,04] | 39,54 [31,63; 46,95] | 0,500 [0,188; 0,812] |
| AMI | **DiarizationLM-Gemma-4-12B-v1** | 24,33 | **14,44 [9,27; 19,88]** | **39,09 [31,00; 46,66]** | **0,438 [0,188; 0,750]** |

Mejoras pareadas frente a la línea base del frontend USM + Turn-to-Diarize: -2,43 % de WDER en Fisher (p < 0,0001), -2,73 % en Callhome (p < 0,0001), -0,77 % en ICSI (0/10.000 muestras ≥ 0; n = 3) y -1,24 % en AMI (p < 0,0001).

La model card también incluye resultados con el frontend open source `diarizers` v1.0.1 (Whisper-large-v3-turbo + pyannote/seg-3.0 + ECAPA-TDNN + SpectralClusterer, K=2 fijo) sobre Fisher: la línea base sin post-procesado obtiene WER 20,80 %, WDER 4,35 % y cpWER 24,78; con DiarizationLM-Gemma-4-E4B-v1 se alcanza WDER 2,59 % y cpWER 21,91; con E4B-v2, WDER 2,55 % y cpWER 21,85. La fila correspondiente a este modelo 12B aparece truncada en la información disponible, por lo que no se reproduce su valor.

## Requisitos de hardware

- Pesos bfloat16: ~23,9 GB en disco; para inferencia en GPU se recomienda al menos 24 GB de VRAM (A100 40/80 GB, H100, L40S) y, con margen para contexto largo, 40 GB o más.
- GGUF Q4_K_M: ~7,38 GB; cabe en GPUs de consumo con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080) y puede ejecutarse parcialmente en CPU con llama.cpp.
- Opciones de despliegue: `transformers` (safetensors), `llama.cpp`, Ollama, `llama-cpp-python`; también es compatible con endpoints según la etiqueta `endpoints_compatible`. No se confirma soporte de vLLM o TGI en la información disponible.
- Throughput y latencia: no disponibles en la información proporcionada. Al tratarse de un post-procesado sobre transcripciones, el coste depende de la longitud de la conversación y no del audio original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WDER Fisher (%) | cpWER Fisher (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DiarizationLM-Gemma-4-12B-v1 | ~12B | no disponible | 2,89 | 17,44 | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| DiarizationLM-Gemma-4-E4B-v2 | ~4B | no disponible | 3,03 | 17,63 | Apache 2.0 | Hugging Face |
| DiarizationLM-Gemma-4-E4B-v1 | ~4B | no disponible | 2,99 | 17,62 | Apache 2.0 | Hugging Face |
| DiarizationLM-8b-Fisher-v2 (Llama 3 8B) | ~8B | no disponible | 3,28 | 18,37 | no disponible | Hugging Face |

La comparativa se limita a variantes de la misma familia DiarizationLM, ya que no se dispone de datos de otros post-procesadores de diarización en la información proporcionada.

## Limitaciones y advertencias

- El modelo no transcribe audio: requiere una transcripción ASR y etiquetas de hablante previas; un frontend de diarización deficiente limita la mejora alcanzable.
- Los resultados en ICSI se basan en solo 3 sesiones y los de Callhome en 20 llamadas, por lo que la significación estadística es limitada en esos conjuntos.
- En Callhome, la variante de 4B (E4B-v1) obtiene mejor WDER y cpWER que este modelo de 12B, lo que sugiere que el mayor tamaño no garantiza mejores resultados en todos los dominios.
- Riesgo de alucinación inherente a un LLM: puede alterar texto de la transcripción o inventar turnos al corregir; conviene validar las salidas en producción.
- Sesgos del modelo base Gemma 4 no documentados en la información disponible; el entrenamiento con datos sintéticos no ingleses puede introducir artefactos en idiomas con poca representación.
- La lista concreta de idiomas soportados no está publicada.
- La model card indica explícitamente que no es un producto oficialmente soportado por Google, aunque la licencia Apache 2.0 permite uso comercial.
- El repo pesa 31,3 GB e incluye tanto safetensors como GGUF; conviene descargar solo el formato necesario.
- No se documentan requisitos de latencia ni límites de longitud de contexto efectivos para conversaciones muy largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diarizers-community/DiarizationLM-Gemma-4-12B-v1
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Variante 4B v2: https://huggingface.co/diarizers-community/DiarizationLM-Gemma-4-E4B-v2
- Variante 4B v1: https://huggingface.co/diarizers-community/DiarizationLM-Gemma-4-E4B-v1
- Paper DiarizationLM: https://arxiv.org/abs/2401.03506
- Pipeline open source `diarizers`: https://github.com/diarizers-community/diarizers
- Librería `diarizationlm` (Google speaker-id): https://github.com/google/speaker-id/tree/master/DiarizationLM
