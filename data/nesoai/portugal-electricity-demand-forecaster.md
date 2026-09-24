# nesoai/portugal-electricity-demand-forecaster

## Resumen

El modelo `portugal-electricity-demand-forecaster` es un modelo de regresión tabular desarrollado por `nesoai` para predecir la demanda eléctrica de la zona de puja de Portugal (PT) con resolución de 15 minutos. No es un modelo de lenguaje ni una red neuronal: se trata de un conjunto de regresores LightGBM (gradient boosting sobre árboles de decisión) entrenados para tres cuantiles (P10, P50 y P90) sobre 96.665 observaciones de la plataforma ENTSO-E correspondientes al periodo 2023-2026.

Su principal aportación técnica es la combinación de regresión cuantílica multi-nivel con calibración conformal y restricciones de monotonicidad, de forma que la predicción puntual (P50) viene acompañada de un intervalo de predicción del 80% (P10-P90) con una cobertura empírica declarada del 78,4%. El modelo se distribuye como artefactos `joblib` y consume 37 features construidas de forma leakage-safe: codificaciones cíclicas de hora, día de la semana y día del año, lags de 1 hora a 14 días, diferencias, aceleración, medias móviles exponenciales y estadísticos rolling.

Es relevante para el sector energético porque ofrece, con un coste computacional mínimo (inferencia exclusivamente en CPU), una mejora declarada del 93,6% en MAE frente al baseline de persistencia estacional de 7 días (45,528 MW frente a 716,312 MW). Está planteado como herramienta de asesoramiento para analítica de mercado y planificación de carga, y la propia model card excluye su uso para ejecución automática de operaciones o despacho de red en tiempo real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre árboles de decisión (LightGBM), regresión cuantílica multi-nivel con calibración conformal y monotonicidad |
| Parámetros totales | No disponible (la model card no especifica número de árboles, hojas ni profundidad) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje). Dependencia temporal máxima de 14 días (`lag_14d`) y ventanas rolling de 7 días; requiere al menos 14 días de histórico para construir todas las features |
| Tipos de cuantización | No aplica. No se publican variantes cuantizadas (GGUF, AWQ, GPTQ, etc.); el modelo se distribuye serializado en `joblib` |
| Idiomas soportados | `en`, `pt` (idiomas de la documentación; el modelo no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | `joblib` (`models.joblib`, diccionario indexado por cuantil: `models[0.1]`, `models[0.5]`, `models[0.9]`) |
| Tarea | Regresión tabular (`tabular-regression`) |
| Variable objetivo | Demanda eléctrica en MW (zona PT) |
| Resolución temporal | Intervalos de 15 minutos |
| Salidas | Predicción puntual (P50) e intervalo de predicción del 80% (P10-P90) |
| Dataset de entrenamiento | `hsilvosa/entsoe-day-ahead` (ENTSO-E Transparency Platform, zona PT) |
| Muestras de entrenamiento | 96.665 observaciones (2023-2026) |
| Número de features | 37 |
| Tamaño del repositorio | 0,0 GB según HuggingFace (artefacto de tamaño reducido) |
| Última actualización | 2026-09-24 según HuggingFace |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un modelo secuencial, sino un conjunto de tres regresores LightGBM independientes, uno por cuantil, optimizados con pérdida pinball (quantile loss) para los niveles 0,1, 0,5 y 0,9. Sobre las predicciones crudas se aplica una calibración conformal y una restricción de monotonicidad que garantiza la coherencia del intervalo (P10 ≤ P50 ≤ P90). El entrenamiento se realizó sobre 96.665 observaciones con resolución de 15 minutos extraídas de la plataforma ENTSO-E para la zona de puja portuguesa, cubriendo el periodo 2023-2026. La model card no documenta número de árboles, tasa de aprendizaje, profundidad máxima, número de hojas ni proceso de búsqueda de hiperparámetros.

Las 37 features se agrupan en cuatro bloques: variables de calendario (`hour`, `quarter`, `day_of_week`, `day_of_year`, `month`, `is_weekend`, `is_holiday`, `is_morning_peak`, `is_evening_peak`), codificaciones cíclicas seno/coseno de hora, día de la semana y día del año, variables de retardo y derivadas (`lag_1h` a `lag_24h`, `lag_48h`, `lag_7d`, `lag_14d`, `diff_1h`, `diff_2h`, `diff_24h`, `diff_7d`, `acceleration_1h`) y estadísticos de ventana (`ema_4step`, `ema_12step`, `rolling_std_4step`, `rolling_mean_24h`, `rolling_std_24h`, `rolling_min_24h`, `rolling_max_24h`, `rolling_mean_7d`, `rolling_std_7d`). La model card describe el conjunto como leakage-safe, es decir, construido evitando la fuga de información futura hacia el momento de la predicción. No se menciona el uso de RLHF, DPO ni ningún otro método de alineación, algo esperable en un modelo de regresión tabular.

## Capacidades

- Predicción de demanda eléctrica en MW con resolución de 15 minutos para la zona de puja de Portugal (PT).
- Predicción puntual mediante el cuantil P50, utilizable como estimación central de carga.
- Estimación de incertidumbre mediante intervalo de predicción del 80% (P10 a P90) con calibración conformal y garantía de monotonicidad entre cuantiles.
- Modelado de estacionalidad múltiple: intradía (hora y cuarto de hora), semanal (`day_of_week`, `is_weekend`), anual (`day_of_year`, `month`) y de calendario laboral (`is_holiday`, picos de mañana y tarde).
- Captura de dinámica de corto plazo mediante lags, diferencias, aceleración y medias móviles exponenciales.
- Captura de dinámica de medio plazo mediante lags de 7 y 14 días y estadísticos rolling de 24 horas y 7 días.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento: es un regresor tabular sin interfaz conversacional.
- No tiene capacidades multilingües en el sentido de procesamiento de lenguaje; los tags `en` y `pt` corresponden a los idiomas en que está escrita la documentación.

## Casos de uso

- Planificación de carga de red (day-ahead load planning): el modelo genera previsiones cada 15 minutos para el día siguiente con su intervalo de incertidumbre, lo que permite a un operador dimensionar reservas de generación y evaluar el riesgo asociado a cada nivel de demanda previsto.
- Analítica de mercado energético: la predicción de demanda se puede cruzar con los precios day-ahead para estudiar la relación entre carga y precio, o alimentar modelos de previsión de precio como variable exógena.
- Dimensionamiento de almacenamiento y baterías: el intervalo P10-P90 ayuda a acotar el rango de carga esperada y a definir estrategias de carga y descarga con criterios de riesgo, en lugar de trabajar solo con la predicción puntual.
- Investigación académica y benchmarking: sirve como baseline de gradient boosting bien calibrado contra el que comparar métodos secuenciales (SARIMAX, Prophet, N-HiTS, TFT u otros) sobre la misma zona y el mismo dataset de ENTSO-E.
- Detección de anomalías en la red: comparar la demanda observada con las bandas P10-P90 permite señalar desviaciones significativas (caídas por eventos, picos no previstos) como señal de alerta para revisión humana.
- Comercialización y gestión de carteras de renovables: disponer de una curva de demanda prevista con incertidumbre cuantificada facilita la planificación de coberturas y el análisis de desvíos respecto a la posición comprometida.
- Simulaciones y docencia: el repositorio incluye un ejemplo mínimo de inferencia en Python, lo que lo hace adecuado para ilustrar un flujo completo de forecasting energético con validación temporal y calibración conformal.
- Integración en pipelines MLOps: al ser un artefacto `joblib` de tamaño reducido y con inferencia en CPU, puede desplegarse como servicio ligero (por ejemplo, un endpoint FastAPI) y reentrenarse periódicamente conforme lleguen nuevos datos de ENTSO-E.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card. Ninguno está marcado como verificado (`verified: false`), por lo que deben tratarse como cifras autodeclaradas y no replicadas de forma independiente.

| Métrica | Valor | Verificado |
|---|---|---|
| MAE | 45,528 MW | No |
| RMSE | 90,863 MW | No |
| Cobertura empírica del intervalo (nominal 80%) | 78,4% | No |
| WAPE | 0,72% | No |
| Pinball loss P10 | 33,950 | No |
| Pinball loss P90 | 14,355 | No |
| Winkler score | 483,052 | No |

Comparación declarada por el autor frente al baseline de persistencia estacional de 7 días:

| Métrica | LightGBM forecaster | Persistencia estacional 7 días | Mejora |
|---|---:|---:|---:|
| MAE | 45,528 MW | 716,312 MW | +93,6% |
| RMSE | 90,863 MW | No disponible | No disponible |

Contexto indicado en la model card: el objetivo de cobertura del intervalo P10-P90 es la banda 75-85%, y el valor obtenido (78,4%) se sitúa dentro de esa banda aunque ligeramente por debajo del nominal del 80%. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, algo esperable al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM necesaria: ninguna. LightGBM realiza inferencia en CPU; no se requiere GPU en ningún escenario.
- Memoria RAM: no disponible de forma explícita. El repositorio ocupa 0,0 GB según HuggingFace, por lo que el artefacto `models.joblib` (tres modelos cuantílicos sobre 96.665 muestras y 37 features) es de tamaño reducido y se carga íntegramente en el proceso de Python.
- GPU recomendadas: no aplica. No se documenta ningún backend de aceleración por GPU.
- Compatibilidad con hardware de consumo: sí, cualquier máquina capaz de ejecutar Python y LightGBM (portátil convencional, servidor pequeño o instancia cloud de gama baja) puede servir el modelo.
- Opciones de despliegue: la model card solo documenta la descarga del artefacto con `hf_hub_download` y su carga con `joblib.load()`, seguida de llamadas a `models[q].predict(X)`. No se mencionan vLLM, llama.cpp, Ollama, TGI ni ninguna otra plataforma de servicio, ya que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card no publica tiempos de inferencia ni capacidad de procesamiento por segundo.

## Comparativa con modelos similares

No se han identificado en la información proporcionada otras fichas de modelos comparables publicadas para la misma tarea y zona. La única referencia cuantitativa disponible es el baseline incluido por el propio autor.

| Modelo | Tipo | MAE (MW) | Cobertura del intervalo | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| `nesoai/portugal-electricity-demand-forecaster` | LightGBM cuantílico con calibración conformal | 45,528 | 78,4% (nominal 80%) | Apache 2.0 | HuggingFace |
| Persistencia estacional de 7 días | Baseline naive | 716,312 | No disponible | No aplica | Definido por el autor |
| Otros modelos publicados de forecasting de demanda por zona | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

## Limitaciones y advertencias

- Todas las métricas están autodeclaradas y marcadas como no verificadas (`verified: false`); no hay paper, revisión por pares ni replicación independiente en la información disponible.
- La cobertura empírica del intervalo (78,4%) queda por debajo del nivel nominal del 80%, por lo que el intervalo P10-P90 está ligeramente subcubierto. Es aceptable dentro de la banda objetivo 75-85% declarada, pero conviene tenerlo en cuenta en decisiones sensibles al riesgo.
- El ámbito es exclusivamente la zona de puja de Portugal (PT). No es directamente extrapolable a otras zonas o países sin reentrenamiento.
- La calidad de las predicciones depende de la disponibilidad y puntualidad de los datos de ENTSO-E. Features como `lag_1h` o `diff_1h` exigen la observación del intervalo previo, lo que limita el horizonte operativo real y hace crítico el tratamiento de huecos y retardos en la publicación de datos.
- Requiere reproducir exactamente las 37 features documentadas, con la misma lógica leakage-safe y el mismo orden de columnas. Cualquier cambio en la ingeniería de features invalida la calibración conformal y las bandas de incertidumbre.
- La feature `is_holiday` depende de un calendario de festivos portugueses correctamente mantenido; errores en ese calendario afectan directamente a los picos de demanda en días no laborables.
- Riesgo de degradación ante cambios estructurales del sistema eléctrico: electrificación de la demanda, entrada o salida de generación, cambios de hábitos o eventos extraordinarios no representados en el periodo de entrenamiento 2023-2026.
- La propia model card restringe el uso a investigación, analítica de mercado, planificación de carga y demostraciones educativas, y declara explícitamente que el modelo es solo orientativo y no está destinado a la ejecución automática de operaciones de trading ni al despacho de red en tiempo real.
- La licencia del modelo es Apache 2.0 y permite uso comercial, pero los datos de origen proceden de la plataforma ENTSO-E y quedan sujetos a sus propias condiciones de atribución y uso.
- No aplican sesgos de tipo lingüístico, pero sí posibles sesgos de representatividad temporal si el periodo de entrenamiento no cubre condiciones anómalas (crisis de precios, restricciones de red, fenómenos meteorológicos extremos).
- Ausencia de parámetros publicados (número de árboles, hojas, profundidad, hiperparámetros): dificulta la reproducibilidad del entrenamiento y la estimación precisa de recursos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nesoai/portugal-electricity-demand-forecaster
- Dataset de entrenamiento: https://huggingface.co/datasets/hsilvosa/entsoe-day-ahead
- ENTSO-E Transparency Platform: https://transparency.entsoe.eu/
- Paper, repositorio de código, demo o blog adicional: no disponible en la información proporcionada.
