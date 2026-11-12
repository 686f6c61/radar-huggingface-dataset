# BOUIDA/logreg-iris-softmax

## Resumen

`BOUIDA/logreg-iris-softmax` es un modelo de clasificación tabular publicado en Hugging Face por el usuario BOUIDA. No es un modelo de lenguaje ni una red neuronal profunda: se trata de un `Pipeline` de scikit-learn que combina un `StandardScaler` con una `LogisticRegression` configurada en modo softmax multiclase. Su única tarea es predecir la especie de una flor de iris (setosa, versicolor o virginica) a partir de cuatro medidas morfológicas (longitud y anchura de sépalo y pétalo).

El modelo se entrena sobre el clásico dataset Iris de scikit-learn, compuesto por 150 muestras y 3 clases, con un reparto estratificado del 70 % para entrenamiento y 30 % para test. El autor reporta una accuracy de 0,911 en el conjunto de test, frente a 0,844 de una variante One-vs-Rest que usa como comparación. El artefacto se distribuye como un fichero `.joblib` de escaso tamaño y se carga directamente con `joblib.load`.

Su relevancia es fundamentalmente didáctica: sirve como ejemplo mínimo reproducible de pipeline de clasificación multiclase con scikit-learn, útil para demostraciones, pruebas de integración de extremo a extremo en plataformas de ML o material docente. No está pensado para producción real ni para tareas fuera del dominio Iris. La licencia MIT facilita su reutilización sin restricciones prácticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn: `StandardScaler` + `LogisticRegression` (softmax multiclase) |
| Parametros totales | no disponible (modelo lineal; el numero de coeficientes depende de 4 features x 3 clases) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, entrada fija de 4 features) |
| Tipos de cuantizacion | no disponible (no aplica; artefacto joblib en coma flotante) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | joblib (`.joblib`) |
| Libreria | scikit-learn |
| Pipeline en Hugging Face | tabular-classification |
| Dataset de entrenamiento | scikit-learn/iris (150 muestras, 3 clases) |
| Entrada esperada | DataFrame con exactamente 4 columnas: `sepal length (cm)`, `sepal width (cm)`, `petal length (cm)`, `petal width (cm)` |
| Clases de salida | 0 = setosa, 1 = versicolor, 2 = virginica |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal multiclase. El pipeline aplica primero un `StandardScaler` que estandariza cada una de las cuatro features (media cero, desviación típica uno), y a continuación una `LogisticRegression` de scikit-learn configurada con la opción softmax multiclase, que modela la probabilidad de cada clase mediante la función softmax sobre las puntuaciones lineales. La normalización está incluida dentro del propio pipeline, de modo que el usuario no necesita escalar las entradas manualmente.

El entrenamiento se realiza sobre el dataset Iris de scikit-learn: 150 flores, 3 especies y 4 features numéricas, con un split estratificado 70/30 (105 muestras de entrenamiento y 45 de test). El autor compara la variante softmax con una aproximación One-vs-Rest sobre el mismo reparto, obteniendo 0,911 frente a 0,844 de accuracy en test. No se documenta búsqueda de hiperparámetros, regularización concreta, número de iteraciones ni uso de validación cruzada. Tampoco se menciona ningún tipo de ajuste fino posterior, RLHF ni técnica de aumentación de datos; es un ajuste directo sobre un dataset de juguete.

## Capacidades

- Clasificación tabular multiclase limitada al dataset Iris: predice una de tres especies a partir de cuatro medidas.
- Integración nativa con el ecosistema scikit-learn: el objeto cargado expone `predict`, `predict_proba` y el resto de la API estándar de estimadores.
- Preprocesado incluido: el escalado (`StandardScaler`) forma parte del pipeline, por lo que no hay que replicarlo fuera.
- Serialización portable mediante joblib, cargable con `joblib.load` tras descargar el fichero con `hf_hub_download`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni generación de texto.
- No dispone de modo "thinking" ni de ninguna capacidad generativa.

## Casos de uso

- Docencia y tutoriales de machine learning: sirve como ejemplo mínimo y reproducible de pipeline `StandardScaler` + `LogisticRegression` con softmax, útil para explicar la diferencia entre estrategias multiclase (softmax frente a One-vs-Rest) con una comparación numérica concreta (0,911 frente a 0,844).
- Pruebas de integración en plataformas de ML: al ser un artefacto joblib pequeño y con una API estándar de scikit-learn, permite validar de extremo a extremo flujos de descarga desde Hugging Face, carga del modelo y predicción sin depender de GPUs ni de dependencias pesadas.
- Baseline de referencia en problemas tabulares pequeños: para cualquier clasificación con pocas features y clases, este pipeline puede servir como punto de partida y comparación frente a modelos más complejos.
- Demostraciones de despliegue de modelos tabulares: se puede empaquetar en un endpoint HTTP o en una función serverless para mostrar el ciclo completo de servir un modelo de scikit-learn en producción.
- Generación de datos sintéticos de prueba: sus salidas (`predict` y `predict_proba`) permiten construir fixtures deterministas para tests de pipelines de datos que esperan predicciones con el formato de scikit-learn.
- Ejemplo de publicación de artefactos en Hugging Face: ilustra el flujo de subir un modelo joblib con una model card estructurada (tags, métricas, licencia y ejemplo de uso), reutilizable como plantilla para otros modelos tabulares.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los de accuracy en el conjunto de test del propio dataset Iris:

| Metodo | Accuracy (test) |
|---|---|
| Softmax (este modelo) | 0,911 |
| One-vs-Rest (comparacion) | 0,844 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni tienen sentido para un modelo de esta naturaleza.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo se ejecuta en CPU sin necesidad de GPU.
- GPU recomendadas: ninguna; no requiere aceleración por hardware.
- Cabe en cualquier equipo: el repositorio ocupa 0,0 GB y el artefacto joblib es de tamaño mínimo.
- Opciones de despliegue: ejecución directa con Python y scikit-learn (`joblib.load`), o empaquetado en un servicio web (FastAPI, Flask) o función serverless. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del modelo (una multiplicación matricial de 4 features por 3 clases) la latencia por predicción es del orden de microsegundos en CPU, aunque el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Accuracy (Iris test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BOUIDA/logreg-iris-softmax | Regresion logistica softmax (scikit-learn) | no disponible (modelo lineal) | no aplica | 0,911 | MIT | Hugging Face |
| One-vs-Rest (variante citada por el autor) | Regresion logistica OvR (scikit-learn) | no disponible | no aplica | 0,844 | no disponible | Solo como comparacion en la model card |
| Otros modelos tabulares para Iris | no disponible | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables publicados con métricas verificables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado sobre un dataset de solo 150 ejemplos: es un proyecto de aprendizaje, no un modelo para producción real.
- Solo reconoce las tres especies de iris del dataset; cualquier entrada fuera de ese dominio producirá predicciones sin significado.
- Requiere un DataFrame con exactamente los cuatro nombres de columna indicados (`sepal length (cm)`, `sepal width (cm)`, `petal length (cm)`, `petal width (cm)`); un cambio de nombres o de orden puede provocar errores o resultados incorrectos.
- No se documentan análisis de sesgos, calibración de probabilidades ni validación cruzada; la accuracy de 0,911 procede de un único split 70/30 y puede variar con otra partición.
- Riesgo de sobreajuste moderado por el tamaño reducido del conjunto de test (45 muestras): pequeñas variaciones cambian la métrica de forma apreciable.
- Licencia MIT: permite uso comercial y modificación sin restricciones prácticas, pero el modelo no ofrece garantías de idoneidad para ningún fin concreto.
- No es un modelo de lenguaje: no procesa texto, no tiene capacidades generativas ni multilingües, y no debe presentarse como tal en contextos de IA generativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BOUIDA/logreg-iris-softmax
- Dataset Iris de scikit-learn: https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_iris.html
- Documentacion de `LogisticRegression` de scikit-learn: https://scikit-learn.org/stable/modules/generated/sklearn.logistic.LogisticRegression.html
- Documentacion de `StandardScaler`: https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.StandardScaler.html
- Documentacion de joblib: https://joblib.readthedocs.io/
- Documentacion de `hf_hub_download`: https://huggingface.co/docs/huggingface_hub/guides/download
