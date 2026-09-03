# ausjahk/animal-image-classifier-from-scratch

## Resumen

El modelo `ausjahk/animal-image-classifier-from-scratch` es una red neuronal convolucional (CNN) de clasificación binaria de imágenes, desarrollada por el usuario `ausjahk` y entrenada completamente desde cero, es decir, con inicialización aleatoria de los pesos, sin utilizar pesos preentrenados ni transfer learning. El problema que resuelve es la clasificación de imágenes en dos categorías: gatos y perros, utilizando el dataset Cat and Dog de Kaggle.

La arquitectura consta de cuatro bloques convolucionales con 32, 64, 128 y 256 filtros respectivamente, cada uno seguido de BatchNorm, ReLU y MaxPool2d, y una cabeza densa final de 256 neuronas que proyecta a las dos clases. El modelo tiene un total de 4.584.450 parámetros, todos inicializados aleatoriamente. Al tratarse de un modelo de clasificación de imágenes, no dispone de longitud de contexto ni de capacidades de generación de texto.

Su relevancia actual es principalmente educativa y de prototipado: sirve como ejemplo de implementación de una CNN desde cero en PyTorch, con una precisión final de prueba del 73,41%. No es un modelo de producción de alto rendimiento, pero resulta útil para aprender los fundamentos del entrenamiento de redes convolucionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN con 4 bloques convolucionales (32 → 64 → 128 → 256 filtros), BatchNorm + ReLU + MaxPool2d, y cabeza densa (256 → 2) |
| Parámetros totales | 4.584.450 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificación de imágenes) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (clasificación de imágenes) |
| Licencia | No disponible |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

La arquitectura es una CNN secuencial implementada en PyTorch, según las etiquetas del repositorio en HuggingFace. Se compone de cuatro bloques convolucionales que duplican progresivamente el número de filtros: 32, 64, 128 y 256. Cada bloque incluye una capa de normalización por lotes (BatchNorm), una activación ReLU y una capa de max-pooling 2D. Tras los bloques convolucionales, el modelo dispone de una cabeza clasificadora densa de 256 neuronas que desemboca en una salida de 2 clases: `cats` y `dogs`.

El entrenamiento se realizó desde cero, con inicialización aleatoria de los pesos, sobre el dataset Cat and Dog de Kaggle. No se especifica el número de épocas, el tamaño del lote, el optimizador ni la función de pérdida utilizados. Tampoco se indica que se haya aplicado RLHF, DPO ni ninguna técnica de ajuste posterior, dado que no se trata de un modelo de lenguaje. La precisión final reportada en el conjunto de prueba es del 73,41%.

## Capacidades

- Clasificación binaria de imágenes: distingue entre gatos y perros.
- Precisión de prueba del 73,41% sobre el dataset Cat and Dog de Kaggle.
- No soporta generación de texto, razonamiento, código ni matemáticas, al no ser un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües, ya que la entrada son imágenes, no texto.
- No dispone de capacidades especiales como modo de pensamiento, visión multimodal o audio.

## Casos de uso

- Prototipado educativo de redes convolucionales: el modelo es un ejemplo claro de cómo construir y entrenar una CNN desde cero, útil para cursos, talleres o notebooks de aprendizaje profundo.
- Clasificación básica de mascotas en aplicaciones de fotografía: puede integrarse en una app que etiquete automáticamente fotos como "gato" o "perro" en un entorno controlado, siempre que la precisión del 73,41% sea aceptable para el caso de uso.
- Filtrado de imágenes en sistemas de archivos: permite organizar automáticamente colecciones de fotos en carpetas de gatos o perros, por ejemplo mediante un script de Python que recorra un directorio.
- Preprocesamiento en pipelines de datos: puede usarse como clasificador rápido para filtrar imágenes antes de enviarlas a modelos más complejos o a un proceso de etiquetado manual.
- Demo interactiva con webcam: gracias a su tamaño reducido, de 4,5 millones de parámetros, puede ejecutarse en tiempo real en CPU y servir como demo de clasificación en vivo.
- Base para fine-tuning: puede servir como punto de partida para reentrenar el modelo en tareas similares de clasificación binaria con pocos datos, aunque la ausencia de pesos preentrenados limita su rendimiento frente a modelos basados en transfer learning.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Precisión de prueba (Kaggle Cat and Dog) | 73,41% |

No se han publicado resultados de benchmarks adicionales en la información disponible. Al ser un modelo de clasificación de imágenes, no se aplican benchmarks de modelos de lenguaje como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: ~18 MB en FP32, calculados a partir de 4.584.450 parámetros multiplicados por 4 bytes, más las activaciones. En la práctica, el modelo cabe en cualquier dispositivo, incluso en CPU.
- GPU recomendadas: no se requiere GPU para inferencia; cualquier GPU, incluso integrada, es suficiente.
- Compatibilidad con GPU de consumo: sí, cualquier GPU consumer de las series GTX o RTX, o incluso CPU.
- Opciones de despliegue: PyTorch (inferencia nativa), exportación a ONNX o TorchScript. No aplican vLLM, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la información proporcionada. La comparación con modelos preentrenados de referencia, como ResNet o MobileNet, no es posible porque no se dispone de sus resultados sobre el mismo dataset en la información disponible.

## Limitaciones y advertencias

- Precisión limitada: el 73,41% de exactitud es bajo para el dataset Cat vs Dog, donde los modelos con transfer learning suelen superar el 95%. Esto limita su uso en producción.
- Sin pesos preentrenados: al entrenar desde cero, el modelo no aprovecha características visuales aprendidas en grandes corpus de imágenes, lo que reduce su capacidad de generalización.
- Sesgos del dataset: el dataset de Kaggle puede contener sesgos en razas, colores, tamaños y poses de los animales, lo que puede afectar a la precisión en imágenes fuera de la distribución de entrenamiento.
- Riesgo de alucinación: no aplica, al ser un modelo discriminativo y no generativo.
- Licencia no especificada: no se puede confirmar si el modelo puede utilizarse con fines comerciales.
- Repositorio sin pesos aparentes: el tamaño del repositorio es de 0.0 GB, lo que sugiere que los pesos del modelo podrían no estar subidos. Esto impediría su uso directo desde HuggingFace.
- Sin documentación de uso: la model card no incluye código de inferencia, preprocesamiento de imágenes ni detalles de entrenamiento, lo que dificulta su reproducción.
- Modelo sin mantenimiento: no tiene descargas ni likes, y su fecha de creación es reciente, septiembre de 2026, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/ausjahk/animal-image-classifier-from-scratch
- Dataset de Kaggle: https://www.kaggle.com/datasets/tongpython/cat-and-dog
- Notebook de Keras sobre clasificación de imágenes desde cero: https://colab.research.google.com/github/keras-team/keras-io/blob/master/examples/vision/ipynb/image_classification_from_scratch.ipynb
- Notebook de Kirenz sobre clasificación de imágenes desde cero: https://colab.research.google.com/github/kirenz/deep-learning/blob/main/docs/image_classification_from_scratch.ipynb

No se han encontrado papers, blogs ni demos adicionales en la búsqueda web.
