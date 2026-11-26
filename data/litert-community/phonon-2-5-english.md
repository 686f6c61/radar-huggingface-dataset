# litert-community/Phonon-2.5-English

## Resumen

Phonon-2.5-English para LiteRT es una conversión optimizada del modelo de reconocimiento automático de voz (ASR) FermionResearch/Phonon-2.5-English, publicada por la comunidad litert-community. El modelo original es un sistema de transcripción de voz a texto en inglés basado en la arquitectura Parakeet con decodificación TDT (Token-and-Duration Transducer), y esta versión lo empaqueta en formato TFLite para su despliegue en dispositivos Android, con variantes específicas para NPU, GPU y CPU.

La relevancia de esta ficha radica en que demuestra un caso práctico de inferencia de un modelo de voz de gran tamano (el encoder ronda los 700 millones de parámetros en float16) directamente en un teléfono móvil. Según la model card, alcanza 179 veces el tiempo real en la NPU de un Galaxy S26 (Snapdragon SM8850), 51 veces en GPU y 57 veces en CPU, con una tasa de error de palabra (WER) del 1,647 % en LibriSpeech test-clean, prácticamente idéntica al 1,655 % de la referencia en PyTorch float32.

El modelo está pensado para desarrolladores que necesitan ASR de alta calidad, offline y de baja latencia en Android, con soporte para ventanas de audio de 5 a 30 segundos y un pipeline de tres etapas (front-end mel, encoder y decodificador) que puede paralelizarse entre hilos. La licencia CC-BY-4.0 permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet con decodificador TDT (Token-and-Duration Transducer); encoder transformer con subsampling convolucional y atencion con posiciones relativas |
| Parametros totales | no disponible (el encoder f16 pesa 1,45 GB; el i8, 902 MB; el decodificador i8, 17,9 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de hasta 30 s (479.840 muestras a 16 kHz); longitudes intermedias de 5, 7,5, 10, 15, 20, 25 y 30 s |
| Tipos de cuantizacion | float16 (encoder GPU), int8 con escala por canal de salida (encoder y decodificador CPU), float32 en convoluciones depthwise y tablas de posicion relativa |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | TFLite (LiteRT); tokenizer en JSON; runner en C++ |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Parakeet con decodificador TDT, un esquema transducer que predice conjuntamente tokens y duraciones (0 a 4 frames por paso), lo que permite decodificación greedy sin beam search. El encoder procesa features log-mel de 128 bins (STFT de 512 puntos, ventana Hann de 400 muestras, hop de 160) y produce representaciones de dimension 640 con un factor de reduccion temporal de 8. La decodificacion se realiza en el host con una red de prediccion recurrente (estado h y c de 640) y una red conjunta que emite 8.198 logits (8.193 tokens mas blank, y 5 logits de duracion).

La informacion disponible no detalla el numero de tokens de entrenamiento ni la composicion del dataset original de FermionResearch/Phonon-2.5-English. Esta version concreta es una conversion con litert-torch 0.9.4 para LiteRT 2.3.0, con compilacion ahead-of-time para la NPU Hexagon del SM8850 mediante QAIRT 2.50. Las innovaciones tecnicas destacables son la reutilizacion de una unica copia de los pesos para las siete longitudes de ventana (firmas `enc5` a `enc30`), el reescalado de las entradas de LayerNorm para evitar desbordamientos en float16, y un pipeline de ejecucion multihilo que solapa el front-end mel, el encoder y la decodificacion.

## Capacidades

- Transcripcion de voz a texto en ingles con calidad cercana a la referencia float32 (WER 1,647 % en LibriSpeech test-clean en NPU).
- Procesamiento de audio de 16 kHz mono en ventanas de 5 a 30 segundos, con seleccion automatica de la ventana mas pequena que contiene cada fragmento.
- Decodificacion TDT greedy con prediccion conjunta de token y duracion (0 a 4 frames), sin necesidad de beam search.
- Ejecucion en tres backends: NPU Hexagon (SM8850), GPU y CPU, con ficheros TFLite especificos para cada uno.
- Pipeline multihilo (`--pipeline 2`) que solapa front-end, encoder y decodificacion entre ventanas y ficheros.
- Soporte de audio largo mediante corte en puntos fijos de 30 s y concatenacion de textos por ventana.
- Tokenizer compatible con nvidia/parakeet-tdt-0.6b-v3.
- No soporta tool calling, agentes, vision ni audio mas alla de la transcripcion; es un modelo puramente ASR.

## Casos de uso

- Transcripcion offline en Android: integracion del fichero NPU en una app de notas de voz que transcribe en tiempo real sin conexion, aprovechando las 179 veces el tiempo real del Galaxy S26 para procesar audio pregrabado casi instantaneamente.
- Subtitulado de reuniones y clases: el pipeline multihilo permite procesar ficheros de audio de varios minutos por ventanas de 30 s solapadas en hilos, adecuado para generar subtitulos con latencia baja en dispositivos de gama alta.
- Asistentes de voz embebidos: la variante i8 para CPU (902 MB) permite desplegar ASR en telefonos sin NPU dedicada, con un pico de memoria de 6,09 GB en el Galaxy S26 y 6,16 GB en el Pixel 11 Pro.
- Dictado en aplicaciones de productividad: con ventanas de 5 a 10 s y el encoder f16 en GPU, se obtiene transcripcion de frases cortas con latencia reducida (51 veces el tiempo real en GPU del Galaxy S26).
- Procesamiento por lotes en servidor: el runner de linea de comandos y la version para CPU de escritorio desde Python permiten transcribir grandes volumenes de audio en infraestructura sin GPU.
- Investigacion en ASR eficiente: la conversion sirve como referencia para estudiar cuantizacion int8/f16, compilacion AOT para NPU y pipelines de decodificacion TDT en dispositivos moviles.
- Accesibilidad: transcripcion de conversaciones presenciales en tiempo real en el propio telefono, sin enviar audio a la nube, lo que reduce riesgos de privacidad.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| WER LibriSpeech test-clean | 1,647 % | NPU Galaxy S26 (SM8850) |
| WER LibriSpeech test-clean | 1,655 % | Referencia PyTorch float32 |
| Velocidad de transcripcion | 179x tiempo real | NPU Galaxy S26 |
| Velocidad de transcripcion | 51x tiempo real | GPU Galaxy S26 |
| Velocidad de transcripcion | 57x tiempo real | CPU Galaxy S26 |
| Velocidad de transcripcion | 27x tiempo real | GPU Pixel 11 Pro |
| Pico de memoria | 1,63 GB | NPU Galaxy S26 (12 GB) |
| Pico de memoria | 3,63 GB | GPU Galaxy S26 |
| Pico de memoria | 6,09 GB | CPU Galaxy S26 |
| Pico de memoria | 2,40 GB | GPU Pixel 11 Pro (16 GB) |
| Pico de memoria | 6,16 GB | CPU Pixel 11 Pro |

No se han publicado en la informacion disponible resultados de benchmarks comparativos con otros modelos ASR (MMLU, HumanEval u otros no aplican a esta tarea).

## Requisitos de hardware

- VRAM/RAM estimada: 1,63 GB en NPU (Galaxy S26), 3,63 GB en GPU (Galaxy S26), 6,09 GB en CPU (Galaxy S26); 2,40 GB en GPU y 6,16 GB en CPU en Pixel 11 Pro.
- NPU: requiere Qualcomm Hexagon del SM8850 (Snapdragon de Galaxy S26) con el fichero compilado AOT mediante QAIRT 2.50.
- GPU: fichero f16 de 1,45 GB; funciona en GPU de moviles de gama alta (Galaxy S26, Pixel 11 Pro).
- CPU: fichero i8 de 902 MB; en el Galaxy S26 Android cerro 20 apps en segundo plano durante la ejecucion por falta de memoria.
- Escritorio: el modelo puede ejecutarse desde Python en CPU de escritorio; el runner se ha compilado para macOS.
- Despliegue: LiteRT 2.3.0 con el runner C++ incluido (`ultra_asr_runner_p7.cc` y `build_android.sh`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: 179x, 51x y 57x tiempo real en NPU, GPU y CPU respectivamente en el Galaxy S26; 27x en GPU del Pixel 11 Pro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER LibriSpeech test-clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phonon-2.5-English LiteRT (esta ficha) | no disponible (encoder 1,45 GB f16) | ventanas de hasta 30 s | 1,647 % (NPU) | CC-BY-4.0 | Hugging Face, TFLite |
| FermionResearch/Phonon-2.5-English | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | no disponible | no disponible | no disponible | Hugging Face (tokenizer compatible) |

Los datos de comparacion con alternativas son limitados en la informacion proporcionada; no se dispone de cifras de rendimiento de los modelos comparables.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues.
- El corte de audio largo se hace en puntos fijos de 30 s, no en pausas, por lo que pueden perderse o dividirse palabras en el limite (se documenta la perdida de 13 palabras en un clip de 38 s de VoxPopuli).
- La decodificacion de cada ventana empieza desde blank con estado cero, sin contexto entre ventanas, lo que puede afectar a la coherencia en transcripciones largas.
- El fichero NPU esta compilado especificamente para el SM8850; no es portable a otras NPU sin recompilacion.
- El consumo de memoria en CPU es alto (6,09-6,16 GB), lo que provoca el cierre de apps en segundo plano en Android.
- Riesgo de alucinacion y errores en audio con ruido, acentos no nativos o vocabulario tecnico no representado en el entrenamiento; no se documentan sesgos especificos.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero el modelo base y sus datos de entrenamiento pueden tener condiciones adicionales no detalladas.
- El tokenizer se hereda de nvidia/parakeet-tdt-0.6b-v3, lo que ata el modelo a las decisiones de tokenizacion de ese proyecto.
- No se han publicado datos sobre sesgos demograficos ni evaluaciones fuera de LibriSpeech.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Phonon-2.5-English
- Modelo base: https://huggingface.co/FermionResearch/Phonon-2.5-English
- Tokenizer de referencia: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
