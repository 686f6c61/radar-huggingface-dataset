# imanandshah/engine-maintenance-classifier

## Resumen

El modelo `engine-maintenance-classifier` es un clasificador tabular binario desarrollado por imanandshah para el mantenimiento predictivo de motores de vehículo. Clasifica el estado actual de un motor como "Normal" o "Requiere mantenimiento" a partir de seis lecturas de sensores estándar a bordo (RPM, presiones y temperaturas). No es un modelo de lenguaje ni un sistema de visión: se trata de un pipeline clásico de scikit-learn basado en Gradient Boosting, diseñado como herramienta de apoyo a la decisión para priorizar inspecciones, no como un pronóstico de fallo futuro.

El modelo resuelve un problema real de triaje en mantenimiento: dado un conjunto de sensores con solapamiento entre clases, produce una probabilidad de que el motor esté en estado defectuoso, lo que permite ordenar por riesgo. Su relevancia actual radica en que ofrece un enfoque ligero, reproducible y de bajo coste computacional para integrar en sistemas de mantenimiento predictivo, con una licencia MIT que facilita su adopción en entornos industriales y académicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: IQRCapper -> StandardScaler -> GradientBoostingClassifier |
| Parametros totales | No aplica (modelo clásico, no neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (entrada tabular de 6 características) |
| Tipos de cuantizacion | No aplica (pesos en formato joblib) |
| Idiomas soportados | No aplica (modelo tabular, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | joblib (pipeline serializado) |

## Arquitectura y entrenamiento

El modelo es un pipeline de scikit-learn compuesto por tres etapas: un `IQRCapper` (definido en el módulo `preprocessing.py`) que winsoriza cada característica en su límite de 1,5 veces el IQR, aprendido exclusivamente con datos de entrenamiento para evitar fuga de datos; un `StandardScaler` que normaliza las características; y un `GradientBoostingClassifier` con los hiperparámetros óptimos encontrados mediante GridSearchCV. El ajuste se realizó comparando seis familias de modelos con validación cruzada estratificada de 5 pliegues sobre el AUC-ROC, y el Gradient Boosting se optimizó con 24 combinaciones y validación cruzada de 3 pliegues maximizando F1. Los mejores hiperparámetros fueron `learning_rate=0.05`, `max_depth=2`, `n_estimators=120` y `subsample=1.0`.

El entrenamiento se realizó sobre un conjunto de datos de 19 535 registros de-duplicados, con una división estratificada 80/20 (15 628 entrenamiento / 3 907 prueba), manteniendo una proporción de ~63 % de casos defectuosos y 37 % normales. El conjunto de datos está disponible en HuggingFace (`imanandshah/engine-predictive-maintenance`) y contiene las variables de entrada en un orden exacto: `Engine_RPM`, `Lub_Oil_Pressure`, `Fuel_Pressure`, `Coolant_Pressure`, `Lub_Oil_Temperature` y `Coolant_Temperature`. La variable objetivo es 0 = Normal y 1 = Requiere mantenimiento (clase positiva).

## Capacidades

- Clasificación binaria de estado de motor: Normal (0) vs. Requiere mantenimiento (1).
- Generación de probabilidades de pertenencia a la clase positiva mediante `predict_proba`, útil para ordenar por riesgo.
- Manejo de valores atípicos mediante winsorización con IQRCapper (aprendido solo en entrenamiento).
- Normalización de características con StandardScaler para estabilidad del modelo.
- No tiene capacidades de generación de texto, razonamiento, código, visión ni soporte de herramientas.
- No es un modelo de lenguaje; es un clasificador tabular clásico.

## Casos de uso

- **Triaje de mantenimiento en flotas de vehículos**: se puede integrar en un sistema que reciba lecturas de sensores de cada vehículo y genere una prioridad de inspección. El modelo ordena los motores por probabilidad de fallo, permitiendo que los técnicos atiendan primero los casos con mayor riesgo.
- **Panel de control predictivo en talleres**: con los datos de sensores de cada motor, el modelo puede alimentar un dashboard (por ejemplo, el Streamlit Space proporcionado) para visualizar qué vehículos requieren revisión inmediata.
- **Integración en pipelines MLOps**: al ser un pipeline serializado en joblib, se puede cargar en un servicio de inferencia (FastAPI, Flask) o en un flujo de batch para evaluar múltiples motores diariamente.
- **Validación de sensores**: si se dispone de datos históricos de sensores, el modelo puede detectar cuándo las lecturas se desvían de las condiciones normales, ayudando a identificar sensores defectuosos o condiciones anómalas.
- **Entrenamiento de personal de mantenimiento**: como herramienta didáctica para mostrar cómo un modelo de Gradient Boosting puede apoyar decisiones de mantenimiento basadas en datos.
- **Investigación académica**: el modelo sirve como punto de partida para comparar técnicas de preprocesamiento (winsorización) y algoritmos de clasificación en dominios de datos tabulares con solapamiento de clases.

## Benchmarks y rendimiento

El autor declara las siguientes métricas en el conjunto de prueba (clase positiva = Faulty):

| Metrica | Valor |
|---|---|
| Recall | 0.8624 |
| Precision | 0.6845 |
| F1 | 0.7632 |
| ROC-AUC | 0.7017 |
| Accuracy | 0.6627 |
| Balanced accuracy | 0.5922 |
| Train accuracy | 0.6774 |

Estos resultados indican un rendimiento moderado, coherente con el solapamiento de las características entre clases. El recall alto sugiere que el modelo detecta la mayoría de los casos defectuosos, aunque la precisión es menor, lo que produce falsos positivos. El ROC-AUC de 0.7017 muestra una capacidad discriminativa limitada pero útil para ordenar por riesgo.

No se han publicado comparativas con otros modelos de mantenimiento predictivo en la información disponible.

## Requisitos de hardware

- Al ser un modelo clásico de scikit-learn, no requiere GPU. La inferencia se realiza en CPU con un coste mínimo.
- Memoria RAM necesaria: menos de 100 MB (el pipeline es pequeño).
- No es necesario hardware específico; cualquier servidor o PC con Python y scikit-learn puede ejecutarlo.
- Opciones de despliegue: se puede servir con FastAPI, Flask, o en un entorno de batch con joblib. No compatible con vLLM, llama.cpp o Ollama porque no es un modelo de lenguaje.
- Latencia: del orden de milisegundos por predicción en CPU estándar.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables dentro del mismo dominio (clasificación de mantenimiento de motores con 6 sensores). El propio autor no proporciona comparaciones con alternativas. Se podría comparar con otros clasificadores tabulares como Random Forest o XGBoost, pero no hay datos públicos de esos modelos para el mismo dataset. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo evalúa el estado actual del motor, no predice una fecha futura de fallo; no es un pronóstico de tiempo de vida útil.
- Las seis variables de sensores presentan un solapamiento considerable entre clases, lo que limita el rendimiento máximo alcanzable (ROC-AUC de 0.70).
- No se incluyen identificadores de motor ni marcas de tiempo en los datos de origen, lo que impide análisis temporales o de series.
- El modelo no debe usarse como sustituto de una inspección física de ingeniería; es una herramienta de triaje y apoyo a la decisión.
- El pipeline requiere el módulo `preprocessing.py` (que contiene `IQRCapper`) para poder cargar el archivo joblib. Sin ese módulo, la deserialización fallará.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías de rendimiento ni responsabilidad sobre decisiones basadas en el modelo.
- No se han publicado estudios de sesgos específicos, pero al ser un modelo tabular con datos sintéticos o de un dominio concreto, pueden existir sesgos en la representatividad de los datos (no se especifica el origen del dataset).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/imanandshah/engine-maintenance-classifier
- Dataset en HuggingFace: https://huggingface.co/datasets/imanandshah/engine-predictive-maintenance
- Streamlit Space (demo): https://huggingface.co/spaces/imanandshah/engine-maintenance-app
- Repositorio GitHub: https://github.com/imanandshah/engine-predictive-maintenance
