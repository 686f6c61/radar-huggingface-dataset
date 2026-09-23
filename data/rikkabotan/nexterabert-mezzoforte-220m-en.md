# RikkaBotan/NexteraBERT-Mezzoforte-220M-en

# NexteraBERT-Mezzoforte-220M-en

## Resumen

NexteraBERT-Mezzoforte-220M-en es un encoder bidireccional en ingles de 212,6 millones de parametros publicado por el usuario RikkaBotan en HuggingFace. Se trata del modelo principal de la familia NexteraBERT, preentrenado con masked language modeling (MLM) sobre 130.000 millones de tokens y disenado explicitamente para operar con contextos largos sin degradar su rendimiento, un punto debil clasico de los encoders tipo BERT cuando se extrapola la longitud de entrada.

La arquitectura no es un transformer homogeneo: sus 18 bloques combinan cuatro tipos de mezclador de tokens distintos (SnowLily, NexteraSWA, NexteraSelfAttention y NexteraHRA), lo que da lugar a un patron hibrido con coste computacional lineal en algunos bloques y atencion completa en otros. A esto se suma SSSMax (Stable Scalable-Softmax) en los bloques de atencion global, que escala los logits con el numero de claves para mantener la selectividad de la atencion en secuencias muy largas.

Su relevancia actual reside en la relacion entre coste y rendimiento: con solo 130.000 millones de tokens de preentrenamiento (frente a los 2 billones de ModernBERT-base), iguala practicamente a ese modelo en GLUE (87,90 frente a 87,97) y lo supera en MTEB v2, BEIR, NanoBEIR y MultiLongDocRetrieval, con un incremento de perdida de solo +3,8 % al pasar de 8.192 a 65.536 tokens (frente a +83,0 % de ModernBERT-base) y un throughput 5,22 veces superior a 65.536 tokens en una H200 NVL. Esta publicado bajo licencia MIT y con codigo personalizado incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional con mezcladores de tokens heterogeneos: SnowLily (8 bloques), NexteraSWA (5), NexteraSelfAttention (3) y NexteraHRA (2); MLP con activacion squared-ReLU, pre-normalizacion y conexion residual en cada bloque |
| Parametros totales | 212.633.600 (212,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | entrenamiento hasta 8.192 tokens; extrapolacion evaluada hasta 65.536 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,7 GB), requiere codigo personalizado (custom_code) |
| Numero de bloques | 18 |
| Atencion | Grouped-query attention con 16 cabezas de consulta y 8 cabezas de clave/valor; ventana deslizante de 256 tokens en NexteraSWA; bandas de 4 tokens en NexteraHRA |
| Tokens de preentrenamiento | 130.000 millones |
| Tarea principal | fill-mask (masked language modeling) |
| Libreria | transformers (probado con transformers 5.12 y PyTorch 2.12) |
| Descargas / likes | 94 descargas, 11 likes |
| Fecha de creacion / actualizacion | 2026-09-12 / 2026-09-22 |

## Arquitectura y entrenamiento

El modelo consta de 18 bloques, cada uno formado por un mezclador de tokens y un MLP con activacion squared-ReLU, ambos con pre-normalizacion y conexion residual. Los mezcladores no son uniformes: ocho bloques usan SnowLily, un mezclador de tipo liquid derivado de las liquid time-constant networks con gating dependiente de la entrada y coste lineal respecto a la longitud de entrada; cinco bloques usan NexteraSWA, atencion de ventana deslizante con ventana de 256 tokens; tres bloques usan NexteraSelfAttention, atencion completa; y dos bloques usan NexteraHRA, atencion sobre bandas de 4 tokens que actua como ruta global mas barata. Todos los bloques de atencion emplean grouped-query attention con 16 cabezas de consulta y 8 cabezas de clave/valor.

Los bloques de atencion completa y de HRA incorporan SSSMax (Stable Scalable-Softmax), que escala los logits de atencion en funcion del numero de claves para preservar la selectividad de la atencion en entradas largas. El preentrenamiento se realizo con masked language modeling sobre 130.000 millones de tokens, con datos procedentes de HuggingFaceFW/fineweb-edu, mlfoundations/dclm-baseline-1.0-parquet y bigcode/starcoderdata (la inclusion de datos de codigo explica su buen comportamiento en tareas CoIR). La longitud maxima de entrenamiento fue de 8.192 tokens, si bien el diseno permite extrapolar hasta 65.536 tokens con una degradacion muy contenida. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales, algo coherente con un encoder no generativo.

## Capacidades

- Prediccion de tokens enmascarados (fill-mask): es su tarea nativa de preentrenamiento y la que declara el pipeline del repositorio.
- Generacion de embeddings de frases y pasajes: el modelo se evalua con fine-tuning de SimCSE supervisado y pooling medio, lo que lo habilita para similitud semantica, recuperacion y agrupamiento.
- Recuperacion de informacion (retrieval): entrenado sobre MS MARCO con tripletas y un negativo duro; resultados publicados en BEIR, NanoBEIR y MultiLongDocRetrieval.
- Reranking de pasajes: evaluado dentro de MTEB v2 en la categoria de reranking (41,81 en NexteraBERT frente a 42,02 de ModernBERT-base).
- Clasificacion de texto: evaluado en GLUE (8 tareas) y en la categoria de clasificacion de MTEB v2.
- Regresion de similitud semantica (STS): 81,65 en MTEB v2 y 91,93 de Spearman en STS-B.
- Agrupamiento de textos (clustering): 43,07 en MTEB v2.
- Resumen extractivo/representacional: categoria de summarization de MTEB v2 con 32,00.
- Recuperacion sobre codigo: evaluado en CodeSearchNet dentro de CoIR (57,22 de nDCG@10) y en StackOverflowQA.
- Contexto largo: mantiene la calidad hasta 65.536 tokens, con un incremento de perdida de solo +3,8 % respecto a 8.192 tokens.
- No soporta tool calling ni function calling: es un encoder bidireccional, no un modelo generativo instruccional.
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- Monolinguee: unicamente ingles (en). No se declaran capacidades multilingues.
- Sin capacidades de vision ni de audio.

## Casos de uso

- Recuperacion aumentada por generacion (RAG): el encoder puede indexar pasajes largos de documentacion y servir como recuperador denso sobre BEIR y MultiLongDocRetrieval, con 43,89 de nDCG@10 en BEIR (15 conjuntos) y 36,25 en MLDR a 8.192 tokens, superando a ModernBERT-base en ambos.
- Reranking en pipelines de busqueda: tras una primera fase de recuperacion dispersa, el modelo reordena los candidatos; su puntuacion de reranking en MTEB v2 (41,81) es competitiva con encoders de tamano similar y su coste de inferencia es bajo al tener 212,6 M de parametros.
- Busqueda semantica sobre documentacion tecnica larga: con ventanas de hasta 8.192 tokens en evaluacion (y extrapolacion probada a 65.536), resulta adecuado para manuales, RFCs o expedientes que no conviene trocear en fragmentos pequenos.
- Recuperacion de codigo en asistentes de desarrollo: los datos de bigcode/starcoderdata en el preentrenamiento y los 57,22 de nDCG@10 en CodeSearchNet lo hacen util para indexar repositorios y responder consultas tipo StackOverflow (65,71 en StackOverflowQA).
- Deduplicacion y agrupamiento de corpus: con 43,07 en la categoria de clustering de MTEB v2, sirve para agrupar articulos, tickets o incidencias por similitud semantica antes de un proceso de etiquetado.
- Clasificacion de contenido a escala: gracias a su coste lineal en parte de los bloques y a un throughput 5,22 veces superior a ModernBERT-base a 65.536 tokens en H200 NVL, es viable clasificar grandes volumenes de texto (moderacion, enrutado de tickets, etiquetado tematico) con requisitos de GPU moderados.
- Analisis de similitud y deteccion de parafrasis: con 91,93 de Spearman en STS-B y 80,30 en pair classification, es adecuado para comparar versiones de documentos, detectar plagio o agrupar respuestas equivalentes.
- Anotacion asistida y completado de texto (fill-mask): para preetiquetar huecos en corpus, completar plantillas en tareas de anotacion o generar pseudoetiquetas en un pipeline de destilacion.

## Benchmarks y rendimiento

Todos los datos proceden de la model card del autor. NexteraBERT se entrena con 130.000 millones de tokens y ModernBERT-base con 2 billones, y ambos se ajustan y evaluan bajo el mismo protocolo.

| Benchmark | Metrica | NexteraBERT | ModernBERT-base |
|---|---|---:|---:|
| GLUE | media de 8 tareas | 87,90 | 87,97 |
| MTEB v2 (ingles, 41 tareas) | media por tipo de tarea | 54,70 | 53,63 |
| MTEB v2 (ingles, 41 tareas) | media por tarea | 56,77 | 55,40 |
| BEIR (15 conjuntos) | nDCG@10 | 43,89 | 43,09 |
| NanoBEIR (13 subconjuntos) | nDCG@10 | 55,92 | 53,76 |
| CodeSearchNet (CoIR) | nDCG@10 | 57,22 | 56,65 |
| StackOverflowQA | nDCG@10 | 65,71 | 69,20 |
| MultiLongDocRetrieval (MLDR) | nDCG@10 | 36,25 | 31,19 |
| Perdida de token enmascarado, 8.192 -> 65.536 tokens | incremento (menor es mejor) | +3,8 % | +83,0 % |
| Throughput a 65.536 tokens (H200 NVL) | relativo a ModernBERT-base | 5,22x | 1,00x |

Desglose de GLUE (conjuntos de validacion):

| Tarea | Metrica | NexteraBERT | ModernBERT-base |
|---|---|---:|---:|
| CoLA | MCC | 64,64 | 62,63 |
| SST-2 | exactitud | 94,07 | 94,92 |
| MRPC | F1 | 92,81 | 92,58 |
| STS-B | Spearman | 91,93 | 91,98 |
| QQP | exactitud | 91,58 | 91,45 |
| MNLI-m | exactitud | 88,33 | 88,74 |
| QNLI | exactitud | 93,50 | 93,59 |
| RTE | exactitud | 86,35 | 87,87 |
| Media | | 87,90 | 87,97 |

Desglose de MTEB v2 por tipo de tarea (ingles):

| Tipo de tarea | NexteraBERT | ModernBERT-base |
|---|---:|---:|
| Clasificacion | 74,57 | 73,84 |
| Clustering | 43,07 | 42,12 |
| Clasificacion de pares | 80,30 | 79,61 |
| Reranking | 41,81 | 42,02 |
| Retrieval | 29,51 | 26,37 |
| STS | 81,65 | 80,70 |
| Summarization | 32,00 | 30,76 |
| Media (tipos) | 54,70 | 53,63 |
| Media (tareas) | 56,77 | 55,40 |

Detalle de BEIR por conjunto (nDCG@10):

| Conjunto | NexteraBERT | ModernBERT-base |
|---|---:|---:|
| TREC-COVID | 75,53 | 75,05 |
| NFCorpus | 29,29 | 26,00 |
| Natural Questions | 46,61 | 45,84 |
| HotpotQA | 48,51 | 48,74 |
| FiQA-2018 | 31,94 | 30,66 |
| ArguAna | 49,48 | 46,42 |
| Touche-2020 | 24,87 | 23,20 |
| CQADupstack (12 foros) | 31,93 | 32,32 |
| Quora | 86,46 | 86,65 |
| DBPedia | 27,86 | 28,43 |
| SCIDOCS | 14,38 | 13,86 |
| FEVER | 66,25 | 66,59 |
| Climate-FEVER | 23,80 | 22,80 |
| SciFact | 60,71 | 59,97 |
| MS MARCO | 40,73 | 39,85 |
| Media (15 conjuntos) | 43,89 | 43,09 |

Detalle de NanoBEIR por subconjunto (nDCG@10):

| Subconjunto | NexteraBERT | ModernBERT-base |
|---|---:|---:|
| MS MARCO | 63,52 | 58,45 |
| NFCorpus | 31,34 | 24,54 |
| Natural Questions | 57,92 | 60,99 |
| HotpotQA | 65,28 | 62,75 |
| FiQA-2018 | 50,46 | 41,23 |
| ArguAna | 53,10 | 49,45 |
| Touche-2020 | 54,53 | 51,87 |
| Quora | 95,56 | 92,87 |
| DBPedia | 49,66 | 51,01 |
| SCIDOCS | 30,86 | 31,73 |
| FEVER | 79,36 | 80,65 |
| Climate-FEVER | 32,21 | 32,96 |
| SciFact | 63,15 | 60,32 |
| Media (13 subconjuntos) | 55,92 | 53,76 |

Notas metodologicas indicadas en la model card: las puntuaciones de GLUE son medias sobre 5 semillas (MRPC, STS-B, RTE), 4 (CoLA), 3 (SST-2) o 1 (QQP, MNLI, QNLI); MRPC, STS-B, RTE y QNLI parten del encoder ajustado en MNLI. Para MTEB v2, ambos modelos se ajustan con SimCSE supervisado sobre 312.663 tripletas NLI (perdida contrastiva, longitud maxima 64) y se evaluan a longitud maxima 512. Para retrieval, ambos se ajustan sobre MS MARCO (1,25 M de tripletas con un negativo duro, perdida contrastiva, mean pooling); BEIR se evalua a longitud maxima 512 y las tareas de codigo y MLDR a 8.192.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones derivadas del numero de parametros, no datos publicados por el autor.

- Peso del modelo en precision fp32: aproximadamente 850 MB (212,6 M de parametros x 4 bytes). Es la unica precision confirmada de forma implicita por el tamano del repositorio (1,7 GB, que incluye pesos y activos).
- Peso del modelo en fp16/bf16: aproximadamente 425 MB.
- Peso del modelo en int8: aproximadamente 213 MB.
- Peso del modelo en int4: aproximadamente 107 MB.
- A estas cifras hay que anadir activaciones, cuya memoria crece con la longitud de secuencia y el tamano de lote. A 8.192 tokens las activaciones pueden superar con holgura el peso del modelo en fp32; a 65.536 tokens el pico de memoria es la restriccion dominante.
- GPU de consumo: el modelo cabe sin problema en tarjetas con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 3080) para secuencias moderadas. Con 24 GB (RTX 3090, RTX 4090) se pueden usar lotes grandes y longitudes de 8.192 tokens o superiores.
- GPU de centro de datos: A100 (40/80 GB), H100 y H200 NVL. El dato de throughput publicado (5,22x respecto a ModernBERT-base a 65.536 tokens por lote) se midio en H200 NVL, por lo que es el entorno de referencia para cargas de contexto largo.
- Opciones de despliegue confirmadas: transformers con `trust_remote_code=True`, ya que el codigo del modelo (bloques SnowLily, NexteraSWA, NexteraHRA y SSSMax) esta incluido en el repositorio y no forma parte de la libreria estandar. Probado con transformers 5.12 y PyTorch 2.12.
- Otras opciones de despliegue (vLLM, TGI, Ollama, llama.cpp, ONNX Runtime) no estan documentadas en la informacion disponible y requeririan una conversion o una integracion previa del codigo personalizado.
- Latencia y throughput: el unico dato disponible es relativo, no absoluto. A 65.536 tokens y por lote, el modelo alcanza 5,22 veces el throughput de ModernBERT-base en H200 NVL. No se publican cifras absolutas de tokens por segundo ni latencias en milisegundos.

## Comparativa con modelos similares

La model card solo proporciona comparacion directa y bajo protocolo identico con ModernBERT-base. Para modelos como BERT-base, RoBERTa-base o DeBERTa-v3-base no hay datos en la informacion disponible, por lo que sus celdas quedan como no disponible.

| Modelo | Parametros | Longitud de contexto | GLUE (media) | MTEB v2 (media por tipo) | BEIR (nDCG@10) | Tokens de preentrenamiento | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---:|---:|---|---|
| NexteraBERT-Mezzoforte-220M-en | 212,6 M | entrenamiento 8.192; extrapolacion evaluada 65.536 | 87,90 | 54,70 | 43,89 | 130.000 M | MIT | HuggingFace, 94 descargas |
| ModernBERT-base | no disponible | no disponible | 87,97 | 53,63 | 43,09 | 2.000.000 M | no disponible | no disponible en la informacion proporcionada |
| BERT-base / RoBERTa-base / DeBERTa-v3-base | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Conclusiones que si se pueden extraer de los datos disponibles: NexteraBERT iguala a ModernBERT-base en GLUE (diferencia de 0,07 puntos) y lo supera en MTEB v2 (+1,07 en la media por tipo), BEIR (+0,80), NanoBEIR (+2,16) y MLDR (+5,06), usando 15 veces menos tokens de preentrenamiento. ModernBERT-base mantiene ventaja en StackOverflowQA (69,20 frente a 65,71) y en la media de las dos tareas de codigo de CoIR (62,92 frente a 61,46), asi como en reranking de MTEB v2 (42,02 frente a 41,81). La ventaja mas marcada de NexteraBERT es el comportamiento en contexto largo y el coste de inferencia.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles. No se declaran capacidades en castellano ni en otros idiomas; usarlo con texto en espanol daria resultados degradados sin un ajuste especifico.
- Es un encoder bidireccional, no un modelo generativo. No puede usarse para generacion autoregresiva, chat, tool calling ni razonamiento multi-paso; su salida util son logits de token enmascarado y representaciones vectoriales.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de predicciones incorrectas en fill-mask y de falsos positivos o negativos en recuperacion y clasificacion, especialmente fuera del dominio de entrenamiento.
- Sesgos: no se publica ninguna evaluacion de sesgo, toxicidad o equidad. Los corpus de preentrenamiento (fineweb-edu, DCLM, starcoderdata) arrastran los sesgos habituales de datos web, y el autor no documenta mitigaciones.
- Requiere `trust_remote_code=True` y ejecucion de codigo incluido en el repositorio. Esto implica un riesgo de seguridad y de reproducibilidad que conviene auditar antes de desplegarlo en produccion, ya que el codigo no esta integrado en transformers.
- Compatibilidad sujeta a versiones concretas: la model card indica que se ha probado con transformers 5.12 y PyTorch 2.12. Otras versiones pueden no funcionar por depender de codigo personalizado.
- La longitud de entrenamiento es de 8.192 tokens. Aunque la degradacion al extrapolar a 65.536 tokens es pequena (+3,8 % de perdida), sigue existiendo y debe validarse en el dominio concreto de uso.
- Los resultados de MTEB, BEIR y GLUE dependen de un protocolo de ajuste fino concreto (SimCSE supervisado, MS MARCO con un negativo duro, mean pooling). Reproducir esos numeros exige replicar el mismo pipeline.
- El pico de memoria a longitudes muy largas puede ser el factor limitante en GPU de consumo, por encima del tamano de los pesos.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. No se imponen restricciones adicionales conocidas, pero la licencia cubre el artefacto publicado, no necesariamente los corpus de terceros usados en el preentrenamiento.
- Traccion limitada: 94 descargas y 11 likes en el momento de la consulta. No hay un ecosistema amplio de terceros, versiones cuantizadas ni integraciones verificadas, lo que aumenta el coste de soporte en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RikkaBotan/NexteraBERT-Mezzoforte-220M-en
- Paper en el repositorio (PDF): https://huggingface.co/RikkaBotan/NexteraBERT-Mezzoforte-220M-en/blob/main/NexteraBERT.pdf
- Perfil del autor (RikkaBotan): https://huggingface.co/RikkaBotan
- Modelos del autor: https://huggingface.co/RikkaBotan/models
- Listado de modelos con la etiqueta nexterabert: https://huggingface.co/models?other=nexterabert
- Dataset de preentrenamiento (fineweb-edu): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de preentrenamiento (DCLM baseline): https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
- Dataset de preentrenamiento (starcoderdata): https://huggingface.co/datasets/bigcode/starcoderdata
