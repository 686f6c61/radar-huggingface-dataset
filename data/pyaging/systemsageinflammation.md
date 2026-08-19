# pyaging/systemsageinflammation

## Resumen

`pyaging/systemsageinflammation` es un reloj epigenético de envejecimiento (aging clock) desarrollado por el equipo de pyaging, que forma parte del sistema más amplio denominado "Systems Age". Este modelo predice la edad biológica del sistema inflamatorio a partir de datos de metilación de ADN en sangre completa humana. Fue publicado en 2025 en el artículo "Systems Age: a single blood methylation test to quantify aging heterogeneity across 11 physiological systems" (Nature Aging).

El modelo utiliza una arquitectura de PCA (análisis de componentes principales) combinada con regresión elastic net, una técnica estadística clásica en el campo de los relojes epigenéticos. No se trata de un modelo de lenguaje ni de una red neuronal profunda, sino de un modelo de regresión entrenado sobre marcadores de metilación de ADN para devolver una puntuación en una escala similar a la edad. Su relevancia radica en que permite cuantificar el envejecimiento específico del sistema inflamatorio, lo que puede ser útil para investigaciones sobre longevidad, inflamación crónica y enfermedades relacionadas con la edad.

El repositorio tiene un tamaño de 2.0 GB e incluye los pesos y archivos necesarios para su uso con la librería `pyaging`. La licencia es BSD-3-Clause, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PCA + elastic net regression |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de regresión sobre metilación, no procesa texto) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | bsd-3-clause |
| Formato de pesos | no disponible (probablemente archivos específicos de pyaging, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo emplea un pipeline de dos etapas: primero aplica un análisis de componentes principales (PCA) sobre los niveles de metilación de ADN en sitios CpG específicos de sangre completa, reduciendo la dimensionalidad de los datos. Posteriormente, una regresión elastic net (que combina regularización L1 y L2) modela la relación entre los componentes principales y la edad biológica del sistema inflamatorio, devolviendo una predicción en una escala de edad.

Los detalles específicos del entrenamiento (número de muestras, composición del dataset, número de sitios CpG, hiperparámetros de la elastic net) no se encuentran en la información disponible. El modelo fue entrenado para predecir la edad inflamatoria a partir de biomarcadores inflamatorios y datos de mortalidad, como se indica en la model card. No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo generativo.

## Capacidades

- Predicción de la edad biológica del sistema inflamatorio a partir de datos de metilación de ADN en sangre completa.
- Salida en una escala similar a la edad (por ejemplo, años), lo que facilita la interpretación clínica.
- Integración con la librería `pyaging` para su uso en pipelines de análisis de relojes epigenéticos.
- No tiene capacidades de generación de texto, razonamiento, código, visión, tool calling, agentes ni soporte multilingüe, al ser un modelo de regresión estadística.

## Casos de uso

- Investigación biomédica sobre envejecimiento: permite cuantificar la edad inflamatoria de un individuo a partir de una muestra de sangre, facilitando estudios sobre la heterogeneidad del envejecimiento entre sistemas fisiológicos.
- Evaluación de intervenciones anti-envejecimiento: se puede utilizar para medir cambios en la edad inflamatoria antes y después de tratamientos (farmacológicos, dietéticos, etc.) en ensayos clínicos.
- Estudios epidemiológicos de inflamación crónica: ayuda a identificar poblaciones con envejecimiento inflamatorio acelerado, potencialmente asociado a enfermedades cardiovasculares, diabetes o fragilidad.
- Medicina de precisión: podría integrarse en paneles de análisis de metilación para ofrecer una métrica adicional de salud sistémica en pacientes.
- Validación de biomarcadores: sirve como referencia para comparar otros relojes epigenéticos o nuevos biomarcadores de inflamación.
- Investigación en longevidad: contribuye a descomponer el envejecimiento en componentes sistémicos, permitiendo estudiar la contribución relativa de la inflamación al envejecimiento global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas de rendimiento como correlación con la edad cronológica, error absoluto medio (MAE) o comparaciones con otros relojes epigenéticos.

## Requisitos de hardware

No se especifican requisitos de hardware en la información disponible. Dado que se trata de un modelo de regresión sobre datos tabulares (PCA + elastic net), es previsible que su inferencia sea muy ligera y ejecutable en CPU sin necesidad de GPU. Sin embargo, no hay confirmación oficial de los requisitos mínimos. El tamaño del repositorio (2.0 GB) sugiere que los archivos del modelo pueden cargarse en memoria sin problemas en equipos convencionales. Para su uso con `pyaging`, se recomienda consultar la documentación de la librería para conocer las dependencias y el flujo de trabajo típico.

## Comparativa con modelos similares

Existen otros relojes epigenéticos de envejecimiento, como el reloj de Horvath, PhenoAge, GrimAge o el propio Systems Age (del que este modelo es un componente). Sin embargo, no se dispone en la información proporcionada de datos comparativos cuantitativos (correlaciones, errores, etc.) entre estos modelos y `systemsageinflammation`. La comparativa no está disponible.

## Limitaciones y advertencias

- La información disponible no detalla sesgos conocidos, pero al ser un modelo entrenado con datos de metilación de sangre completa, es probable que su rendimiento dependa de la población y el tejido de origen. No se especifican limitaciones de edad, sexo o etnia.
- No se mencionan riesgos de alucinación (no aplica, al no ser un modelo generativo).
- El modelo está diseñado exclusivamente para datos de metilación de ADN de sangre completa; su uso con otros tejidos o tipos de datos no está validado.
- La licencia BSD-3-Clause permite uso comercial, pero se debe citar la publicación original al utilizarlo en investigaciones o productos.
- No se proporcionan instrucciones detalladas sobre el preprocesamiento de datos de metilación (normalización, control de calidad, etc.), por lo que el usuario debe seguir las guías de la librería `pyaging`.
- El modelo fue publicado en 2025; su validación independiente y su aplicabilidad en contextos clínicos aún pueden estar en desarrollo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pyaging/systemsageinflammation
- Publicación original: Sehgal, R., Markov, Y., Qin, C., et al. (2025). Systems Age: a single blood methylation test to quantify aging heterogeneity across 11 physiological systems. Nature Aging, 5, 1880–1896. DOI: https://doi.org/10.1038/s43587-025-00958-3
- Documentación de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
