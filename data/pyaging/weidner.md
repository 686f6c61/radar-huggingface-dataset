# pyaging/weidner

## Resumen

El modelo `pyaging/weidner` es un reloj epigenético de envejecimiento que estima la edad biológica de un individuo a partir de los niveles de metilación del ADN en sangre completa. Fue desarrollado por Weidner et al. en 2014 y publicado en *Genome Biology*. A diferencia de los modelos de lenguaje, no es una red neuronal ni un transformer, sino una ecuación de regresión lineal multivariante que utiliza únicamente tres sitios CpG seleccionados de perfiles de metilación de la plataforma Illumina 27K.

El modelo está integrado en la librería `pyaging`, un ecosistema de Python para calcular relojes epigenéticos a partir de datos de metilación. Su relevancia radica en que ofrece una estimación mínima y de bajo coste del envejecimiento biológico, lo que lo hace adecuado para estudios poblacionales o clínicos donde se dispone de pocas CpGs o se busca simplicidad computacional. La ecuación fue ajustada sobre valores beta de bisulfito-pirosecuenciación de 82 muestras de sangre y validada en 69 muestras independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal multivariante (3 sitios CpG) |
| Parametros totales | 3 coeficientes + intercepto (no disponible el valor exacto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No aplica |
| Licencia | BSD-3-Clause |
| Formato de pesos | No disponible (repo de 0.0 GB, probablemente un archivo de texto o JSON con coeficientes) |

## Arquitectura y entrenamiento

El modelo es una regresion lineal multivariante que predice la edad biologica a partir de los niveles de metilacion (valores beta) en tres sitios CpG especificos. Los sitios fueron seleccionados a partir de perfiles de metilacion de sangre completa obtenidos con la plataforma Illumina 27K. La ecuacion final se ajusto mediante minimos cuadrados ordinarios sobre valores beta de pirosecuenciacion dirigida a bisulfito de 82 muestras de sangre. La validacion se realizo en un conjunto independiente de 69 muestras.

No se dispone de informacion sobre el uso de tecnicas como RLHF o DPO, ya que no es un modelo de lenguaje. La innovacion principal es la reduccion del numero de marcadores a solo tres CpGs, lo que abarata y simplifica la medicion frente a relojes que requieren cientos o miles de sitios.

## Capacidades

- Prediccion de edad biologica en humanos a partir de metilacion de ADN en sangre completa.
- Utiliza exclusivamente tres sitios CpG, lo que permite medir con pirosecuenciacion dirigida o arrays de baja densidad.
- Integrado en la libreria `pyaging` mediante la funcion `pya.pred.predict_age(adata, ["weidner"])`.
- Adecuado para estimaciones rapidas en estudios donde no se requiere alta precision individual.
- No soporta generacion de texto, codigo, vision ni otras capacidades de modelos de lenguaje.

## Casos de uso

- Estudios epidemiologicos de envejecimiento: el modelo permite estimar la edad biologica en grandes cohortes de sangre sin necesidad de arrays de metilacion completos, usando solo tres CpGs.
- Investigacion clinica en gerociencia: se puede emplear como biomarcador de envejecimiento en estudios longitudinales de salud y mortalidad.
- Validacion de intervenciones anti-envejecimiento: al ser una medida simple, puede usarse en ensayos preclinicos o clinicos para monitorizar cambios en la edad epigenetica.
- Analisis de datos de metilacion ya existentes: si un dataset contiene los tres sitios CpG especificos, se puede aplicar el modelo sin recalibrar.
- Educacion y divulgacion: como ejemplo didactico de reloj epigenetico en cursos de bioinformatica o biologia del envejecimiento.
- Control de calidad en laboratorios de metilacion: comparar estimaciones de edad con la edad cronologica para detectar errores en la manipulacion de muestras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo original reporta una correlacion entre edad estimada y cronologica en la validacion (69 muestras), pero los valores numericos exactos no estan incluidos en la model card. Se recomienda consultar la publicacion de Weidner et al. (2014) para obtener metricas de rendimiento.

## Requisitos de hardware

- No requiere GPU. Es una regresion lineal con tres variables, por lo que se ejecuta en cualquier CPU.
- Memoria RAM minima: menos de 1 MB para los coeficientes.
- No aplica cuantizacion ni despliegue en servidores de inferencia.
- Se integra en Python a traves de `pyaging`, que depende de librerias estandar de ciencia de datos (numpy, pandas, anndata).

## Comparativa con modelos similares

Existen otros relojes epigeneticos para sangre completa, como el reloj de Horvath (2013) que usa 353 CpGs, o el de Hannum (2013) con 71 CpGs. A diferencia de `weidner`, estos modelos son mas complejos y requieren plataformas de arrays de alta densidad (450K o EPIC). El reloj de Weidner destaca por su minimalismo, pero probablemente tenga menor precision individual. No se dispone de comparativas cuantitativas en la informacion proporcionada.

| Modelo | Numero de CpGs | Tejido | Metodo | Precision reportada |
|---|---|---|---|---|
| weidner | 3 | Sangre | Regresion lineal | No disponible |
| Horvath | 353 | Multi-tejido | Regresion penalizada | No disponible |
| Hannum | 71 | Sangre | Regresion penalizada | No disponible |

## Limitaciones y advertencias

- Utiliza solo tres CpGs, lo que puede limitar la precision en estimaciones individuales frente a relojes con mas marcadores.
- Fue entrenado exclusivamente en sangre completa; no es aplicable a otros tejidos sin recalibracion.
- La ecuacion se ajusto con un numero reducido de muestras (82 de entrenamiento, 69 de validacion), lo que puede afectar la robustez en poblaciones diversas.
- No se dispone de informacion sobre sesgos por edad, sexo o etnia.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda citar el articulo original.
- No es un modelo de lenguaje; cualquier uso fuera de la prediccion de edad biologica carece de sentido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pyaging/weidner
- Documentacion de pyaging: https://pyaging.readthedocs.io
- Articulo original: Weidner, C. I., Lin, Q., Koch, C. M., et al. (2014). Aging of blood can be tracked by DNA methylation changes at just three CpG sites. *Genome Biology*, 15, R24. https://doi.org/10.1186/gb-2014-15-2-r24
