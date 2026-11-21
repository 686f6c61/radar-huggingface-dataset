# ma-pmo/release-readiness-baseline

## Resumen

`release-readiness-baseline` es un conjunto de clasificadores y regresores tabulares de scikit-learn desarrollados por el usuario `ma-pmo`. Su funcion es leer el estado de un release de Jira tal como estaba 14 o 28 dias antes de su fecha de publicacion y responder a dos preguntas: que probabilidad hay de que mas de la mitad de los issues abiertos se retrasen (`mostly_slipped`) y cual sera la tasa de retraso (`slip_rate`). Es la pieza a nivel de release del proyecto MA-PMO, complementaria del modelo `ma-pmo/release-slip-baseline`, que opera a nivel de issue.

El modelo no es una red neuronal ni un transformer: son pipelines de gradient boosting serializados con `skops`, entrenados sobre el dataset `ma-pmo/jira-release-readiness`, derivado del Public Jira Dataset (MSR 2022), con historico mayoritariamente de Red Hat y Apache. La version recomendada (v2) combina caracteristicas de release de las versiones v1 y v2 y aplica calibracion sigmoide con validacion cruzada de 5 folds, lo que produce probabilidades calibradas (ECE de 0,045 a k=14 y 0,030 a k=28).

Es relevante para equipos de ingenieria y PMO que quieran una senal cuantitativa temprana de riesgo de entrega sin depender de un LLM: el modelo es pequeno (repo de 0,1 GB), se ejecuta en CPU, es reproducible (MA-PMO 0.9.0 regenera exactamente los ficheros de metricas) y publica intervalos de confianza por bootstrap pareado. Su limitacion principal es el dominio: fue entrenado sobre historicos de Jira de proyectos open source y su calibracion debe verificarse antes de usarlo en produccion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting tabular (scikit-learn) con calibracion sigmoide; regresores v1 tambien incluidos |
| Parametros totales | no disponible (modelos de arboles; el tamano depende del numero de estimadores y hojas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (no aplica a modelos de arboles; serializacion nativa `skops`) |
| Idiomas soportados | no disponible (no procesa texto libre; consume caracteristicas tabulares) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.skops` (skops.io); metricas en JSON; scripts de entrenamiento en Python |

## Arquitectura y entrenamiento

Cada estimador es un pipeline de scikit-learn sobre caracteristicas tabulares extraidas del estado del release en el punto de corte (k = 14 o k = 28 dias antes de la fecha de publicacion). Los clasificadores v2 usan gradient boosting con 200 iteraciones, learning rate 0,05 y un minimo de 20 muestras por hoja, seguido de calibracion sigmoide con 5 folds sobre las caracteristicas de release v1 y v2. Los clasificadores v1 usan solo caracteristicas v1. El regresor v1 de `slip_rate` emplea 300 iteraciones con el mismo learning rate y minimo de hojas. Todo se entreno con scikit-learn 1.9 y semilla 0.

La particion temporal es estricta: el 70 % de releases mas antiguos (hasta 2017) para entrenamiento y el 30 % mas reciente (2017-2021) para test, de modo que ninguna release de test es anterior a una de entrenamiento. Una innovacion destacable es la decision de no enviar el regresor v2: en el 20 % mas reciente de releases de entrenamiento su MAE fue peor que usar directamente la columna `issue_risk_mean` del dataset (0,115 frente a 0,108 a k=14; 0,114 frente a 0,113 a k=28), por lo que la v2 recomienda esa columna como estimador de la tasa de retraso. El repositorio incluye los scripts `train_readiness.py` y `train_readiness_v2.py`, que con MA-PMO 0.9.0 reproducen exactamente los ficheros de metricas.

## Capacidades

- Clasificacion binaria calibrada de `mostly_slipped` (probabilidad de que mas de la mitad de los issues abiertos se retrasen) a horizontes de 14 y 28 dias.
- Estimacion de la tasa de retraso del release mediante `issue_risk_mean` (recomendado en v2) o mediante el regresor v1 con recorte a [0, 1].
- Prediccion por lotes sobre dataframes de pandas: `predict_proba` sobre las columnas de `feature_names_in_`.
- Serializacion segura con `skops.io`, con inspeccion previa de tipos no confiables mediante `get_untrusted_types`.
- Reproducibilidad completa del entrenamiento y de las metricas con la version fijada de MA-PMO.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: es un modelo tabular puro.
- No tiene capacidades multilingues porque no consume texto.

## Casos de uso

- Planificacion de releases en Jira: ejecutar el clasificador v2 a D-28 sobre el estado actual del release para obtener una probabilidad calibrada de que la mayoria de issues se retrase y decidir si conviene recortar alcance con antelacion.
- Seguimiento semanal de riesgo: recalcular a D-14 la probabilidad y la tasa esperada de retraso (`issue_risk_mean`) para comparar la evolucion del riesgo entre dos puntos de corte y detectar deterioro.
- Priorizacion de recursos de QA: usar la tasa esperada de retraso para dimensionar el esfuerzo de verificacion adicional en las releases con mayor riesgo estimado.
- Comunicacion a stakeholders: aportar una probabilidad calibrada (ECE de 0,045 a k=14) en lugar de una estimacion subjetiva del equipo, con intervalos de confianza publicados.
- Benchmark interno de procesos: comparar la calibracion del modelo sobre releases historicas propias frente a las metricas de referencia del autor y detectar desviaciones sistematicas en el proceso de entrega.
- Integracion en pipelines de CI/CD o dashboards: al ser un modelo de 0,1 GB que corre en CPU con scikit-learn, puede invocarse desde un job programado que consulte la API de Jira, construya el dataframe de caracteristicas y publique la prediccion en un panel de PMO.
- Analisis post-mortem: contrastar la prediccion a D-28 con el resultado real de releases pasadas para evaluar la utilidad de la senal en la organizacion.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test (releases posteriores a cualquiera de entrenamiento). No verificados de forma independiente (`verified: false`).

Clasificador `mostly_slipped`:

| k | Modelo | PR-AUC [IC 95 %] | ROC-AUC | Brier | ECE |
|---|---|---|---|---|---|
| 14 | Tasa base | 0,132 | 0,50 | 0,120 | 0,070 |
| 14 | Clasificador v1 | 0,516 [0,419; 0,618] | 0,89 | 0,084 | 0,048 |
| 14 | Clasificador v2 | 0,586 [0,485; 0,690] | 0,91 | 0,077 | 0,045 |
| 28 | Tasa base | 0,182 | 0,50 | 0,154 | 0,066 |
| 28 | Clasificador v1 | 0,627 [0,542; 0,715] | 0,88 | 0,100 | 0,036 |
| 28 | Clasificador v2 | 0,667 [0,587; 0,749] | 0,90 | 0,094 | 0,030 |

Estimacion de la tasa de retraso (`slip_rate`):

| k | Metodo | MAE [IC 95 %] | Spearman | R² |
|---|---|---|---|---|
| 14 | Proporcion marcada por A4 | 0,180 [0,167; 0,194] | 0,41 | −0,11 |
| 14 | Regresor v1 | 0,129 [0,121; 0,139] | 0,69 | 0,39 |
| 14 | `issue_risk_mean` (v2) | 0,107 [0,098; 0,116] | 0,76 | 0,53 |
| 28 | Proporcion marcada por A4 | 0,186 [0,174; 0,198] | 0,37 | −0,06 |
| 28 | Regresor v1 | 0,128 [0,119; 0,136] | 0,72 | 0,45 |
| 28 | `issue_risk_mean` (v2) | 0,114 [0,106; 0,122] | 0,77 | 0,56 |

Diferencias pareadas v2 frente a v1 (bootstrap sobre las mismas releases de test, IC 95 %):

| k | MAE de tasa de retraso (`issue_risk_mean` − regresor v1) | PR-AUC de `mostly_slipped` (clasificador v2 − v1) |
|---|---|---|
| 14 | −0,023 [−0,030; −0,016] | +0,071 [+0,018; +0,120] |
| 28 | −0,014 [−0,021; −0,008] | +0,040 [+0,009; +0,067] |

## Requisitos de hardware

- Inferencia en CPU: los modelos de arboles de scikit-learn no requieren GPU; el repositorio completo ocupa 0,1 GB.
- Memoria RAM: no disponible de forma explicita; por el tamano del modelo y del dataset de caracteristicas, un entorno con unos pocos GB de RAM es suficiente en la practica.
- GPU recomendadas: no aplica. No hay soporte CUDA ni ventaja medible por usar GPU.
- Cabe en cualquier portatil consumer y en entornos de CI/CD de recursos modestos.
- Opciones de despliegue: carga directa con `skops.io` en Python, servicio FastAPI o Flask envolviendo `predict_proba`, o ejecucion como job programado. No aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | PR-AUC (k=14) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `ma-pmo/release-readiness-baseline` | Gradient boosting tabular | no disponible | no aplica | 0,586 | CC BY 4.0 | Hugging Face |
| `ma-pmo/release-slip-baseline` | Modelo tabular a nivel de issue | no disponible | no aplica | no disponible | no disponible en la informacion | Hugging Face |
| Regresor v1 incluido en el repo | Gradient boosting tabular | no disponible | no aplica | no aplica (estima `slip_rate`, MAE 0,129 a k=14) | CC BY 4.0 | Hugging Face |
| Proporcion marcada por A4 (referencia) | Heuristica | no aplica | no aplica | no aplica (MAE 0,180 a k=14) | no aplica | Referencia del autor |

No se dispone de informacion sobre otros modelos publicos comparables de prediccion de retrasos de releases en Jira.

## Limitaciones y advertencias

- Entrenado sobre historicos de Jira de proyectos open source, mayoritariamente Red Hat y Apache: la calibracion puede no transferirse a organizaciones con procesos, tamanos de equipo o politicas de versionado distintas.
- Solo unas 700 releases de test, por lo que los intervalos de confianza son anchos (por ejemplo, PR-AUC a k=14 entre 0,485 y 0,690).
- El modelo predice riesgo; no identifica causas ni recomienda acciones para evitar un retraso.
- La calidad de la prediccion depende de que las caracteristicas de entrada se construyan exactamente como en el dataset de entrenamiento (`feature_names_in_`); desviaciones en la extraccion invalidan la calibracion.
- No procesa texto libre: no puede leer descripciones de issues ni comentarios, solo caracteristicas tabulares precalculadas.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero si existe riesgo de extrapolacion silenciosa fuera de la distribucion de entrenamiento.
- Sesgos conocidos: no documentados de forma explicita; cabe esperar sesgo hacia los patrones de los proyectos del dataset original.
- Licencia CC BY 4.0: permite uso comercial con atribucion. El codigo MA-PMO subyacente es AGPL-3.0 con licencia comercial disponible (contacto indicado por el autor: mjinttt@gmail.com), lo que conviene revisar si se redistribuye el pipeline de entrenamiento.
- Las metricas del model-index figuran como no verificadas (`verified: false`); deben tratarse como resultados declarados por el autor.
- Antes de usar las probabilidades en produccion, el propio autor recomienda verificar la calibracion sobre releases propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ma-pmo/release-readiness-baseline
- Dataset de entrenamiento: https://huggingface.co/datasets/ma-pmo/jira-release-readiness
- Modelo complementario a nivel de issue: https://huggingface.co/ma-pmo/release-slip-baseline
- Public Jira Dataset (MSR 2022): no disponible como enlace directo en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
