# Darzzzz/sales-amount-transaction-predictor

## Resumen

El "Sales Amount Transaction Predictor" es un modelo de regresión tabular desarrollado por el usuario Darzzzz y publicado en Hugging Face. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un `Random Forest Regressor` de scikit-learn, serializado con joblib, entrenado para predecir el importe de una transacción de venta (`Sales_Amount`) a partir de 58 variables de entrada derivadas de 17 campos brutos de un conjunto de datos de ventas minoristas. El modelo está orientado a tareas de estimación de ingresos, priorización logística y detección de anomalías o errores de precio en entornos de venta minorista y B2B.

El artefacto ocupa aproximadamente 0,1 GB e incluye, además del modelo, un escalador (`StandardScaler`), la lista de nombres de columnas y metadatos de entrenamiento. El autor declara un rendimiento muy alto sobre el conjunto de prueba (R² de 0,9933, MAE de 9,2468 y RMSE de 69,7584), aunque estos valores proceden exclusivamente de la model card y no han sido verificados de forma independiente.

Su relevancia es acotada: no compite con modelos generativos ni con sistemas de predicción de series temporales de propósito general, sino que constituye un artefacto de ejemplo reproducible para pipelines de regresión tabular con scikit-learn. La licencia MIT facilita su reutilización, pero la ausencia de descargas, de pipeline declarado y de validación externa limita su uso en producción sin una evaluación previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest Regressor (scikit-learn), con hiperparámetros ajustados mediante GridSearchCV |
| Parametros totales | no disponible (el número de árboles y su profundidad no se detallan en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica; el artefacto se distribuye en formato joblib sin cuantización |
| Idiomas soportados | indonesio (`id`) según los metadatos; las variables categóricas están codificadas en inglés (países, métodos de pago, segmentos) |
| Licencia | MIT |
| Formato de pesos | joblib (`model_final.joblib`, `scaler.joblib`, `feature_names.joblib`, `metadata.joblib`) |

## Arquitectura y entrenamiento

El modelo es un bosque aleatorio de regresión implementado con scikit-learn. La model card indica que los hiperparámetros se optimizaron de forma sistemática mediante `GridSearchCV`, pero no especifica la rejilla de búsqueda, el número final de estimadores, la profundidad máxima, el criterio de división ni el número de características consideradas por división. Tampoco se documenta el esquema de validación cruzada empleado durante el ajuste.

El entrenamiento se realizó sobre el "Sales Transactions Dataset 2022–2025", enlazado a un conjunto de datos público de Kaggle sobre ventas minoristas. Tras la limpieza se conservaron 17.923 filas de las 18.045 originales. A partir de 17 variables brutas se generaron 58 características de entrada: variables numéricas estandarizadas con `StandardScaler` (edad del cliente, cantidad, precio unitario, descuento, nivel de inventario y componentes temporales como año, mes, día de la semana y hora), una variable ordinal codificada para el método de envío y varias variables nominales expandidas mediante one-hot encoding (género, segmento de cliente, canal de venta, país, subcategoría de producto, método de pago y código de promoción). No se menciona el uso de validación temporal, de remuestreo para outliers ni de técnicas de regularización más allá del propio ensamblado.

## Capacidades

- Predicción de regresión sobre datos tabulares: estima un valor continuo de importe de venta a partir de 58 características numéricas y codificadas.
- Ingeniería de características temporal: el código de ejemplo deriva mes, día de la semana y hora a partir de campos de fecha y hora brutos.
- Codificación ordinal de métodos de envío según una jerarquía de velocidad predefinida (Pickup, Standard, Express, Next Day).
- Detección indirecta de anomalías: el autor propone su uso para identificar transacciones con precios mal introducidos comparando la predicción con el valor real.
- Segmentación por país, canal, segmento de cliente y subcategoría de producto mediante variables dummy.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un estimador supervisado de salida única.
- No dispone de capacidades multimodales (visión, audio) ni de modo de razonamiento extendido.

## Casos de uso

- Estimación de ingresos en el momento del pedido: dado un pedido nuevo con cantidad, precio unitario, descuento, país y segmento de cliente, el modelo devuelve un importe esperado que el equipo comercial puede usar para previsión de caja a corto plazo.
- Priorización logística: combinando la predicción de importe con el método de envío, el equipo de almacén puede ordenar la preparación de pedidos de mayor valor esperado antes que los de menor cuantía.
- Detección de errores de precio: si el importe real difiere de forma significativa de la predicción (por ejemplo, muy por encima del RMSE declarado de 69,76), el sistema puede marcar la transacción para revisión manual antes de facturar.
- Auditoría financiera de muestras: el modelo permite puntuar transacciones históricas y seleccionar las de mayor desviación entre valor observado y predicho para inspección detallada.
- Simulación de escenarios de descuento: modificando `Discount_Percentage` y `Quantity` en la entrada, se puede explorar el impacto estimado en el importe final sin necesidad de reentrenar el modelo.
- Enriquecimiento de paneles de ventas: integrado como servicio de inferencia por lotes, añade una columna de importe esperado a cada pedido para comparar con el importe real y alimentar métricas de calidad de datos.
- Prototipado educativo: sirve como referencia reproducible de un pipeline completo de scikit-learn (limpieza, escalado, codificación, ajuste con GridSearchCV y serialización con joblib) para equipos que construyen sus primeros modelos tabulares.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card del autor y se calcularon sobre un conjunto de prueba independiente de 3.585 filas. No se han verificado de forma independiente ni se comparan con líneas base publicadas.

| Metrica | Valor | Nota |
|---|---|---|
| R² | 0,9933 | Sobre 3.585 filas de prueba |
| MAE | 9,2468 | Unidades de moneda del conjunto de datos |
| RMSE | 69,7584 | Sensible a outliers B2B |
| Error <= 1,0 | 67,98 % de las filas de prueba | Predicción muy ajustada |
| Error entre 1,0 y 10,0 | 21,90 % de las filas de prueba | Tolerancia moderada |
| Error > 10,0 | 10,13 % de las filas de prueba | Concentrado en pedidos B2B atípicos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo de regresión tabular. Tampoco se aportan comparaciones con líneas base lineales, gradient boosting u otros ensamblados sobre el mismo conjunto de datos.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: ninguna. Cualquier CPU x86-64 o ARM moderna es suficiente para la inferencia.
- Memoria RAM: el artefacto ocupa aproximadamente 0,1 GB, por lo que cabe holgadamente en cualquier equipo con 1 GB de RAM libre, incluidos portátiles de gama baja y contenedores pequeños.
- Cabe en GPU de consumo: sí, aunque no es necesario; también funciona sin GPU en Raspberry Pi y entornos similares.
- Opciones de despliegue: carga directa con `joblib.load` en Python, servicio REST con FastAPI o Flask, tareas por lotes con pandas, o empaquetado en un contenedor Docker. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un bosque aleatorio con 58 características de entrada, la latencia esperada por fila es del orden de microsegundos a milisegundos en CPU, pero no se aportan mediciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables publicados con el mismo conjunto de datos ni sobre líneas base evaluadas por el autor. La comparación se limita a alternativas genéricas de regresión tabular que podrían sustituir a este artefacto, sin datos de rendimiento comparables.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sales Amount Transaction Predictor | Random Forest (scikit-learn) | no disponible | no aplica | MIT | Hugging Face |
| Gradient boosting (XGBoost, LightGBM, CatBoost) | Ensamblado de árboles con boosting | Configurable | no aplica | MIT / Apache 2.0 | Bibliotecas estándar |
| Regresión lineal regularizada (Ridge, Lasso) | Modelo lineal | Configurable | no aplica | BSD | scikit-learn |
| Red neuronal tabular (MLP) | Perceptrón multicapa | Configurable | no aplica | BSD | scikit-learn, PyTorch |

La comparación de rendimiento entre estas alternativas sobre el mismo conjunto de datos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo predice un importe monetario, pero la model card no especifica la divisa ni el rango de valores del conjunto de datos, lo que dificulta interpretar el MAE de 9,2468 en términos absolutos.
- El R² de 0,9933 es sospechosamente alto para un problema de predicción de ventas con outliers B2B; podría indicar fuga de información (por ejemplo, que `Sales_Amount` se derive aritméticamente de `Quantity` y `Unit_Price` menos el descuento), algo que la model card no aclara.
- No se documenta el esquema de validación (¿aleatoria o temporal?), por lo que el rendimiento en producción sobre pedidos futuros puede degradarse respecto al conjunto de prueba.
- El conjunto de entrenamiento tiene solo 17.923 filas y 58 características, lo que aumenta el riesgo de sobreajuste y de baja robustez ante distribuciones distintas.
- Las variables categóricas están codificadas en inglés y limitadas a los valores vistos en entrenamiento (cinco países, tres canales, cinco segmentos, diecisiete subcategorías); valores nuevos provocarán codificaciones inconsistentes o columnas vacías.
- El modelo no maneja texto libre, fechas sin preprocesar ni valores ausentes de forma nativa; el usuario debe replicar exactamente el pipeline de escalado y codificación del autor.
- La licencia MIT permite uso comercial, pero no se ofrece garantía alguna sobre la exactitud de las predicciones ni sobre la calidad de los datos de origen.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y no declara pipeline en Hugging Face, lo que reduce la confianza en su mantenimiento y soporte.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de predicciones erróneas presentadas con aparente precisión, especialmente en pedidos B2B atípicos donde el RMSE se dispara.
- No se han publicado análisis de sesgo por país, género o segmento de cliente, pese a que el modelo consume esas variables como entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Darzzzz/sales-amount-transaction-predictor
- Conjunto de datos de origen citado en la model card: https://www.kaggle.com/datasets/danielsowah123/retail-sales-dataset
- Documentación de scikit-learn (RandomForestRegressor): https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestRegressor.html
- Documentación de joblib: https://joblib.readthedocs.io/
