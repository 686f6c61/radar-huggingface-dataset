# Chottokun/ruri-v3-30m-lite

## Resumen

ruri-v3-30m-lite es una reimplementación optimizada del modelo de embeddings japonés cl-nagoya/ruri-v3-30m, publicado por el usuario Chottokun. El modelo original, desarrollado por Hayato Tsukagoshi y Ryohei Sasano (Nagoya University NLP Laboratory), es un encoder basado en ModernBERT que produce vectores de 256 dimensiones para similitud semántica en japonés. Esta versión "lite" mantiene los pesos del modelo base pero los redistribuye en formato ONNX (FP32 y FP16) y sustituye toda la pila de inferencia de PyTorch/Transformers por una implementación propia basada en sentencepiece_lite, onnxruntime y numpy.

La propuesta de valor es la eliminación total de la dependencia de PyTorch (lo que el autor denomina "Zero-Torch"), lo que reduce drásticamente el tamaño del entorno de ejecución y permite despliegues en entornos serverless (AWS Lambda, Google Cloud Run) y en el borde con arranques en frío casi instantáneos. El tokenizador, empaquetado como wheel de C++20 con SentencePiece Lite y serialización FlatBuffers, se declara unas 13,4 veces más rápido que los tokenizadores Fast de Hugging Face, con aproximadamente 3,4 µs por frase.

El modelo está pensado exclusivamente para extracción de características (feature-extraction) y búsqueda semántica en japonés, no para generación de texto. Su licencia Apache 2.0 y su reducido tamaño (repo de 0,4 GB) lo hacen adecuado para pipelines de recuperación (RAG) en producción con requisitos estrictos de latencia y footprint. No se han publicado resultados de benchmarks propios en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder), dimensión de embedding 256 |
| Parametros totales | no disponible (modelo base etiquetado como "30m"; no se detalla el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX FP32 y ONNX FP16 (selección automática según hardware) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (FP32 y FP16); tokenizador SentencePiece en FlatBuffers (.spm.fb) |

## Arquitectura y entrenamiento

El modelo base cl-nagoya/ruri-v3-30m es un encoder transformer ModernBERT entrenado para generar embeddings de frases en japonés con pooling de media y normalización L2, produciendo vectores de 256 dimensiones. La model card del modelo original (arXiv:2409.07737) describe la familia Ruri como embeddings generales de texto en japonés; sin embargo, la información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO (en un modelo de embeddings estas etapas no son el mecanismo habitual, sino el entrenamiento contrastivo).

La contribución de esta variante lite no es el entrenamiento, sino la ingeniería de inferencia: conversión de los pesos Safetensors originales a ONNX (FP32 y FP16), conversión del modelo SentencePiece oficial a FlatBuffers y una implementación independiente (ruri_v3_lite.py) que reproduce el pipeline de Mean Pooling + normalización L2. El autor declara equivalencia matemática con la salida oficial de PyTorch, con similitud coseno de 1,0000. Además, la tokenización usa Safe Boundary Pre-tokenization (SBP) y mmap zero-copy sobre FlatBuffers, y la selección FP16/FP32 se hace consultando la Compute Capability de la GPU mediante ctypes, sin cargar PyTorch.

## Capacidades

- Generación de embeddings de frases en japonés con salida normalizada de 256 dimensiones, apta para similitud coseno mediante producto escalar.
- Búsqueda semántica y recuperación de documentos (retrieval) mediante el formato de prefijos de tarea del modelo original ("検索クエリ:" para consultas y "文章:" para documentos).
- Extracción de características (feature-extraction) por lotes mediante `model.encode(...)`.
- Tokenización multihilo de alta velocidad con sentencepiece_lite (SBP y FlatBuffers).
- Selección automática de precisión (FP16 en GPUs Ampere/Ada/Hopper; FP32 en Pascal o CPU) sin dependencia de PyTorch.
- Ejecución en CPU y GPU mediante onnxruntime / onnxruntime-gpu.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio: es un encoder de embeddings, no un modelo generativo.
- Capacidad multilingüe limitada al japonés según la metadata del modelo.

## Casos de uso

- Búsqueda semántica en japonés en producción: indexar un corpus de documentos con `encode` y servir consultas con prefijo "検索クエリ:", calculando similitud por producto escalar de vectores normalizados de 256 dimensiones. Adecuado por su bajo coste computacional y su footprint reducido.
- RAG (retrieval-augmented generation) sobre documentación en japonés: usar el modelo como recuperador en un pipeline que alimente a un LLM generativo, aprovechando el arranque en frío rápido en entornos serverless.
- Funciones serverless y edge: desplegar en AWS Lambda o Google Cloud Run sin PyTorch, reduciendo el tamaño del paquete de dependencias y el tiempo de cold start, algo crítico en estos entornos.
- Deduplicación y clustering de textos japoneses: agrupar tickets de soporte, reseñas o artículos por similitud coseno de sus embeddings, con procesamiento por lotes en CPU.
- Moderación y filtrado de contenido: comparar mensajes entrantes contra una base de patrones conocidos mediante similitud semántica, con latencia baja gracias al tokenizador rápido.
- Búsqueda dentro de aplicaciones móviles o de escritorio: al no requerir PyTorch y poder ejecutarse en CPU con ONNX FP32, es viable embeberlo en clientes con recursos limitados para búsqueda local en japonés.
- Enrutamiento de consultas en asistentes conversacionales: clasificar la intención de una consulta japonesa comparándola con embeddings de ejemplos etiquetados, como paso previo a un modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo declara métricas de ingeniería: similitud coseno de 1,0000 frente a la salida oficial de PyTorch, tokenización aproximadamente 13,4 veces más rápida que los tokenizadores Fast de Hugging Face (~3,4 µs por frase) y selección automática de FP16/FP32 según la GPU. No se aportan cifras de MMLU, JSTS, retrieval ni de throughput de inferencia del encoder.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repo (0,4 GB) y el etiquetado "30m", el modelo ONNX FP32 debería ocupar del orden de cientos de MB y la variante FP16 aproximadamente la mitad, aunque el dato exacto no se proporciona.
- GPU recomendadas: el autor indica que se carga FP16 en GPUs con Compute Capability moderna (RTX 3060 en adelante, Ampere/Ada/Hopper) para usar Tensor Cores; en Pascal (GTX 1080) o CPU se carga FP32.
- Cabe en GPU de consumo: sí, según la model card (RTX 3060 y superiores en FP16; GTX 1080 en FP32).
- Opciones de despliegue: onnxruntime (CPU) y onnxruntime-gpu (CUDA), con el wrapper propio `ruri_v3_lite`; el autor menciona AWS Lambda y Cloud Run como entornos objetivo. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un encoder de este tipo).
- Latencia y throughput: solo se declara la latencia de tokenización (~3,4 µs por frase); no se publican cifras de latencia ni throughput de inferencia del encoder.

## Comparativa con modelos similares

| Modelo | Tipo | Dimensión | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Chottokun/ruri-v3-30m-lite | Encoder de embeddings (ModernBERT) | 256 | ja | ONNX (FP32/FP16), sin PyTorch | Apache 2.0 | Tokenizador sentencepiece_lite; equivalencia coseno 1,0000 con el original |
| cl-nagoya/ruri-v3-30m | Encoder de embeddings (ModernBERT) | 256 | ja | Safetensors (PyTorch) | Apache 2.0 | Modelo base; requiere PyTorch/Transformers |
| Otros modelos Ruri de la familia (p. ej. tamaños superiores) | Encoder de embeddings | no disponible | ja | Safetensors | Apache 2.0 | No se dispone de especificaciones detalladas en la información proporcionada |

No se dispone de datos de rendimiento comparativo (benchmarks de retrieval o STS) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente de embeddings: no genera texto ni soporta tool calling, agentes o razonamiento multi-paso.
- Idioma limitado al japonés; el rendimiento en otros idiomas no está documentado y previsiblemente será deficiente.
- Longitud máxima de contexto no documentada en la información disponible; conviene verificar el límite del modelo base antes de indexar documentos largos.
- Riesgo de que la equivalencia numérica declarada (coseno 1,0000) dependa del hardware y de la versión de onnxruntime; no hay validación independiente publicada.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.
- La wheel de sentencepiece_lite incluida es específica para CPython 3.11 en Linux x86_64 según el comando de instalación; otras plataformas requerirían compilación propia.
- Aunque la licencia es Apache 2.0, se deben respetar las cláusulas de atribución y aviso de modificación (Sección 4) respecto al modelo base de Nagoya University y a SentencePiece de Google.
- Al ser una conversión de pesos, hereda los sesgos del corpus de entrenamiento original del modelo Ruri, no documentados en la información disponible.
- Para producción, conviene fijar la versión del repo y validar la salida frente al modelo PyTorch original en el hardware objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chottokun/ruri-v3-30m-lite
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-30m
- Paper Ruri (arXiv:2409.07737): https://arxiv.org/abs/2409.07737
- SentencePiece Lite (Google): https://google.github.io/sentencepiece/lite/
- Repositorio SentencePiece: https://github.com/google/sentencepiece
- Paper SentencePiece (EMNLP 2018): https://aclanthology.org/D18-2012
- Licencia Apache 2.0: http://www.apache.org/licenses/LICENSE-2.0
