# pyaging/stoch

## Resumen

`stoch` es un reloj epigenético estocástico desarrollado por el equipo de pyaging, una librería de código abierto para el análisis de relojes de envejecimiento. A diferencia de los modelos de lenguaje, este modelo es una regresión de red elástica (elastic net) que predice la edad cronológica de un individuo a partir de datos de metilación de ADN en los sitios CpG del conocido reloj de Horvath. Se trata de una contraparte estocástica del reloj original de Horvath, construida a partir de trayectorias de metilación simuladas, y no una réplica exacta del mismo.

El modelo está diseñado específicamente para muestras de monocitos humanos (sorted monocytes) y se distribuye bajo licencia BSD-3-Clause. Su relevancia radica en que permite cuantificar el componente estocástico del envejecimiento epigenético, una línea de investigación activa en biología del envejecimiento. Al ser un modelo lineal regularizado, es extremadamente ligero y puede ejecutarse en CPU sin necesidad de GPU, lo que lo hace accesible para laboratorios con recursos limitados. El repositorio en Hugging Face no contiene pesos descargables, ya que el modelo está integrado en la propia librería `pyaging`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión elastic net (combinación de regularización L1 y L2) |
| Parametros totales | No disponible (modelo de regresión, no red neuronal; número de coeficientes no publicado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no procesa lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | No disponible (integrado en la librería pyaging) |

## Arquitectura y entrenamiento

`stoch` utiliza una regresión elastic net, un modelo lineal que combina las penalizaciones L1 (lasso) y L2 (ridge) para seleccionar características y regularizar los coeficientes. Según la model card, el modelo se construyó a partir de trayectorias de metilación simuladas en los sitios CpG del reloj de Horvath, lo que le confiere su carácter estocástico. No se dispone de información detallada sobre el número de muestras simuladas, el proceso de simulación o si se aplicaron técnicas adicionales como validación cruzada. El trabajo subyacente se describe en la publicación de Tong et al. (2024) en *Nature Aging*, titulada "Quantifying the stochastic component of epigenetic aging", que aborda la separación del envejecimiento epigenético en componentes deterministas y estocásticos.

## Capacidades

- Predicción de edad cronológica a partir de datos de metilación de ADN en sitios CpG específicos.
- Especializado en muestras de monocitos humanos (sorted monocytes).
- Modelo estocástico que captura la variabilidad en las trayectorias de metilación, a diferencia de relojes deterministas.
- Integración sencilla con la librería `pyaging` mediante la función `pya.pred.predict_age(adata, ["stoch"])`.
- No posee capacidades de generación de texto, razonamiento, código, visión ni tool calling, al ser un modelo de regresión biológica.

## Casos de uso

- Investigación en biología del envejecimiento: permite estimar la edad biológica a partir de metilación de ADN en monocitos, facilitando estudios sobre la tasa de envejecimiento y su componente estocástico.
- Estudios longitudinales de envejecimiento: al ser un reloj estocástico, puede emplearse para analizar la variabilidad interindividual en el proceso de envejecimiento epigenético.
- Validación de biomarcadores epigenéticos: sirve como herramienta de referencia para comparar con otros relojes (Horvath, Hannum, etc.) y evaluar la contribución estocástica en cohortes específicas.
- Análisis de datos de metilación en laboratorios sin acceso a GPU: su bajo coste computacional permite ejecutarlo en entornos de CPU estándar, incluso con grandes conjuntos de datos.
- Integración en pipelines de análisis bioinformático: gracias a la API de `pyaging`, puede incorporarse fácilmente en flujos de trabajo existentes de procesamiento de datos de metilación (por ejemplo, con `anndata`).
- Educación y formación en relojes epigenéticos: al ser un modelo simple y documentado, resulta útil para enseñar conceptos de regresión regularizada aplicada a datos ómicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento como correlación con la edad, error absoluto medio (MAE) o comparaciones con otros relojes. Se recomienda consultar la publicación original de Tong et al. (2024) para obtener datos de validación.

## Requisitos de hardware

- Al ser un modelo de regresión lineal, no requiere GPU. Puede ejecutarse en cualquier CPU moderna.
- Memoria RAM: mínima, ya que el modelo se reduce a un vector de coeficientes y un intercepto (tamaño del orden de kilobytes).
- No aplica cuantización ni despliegue en servidores de inferencia como vLLM u Ollama.
- El uso principal es a través de la librería `pyaging`, que depende de `anndata` y otras bibliotecas científicas estándar de Python.
- Latencia: despreciable, del orden de milisegundos para predecir la edad de una muestra individual.

## Comparativa con modelos similares

| Modelo | Tipo | Especie | Tejido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stoch (pyaging) | Elastic net estocástico | Humano | Monocitos | BSD-3-Clause | Integrado en pyaging |
| Reloj de Horvath (original) | Regresión penalizada (elastic net) | Humano | Multi-tejido | No especificada (publicación académica) | Código disponible en repositorios académicos |
| Reloj de Hannum | Regresión penalizada (elastic net) | Humano | Sangre | No especificada | Código disponible en repositorios académicos |

La comparativa se limita a relojes epigenéticos clásicos, ya que no hay datos de rendimiento numérico para `stoch` en la información proporcionada. La principal diferencia es que `stoch` es una versión estocástica construida sobre simulaciones, mientras que los relojes de Horvath y Hannum se entrenan con datos reales de metilación.

## Limitaciones y advertencias

- Específico de monocitos humanos: no debe aplicarse a otros tejidos o especies sin recalibración.
- Basado en datos simulados: aunque se valida en el artículo original, su rendimiento en cohortes reales puede variar.
- No es un modelo de lenguaje: no procesa texto ni admite entradas lingüísticas.
- Sin información sobre sesgos demográficos (edad, sexo, etnia) en la información disponible; se recomienda revisar la publicación original para conocer las poblaciones de validación.
- Licencia BSD-3-Clause permite uso comercial, pero es responsabilidad del usuario verificar la conformidad con la publicación original y las restricciones de los datos de entrenamiento.
- No se proporcionan pesos descargables en Hugging Face; el modelo se distribuye únicamente a través de la librería `pyaging`, lo que limita su uso fuera de ese ecosistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pyaging/stoch
- Librería pyaging: https://pyaging.readthedocs.io
- Publicación original: Tong, Huige, et al. "Quantifying the stochastic component of epigenetic aging." Nature Aging 4 (2024): 886–901. DOI: https://doi.org/10.1038/s43587-024-00600-8
