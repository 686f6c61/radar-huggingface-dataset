# pyaging/pchannum

## Resumen

pchannum es un reloj epigenético desarrollado por el equipo de pyaging, un modelo de regresión basado en análisis de componentes principales (PCA) y regresión elastic net. Su función es predecir la edad cronológica de un individuo a partir de datos de metilación de ADN en sangre total, reproduciendo la puntuación del reloj de Hannum original. Este modelo se integra en la librería pyaging, diseñada para facilitar el cálculo de relojes epigenéticos en estudios de envejecimiento. Su relevancia radica en que ofrece una implementación ligera y reproducible de un reloj ampliamente utilizado en la literatura, permitiendo a investigadores calcular la edad biológica sin necesidad de reimplementar el método desde cero. El modelo está pensado para su uso en investigación biomédica, especialmente en estudios longitudinales y ensayos clínicos donde la medición precisa de la edad biológica es crítica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PCA + regresión elastic net |
| Parametros totales | no disponible (modelo de regresión, no red neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica (modelo numérico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (integrado en librería pyaging) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de dos etapas: primero se aplica PCA sobre las medidas de metilación de ADN para reducir la dimensionalidad, y posteriormente se ajusta una regresión elastic net sobre los componentes principales para predecir la edad cronológica. Este enfoque, descrito en el trabajo de Higgins-Chen et al. (2022), busca reproducir la puntuación del reloj de Hannum original, que utiliza un conjunto específico de CpGs en sangre total. Los detalles exactos del conjunto de entrenamiento (número de muestras, composición demográfica, plataforma de metilación) no se especifican en la información disponible, aunque se sabe que el modelo está calibrado para tejido de sangre completa en Homo sapiens. No se aplican técnicas de RLHF/DPO, al tratarse de un modelo de regresión supervisada.

## Capacidades

- Predicción de edad cronológica a partir de datos de metilación de ADN.
- Específico para tejido de sangre total en humanos.
- Reproduce la puntuación del reloj de Hannum, un estándar en la literatura de relojes epigenéticos.
- Integración sencilla con la librería pyaging mediante la función `predict_age`.
- Modelo ligero (0.2 GB) que puede ejecutarse en CPU sin necesidad de GPU.
- Diseñado para su uso en pipelines de análisis de datos de metilación (por ejemplo, datos de arrays Illumina).

## Casos de uso

- Estudios de envejecimiento biológico: permite calcular la edad epigenética de cohortes de individuos a partir de datos de metilación en sangre, facilitando la comparación con la edad cronológica y la identificación de aceleración del envejecimiento.
- Ensayos clínicos de intervenciones antienvejecimiento: se puede utilizar como biomarcador de eficacia, midiendo cambios en la edad biológica antes y después de una intervención.
- Investigación longitudinal: al ser un modelo ligero, puede aplicarse a grandes conjuntos de datos almacenados en formato AnnData, integrándose con herramientas de análisis existentes.
- Validación de nuevos relojes epigenéticos: sirve como referencia para comparar el rendimiento de otros modelos de predicción de edad.
- Análisis de datos de metilación en estudios de epidemiología: permite incorporar la edad biológica como covariable en modelos de riesgo de enfermedades relacionadas con la edad.
- Reproducción de resultados de la literatura: al ser un proxy del reloj de Hannum, facilita la replicación de estudios previos sin necesidad de descargar los pesos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como correlación con la edad cronológica, error absoluto medio o comparaciones con otros relojes epigenéticos en la model card.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un conjunto de coeficientes de regresión y componentes PCA, por lo que no requiere GPU. El tamaño del repositorio es de 0.2 GB, lo que indica que los datos de pesos son pequeños.
- Memoria RAM: estimada en menos de 1 GB para cargar el modelo y procesar una muestra típica de metilación.
- GPU: no necesaria; puede ejecutarse en cualquier máquina con Python y la librería pyaging.
- Opciones de despliegue: se integra en entornos de análisis de datos con Python, usando la librería pyaging. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia: al ser una regresión lineal sobre componentes PCA, la inferencia es prácticamente instantánea (del orden de milisegundos por muestra).

## Comparativa con modelos similares

No se dispone de información sobre otros relojes epigenéticos implementados en pyaging en la model card. Sin embargo, el modelo es un proxy del reloj de Hannum original, que es uno de los relojes de primera generación más citados. Otros relojes como el de Horvath (multi-tejido) o el de PhenoAge podrían considerarse alternativas, pero no se proporcionan datos comparativos en la información disponible. Se recomienda consultar el catálogo de relojes de pyaging para obtener una lista completa.

## Limitaciones y advertencias

- Específico para sangre total: el modelo no es válido para otros tejidos, ya que fue entrenado con datos de metilación de sangre.
- Reproduce el reloj de Hannum, que fue desarrollado con datos de arrays de metilación (450K o EPIC). Su uso con datos de otras plataformas puede requerir normalización adicional.
- No se proporcionan detalles sobre la composición demográfica del conjunto de entrenamiento, por lo que puede haber sesgos en poblaciones no representadas.
- Al ser un modelo de regresión, no ofrece medidas de incertidumbre en sus predicciones; se recomienda usar métodos de bootstrap u otras técnicas para estimar intervalos de confianza.
- La licencia BSD-3-Clause permite uso comercial, pero se debe atribuir la autoría y no usar el nombre de los autores para promocionar productos derivados sin permiso.
- La fecha de creación del repositorio (2026) es futura, lo que sugiere que el modelo podría estar en fase de validación temprana; se recomienda verificar la estabilidad de la implementación antes de usarlo en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pyaging/pchannum
- Documentación de pyaging (catálogo de relojes): https://pyaging.readthedocs.io
- Publicación original del método: Higgins-Chen, Albert T., et al. "A computational solution for bolstering reliability of epigenetic clocks: implications for clinical trials and longitudinal tracking." Nature Aging 2 (2022): 644–661. DOI: https://doi.org/10.1038/s43587-022-00248-2
