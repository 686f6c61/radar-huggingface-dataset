# mailmail85/perturb-effv2l-adv

## Resumen

`mailmail85/perturb-effv2l-adv` es un clasificador de imagenes basado en EfficientNetV2-L (`efficientnet_v2_l` de torchvision) con 119.027.848 parametros, ajustado mediante entrenamiento adversarial sobre las 1000 clases de ImageNet-1K. El modelo lo publica el usuario `mailmail85` como artefacto de minero para la subred Perturb (netuid 26) de Bittensor, una red descentralizada en la que los mineros compiten por ofrecer modelos de vision robustos frente a perturbaciones adversariales.

El interes del modelo no esta en su arquitectura, que es la estandar de torchvision, sino en el proceso de ajuste: el entrenamiento adversarial persigue que el clasificador mantenga su precision cuando la entrada ha sido manipulada de forma maliciosa (ruido imperceptible, cambios de textura, parches). Esto lo situa en el nicho de la vision por computador tolerante a ataques, relevante para despliegues de seguridad, moderacion de contenido y cualquier pipeline donde un adversario pueda controlar la imagen de entrada.

La model card es minima: no incluye metricas de precision, ni descripcion del ataque usado durante el entrenamiento, ni evaluacion de robustez. El repositorio ocupa 1,9 GB y no registra descargas ni likes en el momento de la consulta, por lo que se trata de un artefacto sin validacion externa. Se distribuye bajo licencia Apache-2.0 en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (CNN con compound scaling; bloques MBConv y Fused-MBConv, atencion squeeze-and-excitation) |
| Parametros totales | 119.027.848 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes; entrada fija de 480 x 480 px) |
| Tipos de cuantizacion | no disponible (no declarados por el autor; el checkpoint se publica en precision completa) |
| Idiomas soportados | no disponible (clasifica 1000 clases de ImageNet-1K con etiquetas en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, cargable con `safetensors.torch.load_file`) |

## Arquitectura y entrenamiento

La arquitectura es EfficientNetV2-L, la variante grande de la familia EfficientNetV2, que combina bloques Fused-MBConv en las etapas iniciales y MBConv con atencion squeeze-and-excitation en las finales, entrenada originalmente con progressive learning y regularizacion adaptativa. En torchvision, `efficientnet_v2_l` expone una cabeza de 1000 clases para ImageNet-1K. El autor parte de esos pesos (equivalente a `EfficientNet_V2_L_Weights.IMAGENET1K_V1`) y aplica un ajuste fino con entrenamiento adversarial orientado a la subred Perturb.

La informacion disponible no detalla el numero de tokens ni de imagenes vistas (no aplica: es vision), la composicion del dataset mas alla de ImageNet-1K, ni el metodo adversarial concreto (norma L-inf o L-2, epsilon, PGD, FGSM, ataques multi-paso, porcentaje de ejemplos adversarios por lote). Tampoco se documenta si hubo destilacion, ensemble o tecnicas de defensa adicionales. El unico dato verificable del proceso es el hash on-chain `sha256(model.safetensors || hotkey) = 1bbe02b1dc5be2068654ff766eefd4a34a4f30458449ca3be6cd373f468dbcb1`, que vincula el checkpoint con el hotkey del minero `5DLYHxKa1a65NXipakC7WV1fPq4SMjKYivdXGp9D4QEJjNfL`. El preprocesado prescrito es el estandar de torchvision: redimensionado bicubico a 480, recorte central a 480 y normalizacion con media y desviacion tipica de 0,5 en los tres canales.

## Capacidades

- Clasificacion de imagenes en 1000 categorias de ImageNet-1K, devolviendo logits o probabilidades por clase.
- Clasificacion robusta frente a perturbaciones adversariales, objetivo declarado del ajuste con entrenamiento adversarial.
- Extraccion de caracteristicas visuales de alto nivel (el backbone de 119 M de parametros es reutilizable como extractor congelado o ajustable).
- Procesamiento de imagenes a 480 x 480 px, resolucion superior a la de EfficientNet clasicos (224-380 px), lo que favorece el reconocimiento de detalles finos.
- No soporta tool calling ni function calling: es un modelo discriminativo, no generativo.
- No soporta agentes, razonamiento multi-paso ni dialogo multi-turno.
- No dispone de capacidades multilingues ni de generacion de texto.
- No incluye modo de razonamiento explicito (thinking mode), vision-lenguaje, audio ni video.
- Compatible con el ecosistema de mineros de la subred Perturb (netuid 26) de Bittensor mediante su hotkey y hash on-chain.

## Casos de uso

- Mineria en la subred Perturb (netuid 26) de Bittensor: el modelo se publica como artefacto de minero verificado por hash on-chain, de modo que puede desplegarse directamente para responder a las peticiones de clasificacion de la subred.
- Moderacion de contenido resistente a evasion: al haber sido ajustado con ejemplos adversarios, es adecuado para clasificar imagenes en entornos donde un usuario podria intentar forzar un falso negativo modificando la imagen, siempre que la taxonomia de destino se remapee desde las 1000 clases de ImageNet.
- Investigacion en robustez adversarial: sirve como punto de partida o linea base para comparar tecnicas de ataque (FGSM, PGD, C&W) y medir la degradacion de precision limpia frente a la precision bajo ataque.
- Etiquetado por lotes de catalogos de imagenes: con la cabeza de 1000 clases, puede preanotar conjuntos de imagenes a 480 px para revision humana posterior, reduciendo el coste de anotacion manual.
- Inspeccion visual automatizada en linea de produccion: clasificacion de piezas o materiales a resolucion 480 px donde pequenas variaciones de iluminacion o ruido de sensor actuan como perturbaciones naturales.
- Extraccion de embeddings para busqueda visual o deduplicacion: truncando la cabeza de clasificacion, el backbone sirve para generar vectores de caracteristicas y alimentar indices de similitud.
- Verificacion reproducible de artefactos on-chain: el par (safetensors, hotkey) permite a terceros recomputar el SHA-256 y comprobar que el checkpoint desplegado es el que se registro en la red.
- Analisis forense de robustez en pipelines existentes: evaluar si un clasificador de referencia aguanta entradas manipuladas antes de sustituirlo por esta variante entrenada de forma adversarial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no reporta exactitud top-1 ni top-5 en ImageNet-1K, no incluye evaluacion de robustez (por ejemplo, precision bajo ataque PGD o AutoAttack con epsilon definido) ni compara la precision limpia del ajuste adversarial con la del modelo base. Tampoco se documentan tiempos de inferencia, throughput ni consumo de memoria medidos.

## Requisitos de hardware

- Peso de los parametros en memoria: aproximadamente 476 MB en fp32, 238 MB en fp16/bf16 y 119 MB en int8 (estimaciones a partir de los 119.027.848 parametros).
- VRAM estimada para inferencia a 480 x 480 px con lote 1: del orden de 1 a 2 GB sumando pesos y activaciones; aumenta de forma aproximadamente lineal con el tamano de lote.
- VRAM estimada para ajuste fino: significativamente superior, en el rango de 16 a 24 GB con lotes medios, segun precision mixta y estrategia de memoria (estimacion, no medida por el autor).
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas para inferencia (RTX 3060, 3070, 4060, 4070, 4080, 4090). Para reentrenamiento adversarial conviene partir de 24 GB (RTX 3090/4090) o usar acumulacion de gradientes.
- GPU de centro de datos: A100, H100 o L40S para entrenamiento a gran escala o inferencia con lotes muy grandes.
- Opciones de despliegue: PyTorch con torchvision (ruta oficial de la model card), exportacion a ONNX o TensorRT, TorchServe o servicios HTTP propios. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Servido en CPU: viable con PyTorch en fp32 o tras cuantizacion a int8, con latencias mayores; no se han publicado cifras.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion de entrada | Clases | Ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| perturb-effv2l-adv (este modelo) | 119.027.848 | 480 x 480 | 1000 (ImageNet-1K) | Entrenamiento adversarial para subred Perturb | apache-2.0 | HuggingFace, sin descargas ni validacion externa |
| torchvision `efficientnet_v2_l` (IMAGENET1K_V1) | ~118,7 M | 480 x 480 | 1000 (ImageNet-1K) | Entrenamiento supervisado estandar | pesos torchvision bajo licencia BSD-3-Clause | Ampliamente usado, descarga directa via API de torchvision |
| ConvNeXt-L (ImageNet-1K) | ~198 M | 224 x 224 | 1000 (ImageNet-1K) | Entrenamiento supervisado estandar | segun implementacion (MIT en repositorios de referencia) | Disponible en torchvision y otros repositorios |
| ViT-L/16 (ImageNet-1K) | ~304 M | 224 x 224 | 1000 (ImageNet-1K) | Entrenamiento supervisado estandar | segun implementacion | Disponible en torchvision y otros repositorios |

No se dispone de cifras de precision para el modelo objeto de la ficha, por lo que la comparacion se limita a parametros, resolucion, taxonomia y licencia. Cualquier afirmacion sobre superioridad en exactitud o robustez exigiria una evaluacion propia.

## Limitaciones y advertencias

- Taxonomia cerrada: solo emite las 1000 clases de ImageNet-1K. No es utilizable directamente para categorias personalizadas sin reentrenar la cabeza.
- Sesgos heredados del dataset: ImageNet-1K presenta desequilibrios geograficos, culturales y de representacion de personas y objetos, que el ajuste adversarial no corrige.
- Riesgo de sobreajuste adversarial: el entrenamiento adversarial suele reducir la precision en datos limpios a cambio de robustez; el autor no publica ninguna de las dos metricas, por lo que no puede cuantificarse el intercambio.
- Robustez no verificada: no se especifica el ataque, la norma ni el epsilon empleados, ni se ofrece evaluacion con ataques no vistos. No hay garantia de robustez frente a ataques distintos del usado en el ajuste.
- Sin validacion de la comunidad: cero descargas y cero likes en el momento de la consulta, y model card autogenerada sin metricas. El artefacto debe tratarse como no auditado.
- Calibracion desconocida: no se documenta temperatura, calibracion de probabilidades ni umbrales recomendados, lo que complica el uso en decisiones automatizadas con umbral.
- Dependencia del preprocesado exacto: redimensionado bicubico a 480, recorte central a 480 y normalizacion con media y desviacion 0,5. Otro preprocesado degrada el rendimiento de forma no medida.
- Verificacion de integridad: el hash on-chain es el unico mecanismo de trazabilidad; descargar el safetensors sin recomputar `sha256(model.safetensors || hotkey)` deja el artefacto sin garantia de correspondencia con el minero registrado.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar las condiciones de la subred Perturb y la licencia de los pesos originales de torchvision (BSD-3-Clause) antes de redistribuir derivados.
- Idiomas: no procede evaluacion multilingue, pero las etiquetas de salida estan en ingles y no hay traduccion oficial.
- Discrepancia de tamano: el repositorio ocupa 1,9 GB frente a los ~476 MB que ocuparia un unico checkpoint fp32 de 119 M de parametros, lo que sugiere la presencia de archivos adicionales no descritos en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mailmail85/perturb-effv2l-adv
- Sitio de la subred Perturb: https://perturbai.io
- Documentacion de torchvision sobre EfficientNetV2: https://pytorch.org/vision/stable/models/efficientnetv2.html
- Repositorio de safetensors: https://github.com/huggingface/safetensors
- Documentacion de Bittensor: https://docs.bittensor.com

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo, su autor ni la subred Perturb; los resultados obtenidos correspondian a paginas de inicio de sesion y soporte de terceros sin relacion con el contenido de la ficha. No se localizaron papers, blogs tecnicos, demos ni informes de evaluacion asociados al modelo.
