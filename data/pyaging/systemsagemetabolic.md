# pyaging/systemsagemetabolic

## Resumen

`systemsagemetabolic` es un componente del sistema *Systems Age*, un conjunto de relojes epigenéticos desarrollado por el grupo de investigación de Sehgal, Markov, Qin y colaboradores (2025) para cuantificar la heterogeneidad del envejecimiento a través de 11 sistemas fisiológicos. Este modelo concreto se centra en el sistema metabólico y estima la edad biológica metabólica a partir de patrones de metilación de ADN en sangre completa. A diferencia de los modelos generativos de lenguaje, no produce texto, sino una puntuación en una escala similar a la edad cronológica, basada en biomarcadores metabólicos y entrenada con datos de mortalidad.

El modelo emplea una arquitectura de regresión PCA (análisis de componentes principales) combinada con regresión *elastic net*, una técnica estadística clásica para datos de alta dimensionalidad. Está diseñado para integrarse en el ecosistema `pyaging`, una librería Python especializada en relojes de envejecimiento, y se distribuye bajo licencia BSD-3-Clause. Su relevancia actual radica en la creciente demanda de herramientas de evaluación del envejecimiento biológico en investigación biomédica, especialmente en estudios de longevidad y medicina preventiva.

El repositorio en Hugging Face tiene un tamaño de 2.0 GB, lo que sugiere que incluye pesos y posiblemente datos auxiliares, aunque no se especifica el número exacto de parámetros del modelo. La model card no detalla la arquitectura interna más allá de la técnica de regresión, ni proporciona información sobre el número de características de metilación utilizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PCA + regresión elastic net |
| Parametros totales | no disponible (repo de 2.0 GB, sin desglose) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de regresión sobre metilación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (entrada: datos de metilación de ADN) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no especificado (probablemente archivos binarios o matrices, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo se basa en una pipeline de dos etapas: primero se aplica un análisis de componentes principales (PCA) para reducir la dimensionalidad de las señales de metilación de ADN (típicamente cientos de miles de CpG sites), y posteriormente se entrena una regresión elastic net sobre los componentes principales resultantes. Esta combinación es común en la construcción de relojes epigenéticos porque permite manejar la alta colinealidad y el gran número de predictores.

El entrenamiento se realizó sobre datos de metilación de sangre completa de humanos (*Homo sapiens*), con un objetivo doble: predecir biomarcadores metabólicos y ajustar el modelo para que sus predicciones se correlacionen con la mortalidad. El resultado es una puntuación en una escala similar a la edad cronológica, interpretable como "edad biológica metabólica". No se menciona el número de muestras ni de CpG utilizados, ni si se emplearon técnicas de regularización adicionales o validación cruzada. La publicación original (Sehgal et al., 2025, *Nature Aging*) es la referencia principal para detalles metodológicos.

## Capacidades

- Predicción de edad biológica metabólica a partir de datos de metilación de ADN de sangre completa.
- Integración con la librería `pyaging` para su uso directo en pipelines de análisis epigenético.
- Escala de salida en unidades de años, comparable a la edad cronológica.
- Componente de un sistema más amplio (Systems Age) que cubre 11 sistemas fisiológicos, permitiendo análisis de heterogeneidad del envejecimiento.
- Entrenado con datos de mortalidad, lo que le confiere relevancia pronóstica (aunque no se detallan las métricas de rendimiento).
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales.

## Casos de uso

- **Investigación en envejecimiento**: los investigadores pueden usar `systemsagemetabolic` para estimar la edad biológica metabólica en cohortes de estudio y correlacionarla con otros marcadores de salud o enfermedades metabólicas (diabetes, obesidad, dislipidemia).
- **Estudios longitudinales de longevidad**: en estudios que siguen a individuos durante años, este reloj puede servir como variable dependiente para evaluar el efecto de intervenciones (dieta, ejercicio, fármacos) sobre el envejecimiento metabólico.
- **Medicina preventiva**: clínicas de salud preventiva podrían integrar este modelo en paneles de análisis de metilación para ofrecer a pacientes una estimación de su edad metabólica y orientar cambios de estilo de vida.
- **Validación de biomarcadores**: empresas biotecnológicas que desarrollan terapias antienvejecimiento pueden usar este reloj como endpoint en ensayos preclínicos o clínicos para medir cambios en la edad metabólica.
- **Análisis de heterogeneidad del envejecimiento**: al ser parte de Systems Age, permite comparar el envejecimiento metabólico con el de otros sistemas (inmune, cardiovascular, etc.) en un mismo individuo, identificando sistemas que envejecen más rápido.
- **Reanálisis de datos públicos**: con acceso a conjuntos de datos de metilación (GEO, TCGA), los bioinformáticos pueden aplicar este modelo para generar nuevas hipótesis sobre la relación entre metilación y metabolismo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como correlación con edad cronológica, error absoluto medio (MAE) ni AUC para mortalidad. La publicación original en *Nature Aging* (DOI: 10.1038/s43587-025-00958-3) debería contener dichos datos, pero no están accesibles desde el repositorio.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Al ser un modelo de regresión (PCA + elastic net), la inferencia es computacionalmente ligera y puede ejecutarse en CPU.
- **GPU recomendadas**: no se requiere GPU; una CPU moderna es suficiente para la mayoría de los casos.
- **Compatibilidad con consumer GPU**: no aplicable.
- **Opciones de despliegue**: el modelo se usa mediante la librería `pyaging` en Python. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles, pero se espera que la predicción sea casi instantánea para una muestra individual (los datos de metilación se procesan como matriz de características).

## Comparativa con modelos similares

No hay información suficiente para comparar con otros relojes epigenéticos (por ejemplo, Horvath clock, PhenoAge, GrimAge) en términos de parámetros y rendimiento, ya que el repositorio no proporciona métricas comparativas. La publicación original podría incluir comparaciones, pero no están disponibles en la model card.

## Limitaciones y advertencias

- **Especificidad tisular**: el modelo está entrenado exclusivamente con datos de sangre completa; no es válido para otros tejidos sin recalibración.
- **Dependencia de la plataforma de metilación**: los datos de entrada deben ser compatibles con el formato de características utilizado durante el entrenamiento (no especificado, probablemente arrays Illumina 450K o EPIC).
- **Interpretación clínica**: la edad biológica metabólica es una estimación estadística, no un diagnóstico. No debe utilizarse como única herramienta para decisiones médicas.
- **Sesgos poblacionales**: no se indica la diversidad de la cohorte de entrenamiento; es posible que el modelo tenga menor precisión en poblaciones no representadas.
- **Licencia**: BSD-3-Clause permite uso comercial, pero se recomienda revisar los términos de la publicación original para posibles restricciones adicionales.
- **Sin soporte de contexto**: al ser un modelo de regresión, no maneja secuencias de texto ni conversaciones; su entrada es una matriz de valores de metilación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pyaging/systemsagemetabolic
- Documentación de pyaging (catálogo de relojes): https://pyaging.readthedocs.io
- Publicación original: Sehgal, R., Markov, Y., Qin, C., et al. (2025). Systems Age: a single blood methylation test to quantify aging heterogeneity across 11 physiological systems. *Nature Aging*, 5, 1880–1896. DOI: https://doi.org/10.1038/s43587-025-00958-3
