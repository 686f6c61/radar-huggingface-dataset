# masterofaudio2077/Fada_ar_embedding

## Resumen

FADA (Fada_ar_embedding) es un modelo de embeddings de texto en arabe desarrollado por el usuario masterofaudio2077. Se trata de un encoder transformer bidireccional de tipo BERT, derivado de UBC-NLP/ARBERTv2, con 162.841.344 parametros (~163 M) que proyecta cualquier fragmento de texto en arabe a un vector de 768 dimensiones. Su proposito es servir como modelo de similitud semantica y extraccion de caracteristicas (feature extraction) en pipelines de recuperacion densa, clustering, deduplicacion y busqueda semantica en arabe.

La innovacion principal es que se trata de un modelo Matryoshka: el vector completo de 768 dimensiones puede truncarse a 512, 256, 128 o 64 dimensiones con una perdida minima de calidad, lo que permite reducir costes de almacenamiento y latencia en indices vectoriales. Ademas, se ha entrenado en dos fases: primero un ajuste contrastivo con perdida InfoNCE sobre el dataset Arab3M-Triplets, y despues una destilacion de conocimiento a partir de Qwen/Qwen3-Embedding-8B, que actua como profesor.

El modelo es relevante ahora porque demuestra que un encoder pequeno y de licencia Apache 2.0 puede acercarse al rendimiento de modelos multilingues mucho mayores en tareas de similitud semantica en arabe, manteniendo un coste de inferencia muy bajo (repo de 0,7 GB). Su licencia permisiva y su compatibilidad con sentence-transformers y text-embeddings-inference lo hacen apto para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo BERT (base: UBC-NLP/ARBERTv2) |
| Parametros totales | 162.841.344 (~163 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (evaluado con `max_seq_length=512`); entrenamiento con longitud maxima de 200 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos en safetensors convertibles con herramientas estandar |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con sentence-transformers y transformers) |
| Dimension del embedding | 768 (Matryoshka: 512, 256, 128 y 64) |
| Funcion de pooling | no disponible en la informacion proporcionada (el profesor Qwen3 usa last-token pooling; no se especifica el pooling del alumno) |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional tipo BERT con 162,8 M de parametros, heredado de UBC-NLP/ARBERTv2. El modelo no es generativo: produce representaciones vectoriales de frases o parrafos. El entrenamiento se realizo en dos etapas bien diferenciadas.

La primera etapa consistio en un ajuste fino contrastivo de ARBERTv2 sobre el dataset Arab3M-Triplets (estructura anchor / positive / negative), previamente limpiado y deduplicado. Se ejecutaron 23.000 pasos (la configuracion preveia 50.000 y se detuvo antes), con un batch de 2.048 tripletas. La perdida fue `MatryoshkaLoss` sobre las dimensiones 768, 512, 256, 128 y 64 con pesos iguales, envolviendo `CachedMultipleNegativesRankingLoss` (escala 20, tamano de chunk GradCache 512). Se uso el optimizador Lion con learning rate 5e-6, betas (0,9 / 0,99), weight decay 0,1 (no aplicado a sesgos ni capas de normalizacion) y un schedule coseno con 10 % de warm-up. El proceso duro unas 10 horas en una unica NVIDIA RTX PRO 6000.

La segunda etapa fue una destilacion de conocimiento. El modelo de la etapa 1 actuo como alumno y Qwen/Qwen3-Embedding-8B (4096 dimensiones, last-token pooling, bf16, sin prompt de instruccion, longitud maxima 256) como profesor. Los vectores del profesor se calcularon una vez y se cachearon en float16. El dataset de esta fase fueron solo los textos unicos (1.068.221 textos: anchors, positivos y negativos), sin la estructura de tripletas. Se ejecutaron 5.636 pasos (configurado para 10.000) con batch de 2.048, lo que equivale a 11.542.528 muestras de texto y unas 10,8 pasadas sobre el corpus. La perdida combinaba, para cada tamano Matryoshka, una perdida coseno (peso 10) y una perdida de similitud MSE entre las matrices de similitud coseno in-batch del alumno y del profesor (peso 200). Se usaron cabezas lineales d -> 4096 inicializadas por regresion ridge sobre 50.000 textos, empleadas solo en entrenamiento y no incluidas en el repositorio. El optimizador fue AdamW (learning rate 2e-5 en el encoder y 1e-4 en las cabezas, weight decay 0,01, gradient clipping 1), en bf16 con gradient checkpointing, y se ejecuto en una NVIDIA RTX PRO 6000 Blackwell Server Edition durante unas 2 horas. La semilla fue 42 y el entrenamiento se detuvo antes de que el learning rate decayese a cero (ultimo valor registrado 9,57e-06).

## Capacidades

- Generacion de embeddings de frases y parrafos en arabe para similitud semantica y feature extraction.
- Representaciones Matryoshka: truncables a 512, 256, 128 o 64 dimensiones con perdida minima (68,33 de media en 64 dims frente a 69,07 en 768 dims segun los datos del autor).
- Recuperacion densa y busqueda semantica: adecuado como bi-encoder para indexacion y consulta en motores vectoriales.
- Clustering y deduplicacion de textos arabes mediante similitud coseno.
- Clasificacion de textos por similitud a prototipos o etiquetas (zero-shot mediante embeddings).
- Capacidades multilingues: unicamente arabe (idioma declarado `ar`).
- No soporta tool calling ni function calling (no es un modelo generativo).
- No soporta agentes ni razonamiento multi-step.
- No tiene capacidades de vision, audio ni modo de pensamiento.

## Casos de uso

- Busqueda semantica en arabe: el modelo indexa documentos y consultas como vectores de 768 dimensiones y permite recuperacion densa por similitud coseno. Es adecuado por su bajo coste y su licencia permisiva.
- RAG sobre corpus en arabe: como componente de recuperacion (retriever) en pipelines de generacion aumentada, alimentando a un LLM generativo con pasajes relevantes extraidos de una base documental arabe.
- Deduplicacion de corpus: agrupando textos con similitud coseno alta para eliminar contenido repetido en datasets de entrenamiento o bases de conocimiento.
- Clasificacion y enrutado de tickets de soporte: asignando cada consulta a una categoria mediante comparacion con embeddings de referencia, sin necesidad de reentrenar un clasificador supervisado.
- Motor de recomendacion de contenido: calculando similitud entre articulos, noticias o productos descritos en arabe para sugerir items relacionados.
- Moderacion y agrupamiento tematico: agrupando mensajes por tema o detectando duplicados y campanas de spam mediante clustering sobre los embeddings.
- Sistemas de busqueda con restricciones de memoria: gracias a la propiedad Matryoshka, permite truncar los vectores a 256 o 64 dimensiones para reducir hasta un 92 % el almacenamiento del indice con una perdida de calidad inferior a un punto en la media de STS segun los datos del autor.

## Benchmarks y rendimiento

Resultados de similitud textual semantica en arabe segun MTEB (`mteb==2.22.0`). La puntuacion es la correlacion de Spearman multiplicada por 100 entre la similitud coseno del modelo y las valoraciones humanas. Evaluado con `max_seq_length=512`.

| Modelo | STS17 (ar-ar) | STS22.v2 (ar) | Media |
|---|---|---|---|
| raw ARBERTv2, 768 dims | 49,24 | 47,80 | 48,52 |
| FADA antes de destilacion, 768 dims | 74,14 | 52,89 | 63,51 |
| FADA antes de destilacion, 64 dims | 73,11 | 49,87 | 61,49 |
| Este modelo, 768 dims | 79,72 | 58,43 | 69,07 |
| Este modelo, 256 dims | 79,61 | 58,22 | 68,91 |
| Este modelo, 64 dims | 78,29 | 58,37 | 68,33 |
| intfloat/multilingual-e5-small, 384 dims | 74,62 | 61,44 | 68,03 |
| intfloat/multilingual-e5-large, 1024 dims | 78,71 | 63,73 | 71,22 |
| Qwen/Qwen3-Embedding-8B (el profesor), 4096 dims | 88,95 | 69,57 | 79,26 |

Evolucion de la perdida de destilacion (medias por ventana de 25 pasos):

| Paso | loss | kd_cos | kd_sim |
|---|---|---|---|
| 25 | 20,623 | 3,816 | 16,807 |
| 500 | 3,994 | 3,021 | 0,973 |
| 1.000 | 3,633 | 2,779 | 0,854 |
| 2.500 | 3,020 | 2,427 | 0,592 |
| 5.000 | 2,697 | 2,225 | 0,472 |
| 5.625 (ultimo registrado) | 2,657 | 2,198 | 0,459 |

No se han publicado otros resultados de benchmarks (por ejemplo, tareas de recuperacion de MTEB) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,65 GB en fp32, 0,33 GB en fp16/bf16 y 0,16 GB en int8 (estimacion a partir de los 162,8 M de parametros).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; una RTX 4090, A100 o H100 estan sobredimensionadas para este modelo y solo tienen sentido para procesar grandes volumenes en batch.
- Cabe en cualquier GPU de consumo e incluso en CPU: el modelo completo en bf16 ocupa del orden de 325 MB.
- Opciones de despliegue: sentence-transformers (libreria declarada), text-embeddings-inference (etiqueta `endpoints_compatible`), transformers estandar. La model card menciona un uso alternativo sin Sentence-Transformers mediante `transformers` plano.
- Por throughput y latencia no se proporcionan datos en la informacion disponible.
- El autor reporta tiempos de entrenamiento (unas 10 horas en RTX PRO 6000 para la etapa 1 y unas 2 horas en RTX PRO 6000 Blackwell para la etapa 2), pero no metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension del embedding | Idiomas | Licencia | Media STS (ar) |
|---|---|---|---|---|---|
| FADA (este modelo) | 162.841.344 | 768 (Matryoshka hasta 64) | arabe | Apache 2.0 | 69,07 (768 dims) |
| intfloat/multilingual-e5-small | no disponible | 384 | multilingue | no disponible en la informacion | 68,03 |
| intfloat/multilingual-e5-large | no disponible | 1024 | multilingue | no disponible en la informacion | 71,22 |
| Qwen/Qwen3-Embedding-8B | no disponible | 4096 | multilingue | no disponible en la informacion | 79,26 |

Frente a multilingual-e5-small, FADA obtiene una media ligeramente superior (69,07 frente a 68,03) con una dimension de embedding mayor pero un modelo mas pequeno en parametros. Frente a multilingual-e5-large, FADA queda por debajo en la media (69,07 frente a 71,22) pero con menos dimensiones y una licencia Apache 2.0 explicita. Qwen3-Embedding-8B, el profesor, mantiene una ventaja clara (79,26) a costa de un modelo mucho mayor y 4096 dimensiones. La comparativa se limita a los datos de STS publicados por el autor; no hay datos de parametros ni licencia de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monoidioma: solo cubre arabe (etiqueta `ar`); su uso en otros idiomas no esta soportado.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-step; solo genera embeddings.
- Sesgos conocidos: no se documentan sesgos especificos en la model card; al entrenarse sobre Arab3M-Triplets, puede heredar sesgos presentes en ese corpus.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de similitudes semanticas erroneas en dominios muy alejados de los datos de entrenamiento.
- Entrenamiento inacabado: tanto la fase contrastiva (23.000 de 50.000 pasos) como la destilacion (5.636 de 10.000 pasos) se detuvieron antes de completar el schedule, y el learning rate no llego a decaer a cero; el rendimiento final podria ser inferior al de un entrenamiento completo.
- Longitud de entrenamiento de 200 tokens en la fase de destilacion, muy por debajo del maximo de 512 tokens soportado; los textos largos pueden degradar la calidad del embedding.
- Los vectores del profesor se calcularon con longitud maxima 256, lo que limita la senal de destilacion transferida.
- Las cabezas lineales usadas en la destilacion no forman parte del repositorio, por lo que la reproducibilidad exacta del proceso requiere reimplementarlas.
- Validacion limitada: el modelo tiene 0 descargas y 0 likes y fue creado el 2026-10-02; no ha sido contrastado de forma independiente por la comunidad.
- Los benchmarks publicados se limitan a dos tareas de STS en arabe; no hay datos de recuperacion, clustering ni otras tareas de MTEB.
- Licencia Apache 2.0, que permite uso comercial, siempre que se respeten las condiciones de atribucion y aviso de la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/masterofaudio2077/Fada_ar_embedding
- Modelo base: https://huggingface.co/UBC-NLP/ARBERTv2
- Dataset de entrenamiento: https://huggingface.co/datasets/Omartificial-Intelligence-Space/Arab3M-Triplets
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- MTEB (paper, arXiv:2210.07316): https://arxiv.org/abs/2210.07316
- Paper referenciado (arXiv:2212.10758): https://arxiv.org/abs/2212.10758
- Paper referenciado (arXiv:2506.05176): https://arxiv.org/abs/2506.05176
- Paper referenciado (arXiv:2412.19048): https://arxiv.org/abs/2412.19048
- Paper referenciado (arXiv:2411.01192): https://arxiv.org/abs/2411.01192
- Paper referenciado (arXiv:2205.13147): https://arxiv.org/abs/2205.13147
- Paper referenciado (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- Paper referenciado (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
- Paper referenciado (arXiv:2302.06675): https://arxiv.org/abs/2302.06675
- Paper referenciado (arXiv:1711.05101): https://arxiv.org/abs/1711.05101
- Paper referenciado (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper referenciado (arXiv:2402.05672): https://arxiv.org/abs/2402.05672
