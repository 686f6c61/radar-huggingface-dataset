# kuberstar-com/lapillus-v2-coreml

## Resumen

Lapillus-v2 Core ML es la conversión a formato Core ML de Lapillus-v2, un modelo de reconocimiento automático del habla (ASR) para armenio oriental desarrollado por Davit Ghazaryan. El modelo original es un FastConformer híbrido RNN-T + CTC de 115 millones de parámetros, afinado a partir de `nvidia/stt_hy_fastconformer_hybrid_large_pc`. Esta versión, publicada por KUBERSTAR, empaqueta el encoder y el preprocesador de NeMo en un grafo Core ML ejecutable sobre Apple Silicon, junto con los pesos del decodificador y el joint en fp32 para ejecutar la decodificación greedy RNN-T en CPU.

La relevancia de esta conversión es práctica: permite ejecutar un ASR de calidad competitiva de forma totalmente local en macOS, sin dependencias de Python ni de NeMo en tiempo de inferencia. Según el autor de la conversión, en el conjunto de evaluación ArmBench-ASR el modelo original alcanza un WER combinado del 18,21 % (7,02 % en Common Voice), lo que lo sitúa como el mejor modelo abierto bajo licencia comercial para armenio en ese benchmark.

El modelo transcribe armenio oriental con puntuación y mayúsculas, y normaliza los números a palabras. La conversión mantiene los pesos originales sin cambios en fp32, y está pensada para Shshuk, una aplicación de dictado local para macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer híbrido RNN-T + CTC (encoder Conformer de 17 capas, prediction network LSTM, joint) |
| Parametros totales | 115 M (modelo original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como contexto de texto; ventanas de audio de 5, 10, 20 y 30 s (`window5`, `window10`, `window20`, `window30`) |
| Tipos de cuantizacion | fp32 (única variante publicada; el autor probó fp16 y descartó su uso por pérdida de precisión) |
| Idiomas soportados | armenio oriental (hy) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML (`Encoder.mlmodelc`), binarios float32 little-endian (`decoder.bin`, `decoder.json`), vocabulario SentencePiece (`vocab.txt`) |

## Arquitectura y entrenamiento

El modelo original es un FastConformer híbrido que combina una cabeza RNN-T y una cabeza CTC sobre un encoder Conformer de 17 capas. El encoder incluye el preprocesador propio de NeMo (pre-énfasis, STFT, 80 bandas mel, logaritmo y normalización por característica sobre los frames reales), y en esta conversión se ha trazado como un único grafo con una función por ventana (`window5`, `window10`, `window20`, `window30`) compartiendo pesos. La salida del encoder es `projected` [1, T, 640] en el espacio del joint, más `frames` [1] con el número de frames reales.

La red de predicción es un embedding de 1025×640 (con la fila del blank a cero) seguido de una capa LSTM de 640 unidades, y el joint proyecta 640→640 y 640→1025. La decodificación es RNN-T greedy en CPU, con un máximo de 10 símbolos por frame y blank id 1024. El vocabulario consta de 1024 piezas SentencePiece más `<blk>` con id 1024. El modelo base se afinó a partir de `nvidia/stt_hy_fastconformer_hybrid_large_pc`; no se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica relevante de esta publicación no está en el entrenamiento, sino en la conversión: se mantiene fp32 porque una build fp16 alteró 2 de 25 clips de evaluación y el Neural Engine no produjo salida utilizable, de modo que la inferencia se hace en GPU con decodificación en CPU.

## Capacidades

- Transcripción de voz a texto en armenio oriental con puntuación y mayúsculas.
- Normalización de números a palabras en la salida.
- Reconocimiento sobre ventanas de audio de 5, 10, 20 y 30 segundos (16 kHz, float32).
- Ejecución local en Apple Silicon mediante Core ML, sin Python ni NeMo en inferencia.
- Decodificación RNN-T greedy implementable en CPU a partir de `decoder.bin`/`decoder.json`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente ASR.
- No dispone de capacidades de visión ni de audio más allá de la transcripción.
- Capacidad multilingüe limitada al armenio; no cubre otros idiomas.

## Casos de uso

- Dictado local en macOS: integración en la aplicación Shshuk para transcribir voz a texto sin enviar audio a la nube, aprovechando la ejecución Core ML en Apple Silicon y la latencia de ~10 ms para ventanas de 5 s en un M5 Pro.
- Subtitulado de reuniones y entrevistas en armenio: procesar el audio por ventanas de 30 s (≈25 ms de encoder en M5 Pro) y encadenar las salidas con la decodificación greedy en CPU.
- Archivado y búsqueda de contenido audiovisual en armenio: transcribir grabaciones para indexarlas y hacerlas consultables, con la ventaja de que los números se emiten como palabras, lo que facilita la búsqueda textual.
- Transcripción de notas de voz en aplicaciones de productividad: el modelo cabe en un repo de 0,5 GB y se ejecuta íntegramente en el dispositivo, lo que simplifica el cumplimiento de privacidad.
- Evaluación comparativa de ASR para armenio: usar la conversión como referencia local para medir WER frente a otros sistemas en el mismo hardware, dado que reproduce la salida greedy de NeMo en los clips de prueba.
- Prototipado de asistentes de voz en armenio: emplear la salida `projected` [1, T, 640] como entrada a un decodificador o post-procesador propio, ya que el encoder expone los frames proyectados en el espacio del joint.
- Investigación en eficiencia de despliegue: estudiar el impacto de fp32 frente a fp16 y de GPU frente a Neural Engine en un modelo Conformer de 115 M, con resultados documentados por el autor.

## Benchmarks y rendimiento

| Benchmark / prueba | Resultado | Notas |
|---|---|---|
| ArmBench-ASR, WER combinado | 18,21 % | Mejor modelo abierto bajo licencia comercial según el autor |
| ArmBench-ASR, Common Voice | 7,02 % | Según el autor |
| FLEURS `hy_am` test, 25 clips (encoder GPU + greedy RNN-T) | WER 5,91 % | Tras minúsculas y eliminación de puntuación; coincide con el texto greedy de NeMo en los 25 clips |
| FLEURS `hy_am`, Whisper large-v3 (mismos 25 clips) | WER 58,7 % | Referencia comparativa aportada por el autor |
| fp16 frente a fp32 | 2 de 25 clips alterados en fp16 | Motivo por el que se publica fp32 |
| Neural Engine | Sin salida utilizable | Motivo por el que se usa GPU |
| Latencia del encoder en M5 Pro | ~10 ms (ventana de 5 s), ~25 ms (ventana de 30 s) | Datos del autor |

## Requisitos de hardware

- Almacenamiento: repositorio de 0,5 GB; los pesos se mantienen en fp32.
- Memoria: no se especifica VRAM o memoria unificada mínima; el encoder de 115 M en fp32 es manejable en equipos Apple Silicon de gama consumer.
- GPU: ejecución en GPU de Apple Silicon; el autor reporta tiempos en un M5 Pro. No se documentan requisitos para A100, H100 ni RTX 4090, ya que el formato Core ML está orientado a Apple.
- Neural Engine: descartado por el autor al no producir salida utilizable.
- CPU: necesaria para la decodificación greedy RNN-T (máximo 10 símbolos por frame, blank id 1024).
- Despliegue: Core ML; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia: ~10 ms de encoder para 5 s de audio y ~25 ms para 30 s en M5 Pro; el throughput completo depende de la decodificación en CPU, no cuantificada en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lapillus-v2 Core ML (esta ficha) | 115 M | Ventanas de 5–30 s | WER 5,91 % en 25 clips FLEURS `hy_am`; 18,21 % combinado en ArmBench-ASR | CC BY 4.0 | Core ML, Apple Silicon |
| davitlive5/Lapillus-v2 (original) | 115 M | Ventanas de audio | Mismo modelo; mejor abierto comercial en ArmBench-ASR según el autor | CC BY 4.0 | NeMo / Hugging Face |
| nvidia/stt_hy_fastconformer_hybrid_large_pc | no disponible | no disponible | no disponible | CC BY 4.0 | NeMo |
| Whisper large-v3 | no disponible en la información | no disponible | WER 58,7 % en los mismos 25 clips FLEURS `hy_am` | no disponible en la información | Hugging Face / múltiples runtimes |

## Limitaciones y advertencias

- Solo cubre armenio oriental (`hy`); no es utilizable para otros idiomas.
- No hay datos publicados sobre sesgos demográficos, acentos o calidad de micrófono; el rendimiento puede degradarse fuera de las condiciones de evaluación.
- Riesgo de alucinación y de errores de transcripción inherente a los modelos ASR; el WER del 18,21 % en ArmBench-ASR implica una tasa de error considerable en condiciones difíciles.
- La salida normaliza números a palabras, lo que puede requerir post-procesado si se necesitan cifras.
- fp16 degrada la precisión (2 de 25 clips alterados) y el Neural Engine no es viable, lo que restringe la optimización a GPU en fp32.
- La licencia CC BY 4.0 permite uso comercial con atribución; es obligatorio citar a Davit Ghazaryan, NVIDIA y KUBERSTAR según la model card.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es inexistente.
- No se documentan límites de longitud de audio más allá de las ventanas soportadas ni el comportamiento en audio de muy baja calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kuberstar-com/lapillus-v2-coreml
- Modelo base: https://huggingface.co/davitlive5/Lapillus-v2
- Modelo NVIDIA de origen: https://huggingface.co/nvidia/stt_hy_fastconformer_hybrid_large_pc
- ArmBench-ASR: https://metric-ai-armbench-asr.static.hf.space/
- Shshuk (aplicación de dictado): https://kuberstar.com
