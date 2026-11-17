# lopozz/splade-bert-base-italian-xxl-uncased

## Resumen

`lopozz/splade-bert-base-italian-xxl-uncased` es un codificador disperso (sparse encoder) de tipo SPLADE asimétrico y "inference-free" para recuperación de información en italiano, publicado por el usuario lopozz. Se construye mediante fine-tuning del modelo `dbmdz/bert-base-italian-xxl-uncased` con la librería sentence-transformers, y proyecta frases y párrafos a un espacio vectorial disperso de 31.102 dimensiones. No es un modelo generativo: su propósito es la extracción de características y la búsqueda semántica/lexical sparse.

La innovación principal es la arquitectura asimétrica *inference-free*: las consultas se codifican con un `SparseStaticEmbedding` congelable (sin pasar por el transformer), mientras que los documentos sí atraviesan el encoder BERT completo seguido de un pooling SPLADE con activación ReLU. Esto reduce drásticamente el coste de codificación de consultas en producción, manteniendo la calidad de recuperación sobre el corpus.

El modelo se entrenó sobre 532.751 tuplas de pregunta-respuesta y emplea una combinación de pérdidas (SpladeLoss, SparseMultipleNegativesRankingLoss y FlopsLoss) que penaliza el número de dimensiones activas para controlar la eficiencia. Está pensado para pipelines de búsqueda en italiano donde se necesite un índice invertido disperso compatible con motores tipo Lucene/Elasticsearch o recuperación vectorial dispersa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SparseEncoder asimétrico (BERT + SpladePooling para documentos; SparseStaticEmbedding para consultas) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | italiano (it) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un `SparseEncoder` con enrutamiento (`Router`) que separa dos sub-módulos. La ruta de consulta (`query`) contiene un único `SparseStaticEmbedding` de dimensión 31.102 con tokenizador BERT, que puede permanecer congelado: la consulta se representa directamente como un vector disperso estático sin ejecutar el transformer. La ruta de documento (`document`) aplica un `Transformer` basado en `BertForMaskedLM` (con salida `token_embeddings`) seguido de `SpladePooling` con estrategia `max`, activación ReLU y dimensión de embedding 31.102. La similitud se calcula por producto escalar (dot product).

El entrenamiento se realizó sobre 532.751 tuplas de QA, con una combinación de tres pérdidas: `SpladeLoss` (que agrupa la pérdida de recuperación con la regularización de dispersión), `SparseMultipleNegativesRankingLoss` (objetivo de ranking con negativos en batch) y `FlopsLoss` (penalización del coste computacional en función de las dimensiones activas). Esta combinación busca un equilibrio entre calidad de recuperación y eficiencia del índice disperso. El modelo se generó con la librería sentence-transformers y hereda el tokenizador y la configuración del BERT italiano base.

## Capacidades

- Extracción de características textuales en italiano mediante representaciones dispersas de 31.102 dimensiones.
- Recuperación de información sparse (sparse retrieval) con similitud por producto escalar.
- Codificación asimétrica: consultas con embedding estático (inference-free) y documentos con el transformer completo.
- Búsqueda semántica y lexical combinada, propia de la formulación SPLADE.
- Control de dispersión: la regularización FlopsLoss permite ajustar el número de dimensiones activas.
- Compatible con índices invertidos y motores de búsqueda que operen con vectores dispersos.
- No soporta tool calling, agentes, generación de texto, visión ni audio: es un modelo exclusivamente de representación/recuperación.

## Casos de uso

- Búsqueda semántica en italiano sobre corpus documentales: el modelo indexa documentos como vectores dispersos de 31.102 dimensiones con ~214 dimensiones activas de media, lo que permite construir un índice invertido eficiente y recuperar con dot product.
- Motor de preguntas frecuentes (FAQ): con 532.751 tuplas de QA en el entrenamiento, encaja de forma natural en sistemas de matching pregunta-pregunta, donde la consulta se codifica de forma estática y barata.
- Recuperación en pipelines RAG en italiano: sirve como primera etapa de retrieval sparse antes de un reranker o de un modelo generativo, aprovechando la ventana de 512 tokens por pasaje.
- Búsqueda de baja latencia en producción: al ser *inference-free* en la ruta de consulta (embedding estático), el coste por query se reduce respecto a un SPLADE simétrico que ejecutaría el transformer en cada consulta.
- Indexación de documentación técnica o legal en italiano: la dispersión del corpus (~0,993 de ratio, ~214 dims activas) mantiene el índice manejable en almacenamiento y memoria.
- Filtrado y deduplicación de contenido: el producto escalar entre representaciones dispersas permite detectar pasajes similares dentro de grandes colecciones en italiano.
- Integración en Elasticsearch/OpenSearch con campos sparse: el formato de salida disperso es compatible con motores que soportan consultas de vectores sparse.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el dataset mmarco (no verificados, `verified: false`):

| Métrica | Valor |
|---|---|
| Dot Accuracy@10 | 0,8327 |
| Dot Precision@10 | 0,0878 |
| Dot Recall@10 | 0,8270 |
| Dot NDCG@10 | 0,7107 |
| Dot MRR@10 | 0,6771 |
| Dot MAP@10 | 0,6709 |
| Dimensiones activas de consulta | 9,72 |
| Ratio de dispersión de consulta | 0,99969 |
| Dimensiones activas de corpus | 213,89 |
| Ratio de dispersión de corpus | 0,99312 |
| FLOPs medios | 1,057 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 0,4 GB en safetensors, lo que sugiere un modelo de tamaño BERT-base (~110 M de parámetros), desplegable en GPUs consumer de 8 GB o menos en fp32/fp16.
- GPU recomendadas: cualquier GPU con al menos 8 GB (RTX 3060, RTX 4060, RTX 4090) para la ruta de documentos; la ruta de consulta, al ser un embedding estático, puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 8 GB o más, dado el tamaño del checkpoint (0,4 GB).
- Opciones de despliegue: sentence-transformers (oficial), exportación a ONNX para servir la ruta de documentos; integración con motores de búsqueda sparse. No se documenta soporte específico de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un encoder sparse de este tipo).
- Latencia y throughput: no disponibles. La ventaja *inference-free* implica que la codificación de consultas evita el forward del transformer, reduciendo la latencia por query respecto a un SPLADE simétrico.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Dimensiones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lopozz/splade-bert-base-italian-xxl-uncased | SPLADE asimétrico inference-free | 512 | 31.102 (sparse) | apache-2.0 | Hugging Face |
| SPLADE estándar (p. ej. naver/splade-cocondenser) | SPLADE simétrico | 512 | 30.522 (sparse) | apache-2.0 / CC | Hugging Face |
| BERT italiano base (dbmdz/bert-base-italian-xxl-uncased) | Encoder denso | 512 | 768 (denso) | MIT | Hugging Face |
| mmarco / multilingual sparse encoders | Sparse / denso multilingüe | 512 | variable | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos frente a estas alternativas en la información proporcionada; los resultados de la tabla anterior corresponden únicamente a este modelo sobre mmarco.

## Limitaciones y advertencias

- Solo soporta italiano; no está entrenado ni evaluado para otros idiomas.
- Ventana máxima de 512 tokens: los documentos más largos deben dividirse en pasajes.
- Los resultados de benchmark están declarados por el autor y marcados como no verificados (`verified: false`); deben tomarse con cautela.
- No es un modelo generativo: no produce texto, no razona ni responde preguntas de forma directa; solo genera representaciones para recuperación.
- El ratio de precisión@10 es bajo (0,0878), coherente con la naturaleza dispersa del índice; la calidad depende del reranking posterior.
- Riesgo de sesgos heredados del corpus de entrenamiento (tuplas QA de origen no documentado) y del BERT italiano base.
- La licencia apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `dbmdz/bert-base-italian-xxl-uncased` (licencia MIT según su propia model card) y del dataset de entrenamiento, no detallado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: es un modelo reciente y sin validación comunitaria amplia.
- No se documentan tipos de cuantización ni formatos GGUF/ONNX oficiales; el despliegue en producción requeriría conversión propia.

## Enlaces

- Hugging Face: https://huggingface.co/lopozz/splade-bert-base-italian-xxl-uncased
- Modelo base: https://huggingface.co/dbmdz/bert-base-italian-xxl-uncased
- Documentación de Sentence Transformers: https://sbert.net
- Documentación de Sparse Encoder: https://www.sbert.net/docs/sparse_encoder/usage/usage.html
- Repositorio Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Sparse Encoders en Hugging Face: https://huggingface.co/models?library=sentence-transformers&other=sparse-encoder
- Paper BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper SPLADE (arXiv:2205.04733): https://arxiv.org/abs/2205.04733
- Paper Sentence-BERT (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
- Paper SPLADE original (arXiv:2004.05665): https://arxiv.org/abs/2004.05665
