# Ehsanl/bidir1_7

## Resumen

Ehsanl/bidir1_7 es un modelo de representaciones densas (embeddings) publicado en HuggingFace por el usuario Ehsanl, construido como un fine-tune de BidirLM/BidirLM-1.7B-Embedding mediante la librería sentence-transformers. El modelo está etiquetado para las tareas de similitud semántica (sentence-similarity) y extracción de características (feature-extraction), y su propósito es transformar texto en vectores densos comparables mediante similitud coseno. Cuenta con 1.720.574.976 parámetros (aproximadamente 1,72 mil millones), lo que lo sitúa en la gama de modelos de embeddings de tamano medio-grande.

El entrenamiento se realizó con 1.045.580 ejemplos y combinó dos funciones de pérdida: WeightedMultiPositiveCachedLoss y MultipleNegativesRankingLoss, ambas habituales en el ajuste de modelos de recuperación con negativos en lote. El modelo base pertenece a la familia BidirLM, etiquetada como "bidirlm", lo que sugiere una arquitectura de codificador bidireccional, si bien la model card no detalla la arquitectura interna ni la longitud de contexto soportada.

La relevancia de este modelo es limitada y hay que ser honesto al respecto: registra 7 descargas y 0 "likes" desde su publicación, no declara licencia, no especifica idiomas soportados y el acceso está restringido (gated), de modo que requiere aceptar condiciones en HuggingFace antes de descargar los pesos. Su interés practico se concentra en la recuperación de documentos en dominio legal, unico ambito para el que el autor ha publicado métricas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (etiqueta "bidirlm" y modelo base BidirLM/BidirLM-1.7B-Embedding; detalles internos no publicados) |
| Parámetros totales | 1.720.574.976 (aprox. 1,72 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se documentan versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (formato sentence-transformers) |
| Modelo base | BidirLM/BidirLM-1.7B-Embedding |
| Tipo de modelo | Embedding denso (encoder) para similitud semántica |
| Pérdidas de entrenamiento | WeightedMultiPositiveCachedLoss, MultipleNegativesRankingLoss |
| Tamano del dataset de entrenamiento | 1.045.580 ejemplos |
| Tamano del repositorio | 123,9 GB |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 7 / 0 |
| Fecha de creación | 2026-09-28 |
| Última actualización | 2026-10-07 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. La etiqueta "bidirlm" y el nombre del modelo base (BidirLM-1.7B-Embedding) apuntan a un codificador bidireccional orientado a la generacion de embeddings, integrado en el ecosistema sentence-transformers. No se especifican el numero de capas, la dimension oculta, el numero de cabezas de atencion ni la longitud maxima de secuencia. El repositorio incluye la etiqueta `custom_code`, lo que indica que la carga del modelo requiere codigo propio del autor y no solo los pesos estandar.

En cuanto al entrenamiento, la model card solo declara dos elementos: el volumen de datos (1.045.580 ejemplos) y las funciones de perdida empleadas (WeightedMultiPositiveCachedLoss y MultipleNegativesRankingLoss). Ambas son perdidas contrastivas basadas en negativos en lote, tipicas del ajuste de modelos de recuperacion densa; MultipleNegativesRankingLoss es el estandar de facto en sentence-transformers para este tipo de tareas. No se documentan la composicion del dataset, el numero de tokens vistos, la existencia de fases de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card cita tres referencias de arXiv en sus etiquetas (1908.10084, 2101.06983 y 1807.03748) sin explicar su papel concreto en el desarrollo del modelo.

## Capacidades

- Generacion de embeddings densos de frases y documentos para similitud semántica y recuperación de informacion.
- Recuperacion densa (dense retrieval) con ranking por similitud coseno, segun la tarea "rank-zero-ir" evaluada.
- Extraccion de caracteristicas (feature-extraction) para uso como codificador en pipelines posteriores.
- Ajuste fino adicional sobre un modelo de embeddings preentrenado (generated_from_trainer), orientado a un dominio concreto.
- Compatibilidad declarada con endpoints de HuggingFace (etiqueta `endpoints_compatible`).
- Soporte de integracion con la libreria sentence-transformers.
- No hay evidencia de soporte de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles (no se declaran idiomas).

## Casos de uso

- Recuperacion de documentos legales: el unico ambito con metricas publicadas es el benchmark de validacion legal. El modelo puede indexar un corpus juridico y devolver, para cada consulta, los pasajes mas similares por coseno, con una precision@1 de 0,412 y un recall@10 de 0,569 en dicho conjunto.
- Busqueda semantica en bases documentales internas: al tratarse de un modelo de embeddings de 1,72 B de parametros, permite indexar grandes volumenes de texto y responder consultas en lenguaje natural sin coincidencia literal de terminos.
- Generacion aumentada por recuperacion (RAG): los embeddings pueden alimentar la fase de recuperacion de un sistema RAG, seleccionando fragmentos relevantes antes de pasarlos a un modelo generativo.
- Deduplicacion y deteccion de near-duplicates: mediante similitud coseno entre embeddings se pueden identificar documentos o fragmentos casi identicos en un corpus grande.
- Clustering tematico de documentos: agrupar noticias, tickets de soporte o expedientes por similitud semantica para tareas de organizacion y analisis exploratorio.
- Clasificacion zero-shot por similitud: comparar la representacion de un texto con la de etiquetas descriptivas para asignar categorias sin entrenamiento especifico.
- Recomendacion de contenido: representar elementos de un catalogo y las preferencias de un usuario como vectores para ordenar candidatos por afinidad semantica.
- Evaluacion de similitud entre pares de textos: comparacion de respuestas, resumenes o traducciones frente a referencias.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (todos con `verified: false`, es decir, no verificados de forma independiente). Corresponden a la tarea "Rank Zero IR" sobre el conjunto de validación legal ("legal val"):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Rank Zero IR | legal val | Cosine Accuracy@1 | 0,412 |
| Rank Zero IR | legal val | Cosine Accuracy@5 | 0,724 |
| Rank Zero IR | legal val | Cosine Accuracy@10 | 0,790 |
| Rank Zero IR | legal val | Cosine Precision@1 | 0,412 |
| Rank Zero IR | legal val | Cosine Precision@10 | 0,1334 |
| Rank Zero IR | legal val | Cosine Recall@1 | 0,2273 |
| Rank Zero IR | legal val | Cosine Recall@10 | 0,5691 |
| Rank Zero IR | legal val | Cosine NDCG@10 | 0,4666 |
| Rank Zero IR | legal val | Cosine MRR@10 | 0,5419 |
| Rank Zero IR | legal val | Cosine MAP@100 | 0,3844 |

No se han publicado en la informacion disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos de embeddings.

## Requisitos de hardware

- El modelo tiene 1,72 B de parámetros. En precision fp16 los pesos ocupan aproximadamente 3,4 GB; en bf16, un valor similar.
- La VRAM estimada para inferencia se sitúa en torno a 4-6 GB si se cargan los pesos completos en memoria con lotes pequenos, aunque no hay cifras oficiales publicadas.
- Cabe en GPU de consumo: tarjetas con 8 GB o mas de VRAM (por ejemplo, RTX 3060 de 12 GB, RTX 3070, RTX 3080, RTX 4070, RTX 4080, RTX 4090) deberian poder alojarlo en fp16 con lotes moderados. En tarjetas de 6-8 GB puede ser necesario reducir el tamano de lote.
- Para GPU de centro de datos, modelos como A100, H100 o L40S permiten lotes grandes y mayor throughput.
- Opciones de despliegue: sentence-transformers (libreria declarada), HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`), y potencialmente vLLM o Text Embeddings Inference para servir embeddings, aunque no se documenta compatibilidad explicita con estas herramientas.
- No se publican datos de latencia ni de throughput. Como referencia orientativa no verificada, un codificador de 1,7 B en una GPU moderna suele procesar cientos de textos por segundo con lotes medios, pero este dato no procede de la informacion disponible y debe tratarse como estimacion, no como cifra oficial.
- El repositorio ocupa 123,9 GB, muy por encima del tamano de los pesos del modelo, lo que sugiere la presencia de multiples checkpoints, estados del optimizador o artefactos de entrenamiento. Hay que tenerlo en cuenta para el espacio en disco durante la descarga.

## Comparativa con modelos similares

No hay datos comparativos publicados en la informacion disponible. La unica referencia directa es el modelo base sobre el que se ha ajustado, del cual no se dispone de metricas en la informacion proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Ehsanl/bidir1_7 | 1,72 B | No disponible | No disponible | Accuracy@1 0,412 en legal val | Gated (acceso restringido) |
| BidirLM/BidirLM-1.7B-Embedding (base) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |
| Otros modelos de embeddings comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos sobre alternativas de la misma categoria (por ejemplo, modelos de embeddings de tamano similar) que permitan una comparacion rigurosa. El numero de descargas (7) y de likes (0) indica ademas que la adopcion publica del modelo es practicamente nula, por lo que no existen evaluaciones de terceros.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda en un limbo juridico: no hay autorizacion explicita ni condiciones conocidas.
- El acceso esta restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar los pesos, lo que complica la automatizacion de despliegues.
- No se especifican los idiomas soportados. El rendimiento fuera del ambito en el que fue ajustado es desconocido.
- Las unicas metricas disponibles son las declaradas por el propio autor y estan marcadas como no verificadas (`verified: false`).
- El benchmark publicado se limita al dominio legal, de modo que el rendimiento en otros dominios (medicina, codigo, conversacion general) es una incognita y probablemente inferior.
- Al ser un modelo de embeddings, no genera texto: no puede usarse directamente para tareas de generacion, resumen o dialogo, solo para representar y comparar textos.
- No se documenta la longitud maxima de contexto del modelo, lo que impide saber como se comporta con documentos largos ni si trunca entradas.
- No hay informacion sobre sesgos, contaminacion del dataset de entrenamiento ni evaluacion de robustez.
- La custion de alucinacion no aplica en el sentido generativo (el modelo no produce texto libre), pero si existe riesgo de recuperaciones irrelevantes o falsos positivos en similitud, especialmente en dominios alejados del entrenamiento.
- El elevado tamano del repositorio (123,9 GB) puede encarecer el almacenamiento y la transferencia en entornos de produccion.
- El uso de `custom_code` implica que la carga requiere codigo especifico del autor, lo que anade un riesgo de mantenimiento y de dependencia de codigo no auditado.
- No se recomienda su uso en produccion critica sin una evaluacion propia: con 7 descargas no existe base empirica de terceros sobre su fiabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ehsanl/bidir1_7
- Modelo base: https://huggingface.co/BidirLM/BidirLM-1.7B-Embedding
- Referencia arXiv 1908.10084 (Sentence-BERT): https://arxiv.org/abs/1908.10084
- Referencia arXiv 2101.06983: https://arxiv.org/abs/2101.06983
- Referencia arXiv 1807.03748: https://arxiv.org/abs/1807.03748
