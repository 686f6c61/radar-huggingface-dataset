# dronefreak/co-deformable-detr-swin-t-1x-coco

## Resumen

Co-DETR (DETRs with Collaborative Hybrid Assignments Training) es un esquema de entrenamiento para detectores basados en DETR, presentado por SenseTime X-Lab en ICCV 2023. Este checkpoint en HuggingFace es un espejo no oficial del modelo Co-Deformable-DETR con backbone Swin-Tiny, publicado por el usuario dronefreak para ofrecer un almacenamiento estable y versionado de unos pesos que originalmente solo se distribuían mediante una carpeta compartida de Google Drive.

El modelo combina un backbone Swin Transformer Tiny con un encoder-decoder Deformable-DETR y cabezas auxiliares de asignación one-to-many que se descartan en inferencia. Tiene alrededor de 49.3 millones de parámetros y alcanza un box AP de 51.7 en COCO 2017 val tras 12 épocas de entrenamiento. Es relevante porque facilita la reproducibilidad y el despliegue automatizado de esta arquitectura en el ecosistema OpenMMLab.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Co-Deformable-DETR (transformer encoder-decoder) con backbone Swin Transformer Tiny y cabezas auxiliares ATSS/RoI |
| Parámetros totales | 49.3 millones (inferencia) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (etiqueta de HuggingFace; no relevante para la tarea de detección) |
| Licencia | Unknown (indeterminada) |
| Formato de pesos | Checkpoint .pth de PyTorch y archivo de configuración .py (formato MMDetection) |

## Arquitectura y entrenamiento

Co-DETR no es una arquitectura nueva, sino un procedimiento de entrenamiento. Junto al emparejamiento one-to-one del decoder DETR (Hungarian matching), se añaden cabezas auxiliares ATSS y RoI head (estilo Faster-R-CNN) que usan asignación one-to-many. Las propuestas positivas generadas por estas cabezas se retroalimentan al decoder como queries adicionales, lo que produce características del encoder más discriminativas y acelera la convergencia. En inferencia solo se conserva el transformer DETR.

El modelo se entrenó en COCO 2017 con un schedule de 12 épocas (1x). No se dispone de información sobre la composición detallada del dataset, RLHF/DPO ni otras innovaciones de decodificación en la documentación proporcionada. Al tratarse de un modelo de visión, la longitud de contexto no es aplicable.

## Capacidades

- Detección de objetos en imágenes, vídeo y webcam: predice cajas delimitadoras y etiquetas para las 80 clases del dataset COCO.
- Compatible con el ecosistema OpenMMLab (MMDetection 2.x): permite reentrenar, ajustar configuraciones y desplegar mediante los scripts estándar del repositorio.
- Ofrece un checkpoint con checksum y versionado en HuggingFace, lo que facilita la reproducibilidad.
- No soporta tool calling, function calling ni agentes al no ser un modelo de lenguaje.
- No es multimodal: no procesa audio ni texto, solo imágenes.
- No dispone de modo de razonamiento explícito ni de capacidades de chat.

## Casos de uso

- Videovigilancia: el modelo puede detectar personas, vehículos y objetos en tiempo real en flujos de vídeo mediante el script `tools/inference.py`, ideal para sistemas de seguridad basados en GPU de consumo.
- Análisis de dashcam y conducción asistida: el demo incluido muestra detecciones en clips de cámara de salpicadero, lo que permite identificar vehículos, peatones y objetos en carretera.
- Inspección de calidad industrial: tras un fine-tuning con un dataset propio de defectos, puede localizar anomalías en piezas manufacturadas o superficies.
- Retail y control de inventario: sirve para contar productos en estanterías, detectar ausencias y planificar reposiciones mediante cámaras de tienda.
- Robótica de navegación: puede integrarse en un pipeline de percepción para que un robot móvil evite obstáculos o detecte objetos de interés en su entorno.
- Automatización de aparcamientos: mediante detección de vehículos y plazas, puede informar de la ocupación de un parking en imágenes o vídeo.

## Benchmarks y rendimiento

| Modelo | Dataset | Métrica | Valor |
|---|---|---|---|
| Co-Deformable-DETR Swin-Tiny 1x (este checkpoint) | COCO 2017 val | box AP | 51.7 (no verificado) |
| Co-DETR Swin-Large 36x (referencia externa) | COCO | box AP | 58.5 (según DeepWiki) |

No se han publicado otros resultados de benchmarks en la información disponible. El valor de 51.7 box AP proviene del model-index del autor en HuggingFace y no ha sido verificado.

## Requisitos de hardware

- VRAM estimada: con 49.3 millones de parámetros, el checkpoint en FP32 ocupa aproximadamente 197 MB. Para inferencia se recomienda al menos 2-4 GB de VRAM según la resolución de entrada.
- GPU recomendadas: tarjetas de consumo como RTX 3060, RTX 4060 o superiores. Para lotes grandes o alta resolución pueden emplearse RTX 4090 o A100.
- Entorno de despliegue: se requiere el stack de MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11. El repositorio mantenido por dronefreak incluye un script de configuración de entorno.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Backbone | box AP | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Co-Deformable-DETR Swin-Tiny 1x | 49.3M | Swin-Tiny | 51.7 | unknown | Mirror en HuggingFace |
| Co-DETR Swin-Large 36x | No disponible | Swin-Large | 58.5 | No disponible | Repositorio oficial |

No se dispone de información suficiente sobre otras variantes de Co-DETR (ResNet-50, ViT-L, etc.) en la información proporcionada. La comparación con Swin-Large se basa en datos de la documentación externa de DeepWiki.

## Limitaciones y advertencias

- Este no es un release oficial: los pesos pertenecen a los autores originales de SenseTime X-Lab y el repositorio es un espejo que puede transferirse o retirarse a petición suya.
- La licencia de los pesos es unknown o indeterminada, por lo que no se puede asumir un uso comercial seguro sin consultar con los autores.
- El resultado de 51.7 box AP no está verificado; puede haber ligeras variaciones al reproducirlo.
- El modelo exige un stack tecnológico específico y relativamente antiguo (PyTorch 1.11, MMDetection 2.x), lo que puede complicar su integración en proyectos modernos.
- Al estar entrenado en COCO, hereda sesgos del dataset: predominio de objetos cotidianos en entornos occidentales y menor rendimiento en dominios infrarrepresentados.
- En condiciones de baja iluminación, oclusiones o imágenes fuera de distribución, es esperable un aumento de falsos positivos y negativos.
- La ausencia de licencia explícita es una advertencia legal importante para despliegues en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/co-deformable-detr-swin-t-1x-coco
- Paper (arXiv): https://arxiv.org/abs/2211.12860
- Repositorio oficial (Sense-X/Co-DETR): https://github.com/Sense-X/Co-DETR
- Fork mantenido (dronefreak/Co-DETR): https://github.com/dronefreak/Co-DETR
- Documentación de Co-Deformable-DETR en DeepWiki: https://deepwiki.com/Sense-X/Co-DETR/3.1-co-deformable-detr-models
- Config de referencia (variante base): https://github.com/zzx135790/Co-detr/blob/main/projects/configs/co_deformable_detr/co_deformable_detr_swin_base_1x_coco.py
