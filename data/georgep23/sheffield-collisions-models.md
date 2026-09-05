# georgep23/sheffield-collisions-models

## Resumen

El modelo `georgep23/sheffield-collisions-models` es un conjunto de artefactos de modelos de aprendizaje automático tabular desarrollados por George Pedder (georgep23) para el proyecto Traffic-AI. El objetivo de estos modelos es analizar los registros de colisiones de tráfico en Sheffield (Reino Unido) utilizando datos STATS19 del Departamento de Transporte del Reino Unido. Incluye clasificadores binarios y multiclase, regresores y modelos de clustering, todos serializados en formato pickle, junto con un archivo `models.json` que actúa como registro para que la CLI del proyecto descubra los modelos disponibles.

A diferencia de los modelos de lenguaje, estos modelos están pensados para tareas de clasificación tabular, regresión y agrupamiento dentro de un pipeline multi-tarea. El repositorio tiene un tamaño de 4,5 GB y se distribuye bajo licencia MIT. No hay documentación sobre métricas de rendimiento, ni sobre el número de parámetros o las arquitecturas específicas de cada modelo. La relevancia del proyecto radica en su aplicación a la seguridad vial urbana, usando datos abiertos del gobierno británico, aunque el propio autor describe los modelos como educativos y exploratorios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos clásicos de scikit-learn y XGBoost (clasificación, regresión y clustering) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (modelo tabular) |
| Licencia | MIT |
| Formato de pesos | pickle (serialización de scikit-learn/XGBoost) |
| Tamaño del repositorio | 4,5 GB |

## Arquitectura y entrenamiento

Los modelos incluidos en este repositorio son artefactos de una pipeline de aprendizaje automático multi-tarea. La arquitectura no se detalla en la documentación disponible, pero por las etiquetas y la naturaleza del proyecto se puede deducir que se basan en algoritmos de scikit-learn (como RandomForest, LogisticRegression, KMeans) y XGBoost, aplicados sobre datos tabulares. El entrenamiento se realiza con registros de colisiones STATS19 del Departamento de Transporte del Reino Unido, filtrados específicamente para Sheffield. No se especifica el número de muestras, el conjunto de características ni si se aplicaron técnicas de ajuste de hiperparámetros.

No se menciona ninguna innovación técnica destacable, salvo la existencia de un registro `models.json` que permite a la CLI del proyecto descubrir dinámicamente los modelos entrenados. Los modelos se guardan con `pickle`, lo que facilita su carga en Python, aunque presenta riesgos de seguridad si se cargan archivos de fuentes no confiables. El autor indica que los modelos son educativos y exploratorios, y que los datos subyacentes proceden de estadísticas de víctimas de accidentes de tráfico del DfT, publicadas bajo la Open Government Licence v3.0.

## Capacidades

- Clasificación binaria y multiclase para predecir categorías asociadas a colisiones de tráfico, como la severidad del accidente o el tipo de vehículo implicado.
- Regresión para estimar variables continuas, como el número de heridos o la gravedad en una escala numérica.
- Clustering para identificar patrones geográficos o temporales de colisiones, lo que permite agrupar incidentes con características similares.
- Integración con una CLI (Traffic-AI) mediante el archivo `models.json`, que facilita la selección y ejecución de modelos sin modificar el código.
- Compatibilidad con Python y bibliotecas estándar de ciencia de datos (scikit-learn, XGBoost) para su carga y uso directo.
- No incluye capacidades de texto, tool calling, agentes ni soporte multilingüe, al tratarse de modelos estrictamente tabulares.

## Casos de uso

- Análisis de seguridad vial urbana: los clasificadores pueden utilizarse para predecir la severidad de futuros accidentes en Sheffield, ayudando a las autoridades locales a priorizar intervenciones en intersecciones o tramos de carretera de alto riesgo.
- Planificación de campañas de concienciación: mediante los resultados de clustering, se pueden identificar zonas o franjas horarias con concentración de colisiones, lo que permite diseñar campañas de seguridad específicas.
- Estimación de recursos de emergencia: los regresores pueden estimar el número esperado de heridos o víctimas en un incidente, lo que sería útil para dimensionar recursos médicos y de rescate.
- Investigación académica: el conjunto de modelos sirve como base para estudios comparativos de técnicas de clasificación y regresión sobre datos de accidentes de tráfico en el Reino Unido.
- Desarrollo de sistemas de apoyo a la decisión: el registro `models.json` permite integrar estos modelos en un sistema de software que recomiende medidas de mitigación basadas en los patrones detectados.
- Auditoría de datos históricos: los modelos de clustering pueden usarse para revisar los registros STATS19 existentes y detectar anomalías o agrupaciones no evidentes, mejorando la comprensión de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser modelos clásicos de scikit-learn y XGBoost, no se requieren GPUs para la inferencia; el uso en CPU es suficiente.
- El repositorio completo ocupa 4,5 GB, por lo que se necesita espacio en disco equivalente para almacenar los artefactos.
- No se dispone de datos sobre VRAM, latencia ni throughput, ya que no son modelos de lenguaje ni redes neuronales profundas.
- Se pueden cargar directamente en Python mediante `pickle`, o integrarse en entornos como Jupyter, Airflow o servicios REST ligeros.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Los modelos son educativos y exploratorios; no están optimizados para producción y carecen de documentación sobre métricas de evaluación.
- Solo están entrenados con datos de Sheffield, por lo que no son generalizables a otras regiones o países.
- Dependen de la calidad, integridad y actualidad de los registros STATS19 del Departamento de Transporte del Reino Unido.
- Pueden existir sesgos inherentes a los datos de colisiones, como el subregistro de accidentes leves o la falta de datos de ciertas zonas.
- El formato `pickle` es riesgoso si se cargan archivos de fuentes no confiables, ya que puede ejecutar código arbitrario.
- La licencia MIT del repositorio no se aplica a los datos subyacentes, que están bajo la Open Government Licence v3.0; es necesario revisar la compatibilidad y las condiciones de uso de los datos.
- No se han publicado indicadores de rendimiento ni comparativas, lo que limita su uso en entornos donde se requiera justificar la elección del modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/georgep23/sheffield-collisions-models
- Proyecto Traffic-AI en GitHub: https://github.com/georgp23/Traffic-AI
- Perfil del autor en HuggingFace: https://huggingface.co/georgep23
- Licencia de datos del Departamento de Transporte (Open Government Licence v3.0): https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
