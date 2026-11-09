# pipin07/adidas-operating-profit-rf

## Resumen

`pipin07/adidas-operating-profit-rf` es un modelo de regresión tabular basado en Random Forest, entrenado con scikit-learn 1.6.1, que estima el beneficio operativo (Operating Profit en USD) de una transacción de venta de Adidas en Estados Unidos. Lo desarrolla el usuario pipin07 (Vivine Tan, NIM 2025121096) como trabajo de la asignatura UAS Business Data Science (MN1135). No es un modelo de lenguaje ni una red neuronal: es un artefacto clásico de machine learning serializado con joblib que se aplica sobre una fila de 19 características tabulares.

El problema que aborda es acotado: dado un registro con precio unitario, unidades vendidas, venta total, minorista, región, producto y método de venta, devuelve una predicción continua del beneficio operativo en dólares. Su relevancia es fundamentalmente didáctica y de demostración de un pipeline completo de regresión (selección de variables, one-hot encoding, Grid Search CV y evaluación con RMSE, MAE y R²), no de producción a escala.

El modelo se entrenó sobre el Adidas US Sales Dataset de Kaggle (9.648 transacciones entre enero de 2020 y diciembre de 2021) y alcanza un R² de 0,9633 en el conjunto de prueba de 1.930 transacciones. Es importante subrayar que aproximadamente el 93 % de la capacidad predictiva procede de la variable `Total Sales`, por lo que el modelo no sirve para pronosticar ventas futuras, sino solo para derivar el beneficio cuando la venta ya se conoce.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest Regressor (scikit-learn 1.6.1), ensemble de árboles de decisión |
| Parametros totales | no disponible (200 árboles, max_depth = 20; número de nodos no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular fija de 19 columnas) |
| Tipos de cuantizacion | no aplica; serialización joblib (no hay cuantización) |
| Idiomas soportados | no disponible (no procesa texto libre; los nombres de columna están en inglés) |
| Licencia | no disponible |
| Formato de pesos | joblib (`model_rf_adidas.joblib`, `kolom_fitur.joblib`, `scaler_standard.joblib`) |

## Arquitectura y entrenamiento

El modelo es un `RandomForestRegressor` de scikit-learn con 200 estimadores, profundidad máxima 20 y `min_samples_leaf` = 1, hiperparámetros obtenidos mediante Grid Search con validación cruzada de 5 pliegues. El tuning apenas mejoró el RMSE un 0,8 % respecto a la configuración por defecto, lo que sugiere que el bosque ya capturaba bien la señal dominante. La entrada son 19 columnas: tres numéricas (`Price per Unit`, `Units Sold`, `Total Sales`) y 16 variables one-hot que codifican minorista (Foot Locker, Kohl's, Sports Direct, Walmart, West Gear; Amazon como categoría de referencia), región (Northeast, South, Southeast, West; Midwest como referencia), producto (cinco categorías; Men's Apparel como referencia) y método de venta (Online, Outlet; In-store como referencia).

El entrenamiento se realizó sobre el Adidas US Sales Dataset (9.648 transacciones, 2020-2021), con una partición de prueba de 1.930 transacciones. No se aplicó escalado a los datos de entrenamiento: el `scaler_standard.joblib` incluido es un objeto de preprocesamiento auxiliar que no interviene en la inferencia. La variable `Operating Margin` se descartó explícitamente para evitar fuga de información (data leakage), ya que se deriva directamente del target. No consta uso de validación adicional, regularización distinta del tuning ni técnicas de calibración.

## Capacidades

- Regresión tabular: predice un valor continuo (Operating Profit en USD) a partir de una fila de 19 características.
- Manejo de variables categóricas mediante one-hot encoding predefinido (esquema fijo de columnas).
- Inferencia determinista y reproducible con scikit-learn y joblib.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa texto.
- No dispone de modo thinking, visión, audio ni generación de texto.
- No realiza forecasting: requiere conocer `Total Sales` en el momento de la predicción.

## Casos de uso

- Auditoría interna de transacciones históricas: recalcular el beneficio operativo esperado de cada venta registrada y detectar desviaciones frente al valor contable, usando `Total Sales`, `Units Sold` y `Price per Unit` como entradas.
- Análisis de rentabilidad por minorista: comparar el beneficio estimado entre Foot Locker, Walmart, West Gear y el resto aplicando el modelo a subconjuntos filtrados del dataset, aprovechando las variables one-hot de minorista.
- Segmentación por región y producto: estimar el beneficio medio por región (Northeast, South, Southeast, West) y categoría de producto para priorizar surtido, dado que el modelo acepta esas dimensiones como entradas.
- Docencia y demostración de pipelines de regresión: ejemplo completo de selección de variables, encoding, Grid Search CV y evaluación con RMSE/MAE/R² en un curso de ciencia de datos.
- Validación de hipótesis de pricing: variar `Price per Unit` y `Units Sold` manteniendo el resto de la fila fija para observar la sensibilidad del beneficio estimado en escenarios controlados.
- Prototipado rápido de un servicio de scoring: cargar el `.joblib` en un endpoint ligero (por ejemplo, Flask o FastAPI) que reciba un JSON con las 19 columnas y devuelva la predicción, sin necesidad de GPU.
- Comparación de métodos de venta: evaluar la diferencia de beneficio estimado entre Online, Outlet e In-store sobre transacciones equivalentes en precio y unidades.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card sobre el conjunto de prueba (1.930 transacciones):

| Metrica | Valor |
|---|---|
| RMSE (metrica principal) | 10.516,22 USD |
| MAE | 4.037,52 USD |
| R² | 0,9633 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo es un bosque de 200 árboles serializado en joblib y cabe holgadamente en memoria RAM (el repositorio ocupa 0,0 GB según Hugging Face).
- GPU recomendadas: ninguna; la inferencia es CPU-only.
- Cabe en cualquier equipo de consumo: un portátil convencional con Python y scikit-learn 1.6.1 es suficiente.
- Opciones de despliegue: carga directa con `joblib.load` + `huggingface_hub.hf_hub_download`; servicio REST con Flask o FastAPI; integración en notebooks o scripts de análisis. No aplican vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del modelo (predicción de una fila con 200 árboles poco profundos) se espera latencia de milisegundos en CPU, aunque no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | R² / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pipin07/adidas-operating-profit-rf | Random Forest (sklearn) | 200 árboles, max_depth 20 | no aplica (19 columnas) | R² 0,9633; RMSE 10.516,22 | no disponible | Hugging Face |
| Regresión lineal múltiple sobre las mismas variables | Modelo lineal | no disponible | no aplica | no disponible | no aplica | Implementación propia |
| Gradient Boosting (XGBoost/LightGBM) sobre las mismas variables | Ensemble de boosting | no disponible | no aplica | no disponible | según librería | Librerías open source |

No se dispone de resultados publicados de alternativas sobre este mismo dataset en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Dependencia extrema de `Total Sales`: cerca del 93 % de la capacidad predictiva proviene de esa variable, de modo que el modelo no predice ventas futuras, solo deriva el beneficio cuando la venta ya se conoce.
- Sesgo de subestimación en la cola alta: las predicciones tienden a quedarse cortas para beneficios superiores a 250.000 USD.
- Variables de coste y margen ausentes: `Operating Margin` se eliminó por fuga de datos y las columnas de coste no se usan, por lo que la variación de margen entre transacciones no se captura.
- Cobertura temporal y geográfica limitada: solo datos de EE. UU. entre 2020 y 2021; la extrapolación a otros mercados o años no está validada.
- Esquema de columnas rígido: la entrada debe respetar exactamente el orden y los nombres de `kolom_fitur.joblib`; cualquier cambio en las categorías one-hot invalida la predicción.
- Licencia no especificada: no hay información sobre permisos de uso comercial, por lo que debe tratarse como no autorizado hasta confirmación del autor.
- Riesgo de sobreajuste al dataset de origen: el R² de 0,9633 se midió sobre una partición del mismo dataset de Kaggle y no sobre datos externos.
- Sin mantenimiento ni versionado: repositorio con 0 descargas y 0 likes, actualizado una sola vez; no hay garantías de soporte.
- No apto para decisiones financieras reales sin validación adicional: el MAE de 4.037,52 USD implica un error absoluto medio considerable para transacciones de bajo margen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pipin07/adidas-operating-profit-rf
- Dataset de origen (Kaggle): https://www.kaggle.com/datasets/heemalichaudhari/adidas-sales-dataset
