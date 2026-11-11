# nathrod/photovoltaic-generation-forecasting

## Resumen

`nathrod/photovoltaic-generation-forecasting` no es un modelo de lenguaje, sino un repositorio de artefactos de machine learning clásico (serializados con joblib) que acompaña un trabajo de fin de grado en Sistemas de Información de la UNICAMP. El proyecto investiga cómo el horizonte de predicción (1, 12 y 24 horas) y la incorporación progresiva de variables meteorológicas afectan al rendimiento de modelos de regresión aplicados a la previsión de generación fotovoltaica en un complejo solar situado en Dracena (São Paulo, Brasil).

Los algoritmos evaluados son SVR, Random Forest y XGBoost, comparados contra dos baselines de persistencia (simple y estacional diaria). Se entrenaron 27 combinaciones (3 algoritmos × 3 conjuntos de features × 3 horizontes) con estrategia de predicción directa `X(t) → y(t+h)` y validación temporal cronológica, usando datos públicos de ONS, INMET, CAMS y ERA5.

Es relevante para desarrolladores e investigadores que trabajan en previsión de series temporales energéticas, porque documenta de forma rigurosa el efecto marginal de añadir radiación solar y variables meteorológicas según el horizonte, e ilustra un pitfall metodológico concreto: la alineación de lags fijos provoca que el horizonte de 12 h degrade más que el de 24 h. No obstante, es un artefacto de investigación acotado, no un modelo listo para producción general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos de regresión clásicos: SVR, Random Forest, XGBoost (no es una red neuronal ni un transformer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de features fija: lags t, t-1, t-2, t-3, t-24) |
| Tipos de cuantizacion | no disponible (artefactos joblib, no aplica cuantización de pesos) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | joblib (serialización de scikit-learn / XGBoost) |

## Arquitectura y entrenamiento

El repositorio contiene pipelines de regresión tabular sobre series temporales horarias. Cada modelo se entrena de forma independiente para cada horizonte (h = 1, 12, 24) con estrategia directa: las features en el origen de predicción se mapean directamente a la generación futura, sin recursión. Las features se organizan en tres conjuntos incrementales: E1 (generación histórica con lags t, t-1, t-2, t-3, t-24 más codificaciones cíclicas de hora y día del año), E2 (E1 más radiación solar en t, t-1, t-2) y E3 (E2 más temperatura, humedad, presión y precipitación). En total, 27 modelos entrenados.

La partición de datos es cronológica y respeta la estructura temporal: entrenamiento del 3 de enero al 31 de agosto de 2025, validación del 1 de septiembre al 31 de octubre de 2025 y test del 1 de noviembre de 2025 al 31 de mayo de 2026. La selección de hiperparámetros usa validación temporal con `TimeSeriesSplit` y un gap dependiente del horizonte, manteniendo el conjunto de test separado. No se emplean valores meteorológicos futuros como entrada, por lo que los horizontes de 12 y 24 h deben interpretarse como predicciones multi-horizonte basadas en información disponible en el origen, no como sistemas operativos day-ahead con salidas de NWP.

## Capacidades

- Predicción de generación fotovoltaica horaria a horizontes de 1, 12 y 24 horas mediante regresión supervisada.
- Modelado de estacionalidad diaria y anual mediante features cíclicas (`hour_sin`, `hour_cos`, `day_of_year_sin`, `day_of_year_cos`).
- Incorporación incremental de variables exógenas: radiación solar, temperatura, humedad, presión atmosférica y precipitación.
- Comparación controlada contra baselines de persistencia simple y persistencia estacional diaria.
- Evaluación con MAE, RMSE y R² sobre particiones temporales independientes.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multimodales ni generación de texto: es un modelo numérico de regresión.

## Casos de uso

- Previsión intrahoraria de producción solar para despacho en tiempo casi real: con horizonte de 1 h y Random Forest sobre E2 se obtiene MAE de 4,051 y R² de 0,903, suficiente para ajustar consignas de inversores o curtailment a muy corto plazo.
- Planificación de vertido a red a horizonte de 24 h: XGBoost sobre E3 alcanza RMSE de 11,659 y R² de 0,785, útil para nominar programas de generación del día siguiente con datos disponibles en el origen.
- Dimensionamiento de almacenamiento y arbitraje energético: las predicciones a 12 h (Random Forest sobre E3, R² = 0,761) permiten decidir ciclos de carga y descarga de baterías con antelación suficiente.
- Investigación metodológica sobre selección de features: el repositorio sirve como referencia reproducible para estudiar cómo la inclusión de radiación solar mejora especialmente el horizonte de 1 h, mientras que el conjunto meteorológico completo aporta más a 12 h.
- Evaluación de baselines en nuevos emplois: los modelos de persistencia incluidos permiten calibrar si un modelo más complejo aporta valor real frente a la inercia de la serie en un parque solar concreto.
- Formación y docencia en series temporales: los notebooks y el pipeline de validación temporal con `TimeSeriesSplit` son un material didáctico directo para enseñar particiones cronológicas y evaluación con métricas de regresión.
- Réplica y extensión del estudio: al estar el pipeline completo en el repositorio, se puede reentrenar sobre otros parques o ampliar el conjunto de features con salidas de NWP para convertirlo en un sistema day-ahead operativo.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, sobre el conjunto de test (1 de noviembre de 2025 a 31 de mayo de 2026):

| Horizonte | Mejor modelo | Features | MAE | RMSE | R² |
|---|---|---:|---:|---:|---:|
| 1 h | Random Forest | E2 | 4,051 | 7,850 | 0,903 |
| 12 h | Random Forest | E3 | 6,952 | 12,318 | 0,761 |
| 24 h | XGBoost | E3 | 6,658 | 11,659 | 0,785 |

Hallazgos destacados por el autor: el horizonte de 1 h es el de mejor rendimiento; el de 12 h se degrada sustancialmente; el de 24 h supera al de 12 h pese a ser más lejano; la radiación solar aporta sobre todo a 1 h; el conjunto meteorológico completo (E3) es el más consistente a 12 h; las mejoras meteorológicas a 24 h son menores y dependientes del modelo; Random Forest es el más estable entre horizontes y XGBoost logra el menor RMSE a 24 h, muy próximo a Random Forest.

## Requisitos de hardware

- VRAM: no aplica; los modelos son de regresión clásica y se ejecutan en CPU. El repositorio ocupa 0,2 GB, dominado por artefactos joblib y notebooks.
- GPU recomendadas: no aplica. No se requiere GPU para inferencia; opcionalmente una GPU consumer (RTX 4090, RTX 3060) acelera el reentrenamiento de XGBoost con `gpu_hist`, pero no es necesaria.
- Cabe en cualquier consumer GPU y, de hecho, en CPU convencional con memoria RAM suficiente para cargar los artefactos.
- Opciones de despliegue: carga directa con `joblib.load` en Python, servicio REST con FastAPI o Flask, empaquetado en contenedor Docker, integración en pipelines de scikit-learn. No aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. Por la naturaleza de los modelos (Random Forest y XGBoost sobre decenas de features), la inferencia por muestra es del orden de milisegundos en CPU, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nathrod/photovoltaic-generation-forecasting | Regresión clásica (SVR, RF, XGBoost) | no disponible | Lags fijos t, t-1, t-2, t-3, t-24 | MAE 4,051–6,952; R² 0,761–0,903 | no disponible | Hugging Face |
| Persistencia simple (baseline del propio repo) | Baseline naive | no aplica | Último valor observado | No disponible en la model card | no disponible | Incluido en el repo |
| Persistencia estacional diaria (baseline del propio repo) | Baseline naive | no aplica | Valor de hace 24 h | No disponible en la model card | no disponible | Incluido en el repo |
| Modelos de forecasting solar con NWP (p. ej. sistemas operativos con salidas de predicción numérica) | Híbridos estadístico-físicos | no disponible | Variables NWP futuras | No disponible | no disponible | No disponible |

No se dispone de datos suficientes para comparar con alternativas externas de la misma categoría (por ejemplo, modelos de forecasting solar basados en LSTM, Transformers o Gradient Boosting con NWP), porque la información proporcionada no incluye sus métricas ni sus especificaciones.

## Limitaciones y advertencias

- Ámbito geográfico y temporal muy acotado: un único complejo fotovoltaico en Dracena (São Paulo, Brasil) y un periodo de test de siete meses (noviembre de 2025 a mayo de 2026). La generalización a otros emplois, latitudes o regímenes climáticos no está validada.
- Los horizontes de 12 y 24 h no usan valores meteorológicos futuros, por lo que no son comparables con sistemas day-ahead operativos que emplean salidas de NWP. El autor lo advierte explícitamente.
- El comportamiento no monotónico entre 12 h y 24 h se explica por la alineación de lags: `geracao_t` coincide con la misma hora del día anterior en el horizonte de 24 h, pero no existe un lag `t-12` equivalente para el horizonte de 12 h. Cualquier extensión del estudio debe corregir esta asimetría.
- Licencia no disponible: no se puede asumir uso comercial permitido. Es imprescindible contactar al autor antes de cualquier despliegue en producción.
- Riesgo de sobreajuste a la estacionalidad del periodo de entrenamiento (enero–agosto de 2025) y de deriva si el parque cambia de configuración, sufre degradación de paneles o se modifican las fuentes de datos.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa en ese sentido es un error de categorización.
- Los artefactos joblib dependen de las versiones de scikit-learn y XGBoost usadas en el entrenamiento; cargarlos con versiones distintas puede fallar o producir resultados inconsistentes.
- Sesgos conocidos: no disponibles en la información proporcionada. Al ser datos públicos de ONS, INMET, CAMS y ERA5, hereda las limitaciones de cobertura y calidad de esas fuentes.

## Enlaces

- Hugging Face: https://huggingface.co/nathrod/photovoltaic-generation-forecasting
- ONS — Operador Nacional do Sistema Elétrico: https://www.ons.org.br
- INMET — Instituto Nacional de Meteorologia: https://portal.inmet.gov.br
- CAMS — Copernicus Atmosphere Monitoring Service: https://ads.atmosphere.copernicus.eu
- ERA5 — ECMWF Reanalysis v5: https://www.ecmwf.int/en/forecasts/dataset/ecmwf-reanalysis-v5
