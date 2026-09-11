# dronefreak/co-dino-5scale-lsj-vit-l-lvis-instance

# Co-dino 5scale lsj vit-l lvis instance (dronefreak)

## Resumen

Co-DINO 5scale LSJ ViT-L LVIS Instance es un detector de objetos con segmentacion de instancias basado en Co-DETR, la arquitectura presentada en ICCV 2023 por Zhuofan Zong, Guanglu Song y Yu Liu (SenseTime X-Lab, paper arXiv:2211.12860). Combina un backbone Vision Transformer ViT-L de la familia EVA-02 (304 M de parametros) con un decodificador DINO y un esquema de asignacion colaborativa de etiquetas, lo que da un total de 355,3 M de parametros en inferencia. El checkpoint esta entrenado en dos fases: preentrenamiento en Objects365 y ajuste fino en LVIS v1 con aumento Large Scale Jitter (LSJ).

El modelo resuelve deteccion de objetos y segmentacion de instancias sobre las 1203 categorias de LVIS v1, un conjunto con vocabulario mucho mas amplio y con distribucion de clases de cola larga respecto a COCO. El autor declara un box AP de 67,3 y un mask AP de 60,7 en LVIS v1 val. Su relevancia practica esta en tareas de preetiquetado y percepcion con vocabulario amplio, aunque no es un modelo de lenguaje: no genera texto ni acepta prompts en lenguaje natural.

Se trata de un espejo (mirror) no oficial publicado por el usuario `dronefreak`. El checkpoint es el mismo que los autores publicaron originalmente, pero este repositorio anade el fichero de configuracion correspondiente y un script de inferencia, ya que el repositorio original distribuye unicamente el fichero de pesos sin configuracion ejecutable. La licencia de los pesos esta sin determinar y el preentrenamiento con Objects365 es de uso exclusivamente investigador, lo que limita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Co-DINO (Co-DETR con decodificador DINO) sobre backbone ViT-L EVA-02, 5 escalas de features |
| Parametros totales | 355,3 M en inferencia (304 M corresponden al backbone ViT-L EVA-02) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye el checkpoint en punto flotante) |
| Idiomas soportados | en (el modelo no procesa lenguaje natural; el tag "en" refleja el idioma de las etiquetas de las categorias de LVIS) |
| Licencia | desconocida / sin determinar para los pesos; preentrenamiento con Objects365 bajo licencia research-only |
| Formato de pesos | `.pth` (checkpoint PyTorch) acompanado de un fichero `.py` de configuracion MMDetection |
| Tamano del repositorio | 1,6 GB |
| Framework | MMDetection 2.25.3 + MMCV-full 1.5.0 + PyTorch 1.11 |
| Pipeline declarado en el Hub | image-segmentation (tambien object-detection) |
| Dataset de evaluacion | LVIS v1 val |
| Resolucion de entrada | no disponible (el esquema de entrenamiento usa Large Scale Jitter) |
| Fecha de creacion del repositorio | 2026-09-11 |

## Arquitectura y entrenamiento

Co-DETR parte de la idea de enriquecer la supervision del codificador de un detector DETR anadiendo cabeceras auxiliares entrenadas con asignacion de etiquetas uno-a-muchos (estilo ATSS o Faster R-CNN). Esas cabeceras solo se usan durante el entrenamiento y se descartan en inferencia, de modo que el detector final mantiene el coste de un DETR puro pero se beneficia de una representacion del codificador mucho mas informativa. La variante Co-DINO sustituye el decodificador por el de DINO, y este checkpoint concreto emplea un backbone ViT-L de EVA-02 con extraccion de caracteristicas a cinco escalas, lo que mejora la deteccion de objetos de tamanos muy dispares.

El entrenamiento sigue un calendario en dos etapas: preentrenamiento sobre Objects365 (un conjunto de deteccion a gran escala, arXiv:1908.03195) y ajuste fino posterior sobre LVIS v1 con aumento Large Scale Jitter. El backbone EVA-02 procede de arXiv:2303.11331. La model card no detalla el numero exacto de tokens, la composicion completa del dataset ni si se aplicaron tecnicas de refinamiento posteriores como RLHF o DPO, por lo que esos datos figuran como no disponibles. El checkpoint se evalua exclusivamente como detector/segmentador; no hay decodificacion especulativa ni mecanismos de atencion lineal en el sentido de los modelos de lenguaje.

## Capacidades

- Deteccion de objetos con cajas delimitadoras sobre las 1203 categorias de LVIS v1, incluidas clases poco frecuentes (cola larga).
- Segmentacion de instancias: genera mascaras por objeto ademas de las cajas, con un mask AP declarado de 60,7 en LVIS v1 val.
- Deteccion a cinco escalas de caracteristicas, pensada para escenas con objetos de tamanos muy distintos.
- Inferencia sobre imagen suelta, carpeta de imagenes, video y webcam mediante `tools/inference.py` del fork mantenido.
- Exportacion de resultados en JSON (`--save-json`), apta para pipelines de anotacion o evaluacion.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes, razonamiento multi-paso ni modos de "pensamiento".
- No tiene capacidades multilingues ni generacion de texto; las etiquetas de salida son las categorias en ingles de LVIS.
- No dispone de capacidades de vision-lenguaje (no responde a prompts textuales ni genera descripciones).

## Casos de uso

- Preetiquetado de datasets de deteccion y segmentacion: dado su box AP de 67,3 y mask AP de 60,7 en LVIS, sirve para generar anotaciones iniciales sobre vocabularios amplios y reducir el trabajo manual de revisión posterior.
- Analisis de escenas viarias y dashcam: el propio autor incluye un banner de demostracion generado con clips de salpicadero, por lo que encaja en tareas de deteccion de vehiculos, peatones y senalizacion en video.
- Inventario y analitica en retail: LVIS cubre cientos de categorias de productos y objetos cotidianos, lo que permite contar y localizar articulos en estanterias a partir de imagenes de camara fija.
- Video vigilancia y control de accesos: el script de inferencia acepta flujo de webcam y video, de modo que se puede desplegar como modulo de percepcion con salida en JSON para un sistema de alertas.
- Percepcion en robotica: la combinacion de cajas y mascaras por instancia es util para grasping y planificacion de manipulacion cuando el robot necesita la silueta exacta del objeto.
- Indexacion y busqueda visual de archivos multimedia: el etiquetado automatico con 1203 categorias permite construir indices de contenido sobre fototecas o catalogos de video.
- Investigacion en deteccion: sirve como referencia reproducible para comparar estrategias de asignacion de etiquetas, backbones ViT y preentrenamiento a gran escala, ya que el repositorio incluye la configuracion exacta.

## Benchmarks y rendimiento

Resultados declarados por los autores originales del modelo y recogidos en el `model-index` y la cabecera de la model card. No han sido verificados de forma independiente por el autor del espejo.

| Dataset | Split | Metrica | Valor | Verificado |
|---|---|---|---|---|
| LVIS v1 | val | box AP | 67,3 | no (`verified: false`) |
| LVIS v1 | val | mask AP | 60,7 | no (reportado por los autores) |

No se han publicado en la informacion disponible resultados de este checkpoint en COCO, Objects365 val u otros benchmarks, ni medidas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para los pesos (calculo propio a partir de 355,3 M de parametros): aproximadamente 1,4 GB en fp32 y 0,7 GB en fp16/bf16. A esa cifra hay que sumar activaciones y mapas de caracteristicas de un ViT-L a resolucion alta, por lo que en la practica la inferencia en fp16 suele requerir del orden de 4 a 8 GB, en funcion de la resolucion de entrada y del tamano de lote. La model card menciona una seccion de "measured inference footprint" de la que no se proporcionan valores.
- GPU de centro de datos: A100, H100, L40S o V100 son adecuadas; el checkpoint original se entreno en hardware de SenseTime.
- GPU de consumo: cabe en tarjetas con 8-12 GB o mas, como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090, en fp16 y lote 1.
- Opciones de despliegue: no es compatible con vLLM, Ollama, TGI ni llama.cpp, ya que no es un modelo de lenguaje. El unico flujo documentado es MMDetection 2.25.3 + MMCV-full 1.5.0 + PyTorch 1.11 con el script `tools/inference.py` del fork `dronefreak/Co-DETR`. La exportacion a ONNX o TensorRT no esta documentada.
- Entorno: el fork incluye `tools/setup_codetr_env.sh`, que crea un entorno conda llamado `codetr` con la pila OpenMMLab 1.x validada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Categorias | Box AP (LVIS v1 val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (espejo de `dronefreak`) | Co-DINO, ViT-L EVA-02, 5 escalas, LSJ | 355,3 M | 1203 (LVIS v1) | 67,3 (reportado) | desconocida; preentrenamiento Objects365 research-only | HuggingFace, espejo no oficial |
| `zongzhuofan/co-detr-vit-large-lvis-instance` | mismo checkpoint publicado por los autores originales | 355,3 M | 1203 (LVIS v1) | 67,3 (reportado) | no disponible | HuggingFace, repositorio oficial de los autores; sin fichero de configuracion |
| Otras variantes de Co-DETR (por ejemplo con backbone Swin-L) | Co-DETR | no disponible | 1203 (LVIS v1) | no disponible | no disponible | repositorio oficial Co-DETR |
| Detectores DETR/DINO de referencia sobre LVIS | DETR / DINO | no disponible | 1203 (LVIS v1) | no disponible | no disponible | no disponible |

La unica comparacion con datos concretos disponibles en la informacion proporcionada es con el repositorio oficial de los autores, que contiene exactamente los mismos pesos pero sin el fichero de configuracion, sin banner de demostracion y sin el formato de tarjeta homogeneo del resto de checkpoints del espejo.

## Limitaciones y advertencias

- Licencia sin determinar: la propia model card marca la licencia de los pesos como "undetermined", por lo que no hay autorizacion explicita de uso comercial. Hay que contactar con los autores originales antes de cualquier despliegue en produccion.
- Preentrenamiento con Objects365 bajo licencia research-only, lo que anade una restriccion adicional al uso comercial incluso si la licencia de los pesos se aclarase.
- Es un espejo no oficial: el autor del repositorio no reclama ninguna contribucion a la investigacion ni al entrenamiento, y se compromete a retirar el espejo a peticion de los autores originales. La procedencia a largo plazo no esta garantizada.
- Vocabulario cerrado: detecta unicamente las 1203 categorias de LVIS v1. No es un detector de vocabulario abierto ni acepta categorias definidas por el usuario en tiempo de inferencia.
- Riesgo de falsos positivos y duplicados: como cualquier detector DETR, puede generar cajas redundantes o clases incorrectas en objetos ambiguos o muy ocluidos. No debe usarse sin umbral de confianza y revision en contextos criticos.
- Etiquetas en ingles: las categorias de salida estan en ingles; no hay soporte multilingue ni traduccion integrada.
- Traduccion literal de la idea de "alucinacion": el modelo no genera texto, pero si puede producir detecciones inexistentes en imagenes con texturas o patrones que se parezcan a clases de entrenamiento.
- Pila de software anticuada: requiere PyTorch 1.11, MMDetection 2.25.3 y MMCV-full 1.5.0, versiones dificiles de instalar en entornos modernos y sin soporte activo.
- `inference: false` en los metadatos del Hub: no se puede cargar directamente con la Inference API ni con `transformers`; hace falta el codigo del proyecto Co-DETR.
- Sin datos de latencia ni de consumo energetico publicados, lo que complica la planificacion de capacidad en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/co-dino-5scale-lsj-vit-l-lvis-instance
- Checkpoint original de los autores: https://huggingface.co/zongzhuofan/co-detr-vit-large-lvis-instance
- Fichero de configuracion incluido en el espejo: https://huggingface.co/dronefreak/co-dino-5scale-lsj-vit-l-lvis-instance/blob/main/co_dino_5scale_lsj_vit_large_lvis_instance.py
- Paper de Co-DETR (ICCV 2023): https://arxiv.org/abs/2211.12860
- Paper de Objects365: https://arxiv.org/abs/1908.03195
- Paper de EVA-02: https://arxiv.org/abs/2303.11331
- Repositorio oficial: https://github.com/Sense-X/Co-DETR
- Fork mantenido con entorno y script de inferencia: https://github.com/dronefreak/Co-DETR
- Documentacion de la tarea de deteccion de objetos en el Hub: https://huggingface.co/tasks/object-detection

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos trataban sobre fibra optica y no guardan relacion con el contenido de esta ficha.
