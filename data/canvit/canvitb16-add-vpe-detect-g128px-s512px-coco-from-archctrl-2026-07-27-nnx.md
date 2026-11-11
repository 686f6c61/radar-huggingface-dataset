# canvit/canvitb16-add-vpe-detect-g128px-s512px-coco-from-archctrl-2026-07-27-nnx

## Resumen

CanViT-B COCO detector es un modelo de deteccion de objetos construido sobre CanViT (Canvas Vision Transformer), un modelo fundacional de vision activa presentado en NeurIPS 2026 por Yohai-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna. A diferencia de un ViT convencional, que procesa la imagen completa de una vez, CanViT observa la escena mediante una secuencia de "glimpses" (recortes de 128 px) y acumula la informacion en un canvas de 32 x 32 que actua como memoria espacial de toda la escena.

Este checkpoint concreto anade una cabeza CenterNet sobre el canvas y se ha entrenado de extremo a extremo para deteccion de objetos en COCO 2017, prediciendo cajas despues de cada glimpse. Parte de un checkpoint preentrenado por destilacion desde DINOv3 y se distribuye en formato NNX (JAX/Flax) con 97.545.684 parametros y licencia MIT.

Su relevancia es doble: por un lado demuestra que la vision activa puede aplicarse a tareas densas como la deteccion, no solo a clasificacion; por otro, ofrece una implementacion funcional en el ecosistema JAX que sirve como referencia para investigar politicas de muestreo visual y razonamiento espacial incremental. El modelo es un "architecture control" segun el paper, es decir, una variante de control arquitectonico mas que un detector de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Canvas Vision Transformer (CanViT) con cabeza CenterNet sobre canvas |
| Parametros totales | 97.545.684 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision); canvas de 32 x 32, escenas de 512 px, glimpses de 128 px |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (backend JAX/Flax NNX, libreria canvit-nnx) |

## Arquitectura y entrenamiento

CanViT combina un backbone ViT-B/16 con un canvas persistente de 32 x 32 posiciones. En cada paso, el modelo recibe un glimpse de 128 x 128 px muestreado en un viewpoint concreto, lo procesa y actualiza el canvas mediante atencion cruzada, de modo que la representacion de la escena se construye de forma incremental. Sobre el canvas se aplica una cabeza CenterNet que produce mapas de calor, offsets y dimensiones de caja, decodificados a detecciones normalizadas (ymin, xmin, ymax, xmax) con puntuaciones e indices de las 80 clases de COCO.

El preentrenamiento del checkpoint base se realizo por destilacion desde DINOv3 sobre ImageNet-1k (segun el identificador del modelo base: `in1k-dv3b16-archctrl`), y el ajuste fino para deteccion se ejecuto sobre COCO train2017 con 256 escenas por paso y 5 glimpses por rollout. Este checkpoint corresponde al paso 16000 de 92411 del entrenamiento de deteccion, por lo que no esta completamente convergido. La receta completa se documenta en `provenance.json` dentro del repositorio.

## Capacidades

- Deteccion de objetos en 80 clases de COCO, con cajas normalizadas y puntuaciones de confianza.
- Vision activa: muestreo secuencial de glimpses mediante politicas como `coarse_to_fine` (C2F), con memoria espacial en canvas.
- Prediccion incremental: emite detecciones tras cada glimpse, mejorando progresivamente con el numero de observaciones.
- Estado persistente entre pasos (`init_state`, `state`), lo que permite razonamiento espacial multi-paso.
- Integracion nativa con JAX/Flax NNX, incluyendo `jax.random` para el muestreo de viewpoints.
- No soporta tool calling, generacion de texto, codigo, matematicas, audio ni capacidades multilingues: es exclusivamente un modelo de vision.

## Casos de uso

- Investigacion en vision activa: permite reproducir y extender los experimentos del paper sobre politicas de muestreo (C2F y alternativas), midiendo como evoluciona el AP con cada glimpse.
- Deteccion con presupuesto computacional limitado: al procesar recortes de 128 px en lugar de la escena completa, el coste por paso es menor y puede interrumpirse en cualquier momento obteniendo detecciones parciales.
- Prototipado de sistemas de percepcion incremental: util para robots o agentes que no ven la escena entera de golpe y deben decidir donde mirar a continuacion.
- Baseline academico para comparar arquitecturas de memoria visual: el canvas de 32 x 32 y el control arquitectonico facilitan experimentos ablativos sobre mecanismos de memoria.
- Analisis de escalado por timestep: el modelo permite estudiar curvas AP frente a numero de glimpses (de 0,1201 a 0,1902 entre 0 y 4 glimpses), util en estudios de eficiencia.
- Ensenanza y divulgacion de JAX/Flax NNX: el codigo de ejemplo completo (carga, muestreo, inferencia y decodificacion) sirve como tutorial practico de modelos de vision en el ecosistema NNX.
- Evaluacion de destilacion desde DINOv3: al derivar de un checkpoint destilado, permite medir como afecta la destilacion a tareas densas como la deteccion.

## Benchmarks y rendimiento

COCO val2017 (5000 imagenes), politica C2F, medias sobre 5 muestreos independientes de viewpoints (intervalos bootstrap del 95 %):

| Glimpse | AP | AP50 | AP75 |
|---|---|---|---|
| 0 | 0.1201 | 0.2445 | 0.1071 |
| 1 | 0.1441 [0.1432, 0.1450] | 0.2823 [0.2805, 0.2841] | 0.1330 [0.1320, 0.1339] |
| 2 | 0.1616 [0.1610, 0.1622] | 0.3114 [0.3102, 0.3127] | 0.1505 [0.1496, 0.1512] |
| 3 | 0.1767 [0.1761, 0.1773] | 0.3376 [0.3366, 0.3388] | 0.1657 [0.1648, 0.1666] |
| 4 | 0.1902 [0.1899, 0.1904] | 0.3606 [0.3596, 0.3615] | 0.1807 [0.1799, 0.1814] |

No se han publicado en la informacion disponible resultados comparativos con otros detectores en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa aproximadamente 0,4 GB en safetensors (unos 390 MB en float32 para 97,5 M de parametros); con estado del canvas y buffers de inferencia, el uso real sera de unos pocos GB, aunque no se publica una cifra oficial.
- GPU recomendadas: cualquier GPU compatible con JAX (CUDA o ROCm); para experimentation comoda, A100 o H100; para uso local, RTX 3090/4090 o superiores.
- Cabe en GPU de consumo: si, dado el tamano reducido del modelo; se espera que quepa en GPUs con 8 GB o mas, aunque no hay cifras oficiales de consumo.
- Opciones de despliegue: JAX/Flax NNX mediante la libreria `canvit-nnx` (`uv add canvit-nnx`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CanViT-B COCO detector | 97,5 M | escenas 512 px, glimpses 128 px, canvas 32 x 32 | Deteccion COCO (vision activa) | MIT | Hugging Face, JAX/NNX |
| DINOv3 ViT-B/16 (backbone de origen) | no disponible en la informacion | imagen completa | Representaciones visuales (base para fine-tuning) | DINOv3 License | GitHub / pesos oficiales |
| Detectores CenterNet clasicos sobre ResNet/ViT | variable | imagen completa | Deteccion COCO | variable | amplia disponibilidad |

No se dispone de datos de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Rendimiento modesto: el AP maximo reportado es 0,1902 con 4 glimpses, muy por debajo de detectores COCO convencionales; no es adecuado para produccion sin ajuste adicional.
- Checkpoint no convergido: corresponde al paso 16000 de 92411 del entrenamiento de deteccion.
- Dependencia de la politica de muestreo: los resultados varian con los viewpoints; las metricas son medias sobre 5 muestreos y presentan intervalos de confianza que deben tenerse en cuenta.
- Herencia de licencia: aunque el modelo se distribuye bajo MIT, el preentrenamiento destila desde DINOv3, cuyos pesos estan sujetos a la DINOv3 License; conviene revisar las implicaciones para uso comercial.
- Sin soporte de lenguaje ni multilingue: no procesa texto, por lo que no aplican casos de uso conversacionales.
- Riesgo de alucinacion en deteccion: al ser un detector con puntuaciones bajas, puede producir falsos positivos o cajas imprecisas, especialmente con pocos glimpses.
- Ecosistema limitado: requiere JAX/Flax NNX y la libreria `canvit-nnx`; no hay soporte documentado para runtimes de inferencia habituales (ONNX, TensorRT, llama.cpp).
- Sin datos de sesgo: la model card no documenta analisis de sesgos por clase, genero, etnia ni geografia.
- Comunidad minima: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/canvit/canvitb16-add-vpe-detect-g128px-s512px-coco-from-archctrl-2026-07-27-nnx
- Modelo base: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16-archctrl-2026-07-26-nnx
- Paper (NeurIPS 2026): https://arxiv.org/abs/2603.22570
- Codigo: https://github.com/m2b3/CanViT
- Pagina del proyecto: https://m2b3.github.io/CanViT/
- Todos los checkpoints: https://huggingface.co/canvit
- Documentacion de evaluacion de deteccion: https://github.com/m2b3/CanViT/blob/main/canvit-nnx/canvit_nnx/detect/README.md
- DINOv3 (origen de la destilacion): https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
