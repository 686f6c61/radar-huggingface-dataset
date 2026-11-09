# sachinyerrawar/test

## Resumen

`sachinyerrawar/test` es un modelo de embeddings de frases (sentence embeddings) afinado a partir de `sentence-transformers/all-MiniLM-L6-v2`, publicado en Hugging Face por el usuario sachinyerrawar. No es un modelo generativo: su función es transformar texto en vectores densos de 384 dimensiones para tareas de similitud semántica, recuperación de información y extracción de características. El modelo se ha entrenado con la librería sentence-transformers mediante la función de pérdida `MultipleNegativesRankingLoss` sobre el dataset `FinLang/investopedia-embedding-dataset`, de temática financiera.

El modelo base, all-MiniLM-L6-v2, es un transformer BERT de 6 capas y 22,7 millones de parámetros, conocido por su equilibrio entre calidad y eficiencia en entornos con recursos limitados. Este fine-tuning busca especializar el encoder en vocabulario y relaciones semánticas del dominio financiero (seguros, inversiones, fiscalidad, regulación), manteniendo la arquitectura y el tamaño reducidos del original.

Es relevante para equipos que construyan sistemas RAG o motores de búsqueda semántica sobre documentación financiera y necesiten un encoder ligero, desplegable en CPU, con compatibilidad directa con `text-embeddings-inference` y la API de Hugging Face Endpoints. No obstante, se trata de una publicación con cero descargas y cero likes, licencia e idiomas no declarados, y benchmarks no verificados, por lo que debe evaluarse con cautela antes de usarla en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer BERT (encoder), base all-MiniLM-L6-v2, 6 capas |
| Parámetros totales | 22.713.216 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base all-MiniLM-L6-v2 admite 256 tokens; no confirmado en esta publicación) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimensión de embedding | no disponible en la información proporcionada (el modelo base usa 384) |
| Función de pérdida | MultipleNegativesRankingLoss |
| Tamaño del dataset de entrenamiento | 206.460 muestras |
| Tamaño del repositorio | 0,2 GB |
| Pipeline | sentence-similarity |
| Compatibilidad de despliegue | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo es un encoder transformer tipo BERT de 6 capas y 22,7 millones de parámetros, heredado de `sentence-transformers/all-MiniLM-L6-v2`. La arquitectura produce embeddings densos mediante pooling sobre las representaciones del encoder, optimizados para similitud coseno. El fine-tuning se realizó con la librería sentence-transformers y la pérdida `MultipleNegativesRankingLoss`, una función de contrastivo que trata las demás muestras del lote como negativos, adecuada para pares pregunta-respuesta o consulta-documento.

El dataset de entrenamiento es `FinLang/investopedia-embedding-dataset`, con 206.460 muestras y orientación financiera, como evidencian los ejemplos de la model card (seguros de vida, holding bancario, autorización de trading, tipos de interés). No se especifican el número de tokens, la composición detallada del dataset, ni si hubo etapas de RLHF o DPO; al ser un modelo de embeddings, estos mecanismos no resultan habituales. Tampoco se documentan innovaciones técnicas adicionales como atención lineal o decodificación especulativa.

## Capacidades

- Generación de embeddings de frases y pasajes para similitud semántica.
- Recuperación de información (information retrieval) mediante búsqueda por similitud coseno.
- Extracción de características (feature-extraction) para pipelines de clasificación, clustering o reranking.
- Detección de duplicados y near-duplicate detection en corpus textuales.
- Búsqueda semántica sobre documentación financiera, gracias al fine-tuning con el dataset de Investopedia.
- Compatible con `text-embeddings-inference` y con endpoints de Hugging Face.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un encoder.
- Capacidades multilingües: no declaradas; los idiomas soportados figuran como no disponibles.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Búsqueda semántica en bases de conocimiento financiero: indexar artículos de Investopedia o documentación similar y recuperar pasajes relevantes para una consulta en lenguaje natural, usando similitud coseno sobre los embeddings de 384 dimensiones del modelo base.
- RAG (retrieval-augmented generation) sobre normativa y productos financieros: usar el modelo como retriever ligero que alimente a un LLM generativo con los fragmentos más relevantes; su tamaño de 22,7 M de parámetros permite ejecutarlo en CPU junto al generador.
- Deduplicación de catálogos de preguntas frecuentes: calcular embeddings de las FAQ de un banco o aseguradora y agrupar por similitud para detectar entradas redundantes antes de publicarlas.
- Clasificación y clustering de tickets de soporte: generar embeddings de consultas de clientes y agruparlas por temática (seguros, inversiones, fiscalidad) sin necesidad de un modelo generativo.
- Reranking en pipelines de búsqueda híbrida: combinar búsqueda léxica (BM25) con similitud densa para reordenar resultados en un portal de educación financiera.
- Enrutamiento de consultas en un chatbot financiero: comparar la consulta del usuario con un conjunto de intenciones predefinidas y derivar al flujo adecuado, con latencia baja al ejecutarse en CPU.
- Evaluación de similitud entre pares pregunta-respuesta en un sistema de control de calidad de contenidos editoriales financieros.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card, sobre el split `val` (dataset no identificado con precisión) para la tarea de information retrieval. Ninguno está verificado (`verified: false`).

| Métrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,7973 |
| Cosine Accuracy@3 | 0,8783 |
| Cosine Accuracy@5 | 0,9038 |
| Cosine Accuracy@10 | 0,9327 |
| Cosine Precision@1 | 0,7973 |
| Cosine Precision@3 | 0,2928 |
| Cosine Precision@5 | 0,1808 |
| Cosine Precision@10 | 0,0933 |
| Cosine Recall@1 | 0,7973 |
| Cosine Recall@3 | 0,8783 |
| Cosine Recall@5 | 0,9038 |
| Cosine Recall@10 | 0,9327 |

El model-index declara además métricas `cosine_ndcg@10`, `cosine_mrr@10` y `cosine_map@100`, pero sus valores no están incluidos en la información proporcionada. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (22,7 M de parámetros, ~91 MB de pesos); en FP16, ~45 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo. Funciona también en CPU sin GPU.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en Raspberry Pi para volúmenes moderados.
- Opciones de despliegue: sentence-transformers (Python), `text-embeddings-inference`, Hugging Face Endpoints (tag `endpoints_compatible`), y exportación a ONNX no documentada pero viable por herencia del modelo base.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por frase en CPU y throughput de miles de frases por segundo en GPU, pero estos valores no están confirmados por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sachinyerrawar/test | 22,7 M | no disponible | no disponible | Hugging Face, 0 descargas | Fine-tuning financiero de all-MiniLM-L6-v2 |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens (modelo base) | Apache-2.0 (modelo base) | Hugging Face, ampliamente usado | Modelo base; licencia de esta publicación no declarada |
| BAAI/bge-small-en-v1.5 | ~33 M | 512 tokens | MIT | Hugging Face | Encoder pequeño orientado a retrieval; datos de benchmark no disponibles en esta ficha |
| intfloat/e5-small-v2 | ~33 M | 512 tokens | MIT | Hugging Face | Alternativa pequeña para retrieval; datos de benchmark no disponibles en esta ficha |

La comparación se limita a parámetros, contexto declarado del modelo base y licencia; no se dispone de resultados de benchmarks comparables publicados para esta publicación concreta.

## Limitaciones y advertencias

- Modelo exclusivamente de embeddings: no genera texto, no razona y no soporta tool calling; no debe evaluarse como un LLM.
- Licencia no declarada: no se puede confirmar el uso comercial; es imprescindible contactar con el autor o verificar la licencia del modelo base (Apache-2.0) antes de desplegarlo en producción.
- Idiomas no declarados: el dataset de entrenamiento (Investopedia) es en inglés, por lo que el rendimiento en castellano u otros idiomas es incierto.
- Benchmarks no verificados (`verified: false`) y sobre un split `val` no identificado; los valores deben tratarse como indicativos, no como garantía.
- Publicación con cero descargas y cero likes: sin validación de la comunidad, sin issues ni discusión; riesgo de artefacto de prueba o modelo abandonado.
- Riesgo de sesgo de dominio: al estar afinado sobre contenido financiero de Investopedia, puede degradar su rendimiento en dominios generalistas.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos en similitud: embeddings pueden considerar similares textos con matices financieros opuestos (por ejemplo, condiciones de pólizas).
- Longitud de contexto no confirmada: el modelo base all-MiniLM-L6-v2 trunca a 256 tokens, lo que limita la recuperación de pasajes largos.
- Sin información sobre cuantizaciones ni formatos GGUF/ONNX: el despliegue en llama.cpp u Ollama no está soportado de forma documentada.

## Enlaces

- Hugging Face: https://huggingface.co/sachinyerrawar/test
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/FinLang/investopedia-embedding-dataset
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de SimCSE / representaciones contrastivas (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
- Librería sentence-transformers: https://www.sbert.net/
- Documentación de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
