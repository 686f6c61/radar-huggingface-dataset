# smajji/nemotron-hinglish-v5

## Resumen

Nemotron-Hinglish-v5 es un modelo de reconocimiento automatico del habla (ASR) publicado por el usuario smajji en HuggingFace, obtenido mediante ajuste fino supervisado de `nvidia/nemotron-3.5-asr-streaming-0.6b`. Su objetivo especifico es transcribir audio en ingles, hindi y, sobre todo, hinglish (code-switching hindi-ingles), un escenario muy frecuente en India y mal cubierto por los modelos ASR genericos. Conserva la arquitectura FastConformer-Transducer (RNNT) con atencion cache-aware para streaming, 24 capas, 1024 dimensiones ocultas y aproximadamente 600 millones de parametros, con una entrada de audio mono a 16 kHz.

La aportacion principal de la version v5 respecto a la v4 es la correccion del denominado "Devanagari latch": en la version anterior, el habla en ingles con acento indio se transcribia erroneamente a escritura devanagari en hindi. Para ello se anadieron unas 187 horas de ingles con acento indio (IndicTTS-English y datos de tareas ASR), lo que reduce el porcentaje de transcripciones en devanagari del 19,5 % al 0,0 % y baja el WER en ese subconjunto del 22,2 % al 8,3 %. Ademas, se incorporaron corpus densos en numeros y simbolos para mejorar la precision en digitos y numeros de telefono.

El modelo es relevante para quienes necesitan ASR en tiempo real en entornos multilingues con mezcla de idiomas dentro de una misma frase, y para despliegues con requisitos de licencia permisiva. Se distribuye bajo licencia Apache-2.0, pesa 2,6 GB en el repositorio y, en el momento de redactar esta ficha, no cuenta con descargas ni validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-Transducer (RNNT) con atencion cache-aware para streaming y subsampling 8x |
| Parametros totales | ~600 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; audio de entrada sin limite practico gracias al streaming cache-aware, con tamanos de chunk configurables de 80, 160, 320, 560 y 1120 ms |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas en el repositorio) |
| Idiomas soportados | Ingles (en), hindi (hi) y hinglish (code-switching hindi-ingles, mediante el prompt `auto`); vocabulario BPE de 13088 tokens y 128 prompts de idioma |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint `.nemo` de NVIDIA NeMo (pesos PyTorch); no se publican safetensors ni GGUF |
| Frecuencia de muestreo | 16 kHz, mono |
| Modelo base | nvidia/nemotron-3.5-asr-streaming-0.6b |
| Libreria | NeMo (`nemo.collections.asr`) |
| Tamano del repositorio | 2,6 GB |

## Arquitectura y entrenamiento

La arquitectura es un transductor FastConformer (RNNT) con atencion cache-aware, disenado para reconocimiento del habla en streaming. El encoder aplica un factor de subsampling de 8x sobre el audio de entrada a 16 kHz y consta de 24 capas con 1024 unidades ocultas, lo que da un total de unos 600 millones de parametros. El decodificador es un transductor recurrente con vocabulario BPE de 13088 tokens y 128 prompts de idioma, incluido el prompt `auto` que realiza deteccion automatica de idioma y permite gestionar el code-switching sin indicar el idioma de antemano. El mecanismo de cache permite procesar audio de duracion arbitraria con latencia controlada segun el tamano de chunk elegido.

El ajuste fino parte del checkpoint base de NVIDIA y se ha realizado sobre una mezcla bilingue y de codigo mezclado que incluye SPGISpeech, IISc_SPICOR, Peoples Speech, TEDLIUM, earnings22, SPRING Hindi, Shrutilipi, IndicVoices-R, FLEURS (en e hi), UJS mas Hinglish-CC y OpenSLR Hinglish, con corpus densos en numeros y simbolos anadidos especificamente para mejorar la precision en digitos y numeros de telefono. A esta mezcla se sumaron aproximadamente 187 horas de ingles con acento indio procedentes de IndicTTS-English y datos de tareas ASR, con el fin de reequilibrar el modelo hacia la salida en escritura latina. El entrenamiento usa el prompt `auto` para autodeteccion de idioma y preserva puntuacion y capitalizacion en la salida. No se documenta en la model card el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Transcripcion de voz a texto en ingles, hindi y hinglish con mezcla de idiomas dentro de una misma frase.
- Reconocimiento en streaming con atencion cache-aware y tamanos de chunk de 80, 160, 320, 560 y 1120 ms, lo que permite ajustar el compromiso entre latencia y precision.
- Deteccion automatica de idioma mediante el prompt `auto`, sin necesidad de especificar el idioma de entrada.
- Salida con puntuacion y capitalizacion preservadas.
- Mejora especifica en digitos, numeros y numeros de telefono gracias a los corpus densos en numeros anadidos.
- Salida en escritura latina para ingles con acento indio (correccion del Devanagari latch de la version v4).
- Soporte de 128 prompts de idioma heredados del modelo base, aunque el ajuste fino se centra en en, hi y hinglish.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, vision, tool calling ni uso como agente; es exclusivamente un modelo ASR.

## Casos de uso

- Transcripcion de centros de contacto en India: el modelo gestiona conversaciones donde el agente y el cliente alternan hindi e ingles en la misma frase, con el prompt `auto` evitando tener que fijar un idioma por turno.
- Subtitulado en directo de emisiones y eventos: con chunks de 80 a 320 ms se puede alimentar un pipeline de subtitulos con latencia baja, y la salida con puntuacion y mayusculas reduce el postprocesado.
- Notas clinicas o legales dictadas: la precision en numeros y la preservacion de puntuacion facilitan la transcripcion de dosis, fechas y cifras en entornos profesionales.
- Analitica de llamadas y cumplimiento normativo: al ser un modelo de 600 M de parametros puede desplegarse en GPUs modestas para transcribir grandes volumenes de audio por lotes a coste reducido.
- Asistentes de voz para usuarios indios: el modelo evita el error de devolver texto en devanagari cuando el usuario habla ingles con acento indio, lo que evita fallos en la siguiente etapa del pipeline (TTS o busqueda).
- Transcripcion de reuniones y entrevistas multilingues: los corpus de TEDLIUM, earnings22 y FLEURS cubren registros formales, y el vocabulario de 13088 tokens maneja terminologia tecnica y de negocio.
- Procesado de audio de telefonia: la mejora en secuencias de digitos es util para verificacion de identidad por voz y para extraer numeros de cuenta o de telefono de grabaciones.
- Despliegue en infraestructura propia con fines comerciales: la licencia Apache-2.0 permite integrar el modelo en productos propietarios sin obligaciones de redistribucion del codigo.

## Benchmarks y rendimiento

Resultados publicados en la model card. Decodificacion greedy, WER insensible a la puntuacion, muestra reservada, prompt `auto`:

| Idioma | Nemotron-Hinglish-v4 | Nemotron-Hinglish-v5 |
|---|---|---|
| Ingles | 4,0 % | 4,2 % |
| Hindi | 12,0 % | 12,5 % |
| Hinglish | 29,2 % | 28,6 % |

Subconjunto de ingles con acento indio (200 enunciados reservados, detector del Devanagari latch):

| Metrica | Nemotron-Hinglish-v4 | Nemotron-Hinglish-v5 |
|---|---|---|
| Devanagari latch (% de ingles indio transcrito en devanagari) | 19,5 % | 0,0 % |
| WER | 22,2 % | 8,3 % |

No se han publicado resultados comparativos frente a otros modelos ASR en la informacion disponible, ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,4 GB solo para pesos en FP32 y unos 1,2 GB en FP16/BF16; con cache de streaming, activaciones y procesamiento por lotes conviene reservar entre 4 y 8 GB.
- Cabe en GPUs de consumo: RTX 3060, RTX 4060, RTX 4070, RTX 4090 y similares con 8 GB o mas. En FP16 puede ejecutarse en GPUs con 4 GB si el lote es pequeno.
- Inferencia en CPU: viable por el tamano del modelo, aunque no se publican cifras de latencia; es adecuada para transcripcion por lotes no critica en tiempo real.
- GPUs de centro de datos como A100, H100 o L40S permiten lotes grandes y maximizar el throughput para transcripcion masiva, aunque estan sobredimensionadas para un modelo de 600 M de parametros.
- Opciones de despliegue: NVIDIA NeMo (`nemo.collections.asr`), con `ASRModel.restore_from("smajji/nemotron-hinglish-v5")`; el modelo base es compatible con NVIDIA Riva para despliegue en produccion. vLLM, llama.cpp, Ollama y TGI no aplican, ya que son motores para modelos de lenguaje y no para transductores ASR.
- Conversiones: no se publican pesos GGUF ni ONNX en el repositorio; cualquier exportacion a otros runtimes (por ejemplo ONNX o sherpa-onnx) requiere realizarla por cuenta propia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smajji/nemotron-hinglish-v5 | ~600 M | en, hi, hinglish | Si, cache-aware con chunks de 80-1120 ms | Apache-2.0 | HuggingFace, formato `.nemo` |
| nvidia/nemotron-3.5-asr-streaming-0.6b | ~600 M | en, hi y otros prompts multilingues del modelo base | Si, cache-aware | Apache-2.0 | HuggingFace, formato `.nemo` |
| openai/whisper-large-v3 | ~1550 M | Multilingue (99 idiomas), sin soporte especifico de hinglish | No, procesamiento por ventanas de 30 s | Apache-2.0 | HuggingFace, safetensors; amplia disponibilidad en motores de inferencia |
| ai4bharat/indic-conformer-600m-multilingual | ~600 M | Idiomas indios | Si, Conformer con atencion por chunks | no disponible | HuggingFace, formato NeMo |

El modelo de smajji es el unico de la comparativa con ajuste explicito para hinglish y con el problema del Devanagari latch documentado y corregido. Whisper large-v3 ofrece mayor cobertura de idiomas y un ecosistema de despliegue mucho mas amplio, pero no es un modelo de streaming y su tamano triplica el de este. Los modelos de NVIDIA y AI4Bharat comparten arquitectura y orden de magnitud de parametros, por lo que la eleccion depende del dominio de audio concreto; no hay resultados de WER comparables publicados en la informacion disponible.

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes en el momento de redactar la ficha: no existe validacion independiente ni reportes de terceros sobre su comportamiento en produccion.
- La mejora del hinglish es modesta: el WER baja solo del 29,2 % al 28,6 %, y el ingles empeora ligeramente (del 4,0 % al 4,2 %) y el hindi tambien (del 12,0 % al 12,5 %) respecto a la v4.
- El WER en hinglish, en torno al 28,6 %, sigue siendo alto para aplicaciones que requieran transcripcion literal exacta.
- La evaluacion publicada se basa en muestras reservadas no descritas en detalle (200 enunciados en el caso del ingles con acento indio), por lo que la generalizacion a otros dominios y acentos no esta cuantificada.
- Riesgo de alucinacion y de sustitucion de palabras en audio con ruido, solapamiento de hablantes o vocabulario muy especializado, inherente a los modelos RNNT.
- Sesgo de dominio: el entrenamiento se apoya en corpus como TEDLIUM, earnings22 o SPGISpeech, de registro formal o profesional; el rendimiento en habla coloquial, dialectos regionales o audio de muy baja calidad no esta documentado.
- Aunque el modelo base declara 128 prompts de idioma, el ajuste fino se centra en en, hi y hinglish; el uso de otros prompts puede degradar la calidad de forma impredecible.
- No se publican pesos en formato safetensors, GGUF ni ONNX, lo que limita el despliegue fuera del ecosistema NeMo.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero exige conservar el aviso de licencia y no concede derechos de marca; conviene revisar las condiciones de los corpus de entrenamiento si se redistribuye el modelo.
- Requiere audio mono a 16 kHz; otras frecuencias o configuraciones multicanal necesitan remuestreo previo.
- La model card no documenta el uso de tecnicas de alineacion como RLHF o DPO, ni medidas de mitigacion de sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smajji/nemotron-hinglish-v5
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- NVIDIA NeMo (repositorio y documentacion del framework necesario para cargar el checkpoint): https://github.com/NVIDIA/NeMo
- No se han encontrado en la busqueda web enlaces adicionales relevantes (papers, blogs, demos o repos) asociados a este modelo.
