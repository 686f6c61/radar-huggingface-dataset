# Leviana679/hr-employee-attrition-predictor

## Resumen

`hr-employee-attrition-predictor` es un clasificador tabular binario publicado por el usuario Leviana679 en Hugging Face. No es un modelo de lenguaje ni una red neuronal profunda: se distribuye como artefactos `joblib` (presumiblemente un estimador de scikit-learn junto con un escalador y una lista de nombres de características) y su tarea es predecir si un empleado abandonara la empresa (clase 1) o permanecera en ella (clase 0). El problema que aborda es la prediccion de rotacion de personal (*attrition*) para que los equipos de recursos humanos puedan disenar estrategias de retencion proactivas.

El modelo se entrena exclusivamente sobre el dataset publico *IBM HR Analytics Employee Attrition & Performance*, disponible en Kaggle, que contiene 1.470 filas de empleados ficticios de IBM con 35 columnas originales. De ahi se derivan 23 caracteristicas numericas estandarizadas y 7 categoricas o binarias (genero, horas extra, viajes de trabajo, departamento, area de formacion, rol y estado civil). El repositorio ocupa 0.0 GB, lo que confirma que se trata de un artefacto ligero, no de pesos de red neuronal.

Su relevancia es limitada y muy acotada: sirve como ejemplo didactico de pipeline de clasificacion tabular y como demostracion de un caso de uso de RR. HH., pero sus metricas de validacion (recall del 2,04 % y F1 del 3,84 % sobre la clase positiva) lo inhabilitan para cualquier decision real sobre personas. Es importante subrayar que, pese a las etiquetas `tabular` y `classification`, no debe confundirse con un modelo generativo ni evaluarse con los criterios habituales de los LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (artefacto `joblib`; por la presencia de `scaler` y `feature_names` se infiere un estimador clasico de scikit-learn, sin confirmar) |
| Parametros totales | No disponible (no es una red neuronal; el numero de parametros no aplica) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (entrada tabular de 30 caracteristicas por fila) |
| Tipos de cuantizacion | No disponible (no aplica; el artefacto se serializa con `joblib`) |
| Idiomas soportados | `id` (indonesio), segun la etiqueta del repositorio; las caracteristicas son valores numericos y categoricos, no texto libre |
| Licencia | MIT |
| Formato de pesos | `joblib` (artefactos: modelo, `scaler.joblib`, `feature_names.joblib`) |

## Arquitectura y entrenamiento

La informacion disponible no especifica el algoritmo concreto (regresion logistica, random forest, gradient boosting, etc.). Lo que si se documenta es el pipeline: estandarizacion de las 23 variables numericas mediante un escalador persistido aparte, codificacion de las 7 variables categoricas o binarias, y ajuste de pesos de clase para compensar el fuerte desbalance del dataset (la rotacion en el conjunto de IBM ronda el 16 %). Ese ajuste de pesos explica el comportamiento observado en test: el modelo prioriza la clase mayoritaria y apenas detecta positivos.

El entrenamiento se realizo sobre las 1.470 filas del dataset de IBM, sin que se indique el numero de tokens (no aplica), la division train/test ni si hubo validacion cruzada. No se menciona ningun tipo de refinamiento posterior (RLHF, DPO) ni innovacion tecnica alguna; es un ajuste supervisado convencional sobre datos tabulares sinteticos.

## Capacidades

- Clasificacion binaria tabular: predice rotacion (si/no) a partir de 30 caracteristicas de empleado.
- Entrada estructurada: requiere un `DataFrame` con las columnas exactas documentadas y el escalador asociado para las numericas.
- Salida de probabilidad o etiqueta, segun el estimador subyacente (no confirmado en la model card).
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin capacidades multilingues en sentido estricto: no procesa texto libre, solo valores categoricos fijos.
- Sin modo de razonamiento, vision ni audio.

## Casos de uso

- Prototipado docente de pipelines de clasificacion tabular: sirve para ilustrar el flujo completo (carga de `joblib`, escalado, prediccion) en cursos de ciencia de datos, dado su tamano minimo y su licencia MIT.
- Demostracion de sesgo por desbalance de clases: el contraste entre accuracy (82,99 %) y recall (2,04 %) es un ejemplo de manual para explicar por que la exactitud engana con clases desbalanceadas.
- Prueba de integracion de artefactos `joblib` en un servicio interno: permite validar el empaquetado y la carga de modelos serializados en un backend antes de sustituirlos por un modelo real.
- Generacion de cuadros de mando sinteticos: alimentar un panel de RR. HH. de demostracion con predicciones sobre datos ficticios de IBM, sin exponer datos de empleados reales.
- Comparacion de tecnicas de reequilibrado: usar sus metricas como linea base frente a variantes con SMOTE, `class_weight` distinto o umbrales ajustados.
- Analisis de asociacion de variables: inspeccionar que caracteristicas (horas extra, satisfaccion, anos en el puesto) pesan mas en la prediccion, siempre como ejercicio exploratorio y nunca como diagnostico causal.

## Benchmarks y rendimiento

Metricas reportadas por el autor sobre el conjunto de prueba:

| Metrica | Valor |
|---|---|
| Accuracy | 82,99 % |
| Precision | 33,33 % |
| Recall (sensibilidad) | 2,04 % |
| F1-score | 3,84 % |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el artefacto es un modelo tabular serializado que se ejecuta en CPU.
- GPU: no necesaria; cualquier CPU moderna es suficiente.
- Cabe en cualquier equipo, incluidos portatiles de gama baja y entornos serverless con poca memoria.
- Despliegue: carga directa con `joblib` en Python; integrable en FastAPI, Flask, un script por lotes o un notebook. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del estimador se espera un coste por inferencia del orden de microsegundos a milisegundos, pero no hay medicion publicada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos de rotacion de personal con los que comparar parametros, contexto, rendimiento o licencia. Como referencia cualitativa, cualquier modelo de gradient boosting (XGBoost, LightGBM) entrenado sobre el mismo dataset de IBM suele superar ampliamente el recall reportado aqui, pero no se dispone de cifras verificadas en esta ficha.

## Limitaciones y advertencias

- Recall del 2,04 %: el modelo practicamente no detecta empleados que se van; inutil para retencion real.
- Precision del 33,33 %: dos de cada tres alertas de rotacion son falsos positivos, segun reconoce el propio autor.
- Entrenado sobre 1.470 filas ficticias de IBM; no generaliza a otras empresas, paises ni demografias.
- El autor advierte de que las correlaciones son asociativas, no causales, y que el modelo solo es optimo en demografias similares a la del conjunto de entrenamiento.
- Riesgo de sesgo por variables sensibles (genero, estado civil, edad) presentes como caracteristicas de entrada; su uso en decisiones laborales puede vulnerar normativas de proteccion de datos y de no discriminacion.
- No es un modelo de lenguaje: no procesa texto libre, no responde preguntas y no admite prompts.
- Licencia MIT: permite uso comercial y modificacion, pero la licencia no exime del cumplimiento normativo en materia de decision automatizada sobre personas.
- No debe desplegarse en produccion para decisiones de RR. HH. sin reentrenamiento, validacion externa y supervision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Leviana679/hr-employee-attrition-predictor
- Dataset de origen (Kaggle): https://www.kaggle.com/datasets/pavansubhasht/ibm-hr-analytics-attrition-dataset
