# canvit/probe-ade20k-40k-s512-c64-in21k

## Resumen

CanViT ADE20K 64 × 64 es una sonda lineal (linear probe) de segmentación semántica entrenada sobre las características congeladas del canvas de 64 × 64 del modelo base CanViT-B/16. Lo desarrolla el equipo de CanViT (Yohaï-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna) y se publica como artefacto complementario del artículo «CanViT: Toward Active-Vision Foundation Models» (NeurIPS 2026). No es un modelo generativo ni un modelo de lenguaje: es un cabezal de evaluación que demuestra hasta qué punto las representaciones de un backbone de visión activa son útiles para una tarea densa como la segmentación de 150 clases de ADE20K.

CanViT, el Canvas Vision Transformer, es un modelo de visión activa: percibe una escena mediante una secuencia de «vistazos» (glimpses) de 128 px y va memorizando la información en un canvas de alcance completo. Este repositorio concreto contiene únicamente los pesos de la sonda, de muy reducido tamaño (159.894 parámetros según los safetensors), y depende del checkpoint base para funcionar. Su relevancia actual es metodológica: sirve como protocolo reproducible para medir la calidad de las características del backbone sin reentrenar el modelo completo.

El interés práctico es acotado pero claro: permite reproducir el protocolo de sondeo del artículo, comparar entre distintos tamaños de canvas (existen variantes con canvas de 8, 12, 32 y 64) y validar si el canvas completo de 64 × 64 conserva suficiente detalle espacial para segmentación densa. La licencia MIT facilita su uso y reutilización incluso en contextos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal (LayerNorm, dropout, BatchNorm y convolucion 1 × 1) sobre caracteristicas congeladas de un Vision Transformer (CanViT-B/16) |
| Parametros totales | 159.894 (aprox. 0,16 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre un canvas de 64 × 64 y escenas de 512 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02 |
| Dataset de entrenamiento | scene_parse_150 (ADE20K) |
| Tarea (pipeline) | image-segmentation (150 clases) |
| Libreria | canvit-pytorch (>= 0.2) |
| Descargas / likes | 17 descargas / 0 likes |

## Arquitectura y entrenamiento

La sonda se compone de una LayerNorm, dropout (0,1), BatchNorm y una convolucion 1 × 1 que proyecta las características del canvas de 64 × 64 a 150 clases de ADE20K. Se entrena con las características del backbone totalmente congeladas, siguiendo el protocolo de sondeo del artículo. El backbone subyacente es CanViT-B/16, un transformer de visión activa que procesa la escena a traves de vistazos de 128 px sobre escenas de 512 px y acumula la informacion en un canvas global.

El entrenamiento de la sonda consta de 40.000 pasos con batch size 16, optimizador AdamW con learning rate maxima de 0,0003 y weight decay de 0,001, programacion de 1.500 pasos de warmup lineal seguida de decaimiento coseno, precision bfloat16 (autocast) y aumento de datos con recortes aleatorios de escala 0,5 a 2 y volteos horizontales. Los rollouts de entrenamiento usan 10 vistazos de 128 px con puntos de vista R-IID sobre escenas de 512 px. La salida del modelo es un tensor de logits de forma [1, 150, 64, 64].

La innovacion subyacente es la propia formulacion de vision activa de CanViT: en lugar de procesar la imagen completa de una vez, el modelo selecciona secuencialmente regiones (vistazos) y mantiene una representacion global en el canvas, lo que reduce el coste computacional del backbone y plantea un paradigma distinto al de los ViT densos convencionales.

## Capacidades

- Segmentacion semantica densa en las 150 clases de ADE20K a partir del canvas de 64 × 64.
- Evaluacion por sondeo (linear probing) de la calidad de las caracteristicas congeladas de un backbone de vision activa.
- Procesamiento de escenas de 512 px mediante secuencias de vistazos de 128 px (vision activa).
- Salida de mapas de etiquetas por pixel (argmax sobre las 150 clases) con nombres de clase expuestos via CLASS_NAMES.
- Compatibilidad con la integracion canvit_pytorch.from_pretrained_with_probe para cargar conjuntamente backbone y sonda.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues (modelo puramente visual).
- No dispone de modo «thinking», entrada de audio ni generacion de texto.

## Casos de uso

- Reproduccion del protocolo de sondeo del articulo: cargar el backbone CanViT-B/16 congelado y esta sonda para verificar los resultados de segmentacion publicados en «CanViT: Toward Active-Vision Foundation Models» de forma independiente.
- Comparacion de tamanos de canvas: dado que existen sondas equivalentes para canvas de 8, 12, 32 y 64, este checkpoint permite medir el impacto del tamano del canvas en la calidad de la segmentacion densa con un protocolo identico.
- Evaluacion de backbones de vision activa: usar la sonda como referencia para decidir si las caracteristicas de un backbone de vision activa son competitivas frente a alternativas densas antes de invertir en fine-tuning completo.
- Prototipado de segmentacion de escenas interiores y exteriores: etiquetar imagenes de escenas ADE20K (habitaciones, paisajes urbanos, interiores) para generar mascaras semanticas de 150 clases.
- Investigacion en eficiencia computacional: analizar si un paradigma de vistazos con canvas reducido puede sustituir a un ViT denso en tareas densas a un coste menor.
- Generacion de pseudo-etiquetas para preentrenamiento: emplear las mascaras de la sonda como etiquetas aproximadas en pipelines de investigacion que alimenten modelos de segmentacion mayores.
- Demostraciones docentes: ilustrar el concepto de «sonda lineal» y de evaluacion de representaciones congeladas en cursos de vision por computador, dado el reducido tamano (0,16 M de parametros) y la licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la information disponible.

## Requisitos de hardware

- La sonda en si ocupa menos de 1 MB (0,16 M de parametros), por lo que su almacenamiento y carga son triviales.
- El coste real de inferencia lo determina el backbone CanViT-B/16 a 512 px con secuencias de vistazos, no la sonda.
- VRAM estimada: no publicada. Al tratarse de un ViT-Base con escenas de 512 px, la inferencia en bfloat16 deberia caber holgadamente en GPUs de consumo (por ejemplo, RTX 3060 12 GB o superiores), aunque no se han documentado cifras exactas.
- GPU recomendadas: no especificadas por el autor; cualquier GPU moderna con soporte bfloat16 es suficiente. Tambien es viable en CPU para pruebas puntuales dado el reducido tamano del backbone.
- Opciones de despliegue: la libreria oficial canvit-pytorch (>= 0.2); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros del cabezal | Licencia | Rendimiento |
|---|---|---|---|---|
| canvit/probe-ade20k-40k-s512-c64-in21k | Sonda lineal sobre vistazos (canvas 64 × 64) | 159.894 | MIT | no disponible |
| Sondas CanViT para canvas 8, 12 y 32 | Sondas lineales equivalentes del mismo equipo | no disponible | MIT | no disponible |
| Sondas lineales sobre DINOv2 / MAE para segmentacion | Sondas lineales sobre ViT denso | no disponible | variable | no disponible |
| SegFormer-B0 (segmentacion supervisada) | Modelo de segmentacion entrenado de extremo a extremo | no disponible | Apache-2.0 u otras | no disponible |

Nota: no se dispone de cifras de mIoU publicadas en la informacion proporcionada para ninguna de las alternativas, por lo que la comparacion cuantitativa queda pendiente de los resultados del articulo CanViT.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el checkpoint base canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02 para funcionar.
- Al estar entrenada sobre caracteristicas congeladas, la calidad de la segmentacion esta acotada por el backbone y no mejora con mas entrenamiento de la sonda.
- Solo cubre las 150 clases de ADE20K: cualquier objeto fuera de ese vocabulario se etiquetara de forma incorrecta o ambigua.
- El canvas de 64 × 64 impone una resolucion espacial limitada; objetos pequenos pueden perder detalle.
- No es un modelo de lenguaje, por lo que no procede hablar de alucinacion textual, tool calling, agentes ni capacidades multilingues; el riesgo equivalente son errores de clasificacion por pixel.
- Sesgos potenciales heredados del dataset scene_parse_150 (ADE20K): sobrerrepresentacion de escenas interiores y exteriores de determinadas regiones, con menor cobertura de otras culturas y entornos.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset subyacente por separado.
- En produccion, tratarlo como componente de investigacion o de evaluacion, no como un segmentador listo para tareas criticas sin validacion adicional.
- La revision canvit-pytorch-0.1 requiere pasar revision="canvit-pytorch-0.1" al cargar; con canvit-pytorch >= 0.2 no es necesario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- Modelo base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Articulo (arXiv 2603.22570): https://arxiv.org/abs/2603.22570
- Codigo: https://github.com/m2b3/CanViT
- Pagina del proyecto: https://m2b3.github.io/CanViT/
- Coleccion de checkpoints CanViT: https://huggingface.co/canvit
- Sonda relacionada (canvas 8): https://huggingface.co/canvit/probe-ade20k-40k-s512-c8-in21k
- Sonda relacionada (canvas 32): https://huggingface.co/canvit/probe-ade20k-40k-s512-c32-in21k
