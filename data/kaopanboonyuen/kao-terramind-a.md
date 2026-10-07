# kaopanboonyuen/KAO-TerraMind-A

## Resumen

KAO-TerraMind-A es un modelo de fundación geoespacial adaptado específicamente a Tailandia para tareas de predicción densa sobre imágenes de observación de la Tierra, en concreto segmentación semántica de cobertura del suelo. Lo desarrolla el usuario kaopanboonyuen y se deriva mediante ajuste fino del modelo base ibm-esa-geospatial/TerraMind-1.0-base, perteneciente a la familia TerraMind-1.0 impulsada por IBM y la Agencia Espacial Europea.

El modelo aborda un problema recurrente en los modelos de fundación geoespaciales: aunque aprenden representaciones transferibles de gran escala, el contexto geográfico (distribución espacial, dinámica estacional, morfología urbana y semántica local de cobertura del suelo) condiciona fuertemente su rendimiento. KAO-TerraMind-A investiga si la adaptación dirigida a un dominio geográfico concreto mejora la transferencia de esas representaciones a tareas de predicción densa locales.

Trabaja sobre imágenes multiespectrales Sentinel-2 de 12 bandas con parches de 224 × 224 píxeles y predice 10 clases de cobertura del suelo. La adaptación se realizó con datos de observación de la Tierra de GISTDA que cubren aproximadamente 40.000 km² en Tailandia, con cobertura temporal entre 2022 y 2025. El modelo está publicado bajo licencia Apache 2.0 y es compatible con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de TerraMind-1.0-base; modelo de fundacion geoespacial para segmentacion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; parches de entrada de 224 x 224 pixeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles), th (tailandes) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (etiqueta de libreria: transformers) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de KAO-TerraMind-A mas alla de que hereda la del modelo base TerraMind-1.0-base y de que su tarea es la prediccion densa (segmentacion semantica de imagenes). Se trata de un modelo de fundacion geoespacial, no de un modelo de lenguaje, por lo que la entrada son imagenes multiespectrales y la salida es un mapa de clases por pixel.

El proceso de adaptacion parte de datos de observacion de la Tierra de GISTDA (Tailandia) con imagenes Sentinel-2 de 12 bandas espectrales, observaciones multianuales y estacionales, y una huella de aproximadamente 40.000 km². Los datos se dividen en parches espaciales de 224 × 224 pixeles antes de la prediccion densa. No se especifican en la model card el numero de tokens o muestras de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO (no aplicables de forma estandar a un modelo de segmentacion). La unica innovacion descrita es el propio enfoque de adaptacion geografica dirigida.

## Capacidades

- Segmentacion semantica densa de imagenes satelitales multiespectrales Sentinel-2 (12 bandas).
- Clasificacion de cobertura del suelo en 10 clases: maize (maiz), sugarcane (cana de azucar), cassava (mandioca), rice (arroz), other crops (otros cultivos), water (agua), trees (arboles), flooded vegetation (vegetacion inundada), built area (zona construida) y other (otros).
- Procesamiento de parches de 224 × 224 pixeles con resolucion por pixel.
- Adaptacion a caracteristicas espectrales, espaciales, temporales y semanticas del territorio tailandes.
- Capacidad de transferencia desde un modelo de fundacion geoespacial general a un dominio geografico especifico.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision general, tool calling, agentes ni razonamiento multi-paso; la tarea es exclusivamente de vision por segmentacion.

## Casos de uso

- Monitorizacion agricola de arroz y cana de azucar: el modelo distingue clases como Rice (F1 de 55,61) y Sugarcane (F1 de 52,55) sobre imagenes Sentinel-2, lo que permite seguimiento de cultivos a escala regional en Tailandia.
- Cartografiado de cobertura del suelo: genera mapas densos de las 10 clases sobre una huella de referencia de 40.000 km², util para inventarios territoriales y planificacion.
- Deteccion de superficies de agua y vegetacion inundada: las clases Water (F1 de 82,11) y Flooded Vegetation (26,83) permiten identificar cuerpos de agua y zonas inundadas estacionalmente.
- Analisis de expansion urbana: la clase Built Area alcanza un F1 de 85,30, adecuada para medir crecimiento de zonas construidas.
- Monitorizacion forestal y de arbolado: la clase Trees obtiene el F1 mas alto (91,86), lo que la hace fiable para seguimiento de masa arborea.
- Apoyo a la respuesta ante inundaciones: la combinacion de clases de agua, vegetacion inundada y zonas construidas permite estimar extension de afectacion.
- Investigacion en adaptacion de modelos de fundacion geoespaciales: sirve como referencia para estudiar cuanto mejora el ajuste geografico dirigido frente a modelos generales TerraMind.

## Benchmarks y rendimiento

Resultados de F1 por clase (%) publicados en la model card, comparando KAO-TerraMind-A (KAO-A) con otras variantes KAO (B, C) y con escalas del modelo TerraMind-1.0 (Base, Large, Small, Tiny):

| Clase | KAO-A | KAO-B | KAO-C | TM-Base | TM-Large | TM-Small | TM-Tiny |
|---|---:|---:|---:|---:|---:|---:|---:|
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

Observaciones destacadas por el autor: KAO-TerraMind-A mejora respecto a las variantes TerraMind-1.0 en clases como Sugarcane (52,55 frente a 37,39 de TM-Large), Rice (55,61 frente a 42,04 de TM-Small), Cassava (28,10 frente a 21,61 de KAO-C) y Trees (91,86). En otras clases queda por detras de KAO-B o KAO-C, y el rendimiento en Maize es bajo en todas las variantes del experimento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican parametros totales ni requisitos de memoria).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card indica compatibilidad con la libreria transformers y con endpoints del Hub (etiqueta endpoints_compatible). No se detallan otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Sensores / entrada | Tarea | Licencia | Rendimiento relativo (F1) |
|---|---|---|---|---|---|
| KAO-TerraMind-A | TerraMind-1.0-base | Sentinel-2, 12 bandas, 224 x 224 | Segmentacion de 10 clases | apache-2.0 | Mejor en Sugarcane, Rice y Cassava; Trees 91,86 |
| TerraMind-1.0-Large | TerraMind-1.0 | Sentinel-2, 12 bandas | Segmentacion de 10 clases | no disponible en esta ficha | Sugarcane 37,39; Rice 41,31 |
| TerraMind-1.0-Small | TerraMind-1.0 | Sentinel-2, 12 bandas | Segmentacion de 10 clases | no disponible en esta ficha | Maize 13,61; Rice 42,04 |
| TerraMind-1.0-Tiny | TerraMind-1.0 | Sentinel-2, 12 bandas | Segmentacion de 10 clases | no disponible en esta ficha | Rendimiento mas bajo en la mayoria de clases |
| KAO-B / KAO-C | TerraMind-1.0-base | Sentinel-2, 12 bandas | Segmentacion de 10 clases | no disponible en esta ficha | KAO-C mejor en Water, Trees, Built Area y Other |

No se dispone de especificaciones de parametros, contexto ni licencia de las variantes TerraMind dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento muy bajo en la clase Maize (F1 de 6,21), inferior al de todas las variantes comparadas; no es fiable para esa clase.
- Clases con F1 bajo o moderado: Flooded Vegetation (26,83), Cassava (28,10) y Other (47,55), que requieren validacion antes de usarse en produccion.
- Riesgo de error de clasificacion por pixel (falsos positivos y negativos) en lugar de "alucinacion" textual; el modelo puede asignar una clase incorrecta en pixeles ambiguos.
- La adaptacion esta restringida al dominio geografico de Tailandia (aproximadamente 40.000 km² de datos GISTDA), por lo que la transferencia a otras regiones no esta garantizada.
- Los datos de adaptacion cubren el periodo 2022-2025; cambios posteriores en usos del suelo o regimenes de cultivo pueden degradar el rendimiento.
- Dependencia del sensor Sentinel-2 y sus 12 bandas multiespectrales; no se documenta funcionamiento con otras fuentes de imagen.
- El modelo no esta disenado para generacion de texto, codigo ni tareas multimodales generales.
- La licencia apache-2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base TerraMind-1.0-base del que deriva.
- No se publican detalles de sesgos, composicion del dataset de entrenamiento ni metricas globales agregadas (mIoU, accuracy), lo que dificulta una evaluacion completa.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kaopanboonyuen/KAO-TerraMind-A
- Modelo base: https://huggingface.co/ibm-esa-geospatial/TerraMind-1.0-base
- No se han encontrado papers, blogs, repositorios ni demos adicionales en los resultados de busqueda web proporcionados.
