# LibreYOLO/LibreTRELLIS2-4b

## Resumen

LibreTRELLIS2-4b es un espejo (mirror) del modelo de generación 3D a partir de una imagen TRELLIS.2-4B de Microsoft, reempaquetado por LibreYOLO para su uso dentro de la librería homónima. No se trata de un modelo nuevo ni reentrenado: todos los pesos bajo `ckpts/` y el fichero `pipeline.json` son idénticos byte a byte a los del repositorio original `microsoft/TRELLIS.2-4B` (revisión `af44b45f2e35a493886929c6d786e563ec68364d`), y conservan la disposición de ficheros de origen. El objetivo del reempaquetado es permitir la ejecución en PyTorch estándar, sin dependencias de FlexGEMM, flash-attn ni o-voxel, de modo que el modelo funciona en GPU NVIDIA, en Apple Silicon (MPS) y en CPU.

El modelo resuelve la tarea de image-to-3D: recibe una fotografía de un objeto y devuelve su forma como malla triangular (por ejemplo, un fichero OBJ). El pipeline declarado en Hugging Face es `image-to-3d` y la librería asociada es `libreyolo`. El repositorio ocupa 8,7 GB e incluye cuatro redes de geometría: un transformer de flujo de estructura dispersa y tres transformers de flujo de latentes de forma (uno a resolución 512 y otro compartido para 1024 y 1536), además de un decodificador de forma con rejilla dual flexible. El nombre "4b" y los nombres de fichero (`..._1_3B_...`) apuntan a una arquitectura de aproximadamente 1,3 mil millones de parámetros por red, si bien el dato exacto de parámetros totales no se detalla en la información disponible.

Es relevante ahora porque democratiza el acceso al estado del arte en reconstrucción 3D monocular dentro de un ecosistema con licencia MIT y sin ataduras a kernels CUDA propietarios o poco portables. La licencia MIT de los pesos (tal como la publica Microsoft) facilita su integración en productos comerciales, aunque el codificador de imagen DINOv3 ViT-L/16 que consume la entrada no es MIT y está sujeto a la licencia de Meta. El modelo se publicó el 6 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni "likes".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers de flujo (flow matching) sobre latentes estructurados: sparse-structure flow transformer + shape-latent flow transformers + decodificador de forma de rejilla dual |
| Parametros totales | no disponible (los ficheros indican ~1,3B por red; el total agregado no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo image-to-3D, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en bf16 y fp16 según nombres de fichero) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT (pesos de Microsoft); el codificador DINOv3 ViT-L/16 tiene licencia propia de Meta |
| Formato de pesos | safetensors/bin según layout upstream en `ckpts/` (no confirmado en detalle); pipeline en `pipeline.json` |

## Arquitectura y entrenamiento

El modelo sigue la estela de TRELLIS y emplea una arquitectura de generación 3D basada en flow matching sobre representaciones latentes estructuradas y compactas ("Native and Compact Structured Latents for 3D Generation", arXiv:2512.14692). El pipeline encadena varias redes: primero un transformer de flujo de estructura dispersa (`ss_flow_img_dit_1_3B_64_bf16`) que predice la estructura geométrica; después transformers de flujo de latentes de forma (`slat_flow_img2shape_dit_1_3B_512_bf16` para resolución 512 y `slat_flow_img2shape_dit_1_3B_1024_bf16` para 1024 y 1536); y finalmente un decodificador de forma con rejilla dual flexible (`shape_dec_next_dc_f16c32_fp16`) que convierte los latentes en una malla triangular. La entrada de imagen se procesa mediante un codificador DINOv3 ViT-L/16.

No se ha reentrenado ni convertido nada: los pesos son los de Microsoft y conservan su diseño original. El reempaquetado de LibreYOLO sustituye las dependencias de kernels especializados (FlexGEMM, flash-attn, o-voxel) por operaciones en PyTorch puro, lo que habilita la ejecución en MPS y CPU a costa, presumiblemente, de rendimiento frente a la versión original con kernels optimizados. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO; tampoco se documentan innovaciones adicionales más allá de los latentes estructurados y el decodificador de rejilla dual.

## Capacidades

- Generación de malla 3D a partir de una única imagen de un objeto (image-to-3D), con salida en formato de malla triangular (por ejemplo, OBJ).
- Predicción de estructura geométrica dispersa y de latentes de forma a múltiples resoluciones (512, 1024 y 1536).
- Ejecución multiplataforma: GPU NVIDIA, Apple Silicon (MPS) y CPU, gracias a la implementación en PyTorch puro sin kernels especializados.
- Integración con la API de LibreYOLO (`LibreGen("trellis2")`) y con la CLI (`libreyolo generate source=... model=trellis2`).
- Eliminación de fondo de la imagen de entrada mediante los pesos BiRefNet cargados desde `LibreYOLO/LibreTRELLISl`.
- No incluye las redes de textura ni los codificadores de forma y textura del modelo original: la salida es únicamente geometría (forma), no malla texturizada.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Digitalización de productos para comercio electrónico: a partir de una foto de catálogo se genera la malla del producto para visores 3D o configuradores web; la licencia MIT y la ejecución en CPU facilitan el despliegue en servidores sin GPU.
- Prototipado rápido en diseño industrial: convertir bocetos o fotos de maquetas en mallas triangulares para imprimir en 3D o importar en un CAD, usando la resolución 1024/1536 cuando se requiere más detalle.
- Creación de activos para videojuegos y realidad aumentada: generar la geometría base de props y objetos del entorno para su posterior retopología y texturizado en el motor.
- Reconstrucción en escenarios con hardware limitado: al funcionar en Apple Silicon y CPU, permite generar mallas en portátiles o estaciones de trabajo sin GPU NVIDIA dedicada.
- Investigación en visión 3D: servir como línea base reproducible y con licencia permisiva para comparar métodos de image-to-3D o para experimentar con los latentes estructurados.
- Integración en pipelines de automatización con la CLI de LibreYOLO: procesar lotes de imágenes y guardar mallas OBJ dentro de flujos de CI/CD o scripts de postprocesado.
- Educación y demos interactivas: aplicaciones que convierten una foto del usuario en un modelo 3D en tiempo casi real sobre MPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 8,7 GB y los pesos se distribuyen en bf16/fp16, por lo que se requiere espacio suficiente para cargar las cuatro redes (orientativamente en el rango de 8-16 GB según qué redes se carguen simultáneamente; dato no confirmado).
- GPU recomendadas: no especificadas por el autor; al ejecutarse en PyTorch puro, es compatible con GPUs NVIDIA (CUDA), Apple Silicon (MPS) y CPU.
- Cabe en GPU de consumo: probable en GPUs con 12-16 GB o más de VRAM, aunque no hay cifras oficiales; en CPU y MPS funciona pero con latencia mayor.
- Opciones de despliegue: librería `libreyolo` (API `LibreGen` y CLI `libreyolo generate`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo image-to-3D).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Resoluciones | Licencia | Ejecucion |
|---|---|---|---|---|---|
| LibreTRELLIS2-4b (este) | Mirror de TRELLIS.2-4B, solo geometria | ~1,3B por red (total no disponible) | 512, 1024, 1536 | MIT (pesos); DINOv3 aparte | PyTorch puro: CUDA, MPS, CPU |
| microsoft/TRELLIS.2-4B | Modelo original, geometria y textura | ~1,3B por red (total no disponible) | 512, 1024, 1536 | MIT | Requiere FlexGEMM, flash-attn, o-voxel (CUDA) |
| TRELLIS (version previa) | Generacion 3D con latentes estructurados | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo original y a su predecesor TRELLIS, ya que la información disponible no incluye otros modelos image-to-3D con datos verificables. La diferencia clave frente a `microsoft/TRELLIS.2-4B` es la portabilidad (sin kernels especializados) y la omisión de las redes de textura; el resto de pesos es idéntico.

## Limitaciones y advertencias

- Solo genera geometría: no incluye las redes de textura ni los codificadores de forma y textura del modelo original, por lo que la malla resultante no lleva textura.
- No es un modelo nuevo ni reentrenado; cualquier limitación del TRELLIS.2-4B original se hereda íntegramente.
- El codificador de entrada DINOv3 ViT-L/16 no es MIT y está sujeto a la licencia de Meta; su uso comercial debe revisarse por separado.
- La ejecución en PyTorch puro (sin FlexGEMM/flash-attn) puede implicar menor rendimiento que la versión original con kernels optimizados; no hay cifras publicadas.
- Riesgo de alucinación geométrica: como modelo generativo, puede producir formas plausibles pero incorrectas en objetos ambiguos, ocluidos o poco comunes.
- Sin datos publicados sobre sesgos del dataset de entrenamiento ni sobre su comportamiento en categorías de objeto concretas.
- No soporta texto, diálogo ni instrucciones en lenguaje natural; la interfaz es exclusivamente imagen a malla.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: ecosistema y validación comunitaria aún incipientes.
- Para producción, conviene verificar la integridad de los pesos mediante los SHA-256 listados en `NOTICE` y fijar la revisión upstream.

## Enlaces

- Hugging Face (este mirror): https://huggingface.co/LibreYOLO/LibreTRELLIS2-4b
- Repositorio upstream en Hugging Face: https://huggingface.co/microsoft/TRELLIS.2-4B
- Codigo upstream en GitHub: https://github.com/microsoft/TRELLIS.2
- Paper: https://arxiv.org/abs/2512.14692
- Repositorio de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Documentacion de LibreYOLO: https://www.libreyolo.com/docs
- Mirror del decodificador de estructura dispersa y BiRefNet: https://huggingface.co/LibreYOLO/LibreTRELLISl
- Mirror del codificador DINOv3 ViT-L/16: https://huggingface.co/LibreYOLO/LibreDINOv3vitl16
