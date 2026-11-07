# grisselblanco/Clase_11_keras

## Resumen

Clase_11_keras es un modelo de regresión lineal implementado con Keras 3 que predice el precio de una vivienda en miles de dólares estadounidenses a partir de tres variables tabulares: superficie en metros cuadrados, presencia de balcón y presencia de ascensor. Lo desarrolla grisselblanco como material pedagógico del Seminario de Actualización del IFTS N.º 18, con Cynthia M. Villagra como docente, y su propósito es demostrar el flujo completo de entrenamiento y exportación de un modelo en el formato nativo `.keras`.

No se trata de un modelo de lenguaje ni de un sistema de propósito general: es un ejemplo mínimo de regresión supervisada sobre datos sintéticos, con solo 200 registros generados en `train.py` (160 para entrenamiento y 40 para evaluación). La arquitectura es una `Sequential` con una capa `Normalization` y una `Dense(1)`, lo que se traduce en tres pesos y un sesgo, entrenados con descenso de gradiente estocástico durante 200 épocas.

Su relevancia es estrictamente didáctica: sirve para comparar la misma tarea resuelta con scikit-learn, PyTorch y Keras, y para ilustrar una ventaja concreta del formato `.keras`, que empaqueta arquitectura, pesos, estadísticas de normalización y configuración de entrenamiento en un único archivo, evitando la normalización manual en inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Keras `Sequential`: capa `Normalization` + capa `Dense(1)` |
| Parámetros totales | 3 pesos y 1 sesgo (4 parámetros entrenables) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantización | no disponible (no se documenta ninguna) |
| Idiomas soportados | es (documentación y model card en español) |
| Licencia | MIT |
| Formato de pesos | `.keras` (formato nativo de Keras 3) |

## Arquitectura y entrenamiento

El modelo es una red neuronal de una sola capa densa precedida por una capa de normalización. La capa `Normalization` aprende la media y la desviación típica de las variables de entrada mediante `adapt()` sobre los datos de entrenamiento, y queda embebida en el grafo del modelo. La capa `Dense(1)` aplica una combinación lineal de las tres entradas normalizadas más un sesgo, lo que equivale funcionalmente a una regresión lineal múltiple. La pérdida es el error cuadrático medio (`mse`) y el optimizador es SGD con tasa de aprendizaje 0,1 durante 200 épocas.

Los datos son sintéticos: 200 registros generados con la misma semilla que el ejemplo de la Clase 10, con `m2` en el rango de 35 a 120, y `balcon` y `ascensor` como variables binarias. No hay datos reales, ni fases de RLHF, DPO o ajuste fino posterior. El modelo se entrenó con Keras 3 sobre backend PyTorch, aunque la model card indica compatibilidad con TensorFlow. La innovación técnica destacable, en clave pedagógica, es que la normalización viaja dentro del archivo `.keras`, a diferencia del ejemplo equivalente en PyTorch, donde se almacena por separado.

## Capacidades

- Regresión tabular: predice un valor numérico continuo (precio en miles de US$) a partir de tres variables de entrada.
- Normalización integrada: la capa `Normalization` se aplica automáticamente en inferencia, sin preprocesado manual.
- Portabilidad de backend: funciona con Keras 3 sobre PyTorch o TensorFlow.
- Serialización completa: arquitectura, pesos, normalización y configuración de entrenamiento en un único archivo `.keras`.
- No soporta generación de texto, razonamiento, código, matemáticas simbólicas, visión, audio, tool calling, agentes ni capacidades multilingües más allá de la documentación en español.

## Casos de uso

- Docencia de regresión lineal en Keras: el modelo sirve como ejemplo ejecutable de principio a fin para introducir `Sequential`, `Normalization`, `Dense`, `compile` y `fit` en un curso de machine learning.
- Comparativa de frameworks: permite contrastar la misma tarea resuelta con scikit-learn, PyTorch y Keras, evaluando diferencias en API, serialización y manejo de la normalización.
- Demostración de serialización `.keras`: útil para explicar el empaquetado de artefactos de modelo y las ventajas de un único archivo frente a la separación entre pesos y preprocesado.
- Prueba de pipelines de despliegue: al ser un modelo trivial, sirve para validar infraestructura de inferencia (carga de modelo, entrada en array, salida numérica) antes de pasar a modelos mayores.
- Ejercicio de evaluación: con 40 registros de test y métricas MAE y R² documentadas, es un caso práctico para enseñar validación train/test y métricas de regresión.
- Base para extensiones didácticas: punto de partida para añadir capas ocultas, regularización o más variables y observar el efecto sobre MAE y R².

## Benchmarks y rendimiento

| Métrica | Resultado | Conjunto |
|---|---|---|
| MAE | 3,10 miles de US$ | 40 registros de test |
| R² | 0,989 | 40 registros de test |

No se han publicado resultados de benchmarks en la información disponible más allá de estas dos métricas de evaluación sobre el conjunto de test sintético.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB; el modelo tiene 4 parámetros entrenables y un archivo `.keras` de tamaño mínimo.
- GPU recomendadas: no requiere GPU; funciona en CPU sin penalización perceptible.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1650) e incluso en entornos sin GPU.
- Opciones de despliegue: Keras 3 con backend PyTorch o TensorFlow; no aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma documentada; por la naturaleza del modelo, la inferencia es prácticamente instantánea y el cuello de botella sería el arranque del runtime de Keras.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Métricas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Clase_11_keras | Regresión lineal en Keras | 4 | no aplica | MAE 3,10; R² 0,989 | MIT | Hugging Face |
| Ejemplo de regresión con scikit-learn (Clase 10) | Regresión lineal | no disponible | no aplica | no disponible en la información | no disponible | Referenciado en la model card |
| Ejemplo de regresión con PyTorch (Clase 10) | Regresión lineal | no disponible | no aplica | no disponible en la información | no disponible | Referenciado en la model card |

La model card menciona explícitamente que el modelo resuelve el mismo problema que los ejemplos de scikit-learn y PyTorch de la Clase 10, pero no proporciona sus parámetros ni métricas, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sintéticos y los precios predichos no representan valores de mercado reales.
- Dominio restringido: solo conoce viviendas de 35 a 120 m²; fuera de ese rango la predicción no es fiable.
- Entrada posicional: las columnas deben ir en el orden `m2`, `balcon`, `ascensor`; el modelo recibe un array, no una tabla con nombres de columna.
- Dependencia de versión: requiere Keras 3; el formato `.keras` no se abre con TensorFlow/Keras 2.
- Sin benchmark externo: las métricas MAE y R² proceden de un conjunto de test de 40 registros sintéticos, por lo que su valor estadístico es muy limitado.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí existe riesgo de extrapolación incorrecta fuera del rango de entrenamiento.
- Sesgos conocidos: no documentados; al ser datos sintéticos, los sesgos proceden del generador de datos y no de una población real.
- Uso comercial: la licencia MIT lo permite, pero su utilidad práctica en producción es nula fuera de contextos didácticos o de prueba de infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/grisselblanco/Clase_11_keras
- Documentación de Keras: https://www.educba.com/keras-model/
- Entrenamiento de modelos Keras en Azure Machine Learning: https://learn.microsoft.com/en-us/azure/machine-learning/how-to-train-keras?view=azureml-api-2
