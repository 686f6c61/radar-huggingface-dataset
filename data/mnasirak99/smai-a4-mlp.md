# MnasirAK99/smai-a4-mlp

## Resumen

smai-a4-mlp es un clasificador de imágenes para CIFAR-10 desarrollado por el usuario MnasirAK99 como parte de la asignatura SMAI (Assignment 4), con etiquetas limpias (p = 0). No se trata de un modelo de lenguaje ni de un modelo fundacional: es un perceptrón multicapa (MLP) de tamaño muy reducido, entrenado desde cero sobre el conjunto CIFAR-10, que clasifica imágenes de 32x32x3 píxeles en una de las diez clases del dataset.

La arquitectura es una red totalmente conectada de tres capas con dimensiones 3072-64-32-10, funciones de activación ReLU en las capas ocultas y salida lineal con pérdida de entropía cruzada. El modelo no incorpora mecanismos de atención, convoluciones ni componentes generativos; su interés es exclusivamente académico y didáctico, como referencia de un baseline MLP sobre CIFAR-10.

El modelo se publica con licencia MIT y pesos en formato PyTorch state dict (.pt) y NumPy (.npz). No dispone de model card con métricas de rendimiento, benchmarks ni información sobre idiomas, y el repositorio tiene un tamaño de 0.0 GB, lo que confirma su escala mínima (del orden de cientos de miles de parámetros).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP totalmente conectado (3072-64-32-10), ReLU en capas ocultas, salida lineal |
| Parametros totales | No disponible de forma explícita; estimable en ~198.000 a partir de las dimensiones de capa |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de clasificación de imágenes, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (.pt) y NumPy (.npz con W0, b0, W1, b1, W2, b2) |

## Arquitectura y entrenamiento

La red es un perceptrón multicapa con entrada de 3072 valores (imagen 32x32x3 aplanada), dos capas ocultas de 64 y 32 neuronas con activación ReLU y una capa de salida lineal de 10 unidades correspondiente a las clases de CIFAR-10. El entrenamiento utiliza pérdida de entropía cruzada. El preprocesamiento consiste en aplanar cada imagen, dividir por 255 y estandarizar cada una de las 3072 columnas mediante (x - mu) / sd, con media y desviación típica calculadas sobre las 50.000 imágenes de entrenamiento y almacenadas en preproc_q14.npz.

No se especifica en la información disponible el número de épocas, el optimizador, el tamaño de batch ni si se aplicaron técnicas de regularización (dropout, weight decay, data augmentation). Tampoco se documenta ninguna innovación técnica: se trata de un baseline académico sin mecanismos de atención, convolución ni decodificación especulativa.

## Capacidades

- Clasificación de imágenes de 32x32x3 píxeles en las diez clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia directa sobre el state dict de PyTorch o sobre los arrays NumPy exportados.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni ninguna capacidad multimodal más allá de la clasificación de imágenes de entrada fija.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: sirve como baseline MLP de referencia para comparar con CNN u otros clasificadores sobre CIFAR-10 en asignaturas universitarias.
- Reproducción de experimentos académicos: al incluir pesos en .pt y .npz junto con los parámetros de preprocesamiento, permite reproducir exactamente el pipeline de normalización y evaluación.
- Pruebas de pipelines de inferencia ligeros: su tamaño mínimo permite validar flujos de carga de modelos, preprocesamiento y evaluación sin requerir GPU.
- Comparación de estrategias de inicialización y activación: útil para contrastar ReLU frente a variantes como ELU (el autor publica un modelo hermano, smai-a4-ioc, con restricciones de no negatividad en los pesos).
- Ejecución en entornos con recursos muy limitados: al ser un MLP de ~198.000 parámetros, puede ejecutarse en CPU en milisegundos por imagen, útil para demostraciones en dispositivos embebidos o notebooks.
- Estudio de calibración y robustez en clasificación de imágenes de baja resolución: permite analizar el comportamiento de un MLP frente a perturbaciones en CIFAR-10 sin la complejidad de una CNN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo ocupa del orden de centenas de kilobytes en FP32.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. En caso de usar GPU, cualquier tarjeta con soporte CUDA (por ejemplo, RTX 3060 o superior) es más que suficiente.
- Cabe en cualquier GPU consumer, incluida la gama más baja, y también en CPU y en dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo (carga del state dict), NumPy para los pesos .npz, o exportación a ONNX si se requiere. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-mlp | MLP 3072-64-32-10 (ReLU) | ~198.000 (estimado) | No aplica | MIT | Hugging Face |
| smai-a4-ioc | MLP 3072-64-32-10 (ELU, pesos no negativos en capas 2 y 3) | ~198.000 (estimado) | No aplica | No disponible | Hugging Face |
| CNN típica para CIFAR-10 | Red convolucional | Variable (millones) | No aplica | Variable | Múltiples repositorios |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de propósito exclusivamente académico, sin validación en producción ni métricas publicadas de precisión, recall o F1.
- No es un modelo generativo ni lingüístico: no puede usarse para texto, código, razonamiento ni tareas multimodales.
- Entrada restringida a imágenes de 32x32x3 píxeles con el preprocesamiento exacto documentado; cualquier otra resolución o normalización invalidará las predicciones.
- Riesgo de sesgos heredados del dataset CIFAR-10, con clases desbalanceadas en escenarios reales y baja diversidad de dominios visuales.
- Al ser un MLP sin convoluciones, su capacidad de generalización espacial es limitada en comparación con CNN, lo que probablemente se traduzca en una precisión modesta sobre CIFAR-10 (no confirmada por el autor).
- La licencia MIT permite uso comercial, pero la ausencia de documentación sobre el entrenamiento y de métricas hace desaconsejable su uso en sistemas reales.
- No se documentan limitaciones idiomáticas porque el modelo no procesa lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MnasirAK99/smai-a4-mlp
- Modelo hermano (variante IOC): https://huggingface.co/MnasirAK99/smai-a4-ioc
