# anonyMicky/blinded-reranker

## Resumen

Blinded-reranker es un rerankador pointwise decoder-only de 3,22 mil millones de parámetros desarrollado por el usuario anonyMicky y publicado en HuggingFace. El modelo se construye sobre un backbone pre-entrenado desde cero (blinded-nanochat-pretrained) con el corpus ClimbMix, sin utilizar ningún backbone de terceros con pesos abiertos en ninguna fase del proceso. Su función es reordenar los candidatos devueltos por un retriever de primera etapa (como BM25) en pipelines de recuperación de información.

La innovación principal del modelo es doble: por un lado, emplea localizado contrastive estimation (LCE) como objetivo de fine-tuning sobre el dataset RLHN-250K, y por otro, aplica la técnica de model soup, promediando con pesos iguales los parámetros de cuatro ejecuciones independientes de fine-tuning. Este promedio no añade coste de inferencia, ya que produce un único checkpoint del mismo tamaño que cada modelo padre. Los resultados publicados muestran una media de nDCG@10 de 0,641 en TREC DL y 0,547 en BEIR, superando ligeramente a los cuatro modelos parentales.

Es relevante como demostración de que un rerankador competitivo puede construirse íntegramente con datos y recetas públicas, sin destilación ni datos sintéticos, y como ejemplo práctico de cómo el model soup mejora la robustez sin coste adicional. El modelo utiliza la librería nanochat, pesos en formato safetensors y licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat, profundidad 34, atención causal) |
| Parametros totales | 3.215.335.146 (3,22B) |
| Parametros activos | no disponible (no es MoE; arquitectura densa) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos en FP32; inferencia en bfloat16 según ejemplo de uso) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (12,9 GB de tamano de repo) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de la familia nanochat con 34 capas, anchura 2.176, 17 cabezas de atencion de dimension 128 y contexto de 2.048 tokens. La puntuacion de relevancia se obtiene sin anyadir ninguna cabeza de clasificacion: se leen dos filas pre-entrenadas de la cabeza del modelo de lenguaje (2 × 2.176 = 4.352 parametros) y se calcula s(q, d) = logit(" true") − logit(" false") en el ultimo token del prompt. El prompt utilizado tiene el formato `<|bos|>Query: {query}\nPassage: {passage}\nRelevant:`. El tokenizador es un BPE a nivel de byte con 32.768 entradas. Durante el entrenamiento se uso truncamiento de 128 tokens para la query y 512 para el pasaje, aunque en inferencia el unico limite es el contexto de 2.048 tokens del backbone.

El fine-tuning parte del checkpoint pre-entrenado en el paso 227.158 y utiliza RLHN-250K (247.534 instancias), un subconjunto curado de siete colecciones de recuperacion de la mezcla de entrenamiento de BGE en el que una cascada de LLMs reetiqueta falsos negativos como positivos. El objetivo es la localizada contrastive estimation (LCE): un softmax sobre un positivo y K negativos duros muestreados por query a temperatura τ = 1, con K ∈ {7, 15, 23} segun el pool de negativos disponible. No hubo destilacion, datos sinteticos ni modelo profesor. La optimizacion consistio en una epoca con AdamW (β = 0,9/0,95, weight decay 0,01), learning rate pico de 5 × 10⁻⁵ con 150 pasos de warm-up y decaimiento coseno hasta cero, clipping de gradiente a norma global 12, batch efectivo de 128 grupos de query por actualizacion (≈1.931 actualizaciones) sobre dos GPUs, con pesos FP32 y matmuls TF32.

La contribucion distintiva es el model soup: cuatro ejecuciones de la misma receta (con semillas 17 y 18, y hardware distinto: 2 × RTX PRO 6000 Blackwell en tres ejecuciones y 2 × H100 con gradient caching en la cuarta) se promediaron con peso 0,25 cada una en float64. Este promedio abarca tanto la variabilidad de semilla como el no determinismo de implementacion, y produce un checkpoint unico del mismo tamano y forma que cada padre, sin coste de inferencia anyadido.

## Capacidades

- Reranking pointwise de pares (query, pasaje): puntua un par cada vez, disenyado para reordenar los candidatos top-k devueltos por un retriever de primera etapa.
- Scoring sin cabeza de clasificacion dedicada: reutiliza filas del LM head pre-entrenado, lo que reduce los parametros respecto al modelo base (3,22B frente a 3,29B).
- Truncamiento flexible en inferencia: aunque se entreno con 128 tokens de query y 512 de pasaje, en inferencia admite entradas hasta el contexto completo de 2.048 tokens.
- Buen rendimiento fuera de dominio: cuatro de las siete colecciones BEIR evaluadas (TREC-COVID, TREC-News, Robust04, NFCorpus) son fuera de dominio respecto a los datos de entrenamiento.
- Integracion con la libreria Transformers mediante `AutoModelForSequenceClassification` y metodo `rerank()` integrado (requiere `trust_remote_code=True`).
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de razonamiento: es un modelo especializado exclusivamente en text-ranking.

## Casos de uso

- Reranking en buscadores empresariales: tras una primera etapa BM25 o densa, el modelo reordena los top-100 candidatos para mejorar la precision del ranking final, como demuestran los resultados sobre candidatos BM25 en TREC DL (mejora de 0,393 a 0,641 de nDCG@10 medio).
- RAG (Retrieval-Augmented Generation): como componente de reordenacion antes de pasar el contexto a un LLM generador; un ranking mas preciso reduce ruido en el prompt y mejora la calidad de las respuestas.
- Busqueda en dominios cientificos y tecnicos: el rendimiento en SciFact (0,790) y SCIDOCS (0,236 frente a 0,149 de BM25) lo hace adecuado para sistemas de busqueda de literatura cientifica.
- Busqueda semantica en APIs y plataformas de contenido: gracias a su licencia MIT, puede integrarse en productos comerciales sin restricciones, por ejemplo para reordenar resultados de documentacion o articulos.
- Sistemas de preguntas y respuestas sobre corpora especializados: el alto rendimiento en TREC-COVID (0,859) ilustra su utilidad en escenarios de busqueda medica o de emergencia sanitaria.
- Evaluacion y benchmarking de pipelines de recuperacion: al estar entrenado solo con datos publicos y reproducir numeros competitivos, sirve como baseline abierto y reproducible para comparar rerankadores en investigacion.
- Reordenacion de candidatos en busquedas con consultas largas: el contexto de 2.048 tokens permite consultas y pasajes mas largos que el truncamiento de entrenamiento (128/512) cuando el caso de uso lo requiere.

## Benchmarks y rendimiento

Resultados oficiales publicados en la model card (nDCG@10, reranking de los top-100 candidatos BM25 recuperados con Pyserini, truncamiento 128/512, evaluacion con `trec_eval`):

TREC Deep Learning:

| | DL19 | DL20 | DL21 | DL22 | DL23 | **media** |
|---|---:|---:|---:|---:|---:|---:|
| BM25 (primera etapa) | 0,506 | 0,480 | 0,446 | 0,269 | 0,263 | 0,393 |
| **Este modelo (soup)** | 0,757 | 0,723 | 0,714 | 0,533 | 0,480 | **0,641** |
| Media de los cuatro padres | 0,754 | 0,721 | 0,712 | 0,531 | 0,481 | 0,640 |

BEIR:

| | COVID | News | Robust04 | NFCorpus | SciFact | SCIDOCS | FiQA | **media** |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| BM25 (primera etapa) | 0,595 | 0,395 | 0,407 | 0,322 | 0,679 | 0,149 | 0,236 | 0,398 |
| **Este modelo (soup)** | 0,859 | 0,515 | 0,592 | 0,380 | 0,790 | 0,236 | 0,455 | **0,547** |
| Media de los cuatro padres | 0,858 | 0,513 | 0,589 | 0,380 | 0,783 | 0,234 | 0,451 | 0,544 |

La desviacion estandar muestral entre ejecuciones parentales es de 0,001 en medias de benchmark y 0,003 en colecciones individuales, por lo que diferencias de ese tamano deben interpretarse como ruido. El soup iguala al padre mas fuerte en TREC DL y supera a los cuatro en BEIR. No hay comparaciones publicadas con otros rerankadores de terceros (como monoT5, bge-reranker o RankT5) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos FP32 el modelo ocupa unos 12,9 GB; en bfloat16 (formato del ejemplo de uso) requiere aproximadamente 6,5 GB de VRAM, mas la memoria para activaciones y KV cache segun longitud de secuencia y batch.
- GPU recomendadas: cualquier GPU moderna con al menos 8 GB de VRAM para inferencia en bfloat16. Los autores entrenaron con 2 × RTX PRO 6000 Blackwell y 2 × H100; el ejemplo de uso reporta ejecucion en una H200.
- Consumer GPUs: dado el requerimiento aproximado de 6,5 GB en bfloat16, cabe en GPUs de consumo como la RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 o superiores.
- Opciones de despliegue: libreria Transformers (>= 4.52) con PyTorch (>= 2,5) mediante `AutoModelForSequenceClassification` y `trust_remote_code=True`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGGUF en la informacion disponible.
- Latencia y throughput: al ser un modelo decoder-only pointwise que puntua un par cada vez, la latencia escala linealmente con el numero de candidatos; no se publican cifras concretas de latencia o throughput.

## Comparativa con modelos similares

No se han publicado comparaciones directas con otros rerankadores en la model card. Una comparativa orientativa por categoria (rerankadores decoder-only de tamano similar) seria:

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| blinded-reranker | 3,22B | 2.048 | RLHN-250K, LCE, model soup de 4 runs | MIT |
| bge-reranker-v2-m3 (BAAI) | ~568M (base XLM-RoBERTa) | 8.192 | Multiidioma, destilacion y datos mixtos | MIT |
| monoT5-3B (Google) | ~3B | 512 | MS MARCO, prompt " Relevant: true/false" | Pesos no liberados oficialmente para todos los tamanyos |

Caveats de esta comparativa: monoT5-3B comparte enfoque pointwise y tamano, pero sus pesos y licencia tienen restricciones segun la version; bge-reranker-v2-m3 es mucho mas ligero y multilingue pero con arquitectura encoder. No hay numeros de nDCG@10 comparables publicados bajo el mismo protocolo de evaluacion para las tres alternativas, por lo que no pueden afirmarse diferencias de rendimiento sin riesgo de inventar datos.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado y etiquetado solo para ingles; no hay soporte declarado para castellano ni otros idiomas.
- Dominio de entrenamiento: los datos proceden de la mezcla de BGE (via RLHN-250K); el rendimiento en dominios no cubiertos puede degradarse, aunque los resultados BEIR fuera de dominio son razonables.
- Truncamiento de entrenamiento: el modelo se entreno con 128 tokens de query y 512 de pasaje; entradas significativamente mas largas en inferencia (hasta 2.048) no han sido evaluadas y pueden comportarse peor.
- Scoring pointwise: puntua un par cada vez, lo que implica coste computacional lineal en el numero de candidatos; para top-k grandes la latencia puede ser considerable frente a rerankadores cross-encoder mas pequenyos.
- Codigo personalizado: requiere `trust_remote_code=True` tanto para el tokenizador como para el modelo, lo que implica ejecutar codigo remoto del autor; conviene revisarlo antes de usarlo en produccion.
- Libreria no estandar: el modelo depende de la libreria nanochat y de codigo custom, sin soporte nativo verificado en vLLM, llama.cpp u Ollama.
- Procedencia anonima: el autor usa el alias anonyMicky, sin afiliacion verificable, y el modelo tiene 0 descargas y 0 likes en el momento de la ficha; la comunidad aun no ha validado los resultados.
- Licencia MIT: sin restricciones para uso comercial, pero sin ninguna garantia.
- Riesgo de alucinacion: no aplica como tal al no ser un modelo generativo, pero el scoring de relevancia puede producir falsos positivos o negativos, especialmente fuera de los dominios de entrenamiento.
- Sesgos: el dataset RLHN-250K emplea una cascada de LLMs para reetiquetar falsos negativos, por lo que puede heredar sesgos de esos modelos anotadores; no se documentan auditorias de sesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anonyMicky/blinded-reranker
- Backbone pre-entrenado: https://huggingface.co/anonyMicky/blinded-nanochat-pretrained
- Dataset de entrenamiento RLHN-250K: https://huggingface.co/datasets/rlhn/rlhn-250K
- Paper de model soup citado en la model card: https://arxiv.org/abs/2203.05482
- No se han encontrado enlaces adicionales (demo, repositorio de codigo, blog) en la informacion disponible.
