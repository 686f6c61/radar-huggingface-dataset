# abhitics/Transfer_Learning_on_MNISt_fashion

## Resumen

`abhitics/Transfer_Learning_on_MNISt_fashion` no es un modelo de lenguaje ni un modelo fundacional: es un artefacto de demostración didáctica que contiene una VGG16 preentrenada en ImageNet y adaptada mediante *transfer learning* al dataset Fashion-MNIST (10 clases de prendas de ropa). Lo publica el usuario `abhitics` en Hugging Face con cero descargas y cero likes, y la model card es en realidad un tutorial de transfer learning con diagramas Mermaid y fragmentos de código PyTorch.

El problema que ilustra es clásico: cómo reutilizar un backbone convolucional entrenado en 1,2 millones de imágenes y 1000 clases para una tarea nueva con solo 70.000 imágenes en escala de grises de 28×28. La receta es congelar las 13 capas convolucionales de VGG16, sustituir el clasificador original (25088 → 4096 → 4096 → 1000) por una cabeza nueva (25088 → 1024 → 512 → 10) y entrenar solo esa cabeza con CrossEntropyLoss y Adam.

Su relevancia es formativa, no competitiva: sirve como ejemplo reproducible de *feature extraction* con torchvision, no como componente para producción. No hay información sobre métricas finales, licencia, idiomas ni pipeline en los metadatos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN VGG16 (13 capas convolucionales + 5 max-pool) con cabeza fully connected sustituida |
| Parametros totales | VGG16 original: aproximadamente 138 millones; la cabeza nueva modifica el recuento (no disponible el total exacto tras el reemplazo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (la model card no menciona cuantizacion) |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | no disponible |
| Formato de pesos | no disponible en los metadatos; la model card describe pesos PyTorch (`torchvision.models.vgg16`) |

## Arquitectura y entrenamiento

La arquitectura es una VGG16 estándar de torchvision cargada con los pesos `VGG16_Weights.IMAGENET1K_V1`. El bloque `features` (13 convoluciones organizadas en 5 bloques de 64, 128, 256, 512 y 512 canales, con max-pooling entre bloques) se congela con `requires_grad = False`, de modo que actúa como extractor de características fijo. La salida pasa por `AdaptiveAvgPool2d` a 7×7, se aplana a 25088 dimensiones y entra en una cabeza nueva compuesta por `Linear(25088, 1024) + ReLU + Dropout`, `Linear(1024, 512) + ReLU + Dropout` y `Linear(512, 10)`.

El entrenamiento se realiza sobre Fashion-MNIST (60.000 imágenes de entrenamiento y 10.000 de test, 28×28 en escala de grises). El preprocesado adapta la entrada a lo que espera VGG16: `Resize((224, 224))`, `Grayscale(num_output_channels=3)` para replicar el canal único en tres canales, `ToTensor()` y normalización con media `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]` de ImageNet. Se usa `batch_size=32`, `shuffle=True` en entrenamiento, `CrossEntropyLoss` y optimizador Adam. La model card no especifica número de épocas, *learning rate* ni si se descongelaron capas adicionales durante el ajuste fino.

## Capacidades

- Clasificación de imágenes de prendas de vestir en 10 categorías de Fashion-MNIST (camiseta, pantalón, jersey, vestido, abrigo, sandalia, camisa, zapatilla, bolso, botín).
- Extracción de características visuales genéricas mediante el backbone VGG16 congelado, reutilizable para otras tareas de visión por computador.
- *Transfer learning* por sustitución de cabeza: la receta permite cambiar el número de clases de salida ajustando la última capa `Linear(512, N)`.
- No soporta *tool calling*, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general fuera de clasificación, audio ni modo *thinking*.
- No es multilingüe ni procesa lenguaje natural.

## Casos de uso

- Docencia de *transfer learning*: el artefacto sirve como ejemplo ejecutable en cursos de *deep learning* para mostrar congelación de capas, sustitución de cabeza y preprocesado de imágenes en escala de grises a RGB de 224×224.
- Prototipado rápido de clasificadores de imágenes con pocos datos: partiendo de este *checkpoint* se puede reentrenar la cabeza para una taxonomía propia de 10 clases sin tocar el backbone.
- Clasificación de catálogos de moda: útil como línea base para etiquetar automáticamente imágenes de producto en una categoría gruesa antes de invertir en un modelo a medida.
- *Baseline* de referencia en experimentos de visión: permite comparar técnicas más modernas (ResNet, EfficientNet, ViT) contra una VGG16 congelada sobre el mismo dataset.
- Filtrado previo en pipelines de moderación o catalogación: descartar o etiquetar imágenes de prendas en un flujo de ingesta antes de un modelo más costoso.
- Pruebas de infraestructura de inferencia: por su tamaño y simplicidad, sirve para validar despliegues de PyTorch en GPU/CPU antes de migrar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye accuracy de test, matriz de confusión ni comparación con otras arquitecturas sobre Fashion-MNIST.

## Requisitos de hardware

- VRAM estimada para inferencia: VGG16 en FP32 ocupa aproximadamente 500 MB de pesos (unos 138 millones de parámetros); con activaciones y *batch* pequeño, menos de 2 GB en FP32. En FP16 se reduce a la mitad.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para la tarea.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo (GTX 1650 en adelante) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: PyTorch nativo (`torchvision.models.vgg16`), TorchScript, ONNX Runtime, TensorRT. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| abhitics/Transfer_Learning_on_MNISt_fashion (VGG16 adaptada) | aprox. 138 M (VGG16 base) | Imagen 3×224×224 | Clasificación 10 clases Fashion-MNIST | no disponible | Hugging Face |
| VGG16 original (torchvision) | aprox. 138 M | Imagen 3×224×224 | Clasificación ImageNet 1000 clases | BSD-3 (torchvision) | torchvision |
| ResNet-50 (torchvision) | aprox. 25,6 M | Imagen 3×224×224 | Clasificación ImageNet 1000 clases | BSD-3 (torchvision) | torchvision |
| EfficientNet-B0 (torchvision) | aprox. 5,3 M | Imagen 3×224×224 | Clasificación ImageNet 1000 clases | BSD-3 (torchvision) | torchvision |

La comparación es estructural: frente a ResNet-50 o EfficientNet-B0, esta VGG16 adaptada tiene un orden de magnitud más de parámetros para una tarea de 10 clases, lo que la hace menos eficiente en inferencia y entrenamiento, aunque más sencilla de explicar con fines didácticos.

## Limitaciones y advertencias

- La licencia no está declarada, por lo que no se puede asumir uso comercial sin consultar al autor; la VGG16 subyacente de torchvision tiene licencia BSD-3, pero eso no cubre los pesos derivados publicados aquí.
- No hay métricas de accuracy ni curvas de entrenamiento: se desconoce si el modelo converge correctamente o si la cabeza nueva está bien ajustada.
- El modelo está entrenado exclusivamente sobre Fashion-MNIST (28×28 en grises, 10 clases); generalizará mal a imágenes de moda reales, color, alta resolución o categorías distintas.
- Riesgo de sobreajuste si se reentrena la cabeza con datasets muy pequeños, ya que el backbone congelado no se adapta a dominios visuales alejados de ImageNet.
- El preprocesado obliga a reescalar a 224×224 y replicar canales, lo que añade coste computacional innecesario frente a arquitecturas pensadas para 28×28.
- No es un modelo de lenguaje: no genera texto, no soporta instrucciones, no tiene capacidades de agente ni de razonamiento.
- La model card es un tutorial, no una ficha técnica: los hiperparámetros de entrenamiento y el estado final del *checkpoint* no están documentados.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/abhitics/Transfer_Learning_on_MNISt_fashion
- Documentación de torchvision VGG: https://pytorch.org/vision/stable/models/vgg.html
- Pesos VGG16 en torchvision (`VGG16_Weights.IMAGENET1K_V1`): https://pytorch.org/vision/stable/models/generated/torchvision.models.vgg16.html
- Dataset Fashion-MNIST: https://github.com/zalandoresearch/fashion-mnist
- Paper original de VGG: https://arxiv.org/abs/1409.1556
