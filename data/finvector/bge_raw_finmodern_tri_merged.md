# finvector/bge_raw_finmodern_tri_merged

## Resumen

`finvector/bge_raw_finmodern_tri_merged` es un modelo de embeddings de frases (sentence embeddings) desarrollado por finvector, obtenido mediante fine-tuning del modelo `BAAI/bge-m3` sobre un conjunto de datos propio de 11.687 pares o tripletas, orientado a la similitud semantica y la extraccion de caracteristicas en el dominio financiero. El modelo se publica bajo licencia Apache 2.0 y sigue el formato estandar de la libreria sentence-transformers, lo que facilita su integracion en pipelines de recuperacion de informacion y busqueda semantica.

La arquitectura subyacente es un transformer de tipo XLM-RoBERTa, la misma familia sobre la que se construye BGE-M3, con 567.754.752 parametros totales y un repositorio de 1,2 GB en formato safetensors. El autor declara un unico resultado de evaluacion en tareas de tripletas con una precision coseno de 0,9976, si bien se trata de una metrica autodeclarada y no verificada.

El interes de este modelo reside en su especializacion: parte de un modelo multilingue de referencia en recuperacion (BGE-M3) y se ajusta con datos financieros, lo que puede mejorar la calidad de los embeddings en tareas de busqueda documental dentro de ese dominio. No obstante, la informacion publica es muy limitada y no se detallan ni la composicion exacta del dataset ni los hiperparametros de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer XLM-RoBERTa (base de BGE-M3) |
| Parametros totales | 567.754.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun model card; el modelo base BGE-M3 es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | sentence-transformers |
| Dimension de embeddings | no disponible |
| Tamano del repositorio | 1,2 GB |
| Modelo base | BAAI/bge-m3 |
| Dataset de entrenamiento | 11.687 ejemplos (dataset_size declarado) |
| Funcion de perdida | CachedMultipleNegativesRankingLoss |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `BAAI/bge-m3`, un encoder transformer basado en XLM-RoBERTa disenado originalmente para recuperacion densa multilingue. La arquitectura conserva los 567,7 millones de parametros del modelo base y produce embeddings de frases destinados a similitud semantica y extraccion de caracteristicas. El ajuste se realizo con la libreria sentence-transformers utilizando la funcion de perdida `CachedMultipleNegativesRankingLoss`, una variante de contrastive learning que aprovecha negativos en cache para mejorar la eficiencia del entrenamiento con lotes grandes.

Segun los metadatos, el entrenamiento empleo 11.687 ejemplos organizados como tripletas (ancla, positivo, negativo), presumiblemente extraidos de documentacion financiera en ingles a juzgar por los ejemplos del widget de la model card, que contienen fragmentos de informes anuales, notas contables y estados financieros. No se especifican el numero total de tokens, la composicion exacta del dataset, la duracion del entrenamiento ni si se aplicaron fases de RLHF o DPO (no aplicables en un modelo de embeddings). Tampoco se documentan innovaciones tecnicas adicionales mas alla del fine-tuning contrastivo estandar.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y recuperacion densa.
- Extraccion de caracteristicas (feature extraction) a nivel de frase o parrafo.
- Busqueda semantica en documentacion financiera en ingles (informes anuales, notas contables, estados financieros).
- Clasificacion y agrupamiento por similitud coseno.
- Soporte de integracion con `text-embeddings-inference` y endpoints compatibles.
- Capacidad multilingue potencial heredada de BGE-M3, aunque la model card solo declara ingles.
- No soporta tool calling, agentes, vision ni audio: es exclusivamente un encoder de embeddings.

## Casos de uso

- Busqueda semantica en corpus financieros: el modelo puede indexar informes anuales, notas al pie y estados financieros, y recuperar fragmentos relevantes ante consultas en lenguaje natural, aprovechando el ajuste sobre datos del dominio.
- Sistemas de preguntas y respuestas sobre documentacion contable: combinado con un LLM generativo, sirve como recuperador en arquitecturas RAG para localizar pasajes con cifras, plazos y estimaciones.
- Deduplicacion y agrupamiento de documentos: los embeddings permiten detectar secciones duplicadas o casi identicas en grandes volumenes de informes corporativos.
- Clasificacion de fragmentos financieros: entrenando un clasificador ligero sobre los embeddings, se pueden etiquetar parrafos por tematica (impuestos, riesgos, perspectivas, contingencias).
- Motor de recomendacion de documentos similares: en portales de inversion o repositorios regulatorios, sugiere informes o notas relacionadas a partir de un fragmento de referencia.
- Evaluacion de similitud entre declaraciones: util para comparar linguistica y semanticamente comunicados de prensa, transcripciones de resultados o descripciones de riesgos entre ejercicios.
- Filtrado previo en pipelines de extraccion de datos: reduce el espacio de busqueda antes de aplicar modelos mas costosos de extraccion estructurada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Triplet | triplet eval | Cosine Accuracy | 0,9976 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, MTEB, etc.) en la informacion disponible. El unico dato procede de una evaluacion interna de tripletas y no permite comparaciones fiables con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo para pesos (567,7 M de parametros), mas overhead de activaciones y tokenizador.
- VRAM estimada en fp16/bf16: aproximadamente 1,2 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A10, A100 o H100 son suficientes. El modelo es muy ligero para inferencia.
- Cabe en GPUs de consumo sin problema, e incluso puede ejecutarse en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers (Python), Hugging Face Text Embeddings Inference (TEI), vLLM (soporte de embeddings), llama.cpp no aplica directamente por el formato, y servidores compatibles con la API de endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| finvector/bge_raw_finmodern_tri_merged | 567,7 M | no disponible | en (declarado) | Apache 2.0 | Fine-tuning financiero de BGE-M3 |
| BAAI/bge-m3 | 567,7 M | hasta 8.192 tokens (segun documentacion publica de BGE-M3) | multilingue (mas de 100 idiomas) | MIT | Modelo base; recuperacion densa, dispersa y multi-vector |
| BAAI/bge-large-en-v1.5 | 335 M | 512 tokens | en | MIT | Embeddings en ingles, muy usado en MTEB |
| intfloat/multilingual-e5-large | 560 M | 512 tokens | multilingue | MIT | Embeddings multilingues con instrucciones |

La comparativa se basa en caracteristicas publicas de los modelos alternativos; no se dispone de resultados MTEB del modelo de finvector para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- El unico benchmark disponible es una precision coseno de 0,9976 sobre un conjunto de evaluacion de tripletas autodeclarado y no verificado; no es representativo del rendimiento en tareas reales de recuperacion.
- La model card solo declara soporte de ingles, aunque el modelo base BGE-M3 es multilingue; el fine-tuning puede haber degradado el rendimiento en otros idiomas.
- El dataset de entrenamiento es pequeno (11.687 ejemplos) y no se documenta su composicion, procedencia ni proceso de anotacion, lo que dificulta evaluar posibles sesgos.
- Riesgo de sobreajuste al dominio financiero y al estilo de los documentos de entrenamiento (informes anuales en ingles de EE. UU.).
- No se documentan la longitud de contexto efectiva ni la dimension de los embeddings, datos necesarios para dimensionar indices vectoriales.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base BGE-M3 tiene licencia MIT; conviene revisar ambas.
- Ausencia de descargas y de validacion por la comunidad: el modelo no ha sido contrastado externamente.
- No apto para generacion de texto, razonamiento, codigo ni tareas multimodales.

## Enlaces

- Hugging Face: https://huggingface.co/finvector/bge_raw_finmodern_tri_merged
- Modelo base BGE-M3: https://huggingface.co/BAAI/bge-m3
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de BGE-M3 (arXiv:2101.06983, referencia citada en la model card): https://arxiv.org/abs/2101.06983
- Libreria sentence-transformers: https://www.sbert.net/
- Repositorio de Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
