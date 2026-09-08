# OneScience-Group/Pangu-ICON-DKE

# Pangu-ICON-DKE

## Resumen

Pangu-ICON-DKE es un repositorio de OneScience-Group que implementa un protocolo de evaluación no entrenamiento para estudiar el crecimiento de perturbaciones en los modelos de predicción meteorológica Pangu-Weather e ICON. El proyecto reproduce el estudio "Can Artificial Intelligence-Based Weather Prediction Models Simulate the Butterfly Effect?" publicado por equipos del Centro Aeroespacial Alemán (DLR) y la Universidad Ludwig Maximilian de Múnich (LMU). Su objetivo es diagnosticar la evolución horaria mediante mapas de energía cinética de diferencia (DKE), medias globales y espectros de número de onda total T719.

A diferencia de un modelo de IA convencional, este repositorio no contiene pesos entrenados ni requiere una fase de entrenamiento. Se trata de un conjunto de scripts Python que validan el flujo de trabajo completo de evaluación, inferencia y visualización, usando datos sintéticos parametrizados que replican la estructura del estudio original: cinco experimentos, cinco miembros por experimento, 73 pasos horarios, un nivel de 300 hPa, una cuadrícula global de 721×1440 y el protocolo espectral T719. La relevancia actual radica en que permite a investigadores y desarrolladores comprobar la reproducibilidad de los análisis de predictibilidad y efecto mariposa en modelos de IA meteorológicos sin necesidad de redistribuir los pesos oficiales ni el software de ICON.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (protocolo de evaluacion no entrenamiento basado en scripts Python con PyTorch) |
| Parametros totales | No disponible (no hay parametros entrenados) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (documentacion y metadatos) |
| Licencia | CC BY 4.0 |
| Formato de pesos | No aplica (no se distribuyen pesos; solo scripts y datos sinteticos) |

## Arquitectura y entrenamiento

El repositorio no implementa una arquitectura neuronal ni un proceso de entrenamiento. En su lugar, reproduce el protocolo de evaluacion no entrenamiento descrito en el paper de DLR y LMU, que analiza pronosticos de conjunto de 73 horas a partir de cinco experimentos con cinco miembros cada uno. Los campos se evaluan a 300 hPa sobre una cuadricula global de 721×1440 y se calculan espectros de numero de onda total T719. El script `train.py` no crea un optimizador, no ejecuta un paso hacia atras y no produce parametros entrenados; simplemente verifica el protocolo de datos, la particion de experimentos y el diagnostico directo DKE. Los datos sinteticos se generan de forma perezosa en trozos, con parametros analiticos que sustituyen a los pronosticos reales, lo que permite validar el flujo de trabajo sin materializar los campos completos ni depender de datos oficiales de Pangu, ICON o ECMWF.

La innovacion tecnica destacable es el uso de la energia cinetica de diferencia (DKE) como metrica determinista para comparar el crecimiento de perturbaciones de condicion inicial entre un modelo de IA (Pangu-Weather) y un modelo fisico (ICON). El protocolo incluye el calculo de mapas DKE globales, medias globales horarias, crecimiento paso a paso, compensacion de escala y correlacion espacial entre experimentos, asi como la generacion de espectros T719.

## Capacidades

- Evaluacion del crecimiento de perturbaciones de condicion inicial (efecto mariposa) en Pangu-Weather e ICON.
- Generacion de mapas DKE globales, medias globales horarias y espectros de numero de onda total T719.
- Soporte para ejecucion en entornos ModelScope/OneCode y Hugging Face/OneCode.
- Protocolo multi-GPU mediante `torchrun` para particionar cinco experimentos sin duplicacion.
- Validacion de la generacion de datos sinteticos, inferencia, evaluacion y visualizacion.
- No requiere entrenamiento ni pesos; es un flujo de trabajo de diagnostico deterministico.
- Generacion de artefactos de salida en formato `.npz` y graficos de diagnostico (serie temporal DKE, mapa global de 72 horas, espectro T719).

## Casos de uso

- Investigacion en meteorologia: comparar el crecimiento de perturbaciones en un modelo de IA (Pangu-Weather) frente a un modelo fisico (ICON) para estudiar la predictibilidad intrinseca.
- Validacion de pipelines de evaluacion cientifica en entornos de computacion como OneCode o ModelScope, comprobando que el flujo de datos, inferencia y visualizacion funciona correctamente.
- Diagnostico de dinamica atmosferica: calcular mapas DKE globales y espectros T719 a 300 hPa para analizar la evolucion horaria de perturbaciones en pronosticos de conjunto.
- Pruebas de protocolo multi-GPU en clusters: verificar la particion de cinco experimentos sin duplicacion mediante `torchrun` antes de ejecutar el analisis completo.
- Generacion de datos sinteticos para pruebas de integracion: validar el flujo de trabajo sin necesidad de descargar datos reales de ECMWF ni redistribuir pesos oficiales.
- Educacion y divulgacion: demostrar el efecto mariposa en modelos de prediccion meteorologica mediante visualizaciones de DKE y espectros, facilitando la comprension de la sensibilidad a condiciones iniciales.
- Reproducibilidad de estudios cientificos: comparar los resultados del protocolo implementado con los del paper original para verificar la fidelidad del analisis de crecimiento de perturbaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los datos sinteticos incluidos en el repositorio sirven exclusivamente para validar el flujo de trabajo de ingenieria y no representan el rendimiento formal del estudio original. No se proporcionan metricas de precision, exactitud ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Se recomienda una GPU o DCU para ejecutar el protocolo completo. Una CPU puede usarse para comprobaciones de conectividad y protocolo con la configuracion de datos sinteticos predeterminada.
- Los usuarios de DCU deben instalar DTK 25.04.2 o posterior, o la version recomendada por OneScience que coincida con el cluster.
- Entorno GPU: se recomienda Python 3.11 y la instalacion de `onescience[earth-gpu]`.
- Entorno DCU: se recomienda Python 3.11 y la instalacion de `onescience[earth-dcu]`.
- Opciones de despliegue: ejecucion local con scripts Python (`train.py`, `inference.py`, `result.py`) y ejecucion multi-GPU con `torchrun`.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA generativa ni un modelo de prediccion meteorologica con pesos entrenados, sino un protocolo de evaluacion no entrenamiento. No existen modelos comparables en el sentido tradicional. El repositorio OneScience-Group/Pangu_Weather es un modelo de prediccion meteorologica, pero no es directamente comparable porque Pangu-ICON-DKE no produce predicciones ni parametros.

## Limitaciones y advertencias

- Los datos sinteticos no representan datos oficiales de Pangu, ICON o ECMWF, ni los resultados del paper original.
- No se distribuyen pesos oficiales de Pangu ni el software de ICON; el checkpoint guardado solo contiene configuracion y estado del protocolo.
- El script `train.py` no entrena ningun modelo; es solo una verificacion del protocolo de datos y del diagnostico DKE.
- Los resultados generados con datos sinteticos solo validan el flujo de trabajo de ingenieria, no el rendimiento cientifico real.
- La licencia CC BY 4.0 aplica al repositorio, pero el uso del codigo, pesos y datos de proyectos de terceros (Pangu, ICON, ECMWF) queda sujeto a las licencias y terminos de sus respectivos proyectos.
- Riesgo de malinterpretar los resultados de los datos sinteticos como una validacion del efecto mariposa real, cuando en realidad son pruebas de integracion del protocolo.

## Enlaces

- Hugging Face: https://huggingface.co/OneScience-Group/Pangu-ICON-DKE
- Paper original: https://doi.org/10.1029/2023GL105747
- Repositorio principal en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio principal en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio de skills en Gitee: https://gitee.com/onescience-ai/oneskills
- Repositorio de skills en GitHub: https://github.com/onescience-ai/oneskills
- Entorno OneCode: https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
- Modelo relacionado Pangu-Weather: https://huggingface.co/OneScience-Group/Pangu_Weather
