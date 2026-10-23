# kickvn/omniASR-CTC-300M-v2-ONNX

## Resumen

omniASR-CTC-300M-v2-ONNX es la exportación a formato ONNX (fp32, opset 17) del checkpoint CTC `omniASR_CTC_300M_v2` de Meta, perteneciente a la familia Omnilingual ASR. El modelo original es un sistema de reconocimiento automático del habla de arquitectura wav2vec2 con cabecera CTC y aproximadamente 300 millones de parámetros, orientado a cobertura multilingüe amplia (la model card cita más de 1600 lenguas en su uso previsto). Lo publica el usuario `kickvn` como pieza de infraestructura del alineador de letras de KICK Studio.

El interés de esta ficha no está en la transcripción genérica, sino en el alineamiento forzado a nivel de carácter: el modelo recibe audio mono a 16 kHz y devuelve logits CTC con una trama cada 20 ms sobre un vocabulario de 10.288 clases, lo que permite asignar marcas de tiempo a cada carácter de una letra de canción o de una transcripción dada. Al estar exportado a ONNX, se ejecuta con `onnxruntime` sin necesidad de fairseq2, lo que simplifica el despliegue en producción y en CPU.

La relevancia práctica es doble: por un lado, el autor verifica que el argmax por trama coincide exactamente con el modelo fairseq2 original en ventanas de 20 s y 7,3 s; por otro, los checkpoints v2 solo se distribuyen en el servidor de Meta y no en Hugging Face, de modo que esta exportación es una de las pocas vías directas para consumirlos desde el ecosistema ONNX. La licencia Apache 2.0 del original se mantiene.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo wav2vec2 con cabecera CTC (codificador convolucional + atención, no autoregresivo) |
| Parámetros totales | ~300 M (según el nombre del checkpoint); cifra exacta no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como ventana de tokens; procesa audio a 16 kHz y emite una trama de logits cada 20 ms, sin límite máximo de muestras documentado |
| Tipos de cuantización | pesos en fp32; la model card indica que los pesos no se han modificado y el tag `base_model:quantized` figura en el repo, pero no se publican variantes int8, int4 ni GGUF |
| Idiomas soportados | más de 1600 lenguas según el uso previsto declarado; no se detalla la lista ni la cobertura por idioma |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17), fp32 |
| Entrada | `wave`: float32 `[batch, samples]`, 16 kHz mono, normalizada por ventana (media 0, varianza 1) |
| Salida | `logits`: float32 `[batch, frames, 10288]`, una trama por 20 ms |
| Tokenizador | `omniASR_tokenizer_written_v2`, carácter a id de clase (`vocab.json`) |
| Configuración CTC | `profile.json`: `{"kind": "chars", "normalize": true, "blank": 0}` |
| Tamaño del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

El modelo sigue el esquema clásico de wav2vec2: un extractor de características convolucional que reduce la señal de audio a una secuencia de representaciones, un codificador Transformer con atención sobre esa secuencia y una proyección final a vocabulario con función de pérdida CTC. Al ser CTC, la decodificación es no autoregresiva y el modelo no genera texto libre: produce distribuciones por trama que deben colapsarse (eliminando repeticiones y el blank de clase 0) o alinearse contra una secuencia objetivo conocida. La resolución temporal efectiva es de 20 ms por trama (50 tramas por segundo), lo que da la granularidad necesaria para alineamiento a nivel de carácter.

Los detalles de entrenamiento del checkpoint original (número de tokens, composición del corpus, fases de ajuste) no están disponibles en la información consultada. Lo que sí documenta el autor de la exportación es el proceso de conversión: traslado del checkpoint fairseq2 a ONNX con opset 17 sin alterar los pesos, traslado del vocabulario de caracteres y validación de equivalencia funcional comparando el argmax trama a trama contra el modelo fairseq2 en dos entradas de 20 s y 7,3 s, con resultado idéntico. Los checkpoints v2 los publica Meta en su propio servidor (`dl.fbaipublicfiles.com`), no en Hugging Face. No se documentan innovaciones adicionales como decodificación especulativa ni atención lineal.

## Capacidades

- Reconocimiento automático del habla con salida CTC a nivel de carácter, sin puntuación ni capitalización.
- Alineamiento forzado (forced alignment) de una transcripción dada contra el audio, con precisión de trama de 20 ms.
- Alineamiento de letras de canciones en más de 1600 lenguas, caso de uso declarado por el autor (KICK Studio).
- Emisión de logits completos (10.288 clases), lo que permite reutilizar la matriz para decodificación propia, cálculo de confianzas o puntuación de hipótesis.
- Extracción de marcas de tiempo por carácter útiles para subtitulado, karaoke y análisis fonético.
- Ejecución en CPU o GPU vía `onnxruntime`, sin dependencia de fairseq2 ni de PyTorch en tiempo de inferencia.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificación.
- No tiene capacidades de visión, audio-video ni generación de texto libre.
- No dispone de modo "thinking" ni de instrucciones de sistema.

## Casos de uso

- Alineamiento de letras de canciones para karaoke: el modelo recibe la pista vocal a 16 kHz y la secuencia de caracteres de la letra, y el pipeline aplica programación dinámica sobre los logits CTC para obtener el instante de inicio y fin de cada carácter; es el caso para el que se construyó este export.
- Subtitulado sincronizado a nivel de palabra o carácter: partiendo de una transcripción revisada por un humano, el alineador genera tiempos exactos sin depender de un modelo generativo, lo que reduce coste y alucinaciones en el sellado temporal.
- Preetiquetado de corpus para entrenar ASR: el modelo permite generar transcripciones preliminares con sus tiempos y acelerar el trabajo de anotación humana en lenguas de bajos recursos, aprovechando la cobertura multilingüe declarada.
- Evaluación de pronunciación y dicción: comparando la ruta de alineamiento forzado de una pronunciación esperada contra el audio real se pueden detectar omisiones, sustituciones y alargamientos a nivel de fonema o carácter.
- Búsqueda por palabra clave en archivos de audio: alineando un léxico contra el audio y midiendo la confianza CTC por trama se pueden localizar apariciones de términos concretos en grabaciones largas sin transcribir todo el material.
- Procesamiento en el borde o en servidor sin GPU: al ser un grafo ONNX de 1,3 GB en fp32, se puede ejecutar con `onnxruntime` en CPU dentro de una aplicación de escritorio o un contenedor ligero para tareas de sincronización por lotes.
- Investigación lingüística de campo: obtención de tiempos por segmento en lenguas sin ortografía estandarizada, usando el tokenizador de caracteres como capa de abstracción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única validación reportada es cualitativa y de equivalencia numérica: coincidencia exacta del argmax por trama frente al modelo fairseq2 original en entradas de 20 s y 7,3 s. No hay cifras de WER, CER ni latencia por hora de audio.

## Requisitos de hardware

- VRAM estimada: en torno a 1,3 GB solo para los pesos en fp32, más activaciones y buffers; por debajo de 2-3 GB para lotes pequeños y ventanas de audio cortas.
- GPU recomendadas: cualquier GPU con 4 GB o más (RTX 3050, RTX 4060, RTX 4090) es suficiente; para procesamiento por lotes a gran escala se puede usar A100 o H100, aunque el modelo no las aprovecha de forma intensiva por su tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier tarjeta moderna, y también en CPU con `onnxruntime` gracias al tamaño reducido del grafo.
- Opciones de despliegue: `onnxruntime` en Python, C++, C# o JavaScript; integración con pipelines tipo WhisperX o torchaudio sustituyendo el modelo de alineamiento; no aplican vLLM ni TGI (no es un LLM) ni llama.cpp / Ollama (no soportan este tipo de grafo CTC de wav2vec2 de forma directa).
- Latencia y throughput: no disponibles. Como referencia estructural, la salida es de 50 tramas por segundo de audio, con un coste de cómputo proporcional a la duración de la entrada y al tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| kickvn/omniASR-CTC-300M-v2-ONNX | ~300 M | tramas de 20 ms | 1600+ declarados, lista no disponible | Apache 2.0 | ONNX fp32 | Ejecutable con onnxruntime, sin fairseq2 |
| omniASR-CTC-300M-v2 (original, Meta) | ~300 M | tramas de 20 ms | 1600+ declarados | Apache 2.0 | checkpoint fairseq2 (.pt) | Requiere fairseq2; distribuido fuera de Hugging Face |
| facebook/wav2vec2-base-960h | ~95 M | tramas de 20 ms | inglés | Apache 2.0 | safetensors / PyTorch | Referencia clásica de CTC; cobertura monolingüe |
| openai/whisper-large-v3 | ~1550 M | ventanas de 30 s | multilingüe (99 idiomas) | Apache 2.0 (pesos) | safetensors / PyTorch | Generativo, con puntuación y timestamps; mucho mayor coste |

## Limitaciones y advertencias

- No es un modelo generativo: no transcribe de forma autónoma sin un paso de decodificación CTC y un tokenizador de caracteres; no produce puntuación, mayúsculas ni formato.
- Cobertura lingüística real desconocida: la cifra de 1600+ lenguas procede del uso previsto declarado, pero no se publica lista de idiomas ni evaluación de error por idioma, por lo que la calidad en lenguas concretas es incierta.
- Riesgo de emisión espuria: como todo modelo CTC, puede generar caracteres en tramos de silencio, música o ruido; conviene aplicar umbrales de confianza y el blank de clase 0.
- Sensibilidad al preprocesado: exige audio mono a 16 kHz y normalización por ventana (media 0, varianza 1); un resampleo o una normalización distintos degradan la alineación.
- Alineamiento forzado dependiente de la transcripción: si la letra o transcripción de entrada no coincide con el audio, el alineamiento se degrada sin aviso explícito.
- Sesgos: no documentados. Se desconoce la composición del corpus de entrenamiento original y su representación por lenguas, variedades y hablantes.
- Restricciones de licencia: Apache 2.0 permite uso comercial con atribución; es obligatorio conservar `LICENSE` y `NOTICE` con la atribución a Meta Platforms, Inc.
- Madurez del export: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad; conviene replicar la comprobación de equivalencia frente a fairseq2 antes de usarlo en producción.
- Sin garantías de mantenimiento: el autor no documenta versiones futuras ni soporte para otras precisiones u opsets.

## Enlaces

- [Hugging Face: kickvn/omniASR-CTC-300M-v2-ONNX](https://huggingface.co/kickvn/omniASR-CTC-300M-v2-ONNX)
- [Checkpoint original omniASR-CTC-300M-v2 (Meta, fairseq2)](https://dl.fbaipublicfiles.com/mms/omniASR-CTC-300M-v2.pt)
- [Model card y repositorio de Omnilingual ASR (facebookresearch)](https://github.com/facebookresearch/omnilingual-asr)
- [Modelo base en Hugging Face: facebook/omniASR-CTC-300M](https://huggingface.co/facebook/omniASR-CTC-300M)
