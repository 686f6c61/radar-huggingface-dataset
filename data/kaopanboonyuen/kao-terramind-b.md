# kaopanboonyuen/KAO-TerraMind-B

## Resumen

KAO-TerraMind-B es un modelo fundacional geoespacial adaptado especificamente al territorio de Tailandia para tareas de prediccion densa (segmentacion semantica) sobre imagenes satelitales multiespectrales. Lo desarrolla el investigador Teerapong Panboonyuen (kaopanboonyuen), y parte del modelo base TerraMind-1.0-base, de la familia TerraMind impulsada por IBM y la Agencia Espacial Europea (ESA) dentro del consorcio ibm-esa-geospatial.

El problema que aborda es concreto: los modelos fundacionales de observacion de la Tierra aprenden representaciones transferibles de caracter general, pero el rendimiento cae cuando se aplican a contextos geograficos muy especificos, con paisajes agricolas, dinamicas estacionales, morfologia urbana y semantica de cobertura del suelo propias de una region. KAO-TerraMind-B investiga si una adaptacion dirigida a un dominio geografico concreto mejora la transferencia de esas representaciones. Para ello se ajusto con datos de observacion de la Tierra de GISTDA (Geo-Informatics and Space Technology Development Agency de Tailandia) sobre una huella de aproximadamente 40.000 km2, con imagenes Sentinel-2 de 12 bandas multiespectrales y cobertura temporal entre 2022 y 2025.

El modelo trabaja con parches de 224 x 224 pixeles, cubre 10 clases de cobertura del suelo y se distribuye con licencia Apache 2.0 y pesos compatibles con la libreria transformers bajo el pipeline image-segmentation. Su relevancia actual reside en que es un ejemplo reproducible de adaptacion regional de un modelo fundacional geoespacial, con una evaluacion comparativa frente a varias escalas de TerraMind-1.0 (Tiny, Small, Base y Large) en F1 por clase.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado de TerraMind-1.0-base, familia de modelos fundacionales geoespaciales) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no aplica (modelo de segmentacion densa; entrada por parches de 224 x 224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, th |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (libreria transformers; se desconoce si se publican safetensors u otros) |

Datos adicionales declarados en la model card:

| Parametro | Valor |
|---|---|
| Modelo base | ibm-esa-geospatial/TerraMind-1.0-base |
| Dominio | Observacion de la Tierra (Earth Observation) |
| Region | Tailandia |
| Sensor | Sentinel-2 |
| Bandas de entrada | 12 bandas multiespectrales (el diagrama indica 10+2 bandas espectrales) |
| Tamano de parche | 224 x 224 |
| Tarea | Prediccion densa / segmentacion semantica |
| Clases | 10 clases de cobertura del suelo |
| Huella del dataset | ~40.000 km2 |
| Cobertura temporal | 2022-2025 |
| Pipeline | image-segmentation |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Se sabe que KAO-TerraMind-B deriva del modelo base TerraMind-1.0-base, un modelo fundacional geoespacial de la familia TerraMind (IBM y ESA), y que se ha sometido a un proceso de adaptacion dirigida a un dominio geografico concreto: Tailandia. El flujo descrito por el autor es "representaciones geoespaciales generales, adaptacion dirigida, GeoAI especifico de Tailandia": se parte del conocimiento general de observacion de la Tierra aprendido por TerraMind y se ajusta hacia las caracteristicas espaciales, espectrales, temporales y semanticas de los datos tailandeses.

El entrenamiento de adaptacion se realizo con datos de observacion de la Tierra de GISTDA que cubren aproximadamente 40.000 km2 en Tailandia, con observaciones Sentinel-2 multiespectrales (10+2 bandas) a lo largo de varios anos y periodos estacionales entre 2022 y 2025. Los parches se generan mediante troceado espacial (spatial chipping) hasta 224 x 224. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras estrategias de alineacion. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o mecanismos de atencion alternativos.

## Capacidades

- Segmentacion semantica densa de imagenes satelitales multiespectrales Sentinel-2, produciendo mapas de cobertura del suelo pixel a pixel.
- Clasificacion en 10 clases de cobertura del suelo: maiz, cana de azucar, mandioca, arroz, otros cultivos, agua, arboles, vegetacion inundada, area construida y otros.
- Procesamiento de entradas con 12 bandas multiespectrales (10+2) sobre parches de 224 x 224.
- Adaptacion a las caracteristicas espectrales, espaciales, temporales y semanticas del territorio tailandes.
- Cobertura de la dinamica estacional y multianual gracias a observaciones de 2022-2025.
- Uso mediante la libreria transformers con el pipeline image-segmentation.
- Idiomas declarados en la model card: ingles (en) y tailandes (th).
- No se documenta soporte de tool calling, function calling, orquestacion de agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision general, audio ni modos de razonamiento explicito.

## Casos de uso

- Monitorizacion agricola en Tailandia: el modelo distingue cultivos especificos como maiz, cana de azucar, mandioca y arroz, lo que permite construir mapas de superficie cultivada por tipo de cultivo a partir de imagenes Sentinel-2 y hacer seguimiento entre campanas.
- Cartografia de cobertura del suelo a escala regional: genera mapas densos de las 10 clases definidas sobre areas de la huella de ~40.000 km2, utiles para planificacion territorial y actualizacion de inventarios de uso del suelo.
- Seguimiento de masas de agua y zonas inundadas: las clases agua y vegetacion inundada permiten detectar y delimitar superficies inundadas, con aplicaciones en gestion de crecidas.
- Analisis de expansion urbana: la clase area construida facilita medir el crecimiento de superficies artificiales a lo largo del periodo 2022-2025.
- Inventario y seguimiento forestal: la clase arboles sirve para estimar cobertura arborea y evaluar cambios en la cubierta vegetal.
- Investigacion en modelos fundacionales geoespaciales: sirve como referencia experimental para estudiar si la adaptacion geografica dirigida mejora la transferencia de representaciones frente a modelos base de proposito general, gracias a la comparativa publicada frente a las escalas Tiny, Small, Base y Large de TerraMind-1.0.
- Integracion en pipelines de teledeteccion basados en transformers: al usar la libreria transformers y el pipeline image-segmentation, puede insertarse en flujos automaticos de procesamiento por parches de imagenes Sentinel-2.

## Benchmarks y rendimiento

La model card publica puntuaciones F1 por clase (en porcentaje) comparando variantes KAO (A, B y C) con cuatro escalas de TerraMind-1.0 (Base, Large, Small y Tiny). La columna correspondiente a este modelo es KAO-B. La informacion no aclara que son exactamente KAO-A ni KAO-C.

| Clase | KAO-A | KAO-B | KAO-C | TM-Base | TM-Large | TM-Small | TM-Tiny |
|---|---:|---:|---:|---:|---:|---:|---:|
| Maiz | 6,21 | 12,75 | 13,36 | 12,06 | 12,98 | 13,61 | 12,41 |
| Cana de azucar | 52,55 | 36,90 | 37,09 | 36,83 | 37,39 | 37,28 | 35,27 |
| Mandioca | 28,10 | 21,19 | 21,61 | 21,39 | 21,29 | 21,45 | 17,94 |
| Arroz | 55,61 | 41,77 | 41,84 | 41,60 | 41,31 | 42,04 | 38,83 |
| Otros cultivos | 78,59 | 78,16 | 79,07 | 78,52 | 74,71 | 78,65 | 74,76 |
| Agua | 82,11 | 82,41 | 82,54 | 81,99 | 81,21 | 80,08 | 78,41 |
| Arboles | 91,86 | 91,82 | 91,94 | 91,73 | 91,76 | 90,93 | 90,43 |
| Vegetacion inundada | 26,83 | 27,55 | 28,46 | 27,13 | 26,21 | 23,77 | 21,44 |
| Area construida | 85,30 | 85,22 | 85,41 | 85,01 | 84,88 | 83,34 | 81,29 |
| Otros | 47,55 | 48,28 | 48,68 | 48,36 | 47,22 | 44,58 | 42,24 |

Observaciones destacadas por el autor: KAO-TerraMind muestra un rendimiento solido en varias categorias especificas de Tailandia, en particular arboles, area construida, agua, otros cultivos y vegetacion inundada. Los resultados sugieren que la adaptacion geografica dirigida puede mejorar la transferencia de representaciones de modelos fundacionales geoespaciales a tareas locales de prediccion densa. No se publican en la informacion disponible metricas agregadas (por ejemplo mIoU global, exactitud global) ni resultados en otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica el numero de parametros ni la huella de memoria, por lo que no es posible ofrecer una cifra fiable.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. Al tratarse de un modelo de segmentacion que opera sobre parches de 224 x 224, el consumo por inferencia es acotado por el tamano de entrada, pero la viabilidad en GPU de consumo depende del numero de parametros, que no se ha publicado.
- Opciones de despliegue: la libreria declarada es transformers, con pipeline image-segmentation. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI, ni formatos GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparativa natural es contra las escalas de la propia familia TerraMind-1.0 y contra las otras variantes KAO, segun los datos de F1 por clase publicados. No se dispone de informacion sobre parametros ni contexto de estos modelos en los datos aportados.

| Modelo | Relacion | Licencia | Disponibilidad | Rendimiento (F1 por clase, datos publicados) |
|---|---|---|---|---|
| KAO-TerraMind-B | Modelo de esta ficha, adaptado a Tailandia | Apache 2.0 | HuggingFace (kaopanboonyuen/KAO-TerraMind-B) | Columna KAO-B de la tabla de benchmarks |
| TerraMind-1.0-base | Modelo base del que deriva | no disponible en la informacion | HuggingFace (ibm-esa-geospatial/TerraMind-1.0-base) | Columna TM-Base de la tabla de benchmarks |
| TerraMind-1.0-large | Escala superior de la misma familia | no disponible en la informacion | no disponible | Columna TM-Large de la tabla de benchmarks |
| TerraMind-1.0-small | Escala inferior de la misma familia | no disponible en la informacion | no disponible | Columna TM-Small de la tabla de benchmarks |
| TerraMind-1.0-tiny | Escala mas reducida de la misma familia | no disponible en la informacion | no disponible | Columna TM-Tiny de la tabla de benchmarks |
| KAO-A y KAO-C | Variantes del autor, sin descripcion en la model card | no disponible | no disponible | Columnas KAO-A y KAO-C de la tabla de benchmarks |

En los datos publicados, KAO-B no supera de forma sistematica a las escalas de TerraMind-1.0 en todas las clases: por ejemplo, TM-Small obtiene 13,61 frente a 12,75 en maiz, y TM-Base 48,36 frente a 48,28 en la clase otros. En cambio, KAO-C presenta los mejores valores en varias clases (arboles, area construida, agua, vegetacion inundada, otros cultivos y otros), mientras que KAO-A destaca en cana de azucar, mandioca y arroz. No se dispone de modelos comparables externos (por ejemplo otros modelos fundacionales geoespaciales) en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible. La especializacion geografica en Tailandia implica que el comportamiento fuera de esa region no esta caracterizado.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de error de clasificacion pixel a pixel. Las puntuaciones F1 por clase son bajas en varias categorias (maiz 12,75; mandioca 21,19; vegetacion inundada 27,55), lo que indica una fiabilidad limitada en esas clases.
- Limitaciones de contexto geografico: el modelo esta adaptado a una huella de aproximadamente 40.000 km2 en Tailandia y a datos Sentinel-2; su aplicacion a otras regiones, sensores o resoluciones no esta validada.
- Limitaciones temporales: la cobertura del dataset de adaptacion abarca 2022-2025; no se ha documentado el comportamiento fuera de ese intervalo.
- Limitaciones de idioma: los idiomas declarados son en y th, pero al tratarse de un modelo de segmentacion no hay generacion de texto asociada.
- Limitaciones de tarea: el modelo solo cubre 10 clases de cobertura del suelo; cualquier categoria fuera de ese conjunto no sera representada correctamente.
- Licencia: Apache 2.0, lo que permite uso comercial, pero se debe verificar aparte la licencia y las condiciones del modelo base TerraMind-1.0-base y de los datos GISTDA utilizados en la adaptacion, que no se detallan en la model card.
- Caveats para produccion: no se publican parametros, formato de pesos, requisitos de hardware ni metricas agregadas, lo que dificulta el dimensionamiento de despliegues. Ademas, el modelo registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.
- Fecha de publicacion del repositorio: creado el 2026-10-07 y actualizado el mismo dia; se trata de una publicacion reciente y sin historial de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kaopanboonyuen/KAO-TerraMind-B
- Perfil del autor en HuggingFace: https://huggingface.co/kaopanboonyuen
- Modelo base TerraMind-1.0-base: https://huggingface.co/ibm-esa-geospatial/TerraMind-1.0-base
- GitHub del autor: https://github.com/kaopanboonyuen
- Repositorio del sitio personal del autor: https://github.com/kaopanboonyuen/kaopanboonyuen.github.io
- Sitio personal: https://kaopanboonyuen.github.io/
- Referencia a publicacion sobre IA para observacion de la Tierra (identificador 2511.02462, publicado el 4 de noviembre de 2025) mencionada en el perfil de HuggingFace del autor: https://huggingface.co/kaopanboonyuen
