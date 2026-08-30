# amirsoahil101/Credit_Card_Fraud_Synthetic_Detector

## Resumen

El modelo `amirsoahil101/Credit_Card_Fraud_Synthetic_Detector` es un clasificador binario de detección de fraude en transacciones con tarjetas de crédito, desarrollado por Amir Sohail. Aunque está registrado en HuggingFace con el pipeline de `text-classification`, en realidad se trata de un modelo clásico de machine learning basado en árboles de decisión (Random Forest) entrenado con scikit-learn sobre un dataset sintético de transacciones. El proyecto incluye una aplicación web interactiva construida con Streamlit que permite evaluar transacciones en tiempo real a partir de características transformadas mediante PCA (V1–V5), el tiempo transcurrido y el importe de la operación.

El modelo resuelve el problema de identificar transacciones fraudulentas frente a legítimas, un desafío crítico en el sector financiero. Su relevancia radica en que ofrece una solución ligera, fácil de desplegar y con una precisión declarada del 98% sobre el conjunto de datos sintético. No se trata de un modelo de lenguaje de gran escala, sino de un pipeline de ML tradicional, por lo que su arquitectura, parámetros y contexto no son comparables a los de los LLM actuales.

El repositorio incluye el código de entrenamiento, los artefactos serializados (modelo, escalador y columnas) y la aplicación Streamlit, todo bajo licencia MIT. Aunque el modelo está etiquetado como `en`, su entrada son datos numéricos, no texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (ensemble de árboles de decisión) |
| Parametros totales | no disponible (modelo clásico, no neuronal) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada numérica tabular) |
| Tipos de cuantizacion | no aplica (pesos en formato pickle) |
| Idiomas soportados | en (etiqueta declarada, aunque la entrada es numérica) |
| Licencia | MIT |
| Formato de pesos | pickle (`.pkl`) |

## Arquitectura y entrenamiento

El modelo es un clasificador de tipo Random Forest, un ensemble de árboles de decisión entrenado con scikit-learn. Según la model card, se evaluaron varios algoritmos (Random Forest, Extra Trees, K-Neighbors, XGBoost, AdaBoost, Decision Tree y Gradient Boosting) sobre un dataset sintético de transacciones de tarjetas de crédito. El Random Forest fue seleccionado como modelo final por alcanzar una precisión del 98% con estimación de probabilidad fiable para la gradación de riesgo.

El dataset de entrenamiento incluye características derivadas de un análisis de componentes principales (PCA) sobre los patrones de transacción, junto con el tiempo transcurrido desde la primera transacción y el importe. No se menciona el número de tokens ni el uso de técnicas de RLHF o DPO, ya que no es un modelo de lenguaje. El entrenamiento se realizó en un notebook (`model.ipynb`) que incluye preprocesado, análisis exploratorio y ajuste de los clasificadores.

## Capacidades

- Clasificación binaria de transacciones: distingue entre legítima (0) y fraudulenta (1).
- Estimación de probabilidad de fraude: el modelo devuelve una puntuación de confianza (0–100%) que permite asignar niveles de riesgo.
- Integración en aplicación web: la interfaz Streamlit permite introducir los valores de las características y obtener una predicción en tiempo real.
- Manejo de datos tabulares: procesa vectores numéricos (Time, V1–V5, Amount) sin necesidad de procesamiento de lenguaje natural.
- Tolerancia a fallos: la aplicación incluye manejo de excepciones para que la interfaz se renderice incluso si faltan dependencias o archivos `.pkl`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales, al ser un modelo clásico de ML.

## Casos de uso

- Detección de fraude en tiempo real: la aplicación Streamlit permite a un analista de riesgos introducir los valores de una transacción (tiempo, componentes PCA, importe) y obtener al instante una clasificación de legítima o fraudulenta, junto con el nivel de riesgo y la confianza del modelo.
- Evaluación de modelos de clasificación: el repositorio incluye una comparativa de varios algoritmos (Random Forest, XGBoost, KNN, etc.) sobre el mismo dataset, lo que sirve como referencia para seleccionar el clasificador más adecuado en problemas similares.
- Prototipado de sistemas de prevención de fraude: al ser un modelo ligero y con licencia MIT, puede integrarse en un pipeline de pruebas para validar la viabilidad de un sistema de detección antes de escalar a soluciones más complejas.
- Formación y educación: el notebook de entrenamiento y la documentación permiten a estudiantes y desarrolladores comprender el flujo completo de un proyecto de ML aplicado a finanzas, desde el preprocesado hasta el despliegue.
- Análisis de transacciones sintéticas: el dataset sintético puede utilizarse para experimentar con técnicas de detección de anomalías sin exponer datos reales de clientes.
- Despliegue en entornos con recursos limitados: al no requerir GPU ni grandes cantidades de memoria, puede ejecutarse en servidores modestos o incluso en un portátil, lo que facilita su adopción en pequeñas empresas o proyectos de bajo presupuesto.

## Benchmarks y rendimiento

La model card reporta la precisión de varios clasificadores evaluados sobre el dataset sintético. Los resultados son los siguientes:

| Modelo | Precisión |
|---|---|
| Random Forest Classifier | 0.980 |
| Extra Trees Classifier | 0.980 |
| K-Neighbors Classifier | 0.980 |
| XGBoost Classifier | 0.980 |
| AdaBoost Classifier | 0.975 |
| Decision Tree Classifier | 0.970 |
| Gradient Boosting Classifier | 0.970 |

No se proporcionan métricas adicionales como recall, precisión o F1, ni resultados sobre conjuntos de datos reales. El valor de precisión declarado (0.98) proviene del autor y no ha sido verificado de forma independiente.

## Requisitos de hardware

- Al ser un modelo clásico de ML con un número reducido de árboles (no especificado), la inferencia es extremadamente ligera y puede ejecutarse en cualquier CPU moderna.
- No requiere GPU. La aplicación Streamlit puede desplegarse en un servidor básico con 1–2 GB de RAM.
- El tamaño del repositorio es de 0.0 GB, lo que indica que los artefactos (modelo, escalador, columnas) son de pequeño tamaño (probablemente menos de 1 MB).
- Opciones de despliegue: la aplicación Streamlit se puede ejecutar localmente con `streamlit run app.py` o desplegarse en plataformas como Streamlit Community Cloud, Heroku o cualquier VPS.
- Latencia: la predicción con Random Forest es del orden de milisegundos, por lo que es adecuada para aplicaciones en tiempo real.

## Comparativa con modelos similares

Dado que se trata de un modelo clásico de detección de fraude, la comparativa más relevante es con los otros clasificadores evaluados en la propia model card. No se dispone de información sobre modelos comparables de la misma categoría (por ejemplo, redes neuronales profundas o modelos de boosting más recientes) en la documentación proporcionada.

| Modelo | Precisión | Licencia | Disponibilidad |
|---|---|---|---|
| Random Forest (este modelo) | 0.980 | MIT | Código y artefactos en HuggingFace/GitHub |
| Extra Trees | 0.980 | MIT | Evaluado en el mismo proyecto |
| XGBoost | 0.980 | MIT | Evaluado en el mismo proyecto |
| AdaBoost | 0.975 | MIT | Evaluado en el mismo proyecto |

No se han encontrado comparativas con modelos externos en la información disponible.

## Limitaciones y advertencias

- El modelo fue entrenado con un dataset sintético, por lo que su rendimiento en datos reales de transacciones puede diferir significativamente. No hay evidencia de validación con datos reales.
- La precisión declarada (98%) se basa en el conjunto de validación del propio autor y no ha sido verificada de forma independiente. Podría estar sobreestimada.
- Al ser un modelo de ML clásico, no tiene capacidad de procesamiento de lenguaje natural, a pesar de estar etiquetado como `text-classification`. Su entrada son vectores numéricos.
- No se especifican los hiperparámetros del Random Forest (número de árboles, profundidad máxima, etc.), lo que dificulta la reproducibilidad exacta.
- El modelo no maneja datos categóricos ni texto libre; solo acepta las características numéricas definidas (Time, V1–V5, Amount).
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad del modelo para producción sin una validación adicional.
- El repositorio no incluye un conjunto de datos de prueba separado ni métricas de rendimiento por clase (fraude vs. legítimo), lo que limita la evaluación de su capacidad para detectar fraudes reales (posible desbalanceo de clases).

## Enlaces

- HuggingFace: https://huggingface.co/amirsoahil101/Credit_Card_Fraud_Synthetic_Detector
- Repositorio GitHub: https://github.com/amirsohail100/Credit-Card-Fraud-Detection-System
- Aplicación demo (Streamlit): https://credit-card-fraud-detection-system-md3f6bhxwpbrhz8ogcylwu.streamlit.app/
- Notebook de entrenamiento (dentro del repositorio): `model.ipynb`
