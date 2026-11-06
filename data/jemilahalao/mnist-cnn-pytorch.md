# JemilahAlao/mnist-cnn-pytorch

## Resumen

`JemilahAlao/mnist-cnn-pytorch` es una red neuronal convolucional (CNN) de pequeno tamano entrenada para clasificar digitos manuscritos del conjunto de datos MNIST (clases 0-9). Lo desarrolla JemilahAlao como proyecto de aprendizaje, segun se indica en la propia model card, y se publica bajo licencia MIT. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un clasificador de imagenes de proposito especifico, con una arquitectura muy sencilla y un unico artefacto de pesos en formato PyTorch.

El modelo resuelve una tarea clasica y acotada de vision por computador: dado un recorte de 28x28 pixeles en escala de grises con un digito blanco sobre fondo negro, devuelve la clase digitica mas probable. Su relevancia es fundamentalmente didactica y de referencia: sirve como ejemplo minimo de pipeline de clasificacion con PyTorch, como baseline para comparaciones en docencia y como componente trivial en demos o prototipos. No esta pensado para produccion ni para tareas generales.

La arquitectura es una CNN feed-forward con dos bloques convolucionales seguidos de una cabeza densa, sin mecanismos de atencion ni componentes recurrentes. El repositorio ocupa 0.0 GB (pesos de un modelo de pocos cientos de miles de parametros) y no declara idiomas, ya que no procesa texto. La model card reporta una precision de test del 99.14% sobre MNIST.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (2 bloques Conv2d + ReLU + MaxPool, Flatten, Linear(3136,128), ReLU, Dropout(0.3), Linear(128,10)) |
| Parametros totales | no disponible (no declarado; estimable en el orden de cientos de miles a partir de las capas descritas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 1x28x28) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `state_dict`; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no aplica (clasificador de imagenes; no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`mnist_cnn.pth`, `state_dict`) |

Otros datos tecnicos: entrada 1x28x28 en escala de grises, normalizada con media 0.1307 y desviacion tipica 0.3081; salida de 10 clases; entrenamiento con optimizador Adam (lr 0.001), perdida CrossEntropyLoss, 5 epocas y tamano de lote 64.

## Arquitectura y entrenamiento

La arquitectura es una CNN secuencial clasica: dos bloques compuestos por convolucion 2D, activacion ReLU y max pooling, seguidos de aplanado (`Flatten`), una capa densa de 3136 a 128 neuronas, ReLU, dropout con tasa 0.3 y una capa de salida lineal de 128 a 10 clases. No emplea normalizacion por lotes, conexiones residuales, atencion ni tecnicas modernas de regularizacion mas alla del dropout. La entrada se normaliza con los estadisticos estandar de MNIST (media 0.1307, desviacion 0.3081).

El entrenamiento se realizo sobre el dataset MNIST (60.000 imagenes de entrenamiento y 10.000 de test, 10 clases), durante 5 epocas con Adam, tasa de aprendizaje 0.001, CrossEntropyLoss y lotes de 64. No se documenta el uso de aumento de datos, busqueda de hiperparametros, RLHF, DPO ni ninguna innovacion tecnica adicional. La model card no incluye informacion sobre semillas, particiones de validacion ni detalles del entorno de entrenamiento.

## Capacidades

- Clasificacion de imagenes de digitos manuscritos en 10 clases (0-9) a partir de recortes de 28x28 pixeles en escala de grises.
- Inferencia directa en CPU o GPU mediante PyTorch, cargando el `state_dict` con `torch.load`.
- Integracion sencilla en pipelines de vision con preprocesado fijo (normalizacion con media 0.1307 y desviacion 0.3081).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision general, audio ni otras capacidades especiales.
- No admite entradas de distinto tamano ni imagenes en color sin adaptacion del modelo.

## Casos de uso

- Docencia y aprendizaje de PyTorch: sirve como ejemplo minimo y reproducible de un pipeline completo de clasificacion (carga de datos, definicion de red, entrenamiento, evaluacion y publicacion de pesos). Es adecuado por su tamano reducido y su model card explicita.
- Baseline en experimentos de vision: util como referencia de precision (99.14%) para comparar arquitecturas mas complejas en MNIST o en tareas de digitos manuscritos.
- Demos interactivas de reconocimiento de digitos: se puede integrar en una aplicacion web o notebook que reciba un lienzo de dibujo, lo redimensione a 28x28, lo normalice y muestre la prediccion en tiempo real.
- Preprocesado de formularios escaneados en entornos controlados: para segmentar y clasificar digitos aislados (por ejemplo, casillas numericas) tras un paso previo de deteccion y recorte; requiere validacion adicional por su simplicidad.
- Pruebas de integracion de infraestructura de inferencia: sirve para validar despliegues de PyTorch, empaquetado de artefactos o pipelines de CI sin coste computacional relevante.
- Prototipos educativos de OCR de un solo caracter: combinado con un detector de regiones, permite construir un OCR basico de digitos para demos, siempre con la advertencia de que no generaliza a otros dominios.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| MNIST test accuracy | 99.14% | Reportado por el autor en la model card |

No se han publicado otros resultados de benchmarks (por ejemplo, comparativas con LeNet, ResNet o modelos de mayor capacidad) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB; el modelo es de pocos cientos de miles de parametros y pesos de pocos MB.
- GPU recomendadas: cualquiera, incluida una GPU integrada o una RTX 4090; el modelo no aprovecha aceleradores de gran escala.
- Cabe en cualquier GPU consumer y tambien se ejecuta en CPU sin problema.
- Opciones de despliegue: PyTorch nativo (recomendado, segun la model card), exportacion a TorchScript u ONNX (no documentada por el autor), o integracion en un servicio web propio.
- Latencia y throughput: no disponibles de forma oficial; por el tamano del modelo se espera una latencia de milisegundos por imagen en CPU y muy inferior en GPU, aunque no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Precision MNIST | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JemilahAlao/mnist-cnn-pytorch | no disponible (CNN pequena) | 1x28x28 gris | 99.14% | MIT | Hugging Face |
| LeNet-5 (referencia clasica) | ~60k | 1x32x32 gris | ~99% (referencia historica) | no aplica | Implementaciones multiples |
| CNN genericas en MNIST | variable | 1x28x28 gris | 99%+ tipico | variable | Multiples repositorios |

No se dispone de comparativas oficiales publicadas por el autor frente a otros modelos. Las cifras de LeNet-5 y de CNN genericas son referencias generales del dominio y no mediciones directas del autor.

## Limitaciones y advertencias

- Modelo de proposito muy especifico: solo clasifica digitos manuscritos de MNIST; no generaliza a otros dominios, alfabetos, colores ni tamanos de imagen.
- Sensible al preprocesado: requiere entrada 1x28x28 en escala de grises, digito blanco sobre fondo negro y normalizacion con media 0.1307 y desviacion 0.3081; desviarse de este formato degrada la precision.
- Riesgo de sobreajuste al dominio MNIST: la precision del 99.14% no implica buen rendimiento en digitos reales capturados con camara, con ruido, rotaciones o fondos distintos.
- No es un modelo de lenguaje: no tiene capacidades de generacion de texto, razonamiento, codigo ni agentes.
- Sesgos: no documentados por el autor; al entrenarse solo con MNIST, puede heredar los sesgos de estilo de escritura del dataset.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero puede producir clasificaciones erroneas con alta confianza en entradas fuera de distribucion.
- Licencia MIT: permite uso comercial y modificacion con atribucion; no obstante, el autor no ofrece garantias ni soporte.
- Sin mantenimiento documentado: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion externa ni de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JemilahAlao/mnist-cnn-pytorch
- Dataset MNIST: https://huggingface.co/datasets/mnist
- Documentacion de PyTorch: https://pytorch.org/docs/stable/index.html
