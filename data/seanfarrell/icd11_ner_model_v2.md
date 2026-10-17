# seanfarrell/icd11_ner_model_v2

## Resumen

`seanfarrell/icd11_ner_model_v2` es un modelo de embeddings de frases (*sentence transformer*) desarrollado por el usuario Sean Farrell, afinado a partir de `abhinand/MedEmbed-small-v0.1`. A pesar del sufijo "ner" en su nombre, no es un modelo de reconocimiento de entidades por token (token classification): es un codificador denso que proyecta términos y frases cortas a un espacio vectorial de 384 dimensiones con similitud coseno, pensado para hacer recuperación semántica de candidatos dentro de un pipeline de enlazado de entidades clínicas a la terminología ICD-11 (CIE-11).

El modelo resuelve un problema muy concreto: dado un texto libre de diagnóstico o una entidad clínica extraída previamente, encontrar la etiqueta ICD-11 correcta entre miles de códigos. Para ello se ha entrenado con `MultipleNegativesRankingLoss`, una función de pérdida típica de recuperación densa que aprende a acercar consultas y descripciones equivalentes frente a negativos del propio lote. Según la etiqueta `dataset_size` de la model card, el entrenamiento usó 8.089.600 unidades (el autor no aclara si son pares, muestras o tokens).

Técnicamente es un modelo muy pequeño: 33.360.000 parámetros (un BERT "small" con pooling CLS y normalización L2), 384 dimensiones de salida y un máximo de 30 tokens de secuencia. Esa ventana tan corta y el hecho de que la licencia y los idiomas no estén declarados lo sitúan como una pieza experimental dentro de un pipeline mayor, no como un componente listo para producción clínica. Su interés actual es como ejemplo de ajuste fino de un modelo médico pequeño para *entity linking* sobre ICD-11, una tarea con muy pocos recursos públicos y de gran relevancia para la codificación sanitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (`BertModel`) + pooling CLS + normalización L2, empaquetado como `SentenceTransformer` |
| Parametros totales | 33.360.000 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 30 tokens (máximo de secuencia declarado en la model card) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF/int8; al ser un modelo de 33 M de parámetros es viable cuantizarlo por cuenta propia con ONNX Runtime u Optimum) |
| Idiomas soportados | no disponible (los ejemplos de la model card están en inglés y usan terminología ICD-11 en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 0,1 GB), cargable con `sentence-transformers` |
| Dimension de embeddings | 384 |
| Funcion de similitud | coseno |
| Pooling | CLS (`pooling_mode: cls`, `include_prompt: True`) |
| Funcion de perdida | `MultipleNegativesRankingLoss` |
| Pipeline declarado | `sentence-similarity` / `feature-extraction` |
| Compatibilidad de despliegue | `text-embeddings-inference`, `endpoints_compatible` |

## Arquitectura y entrenamiento

La arquitectura es la de un `SentenceTransformer` de tres modulos: un codificador `BertModel` en tarea de `feature-extraction` que devuelve `last_hidden_state`; un modulo de pooling que toma el token CLS y produce un vector de 384 dimensiones; y una capa de normalización final. La similitud entre consulta y documento se calcula con producto escalar sobre vectores normalizados, equivalente a similitud coseno. El modelo base, `abhinand/MedEmbed-small-v0.1`, pertenece a la familia MedEmbed, orientada a terminología biomédica; el ajuste se realizó sobre la revisión `40a5850d046cfdb56154e332b4d7099b63e8d50e` del mismo.

El entrenamiento emplea `MultipleNegativesRankingLoss`, que optimiza un objetivo de recuperación contrastiva usando los demás positivos del lote como negativos implícitos. La etiqueta `dataset_size:8089600` sugiere un volumen considerable de pares, aunque no se documenta la composición del corpus, el número de tokens procesados, si hubo filtrado de negativos duros ni si se aplicaron etapas posteriores de RLHF/DPO (poco habituales en modelos de embeddings). Tampoco se detalla el preprocesado: la ventana de 30 tokens apunta a un truncado agresivo coherente con etiquetas cortas de ICD-11, pero impide codificar descripciones clínicas más largas. No se declaran innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.); se trata de un ajuste fino estándar de recuperación densa.

## Capacidades

- Generación de embeddings de frases y términos cortos en un espacio de 384 dimensiones, con similitud coseno.
- Recuperación semántica de candidatos (*dense retrieval*) sobre catálogos de etiquetas ICD-11.
- Similitud textual semántica entre una consulta clínica y descripciones de enfermedades.
- *Paraphrase mining* y detección de sinónimos entre denominaciones clínicas (por ejemplo, "molluscum contagiosum" frente a "water warts").
- Clustering y agrupación de términos diagnósticos en el espacio de embeddings.
- Uso como extractor de características congeladas para clasificadores posteriores sobre texto médico corto.
- Soporte de `encode_query` / `encode_document` en `sentence-transformers`, lo que permite distinguir consultas y documentos en el pipeline.
- Compatible con Text Embeddings Inference (TEI) y con el tag `endpoints_compatible` de Hugging Face.
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*: es un codificador, no un modelo generativo.

## Casos de uso

- **Normalización de diagnósticos a códigos ICD-11 (entity linking)**: tras un NER que extraiga la entidad "hypoxic ischaemic encephalopathy", el modelo genera el embedding de la mención y recupera los k códigos ICD-11 más próximos del índice; con `cosine_accuracy@10` de 0,869 en el conjunto de validación declarado, sirve como generador de candidatos para un reordenador posterior.
- **Codificación asistida de informes de alta**: en un flujo de codificación clínica, el codificador propone los cinco códigos más probables para cada diagnóstico listado en el informe y el profesional selecciona; el bajo coste computacional (33 M de parámetros) permite ejecutarlo en el propio servidor del hospital sin GPU dedicada.
- **Búsqueda semántica sobre el catálogo ICD-11**: indexar las ~17.000 entidades de la clasificación en FAISS o hnswlib con vectores de 384 dimensiones (aproximadamente 26 MB en float32 para todo el índice) y ofrecer búsqueda por lenguaje natural a codificadores no técnicos.
- **Deduplicación de catálogos y diccionarios clínicos**: agrupar variantes de un mismo concepto ("water warts", "molluscum contagiosum") detectando pares con similitud coseno superior a un umbral, útil al integrar terminologías de distintos proveedores.
- **Auditoría de calidad de codificación**: comparar el embedding del texto original del episodio con el de la etiqueta del código asignado y marcar discrepancias por debajo de un umbral para revisión manual.
- **Minería de datos de entrenamiento**: usar el modelo para generar pares positivos por vecindad semántica y ampliar conjuntos de datos de enlazado de entidades médicas, una tarea con escasez de corpus anotados en castellano.
- **Filtrado previo en pipelines NER**: reducir el espacio de búsqueda de un clasificador costoso descartando primero los códigos con similitud muy baja, dado el reducido coste de inferencia del modelo.
- **Prototipado rápido de asistentes de codificación**: integrarlo en un *notebook* o API interna para validar la viabilidad de un sistema de codificación automática antes de invertir en modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`model-index`), tarea *information retrieval* sobre el conjunto `icd11 val`. Ninguno de los valores está verificado (`verified: false`).

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,7649 |
| Cosine Accuracy@5 | 0,8421 |
| Cosine Accuracy@10 | 0,8690 |
| Cosine Precision@1 | 0,7649 |
| Cosine Precision@3 | 0,6776 |
| Cosine Precision@5 | 0,5796 |
| Cosine Precision@10 | 0,4270 |
| Cosine Recall@1 | 0,1662 |
| Cosine Recall@3 | 0,4103 |
| Cosine Recall@5 | 0,5203 |
| Cosine Recall@10 | 0,6468 |
| Cosine NDCG@10 | 0,7242 |
| Cosine MRR@10 | 0,7982 |
| Cosine MAP@10 | 0,6694 |

Lectura de los datos: el MRR@10 de 0,798 y el accuracy@1 de 0,765 indican que el primer resultado suele ser correcto cuando hay una única respuesta válida, mientras que el recall@10 de 0,647 sugiere que el conjunto de validación es multietiqueta (varios códigos aceptables por consulta) o que una parte de las consultas no se recupera en el top-10. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generativos, y no procede aplicarlos a un modelo de embeddings.

## Requisitos de hardware

- **VRAM estimada para inferencia**: prácticamente despreciable. En float32 los pesos ocupan unos 133 MB; en float16, unos 67 MB; en int8, unos 33 MB. El repositorio completo pesa 0,1 GB.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de memoria libre. Funciona sin problemas en RTX 3060, RTX 4060, RTX 4090, A100, H100 o T4; en la práctica no se necesita GPU dedicada.
- **CPU**: viable en exclusiva. Con 33 M de parámetros y secuencias de 30 tokens, la codificación por lote en CPU es suficiente para volúmenes moderados; también funciona en Apple Silicon vía MPS, en Raspberry Pi 4/5 y en entornos *serverless* con poca memoria.
- **Opciones de despliegue**: `sentence-transformers` (vía `SentenceTransformer`), Hugging Face Text Embeddings Inference (etiqueta `text-embeddings-inference`), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), exportación a ONNX con Optimum y ejecución con ONNX Runtime o FastEmbed. `llama.cpp`, Ollama y los formatos GGUF no están soportados en el repositorio al no publicarse pesos convertidos; vLLM es posible en modo *embeddings* pero innecesario para este tamaño.
- **Latencia y throughput**: no disponible (no se publican mediciones). Como referencia estructural, la ventana de 30 tokens mantiene el coste por secuencia muy bajo, pero conviene medirlo en el hardware objetivo antes de dimensionar un servicio.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto maximo | Licencia | Rendimiento en icd11 val |
|---|---|---|---|---|---|
| `seanfarrell/icd11_ner_model_v2` | 33,36 M | 384 | 30 tokens | no disponible | accuracy@1 0,7649; MRR@10 0,7982 |
| `abhinand/MedEmbed-small-v0.1` (modelo base) | no disponible (familia "small") | 384 | no disponible | no disponible | no evaluado en este conjunto |
| `sentence-transformers/all-MiniLM-L6-v2` | 22,7 M | 384 | 256 tokens | Apache-2.0 | no evaluado en este conjunto |
| `NeuML/pubmedbert-base-embeddings` | 110 M (aprox.) | 768 | 512 tokens | Apache-2.0 (según el autor) | no evaluado en este conjunto |

La comparación relevante es frente al modelo base: este ajuste existe precisamente para mejorar la recuperación sobre terminología ICD-11, pero el autor no publica la métrica del base en el mismo conjunto, por lo que no es posible cuantificar la ganancia. Frente a `all-MiniLM-L6-v2`, la diferencia principal es la ventana de contexto (30 frente a 256 tokens) y la especialización médica; frente a `pubmedbert-base-embeddings`, este modelo es tres veces más pequeño y con la mitad de dimensiones, lo que abarata el índice a costa de capacidad de representación. Los datos de parámetros, dimensiones y licencia de los modelos alternativos provienen de sus fichas públicas; el rendimiento comparado en `icd11 val` no está disponible.

## Limitaciones y advertencias

- **Licencia no declarada**: la model card no indica licencia ni para el modelo ni para el modelo base. Sin una licencia explícita no hay autorización clara de uso comercial; hay que contactar con el autor antes de integrarlo en un producto.
- **Ventana de contexto de 30 tokens**: insuficiente para párrafos, informes o descripciones clínicas largas. Solo es adecuado para términos y etiquetas cortas; cualquier texto mayor se truncará y perderá información.
- **Idiomas no declarados**: los ejemplos y la terminología del conjunto de validación están en inglés. No hay evidencia de rendimiento en castellano ni en las denominaciones de CIE-11 en español, lo que exige una evaluación propia antes de usarlo en un contexto sanitario español.
- **El nombre induce a error**: "ner" sugiere reconocimiento de entidades con spans, pero el pipeline real es `sentence-similarity`. No detecta entidades ni devuelve offsets; necesita un NER previo.
- **Métricas sin verificar**: los 14 valores del `model-index` están marcados como `verified: false` y no se publica el código de evaluación ni el tamaño del conjunto `icd11 val`. Los resultados deben tomarse como indicativos.
- **Falsos positivos por similitud superficial**: el propio widget muestra el riesgo; "contusion of heart" y "contusion of heart without haemopericardium" son códigos distintos y semánticamente casi idénticos. Un umbral de similitud alto no distingue matices de exclusión ("without", "in diseases classified elsewhere").
- **Recall limitado**: recall@10 de 0,647 implica que en aproximadamente un tercio de los casos el código correcto no aparece entre los diez primeros; el modelo sirve como generador de candidatos, no como decisor final.
- **Sesgos**: no documentados. Al derivar de un corpus médico en inglés, puede infrarrepresentar terminología de otras regiones, variantes ortográficas (británica frente a americana) y enfermedades con menor presencia en la literatura.
- **Sin garantía clínica**: no es un dispositivo médico ni está validado clínicamente; cualquier uso en codificación real debe contar con supervisión de codificadores profesionales.
- **Madurez del proyecto**: 14 descargas y 0 *likes* en el momento de la consulta, sin issues ni discusión pública. La fecha de creación declarada (2026-10-17) resulta inconsistente con el resto de metadatos, lo que apunta a posibles errores de publicación.
- **Riesgo de alucinación**: no aplica en sentido generativo (no produce texto), pero sí el riesgo de asignar un código plausible y erróneo cuando el término consultado no existe en el catálogo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seanfarrell/icd11_ner_model_v2
- Modelo base `abhinand/MedEmbed-small-v0.1`: https://huggingface.co/abhinand/MedEmbed-small-v0.1
- Modelo relacionado (token classification) `seanfarrell/icd11_ner_model`: https://huggingface.co/seanfarrell/icd11_ner_model
- Modelo relacionado `seanfarrell/icd11_ner_model_base`: https://huggingface.co/seanfarrell/icd11_ner_model_base
- Perfil del autor en Hugging Face: https://huggingface.co/seanfarrell/datasets
- Documentación de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Ficha de registro en free2aitools: https://free2aitools.com/model/seanfarrell/icd11_ner_model
- Proyecto NER-in-ICD-11 (notebook de referencia): https://github.com/RuamSaleh/NER-in-ICD-11/blob/main/ICDinNER.ipynb
- Paper etiquetado en el repositorio (Sentence-BERT, arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper etiquetado en el repositorio (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
