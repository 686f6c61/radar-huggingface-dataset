# MuhammadSarimUmer/next-day-pm25-forecaster

## Resumen

El Next-Day PM2.5 Forecaster es un modelo de regresión tabular para la predicción de concentración de PM2.5 a 24 horas vista en las ciudades paquistaníes de Karachi y Lahore. Lo desarrolla el equipo formado por Muhammad Sarim Umer, Khubsoorat Shklen, Muhammad Feras Malik y Muhammad Ahmed Khan en el marco de un proyecto de la asignatura CT-378 Machine Learning del Departamento de Ciencias de la Computación de la NED University. No es un modelo de lenguaje ni una red neuronal: es un pipeline de scikit-learn serializado en formato joblib que combina un modelo lineal regularizado, un bosque aleatorio y un modelo de gradient boosting (LightGBM).

El modelo resuelve un problema de contaminación atmosférica con relevancia sanitaria directa: Lahore sufre episodios de smog extremo durante los meses de invierno, con picos que superan los 150 µg/m³, y la capacidad de anticipar la calidad del aire del día siguiente permite emitir avisos de salud pública con antelación. El pipeline toma 39 características derivadas de series temporales de PM2.5 (lags, medias móviles, derivadas), variables meteorológicas de Open-Meteo, un índice de estancamiento atmosférico y variables de calendario, y devuelve una predicción cuantitativa en µg/m³ que además se mapea a las categorías de salud del índice AQI de la EPA estadounidense.

El modelo es relevante como referencia abierta para pronóstico de calidad del aire a corto plazo en regiones con datos de sensores de bajo coste, y como ejemplo de ingeniería de características aplicada a series temporales medioambientales. Su licencia MIT y su tamaño reducido (repo de 0.0 GB) lo hacen trivialmente desplegable en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble híbrido: Ridge (L2, α=10.0) + Random Forest (120 estimadores, profundidad 12) + LightGBM (300 estimadores, 45 hojas, lr=0.03) |
| Parametros totales | No disponible (modelo tabular; el número de parámetros depende de los árboles y coeficientes, no se reporta) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana de entrada de 39 características con lags de hasta 168 h (7 días) |
| Tipos de cuantizacion | No aplica; serialización joblib del pipeline completo |
| Idiomas soportados | en (metadatos); el modelo no procesa texto |
| Licencia | MIT |
| Formato de pesos | joblib (`final_pipeline.joblib`) |

## Arquitectura y entrenamiento

El pipeline se compone de tres estimadores entrenados sobre el mismo conjunto de 39 características y combinados en un ensemble de mezcla (blending). El componente lineal (Ridge con α=10.0) aporta predicciones estables de baja varianza; el Random Forest con 120 árboles y profundidad máxima 12 captura umbrales y particiones no lineales; y LightGBM con 300 estimadores, 45 hojas y tasa de aprendizaje 0.03 corrige secuencialmente los residuos. El preprocesamiento se implementa con un `ColumnTransformer` que aplica `StandardScaler` a las columnas numéricas y `OneHotEncoder` al identificador de ciudad.

Las características de entrada incluyen PM2.5 actual y lags a 1, 3, 6, 12, 24 y 168 horas; agregaciones móviles (medias a 6, 24 y 72 h, mínimo/máximo/desviación típica a 24 h); indicadores de momento y físicos (velocidad a 3 h, cambio a 6 y 24 h, aceleración como segunda derivada); variables meteorológicas de Open-Meteo en el instante t (temperatura, humedad, presión superficial, velocidad y dirección del viento, precipitación, cobertura nubosa); un índice de estancamiento atmosférico definido como (1/velocidad del viento) × (humedad relativa/100); una curva estacional de quema de rastrojos en Punjab y riesgo de smog invernal específico por ciudad; y ciclos de calendario y diurnos (seno y coseno de la hora, día de la semana, mes, indicador de invierno).

El entrenamiento utiliza 24.599 observaciones horarias recogidas de 28 monitores de suelo (12 en Karachi, 16 en Lahore) vía OpenAQ con sensores AirGradient, emparejadas con la API histórica de Open-Meteo. La división es cronológica estricta 70/15/15 con un hueco de purga de 24 horas para evitar fuga temporal de etiquetas, y no se emplean datos meteorológicos futuros en el momento de la predicción (cero fuga de clima futuro). No se reporta uso de RLHF, DPO ni técnicas de alineación, al no ser un modelo generativo.

## Capacidades

- Predicción cuantitativa de concentración de PM2.5 a 24 horas vista en µg/m³ para Karachi y Lahore.
- Mapeo de la predicción cuantitativa a las seis categorías de salud del índice AQI de la EPA (Good, Moderate, Unhealthy for Sensitive Groups, Unhealthy, Very Unhealthy, Hazardous).
- Generación de avisos de salud pública accionables a partir de la categoría AQI predicha.
- Modelado de dinámica temporal mediante lags (1, 3, 6, 12, 24, 168 h), medias móviles (6, 24, 72 h), derivadas de primer y segundo orden.
- Incorporación de meteorología observada en t y en las 24 horas previas (temperatura, humedad, presión, viento, precipitación, nubosidad).
- Codificación de estacionalidad local: curva de quema de rastrojos en Punjab y riesgo de smog invernal por ciudad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales (visión, audio); no es un modelo de lenguaje.

## Casos de uso

- Avisos de salud pública con antelación: el modelo entrega una categoría AQI para el día siguiente que permite a autoridades locales emitir recomendaciones (mascarillas, restricción de actividad al aire libre, cierre de colegios) con 24 horas de margen, especialmente útil en Lahore durante episodios de smog invernal.
- Planificación de actividad física y deporte al aire libre: aplicaciones de salud pueden consumir la predicción y recomendar ventanas horarias o ubicaciones con menor exposición, usando el desglose por ciudad y la categoría AQI.
- Gestión de turnos en sectores expuestos: empresas de construcción, reparto o agricultura pueden planificar la exposición de sus trabajadores según el AQI previsto, reduciendo la exposición a PM2.5 en picos.
- Investigación en calidad del aire: el pipeline sirve como baseline reproducible (con división cronológica y purga de 24 h) para comparar nuevos modelos de pronóstico de PM2.5 en el sur de Asia.
- Integración en dashboards medioambientales: al ser un pipeline joblib de tamaño reducido, se puede cargar en un servicio Python ligero y servir predicciones por API REST para paneles públicos o municipales.
- Educación y docencia: el repositorio documenta de forma explícita la ingeniería de características, el esquema de validación temporal y las métricas por ciudad, lo que lo convierte en un ejemplo didáctico de proyecto de ML aplicado.
- Alertas tempranas en sensores de bajo coste: el modelo se entrenó con datos de AirGradient, por lo que encaja en despliegues con redes densas de sensores de bajo coste donde no hay estaciones regulatorias.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Evaluación sobre el conjunto de test cronológico de 3.678 muestras (15 de agosto – 31 de octubre).

| Metrica | Baseline persistencia 24 h | Ensemble final | Mejora relativa |
|---|---:|---:|---:|
| MAE global (µg/m³) | 14.64 | 13.21 | +9.7% |
| RMSE global (µg/m³) | 27.17 | 23.43 | +13.8% |
| R² global | 0.5765 | 0.6762 | +0.0997 |
| Exactitud categoría EPA AQI (%) | 69.83 | 71.83 | +2.0 pp |

Desglose por ciudad:

| Ciudad | MAE test (µg/m³) | RMSE test (µg/m³) | R² test | Exactitud EPA AQI (%) | Exactitud dentro de ±1 categoría (%) |
|---|---:|---:|---:|---:|---:|
| Karachi | 6.15 | 9.26 | 0.7405 | 82.44 | 99.84 |
| Lahore | 20.27 | 31.82 | 0.5735 | 61.23 | 96.41 |

En Lahore, el R² supera al baseline de persistencia 24 h (0.4542) en +0.1193 (+26% relativo en varianza explicada). Los picos severos de smog (>150 µg/m³) se detectan con una precisión del 65.6% y un recall del 63.0%.

## Requisitos de hardware

- VRAM: no aplica; el modelo es un pipeline tabular serializado en joblib, sin requisitos de GPU.
- CPU: suficiente cualquier CPU moderna; la inferencia es una evaluación de árboles y una combinación lineal sobre 39 características.
- GPU recomendadas: no aplica; no se requiere GPU para inferencia.
- Cabe en cualquier consumer GPU o incluso en un entorno sin GPU (portátil, contenedor pequeño, función serverless).
- Opciones de despliegue: `joblib.load` en Python con scikit-learn y LightGBM instalados; servicio FastAPI/Flask; integración en pipelines de datos con pandas; no aplica vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo (evaluación de árboles sobre 39 features) se espera latencia de milisegundos por predicción en CPU, aunque no se aporta medición.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, los baselines habituales en pronóstico de PM2.5 a 24 h son la persistencia (usada como baseline en la propia model card), modelos ARIMA/SARIMA y redes LSTM o Transformer temporales; sin embargo, no se aportan métricas de estos modelos sobre el mismo conjunto de test, por lo que no es posible una comparación numérica rigurosa.

| Modelo | Tipo | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|
| Next-Day PM2.5 Forecaster | Ensemble tabular (Ridge + RF + LightGBM) | Lags hasta 168 h, 39 features | MIT | Hugging Face + GitHub + Space |
| Baseline de persistencia 24 h | Regla trivial | Valor actual de PM2.5 | No aplica | Referencia en la model card |
| Modelos alternativos (ARIMA, LSTM) | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Regresión hacia la media: en picos altos de contaminación en Lahore (>125.4 µg/m³) el modelo tiende a infravalorar los máximos, con un sesgo medio de −33.4 µg/m³, debido a la penalización de las pérdidas MSE y MAE sobre el conjunto anual.
- Calidad del sensor: las observaciones provienen de sensores de bajo coste AirGradient agregados a nivel de ciudad; son adecuadas para avisos públicos pero no para cumplimiento regulatorio.
- Cobertura geográfica limitada: el modelo solo está entrenado para Karachi y Lahore; no se garantiza su validez en otras ciudades o regiones sin reentrenamiento.
- Dependencia de datos externos: requiere las 39 características de entrada en el momento de la predicción, incluyendo meteorología de Open-Meteo y lags históricos de PM2.5; la ausencia o el retraso de estos datos degrada o impide la predicción.
- Ventana temporal de evaluación corta: el test cubre del 15 de agosto al 31 de octubre; el comportamiento en otros periodos estacionales (por ejemplo, verano o episodios de quema de rastrojos fuera de la ventana) no está documentado.
- Sin verificación independiente: las métricas están declaradas por el autor con `verified: false` en el model-index; no han sido replicadas por terceros.
- Licencia MIT: permite uso comercial y modificación con atribución; no obstante, el uso en contextos regulatorios o de salud pública debe acompañarse de validación local y de una fuente de datos de calidad.
- No es un modelo de lenguaje: no procesa texto libre, no soporta tool calling ni agentes, y no debe presentarse como tal en integraciones.

## Enlaces

- Hugging Face: https://huggingface.co/MuhammadSarimUmer/next-day-pm25-forecaster
- Repositorio GitHub: https://github.com/MuhammadSarimUmer/Next-DayAir-Quality-PM2.5-Forecaster
- Demo en Hugging Face Space: https://huggingface.co/spaces/MuhammadSarimUmer/next-day-air-quality-forecaster
- Dataset OpenAQ: https://openaq.org
- API histórica Open-Meteo: https://open-meteo.com
