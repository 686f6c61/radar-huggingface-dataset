# BuilderHelm/Parakeet-CTC-110M-CoreML

## Resumen

Parakeet-CTC-110M-CoreML es la conversion a CoreML de la rama CTC del modelo hibrido Parakeet-TDT-CTC-110M de NVIDIA, realizada por BuilderHelm. Incluye el encoder FastConformer compartido y la cabeza CTC, pero omite el decodificador TDT. El resultado es un paquete de 118 MB que ejecuta reconocimiento de voz en ingles directamente sobre el Neural Engine de Apple Silicon, con el preprocesado de audio (espectrograma log-mel) en float32 sobre CPU y el encoder cuantizado a int8 sobre la ANE.

El modelo resuelve dos problemas concretos: transcripcion rapida en dispositivo (on-device) sin conexion ni envio de audio a servidores, y deteccion de palabras clave (keyword spotting) con marcas temporales. Al exponer las log-probabilidades cada 80 ms, permite construir vocabularios personalizados y alineamientos temporales sobre la salida CTC, algo que una simple API de transcripcion no ofrece.

Su relevancia actual radica en el rendimiento medido: segun el autor, alcanza 1.071x tiempo real en clips cortos y 998x en audio largo sobre un Apple M5, con una latencia mediana de 11,2 ms por clip corto y un consumo de memoria pico de 208 MB. Frente a la alternativa FluidInference/parakeet-ctc-110m-coreml, el autor reporta mejoras sustanciales tanto en velocidad como en tasa de error de palabra (WER). La licencia CC-BY-4.0 facilita su integracion en productos comerciales con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder Conformer con atencion lineal) + cabeza CTC; sin decodificador TDT |
| Parametros totales | 110 M (modelo base nvidia/parakeet-tdt_ctc-110m) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio de longitud variable; politica de audio largo en config.json) |
| Tipos de cuantizacion | Encoder int8 (Neural Engine); preprocesado de audio float32 (CPU) |
| Idiomas soportados | Ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | CoreML (.mlpackage); vocabulario en vocab.json; configuracion en config.json |
| Tamano del paquete | 118 MB total (encoder 112,7 MB, preprocesador 5,7 MB, vocab 9 KB, config 3 KB) |
| Repositorio | 0,4 GB |
| Libreria | coreml |
| Plataformas | macOS 15+ (Sequoia o posterior), iOS 18+ via BuilderHelmAudio; Apple Silicon (probado en M5 y iPhone 13) |
| Toolchain | Swift 6 (Xcode 16 o posterior) |

## Arquitectura y entrenamiento

El modelo base es el Parakeet-TDT-CTC-110M de NVIDIA, un sistema hibrido que combina un encoder FastConformer con dos cabezas de decodificacion: TDT (Token-and-Duration Transducer) y CTC. Esta conversion conserva unicamente el encoder compartido y la cabeza CTC, descartando el decodificador TDT. La cabeza CTC realiza transcripcion greedy en una sola pasada y emite log-probabilidades cada 80 ms, lo que habilita deteccion de palabras clave, vocabularios personalizados y alineamiento temporal.

El encoder FastConformer emplea atencion lineal para reducir el coste cuadratico en secuencias largas, lo que explica el rendimiento sostenido en audio de decenas de minutos (998x tiempo real en 79 minutos de audio). La cuantizacion a int8 del encoder permite ejecutarlo en el Neural Engine de Apple Silicon, mientras que el preprocesado log-mel se mantiene en float32 sobre CPU para preservar la calidad espectral.

Los datos de entrenamiento del modelo base, segun los datasets declarados en la model card, incluyen LibriSpeech, Fisher Corpus, Common Voice 8.0, National Singapore Corpus Part 1, VCTK, VoxPopuli, Europarl y Multilingual LibriSpeech. No se especifica en la informacion disponible el numero total de horas de audio, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicable habitualmente en ASR). La conversion a CoreML no reentrena pesos: solo transforma el grafo y cuantiza el encoder.

## Capacidades

- Reconocimiento de voz en ingles con decodificacion CTC greedy en una sola pasada.
- Deteccion de palabras clave (keyword spotting) con marcas de inicio y fin, apoyada en las log-probabilidades emitidas cada 80 ms.
- Soporte de vocabulario personalizado y alineamiento temporal mediante las probabilidades por fotograma.
- Procesamiento de audio largo con politica de ventanas definida en config.json (medido en archivos de hasta 79 minutos).
- Ejecucion on-device en Apple Silicon: Neural Engine para el encoder, CPU para el preprocesado.
- Integracion nativa en Swift mediante el paquete BuilderHelmAudio (descarga, verificacion SHA-256 y almacenamiento local).
- Sin soporte de tool calling, function calling, agentes, vision, audio de entrada distinto de voz, ni capacidades multilingues mas alla del ingles.
- No incluye modo thinking ni razonamiento: es un modelo puramente acustico-secuencial.

## Casos de uso

- Transcripcion de reuniones y notas de voz en macOS e iOS: el modelo procesa audio largo a 998x tiempo real con 109 MB de memoria pico, por lo que puede transcribir una reunion de una hora en pocos segundos en un Mac con Apple Silicon, sin enviar el audio a la nube.
- Subtitulado automatico en aplicaciones de edicion de video: la emision de log-probabilidades cada 80 ms permite generar marcas temporales alineadas con la pista de audio, utiles para sincronizar subtitulos en herramientas nativas de macOS.
- Deteccion de palabras clave en asistentes de voz: la funcion `spot` del paquete BuilderHelmAudio permite buscar terminos como nombres propios o comandos en un archivo de audio y devolver sus tiempos de aparicion, con una recall del 89,8% en Earnings22 a una falsa alarma por clip.
- Dictado offline en aplicaciones de productividad para iPhone e iPad: en un iPhone 13 el modelo corre a 604x tiempo real en clips de 6 segundos, lo que permite dictado instantaneo sin conexion y con los mismos transcripts que en Mac.
- Indexacion y busqueda de archivos de audio: al transcribir grandes volumenes de audio a 1.071x tiempo real en clips cortos, se puede construir un indice de texto searchable sobre grabaciones de llamadas, podcasts o clases.
- Prototipado rapido de pipelines ASR en Swift: el paquete Swift incluido permite cargar el modelo con `SpeechRecognizer.load(.parakeetCtc110M)` y obtener transcripciones en pocas lineas, adecuado para validar productos de voz antes de invertir en infraestructura.
- Vocabularios personalizados en dominios tecnicos: las log-probabilidades por fotograma permiten reajustar la decodificacion hacia terminos especificos (jerga medica, nombres de productos) sin reentrenar el modelo.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente). WER sobre distintos conjuntos de test:

| Conjunto de evaluacion | Metrica | Valor |
|---|---|---|
| LibriSpeech clean (test) | WER (CTC) | 2,95% |
| LibriSpeech other (test) | WER (CTC) | 5,88% |
| Earnings22 contextual subset (772 clips) | WER (CTC) | 17,62% |
| Common Voice (clips cortos) | WER | 8,25% |
| Audio largo | WER | 2,63% |
| Audio largo held-out (18 archivos, 27 min) | WER | 6,70% |
| Earnings22, 1 falsa alarma por clip | Keyword recall | 89,8% |

Rendimiento en Apple M5, macOS 27.2 (mediana de 3 ejecuciones):

| Metrica | Valor |
|---|---|
| RTFx, clips cortos / audio largo | 1.071x / 998x tiempo real |
| Latencia por clip corto (mediana / p95) | 11,2 / 25,3 ms |
| Memoria pico, clips cortos / audio largo | 208 / 109 MB |
| RTFx en iPhone 13 (clip de 6 s / 72 s) | 604x / 415x tiempo real |

Comparativa con FluidInference/parakeet-ctc-110m-coreml en el mismo Mac y audio (x tiempo real · WER):

| Carga de trabajo | Este modelo | FluidInference | FluidInference, CPU mel |
|---|---|---|---|
| Clips cortos (262 de Common Voice) | 1.071x · 8,25% | 96x · 94,86% | 96x · 27,90% |
| Audio largo (20 archivos, 79 min) | 998x · 2,63% | 123x · 96,93% | 129x · 19,43% |
| Audio largo held-out (18 archivos, 27 min) | 1.023x · 6,70% | 125x · 95,93% | 126x · 31,89% |

El autor senala que FluidInference devuelve texto vacio en 149 de los 262 clips cortos en ese Mac, y que ejecutar solo su paso mel en CPU recupera la mayoria. La velocidad se midio con la version 1.1.0; la 1.1.1 anade la union de ventanas sin coste medible.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon (probado en M5 y iPhone 13). No funciona en Intel ni en GPUs NVIDIA o AMD.
- Sistema operativo: macOS 15+ (Sequoia o posterior) o iOS 18+ mediante BuilderHelmAudio.
- Memoria: 208 MB pico en clips cortos y 109 MB en audio largo; cabe holgadamente en cualquier dispositivo Apple Silicon.
- Almacenamiento: 118 MB el modelo descomprimido; 101 MB el archivo portable v1.1.1.
- GPU/acceleradores: el encoder int8 se ejecuta en el Neural Engine; el preprocesado float32 en CPU. No requiere GPU dedicada.
- Despliegue: CoreML nativo, paquete Swift BuilderHelmAudio, Swift Package local desde la carpeta `swift/` del repositorio. No compatible con vLLM, llama.cpp, Ollama ni TGI (son runtimes para LLMs, no aplicables).
- Latencia: 11,2 ms mediana y 25,3 ms p95 por clip corto en M5; throughput de 1.071x tiempo real en clips cortos y 998x en audio largo.
- Toolchain de compilacion: Swift 6 (Xcode 16 o posterior).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | WER LibriSpeech clean | Licencia | Plataforma |
|---|---|---|---|---|---|
| BuilderHelm/Parakeet-CTC-110M-CoreML | 110 M | Audio variable (probado hasta 79 min) | 2,95% | CC-BY-4.0 | Apple Silicon (CoreML) |
| FluidInference/parakeet-ctc-110m-coreml | 110 M | Audio variable | no disponible de forma independiente (el autor reporta 94,86% en Common Voice) | no disponible | Apple Silicon (CoreML) |
| BuilderHelm/Parakeet-TDT-CTC-110M-CoreML | 110 M | Audio variable | no disponible | CC-BY-4.0 | Apple Silicon (CoreML) |
| nvidia/parakeet-tdt_ctc-110m (base) | 110 M | Audio variable | no disponible en la informacion proporcionada | no disponible | GPU NVIDIA (NeMo) |

La diferencia clave frente a FluidInference es el rendimiento medido por el autor: 1.071x frente a 96x en clips cortos y 8,25% frente a 27,90% de WER en Common Voice (con mel en CPU). Frente al modelo base de NVIDIA, esta version pierde el decodificador TDT (que suele ofrecer mejor WER que CTC puro) pero gana portabilidad a Apple Silicon. El paquete hermano BuilderHelm/Parakeet-TDT-CTC-110M-CoreML conserva el decodificador TDT para quienes necesiten transcripcion de mayor calidad a costa de mas computo.

## Limitaciones y advertencias

- Solo soporta ingles. No hay capacidades multilingues; usarlo con audio en otros idiomas producira transcripciones incorrectas.
- Exclusivo de Apple Silicon. No se puede desplegar en servidores Linux con GPU NVIDIA, lo que limita su uso en backends cloud tradicionales.
- Al ser la rama CTC sin decodificador TDT, la calidad de transcripcion es inferior a la del modelo hibrido completo en dominios dificiles (Earnings22: 17,62% de WER).
- Los benchmarks son declarados por el autor y no estan verificados de forma independiente (campo `verified: false` en el model-index).
- Riesgo de alucinacion en audio con ruido, silencios largos o habla solapada, comun en modelos CTC; conviene validar con datos propios antes de produccion.
- Sesgos acusticos heredados del modelo base de NVIDIA: el rendimiento puede degradarse con acentos no representados en los datasets de entrenamiento (LibriSpeech, Fisher, Common Voice, etc.).
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion al autor y al modelo base de NVIDIA; revisar los terminos del modelo original antes de redistribuir.
- Requiere macOS 15+ o iOS 18+; dispositivos con versiones anteriores no pueden ejecutarlo.
- El paquete depende de BuilderHelmAudio para la gestion de descarga y verificacion; el uso directo de los archivos exige integrar el Swift Package manualmente.
- No dispone de soporte para tool calling, agentes ni razonamiento; es exclusivamente un modelo ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BuilderHelm/Parakeet-CTC-110M-CoreML
- Modelo hermano con TDT: https://huggingface.co/BuilderHelm/Parakeet-TDT-CTC-110M-CoreML
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Alternativa FluidInference: https://huggingface.co/FluidInference/parakeet-ctc-110m-coreml
- Paquete Swift BuilderHelmAudio: https://github.com/BuilderHelm/BuilderHelmAudio
- Documento de benchmarks: evaluation/BENCHMARK.md (dentro del repositorio del modelo)
- Archivo portable v1.1.1: https://huggingface.co/BuilderHelm/Parakeet-CTC-110M-CoreML/resolve/v1.1.1/releases/parakeet-ctc-110m-coreml-v1.1.1-portable.zip
- Dataset Earnings22 contextual: https://huggingface.co/datasets/argmaxinc/contextual-earnings22
