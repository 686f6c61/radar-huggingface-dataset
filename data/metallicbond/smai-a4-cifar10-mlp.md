# MetallicBond/smai-a4-cifar10-mlp

## Resumen

`smai-a4-cifar10-mlp` es un repositorio de pesos que contiene dos clasificadores de imágenes para el conjunto de datos CIFAR-10, empaquetados como ficheros de pesos `.npz`. Lo publica el usuario MetallicBond como entrega del cuarto trabajo de la asignatura SMAI (Assignment 4, Q1). No se trata de un modelo de lenguaje ni de un modelo fundacional: son dos perceptrones multicapa (MLP) de tres capas pensados exclusivamente para clasificar imágenes de 32x32x3 píxeles en una de las diez clases de CIFAR-10.

Ambos modelos comparten arquitectura: una entrada aplanada de 3072 dimensiones, una capa oculta de 256 neuronas con activación ReLU y una salida de 10 logits con softmax y entropía cruzada. El recuento total de parámetros es de 789.258 en ambos casos. La diferencia entre ellos está en el conjunto de entrenamiento y en el framework utilizado: `mlp_numpy_selected` se implementa y entrena en NumPy puro sobre una partición estratificada de 36.000 imágenes, mientras que `mlp_torch_p0` se entrena en PyTorch durante 100 épocas sobre las 50.000 imágenes de entrenamiento completas de CIFAR-10.

El interés de este repositorio es fundamentalmente didáctico y de reproducibilidad de un ejercicio académico. No compite con modelos de visión de propósito general ni ofrece capacidades de generación, razonamiento o tool calling. Su relevancia práctica es limitada fuera del contexto de la asignatura, pero sirve como referencia mínima de un clasificador MLP entrenado desde cero con SGD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) de 3 capas: 3072 -> 256 -> 10, activación ReLU en la capa oculta, salida Identity con 10 logits |
| Parametros totales | 789.258 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de 32x32x3) |
| Tipos de cuantizacion | no disponible (pesos en `.npz`, presumiblemente float64 según el preprocesado descrito) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.npz` (ficheros de pesos NumPy); el repositorio ocupa 0.0 GB |
| Preprocesado de entrada | Aplanar 32x32x3 uint8 en orden HWC a 3072, convertir a float64, dividir por 255, restar la media por columna y dividir por la desviación típica por columna del fichero de preprocesado |
| Layout de pesos | `W{i}` con forma `(n_in, n_out)`, `b{i}` con forma `(n_out,)`; `z = h @ W + b` |
| Entrenamiento (`mlp_numpy_selected`) | lr 0.02, batch size 64, acumulación de gradiente 1, SGD plano, semilla 14017, 36.000 imágenes estratificadas |
| Entrenamiento (`mlp_torch_p0`) | lr 0.02, batch size 64, acumulación de gradiente 1, SGD plano, semilla 14017, 100 épocas, 50.000 imágenes con etiquetas verdaderas (p = 0) |

## Arquitectura y entrenamiento

La arquitectura es un MLP totalmente conectado de tres capas con una única capa oculta de 256 unidades y activación ReLU. La entrada es la imagen CIFAR-10 aplanada a un vector de 3072 dimensiones y la salida son 10 logits correspondientes a las diez clases del dataset (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión). La pérdida es entropía cruzada aplicada sobre softmax. No hay convoluciones, atención, normalización por lotes ni conexiones residuales: es un MLP canónico.

El entrenamiento se realiza con descenso de gradiente estocástico plano (SGD sin momento ni weight decay), learning rate 0.02, tamaño de lote 64 y sin acumulación de gradiente. La semilla es 14017 en ambos casos. `mlp_numpy_selected` se entrena sobre una partición estratificada de 36.000 imágenes (Task 1.2.1 del enunciado) y se selecciona en el apartado 1.2.5; `mlp_torch_p0` se entrena durante 100 épocas sobre las 50.000 imágenes de entrenamiento completas con etiquetas verdaderas (p = 0). No se documenta el uso de data augmentation, regularización, RLHF ni ninguna innovación técnica destacable.

## Capacidades

- Clasificación de imágenes CIFAR-10 en 10 clases a partir de entradas de 32x32x3 píxeles.
- Inferencia con NumPy puro en el caso de `mlp_numpy_selected`, sin dependencia de frameworks de deep learning.
- Implementación equivalente en PyTorch para `mlp_torch_p0`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni generación.

## Casos de uso

- Docencia y ejercicios de aprendizaje automático: sirve como referencia mínima de un MLP entrenado desde cero con SGD, útil para comparar implementaciones en NumPy frente a PyTorch en un curso introductorio.
- Reproducción de resultados académicos: los ficheros `.npz` y los hiperparámetros documentados (lr 0.02, batch 64, semilla 14017) permiten reproducir exactamente el entrenamiento del Assignment 4.
- Baseline de clasificación de imágenes de baja resolución: puede usarse como línea base débil frente a CNN para ilustrar la brecha de rendimiento en CIFAR-10.
- Pruebas de pipelines de preprocesado: el esquema de aplanado, normalización por columna y conversión a float64 es un caso concreto para validar utilidades de carga de datos.
- Experimentos de sensibilidad a hiperparámetros: al ser un modelo pequeño (789.258 parámetros), permite barrer configuraciones de SGD en hardware muy modesto.
- Comparación NumPy frente a PyTorch: los dos modelos del repositorio permiten contrastar el mismo diseño entrenado con dos stacks distintos y sobre dos particiones diferentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye exactitud de validación ni de test para ninguno de los dos modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB para los pesos (789.258 parámetros en float64 suponen aproximadamente 6,3 MB), más el overhead del framework.
- GPU recomendadas: ninguna en particular; el modelo cabe holgadamente en cualquier GPU consumer, incluida una GTX 1050 o una integrada.
- Cabe en GPU consumer: sí, en cualquier GPU con más de 1 GB de memoria; también funciona en CPU sin problema.
- Opciones de despliegue: carga directa de los `.npz` con NumPy para `mlp_numpy_selected`; PyTorch para `mlp_torch_p0`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `smai-a4-cifar10-mlp` (este) | 789.258 | 32x32x3 fijo | Clasificación CIFAR-10 | no disponible | Hugging Face |
| LeNet-5 (referencia histórica) | ~60.000 | 32x32x1 | Clasificación de dígitos / imágenes | no disponible | Implementaciones públicas |
| ResNet-18 (referencia) | ~11,7 M | 224x224x3 | Clasificación ImageNet | licencia de torchvision | torchvision |
| VGG-11 (referencia) | ~132,9 M | 224x224x3 | Clasificación ImageNet | licencia de torchvision | torchvision |

La comparación con LeNet-5, ResNet-18 y VGG-11 es meramente orientativa: son arquitecturas convolucionales de referencia para clasificación de imágenes, no alternativas directas al MLP de este repositorio. No se dispone de datos de rendimiento de este modelo para comparar numéricamente con ellas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no genera contenido y no soporta ninguna de las capacidades asociadas a los LLM.
- La licencia no está especificada, por lo que no se puede garantizar el uso comercial ni la redistribución.
- No se documentan métricas de rendimiento (exactitud en validación o test), lo que impide evaluar su calidad real.
- Un MLP sin convoluciones sobre CIFAR-10 tiene un rendimiento esperable muy inferior al de una CNN; no debe usarse como referencia de estado del arte.
- Riesgo de sobreajuste desconocido: no se documenta regularización, dropout ni early stopping.
- La entrada está restringida a imágenes de 32x32x3 con un preprocesado muy específico (aplanado HWC, float64, normalización por columna); cualquier desviación de ese esquema invalida las predicciones.
- El modelo `mlp_numpy_selected` se entrena solo sobre 36.000 imágenes, frente a las 50.000 de `mlp_torch_p0`, por lo que sus resultados no son directamente comparables.
- El repositorio ocupa 0.0 GB y no tiene descargas ni likes, lo que sugiere que es un artefacto académico sin mantenimiento ni comunidad.
- No hay información sobre sesgos: al ser un clasificador de CIFAR-10, hereda los sesgos y desequilibrios del dataset original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MetallicBond/smai-a4-cifar10-mlp
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
