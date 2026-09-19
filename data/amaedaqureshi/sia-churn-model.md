# amaedaqureshi/sia-churn-model

## Resumen

El modelo `amaedaqureshi/sia-churn-model` es un clasificador XGBoost entrenado para predecir el riesgo de abandono (churn) de suscriptores dentro del denominado SIA Retention Engine. No se trata de un modelo de lenguaje ni de una red neuronal profunda, sino de un modelo tabular de gradiente boosting orientado a una tarea de clasificación binaria o de scoring de riesgo sobre datos estructurados. Lo publica el usuario `amaedaqureshi` en HuggingFace con licencia CC-BY-4.0 y pipeline declarado `tabular-classification`.

El modelo se entrena sobre el dataset de la Fase 1 del SIA Retention Engine, que segun la model card combina datos reales de churn de Telco (IBM/Kaggle) mapeados al esquema `Subscriber` de SIA, junto con datos cuyo caracter real o sintetico se detalla en el repositorio del dataset. Su proposito declarado es sustituir una formula heuristica escrita a mano (`backend/data_generator.py`) dentro del agente Monitor de SIA, activandose mediante el flag `USE_ML_MODEL` en `config/settings.py` y con una ruta de fallback a la formula original definida en `backend/models/loader.py`.

La relevancia de esta ficha es acotada: es un modelo de produccion interno de un sistema concreto, con muy poca traccion publica (0 descargas, 1 like en el momento de la consulta) y sin datos de benchmarks publicados en la informacion disponible. Sirve como ejemplo de integracion de un clasificador tabular en un pipeline de retencion, pero no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XGBoost (gradient boosted decision trees) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular) |
| Tipos de cuantizacion | no aplica / no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | joblib (`model.joblib`) mas `feature_columns.json` |

## Arquitectura y entrenamiento

La arquitectura es XGBoost, un algoritmo de boosting de arboles de decision sobre datos tabulares. No hay informacion publica sobre el numero de arboles, profundidad maxima, tasa de aprendizaje, funcion objetivo ni hiperparametros de regularizacion empleados. Tampoco se especifica el numero de parametros efectivos del ensemble ni la dimension del espacio de features mas alla de las columnas citadas en la model card.

En cuanto a los datos, la model card indica que el entrenamiento se realizo sobre el dataset de la Fase 1 del SIA Retention Engine, construido a partir de datos reales de churn de Telco (IBM/Kaggle) mapeados al esquema `Subscriber`. El repositorio del dataset es la referencia indicada para distinguir que porcion es real y que porcion es sintetica, pero esa informacion no se detalla en la model card. No se menciona uso de RLHF, DPO ni tecnicas equivalentes, que no aplican a un clasificador tabular. Como innovacion tecnica destacable, la model card subraya la comparacion directa de ROC-AUC frente a la formula heuristica original, medida sobre el mismo split de test, lo que permite justificar empiricamente la sustitucion del metodo previo.

## Capacidades

- Clasificacion tabular para scoring de riesgo de churn sobre suscriptores.
- Prediccion basada en features de plan, gasto y uso: `plan_Flexi`, `plan_Premium`, `avg_monthly_spend`, `data_usage_gb` y `signal_strength_score` figuran entre las de mayor peso segun el valor medio de |SHAP| en el split de test.
- Integracion como componente de decision dentro del agente Monitor del SIA Retention Engine.
- Activacion condicional mediante el flag `USE_ML_MODEL`, con fallback a la formula heuristica original cuando el modelo no esta cargado.
- No soporta generacion de texto, tool calling, funcionamiento como agente conversacional, vision, audio ni capacidades multilingues; son funciones fuera del alcance de un clasificador tabular.

## Casos de uso

- Scoring de riesgo de churn en telefonia: el modelo puntua a cada suscriptor con una probabilidad de abandono basada en su plan, gasto medio y uso de datos, lo que permite priorizar acciones de retencion.
- Enrutado de campañas de retencion: las puntuaciones se pueden usar para segmentar la base de clientes y decidir a que segmentos dirigir descuentos o cambios de plan.
- Sustitucion de heuristicas manuales en produccion: al integrarse tras el flag `USE_ML_MODEL`, permite reemplazar la formula de `data_generator.py` manteniendo un fallback seguro.
- Analisis de factores de riesgo por plan: dado el peso elevado de `plan_Flexi` y `plan_Premium`, el modelo permite identificar que planes concentran mayor riesgo y orientar decisiones de producto.
- Monitorizacion continua de cartera: integrado en el agente Monitor, sirve para recalcular el riesgo de la base de suscriptores de forma periodica y detectar cambios de tendencia.
- Sistema de alertas tempranas: las predicciones pueden alimentar alertas internas cuando el riesgo agregado de un segmento supera un umbral definido por el equipo de retencion.
- Evaluacion comparativa de estrategias: al disponer de una comparacion ROC-AUC frente a la formula original, sirve como referencia interna para medir si nuevas iteraciones del modelo mejoran la linea base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un archivo `metrics.json` en el propio repositorio, que contendria el desglose de metricas de train, validacion y test, incluida una comparacion directa de ROC-AUC frente a la formula heuristica original (`backend/data_generator.py`) medida sobre el mismo split de test. Los valores numericos concretos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo XGBoost en formato joblib, la inferencia es tipicamente en CPU y no requiere GPU.
- GPU recomendadas: no procede para este tipo de modelo; no es una carga de trabajo de GPU.
- Compatibilidad con GPU de consumo: no aplica, ya que el modelo no esta disenado para ejecucion en GPU.
- RAM estimada: no disponible. El tamano del repositorio figura como 0.0 GB, dato que no permite estimar con fiabilidad el consumo en memoria del clasificador cargado.
- Opciones de despliegue: carga mediante `joblib.load` en un entorno Python; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos tabulares XGBoost.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas concretas en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. Como alternativas genericas de la misma categoria (clasificacion tabular para churn) podrian considerarse LightGBM, CatBoost o una regresion logistica, pero no se aportan cifras comparativas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sia-churn-model | no disponible | no aplica | no publicado (ver `metrics.json`) | CC-BY-4.0 | HuggingFace |
| Alternativas tabulares (LightGBM, CatBoost, regresion logistica) | no disponible | no aplica | no disponible | segun implementacion | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada. Al derivar de datos reales de churn de Telco, podria heredar sesgos presentes en ese dataset, pero no se documentan.
- Riesgo de alucinacion: no aplica, ya que no es un modelo generativo de lenguaje.
- Limitaciones de contexto o idioma: no aplica en terminos de contexto; el modelo opera sobre columnas tabulares concretas y depende del orden y los nombres exactos definidos en `feature_columns.json`.
- Trazabilidad del dato: la propia model card reconoce una mezcla de datos reales y sinteticos cuyo detalle exacto se delega al repositorio del dataset, lo que limita la auditabilidad directa desde esta ficha.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial y modificacion con atribucion; conviene verificar el cumplimiento de la atribucion en el despliegue.
- Fiabilidad en produccion: depende de la carga del archivo `model.joblib` y del correcto funcionamiento del flag `USE_ML_MODEL`; si el modelo no se carga, el sistema recurre a la formula heuristica original, lo que puede provocar diferencias de comportamiento entre entornos.
- Adopcion y validacion externa: con 0 descargas y 1 like, no hay evidencia publica de uso o validacion por terceros.
- Ausencia de benchmarks publicados: impide comparar el rendimiento con alternativas sin acceder a `metrics.json` u otros artefactos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amaedaqureshi/sia-churn-model
- Repositorio del dataset del SIA Retention Engine (Fase 1): mencionado en la model card, sin URL explicita disponible
- Archivo de metricas: `metrics.json` en el repositorio del modelo
- Archivos del modelo: `model.joblib`, `feature_columns.json`
- Referencias internas citadas: `backend/data_generator.py`, `backend/models/loader.py`, `config/settings.py`
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la busqueda web proporcionada.
