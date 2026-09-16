# nums-ai/causilo

## Resumen

Causilo es un modelo fundacional tabular preentrenado desarrollado por Nums AI Inc., disenado para resolver tareas de clasificacion y regresion sobre datos estructurados a traves de una interfaz compatible con scikit-learn. A diferencia de un transformer de texto, el modelo se consume mediante `CausiloClassifier` y `CausiloRegressor`, clases que exponen los metodos habituales `fit`, `predict` y `predict_proba`, de modo que puede insertarse en pipelines de machine learning ya existentes sin cambiar el codigo de orquestacion.

El modelo se distribuye como dos checkpoints independientes en formato safetensors: uno para clasificacion y otro para regresion, con una configuracion JSON asociada a cada uno. El repositorio completo ocupa aproximadamente 0,3 GB, lo que sugiere dos artefactos de pesos pequenos y una inferencia viable en CPU o en cualquier GPU de consumo. La model card no especifica numero de parametros, arquitectura interna, volumen de datos de entrenamiento ni composicion del dataset.

Es relevante ahora porque se suma a la categoria de modelos fundacionales tabulares, que traslada el paradigma del aprendizaje por transferencia a datos estructurados, un terreno dominado historicamente por gradient boosting. Su adopcion practica esta condicionada por un modelo de licencia restrictivo: los pesos se publican bajo la Causilo License v1.0, que permite investigacion no comercial pero exige licencias separadas para uso comercial, produccion y servicios alojados o tipo API/SaaS. El codigo Python de la libreria, en cambio, se distribuye bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fundacional tabular; la model card no detalla la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors sin cuantizaciones documentadas |
| Idiomas soportados | no disponible (no aplica a entradas numericas o categoricas) |
| Licencia | Pesos: Causilo License v1.0 (license_name: causilo-1.0). Codigo Python y wheel: Apache-2.0 |
| Formato de pesos | safetensors |
| Artefactos incluidos | `classifier/config.json`, `classifier/model.safetensors`, `regressor/config.json`, `regressor/model.safetensors` |
| Tamano del repositorio | 0,3 GB (ambos checkpoints) |
| Libreria de despliegue | `causilo` (pip install causilo) |
| Requisitos de entorno | Python 3.10-3.12 y PyTorch 2.13+ segun la model card |
| Entradas | Matrices de caracteristicas tabulares (X) y etiquetas o valores objetivo (y) |
| Descargas y likes | 9 descargas, 10 likes |
| Fechas | Creado el 11/09/2026, actualizado el 13/09/2026 |

## Arquitectura y entrenamiento

La model card no proporciona informacion sobre la arquitectura interna del modelo: no se especifica si se trata de un transformer con atencion sobre filas y columnas, de un esquema basado en atencion en contexto (in-context learning tabular) ni de cualquier otra variante. Tampoco se documentan el numero de parametros, la profundidad de la red ni el mecanismo de procesamiento conjunto de filas y columnas, que son elementos determinantes en los modelos fundacionales tabulares.

Respecto al entrenamiento, no se indica el numero de tokens o de ejemplos vistos, la composicion del dataset de preentrenamiento, si hubo fases de ajuste supervisado, ni si se aplicaron tecnicas de alineacion como RLHF o DPO sobre las predicciones. La unica informacion operativa disponible es que se trata de un modelo preentrenado que se descarga y cachea automaticamente en el primer `fit`, y que se separa en dos cabezas o modelos independientes, uno para clasificacion y otro para regresion.

Como innovacion destacable, la propia libreria: exponer un modelo fundacional tabular bajo la API de scikit-learn (`CausiloClassifier`, `CausiloRegressor`) reduce la friccion de adopcion, ya que permite reutilizar `Pipeline`, `ColumnTransformer` y validacion cruzada sin adaptadores adicionales.

## Capacidades

- Clasificacion tabular: ajuste sobre matrices de caracteristicas y prediccion de clases, con soporte de probabilidades por clase mediante `predict_proba`.
- Regresion tabular: ajuste sobre caracteristicas y valores objetivo continuos, con prediccion mediante `predict`.
- Integracion con scikit-learn: al respetar la API de estimador, funciona dentro de `Pipeline`, `GridSearchCV` o `cross_val_score`.
- Aprendizaje por transferencia: el modelo se preentrena y se ajusta despues sobre datos especificos del problema, sin necesidad de disenar una arquitectura desde cero.
- Carga automatica de pesos: la primera llamada a `fit` descarga y cachea el checkpoint correspondiente.
- Capacidades multimodales (vision, audio, texto generativo): no disponibles.
- Tool calling o function calling: no disponible (no aplica).
- Soporte de agentes o razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no disponible (no aplica).
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Evaluacion de riesgo crediticio (investigacion): el `CausiloRegressor` o el clasificador pueden estimar probabilidad de impago sobre variables financieras tabulares. Recordar que el uso comercial o de produccion requiere licencia separada.
- Prediccion de abandono de clientes (churn): entrenamiento sobre historicos de uso, facturacion y soporte, con validacion cruzada integrada al ser compatible con scikit-learn.
- Deteccion de fraude en transacciones: clasificacion binaria sobre caracteristicas agregadas por cuenta o comercio, aprovechando `predict_proba` para priorizar alertas por umbral.
- Prediccion de demanda y series de datos tabulares: regresion sobre caracteristicas de calendario, precio y promociones, util como modelo de referencia frente a gradient boosting.
- Analisis de datos cientificos y biomedicina (uso no comercial): regresion sobre cohortes con variables clinicas o experimentales, terreno donde la licencia permite investigacion, evaluacion y modificaciones.
- Docencia y experimentacion reproducible: la API identica a scikit-learn permite comparar un modelo fundacional tabular contra `RandomForest`, `XGBoost` o regresion logistica en practicas y trabajos academicos.
- Benchmark interno de pipelines de ML: sustitucion del estimador final en un `Pipeline` existente para medir si el preentrenamiento aporta ventaja sobre el modelado clasico con el mismo preprocesado.
- Prototipado rapido de modelos tabulares: al no requerir ajuste de hiperarquitectura, sirve para obtener una primera linea base en horas en lugar de semanas.
- Investigacion sobre transferencia en datos tabulares: estudio de la calibracion de probabilidades y de la extrapolacion fuera de la distribucion de entrenamiento con los dos checkpoints publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la seccion de benchmarks del repositorio de codigo (`https://github.com/nums-ai/causilo#benchmarks`), pero no se ha facilitado ninguna cifra concreta (accuracy, F1, RMSE, AUC ni comparaciones con otros modelos) en el material consultado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. A partir del tamano del repositorio (0,3 GB para los dos checkpoints en safetensors), los pesos de cada modelo serian del orden de 0,15 GB, por lo que la inferencia cabria con holgura en menos de 1 GB de memoria, tanto en CPU como en GPU. Es una estimacion derivada del tamano de los ficheros, no un dato confirmado.
- GPU recomendadas: no disponibles. Por el tamano indicado, cualquier GPU de consumo (por ejemplo, RTX 3060, RTX 4070 o RTX 4090) seria mas que suficiente; incluso la ejecucion en CPU resultaria viable.
- Compatibilidad con GPU de consumo: si, segun la estimacion anterior basada en el tamano del repositorio.
- Opciones de despliegue: instalacion de la libreria `causilo` mediante `pip` e integracion en procesos Python o pipelines de scikit-learn. No hay soporte documentado para vLLM, TGI, Ollama ni llama.cpp, y en principio no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.
- Otros requisitos: Python 3.10-3.12 y PyTorch 2.13+ segun la model card. Conviene verificar la version exacta de PyTorch disponible en el entorno, ya que la citada puede no corresponder a una version publicada en el momento de redactar esta ficha.
- Conectividad: se requiere acceso a red en el primer `fit` para descargar y cachear el checkpoint, salvo que los pesos se aprovisionen previamente.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La model card no incluye comparaciones con otros modelos fundacionales tabulares ni con metodos clasicos de gradient boosting, y los resultados de busqueda web facilitados no contienen informacion tecnica relevante sobre Causilo ni sobre alternativas de su categoria.

| Modelo | Parametros | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|
| Causilo (clasificacion y regresion) | no disponible | no aplica | Causilo License v1.0 (pesos), Apache-2.0 (codigo) | no disponible |
| Alternativas de la categoria de modelos fundacionales tabulares | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva en los pesos: el uso comercial o de produccion del modelo, de sus derivados o de sus salidas requiere una licencia separada de Nums AI Inc., aunque la afiliacion institucional no determina por si sola el caracter no comercial.
- Servicios alojados, gestionados, de API o SaaS requieren licencia separada, con independencia de que sean de pago o gratuitos. El alojamiento de ficheros descargables si esta permitido segun la seccion 3 de la licencia.
- La redistribucion gratuita con fines de investigacion de copias originales y derivados esta permitida bajo la seccion 3, con la licencia, los avisos y la informacion de modificaciones exigidos.
- Divergencia de licencias: el codigo Python y el wheel son Apache-2.0, pero los pesos no; conviene no confundir ambos regimenes en un despliegue.
- Ausencia total de datos tecnicos publicados: no hay informacion sobre arquitectura, parametros, datos de entrenamiento ni proceso de ajuste, lo que dificulta evaluar riesgos de sobreajuste o de generalizacion.
- Sin benchmarks publicados en el material consultado: no es posible verificar el rendimiento frente a metodos clasicos como gradient boosting o frente a otros modelos fundacionales tabulares.
- Riesgo de extrapolacion: en modelos tabulares, las predicciones fuera de la distribucion de entrenamiento (variables categoricas no vistas, rangos numericos no cubiertos) pueden ser poco fiables; el riesgo equivalente a la alucinacion en modelos de lenguaje es aqui la inferencia sobre soporte insuficiente.
- Calibracion de probabilidades no documentada: antes de usar `predict_proba` para decisiones con umbral critico, conviene validar la calibracion sobre datos propios.
- Sesgos no documentados: no se detalla la composicion del dataset de preentrenamiento, por lo que no puede auditarse la representacion de distintos grupos poblacionales.
- Idiomas y dominios: no aplica la dimension linguistica, pero tampoco se documentan los dominios tabulares cubiertos por el preentrenamiento.
- Madurez limitada: el repositorio registra 9 descargas y 10 likes, con publicacion inicial el 11/09/2026, por lo que la validacion externa por parte de la comunidad es practicamente inexistente.
- Requisitos de version: la model card exige PyTorch 2.13+, version que conviene confirmar en el entorno antes de desplegar, junto con Python entre 3.10 y 3.12.
- Dependencia de red en el primer uso: si el entorno no tiene acceso a Internet, el `fit` inicial fallara salvo que los checkpoints se aprovisionen manualmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nums-ai/causilo
- Repositorio de codigo: https://github.com/nums-ai/causilo
- Seccion de benchmarks del repositorio: https://github.com/nums-ai/causilo#benchmarks
- Texto completo de la licencia: LICENSE dentro del repositorio del modelo (Causilo License v1.0)
- Contacto del licenciante (Nums AI Inc.): contact@nums.world
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre el modelo en la busqueda realizada; los resultados obtenidos no guardan relacion con Causilo.
