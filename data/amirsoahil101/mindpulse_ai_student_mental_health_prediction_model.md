# amirsoahil101/MindPulse_AI_Student_Mental_Health_Prediction_Model

## Resumen

MindPulse AI es un modelo de regresión tabular desarrollado por Amir Sohail (usuario de Hugging Face `amirsoahil101`) para predecir un puntaje de salud mental de estudiantes a partir de hábitos diarios como horas de sueño, tiempo de estudio, uso de redes sociales y actividad física. El modelo forma parte de una aplicación web full-stack que combina un pipeline de scikit-learn con un backend FastAPI y un frontend HTML/JavaScript, desplegada en Render.

El modelo se basa en un Random Forest (aunque el repositorio también menciona una red neuronal artificial en Keras) y se presenta como una solución de producción con preprocesamiento automatizado mediante `ColumnTransformer` y validación de esquemas con Pydantic. Su relevancia radica en demostrar un flujo de trabajo completo de ingeniería de machine learning, desde el entrenamiento hasta el despliegue, más que en ser un modelo de gran escala. El tamaño del repositorio en Hugging Face es de 0.0 GB, lo que sugiere que los pesos no están alojados allí, sino en el repositorio de GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (scikit-learn) con pipeline de preprocesamiento; también se menciona una ANN en Keras en el repositorio |
| Parametros totales | no disponible (modelo de árboles, no aplica el concepto de parámetros de red neuronal) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo tabular, no procesa secuencias) |
| Tipos de cuantizacion | no disponible (no aplica a modelos de scikit-learn) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | joblib (pickle) según la serialización del pipeline; también se menciona un archivo `.pkl` para la ANN |

## Arquitectura y entrenamiento

El modelo es un Random Forest de scikit-learn integrado en un pipeline que incluye un `ColumnTransformer` para codificación de variables categóricas, escalado y tratamiento de valores atípicos. El autor evaluó también una regresión lineal y un Random Forest sin ajuste de hiperparámetros, optando finalmente por el Random Forest ajustado (tuned) con un R² de 0.8650 en test. El entrenamiento se realizó sobre un dataset de hábitos de estudiantes, aunque no se especifica el número de registros ni la composición exacta. No se menciona el uso de RLHF, DPO ni técnicas de aprendizaje profundo en el modelo final, aunque el repositorio incluye un archivo de una red neuronal en Keras que no aparece en la tabla de rendimiento.

El pipeline se serializa con `joblib` y se sirve a través de una API FastAPI con validación Pydantic. La innovación principal no está en la arquitectura del modelo, sino en el flujo de ingeniería: preprocesamiento sin fugas de datos, integración en pipelines y despliegue modular.

## Capacidades

- Predicción de un puntaje numérico de salud mental (regresión) a partir de características tabulares como edad, horas de estudio, nivel de estrés, uso de redes sociales, sueño y actividad física.
- Manejo de variables categóricas y numéricas mediante transformaciones automáticas dentro del pipeline.
- Inferencia rápida en CPU, adecuada para aplicaciones web en tiempo real.
- Validación de entrada de datos mediante esquemas Pydantic en el backend.
- No soporta generación de texto, tool calling, agentes, visión ni procesamiento de lenguaje natural.

## Casos de uso

- Evaluación de bienestar estudiantil en instituciones educativas: el modelo puede integrarse en portales de estudiantes para que estos introduzcan sus hábitos diarios y reciban un puntaje de salud mental, ayudando a identificar posibles problemas de forma temprana.
- Aplicaciones de autocuidado digital: una app móvil o web que permita a los usuarios hacer un seguimiento de su bienestar a lo largo del tiempo, mostrando la evolución del puntaje y alertando sobre caídas significativas.
- Herramientas de orientación psicológica: los consejeros pueden usar el puntaje como un indicador adicional en sus evaluaciones, combinándolo con entrevistas clínicas.
- Investigación en salud pública: análisis de correlaciones entre hábitos y salud mental en poblaciones estudiantiles, utilizando el modelo como base para estudios más amplios.
- Demostración de pipelines de ML en producción: sirve como ejemplo didáctico de cómo desplegar un modelo de scikit-learn con FastAPI, Pydantic y un frontend personalizado.
- Detección de factores de riesgo en entornos universitarios: el modelo puede identificar patrones de alto riesgo (poco sueño, mucho tiempo en redes sociales) y generar recomendaciones automáticas.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la model card (no verificados de forma independiente):

| Modelo | R² (test) | R² (train) | MAE | RMSE |
|---|---|---|---|---|
| Regresión lineal | 0.7397 | 0.7236 | 0.5361 | 0.6760 |
| Random Forest (por defecto) | 0.8775 | 0.9808 | 0.3472 | 0.4636 |
| Random Forest (ajustado) | 0.8650 | 0.9547 | 0.3689 | 0.4869 |

El model-index de Hugging Face reporta un R² de 0.86, que coincide con el Random Forest ajustado. No se proporcionan comparaciones con otros modelos similares en la misma tarea.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un Random Forest de tamaño pequeño, por lo que no requiere GPU. Cualquier procesador moderno puede ejecutar predicciones en milisegundos.
- Memoria RAM: menos de 1 GB para cargar el pipeline serializado.
- GPU: no necesaria.
- Despliegue: compatible con servidores ligeros (Render, Heroku, AWS EC2 t2.micro) y entornos locales.
- Opciones de integración: API FastAPI, scripts Python, o exportación a ONNX si se requiere mayor portabilidad (no documentado por el autor).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea (predicción de salud mental a partir de hábitos tabulares) dentro de la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo se entrenó con un dataset específico de estudiantes, por lo que su generalización a otras poblaciones (adultos, otros países) puede ser limitada.
- No se especifica el tamaño del dataset ni su procedencia, lo que dificulta evaluar posibles sesgos demográficos o culturales.
- El R² de 0.86 indica que el modelo explica el 86 % de la varianza, pero aún hay un 14 % de error no explicado; no debe usarse como diagnóstico clínico.
- La model card menciona un archivo de red neuronal en Keras que no aparece en la tabla de rendimiento, lo que genera ambigüedad sobre cuál es el modelo final desplegado.
- No hay evidencia de validación externa ni de pruebas de robustez ante datos adversariales o valores atípicos.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre la precisión o idoneidad del modelo para aplicaciones médicas.
- El repositorio en Hugging Face tiene 0 descargas y 0 likes, lo que sugiere que el modelo no ha sido ampliamente evaluado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/amirsoahil101/MindPulse_AI_Student_Mental_Health_Prediction_Model
- Repositorio GitHub: https://github.com/amirsohail100/MindPulse-AI-Student-Mental-Health-Prediction-Web-App
- Demo en vivo (Render): https://mindpulse-ai-student-mental-health-i9vu.onrender.com
- Perfil del autor en Hugging Face: https://huggingface.co/amirsoahil101
