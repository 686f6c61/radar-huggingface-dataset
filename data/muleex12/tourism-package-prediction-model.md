# Muleex12/tourism-package-prediction-model

## Resumen

Muleex12/tourism-package-prediction-model es un clasificador binario tabular publicado en HuggingFace por el usuario Muleex12. No es un modelo de lenguaje: se trata de un Random Forest Classifier entrenado con scikit-learn que predice la variable objetivo `ProdTaken`, es decir, si un cliente contratara o no un paquete turistico. El repositorio forma parte de un proyecto MLOps de prediccion de contratacion de paquetes turisticos y contiene dos artefactos serializados: `final_random_forest_model.pkl` (el modelo) y `preprocessor.pkl` (el pipeline de preprocesado previo a la prediccion).

El modelo se define por sus hiperparametros finales (100 estimadores, profundidad ilimitada, `min_samples_split=2`, `min_samples_leaf=2`, `class_weight=balanced`, `random_state=42`) y por unas metricas de test declaradas de accuracy 0,904, precision 0,861, recall 0,600 y F1 0,707. La model card no documenta el conjunto de datos de entrenamiento, el numero de muestras, las variables de entrada, el procedimiento de validacion ni el criterio de seleccion de hiperparametros.

Su relevancia actual es limitada y de nicho: sirve como ejemplo reproducible de pipeline de clasificacion tabular orientado a MLOps, pero el repositorio registra 0 descargas y 0 likes, no declara licencia y el autor no ha publicado informacion sobre sesgos, limitaciones ni origen de los datos. Ademas, el tamano reportado del repositorio es de 0,0 GB, lo que sugiere que los ficheros `.pkl` podrian no estar efectivamente subidos, extremo que conviene verificar antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (ensemble de arboles de decision con bagging) |
| Parametros totales | no disponible; se declaran 100 estimadores (arboles) con `max_depth=None`, sin datos sobre numero de nodos u hojas |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo tabular, no secuencial); no se documentan las variables de entrada |
| Tipos de cuantizacion | no disponible; se distribuye en formato pickle sin cuantizacion documentada |
| Idiomas soportados | no aplicable (clasificacion tabular) |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | `.pkl` (pickle de scikit-learn): `final_random_forest_model.pkl` y `preprocessor.pkl` |
| Libreria | scikit-learn |
| Tarea | Clasificacion binaria (variable objetivo `ProdTaken`) |
| Hiperparametros | n_estimators=100, max_depth=None, min_samples_split=2, min_samples_leaf=2, class_weight=balanced, random_state=42 |
| Metrica principal declarada | Accuracy 0,904 (conjunto de test) |
| Fecha de creacion | 14 de septiembre de 2026 |
| Ultima actualizacion | 14 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es un Random Forest, un metodo de ensemble que agrega las predicciones de 100 arboles de decision entrenados sobre submuestras bootstrap del conjunto de entrenamiento. Con `max_depth=None`, los arboles crecen hasta pureza o hasta agotar las restricciones de `min_samples_split=2` y `min_samples_leaf=2`, lo que favorece un ajuste de alta varianza compensado por el promedio del ensemble. El uso de `class_weight=balanced` indica que el autor intento corregir el desbalanceo de clases reponderando las muestras de forma inversamente proporcional a la frecuencia de cada clase, y `random_state=42` fija la semilla para hacer el resultado reproducible.

No se dispone de informacion sobre el volumen de datos de entrenamiento, el numero de caracteristicas, la composicion del dataset, el tratamiento de valores nulos (que queda delegado al pipeline `preprocessor.pkl`, no documentado), el esquema de validacion ni la busqueda de hiperparametros empleada. No hay rastro de tecnicas de aprendizaje profundo, RLHF, DPO ni ninguna innovacion arquitectonica: se trata de un modelo clasico de machine learning tabular.

## Capacidades

- Clasificacion binaria de clientes segun la probabilidad de contratar un paquete turistico (`ProdTaken`).
- Exposicion de la API estandar de scikit-learn (`predict`, y `predict_proba` como en cualquier clasificador de la libreria), si bien no se documenta calibracion de probabilidades.
- Integracion en pipelines de MLOps: al ser un artefacto pickle con un preprocesador separado, encaja en flujos de entrenamiento, versionado y despliegue automatizados.
- Reproducibilidad parcial garantizada por semilla fija, siempre que se use la misma version de scikit-learn y el mismo entorno.
- Inferencia en CPU, sin necesidad de aceleradores.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: su entrada es tabular, no textual.
- No dispone de modo "thinking" ni de ningun mecanismo de cadena de pensamiento.

## Casos de uso

- Puntuacion de leads en campanas de telefonia: el modelo asigna a cada cliente una prediccion sobre `ProdTaken` para priorizar las llamadas del equipo comercial y concentrar el esfuerzo en los contactos con mayor probabilidad de contratacion.
- Priorizacion de colas en un contact center: integrado en el CRM, ordena la lista de llamadas salientes por probabilidad estimada, de modo que los agentes atiendan primero los casos con mayor conversion esperada.
- Segmentacion de campanas de marketing: selecciona subconjuntos de clientes para campanas de email o SMS con un umbral de decision ajustado al coste por contacto.
- Analisis de cohortes y seguimiento comercial: al reejecutar el modelo sobre la base de clientes actualizada periodicamente, permite comparar la probabilidad media de contratacion entre segmentos y detectar cambios de tendencia.
- Componente de un sistema de recomendacion de producto: la salida del modelo puede alimentar reglas de negocio que decidan que paquete turistico ofrecer a cada perfil, aunque el modelo en si no elige el producto.
- Ejemplo docente o de referencia para proyectos MLOps: sirve como caso minimo de extremo a extremo (preprocesado serializado, modelo serializado, metricas de test) en cursos o plantillas internas de despliegue de modelos tabulares.
- Filtro previo para campanas de bajo coste: dado su recall declarado de 0,600, es mas adecuado como capa de priorizacion que como unico criterio de decision, ya que descarta aproximadamente el 40 % de los positivos reales.
- Despliegue en entornos con recursos limitados: al ejecutarse en CPU y no requerir GPU, puede servirse desde contenedores pequenos en infraestructura modesta.

## Benchmarks y rendimiento

Metricas de test declaradas por el autor para el modelo Random Forest ajustado:

| Metrica | Valor |
|---|---|
| Accuracy | 0,904 |
| Precision | 0,861 |
| Recall | 0,600 |
| F1 Score | 0,707 |

No se han publicado resultados comparativos frente a otros modelos, ni validacion cruzada, ni intervalos de confianza, ni el tamano del conjunto de test sobre el que se calcularon estas cifras. Tampoco se indica la distribucion de clases del conjunto de evaluacion, dato imprescindible para interpretar el accuracy en un problema desbalanceado.

## Requisitos de hardware

- VRAM: no aplicable; el modelo es un Random Forest que se ejecuta en CPU y no utiliza GPU.
- Memoria RAM: no disponible. El consumo depende del numero de nodos y hojas de los 100 arboles con profundidad ilimitada, dato que no se publica. Conviene medirlo cargando el pickle en el entorno de destino.
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Almacenamiento: no disponible; el repositorio figura con 0,0 GB, lo que sugiere que los artefactos podrian no estar publicados.
- Opciones de despliegue: servidor de inferencia propio con FastAPI o Flask, serializacion con joblib, contenedorizacion con Docker, empaquetado con BentoML o registro y servido mediante MLflow. Tambien es posible cargarlo directamente en un notebook o script de Python.
- Latencia y throughput: no disponibles. En inferencia por lotes el coste dominante suele ser el preprocesado, no el recorrido de los arboles.
- Dependencia critica: la version de scikit-learn debe coincidir con la usada en el entrenamiento; de lo contrario, `pickle` puede fallar al deserializar o producir resultados distintos.

## Comparativa con modelos similares

No se han publicado comparativas de este modelo frente a alternativas en la informacion disponible, ni existe una linea base documentada dentro del mismo repositorio. Como referencia de categoria, se indican familias de modelos que resuelven la misma tarea (clasificacion binaria tabular), sin cifras de rendimiento comparables:

| Modelo / familia | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tourism-package-prediction-model | Random Forest (scikit-learn) | 100 arboles, profundidad ilimitada; nodos no publicados | no aplicable | no disponible | repositorio HuggingFace con 0 descargas |
| Regresion logistica | Modelo lineal | no disponible | no aplicable | no disponible | implementable en scikit-learn |
| Gradient boosting (XGBoost, LightGBM, CatBoost) | Ensemble de boosting | no disponible | no aplicable | Apache-2.0 / MIT (licencias de libreria) | librerias publicas |
| Red neuronal tabular (MLP) | Perceptron multicapa | no disponible | no aplicable | no disponible | implementable en scikit-learn o PyTorch |

No se dispone de datos de rendimiento de estas alternativas sobre el mismo conjunto de datos, por lo que la comparacion cuantitativa queda no disponible.

## Limitaciones y advertencias

- Recall declarado de 0,600: el modelo deja sin detectar aproximadamente el 40 % de los clientes que si contratarian el paquete, lo que limita su uso como unico criterio de decision comercial.
- No se documenta la distribucion de clases ni el tamano del conjunto de test, por lo que el accuracy de 0,904 no puede interpretarse con rigor en un escenario desbalanceado.
- Sin informacion sobre el dataset de entrenamiento: se desconoce su procedencia, cobertura geografica, periodo temporal y posibles sesgos demograficos o socioeconomicos.
- Riesgo de deriva (drift): al no publicarse la fecha de los datos de entrenamiento, no puede evaluarse si la distribucion de entrada sigue siendo valida.
- Sin licencia declarada: no existe autorizacion explicita para uso comercial, redistribucion o modificacion. Cualquier uso en produccion requiere aclarar la licencia con el autor.
- Riesgo de seguridad al cargar el artefacto: los ficheros `.pkl` pueden ejecutar codigo arbitrario durante la deserializacion. Solo deben cargarse desde una fuente de confianza y en un entorno aislado.
- Dependencia de `preprocessor.pkl`: las transformaciones aplicadas a las variables de entrada no estan documentadas ni versionadas en la model card, lo que dificulta reproducir el pipeline completo.
- Acoplamiento a la version de scikit-learn: la compatibilidad del pickle no esta garantizada entre versiones de la libreria.
- Ausencia de validacion independiente: no hay validacion cruzada, ni conjunto de validacion reportado, ni resultados de terceros.
- Senales de baja madurez del repositorio: 0 descargas, 0 likes, repositorio de 0,0 GB y model card de apenas unas lineas. Verificar que los ficheros `.pkl` existen realmente antes de planificar cualquier integracion.
- No apto para tareas de lenguaje, generacion de texto, codigo, vision ni agentes: la ficha debe leerse unicamente como clasificador tabular.
- Sin calibracion documentada de probabilidades: si se usan `predict_proba` como umbrales de negocio, conviene calibrar el modelo previamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Muleex12/tourism-package-prediction-model
- Paper: no disponible
- Blog o articulo tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo o espacio interactivo: no disponible
- Documentacion de scikit-learn (libreria utilizada): no incluida en la informacion proporcionada
