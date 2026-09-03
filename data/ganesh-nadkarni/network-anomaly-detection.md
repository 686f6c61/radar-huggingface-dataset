# Ganesh-Nadkarni/network-anomaly-detection

## Resumen

El modelo `Ganesh-Nadkarni/network-anomaly-detection` es un clasificador de detección de anomalías en tráfico de red basado en un **Gradient Boosting Classifier** de scikit-learn. Desarrollado por Ganesh-Nadkarni, resuelve el problema de clasificar tráfico de red como **normal** o **ataque** utilizando el conjunto de datos NSL-KDD, un estándar en la investigación de sistemas de detección de intrusiones (IDS). El modelo se selecciona automáticamente entre tres algoritmos evaluados (Random Forest, Gradient Boosting y Regresión Logística) según su puntuación F1, siendo el Gradient Boosting el que obtiene mejores resultados.

A diferencia de los modelos de lenguaje de gran tamaño, este es un modelo de machine learning clásico, ligero y entrenado con 41 características de flujo de red. Su relevancia radica en su simplicidad y en que puede servir como punto de partida para sistemas de detección de intrusiones en entornos educativos o de investigación, aunque su rendimiento en tráfico real puede verse limitado por la naturaleza del dataset de entrenamiento. El repositorio incluye scripts de entrenamiento, predicción y visualización, así como los artefactos del modelo serializados en formato pickle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient Boosting Classifier (scikit-learn) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | pickle (best_model.pkl, scaler.pkl, label_encoders.pkl, feature_names.pkl) |

## Arquitectura y entrenamiento

El modelo es un **Gradient Boosting Classifier** implementado con scikit-learn. Se entrena sobre el dataset NSL-KDD, que contiene 41 características de flujo de red (duración, protocolo, servicio, bytes transferidos, tasas de error, etc.). El preprocesamiento incluye un `StandardScaler` para características numéricas y `label_encoders` para las categóricas (protocol_type, service, flag). El proceso de entrenamiento evalúa tres algoritmos —Random Forest, Gradient Boosting y Regresión Logística— y selecciona automáticamente el de mejor F1 score. No se especifican hiperparámetros concretos ni el número de estimadores, ni se menciona el uso de técnicas como validación cruzada o ajuste de hiperparámetros. El dataset se divide en entrenamiento y prueba (KDDTrain+.txt y KDDTest+.txt), y el modelo final se guarda junto con el scaler y los encoders para reproducibilidad.

## Capacidades

- Clasificación binaria de tráfico de red: distingue entre tráfico **normal** y **ataque**.
- Manejo de 41 características numéricas y categóricas típicas de flujos de red (protocolo, servicio, tasas de error, etc.).
- Inferencia rápida y ligera, adecuada para entornos con recursos limitados (CPU).
- Incluye scripts de predicción en modo interactivo, demo y procesamiento por lotes de archivos CSV.
- Genera gráficas de diagnóstico: comparación de modelos, curvas ROC, matriz de confusión, importancia de características y distribución de clases.
- No es un modelo generativo: no produce texto, código ni razonamiento; su única salida es una etiqueta de clase (normal/ataque) y, en su caso, la probabilidad asociada.

## Casos de uso

- **Sistema de detección de intrusiones educativo**: el modelo puede integrarse en prácticas de laboratorio de seguridad para demostrar cómo un clasificador supervisado identifica ataques en tráfico de red simulado. Su bajo coste computacional permite ejecutarlo en cualquier portátil.
- **Investigación académica sobre IDS**: sirve como línea base (baseline) para comparar con técnicas más avanzadas (deep learning, ensembles, etc.) sobre el dataset NSL-KDD, ya que su rendimiento está documentado y es reproducible.
- **Prototipado rápido de un IDS basado en reglas**: dado que el modelo expone la importancia de las características, puede usarse para identificar qué variables de flujo son más discriminativas entre tráfico normal y ataques, orientando el diseño de reglas de detección manuales.
- **Análisis de tráfico en redes pequeñas o simuladas**: en entornos de prueba (por ejemplo, redes emuladas con GNS3 o Mininet), el modelo puede clasificar flujos capturados y alertar de posibles intrusiones, aunque con las limitaciones propias de un dataset de entrenamiento antiguo.
- **Formación en pipelines de machine learning**: el repositorio incluye un flujo completo (entrenamiento, evaluación, serialización y predicción) que puede usarse como ejemplo didáctico de cómo construir y desplegar un modelo de clasificación con scikit-learn.
- **Filtrado previo en sistemas de monitorización**: aunque no está pensado para producción, podría emplearse como un primer filtro de bajo coste para marcar flujos sospechosos que luego se analicen con herramientas más sofisticadas (por ejemplo, un SIEM).

## Benchmarks y rendimiento

El autor proporciona los resultados de evaluación sobre el conjunto de prueba de NSL-KDD para los tres modelos entrenados:

| Modelo | Accuracy | F1 Score | ROC-AUC |
|---|---:|---:|---:|
| Random Forest | 77.07% | 75.44% | 96.20% |
| **Gradient Boosting** | **80.64%** | **80.05%** | **96.25%** |
| Logistic Regression | 75.39% | 74.07% | 87.14% |

El modelo seleccionado es el Gradient Boosting, con una accuracy del 80.64%, F1 del 80.05% y ROC-AUC del 96.25%. No se proporcionan métricas adicionales como precisión, recall o matriz de confusión detallada, ni comparación con otros modelos de la literatura.

## Requisitos de hardware

- **VRAM**: no requiere GPU; el modelo es un clasificador clásico con un tamaño de archivo de pocos megabytes (el repo ocupa 0.0 GB según HuggingFace, aunque los archivos pickle están presentes).
- **GPU recomendada**: ninguna. Funciona en CPU.
- **Compatibilidad con hardware de consumo**: sí, cualquier ordenador con Python y scikit-learn puede ejecutarlo.
- **Opciones de despliegue**: al ser un modelo pickle de scikit-learn, puede cargarse con `joblib.load()` en cualquier aplicación Python. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no se han publicado mediciones, pero al tratarse de un Gradient Boosting con 41 características, la inferencia es del orden de microsegundos por muestra en CPU moderna.

## Comparativa con modelos similares

Dentro del propio repositorio se comparan tres algoritmos sobre el mismo dataset. No se dispone de comparación con otros modelos de detección de anomalías publicados en HuggingFace.

| Modelo | Accuracy | F1 Score | ROC-AUC | Licencia |
|---|---:|---:|---:|---|
| Random Forest (mismo repo) | 77.07% | 75.44% | 96.20% | no disponible |
| **Gradient Boosting (este modelo)** | **80.64%** | **80.05%** | **96.25%** | no disponible |
| Logistic Regression (mismo repo) | 75.39% | 74.07% | 87.14% | no disponible |

No se han encontrado otros modelos comparables en el ecosistema HuggingFace con la misma tarea y dataset.

## Limitaciones y advertencias

- **Sesgo del dataset**: el modelo se entrena y evalúa exclusivamente con NSL-KDD, un dataset de 2009. El tráfico de red actual (cifrado, protocolos modernos, ataques recientes) difiere significativamente, por lo que el rendimiento en producción será probablemente inferior.
- **Riesgo de alucinación**: no aplica, al no ser un modelo generativo.
- **Limitaciones de contexto o idioma**: no aplica, no procesa lenguaje natural.
- **Restricciones de licencia**: no se especifica ninguna licencia en la model card. Esto implica que el uso comercial no está claramente permitido; se recomienda contactar con el autor antes de utilizarlo en entornos productivos.
- **Caveat para producción**: el propio autor indica que el modelo está pensado para fines educativos y de investigación. No debe usarse como único mecanismo de seguridad en una red real sin una validación exhaustiva y un reentrenamiento con datos actualizados.
- **Falta de documentación sobre hiperparámetros**: no se detallan los parámetros del Gradient Boosting (número de estimadores, profundidad máxima, learning rate, etc.), lo que dificulta la reproducibilidad exacta del entrenamiento.

## Enlaces

- [HuggingFace - Ganesh-Nadkarni/network-anomaly-detection](https://huggingface.co/Ganesh-Nadkarni/network-anomaly-detection)
- [Dataset NSL-KDD en Kaggle](https://www.kaggle.com/datasets/hassan06/nslkdd)
- No se han encontrado papers, blogs o repositorios adicionales asociados a este modelo.
