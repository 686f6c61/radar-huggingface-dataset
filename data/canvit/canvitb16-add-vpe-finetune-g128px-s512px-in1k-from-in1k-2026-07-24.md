# canvit/canvitb16-add-vpe-finetune-g128px-s512px-in1k-from-in1k-2026-07-24

## Resumen

CanViT-B (Canvas Vision Transformer, variante base) es un modelo de visión activa desarrollado por el grupo canvit (Yohai-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna), presentado en el paper "CanViT: Toward Active-Vision Foundation Models" (NeurIPS 2026, arXiv:2603.22570). A diferencia de un ViT convencional, que procesa la imagen completa de una sola pasada, CanViT observa la escena mediante una secuencia de "glimpses" (recortes) y va acumulando la información en un lienzo interno o canvas de estado global. Este checkpoint concreto parte del preentrenamiento en ImageNet-1k y se ha afinado de extremo a extremo para clasificación en ImageNet-1k mediante la estrategia LP-FT (linear probing y después fine-tuning).

El modelo tiene 95.928.936 parámetros (~96 M), un tamaño propio de un ViT-B/16, y trabaja con escenas de 512 px a partir de glimpses de 128 px sobre un canvas de 32 × 32. La relevancia actual está en que propone un paradigma de inferencia "anytime": con un solo glimpse se obtiene una predicción inicial y cada glimpse adicional refina la clasificación, lo que permite ajustar el coste computacional a la precisión requerida sin cambiar de modelo. El checkpoint reporta un 84,19 % de top-1 en la validación de ImageNet-1k (C2F, T=21, media sobre 11 semillas de política, en el último glimpse), un dato declarado por el autor y no verificado de forma independiente.

Es un modelo de nicho y muy reciente: el repositorio ocupa 0,4 GB, no tiene descargas ni likes, y su librería de referencia (canvit-pytorch, versión >= 0.2) es específica del proyecto. Resulta interesante sobre todo para investigadores en visión activa, computación con presupuesto variable y representaciones con estado, no como sustituto directo de un clasificador de imágenes estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Canvas Vision Transformer (CanViT), backbone ViT-B/16 con estado recurrente tipo canvas y muestreo de glimpses |
| Parametros totales | 95.928.936 (~96 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; procesa escenas de 512 px mediante secuencias de hasta T=21 glimpses de 128 px con canvas de 32 × 32 |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes GGUF, INT8, AWQ o similares) |
| Idiomas soportados | no disponible / no aplica (modelo de vision, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (exportado a PyTorch desde JAX/Flax NNX) |
| Tarea | image-classification (ImageNet-1k, 1000 clases) |
| Tamano del repositorio | 0,4 GB |
| Modelo base | canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16-2026-06-22 |
| Libreria | canvit-pytorch (>= 0.2) |

## Arquitectura y entrenamiento

CanViT es un transformer de vision con estado. En lugar de alimentar la imagen completa como una rejilla fija de parches, el modelo recibe un glimpse (un recorte de 128 px extraido de una escena de 512 px en un viewpoint concreto) y actualiza un canvas interno de 32 × 32 que actua como memoria de toda la escena. La cabeza de clasificacion se lee del token CLS, cuyo readout se ha inicializado fusionandolo con la sonda DINOv3 `canvit/dinov3-vitb16-lvd1689m-in1k-512x512-linear-clf-probe`. Esto implica que el modelo puede refinar su prediccion a medida que recibe mas glimpses, en lugar de producir una unica salida estatica.

El entrenamiento de este checkpoint parte del modelo preentrenado en ImageNet-1k y aplica LP-FT: primero linear probing y despues fine-tuning de extremo a extremo, con rollouts de 4 glimpses F-IID de 128 px sobre escenas de 512 px, canvas de 32 × 32 y retropropagacion completa en el tiempo (full BPTT). Se ejecutaron 100.000 de los 100.080 pasos previstos con batch size 256, optimizador AdamW (learning rate 2,5e-05, weight decay 0,0001, gradient clipping 1), 25.000 pasos de warmup lineal seguidos de decaimiento coseno hasta 0, y funcion de perdida de entropia cruzada en cada glimpse con label smoothing 0,1. El entrenamiento se hizo con JAX/Flax NNX sobre Cloud TPU y el resultado se exporto a PyTorch, que es el formato publicado en HuggingFace.

La innovacion tecnica principal es el propio esquema de vision activa con canvas: separa el coste de "mirar" (glimpses de baja resolucion y area reducida) del de "recordar" (estado global), y permite politicas de seleccion de viewpoints evaluadas sobre varias semillas, de modo que el mismo modelo se puede usar con distintos presupuestos de computo.

## Capacidades

- Clasificacion de imagenes en 1000 clases de ImageNet-1k a partir de escenas de 512 px.
- Procesamiento secuencial con estado: mantiene un canvas de 32 × 32 y lo actualiza con cada glimpse recibido.
- Inferencia anytime: la prediccion mejora a medida que se acumulan glimpses; el ejemplo de la model card realiza una primera pasada con `Viewpoint.full_scene` y admite pasos adicionales para refinar.
- Soporte de viewpoints: la API expone `Viewpoint` y `sample_at_viewpoint`, lo que permite elegir explicitamente la region observada en cada paso.
- Extraccion de representaciones con estado (canvas y token CLS) utilizable en tareas posteriores de investigacion.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas ni capacidades multilingues.
- No documenta tool calling, function calling ni comportamiento de agente.
- No documenta capacidades de vision-lenguaje, audio, video ni modo de razonamiento explicito.
- Solo se ha validado la cabeza de clasificacion para el espacio de etiquetas de ImageNet-1k.

## Casos de uso

- Clasificacion de imagenes de alta resolucion con coste controlado: en lugar de procesar la escena completa de 512 px, el modelo puede consumir uno o pocos glimpses de 128 px y refinar la decision segun el presupuesto disponible, lo que resulta util en pipelines con limites estrictos de latencia.
- Vision embebida con computo variable: al ser un modelo de ~96 M de parametros y admitir inferencia anytime, encaja en dispositivos con GPU modesta donde se quiera aumentar la precision solo cuando el sistema no este saturado.
- Investigacion en vision activa: sirve como banco de pruebas para politicas de seleccion de viewpoints, ya que el checkpoint reporta resultados promediados sobre 11 semillas de politica y permite comparar estrategias de muestreo.
- Analisis de escenas donde la evidencia es local: escenas amplias en las que la informacion discriminante ocupa una fraccion pequena de la imagen pueden beneficiarse de la seleccion dirigida de regiones, siempre que se ajuste o entrene una politica adecuada al dominio.
- Control de calidad visual en entornos industriales: con fine-tuning especifico, el esquema de glimpses secuenciales es adecuado para inspeccionar piezas extensas buscando defectos localizados.
- Prototipado academico y docencia: la API de canvit-pytorch (init_state, Viewpoint, sample_at_viewpoint) es sencilla de integrar en cuadernos y experimentos sobre representaciones con estado.
- Extraccion de caracteristicas para transferencia: el estado del canvas y el token CLS pueden emplearse como entrada de clasificadores lineales o sondas en otros conjuntos de datos, previa validacion experimental.
- Generacion de datos sinteticos de trayectorias de observacion: permite estudiar como varian las predicciones segun la secuencia de viewpoints, util para simular agentes que exploran una imagen.

Conviene tener en cuenta que, salvo la clasificacion en ImageNet-1k, el resto de aplicaciones requieren entrenamiento o fine-tuning adicional por parte del usuario, ya que el checkpoint publicado solo incluye la cabeza de 1000 clases.

## Benchmarks y rendimiento

| Dataset | Split | Tarea | Metrica | Valor |
|---|---|---|---|---|
| ImageNet-1k | validation | image-classification | Top-1 accuracy (C2F, T=21, media sobre 11 semillas de politica, en el ultimo glimpse) | 84,19 |

Nota: el dato procede del model-index declarado por el autor y figura como `verified: false`, es decir, no ha sido verificado de forma independiente. No se han publicado en la informacion disponible otros resultados de benchmarks (ni MMLU, ni HumanEval, ni GSM8K, que en cualquier caso no aplican a un modelo de clasificacion de imagenes), ni comparativas numericas con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM para inferencia: con 95,9 M de parametros, los pesos ocupan aproximadamente 0,38 GB en FP32 y la mitad en FP16/BF16; sumando activaciones de escenas de 512 px, glimpses de 128 px y canvas de 32 × 32, la inferencia deberia caber comodamente en GPUs con 8 GB o mas (estimacion a partir del tamano del modelo; no se publican mediciones oficiales).
- GPU recomendadas: cualquiera con soporte CUDA y suficiente memoria, desde una RTX 3060/4070 hasta A100 o H100; en el extremo alto no hay ganancia funcional, solo de throughput. El entrenamiento original se hizo en Cloud TPU con JAX/Flax NNX.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU consumer con 8 GB o mas, dado el tamano del modelo. No se documentan requisitos minimos oficiales.
- Memoria de entrenamiento: el fine-tuning usa full BPTT sobre rollouts de 4 glimpses de 128 px y batch 256, por lo que el coste de memoria es muy superior al de la inferencia y no esta cuantificado en la informacion disponible.
- Opciones de despliegue: la via soportada es PyTorch con la libreria `canvit-pytorch>=0.2`, mediante `CanViTForImageClassification.from_pretrained(...)`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos ONNX o TensorRT, que estan orientados a modelos de lenguaje o a ViTs sin estado.
- Latencia y throughput: no disponible. El coste depende linealmente del numero de glimpses (T), que es configurable; el resultado de 84,19 % corresponde a T=21.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad | Rendimiento en ImageNet-1k val |
|---|---|---|---|---|---|
| CanViT-B (este checkpoint) | 95,9 M | Escena de 512 px, glimpses de 128 px, canvas 32 × 32 | MIT | HuggingFace, libreria canvit-pytorch | 84,19 % top-1 (declarado por el autor, sin verificar) |
| DINOv3 ViT-B/16 (sonda lineal referenciada en la model card) | no disponible en la informacion | Parches de 16 px a 512 px | no disponible en la informacion | Referenciado como `canvit/dinov3-vitb16-lvd1689m-in1k-512x512-linear-clf-probe` | no disponible en la informacion |
| ViT-B/16 supervisado clasico | no disponible en la informacion | Rejilla fija de parches de 16 px | no disponible en la informacion | Amplia, multiples checkpoints | no disponible en la informacion |

Advertencia de comparabilidad: este checkpoint se preentrena y despues se afina sobre ImageNet-1k, el mismo conjunto en el que se evalua, por lo que su 84,19 % no es directamente comparable con el de modelos que se evaluan con protocolos de representacion congelada o sin etiquetas de ImageNet-1k.

## Limitaciones y advertencias

- El resultado de 84,19 % top-1 esta declarado por el autor y marcado como no verificado; no hay evaluacion independiente.
- La metrica reportada es una media sobre 11 semillas de politica, lo que indica que existe varianza entre politicas de muestreo de viewpoints; el comportamiento puede degradarse con politicas distintas a las evaluadas.
- El modelo esta afinado especificamente para las 1000 clases de ImageNet-1k: su cabeza no es reutilizable directamente en otros dominios sin fine-tuning.
- Existe solapamiento entre preentrenamiento y evaluacion (ImageNet-1k en ambos casos), lo que infla la cifra frente a protocolos de evaluacion mas estrictos.
- No se documenta ningun analisis de sesgos, robustez ante perturbaciones, imagenes corruptas o dominios fuera de distribucion.
- Riesgo de error en escenas muy distintas a las de entrenamiento: al depender de una politica de seleccion de glimpses, una politica mal ajustada puede omitir la region discriminante y producir un fallo sistematico.
- No aplica a tareas de lenguaje, codigo, matematicas, agentes ni tool calling.
- Limitaciones de entrada: escenas de 512 px y glimpses de 128 px, con canvas de 32 × 32; no se documenta soporte para otras resoluciones o relaciones de aspecto.
- Licencia MIT: permite uso comercial y modificacion, pero obliga a conservar el aviso de copyright y la licencia. El modelo base y las sondas DINOv3 referenciadas pueden tener condiciones propias que conviene revisar antes de un uso comercial en cadena.
- Madurez muy baja del ecosistema: 0 descargas, 0 likes, repositorio de 0,4 GB, libreria especifica (`canvit-pytorch`) y ausencia de integraciones en herramientas estandar de despliegue, lo que aumenta el coste de mantenimiento en produccion.
- El entrenamiento con full BPTT sobre rollouts hace que reproducir el fine-tuning sea costoso en memoria y probablemente inviable en GPUs de consumo con batch grande.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canvit/canvitb16-add-vpe-finetune-g128px-s512px-in1k-from-in1k-2026-07-24
- Modelo base (preentrenado en ImageNet-1k): https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16-2026-06-22
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- Codigo: https://github.com/m2b3/CanViT
- Pagina del proyecto: https://m2b3.github.io/CanViT/
- Todos los checkpoints: https://huggingface.co/canvit
- Sonda DINOv3 referenciada: canvit/dinov3-vitb16-lvd1689m-in1k-512x512-linear-clf-probe
- Dataset: imagenet-1k
