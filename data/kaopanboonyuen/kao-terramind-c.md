# kaopanboonyuen/KAO-TerraMind-C

## Resumen

KAO-TerraMind-C es un modelo fundacional geoespacial adaptado especificamente al territorio de Tailandia para tareas de prediccion densa sobre imagenes de satelite. Lo desarrolla el usuario kaopanboonyuen a partir del modelo base ibm-esa-geospatial/TerraMind-1.0-base, y su proposito es trasladar las representaciones generales de un modelo fundacional de observacion de la Tierra hacia un dominio geografico concreto, en este caso Tailandia, donde las dinamicas agricolas, estacionales y de morfologia urbana difieren de las de otros contextos globales.

El modelo trabaja sobre imagenes multiespectrales de Sentinel-2 con 12 bandas, en parches de 224 x 224 pixeles, y resuelve segmentacion semantica sobre 10 clases de cobertura del suelo (maiz, cana de azucar, mandioca, arroz, otros cultivos, agua, arboles, vegetacion inundada, area construida y otros). La adaptacion se ha realizado con datos de observacion de la Tierra de GISTDA que cubren aproximadamente 40.000 km2 en Tailandia, con cobertura temporal entre 2022 y 2025.

Su relevancia radica en que aborda una pregunta abierta en el ambito de los modelos fundacionales geoespaciales: hasta que punto una adaptacion dirigida a un dominio geografico concreto mejora la transferencia de representaciones hacia tareas locales de prediccion densa. El modelo se publica bajo licencia Apache 2.0, integrado en la libreria transformers y con la etiqueta de pipeline image-segmentation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de ibm-esa-geospatial/TerraMind-1.0-base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), tailandes (th) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (libreria transformers) |
| Modelo base | ibm-esa-geospatial/TerraMind-1.0-base |
| Tarea | Prediccion densa / segmentacion semantica |
| Dominio | Observacion de la Tierra |
| Region | Tailandia |
| Sensor | Sentinel-2 |
| Bandas de entrada | 12 bandas multiespectrales |
| Tamano de parche | 224 x 224 |
| Clases de salida | 10 clases de cobertura del suelo |
| Huella del dataset | ~40.000 km2 |
| Cobertura temporal | 2022-2025 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de su origen como derivado de TerraMind-1.0-base, un modelo fundacional geoespacial. Se describe como un modelo de prediccion densa que toma como entrada imagenes multiespectrales de Sentinel-2 de 12 bandas y produce mapas de cobertura del suelo a resolucion de pixel. No se especifican en la documentacion proporcionada el numero de parametros, el tipo de backbone (transformer, hibrido u otro) ni la composicion completa del dataset de preentrenamiento del modelo base.

El proceso de adaptacion se apoya en datos de observacion de la Tierra de GISTDA que cubren aproximadamente 40.000 km2 en Tailandia, con observaciones Sentinel-2 multiespectrales a lo largo de varios anos y periodos estacionales (2022-2025). El flujo descrito consiste en la toma de datos GISTDA, la division espacial en parches de 224 x 224 y la produccion de un mapa denso de cobertura del suelo. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo coherente con una tarea de segmentacion. Tampoco se detalla el numero de tokens o muestras de entrenamiento ni innovaciones tecnicas especificas mas alla de la propia adaptacion geografica dirigida.

## Capacidades

- Segmentacion semantica densa de imagenes satelitales multiespectrales de Sentinel-2 (12 bandas).
- Clasificacion de cobertura del suelo en 10 categorias: maiz, cana de azucar, mandioca, arroz, otros cultivos, agua, arboles, vegetacion inundada, area construida y otros.
- Prediccion a nivel de pixel sobre parches de 224 x 224, orientada a la generacion de cartografia de cobertura del suelo.
- Adaptacion al contexto geografico, espectral, temporal y semantico especifico de Tailandia.
- Capacidad de trabajar con observaciones multitemporales (cobertura 2022-2025), lo que permite capturar dinamicas estacionales.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No se documenta soporte de vision general, audio, thinking mode ni generacion de texto; el modelo es especificamente de segmentacion de imagenes.
- Idiomas declarados en la ficha: ingles y tailandes (relevantes para la documentacion y las etiquetas del dominio, no para la tarea de vision).

## Casos de uso

- Cartografia agricola nacional: el modelo genera mapas densos de cultivos (maiz, cana de azucar, mandioca, arroz y otros) sobre imagenes Sentinel-2, lo que permite a organismos como GISTDA monitorizar la superficie cultivada a escala de pixel.
- Monitorizacion de arrozales y estacionalidad: gracias a la cobertura temporal 2022-2025 y a la clase especifica de arroz, permite seguir el ciclo del cultivo y detectar cambios de uso del suelo entre campanas.
- Gestion de recursos hidricos: la discriminacion entre las clases de agua, vegetacion inundada y otros cultivos facilita el seguimiento de masas de agua y zonas anegadas para la gestion de inundaciones.
- Planificacion urbana y seguimiento del crecimiento de area construida: la clase de area construida (Built Area) permite detectar expansion urbana y actualizar cartografia de asentamientos.
- Monitorizacion forestal y de arbolado: la clase de arboles alcanza los F1 mas altos del modelo, lo que lo hace util para inventario y vigilancia de cubierta arborea.
- Evaluacion de danos por inundaciones: la clase de vegetacion inundada permite identificar areas afectadas tras episodios de crecidas y apoyar tareas de respuesta.
- Investigacion en modelos fundacionales geoespaciales: sirve como caso de estudio para medir cuanto aporta la adaptacion geografica dirigida frente a modelos genericos de la misma familia.

## Benchmarks y rendimiento

La model card publica resultados de F1 por clase (en porcentaje) comparando KAO-TerraMind-C con otras variantes de adaptacion (KAO-A, KAO-B) y con distintas escalas de TerraMind-1.0 (TM-Base, TM-Large, TM-Small, TM-Tiny).

| Clase | KAO-A | KAO-B | KAO-C | TM-Base | TM-Large | TM-Small | TM-Tiny |
|---|---|---|---|---|---|---|---|
| Maize | 6,21 | 12,75 | 13,36 | 12,06 | 12,98 | 13,61 | 12,41 |
| Sugarcane | 52,55 | 36,90 | 37,09 | 36,83 | 37,39 | 37,28 | 35,27 |
| Cassava | 28,10 | 21,19 | 21,61 | 21,39 | 21,29 | 21,45 | 17,94 |
| Rice | 55,61 | 41,77 | 41,84 | 41,60 | 41,31 | 42,04 | 38,83 |
| Other Crops | 78,59 | 78,16 | 79,07 | 78,52 | 74,71 | 78,65 | 74,76 |
| Water | 82,11 | 82,41 | 82,54 | 81,99 | 81,21 | 80,08 | 78,41 |
| Trees | 91,86 | 91,82 | 91,94 | 91,73 | 91,76 | 90,93 | 90,43 |
| Flooded Vegetation | 26,83 | 27,55 | 28,46 | 27,13 | 26,21 | 23,77 | 21,44 |
| Built Area | 85,30 | 85,22 | 85,41 | 85,01 | 84,88 | 83,34 | 81,29 |
| Other | 47,55 | 48,28 | 48,68 | 48,36 | 47,22 | 44,58 | 42,24 |

Observaciones destacadas por el autor: KAO-TerraMind-C obtiene los mejores resultados en Other Crops (79,07), Water (82,54), Trees (91,94), Flooded Vegetation (28,46), Built Area (85,41) y Other (48,68). Las clases con rendimiento mas bajo son Maize (13,36) y Cassava (21,61), y Flooded Vegetation se mantiene en valores bajos (28,46) en todas las variantes. KAO-A presenta el mejor F1 en Sugarcane (52,55), Rice (55,61) y Cassava (28,10), mientras que KAO-C es mas competitivo en el resto. No se aportan metricas globales agregadas (mIoU, accuracy global) ni resultados sobre conjuntos de validacion externos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentacion proporcionada. Dependera del numero de parametros del backbone, dato que tampoco se especifica.
- GPU recomendadas: no disponible. Al operar sobre parches de 224 x 224 y con 12 bandas de entrada, el coste por inferencia tiende a ser moderado, pero no se aportan cifras concretas.
- Viabilidad en GPU de consumo: no disponible. No se puede confirmar si el modelo cabe en tarjetas tipo RTX 4090 o similares sin los datos de parametros y precision.
- Opciones de despliegue: el modelo se distribuye a traves de la libreria transformers y esta marcado como compatible con endpoints, por lo que el despliegue estandar pasaria por pipelines de transformers y servicios de inferencia gestionados. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI, que por otra parte estan orientados a modelos de lenguaje y no necesariamente a segmentacion de imagenes.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparativa dentro de la propia familia TerraMind-1.0, segun los resultados de F1 por clase publicados.

| Modelo | Origen | Adaptacion geografica | Clases | Mejores clases destacadas |
|---|---|---|---|---|
| KAO-TerraMind-C | Derivado de TerraMind-1.0-base | Tailandia (GISTDA, ~40.000 km2) | 10 | Other Crops (79,07), Water (82,54), Trees (91,94), Built Area (85,41) |
| KAO-TerraMind-A | Derivado de TerraMind (variante) | Tailandia | 10 | Sugarcane (52,55), Rice (55,61), Cassava (28,10) |
| KAO-TerraMind-B | Derivado de TerraMind (variante) | Tailandia | 10 | Rendimiento intermedio en la mayoria de clases |
| TerraMind-1.0-base | Modelo base de IBM/ESA | Generico | 10 (en esta evaluacion) | Maize 12,06; Trees 91,73 |
| TerraMind-1.0-large | Modelo base de IBM/ESA | Generico | 10 (en esta evaluacion) | Similar al base, sin ventaja clara en estas clases |
| TerraMind-1.0-small | Modelo base de IBM/ESA | Generico | 10 (en esta evaluacion) | Maize 13,61; Rice 42,04 |
| TerraMind-1.0-tiny | Modelo base de IBM/ESA | Generico | 10 (en esta evaluacion) | Rendimiento inferior en la mayoria de clases |

No se dispone de comparaciones con otros modelos fundacionales geoespaciales externos (por ejemplo, otros GFMs de segmentacion) en la informacion proporcionada. Los parametros, contexto y licencia de las variantes TerraMind-1.0 no se detallan en la documentacion disponible.

## Limitaciones y advertencias

- Sesgos geograficos: el modelo esta adaptado especificamente a Tailandia y su rendimiento fuera de ese dominio no esta documentado; su uso en otras regiones puede degradarse de forma notable.
- Clases con bajo rendimiento: Maize (13,36) y Cassava (21,61) presentan F1 muy bajos, y Flooded Vegetation (28,46) tambien es limitada, lo que desaconseja su uso fiable para esas categorias sin validacion adicional.
- Alucinacion y errores de clasificacion: como modelo de segmentacion, el riesgo se manifiesta en falsos positivos y negativos por pixel; las clases minoritarias o espectralmente similares son especialmente propensas a confusion.
- Datos de entrenamiento acotados: la adaptacion se basa en una huella de ~40.000 km2 y un rango temporal 2022-2025, lo que limita la generalizacion espacial y temporal.
- Dependencia del sensor: el modelo espera entradas Sentinel-2 con 12 bandas y parches de 224 x 224; entradas de otros sensores o resoluciones no estan soportadas segun la documentacion.
- Restricciones de licencia: el modelo se publica bajo Apache 2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base ibm-esa-geospatial/TerraMind-1.0-base y de los datos GISTDA de origen.
- Falta de documentacion tecnica: no se especifican parametros, arquitectura interna, cuantizaciones ni metricas globales, lo que dificulta la planificacion de despliegue en produccion.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la fecha de actualizacion es muy reciente respecto a la de creacion, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kaopanboonyuen/KAO-TerraMind-C
- Modelo base: https://huggingface.co/ibm-esa-geospatial/TerraMind-1.0-base
- No se han proporcionado en la informacion disponible enlaces adicionales a papers, blogs, repositorios o demos.
