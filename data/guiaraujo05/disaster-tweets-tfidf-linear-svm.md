# GuiAraujo05/disaster-tweets-tfidf-linear-svm

## Resumen

El modelo `GuiAraujo05/disaster-tweets-tfidf-linear-svm` es un clasificador binario de texto para tweets en inglés, entrenado para distinguir entre tuits que describen un desastre real y tuits que no. Lo desarrolla el usuario GuiAraujo05 en el contexto de la competición de Kaggle "Natural Language Processing with Disaster Tweets". No es una red neuronal ni un modelo de lenguaje generativo: es un pipeline clásico de Scikit-learn que combina vectorización TF-IDF con una máquina de vectores de soporte lineal (LinearSVC).

La relevancia de esta ficha es acotada: se trata de un artefacto pequeño, reproducible y de propósito muy específico, útil como referencia de línea base (baseline) para tareas de clasificación de texto corto y como ejemplo de buenas prácticas de evaluación (agrupación por texto exacto para evitar fugas de datos). No compite con modelos generativos ni con transformers; su interés es didáctico y operativo para pipelines ligeros de clasificación.

El repositorio ocupa 0,0 GB según Hugging Face, se distribuye como un único artefacto Joblib (`linear_svm_submission.joblib`) y está etiquetado con licencia MIT. Se entrenó sobre 7.613 tuits etiquetados y declaró un F1 de 0,79313 en la submission oficial de Kaggle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline Scikit-learn: TfidfVectorizer + LinearSVC (C=1.0, max_iter=5000, random_state=42) |
| Parametros totales | no disponible (modelo lineal sobre representacion TF-IDF dispersa; el numero depende del vocabulario aprendido) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; TF-IDF procesa el texto completo del tuit) |
| Tipos de cuantizacion | no aplica (no hay pesos en coma flotante de red neuronal; el artefacto se serializa con Joblib) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | Joblib (`linear_svm_submission.joblib`); exportacion adicional a JSON para inferencia en navegador |

## Arquitectura y entrenamiento

El modelo es un pipeline de dos etapas. La primera es `TfidfVectorizer()`, que convierte el texto crudo del tuit en una representacion numérica dispersa basada en frecuencia de término e inversa de frecuencia de documento. La segunda es `LinearSVC(C=1.0, max_iter=5000, random_state=42)`, un SVM lineal que aprende un hiperplano de separación entre las clases 0 (no desastre) y 1 (desastre). Ambas etapas se ajustan conjuntamente y se serializan en un único objeto, de modo que la inferencia recibe cadenas de texto sin preprocesado manual.

Los datos de entrenamiento proceden de la competición de Kaggle y suman 7.613 observaciones etiquetadas: 4.342 de clase 0 (57,03 %) y 3.271 de clase 1 (42,97 %). Solo se usa la columna `text`. La metodología destaca por el uso de `GroupShuffleSplit` agrupando por texto exacto del tuit, lo que evita que textos idénticos aparezcan simultáneamente en entrenamiento y validación; la partición de desarrollo quedó en 6.083 observaciones de entrenamiento y 1.530 de validación. Se compararon tres algoritmos (Multinomial Naive Bayes, regresión logística y LinearSVC), con validación cruzada consciente de grupos, optimización de hiperparámetros y análisis de matriz de confusión. El pipeline final se reajustó sobre las 7.613 observaciones completas. No hay RLHF, DPO ni fases de ajuste generativo.

## Capacidades

- Clasificación binaria de texto corto en inglés: etiqueta 0 (no desastre) o 1 (desastre).
- Procesamiento directo de cadenas de texto crudas: el pipeline incluye la vectorización TF-IDF, sin necesidad de preprocesado externo.
- Inferencia sin reentrenamiento a partir del artefacto Joblib publicado.
- Exportación de vocabulario TF-IDF, valores IDF, coeficientes del LinearSVC e intercepto a JSON, lo que permite replicar la predicción en JavaScript en el navegador.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües: solo inglés.
- No dispone de modo de razonamiento (thinking), visión ni audio.

## Casos de uso

- Filtrado de tuits en tiempo real para paneles de monitorización de emergencias: el pipeline clasifica texto crudo con muy baja latencia y puede integrarse en un servicio que consuma el flujo de la API de Twitter/X y marque candidatos a revisión humana; su coste computacional es mínimo frente a un transformer.
- Línea base para proyectos de clasificación de texto: sirve como referencia cuantitativa (F1 de 0,79313 en Kaggle) contra la que comparar modelos más complejos en la misma tarea o en tareas análogas de texto corto.
- Etiquetado asistido en investigación social: permite preetiquetar grandes volúmenes de tuits históricos para su posterior revisión manual, reduciendo el esfuerzo de anotación en estudios sobre desastres y comunicación de crisis.
- Inferencia en el navegador sin servidor: la versión exportada a JSON permite ejecutar la clasificación íntegramente en cliente mediante JavaScript, útil para demos, prototipos y aplicaciones sin backend.
- Enseñanza de pipelines de NLP clásico: el repositorio documenta vectorización, selección de modelo, validación agrupada y análisis de errores, lo que lo convierte en material didáctico reproducible.
- Módulo de triaje en sistemas de alerta temprana: puede actuar como primer filtro barato antes de enviar candidatos a un modelo generativo o a un operador humano, reduciendo el volumen que llega a las etapas costosas.

## Benchmarks y rendimiento

El model-index oficial no declara resultados (`results: []`). Los datos de evaluación provienen de la model card del autor:

| Metrica | Valor | Conjunto |
|---|---:|---|
| Accuracy | 0,7948 | Validación de desarrollo (1.530 obs.) |
| Precision (clase 1) | 0,7891 | Validación de desarrollo |
| Recall (clase 1) | 0,7308 | Validación de desarrollo |
| F1-score (clase 1) | 0,7588 | Validación de desarrollo |
| F1-score oficial | 0,79313 | Test oficial de Kaggle (3.263 obs.) |

Matriz de confusión en validación de desarrollo:

| Real / Predicho | No desastre | Desastre |
|---|---:|---:|
| No desastre | 722 | 132 |
| Desastre | 182 | 494 |

El autor advierte que la validación de desarrollo y el resultado de Kaggle se obtuvieron con modelos ajustados distintos y sobre conjuntos diferentes, por lo que no deben interpretarse como una mejora atribuible al reajuste con todos los datos. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo no usa GPU. El artefacto Joblib es de tamaño muy reducido (el repositorio ocupa 0,0 GB según Hugging Face) y la inferencia es CPU-only.
- GPU recomendadas: ninguna; no se requiere aceleración por hardware.
- Cabe en cualquier equipo consumer: portátil, contenedor pequeño o incluso navegador (versión JSON).
- Opciones de despliegue: carga directa con `joblib.load` en Python; servicio HTTP propio (Flask, FastAPI); inferencia en cliente con la exportación JSON; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles de forma explícita; por la naturaleza del modelo (vectorización dispersa y SVM lineal) la latencia esperada es de milisegundos por lote en CPU, aunque no se ha publicado una medición concreta.
- Entorno de referencia declarado: Python 3.11.9, Scikit-learn 1.9.1, Joblib 1.6.0, NumPy 2.4.6, SciPy 1.17.1.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | F1 declarado | Licencia | Disponibilidad |
|---|---|---|---:|---|---|---|
| GuiAraujo05/disaster-tweets-tfidf-linear-svm | TF-IDF + LinearSVC | no disponible | no aplica | 0,79313 (Kaggle) | MIT | Hugging Face |
| Multinomial Naive Bayes (comparado en el propio desarrollo) | TF-IDF + NB | no disponible | no aplica | no disponible en la informacion | no disponible | no disponible |
| Regresion logistica (comparado en el propio desarrollo) | TF-IDF + LR | no disponible | no aplica | no disponible en la informacion | no disponible | no disponible |
| imriadh/Disaster_Tweet_Classifier | TF-IDF + LinearSVC | no disponible | no aplica | no disponible | no disponible | GitHub |

El autor solo documenta que comparó Naive Bayes, regresión logística y LinearSVC, y que seleccionó este último con C=1.0, pero no publica las métricas de los dos primeros. No se dispone de comparaciones con transformers ajustados para la misma tarea.

## Limitaciones y advertencias

- Sesgos: el modelo se entrena sobre un conjunto de Kaggle con distribución concreta de tuits; puede heredar sesgos de anotación y de temática del dataset original.
- Alucinación: no aplica en sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos; la matriz de confusión muestra 132 falsos positivos y 182 falsos negativos en validación.
- Calidad de datos: el propio autor señala que el dataset original contiene textos repetidos y etiquetas contradictorias, lo que introduce ruido irreducible.
- Contexto e idioma: solo inglés y solo texto corto; no procesa documentos largos ni otros idiomas.
- Licencia: MIT permite uso comercial, pero el autor no garantiza idoneidad para monitorización de emergencias reales.
- Seguridad: Joblib usa serialización basada en pickle y puede ejecutar código arbitrario al deserializar; solo deben cargarse artefactos de fuentes de confianza.
- Reproducibilidad: requiere versiones compatibles de Python y Scikit-learn (referencia: Python 3.11.9, Scikit-learn 1.9.1); versiones distintas pueden romper la carga del artefacto.
- Rendimiento real: el F1 de Kaggle no garantiza comportamiento en producción ni en dominios distintos al de la competición.
- Adopción: 0 descargas y 1 like en el momento de la consulta, sin señales de uso comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GuiAraujo05/disaster-tweets-tfidf-linear-svm
- Demo interactiva en Hugging Face Spaces: https://huggingface.co/spaces/GuiAraujo05/disaster-tweet-classifier
- Competición de Kaggle: https://www.kaggle.com/competitions/nlp-getting-started
- Notebook de referencia en Kaggle: https://www.kaggle.com/code/njuspy/disaster-tweets-tfidf/
- Repositorio similar en GitHub: https://github.com/imriadh/Disaster_Tweet_Classifier
