# danielbodart/nemotron-speech-600m-onnx

## Resumen

Nemotron Speech 600M ONNX es una exportación a formato ONNX del modelo de reconocimiento automático del habla (ASR) `nvidia/nemotron-speech-streaming-en-0.6b` de NVIDIA, publicada por el usuario danielbodart. Se trata de un modelo de 600 millones de parámetros orientado a transcripción en streaming, con una arquitectura FastConformer como encoder y un decodificador RNNT (Recurrent Neural Network Transducer) con red de predicción LSTM. El modelo original está entrenado exclusivamente en inglés y está pensado para aplicaciones de dictado, subtitulado y asistentes de voz de baja latencia.

La relevancia de esta exportación radica en que facilita el despliegue del modelo fuera del ecosistema NeMo, mediante ONNX Runtime en CPU x86 o GPU NVIDIA, con cuatro variantes de precisión (FP32, FP16, INT8 dinámica e INT8 estática). El autor documenta con detalle los parámetros de preprocesado de audio, las formas de las cachés de streaming y el bucle de decodificación, lo que permite implementar la inferencia sin depender de la librería original.

El modelo procesa audio en trozos de 560 ms con un contexto de caché de 9 tramas mel, lo que lo hace adecuado para transcripción en tiempo real con una latencia contenida. La licencia es CC-BY-4.0, lo que permite uso comercial con atribución. El repositorio ocupa 4,7 GB e incluye los grafos ONNX, el filtro mel y el vocabulario SentencePiece.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + RNNT con LSTM (decoder) |
| Parametros totales | 600 M (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | streaming por chunks de 560 ms; sin ventana global documentada |
| Tipos de cuantizacion | FP32, FP16, INT8 dinamica, INT8 estatica (QDQ) |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (encoder_model.onnx, decoder ONNX, filterbank.bin, tokens.txt) |

## Arquitectura y entrenamiento

El encoder es un FastConformer cache-aware de 24 capas y dimensión 1024, diseñado para procesar audio en streaming manteniendo dos cachés persistentes entre chunks: `cache_last_channel` de forma `[1, 24, 70, 1024]` y `cache_last_time` de forma `[1, 24, 1024, 8]`. La entrada es un espectrograma mel de 128 bandas a 16 kHz, con ventana de 25 ms, hop de 10 ms, FFT de 512 y normalización Slaney en disposición band-major. Cada chunk de 560 ms aporta 56 tramas mel más 9 tramas de precodificación procedentes del chunk anterior, sumando 65 tramas de entrada por paso.

El decodificador es un RNNT con red de predicción LSTM de 2 capas y 640 unidades ocultas, vocabulario SentencePiece de 1025 tokens (1024 más el token blank con ID 1024) y un máximo de 10 símbolos emitidos por trama. El bucle de decodificación alimenta cada trama del encoder al decoder, toma el argmax sobre el vocabulario y emite tokens hasta encontrar el blank o alcanzar el límite. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

La exportación se realizó directamente desde el checkpoint original de NeMo, no desde una conversión de terceros, según indica el autor. La variante INT8 estática emplea nodos QDQ con escalas de activación calibradas mediante un procedimiento de warm-cache streaming sobre 3.000 chunks de LibriSpeech dev-clean y dev-other y audio de reuniones reales, para evitar el colapso de tokens blank que afecta a la cuantización estática ingenua en modelos con estado de caché persistente.

## Capacidades

- Reconocimiento automático del habla en inglés con salida de texto token a token.
- Transcripción en streaming con latencia de chunk de 560 ms.
- Procesamiento de audio de 16 kHz en formato S16_LE con preprocesado mel integrado mediante `filterbank.bin`.
- Decodificación RNNT con gestión de estado interno (cachés de encoder y estados LSTM del decoder) para sesiones continuas.
- Ejecución en CPU x86 con instrucciones VNNI/AMX (variantes INT8) y en GPU NVIDIA vía CUDA Execution Provider.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión, audio de entrada distinto de voz, ni modos de pensamiento.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Subtitulado en directo de reuniones y videollamadas: el modelo procesa audio en chunks de 560 ms y mantiene estado entre chunks, lo que permite generar subtítulos con latencia inferior a un segundo en CPU x86 con la variante INT8 dinámica.
- Dictado por voz en aplicaciones de escritorio: la variante FP32 o FP16 en GPU NVIDIA ofrece transcripción de calidad con 8,3 ms por chunk en una RTX 5070 Ti, adecuada para inserción de texto en tiempo real.
- Transcripción de llamadas de atención al cliente: el modelo está entrenado para inglés y la calibración INT8 incluye audio de llamadas reales, lo que lo hace apto para volcar conversaciones telefónicas a texto para análisis posterior.
- Asistentes de voz embebidos en servidores x86: la variante INT8 dinámica ocupa 876 MB y ejecuta a unos 49 ms por chunk con 4 hilos en un i9-12900K, lo que permite desplegar transcripción continua en infraestructura sin GPU.
- Generación de actas y notas de reuniones: la transcripción en streaming con estado persistente permite procesar sesiones largas sin reiniciar el modelo, acumulando texto a medida que avanza la reunión.
- Indexación y búsqueda de archivos de audio: la variante FP32 en GPU permite transcribir por lotes grabaciones en inglés para construir índices de texto searchable sobre archivos de audio.
- Pipeline de accesibilidad para vídeo: integración del grafo ONNX en un servicio que genere pistas de subtítulos en inglés para contenido audiovisual, con la variante FP16 en GPU para priorizar calidad.

## Benchmarks y rendimiento

Resultados de WER en streaming con chunks de 560 ms sobre 1.000 utterances de cada conjunto de test de LibriSpeech, tras normalización inglesa de Whisper:

| Variante | test-clean WER | vs FP32 | test-other WER | vs FP32 |
|---|---:|---:|---:|---:|
| fp32 | 2,55 | – | 5,22 | – |
| int8-dynamic | 2,52 | 0,21 | 5,25 | 0,74 |
| int8-static | 2,53 | 0,55 | 5,35 | 1,37 |

Rendimiento de inferencia documentado por el autor:

| Variante | Hardware | Latencia por chunk de 560 ms |
|---|---|---:|
| fp32 | RTX 5070 Ti (CUDA) | 8,3 ms |
| int8-static | RTX 5070 Ti (CUDA) | 15,1 ms |
| fp32 | i9-12900K, 4 hilos | 114 ms |
| int8-dynamic / int8-static | i9-12900K, 4 hilos | ~49 ms |
| CoreML (versión aparte) | Apple Silicon (ANE) | ~15,5x tiempo real |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: FP32 requiere 2,4 GB de pesos; FP16 1,2 GB; INT8 876 MB. Con overhead de runtime, se recomienda al menos 1 GB adicional en GPU.
- GPU recomendadas: NVIDIA con soporte CUDA Execution Provider; el autor reporta mediciones en RTX 5070 Ti. Cualquier GPU NVIDIA con al menos 4 GB de VRAM puede ejecutar la variante FP16 o INT8.
- Cabe en GPU de consumo: sí, la variante FP16 (1,2 GB) e INT8 (876 MB) caben en GPUs consumer con 4 GB o más.
- CPU: x86 con VNNI/AMX para las variantes INT8; el autor mide ~49 ms por chunk en un i9-12900K con 4 hilos.
- Apple Silicon: el autor recomienda la versión CoreML (`danielbodart/nemotron-speech-600m-coreml`) en lugar de ONNX, ya que ONNX Runtime en macOS se ejecuta solo en CPU.
- Opciones de despliegue: ONNX Runtime con Execution Provider CPU o CUDA. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR de este tipo.
- Throughput: a 49 ms por chunk de 560 ms en CPU x86 con 4 hilos, el modelo puede procesar audio aproximadamente 11 veces más rápido que tiempo real en esa configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron Speech 600M ONNX (este) | ~600 M | 560 ms streaming | en | cc-by-4.0 | ONNX |
| nvidia/nemotron-speech-streaming-en-0.6b | ~600 M | 560 ms streaming | en | no disponible en la información | NeMo |
| Whisper large-v3 | ~1.550 M | 30 s no streaming | multilingüe | MIT (según modelo original, no verificado aquí) | safetensors, GGUF |
| Whisper small | ~244 M | 30 s no streaming | multilingüe | MIT (según modelo original, no verificado aquí) | safetensors, GGUF |

La comparación con Whisper se ofrece como referencia de categoría (ASR), pero no se dispone de datos de WER comparativos en la información proporcionada. La diferencia principal es que Nemotron Speech está diseñado para streaming con estado persistente, mientras que Whisper procesa ventanas de 30 segundos sin estado entre ventanas.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha entrenado ni evaluado para otros idiomas.
- El WER en test-other (5,22 en FP32) es notablemente superior al de test-clean (2,55), lo que indica degradación en audio con ruido, acentos o condiciones adversas.
- La cuantización INT8 estática introduce una degradación medible: 0,55 puntos de WER en test-clean y 1,37 en test-other respecto a FP32 en la transcripción del mismo audio.
- En GPU NVIDIA, la variante INT8 estática es más lenta que FP32 (15,1 ms frente a 8,3 ms por chunk) porque ONNX Runtime no fusiona los pares QDQ en el proveedor CUDA.
- En macOS, ONNX Runtime se ejecuta solo en CPU; el autor recomienda la versión CoreML para Apple Silicon.
- No se documentan sesgos específicos del modelo en la información disponible, pero al ser un modelo entrenado principalmente con datos en inglés, puede presentar peor rendimiento con variedades dialectales no representadas.
- Riesgo de alucinación en pasajes de audio ambiguo o silencioso, inherente a los modelos seq2seq de ASR; no se documenta mitigación específica.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero conviene verificar las condiciones del modelo base de NVIDIA, cuya licencia no se detalla en la información proporcionada.
- El repositorio tiene pocas descargas (12) y un solo like, lo que sugiere poca validación comunitaria de la exportación.
- La implementación del bucle RNNT y la gestión de cachés es responsabilidad del integrador; el autor documenta las formas y los parámetros, pero no proporciona un script de inferencia completo en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/danielbodart/nemotron-speech-600m-onnx
- Modelo base: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Versión CoreML para Apple Silicon: https://huggingface.co/danielbodart/nemotron-speech-600m-coreml
