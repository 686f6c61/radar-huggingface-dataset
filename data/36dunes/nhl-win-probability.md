# 36Dunes/nhl-win-probability

## Resumen

NHL win probability (logit-v1) es un modelo de clasificación tabular publicado por el usuario 36Dunes en Hugging Face. Estima la probabilidad de que el equipo local gane un partido de la NHL, incluyendo prórroga y tanda de penaltis. No es un modelo de lenguaje ni una red neuronal: se trata de una regresión logística regularizada implementada como pipeline de scikit-learn y serializada en formato joblib.

El modelo se reentrena cada mañana y la versión publicada se ajustó con 17.460 partidos hasta el 25 de noviembre de 2026. Resuelve un problema acotado de predicción deportiva: dado un conjunto de 18 variables prepartido (diferenciales de Elo, descanso, back-to-back, indicador de playoffs, progreso de temporada y métricas rolling de goles, goles esperados, xG share, high-danger share, GSAx y victorias en ventanas de 10 y 40 partidos), devuelve una probabilidad calibrada.

Su relevancia es práctica más que arquitectónica: ofrece un punto de referencia reproducible y con backtest walk-forward público para cualquiera que quiera comparar modelos de predicción NHL, y demuestra que una regresión logística bien feature-engineered compite con el mercado de apuestas (log loss 0,6736 frente a 0,6691 del mercado en partidos con moneyline prepartido).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística regularizada (pipeline de scikit-learn) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 18 features) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | joblib (pickle de Python) |

## Arquitectura y entrenamiento

El modelo es una regresión logística regularizada encapsulada en un pipeline de scikit-learn. La entrada es un vector de 18 variables numéricas por partido: `elo_diff`, `rest_diff`, `home_b2b`, `away_b2b`, `playoff`, `season_progress`, `gd_10_diff`, `xgd_10_diff`, `xg_share_10_diff`, `hd_share_10_diff`, `gsax_10_diff`, `win_10_diff` y las seis equivalentes en ventana de 40 partidos (`gd_40_diff`, `xgd_40_diff`, `xg_share_40_diff`, `hd_share_40_diff`, `gsax_40_diff`, `win_40_diff`). La salida es una probabilidad de victoria del equipo local, con prórroga y shootout incluidos en el resultado.

El entrenamiento se realizó sobre 17.460 partidos hasta el 25 de noviembre de 2026 y el autor indica que el modelo se reentrena a diario. No se documenta en la información disponible el esquema de validación usado para el ajuste de hiperparámetros, ni el tamaño exacto de la regularización, ni si hubo calibración posterior (Platt scaling, isotonic). El backtest publicado es walk-forward desde la temporada 2017-18 con 12.244 partidos, lo que constituye una evaluación temporal razonable para series deportivas.

## Capacidades

- Clasificación binaria tabular: devuelve la probabilidad de victoria del equipo local en un partido NHL.
- Incluye prórroga y tanda de penaltis en la definición del resultado (no predice el resultado en tiempo reglamentario).
- Acepta 18 features prepartido, con el orden de columnas expuesto en el propio artefacto (`features`).
- El artefacto `model.joblib` es un diccionario con `model`, `features`, `version`, `trained_through` y `n_train`, lo que facilita la trazabilidad de la versión.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües.
- No procesa texto libre: la ingeniería de features debe hacerse fuera del modelo.

## Casos de uso

- Análisis prepartido automatizado: integrar el pipeline en un script diario que consuma estadísticas de la NHL, construya las 18 features y genere probabilidades para cada enfrentamiento del calendario. Adecuado por su bajo coste computacional y su naturaleza determinista.
- Comparación frente al mercado de apuestas: usar la probabilidad del modelo como referencia frente al moneyline implícito para detectar discrepancias. El propio autor reporta log loss 0,6736 frente a 0,6691 del mercado en partidos con línea prepartido, lo que permite calibrar expectativas.
- Backtesting de estrategias de apuestas o de gestión de bankroll: el modelo sirve como señal base sobre la que aplicar filtros de valor esperado y reglas de staking.
- Contenido editorial y previas de partido: alimentar artículos o newsletters con una probabilidad numérica reproducible en lugar de estimaciones subjetivas.
- Investigación académica sobre predicción deportiva: punto de partida sencillo y con licencia MIT para comparar contra modelos más complejos (gradient boosting, redes). El backtest walk-forward público facilita la reproducibilidad.
- Monitorización de mercados deportivos y detección de anomalías: si la probabilidad del modelo se desvía sistemáticamente del consenso, puede indicar información no incorporada (lesiones, alineaciones) que conviene revisar.
- Enseñanza de pipelines de ML tabular: ejemplo compacto de feature engineering con métricas rolling y de serialización con joblib para cursos o talleres.

## Benchmarks y rendimiento

| Metrica | Modelo | Mercado (moneyline prepartido) |
|---|---|---|
| Log loss (walk-forward 2017-18 en adelante, 12.244 partidos) | 0,6658 | no disponible |
| Accuracy (mismo backtest) | 58,9 % | no disponible |
| Log loss en partidos con moneyline prepartido | 0,6736 | 0,6691 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo tabular de este tipo.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo se ejecuta en CPU.
- GPU recomendadas: no aplica; una regresión logística sobre 18 features no se beneficia de GPU.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,0 GB según Hugging Face y el artefacto es un joblib de pequeño tamaño.
- Opciones de despliegue: inferencia directa con `joblib.load` y `pipeline.predict_proba` en Python; exposición vía FastAPI, Flask o funciones serverless (AWS Lambda, Cloud Functions) por su bajo coste.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del modelo (una multiplicación matricial de 18 dimensiones por partido) la latencia esperada es de microsegundos a milisegundos por petición en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables publicados en el mismo repositorio ni en la información proporcionada. Como referencia cualitativa, alternativas habituales en predicción deportiva serían gradient boosting (XGBoost, LightGBM) o modelos Elo puros, pero no se dispone de sus métricas en este conjunto de datos para una comparación rigurosa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 36Dunes/nhl-win-probability | no disponible | 18 features tabulares | log loss 0,6658; accuracy 58,9 % | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El artefacto es un pickle de Python (`model.joblib`); cargarlo ejecuta código arbitrario. Solo debe cargarse desde repositorios de confianza, como advierte el propio autor.
- La licencia MIT permite uso comercial, pero no se ofrece ninguna garantía sobre el rendimiento en producción ni sobre la exactitud de las features de entrada.
- El modelo depende de que las 18 features se construyan exactamente con la misma definición y ventanas temporales que en el entrenamiento. Cualquier desviación (por ejemplo, en el cálculo de xG o GSAx) invalida las probabilidades.
- Riesgo de deriva: aunque se reentrena a diario, los cambios de reglas, plantillas o calendario pueden degradar el rendimiento; conviene monitorizar el log loss en producción.
- No modela el resultado en tiempo reglamentario ni marcadores; solo la victoria final del local.
- No se documentan análisis de sesgo por equipo, conferencia o temporada, ni intervalos de calibración por segmentos.
- El rendimiento reportado (log loss 0,6658) es ligeramente peor que el del mercado en partidos con línea prepartido (0,6736 frente a 0,6691), por lo que no debe interpretarse como una ventaja explotable sin un análisis de valor esperado adicional.
- No se especifican los idiomas soportados porque el modelo no procesa lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/36Dunes/nhl-win-probability
- Predicciones en vivo y track record: https://nhl.36dunes.com
- Código fuente: https://github.com/seacoastcreates/nhl-predictor
- Dataset de referencia: https://huggingface.co/datasets/jjerlee/nhl-analytics
