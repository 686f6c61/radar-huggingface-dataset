# pinkepinn/car-supplychain-feedback-model

## Resumen

El modelo `pinkepinn/car-supplychain-feedback-model` es un clasificador binario tabular basado en un árbol de decisión (`DecisionTreeClassifier` de scikit-learn) entrenado para predecir la satisfacción del cliente en transacciones de venta y entrega de vehículos. Lo publica el usuario `pinkepinn` en Hugging Face y se distribuye como artefacto `joblib`, no como pesos de red neuronal. Su propósito es identificar de forma temprana perfiles de transacción con riesgo de generar retroalimentación negativa, de modo que los equipos de cadena de suministro y experiencia de cliente puedan priorizar acciones de mitigación.

El modelo se entrena sobre el dataset público "Car Supply Chain Management" de Kaggle, con 1.000 filas de transacciones del mercado automovilístico estadounidense, divididas de forma estratificada 80:20 (800 de entrenamiento y 200 de prueba). Utiliza 10 variables de entrada (5 numéricas y 5 categóricas) que, tras `One-Hot Encoding` con `drop_first=True`, se expanden a 50 columnas. La variable objetivo es `Feedback_Binary`: clase positiva (satisfecho) para `Good` o `Very Good` (38,7 % de los casos) y clase negativa para `Very Bad`, `Bad` u `Okay` (61,3 %).

Es relevante como ejemplo de modelo tabular ligero y reproducible, pero sus métricas son muy modestas: F1 de 0,4948, accuracy de 0,5100 y ROC-AUC de 0,5264 sobre el conjunto de prueba. No es un modelo generativo ni un transformer; no tiene longitud de contexto, parámetros neuronales ni capacidades lingüísticas en el sentido habitual. La model card está redactada en indonesio y declara el idioma `id`, aunque los datos subyacentes son transacciones en inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Árbol de decisión (`DecisionTreeClassifier` de scikit-learn) |
| Parametros totales | no disponible (modelo no neuronal; número de nodos del árbol no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (artefacto `joblib`; no se documentan conversiones) |
| Idiomas soportados | indonesio (`id`, según metadatos); datos de entrenamiento en inglés |
| Licencia | no disponible |
| Formato de pesos | `joblib` (scikit-learn 1.6.1) |

## Arquitectura y entrenamiento

La arquitectura es un árbol de decisión único, no un ensemble ni una red neuronal. El preprocesamiento incluye `One-Hot Encoding` con `drop_first=True` sobre las cinco variables categóricas (`CarMaker`, `ShipMode`, `Shipping`, `Gender`, `CreditCardType`) y, según la model card, un escalador (`scaler.joblib`) aplicado condicionalmente a las variables numéricas (`CarModelYear`, `CarPrice`, `Sales`, `Quantity`, `Discount`). El artefacto se acompaña de `feature_names.joblib` y `metadata.joblib` para reconstruir el vector de entrada en producción.

El ajuste se realizó con `GridSearchCV` de 5 folds y métrica `f1`, seleccionando `max_depth=3`, `min_samples_leaf=5`, `min_samples_split=2` y `class_weight='balanced'`. No se documenta ningún proceso de RLHF, DPO ni aumento de datos. La variable `ShippingDays` se excluyó explícitamente porque el 24,5 % de los registros presentaban fechas de envío anteriores a las de pedido, una anomalía de registro que habría introducido ruido. El modelo se publica junto con los artefactos auxiliares necesarios para inferencia, lo que facilita su reproducibilidad, aunque la model card contiene una inconsistencia: el `REPO_ID` del ejemplo de código (`kevinedric/car-supplychain-feedback-model`) no coincide con el identificador real del repositorio.

## Capacidades

- Clasificación binaria tabular de satisfacción del cliente (`Puas` frente a `Tidak Puas/Netral`).
- Salida de probabilidad calibrada de forma aproximada mediante `predict_proba`, útil para priorizar casos.
- Procesamiento de 10 variables de entrada con mezcla de tipos numéricos y categóricos.
- Manejo de desbalanceo de clases mediante `class_weight='balanced'`.
- Integración con pipelines de scikit-learn y serialización `joblib`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni modo de razonamiento explícito.
- No genera texto; su única salida es una etiqueta y una probabilidad.

## Casos de uso

- Priorización de alertas de experiencia de cliente: dado un perfil de transacción, el modelo devuelve una probabilidad de insatisfacción que permite ordenar la cola de seguimiento manual antes de que el cliente emita una queja formal.
- Segmentación de pedidos de riesgo en logística: combinando `ShipMode`, `Shipping` y `Discount`, el equipo de operaciones puede marcar envíos con mayor probabilidad de retroalimentación negativa para revisión previa a la entrega.
- Análisis exploratorio de cohortes de concesionarios: aplicado por lotes sobre el histórico de transacciones, permite comparar la tasa de insatisfacción esperada entre marcas (`CarMaker`) y modos de envío.
- Enrutamiento de encuestas postventa: la probabilidad de insatisfacción puede decidir si se envía una encuesta larga o un contacto proactivo, optimizando el presupuesto de atención.
- Prototipado rápido de modelos tabulares: sirve como línea base reproducible (árbol de profundidad 3) frente a la que comparar modelos más complejos en el mismo dataset.
- Docencia y demostración de pipelines de scikit-learn: el paquete de artefactos (`model_saya.joblib`, `scaler.joblib`, `feature_names.joblib`, `metadata.joblib`) ilustra el empaquetado completo de un modelo tabular para Hugging Face.
- Filtro previo en sistemas de fidelización: integrado como primera etapa de un sistema de scoring, descarta transacciones de bajo riesgo antes de aplicar modelos más costosos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de prueba (200 filas):

| Metrica | Valor |
|---|---|
| F1-Score (métrica principal) | 0,4948 |
| Recall (clase satisfecho = 1) | 0,6234 |
| Precision (clase satisfecho = 1) | 0,4103 |
| Accuracy | 0,5100 |
| ROC-AUC | 0,5264 |

No se han publicado comparaciones con otros modelos en la información disponible. Los valores son coherentes con una señal predictiva muy débil en el dataset de origen: un ROC-AUC de 0,5264 está apenas por encima del azar (0,5).

## Requisitos de hardware

- VRAM: no aplica; el modelo es un árbol de decisión en CPU y no requiere GPU.
- GPU recomendadas: ninguna; la inferencia se ejecuta en CPU.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,0 GB y los artefactos `joblib` son de tamaño reducido.
- Opciones de despliegue: script Python con `scikit-learn==1.6.1` y `joblib`, servicio HTTP con FastAPI o Flask, o integración en pipelines de datos con pandas. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos neuronales.
- Latencia y throughput: no publicados; por la naturaleza del modelo (árbol de profundidad 3), la inferencia por fila es del orden de microsegundos a milisegundos en CPU, aunque no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Métrica principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `pinkepinn/car-supplychain-feedback-model` | Árbol de decisión tabular | no disponible | no aplica | F1 0,4948 | no disponible | Hugging Face |
| `scikit-learn` `LogisticRegression` sobre el mismo dataset | Regresión logística tabular | no disponible | no aplica | no disponible | BSD-3-Clause (scikit-learn) | PyPI |
| `scikit-learn` `RandomForestClassifier` sobre el mismo dataset | Ensemble de árboles tabular | no disponible | no aplica | no disponible | BSD-3-Clause (scikit-learn) | PyPI |
| `XGBoost` / `LightGBM` sobre el mismo dataset | Gradient boosting tabular | no disponible | no aplica | no disponible | Apache 2.0 / MIT | PyPI |

No se dispone de resultados publicados de estos modelos alternativos sobre el mismo conjunto de prueba en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Validez limitada al dominio: el modelo solo es aplicable a transacciones con características y periodo similares a los 1.000 registros del mercado automovilístico estadounidense; generalizar a otras regiones o segmentos exige recalibración.
- Señal predictiva débil: el ROC-AUC de 0,5264 y el F1 de 0,4948 indican que el modelo apenas supera una asignación aleatoria; no debe usarse como único determinante de decisiones automatizadas sin revisión humana.
- Recall incompleto: la clase satisfecho se detecta con un recall de 0,6234 y una precisión de 0,4103, lo que implica una tasa elevada de falsos positivos y falsos negativos.
- Ausencia de la variable `ShippingDays`: se excluyó por la anomalía del 24,5 % de registros con fecha de envío anterior a la de pedido, lo que elimina la señal temporal más directamente relacionada con la satisfacción logística.
- Correlación, no causalidad: las reglas del árbol reflejan patrones correlacionales históricos, no relaciones causales; no deben interpretarse como recomendaciones operativas directas.
- Licencia no disponible: no se declara licencia en los metadatos ni en la model card, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de integrarlo en producción.
- Idioma: la model card está en indonesio y los metadatos declaran `id`, aunque los datos de entrenamiento están en inglés; esto puede generar confusión sobre el alcance real del modelo.
- Inconsistencia en la documentación: el ejemplo de código de la model card referencia el repositorio `kevinedric/car-supplychain-feedback-model`, distinto del identificador real `pinkepinn/car-supplychain-feedback-model`; debe corregirse la ruta antes de ejecutar el ejemplo.
- Dependencia de versión: requiere `scikit-learn==1.6.1` para cargar correctamente los artefactos `joblib`; versiones distintas pueden romper la deserialización.
- Riesgo de sesgo: el dataset original puede contener sesgos de muestreo por marca, género o tipo de tarjeta de crédito; no se documenta ningún análisis de equidad.

## Enlaces

- Hugging Face: https://huggingface.co/pinkepinn/car-supplychain-feedback-model
- Dataset de origen (Kaggle): https://www.kaggle.com/datasets/prashantk93/supply-chain-management-for-car
- Documentación de scikit-learn (`DecisionTreeClassifier`): https://scikit-learn.org/stable/modules/generated/sklearn.tree.DecisionTreeClassifier.html
- Documentación de `joblib`: https://joblib.readthedocs.io/
