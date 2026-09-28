# ANGExllL/slate-kestrel

## Resumen

slate-kestrel es un clasificador de imagenes publicado por el usuario ANGExllL en Hugging Face. Se trata de un ajuste fino con entrenamiento adversarial de `efficientnet_v2_l`, la implementacion de EfficientNetV2-L incluida en torchvision, que conserva la cabeza de clasificacion de 1000 clases de ImageNet-1K. El checkpoint tiene 119.027.848 parametros y se distribuye en formato safetensors bajo licencia Apache 2.0, con un tamano de repositorio de 0,5 GB.

El modelo esta asociado a la subred Perturb (netuid 26) de Bittensor, una red descentralizada en la que distintos mineros compiten por aportar modelos robustos frente a perturbaciones adversarias. La model card incluye la hotkey del minero (`5HTMujxdVwf78DNbnLY8dAqyQLykd2mdSzZg47iA2Xs8NmTi`) y el hash on-chain `sha256(model.safetensors || hotkey)`, lo que permite verificar la procedencia exacta de los pesos. En el contexto de Bittensor, este mecanismo de verificacion es parte del protocolo y no un simple detalle de trazabilidad.

Conviene encuadrar la ficha con precision: **no es un modelo de lenguaje**. No genera texto, no dispone de ventana de contexto, no soporta tool calling ni razonamiento multi-paso. Es una red convolucional de vision con una unica salida, un vector de 1000 logits correspondiente a las clases de ImageNet-1K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (torchvision `efficientnet_v2_l`), red convolucional con bloques Fused-MBConv y MBConv, scaling compuesto |
| Parametros totales | 119.027.848 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision con entrada de imagen fija) |
| Tipos de cuantizacion | no disponible en el repositorio; solo se publican pesos safetensors (presumiblemente FP32) |
| Idiomas soportados | no aplica (modelo de vision); las etiquetas de salida estan en ingles (1000 clases de ImageNet-1K) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |
| Resolucion de entrada | 480 x 480 (redimensionado bicubico a 480, recorte central a 480) |
| Normalizacion | media = desviacion tipica = 0,5 |
| Numero de clases | 1000 (ImageNet-1K) |
| Libreria | torchvision |
| Pipeline | image-classification |
| Tamano del repositorio | 0,5 GB |
| Fecha de creacion | 2026-09-28 (segun metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La base es EfficientNetV2-L, una CNN disenada mediante busqueda de arquitectura con escalado compuesto (profundidad, anchura y resolucion de entrada escaladas de forma conjunta). EfficientNetV2 combina bloques Fused-MBConv en las etapas iniciales, mas eficientes en GPU, con bloques MBConv con atencion SE en las etapas profundas, e incorpora tecnicas de regularizacion progresiva durante el entrenamiento. El modelo original parte de un entrenamiento en ImageNet-1K y, en su variante de mayor resolucion, de un preentrenamiento previo en ImageNet-21K; el checkpoint aqui publicado conserva la cabeza de 1000 clases.

Sobre esa base, el autor aplica un ajuste fino con entrenamiento adversarial, orientado a mejorar la resistencia del clasificador frente a perturbaciones en la imagen de entrada. La model card no especifica el dataset exacto empleado en el ajuste, el numero de pasos, la norma y magnitud de la perturbacion (epsilon), ni la composicion del conjunto de evaluacion. Tampoco se documenta si hubo mezcla de ejemplos limpios y adversarios ni la proporcion entre ambos. El unico detalle de preprocesado declarado es el uso de `EfficientNet_V2_L_Weights.IMAGENET1K_V1.transforms()`, lo que implica redimensionado bicubico a 480, recorte central a 480 y normalizacion con media y desviacion tipica de 0,5. La integridad del checkpoint se ancla a un hash on-chain que combina los pesos y la hotkey del minero.

## Capacidades

- Clasificacion de imagenes en las 1000 categorias de ImageNet-1K, devolviendo un vector de logits (o probabilidades tras softmax) por imagen.
- Inferencia sobre una unica imagen por pasada directa; no es un modelo generativo ni multimodal.
- Robustez adversaria: el ajuste con entrenamiento adversarial busca mantener la precision ante perturbaciones de la entrada, aunque no se publican cifras de mejora.
- Carga directa mediante safetensors y reconstruccion de la arquitectura con `torchvision.models.efficientnet_v2_l(weights=None)`.
- Extraccion de caracteristicas: al ser una CNN, las activaciones de las capas intermedias pueden reutilizarse como embeddings visuales para tareas posteriores.
- No soporta tool calling / function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: trabaja con etiquetas fijas en ingles.
- No dispone de modo "thinking", vision por video, audio ni generacion de texto.

## Casos de uso

- Mineria en la subred Perturb (netuid 26) de Bittensor: el checkpoint esta preparado para desplegarse como minero de la subred; incluir la hotkey y el hash on-chain en la model card facilita la verificacion de que los pesos servidos coinciden con los declarados.
- Investigacion en robustez adversaria: sirve como modelo victima o como linea base de defensa al comparar la caida de precision bajo ataques FGSM, PGD o similares frente a un EfficientNetV2-L sin ajuste adversarial.
- Etiquetado automatico de conjuntos de imagenes: clasificacion a escala de lotes de fotografias en las 1000 clases de ImageNet, util para preanotar datos antes de una revision humana.
- Moderacion de contenido visual en pipelines internos: al operar sobre clases ImageNet, puede filtrar categorias concretas (por ejemplo, armas o determinados objetos) como primera etapa de un sistema de moderacion mas amplio.
- Backbone para transferencia a tareas downstream: congelando el extractor y entrenando una cabeza nueva, se puede adaptar a clasificacion binaria o multietiqueta en dominios especificos.
- Inspeccion visual industrial o agricola: clasificacion de imagenes de producto, defectos o cultivos tras un reajuste con datos propios, con despliegue en GPU de gama media o incluso en el borde.
- Evaluacion comparativa de eficiencia CNN: sirve como punto de referencia de latencia y memoria de una EfficientNetV2-L frente a ResNet, ViT o ConvNeXt en el mismo hardware.
- Docencia y prototipado rapido: ejemplo minimo de carga de un checkpoint safetensors en torchvision sin depender de `transformers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye precision top-1 ni top-5, ni sobre ImageNet-1K limpio ni bajo ataques adversarios, ni tampoco cifras de robustez certificada o empírica. Tampoco hay datos de latencia, throughput ni consumo de memoria medidos por el autor.

## Requisitos de hardware

Las cifras de memoria de pesos son estimaciones derivadas del numero de parametros declarado (119.027.848):

- Pesos en FP32: aproximadamente 476 MB (119,03 M x 4 bytes).
- Pesos en FP16 / BF16: aproximadamente 238 MB.
- Pesos en INT8: aproximadamente 119 MB.
- VRAM total en inferencia: del orden de 1 a 2 GB con lote pequeno y entrada de 480 x 480, sumando activaciones y buffers de cuDNN; no hay mediciones publicadas.
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060 y RTX 4090.
- GPU de centro de datos: A100, H100, L40S o similares funcionan, pero estan ampliamente sobredimensionadas para este modelo.
- CPU: es viable para inferencia por lotes pequenos, con latencia notablemente mayor; no se dispone de cifras.
- Opciones de despliegue: PyTorch + torchvision con safetensors, exportacion a TorchScript, ONNX Runtime, TensorRT, NVIDIA Triton Inference Server y TorchServe. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento comparativos publicados para este checkpoint. La tabla recoge unicamente caracteristicas estructurales de arquitecturas de clasificacion comparables en tamano y uso, con los datos habituales de cada arquitectura base en torchvision:

| Modelo | Parametros | Resolucion tipica | Clases | Licencia | Notas |
|---|---|---|---|---|---|
| slate-kestrel (EfficientNetV2-L ajustado) | 119,03 M | 480 x 480 | 1000 | Apache 2.0 | Ajuste adversarial para la subred Perturb; sin benchmarks publicados |
| EfficientNetV2-L (base, torchvision) | 118,7 M | 480 x 480 | 1000 | Apache 2.0 | Arquitectura de partida, sin ajuste adversarial |
| EfficientNetV2-M (torchvision) | 54,1 M | 480 x 480 | 1000 | Apache 2.0 | Alternativa mas ligera de la misma familia |
| ConvNeXt-L (torchvision) | 197,8 M | 224 x 224 | 1000 | Apache 2.0 | CNN moderna de tamano superior |
| ViT-B/16 (torchvision) | 86,6 M | 224 x 224 | 1000 | Apache 2.0 | Transformer de vision, requiere mas datos para rendir bien |

Los recuentos de parametros corresponden a las arquitecturas base en torchvision y no incluyen ningun ajuste especifico. No hay datos que permitan comparar rendimiento o robustez entre estas opciones en la informacion disponible.

## Limitaciones y advertencias

- Modelo de vision, no de lenguaje: cualquier uso esperado de generacion de texto, chat, contexto largo o tool calling es inaplicable.
- Cabeza cerrada de 1000 clases ImageNet-1K: no admite consultas abiertas (zero-shot) ni categorias fuera de ese vocabulario sin reentrenar la capa de salida.
- Sesgos de ImageNet-1K: el conjunto presenta desequilibrios y sesgos geograficos y culturales conocidos, que el modelo hereda en sus predicciones.
- Riesgo de clasificacion erronea: como todo clasificador, puede asignar etiquetas incorrectas con alta confianza, especialmente en dominios alejados de la distribucion de entrenamiento.
- Trade-off del entrenamiento adversarial: es habitual que el ajuste con ejemplos adversarios reduzca ligeramente la precision sobre datos limpios; el autor no documenta este intercambio.
- Falta de reproducibilidad: no se especifican dataset de ajuste, hiperparametros, norma ni epsilon del ataque empleado, por lo que no es posible reproducir el entrenamiento.
- Sin validacion externa: el repositorio registra 0 descargas y 0 likes, y no hay evaluaciones independientes publicadas.
- Metadatos anomalos: la fecha de creacion declarada (2026-09-28) es posterior a la fecha habitual de publicacion, un detalle a verificar antes de integrar el modelo en produccion.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de atribucion. No incluye garantias.
- Procedencia: la verificacion del hash on-chain depende de poder recalcular `sha256(model.safetensors || hotkey)`; si los pesos se reexportan o se convierten a otro formato, esa verificacion deja de ser valida.
- Sin versiones cuantizadas publicadas: para desplegar en INT8 o TensorRT FP16 hay que convertir el checkpoint uno mismo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ANGExllL/slate-kestrel
- Perfil del autor en Hugging Face: https://huggingface.co/ANGExllL/models
- Subred Perturb (netuid 26) de Bittensor: https://perturbai.io

Nota sobre los resultados de busqueda web: los enlaces a Ataraxis AI (modelo Kestrel para diagnostico oncologico), al repositorio `sanskkrr/KestrelAI` y al portal kestrelai.org corresponden a proyectos distintos que comparten el nombre "Kestrel" y no guardan relacion con este checkpoint. Los rankings agregados tipo LLM Leaderboard tampoco son aplicables, ya que este modelo no es un modelo de lenguaje.
