# amirsoahil101/Student_sleep_mental_health_2026

## Resumen

El modelo `amirsoahil101/Student_sleep_mental_health_2026` es un clasificador de machine learning tradicional, desarrollado por el autor Amir Sohail, que predice resultados de salud mental en estudiantes a partir de variables de sueño y factores de estilo de vida. No se trata de un modelo de lenguaje grande ni de un sistema generativo, sino de un pipeline de clasificación tabular basado en XGBoost, con una interfaz web construida con Streamlit para realizar predicciones en tiempo real. El proyecto incluye un análisis exploratorio de datos, ajuste de hiperparámetros mediante validación cruzada de 5 pliegues y artefactos serializados para despliegue (`model.pkl`, `scaler.pkl`, `columns.pkl`).

La relevancia de este modelo radica en su aplicación práctica para el ámbito educativo y de salud pública: permite estimar de forma automatizada el estado de salud mental de estudiantes a partir de datos de sueño y hábitos, lo que puede servir como herramienta de cribado temprano. Según la información disponible, alcanza una precisión de aproximadamente el 82,34 % en la métrica de evaluación interna, con una desviación estándar de 0,0069 entre pliegues, lo que sugiere estabilidad. El repositorio incluye una aplicación Streamlit desplegable y un cuaderno Jupyter con el proceso completo de modelado.

Cabe destacar que la ficha de HuggingFace presenta una inconsistencia: la descripción corta menciona "regression model predicting medical insurance charges", mientras que el título y el contenido describen un problema de clasificación de salud mental. Esta discrepancia debe tenerse en cuenta al evaluar el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XGBoost (gradient boosting sobre arboles de decision) |
| Parametros totales | no disponible (modelo de arboles, no red neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (modelo tabular, no procesa secuencias) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (modelo tabular, no linguistico) |
| Licencia | MIT |
| Formato de pesos | model.pkl (Pickle) |

## Arquitectura y entrenamiento

El modelo emplea XGBoost, una implementacion eficiente de gradient boosting sobre arboles de decision. Se evaluaron multiples algoritmos (se menciona tambien regresion logistica) y se aplico busqueda de hiperparametros mediante Grid Search o Randomized Search sobre 5 pliegues de validacion cruzada. Los parametros optimizados incluyen `colsample_bytree`, `subsample`, `reg_lambda` y `reg_alpha`. El mejor resultado medio en validacion cruzada fue de 0,823383 (82,34 %) con una desviacion estandar de 0,006858, indicando baja varianza entre pliegues.

Los datos de entrenamiento provienen de un dataset propio (`student_sleep_mental_health_2026.csv`) que contiene metricas de sueno, habitos de vida y resultados de salud mental. No se especifica el numero de registros ni la composicion detallada de las variables. El preprocesado incluye escalado con `StandardScaler` y la serializacion del esquema de columnas (`columns.pkl`) para garantizar la alineacion de caracteristicas en inferencia. No se menciona el uso de tecnicas como RLHF o DPO, ya que no es un modelo generativo.

## Capacidades

- Clasificacion de resultados de salud mental en estudiantes a partir de variables numericas (patrones de sueno, habitos, etc.).
- Prediccion en tiempo real mediante una aplicacion Streamlit que acepta entradas del usuario y devuelve una puntuacion o categoria de salud mental.
- Manejo de datos tabulares con preprocesado estandarizado (escalado de caracteristicas).
- Despliegue listo para produccion gracias a artefactos serializados (`model.pkl`, `scaler.pkl`, `columns.pkl`).
- No soporta procesamiento de lenguaje natural, vision, audio ni generacion de texto.
- No incluye capacidades de tool calling ni razonamiento multi-paso.

## Casos de uso

- Cribado temprano de problemas de salud mental en entornos universitarios: el modelo puede integrarse en plataformas de bienestar estudiantil para identificar alumnos en riesgo a partir de encuestas de sueno y estilo de vida, permitiendo intervenciones preventivas.
- Herramienta de autoevaluacion para estudiantes: mediante la aplicacion Streamlit, un estudiante puede introducir sus datos de sueno y habitos y recibir una estimacion de su estado de salud mental, fomentando la concienciacion y la busqueda de ayuda.
- Investigacion en salud publica: los investigadores pueden utilizar el modelo para analizar correlaciones entre variables de sueno y salud mental en poblaciones estudiantiles, sirviendo como base para estudios mas amplios.
- Sistema de alerta en servicios de consejeria psicologica: los orientadores pueden usar el modelo como apoyo para priorizar casos segun la probabilidad de riesgo, complementando la evaluacion clinica.
- Demo educativa de machine learning: el proyecto completo (notebook, pipeline y app) sirve como ejemplo didactico de clasificacion tabular, validacion cruzada y despliegue con Streamlit en cursos de ciencia de datos.
- Integracion en aplicaciones de seguimiento de habitos: el modelo puede incorporarse en apps de bienestar que recopilen datos de sueno, ofreciendo una capa de analisis predictivo sobre el impacto en la salud mental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. El unico dato reportado es la precision media interna de validacion cruzada de 0,823383 (82,34 %) con una desviacion estandar de 0,006858, obtenida durante el ajuste de hiperparametros de XGBoost. No se proporcionan metricas adicionales como precision, recall, F1 o AUC, ni comparaciones con otros algoritmos o modelos de referencia.

## Requisitos de hardware

- El modelo es extremadamente ligero al tratarse de un ensemble de arboles (XGBoost). No requiere GPU para inferencia; una CPU estandar es suficiente.
- Memoria RAM estimada: menos de 1 GB para cargar el modelo y los artefactos asociados (model.pkl, scaler.pkl, columns.pkl).
- GPU recomendada: ninguna. El modelo puede ejecutarse en cualquier maquina, incluyendo Raspberry Pi o entornos cloud de bajo coste.
- Compatible con cualquier sistema operativo que soporte Python y las librerias necesarias (xgboost, scikit-learn, streamlit).
- Opciones de despliegue: aplicacion Streamlit local o en la nube (Streamlit Community Cloud, Heroku, etc.), o como API con Flask/FastAPI.
- Latencia de inferencia: del orden de milisegundos por prediccion, incluso en CPU, al tratarse de un modelo de arboles con pocas caracteristicas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria. El autor menciona que se evaluaron multiples algoritmos (incluyendo regresion logistica) durante el desarrollo, pero no se publican resultados detallados de esos experimentos. Por tanto, la comparativa con alternativas como Random Forest, SVM o redes neuronales tabulares no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos potenciales: el dataset no esta documentado en cuanto a demografia, tamano o procedencia. Podria contener sesgos de seleccion o de representacion que afecten a la generalizacion fuera de la poblacion estudiada.
- Riesgo de alucinacion: no aplica, al ser un modelo tabular y no generativo. Sin embargo, puede producir predicciones erroneas si las caracteristicas de entrada estan fuera del rango de entrenamiento.
- Limitaciones de contexto: el modelo solo acepta las variables numericas definidas en `columns.pkl`. No procesa texto libre ni datos no estructurados.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificacion sin restricciones, siempre que se incluya el aviso de copyright.
- Inconsistencia en la documentacion: la descripcion corta de HuggingFace menciona "regression model predicting medical insurance charges", lo que contradice el titulo y el contenido del proyecto (clasificacion de salud mental). Esto puede indicar un error de copia o un modelo mal etiquetado; se recomienda verificar la naturaleza real del modelo antes de usarlo en produccion.
- El enlace a la aplicacion Streamlit en la model card es un placeholder (`https://your-streamlit-app-link.streamlit.app`), por lo que la demo en vivo no esta accesible.
- No se proporcionan metadatos sobre el rendimiento en datos de prueba independientes, solo en validacion cruzada. El sobreajuste no puede descartarse por completo.

## Enlaces

- HuggingFace: https://huggingface.co/amirsoahil101/Student_sleep_mental_health_2026
- Repositorio de GitHub (mencionado en la model card): https://github.com/amirsohail100/Student-Sleep-Mental-Health-Prediction
- Perfil del autor en HuggingFace: https://huggingface.co/amirsoahil101
