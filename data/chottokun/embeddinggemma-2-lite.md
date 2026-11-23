# Chottokun/embeddinggemma-2-lite

## Resumen

embeddinggemma-2-lite es una conversión del modelo de embeddings google/embeddinggemma-2 que elimina por completo la dependencia de PyTorch y de la librería Transformers. El autor, Chottokun, ha exportado la torre de texto del modelo original a formato ONNX (FP32 y FP16) y ha sustituido el motor de tokenización oficial por una implementación propia basada en SentencePiece serializado en FlatBuffers (`.spm.fb`), procesado mediante el paquete `sentencepiece_lite`, distribuido como wheel precompilado para Linux x86_64 sin necesidad de compilar C++.

El modelo resuelve un problema de despliegue muy concreto: ejecutar embeddings de calidad en entornos donde instalar PyTorch resulta caro o inviable (contenedores mínimos, funciones serverless, pipelines de datos con dependencias restringidas). Al usar únicamente ONNX Runtime, NumPy y huggingface_hub, el stack de inferencia se reduce a unas pocas decenas de megabytes frente a los cientos que ocupa una instalación estándar de PyTorch.

Se trata de un modelo de la familia Gemma orientado exclusivamente a la extracción de características y similitud semántica de frases, no a la generación de texto. Solo se ha exportado la torre de texto (`language_model`), cuyos resultados sobre entradas textuales son idénticos a los del modelo multimodal completo según indica el autor. El repositorio ocupa 1,7 GB y se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (torre de texto de google/embeddinggemma-2), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 y FP16 (exportaciones ONNX); no se documentan cuantizaciones INT8/INT4 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (single-file, sin datos externos); tokenizador en FlatBuffers (`.spm.fb`) |

## Arquitectura y entrenamiento

El modelo subyacente es google/embeddinggemma-2, descrito en el paper "EmbeddingGemma 2: Unified and Efficient Multimodal Representations" (arXiv:2610.37364). La ficha no detalla la arquitectura interna más allá de tratarse de un modelo de embeddings; la conversión de Chottokun exporta únicamente la torre de texto, de modo que las representaciones sobre texto coinciden con las del modelo completo. No se especifican en la información disponible el número de parámetros, la composición del dataset de entrenamiento, el volumen de tokens ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica de esta ficha no reside en el entrenamiento sino en el empaquetado: los pesos PyTorch originales en safetensors se convierten a ONNX FP32 y FP16 en un único fichero; el modelo SentencePiece oficial se serializa en FlatBuffers; y se añade una implementación de inferencia independiente (`lite_embed.py`) que no depende de PyTorch ni de Transformers. Los identificadores de tokens especiales (BOS=2, EOS=1, PAD=0) y el comportamiento de BOS/EOS se midieron del tokenizador original en tiempo de construcción y se registran en `lite_config.json`, sin valores codificados a mano.

## Capacidades

- Generación de embeddings de frases para similitud semántica y búsqueda (pipeline `feature-extraction` / `sentence-similarity`).
- Codificación diferenciada de consultas y pasajes mediante prefijos de tarea: `task: search result | query: ` para consultas y `title: none | text: ` para documentos.
- Ejecución sin PyTorch ni Transformers, solo con ONNX Runtime, NumPy y huggingface_hub.
- Tokenización mediante `sentencepiece_lite` con soporte de Safe Boundary Pre-tokenization (SBP) y formato FlatBuffers.
- Precisión configurable en GPU mediante `gpu_precision` (por defecto `fp32`, con `allow_fp16=False`).
- No incluye generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un modelo de representaciones.

## Casos de uso

- Búsqueda semántica en producción: el modelo codifica consultas y pasajes con prefijos distintos, lo que permite construir índices vectoriales y recuperar documentos por similitud coseno sin arrastrar PyTorch al servicio de búsqueda.
- Funciones serverless y contenedores mínimos: al depender solo de ONNX Runtime y NumPy, encaja en imágenes Docker reducidas o en plataformas con límites estrictos de tamaño de despliegue.
- Deduplicación y clustering de textos: los embeddings permiten agrupar documentos o tickets similares; la inferencia ONNX FP16 reduce el coste por lote en CPU o GPU.
- RAG ligero en pipelines de datos: integración en tareas de ingestión (por ejemplo, Airflow o jobs de Python) donde instalar el stack completo de Transformers es problemático.
- Clasificación y enrutado por similitud: comparar la consulta del usuario contra un conjunto de intenciones precalculadas para dirigirla al servicio adecuado.
- Sistemas con requisitos de portabilidad: al distribuir el tokenizador como wheel precompilado para Linux x86_64, se evita compilar C++ en la imagen de despliegue.
- Evaluación de calidad de respuestas: medir la similitud entre respuestas generadas y referencias en pipelines de evaluación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión al no conocerse el número de parámetros; el repositorio completo ocupa 1,7 GB, y la exportación ONNX FP16 reduce aproximadamente a la mitad el peso de los pesos respecto a FP32.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; la política por defecto es FP32 en GPU (`allow_fp16=False`), lo que aumenta el consumo de memoria frente a FP16.
- Despliegue: ONNX Runtime (CPU o GPU) con el paquete `lite_embed`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Plataforma del wheel: `manylinux_2_27/2_28_x86_64`, CPython 3.11 ABI3; no se mencionan builds para macOS ni ARM.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Dependencias | Licencia | Notas |
|---|---|---|---|---|---|
| Chottokun/embeddinggemma-2-lite | Embeddings de texto | ONNX + FlatBuffers | ONNX Runtime, NumPy | Apache 2.0 | Zero-Torch, wheel precompilado |
| google/embeddinggemma-2 | Embeddings multimodales | Safetensors (PyTorch) | PyTorch, Transformers | Apache 2.0 | Modelo base completo, incluye torre multimodal |
| Otros modelos de embeddings de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Solo se exporta la torre de texto: no hay capacidades multimodales aunque el modelo base las tenga.
- No es un modelo generativo; no debe usarse para completar texto, razonar ni invocar herramientas.
- El rendimiento de los embeddings depende de aplicar correctamente los prefijos de consulta y pasaje; omitirlos degrada la similitud.
- El wheel de `sentencepiece_lite` solo está disponible para Linux x86_64 con CPython 3.11 ABI3; en otras plataformas habría que compilar o buscar alternativas.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día: no hay evidencia de uso en producción ni validación comunitaria.
- No se documentan sesgos, tasas de alucinación ni cobertura idiomática; al tratarse de un modelo de embeddings, el riesgo de alucinación se traslada a la calidad de la recuperación, no a la generación.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar el aviso de modificaciones y conservar la copia de la licencia del modelo base incluida en el repositorio.
- La precisión por defecto en GPU es FP32 con `allow_fp16=False`, lo que puede encarecer el despliegue si se esperaba FP16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chottokun/embeddinggemma-2-lite
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Paper de EmbeddingGemma 2: https://arxiv.org/abs/2610.37364
- SentencePiece (repositorio oficial): https://github.com/google/sentencepiece
- Paper de SentencePiece: https://aclanthology.org/D18-2012
- Licencia Apache 2.0: http://www.apache.org/licenses/LICENSE-2.0
