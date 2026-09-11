# dronefreak/co-dino-5scale-lsj-swin-l-o365-lvis

## Resumen

Co-DINO (Swin-L, 5 escalas, LSJ, 16 epocas con preentrenamiento en Objects365 y ajuste fino en LVIS) es un detector de objetos basado en el esquema de entrenamiento Co-DETR ("DETRs with Collaborative Hybrid Assignments Training", ICCV 2023) desarrollado por Zhuofan Zong, Guanglu Song y Yu Liu (SenseTime X-Lab). El repositorio `dronefreak/co-dino-5scale-lsj-swin-l-o365-lvis` no es un lanzamiento oficial: es un espejo del mismo checkpoint que los autores publicaron en Google Drive, con una model card propia, el fichero de configuracion y un checksum explicito, pensado para descargas automatizadas y reproducibles.

El modelo resuelve deteccion de objetos en imagenes y video con un vocabulario largo (LVIS), empleando un backbone Swin-L, un codificador de imagenes de 5 escalas y un decodificador DINO. El checkpoint tiene 221,5 M de parametros en inferencia y el repositorio ocupa 3,0 GB. Su relevancia actual es doble: por un lado ofrece un `box AP` de 64,5 en LVIS v1 val segun los autores originales (metrica declarada como no verificada en la model index); por otro, cubre un hueco de distribucion, ya que los autores publicaron en el Hub sus checkpoints ViT-L pero no los de backbone ResNet-50 ni Swin.

El modelo esta etiquetado unicamente para ingles y su licencia figura como desconocida. Requiere el stack OpenMMLab 1.x (MMDetection 2.25.3, MMCV-full 1.5.0, PyTorch 1.11) y no funciona con `transformers` ni con pipelines de inferencia estandar tipo vLLM u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Co-DETR (Co-DINO) sobre DETR con asignacion hibrida; backbone Swin-L; codificador de imagenes de 5 escalas; decodificador DINO con matching hungaro uno-a-uno |
| Parametros totales | 221,5 M (en inferencia, segun la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del repositorio) |
| Licencia | unknown (licencia de los pesos sin determinar; el preentrenamiento con Objects365 se marca como research-only) |
| Formato de pesos | checkpoint PyTorch `.pth` (`co_dino_5scale_lsj_swin_large_16e_o365tolvis.pth`), acompanado del fichero de configuracion `.py` |
| Tarea (pipeline) | object-detection (solo cajas; el repositorio no declara mascaras) |
| Libreria / framework | mmdetection (MMDetection 2.x, MMCV-full 1.5.0, PyTorch 1.11) |
| Inferencia alojada | no (`inference: false`) |
| Tamano del repositorio | 3,0 GB |
| Dataset de evaluacion declarado | LVIS v1 val |
| Esquema de entrenamiento | 16 epocas (preentrenamiento en Objects365, ajuste fino en LVIS) |
| Resolucion / aumento | LSJ (large scale jitter) segun el nombre del checkpoint; valor concreto no disponible |

## Arquitectura y entrenamiento

Co-DETR no introduce una arquitectura nueva, sino un esquema de entrenamiento. Sobre un detector DETR (aqui, un decodificador DINO con matching hungaro uno-a-uno) se anaden cabezas auxiliares que emplean asignacion de etiquetas uno-a-muchos: una cabeza ATSS y una cabeza RoI al estilo Faster R-CNN. Las propuestas positivas generadas por esas cabezas se reutilizan para supervisar de forma mas densa el codificador, lo que acelera la convergencia y mejora la precision del decodificador DETR. El checkpoint aqui alojado usa un backbone Swin-L (Swin Transformer, arXiv:1908.03195) y un codificador de imagenes de cinco escalas, con aumento LSJ durante el entrenamiento.

El pipeline de entrenamiento declarado es de 16 epocas, con preentrenamiento en Objects365 y ajuste fino posterior en LVIS. La model card no detalla el numero de tokens ni la composicion exacta del dataset, y tampoco menciona fases de RLHF, DPO ni preferencias humanas, algo que no aplica a un detector. El repositorio incluye un video de demostracion (`assets/demo_banner.mp4`) con detecciones sobre dos clips de dashcam, generado con este mismo checkpoint mediante `tools/inference.py`.

## Capacidades

- Deteccion de objetos con cajas delimitadoras (bounding boxes) sobre imagenes, carpetas de imagenes, video y webcam, mediante `tools/inference.py`.
- Vocabulario largo de categorias correspondiente a LVIS v1, con etiquetas en ingles.
- Deteccion a cinco escalas, orientada a objetos de tamanos muy distintos, incluidos objetos pequenos y densos.
- Salida en JSON opcional (`--save-json`) para integrarla en pipelines de evaluacion o post-procesado (por ejemplo, evaluacion con las herramientas de LVIS).
- Preentrenamiento en Objects365 seguido de ajuste fino en LVIS, lo que lo hace util como inicializacion para dominios propios.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de generacion de texto; el unico idioma declarado es el ingles.
- No dispone de modo "thinking", ni vision-lenguaje, ni audio, ni segmentacion de instancias declarada.

## Casos de uso

- Analitica de video de trafico y dashcam: el video de demostracion del propio repositorio muestra detecciones sobre clips de salpicadero. El modelo puede ejecutarse fotograma a fotograma con `tools/inference.py` para inventariar vehiculos, peatones y senaletica en grabaciones, aprovechando su deteccion a cinco escalas para objectos lejanos y pequenos.
- Pre-etiquetado para construir datasets: dado su vocabulario largo de LVIS, sirve para generar anotaciones iniciales (con `--save-json`) que despues se revisan y corrigen manualmente, reduciendo el coste de anotacion antes de un ajuste fino en un dominio concreto.
- Punto de partida para ajuste fino en dominios verticales: al estar preentrenado en Objects365 y ajustado en LVIS, es un inicializador razonable para retail, logistica, agricultura o inspeccion industrial, sustituyendo la cabeza de clasificacion por las categorias del dominio.
- Investigacion en deteccion de objetos: permite reproducir el resultado declarado de 64,5 box AP en LVIS v1 val y realizar ablaciones sobre backbone, escalas y esquema de asignacion, comparando contra los checkpoints ViT-L publicados por los autores.
- Deteccion en video con post-proceso temporal: la salida JSON por fotograma se puede encadenar con un tracker externo (por ejemplo, SORT o ByteTrack) para obtener trayectorias; el modelo aporta las detecciones, no el seguimiento.
- Pipelines de evaluacion reproducibles en CI: al ser un espejo en el Hub con checksum explicito y descarga por fichero (`hf download`), encaja mejor que una carpeta compartida de Google Drive en flujos automatizados que necesitan versionado y verificacion de integridad del artefacto.
- Despliegue en entornos con GPU de gama media para inferencia por lotes no interactiva: con 221,5 M de parametros, los pesos en FP32 ocupan aproximadamente 0,9 GB, de modo que el cuello de botella sera la memoria de activaciones a alta resolucion, no el tamano del modelo.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model index del repositorio (no verificados: `"verified": false`). No se han publicado otros resultados de benchmarks en la informacion disponible.

| Modelo | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| co_dino_5scale_lsj_swin_large_16e_o365tolvis | LVIS v1 val | box AP | 64,5 | No |

No se dispone de resultados de MMLU, HumanEval, GSM8K ni de otras metricas: no aplican a un detector de objetos. Tampoco se han facilitado cifras de latencia, throughput, AP por categoria, AP de objetos pequenos o rendimiento con otros umbrales de IoU.

## Requisitos de hardware

- VRAM estimada para pesos: unos 0,9 GB en FP32 (221,5 M de parametros x 4 bytes) y unos 0,45 GB en FP16. Cifra derivada del numero de parametros declarado, no publicada por el autor.
- VRAM total: no disponible. En deteccion a cinco escalas con LSJ la memoria de activaciones domina y depende de la resolucion de entrada y del tamano de lote, datos que la model card no especifica.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano de pesos, el modelo cabe en cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090), siempre que la resolucion de inferencia y el lote se ajusten a la VRAM disponible.
- Entrenamiento o ajuste fino: no disponible. El repositorio solo documenta un script de inferencia; el modelo tiene 221,5 M de parametros y el repositorio ocupa 3,0 GB.
- Opciones de despliegue: no es compatible con vLLM, Ollama, llama.cpp ni TGI, ya que no es un modelo de lenguaje. El unico camino documentado es el proyecto Co-DETR con el stack OpenMMLab 1.x: MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11, usando `tools/setup_codetr_env.sh` para crear el entorno conda `codetr` y `tools/inference.py` para inferencia. El propio autor indica que no es un modelo de `transformers` ni de PyTorch estandar.
- Latencia y throughput: no disponibles.
- Requisito de software destacable: el AVISO de la model card indica que `inference: false`, es decir, el Hub no ofrece endpoint de inferencia alojada; hay que ejecutarlo en infraestructura propia.

## Comparativa con modelos similares

Los datos de los modelos alternativos no aparecen en la informacion proporcionada; se marcan como no disponibles. La comparativa se limita a categoria, disponibilidad y licencia.

| Modelo | Parametros | Contexto | Rendimiento (LVIS val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| co-dino-5scale-lsj-swin-l-o365-lvis (este) | 221,5 M | no aplica | box AP 64,5 (declarado, no verificado) | unknown / preentrenamiento Objects365 research-only | Espejo en Hugging Face; original en Google Drive |
| Co-DETR con backbone ViT-L (autores originales) | no disponible | no aplica | no disponible en la informacion proporcionada | no disponible | Publicado por los autores en el Hub |
| Co-DETR con backbone ResNet-50 (autores originales) | no disponible | no aplica | no disponible en la informacion proporcionada | no disponible | No publicado en el Hub; solo en Google Drive |
| Detector DINO 5 escalas con Swin-L (linea base del decodificador) | no disponible | no aplica | no disponible en la informacion proporcionada | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia sin determinar: la model card marca la licencia de los pesos como `unknown` y la model index la declara como `unknown`. No hay autorizacion explicita de uso comercial.
- Preentrenamiento con Objects365 marcado como `research-only` en la propia model card. Cualquier uso comercial hereda esa restriccion sobre la fase de preentrenamiento.
- No es un lanzamiento oficial. El autor del espejo declara no haber contribuido al metodo ni al entrenamiento y ofrece transferir o retirar el espejo a peticion de los autores originales.
- Resultado de benchmark no verificado: el `box AP` de 64,5 esta marcado con `"verified": false` en la model index, es decir, es una cifra declarada, no reproducida de forma independiente.
- Enlaces de validacion no incluidos: la model card menciona una seccion de procedencia con checksum, pero el detalle no aparece en la informacion disponible.
- Idiomas: la unica etiqueta de idioma es `en`; las categorias y anotaciones de LVIS estan en ingles. El modelo no genera texto, por lo que no tiene capacidad multilingue.
- Riesgo de alucinacion trasladado a deteccion: el modelo puede producir cajas falsas positivas, especialmente en categorias raras o poco representadas, y omitir objetos muy pequenos, ocluidos o con clases poco frecuentes. No se dispone de desglose de AP por categoria ni por tamano para cuantificarlo.
- Ausencia de segmentacion: el repositorio declara solo `object-detection`; no hay cabezas de mascara ni salidas de segmentacion de instancias.
- Dependencia fuerte del entorno: obliga a MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11 (stack OpenMMLab 1.x). No funciona con `transformers`, y migrar a OpenMMLab 3.x o a PyTorch moderno requiere trabajo adicional no documentado.
- Sin inferencia alojada (`inference: false`) ni integracion con servidores de inferencia estandar; el despliegue en produccion exige escribir el servicio alrededor de `tools/inference.py`.
- Repositorio de 3,0 GB: conviene tener en cuenta el coste de almacenamiento y de descarga en pipelines automatizados.
- Objetos de riesgo: al ser un espejo con 0 descargas y 0 likes, no hay comunidad que haya reportado fallos, sesgos o problemas de compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/co-dino-5scale-lsj-swin-l-o365-lvis
- Configuracion del checkpoint en el repositorio: https://huggingface.co/dronefreak/co-dino-5scale-lsj-swin-l-o365-lvis/blob/main/co_dino_5scale_lsj_swin_large_16e_o365tolvis.py
- Video de demostracion: https://huggingface.co/dronefreak/co-dino-5scale-lsj-swin-l-o365-lvis/resolve/main/assets/demo_banner.mp4
- Repositorio oficial de Co-DETR (SenseTime): https://github.com/Sense-X/Co-DETR
- Fork mantenido por el autor del espejo: https://github.com/dronefreak/Co-DETR
- MMDetection 2.x: https://github.com/open-mmlab/mmdetection/tree/2.x
- Paper de Co-DETR (ICCV 2023): https://arxiv.org/abs/2211.12860
- Paper de Swin Transformer: https://arxiv.org/abs/1908.03195
- Tarea de deteccion de objetos en Hugging Face: https://huggingface.co/tasks/object-detection
- Aviso sobre la busqueda web: los resultados recuperados no guardan relacion con este modelo (versan sobre el accidente de un B-52 en Elephant Mountain, Maine, en 1963) y no se incluyen como fuentes.
