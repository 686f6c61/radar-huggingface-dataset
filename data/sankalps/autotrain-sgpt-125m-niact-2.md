# sankalps/autotrain-sgpt-125m-niact-2

## Resumen

El modelo `sankalps/autotrain-sgpt-125m-niact-2` es un modelo de embeddings de frases (sentence transformer) desarrollado por el usuario sankalps mediante la herramienta AutoTrain de Hugging Face. Se trata de un ajuste fino del modelo base `Muennighoff/SGPT-125M-weightedmean-msmarco-specb-bitfit`, que a su vez deriva de SGPT-125M, una familia de sentence transformers construida sobre la arquitectura GPT-Neo de 125 millones de parámetros y entrenada para similitud semántica y recuperación de pasajes.

El modelo cuenta con 125.200.128 parámetros reales (verificado en los pesos safetensors) y resuelve la tarea de convertir texto en vectores densos reutilizables para búsqueda semántica, clustering, deduplicación y recuperación aumentada por generación (RAG). Su relevancia práctica reside en su tamaño reducido: cabe en CPU y en cualquier GPU de consumo, con un coste de inferencia muy bajo comparado con modelos de embeddings basados en LLM de miles de millones de parámetros.

Se trata de un modelo de la comunidad, sin descargas ni "likes" en el momento de la consulta, sin licencia declarada, sin idiomas especificados y sin resultados de benchmarks publicados. La model card únicamente documenta métricas de validación del entrenamiento con AutoTrain, por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder GPT-Neo (gpt_neo) usado como encoder de frases con pooling de media ponderada |
| Parametros totales | 125.200.128 |
| Longitud de contexto | No disponible en la model card; la arquitectura GPT-Neo de 125 M subyacente emplea 2048 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se ofrecen variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (el modelo base se entreno sobre MS MARCO, mayoritariamente en ingles) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Dimension de embedding | No disponible en la model card; derivada de la arquitectura base, 768 dimensiones |
| Tamano del repositorio | 1.5 GB |
| Libreria de inferencia | sentence-transformers |
| Modelo base | Muennighoff/SGPT-125M-weightedmean-msmarco-specb-bitfit |

## Arquitectura y entrenamiento

La arquitectura subyacente es GPT-Neo de 125 M, un transformer decoder con atencion causal. Para producir embeddings de frases se emplea pooling de media ponderada (*weighted mean pooling*) sobre los estados ocultos, estrategia introducida en la familia SGPT (paper arXiv:2202.08904). El modelo base fue ajustado mediante BitFit, una tecnica de ajuste eficiente en parametros que unicamente actualiza los terminos de sesgo (*bias*) de la red, junto con la especificacion SpecB y el corpus MS MARCO para recuperacion de pasajes.

El ajuste que da lugar a este modelo se realizo con AutoTrain bajo el tipo de problema "Sentence Transformers", durante 3 epocas segun la metrica `epochs: 3.0` de la model card. No se especifica en la informacion disponible el dataset concreto de ajuste (el sufijo "niact-2" del nombre no viene documentado), ni el numero de tokens de entrenamiento, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en la practica a un modelo de embeddings de similitud). Tampoco se documenta ninguna innovacion adicional de decodificacion, atencion lineal o arquitectura hibrida.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y calculo de distancias coseno entre textos.
- Extraccion de caracteristicas (*feature extraction*) a nivel de frase.
- Recuperacion de informacion (*retrieval*) en configuracion asimetrica, con prefijos convencionales `search_query:` para consultas y `search_passage:` para documentos.
- Agrupamiento (clustering), deduplicacion y deteccion de near-duplicates sobre corpus de texto.
- Busqueda semantica sobre indices vectoriales.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un modelo de embeddings, no generativo de texto libre).
- Capacidades multilingues: no disponible; sin confirmar.
- Capacidad especial de *thinking mode*, vision o audio: no disponible.

## Casos de uso

- Recuperacion aumentada por generacion (RAG) en producción: el modelo indexa fragmentos de documentacion como vectores de 768 dimensiones que se almacenan en una base vectorial (FAISS, Qdrant, pgvector) y se consultan con el prefijo `search_query:`. Su tamano de 125 M permite reindexar grandes corpus con coste bajo.
- Busqueda semantica en sitios de documentacion tecnicos: convertir las preguntas de los usuarios y las secciones de la documentacion en embeddings para devolver los apartados mas relevantes aunque no compartan palabras clave.
- Deduplicacion de datasets de entrenamiento: calcular embeddings de todos los ejemplos y agrupar por similitud coseno para eliminar registros practicamente identicos antes de entrenar otro modelo.
- Moderacion o triaje de tickets de soporte: agrupar automaticamente incidencias por similitud tematica y enrutarlas al equipo correspondiente sin depender de coincidencia exacta de palabras.
- Sistemas de recomendacion de contenido: representar articulos, productos o publicaciones como vectores y recomendar elementos cercanos al historial del usuario.
- Evaluacion de calidad de respuestas y deteccion de alucinaciones por similitud: comparar la respuesta generada por un LLM con los pasajes recuperados para detectar divergencias semanticas.
- Clasificacion *zero-shot* ligera: usar los embeddings como caracteristicas de entrada para un clasificador lineal (regresion logistica) sobre categorias etiquetadas con pocos ejemplos.
- Preprocesado en pipelines de bajo consumo: al caber en CPU, sirve como etapa de filtrado o *reranking* barato antes de modelos de embeddings mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MTEB, MMLU, HumanEval ni resultados equivalentes). La unica informacion numerica de la model card corresponde a metricas del propio entrenamiento con AutoTrain:

| Metrica (AutoTrain) | Valor |
|---|---|
| loss (validacion) | 1.5322915315628052 |
| runtime | 0.3097 |
| samples_per_second | 19.373 |
| steps_per_second | 3.229 |
| epochs | 3.0 |

Estas cifras describen el proceso de entrenamiento y validacion, no la calidad del modelo en tareas de recuperacion o similitud, por lo que no son comparables con resultados de MTEB u otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 500 MB en FP32, unos 250 MB en FP16 y unos 125 MB en INT8 para los pesos; a ello hay que sumar el espacio de activaciones y del lote de entrada, que en la practica es pequeno.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM, incluidas NVIDIA T4, RTX 3060, RTX 4090, L4 o A10. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos ocho anos, e incluso en CPU con tiempos de latencia aceptables para cargas por lotes.
- Opciones de despliegue: `sentence-transformers` (referencia de la model card), Hugging Face Text Embeddings Inference (TEI), ONNX Runtime para exportacion, FastEmbed y `transformers` con pooling manual. vLLM soporta modelos de embeddings, pero no hay validacion publicada de este checkpoint concreto en dicho motor. No hay pesos GGUF publicados para llama.cpp.
- Latencia y throughput estimados: no disponible. Los valores `samples_per_second: 19.373` y `steps_per_second: 3.229` corresponden al entrenamiento con AutoTrain, no a inferencia, y no deben interpretarse como rendimiento de produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dim. embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sankalps/autotrain-sgpt-125m-niact-2 | 125,2 M | No disponible (base GPT-Neo: 2048) | No disponible (base: 768) | No disponible | Hugging Face, safetensors |
| Muennighoff/SGPT-125M-mean-nli | 125 M | 2048 (GPT-Neo) | 768 | No disponible en la informacion consultada | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens | 384 | Apache-2.0 | Hugging Face, muy extendido |
| BAAI/bge-small-en-v1.5 | 33 M | 512 tokens | 384 | MIT | Hugging Face, muy extendido |

No hay datos de rendimiento comparativo publicados (MTEB u otros) para el modelo objeto de esta ficha, por lo que la comparacion se limita a parametros, dimensionalidad, licencia y disponibilidad. Los dos modelos de referencia de la tabla cuentan con amplia validacion comunitaria, mientras que este checkpoint carece de evaluacion publica independiente.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial; conviene contactar con el autor antes de desplegarlo en produccion.
- Sin resultados de benchmarks publicados: la calidad real en tareas de recuperacion o similitud es desconocida y no esta respaldada por MTEB ni por evaluaciones independientes.
- Modelo de la comunidad con cero descargas y cero "likes": no ha pasado por validacion de terceros ni aparece en rankings de referencia.
- Idiomas no especificados: el modelo base se entreno sobre MS MARCO, predominantemente en ingles, por lo que el rendimiento en castellano es incierto y probablemente inferior.
- El sufijo "niact-2" del nombre no esta documentado: se desconoce el dataset de ajuste y su dominio objetivo, lo que dificulta anticipar sesgos.
- Sesgos heredados del corpus MS MARCO: predominio de consultas web en ingles y de determinados dominios tematicos; puede infrarrepresentar otros registros y comunidades.
- Riesgo de alucinacion: no aplica directamente porque el modelo no genera texto, pero si puede producir similitudes altas entre textos poco relacionados cuando el dominio se aleja del corpus de entrenamiento, lo que degradaria un sistema RAG.
- Requiere el uso de los prefijos `search_query:` y `search_passage:` para recuperacion asimetrica; omitirlos degrada la calidad de los embeddings.
- Longitud de contexto limitada por la arquitectura GPT-Neo (2048 tokens) y, en la practica, por el truncamiento configurado en `sentence-transformers`; los documentos largos deben fragmentarse.
- Sin variantes cuantizadas publicadas (GGUF, AWQ, GPTQ), lo que limita su integracion en motores que dependen de esos formatos.
- El repositorio ocupa 1.5 GB para un modelo de 125 M, lo que sugiere la presencia de multiples checkpoints o formatos; conviene revisar los ficheros antes de descargar todo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sankalps/autotrain-sgpt-125m-niact-2
- Modelo base: https://huggingface.co/Muennighoff/SGPT-125M-weightedmean-msmarco-specb-bitfit
- SGPT-125M-mean-nli-bitfit: https://huggingface.co/Muennighoff/SGPT-125M-mean-nli-bitfit
- SGPT-125M-mean-nli: https://huggingface.co/Muennighoff/SGPT-125M-mean-nli
- Paper de SGPT (arXiv:2202.08904): https://arxiv.org/abs/2202.08904
- Ficha de SGPT-125M en AIBase: https://model.aibase.com/models/details/1915693187672465410
- Documentacion de AutoTrain: https://huggingface.co/docs/autotrain/index
- Repositorio de sentence-transformers: https://github.com/UKPLab/sentence-transformers

Nota: los resultados de busqueda sobre autocompletado MIDI con un transformer de 125 M y sobre ajuste de GPT-2 para clasificacion de texto no guardan relacion con este modelo y se han excluido.
