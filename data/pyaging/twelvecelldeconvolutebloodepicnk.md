# pyaging/twelvecelldeconvolutebloodepicnk

## Resumen

El modelo `pyaging/twelvecelldeconvolutebloodepicnk` es un modelo de deconvolución celular basado en metilación de ADN, desarrollado por el autor `pyaging` dentro de la librería homónima. Su función es estimar la proporción de células natural killer (NK) en muestras de sangre periférica a partir de datos de metilación de ADN obtenidos con arrays EPIC. Este tipo de modelos es relevante en el campo de los relojes de envejecimiento y la inmunología computacional, ya que permite descomponer la composición celular de una muestra sin necesidad de citometría de flujo, usando únicamente datos epigenéticos.

El modelo emplea una estrategia de deconvolución restringida basada en referencias (reference-based constrained deconvolution). Según la model card, utiliza un conjunto de 240 CpGs que no coincide con los 1.200 CpGs del método EPIC IDOL-Ext publicado por Salas et al. (2022), sino que hereda una selección alternativa de la librería Biolearn, con 10 contrastes positivos y 10 negativos por subtipo celular. No se especifican parámetros totales ni detalles de arquitectura interna, pero al tratarse de un método estadístico de regresión lineal restringida sobre un conjunto reducido de marcadores, su coste computacional es mínimo.

El modelo está pensado para integrarse en flujos de análisis de metilación con la librería `pyaging`, que permite predecir múltiples relojes y descomposiciones celulares de forma unificada. Aunque no es un modelo de lenguaje ni de visión, su inclusión en un catálogo de fichas técnicas responde a la necesidad de documentar herramientas de IA aplicadas a la biología computacional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reference-based constrained deconvolution (regresión restringida) |
| Parametros totales | no disponible (método basado en 240 CpGs) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no procesa texto) |
| Tipos de cuantizacion | no disponible (no es un modelo de pesos) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (el modelo se distribuye como parte de la librería pyaging, no como pesos independientes) |

## Arquitectura y entrenamiento

El modelo implementa una deconvolución celular restringida basada en referencias. En este enfoque, se parte de una matriz de referencia que contiene los perfiles de metilación esperados para distintos tipos celulares (en este caso, leucocitos de sangre periférica). La proporción de cada tipo celular en una muestra desconocida se estima resolviendo un problema de optimización con restricciones de no negatividad y suma a uno, típicamente mediante mínimos cuadrados restringidos o programación cuadrática.

La model card indica que el conjunto de CpGs utilizado es de 240 sondas, seleccionadas para maximizar los contrastes de metilación entre cada subtipo celular y el resto. Esta selección no coincide con la publicada por Salas et al. (2022), que usaba 1.200 CpGs, sino que proviene de una implementación interna de Biolearn. No se proporcionan detalles sobre el procedimiento exacto de entrenamiento (número de muestras, validación cruzada, etc.), pero el artículo original de referencia (doi:10.1038/s41467-021-27864-7) describe la metodología general para la deconvolución de sangre periférica con arrays EPIC.

El modelo fue creado en 2022 y se distribuye exclusivamente a través de la librería `pyaging`, que actúa como contenedor y API de predicción.

## Capacidades

- Predicción de la proporción de células natural killer (NK) en muestras de sangre periférica a partir de datos de metilación de ADN (arrays EPIC).
- Integración con el ecosistema `pyaging` para el cálculo simultáneo de múltiples relojes epigenéticos y descomposiciones celulares.
- Funciona sobre datos de metilación de Homo sapiens, específicamente de leucocitos purificados.
- Método ligero y rápido: al operar sobre 240 CpGs, no requiere GPU ni infraestructura especializada.
- No requiere etiquetas celulares externas durante la inferencia; la referencia está incorporada en el modelo.

## Casos de uso

- Investigación en envejecimiento: estimar la proporción de células NK en cohortes de edad avanzada para correlacionar cambios inmunológicos con relojes epigenéticos.
- Estudios de inmunosenescencia: cuantificar la variación de células NK en sangre periférica sin necesidad de citometría de flujo, usando datos de metilación ya disponibles.
- Validación de biomarcadores: incorporar la proporción de células NK como covariable en modelos de riesgo de enfermedades infecciosas o autoinmunes.
- Análisis de datos epigenéticos públicos: reutilizar conjuntos de datos de metilación (GEO, TCGA) para extraer la composición celular sin nuevos experimentos.
- Control de calidad en estudios de metilación: detectar variaciones en la composición celular que puedan confundir asociaciones con fenotipos.
- Integración en pipelines de biología computacional: usar `pyaging` para ejecutar la deconvolución junto con otros relojes, facilitando análisis reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas cuantitativas de precisión (p. ej., correlación con citometría de flujo) ni comparaciones con otros métodos de deconvolución en este contexto.

## Requisitos de hardware

- Al ser un modelo estadístico sobre 240 CpGs, no requiere GPU. Se ejecuta en CPU con memoria RAM estándar (menos de 1 GB).
- No hay requisitos específicos de GPU; cualquier máquina con Python y las dependencias de `pyaging` puede ejecutarlo.
- Despliegue típico: integración en scripts de análisis con `pyaging` (Python), sin necesidad de servidores de inferencia.
- Latencia: del orden de milisegundos por muestra, dependiendo del tamaño del dataset.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para deconvolución de células NK mediante metilación de ADN. Existen métodos generales como CIBERSORTx o EPIC, pero no se han incluido datos de comparación en la documentación proporcionada.

## Limitaciones y advertencias

- El conjunto de 240 CpGs no está documentado públicamente en detalle; su selección se hereda de Biolearn y no es un subconjunto de los 1.200 CpGs publicados en el artículo de referencia, lo que puede afectar a la reproducibilidad.
- No se han publicado métricas de validación externa en la model card; se recomienda validar el modelo en la población y tejido de interés antes de su uso en producción.
- El modelo está diseñado exclusivamente para sangre periférica de Homo sapiens; su aplicación a otros tejidos o especies no está soportada.
- La licencia BSD-3-Clause permite uso comercial, pero el usuario debe verificar que los datos de metilación utilizados cumplan con las normativas de privacidad y consentimiento.
- Al ser una herramienta de estimación, las proporciones predichas pueden tener errores, especialmente en muestras con composiciones celulares atípicas o baja calidad de datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pyaging/twelvecelldeconvolutebloodepicnk
- Artículo original: Salas, L.A., Zhang, Z., Koestler, D.C. et al. Enhanced cell deconvolution of peripheral blood using DNA methylation for high-resolution immune profiling. Nature Communications 13, 761 (2022). DOI: https://doi.org/10.1038/s41467-021-27864-7
- Documentación de pyaging: https://pyaging.readthedocs.io
