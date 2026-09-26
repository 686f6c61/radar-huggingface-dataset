# ANGExllL/ivory-tern

## Resumen

Ivory-tern es un clasificador de imagenes basado en EfficientNetV2-L (la variante `efficientnet_v2_l` de torchvision) con 119.027.848 parametros, ajustado mediante entrenamiento adversarial para la subred Perturb (netuid 26) de Bittensor. El autor es el usuario de HuggingFace ANGExllL, y el modelo se publica bajo licencia Apache 2.0 con los pesos en formato safetensors (0,5 GB de repositorio).

El modelo resuelve la tarea clasica de clasificacion de imagenes en las 1000 clases de ImageNet-1K, pero su rasgo diferencial es el entrenamiento adversarial: en lugar de optimizar solo la precision sobre imagenes limpias, incorpora ejemplos perturbados en el proceso de ajuste, lo que busca mejorar la robustez frente a perturbaciones adversarias. Esto lo vincula al caso de uso del subnet Perturb, orientado a medir y mejorar la resistencia de modelos de vision ante ataques.

Es relevante ahora por dos motivos. Primero, porque la robustez adversaria es un requisito creciente en despliegues de vision en produccion (moderacion de contenido, control de calidad, conduccion autonoma). Segundo, porque ejemplifica el flujo de trabajo de las subredes de Bittensor, donde los mineros publican checkpoints con hash en cadena verificable: en este caso, `sha256(model.safetensors || hotkey) = 974038e351a597889553bc340b4d4dbc7f691ad4db24c44c31e8f374fe48aa90`. El modelo no procesa texto ni audio: es puramente de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (CNN con bloques Fused-MBConv y MBConv, conexiones residuales y squeeze-and-excitation) |
| Parametros totales | 119.027.848 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vision; la entrada es una imagen, no una secuencia de texto) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica `model.safetensors`; no se ofrecen variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; las etiquetas de salida son las 1000 clases de ImageNet-1K) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Numero de clases | 1000 (ImageNet-1K) |
| Resolucion de entrada | 480 x 480 (redimensionado bicubico, recorte central 480, media = desviacion tipica = 0.5) |
| Libreria de referencia | torchvision |
| Tamano del repositorio | 0,5 GB |
| Hash en cadena | sha256(model.safetensors \|\| hotkey) = 974038e351a597889553bc340b4d4dbc7f691ad4db24c44c31e8f374fe48aa90 |
| Hotkey del minero | 5HTMujxdVwf78DNbnLY8dAqyQLykd2mdSzZg47iA2Xs8NmTi |

## Arquitectura y entrenamiento

La base es EfficientNetV2-L, la variante grande de la familia EfficientNetV2. Se trata de una red convolucional que sustituye los bloques MBConv de las primeras etapas por bloques Fused-MBConv (convolucion 3x3 fusionada con convolucion 1x1, mas eficiente en hardware moderno), mantiene bloques MBConv con atencion por squeeze-and-excitation en las etapas profundas y aplica escalado compuesto sobre profundidad, anchura y resolucion. Con aproximadamente 119 millones de parametros y una entrada de 480x480 pixeles, es la configuracion de mayor capacidad de la familia dentro de torchvision.

El checkpoint parte de los pesos preentrenados de ImageNet-1K (`EfficientNet_V2_L_Weights.IMAGENET1K_V1`) y se ajusta con entrenamiento adversarial para la subred Perturb (netuid 26) de Bittensor. La model card no especifica el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, el tipo de perturbacion usada durante el ajuste (L-infinito, L2, ataque concreto, etc.), ni si se emplearon tecnicas adicionales como destilacion o ajuste fino con mezcla de ejemplos limpios y adversarios. Todos esos datos figuran como no disponibles. La carga del modelo es directa desde safetensors sobre la definicion de torchvision, con `weights=None`, lo que implica que no se depende de la descarga de pesos originales.

## Capacidades

- Clasificacion de imagenes en 1000 clases de ImageNet-1K: devuelve un vector de logits por imagen de entrada.
- Robustez adversarial: el ajuste con entrenamiento adversarial busca mantener la precision frente a entradas perturbadas, aunque el alcance exacto de esa robustez no se documenta.
- Inferencia por lotes: al ser una CNN estandar de torchvision, admite batching y ejecucion en GPU mediante `torch.nn.Module`.
- Integracion como extractor de caracteristicas: se puede truncar el clasificador final y usar las representaciones intermedias para tareas de transferencia (deteccion, segmentacion con cabezas propias, recuperacion por similitud), aunque esto no esta documentado por el autor.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no aplica; no procesa texto.
- Capacidades especiales (modo thinking, vision-lenguaje, audio): no disponibles; es un modelo unimodal de vision.

## Casos de uso

- Mineria y evaluacion en la subred Perturb (netuid 26) de Bittensor: el checkpoint esta publicado con hotkey y hash en cadena, por lo que puede desplegarse como minero que responde a las peticiones de clasificacion del subnet y su robustez puede verificarse frente a los ataques que define el protocolo.
- Investigacion en robustez adversaria: sirve como linea base entrenada especificamente para perturbaciones, permitiendo comparar la degradacion de precision frente al EfficientNetV2-L original de torchvision bajo distintos presupuestos de ataque.
- Moderacion de contenido automatizada: clasificacion de imagenes subidas por usuarios en 1000 categorias para filtrar contenido no permitido; la robustez a perturbaciones dificulta evasiones mediante ruido anadido a la imagen.
- Etiquetado y curacion de datasets de vision: preanotacion masiva de imagenes con las 1000 clases de ImageNet antes de una revision humana, aprovechando el batching en GPU.
- Control de calidad industrial: inspeccion visual de productos en linea de produccion donde el ruido de sensores, cambios de iluminacion o artefactos de compresion actuan como perturbaciones naturales.
- Clasificacion en flujos de e-commerce: categorizacion automatica de imagenes de producto a partir de una taxonomia mapeada a las clases de ImageNet, para enrutado y busqueda.
- Vision embarcada y robotica: al ser una CNN convolucional sin mecanismos de atencion global costosos, es compatible con runtimes de inferencia en el borde, aunque su resolucion de 480x480 exige hardware con cierta capacidad de computo.
- Red teaming de sistemas de vision: uso del modelo y su proceso de entrenamiento como referencia para evaluar la fragilidad de otros clasificadores desplegados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye exactitud top-1 ni top-5 sobre ImageNet-1K, ni curvas de precision frente a perturbaciones adversarias con presupuestos de ataque definidos, ni comparaciones con el checkpoint original de torchvision. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que tampoco existen evaluaciones de terceros publicadas.

## Requisitos de hardware

Las cifras de memoria que siguen son estimaciones calculadas a partir del numero de parametros (119.027.848), no datos publicados por el autor.

- Pesos en memoria: aproximadamente 0,48 GB en fp32, 0,24 GB en fp16/bf16 y 0,12 GB en int8.
- VRAM estimada para inferencia: del orden de 1,5 a 3 GB con lote pequeno a 480x480 en fp32, sumando pesos y activaciones; el consumo crece de forma aproximadamente lineal con el tamano de lote y depende de si se usan kernels con autocast.
- GPU recomendadas: cualquier GPU de datacenter (A100, H100, L40S) o de gama alta consumer (RTX 4090, RTX 4080) para maximizar throughput; una RTX 3090 o RTX 4070 Ti es suficiente para lotes moderados.
- GPU consumer: si, cabe en GPUs de 8 GB o mas. Una RTX 3060 de 12 GB, RTX 4060 Ti de 8/16 GB o una RTX 3070 pueden ejecutar inferencia con lotes pequenos a 480x480 en fp16. En GPUs de 4-6 GB hay que reducir el lote o la resolucion.
- CPU: es posible la inferencia en CPU (por ejemplo, con ONNX Runtime o PyTorch en modo CPU), pero a 480x480 la latencia por imagen sera alta y poco adecuada para produccion.
- Opciones de despliegue: PyTorch nativo (es el formato publicado), TorchScript, exportacion a ONNX Runtime o TensorRT para optimizacion, y TorchServe o BentoML para servir el modelo. No se publican pesos GGUF ni adaptaciones para llama.cpp, Ollama, vLLM o TGI, que estan orientados a modelos de lenguaje y no aplican a este clasificador.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

Los recuentos de parametros de los modelos alternativos son aproximados y proceden del conocimiento general de la familia, no de la informacion proporcionada en esta busqueda. La columna de rendimiento figura como no disponible porque no hay resultados publicados para ivory-tern.

| Modelo | Parametros (aprox.) | Resolucion de entrada | Contexto / tarea | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|---|
| ANGExllL/ivory-tern | 119 M | 480 x 480 | Clasificacion en 1000 clases ImageNet-1K, con ajuste adversarial | Apache 2.0 | safetensors (torchvision) | no disponible |
| EfficientNetV2-L (torchvision, IMAGENET1K_V1) | 119 M | 480 x 480 | Clasificacion en 1000 clases ImageNet-1K, sin ajuste adversarial | BSD-3-Clause (torchvision) | safetensors / PyTorch | no disponible en esta busqueda |
| EfficientNetV2-M (torchvision) | ~54 M | 480 x 480 | Clasificacion en 1000 clases ImageNet-1K | BSD-3-Clause (torchvision) | safetensors / PyTorch | no disponible en esta busqueda |
| ConvNeXt-L (torchvision) | ~198 M | 224 x 224 | Clasificacion en 1000 clases ImageNet-1K | BSD-3-Clause (torchvision) | safetensors / PyTorch | no disponible en esta busqueda |
| ViT-L/16 (torchvision) | ~304 M | 224 x 224 | Clasificacion en 1000 clases ImageNet-1K | BSD-3-Clause (torchvision) | safetensors / PyTorch | no disponible en esta busqueda |

## Limitaciones y advertencias

- No hay benchmarks publicados: no se puede afirmar que el ajuste adversarial mejore la robustez real sin mediciones con ataques y presupuestos definidos. La model card omite el tipo de perturbacion, el epsilon y la mezcla de datos limpios y adversarios.
- Robustez no transferible garantizada: un modelo entrenado contra un tipo concreto de perturbacion puede seguir siendo vulnerable a otros ataques (transferencia entre normas, ataques de parche, transformaciones geometricas, corrupcion por compresion).
- Sesgos heredados de ImageNet-1K: la taxonomia de 1000 clases incluye categorias raciales y etnicas, terminos despectivos y un sesgo marcado hacia contextos culturales anglosajones y a la fotografia amateur de internet. Las salidas pueden resultar ofensivas o inapropiadas en aplicaciones de cara al publico.
- Desequilibrio de clases: algunas clases de ImageNet-1K tienen muchas menos imagenes que otras, lo que reduce la precision en categorias de cola larga.
- Preprocesado rigido: el modelo espera exactamente el pipeline de `EfficientNet_V2_L_Weights.IMAGENET1K_V1.transforms()` (redimensionado bicubico a 480, recorte central 480, media y desviacion tipica de 0,5). Desviarse de ese pipeline degrada las predicciones.
- Alcance funcional limitado: solo clasifica imagenes en 1000 clases. No genera texto, no responde a instrucciones, no tiene tool calling ni capacidad multimodal, y no puede usarse como modelo de lenguaje.
- Falta de validacion externa: 0 descargas y 0 likes, sin issues ni discusiones en la comunidad. No hay evidencia independiente de que los pesos carguen correctamente mas alla del codigo de ejemplo de la model card.
- Licencia: los pesos se distribuyen bajo Apache 2.0, que permite uso comercial, modificacion y redistribucion con atribucion. Conviene verificar, no obstante, las condiciones del subnet Perturb de Bittensor y las implicaciones de las licencias de los datos de entrenamiento subyacentes, no detalladas en la model card.
- Requisito de verificacion en cadena: el hash declarado es `sha256(model.safetensors || hotkey)`; cualquier despliegue deberia recalcularlo para confirmar la integridad del artefacto.
- Resolucion alta: 480x480 eleva el coste computacional respecto a clasificadores de 224x224, lo que afecta a latencia y consumo energetico en despliegues de borde.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ANGExllL/ivory-tern
- Perfil del autor en HuggingFace: https://huggingface.co/ANGExllL/models
- Subred Perturb: https://perturbai.io
- Documentacion de torchvision para `efficientnet_v2_l`: https://pytorch.org/vision/stable/models/efficientnetv2.html
- Pesos preentrenados de referencia en torchvision (`EfficientNet_V2_L_Weights`): https://pytorch.org/vision/stable/models/generated/torchvision.models.efficientnet_v2_l.html
