# grisselblanco/03-keras-regresion

## Resumen

El modelo `grisselblanco/03-keras-regresion` es un ejemplo pedagógico de regresión lineal implementado con Keras 3, desarrollado en el marco del Seminario de Actualización del IFTS N.º 18 (docente: Cynthia M. Villagra). Su objetivo no es resolver un problema de producción, sino demostrar de forma reproducible cómo se entrena, se evalúa y se exporta un modelo de regresión tabular en el formato nativo `.keras`, incluyendo la normalización de entrada como parte del propio grafo del modelo.

El problema que aborda es la predicción del precio de una vivienda (en miles de dólares estadounidenses) a partir de tres variables: superficie en metros cuadrados (`m2`), presencia de balcón (`balcon`, 0 o 1) y presencia de ascensor (`ascensor`, 0 o 1). La arquitectura es mínima: una capa `Normalization` seguida de una capa `Dense(1)`, lo que equivale a una regresión lineal con tres pesos y un sesgo, entrenada con descenso de gradiente estocástico sobre un dataset sintético de 200 registros.

Su relevancia es exclusivamente didáctica: sirve como referencia canónica para comparar la misma tarea resuelta con scikit-learn, PyTorch y Keras, y para ilustrar buenas prácticas de empaquetado (normalización embebida, backend configurable entre PyTorch y TensorFlow, artefacto único autocontenido). No debe confundirse con un modelo de lenguaje ni con un sistema de IA generativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Sequential` de Keras: capa `Normalization` + capa `Dense(1)` (regresión lineal) |
| Parametros totales | 3 pesos + 1 sesgo en la capa `Dense(1)`, más los parámetros no entrenables de la capa `Normalization` (media y desviación por cada una de las 3 entradas) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, entrada fija de 3 variables) |
| Tipos de cuantizacion | no disponible (no se documenta ninguna; el modelo es de tamaño despreciable) |
| Idiomas soportados | es (documentación y model card en español; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `.keras` (formato nativo de Keras 3, archivo único que incluye arquitectura, pesos, normalización y configuración de entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón de una sola capa sin función de activación, precedido de una capa `Normalization` que estandariza las tres variables de entrada. La capa de normalización se ajusta con `adapt()` sobre los datos de entrenamiento y queda persistida dentro de `model.keras`, de modo que el usuario no necesita normalizar manualmente en inferencia; esto la diferencia del ejemplo equivalente en PyTorch, donde la normalización se guarda como artefacto separado.

El entrenamiento es supervisado, con pérdida de error cuadrático medio (`mse`) y optimizador SGD con tasa de aprendizaje 0,1 durante 200 épocas. El dataset es sintético y generado en `train.py` con semilla fija: 200 registros en total, de los cuales 160 se destinan a entrenamiento y 40 a evaluación. Las entradas cubren `m2` en el rango de 35 a 120, y `balcon` y `ascensor` como variables binarias. El modelo se ejecuta con Keras 3 sobre backend PyTorch, aunque la model card indica compatibilidad con TensorFlow. No se documenta uso de RLHF, DPO ni ninguna técnica de alineación, lo cual es coherente con la naturaleza del modelo.

## Capacidades

- Regresión tabular sobre tres variables numéricas/binarias con un orden de columnas fijo: `m2`, `balcon`, `ascensor`.
- Predicción de una variable continua (precio en miles de US$) mediante una combinación lineal de las entradas normalizadas.
- Normalización de entrada embebida en el grafo, sin pasos de preprocesamiento externos en inferencia.
- Exportación y carga en formato nativo `.keras` con Keras 3.
- Compatibilidad con dos backends: PyTorch y TensorFlow (seleccionable mediante `KERAS_BACKEND`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto. No es un modelo de lenguaje.

## Casos de uso

- Docencia de regresión lineal en Keras: el modelo sirve como ejemplo mínimo y reproducible para explicar el ciclo completo de entrenamiento, evaluación y exportación en un curso de machine learning.
- Comparación de frameworks: al resolver el mismo problema que los ejemplos de scikit-learn y PyTorch, permite contrastar API, gestión de la normalización y formato de serialización entre las tres herramientas.
- Referencia de empaquetado autocontenido: ilustra cómo incluir la normalización dentro del artefacto del modelo, patrón útil en pipelines donde se quiere evitar dependencias de preprocesamiento externas.
- Prueba de humo de entornos Keras 3: al ser un modelo de tamaño despreciable, sirve para verificar que un entorno con Keras 3 y backend PyTorch o TensorFlow carga y ejecuta correctamente un `.keras`.
- Ejemplo de integración en notebooks educativos: el archivo `predict.py` y el snippet de la model card permiten demostrar la inferencia con un único array de entrada.
- Material de ejercicios sobre límites de extrapolación: el rango acotado de `m2` (35 a 120) permite discutir por qué un modelo lineal entrenado en ese intervalo no debe usarse fuera de él.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son las métricas de evaluación sobre el conjunto de test sintético (40 registros no vistos durante el entrenamiento):

| Metrica | Resultado |
|---|---|
| MAE | 3,10 miles de US$ |
| R² | 0,989 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni tendría sentido aplicarlos a un modelo de regresión tabular.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el modelo ocupa unos pocos kilobytes y cabe en cualquier dispositivo con Keras 3 instalado.
- GPU recomendadas: no requiere GPU; la CPU es suficiente y probablemente más eficiente para este tamaño.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: carga directa con `keras.saving.load_model("model.keras")` en Python; no aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por la magnitud del modelo, la latencia vendrá dominada por el overhead de carga del framework, no por el cómputo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `grisselblanco/03-keras-regresion` | 3 pesos + 1 sesgo (+ normalización) | no aplica | MAE 3,10; R² 0,989 (test sintético) | MIT | Hugging Face |
| Ejemplo equivalente en scikit-learn (misma tarea, Clase 10) | Modelo lineal | no aplica | no disponible en la información | no disponible | Referenciado en la model card |
| Ejemplo equivalente en PyTorch (misma tarea, Clase 10) | Modelo lineal | no aplica | no disponible en la información | no disponible | Referenciado en la model card |

La comparativa relevante es frente a las implementaciones gemelas en scikit-learn y PyTorch mencionadas por el autor; no se dispone de métricas publicadas de esas variantes en la información proporcionada. La diferencia técnica destacable es que en Keras la normalización queda embebida en el artefacto, mientras que en PyTorch se guarda por separado.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sintéticos y no representan precios reales de vivienda.
- Dominio acotado: solo conoce casas de 35 a 120 m²; fuera de ese rango la predicción es extrapolación no validada.
- Orden de columnas obligatorio: la entrada debe ser `m2`, `balcon`, `ascensor`; el modelo recibe un array, no una tabla con nombres de columnas.
- Dependencia de versión: requiere Keras 3; el formato `.keras` no se abre con TensorFlow/Keras 2.
- Sin capacidades de lenguaje, razonamiento, tool calling ni multilingüismo; no es apto para tareas de NLP.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe riesgo de predicciones sin sentido si se usa fuera del dominio de entrenamiento o con entradas mal formadas.
- Sesgos: no documentados explícitamente; al ser datos sintéticos con semilla fija, cualquier sesgo proviene del generador del dataset, no de datos reales.
- Licencia MIT: permite uso comercial, pero el propio autor desaconseja su uso fuera del ámbito educativo por la naturaleza sintética de los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/grisselblanco/03-keras-regresion
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
