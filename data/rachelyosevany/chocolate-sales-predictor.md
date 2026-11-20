# rachelyosevany/chocolate-sales-predictor

## Resumen

`chocolate-sales-predictor` es un modelo de regresion tabular basado en Random Forest, publicado por el usuario rachelyosevany en Hugging Face. No es un modelo de lenguaje ni una red neuronal profunda: se trata de un artefacto de scikit-learn serializado con joblib que predice el importe total de ventas (en USD) de transacciones de productos de chocolate a partir de cuatro variables de negocio: pais de comercializacion, variante de producto, comercial y numero de cajas enviadas.

El modelo se entrena sobre el dataset publico "Chocolate Sales Data" (1.094 transacciones, 80/20 train/test), con 54 features tras aplicar One-Hot Encoding y estandarizacion. Su relevancia es acotada: sirve como ejemplo didactico de pipeline de regresion tabular de principio a fin (preprocesado, tuning con RandomizedSearchCV, evaluacion), no como componente para produccion real.

Los resultados publicados son debiles: el R² final en test es negativo (-0,0432), lo que indica que el modelo predice peor que una linea base trivial (la media del target). El RMSE final es de 4.114,77 USD sobre un target con media de 5.652,31 USD. Cualquier evaluacion seria debe tener en cuenta esta limitacion antes de considerarlo util.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest Regressor (scikit-learn) |
| Parametros totales | no disponible (300 arboles, max_depth=10; numero de nodos no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica (artefacto joblib, no cuantizable) |
| Idiomas soportados | id (etiqueta declarada; el modelo no procesa texto, solo categorias) |
| Licencia | no disponible |
| Formato de pesos | joblib (`.joblib`): `model_saya.joblib`, `scaler.joblib`, `feature_names.joblib`, `metadata.joblib` |

## Arquitectura y entrenamiento

El modelo es un `RandomForestRegressor` de scikit-learn con hiperparametros optimizados mediante `RandomizedSearchCV`: `n_estimators=300`, `max_depth=10`, `min_samples_split=2`, `min_samples_leaf=5`. El pipeline incluye `StandardScaler` sobre la feature numerica `Boxes Shipped` y One-Hot Encoding con `drop_first=True` sobre las tres categoricas (`Country`, `Product`, `Sales Person`), resultando en 54 features de entrada.

El entrenamiento usa 875 filas (80%) y la evaluacion 219 filas (20%) del dataset "Chocolate Sales Data", con `random_state=42`. No se documenta validacion cruzada, ni busqueda de hiperparametros con criterio detallado, ni tecnicas de regularizacion adicionales. No hay RLHF, DPO ni innovaciones arquitectonicas: es un baseline clasico de regresion tabular.

## Capacidades

- Prediccion de importe de venta (`Amount` en USD) para una transaccion individual a partir de cuatro campos.
- Manejo de variables categoricas de alta cardinalidad mediante One-Hot Encoding (22 productos, 25 comerciales, 6 paises).
- Estandarizacion de la unica variable numerica (`Boxes Shipped`).
- Inferencia por lotes via `model.predict` sobre un DataFrame preprocesado.
- Serializacion portable con joblib para despliegue en cualquier entorno con scikit-learn 1.6.1.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- No tiene capacidades multilingues reales: la etiqueta `id` es administrativa, no funcional.

## Casos de uso

- Simulacion de escenarios de venta: dado un pais, producto, comercial y numero de cajas, estimar el importe esperado para comparar alternativas de asignacion comercial. Util como herramienta exploratoria, no como sistema de decision.
- Ejercicio docente de pipeline de regresion tabular: el repositorio incluye codigo completo de carga, preprocesado e inferencia, lo que lo hace util para ensenar One-Hot Encoding, StandardScaler y serializacion con joblib.
- Prototipo de integracion en un notebook de analisis de negocio: cargar el modelo y generar predicciones masivas sobre un CSV de transacciones historicas para explorar patrones.
- Prueba de concepto de despliegue en Hugging Face Hub: demuestra el flujo `hf_hub_download` + `joblib.load` para artefactos no neuronales.
- Benchmark interno de referencia: sirve como linea base contra la que comparar modelos mas sofisticados (gradient boosting, redes tabulares) sobre el mismo dataset.
- Analisis de sensibilidad de features: al ser un Random Forest, permite inspeccionar `feature_importances_` para entender que variables dominan la prediccion (aunque el R² negativo limita la interpretacion).

## Benchmarks y rendimiento

Resultados publicados por el autor sobre las 219 filas de test:

| Modelo | RMSE (USD) | MAE (USD) | MSE | R² |
|---|---|---|---|---|
| Random Forest (default) | 4.365,94 | 3.459,82 | 19.061.441,51 | -0,1744 |
| Random Forest (tuned, final) | 4.114,77 | 3.286,78 | 16.931.311,56 | -0,0432 |

No se han publicado comparaciones con otros modelos sobre el mismo dataset en la informacion disponible.

## Requisitos de hardware

- CPU: cualquier procesador moderno es suficiente; el modelo tiene 300 arboles de profundidad maxima 10 y se infiere en milisegundos por fila.
- RAM: menos de 100 MB para cargar modelo, scaler y metadata; el repositorio ocupa 0,0 GB.
- GPU: no necesaria ni soportada de forma nativa por scikit-learn para este modelo.
- Despliegue: cualquier entorno Python con `scikit-learn==1.6.1`, `joblib`, `pandas`, `numpy` y `huggingface_hub`. No aplica vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia: no publicada; por la naturaleza del modelo, del orden de microsegundos a pocos milisegundos por prediccion en CPU.
- Throughput: no publicado; escalable horizontalmente sin coste de GPU.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables publicados sobre el mismo dataset con metricas equiparables. Como referencia conceptual, cualquier regresor tabular alternativo (XGBoost, LightGBM, CatBoost, GradientBoostingRegressor) sobre las mismas 54 features seria un competidor directo, pero no hay resultados publicados para comparar.

## Limitaciones y advertencias

- R² negativo en test (-0,0432): el modelo predice peor que la media del target. No es apto para produccion ni para decisiones de negocio reales.
- Sobreajuste severo: la mejora de default a tuned es marginal y el R² sigue siendo negativo, lo que sugiere que las features disponibles no explican el target.
- Dataset pequeno (1.094 filas) y probablemente sintetico o de origen incierto; no se documenta procedencia ni proceso de recogida.
- Etiqueta de idioma `id` (indonesio) pero el modelo no procesa texto: es un metadato administrativo, no una capacidad funcional.
- Licencia no declarada: no se puede asumir uso comercial permitido. Verificar con el autor antes de cualquier uso fuera de experimentacion.
- Dependencia estricta de `scikit-learn==1.6.1`: cargar el joblib con otra version puede fallar o producir predicciones silenciosamente incorrectas.
- El codigo de inferencia de la model card asume que las categorias de entrada coinciden exactamente con las del entrenamiento; categorias no vistas se codifican como todo ceros sin aviso.
- No hay informacion sobre sesgos, pues el modelo no procesa lenguaje; el riesgo principal es la extrapolacion silenciosa a rangos de `Boxes Shipped` fuera del entrenamiento.
- Sin validacion cruzada ni intervalos de confianza publicados: la metrica unica sobre un split fijo es fragil.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rachelyosevany/chocolate-sales-predictor
- Dataset en Kaggle: https://www.kaggle.com/datasets/atharvasoundankar/chocolate-sales
- Mirror del dataset en GitHub: https://raw.githubusercontent.com/rachelyosevany-rgb/chocolate-sales-/refs/heads/main/Chocolate%20Sales.csv
- Repositorio GitHub del autor: https://github.com/rachelyosevany-rgb/chocolate-sales-
- Documentacion de scikit-learn (RandomForestRegressor): https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestRegressor.html
- Documentacion de joblib: https://joblib.readthedocs.io/
