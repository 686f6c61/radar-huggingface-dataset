# cbratkovics/nba-stat-predictor

## Resumen

`cbratkovics/nba-stat-predictor` es un conjunto de tres regresores LightGBM independientes que predicen la linea estadistica de un jugador de la NBA en un partido concreto: puntos (`pts`), rebotes (`reb`) y asistencias (`ast`). No es un modelo de lenguaje ni un transformer: es un modelo tabular de regresion supervisada sobre caracteristicas historicas del jugador, construido por el usuario cbratkovics como proyecto de portafolio personal y no comercial.

El modelo se entrena exclusivamente con informacion anterior al partido objetivo (medias moviles a 5, 10 y 20 partidos, medias de temporada, dias de descanso, `back_to_back`, condicion de local y medias historicas contra el rival), lo que evita fuga de informacion temporal. El conjunto de entrenamiento abarca 88.257 filas de las temporadas 2021-22 a 2024-25, y la evaluacion se realiza sobre una temporada holdout completa (2025-26, 22.630 filas) que nunca se usa para ajustar ni para seleccionar hiperparametros.

Su relevancia es acotada y practica: sirve como referencia reproducible de modelado tabular deportivo, con baselines explicitos y metricas publicadas (MAE, RMSE y R² sobre 22.244 filas evaluables), y como utilidad para herramientas de analitica o fantasy basketball que necesiten una estimacion puntual rapida, en CPU y sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre arboles de decision (LightGBM), un regresor independiente por objetivo |
| Parametros totales | no disponible (no se publica numero de arboles, hojas ni nodos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular; 23 caracteristicas de entrada por fila) |
| Tipos de cuantizacion | no disponible (no procede; el formato nativo de LightGBM es texto) |
| Idiomas soportados | en (etiqueta de idioma del repositorio; el modelo no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | texto plano de LightGBM (`lgbm_pts.txt`, `lgbm_reb.txt`, `lgbm_ast.txt`) mas `metrics.json` |
| Pipeline declarado | tabular-regression |
| Dataset de entrenamiento | `cbratkovics/nba-game-logs`, version `hf:b20b5601de213fa8e704ebffaafd18f182ea68c3` |
| Objetivos de prediccion | puntos, rebotes, asistencias (una linea de box-score por jugador y partido) |
| Fecha de entrenamiento | 2026-09-12 (commit `50a3b2e33b443d1db19274cea27467072ebfb3f8`) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un ensamblado de gradient boosting con LightGBM, con un modelo separado por cada estadistica objetivo. Cada arbol se ajusta sobre un vector de 23 caracteristicas calculadas unicamente con partidos estrictamente anteriores al partido objetivo: medias de puntos, rebotes, asistencias y minutos en ventanas de 5, 10 y 20 partidos; medias de temporada de las mismas cuatro variables; partidos jugados en la temporada; dias de descanso; indicador de `back_to_back`; indicador de partido en casa; y medias historicas de puntos, rebotes y asistencias contra el rival concreto. Las filas de entrenamiento se restringen a partidos en los que el jugador acumulo al menos 10,0 minutos.

El reparto temporal es estricto: entrenamiento con 88.257 filas del 19 de octubre de 2021 al 13 de abril de 2025 (temporadas 2021-22 a 2024-25) y holdout con 22.630 filas del 21 de octubre de 2025 al 12 de abril de 2026 (temporada 2025-26), sin uso del holdout para ajuste ni seleccion de configuracion. No se documenta ningun proceso de refinamiento posterior (RLHF, DPO ni similar), ni tecnicas de decodificacion especulativa, atencion lineal o similares, porque no aplican a un modelo tabular. Los datos de box-score proceden de NBA.com (relleno CC0 de Kaggle y `nba_api` para actualizaciones).

## Capacidades

- Prediccion puntual de puntos por partido (`pts`) para jugadores con al menos 10 minutos en cancha.
- Prediccion puntual de rebotes por partido (`reb`).
- Prediccion puntual de asistencias por partido (`ast`).
- Uso de historial multivariante del jugador: ventanas de 5, 10 y 20 partidos, medias de temporada y minutos.
- Ajuste por contexto de calendario y sede: `days_rest`, `back_to_back`, `home`.
- Ajuste por historial especifico contra el rival (`pts_mean_vs_opp`, `reb_mean_vs_opp`, `ast_mean_vs_opp`).
- Salida numerica continua (regresion), no texto; no genera explicaciones ni resumenes.
- Manejo de valores ausentes nativo de LightGBM (sin necesidad de imputacion explicita por parte del usuario).
- No dispone de tool calling, function calling, modo agente, razonamiento multi-paso, vision, audio ni capacidades multilingues.

## Casos de uso

- Proyecciones para fantasy basketball: dado el historial del jugador y el contexto del partido (descanso, localia, rival), el modelo devuelve una estimacion de puntos, rebotes y asistencias que alimenta rankings semanales o decisiones de alineacion.
- Cuadros de mando de analitica deportiva: integrar los tres regresores en un panel interno que compare la proyeccion del modelo con el rendimiento observado y con la media de los ultimos 10 partidos.
- Modelado de props en investigacion cuantitativa: usar la prediccion como componente de un pipeline de estudio de mercados, teniendo en cuenta que el modelo no incorpora lineas de apuestas, lesiones ni alineaciones.
- Analisis previo de partidos para medios o contenido editorial: generar una tabla de proyecciones por jugador para previas y articulos, a partir de caracteristicas historicas publicas.
- Docencia y prototipado de machine learning tabular: el repositorio incluye baselines explicitos (`baseline_last10`, `baseline_season`), lo que permite estudiar fuga temporal, validacion por temporada y comparacion de modelos con un caso real.
- Deteccion de anomalias y seguimiento de jugadores: comparar la proyeccion con el box-score real para marcar actuaciones muy por encima o por debajo de lo esperado segun su historial.
- Transferencia a otros objetivos estadisticos: la misma receta de caracteristicas (ventanas moviles, contexto de calendario, historial contra rival) es reutilizable para triples, robos, tapones o minutos, reentrenando los regresores correspondientes.
- Automatizacion de informes periodicos: ejecutar la inferencia en lote sobre los rosters de la jornada para producir ficheros de proyecciones diarios en un pipeline de datos.

## Benchmarks y rendimiento

Metricas publicadas por el autor sobre la temporada holdout 2025-26, comparadas con dos baselines (`baseline_last10`: media de los 10 partidos previos; `baseline_season`: media de la temporada hasta la fecha). Las tres predicciones se evaluan sobre las mismas 22.244 filas, aquellas en las que ambos baselines estan definidos.

| Objetivo | Predictor | MAE | RMSE | R² | n |
|---|---|---:|---:|---:|---:|
| pts | modelo | 4,764 | 6,160 | 0,457 | 22.244 |
| pts | baseline_last10 | 4,908 | 6,393 | 0,415 | 22.244 |
| pts | baseline_season | 4,946 | 6,467 | 0,401 | 22.244 |
| reb | modelo | 1,942 | 2,527 | 0,402 | 22.244 |
| reb | baseline_last10 | 2,009 | 2,644 | 0,346 | 22.244 |
| reb | baseline_season | 2,008 | 2,659 | 0,338 | 22.244 |
| ast | modelo | 1,431 | 1,909 | 0,461 | 22.244 |
| ast | baseline_last10 | 1,460 | 1,967 | 0,427 | 22.244 |
| ast | baseline_season | 1,456 | 1,973 | 0,424 | 22.244 |

La mejora del modelo sobre el mejor baseline es modesta: entre 0,04 y 0,10 puntos de MAE en `pts`, 0,07 en `reb` y 0,03 en `ast`, con incrementos de R² de 0,042 (`pts`), 0,056 (`reb`) y 0,034 (`ast`) frente a `baseline_last10`. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM para inferencia: no aplica; LightGBM ejecuta la inferencia en CPU y no requiere GPU.
- GPU recomendadas: no aplica. No hay soporte ni necesidad de A100, H100 o RTX 4090.
- Compatibilidad con hardware de consumo: si; funciona en cualquier CPU de portatil o servidor, sin requisitos de acelerador.
- Memoria RAM: no disponible en la documentacion; el consumo depende del numero de arboles y hojas por modelo, no publicado.
- Opciones de despliegue: carga directa con la libreria LightGBM en Python a partir de los ficheros `.txt`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos tabulares.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: los pesos se distribuyen como tres ficheros de texto de LightGBM mas un `metrics.json`; el tamano exacto no esta publicado.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada otros modelos publicados de prediccion de estadisticas NBA directamente comparables. La comparacion disponible es contra los baselines definidos por el propio autor sobre la misma temporada holdout y las mismas filas:

| Alternativa | Tipo | MAE pts | MAE reb | MAE ast | R² pts | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---:|---|---|
| `cbratkovics/nba-stat-predictor` | LightGBM por objetivo | 4,764 | 1,942 | 1,431 | 0,457 | MIT | HuggingFace |
| `baseline_last10` | Media de los 10 partidos previos | 4,908 | 2,009 | 1,460 | 0,415 | no aplica | definido en la model card |
| `baseline_season` | Media de la temporada hasta la fecha | 4,946 | 2,008 | 1,456 | 0,401 | no aplica | definido en la model card |

El modelo supera a ambos baselines en las tres metricas y en los tres objetivos, con una ventaja mas clara en R² que en MAE.

## Limitaciones y advertencias

- Solo predice para jugadores que juegan: no estima minutos ni DNPs, y la evaluacion se limita a partidos con al menos 10,0 minutos disputados.
- No incorpora lesiones, alineaciones, lineas de apuestas ni fuerza del rival, factores con impacto directo en el box-score.
- Solo cubre temporada regular; no hay validacion en playoffs ni en pretemporada.
- La varianza partido a partido de las estadisticas es alta: el propio autor recomienda leer los resultados contra los baselines y no como error absoluto aislado.
- Las ganancias frente a una media movil de 10 partidos son pequenas (0,03-0,10 de MAE), por lo que el valor anadido en produccion es limitado.
- Riesgo de deriva temporal: el modelo se entreno en 2026 con datos hasta abril de 2026; cambios de reglas, plantillas o estilos de juego pueden degradar las predicciones sin reentrenamiento.
- Sesgos potenciales: el filtro de 10 minutos minimos excluye jugadores de banquillo y refuerza patrones de jugadores con rol estable; no se documenta ningun analisis de sesgo por posicion, equipo, nacionalidad ni genero.
- Licencia: el repositorio se publica bajo MIT, pero la model card lo describe como proyecto personal no comercial y los datos de NBA.com se usan solo para estudio personal no comercial. Conviene revisar los terminos de la fuente de datos antes de cualquier uso comercial, pese a la etiqueta MIT.
- No es un modelo de lenguaje: no genera texto, no responde a instrucciones, no soporta tool calling ni agentes, y no debe presentarse como tal.
- Sin resultados de benchmarks independientes: las unicas metricas disponibles son las publicadas por el autor, sin replicacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cbratkovics/nba-stat-predictor
- Dataset de entrenamiento: https://huggingface.co/datasets/cbratkovics/nba-game-logs
- Version concreta del dataset: `hf:b20b5601de213fa8e704ebffaafd18f182ea68c3`
- Commit de entrenamiento: `50a3b2e33b443d1db19274cea27467072ebfb3f8`
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas de soporte de Microsoft sin relacion con el contenido de la ficha).
