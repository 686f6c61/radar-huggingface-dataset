# priyanshuchawda/delhi-aircast-historical-pm25

## Resumen

Delhi AirCast es un conjunto de cinco regresores XGBoost de horizonte directo que predicen la concentración de PM2.5 (µg/m³) a nivel de estación en Delhi con horizontes de 1, 3, 6, 12 y 24 horas. No es un modelo de lenguaje ni una red neuronal: es un conjunto de árboles gradient-boosted entrenados sobre un panel tabular de 684.216 filas estación-hora procedentes de 39 estaciones de la red CPCB/OpenCity de Delhi, cubriendo del 1 de enero de 2024 al 31 de diciembre de 2025.

El autor es priyanshuchawda y el repositorio se publica como artefacto de investigación histórico, no como servicio en vivo. Los pesos no consultan observaciones actuales ni meteorología: la predicción depende exclusivamente de la fila de características puntual que se suministre en inferencia. El modelo predice concentración de PM2.5, no el AQI compuesto oficial del CPCB.

Su relevancia es metodológica: ofrece un contrato de características explícito, separación cronológica de datos (entrenamiento previo al 2025-10-01, validación julio-septiembre de 2025, test del 2025-10-01 al 2025-12-31) y comparación contra una línea base de persistencia, con ganancias de MAE del 17,4% a 1 h y del 40,3% a 12 h. El repositorio tiene 0 descargas y 1 like, y no declara licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles de decisión (XGBoost, `XGBRegressor`, método de histogramas) |
| Parametros totales | no disponible (350 estimadores, profundidad 8; el número de hojas/nodos no se publica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de características puntual en el momento de emisión, con cinco artefactos independientes para horizontes de 1, 3, 6, 12 y 24 horas |
| Tipos de cuantizacion | no aplica (no es una red neuronal); los pesos se publican en formato nativo UBJSON de XGBoost |
| Idiomas soportados | no disponible (modelo numérico tabular; no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | UBJSON de XGBoost (`model_1h.ubj`, `model_3h.ubj`, `model_6h.ubj`, `model_12h.ubj`, `model_24h.ubj`) más ficheros `*_metadata.json` y `config.json`; no se publican ficheros pickle ni Joblib |

## Arquitectura y entrenamiento

Cada artefacto es un `XGBRegressor` independiente con objetivo de error cuadrático, 350 estimadores, profundidad máxima 8, tasa de aprendizaje 0,05, submuestreo de filas 0,9, submuestreo de columnas 0,85, peso mínimo de hijo 8, regularización L2 de 2,0, método de histogramas y semilla aleatoria 42. Es un enfoque de horizonte directo: no se encadena la predicción de 1 h para obtener la de 24 h, sino que cada horizonte tiene su propio modelo y su propio contrato de columnas.

El panel de entrenamiento procede de los informes horarios de calidad del aire de Delhi de OpenCity (basados en la red CPCB) y combina características de contaminantes, meteorología, composición atmosférica, historial de incendios y vecinos espaciales, con ingeniería de características consciente del tiempo. La partición es cronológica: observaciones elegibles anteriores al 2025-10-01 para ajuste, julio-septiembre de 2025 como intervalo de validación para el desarrollo y el tramo del 2025-10-01 al 2025-12-31 como cola de test. Los artefactos finales se reajustan sobre todos los datos elegibles previos al test. Cada `*_metadata.json` documenta el contrato ordenado de columnas, el horizonte, la codificación de estación, el intervalo de ajuste y la política point-in-time. No hay RLHF ni DPO: es aprendizaje supervisado sobre datos tabulares.

## Capacidades

- Regresión tabular de horizonte directo para concentración de PM2.5 en µg/m³ a 1, 3, 6, 12 y 24 horas.
- Predicción a nivel de estación para 39 estaciones de Delhi, con codificación de estación incluida en el contrato de características.
- Integración de múltiples familias de features: contaminantes horarios, meteorología, composición atmosférica, historial de incendios y vecinos espaciales.
- Inferencia determinista a partir de una única fila de características puntual; admite lotes si se construye una matriz con las mismas columnas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No tiene capacidades multilingües, de visión ni de audio.
- No incluye modo de pensamiento ni decodificación especulativa.
- Reproducibilidad: el repositorio incluye `notebook.ipynb` con un flujo guiado de carga y predicción, y `evaluation_metrics.json` con métricas y metadatos de partición.

## Casos de uso

- Evaluación comparativa de baselines en investigación atmosférica: sirve como referencia de gradient boosting frente a modelos de persistencia, ARIMA o redes recurrentes en estudios de predicción de PM2.5 a corto plazo, gracias a que el repositorio publica particiones cronológicas y métricas exactas.
- Docencia y cursos de series temporales: el par `notebook.ipynb` más los metadatos permiten reproducir el pipeline completo de ingeniería de características y evaluar la degradación del MAE al aumentar el horizonte.
- Reproducibilidad de resultados publicados: `evaluation_metrics.json` incluye recuentos exactos y metadatos de partición, lo que permite auditar la comparación frente a la línea base de persistencia.
- Prototipado offline de sistemas de alerta temprana: con una fila de features construida a partir de observaciones históricas, se puede simular cómo habría funcionado una alerta de PM2.5 a 6-12 horas vista.
- Análisis de episodios de contaminación: el horizonte de 12 h presenta la mayor ganancia sobre persistencia (40,3%), útil para estudiar episodios de acumulación nocturna frente a la hipótesis ingenua de concentración constante.
- Estudio de la contribución de features: al ser árboles con contrato de columnas explícito, permite experimentar con subconjuntos de variables (meteorología, fuegos, vecinos espaciales) y medir el impacto en MAE.
- Generación de datasets sintéticos de evaluación: el modelo puede etiquetar filas históricas para construir conjuntos de prueba en proyectos de predicción de calidad del aire en Delhi.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre la cola de test cronológica (2025-10-01 a 2025-12-31). MAE y RMSE en µg/m³; R² adimensional. La persistencia predice la concentración futura como el último valor de PM2.5 disponible en el momento de emisión.

| Horizonte | Filas de test | MAE persistencia | MAE XGBoost | Ganancia de MAE | RMSE XGBoost | R² XGBoost |
|---:|---:|---:|---:|---:|---:|---:|
| 1 h | 82.419 | 22,69 | 18,75 | 17,4% | 30,32 | 0,927 |
| 3 h | 81.854 | 47,71 | 35,07 | 26,5% | 53,73 | 0,770 |
| 6 h | 81.438 | 69,95 | 43,89 | 37,3% | 66,92 | 0,646 |
| 12 h | 80.958 | 84,70 | 50,54 | 40,3% | 76,00 | 0,546 |
| 24 h | 80.423 | 58,32 | 55,74 | 4,4% | 81,38 | 0,477 |

El propio autor advierte que la cola de test se usó en comparaciones previas del proyecto, por lo que estas cifras deben tratarse como resultados de evaluación del proyecto y no como un benchmark independiente prístino. No se han publicado comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks estándar de modelos de lenguaje, porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM para inferencia: no aplica. Es un modelo de árboles que se ejecuta en CPU sin acelerador; no requiere memoria de GPU.
- GPU recomendadas: ninguna imprescindible. XGBoost puede usar GPU (CUDA) si se configura explícitamente, pero para una predicción de fila única no aporta ventaja práctica.
- Cabe en cualquier GPU consumer y en cualquier CPU: el tamaño del repositorio se declara como 0.0 GB, lo que implica artefactos de pocos megabytes por horizonte.
- Opciones de despliegue: carga nativa con la librería `xgboost` (`model.load_model`), descarga vía `huggingface_hub`, manipulación de features con `pandas` y ejecución en cuadernos tipo Colab o Kaggle. vLLM, llama.cpp, Ollama y TGI no aplican porque son servidores de inferencia para modelos de lenguaje.
- Latencia y throughput estimados: no disponible. La latencia depende del tiempo de construcción de la fila de features, que el repositorio no incluye.

## Comparativa con modelos similares

Comparación con la alternativa incluida en la propia evaluación y con enfoques habituales de la misma tarea. Los datos de las alternativas no están publicados en la información disponible.

| Modelo | Parametros | Contexto | Rendimiento en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Delhi AirCast (XGBoost, 5 horizontes) | no disponible (350 árboles, profundidad 8) | ventana puntual, horizontes 1-24 h | MAE 18,75-55,74 µg/m³; R² 0,477-0,927 | no disponible | HuggingFace, 0 descargas, 1 like |
| Persistencia (baseline del propio informe) | 0 | último valor observado | MAE 22,69-84,70 µg/m³ | no aplica | incluida en `evaluation_metrics.json` |
| ARIMA/SARIMA por estación | no disponible | no disponible | no disponible | no aplica | implementación propia |
| LSTM o Transformer de series temporales | no disponible | no disponible | no disponible | no aplica | implementación propia |
| Prophet o modelos de suavizado estacional | no disponible | no disponible | no disponible | no aplica | librería de código abierto |

## Limitaciones y advertencias

- Riesgo de alucinación: no aplica, ya que no genera texto; el riesgo equivalente es una predicción errónea cuando la fila de entrada no respeta la distribución de entrenamiento.
- Artefacto histórico, no servicio en vivo: los pesos no descargan observaciones ni meteorología actuales. La predicción es tan actual como la fila de features suministrada.
- Predice concentración de PM2.5, no el AQI compuesto oficial del CPCB, y no debe usarse como aviso sanitario ni como medición reglamentaria.
- No realiza interpolación a escala de barrio: el modelo es a nivel de estación y no cubre ubicaciones sin monitor.
- El periodo de evaluación histórico no establece precisión sobre condiciones actuales ni sobre ubicaciones no monitorizadas; el desplazamiento de distribución (deriva) no está cuantificado.
- La cola de test se utilizó en comparaciones previas del proyecto, por lo que las métricas no son un benchmark independiente prístino.
- La estación `site_106` no tiene coordenada verificada en el registro de estaciones de origen; no debe inferirse su ubicación a partir de este modelo.
- Los pesos por sí solos no aportan las observaciones ni las features: es obligatorio reproducir la misma ingeniería de características y los mismos identificadores de estación que en entrenamiento.
- Licencia no disponible: no se concede explícitamente ningún derecho de uso comercial; en ausencia de licencia, el uso en producción conlleva riesgo legal.
- Idiomas no disponibles: el modelo no procesa texto ni entrada lingüística de ningún tipo.
- Sesgos potenciales: cobertura desigual de la red de 39 estaciones y dependencia de la calidad del registro CPCB/OpenCity; no se documenta un análisis de sesgo por zona o estrato socioeconómico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/priyanshuchawda/delhi-aircast-historical-pm25
- Dataset primario de entrenamiento, OpenCity Delhi Hourly Air Quality Reports: https://data.opencity.in/dataset/delhi-hourly-air-quality-reports
- Documentación de XGBoost: no disponible en la información proporcionada
- Repositorio de código asociado: no disponible
- Paper o blog del autor: no disponible
- Demo en vivo: no disponible

Nota: la búsqueda web realizada no devolvió resultados relacionados con este modelo, por lo que no se han podido incorporar enlaces adicionales a papers, repositorios o demos.
