# Rahma-cloud/mnist-cnn-pytorch

## Resumen

Este modelo es un clasificador de dígitos manuscritos basado en una red neuronal convolucional (CNN) pequeña, desarrollado por el usuario Rahma-cloud y publicado en Hugging Face. No se trata de un modelo de lenguaje, sino de un modelo de visión por computador entrenado sobre el clásico dataset MNIST, con el objetivo de reconocer dígitos escritos a mano del 0 al 9. Según su model card, se trata de un proyecto de aprendizaje para principiantes.

Su relevancia es principalmente educativa: sirve como ejemplo completo y funcional de un pipeline de clasificación de imágenes en PyTorch, desde la normalización de entradas hasta la carga de pesos desde Hugging Face Hub. Alcanza una precisión del 99,03 % en el conjunto de test de MNIST, un resultado sólido para una arquitectura tan compacta. El repositorio pesa prácticamente 0,0 GB, lo que confirma que el modelo es minúsculo y ejecutable en cualquier hardware, incluida la CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (2 bloques Conv2d + ReLU + MaxPool, followed by capas densas) |
| Parametros totales | no disponible (aprox. del orden de cientos de miles según la arquitectura descrita) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión, sin componente lingüístico) |
| Licencia | MIT |
| Formato de pesos | .pth (checkpoint de PyTorch) |

## Arquitectura y entrenamiento

La arquitectura consiste en dos bloques convolutivos seguidos, cada uno compuesto por una capa Conv2d, activación ReLU y MaxPool, que reducen progresivamente la resolución espacial de la imagen de entrada. Tras el aplanado (Flatten), la red pasa por una capa lineal de 3136 a 128 neuronas, otra ReLU, un Dropout del 30 % para regularización y una capa final lineal de 128 a 10 salidas, correspondientes a los diez dígitos posibles. La dimensión 3136 de entrada a la capa densa indica que las dos capas de MaxPool reducen la imagen de 28x28 a 7x7 con 64 canales.

El entrenamiento se realizó con el optimizador Adam (learning rate 0,001), función de pérdida CrossEntropyLoss, 5 épocas y un tamaño de batch de 64. Las imágenes de entrada se normalizan con media 0,1307 y desviación estándar 0,3081, los valores estándar del dataset MNIST. No se dispone de información sobre el hardware de entrenamiento ni sobre técnicas adicionales como aumento de datos.

## Capacidades

- Clasificación de imágenes en escala de grises de 1x28x28 píxeles en 10 clases (dígitos del 0 al 9).
- Precisión del 99,03 % en el conjunto de test de MNIST según el autor.
- Inferencia ligera: ejecutable en CPU sin requisitos de GPU.
- Carga sencilla de pesos mediante `huggingface_hub.hf_hub_download` y `torch.load`.
- No soporta procesamiento de lenguaje natural, tool calling, agentes ni capacidades multimodales: es un clasificador de imágenes puro.

## Casos de uso

- Aprendizaje de deep learning: ideal como primer proyecto de visión por computador, ya que el código de la arquitectura y el pipeline de entrenamiento están documentados en la model card y son fáciles de replicar y modificar.
- Prototipado rápido de OCR de dígitos: puede integrarse en aplicaciones que necesiten reconocer dígitos individuales, como la lectura de números en formularios escaneados, siempre que las imágenes se preprocesen a 28x28 en escala de grises con dígito blanco sobre fondo negro.
- Sistemas de reconocimiento de números de matrícula o contadores: como módulo de clasificación de dígitos aislados tras una etapa de segmentación de caracteres.
- Verificación de entradas manuscritas: validación de dígitos escritos a mano en encuestas o cheques bancarios digitalizados, tras recorte y redimensionado de cada dígito.
- Pruebas de despliegue y MLOps: por su tamaño minúsculo, es un candidato perfecto para practicar la exportación de modelos (ONNX, TorchScript), la creación de APIs de inferencia (FastAPI, Flask) o el despliegue en dispositivos con recursos muy limitados.
- Baseline de comparación: sirve como referencia rápida para evaluar mejoras arquitectónicas (residuales, augmentation, más épocas) sobre MNIST antes de escalar a datasets más complejos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy en test de MNIST | 99,03 % |

No se han publicado comparaciones con otros modelos en la información disponible. Como referencia contextual general, las CNN convolucionales sencillas suelen situarse entre el 98,5 % y el 99,5 % en MNIST, por lo que el resultado reportado está dentro de lo esperado para esta categoría de arquitectura.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable (el modelo ocupa unos cientos de KB a pocos MB); no se necesita GPU.
- GPU recomendadas: ninguna; la inferencia en CPU es plenamente viable. Cualquier GPU moderna lo ejecuta sin problema si se desea.
- Consumer GPU: cabe sobradamente en cualquier GPU, incluidas integradas; no es un factor limitante.
- Despliegue: PyTorch nativo (carga del checkpoint .pth con `torch.load`), compatible con `torch.compile`, exportación a TorchScript u ONNX, y ejecución en servidores modestos, contenedores o dispositivos edge.
- Latencia y throughput estimados: no disponibles; dada la arquitectura, la inferencia por imagen es del orden de milisegundos en CPU moderna.

## Comparativa con modelos similares

| Modelo | Tipo | Accuracy MNIST | Licencia | Notas |
|---|---|---|---|---|
| Rahma-cloud/mnist-cnn-pytorch | CNN propia en PyTorch | 99,03 % (reportada) | MIT | Proyecto educativo, pesos en .pth |
| MNistas clásicos (LeNet-5 y variantes) | CNN | ~99,0-99,4 % | Variada | Arquitectura de referencia histórica |
| Modelos MLP simples sobre MNIST | Perceptrón multicapa | ~97-98 % | Variada | Menores precisión y capacidad |

No se dispone de enlaces a modelos alternativos concretos en la información proporcionada; la comparativa se ofrece a título orientativo basándose en resultados típicos conocidos de la literatura sobre MNIST.

## Limitaciones y advertencias

- Dominio muy restringido: solo clasifica dígitos del 0 al 9 en imágenes de 28x28 en escala de grises con dígito blanco sobre fondo negro. Cualquier desviación (fondo blanco, dígitos en color, resolución distinta) requerirá preprocesado adaptado.
- No generaliza a otros caracteres, letras u objetos; intentar usarlo fuera de MNIST producirá resultados no fiables.
- La precisión del 99,03 % la reporta el autor en su model card; no existe verificación independiente en la información disponible.
- El número de parámetros exacto no está documentado, aunque puede deducirse de la arquitectura.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución; sin restricciones relevantes.
- Al ser un proyecto de aprendizaje, es probable que no incluya manejo de casos límite (imágenes vacías, ruido, dígitos ambiguos), por lo que conviene añadir validación de entradas en producción.
- Repositorio con 0 descargas registradas: comunidad y mantenimiento limitados; no debe esperarse soporte activo del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rahma-cloud/mnist-cnn-pytorch
- Dataset MNIST: https://huggingface.co/datasets/mnist
- No se han encontrado enlaces adicionales (papers, blogs, demos) en la información disponible.
