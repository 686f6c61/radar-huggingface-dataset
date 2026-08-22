# Culture-and-Morality-Lab/psyembedding-gte-large

## Resumen

PsyEmbedding-gte-large es un modelo de embeddings de frases (sentence embeddings) desarrollado por el Culture and Morality Lab (CAML) de la Universidad de Massachusetts Amherst. Forma parte de la colección PsyEmbedding, orientada a la investigación en psicología, cultura y moralidad. El modelo se basa en la arquitectura BERT (según las etiquetas del repositorio) y se ha entrenado con la librería sentence-transformers utilizando una pérdida de similitud coseno (CosineSimilarityLoss) sobre un conjunto de datos de 11.180 ejemplos. Con 335 millones de parámetros, el modelo genera representaciones densas de frases para tareas de similitud semántica, aunque los resultados de benchmark publicados muestran una correlación baja (Spearman de 0,40), lo que sugiere un rendimiento limitado en dominios generales.

El modelo está pensado para su uso en investigación social y psicológica, donde se necesita comparar la similitud semántica de textos relacionados con valores morales, normas culturales o discursos en redes sociales. Su relevancia actual radica en la creciente necesidad de herramientas de análisis de texto en ciencias sociales, aunque su escasa documentación y la ausencia de licencia explícita limitan su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder, presumiblemente variante large) |
| Parametros totales | 335.141.888 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT, tal como indican las etiquetas del repositorio, y se ha implementado con la librería sentence-transformers, que permite generar embeddings de frases mediante pooling sobre las salidas del transformer. La referencia al artículo arxiv:1908.10084 (Sentence-BERT) sugiere que se ha utilizado el enfoque siamese/triplet para el entrenamiento. La pérdida empleada es CosineSimilarityLoss, lo que indica que el objetivo era maximizar la similitud coseno entre pares de frases semánticamente relacionados.

El conjunto de entrenamiento consta de 11.180 ejemplos (según la etiqueta dataset_size), pero no se especifica la composición exacta ni el número de épocas. Los ejemplos mostrados en el widget de la tarjeta del modelo (frases sobre vecinos, política, religión, etc.) sugieren que los datos provienen de plataformas como Reddit o foros de discusión, con un sesgo hacia contenido coloquial y temáticas socioculturales. No se menciona el uso de técnicas como RLHF o DPO, ni innovaciones arquitectónicas adicionales.

## Capacidades

- Generacion de embeddings densos de frases para tareas de similitud semantica y recuperacion de informacion.
- Optimizado para comparar la similitud entre textos que abordan temas de moralidad, cultura y psicologia, dado el contexto del laboratorio que lo desarrollo.
- Compatible con el ecosistema sentence-transformers, lo que permite su integracion en pipelines de busqueda semantica o clustering.
- No se han documentado capacidades de tool calling, razonamiento multi-paso, generacion de texto ni soporte multimodal.
- La informacion disponible no indica soporte para multiples idiomas; probablemente este entrenado principalmente en ingles, dado el contenido de los ejemplos.

## Casos de uso

- Analisis de discursos morales en redes sociales: el modelo puede utilizarse para agrupar o clasificar publicaciones segun su contenido etico, por ejemplo, detectando temas recurrentes en debates sobre politica o religion. Su entrenamiento con datos coloquiales lo hace adecuado para este tipo de texto.
- Investigacion en psicologia social: los investigadores pueden emplear los embeddings para medir la similitud entre respuestas de encuestas abiertas o narrativas personales, facilitando el analisis cualitativo a gran escala.
- Deteccion de polarizacion cultural: comparando embeddings de textos de diferentes grupos demograficos o geograficos, se pueden identificar divergencias en valores o normas.
- Moderacion de contenido en foros: aunque su rendimiento es limitado, podria usarse como filtro preliminar para encontrar mensajes tematicamente relacionados en comunidades online.
- Recuperacion de informacion en corpus academicos: para buscar articulos o pasajes sobre moralidad y cultura, el modelo puede generar representaciones que permitan busquedas por similitud.
- Creacion de chatbots de soporte psicologico: los embeddings podrian ayudar a emparejar consultas de usuarios con respuestas de una base de datos de consejos previamente etiquetados, aunque se requiere validacion adicional.

## Benchmarks y rendimiento

El unico benchmark publicado en la tarjeta del modelo es una evaluacion de similitud semantica (tipo "similarity"). Los resultados son los siguientes:

| Tarea | Metrica | Valor |
|---|---|---|
| Semantic Similarity | Pearson (coseno) | 0,3879 |
| Semantic Similarity | Spearman (coseno) | 0,4048 |

Estos valores son notablemente bajos en comparacion con modelos de embeddings generalistas (por ejemplo, all-MiniLM-L6-v2 suele superar 0,60 en tareas similares). No se han publicado resultados en otros benchmarks como MMLU, HumanEval o GSM8K, y no se dispone de comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 335M parametros. En precision fp32, el peso ocupa aproximadamente 1,34 GB; en fp16, unos 0,67 GB. Para cargar el modelo completo en GPU se recomienda al menos 2 GB de VRAM libre, aunque con secuencias largas puede aumentar el consumo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) es suficiente para inferencia. En CPU, se puede ejecutar con 8 GB de RAM, aunque la latencia sera mayor.
- Compatibilidad con consumer GPU: si, cabe en la mayoria de GPUs de consumo actuales.
- Opciones de despliegue: al ser un modelo de sentence-transformers, se puede servir con librerias como sentence-transformers, text-embeddings-inference (mencionado en las etiquetas) o mediante FastAPI con torch. Tambien es posible exportarlo a ONNX para optimizacion.
- Latencia y throughput: no se han publicado datos oficiales. Como referencia, un modelo BERT-large suele procesar entre 50 y 200 frases por segundo en una GPU moderna (RTX 3090), dependiendo de la longitud de las secuencias.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo. Sin embargo, se puede contextualizar frente a alternativas comunes de embeddings:

| Modelo | Parametros | Contexto maximo | Spearman (STS-B) | Licencia |
|---|---|---|---|---|
| psyembedding-gte-large | 335M | No disponible | 0,40 (similitud propia) | No disponible |
| all-MiniLM-L6-v2 | 22M | 256 | ~0,78 | Apache 2.0 |
| bge-large-en-v1.5 | 326M | 512 | ~0,83 | MIT |

Estos datos de referencia provienen de benchmarks publicos conocidos, pero no se han comparado directamente con psyembedding-gte-large en el mismo corpus. La diferencia de rendimiento sugiere que este modelo esta especializado en un dominio concreto y no es adecuado para tareas generales de similitud semantica.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica ningun tipo de licencia, lo que genera incertidumbre legal para su uso comercial. Se recomienda contactar con los autores antes de utilizarlo en productos.
- Rendimiento bajo en similitud semantica general: los valores de correlacion (Spearman 0,40) son significativamente inferiores a los de modelos estandar, lo que limita su utilidad fuera del ambito de investigacion para el que fue creado.
- Datos de entrenamiento limitados y sesgados: el conjunto de 11.180 ejemplos, aparentemente extraido de redes sociales, puede introducir sesgos linguisticos y tematicos. Los ejemplos del widget incluyen lenguaje coloquial, argot y referencias culturales especificas de Estados Unidos.
- Sin documentacion sobre sesgos: no se han publicado analisis de sesgos de genero, raza o ideologia, lo que es preocupante para un modelo orientado a temas morales.
- Longitud de contexto desconocida: al no especificarse, se asume el limite tipico de BERT (512 tokens), lo que puede ser insuficiente para documentos largos.
- Sin soporte de cuantizacion oficial: no se ofrecen versiones cuantizadas (GGUF, AWQ, etc.), lo que dificulta su despliegue en entornos con recursos limitados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Culture-and-Morality-Lab/psyembedding-gte-large
- Coleccion PsyEmbedding: https://huggingface.co/collections/Culture-and-Morality-Lab/psyembedding
- Pagina de herramientas del Culture and Morality Lab: https://cultureandmorality.org/tools
