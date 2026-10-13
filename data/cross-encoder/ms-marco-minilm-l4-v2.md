# cross-encoder/ms-marco-MiniLM-L4-v2

## Resumen

El cross-encoder/ms-marco-MiniLM-L4-v2 es un modelo de reordenación (reranking) de pasajes entrenado sobre la tarea MS Marco Passage Ranking. Lo desarrolla el equipo de SentenceTransformers (cross-encoder) y pertenece a la familia de cross-encoders MiniLM, una serie de modelos diseñados para puntuar la relevancia de un par consulta-documento. Frente a los bi-encoders, que codifican consulta y pasaje por separado, este modelo procesa ambos textos de forma conjunta, lo que le permite capturar interacciones finas entre términos y mejorar sustancialmente la precisión del ranking a costa de un mayor coste computacional por par.

El modelo cuenta con 19.165.185 parámetros (aproximadamente 19M) y se deriva del cross-encoder/ms-marco-MiniLM-L12-v2, del que es una variante más ligera (la nomenclatura L4 indica 4 capas de transformer). Está pensado para la segunda fase de pipelines de recuperación de información: dado un conjunto de candidatos obtenidos por una búsqueda léxica o vectorial (por ejemplo con ElasticSearch), el modelo vuelve a puntuar cada par y reordena los resultados por relevancia decreciente. Es relevante porque ofrece un equilibrio muy bueno entre calidad (NDCG@10 de 73.04 en TREC DL 2019) y velocidad (unos 2500 documentos por segundo en una V100), lo que lo hace apto para producción.

Su licencia Apache 2.0 y su compatibilidad con múltiples formatos y runtimes (PyTorch, safetensors, ONNX, JAX, OpenVINO, Text Embeddings Inference) facilitan su integración en infraestructuras existentes. Está entrenado exclusivamente en inglés y su uso principal es la clasificación de relevancia, no la generación de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en MiniLM (transformer BERT destilado), 4 capas, con cabeza de clasificación sobre el token [CLS] |
| Parámetros totales | 19.165.185 (aprox. 19M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de la familia BERT/MiniLM; no especificado explícitamente en la model card) |
| Tipos de cuantización | FP32, FP16, INT8 (mediante ONNX y OpenVINO); se distribuye también en formatos JAX y safetensors |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch (bin), ONNX, OpenVINO, JAX |

## Arquitectura y entrenamiento

Se trata de un cross-encoder, es decir, un transformer que recibe como entrada la concatenación de la consulta y el pasaje y produce una única puntuación de relevancia. La arquitectura subyacente es MiniLM, una versión destilada de BERT, y el sufijo L4 indica que esta variante emplea 4 capas de transformer (frente a las 6 o 12 de sus hermanos mayores). El tamaño de representación interna es coherente con la familia MiniLM, dando lugar a un total de unos 19M de parámetros, lo que lo convierte en uno de los cross-encoders más pequeños de la serie v2.

El entrenamiento se realizó sobre el dataset sentence-transformers/msmarco, derivado de la tarea MS Marco Passage Ranking, en la que el objetivo es ordenar pasajes según su relevancia respecto a una consulta. El modelo se deriva del cross-encoder/ms-marco-MiniLM-L12-v2 mediante destilación, un proceso habitual en esta familia para obtener versiones más rápidas con una pérdida mínima de calidad. La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; al ser un modelo de ranking (clasificación), no se emplean técnicas de alineación orientadas a la generación.

## Capacidades

- Puntuación de relevancia de pares consulta-documento (text-ranking / text-classification).
- Reordenación (reranking) de resultados en pipelines de recuperación de información, típicamente como segunda fase tras un retrieval inicial.
- Clasificación binaria implícita de relevancia a partir de la puntuación de salida.
- Procesamiento por lotes de múltiples pares de forma eficiente (hasta miles de documentos por segundo en GPU).
- No soporta tool calling / function calling.
- No soporta agentes ni razonamiento multi-paso (no es un modelo generativo).
- Capacidades multilingües: no, únicamente inglés.
- No dispone de modo de razonamiento (thinking), visión ni audio.
- Integración directa con SentenceTransformers (`CrossEncoder`), Transformers (`AutoModelForSequenceClassification`) y Text Embeddings Inference.

## Casos de uso

- Reordenación en pipelines RAG: se recuperan, por ejemplo, 100 candidatos con un bi-encoder o búsqueda híbrida y este cross-encoder reordena los más relevantes antes de pasarlos a un LLM generador, mejorando la precisión del contexto inyectado con un coste muy bajo gracias a sus 19M de parámetros.
- Búsqueda empresarial sobre ElasticSearch: dado que solo puntúa pares, se usa como capa de reranking de los resultados devueltos por el motor de búsqueda tras una consulta en lenguaje natural.
- Sistemas de preguntas y respuestas sobre documentación: puntuar pasajes de manuales o wikis internas para seleccionar el fragmento que responde a una pregunta concreta.
- Filtrado de resultados irrelevantes: descartar automáticamente documentos por debajo de un umbral de puntuación antes de mostrarlos o procesarlos.
- Deduplicación y agrupación temática: comparar pares de documentos para determinar si abordan el mismo tema y priorizar la fuente más relevante.
- Asistentes de soporte técnico con base de conocimiento: elegir el artículo de la base de conocimiento más adecuado a la incidencia descrita por el usuario.
- Evaluación de calidad en sistemas de búsqueda: medir NDCG o MRR de un recuperador existente reordenando con este modelo como referencia.

## Benchmarks y rendimiento

Resultados publicados en la model card (runtime medido en una GPU V100):

| Modelo | NDCG@10 (TREC DL 19) | MRR@10 (MS Marco Dev) | Documentos / s |
|---|---|---|---|
| cross-encoder/ms-marco-MiniLM-L4-v2 | 73.04 | 37.70 | 2500 |
| cross-encoder/ms-marco-MiniLM-L2-v2 | 71.01 | 34.85 | 4100 |
| cross-encoder/ms-marco-MiniLM-L6-v2 | 74.30 | 39.01 | 1800 |
| cross-encoder/ms-marco-MiniLM-L12-v2 | 74.31 | 39.02 | 960 |
| cross-encoder/ms-marco-TinyBERT-L2-v2 | 69.84 | 32.56 | 9000 |

No se han publicado en la información disponible resultados de benchmarks de tipo MMLU, HumanEval o GSM8K, ya que el modelo no está orientado a esas tareas (no es generativo).

## Requisitos de hardware

- VRAM estimada para inferencia: FP32 aproximadamente 80 MB, FP16 aproximadamente 40 MB, INT8 aproximadamente 20 MB, más las activaciones correspondientes al tamaño de lote y a la longitud de secuencia.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo se diseñó pensando en despliegues de alto rendimiento (V100, A100, H100) junto con una capa de reranking a gran escala.
- Cabe en cualquier GPU de consumo: incluso en GPU integradas o en CPU, dado su reducido tamaño (~19M de parámetros).
- Opciones de despliegue: sentence-transformers, Transformers, Text Embeddings Inference (TEI), ONNX Runtime, OpenVINO, JAX, así como APIs propias con FastAPI.
- Latencia y throughput: en una V100 procesa aproximadamente 2500 documentos por segundo, lo que lo sitúa en un punto intermedio de la familia (por encima del L6 y del L12, por debajo del L2 y del TinyBERT-L2).

## Comparativa con modelos similares

| Modelo | Parámetros | NDCG@10 (TREC DL 19) | MRR@10 (MS Marco Dev) | Docs / s | Licencia |
|---|---|---|---|---|---|
| ms-marco-MiniLM-L4-v2 | 19M | 73.04 | 37.70 | 2500 | Apache 2.0 |
| ms-marco-MiniLM-L2-v2 | menor que L4 | 71.01 | 34.85 | 4100 | Apache 2.0 |
| ms-marco-MiniLM-L6-v2 | mayor que L4 | 74.30 | 39.01 | 1800 | Apache 2.0 |
| ms-marco-MiniLM-L12-v2 | mayor que L4 | 74.31 | 39.02 | 960 | Apache 2.0 |
| ms-marco-TinyBERT-L2-v2 | el más pequeño de la familia | 69.84 | 32.56 | 9000 | Apache 2.0 |

El L4-v2 se posiciona como un punto intermedio entre el L2 (más rápido pero menos preciso) y el L6/L12 (más precisos pero más lentos), ofreciendo casi la calidad del L6 con un throughput notablemente superior. Los valores exactos de parámetros de los modelos comparados no se detallan en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la model card; al entrenarse sobre MS Marco puede heredar los sesgos presentes en ese corpus de recuperación web en inglés.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo solo produce puntuaciones de relevancia; sin embargo, puede asignar puntuaciones altas a pasajes superficialmente similares pero factualmente incorrectos.
- Limitaciones de contexto: la ventana estándar de la familia BERT/MiniLM es de 512 tokens, por lo que los pasajes largos deben truncarse o dividirse.
- Limitaciones de idioma: entrenado únicamente en inglés; su rendimiento en otros idiomas no está garantizado y probablemente sea degradado.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial sin restricciones significativas; requiere mantener el aviso de licencia y la atribución correspondiente.
- Caveats para producción: el modelo está pensado como reranker de segunda fase y no como recuperador inicial; puntúa pares de uno en uno (o en lote) y su coste crece linealmente con el número de candidatos, por lo que conviene limitar el número de pasajes a reordenar.
- No genera texto, por lo que no puede emplearse directamente como chatbot ni como modelo instruct.

## Enlaces

- HuggingFace: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L4-v2
- Documentación de SentenceTransformers: https://www.sbert.net/
- Guía Retrieve & Re-rank de SBERT: https://www.sbert.net/examples/applications/retrieve_rerank/README.html
- Código de entrenamiento (SBERT): https://github.com/UKPLab/sentence-transformers/tree/master/examples/cross_encoder/training/ms_marco
- Tarea MS Marco Passage Ranking: https://github.com/microsoft/MSMARCO-Passage-Ranking
- Resultados TREC Deep Learning 2019: https://microsoft.github.io/TREC-2019-Deep-Learning/
