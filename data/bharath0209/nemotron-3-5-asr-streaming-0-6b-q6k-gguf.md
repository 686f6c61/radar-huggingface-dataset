# Bharath0209/nemotron-3.5-asr-streaming-0.6b-q6k-gguf

## Resumen

Nemotron 3.5 ASR Streaming 0.6B en formato Q6_K GGUF es una cuantizacion no oficial del modelo de reconocimiento automatico del habla (ASR) `nvidia/nemotron-3.5-asr-streaming-0.6b`, publicada por el usuario Bharath0209. El modelo base, desarrollado por NVIDIA, es un sistema ASR en streaming de aproximadamente 638 millones de parametros, pensado para transcripcion de audio en tiempo real con una ventana de anticipacion (lookahead) reducida. Esta version concreta esta empaquetada para su uso con `parakeet.cpp`, el runtime en C/C++ basado en ggml que permite ejecutar modelos tipo parakeet/Nemotron ASR en hardware modesto.

La aportacion principal de esta ficha no es el modelo en si, sino la cuantizacion: frente a la conversion Q8_0 de referencia de mudler, este fichero almacena en Q8_0 las 48 convoluciones pointwise del conformer, la salida conjunta (joint output), el kernel de prompt y la LSTM de prediccion, que en las demas cuantizaciones permanecian en F32 (288 MiB). El resultado es un fichero de 577 MB frente a 984 MB, con un consumo de VRAM tras la carga de 630 MiB frente a 1.016 MiB (una reduccion del 38%), manteniendo la precision practicamente intacta.

Es relevante ahora porque demuestra que es posible desplegar ASR en streaming de calidad razonable en GPUs de gama baja (8 GB o menos), e incluso plantear su ejecucion en entornos con recursos limitados, sin sacrificar WER de forma significativa. La licencia OpenMDW-1.1 se hereda del modelo original de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) con LSTM de prediccion y modulo joint, orientada a streaming (cache-aware) |
| Parametros totales | 638.030.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (streaming con lookahead de 1,12 s) |
| Tipos de cuantizacion | Q6_K para la mayoria de tensores; Q8_0 para convoluciones pointwise, joint output, prompt kernel y LSTM de prediccion |
| Idiomas soportados | no disponible en la informacion proporcionada (los benchmarks cubren 28 idiomas de FLEURS, incluidos japones y mandarin) |
| Licencia | OpenMDW-1.1 (heredada de NVIDIA) |
| Formato de pesos | GGUF (`nemotron-3.5-asr-streaming-0.6b-q6_k-pwq8-decq8.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un sistema ASR de tipo conformer, una arquitectura que combina bloques de atencion con convoluciones, habitual en reconocimiento de voz moderno. Incluye una LSTM de prediccion y un modulo joint, lo que sugiere un diseno de tipo transducer (RNN-T o similar) adecuado para decodificacion en streaming. La variante "streaming" incorpora decodificacion cache-aware con un lookahead de 1,12 s, lo que permite procesar audio de forma incremental sin esperar a la frase completa.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino especifico en la informacion proporcionada. Esta ficha describe una cuantizacion: el autor indica explicitamente que "nada fue reentrenado" y que todos los tensores distintos de los mencionados son byte-identicos al fichero de origen. La innovacion tecnica de esta publicacion es, por tanto, la decision de cuantizar a Q8_0 componentes que otras conversiones dejan en F32, reduciendo el peso del fichero y la VRAM sin degradar la precision de forma apreciable.

## Capacidades

- Reconocimiento automatico del habla (ASR) en modo streaming con lookahead de 1,12 s.
- Transcripcion de audio en 28 idiomas segun la evaluacion FLEURS (incluye japones y mandarin, evaluados con CER en lugar de WER).
- Robustez ante ruido: evaluado en seis condiciones de ruido sobre FLEURS en ingles e hindi.
- Transcripcion de grabaciones largas: probado con reuniones AMI (ES2004a-d) y una llamada de Earnings-22.
- Ejecucion mediante `parakeet.cpp` con backend CUDA; compatible con builds estandar que cargan ficheros q6_k.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripcion en tiempo real de reuniones y videoconferencias: el modo streaming con lookahead de 1,12 s permite generar subtitulos o actas parciales mientras se habla, y el modelo ha sido evaluado precisamente sobre el corpus AMI de reuniones.
- Subtitulado en directo de retransmisiones: al ejecutarse en GPUs de 8 GB o menos, puede desplegarse junto a otros servicios en el mismo nodo sin monopolizar la VRAM.
- Asistentes de voz embebidos: con 577 MB de fichero y 630 MiB de VRAM tras la carga, es viable en estaciones de trabajo modestas o dispositivos con GPU integrada compatible con CUDA.
- Transcripcion de llamadas de atencion al cliente: el modelo fue probado con una llamada de Earnings-22, lo que respalda su uso en audio telefónico de dominio financiero.
- Procesamiento por lotes de archivos de audio multilingues: los 28 idiomas evaluados en FLEURS permiten cubrir pipelines de transcripcion internacionales, aunque la lista exacta de idiomas no esta publicada en esta ficha.
- Transcripcion en entornos con ruido: las pruebas en seis condiciones de ruido sobre ingles e hindi lo hacen adecuado para grabaciones de campo, movilidad o salas no acondicionadas.
- Integracion en herramientas de linea de comandos y scripts: `parakeet-cli` permite invocarlo directamente (`parakeet-cli transcribe --model ... --input audio.wav --lang en-US`), lo que facilita su inclusion en pipelines automatizados.

## Benchmarks y rendimiento

Mediciones realizadas por el autor en una RTX A1000 (8 GB) con CUDA y streaming cache-aware (lookahead de 1,12 s), comparando con la conversion Q8_0 de mudler.

| Metrica | mudler `q8_0` | Este fichero (Q6_K) |
|---|---:|---:|
| Tamano de fichero | 984 MB | 577 MB |
| VRAM tras la carga | 1.016 MiB | 630 MiB (−38%) |
| Computo GPU por segundo de audio | 49,4 ms | 43,9 ms (−11%) |
| WER FLEURS, 28 idiomas × 30 clips (media) | 18,20% | 18,05% |
| WER/CER ruido: FLEURS en e hi, 6 condiciones (agregado) | 26,79% | 26,61% |
| WER grabaciones largas: AMI ES2004a-d y Earnings-22 (media) | 24,10% | 23,72% |

El autor indica ademas que las variantes Q5_K y Q4_K generadas con el mismo metodo tambien se probaron: Q5_K empeoro en audio de reunion en campo lejano y Q4_K fue entre 1,1 y 1,4 puntos peor en FLEURS. No se han publicado resultados de benchmarks adicionales (tipo MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 630 MiB tras la carga del fichero Q6_K (frente a 1.016 MiB de la version Q8_0 de mudler).
- Tamano en disco: 577 MB para el fichero GGUF.
- GPU recomendadas: el autor valido el modelo en una NVIDIA RTX A1000 de 8 GB; por su reducido consumo, deberia caber en cualquier GPU NVIDIA con soporte CUDA y al menos 1 GB de VRAM libre.
- Cabe en GPU de consumo: si, con margen amplio; el cuello de botella es la compatibilidad CUDA del build de `parakeet.cpp`, no la memoria.
- Opciones de despliegue: `parakeet.cpp` (build con CUDA, probado sobre upstream `5c9b0fb`) mediante `parakeet-cli`. No se documentan en la informacion disponible otras opciones como vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: 43,9 ms de computo GPU por segundo de audio en RTX A1000, es decir, aproximadamente 22,8 segundos de audio procesados por segundo de computo GPU (sin contar overhead de E/S y decodificacion). El lookahead de streaming es de 1,12 s.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / tamano | VRAM tras carga | WER FLEURS (media) | Licencia |
|---|---|---:|---:|---:|---|
| Este fichero (Q6_K) | 638 M | GGUF, 577 MB | 630 MiB | 18,05% | OpenMDW-1.1 |
| mudler `q8_0` (misma base) | 638 M | GGUF, 984 MB | 1.016 MiB | 18,20% | OpenMDW-1.1 |
| Variante Q4_K (mismo metodo) | 638 M | GGUF, no disponible | no disponible | 1,1-1,4 puntos peor en FLEURS | OpenMDW-1.1 |
| `nvidia/nemotron-3.5-asr-streaming-0.6b` (original) | 638 M | safetensors, no disponible | no disponible | no disponible | OpenMDW-1.1 |

No se dispone en la informacion proporcionada de comparaciones con otros sistemas ASR de la misma categoria (por ejemplo, Whisper u otros modelos de NVIDIA), por lo que la comparativa se limita a las variantes derivadas del mismo modelo base.

## Limitaciones y advertencias

- Es una cuantizacion no oficial: el autor declara explicitamente que no esta respaldada por NVIDIA ni por los autores de `parakeet.cpp`.
- El WER en condiciones de ruido (26,61% agregado) y en grabaciones largas (23,72%) es notablemente superior al de FLEURS limpio (18,05%), lo que limita su uso en escenarios acusticamente adversos.
- La variante Q6_K no es la mas agresiva en compresion; el propio autor reporta que Q4_K degrada 1,1-1,4 puntos en FLEURS y Q5_K empeora en audio de reunion en campo lejano, por lo que reducir mas el tamano tiene coste en precision.
- La lista exacta de idiomas soportados no esta publicada en la informacion disponible; solo se confirma la evaluacion sobre 28 idiomas de FLEURS.
- No hay informacion sobre sesgos demograficos, acentos o variedades dialectales en la informacion proporcionada.
- La licencia OpenMDW-1.1 impone sus propios terminos; debe revisarse el fichero `LICENSE` y `NOTICE` del repositorio antes de un uso comercial.
- El modelo esta pensado para streaming con lookahead de 1,12 s; no se documenta su comportamiento en modo offline de frase completa.
- Solo se ha validado con un build CUDA de `parakeet.cpp` basado en upstream `5c9b0fb`; otras versiones o backends no estan verificados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Bharath0209/nemotron-3.5-asr-streaming-0.6b-q6k-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Conversion Q8_0 de referencia (mudler): https://huggingface.co/mudler/parakeet-cpp-gguf
- Repositorio `parakeet.cpp`: https://github.com/mudler/parakeet.cpp
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
