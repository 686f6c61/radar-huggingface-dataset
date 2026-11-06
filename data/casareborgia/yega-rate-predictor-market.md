# casareborgia/yega-rate-predictor-market

## Resumen

Yega-rate-predictor-market es un modelo de regresión tabular basado en LightGBM que predice los cuantiles Q25, Q50 y Q75 de la tasa de evaluación (사정률) en licitaciones públicas surcoreanas del sistema Nara Jangkau. La tasa se define como el precio previsto dividido por el importe base multiplicado por 100, y determina el umbral mínimo de adjudicación en subastas de precio múltiple. El modelo lo desarrolla el usuario casareborgia como proyecto personal de aprendizaje y se distribuye con licencia MIT.

El problema que aborda es intrínsecamente estocástico: el precio previsto se obtiene del promedio de cuatro precios preliminares extraídos por sorteo entre quince, dentro de un rango de ±2 % o ±3 % sobre el importe base. Por ello, la mayor parte de la varianza no es explicable por variables observables y el valor del modelo no reside en reducir el error absoluto medio, sino en producir cuantiles calibrados que permitan calcular un precio de puja con probabilidad controlada de superar el umbral mínimo.

Técnicamente es un conjunto de tres regresores LightGBM con `objective=quantile` (α = 0,25 / 0,50 / 0,75), profundidad máxima 3 y siete hojas, entrenados sobre 538.907 registros de adjudicación del período 2024-01 a 2026-09. No es un modelo de lenguaje ni procesa texto libre: consume cinco variables tabulares y devuelve tres valores numéricos en puntos porcentuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles (LightGBM) con objetivo de regresión por cuantiles; tres modelos independientes, uno por cuantil |
| Parametros totales | no disponible (no aplicable; modelo de árboles con `max_depth=3`, `num_leaves=7`, `n_estimators<=300`) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (entrada tabular de 5 variables, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (no aplicable; artefacto joblib con pesos de árbol) |
| Idiomas soportados | coreano (ko); las variables categóricas y la documentación están en coreano |
| Licencia | MIT |
| Formato de pesos | joblib (diccionario serializado con los modelos, codificadores, priors y metadatos) |

## Arquitectura y entrenamiento

El modelo es un conjunto de tres `LGBMRegressor` con `objective=quantile` para α = 0,25, 0,50 y 0,75. Hiperparámetros declarados: `max_depth=3`, `num_leaves=7`, `min_child_samples=30`, `subsample=0.8`, `colsample_bytree=0.8`, `learning_rate=0.03`, `n_estimators<=300` con parada temprana sobre el 15 % final del intervalo de entrenamiento, `reg_lambda=1.0` y `random_state=42`. La predicción final se contrae hacia un prior calculado por rango de precios preliminares: 0,7 × salida del modelo + 0,3 × prior (media y cuantiles empíricos por rango). Se aplica una corrección para evitar cruces de cuantiles (Q25 ≤ Q50 ≤ Q75).

Las variables de entrada son cinco: `work_type` (1 = obra civil, 2 = servicios), `range_cls` (rango ±2 o ±3), `est_price_log` (log10 del precio estimado), `bidder_count` (número de licitantes, con imputación por mediana) e `is_year_end` (indicador de fin de año). Los datos proceden del servicio Open API de información de adjudicaciones del sistema Nara Jangkau, dependiente del servicio público de contrataciones de Corea, con 538.907 registros de subastas de precio múltiple entre enero de 2024 y septiembre de 2026 (77.688 con rango ±2 % y 461.219 con rango ±3 %). No se documenta uso de RLHF, DPO ni datos sintéticos.

La innovación relevante no es arquitectónica sino metodológica: el autor demuestra que la tasa de evaluación está dominada por ruido de sorteo, que el rango de precios preliminares explica casi toda la estructura de la distribución (±2 %: media 99,99, desviación 0,51; ±3 %: media 99,86, desviación 0,74) y que las demás variables mueven la media menos de 0,1 puntos porcentuales. En consecuencia, el modelo se evalúa por calibración de cuantiles y no por MAE.

## Capacidades

- Predicción de los cuantiles Q25, Q50 y Q75 de la tasa de evaluación (사정률) en puntos porcentuales.
- Cálculo derivado del precio de puja que supera el umbral mínimo con probabilidad aproximadamente igual a α, dado el importe base y la tasa de umbral del anuncio.
- Distinción entre obra civil y servicios mediante la variable `work_type`, con soporte para el tratamiento del valor A en obra civil (partidas de liquidación posterior como pensión nacional, seguro de salud y fondo de jubilación).
- Ajuste por rango de precios preliminares (±2 % o ±3 %), la variable con mayor poder explicativo según el autor.
- Entrada tabular de cinco variables, sin procesamiento de lenguaje natural, sin tool calling, sin capacidades de agente ni razonamiento multi-paso.
- Soporte multilingüe limitado al coreano en la documentación y en las categorías de entrada.
- Serialización en un único artefacto joblib que incluye modelos, codificadores, priors por rango, estadísticas de entrenamiento y metadatos de validación.

## Casos de uso

- Cálculo de precio de puja en licitaciones de servicios: dado el importe base y el rango de precios preliminares del anuncio, el modelo devuelve Q75 y permite fijar un precio con aproximadamente 75 % de probabilidad de superar el umbral mínimo, útil para licitantes que priorizan no quedar excluidos.
- Estrategia agresiva en obra civil: con Q25 se obtiene un precio con aproximadamente 25 % de probabilidad de superar el umbral, adecuado para licitantes que buscan margen y aceptan alta tasa de exclusión; el modelo permite cuantificar esa disyuntiva de forma explícita.
- Análisis de sensibilidad al rango de precios preliminares: al ser `range_cls` la variable dominante, el modelo sirve para comparar distribuciones entre anuncios con rango ±2 % y ±3 % y ajustar la política de puja según el tipo de convocatoria.
- Herramienta de validación para equipos de licitación: el artefacto incluye `range_stats`, `priors_by_range` y `cv_summary`, lo que permite auditar la calibración de los cuantiles con datos históricos propios antes de usar las predicciones.
- Integración en un pipeline de cálculo de precios: al ser un joblib de LightGBM con inferencia en milisegundos y sin GPU, puede ejecutarse dentro de un servicio que reciba los datos del anuncio y devuelva los tres cuantiles y el precio de puja derivado.
- Investigación sobre calibración en dominios con ruido irreducible: el modelo y sus informes de validación temporal (holdout de 2026-09 y 2026-10) constituyen un caso documentado de cuantiles calibrados cuando el MAE está en su límite inferior.
- Docencia sobre regresión por cuantiles: el repositorio separa explícitamente el error de predicción de la calibración, lo que lo convierte en un ejemplo práctico de por qué el MAE no es la métrica adecuada en problemas de sorteo.

## Benchmarks y rendimiento

| Evaluación | n | MAE baseline | MAE modelo | Brecha de sobreajuste | Cobertura Q25-Q75 | Tasa de validez Q25 / Q50 / Q75 |
|---|---|---|---|---|---|---|
| Validación cruzada temporal 5-fold | 538.907 | 0,5708 | 0,5702 (+0,1 %) | -0,001 | 50,1 % | 25,0 / 50,0 / 75,1 % |

| Holdout | Entrenamiento | n | Cobertura | Validez Q25 / Q50 / Q75 (margen 0) | Validez Q75 (margen 0,1 %) |
|---|---|---|---|---|---|
| 2026-09 | hasta 2026-08 (528.664) | 10.243 | 49,8 % | 25,0 / 49,7 / 74,9 % | 79,3 % |
| 2026-10 (futuro puro) | hasta 2026-09 | 12.544 | 49,9 % | 25,6 / 50,9 / 75,4 % | 79,8 % |

El baseline es la media de entrenamiento por rango de precios preliminares; unidades en puntos porcentuales. El autor señala además que, en 874 adjudicaciones por evaluación de idoneidad de octubre de 2026, el precio del primer clasificado quedó una mediana de +0,074 % por encima del umbral mínimo real, lo que ilustra que superar el umbral no equivale a ganar la licitación.

## Requisitos de hardware

- Inferencia en CPU: el modelo es LightGBM con profundidad 3 y como máximo 300 árboles por cuantil; no requiere GPU.
- VRAM estimada: no aplicable; el artefacto joblib ocupa una fracción muy pequeña de un repositorio de 0,0 GB según Hugging Face.
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: irrelevante, el cuello de botella no es el cómputo.
- Opciones de despliegue: carga directa con `joblib.load` y `predict` de LightGBM; integrable en cualquier servicio Python. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Entorno declarado por el autor: Python 3.12, lightgbm 4.7, pandas ≥ 3.0, scikit-learn ≥ 1.9.
- Latencia y throughput: no disponibles de forma explícita; por la estructura del modelo (tres conjuntos de hasta 300 árboles de profundidad 3 sobre cinco variables) la inferencia por fila es del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| yega-rate-predictor-market | LightGBM quantile (3 modelos) | 5 variables tabulares | Q25/Q50/Q75 de la tasa de evaluación | 538.907 registros Nara Jangkau (2024-01 a 2026-09) | MIT | Hugging Face, 0 descargas, 0 likes |
| Baseline por rango (media de entrenamiento) | Estadístico | `range_cls` | Media de la tasa por rango | Mismos datos | no aplica | Referencia interna del propio informe |
| Otros modelos de predicción de precios en contratación pública | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables publicados para esta tarea concreta (predicción de cuantiles de la tasa de evaluación en el sistema Nara Jangkau). El propio autor indica que varios algoritmos probados quedan dentro del error de muestreo del baseline, lo que sugiere que la comparación relevante es contra el baseline estadístico y no contra otro modelo de aprendizaje automático.

## Limitaciones y advertencias

- La tasa de evaluación es en gran medida resultado de un sorteo; el modelo no puede reducir el error por debajo del límite impuesto por ese ruido. El MAE de 0,5702 frente al baseline de 0,5708 refleja una mejora marginal del 0,1 %.
- Una `range_cls` incorrecta distorsiona gravemente los cuantiles. El autor advierte que el 86 % de las licitaciones de mercado usan rango ±3 % y que debe confirmarse en el anuncio.
- El efecto de `is_year_end` es prácticamente nulo porque hay pocos datos de noviembre y diciembre en el conjunto de entrenamiento.
- Superar el umbral mínimo no implica ganar la licitación: en la muestra de octubre de 2026 el primer clasificado quedó una mediana de +0,074 % por encima del umbral, por lo que Q75 no maximiza la probabilidad de adjudicación.
- El modelo no sustituye la lectura del anuncio: la tasa de umbral, el valor A y el rango de precios preliminares deben tomarse del pliego oficial.
- Cobertura geográfica y de dominio limitada a la contratación pública surcoreana y al período 2024-2026; no hay evidencia de generalización a otros marcos regulatorios ni a ejercicios anteriores.
- Documentación y categorías únicamente en coreano, lo que limita su uso por equipos no coreanohablantes sin traducción previa.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías sobre los resultados de licitación.
- Sesgos conocidos: no documentados de forma explícita; la variable `bidder_count` se imputa por mediana cuando falta, lo que puede infraestimar la incertidumbre en anuncios con número de licitantes atípico.
- Riesgo de alucinación: no aplicable en el sentido de generación de texto; el riesgo equivalente es una predicción mal calibrada si la distribución de los datos de entrada se aleja de la de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente por terceros de los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/casareborgia/yega-rate-predictor-market
- Repositorio de código del autor: https://github.com/casareborgia/bid-
- Origen de datos, API de información de adjudicaciones del servicio público de contrataciones de Corea (공공데이터포털 「조달청_나라장터 낙찰정보서비스」 Open API): no disponible como URL directa en la información proporcionada
- Informes de validación citados por el autor (`reports/cv_report_market.md`, `reports/backtest_market_2026-09.md`, `reports/backtest_market_2026-10.md`): accesibles únicamente a través del repositorio de GitHub indicado
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
