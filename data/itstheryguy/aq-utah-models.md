# itstheryguy/aq-utah-models

## Resumen

`aq-utah-models` es una colección de tres modelos de predicción de calidad del aire publicada por el usuario itstheryguy en Hugging Face. El repositorio agrupa los modelos "campeones" de un pipeline de reentrenamiento semanal con puerta de promoción, cuyo objetivo es pronosticar la concentración horaria de PM2.5 (µg/m³) en los monitores regulatorios del estado de Utah a 24, 48 y 72 horas vista. No se trata de un modelo de lenguaje, sino de un artefacto de series temporales empaquetado como modelo pyfunc de MLflow.

La colección contiene tres aproximaciones con filosofías distintas: un conjunto de modelos LightGBM con objetivo Tweedie (uno por horizonte), una red GRU entrenada desde cero en PyTorch que consume las últimas 72 horas como secuencia y emite tres salidas, y una regresión Ridge por horizonte sobre cinco variables. Todos comparten la misma tabla de características de entrada (`gold_features`), lo que permite compararlos de forma directa bajo una misma puerta de evaluación.

Su relevancia es operativa más que de investigación: los pronósticos se publican de forma periódica en un dataset y se muestran en un Space de Hugging Face. El interés técnico reside en el diseño del sistema (MLflow pyfunc, puerta de promoción por MAE en 28 días recientes, backtest de un año) y en la transparencia de sus limitaciones, en particular la incapacidad de predecir picos por incendios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres variantes: LightGBM (gradient boosting, objetivo Tweedie, un modelo por horizonte); GRU en PyTorch (secuencia de 72 h, tres salidas); Ridge regression por horizonte (5 entradas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de entrada de 72 horas en la variante GRU |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; los artefactos son modelos serializados de scikit-learn/LightGBM/PyTorch) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | Modelo pyfunc de MLflow: fichero `MLmodel`, artefactos bajo `artifacts/` y código bajo `code/`; incluye artefactos joblib, LightGBM y PyTorch |

## Arquitectura y entrenamiento

Las tres variantes comparten el mismo esquema de características: filas por estación-hora de la tabla `gold_features`, con PM2.5 y NO₂ recientes, estadísticas móviles, una media regional, variables de calendario y pronósticos meteorológicos tal como se emitieron con 1 a 3 días de antelación (Open-Meteo, modelo `gfs_seamless`), incluido un proxy de inversión térmica calculado como temperatura de valle menos temperatura de cresta. La variante LightGBM usa un modelo potenciado por gradientes por horizonte con objetivo Tweedie; la GRU consume las últimas 72 horas como secuencia y produce tres salidas; la Ridge usa cinco entradas (PM2.5 actual, media de 24 h, inversión pronosticada, viento y precipitación).

Los datos de entrenamiento cubren desde el 22 de enero de 2024 en adelante: histórico de PM2.5 y NO₂ de AirNow vía OpenAQ (excluyendo las horas retiradas por la revisión de calidad de la EPA en AirData), el feed en vivo de Utah DAQ a partir de entonces y pronósticos de Open-Meteo mediante la API de ejecuciones previas. En total, 26 estaciones y aproximadamente 635 000 estación-horas. El sistema reentrena semanalmente y solo promociona una nueva versión si supera al campeón anterior en MAE sobre los 28 días más recientes con etiquetas, un conjunto en el que ninguno de los dos ha sido entrenado. No se documenta uso de RLHF ni de ajuste por preferencias, algo esperable en un modelo de regresión.

## Capacidades

- Pronóstico de PM2.5 horario a 24, 48 y 72 horas para 26 estaciones de Utah.
- Emisión conjunta de los tres horizontes en una sola llamada (`pred_t24`, `pred_t48`, `pred_t72`).
- Consumo de pronósticos meteorológicos exógenos (viento, precipitación, inversión térmica) tal como se emitieron con antelación.
- Integración con MLflow: carga mediante `mlflow.pyfunc.load_model` y predicción sobre lotes de filas de `gold_features`.
- Tres alternativas de modelado intercambiables bajo la misma interfaz de entrada, lo que facilita la comparación y el respaldo.
- Ejecución en lote periódica, con publicación automatizada de resultados en un dataset y un Space.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio; no es un modelo generativo.

## Casos de uso

- Publicación de pronósticos de calidad del aire: el pipeline carga el campeón con MLflow, predice sobre las filas más recientes de `gold_features` y publica los resultados en `itstheryguy/aq-utah-forecasts`, que alimenta el Space público de pronóstico de PM2.5 de Utah.
- Avisos sanitarios anticipados: con horizontes de 24 a 72 horas, los gestores de salud pública pueden emitir recomendaciones para población sensible con margen suficiente para activar protocolos, usando el MAE del backtest (2,50–2,80 µg/m³) como referencia de incertidumbre típica.
- Planificación de actividades al aire libre: aplicaciones o paneles que consulten el dataset de pronósticos pueden mostrar a los ciudadanos la evolución esperada de PM2.5 por estación y día.
- Investigación en contaminación atmosférica: el backtest de un año (noviembre de 2025 a octubre de 2026) y la separación por estación e invierno/verano permiten analizar el comportamiento del modelo como referencia en estudios de exposición.
- Evaluación de modelos meteorológicos y de calidad del aire: la comparación interna entre LightGBM, GRU y Ridge bajo una misma puerta de promoción sirve como línea base reproducible para probar nuevas arquitecturas o nuevas variables exógenas.
- Monitorización de deriva del sistema: la puerta de promoción semanal actúa como detector de degradación; si ninguna versión nueva supera al campeón, el sistema mantiene la anterior, lo que ofrece una señal operativa sobre cambios en la distribución de los datos.
- Docencia y prototipado de MLOps: el repositorio de código (`aq_utah_project`) y el empaquetado pyfunc de MLflow sirven como ejemplo completo de entrenamiento, evaluación con puerta, registro y despliegue en lote.

## Benchmarks y rendimiento

Puerta de promoción (MAE en µg/m³ sobre los 28 días más recientes con etiquetas, no usados en entrenamiento):

| Modelo | Versión | Entrenado hasta | 24 h | 48 h | 72 h |
|---|---|---|---|---|---|
| LightGBM | v1 | 2026-10-02 | 1,83 | 1,80 | 1,90 |
| GRU | v2 | 2026-10-06 | 1,85 | 1,95 | 2,14 |
| Ridge (5 entradas) | v2 | 2026-10-06 | 2,08 | 2,28 | 2,37 |
| Persistencia | — | — | 2,44 / 2,52 | 2,93 / 2,96 | 3,19 / 3,23 |

Backtest (entrenado hasta octubre de 2025, evaluado de noviembre de 2025 a octubre de 2026, todas las estaciones, MAE en µg/m³):

| Modelo | 24 h | 48 h | 72 h | Invierno 72 h | Verano 72 h |
|---|---|---|---|---|---|
| Persistencia | 3,30 | 3,80 | 4,07 | 5,20 | 4,89 |
| LightGBM | 2,50 | 2,66 | 2,80 | 3,19 | 3,74 |
| GRU | 2,57 | 2,67 | 2,78 | 3,05 | 3,70 |
| Ridge (5 entradas) | 2,78 | 3,02 | 3,11 | 4,00 | 3,84 |

## Requisitos de hardware

- Inferencia en CPU: las tres variantes son ligeras (LightGBM y Ridge son modelos tabulares; la GRU es una red recurrente pequeña), por lo que no requieren GPU para el modo de ejecución en lote descrito en la model card.
- VRAM estimada: no disponible; no se documentan requisitos de memoria ni tamaño de los artefactos (el repositorio figura con 0,0 GB).
- GPU recomendadas: no disponibles; no se especifica ninguna.
- Compatibilidad con GPU de consumo: previsiblemente sí para la variante GRU, aunque el autor no lo documenta.
- Opciones de despliegue: MLflow (`mlflow.pyfunc.load_model`) como vía oficial; el código de entrenamiento está en el repositorio de GitHub del proyecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos comparables de pronóstico de PM2.5 en la documentación proporcionada. La comparación interna entre las tres variantes del propio repositorio es la única referencia disponible:

| Criterio | LightGBM (v1) | GRU (v2) | Ridge (v2) |
|---|---|---|---|
| Tipo | Gradient boosting tabular | Red recurrente | Regresión lineal |
| MAE backtest 72 h | 2,80 | 2,78 | 3,11 |
| MAE invierno 72 h | 3,19 | 3,05 | 4,00 |
| MAE verano 72 h | 3,74 | 3,70 | 3,84 |
| Licencia | MIT | MIT | MIT |
| Formato | MLflow pyfunc | MLflow pyfunc | MLflow pyfunc |

## Limitaciones y advertencias

- Los picos no se predicen: en horas con PM2.5 ≥ 35,5 µg/m³, todos los modelos (y la persistencia) se desvían unos 30–35 µg/m³, casi siempre por subestimación. Los fuegos artificiales y el humo de incendios forestales de fuera de la región no son visibles en las características de entrada.
- Las etiquetas de los últimos meses son provisionales: la revisión de calidad de la EPA llega con un retraso de aproximadamente medio año, lo que afecta a la fiabilidad de la puerta de promoción más reciente.
- Entrenado exclusivamente con los monitores de Utah; no debe extrapolarse a otras regiones sin reentrenamiento.
- No es un pronóstico oficial: los resultados publicados no sustituyen a las alertas de las autoridades ambientales.
- Cobertura limitada a 26 estaciones y a PM2.5; no modela otros contaminantes.
- El repositorio no incluye información sobre sesgos, idiomas ni rendimiento en dominios distintos al de entrenamiento.
- Licencia MIT, que permite uso comercial y modificación con atribución; aun así, la calidad de las predicciones en producción debe validarse localmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itstheryguy/aq-utah-models
- Dataset de pronósticos: https://huggingface.co/datasets/itstheryguy/aq-utah-forecasts
- Space de pronóstico de PM2.5 de Utah: https://huggingface.co/spaces/itstheryguy/aq-utah
- Código y diseño del proyecto: https://github.com/itstheryguy/aq_utah_project
