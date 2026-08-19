# pyaging/twelvecelldeconvolutebloodepiceos

## Resumen

El modelo `pyaging/twelvecelldeconvolutebloodepiceos` es un modelo de deconvolución celular basado en metilación de ADN, desarrollado por el equipo de pyaging para estimar la proporción de eosinófilos en sangre periférica a partir de datos de arrays EPIC. Se trata de un método de deconvolución referenciada y restringida (reference-based constrained deconvolution), no de un modelo generativo de lenguaje. El modelo se apoya en una librería de 240 CpGs que, según la descripción, no coincide con el conjunto publicado de 1200 sondas del método IDOL-Ext, sino que es una versión alternativa heredada de Biolearn. Publicado originalmente en 2022 por Salas et al. en *Nature Communications*, este modelo se integra en el ecosistema pyaging para el análisis de relojes epigenéticos y perfiles inmunitarios.

La relevancia de este modelo radica en su aplicación directa en estudios de inmunología y envejecimiento, donde la estimación precisa de subtipos celulares a partir de metilación de ADN es esencial. Al ser un modelo de deconvolución, no requiere GPU ni grandes recursos de cómputo, y puede ejecutarse en entornos de análisis bioinformático estándar. La información técnica disponible es limitada: no se especifican parámetros, arquitectura interna ni datos de entrenamiento detallados, más allá de la referencia al paper original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deconvolución referenciada y restringida (reference-based constrained deconvolution) |
| Parametros totales | No disponible (modelo estadístico, no red neuronal) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (modelo biológico, no lingüístico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | No disponible (probablemente coeficientes de regresión, no safetensors) |

## Arquitectura y entrenamiento

El modelo implementa una deconvolución referenciada y restringida, un enfoque clásico en epigenética computacional que estima proporciones celulares resolviendo un problema de optimización con restricciones de no negatividad y suma a 1. La referencia utilizada consta de 240 sitios CpG, seleccionados según contrastes máximos de metilación entre cada tipo celular y el resto. Según la descripción, estos CpGs no son un subconjunto de los 1200 publicados por Salas et al. (2022), sino una versión alternativa incluida en Biolearn. No se detalla el procedimiento exacto de entrenamiento ni los datos utilizados para ajustar los coeficientes, más allá de la referencia al paper original que describe la metodología IDOL-Ext. El modelo está diseñado específicamente para datos de metilación de sangre periférica (leucocitos purificados) obtenidos con arrays EPIC.

## Capacidades

- Predicción de la proporción de eosinófilos en sangre periférica a partir de datos de metilación de ADN.
- Deconvolución restringida que garantiza proporciones no negativas y que suman 1.
- Integración directa con la librería pyaging mediante la función `predict_age` (aunque el nombre sugiere edad, el modelo devuelve proporción celular).
- Específico para la especie Homo sapiens y tejido de sangre periférica.
- No tiene capacidades de generación de texto, razonamiento, código, visión ni tool calling.

## Casos de uso

- Investigación en inmunología: estimar la fracción de eosinófilos en muestras de sangre de cohortes clínicas para correlacionar con enfermedades alérgicas, parasitarias o autoinmunes.
- Estudios de envejecimiento: integrar la proporción de eosinófilos como covariable en modelos de reloj epigenético para ajustar por composición celular.
- Análisis de datos de metilación de arrays EPIC: sustituir métodos de estimación celular más costosos o menos precisos en pipelines bioinformáticos existentes.
- Validación de biomarcadores: evaluar si cambios en la proporción de eosinófilos están asociados a intervenciones terapéuticas o exposiciones ambientales.
- Control de calidad en estudios epigenéticos: detectar desviaciones en la composición celular que puedan confundir análisis de metilación diferencial.
- Reproducción de resultados del paper original: comparar el rendimiento de esta implementación con la versión publicada de 1200 CpGs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas de precisión, correlación con proporciones reales ni comparaciones con otros métodos de deconvolución.

## Requisitos de hardware

- No requiere GPU; es un modelo ligero que se ejecuta en CPU.
- Memoria RAM estimada: inferior a 1 GB (típico para modelos de regresión con 240 características).
- Compatible con cualquier estación de trabajo o servidor sin aceleración especializada.
- Despliegue mediante la librería pyaging en entornos Python estándar (Jupyter, scripts, pipelines de Nextflow/Snakemake).
- Latencia: milisegundos por muestra, dado el pequeño número de CpGs implicados.

## Comparativa con modelos similares

| Modelo | Tipo | Referencia | CpGs | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| twelvecelldeconvolutebloodepiceos (pyaging) | Deconvolución restringida | 240 (no publicados) | 240 | BSD-3-Clause | HuggingFace |
| IDOL-Ext (Salas et al. 2022) | Deconvolución referenciada | 1200 publicados | 1200 | No especificada | GitHub/Biolearn |
| Houseman et al. (2012) | Deconvolución referenciada | 500 CpGs | 500 | No especificada | Paquetes R (minfi) |

No se dispone de datos comparativos de rendimiento entre estos métodos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está limitado a la estimación de eosinófilos; no proporciona proporciones de otros tipos celulares (aunque el nombre "twelvecelldeconvolute" sugiere que podría haber variantes para 12 tipos, no se confirma).
- La referencia de 240 CpGs no está documentada en la literatura publicada, lo que dificulta la reproducibilidad y la interpretación biológica.
- No se especifican los datos de entrenamiento ni la validación externa, por lo que el rendimiento en poblaciones no representadas en el estudio original es incierto.
- Al ser un modelo de deconvolución, asume que la metilación de cada CpG es una combinación lineal de las firmas celulares; esta suposición puede fallar en tejidos con células atípicas o en condiciones patológicas.
- Licencia BSD-3-Clause permite uso comercial, pero la falta de documentación técnica detallada puede limitar su adopción en entornos regulados.
- No es un modelo de lenguaje; cualquier intento de usarlo para tareas de NLP o generación de texto es inválido.

## Enlaces

- HuggingFace: https://huggingface.co/pyaging/twelvecelldeconvolutebloodepiceos
- Paper original: Salas, L.A., Zhang, Z., Koestler, D.C. et al. Enhanced cell deconvolution of peripheral blood using DNA methylation for high-resolution immune profiling. Nature Communications 13, 761 (2022). DOI: https://doi.org/10.1038/s41467-021-27864-7
- Documentación de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
