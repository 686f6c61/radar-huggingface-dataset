# lolma123/smai-a4-mlp

## Resumen

SMAI A4 — MLP on CIFAR-10 es un modelo de clasificación de imágenes de muy pequeño tamaño publicado en Hugging Face por el usuario lolma123 bajo el identificador `lolma123/smai-a4-mlp`. No es un modelo de lenguaje ni un transformer: se trata de un perceptrón multicapa (MLP) de tres capas con arquitectura `3072-256-10_relu`, entrenado para clasificar las imágenes de 32x32x3 del conjunto CIFAR-10 en una de sus 10 categorías. La entrada es un vector de 3072 valores (la imagen aplanada en orden HWC) y la salida son 10 logits sobre los que se aplica softmax cross-entropy.

El modelo se presenta como el más pequeño dentro de un margen de 1 punto porcentual respecto a la mejor precisión de validación de un estudio comparativo (referenciado como Sección 1.2.5 de un documento no enlazado). Se distribuyen dos artefactos: un state dict de PyTorch (`torch_mlp_p0.npz`) entrenado durante 100 épocas sobre las 50 000 imágenes de entrenamiento de CIFAR-10 con etiquetas verdaderas, y una versión en NumPy (`selected_mlp_numpy.npz`) cargable con `nnlib.Model.load_from`.

Su relevancia es fundamentalmente didáctica o de referencia: sirve como línea base mínima de clasificación sobre CIFAR-10, útil para comparar contra arquitecturas convolucionales o para reproducir experimentos de ML clásico. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, tamaño de 0.0 GB y carece de licencia, idiomas o pipeline declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP `3072-256-10_relu` (3 capas, activación ReLU, salida Identity) |
| Parametros totales | no disponible (no declarado; estimable en ~815 000 a partir de las dimensiones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificador de imágenes) |
| Licencia | no disponible |
| Formato de pesos | `.npz` (state dict de PyTorch y arrays NumPy) |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa denso con 3072 entradas, una capa oculta de 256 unidades con activación ReLU y 10 logits de salida sin activación (Identity), entrenado con pérdida de entropía cruzada softmax. El preprocesado consiste en aplanar cada imagen CIFAR-10 de 32x32x3 en un vector de 3072 valores en orden HWC, convertir a float64, dividir por 255 y estandarizar por columna usando la media y la desviación típica del conjunto de entrenamiento (las columnas con desviación 0 usan divisor 1).

El checkpoint `torch_mlp_p0.npz` se entrenó durante 100 épocas sobre las 50 000 imágenes de entrenamiento de CIFAR-10 con etiquetas verdaderas (p = 0, sin etiquetas ruidosas). No se documenta el optimizador, el learning rate, el tamaño de batch ni si hubo data augmentation. La variante NumPy replica la misma topología con matrices `W<i>` de forma (in, out) y sesgos `b<i>`, pensada para cargarse con `nnlib.Model.load_from`. No se mencionan innovaciones técnicas como atención, normalización por lotes o regularización.

## Capacidades

- Clasificación de imágenes de 32x32x3 en las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia sobre vectores de 3072 dimensiones preprocesados con el pipeline específico descrito (aplanado HWC, float64, /255, estandarización por columna).
- Carga de pesos en dos ecosistemas: PyTorch (`nn.Sequential` con claves `<i>.weight` y `<i>.bias`) y NumPy (`nnlib.Model.load_from`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general ni audio.
- No tiene capacidades multilingües (no procesa lenguaje).
- No dispone de modo thinking ni de ninguna capacidad especial más allá de la clasificación.

## Casos de uso

- Línea base de clasificación en CIFAR-10: sirve como referencia mínima contra la que medir el incremento de precisión de CNN, ViT o modelos híbridos en experimentos académicos.
- Docencia de machine learning clásico: permite ilustrar el flujo completo de aplanado, estandarización, entrenamiento con entropía cruzada y evaluación sobre un dataset estándar sin dependencias pesadas.
- Reproducción de experimentos de robustez a etiquetas ruidosas: el checkpoint se entrenó con p = 0 (etiquetas limpias), por lo que sirve como control frente a variantes entrenadas con ruido.
- Pruebas de pipelines de inferencia en NumPy puro: al distribuirse `selected_mlp_numpy.npz`, se puede validar una implementación propia de forward pass (`nnlib.Model.load_from`) sin PyTorch.
- Verificación de preprocesado: útil para comprobar que un pipeline de carga de CIFAR-10 (aplanado HWC, float64, /255, estandarización por columna) produce las mismas entradas que el autor.
- Comparación de coste/precisión en dispositivos muy limitados: un MLP de ~0,8 M de parámetros puede ejecutarse en CPU o microcontroladores, útil para estudiar el trade-off frente a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que el modelo fue seleccionado como el más pequeño dentro de 1 punto porcentual de la mejor precisión de validación, pero no proporciona la cifra concreta de precisión ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (los pesos ocupan unos 3,3 MB); en float64, alrededor de 6,5 MB.
- GPU recomendadas: no requiere GPU; cualquier CPU es suficiente. Funciona en A100, H100, RTX 4090 o cualquier GPU consumer sin aprovecharlas.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU, y también en CPU y en dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo (`torch.load` sobre el state dict), NumPy con `nnlib.Model.load_from`, o exportación manual a ONNX. No aplican vLLM, llama.cpp, Ollama ni TGI por no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, la latencia por muestra sería del orden de microsegundos en CPU moderna.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de otros modelos sobre CIFAR-10 ni referencias a alternativas comparables (LeNet, ResNet-18, ViT pequeños u otros MLP), por lo que no es posible construir una comparativa con datos verificables.

## Limitaciones y advertencias

- Sin licencia declarada: no se especifican condiciones de uso comercial ni de redistribución; debe contactarse con el autor antes de cualquier uso en producción.
- Ámbito muy restringido: solo clasifica imágenes CIFAR-10 de 32x32x3 con el preprocesado exacto descrito; no generaliza a otras resoluciones, datasets ni tareas.
- Sensible al preprocesado: cualquier desviación en el orden HWC, el tipo float64, la división por 255 o la estandarización por columna degradará la precisión de forma no documentada.
- Sin métricas publicadas: no hay precisión de validación ni de test reportada, por lo que no se puede evaluar su calidad real.
- Riesgo de sesgo heredado de CIFAR-10: el dataset contiene clases desbalanceadas en dificultad y sesgos de representación propios de las imágenes recolectadas.
- Riesgo de alucinación no aplica (no genera texto); el riesgo equivalente es la clasificación errónea confiada en imágenes fuera de distribución.
- Documentación incompleta: no se detallan optimizador, hiperparámetros, semillas ni el documento de referencia (Secciones 1.2.5 y 1.4.2) donde se justifica la selección del modelo.
- Repositorio sin actividad: 0 descargas y 0 likes, sin garantía de mantenimiento ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/lolma123/smai-a4-mlp
- Dataset CIFAR-10 referenciado: https://huggingface.co/datasets/uoft-cs/cifar10
- Documento de referencia (Secciones 1.2.5 y 1.4.2): no disponible
- Paper, blog, repositorio o demo adicionales: no disponible
