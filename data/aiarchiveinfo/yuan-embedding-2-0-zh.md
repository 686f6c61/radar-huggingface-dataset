# AIArchiveInfo/Yuan-embedding-2.0-zh

## Resumen

Yuan-embedding-2.0-zh es un modelo de embeddings de texto desarrollado por IEI (Instituto de Información Electrónica, Universidad de Tsinghua) y publicado originalmente en el repositorio `IEITYuan/Yuan-embedding-2.0-zh`. La ficha que nos ocupa, `AIArchiveInfo/Yuan-embedding-2.0-zh`, es un espejo de preservación byte a byte del original, archivado por AIArchive el 25 de septiembre de 2026 sobre la revisión `fb4ab1ed9d34`; no se ha entrenado, ajustado ni modificado ningún peso y la licencia original Apache 2.0 se mantiene. El modelo está diseñado específicamente para tareas de recuperación (retrieval) y reranking de texto en chino.

Técnicamente es un encoder transformer de tipo BERT con 325.522.432 parámetros (aproximadamente 0,33 mil millones, dato verificado en el archivo `safetensors`), una dimensión de embedding de 1792 y una ventana máxima de 512 tokens. Se distribuye a través de la librería `sentence-transformers` (versión recomendada 3.4.1) y emplea Matryoshka Representation Learning, lo que permite truncar la dimensión del vector de salida manteniendo una calidad degradada de forma controlada.

Su relevancia radica en que es la segunda iteración de la familia Yuan-embedding, con mejoras declaradas por los autores en recuperación y reordenación mediante muestreo de negativos duros evaluados doblemente por un modelo de reranking y un LLM, datos sintéticos generados con Yuan2-M32 y una función de pérdida multitarea. Está pensado para pipelines RAG y motores de búsqueda en chino, donde compite con alternativas como BGE-M3 o bge-large-zh-v1.5.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer de tipo BERT (bidireccional); número de capas y cabezas no disponible |
| Parámetros totales | 325.522.432 (≈0,33 B) según archivo `safetensors` |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens máximo |
| Dimensión de embedding | 1792 (con Matryoshka Representation Learning, permite truncado) |
| Tipos de cuantización | No disponible (no se publican versiones cuantizadas oficiales; el repo contiene safetensors) |
| Idiomas soportados | Chino (zh) únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (tamaño del repositorio: 2,6 GB) |
| Librería de inferencia | `sentence-transformers` (se recomienda la versión 3.4.1) |
| Normalización | Se recomienda `normalize_embeddings=True` en las llamadas a `encode()` |
| Tarea declarada | Embeddings de texto densos para retrieval y reranking (etiqueta MTEB en la model card) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de encoder transformer bidireccional de tipo BERT, con un total de 325.522.432 parámetros y una dimensión de representación de 1792. Se trata de una arquitectura densa, sin mezcla de expertos ni mecanismos de estado recurrente, orientada exclusivamente a producir embeddings de frase y de pasaje. El número de capas, cabezas de atención y la dimensión interna del `hidden_size` no están documentados en la información disponible.

El entrenamiento parte de Yuan-embedding-1.0 y se optimiza para dos tareas: recuperación (retrieval) y reordenación (reranking). Los autores declaran tres bloques de trabajo. En el apartado de datos, se emplea muestreo de negativos duros con doble evaluación (un modelo de reranking y un LLM filtran conjuntos de pares positivos y negativos de alta calidad) y datos sintéticos generados reescribiendo las consultas del conjunto de entrenamiento con Yuan2-M32. En el apartado de pérdidas, se combinan varias funciones: una pérdida multitarea, Matryoshka Representation Learning para permitir dimensiones de salida truncadas, `InfoNCE with in-batch negatives` para la tarea de recuperación y una `Margin-Adaptive Pairwise Ranking Loss` diseñada específicamente para la tarea de reranking. No se documenta el número total de tokens de entrenamiento ni la composición exacta del dataset, ni se menciona el uso de RLHF o DPO (no aplicables a un modelo de embeddings).

## Capacidades

- Generación de embeddings densos de frases y pasajes en chino, con salida de 1792 dimensiones.
- Recuperación semántica (búsqueda por similitud vectorial) sobre corpus en chino.
- Reordenación de resultados recuperados, gracias a la pérdida de ranking adaptativa por margen declarada por los autores.
- Truncado de dimensiones mediante Matryoshka Representation Learning, útil para almacenamiento vectorial con memoria reducida.
- Similitud coseno directa entre embeddings normalizados mediante producto matricial.
- No dispone de capacidad de generación de texto, razonamiento, código ni matemáticas.
- No dispone de soporte de tool calling, function calling ni uso como agente.
- No dispone de capacidades multimodales (visión, audio) ni de modo de razonamiento extendido.
- Capacidad multilingüe: no disponible; está etiquetado exclusivamente para chino (`zh`).

## Casos de uso

- Búsqueda semántica en corpus documentales chinos: el modelo convierte consultas y documentos en vectores de 1792 dimensiones que se indexan en una base vectorial; el límite de 512 tokens obliga a fragmentar documentos largos en pasajes.
- Generación aumentada por recuperación (RAG) sobre documentación técnica o normativa en chino: se recuperan los pasajes más relevantes antes de pasarlos a un LLM generativo, reduciendo el contexto enviado al modelo de generación.
- Reordenación de candidatos en un motor de búsqueda: tras una primera fase de recuperación barata (por ejemplo, BM25 o un índice vectorial ANN), el modelo reordena los 50-100 mejores resultados, aprovechando la función de ranking adaptativa con la que fue entrenado.
- Deduplicación y agrupamiento de contenidos: al proyectar titulares, artículos o tickets en un espacio vectorial normalizado, se pueden aplicar k-means o umbrales de similitud coseno para detectar duplicados y agrupar temas en corpus editoriales chinos.
- Respuestas automáticas en atención al cliente: indexación de una base de preguntas frecuentes en chino y recuperación del artículo más similar a la consulta del usuario; el modelo no genera la respuesta, solo identifica el documento correcto.
- Recomendación de contenidos relacionados: cálculo de similitud entre el embedding del artículo consumido y el resto del catálogo para ordenar sugerencias, con indexación previa de todo el catálogo.
- Moderación y clasificación temática mediante embeddings: entrenamiento de un clasificador ligero (regresión logística, SVM lineal) sobre los vectores congelados para etiquetar tickets, comentarios o noticias por categoría.
- Evaluación comparativa con MTEB en su partición china: el modelo está etiquetado con `mteb`, de modo que puede integrarse en el pipeline de evaluación estándar para tareas de recuperación y clasificación en chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye puntuaciones numéricas en MTEB ni en ningún otro conjunto de evaluación; únicamente describe el proceso de mejora respecto a Yuan-embedding-1.0 y declara la optimización para tareas de retrieval y reranking. La página del modelo en el leaderboard de MTEB confirma la existencia de la entrada (327M parámetros, 1792 dimensiones, 512 tokens), pero no se han proporcionado las puntuaciones asociadas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en precisión fp32 (325 M de parámetros × 4 bytes) y cerca de 0,65 GB en fp16/bf16. Con el pico de activaciones y el tokenizador, un presupuesto realista es de 1,5-2,5 GB en fp32 y menos de 1,5 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Modelos como RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 o H100 cubren el modelo con holgura; en la mayoría de escenarios el cuello de botella será el ancho de banda de memoria, no la capacidad de cómputo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con más de 4 GB de VRAM (GTX 1660 6 GB, RTX 3060 12 GB, RTX 4090 24 GB). También se puede ejecutar en CPU con un rendimiento reducido.
- Opciones de despliegue: `sentence-transformers` 3.4.1 (ruta recomendada por la model card), servidores de embeddings como Hugging Face Text Embeddings Inference (TEI) o Infinity, y `vLLM` en modo embedding. El despliegue en formato GGUF vía `llama.cpp`/Ollama no está publicado oficialmente para este modelo.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión de salida | Contexto máximo | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Yuan-embedding-2.0-zh | 325,5 M | 1792 (Matryoshka) | 512 tokens | Chino | Apache 2.0 | Hugging Face (original y espejo), ModelScope |
| bge-large-zh-v1.5 | ≈326 M | 1024 | 512 tokens | Chino | MIT | Hugging Face, ModelScope |
| BGE-M3 | ≈568 M | 1024 | 8192 tokens | Multilingüe (más de 100 idiomas) | MIT | Hugging Face, ModelScope |
| multilingual-e5-large | ≈560 M | 1024 | 512 tokens | Multilingüe | MIT | Hugging Face |

La comparativa de rendimiento entre estos modelos no está disponible en la información proporcionada: no se han publicado puntuaciones de MTEB para Yuan-embedding-2.0-zh, por lo que cualquier afirmación sobre superioridad o inferioridad frente a las alternativas carecería de respaldo. La diferencia más objetiva es de cobertura: BGE-M3 y multilingual-e5-large son multilingües y BGE-M3 multiplica por 16 la ventana de contexto, mientras que Yuan-embedding-2.0-zh ofrece la mayor dimensión de salida del grupo.

## Limitaciones y advertencias

- Modelo monolingüe en chino: no está entrenado ni evaluado para otros idiomas, por lo que su uso en castellano, inglés u otras lenguas producirá recuperaciones de baja calidad.
- Ventana de contexto de 512 tokens: los documentos largos deben fragmentarse en trozos, lo que introduce decisiones de chunking que afectan directamente a la calidad del retrieval.
- Riesgo de falsos positivos por similitud: al ser un modelo de embeddings y no generativo, no alucina texto, pero sí puede devolver pasajes semánticamente próximos que no responden a la consulta; conviene combinar con una etapa de reranking o con umbrales de similitud.
- Sesgos heredados: al entrenarse con corpus chinos y datos sintéticos generados por Yuan2-M32, puede reproducir sesgos presentes en esas fuentes, incluyendo sesgos de dominio, registro o ideológicos. No se documenta ningún análisis de sesgo.
- Datos sintéticos: parte del conjunto de entrenamiento son consultas reescritas por un LLM, lo que puede introducir distribuciones artificiales no representativas del tráfico real.
- Licencia Apache 2.0: permite uso comercial y modificación, siempre que se conserve el aviso de copyright y la licencia, y se indiquen los cambios. No impone restricciones de uso adicionales.
- El repositorio consultado es un espejo de preservación, no el oficial: se debe atribuir el crédito a IEI y tener en cuenta que las actualizaciones y el soporte se publican en `IEITYuan/Yuan-embedding-2.0-zh`. Los pesos son idénticos byte a byte, pero la ficha del espejo no está mantenida por los autores.
- Poca validación comunitaria en el espejo: 0 descargas y 0 «likes» en la fecha de consulta, lo que no aporta ninguna señal sobre su comportamiento en producción.
- Dependencia de versión: la model card fija `sentence-transformers==3.4.1`; cambios de versión mayores pueden alterar el comportamiento de carga o de pooling.
- Sin resultados de benchmarks publicados: la elección frente a alternativas debe validarse con una evaluación propia sobre el dominio objetivo antes de llevarlo a producción.

## Enlaces

- Espejo en Hugging Face (ficha consultada): https://huggingface.co/AIArchiveInfo/Yuan-embedding-2.0-zh
- Modelo original en Hugging Face: https://huggingface.co/IEITYuan/Yuan-embedding-2.0-zh
- Árbol de archivos del modelo original: https://huggingface.co/IEITYuan/Yuan-embedding-2.0-zh/tree/main
- Revisión archivada por el espejo: https://huggingface.co/IEITYuan/Yuan-embedding-2.0-zh/tree/fb4ab1ed9d3447b64c79e305c8913340327668b5
- Modelo en ModelScope: https://www.modelscope.cn/models/IEITYuan/Yuan-embedding-2.0-zh
- Ficha en featherless.ai: https://featherless.ai/models/IEITYuan/Yuan-embedding-2.0-zh
- Entrada en el leaderboard de MTEB: https://leaderboard.mteb.org/models/IEITYuan/Yuan-embedding-2.0-zh
- Modelo predecesor, Yuan-embedding-1.0: https://huggingface.co/IEITYuan/Yuan-embedding-1.0
- Modelo generativo usado para los datos sintéticos, Yuan2-M32: https://huggingface.co/IEITYuan/Yuan2-M32
