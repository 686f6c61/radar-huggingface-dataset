# iamrohitkumar9/bge-small-en-v1.5-esci

## Resumen
bge-small-en-v1.5-esci es un modelo de embeddings de frases (bi-encoder) desarrollado por el usuario independiente iamrohitkumar9, obtenido mediante fine-tuning de BAAI/bge-small-en-v1.5 sobre el conjunto de datos Amazon ESCI (Shopping Queries Dataset), orientado especificamente a la busqueda de productos en comercio electronico. El modelo resuelve el problema de recuperacion semantica de productos: dada una consulta de compra, genera vectores normalizados que permiten ordenar candidatos del catalogo por relevancia.

Se trata de un modelo BERT pequeno, con 33.212.160 parametros totales (aproximadamente 33 millones), lo que lo situa en la gama ligera y permite su despliegue en CPU o GPU de consumo con baja latencia. El repositorio ocupa 0,1 GB en formato safetensors y se distribuye bajo licencia MIT, lo que facilita su uso comercial sin restricciones adicionales.

Su relevancia actual radica en que demuestra que un fine-tuning ligero de una sola epoca sobre datos de e-commerce reales puede mejorar la recuperacion en dominio (nDCG@10 de 0,8280 a 0,8491 en ESCI) y transferir parcialmente a catalogos de otro dominio, como el benchmark WANDS de Wayfair, aunque con ganancias pequenas. Forma parte del proyecto ShelfRank, que evalua el modelo en un pipeline de ranking de productos.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | BERT (bi-encoder, sentence-transformers) |
| Parametros totales | 33.212.160 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limites de entrenamiento: 32 tokens de consulta, 128 tokens de pasaje) |
| Tipos de cuantizacion | fp32 recomendado; exportacion int8 ONNX probada con perdida de ~0,01 nDCG@10 en WANDS dev |
| Idiomas soportados | en (ingles, locale US) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento
El modelo es un transformer BERT de tipo bi-encoder basado en BAAI/bge-small-en-v1.5 (revision 5c38ec7c405e). Genera embeddings tomando el primer token (CLS) de la ultima capa y normalizandolo; el fichero no incluye capa pooler porque el pooling utilizado no la lee. Las consultas deben ir precedidas de la instruccion del modelo base: "Represent this sentence for searching relevant passages:".

El entrenamiento se realizo durante una sola epoca sobre la version "US small" del Amazon Shopping Queries Dataset (ESCI), con 173.440 tripletas extraidas de 20.058 consultas de entrenamiento. Para cada consulta se usa un producto Exact como positivo y, en el 58% de los casos, un producto Irrelevant de la misma consulta como negativo duro; otros productos Exact de la misma consulta se enmascaran de los negativos in-batch. Se reservaron 500 consultas como held-out y se eliminaron 11 consultas ESCI parecidas a consultas de WANDS, sin usar datos de WANDS en entrenamiento. La perdida es multiple-negatives ranking loss, implementada en PyTorch plano con fp16 sobre una Colab T4, con batch size 64, learning rate 2e-5, warmup del 10%, weight decay 0,01, max_grad_norm 1,0, escala 20,0 y semilla 20260.

## Capacidades
- Generacion de embeddings de frases y pasajes para similitud semantica y recuperacion (retrieval).
- Busqueda de productos en e-commerce: mapea consultas de compra y descripciones de producto al mismo espacio vectorial.
- Ranking por similitud coseno tras normalizacion de vectores.
- Uso como retriever en pipelines hibridos, por ejemplo combinado con BM25 mediante Reciprocal Rank Fusion (RRF).
- Soporte de integracion con la libreria sentence-transformers y con Text Embeddings Inference (tag text-embeddings-inference, endpoints_compatible).
- Capacidades multilingues: no, solo ingles (locale US).
- Tool calling, agentes, vision, audio o modo thinking: no disponibles; es un modelo puramente de embeddings.

## Casos de uso
- Busqueda semantica en catalogos de e-commerce: indexar descripciones de producto como vectores normalizados y recuperar los mas cercanos a la consulta del usuario, superando la coincidencia lexica en consultas con reformulaciones o sinonimos.
- Ranking hibrido con BM25: usar el modelo como recuperador denso dentro de una fusion RRF con busqueda lexica; la model card reporta una mejora de +0,012 nDCG@10 en las folds 1-4 de WANDS en este regimen.
- Reordenacion de candidatos (reranking ligero): al ser un modelo de 33 millones de parametros, puede puntuar cientos de pares consulta-producto por peticion con coste bajo en CPU.
- Deduplicacion y agrupacion de productos: calcular similitud entre fichas de producto para detectar duplicados o variantes del mismo articulo en un catalogo.
- Sistemas de recomendacion basados en contenido: representar productos y el historial del usuario en el mismo espacio para sugerir articulos semanticamente afines.
- Filtrado de relevancia en pipelines de datos: descartar pares consulta-producto irrelevantes antes de un modelo de ranking mas costoso.
- Busqueda en aplicaciones con recursos limitados: desplegable en entornos sin GPU gracias a su tamano reducido y a su compatibilidad con Text Embeddings Inference.

## Benchmarks y rendimiento
| Evaluacion | nDCG antes | nDCG despues | Diferencia nDCG@10 |
|---|---|---|---|
| ESCI held-out (500 consultas, in-domain) | 0,8280 | 0,8491 | no disponible (sin intervalo) |
| WANDS dev fold (96 consultas) | 0,724 | 0,724 | -0,000 [-0,038, +0,034] |
| WANDS folds 1-4 (384 consultas) | no disponible | no disponible | +0,021 [+0,007, +0,035] |
| WANDS folds 1-4 en RRF hibrido con BM25 | no disponible | no disponible | +0,012 [+0,004, +0,022] |

Las diferencias son pareadas con intervalos bootstrap del 95% sobre consultas. En la fold dev de WANDS la ganancia no fue concluyente, por lo que el ranker de ShelfRank conservo el encoder original segun una regla fijada antes de leer las folds de test. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en fp32 (33 millones de parametros, ~133 MB de pesos); en la practica cabe en cualquier GPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) ofrece latencia muy baja.
- Cabe en GPU de consumo: si, en todas las gamas actuales, e incluso en entornos sin GPU.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (tag endpoints_compatible), exportacion ONNX (solo fp32 recomendado), integracion en pipelines propios de PyTorch.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; el entrenamiento se ejecuto en una Colab T4 en fp16.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| bge-small-en-v1.5-esci (este) | 33,2 M | no disponible (32/128 tokens en entrenamiento) | MIT | Fine-tune especifico para busqueda de productos |
| BAAI/bge-small-en-v1.5 | ~33 M | 512 tokens (modelo base) | MIT | Modelo generalista; nDCG@10 de 0,8280 en ESCI held-out antes del fine-tune |
| Alternativas de embeddings para e-commerce | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias
- Solo ingles y locale US; no soporta consultas ni catalogos en castellano u otros idiomas.
- Entrenado con una sola ejecucion y una sola semilla; el resultado held-out de ESCI carece de intervalo de confianza porque no se guardaron puntuaciones por consulta.
- La transferencia a otros dominios es limitada: en WANDS la ganancia es pequena (+0,021 nDCG@10 en folds 1-4) y no concluyente en la fold dev.
- La cuantizacion int8 ONNX pierde aproximadamente 0,01 nDCG@10 en WANDS dev; se recomienda fp32.
- Riesgo de alucinacion no aplica directamente (no genera texto), pero si de recuperar productos semanticamente proximos pero irrelevantes para la intencion de compra.
- Sesgos: no documentados en la model card; al derivar de datos de Amazon ESCI puede heredar sesgos de catalogo y de idioma del dataset original.
- Licencia MIT permite uso comercial; ESCI es Apache-2.0 (Amazon) y WANDS es MIT (Wayfair), y el autor declara no estar afiliado a ninguno de los dos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni mantenimiento demostrado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/iamrohitkumar9/bge-small-en-v1.5-esci
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Proyecto ShelfRank: https://github.com/iamrohitkumaryadav9/shelfrank
