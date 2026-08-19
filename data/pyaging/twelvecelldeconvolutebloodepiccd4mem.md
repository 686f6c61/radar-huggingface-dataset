# pyaging/twelvecelldeconvolutebloodepiccd4mem

## Resumen

El modelo `twelvecelldeconvolutebloodepiccd4mem` es un modelo de deconvolución celular restringida basada en referencia, desarrollado por el equipo de pyaging, que estima la proporción de células T CD4+ de memoria en sangre periférica a partir de datos de metilación de ADN obtenidos con arrays EPIC (Illumina). Se integra en la librería pyaging, orientada a relojes de envejecimiento y análisis biológicos, y se publicó originalmente en 2022 como parte del trabajo de Salas et al. sobre deconvolución mejorada de células sanguíneas.

A diferencia de la librería IDOL-Ext publicada, que emplea 1.200 CpGs seleccionadas para optimizar la recuperación de proporciones celulares en mezclas artificiales, este modelo utiliza una selección de 240 CpGs heredada de Biolearn, cuyas filas reproducen 10 contrastes positivos y 10 negativos de metilación por subtipo celular, y no son un subconjunto de las 1.200 sondas originales. Esta característica lo hace relevante para estudios de inmunología, envejecimiento y epidemiología molecular que requieren estimaciones de subtipos celulares a partir de metilación.

El modelo es ligero, no requiere GPU y se puede ejecutar directamente con la API de pyaging. Su licencia BSD-3-Clause permite uso comercial y modificación, lo que facilita su integración en pipelines de investigación y aplicaciones clínicas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deconvolución restringida basada en referencia (reference-based constrained deconvolution) |
| Parametros totales | 240 CpGs (sondas de metilación) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo implementa un método de deconvolución restringida basada en referencia. En este enfoque, se parte de una matriz de referencia que contiene los perfiles de metilación de distintos tipos celulares (en este caso, subtipos de leucocitos). La proporción de cada tipo celular en una muestra desconocida se estima resolviendo un problema de optimización con restricciones (por ejemplo, que las proporciones sumen 1 y sean no negativas). La selección de 240 CpGs se realizó mediante un procedimiento que maximiza los contrastes de metilación entre cada subtipo celular y el resto, según se describe en la documentación de pyaging.

Los datos de entrenamiento provienen de muestras de sangre periférica purificada, con perfiles de metilación obtenidos mediante arrays EPIC. No se dispone de información detallada sobre el número de muestras ni el proceso exacto de validación, más allá de la referencia al artículo de Salas et al. (2022). El modelo fue diseñado específicamente para predecir la proporción de células T CD4+ de memoria, aunque la metodología subyacente podría extenderse a otros subtipos.

## Capacidades

- Predicción de la proporción de células T CD4+ de memoria en sangre periférica a partir de datos de metilación de arrays EPIC.
- Integración directa con la librería pyaging mediante la función `pya.pred.predict_age`.
- Funciona con datos de metilación de ADN, no requiere otro tipo de entrada.
- Modelo ligero, ejecutable en CPU sin necesidad de GPU.
- Compatible con el ecosistema de pyaging para análisis de envejecimiento y deconvolución celular.
- No incluye capacidades de generación de texto, tool calling ni razonamiento multi-paso, al ser un modelo puramente biológico.

## Casos de uso

- Estudios de envejecimiento: estimar la proporción de células T CD4+ de memoria en cohortes de individuos de distintas edades para correlacionar cambios inmunológicos con la edad biológica.
- Investigación en inmunología: cuantificar la abundancia de este subtipo celular en muestras de sangre de pacientes con enfermedades autoinmunes o infecciones, sin necesidad de citometría de flujo.
- Análisis de datos de metilación existentes: reutilizar conjuntos de datos públicos de arrays EPIC para obtener estimaciones de composición celular sin nuevos experimentos.
- Biomarcadores de salud: incorporar la proporción de células T CD4+ de memoria como variable en modelos predictivos de riesgo cardiovascular o metabólico.
- Control de calidad en estudios epigenéticos: ajustar los análisis de metilación diferencial por la composición celular estimada, reduciendo confusores.
- Desarrollo de relojes epigenéticos: combinar la deconvolución celular con relojes de envejecimiento para separar efectos de la edad de efectos de la composición inmune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no presenta métricas comparativas como MMLU, HumanEval o GSM8K, dado que no es un modelo de lenguaje. No se dispone de datos de precisión, sensibilidad o especificidad en la deconvolución, ni de comparaciones con otros métodos como IDOL-Ext o CIBERSORT.

## Requisitos de hardware

- No requiere GPU. El modelo es un conjunto de coeficientes y una matriz de referencia, por lo que puede ejecutarse en cualquier CPU moderna.
- Memoria RAM estimada: inferior a 1 GB, ya que solo maneja 240 sondas y una matriz de referencia pequeña.
- Se integra con la librería pyaging, que depende de Python y paquetes estándar de análisis de datos (numpy, pandas, etc.).
- Despliegue: no aplica vLLM, llama.cpp u otros motores de inferencia para LLMs. Se utiliza directamente mediante la API de pyaging.
- Latencia: prácticamente instantánea en una muestra individual; para miles de muestras, el tiempo de cómputo es del orden de segundos en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros métodos de deconvolución como IDOL-Ext, CIBERSORT o EpiDISH. El modelo se distingue por su selección de 240 CpGs no publicada y su enfoque restringido, pero no hay datos de rendimiento comparativo en la documentación disponible.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para datos de metilación de arrays EPIC; no funciona con datos de secuenciación de bisulfito ni otros formatos.
- La selección de 240 CpGs no está documentada públicamente en detalle, lo que dificulta la reproducibilidad completa del método.
- La predicción se limita a un único subtipo celular (células T CD4+ de memoria); no proporciona proporciones para otros tipos celulares.
- Posibles sesgos en poblaciones no representadas en los datos de entrenamiento, ya que no se especifica la diversidad étnica o geográfica de las muestras.
- No se han publicado validaciones externas independientes más allá del artículo original de Salas et al. (2022).
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda citar el trabajo original en publicaciones.

## Enlaces

- HuggingFace: https://huggingface.co/pyaging/twelvecelldeconvolutebloodepiccd4mem
- Artículo original: Salas, L.A., Zhang, Z., Koestler, D.C. et al. Enhanced cell deconvolution of peripheral blood using DNA methylation for high-resolution immune profiling. Nature Communications 13, 761 (2022). https://doi.org/10.1038/s41467-021-27864-7
- Documentación de pyaging: https://pyaging.readthedocs.io
