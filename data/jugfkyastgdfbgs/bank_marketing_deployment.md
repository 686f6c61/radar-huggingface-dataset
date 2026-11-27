# jugfkyastgdfbgs/Bank_Marketing_Deployment

## Resumen

Bank_Marketing_Deployment es un modelo de clasificacion binaria supervisada publicado en Hugging Face por el usuario jugfkyastgdfbgs. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un pipeline clasico de scikit-learn basado en regresion logistica, serializado con joblib, cuyo objetivo es predecir si un cliente bancario contratara o no un deposito a plazo (term deposit) a partir de caracteristicas demograficas, historial de campanas de marketing y variables macroeconomicas.

El modelo se entrena sobre el dataset publico Bank Marketing (41.188 filas originales, 41.176 tras limpieza, 53 caracteristicas tras codificacion one-hot y estandarizacion con StandardScaler). El autor compara tres algoritmos candidatos (regresion logistica, arbol de decision y random forest) y selecciona la regresion logistica atendiendo al equilibrio entre F1-score y recall, lo cual tiene sentido en un escenario de marketing telefonico donde el coste de un falso negativo (no contactar a un cliente que si habria contratado) suele ser alto.

Es relevante como ejemplo reproducible de un flujo completo de machine learning tabular: limpieza, codificacion, escalado, busqueda de hiperparametros con GridSearchCV y validacion cruzada estratificada de 5 folds, empaquetado de artefactos y publicacion. No obstante, sus cifras de rendimiento son modestas (F1 en torno al 60 %), lo que refleja la dificultad intrinseca del problema y el fuerte desbalanceo de clases. El repositorio ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (scikit-learn), pipeline tabular con StandardScaler |
| Parametros totales | no disponible (53 coeficientes mas intercepto, segun 53 caracteristicas codificadas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica; artefactos serializados en joblib |
| Idiomas soportados | no disponible (modelo tabular, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | joblib (`model_saya.joblib`, `scaler.joblib`, `feature_names.joblib`, `metadata.joblib`) |

## Arquitectura y entrenamiento

La arquitectura es una regresion logistica lineal clasica implementada en scikit-learn, precedida por un StandardScaler que estandariza las caracteristicas numericas. El preprocesamiento incluye limpieza de datos, codificacion de variables categoricas (hasta alcanzar 53 caracteristicas) y division train/test. El conjunto de datos original contiene 41.188 filas, que quedan en 41.176 tras la limpieza.

El ajuste de hiperparametros se realizo mediante GridSearchCV con StratifiedKFold de 5 folds, explorando valores de C en {0,01; 0,1; 1; 10; 100}. La mejor configuracion fue C = 10, max_iter = 2000 y class_weight = "balanced", con un F1-score de validacion cruzada de 0,5863. El uso de `class_weight="balanced"` compensa el desbalanceo de clases del dataset, priorizando el recall de la clase positiva. No se emplean tecnicas de regularizacion adicionales, aumento de datos ni arquitecturas no lineales en la version final.

## Capacidades

- Clasificacion binaria tabular: predice si un cliente contratara (Yes) o no (No) un deposito a plazo.
- Integracion directa con scikit-learn: el modelo es compatible con `predict`, `predict_proba` y el resto de la API estandar.
- Preprocesamiento empaquetado: incluye el scaler y la lista de nombres de caracteristicas, lo que facilita la reproducibilidad de la inferencia.
- Interpretabilidad: al ser un modelo lineal, los coeficientes permiten analizar la contribucion de cada caracteristica (util para explicar decisiones a equipos de negocio).
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: es un modelo puramente predictivo sobre datos estructurados.
- No dispone de capacidades multilingues ni de procesamiento de lenguaje natural.

## Casos de uso

- Priorizacion de campanas telefonicas: el modelo puntua a cada cliente con una probabilidad de contratacion, permitiendo ordenar las llamadas del equipo comercial y concentrar el esfuerzo en los perfiles con mayor propension, dado el alto recall (90,73 %) que minimiza los falsos negativos.
- Segmentacion de carteras: combinando `predict_proba` con reglas de negocio, se pueden construir segmentos de riesgo/oportunidad para disenar ofertas diferenciadas de depositos a plazo.
- Analisis de sensibilidad de variables: al tratarse de un modelo lineal con coeficientes interpretables, sirve para estudiar que caracteristicas (edad, profesion, resultado de campanas previas, indicadores macro) empujan la decision del cliente.
- Prototipado rapido de soluciones de scoring: por su bajo coste computacional y su serializacion en joblib, es adecuado como linea base antes de invertir en modelos mas complejos (gradient boosting, redes neuronales tabulares).
- Despliegue en entornos con recursos limitados: la inferencia es practicamente instantanea en CPU, por lo que puede servirse desde una funcion serverless o un contenedor pequeno sin GPU.
- Docencia y reproduccion de pipelines de ML: el repositorio incluye scaler, nombres de features y metadatos, lo que lo convierte en un ejemplo completo de extremo a extremo para formar equipos en scikit-learn.
- Simulacion de escenarios de retencion: evaluando como cambia la probabilidad predicha al modificar variables controlables (canal de contacto, momento de la llamada), se pueden estimar impactos antes de lanzar una campana.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (dataset Bank Marketing, particion de test):

| Metrica | Antes del tuning | Despues del tuning |
|---|---:|---:|
| Accuracy | 86,43 % | 86,44 % |
| Precision | 44,94 % | 44,95 % |
| Recall | 90,84 % | 90,73 % |
| F1-score | 60,13 % | 60,12 % |

Matriz de confusion tras el tuning:

| Actual / Prediccion | No | Yes |
|---|---:|---:|
| No | 6277 | 1031 |
| Yes | 86 | 842 |

El F1-score de validacion cruzada durante la busqueda de hiperparametros fue de 0,5863. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica (no necesita GPU).
- Memoria RAM: unos pocos megabytes para cargar los artefactos joblib y el entorno de scikit-learn; el repositorio ocupa 0,0 GB.
- Opciones de despliegue: script de Python con scikit-learn y joblib, API REST con FastAPI o Flask, contenedor Docker, funciones serverless (AWS Lambda, Cloud Functions) o integracion en pipelines de datos con Airflow.
- Latencia y throughput: no se han publicado mediciones; por la naturaleza del modelo (regresion logistica con 53 caracteristicas) se espera una latencia del orden de microsegundos a milisegundos por prediccion en CPU, aunque este dato no esta confirmado en la informacion disponible.

## Comparativa con modelos similares

El autor evaluo dos alternativas sobre el mismo dataset, aunque no publica sus metricas finales:

| Modelo | Tipo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Bank_Marketing_Deployment (regresion logistica) | Lineal, tabular | 53 coeficientes | no aplica | F1 60,12 %, recall 90,73 % | MIT | Hugging Face |
| Decision Tree (candidato evaluado) | Arbol, tabular | no disponible | no aplica | no disponible | no disponible | no publicado |
| Random Forest (candidato evaluado) | Ensamble de arboles, tabular | no disponible | no aplica | no disponible | no disponible | no publicado |

No se dispone de comparaciones con modelos de referencia externos (por ejemplo, XGBoost o LightGBM sobre Bank Marketing) en la informacion proporcionada.

## Limitaciones y advertencias

- Desbalanceo de clases: el dataset original esta fuertemente desbalanceado; el modelo compensa con `class_weight="balanced"`, pero la precision se mantiene baja (44,95 %), lo que implica un volumen considerable de falsos positivos (1031 en la matriz de confusion).
- Rendimiento modesto: un F1-score en torno al 60 % limita su uso como unico criterio de decision; debe emplearse como herramienta de apoyo y no como decision automatica.
- Deriva de datos (data drift): los cambios en las caracteristicas de los clientes o en el contexto macroeconomico pueden degradar las predicciones; se recomienda reentrenamiento periodico y monitorizacion.
- Dependencia del preprocesamiento: la inferencia exige aplicar exactamente el mismo scaler y el mismo orden de caracteristicas (`feature_names.joblib`); un uso incorrecto produce predicciones invalidas.
- Ambito geografico y temporal: el dataset Bank Marketing procede de campanas de marketing telefonico de una entidad concreta; su generalizacion a otras entidades o paises no esta validada.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero no exime del cumplimiento de la normativa de proteccion de datos (RGPD) al tratar informacion de clientes.
- Sin soporte de texto ni de lenguaje natural: no debe confundirse con un modelo generativo; cualquier caso de uso conversacional queda fuera de su alcance.
- Ausencia de validacion externa: no hay evidencia de evaluacion en conjuntos de datos distintos al de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jugfkyastgdfbgs/Bank_Marketing_Deployment
- Dataset Bank Marketing (UCI Machine Learning Repository): no disponible en la informacion proporcionada
- Documentacion de scikit-learn: no disponible en la informacion proporcionada
- Documentacion de joblib: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
