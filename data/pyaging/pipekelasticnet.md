# pyaging/pipekelasticnet

## Resumen

`pipekelasticnet` es un reloj epigenético de edad cronológica desarrollado por Orsolya Anna Pipek y István Csabai (Universidad Eötvös Loránd, Hungría) en 2022, publicado en el *Journal of Mathematical Chemistry* en 2023. Se trata de un modelo de regresión *elastic net* que predice la edad cronológica de un individuo a partir de datos de metilación de ADN obtenidos mediante arrays de metilación. El modelo está entrenado de forma pan-tejido (multi-tissue) y multiplataforma, lo que significa que puede aplicarse a muestras de distintos tejidos y procesadas con diferentes plataformas de arrays, una ventaja frente a relojes más específicos. Retiene 239 CpGs con coeficientes no nulos, lo que lo convierte en un modelo muy ligero y fácil de interpretar. Está disponible a través de la librería `pyaging` y se distribuye bajo licencia BSD-3-Clause.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal regularizada (elastic net) |
| Parametros totales | 239 CpGs con coeficientes no nulos (más intercepto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular, no de texto) |
| Tipos de cuantizacion | No aplica (modelo de regresión, no requiere cuantización) |
| Idiomas soportados | No aplica |
| Licencia | BSD-3-Clause |
| Formato de pesos | No disponible (distribuido a través de la librería pyaging) |

## Arquitectura y entrenamiento

El modelo es una regresión *elastic net*, que combina regularización L1 y L2 sobre un conjunto de características de metilación de ADN (niveles de metilación en sitios CpG específicos). La elastic net selecciona automáticamente las CpGs más relevantes, resultando en un modelo con 239 CpGs con coeficientes no nulos. El entrenamiento se realizó sobre datos de metilación de múltiples tejidos y plataformas de arrays, lo que le confiere capacidad pan-tejido y multiplataforma. No se dispone de información detallada sobre el número de muestras de entrenamiento ni sobre el proceso de validación más allá de lo publicado en el artículo original. No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo generativo.

## Capacidades

- Predicción de edad cronológica a partir de datos de metilación de ADN.
- Funciona en múltiples tejidos (pan-tejido) sin necesidad de ajuste específico por tejido.
- Compatible con datos de diferentes plataformas de arrays de metilación (multiplataforma).
- Modelo interpretable: los coeficientes de las 239 CpGs permiten identificar regiones genómicas relevantes para el envejecimiento.
- Integración sencilla con la librería `pyaging` para análisis de datos de metilación en formato AnnData.

## Casos de uso

- **Investigación en envejecimiento biológico**: estimar la edad epigenética de muestras humanas para estudiar la relación entre la edad cronológica y la edad biológica en cohortes de investigación.
- **Estudios longitudinales de salud**: aplicar el reloj a muestras de sangre o tejido de participantes en estudios de seguimiento para monitorizar cambios en la velocidad de envejecimiento.
- **Validación de intervenciones anti-envejecimiento**: medir el efecto de fármacos, dietas o cambios de estilo de vida sobre la edad epigenética en ensayos clínicos o preclínicos.
- **Análisis de tejidos post-mortem**: estimar la edad de muestras de tejido en estudios forenses o antropológicos, donde se dispone de ADN metilado.
- **Control de calidad en biobancos**: verificar la coherencia entre la edad declarada de una muestra y su edad epigenética estimada, detectando posibles errores de etiquetado.
- **Educación y divulgación**: como ejemplo práctico de aplicación de regresión regularizada en datos ómicos dentro de cursos de bioinformática o machine learning aplicado a la biología.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo original (Pipek & Csabai, 2023) reporta métricas de rendimiento como el error absoluto medio (MAE) y la correlación entre edad cronológica y epigenética, pero dichos valores no se incluyen en la model card de HuggingFace. Se recomienda consultar la publicación para obtener cifras concretas.

## Requisitos de hardware

- Al ser un modelo de regresión con solo 239 coeficientes, los requisitos de hardware son mínimos.
- Funciona en CPU sin necesidad de GPU. La inferencia se realiza en microsegundos.
- Memoria RAM necesaria: menos de 1 MB para cargar el modelo y los coeficientes.
- No requiere tarjetas gráficas especializadas ni servidores de alto rendimiento.
- Se puede ejecutar en portátiles convencionales, Raspberry Pi o incluso en entornos de computación embebida.
- Integración con `pyaging` permite usarlo dentro de pipelines de análisis de datos en Python, sin necesidad de infraestructura adicional.

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos con otros relojes epigenéticos (por ejemplo, Horvath, Hannum, PhenoAge) en la información proporcionada. Sin embargo, se pueden destacar diferencias cualitativas:

| Modelo | Tipo | Tejido | Plataforma | Año | Licencia |
|---|---|---|---|---|---|
| pipekelasticnet | Elastic net | Pan-tejido | Multiplataforma | 2022 | BSD-3-Clause |
| Reloj de Horvath | Regresión penalizada | Pan-tejido | 27K/450K | 2013 | No especificada |
| Reloj de Hannum | Regresión penalizada | Sangre | 450K | 2013 | No especificada |

Nota: los datos de Horvath y Hannum son de conocimiento general, no de la model card. La comparación cuantitativa (MAE, correlación) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en datos de *Homo sapiens*; no es aplicable a otras especies.
- Aunque es pan-tejido, el rendimiento puede variar según el tipo de tejido y la calidad de los datos de metilación.
- Los relojes epigenéticos estiman la edad cronológica, no la edad biológica ni el riesgo de mortalidad; no deben utilizarse como herramienta diagnóstica.
- La metilación de ADN puede verse afectada por factores ambientales, enfermedades o tratamientos, lo que puede introducir sesgos en la predicción.
- No se ha evaluado su comportamiento en poblaciones no representadas en el entrenamiento (por ejemplo, ciertos grupos étnicos o edades extremas).
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda citar el artículo original en publicaciones derivadas.
- Al ser un modelo de regresión lineal, no captura interacciones no lineales entre CpGs; modelos más complejos (por ejemplo, redes neuronales) podrían ofrecer mayor precisión en ciertos contextos.

## Enlaces

- Modelo en HuggingFace: [https://huggingface.co/pyaging/pipekelasticnet](https://huggingface.co/pyaging/pipekelasticnet)
- Publicación original: Pipek, O. A., & Csabai, I. (2023). "A revised multi-tissue, multi-platform epigenetic clock model for methylation array data." *Journal of Mathematical Chemistry*, 61, 376–388. DOI: [10.1007/s10910-022-01381-4](https://doi.org/10.1007/s10910-022-01381-4)
- Documentación de pyaging: [https://pyaging.readthedocs.io](https://pyaging.readthedocs.io)
