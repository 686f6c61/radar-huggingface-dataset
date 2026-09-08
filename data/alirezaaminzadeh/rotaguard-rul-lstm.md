# alirezaaminzadeh/rotaguard-rul-lstm

## Resumen

RotaGuard RUL (LSTM) es un modelo de predicción de vida útil restante (RUL) para equipos rotativos, desarrollado por el equipo de ingeniería de Aria AI (alirezaaminzadeh) y publicado bajo licencia MIT. Se trata de una red LSTM compacta de una capa con 48 unidades que procesa una ventana de 30 ciclos de 17 sensores y ajustes escalados para estimar el número de ciclos de vida restantes de un activo. El modelo fue entrenado en el conjunto de simulación NASA C-MAPSS FD001, un estándar en la literatura de mantenimiento predictivo, y se distribuye junto con un baseline LightGBM y varios artefactos de evaluación.

Aunque no alcanza el estado del arte, proporciona una solución ligera y rápida en CPU que puede servir como base para proyectos de mantenimiento predictivo en entornos industriales. El repositorio incluye pesos en formato ONNX y PyTorch, un escalador ajustado, y un fichero `eval_results.json` con las métricas exactas y las citas de las comparativas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (1 capa, 48 unidades) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 ciclos (ventana temporal de entrada); sin contexto de tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numerico de series temporales; no admite lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | ONNX (`rul_lstm.onnx`), PyTorch state dict (`rul_lstm.pt`), joblib (`rul_scaler.joblib`, `rul_gbm.joblib`) |

## Arquitectura y entrenamiento

El modelo es un LSTM clasico de una sola capa con 48 unidades ocultas, que recibe como entrada una ventana deslizante de 30 ciclos temporales y 17 caracteristicas (sensores y ajustes operativos escalados). La salida es una prediccion escalar de la vida util restante en ciclos. El entrenamiento se realizo sobre el conjunto NASA C-MAPSS FD001, una simulacion de degradacion de motores turbofan que se utiliza aqui como analogo de ingenieria para turbinas de gas de un solo eje o trenes de compresores centrifugos. No se aplicaron tecnicas de RLHF ni DPO, ya que no es un modelo de lenguaje.

La etiqueta de entrenamiento usa la convencion estandar de "cap piecewise" de 125 ciclos. El autor incluye un baseline LightGBM con caracteristicas tabulares (rolling/lag) para comparacion. No hay innovaciones tecnicas destacables: se trata de un modelo pequeno y deliberadamente sencillo, optimizado para ejecucion rapida en CPU.

## Capacidades

- Prediccion de vida util restante (RUL) para equipos rotativos a partir de una ventana de 30 ciclos de datos de sensores y ajustes.
- Inferencia en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Reproducibilidad: incluye un fichero `eval_results.json` con las metricas de evaluacion, el historial de entrenamiento y las citas de los baselines publicados.
- Ajuste fino: el state dict `.pt` permite reentrenar el modelo con nuevas caracteristicas o datos propios.
- Incluye un `StandardScaler` ajustado en los datos de entrenamiento, listo para preprocesar nuevas muestras.
- No soporta generacion de texto, tool calling, agentes ni razonamiento en lenguaje natural: es exclusivamente un modelo de regresion temporal.

## Casos de uso

- Mantenimiento predictivo en plantas petroquimicas: el modelo se integra en un sistema de monitorizacion de vibraciones para estimar la RUL de compresores o bombas a partir de una ventana de 30 ciclos. Su inferencia ONNX permite ejecutarlo en servidores CPU sin coste de GPU.
- Planificacion de paradas de planta: las predicciones de RUL facilitan programar intervenciones antes del fallo, reduciendo paradas no planificadas. El modelo es tan ligero que puede ejecutarse periodicamente en sistemas de control.
- Analisis de vida residual de turbinas de gas: aunque C-MAPSS es una simulacion, sirve como analogo de ingenieria para turbinas de gas de un solo eje. Los equipos de investigacion pueden usarlo para validar metodologias previamente a aplicarlas sobre datos reales.
- Deteccion temprana de degradacion en compresores centrifugos: cuando la RUL predicha cae por debajo de un umbral configurable, el modelo permite activar inspecciones o reducir la carga operativa del equipo.
- Formacion y demostracion en mantenimiento predictivo: la simplicidad del LSTM (48 unidades) y la inclusion de un baseline LightGBM lo hacen adecuado para cursos practicos o demos de tecnicas de RUL en entornos educativos.
- Comparacion de arquitecturas: al ser un modelo pequeno y rapido, actua como baseline en experimentos donde se evaluan metodos mas complejos (ensembles, transformers, etc.). El fichero `eval_results.json` ya incluye metricas de referencia para dichas comparaciones.
- Ajuste fino con datos de campo: el autor recomienda reentrenar con telemetria real de un cliente para obtener validez industrial. Gracias al state dict `.pt`, el reentrenamiento es viable en CPU.

## Benchmarks y rendimiento

Los resultados que se muestran a continuacion estan declarados por el autor del modelo y no se han verificado de forma independiente. Se presentan tal como aparecen en la model card.

| Modelo | RMSE (ciclos) | PHM08 Score | Fuente |
|---|---:|---:|---|
| rotaguard-rul-lstm (LSTM primario) | 15.23 | 377.29 | Model card (no verificado) |
| LightGBM baseline (incluido) | 18.11 | 623.24 | Model card |
| LSTM (2x50, from-scratch) | 14.51 | no disponible | github.com/Gsebs/ml-health-forecasting-transformer |
| Regularized Random Forest | 12.57 | 252 | github.com/beebzy-droid/predictive-maintenance-cmapss |
| Tuned XGBoost | 11.62 | 207 | github.com/beebzy-droid/predictive-maintenance-cmapss |
| Deep LSTM (preprocesado pesado) | 7.78 | no disponible | Asif et al. (2022) |
| Stacking ensemble (LSTM+CNN+CNN-LSTM+CNN-GRU→XGBoost) | 9.989 | no disponible | arXiv:2608.27940 (2026) |

## Requisitos de hardware

- El modelo tiene aproximadamente 12 700 parametros (estimacion a partir de la arquitectura: una capa LSTM de 48 unidades sobre entrada de 17 caracteristicas), lo que implica un consumo de memoria inferior a 1 MB para los pesos.
- No requiere GPU; la inferencia se ejecuta en CPU con ONNX Runtime.
- VRAM: 0 MB (no aplica; es un modelo para CPU).
- GPU recomendada: ninguna; funciona en cualquier CPU moderna, incluidos sistemas embebidos como Raspberry Pi, siempre que exista soporte de Python y ONNX Runtime.
- Opciones de despliegue: ONNX Runtime en servidores, PC o edge; PyTorch para reentrenamiento; joblib para el modelo LightGBM.
- Latencia: no disponible, aunque dado el tamano del modelo se espera una inferencia de milisegundos por ventana en CPU.

## Comparativa con modelos similares

La siguiente tabla compara el modelo con los baselines citados en la model card. Todos son modelos de RUL sobre el conjunto FD001, pero con enfoques distintos.

| Modelo | Arquitectura | Parametros aproximados | RMSE | PHM08 Score | Licencia / disponibilidad |
|---|---|---|---|---|---|
| rotaguard-rul-lstm | LSTM 1 capa, 48 unidades | ~12.7k | 15.23 | 377.29 | MIT, open source |
| LightGBM baseline | LightGBM tabular | no disponible | 18.11 | 623.24 | MIT, incluido en el repo |
| LSTM (2x50) | LSTM 2 capas de 50 | ~30k | 14.51 | no disponible | GitHub publico |
| Regularized Random Forest | Random Forest regularizado | no disponible | 12.57 | 252 | GitHub publico |
| Tuned XGBoost | XGBoost ajustado | no disponible | 11.62 | 207 | GitHub publico |
| Deep LSTM | LSTM profundo con preprocesado pesado | no disponible | 7.78 | no disponible | Articulo de investigacion |
| Stacking ensemble | Combinacion de LSTM/CNN y XGBoost | no disponible | 9.989 | no disponible | arXiv |

## Limitaciones y advertencias

- Los datos de entrenamiento (NASA C-MAPSS) son una simulacion de degradacion de turbofan. El modelo no se ha validado sobre telemetria real de campo y no debe comercializarse como valido para equipos industriales especificos sin un ajuste fino previo con datos reales.
- El rendimiento es modesto: el autor lo situa en el rango "vanilla/untuned" de la literatura FD001, no como estado del arte.
- Hay un sesgo conocido por el tope piecewise de 125 ciclos: en los motores cuya vida real supera los 125 ciclos, el modelo subestima sistematicamente la RUL.
- Al entrenarse solo en el escenario FD001, su capacidad de generalizacion a otras condiciones de operacion o tipos de fallo es limitada.
- No es un modelo de lenguaje: no procesa texto, ni soporta tool calling, agentes ni instrucciones en lenguaje natural.
- La licencia MIT permite uso comercial, pero la validez tecnica para aplicaciones criticas debe evaluarse con datos propios.

## Enlaces

- Modelo: https://huggingface.co/alirezaaminzadeh/rotaguard-rul-lstm
- Dataset: https://huggingface.co/datasets/alirezaaminzadeh/rotaguard-vibration-rul-features
- Clasificador de vibracion: https://huggingface.co/alirezaaminzadeh/rotaguard-vibration-classifier
- Space de demostracion: https://huggingface.co/spaces/alirezaaminzadeh/rotaguard-predictive-maintenance
- Sitio web del desarrollador: https://aria-ai.ir
- Referencia de la literatura publicada: arXiv:2608.27940 (2026)
