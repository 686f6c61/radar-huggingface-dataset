# qhoenix/quiet-otter

## Resumen

qhoenix/quiet-otter es un clasificador de imagenes basado en EfficientNetV2-L, la variante grande de la familia EfficientNetV2 de Google, en su implementacion de torchvision (`efficientnet_v2_l`). El checkpoint ha sido ajustado con entrenamiento adversarial para la subnet Perturb de Bittensor (netuid 26), un entorno de mineria on-chain orientado a la robustez frente a perturbaciones. El modelo conserva la cabeza de clasificacion original de 1000 clases de ImageNet-1K y no introduce cambios en la interfaz de inferencia respecto al modelo base.

El problema que aborda es la fragilidad de los clasificadores convolucionales convencionales frente a perturbaciones adversarias: el ajuste adversarial busca que las predicciones se mantengan estables ante modificaciones pequenas y controladas de la entrada. Es relevante en el contexto de la subnet Perturb, donde los mineros compiten por producir modelos verificables on-chain, y tambien como punto de partida para investigadores que necesitan un backbone robusto sin reentrenar desde cero.

El modelo tiene 119.027.848 parametros, un peso de repositorio de aproximadamente 0,5 GB y se distribuye unicamente en formato safetensors. La licencia es Apache 2.0 y el pipeline declarado es `image-classification`. No se especifican idiomas, ya que la tarea es de vision por computador, y actualmente no registra descargas ni interacciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (CNN con scaling compuesto, bloques fused-MBConv y atencion SE) |
| Parametros totales | 119.027.848 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen de 480x480 px) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors, presumiblemente fp32) |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es EfficientNetV2-L, una red neuronal convolucional que emplea escalado compuesto para balancear profundidad, anchura y resolucion. EfficientNetV2 sustituye los bloques MBConv clasicos por bloques fused-MBConv en las etapas iniciales, lo que reduce el coste de las convoluciones de expansion 1x1, e incorpora modulos de atencion squeeze-and-excitation. La variante L opera con una resolucion de entrada nominal alta (480x480 en la configuracion de inferencia declarada) y 1000 clases de salida correspondientes a ImageNet-1K.

El checkpoint parte de los pesos preentrenados de torchvision y se ha sometido a un ajuste adicional con entrenamiento adversarial para la subnet Perturb (netuid 26) de Bittensor. La model card no detalla el presupuesto de perturbacion (epsilon), el numero de pasos del ataque interno, el tipo de ataque usado durante el entrenamiento ni el volumen de datos adicionales, por lo que esos extremos quedan como no disponibles. Tampoco se documenta el uso de tecnicas de RLHF, DPO u otras fases de alineacion, algo coherente con un modelo discriminativo de vision. La model card si especifica la reproducibilidad on-chain: el hash sha256 calculado sobre la concatenacion de `model.safetensors` y la hotkey del minero (`5GgvBpF9Z4rjqFwbA88yPBKyyqYajPaeW6tMjTzdycas69z2`) es `0f1f7feea841aa90f16c8de7bcbc50498a2e78b1d335d73d034fd4e14e6381d6`.

El preprocesado de referencia es `EfficientNet_V2_L_Weights.IMAGENET1K_V1.transforms()`, que aplica redimensionado bicubico a 480, recorte central de 480 y normalizacion con media y desviacion tipica de 0,5. Cargar el modelo requiere instanciar la arquitectura sin pesos y volcar el `state_dict` con `safetensors.torch.load_file`.

## Capacidades

- Clasificacion de imagenes en 1000 categorias de ImageNet-1K, con salida de logits por clase.
- Inferencia sobre imagenes individuales o lotes a 480x480 px tras el preprocesado declarado.
- Robusteza mejorada frente a perturbaciones adversarias gracias al ajuste especifico para la subnet Perturb.
- Extraccion de caracteristicas intermedias utilizable como backbone para transfer learning en tareas de vision.
- Integracion directa con el ecosistema torchvision y PyTorch, sin dependencias de tokenizadores ni plantillas de prompt.
- Exportacion a formatos de inferencia estandar (ONNX, TorchScript) a partir del grafo de PyTorch.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo puramente discriminativo y unimodal.
- No dispone de modo de pensamiento, audio ni capacidades multilingues.

## Casos de uso

- Clasificacion de imagenes en produccion: servir el modelo mediante TorchServe, Triton o ONNX Runtime para etiquetar imagenes entrantes en las 1000 clases de ImageNet, aprovechando la interfaz estandar de torchvision y el preprocesado ya definido.
- Investigacion en robustez adversarial: usar el checkpoint como linea base ajustada con entrenamiento adversarial y comparar su comportamiento frente a ataques FGSM, PGD o C&W contra el EfficientNetV2-L original sin ajustar.
- Mineria y validacion en la subnet Perturb (netuid 26): el modelo esta preparado para el flujo de esa subnet de Bittensor, con hotkey y hash on-chain declarados, de modo que un validador puede verificar la integridad del artefacto antes de puntuarlo.
- Filtrado y moderacion de contenido por categoria de objeto: clasificar imagenes subidas por usuarios para detectar categorias no permitidas o enrutar contenido a revisores humanos segun la clase predicha.
- Preanotacion en pipelines de etiquetado: generar etiquetas iniciales sobre grandes volumenes de imagenes para que anotadores humanos solo tengan que corregir, reduciendo el coste por muestra en proyectos de vision.
- Destilacion y ajuste fino posterior: al ser un modelo de 119 M de parametros con licencia Apache 2.0, sirve como profesor para destilar versiones mas pequenas o como inicializacion para dominios especificos (medico, industrial, satelital).
- Clasificacion en el borde con cuantizacion: tras convertir a ONNX o TensorRT con precision reducida, puede desplegarse en dispositivos con GPU modesta para tareas de clasificacion de baja latencia.
- Evaluacion comparativa de tecnicas de defensa: emplear el checkpoint como referencia en estudios que midan la perdida de exactitud en datos limpios a cambio de ganancia en robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye cifras de exactitud top-1 o top-5 en ImageNet-1K, ni resultados frente a ataques adversarios de referencia, ni comparaciones con el modelo base de torchvision. Tampoco se documentan metricas de robustez como exactitud bajo PGD a un epsilon concreto.

| Benchmark | Resultado |
|---|---|
| ImageNet-1K top-1 (datos limpios) | no disponible |
| ImageNet-1K top-5 (datos limpios) | no disponible |
| Exactitud bajo ataque adversarial | no disponible |
| MMLU, HumanEval, GSM8K | no aplica (modelo de vision) |

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 0,48 GB en fp32 (119 M de parametros x 4 bytes) y aproximadamente 0,24 GB en fp16/bf16.
- VRAM total en inferencia: la resolucion de 480x480 eleva el consumo de activaciones; con lotes pequenos (1-8) conviene reservar entre 2 y 4 GB en fp32, y entre 1 y 2 GB en fp16. Estas cifras son estimaciones, no mediciones publicadas.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM funciona para lotes pequenos; para throughput alto se recomiendan A100, H100, L40S o RTX 4090.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090, incluso en fp32 y con lotes moderados.
- Opciones de despliegue: PyTorch nativo, TorchScript, ONNX Runtime, TensorRT, NVIDIA Triton Inference Server, TorchServe y Ray Serve. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que son runtimes orientados a modelos de lenguaje generativos.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

Las cifras de parametros de los modelos alternativos son datos publicos de referencia y no se han verificado contra este checkpoint concreto. No hay datos de rendimiento de este modelo para comparar, por lo que la comparacion se limita a arquitectura, tamano, resolucion y licencia.

| Modelo | Parametros | Resolucion de entrada | Tarea | Licencia |
|---|---|---|---|---|
| quiet-otter (EfficientNetV2-L ajustado) | 119.027.848 | 480x480 | Clasificacion 1000 clases | Apache 2.0 |
| EfficientNetV2-L base (torchvision) | ~118.500.000 | 480x480 | Clasificacion 1000 clases | BSD-3 (torchvision) |
| EfficientNetV2-M | ~54.100.000 | 480x480 | Clasificacion 1000 clases | BSD-3 (torchvision) |
| EfficientNet-B0 | ~5.300.000 | 224x224 | Clasificacion 1000 clases | BSD-3 (torchvision) |
| ResNet-50 | ~25.600.000 | 224x224 | Clasificacion 1000 clases | BSD-3 (torchvision) |
| ViT-B/16 | ~86.000.000 | 224x224 | Clasificacion 1000 clases | Apache 2.0 (varios checkpoints) |

## Limitaciones y advertencias

- El ajuste adversarial suele implicar un compromiso entre robustez y exactitud en datos limpios: es esperable una caida de exactitud top-1 en ImageNet estandar respecto al EfficientNetV2-L original, aunque no se publican cifras que lo confirmen.
- No hay ninguna evaluacion de sesgos documentada. Un clasificador entrenado sobre ImageNet-1K hereda los sesgos de ese dataset en cuanto a representacion de personas, culturas, objetos y contextos geograficos.
- Riesgo de alucinacion en sentido estricto no aplica (no genera texto), pero si existe riesgo de predicciones de alta confianza sobre clases incorrectas cuando la imagen esta fuera de la distribucion de ImageNet-1K.
- El espacio de etiquetas esta fijado a las 1000 clases de ImageNet-1K: no cubre categorias personalizadas ni tareas de deteccion, segmentacion o captioning.
- El modelo esta vinculado a una hotkey y a un hash on-chain de un minero concreto de la subnet Perturb, lo que implica que su validez y su puntuacion dependen del estado de esa red; conviene verificar el hash antes de usarlo en produccion.
- El repositorio no registra descargas ni likes, no hay resultados de benchmarks ni evaluaciones independientes, por lo que su calidad real no esta verificada por terceros.
- La licencia Apache 2.0 permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte, y no se documenta la procedencia exacta de los pesos base ni la fecha exacta del ajuste adversarial.
- El preprocesado es obligatorio para reproducir el comportamiento esperado: usar media y desviacion tipica distintas de 0,5 o resoluciones distintas de 480 degradara las predicciones.
- No se documenta el soporte de lotes grandes, la estabilidad numerica en fp16 ni el comportamiento con imagenes en escala de grises o con canales alfa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qhoenix/quiet-otter
- Subnet Perturb: https://perturbai.io
- Documentacion de EfficientNetV2 en torchvision: https://pytorch.org/vision/stable/models/efficientnetv2.html
- Repositorio de torchvision: https://github.com/pytorch/vision
- Documentacion de Bittensor: https://docs.bittensor.com
