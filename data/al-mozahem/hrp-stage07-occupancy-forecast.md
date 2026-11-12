# AL-mozahem/HRP-Stage07-Occupancy-Forecast

## Resumen

HRP-Stage07-Occupancy-Forecast es un modelo de regresión tabular publicado por el usuario AL-mozahem en Hugging Face. Su objetivo es predecir la fracción de ocupación realizada (un valor entre 0 y 1) de un tipo de habitación de hotel para los siete días siguientes, a partir de 47 características conocidas en el momento del snapshot. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un estimador CatBoost serializado con joblib y formato nativo `.cbm`, orientado a datos tabulares.

El modelo se presenta explícitamente como sintético y de demostración (`SYNTHETIC / DEMO_ONLY — NOT PRODUCTION VALIDATED`). El autor advierte que las métricas publicadas provienen únicamente de una partición temporal de un conjunto de datos sintético y no constituyen evidencia de rendimiento en producción. Se acompaña de un dataset sintético propio y de scripts de inferencia de ejemplo.

Su relevancia es limitada y acotada al ámbito de la previsión de ocupación hotelera con datos tabulares. No hay información sobre licencia, idiomas ni pipeline en la ficha de Hugging Face, y el repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los artefactos pueden no estar efectivamente alojados o que el contenido es mínimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CatBoost regression (gradient boosting sobre árboles, depth 6) |
| Parametros totales | no disponible (modelo de árboles; 120 iteraciones, learning rate 0.055, L2 leaf reg 5) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 47 características) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | joblib (`.joblib`) y nativo CatBoost (`.cbm`) |

## Arquitectura y entrenamiento

El modelo es un regresor CatBoost con profundidad 6, 120 iteraciones, tasa de aprendizaje 0.055 y regularización L2 en hojas de 5. La entrada son las 47 características definidas en `models/model_metadata.json`, todas ellas conocidas en el instante del snapshot (`snapshot_at`). La salida es la fracción de ocupación predicha (0–1) y una tasa adicional de ocupación esperada de carácter advisory. El pipeline incluye un fichero de medianas numéricas (`catboost_numeric_medians.json`) para el tratamiento de valores ausentes.

El entrenamiento se realizó sobre un dataset sintético publicado por el mismo autor (HRP-Stage07-Synthetic-Occupancy). No se dispone de información sobre el volumen de tokens o filas, la composición exacta del dataset ni sobre si hubo ajuste fino adicional. El autor insiste en que todas las características deben ser conocidas en el momento del snapshot y que no deben usarse reservas futuras como predictores, lo que constituye una salvaguarda metodológica frente a la fuga de información temporal.

## Capacidades

- Predicción de la fracción de ocupación realizada (0–1) para un tipo de habitación en un horizonte de siete días.
- Salida adicional de una tasa de ocupación esperada de carácter advisory.
- Manejo de valores ausentes mediante medianas numéricas precalculadas.
- Inferencia sobre datos tabulares con 47 características de entrada.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni de generación de texto.
- No dispone de capacidades multilingües en el sentido de modelos de lenguaje.
- No dispone de modo de razonamiento (thinking mode).

## Casos de uso

- Previsión de ocupación a siete días para un tipo de habitación concreto: el modelo recibe las 47 características del snapshot y devuelve la fracción de ocupación esperada, útil como señal de planificación operativa en un entorno controlado.
- Apoyo a la planificación de personal y turnos: con una estimación de ocupación a una semana vista, el equipo de operaciones puede dimensionar limpieza, recepción y restauración, siempre como decisión asistida y no automática.
- Simulación y docencia sobre pipelines de previsión tabular: al incluir dataset sintético, scripts de inferencia y payloads de ejemplo, sirve para reproducir un flujo completo de entrenamiento, serialización e inferencia sin datos reales sensibles.
- Validación de arquitecturas de features temporales: el modelo y su metadata documentan 47 características conocidas en el snapshot, lo que permite estudiar qué variables aportan señal y cuáles introducen fuga temporal.
- Pruebas de integración de artefactos joblib y CatBoost en entornos de serving: el par `.joblib`/`.cbm` y el script `src/predict.py` permiten ensayar la carga del modelo sin reentrenamiento en un pipeline de despliegue.
- Benchmark interno de referencia para modelos de previsión de ocupación: las métricas sintéticas (MAE 0.02484, R² 0.88062) pueden servir como línea base contra la que comparar modelos propios sobre datos reales, con la cautela de que no son evidencia de producción.

## Benchmarks y rendimiento

Los únicos resultados publicados provienen de la partición temporal sintética del autor:

| Medida | Valor |
|---|---:|
| MAE | 0.02484 (2.48 puntos porcentuales) |
| RMSE | 0.03373 (3.37 puntos porcentuales) |
| R² | 0.88062 |
| MAPE | 3.24% |

El autor indica explícitamente que estas métricas proceden solo del holdout temporal sintético y no son evidencia de rendimiento en producción. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo de árboles CatBoost con 120 iteraciones y profundidad 6, el requisito es muy bajo y probablemente inferior a 1 GB, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible; el modelo puede ejecutarse en CPU sin problema aparente dado su tamaño.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU de consumo, aunque no se confirma en la documentación.
- Opciones de despliegue: carga directa con joblib o con la librería CatBoost; el autor proporciona `example_inference.py` y `src/predict.py`, además de una demo Gradio en un cuaderno de Colab separado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HRP-Stage07-Occupancy-Forecast | CatBoost regression tabular | no disponible (120 iteraciones, depth 6) | no aplica (47 features) | no disponible | Hugging Face |
| Alternativas de previsión tabular | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo marcado explícitamente como sintético y de demostración (`SYNTHETIC / DEMO_ONLY — NOT PRODUCTION VALIDATED`); no está validado en producción.
- Las métricas publicadas provienen solo de un holdout temporal sintético y no deben extrapolarse a datos reales.
- Riesgo de fuga temporal si se usan características no conocidas en el instante del snapshot; el autor exige que todas las features estén disponibles en `snapshot_at`.
- Uso exclusivo como apoyo a la decisión: no permite cambios automáticos de precios, inventario ni reservas.
- El uso real requiere snapshots históricos auténticos, resultados realizados a siete días, evaluación temporal y comprobaciones de deriva (drift).
- Licencia no disponible, lo que impide confirmar si se permite uso comercial.
- Idiomas no disponibles; el modelo no procesa texto, por lo que la dimensión lingüística no aplica.
- No hay información sobre sesgos conocidos más allá de la naturaleza sintética de los datos.
- El tamaño del repositorio es de 0.0 GB, lo que puede indicar que los artefactos no están alojados o que el contenido es mínimo; conviene verificar la disponibilidad real de los ficheros antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AL-mozahem/HRP-Stage07-Occupancy-Forecast
- Dataset sintético: https://huggingface.co/datasets/AL-mozahem/HRP-Stage07-Synthetic-Occupancy
