# DeKUT-DSAIL/convnextv2-huge-cifar10-upsample

## Resumen

El modelo `DeKUT-DSAIL/convnextv2-huge-cifar10-upsample` es un clasificador de imágenes basado en la arquitectura ConvNeXt V2 en su variante Huge, ajustado (fine-tuning) sobre el conjunto de datos CIFAR-10. Ha sido desarrollado por el grupo DeKUT-DSAIL (Dedan Kimathi University of Technology, Data Science and Artificial Intelligence Lab) como parte de un estudio que compara el rendimiento de modelos entrenados a resolución nativa frente a versiones reescaladas (upsampling). El modelo parte de pesos preentrenados en ImageNet (nombre `timm`: `convnextv2_huge`) y se ajusta sobre imágenes de CIFAR-10 reescaladas a 224x224 píxeles.

Con 657,5 millones de parámetros, es un modelo de gran tamaño para una tarea de clasificación de 10 clases. Su relevancia radica en servir como referencia para investigaciones sobre el impacto del upsampling en el rendimiento de modelos de visión, así como para experimentos de calibración y análisis de incertidumbre. El repositorio incluye una clase de utilidad (`CIFAR10Classifier`) que facilita su uso en entornos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 Huge (`convnextv2_huge`) |
| Parametros totales | 657.500.810 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ConvNeXt V2 Huge es una red neuronal convolucional moderna que incorpora mejoras respecto a los diseños clásicos de CNN: normalización por capas, kernels grandes (7x7), y el uso de `Global Response Normalization` (GRN) introducido en ConvNeXt V2. Esta arquitectura ha demostrado un buen equilibrio entre precisión y eficiencia en tareas de clasificación de imágenes.

El entrenamiento consistió en un ajuste fino (fine-tuning) desde los pesos preentrenados en ImageNet, utilizando el conjunto de entrenamiento de CIFAR-10 (50.000 imágenes). Las imágenes originales de 32x32 píxeles fueron reescaladas (upsampling) a 224x224 para adaptarse al tamaño de entrada esperado por el modelo. El preprocesado incluye un resize a 224x224 y normalización con la media `[0.4914, 0.4822, 0.4465]` y desviación estándar `[0.247, 0.2435, 0.2616]` de CIFAR-10. No se dispone de información sobre el número de épocas, la tasa de aprendizaje ni si se aplicaron técnicas de regularización o aumento de datos adicionales.

## Capacidades

- Clasificación de imágenes en 10 categorías: avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión.
- Inferencia sobre imágenes de entrada de 224x224 píxeles (con upsampling previo si la imagen original es menor).
- Salida de probabilidades por clase mediante softmax, lo que permite obtener confianza por predicción.
- Integración sencilla con la librería `timm` y PyTorch.
- Incluye una clase auxiliar `CIFAR10Classifier` que encapsula la carga del modelo y la predicción, facilitando su uso en scripts de investigación.

## Casos de uso

- Investigación académica sobre el efecto del upsampling en modelos de visión: este modelo permite comparar el rendimiento de ConvNeXt V2 Huge entrenado con imágenes reescaladas frente a versiones entrenadas a resolución nativa, dentro del estudio mencionado.
- Evaluación de calibración de modelos: el valor de ECE (Expected Calibration Error) reportado (0.1060) indica que el modelo presenta una calibración moderada, útil para estudiar métodos de post-hoc como temperature scaling.
- Prototipado rápido de sistemas de clasificación de imágenes en entornos controlados (por ejemplo, reconocimiento de objetos en imágenes sintéticas o datasets similares a CIFAR-10).
- Benchmark de hardware: al ser un modelo de 657M parámetros, puede utilizarse para medir tiempos de inferencia y consumo de memoria en diferentes GPUs.
- Pruebas de transferencia de aprendizaje: sirve como punto de partida para fine-tuning en datasets más pequeños o dominios específicos, aunque su tamaño puede ser excesivo para tareas simples.
- Educación y demostraciones: su uso con la clase `CIFAR10Classifier` es sencillo y permite ilustrar conceptos de clasificación de imágenes, probabilidades y calibración en cursos de machine learning.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados sobre el conjunto de test de CIFAR-10 (10.000 imágenes):

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 99.52% |
| Top-5 accuracy | 99.97% |
| F1 (macro) | 0.9952 |
| AUC (macro) | 0.9997 |
| ECE | 0.1060 |

No se proporcionan comparaciones con otros modelos en la información disponible. La alta precisión sugiere que el upsampling no degrada significativamente el rendimiento en este dataset, aunque la calibración (ECE) es mejorable.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware. A partir del tamaño del modelo (657,5M parámetros) y del peso del repositorio (2,6 GB, consistente con pesos en FP32), se pueden hacer las siguientes estimaciones orientativas:

- Para inferencia en FP32: se necesitan aproximadamente 2,6 GB de memoria para los pesos, más memoria para activaciones y overhead. Una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070/4060, A10) sería suficiente.
- Para inferencia en FP16: los pesos ocuparían unos 1,3 GB, por lo que una GPU con 4-6 GB de VRAM podría ser suficiente (por ejemplo, RTX 3050, GTX 1660).
- En CPU, la inferencia es posible pero lenta; se recomienda usar cuantización (no disponible en el repositorio) o un modelo más pequeño para despliegue en producción.
- Opciones de despliegue: al estar basado en `timm` y PyTorch, puede servirse con TorchServe, FastAPI o un contenedor Docker. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, que son específicos para modelos de lenguaje.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. Dado que se trata de un modelo de investigación específico para CIFAR-10, no se incluyen comparaciones con alternativas como ResNet, ViT u otros ConvNeXt de menor tamaño. Para obtener una comparativa, sería necesario consultar la literatura sobre clasificación en CIFAR-10.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para las 10 clases de CIFAR-10; no puede clasificar objetos fuera de ese conjunto.
- Las imágenes de entrada deben reescalarse a 224x224, lo que puede provocar pérdida de detalles en imágenes originales pequeñas (como las de 32x32 de CIFAR-10). El upsampling puede introducir artefactos.
- La calibración (ECE = 0.1060) indica que las probabilidades predichas no están perfectamente calibradas; las confianzas pueden ser excesivamente altas o bajas.
- No se documentan sesgos específicos, pero al estar entrenado en CIFAR-10, su rendimiento en imágenes del mundo real (con fondos complejos, variaciones de iluminación, etc.) puede ser limitado.
- La licencia MIT permite uso comercial, pero el modelo se ofrece sin garantías; el autor no proporciona soporte técnico.
- No se incluyen pesos cuantizados ni versiones optimizadas para móviles o edge computing.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DeKUT-DSAIL/convnextv2-huge-cifar10-upsample
- No se proporcionan otros enlaces (paper, blog, código de entrenamiento) en la información disponible.
