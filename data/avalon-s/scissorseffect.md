# Avalon-S/ScissorsEffect

## Resumen

El repositorio `Avalon-S/ScissorsEffect` contiene cinco checkpoints de modelos de clasificación de imágenes entrenados de forma natural (sin ningún tipo de robustez adversarial) que se utilizan como *surrogates* estándar en el artículo "The Scissors Effect: When Resize-Based Input Diversity Helps or Hurts Transfer Attacks", publicado en *Transactions on Machine Learning Research* (TMLR) en 2026. El trabajo estudia cómo la diversidad de entrada basada en redimensionado (resize) afecta a los ataques de transferencia entre modelos, y estos checkpoints son necesarios para reproducir los experimentos de la parte de CIFAR-10 y todo el experimento de CIFAR-100.

Los cinco modelos son arquitecturas clásicas adaptadas a CIFAR: ResNet-18, ResNet-50, VGG-16 y DenseNet-121 para CIFAR-10, y WideResNet-28-10 para CIFAR-100. Todos se entrenaron con una receta común (SGD, 200 épocas, aumentos estándar) y alcanzan precisiones limpias entre el 93,8% y el 95,4% en CIFAR-10, y un 81,07% en CIFAR-100. El repositorio existe únicamente para facilitar la reproducibilidad, ya que estos checkpoints no están disponibles en otros lugares.

La relevancia de este modelo radica en su papel como herramienta de investigación en el campo de la robustez adversarial. Al ser modelos estándar (no robustos), sirven como referencia para comparar el comportamiento de ataques de transferencia frente a modelos robustos, y permiten aislar el efecto del redimensionado en la eficacia de los ataques.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18, ResNet-50, VGG-16, DenseNet-121 (CIFAR-10) y WideResNet-28-10 (CIFAR-100) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

Los cinco checkpoints corresponden a arquitecturas convolucionales clásicas adaptadas específicamente para CIFAR: se usa un tallo de 3x3 sin max-pool inicial, en lugar de las versiones de ImageNet con upsampling. Las arquitecturas son ResNet-18, ResNet-50, VGG-16 y DenseNet-121 para CIFAR-10, y WideResNet-28-10 para CIFAR-100. Todas se entrenaron con la misma receta: SGD con lr 0.1, momentum 0.9, weight decay 5e-4, MultiStepLR en las épocas 100 y 150 con gamma 0.1, 200 épocas, batch 128, y aumentos de RandomCrop(32, padding=4) y RandomHorizontalFlip. No se usó label smoothing, mixup, cutmix ni EMA. El entrenamiento aborta si un modelo no alcanza un umbral mínimo de precisión limpia, garantizando que los checkpoints publicados cumplen con los requisitos de los experimentos.

Los checkpoints de CIFAR-10 están guardados "envueltos": incluyen la normalización dentro del propio archivo, de modo que el modelo consume imágenes en el rango [0,1] directamente. El checkpoint de CIFAR-100 es un state dict "pelado" para la arquitectura `WideResNet` de RobustBench, y la normalización debe aplicarse externamente con las estadísticas de CIFAR-100 (media y desviación estándar indicadas en el README). Esta diferencia de formato es importante para cargar los modelos correctamente.

## Capacidades

- Clasificación de imágenes en los conjuntos CIFAR-10 (10 clases) y CIFAR-100 (100 clases).
- Inferencia con imágenes de 32x32 píxeles en el rango [0,1] (CIFAR-10) o normalizadas externamente (CIFAR-100).
- Los modelos son estándar (no robustos), por lo que son adecuados como referencia para estudiar ataques adversariales y transferencia de ataques.
- No soportan generación de texto, tool calling, agentes ni capacidades multimodales; son exclusivamente clasificadores de imágenes.

## Casos de uso

- Reproducción de experimentos de ataques de transferencia: los checkpoints son los surrogates estándar del paper "The Scissors Effect", por lo que son imprescindibles para replicar los resultados de la publicación.
- Evaluación de la robustez de modelos: al ser modelos naturales, permiten comparar el comportamiento de ataques adversariales frente a modelos robustos (entrenados con defensas) y analizar el efecto del redimensionado en la transferibilidad.
- Investigación en diversidad de entrada: se pueden usar para estudiar cómo el resize (bilineal, bicúbico, etc.) afecta a la eficacia de los ataques, ya que el paper demuestra que en modelos estándar el suavizado ayuda, mientras que en modelos robustos introduce sesgo.
- Benchmarking de métodos de ataque: sirven como base para probar nuevos métodos de ataque de caja blanca o de transferencia, ya que son modelos ligeros y rápidos de ejecutar.
- Docencia y formación en seguridad de IA: al ser modelos pequeños y con licencia MIT, son ideales para cursos o talleres sobre ataques adversariales y defensas.
- Desarrollo de herramientas de evaluación de robustez: pueden integrarse en pipelines de evaluación que requieran modelos estándar de referencia para CIFAR-10 y CIFAR-100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Sin embargo, el README proporciona las precisiones limpias de cada checkpoint, que se resumen en la siguiente tabla:

| Checkpoint | Dataset | Arquitectura | Precisión limpia |
|---|---|---|---|
| c10_resnet18.pt | CIFAR-10 | ResNet-18 | 94,92% |
| c10_resnet50.pt | CIFAR-10 | ResNet-50 | 94,66% |
| c10_vgg16.pt | CIFAR-10 | VGG-16 | 93,82% |
| c10_densenet121.pt | CIFAR-10 | DenseNet-121 | 95,39% |
| Standard_WRN28_10.pt | CIFAR-100 | WRN-28-10 | 81,07% |

Estos valores están dentro del rango esperado para arquitecturas estándar entrenadas con aumentos básicos en CIFAR. No se dispone de resultados de ataques adversariales ni de métricas de robustez en la información proporcionada.

## Requisitos de hardware

- Los cinco checkpoints son modelos de clasificación de imágenes de tamaño reducido (entre 27 MB y 140 MB), por lo que la inferencia es viable en cualquier GPU moderna con al menos 2 GB de VRAM.
- No se proporcionan datos específicos de VRAM para inferencia, pero al ser arquitecturas clásicas (ResNet, VGG, DenseNet, WideResNet) y con imágenes de 32x32, el consumo de memoria es bajo.
- El entrenamiento de los modelos se realizó en una única GPU RTX 4090, con tiempos que van desde 22 minutos (VGG-16) hasta 2,5 horas (WRN-28-10). Para inferencia, cualquier GPU de consumo (serie RTX 20, 30, 40 o superior) es suficiente.
- Opciones de despliegue: al ser checkpoints de PyTorch, se pueden cargar directamente con `torch.load` y ejecutar en cualquier entorno con PyTorch. No se mencionan formatos como ONNX, TensorRT o GGUF, por lo que la integración con motores de inferencia como vLLM u Ollama no es directa.
- La latencia de inferencia no está documentada, pero dado el tamaño de los modelos y la resolución de entrada, se espera que sea de milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría (clasificadores estándar de CIFAR). Los checkpoints de este repositorio son únicos en el sentido de que no existen en otros lugares y se entrenaron específicamente para el paper. No se han encontrado datos de rendimiento de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Los modelos son estándar (no robustos) y no deben utilizarse como defensa contra ataques adversariales; su propósito es servir como referencia en experimentos de ataque.
- No se ha evaluado su comportamiento en otros conjuntos de datos distintos de CIFAR-10 y CIFAR-100; no son modelos de propósito general.
- El formato de los checkpoints difiere entre CIFAR-10 (envueltos con normalización interna) y CIFAR-100 (state dict pelado), lo que puede causar errores si no se carga correctamente.
- La licencia MIT permite uso comercial, pero el repositorio está orientado a investigación; no se ofrecen garantías de idoneidad para producción.
- No se proporcionan datos sobre sesgos o alucinaciones, ya que son modelos de clasificación y no generativos.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un recurso reciente y poco utilizado; se recomienda verificar la integridad de los archivos mediante el checksum SHA256 proporcionado.

## Enlaces

- [HuggingFace - Avalon-S/ScissorsEffect](https://huggingface.co/Avalon-S/ScissorsEffect)
- [Paper en arXiv](https://arxiv.org/abs/2606.22516)
- [OpenReview](https://openreview.net/forum?id=b4pCcgJM0M)
- [Código en GitHub](https://github.com/Avalon-S/ScissorsEffect)
- [Página del proyecto](https://avalon-s.github.io/ScissorsEffect/)
