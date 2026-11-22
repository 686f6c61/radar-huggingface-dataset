# Lidya17/customer-segment-model

## Resumen

El modelo `Lidya17/customer-segment-model` es un clasificador tabular multiklase entrenado con scikit-learn que predice el segmento de cliente (`Consumer`, `Premium`, `VIP`, `Business`) a partir de un perfil de cliente de comercio electronico. Lo desarrolla el usuario Lidya17 en el contexto de un proyecto de la asignatura Business Data Science (MN1135) del programa de Management, y se publica en Hugging Face como demostracion de un flujo de despliegue completo (pesos, scaler, lista de features, metadatos y una app Gradio).

Se trata de un arbol de decision (Decision Tree) clasico, no de un modelo de lenguaje ni de una red neuronal: no tiene arquitectura transformer, no maneja contexto textual ni genera texto. Trabaja sobre 8 variables de entrada (edad, genero, ciudad, estado, pais, region, codigo postal y coste de adquisicion) que, tras One-Hot Encoding, se expanden a 15.606 columnas. El dataset de origen tiene 25.000 filas.

El propio autor advierte con honestidad en la model card de que la capacidad predictiva es practicamente nula: el F1 macro en test es 0,2471, practicamente identico al de una asignacion aleatoria proporcional a las clases, y por debajo del 0,5456 de accuracy que se obtendria prediciendo siempre la clase mayoritaria. Por tanto, el interes del artefacto es metodologico y de infraestructura (empaquetado con joblib, versionado de scikit-learn, demo Gradio), no analitico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Arbol de decision (scikit-learn `DecisionTreeClassifier`), clasificacion tabular multiklase |
| Parametros totales | no disponible (no es un modelo neuronal; el arbol no se caracteriza por numero de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantizacion | no aplica; los pesos se serializan con `joblib` (sin cuantizacion) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; las etiquetas de clase estan en ingles) |
| Licencia | MIT |
| Formato de pesos | `.joblib` (`model_segmen.joblib`, `scaler.joblib`, `feature_names.joblib`, `metadata.joblib`) |
| Libreria | scikit-learn 1.6.1 (version fijada) |
| Tamano del repositorio | 0,0 GB (artefactos ligeros) |
| Tarea (pipeline) | `tabular-classification` |
| Numero de clases | 4 (`Consumer` 54,5 %, `Premium` 25,2 %, `VIP` 10,2 %, `Business` 10,1 %) |
| Features de entrada | 8 originales; 15.606 columnas tras One-Hot Encoding con `drop_first=True` |
| Filas de entrenamiento | 25.000 (80 % train, 20 % test = 5.000 filas) |
| Metricas en test | F1 macro 0,2471; precision macro 0,2472; recall macro 0,2471; accuracy 0,3716 |

## Arquitectura y entrenamiento

El modelo es un `DecisionTreeClassifier` de scikit-learn, serializado con `joblib` junto a un `StandardScaler` ajustado sobre `customer_age` y `customer_acquisition_cost`. El preprocesamiento incluye One-Hot Encoding de las variables categoricas (`gender`, `customer_city`, `customer_state`, `customer_country`, `region`) con `drop_first=True`; el orden exacto de las columnas resultantes se persiste en `feature_names.joblib` para garantizar la coherencia entre entrenamiento e inferencia. Los metadatos (`metadata.joblib`) recogen tipos de columna, version de scikit-learn, hiperparametros, etiquetas de clase y metricas.

El dataset de origen es el *E-commerce Sales Analytics Dataset* (`customer_master.csv`) publicado en Kaggle por `datascikhan`, con 25.000 filas y 8 features. No se documenta en la model card el numero de tokens (no aplica), la composicion detallada del dataset, ni procesos de RLHF, DPO o ajuste fino: es un entrenamiento supervisado clasico sobre una unica particion train/test. No se mencionan tecnicas como validacion cruzada, regularizacion por poda, calibracion de probabilidades ni decodificacion especulativa. La innovacion tecnica destacable es, mas bien, la transparencia: el autor documenta explicitamente el caracter casi aleatorio del modelo y publica la comparacion contra baselines triviales.

## Capacidades

- Clasificacion tabular multiklase en 4 categorias de segmento de cliente (`Consumer`, `Premium`, `VIP`, `Business`).
- Prediccion a partir de 8 variables de perfil (edad, genero, ciudad, estado, pais, region, codigo postal, coste de adquisicion).
- Preprocesamiento reproducible: scaler y lista de features persistidos para replicar exactamente el pipeline de entrenamiento.
- Aplicacion Gradio (`app.py`) para inferencia interactiva desde el navegador con valores crudos.
- Gestion de categorias no vistas: las categorias desconocidas (por ejemplo, una ciudad nueva) se codifican como 0 en todas las columnas correspondientes.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- No tiene capacidades multilingues: no procesa lenguaje natural.

## Casos de uso

- Docencia y formacion en despliegue de modelos: sirve como ejemplo completo y reproducible de empaquetado de un modelo scikit-learn con `joblib`, scaler, lista de features y metadatos, util para ensenar el ciclo completo desde el notebook hasta una demo Gradio.
- Prueba de infraestructura de serving tabular: permite validar pipelines de inferencia (carga de artefactos, versionado de scikit-learn 1.6.1, validacion de esquema de columnas) antes de sustituir el modelo por uno con capacidad predictiva real.
- Plantilla de proyecto academico: el repositorio incluye `requirements.txt` con version fijada y un `app.py` funcional, lo que lo convierte en una base reutilizable para trabajos de asignatura con requisitos de reproducibilidad.
- Baseline negativo de referencia: sus metricas (F1 macro 0,2471 frente a ~0,25 del azar proporcional) sirven como cota inferior contra la que comparar modelos de segmentacion mas serios en el mismo dataset.
- Demostracion de honestidad metodologica: la model card documenta explicitamente las limitaciones y los baselines triviales, lo que lo hace util como ejemplo de buena practica de documentacion en formacion de cientificos de datos.
- Prueba de pipelines de categorias de alta cardinalidad: con 15.555 ciudades unicas sobre 25.000 filas, el artefacto permite experimentar con estrategias de codificacion (One-Hot, target encoding, hashing) y medir su impacto, aunque el modelo publicado no las implemente.
- No es adecuado para produccion real: el propio autor desaconseja su uso para decidir precios, promociones o tratamientos sobre clientes reales.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test (5.000 filas, 20 % del dataset):

| Metrica | Modelo | Baseline (clase mayoritaria) | Baseline (azar proporcional) |
|---|---|---|---|
| F1 macro | 0,2471 | no disponible | ~0,25 |
| Precision macro | 0,2472 | no disponible | no disponible |
| Recall macro | 0,2471 | no disponible | no disponible |
| Accuracy | 0,3716 | 0,5456 | no disponible |

El modelo no supera al baseline trivial de predecir siempre `Consumer` en accuracy, y su F1 macro es practicamente identico al de una asignacion aleatoria proporcional a las clases. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) porque no aplican a un modelo tabular de este tipo.

## Requisitos de hardware

- VRAM: no aplica; el modelo es un arbol de decision serializado en `joblib` que se ejecuta en CPU.
- GPU: no necesaria; cualquier CPU moderna es suficiente. No se requiere A100, H100 ni RTX 4090.
- Memoria RAM: el repositorio ocupa 0,0 GB y el arbol con 15.606 columnas de entrada es ligero; el consumo dependera del tamano del lote a inferir.
- Cabe en cualquier equipo de consumo, incluidos portatiles de gama baja y entornos gratuitos de Hugging Face Spaces.
- Opciones de despliegue: ejecucion directa con Python y scikit-learn 1.6.1 (`pip install -r requirements.txt`), app Gradio incluida (`python app.py`), o integracion como paso de un pipeline mayor. No requiere vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un arbol de decision, la inferencia por muestra es del orden de microsegundos a milisegundos, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Lidya17/customer-segment-model | Arbol de decision tabular | no disponible | no aplica | F1 macro 0,2471 | MIT | Hugging Face |
| Alternativas de segmentacion tabular (p. ej., XGBoost, LightGBM, Random Forest sobre el mismo dataset) | Ensemble de arboles | no disponible | no aplica | no disponible | segun implementacion | ampliamente disponibles |
| Modelos de segmentacion basados en datos transaccionales (RFM + clustering) | Heuristico / no supervisado | no aplica | no aplica | no disponible | variable | variable |

No se dispone de resultados comparativos publicados con alternativas sobre el mismo dataset en la informacion proporcionada. Cualquier comparacion cuantitativa con XGBoost, LightGBM o Random Forest requeriria reentrenar sobre `customer_master.csv` y evaluar con la misma particion, algo que la model card no documenta.

## Limitaciones y advertencias

- Capacidad predictiva practicamente nula: F1 macro 0,2471 frente a ~0,25 del azar proporcional; accuracy 0,3716 frente a 0,5456 del baseline de clase mayoritaria.
- Las features disponibles (edad, coste de adquisicion, genero, localizacion) no discriminan entre segmentos; las medias de edad y coste de adquisicion son casi identicas en las cuatro clases.
- Las clases minoritarias (`VIP` y `Business`) tienen recall muy bajo y practicamente no se detectan.
- Alta cardinalidad de `customer_city` (15.555 ciudades para 25.000 filas): la mayoria aparece 1-2 veces, lo que favorece la memorizacion sobre la generalizacion.
- Ausencia de datos transaccionales (frecuencia de compra, valor de gasto, categoria de producto), que son la base real de una segmentacion de clientes.
- Entrenado sobre un unico dataset y un unico periodo; no se ha validado en datos de otras fuentes o momentos temporales.
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos, pero si existe riesgo de predicciones sin fundamento estadistico que podrian interpretarse erroneamente como senal.
- Sesgos: no documentados explicitamente, pero la codificacion de categorias no vistas como vectores de ceros puede introducir sesgos sistematicos contra ciudades, paises o generos poco representados.
- Restricciones de licencia: MIT permite uso comercial, pero el autor desaconseja explicitamente su uso para determinar precios, promociones o tratamientos sobre clientes reales.
- Dependencia estricta de scikit-learn 1.6.1: cargar el modelo con otra version puede producir `InconsistentVersionWarning` y comportamiento impredecible.
- No apto para produccion: debe tratarse como artefacto docente y de demostracion de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lidya17/customer-segment-model
- Dataset de origen en Kaggle: https://www.kaggle.com/datasets/datascikhan/e-commerce-sales-and-customer-analytics
- Documentacion de scikit-learn: https://scikit-learn.org/stable/
- Documentacion de joblib: https://joblib.readthedocs.io/
- Documentacion de Gradio: https://www.gradio.app/docs
