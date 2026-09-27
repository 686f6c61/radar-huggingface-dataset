# canvit/probe-ade20k-40k-s512-c32-in21k

## Resumen

Este repositorio no contiene un modelo generativo, sino una **cabeza de segmentación semántica lineal (probe)** entrenada sobre las características congeladas del modelo base `canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02`. El probe está desarrollado por el equipo CanViT y se publica como artefacto de evaluación del protocolo de *probing* descrito en el artículo del modelo fundacional de visión activa CanViT (Canvas Vision Transformer, NeurIPS 2026). Su función es medir la calidad de las representaciones del *canvas* de CanViT resolviendo segmentación semántica sobre ADE20K (`scene_parse_150`) sin reentrenar el backbone.

CanViT es un modelo de visión activa: en lugar de procesar la imagen completa de una vez, observa la escena mediante una secuencia de *glimpses* y acumula la información en un *canvas* de ámbito global. Este probe concreto opera sobre el canvas de 32 × 32 posiciones, produciendo logits por píxel a esa resolución de rejilla para 150 clases de ADE20K. El checkpoint base se preentrenó con escenas de 512 px y *glimpses* de 128 px sobre ImageNet-21k, y el probe se entrenó durante 40.000 pasos con 10 *glimpses* por *rollout*.

Es relevante ahora porque forma parte de la familia de *probes* publicados (canvas 8 × 8, 12 × 12, 32 × 32 y 64 × 64) que permiten comparar cuánta información semántica retiene el canvas de CanViT en función de su resolución de rejilla, un eje de análisis clave para decidir el coste computacional de despliegues de visión activa. El repo es muy ligero (0,0 GB, 159.894 parámetros en safetensors) y se distribuye con licencia MIT, aunque requiere descargar el checkpoint base para poder inferir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Probe lineal sobre características congeladas de un Vision Transformer de visión activa (CanViT); el probe combina LayerNorm, dropout, BatchNorm y una convolución 1 × 1 |
| Parametros totales | 159.894 (solo el probe; el backbone se descarga aparte desde el modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como contexto de texto; el canvas de trabajo es una rejilla de 32 × 32 posiciones (1.024 celdas) sobre escenas de 512 px con *glimpses* de 128 px |
| Tipos de cuantizacion | no se documentan cuantizaciones del probe; el entrenamiento usó autocast en bfloat16 y los pesos se publican en safetensors |
| Idiomas soportados | no disponible (modelo exclusivamente visual, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | image-segmentation |
| Dataset de entrenamiento | scene_parse_150 (ADE20K), 150 clases |
| Modelo base | canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02 |
| Libreria | canvit-pytorch (>= 0.2 para la revision actual; la revision `canvit-pytorch-0.1` se conserva) |
| Descargas / likes | 47 descargas, 0 likes |
| Fechas | creado el 2026-03-15, actualizado el 2026-09-26 |

## Arquitectura y entrenamiento

El probe es un cabezal de segmentación deliberadamente simple: LayerNorm sobre las características del canvas, dropout, BatchNorm y una convolución 1 × 1 que proyecta a las 150 clases de ADE20K. Se entrena con el backbone completamente congelado, de modo que su rendimiento es una medida directa de la linealidad de la información semántica presente en las activaciones del canvas de CanViT, no de la capacidad del cabezal. La convolución 1 × 1 opera celda a celda sobre la rejilla, por lo que la salida son logits de forma `[1, 150, 32, 32]`; la clase predicha se obtiene con `argmax` sobre la dimensión de clases y, si se necesita resolución de píxel completa, `predict` añade un *upsampling* bilineal.

El entrenamiento se realizó sobre `scene_parse_150` con *rollouts* de 10 *glimpses* de 128 px sobre escenas de 512 px y puntos de vista R-IID, durante 40.000 pasos con batch size 16. Se usó AdamW con *learning rate* máximo de 0,0003, *weight decay* de 0,001, un calentamiento lineal de 1.500 pasos seguido de decaimiento coseno, aumento de datos con recortes aleatorios de escala 0,5 a 2 y *flips* horizontales, dropout de 0,1 y autocast en bfloat16. El nombre del checkpoint base incluye los identificadores `g128px-s512px` (glimpse 128 px, escena 512 px), `in21k` (preentrenamiento en ImageNet-21k) y `dv3b16`, que sugiere una destilación desde un profesor tipo DINOv3 B/16; este último punto no está confirmado en la información disponible.

## Capacidades

- Segmentación semántica densa de escenas sobre 150 clases de ADE20K, a resolución de rejilla de canvas de 32 × 32 con opción de *upsampling* bilineal.
- Extracción de características visuales congeladas de un backbone de visión activa, útil como *baseline* de evaluación de representaciones.
- Procesamiento de escenas de 512 px mediante secuencias de *glimpses* con control explícito del punto de vista (`Viewpoint`, `sample_at_viewpoint`).
- Gestión de estado recurrente a través de `init_state` y del par `(logits, state)` devuelto en cada paso, lo que permite alimentar varios *glimpses* antes de leer la predicción.
- Compatibilidad con el protocolo R-IID de puntos de vista empleado en el entrenamiento y con `Viewpoint.full_scene` para una única pasada de escena completa.
- No soporta *tool calling*, ni *function calling*, ni razonamiento multi-paso textual, ni generación de lenguaje: es un modelo puramente visual de segmentación.
- No dispone de capacidades multilingües, de audio, de vídeo ni de modo *thinking*.
- El repositorio incluye además la revisión `canvit-pytorch-0.1` para compatibilidad con versiones antiguas de la librería.

## Casos de uso

- **Evaluación de representaciones de visión activa**: usar este probe como referencia para medir cuánta información semántica conserva el canvas de 32 × 32 frente a los probes de canvas 8 × 8, 12 × 12 y 64 × 64, comparando la calidad de segmentación sin reentrenar el backbone.
- **Prototipado rápido de segmentación semántica**: al ser un cabezal de ~160 K parámetros sobre un backbone preentrenado, permite obtener mapas de 150 clases en pocas líneas de código y con un coste de almacenamiento prácticamente nulo, adecuado para *demos* y validaciones de concepto.
- **Anotación asistida de datasets de interiores y escenas**: ADE20K cubre clases de interior y exterior (mobiliario, superficies, estructuras), por lo que el probe puede preetiquetar imágenes para revisión humana en proyectos de anotación de *scene parsing*.
- **Investigación en robótica y navegación con percepción activa**: al integrarse en el bucle de *glimpses* de CanViT, permite estudiar políticas de fijación visual donde un agente decide dónde mirar y consulta el mapa semántico acumulado en el canvas.
- **Análisis de sensibilidad a la resolución del canvas**: entrenar o comparar variantes de canvas para determinar el punto de compromiso entre coste de cómputo y fidelidad de la segmentación en un sistema de percepción embarcado.
- **Componente de *pipeline* de segmentación de bajo coste**: integrar los logits del probe como entrada de etapas posteriores (recuento de objetos por clase, cálculo de áreas, *cropping* guiado por clase) en herramientas de análisis de imágenes.
- **Reproducción de resultados académicos**: validar la implementación de `canvit-pytorch` y del protocolo de *probing* del artículo, dado que el repositorio expone los hiperparámetros completos de entrenamiento (pasos, optimizador, *schedule*, aumentos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La *model card* y los resultados de búsqueda no incluyen métricas de segmentación (mIoU, pixel accuracy) ni comparaciones numéricas con otros modelos; únicamente se documenta el protocolo de entrenamiento (40.000 pasos, batch 16, 10 *glimpses* de 128 px, escenas de 512 px).

## Requisitos de hardware

- **VRAM del probe**: despreciable; 159.894 parámetros equivalen a menos de 1 MB en fp32 y aproximadamente 0,3 MB en bfloat16.
- **VRAM del sistema completo**: la mayor parte del consumo proviene del backbone CanViT-B/16 del modelo base, cuyas dimensiones exactas no se detallan en la información disponible. El nombre del checkpoint (`b16`) sugiere un tamaño tipo ViT-B/16, del orden de 86 M de parámetros, pero este dato no está confirmado.
- **GPU recomendadas**: no disponibles en la información proporcionada. Por el tamaño del sistema, es previsible que quepa en GPUs de consumo, pero no se aportan cifras oficiales de VRAM ni listas de GPU validadas.
- **Despliegue**: la vía documentada es `canvit-pytorch>=0.2` con `CanViTForSemanticSegmentation.from_pretrained_with_probe`, que carga el backbone desde su repositorio y el probe desde este. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso están orientados a modelos de lenguaje y no a este tipo de cabezal visual.
- **Latencia y throughput**: no disponibles. El coste dominante es la evaluación del backbone sobre los 10 *glimpses* de 128 px por escena de 512 px, más el coste trivial del probe.

## Comparativa con modelos similares

No se dispone de métricas de rendimiento para comparar con alternativas de segmentación. La comparación más directa posible es con los otros *probes* de la misma familia, que difieren únicamente en la resolución del canvas:

| Modelo | Canvas | Dataset | Parametros del probe | Licencia | Notas |
|---|---|---|---|---|---|
| canvit/probe-ade20k-40k-s512-c32-in21k (este) | 32 × 32 | ADE20K (150 clases) | 159.894 | MIT | Rejilla intermedia de la familia |
| canvit/probe-ade20k-40k-s512-c8-in21k | 8 × 8 | ADE20K | no disponible | MIT | Canvas de baja resolución |
| canvit/probe-ade20k-40k-s512-c12-in21k | 12 × 12 | ADE20K | no disponible | MIT | Canvas de baja resolución |
| canvit/probe-ade20k-40k-s512-c64-in21k | 64 × 64 | ADE20K | no disponible | MIT | Canvas de alta resolución |

Frente a modelos de segmentación convencionales (SegFormer, Mask2Former, DeepLab) o a *probes* lineales sobre backbones tipo DINOv2/DINOv3, no hay datos comparativos publicados en la información disponible.

## Limitaciones y advertencias

- **No es un modelo autónomo**: requiere descargar y ejecutar el checkpoint base `canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02`; el repositorio solo contiene el cabezal.
- **Resolución de salida baja**: los logits se generan en una rejilla de 32 × 32, muy inferior a la resolución de la imagen original (512 px); el *upsampling* bilineal no recupera detalle fino y produce bordes suavizados.
- **Sesgos del dataset**: hereda los sesgos de ADE20K/`scene_parse_150`, dominado por escenas de interiores y exteriores con una taxonomía de 150 clases; el rendimiento caerá en dominios no representados (imágenes médicas, satélite, documentos).
- **Riesgo de error en clases raras**: al ser un *probe* lineal sobre características congeladas, la confusión entre clases poco frecuentes del dataset es previsible; no se publican métricas por clase que permitan cuantificarlo.
- **Dependencia del protocolo**: los resultados solo son comparables si se respeta el mismo esquema de *glimpses* (10 de 128 px), el mismo tamaño de escena (512 px) y el mismo canvas (32 × 32); desviarse invalida la comparación con los demás *probes*.
- **Sin capacidades de lenguaje**: no genera texto, no acepta *prompts* y no permite *tool calling*; cualquier uso conversacional o agéntico queda fuera de su alcance.
- **Licencia**: MIT, permisiva para uso comercial, si bien conviene verificar la licencia del modelo base y del dataset ADE20K antes de un despliegue en producción.
- **Poca tracción**: 47 descargas y 0 *likes* en el momento del análisis, sin métricas de terceros que validen su comportamiento fuera del artículo.
- **Compatibilidad de versiones**: con `canvit-pytorch<0.2` es necesario pasar `revision="canvit-pytorch-0.1"` a `from_pretrained`, lo que puede provocar errores silenciosos si se omite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/canvit/probe-ade20k-40k-s512-c32-in21k
- Modelo base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Colección de checkpoints CanViT: https://huggingface.co/canvit
- Probe con canvas 8 × 8: https://huggingface.co/canvit/probe-ade20k-40k-s512-c8-in21k
- Probe con canvas 12 × 12: https://huggingface.co/canvit/probe-ade20k-40k-s512-c12-in21k
- Probe con canvas 64 × 64: https://huggingface.co/canvit/probe-ade20k-40k-s512-c64-in21k
- Artículo (arXiv): https://arxiv.org/abs/2603.22570
- Repositorio de código (referencia): https://github.com/m2b3/CanViT
- Repositorio de la implementación en PyTorch: https://github.com/m2b3/CanViT-PyTorch
- Página del proyecto: https://m2b3.github.io/CanViT/
