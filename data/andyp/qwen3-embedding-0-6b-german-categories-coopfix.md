# andyP/qwen3-embedding-0.6b-german-categories-coopfix

## Resumen

El modelo `andyP/qwen3-embedding-0.6b-german-categories-coopfix` es un ajuste fino de `Qwen/Qwen3-Embedding-0.6B` orientado a una tarea muy concreta: mapear el objeto social estatutario (el "Zweck" en aleman, "but" en frances, "scopo" en italiano) de una empresa suiza a un conjunto fijo de categorias de negocio descritas en aleman, ordenandolas por similitud coseno. No es un modelo generativo, sino un modelo de embeddings de frases usado como clasificador mediante recuperacion sobre una taxonomia de categorias.

Se trata de la segunda iteracion de un ajuste previo (`andyP/qwen3-embedding-0.6b-german-categories`). La unica diferencia respecto al original es una correccion en las etiquetas de entrenamiento de las cooperativas de vivienda (Wohnbaugenossenschaften): el modelo anterior clasificaba la mayoria como "Esoterik & Spirituelles" cuando debian ir a "Immobilien & Wohnungen". La causa era un desbalance en las etiquetas de entrenamiento, con 32 objetos sociales de cooperativas mal etiquetados.

El modelo tiene 595.776.512 parametros (aproximadamente 0,6 mil millones), esta publicado bajo licencia Apache-2.0, ocupa 1,2 GB en el repositorio y solo se ha evaluado en aleman, frances e italiano. El autor declara 0 descargas y 0 "likes" en el momento de la consulta, por lo que es un artefacto de investigacion muy nicho, sin adopcion publica conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder derivado de Qwen/Qwen3-Embedding-0.6B; el detalle de capas y pooling no se especifica en la model card |
| Parametros totales | 595.776.512 (segun safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible; el entrenamiento uso una longitud maxima de 384 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | aleman (de), frances (fr), italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-Embedding-0.6B`, un modelo de embeddings de 0,6B parametros, y se ajusta con la libreria sentence-transformers. La tarea se plantea como recuperacion: los objetos sociales se codifican con un prompt de consulta y las descripciones de categoria sin prompt, y la prediccion es la categoria con mayor similitud coseno. El prompt de consulta almacenado en la configuracion del modelo es textualmente `Instruct: Given the statutory purpose of a Swiss company, retrieve the business categories it belongs to` seguido de `Query: `. Los textos de categoria siguen el patron `<Nombre>. <Descripcion de una frase> Beispiele: <ejemplo>, <ejemplo>, ...`.

El entrenamiento usa `MultipleNegativesRankingLoss` con negativos en lote mas un negativo duro minado por par (filtrado por margen). La configuracion es: batch de 32, tasa de aprendizaje 2e-5 con scheduler coseno, una epoca completa (1.980 pasos), longitud de entrada maxima de 384 tokens, precision fp32 y hardware Apple Silicon. El conjunto de entrenamiento consta de 63.340 tripletas, de las cuales 48 filas corresponden a la correccion de cooperativas de vivienda (24 reetiquetadas desde la categoria esoterica y desde una etiqueta de colocacion laboral hacia inmobiliario, mas 24 cooperativas correctamente etiquetadas que se habian quedado fuera por el limite de muestreo por categoria). Nueve casos limite (coworking, cuidados a mayores, cooperativas de artistas) se dejaron sin cambios. La taxonomia completa de categorias no se distribuye con el modelo.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y recuperacion (pipeline `sentence-similarity`).
- Extraccion de caracteristicas (`feature-extraction`) y clasificacion de texto (`text-classification`).
- Clasificacion de objetos sociales de empresas suizas en categorias de negocio descritas en aleman mediante ranking por similitud coseno.
- Cobertura multilingue de entrada en aleman, frances e italiano (la taxonomia de destino es alemana).
- Soporte de cuantizacion y despliegue compatible con text-embeddings-inference y endpoints compatibles, segun las etiquetas del repositorio.
- No soporta generacion de texto, tool calling, uso como agente ni razonamiento multi-paso: es exclusivamente un modelo de representacion y ranking.
- No se documentan capacidades de vision, audio ni modo "thinking".

## Casos de uso

- Clasificacion automatica de altas registrales: dado el objeto social de una empresa recien constituida en Suiza, el modelo devuelve las categorias de negocio mas probables, lo que permite enrutarla a la unidad comercial correspondiente sin intervencion manual.
- Enriquecimiento de CRM y bases de datos B2B: se codifica el "Zweck" de cada cliente y se le asigna una o varias categorias, habilitando segmentacion y filtrado por sector en herramientas de ventas.
- Onboarding en banca y seguros: clasificar carteras de pymes suizas por categoria de negocio para decidir productos, limites de riesgo o procesos de compliance aplicables.
- Analisis de mercado y estudios sectoriales: procesar grandes volumenes de objetos sociales (el autor evalua sobre 55.015 objetos no vistos en entrenamiento) para estimar la composicion sectorial de un canton o region.
- Deduplicacion y busqueda semantica de registros mercantiles: usar los embeddings para agrupar empresas con propositos similares aunque el redactado difiera entre aleman, frances e italiano.
- Correccion de taxonomias internas: comparar la categoria asignada manualmente con la predicha por el modelo para detectar etiquetas erroneas en el maestro de datos, el mismo tipo de analisis de errores que dio origen a esta version.
- Preprocesado para pipelines regulatorios: como paso previo a la revision humana, ordenar candidatos por similitud y reducir el numero de casos que requieren lectura detallada, aprovechando que la categoria correcta queda en el top 3 en el 86,5% de los casos del conjunto de evaluacion.

## Benchmarks y rendimiento

Resultados sobre cooperativas de vivienda retenidas (24 objetos sociales que no estuvieron en el entrenamiento de ninguna de las dos ejecuciones):

| Conjunto | Objetos | Original acc@1 | Este modelo acc@1 | Original acc@3 | Este modelo acc@3 |
|---|---|---|---|---|---|
| Cooperativas de vivienda retenidas | 24 | 0,167 | 0,625 | 0,958 | 1,000 |

Resultados sobre el conjunto de evaluacion retenido, por idioma:

| Conjunto | Objetos | Original acc@1 | Este modelo acc@1 | Original acc@3 | Este modelo acc@3 |
|---|---|---|---|---|---|
| Evaluacion retenida, todos | 3.000 | 0,662 | 0,665 | 0,867 | 0,866 |
| Evaluacion retenida, aleman | 2.256 | 0,642 | 0,646 | 0,857 | 0,856 |
| Evaluacion retenida, frances | 555 | 0,733 | 0,728 | 0,904 | 0,904 |
| Evaluacion retenida, italiano | 189 | 0,688 | 0,704 | 0,878 | 0,868 |
| Objetos no vistos en ninguna ejecucion | 55.015 | 0,607 | 0,601 | 0,861 | 0,862 |

Metricas completas sobre 3.000 objetos y 100 categorias:

| Metrica | Modelo base | Ajuste original | Este modelo |
|---|---|---|---|
| Accuracy@1 | 0,389 | 0,663 | 0,664 |
| Accuracy@3 | 0,598 | 0,867 | 0,865 |
| Accuracy@5 | 0,673 | 0,913 | 0,913 |
| NDCG@10 | 0,573 | 0,818 | 0,816 |

Traza de evaluacion durante el entrenamiento (3.000 objetos retenidos):

| Paso | Acc@1 | Acc@3 | Acc@5 | NDCG@10 |
|---|---|---|---|---|
| 0 (base) | 0,389 | 0,598 | 0,673 | 0,573 |
| 500 | 0,582 | 0,814 | 0,883 | 0,764 |
| 1000 | 0,645 | 0,858 | 0,903 | 0,804 |
| 1500 | 0,657 | 0,862 | 0,912 | 0,813 |
| 1980 | 0,664 | 0,865 | 0,913 | 0,816 |

El autor indica que esta ejecucion iba por detras del ajuste original en unos 5 puntos en una fase intermedia del entrenamiento; la model card disponible se corta en ese punto, por lo que no se dispone del texto completo de esa observacion. No se han publicado resultados de benchmarks estandar (MMLU, MTEB, BEIR) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun el tamano del modelo (595,8 M de parametros): en fp32 en torno a 2,4 GB de pesos; en fp16/bf16 en torno a 1,2 GB; en int8 en torno a 0,6 GB. Son estimaciones derivadas del numero de parametros, no datos publicados por el autor.
- El repositorio ocupa 1,2 GB, coherente con pesos en fp32.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090, incluso en fp32 y con margen para lotes grandes.
- GPU de datacenter (A100, H100, L40S) solo tendrian sentido para servir volumenes muy altos de embeddings en paralelo, no por requisitos de memoria.
- Se puede ejecutar en CPU con sentence-transformers o transformers para cargas por lotes de baja frecuencia.
- Opciones de despliegue: sentence-transformers (referencia del autor), transformers, text-embeddings-inference (etiqueta `text-embeddings-inference` en el repositorio), endpoints compatibles y, en principio, formatos ONNX u otros derivados si se generan a partir de los pesos safetensors; no se documentan conversiones a GGUF.
- Latencia y throughput: no disponibles. El entrenamiento se realizo en Apple Silicon en fp32, lo que sugiere que la inferencia es viable en hardware de consumo, pero no hay cifras publicadas de latencia ni de embeddings por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Este modelo (andyP/qwen3-embedding-0.6b-german-categories-coopfix) | 595.776.512 | no disponible (384 tokens en entrenamiento) | Apache-2.0 | de, fr, it | Especializado en objetos sociales suizos y taxonomia alemana; Acc@1 0,664 en el conjunto retenido de 3.000 objetos |
| andyP/qwen3-embedding-0.6b-german-categories (ajuste original) | mismo modelo base | no disponible | Apache-2.0 | de, fr, it | Acc@1 0,663; clasifica mal las cooperativas de vivienda (Acc@1 0,167 frente a 0,625) |
| Qwen/Qwen3-Embedding-0.6B (modelo base) | 0,6B | no disponible | Apache-2.0 | multilingue (segun el modelo original) | Acc@1 0,389 y NDCG@10 0,573 en el conjunto retenido; sin ajuste a la taxonomia suiza |

No se dispone de datos comparativos frente a otros modelos de embeddings de tamano similar (por ejemplo modelos de la familia E5, BGE o GTE) aplicados a esta misma tarea, porque el conjunto de evaluacion y la taxonomia no son publicos.

## Limitaciones y advertencias

- La taxonomia de categorias no se distribuye: sin ella, el modelo no se puede reproducir ni evaluar de forma independiente tal como lo uso el autor.
- Modelo extremadamente especializado: fuera de la tarea de clasificar objetos sociales suizos en categorias alemanas su rendimiento no esta caracterizado.
- Idiomas de entrada limitados a aleman, frances e italiano; el destino de la clasificacion esta en aleman. No hay evaluacion en otras lenguas ni en textos sin estructura de objeto social.
- Las mejoras de esta version se concentran en las cooperativas de vivienda. En el conjunto general de 55.015 objetos no vistos, la precision@1 baja ligeramente (0,607 a 0,601) y la precision@3 sube de 0,861 a 0,862; las diferencias son de menos de un punto y el autor las atribuye en parte a cambios en el orden de los datos.
- El conjunto de evaluacion italiano tiene solo 189 objetos, por lo que la diferencia de 1,6 puntos en acc@1 respecto al modelo original no es estadisticamente robusta.
- Sesgo de etiquetado: la correccion se hizo relabelando manualmente 24 cooperativas y anadiendo 24 mas. Nueve casos limite se dejaron como estaban, por lo que la frontera entre "inmobiliario" y categorias afines (coworking, cuidados a mayores, cooperativas de artistas) sigue siendo ambigua.
- No es un modelo generativo: no produce texto y, por tanto, no hay riesgo de alucinacion en el sentido habitual, pero si puede asignar categorias incorrectas cuando el objeto social es ambiguo o muy poco frecuente.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales conocidas; conviene verificar que la taxonomia de categorias usada en produccion no este sujeta a derechos de terceros.
- Sin adopcion publica ni validacion externa (0 descargas, 0 likes en el momento de la consulta); no hay informes de terceros sobre su comportamiento en produccion.
- La model card disponible esta truncada, por lo que parte del analisis del autor (incluida la comparacion intermedia con la ejecucion original) no puede verificarse.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/andyP/qwen3-embedding-0.6b-german-categories-coopfix
- Modelo original del mismo autor: https://huggingface.co/andyP/qwen3-embedding-0.6b-german-categories
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales relacionados con este modelo; los resultados devueltos por la busqueda no guardan relacion con el contenido solicitado.
