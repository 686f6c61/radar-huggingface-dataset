# semantique-team/moth-stt

## Resumen

Moth STT 0.6.0 es un modelo de reconocimiento automático del habla (ASR) de tamano muy reducido, desarrollado por el equipo semantique-team, especializado en habla italiana con terminos y frases en ingles incrustados (code-switching it/en), tal y como se habla en entornos laborales, tecnologicos y de medios. Parte del encoder de `openai/whisper-tiny` (licencia MIT) y se fine-tunea con una cabeza CTC lineal sobre un vocabulario SentencePiece BPE compartido para italiano e ingles. El resultado son 11,6 millones de parametros empaquetados en un grafo ONNX int8 de 11,9 MB, acompanado de un modelo de lenguaje trigrama de 5,1 MB y un VAD Silero de 2,3 MB en el pipeline.

Su relevancia actual radica en la eficiencia: funciona en CPU y en el navegador mediante ONNX Runtime Web (WASM), a 47 veces tiempo real con 4 hilos y 24 veces con 1 hilo sobre un Apple M5, con un paquete total de 19,4 MB. No es un modelo multilingue de proposito general ni soporta streaming: esta disenado para transcripcion por turnos (record-then-transcribe) como front-end de pulsar-para-hablar.

La version 0.6.0 no modifica los pesos respecto a 0.5.1 (mismo checkpoint int8, byte a byte); lo que cambia es el decodificador. La busqueda por haces anterior penalizaba la probabilidad del modelo de lenguaje en cada token sin contrapeso, lo que provocaba eliminacion sistematica de palabras (12,2% de palabras de referencia perdidas por delecion frente a 0,8% de inserciones). Un bonus por token (`gamma`) corrige ese sesgo y, tras reajustar el peso del LM, el mismo modelo mejora 6,9 puntos de WER en el conjunto mixto de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo transformer (Whisper-tiny) + cabeza CTC lineal |
| Parametros totales | 11,6 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; procesa segmentos de hasta 30 s por pasada (sin chunking) |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | italiano (it) e ingles (en), con enfasis en code-switching it/en |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (int8); encoder base `openai/whisper-tiny` en safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de `openai/whisper-tiny` como inicializacion y lo fine-tunea con una cabeza CTC lineal sobre un vocabulario SentencePiece BPE compartido entre italiano e ingles. El paquete final incluye tres componentes: el grafo ONNX int8 (11,9 MB), un modelo de lenguaje trigrama sobre tokens BPE (5,1 MB) y un VAD Silero (2,3 MB) que filtra el audio antes de la transcripcion. El decodificado combina busqueda por haces (beam 12, top-k 10) con el LM trigrama (peso 0,5) y un bonus por token de 2,4 que contrarresta el sesgo de delecion introducido por el termino del LM.

Los datos de entrenamiento provienen de `google/fleurs`, `openslr/librispeech_asr` y `facebook/multilingual_librispeech`, segun los metadatos del modelo. No se especifica en la informacion disponible el numero exacto de horas de audio, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente a ASR CTC). La innovacion tecnica destacable de la version 0.6.0 es precisamente el reajuste del decodificador: el bonus por token `gamma` elimina la penalizacion sistematica del LM que provocaba la perdida de la primera palabra en el 13,3% de los clips.

## Capacidades

- Reconocimiento de habla italiano con terminos y frases en ingles incrustados ("il deploy e andato bene, facciamo un quick sync dopo la call").
- Transcripcion de jerga tecnologica italiana, acronimos (KPI, MVP, API) y verbos italianizados (deployato, pushare, loggare).
- Deteccion de actividad de voz (VAD Silero incluido) que produce cero palabras sobre silencio y ruido estacionario (0 palabras en 337 clips no musicales).
- Ejecucion en navegador mediante ONNX Runtime Web (WASM), sin envio de audio al servidor.
- Ejecucion en CPU sin GPU.
- Salida en minusculas, sin puntuacion ni mayusculas, con numeros escritos con letras.
- No soporta streaming; el modo de uso es record-then-transcribe.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo ASR puro).
- No soporta vision ni audio mas alla de la transcripcion.

## Casos de uso

- **Dictado por pulsar-para-hablar en aplicaciones de escritorio**: el modelo transcribe segmentos de hasta 30 s en CPU con latencia baja (47x tiempo real en 4 hilos), lo que permite integrarlo como front-end de dictado sin depender de la nube.
- **Transcripcion en el navegador con privacidad**: al ejecutarse via ONNX Runtime Web (WASM), el audio nunca sale de la pestana; adecuado para herramientas internas con requisitos de confidencialidad.
- **Subtitulado de reuniones tecnicas italianas con jerga inglesa**: el modelo esta entrenado especificamente para el patron de habla de equipos de tecnologia italianos, con acronimos y verbos italianizados, lo que reduce errores frente a modelos genericos forzados a italiano.
- **Notas de voz en aplicaciones moviles o de escritorio**: el paquete de 19,4 MB cabe en un binario de aplicacion y permite transcripcion offline en dispositivos sin GPU.
- **Preprocesado de audio para pipelines de NLP**: la salida CTC sin puntuacion ni mayusculas es directamente consumible por etapas posteriores de normalizacion, traduccion o indexacion de texto.
- **Filtrado de audio no vocal**: el VAD incluido descarta silencio y ruido estacionario, lo que permite usar el modelo como etapa de deteccion de voz en grabaciones largas antes de transcribir solo los segmentos con habla.
- **Prototipado rapido de asistentes de voz en italiano**: al ser Apache 2.0 y ejecutable en CPU, sirve para validar flujos de voz sin infraestructura de GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor (WER en porcentaje, tras normalizacion de texto; decodificacion beam+LM con beam 12, top-k 10, peso LM trigrama 0,5 y bonus por token 2,4):

| Conjunto | n | WER | ETA |
|---|---|---|---|
| Mixed test T, todos los hablantes | 600 | 25,92 | 52,64 |
| T, hablante S3 (no visto en entrenamiento) | 200 | 26,66 | 47,32 |
| T, hablante S1 (en entrenamiento) | 200 | 24,16 | 60,00 |
| T, hablante S2 (en entrenamiento) | 200 | 26,93 | 50,99 |
| FLEURS-IT test | 697 | 20,46 | no disponible |
| FLEURS-EN test | 525 | 49,63 | no disponible |
| Common Voice IT test | 14 643 | 24,88 | no disponible |

Comparativa sobre los mismos 600 clips mixtos:

| Sistema | Tamano | WER | ETA |
|---|---|---|---|
| Parakeet TDT 0.6B v3 int8 | 639 MB | 10,98 | 83,60 |
| Moth 0.6.0 | 19,4 MB | 25,92 | 52,64 |
| Whistle (forzado `it`) | 16,9 MB | 29,42 | 49,28 |
| Whisper-tiny forzado `it`, beam 5 | 39 MB | 50,72 | 36,05 |
| Whisper-tiny auto, beam 5 | 39 MB | 68,86 | 39,50 |

El autor indica que Moth supera a ambas variantes de Whisper-tiny en WER y ETA (frente a la variante forzada `it`: WER -24,80 [-28,05, -21,80]; ETA +16,59 [+10,61, +22,74]), y que supera a Whistle en WER (-3,50 [-5,85, -1,24]), aunque queda por detras de Parakeet, 33 veces mas grande. En el hablante no visto S3 frente a Whisper forzado `it`: WER -19,51 [-24,31, -14,38] a favor de Moth, ETA +8,73 [-1,08, +20,00] empate.

## Requisitos de hardware

- Inferencia en CPU; no requiere GPU.
- Paquete total de 19,4 MB (11,9 MB ONNX int8 + 5,1 MB LM trigrama + 2,3 MB VAD Silero).
- VRAM estimada: no aplica (ejecucion en CPU); no disponible una estimacion de memoria RAM exacta en la informacion proporcionada.
- Throughput declarado: 47x tiempo real en 4 hilos y 24x en 1 hilo sobre Apple M5.
- Despliegue via ONNX Runtime (CPU) y ONNX Runtime Web (WASM en navegador).
- No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR ONNX de este tamano).
- Cabe en cualquier GPU de consumo, aunque no esta pensado para ejecucion en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Contexto / segmento | WER (mixed test T) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Moth STT 0.6.0 | 11,6 M | 19,4 MB | hasta 30 s por pasada | 25,92 | Apache 2.0 | ONNX en HF |
| Whisper-tiny (forzado `it`) | 39 M | 39 MB | 30 s | 50,72 | MIT | safetensors/ONNX en HF |
| Whistle | no disponible | 16,9 MB | no disponible | 29,42 | no disponible | HF |
| Parakeet TDT 0.6B v3 int8 | 600 M | 639 MB | no disponible | 10,98 | no disponible | HF |

Moth es el mas pequeno del grupo y supera a Whisper-tiny y Whistle en WER sobre el conjunto mixto, aunque Parakeet, 33 veces mayor, obtiene mejor precision. La ventaja de Moth es el tamano y la ejecucion en CPU/navegador.

## Limitaciones y advertencias

- **Ingles puro debil**: 49,63% de WER en FLEURS-EN; el modelo esta pensado para code-switching, no para transcripcion general en ingles.
- **Sin puntuacion ni mayusculas**: la salida es en minusculas, sin puntuacion y con numeros escritos con letras, lo que exige postprocesado para muchos usos.
- **Sin streaming**: solo record-then-transcribe; no apto para transcripcion en tiempo real continua.
- **Limite de 30 s por pasada** sin chunking; no maneja audio largo de forma nativa.
- **Fuera de alcance**: musica, canto, habla superpuesta y cualquier idioma distinto de italiano o ingles.
- **Musica**: el VAD no elimina toda la salida sobre musica (12 de 120 clips musicales produjeron palabras).
- **Riesgo de alucinacion**: como todo modelo ASR, puede emitir texto en segmentos ambiguos; el VAD mitiga el caso de silencio y ruido, no el de musica.
- **Sesgo de hablante**: 400 de los 600 clips del conjunto mixto provienen de hablantes presentes en entrenamiento; la cifra honesta es la del hablante S3 (26,66 WER).
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo base Whisper-tiny es MIT; conviene verificar la cadena de licencias en produccion.
- **Repo de 0,0 GB y 0 descargas**: no hay evidencia de adopcion ni de validacion externa de los resultados; los benchmarks son declarados por el autor (`verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/semantique-team/moth-stt
- Demo en vivo (Space): https://huggingface.co/spaces/semantique-team/moth-demo
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
- Dataset Multilingual LibriSpeech: https://huggingface.co/datasets/facebook/multilingual_librispeech
