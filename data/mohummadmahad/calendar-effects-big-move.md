# mohummadmahad/calendar-effects-big-move

## Resumen

Calendar Effects · big-move model es un `PipelineModel` de Spark MLlib publicado por el usuario mohummadmahad que estima, para cada valor minorista y cada dia de cotizacion, la probabilidad de que el dia siguiente registre un movimiento anomalo (un retorno anormal absoluto de al menos 1,96 veces su tamano habitual). No es un modelo de lenguaje ni una red neuronal: es un clasificador tabular basado en arboles con refuerzo de gradiente (`GBTClassifier`, `maxDepth=3`) que se ejecuta dentro de un job de Spark Structured Streaming y escribe una lista de vigilancia en cada micro-lote.

El modelo se entrena sobre 14 caracteristicas construidas por el proyecto (z-score del retorno anormal, volatilidad, beta, retorno de mercado, ratios de volumen, variables de calendario y senales de atencion derivadas de Wikipedia) y etiquetas binarias calculadas sobre el dia siguiente. La particion es temporal y purgada: ajuste en 2016-2023, seleccion de hiperparametros en el ano de validacion y prueba en 2024-2025, sin mezclar filas entre periodos.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de un estudio de eventos financieros sobre datos tabulares, con un ROC-AUC de 0,688 en prueba frente a 0,582 de una linea base trivial, y demuestra empiricamente que las caracteristicas de atencion de Wikipedia no aportan senal predictiva en este diseno. El repositorio ocupa 0,0 GB y no registra descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de Spark MLlib: `VectorAssembler` + `GBTClassifier` (arboles con refuerzo de gradiente, `maxDepth=3`) |
| Parametros totales | no disponible (el numero de arboles y su estructura no se detalla en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular; 14 caracteristicas por fila) |
| Tipos de cuantizacion | no aplica (pesos de arboles, no pesos neuronales) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | `other`, con nombre declarado `derived-statistics` |
| Formato de pesos | carpeta de `PipelineModel` de Spark MLlib (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline clasico de aprendizaje supervisado sobre datos tabulares. Un `VectorAssembler` compone las 14 caracteristicas (`abs_z_ar`, `z_ar`, `ar_sd`, `beta`, `abs_mkt_ret`, `z_views`, `attention_spike`, `log_vol_ratio`, `abnormal_return`, `days_to_event`, `days_since_event`, `day_of_week`, `month`, `is_online`) y un `GBTClassifier` con profundidad maxima 3 produce la puntuacion. El entrenamiento se realizo con PySpark 4.0.4.

La etiqueta es el evento `|z_ar| >= 1,96` del mismo valor en el dia siguiente. El diseno experimental es riguroso para un problema de series temporales: particion cronologica (ajuste 2016-2023, validacion en un ano intermedio, prueba 2024-2025), eliminacion de filas cuyo dia siguiente cae en el periodo contiguo (particion purgada) y ponderacion equilibrada de ambas clases. El umbral de alerta `big_move_alert` se fija en 0,759, correspondiente al 5 % superior de las puntuaciones del ano de validacion. Se reporta ademas una variante `no_attention` sin las dos caracteristicas de Wikipedia, que obtiene practicamente el mismo rendimiento.

## Capacidades

- Clasificacion binaria tabular: puntua la probabilidad de un movimiento anomalo al dia siguiente para cada par valor-dia.
- Generacion de listas de vigilancia en streaming: integrable en un job de Spark Structured Streaming que emite alertas por micro-lote.
- Ingenieria de caracteristicas financieras: consume z-scores de retorno anormal, volatilidad, beta, retorno de mercado, ratios de volumen y variables de calendario.
- Analisis de contribucion de caracteristicas: la model card publica importancias que permiten auditar que senales pesan en la prediccion.
- Evaluacion con particion temporal purgada: el diseno es reutilizable como plantilla metodologica.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.

## Casos de uso

- Estudio de eventos financieros reproducible: el modelo sirve como referencia metodologica para comparar disenos de particion temporal (aleatoria frente a purgada) en investigacion academica sobre retornos anomalos.
- Monitorizacion de una lista de vigilancia en produccion interna: dentro del job de Spark Structured Streaming del proyecto, puntua cada micro-lote y emite alertas cuando la puntuacion supera 0,759, lo que permite priorizar la revision manual de valores minoristas.
- Filtrado previo de candidatos para analisis cuantitativo: con una precision del 21,5 % en el 5 % superior (lift de 4,1x sobre la tasa base del 5,2 %), reduce el universo de valores-dia que un analista o un modelo posterior debe examinar.
- Deteccion de regimenes de volatilidad: la importancia dominante de `log_vol_ratio` (0,159), `abs_mkt_ret` (0,158) y `ar_sd` (0,113) lo hace util como indicador proxy de dias con probabilidad elevada de movimiento amplio en el sector minorista.
- Auditoria de fuentes de datos alternativos: la comparacion entre las variantes `all` y `no_attention` permite cuantificar el valor anadido de senales de atencion (aqui, nulo) antes de contratar o integrar un proveedor de datos.
- Docencia en pipelines de ML con Spark: el codigo de referencia (`src/ml/features.py`, `src/ml/train.py`) y la advertencia sobre incompatibilidad de versiones de Spark lo convierten en un ejemplo practico de serializacion de `PipelineModel`.
- Analisis de estacionalidad de calendario: las variables `month` (importancia 0,166, la mayor) y `day_of_week` (0,069) permiten estudiar efectos de calendario en el sector minorista.

## Benchmarks y rendimiento

Resultados en el conjunto de prueba 2024-2025 (18.696 valores-dia, tasa base 5,2 %):

| Modelo | Caracteristicas | ROC-AUC | PR-AUC | Precision del 5 % superior | Lift |
|---|---|---|---|---|---|
| gbt | todas | 0,688 | 0,135 | 21,5 % | 4,1x |
| gbt | sin atencion | 0,689 | 0,133 | 21,6 % | 4,2x |
| baseline_abs_z_ar | `abs_z_ar` | 0,582 | 0,082 | 12,6 % | 2,4x |

Importancia de caracteristicas (arboles con refuerzo de gradiente):

| Caracteristica | Importancia |
|---|---|
| `month` | 0,166 |
| `log_vol_ratio` | 0,159 |
| `abs_mkt_ret` | 0,158 |
| `ar_sd` | 0,113 |
| `days_to_event` | 0,097 |
| `days_since_event` | 0,079 |
| `day_of_week` | 0,069 |
| `abs_z_ar` | 0,050 |
| `beta` | 0,040 |
| `z_views` | 0,024 |
| `z_ar` | 0,022 |
| `is_online` | 0,019 |
| `attention_spike` | 0,002 |
| `abnormal_return` | 0,000 |

## Requisitos de hardware

- VRAM: no aplica; el modelo es un conjunto de arboles de Spark MLlib y se ejecuta en la JVM del driver y los ejecutores.
- GPU: no requiere ni aprovecha GPU; el cuello de botella es CPU y memoria del cluster Spark.
- Memoria: el repositorio ocupa 0,0 GB; el modelo cabe holgadamente en la memoria de un unico nodo, pero el `PipelineModel` se carga en el driver de Spark.
- Despliegue: exclusivamente mediante Spark MLlib (`PipelineModel.load`). No hay soporte para vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo neuronal.
- Version de Spark: entrenado con PySpark 4.0.4; la model card advierte de que un modelo guardado con esa version puede no cargarse en Spark 3.5 (el cluster del curso), en cuyo caso hay que reentrenar con `src/ml/train.py`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Caracteristicas | ROC-AUC (prueba) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| calendar-effects-big-move (gbt) | GBT de Spark MLlib | 14 | 0,688 | `derived-statistics` | Hugging Face, 0 descargas |
| baseline_abs_z_ar | Regla heuristicica | 1 (`abs_z_ar`) | 0,582 | no disponible | Referencia interna del proyecto |
| Modelos comparables de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos alternativos de la misma categoria con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Un ROC-AUC de 0,69 constituye una ventaja de ordenacion, no una estrategia de inversion; la propia model card lo senala explicitamente.
- Las puntuaciones no son probabilidades calibradas y no deben interpretarse como tales.
- El modelo reacciona sobre todo a lo que acaba de ocurrir (volumen, volatilidad, movimiento del mercado), por lo que en torno a eventos sus alertas suelen llegar un dia despues de que empiece la racha de movimientos amplios.
- Las caracteristicas de atencion de Wikipedia no aportan senal: la variante `no_attention` iguala o supera ligeramente al modelo completo, lo que sugiere ruido en esas dos variables.
- Dependencia estricta del pipeline de caracteristicas: deben construirse exactamente como en `src/ml/features.py`; cualquier desviacion invalida las predicciones.
- Riesgo de incompatibilidad de serializacion entre versiones de Spark (4.0.4 frente a 3.5).
- Ambito limitado al sector minorista y a los datos del proyecto; no hay evidencia de generalizacion a otros sectores o mercados.
- La licencia `derived-statistics` (bajo `other`) no esta detallada en la informacion disponible; conviene verificar las condiciones antes de cualquier uso comercial.
- No es asesoramiento financiero; su uso en decision de inversion sin validacion adicional es inadecuado.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohummadmahad/calendar-effects-big-move
- Dataset: https://huggingface.co/datasets/mohummadmahad/calendar-effects
- Demo (Space): https://huggingface.co/spaces/mohummadmahad/calendar-effects
