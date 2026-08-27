# Dee-ui/ieee-cis-fraud-detector

## Resumen

El modelo `Dee-ui/ieee-cis-fraud-detector` es un clasificador tabular basado en LightGBM desarrollado por Dee-ui para la detección de fraude en transacciones con tarjeta. Está entrenado sobre el dataset IEEE-CIS Fraud Detection, una competición de Kaggle que combina datos de transacciones reales con información de identidad de clientes. El modelo resuelve el problema de asignar una puntuación de riesgo de fraude a cada transacción, permitiendo priorizar revisiones manuales en entornos con capacidad limitada.

El repositorio incluye un transformador de características (`feature_engineer.joblib`) que convierte una transacción cruda en 284 features, el modelo entrenado (`final_model.joblib`) y un archivo de metadatos con la lista de features, el umbral de decisión y las métricas de rendimiento. El modelo alcanza una PR-AUC de 0.6068 en un período de validación temporal posterior al entrenamiento, con un umbral operativo de 0.4222 elegido mediante un modelo de coste. Su relevancia radica en ser un ejemplo práctico de aplicación de boosting de gradiente a un problema financiero real, con un pipeline reproducible y documentación clara sobre limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (Gradient Boosting Machine sobre árboles de decisión) |
| Parametros totales | no disponible (número de árboles y profundidad no especificados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no procesa secuencias) |
| Tipos de cuantizacion | no aplica (modelo clásico, no requiere cuantización) |
| Idiomas soportados | no disponible (modelo para datos numéricos, no texto) |
| Licencia | MIT |
| Formato de pesos | joblib (archivos `.joblib` para Python) |

## Arquitectura y entrenamiento

El modelo es un clasificador LightGBM, una implementación eficiente de gradient boosting que construye árboles de decisión de forma secuencial, optimizando una función de pérdida mediante descenso de gradiente. A diferencia de los transformers, no utiliza atención ni capas neuronales profundas; se entrena directamente sobre características tabulares numéricas y categóricas codificadas. El pipeline incluye un transformador de características que genera 284 features a partir de la transacción cruda, incluyendo agregaciones temporales, codificaciones de tarjetas y variables de identidad.

El entrenamiento se realizó sobre el dataset IEEE-CIS Fraud Detection, que contiene transacciones de 2017 a 2018. No se especifican hiperparámetros exactos ni el número de árboles. No se aplicaron técnicas de RLHF o DPO, ya que es un modelo supervisado clásico. La innovación principal reside en el diseño de características y en la selección del umbral de decisión mediante un modelo de coste que considera una capacidad de revisión manual del 2%, en lugar de usar el umbral por defecto de 0.5.

## Capacidades

- Clasificación binaria de transacciones como fraude o no fraude, devolviendo una probabilidad de riesgo.
- Generación de 284 features automáticamente a partir de una transacción cruda mediante el transformador incluido.
- Puntuación de riesgo en tiempo real para transacciones individuales, adecuada para sistemas de decisión en línea.
- Integración sencilla en pipelines Python existentes mediante `joblib` y `huggingface_hub`.
- No soporta generación de texto, razonamiento, código, visión ni tool calling; es un modelo especializado en datos tabulares.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.

## Casos de uso

- **Detección de fraude en tiempo real**: el modelo puede puntuar cada transacción entrante en milisegundos, permitiendo bloquear o marcar operaciones sospechosas antes de su aprobación. Su baja latencia lo hace apto para sistemas de pago en línea.
- **Priorización de revisiones manuales**: con un umbral ajustado a una capacidad de revisión del 2%, el modelo selecciona las transacciones más probables de ser fraude para que un analista las revise, optimizando el uso de recursos humanos.
- **Análisis de riesgo en carteras de tarjetas**: las puntuaciones pueden agregarse por tarjeta o cliente para identificar cuentas de alto riesgo y aplicar medidas preventivas como límites de gasto o verificación adicional.
- **Monitorización de patrones de fraude**: al ser un modelo entrenado con datos históricos, puede utilizarse para comparar la evolución de las puntuaciones a lo largo del tiempo y detectar cambios en las tácticas de los defraudadores.
- **Investigación académica y prototipado**: el repositorio sirve como referencia para implementar un pipeline completo de detección de fraude con LightGBM, incluyendo ingeniería de características y selección de umbral basada en costes.
- **Integración en sistemas de scoring crediticio**: aunque el modelo está diseñado para fraude, su arquitectura tabular puede adaptarse a otros problemas de clasificación binaria con características similares, como la predicción de impago.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas, medidas en un período de validación estrictamente posterior al entrenamiento (2018-04-20 a 2018-05-31):

| Metrica | Baseline | Este modelo |
|---|---|---|
| PR-AUC | 0.0344 | 0.6068 |
| PR-AUC (validación cruzada) | - | 0.6334 |

El umbral operativo es 0.4222, elegido mediante un modelo de coste con una capacidad de revisión manual del 2%. No se han publicado resultados en otros benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no está diseñado para tareas de lenguaje o razonamiento general.

## Requisitos de hardware

- Al ser un modelo LightGBM, la inferencia es extremadamente ligera y puede ejecutarse en CPU sin necesidad de GPU.
- La memoria RAM necesaria es mínima; los archivos `.joblib` ocupan menos de 100 MB (el tamaño del repositorio es 0.0 GB, aunque esto puede ser una aproximación).
- Cualquier máquina con Python 3.6+ y las librerías `joblib`, `pandas` y `lightgbm` puede ejecutar el modelo.
- No requiere VRAM ni GPUs específicas; es adecuado para despliegue en servidores de baja especificación o incluso en dispositivos edge.
- Opciones de despliegue: integración directa en aplicaciones Python, exportación a formato PMML o ONNX para otros entornos, o uso en servicios serverless como AWS Lambda o Google Cloud Functions.
- La latencia estimada es del orden de microsegundos por transacción en CPU moderna, y el throughput puede alcanzar miles de transacciones por segundo en un solo núcleo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor no incluye comparaciones con otras implementaciones de detección de fraude sobre el mismo dataset. Se recomienda consultar la competición de Kaggle IEEE-CIS Fraud Detection para ver soluciones alternativas, pero no se pueden citar datos concretos sin fuentes verificadas.

## Limitaciones y advertencias

- **Cobertura limitada por valor**: el modelo captura aproximadamente el 44.6% de los fraudes por número de transacciones, pero solo el 31.2% por valor monetario. Los fraudes no detectados tienen un importe medio mayor ($186) que los detectados ($105), lo que implica que las pérdidas económicas no se reducen proporcionalmente a la tasa de detección.
- **Dependencia de características de identidad**: alrededor del 10% del peso de decisión se basa en features derivadas de una huella de cliente que no está disponible en aproximadamente el 82% de las transacciones del período de prueba posterior. Esto puede degradar el rendimiento en datos fuera de la ventana temporal de entrenamiento.
- **Obsolescencia de los datos**: el modelo fue entrenado con transacciones de 2017-2018. Los patrones de fraude evolucionan rápidamente, por lo que su rendimiento en datos actuales puede ser significativamente menor sin reentrenamiento periódico.
- **Sesgo potencial**: al ser un modelo entrenado con datos históricos, puede heredar sesgos presentes en el dataset, como la sobrerrepresentación de ciertos tipos de tarjetas o regiones geográficas.
- **Riesgo de alucinación**: no aplica, ya que no es un modelo generativo; sin embargo, puede producir falsos positivos o negativos en la clasificación, lo que debe gestionarse mediante el umbral y la revisión manual.
- **Restricciones de licencia**: la licencia MIT permite uso comercial sin restricciones, pero el dataset original de IEEE-CIS puede tener sus propios términos de uso que deben verificarse antes de su explotación comercial.

## Enlaces

- [HuggingFace - Dee-ui/ieee-cis-fraud-detector](https://huggingface.co/Dee-ui/ieee-cis-fraud-detector)
- [GitHub - Dee-ui/ieee-cis-fraud-detection](https://github.com/Dee-ui/ieee-cis-fraud-detection)
- [Kaggle - IEEE-CIS Fraud Detection](https://www.kaggle.com/c/ieee-fraud-detection)
