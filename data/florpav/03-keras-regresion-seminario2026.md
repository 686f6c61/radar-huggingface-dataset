# florpav/03-keras-regresion-seminario2026

## Resumen

Este "modelo" es en realidad un ejemplo pedagógico de regresión lineal implementado con Keras 3, publicado por el usuario florpav en el contexto del Seminario de Actualización del IFTS N.º 18 (docente: Cynthia M. Villagra). No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una `Sequential` de dos capas (una `Normalization` y una `Dense(1)`) que predice el precio de una vivienda en miles de dólares estadounidenses a partir de tres variables tabulares: superficie en metros cuadrados, presencia de balcón y presencia de ascensor.

Su relevancia es exclusivamente didáctica. Sirve para mostrar el flujo completo de entrenamiento y exportación en el formato nativo `.keras`, comparándolo con implementaciones equivalentes en scikit-learn y PyTorch. El modelo incluye la capa de normalización dentro del propio artefacto serializado, de modo que el preprocesado viaja con los pesos y no hay que replicarlo manualmente en inferencia, una diferencia práctica frente al ejemplo de PyTorch del mismo seminario.

El conjunto de datos es sintético (200 registros, 160 de entrenamiento y 40 de evaluación, generados con semilla fija), por lo que el modelo no debe interpretarse como un predictor de precios inmobiliarios reales. La model card reporta un MAE de 3,10 miles de US$ y un R² de 0,989 sobre el conjunto de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Sequential` con capa `Normalization` + capa `Dense(1)` (regresión lineal) |
| Parametros totales | 3 pesos y 1 bias en la capa `Dense(1)`, mas los parametros no entrenables de la capa `Normalization` (media y desviación por característica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de 3 características tabulares) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (documentación y model card en español; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `.keras` (formato nativo de Keras 3; incluye arquitectura, pesos, normalización y configuración de entrenamiento en un solo archivo) |

## Arquitectura y entrenamiento

La arquitectura es una regresión lineal canónica expresada como grafo de Keras: una capa `Normalization` que estandariza las tres entradas (`m2`, `balcon`, `ascensor`) usando media y desviación aprendidas con `adapt()` sobre el conjunto de entrenamiento, seguida de una capa `Dense(1)` sin función de activación no lineal. El entrenamiento usa aprendizaje supervisado con pérdida de error cuadrático medio (`mse`), optimizador SGD con tasa de aprendizaje 0,1 y 200 épocas, sobre 160 registros sintéticos. El backend empleado es PyTorch, aunque la model card indica compatibilidad con TensorFlow.

No hay fases de RLHF, DPO ni ajuste por preferencias, ni innovaciones de inferencia como decodificación especulativa o atención lineal: son irrelevantes para este tipo de modelo. La única decisión de diseño destacable es la inclusión de la normalización como capa del propio modelo, lo que garantiza que el artefacto `.keras` sea autocontenido para inferencia y evita el error típico de aplicar estadísticos de normalización distintos en entrenamiento y producción.

## Capacidades

- Predicción de una variable numérica continua (precio en miles de US$) a partir de tres características tabulares.
- Normalización integrada en el artefacto: no requiere preprocesado manual en inferencia.
- Serialización completa en un único archivo `.keras` (arquitectura, pesos, normalización y configuración de entrenamiento).
- Compatibilidad con backend PyTorch y TensorFlow dentro de Keras 3.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni modo "thinking".
- No procesa texto: la entrada es un array numérico con orden de columnas fijo.

## Casos de uso

- Docencia de regresión lineal con Keras: el modelo sirve como referencia mínima y reproducible para explicar el ciclo completo de entrenamiento, evaluación y exportación en el formato `.keras`, con código de entrenamiento (`train.py`) y de inferencia (`predict.py`) incluidos.
- Comparación de frameworks en el aula: al resolver el mismo problema que los ejemplos de scikit-learn y PyTorch del seminario, permite contrastar cómo cada ecosistema gestiona la normalización (integrada en el modelo en Keras, separada en el caso de PyTorch).
- Demostración de serialización autocontenida: útil para mostrar por qué empaquetar el preprocesado dentro del artefacto reduce errores de integración entre entrenamiento y producción.
- Prueba de humo de pipelines de despliegue: por su tamaño mínimo y su licencia MIT, puede usarse como artefacto de prueba para validar carga de modelos Keras 3 en un servicio de inferencia antes de desplegar modelos reales.
- Ejercicio de evaluación de métricas de regresión: el par MAE/R² reportado sobre 40 muestras permite practicar la interpretación de métricas y la detección de sobreajuste en datasets pequeños.
- Material de referencia para el seminario IFTS N.º 18: sirve como plantilla que el alumnado puede replicar con otros datasets tabulares sintéticos cambiando las variables de entrada y la variable objetivo.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el conjunto de evaluación (40 registros no vistos durante el entrenamiento):

| Metrica | Resultado |
|---|---|
| MAE | 3,10 miles de US$ |
| R² | 0,989 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no serían aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: insignificante; el modelo ocupa kilobytes y cabe en CPU sin problema.
- GPU recomendadas: ninguna necesaria; cualquier CPU moderna ejecuta la inferencia en microsegundos.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, integradas) e incluso en entornos sin GPU.
- Opciones de despliegue: Keras 3 con backend PyTorch o TensorFlow; no aplica vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma medida; por la naturaleza del modelo (una multiplicación matricial de 3 entradas por 1 salida) la latencia es despreciable y el throughput queda limitado por el overhead del framework, no por el cómputo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| florpav/03-keras-regresion-seminario2026 | 3 pesos + 1 bias (más normalización) | no aplica (3 entradas tabulares) | MAE 3,10; R² 0,989 | MIT | Hugging Face |
| Ejemplo de regresión con scikit-learn del mismo seminario | no disponible | no aplica | no disponible | no disponible | material del seminario |
| Ejemplo de regresión con PyTorch del mismo seminario | no disponible | no aplica | no disponible | no disponible | material del seminario |

No se dispone de datos de rendimiento de las alternativas del seminario en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sintéticos y no representan precios inmobiliarios reales.
- Dominio restringido: solo conoce viviendas de 35 a 120 m²; fuera de ese rango la predicción no es fiable.
- Orden de columnas fijo: la entrada debe ser `m2`, `balcon`, `ascensor`, en ese orden, como array numérico sin nombres de columna.
- Requiere Keras 3: el formato `.keras` no se abre con versiones antiguas de TensorFlow/Keras 2.
- Sin capacidades de lenguaje, visión ni tool calling; no debe evaluarse con los criterios propios de un LLM.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí riesgo de extrapolación indebida si se usa con datos fuera de la distribución de entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero al tratarse de un ejemplo didáctico su uso en producción real no está justificado técnicamente.
- Sesgos conocidos: no documentados en la model card; al ser datos sintéticos, cualquier sesgo del generador se traslada al modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/florpav/03-keras-regresion-seminario2026
