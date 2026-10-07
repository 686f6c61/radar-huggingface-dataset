# neuronsbyisshu/london-energy-demand-forecast-lgbm

## Resumen

El modelo `neuronsbyisshu/london-energy-demand-forecast-lgbm` es un sistema de previsión de series temporales publicado en HuggingFace por el usuario neuronsbyisshu. No es un modelo de lenguaje: se trata de un conjunto de modelos LightGBM entrenados para predecir la demanda eléctrica media horaria (en kWh) de hogares de Londres con un horizonte de 24 horas. El entrenamiento se realizó sobre 4.443 hogares londinenses con tarifa estándar, extraídos del conjunto de datos Smart Meters in London.

El artefacto incluye un modelo de predicción puntual y tres modelos de cuantiles (P10, P50, P90) calibrados mediante conformal prediction de tipo split-conformal, lo que permite ofrecer intervalos de predicción con cobertura empírica controlada. En la evaluación sobre el periodo 2014-01 a 2014-02, el modelo puntual alcanzó un MAE de 0,0111 y un sMAPE del 2,38%, lo que supone una mejora del 54,2% frente a la línea base estacional naive (t-168).

Su relevancia es práctica más que arquitectónica: es un ejemplo reproducible y ligero de previsión energética con incertidumbre calibrada, con licencia CC0-1.0, lo que permite reutilizarlo sin restricciones. El repositorio ocupa menos de 0,1 GB (redondeado a 0.0 GB en HuggingFace) y las descargas y valoraciones registradas son cero, por lo que se trata de una publicación reciente y sin tracción comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre arboles de decision (LightGBM), con variantes de regresion por cuantiles |
| Parametros totales | no disponible (la model card no declara numero de arboles, hojas ni tamano del ensemble) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable en el sentido de ventana de tokens; horizonte de prediccion de 24 horas hacia delante. La ventana de features no se detalla en la model card |
| Tipos de cuantizacion | no aplicable (los pesos son ficheros de texto de LightGBM, no pesos de red neuronal); no se declaran versiones cuantizadas |
| Idiomas soportados | no aplicable (modelo de series temporales numericas); la model card no declara idiomas |
| Licencia | cc0-1.0 |
| Formato de pesos | Ficheros de texto de LightGBM (`lightgbm_point.txt`, `lightgbm_q10.txt`, `lightgbm_q50.txt`, `lightgbm_q90.txt`), acompanados de `config.json` y `replay_test.parquet` |
| Tamano del repositorio | inferior a 0,1 GB (reportado como 0.0 GB) |
| Pipeline declarado en HuggingFace | no disponible |
| Fecha de creacion | 2026-10-07 |
| Fecha de actualizacion | 2026-10-07 |

## Arquitectura y entrenamiento

La arquitectura es un ensamble de gradient boosting implementado con LightGBM. Se publican cuatro modelos independientes: uno de regresion puntual (`lightgbm_point.txt`) y tres de regresion por cuantiles (`lightgbm_q10.txt`, `lightgbm_q50.txt`, `lightgbm_q90.txt`) que aproximan los percentiles 10, 50 y 90 de la distribucion de demanda. Los modelos de cuantiles se calibran a posteriori mediante split-conformal prediction, calculando desplazamientos sobre los residuos de un conjunto de validacion. El fichero `config.json` documenta las features empleadas, los offsets conformales, las metricas y el protocolo de particion de datos.

Los datos de entrenamiento proceden del conjunto Smart Meters in London y cubren exclusivamente el ano 2013, con 4.443 hogares de tarifa estandar. La evaluacion se realizo una sola vez sobre el periodo 2014-01 a 2014-02, lo que reduce el riesgo de seleccion de hiperparametros sobre el test. No se declara el numero de tokens ni nada equivalente, al no tratarse de un modelo de lenguaje; tampoco se mencionan fases de RLHF, DPO ni ajuste por preferencias, que no aplican a este tipo de modelo. Como innovacion destacable, la model card subraya que las predicciones incluyen variables meteorologicas y que la calibracion conformal corrige una cobertura muy deficiente de los cuantiles en bruto (64,3% frente al 80% nominal).

## Capacidades

- Prevision puntual de demanda electrica horaria media por hogar a 24 horas vista, en kWh.
- Prevision probabilistica mediante cuantiles P10, P50 y P90, con intervalos calibrados por conformal prediction.
- Cobertura empirica calibrada del 83,1% para un nivel nominal del 80%, y del 80,0% en horas punta.
- Modelado de estacionalidad horaria y semanal, segun se deduce del uso de una linea base naive con retardo de 168 horas (una semana) como referencia.
- Uso de variables meteorologicas exogenas como entrada, bajo el supuesto de disponer de un pronostico meteorologico perfecto en el momento de la prediccion.
- Inferencia en CPU, sin necesidad de GPU, dado el caracter de los modelos de arboles.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: son capacidades propias de modelos de lenguaje y no aplican a este artefacto.

## Casos de uso

- Prevision de demanda agregada para agregadores de demanda: los modelos de cuantiles permiten dimensionar margenes de reserva con un nivel de confianza declarado, usando la diferencia entre P90 y P10 como medida de incertidumbre por hora.
- Gestion de cargas en hogares con tarifa horaria: con un horizonte de 24 horas y un error del 2,38% en sMAPE, el modelo puede alimentar estrategias de desplazamiento de consumo hacia horas valle.
- Planificacion de compra de energia en comercializadoras: la prediccion por hogar sirve como bloque base para agregar carteras de clientes residenciales y estimar la demanda del dia siguiente.
- Deteccion de anomalias en contadores inteligentes: comparar la lectura real con el intervalo P10-P90 calibrado permite marcar lecturas fuera de rango como candidatas a revision.
- Investigacion academica reproducible sobre prevision energetica: el repositorio incluye `replay_test.parquet` con las predicciones del periodo de test, lo que facilita comparaciones directas sin reentrenar.
- Punto de partida para transferencia a otras ciudades o mercados: al ser modelos LightGBM con licencia CC0-1.0, se pueden reentrenar con datos locales sin restricciones legales ni coste de licencia.
- Estimacion de picos de demanda en redes de distribucion a nivel de barrio, agregando predicciones por contador para anticipar saturaciones locales.

## Benchmarks y rendimiento

Resultados publicados en la model card para el periodo de test 2014-01 a 2014-02, evaluado una sola vez:

| Modelo | MAE | RMSE | sMAPE | Diferencia vs naive |
|---|---|---|---|---|
| Seasonal-naive (t-168) | 0,0243 | 0,0372 | 5,05% | — |
| LightGBM (puntual) | 0,0111 | 0,0158 | 2,38% | -54,2% |
| Holt-Winters (estacionalidad diaria) | no disponible | no disponible | no disponible | 113% peor que la linea base naive (rechazado) |

Metricas de calibracion de los intervalos de prediccion:

| Metrica | Valor |
|---|---|
| Cobertura empirica de los cuantiles en bruto | 64,3% |
| Cobertura empirica tras calibracion conformal | 83,1% (nominal 80%) |
| Cobertura en horas punta (tras calibracion) | 80,0% |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los modelos son ensembles de arboles LightGBM almacenados como ficheros de texto; el repositorio completo ocupa menos de 0,1 GB, por lo que el consumo de memoria en inferencia es previsiblemente inferior a 1 GB. La model card no declara una cifra exacta, por lo que la estimacion debe considerarse orientativa.
- No requiere GPU. La inferencia de LightGBM se ejecuta en CPU y cabe holgadamente en cualquier portatil o instancia de computacion general.
- GPU recomendadas: no aplicable; el uso de A100, H100 o RTX 4090 no aportaria ventaja para este tipo de modelo.
- Si cabe en GPU de consumo: no es relevante, ya que la ejecucion en CPU es suficiente. Cualquier GPU de consumo podria alojarlo, pero no es el camino recomendado.
- Opciones de despliegue: la libreria `lightgbm` en Python, exportacion a ONNX mediante herramientas como `onnxmltools` o `skl2onnx`, conversion a Treelite para servir en C++ o Java, y envoltorios propios con FastAPI o Flask. No es compatible con vLLM, TGI ni Ollama, que estan disenados para modelos de lenguaje.
- Latencia y throughput: no disponibles. Al tratarse de cuatro modelos de arboles evaluados sobre 24 pasos horarios, la latencia esperada es de orden de milisegundos por lote en CPU, pero la model card no publica mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | MAE (test) | sMAPE (test) | Intervalos | Licencia |
|---|---|---|---|---|---|
| LightGBM + conformal (este modelo) | Gradient boosting con cuantiles | 0,0111 | 2,38% | Si, P10/P50/P90 calibrados al 83,1% | CC0-1.0 |
| Seasonal-naive (t-168) | Linea base estacional | 0,0243 | 5,05% | No | no aplicable |
| Holt-Winters (estacionalidad diaria) | Suavizado exponencial | no disponible | no disponible | No | no aplicable |
| Prophet | Modelo aditivo con estacionalidad | no disponible | no disponible | Si (via muestreo posterior) | MIT |
| ARIMA / SARIMAX | Modelo estadistico clasico | no disponible | no disponible | Si (analiticos) | dependiente de implementacion |
| Modelos de deep learning para series temporales (DeepAR, N-BEATS, TFT) | Redes neuronales | no disponible | no disponible | Si | dependiente de implementacion |

La model card solo aporta comparaciones cuantitativas frente a la linea base naive y una referencia cualitativa a Holt-Winters. Para el resto de alternativas no hay datos de rendimiento en la informacion disponible, por lo que no es posible establecer una comparacion numerica fiable.

## Limitaciones y advertencias

- Los dias festivos son el modo de fallo dominante: el MAE se multiplica por 2,4 respecto a la linea base, y ademas hay pocos ejemplos de festivos en el conjunto de entrenamiento.
- Las variables meteorologicas se introducen asumiendo un pronostico meteorologico perfecto en el momento de la prediccion; en produccion, el error del pronostico meteorologico degradara el rendimiento real respecto a las cifras de test.
- El modelo se entreno unicamente con datos de 2013. Cualquier cambio de regimen, como una modificacion de tarifas o una alteracion estructural del consumo, exige reentrenamiento.
- Los datos de entrenamiento cubren exclusivamente hogares de Londres con tarifa estandar (4.443 hogares), por lo que la generalizacion a otras regiones, a tarifas distintas o a perfiles industriales y comerciales es cuestionable.
- No se declaran analisis de sesgo. Existe riesgo de sesgo de seleccion por la composicion de la muestra de hogares y por el periodo temporal concreto.
- Riesgo de alucinacion: no aplicable en el sentido habitual, pero si existe riesgo de predicciones mal calibradas fuera de la distribucion de entrenamiento, especialmente en festivos y en periodos con condiciones meteorologicas extremas.
- La calibracion conformal alcanza el 83,1% de cobertura frente al 80% nominal en el conjunto de test; el exceso de cobertura observado sugiere intervalos ligeramente conservadores, aunque puede no mantenerse en datos posteriores a 2014.
- Licencia CC0-1.0: permite uso comercial, modificacion y redistribucion sin restricciones ni obligacion de atribucion. Es una de las licencias mas permisivas disponibles.
- El repositorio registra cero descargas y cero valoraciones, y no hay evidencia de validacion independiente por terceros.
- No se declara pipeline en HuggingFace, por lo que el artefacto no se puede cargar con `transformers` ni con APIs estandar de HuggingFace; requiere descarga manual y uso de la libreria LightGBM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neuronsbyisshu/london-energy-demand-forecast-lgbm
- Conjunto de datos Smart Meters in London: no disponible en la informacion proporcionada (la model card lo menciona por nombre, sin enlace)
- LightGBM (libreria y documentacion): https://github.com/microsoft/LightGBM
- Documentacion de LightGBM sobre regresion por cuantiles: https://lightgbm.readthedocs.io/en/latest/Parameters.html
- Repositorio del autor: no disponible
- Paper o blog asociado: no disponible
- Demo: no disponible (el repositorio incluye `replay_test.parquet` para reproduccion local, pero no se anuncia una demo alojada)
