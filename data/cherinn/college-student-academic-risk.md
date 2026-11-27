# cherinn/college-student-academic-risk

## Resumen

College Student Academic Risk Classifier es un modelo de clasificación tabular basado en un árbol de decisión (Decision Tree) desarrollado por Cherin Jessica Kwa en el marco de un proyecto académico de la asignatura MN1135 Business Data Science del programa de Management de la Universitas Tarumanagara. El modelo predice el nivel de riesgo académico de estudiantes universitarios de nuevo ingreso en tres clases: High Risk, Medium Risk y Low Risk, a partir de variables académicas y de comportamiento en el campus virtual.

El modelo se distribuye como un artefacto serializado en formato joblib (junto con un escalador y una lista de nombres de características) y está pensado como componente de un sistema de alerta temprana (Early Warning System) para que tutores y gestores académicos puedan intervenir de forma proactiva. No es un modelo de lenguaje ni una red neuronal: es un clasificador clásico de machine learning sobre datos tabulares, entrenado con un dataset de Kaggle (College Student Management Dataset) compuesto por 1.545 registros.

Su relevancia es fundamentalmente metodológica y docente: sirve como ejemplo de pipeline completo de ciencia de datos (preprocesado, GridSearchCV con validación cruzada de 5 folds, evaluación por clase) y como caso de estudio de las trampas del sobreajuste a datos sintéticos. El propio autor advierte que la accuracy del 100% se debe a la naturaleza determinista del dataset y no a una capacidad predictiva real sobre estudiantes de carne y hueso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Árbol de decisión (scikit-learn DecisionTreeClassifier) |
| Parametros totales | no disponible (modelo no neuronal; hiperparámetros: criterion=gini, max_depth=5, min_samples_leaf=1, min_samples_split=2) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantizacion | no aplica (artefacto joblib; no se distribuyen pesos en GGUF ni safetensors) |
| Idiomas soportados | id (indonesio; etiquetas de clase y documentación en indonesio) |
| Licencia | MIT |
| Formato de pesos | joblib (model_academic_risk.joblib, scaler.joblib, feature_names.joblib) |

## Arquitectura y entrenamiento

El modelo es un árbol de decisión único entrenado con scikit-learn sobre el dataset College Student Management Dataset obtenido de Kaggle. Las variables de entrada documentadas incluyen student_id, age, gender, major, GPA, course_load, avg_course_grade, attendance_rate, enrollment_status, lms_logins_past_month, avg_session_duration_minutes, assignment_submission_rate, forum_participation_count y video_completion_rate; las variables numéricas se estandarizan con un escalador serializado aparte. La variable objetivo es risk_level con tres clases (High, Medium, Low).

El ajuste de hiperparámetros se realizó mediante GridSearchCV con validación cruzada de 5 folds, seleccionando criterion='gini', max_depth=5, min_samples_leaf=1 y min_samples_split=2. El conjunto de prueba corresponde al 20% de los 1.545 registros (309 muestras). No se documenta ningún proceso de regularización adicional, aumento de datos, ponderación de clases ni validación sobre datos externos. La innovación técnica es inexistente por diseño: se trata de un flujo estándar de clasificación supervisada, y el propio autor señala que el dataset parece generado por reglas deterministas binarias (por ejemplo, asistencia inferior al 75% implica High Risk), lo que explica la separabilidad perfecta.

## Capacidades

- Clasificación supervisada multiclase de riesgo académico en tres niveles (High, Medium, Low) a partir de un vector de 14 características tabulares.
- Predicción en tiempo real sobre registros individuales mediante un pipeline de inferencia en Python que carga el modelo, el escalador y el orden de columnas desde ficheros joblib.
- Integración en sistemas de información académica como servicio de scoring batch o por petición.
- Preprocesado reproducible: el escalador y la lista de características se distribuyen junto al modelo para garantizar la coherencia entre entrenamiento e inferencia.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni generación de texto: es exclusivamente un clasificador tabular.
- Capacidad multilingüe no aplicable; las etiquetas y la documentación están en indonesio.

## Casos de uso

- Sistema de alerta temprana en secretarías académicas: el modelo puntúa a cada estudiante de nuevo ingreso al cierre de cada parcial y genera una lista priorizada de alumnos en riesgo alto para que los tutores programen tutorías antes de que se materialice el abandono.
- Priorización de la carga de tutores: con una salida de tres clases y umbrales claros, el departamento puede asignar más horas de seguimiento a los estudiantes clasificados como High Risk y liberar recursos en los de bajo riesgo.
- Cuadro de mando para jefes de programa: agregando las predicciones por titulación, curso y asignatura se detectan cohortes con riesgo estructural y se justifican intervenciones curriculares.
- Prototipo docente y material de formación: el repositorio sirve como ejemplo reproducible de pipeline completo (carga, escalado, GridSearchCV, evaluación por clase) para asignaturas de ciencia de datos aplicada a educación.
- Auditoría de sesgo y calidad de datos educativos: al reproducir el experimento se puede demostrar empíricamente por qué un dataset sintético con reglas deterministas produce accuracy del 100% y por qué eso no valida un modelo para producción.
- Simulación de escenarios what-if en planificación académica: variando attendance_rate o GPA en el vector de entrada se observa cómo cambia la clase predicha, útil para diseñar políticas de asistencia mínima antes de desplegar nada real.
- Detección de estudiantes con baja actividad en el LMS: las variables lms_logins_past_month, avg_session_duration_minutes, assignment_submission_rate, forum_participation_count y video_completion_rate permiten identificar patrones de desenganche digital, siempre que se reentrene con datos propios.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de prueba (20% de 1.545 registros, 309 muestras):

| Metrica | Valor |
|---|---|
| Accuracy (test) | 100,00% (309/309) |
| F1-Score (macro) | 1,0000 |
| High Risk: precision / recall / F1 | 1,00 / 1,00 / 1,00 (161 muestras) |
| Medium Risk: precision / recall / F1 | 1,00 / 1,00 / 1,00 (91 muestras) |
| Low Risk: precision / recall / F1 | 1,00 / 1,00 / 1,00 (57 muestras) |

No se han publicado comparaciones con otros modelos en la información disponible. El autor atribuye explícitamente estos resultados a la naturaleza sintética y determinista del dataset, no a una capacidad predictiva generalizable.

## Requisitos de hardware

- VRAM: no aplica; el modelo es un árbol de decisión serializado en joblib de tamaño despreciable (el repositorio completo ocupa 0,0 GB).
- GPU: no requiere GPU; la inferencia y el reentrenamiento se ejecutan en CPU.
- Cabe en cualquier equipo consumer, incluidos portátiles de gama baja y entornos de CI/CD con recursos mínimos.
- Despliegue: Python con scikit-learn, pandas, numpy y joblib; se puede exponer mediante FastAPI, Flask o un script batch. No aplica vLLM, llama.cpp, Ollama ni TGI, que son runtimes para modelos neuronales.
- Latencia y throughput: no se han publicado mediciones; por la naturaleza del modelo (un árbol de profundidad 5) la latencia por predicción es del orden de microsegundos a milisegundos en CPU, aunque esta estimación no está documentada por el autor.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| College Student Academic Risk Classifier (cherinn) | Árbol de decisión tabular | No aplica (árbol de profundidad 5) | No aplica | Accuracy 100% en test sintético (no generalizable) | MIT | Hugging Face, joblib |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (clasificación de riesgo académico tabular) en la documentación proporcionada.

## Limitaciones y advertencias

- El dataset de origen está fuertemente indicado como sintético y generado por reglas deterministas binarias, sin valores atípicos ni datos faltantes; la accuracy del 100% es un artefacto de esa simplicidad y no evidencia capacidad predictiva real.
- Riesgo alto de sobreajuste a los patrones sintéticos: un árbol de profundidad 5 separa perfectamente clases que en datos reales se solapan.
- No recomendado para uso directo sobre estudiantes reales sin reentrenamiento con datos históricos auténticos de la institución correspondiente.
- Las relaciones reales entre asistencia, GPA y riesgo académico están mediadas por factores no incluidos en el dataset (situación financiera, salud mental, entorno social, adaptación cultural), lo que introduce sesgo por variable omitida.
- Posibles sesgos de representación y de medición en las variables codificadas (gender, major, enrollment_status) que el autor no analiza ni mitiga.
- El modelo no ha sido validado externamente, no tiene métricas en dominios distintos ni análisis de calibración de probabilidades.
- La licencia MIT permite uso comercial, pero la falta de garantías y la advertencia explícita del autor sobre la no idoneidad para producción trasladan todo el riesgo al integrador.
- La documentación y las etiquetas están en indonesio, lo que limita su reutilización directa en entornos hispanohablantes sin traducción y reetiquetado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cherinn/college-student-academic-risk
- Dataset de origen (Kaggle, College Student Management Dataset): no disponible como enlace directo en la información proporcionada (referenciado como `archive (21).zip` / `college_student_management_data.csv`)
- Paper, blog o repositorio adicional: no disponible
