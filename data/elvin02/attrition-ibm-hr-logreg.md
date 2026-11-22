# elvin02/attrition-ibm-hr-logreg

## Resumen

`elvin02/attrition-ibm-hr-logreg` no es un modelo de lenguaje ni una red neuronal profunda: es un clasificador binario de regresión logística serializado con Joblib, entrenado sobre el dataset público IBM HR Analytics Employee Attrition. Su propósito es estimar la probabilidad de que un empleado abandone la empresa (attrition) a partir de 33 variables de recursos humanos (25 numéricas y 8 categóricas). El repositorio lo publica el usuario `elvin02` y se acompaña de una aplicación Gradio (`app.py`) que expone un formulario de entrada y devuelve la probabilidad predicha.

El modelo resuelve un problema clásico de analítica de RR. HH. con un enfoque de aprendizaje supervisado tabular muy ligero: pipeline de `StandardScaler` sobre 15 variables numéricas y codificación de las 8 categóricas, dando como resultado 46 features de entrada al estimador. El conjunto de entrenamiento tiene solo 1470 registros, lo que sitúa al modelo en la categoría de prototipos o demos docentes más que en la de herramienta lista para producción.

Su relevancia actual es limitada como modelo, pero resulta útil como referencia didáctica de un pipeline completo de clasificación tabular con desbalanceo de clases (el target de attrition está fuertemente desbalanceado, lo que explica el recall de 0,0426). No hay información de arquitectura transformer, contexto, idiomas ni licencia en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (clasificador lineal binario, scikit-learn) |
| Parametros totales | no disponible (coeficientes de un modelo lineal sobre 46 features; el numero exacto no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; entrada de 33 variables) |
| Tipos de cuantizacion | no disponible (pesos en Joblib, no cuantizables como un LLM) |
| Idiomas soportados | no disponible (la model card esta en indonesio; el modelo no procesa texto libre) |
| Licencia | no disponible |
| Formato de pesos | Joblib (`model_saya.joblib`, `scaler.joblib`, `feature_names.joblib`, `metadata.joblib`) |

## Arquitectura y entrenamiento

El estimador es una regresión logística de scikit-learn (versión 1.6.1) entrenada sobre el dataset IBM HR Analytics Employee Attrition, con 1470 muestras, 33 features brutas (25 numéricas y 8 categóricas) y 46 features tras el encoding. El preprocesado incluye un `StandardScaler` ajustado sobre 15 variables numéricas; el resto de variables numéricas y las categóricas se transforman según la metadata serializada en `metadata.joblib`. No se documenta regularización (L1/L2), valor de `C`, solver, balanceo de clases ni estrategia de validación.

No hay información sobre partición train/test, semilla, número de épocas (no aplica) ni técnicas de calibración. La única información de evaluación son las métricas reportadas en la model card, que sugieren un modelo con un sesgo muy fuerte hacia la clase mayoritaria (no-attrition): accuracy 0,8435 pero recall 0,0426 y F1 0,0800. No se menciona uso de `class_weight`, sobremuestreo (SMOTE) ni ajuste de umbral, lo que explicaría ese comportamiento.

## Capacidades

- Clasificación binaria tabular: predice probabilidad de attrition a partir de 33 campos de RR. HH. (edad, departamento, rol, ingresos, años en la empresa, satisfacción, etc.).
- Preprocesado integrado: escalado con `StandardScaler` y encoding de categóricas según la metadata del autor.
- Interfaz de demostración: aplicación Gradio (`app.py`) con formulario de entrada y salida de probabilidad.
- Serialización portable: artefactos Joblib cargables con scikit-learn 1.6.1.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes.
- No es multilingüe en el sentido de un LLM: solo consume variables estructuradas.
- No dispone de modo "thinking" ni capacidades especiales más allá de la inferencia lineal.

## Casos de uso

- Prototipo docente de pipeline tabular: sirve para ilustrar en un curso el flujo completo (carga de CSV, encoding, escalado, entrenamiento, serialización y despliegue con Gradio) sin depender de infraestructura de GPU.
- Demo de predicción de attrition en RR. HH.: un analista puede introducir los 33 campos de un empleado y obtener una probabilidad orientativa, útil para validar la viabilidad de un caso de uso antes de invertir en un modelo más robusto.
- Baseline para comparación de modelos: dado su bajo coste computacional, se puede usar como referencia mínima frente a gradient boosting (XGBoost, LightGBM) o regresión logística con `class_weight='balanced'` en experiments de RR. HH.
- Prueba de integración de artefactos Joblib: permite verificar que un servicio Python (FastAPI, Flask) carga correctamente `model_saya.joblib`, `scaler.joblib` y `feature_names.joblib` y respeta el orden de las 46 features.
- Ejercicio de análisis de desbalanceo: el contraste entre accuracy (0,8435) y recall (0,0426) es un caso práctico para discutir por qué la accuracy no es una métrica adecuada en clases desbalanceadas.
- Simulación de escenarios "what-if": modificando variables como horas extra, años en el puesto o nivel salarial, se puede observar cómo cambia la probabilidad estimada, siempre con carácter exploratorio y no prescriptivo.

## Benchmarks y rendimiento

Métricas reportadas por el autor en la model card (no se indica el conjunto de evaluación ni el umbral de decisión):

| Metrica | Valor |
|---|---:|
| Accuracy | 0,8435 |
| Precision | 0,6667 |
| Recall | 0,0426 |
| F1-score | 0,0800 |
| ROC-AUC | 0,6295 |

No se han publicado resultados comparativos con otros modelos en la información disponible. El ROC-AUC de 0,6295 indica una capacidad discriminativa baja, apenas por encima del azar (0,5).

## Requisitos de hardware

- VRAM: no aplica; es un modelo lineal en CPU, con artefactos Joblib de tamaño despreciable (repo de 0,0 GB).
- GPU: no necesaria. Cualquier CPU moderna ejecuta la inferencia en microsegundos.
- Cabe en cualquier equipo, incluidos portátiles de gama baja y entornos sin GPU.
- Despliegue: scikit-learn 1.6.1 + Joblib en un script Python, servicio FastAPI/Flask o la app Gradio incluida. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a LLM.
- Latencia y throughput: no publicados; por la naturaleza del modelo (46 features, producto escalar) se espera latencia de milisegundos o inferior por petición en CPU, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `elvin02/attrition-ibm-hr-logreg` | Regresion logistica tabular | no disponible | no aplica | ROC-AUC 0,6295; recall 0,0426 | no disponible | Hugging Face (repo Joblib) |
| Regresion logistica con `class_weight='balanced'` (baseline propio) | Regresion logistica tabular | no disponible | no aplica | No disponible (depende del entrenamiento) | scikit-learn: BSD-3 | Implementacion propia con scikit-learn |
| XGBoost / LightGBM sobre el mismo dataset | Gradient boosting tabular | no disponible | no aplica | No disponible en esta ficha | Apache 2.0 / MIT | Librerias publicas |
| Modelos de attrition comerciales (p. ej. plataformas de people analytics) | Propietarios | no disponible | no aplica | No disponible | Propietaria | Comercial |

No se dispone de comparativas publicadas con métricas homogéneas para este modelo concreto; las alternativas se citan por categoría, no por resultados medidos en el mismo split.

## Limitaciones y advertencias

- Desbalanceo severo: recall de 0,0426 significa que el modelo detecta menos del 5 % de los empleados que realmente abandonan; inutil para alertas tempranas en producción.
- ROC-AUC de 0,6295: capacidad discriminativa muy baja; apenas supera una asignación aleatoria.
- Sin información de partición train/test ni de umbral: las métricas pueden estar calculadas sobre el propio conjunto de entrenamiento o con un umbral no documentado.
- Dataset pequeño (1470 registros) y probablemente sintético o anonimizado por IBM; el modelo puede no generalizar a otras organizaciones, sectores o países.
- Riesgo de sesgo: variables como edad, género, estado civil o nivel educativo pueden inducir discriminación si se usa para decisiones laborales; no se documenta auditoría de equidad.
- Licencia no especificada: no se puede garantizar el uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- Model card en indonesio y sin documentación de hiperparámetros, semilla ni versión exacta del dataset: reproducibilidad limitada.
- No apto para decisiones automatizadas de RR. HH. sin supervisión humana; úsese solo como material didáctico o exploratorio.
- No procesa texto libre ni lenguaje natural; cualquier uso conversacional requeriría un LLM externo que estructure las entradas.

## Enlaces

- Hugging Face: https://huggingface.co/elvin02/attrition-ibm-hr-logreg
- Dataset IBM HR Analytics Employee Attrition (referencia del autor, sin URL directa en la model card): no disponible
- Repositorio o paper del modelo: no disponible
- Demo Gradio: no disponible como URL pública (solo se menciona `app.py` en el repo)
