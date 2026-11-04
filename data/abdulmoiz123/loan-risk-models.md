# Abdulmoiz123/loan-risk-models

## Resumen

`Abdulmoiz123/loan-risk-models` es un paquete de artefactos de machine learning para evaluacion de riesgo crediticio, publicado por Abdul Moiz en HuggingFace. No es un modelo de lenguaje ni una red neuronal profunda: agrupa clasificadores y regresores tabulares clasicos (LightGBM, Random Forest y un GMM esferico) junto con sus equivalentes en ONNX, transformadores ajustados y el esquema de caracteristicas necesario para reproducir el pipeline. El repositorio ocupa 0,3 GB y se distribuye bajo licencia MIT.

El sistema resuelve cuatro tareas sobre un dataset publico de credito: clasificacion de impago, regresion del tipo de interes, segmentacion de prestatarios y una cadena de prediccion para solicitantes nuevos que reutiliza el tipo de interes estimado. Los resultados declarados por el autor sobre conjuntos de validacion retenidos son un F1 de 0,8375 y un ROC-AUC de 0,9498 en clasificacion de impago, y un R² de 0,9070 con RMSE de 0,9746 puntos porcentuales en la regresion de tipo de interes.

Su relevancia es acotada y de caracter educativo: el propio autor advierte que se trata de una reconstruccion controlada de un dataset ya explorado, no de una validacion externa independiente, y que los modelos no establecen equidad, causalidad ni calibracion para una entidad bancaria real. La informacion disponible no incluye arquitectura de lenguaje, parametros, contexto ni idiomas, por lo que las filas correspondientes de la ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos tabulares clasicos: LightGBM (clasificador), Random Forest (regresor), GMM esferico (segmentacion); equivalentes ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a modelos tabulares) |
| Tipos de cuantizacion | no disponible (artefactos serializados en joblib y ONNX) |
| Idiomas soportados | no disponible |
| Licencia | MIT (codigo); los datos publicos conservan su licencia de origen |
| Formato de pesos | joblib y ONNX, mas transformadores ajustados y esquema de caracteristicas |

## Arquitectura y entrenamiento

El paquete combina tres familias de modelos sobre datos tabulares. La clasificacion de impago usa LightGBM, un algoritmo de gradient boosting sobre arboles de decision; la regresion del tipo de interes emplea Random Forest; y la segmentacion de prestatarios se resuelve con un Gaussian Mixture Model de covarianza esferica. Cada modelo se distribuye tambien en formato ONNX para inferencia portable, acompanado de los transformadores ajustados en el cuaderno de entrenamiento y de un manifiesto de artefactos con hashes.

El entrenamiento se realizo sobre el dataset publico `laotse/credit-risk-dataset` de Kaggle, con el CSV original sin modificar (SHA-256 `ce3c6d2167717bf1627d1c0c81cbccd28323cd4aa7b96d542599366d5ff6aac8`). El autor declara un particionado compartido por grupos de perfil aproximadamente 70/15/15, transformaciones aprendidas solo en entrenamiento, seleccion de candidatos solo en validacion, umbral de clasificacion fijo en 0,6 y cero solapamiento entre grupos de perfil coincidentes. No se aporta ninguna cifra de validacion cruzada actual. La columna de resultado nunca entra en las caracteristicas de regresion y el grado del prestamo ya viene asignado por el prestamista.

## Capacidades

- Clasificacion binaria de impago con probabilidad calibrada por umbral fijo de 0,6.
- Regresion del tipo de interes en puntos porcentuales (RMSE de 0,9746 y MAE de 0,7509).
- Segmentacion no supervisada de prestatarios mediante GMM esferico (silhouette de 0,2336).
- Encadenamiento de predicciones para solicitantes nuevos: usa el tipo de interes estimado como entrada para la clasificacion (F1 de 0,8428, ROC-AUC de 0,9485).
- Inferencia portable mediante artefactos ONNX, ademas de los modelos serializados en joblib.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues; es un conjunto de modelos tabulares de proposito especifico.

## Casos de uso

- Evaluacion de solicitudes de credito al consumo: el clasificador LightGBM devuelve una probabilidad de impago que puede usarse como senal auxiliar en un flujo de decision, siempre con revision humana y con el grado del prestamo ya asignado.
- Tarificacion preliminar de prestamos: el regresor Random Forest estima el tipo de interes en puntos porcentuales, util como punto de partida para simulaciones internas de pricing.
- Segmentacion de cartera: el GMM agrupa prestatarios por perfil, lo que permite analisis exploratorio de cohortes y diseno de campanas, aunque con un silhouette de 0,2336 la separacion entre grupos es debil.
- Prototipado y docencia en riesgo crediticio: el paquete incluye datos limpios, splits y transformadores, lo que facilita reproducir el pipeline completo en un curso o taller sin infraestructura adicional.
- Pruebas de integracion de pipelines ONNX: los equivalentes ONNX permiten validar el despliegue en runtimes de inferencia sin dependencia de Python ni de las versiones de las librerias originales.
- Analisis de sensibilidad de umbrales: con un umbral fijo de 0,6 y probabilidades continuas, el modelo sirve para estudiar el compromiso entre falsos positivos y falsos negativos en un comite de credito simulado.
- Evaluacion comparativa de tecnicas tabulares: al incluir boosting, bosques y mezclas gaussianas sobre los mismos splits, es util como referencia en experimentos academicos de modelado tabular.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre filas retenidas (held-out):

| Tarea | Filas retenidas | Metrica | Valor |
|---|---:|---|---|
| Clasificacion de impago | 4.865 | F1 | 0,8375 |
| Clasificacion de impago | 4.865 | ROC-AUC | 0,9498 |
| Clasificacion de impago | 4.865 | Exactitud | 93,44 % |
| Regresion de tipo de interes | 4.401 | R² | 0,9070 |
| Regresion de tipo de interes | 4.401 | RMSE | 0,9746 puntos porcentuales |
| Regresion de tipo de interes | 4.401 | MAE | 0,7509 puntos porcentuales |
| Segmentacion de prestatarios | 4.865 | Silhouette | 0,2336 |
| Cadena de solicitante nuevo (con tasa predicha) | 4.401 | F1 | 0,8428 |
| Cadena de solicitante nuevo (con tasa predicha) | 4.401 | ROC-AUC | 0,9485 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- No requiere GPU: los modelos LightGBM, Random Forest y GMM se ejecutan en CPU.
- Inferencia ligera en memoria: el repositorio completo ocupa 0,3 GB, incluidos datos, transformadores y artefactos ONNX.
- Cabe en cualquier equipo de desarrollo convencional; no se especifican requisitos minimos de RAM ni de CPU.
- Opciones de despliegue: carga directa con joblib en Python, o ejecucion de los artefactos ONNX con ONNX Runtime en Python, C++, C# o Java.
- Latencia y throughput estimados: no disponibles.
- Advertencia operativa: nunca se deben deserializar ficheros joblib de origen no confiable; el autor recomienda verificar los hashes del manifiesto de artefactos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Abdulmoiz123/loan-risk-models` | LightGBM + Random Forest + GMM tabulares | no disponible | no aplica | F1 0,8375; ROC-AUC 0,9498; R² 0,9070 | MIT (codigo) | HuggingFace, 0 descargas |
| XGBoost / LightGBM genericos (referencia de la industria) | Gradient boosting tabular | no disponible | no aplica | depende del dataset | Apache 2.0 / MIT | ampliamente disponibles |
| CatBoost | Gradient boosting con soporte de categoricas | no disponible | no aplica | depende del dataset | Apache 2.0 | ampliamente disponible |
| Modelos de riesgo crediticio propietarios | variable | no disponible | no aplica | no publico | propietaria | no publicos |

La comparacion cuantitativa con alternativas no esta disponible porque el autor no publica evaluaciones cruzadas con otros modelos sobre el mismo split. Cualquier comparacion de rendimiento con XGBoost, CatBoost o modelos propietarios requeriria reentrenar sobre los mismos datos y particiones.

## Limitaciones y advertencias

- Los resultados provienen de una reconstruccion controlada de un dataset publico ya explorado, no de una validacion externa independiente.
- El dataset no incluye identificadores de prestatario: la agrupacion por perfil en el momento de la solicitud evita que perfiles coincidentes crucen particiones, pero no puede demostrar que perfiles distintos correspondan a personas distintas.
- El grado del prestamo debe estar ya asignado por el prestamista cuando se usa el sistema; no es un modelo de scoring desde cero.
- Las puntuaciones no establecen equidad, causalidad, calibracion para una entidad bancaria concreta ni rendimiento economico futuro.
- El umbral de clasificacion esta fijado en 0,6 y no se documenta su calibracion para distintos costes de error.
- El silhouette de 0,2336 en segmentacion indica una separacion debil entre grupos; los segmentos deben interpretarse con cautela.
- Sin datos de sesgo demografico ni de subgrupos: no se han publicado analisis de disparidad por edad, genero u origen.
- Riesgo de alucinacion no aplica (no es un modelo generativo), pero si el riesgo de sobreajuste al dataset de origen y de extrapolacion incorrecta a otras poblaciones.
- Uso previsto educativo y de demostracion; el autor desaconseja explicitamente su uso para decisiones de prestamo autonomas reales.
- Nunca deserializar ficheros joblib de origen no verificado; comprobar los hashes del manifiesto de artefactos antes de cargar.
- La licencia MIT cubre el codigo, pero los datos publicos conservan la licencia de su fuente original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Abdulmoiz123/loan-risk-models
- Repositorio del proyecto: https://github.com/moizishere-droid/loan-risk-system
- Dataset de origen: https://www.kaggle.com/datasets/laotse/credit-risk-dataset
- Manifiesto de artefactos: `models/artifact_manifest.json` en el repositorio del proyecto
