# balselman/flight-delay-forecasting

## Resumen

Los modelos de riesgo de retraso de vuelos de `balselman` son un conjunto de clasificadores y regresores cuantílicos basados en LightGBM 4.7.0 que estiman, para vuelos domésticos de EE. UU. desde 30 aeropuertos grandes, la probabilidad de llegar con 15 minutos o más de retraso (`ArrDel15`), los cuantiles del retraso en minutos y la probabilidad de cancelación. Se distribuyen en dos contratos de información: `plan`, que solo usa horario e históricos (sin meteorología), y `T2`, que añade observaciones METAR de origen y destino con un corte de 2 horas y 10 minutos antes de la salida programada.

El autor es Slmnbal y el modelo se publicó con los pesos congelados el 22 de noviembre de 2026 tras un test final de una sola pasada sobre 2,37 millones de vuelos (marzo a agosto de 2026). El resultado principal es un ROC-AUC de 0,712 para el clasificador `T2`, una mejora de 0,056 sobre una línea base histórica por ruta y franja horaria; se superaron 5 de los 7 criterios de aceptación preregistrados. No es un modelo de lenguaje ni una red neuronal: es un conjunto de árboles incrementados para datos tabulares, con calibración de probabilidades y predicción conforme.

La relevancia de esta ficha es doble: por un lado, documenta un caso poco habitual de publicación con protocolo de test congelado y manifiesto SHA-256; por otro, advierte de que los pesos publicados no son ejecutables de extremo a extremo sin reconstruir las características históricas (codificaciones de objetivo y cuantiles por ruta × hora, destino × hora y transportista × origen) a partir de los datos públicos de BTS y METAR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient-boosted trees (LightGBM 4.7.0) |
| Parametros totales | no disponible (número de árboles y hojas no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; ventana temporal de históricos definida por la ventana de entrenamiento) |
| Tipos de cuantizacion | no disponible (los ficheros `.txt` son el formato nativo de LightGBM) |
| Idiomas soportados | en (etiquetas y documentación) |
| Licencia | MIT |
| Formato de pesos | texto nativo de LightGBM (`.txt`), más `model-spec.json` y `calibrators.json` |

## Arquitectura y entrenamiento

El modelo es un conjunto de árboles incrementados con LightGBM 4.7.0. La familia incluye un clasificador binario `ArrDel15`, un clasificador binario de cancelación y cinco modelos de regresión cuantílica sobre el retraso de llegada en minutos, en los niveles 0,10, 0,50, 0,80, 0,90 y 0,95 (el par 0,10/0,90 define el intervalo bilateral del 80 %). El post-procesado combina recalibración de Platt (logística) sobre las probabilidades, cotas superiores por conformal split para P80 y P95, y regresión cuantílica conformalizada (CQR) para el intervalo del 80 %.

Las entradas de alto nivel son horas programadas, tiempo de bloque programado, distancia, origen, transportista declarante, día de la semana, densidad de tráfico programada en origen y destino, estadísticas históricas (codificaciones de objetivo fuera de pliegue por ruta × hora, entre otras) y, en el contrato `T2`, variables METAR de origen y destino con corte en salida programada menos 2 h y 10 min (ventana de retrospectiva máxima de 3 h). Las características de calendario (mes, día del año, día del mes, días hasta festivo, semana festiva) se eliminaron de los modelos finales mediante una regla preregistrada sobre el periodo de validación. No se usan número de cola, número de vuelo ni ninguna variable posterior a la salida. La calibración principal (Platt con rodadura mensual) se reajusta cada mes con etiquetas recientes, por lo que es un procedimiento y no un fichero estático.

La validación se apoya en dos líneas base: B0 (tasa o cuantil global de entrenamiento) y B1 (tasa o cuantil histórico por ruta × bloque de hora de salida, con retroceso jerárquico ruta-hora → origen-hora → origen → global, y un mínimo de 20 observaciones en la cola para los cuantiles). B1 es la referencia de todos los criterios de aceptación y representa lo que haría un planificador mirando solo el histórico. El experimento con meteorología observada en salida y llegada se reporta únicamente como cota superior diagnóstica y no forma parte de los resultados.

## Capacidades

- Clasificación binaria de retraso de llegada de 15 minutos o más (`ArrDel15`) con probabilidad calibrada.
- Clasificación binaria de cancelación, tanto en contrato `plan` como en `T2`.
- Regresión cuantílica del retraso de llegada en minutos en los niveles 0,10, 0,50, 0,80, 0,90 y 0,95.
- Intervalos de predicción con garantía de cobertura aproximada: intervalo del 80 % vía CQR y cotas superiores conformales para P80 y P95.
- Dos modos de inferencia según el momento de la decisión: `plan` (meses antes, sin meteorología) y `T2` (2 h antes, con METAR).
- Recalibración mensual de probabilidades mediante Platt con rodadura, pensada para corregir deriva en la tasa base.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un modelo tabular de predicción puntual y distribucional.

## Casos de uso

- Planificación de flota y tripulaciones a medio plazo: con el contrato `plan` se obtiene la probabilidad de retraso y los cuantiles por ruta y franja horaria sin depender de meteorología, lo que permite dimensionar reservas de tripulación y buffers de rotación con meses de antelación.
- Gestión operativa del día de vuelo: el contrato `T2` incorpora METAR de origen y destino con corte a 2 h y 10 min de la salida, de modo que un centro de control puede reclasificar vuelos con riesgo alto y reasignar aeronaves o puertas antes del embarque.
- Avisos proactivos a pasajeros: la probabilidad calibrada de `ArrDel15` y el intervalo del 80 % permiten enviar notificaciones con margen y con una horquilla de retraso en minutos, en lugar de un aviso binario.
- Gestión de conexiones: los cuantiles P80 y P95 del retraso de llegada, junto con la probabilidad de cancelación, sirven para decidir si una conexión es viable y para priorizar reubicaciones en vuelos con cola de retraso amplia.
- Priorización de asistencia en cancelaciones: el clasificador de cancelación del contrato `T2` permite ordenar vuelos por riesgo y activar protocolos de reprotección antes de que se confirme la cancelación.
- Evaluación de políticas y análisis de puntualidad: al estar separados los contratos `plan` y `T2`, se puede cuantificar el valor marginal de la información meteorológica comparando ambos sobre el mismo vuelo, útil para justificar inversión en datos METAR.
- Investigación reproducible: el manifiesto de congelación con SHA-256 y el protocolo de test de una sola pasada permiten replicar la evaluación y auditar la selección de modelos sin fuga de información.

## Benchmarks y rendimiento

Los resultados provienen del test final de una sola pasada sobre 2,37 millones de vuelos (marzo a agosto de 2026). Solo se dispone de forma explícita del ROC-AUC del clasificador principal `T2`; el resto de métricas citadas en la model card (PR-AUC, BSS, CITL, CQR) no se acompañan de valores numéricos en la información disponible.

| Metrica | Modelo | Valor | Referencia |
|---|---|---|---|
| ROC-AUC | `t2/arr_del15-lgbm.txt` | 0,712 | B1 histórico: 0,656 (mejora de +0,056) |
| Criterios de aceptación preregistrados | Familia completa | 5 de 7 superados | B1 |
| PR-AUC | no disponible | no disponible | no disponible |
| BSS | no disponible | no disponible | no disponible |
| CITL | no disponible | no disponible | no disponible |
| Cobertura del intervalo del 80 % (CQR) | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; LightGBM ejecuta en CPU y el repositorio completo ocupa 0,2 GB, incluidos los ficheros de modelo y los JSON de especificación.
- GPU recomendadas: no se requiere GPU. Cualquier CPU x86-64 moderna sirve para inferencia por lotes; no hay datos publicados de latencia ni de throughput.
- Cabe en GPU consumer: sí, pero es irrelevante, ya que el despliegue natural es en CPU.
- Opciones de despliegue: carga directa con `lightgbm.Booster(model_file=...)` en Python; también es posible exportar a otros runtimes de LightGBM, pero no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.
- Requisito operativo crítico: para ejecutar de extremo a extremo hay que reconstruir las características históricas (codificaciones de objetivo y cuantiles por ruta × hora, destino × hora y transportista × origen) con el código del repositorio de GitHub a partir de datos públicos de BTS y METAR; los ficheros publicados no incluyen esas tablas.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos comparables de la misma categoría (predicción tabular de retrasos aéreos con publicación de pesos y protocolo de test congelado). La comparación se establece contra las líneas base internas del propio proyecto.

| Modelo | Tipo | Contexto de informacion | ROC-AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `t2/arr_del15-lgbm.txt` | LightGBM, con METAR | Salida programada − 2 h 10 min | 0,712 | MIT | Pesos publicados; features históricas no publicadas |
| `plan/arr_del15-lgbm.txt` | LightGBM, sin meteorología | Meses antes de la salida | no disponible | MIT | Pesos publicados; features históricas no publicadas |
| B1 (línea base histórica) | Tasa o cuantil por ruta × hora con retroceso jerárquico | Solo histórico de entrenamiento | 0,656 | no aplica | Procedimiento, no fichero |
| B0 (línea base global) | Tasa o cuantil global | Solo histórico de entrenamiento | no disponible | no aplica | Procedimiento, no fichero |

## Limitaciones y advertencias

- Cobertura geográfica y de operadores limitada: solo vuelos domésticos de EE. UU. desde 30 aeropuertos grandes; no se ha validado en otros mercados ni en aeropuertos regionales pequeños.
- Los pesos publicados no son autosuficientes: faltan las tablas de características históricas, en particular la de transportista × origen, que el autor no publica por considerarla una tabla de rendimiento por aerolínea. Sin reconstruirlas con el código del repositorio, el modelo no produce predicciones válidas.
- La calibración principal (Platt con rodadura mensual) es un procedimiento que se reajusta con etiquetas recientes; los `calibrators.json` incluidos son ajustes estáticos sobre Val-B (enero y febrero de 2026) y no equivalen a la calibración reportada.
- El ROC-AUC de 0,712 es moderado: indica capacidad discriminativa útil pero lejos de una separación fiable, por lo que las probabilidades deben tratarse como señales de priorización y no como certezas.
- Solo se superaron 5 de los 7 criterios de aceptación preregistrados; la model card no detalla cuáles fallaron ni con qué margen en la información disponible.
- Riesgo de alucinación no aplica en el sentido de los modelos generativos, pero sí existe riesgo de extrapolación silenciosa: fuera del periodo y de la distribución de entrenamiento, las codificaciones de objetivo y los cuantiles históricos pueden degradarse sin aviso.
- Las características de calendario se eliminaron de los modelos finales por regla preregistrada; esto puede penalizar el rendimiento en festivos y periodos estacionales atípicos.
- Idioma y documentación: la model card está en inglés y el informe del test final está en turco (`son-test-ozet.md`), lo que puede dificultar la auditoría a lectores que no manejen ese idioma.
- Licencia MIT para el código y los pesos, lo que permite uso comercial; sin embargo, la licencia no cubre las obligaciones de atribución de los datos de origen BTS y METAR, que deben verificarse por separado.
- El modelo no está afiliado a ninguna aerolínea y se basa en datos públicos; no debe usarse como única fuente para decisiones de seguridad operacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balselman/flight-delay-forecasting
- Repositorio de código, pipeline de datos y tests: https://github.com/Slmnbal/flight-delay-forecasting
- Sitio web de resultados: https://slmnbal.github.io/flight-delay-forecasting/
- Presentación (slides): https://slmnbal.github.io/flight-delay-forecasting/sunum/
- Demo interactiva con resultados precalculados del periodo de test: https://huggingface.co/spaces/balselman/flight-delay-explorer
- Informe del test final (turco): https://github.com/Slmnbal/flight-delay-forecasting/blob/main/experiments/son-test/son-test-20261122T105048Z/son-test-ozet.md
- Referencia metodológica de model cards: Mitchell et al., "Model Cards for Model Reporting" (2019)
