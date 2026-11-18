# AdryanAzul/DeliveryETA

## Resumen

DeliveryETA es un pipeline de regresión tabular publicado en Hugging Face por AdryanAzul (usuario AdryanAzul, autor del repositorio GitHub CarvalhoAdryan/DeliveryETA) que predice la duración total de una entrega de DoorDash en minutos (`delivery_duration_minutes`) a partir de atributos disponibles en el momento del checkout. El artefacto es un `joblib` que encapsula un `ColumnTransformer` con One-Hot Encoding y un `HistGradientBoostingRegressor` de scikit-learn. No es un modelo de lenguaje ni una red neuronal: es un modelo clásico de gradient boosting sobre datos tabulares.

El modelo se entrenó sobre el dataset `historical_data.csv` del ejercicio DoorDash Delivery Duration Prediction de StrataScratch, con 197.428 filas y 16 columnas originales, de las que se usan 21 variables derivadas. La validación es temporal con embargo, lo que constituye su principal valor metodológico: separa entrenamiento, validación y test por cortes temporales en lugar de hacer un split aleatorio, evitando fuga de información.

Es relevante ahora no por su rendimiento predictivo sino como ejemplo de buenas prácticas de validación temporal en problemas de ETA y como baseline conservador reproducible. El propio autor advierte que es experimental, no apto para producción, con un R² de +0,0288 en test y un sesgo severo en colas de la distribución. La licencia es MIT y los idiomas declarados se limitan al portugués en la metadata, aunque el contenido del modelo es numérico y categórico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: `ColumnTransformer` (One-Hot Encoding) + `HistGradientBoostingRegressor` |
| Parametros totales | no disponible (modelo de árboles; no aplica recuento de parámetros neuronales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo tabular) |
| Tipos de cuantizacion | no disponible (no aplica; artefacto `joblib` con floats nativos) |
| Idiomas soportados | portugués (metadata); variables categóricas en inglés (`store_primary_category`) |
| Licencia | MIT |
| Formato de pesos | `joblib` (`final_hgb_eta_pipeline.joblib`) |

## Arquitectura y entrenamiento

El modelo es un `HistGradientBoostingRegressor` de scikit-learn, un gradient boosting sobre árboles de decisión con binning histogramático, optimizado para datos tabulares de tamaño medio. Los hiperparámetros están congelados: `loss="absolute_error"` (elegida para robustez frente a outliers de más de 24 horas sin excluirlos del entrenamiento), `learning_rate=0.08`, `max_iter=20`, `max_leaf_nodes=63`, `min_samples_leaf=30`, `l2_regularization=0.0`, `early_stopping=False` y `random_state=42`. El número de iteraciones se fijó mediante validación interna temporal 90/10 dentro del conjunto de entrenamiento.

El preprocesado aplica One-Hot Encoding a `market_id`, `store_primary_category`, `order_protocol` y `created_time_block`; `store_id` se excluyó por alta cardinalidad (6.743 niveles). El resto de variables son numéricas: métricas del carrito (`total_items`, `subtotal`, `num_distinct_items`, `min_item_price`, `max_item_price`, `average_item_price`, `item_price_range`, `invalid_item_price_range`, `distinct_item_ratio`, `is_single_item`, `is_large_order`), temporales (`created_hour`, `created_dayofweek`, `created_month`, `created_is_weekend`) e históricas (`estimated_order_place_duration`, `historical_store_order_count`). La división temporal usa cortes a las 10:00:00 UTC con embargo: 138.572 registros de entrenamiento (anteriores a 2015-02-10 10:00:00), 28.808 de validación (2015-02-10 a 2015-02-14) y 30.041 de test (desde 2015-02-14 10:00:00). No hay RLHF, DPO ni ajuste por preferencias; es aprendizaje supervisado clásico sobre una única variable objetivo continua.

## Capacidades

- Predicción de duración de entrega en minutos a partir de atributos de checkout (regresión tabular univariante).
- Manejo de variables categóricas de baja/media cardinalidad mediante One-Hot Encoding dentro del pipeline.
- Robustez frente a outliers en la variable objetivo gracias a la pérdida `absolute_error`.
- Inferencia rápida: 0,124 s para 30.041 registros en test (aproximadamente 4 microsegundos por fila).
- Entrenamiento rápido: 4,12 s sobre 138.572 registros.
- Interpretabilidad mediante Permutation Importance (`neg_mean_absolute_error`).
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking: no es un modelo generativo.
- Capacidades multilingües: no aplica; las entradas son numéricas y categóricas codificadas.

## Casos de uso

- Baseline de referencia en proyectos de ETA: sirve como punto de comparación conservador y reproducible frente a modelos más complejos (XGBoost, LightGBM, redes profundas) en problemas de predicción de tiempos de entrega, gracias a su validación temporal documentada.
- Estudio de portafolio y docencia: el repositorio GitHub incluye notebooks con las etapas 05, 06.2 y 07, lo que lo convierte en material didáctico para enseñar validación temporal con embargo y evitar fuga de información.
- Prototipado de sistemas de estimación en el checkout: permite integrar una primera versión funcional de estimación de ETA en un flujo de pedidos para validar la infraestructura de serving antes de invertir en un modelo más costoso.
- Análisis de sensibilidad de variables: la Permutation Importance permite identificar qué señales de checkout aportan más información (created_hour, subtotal, market_id) y guiar la recolección de nuevas features operativas.
- Detección de regímenes problemáticos: el análisis de sesgo por segmentos (sobreestimación en entregas rápidas, subestimación en retrasos) sirve para diseñar estrategias de calibración o modelos específicos por franja de duración.
- Punto de partida para una v2: el pipeline congelado y la separación temporal estricta permiten añadir variables operativas (congestión, distancia de ruta, clima) y medir su ganancia marginal de forma controlada.
- Validación de pipelines de MLOps: por su tamaño reducido y su formato `joblib`, es útil para probar flujos de empaquetado, versionado y despliegue de modelos tabulares en entornos de CI/CD.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Conjunto | Modelo | MAE (min) | RMSE (min) | MedAE (min) | P90_AE (min) | R² | Mean Bias |
|---|---|---|---|---|---|---|---|
| Validación (n=28.808) | Baseline (mediana) | 12,8201 | 18,6790 | 9,9000 | 25,6667 | -0,0341 | -3,3927 |
| Validación (n=28.808) | HGB congelado | 12,1142 | 17,9219 | 9,2317 | 24,7196 | +0,0480 | -2,8943 |
| Test (n=30.041) | Baseline (mediana) | 14,1955 | 38,1036 | 10,4667 | 29,0833 | -0,0195 | -5,2643 |
| Test (n=30.041) | HGB congelado | 12,7797 | 37,1903 | 9,2282 | 25,9125 | +0,0288 | -4,6494 |

Ganancia del HGB sobre el baseline en test: -9,97 % en MAE (-1,4158 min), -11,83 % en MedAE (-1,2385 min), -10,90 % en P90_AE (-3,1708 min) y -2,40 % en RMSE (-0,9133 min). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo tabular de regresión.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo se ejecuta en CPU. El artefacto `joblib` ocupa 0,0 GB según el tamaño del repositorio.
- GPU recomendadas: no aplica; `HistGradientBoostingRegressor` de scikit-learn no usa GPU.
- Cabe en cualquier consumer GPU y en CPU de gama baja; el cuello de botella es la memoria RAM para cargar el pipeline y los datos de entrada.
- Opciones de despliegue: `joblib.load` en Python con scikit-learn, servicio REST con FastAPI o Flask, o integración en pipelines de datos con pandas. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que son motores para modelos generativos.
- Latencia y throughput: inferencia de 0,124 s para 30.041 registros en test (aproximadamente 242.000 predicciones por segundo en el hardware del autor, no especificado). Entrenamiento de 4,12 s sobre 138.572 registros.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeliveryETA (AdryanAzul) | HGB tabular | no aplica | no aplica | R² test +0,0288; MAE 12,78 min | MIT | Hugging Face + GitHub |
| Baseline mediana | Estadístico | no aplica | no aplica | R² test -0,0195; MAE 14,20 min | no disponible | Incluido en la model card |
| XGBoost / LightGBM sobre las mismas features | Gradient boosting | no aplica | no aplica | no disponible | Apache 2.0 / MIT | Bibliotecas públicas |
| Modelos de ETA comerciales (DoorDash, Uber) | no disponible | no disponible | no disponible | no disponible | propietaria | no públicos |

No se dispone de comparaciones publicadas con otros modelos de ETA de referencia en la información proporcionada. Las alternativas XGBoost y LightGBM se citan como categoría, no como resultados medidos sobre este dataset.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo es experimental y no está listo para producción real.
- Poder explicativo muy bajo: R² = +0,0288 en test, lo que indica que las variables de checkout explican una fracción mínima de la varianza de la duración.
- Sesgo severo por segmentos: sobreestima entregas rápidas (≤ 30 min: Mean Bias +15,62 min en test) y subestima fuertemente los retrasos (> 120 min: Mean Bias -135,20 min en test).
- Ventana temporal corta: aproximadamente un mes de 2015, con timestamps en probable UTC sin conversión a huso local por mercado.
- Ausencia de señales en tiempo real confirmadas: no usa congestión, distancia de ruta ni condiciones operativas, lo que limita su utilidad práctica.
- El dataset bruto no se redistribuye en el repositorio; su uso depende de los términos de StrataScratch.
- Licencia MIT permite uso comercial, pero el bajo rendimiento y los sesgos documentados desaconsejan cualquier uso en producción sin reentrenamiento y validación adicional.
- La metadata declara idioma portugués, pero las variables categóricas están en inglés; no hay soporte multilingüe real porque no procesa texto libre.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede producir predicciones erróneas con apariencia de precisión en regímenes no representados en entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/AdryanAzul/DeliveryETA
- Repositorio GitHub (código y notebooks): https://github.com/CarvalhoAdryan/DeliveryETA
- Dataset de origen (StrataScratch, DoorDash Delivery Duration Prediction): no disponible como enlace directo en la información proporcionada
- Documentación de scikit-learn `HistGradientBoostingRegressor`: no disponible en la información proporcionada
- Paper o blog del autor: no disponible
