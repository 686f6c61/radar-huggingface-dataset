# pyaging/systemsageheart

## Resumen

El modelo `systemsageheart` es un componente del sistema Systems Age, un reloj epigenético de sangre completa desarrollado por el grupo de investigación de pyaging (Sehgal et al., 2025). Predice la edad biológica del sistema cardiovascular a partir de perfiles de metilación de ADN en sangre periférica, devolviendo un valor en una escala similar a la edad cronológica. Forma parte de un conjunto de once relojes específicos por sistema fisiológico que, combinados, permiten cuantificar la heterogeneidad del envejecimiento entre distintos órganos y sistemas.

El modelo utiliza una arquitectura de regresión PCA + elastic net, un enfoque estadístico clásico pero eficaz para datos de metilación de alta dimensionalidad. Está diseñado para integrarse en el ecosistema `pyaging`, una librería Python especializada en relojes de envejecimiento, y se distribuye bajo licencia BSD-3-Clause. Aunque el repositorio tiene un tamaño de 2,0 GB, el modelo en sí es un conjunto de coeficientes de regresión, por lo que su inferencia es ligera y no requiere GPU. Su relevancia actual radica en la creciente demanda de biomarcadores de envejecimiento precisos y accesibles para investigación biomédica y estudios longitudinales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PCA + elastic net regression |
| Parametros totales | no disponible (modelo de regresion, no red neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (datos tabulares de metilacion) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica (datos biologicos) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (integrado en libreria pyaging) |

## Arquitectura y entrenamiento

El modelo se basa en una regresión con penalización elastic net aplicada sobre componentes principales (PCA) de los niveles de metilación de ADN. Este enfoque reduce la dimensionalidad de los datos (típicamente cientos de miles de CpGs) a un número reducido de componentes, sobre los que se ajusta un modelo lineal regularizado. No se trata de una red neuronal ni de un transformer; es un modelo estadístico clásico optimizado para predicción robusta con datos de alta dimensionalidad y alta correlación entre variables.

El entrenamiento se realizó con datos de metilación de sangre completa de una cohorte con biomarcadores cardiovasculares y seguimiento de mortalidad, según la publicación original. El objetivo era construir un reloj específico del sistema cardiovascular que capturara la desviación entre la edad biológica de este sistema y la edad cronológica. No se dispone de detalles públicos sobre el número exacto de muestras ni de CpGs utilizados en el entrenamiento, más allá de lo descrito en el artículo de Nature Aging (2025). La librería `pyaging` implementa la predicción mediante la función `pya.pred.predict_age`, que acepta un objeto AnnData con los datos de metilación.

## Capacidades

- Predicción de edad biológica cardiovascular a partir de perfiles de metilación de ADN en sangre completa.
- Salida en escala de edad (años), interpretable como desviación respecto a la edad cronológica.
- Integración con el ecosistema `pyaging` para análisis de múltiples relojes de sistemas fisiológicos.
- Compatible con datos de metilación de alta densidad (arrays de 450K o EPIC) y con formatos estándar de la comunidad (AnnData).
- Diseñado para uso en investigación, no para diagnóstico clínico directo.
- No requiere GPU para inferencia; el modelo es un conjunto de coeficientes de regresión.

## Casos de uso

- Investigación en envejecimiento cardiovascular: el modelo permite estimar la edad biológica del sistema cardiovascular en cohortes de estudio, facilitando el análisis de factores que aceleran o retrasan el envejecimiento de este sistema.
- Evaluación de intervenciones de estilo de vida: se puede usar para medir el efecto de dietas, ejercicio o fármacos sobre la edad biológica cardiovascular en ensayos clínicos con muestras de sangre.
- Estudios longitudinales de salud: al aplicarse a muestras de sangre tomadas en diferentes momentos, permite monitorizar la trayectoria de envejecimiento cardiovascular de un individuo o población.
- Análisis de heterogeneidad del envejecimiento: combinado con los otros diez relojes de Systems Age, permite comparar la edad biológica de distintos sistemas (corazón, hígado, riñón, etc.) y detectar desequilibrios.
- Validación de biomarcadores: sirve como referencia para comparar nuevos biomarcadores de envejecimiento cardiovascular frente a un estándar basado en metilación.
- Investigación en longevidad: puede integrarse en pipelines de análisis de datos ómicos para identificar asociaciones entre la edad biológica cardiovascular y variables genéticas o ambientales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La publicación original (Sehgal et al., 2025) reporta métricas de rendimiento (correlación con edad cronológica, error absoluto medio, etc.) para el conjunto completo de Systems Age, pero no se desglosan por sistema en la documentación accesible. Se recomienda consultar el artículo para obtener datos cuantitativos específicos.

## Requisitos de hardware

- Inferencia en CPU: suficiente. El modelo es una regresión lineal sobre componentes principales; la carga computacional principal es la transformación PCA de los datos de metilación, que depende del tamaño del dataset de entrada.
- RAM: se recomienda al menos 8 GB para manejar matrices de metilación típicas (miles de muestras × cientos de miles de CpGs) en memoria.
- GPU: no necesaria para la inferencia del modelo en sí. Sin embargo, si el pipeline completo incluye preprocesamiento de datos de metilación a gran escala, una GPU puede acelerar ciertas operaciones de normalización.
- Almacenamiento: el repositorio ocupa 2,0 GB (incluye pesos y posiblemente datos de ejemplo). Los datos de metilación de entrada pueden requerir varios GB adicionales.
- Despliegue: se integra en la librería `pyaging` (Python), que depende de `scanpy` y `numpy`. No se conocen adaptaciones a motores de inferencia como vLLM u Ollama, dado que no es un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Tipo | Sistema que predice | Entrenamiento | Licencia |
|---|---|---|---|---|
| systemsageheart | PCA + elastic net | Cardiovascular | Sehgal et al. 2025 | BSD-3-Clause |
| Horvath clock (2013) | Elastic net | Edad cronológica | Horvath 2013 | No libre (uso académico) |
| PhenoAge (2018) | Elastic net | Edad fenotípica (mortalidad) | Levine et al. 2018 | No libre (uso académico) |

No se dispone de datos comparativos de rendimiento (correlación, MAE) entre estos modelos en la información proporcionada. La ventaja principal de `systemsageheart` es su especificidad por sistema fisiológico y su integración en el ecosistema abierto `pyaging`.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos de sangre completa de Homo sapiens; no es aplicable a otros tejidos o especies.
- La predicción se basa en metilación de ADN, que puede verse afectada por factores técnicos (lote de array, calidad de la muestra) y biológicos (composición celular de la sangre). Se recomienda un control de calidad riguroso.
- No se han publicado análisis de sesgos por edad, sexo o etnia en la documentación accesible; su aplicabilidad a poblaciones no representadas en el entrenamiento es incierta.
- El modelo es una herramienta de investigación, no un dispositivo diagnóstico. No debe utilizarse para decisiones clínicas individuales.
- La licencia BSD-3-Clause permite uso comercial, pero la publicación original puede tener restricciones adicionales sobre los datos utilizados.
- La fecha de creación del repositorio (2026-08-18) es posterior a la publicación del artículo (2025), lo que sugiere que el modelo fue subido a HuggingFace con posterioridad; no hay evidencia de mantenimiento activo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pyaging/systemsageheart
- Documentación de pyaging (catálogo de relojes): https://pyaging.readthedocs.io
- Publicación original: Sehgal, R., Markov, Y., Qin, C., et al. (2025). Systems Age: a single blood methylation test to quantify aging heterogeneity across 11 physiological systems. Nature Aging, 5, 1880–1896. DOI: https://doi.org/10.1038/s43587-025-00958-3
