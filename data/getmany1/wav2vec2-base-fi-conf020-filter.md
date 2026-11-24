# GetmanY1/wav2vec2-base-fi-conf020-filter

## Resumen

wav2vec2-base-fi-conf020-filter es un modelo de representación del habla (speech SSL) basado en wav2vec 2.0 Base, desarrollado por Yaroslav Getman y colaboradores del grupo de investigación en tecnologías del habla de la Universidad Aalto. Se trata de un checkpoint de ablación que forma parte del estudio "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL", cuyo objetivo es analizar el efecto del filtrado por confianza de ASR en el preentrenamiento auto-supervisado a gran escala para finés.

El modelo emplea la arquitectura wav2vec 2.0 Base (12 capas transformer, dimensión 768, feed-forward 3072), con 95 millones de parámetros, y fue preentrenado sobre 640.000 horas de audio en finés procedente de archivos de radio y televisión, VoxPopuli, el corpus del Parlamento finlandés y Lahjoita puhetta, tras aplicar un filtro de confianza de ASR con umbral τ = −0,20. No incluye cabecera CTC ni tokenizer: es un extractor de representaciones que debe afinarse para tareas concretas como ASR.

Su relevancia es metodológica: sirve como punto de comparación dentro de una ablación que cuantifica cómo afecta el filtrado de datos al rendimiento de modelos SSL monolingües entrenados con volúmenes masivos de audio. El autor recomienda usar los modelos principales de la colección para aplicaciones reales, reservando este checkpoint para experimentos comparativos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 Base (transformer, 12 capas, 768 / 3072) |
| Parámetros totales | 95.044.608 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio a 16 kHz, ventanas dependientes de la tarea) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y fairseq checkpoint.pt |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec 2.0 Base: un extractor convolucional de características seguido de un transformer de 12 capas con dimensión oculta 768 y capa feed-forward de 3072. El preentrenamiento es auto-supervisado, con enmascaramiento de representaciones latentes y una tarea contrastiva sobre quantized targets, sin cabecera CTC ni tokenizer en el checkpoint publicado.

Los datos de preentrenamiento provienen del archivo de radio y televisión de la Agencia Finlandesa de Artes y Cultura (KUVI, antes KAVI), junto con los conjuntos de entrenamiento de VoxPopuli finés, el corpus del Parlamento finlandés y Lahjoita puhetta. Tras VAD y deduplicación basada en transcripciones se obtuvieron 890.000 horas, de las cuales se retuvieron 640.000 (72%) tras aplicar un filtro de confianza de ASR con umbral τ = −0,20. El entrenamiento consistió en 125.000 actualizaciones con learning rate 6e-4, aproximadamente 3 minutos de audio por GPU en 512 GPUs. La entrada es audio mono a 16 kHz con `do_normalize=False`. El código y las configuraciones están disponibles en el repositorio aalto-speech/large-scale-monolingual-speech-foundation-models.

## Capacidades

- Extracción de representaciones del habla auto-supervisadas para finés.
- Base para fine-tuning en reconocimiento automático del habla (ASR) tras añadir cabecera CTC o attention-based.
- Base para fine-tuning en otras tareas de voz: identificación de hablante, detección de emociones, keyword spotting, diarización, etc.
- Procesamiento de audio a 16 kHz mono.
- No incluye capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al finés (entrenado solo con datos en fi).
- No dispone de modo thinking ni de procesamiento de audio en tiempo real integrado.

## Casos de uso

- Reconocimiento automático del habla en finés: fine-tuning con una cabecera CTC sobre transcripciones para construir un sistema ASR específico de dominio (por ejemplo, transcripción de emisiones de radio o televisión), aprovechando el preentrenamiento sobre 640.000 horas de audio finlandés.
- Transcripción de archivos audiovisuales: aplicar el modelo afinado sobre material del archivo KUVI para indexación y búsqueda de contenido, dado que el preentrenamiento se realizó sobre ese mismo dominio.
- Investigación en ablaciones de filtrado de datos: usar este checkpoint como referencia frente a los demás modelos de la ablación para estudiar el impacto del umbral τ en el rendimiento downstream.
- Identificación de hablante: fine-tuning con cabecera de clasificación sobre embeddings del modelo para tareas de verificación o identificación de locutor en finés.
- Detección de emociones o eventos acústicos: adaptar las representaciones a clasificación de estados afectivos en audio de broadcast finlandés.
- Segmentación y diarización: usar los embeddings como entrada a pipelines de diarización en reuniones o programas de debate en finés.
- Prototipado académico: servir como punto de partida para experimentos de speech SSL en finés con recursos limitados de GPU, dado su tamaño de 95M parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en fp32 para el modelo (95M parámetros), más memoria para activaciones según la longitud del audio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para inferencia; para fine-tuning se recomienda al menos 8-16 GB (RTX 3090, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (GTX 1060 6 GB o superior) para inferencia; para fine-tuning se recomienda RTX 3060 12 GB o superior.
- Opciones de despliegue: transformers (Wav2Vec2Model + Wav2Vec2FeatureExtractor), fairseq (checkpoint original), ONNX Runtime, TorchScript. No se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / datos | Licencia | Disponibilidad |
|---|---|---|---|---|
| GetmanY1/wav2vec2-base-fi-conf020-filter | 95M | 640K h audio finés (filtro τ = −0,20) | Apache 2.0 | Hugging Face |
| Modelos principales de la colección GetmanY1/wav2vec2-fi-471k | no disponible | no disponible | no disponible | Hugging Face |
| wav2vec 2.0 Base original (Facebook AI) | 95M | 960 h audio inglés | MIT | Hugging Face / fairseq |
| XLS-R (Facebook AI) | 300M–2B | 436K h audio multilingüe | MIT | Hugging Face |

## Limitaciones y advertencias

- Modelo de ablación: el propio autor recomienda usar los modelos principales de la colección para aplicaciones reales; este checkpoint existe para comparación experimental.
- Solo finés: no está entrenado ni evaluado en otros idiomas.
- Sin cabecera CTC ni tokenizer: no puede usarse directamente para ASR sin fine-tuning.
- Riesgo de sesgo: los datos provienen de archivos de radio y televisión finlandeses, con posibles sesgos de dominio, registro y demografía de los hablantes.
- Alucinación: al ser un modelo de representaciones, no genera texto; el riesgo de alucinación aparece en los modelos downstream afinados sobre él.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de los corpus originales (KUVI, VoxPopuli, Parlamento finlandés, Lahjoita puhetta) que puedan afectar a los modelos derivados.
- Sin datos de benchmarks publicados: no es posible comparar su rendimiento downstream de forma cuantitativa con la información disponible.
- Contexto de audio: la longitud efectiva de contexto depende de la ventana de entrada y de la tarea; no se especifica un límite máximo documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-fi-conf020-filter
- Colección de modelos principales: https://huggingface.co/collections/GetmanY1/wav2vec2-fi-471k
- Paper: https://arxiv.org/abs/2610.13102
- Repositorio de código y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
