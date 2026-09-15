# ibm-granite/granite-timeseries-patchtst-fm-r2

## Resumen

Granite TimeSeries PatchTST-FM-r2 es un modelo fundacional de series temporales desarrollado por IBM dentro de la familia Granite. Se trata de un modelo de predicción zero-shot: dado un historial de una serie temporal, genera pronósticos para horizontes futuros sin necesidad de reentrenamiento ni ajuste específico sobre el dominio objetivo. Es la segunda iteración del variante fundacional de PatchTST, construida sobre el PatchTST original y sobre PatchTST-FM-r1, e incorpora cambios arquitectónicos y una base de entrenamiento ampliada.

El modelo tiene aproximadamente 385 millones de parámetros (384.600.208 según los pesos en safetensors), una dimensión oculta de 1024, parches de longitud 16 y una longitud de contexto de 8192 muestras. La innovación principal de la versión r2 es la sustitución de los bloques transformer convencionales por bloques Conformer (atención multi-cabeza seguida de una capa convolucional), con kernels alternantes de tamaños 3 y 5 en un patrón repetido {5, 5, 3, 3}, y un aumento del número de bloques de 20 a 30 para absorber el mayor volumen de datos de entrenamiento.

Su relevancia actual radica en que, según la model card, a fecha de 31 de agosto de 2026 es el modelo zero-shot con mejor rendimiento publicado bajo una licencia permisiva y apta para uso comercial en el benchmark GIFT-Eval, y ocupa la segunda posición entre todos los modelos zero-shot replicables. La licencia dual (OpenMDW 1.0 y Apache 2.0) y su tamaño contenido, apto para GPU de consumo, lo convierten en una opción práctica para despliegues de forecasting en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PatchTST con bloques Conformer (transformer con subcapa convolucional tras la atencion multi-cabeza) |
| Parametros totales | 384.600.208 (~385 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors, presumiblemente fp32/bf16; no se detallan variantes cuantizadas) |
| Idiomas soportados | No disponible / no aplica: el modelo opera sobre series temporales numericas, no procesa lenguaje natural |
| Licencia | Doble licencia: OpenMDW License 1.0 y Apache License 2.0 (el usuario puede elegir cualquiera de las dos) |
| Formato de pesos | safetensors |
| Dimension oculta | 1024 |
| Longitud de parche | 16, con solapamiento y zancada (stride) de 8 |
| Numero de bloques | 30 |
| Cabeza de cuantiles | 99 cuantiles |
| Pipeline | time-series-forecasting |
| Tamano del repositorio | 3,1 GB |
| Descargas / likes | 29.919 descargas / 13 likes |
| Fechas | Creado el 2026-08-07, actualizado el 2026-09-09 |

## Arquitectura y entrenamiento

PatchTST-FM-r2 parte del esquema PatchTST, que divide la serie temporal en parches tratados como tokens y aplica un encoder transformer. En la version r2, los bloques transformer planos se sustituyen por bloques Conformer, que intercalan la capa de atencion multi-cabeza (MHSA) entre dos FFN de "medio paso" con una capa convolucional en medio. La convolucion captura informacion de corto plazo entre parches contiguos, lo que libera a la atencion para modelar relaciones de largo plazo. Los kernels convolucionales alternan tamanos 3 y 5 siguiendo el patron repetido {5, 5, 3, 3}. El numero de bloques pasa de 20 (r1) a 30 para acomodar el mayor volumen de datos de entrenamiento, y se anade una normalizacion de capa previa a la cabeza (pre-head layer norm) para mejorar la estabilidad del entrenamiento.

El modelo utiliza parches solapados de tamano 16 con zancada 8, una ponderacion de la perdida mediante ventana de Hamming durante el entrenamiento y una estrategia de overlap-and-add en inferencia para reconstruir el pronostico. La cabeza de salida genera 99 cuantiles, lo que permite producir intervalos de prediccion ademas del valor central. La longitud de contexto de entrenamiento es de 8192, igual que en r1, y la dimension oculta es 1024.

Los datos de entrenamiento son diversos y se amplian respecto a r1 con datos sinteticos generados mediante el metodo CauKer (el mismo empleado en el entrenamiento de Granite-FlowState). La model card no especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en sentido estricto a un modelo de forecasting). Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal para este modelo.

## Capacidades

- Prediccion zero-shot de series temporales: genera pronosticos sobre dominios no vistos durante el entrenamiento, sin ajuste fino ni reentrenamiento.
- Prediccion cuantilica: la cabeza de 99 cuantiles permite obtener intervalos de prediccion y no solo una estimacion puntual.
- Contexto largo: ventana de 8192 muestras, adecuada para series con estacionalidades amplias o historicos extensos.
- Forecasting multivariante mediante el pipeline de forecasting de la libreria granite-tsfm, configurando `target_columns` e `id_columns`.
- Control del horizonte de prediccion mediante el parametro `prediction_length`, sin limite arquitectonico documentado mas alla del contexto.
- Manejo de frecuencias temporales explicitas mediante el parametro `freq` del pipeline (por ejemplo, `1h` en el ejemplo de la model card).
- Imputacion configurable de valores faltantes mediante el parametro `impute_method` (desactivado en el ejemplo oficial con valor `None`).
- Compatibilidad hacia atras con los checkpoints de PatchTST-FM-r1 a traves de la implementacion del repositorio IBM TSFM.
- Integracion con el ecosistema HuggingFace mediante `PatchTSTFMForPrediction` y `TimeSeriesForecastingPipeline` de `tsfm_public`.
- No dispone de soporte de tool calling, function calling, agentes, vision, audio ni capacidades multilingues: es un modelo especializado exclusivamente en series temporales numericas.

## Casos de uso

- Prevision de demanda electrica: el modelo puede consumir las ultimas 8192 lecturas horarias de consumo y emitir pronosticos con intervalos cuantilicos, lo que permite planificar generacion y reservas con bandas de incertidumbre explicitas gracias a la cabeza de 99 cuantiles.
- Mantenimiento predictivo industrial: aplicado a series de sensores (vibracion, temperatura, presion) para anticipar desviaciones respecto al comportamiento esperado, aprovechando la capacidad zero-shot para operar sobre equipos y dominios sin historico etiquetado previo.
- Gestion de energia en edificios y redes: el ejemplo oficial de la model card usa el dataset ETTh1 con frecuencia horaria, contexto de 512 y horizonte de 64, un escenario directamente trasladable a la prevision de carga en instalaciones.
- Planificacion de inventario y demanda comercial: pronostico de ventas por producto o tienda a partir de series historicas, sin necesidad de entrenar un modelo por cada referencia, lo que reduce el coste operativo frente a enfoques por serie.
- Monitorizacion de KPIs de negocio: prevision de metricas como trafico web, volumen de transacciones o tasa de conversion para detectar anomalias por comparacion entre el valor observado y el intervalo de prediccion.
- Forecasting financiero y de mercados: generacion de escenarios con cuantiles para series de precios o volumenes, util como entrada a modelos de riesgo que necesiten distribuciones y no solo puntos.
- Prediccion meteorologica y medioambiental: pronostico de variables como temperatura, precipitacion o calidad del aire a partir de estaciones de medida, con la ventaja de funcionar en ubicaciones sin serie historica propia.
- Capacidad de forecasting como servicio: dado el tamano del modelo (385 M de parametros) y su licencia Apache 2.0, puede desplegarse como endpoint multiusuario que atienda series de distintos clientes sin reentrenamiento por cliente.

## Benchmarks y rendimiento

La model card no proporciona cifras numericas concretas (valores de CRPS o MASE) en el texto disponible, sino unicamente posiciones en el ranking del benchmark GIFT-Eval a fecha de 31 de agosto de 2026.

| Benchmark | Metrica | Resultado |
|---|---|---|
| GIFT-Eval (solo modelos zero-shot, replicables, sin test leak) | CRPS (media geometrica) | Posicion 2 |
| GIFT-Eval (solo modelos zero-shot, replicables, sin test leak) | MASE (media geometrica) | Posicion 2 |
| GIFT-Eval (incluyendo modelos pretrained y zero-shot replicables) | CRPS | Posicion 3 |
| GIFT-Eval (incluyendo modelos pretrained y zero-shot replicables) | MASE | Posicion 4 |

La model card indica ademas que, a esa misma fecha, es el modelo zero-shot con mejor rendimiento publicado bajo una licencia permisiva y apta para uso comercial, y que supera a varios modelos pretrained (aquellos que pueden usar la parte de entrenamiento de los datasets de evaluacion de GIFT-Eval en su corpus de preentrenamiento). Los resultados de PatchTST-FM-r2 en GIFT-Eval se encontraban, en el momento de redaccion de la model card, en una pull request pendiente de aceptacion.

No se han publicado valores numericos absolutos de MMLU, HumanEval, GSM8K ni equivalentes, ya que el modelo no aborda tareas de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros; no confirmada por el autor): aproximadamente 1,5 GB en fp32, 0,77 GB en bf16/fp16, 0,39 GB en int8 y en torno a 0,2 GB en int4.
- A la VRAM de los pesos hay que sumar la memoria de activaciones y de la matriz de atencion. Como referencia, con contexto completo de 8192 y zancada 8 se generan unos 1024 tokens de parche; la matriz de atencion de 1024 x 1024 por capa y por cabeza, en precision de 16 bits, supone del orden de decenas de MB por capa, por lo que conviene reservar un margen adicional sobre el peso del modelo.
- GPU recomendadas: el modelo cabe sin dificultad en cualquier GPU de consumo moderna con al menos 4-6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070, RTX 4090), asi como en GPU profesionales (A100, H100, L40S) cuando se requiere alto throughput o lotes grandes.
- Si cabe en GPU de consumo: si, con margen amplio en fp16/bf16 dado el tamano de 385 M de parametros. El repositorio completo ocupa 3,1 GB, por lo que el almacenamiento necesario es reducido.
- Opciones de despliegue: la via oficial documentada es la libreria `granite-tsfm` (version >= 0.3.9) con `PatchTSTFMForPrediction` y `TimeSeriesForecastingPipeline`. No se documentan en la informacion disponible integraciones con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a forecasting de series temporales. Existe implementacion en la libreria Transformers de HuggingFace (`model_doc/patchtst`) para la arquitectura PatchTST base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Numero de bloques | Licencia | Zero-shot |
|---|---|---|---|---|---|---|
| Granite TimeSeries PatchTST-FM-r2 | ~385 M | 8192 | PatchTST con bloques Conformer, parches solapados 16/8 | 30 | OpenMDW 1.0 o Apache 2.0 | Si |
| Granite TimeSeries PatchTST-FM-r1 | No disponible | 8192 | PatchTST con bloques transformer planos | 20 | No disponible en la informacion proporcionada | Si |
| Granite TimeSeries FlowState-r1 | No disponible | No disponible | No disponible (se cita como modelo de la misma familia) | No disponible | No disponible en la informacion proporcionada | Si |
| PatchTST original | No disponible | No disponible | PatchTST | No disponible | No disponible en la informacion proporcionada | No (requiere ajuste por tarea) |

La model card solo aporta comparaciones cualitativas: r2 mejora a r1 gracias a los bloques Conformer, los parches solapados con ponderacion Hamming, el mayor numero de bloques y los datos sinteticos CauKer. No se ofrecen cifras de parametros ni de rendimiento de los modelos alternativos dentro de la informacion disponible.

## Limitaciones y advertencias

- Ambito restringido: el modelo solo procesa series temporales numericas. No genera texto, codigo, ni admite tool calling, agentes, vision o audio.
- Idiomas: no aplica ningun soporte linguistico; no debe esperarse tratamiento de texto ni de etiquetas categoricas en lenguaje natural.
- Riesgo de predicciones incorrectas fuera de dominio: aunque el modelo esta disenado para funcionar zero-shot, no hay garantia de comportamiento correcto en regimenes con cambios estructurales, datos no estacionarios o dominios muy alejados de la distribucion de entrenamiento. No se documentan metricas de calibracion de los 99 cuantiles fuera de GIFT-Eval.
- Sesgos: no se documentan analisis de sesgo. Dado que el modelo aprende de un corpus de series temporales, puede heredar sesgos de los dominios sobrerrepresentados en los datos de entrenamiento, lo que afectaria a su precision relativa entre distintos campos de aplicacion.
- Datos sinteticos: parte del entrenamiento emplea datos generados con el metodo CauKer, lo que puede introducir artefactos propios del generador sintetico.
- Composicion del dataset no publicada: no se detallan los dominios, el volumen en tokens ni las proporciones del corpus de entrenamiento, lo que dificulta evaluar la cobertura real por sector.
- Resultados de benchmark pendientes de verificacion: los resultados de GIFT-Eval estaban, segun la model card, en una pull request pendiente de aceptacion en el momento de su redaccion, por lo que las posiciones indicadas pueden cambiar.
- Licencia: la doble licencia OpenMDW 1.0 / Apache 2.0 permite uso comercial, pero conviene revisar los terminos de OpenMDW 1.0 si se opta por esa via, especialmente en lo relativo a atribucion.
- Compatibilidad: la implementacion requiere `granite-tsfm>=0.3.9`. La compatibilidad con checkpoints de r1 esta declarada, pero no se detallan posibles diferencias de comportamiento al cargar checkpoints antiguos con la nueva arquitectura.
- Contexto: la ventana maxima de 8192 muestras limita el historico utilizable; series con estacionalidades mas largas que esa ventana deberan resumirse o dividirse, con la perdida de informacion que ello implica.
- Fechas anomalas: los metadatos indican creacion en 2026 y actualizacion en septiembre de 2026, coherentes con el resto de referencias de la model card, que datan los rankings a 31 de agosto de 2026.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ibm-granite/granite-timeseries-patchtst-fm-r2
- Modelo predecesor PatchTST-FM-r1: https://huggingface.co/ibm-granite/granite-timeseries-patchtst-fm-r1
- Modelo Granite TimeSeries FlowState-r1: https://huggingface.co/ibm-granite/granite-timeseries-flowstate-r1
- Repositorio IBM TSFM (implementacion de la arquitectura): https://github.com/ibm-granite/granite-tsfm/
- Benchmark GIFT-Eval (Salesforce): https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Documentacion de PatchTST en Transformers: https://huggingface.co/docs/transformers/model_doc/patchtst
- Implementacion original de PatchTST: https://github.com/yuqinie98/PatchTST
- Paper de PatchTST (arXiv:2211.14730): https://arxiv.org/abs/2211.14730
- Paper de Conformer (arXiv:2005.08100): https://arxiv.org/abs/2005.08100
- Paper del metodo CauKer (arXiv:2508.02879): https://arxiv.org/abs/2508.02879
- Referencia adicional citada en la model card (arXiv:2403.07815): https://arxiv.org/abs/2403.07815 (titulo no disponible en la informacion proporcionada)
- Referencia adicional citada en la model card (arXiv:2602.06909): https://arxiv.org/abs/2602.06909 (titulo no disponible en la informacion proporcionada)
