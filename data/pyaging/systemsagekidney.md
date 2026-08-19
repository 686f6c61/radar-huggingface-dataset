# pyaging/systemsagekidney

## Resumen
`pyaging/systemsagekidney` es un reloj de envejecimiento biológico específico para el sistema renal, desarrollado por el equipo de pyaging (Sehgal, Markov, Qin et al.) como parte del sistema "Systems Age". Este modelo predice la edad biológica del sistema renal a partir de perfiles de metilación de ADN en sangre completa, devolviendo un valor en escala de edad (años). Se trata de un componente de un conjunto más amplio de 11 relojes fisiológicos que cuantifican la heterogeneidad del envejecimiento entre distintos sistemas del organismo.

El modelo utiliza una arquitectura de regresión PCA + elastic net, una técnica estadística clásica pero eficaz para datos de alta dimensionalidad como los de metilación de ADN. Fue entrenado con biomarcadores renales y datos de mortalidad, lo que le permite estimar la edad biológica renal a partir de la metilación en sangre. Su relevancia radica en que ofrece una medición no invasiva y accesible del envejecimiento de un órgano específico, con potenciales aplicaciones en medicina preventiva y estudios de longevidad. El repositorio tiene un tamaño de 2.0 GB e integra con la librería `pyaging` para su uso directo en pipelines de análisis.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | PCA + elastic net regression |
| Parametros totales | no disponible (modelo estadístico, no red neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (datos biológicos) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (integrado en librería pyaging) |

## Arquitectura y entrenamiento
El modelo emplea una combinación de análisis de componentes principales (PCA) y regresión elastic net. La PCA reduce la dimensionalidad de los datos de metilación de ADN (típicamente cientos de miles de CpGs) a un conjunto de componentes principales que capturan la varianza más relevante. Sobre estos componentes se ajusta una regresión elastic net, que combina regularización L1 y L2 para seleccionar características y evitar sobreajuste. Esta arquitectura es estándar en el campo de los relojes epigenéticos, similar a la utilizada en el reloj de Hannum o PhenoAge, pero adaptada específicamente a biomarcadores renales y datos de mortalidad.

El entrenamiento se realizó con datos de metilación de sangre completa de Homo sapiens, utilizando biomarcadores renales como variables objetivo y datos de mortalidad para refinar la predicción. No se especifican el número exacto de muestras ni el detalle del dataset en la información disponible. El modelo devuelve una predicción en escala de edad (años), lo que facilita su interpretación clínica. No se menciona el uso de RLHF, DPO u otras técnicas de alineación, al tratarse de un modelo de regresión supervisada.

## Capacidades
- Predicción de edad biológica renal a partir de datos de metilación de ADN en sangre completa.
- Devolución del resultado en escala de edad (años), interpretable directamente.
- Integración con la librería `pyaging` mediante la función `predict_age`, que permite aplicar el modelo a datos de metilación en formato AnnData.
- Forma parte de un sistema más amplio (Systems Age) que cubre 11 sistemas fisiológicos, permitiendo análisis de heterogeneidad del envejecimiento.
- Entrenado con biomarcadores renales y datos de mortalidad, lo que le confiere capacidad predictiva sobre riesgo de mortalidad asociado al sistema renal.
- No es un modelo de lenguaje: no genera texto, no tiene capacidades de razonamiento, código, visión ni tool calling.

## Casos de uso
- Evaluación de la edad biológica renal en estudios de envejecimiento: los investigadores pueden aplicar el modelo a datos de metilación de sangre para estimar si el sistema renal de un individuo envejece más rápido o más lento que su edad cronológica.
- Medicina preventiva y detección temprana de deterioro renal: el modelo podría utilizarse en análisis de biobancos para identificar individuos con envejecimiento renal acelerado, antes de que aparezcan síntomas clínicos.
- Monitorización de intervenciones de estilo de vida o terapéuticas: al ser un reloj de metilación, puede medir cambios en la edad biológica renal tras intervenciones (dieta, ejercicio, fármacos) en estudios longitudinales.
- Investigación en longevidad y epidemiología: el componente renal de Systems Age permite estudiar la contribución del sistema renal al envejecimiento global y su asociación con mortalidad por todas las causas.
- Validación de biomarcadores renales en sangre: el modelo puede servir como referencia para comparar nuevos biomarcadores de función renal con una medida integrada de envejecimiento epigenético.
- Análisis de heterogeneidad del envejecimiento entre sistemas: combinado con los otros 10 relojes de Systems Age, permite clasificar a los individuos según qué sistema envejece más rápido, orientando intervenciones personalizadas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento como correlación con edad cronológica, error absoluto medio (MAE) o AUC para mortalidad. El artículo asociado (Sehgal et al., 2025, Nature Aging) podría contener dichos datos, pero no se proporcionan en el repositorio.

## Requisitos de hardware
- No se especifican requisitos de hardware en la información disponible.
- Dado que el modelo es una regresión PCA + elastic net (no una red neuronal profunda), su inferencia es computacionalmente ligera. Una vez aplicada la transformación PCA (que requiere los pesos guardados), la predicción es una simple operación matricial.
- El tamaño del repositorio es de 2.0 GB, lo que sugiere que los pesos de la transformación PCA y los coeficientes de regresión ocupan espacio, pero la inferencia puede ejecutarse en CPU sin necesidad de GPU.
- Para procesar un dataset completo de muestras de metilación (cada una con cientos de miles de CpGs), se recomienda un equipo con al menos 16 GB de RAM para manejar los datos en memoria.
- El uso principal es a través de la librería `pyaging` en Python, que depende de `scanpy` y `anndata` para el manejo de datos.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen otros relojes epigenéticos como Horvath (pan-tejido), Hannum (sangre) o PhenoAge, pero no se ofrecen datos de comparación en la model card. Se recomienda consultar el artículo original de Systems Age para una comparativa detallada con estos modelos.

## Limitaciones y advertencias
- Específico para sistema renal: no debe utilizarse para estimar la edad biológica global o de otros sistemas sin integrarlo con los demás componentes de Systems Age.
- Requiere datos de metilación de ADN de sangre completa: no funciona con otros tejidos ni con datos de expresión génica.
- La precisión depende de la calidad de los datos de metilación y de la plataforma utilizada (arrays de Illumina, por ejemplo); no se especifican requisitos de normalización o preprocesado en la model card.
- Al ser un modelo estadístico entrenado con datos poblacionales, puede presentar sesgos si se aplica a poblaciones no representadas en el entrenamiento (no se detalla la composición étnica o geográfica del dataset).
- Riesgo de sobreinterpretación: la "edad biológica renal" es una estimación correlacional, no una medida causal de la función renal. No debe usarse como diagnóstico clínico sin validación adicional.
- La licencia BSD-3-Clause permite uso comercial, pero exige mantener el aviso de copyright y no utilizar los nombres de los autores para promocionar productos derivados sin permiso.
- No hay garantías de soporte técnico ni mantenimiento del modelo; depende del proyecto pyaging.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/pyaging/systemsagekidney
- Documentación de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
- Artículo original: Sehgal, R., Markov, Y., Qin, C., et al. (2025). Systems Age: a single blood methylation test to quantify aging heterogeneity across 11 physiological systems. Nature Aging, 5, 1880–1896. https://doi.org/10.1038/s43587-025-00958-3
