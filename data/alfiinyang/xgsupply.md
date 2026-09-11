# alfiinyang/XGSupply

## Resumen

XGSupply es un modelo de regresion supervisada publicado por el usuario alfiinyang en Hugging Face, cuyo objetivo es predecir la demanda futura (unidades vendidas) de distintos SKU a partir de ventas historicas, niveles de inventario y variables temporales. No se trata de un modelo de lenguaje: el artefacto es un XGBoost Regressor serializado con joblib, acompanado de un escalador tambien en joblib, y esta pensado para integrarse en pipelines de previsión de demanda dentro de la cadena de suministro.

La relevancia de este tipo de publicaciones es practica y de nicho: los modelos de gradient boosting sobre datos tabulares siguen siendo el estandar industrial para forecasting de demanda por SKU, porque entrenan rapido, son interpretables mediante importancia de variables y funcionan bien con cientos o miles de series temporales cortas. El interes aqui no viene de una innovacion arquitectonica, sino de disponer de un artefacto listo para cargar con `joblib.load` y de unas metricas de error declaradas por el autor.

Las cifras publicadas son limitadas: un MAE de 53,18 y un RMSE de 82,90 sobre un split cronologico de test del 20 %. El repositorio no incluye licencia, idiomas, pipeline, numero de parametros ni tamano real del artefacto (el tamano reportado es 0,0 GB), y acumula 0 descargas y 0 likes, por lo que no existe validacion externa de estos resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XGBoost Regressor (gradient boosted decision trees) |
| Parametros totales | no disponible (no se documentan numero de arboles, profundidad maxima ni learning rate) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial con ventana de contexto) |
| Tipos de cuantizacion | no disponible (no se documentan conversiones; el artefacto se distribuye en joblib) |
| Idiomas soportados | no disponible (no procesa texto; consume caracteristicas numericas y categoricas) |
| Licencia | no disponible |
| Formato de pesos | joblib (serializacion basada en pickle): `xgboost_supply_model.joblib` y `scaler.joblib` |
| Tarea | Regresion (prediccion de unidades vendidas por SKU) |
| Funcion objetivo | MSE (Mean Squared Error) |
| Caracteristicas de entrada | Temporales (dia, mes, semana), medias moviles (7 y 30 dias), ventas con retardo (lagged sales) y ratios stock-to-sales |
| Preprocesado requerido | Escalado y one-hot encoding segun el esquema de entrenamiento |
| Split de evaluacion | Cronologico, 20 % de test |
| Tamano del repositorio | 0,0 GB (reportado; sugiere un artefacto de pocos MB, no confirmado) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-11 |
| Ultima actualizacion | 2026-09-11 |
| Etiquetas del repositorio | joblib, region:us |

## Arquitectura y entrenamiento

XGBoost es una implementacion de gradient boosting sobre arboles de decision que construye de forma secuencial arboles poco profundos, donde cada nuevo arbol corrige el residuo de los anteriores, con regularizacion L1/L2 y complejidad de arbol explicitamente penalizada en la funcion objetivo. En este caso la funcion de perdida declarada es el error cuadratico medio, lo que implica que el modelo optimiza prediccion puntual de unidades vendidas y es sensible a valores atipicos y a picos de demanda, un aspecto critico en series de ventas con promociones o roturas de stock.

El autor solo especifica el conjunto de caracteristicas: componentes temporales (dia, mes, semana), medias moviles a 7 y 30 dias, ventas retardadas y ratios de stock sobre ventas. No se indica el volumen del dataset, el periodo temporal cubierto, el numero de SKU, la granularidad (diaria o semanal), el numero de arboles, la profundidad, la tasa de aprendizaje, el uso de early stopping ni si hubo ajuste de hiperparametros o validacion cruzada temporal. Tampoco hay informacion sobre ingenieria de caracteristicas adicional (festivos, promociones, precio, estacionalidad anual explicita) ni sobre el tratamiento de valores ausentes. No procede hablar de RLHF, DPO ni decodificacion especulativa: no es un modelo generativo.

## Capacidades

- Regresion de demanda: estima unidades vendidas futuras por SKU a partir del historico de ventas, inventario y variables temporales.
- Uso de senales de inventario: incorpora ratios stock-to-sales, lo que permite capturar desabastecimiento o exceso de stock como predictores.
- Series con estacionalidad basica: los componentes de dia, mes y semana y las medias moviles de 7 y 30 dias modelan patrones semanales y mensuales.
- Inferencia por lotes: al ser un modelo tabular, permite puntuar miles de SKU en un unico lote con pandas.
- Integracion en pipelines Python: el artefacto se carga con `joblib.load`, sin dependencias de servidores de inferencia especializados.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje natural).
- No documenta modo de razonamiento explicito, audio ni ninguna modalidad adicional.

## Casos de uso

- Prevision de demanda por SKU para planificacion de compras: el modelo genera una estimacion de unidades vendidas por referencia que alimenta el plan de aprovisionamiento, sustituyendo medias historicas simples por una prediccion que incorpora tendencia reciente y nivel de stock.
- Calculo de puntos de pedido y stock de seguridad: combinando la prediccion con el error declarado (MAE 53,18 y RMSE 82,90), un equipo de operaciones puede dimensionar colchones de seguridad por SKU asumiendo la incertidumbre medida en el test cronologico.
- Deteccion temprana de rotura de stock: el ratio stock-to-sales forma parte de las caracteristicas, de modo que el modelo puede senalar SKU con demanda prevista superior a la cobertura disponible.
- Planificacion de produccion y capacidad: agregando las predicciones por SKU a nivel de familia o planta se obtiene una estimacion de carga para las lineas de fabricacion en el horizonte temporal cubierto por las variables de lag y medias moviles.
- Priorizacion de reposicion en almacen: ordenar SKU por demanda prevista y criticidad permite asignar recursos de picking y transporte donde el impacto economico es mayor.
- Presupuestacion de compras y flujo de caja: las previsiones por periodo sirven como entrada para estimar el desembolso en compras y su calendario.
- Alerta de sobrestock y capital inmovilizado: comparar demanda prevista con inventario actual ayuda a identificar referencias con exceso de existencias y a planificar promociones o liquidaciones.
- Integracion en un servicio de scoring interno: cargar los dos ficheros joblib en un microservicio Python y exponer una API REST para que el ERP o el WMS consulten la prediccion bajo demanda.

## Benchmarks y rendimiento

| Metric | Value |
|---|---|
| Mean Absolute Error (MAE) | 53,18 |
| Root Mean Squared Error (RMSE) | 82,90 |

Unica informacion de evaluacion publicada por el autor, medida sobre un split cronologico del 20 % de los datos. No se especifica la unidad del error (presumiblemente unidades vendidas), la granularidad temporal de cada observacion ni el tamano de la muestra de test, por lo que el MAE y el RMSE no son directamente comparables con otros modelos sin conocer el contexto. No se han publicado resultados en la informacion disponible para MMLU, HumanEval, GSM8K ni ningun otro benchmark estandar, que ademas no aplican a un modelo tabular de regresion. Tampoco se ofrecen lineas base (media historica, naive estacional, Prophet, LightGBM) contra las que situar estas cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica. XGBoost en inferencia es una agregacion de predicciones de arboles sobre CPU y no requiere GPU.
- GPU recomendadas: ninguna. El uso de GPU con `device=cuda` en XGBoost solo tiene sentido en entrenamiento con datasets grandes, y aqui no se documenta ni el volumen de datos ni el proceso de entrenamiento.
- Cabe en GPU consumer: la pregunta no aplica; el modelo no necesita GPU. El cuello de botella es el preprocesado tabular (escalado y one-hot encoding) y la lectura del artefacto.
- Memoria RAM: no disponible con precision. Con un repositorio reportado de 0,0 GB, es razonable esperar un artefacto de pocos MB, pero el numero de arboles y la profundidad no estan documentados, por lo que no puede confirmarse.
- Opciones de despliegue: carga directa con `joblib` dentro de un proceso Python; servicio HTTP con FastAPI o Flask; ejecucion por lotes con pandas o Spark; versionado del artefacto en un registro de modelos (MLflow, DVC). vLLM, llama.cpp, Ollama y TGI no son aplicables porque estan orientados a modelos de lenguaje con pesos en safetensors o GGUF.
- Latencia y throughput estimados: no disponible. Dependen del numero de arboles, del numero de SKU a puntuar y del coste del preprocesado, ninguno de los cuales se documenta.

## Comparativa con modelos similares

Los resultados de busqueda web proporcionados no contienen informacion sobre modelos comparables de forecasting de demanda, por lo que no es posible rellenar metricas de alternativas. La tabla siguiente recoge la categoria de cada opcion sin cifras, ya que no se dispone de datos de rendimiento en la informacion disponible.

| Modelo | Categoria | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| XGSupply | Gradient boosting tabular (XGBoost) | no disponible | no aplica | MAE 53,18 / RMSE 82,90 | no disponible | Hugging Face, artefacto joblib |
| LightGBM | Gradient boosting tabular | no disponible | no aplica | no disponible | no disponible | codigo abierto, no vinculado a esta comparativa |
| Prophet | Modelo aditivo de series temporales | no disponible | no aplica | no disponible | no disponible | codigo abierto, no vinculado a esta comparativa |
| SARIMA | Modelo estadistico clasico | no disponible | no aplica | no disponible | no disponible | implementaciones multiples, no vinculado a esta comparativa |

## Limitaciones y advertencias

- No se documenta la licencia, por lo que el uso comercial queda en un limbo legal: sin terminos explicitos, no puede asumirse permiso de explotacion.
- No se especifica el origen, el periodo ni la geografia de los datos de entrenamiento; extrapolar a otro mercado, otra divisa o otro calendario de promociones no esta justificado.
- El MAE de 53,18 unidades y el RMSE de 82,90 no son interpretables sin conocer la unidad de prediccion y el volumen medio por SKU. Si la demanda media por SKU y periodo es baja, el error relativo puede ser muy alto.
- No se aportan lineas base, de modo que no puede afirmarse que el modelo supere a una media movil o a un metodo naive estacional.
- Riesgo de alucinacion no aplica (no es generativo), pero si existe riesgo de predicciones fuera de rango ante entradas fuera de distribucion: categorias one-hot no vistas, escalas distintas o valores extremos de stock-to-sales.
- Dependencia estricta del esquema de preprocesado: el propio autor advierte de que las caracteristicas deben escalarse y codificarse segun el esquema de entrenamiento. El `scaler.joblib` se distribuye sin documentar que columnas transforma ni en que orden.
- Posible degradacion por deriva temporal: al usar medias moviles de 7 y 30 dias y ventas retardadas, un cambio de patron de demanda o una rotura de la cadena de datos invalida las predicciones rapidamente. No se documenta ninguna estrategia de reentrenamiento.
- No hay informacion sobre sesgos por SKU, tienda o region, ni sobre el tratamiento de productos de baja rotacion o de lanzamiento reciente, donde los lags y medias moviles carecen de historia.
- Sin validacion de la comunidad: 0 descargas y 0 likes, y sin paper, repositorio de codigo ni demo asociados.
- El nombre del repositorio contiene una referencia a XGBoost, pero el artefacto es un joblib que puede requerir una version concreta de la libreria para deserializarse; no se indica la version de `xgboost`, `scikit-learn` ni `joblib`, lo que es un riesgo real de incompatibilidad en produccion.
- La fecha de creacion y actualizacion declarada es 2026-09-11, sin historial de versiones posterior ni mantenimiento documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alfiinyang/XGSupply
- Los resultados de busqueda web proporcionados no contienen ningun enlace relevante al modelo: las entradas devueltas tratan sobre la definicion de "ano" y calendarios, y no guardan relacion con XGSupply. No se dispone de paper, blog, repositorio de codigo ni demo adicionales.
