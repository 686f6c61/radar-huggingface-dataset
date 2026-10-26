# nphearum/voxlock

## Resumen

VoxLock es un modelo de aislamiento de voz (voice isolation) de tipo audio-a-audio: recibe el audio de una llamada con varias voces solapadas y devuelve únicamente la voz del interlocutor principal, eliminando las voces de fondo antes de que el audio llegue al sistema de reconocimiento de habla. Lo desarrolla el autor que firma como nphearum en Hugging Face (la model card enlaza repositorios y paquete pip bajo la cuenta arbazsiddiqui), y se distribuye con licencia Apache-2.0.

La arquitectura es una BSRNN (band-split RNN) de aproximadamente 27,3 millones de parámetros, afinada a partir del encoder de hablante Wespeaker ECAPA-TDNN512, lo que permite personalizar la extracción hacia un hablante objetivo a partir de una muestra de 3 segundos de su voz. Está pensado para agentes de voz, centralitas y telefonía: procesa flujo continuo en CPU con 24 ms de latencia algorítmica y dispone de versiones cuantizadas a int8 (unos 75 MB de descarga) y exportaciones a ONNX y WebAssembly.

Su relevancia actual radica en que compite en la categoría de cancelación de voz de fondo, dominada por soluciones comerciales de pago (Krisp, ai-coustics, Sanas), con un modelo abierto que, según los datos declarados por el autor, obtiene el mejor WER y la menor fuga de palabras de fondo del benchmark público Krisp Voice Isolation. Los resultados están marcados como no verificados de forma independiente en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BSRNN (band-split recurrent neural network) para aislamiento de voz, con encoder de hablante ECAPA-TDNN512 (Wespeaker) para el condicionamiento al hablante objetivo |
| Parametros totales | 27.258.122 (aprox. 27,3 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica en el sentido de tokens; procesa audio en flujo continuo por fragmentos (chunks) de cualquier tamano a 16 kHz, con 24 ms de latencia algorítmica y una muestra de referencia del hablante de 3 s |
| Tipos de cuantizacion | int8 (version de 8 bits, ~75 MB, usada por defecto en el paquete pip) y fp32 (version evaluada en los benchmarks) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX (runtime onnxruntime; exportacion a WebAssembly) |

## Arquitectura y entrenamiento

VoxLock se construye sobre una BSRNN, un esquema de separacion que divide el espectrograma en bandas de frecuencia y procesa cada banda con capas recurrentes, lo que reduce coste computacional frente a un transformer de audio completo y permite inferencia en tiempo real. El aislamiento esta condicionado al hablante: el modelo parte de un checkpoint afinado del encoder de verificacion de hablante Wespeaker VoxCeleb ECAPA-TDNN512, de forma que la red dispone de una representacion de 512 dimensiones de la voz a conservar. El usuario aporta una muestra de 3 segundos; la funcion `isolate` del paquete toma por defecto los 3 segundos mas energeticos de los primeros 15 segundos de la llamada, que es el criterio con el que se generaron los resultados publicados.

Los datos de entrenamiento declarados son `openslr/librispeech_asr` y `edinburghcstr/ami`; la model card no detalla el numero total de horas, la composicion exacta del dataset ni si hubo etapas de ajuste con preferencias humanas (RLHF/DPO), por lo que esos datos no estan disponibles. La model card indica que el punto de partida del ajuste fue el checkpoint abierto "REAL-TSE causal". En el plano de despliegue, las innovaciones destacables son la inferencia en flujo (`push` devuelve el audio aislado listo en bloques de aproximadamente 24 ms), la cuantizacion int8 para ejecucion en CPU y las exportaciones a ONNX/WebAssembly, ademas de una integracion declarada con Pipecat.

## Capacidades

- Aislamiento de la voz del interlocutor principal en audio con multiples hablantes, eliminando voces de fondo de la misma sala o canal.
- Condicionamiento por hablante objetivo a partir de una muestra de 3 segundos, sin necesidad de etiquetar manualmente quien es el hablante.
- Cancelacion y eliminacion de voz de fondo, medida tambien como "palabras de fondo filtradas por minuto" cuando solo habla el fondo.
- Procesamiento en flujo (streaming) en tiempo real: acepta fragmentos de audio de cualquier tamano a 16 kHz en float32 y devuelve audio aislado de la misma longitud que la entrada.
- Entrada flexible en la CLI: cualquier frecuencia de muestreo, mono o estereo; la salida conserva la longitud del audio original.
- Ejecucion en CPU con baja latencia, sin requerir GPU para el modo streaming.
- Distribucion como paquete Python (`pip install voxlock`), con backend onnxruntime, exportacion a int8 y a WebAssembly para navegador.
- Integracion con frameworks de agentes de voz (Pipecat) y uso en telefonia y centros de llamadas.
- Capacidad multilingue: no disponible; el modelo declara unicamente ingles.
- No es un modelo de generacion de texto, razonamiento, codigo ni vision; es exclusivamente audio-a-audio.

## Casos de uso

- Atencion al cliente en centros de llamadas: el modelo se coloca delante del ASR para que la transcripcion solo contenga la voz del cliente, evitando que el ruido de television, companeros de oficina o familiares contaminen el texto y disparen el WER del reconocedor.
- Agentes de voz telefonicos: al ejecutarse en CPU con 24 ms de latencia algoritmica, puede integrarse en el bucle de un agente conversacional (por ejemplo via Pipecat) sin consumir GPU del servidor de inferencia del LLM.
- Transcripcion de reuniones y notas automaticas: en ventanas reales de reuniones AMI, con el portador del headset como interlocutor, el modelo reduce el WER del ASR respecto al audio sin procesar (10,12 % frente a 33,03 % en los datos declarados).
- Grabacion y postproduccion de podcasts o entrevistas remotas: aislamiento del invitado para eliminar la voz del entorno domestico antes de la transcripcion o del subtitulado.
- Evaluacion de calidad de audio y conjunto de pruebas de ASR: se puede usar como etapa de preprocesado en pipelines que miden el WER en condiciones de ruido de fondo con locucion simultanea.
- Asistentes de voz en navegador o en el borde: la exportacion a WebAssembly y el modelo int8 de ~75 MB permiten ejecutar el aislamiento en el cliente antes de enviar el audio a un servicio remoto, reduciendo ancho de banda y exposicion de datos.
- Cumplimiento y minimizacion de datos en grabaciones: al eliminar las voces de terceros presentes en la sala, se reduce la cantidad de datos personales de personas que no participan en la conversacion que se almacenan o se envian a un tercero.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (marcados como no verificados en la model card). El WER se mide sobre la transcripcion del audio ya aislado, no sobre el audio original.

| Benchmark | Metrica | Valor VoxLock |
|---|---|---|
| Krisp Voice Isolation Benchmark (265 grabaciones reales, ASR Parakeet TDT 0.6B v2) | WER tras aislamiento | 4,95 % |
| Krisp Voice Isolation Benchmark | Palabras de fondo filtradas por minuto de audio solo-fondo | 0,11 |
| AMI meetings (134 ventanas reservadas, portador del headset como interlocutor, ASR Parakeet TDT 0.6B v3) | WER tras aislamiento | 10,12 % |
| AMI meetings | Palabras de fondo filtradas por minuto | 2,12 |

Comparativa en el Krisp Voice Isolation Benchmark publicada en la model card:

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
| REAL-TSE causal (checkpoint de partida) | abierto | 9,81 | 13,73 |
| Hush | abierto | 12,09 | 19,58 |
| DeepFilterNet3 | abierto | 13,30 | 22,77 |
| TIGER | abierto | 14,72 | 37,24 |
| Sin procesado | - | 23,21 | 66,48 |
| SAM-Audio small (Meta) | abierto | 33,77 | 21,15 |
| ElevenLabs Voice Isolator | de pago | 43,79 (solo 7 grabaciones con mas fondo) | 144,6 |

Comparativa en AMI (reuniones reales no usadas en entrenamiento):

| Modelo | Acceso | WER % | Palabras de fondo filtradas / min |
|---|---|---|---|
| VoxLock | abierto | 10,12 | 2,12 |
| ai-coustics Voice Focus 2.2 S | de pago | 11,85 | 1,06 |
| ai-coustics Voice Focus 2.2 L | de pago | 12,13 | 1,72 |
| Sanas Voice Isolation SE 1.0 | de pago | 13,30 | 5,30 |
| TIGER | abierto | 22,84 | 36,85 |
| DeepFilterNet3 | abierto | 26,78 | 38,84 |
| Hush | abierto | 33,00 | 68,93 |
| Sin procesado | - | 33,03 | 78,34 |

La model card remite a `bench/results` del repositorio de GitHub para las tasas de palabras del interlocutor perdidas, deleciones, inserciones e intervalos de confianza al 95 %; esas cifras no estan incluidas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (27,3 M de parametros, ~109 MB en pesos) y del orden de decenas de MB en int8; el modelo esta disenado para ejecutarse en CPU.
- GPU recomendadas: no se especifican en la informacion disponible; cualquier GPU consumer reciente (por ejemplo, serie RTX 4090 o inferior) es sobradamente suficiente por tamano, pero el caso de uso declarado es CPU.
- Cabe en GPU consumer: si, con margen amplio; tambien en entornos sin GPU.
- Despliegue: paquete pip `voxlock` sobre onnxruntime, exportacion ONNX, compilacion a WebAssembly para navegador, integracion con Pipecat; vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia: 24 ms de latencia algoritmica en modo streaming; el modelo int8 de ~75 MB se descarga de Hugging Face en el primer uso.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / latencia | WER Krisp % | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoxLock | 27,3 M | 24 ms de latencia algoritmica; flujo continuo | 4,95 | Apache-2.0 | Abierto (HF, pip, ONNX, WASM) |
| DeepFilterNet3 | no disponible | no disponible | 13,30 | no disponible en la informacion | Abierto |
| Hush | no disponible | no disponible | 12,09 | no disponible en la informacion | Abierto |
| TIGER | no disponible | no disponible | 14,72 | no disponible en la informacion | Abierto |
| SAM-Audio small (Meta) | no disponible (variante "small") | no disponible | 33,77 | no disponible en la informacion | Abierto |
| Krisp VI 2.5 (Default/Balanced/HD/Lite) | no disponible | no disponible | 5,30 / 5,32 / 5,79 / 6,21 | propietaria | Comercial de pago |
| ai-coustics Voice Focus 2.2 (L/S) | no disponible | no disponible | 6,84 / 6,91 | propietaria | Comercial de pago |

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; no hay datos sobre comportamiento en castellano u otros idiomas.
- Los resultados de benchmarks estan declarados por el autor y marcados como no verificados en la propia model card (`verified: false`); no se han encontrado evaluaciones independientes en la informacion disponible.
- El aislamiento depende de la muestra de referencia del hablante: el valor por defecto toma los 3 segundos mas energeticos de los primeros 15 segundos de la llamada, una heuristica que puede fallar si en ese tramo habla mas fuerte otra persona o si hay ruido intenso.
- Riesgo de eliminar palabras del propio interlocutor: la model card menciona metricas de deleciones y palabras del interlocutor perdidas, pero sus valores no estan en la informacion disponible; en produccion conviene monitorizar falsos negativos.
- El objetivo es exclusivamente la voz; no elimina ruidos no vocales (musica, trafico, teclado) de forma especifica segun la informacion disponible.
- El modelo se evaluo principalmente con audio telefónico y reuniones; el rendimiento en dominios muy distintos (podcast musical, audio con reverberacion fuerte) no esta documentado.
- La ficha de Hugging Face corresponde al repositorio `nphearum/voxlock`, mientras que la model card enlaza write-up, codigo, pip y demo bajo la cuenta `arbazsiddiqui`; conviene verificar la procedencia y el hash de los pesos antes de usarlos en produccion.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia; no se declaran restricciones adicionales de uso.
- La comparacion con ElevenLabs se hizo solo sobre 7 grabaciones, no sobre las 265 del benchmark, por lo que no es directamente comparable con el resto de filas.
- El rendimiento declarado depende del ASR usado para calcular el WER (Parakeet TDT 0.6B v2 en Krisp, v3 en AMI); con otro reconocedor las cifras pueden variar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nphearum/voxlock
- Repositorio referenciado en la model card: https://huggingface.co/arbazsiddiqui/voxlock
- Articulo tecnico (write-up): https://arbazsiddiqui.me/voxlock
- Codigo fuente: https://github.com/arbazsiddiqui/voxlock
- Resultados de benchmark detallados: https://github.com/arbazsiddiqui/voxlock/tree/main/bench/results
- Paquete pip: https://pypi.org/project/voxlock/
- Demo en el navegador (Hugging Face Spaces): https://huggingface.co/spaces/arbazsiddiqui/voxlock
- Dataset del benchmark Krisp: https://huggingface.co/datasets/Krisp-AI/VoiceIsolation-Benchmark-Dataset
- Dataset AMI: https://huggingface.co/datasets/edinburghcstr/ami
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
- Modelo base (encoder de hablante): https://huggingface.co/Wespeaker/wespeaker-voxceleb-ecapa-tdnn512
