# jramduran/rossmann-sales-gradient-boosting

## Resumen

`jramduran/rossmann-sales-gradient-boosting` es un modelo de regresión tabular publicado en Hugging Face por el usuario jramduran para predecir las ventas diarias en euros de las 1.115 farmacias (drugstores) de la cadena Rossmann. No es un modelo de lenguaje ni una red neuronal: es un `HistGradientBoostingRegressor` de scikit-learn serializado con joblib, entrenado sobre el conjunto de datos público de la competición Kaggle "Rossmann Store Sales". El problema que resuelve es el de forecasting de series temporales de retail a nivel de tienda-día, usando únicamente información conocida de antemano (tienda, fecha, promociones y festivos), sin depender del número de clientes del día objetivo.

El modelo reporta un R² de 0,921 y un RMSPE de 0,118 sobre las últimas seis semanas del dataset (40.282 registros tienda-día nunca vistos), frente a un R² de 0,696 y RMSPE de 0,224 de un baseline que predice la media histórica por tienda y día de la semana. La relevancia es acotada: se trata de un artefacto reproducible de un proyecto de Kaggle, no de un modelo fundacional ni de propósito general, y su uso está ligado a un pipeline de features concreto definido en un repositorio externo.

El repositorio ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta. La licencia no está declarada y no se especifican idiomas (no aplica, al ser un modelo tabular numérico).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre árboles de decisión (`HistGradientBoostingRegressor` de scikit-learn, con soporte nativo de categóricas y early stopping) |
| Parametros totales | no disponible (el número de árboles, profundidad y hojas no se declara en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular; entrada de 21 features por registro) |
| Tipos de cuantizacion | no disponible (no se documenta cuantización; el artefacto es un pickle joblib) |
| Idiomas soportados | no disponible (no aplica; modelo numérico/tabular) |
| Licencia | no disponible |
| Formato de pesos | joblib (`.joblib`), más un CSV auxiliar `store_stats.csv` con estadísticas por tienda |
| Version de scikit-learn requerida | 1.9.1 |
| Numero de features | 21 |
| Variable objetivo | `log1p(sales)`, revertida con `expm1` |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El modelo es un `HistGradientBoostingRegressor` de scikit-learn, un algoritmo de gradient boosting sobre árboles histogram-based que soporta variables categóricas de forma nativa y aplica early stopping. La model card indica que fue el mejor de cuatro modelos evaluados, aunque no detalla cuáles eran los otros tres ni sus resultados. No hay redes neuronales, atención, embeddings ni componentes de deep learning.

Los datos provienen de la competición Kaggle "Rossmann Store Sales" (`train.csv` + `store.csv`), leídos desde el dataset `AiiN-aini/rossmann-store-sales` de Hugging Face. El conjunto de entrenamiento cubre del 2013-01-01 al 2015-06-19 (804.056 registros tienda-día) y el de test del 2015-06-20 al 2015-07-31 (40.282 registros). Solo se incluyen días abiertos con ventas. Las 21 features se agrupan en: calendario (día de la semana, día, mes, año, semana del año, día del año, inicio y fin de mes), flags de promoción y festivos (estatal y escolar), tipo de tienda, surtido, distancia y antigüedad de la competencia, estado y mes de Promo2, y cuatro estadísticas por tienda calculadas sobre el periodo de entrenamiento (`store_mean_log_sales`, `store_dow_log_sales`, `store_promo_lift`, `store_mean_log_customers`). La construcción de features depende del módulo `forecast/features.py` del repositorio del proyecto, no incluido en el repo de Hugging Face.

## Capacidades

- Predicción puntual de ventas diarias en euros para cada una de las 1.115 tiendas Rossmann.
- Regresión tabular sobre 21 features conocidas de antemano (sin fuga de información del día objetivo, como el número de clientes).
- Manejo nativo de variables categóricas (tipo de tienda, surtido, flags) sin necesidad de codificación one-hot manual.
- Modelado de estacionalidad semanal y anual mediante features de calendario y estadísticas por tienda y día de la semana.
- Capacidad de forecasting a corto plazo (el horizonte evaluado es de seis semanas).
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni generación de texto.
- No es multilingüe ni procesa lenguaje natural.

## Casos de uso

- Previsión de ventas diarias por tienda para planificación de inventario: el modelo predice la demanda en euros con un MAE de 584 EUR por tienda-día, útil para dimensionar pedidos y stock de seguridad en cada punto de venta.
- Planificación de personal y turnos: con predicciones a seis semanas vista y un RMSPE del 11,8 %, los responsables de tienda pueden ajustar plantillas a la carga esperada por día de la semana y promociones.
- Evaluación del impacto de promociones: la feature `store_promo_lift` y el flag `promotion` permiten estimar el incremento de ventas asociado a cada campaña por tienda.
- Análisis de festivos y estacionalidad: los flags de festivo estatal y escolar junto con las features de calendario permiten cuantificar el efecto de cada festivo sobre las ventas.
- Benchmarking interno de modelos de forecasting: sirve como referencia reproducible (R² 0,921, RMSPE 0,118) frente a la que comparar modelos más complejos sobre el mismo dataset de Kaggle.
- Detección de anomalías operativas: comparar la venta real de una tienda-día con la predicción del modelo puede señalar caídas anómalas (roturas de stock, incidencias) que merezcan revisión.
- Simulación de escenarios de expansión: las features de competencia (distancia y antigüedad) permiten explorar cómo varía la predicción al modificar el entorno competitivo de una ubicación.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test (últimas seis semanas, 40.282 registros tienda-día):

| Metrica | Modelo | Baseline (media por tienda y dia de la semana) |
|---|---|---|
| R² | 0,921 | 0,696 |
| RMSPE (metrica Kaggle) | 0,118 | 0,224 |
| RMSE | 859 EUR | no disponible |
| MAE | 584 EUR | no disponible |

No se han publicado resultados de benchmarks adicionales ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un `HistGradientBoostingRegressor` de scikit-learn y no requiere GPU; se ejecuta en CPU convencional con latencia de milisegundos por predicción.
- VRAM estimada: 0 GB (no usa GPU).
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,0 GB y el artefacto es un pickle joblib de tamaño reducido (el tamaño exacto del `.joblib` no se declara).
- Opciones de despliegue: carga directa con `joblib.load` en Python con scikit-learn 1.9.1; también puede servirse mediante FastAPI, Flask o cualquier framework de serving de Python que exponga el pipeline de features.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del algoritmo se espera un throughput alto en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables publicados con las mismas features y el mismo split de evaluación. La referencia más cercana es el baseline incluido en la propia model card.

| Modelo | Tipo | R² | RMSPE | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jramduran/rossmann-sales-gradient-boosting | HistGradientBoosting (sklearn) | 0,921 | 0,118 | no disponible | Hugging Face |
| Baseline media por tienda y dia de la semana | Estadístico | 0,696 | 0,224 | no aplica | Incluido en la model card |
| Otros modelos de la competición Kaggle Rossmann | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. El modelo se entrena solo con días abiertos con ventas, por lo que no modela cierres ni días sin actividad.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de predicciones erróneas fuera del rango temporal y de las condiciones vistas en entrenamiento (2013-2015).
- Limitaciones de contexto: el modelo depende de un pipeline de features externo (`forecast/features.py` del repositorio `JTiiz/iron-kaggle`) y de la versión exacta de scikit-learn 1.9.1; cualquier cambio en features o versión puede romper la reproducibilidad.
- Dependencia de `store_stats.csv`: las cuatro estadísticas por tienda se calculan sobre el periodo de entrenamiento; para tiendas nuevas o para fechas muy posteriores a 2015 esas estadísticas pueden no estar disponibles o no ser representativas.
- Restricciones de licencia: la licencia no está declarada, por lo que no se puede asumir uso comercial sin consultar al autor. Los datos originales de Kaggle tienen sus propias condiciones de uso.
- Caveat de producción: cargar el `.joblib` implica ejecutar un pickle; solo debe hacerse desde fuentes de confianza, como advierte la propia model card.
- Generalización: el modelo está entrenado sobre una única cadena de farmacias alemana en un periodo concreto; no se ha validado su transferencia a otros retailers, países o periodos.
- Sin métricas de calibración ni intervalos de predicción: solo se ofrece la predicción puntual, sin cuantificar la incertidumbre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jramduran/rossmann-sales-gradient-boosting
- Dataset de entrenamiento: https://huggingface.co/datasets/AiiN-aini/rossmann-store-sales
- Repositorio del proyecto (pipeline de features): https://github.com/JTiiz/iron-kaggle
- Competición Kaggle de origen: "Rossmann Store Sales" (no se proporciona URL directa en la información disponible)
