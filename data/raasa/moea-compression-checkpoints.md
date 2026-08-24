# Raasa/moea-compression-checkpoints

## Resumen

El repositorio `Raasa/moea-compression-checkpoints` contiene checkpoints preentrenados de ResNet-18 para el proyecto [moea-compression](https://github.com/rkhosrowshahli/moea-compression), una herramienta de búsqueda evolutiva multi-objetivo para cuantización uniforme de pesos (*uniform-binning weight quantization*). Desarrollado por Raasa, este repositorio proporciona los modelos base necesarios para ejecutar experimentos de compresión sin necesidad de reentrenar desde cero.

El repositorio incluye dos checkpoints: uno entrenado en CIFAR-10 y otro en CIFAR-100, ambos con arquitectura ResNet-18 modificada (stem de convolución 3x3 sin capa de maxpool inicial). Cada archivo es un diccionario guardado con `torch.save` que contiene las claves `state_dict`, `epoch` y `best_sa`. El tamaño total del repositorio es de 0,2 GB y se distribuye bajo licencia MIT.

La relevancia de este modelo reside en su utilidad para investigadores que trabajan en compresión de modelos y cuantización de pesos, ya que ofrece puntos de partida preentrenados y estandarizados para evaluar algoritmos de búsqueda evolutiva multi-objetivo. No se trata de un modelo de lenguaje, sino de un modelo de visión por computador orientado a investigación en optimización de compresión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (stem 3x3, sin maxpool) |
| Parametros totales | Aproximadamente 11,2 millones (ResNet-18 estándar) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (los checkpoints son preentrenados; la cuantización se aplica posteriormente con moea-compression) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth.tar) |

## Arquitectura y entrenamiento

Los checkpoints corresponden a una variante de ResNet-18 con stem de convolución 3x3 y sin capa de maxpool inicial, una modificación habitual en la literatura para mejorar el rendimiento en datasets de baja resolución como CIFAR. Se trata de una red neuronal convolucional clásica, no de un transformer ni de un modelo de lenguaje.

Los modelos fueron preentrenados en los datasets CIFAR-10 y CIFAR-100. No se proporcionan detalles sobre el número de épocas, el optimizador, la tasa de aprendizaje ni la composición exacta del dataset de entrenamiento en la información disponible. Cada checkpoint se guarda mediante `torch.save` como un diccionario con las claves `state_dict`, `epoch` y `best_sa`; esta última probablemente hace referencia a la mejor métrica obtenida durante el proceso de búsqueda, aunque su significado exacto no está documentado.

La innovación principal no reside en la arquitectura del modelo en sí, sino en el proyecto moea-compression, que utiliza estos checkpoints como base para aplicar cuantización uniforme de pesos mediante búsqueda evolutiva multi-objetivo. Los checkpoints se cargan automáticamente mediante la función `create_model()` del repositorio, sin necesidad de descarga manual.

## Capacidades

- Clasificación de imágenes en CIFAR-10 (10 clases) y CIFAR-100 (100 clases).
- Modelo base preentrenado para experimentos de cuantización de pesos con búsqueda evolutiva multi-objetivo.
- Integración automática con el repositorio moea-compression mediante la función `create_model()`.
- Formato de checkpoint estándar de PyTorch, compatible con cualquier framework que soporte `torch.load`.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes, razonamiento ni capacidades multilingües.

## Casos de uso

- Investigación en cuantización de pesos: el checkpoint sirve como modelo base preentrenado para evaluar algoritmos de cuantización uniforme con búsqueda evolutiva multi-objetivo, permitiendo aislar el efecto del algoritmo de compresión sobre el rendimiento final.
- Reproducción de experimentos: al ser un checkpoint estandarizado, permite reproducir los resultados del proyecto moea-compression sin necesidad de reentrenar los modelos desde cero, lo que ahorra tiempo y recursos computacionales.
- Benchmarking de algoritmos de compresión: investigadores pueden comparar sus propios métodos de cuantización contra los resultados obtenidos con moea-compression, utilizando los mismos modelos base y datasets.
- Estudio de trade-offs entre precisión y compresión: el proyecto permite explorar el equilibrio entre el error de cuantización y la tasa de compresión, un problema central en el despliegue de modelos en dispositivos con recursos limitados.
- Educación en compresión de modelos: útil como material didáctico para cursos de optimización multi-objetivo aplicada a deep learning, ya que proporciona un caso de uso concreto y reproducible.
- Extensión a otros datasets: los checkpoints pueden servir como punto de partida para fine-tuning en tareas de clasificación de imágenes similares, aunque su alcance está limitado a los datasets CIFAR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El diccionario del checkpoint incluye una clave `best_sa` que podría contener la mejor métrica obtenida durante el entrenamiento, pero su significado exacto y los valores numéricos no están documentados en la model card.

## Requisitos de hardware

- ResNet-18 es un modelo ligero (~11 millones de parámetros). La inferencia en FP32 requiere aproximadamente 0,5-1 GB de VRAM, y significativamente menos si se aplica cuantización.
- Cabe en cualquier GPU consumer moderna: RTX 3060, RTX 4090, GTX 1660, etc. También es viable la inferencia en CPU.
- El entrenamiento de los checkpoints se realizó en CIFAR-10 y CIFAR-100, datasets pequeños que no requieren hardware especializado; una GPU con 4-8 GB de VRAM es más que suficiente.
- Para ejecutar el proyecto moea-compression, se recomienda una GPU con al menos 4 GB de VRAM para comodidad, aunque podría funcionar con menos.
- Opciones de despliegue: PyTorch nativo, ONNX Runtime, TorchScript. No es compatible directamente con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros checkpoints de cuantización. Como referencia general:

| Modelo | Arquitectura | Dataset | Licencia | Propósito |
|---|---|---|---|---|
| Raasa/moea-compression-checkpoints | ResNet-18 (stem 3x3) | CIFAR-10/100 | MIT | Cuantización con búsqueda evolutiva |
| ResNet-18 oficial (torchvision) | ResNet-18 estándar | ImageNet | BSD-3 | Clasificación general |
| Otros checkpoints de cuantización | variable | variable | variable | Compresión de modelos |

La comparativa directa no es posible sin datos de benchmarks publicados.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede utilizarse para generación de texto, chat, código ni tareas de procesamiento de lenguaje natural.
- Alcance limitado a CIFAR-10 y CIFAR-100: el modelo no ha sido entrenado en datasets más grandes o diversos, por lo que su capacidad de generalización fuera de estos dominios es limitada.
- La arquitectura modificada (stem 3x3, sin maxpool) puede no ser directamente intercambiable con implementaciones estándar de ResNet-18 en otros frameworks.
- No se documentan metadatos de entrenamiento (épocas, optimizador, hiperparámetros) en la model card, lo que dificulta la reproducibilidad completa.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o de nicho con poca adopción.
- La clave `best_sa` en el checkpoint no está documentada; su significado exacto es incierto.
- La licencia MIT permite uso comercial, pero el proyecto moea-compression puede tener sus propias condiciones adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/Raasa/moea-compression-checkpoints
- Repositorio GitHub de moea-compression: https://github.com/rkhosrowshahli/moea-compression
