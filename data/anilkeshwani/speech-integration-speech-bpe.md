# anilkeshwani/speech-integration-speech-bpe

## Resumen

Speech BPE models over discrete speech units (MLS English) es una coleccion de tokenizadores BPE entrenados por anilkeshwani para comprimir secuencias de unidades discretas de habla. No es un modelo generativo, sino un conjunto de artefactos de tokenizacion (ficheros `tokenizer.json` de la libreria `tokenizers`) que aplican byte pair encoding sobre las unidades discretas producidas por cuatro tokenizadores de habla distintos: HuBERT Large capa 22 con k-means de 5.000 clusters, SpeechTokenizer RVQ nivel 0, Mimi split-RVQ nivel 0 y FocalCodec a 50 Hz.

El problema que resuelve es concreto: cuando se quiere integrar habla en un modelo de lenguaje como Llama 3.2 1B, las secuencias de unidades discretas son muy largas (cientos de unidades por utterance) y consumen gran parte de la ventana de contexto. Estos tokenizadores BPE fusionan secuencias frecuentes de unidades en unidades mayores, reduciendo la longitud de la secuencia de habla antes de introducirla en el LLM. El vocabulario extendido de Llama recibe un token por cada unidad BPE.

La relevancia es acotada pero tecnica: se trata de un componente de investigacion del proyecto speech-integration del autor, publicado con licencia CC-BY-4.0 y entrenado exclusivamente sobre ingles de Multilingual LibriSpeech. No hay pesos de red neuronal, no hay pipeline de inferencia y no se han publicado benchmarks de tareas downstream en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BPE (byte pair encoding) sobre secuencias de unidades discretas de habla; sin normalizador, sin pre-tokenizer, sin post-processor y sin tokens especiales |
| Parametros totales | no disponible (no es un modelo neuronal; el artefacto es una lista de fusiones BPE) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; la longitud se mide en unidades de habla por utterance) |
| Tipos de cuantizacion | no disponible (el artefacto es un fichero `tokenizer.json`; no hay pesos que cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | `tokenizer.json` (Hugging Face `tokenizers`), mas `speech_bpe.json` con metadatos y `validation_compression.json` con estadisticas |

Variantes incluidas, con su codebook de entrada y tamano de vocabulario BPE:

| Variante | Tokenizador de habla de origen | Codebook de entrada | Unidades BPE |
|---|---|---|---|
| `hubert_large_ll60k-layer_22-bpe16384` | HuBERT Large LL60k, capa 22, k-means | 5.000 | 16.384 |
| `speechtokenizer-rvq_0-bpe16384` | SpeechTokenizer RVQ nivel 0 | 1.024 | 16.384 |
| `mimi-srvq_0-bpe16384` | Mimi split-RVQ nivel 0 | 2.048 | 16.384 |
| `focalcodec-bpe16384` | FocalCodec 50 Hz | 8.192 | 16.384 |
| `mimi-srvq_0-bpe4096` | Mimi split-RVQ nivel 0 | 2.048 | 4.096 |
| `mimi-srvq_0-bpe8192` | Mimi split-RVQ nivel 0 | 2.048 | 8.192 |
| `mimi-srvq_0-bpe32768` | Mimi split-RVQ nivel 0 | 2.048 | 32.768 |

## Arquitectura y entrenamiento

Cada tokenizador es un modelo BPE puro de la libreria `tokenizers`, sin normalizador, sin pre-tokenizer, sin post-processor y sin tokens especiales. Las unidades discretas de habla se codifican como caracteres Unicode: la unidad `i` (de 0 a `n_dsus - 1`) se escribe como `chr(0xF0000 + i)`, en la Supplementary Private Use Area-A, de modo que una secuencia de unidades es una cadena con un caracter por unidad. Tras el entrenamiento, los identificadores se renumeran para que la unidad BPE `i` coincida con la unidad de habla simple `i` cuando `i < n_dsus`; las unidades fusionadas se colocan a continuacion.

El entrenamiento se realizo sobre MLS English (Multilingual LibriSpeech). Los volumenes varian por variante: 250.000 utterances y 129.889.222 unidades tras deduplicacion para HuBERT Large capa 22; 250.000 utterances y 112.744.234 unidades para SpeechTokenizer RVQ 0; 500.000 utterances y 86.329.893 unidades para Mimi split-RVQ 0; y 100.000 utterances y 74.112.316 unidades para FocalCodec. Las variantes `mimi-srvq_0-bpe4096` y `mimi-srvq_0-bpe8192` no se entrenan por separado: son los primeros 2.048 y 6.144 merges del modelo de 16.384 unidades, respectivamente. La variante de 32.768 se entreno de forma independiente con 500.000 utterances. En el pipeline del proyecto, la secuencia de unidades almacenada se deduplica primero (runs del mismo simbolo colapsados a uno) y despues se codifica con el modelo BPE.

Los ratios de compresion medidos sobre el split de validacion completo de MLS (3.807 utterances, total de unidades deduplicadas dividido por total de unidades BPE) son: 1,720 para HuBERT Large capa 22 (longitud media de entrada 522,6, media de salida 303,9, 16.296 unidades usadas); 2,441 para SpeechTokenizer RVQ 0 (451,3 de entrada, 184,9 de salida, 16.325 usadas); 1,529 para Mimi split-RVQ 0 a 16.384 (174,4 de entrada, 114,1 de salida, 16.027 usadas); y 1,008 para FocalCodec (742,1 de entrada, 736,0 de salida, 15.281 usadas). El autor descarta FocalCodec para la comparacion prevista precisamente por su compresion casi nula (1,01x).

## Capacidades

- Tokenizacion BPE de secuencias de unidades discretas de habla procedentes de cuatro tokenizadores distintos (HuBERT, SpeechTokenizer, Mimi y FocalCodec).
- Compresion configurable de la secuencia de habla mediante truncado de la lista de merges: por ejemplo, Mimi pasa de 1,255x con 4.096 unidades a 1,663x con 32.768.
- Codificacion reversible a nivel de simbolo: cada unidad de habla se mapea a un caracter Unicode del area privada, lo que permite tratar la secuencia como texto plano.
- Integracion con vocabularios de LLM: el vocabulario extendido de Llama 3.2 1B en el proyecto speech-integration reserva un token por unidad BPE.
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni modo thinking: es exclusivamente un componente de tokenizacion.
- Capacidad multilingue limitada al ingles (MLS English); no hay variantes para otros idiomas.

## Casos de uso

- Integracion de habla en LLM con ventana de contexto limitada: al reducir la secuencia de unidades de habla entre 1,5x y 2,4x segun el tokenizador, permite introducir mas audio por muestra de entrenamiento en Llama 3.2 1B sin agotar el contexto. Es el uso original del proyecto.
- Preprocesado de corpus de habla para entrenamiento: aplicar el tokenizador sobre las unidades almacenadas en los datasets `mls-*` para generar secuencias de entrenamiento mas cortas y homogeneas antes de alimentar un modelo.
- Experimentacion con vocabularios de habla discretizada: la ablacion de Mimi a 4.096, 8.192, 16.384 y 32.768 unidades permite estudiar el compromiso entre compresion y tamano de vocabulario en un mismo pipeline.
- Comparativa de tokenizadores de habla: al compartir metodologia y split de validacion, los cuatro modelos permiten comparar HuBERT, SpeechTokenizer, Mimi y FocalCodec en terminos de compresibilidad de sus unidades.
- Reduccion de coste de almacenamiento y ancho de banda en pipelines de habla: una secuencia de unidades BPE ocupa menos simbolos que la secuencia original deduplicada, lo que reduce el volumen de datos serializados.
- Reproduccion de investigacion: los ficheros `speech_bpe.json` incluyen dataset de origen, tamano de codebook, semilla de muestreo, numero de utterances y unidades de entrenamiento, version del trainer, commit y comando de git, lo que facilita replicar el entrenamiento.

## Benchmarks y rendimiento

Los unicos datos publicados son estadisticas de compresion sobre el split de validacion de MLS (3.807 utterances), no resultados de tareas downstream.

| Modelo | Unidades BPE | Media entrada | Media salida | p95 | Max | Compresion | Unidades usadas |
|---|---|---|---|---|---|---|---|
| `hubert_large_ll60k-layer_22-bpe16384` | 16.384 | 522,6 | 303,9 | 425 | 530 | 1,720 | 16.296 |
| `speechtokenizer-rvq_0-bpe16384` | 16.384 | 451,3 | 184,9 | 262 | 457 | 2,441 | 16.325 |
| `mimi-srvq_0-bpe16384` | 16.384 | 174,4 | 114,1 | 161 | 201 | 1,529 | 16.027 |
| `focalcodec-bpe16384` | 16.384 | 742,1 | 736,0 | 958 | 993 | 1,008 | 15.281 |
| `mimi-srvq_0-bpe4096` | 4.096 | 174,4 | 139,0 | 190 | 219 | 1,255 | 4.051 |
| `mimi-srvq_0-bpe8192` | 8.192 | 174,4 | 124,9 | 175 | 209 | 1,396 | 8.141 |
| `mimi-srvq_0-bpe32768` | 32.768 | 174,4 | 104,9 | 149 | 193 | 1,663 | 29.012 |

Compresion con listas de merges truncadas (extracto representativo):

| Modelo | Unidades BPE | Media salida | p95 | Max | Compresion |
|---|---|---|---|---|---|
| `hubert_large_ll60k-layer_22-bpe16384` | 10.000 | 348,0 | 479 | 579 | 1,502 |
| `hubert_large_ll60k-layer_22-bpe16384` | 15.000 | 310,1 | 433 | 538 | 1,685 |
| `speechtokenizer-rvq_0-bpe16384` | 2.048 | 297,8 | 406 | 587 | 1,515 |
| `speechtokenizer-rvq_0-bpe16384` | 4.096 | 242,9 | 336 | 540 | 1,857 |
| `speechtokenizer-rvq_0-bpe16384` | 8.192 | 209,6 | 294 | 507 | 2,153 |
| `mimi-srvq_0-bpe16384` | 6.144 | 130,2 | 180 | 212 | 1,340 |

No se han publicado resultados de benchmarks de tareas (ASR, traduccion, comprension de habla) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: practicamente nula. El artefacto es un fichero `tokenizer.json` con una lista de merges; la codificacion se ejecuta en CPU.
- GPU recomendadas: no aplica. Cualquier CPU es suficiente para aplicar el tokenizador; no hay pesos de red que cargar en GPU.
- Cabe en cualquier consumer GPU y en cualquier equipo sin GPU: el cuello de botella es la memoria RAM necesaria para cargar el vocabulario (del orden de decenas de miles de entradas como maximo).
- Opciones de despliegue: libreria `tokenizers` de Hugging Face (carga directa de `tokenizer.json`). No es compatible con vLLM, llama.cpp, Ollama ni TGI como modelo, porque no es un modelo generativo; en su caso, se integraria en el pipeline de preprocesado previo a esos motores.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser una tokenizacion BPE sobre cadenas de caracteres, la latencia esperada es del orden de microsegundos a milisegundos por utterance, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No hay modelos directamente comparables en la informacion disponible: se trata de tokenizadores BPE especificos de unidades de habla discretas, no de modelos de lenguaje. La comparativa mas cercana es interna, entre las cuatro variantes segun el tokenizador de habla de origen.

| Variante | Codebook de entrada | Unidades BPE | Compresion (dev MLS) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hubert_large_ll60k-layer_22-bpe16384` | 5.000 | 16.384 | 1,720 | cc-by-4.0 | Hugging Face |
| `speechtokenizer-rvq_0-bpe16384` | 1.024 | 16.384 | 2,441 | cc-by-4.0 | Hugging Face |
| `mimi-srvq_0-bpe16384` | 2.048 | 16.384 | 1,529 | cc-by-4.0 | Hugging Face |
| `focalcodec-bpe16384` | 8.192 | 16.384 | 1,008 | cc-by-4.0 | Hugging Face |

## Limitaciones y advertencias

- Solo ingles: entrenado sobre MLS English; no hay garantia de comportamiento sobre unidades de habla de otros idiomas.
- FocalCodec apenas comprime (1,008x), por lo que el autor lo excluye de la comparacion prevista; usarlo aporta poco valor practico.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa de inferencia generativa es un error de uso.
- Dependencia estricta del tokenizador de habla de origen: cada BPE solo es valido para las unidades del tokenizador con el que se entreno (HuBERT capa 22, SpeechTokenizer RVQ 0, Mimi split-RVQ 0 o FocalCodec 50 Hz). Mezclar unidades de otro tokenizador produce resultados invalidos.
- El uso de caracteres en la Supplementary Private Use Area-A puede requerir cuidado en pipelines que normalicen o filtren Unicode.
- Los BPE de 4.096 y 8.192 unidades de Mimi son truncamientos del modelo de 16.384, no entrenamientos independientes; su comportamiento esta acoplado a la lista de merges original.
- Riesgo de sesgo y alucinacion: no aplica directamente al ser un tokenizador, pero los sesgos del corpus MLS English se propagan a traves de las unidades que se comprimen.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; no hay clausulas de uso restrictivo adicionales en la informacion disponible.
- Los README generados por el script de entrenamiento contienen rutas del host de entrenamiento, no reproducibles tal cual en otro entorno.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anilkeshwani/speech-integration-speech-bpe
- Dataset HuBERT Large capa 22: https://huggingface.co/datasets/anilkeshwani/mls-hubert_large_ll60k-layer_22
- Dataset SpeechTokenizer RVQ 0: https://huggingface.co/datasets/anilkeshwani/mls-speechtokenizer-rvq_0
- Dataset Mimi split-RVQ 0: https://huggingface.co/datasets/anilkeshwani/mls-mimi-srvq_0
- Dataset FocalCodec: https://huggingface.co/datasets/anilkeshwani/mls-focalcodec
- Paper de referencia (arXiv:2012.03411): https://arxiv.org/abs/2012.03411
