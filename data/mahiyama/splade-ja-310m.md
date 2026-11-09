# mahiyama/splade-ja-310m

## Resumen

splade-ja-310m es un modelo de recuperación dispersa aprendida (SPLADE v2) para japonés, desarrollado por el usuario mahiyama y publicado en Hugging Face bajo licencia MIT. Se construye sobre el modelo base sbintuitions/modernbert-ja-310m, un transformer encoder de tipo ModernBERT adaptado al japonés, y transforma texto de entrada en un vector disperso de 102.400 dimensiones (una por token del vocabulario), con solo decenas o cientos de dimensiones activas por frase.

El modelo resuelve el problema de la recuperación léxica rígida: a diferencia de BM25, que solo encuentra coincidencias superficiales de términos, SPLADE expande la consulta hacia términos relacionados de forma natural (por ejemplo, «機械学習» activa también 学習, 人工知能, アルゴリズム o コンピューター). Esto permite recuperar documentos relevantes que no contienen literalmente el término consultado, manteniendo la eficiencia de los índices invertidos.

Es relevante porque ofrece una alternativa lista para producción en recuperación japonesa sin necesidad de `trust_remote_code` ni módulos adicionales: se carga directamente con `SparseEncoder.from_pretrained()` de sentence-transformers (>= 5.4) y es compatible con Elasticsearch, OpenSearch, Vespa o Qdrant Sparse. Con unos 315 millones de parámetros y 8.192 tokens de longitud máxima de entrada, ocupa un punto intermedio entre los modelos léxicos clásicos y los densos de gran tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (fill-mask, ModernBERT) + SpladePooling (max) |
| Parámetros totales | 315.304.960 (unos 315M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens de entrada máxima (entrenado con 512 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | japonés (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | sbintuitions/modernbert-ja-310m |
| Dimensiones de salida | 102.400 (tamaño del vocabulario) |
| Tokenizer | SentencePiece (vocabulario de ModernBERT-Ja) |
| Función de pérdida | CachedSpladeLoss (SparseMultipleNegativesRankingLoss) |
| Precisión mixta | bf16 |
| Framework | sentence-transformers >= 5.4 (SparseEncoder) |
| Pipeline | feature-extraction |
| Dataset de entrenamiento | mahiyama/auto-wiki-qa |
| Tamaño del repositorio | 2,5 GB |

## Arquitectura y entrenamiento

El modelo sigue la formulación SPLADE v2: un encoder transformer de tipo ModernBERT con cabeza de modelado de lenguaje enmascarado (MLM) cuyas logits se agregan mediante max pooling sobre cada dimensión del vocabulario. El resultado es un vector disperso de 102.400 dimensiones donde cada dimensión corresponde a un token del vocabulario y su peso refleja la importancia de ese término para el texto de entrada. La puntuación en recuperación se calcula por producto escalar (dot product, no similitud coseno), lo que lo hace directamente compatible con índices invertidos.

El entrenamiento parte de sbintuitions/modernbert-ja-310m y se completa mediante seis etapas de entrenamiento progresivo, según indica la model card. Se utiliza el dataset mahiyama/auto-wiki-qa, derivado de contenido tipo Wikipedia. Una innovación destacable es la incorporación de un mecanismo que suprime tokens de ruido durante el entrenamiento —puntuación, símbolos, fragmentos de subpalabras y marcadores decorativos—, de modo que la expansión léxica se concentra en términos semánticamente útiles. Esto permite que la inferencia no requiera `trust_remote_code` ni módulos adicionales. El modelo es simétrico: usa el mismo encoder para consultas y documentos, con métodos separados `encode_query` y `encode_document`.

## Capacidades

- Generación de embeddings dispersos para recuperación de información en japonés, con expansión automática hacia términos relacionados.
- Expansión semántica controlada: en el ejemplo de «機械学習» se activan 307 dimensiones con términos como 学習, 人工知能, アルゴリズム, コンピューター y 科学.
- Alta dispersión en consultas conversacionales: la pregunta «日本の首都はどこですか？» activa solo 11 dimensiones, concentradas en 首都, 日本 y 都市, sin desperdiciar peso en partículas interrogativas.
- Cobertura de polisemia: «アップル» activa simultáneamente los sentidos de fruta (リンゴ, りんご) y empresa (Apple, apple, APPLE, ▁Apple), incluyendo variantes en inglés y japonés.
- Supresión de tokens de ruido: puntuación, símbolos, emoji y tokens especiales como [CLS] no aparecen en los rangos superiores de activación.
- Compatibilidad con índices invertidos y operaciones con matrices dispersas (Elasticsearch, OpenSearch, Vespa, Qdrant Sparse).
- Integración directa con sentence-transformers mediante `SparseEncoder`, sin código remoto.
- Soporte de `text-embeddings-inference` y endpoints compatibles según los tags del repositorio.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento: es exclusivamente un encoder de recuperación.

## Casos de uso

- Búsqueda en documentación técnica japonesa: indexar manuales y artículos con un índice invertido y consultar con SPLADE para recuperar pasajes que usan sinónimos o formulaciones distintas del término buscado, algo que BM25 no cubre.
- Aumento de BM25 mediante fusión de puntuaciones: combinar el score de BM25 con el de SPLADE en un pipeline híbrido para mejorar el recall en corpus japoneses sin renunciar a la eficiencia del índice léxico.
- Búsqueda híbrida con recuperación densa: fusionar por rango los resultados de un modelo denso y de este SPLADE para cubrir tanto coincidencias semánticas como léxicas en un motor de búsqueda corporativo.
- Preguntas y respuestas sobre Wikipedia en japonés: el modelo está entrenado con datos derivados de wiki-qa y maneja bien consultas en formato pregunta, con vectores muy dispersos y centrados en las entidades clave.
- Indexación offline a gran escala: al producir vectores dispersos compatibles con Elasticsearch, OpenSearch o Vespa, permite construir índices en lote y servir consultas de baja latencia mediante producto escalar.
- Búsqueda en catálogos de productos con términos polisémicos: la cobertura simultánea de varios sentidos (como en «アップル») ayuda a recuperar tanto productos de la marca como artículos sobre la fruta cuando la consulta carece de contexto.
- Filtrado y deduplicación de corpus japoneses: usar las representaciones dispersas para medir similitud entre documentos y agrupar contenidos cercanos antes de un pipeline de curación de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,7-0,9 GB solo para los pesos (315M parámetros), más el overhead de activaciones y del tokenizer; en la práctica, menos de 2 GB para lotes moderados.
- VRAM estimada en fp32: alrededor de 1,3 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 4090, A100 o H100 ofrece un margen amplio para lotes grandes y alto throughput.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, e incluso en GPUs de gama baja con 4 GB.
- Opciones de despliegue: sentence-transformers (SparseEncoder), text-embeddings-inference (soportado según los tags) y endpoints compatibles de Hugging Face; para indexación invertida, exportación a Elasticsearch, OpenSearch, Vespa o Qdrant Sparse.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| splade-ja-310m | ~315M | 8.192 tokens | SPLADE disperso (japonés) | MIT | Objeto de esta ficha; basado en ModernBERT-Ja |
| sae-splade-ja-310m | ~0,3B | no disponible | SPLADE disperso (japonés) | no disponible | Variante del mismo autor construida sobre la misma base; aparece asociada al dataset Mintaka |
| modernbert-ja (base) | ~310M | no disponible | Transformer encoder (fill-mask) | no disponible | Modelo base de sbintuitions; no es un recuperador por sí mismo |
| BM25 | no aplica | no aplica | Recuperación léxica clásica | no aplica | Línea base sin expansión de términos; SPLADE lo complementa o supera en recall semántico |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de recuperación con estas alternativas.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre datos derivados de Wikipedia (mahiyama/auto-wiki-qa), puede heredar los sesgos de cobertura y representación de ese corpus; no se han documentado evaluaciones de sesgo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la expansión de términos puede introducir términos relacionados espurios que activen documentos irrelevantes en consultas ambiguas o muy cortas.
- Limitación de idioma: el modelo está diseñado exclusivamente para japonés; su uso con otros idiomas no está soportado ni evaluado.
- Longitud de contexto: aunque admite hasta 8.192 tokens de entrada, fue entrenado con 512 tokens, por lo que el rendimiento en secuencias largas puede degradarse.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las condiciones del modelo base sbintuitions/modernbert-ja-310m para confirmar compatibilidad en producción.
- Compatibilidad: requiere sentence-transformers >= 5.4 para la clase SparseEncoder; versiones anteriores no lo cargarán directamente.
- Puntuación: debe usarse producto escalar, no similitud coseno; usar cosine puede dar resultados incorrectos.
- Madurez: el modelo tiene un número muy bajo de descargas y likes (92 descargas, 1 like en el momento de la consulta), por lo que carece de validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mahiyama/splade-ja-310m
- README en japonés: https://huggingface.co/mahiyama/splade-ja-310m/blob/main/README_ja.md
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-310m
- Dataset de entrenamiento: https://huggingface.co/datasets/mahiyama/auto-wiki-qa
- Dataset Mintaka (mencionado en la búsqueda web): https://huggingface.co/datasets/AmazonScience/mintaka
- Modelo relacionado del mismo autor: https://huggingface.co/mahiyama/sae-splade-ja-310m
