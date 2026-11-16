# luluuuuu13/prediksi-resign-karyawan

## Resumen

`luluuuuu13/prediksi-resign-karyawan` es un modelo de clasificación tabular binaria entrenado con scikit-learn para predecir el riesgo de renuncia (attrition) de empleados. Lo publica el usuario `luluuuuu13` en Hugging Face y está pensado como herramienta de apoyo para equipos de recursos humanos que quieran priorizar intervenciones de retención. No es un modelo de lenguaje: es un artefacto serializado en formato `joblib` que contiene un `DecisionTreeClassifier` optimizado mediante `GridSearchCV`.

El modelo se entrena sobre el dataset público IBM HR Analytics Employee Attrition & Performance (1.470 filas, 35 columnas originales), del que se derivan 44 features tras eliminar columnas constantes y aplicar one-hot encoding. La tarea es clasificación binaria: clase `1` indica que el empleado renuncia y clase `0` que permanece. La distribución está fuertemente desbalanceada (83,9% clase negativa frente a 16,1% positiva), lo que condiciona las métricas y el diseño de la evaluación.

Su relevancia es acotada y de nicho: sirve como ejemplo didáctico de pipeline de clasificación tabular con scikit-learn y como prueba de concepto para scoring de attrition, pero sus métricas (F1 de 0,4286, ROC-AUC de 0,6956 sobre 294 muestras de test) indican un poder discriminativo limitado para uso en producción sin validación adicional. El repositorio ocupa 0,0 GB, no tiene descargas ni likes, y la licencia no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Arbol de decision (`DecisionTreeClassifier` de scikit-learn) optimizado con `GridSearchCV` |
| Parametros totales | No disponible (modelo no neuronal; el numero de nodos y hojas del arbol no se publica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | No aplica (serializacion `joblib`; requiere `scikit-learn==1.6.1`) |
| Idiomas soportados | `id` (indonesio) segun metadatos; las features son mayoritariamente categoricas en ingles (`BusinessTravel`, `Department`, etc.) |
| Licencia | No disponible |
| Formato de pesos | `joblib` (`model_saya.joblib`, `feature_names.joblib`, `metadata.joblib`) |

## Arquitectura y entrenamiento

El modelo es un `DecisionTreeClassifier` de scikit-learn, un arbol de decision CART con criterio de impureza no especificado en la model card, ajustado mediante busqueda en rejilla con validacion cruzada (`GridSearchCV`). No hay informacion sobre la rejilla de hiperparametros explorada, la profundidad maxima final, el criterio de splitting, el numero de folds ni la semilla aleatoria empleada. Tampoco se detalla si se aplico balanceo de clases (por ejemplo `class_weight='balanced'`) pese al fuerte desbalanceo del target.

El entrenamiento se realiza sobre el dataset IBM HR Analytics Employee Attrition & Performance, disponible en Kaggle, con 1.470 filas y 35 columnas originales. Tras eliminar columnas constantes y aplicar one-hot encoding sobre las 7 variables categoricas, el espacio de entrada queda en 44 features, de las cuales 30 son las features "principales" descritas en la model card (23 numericas y 7 categoricas). La evaluacion se hace sobre un 20% de los datos (294 muestras) reservado como test set. No se menciona uso de RLHF, DPO ni tecnicas de calibracion; es un pipeline clasico de ML supervisado sin componentes neuronales.

## Capacidades

- Clasificacion binaria tabular: predice probabilidad de renuncia (`predict_proba`) y etiqueta (`predict`) a partir de 30 features de empleado.
- Scoring individual: el ejemplo de la model card procesa un unico registro construyendo un `DataFrame` de una fila con las 44 columnas esperadas.
- Interpretabilidad estructural: al ser un arbol de decision, permite inspeccionar reglas de decision y feature importances (aunque no se publican en la model card).
- Integracion con pipelines de RRHH: la API `joblib.load` + `predict_proba` facilita su uso en scripts de scoring batch.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- Capacidad multilingue limitada al idioma de los datos de entrenamiento (valores categoricos en ingles, metadatos en indonesio).
- No dispone de modo "thinking" ni de ninguna capacidad generativa.

## Casos de uso

- Priorizacion de intervenciones de retencion en RRHH: dado un empleado con sus 30 features (satisfaccion laboral, años en la empresa, horas extra, ingresos mensuales, etc.), el modelo devuelve una probabilidad de renuncia que permite ordenar la plantilla por riesgo y dirigir acciones de retencion a los casos con mayor score.
- Analisis exploratorio de factores de attrition: al ser un arbol de decision, se puede recorrer para extraer reglas del tipo "si `OverTime=Yes` y `YearsAtCompany<2` entonces alto riesgo", util para informes internos de People Analytics.
- Prueba de concepto en pipelines de datos de RRHH: sirve como baseline rapido para validar la infraestructura de scoring (carga de `joblib`, construccion de features, salida de probabilidades) antes de invertir en modelos mas complejos.
- Docencia y ejemplos de clasificacion tabular: el repo incluye un ejemplo completo de preprocesado (one-hot encoding manual, alineacion de columnas) reutilizable en cursos de scikit-learn.
- Simulacion de escenarios what-if: modificando features como `StockOptionLevel`, `JobSatisfaction` o `OverTime` sobre un mismo registro se puede observar como varia la probabilidad predicha, util para discutir politicas de compensacion o flexibilidad.
- Prototipo de alertas tempranas en dashboards de HR: integrado en un job programado que puntue semanalmente a la plantilla y marque a los empleados por encima de un umbral de probabilidad, como senal para revision humana (no como decision automatica).

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el test set (294 muestras, 20% del dataset):

| Metrica | Valor |
|---|---|
| F1-Score | 0,4286 |
| Recall | 0,6383 |
| Precision | 0,3226 |
| Accuracy | 0,7279 |
| ROC-AUC | 0,6956 |

No se han publicado comparaciones con otros modelos (regresion logistica, random forest, gradient boosting) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; es un modelo tabular serializado en `joblib`, se ejecuta en CPU.
- GPU: no necesaria. Cualquier CPU moderna es suficiente para inferencia en milisegundos por registro.
- Memoria RAM: el artefacto ocupa 0,0 GB segun el repositorio; el consumo en ejecucion depende de pandas y scikit-learn, del orden de decenas o cientos de MB.
- Cabe en cualquier portatil consumer; no requiere aceleracion por hardware.
- Opciones de despliegue: script Python con `joblib.load` + `scikit-learn==1.6.1`, endpoint FastAPI/Flask envolviendo `predict_proba`, o job batch programado. No aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos neuronales.
- Latencia y throughput: no publicados; por la naturaleza del modelo se espera latencia sub-milisegundo por registro en CPU, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No disponible. La model card no incluye comparaciones con otros modelos de attrition ni con alternativas de clasificacion tabular (regresion logistica, Random Forest, XGBoost, LightGBM) sobre el mismo dataset. Tampoco se han encontrado en la informacion proporcionada referencias a otros modelos publicados por el mismo autor.

## Limitaciones y advertencias

- Metricas modestas: F1 de 0,4286 y precision de 0,3226 implican una tasa alta de falsos positivos; no es apto para decisiones automaticas de RRHH sin revision humana.
- ROC-AUC de 0,6956: capacidad discriminativa por debajo de lo que se suele exigir en produccion (habitualmente >= 0,8).
- Dataset pequeno y estatico (1.470 filas, IBM HR Analytics): riesgo de sobreajuste y de escasa generalizacion a otras organizaciones o sectores.
- Desbalanceo de clases (16,1% positivos) no abordado explicitamente en la model card; el umbral de decision por defecto (0,5) puede no ser el adecuado.
- Licencia no especificada: no hay autorizacion explicita para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Dependencia estricta de `scikit-learn==1.6.1`: otras versiones pueden fallar al deserializar el `joblib`.
- Preprocesado manual y fragil: el ejemplo requiere construir a mano un `DataFrame` de 44 columnas y activar los dummies correctos; no se incluye un `Pipeline` de scikit-learn que encapsule el one-hot encoding.
- Riesgo de sesgo: features como `Gender`, `MaritalStatus` o `Age` pueden inducir discriminacion si el modelo se usa para decisiones laborales; no se documenta ningun analisis de fairness.
- Idiomas: los metadatos declaran `id`, pero las categorias de features estan en ingles; no hay soporte para valores en otros idiomas.
- Sin informacion sobre calibracion de probabilidades; `predict_proba` de un arbol de decision suele estar mal calibrado.
- Repositorio sin descargas ni likes y creado/actualizado en 2026-11-16: sin senales de mantenimiento ni comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/luluuuuu13/prediksi-resign-karyawan
- Dataset IBM HR Analytics Employee Attrition & Performance (Kaggle): https://www.kaggle.com/datasets/pavansubhasht/ibm-hr-analytics-attrition-dataset
