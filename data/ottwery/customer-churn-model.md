# ottwery/customer-churn-model

## Resumen

El modelo `ottwery/customer-churn-model` es un clasificador binario tabular publicado en Hugging Face por el usuario ottwery. Su objetivo es predecir la probabilidad de que un cliente de un servicio de suscripción cancele su cuenta (*churn*) frente a que permanezca activo. No se trata de un modelo de lenguaje ni de una red neuronal: es un pipeline de regresión logística serializado con `joblib`, entrenado con scikit-learn 1.6.1 sobre un conjunto de datos de Kaggle de 2.800 filas y 10 columnas.

El modelo resuelve un problema clásico de retención de clientes: permite a un equipo de retención priorizar acciones preventivas (ofertas, contactos proactivos) antes de que el cliente abandone. Recibe ocho características de entrada tras aplicar One-Hot Encoding sobre el tipo de plan: tarifa mensual, horas de uso semanales, tickets de soporte, fallos de pago, antigüedad en meses, días desde el último inicio de sesión y dos indicadores binarios del plan (Premium y Standard).

Es relevante como ejemplo de modelo tabular ligero y desplegable en cualquier entorno con Python, aunque su rendimiento es modesto (66,31 % de exactitud) y su ámbito de aplicación muy acotado. La model card está redactada en indonesio y el modelo declara ese idioma, pero el contenido es puramente numérico y categórico, sin procesamiento de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (scikit-learn, `C=0.1`, penalty `l2`, solver `liblinear`) |
| Parametros totales | no disponible (8 coeficientes mas intercepto tras One-Hot Encoding) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantizacion | no aplica (pesos en coma flotante serializados con `joblib`) |
| Idiomas soportados | indonesio (segun la model card; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `joblib` (`.joblib`), con objetos separados para modelo, scaler y nombres de features |
| Tamano del repositorio | 0,0 GB (redondeado; artefactos de muy pocos KB) |
| Version de scikit-learn | 1.6.1 |
| Tarea | Clasificacion binaria tabular |
| Features de entrada | 8 (6 numericas + 2 binarias de plan) |
| Dataset de entrenamiento | Kaggle "Customer Subscription Churn and Usage Patterns" (2.800 filas, 10 columnas) |

## Arquitectura y entrenamiento

El modelo es una regresión logística con regularización L2 (`C=0.1`), solver `liblinear`, precedida de un escalado de las variables numéricas (objeto `scaler` serializado aparte) y de un One-Hot Encoding del tipo de plan que produce las dos columnas binarias `plan_type_Premium` y `plan_type_Standard`. No hay capas ocultas, atención ni mecanismo de secuencia: cada predicción es una combinación lineal de las ocho features transformadas, pasada por una función sigmoide para obtener la probabilidad de churn.

El entrenamiento se realizó sobre 2.800 filas históricas de clientes con 10 columnas, de las que se derivan las 8 features finales. La model card indica que hubo *hyperparameter tuning* para fijar `C=0.1` y el solver, pero no detalla la estrategia de validación, el reparto train/test ni si se aplicó balanceo de clases. Tampoco se documenta ningún proceso de calibración de probabilidades ni de selección de umbral; el umbral de decisión parece ser el estándar de 0,5. No se menciona uso de RLHF, DPO ni técnicas de aprendizaje profundo, algo esperable en un modelo de esta naturaleza.

## Capacidades

- Clasificación binaria tabular: predice churn (1) o no churn (0) a partir de ocho features numéricas y binarias.
- Estimación de probabilidad: `predict_proba` devuelve la probabilidad de churn, lo que permite priorizar clientes por riesgo.
- Preprocesado integrado: incluye el `scaler` y la lista de nombres de features necesarios para reproducir la inferencia.
- Inferencia determinista y de bajísimo coste computacional (microsegundos por muestra en CPU).
- No soporta tool calling, function calling ni agentes.
- No soporta generación de texto, razonamiento, código ni matemáticas simbólicas.
- No tiene capacidades multimodales (visión, audio) ni modo *thinking*.
- No procesa lenguaje natural; el multilingüismo no aplica más allá de la etiqueta declarada.

## Casos de uso

- Priorización de campañas de retención: ordenar la base de clientes por probabilidad de churn y dirigir ofertas o contactos proactivos solo al percentil de mayor riesgo, dado que el modelo expone `predict_proba` y la model card advierte de un 31,73 % de falsos positivos que conviene filtrar por score.
- Segmentación operativa en el CRM: integrar el modelo en el pipeline de datos para etiquetar diariamente a los clientes con riesgo alto, medio o bajo y activar flujos de trabajo distintos en función de la etiqueta.
- Detección temprana de clientes con bajo uso: la feature `avg_weekly_usage_hours` y `last_login_days_ago` permiten identificar cuentas inactivas; el modelo traduce esa señal en una probabilidad accionable para el equipo de éxito del cliente.
- Análisis de impacto de fallos de pago y soporte: cuantificar cómo `payment_failures` y `support_tickets` se asocian al churn para justificar inversiones en mejora de facturación o atención al cliente.
- Prototipado rápido de un baseline de churn: al ser un modelo ligero con licencia MIT y formato `joblib`, sirve como referencia mínima contra la que comparar modelos más complejos (gradient boosting, redes tabulares) antes de invertir en infraestructura.
- Despliegue en entornos con recursos mínimos: el modelo cabe en cualquier contenedor Python sin GPU y puede servirse como endpoint REST con Flask o FastAPI para pruebas internas o demos.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card y corresponden al conjunto de prueba del autor:

| Metrica | Valor |
|---|---|
| Exactitud (accuracy) | 66,31 % |
| Precision (clase 1, churn) | 68,27 % |
| Recall / sensibilidad (clase 1) | 76,92 % |
| F1-score (clase 1) | 72,34 % |
| Tasa de falsos positivos | 31,73 % |

No se han publicado comparaciones con otros modelos ni resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros), que por otra parte no aplican a un clasificador tabular.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta íntegramente en CPU.
- GPU recomendadas: ninguna; cualquier CPU moderna es suficiente.
- Cabe en cualquier equipo de consumo: el artefacto `joblib` ocupa kilobytes y la inferencia consume unos pocos MB de RAM.
- Opciones de despliegue: scripts Python con `joblib` y `scikit-learn` 1.6.1, endpoints con Flask o FastAPI, o integración en pipelines de datos (Airflow, Prefect). No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del modelo (regresión logística sobre 8 features) se espera latencia de microsegundos a milisegundos por muestra en CPU, con throughput de miles de predicciones por segundo en un solo núcleo.

## Comparativa con modelos similares

| Modelo | Tipo | Features | Licencia | Contexto / entrada | Rendimiento publicado |
|---|---|---|---|---|---|
| ottwery/customer-churn-model | Regresion logistica | 8 | MIT | Tabla de 8 columnas | Accuracy 66,31 %, F1 72,34 % |
| Baselines de churn con gradient boosting (XGBoost, LightGBM) | Arboles potenciados | Variable | MIT / Apache 2.0 | Tabla de N columnas | No disponible en esta ficha |
| Redes tabulares (TabNet, MLP) | Red neuronal | Variable | MIT / Apache 2.0 | Tabla de N columnas | No disponible en esta ficha |

No se dispone de resultados de benchmarks publicados para los modelos alternativos en el contexto de este conjunto de datos concreto, por lo que la comparación cuantitativa directa no está disponible. En términos cualitativos, los modelos de gradient boosting suelen superar a la regresión logística en datos tabulares con interacciones no lineales, mientras que la regresión logística ofrece mayor interpretabilidad y menor coste de despliegue.

## Limitaciones y advertencias

- Asume linealidad en la frontera de decisión: no captura interacciones no lineales entre variables, lo que puede infraestimar el riesgo en perfiles complejos.
- Rendimiento modesto: 66,31 % de exactitud sobre el conjunto de prueba, solo ligeramente por encima de un clasificador trivial en un problema potencialmente desbalanceado.
- Tasa de falsos positivos del 31,73 %: la model card recomienda usar el score de probabilidad para priorizar y no la etiqueta binaria directa, para no malgastar presupuesto en promociones a clientes que no iban a marcharse.
- Dependencia temporal y geográfica: entrenado con patrones históricos de un dataset concreto de Kaggle; no garantiza validez ante cambios de mercado, precios o comportamiento.
- Ámbito de aplicación estrecho: solo válido para servicios de suscripción con features similares a las ocho documentadas; no es un modelo de propósito general.
- Dependencia de versión: requiere scikit-learn 1.6.1 para deserializar correctamente; versiones distintas pueden romper la carga del `joblib`.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías; conviene revisar los términos del dataset de Kaggle subyacente antes de un despliegue en producción.
- Sin documentación sobre sesgos demográficos, calibración de probabilidades ni estrategia de validación; cualquier uso en producción debería acompañarse de una evaluación propia sobre datos representativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ottwery/customer-churn-model
- Dataset de origen en Kaggle: https://www.kaggle.com/datasets/jayjoshi37/customer-subscription-churn-and-usage-patterns
- Documentación de scikit-learn (version 1.6.1): https://scikit-learn.org/stable/
- Documentación de joblib: https://joblib.readthedocs.io/
