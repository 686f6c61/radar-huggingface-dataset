# dronefreak/co-dino-5scale-lsj-swin-l-1x-coco

## Resumen

Co-DINO 5scale LSJ Swin-L 1x COCO es un checkpoint de deteccion de objetos basado en la familia Co-DETR ("DETRs with Collaborative Hybrid Assignments Training"), publicada en ICCV 2023 por Zhuofan Zong, Guanglu Song y Yu Liu (SenseTime X-Lab). Este repositorio concreto es un espejo no oficial alojado por el usuario dronefreak: no aporta pesos nuevos, sino que replica el mismo checkpoint que los autores distribuyen via Google Drive, anadiendo una model card, el fichero de configuracion y acceso versionado en el Hub. El modelo combina un backbone Swin-Large con un decodificador DINO y un esquema de asignacion colaborativa que acelera la convergencia del entrenamiento.

La relevancia practica es doble. Por un lado, ofrece un detector de alta precision (59,3 box AP en COCO val2017 segun los autores) con backbone Swin-L y esquema de aumento LSJ (Large Scale Jittering) a 5 escalas de feature map. Por otro, resuelve un problema de reproducibilidad: los checkpoints no-ViT de Co-DETR solo estaban en una carpeta compartida de Google Drive sin direccionamiento por fichero ni checksums, lo que complicaba pipelines automatizados. Este espejo proporciona descarga estable via `huggingface_hub`.

El modelo no es un transformer generativo ni un LLM: es un detector de objetos puro, pensado para inferencia con el stack OpenMMLab (MMDetection 2.x, MMCV-full 1.x, PyTorch 1.11) y el codigo del proyecto Co-DETR. Su licencia esta sin determinar, lo que condiciona cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Co-DETR (DINO decoder + asignacion colaborativa one-to-many) con backbone Swin-Large, 5 escalas |
| Parametros totales | 235.969.427 (safetensors); 219,2 M en inferencia segun el autor |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas COCO en ingles) |
| Licencia | unknown (sin determinar) |
| Formato de pesos | safetensors en el repo; checkpoint `.pth` para MMDetection; config `.py` |
| Framework | mmdetection 2.25.3, mmcv-full 1.5.0, PyTorch 1.11 |
| Dataset de entrenamiento | COCO (detection-datasets/coco) |
| Schedule | 1x (12 epochs) |
| Resolucion / aumentos | LSJ (Large Scale Jittering), 5 escalas |
| Tamano del repo | 3,8 GB |

## Arquitectura y entrenamiento

Co-DETR no propone una arquitectura nueva, sino un esquema de entrenamiento. Junto al decodificador DETR, que usa matching hungaro one-to-one, se anaden cabezas auxiliares con asignacion one-to-many: una cabeza ATSS y una cabeza estilo Faster R-CNN con RoI. Las propuestas positivas generadas por esas cabezas se reinyectan en el decodificador como queries adicionales, lo que hace mas discriminativas las features del encoder y acelera la convergencia. En esta variante concreta, el decodificador es DINO (con consultas desnoising y seleccion de queries de alta calidad) y el backbone es Swin-Large.

El checkpoint se entrena sobre COCO con schedule 1x (12 epochs) y aumentos LSJ a 5 escalas. Las cabezas auxiliares se usan solo durante el entrenamiento: la configuracion fija `eval_module='detr'`, de modo que en inferencia unicamente opera el decodificador, lo que explica la diferencia entre los 236 M de parametros del fichero y los 219,2 M medidos en inferencia. No se dispone de informacion sobre composicion exacta del dataset mas alla de COCO, ni sobre uso de RLHF/DPO (no aplica a deteccion).

## Capacidades

- Deteccion de objetos en imagenes con 80 categorias de COCO (persona, vehiculo, animal, utensilios, etc.).
- Deteccion sobre video y webcam mediante `tools/inference.py` del fork mantenido.
- Salida en formato JSON de detecciones (`--save-json`) ademas de imagenes anotadas.
- Procesamiento por lotes de carpetas de imagenes.
- Alta precision en objetos pequenos y medianos gracias al esquema de 5 escalas y LSJ.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un detector.
- Capacidades multilingues: no disponibles; las etiquetas son las 80 clases de COCO en ingles.

## Casos de uso

- Analitica de trafico y dashcam: el modelo detecta vehiculos, peatones y senales en clips de video; la model card incluye una demo con dos clips de dashcam, y el esquema de 5 escalas con LSJ mejora la deteccion de objetos pequenos y lejanos tipicos de escenas viales.
- Moderacion de contenido visual: clasificacion y localizacion de objetos en imagenes subidas por usuarios, con salida JSON integrable en un pipeline de revision.
- Anotacion asistida (pre-labeling): generar cajas candidatas sobre datasets propios para que anotadores humanos solo corrijan, reduciendo coste; el AP de 59,3 en COCO val lo hace adecuado como profesor en destilacion o pseudo-etiquetado.
- Vigilancia y control de aforo: conteo de personas en imagenes o video mediante deteccion por frame, con la ventana de 5 escalas para personas a distintas distancias.
- Inspeccion industrial y retail: deteccion de productos, defectos o elementos en estanterias sobre imagenes fijas procesadas en lote con `--input` apuntando a una carpeta.
- Benchmark de referencia para investigacion: servir como baseline fuerte de deteccion DETR-based al comparar nuevos metodos, dado que el checkpoint y la config estan versionados y con checksum explicito.
- Reproduccion de resultados: validacion del 59,3 box AP reportado ejecutando la config incluida con el stack OpenMMLab fijado.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo en la model card (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| COCO 2017 val (val2017) | box AP | 59,3 |

No se han publicado en la informacion disponible resultados adicionales (AP50, AP75, AP small/medium/large) ni comparativas oficiales con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con backbone Swin-L y 236 M de parametros en fp32, el checkpoint pesa aproximadamente 0,9 GB y la inferencia requiere habitualmente entre 6 y 12 GB de VRAM segun resolucion de entrada y tamano de lote (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamano, una RTX 3090/4090 (24 GB) o A100/H100 son holgadas para lotes pequenos.
- Cabe en GPU de consumo: previsiblemente si en tarjetas de 12 GB o mas con lote 1, aunque no hay medicion publicada.
- Despliegue: no usa vLLM, llama.cpp, Ollama ni TGI (no es un LLM). Requiere MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11; el fork `dronefreak/Co-DETR` incluye `tools/setup_codetr_env.sh` para crear el entorno conda `codetr`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Backbone | COCO box AP | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Co-DINO 5scale LSJ Swin-L 1x (este) | 236 M (219,2 M en inferencia) | Swin-L | 59,3 (reportado) | unknown | Hub (espejo) |
| Co-DETR ViT-L | no disponible en la informacion | ViT-L | no disponible | no disponible | Hub oficial de los autores |
| Co-DETR ResNet-50 | no disponible en la informacion | ResNet-50 | no disponible | no disponible | Google Drive (autores) |
| DINO Swin-L | no disponible en la informacion | Swin-L | no disponible | no disponible | MMDetection model zoo |

No se dispone de datos suficientes en la informacion proporcionada para completar una comparativa cuantitativa con alternativas; los valores de las filas distintas de la primera no estan confirmados en esta ficha.

## Limitaciones y advertencias

- Licencia sin determinar: no hay autorizacion explicita para uso comercial; hay que contactar con los autores originales antes de desplegar en produccion.
- Es un espejo no oficial: el mantenimiento, soporte y posibles retiradas dependen del usuario dronefreak, no de SenseTime.
- Solo detecta las 80 clases de COCO; no generaliza a categorias fuera de ese vocabulario sin reentrenamiento.
- No es compatible con `transformers`: requiere el codigo del proyecto Co-DETR y el stack OpenMMLab 1.x, con dependencias antiguas (PyTorch 1.11) que pueden complicar el despliegue en entornos modernos.
- Riesgo de falsos positivos y negativos en dominios alejados de COCO (imagenes medicas, satelitales, industriales); el AP reportado es sobre el dominio de COCO.
- Sesgos heredados del dataset COCO en la distribucion de clases, contextos y demografia de las personas detectadas.
- El resultado de 59,3 box AP esta marcado como no verificado en la model card; conviene reproducirlo antes de usarlo como referencia.
- No apto para tareas de generacion de texto, VQA ni captioning: carece de cabeza de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/co-dino-5scale-lsj-swin-l-1x-coco
- Paper Co-DETR (ICCV 2023): https://arxiv.org/abs/2211.12860
- Paper COCO: https://arxiv.org/abs/1405.0312
- Repositorio oficial Co-DETR: https://github.com/Sense-X/Co-DETR
- Fork mantenido con script de entorno: https://github.com/dronefreak/Co-DETR
- MMDetection 2.x: https://github.com/open-mmlab/mmdetection/tree/2.x
- Dataset COCO en el Hub: https://huggingface.co/datasets/detection-datasets/coco
