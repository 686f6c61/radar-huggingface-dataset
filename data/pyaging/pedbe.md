# pyaging/pedbe

## Resumen

El modelo `pedbe` es un reloj epigenético de regresión lineal (elastic net) diseñado específicamente para estimar la edad cronológica en población pediátrica a partir de muestras no invasivas de epitelio bucal. Fue desarrollado por el grupo de investigación liderado por Lisa M. McEwen y publicado en 2020 en *Proceedings of the National Academy of Sciences*. Su relevancia radica en que permite estimar la edad biológica en niños mediante metilación de ADN, una técnica que evita la extracción de sangre y facilita estudios longitudinales en pediatría. El modelo está empaquetado en la librería `pyaging`, que unifica múltiples relojes epigenéticos bajo una misma interfaz de Python. No se trata de un modelo de lenguaje ni de un transformer, sino de un modelo estadístico clásico con coeficientes de regresión entrenados sobre datos de metilación de células bucales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Elastic net regression (regresión lineal con regularización L1 y L2) |
| Parametros totales | no disponible (modelo de coeficientes, sin red neuronal) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo biológico, no lingüístico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (probablemente pickle o similar, no especificado) |

## Arquitectura y entrenamiento

El modelo `pedbe` se basa en una regresión elastic net, que combina penalizaciones L1 (lasso) y L2 (ridge) para seleccionar un subconjunto de sitios CpG del genoma relevantes para la predicción de la edad cronológica. El entrenamiento se realizó sobre datos de metilación de ADN obtenidos de células epiteliales bucales de niños, con edades dentro del rango pediátrico. El estudio original de McEwen et al. (2020) describe el proceso de selección de características y la validación del modelo en cohortes independientes. No se dispone de información detallada sobre el número de muestras de entrenamiento, el número de sitios CpG finales ni los hiperparámetros exactos del elastic net en la ficha de HuggingFace. El modelo se distribuye como parte de la librería `pyaging`, que facilita su integración en pipelines de análisis de metilación.

## Capacidades

- Predicción de edad cronológica en niños a partir de datos de metilación de ADN de células bucales.
- Estimación de la edad biológica para estudios de desarrollo y envejecimiento pediátrico.
- Compatible con el flujo de trabajo de `pyaging` mediante la función `predict_age`.
- Funciona sobre matrices de metilación (por ejemplo, en formato AnnData).
- No genera texto, no realiza razonamiento ni soporta tool calling o agentes.

## Casos de uso

- Investigación en pediatría del desarrollo: permite correlacionar la edad epigenética con hitos del desarrollo físico y cognitivo en cohortes infantiles, usando muestras bucales no invasivas.
- Estudios longitudinales de envejecimiento precoz: facilita el seguimiento de la edad biológica en niños con condiciones que aceleran o retrasan la maduración (p. ej., trastornos del crecimiento).
- Evaluación de intervenciones ambientales o nutricionales: se puede usar para medir cambios en la edad epigenética tras intervenciones en poblaciones pediátricas.
- Validación de biomarcadores en biobancos: integración con datos de metilación existentes para estimar edad en muestras de tejido bucal almacenadas.
- Control de calidad en estudios de metilación: la edad estimada puede compararse con la edad cronológica registrada para detectar errores de muestreo o contaminación.
- Docencia y divulgación: como ejemplo de aplicación de modelos de regresión regularizada en epigenética, dentro de cursos de bioinformática o biología computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de HuggingFace no incluye métricas de rendimiento como MAE (error absoluto medio) ni correlación con la edad cronológica. El artículo original de McEwen et al. (2020) reporta validaciones, pero esos datos no están recogidos en la ficha del modelo. Se recomienda consultar la publicación citada para obtener cifras concretas.

## Requisitos de hardware

- Inferencia extremadamente ligera: al ser una regresión lineal con pocos coeficientes, se ejecuta en CPU sin necesidad de GPU.
- RAM mínima: menos de 1 GB para cargar los coeficientes y procesar matrices de metilación típicas.
- No requiere hardware especializado; funciona en portátiles o servidores convencionales.
- Despliegue mediante la librería `pyaging` (Python), sin necesidad de infraestructura de servidores de inferencia.
- Latencia despreciable: la predicción se realiza en milisegundos para una muestra individual.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. Existen otros relojes epigenéticos (p. ej., Horvath, Hannum, PhenoAge), pero la model card no incluye comparaciones con ellos. Se recomienda consultar la literatura original para comparar el rendimiento de `pedbe` con otros estimadores de edad en tejido bucal pediátrico.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos de células epiteliales bucales pediátricas; su aplicación a otros tejidos o rangos de edad puede producir estimaciones poco fiables.
- No se especifican los sitios CpG utilizados ni el número exacto de características, lo que dificulta la reproducibilidad externa sin acceso al código fuente.
- Al ser un modelo de regresión, no proporciona incertidumbre cuantificada en sus predicciones (a menos que se implemente por separado).
- La licencia BSD-3-Clause permite uso comercial y modificación, pero se debe citar el trabajo original (McEwen et al., 2020) en publicaciones derivadas.
- No se han documentado sesgos específicos, pero la validación en poblaciones no caucásicas o con condiciones patológicas podría ser limitada.
- El modelo no es un predictor de salud ni un dispositivo médico; su uso en contextos clínicos debe realizarse con cautela y bajo supervisión experta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pyaging/pedbe
- Documentación de pyaging (catálogo de relojes): https://pyaging.readthedocs.io
- Publicación original: McEwen, Lisa M., et al. "The PedBE clock accurately estimates DNA methylation age in pediatric buccal cells." Proceedings of the National Academy of Sciences 117 (2020): 23329–23335. DOI: https://doi.org/10.1073/pnas.1820843116
