# pyaging/systemsageimmune

## Resumen

systemsageimmune es un reloj epigenético (aging clock) desarrollado por el equipo de pyaging como componente del sistema "Systems Age", una puntuación de metilación de ADN en sangre total que cuantifica la heterogeneidad del envejecimiento a través de 11 sistemas fisiológicos. Este modelo concreto se centra en el sistema inmunitario: predice la edad biológica inmune a partir de datos de metilación de ADN (DNAm) obtenidos de sangre periférica.

El modelo fue entrenado utilizando biomarcadores del sistema inmunitario y datos de mortalidad, y devuelve una estimación en una escala similar a la edad cronológica. Está diseñado para su uso con la librería Python `pyaging`, que permite integrar fácilmente este reloj en pipelines de análisis de datos de metilación. Su relevancia radica en que ofrece una medida específica del envejecimiento inmunitario, un factor clave en la salud general y la longevidad, y puede ser utilizado en estudios de envejecimiento, epidemiología y medicina de precisión.

La arquitectura subyacente combina análisis de componentes principales (PCA) con regresión elastic net, una metodología establecida en el campo de los relojes epigenéticos. El modelo está disponible bajo licencia BSD-3-Clause, lo que permite su uso comercial y académico con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PCA + regresión elastic net |
| Parametros totales | no disponible (modelo de regresión con coeficientes, no es una red neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (probablemente archivos de coeficientes o pickle, no especificado) |

## Arquitectura y entrenamiento

El modelo sigue la metodología clásica de los relojes epigenéticos: se parte de los niveles de metilación en sitios CpG específicos del genoma, se reduce la dimensionalidad mediante PCA y se aplica una regresión elastic net para predecir la variable objetivo (en este caso, la edad biológica inmune). El entrenamiento se realizó utilizando biomarcadores del sistema inmunitario y datos de mortalidad, lo que permite que la puntuación resultante refleje no solo la edad cronológica sino también el estado funcional del sistema inmune. No se dispone de información detallada sobre el número de sitios CpG utilizados, el tamaño del conjunto de entrenamiento o el proceso de validación en la documentación proporcionada.

El modelo fue publicado en 2025 como parte del artículo "Systems Age: a single blood methylation test to quantify aging heterogeneity across 11 physiological systems" en la revista Nature Aging. La implementación está integrada en la librería `pyaging`, que facilita su uso mediante una llamada directa a la función `predict_age`.

## Capacidades

- Predicción de la edad biológica del sistema inmunitario a partir de datos de metilación de ADN en sangre total.
- Escala de salida similar a la edad cronológica, interpretable directamente.
- Integración con la librería `pyaging` para su uso en pipelines de análisis de metilación.
- Diseñado para estudios de envejecimiento, evaluación de riesgo de mortalidad y monitoreo de salud.
- No es un modelo de lenguaje ni tiene capacidades de generación de texto, visión o audio.

## Casos de uso

- Investigación en envejecimiento: los investigadores pueden utilizar systemsageimmune para evaluar la edad biológica inmune de cohortes de individuos y correlacionarla con otros marcadores de salud o enfermedades relacionadas con la edad.
- Epidemiología de la mortalidad: dado que el entrenamiento incluyó datos de mortalidad, el modelo puede emplearse para estimar el riesgo de mortalidad asociado al envejecimiento inmunitario en estudios poblacionales.
- Medicina de precisión: en entornos clínicos, la puntuación del sistema inmune puede complementar otros biomarcadores para personalizar intervenciones de salud o evaluar la respuesta a terapias inmunomoduladoras.
- Estudios longitudinales: el modelo permite monitorizar cambios en la edad biológica inmune a lo largo del tiempo, útil para evaluar el impacto de intervenciones (dieta, ejercicio, fármacos) sobre el envejecimiento.
- Validación de biomarcadores: puede servir como referencia para comparar nuevos relojes epigenéticos o para validar la relevancia de sitios CpG específicos en el envejecimiento inmune.
- Análisis de datos de metilación existentes: dado que requiere solo datos de metilación de sangre total, se puede aplicar a conjuntos de datos públicos (GEO, TCGA) para reanalizar muestras sin necesidad de nuevos experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas de precisión, correlación con edad cronológica, error absoluto medio (MAE) o comparaciones con otros relojes en la model card de HuggingFace.

## Requisitos de hardware

- El modelo es ligero: al ser una regresión sobre componentes principales, no requiere GPU. Se puede ejecutar en cualquier CPU moderna.
- El repositorio tiene un tamaño de 2.0 GB, lo que sugiere que incluye archivos de pesos o datos auxiliares, pero la inferencia es computacionalmente trivial.
- Se recomienda disponer de al menos 4 GB de RAM para cargar los datos de metilación y el modelo en memoria.
- El despliegue se realiza mediante la librería `pyaging` en Python; no se requieren frameworks de inferencia como vLLM u Ollama.
- La latencia es del orden de milisegundos por muestra una vez cargado el modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Tejido | Variable objetivo | Año | Licencia |
|---|---|---|---|---|---|
| systemsageimmune | PCA + elastic net | Sangre total | Edad biológica inmune | 2025 | BSD-3-Clause |
| PhenoAge | Elastic net | Sangre total | Edad fenotípica (mortalidad) | 2018 | no disponible |
| GrimAge | Elastic net | Sangre total | Esperanza de vida | 2019 | no disponible |
| Hannum | Elastic net | Sangre total | Edad cronológica | 2013 | no disponible |

La comparación directa no es posible sin datos de rendimiento, pero se observa que systemsageimmune se distingue por su enfoque específico en el sistema inmunitario, mientras que los otros relojes son más generales. La licencia BSD-3-Clause es más permisiva que las de algunos competidores, lo que facilita su uso comercial.

## Limitaciones y advertencias

- Solo está validado para Homo sapiens y para muestras de sangre total; no es aplicable a otros tejidos o especies sin recalibración.
- Requiere datos de metilación de ADN de alta calidad, obtenidos mediante arrays (por ejemplo, Illumina 450K o EPIC). La calidad de la predicción depende de la normalización y preprocesamiento de los datos.
- El modelo no es causal: la edad biológica inmune estimada es un correlato estadístico, no una medida directa de la función inmune.
- No se han publicado métricas de precisión en la documentación disponible, por lo que su rendimiento en poblaciones distintas a las de entrenamiento es incierto.
- La licencia BSD-3-Clause permite uso comercial, pero se debe citar el trabajo original en publicaciones derivadas.
- No hay soporte para otros tipos de datos (expresión génica, proteínas, etc.) ni para modelos multimodales.

## Enlaces

- HuggingFace: https://huggingface.co/pyaging/systemsageimmune
- Paper: Sehgal, R., Markov, Y., Qin, C., et al. (2025). Systems Age: a single blood methylation test to quantify aging heterogeneity across 11 physiological systems. Nature Aging, 5, 1880–1896. DOI: https://doi.org/10.1038/s43587-025-00958-3
- Documentación de pyaging: https://pyaging.readthedocs.io
