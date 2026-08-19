# pyaging/systemsage

## Resumen

systemsage es un reloj de envejecimiento (aging clock) desarrollado por el equipo de pyaging que predice la edad biológica multisistémica a partir de datos de metilación de ADN en sangre completa. El modelo integra 11 puntuaciones de sistemas fisiológicos asociados a mortalidad junto con una predicción de edad cronológica basada en metilación, utilizando análisis de componentes principales (PCA) y regresión elastic net de Cox. El resultado se reescala a un valor con unidades de edad, lo que permite cuantificar la heterogeneidad del envejecimiento entre distintos sistemas del organismo.

Publicado en 2025 en Nature Aging (Sehgal et al.), este modelo representa una herramienta relevante para la investigación biomédica del envejecimiento, ya que permite obtener una medida compuesta del estado fisiológico a partir de una única muestra de sangre. A diferencia de los relojes de envejecimiento clásicos que predicen edad cronológica o mortalidad, systemsage ofrece una visión desagregada por sistemas, lo que facilita estudios sobre envejecimiento diferencial y evaluación de intervenciones. El modelo se distribuye bajo licencia BSD-3-Clause y se integra en la librería pyaging, con un repositorio de aproximadamente 2 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PCA + regresión elastic net de Cox |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

systemsage no es un modelo de aprendizaje profundo, sino un modelo estadístico basado en dos etapas. Primero, se aplica PCA sobre las mediciones de metilación de ADN para reducir la dimensionalidad de los datos de CpG. Después, se utiliza una regresión elastic net de Cox para modelar la asociación entre las puntuaciones de 11 sistemas fisiológicos (por ejemplo, cardiovascular, inmunológico, metabólico) y la mortalidad, combinando estas puntuaciones con una predicción de edad cronológica por metilación. El resultado final se reescala a una escala de edad biológica.

El entrenamiento se realizó con datos de metilación de sangre completa de cohortes humanas, aunque no se especifican el número de muestras ni la composición exacta del conjunto de datos en la información disponible. La elección de PCA y elastic net permite obtener un modelo interpretable y con bajo coste computacional, a diferencia de los enfoques basados en redes neuronales. No se menciona el uso de RLHF, DPO u otras técnicas de ajuste propias de modelos de lenguaje, ya que no es aplicable a este tipo de modelo.

## Capacidades

- Predicción de edad biológica multisistémica: combina 11 sistemas fisiológicos en una única puntuación compuesta.
- Desagregación por sistemas: permite analizar qué sistemas envejecen más rápido o más lento en un individuo.
- Integración con pyaging: se puede utilizar directamente mediante `pya.pred.predict_age(adata, ["systemsage"])` sobre datos de metilación en formato AnnData.
- Específico para Homo sapiens y tejido de sangre completa.
- Entrada de datos: matriz de metilación de ADN (probetas CpG) procesada previamente.
- No genera texto, no procesa lenguaje natural ni tiene capacidades de visión, audio o tool calling.

## Casos de uso

- Investigación en biomarcadores de envejecimiento: permite cuantificar la edad biológica de un individuo y compararla con su edad cronológica, útil en estudios longitudinales de envejecimiento.
- Estudios epidemiológicos: se puede aplicar a grandes cohortes con datos de metilación para identificar factores asociados a un envejecimiento acelerado o retardado en diferentes sistemas.
- Evaluación de intervenciones antienvejecimiento: sirve como endpoint para medir el efecto de fármacos, dietas o cambios de estilo de vida sobre la edad biológica multisistémica.
- Medicina de precisión: ayuda a identificar pacientes con envejecimiento acelerado en sistemas concretos, orientando estrategias de prevención personalizadas.
- Análisis de datos de metilación en laboratorios: se integra en pipelines de pyaging, facilitando su uso en entornos de investigación con datos de microarrays o secuenciación.
- Validación de nuevos relojes de envejecimiento: puede servir como referencia comparativa para desarrollar o calibrar otros modelos predictivos de edad biológica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como correlación con edad cronológica, precisión en la predicción de mortalidad o comparaciones con otros relojes de envejecimiento.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información disponible.
- Dado que el modelo es una combinación de PCA y regresión lineal, la inferencia es computacionalmente ligera y probablemente pueda ejecutarse en CPU con pocos recursos de memoria.
- El repositorio tiene un tamaño de 2 GB, que puede incluir pesos del modelo y datos auxiliares, pero no se detalla el desglose.
- Para su uso con pyaging, se recomienda disponer de un entorno Python con las dependencias de la librería (no especificadas).

## Comparativa con modelos similares

No se dispone de información comparativa en los datos proporcionados. Existen otros relojes de envejecimiento como Horvath, PhenoAge o GrimAge, pero no se han encontrado comparaciones numéricas con systemsage en la documentación disponible. La principal diferencia es que systemsage ofrece una puntuación multisistémica, mientras que muchos relojes clásicos predicen edad biológica global o mortalidad.

## Limitaciones y advertencias

- Es un modelo estadístico, no causal: las asociaciones entre metilación y mortalidad no implican causalidad.
- Requiere datos de metilación de alta calidad y procesados según el estándar de pyaging; la aplicación a otros tipos de tejido o especies no está soportada.
- Puede presentar sesgos poblacionales si las cohortes de entrenamiento no son representativas de la población objetivo.
- No es un modelo de lenguaje y no debe utilizarse para tareas de procesamiento de texto.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda revisar los términos de la publicación original (Nature Aging) para posibles restricciones adicionales.
- No se han publicado métricas de rendimiento, por lo que su precisión en poblaciones diversas es desconocida.

## Enlaces

- HuggingFace: https://huggingface.co/pyaging/systemsage
- Documentación de pyaging: https://pyaging.readthedocs.io
- Publicación original: Sehgal, R., Markov, Y., Qin, C., et al. (2025). Systems Age: a single blood methylation test to quantify aging heterogeneity across 11 physiological systems. Nature Aging, 5, 1880–1896. https://doi.org/10.1038/s43587-025-00958-3
