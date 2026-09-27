# julianoxdd/sla-breach-early-warning

## Resumen

sla-breach-early-warning es un clasificador tabular binario publicado por el usuario julianoxdd que estima, en el momento en que un job batch se libera en el orquestador, la probabilidad de que termine despues de su fecha limite de SLA. No es un modelo de lenguaje: es un `HistGradientBoostingClassifier` de scikit-learn 1.6.1 serializado con skops que consume 27 caracteristicas numericas derivadas del estado del sistema antes de que el job arranque (retraso aguas arriba, profundidad de cola, historicos p50 y p95 de duracion, holgura de SLA, familia de job, etc.).

Su relevancia es operativa: sustituye la regla estatica habitual (alertar cuando el retraso aguas arriba mas el p95 historico supera la holgura) por un scoring aprendido. Sobre un mes reservado con 594 incumplimientos, la regla genera 1.319 alertas con un 29% de precision, frente a 388 alertas con un 87% de precision del modelo, que ademas detecta 337 incumplimientos con antelacion; con el mismo presupuesto de 388 alertas, la regla solo detecta 161.

El artefacto ocupa unos 3 MB, se ejecuta en CPU y puntua miles de runs por segundo, lo que permite integrarlo dentro del propio orquestador. Esta entrenado exclusivamente sobre datos sinteticos del dataset julianoxdd/batch-sla-runs y se publica bajo licencia MIT como implementacion de referencia para equipos de plataforma y on-call.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting por histogramas (`sklearn.ensemble.HistGradientBoostingClassifier`) |
| Parametros totales | No disponible como recuento de parametros; 400 iteraciones de boosting, 31 hojas por arbol, learning rate 0,06, minimo de 40 muestras por hoja, regularizacion L2 = 1,0. Fichero serializado de ~3 MB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: entrada tabular de 27 caracteristicas por fila, sin ventana de contexto |
| Tipos de cuantizacion | No aplica: no se distribuyen pesos en coma flotante cuantizables; el artefacto es un modelo serializado con skops |
| Idiomas soportados | No aplica (clasificacion tabular); los metadatos de HuggingFace no declaran idiomas |
| Licencia | MIT |
| Formato de pesos | skops (`model.skops`); el autor indica que no se distribuye fichero pickle |
| Tarea (pipeline) | `tabular-classification` |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Version de scikit-learn requerida | 1.6.1 (fijada en la model card) |

## Arquitectura y entrenamiento

El modelo es un gradient boosting sobre histogramas, la implementacion nativa de scikit-learn para datos tabulares. La entrada son 27 caracteristicas numericas: 15 señales crudas del momento de liberacion del job (`scheduled_hour`, `day_of_week`, `is_month_end`, `input_rows_log10`, `volume_ratio_vs_7d`, `upstream_delay_min`, `upstream_schema_changed`, `cluster_cpu_util`, `queue_depth`, `concurrent_jobs`, `hist_p50_runtime_min`, `hist_p95_runtime_min`, `prev_run_duration_ratio`, `breaches_last_7_runs`, `sla_slack_min`), 4 ratios derivados (`slack_over_p50`, `delay_over_slack`, `expected_finish_ratio` y `p95_finish_ratio`) y una codificacion one-hot de la familia de job. El pipeline de caracteristicas esta documentado en la model card y debe replicarse exactamente en inferencia.

La evaluacion usa una particion temporal: el 70% inicial de la linea temporal para entrenamiento, el 15% siguiente para elegir el umbral con el criterio de alcanzar un 80% de precision y el 15% final (27 dias, 2.920 runs) como test, evaluado una sola vez. Los intervalos de confianza provienen de un bootstrap que remuestrea dias completos, no filas. El autor reporta ademas una validacion sobre cinco datasets regenerados de forma independiente (0,826 de PR AUC con desviacion tipica 0,007). No se menciona ningun tipo de ajuste por refuerzo (RLHF/DPO), que no aplica a este tipo de modelo.

## Capacidades

- Clasificacion binaria tabular: devuelve la probabilidad de incumplimiento de SLA en el momento de liberacion del job, no una prediccion de duracion.
- Salida probabilistica calibrada (`predict_proba`); el autor reporta un ECE de 0,024 en test, lo que permite fijar umbrales por presupuesto de alertas.
- Uso exclusivo de informacion disponible antes de que el run empiece, de modo que la alerta llega con toda la holgura de SLA todavia disponible.
- Inferencia en CPU pura, sin GPU, con un coste de aproximadamente 3 MB de modelo.
- Rendimiento declarado de miles de runs por segundo en un unico nucleo de CPU.
- Integrable como paso previo al lanzamiento del job en un orquestador (Airflow, Dagster, Prefect, etc.).
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: la entrada es exclusivamente numerica y categorica.
- No incluye modo de pensamiento ni procesamiento de audio o imagen.

## Casos de uso

- Alerta temprana en orquestadores batch: el modelo se ejecuta justo antes de liberar el job, con las 15 señales de release time y el historico disponible; si la probabilidad supera el umbral, se emite una alerta con toda la holgura de SLA aun por consumir, lo que permite actuar (repintar prioridad, ampliar recursos) en lugar de reaccionar a posteriori.
- Dimensionado del presupuesto de alertas del equipo on-call: como la salida esta calibrada, el equipo puede fijar un numero maximo de alertas por dia y derivar el umbral correspondiente; el autor reporta que con 388 alertas el modelo alcanza un 86,9% de precision frente al 29% de la regla p95.
- Triage y priorizacion de la cola: usar la probabilidad como score de ordenacion para decidir que runs reciben primero la capacidad disponible cuando hay contencion en el cluster.
- Autoescalado preventivo: conectar la probabilidad a un controlador que solicite nodos adicionales solo cuando el riesgo de incumplimiento supera un umbral, evitando reservar capacidad de forma permanente.
- Analisis de causa raiz en postmortems: la recall desagregada por causa (retraso aguas arriba 89%, pico de volumen 65%, contencion de cluster 41%) ayuda a identificar que clase de incidente es detectable con antelacion y cual no lo es por construccion.
- Monitorizacion de deriva y disparadores de reentrenamiento: comparar la calibracion observada con la del entrenamiento en cada ventana temporal permite detectar cuando la capacidad del cluster ha cambiado y el umbral ha dejado de ser valido.
- Implementacion de referencia para plataformas: el repositorio asociado incluye codigo de entrenamiento, evaluacion y tests, de modo que un equipo puede sustituir el dataset sintetico por su propio historico de orquestador y reentrenar el mismo pipeline.
- Investigacion academica sobre alertas anticipadas en sistemas distribuidos: sirve como baseline tabular reproducible con particion temporal y bootstrap por dias en lugar de por filas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (ninguno marcado como verificado):

| Metrica | Valor | Verificado |
|---|---|---|
| PR AUC (average precision) | 0,819 | No |
| ROC AUC | 0,918 | No |
| Brier score | 0,078 | No |
| Recall con precision del 80% | 0,643 | No |

Comparativa de scorers incluida por el autor en la seccion de evaluacion (test: ultimos 27 dias, 2.920 runs):

| Scorer | PR AUC (IC 95%) | ROC AUC | Recall a 80% de precision | Brier | ECE |
|---|---|---|---|---|---|
| Regla p95 (baseline) | 0,384 (0,355–0,416) | 0,679 | 0,054 | n/a | n/a |
| Regresion logistica | 0,804 (0,768–0,835) | 0,914 | 0,621 | 0,081 | 0,018 |
| Este modelo | 0,819 (0,781–0,850) | 0,918 | 0,643 | 0,078 | 0,024 |

Datos adicionales reportados por el autor:

- En el punto de operacion elegido (umbral 0,664) la precision en test es del 86,9% y el recall del 56,7%.
- La ganancia de PR AUC frente a la regresion logistica medida con bootstrap pareado por dias es de 0,002 a 0,026: positiva pero pequeña.
- Sobre cinco datasets regenerados independientemente: 0,826 de PR AUC (desviacion tipica 0,007) frente a 0,811 (0,017) de la regresion logistica y 0,442 (0,030) de la regla.
- Recall por causa raiz en el punto de operacion: retraso aguas arriba 89%, pico de volumen 65%, contencion de cluster 41%, sesgo de datos (data skew) 15%, interrupcion de instancias spot 15%.

No se han publicado resultados de benchmarks de proposito general (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- No requiere GPU: la inferencia es exclusivamente en CPU.
- VRAM estimada: no aplica (0 MB de VRAM). La huella en memoria del artefacto serializado es de unos 3 MB mas el overhead del interprete de Python y pandas.
- GPU recomendadas: ninguna. El modelo puede ejecutarse en cualquier maquina capaz de correr scikit-learn 1.6.1.
- Caber en GPU de consumo: no aplica; no necesita GPU de consumo ni integrada. Cabe en cualquier instancia de CPU, incluido un contenedor con limites de memoria del orden de decenas de MB.
- Dependencias de ejecucion: `scikit-learn==1.6.1`, `skops`, `pandas`, `pyarrow` y `huggingface_hub`.
- Opciones de despliegue: carga directa con `skops.io.load` en un proceso Python, servicio HTTP propio (FastAPI, Flask), tarea programada o DAG de orquestador, y puntuacion por lotes sobre ficheros Parquet. No es compatible con vLLM, TGI, llama.cpp ni Ollama, que estan orientados a modelos de lenguaje.
- Latencia y throughput: el autor declara "miles de runs por segundo en una CPU". No se publican medidas de latencia por peticion ni cifras de throughput mas detalladas, por lo que no estan disponibles.
- Consideracion de seguridad en la carga: la model card recomienda inspeccionar los tipos no confiables con `skops.io.get_untrusted_types()` antes de cargar el modelo.

## Comparativa con modelos similares

El autor proporciona dos alternativas evaluadas sobre el mismo dataset y la misma particion temporal, que son las unicas comparaciones con datos disponibles:

| Alternativa | Tipo | PR AUC | ROC AUC | Recall a 80% de precision | Licencia y disponibilidad |
|---|---|---|---|---|---|
| Regla p95 estatica | Regla heuristica sobre el p95 historico | 0,384 | 0,679 | 0,054 | Implementacion propia, sin dependencias |
| Regresion logistica | Modelo lineal sobre las mismas 27 caracteristicas | 0,804 | 0,914 | 0,621 | Implementacion propia con scikit-learn, MIT |
| sla-breach-early-warning | Gradient boosting por histogramas | 0,819 | 0,918 | 0,643 | MIT, disponible en HuggingFace |
| XGBoost / LightGBM / CatBoost | Gradient boosting de proposito general | No disponible | No disponible | No disponible | Licencias Apache 2.0 / MIT / Apache 2.0; no se han publicado comparativas contra este modelo |
| TabPFN | Transformer preentrenado para clasificacion tabular | No disponible | No disponible | No disponible | Licencia propia; no se han publicado comparativas contra este modelo |

La diferencia del modelo frente a la regresion logistica es de 0,015 en PR AUC, con un intervalo bootstrap pareado de 0,002 a 0,026. El propio autor señala que la mayor parte del valor procede del scoring aprendido sobre caracteristicas del momento de liberacion y no de la capacidad del modelo, por lo que una regresion logistica sobre las mismas caracteristicas es una alternativa razonable cuando se prioriza simplicidad y auditabilidad.

## Limitaciones y advertencias

- Entrenado unicamente con datos sinteticos: el umbral de 0,664 y las metricas absolutas no son transferibles a una plataforma real; el autor recomienda reentrenar con el historico propio del orquestador.
- El modelo puntua cada run de forma independiente y no modela cascadas dentro de un DAG, por lo que no anticipa fallos en cadena.
- Asume que el run anterior del mismo job ya ha terminado cuando se calculan las caracteristicas de historico; esta suposicion puede no cumplirse en ejecuciones solapadas.
- La calibracion se degrada con el tiempo: el autor advierte de que, dado que la capacidad del cluster varia en la simulacion, la calibracion empeora sin reentrenamiento, y lo mismo ocurre en produccion.
- Recall bajo en causas que no son observables antes del arranque: 15% en data skew y 15% en interrupcion de instancias spot. El autor lo describe como techo esperado y no como un defecto a corregir por ajuste de hiperparametros.
- El umbral elegido (0,664) implica un recall del 56,7% con una precision del 86,9%: mas de un 40% de los incumplimientos no se detectan con antelacion en ese punto de operacion.
- Ninguna de las metricas del `model-index` esta verificada; todas proceden del autor.
- Repositorio sin descargas ni likes en el momento de la consulta y sin validacion externa independiente publicada.
- Inconsistencia documental: el autor describe 27 caracteristicas como suma de 15 señales crudas, 4 ratios y una codificacion one-hot de la familia de job, pero el listado de familias incluido en el codigo de ejemplo tiene 4 valores (`ingest`, `transform`, `export`, `feature`), lo que daria 23 columnas. Conviene verificar el numero real de columnas antes de integrar el modelo en produccion.
- Requiere replicar exactamente el orden y el nombre de las caracteristicas; cualquier cambio en el pipeline de ingenieria de caracteristicas invalida el modelo.
- La version de scikit-learn esta fijada en 1.6.1; cargar el artefacto con otras versiones puede provocar incompatibilidades.
- La licencia MIT permite uso comercial y modificacion sin restricciones, pero no ofrece ninguna garantia por parte del autor.
- Al deserializar con skops conviene revisar los tipos no confiables antes de ejecutar el modelo, tal y como indica la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/julianoxdd/sla-breach-early-warning
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/julianoxdd/batch-sla-runs
- Codigo de entrenamiento, evaluacion y tests: https://github.com/julianodutraa/sla-early-warning
- Proyecto de alertas de SLA no relacionado (otro autor, mismo dominio): https://github.com/anasabidshaikh/sla-breach-alert
- El resto de resultados de la busqueda web consultada corresponden a noticias sobre incidentes de seguridad en HuggingFace y OpenAI sin relacion con este modelo, por lo que no se incluyen como referencias tecnicas.
