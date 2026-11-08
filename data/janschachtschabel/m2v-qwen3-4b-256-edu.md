# JanSchachtschabel/m2v-qwen3-4b-256-edu

## Resumen

m2v-qwen3-4b-256-edu es un modelo de embeddings estaticos (static embeddings) para contenido educativo en aleman, desarrollado por JanSchachtschabel y publicado bajo licencia Apache 2.0. Se construye destilando el modelo denso Qwen/Qwen3-Embedding-4B mediante la tecnica Model2Vec de MinishLab, que sustituye el transformer completo por una tabla de vectores por token y una operacion de pooling, reduciendo el coste de inferencia a una simple busqueda en tabla. El resultado es un modelo de 122.707.200 parametros y 256 dimensiones de embedding, almacenado en safetensors (0,3 GB), que genera embeddings sin GPU y con latencia de microsegundos.

El modelo esta especializado en recuperacion semantica sobre materiales educativos alemanes: titulos, descripciones, palabras clave, textos completos, preguntas, respuestas y metadatos didacticos. Se ha afinado sobre el dataset sintetico JanSchachtschabel/synthetic-german-educational-materials-50k (50.000 registros, CC BY 4.0) generado por un LLM, complementado con una lista de 24.667 terminos clave. Su proposito es servir como motor de busqueda y similitud en plataformas de aprendizaje, catalogos de recursos didacticos y sistemas de recomendacion de contenido, donde un modelo denso de 4B resultaria prohibitivo en coste o latencia.

Es relevante ahora porque demuestra que la destilacion Model2Vec permite retener buena parte de la calidad de recuperacion de un teacher de 4B en un modelo estatico desplegable en CPU, con un vocabulario ampliado de 249.072 entradas que cubre formas flexionadas, lemas y variantes en minuscula del aleman educativo. No obstante, los resultados de evaluacion publicados muestran que un modelo previo del mismo autor (m2v-gte-256-edu-v2) supera a este en la mayoria de metricas, lo que conviene tener en cuenta al seleccionarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Model2Vec (embeddings estaticos: tabla de vectores por token + pooling, sin transformer en inferencia) |
| Parametros totales | 122.707.200 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo estatico sin ventana de atencion; procesa texto token a token) |
| Tipos de cuantizacion | float16 (indicado en la model card); no se documentan otras variantes |
| Idiomas soportados | aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria model2vec) |

## Arquitectura y entrenamiento

El modelo es un Model2Vec: un modelo de embeddings estaticos derivado de un teacher transformer mediante destilacion de token embeddings. Cada token del vocabulario tiene asociado un vector aprendido y el embedding de un texto se obtiene combinando los vectores de sus tokens (pooling), sin capas de atencion ni paso por un transformer. La dimensionalidad de salida es 256 y los pesos se almacenan en float16. El vocabulario final contiene 479.325 tokens, de los cuales 249.072 son entradas anadidas al tokenizador del teacher (palabras con al menos 5 ocurrencias en el corpus, sus formas base y variantes en minuscula, hasta un maximo de 250.000).

El entrenamiento consta de dos fases sobre el dataset sintetico de 50.000 documentos educativos alemanes (47.452 documentos de entrenamiento y 2.548 reservados para test, separados por titulo y descripcion para evitar fugas). En la fase Tokenlearn se usan 553.109 ejemplos (500.000 textos de documento mas los terminos de la lista de palabras clave); los objetivos son los embeddings del teacher Qwen3-Embedding-4B sobre los textos originales, y el 50% de las entradas se reducen a formas base nominales para que el modelo funcione con ambas variantes morfologicas. En la fase de ajuste fino por pares se emplean 500.000 pares con perdida contrastiva y negativos in-batch, construidos a partir de relaciones titulo-descripcion, palabra clave-documento, pregunta-documento, pregunta-respuesta y metadatos. No se usaron los campos de sector educativo, tipo de texto, formato mediatico, funcion didactica, tiempo de trabajo ni tipos de pregunta.

## Capacidades

- Generacion de embeddings de frases y documentos en aleman con 256 dimensiones, aptos para similitud semantica y recuperacion (pipeline sentence-similarity).
- Recuperacion de documentos educativos a partir de palabras clave, titulos, preguntas o descripciones.
- Funcionamiento tanto sobre texto en bruto como sobre formas base nominales (por ejemplo, "Bruche kurzen" -> "Bruch"), gracias al entrenamiento mixto con un 50% de entradas lematizadas.
- Cobertura de vocabulario ampliada con formas flexionadas, lemas y variantes en minuscula propias del dominio educativo aleman.
- Clasificacion de materia (subject) mediante sonda de regresion logistica sobre los embeddings (macro F1 de 0,715 en texto bruto y 0,736 en lematizado).
- Inferencia en CPU sin GPU, con coste por consulta muy inferior al de un transformer denso.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: es exclusivamente un codificador de embeddings.

## Casos de uso

- Busqueda semantica en plataformas educativas: indexar el catalogo de recursos didacticos con este modelo y resolver consultas de alumnos y docentes por similitud de embeddings, con latencia de microsegundos por consulta al ser un modelo estatico.
- Recomendacion de materiales por palabras clave: dado un termino como "Bruchrechnung", recuperar los documentos etiquetados con el (ndcg@10 de 0,494 en texto bruto), adecuado para motores de recomendacion de contenido curricular.
- Deduplicacion y agrupacion de recursos: calcular similitud entre titulos y descripciones para detectar materiales duplicados o casi duplicados en un repositorio, aprovechando el MRR@10 de 0,631 en la tarea titulo-descripcion.
- Enrutado de preguntas a documentos: usar el modelo para mapear preguntas de estudiantes al material que las responde (MRR@10 de 0,416), como primera etapa de un sistema de preguntas frecuentes o de un RAG ligero sobre contenidos educativos.
- Etiquetado automatico de materia: entrenar una sonda de clasificacion sobre los embeddings para asignar la asignatura de un recurso (macro F1 de 0,715), util en pipelines de catalogacion de repositorios como OpenEduHub.
- Filtrado y pre-seleccion en CPU: desplegar el modelo en entornos sin GPU (servidores modestos, edge) como etapa de recuperacion previa a un reranker mas costoso, reduciendo el numero de candidatos antes de la fase densa.
- Normalizacion morfologica en busquedas: procesar consultas en formas base nominales para mejorar la recuperacion de variantes en minuscula (ndcg@10 de 0,476 frente a 0,379 en texto bruto), util en interfaces de busqueda en aleman con flexibilidad morfologica.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de test reservado (2.548 documentos). "raw" usa el texto sin cambios; "lemma" reduce consultas y documentos a formas base nominales.

| Modelo | Entrada | keyword_ndcg@10 | keyword_recall@10 | keyword_lower_ndcg@10 | title_mrr@10 | title_recall@10 | question_mrr@10 | subject_macro_f1 |
|---|---|---|---|---|---|---|---|---|
| este modelo | raw | 0,494 | 0,576 | 0,379 | 0,631 | 0,885 | 0,416 | 0,715 |
| este modelo | lemma | 0,480 | 0,563 | 0,476 | 0,588 | 0,851 | 0,391 | 0,736 |
| tfidf | raw | 0,463 | 0,469 | 0,463 | 0,646 | 0,825 | 0,385 | 0,794 |
| tfidf | lemma | 0,517 | 0,533 | 0,517 | 0,619 | 0,820 | 0,459 | 0,810 |
| m2v-gte-256-edu-v2 | raw | 0,533 | 0,616 | 0,415 | 0,701 | 0,950 | 0,432 | 0,726 |
| m2v-gte-256-edu-v2 | lemma | 0,523 | 0,599 | 0,519 | 0,670 | 0,920 | 0,452 | 0,708 |
| potion-multilingual-128M | raw | 0,385 | 0,463 | 0,334 | 0,602 | 0,876 | 0,329 | 0,681 |
| potion-multilingual-128M | lemma | 0,394 | 0,479 | 0,393 | 0,569 | 0,857 | 0,349 | 0,656 |

## Requisitos de hardware

- VRAM estimada: 0 GB en GPU; el modelo pesa 0,3 GB en disco (float16) y puede ejecutarse integramente en CPU y RAM.
- GPU recomendadas: no requiere GPU. Cualquier GPU (RTX 4090, A100, H100) solo aportaria ventaja marginal; el cuello de botella es la memoria y el ancho de banda, no el computo.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el requisito practico es disponer de al menos unos cientos de MB de RAM.
- Opciones de despliegue: libreria `model2vec` (`StaticModel.from_pretrained`) y `sentence-transformers` como interfaces principales; al ser un modelo estatico no necesita vLLM, TGI ni llama.cpp, aunque puede integrarse en pipelines de recuperacion que usen esos servidores para otras etapas.
- Latencia y throughput: no se publican cifras concretas; al tratarse de una busqueda en tabla de vectores por token mas pooling, la codificacion es de orden de microsegundos a milisegundos por texto en CPU, muy por debajo de un transformer denso de 4B.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Licencia | Calidad (keyword_ndcg@10 raw) | Disponibilidad |
|---|---|---|---|---|---|---|
| m2v-qwen3-4b-256-edu (este) | 122,7 M | 256 | no disponible (estatico) | Apache 2.0 | 0,494 | Hugging Face, libreria model2vec |
| m2v-gte-256-edu-v2 | no disponible | 256 | no disponible (estatico) | no disponible | 0,533 | Hugging Face, mismo autor |
| potion-multilingual-128M | ~128 M | no disponible | no disponible (estatico) | no disponible | 0,385 | Hugging Face, MinishLab |
| Qwen/Qwen3-Embedding-4B (teacher) | ~4 B | no disponible | no disponible | no disponible | no evaluado en esta tabla | Hugging Face, Qwen |

El modelo previo del mismo autor, m2v-gte-256-edu-v2, supera a este en keyword_ndcg@10, keyword_recall@10, title_mrr@10 y title_recall@10 tanto en texto bruto como lematizado; este modelo solo es competitivo en subject_macro_f1 en modo lematizado (0,736 frente a 0,708). Frente a tfidf, el modelo gana en recuperacion por palabras clave en texto bruto (0,494 frente a 0,463) pero pierde en modo lematizado y en clasificacion de materia. Frente a potion-multilingual-128M, el modelo es claramente superior en todas las metricas de recuperacion.

## Limitaciones y advertencias

- Solo soporta aleman; no se ha entrenado ni evaluado en otros idiomas.
- Es un modelo de embeddings, no generativo: no produce texto, no razona y no soporta tool calling ni agentes.
- El modelo previo del mismo autor (m2v-gte-256-edu-v2) obtiene mejores resultados en la mayoria de metricas de recuperacion, por lo que conviene comparar ambos antes de desplegar.
- Los datos de entrenamiento son sinteticos (generados por un LLM) y proceden de un unico autor; pueden contener sesgos o artefactos del generador no documentados.
- El vocabulario ampliado y el ajuste estan sesgados al dominio educativo aleman; el rendimiento en otros dominios o registros no se ha evaluado.
- Los metadatos y topicos del dataset heredan atribuciones de OpenEduHub (CC0 1.0) y de la clasificacion de materias de educacion superior del Statistisches Bundesamt; la model card remite a esas fuentes.
- Licencia Apache 2.0 permite uso comercial, pero la atribucion del dataset (CC BY 4.0) debe conservarse segun indica el autor.
- Al ser un modelo estatico, no captura orden de palabras ni dependencias de largo alcance; para tareas que requieran comprension contextual profunda conviene un reranker denso posterior.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JanSchachtschabel/m2v-qwen3-4b-256-edu
- Dataset de entrenamiento: https://huggingface.co/datasets/JanSchachtschabel/synthetic-german-educational-materials-50k
- Perfil del autor: https://huggingface.co/JanSchachtschabel
- Modelo teacher: https://huggingface.co/Qwen/Qwen3-Embedding-4B
- Repositorio Model2Vec: https://github.com/MinishLab/model2vec
- Modelo comparable potion-multilingual-128M: https://huggingface.co/minishlab/potion-multilingual-128M
- Licencia CC BY 4.0 del dataset: https://creativecommons.org/licenses/by/4.0/
