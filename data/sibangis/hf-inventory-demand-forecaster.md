# SibangiS/hf-inventory-demand-forecaster

## Resumen

`hf-inventory-demand-forecaster` es un modelo de regresion tabular publicado en Hugging Face por el usuario SibangiS, orientado a la previsión de demanda de inventario en entornos de retail. No se trata de un modelo de lenguaje ni de una red neuronal profunda de gran tamano, sino de un ensamblado de *stacking* hibrido compuesto por dos aprendices base de *gradient boosting* (LightGBM y XGBoost) y un meta-aprendiz de regresion Huber. El modelo predice la demanda total acumulada en los proximos 7 dias para cada combinacion tienda-producto a partir del historial disponible hasta la fecha de origen.

El modelo se entrena sobre un dataset sintetico de Kaggle (retail-store-inventory-and-demand-forecasting) con 76.000 filas, 5 tiendas y 20 productos, cubriendo el periodo 2022-01-01 a 2024-01-30. La tarea es una regresion supervisada sobre 49 caracteristicas sin fuga de informacion (lags, medias moviles, calendario, precios, promociones, inventario y clima). La version final (v3) elimina el LSTM de la version 1, que resultaba el aprendiz mas debil con un MAE de 115,19, y sustituye el meta-aprendiz Ridge por un HuberRegressor.

La relevancia de esta ficha es acotada: el modelo es un artefacto de pronostico de demanda de nicho, con licencia Apache 2.0, sin descargas registradas y con un unico *like*. Su interes reside en la documentacion detallada del proceso de ensamblado, la comparacion de metricas de error y de nivel de servicio, y la regla de reposicion con *safety stock* calculado fuera de muestra. No debe confundirse con un modelo fundacional: su alcance se limita a la serie temporal sintetica sobre la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado de stacking: LightGBM + XGBoost con meta-aprendiz HuberRegressor |
| Parametros totales | No disponible (modelos de arboles; no aplica el conteo de parametros neuronales) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana de 28 dias de historial como minimo de entrada |
| Tipos de cuantizacion | No disponible (no aplica a modelos de arboles) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pkl` (hybrid_ensemble.pkl, hybrid_ensemble_v1_ridge_backup.pkl) |

## Arquitectura y entrenamiento

El modelo es un ensamblado de *stacking* de dos niveles. En el primer nivel, dos aprendices base de *gradient boosting* sobre arboles de decision: LightGBM con 500 arboles, tasa de aprendizaje 0,05, 15 hojas, min child 30 y regularizacion L2 lambda 5,0; y XGBoost con 500 arboles, tasa de aprendizaje 0,05 y profundidad 6. Ambos se reentrenan sobre el conjunto de entrenamiento mas validacion (64.200 filas, origenes de enero de 2022 a octubre de 2023). En el segundo nivel, un meta-aprendiz `HuberRegressor(epsilon=1.35, alpha=0.0001)` con coeficientes 0,5785 para LightGBM y 0,3456 para XGBoost, e intercepto 32,11, ajustado unicamente sobre predicciones de la validacion antigua (septiembre-octubre de 2023, 6.100 origenes).

La innovacion tecnica declarada no reside en las arquitecturas base, que ya existian, sino en el ensamblado entrenado, el conjunto de 49 caracteristicas sin fuga y los pesos ajustados para esta tarea concreta. Las caracteristicas incluyen lags de 1 a 7, 14 y 28 dias, medias y desviaciones moviles de 7, 14 y 28 dias, media y desviacion expansivas por serie, variables de calendario, precio, descuento, promocion, precios de competidores y brecha de precio, inventario y unidades pedidas con retardo, estacionalidad, clima y epidemia. La particion se hace por fecha de origen: entrenamiento de enero de 2022 a agosto de 2023 (58.100 filas), validacion de septiembre a octubre de 2023 (6.100 filas) y test de noviembre de 2023 a enero de 2024 (8.400 filas). No se documenta uso de RLHF ni DPO, ya que no es un modelo generativo.

## Capacidades

- Prediccion de la demanda total acumulada en los proximos 7 dias por combinacion tienda-producto.
- Regresion tabular sobre 49 caracteristicas derivadas de historial de ventas, precios, promociones, inventario y variables exogenas.
- Generacion de una sugerencia de reposicion a partir del pronostico y del inventario en la fecha de origen.
- Calculo de reposicion con *safety stock* calibrado fuera de muestra (percentil 90 de 21.400 residuos: 181,75 unidades).
- Salida con las dos predicciones base (LightGBM y XGBoost) y la prediccion hibrida combinada.
- Soporte de *tool calling* / *function calling*: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el modelo opera sobre datos numericos y etiquetas en ingles.
- Capacidades especiales (modo *thinking*, vision, audio): no disponibles.

## Casos de uso

- **Reposicion automatizada en retail de tienda fisica**: dado un historial de al menos 28 filas por tienda-producto, el modelo predice la demanda de los proximos 7 dias y sugiere una cantidad de pedido aplicando el *safety stock* de 181,75 unidades. Es adecuado para catalogos pequenos y homogeneos como el del dataset (5 tiendas, 20 productos).
- **Planificacion semanal de compras**: la ventana de prediccion de 7 dias encaja con ciclos de reposicion semanales; el modelo entrega el pronostico y el inventario en la fecha de origen, lo que permite comparar directamente con el stock disponible.
- **Deteccion temprana de riesgo de rotura de stock**: la tasa de rotura medida en test es de 0,4943 con la regla de pedido literal y el nivel de servicio con *safety stock* alcanza 0,9114, lo que permite priorizar referencias con mayor probabilidad de quedarse sin existencias.
- **Comparacion de politicas de inventario**: al exponer las predicciones base de LightGBM y XGBoost junto con la hibrida, permite evaluar el impacto de distintas reglas de pedido (pedido exacto frente a pedido con colchon) sobre el nivel de servicio y el exceso de inventario.
- **Prototipado de pipelines de forecasting tabular**: el modelo sirve como referencia reproducible para validar un flujo completo de caracteristicas, particion temporal, ensamblado y evaluacion con metricas de negocio (MAE, RMSE, WMAPE, tasa de rotura, nivel de servicio).
- **Analisis de sensibilidad a promociones y precios**: al incluir descuento, promocion, precio de competidores y brecha de precio entre las caracteristicas, permite estudiar como varia la demanda prevista ante cambios en esas palancas comerciales.
- **Docencia y experimentacion con stacking**: la documentacion compara el ensamblado Huber de dos modelos con un ensamblado Ridge de tres modelos y con un LSTM descartado, lo que lo convierte en un caso de estudio util para entender el impacto del meta-aprendiz y de la seleccion de aprendices base.

## Benchmarks y rendimiento

Resultados medidos en el conjunto de test (noviembre de 2023 a enero de 2024) segun la model card:

| Modelo | MAE | RMSE | WMAPE | Tasa de rotura | Nivel de servicio | Exceso de stock medio (uds) |
|---|---:|---:|---:|---:|---:|---:|
| Baseline seasonal naive | 141,86 | 181,71 | 0,1966 | 0,4988 | 0,5012 | 75,34 |
| HistGradientBoosting | 108,18 | 142,46 | 0,1500 | 0,4136 | 0,5864 | 71,88 |
| LightGBM (tuned, solo train) | 107,64 | 141,53 | 0,1492 | 0,4302 | 0,5698 | 69,41 |
| XGBoost (tuned, solo train) | 109,44 | 143,50 | 0,1517 | 0,4035 | 0,5965 | 74,45 |
| LSTM | 115,19 | 152,00 | 0,1597 | 0,4461 | 0,5539 | 72,07 |
| Hybrid v1 Ridge (referencia) | 106,61 | 139,02 | 0,1478 | 0,5099 | 0,4901 | 56,56 |
| LightGBM reentrenado (train + validacion) | 107,10 | 141,04 | 0,1485 | 0,4280 | 0,5720 | 69,49 |
| XGBoost reentrenado (train + validacion) | 108,36 | 142,57 | 0,1502 | 0,4100 | 0,5900 | 72,75 |
| Hybrid Huber final (LightGBM + XGBoost reentrenados) | 105,30 | 138,13 | 0,1460 | 0,4943 | 0,5057 | 58,01 |

El modelo final mejora al Hybrid v1 Ridge en MAE 1,31 (105,30 frente a 106,61), RMSE 0,89 (138,13 frente a 139,02) y WMAPE 0,0018 (0,1460 frente a 0,1478), aproximadamente un 1,2 % en MAE. Con el *safety stock* fuera de muestra de 181,75 unidades, el nivel de servicio en test es 0,9114 y el exceso de stock medio es 186,97 unidades. A igual *stock* de 143,58 unidades, el modelo final daria un nivel de servicio de 0,8607 y un exceso de 153,95, practicamente empatado con v1 (0,8602 y 153,46); ese dato es solo diagnostico y no se uso para el ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de modelos de arboles en `.pkl`, la inferencia se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: no aplica; no se documenta uso de GPU ni aceleracion por hardware.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: ejecucion local mediante `python predict.py --history sample_input.csv` tras instalar `requirements.txt`; el artefacto es un unico fichero `.pkl` cargable con las bibliotecas de Python correspondientes.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | MAE (test) | RMSE (test) | Nivel de servicio (literal) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Hybrid Huber final (este modelo) | Stacking LightGBM + XGBoost + Huber | 105,30 | 138,13 | 0,5057 | Apache 2.0 | Hugging Face |
| Hybrid v1 Ridge | Stacking LightGBM + XGBoost + LSTM + Ridge | 106,61 | 139,02 | 0,4901 | Apache 2.0 | Incluido como backup en el repo |
| LightGBM reentrenado | Gradient boosting unico | 107,10 | 141,04 | 0,5720 | Apache 2.0 | Incluido en el ensamblado |
| XGBoost reentrenado | Gradient boosting unico | 108,36 | 142,57 | 0,5900 | Apache 2.0 | Incluido en el ensamblado |
| LSTM (v1) | Red neuronal recurrente | 115,19 | 152,00 | 0,5539 | Apache 2.0 | Descartado en v3 |

La comparacion se limita a las variantes internas documentadas por el autor sobre el mismo dataset sintetico; no se dispone de comparaciones con modelos de terceros ni con otros conjuntos de datos.

## Limitaciones y advertencias

- El modelo se entrena exclusivamente sobre datos sinteticos de Kaggle (5 tiendas, 20 productos), por lo que su generalizacion a catalogos reales, con mayor cardinalidad y estacionalidades distintas, no esta validada.
- El alcance es una unica tarea: prediccion de demanda acumulada a 7 dias por tienda-producto; no admite otras tareas ni entradas fuera de las 16 columnas del formato `sales_data.csv`.
- Requiere un minimo de 28 filas de historial por serie y que la ultima fila corresponda al dia de origen; no se documenta comportamiento con series mas cortas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero el modelo puede producir predicciones poco fiables fuera del rango temporal y de las distribuciones de precios y promociones vistas en entrenamiento.
- La mejora frente al ensamblado v1 Ridge es marginal (1,2 % en MAE) y el nivel de servicio con la regla de pedido literal es bajo (0,5057), por lo que la utilidad practica depende de aplicar el *safety stock*.
- El *safety stock* de 181,75 unidades se calcula con modelos fuera de muestra entrenados con menos datos que el modelo final, por lo que el autor lo describe como conservador.
- Sesgos conocidos: no documentados; al operar sobre datos sinteticos, los sesgos del dataset original no se han caracterizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset de origen tambien se distribuye bajo Apache 2.0 en Kaggle y debe verificarse su procedencia antes de un despliegue en produccion.
- El repositorio tiene 0 descargas y 1 *like*, sin validacion independiente por parte de la comunidad; no hay resultados de terceros que confirmen las metricas declaradas.
- El modelo se publico el 2026-11-16 y se actualizo el mismo dia; la version final (v3) sustituye a v1 y v2, que se conservan como artefactos separados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SibangiS/hf-inventory-demand-forecaster
- Dataset de origen en Kaggle: https://www.kaggle.com/datasets/atomicd/retail-store-inventory-and-demand-forecasting
- Repositorio de la version v2 (referenciado en la model card): https://huggingface.co/SibangiS/hf-inventory-demand-forecaster-v2
- Ficheros de evaluacion citados en la model card: `leaderboard.csv` y `evaluation_report.md` dentro del repositorio del modelo
- Ejemplos de uso citados: `sample_input.csv` y `sample_output.json` dentro del repositorio del modelo
