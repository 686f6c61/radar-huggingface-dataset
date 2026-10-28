# KIZZPER/pandas-so-function-retriever

## Resumen

`KIZZPER/pandas-so-function-retriever` es un bi-encoder de recuperación (retrieval) entrenado para una tarea muy concreta: dado el texto de una pregunta de StackOverflow sobre pandas, devolver la función o página de la API Reference de pandas a la que probablemente hace referencia la respuesta. Parte de `BAAI/bge-small-en-v1.5`, un encoder tipo BERT de 33,36 millones de parámetros, y se ha afinado con pérdida contrastiva sobre unas 45.000 parejas «pregunta → función de pandas citada en la respuesta» extraídas de StackOverflow.

El modelo no genera texto: produce embeddings normalizados (pooling por token CLS, similitud por producto escalar) que se comparan contra un corpus de 2.019 páginas de la documentación oficial de pandas 3.0.6 (`api_corpus.parquet`, con campos `text` y `url`). Es, por tanto, una pieza de infraestructura para asistentes de código, sistemas RAG sobre documentación técnica o bots de soporte, no un modelo conversacional.

Su relevancia es acotada pero real: los benchmarks publicados en la model card (6.742 preguntas de test) muestran Recall@1 de 0,245 y MRR de 0,373 en solitario, que suben a 0,280 y 0,418 al combinarlo en ensamblado con `KIZZPER/pandas-so-function-classifier`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card está redactada en ruso, lo que limita la validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (bi-encoder), fine-tune de `BAAI/bge-small-en-v1.5`; pooling por token CLS |
| Parámetros totales | 33.360.000 (33,36 M) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (heredado del modelo base; no se especifica explícitamente en la model card) |
| Tipos de cuantización | No disponible en el repositorio (solo safetensors; al ser un encoder de 33 M es convertible a ONNX, INT8 o GGUF con herramientas externas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |
| Dimensión del embedding | No disponible en la model card (el modelo base bge-small-en-v1.5 usa 384 dimensiones) |
| Corpus de recuperación | 2.019 páginas de la API Reference de pandas 3.0.6 (`api_corpus.parquet`) |
| Tamaño del repositorio | 0,1 GB |
| Pipeline | sentence-similarity |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `BAAI/bge-small-en-v1.5`: un encoder Transformer de tipo BERT con 12 capas, dimensión oculta 384 y 12 cabezas de atención, adaptado para similitud semántica. Sobre esa base, el autor aplica un fine-tune con pérdida contrastiva (pregunta de StackOverflow como ancla, función de pandas referenciada por la respuesta como positivo) y utiliza pooling sobre el token CLS con embeddings normalizados; la cercanía entre consulta y documento se calcula mediante producto escalar, lo que permite usar el modelo con índices vectoriales estándar (FAISS, hnswlib, pgvector, etc.).

El conjunto de entrenamiento son aproximadamente 45.000 pares extraídos de preguntas y respuestas de StackOverflow, publicadas bajo CC BY-SA 4.0 y obtenidas a través de Stack Exchange Data Explorer; el dataset aparece referenciado como `KIZZPER/pandas-so-questions`. No se documentan en la model card el número exacto de tokens vistos, la composición detallada del dataset, ni si hubo etapas de RLHF o DPO (no aplicables habitualmente a un bi-encoder de retrieval). Tampoco se detallan técnicas de eficiencia como decodificación especulativa o atención lineal: no son relevantes en un modelo de encoding.

La innovación destacable no está en la arquitectura, sino en el pipeline: el autor publica junto al modelo el corpus de documentación (`api_corpus.parquet`) y una segunda pieza complementaria (`KIZZPER/pandas-so-function-classifier`) cuyo score se mezcla con el del bi-encoder en proporción 0,4 / 0,6, mejorando de forma consistente todas las métricas de recuperación.

## Capacidades

- Recuperación semántica de funciones y páginas de la API de pandas a partir de lenguaje natural en inglés.
- Ranking de documentos mediante similitud coseno/producto escalar sobre embeddings normalizados.
- Integración como retriever en pipelines RAG sobre documentación técnica (pandas 3.0.6).
- Funciona como encoder de frases genérico (pipeline `sentence-similarity`), aunque su rendimiento fuera del dominio pandas no está evaluado.
- Soporte de búsqueda en dos etapas combinada con `KIZZPER/pandas-so-function-classifier` para mejorar Recall@K y MRR.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso: es exclusivamente un encoder de recuperación.
- Capacidad multilingüe limitada al inglés; no se ha entrenado ni evaluado en castellano.

## Casos de uso

- Asistente de documentación de pandas: indexar `api_corpus.parquet` en un índice vectorial y, ante una duda del usuario, devolver las 5-10 páginas de la API Reference más probables con su `url` verificada, que el generador puede citar como fuente.
- RAG sobre documentación técnica en un chatbot de soporte: usar el modelo como retriever de primera etapa y un LLM como generador, reduciendo alucinaciones al anclar la respuesta a páginas oficiales de pandas 3.0.6.
- Enrutado de tickets o issues de GitHub: clasificar automáticamente un issue hacia la función de pandas afectada, facilitando el triaje y la asignación a maintainers del área correspondiente.
- Autocompletado en IDE o notebook: sugerir la función de pandas adecuada mientras el desarrollador describe en lenguaje natural lo que quiere hacer, con latencia baja gracias a los 33 M de parámetros.
- Construcción de un buscador interno sobre StackOverflow: emparejar preguntas históricas con la función de la API que las resuelve, para enlazar respuestas antiguas con la documentación vigente.
- Detección de documentación huérfana: analizar la distribución de recuperaciones para identificar funciones de pandas que apenas se recuperan y revisar si su descripción en la API Reference es insuficiente.
- Evaluación de sistemas de retrieval: servir como baseline de dominio específico frente a encoders genéricos (por ejemplo, el propio bge-small-en-v1.5 sin fine-tune) en un conjunto de test de 6.742 preguntas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test de 6.742 preguntas:

| Configuración | Recall@1 | Recall@5 | Recall@10 | MRR |
|---|---|---|---|---|
| Solo este modelo | 0,245 | 0,510 | 0,633 | 0,373 |
| Mezcla con `KIZZPER/pandas-so-function-classifier` (0,4 / 0,6) | 0,280 | 0,578 | 0,698 | 0,418 |

No se han publicado resultados comparativos frente a otros retrievers (incluido el modelo base sin fine-tune) ni métricas de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un encoder de recuperación.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en todos los casos. En FP32, los 33,36 M de parámetros ocupan aproximadamente 133 MB; en FP16, unos 67 MB; en INT8, unos 33 MB.
- GPU recomendadas: cualquier GPU, incluso integrada. Una RTX 4090 o A100 están completamente sobredimensionadas; una T4, L4 o GTX 1650 ya saturan el encoder en lotes grandes.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4060, etc.) y también en CPU: es viable ejecutar la codificación del corpus de 2.019 documentos en CPU en segundos o pocos minutos.
- Opciones de despliegue: `sentence-transformers` (vía `SentenceTransformer`), `transformers` + `torch`, `Optimum`/ONNX Runtime para CPU, `TEI` (Text Embeddings Inference) de Hugging Face para servir embeddings, y `vLLM` no aplica (no es un modelo generativo). Compatible con FAISS, hnswlib, Qdrant, Milvus o pgvector como almacén vectorial.
- Latencia y throughput: no publicados en la model card. Por el tamaño, se espera codificación de consultas en el orden de milisegundos en GPU y de decenas de milisegundos en CPU, pero son estimaciones, no datos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en este dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `KIZZPER/pandas-so-function-retriever` | 33,36 M | 512 tokens | R@1 0,245 / MRR 0,373 (test propio, 6.742 preguntas) | CC BY-SA 4.0 | HuggingFace, 0 descargas |
| `KIZZPER/pandas-so-function-classifier` | No disponible | No disponible | Mejora el conjunto a R@1 0,280 / MRR 0,418 en mezcla 0,4/0,6 | No disponible en la información | HuggingFace |
| `BAAI/bge-small-en-v1.5` (modelo base) | 33 M | 512 tokens | No evaluado en este dominio por el autor | MIT (según el modelo base; no confirmado en la información proporcionada) | HuggingFace, ampliamente usado |
| `sentence-transformers/all-MiniLM-L6-v2` | 22,7 M | 256 tokens | No evaluado en este dominio | Apache 2.0 | HuggingFace, muy extendido |

La comparación de rendimiento solo es válida dentro del test del propio autor; no hay una evaluación cruzada de los tres modelos sobre el mismo conjunto, por lo que las cifras no son directamente equiparables entre filas.

## Limitaciones y advertencias

- Recall@1 de 0,245: en más de tres de cada cuatro consultas la función correcta no queda en primera posición; el uso en producción exige recuperar top-5 o top-10 y, preferiblemente, el ensamblado con el clasificador.
- Modelo exclusivamente en inglés: las preguntas en castellano no están soportadas ni evaluadas.
- Dominio muy restringido: solo pandas 3.0.6 y solo el estilo de preguntas de StackOverflow; el rendimiento se degrada previsiblemente con otros lenguajes, librerías o formulaciones muy distintas.
- Sesgos heredados de StackOverflow: sobrerrepresentación de ciertas API populares y de determinadas formas de preguntar; funciones poco discutidas en la comunidad quedan infrarrepresentadas.
- Riesgo de alucinación no aplica directamente (no genera texto), pero sí de recuperación errónea: un RAG que confíe ciegamente en el top-1 puede citar documentación irrelevante.
- Licencia CC BY-SA 4.0: permite uso comercial, pero impone atribución y *share-alike*; los modelos derivados o las distribuciones modificadas deben publicarse bajo la misma licencia, lo que puede condicionar productos propietarios que redistribuyan los pesos.
- Los datos de entrenamiento provienen de contenido de StackOverflow bajo CC BY-SA 4.0, con las obligaciones de atribución que ello conlleva.
- Validación comunitaria nula: 0 descargas y 0 likes, repositorio creado y actualizado el 2026-10-27, sin issues ni discusión pública documentada.
- La model card está en ruso y no detalla hiperparámetros, composición exacta del dataset ni el proceso de selección de negativos, lo que dificulta la reproducibilidad.
- No se especifican dimensiones del embedding ni instrucciones de prefijo para consultas; el modelo base bge-small-en-v1.5 recomienda prefijos para consultas, y se desconoce si el fine-tune los mantiene.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KIZZPER/pandas-so-function-retriever
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Dataset de entrenamiento: https://huggingface.co/datasets/KIZZPER/pandas-so-questions
- Modelo complementario para el ensamblado: https://huggingface.co/KIZZPER/pandas-so-function-classifier
- Stack Exchange Data Explorer (origen de los datos): https://data.stackexchange.com/stackoverflow
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Repositorio del proyecto (código, experimentos e informes): mencionado en el README de la model card, pero sin URL disponible en la información proporcionada.

Nota: la búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo ni sobre el proyecto; los resultados obtenidos eran contenido no relacionado y se han descartado.
