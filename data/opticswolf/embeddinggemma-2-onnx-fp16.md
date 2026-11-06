# opticsWolf/embeddinggemma-2-onnx-fp16

## Resumen

`opticsWolf/embeddinggemma-2-onnx-fp16` es un espejo en formato ONNX FP16 de la torre de texto del modelo de embeddings `google/embeddinggemma-2`, publicado por el usuario opticsWolf. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de pesos para servir el modelo base con el runtime ONNX, orientada específicamente a inferencia en GPU CUDA mediante la herramienta `embroider`. El repositorio contiene únicamente la torre de texto (270M parámetros); los codificadores de visión y audio del modelo original quedan fuera del alcance de esta conversión.

El modelo resuelve el problema de desplegar un encoder de frases de alta calidad en entornos de producción que ya utilizan ONNX Runtime, evitando la dependencia de PyTorch o de `sentence-transformers` en tiempo de inferencia. Mantiene el contrato de prompts de Gemma para tareas de recuperación (`task: search result | query:` y `title: none | text:`), aplica mean pooling, proyección y normalización L2 dentro del grafo, y expone directamente el tensor `sentence_embedding`.

Es relevante porque ofrece una alternativa ligera (0,6 GB de repositorio) para búsqueda semántica y RAG con ventana de contexto de 8K tokens y embeddings de dimensión reducible (MRL) a 128, 256, 512 o 768, todo bajo licencia Apache-2.0. La conversión está verificada contra la versión FP32 con una discrepancia máxima de 2,1e-4 y similitud coseno cercana a 1,0 en cuatro sondas de consulta/documento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (torre de texto de EmbeddingGemma 2), exportado a ONNX |
| Parametros totales | 270M (solo torre de texto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8K tokens |
| Tipos de cuantizacion | FP16 (este repositorio); FP32 disponible en el repositorio de origen |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_fp16.onnx` + `onnx/model_fp16.onnx_data`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la torre de texto de EmbeddingGemma 2, un encoder transformer de 270M parámetros diseñado para generar embeddings de frases. La conversión a ONNX preserva el grafo completo de inferencia: tokenización con `tokenizer.json`, mean pooling sobre las representaciones del encoder, capa de proyección y normalización L2, todo integrado en el grafo ONNX de modo que la salida `sentence_embedding` ya está lista para comparación por similitud coseno. Se mantiene el esquema de Matryoshka Representation Learning (MRL), que permite truncar los embeddings a 128, 256, 512 o 768 dimensiones sin reentrenar.

No se dispone de información sobre los datos de entrenamiento del modelo base en la documentación proporcionada (número de tokens, composición del dataset, uso de RLHF/DPO). La conversión en sí no implica reentrenamiento: los pesos FP16 derivan de `onnx-community/embeddinggemma-2-ONNX` en el commit `daa72c5`, que a su vez procede de `google/embeddinggemma-2`. La innovación técnica destacable de este repositorio es la paridad numérica verificada frente a FP32 en CPU con ONNX Runtime 1.29, y la decisión de diseño de que FP16 sea exclusivo de CUDA (en CPU se emula y resulta lento, por lo que se recomienda servir FP32 en CPU).

## Capacidades

- Generación de embeddings de texto para búsqueda semántica, recuperación de información y clustering.
- Soporte del contrato de prompts de Gemma para tareas de recuperación: prefijo `task: search result | query:` para consultas y `title: none | text:` para documentos.
- Embeddings con truncamiento MRL a 128, 256, 512 o 768 dimensiones.
- Ventana de contexto de 8K tokens, adecuada para documentos largos o chunks extensos.
- Mean pooling, proyección y normalización L2 integrados en el grafo ONNX.
- Inferencia optimizada para GPU CUDA mediante ONNX Runtime y la herramienta `embroider`.
- No incluye capacidades de visión ni audio (los codificadores correspondientes quedan fuera del alcance de esta conversión).
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-step por sí mismo.

## Casos de uso

- Búsqueda semántica en producción sobre ONNX Runtime: el modelo se integra directamente en pipelines que ya usan ORT sin necesidad de PyTorch, generando embeddings normalizados listos para indexar en bases vectoriales como FAISS, Qdrant o pgvector.
- RAG (retrieval-augmented generation): gracias a la ventana de 8K tokens y al contrato de prompts query/document, se puede usar para indexar fragmentos largos de documentación y recuperar los pasajes más relevantes antes de pasarlos a un LLM generativo.
- Deduplicación y clustering de documentos: los embeddings MRL de 128 dimensiones permiten agrupaciones rápidas y económicas en memoria, con la opción de subir a 768 dimensiones para mayor precisión cuando sea necesario.
- Servicio de embeddings en GPU con CUDA: al ser FP16 y estar pensado para `embroider`, encaja en despliegues con GPU donde se busca maximizar throughput por lote frente a la versión FP32.
- Motor de búsqueda interno sobre documentación técnica: el prefijo `task: search result | query:` permite distinguir consultas de documentos y mejorar la precisión de recuperación en corpus especializados.
- Clasificación y moderación de contenido basada en similitud: comparando embeddings de textos entrantes contra prototipos etiquetados se pueden construir filtros y sistemas de enrutamiento sin entrenar un clasificador adicional.
- Evaluación de similitud semántica entre pares de frases en pipelines de control de calidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de paridad numérica de la conversión: discrepancia máxima de 2,1e-4 frente a FP32 en CPU con ONNX Runtime 1.29 y similitud coseno cercana a 1,0 en cuatro sondas de consulta/documento. No se aportan resultados de MMLU, MTEB, HumanEval ni métricas de recuperación.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0,6 GB en disco; en FP16 la torre de texto de 270M parámetros requiere aproximadamente 0,5-0,6 GB de VRAM para los pesos, más memoria para activaciones y lotes (dependiente del tamaño de lote y de la longitud de secuencia hasta 8K tokens).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 2 GB de VRAM para lotes pequeños; para lotes grandes con secuencias de 8K se recomienda 8 GB o más (RTX 3060/4060 en adelante, A100/H100 para throughput alto).
- Cabe en GPU de consumo: sí, en cualquier GPU NVIDIA moderna con CUDA; el modelo es muy ligero.
- Opciones de despliegue: ONNX Runtime con CUDA Execution Provider (diseño previsto para `embroider`); en CPU se recomienda servir la variante FP32 del repositorio de origen, ya que FP16 en CPU se emula y resulta lento.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| opticsWolf/embeddinggemma-2-onnx-fp16 | 270M (torre de texto) | 8K | ONNX FP16 | Apache-2.0 | Conversión para CUDA/ONNX Runtime |
| google/embeddinggemma-2 | no disponible | 8K | safetensors (original) | Apache-2.0 | Modelo base completo (texto, visión y audio) |
| onnx-community/embeddinggemma-2-ONNX | no disponible | 8K | ONNX (FP32 y otras variantes) | Apache-2.0 | Repositorio de origen de la conversión |

No se dispone de datos de rendimiento comparativo (MTEB u otras métricas) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo incluye la torre de texto: no cubre los codificadores de visión ni audio del modelo base, por lo que no sirve para tareas multimodales.
- FP16 está pensado exclusivamente para CUDA; en CPU se emula y es lento, por lo que en ese entorno debe usarse la variante FP32.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-step.
- No se dispone de información sobre sesgos, cobertura idiomática ni tasas de alucinación del modelo base en la documentación proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `google/embeddinggemma-2` y de la conversión intermedia `onnx-community/embeddinggemma-2-ONNX`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-03, por lo que su adopción y mantenimiento no están contrastados.
- La paridad numérica se verificó únicamente en CPU con ONNX Runtime 1.29 sobre cuatro sondas; no hay evidencia publicada de comportamiento en CUDA a gran escala.
- Para producción se recomienda validar la calidad de recuperación en el dominio concreto antes de sustituir un encoder ya desplegado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/opticsWolf/embeddinggemma-2-onnx-fp16
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Repositorio ONNX de origen: https://huggingface.co/onnx-community/embeddinggemma-2-ONNX
