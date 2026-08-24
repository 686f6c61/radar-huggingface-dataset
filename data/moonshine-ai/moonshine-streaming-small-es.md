# moonshine-ai/moonshine-streaming-small-es

## Resumen

Moonshine Streaming Small es un modelo de reconocimiento automático de voz (ASR) en streaming desarrollado por Useful Sensors y publicado bajo el nombre de moonshine-ai. Esta variante concreta está entrenada exclusivamente para español y se distribuye con una licencia MIT, lo que la hace atractiva para integración comercial. El modelo resuelve el problema de transcripción de voz en tiempo real con baja latencia, pensado para ejecutarse en dispositivos de borde (edge-class hardware) sin depender de servidores en la nube.

Su arquitectura combina un frontend de audio de 50 Hz con un codificador Transformer de ventana deslizante, lo que permite transcribir incrementalmente a medida que llega el audio, en lugar de esperar a que termine la frase completa. Con 112,9 millones de parámetros, el modelo ofrece un equilibrio entre precisión y eficiencia, y su tokenizer de 12 288 entradas está adaptado al vocabulario español. La versión Tiny, un cuarto de su tamaño, también está disponible para entornos con recursos aún más limitados.

El modelo se entrenó sobre un corpus español de aproximadamente 160 000 horas etiquetadas automáticamente (pseudoetiquetas generadas por un modelo profesor de la familia Whisper) y un conjunto de lectura humana de unas 1 700 horas. En las evaluaciones publicadas, alcanza un WER (word error rate) de alrededor del 4,7 % en muestras de FLEURS y Multilingual LibriSpeech español, lo que lo sitúa como una opción competitiva para aplicaciones de transcripción en español, especialmente en escenarios donde la latencia y el consumo de recursos son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Frontend de audio 50 Hz + Transformer encoder con ventanas deslizantes + decoder seq2seq (Moonshine Streaming) |
| Parametros totales | 112 872 248 (112,9 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la ventana de audio se procesa en tramas de 80 muestras, con lookahead de ~80 ms) |
| Tipos de cuantizacion | float32 (repo) y int8 (paquete .ort distribuido por Moonshine) |
| Idiomas soportados | espanol (es) |
| Licencia | MIT |
| Formato de pesos | safetensors (y .ort para la version cuantizada) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine Streaming, que combina un frontend de audio ligero con un transformer de ventana deslizante. El frontend extrae características a 50 Hz (cada 20 ms) y aplica normalización CMVN y compresión asinh, seguida de dos convoluciones causales con stride 2. El encoder consta de 10 capas con ancho 620 y 8 cabezas, y aplica ventanas deslizantes: las dos primeras y las dos últimas capas usan ventanas (16, 4), mientras que las capas intermedias usan (16, 0). Esto proporciona un lookahead de aproximadamente 80 ms en las capas extremas y ninguno en las intermedias. El decoder, por su parte, tiene 10 capas de ancho 512 y 8 cabezas, con RoPE aplicado a 32 de las 64 dimensiones de cada cabeza. Un adaptador con embeddings posicionales absolutos aprendidos conecta el encoder (620) con el decoder (512).

El entrenamiento se realizó sobre un corpus español masivo: aproximadamente 160 000 horas de audio etiquetado automáticamente (pseudolabels) procedente de crawls, más 1 700 horas de lectura humana transcrita manualmente (Multilingual LibriSpeech, Common Voice, LibriVox, VoxPopuli, FLEURS y conjuntos de OpenSLR de Argentina, Chile y Colombia). No se utilizó RLHF ni DPO; es un modelo de ASR puro. Las pseudolabels provienen de un profesor de la familia Whisper, por lo que el modelo hereda sus errores en nombres propios, numerales y cambio de código.

## Capacidades

- Reconocimiento de voz en streaming: procesa audio incrementalmente, emitiendo transcripciones parciales sin esperar al final de la locución.
- Baja latencia: el lookahead de ~80 ms permite una respuesta casi en tiempo real, adecuada para diálogos interactivos.
- Ejecución en dispositivo: está diseñado para correr en hardware de borde (CPU, GPU ligera, incluso WebAssembly según demos oficiales).
- Soporte de atención máscara: requiere el `attention_mask` para activar el comportamiento de ventana deslizante; sin él, el modelo atiende a toda la locución y se comporta de manera diferente.
- Multilingüe no: solo español (aunque existen otras variantes del modelo para otros idiomas).
- No incluye tool calling, agentes ni funciones de razonamiento multi-paso; es exclusivamente un sistema de transcripción.

## Casos de uso

- Transcripción de voz en tiempo real en aplicaciones de atención al cliente: el modelo puede transcribir conversaciones telefónicas o de videollamada mientras se desarrollan, alimentando sistemas de análisis o de asistencia en directo. Su baja latencia (menos de 100 ms de lookahead) permite una respuesta fluida en el diálogo.
- Subtitulado en vivo de videoconferencias o eventos en español: al procesar el audio en streaming, se pueden generar subtítulos sincronizados con la intervención del hablante, ideal para reuniones remotas o emisiones en directo.
- Asistentes de voz embebidos en dispositivos IoT (altavoces, mandos, electrodomésticos): el modelo cabe en hardware de bajo coste y puede ejecutarse localmente, evitando enviar audio a la nube y garantizando privacidad.
- Control por voz de aplicaciones en español en entornos ruidosos: su robustez en lectura y la capacidad de procesar audio de 16 kHz permite su uso en interfaces de voz para móviles o vehículos.
- Transcripción de audio para archivo y búsqueda en plataformas de contenido: aunque no es streaming, se puede usar de forma no secuencial para convertir grabaciones en texto, aprovechando su bajo error en lectura.
- Desarrollo de agentes de voz en español con bajo presupuesto de cómputo: al ser un modelo pequeño (112M), puede integrarse en pipelines de inferencia en CPU o GPUs de gama baja, reduciendo costes operativos frente a modelos más grandes.

## Benchmarks y rendimiento

Según la model card, el modelo fue evaluado en dos paneles de español (FLEURS y MLS) con WER normalizado. Se presentan los resultados de la muestra de 400 locuciones con semilla fija:

| Panel | WER (checkpoint de entrenamiento) | WER (este repositorio) |
|---|---|---:|---:|
| `fleurs_es` | 4.91 | 4.89 |
| `mls_es` | 4.95 | 4.57 |
| **Macro** | **4.933** | **4.732** |

Además, la versión cuantizada int8 del paquete `.ort` obtiene un WER de 4.938 frente al 4.933 del checkpoint float32, una diferencia de +0.004, dentro del ruido de la muestra.

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo en float32 ocupa aproximadamente 450 MB (112,9 M × 4 bytes). En int8, unos 113 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 3060, etc. También puede ejecutarse en CPU, ya que está orientado a edge.
- Consumer GPU: sí, cabe en prácticamente cualquier GPU de consumo actual e incluso en Raspberry Pi o similares con suficiente RAM.
- Opciones de despliegue: la librería `transformers` (con MoonshineStreamingForConditionalGeneration), ONNX Runtime (versión .ort), y el runtime propio de Moonshine que incluye compilación a WebAssembly para navegador.
- Latencia: no se especifican valores concretos, pero el lookahead de ~80 ms y la inferencia incremental indican una latencia de extremo a extremo de pocos cientos de milisegundos en hardware moderado.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos ASR en español en la información proporcionada. Como referencia general, se puede comparar con:

| Modelo | Parametros | Contexto | WER (espanol) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Moonshine Streaming Small ES | 112,9 M | no disponible | ~4.7 (FLEURS/MLS) | MIT | HuggingFace, .ort |
| Whisper (small) | 244 M | 30 s | no disponible | MIT | HuggingFace |
| Wav2Vec2 XLSR (es) | 300 M | ~10 s | no disponible | MIT | HuggingFace |

La comparación no es exhaustiva porque los datos de WER de los otros modelos no se han extraído de fuentes fiables en este informe. No obstante, Moonshine destaca por su menor tamaño y su capacidad de streaming en tiempo real, algo que Whisper no ofrece en su variante estándar.

## Limitaciones y advertencias

- **Datos de entrenamiento pseudo-etiquetados**: la mayor parte del corpus (160K horas) fue etiquetada automáticamente por un modelo profesor, por lo que el modelo reproduce sus errores en nombres propios, numerales y cambios de código.
- **Bucles de repetición**: como otros modelos seq2seq de ASR, puede caer en bucles de repetición en clips cortos o ruidosos. Se recomienda limitar `max_new_tokens` según la duración del audio.
- **Evaluación limitada**: solo se ha evaluado en lectura (FLEURS y MLS), no en habla espontánea latinoamericana, por lo que el rendimiento en conversaciones informales puede ser inferior.
- **Obligación de `attention_mask`**: si se llama al modelo sin `attention_mask`, el encoder atiende a toda la locución y se convierte en un modelo diferente al entrenado, con un comportamiento no deseado.
- **Idioma único**: solo español; no soporta otros idiomas.
- **Licencia MIT**: permite uso comercial y modificación, pero hay que verificar los términos de los datos de entrenamiento (posibles derechos de terceros en los corpus).
- **Sin soporte de funciones de agente**: no es un modelo de lenguaje general, solo ASR; no se puede usar para razonamiento o generación de texto libre.

## Enlaces

- Repositorio HuggingFace del modelo: [moonshine-ai/moonshine-streaming-small-es](https://huggingface.co/moonshine-ai/moonshine-streaming-small-es)
- Modelo base (inglés): [moonshine-ai/moonshine-streaming-small](https://huggingface.co/moonshine-ai/moonshine-streaming-small)
- Modelo Tiny en español: [moonshine-ai/moonshine-streaming-tiny-es](https://huggingface.co/moonshine-ai/moonshine-streaming-tiny-es)
- Repositorio GitHub del proyecto Moonshine: [moonshine-ai/moonshine](https://github.com/moonshine-ai/moonshine)
- Demos en WebAssembly (Moonshine Voice): [https://www.moonshine.ai/](https://www.moonshine.ai/)
