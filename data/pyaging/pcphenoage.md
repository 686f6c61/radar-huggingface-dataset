# pyaging/pcphenoage

## Resumen
pcphenoage es un reloj epigenético (aging clock) desarrollado por el grupo de Higgins-Chen et al. en 2022, dentro del artículo publicado en Nature Aging. Se trata de un modelo de regresión que predice la edad fenotípica (phenotypic age) a partir de los niveles de metilación de ADN en sangre completa humana. A diferencia de otros relojes que utilizan la edad cronológica como objetivo, pcphenoage se entrena directamente sobre los puntajes de edad fenotípica, lo que permite capturar el estado biológico del envejecimiento más que el mero paso del tiempo.

El modelo combina un análisis de componentes principales (PCA) con una regresión de elastic net, una arquitectura estadística clásica y eficiente que selecciona un subconjunto de sitios CpG relevantes. Está integrado en la librería `pyaging`, que facilita su uso en pipelines de análisis de metilación. Su relevancia actual radica en la creciente demanda de biomarcadores de envejecimiento robustos para estudios longitudinales, ensayos clínicos y seguimiento de intervenciones antienvejecimiento.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | PCA + elastic net regression |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no de texto) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (probablemente coeficientes del modelo, no safetensors) |

## Arquitectura y entrenamiento
pcphenoage se basa en una pipeline estadística en dos etapas. Primero, se aplica un análisis de componentes principales (PCA) a los niveles de metilación de un conjunto de sitios CpG seleccionados previamente (aquellos asociados con la edad fenotípica). Sobre estos componentes principales se ajusta una regresión con regularización elastic net, que combina penalizaciones L1 y L2 para seleccionar un subconjunto de características y evitar el sobreajuste. El entrenamiento se realizó sobre datos de metilación de sangre completa (whole blood) de humanos, utilizando directamente los puntajes de edad fenotípica (PhenoAge) como variable objetivo, en lugar de usar el reloj original como proxy. Esta innovación metodológica permite que el modelo aprenda directamente la relación entre metilación y envejecimiento biológico, mejorando potencialmente su precisión en contextos de seguimiento longitudinal.

## Capacidades
- Predicción de edad fenotípica a partir de datos de metilación de ADN en sangre completa.
- Modelo específico para Homo sapiens, con aplicación en estudios de envejecimiento biológico.
- Integración sencilla en flujos de trabajo bioinformáticos mediante la librería `pyaging`.
- No posee capacidades de lenguaje, visión, audio ni generación de texto; es un modelo exclusivamente de regresión sobre datos tabulares de metilación.

## Casos de uso
- Estudios longitudinales de envejecimiento: el modelo permite estimar la edad biológica de individuos en diferentes puntos temporales, facilitando el análisis de la velocidad de envejecimiento y la detección de aceleración o desaceleración del proceso.
- Ensayos clínicos de intervenciones antienvejecimiento: al predecir la edad fenotípica, puede utilizarse como biomarcador de eficacia en ensayos que evalúan fármacos, dietas o cambios de estilo de vida, ya que responde a cambios en el estado biológico.
- Monitorización de salud en pacientes con enfermedades relacionadas con la edad: su aplicación en sangre completa permite evaluar el estado de envejecimiento en poblaciones con comorbilidades, ayudando a estratificar el riesgo.
- Investigación en epigenética del envejecimiento: sirve como herramienta para explorar qué regiones CpG contribuyen más a la edad fenotípica, generando hipótesis sobre mecanismos moleculares.
- Validación de nuevas muestras biológicas: puede usarse como referencia para comprobar la calidad de datos de metilación antes de análisis más complejos.
- Desarrollo de relojes personalizados: su metodología (PCA + elastic net) es reutilizable para construir relojes adaptados a otros tejidos o especies, partiendo de su estructura abierta.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento (como correlación con edad cronológica, error absoluto medio, etc.) ni comparaciones cuantitativas con otros relojes.

## Requisitos de hardware
- Inferencia en CPU: el modelo es extremadamente ligero (0.4 GB de tamaño de repo), por lo que puede ejecutarse en cualquier ordenador sin GPU.
- GPU: no necesaria; el modelo no requiere aceleración por hardware especializado.
- RAM: mínima, inferior a 1 GB para cargar los coeficientes y realizar predicciones sobre matrices de metilación típicas.
- Despliegue: se integra en Python mediante la librería `pyaging`, que depende de paquetes estándar como `numpy`, `pandas` y `scikit-learn`.
- Latencia: del orden de milisegundos por muestra, dado el reducido número de operaciones lineales.

## Comparativa con modelos similares
| Modelo | Tipo | Objetivo | Tejido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pcphenoage | PCA + elastic net | Edad fenotípica | Sangre completa | BSD-3-Clause | HuggingFace, pyaging |
| Horvath clock (2013) | Elastic net | Edad cronológica | Múltiples tejidos | No especificada | Ampliamente disponible |
| Hannum clock (2013) | Elastic net | Edad cronológica | Sangre | No especificada | Disponible |
| PhenoAge (Levine et al., 2018) | Elastic net | Edad fenotípica | Sangre | No especificada | Disponible |

Nota: no se dispone de datos numéricos de rendimiento comparativo en la información proporcionada. Las diferencias clave son el enfoque de entrenamiento (directo sobre edad fenotípica) y su integración moderna en `pyaging`.

## Limitaciones y advertencias
- Sesgo poblacional: el modelo se entrenó probablemente con datos de cohortes occidentales; su precisión puede degradarse en poblaciones no representadas.
- Específico de tejido: solo está validado para sangre completa; su uso en otros tejidos requeriría recalibración.
- Requiere datos de metilación de alta calidad: la precisión depende de la correcta normalización y control de calidad de los arrays de metilación.
- No es un predictor causal: la edad fenotípica es un correlato estadístico, no una medida directa del envejecimiento biológico.
- Licencia BSD-3-Clause permite uso comercial, pero se recomienda revisar las condiciones de los datos subyacentes si se utilizan para aplicaciones clínicas.
- No se proporcionan intervalos de confianza ni medidas de incertidumbre en la model card; para uso clínico se requiere validación adicional.

## Enlaces
- HuggingFace: https://huggingface.co/pyaging/pcphenoage
- Paper original: Higgins-Chen, Albert T., et al. "A computational solution for bolstering reliability of epigenetic clocks: implications for clinical trials and longitudinal tracking." Nature Aging 2 (2022): 644–661. DOI: https://doi.org/10.1038/s43587-022-00248-2
- Documentación de pyaging: https://pyaging.readthedocs.io
