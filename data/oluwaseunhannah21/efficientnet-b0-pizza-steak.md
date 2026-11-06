# Oluwaseunhannah21/efficientnet-b0-pizza-steak

## Resumen

EfficientNet-B0 pizza vs steak es un clasificador binario de imagenes desarrollado por el usuario Oluwaseunhannah21 como proyecto de aprendizaje de transfer learning. El modelo parte de un EfficientNet-B0 preentrenado en ImageNet (via torchvision) y sustituye la cabeza de clasificacion original por una nueva capa lineal de 1280 a 1 con activacion sigmoide, de modo que la salida es la probabilidad de que la imagen pertenezca a la clase "steak" (indice 1), mientras que el indice 0 corresponde a "pizza".

El modelo no introduce innovaciones arquitectonicas: es un fine-tuning de dos fases sobre un backbone convolucional estandar, pensado exclusivamente para distinguir entre dos categorias de comida. Su relevancia es limitada y de caracter didactico; no esta pensado para produccion ni para tareas generales de vision.

La ficha se basa unicamente en la informacion publicada en la model card y en los metadatos de Hugging Face. No hay paper asociado, ni datos de benchmarks externos, ni informacion sobre sesgos o evaluacion multilingue (no aplica, al ser un modelo de vision).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN con compound scaling) preentrenada en ImageNet, cabeza binaria Dropout(0.2) + Linear(1280, 1) + sigmoid |
| Parametros totales | no disponible (EfficientNet-B0 estandar ronda los 5,3 M, pero el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en .pth; no hay versiones GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible (no aplica; clasificacion de imagenes sin componente linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth), acompanado de config.json y model.py |

## Arquitectura y entrenamiento

El backbone es un EfficientNet-B0, una red convolucional que aplica escalado compuesto (profundidad, anchura y resolucion) sobre bloques MBConv con conexiones residuales y atencion por squeeze-and-excitation. El autor reemplaza la capa de clasificacion de 1000 clases por una cabeza binaria: Dropout con tasa 0,2, capa lineal de 1280 a 1 y activacion sigmoide. La perdida es BCEWithLogitsLoss.

El entrenamiento se realizo en dos fases. En la primera se congelo el backbone y se entreno solo la nueva cabeza con Adam, learning rate 0,001 y 5 epocas. En la segunda se descongelaron los ultimos tres bloques de caracteristicas y se continuo el entrenamiento con Adam, learning rate 0,0001 y 5 epocas mas. El batch size fue de 32 y se aplico augmentacion con random resized crop, volteo horizontal y color jitter. El conjunto de datos consta de 1200 imagenes de entrenamiento, 300 de validacion y 500 de test. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de imagenes.

## Capacidades

- Clasificacion binaria de imagenes: distingue entre "pizza" (indice 0) y "steak" (indice 1).
- Salida de probabilidad calibrada mediante sigmoide sobre el logit de la clase "steak".
- Inferencia sobre imagenes individuales mediante la funcion `predict` incluida en el archivo `model.py` del repositorio.
- Carga de pesos mediante `hf_hub_download` y ejecucion en PyTorch.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes, razonamiento multi-paso ni modos de pensamiento.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de vision general mas alla de la clasificacion binaria entrenada; no hace deteccion, segmentacion ni captioning.

## Casos de uso

- Filtrado de imagenes en un catalogo de recetas: el modelo puede etiquetar automaticamente fotografias de platos como pizza o steak para organizar un recetario o una base de datos gastronomica, siempre que el dominio de las imagenes se parezca al del conjunto de entrenamiento.
- Moderacion de contenido en foros de cocina: clasificacion rapida de imagenes subidas por usuarios para dirigirlas al subforo adecuado, con la advertencia de que el modelo siempre asigna una de las dos clases.
- Prototipo educativo de transfer learning: sirve como ejemplo reproducible de fine-tuning en dos fases con EfficientNet-B0, util para cursos y tutoriales de vision por computador.
- Prueba de concepto en aplicaciones moviles: al ser un modelo pequeno (EfficientNet-B0), puede exportarse a TorchScript o ONNX y ejecutarse en dispositivos con recursos limitados, aunque el autor no proporciona esas exportaciones.
- Etiquetado asistido en anotacion de datasets: preetiquetar imagenes de pizza y steak para que un humano revise y corrija, acelerando la construccion de un corpus mayor.
- Demostracion de pipelines de Hugging Face Hub: ejemplo minimo de descarga de pesos, carga de codigo auxiliar y ejecucion de inferencia, util como plantilla para publicar modelos propios.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en test (500 imagenes) | 99,80 % |

No se han publicado resultados de benchmarks estandar (ImageNet, Food-101, etc.) ni comparaciones con otros modelos en la informacion disponible. La unica metrica reportada es la precision sobre el conjunto de test propio del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para EfficientNet-B0 con entrada de 224x224; el autor no proporciona la resolucion exacta de entrada.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) es suficiente; tambien puede ejecutarse en CPU con latencias de decenas de milisegundos por imagen.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: PyTorch nativo (unico formato publicado); no hay artefactos para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imagenes. Seria necesaria una exportacion manual a ONNX o TorchScript para otros runtimes.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientNet-B0 pizza vs steak (este modelo) | no disponible (backbone B0 estandar) | Imagen 2D, resolucion no declarada | 99,80 % en test propio (500 imagenes) | MIT | Hugging Face, pesos .pth |
| EfficientNet-B0 ImageNet (torchvision) | ~5,3 M | Imagen 2D, 224x224 | Top-1 ImageNet ~77,7 % (referencia externa, no reportada por el autor) | BSD-3 (torchvision) | Torchvision, ampliamente disponible |
| ResNet-50 ImageNet (torchvision) | ~25,6 M | Imagen 2D, 224x224 | Top-1 ImageNet ~76,1 % (referencia externa) | BSD-3 (torchvision) | Torchvision |
| MobileNetV3-Large ImageNet (torchvision) | ~5,5 M | Imagen 2D, 224x224 | Top-1 ImageNet ~74,0 % (referencia externa) | BSD-3 (torchvision) | Torchvision |

Las cifras de los modelos de referencia son orientativas y no provienen de la model card; se incluyen solo como contexto de categoria. No existen comparaciones publicadas por el autor frente a otros clasificadores binarios de comida.

## Limitaciones y advertencias

- El modelo solo conoce dos clases y siempre devolvera una de ellas, incluso ante imagenes no relacionadas (limitacion declarada explicitamente por el autor).
- El conjunto de test es pequeno (500 imagenes) y probablemente comparte dominio con el de entrenamiento, por lo que la precision del 99,80 % no es extrapolable a imagenes del mundo real con iluminacion, angulos o estilos distintos.
- No hay informacion sobre la procedencia de las imagenes ni sobre posibles sesgos de clase, estilo culinario o composicion.
- Riesgo de sobreajuste: 1200 imagenes de entrenamiento y dos fases de fine-tuning con descongelacion parcial pueden producir una generalizacion limitada.
- No se documentan sesgos demograficos ni geograficos, pero al ser un dataset de comida podria estar sesgado hacia una cocina o presentacion concreta.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias de ningun tipo.
- No hay versiones cuantizadas, ONNX ni TorchScript, lo que complica el despliegue en entornos no PyTorch.
- Proyecto de aprendizaje sin mantenimiento declarado; creado y actualizado el mismo dia (2026-11-02), sin descargas ni likes.
- No apto para decisiones de produccion sin una reevaluacion sobre un conjunto de datos representativo del dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Oluwaseunhannah21/efficientnet-b0-pizza-steak
- EfficientNet (paper original, referencia del backbone): https://arxiv.org/abs/1905.11946
- EfficientNet-B0 en torchvision: https://pytorch.org/vision/stable/models/efficientnet.html
- Documentacion de Hugging Face Hub para descarga de pesos: https://huggingface.co/docs/huggingface_hub
