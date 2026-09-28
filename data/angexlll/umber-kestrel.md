# ANGExllL/umber-kestrel

## Resumen

ANGExllL/umber-kestrel es un modelo de clasificacion de imagenes basado en EfficientNetV2-L (la implementacion `efficientnet_v2_l` de torchvision, con 1000 clases de ImageNet) y ajustado mediante entrenamiento adversario para la subnet Perturb (netuid 26) de Bittensor. El modelo cuenta con 119.027.848 parametros reales en safetensors y el repositorio ocupa 0,5 GB, un tamano consistente con pesos en precision fp32.

El problema que aborda es la robustez frente a perturbaciones adversarias en tareas de clasificacion visual. En lugar de entrenar un clasificador convencional sobre ImageNet-1K, el autor parte de los pesos `IMAGENET1K_V1` de torchvision y aplica un fine-tuning con ejemplos perturbados, buscando mantener la precision bajo ataques adversariales. Es un modelo de vision puro: no procesa texto, no soporta tool calling ni razonamiento multi-paso.

Su relevancia actual es acotada y muy especifica del ecosistema Bittensor. La model card incluye un hash on-chain (`sha256(model.safetensors || hotkey)`) y la hotkey del minero, lo que permite verificar la integridad del artefacto desplegado en la subnet. En el momento de la consulta el repositorio registra 0 descargas y 0 "likes", por lo que se trata de un artefacto recien publicado y sin adopcion verificable por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (convolutional, bloques MBConv y Fused-MBConv con compound scaling) |
| Parametros totales | 119.027.848 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes; entrada fija de 480x480 px) |
| Tipos de cuantizacion | no disponible como variante publicada; pesos en safetensors de ~0,5 GB, consistente con fp32 |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

Otros datos de interes:

| Parametro | Valor |
|---|---|
| Clases de salida | 1000 (ImageNet-1K) |
| Resolucion de entrada | redimensionado bicubico a 480, recorte central a 480 |
| Normalizacion | media = desviacion = 0,5 |
| Libreria | torchvision |
| Pipeline | image-classification |
| Tamano del repositorio | 0,5 GB |
| Hotkey del minero | `5DhtFUDenAuSzn3EVhjL29UFWJbT1MoUVAJ83Ft94biBy25e` |
| Hash on-chain | `71596c494b2c111b5fe0e5edf47117ee10b4545f7dd7f4c55f377d38f39c53b3` |

## Arquitectura y entrenamiento

La arquitectura de base es EfficientNetV2-L, una red convolucional que combina bloques MBConv con bloques Fused-MBConv y emplea *compound scaling* para equilibrar profundidad, anchura y resolucion. La implementacion concreta es la de torchvision (`efficientnet_v2_l`), con una cabeza de clasificacion de 1000 clases. Segun la model card, el autor parte de los pesos preentrenados `IMAGENET1K_V1` (los que proporciona torchvision, entrenados sobre ImageNet-1K) y realiza un fine-tuning con entrenamiento adversario.

El preprocesado asociado es exactamente el de `EfficientNet_V2_L_Weights.IMAGENET1K_V1.transforms()`: redimensionado bicubico a 480 px, recorte central a 480 px y normalizacion con media y desviacion estandar de 0,5. La carga del modelo se hace instanciando `efficientnet_v2_l(weights=None)` y cargando el `state_dict` desde `model.safetensors` con `safetensors.torch.load_file`.

No hay informacion disponible sobre el volumen de datos de entrenamiento, la composicion del dataset, el tipo y la magnitud de las perturbaciones adversarias empleadas, ni sobre si se uso RLHF, DPO u otra tecnica de alineacion (no aplicable en vision). Tampoco se detalla el numero de epocas, el optimizador ni el esquema de aprendizaje.

## Capacidades

- Clasificacion de imagenes en 1000 categorias de ImageNet-1K sobre entradas RGB de 480x480 px.
- Robustez frente a perturbaciones adversarias como objetivo declarado del fine-tuning, orientada a la subnet Perturb (netuid 26) de Bittensor.
- Verificabilidad on-chain: el hash `sha256(model.safetensors || hotkey)` permite comprobar que los pesos desplegados corresponden a la hotkey del minero.
- Exportacion sencilla a otros formatos de inferencia (ONNX, TorchScript, TensorRT) al ser un modelo torchvision estandar.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues ni de generacion de texto.
- No dispone de modo "thinking", vision multimodal, audio ni ninguna capacidad adicional fuera de la clasificacion.

## Casos de uso

- Mineria en la subnet Perturb (netuid 26): el modelo se publica como artefacto de minero, con hotkey y hash on-chain, de modo que puede desplegarse en la subnet y verificarse su integridad frente a lo registrado en cadena.
- Percepcion robusta en entornos adversarios: en escenarios donde las imagenes de entrada pueden estar manipuladas (ruido, perturbaciones dirigidas), un clasificador entrenado de forma adversaria reduce la degradacion de precision respecto a un modelo convencional.
- Investigacion en defensa adversarial: sirve como punto de partida reproducible (misma arquitectura, mismos transforms) para comparar tecnicas de ataque y defensa sobre EfficientNetV2-L a 480x480.
- Filtrado y clasificacion masiva de imagenes: al ocupar 0,5 GB y tener 119M de parametros, puede procesar lotes grandes de imagenes en un pipeline de clasificacion de 1000 clases con requisitos de memoria moderados.
- Etiquetado automatico y preprocesado para datasets: usar el clasificador para asignar etiquetas ImageNet preliminares a grandes volumenes de imagenes antes de un etiquetado humano o de un fine-tuning posterior.
- Base para fine-tuning de dominio especifico: al ser un modelo torchvision estandar, se puede recargar su `state_dict` y reentrenar la cabeza para tareas de clasificacion verticales (inspeccion industrial, clasificacion medica, etc.).
- Despliegue en edge o entornos con VRAM limitada: con menos de 1 GB de pesos en fp32 y opciones de cuantizacion a INT8, encaja en dispositivos con 4-8 GB de memoria.
- Verificacion de integridad de modelos en produccion: su hash on-chain permite auditar que los pesos servidos en inferencia no han sido alterados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de exactitud top-1 o top-5 sobre ImageNet-1K, ni resultados frente a ataques adversariales (por ejemplo, exactitud bajo perturbaciones L-infinito), ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB de pesos en fp32 (119M parametros x 4 bytes), mas activaciones. En la practica, alrededor de 2-3 GB en fp32 y 1-1,5 GB en fp16 para lotes pequenos a 480x480. Son estimaciones basadas en el tamano del modelo, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. Para produccion de alto rendimiento, A100, H100, L40S o RTX 4090. Para desarrollo, RTX 3060 (12 GB), RTX 3080, RTX 4070 y superiores.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU consumer moderna con 4-8 GB de VRAM puede ejecutar el modelo gracias a su tamano reducido (0,5 GB de pesos).
- Opciones de despliegue: PyTorch y torchvision de forma nativa (la model card incluye el snippet de carga), TorchScript, ONNX Runtime, TensorRT, NVIDIA Triton. No aplican vLLM, llama.cpp u Ollama, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones de latencia ni de imagenes por segundo.

## Comparativa con modelos similares

La comparativa siguiente usa valores de referencia publicos de las arquitecturas citadas; solo el modelo de esta ficha esta verificado contra la informacion proporcionada. Los datos del resto deben tratarse como aproximaciones de documentacion publica.

| Modelo | Parametros | Entrada | Clases | Entrenamiento | Licencia |
|---|---|---|---|---|---|
| ANGExllL/umber-kestrel | 119.027.848 (verificado) | 480x480 | 1000 (ImageNet-1K) | Fine-tuning adversario sobre `IMAGENET1K_V1` | apache-2.0 |
| torchvision efficientnet_v2_l (IMAGENET1K_V1) | ~118,5M (referencia) | 480x480 | 1000 | ImageNet-1K | BSD-3-Clause (pesos torchvision) |
| EfficientNet-B7 | ~66M (referencia) | 600x600 | 1000 | ImageNet-1K | segun distribucion |
| ConvNeXt-L | ~198M (referencia) | 224x224 | 1000 | ImageNet-1K / 21K | segun distribucion |

Diferencias clave frente a alternativas: umber-kestrel hereda la arquitectura y el preprocesado del EfficientNetV2-L de torchvision, pero anade un fine-tuning con entrenamiento adversario cuyo impacto real en exactitud limpia o robusta no se puede evaluar sin benchmarks. Frente a EfficientNet-B7 ofrece un modelo mas grande y a mayor resolucion; frente a ConvNeXt-L, un modelo mas ligero y de arquitectura convolucional pura. La ventaja practica del modelo es su licencia apache-2.0 y su verificabilidad on-chain, no un rendimiento medido superior.

## Limitaciones y advertencias

- Solo clasifica en las 1000 clases de ImageNet-1K; no reconoce categorias fuera de ese conjunto sin un fine-tuning adicional de la cabeza.
- Entrenado como modelo de vision: no tiene capacidades de lenguaje, generacion de texto, codigo ni matematicas.
- Sesgos: al derivar de ImageNet-1K, hereda los sesgos y desequilibrios de ese dataset en cuanto a geografia, demografia y representacion de categorias.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza, especialmente ante entradas fuera de distribucion o perturbadas de forma no contemplada en el entrenamiento.
- El entrenamiento adversario puede reducir la exactitud en condiciones limpias (no perturbadas); no hay datos publicados que cuantifiquen ese posible compromiso.
- Ausencia total de benchmarks: no se puede validar la robustez declarada ni compararla con el modelo base.
- Adopcion nula verificable: 0 descargas y 0 "likes" en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion por terceros.
- Reproducibilidad dependiente de la cadena: el hash on-chain se calcula como `sha256(model.safetensors || hotkey)`, de modo que cualquier cambio en los pesos o en la hotkey invalida la verificacion.
- Entrada fija a 480x480 tras los transforms; alimentar resoluciones distintas sin replicar el preprocesado dara resultados degradados.
- Licencia apache-2.0: permite uso comercial, modificacion y redistribucion, siempre que se cumplan las condiciones de atribucion y aviso de la licencia. No se declaran restricciones adicionales en la model card.
- No se especifican los datos ni el metodo exacto de entrenamiento adversario, lo que dificulta auditar su comportamiento frente a ataques concretos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ANGExllL/umber-kestrel
- Subnet Perturb: https://perturbai.io
- EfficientNetV2-L en torchvision: https://pytorch.org/vision/stable/models/efficientnetv2.html
- Repositorio safetensors: https://github.com/huggingface/safetensors
