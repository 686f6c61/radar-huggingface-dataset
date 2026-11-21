# nokkela-ai/bge-m3

## Resumen

BGE-M3 es un modelo de embeddings de texto desarrollado originalmente por BAAI (Beijing Academy of Artificial Intelligence) y distribuido en este repositorio como una copia independiente (fork) por nokkela-ai. Resuelve el problema de la recuperación de información multilingüe y multigranular dentro de pipelines RAG, ya que unifica en un solo modelo tres funcionalidades de recuperación: dense retrieval, multi-vector (estilo ColBERT) y sparse retrieval (estilo BM25). Esta versatilidad permite construir sistemas de búsqueda híbrida sin necesidad de desplegar varios modelos especializados.

El modelo se construye sobre una arquitectura XLM-RoBERTa extendida a una longitud de secuencia de 8192 tokens, con una dimensión de embedding de 1024. Su entrenamiento sigue una cadena de tres etapas (RetroMAE, aprendizaje contrastivo y ajuste fino unificado) que le permite manejar más de 100 idiomas y documentos largos. Es relevante ahora porque compite directamente con embeddings propietarios como los de OpenAI en tareas multilingües, manteniendo licencia MIT y pesos abiertos.

Este repositorio concreto es una réplica del modelo original BAAI/bge-m3 publicada por nokkela-ai, con 0 descargas y 0 likes en el momento de la consulta. No aporta modificaciones técnicas respecto al original según la información disponible; se trata de una copia del modelo base con su propia model card heredada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder basado en XLM-RoBERTa (extendido a 8192 tokens) |
| Parametros totales | no disponible (el modelo base XLM-RoBERTa-large ronda los 568M, pero no se confirma en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (el repo incluye pesos PyTorch y ONNX; no se detallan cuantizaciones) |
| Idiomas soportados | mas de 100 idiomas de trabajo |
| Licencia | MIT |
| Formato de pesos | safetensors / PyTorch y ONNX (tamano del repo: 4.6 GB) |

## Arquitectura y entrenamiento

BGE-M3 parte de XLM-RoBERTa, cuya longitud máxima de secuencia se extiende hasta 8192 tokens y se preentrena adicionalmente con la metodología RetroMAE. Sobre esa base se aplica aprendizaje contrastivo (etapa bge-m3-unsupervised) y finalmente un ajuste fino unificado que dota al modelo de tres cabeceras de recuperación simultáneas: dense (embedding de 1024 dimensiones), sparse (pesos por token similares a BM25) y multi-vector (representaciones por token estilo ColBERT). Esta combinación es la innovación central: un único forward pass produce las tres representaciones, lo que abarata la búsqueda híbrida.

El entrenamiento emplea datos multilingües y el conjunto MLDR (recuperación de documentos largos en 13 idiomas), además de datos publicados para ajuste fino unificado. La model card no detalla el número exacto de tokens de entrenamiento ni la composición completa del dataset, por lo que esos datos no están disponibles. Tampoco se documenta en este repositorio el uso explícito de RLHF o DPO, algo esperable en un modelo de embeddings y no de generación.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para similitud semántica y recuperación.
- Recuperación sparse: produce pesos por token comparables a BM25 sin coste adicional.
- Recuperación multi-vector (ColBERT): representaciones por token para re-ranking fino.
- Procesamiento multilingüe en más de 100 idiomas.
- Manejo de entradas de hasta 8192 tokens, desde frases cortas hasta documentos largos.
- Extracción de características (feature-extraction) y sentence-similarity vía sentence-transformers.
- Compatible con text-embeddings-inference y endpoints compatibles.
- Exportación a ONNX para despliegue en entornos sin PyTorch.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-step por sí mismo; se usa como componente de recuperación dentro de pipelines mayores.

## Casos de uso

- Búsqueda híbrida en RAG: combinar dense y sparse en un solo modelo permite indexar documentos y consultas obteniendo ambos tipos de representación en una pasada, reduciendo la infraestructura frente a desplegar un embedding denso y BM25 por separado.
- Recuperación multilingüe: para bases de conocimiento con documentos en varios idiomas, el modelo permite consultas en un idioma y recuperación en otro gracias a su cobertura de más de 100 lenguas.
- Recuperación de documentos largos: con 8192 tokens de contexto, se pueden indexar contratos, informes o artículos completos sin trocear en exceso, lo que mejora la coherencia semántica de la recuperación.
- Re-ranking dentro de pipelines de búsqueda: la salida multi-vector permite un re-ranking fino sobre los candidatos recuperados, complementando un re-ranker cross-encoder como bge-reranker.
- Deduplicación y clustering semántico: los embeddings densos sirven para agrupar documentos similares en corpus grandes, tareas de moderación o curación de datasets.
- Sistemas de recomendación basados en contenido: similitud entre descripciones de productos o artículos para sugerencias personalizadas.
- Indexación en bases vectoriales: integración con Milvus o Vespa para búsqueda híbrida sparse+dense en producción, con ejemplos oficiales publicados.

## Benchmarks y rendimiento

La información proporcionada no incluye tablas numéricas de benchmarks (MMLU, HumanEval, GSM8K u otros). La model card menciona resultados en MIRACL y una comparativa externa de Towards Data Science donde BGE-M3 supera a modelos de OpenAI en inglés y otros idiomas, pero no se aportan cifras concretas en el material disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 4.6 GB en pesos PyTorch; en FP16 se estima alrededor de 1,1-1,2 GB para un modelo de ~568M parámetros, aunque el dato exacto de parámetros no se confirma.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; A100, H100 o RTX 4090 para alto throughput en batch.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference, ONNX Runtime (hay pesos ONNX en el repo), integración con Milvus y Vespa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Dimension | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| nokkela-ai/bge-m3 (este) | 1024 | 8192 | >100 | MIT | Fork de BAAI/bge-m3, misma arquitectura |
| BAAI/bge-m3 | 1024 | 8192 | >100 | MIT | Modelo original, misma funcionalidad |
| BAAI/bge-large-en-v1.5 | 1024 | 512 | Inglés | MIT | Solo inglés, contexto corto |
| BAAI/bge-base-en-v1.5 | 768 | 512 | Inglés | MIT | Solo inglés, menor dimensión |

La comparativa con modelos de embeddings multilingües de otros proveedores (p. ej. OpenAI text-embedding-3) no está disponible con cifras en la información proporcionada. La model card cita una comparativa externa donde BGE-M3 supera a OpenAI en inglés y otros idiomas, pero sin datos numéricos reproducibles aquí.

## Limitaciones y advertencias

- Este repositorio es un fork sin modificaciones técnicas documentadas; para producción conviene evaluar el modelo original BAAI/bge-m3, que tiene mantenimiento y comunidad activos.
- No es un modelo generativo: no responde preguntas ni genera texto, solo produce representaciones.
- Riesgo de sesgo heredado de XLM-RoBERTa y de los corpus de entrenamiento multilingües; la model card no documenta auditorías de sesgo.
- El rendimiento puede degradarse en idiomas con poca representación en los datos de entrenamiento, aunque se declaren más de 100 idiomas.
- La longitud de 8192 tokens implica mayor coste computacional en inferencia que modelos con contexto de 512.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base original y de los datasets de entrenamiento.
- Con 0 descargas y 0 likes, este fork no tiene validación comunitaria; no hay garantía de que los pesos estén íntegros o actualizados respecto al original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nokkela-ai/bge-m3
- Modelo original: https://huggingface.co/BAAI/bge-m3
- Paper BGE-M3: https://arxiv.org/pdf/2402.03216.pdf
- Código FlagEmbedding: https://github.com/FlagOpen/FlagEmbedding
- Ejemplo de ajuste fino unificado: https://github.com/FlagOpen/FlagEmbedding/tree/master/examples/unified_finetune
- Dataset de ajuste fino: https://huggingface.co/datasets/Shitao/bge-m3-data
- Dataset MLDR: https://huggingface.co/datasets/Shitao/MLDR
- Pipeline de evaluación MLDR: https://github.com/FlagOpen/FlagEmbedding/tree/master/C_MTEB/MLDR
- Notebook de Vespa para búsqueda híbrida: https://github.com/vespa-engine/pyvespa/blob/master/docs/sphinx/source/examples/mother-of-all-embedding-models-cloud.ipynb
- Ejemplo híbrido en Milvus: https://github.com/milvus-io/pymilvus/blob/master/examples/hello_hybrid_sparse_dense.py
- Comparativa externa (Towards Data Science): https://towardsdatascience.com/openai-vs-open-source-multilingual-embedding-models-e5ccb7c90f05
- Dataset de reproducción MIRACL: https://huggingface.co/datasets/hanhainebula/bge-m3_miracl_2cr
- Repositorio RetroMAE: https://github.com/staoxiao/RetroMAE
- XLM-RoBERTa-large: https://huggingface.co/FacebookAI/xlm-roberta-large
