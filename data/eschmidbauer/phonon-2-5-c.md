# eschmidbauer/phonon-2.5-c

## Resumen

Phonon-2.5-c es un paquete de pesos para reconocimiento automatico de voz (ASR) pensado para ejecutarse en CPU sin GPU. No es un modelo nuevo, sino una re-codificacion de los pesos de [FermionResearch/Phonon-2.5](https://huggingface.co/FermionResearch/Phonon-2.5), un modelo estudiante de cinco valores y 25 idiomas destilado de NVIDIA Parakeet-TDT 0.6B v3. Los pesos se han empaquetado en el formato binario propio `phonon-2.5-c-weights-v1` para el motor de inferencia en C puro [phonon-2.5-c](https://github.com/eschmidbauer/phonon-2.5-c), que solo depende de libc y pthreads.

El modelo base es un transductor TDT (Token-and-Duration Transducer) de unos 0,6 mil millones de parametros con arquitectura encoder-LSTM-decoder-joint. La contribucion del paquete es el re-encoding de las lineales del encoder a formato de cinco valores (2 bits de signo mas 1 bit de bandera lo/hi) manteniendo el resto en int8 o fp32, lo que reduce el peso del archivo a 183 MB comprimidos (255 MB sin comprimir) y permite decodificar en CPU a velocidades muy superiores al tiempo real (137x en un Apple M5 Max).

Es relevante ahora porque demuestra que un ASR multilingue de calidad competitiva (2,03 % / 3,95 % de WER en LibriSpeech test-clean/test-other con int8w) puede ejecutarse en hardware consumer sin GPU, con licencia CC-BY-4.0 en los pesos y sin dependencias externas mas alla de la libc. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica un lanzamiento muy reciente y sin adopcion publica todavia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor TDT (Token-and-Duration Transducer): encoder (convoluciones y lineales), LSTM, decoder projector y joint head |
| Parametros totales | ~0,6 B (heredados de NVIDIA Parakeet-TDT 0.6B v3 via Phonon-2.5) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio); grabaciones largas se decodifican en ventanas de 25-35 s alineadas a pausas |
| Tipos de cuantizacion | cinco valores (2 bits de signo + 1 bit de bandera lo/hi) en lineales del encoder; int8 con una escala fp32 por columna/fila en el resto; fp32 en normas, sesgos y convoluciones |
| Idiomas soportados | 25: en, es, fr, de, it, pt, nl, pl, ru, uk, ro, cs, sk, bg, hr, sv, da, fi, et, lv, lt, hu, sl, mt, el |
| Licencia | Pesos: CC-BY-4.0. Codigo (`convert_weights.py`, `build.sh`, motor): MIT. `fermion_container.py`: Apache-2.0 (Fermion Research) |
| Formato de pesos | `phonon-2.5-c-weights-v1`: `weights.bin` + `weights.json` (indice de tensores) + `tokens.txt` (vocabulario), empaquetados en `phonon-2.5-c-weights-v1.tar.gz` (183 MB) |

## Arquitectura y entrenamiento

El modelo base Phonon-2.5 es un transductor TDT de ~0,6 B de parametros destilado de NVIDIA Parakeet-TDT 0.6B v3. La arquitectura combina un encoder (lineales de feed-forward, Q/K/V fusionadas, proyeccion de posicion, convoluciones pointwise y depthwise, con BatchNorm plegado) con un LSTM y un decoder/joint head que produce tokens y duraciones. Esta estructura es tipica de los transductores para ASR: el encoder procesa el audio, el predictor LSTM modela el historial de tokens y el joint head combina ambos para emitir la siguiente unidad con su duracion.

El paquete `phonon-2.5-c` no reentrena ni recuantiza el modelo: re-codifica los pesos del release de Phonon-2.5 en un contenedor binario propio. Las lineales de cinco valores del encoder se mantienen como cinco valores (2 bits de signo + 1 bit lo/hi, con `lo`/`hi` fp32 por salida), 9 tensores adicionales (subsampling linear, encoder projector, embedding, LSTM, decoder projector y joint head) se almacenan en int8 con escalas fp32, y 354 tensores (normas, sesgos, convoluciones de subsampling y depthwise) quedan en fp32. Todo es exacto salvo el plegado de BatchNorm, calculado en doble precision y almacenado en fp32. El motor decodifica exactamente los mismos token ids que la referencia de `transformers` sobre las mismas features (50 de 50 en un clip de 10 s, 965 de 965 en una llamada de 256 s).

## Capacidades

- Reconocimiento automatico de voz (speech-to-text) en 25 idiomas europeos, incluidos ingles, espanol, frances, aleman, italiano, portugues, neerlandes, polaco, ruso, ucraniano, rumano, checo, eslovaco, bulgaro, croata, sueco, danes, finlandes, estonio, leton, lituano, hungaro, esloveno, maltes y griego.
- Decodificacion de audio de cualquier formato WAV (PCM o float, cualquier frecuencia de muestreo, mono o multicanal).
- Modo streaming: lectura de PCM de 16 bits crudo por `stdin` con `--stream`.
- Timestamps por palabra en salida JSON (`--json`), utiles para subtitulado y alineacion.
- Procesamiento de grabaciones largas mediante ventanas de 25-35 s alineadas a pausas.
- No soporta tool calling, function calling, agentes, vision ni audio generativo: es exclusivamente ASR.

## Casos de uso

- Transcripcion on-device con privacidad: al ejecutarse en CPU sin GPU y sin red, el audio no sale del dispositivo; adecuado para portatiles, estaciones de trabajo y entornos regulados donde no se permite enviar grabaciones a la nube.
- Subtitulado y transcripcion en tiempo real: el modo `--stream` lee PCM crudo por `stdin`, y en un Apple M5 Max una locucion de 3 s se transcribe en 0,04 s, lo que permite alimentar un pipeline de subtitulos con latencia baja.
- Actas de reuniones y llamadas multilingues: con 25 idiomas y ventanas alineadas a pausas, una llamada de 256 s se decodifica en 2,8 s, lo que hace viable procesar grandes volumenes de audio de contact center.
- Generacion de subtitulos con marcas de tiempo: la salida `--json` proporciona timestamps por palabra, utiles para generar ficheros SRT/VTT y para alinear transcripciones con video.
- Procesamiento por lotes de audiolibros y capitulos largos: la decodificacion a 137x tiempo real permite transcribir capitulos de 8 minutos en 3,7 s y concatenar LibriSpeech por capitulos con un WER de 1,65 % (test-clean) / 2,76 % (test-other).
- Integracion en aplicaciones C o Python: el motor expone una biblioteca en C y bindings de Python, de modo que se puede enlazar en pipelines de backend sin dependencias pesadas (solo libc y pthreads).
- Despliegue en dispositivos embebidos y edge: el paquete ocupa 255 MB descomprimido y no requiere GPU, lo que lo hace apto para equipos con recursos limitados donde no cabe un runtime de deep learning convencional.

## Benchmarks y rendimiento

Resultados de WER en LibriSpeech medidos con el motor y la normalizacion inglesa de Whisper (protocolo del Open ASR Leaderboard):

| Conjunto | int8w (por defecto) | exact |
|---|---:|---:|
| test-clean (2.620 locuciones) | 2,03 % | 2,01 % |
| test-other (2.939 locuciones) | 3,95 % | 3,87 % |
| Capitulos concatenados 5-10 min (test-clean) | 1,65 % | no disponible |
| Capitulos concatenados 5-10 min (test-other) | 2,76 % | no disponible |

Cifras de referencia aportadas en la model card:

| Modelo / medida | test-clean | test-other |
|---|---:|---:|
| Phonon-2.5 (cifras del autor, protocolo del leaderboard) | 1,60 % | 3,41 % |
| Phonon-2.5-c (motor, int8w) | 2,03 % | 3,95 % |
| Phonon-2 (motor, mismo protocolo) | 2,16 % | 4,34 % |

Rendimiento en Apple M5 Max:

| Escenario | Tiempo | Factor |
|---|---:|---:|
| Capitulo de 8 minutos | 3,7 s | 137x tiempo real |
| Llamada de 256 s | 2,8 s | ~91x tiempo real |
| Locucion de 3 s | 0,04 s | ~75x tiempo real |

No se han publicado resultados de benchmarks para los otros 24 idiomas en la informacion disponible; la model card remite a las cifras FLEURS de Phonon-2.5.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU.
- GPU: no se requiere ninguna GPU. El motor esta disenado para CPU y no usa CUDA ni Metal.
- Cabe en cualquier CPU moderna: el paquete descomprimido ocupa 255 MB y el motor solo depende de libc y pthreads.
- Memoria RAM: no especificada en la informacion disponible; el peso del modelo (255 MB) mas el estado del decoder es el limite inferior orientativo.
- Opciones de despliegue: binario `phonon25` compilado con `make -C csrc`, biblioteca en C, bindings de Python y descarga via `scripts/get_weights.sh` o `make -C csrc weights` con verificacion de sha256.
- Latencia y throughput: en Apple M5 Max, 137x tiempo real en audio largo, 2,8 s para una llamada de 256 s y 0,04 s para 3 s. No se proporcionan cifras para otras CPUs.
- Formatos de audio de entrada: WAV (PCM o float, cualquier frecuencia, mono o multicanal) y PCM de 16 bits crudo por `stdin` en modo `--stream`.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER LibriSpeech clean/other | Licencia | Formato y despliegue |
|---|---|---|---|---|---|
| Phonon-2.5-c (este) | ~0,6 B | 25 | 2,03 % / 3,95 % (int8w); 1,65 % / 2,76 % en audio largo | CC-BY-4.0 (pesos), MIT (codigo) | Contenedor propio, motor C en CPU |
| Phonon-2.5 (base) | ~0,6 B | 25 | 1,60 % / 3,41 % (cifras del autor) | CC-BY-4.0 | Release `transformers` (`phonon-2.5.bps.tar.zst`, 163 MB) |
| Phonon-2 (predecesor) | no disponible | solo ingles | 2,16 % / 4,34 % con el mismo protocolo | no disponible en la informacion | Contenedor propio, motor C en CPU |
| NVIDIA Parakeet-TDT 0.6B v3 (maestro) | ~0,6 B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

La comparacion mas directa es con el propio Phonon-2.5: el paquete re-codificado mantiene la precision dentro de ~0,4 puntos de WER respecto a las cifras del modelo base, a cambio de un formato que se ejecuta en CPU sin GPU. Frente a Phonon-2, la mejora es de ~0,13 puntos en test-clean y ~0,39 en test-other, ademas de pasar de 1 a 25 idiomas.

## Limitaciones y advertencias

- El paquete hereda los sesgos y las limitaciones del modelo base Phonon-2.5 y, en ultima instancia, de NVIDIA Parakeet-TDT 0.6B v3; no se ha realizado una evaluacion independiente de sesgos en la informacion disponible.
- Riesgo de alucinacion y errores en audio ruidoso, con acentos no representados en el entrenamiento o con solapamiento de hablantes; el WER de 3,95 % en test-other es casi el doble que en test-clean.
- La model card solo publica cifras de WER para ingles en este paquete; el rendimiento en los otros 24 idiomas no esta cuantificado aqui y remite a la card de Phonon-2.5.
- Las ventanas de 25-35 s alineadas a pausas son una heuristica del motor; en audio sin pausas claras la calidad puede degradarse.
- Licencia de los pesos CC-BY-4.0: permite uso comercial con atribucion. Es necesario revisar la cadena de atribucion en `NOTICE` (Phonon-2.5 y NVIDIA Parakeet-TDT 0.6B v3) y los terminos de los datos de entrenamiento alli indicados.
- El formato de pesos es propietario (`phonon-2.5-c-weights-v1`) y solo lo consume el motor `phonon-2.5-c`; no es interoperable con llama.cpp, vLLM, TGI, Ollama ni `transformers` directamente.
- El repositorio tiene 0 descargas y 0 likes en la fecha de consulta; se trata de un release muy reciente y sin validacion comunitaria publica.
- El plegado de BatchNorm se calcula en doble precision y se almacena en fp32; es el unico paso no exacto del proceso de conversion.

## Enlaces

- HuggingFace del paquete: https://huggingface.co/eschmidbauer/phonon-2.5-c
- Modelo base: https://huggingface.co/FermionResearch/Phonon-2.5
- Motor de inferencia en C: https://github.com/eschmidbauer/phonon-2.5-c
- Predecesor en ingles: https://huggingface.co/eschmidbauer/phonon-2-c
- Pesos fuente (`phonon-2.5.bps.tar.zst`): https://huggingface.co/FermionResearch/Phonon-2.5
- Open ASR Leaderboard (protocolo de normalizacion): no disponible en la informacion proporcionada como enlace directo
