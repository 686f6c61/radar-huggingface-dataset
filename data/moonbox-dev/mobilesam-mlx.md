# moonbox-dev/MobileSAM-MLX

## Resumen

MobileSAM-MLX es una conversión a formato MLX de MobileSAM v2, el modelo de segmentación de imágenes ligeras derivado de Segment Anything (SAM). Lo publica el usuario moonbox-dev en Hugging Face y está pensado específicamente para ejecutarse en Apple Silicon mediante el framework MLX de Apple. El modelo resuelve la tarea de segmentación guiada por indicaciones (un punto o una caja delimitadora) sobre imágenes, devolviendo máscaras binarias con sus puntuaciones de confianza.

La relevancia de esta ficha está en que se trata de un port nativo para Mac, no de un modelo nuevo: el repositorio contiene únicamente la mitad de segmentación por punto y caja de MobileSAM v2 (el codificador de imagen TinyViT-5M junto con el codificador de indicaciones y el decodificador de máscaras de SAM), reempaquetado en safetensors y con un módulo `mlx_model.py` que replica la interfaz de `SamPredictor`. El tamaño del repo es de 0,1 GB y el modelo ronda los 10 millones de parámetros.

Al ser un modelo de visión, no maneja contexto de texto ni generación de lenguaje: las filas de la tabla de especificaciones relativas a tokens, idiomas o cuantización de pesos LLM deben interpretarse en el contexto de un modelo de segmentación de imágenes. La licencia es Apache 2.0 y la librería declarada es `mlx`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyViT-5M (codificador de imagen) + codificador de indicaciones y decodificador de máscaras de SAM |
| Parametros totales | ~10 M (indicado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | bf16, fp16, 8bit, 6bit, 4bit (cuantización afín de MLX, group size 64) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `config.json` y `mlx_model.py` por carpeta de precisión |
| Tarea (pipeline) | mask-generation |
| Entrada | imagen RGB + puntos o caja delimitadora |
| Salida | máscaras, puntuaciones, máscaras de baja resolución y logits |
| Revision original | MobileSAM v2 en `f706ad9c4e` |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la de MobileSAM v2: un codificador de imagen TinyViT de unos 5 millones de parámetros que sustituye al ViT pesado de SAM, acoplado al codificador de indicaciones y al decodificador de máscaras originales de SAM. El resultado es un pipeline de segmentación promptable (punto o caja) con un coste computacional muy reducido. Esta conversión no reentrena nada: carga los pesos originales en MLX y los almacena en bf16 o fp16, o los cuantiza con la cuantización afín de MLX en 8, 6 o 4 bits con group size 64. Las capas que MLX no puede cuantizar, como convoluciones y normalizaciones, se mantienen en bf16.

La model card detalla el proceso de verificación: cada build se comparó contra el modelo original en PyTorch fp32 sobre 8 fotografías, con un prompt de punto (3 máscaras) y uno de caja por imagen, calculando el IoU de cada una de las 32 máscaras frente a las de PyTorch. El criterio de aceptación era IoU >= 0,95 en todas las máscaras. No se documentan datos de entrenamiento propios ni ajuste fino adicional, ya que se trata de una conversión de pesos. Tampoco se incluyen el muestreador de indicaciones orientado a objetos de MobileSAM v2 (un YOLOv8 de ultralytics, AGPL-3.0) ni su decodificador guiado por indicaciones.

## Capacidades

- Segmentación de imágenes guiada por un punto: devuelve hasta tres máscaras candidatas con sus puntuaciones para un píxel indicado.
- Segmentación guiada por caja delimitadora: devuelve una máscara para la región indicada.
- Cálculo de embeddings de imagen una sola vez por imagen (`embed`) y reutilización para múltiples indicaciones (`predict`).
- Salida multimáscara opcional (`multimask=True`) para desambiguar objetos solapados.
- Ejecución nativa en Apple Silicon mediante MLX, con dependencias mínimas: `mlx`, `numpy` y `pillow`.
- No incluye generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües.
- No incluye el modo "segmentar todo" de forma autónoma: requiere que un detector externo aporte las cajas.

## Casos de uso

- Edición fotográfica asistida en Mac: el usuario hace clic en un objeto y el modelo devuelve la máscara para recortarlo o reemplazar el fondo; el coste de ~65 ms por imagen (codificador más dos indicaciones en un Apple M5) permite interacción casi en tiempo real.
- Herramientas de anotación de datasets: integrado en una aplicación de etiquetado sobre Apple Silicon, acelera el dibujado de máscaras a partir de un punto o una caja por objeto, reduciendo el trabajo manual en pipelines de visión por computador.
- Preprocesado en flujos de segmentación en cascada: se alimenta `predict` con cajas generadas por un detector (por ejemplo, un YOLO) para obtener máscaras de instancia, sustituyendo al muestreador de indicaciones que no se incluye en este repositorio.
- Segmentación interactiva en aplicaciones de escritorio macOS: al ser un port MLX con solo tres dependencias, se puede empaquetar en apps nativas sin depender de PyTorch ni de CUDA.
- Prototipado e investigación en entornos sin GPU NVIDIA: permite reproducir experimentos de SAM en un portátil Mac con un modelo de ~10 M de parámetros y pesos de menos de 20 MB.
- Automatización de recorte de producto en catálogos: con una caja por imagen se obtiene la máscara del artículo para generar fondos transparentes de forma por lotes.
- Evaluación comparativa de cuantizaciones: los distintos builds (fp16, bf16, 8bit, 6bit, 4bit) con sus métricas de IoU permiten medir el compromiso precisión/tamaño en MLX antes de desplegar en producción.

## Benchmarks y rendimiento

La model card no publica benchmarks estándar (MMLU, HumanEval, etc.), pero sí una verificación de fidelidad frente al original en PyTorch fp32 sobre 8 fotografías, con un punto y una caja por imagen (32 máscaras en total):

| Precision | Tamano | Mask IoU medio / peor | Estado |
|---|---|---|---|
| fp16 | 19,7 MB | 0,999 / 0,988 | pasa |
| bf16 | 19,7 MB | 0,996 / 0,972 | pasa |
| 8bit | 12,7 MB | 0,989 / 0,899 | por debajo del umbral, experimental |
| 6bit | 10,9 MB | 0,989 / 0,914 | por debajo del umbral, experimental |
| 4bit | 9,0 MB | 0,922 / 0,012 | por debajo del umbral, experimental; algunas indicaciones dan una máscara errónea |

Latencia declarada: unos 65 ms por imagen (codificador más dos indicaciones) en un Apple M5. No se han publicado resultados de benchmarks en la informacion disponible más allá de esta verificación.

## Requisitos de hardware

- VRAM: no aplica en el sentido de GPU dedicada; el modelo ocupa entre 9,0 MB (4bit) y 19,7 MB (fp16/bf16) en memoria unificada.
- Hardware objetivo: Apple Silicon (se cita un Apple M5 para la medición de latencia); requiere el framework MLX.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por esta build, que depende de MLX y no de CUDA.
- Cabe holgadamente en cualquier Mac con Apple Silicon, incluidos equipos de gama baja, dado el tamaño del modelo.
- Despliegue: mediante el propio `mlx_model.py` incluido (solo `mlx`, `numpy` y `pillow`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: ~65 ms por imagen (codificador más dos indicaciones) en Apple M5 según la model card; no se publica throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MobileSAM-MLX (esta ficha) | ~10 M | TinyViT + SAM, port MLX | Apache 2.0 | Hugging Face, solo Apple Silicon | Sin muestreador de indicaciones ni decodificador guiado |
| MobileSAM v2 original | ~10 M | TinyViT + SAM, PyTorch | Apache 2.0 (repo); componentes YOLOv8 bajo AGPL-3.0 | GitHub | Incluye muestreador de indicaciones y decodificador guiado |
| SAM (Meta) | ~600 M (ViT-H) | ViT + prompt encoder/decoder | Apache 2.0 | GitHub, Hugging Face | Mucho más pesado; mayor calidad general |
| SAM 2 | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo cubre la segmentación por punto y caja; no incluye el muestreador de indicaciones orientado a objetos (YOLOv8, AGPL-3.0) ni el decodificador guiado por indicaciones, por lo que "segmentar todo" requiere un detector externo.
- Las builds de 8bit, 6bit y 4bit están marcadas como experimentales y por debajo del umbral de IoU 0,95; la de 4bit llega a un IoU peor de 0,012 en algunas indicaciones, es decir, máscaras erróneas.
- La verificación se hizo sobre solo 8 fotografías y 32 máscaras, una muestra reducida que no garantiza el comportamiento en dominios muy distintos.
- No se documentan sesgos específicos, pero al derivar de SAM y MobileSAM hereda las limitaciones de generalización de estos en escenas ambiguas, objetos pequeños o imágenes de baja calidad.
- Riesgo de máscaras incorrectas en objetos solapados o con límites poco definidos, especialmente en las cuantizaciones agresivas.
- Licencia Apache 2.0 para estos archivos; conviene revisar la licencia de los componentes originales y de cualquier detector externo que se acople (el YOLOv8 de ultralytics es AGPL-3.0).
- Dependencia de MLX y de hardware Apple Silicon: no es desplegable en CUDA sin reconversión.
- No procesa texto ni idiomas; las filas de idiomas y contexto de la tabla no aplican.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonbox-dev/MobileSAM-MLX
- Repositorio original MobileSAM v2: https://github.com/ChaoningZhang/MobileSAM
- Paper MobileSAM (arXiv:2306.14289): https://arxiv.org/abs/2306.14289
- Paper SAM (arXiv:2304.02643): https://arxiv.org/abs/2304.02643
- Paper MobileSAM v2 (arXiv:2312.09579): https://arxiv.org/abs/2312.09579
- Framework MLX de Apple: https://github.com/ml-explore/mlx
