# pyaging/twelvecelldeconvolutebloodepicbmem

## Resumen

El modelo `twelvecelldeconvolutebloodepicbmem` es un modelo de deconvolución celular basado en referencia, desarrollado por el equipo de pyaging, que estima la proporción de células B de memoria en sangre periférica a partir de datos de metilación de ADN obtenidos con arrays EPIC. A diferencia de los modelos de lenguaje, no es un modelo generativo, sino un método estadístico de regresión restringida que utiliza una librería de 240 CpGs (heredada de Biolearn) para calcular la fracción de un subtipo celular concreto. Su relevancia radica en su aplicación en estudios de envejecimiento e inmunología, donde la composición celular sanguínea es un biomarcador clave.

El modelo se distribuye a través de la librería `pyaging`, que permite integrarlo fácilmente en pipelines de análisis de datos de metilación. Está basado en el trabajo de Salas et al. (2022) publicado en Nature Communications, aunque la implementación actual difiere en el conjunto de sondas utilizado. No requiere hardware especializado y puede ejecutarse en CPU convencional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deconvolución restringida basada en referencia (no red neuronal) |
| Parametros totales | No aplicable (modelo estadístico con 240 CpGs) |
| Parametros activos | No aplicable |
| Longitud de contexto | No aplicable |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | No aplicable (datos biológicos) |
| Licencia | BSD-3-Clause |
| Formato de pesos | No aplicable (integrado en librería pyaging) |

## Arquitectura y entrenamiento

El modelo implementa una deconvolución celular restringida basada en referencia. Este enfoque utiliza una matriz de referencia que contiene perfiles de metilación de distintos tipos celulares (en este caso, leucocitos de sangre purificada) y resuelve las proporciones celulares mediante optimización con restricciones (por ejemplo, que las proporciones sumen 1 y sean no negativas). La selección de las 240 CpGs no corresponde a las 1.200 sondas publicadas originalmente por Salas et al. (2022), sino que se hereda de la implementación interna de Biolearn; según la descripción, estas sondas presentan 10 contrastes positivos y 10 negativos de metilación máximos por subtipo celular frente al resto, y no son un subconjunto de las 1.200 publicadas. No se dispone de detalles adicionales sobre el proceso de entrenamiento, como el número de muestras o el método de validación.

## Capacidades

- Estima la proporción de células B de memoria en muestras de sangre periférica a partir de datos de metilación de ADN de arrays EPIC.
- Integrable en flujos de trabajo de análisis de envejecimiento mediante la librería `pyaging`, que ofrece una API unificada para múltiples relojes epigenéticos.
- Funciona como un componente de perfilado inmune de alta resolución, complementando otros relojes de envejecimiento.
- No es un modelo generativo ni de lenguaje; su salida es un valor numérico (proporción celular).
- No requiere GPU ni hardware especializado; se ejecuta en CPU.

## Casos de uso

- Investigación en envejecimiento: estudiar cómo cambia la proporción de células B de memoria con la edad, integrando el modelo en pipelines de análisis de metilación para correlacionar con otros biomarcadores.
- Estudios de inmunosenescencia: evaluar la composición del sistema inmune en cohortes de ancianos o pacientes con enfermedades relacionadas con la edad.
- Análisis de biomarcadores epigenéticos: combinar la deconvolución celular con relojes de envejecimiento para ajustar por composición celular en estudios de asociación.
- Control de calidad en datos de metilación: verificar que las proporciones celulares estimadas son plausibles en muestras con composición conocida.
- Investigación traslacional: explorar la relación entre la proporción de células B de memoria y enfermedades autoinmunes o inmunodeficiencias, usando datos de sangre periférica.
- Docencia y formación: servir como ejemplo práctico de deconvolución celular basada en metilación en cursos de bioinformática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas de precisión, correlación con proporciones reales o comparación con otros métodos de deconvolución en este repositorio.

## Requisitos de hardware

- No requiere GPU; el modelo se ejecuta en CPU.
- Consumo de memoria mínimo, al tratarse de una regresión lineal con 240 características.
- Depende de la librería `pyaging`, que requiere Python y paquetes estándar de análisis de datos (numpy, pandas, etc.).
- Despliegue sencillo en entornos de investigación o producción ligera, sin necesidad de infraestructura especializada.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros métodos de deconvolución celular en la información proporcionada. Se pueden mencionar alternativas conocidas como IDOL-Ext (publicado en el mismo trabajo de Salas et al.) o CIBERSORT, pero no hay datos cuantitativos para comparar en esta ficha.

## Limitaciones y advertencias

- La selección de 240 CpGs no corresponde a la librería publicada de 1.200 sondas; esto puede afectar a la reproducibilidad y al rendimiento en diferentes cohortes.
- El modelo está diseñado específicamente para datos de arrays EPIC de metilación de sangre; su uso con otras plataformas o tejidos puede dar resultados inválidos.
- No se han publicado métricas de validación en la información del repositorio, por lo que se desconoce su precisión real.
- Como cualquier método de deconvolución, asume que la matriz de referencia es representativa de la población estudiada; puede haber sesgos en poblaciones no caucásicas o con condiciones patológicas.
- La licencia BSD-3-Clause permite uso comercial y modificación, pero se recomienda citar el trabajo original de Salas et al. (2022) en publicaciones.
- El modelo no es un predictor de edad biológica, sino un componente auxiliar para ajustar por composición celular en análisis de envejecimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pyaging/twelvecelldeconvolutebloodepicbmem
- Documentación de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
- Publicación original: Salas, L.A., Zhang, Z., Koestler, D.C. et al. Enhanced cell deconvolution of peripheral blood using DNA methylation for high-resolution immune profiling. Nature Communications 13, 761 (2022). DOI: https://doi.org/10.1038/s41467-021-27864-7
