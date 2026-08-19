# pyaging/senchronoage

## Resumen

`senchronoage` es un reloj epigenético de edad cronológica desarrollado por el grupo de investigación de Kasamoto, Gibson, Moqri, Smith y Higgins-Chen, publicado en 2026 en *Aging Cell*. El modelo predice la edad biológica de un individuo a partir de datos de metilación de ADN obtenidos de sangre completa humana, utilizando exclusivamente sitios CpG cuyas direcciones de metilación son concordantes entre análisis de senescencia *in vitro*, envejecimiento y mortalidad. Esta restricción busca que el reloj capture específicamente la señal de senescencia celular, en lugar de mezclarla con otros cambios epigenéticos asociados a la edad.

Desde el punto de vista técnico, se trata de un modelo de regresión *elastic net*, una técnica de regularización lineal que combina penalizaciones L1 y L2, muy utilizada en el campo de los relojes epigenéticos por su capacidad para manejar datasets de alta dimensionalidad (cientos de miles de CpGs) con relativamente pocas muestras. El modelo está implementado en la librería `pyaging` y se distribuye bajo licencia BSD-3-Clause, lo que permite uso comercial y académico sin restricciones significativas.

La relevancia de este modelo radica en que, a diferencia de otros relojes de edad que utilizan CpGs generales, `senchronoage` se centra en marcadores asociados a la senescencia celular, lo que podría permitir distinguir entre envejecimiento cronológico y envejecimiento acelerado por senescencia. Esto tiene implicaciones directas en la investigación de terapias senolíticas y en el estudio de enfermedades relacionadas con la edad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion elastic net (lineal con regularizacion L1+L2) |
| Parametros totales | No disponible (modelo de regresion con coeficientes por CpG; el numero exacto no se especifica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo biologico, no linguistico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | No disponible (se distribuye a traves de la libreria `pyaging`, probablemente como archivos de coeficientes) |

## Arquitectura y entrenamiento

El modelo utiliza una regresion *elastic net*, que es una combinacion de regularizacion L1 (lasso) y L2 (ridge). Esta arquitectura es estandar en el campo de los relojes epigeneticos porque permite seleccionar automaticamente un subconjunto de CpGs relevantes mientras se mantiene la estabilidad numerica. El entrenamiento se realiza sobre datos de metilacion de ADN de sangre completa humana, con el objetivo de predecir la edad cronologica. La innovacion principal no esta en la arquitectura, sino en la seleccion de caracteristicas: los CpGs incluidos son aquellos cuya direccion de metilacion es concordante entre tres analisis independientes: senescencia *in vitro* (cultivos celulares), envejecimiento cronologico y mortalidad. Esto filtra CpGs que podrian estar asociados a la edad por razones no relacionadas con la senescencia.

No se dispone de informacion detallada sobre el numero de muestras de entrenamiento, el numero total de CpGs considerados, ni sobre el proceso de validacion. El modelo fue entrenado con la libreria `pyaging`, que es una herramienta especifica para relojes epigeneticos y otros predictores biologicos.

## Capacidades

- Prediccion de edad cronologica a partir de datos de metilacion de ADN de sangre completa humana.
- Enfoque especifico en senescencia celular, al restringirse a CpGs concordantes entre senescencia, edad y mortalidad.
- Integracion sencilla con la libreria `pyaging` mediante la funcion `pya.pred.predict_age`.
- Modelo ligero y rapido de ejecutar, adecuado para analisis de grandes cohortes.
- Compatible con datos de metilacion tipicos (arrays de Illumina, por ejemplo) siempre que se procesen con el mismo pipeline que la libreria `pyaging`.

## Casos de uso

- Investigacion en biologia del envejecimiento: el modelo permite estimar la edad epigenetica de muestras de sangre y compararla con la edad cronologica, identificando individuos con envejecimiento acelerado o ralentizado.
- Evaluacion de terapias senoliticas: como se menciona en la publicacion asociada, el modelo puede usarse para comprobar si un tratamiento senolitico revierte las firmas de senescencia en sangre. Al estar restringido a CpGs de senescencia, es especialmente sensible a cambios en ese proceso.
- Estudios longitudinales de cohortes: al ser un modelo de regresion simple, se puede aplicar a miles de muestras sin necesidad de GPU, facilitando analisis a gran escala en estudios epidemiologicos.
- Analisis de mortalidad y salud: al incluir CpGs asociados a mortalidad, el reloj podria utilizarse como proxy de riesgo de mortalidad en poblaciones adultas.
- Validacion de modelos de senescencia *in vitro*: los investigadores que trabajan con cultivos celulares pueden usar `senchronoage` para comprobar si sus sistemas experimentales reflejan senescencia real, comparando las firmas de metilacion.
- Desarrollo de nuevos relojes epigeneticos: el conjunto de CpGs seleccionado por este modelo puede servir como punto de partida para construir predictores mas especificos o para estudiar la biologia de la senescencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La publicacion citada (Kasamoto et al., 2026) podria contener metricas de rendimiento como correlacion entre edad predicha y cronologica, error absoluto medio (MAE) o area bajo la curva en analisis de mortalidad, pero estos datos no se han incluido en la model card ni en la informacion proporcionada.

## Requisitos de hardware

- Al ser un modelo de regresion lineal con un numero reducido de caracteristicas (los CpGs seleccionados), la inferencia es extremadamente ligera.
- Se ejecuta sin GPU; basta con una CPU estandar.
- El consumo de memoria es minimo (del orden de kilobytes o megabytes, dependiendo del numero de CpGs finales).
- Se integra en el ecosistema de `pyaging`, que requiere Python y dependencias cientificas tipicas (numpy, pandas, scikit-learn).
- No se requieren herramientas de despliegue especializadas como vLLM u Ollama; la inferencia se realiza directamente con la libreria.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa cuantitativa con otros relojes epigeneticos. Existen modelos bien conocidos como el reloj de Horvath (2013), PhenoAge (Levine et al., 2018) o GrimAge (Lu et al., 2019), pero no se han proporcionado datos de rendimiento de `senchronoage` frente a ellos. La diferencia principal es que estos relojes clasicos utilizan CpGs generales, mientras que `senchronoage` se restringe a CpGs de senescencia, lo que podria dar lugar a diferencias en la precision y en la interpretacion biologica. Sin embargo, sin datos de benchmarks, no es posible establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Especificidad de tejido: el modelo esta entrenado exclusivamente con sangre completa humana; su aplicacion a otros tejidos (por ejemplo, piel, musculo) probablemente dara resultados no fiables.
- Sesgo poblacional: no se ha indicado la diversidad genetica y geografica de las muestras de entrenamiento; es posible que el modelo tenga un rendimiento inferior en poblaciones no representadas.
- Interpretacion biologica: aunque el modelo se restringe a CpGs de senescencia, la relacion causal entre metilacion y senescencia no esta completamente establecida; los resultados deben interpretarse con cautela.
- Riesgo de sobreajuste: al ser un modelo de regresion con seleccion de caracteristicas, existe la posibilidad de sobreajuste a las cohortes de entrenamiento, especialmente si el numero de muestras era limitado.
- Licencia: BSD-3-Clause permite uso comercial, pero es recomendable revisar los terminos de la publicacion asociada por si hubiera patentes o restricciones adicionales.
- No es un modelo generativo ni de lenguaje; su unica funcion es la prediccion de edad a partir de datos de metilacion.
- La informacion sobre el modelo es escasa; no se han publicado detalles tecnicos completos (numero de CpGs, coeficientes, metricas de validacion) en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pyaging/senchronoage
- Publicacion asociada (DOI): https://doi.org/10.1111/acel.70430
- Catalogo de relojes de pyaging: https://pyaging.readthedocs.io
