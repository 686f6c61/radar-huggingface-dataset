# pyaging/systemsageliver

## Resumen

systemsageliver es un reloj epigenético desarrollado por el equipo de pyaging que estima la edad biológica del sistema hepático a partir de metilación de ADN en sangre completa. Forma parte del proyecto Systems Age, descrito en el artículo publicado en *Nature Aging* (Sehgal et al., 2025), que propone una única prueba de metilación sanguínea para cuantificar la heterogeneidad del envejecimiento en once sistemas fisiológicos. El modelo utiliza una combinación de análisis de componentes principales (PCA) y regresión elastic net, y devuelve una puntuación en una escala similar a la edad cronológica, expresada en años.

A diferencia de los modelos generativos de lenguaje, este no procesa texto, sino que trabaja sobre perfiles de metilación de CpG específicos. Su relevancia actual reside en la creciente demanda de biomarcadores de envejecimiento precisos y accesibles para investigación biomédica, medicina preventiva y estudios longitudinales de salud. El repositorio en Hugging Face contiene los pesos del modelo entrenado, con un tamaño de 2,0 GB, y está integrado en la librería pyaging para su uso directo en pipelines de análisis de datos ómicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PCA + elastic net regression |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de texto) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica (entrada biologica, no linguistica) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (repositorio de 2,0 GB, formato no especificado) |

## Arquitectura y entrenamiento

El modelo se basa en una pipeline de dos etapas: primero se aplica PCA sobre las medidas de metilación de ADN de sitios CpG seleccionados en sangre completa, reduciendo la dimensionalidad del espacio de características. Posteriormente, se ajusta una regresión elastic net sobre los componentes principales resultantes para predecir la edad biológica del sistema hepático. Esta combinación es habitual en relojes epigenéticos porque permite manejar la alta colinealidad de los datos de metilación y seleccionar características relevantes de forma regularizada.

El entrenamiento se realizó con datos de metilación de sangre completa de cohortes humanas, utilizando biomarcadores hepáticos y datos de mortalidad como variables objetivo para calibrar la puntuación en una escala de edad. Los detalles específicos del conjunto de datos, el número de CpGs utilizados y los hiperparámetros del elastic net no se detallan en la información disponible. El modelo fue publicado en 2025 y se distribuye bajo licencia BSD-3-Clause, lo que permite uso comercial y modificación con atribución.

## Capacidades

- Predicción de la edad biológica del sistema hepático a partir de perfiles de metilación de ADN en sangre completa.
- Salida en una escala de años, interpretable como desviación respecto a la edad cronológica.
- Integración con la librería pyaging mediante la función `predict_age`, que acepta objetos AnnData.
- Diseñado para su uso en análisis de envejecimiento multi-sistema, formando parte del conjunto Systems Age con otros relojes para diferentes sistemas fisiológicos.
- No tiene capacidades de generación de texto, razonamiento, código ni visión; su dominio es exclusivamente la epigenética.

## Casos de uso

- Investigación en envejecimiento: permite cuantificar la edad biológica hepática en estudios de cohortes para asociar el envejecimiento de este órgano con enfermedades crónicas como cirrosis, esteatosis o cáncer hepático. El investigador puede aplicar el modelo sobre datos de metilación ya disponibles y obtener una variable numérica continua para análisis de supervivencia o regresión.
- Medicina preventiva y de precisión: en clínicas que ya realizan perfiles de metilación, el reloj puede ofrecer una métrica adicional de riesgo hepático, complementando biomarcadores tradicionales como transaminasas o elastografía. La salida en años facilita la comunicación con pacientes.
- Estudios longitudinales de salud: al ser un modelo no invasivo basado en sangre, puede aplicarse en múltiples puntos temporales para monitorizar la evolución de la edad biológica hepática y evaluar el efecto de intervenciones (dieta, ejercicio, fármacos) sobre el envejecimiento del órgano.
- Validación de biomarcadores farmacológicos: en ensayos clínicos de fármacos hepatoprotectores, el reloj puede servir como endpoint secundario para medir cambios en la edad biológica hepática antes y después del tratamiento.
- Análisis de heterogeneidad del envejecimiento: al combinarse con otros relojes de Systems Age, permite identificar individuos con envejecimiento acelerado o retardado específicamente en el sistema hepático, lo que es útil para estudios de envejecimiento diferencial entre órganos.
- Desarrollo de herramientas de salud pública: el modelo puede integrarse en pipelines de análisis de grandes biobancos (p. ej., UK Biobank) para generar fenotipos de envejecimiento hepático a escala poblacional y estudiar sus determinantes genéticos y ambientales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo original (Sehgal et al., 2025) en *Nature Aging* reporta métricas de validación, pero no se incluyen en la model card ni en los metadatos del repositorio.

## Requisitos de hardware

- No requiere GPU: el modelo es una regresión lineal sobre componentes principales, por lo que la inferencia es computacionalmente ligera.
- Memoria RAM: suficiente para cargar los pesos del modelo (2,0 GB) y los datos de metilación. Para un array de metilación típico (450K o EPIC), se recomiendan al menos 8 GB de RAM.
- CPU: cualquier procesador moderno es suficiente; el tiempo de predicción es del orden de milisegundos por muestra una vez cargado el modelo.
- Despliegue: el uso principal es mediante la librería pyaging en Python, que depende de numpy, pandas y scikit-learn. No se han documentado opciones de despliegue como vLLM u Ollama, ya que no es un modelo de lenguaje.
- Almacenamiento: 2,0 GB para los pesos, más espacio para los datos de entrada.

## Comparativa con modelos similares

Existen otros relojes epigenéticos ampliamente utilizados, como el reloj de Horvath (pan-tejido), PhenoAge o GrimAge, que también predicen edad biológica a partir de metilación. Sin embargo, la información disponible no incluye datos comparativos de rendimiento, parámetros o licencias de estos modelos. Por tanto, no se puede realizar una comparación cuantitativa rigurosa. Se recomienda consultar el catálogo de relojes de pyaging para obtener una lista actualizada de alternativas y sus especificaciones.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para tejido de sangre completa en *Homo sapiens*; su aplicación a otros tejidos o especies no está validada.
- No se especifican las cohortes de entrenamiento ni su diversidad poblacional, por lo que puede existir sesgo hacia ciertos grupos étnicos o rangos de edad. Es necesario validar en la población de interés antes de uso clínico.
- La metilación de ADN se ve afectada por factores técnicos (lote, plataforma de arrays) y biológicos (composición celular de la sangre), lo que puede introducir ruido en las predicciones si no se corrigen adecuadamente.
- La licencia BSD-3-Clause permite uso comercial, pero el modelo no es un dispositivo médico aprobado; su uso en diagnóstico requiere validación regulatoria adicional.
- Al ser un modelo de regresión lineal, no captura interacciones no lineales entre CpGs; su precisión puede ser inferior a métodos basados en redes neuronales en ciertos contextos.
- No hay información sobre la incertidumbre de las predicciones; el modelo devuelve un valor puntual sin intervalos de confianza.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pyaging/systemsageliver
- Documentación de pyaging (catálogo de relojes): https://pyaging.readthedocs.io
- Artículo original: Sehgal, R., Markov, Y., Qin, C., et al. (2025). Systems Age: a single blood methylation test to quantify aging heterogeneity across 11 physiological systems. *Nature Aging*, 5, 1880–1896. DOI: https://doi.org/10.1038/s43587-025-00958-3
