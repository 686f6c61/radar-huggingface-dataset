# pyaging/stocz

## Resumen

`stocz` es un reloj epigenético de edad cronológica desarrollado por el grupo de pyaging, presentado en 2024 como parte del trabajo de Tong et al. sobre el componente estocástico del envejecimiento epigenético. A diferencia de los relojes de metilación clásicos (como Horvath o Zhang), `stocz` se construye a partir de trayectorias de metilación simuladas en los CpG del reloj de Zhang, lo que lo convierte en una contraparte estocástica de dicho reloj, no en una réplica exacta.

El modelo predice la edad cronológica en Homo sapiens a partir de datos de metilación de ADN en monocitos clasificados, utilizando regresión elastic net. Está diseñado para integrarse en el ecosistema `pyaging`, una librería Python especializada en relojes de envejecimiento. Su relevancia radica en que permite cuantificar la variabilidad estocástica en la estimación de la edad epigenética, un aspecto clave para entender los límites de precisión de estos biomarcadores.

Se distribuye bajo licencia BSD-3-Clause y su repositorio en HuggingFace apenas contiene metadatos y una breve documentación de uso, sin pesos publicados ni información adicional sobre entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Elastic net regression |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (no es modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (no se publican pesos en el repositorio) |

## Arquitectura y entrenamiento

El modelo se basa en regresión elastic net, una técnica de regularización lineal que combina penalizaciones L1 y L2. Se entrena sobre simulaciones de trayectorias de metilación en los sitios CpG definidos por el reloj de Zhang, con el objetivo de modelar la componente estocástica del envejecimiento epigenético. Los detalles exactos del procedimiento de simulación, el número de muestras o la configuración de hiperparámetros no se especifican en la información disponible.

No se trata de un modelo de transformadores ni de un sistema de aprendizaje profundo; es un modelo estadístico clásico aplicado a datos de metilación de ADN. Su innovación conceptual reside en la generación de trayectorias simuladas para estimar la incertidumbre asociada a la predicción de edad, más que en una nueva arquitectura de aprendizaje automático.

## Capacidades

- Predicción de edad cronológica en humanos a partir de perfiles de metilación de ADN.
- Específico para tejido de monocitos clasificados (sorted monocytes).
- Integración directa con la librería `pyaging` mediante la función `pya.pred.predict_age`.
- Estimación de la variabilidad estocástica en la edad epigenética, útil para estudios de fiabilidad de relojes de envejecimiento.
- No soporta generación de texto, razonamiento, código, visión, tool calling ni otras capacidades propias de modelos de lenguaje.

## Casos de uso

- Investigación en biología del envejecimiento: permite estudiar la precisión y reproducibilidad de los relojes epigenéticos al comparar predicciones deterministas (Zhang) con su contraparte estocástica (`stocz`).
- Validación de biomarcadores de edad: útil para evaluar cuánta variabilidad aleatoria afecta a las estimaciones de edad en cohortes de monocitos.
- Análisis de datos de metilación en laboratorios de genómica: se integra en pipelines de `pyaging` para procesar matrices de metilación y obtener edades predichas junto con otros relojes.
- Docencia y divulgación en epigenética: sirve como ejemplo de aplicación de regresión regularizada a datos biológicos de alta dimensionalidad.
- Control de calidad en estudios longitudinales: ayuda a identificar muestras con señales de metilación anómalas mediante comparación de edades predichas por distintos relojes.
- Desarrollo de nuevos relojes: el enfoque de simulación de trayectorias puede servir como plantilla metodológica para construir relojes estocásticos en otros tejidos o especies.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas de error (MAE, correlación, etc.) ni comparaciones con otros relojes en el repositorio de HuggingFace.

## Requisitos de hardware

- Al ser un modelo de regresión lineal sobre datos de metilación, la inferencia es extremadamente ligera: se realiza sobre matrices de metilación (típicamente de miles a cientos de miles de CpG por muestra) y no requiere GPU.
- Ejecutable en cualquier CPU moderna; el consumo de memoria depende del tamaño de la matriz de entrada, no del modelo en sí.
- Despliegue mediante la librería `pyaging` en entornos Python estándar (pip install pyaging).
- No aplican opciones como vLLM, llama.cpp u Ollama, propias de modelos generativos.

## Comparativa con modelos similares

| Modelo | Tipo | Especie | Tejido | Año | Licencia |
|---|---|---|---|---|---|
| stocz | Elastic net (estocástico) | Homo sapiens | Monocitos | 2024 | BSD-3-Clause |
| Zhang clock | Elastic net (determinista) | Homo sapiens | Múltiples | 2019 | no disponible |
| Horvath clock | Elastic net (determinista) | Homo sapiens | Múltiples | 2013 | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a características cualitativas.

## Limitaciones y advertencias

- Modelo específico para monocitos clasificados; su aplicación a otros tejidos puede producir sesgos significativos.
- Construido a partir de simulaciones, por lo que su calibración depende de la calidad de las trayectorias simuladas y puede no reflejar completamente la variabilidad biológica real.
- No se publican los pesos del modelo en el repositorio de HuggingFace; solo se ofrece la integración vía `pyaging`, lo que limita la reproducibilidad independiente.
- No es un modelo de lenguaje ni de propósito general; no debe utilizarse fuera del ámbito de la metilación de ADN.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda revisar la publicación original para conocer restricciones de atribución.
- Sin datos sobre sesgos poblacionales: no se indica si el entrenamiento incluye diversidad étnica o de edad, por lo que su precisión en poblaciones no representadas es desconocida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pyaging/stocz
- Publicación original: Tong, Huige, et al. "Quantifying the stochastic component of epigenetic aging." Nature Aging 4 (2024): 886–901. DOI: https://doi.org/10.1038/s43587-024-00600-8
- Documentación de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
