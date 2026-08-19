# pyaging/senmortalityage

## Resumen

El modelo `senmortalityage` es un reloj de envejecimiento basado en metilación de ADN que predice el riesgo de mortalidad en humanos. Fue desarrollado por el equipo de pyaging (Kasamoto, Gibson, Moqri, Smith y Higgins-Chen) y se describe en el artículo "DNA methylation signatures of cellular senescence are not reversed by senolytic treatment" publicado en *Aging Cell* en 2026. El modelo utiliza una regresión de Cox con regularización elastic net, restringida a CpGs cuya dirección de cambio es concordante entre senescencia, edad y mortalidad, y se entrenó en la cohorte del Framingham Heart Study.

A diferencia de los modelos de lenguaje, este no es un transformer ni una red neuronal profunda, sino un modelo estadístico de supervivencia aplicado a datos de metilación de ADN de sangre completa. Su relevancia radica en que permite estimar el riesgo de mortalidad a partir de un perfil epigenético, una herramienta útil en investigación biomédica sobre envejecimiento y senescencia celular. El modelo se distribuye bajo licencia BSD-3-Clause e integra con la librería `pyaging` para su uso directo en pipelines de análisis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion de Cox con regularizacion elastic net |
| Parametros totales | No disponible (modelo estadistico, no neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No aplica (trabaja con datos de metilacion, no texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | No disponible (integrado en libreria pyaging) |

## Arquitectura y entrenamiento

El modelo se basa en una regresion de Cox con penalizacion elastic net, una tecnica estadistica clasica para analisis de supervivencia. La innovacion principal es la seleccion de CpGs: se restringe el conjunto de caracteristicas a aquellos sitios de metilacion cuya direccion de cambio es concordante entre tres fenotipos: senescencia celular, edad cronologica y riesgo de mortalidad. Esto permite construir un predictor mas especifico biologicamente que los relojes epigeneticos convencionales.

El entrenamiento se realizo en la cohorte del Framingham Heart Study, un estudio epidemiologico longitudinal de larga duracion. Los datos de entrada son niveles de metilacion de ADN obtenidos de sangre completa. No se dispone de informacion detallada sobre el numero de muestras, el numero de CpGs finales ni el proceso de validacion externa en la informacion proporcionada. El modelo se distribuye como parte de la libreria `pyaging`, que gestiona la descarga de pesos y la prediccion automatica.

## Capacidades

- Prediccion del riesgo de mortalidad a partir de perfiles de metilacion de ADN en sangre completa.
- Integracion directa con la libreria `pyaging` mediante la funcion `pya.pred.predict_age(adata, ["senmortalityage"])`.
- Restriccion a CpGs con direccion concordante entre senescencia, edad y mortalidad, lo que mejora la interpretabilidad biologica.
- Especifico para la especie Homo sapiens y para tejido de sangre completa.
- Modelo estadistico ligero, sin requisitos de GPU ni de grandes recursos computacionales.

## Casos de uso

- Investigacion en biologia del envejecimiento: estimar el riesgo de mortalidad en cohortes de estudio para correlacionar con otros biomarcadores de senescencia.
- Estudios epidemiologicos longitudinales: aplicar el modelo a datos de metilacion de grandes cohortes para evaluar el impacto de factores ambientales o geneticos en la mortalidad.
- Validacion de intervenciones anti-envejecimiento: comprobar si un tratamiento (por ejemplo, senoliticos) modifica el riesgo de mortalidad epigenético antes y despues de la intervencion.
- Analisis de datos de biobancos: integrar el predictor en pipelines de analisis de datos de metilacion de proyectos como UK Biobank o similares.
- Desarrollo de relojes epigeneticos personalizados: usar el modelo como referencia para comparar con otros predictores de mortalidad.
- Docencia y formacion en bioinformatica: ejemplo practico de aplicacion de regresion de Cox con regularizacion elastic net a datos omicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como AUC, indice de concordancia (C-index) ni comparaciones con otros relojes de mortalidad en la documentacion del modelo.

## Requisitos de hardware

- No se requieren GPU. El modelo es un conjunto de coeficientes de regresion que se aplican a una matriz de metilacion; la prediccion se realiza en CPU en segundos.
- Memoria RAM: depende del numero de CpGs del dataset de entrada, pero tipicamente menos de 1 GB para un array de metilacion estandar.
- Compatible con cualquier entorno Python donde se pueda instalar `pyaging` (Linux, macOS, Windows).
- No requiere despliegue en servidores dedicados; puede ejecutarse en un portatil convencional.

## Comparativa con modelos similares

Existen otros relojes epigeneticos de mortalidad como GrimAge, PhenoAge o DNAm-based mortality predictors. Sin embargo, no se dispone en la informacion proporcionada de datos comparativos cuantitativos (C-index, AUC, etc.) entre `senmortalityage` y estos modelos. Se puede indicar que:

- GrimAge (Lu et al., 2019) se basa en metilacion de ADN y estima la edad biologica y el riesgo de mortalidad, pero utiliza una metodologia distinta (combinacion de surrogados de proteinas y edad).
- PhenoAge (Levine et al., 2018) se entrena sobre biomarcadores fenotipicos y metilacion, tambien con regresion de Cox.
- `senmortalityage` se diferencia por su restriccion a CpGs de senescencia concordante, lo que podria ofrecer una mayor especificidad biologica, pero no hay datos publicados para confirmarlo.

No se dispone de una tabla comparativa con valores numericos.

## Limitaciones y advertencias

- Entrenado exclusivamente en la cohorte del Framingham Heart Study, que es mayoritariamente de ascendencia europea; su transferibilidad a otras poblaciones no esta validada.
- Solo aplicable a datos de metilacion de sangre completa; no funciona con otros tejidos ni con datos de expresion genica.
- No es un modelo causal: predice riesgo de mortalidad asociado, pero no establece relaciones causales.
- La informacion sobre el numero exacto de CpGs utilizados, el tamaño de la muestra de entrenamiento y las metricas de rendimiento no esta disponible en la documentacion publica.
- Requiere datos de metilacion preprocesados y normalizados segun el formato esperado por `pyaging`; un mal preprocesado puede dar resultados invalidos.
- Licencia BSD-3-Clause permite uso comercial, pero se recomienda revisar los terminos de la libreria `pyaging` y del articulo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pyaging/senmortalityage
- Libreria pyaging y catalogo de relojes: https://pyaging.readthedocs.io
- Articulo cientifico: Kasamoto, K., Gibson, J., Moqri, M., Smith, R. & Higgins-Chen, A.T. DNA methylation signatures of cellular senescence are not reversed by senolytic treatment. Aging Cell 25, e70430 (2026). https://doi.org/10.1111/acel.70430
