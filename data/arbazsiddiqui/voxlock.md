# arbazsiddiqui/voxlock

## Resumen

VoxLock es un modelo de aislamiento de voz (voice isolation) publicado en Hugging Face por el desarrollador independiente arbazsiddiqui. Su funcion es separar la voz del interlocutor principal (el "caller") del resto de voces presentes en la misma grabacion, de forma que un sistema de reconocimiento automatico de voz (ASR) reciba unicamente la senal del hablante objetivo. A diferencia de un cancelador de ruido clasico, el modelo hace target-speaker extraction: recibe el audio de la llamada como unica entrada y deduce por si mismo cual es la voz que hay que conservar, tomando como referencia los 3 segundos mas fuertes de los primeros 15 segundos de la llamada.

El modelo tiene 27.258.122 parametros y se distribuye bajo licencia Apache-2.0, con pesos en safetensors y ONNX, incluida una version cuantizada a int8. Segun la model card, esta disenado para streaming en CPU con una latencia algoritmica de 24 ms, lo que lo situa en el nicho de agentes de voz, telefonia y atencion al cliente en tiempo real. Declara soporte exclusivo de ingles y parte del encoder de hablante Wespeaker/wespeaker-voxceleb-ecapa-tdnn512, sobre el que se ha afinado.

Su relevancia actual esta en que los benchmarks publicados por el autor lo colocan por delante de alternativas comerciales de pago en la Krisp Voice Isolation Benchmark (WER del 4,95 % frente al 5,30 % de Krisp VI 2.5 Default y al 6,84 % de ai-coustics Voice Focus 2.2 L), con una tasa de fuga de palabras de fondo de 0,11 palabras por minuto, muy inferior a la de casi todos los sistemas comparados. Se trata, por tanto, de una pieza de infraestructura de audio para pipelines de voz, no de un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BSRNN (band-split RNN) condicionada por embedding de hablante; la model card declara como base Wespeaker ECAPA-TDNN512 y etiqueta el modelo con `bsrnn` |
| Parametros totales | 27.258.122 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de audio). Procesa audio a 16 kHz, mono o estereo, y acepta fragmentos de streaming de tamano libre; la referencia de hablante son 3 segundos |
| Tipos de cuantizacion | int8 (version de 8 bits, 75 MB de descarga) y fp32 (version evaluada en los benchmarks) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (con variante ONNX int8 cuantizada) |

## Arquitectura y entrenamiento

VoxLock es un modelo de separacion de fuentes de audio, no un transformer de texto. Los tags de la model card apuntan a una arquitectura BSRNN (band-split RNN) combinada con un encoder de hablante ECAPA-TDNN512 de WeSpeaker, usado como modelo base en la relacion `finetune`. La combinacion tipica de este esquema es: una rama de segmentacion en bandas de frecuencia que modela la senal de audio, condicionada por un embedding de hablante extraido de la muestra de referencia, que permite seleccionar la voz objetivo en lugar de limitarse a suprimir ruido estacionario. El modelo card no detalla el numero exacto de capas, canales ni el mecanismo de condicionamiento, por lo que esos datos figuran como no disponibles.

En cuanto al entrenamiento, la informacion disponible solo declara los datasets openslr/librispeech_asr y edinburghcstr/ami como fuentes de datos, ademas de la mencion de que el checkpoint de partida es "REAL-TSE causal". No se especifica el numero de tokens ni de horas de audio, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO (procedimientos, por otra parte, propios de modelos de lenguaje y no aplicables directamente aqui). El modelo declara explicitamente que las ventanas de AMI usadas en la evaluacion son "held-out", es decir, no vistas en entrenamiento.

La innovacion tecnica principal que reivindica el autor es la relacion entre calidad de aislamiento y latencia: 24 ms de latencia algoritmica en streaming sobre CPU, con salida lista para alimentar un ASR en tiempo real. El paquete se distribuye con soporte para PyTorch, ONNX Runtime, cuantizacion int8, WebAssembly y integracion con Pipecat.

## Capacidades

- Aislamiento de voz objetivo: conserva la voz del interlocutor principal y elimina otras voces presentes en la misma sala o linea.
- Cancelacion de voz de fondo: reduce la fuga de palabras de hablantes secundarios, con 0,11 palabras filtradas por minuto en la Krisp benchmark y 2,12 en AMI.
- Seleccion automatica del hablante objetivo sin etiquetado manual: toma como referencia los 3 segundos mas fuertes de los primeros 15 segundos de la llamada; el usuario puede pasar su propia muestra con el parametro `sample=`.
- Procesamiento en streaming: acepta fragmentos de audio de 16 kHz en float32 de cualquier tamano y devuelve el audio aislado listo, con unos 24 ms de latencia algoritmica.
- Procesamiento por lotes: la CLI `voxlock call.wav -o caller.wav` procesa ficheros completos y devuelve una salida de la misma longitud que la entrada.
- Entrada flexible: cualquier frecuencia de muestreo de entrada, mono o estereo.
- Extraccion de hablante (speaker extraction / target-speaker extraction), segun los tags del modelo.
- Ejecucion en CPU y en navegador mediante WebAssembly.
- No declara soporte de tool calling, function calling, agentes multi-paso, vision, audio generativo ni modos de razonamiento: son capacidades ajenas a su tipo.

## Casos de uso

- Atencion al cliente en telefonía: el modelo se coloca delante del ASR del contact center y elimina las voces de fondo del lado del cliente (television, familiares, oficina compartida) antes de transcribir. Con 24 ms de latencia algoritmica y ejecucion en CPU, encaja en un pipeline de llamada en vivo sin necesidad de GPU.
- Agentes de voz en tiempo real: integrable con frameworks de orquestacion de voz como Pipecat para que el agente solo reciba la voz del usuario y no dispare falsos turnos por conversaciones de fondo.
- Transcripcion de reuniones y salas: en escenarios tipo AMI, donde varios participantes comparten microfonos de mesa, el modelo aisla la voz del portador del auricular o del hablante de referencia, reduciendo el WER del 33,03 % sin procesar al 10,12 %.
- Preprocesado de ASR para subtitulado y actas: al reducir la fuga de palabras de fondo (de 78,34 a 2,12 palabras por minuto en AMI), evita que aparezcan frases de terceros en la transcripcion final.
- Grabacion y postprocesado de llamadas: la CLI permite limpiar ficheros de audio ya grabados antes de archivarlos o de alimentar sistemas de analitica de conversaciones.
- Despliegue en el navegador: la variante WebAssembly y el espacio de demostracion de Hugging Face permiten ejecutar el aislamiento en el cliente, sin enviar audio a un servidor, lo que simplifica el cumplimiento de requisitos de privacidad.
- Deteccion y extraccion de hablante en entornos ruidosos: como target-speaker extraction, puede usarse para recuperar la pista de un hablante concreto en grabaciones multitudinarias cuando se dispone de una muestra de su voz.
- Redaccion de audio con terceros: al suprimir las voces no objetivo, ayuda a evitar la difusion de conversaciones ajenas captadas de forma incidental en una grabacion.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente; `verified: false` en la model-index).

Krisp Voice Isolation Benchmark, 265 grabaciones reales, transcritas con Parakeet TDT 0.6B v2:

| Modelo | Acceso | WER % | Palabras de fondo filtradas / min |
|---|---|---|---|
| VoxLock | abierto | 4,95 | 0,11 |
| Krisp VI 2.5 Default | de pago | 5,30 | 1,52 |
| Krisp VI 2.5 Balanced | de pago | 5,32 | 2,02 |
| Krisp VI 2.5 HD | de pago | 5,79 | 2,74 |
| Krisp VI 2.5 Lite | de pago | 6,21 | 4,52 |
| ai-coustics Voice Focus 2.2 L | de pago | 6,84 | 0,66 |
| ai-coustics Voice Focus 2.2 S | de pago | 6,91 | 1,00 |
| Sanas Voice Isolation SE 1.0 | de pago | 9,38 | 13,76 |
| REAL-TSE causal (checkpoint de partida de VoxLock) | abierto | 9,81 | 13,73 |
| Hush | abierto | 12,09 | 19,58 |
| DeepFilterNet3 | abierto | 13,30 | 22,77 |
| TIGER | abierto | 14,72 | 37,24 |
| Sin procesar | — | 23,21 | 66,48 |
| SAM-Audio small (Meta) | abierto | 33,77 | 21,15 |
| ElevenLabs Voice Isolator | de pago | 43,79 | 144,6 |

Nota del autor: ElevenLabs Voice Isolator se ejecuto solo sobre las 7 grabaciones con mas voz de fondo, no sobre las 265. En esas mismas 7, sin procesar se obtiene 45,82 % de WER y 154,3 palabras filtradas por minuto, y VoxLock 2,98 % y 0,0.

AMI meetings, portador del auricular como caller, 134 ventanas held-out, transcritas con Parakeet TDT 0.6B v3:

| Modelo | Acceso | WER % | Palabras de fondo filtradas / min |
|---|---|---|---|
| VoxLock | abierto | 10,12 | 2,12 |
| ai-coustics Voice Focus 2.2 S | de pago | 11,85 | 1,06 |
| ai-coustics Voice Focus 2.2 L | de pago | 12,13 | 1,72 |
| Sanas Voice Isolation SE 1.0 | de pago | 13,30 | 5,30 |
| TIGER | abierto | 22,84 | 36,85 |
| DeepFilterNet3 | abierto | 26,78 | 38,84 |
| Hush | abierto | 33,00 | 68,93 |
| Sin procesar | — | 33,03 | 78,34 |

## Requisitos de hardware

- VRAM estimada (calculo propio a partir de los 27.258.122 parametros, no publicada por el autor): unos 109 MB en fp32, unos 55 MB en fp16 y unos 27 MB en int8 solo para los pesos. Con activaciones y buffers de audio, el consumo real es del orden de cientos de MB en CPU y muy por debajo de 1 GB en GPU.
- GPU: cualquier GPU con al menos 1 GB de memoria libre es suficiente; se trata de un modelo que no necesita A100, H100 ni RTX 4090. Estas GPU solo tendrian sentido para procesar muchas llamadas en paralelo por lote.
- Consumer GPU: cabe con holgura en cualquier GPU de consumo, incluidos portatiles con graficos integrados, y el autor afirma que el modelo hace streaming en CPU.
- CPU: soporte explicito de ejecucion en tiempo real sobre CPU, con 24 ms de latencia algoritmica por fragmento.
- Navegador: variante WebAssembly para inferencia en cliente.
- Opciones de despliegue: paquete Python `voxlock` (PyPI), PyTorch nativo, ONNX Runtime, ONNX int8 cuantizado, WebAssembly e integracion con Pipecat. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables a este caso).
- Latencia y throughput: 24 ms de latencia algoritmica declarada por el autor; no se publican cifras de throughput ni de RTF (factor de tiempo real) medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Acceso / licencia | WER % (Krisp) | Fugas / min (Krisp) | WER % (AMI) |
|---|---|---|---|---|---|
| VoxLock | Voice isolation / TSE, BSRNN | Abierto, Apache-2.0 | 4,95 | 0,11 | 10,12 |
| Krisp VI 2.5 (4 variantes) | Voice isolation comercial | De pago, propietario | 5,30-6,21 | 1,52-4,52 | no disponible |
| ai-coustics Voice Focus 2.2 (S y L) | Voice isolation comercial | De pago, propietario | 6,84-6,91 | 0,66-1,00 | 11,85-12,13 |
| Sanas Voice Isolation SE 1.0 | Voice isolation comercial | De pago, propietario | 9,38 | 13,76 | 13,30 |
| DeepFilterNet3 | Cancelacion de ruido / mejora de voz | Abierto, licencia no disponible | 13,30 | 22,77 | 26,78 |
| Hush | Voice isolation | Abierto, licencia no disponible | 12,09 | 19,58 | 33,00 |
| TIGER | Target-speaker extraction | Abierto, licencia no disponible | 14,72 | 37,24 | 22,84 |
| SAM-Audio small (Meta) | Separacion de audio | Abierto, licencia no disponible | 33,77 | 21,15 | no disponible |

En el eje de WER VoxLock lidera tanto en la Krisp benchmark como en AMI. En el eje de fuga de voz de fondo, ai-coustics Voice Focus 2.2 le supera ligeramente en AMI (1,06-1,72 frente a 2,12) y en la Krisp benchmark su variante L queda por detras (0,66 frente a 0,11). La ventaja diferencial frente a los sistemas comerciales es la combinacion de acceso abierto con licencia Apache-2.0, ejecucion en CPU y latencia declarada de 24 ms.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara ingles. No hay datos publicados sobre su comportamiento en castellano u otros idiomas, aunque el aislamiento de voz es en gran medida independiente del idioma; no debe asumirse sin evaluacion propia.
- Seleccion del hablante: el modelo asume que el interlocutor objetivo es quien habla mas fuerte en los primeros 15 segundos de la llamada. Si en ese tramo domina otra persona, o si el caller no habla en ese intervalo, la referencia puede quedar mal elegida. El parametro `sample=` permite corregirlo manualmente.
- Benchmark no verificado: los resultados de la model-index estan marcados como `verified: false`. Proceden del propio autor del modelo y no de una evaluacion independiente.
- Metodologia del benchmark: el WER se mide sobre la transcripcion de un ASR concreto (Parakeet TDT 0.6B v2 y v3), de modo que refleja el rendimiento del pipeline completo, no una metrica pura de separacion de fuentes.
- Comparaciones parciales: la fila de ElevenLabs Voice Isolator se calculo sobre 7 grabaciones en lugar de las 265 del resto, tal como advierte el propio autor. No es una comparacion homogenea.
- Alucinacion: no aplica en el sentido de generacion de texto, pero si existe el riesgo de artefactos o distorsiones en la senal aislada que degraden la transcripcion posterior; no se publican metricas de calidad perceptual (PESQ, STOI, DNSMOS).
- Sesgos: no se documenta analisis de sesgo por acento, genero, edad ni condicion vocal. No hay informacion sobre el rendimiento con voces patologicas, susurros o hablantes no nativos.
- Privacidad y tratamiento de datos: el modelo opera sobre audio de conversaciones reales. Aunque la ejecucion local (CPU, WebAssembly) evita enviar audio a terceros, el cumplimiento del RGPD y de la normativa de grabacion depende de la implementacion, no del modelo.
- Licencia: Apache-2.0 permite uso comercial, pero el usuario debe verificar que los datasets de entrenamiento declarados (LibriSpeech, AMI) no impongan restricciones adicionales sobre la redistribucion de los pesos derivados.
- Tamano y estado del proyecto: el repositorio ocupa 0,4 GB, acumula 200 descargas y 14 likes, y se publico el 11 de octubre de 2026 con una actualizacion al dia siguiente. Es un proyecto joven, de un unico autor, sin historial largo de mantenimiento.
- Integracion: no se publican cifras de throughput ni de consumo de CPU por flujo concurrente, datos necesarios para dimensionar un despliegue con cientos de llamadas simultaneas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arbazsiddiqui/voxlock
- Articulo tecnico del autor: https://arbazsiddiqui.me/voxlock
- Repositorio de codigo: https://github.com/arbazsiddiqui/voxlock
- Resultados de benchmark detallados: https://github.com/arbazsiddiqui/voxlock/tree/main/bench/results
- Paquete en PyPI: https://pypi.org/project/voxlock/
- Demo en el navegador (Hugging Face Spaces): https://huggingface.co/spaces/arbazsiddiqui/voxlock
- Dataset de la Krisp Voice Isolation Benchmark: https://huggingface.co/datasets/Krisp-AI/VoiceIsolation-Benchmark-Dataset
- Modelo base (encoder de hablante): https://huggingface.co/Wespeaker/wespeaker-voxceleb-ecapa-tdnn512
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
- Dataset AMI: https://huggingface.co/datasets/edinburghcstr/ami
- Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; las unicas fuentes utiles son las anteriores, procedentes de la model card y de la propia pagina del modelo en Hugging Face.
