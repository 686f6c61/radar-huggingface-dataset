# ninad4518/tourism-wellness-model

## Resumen

El modelo `tourism-wellness-model` es un clasificador tabular binario publicado por el usuario ninad4518 en Hugging Face. Su objetivo es predecir la compra de un paquete de turismo de bienestar (wellness tourism package) a partir de variables tabulares de clientes. Se distribuye como un pipeline de scikit-learn que incluye el preprocesamiento y un estimador XGBoost, con un umbral de decisión ajustado a 0,45.

No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un artefacto de machine learning clásico orientado a un problema de negocio concreto (scoring de propensión de compra). El repositorio tiene un tamaño de 0,0 GB (probablemente por debajo del umbral de redondeo de la plataforma) y no registra descargas ni likes en el momento de la consulta.

La relevancia de esta ficha es limitada fuera de su dominio: sirve como ejemplo de modelo tabular empaquetado con `joblib`, útil para quienes buscan referencias de pipelines de clasificación con XGBoost y métricas reportadas, pero no es un modelo generalista ni reutilizable fuera de su esquema de features.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn con estimador XGBoost (gradient boosting sobre árboles) |
| Parametros totales | no disponible (no aplica en el sentido de redes neuronales; número de árboles y profundidad no publicados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (formato `joblib`, sin cuantización documentada) |
| Idiomas soportados | no disponible (no procesa texto de forma nativa; depende de las features de entrada) |
| Licencia | no disponible |
| Formato de pesos | `joblib` (serialización de pipeline scikit-learn) |

## Arquitectura y entrenamiento

La model card indica que se trata de un XGBoost envuelto en un `Pipeline` de scikit-learn que incluye el preprocesamiento. No se detalla la composición del pipeline (imputación, codificación de categóricas, escalado), ni el número de estimadores, la profundidad máxima, la tasa de aprendizaje u otros hiperparámetros del booster. Tampoco se especifica el volumen de datos de entrenamiento ni la partición utilizada, más allá del conjunto de test reportado.

El único detalle de configuración explícito es el umbral de decisión de 0,45, inferior al 0,5 habitual, lo que sugiere un ajuste orientado a equilibrar precisión y recall en la clase positiva (compra). No se documenta si hubo búsqueda de hiperparámetros, validación cruzada, calibración de probabilidades ni técnicas de balanceo de clases.

## Capacidades

- Clasificación binaria tabular: predice compra / no compra de un paquete de turismo de bienestar.
- Integración con el ecosistema scikit-learn: al ser un `Pipeline`, admite `predict`, `predict_proba` y `score` sobre datos con el mismo esquema de features.
- Preprocesamiento incluido: el pipeline incorpora los pasos de transformación, por lo que la entrada debe respetar el formato esperado por el modelo.
- Umbral de decisión configurable a 0,45 para la asignación de clase positiva.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- Capacidades multilingües: no aplica; el modelo no procesa lenguaje natural de forma directa.

## Casos de uso

- Scoring de propensión de compra en campañas de marketing: el modelo puntúa clientes con probabilidad de adquirir un paquete de wellness, permitiendo priorizar llamadas comerciales y optimizar el coste por conversión con una precisión reportada del 0,855 en la clase positiva.
- Segmentación de cartera de clientes: ordenar la base por `predict_proba` para construir deciles de propensión y diseñar acciones diferenciadas por segmento.
- Filtrado previo en embudos de venta: usar el umbral de 0,45 para derivar solo los casos con probabilidad suficiente a un equipo humano, reduciendo volumen de contactos improductivos.
- Integración en CRM o plataforma de automatización: al ser un artefacto `joblib` de scikit-learn, puede cargarse en un servicio Python (Flask, FastAPI) o en un job batch para puntuar diariamente la base de clientes.
- Análisis de campañas A/B: emplear las probabilidades del modelo como covariable para ajustar el efecto del tratamiento y controlar el sesgo de selección.
- Prototipado y docencia: sirve como ejemplo reproducible de pipeline tabular con XGBoost y métricas de clasificación reportadas, útil en cursos o tutoriales de ML aplicado.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el conjunto de test (826 muestras):

| Metrica | Valor |
|---|---|
| Accuracy | 0,944 |
| Precision (clase compra) | 0,855 |
| Recall (clase compra) | 0,855 |
| F1 (clase compra) | 0,855 |
| ROC-AUC | 0,977 |

Desglose por clase reportado por el autor:

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| No purchase | 0,97 | 0,97 | 0,97 | 667 |
| Purchase | 0,86 | 0,86 | 0,86 | 159 |
| Macro avg | 0,91 | 0,91 | 0,91 | 826 |
| Weighted avg | 0,94 | 0,94 | 0,94 | 826 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia de un pipeline XGBoost sobre datos tabulares se ejecuta en CPU.
- GPU recomendadas: no necesarias. El entrenamiento e inferencia de XGBoost pueden acelerarse con CUDA (`tree_method='gpu_hist'`), pero no se documenta que se haya usado.
- CPU: cualquier procesador moderno es suficiente; el cuello de botella será el tamaño del lote a puntuar.
- Memoria RAM: dependiente del tamaño del modelo serializado y del dataset de inferencia; no se publica el tamaño exacto (el repo figura como 0,0 GB).
- Despliegue: carga directa con `joblib.load` en Python, servicio REST con FastAPI/Flask, o integración en jobs batch. No aplican vLLM, llama.cpp, Ollama ni TGI, que son específicos de modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia genérica de la categoría, cabría contrastar con otros clasificadores tabulares (LightGBM, CatBoost, regresión logística), pero no se han publicado métricas de esos modelos sobre este mismo dataset en la información disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tourism-wellness-model (XGBoost) | no disponible | no aplica | F1 0,855 / ROC-AUC 0,977 (test propio) | no disponible | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial sin contactar con el autor.
- Esquema de features no documentado: el pipeline espera un conjunto concreto de columnas y transformaciones; sin esa información, el modelo no es reutilizable directamente.
- Métricas autoevaluadas: los resultados provienen del propio autor y no han sido verificados de forma independiente.
- Dataset de test pequeño (826 muestras, 159 positivos): la precisión y el recall de la clase minoritaria tienen intervalos de confianza amplios.
- Riesgo de sobreajuste y de degradación fuera de la distribución de entrenamiento (por ejemplo, otro mercado, país o periodo temporal).
- Sesgos potenciales no evaluados: no se documenta análisis de equidad por género, edad, región u otras variables sensibles.
- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones en lenguaje natural.
- Sin información sobre calibración de probabilidades: las salidas de `predict_proba` pueden no ser probabilidades bien calibradas, lo que afecta a su uso en decisiones económicas.
- Fecha de creación futura en los metadatos (2026-11-22): conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ninad4518/tourism-wellness-model
- Repositorio de scikit-learn: https://scikit-learn.org
- Documentación de XGBoost: https://xgboost.readthedocs.io
- Documentación de joblib: https://joblib.readthedocs.io
