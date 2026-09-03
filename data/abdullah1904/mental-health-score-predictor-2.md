# abdullah1904/Mental-Health-Score-Predictor

## Resumen

El modelo Mental Health Score Predictor es un regresor basado en Random Forest, desarrollado por abdullah1904 con scikit-learn, que predice una puntuación de salud mental (0-10) a partir de hábitos de uso de redes sociales, sueño, estudio, actividad física y nivel de estrés. Se trata de un proyecto educativo y de portafolio que explora la relación entre hábitos digitales y bienestar mental, ofreciendo una línea base reproducible para experimentación posterior.

El modelo se entrenó sobre un conjunto de datos de 5.000 filas con 13 columnas, de tipo auto-reportado y probablemente sintético, e incluye un pipeline completo de preprocesamiento (codificación one-hot, escalado, transformación logarítmica) integrado en el objeto guardado. Aunque no es un modelo de lenguaje ni de visión, su relevancia radica en demostrar un flujo de trabajo completo de regresión tabular con scikit-learn, con métricas de rendimiento documentadas y un uso sencillo mediante joblib.

La ficha se basa exclusivamente en la información publicada en Hugging Face y en los resultados de búsqueda web asociados. No se dispone de datos sobre arquitectura de red neuronal, parámetros, contexto ni cuantización, ya que se trata de un modelo clásico de machine learning, no de un transformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest Regressor (ensemble de arboles de decision) |
| Parametros totales | no disponible (no se especifican numero de arboles ni profundidad) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no procesa secuencias) |
| Tipos de cuantizacion | no aplica (modelo clasico, no requiere cuantizacion) |
| Idiomas soportados | no disponible (el dataset parece en ingles, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | .pkl (via joblib) |

## Arquitectura y entrenamiento

El modelo es un Random Forest Regressor de scikit-learn, entrenado dentro de un `Pipeline` que incluye preprocesamiento de características. El dataset original de 5.000 filas y 13 columnas fue limpiado (eliminación de duplicados, recorte de valores negativos en actividad física), se agruparon países en top-10 + "Other", se aplicó transformación logarítmica a horas de estudio, escalado estándar a variables numéricas, codificación ordinal para nivel de estrés y one-hot encoding para variables categóricas. Se realizó una división 80/20 para entrenamiento y prueba.

Se compararon cuatro modelos: regresión lineal, Random Forest por defecto, Random Forest con Grid Search y Random Forest con Random Search. El modelo guardado es el Random Forest por defecto, que obtuvo el mejor R² en test (0.878). No se especifican hiperparámetros concretos (número de árboles, profundidad máxima, etc.) en la documentación disponible.

## Capacidades

- Predicción de una puntuación numérica continua de salud mental (0-10) a partir de características tabulares.
- Manejo de variables mixtas (numéricas y categóricas) gracias al pipeline de preprocesamiento integrado.
- Inferencia rápida en CPU, adecuada para aplicaciones en tiempo real con baja latencia.
- No soporta generación de texto, tool calling, agentes, visión ni audio.
- No es un modelo multilingüe; el dataset y las características están en inglés, aunque no se especifica soporte idiomático.

## Casos de uso

- Análisis exploratorio en investigación educativa: el modelo permite estimar el bienestar mental de estudiantes a partir de encuestas sobre hábitos digitales y académicos, sirviendo como herramienta preliminar para estudios sociológicos.
- Prototipo de aplicación de bienestar: puede integrarse en una app web (por ejemplo, con FastAPI y React, como se ve en proyectos similares en GitHub) para que usuarios introduzcan sus datos y obtengan una estimación de su score.
- Línea base para experimentación en ciencia de datos: al ser un modelo sencillo y reproducible, es útil para comparar con otros algoritmos (XGBoost, redes neuronales) o para probar ingeniería de características adicionales.
- Demostración de pipelines de scikit-learn: sirve como ejemplo didáctico de cómo construir un pipeline completo con preprocesamiento, entrenamiento y guardado del modelo.
- Análisis de correlaciones entre hábitos y salud mental: aunque no establece causalidad, permite identificar patrones en los datos que pueden guiar hipótesis de investigación.
- Evaluación de impacto de intervenciones: en un entorno controlado, podría usarse para medir cambios en el score tras modificar hábitos (por ejemplo, reducir horas de redes sociales), siempre con cautela y sin fines clínicos.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de test (20% de los datos):

| Modelo | R² (test) | R² (train) | MAE | MSE | RMSE |
| --- | --- | --- | --- | --- | --- |
| Regresión lineal | 0.740 | 0.724 | 0.536 | 0.457 | 0.676 |
| Random Forest (por defecto) | 0.878 | 0.981 | 0.347 | 0.215 | 0.464 |
| Random Forest (Grid Search) | 0.872 | 0.969 | 0.358 | 0.225 | 0.474 |
| Random Forest (Random Search) | 0.865 | 0.955 | 0.369 | 0.237 | 0.487 |

No se han publicado comparaciones con otros modelos externos ni benchmarks estandarizados (MMLU, HumanEval, etc.) porque no es un modelo de lenguaje.

## Requisitos de hardware

- Al ser un modelo de Random Forest de tamaño reducido (dataset de 5.000 filas), la inferencia se ejecuta en CPU sin necesidad de GPU.
- VRAM estimada: 0 GB (no requiere memoria de gráficos).
- GPU recomendada: ninguna; cualquier CPU moderna es suficiente.
- Es compatible con cualquier equipo de consumo, incluidos portátiles y Raspberry Pi.
- Opciones de despliegue: se puede servir mediante FastAPI, Flask, o integrarse en un script Python. No es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia: del orden de milisegundos por predicción, aunque no se proporcionan mediciones exactas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (regresión tabular para salud mental) en las fuentes consultadas. La model card solo compara internamente con regresión lineal y variantes de Random Forest. Por tanto, la comparativa externa se considera no disponible.

## Limitaciones y advertencias

- El modelo se entrenó con un único dataset, probablemente sintético o de encuesta auto-reportada, por lo que puede no generalizar a poblaciones reales.
- Las características auto-reportadas (horas de uso, nivel de estrés) son propensas a sesgos de autopercepción.
- Las correlaciones observadas no implican causalidad; el modelo no debe usarse para inferir relaciones causales.
- No se ha realizado una auditoría de equidad o sesgo entre grupos demográficos.
- No está destinado a uso clínico, diagnóstico ni toma de decisiones en salud mental real. Es solo un proyecto educativo.
- La licencia MIT permite uso comercial, pero el autor desaconseja explícitamente su uso en contextos clínicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdullah1904/Mental-Health-Score-Predictor
- Proyecto similar en GitHub (full-stack con FastAPI y React): https://github.com/mn-ansari/mental-health-score-predictor
- Proyecto similar en GitHub (aplicación web): https://github.com/CHAYANARKA/mental-health-score-predictor
- Revisión de modelos predictivos en salud mental (ScienceDirect): https://www.sciencedirect.com/science/article/pii/S2772442524000522
- Artículo relacionado en PubMed: https://pubmed.ncbi.nlm.nih.gov/40481455/
