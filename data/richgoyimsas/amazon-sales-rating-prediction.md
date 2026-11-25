# richgoyimsas/amazon-sales-rating-prediction

## Resumen

`richgoyimsas/amazon-sales-rating-prediction` es un modelo de regresion tabular publicado en Hugging Face que estima la valoracion media (rating, en escala continua de 1.0 a 5.0) de productos del marketplace Amazon a partir de variables de precio, descuento, categoria y numero de valoraciones. Lo desarrolla el usuario richgoyimsas como proyecto de la asignatura Business Data Science (MN1135) del grado de Management de la Universitas Universal, y se distribuye con licencia MIT.

No es un modelo de lenguaje ni una red neuronal profunda: es un pipeline clasico de scikit-learn serializado con joblib, entrenado sobre el Amazon Sales Dataset de Kaggle (1.465 filas, 15 columnas originales, 214 columnas tras one-hot encoding). Su interes practico es acotado: sirve como ejemplo reproducible de un flujo de regresion tabular con preprocesado (escalado + one-hot) y como referencia docente, no como componente para produccion.

La relevancia actual es, por tanto, limitada a entornos de aprendizaje y a prototipos de analitica de precios. El repositorio ocupa 0,0 GB, no registra descargas ni likes y no incluye informacion sobre benchmarks de regresion continua ni sobre el algoritmo concreto empleado dentro del pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de regresion tabular con scikit-learn (algoritmo concreto no especificado en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular; entrada de 214 columnas tras one-hot encoding) |
| Tipos de cuantizacion | no disponible (no aplica; pesos serializados en joblib) |
| Idiomas soportados | no disponible (no procesa texto libre; los datos de entrada son numericos y categoricos) |
| Licencia | MIT |
| Formato de pesos | joblib (`model_churn.joblib`, `scaler.joblib`, `feature_names.joblib`) |

## Arquitectura y entrenamiento

Se trata de un modelo de regresion tabular construido con scikit-learn y persistido mediante joblib. La model card no especifica el estimador final (regresion lineal, random forest, gradient boosting, etc.), por lo que no es posible detallar la arquitectura interna. El preprocesado incluye one-hot encoding de la variable categorica `category` (jerarquia de categoria de producto) y escalado de las cuatro variables numericas: `discounted_price`, `actual_price`, `discount_percentage` y `rating_count`. El resultado es una matriz de 214 columnas de entrada.

El entrenamiento se realizo sobre el Amazon Sales Dataset de Kaggle: 1.465 filas y 15 caracteristicas originales, con `rating` como variable objetivo continua en el rango 1.0-5.0. Se reservo un 20 % de los datos (293 filas) como conjunto de prueba. La model card menciona una evaluacion secundaria como problema binario con umbral `rating >= 4.0`, pero no documenta el numero de epocas, la busqueda de hiperparametros, la validacion cruzada ni si hubo balanceo de clases. Tampoco se indica ninguna innovacion tecnica (no hay RLHF, decodificacion especulativa ni atencion lineal; no aplican a este tipo de modelo).

## Capacidades

- Prediccion de la valoracion media (`rating`) de un producto de Amazon como valor continuo entre 1.0 y 5.0.
- Clasificacion binaria secundaria con umbral `rating >= 4.0` (producto bien valorado o no).
- Procesamiento de variables numericas de precio y descuento (`discounted_price`, `actual_price`, `discount_percentage`, `rating_count`).
- Procesamiento de la jerarquia de categoria de producto mediante one-hot encoding (214 columnas resultantes).
- Integracion en pipelines de Python via `joblib.load` y `huggingface_hub.hf_hub_download`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Prototipo academico de analitica de precios: usar el modelo para ilustrar un flujo completo de regresion tabular (carga de datos, one-hot encoding, escalado, entrenamiento y evaluacion) en un curso de ciencia de datos.
- Estimacion exploratoria de la valoracion esperada de un producto a partir de su rango de precio y categoria, para validar hipotesis antes de invertir en un estudio de mercado mas amplio.
- Analisis de sensibilidad de descuentos: dado un producto concreto, variar `discount_percentage` y observar como cambia la prediccion de rating, siempre entendiendo la salida como correlacional y no causal.
- Segmentacion de catalogo por categoria: aplicar el modelo a un lote de productos de la misma jerarquia de categoria para identificar los que se situan por debajo del umbral de 4.0 y priorizar su revision.
- Material docente para comparar metricas de clasificacion (F1, recall, precision, ROC-AUC) frente a metricas de regresion en un mismo problema.
- Baseline interno en un pipeline de MLOps de juguete: sirve como referencia minima contra la que comparar modelos tabulares mas sofisticados (XGBoost, LightGBM) antes de desplegar nada en produccion.
- Reproducibilidad de resultados: al publicar los artefactos joblib y el `feature_names`, permite replicar exactamente el preprocesado y las predicciones en otro entorno.

## Benchmarks y rendimiento

La model card solo publica metricas para el enfoque binario secundario (`rating >= 4.0`) sobre el 20 % de datos reservado (293 filas). No se aportan metricas de regresion continua (MAE, RMSE, R²) ni comparaciones con otros modelos.

| Metrica (umbral >= 4.0) | Valor |
|---|---|
| F1-score | 0,8692 |
| Recall | 0,895 |
| Precision | 0,8448 |
| ROC-AUC | 0,782 |

No se han publicado resultados de benchmarks de regresion continua ni comparativas con modelos similares en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo cabe en memoria RAM convencional (repositorio de 0,0 GB).
- GPU recomendadas: no aplica; la inferencia se ejecuta en CPU sin problemas.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en equipos sin GPU dedicada.
- Opciones de despliegue: script Python con scikit-learn y joblib; tambien puede servirse mediante FastAPI, Flask o un contenedor Docker ligero. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan pensados para modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por la naturaleza del modelo (regresion tabular sobre 214 columnas) se espera un orden de microsegundos a milisegundos por prediccion en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No hay modelos comparables identificados en la informacion disponible. Se trata de un artefacto academico de un unico autor, sin benchmarks de regresion continua publicados ni repositorios hermanos con los que contrastarlo. Como referencia generica, cualquier regresor tabular de scikit-learn (p. ej. `RandomForestRegressor` o `GradientBoostingRegressor`) entrenado sobre el mismo dataset seria un sustituto funcional, pero no se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amazon-sales-rating-prediction | no disponible | no aplica | F1 0,8692 (binario) | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: el dataset de Kaggle (1.465 filas) no es representativo de todo el catalogo de Amazon; el modelo solo es valido para poblaciones y periodos similares a los de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido de los LLM, pero el modelo puede producir predicciones con apariencia de precision sobre productos o categorias fuera de distribucion.
- Limitaciones de contexto o idioma: no procesa texto; no hay soporte multilingue porque la entrada es exclusivamente numerica y categorica.
- Restricciones de licencia: MIT permite uso comercial, pero el autor advierte que el modelo captura relaciones de correlacion, no de causalidad; no debe usarse para decisiones de pricing con impacto economico real sin validacion adicional.
- El dataset no incluye datos de coste ni de margen de beneficio, por lo que no sirve para analisis de rentabilidad.
- La model card no especifica el algoritmo concreto del pipeline, lo que dificulta la auditoria tecnica y la reproducibilidad mas alla de los artefactos joblib.
- El ejemplo de codigo de la model card referencia un `repo_id` distinto (`richardtantonius/amazon-sales-rating-prediction`) y un fichero llamado `model_churn.joblib`, lo que sugiere un copy-paste de otro proyecto; conviene verificar las rutas antes de usarlo.
- El repositorio no registra descargas ni likes y no incluye tests, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richgoyimsas/amazon-sales-rating-prediction
- Dataset de origen (Kaggle): https://www.kaggle.com/datasets/karkavelrajaj/amazon-sales-dataset/data
- Documentacion de scikit-learn: https://scikit-learn.org/stable/
- Documentacion de joblib: https://joblib.readthedocs.io/
- Documentacion de huggingface_hub: https://huggingface.co/docs/huggingface_hub
