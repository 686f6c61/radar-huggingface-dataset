# pyaging/pcgrimage

## Resumen

pcgrimage es un reloj epigenético (aging clock) diseñado para predecir el riesgo de mortalidad a partir de datos de metilación de ADN en sangre completa humana. Fue desarrollado por la organización pyaging como una aproximación computacional al reloj GrimAge original, utilizando un enfoque de análisis de componentes principales (PCA) combinado con regresión elastic net. El modelo toma como entradas adicionales la edad cronológica y el sexo, lo que permite estimar la edad biológica y el riesgo asociado de mortalidad. Su relevancia actual radica en la creciente demanda de biomarcadores fiables para estudios de envejecimiento, ensayos clínicos y seguimiento longitudinal de intervenciones anti-envejecimiento. El repositorio en HuggingFace tiene un tamaño de 1,2 GB, aunque no se especifican parámetros numéricos al tratarse de un modelo de regresión, no de una red neuronal profunda.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PCA + elastic net regression |
| Parametros totales | no disponible (modelo de regresión, no red neuronal) |
| Parametros activos | no aplicable |
| Longitud de contexto | no aplicable |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (probablemente archivos internos del paquete pyaging) |

## Arquitectura y entrenamiento

El modelo se basa en una transformación PCA de los datos de metilación de ADN, seguida de una regresión lineal con regularización elastic net. Esta combinación reduce la alta dimensionalidad de los datos de metilación (cientos de miles de CpG) a un número reducido de componentes principales, sobre los cuales se ajusta un modelo lineal regularizado para reproducir la puntuación GrimAge original. La edad cronológica y el sexo se incorporan como covariables adicionales. Los detalles exactos del conjunto de entrenamiento (número de muestras, plataforma de microarrays, etc.) no se especifican en la información disponible, pero se sabe que el modelo está calibrado para tejido de sangre completa en Homo sapiens. La innovación principal es la creación de un proxy computacional que evita la necesidad de calcular directamente la puntuación GrimAge original, simplificando su uso en entornos clínicos y de investigación.

## Capacidades

- Predicción de la edad epigenética y el riesgo de mortalidad a partir de datos de metilación de ADN.
- Acepta como entradas la matriz de metilación (por ejemplo, en formato AnnData) junto con la edad y el sexo de los individuos.
- Integración sencilla con el paquete pyaging mediante la función `pya.pred.predict_age(adata, ["pcgrimage"])`.
- Diseñado específicamente para muestras de sangre completa, lo que lo hace adecuado para estudios epidemiológicos y clínicos que usan este tipo de tejido.
- No requiere GPU ni hardware especializado; la inferencia se realiza en CPU de forma rápida.
- Proporciona una puntuación continua que puede correlacionarse con resultados de mortalidad en estudios longitudinales.

## Casos de uso

- Investigación en envejecimiento: los investigadores pueden aplicar pcgrimage a cohortes con datos de metilación para estimar la edad biológica de los participantes y estudiar su asociación con enfermedades relacionadas con la edad.
- Ensayos clínicos de intervenciones anti-envejecimiento: el modelo permite monitorizar cambios en la edad epigenética a lo largo del tiempo, sirviendo como biomarcador de eficacia en estudios de fármacos o cambios de estilo de vida.
- Estudios longitudinales de mortalidad: al predecir el riesgo de mortalidad, puede utilizarse como variable predictiva en modelos de supervivencia junto con otros factores clínicos.
- Medicina de precisión: en entornos clínicos, la estimación de la edad biológica puede ayudar a identificar individuos con envejecimiento acelerado y personalizar estrategias preventivas.
- Validación de nuevos relojes epigenéticos: al ser un proxy del GrimAge original, puede usarse como referencia para comparar el rendimiento de otros relojes o para calibrar nuevas versiones.
- Análisis de datos públicos: los investigadores que trabajan con conjuntos de datos de metilación disponibles públicamente (por ejemplo, GEO) pueden aplicar pcgrimage sin necesidad de implementar el GrimAge original, que requiere acceso a un servidor externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como correlación con edad cronológica, AUC para mortalidad o comparaciones con otros relojes epigenéticos.

## Requisitos de hardware

- Inferencia en CPU: el modelo es ligero y no requiere GPU. El repositorio ocupa 1,2 GB, pero la carga en memoria es mínima (solo los coeficientes de la regresión y los componentes PCA).
- RAM estimada: menos de 1 GB para la inferencia típica con miles de muestras.
- GPU recomendada: ninguna.
- Compatible con cualquier sistema con Python y el paquete pyaging instalado.
- Opciones de despliegue: uso local en scripts de Python, integración en pipelines de análisis de datos (por ejemplo, con Scanpy/AnnData) o en servicios de bioinformática.

## Comparativa con modelos similares

Existen otros relojes epigenéticos como Horvath, Hannum, PhenoAge y el propio GrimAge original. Sin embargo, no se dispone de una comparativa cuantitativa publicada en la información proporcionada. Se puede señalar que pcgrimage se distingue por ser un proxy computacional del GrimAge, lo que facilita su implementación sin depender de servicios externos, mientras que otros relojes pueden requerir cálculos más complejos o acceso a herramientas específicas.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para sangre completa; su aplicación a otros tejidos (sangre seca, saliva, etc.) puede producir resultados poco fiables.
- La precisión depende de la calidad y el preprocesamiento de los datos de metilación (normalización, control de calidad, etc.).
- Al ser un proxy del GrimAge original, puede haber pequeñas discrepancias con la puntuación original, aunque se espera que sean mínimas.
- No se han publicado análisis de sesgos poblacionales; es posible que el modelo tenga un rendimiento inferior en poblaciones no representadas en los datos de entrenamiento.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda revisar los términos de la publicación original (Nature Aging) para cualquier restricción adicional.
- No es un modelo de lenguaje ni de IA generativa; su uso se limita a datos de metilación de ADN.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pyaging/pcgrimage
- Publicación original: Higgins-Chen, Albert T., et al. "A computational solution for bolstering reliability of epigenetic clocks: implications for clinical trials and longitudinal tracking." Nature Aging 2 (2022): 644–661. DOI: https://doi.org/10.1038/s43587-022-00248-2
- Documentación de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
