# dustinhugface/effv2l-r2

## Resumen

Effv2l-r2 es un clasificador de imagenes basado en la arquitectura EfficientNetV2-L de torchvision, con 119.027.848 parametros y salida sobre las 1000 clases de ImageNet-1K. El checkpoint ha sido afinado por el usuario dustinhugface mediante entrenamiento adversarial (adversarial training), una tecnica que expone al modelo a ejemplos perturbados durante el entrenamiento para mejorar su robustez frente a ataques de tipo *perturbation*.

El modelo esta vinculado a la subred Perturb (netuid 26) de Bittensor, una red descentralizada en la que los mineros compiten por ofrecer clasificadores resistentes a perturbaciones adversarias. La model card incluye la hotkey del minero y un hash on-chain que permite verificar la procedencia del checkpoint, lo que lo situa en el ecosistema de modelos verificables de Bittensor mas que en el circuito habitual de publicaciones de investigacion.

Su relevancia practica es acotada pero concreta: se trata de un clasificador de imagenes de gran tamano ya entrenado, listo para inferencia a 480x480 px, con licencia Apache 2.0 y pesos en safetensors. No publica idiomas ni contexto porque es un modelo puramente de vision, no generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (CNN, bloques MBConv y Fused-MBConv con atencion SE) |
| Parametros totales | 119.027.848 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors) |
| Idiomas soportados | no disponible / no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es `efficientnet_v2_l` de torchvision, una red convolucional de la familia EfficientNetV2 que combina bloques MBConv (con squeeze-and-excitation) y Fused-MBConv, entrenada originalmente con aprendizaje progresivo sobre ImageNet-1K. La variante L es la de mayor tamano de la familia, con cerca de 119 millones de parametros y resolucion de entrada de 480x480 px.

Sobre ese backbone, el autor aplica un ajuste fino con entrenamiento adversarial, orientado a la subred Perturb. La model card no detalla el numero de tokens/epocas, la composicion del dataset de perturbaciones ni el metodo exacto (por ejemplo PGD o FGSM), por lo que esos datos no estan disponibles. El pipeline de preprocesado declarado es `EfficientNet_V2_L_Weights.IMAGENET1K_V1.transforms()`: redimensionado bicubico a 480, recorte central a 480 y normalizacion con media y desviacion tipica de 0,5. La integridad del checkpoint se ancla mediante el hash `sha256(model.safetensors || hotkey)`.

## Capacidades

- Clasificacion de imagenes en las 1000 clases de ImageNet-1K.
- Inferencia sobre imagenes de 480x480 px tras el preprocesado indicado.
- Mayor robustez esperada frente a perturbaciones adversarias que el modelo base, por el entrenamiento adversarial (sin cifras publicadas que lo cuantifiquen).
- Carga directa en PyTorch/torchvision mediante `safetensors.torch.load_file` sobre `efficientnet_v2_l(weights=None)`.
- No soporta generacion de texto, razonamiento, codigo, tool calling, agentes ni capacidades multilingues: es exclusivamente un clasificador de vision.
- No incluye capacidades de deteccion, segmentacion, vision-lenguaje ni audio.

## Casos de uso

- Clasificacion de imagenes en produccion: servir el modelo tras un endpoint que aplique el preprocesado declarado (resize bicubico 480, center crop 480, normalizacion 0,5) y devolver la etiqueta ImageNet dominante.
- Filtrado o etiquetado automatizado de catalogos de imagenes: usar las 1000 clases como taxonomia base para preclasificar lotes antes de un etiquetado humano.
- Mineria en la subred Perturb (Bittensor, netuid 26): desplegar el checkpoint como minero y someterlo a evaluacion on-chain, verificando la procedencia con la hotkey y el hash indicados.
- Evaluacion de robustez adversaria: emplear el modelo como referencia afinada con adversarial training y compararlo contra el EfficientNetV2-L original bajo distintos niveles de perturbacion.
- Moderacion o triaje visual en pipelines con imagenes controladas a 480x480, donde el coste de un clasificador convolucional es menor que el de un transformer de vision equivalente.
- Investigacion sobre transferencia de robustez: analizar si el ajuste adversarial sobre ImageNet-1K mantiene precision en clases no vistas o en dominios desplazados.
- Componente en un sistema mayor de vision: extraer logits o embeddings del backbone para alimentar tareas posteriores (recuperacion, clustering, re-ranking).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint concreto. La model card no incluye metricas de precision (top-1/top-5) ni de robustez adversaria del ajuste.

Como referencia de la arquitectura base (no de este fine-tune), EfficientNetV2-L original se situa en torno al 85,7 % de top-1 en ImageNet-1K con aproximadamente 118,5 M de parametros, segun la publicacion de EfficientNetV2. Ese dato corresponde al modelo preentrenado de Google Research y no debe atribuirse al checkpoint adversario aqui descrito.

## Requisitos de hardware

- Peso en disco de los pesos: el repo ocupa 0,5 GB; en fp32 los 119 M de parametros suponen unos 476 MB, y en fp16 unos 238 MB.
- VRAM estimada para inferencia: por debajo de 2 GB en fp16 a resolucion 480x480 con batch 1; el consumo crece con el tamano de lote y las activaciones a esa resolucion.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050 o superiores). Modelos como RTX 3060, 3090, 4090, A100 o H100 sobran para este modelo.
- Cabe sobradamente en GPU de consumo; incluso una GPU integrada moderna puede ejecutar inferencia a batch pequeno.
- Opciones de despliegue: PyTorch + torchvision como via nativa; exportacion a ONNX y TensorRT para latencia reducida; TorchScript para servir. vLLM, llama.cpp, Ollama o TGI no son aplicables porque estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependeran de la GPU y del backend. Al ser una CNN de 119 M de parametros a 480x480, la latencia por imagen en GPU moderna suele ser de pocos milisegundos, pero no hay cifras medidas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| effv2l-r2 (este) | 119,0 M | 480x480 | Clasificacion ImageNet-1K, ajuste adversarial | Apache 2.0 | HuggingFace |
| EfficientNetV2-L base (torchvision/Google) | ~118,5 M | 480x480 | Clasificacion ImageNet-1K | Apache 2.0 (torchvision) | torchvision / TF Hub |
| ConvNeXt-L | ~198 M | 224x224 | Clasificacion ImageNet-1K | MIT / Apache 2.0 (segun version) | HuggingFace / torchvision |
| ViT-L/16 | ~304 M | 224x384 | Clasificacion ImageNet-1K | Apache 2.0 (segun checkpoint) | HuggingFace / timm |

La comparativa de rendimiento numerico entre estos modelos no esta disponible para effv2l-r2, ya que no se han publicado sus metricas. La diferencia principal frente al EfficientNetV2-L base es el ajuste adversarial y su integracion en la subred Perturb; frente a ConvNeXt-L y ViT-L/16, este modelo parte de un backbone convolucional mas ligero en parametros.

## Limitaciones y advertencias

- Es un clasificador de imagen cerrado a 1000 clases de ImageNet-1K; no genera texto ni admite instrucciones.
- No se han publicado metricas de precision ni de robustez, por lo que su rendimiento real frente a la base es desconocido.
- Puede clasificar incorrectamente imagenes fuera de la distribucion de ImageNet-1K o con dominios muy distintos.
- El rendimiento depende estrictamente del preprocesado declarado; usar otra normalizacion o resolucion degradara los resultados.
- La mejora de robustez adversaria no implica inmunidad total a ataques; el entrenamiento adversarial suele reducir la precision limpia, aunque aqui no hay cifras que lo confirmen.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del ecosistema Bittensor y del subnet Perturb si se usa en mineria.
- Repositorio sin descargas ni likes y sin documentacion adicional; el soporte comunitario es nulo.
- Fecha de publicacion registrada como 2026-09-30, lo que conviene verificar antes de tomarla como referencia temporal.

## Enlaces

- HuggingFace: https://huggingface.co/dustinhugface/effv2l-r2
- Perturb (subred netuid 26): https://perturbai.io
- Paper de EfficientNetV2 (arquitectura base): https://arxiv.org/abs/2104.00298
- Documentacion de torchvision EfficientNetV2: https://pytorch.org/vision/stable/models/efficientnetv2.html
- Bittensor: https://bittensor.com
