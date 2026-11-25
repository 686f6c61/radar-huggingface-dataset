# bek91/embeddinggemma-2-wsp-GGUF

## Resumen

EmbeddingGemma 2 WSP es una variante del modelo de embeddings `google/embeddinggemma-2` de Google DeepMind, redistribuida en formato GGUF (cuantización Q8_0) por el usuario bek91. El modelo base es un encoder bidireccional de 270 millones de parámetros (271.002.648 según los pesos en safetensors) con una ventana de contexto de 8.192 tokens, diseñado para generar representaciones vectoriales de texto y código. La modificación introducida por bek91, denominada "Weight-Space Programming", altera únicamente el 0,0967% de los parámetros del modelo (262.058 escalares) dentro de la matriz de proyección de embeddings, sin reentrenamiento ni descenso de gradiente.

El objetivo de esta edición es corregir la anisotropía del espacio de embeddings original: el modelo base alinea cuatro modalidades (texto, imagen, vídeo y audio) en un mismo espacio de 768 dimensiones, lo que comprime el texto en un subcono donde documentos no relacionados obtienen similitudes coseno artificialmente altas (en torno a 0,53-0,61). La edición sustrae un "portador de offset compartido" estabilizado por ridge de las filas finales de la proyección y restaura la energía original de esas filas, mejorando la separabilidad entre documentos relevantes e irrelevantes.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de post-procesado de pesos sin entrenamiento aplicada a un modelo de embeddings; por otro, ofrece una build GGUF lista para `llama.cpp` con licencia Apache 2.0, lo que facilita su despliegue en entornos locales. No obstante, el repositorio tiene cero descargas y cero "likes" en el momento de la consulta, y no se han publicado evaluaciones de las modalidades no textuales tras la edición.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (modelo de embeddings, base `google/embeddinggemma-2`) |
| Parámetros totales | 271.002.648 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | Q8_0 (GGUF); el modelo base admite otras cuantizaciones, no detalladas en la información disponible |
| Idiomas soportados | multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con `llama-quantize`); el modelo base en safetensors |
| Dimensión del embedding | 768 dimensiones (con truncamiento Matryoshka a 256 dimensiones preservado bit a bit) |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo base es un encoder bidireccional de tipo transformer con 270 millones de parámetros en su backbone textual, orientado a la extracción de características y a la similitud semántica. Al ser bidireccional, `llama.cpp` requiere que el tamaño de lote de micro-ajuste (`-ub`) sea mayor o igual al número máximo de tokens por fragmento. El modelo original de Google DeepMind alinea cuatro modalidades en un espacio compartido de 768 dimensiones y soporta truncamiento Matryoshka, de modo que las primeras 256 dimensiones forman un embedding utilizable de forma independiente.

La edición WSP no implica entrenamiento: según la model card, se aplica una resta de un portador de offset compartido de rango 1, estabilizado por ridge, sobre las filas `W[256:]` de la matriz de proyección de embeddings (`language_model.embedding_projection.weight`), usando un panel de calibración de 112 textos sin etiquetar. A continuación se restaura la energía original de la cola multiplicando por 1,5313 y se cuantiza a Q8_0. Las primeras 256 filas (`W[:256]`) permanecen idénticas bit a bit al modelo original, por lo que el embedding Matryoshka de 256 dimensiones no se ve afectado. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica, similitud de frases y extracción de características.
- Recuperación de código: la model card reporta nDCG@10 de 1,0000 en una evaluación de recuperación de código a 768 dimensiones.
- Soporte multilingüe heredado del modelo base.
- Embeddings truncables a 256 dimensiones mediante Matryoshka, con paridad bit a bit respecto al modelo original.
- Prefijos de prompt compatibles con el modelo base: `task: search result | query: {query}` para consultas y `title: {title or "none"} | text: {content}` para documentos.
- Compatibilidad con `llama.cpp` (servidor con `--embeddings`) y con `node-llama-cpp` (versión 3.22.3 o superior).
- No se han evaluado las capacidades de imagen, audio o vídeo tras la edición; la build está pensada para texto y código.

## Casos de uso

- Búsqueda semántica en documentación técnica: el modelo genera embeddings de 768 dimensiones con un margen de separación mayor entre documentos relevantes e irrelevantes (según la evaluación en NFCorpus y SciFact), lo que reduce falsos positivos en motores de recuperación sobre corpus internos.
- Recuperación de código en repositorios: con nDCG@10 de 1,0000 en la evaluación de recuperación de código reportada, es adecuado para indexar fragmentos de código y resolver consultas en lenguaje natural dentro de asistentes de desarrollo.
- Detección de preguntas sin respuesta: la reducción del coseno máximo en casos sin respuesta (de 0,5796 a 0,3349 de media) permite implementar umbrales de confianza más fiables en sistemas de FAQ o atención al cliente.
- Deduplicación y clustering de documentos: la mayor anisotropía corregida facilita agrupar textos similares y descartar duplicados en pipelines de ingesta de datos.
- RAG local sin GPU dedicada: al ser un GGUF Q8_0 de 0,3 GB, puede ejecutarse en CPU con `llama.cpp` y desplegarse en entornos con recursos limitados.
- Filtrado previo en pipelines de moderación o clasificación: los embeddings sirven como señal de similitud frente a un conjunto de referencia de textos etiquetados, con la ventaja de que el modelo es multilingüe.
- Indexación de documentación multilingüe: el soporte multilingüe del modelo base permite construir un único índice vectorial para corpus en varios idiomas.

## Benchmarks y rendimiento

Resultados de la evaluación held-out publicados por el autor (modelo original frente a la edición WSP en Q8_0):

| Benchmark | Original | Editado (wsp-Q8_0) | Delta |
|---|---:|---:|---:|
| BEIR NFCorpus Test (768d) nDCG@10 | 0,4286 | 0,4325 | +0,39 pts |
| BEIR NFCorpus Test (768d) margen | 0,0925 (neg: 0,577) | 0,1367 (neg: 0,314) | +48% |
| BEIR SciFact Test (768d) nDCG@10 | 0,9464 | 0,9536 | +0,72 pts |
| BEIR SciFact Test (768d) margen | 0,2838 (neg: 0,548) | 0,4389 (neg: 0,294) | +55% |
| BEIR SciFact Test (256d MRL) | 0,9442 | 0,9442 | idéntico bit a bit |
| Recuperación de código (768d) nDCG@10 / margen | 1,0000 / 0,2169 | 1,0000 / 0,3702 | +71% margen |
| Coseno máximo sin respuesta (media / peor) | 0,5796 / 0,6085 | 0,3349 / 0,3668 | −0,245 |

La paridad entre la versión GGUF y la versión PyTorch editada es de 0,99980 de coseno mínimo en los textos de prueba. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de embeddings y no generativo.

## Requisitos de hardware

- VRAM estimada: al tratarse de un Q8_0 de aproximadamente 0,3 GB, la inferencia puede ejecutarse íntegramente en CPU; en GPU, la huella de pesos ronda los 0,3 GB, a la que se suma la memoria para el contexto (hasta 8.192 tokens por secuencia).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente para el modelo; no se requieren A100 ni H100. Una RTX 4090 o similar queda sobredimensionada para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1060 en adelante, según memoria disponible); también en CPU.
- Opciones de despliegue: `llama.cpp` (`llama-server` con `--embeddings`), `node-llama-cpp` (3.22.3 o superior) y `@unblocklabs/qmd`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión | Licencia | Formato |
|---|---:|---:|---:|---|---|
| embeddinggemma-2-wsp (esta ficha) | 271 M | 8.192 | 768 (MRL 256) | Apache 2.0 | GGUF Q8_0 |
| google/embeddinggemma-2 (original) | 270 M | 8.192 | 768 (MRL 256) | Apache 2.0 | safetensors |
| Otros modelos de embeddings de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría (por ejemplo, otros modelos de embeddings multilingües de 200-500 millones de parámetros) no está disponible en la información proporcionada. La única comparación documentada es frente al modelo base original, cuyos resultados se recogen en la sección de benchmarks.

## Limitaciones y advertencias

- Solo se ha evaluado la modalidad de texto y código tras la edición; las capacidades de imagen, audio y vídeo del modelo base no se han verificado y podrían haberse degradado.
- Es necesario reindexar tanto las consultas como los documentos al cambiar desde el modelo original, ya que los embeddings no son intercambiables entre versiones.
- El panel de calibración usado para la edición consta de solo 112 textos sin etiquetar, lo que limita la generalización de la corrección a dominios distintos de los evaluados (NFCorpus, SciFact y recuperación de código).
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de similitudes espurias en dominios alejados de la distribución de calibración.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; al heredar los pesos del modelo base, conserva los sesgos de este.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener la atribución a Google DeepMind y al autor de la edición.
- El repositorio no tiene descargas ni validación comunitaria en el momento de la consulta, por lo que su fiabilidad en producción no está contrastada.
- La edición modifica únicamente la cola de la proyección (`W[256:]`); el embedding Matryoshka de 256 dimensiones es idéntico al original y no se beneficia de las mejoras de separación reportadas a 768 dimensiones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bek91/embeddinggemma-2-wsp-GGUF
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- `llama.cpp`: https://github.com/ggml-org/llama.cpp
- `node-llama-cpp`: https://github.com/withcatai/node-llama-cpp
- `@unblocklabs/qmd`: no disponible
