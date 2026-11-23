# litert-community/Phonon-2.5-English

## Resumen

Phonon-2.5-English para LiteRT es una conversión optimizada del modelo de reconocimiento automático de voz FermionResearch/Phonon-2.5-English, publicada por la comunidad litert-community. El modelo original es un sistema de transcripción de voz a texto en inglés basado en la arquitectura Parakeet con decodificación TDT (Token-and-Duration Transducer), y esta versión lo empaqueta en formato TFLite para su despliegue en dispositivos Android, con variantes específicas para NPU, GPU y CPU.

La relevancia de esta conversión radica en su rendimiento en hardware móvil: según la model card, transcribe 179 veces más rápido que el tiempo real en la NPU de un Galaxy S26 (SoC SM8850), 51 veces en su GPU y 57 veces en su CPU. En un Pixel 11 Pro alcanza 27 veces el tiempo real en GPU. En LibriSpeech test-clean obtiene una tasa de error de palabra (WER) del 1,647 % en la NPU del Galaxy S26, frente al 1,655 % de la ejecución de referencia en PyTorch con float32.

El repositorio ocupa 3,8 GB e incluye el encoder en tres variantes (float16 compilado para NPU, float16 para GPU e int8 para CPU), el front end log-mel para siete longitudes de ventana, el decodificador TDT en int8, el tokenizer y un runner de línea de comandos para Android. La licencia es CC-BY-4.0 y el único idioma soportado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet con decodificador TDT (Token-and-Duration Transducer); encoder transformer con subsampling convolucional y atencion con posiciones relativas |
| Parametros totales | no disponible (el encoder int8 pesa 902 MB y el f16 1,45 GB; el decodificador int8, 17,9 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de hasta 30 s (479.840 muestras a 16 kHz); longitudes intermedias de 5, 7,5, 10, 15, 20 y 25 s |
| Tipos de cuantizacion | float16 (GPU y NPU) e int8 con escala por canal de salida en capas lineales y convoluciones 1x1 (CPU); convoluciones depthwise y tablas de posicion relativa en float32 |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | TFLite (LiteRT); incluye tokenizer.json en formato Hugging Face |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Parakeet con decodificacion TDT, un esquema transducer que predice conjuntamente el token y su duracion en frames, lo que permite emitir varios tokens por frame y acelerar la decodificacion. El pipeline es: audio mono a 16 kHz, troceado en ventanas de 30 s, front end log-mel (STFT de 512 puntos, ventana Hann de 400 muestras, hop de 160, 128 bins mel Slaney, normalizacion por ventana), encoder que produce representaciones de 640 dimensiones con reduccion temporal de 8x, y decodificacion greedy TDT en el host. El encoder incorpora 24 tablas de posicion relativa y convoluciones depthwise que se mantienen en float32 incluso en la variante int8.

La conversion a LiteRT se realizo con litert-torch 0.9.4 para LiteRT 2.3.0. La variante NPU se compilo a priori para la Hexagon NPU del SM8850 con Qualcomm AI Runtime (QAIRT) 2.50, compartiendo una unica copia compilada de los pesos entre las siete longitudes de ventana. En la variante float16, los pesos de capas lineales y convoluciones se almacenan en float16 y las entradas de LayerNorm se reescalan para evitar desbordamiento aritmetico. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF o DPO; esos datos corresponden al modelo base FermionResearch/Phonon-2.5-English y no se detallan en la informacion proporcionada.

## Capacidades

- Transcripcion de voz a texto en ingles con calidad cercana a la referencia float32 (WER de 1,647 % en NPU frente a 1,655 % en PyTorch float32 sobre LibriSpeech test-clean).
- Procesamiento por ventanas de audio de hasta 30 s, con seleccion automatica de la longitud de grafo mas corta que contenga la ventana (5, 7,5, 10, 15, 20, 25 o 30 s).
- Decodificacion TDT greedy con prediccion conjunta de token y duracion (0-4 frames por paso), hasta 3.750 pasos por ventana.
- Ejecucion en tres backends de Android: NPU Hexagon del SM8850, GPU y CPU; tambien ejecutable en CPU de escritorio desde Python.
- Pipeline multihilo opcional (`--pipeline 2`) que solapa el front end mel, el encoder y la decodificacion de ventanas consecutivas, con profundidad de cola configurable.
- Procesamiento de audio largo mediante concatenacion de ventanas de 30 s con un espacio entre textos.
- No soporta tool calling, function calling, agentes, vision ni audio mas alla de la transcripcion; es un modelo unimodal de ASR.

## Casos de uso

- Transcripcion en tiempo real en movil: la NPU del Galaxy S26 procesa 179 veces mas rapido que el tiempo real, lo que permite transcribir dictado o reuniones en directo sin enviar audio a la nube y con un pico de memoria de 1,63 GB.
- Subtitulado de videos y podcasts en ingles: el procesamiento por ventanas de 30 s y el pipeline multihilo permiten generar subtitulos con marcas temporales por ventana, adecuado para contenido de larga duracion en dispositivos moviles.
- Notas de voz y actas de reunion: integrado en una app Android, transcribe grabaciones locales en el dispositivo, lo que resulta apropiado por privacidad (el audio no sale del telefono) y por el bajo consumo energetico de la NPU.
- Asistentes de voz offline: el modelo puede alimentar un pipeline de comandos por voz en ingles sin conexion, con latencia muy baja gracias a las 51x-179x veces el tiempo real segun backend.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en directo de conversaciones presenciales en el propio telefono, con la variante int8 para CPU en dispositivos sin NPU compatible (pico de 6,09 GB en Galaxy S26, 6,16 GB en Pixel 11 Pro).
- Procesamiento por lotes en servidor: la variante para CPU de escritorio desde Python permite transcribir grandes volumenes de audio en ingles en entornos sin GPU, con la ventaja de que el mismo binario TFLite funciona en movil y escritorio.
- Investigacion en ASR eficiente: el runner de linea de comandos y los scripts incluidos (`ultra_asr_runner_p7.cc`, `build_android.sh`, `tdt_text.py`) sirven como base para experimentar con decodificacion TDT y despliegue LiteRT en hardware movil.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| WER en LibriSpeech test-clean (NPU Galaxy S26) | 1,647 % |
| WER en LibriSpeech test-clean (PyTorch float32 de referencia) | 1,655 % |
| Velocidad en NPU Galaxy S26 (SM8850) | 179x tiempo real |
| Velocidad en GPU Galaxy S26 | 51x tiempo real |
| Velocidad en CPU Galaxy S26 | 57x tiempo real |
| Velocidad en GPU Pixel 11 Pro | 27x tiempo real |
| Pico de memoria en NPU Galaxy S26 (12 GB) | 1,63 GB |
| Pico de memoria en GPU Galaxy S26 | 3,63 GB |
| Pico de memoria en CPU Galaxy S26 | 6,09 GB (Android cerro 20 apps en segundo plano) |
| Pico de memoria en GPU Pixel 11 Pro (16 GB) | 2,40 GB |
| Pico de memoria en CPU Pixel 11 Pro | 6,16 GB (sin cierre de apps) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, al tratarse de un modelo de ASR.

## Requisitos de hardware

- VRAM/memoria estimada: NPU 1,63 GB de pico; GPU 3,63 GB (Galaxy S26) o 2,40 GB (Pixel 11 Pro); CPU 6,09-6,16 GB de pico. El peso de los ficheros es de 1,44 GB (NPU con mel, decoder y tokenizer), 1,48 GB (f16 GPU) y 0,94 GB (i8 CPU).
- GPU recomendadas: no aplica GPU de escritorio; el modelo esta pensado para GPU integradas moviles Adreno del SM8850 y del Tensor de Pixel 11 Pro. La ejecucion en CPU de escritorio desde Python es posible pero sin datos de rendimiento publicados.
- Cabe en GPU consumer: no es el objetivo; en movil cabe en telefonos de 12 GB (Galaxy S26) y 16 GB (Pixel 11 Pro). La variante CPU requiere cerrar aplicaciones en segundo plano en dispositivos de 12 GB.
- Opciones de despliegue: LiteRT 2.3.0 con el runner C incluido; en Android mediante la API C de LiteRT; en escritorio mediante Python. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: 179x tiempo real en NPU SM8850, 51x en GPU SM8850, 57x en CPU SM8850 y 27x en GPU Pixel 11 Pro. El pipeline multihilo (`--pipeline 2`) no altera los tokens producidos (verificado sobre 658 ventanas de un subconjunto de 655 utterances de LibriSpeech) y solo aporta ganancia con multiples ventanas o ficheros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Phonon-2.5-English (LiteRT) | no disponible | 30 s | en | CC-BY-4.0 | TFLite | Optimizado para NPU/GPU/CPU Android; 179x tiempo real en SM8850 |
| FermionResearch/Phonon-2.5-English | no disponible | no disponible | en | no disponible en la informacion | PyTorch (modelo base) | Referencia float32 con WER 1,655 % en LibriSpeech test-clean |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B (por el nombre del tokenizer) | no disponible | no disponible | no disponible en la informacion | no disponible | Mismo tokenizer que Phonon-2.5 English; arquitectura Parakeet TDT |

La informacion disponible no permite comparar con otros modelos ASR en cuanto a WER, latencia o licencia; los datos de parakeet-tdt-0.6b-v3 se limitan a que su tokenizer es el que reutiliza Phonon-2.5 English.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues.
- El corte de audio largo se hace en puntos fijos de 30 s, no en pausas, por lo que las palabras en el limite pueden dividirse o perderse: en un clip de VoxPopuli de 38 s se pierden las 13 palabras alrededor del corte de 30 s, tanto en la referencia PyTorch como en las variantes NPU y GPU.
- Las ventanas de menos de 320 muestras (dos frames mel) se descartan y no generan texto.
- El token 3 (`<|endoftext|>`) no se marca como especial en el tokenizer, lo que puede requerir filtrado adicional al decodificar.
- La variante NPU esta compilada especificamente para la Hexagon NPU del SM8850 (Snapdragon del Galaxy S26); no es portable a otros SoC sin recompilacion con QAIRT.
- En la variante int8, las convoluciones depthwise y las 24 tablas de posicion relativa permanecen en float32, lo que limita la reduccion de memoria y puede afectar al rendimiento en CPU.
- La ejecucion en CPU en dispositivos de 12 GB provoca cierre de aplicaciones en segundo plano (20 apps cerradas en el Galaxy S26), lo que desaconseja su uso en produccion en esos dispositivos.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion o datos de entrenamiento del modelo base; al ser un modelo ASR, el riesgo principal es la transcripcion erronea, no la generacion libre de texto.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero se debe verificar la licencia del modelo base FermionResearch/Phonon-2.5-English, no detallada en la informacion proporcionada.
- El rendimiento en GPU y CPU es notablemente inferior al de la NPU (51x y 57x frente a 179x), lo que condiciona la eleccion de backend segun el dispositivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Phonon-2.5-English
- Modelo base: https://huggingface.co/FermionResearch/Phonon-2.5-English
- Tokenizer de referencia: nvidia/parakeet-tdt-0.6b-v3 (citado en la model card; no se proporciona URL directa en la informacion disponible)
- LiteRT: no se proporciona URL en la informacion disponible
- Qualcomm AI Runtime (QAIRT) 2.50: no se proporciona URL en la informacion disponible
- litert-torch 0.9.4: no se proporciona URL en la informacion disponible
