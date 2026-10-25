# much1na/e5-small-medical-ckpt

## Resumen

much1na/e5-small-medical-ckpt es un modelo de embeddings de frases (sentence transformer) afinado a partir de intfloat/e5-small-unsupervised por el usuario much1na (Ian Muchina). Su funcion es convertir texto en vectores densos de 384 dimensiones para busqueda semantica, similitud textual, minado de parafrasis, clasificacion y clustering, con un enfoque declarado en el dominio medico. El problema que aborda es la recuperacion de informacion en corpus biomedicos, donde los embeddings generalistas rinden peor que los ajustados al dominio.

Arquitectonicamente es un transformer tipo BERT de 33,36 millones de parametros (aproximadamente 33,4M), con una longitud maxima de secuencia de 512 tokens y similitud coseno como metrica de comparacion. El ajuste se realizo sobre el split miriad-4.4_m-split, con un total declarado de 4.467.542 muestras de entrenamiento y la funcion de perdida CachedGISTEmbedLoss, una variante de GISTEmbedLoss que cachea embeddings de documentos para mejorar la eficiencia del contraste negativo guiado por un modelo guia.

Su relevancia actual es limitada pero concreta: se trata de un checkpoint pequeno, desplegable en CPU, que permite montar un pipeline RAG medico sin GPU y con latencia baja. No obstante, es un modelo recien publicado (24 de octubre de 2026) sin descargas ni validacion externa, cuyo unico benchmark declarado procede del propio autor y esta marcado como no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: intfloat/e5-small-unsupervised) |
| Parametros totales | 33.360.000 (33,36M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | no disponible (la model card omite el campo de idioma; el modelo base e5-small-unsupervised es principalmente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

Dimension de salida: 384 dimensiones. Funcion de similitud: coseno. Modalidad: solo texto.

## Arquitectura y entrenamiento

El modelo es un sentence transformer construido sobre intfloat/e5-small-unsupervised, un encoder transformer de tipo BERT con 33,36M de parametros. La arquitectura de embeddings sigue el esquema clasico de Sentence Transformers: pooling sobre las representaciones del encoder para producir un unico vector de 384 dimensiones por entrada, comparado mediante similitud coseno. El modelo base pertenece a la familia E5 de Microsoft (intfloat), disenada originalmente para retrieval y entrenada con objetivos contrastivos.

El ajuste fino se realizo sobre el dataset miriad-4.4_m-split, con 4.467.542 muestras declaradas, empleando CachedGISTEmbedLoss. Esta funcion de perdida es una variante de GISTEmbed, un esquema de entrenamiento contrastivo en el que un modelo guia (guiding model) filtra los negativos en el batch para evitar falsos negativos; la version "cached" almacena los embeddings de los documentos para reducir el coste computacional del reentrenamiento de negativos en cada paso. No se especifican en la informacion disponible el numero total de tokens procesados, la composicion detallada del dataset, ni si hubo fases de RLHF o DPO (no aplicables de forma habitual en modelos de embeddings).

## Capacidades

- Generacion de embeddings de texto: transforma frases y parrafos en vectores densos de 384 dimensiones.
- Similitud textual semantica: compara pares de frases mediante similitud coseno.
- Busqueda semantica y recuperacion de informacion (retrieval) sobre corpus documentales.
- Minado de parafrasis: deteccion de reformulaciones con el mismo significado.
- Clustering y deduplicacion de documentos por similitud de embeddings.
- Clasificacion de texto basada en representaciones vectoriales (con un cabezal externo).
- Ajuste declarado al dominio medico: pares pregunta-respuesta biomedicos (miR-139 en cancer gastrico, hidradenitis suppurativa, odontomas, tuberculosis miliar, etc.) aparecen en los ejemplos de la model card.
- Compatibilidad con text-embeddings-inference y endpoints de HuggingFace (tag `endpoints_compatible`).
- No soporta tool calling, agentes, vision ni audio: es exclusivamente un modelo de embeddings.

## Casos de uso

- RAG sobre literatura biomedica: indexar abstracts de PubMed o guias clinicas como vectores de 384 dimensiones y recuperar los fragmentos relevantes para una pregunta. El ajuste al dominio medico deberia mejorar la precision frente al e5-small generico en vocabulario especializado (farmacos, patologias, genes).
- Busqueda semantica en historiales clinicos internos: permitir que un profesional recupere casos similares describiendo sintomas en lenguaje natural, con un modelo que cabe en CPU y no requiere GPU dedicada.
- Deduplicacion de bases de datos de articulos cientificos: agrupar publicaciones con contenido solapado mediante clustering de embeddings, reduciendo el ruido en revisiones sistematicas.
- Motor de preguntas frecuentes sanitarias: mapear las consultas de pacientes a respuestas predefinidas por similitud coseno, con umbral configurable para derivar a atencion humana cuando la confianza sea baja.
- Clasificacion y triaje de textos clinicos: usar los embeddings como entrada a un clasificador ligero (regresion logistica, SVM) para etiquetar notas por especialidad o nivel de urgencia.
- Enriquecimiento de ontologias medicas: calcular similitud entre terminos de MeSH o SNOMED y detectar equivalentes o relaciones jerarquicas aproximadas.
- Filtrado previo en pipelines de anotacion: descartar documentos irrelevantes antes de pasarlos a un LLM grande, ahorrando coste de inferencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index), sobre el dataset "medical qa dev", tarea de information retrieval. Todos los valores estan marcados como `verified: false`.

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,4829 |
| Cosine Accuracy@3 | 0,6973 |
| Cosine Accuracy@5 | 0,7666 |
| Cosine Accuracy@10 | 0,8301 |
| Cosine Precision@1 | 0,4829 |
| Cosine Precision@3 | 0,2324 |
| Cosine Precision@5 | 0,1533 |
| Cosine Precision@10 | 0,0830 |
| Cosine Recall@1 | 0,4829 |
| Cosine Recall@3 | 0,6973 |
| Cosine Recall@5 | 0,7666 |
| Cosine Recall@10 | 0,8301 |
| Cosine NDCG@10 | 0,6586 |
| Cosine MRR@10 | 0,6033 |
| Cosine MAP@100 | 0,6078 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, BEIR u otros) ni verificacion independiente de estas cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (33,36M de parametros x 4 bytes ≈ 134 MB de pesos, mas activaciones y overhead). En fp16 rondaria los 67 MB de pesos.
- GPU recomendadas: cualquier GPU, incluso integradas. El modelo no necesita GPU; una RTX 4090 o A100 quedarian ampliamente sobredimensionadas para este checkpoint.
- Cabe en GPU consumer: si, en todas las GPU consumer modernas e incluso en CPU. El cuello de botella sera el throughput de tokenizacion y el numero de documentos a indexar, no la memoria.
- Opciones de despliegue: sentence-transformers (libreria nativa), Text Embeddings Inference (TEI, segun el tag `text-embeddings-inference`), endpoints de HuggingFace (tag `endpoints_compatible`), ONNX Runtime para exportacion, y FastAPI o similares envolviendo el pipeline. No se documenta soporte GGUF ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. Como referencia orientativa no verificada, un encoder de 33M en CPU moderna suele procesar cientos de frases por segundo en batches, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Notas |
|---|---|---|---|---|---|
| much1na/e5-small-medical-ckpt | 33,36M | 512 | 384 | no disponible | Ajuste medico sobre e5-small-unsupervised; sin validacion externa |
| intfloat/e5-small-unsupervised | ~33M | 512 | 384 | MIT (modelo base) | Modelo de partida; sin ajuste al dominio medico |
| intfloat/multilingual-e5-small | ~118M | 512 | 384 | MIT | Variante multilingue (100 idiomas); mas pesada y sin especializacion medica |
| Sentence-transformers/all-MiniLM-L6-v2 | ~22,7M | 256 | 384 | Apache 2.0 | Alternativa ligera muy extendida; dominio generalista y contexto menor |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada. Las licencias del modelo base y de los comparadores se indican a titulo informativo y no implican necesariamente que este derivado conserve la misma licencia.

## Limitaciones y advertencias

- Licencia no declarada: el campo de licencia esta vacio, lo que impide determinar si el uso comercial esta permitido. Contactar con el autor antes de integrarlo en produccion.
- Sin validacion independiente: cero descargas, cero likes, benchmarks marcados como no verificados y generados por el propio autor. El rendimiento real en dominios distintos puede diferir.
- Idioma no declarado: la model card omite el campo de idioma. El modelo base e5-small-unsupervised esta orientado al ingles; el rendimiento en castellano no esta garantizado y deberia evaluarse antes de usarlo en corpus en espanol.
- Contexto limitado a 512 tokens: no admite documentos largos sin troceado previo, lo que exige un pipeline de chunking bien disenado.
- Riesgo de alucinacion: bajo en sentido estricto (no genera texto), pero existe riesgo de recuperar pasajes irrelevantes con alta puntuacion de similitud si el corpus contiene vocabulario solapado.
- Sesgos: al estar entrenado sobre el dataset miriad-4.4_m-split, puede heredar sesgos de representacion de la literatura biomedica disponible (infrarrepresentacion de enfermedades raras, poblaciones no occidentales o terminologia en idiomas distintos del ingles).
- Ambito estrictamente medico declarado: usarlo fuera de ese dominio (legal, financiero, codigo) probablemente ofrezca peor rendimiento que un embedding generalista de similar tamano.
- Precision@k decreciente con k: la precision cae de 0,48 en k=1 a 0,083 en k=10, lo que sugiere que el ranking se degrada rapidamente en recuperacion de multiples documentos.
- Nombre "ckpt" en el identificador: puede tratarse de un checkpoint intermedio de entrenamiento y no de un modelo final pulido; no hay confirmacion en la informacion disponible.
- Repo de 6,8 GB para un modelo de 33M de parametros: el tamano desproporcionado sugiere la presencia de artefactos de entrenamiento (optimizador, checkpoints) que conviene revisar antes de descargar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/much1na/e5-small-medical-ckpt
- Modelo base: https://huggingface.co/intfloat/e5-small-unsupervised
- Perfil del autor: https://huggingface.co/much1na/datasets
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/UKPLab/sentence-transformers
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Variante multilingue de referencia: https://huggingface.co/intfloat/multilingual-e5-small
- Guia de despliegue de multilingual-e5-small (referencia de self-hosting): https://llmapi.ai/models/intfloat-multilingual-e5-small/
- Repositorio MedicalModelLibrary: https://github.com/ExpertOpsAI/MedicalModelLibrary/
