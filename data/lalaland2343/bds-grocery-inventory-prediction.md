# Lalaland2343/bds-grocery-inventory-prediction

## Resumen

El modelo `Lalaland2343/bds-grocery-inventory-prediction` es un clasificador binario tabular basado en Random Forest, desarrollado por Sheila Tay (NIM 2025121038) como proyecto final de la asignatura MN1135 Business Data Science del programa de Management A de la Universitas Universal. Su objetivo es predecir si un SKU de producto de supermercado entrará en situación de rotura de stock (Out of Stock) frente a estados seguros (In Stock, Low Stock o Expiring Soon), a partir de 40 características logísticas derivadas de niveles de inventario, capacidad física, ventas medias y ciclos de reposición.

El modelo no es una red neuronal ni un modelo de lenguaje: es un artefacto de Scikit-Learn 1.6.1 serializado con joblib, que incluye el clasificador, un escalador y la lista de nombres de características. Se distribuye con licencia MIT, está etiquetado para el idioma indonesio (`id`) y su repositorio ocupa 0.0 GB. En el momento de la consulta no registra descargas ni likes, y su uso está acotado a análisis operativos de almacén con características de ciclo de producto similares a las del conjunto de entrenamiento.

La relevancia del modelo es limitada desde el punto de vista técnico: la propia model card documenta que, tras el ajuste de hiperparámetros mediante Grid Search CV, las métricas sobre el conjunto de prueba son Accuracy 1.0000, Precision 0.0000, Recall 0.0000 y F1-Score 0.0000 para la clase positiva. Este resultado refleja una limitación estructural del dataset (0.2 % de positivos) y no un rendimiento predictivo real, por lo que el modelo debe considerarse un ejercicio académico más que una herramienta lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest Classifier (Scikit-Learn 1.6.1) con optimización de hiperparámetros mediante Grid Search CV |
| Parametros totales | no disponible (número de árboles y profundidad no especificados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica (artefacto joblib de Scikit-Learn) |
| Idiomas soportados | indonesio (`id`) |
| Licencia | MIT |
| Formato de pesos | joblib (`model_final.joblib`, `scaler.joblib`, `feature_names.joblib`) |

## Arquitectura y entrenamiento

El modelo es un clasificador de bosque aleatorio (Random Forest) entrenado sobre datos tabulares con 40 características tras aplicar One-Hot Encoding. Entre las variables numéricas principales figuran `Stock_Age_Days`, `Quantity_On_Hand`, `Quantity_Reserved`, `Quantity_Committed`, `Avg_Daily_Sales`, `Days_of_Inventory` y `Total_Inventory_Value_USD`. El pipeline incluye un escalador independiente (`scaler.joblib`) que debe aplicarse antes de la inferencia, y la lista de nombres de características (`feature_names.joblib`) que define el orden de entrada esperado.

El ajuste de hiperparámetros se realizó mediante Grid Search con validación cruzada. No se documenta en la información disponible el número de árboles, la profundidad máxima, el criterio de impureza, el número de tokens de entrenamiento (concepto no aplicable) ni la composición exacta del dataset más allá de la proporción de clases: 99.8 % de ejemplos negativos frente a 0.2 % de positivos. No se reporta uso de técnicas de remuestreo, ponderación de clases ni funciones de pérdida específicas para desequilibrio, lo que explica el colapso del modelo hacia la clase mayoritaria.

## Capacidades

- Clasificación binaria tabular: predice la etiqueta `Is_Out_of_Stock` (1 para rotura de stock, 0 para estado seguro o intermedio) a partir de 40 variables de entrada.
- Extracción de probabilidades: la model card recomienda el uso de `predict_proba` para obtener una puntuación de riesgo continua y aplicar umbrales operativos (por ejemplo, notificar reposición cuando la probabilidad sea igual o superior al 5 %).
- Interpretación de importancia de características: el autor indica que `Days_of_Inventory` es la variable más determinante, lo que permite ajustar puntos de pedido de forma dinámica.
- Integración en pipelines Python: al ser un artefacto joblib, se carga con `joblib.load` y se integra en scripts de análisis o servicios de datos existentes.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.
- Capacidad multilingüe: no aplica; el modelo no procesa texto libre, solo variables tabulares.

## Casos de uso

- Monitorización de roturas de stock en almacén: cargar el modelo con `joblib.load`, aplicar el escalador y ejecutar `predict_proba` sobre el inventario diario para generar una lista priorizada de SKU con riesgo elevado, usando el umbral del 5 % recomendado por el autor.
- Generación de alertas de reposición: integrar la probabilidad de salida en el sistema de notificaciones del ERP para disparar órdenes de compra cuando un SKU supere el umbral configurado, aprovechando la importancia de `Days_of_Inventory` para calibrar el punto de pedido.
- Ajuste dinámico de puntos de reorden: usar la probabilidad estimada como señal auxiliar para recalcular el Reorder Point de cada referencia en función de su edad de stock, ventas medias y cantidad reservada.
- Análisis exploratorio de riesgo por categoría: agrupar las probabilidades por familia de producto o proveedor para identificar las categorías con mayor exposición a roturas y priorizar auditorías de inventario.
- Validación de políticas de seguridad: simular escenarios hipotéticos modificando `Quantity_On_Hand` o `Avg_Daily_Sales` y observar cómo varía la probabilidad de rotura, como apoyo a la planificación de stock de seguridad.
- Docencia y reproducción académica: servir como ejemplo reproducible de pipeline Scikit-Learn con escalador, selección de características y Grid Search, útil en asignaturas de ciencia de datos aplicada a operaciones.
- Prototipado de sistemas de previsión de inventario: usar el artefacto como línea base antes de sustituirlo por modelos con tratamiento explícito de desequilibrio (SMOTE, class weighting, gradient boosting con `scale_pos_weight`).

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los del propio autor, comparando el modelo antes y después del ajuste de hiperparámetros sobre el conjunto de prueba:

| Tahon | Accuracy | Precision (Out of Stock) | Recall (Out of Stock) | F1-Score (Out of Stock) |
|---|---|---|---|---|
| Antes del tuning | 1.0000 | 0.0000 | 0.0000 | 0.0000 |
| Después del tuning | 1.0000 | 0.0000 | 0.0000 | 0.0000 |

El autor atribuye los valores nulos a que el conjunto de prueba aleatorio de 200 muestras contenía cero positivos, dada la proporción real del 0.2 % de la clase Out of Stock en el dataset original. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y estos no serían aplicables a un modelo tabular de clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU. El tamaño del repositorio es de 0.0 GB, por lo que el artefacto joblib es de pocos megabytes.
- GPU recomendadas: no se requiere GPU. Cualquier CPU moderna es suficiente para inferencia en lote.
- Compatibilidad con GPU de consumo: no aplica; Scikit-Learn no aprovecha CUDA para Random Forest en inferencia estándar.
- Opciones de despliegue: script Python con `joblib` y `scikit-learn==1.6.1`, servicio REST con FastAPI o Flask, tarea programada en un orquestador (Airflow, Prefect) o integración en un notebook de análisis.
- Latencia y throughput estimados: no disponibles en la información proporcionada; para un Random Forest de tamaño típico se espera latencia de milisegundos por muestra en CPU, pero no se aporta medición concreta.
- Requisito crítico de versionado: la model card especifica Scikit-Learn 1.6.1; cargar el artefacto con otra versión puede provocar errores de deserialización o cambios de comportamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| bds-grocery-inventory-prediction | Random Forest tabular (Scikit-Learn) | no disponible | no aplica | F1 = 0.0000 en clase positiva (autor) | MIT | Hugging Face, 0 descargas |
| XGBoost / LightGBM con `scale_pos_weight` | Gradient boosting tabular | no disponible | no aplica | No disponible en esta ficha | Apache 2.0 / MIT | Bibliotecas ampliamente adoptadas |
| Random Forest con SMOTE o class weighting | Ensemble tabular | no disponible | no aplica | No disponible en esta ficha | BSD-3 (Scikit-Learn) | Scikit-Learn `imblearn` |
| Modelos de previsión de demanda (Prophet, statsmodels) | Series temporales | no aplica | no aplica | No disponible en esta ficha | MIT / BSD | Bibliotecas estándar |

La comparación se limita a alternativas metodológicas, ya que no se dispone de benchmarks públicos de este modelo frente a otros artefactos de la misma categoría. Cualquier alternativa con tratamiento explícito del desequilibrio de clases superaría previsiblemente el F1 de 0.0000 reportado por el autor.

## Limitaciones y advertencias

- Desequilibrio extremo de clases: 99.8 % negativos frente a 0.2 % positivos, sin evidencia de remuestreo, ponderación ni umbral ajustado; el modelo predice la clase mayoritaria y anula la clase de interés.
- Métricas nulas en la clase positiva: Precision, Recall y F1 de 0.0000 tras el tuning, según la propia model card; el Accuracy de 1.0000 es engañoso en este contexto.
- Conjunto de prueba no representativo: 200 muestras aleatorias con cero positivos, lo que impide evaluar la capacidad real de detección.
- Validez poblacional restringida: el autor limita su uso a almacenes con ciclos de producto de supermercado similares al dataset de entrenamiento; no se garantiza transferencia a otros sectores o países.
- Dependencia estricta de versión: Scikit-Learn 1.6.1 y orden exacto de las 40 características definido en `feature_names.joblib`; cualquier desviación invalida la inferencia.
- Idioma y alcance: etiquetado para indonesio y sin procesamiento de texto libre; no es un modelo generativo ni multilingüe.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de falsos negativos sistemáticos que darían una falsa sensación de seguridad operativa.
- Uso comercial: la licencia MIT permite uso comercial, pero el estado del modelo (métricas nulas, 0 descargas) desaconseja su despliegue en producción sin reentrenamiento y validación con datos propios.
- Sin mantenimiento aparente: repositorio creado y actualizado el mismo día (2026-11-18), sin descargas ni likes; no hay evidencia de soporte o evolución posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lalaland2343/bds-grocery-inventory-prediction
- Documentación de Scikit-Learn 1.6.1 (RandomForestClassifier): https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html
- Documentación de joblib: https://joblib.readthedocs.io/
- Documentación de huggingface_hub (`hf_hub_download`): https://huggingface.co/docs/huggingface_hub/guides/download
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
