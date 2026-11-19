# SMHunain/crop-yield-drought-pakistan

## Resumen

`SMHunain/crop-yield-drought-pakistan` es un modelo de regresión tabular basado en un `Pipeline` de scikit-learn que predice el rendimiento de 13 cultivos en las provincias pakistaníes de Punjab, Sindh y Balochistán a partir de variables climáticas anuales y de humedad del suelo. Lo firma el usuario SMHunain como proyecto de la asignatura CT-378 Machine Learning, y su propósito declarado es didáctico: estudiar cómo responde un modelo sencillo a escenarios de sequía y demostrar un ciclo de vida completo de machine learning, desde la ingesta de datos hasta el despliegue con FastAPI y Streamlit.

El modelo no es una red neuronal ni un transformer: es un `RandomForestRegressor` envuelto en un pipeline con imputación por mediana, escalado estándar, codificación one-hot de cultivo y provincia, y ajuste sobre el logaritmo del rendimiento. Trabaja con 773 filas anuales (una por cultivo, provincia y año) procedentes de dos fuentes públicas: un conjunto de rendimiento agrícola y clima de Pakistán (origen Zenodo 15486470) y datos de humedad del suelo de la API NASA POWER. La partición temporal es 2001-2016 para entrenamiento, 2017-2019 para validación y 2020-2022 para test.

Su relevancia es limitada fuera del ámbito académico: el propio autor advierte que no debe usarse para decisiones agrícolas o de política real, y los resultados muestran que la identidad del cultivo domina la predicción por encima de las variables climáticas. Aun así, resulta un ejemplo útil de buenas prácticas de evaluación (GroupKFold agrupado por año, rechazo de entradas fuera de rango) y de las trampas de los modelos tabulares pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest dentro de un Pipeline de scikit-learn (imputación por mediana, escalado estándar, one-hot encoding, regresor sobre log del rendimiento) |
| Parametros totales | no disponible (no se documenta el número de árboles ni su profundidad) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (modelo clásico, no se cuantiza; se serializa con joblib) |
| Idiomas soportados | no disponible (no procesa texto libre; solo etiquetas de cultivo y provincia) |
| Licencia | no disponible (el autor indica que el grupo aún no ha elegido licencia para el modelo) |
| Formato de pesos | joblib (`crop_yield_pipeline.joblib`), más `reference.json` y `metrics.json` |

## Arquitectura y entrenamiento

La arquitectura es un `RandomForestRegressor` integrado en un `Pipeline` de scikit-learn 1.9.1. El preprocesado incluye imputación por mediana, escalado estándar de las variables numéricas, codificación one-hot de las categóricas (`Crop`, `Province`) y ajuste del regresor sobre el logaritmo del rendimiento. Las entradas son 13 variables anuales: `precipitation_sum`, `temperature_2m_mean`, `temperature_2m_max`, `temperature_2m_min`, `fao_evapotranspiration`, `shortwave_radiation`, `precipitation_hours`, `soil_wetness_mean`, `soil_wetness_max`, `rain_deficit_pct`, `water_balance_mm`, `aridity_index`, más cultivo y provincia. La salida es el rendimiento en unidades del dataset original, cuya unidad no está confirmada por la fuente.

El entrenamiento usó `GridSearchCV` con `GroupKFold` de 5 particiones agrupadas por año, de modo que ningún año aparece en dos folds, y comparó Ridge, Random Forest, Gradient Boosting y dos baselines. La selección se hizo sobre los años de validación (2017-2019) y el test (2020-2022) se evaluó una sola vez. La semilla es 42 y el entrenamiento se ejecutó el 2026-11-19T02:13:35+00:00. El conjunto final tiene 773 filas tras descartar filas con área cero de manzana, uva y granada. No hay RLHF, DPO ni ningún ajuste por preferencias: es un modelo supervisado clásico.

## Capacidades

- Predicción de rendimiento agrícola anual para 13 cultivos en tres provincias de Pakistán.
- Ranking de cultivos por porcentaje del rendimiento típico que conservan en un escenario de sequía (`pct_of_normal`).
- Estimación de intervalos de predicción empíricos al 80 % a partir de los cuantiles de los residuos logarítmicos en validación.
- Rechazo explícito de entradas fuera del rango visto en entrenamiento mediante `OutOfRangeError`, coherente con la incapacidad de los árboles de extrapolar.
- Relleno de entradas faltantes con la mediana provincial de referencia (`reference.json`).
- Integración con aplicaciones web mediante FastAPI y Streamlit en el repositorio del proyecto.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Docencia de ciclo de vida de machine learning: el repositorio incluye entrenamiento, evaluación temporal, API FastAPI y app Streamlit, lo que permite recorrer un proyecto completo en un curso.
- Estudio de sensibilidad a la sequía: variando `precipitation_sum` y `temperature_2m_mean` respecto a la mediana provincial se obtiene el porcentaje de rendimiento típico por cultivo, útil para analizar cualitativamente qué cultivos resisten mejor en el modelo.
- Demostración de evaluación con partición temporal: el uso de `GroupKFold` por año y un test reservado sirve como ejemplo de buenas prácticas frente a la fuga de información.
- Prototipado de APIs de inferencia tabular: el ejemplo de `inference_example.py` y la app FastAPI muestran cómo exponer un pipeline de scikit-learn como servicio.
- Análisis exploratorio de fuentes públicas: la fusión de datos de rendimiento (Zenodo) con NASA POWER ejemplifica la integración de datasets climáticos heterogéneos.
- Prueba de conceptos de rechazo de entradas: el mecanismo `OutOfRangeError` ilustra cómo proteger un modelo de árboles frente a extrapolaciones en producción.

## Benchmarks y rendimiento

Resultados publicados en la model card (rendimiento en unidades del dataset):

| Modelo | Val R² | Val MAE | Test R² | Test MAE | Test RMSE | Test skill vs media cultivo-provincia |
|---|---:|---:|---:|---:|---:|---:|
| Baseline: media global | -0.002 | 91.7 | -0.030 | 100.4 | 173.6 | -6.96 |
| Baseline: media cultivo-provincia | 0.877 | 20.9 | 0.832 | 34.7 | 70.1 | +0.00 |
| Ridge | 0.610 | 55.5 | 0.503 | 70.6 | 120.6 | -1.98 |
| **Random Forest (elegido)** | 0.849 | 24.5 | 0.794 | 40.9 | 77.7 | -0.76 |
| Gradient Boosting | 0.867 | 23.8 | 0.813 | 41.0 | 73.9 | -0.68 |

El propio autor señala que el baseline de media cultivo-provincia supera al Random Forest en test (R² 0.832 frente a 0.794) y que la "skill" del modelo es negativa (-0.76), lo que indica que no mejora a ese baseline en escala logarítmica. El intervalo de predicción nominal del 80 % cubrió solo el 60 % de los valores reales en test, por lo que es optimista.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un Random Forest serializado con joblib, por lo que se ejecuta en CPU sin GPU.
- VRAM estimada: no aplica; no requiere GPU.
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0.0 GB y el pipeline se carga en memoria sin problema en portátiles convencionales.
- Opciones de despliegue: FastAPI (incluida en el repositorio), Streamlit (incluida), o carga directa con `joblib.load` en scripts de Python. No aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un Random Forest sobre 773 filas de entrenamiento, la inferencia es de milisegundos por lote en CPU, aunque no se documenta una medición.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / entradas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SMHunain/crop-yield-drought-pakistan` | Random Forest (scikit-learn) | 13 variables anuales + cultivo + provincia | Test R² 0.794; skill -0.76 frente a media cultivo-provincia | no disponible | Hugging Face, repo GitHub |
| Gradient Boosting (mismo estudio) | Gradient Boosting | Mismas entradas | Test R² 0.813; skill -0.68 | no disponible | Solo como resultado comparativo en la model card |
| Baseline media cultivo-provincia (mismo estudio) | Media histórica | Cultivo + provincia | Test R² 0.832; skill +0.00 | no disponible | Referencia interna del estudio |
| Otros modelos agrícolas públicos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada modelos públicos comparables de predicción de rendimiento agrícola para Pakistán con los que establecer una comparación directa.

## Limitaciones y advertencias

- Conjunto de datos muy pequeño: 773 filas anuales de 22 años y 3 provincias, lo que limita la generalización.
- La identidad del cultivo domina la predicción; el clima y la humedad del suelo apenas modifican el resultado, y la fuente de humedad del suelo aporta poco según el autor.
- No se modela tendencia temporal anual, por lo que no se captura el crecimiento histórico de los rendimientos, lo que afecta especialmente a los años de test.
- Las variables climáticas y de humedad son a nivel provincial (tres puntos elegidos a mano por provincia para la humedad), sin detalle de distrito o explotación.
- La temperatura media anual varía solo unos 1,5 °C dentro de una provincia en entrenamiento, por lo que muchas entradas caen fuera del rango entrenado y se rechazan.
- Cultivos como uva, granada y manzana tienen años faltantes y son más ruidosos.
- La unidad del rendimiento no está confirmada por la fuente de datos.
- El intervalo de predicción nominal del 80 % cubrió solo el 60 % en test: es optimista y no debe interpretarse como garantía.
- El modelo no supera al baseline de media cultivo-provincia en test (skill -0.76), por lo que su valor predictivo real es cuestionable.
- Uso previsto estrictamente académico y de demostración; el autor prohíbe explícitamente su uso para decisiones agrícolas o de política real.
- Licencia del modelo no elegida todavía; la licencia del dataset de cultivo es MIT según su repositorio, y la de NASA POWER no está especificada en el catálogo (uso libre con cita solicitada).
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de predicciones sin base estadística robusta fuera del rango entrenado, mitigado parcialmente por `OutOfRangeError`.

## Enlaces

- Hugging Face: https://huggingface.co/SMHunain/crop-yield-drought-pakistan
- Repositorio del proyecto (FastAPI, Streamlit, código de entrenamiento): https://github.com/SyedMuhammadHunain/Climate-Machine-Learning
- Dataset de rendimiento y clima (origen Zenodo 15486470, vía repositorio Abdullah-Masood-05): https://github.com/Abdullah-Masood-05
- NASA POWER (fuente de humedad del suelo): https://power.larc.nasa.gov/
