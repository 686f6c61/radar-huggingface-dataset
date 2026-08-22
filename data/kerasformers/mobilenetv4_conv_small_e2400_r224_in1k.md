# kerasformers/mobilenetv4_conv_small_e2400_r224_in1k

## Resumen

MobileNetV4 conv small es un modelo de clasificacion de imagenes desarrollado por Google, presentado en el articulo "MobileNetV4 - Universal Models for the Mobile Ecosystem" (arXiv:2404.10518). Esta variante concreta es una conversion pura a Keras 3 realizada por el proyecto KerasFormers, que permite ejecutar el mismo checkpoint sin modificaciones sobre TensorFlow, PyTorch o JAX mediante la seleccion del backend de Keras. El modelo original fue entrenado por Ross Wightman con timm sobre ImageNet-1k, alcanzando un 74,6% de top-1 accuracy.

La arquitectura introduce el bloque Universal Inverted Bottleneck (UIB), que unifica los bloques de las generaciones anteriores de MobileNet. Esta variante es completamente convolucional (sin atencion), con 3,8 millones de parametros, y se puede usar tanto como clasificador de imagenes como backbone de cinco etapas para tareas de vision. Su relevancia actual radica en que ofrece un rendimiento competitivo con un coste computacional muy bajo, apto para despliegue en dispositivos moviles y sistemas embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV4 (Universal Inverted Bottleneck, totalmente convolucional) |
| Parametros totales | 3,8 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos originales en fp32) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (conversion Keras 3; el checkpoint original de timm usa safetensors) |

## Arquitectura y entrenamiento

MobileNetV4 se basa en el bloque Universal Inverted Bottleneck (UIB), que unifica los bloques invertidos residuales de MobileNetV2/V3 con el bloque de convolution separable de MobileNetV1. El UIB permite ajustar la relacion entre el numero de canales de entrada y salida en el cuello de botella, ofreciendo mayor flexibilidad de diseno. Esta variante `conv_small` es la version completamente convolucional de la familia, sin atencion, y se entrena con un esquema de entrenamiento de 2400 epocas (indicado por el sufijo `e2400`), una estrategia de entrenamiento extendido que mejora la precision sin aumentar el tamano del modelo. La resolucion de entrada es de 224x224 píxeles.

El modelo se entreno sobre ImageNet-1k con scripts de timm y hiperparametros inspirados en el articulo de MobileNetV4. No se ha publicado informacion sobre el uso de tecnicas como RLHF o DPO, que no son aplicables a este tipo de modelo de vision. La conversion a Keras 3 mantiene los pesos originales de timm y permite cargarlos directamente con `from_weights`.

## Capacidades

- Clasificacion de imagenes en 1000 clases de ImageNet-1k, con logits de salida.
- Uso como backbone de cinco etapas con reduccion de resolucion progresiva (strides 2), util para tareas de deteccion, segmentacion o embeddings visuales.
- Compatibilidad multiplataforma: el mismo checkpoint se ejecuta sin cambios en TensorFlow, PyTorch y JAX gracias a Keras 3.
- Preprocesado interno: acepta imagenes en rango [0, 255] y normaliza con la media y desviacion estandar de ImageNet.
- No soporta tool calling, agentes ni razonamiento multimodal; es un modelo puramente visual y discriminativo.

## Casos de uso

- Clasificacion de imagenes en tiempo real en dispositivos moviles: su tamano de 3,8 millones de parametros permite inferencia con latencia de pocos milisegundos en CPUs de telefonos o en GPUs integradas, adecuado para apps de identificacion de objetos o plantas.
- Backbone para deteccion de objetos en edge: las cinco etapas de features pueden alimentar cabezales como SSD o RetinaNet en sistemas de vision embebida para vigilancia o inventario.
- Segmentacion semantica en dispositivos medicos portatiles: el backbone extrae caracteristicas de alta resolucion con coste computacional bajo, util para segmentar imagenes de ecografias o dermatoscopios en equipos sin GPU.
- Extraccion de embeddings para busqueda visual: los features de la ultima etapa pueden servir como vector de representacion para sistemas de busqueda por similitud en catalogos de productos.
- Prototipado rapido de pipelines de vision con Keras 3: al poder cambiar de backend sin modificar el codigo, se puede desarrollar con TensorFlow y desplegar con JAX en produccion.
- Fine-tuning en datasets especificos con recursos limitados: su reducido numero de parametros permite ajuste fino en una sola GPU de consumo o incluso en CPU para tareas como clasificacion de defectos industriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato contrastado es la top-1 accuracy del 74,6% en ImageNet-1K, citada por la pagina de PromptLayer para el checkpoint original de timm. No se dispone de comparaciones con otros modelos en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada: menos de 200 MB en fp32 para inferencia (3,8 millones de parametros mas overhead de activaciones a 224x224).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluidas NVIDIA GTX 1650, RTX 3060, o incluso integradas como Intel Iris Xe.
- Cabe en consumer GPU sin problema, y tambien puede ejecutarse en CPU con latencia de decenas de milisegundos por imagen.
- Opciones de despliegue: Keras 3 con backend de TensorFlow, PyTorch o JAX; tambien se puede exportar a ONNX (la comunidad ha publicado versiones ONNX de este checkpoint) y servir con ONNX Runtime o TensorRT.
- Latencia estimada: en una RTX 4090, inferencia por imagen inferior a 1 ms; en CPU de gama media, entre 10 y 30 ms por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Top-1 ImageNet | Licencia | Formato |
|---|---|---|---|---|
| MobileNetV4 conv small (este) | 3,8 M | 74,6% | Apache-2.0 | Keras 3 / safetensors |
| MobileNetV3 Small | 2,5 M | 67,4% | Apache-2.0 | Keras / TFLite |
| EfficientNet-Lite0 | 4,7 M | 75,1% | Apache-2.0 | TFLite / ONNX |
| MobileNetV4 conv medium | 9,3 M | 78,9% (aprox.) | Apache-2.0 | Keras 3 / safetensors |

MobileNetV4 conv small ofrece una precision intermedia entre MobileNetV3 Small y EfficientNet-Lite0, con un tamano de parametros similar al de EfficientNet-Lite0 pero con una arquitectura mas moderna que permite una latencia menor en dispositivos moviles. La ventaja clave frente a alternativas es su portabilidad a tres backends de deep learning sin conversion.

## Limitaciones y advertencias

- No se haan publicado en la informacion disponible los detalles sobre sesgos de los datos de entrenamiento; como modelo entrenado en ImageNet, puede heredar sesgos de las categorias representadas en ese dataset.
- Riesgo de alucinacion no aplica (no genera texto), pero puede producir clasificaciones erroneas en imagenes fuera de la distribucion de ImageNet.
- Limitacion de idioma: no aplica, es un modelo visual.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero se recomienda revisar la licencia de los pesos originales de timm, que tambien es Apache-2.0.
- Para produccion, es necesario validar el rendimiento en el dominio objetivo; la precision de 74,6% es sobre ImageNet-1K y puede degradarse en imagenes de dominios especificos.
- El repositorio de KerasFormers tiene tamano 0,0 GB, lo que indica que los pesos no estan alojados en ese repositorio sino que se cargan desde la URL del checkpoint de timm; hay que garantizar acceso a esa URL durante la inferencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kerasformers/mobilenetv4_conv_small_e2400_r224_in1k
- Checkpoint original timm: https://huggingface.co/timm/mobilenetv4_conv_small.e2400_r224_in1k
- Version ONNX del checkpoint: https://huggingface.co/onnx-community/mobilenetv4_conv_small.e2400_r224_in1k
- Articulo arXiv: https://arxiv.org/abs/2404.10518
- Repositorio GitHub KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentacion de KerasFormers: https://imvision12.github.io/KerasFormers/classification_backbones/
- Implementacion PyTorch de referencia: https://github.com/d-li14/mobilenetv4.pytorch
