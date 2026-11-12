# Elafnawaf/gliner2-arabic-saudi-r5-t-conts-s42

## Resumen

GLiNER2 Arabic Saudi r5 es un ajuste fino del modelo base `fastino/gliner2.5-multi-v1` especializado en extraccion de informacion estructurada sobre arabe saudita y del Golfo. Lo desarrolla el usuario Elafnawaf y pertenece a la familia GLiNER2, un paradigma de reconocimiento de entidades y relaciones zero-shot que formula la extraccion como una tarea de clasificacion token a token guiada por etiquetas en lenguaje natural, en lugar de depender de un conjunto cerrado de clases predefinidas.

El modelo resuelve el problema de la baja cobertura de recursos NER para dialectos arabes del Golfo: el modelo base multilingue rinde de forma mediocre en textos sauditas coloquiales, SMS, tuits y documentos con mezcla de arabe estandar (MSA) y dialecto. Este checkpoint se entrena con una mezcla de datos que incluye NER arabe, relaciones, clasificacion, PII y documentos sinteticos, y aplica una compuerta de retencion (retention gate) que verifica que no degrade el comportamiento del modelo base en ingles, otras lenguas, etiquetas no vistas, descripciones, relaciones y registros.

Arquitectura GLiNER2 (encoder transformer con cabecera de extraccion guiada por etiquetas), 287.355.159 parametros totales, licencia CC-BY-SA-4.0 y pesos en safetensors. El contexto de entrenamiento y evaluacion se fija en max_len 384 tokens. Es relevante para pipelines de extraccion en produccion sobre contenido arabe del Golfo, especialmente PII y entidades en dominios regulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 (encoder transformer con cabecera de extraccion guiada por etiquetas / token-classification) |
| Parametros totales | 287.355.159 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens en entrenamiento y evaluacion (max_len 384) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | ar, en (entrenado para arabe saudita y del Golfo; evaluado tambien en de, fr, hi, zh) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `fastino/gliner2.5-multi-v1` (revision `2ca71aa`) y se ajusta en modo `full` (todos los parametros, sin LoRA: `lora_r: null`). El entrenamiento usa 157.972 ejemplos, una epoca, semilla 42, `encoder_lr` de 2e-06, `task_lr` de 0.0002, `batch_size` de 1 con `gradient_accumulation_steps` de 16 y precision fp32 sobre 2 dispositivos. La formulacion GLiNER2 permite NER zero-shot, clasificacion, extraccion de relaciones y extraccion de registros estructurados mediante etiquetas y descripciones en lenguaje natural.

La mezcla de datos de la ronda 3 (`T`) incluye bloques de entidades (42.003), registros (4.689), relaciones (16.000), clasificacion (32.009), documentos (15.722), `tarseya` (8.852), SMS (10.324), replay (6.365), rehearsal (7.788), tuits (7.284), tuits recortados (936), multietiqueta (3.987) y SMS recortados (2.062). Las fuentes incluyen WikiANN, IAHLT Arabic NER, Wojood, ShamNER, ArSarcasm v1 y v2, ArSAS, SANAD, IADD, Gulf Arabic Tweets 2018-2020, SREDFM, REDFM y un corpus de PII en ingles y arabe saudita. Ademas se usan 14.000 frases sauditas generadas, 5.153 etiquetas debiles por regex sobre SANAD y texto del Golfo, 6.388 ejemplos de autodestilacion del modelo base y etiquetas plateadas de Qwen3-8B sobre el corpus SMS T330. Las particiones train/dev/test se declaran sin solapamiento y con manifiesto de hashes.

## Capacidades

- Reconocimiento de entidades nombradas (NER) zero-shot guiado por etiquetas en lenguaje natural, sin necesidad de reentrenar por cada esquema.
- Extraccion de relaciones entre entidades (relation extraction), evaluada sobre REDFM en arabe.
- Extraccion de registros estructurados (structured extraction) a partir de documentos.
- Clasificacion de texto y clasificacion multietiqueta.
- Deteccion de PII (informacion personal identificable) en textos en ingles y arabe saudita.
- Soporte de descripciones de etiquetas para desambiguar tipos de entidad.
- Robustez al orden de las etiquetas (evaluada en el slice `v2/label_order_robustness`).
- Capacidades multilingues medidas en arabe (MSA, levantino, saudita), ingles, aleman, frances, hindi y chino.
- Procesamiento de texto corto informal: tuits, SMS y conversaciones coloquiales del Golfo.
- No se documenta soporte de tool calling, agentes, vision ni audio en la informacion proporcionada.

## Casos de uso

- Deteccion de PII en produccion sobre texto arabe saudita: el modelo identifica identificadores personales en SMS y documentos con F1 de 0.794 en el slice `heldout/sms_gold_v1`, adecuado para pipelines de redaccion o enmascarado previos a almacenamiento.
- Extraccion de entidades en atencion al cliente: procesa mensajes cortos de usuarios del Golfo (tuits, SMS, chats) para poblar campos estructurados como nombre, ubicacion o numero de pedido, con F1 de 0.941 en `heldout/saudi_short_chatgpt`.
- Enriquecimiento de bases de datos de medios: NER sobre articulos y noticias en MSA y dialecto levantino (F1 de 0.831 en `iahlt` y 0.743 en WikiANN arabe) para indexacion y busqueda semantica.
- Extraccion de relaciones en dominios estructurados: sobre REDFM en arabe alcanza F1 de 0.406, util para construir grafos de conocimiento a partir de texto no estructurado cuando no se dispone de un modelo supervisado especifico.
- Procesamiento de documentos administrativos y formularios: la extraccion de registros (records) permite mapear campos de documentos a un esquema JSON definido por etiquetas y descripciones, con F1 de 0.900 en el slice sintetico de documentos.
- Moderacion y analisis de sentimiento en redes sociales: combinado con las capacidades de clasificacion, permite etiquetar tuits sauditas por acto de habla, sarcasmo o sentimiento usando los corpus ArSAS, ArSarcasm e IADD.
- Normalizacion de datos de encuestas y SMS: el modelo maneja texto corto con ruido ortografico (F1 de 0.794 en SMS dorados) para extraer entidades en encuestas telefonicas o mensajeria masiva.

## Benchmarks y rendimiento

Resultados de la model card, decodificacion identica (umbral 0.5, solapamiento `flat`, max_len 384) sobre slices congelados, comparando el modelo base y este checkpoint:

| Slice | Filas | F1 base | F1 candidato | Delta |
|---|---:|---:|---:|---:|
| `v1/ar_levant_ner_shamner` | 500 | 0.249 | 0.468 | +0.219 |
| `v1/ar_msa_ner_iahlt` | 500 | 0.615 | 0.831 | +0.216 |
| `v1/ar_numeric_ner_wojood` | 364 | 0.469 | 0.798 | +0.328 |
| `v1/ar_relations_redfm` | 690 | 0.178 | 0.406 | +0.228 |
| `v1/ar_wiki_ner_wikiann` | 406 | 0.578 | 0.743 | +0.166 |
| `v1/de_ner_wikiann` | 200 | 0.668 | 0.773 | +0.105 |
| `v1/en_ner_wikiann` | 500 | 0.538 | 0.682 | +0.144 |
| `v1/en_pii_khalid` | 300 | 0.554 | 0.572 | +0.018 |
| `v1/fr_ner_wikiann` | 200 | 0.666 | 0.832 | +0.166 |
| `v1/hi_ner_wikiann` | 200 | 0.198 | 0.563 | +0.365 |
| `v1/zh_ner_wikiann` | 200 | 0.302 | 0.548 | +0.247 |
| `v2/label_order_robustness` | 450 | 0.622 | 0.836 | +0.213 |
| `docs/docs_synth_dev` | 450 | 0.575 | 0.900 | +0.325 |
| `heldout/docs_chatgpt/docs_chatgpt` | 30 | 0.622 | 0.931 | +0.309 |
| `heldout/docs_chatgpt/docs_chatgpt_tarseya` | 30 | 0.764 | 0.923 | +0.158 |
| `heldout/gulf_tweets_claude/gulf_tweets_claude` | 250 | 0.538 | 0.773 | +0.236 |
| `heldout/saudi_short_chatgpt/saudi_short_chatgpt` | 60 | 0.475 | 0.941 | +0.467 |
| `heldout/saudi_short_chatgpt/saudi_short_chatgpt_tarseya` | 60 | 0.540 | 0.923 | +0.383 |
| `heldout/sms_gold_v1/sms_gold_v1` | 400 | 0.553 | 0.794 | +0.241 |
| `saudi_gold_dev` | 42 | 0.758 | 0.955 | +0.197 |
| `saudi_gold_dev/dialect` | 20 | 0.721 | 0.959 | +0.238 |
| `saudi_gold_dev/msa` | 22 | 0.789 | 0.952 | +0.163 |

La compuerta de retencion se declara como PASSED, sin slices inconclusos. No se proporcionan resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, que no aplican a un modelo de extraccion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 287 millones de parametros, en fp16 el peso ronda los 0,57 GB y en fp32 alrededor de 1,15 GB, a lo que hay que sumar activaciones y overhead del runtime.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU consumer moderna (RTX 3060 en adelante) deberia poder alojar el modelo en fp16, aunque no hay datos oficiales de latencia ni throughput.
- Cabe en GPU consumer: si, segun el recuento de parametros, aunque no se confirma en la documentacion.
- Opciones de despliegue: la libreria declarada es `gliner2`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| GLiNER2 Arabic Saudi r5 (este) | 287 M | 384 tokens | Extraccion zero-shot guiada por etiquetas, especializado en arabe saudita | cc-by-sa-4.0 | Hugging Face |
| `fastino/gliner2.5-multi-v1` (base) | no disponible | no disponible | GLiNER2 multilingue generalista | no disponible | Hugging Face |
| NER arabe supervisado (p. ej. modelos sobre Wojood/ANERcorp) | variable | variable | Clases cerradas, requiere reentrenamiento por esquema | variable | Hugging Face |

La comparacion cuantitativa con alternativas concretas no esta disponible en la informacion proporcionada; los unicos datos comparativos son frente al modelo base en los slices de la tabla anterior.

## Limitaciones y advertencias

- Ventana de contexto limitada a 384 tokens: los documentos largos deben fragmentarse, con riesgo de perder entidades en los limites de fragmento.
- El slice de relaciones en arabe (`redfm`) alcanza solo F1 de 0.406, insuficiente para extraccion de relaciones de alta precision sin revision humana.
- El slice de PII en ingles (`en_pii_khalid`) mejora solo +0.018 (F1 0.572), por lo que el modelo no es fiable como unico detector de PII en ingles.
- Riesgo de alucinacion de entidades: como todo modelo generativo de etiquetas, puede producir spans espurios cuando las etiquetas o descripciones son ambiguas; se recomienda umbral de confianza y validacion.
- Sesgos dialectales: el entrenamiento se centra en arabe saudita y del Golfo; el rendimiento en otros dialectos arabes (magrebi, egipcio) no se ha medido en los slices publicados.
- La licencia CC-BY-SA-4.0 impone atribucion y compartir bajo la misma licencia las obras derivadas, lo que puede condicionar su uso comercial en productos propietarios.
- El corpus SMS T330 contiene identificadores reales que nunca se publicaron; el modelo solo los vio durante el entrenamiento, lo que plantea consideraciones de privacidad sobre datos de entrenamiento.
- El modelo base se distribuye sin datos de licencia en la informacion disponible; conviene verificar la licencia del checkpoint original antes de un despliegue comercial.
- Sin datos de latencia, throughput ni cuantizaciones validadas; el rendimiento en produccion debe medirse empiricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Elafnawaf/gliner2-arabic-saudi-r5-t-conts-s42
- Modelo base: https://huggingface.co/fastino/gliner2.5-multi-v1
- Dataset Gulf Arabic Tweets 2018-2020: https://huggingface.co/datasets/AhmedSSabir/Gulf-Arabic-Tweets-2018-2020
- Dataset REDFM: https://huggingface.co/datasets/Babelscape/REDFM
- Dataset SREDFM: https://huggingface.co/datasets/Babelscape/SREDFM
- Dataset ShamNER: https://huggingface.co/datasets/HebArabNlpProject/ShamNER
- Dataset PII multisource en saudita: https://huggingface.co/datasets/KhalidAlharbi377/pii-detection-multisource-en-saudi-arabic
- Dataset Wojood NER: https://huggingface.co/datasets/Optune/arabic_ner_wojood
- Dataset ArSAS: https://huggingface.co/datasets/Qanadil/ArSAS_An_Arabic_Speech-Act_and_Sentiment_Corpus_of_Tweets
- Dataset ArSarcasm v2: https://huggingface.co/datasets/arbml/ArSarcasm_v2
- Dataset SANAD: https://huggingface.co/datasets/arbml/SANAD
- Dataset IADD: https://huggingface.co/datasets/evageon/IADD
- Dataset ar_sarcasm: https://huggingface.co/datasets/iabufarha/ar_sarcasm
- Dataset IAHLT Arabic NER: https://huggingface.co/datasets/iahlt/arabic_ner_mafat
- Dataset WikiANN: https://huggingface.co/datasets/unimelb-nlp/wikiann
