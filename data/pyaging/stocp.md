# pyaging/stocp

## Resumen

stocp es un reloj epigenético (aging clock) desarrollado por el equipo de pyaging, diseñado para predecir la edad cronológica de un individuo a partir de datos de metilación de ADN. A diferencia de otros relojes que estiman la edad biológica o fenotípica, stocp se centra específicamente en la edad cronológica, y fue construido a partir de trayectorias de metilación simuladas en los CpGs asociados al reloj PhenoAge. A pesar de esta fuente de CpGs, el resultado ajustado y el constructo devuelto es la edad cronológica, no PhenoAge.

El modelo utiliza regresión elastic net, una técnica de regularización lineal que combina penalizaciones L1 y L2, adecuada para datos de alta dimensionalidad como los perfiles de metilación. Está entrenado para muestras de monocitos ordenados de Homo sapiens, y se distribuye bajo licencia BSD-3-Clause. Su relevancia radica en cuantificar el componente estocástico del envejecimiento epigenético, un área de investigación activa en biología del envejecimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion elastic net (lineal regularizada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (datos biologicos, no texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo emplea regresion elastic net, que combina las penalizaciones L1 (lasso) y L2 (ridge) para seleccionar caracteristicas relevantes entre miles de sitios CpG. La construccion del reloj se realizo a partir de trayectorias de metilacion simuladas en los CpGs de PhenoAge, aunque el objetivo final es la prediccion de la edad cronologica. Los datos de entrenamiento corresponden a muestras de monocitos ordenados de Homo sapiens, y el modelo fue publicado en 2024 en el articulo de Tong et al. "Quantifying the stochastic component of epigenetic aging" (Nature Aging). No se dispone de informacion detallada sobre el numero de muestras, el proceso de validacion o si se aplicaron tecnicas adicionales como regularizacion por cross-validation.

## Capacidades

- Prediccion de edad cronologica a partir de datos de metilacion de ADN (matrices de beta-values).
- Especificamente calibrado para muestras de monocitos ordenados (tipo celular purificado).
- Integrable en el ecosistema pyaging mediante la funcion `pya.pred.predict_age(adata, ["stocp"])`.
- Disenado para cuantificar el componente estocastico del envejecimiento epigenetico, complementando otros relojes como PhenoAge o Horvath.
- No soporta generacion de texto, codigo, vision ni tool calling; es un modelo de regresion biologica.

## Casos de uso

- Investigacion en envejecimiento: estimar la edad cronologica en cohortes de monocitos para estudiar la desviacion entre edad cronologica y edad epigenetica.
- Estudios de epigenetica del envejecimiento: comparar el componente estocastico frente al deterministico en trayectorias de metilacion.
- Analisis de datos de metilacion en pipelines de biologia computacional: integrar stocp junto a otros relojes del catalogo pyaging para obtener multiples estimadores de edad.
- Validacion de metodos de simulacion de datos de metilacion: dado que el reloj se construyo a partir de trayectorias simuladas, puede usarse como referencia en estudios metodologicos.
- Control de calidad en estudios longitudinales: verificar la coherencia de las edades estimadas en muestras de monocitos repetidas.
- Docencia y formacion: ejemplificar el uso de regresion elastic net en datos genomicos de alta dimensionalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de error (MAE, correlacion, etc.) ni comparaciones con otros relojes.

## Requisitos de hardware

- Al ser un modelo de regresion lineal, la inferencia es extremadamente ligera: no requiere GPU.
- Puede ejecutarse en cualquier CPU moderna con pocos MB de RAM (el peso del modelo es minimo, aunque el tamaño exacto no se indica).
- Se integra en Python via la libreria pyaging, que depende de numpy y scikit-learn (o similar).
- No requiere despliegue especializado; basta con un entorno Python estandar.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. Existen otros relojes epigeneticos conocidos (Horvath, PhenoAge, GrimAge), pero no se pueden establecer comparaciones cuantitativas sin datos de rendimiento. La model card solo indica que stocp predice edad cronologica y esta basado en CpGs de PhenoAge, lo que lo diferencia de PhenoAge (que predice edad fenotipica).

## Limitaciones y advertencias

- Modelo especifico para monocitos ordenados; no es aplicable a otros tipos celulares sin recalibracion.
- Construido a partir de datos simulados, lo que puede introducir sesgos respecto a datos reales de metilacion.
- No se han publicado metricas de error ni validacion externa en la informacion disponible.
- Licencia BSD-3-Clause permite uso comercial y modificacion, pero se recomienda citar la publicacion original.
- No es un modelo de lenguaje ni de IA generativa; su uso se limita a datos de metilacion en el formato esperado por pyaging.
- Riesgo de sobreajuste a las trayectorias simuladas si se aplica a poblaciones muy diferentes a las de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/pyaging/stocp
- Documentacion de pyaging (Catalogo de relojes): https://pyaging.readthedocs.io
- Publicacion original: Tong, Huige, et al. "Quantifying the stochastic component of epigenetic aging." Nature Aging 4 (2024): 886–901. DOI: https://doi.org/10.1038/s43587-024-00600-8
