# MnasirAK99/smai-a4-ioc

## Resumen

smai-a4-ioc es un clasificador de imágenes para CIFAR-10 desarrollado por MnasirAK99 como parte de la asignatura SMAI (Assignment 4). Se trata de una red neuronal totalmente conectada de tipo Input-Convex Network (IOC), una familia de arquitecturas en las que la salida es convexa respecto a la entrada, lo que aporta garantías teóricas de optimización y estabilidad. El modelo clasifica imágenes de 32x32x3 píxeles en una de las diez clases de CIFAR-10.

La arquitectura es deliberadamente simple: un perceptrón multicapa con capas ocultas de 64 y 32 neuronas, activaciones ELU y restricciones de no negatividad en los pesos de las capas segunda y tercera, lo que impone la convexidad de la función respecto a la entrada. La salida es lineal con pérdida de entropía cruzada. El modelo se entrenó con etiquetas limpias (p = 0) sobre las 50.000 imágenes de entrenamiento de CIFAR-10.

Su relevancia es fundamentalmente académica y educativa: sirve como ejemplo reproducible de cómo implementar y entrenar una red convexa en PyTorch, y como referencia para estudiar las propiedades de las IOC en tareas de clasificación de imágenes de baja resolución. No está pensado para uso en producción ni para aplicaciones reales de visión por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa totalmente conectado con restricciones de convexidad (Input-Convex Network) |
| Parametros totales | Aproximadamente 198.000 (3072x64 + 64x32 + 32x10, más sesgos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificación de imágenes de tamaño fijo 32x32x3) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en precisión nativa PyTorch y NPZ) |
| Idiomas soportados | No disponible (modelo de visión, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (.pt) y NumPy (.npz) |

## Arquitectura y entrenamiento

La red tiene una topología 3072-64-32-10: la entrada son las 3072 dimensiones resultantes de aplanar cada imagen de 32x32x3 píxeles, seguidas de dos capas ocultas de 64 y 32 neuronas con activación ELU, y una capa de salida lineal de 10 clases. La propiedad de convexidad respecto a la entrada se impone restringiendo los pesos de las capas segunda y tercera a valores no negativos (W1 y W2 con restricciones de no negatividad), lo que garantiza que la función sea convexa en la entrada. La pérdida utilizada es entropía cruzada.

El preprocesamiento es explícito y reproducible: cada imagen se aplana a 3072 valores, se divide por 255 y se estandariza columna a columna con la media y desviación típica calculadas sobre las 50.000 imágenes de entrenamiento de CIFAR-10, almacenadas en preproc_q14.npz. El entrenamiento se realizó con etiquetas limpias (p = 0), es decir, sin ruido añadido en las etiquetas. No se especifican en la información disponible el número de épocas, el optimizador, la tasa de aprendizaje ni el tamaño de batch.

## Capacidades

- Clasificación de imágenes de 32x32x3 píxeles en las diez clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia determinista y ligera: el modelo es una red totalmente conectada de pequeño tamaño, adecuada para ejecución en CPU.
- Propiedad de convexidad respecto a la entrada, que aporta estabilidad teórica en la optimización y permite análisis formales de robustez.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión de alta resolución, audio ni otras modalidades.

## Casos de uso

- Docencia y prácticas académicas: el modelo sirve como ejemplo completo y reproducible de una Input-Convex Network en PyTorch, con pesos en dos formatos (.pt y .npz) y preprocesamiento documentado, ideal para asignaturas de aprendizaje automático.
- Estudio de propiedades de convexidad: investigadores pueden analizar cómo las restricciones de no negatividad en los pesos afectan a la estabilidad del entrenamiento y a la robustez frente a perturbaciones en la entrada.
- Reproducción de experimentos: al incluir el fichero de preprocesamiento con media y desviación típica, permite reproducir exactamente el pipeline de estandarización sobre CIFAR-10.
- Comparación de arquitecturas en CIFAR-10: sirve como línea base de una red convexa frente a redes no convexas de tamaño similar para estudiar diferencias de precisión y generalización.
- Pruebas de integración de PyTorch: al ser un modelo pequeño con state dict estándar, es útil para validar pipelines de carga de pesos, exportación y despliegue en entornos de prueba.
- Análisis de robustez adversarial: la convexidad respecto a la entrada permite estudiar cotas teóricas de robustez y compararlas con las de redes convencionales en un entorno controlado de baja dimensionalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB; el modelo tiene aproximadamente 198.000 parámetros y cabe holgadamente en cualquier GPU, incluso en memoria compartida.
- GPU recomendadas: no requiere GPU; funciona en CPU sin problemas. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer y en sistemas embebidos con al menos unos pocos megabytes de memoria.
- Opciones de despliegue: PyTorch nativo (carga del state dict), exportación a ONNX, o carga de los pesos NPZ con NumPy para inferencia sin PyTorch.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de microsegundos a milisegundos en CPU para un batch pequeño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-ioc | ~198.000 | No aplica (32x32x3) | Clasificación CIFAR-10 | MIT | Hugging Face |
| LeNet-5 | ~60.000 | No aplica (32x32x1) | Clasificación MNIST/CIFAR-10 | No disponible | Referencia histórica |
| ResNet-18 | ~11,7 millones | No aplica (224x224) | Clasificación ImageNet/CIFAR-10 | BSD-3 | Ampliamente disponible |
| VGG-11 | ~132 millones | No aplica (224x224) | Clasificación ImageNet | No disponible | Ampliamente disponible |

La comparación es orientativa: smai-a4-ioc es un modelo académico de tamaño muy reducido y sin métricas publicadas, por lo que no es directamente comparable en rendimiento con arquitecturas convolucionales estándar. No se dispone de datos de benchmarks para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Modelo de propósito académico: no está validado para uso en producción ni para aplicaciones reales de visión por computador.
- Sin métricas publicadas: no se dispone de precisión, recall ni F1 en el conjunto de test de CIFAR-10, lo que impide evaluar su rendimiento real.
- Entrada fija: solo acepta imágenes de 32x32x3 píxeles aplanadas y estandarizadas con la media y desviación típica específicas del entrenamiento; no generaliza a otras resoluciones ni a otros dominios.
- Riesgo de alucinación no aplica (no es un modelo generativo), pero sí puede producir clasificaciones erróneas con alta confianza en imágenes fuera de la distribución de CIFAR-10.
- Sesgos: al entrenarse exclusivamente con CIFAR-10, hereda los sesgos de ese dataset (clases desbalanceadas, imágenes de baja resolución, contextos limitados).
- Restricciones de licencia: licencia MIT, permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Caveat para producción: la convexidad respecto a la entrada no garantiza robustez adversarial en el sentido práctico; las redes convexas pueden seguir siendo vulnerables a perturbaciones.
- No disponible información sobre el proceso de entrenamiento (épocas, optimizador, hiperparámetros), lo que dificulta la reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MnasirAK99/smai-a4-ioc
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
