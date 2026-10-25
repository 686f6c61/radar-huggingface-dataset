# huang2244/adl-hw2-reranker

## Resumen

`huang2244/adl-hw2-reranker` es un cross-encoder de reordenación (reranking) obtenido por ajuste fino de `BAAI/bge-reranker-large` mediante la librería `sentence-transformers`. El modelo recibe un par de textos (consulta y documento) y devuelve una única puntuación de relevancia, lo que lo hace adecuado como segunda etapa de un pipeline de búsqueda semántica: recuperación amplia con un bi-encoder y reordenación precisa de los candidatos con este cross-encoder. Cuenta con 559.891.457 parámetros y una longitud máxima de secuencia de 384 tokens.

El ajuste fino se realizó sobre un conjunto de 38.640 pares con función de pérdida `BinaryCrossEntropyLoss`, y los ejemplos que aparecen en la model card corresponden a conversaciones de un asistente de compras (turnos `user`/`assistant`) emparejadas con descripciones de producto, lo que sugiere un dominio de aplicación orientado al comercio electrónico y a la búsqueda de productos.

Es relevante ahora por dos motivos prácticos: por un lado, los rerankers de ~560 M de parámetros ofrecen una mejora sustancial de precisión frente a la recuperación puramente vectorial a un coste computacional muy inferior al de un LLM generativo; por otro, el modelo está etiquetado como compatible con `text-embeddings-inference` (TEI) y con endpoints, lo que facilita su despliegue en producción. El identificador del repositorio (`adl-hw2`) apunta a un trabajo académico, por lo que conviene tratarlo como un artefacto experimental antes que como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder sobre transformer encoder (base `BAAI/bge-reranker-large`, familia XLM-RoBERTa) |
| Parametros totales | 559.891.457 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 384 tokens (secuencia máxima del par consulta-documento) |
| Tipos de cuantizacion | No disponible (el repositorio incluye pesos en safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | No disponible (el autor no documenta los idiomas del ajuste fino) |
| Licencia | No disponible (campo vacío en la model card y en los metadatos) |
| Formato de pesos | safetensors (librería `sentence-transformers`; tamaño del repositorio 2,3 GB) |

## Arquitectura y entrenamiento

Se trata de un cross-encoder: un encoder transformer que procesa conjuntamente consulta y documento como una sola secuencia y produce una logits de relevancia con una única etiqueta de salida (regresión). A diferencia de los bi-encoders, no genera embeddings independientes que puedan indexarse, sino que calcula la interacción completa entre ambos textos, lo que incrementa la precisión a costa de requerir una pasada por par en tiempo de inferencia. El modelo parte de `BAAI/bge-reranker-large` (revisión `55611d7bca2a7133960a6d3b71e083071bbfc312`) y se ha ajustado con la librería `sentence-transformers`, según la model card generada automáticamente por `generated_from_trainer`.

El entrenamiento utilizó 38.640 pares y `BinaryCrossEntropyLoss`, una elección coherente con una formulación de clasificación binaria de relevancia sobre una única etiqueta de salida. Los datos concretos de entrenamiento no están documentados: el autor deja sin rellenar los campos de dataset, idioma y licencia de la plantilla. Los dos ejemplos de uso incluidos en la model card son pares del tipo (conversación multi-turno de un asistente de compras, ficha de producto), en inglés, lo que indica que el ajuste se orientó a reordenar productos relevantes para una consulta conversacional. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, RLHF/DPO) ni detalles sobre tokenización o composición del corpus.

## Capacidades

- Puntuación de relevancia de pares (consulta, documento) mediante cross-encoding, con salida escalar única.
- Reordenación de resultados en pipelines de búsqueda semántica de dos etapas (retrieval + rerank).
- Búsqueda semántica en dominios de comercio electrónico: los ejemplos de la model card son conversaciones de compra emparejadas con descripciones de producto.
- Manejo de entradas con estructura conversacional (`user:` / `assistant:`) y con texto largo de documento (fichas de producto, descripciones, categorías, atributos), dentro del límite de 384 tokens.
- Integración con `sentence-transformers` mediante la clase `CrossEncoder`.
- Compatibilidad declarada con `text-embeddings-inference` y con endpoints, lo que habilita servir el modelo como servicio HTTP.
- No dispone de generación de texto, tool calling, capacidades de agente, visión ni audio: es un modelo discriminativo de ranking.

## Casos de uso

- Reordenación en buscador de e-commerce: recuperar entre 50 y 200 candidatos con un bi-encoder y reordenarlos con este cross-encoder para mejorar la precisión en la primera posición; los ejemplos de la model card corresponden exactamente a este escenario (conversación de compra frente a ficha de producto).
- Asistente de compras conversacional: puntuar qué productos del catálogo responden mejor a una consulta multi-turno del usuario, teniendo en cuenta el historial reciente de la conversación.
- Búsqueda por atributos y restricciones: reordenar candidatos cuando la consulta incluye condiciones específicas (material, color, año, formato) que el documento debe satisfacer literalmente.
- Filtrado de falsos positivos en recuperación vectorial: usar la puntuación del cross-encoder como umbral para descartar documentos que el bi-encoder ha recuperado por similitud superficial pero que no son relevantes.
- RAG sobre documentación interna: reordenar los fragmentos recuperados antes de pasarlos a un LLM generador, reduciendo el contexto irrelevante y el coste por consulta.
- Evaluación y ajuste de sistemas de búsqueda: emplear las puntuaciones como señal de referencia para comparar configuraciones de indexación o de modelos de embedding.
- Clasificación de pares texto-texto en tareas auxiliares: duplicados, paráfrasis o coincidencia consulta-respuesta, reutilizando la cabeza de regresión de una etiqueta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (nDCG, MRR, MAP ni comparaciones con el modelo base), y el repositorio no enlaza ningún informe de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,3 GB en fp32, unos 1,2 GB en fp16/bf16 y en torno a 0,6 GB en int8 (estimación a partir de los 559,9 M de parámetros; no hay cifras publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16. Para servicio de alta concurrencia, una L4, A10G, A100 o H100 con `text-embeddings-inference` o vLLM-style batching.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, e incluso en iGPU con suficiente memoria compartida usando llama.cpp u ONNX en cuantización int8.
- Opciones de despliegue: `sentence-transformers` (CrossEncoder) para scripts y evaluación; `text-embeddings-inference` (etiqueta `text-embeddings-inference` en el repositorio); servido vía endpoints de Hugging Face; exportación a ONNX Runtime para latencia baja en CPU.
- Latencia y throughput: no disponibles. Como referencia conceptual, el coste es lineal en el número de pares a puntuar (una pasada por par), por lo que el throughput depende del tamaño de lote y de la longitud real de las secuencias, limitada a 384 tokens.
- Nota operativa: al ser un cross-encoder, no genera un índice reutilizable; para N documentos hay que ejecutar N pasadas, lo que hace imprescindible una etapa previa de recuperación que reduzca los candidatos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huang2244/adl-hw2-reranker` | 559,9 M | 384 tokens | Cross-encoder (ajuste de bge-reranker-large) | No disponible | Hugging Face, 0 descargas, 0 likes |
| `BAAI/bge-reranker-large` (modelo base) | Mismo orden de magnitud (es su modelo base) | No disponible en la información proporcionada | Cross-encoder | No disponible en la información proporcionada | Hugging Face |
| `BAAI/bge-reranker-base` | No disponible en la información proporcionada | No disponible | Cross-encoder | No disponible | Hugging Face |
| Rerankers multilingües tipo `mxbai-rerank` o `jina-reranker` | No disponible en la información proporcionada | No disponible | Cross-encoder | No disponible | Hugging Face |

Los datos de los modelos alternativos no forman parte de la información proporcionada y deben verificarse en sus respectivas model cards antes de tomar una decisión. La comparación relevante aquí es interna: este modelo es un ajuste fino del base, sin métricas publicadas que demuestren mejora sobre él, y con una ventana de 384 tokens que puede ser más restrictiva que la del modelo original.

## Limitaciones y advertencias

- No hay métricas de evaluación publicadas: se desconoce si el ajuste fino mejora, iguala o degrada el rendimiento de `BAAI/bge-reranker-large`.
- Ventana de 384 tokens: los documentos largos (fichas de producto extensas, artículos) se truncan, con pérdida de información relevante al final del texto.
- Licencia no declarada: no se puede asumir uso comercial libre. Es imprescindible contactar con el autor o verificar la licencia del modelo base antes de cualquier despliegue productivo.
- Idiomas no documentados: los ejemplos de la model card están en inglés; no hay evidencia de calidad en castellano ni en otros idiomas, pese a que la familia XLM-RoBERTa del modelo base es multilingüe.
- Dominio estrecho: el ajuste parece centrado en conversaciones de compra y descripciones de producto; el rendimiento en otros dominios (legal, médico, código) es desconocido.
- Procedencia académica: el identificador `adl-hw2` sugiere un ejercicio de curso. No hay garantía de mantenimiento, soporte ni corrección de errores.
- Riesgo de sesgo heredado: cualquier sesgo presente en el corpus de 38.640 pares y en el modelo base se traslada a las puntuaciones de relevancia; no se documenta ninguna auditoría al respecto.
- Sin control de calibración: al usar `BinaryCrossEntropyLoss` con una sola etiqueta, las puntuaciones no están calibradas como probabilidades; los umbrales deben ajustarse empíricamente por dominio.
- Huella de despliegue: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huang2244/adl-hw2-reranker
- Modelo base: https://huggingface.co/BAAI/bge-reranker-large
- Documentación de Sentence Transformers: https://sbert.net
- Documentación de Cross Encoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de Sentence Transformers: https://github.com/UKPLab/sentence-transformers
- Cross encoders en Hugging Face: https://huggingface.co/models?library=sentence-transformers&other=cross-encoder
- Paper de referencia citado en las etiquetas (Sentence-BERT): https://arxiv.org/abs/1908.10084
- Resultados de búsqueda web: no se han encontrado enlaces técnicos relevantes sobre este modelo; las búsquedas devolvieron únicamente contenido no relacionado, por lo que se omiten.
