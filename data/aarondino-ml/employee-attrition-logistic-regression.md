# aarondino-ml/employee-attrition-logistic-regression

## Resumen

El modelo `employee-attrition-logistic-regression` es un clasificador binario tabular desarrollado por el usuario de Hugging Face `aarondino-ml` como proyecto de la asignatura Business Data Science (MN1135) del Programa de Estudios de Management de la Universitas Universal. Su objetivo es predecir si un empleado abandonara la empresa (`LeaveOrNot`: 0 = permanece, 1 = se va) a partir de ocho caracteristicas sociolaborales basicas. No es un modelo de lenguaje ni una red neuronal profunda: se trata de una regresion logistica serializada con `joblib` sobre `scikit-learn`, empaquetada junto con un escalador y la lista de nombres de caracteristicas.

El modelo se entrena sobre el dataset publico "Employee Future Prediction" de Kaggle, que tras la limpieza de duplicados queda en 2.764 filas y 8 caracteristicas de entrada (4 numericas y 4 categoricas), que tras One-Hot Encoding se convierten en 10 columnas. La etiqueta esta desbalanceada, por lo que el autor prioriza F1-score y recall sobre la clase positiva en lugar de accuracy. Es relevante unicamente como referencia docente o como linea base (baseline) reproducible para problemas de attrition, no como solucion de produccion.

El repositorio tiene un tamano de 0,0 GB (pesos de pocos kilobytes), 0 descargas y 0 likes en el momento de la consulta, y fue creado el 21 de noviembre de 2026. No se ha publicado informacion sobre idiomas de entrenamiento ni sobre el proceso exacto de ajuste de hiperparametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (scikit-learn), pipeline con escalado previo |
| Parametros totales | no disponible (coeficientes de regresion logistica; numero no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (serializacion `joblib`; no se documentan conversiones a otros formatos) |
| Idiomas soportados | no disponible (modelo tabular, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `joblib` (archivos `model_churn.joblib`, `scaler.joblib`, `feature_names.joblib`) |

## Arquitectura y entrenamiento

La arquitectura es una regresion logistica binaria implementada con `scikit-learn`, acompanada de un escalador (presumiblemente `StandardScaler`, dado que el codigo de uso aplica `scaler.transform` sobre las cuatro variables numericas) y de una lista de nombres de caracteristicas para garantizar el orden de columnas. El preprocesado incluye One-Hot Encoding de las variables categoricas (`Education`, `City`, `Gender`, `EverBenched`), resultando en 10 columnas de entrada. No se documenta regularizacion (L1/L2), valor de `C`, solver ni criterio de convergencia.

El entrenamiento se realiza sobre el dataset "Employee Future Prediction" (2.764 filas tras eliminar duplicados, 8 caracteristicas originales), con una particion estratificada 80/20: 2.211 filas para entrenamiento y 553 para prueba. No se menciona validacion cruzada, busqueda de hiperparametros, calibracion de probabilidades ni tecnicas de reequilibrado de clases (SMOTE, class weights, etc.). Tampoco se documenta ningun proceso de RLHF, DPO ni ajuste fino adicional, algo esperable en un modelo de esta naturaleza.

## Capacidades

- Clasificacion binaria tabular: predice la probabilidad de abandono (`predict_proba`) y la etiqueta discreta (`predict`) para cada empleado.
- Entrada compuesta por 4 variables numericas (`JoiningYear`, `PaymentTier`, `Age`, `ExperienceInCurrentDomain`) y 4 categoricas (`Education`, `City`, `Gender`, `EverBenched`).
- Salida interpretable: al ser una regresion logistica, los coeficientes permiten analizar la direccion e intensidad de cada caracteristica.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues, de vision, audio ni modo "thinking".
- No gestiona texto libre: requiere datos tabulares preprocesados y alineados con `feature_names.joblib`.

## Casos de uso

- Linea base para proyectos de attrition: sirve como referencia minima contra la que comparar modelos mas complejos (gradient boosting, random forest) en el mismo dataset; su F1 de 0,6134 y ROC-AUC de 0,7119 marcan el umbral a superar.
- Analisis exploratorio de factores de riesgo: los coeficientes de la regresion permiten identificar que variables (por ejemplo, `PaymentTier` o `EverBenched`) se asocian con mayor probabilidad de salida, util para hipotesis en recursos humanos.
- Docencia y reproduccion academica: el paquete incluye escalador y lista de columnas, lo que facilita replicar el flujo completo en un cuaderno de clase sin dependencias pesadas.
- Prototipado rapido de un scoring de riesgo: dado su tamano minimo, se puede desplegar en un endpoint ligero (Flask/FastAPI) para pruebas internas de concepto.
- Integracion en pipelines de scikit-learn: al ser un objeto `joblib`, se puede insertar en un `Pipeline` o en un `GridSearchCV` para reentrenamiento periodico con nuevos datos.
- Filtro previo en procesos de retencion: priorizar empleados con probabilidad alta de salida para entrevistas de retencion, siempre con supervision humana y sin decision automatica.
- Benchmarking de tecnicas de preprocesado: comparar el impacto de distintas codificaciones (One-Hot frente a target encoding) sobre el mismo conjunto de datos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el 20% de test (553 filas, particion estratificada):

| Metrica | Valor |
|---|---|
| F1-score (clase 1) | 0,6134 |
| Recall (clase 1) | 0,6514 |
| Precision (clase 1) | 0,5796 |
| ROC-AUC | 0,7119 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo ocupa kilobytes y se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna, incluso en entornos con poca memoria (menos de 100 MB de RAM para cargar los tres archivos `joblib`).
- Opciones de despliegue: `scikit-learn` + `joblib` en Python; se puede servir con Flask, FastAPI, BentoML o incrustar en un script batch. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no publicados; por la naturaleza del modelo (una multiplicacion matricial de 10 columnas), la inferencia por fila es del orden de microsegundos a milisegundos en CPU, aunque no hay medicion oficial.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables publicados por el mismo autor ni sobre alternativas evaluadas en el mismo dataset. Como referencia cualitativa, cualquier clasificador tabular supervisado (regresion logistica con `class_weight='balanced'`, random forest, XGBoost, LightGBM) sobre el mismo dataset seria comparable, pero no se han publicado resultados de esos modelos en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| employee-attrition-logistic-regression | no disponible | no aplica | MIT | Hugging Face |
| Alternativas tabulares (XGBoost, LightGBM, Random Forest) | no disponible | no aplica | segun libreria | no evaluadas en esta ficha |

## Limitaciones y advertencias

- Validez limitada a la poblacion y periodo del dataset de entrenamiento; el comportamiento laboral cambia con las politicas de empresa y el mercado, por lo que requiere reentrenamiento periodico.
- Recall de 0,6514: aproximadamente un tercio de los empleados que se van no se detectan, lo que limita su uso como unico filtro de retencion.
- El modelo captura correlaciones, no causalidad; no debe interpretarse como explicacion causal del abandono.
- El dataset no incluye variables cualitativas como satisfaccion laboral o relacion con el jefe, que son predictores relevantes en la literatura de attrition.
- El autor no ha evaluado sesgos entre grupos demograficos (genero, ciudad, nivel educativo), lo que supone un riesgo si se usa para decisiones sobre personas.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el modelo no esta validado para produccion ni para decisiones automatizadas de alto impacto.
- El codigo de ejemplo de la model card usa un `repo_id` generico (`username/employee-attrition-model`) distinto del identificador real; debe sustituirse por `aarondino-ml/employee-attrition-logistic-regression`.
- No hay informacion sobre calibracion de probabilidades; `predict_proba` puede no estar bien calibrado para umbrales distintos de 0,5.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aarondino-ml/employee-attrition-logistic-regression
- Dataset de origen (Kaggle): https://www.kaggle.com/datasets/tejashvi14/employee-future-prediction
- Documentacion de scikit-learn: https://scikit-learn.org/stable/
- Documentacion de joblib: https://joblib.readthedocs.io/
- Documentacion de huggingface_hub: https://huggingface.co/docs/huggingface_hub
