# abdalla732/heart_failure_prediction

## Resumen

`abdalla732/heart_failure_prediction` es un modelo de clasificacion binaria sobre datos tabulares desarrollado por Abdallah Ahmed (usuario `abdalla732`) y publicado en HuggingFace. Predice la presencia de enfermedad cardiaca en pacientes a partir de 11 caracteristicas clinicas y demograficas (edad, sexo, tipo de dolor toracico, presion arterial en reposo, colesterol, glucemia en ayunas, ECG en reposo, frecuencia cardiaca maxima, angina inducida por ejercicio, Oldpeak y pendiente del segmento ST). No es un modelo de lenguaje: es una red neuronal densa implementada en Keras 3 / TensorFlow 2.x, orientada a clasificacion tabular.

El repositorio incluye tres artefactos: el modelo entrenado (`heart_model.keras`), un `StandardScaler` ajustado sobre los datos de entrenamiento (`scaler.joblib`) y la lista de nombres de columnas resultantes del one-hot encoding (`feature_columns.joblib`). El modelo se entreno sobre el dataset publico `fedesoriano/heart-failure-prediction` y declara metricas de accuracy, precision, recall y F1, aunque no se publican sus valores numericos.

Su relevancia es limitada y de ambito educativo: el propio autor lo restringe explicitamente a fines educativos y de investigacion, y advierte de que no es un dispositivo medico ni ha sido validado en poblaciones hospitalarias reales. Con 0 descargas y 1 like en el momento de la consulta, se trata de una publicacion de bajo perfil, sin benchmarks publicados y sin informacion sobre arquitectura interna, numero de parametros o proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward (Keras 3 / TensorFlow 2.x) para clasificacion binaria tabular; numero de capas y unidades no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular; entrada de 11 caracteristicas clinicas, expandidas mediante one-hot encoding) |
| Tipos de cuantizacion | no disponible (se distribuye en formato `.keras`; no se declara el tipo de dato de los pesos) |
| Idiomas soportados | no disponible (no procesa texto libre; las entradas son variables categoricas y numericas codificadas) |
| Licencia | MIT |
| Formato de pesos | `.keras` (modelo) + `.joblib` (scaler y columnas de caracteristicas) |

## Arquitectura y entrenamiento

La model card describe el modelo unicamente como una red neuronal Keras / TensorFlow para clasificacion binaria sobre datos tabulares. No se especifica el numero de capas, el numero de neuronas por capa, las funciones de activacion, la presencia de dropout o normalizacion por lotes, ni el optimizador, la funcion de perdida o el numero de epocas empleados. Tampoco se indica el tamano del conjunto de entrenamiento, validacion y prueba, ni si se aplico alguna tecnica de regularizacion o busqueda de hiperparametros. Toda esa informacion figura como no disponible.

El pipeline de preprocesado si queda documentado a traves de los artefactos publicados: las variables categoricas se codifican con `pandas.get_dummies`, se reindexan contra la lista guardada en `feature_columns.joblib` para garantizar la coherencia dimensional y, a continuacion, se escalan con el `StandardScaler` serializado en `scaler.joblib`. El ejemplo de uso de la model card aplica ese mismo orden (dummies, reindexado, escalado) antes de llamar a `model.predict`, lo que sugiere que cualquier inferencia debe replicar exactamente ese pipeline para no degradar el resultado. La salida es una probabilidad unica, con umbral de decision fijado en 0,5 en el ejemplo proporcionado.

No se menciona el uso de RLHF, DPO ni tecnicas equivalentes, algo por otro lado esperable en un clasificador tabular. El dataset de entrenamiento es `fedesoriano/heart-failure-prediction`, un conjunto publico ampliamente utilizado en ejercicios de clasificacion binaria sobre riesgo cardiovascular.

## Capacidades

- Clasificacion binaria tabular: devuelve una probabilidad de presencia de enfermedad cardiaca a partir de 11 variables clinicas y demograficas.
- Codificacion de variables categoricas: el pipeline asociado maneja variables como `Sex`, `ChestPainType`, `RestingECG`, `ExerciseAngina` y `ST_Slope` mediante one-hot encoding.
- Escalado consistente en produccion: el `StandardScaler` serializado permite aplicar la misma transformacion que en entrenamiento.
- Reindexado robusto de caracteristicas: `feature_columns.joblib` permite alinear entradas con valores ausentes o columnas en distinto orden.
- Inferencia por lotes: al ser un modelo Keras, acepta matrices de entrada con multiples filas en una sola llamada a `predict`.
- Generacion de texto, razonamiento, codigo, matematicas, vision, audio: no soportado.
- Tool calling / function calling: no soportado.
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Material docente en cursos de machine learning aplicado a salud: el repositorio incluye modelo, scaler y lista de columnas, lo que permite al alumnado reproducir el ciclo completo de preprocesado, entrenamiento e inferencia sin depender de ficheros externos.
- Linea base para benchmarking interno de modelos tabulares: sirve como referencia neuronal frente a alternativas clasicas como regresion logistica, XGBoost o LightGBM sobre el mismo dataset `fedesoriano/heart-failure-prediction`.
- Reproducibilidad de experimentos academicos: al publicar los tres artefactos necesarios, otro investigador puede replicar exactamente las predicciones sobre el mismo conjunto de datos y verificar la coherencia del pipeline.
- Demo interactiva de visualizacion de riesgo cardiovascular: integrable en una interfaz Streamlit o Gradio donde el usuario introduce valores clinicos y observa la probabilidad devuelta, siempre con fines divulgativos y acompanada de un aviso explicito de no uso clinico.
- Validacion de pipelines de preprocesado en MLOps: el par `scaler.joblib` + `feature_columns.joblib` es util para probar mecanismos de versionado de artefactos, empaquetado de modelos y comprobacion de deriva de datos en entornos de prueba.
- Ejercicio de analisis de sensibilidad: permite experimentar como varia la probabilidad predicha al modificar variables concretas (`Oldpeak`, `MaxHR`, `Cholesterol`), util para discutir interpretabilidad en modelos tabulares.
- Pruebas de integracion de Keras 3 con TensorFlow 2.x: valido como caso minimo para verificar rutas de carga de modelos `.keras` en distintos entornos de ejecucion.
- Prototipado de triaje exploratorio en investigacion clinica: exclusivamente como ejercicio metodologico previo a un estudio con validacion externa; en ningun caso como herramienta de decision clinica.

## Benchmarks y rendimiento

La model card declara el uso de las metricas accuracy, precision, recall y F1, pero no publica ningun valor numerico para ninguna de ellas. Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo (los enlaces devueltos corresponden a paginas de descarga de la aplicacion de Bing, sin relacion con el modelo).

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica el numero de parametros ni el tamano de las capas, por lo que no puede calcularse una cifra fiable.
- GPU recomendadas: no disponible. Por el tipo de tarea (clasificacion tabular sobre 11 caracteristicas) y el tamano del repositorio (0,0 GB reportados por HuggingFace), la inferencia es previsiblemente viable en CPU, pero esta afirmacion no puede confirmarse con los datos publicados.
- Compatibilidad con GPU de consumo: no confirmada. No hay informacion sobre requisitos de memoria ni sobre si el modelo se ha probado en GPU.
- Opciones de despliegue: carga directa con `keras.models.load_model` sobre TensorFlow 2.x, tal como muestra la model card. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni ONNX Runtime, herramientas orientadas a modelos de lenguaje o a formatos distintos del `.keras`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han publicado datos de rendimiento del modelo, por lo que la comparacion se limita a caracteristicas estructurales y de licencia. Las alternativas indicadas son familias genericas de modelos aplicables al mismo dataset, no implementaciones concretas publicadas en HuggingFace.

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `abdalla732/heart_failure_prediction` | Red neuronal Keras (clasificacion tabular) | no disponible | no aplica | no disponible | MIT | HuggingFace (`abdalla732/heart_failure_prediction`) |
| Regresion logistica sobre el mismo dataset | Modelo lineal | no disponible | no aplica | no disponible | depende de la implementacion | Requiere entrenamiento propio |
| XGBoost / LightGBM sobre el mismo dataset | Ensemble de arboles | no disponible | no aplica | no disponible | Apache 2.0 (librerias) | Requiere entrenamiento propio |
| Modelos tabulares de referencia en la literatura sobre `fedesoriano/heart-failure-prediction` | Diversos | no disponible | no aplica | no disponible | diversa | Publicaciones academicas y notebooks publicos |

## Limitaciones y advertencias

- No es un dispositivo medico. La propia model card lo declara explicitamente fuera de alcance para decisiones clinicas reales.
- Ausencia de validacion externa: el modelo no ha sido validado en poblaciones hospitalarias reales; su comportamiento sobre datos distintos de los de entrenamiento es desconocido.
- Sesgos potenciales: el dataset de origen es una muestra concreta, con una distribucion demografica y geografica determinada. No se documenta ningun analisis de sesgo por sexo, edad o etnia, ni estrategias de mitigacion.
- Riesgo de sobreajuste no evaluado: al no publicarse el tamano de los conjuntos de entrenamiento, validacion y prueba ni las curvas de aprendizaje, no puede descartarse sobreajuste.
- Rendimiento no verificado: las metricas declaradas (accuracy, precision, recall, F1) no incluyen valores, por lo que no hay evidencia publica de su calidad predictiva.
- Ambiguedad en la etiqueta: el dataset predice presencia de enfermedad cardiaca, no mortalidad ni eventos cardiacos futuros; el nombre del repositorio ("heart_failure") puede inducir a confusion sobre lo que realmente clasifica el modelo.
- Dependencia estricta del preprocesado: cualquier uso que no replique exactamente el orden dummies → reindexado → escalado producira predicciones invalidas, sin aviso de error.
- Umbral de decision fijo: el ejemplo usa 0,5 sin justificacion ni analisis de curva ROC; en un contexto clinico el umbral deberia calibrarse segun el coste relativo de falsos positivos y falsos negativos.
- Licencia permisiva con caveat etico: la licencia MIT permite uso comercial y modificacion, pero eso no legitima su empleo en entornos clinicos, donde entrarian en juego normativas como el reglamento europeo de dispositivos medicos.
- Idiomas no aplicables: el modelo no procesa texto, por lo que no existen capacidades multilingues que evaluar.
- Madurez del repositorio: creado y actualizado en la misma fecha (11 de septiembre de 2026 segun HuggingFace), con 0 descargas y 1 like, sin historial de mantenimiento ni issues documentadas.
- Informacion de busqueda no util: la busqueda web realizada no devolvio ninguna fuente independiente que valide o discuta el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abdalla732/heart_failure_prediction
- Dataset de entrenamiento: https://huggingface.co/datasets/fedesoriano/heart-failure-prediction
- Perfil del autor en HuggingFace: https://huggingface.co/abdalla732
- Papers, blogs, repositorios o demos adicionales: no disponible (la busqueda web no devolvio resultados relevantes)
