# dronefreak/co-dino-5scale-swin-l-o365-coco

## Resumen

Co-DINO (Swin-L, 5 escalas) es un checkpoint de deteccion de objetos basado en Co-DETR, la propuesta de "DETRs with Collaborative Hybrid Assignments Training" publicada en ICCV 2023 por Zhuofan Zong, Guanglu Song y Yu Liu (SenseTime X-Lab). No se trata de una arquitectura nueva en sentido estricto, sino de un esquema de entrenamiento que combina la asignacion uno-a-uno del decodificador DETR (variante DINO) con cabezas auxiliares de asignacion uno-a-muchos, lo que acelera la convergencia y mejora la precision final del detector.

Este repositorio concreto es un espejo no oficial alojado por el usuario `dronefreak`: contiene exactamente los mismos pesos que los autores distribuyen en Google Drive, acompanados de la configuracion de MMDetection y una model card. El modelo emplea un backbone Swin-Large, cinco escalas de caracteristicas y un preentrenamiento en Objects365 seguido de fine-tuning de 16 epocas sobre COCO 2017. El checkpoint declara 219,2 millones de parametros en inferencia y un box AP de 64,1 en COCO val2017.

Su relevancia es doble: por un lado ofrece acceso estable y direccionable por fichero a un checkpoint que de otro modo solo estaba en una carpeta compartida de Google Drive; por otro, es una referencia de alta precision dentro de la familia DETR/Co-DETR para tareas de deteccion cerrada. La licencia de los pesos no esta determinada y el preentrenamiento con Objects365 es de uso exclusivamente investigador, por lo que su adopcion en produccion comercial requiere verificacion legal previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Co-DETR (DETR con asignaciones hibridas) con cabeza DINO y backbone Swin-Large, 5 escalas |
| Parametros totales | 219,2 M (parametros en inferencia, segun la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; no se especifica resolucion de entrada en la informacion disponible) |
| Tipos de cuantizacion | no disponible (solo se distribuye checkpoint PyTorch en coma flotante para MMDetection) |
| Idiomas soportados | no es un modelo de lenguaje; las etiquetas de clase de COCO estan en ingles (tag declarado: en) |
| Licencia | unknown / no determinada para los pesos; preentrenamiento Objects365 con restriccion research-only |
| Formato de pesos | PyTorch (`.pth`) + fichero de configuracion `.py` para MMDetection 2.x |
| Framework | MMDetection 2.25.3, MMCV-full 1.5.0, PyTorch 1.11 |
| Tarea | object-detection (deteccion de cajas, conjunto cerrado de 80 clases de COCO) |
| Tamano del repositorio | 2,8 GB (incluye pesos y recursos de demostracion) |
| Inferencia | no (campo `inference: false` en la model card; requiere el codigo del proyecto Co-DETR, no `transformers`) |

## Arquitectura y entrenamiento

Co-DETR no modifica la estructura del decodificador DETR, sino que introduce cabezas auxiliares con asignacion uno-a-muchos: una cabeza ATSS y una cabeza tipo Faster R-CNN sobre RoI. Durante el entrenamiento, las propuestas positivas generadas por esas cabezas se reinyectan como supervisión adicional sobre los tokens del codificador, lo que proporciona un aprendizaje mas denso y acelera la convergencia del matching hungaro uno-a-uno del decodificador. En este checkpoint el decodificador es de tipo DINO y el extractor de caracteristicas es un Swin-Large que alimenta cinco niveles de escala a la parte de deteccion, la configuracion habitual para objetos de tamanos muy dispares.

El entrenamiento sigue el esquema de 16 epocas indicado en el nombre del checkpoint: preentrenamiento sobre Objects365 y posterior fine-tuning sobre COCO 2017. Objects365 es un corpus de deteccion a gran escala con restricciones de uso investigador, lo que condiciona la licencia efectiva del modelo resultante. No se menciona en la informacion disponible ningun uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un detector y no en un modelo generativo. La innovacion destacable es, por tanto, metodologica (el esquema colaborativo de asignaciones y su combinacion con el paradigma DETR), no un componente de inferencia especulativa ni atencion lineal.

## Capacidades

- Deteccion de objetos en conjunto cerrado sobre las 80 clases de COCO 2017, con salida de cajas delimitadoras y puntuaciones de confianza.
- Deteccion multi-escala gracias a los cinco niveles de caracteristicas del backbone Swin-Large, adecuada para objetos pequenos y grandes en la misma imagen.
- Inferencia sobre imagen suelta, carpeta de imagenes, video y webcam mediante `tools/inference.py` del fork mantenido.
- Exportacion de resultados en JSON (`--save-json`) para pipelines de evaluacion o post-procesado.
- Integracion nativa con el ecosistema OpenMMLab 1.x (MMDetection 2.25.3, MMCV-full 1.5.0), incluyendo entrenamiento, evaluacion y configuracion declarativa.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de vision.
- No dispone de capacidades multilingues ni de modo "thinking"; no procesa audio ni texto.
- No se ha publicado soporte de vocabulario abierto (open-vocabulary) ni deteccion guiada por texto en la informacion disponible.

## Casos de uso

- Analitica de trafico y video de salpicadero: el autor incluye demostraciones generadas con este checkpoint sobre clips de dashcam, y el script de inferencia acepta video y webcam, por lo que puede usarse para detectar vehiculos, peatones y senales en flujos continuos.
- Pre-etiquetado de datasets de deteccion: con 64,1 box AP en COCO val2017, las cajas generadas sirven como anotaciones iniciales que un equipo humano corrige despues, reduciendo el coste de construccion de corpus propios.
- Vigilancia y seguridad perimetral: deteccion de personas y vehiculos en camaras fijas, aprovechando la robustez multi-escala para objetos lejanos o parcialmente ocluidos.
- Inspeccion industrial y conteo en linea de produccion: deteccion de componentes o productos sobre cinta transportadora, con salida JSON para integracion en sistemas MES.
- Prototipado de percepcion para conduccion autonoma o ADAS: como referencia de deteccion 2D en etapas de investigacion, comparando su AP frente a otros detectores antes de decidir la arquitectura final.
- Robotica y manipulacion: identificacion de objetos cotidianos de las clases COCO (botellas, tazas, platos, sillas) para tareas de pick-and-place en laboratorio.
- Analisis de imagenes aereas o de satelite: deteccion de vehiculos, barcos, aviones y personas, categorias presentes en COCO, sobre imagenes de alta resolucion procesadas por teselas.
- Investigacion academica en deteccion: linea base reproducible (con checksum declarado) para comparar nuevas tecnicas de asignacion de etiquetas o de backbone bajo el mismo protocolo de evaluacion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (campo `verified: false`, no verificados de forma independiente):

| Modelo | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| co_dino_5scale_swin_large_16e_o365tococo | COCO 2017 val (val2017) | box AP | 64,1 | no |

No se han publicado en la informacion disponible otros resultados de benchmarks (mAP por umbral de IoU, AP para objetos pequenos/medianos/grandes, latencia o throughput) ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los 219,2 M de parametros, los pesos ocupan aproximadamente 0,88 GB en FP32 y 0,44 GB en FP16; sumando activaciones, FPN de cinco escalas y el decodificador DETR, una estimacion razonable se situa en el rango de 4 a 8 GB para una sola imagen en FP32 (no confirmado en la informacion disponible).
- GPU recomendadas: no especificadas por el autor. Por tamano de modelo, una GPU con 8-12 GB de VRAM es suficiente para inferencia en FP32; para entrenamiento o fine-tuning se necesitarian configuraciones multi-GPU (A100, H100) por el coste de las cinco escalas y del Swin-Large.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 3070/3080, RTX 4070/4080, RTX 4090), aunque el consumo real depende de la resolucion de entrada y del tamano de lote.
- Opciones de despliegue: exclusivamente el stack OpenMMLab 1.x (MMDetection 2.25.3, MMCV-full 1.5.0, PyTorch 1.11) mediante los scripts del proyecto Co-DETR; no hay soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector, y no se documenta exportacion a ONNX, TensorRT ni TorchScript.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion numerica fiable.

| Alternativa | Parametros | Contexto/resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Co-DETR ViT-L (checkpoints oficiales de los autores en el Hub) | no disponible | no disponible | no disponible | no disponible | publicados oficialmente en HuggingFace |
| Otros checkpoints Co-DETR no ViT (ResNet-50, Swin) | no disponible | no disponible | no disponible | no disponible | distribuidos por Google Drive |
| Este checkpoint (Swin-L, 5 escalas, O365 -> COCO) | 219,2 M | no disponible | box AP 64,1 en COCO val2017 (no verificado) | unknown / research-only por Objects365 | espejo no oficial en HuggingFace |

Como referencia cualitativa, dentro de la familia DETR los competidores directos de esta configuracion serian los detectores basados en Swin-L con decodificador DETR (DINO, Deformable DETR) y los propios checkpoints Co-DETR con backbone ViT-L; sin embargo, no hay cifras en la informacion disponible para compararlos.

## Limitaciones y advertencias

- Conjunto de clases cerrado: unicamente las 80 categorias de COCO 2017; no detecta clases fuera de ese vocabulario ni permite consultas en lenguaje natural.
- Licencia no determinada (`license: unknown`): el uso comercial de los pesos no esta autorizado de forma explicita y debe aclararse con los autores originales antes de cualquier despliegue productivo.
- Restriccion de preentrenamiento: Objects365 es un corpus de uso exclusivamente investigador, lo que arrastra incertidumbre legal al modelo derivado.
- Es un espejo no oficial: el propio autor declara no tener ninguna contribucion sobre la investigacion ni los pesos y ofrece retirarlo a peticion de los autores originales; la disponibilidad futura del repositorio no esta garantizada.
- Metrica no verificada: el box AP de 64,1 procede del autor y aparece con `verified: false`; no hay evaluacion independiente.
- Dependencia de un stack antiguo: requiere MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11, lo que complica la integracion en entornos modernos y no es compatible con la API de `transformers`.
- Riesgo de alucinacion (falsos positivos): como todo detector, puede generar cajas espurias en imagenes fuera de dominio o con oclusiones severas; se recomienda calibrar el umbral de confianza por caso de uso.
- Sin datos de sesgo: no se publica ningun analisis de sesgo por tipo de imagen, origen geografico ni condiciones de iluminacion; COCO esta sesgado hacia imagenes cotidianas en ingles y contextos occidentales.
- Resolucion de entrada no documentada: no se especifica el tamano de imagen de entrenamiento o inferencia, dato relevante para estimar VRAM y latencia.
- Sin cuantizacion ni formatos de despliegue ligeros: al no existir versiones GGUF, ONNX o TensorRT, no es apto para edge devices sin trabajo adicional de conversion.
- Sin senal de adopcion: cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/co-dino-5scale-swin-l-o365-coco
- Repositorio oficial del metodo (SenseTime X-Lab): https://github.com/Sense-X/Co-DETR
- Fork mantenido con el entorno y los scripts de inferencia: https://github.com/dronefreak/Co-DETR
- Paper de Co-DETR (ICCV 2023): https://arxiv.org/abs/2211.12860
- Paper del dataset COCO (arXiv:1405.0312): https://arxiv.org/abs/1405.0312
- MMDetection 2.x: https://github.com/open-mmlab/mmdetection/tree/2.x
- Dataset COCO en el Hub: https://huggingface.co/datasets/detection-datasets/coco
- La busqueda web realizada no devolvio resultados relevantes para este modelo (unicamente paginas de seguimiento de envios de FedEx, sin relacion con el contenido).
