# kerasformers/mobilenetv4_hybrid_large_e600_r384_in1k

## Resumen

MobileNetV4 Hybrid Large es un modelo de clasificacion de imagenes y backbone desarrollado por el equipo de kerasformers como una conversion pura en Keras 3 del checkpoint `timm/mobilenetv4_hybrid_large.e600_r384_in1k`, entrenado por Ross Wightman sobre ImageNet-1k con los scripts de timm. La arquitectura MobileNetV4, presentada en el articulo arXiv:2404.10518, introduce el bloque Universal Inverted Bottleneck (UIB), que unifica disenos previos como Inverted Bottleneck, ConvNeXt y Feed Forward Network, y en su variante hibrida anade atencion Multi-Query movil (Mobile MQA). Este checkpoint en particular opera a una resolucion de entrada de 384x384 píxeles y puede usarse tanto como clasificador de imagenes como backbone de cinco etapas para tareas de vision. Su relevancia radica en que ofrece una implementacion unica que se ejecuta sin modificaciones en TensorFlow, PyTorch y JAX gracias a Keras 3, lo que facilita la portabilidad entre frameworks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV4 con bloque Universal Inverted Bottleneck (UIB) y atencion Multi-Query movil (Mobile MQA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repositorio de 0.2 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

MobileNetV4 se basa en el bloque Universal Inverted Bottleneck (UIB), una celda de busqueda que combina las operaciones de Inverted Bottleneck, ConvNeXt, Feedforward Network y una nueva variante Extra Depthwise (ExtraDW). En las variantes hibridas como esta, se anade un bloque de atencion Multi-Query movil (Mobile MQA) que reduce el coste computacional de la atencion al compartir claves y valores entre cabezas, manteniendo la eficiencia para dispositivos moviles. El modelo fue entrenado en ImageNet-1k con los scripts de timm, usando hiperparametros inspirados en el paper original de MobileNetV4 con mejoras propias de timm. La conversion a Keras 3 realizada por kerasformers reproduce exactamente los pesos del checkpoint original de timm, permitiendo cargarlos tanto con la API de clasificacion (`MobileNetV4ImageClassify`) como con la API de backbone (`MobileNetV4Model`), que devuelve las cinco etapas con strides de 2. La implementacion es agnostica al backend: funciona con TensorFlow, PyTorch y JAX sin cambios en el codigo.

## Capacidades

- Clasificacion de imagenes en ImageNet-1k con 1000 clases, devolviendo logits de salida.
- Extraccion de caracteristicas mediante backbone de cinco etapas con strides de 2, util para deteccion de objetos, segmentacion o tareas de vision por transferencia.
- Normalizacion interna de imagenes: acepta pixeles en rango [0, 255] y aplica la media y desviacion estandar de ImageNet internamente.
- Compatibilidad multi-backend: el mismo codigo se ejecuta en TensorFlow, PyTorch (via Keras 3) y JAX sin modificaciones.
- Soporte para cargar pesos directamente desde Hugging Face Hub mediante `from_weights`.
- Resolucion de entrada fija de 384x384 píxeles, lo que proporciona un buen equilibrio entre precision y coste computacional.

## Casos de uso

- Clasificacion de imagenes en produccion: el modelo puede integrarse en pipelines de vision por computador para etiquetado automatico de fotos, catalogos de productos o moderacion de contenido, gracias a su licencia Apache-2.0 que permite uso comercial sin restricciones.
- Extraccion de caracteristicas para sistemas de recuperacion: usando el backbone de 5 etapas, se pueden generar embeddings de imagenes para construir indices de busqueda visual (por ejemplo, busqueda por similitud en galerias de fotografias).
- Transferencia de aprendizaje en dominios especificos: congelando las primeras etapas y afinando las ultimas, se puede adaptar el modelo a clasificaciones especializadas (diagnostico de imagenes medicas, deteccion de defectos industriales) con pocos datos.
- Deteccion de objetos como backbone: las caracteristicas de las 5 etapas pueden alimentar cabezales de deteccion (por ejemplo, Faster R-CNN o RetinaNet) para localizar objetos en imagenes de alta resolucion.
- Segmentacion semantica: las caracteristicas multiescala del backbone son adecuadas para decodificadores de segmentacion como U-Net o DeepLabV3+, permitiendo segmentar escenas urbanas o agricolas.
- Prototipado rapido en entornos de investigacion: gracias a su implementacion en Keras 3, los investigadores pueden probar el modelo en JAX, TensorFlow o PyTorch con el mismo codigo, acelerando experimentos de arquitectura y transferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se entrena con los mismos hiperparametros que el checkpoint original de timm, que reporta una precision top-1 en ImageNet-1k del 84.5% segun la documentacion de timm, pero no se dispone de esa cifra en la informacion proporcionada para este repositorio.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 0.2 GB en pesos, por lo que la inferencia con una resolucion de 384x384 puede ejecutarse en GPUs consumer con 4 GB de VRAM o menos en precision FP32.
- GPUs recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (RTX 2060, RTX 3060, etc.). Para entrenamiento o fine-tuning con lotes grandes, se recomienda una GPU con 8-12 GB de VRAM (RTX 3080, RTX 4090).
- Compatibilidad consumer: si, es un modelo ligero pensado para dispositivos moviles, por lo que cabe en cualquier GPU consumer.
- Opciones de despliegue: al ser un modelo de vision puro, se puede servir con frameworks como TensorFlow Serving, TorchServe o ONNX Runtime, o mediante contenedores Docker con API REST.
- Latencia y throughput: no disponible, pero por su tamano reducido se espera una latencia inferior a 10 ms por imagen en una GPU moderna y varias decenas de imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Precision ImageNet-1k | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mobilenetv4_hybrid_large.e600_r384_in1k | no disponible | 384x384 | no disponible | Apache-2.0 | timm / kerasformers |
| mobilenetv4_conv_large.e600_r384_in1k | no disponible | 384x384 | no disponible | Apache-2.0 | timm |
| mobilenetv4_hybrid_medium.e500_r224_in1k | no disponible | 224x224 | no disponible | Apache-2.0 | timm |

La comparativa directa con otras variantes de MobileNetV4 (conv vs hybrid, medium vs large) muestra diferencias en resolucion y arquitectura, pero los datos de precision y parametros no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos especificos del modelo; como todo modelo entrenado en ImageNet-1k, puede reflejar sesgos de las imagenes de ese dataset (dominio occidental, objetos comunes).
- Riesgo de alucinacion en clasificacion: puede producir clasificaciones erroneas con confianza alta en imagenes fuera de distribucion o con objetos no representados en las clases de ImageNet.
- Limitacion de resolucion: el modelo espera imagenes de 384x384 píxeles; si se usan resoluciones diferentes, se debe reescalar, lo que puede degradar el rendimiento.
- No soporta otros idiomas ni texto: es un modelo exclusivamente de vision, sin capacidades multimodales.
- Licencia Apache-2.0 permite uso comercial sin restricciones, pero se recomienda revisar los terminos del checkpoint original de timm.
- El repositorio kerasformers es una conversion de pesos, no un entrenamiento nuevo; cualquier fine-tuning debe hacerse sobre los pesos originales para no perder la alineacion con los datos de entrenamiento.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/kerasformers/mobilenetv4_hybrid_large_e600_r384_in1k
- Checkpoint original de timm: https://huggingface.co/timm/mobilenetv4_hybrid_large.e600_r384_in1k
- Paper: MobileNetV4 - Universal Models for the Mobile Ecosystem (arXiv:2404.10518): https://arxiv.org/abs/2404.10518
- Documentacion de KerasFormers: https://imvision12.github.io/KerasFormers/classification_backbones/
- Repositorio de KerasFormers en GitHub: https://github.com/IMvision12/KerasFormers
