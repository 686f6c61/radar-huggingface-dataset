# hadissuryaalamin/maintain-predict

## Resumen

`maintain-predict` es un clasificador tabular binario desarrollado por el usuario de Hugging Face `hadissuryaalamin` como proyecto de aprendizaje. Utiliza XGBoost para predecir la presencia de evidencia de fallo en maquinaria industrial a partir de seis variables fisicas (tipo de producto, temperaturas de aire y proceso, velocidad rotacional, par y desgaste de herramienta), mas una feature derivada de interaccion (par x desgaste). El modelo se entrena sobre el dataset sintetico AI4I 2020 Predictive Maintenance, publicado por S. Matzka en UCI, que contiene 10.000 observaciones generadas artificialmente y no mediciones de una flota real.

El modelo resuelve un problema de clasificacion a nivel de fila, no una prediccion validada de fallos futuros. Su target es una politica derivada denominada `failure_evidence_or_v1`, que marca como positivo cualquier fila donde el fallo de maquina o alguna de sus modalidades (TWF, HDF, PWF, OSF, RNF) este activa. Esto incrementa los positivos de 339 a 357 (3,57 % del total). El autor declara explicitamente que el modelo no esta validado para programacion de mantenimiento, control industrial ni decisiones de seguridad.

La relevancia del modelo es fundamentalmente educativa: demuestra un flujo completo de inferencia tabular con preprocesado serializado en `.skops`, pesos nativos de XGBoost en `.ubj` y un helper de prediccion que encapsula el calculo de features. No obstante, sus metricas sobre el conjunto de test (F1 de 0,7818, recall de 0,8113) deben interpretarse con cautela dado el origen sintetico de los datos y la ausencia de calibracion como probabilidades fisicas de fallo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de arboles (XGBoost, objetivo logístico binario, histograma en CPU) |
| Parametros totales | no disponible (300 rondas de boosting, profundidad maxima 5) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, una fila por inferencia) |
| Tipos de cuantizacion | no disponible (no aplica a modelos de arboles en el sentido habitual) |
| Idiomas soportados | en (etiquetas y documentacion en ingles) |
| Licencia | MIT |
| Formato de pesos | `.ubj` (XGBoost nativo) + `.skops` (preprocesador serializado) |

## Arquitectura y entrenamiento

El estimador es un gradient boosting de arboles implementado con XGBoost, con 300 rondas de boosting, profundidad maxima 5, tasa de aprendizaje 0,1 y objetivo `binary:logistic` entrenado con histograma en CPU. Se aplica ponderacion de clase positiva para compensar la rareza de los positivos, con un peso final de entrenamiento de 27. El preprocesador realiza one-hot encoding de la variable categorica `Type` (L, M, H) y deja pasar las variables numericas sin transformar, resultando en nueve entradas codificadas a partir de siete features originales (seis crudas mas la interaccion par x desgaste).

El entrenamiento utiliza una particion guardada con semilla 42, estratificada conjuntamente por `Type` y el target derivado: 7.000 filas de entrenamiento (250 positivos), 1.500 de validacion (54 positivos) y 1.500 de test (53 positivos). La seleccion de modelo y features se hizo mediante validacion cruzada solo sobre entrenamiento. El autor senala que la variante con par x desgaste fue elegida por el usuario tras revisar compromisos en validacion, no porque ganase todas las comparaciones. El umbral se mantuvo en 0,5 sin ajuste. Se aplicaron precauciones contra leakage: exclusion de flags de resultado, `Machine failure`, `Product ID` y `UDI` como predictores, y ajuste del preprocesado dentro de los folds de validacion cruzada. No se menciona uso de RLHF ni tecnicas de aprendizaje por refuerzo, algo esperable en un modelo tabular.

## Capacidades

- Clasificacion binaria tabular a nivel de fila: predice evidencia de fallo (etiqueta 1) o ausencia de evidencia (etiqueta 0) a partir de seis variables fisicas mas la interaccion par x desgaste.
- Salida calibrada como score: devuelve `failure_score`, `predicted_label` y `threshold`, con umbral fijo de 0,5.
- Ingenieria de features integrada: el helper de inferencia calcula automaticamente `Torque wear [Nm min]` como producto de par y desgaste, e ignora o recalcula columnas extra.
- Validacion de entradas: exige valores numericos finitos y que `Type` pertenezca a las tres categorias conocidas (L, M, H).
- Preprocesado encapsulado: one-hot encoding de `Type` y paso directo de numericas, serializado en `.skops` para evitar pickling de estimadores personalizados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales (vision, audio). Es un modelo puramente tabular.
- Capacidad multilingue limitada: etiquetas y documentacion en ingles; los datos no contienen texto libre.

## Casos de uso

- Demostracion educativa de un pipeline tabular completo: el modelo sirve para ilustrar el ciclo desde la carga de datos sinteticos hasta la serializacion con `.skops` y `.ubj`, pasando por validacion cruzada, seleccion de umbral y evaluacion unica en test. Es adecuado porque el autor lo concibe explicitamente como proyecto de aprendizaje reproducible.
- Prototipado de un clasificador de evidencia de fallo en entornos de laboratorio: se puede usar para experimentar con features derivadas (par x desgaste) y comparar variantes de modelo sobre el dataset AI4I 2020, sin riesgo industrial porque los datos son sinteticos.
- Docencia en ingenieria de mantenimiento predictivo: permite explicar la diferencia entre clasificacion a nivel de fila y pronostico de fallos futuros, asi como el impacto de los desequilibrios de clase (3,57 % de positivos) en metricas como precision y recall.
- Pruebas de integracion de inferencia tabular en pipelines de CI/CD: el helper `FailurePredictor` carga los artefactos y calcula features, lo que facilita tests automatizados de regresion del modelo sin depender de MLflow ni del checkout original del proyecto.
- Benchmarking interno de XGBoost frente a alternativas tabulares: con 300 rondas, profundidad 5 y ponderacion de clase, sirve como linea base reproducible para comparar con otros algoritmos sobre el mismo split estratificado (semilla 42).
- Generacion de ejemplos sinteticos de scoring de riesgo: util para construir dashboards o demos de scoring donde se necesite una salida `failure_score` continua y una etiqueta binaria con umbral configurable, siempre que se etiquete claramente como demostracion y no como probabilidad fisica calibrada.

## Benchmarks y rendimiento

Resultados guardados del proyecto, leidos de los registros completados (no reejecutados durante la exportacion). AP es average precision; el resto de metricas usan umbral 0,5.

| Particion | AP | Accuracy | Precision | Recall | F1 | TN | FP | FN | TP |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Validacion | 0,8483 | 0,9840 | 0,7419 | 0,8519 | 0,7931 | 1430 | 16 | 8 | 46 |
| Test | 0,8466 | 0,9840 | 0,7544 | 0,8113 | 0,7818 | 1433 | 14 | 10 | 43 |

El conjunto de test contiene 53 positivos: 43 detectados y 10 no detectados, con 14 falsos positivos. El autor advierte que la accuracy aislada es enganosa por la rareza de los positivos, y que no hay intervalos de incertidumbre ni estimaciones verificadas para equipos reales. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido de GPU; XGBoost con 300 arboles de profundidad 5 es un modelo de pocos megabytes que se ejecuta en CPU.
- GPU recomendadas: no necesarias. El entrenamiento original uso histograma en CPU. Cualquier CPU moderna es suficiente para inferencia.
- Cabe en GPU consumer: si, pero no es necesario; el cuello de botella es la carga del preprocesador `.skops` y el calculo de features, no el modelo.
- Opciones de despliegue: inferencia nativa con la libreria `xgboost` y el helper `predict.py` incluido en el repositorio; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos tabulares.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por la naturaleza del modelo (arboles poco profundos, una fila por inferencia), la latencia esperada es de orden de microsegundos a milisegundos en CPU, pero no hay cifras publicadas.
- Entorno: requiere instalar `requirements.txt` en un entorno compatible; la exportacion registra la version original de Python en `export_manifest.json` y la inferencia solo se comprobo en ese entorno.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia contextual, el propio autor menciona que la seleccion de la variante con par x desgaste se hizo frente a otras variantes y features candidatas dentro del mismo proyecto, pero no se publican sus metricas ni identificadores. Cualquier comparacion con otros clasificadores tabulares (por ejemplo, regresion logistica o random forest sobre el mismo dataset AI4I 2020) requeriria datos que no estan en la informacion disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| maintain-predict | no disponible (300 arboles, profundidad 5) | no aplica | F1 test 0,7818; AP 0,8466 | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Datos sinteticos: el dataset AI4I 2020 contiene 10.000 observaciones generadas artificialmente, no mediciones de una flota desplegada. El rendimiento sobre equipos reales no esta verificado.
- Target derivado: la politica `failure_evidence_or_v1` promueve 18 filas a positivas respecto al target original de `Machine failure`, lo que constituye una suposicion explicita de etiquetado, no una correccion verificada del dataset fuente.
- Sin calibracion fisica: los scores no estan calibrados como probabilidades fisicas de fallo; un score de 0,5 no implica un 50 % de probabilidad real de averia.
- Umbral no ajustado: el umbral se fijo en 0,5 sin tuning porque no se definio un objetivo de coste operativo ni de recall minimo. En produccion, el umbral deberia elegirse segun el coste relativo de falsos positivos y falsos negativos.
- Desequilibrio de clase: solo el 3,57 % de las filas son positivas; la accuracy del 98,40 % es enganosa y debe acompanarse siempre de precision, recall y AP.
- Sin intervalos de incertidumbre: no se reportan estimaciones de incertidumbre ni validacion en equipos reales.
- Riesgo de leakage residual: se realizo EDA sobre el fichero completo antes del modelado y se inspecciono repetidamente la validacion durante la seleccion, lo que limita las afirmaciones de independencia.
- Restricciones de uso: el autor prohibe explicitamente su uso para programacion de mantenimiento, control industrial o decisiones de seguridad. La licencia MIT permite uso comercial del codigo y los pesos, pero la licencia de los datos fuente es CC BY 4.0 y exige atribucion.
- Idioma: documentacion y etiquetas solo en ingles; sin soporte multilingue.
- Entorno de inferencia: la compatibilidad solo se verifico en la version de Python registrada en `export_manifest.json`; otras versiones pueden requerir ajustes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hadissuryaalamin/maintain-predict
- Dataset AI4I 2020 Predictive Maintenance (UCI): https://doi.org/10.24432/C5HS5C
- Licencia de los datos (CC BY 4.0): https://creativecommons.org/licenses/by/4.0/
- Licencia del modelo (MIT): no se proporciona URL especifica en la informacion disponible
- Paper de referencia del dataset (Matzka, 2020): no se proporciona URL directa distinta del DOI de UCI
- Repositorio de codigo, demo o blog adicional: no disponible en la informacion proporcionada
