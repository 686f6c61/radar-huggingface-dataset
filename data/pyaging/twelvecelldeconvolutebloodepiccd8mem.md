# pyaging/twelvecelldeconvolutebloodepiccd8mem

## Resumen

El modelo `pyaging/twelvecelldeconvolutebloodepiccd8mem` es un modelo de deconvolución celular basado en referencia, desarrollado por el equipo de pyaging, que estima la proporción de células T CD8+ de memoria en sangre periférica a partir de datos de metilación de ADN obtenidos con arrays EPIC. Se trata de una herramienta bioinformática, no de un modelo de lenguaje, diseñada para el análisis de datos de metilación en el contexto de estudios de envejecimiento e inmunología.

El modelo se basa en la metodología publicada por Salas et al. (2022), pero utiliza una versión modificada con 240 CpGs seleccionados, en lugar de los 1.200 originales del catálogo IDOL-Ext. Esta selección, heredada de Biolearn, busca maximizar los contrastes de metilación entre cada subtipo celular y el resto, y no es un subconjunto de las sondas publicadas. El modelo está integrado en la librería `pyaging` y se distribuye bajo licencia BSD-3-Clause.

Su relevancia actual radica en la creciente demanda de herramientas de deconvolución precisas y reproducibles para el análisis de metilación en sangre, especialmente en el campo de los relojes epigenéticos y la investigación de la inmunosenescencia. Al estar disponible en HuggingFace con una interfaz Python sencilla, facilita su integración en pipelines de análisis existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deconvolución basada en referencia (constrained deconvolution) |
| Parametros totales | No disponible (modelo basado en coeficientes de regresión sobre 240 CpGs) |
| Parametros activos | No disponible |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | No aplica (pesos en punto flotante estándar) |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | No disponible (integrado en librería `pyaging`) |

## Arquitectura y entrenamiento

El modelo implementa una deconvolución celular basada en referencia, un método estadístico que estima las proporciones de tipos celulares en una muestra heterogénea a partir de los niveles de metilación de CpGs específicos. En este caso, se utiliza un conjunto de 240 sondas CpG seleccionadas para optimizar la discriminación entre 12 tipos celulares sanguíneos, entre ellos las células T CD8+ de memoria. La referencia se construye a partir de perfiles de metilación de células purificadas, y la estimación se realiza mediante regresión restringida (constrained least squares) sobre las proporciones.

No se dispone de detalles sobre el proceso de entrenamiento, como el número de muestras utilizadas o la composición exacta del conjunto de datos. El modelo se publicó en 2022 y se basa en el trabajo de Salas et al., aunque con una modificación en la selección de CpGs. La librería `pyaging` lo integra como parte de su catálogo de relojes epigenéticos, permitiendo su uso directo con la función `predict_age`.

## Capacidades

- Estimación de la proporción de células T CD8+ de memoria en sangre periférica a partir de datos de metilación de ADN (arrays EPIC).
- Deconvolución celular basada en referencia para 12 tipos celulares sanguíneos (aunque la salida principal es la proporción de CD8+ de memoria).
- Compatible con datos de metilación de la plataforma Illumina EPIC (450K también posible con adaptaciones).
- Integración en la librería `pyaging` para análisis de relojes epigenéticos y envejecimiento.
- No soporta generación de texto, razonamiento, código ni otras capacidades de modelos de lenguaje.

## Casos de uso

- Investigación en inmunosenescencia: estimar la proporción de células T CD8+ de memoria en muestras de sangre de individuos de diferentes edades para estudiar el declive inmunológico asociado al envejecimiento.
- Estudios de relojes epigenéticos: incorporar la proporción de células inmunitarias como covariable en modelos predictivos de edad biológica basados en metilación.
- Análisis de datos de biobancos: procesar grandes cohortes con datos de metilación EPIC para caracterizar la composición inmune y su relación con enfermedades crónicas.
- Validación de biomarcadores: comparar la proporción estimada de CD8+ de memoria con medidas citométricas o de secuenciación para validar la precisión del método.
- Control de calidad en estudios de asociación: ajustar los análisis de metilación por la composición celular estimada para reducir confusión por diferencias en la mezcla celular entre muestras.
- Desarrollo de herramientas bioinformáticas: servir como componente en pipelines de análisis de metilación que requieran deconvolución celular rápida y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye métricas de rendimiento como correlación con citometría de flujo, error cuadrático medio o comparación con otros métodos de deconvolución. Se recomienda consultar la publicación original de Salas et al. (2022) para referencias sobre el rendimiento del método base, aunque el conjunto de CpGs utilizado aquí difiere del publicado.

## Requisitos de hardware

- Al ser un modelo de deconvolución basado en regresión lineal, los requisitos de hardware son mínimos. Se puede ejecutar en CPU con menos de 1 GB de RAM.
- No requiere GPU. El cálculo sobre una muestra de metilación (típicamente ~850.000 CpGs) se completa en segundos.
- Puede ejecutarse en cualquier ordenador personal o servidor sin aceleración especializada.
- La librería `pyaging` depende de `numpy` y `pandas`, por lo que el entorno debe tener estas bibliotecas instaladas.
- No se han reportado opciones de despliegue específicas como vLLM u Ollama, ya que no es un modelo de lenguaje. Su uso se realiza mediante la API de Python de `pyaging`.

## Comparativa con modelos similares

| Modelo | Método | CpGs | Plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `twelvecelldeconvolutebloodepiccd8mem` (este) | Deconvolución restringida | 240 | EPIC | BSD-3-Clause | HuggingFace, pyaging |
| IDOL-Ext (Salas et al., 2022) | Deconvolución restringida | 1.200 | EPIC | No especificada | Publicación, paquetes R |
| EpiDISH (Teschendorff et al.) | Deconvolución robusta | Variable | 450K/EPIC | GPL | CRAN/Bioconductor |

No se dispone de una comparación cuantitativa directa entre estos métodos en la información proporcionada. La elección entre ellos dependerá de la necesidad de reproducibilidad, la plataforma de datos y la compatibilidad con el entorno de análisis.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para sangre periférica y datos de arrays EPIC. Su aplicación a otros tejidos o plataformas (por ejemplo, 450K) puede producir estimaciones poco fiables.
- La selección de 240 CpGs no está documentada públicamente (hereda de Biolearn), lo que limita la reproducibilidad y la interpretación biológica de las sondas utilizadas.
- No se han publicado métricas de validación para este modelo concreto, por lo que su precisión en poblaciones distintas a las utilizadas en el desarrollo es incierta.
- La deconvolución basada en referencia asume que la composición celular de la muestra se ajusta a los tipos de referencia; si hay tipos celulares no previstos, las estimaciones pueden estar sesgadas.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda revisar los términos de la librería `pyaging` y las dependencias asociadas.
- No es un modelo de lenguaje ni de IA generativa; no debe utilizarse para tareas de procesamiento de texto o razonamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pyaging/twelvecelldeconvolutebloodepiccd8mem
- Publicación original de Salas et al.: https://doi.org/10.1038/s41467-021-27864-7
- Documentación de pyaging (catálogo de relojes): https://pyaging.readthedocs.io
