# qhoenix/ember-kestrel

## Resumen

qhoenix/ember-kestrel es un clasificador de imágenes basado en EfficientNetV2-L (la implementación `efficientnet_v2_l` de torchvision, con cabeza de 1000 clases de ImageNet-1k) afinado mediante entrenamiento adversarial para la subred Perturb (netuid 26 de Bittensor). No es un modelo de lenguaje: su entrada es una imagen y su salida es un vector de logits sobre las 1000 clases de ImageNet-1k. El checkpoint se publica en formato safetensors y se carga con `safetensors.torch.load_file` sobre una instancia de `torchvision.models.efficientnet_v2_l(weights=None)`.

El interés del modelo es doble. Por un lado, el entrenamiento adversarial busca robustez frente a perturbaciones en la imagen de entrada, un requisito habitual en entornos donde el clasificador puede recibir datos manipulados o degradados. Por otro, el modelo está vinculado a una identidad de minero en la subred Perturb: la model card publica la hotkey del minero y un hash on-chain `sha256(model.safetensors || hotkey) = 73db94b0cf9cdb02ec17ccfb0bb88981d02495c9c622b5fd7aeaffc64f40aa93`, lo que permite verificar que los pesos publicados corresponden a la contribución registrada en la cadena.

El modelo tiene 119.027.848 parámetros (dato real leído del safetensors), un repositorio de 0,5 GB y licencia Apache-2.0. En el momento de redactar esta ficha acumula 0 descargas y 0 likes, y no se ha publicado información sobre el dataset de entrenamiento, el número de pasos, la composición de las perturbaciones ni resultados de benchmarks. La ausencia de documentación adicional limita su uso en producción sin una evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (torchvision `efficientnet_v2_l`); red convolucional con bloques Fused-MBConv y MBConv, atención por canales (SE) y compound scaling |
| Parámetros totales | 119.027.848 (dato real del archivo safetensors; incluye la cabeza de clasificación de 1000 clases) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificación de imágenes; no procesa secuencias de texto) |
| Tipos de cuantización | No disponible (no se documentan cuantizaciones; el repositorio distribuye pesos en safetensors, presumiblemente FP32) |
| Idiomas soportados | No aplica (no es un modelo de lenguaje). Las 1000 etiquetas de salida corresponden a las clases de ImageNet-1k |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |
| Resolución de entrada | 480 × 480 píxeles (redimensionado bicúbico a 480 y recorte central a 480) |
| Normalización | media = desviación = 0,5 en los tres canales |
| Espacio de salida | 1000 clases de ImageNet-1k |
| Tamaño del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura es la de EfficientNetV2-L tal y como se distribuye en torchvision: una red convolucional con `compound scaling` que combina bloques Fused-MBConv en las etapas iniciales (más eficientes en GPU a resoluciones bajas) y bloques MBConv con módulos de `squeeze-and-excitation` en las etapas profundas. La variante L es la mayor de la familia en su configuración estándar. La cabeza clasificadora proyecta el vector de características a 1000 salidas, una por clase de ImageNet-1k.

El modelo parte de los pesos preentrenados de ImageNet-1k de torchvision (`EfficientNet_V2_L_Weights.IMAGENET1K_V1`) y se afina con entrenamiento adversarial para la subred Perturb (netuid 26 de Bittensor). La model card no especifica el dataset de ajuste fino, el tipo de perturbación empleada (por ejemplo, ataques L-infinito tipo PGD/FGSM u otras transformaciones), el número de épocas, el optimizador ni si se aplicó algún esquema de `adversarial training` con proporción mixta de ejemplos limpios y adversariales. Tampoco se documenta si hubo destilación, aumento de datos adicional o calibración de temperatura. Toda esa información debe considerarse no disponible.

El único detalle de preprocesado documentado es explícito y crítico para reproducir el comportamiento esperado: `EfficientNet_V2_L_Weights.IMAGENET1K_V1.transforms()`, es decir, redimensionado bicúbico a 480 píxeles, recorte central a 480 × 480 y normalización con media y desviación estándar de 0,5 en los tres canales. Cualquier otro pipeline de preprocesado (resolución distinta, normalización con las medias estándar de ImageNet o interpolación bilineal) puede degradar la precisión de forma no documentada.

## Capacidades

- Clasificación de imágenes en 1000 categorías de ImageNet-1k (salida de logits, una por clase).
- Robustez esperada frente a perturbaciones en la entrada, como consecuencia del entrenamiento adversarial para la subred Perturb; el tipo y la magnitud de las perturbaciones cubiertas no están documentados.
- Extracción de características: el `state_dict` puede cargarse sin la cabeza final para usarse como backbone convolucional en tareas de visión (detección, segmentación, recuperación de imágenes, clasificación con número de clases distinto).
- Procesamiento por lotes a 480 × 480 píxeles, apto para inferencia en GPU o CPU.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión-lenguaje, audio ni modo `thinking`.
- No dispone de capacidades multilingües: no procesa ni genera texto.

## Casos de uso

- Moderación de contenido visual en plataformas: el modelo puede clasificar imágenes entrantes en las 1000 categorías de ImageNet-1k y servir como señal auxiliar en un pipeline de moderación; su entrenamiento adversarial es relevante cuando los usuarios intentan evadir el clasificador con perturbaciones o compresiones agresivas.
- Evaluación de robustez adversarial como referencia: al ser un EfficientNetV2-L afinado con entrenamiento adversarial y con pesos verificables mediante hash on-chain, sirve para comparar la resiliencia de distintos backbones frente a ataques controlados en un entorno de investigación.
- Backbone para `transfer learning` en visión industrial: cargando el `state_dict` sin la cabeza de 1000 clases y sustituyéndola por una capa adaptada al número de defectos o categorías de una línea de producción.
- Minería y validación en la subred Perturb (Bittensor, netuid 26): el modelo se publica con la hotkey del minero y un hash `sha256(model.safetensors || hotkey)`, de modo que otros participantes pueden verificar la correspondencia entre pesos y contribución on-chain; el caso de uso es la propia competición de la subred.
- Pretratamiento de imágenes en pipelines de datos: uso como clasificador rápido para etiquetar, filtrar o deduplicar grandes volúmenes de imágenes antes de entrenar otros modelos, aprovechando que el checkpoint ocupa solo 0,5 GB.
- Clasificación en el borde (edge): con 119 millones de parámetros y pesos de aproximadamente 476 MB en FP32 (o 238 MB en FP16), es viable desplegarlo en GPUs de gama media o incluso en CPU para inferencia por lotes pequeños.
- Investigación en `adversarial training`: al conocerse la arquitectura exacta y el preprocesado, el modelo se puede usar como punto de partida reproducible en estudios sobre transferibilidad de ataques y sobre el compromiso entre precisión en datos limpios y robustez.
- Recuperación de imágenes y búsqueda visual: las características intermedias del backbone pueden indexarse como `embeddings` para búsqueda por similitud sobre catálogos de producto o archivos fotográficos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye precisión `top-1` o `top-5` sobre ImageNet-1k, ni métricas de robustez (precisión bajo ataque a distintos valores de épsilon), ni comparaciones con los pesos originales de torchvision o con otros modelos. Tampoco se documentan curvas de compromiso entre precisión limpia y precisión adversarial, que son el dato central en cualquier trabajo de entrenamiento adversarial.

| Benchmark | Resultado |
|---|---|
| ImageNet-1k top-1 (datos limpios) | No disponible |
| ImageNet-1k top-5 (datos limpios) | No disponible |
| Precisión bajo ataque adversarial | No disponible |
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | No aplica (no es un modelo de lenguaje) |

## Requisitos de hardware

- Pesos en FP32: aproximadamente 476 MB (119.027.848 parámetros × 4 bytes). En FP16: aproximadamente 238 MB. En INT8: aproximadamente 119 MB. Son estimaciones derivadas del recuento real de parámetros del safetensors, no cifras publicadas por el autor.
- VRAM de inferencia: el checkpoint en sí es pequeño (menos de 0,5 GB en FP32); el consumo dominante son las activaciones a 480 × 480. Para lote 1 en FP16 es razonable esperar un consumo total por debajo de 2 GB, aunque no hay mediciones publicadas y la cifra depende del backend y de la implementación.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4090, etc.). También es viable en CPU para lotes pequeños, con latencia mayor.
- GPUs recomendadas para servicio en producción: NVIDIA T4, L4, A10G, RTX 4090 para cargas medias; A100 o H100 solo si se necesita agregar muchos lotes concurrentes o integrarlo junto a otros modelos.
- Opciones de despliegue: PyTorch con `safetensors.torch.load_file` y `torchvision` (la vía documentada por el autor); exportación a ONNX y ejecución con ONNX Runtime o TensorRT; TorchServe o NVIDIA Triton para servir el modelo exportado. No hay soporte nativo en llama.cpp, Ollama, vLLM ni TGI, ya que son herramientas orientadas a modelos de lenguaje y este modelo no expone pesos en GGUF.
- Latencia y throughput: no disponible. No se han publicado medidas de tiempo de inferencia ni de imágenes por segundo en ninguna GPU.

## Comparativa con modelos similares

La comparativa se plantea frente a otros clasificadores de tamaño comparable disponibles en torchvision y entrenados sobre ImageNet-1k. Los datos de precisión de todas las alternativas figuran como no disponibles en la información proporcionada, ya que no se han publicado resultados para este modelo en particular; la columna de parámetros de las alternativas es orientativa y no procede de la model card.

| Modelo | Parámetros | Contexto / entrada | Precisión ImageNet-1k | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qhoenix/ember-kestrel | 119.027.848 (dato real del safetensors) | 480 × 480, 1000 clases | No disponible | apache-2.0 | HuggingFace, safetensors, carga manual con torchvision |
| torchvision `efficientnet_v2_l` (ImageNet-1k) | No disponible en la información proporcionada | 480 × 480, 1000 clases | No disponible | Licencia del proyecto torchvision (BSD-3-Clause) | Pesos descargables mediante la API de torchvision |
| Otras familias de backbone de tamaño similar (ConvNeXt-L, ViT-L/16, ResNet-152) | No disponible en la información proporcionada | 224–384 píxeles según modelo | No disponible | Varía según proyecto | torchvision / timm |

Además de lo anterior, la búsqueda web realizada devolvió resultados sobre proyectos denominados «Ember» sin relación con este modelo (el framework de inferencia de UC Berkeley Sky Computing Lab, el modelo Ember-1 de Fireworks AI, el framework Project Ember de Mithril y el repositorio pyember/ember). No se ha localizado ninguna comparativa publicada que incluya a qhoenix/ember-kestrel.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta código ni soporta tool calling. Cualquier expectativa en ese sentido es un error de categoría.
- No se documenta el dataset de entrenamiento adversarial, el tipo de perturbación ni su magnitud. Sin esa información no es posible afirmar frente a qué ataques es robusto el modelo ni cuantificar dicha robustez.
- El entrenamiento adversarial suele implicar un compromiso entre precisión en datos limpios y robustez. Sin métricas publicadas no se puede descartar que la precisión `top-1` en ImageNet-1k sea inferior a la de los pesos originales de torchvision.
- El preprocesado debe replicarse exactamente (bicúbico a 480, recorte central a 480, media y desviación 0,5). Desviarse de ese pipeline invalida cualquier comparación de resultados.
- Riesgo de errores sistemáticos y sesgos heredados de ImageNet-1k: las 1000 clases son de grano grueso, con categorías desequilibradas en el mundo real, y el modelo no incorpora ninguna mitigación de sesgos documentada.
- El modelo no está calibrado ni se documenta un umbral de decisión; las probabilidades de la `softmax` no deben interpretarse como confianza fiable sin una validación propia.
- El repositorio no incluye `config.json` ni integración con `transformers` (`AutoModel`), por lo que la carga requiere código específico con torchvision y safetensors.
- Licencia Apache-2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y los avisos de atribución, y sin garantías. Conviene revisar también la licencia de los pesos originales de torchvision de los que deriva el ajuste fino.
- La vinculación con la subred Perturb añade un hash on-chain y una hotkey de minero. El hash permite verificar integridad y correspondencia con la contribución registrada, pero no es una auditoría del proceso de entrenamiento ni una garantía de calidad.
- El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha y una documentación mínima. No se recomienda su uso en producción sin una evaluación propia sobre el dominio objetivo.
- Las fechas del repositorio (creación y actualización el 28 de septiembre de 2026) son las reportadas por HuggingFace y se reproducen tal cual; no implica ninguna valoración sobre su exactitud.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qhoenix/ember-kestrel
- Subred Perturb (Bittensor, netuid 26): https://perturbai.io

Nota sobre la búsqueda web: los resultados obtenidos corresponden a proyectos distintos que comparten el nombre «Ember» y no documentan este modelo. Se listan a continuación únicamente para evitar confusiones:

- Ember, UC Berkeley Sky Computing Lab: https://sky.cs.berkeley.edu/project/ember/
- Fireworks AI, Ember-1: https://www.marktechpost.com/2026/09/28/fireworks-ai-releases-ember-1-a-post-trained-kimi-k3-that-uses-about-40-fewer-tokens/
- Mithril, Project Ember: https://mithril.ai/blog/introducing-project-ember-a-compositional-framework-for-compound-ai-systems
- Repositorio pyember/ember: https://github.com/PyEmber/ember
- Artículo sobre «Ember» como identidad de IA: https://wrenbjor.com/2026/02/21/who-is-ember-the-architecture-of-an-ai-that-actually-thinks/
- No se han localizado paper, blog técnico, demostración ni repositorio asociados específicamente a qhoenix/ember-kestrel.
