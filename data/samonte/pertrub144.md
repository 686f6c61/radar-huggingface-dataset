# Samonte/pertrub144

## Resumen

Samonte/pertrub144 es un clasificador de imágenes basado en EfficientNetV2-L (la implementación `efficientnet_v2_l` de torchvision) con 1000 clases de ImageNet, ajustado mediante entrenamiento adversario (adversarial training) para la subred Perturb de Bittensor (netuid 26). No es un modelo de lenguaje ni un modelo multimodal generativo: es una red convolucional de clasificación que devuelve una distribución sobre las 1000 clases de ImageNet-1k para una imagen de entrada de 480x480 píxeles.

El modelo pertenece al minero con hotkey `5HEtPjhaCs859sdCjMG1a3TEZWFftKRs4VAYzCjnNUf82iDL` y su autor declara un hash on-chain `sha256(model.safetensors || hotkey)` = `252747a8336a36a9ac766950f5cd38eab15dabb5e05c7c74ef93edceb8f7ab80`, lo que vincula los pesos publicados a la identidad del minero dentro de la red. El interés práctico del modelo reside en su supuesta robustez frente a perturbaciones adversariales, un requisito habitual en subredes de Bittensor orientadas a producir inferencia verificable y resistente a manipulación.

El repositorio tiene 119.027.848 parámetros y ocupa 0,5 GB, con licencia Apache 2.0 y pesos en formato safetensors. En el momento de redactar esta ficha el modelo acumula 0 descargas y 0 "likes", por lo que carece de validación independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (CNN, torchvision `efficientnet_v2_l`) |
| Parametros totales | 119.027.848 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen de 480x480 px) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas; el unico artefacto publicado es `model.safetensors`) |
| Idiomas soportados | no aplica / no disponible (clasificacion de imagenes; las etiquetas son las 1000 clases de ImageNet-1k en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Numero de clases | 1000 (ImageNet-1k) |
| Resolucion de entrada | redimensionado bicubico a 480 y recorte central (center crop) de 480; normalizacion con media = desviacion = 0.5 |
| Libreria declarada | torchvision |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-26 (segun metadatos de HuggingFace) |
| Ultima actualizacion | 2026-09-26 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es EfficientNetV2-L, una red convolucional que combina bloques Fused-MBConv en las etapas iniciales y bloques MBConv con atencion por canal (squeeze-and-excitation) en las etapas profundas, con escalado compuesto de profundidad, anchura y resolucion. El modelo se instancia con `efficientnet_v2_l(weights=None)` y se cargan los pesos con `safetensors.torch.load_file("model.safetensors")`, por lo que la cabeza de clasificacion es la estandar de 1000 clases. El preprocesado es el de `EfficientNet_V2_L_Weights.IMAGENET1K_V1.transforms()`: redimensionado bicubico a 480, recorte central a 480 y normalizacion con media y desviacion tipica de 0.5 en los tres canales.

El autor indica que el modelo se ha ajustado con entrenamiento adversario, presumiblemente partiendo de los pesos preentrenados de ImageNet-1k, con el objetivo de la subred Perturb (netuid 26) de Bittensor. No se especifica en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion del dataset, el metodo concreto de generacion de ejemplos adversarios (por ejemplo PGD, FGSM o variantes con paso multiple), el numero de iteraciones, la funcion de perdida (adversarial, TRADES, mezcla limpia/sucia) ni si se empleo alguna tecnica de aumento adicional. Tampoco se documenta ningun proceso de RLHF, DPO u optimizacion por preferencias, que no aplican a un clasificador de imagenes.

La innovacion tecnica declarada es, por tanto, exclusivamente el ajuste adversario, sin que se aporten metricas de robustez (por ejemplo, exactitud bajo ataque a epsilon fijo) ni detalles del procedimiento. El unico mecanismo de verificabilidad descrito es el hash on-chain que liga el fichero de pesos a la hotkey del minero.

## Capacidades

- Clasificacion de imagenes en las 1000 clases de ImageNet-1k, devolviendo una distribucion de probabilidad por clase.
- Extraccion de caracteristicas (embeddings) de 1280 dimensiones mediante el uso del modelo sin la cabeza de clasificacion, aprovechable para transfer learning o recuperacion de imagenes.
- Robustez declarada frente a perturbaciones adversariales en el pixelado de la imagen, derivada del entrenamiento adversario indicado por el autor.
- Inferencia por lotes (batching) en GPU o CPU mediante PyTorch/torchvision.
- Registro on-chain: los pesos publicados se pueden verificar contra el hash indicado y la hotkey del minero en la subred Perturb.

No documentado o no aplicable:

- Generacion de texto, razonamiento, codigo o matematicas: no aplica.
- Tool calling o function calling: no disponible; no es un modelo de lenguaje y no define interfaz de herramientas.
- Uso como agente o razonamiento multi-paso: no aplica.
- Capacidades multilingues de texto: no aplica; las etiquetas de salida estan en ingles.
- Vision-lenguaje, deteccion de objetos, segmentacion, OCR, audio o modo "thinking": no disponible o no aplica.

## Casos de uso

- Mineria en la subred Perturb (netuid 26) de Bittensor: el modelo se publica precisamente como artefacto de un minero, de modo que puede desplegarse como servicio de inferencia clasificatoria resistente a perturbaciones y validarse contra el hash on-chain declarado.
- Evaluacion de robustez adversaria: usar el modelo como referencia para medir la degradacion de exactitud frente a ataques FGSM o PGD a distintos valores de epsilon, comparandola con la del EfficientNetV2-L original.
- Autoetiquetado y curacion de datasets de imagen: clasificar grandes volumenes de imagenes contra las 1000 clases de ImageNet-1k para filtrar, agrupar o depurar colecciones antes de reentrenar otros modelos.
- Etapa de preprocesado en pipelines de vision por computador: servir como clasificador rapido de primer nivel (por ejemplo, para enrutar imagenes hacia modelos especializados) cuando las categorias de interes son un subconjunto de ImageNet.
- Extraccion de embeddings para busqueda visual o clustering: eliminando la capa final se obtienen vectores de 1280 dimensiones utiles para similitud coseno, deduplicacion de imagenes o agrupamiento no supervisado.
- Filtrado de contenido en plataformas de subida de imagenes: bloquear o marcar categorias concretas de ImageNet (por ejemplo determinadas clases de armas o contenido sensible) antes de un analisis humano, aceptando la limitacion de que solo cubre 1000 categorias.
- Base para transfer learning en dominios especificos: ajustar el modelo con un conjunto mas pequeno y una cabeza nueva para tareas como clasificacion de defectos industriales, especies o productos.
- Pruebas de verificabilidad reproducible en entornos Bittensor: comprobar que el fichero `model.safetensors` descargado coincide con el hash declarado antes de integrarlo en una validacion automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No se aportan cifras de exactitud top-1 o top-5 en ImageNet-1k para este ajuste, ni metricas de robustez bajo ataque (exactitud a epsilon fijo, ataque PGD o AutoAttack), ni comparaciones con el punto de partida preentrenado. Unicamente se pueden verificar los siguientes datos del repositorio:

| Metrica verificable | Valor |
|---|---|
| Parametros totales (safetensors) | 119.027.848 |
| Tamano del repositorio | 0,5 GB |
| Descargas | 0 |
| Likes | 0 |
| Hash declarado (`sha256(model.safetensors \|\| hotkey)`) | 252747a8336a36a9ac766950f5cd38eab15dabb5e05c7c74ef93edceb8f7ab80 |

## Requisitos de hardware

- VRAM para pesos en fp32: aproximadamente 476 MB (119.027.848 parametros x 4 bytes).
- VRAM para pesos en fp16/bf16: aproximadamente 238 MB; en int8, aproximadamente 119 MB (estimaciones por tamano de parametros, no validadas con el autor).
- Memoria adicional para activaciones: con entradas de 480x480 y EfficientNetV2-L las activaciones son el factor dominante; en inferencia con `torch.no_grad()` y lote de tamano 1 es razonable esperar del orden de 1 a 2 GB adicionales, creciendo de forma aproximadamente lineal con el tamano de lote. No se dispone de mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM resulta suficiente para inferencia en fp16 con lotes pequenos; tarjetas tipo RTX 3060, RTX 4060, RTX 4090, A100 o H100 son adecuadas, siendo las de gama alta relevantes solo para lotes grandes o entrenamiento/ajuste fino.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU de consumo moderna con 6 GB o mas, y tambien en CPU para inferencia puntual, aunque con latencia mayor.
- Opciones de despliegue: PyTorch con torchvision como via principal segun la model card; exportacion a TorchScript o ONNX Runtime para servir sin dependencia del grafo de Python. No aplican vLLM, llama.cpp, Ollama, TGI ni otros servidores orientados a modelos de lenguaje, ya que no existen pesos GGUF ni arquitectura transformer de texto.
- Latencia y throughput: no disponible. No se publican mediciones de latencia por imagen ni imagenes por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparacion se limita a caracteristicas estructurales y de licencia. Los valores de parametros de las alternativas no se incluyen al no estar en la informacion proporcionada.

| Modelo | Arquitectura | Parametros | Numero de clases | Entrada | Robustez adversaria declarada | Licencia |
|---|---|---|---|---|---|---|
| Samonte/pertrub144 | EfficientNetV2-L (torchvision) | 119.027.848 | 1000 | 480x480 | si (ajuste adversario, sin metricas) | apache-2.0 |
| EfficientNetV2-L preentrenado de torchvision (`IMAGENET1K_V1`) | EfficientNetV2-L | no disponible | 1000 | 480x480 | no | licencia del proyecto torchvision / pesos de ImageNet |
| Otros clasificadores ImageNet-1k de la familia torchvision (ResNet, ConvNeXt, ViT) | CNN o transformer de vision | no disponible | 1000 | variable | no | segun modelo |
| Alternativas de la subred Perturb (netuid 26) | no disponible | no disponible | 1000 | no disponible | no disponible | no disponible |

No se han encontrado en la informacion proporcionada modelos comparables con datos de exactitud o robustez que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Alcance de salida restringido: el modelo solo distingue 1000 clases de ImageNet-1k en ingles; no reconoce categorias fuera de ese vocabulario y no devuelve cajas delimitadoras ni mascaras.
- Sin datos de evaluacion: no hay benchmarks publicados de exactitud ni de robustez, por lo que la afirmacion de "adversarial training" de la model card no esta cuantificada ni verificada de forma independiente.
- Riesgo de alucinacion en sentido clasico: en un clasificador se traduce en sobreconfianza y en etiquetas erroneas con alta probabilidad, especialmente ante imagenes fuera de distribucion (OOD), dominios muy distintos de ImageNet o entradas perturbadas no vistas durante el entrenamiento.
- Sesgos heredados: al derivar de pesos preentrenados en ImageNet-1k, el modelo arrastra los sesgos de anotacion y representacion de ese dataset, con posibles desequilibrios por clase, contexto geografico y demografia.
- Cero adopcion registrada: 0 descargas y 0 likes implican ausencia de validacion por terceros; conviene tratarlo como artefacto experimental.
- Fechas de metadatos inusuales: la creacion y la actualizacion figuran como 2026-09-26, lo que conviene comprobar antes de referenciar el modelo en documentacion o catalogos.
- Vinculacion a una hotkey concreta: el hash on-chain liga los pesos a un unico minero de la subred Perturb; si los pesos se reentrenan o se sustituyen, el hash dejara de coincidir y la verificacion fallara.
- Procedimiento de entrenamiento no documentado: se desconoce el metodo de generacion de ejemplos adversarios, el valor de epsilon usado y la proporcion de datos limpios frente a adversarios, lo que impide reproducir el ajuste.
- Licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se indiquen los cambios; no se documentan restricciones adicionales. Debe verificarse, en su caso, la licencia de los pesos preentrenados de origen.
- Robustez no transferible automaticamente: un ajuste adversario frente a un tipo de ataque o un valor de epsilon concreto no garantiza robustez frente a otros ataques ni frente a corrupciones naturales (desenfoque, ruido de sensor, compresion JPEG).
- Coste computacional: la entrada a 480x480 con un modelo de este tamano encarece la inferencia frente a clasificadores de 224x224, lo que limita el throughput en despliegues de alto volumen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Samonte/pertrub144
- Subred Perturb (netuid 26): https://perturbai.io
- Documentacion de torchvision, `efficientnet_v2_l`: https://pytorch.org/vision/stable/models/efficientnetv2.html
- Documentacion de safetensors: https://huggingface.co/docs/safetensors/index
- Documentacion de Bittensor: https://docs.bittensor.com/

Nota sobre la busqueda web: los resultados recuperados (PromptShotAI, isitai.com, aiornot.com, Civitai, PromptHero) corresponden a herramientas de deteccion de imagenes generadas por IA y a repositorios de modelos generativos, y no guardan relacion con este clasificador ni aportan informacion tecnica sobre el.
