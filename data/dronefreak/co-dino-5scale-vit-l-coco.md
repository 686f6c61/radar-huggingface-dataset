# dronefreak/co-dino-5scale-vit-l-coco

## Resumen

Co-DINO (5 escalas, backbone ViT-L EVA-02) es un detector de objetos basado en el esquema de entrenamiento Co-DETR ("DETRs with Collaborative Hybrid Assignments Training"), publicado en ICCV 2023 por Zhuofan Zong, Guanglu Song y Yu Liu (SenseTime X-Lab). El checkpoint concreto alojado en `dronefreak/co-dino-5scale-vit-l-coco` es un mirror no oficial del modelo original: mismos pesos, acompanados del fichero de configuracion de MMDetection que el repositorio oficial no distribuye, mas un banner de demostracion generado con este mismo checkpoint.

El modelo resuelve deteccion de objetos 2D con cajas delimitadoras sobre las 80 clases de COCO. Combina un backbone Vision Transformer Large (304 M de parametros, variante EVA-02) con un decoder DINO y cabezas auxiliares de asignacion uno-a-muchos. El total de parametros medido en inferencia es de 348,1 M, con un peso en disco de 2,9 GB.

Su relevancia actual es doble: por un lado, su box AP de 65,9 en COCO val2017 lo situa en la gama alta de los detectores basados en DETR; por otro, es un ejemplo representativo de las dificultades de reproducibilidad del ecosistema OpenMMLab 1.x, ya que requiere MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11, y no es ejecutable con `transformers`. La licencia de los pesos figura como no determinada y el preentrenamiento uso Objects365 bajo licencia solo de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Co-DETR (esquema de entrenamiento) sobre decoder DINO, 5 escalas de feature; backbone ViT-L EVA-02 |
| Parametros totales | 348,1 M medidos en inferencia (backbone ViT-L de 304 M, EVA-02) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision; no procesa secuencias de texto) |
| Tipos de cuantizacion | No disponible (el repositorio no documenta esquemas de cuantizacion) |
| Idiomas soportados | en (etiqueta del repositorio; las clases de COCO estan en ingles) |
| Licencia | unknown (no determinada); el preentrenamiento con Objects365 es research-only |
| Formato de pesos | `.pth` (checkpoint PyTorch de MMDetection/MMCV); config en `.py` |
| Tarea | object-detection |
| Libreria / framework | mmdetection 2.25.3 + MMCV-full 1.5.0 + PyTorch 1.11 |
| Tamano del repositorio | 2,9 GB |
| Inferencia en HuggingFace | No (`inference: false`) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Co-DETR no introduce una arquitectura nueva, sino un esquema de entrenamiento. Sobre el decoder DINO (asignacion uno-a-uno mediante matching hungaro) anade cabezas auxiliares que emplean asignacion uno-a-muchos: una cabeza ATSS y una cabeza RoI estilo Faster R-CNN. Las propuestas positivas que generan esas cabezas auxiliares se realimentan al decoder como consultas extra, lo que aumenta la densidad de supervision sobre las consultas del transformer y acelera la convergencia. Este checkpoint concreto emplea el backbone ViT-L de EVA-02 (304 M de parametros) con extraccion de caracteristicas en cinco escalas.

El entrenamiento sigue un esquema en dos fases: preentrenamiento sobre Objects365 y ajuste fino posterior sobre COCO. La model card indica que la licencia del preentrenamiento con Objects365 es solo para investigacion. No se documentan en la informacion disponible el numero exacto de tokens/imagenes visto, la composicion detallada del dataset ni si se aplicaron tecnicas de alineacion tipo RLHF/DPO (no aplicables a un detector). Tampoco se especifica la resolucion de entrada empleada en el ajuste final. El README original esta truncado, por lo que detalles adicionales del esquema colaborativo no estan disponibles.

## Capacidades

- Deteccion de objetos 2D con cajas delimitadoras sobre las 80 clases de COCO.
- Deteccion multi-escala: la configuracion de 5 escalas (`co_dino_5scale`) cubre objetos de tamanos muy distintos en una misma imagen.
- Extraccion de caracteristicas con backbone ViT-L EVA-02, que aporta representaciones preentrenadas de gran capacidad.
- Inferencia sobre imagen suelta, carpeta de imagenes, video y webcam mediante `tools/inference.py` del fork mantenido.
- Exportacion de resultados en JSON (`--save-json`), util para preetiquetado y evaluacion.
- No dispone de generacion de texto, razonamiento simbolico, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta flujos de agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: las etiquetas de clase provienen del vocabulario de COCO en ingles.
- No incorpora modo de pensamiento, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Analitica de trafico en video de dashcam: la demostracion incluida en el propio repositorio usa clips de salpicadero, de modo que el modelo esta validado de forma cualitativa en ese dominio; permite contar vehiculos, peatones y senales fotograma a fotograma.
- Preetiquetado de datasets de deteccion: con 65,9 box AP en COCO, el modelo puede generar cajas iniciales que anotadores humanos corrigen, reduciendo el coste de construccion de datasets propios (siempre que las clases de interes esten dentro del vocabulario COCO).
- Control de calidad industrial: deteccion de defectos o piezas fuera de posicion en cadenas de produccion, aprovechando la capacidad multi-escala para objetos pequenos.
- Vigilancia perimetral y seguridad: deteccion de intrusiones de personas o vehiculos en secuencias de camara fija, con umbrales de confianza ajustables y supresion de no maximos.
- Analitica de retail: conteo y localizacion de personas y objetos en imagenes de tienda para estudios de afluencia, con la salvedad de que no realiza identificacion de individuos.
- Percepcion para robotica movil: deteccion de obstaculos y objetos relevantes del vocabulario COCO como entrada a un modulo de planificacion, integrada mediante el script de inferencia.
- Linea base de investigacion: referencia reproducible para comparar nuevas propuestas de deteccion contra un detector de la familia Co-DETR con backbone ViT-L.
- Teledeteccion y fotografia aerea: posible uso para clases COCO presentes en escenas aereas (vehiculos, personas, embarcaciones), aunque el modelo no ha sido entrenado especificamente en ese dominio.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (campo `verified: false`).

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| COCO 2017 | val2017 | box AP | 65,9 |

No se han publicado en la informacion disponible resultados adicionales (AP50, AP75, AP small/medium/large, velocidad de inferencia ni comparativas oficiales) para este checkpoint.

## Requisitos de hardware

- Peso de los parametros (calculo derivado de 348,1 M parametros): aproximadamente 1,39 GB en fp32 y 0,70 GB en fp16. Es el unico dato estrictamente derivable de la informacion disponible.
- VRAM total estimada: no publicada. Con un backbone ViT-L y 5 escalas de feature a resoluciones tipicas de deteccion, la memoria de activaciones domina sobre el peso de los parametros; el repositorio no documenta mediciones de VRAM.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada por el autor; un detector ViT-L de este tamano suele exceder los 8 GB de VRAM de las GPU de gama media, por lo que no puede afirmarse que quepa en todas las tarjetas de consumo.
- Opciones de despliegue: el unico camino documentado es el stack OpenMMLab 1.x (MMDetection 2.25.3, MMCV-full 1.5.0, PyTorch 1.11) junto con `tools/inference.py` del fork `dronefreak/Co-DETR`. No es compatible con vLLM, TGI, Ollama ni con `transformers`. La conversion a ONNX/TensorRT mediante MMDeploy es tecnicamente posible en el ecosistema OpenMMLab, pero no esta documentada para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | box AP (COCO val2017) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Co-DINO 5-scale ViT-L (este mirror) | 348,1 M en inferencia | Imagen (resolucion no documentada) | 65,9 (reportado, sin verificar) | unknown | HuggingFace, requiere config incluida |
| `zongzhuofan/co-detr-vit-large-coco` (original del autor) | Mismos pesos | Imagen | Mismo resultado declarado | unknown | HuggingFace, solo pesos sin config |
| Otros detectores de la familia DETR / Co-DETR | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de resultados de benchmarks de terceros (DINO, Deformable DETR, RT-DETR u otros) que permitan una comparativa cuantitativa fiable, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Licencia no determinada (`license: unknown`): no existe una base clara para el uso comercial de los pesos. Antes de cualquier despliegue en produccion es imprescindible aclarar la licencia con los autores originales.
- El preentrenamiento se realizo sobre Objects365 bajo licencia solo para investigacion, lo que anade una restriccion adicional al uso comercial.
- Vocabulario cerrado de 80 clases COCO: cualquier objeto fuera de ese conjunto no sera detectado, y la taxonomia no puede ampliarse sin reentrenar.
- No es un modelo de `transformers`: requiere el stack OpenMMLab 1.x (PyTorch 1.11, MMCV-full 1.5.0), versiones antiguas y con mantenimiento limitado, lo que complica su integracion en pipelines modernos.
- La model card marca `inference: false`, por lo que no hay inferencia gestionada en HuggingFace.
- Es un mirror no oficial: el propio autor del repositorio declara que retirara o transferira el contenido si los autores originales lo solicitan. La procedencia de los pesos es la publicacion original en Google Drive.
- Sesgos de COCO: el dataset esta desbalanceado en clases y dominado por imagenes de dominio web, lo que se traduce en peor rendimiento en categorias poco frecuentes y en dominios alejados (imagen medica, satelital, industrial).
- Riesgo de falsos positivos y falsos negativos: la salida depende de umbrales de confianza y de NMS, que deben calibrarse por dominio; no hay un modo de abstenerse.
- No apto para identificacion de personas ni reconocimiento facial: solo localiza la clase "person" sin atributos de identidad.
- Tamano del repositorio de 2,9 GB, con tiempos de descarga y almacenamiento no triviales.
- El README del repositorio esta truncado en la informacion disponible, por lo que puede haber detalles del esquema colaborativo y de la resolucion de entrenamiento sin documentar aqui.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/co-dino-5scale-vit-l-coco
- Checkpoint original del autor: https://huggingface.co/zongzhuofan/co-detr-vit-large-coco
- Repositorio oficial Co-DETR (SenseTime X-Lab): https://github.com/Sense-X/Co-DETR
- Fork mantenido con entorno y script de inferencia: https://github.com/dronefreak/Co-DETR
- MMDetection 2.x: https://github.com/open-mmlab/mmdetection/tree/2.x
- Paper Co-DETR (ICCV 2023): https://arxiv.org/abs/2211.12860
- Paper EVA-02: https://arxiv.org/abs/2303.11331
- Paper del dataset COCO: https://arxiv.org/abs/1405.0312
- Dataset COCO en HuggingFace: https://huggingface.co/datasets/detection-datasets/coco
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los unicos resultados obtenidos tratan sobre la ciudad de Lucerna y no guardan relacion con la ficha).
