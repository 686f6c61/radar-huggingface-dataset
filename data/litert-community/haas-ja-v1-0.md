# litert-community/Haas-ja-v1.0

## Resumen

Haas-ja-v1.0 para LiteRT es la conversión optimizada del modelo de reconocimiento automático de voz (ASR) en japonés `third-intelligence/Haas-ja-v1.0`, publicada por la comunidad `litert-community`. El modelo original emplea una arquitectura FastConformer con decodificación TDT (Token-and-Duration Transducer) y capas de atención Kimi Delta Attention (KDA) en la red de predicción, orientada a transcripción de audio de 16 kHz. Esta versión traduce los pesos a formato TensorFlow Lite (`.tflite`) para su ejecución en dispositivos Android mediante LiteRT 2.3.0, con rutas específicas para NPU, GPU y CPU.

La relevancia de esta ficha radica en que demuestra un caso real de despliegue de ASR de alta calidad en hardware móvil: sobre la NPU de un Galaxy S26 transcribe 184 veces más rápido que tiempo real, con una tasa de error de caracteres (CER estricta) del 3,7009 % en el conjunto de test japonés de FLEURS, frente al 3,6886 % de la referencia PyTorch en float32. Es decir, la cuantización y compilación apenas degradan la precisión mientras multiplican la velocidad.

El repositorio incluye variantes del encoder para ventanas de 10, 15, 20 y 30 segundos, en int8 (CPU) y float16 (GPU/NPU), además de un front-end log-mel, el decodificador TDT y un runner de línea de comandos para Android. La licencia es Apache 2.0 y el modelo solo soporta japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer); red de predicción con dos capas Kimi Delta Attention (KDA) |
| Parametros totales | no disponible (el encoder f16 en un solo fichero ocupa 1.335.000.480 bytes; el int8 de 30 s, 665.458.528 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de hasta 30 s (480.000 muestras a 16 kHz); variantes de 10, 15, 20 y 30 s |
| Tipos de cuantizacion | int8 (pesos y activaciones en capas lineales y convoluciones 1x1; depthwise y tablas de posición relativa en float32), float16 (pesos en lineales y convoluciones, LayerNorm rescalado para evitar desbordamiento) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | TensorFlow Lite (`.tflite`); tokenizador SentencePiece (`tokenizer.model`) |

## Arquitectura y entrenamiento

El modelo base es un FastConformer de reconocimiento de voz en japonés con decodificación TDT, una variante de transducer que predice conjuntamente tokens y duraciones. La red de predicción incorpora dos capas de Kimi Delta Attention (KDA), un mecanismo de atención lineal recurrente. El pipeline completo es: audio mono a 16 kHz, troceado en ventanas de 30 s (480.000 muestras), front-end log-mel (pre-énfasis 0,97, STFT de 512 puntos, ventana de 400 muestras, salto de 160, 128 bins mel, normalización por bin sobre frames válidos), encoder y decodificación TDT greedy.

La conversión se realizó con `litert-torch` 0.9.4 para LiteRT 2.3.0. Cada grafo del encoder contiene el encoder completo; las distintas longitudes de ventana solo evitan el trabajo de padding en audio corto. Según la model card, en float32 las variantes de ventana produjeron los mismos tokens que la referencia PyTorch en las 650 utterances de FLEURS (131/489/30 en los grafos de 10/20/30 s, y 351 de las 489 que caben en el grafo de 15 s). No se detallan en la información disponible el número de tokens de entrenamiento ni la composición del dataset original, ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento automático de voz (ASR) en japonés a partir de audio mono de 16 kHz.
- Transcripción de audio largo mediante troceado en ventanas fijas de 30 s, con unión de textos sin separador.
- Ejecución en tres backends: NPU (Qualcomm SM8850, compilado con QAIRT 2.50.0.260828), GPU y CPU, con ficheros específicos por backend.
- Ejecución en CPU de escritorio desde Python, además de Android.
- Selección automática de bucket por longitud de ventana (10, 15, 20 o 30 s) para minimizar el cómputo de padding.
- Front-end log-mel autocontenido en TFLite, sin dependencia de NeMo en tiempo de inferencia.
- No soporta tool calling, agentes, visión ni audio más allá de la transcripción; no es un modelo generativo de propósito general.

## Casos de uso

- Transcripción de voz en tiempo real en Android: el modelo corre a 184x tiempo real en la NPU de un Galaxy S26 (63x en GPU, 46x en CPU), lo que permite subtitulado en directo de conversaciones sin enviar audio a la nube.
- Dictado por voz en aplicaciones móviles: con ventanas de 10 s y el encoder int8 (616 MB) se puede ofrecer dictado offline en dispositivos de gama alta sin conexión.
- Subtitulado de reuniones y notas de voz: el troceado en ventanas de 30 s y la unión de textos permiten procesar grabaciones largas por bloques, con la salvedad de que los cortes son fijos y no en pausas.
- Asistentes de voz embebidos para japonés: la baja latencia en NPU y el front-end mel incluido simplifican la integración en pipelines de comandos de voz.
- Transcripción por lotes en servidor con CPU: los ficheros int8 (hasta 665 MB para 30 s) permiten desplegar en CPU sin GPU, con el runner de escritorio vía Python.
- Investigación en eficiencia de ASR: la comparación entre variantes int8 y f16 con la referencia PyTorch (CER 3,7009 % frente a 3,6886 %) sirve como caso de estudio de cuantización en transductores.
- Prototipado de aplicaciones de accesibilidad: transcripción offline de audio para personas con discapacidad auditiva en dispositivos Android.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| CER estricta en FLEURS japonés (NPU) | 3,7009 % |
| CER estricta en FLEURS japonés (PyTorch float32) | 3,6886 % |
| Velocidad en NPU (Galaxy S26) | 184x tiempo real |
| Velocidad en GPU (Galaxy S26) | 63x tiempo real |
| Velocidad en CPU (Galaxy S26) | 46x tiempo real |
| Utterances evaluadas | 650 (la más larga, 28,2 s) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo es exclusivamente de ASR.

## Requisitos de hardware

- VRAM/RAM estimada: 1,35 GB en NPU con el fichero único `sm8850`; 4,88 GB en NPU si se compilan los cuatro ficheros f16 en el teléfono; 3,67 GB en GPU (tres ficheros f16); 1,94 GB en CPU y escritorio (ficheros int8).
- GPU recomendadas: no se especifican modelos de escritorio; en móvil se valida sobre Qualcomm SM8850 (Galaxy S26). Para NPU se requiere compilación específica con QAIRT 2.50.0.260828.
- Cabe en GPU de consumo: no disponible la confirmación para RTX 4090 u otras; el encoder f16 de 30 s ocupa 1,24 GB, por lo que en teoría cabría en GPUs con 8 GB o más, pero no hay datos de rendimiento publicados para escritorio.
- Opciones de despliegue: LiteRT 2.3.0 (C API) en Android mediante los runners `haas_asr_runner` y `haas_asr_runner_p8`; ejecución desde Python en CPU de escritorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: 184x tiempo real en NPU, 63x en GPU y 46x en CPU del Galaxy S26; no se publican latencias absolutas ni throughput en escritorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER FLEURS ja | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haas-ja-v1.0 (LiteRT) | no disponible | ventanas de 30 s | 3,7009 % (NPU) | Apache 2.0 | Hugging Face, TFLite |
| third-intelligence/Haas-ja-v1.0 (original) | no disponible | ventanas de 30 s | 3,6886 % (float32) | Apache 2.0 | Hugging Face, NeMo |
| Alternativas ASR japonés (p. ej. Whisper) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de modelos alternativos comparables, por lo que la comparativa se limita al modelo original frente a su conversión.

## Limitaciones y advertencias

- Solo soporta japonés; no hay capacidades multilingües.
- El troceado de audio largo se hace en puntos fijos de 30 s, no en pausas; no se midió el efecto en palabras que cruzan un corte (el código original `transcribe_longform` corta en puntos silenciosos).
- Las ventanas de menos de 320 muestras se descartan sin generar texto.
- Las rutas GPU, CPU y el script de escritorio no tienen par de 15 s: una ventana de más de 160.000 muestras pasa a 20 o 30 s, con más padding.
- Riesgo de alucinación y errores en audio con ruido, acentos o dominios no representados; no se documentan sesgos específicos en la información disponible.
- La ejecución en NPU requiere compilación específica para el SoC (SM8850) y QAIRT 2.50.0.260828; no es portable a otros aceleradores sin recompilar.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original.
- El rendimiento en escritorio solo se valida en CPU vía Python; no hay datos de GPU de escritorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Haas-ja-v1.0
- Modelo base original: https://huggingface.co/third-intelligence/Haas-ja-v1.0
- LiteRT: https://ai.google.dev/edge/litert
- litert-torch: https://github.com/google-ai-edge/litert-torch
- NeMo (front-end AudioToMelSpectrogramPreprocessor): https://github.com/NVIDIA/NeMo
- QAIRT (Qualcomm AI Runtime): https://www.qualcomm.com/developer/software/qualcomm-ai-engine-direct
