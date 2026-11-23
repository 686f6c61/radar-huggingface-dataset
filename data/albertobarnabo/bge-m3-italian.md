# albertobarnabo/bge-m3-italian

## Resumen

bge-m3-italian es un modelo de embeddings para recuperación de información (retrieval) en italiano, desarrollado por el usuario albertobarnabo y publicado en Hugging Face. Se trata de un ajuste fino (fine-tune) del modelo multilingüe BAAI/bge-m3, del que hereda su arquitectura XLM-RoBERTa con 567.754.752 parámetros y una ventana de contexto de 8192 tokens. El objetivo es mejorar el rendimiento de búsqueda semántica específicamente sobre corpus en lengua italiana, manteniendo total compatibilidad con el modelo base: mismas 1024 dimensiones de embedding, mismo contexto y las tres cabezas de representación (dense, sparse y ColBERT) entrenadas y distribuidas.

El modelo resuelve un problema concreto: los embeddings multilingües genéricos rinden por debajo de lo deseable en italiano, especialmente en documentos largos y en recuperación léxica. El autor reporta mejoras medibles frente a BAAI/bge-m3 en nDCG@10 sobre conjuntos de evaluación italianos, con incrementos de +0.027 en pasajes cortos con representación dense y +0.055 en documentos largos en modo híbrido, según una comparación con bootstrap pareado de 10.000 muestras.

Es relevante ahora porque se posiciona como un reemplazo directo (drop-in replacement) del modelo base sin necesidad de modificar código, y porque está registrado en MTEB con resultados reproducibles de forma independiente. Su licencia MIT y su disponibilidad en formatos safetensors y ONNX (incluida una versión int8) facilitan su integración en pipelines de búsqueda y RAG en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder) con cabezas dense, sparse y ColBERT |
| Parametros totales | 567.754.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | fp32 (PyTorch y ONNX), int8 dinámica (ONNX `model_qint8_avx512_vnni.onnx`, compatible con ARM) |
| Idiomas soportados | Italiano (it); el modelo base es multilingüe pero el fine-tune está orientado a italiano |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX; cabezas sparse y ColBERT en `sparse_linear.pt` / `colbert_linear.pt` |

## Arquitectura y entrenamiento

El modelo parte de BAAI/bge-m3, un encoder XLM-RoBERTa que produce representaciones en tres modalidades simultáneas: un vector dense de 1024 dimensiones, una representación sparse de tipo léxico y una representación multi-vector ColBERT. El fine-tune conserva las tres cabezas y las entrena de forma conjunta mediante el método *unified* de FlagEmbedding con auto-destilación (self-distillation), de modo que las tres salidas se optimizan de manera coordinada en lugar de por separado.

Los datos de entrenamiento consisten en 351.796 grupos de consulta en italiano, cada uno con un pasivo positivo y ocho negativos duros, construidos a partir de mMARCO-it y enlazados por identificador de MS MARCO con márgenes de un cross-encoder profesor en inglés. Aproximadamente el 9,5 % de los pasajes se descartaron por daños de codificación (mojibake) en la traducción de origen. El entrenamiento base fue de una época, 5.496 pasos, learning rate 1e-5, pasajes de 512 tokens, una GPU de 48 GB y unas 6 horas. Posteriormente se realizó una segunda pasada corta (30.000 grupos, documentos largos sintéticos de 2048 tokens mezclados con cortos, learning rate 5e-6) para recuperar la capacidad sobre documentos largos que el entrenamiento a 512 tokens había degradado.

## Capacidades

- Generación de embeddings dense de 1024 dimensiones para similitud semántica y búsqueda vectorial.
- Representación sparse (léxica) apta para búsqueda híbrida y coincidencia de términos.
- Representación multi-vector ColBERT para reranking tardío y recuperación de alta precisión.
- Recuperación sobre documentos largos de hasta 8192 tokens.
- Búsqueda híbrida combinando dense y sparse con una ponderación recomendada de `score = dense_similarity + 0.3 * lexical_matching_score`.
- Compatibilidad con sentence-transformers, FlagEmbedding, Text Embeddings Inference, fastembed y el backend ONNX de sentence-transformers.
- Extracción de características (pipeline `feature-extraction`) y similitud de frases (pipeline `sentence-similarity`).
- No soporta tool calling, agentes ni generación de texto: es un modelo de embeddings, no un modelo generativo.

## Casos de uso

- Búsqueda semántica en corpus italianos: el modelo indexa documentos y consultas en el mismo espacio de 1024 dimensiones, permitiendo recuperar pasajes relevantes con nDCG@10 de 0.777 en pasajes cortos, superior al 0.751 del modelo base.
- Sistemas RAG sobre documentación administrativa italiana: con 8192 tokens de contexto puede embeber fragmentos largos de normativa, contratos o manuales sin truncar, y combinarse con un reranker como BAAI/bge-reranker-v2-m3 para elevar el nDCG@10 de 0.796 a 0.821.
- Búsqueda híbrida en motores de recuperación: al exponer cabezas dense y sparse, encaja en pipelines que combinan similitud vectorial y coincidencia léxica, donde reporta +0.031 en pasajes cortos y +0.055 en documentos largos frente al modelo base.
- Despliegue en CPU con ONNX int8: la versión cuantizada ocupa 0,57 GB y mantiene una similitud coseno de 0.994 respecto a los embeddings PyTorch, lo que permite servir búsqueda en infraestructura sin GPU.
- Indexación en bases de datos vectoriales como Qdrant mediante fastembed: la integración documentada permite añadir el modelo como modelo personalizado con pooling CLS, normalización y dimensión 1024.
- Recuperación jurídica en italiano: el modelo obtiene 0.617 en JuriFindITRetrieval, frente a 0.594 de multilingual-e5-large, lo que lo hace adecuado para búsqueda sobre jurisprudencia y textos legales.
- Atención al cliente y FAQ: con preguntas multi-turno y respuestas indexadas, el modelo permite recuperar la respuesta correcta en primera posición para el 66 % de las consultas, y reduce del 11,4 % al 8,6 % la proporción de preguntas sin respuesta en el top 10.

## Benchmarks y rendimiento

Recuperación en italiano, nDCG@10, comparación con bootstrap pareado de 10.000 muestras:

| Tarea | BAAI/bge-m3 | bge-m3-italian v1.1 | Diferencia |
|---|---|---|---|
| Pasajes cortos, dense | 0.751 | 0.777 | +0.027 · IC [.021, .032] |
| Pasajes cortos, híbrido | 0.752 | 0.783 | +0.031 · IC [.026, .037] |
| Documentos largos, sparse | 0.740 | 0.781 | +0.041 · IC [.005, .080] |
| Documentos largos, híbrido | 0.693 | 0.748 | +0.055 · IC [.025, .087] |
| Documentos largos, dense | 0.627 | 0.609 | −0.019 · no significativo |
| Pasajes cortos, sparse | 0.474 | 0.450 | −0.023 · ver limitaciones |

Pasajes cortos: mMARCO-it dev, 6.304 consultas sobre 206.000 pasajes. Documentos largos: MLDR-it test, 200 consultas sobre 10.000 documentos a 8192 tokens.

Pipeline con reranker (2.000 consultas):

| Pipeline | nDCG@10 |
|---|---|
| bge-m3-italian solo | 0.796 |
| bge-m3-italian + BAAI/bge-reranker-v2-m3 | 0.821 |

Resultados MTEB en tareas italianas (puntuación principal):

| Tarea | BAAI/bge-m3 | bge-m3-italian | multilingual-e5-large |
|---|---|---|---|
| XPQARetrieval | 0.530 | 0.762 | 0.473 |
| STS22.v2 | 0.700 | 0.799 | 0.643 |
| SIB200ClusteringS2S | 0.256 | 0.342 | 0.396 |
| WebFAQRetrieval | 0.765 | 0.778 | 0.807 |
| JuriFindITRetrieval | no disponible | 0.617 | 0.594 |
| BelebeleRetrieval | no disponible | 0.932 | 0.951 |

Verificación de formatos en STS22 (italiano, Spearman): PyTorch 0.7995, ONNX fp32 0.7995 con coseno 1.0000 respecto a los embeddings originales, int8 0.8019 en hardware AVX-512 VNNI.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,2 GB para los pesos (567 millones de parámetros), más memoria para activaciones según la longitud de secuencia; con 8192 tokens el consumo de activaciones crece de forma notable.
- VRAM estimada en fp32: aproximadamente 2,3 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para secuencias cortas; para lotes grandes o contexto de 8192 tokens se recomienda A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4070, RTX 4090 y similares, especialmente con fp16 y lotes moderados.
- Despliegue en CPU: viable con el archivo ONNX int8 (`model_qint8_avx512_vnni.onnx`), de 0,57 GB, compatible con Text Embeddings Inference, fastembed y el backend ONNX de sentence-transformers.
- Opciones de despliegue: sentence-transformers, FlagEmbedding, Text Embeddings Inference (endpoints compatibles), fastembed, ONNX Runtime.
- Latencia y throughput: no disponibles en la información proporcionada. El autor indica que el entrenamiento se realizó en una GPU de 48 GB durante unas 6 horas, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | nDCG@10 pasajes cortos (dense) | STS22.v2 |
|---|---|---|---|---|---|---|
| bge-m3-italian | 567,8 M | 8192 | MIT | Italiano | 0.777 | 0.799 |
| BAAI/bge-m3 | 567,8 M | 8192 | MIT | Multilingüe | 0.751 | 0.700 |
| multilingual-e5-large | no disponible | no disponible | MIT | Multilingüe | no disponible | 0.643 |

bge-m3-italian mejora al modelo base en recuperación italiana y en STS22, pero queda por debajo de multilingual-e5-large en SIB200ClusteringS2S (0.342 frente a 0.396), WebFAQRetrieval (0.778 frente a 0.807) y BelebeleRetrieval (0.932 frente a 0.951). En JuriFindITRetrieval supera a e5-large (0.617 frente a 0.594). Frente a BAAI/bge-m3 mantiene idéntica arquitectura, dimensión y contexto, por lo que la sustitución no requiere cambios de código.

## Limitaciones y advertencias

- La cabeza sparse empeora en pasajes cortos: 0.450 frente a 0.474 del modelo base (−0.023). El autor remite a la sección de limitaciones de la model card para explicar esta caída.
- La representación dense en documentos largos no mejora de forma significativa (0.609 frente a 0.627, diferencia no significativa), por lo que en ese escenario conviene usar el modo híbrido o sparse.
- El modelo está especializado en italiano; aunque el base sea multilingüe, no se garantiza el rendimiento en otras lenguas tras el fine-tune.
- Riesgo de alucinación no aplicable directamente al ser un modelo de embeddings, pero los sistemas RAG que lo usen heredan el riesgo de recuperar pasajes irrelevantes cuando la similitud no capture la intención de la consulta.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al entrenarse sobre mMARCO-it, puede heredar sesgos de dominio y de traducción del corpus original.
- Aproximadamente el 9,5 % de los pasajes se descartaron por mojibake en la traducción de origen, lo que puede introducir cobertura desigual en determinados temas.
- La licencia MIT permite uso comercial sin restricciones conocidas, pero conviene verificar las condiciones de los datos de entrenamiento (mMARCO) para usos sensibles.
- Para producción se recomienda combinar el modelo con un reranker; sin él, el nDCG@10 cae de 0.821 a 0.796 en el pipeline evaluado.
- Las cabezas sparse y ColBERT no están incluidas en los archivos ONNX; solo la dense. Para búsqueda híbrida es necesario usar los pesos PyTorch y `sparse_linear.pt` / `colbert_linear.pt`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/albertobarnabo/bge-m3-italian
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Reranker recomendado: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Dataset de entrenamiento: https://huggingface.co/datasets/unicamp-dl/mmarco
- Dataset de evaluación de documentos largos: https://huggingface.co/datasets/Shitao/MLDR
- Resultados MTEB del modelo: https://github.com/embeddings-benchmark/results/tree/main/results/albertobarnabo__bge-m3-italian
- Repositorio mteb: https://github.com/embeddings-benchmark/mteb
- Leaderboard MTEB: https://huggingface.co/spaces/mteb/leaderboard
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- FlagEmbedding: no disponible como enlace en la información proporcionada
