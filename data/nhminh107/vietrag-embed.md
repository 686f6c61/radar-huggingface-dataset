# nhminh107/VietRAG-Embed

## Resumen

VietRAG-Embed es un modelo de embeddings densos para recuperacion de informacion en vietnamita, desarrollado por nhminh107 (minhlab.ai.vn) y publicado en HuggingFace. Se trata de un fine-tune de `intfloat/multilingual-e5-base`, por lo que hereda la arquitectura XLM-RoBERTa de tipo encoder con 278.043.648 parametros y una longitud maxima de secuencia de 512 tokens. El modelo proyecta consultas y pasajes a vectores normalizados de 768 dimensiones pensados para similitud coseno.

El problema que resuelve es la recuperacion semantica de pasajes en vietnamita, un idioma con menos recursos y con cobertura desigual en los modelos de embeddings multilingues genericos. Esta orientado a busqueda semantica, recuperacion para QA extractivo y generacion aumentada por recuperacion (RAG), asi como a la generacion de candidatos antes de un reranker cross-encoder. No es un modelo generativo: no produce respuestas, solo recupera texto relevante.

Su relevancia actual radica en que el pipeline de entrenamiento es explicitamente reproducible y esta documentado: 937.686 registros limpios de consulta-positivo-negativo duro en vietnamita, con enfasis en QA sobre pasajes web y recuperacion cientifica, y con resultados publicados tanto en un diagnostico interno sobre mMARCO-VI como en tareas seleccionadas de VN-MTEB. La licencia MIT y la compatibilidad con sentence-transformers y text-embeddings-inference facilitan su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer) empaquetado con Sentence Transformers |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas; los pesos se distribuyen en safetensors) |
| Idiomas soportados | vietnamita (vi) como idioma principal; el modelo base es multilingue, pero no se documenta el rendimiento en otros idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension del embedding | 768 |
| Pooling | mean pooling |
| Normalizacion de salida | L2 |
| Metrica de similitud | similitud coseno (equivalente al producto interno al estar normalizado) |
| Prefijos obligatorios | `query: ` para consultas y `passage: ` para documentos |
| Tamano del repositorio | 1.1 GB |

## Arquitectura y entrenamiento

La arquitectura es un encoder XLM-RoBERTa de 12 capas con 768 dimensiones ocultas, cargado mediante la libreria sentence-transformers. Las representaciones se obtienen con mean pooling sobre la ultima capa oculta y se normalizan con L2, de modo que la similitud coseno coincide con el producto interno. El modelo conserva la convencion de prefijos de la familia E5 (`query: ` y `passage: `), que debe aplicarse antes de la tokenizacion y mantenerse identica en indexacion y busqueda; omitirlos degrada la calidad de recuperacion.

El entrenamiento se realizo sobre 937.686 registros limpios en vietnamita con estructura consulta-positivo-negativo duro, agregados a partir de cuatro fuentes: `minhnguyent546/mmarco-vietnamese-split` (QA sobre pasajes web), `hotchpotch/mmarco-hard-negatives-reranker-score` (candidatos negativos duros puntuados por un reranker), `nhminh107/VietEmbed-RAG-Science` (recuperacion cientifica y tecnica) y `vietgpt/wikipedia_vi` (contenido enciclopedico vietnamita). La model card no especifica la funcion de perdida exacta, el numero total de tokens vistos, la composicion porcentual por dataset ni si se aplicaron etapas de RLHF o DPO; al ser un modelo de embeddings, esas tecnicas generativas no serian de aplicacion directa, pero el detalle no esta documentado.

## Capacidades

- Generacion de embeddings densos de 768 dimensiones para consultas y pasajes en vietnamita.
- Recuperacion semantica query-to-passage con similitud coseno sobre vectores normalizados.
- Busqueda semantica sobre colecciones documentales y bases de conocimiento.
- Recuperacion para QA extractivo y para sistemas RAG generativos (aportando el contexto recuperado, no la respuesta).
- Recuperacion sobre FAQs y bases de conocimiento internas.
- Generacion de candidatos para una etapa posterior de re-ranking con cross-encoder.
- Soporte de tool calling / function calling: no aplica y no disponible (es un modelo de embeddings, no genera texto ni llamadas a herramientas).
- Soporte de agentes y razonamiento multi-paso: no aplica por si mismo; puede actuar como recuperador dentro de un agente construido con otro modelo generativo.
- Capacidades multilingues: el modelo base es multilingue, pero el fine-tune esta especializado en vietnamita y no se documenta el rendimiento fuera de ese idioma.
- Capacidades especiales (vision, audio, modo de razonamiento): no disponible.

## Casos de uso

- Busqueda semantica en corpus vietnamitas: indexar pasajes con el prefijo `passage:` y consultar con `query:`, usando FAISS u otra base vectorial; el modelo esta entrenado especificamente para este emparejamiento sobre pasajes web en vietnamita.
- Recuperacion en sistemas RAG: actuar como recuperador de primer nivel que alimenta el contexto de un LLM generativo en vietnamita; la documentacion lo plantea explicitamente como componente de recuperacion para RAG.
- Atencion al cliente automatizada sobre bases de conocimiento: recuperar articulos de ayuda o respuestas frecuentes a partir de consultas de usuario en vietnamita antes de que un modelo generativo redacte la respuesta final.
- Recuperacion cientifica y tecnica: el dataset `VietEmbed-RAG-Science` forma parte del entrenamiento, por lo que el modelo esta orientado a dominios cientificos cuando se combina con pasajes tecnicos.
- Generacion de candidatos antes de un reranker: recuperar entre decenas y cientos de pasajes con este bi-encoder y reordenarlos con un cross-encoder, reduciendo el coste computacional del re-ranking.
- Deduplicacion y agrupacion semantica de documentos: usar los embeddings normalizados para medir similitud entre documentos y detectar duplicados o construir clusters tematicos.
- Evaluacion de calidad de recuperacion en pipelines internos: emplear las metricas publicadas (Recall@k, MRR@10, nDCG@10) como referencia y reproducir el script del repositorio del proyecto para comparar variantes.
- Motor de busqueda sobre Wikipedia vietnamita: el corpus `vietgpt/wikipedia_vi` participo en el entrenamiento, por lo que el modelo es adecuado para indexar contenido enciclopedico en ese idioma.

## Benchmarks y rendimiento

### mMARCO-VI, holdout de shards 04-05

Diagnostico de recuperacion en dominio con 4.599 consultas reservadas y 7.949 pasajes candidatos muestreados de los shards 04-05 de mMARCO-VI. Se elimino la coincidencia exacta normalizada de consultas con el conjunto de entrenamiento.

| Metrica | Resultado |
|---|---:|
| Recall@1 | 0.8419 |
| Recall@5 | 0.9533 |
| Recall@10 | 0.9698 |
| MRR@10 | 0.8907 |
| nDCG@10 | 0.9102 |

La mediana del rango del pasaje relevante fue 1. El propio autor advierte que este benchmark retiene consultas pero comparte corpus: 215 pasajes (2,70 % del corpus de evaluacion) tienen coincidencias exactas normalizadas en el corpus de entrenamiento, por lo que debe interpretarse como un diagnostico en dominio y no como un benchmark externo completamente independiente.

### Resultados seleccionados de VN-MTEB

| Tarea | Puntuacion de recuperacion |
|---|---:|
| SciFact-VN | 0.6130 |
| TRECCOVID-VN | 0.6068 |
| Quora-VN | 0.5652 |

Los resultados de VN-MTEB se reportan por separado del benchmark personalizado sobre mMARCO-VI. La evaluacion se ejecuto en una NVIDIA Tesla T4 usando los prefijos de consulta y pasaje de E5. No se proporcionan en la informacion disponible resultados comparativos con otros modelos en estas mismas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32 y 0,56 GB en fp16 solo para los pesos. El consumo real depende del tamano de lote y de la longitud de secuencia, acotada a 512 tokens; con lotes moderados es habitual mantenerse en el rango de 1 a 3 GB.
- GPU recomendadas: el modelo es pequeno y no requiere aceleradores de gama alta. La evaluacion publicada se realizo en una NVIDIA Tesla T4, lo que sirve de referencia directa de que funciona en hardware modesto.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090) y tambien puede ejecutarse en CPU con latencias mayores.
- Opciones de despliegue: sentence-transformers (libreria de referencia), Hugging Face Text Embeddings Inference (el tag `text-embeddings-inference` esta presente en el modelo), integracion con FAISS u otras bases vectoriales para la parte de indexacion, y uso con frameworks de RAG en Python. No se documentan variantes GGUF, por lo que llama.cpp y Ollama no estan soportados de forma nativa segun la informacion disponible.
- Latencia y throughput estimados: no disponible. No se publican cifras de latencia ni de pasajes por segundo; solo se indica que la evaluacion se ejecuto en una Tesla T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad | Rendimiento en recuperacion vietnamita |
|---|---|---|---|---|---|---|
| VietRAG-Embed (nhminh107) | 278.043.648 | 512 tokens | vietnamita (principal) | MIT | HuggingFace, safetensors | Recall@1 0.8419 y nDCG@10 0.9102 en mMARCO-VI holdout 04-05; SciFact-VN 0.6130, TRECCOVID-VN 0.6068, Quora-VN 0.5652 en VN-MTEB |
| intfloat/multilingual-e5-base (modelo base) | 278.043.648 | 512 tokens | multilingue | MIT | HuggingFace, safetensors | no disponible en la informacion proporcionada para las mismas tareas |
| Otros bi-encoders especializados en vietnamita | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye resultados de modelos alternativos sobre los mismos conjuntos de evaluacion, por lo que no es posible establecer una comparacion cuantitativa directa mas alla del modelo base del que deriva.

## Limitaciones y advertencias

- No es un modelo generativo: recupera pasajes relevantes, pero no genera respuestas. Usarlo como generador produciria resultados invalidos.
- Requiere el prefijo `query: ` en las consultas y `passage: ` en los documentos. Omitirlos degrada la calidad de recuperacion, y mezclar convenciones entre indexacion y busqueda rompe la coherencia del espacio vectorial.
- Longitud maxima de 512 tokens: los documentos largos deben dividirse en fragmentos, lo que introduce decisiones de chunking que afectan al rendimiento final.
- Especializacion en vietnamita: aunque el modelo base es multilingue, el fine-tune esta centrado en vietnamita y no se documenta el rendimiento en otros idiomas; es previsible una degradacion fuera de dominio, aunque no hay mediciones publicadas.
- Riesgo de alucinacion: no aplica a la generacion de texto, pero si existe riesgo de recuperar pasajes irrelevantes o de falso positivo en similitud semantica, especialmente con colecciones ruidosas o consultas ambiguas.
- Caveat metodologico del benchmark principal: el diagnostico sobre mMARCO-VI comparte corpus con el entrenamiento en un 2,70 % de los pasajes (215 pasajes) y el propio autor lo califica de diagnostico en dominio, no de evaluacion externa independiente.
- Resultados de VN-MTEB limitados a tres tareas de recuperacion (SciFact-VN, TRECCOVID-VN, Quora-VN); no se publican resultados de clasificacion, clustering, reranking ni similitud de pares en ese suite.
- No se documenta la funcion de perdida, el numero de tokens de entrenamiento ni la composicion exacta del dataset, lo que dificulta reproducir el entrenamiento a partir de la model card.
- Sesgos conocidos: no disponible. No se publica analisis de sesgos. Los corpus de origen (mMARCO, Wikipedia vietnamita, datos cientificos) pueden introducir sesgos tematicos, de cobertura geografica y de registro linguistico.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, pero conviene verificar las licencias de los datasets de entrenamiento de forma independiente, ya que la model card no detalla sus condiciones.
- Estado de adopcion muy bajo en el momento de la ficha (0 descargas y 0 likes en HuggingFace) y fechas de creacion y actualizacion de septiembre de 2026, por lo que se trata de un modelo reciente sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nhminh107/VietRAG-Embed
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Codigo fuente y artefactos de evaluacion: https://github.com/nhminh107/VietRAG-Embed-E5-Base
- Sitio web del autor: https://minhlab.ai.vn/
- Dataset mMARCO vietnamita: https://huggingface.co/datasets/minhnguyent546/mmarco-vietnamese-split
- Dataset de negativos duros puntuados por reranker: https://huggingface.co/datasets/hotchpotch/mmarco-hard-negatives-reranker-score
- Dataset VietEmbed-RAG-Science: https://huggingface.co/datasets/nhminh107/VietEmbed-RAG-Science
- Dataset Wikipedia vietnamita: https://huggingface.co/datasets/vietgpt/wikipedia_vi
