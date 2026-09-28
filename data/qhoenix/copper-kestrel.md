# qhoenix/copper-kestrel

## Resumen

qhoenix/copper-kestrel es un clasificador de imagenes basado en EfficientNetV2-L, la variante grande de la familia EfficientNetV2 implementada en torchvision (`efficientnet_v2_l`), con 119.027.848 parametros. El modelo parte de la cabeza de 1000 clases de ImageNet-1K y ha sido ajustado (fine-tuning) con entrenamiento adversarial.

El modelo no es una publicacion generalista, sino un artefacto de mineria para la subnet Perturb (netuid 26) de la red Bittensor. La model card identifica al minero mediante su hotkey (`5H76LSKUmaVbxXVyT5tL9N9kkKPACRWPPrmNJm8QM32pNEGB`) y publica un hash on-chain calculado como `sha256(model.safetensors || hotkey)`, lo que vincula los pesos con la identidad del minero en la cadena.

Su relevancia es acotada y especifica: sirve como punto de partida reproducible para tareas de clasificacion de imagenes robustas frente a perturbaciones adversarias, y como referencia verificable de un participante en una subnet de incentivos. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (CNN, torchvision `efficientnet_v2_l`) |
| Parametros totales | 119.027.848 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, clasificacion por imagen) |
| Tipos de cuantizacion | no disponible (repositorio en safetensors, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo de vision; no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |
| Entrada / preprocesado | `EfficientNet_V2_L_Weights.IMAGENET1K_V1.transforms()`: resize bicubico a 480, center crop 480, media = desviacion = 0,5 |
| Clases de salida | 1000 (ImageNet-1K) |
| Libreria | torchvision |
| Tamano del repo | 0,5 GB |
| Pipeline | image-classification |

## Arquitectura y entrenamiento

La arquitectura es EfficientNetV2-L, una red convolucional que combina bloques MBConv y Fused-MBConv con escalado compuesto y entrenamiento con estrategias de progresion de resolucion. La implementacion concreta corresponde a torchvision, con pesos inicializados desde la variante `IMAGENET1K_V1` de 1000 clases sobre la que se realiza el ajuste posterior.

El detalle distintivo es el entrenamiento adversarial, indicado tanto en los tags del repositorio como en la model card. La informacion proporcionada no especifica el algoritmo de ataque empleado (FGSM, PGD u otro), el valor de epsilon, el numero de iteraciones, el volumen de datos de ajuste ni si se aplicaron tecnicas adicionales como RLHF o DPO (no aplicables en este dominio). Tampoco se documenta la composicion exacta del dataset de fine-tuning ni el numero de pasos de entrenamiento. El autor publica un hash on-chain que permite verificar la integridad de los pesos frente a la hotkey del minero.

## Capacidades

- Clasificacion de imagenes en 1000 categorias de ImageNet-1K, con logits por clase.
- Inferencia sobre imagenes de 480x480 pixels tras el preprocesado bicubico y center crop indicado en la model card.
- Robustez frente a perturbaciones adversarias, como resultado del entrenamiento adversarial declarado.
- Carga directa mediante `safetensors` y reconstruccion del modelo con `torchvision.models.efficientnet_v2_l(weights=None)`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni capacidades multimodales de lenguaje.
- No soporta tool calling ni function calling.
- No esta disenado para flujos de agentes ni razonamiento multi-paso.
- No hay capacidades multilingues: no procesa texto.
- No incorpora modo de pensamiento (thinking), audio ni video.

## Casos de uso

- Clasificacion de imagenes en produccion: dado que expone la cabeza estandar de 1000 clases de ImageNet, puede integrarse en pipelines de etiquetado automatico donde se requiera un clasificador robusto y no una taxonomia personalizada.
- Evaluacion de robustez adversaria: sirve como modelo de referencia endurecido frente a perturbaciones, util para comparar la degradacion de otros clasificadores bajo ataques FGSM o PGD.
- Deteccion de entradas manipuladas: su entrenamiento adversarial permite usarlo como componente de filtrado previo en sistemas que reciben imagenes potencialmente alteradas de forma maliciosa.
- Investigacion en subnets de Bittensor: el hash on-chain y la hotkey publicados permiten reproducir la verificacion de pesos y estudiar el esquema de incentivos de la subnet Perturb (netuid 26).
- Extraccion de caracteristicas para transfer learning: el backbone convolucional puede reutilizarse con una cabeza nueva para dominios especificos, aprovechando los pesos ya ajustados.
- Preetiquetado de conjuntos de datos: con 1000 clases y 119 M de parametros, es viable ejecutarlo en lote sobre catalogos de imagenes para generar etiquetas iniciales que luego se revisen manualmente.
- Moderacion de contenido visual a gran escala: clasificacion rapida por categoria como primera etapa de un pipeline de filtrado, dado el bajo coste computacional relativo de una CNN de este tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de exactitud top-1 o top-5, ni resultados bajo ataques adversarios (por ejemplo, exactitud con epsilon fijo), ni comparaciones con otros checkpoints.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 476 MB solo para los pesos (119,03 M de parametros x 4 bytes). Con activaciones y buffers para batch pequeno a 480x480, el consumo realista se situa por encima de 1 GB; estas cifras son calculos derivados del recuento de parametros, no datos publicados por el autor.
- VRAM estimada en FP16: aproximadamente 238 MB solo para los pesos. El repositorio no publica una variante en media precision, por lo que requiere conversion manual.
- Cabe sin problema en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090) puede ejecutar inferencia en FP32 con batch pequeno.
- GPU recomendadas para alto throughput: A100, H100, L40S o RTX 4090, especialmente si se procesan lotes grandes a 480x480.
- Despliegue: al ser un modelo torchvision, las rutas naturales son PyTorch con `torch.no_grad()`, TorchScript, exportacion a ONNX Runtime o TensorRT, y empaquetado en un servicio con FastAPI o TorchServe.
- No aplica el ecosistema de LLM: llama.cpp, Ollama, vLLM o TGI estan orientados a modelos generativos de texto y no son la via de despliegue de este clasificador.
- Latencia y throughput: no disponible. El autor no publica mediciones.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| qhoenix/copper-kestrel | 119.027.848 | no aplica (vision) | apache-2.0 | safetensors | no disponible |
| torchvision `efficientnet_v2_l` (IMAGENET1K_V1) | misma arquitectura, recuento exacto no disponible en la busqueda | no aplica (vision) | BSD-3-Clause (torchvision) | PyTorch | no disponible en la informacion |
| Otros clasificadores CNN de la misma escala (ResNet, ConvNeXt) | no disponible en la informacion | no aplica (vision) | no disponible | no disponible | no disponible |

La diferencia funcional conocida entre este checkpoint y el modelo base de torchvision es el ajuste con entrenamiento adversarial y su vinculacion a la subnet Perturb de Bittensor mediante hash on-chain. No hay datos publicos en la informacion disponible que cuantifiquen la mejora o el coste de ese ajuste.

## Limitaciones y advertencias

- Taxonomia fija: la cabeza de salida cubre exactamente las 1000 clases de ImageNet-1K. No reconoce categorias fuera de ese conjunto sin reentrenamiento.
- Sin datos de rendimiento: al no publicarse benchmarks, no es posible estimar la exactitud real del ajuste adversarial ni compararla con el modelo base.
- Riesgo de clasificacion erronea y de confianza mal calibrada, inherente a los clasificadores de imagen; el autor no documenta curvas de calibracion ni umbrales recomendados.
- Sesgos de ImageNet: la distribucion de clases, la sobrerrepresentacion de determinadas categorias y los sesgos geograficos y culturales del dataset original se heredan del preentrenamiento.
- Preprocesado obligatorio: usar una normalizacion distinta a media = desviacion = 0,5 o un tamano de entrada distinto a 480 puede degradar gravemente los resultados.
- Robustez adversaria no verificada: se declara entrenamiento adversarial, pero no se especifica el ataque, el epsilon ni los resultados obtenidos. No debe asumirse proteccion frente a ataques no documentados.
- Sin soporte de texto ni de idiomas: no es utilizable en tareas de NLP, dialogo o recuperacion de informacion.
- Repositorio sin traccion: 0 descargas y 0 likes, creado y actualizado el 28 de septiembre de 2026, sin mantenimiento posterior documentado.
- Licencia apache-2.0, que permite uso comercial y modificacion con atribucion; debe verificarse igualmente la licencia de los pesos originales de torchvision (BSD-3-Clause) al redistribuir derivados.
- Artefacto ligado a una subnet: su proposito principal es la mineria en Bittensor, no un uso general como modelo de vision de proposito general.

## Enlaces

- HuggingFace: https://huggingface.co/qhoenix/copper-kestrel
- Perturb (subnet, netuid 26): https://perturbai.io
- Modelo base en torchvision: https://pytorch.org/vision/stable/models/efficientnetv2.html
- No se han encontrado enlaces relevantes adicionales en la busqueda web: los resultados devueltos correspondian a sitios de calendarios y directorios sin relacion con el modelo.
