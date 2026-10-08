# MrParop/mobilenetv3-cifar10

## Resumen

MobileNetV3-Small CIFAR-10 es un clasificador de imágenes publicado por el usuario MrParop en HuggingFace. Se trata de un ajuste fino (fine-tuning) del modelo `mobilenet_v3_small` de torchvision, preentrenado originalmente en ImageNet, sobre el conjunto de datos CIFAR-10. El resultado es un modelo de 10 clases de salida que predice las categorías clásicas de CIFAR-10: avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión.

El interés del modelo es fundamentalmente educativo y de referencia: ilustra el flujo completo de transferencia de aprendizaje sobre una arquitectura convolucional ligera, con un repositorio que contiene únicamente el `state_dict` de PyTorch (`model.pth`) y un `config.json` con el orden de las clases. No compite con clasificadores de CIFAR-10 entrenados a fondo: se entrenó durante solo 2 épocas con 5000 imágenes, lo que sitúa su exactitud de test en 0,7232, lejos de lo que se obtiene con entrenamientos completos sobre las 50 000 imágenes oficiales.

Arquitectura: MobileNetV3-Small (CNN con convoluciones separables en profundidad, bloques squeeze-and-excitation y activación hard-swish). Tamaño: del orden de 2,5 millones de parámetros en la implementación de torchvision, con la cabeza final sustituida por una capa `Linear` de 10 salidas. No es un modelo de lenguaje: no tiene ventana de contexto ni soporte multilingüe. Relevante ahora únicamente como ejemplo didáctico o como base para experimentos de fine-tuning con pocos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Small (CNN con convoluciones separables en profundidad, squeeze-and-excitation y hard-swish), implementacion de torchvision |
| Parametros totales | Aproximadamente 2,5 millones en la implementacion estandar de torchvision; no confirmado explicitamente en el repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificador de imagenes; entrada de 224x224 RGB) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en punto flotante) |
| Idiomas soportados | No aplica (clasificacion de imagenes, sin componente de texto) |
| Licencia | No disponible |
| Formato de pesos | PyTorch `state_dict` (`model.pth`, cargable con `torch.load`); metadatos de clases en `config.json` |
| Tarea (pipeline) | `image-classification` |
| Numero de clases | 10 (CIFAR-10) |
| Preprocesado requerido | `MobileNet_V3_Small_Weights.IMAGENET1K_V1.transforms()` |
| Tamano del repositorio | 0,0 GB (segun la ficha de HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-07 |

## Arquitectura y entrenamiento

La base es MobileNetV3-Small, una red neuronal convolucional disenada para inferencia en dispositivos con recursos limitados. Sus bloques principales emplean convoluciones separables en profundidad (depthwise separable convolutions), mecanismos de atencion por canal del tipo squeeze-and-excitation y funciones de activacion hard-swish y ReLU, fruto de una busqueda de arquitectura (NAS) orientada a minimizar latencia en moviles. El autor parte de los pesos preentrenados en ImageNet de torchvision, sustituye la ultima capa del clasificador (`model.classifier[-1]`) por una capa `Linear` con 10 salidas y ajusta el modelo sobre CIFAR-10.

Los detalles de entrenamiento declarados en la model card son: 5000 imagenes de entrenamiento, 1000 de validacion, 2 epocas, batch size 64, optimizador AdamW con learning rate 0,001, semilla 42, seleccion del mejor checkpoint por exactitud de validacion y evaluacion sobre las 10 000 imagenes del conjunto de test oficial de CIFAR-10. No se describe ninguna innovacion tecnica adicional (no hay decodificacion especulativa, atencion lineal ni tecnicas de alineacion tipo RLHF/DPO, que no aplican a este tipo de modelo). Tampoco se documenta aumento de datos, politica de learning rate ni composicion exacta del subconjunto de entrenamiento.

## Capacidades

- Clasificacion de imagenes en 10 categorias fijas de CIFAR-10: avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco y camion.
- Inferencia sobre imagenes RGB redimensionadas y normalizadas con las transformaciones de ImageNet (`MobileNet_V3_Small_Weights.IMAGENET1K_V1.transforms()`).
- Salida de logits por clase, lo que permite obtener probabilidades tras aplicar softmax.
- Inferencia en CPU y en dispositivos de borde gracias al reducido numero de parametros.
- Exportacion potencial a TorchScript, ONNX o cuantizacion de PyTorch mediante las herramientas estandar de torchvision (no documentada por el autor).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- No dispone de modo thinking, vision-language, audio ni generacion de texto: es exclusivamente un clasificador visual.

## Casos de uso

- Docencia y aprendizaje de transfer learning: sirve como ejemplo minimo y reproducible de como adaptar un backbone preentrenado en ImageNet a un dataset de 10 clases con muy pocos recursos de computo.
- Prototipado rapido de pipelines de vision: permite montar una demo de clasificacion de extremo a extremo (carga de imagen, preprocesado, inferencia, etiqueta) en pocas lineas usando torchvision.
- Despliegue en dispositivos con recursos muy limitados: con alrededor de 2,5 millones de parametros, el modelo cabe en una Raspberry Pi o en un movil y puede ejecutarse en CPU sin GPU dedicada.
- Filtrado previo o triaje de imagenes: en un sistema de catalogacion se puede usar como primer filtro para agrupar imagenes por categoria antes de un modelo mayor.
- Base para un fine-tuning posterior: el `state_dict` publicado puede reutilizarse como punto de partida para reentrenar con mas epocas o con las 50 000 imagenes completas de CIFAR-10.
- Pruebas de integracion y benchmarking de infraestructura: al ser un modelo muy ligero, resulta util para validar un pipeline de inferencia (servidor, cola, preprocesado) sin consumir recursos.
- Demo interactiva: el autor mantiene un Space de Gradio (`MrParop/cifar10-demo`) que ilustra el uso del modelo desde el navegador.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Mejor exactitud de validacion | 0,7320 |
| Exactitud en test oficial de CIFAR-10 (10 000 imagenes) | 0,7232 |
| F1 macro en test | 0,7204 |

No se han publicado otros resultados de benchmarks (ni MMLU, HumanEval ni GSM8K, que no aplican a este tipo de modelo) ni comparaciones con alternativas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB; con aproximadamente 2,5 millones de parametros, los pesos ocupan del orden de 10 MB en fp32 y del orden de 2,5 MB en int8.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria sirve; no se necesita A100, H100 ni RTX 4090. Una GTX 1050 o una RTX 3060 son mas que suficientes, e incluso resultan sobredimensionadas.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en iGPU integradas.
- Ejecucion en CPU: totalmente viable; el modelo esta disenado para escenarios de computo reducido.
- Opciones de despliegue: PyTorch nativo (torchvision), TorchScript, exportacion a ONNX Runtime o TensorRT, cuantizacion con `torch.quantization`. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que son herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no se han publicado mediciones en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros (aprox.) | Entrada | Licencia | Exactitud en CIFAR-10 | Disponibilidad |
|---|---|---|---|---|---|
| MobileNetV3-Small CIFAR-10 (este modelo) | ~2,5 M | 224x224 RGB | no disponible | 0,7232 (test, declarado por el autor) | HuggingFace |
| torchvision `resnet18` | ~11,7 M | 224x224 RGB | BSD-3-Clause (pesos preentrenados de torchvision) | no disponible | torchvision / PyTorch Hub |
| torchvision `mobilenet_v2` | ~3,5 M | 224x224 RGB | BSD-3-Clause (pesos preentrenados de torchvision) | no disponible | torchvision / PyTorch Hub |
| torchvision `mobilenet_v3_small` (ImageNet) | ~2,5 M | 224x224 RGB | BSD-3-Clause (pesos preentrenados de torchvision) | no disponible | torchvision / PyTorch Hub |

Los recuentos de parametros de las alternativas son los de las implementaciones estandar de torchvision y se ofrecen como referencia orientativa. No hay datos publicos de exactitud en CIFAR-10 para las alternativas dentro de la informacion disponible, por lo que la comparacion cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Entrenamiento muy corto: solo 2 epocas sobre 5000 imagenes, aproximadamente el 10 % del conjunto de entrenamiento oficial de CIFAR-10 (50 000 imagenes). El propio autor lo describe como un proyecto educativo.
- Exactitud limitada: 0,7232 en test y 0,7204 de F1 macro, valores muy por debajo de los clasificadores de CIFAR-10 entrenados en condiciones completas.
- Dominio restringido: solo reconoce las 10 clases de CIFAR-10. El autor advierte de que el rendimiento sobre otros tipos de imagenes puede ser peor.
- Licencia no declarada: al no especificarse licencia, existe incertidumbre legal sobre el uso comercial del modelo y de los pesos derivados.
- Dependencia del preprocesado: es obligatorio usar las transformaciones de ImageNet indicadas y respetar el orden de clases de `config.json`; cualquier desviacion produce etiquetas incorrectas.
- Sesgos desconocidos: no hay informacion sobre la composicion del subconjunto de entrenamiento, la distribucion de clases ni analisis de sesgos o de rendimiento por clase (no se publica matriz de confusion).
- Riesgo de clasificacion erronea: la tasa de acierto de ~72 % implica que aproximadamente una de cada cuatro imagenes se etiquetara mal; no es adecuado para decisiones automatizadas sin supervision humana.
- Tamano de repositorio de 0,0 GB: conviene verificar que el archivo `model.pth` esta realmente disponible antes de integrarlo en cualquier flujo de trabajo.
- Alucinacion en el sentido de modelos generativos: no aplica, ya que el modelo no genera texto; el riesgo equivalente es la asignacion de una clase incorrecta con alta confianza (calibracion no documentada).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MrParop/mobilenetv3-cifar10
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/MrParop/cifar10-demo
- Documentacion de MobileNetV3 en torchvision: https://pytorch.org/vision/stable/models/mobilenetv3.html
- Conjunto de datos CIFAR-10 (Universidad de Toronto): https://www.cs.toronto.edu/~kriz/cifar.html
- Paper original de MobileNetV3 (Howard et al., 2019): https://arxiv.org/abs/1905.02244

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles son los del propio repositorio y las referencias tecnicas de la arquitectura y el dataset.
