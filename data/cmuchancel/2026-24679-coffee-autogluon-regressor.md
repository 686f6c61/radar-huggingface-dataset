# cmuchancel/2026-24679-coffee-autogluon-regressor

# cmuchancel/2026-24679-coffee-autogluon-regressor

## Resumen

El modelo `cmuchancel/2026-24679-coffee-autogluon-regressor` es un regresor tabular entrenado con AutoGluon Tabular que estima el precio por onza (`price_per_oz`, en dolares por onza) de bolsas de cafe de venta minorista a partir de atributos del producto y del envase. Lo publica el usuario `cmuchancel` como entrega de la tarea 2 del curso CMU 24-679, sobre el conjunto de datos `ssg1/coffee-bags-tabular`, creado por un companero de clase para la tarea 1.

No es un modelo de lenguaje: no procesa texto libre ni genera contenido. Recibe siete variables estructuradas (altitud en msnm, peso en gramos, altitud declarada, origen, procesamiento, nivel de tueste y tipo de molienda) y devuelve un valor continuo. El modelo final es un `WeightedEnsemble_L2` que combina modelos de arboles y redes neuronales seleccionados mediante AutoML.

Su relevancia es fundamentalmente didactica y metodologica: documenta un flujo AutoML de regresion con un presupuesto de busqueda de 300 segundos, licencia MIT y un volumen de datos muy reducido (345 filas de entrenamiento, 5 de validacion y 6 de prueba), lo que limita de forma severa cualquier uso en produccion. El repositorio figura con un tamano de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble tabular de AutoGluon (`WeightedEnsemble_L2` sobre modelos de arboles y redes neuronales) |
| Parametros totales | no disponible (ensemble de modelos heterogeneos; el autor no publica recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular; 7 variables de entrada por fila) |
| Tipos de cuantizacion | no aplica (no es un modelo de lenguaje; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica a texto; las variables categoricas se almacenan como categorias) |
| Licencia | MIT |
| Formato de pesos | no disponible (AutoGluon utiliza sus propios artefactos de serializacion; el repositorio figura con 0.0 GB) |
| Tarea | Regresion tabular |
| Variable objetivo | `price_per_oz` ($/oz) |
| Variables de entrada | `altitude_masl`, `weight_g`, `altitude_stated`, `origin`, `processing`, `roast_level`, `grind` |
| Framework | AutoGluon Tabular, preset `medium_quality` |
| Presupuesto de busqueda AutoML | 300 segundos |
| Metrica de seleccion | RMSE sobre validacion |
| Bagging folds / stack levels | 0 / 0 |
| Modelos evaluados | WeightedEnsemble_L2, NeuralNetTorch, XGBoost, RandomForestMSE, ExtraTreesMSE, LightGBMLarge, LightGBM, LightGBMXT, NeuralNetFastAI |
| Tamano del repositorio | 0.0 GB |
| Fecha de creacion | 2026-09-21T15:30:46Z |
| Ultima actualizacion | 2026-09-21T15:30:48Z |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Se trata de un pipeline de AutoML tabular sobre AutoGluon en modo regresion, con metrica de seleccion RMSE y preset `medium_quality`. AutoGluon entrena un conjunto de modelos base (LightGBM, LightGBMXT, LightGBMLarge, XGBoost, RandomForestMSE, ExtraTreesMSE, NeuralNetTorch y NeuralNetFastAI) y construye un ensemble ponderado con los candidatos mejor valorados. El autor configura `bagging_folds = 0` y `stack levels = 0`; el mejor modelo resultante es `WeightedEnsemble_L2`, con hiperparametros que incluyen `use_orig_features: False`, `valid_stacker: True`, `max_base_models: 0`, `save_bag_folds: True` y `model_random_seed: 0`. La seleccion se hizo exclusivamente con RMSE de validacion y el conjunto de prueba se utilizo solo despues de fijar el modelo.

Los datos proceden del split publicado de `ssg1/coffee-bags-tabular`, sin reparticion adicional: 345 filas de entrenamiento (originales mas versiones aumentadas), 5 de validacion y 6 de prueba (unicamente originales reservados). El autor excluye `price_usd` para evitar fuga de informacion, ya que el objetivo se deriva de precio y peso, y descarta tambien `brand`, identificadores, metadatos de aumento y la etiqueta de clasificacion `is_premium`. Las variables numericas se convierten a tipo numerico y las categoricas se almacenan como categoricas, delegando su tratamiento a AutoGluon. No hay RLHF, DPO ni tecnicas de alineacion: no son aplicables. El entrenamiento se ejecuto en Google Colab sobre un runtime de CPU sin GPU CUDA disponible.

## Capacidades

- Regresion continua: estima un valor numerico de precio por onza a partir de siete atributos estructurados de una bolsa de cafe.
- Tratamiento de variables numericas continuas (`altitude_masl`, `weight_g`, `altitude_stated`).
- Tratamiento de variables categoricas (`origin`, `processing`, `roast_level`, `grind`) mediante la gestion automatica de AutoGluon.
- Ensamblado ponderado de modelos de arboles y redes neuronales tabulares, con ponderacion aprendida sobre el conjunto de validacion.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: `no disponible`/no aplica, al no procesar lenguaje natural.
- No incorpora modo de pensamiento (`thinking mode`) ni ninguna capacidad especial adicional.

## Casos de uso

- Material docente y reproduccion de experimentos: sirve como ejemplo completo y documentado de un flujo AutoGluon de regresion con presupuesto acotado de 300 segundos, util para cursos de AutoML y para comparar configuraciones de busqueda.
- Baseline en proyectos de precios de retail: dado que fija un punto de partida con RMSE de 0.650 $/oz en prueba, puede emplearse como referencia inicial antes de entrenar modelos con datos propios mas amplios.
- Estimacion orientativa de precio por onza en catalogos de cafe de especialidad: alimentando las siete variables disponibles se obtiene una estimacion rapida, siempre supeditada a revision humana por la incertidumbre del modelo.
- Deteccion de anomalias en catalogos: comparar el precio observado de una referencia con la prediccion del modelo permite senalar productos cuyo precio se desvia de lo esperado para sus atributos, como paso previo a una revision manual.
- Analisis de sensibilidad de atributos: variando `roast_level`, `processing` o `altitude_masl` en la entrada se puede estudiar cualitativamente como se relacionan con el precio estimado, como apoyo a decisiones de surtido.
- Enriquecimiento de fichas de producto en comercio electronico: completar el campo de precio por onza cuando el dato falta y el resto de atributos esta disponible, con la advertencia de que no debe presentarse como valor de mercado autoritativo.
- Pre-anotacion de muestras en estudios academicos: generar etiquetas preliminares para conjuntos mayores de productos y reducir el esfuerzo de anotacion manual, validando despues una submuestra.
- Estudio de la relacion entre altitud, proceso de beneficio, tueste y precio: el modelo permite cuantificar de forma aproximada que variables pesan mas en la prediccion dentro de este conjunto de datos concreto.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de prueba (6 muestras):

| Metrica | Valor |
|---|---|
| RMSE (test) | 0.650 $/oz |
| MAE (test) | 0.447 $/oz |
| Intervalo bootstrap aproximado del 95% para RMSE | 0.111 - 0.918 $/oz |
| Tamano del conjunto de prueba | 6 muestras |
| RMSE de validacion | no disponible (solo se indica que se uso para la seleccion) |

No se han publicado resultados de benchmarks en la informacion disponible. No existen valores desglosados por modelo base ni comparaciones con modelos externos, y metricas tipo MMLU, HumanEval o GSM8K no aplican porque no es un modelo de lenguaje.

## Requisitos de hardware

- Entrenamiento: Google Colab con runtime de CPU, sin GPU CUDA disponible. Presupuesto de AutoML de 300 segundos.
- VRAM para inferencia: no aplica; el modelo no requiere GPU.
- GPU recomendadas: no aplica. No se documenta ninguna GPU empleada ni recomendada.
- GPU de consumo: el modelo cabe en cualquier maquina sin GPU; no se publican requisitos de memoria RAM concretos, por lo que la cifra es `no disponible`.
- Opciones de despliegue: AutoGluon `TabularPredictor` (carga de los artefactos serializados). vLLM, llama.cpp, Ollama y TGI no son aplicables; no se documenta exportacion a ONNX ni a otros formatos.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo de inferencia.
- Nota de disponibilidad: el repositorio figura con un tamano de 0.0 GB, por lo que no esta confirmado que los artefactos del modelo esten efectivamente subidos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de regresion tabular, ni resultados de alternativas como LightGBM, XGBoost o RandomForest entrenadas de forma aislada. El propio proceso de AutoML evaluo ocho modelos base (WeightedEnsemble_L2, NeuralNetTorch, XGBoost, RandomForestMSE, ExtraTreesMSE, LightGBMLarge, LightGBM, LightGBMXT, NeuralNetFastAI), pero el autor solo publica las metricas del ensemble ganador y no las de cada candidato, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Volumen de datos muy reducido: 345 filas de entrenamiento, 5 de validacion y 6 de prueba. El propio autor advierte que los resultados tienen una incertidumbre sustancial.
- Intervalo de confianza amplio: el intervalo bootstrap del 95% para el RMSE abarca de 0.111 a 0.918 $/oz, un rango casi nueve veces superior al valor puntual inferior.
- Datos aumentados en entrenamiento: las versiones aumentadas incrementan el numero de filas, pero no representan productos de cafe recogidos de forma independiente, lo que puede inflar artificialmente la sensacion de cobertura de datos.
- Falta de generalizacion: el rendimiento puede no trasladarse a productos de otras tiendas, regiones geograficas, marcas o periodos temporales.
- Deriva temporal: los precios del cafe cambian con el tiempo, por lo que el modelo no debe interpretarse como un modelo de precios general ni permanente.
- Riesgo de uso indebido: el autor indica explicitamente que las predicciones no deben tratarse como estimaciones autoritativas de un precio de mercado justo.
- Categorias no vistas: no se documenta el comportamiento del modelo ante valores nuevos de `origin`, `processing`, `roast_level` o `grind` fuera de los presentes en el conjunto de datos.
- Ausencia de benchmarks y de metricas por modelo base: no hay evidencia publicada de rendimiento comparable con alternativas.
- Disponibilidad de artefactos: el repositorio aparece con 0.0 GB, sin confirmacion de que los pesos serializados esten publicados; conviene verificar antes de planificar un despliegue.
- Contexto de origen: es una entrega de tarea universitaria (CMU 24-679), no un modelo mantenido ni validado para produccion. El autor declara uso de ChatGPT para adaptar el cuaderno de AutoML y para la redaccion de la model card.
- Datos sensibles: el conjunto describe productos de cafe, no personas, y no contiene informacion personal sensible.
- Licencia: MIT, lo que permite uso comercial y modificacion, pero sin garantia alguna por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmuchancel/2026-24679-coffee-autogluon-regressor
- Conjunto de datos de origen: https://huggingface.co/datasets/ssg1/coffee-bags-tabular
- Busqueda web: no se han encontrado enlaces relevantes. El unico resultado devuelto (anuncios clasificados de eBay Kleinanzeigen sobre embarcaciones) no guarda relacion con el modelo ni con su dominio de aplicacion. No se dispone de paper, blog, repositorio ni demo adicionales en la informacion proporcionada.
