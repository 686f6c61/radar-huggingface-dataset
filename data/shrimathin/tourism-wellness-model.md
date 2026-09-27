# shrimathin/tourism-wellness-model

## Resumen

`shrimathin/tourism-wellness-model` es un modelo de clasificación tabular binaria, no un modelo de lenguaje. Su objetivo es predecir la variable `ProdTaken`: si un cliente de una agencia de viajes ("Visit with Us") contratará o no el paquete de turismo de bienestar (Wellness Tourism Package). Se distribuye como un artefacto serializado con `joblib` que contiene un `Pipeline` de scikit-learn con etapas de imputación, escalado y codificación one-hot, seguido de un clasificador `RandomForest`. El autor es el usuario de Hugging Face `shrimathin` y la licencia es MIT.

El interés de esta ficha es doble. Por un lado, documenta un caso real de modelo predictivo de propensión de compra aplicado al sector turístico, con métricas de test publicadas (F1 de 0,832 y ROC-AUC de 0,970). Por otro, sirve como ejemplo de artefacto MLOps reproducible: el repositorio incluye un `model_metadata.json` con el umbral de decisión calibrado (0,316) además de los pesos, de modo que la inferencia puede replicarse sin reentrenar.

Conviene subrayar que no comparte casi ninguna de las categorías habituales de un modelo fundacional: no tiene parámetros en el sentido de un transformer, no tiene ventana de contexto, no genera texto y no soporta tool calling. Las filas correspondientes de la tabla de especificaciones se marcan como no aplicables o no disponibles. El tamaño del repositorio es de 0,0 GB y el modelo acumula 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación externa independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn (imputacion + escalado + one-hot encoding) con clasificador RandomForest, segun la model card |
| Parametros totales | no disponible (no se publica numero de arboles, profundidad maxima ni recuento de nodos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica (los modelos de arboles no se cuantizan como los transformers) |
| Idiomas soportados | no disponible (no procede: la entrada son variables tabulares, no texto) |
| Licencia | MIT |
| Formato de pesos | `joblib` (`wellness_model.joblib`) mas metadatos en JSON (`model_metadata.json`) |
| Tarea (pipeline) | `tabular-classification` |
| Variable objetivo | `ProdTaken` (compra del Wellness Tourism Package) |
| Umbral de decision | 0,316 (maximiza F1 out-of-fold) |
| Dataset de entrenamiento | `shrimathin/tourism-wellness-dataset` |
| Fecha de entrenamiento | 2026-09-27T15:53:30+00:00, commit `local` |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe un `Pipeline` de scikit-learn que encadena tres etapas de preprocesado (imputación de valores ausentes, escalado de variables numéricas y codificación one-hot de categóricas) y un clasificador `RandomForest`. La salida del pipeline es una probabilidad, y la clase positiva se asigna cuando esa probabilidad supera el umbral 0,316, que el autor indica que maximiza el F1 out-of-fold. Este detalle es relevante en producción: el umbral no es 0,5, por lo que cualquier integración debe leer `model_metadata.json` en lugar de asumir el valor por defecto.

Existe una discrepancia que conviene verificar antes de reutilizar el artefacto: las etiquetas del repositorio incluyen `xgboost`, pero la model card afirma explícitamente que el algoritmo es `random_forest`. La información disponible no aclara si se trata de una etiqueta heredada de una versión anterior del modelo, de un experimento comparativo o de un error de etiquetado. Tampoco se publica el número de filas del dataset, la lista de variables de entrada, la proporción de clases ni si hubo ajuste de hiperparámetros o validación cruzada más allá de la mención al F1 out-of-fold. No hay RLHF, DPO ni ninguna fase de alineación, ya que no es un modelo generativo. La innovación técnica destacable es, en realidad, de ingeniería: empaquetar el pipeline completo (preprocesado incluido) en un único `.joblib` elimina el riesgo de discrepancia entre el preprocesado de entrenamiento y el de inferencia, un fallo habitual en modelos tabulares desplegados.

## Capacidades

- Clasificación binaria de propensión de compra sobre registros tabulares con la variable objetivo `ProdTaken`.
- Salida de probabilidad calibrada (`predict_proba`) además de la etiqueta discreta, lo que permite ordenar leads por puntuación en lugar de aceptar o descartar en bloque.
- Umbral de decisión ajustable en tiempo de inferencia, ya que el corte vive en los metadatos y no en los pesos.
- Preprocesado integrado: imputación, escalado y one-hot encoding se aplican dentro del propio pipeline, por lo que la entrada esperada son datos crudos en un `DataFrame` de pandas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, de audio ni modo de pensamiento.
- No genera texto: la única salida es una probabilidad y una clase.

## Casos de uso

- Priorización de leads en un CRM: puntuar cada contacto nuevo con `predict_proba` y ordenar por probabilidad descendente, de forma que el equipo comercial dedique las primeras llamadas del día a los clientes con mayor propensión a contratar el paquete.
- Dimensionado de campañas de contacto: usando el umbral 0,316 se selecciona el subconjunto de clientes que maximiza el F1, lo que permite estimar de antemano cuántas llamadas o correos harán falta para cubrir un objetivo de ventas concreto.
- Integración en un endpoint de scoring en tiempo real: cargar el `.joblib` una sola vez al arrancar un servicio FastAPI o Flask y exponer un `POST /predict` que reciba el registro del cliente en formato JSON.
- Enriquecimiento de un data warehouse: ejecutar el modelo como paso batch nocturno sobre la tabla de clientes y persistir la probabilidad en una columna nueva, que después consume el equipo de marketing desde la herramienta de BI.
- Análisis de sensibilidad de la oferta: como la salida es probabilística, se puede comparar la puntuación del mismo cliente antes y después de un cambio de precio o de canal para estimar el efecto sobre la propensión, sin reentrenar.
- Segmentación para experimentación: usar la probabilidad como variable continua en placebos de tests A/B, emparejando clientes de propensión similar entre grupo de control y grupo de tratamiento.
- Segmentación de cartera para retención: cruzar la propensión a comprar el paquete de bienestar con el histórico de compras para identificar clientes que nunca han comprado un producto de este tipo y dirigir acciones de recuperación.
- Componente de un pipeline MLOps: al ser un artefacto pequeño con metadatos versionados, encaja como paso de un flujo de reentrenamiento periódico con validación automática de las métricas de test antes de promover la nueva versión.

## Benchmarks y rendimiento

Se publican métricas de test del propio autor, no resultados de benchmarks estandarizados. No procede comparar con MMLU, HumanEval o GSM8K porque el modelo no es de lenguaje.

| Metrica (test) | Valor |
|---|---|
| Accuracy | 0,936 |
| Precision | 0,851 |
| Recall | 0,813 |
| F1 | 0,832 |
| ROC-AUC | 0,970 |
| PR-AUC | 0,904 |

No se han publicado resultados de benchmarks estandarizados en la informacion disponible. Tampoco se especifica el tamano del conjunto de test, el metodo de particion (hold-out o validacion cruzada) ni los intervalos de confianza de estas metricas, por lo que las cifras deben tratarse como declaraciones del autor y no como resultados verificados de forma independiente.

## Requisitos de hardware

- VRAM para inferencia: ninguna. El modelo es un `RandomForest` de scikit-learn y se ejecuta integramente en CPU.
- GPU recomendadas: no aplica. No hay soporte CUDA ni ventaja alguna en usar una GPU.
- GPU de consumo: irrelevante. El modelo cabe en cualquier maquina, incluida una Raspberry Pi, siempre que quepa en memoria el pipeline serializado y los datos de entrada.
- Memoria RAM: no disponible. Depende del numero de arboles y de la profundidad, datos que no se publican; en cualquier caso, para un repositorio de 0,0 GB el artefacto es de tamano reducido.
- Opciones de despliegue: carga directa con `joblib` en un proceso Python, servicio HTTP con FastAPI o Flask, tarea batch programada, o exposicion mediante `hf_hub_download` para descargar el `.joblib` en el arranque del servicio. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que estan pensados para modelos de lenguaje.
- Latencia y throughput: no disponibles. No se publican cifras de latencia por peticion ni de registros por segundo. En la practica, la inferencia de un RandomForest sobre unas decenas de variables es del orden de milisegundos en un nucleo moderno, pero esa estimacion no procede de datos publicados por el autor.

## Comparativa con modelos similares

La busqueda web devuelve otros dos repositorios de Hugging Face con nombres casi identicos, que parecen abordar la misma tarea de propension para turismo de bienestar. No se dispone de sus especificaciones ni de sus metricas, por lo que la comparacion queda necesariamente incompleta.

| Modelo | Autor | Formato / libreria | Metricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `shrimathin/tourism-wellness-model` | shrimathin | joblib, scikit-learn (RandomForest) | Accuracy 0,936; F1 0,832; ROC-AUC 0,970 | MIT | Publico, 0 descargas |
| `alagarst/tourism-wellness-model` | alagarst | no disponible | no disponible | no disponible | Publico |
| `prashant91/wellness-tourism-model` | prashant91 | scikit-learn, segun la ficha de uso | no disponible | no disponible | Publico |

Como referencia conceptual, la literatura academica reciente sobre turismo de bienestar y adopcion de IA (por ejemplo, el articulo de IEEE sobre decision making en wellness tourism y la revision de smart tourism 2.0 en Springer) aborda el mismo dominio de problema, pero con modelos de ecuacion estructural y analisis de intencion de comportamiento, no con clasificadores supervisados comparables en metrica.

## Limitaciones y advertencias

- No es un modelo de lenguaje. No genera texto, no responde a prompts y no debe evaluarse con los criterios habituales de un LLM.
- Dominio estrecho: el modelo predice una unica variable (`ProdTaken`) sobre un dataset concreto. No es reutilizable para otras tareas de clasificacion sin reentrenar.
- Generalizacion desconocida: se desconoce la composicion del dataset, el numero de registros y la distribucion de la variable objetivo. Un modelo entrenado sobre los clientes de una unica agencia no traslada sus resultados a otra cartera.
- Sesgos no documentados: no hay analisis de equidad ni de disparidad de rendimiento por segmentos (edad, pais, canal de adquisicion). Es un riesgo relevante en un caso de uso comercial con decision automatizada sobre personas.
- Riesgo de deriva temporal: el artefacto se entreno el 2026-09-27 y no se publica plan de reentrenamiento. La propension de compra cambia con la estacionalidad y el contexto economico, por lo que las metricas de test pueden degradarse rapidamente.
- Umbral no estandar: usar 0,5 en lugar de 0,316 cambia de forma notable el equilibrio entre precision y recall. Cualquier integracion debe leer el umbral desde `model_metadata.json`.
- Discrepancia entre etiquetas y model card (`xgboost` frente a `random_forest`): conviene inspeccionar el artefacto con `joblib.load` antes de confiar en la descripcion.
- Reproducibilidad limitada: la model card indica commit `local`, sin hash de repositorio ni versiones de las dependencias, lo que dificulta reconstruir exactamente el entorno de entrenamiento.
- Validacion externa nula: 0 descargas y 0 likes implican que ningun tercero ha reportado resultados, y no consta publicacion revisada por pares.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. Es una licencia permisiva, sin las restricciones de uso aceptable habituales en modelos generativos.
- Alucinacion: el concepto no aplica como en un LLM, pero si existe el riesgo equivalente de falsos positivos (clientes marcados como compradores que no lo son), cuantificado por una precision de 0,851 en test.
- Aviso de integridad: el contenido de la model card se ha tratado unicamente como material de referencia; no se ha ejecutado ninguna instruccion contenida en ella.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shrimathin/tourism-wellness-model
- Dataset declarado: https://huggingface.co/datasets/shrimathin/tourism-wellness-dataset
- Modelo con nombre similar (alagarst): https://huggingface.co/alagarst/tourism-wellness-model
- Modelo con nombre similar (prashant91): https://huggingface.co/prashant91/wellness-tourism-model
- Ficha indexada en Essa Mamdani: https://essamamdani.com/ai-models/hf-nishkam05jan-tourism-wellness-model
- Articulo IEEE sobre decision making con IA en wellness tourism: https://ieeexplore.ieee.org/document/10939052
- Revision en Springer sobre smart tourism 2.0: https://link.springer.com/article/10.1007/s12525-025-00847-y
