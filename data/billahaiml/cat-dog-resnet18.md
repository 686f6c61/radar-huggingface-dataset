# billahaiml/cat-dog-resnet18

## Resumen

El modelo `billahaiml/cat-dog-resnet18` es un clasificador binario de imágenes basado en la arquitectura ResNet18, diseñado para distinguir entre dos clases: gato y perro. Fue desarrollado por el usuario billahaiml y publicado en HuggingFace bajo licencia MIT. Se trata de un proyecto de transfer learning que parte de los pesos preentrenados en ImageNet y se ajusta sobre un subconjunto de CIFAR-10 que contiene únicamente las clases de gato y perro, con un conjunto de entrenamiento reducido (100 imágenes por clase) y un conjunto de prueba igualmente pequeño (50 imágenes por clase). El modelo está pensado como una demostración didáctica del proceso de transfer learning, no como una solución lista para producción.

La relevancia de este modelo radica en su simplicidad y bajo coste computacional: al ser ResNet18, un modelo ligero de 11,7 millones de parámetros, puede ejecutarse en hardware modesto, incluso en CPU. El repositorio incluye un ejemplo de inferencia en Python con PyTorch, lo que facilita su uso en entornos educativos o de prototipado. No se han publicado métricas de rendimiento oficiales ni comparativas con otros clasificadores de gato/perro.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 (preentrenado en ImageNet, con capa fully connected adaptada a 2 clases) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión por imágenes, entrada de 128x128 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | MIT |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ResNet18, una red neuronal convolucional de 18 capas con conexiones residuales, que fue preentrenada en ImageNet. El proceso de entrenamiento se divide en dos fases documentadas en la model card:

1. **Extracción de características**: se congelan todas las capas excepto la última capa totalmente conectada (fully connected), que se sustituye por una nueva capa con salida de 2 neuronas (gato/perro). Se entrenó durante 5 épocas.
2. **Fine-tuning**: se descongela la capa `layer4` (el último bloque residual) y se entrena con una tasa de aprendizaje más baja durante otras 5 épocas.

El dataset de entrenamiento proviene de CIFAR-10, del que se seleccionaron solo las clases de gato y perro, con 100 imágenes por clase para entrenamiento y 50 por clase para prueba. No se indica el uso de técnicas de aumento de datos ni de regularización adicional. El tamaño de entrada es de 128x128 píxeles RGB, con normalización estándar (media y desviación de ImageNet).

## Capacidades

- Clasificación binaria de imágenes: predice si una imagen contiene un gato o un perro.
- Inferencia con PyTorch y torchvision, mediante la carga de los pesos desde HuggingFace Hub.
- Soporte para inferencia en GPU o CPU (dependiendo de la disponibilidad de `torch.cuda`).
- No tiene capacidades de generación de texto, razonamiento, tool calling, agentes, ni visión multilingüe. Es un clasificador de imagen de un solo propósito.

## Casos de uso

- **Educación en aprendizaje profundo**: el modelo sirve como ejemplo práctico para enseñar transfer learning, fine-tuning y clasificación de imágenes en PyTorch. Su código de inferencia es simple y reproducible.
- **Prototipado de sistemas de clasificación de mascotas**: en una aplicación de demostración que distinga entre gatos y perros, por ejemplo en una app móvil o web de ejemplo, sin requisitos de alta precisión.
- **Pruebas de concepto en visión por computador**: para validar flujos de trabajo con HuggingFace Hub, descarga de pesos y carga de modelos con torchvision.
- **Integración en pipelines de inferencia de baja exigencia**: dado que el modelo es ligero, puede desplegarse en entornos con recursos limitados (CPU, dispositivos embebidos) para pruebas rápidas.
- **Comparación de técnicas de transferencia**: permite analizar el efecto de congelar capas frente a fine-tuning, ya que el entrenamiento se documenta en dos etapas.
- **Generación de datos para tutoriales**: las predicciones pueden usarse para crear ejemplos de visualización de resultados de clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como exactitud, precisión, recall o F1 sobre el conjunto de prueba. La model card tampoco indica comparaciones con otros modelos de clasificación de gatos/perros.

## Requisitos de hardware

- **VRAM estimada**: al ser ResNet18, el modelo requiere muy poca memoria. Con una entrada de 128x128, puede ejecutarse en CPU sin GPU, o en cualquier GPU con al menos 1-2 GB de VRAM. No hay datos oficiales de consumo.
- **GPUs recomendadas**: cualquier GPU moderna (NVIDIA GTX 10xx o superior) es suficiente. Incluso una Raspberry Pi con CPU podría ejecutar el modelo, aunque la latencia sería mayor.
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU de consumo (GTX 1060, RTX 3060, etc.).
- **Opciones de despliegue**: el modelo se usa con PyTorch directamente. No se mencionan integraciones con vLLM, Ollama o TGI (no aplican a modelos de visión). Puede desplegarse con TorchServe o en un contenedor Docker.
- **Latencia y throughput**: no disponible. Para una sola imagen, la inferencia en CPU es del orden de decenas de milisegundos, pero no hay datos oficiales.

## Comparativa con modelos similares

No hay datos de benchmarks comparativos publicados. Se puede comparar cualitativamente con otros clasificadores de gatos/perros en HuggingFace, como `hilmansw/resnet18-catdog-classifier` (también basado en ResNet18, pero entrenado con el dataset de Kaggle "Cats & Dogs"). Sin embargo, no hay métricas oficiales para comparar. La tabla siguiente muestra una comparación cualitativa:

| Modelo | Arquitectura | Dataset | Tamaño de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| billahaiml/cat-dog-resnet18 | ResNet18 | CIFAR-10 (100 img/clase) | 128x128 | MIT | HuggingFace |
| hilmansw/resnet18-catdog-classifier | ResNet18 | Kaggle Cats & Dogs | no especificado | no disponible | HuggingFace |

No se dispone de más detalles para una comparación cuantitativa.

## Limitaciones y advertencias

- **Dataset muy pequeño**: entrenado con solo 100 imágenes por clase para entrenamiento y 50 para test, lo que provoca un alto riesgo de sobreajuste y baja generalización en imágenes reales.
- **No apto para producción**: la model card advierte explícitamente que está pensado para fines educativos o de demostración, no para uso comercial o profesional.
- **Sesgos**: al usar CIFAR-10, las imágenes son de baja resolución (32x32 original, reescaladas a 128x128) y pueden no representar variedad de razas, posturas o entornos.
- **Alucinación de clasificación**: puede clasificar erróneamente imágenes ambiguas o no pertenecientes a gato/perro (por ejemplo, otros animales), ya que no tiene clase "desconocido".
- **Sin soporte de contexto**: no es un modelo de lenguaje, por lo que no aplica contexto.
- **Formato de pesos**: solo se ofrece el archivo `.pth` de PyTorch; no hay versiones en ONNX, TensorFlow ni cuantizadas.

## Enlaces

- HuggingFace: https://huggingface.co/billahaiml/cat-dog-resnet18
- Referencia de búsqueda web (modelo similar): https://free2aitools.com/model/hilmansw/resnet18-catdog-classifier
- Referencia de búsqueda web (modelo similar): https://model.aibase.com/models/details/1915741234871820290
- Repositorio GitHub similar (no oficial): https://github.com/LingxiaoMa/dog_cat_resnet18
- Modelo similar en HuggingFace: https://huggingface.co/hilmansw/resnet18-catdog-classifier

Nota: los enlaces de búsqueda web corresponden a otros modelos de clasificación gato/perro con arquitectura similar, no al modelo exacto de billahaiml.
