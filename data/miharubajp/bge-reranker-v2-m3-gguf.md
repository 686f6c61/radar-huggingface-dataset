# miharubajp/bge-reranker-v2-m3-gguf

## Resumen

El modelo `miharubajp/bge-reranker-v2-m3-gguf` es una conversión a formato GGUF (f16) del modelo de reranking multilingüe `BAAI/bge-reranker-v2-m3`, desarrollado por el Beijing Academy of Artificial Intelligence (BAAI). Esta conversión, realizada por el usuario miharubajp, permite ejecutar el modelo directamente con `llama.cpp` mediante la opción `--reranking`, algo que no es posible con los pesos originales de Hugging Face, ya que BAAI no publica versiones GGUF oficiales.

El modelo original es un cross-encoder de 568 millones de parámetros, entrenado para puntuar la relevancia entre una consulta y un conjunto de documentos candidatos. Esta versión GGUF conserva todas las capacidades del modelo base, incluyendo soporte para japonés e inglés, y está pensada para integrarse en pipelines de recuperación aumentada por generación (RAG) o búsqueda semántica. Su relevancia radica en que facilita el despliegue local en entornos con recursos limitados, aprovechando la eficiencia de `llama.cpp` para inferencia en CPU o GPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en transformer (modelo base BAAI/bge-reranker-v2-m3) |
| Parametros totales | 567.753.729 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 |
| Idiomas soportados | ja, en |
| Licencia | MIT |
| Formato de pesos | GGUF (f16) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de los pesos de `BAAI/bge-reranker-v2-m3` al formato GGUF, realizada con la herramienta `convert_hf_to_gguf.py` de `llama.cpp`. No se ha aplicado ninguna modificación adicional sobre los pesos originales. El modelo base es un cross-encoder, es decir, procesa simultáneamente la consulta y cada documento candidato para producir una puntuación de relevancia, a diferencia de los bi-encoders que generan embeddings por separado.

No se dispone de información detallada sobre el entrenamiento del modelo original en la documentación proporcionada. Se sabe que BAAI ha publicado este modelo como parte de su familia BGE (BAAI General Embedding), orientada a tareas de recuperación y reranking multilingüe. La conversión a GGUF no altera el comportamiento del modelo, pero es necesario verificar que el clasificador de puntuación se haya convertido correctamente, ya que un fallo en este paso podría producir puntuaciones sin significado.

## Capacidades

- Reranking de documentos: dado un query y una lista de candidatos, devuelve puntuaciones de relevancia que permiten reordenar los resultados.
- Multilingüe: soporta japonés e inglés, lo que lo hace útil para sistemas de búsqueda en estos idiomas.
- Integración con llama.cpp: se puede ejecutar mediante `llama-server` con la opción `--reranking`, exponiendo un endpoint `/v1/rerank` compatible con la API de reranking.
- No es un modelo generativo: su salida es una puntuación numérica, no texto.
- Compatible con pipelines de RAG: puede usarse como etapa de refinamiento tras una recuperación inicial con embeddings.

## Casos de uso

- Búsqueda semántica en japonés e inglés: integrar el modelo en un sistema de búsqueda para reordenar los resultados obtenidos por un bi-encoder, mejorando la precisión de los documentos más relevantes.
- Recuperación aumentada por generación (RAG): en un pipeline de RAG, el reranker puede filtrar y ordenar los pasajes recuperados antes de pasarlos al modelo generativo, reduciendo el ruido y mejorando la calidad de las respuestas.
- Sistemas de pregunta-respuesta: reordenar pasajes candidatos en función de su relevancia a la pregunta, aumentando la probabilidad de que la respuesta correcta aparezca en los primeros resultados.
- Filtrado de resultados en motores de búsqueda verticales: para dominios específicos (jurídico, médico, técnico) donde se necesita un refinamiento fino de la relevancia.
- Moderación de contenido: puntuar la relevancia de documentos frente a una consulta de control para descartar contenido no relacionado.
- Evaluación de calidad de recuperación: usar el modelo como referencia para comparar la efectividad de diferentes estrategias de recuperación inicial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base `BAAI/bge-reranker-v2-m3` ha sido evaluado por BAAI en tareas de reranking multilingüe, pero no se incluyen métricas concretas en la documentación de esta conversión GGUF.

## Requisitos de hardware

- El archivo GGUF f16 ocupa aproximadamente 1 GB, por lo que el modelo puede ejecutarse en CPU con 8 GB de RAM o en GPUs con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con soporte para CUDA o Vulkan, como NVIDIA RTX 3060, RTX 4060, o superiores. También puede ejecutarse en Apple Silicon mediante Metal.
- Es viable en entornos sin GPU, ya que `llama.cpp` está optimizado para CPU.
- Opciones de despliegue: `llama-server` con la opción `--reranking`, o integración directa mediante la biblioteca `llama.cpp` en aplicaciones personalizadas.
- La latencia dependerá del hardware y del número de documentos a puntuar. En una GPU moderna, cada par consulta-documento se procesa en milisegundos; en CPU, el tiempo puede ser mayor pero aceptable para cargas moderadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| bge-reranker-v2-m3 (GGUF, este) | 568M | no disponible | ja, en | MIT | GGUF |
| bge-reranker-v2-m3 (original) | 568M | 8192 (según documentación de BAAI) | multilingüe | MIT | PyTorch |
| bge-reranker-base | 278M | 512 | multilingüe | MIT | PyTorch |
| bge-reranker-large | 560M | 512 | multilingüe | MIT | PyTorch |

Nota: los datos de contexto y parámetros de los modelos comparados provienen de la documentación pública de BAAI, no de la información proporcionada en esta ficha. La comparativa se basa en el modelo base, no en la conversión GGUF.

## Limitaciones y advertencias

- La conversión a GGUF puede no haber capturado correctamente el clasificador de puntuación. Se recomienda probar el modelo con pares de documentos de relevancia claramente distinta antes de usarlo en producción.
- El modelo solo soporta japonés e inglés; no es adecuado para otros idiomas.
- Al ser un cross-encoder, el coste computacional crece linealmente con el número de documentos a puntuar, lo que puede ser un cuello de botella en colecciones grandes.
- No es un modelo generativo; no puede producir texto ni mantener conversaciones.
- La licencia MIT permite uso comercial, pero el copyright pertenece a BAAI. Se debe conservar el aviso de copyright en las redistribuciones.
- No se dispone de información sobre sesgos o alucinaciones, ya que el modelo no genera texto. Sin embargo, las puntuaciones pueden verse afectadas por sesgos en los datos de entrenamiento del modelo original.

## Enlaces

- [Modelo en Hugging Face (miharubajp/bge-reranker-v2-m3-gguf)](https://huggingface.co/miharubajp/bge-reranker-v2-m3-gguf)
- [Modelo base BAAI/bge-reranker-v2-m3](https://huggingface.co/BAAI/bge-reranker-v2-m3)
- [Documentación oficial de BGE-Reranker-v2](https://bge-model.com/bge/bge_reranker_v2.html)
- [Página oficial de BGE](https://bge.baai.ac.cn/)
- [Repositorio de llama.cpp](https://github.com/ggml-org/llama.cpp)
