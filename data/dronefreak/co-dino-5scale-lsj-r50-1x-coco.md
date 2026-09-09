# dronefreak/co-dino-5scale-lsj-r50-1x-coco

## Resumen

Co-DINO es un modelo de detección de objetos basado en el framework Co-DETR (DETRs with Collaborative Hybrid Assignments Training), presentado en ICCV 2023 por un equipo de SenseTime X-Lab. Este checkpoint concreto utiliza un backbone ResNet-50 y una configuración de 5 escalas, entrenado durante 12 épocas en el dataset COCO 2017. El modelo alcanza un box AP de 52.1 en el split val2017 de COCO, un resultado sólido para un modelo de tamaño medio. La particularidad de Co-DETR es su esquema de entrenamiento colaborativo: combina cabezas auxiliares con asignación one-to-many (ATSS y RoI) junto al decoder de DETR con matching húngaro one-to-one, lo que acelera la convergencia y mejora la discriminación de las características. Este checkpoint es un mirror publicado en HuggingFace por el usuario dronefreak, que reproduce exactamente los pesos publicados por los autores originales en Google Drive, con la intención de facilitar su descarga y verificación. No es un modelo de lenguaje, sino un detector de objetos puro, por lo que su uso está orientado a tareas de visión por computador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Co-DETR (Co-DINO) - Transformer DETR-based con backbone ResNet-50 y 5 escalas |
| Parametros totales | 48.9M (inferencia, según la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de detección de objetos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (no aplica, modelo de visión) |
| Licencia | unknown |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento

Co-DETR no introduce una arquitectura nueva, sino un esquema de entrenamiento híbrido. Durante el entrenamiento se añaden cabezas auxiliares que usan asignación one-to-many (una cabeza ATSS y una cabeza RoI al estilo Faster R-CNN) junto al decoder principal de DETR, que emplea matching húngaro one-to-one. Las propuestas positivas generadas por estas cabezas auxiliares se retroalimentan en el decoder como queries adicionales. Esto hace que las características de los encoder sean más discriminativas y acelera la convergencia. Las cabezas auxiliares solo se utilizan durante el entrenamiento: el config de este checkpoint establece `eval_module='detr'`, de modo que en inferencia solo se usa la cabeza query de Co-DINO.

El checkpoint fue entrenado en COCO 2017 con un schedule de 1x (12 épocas). No hay información disponible sobre el número exacto de tokens o iteraciones ni sobre la composición detallada del dataset, más allá de que se usó COCO. Tampoco se mencionan técnicas de RLHF o DPO, que no aplican a un modelo de visión. El backbone es ResNet-50 con un FPN de 5 escalas, lo que permite detectar objetos de distintos tamaños.

## Capacidades

- Detección de objetos de las 80 categorías del dataset COCO.
- Arquitectura query-based sin necesidad de anchor boxes manuales ni post-procesado NMS.
- Uso de 5 niveles de features para detectar objetos en múltiples escalas.
- No genera texto, ni soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No tiene capacidades de visión más allá de la detección de objetos (no es un modelo multimodal de lenguaje y visión).
- No dispone de modo thinking ni soporte de audio.

## Casos de uso

- Detección de objetos en videovigilancia: el modelo identifica personas, vehículos y otros objetos en secuencias de vídeo. Su 52.1 de AP en COCO lo hace adecuado para sistemas de vigilancia en tiempo real, y al ser un modelo de tamaño medio, puede ejecutarse en GPUs de gama media.
- Inspección de calidad en manufactura: con afinado en un dataset de defectos, puede detectar anomalías en piezas industriales. La configuración de múltiples escalas favorece la detección de defectos de diferentes tamaños en superficies complejas.
- Conteo y seguimiento de objetos: integrado con un tracker (por ejemplo, ByteTrack), permite contar personas o vehículos en flujos de tráfico, eventos masivos o entornos de tienda.
- Automatización de anotación de datasets: el modelo puede generar propuestas de bounding boxes para acelerar el etiquetado manual en tareas de anotación de imágenes a gran escala, reduciendo el tiempo de revisión humana.
- Robótica y percepción en máquinas: su naturaleza ligera (48.9M de parámetros) permite integrarlo en pipelines robóticos para localizar objetos y guiar la manipulación, incluso en sistemas embebidos con GPUs modestas.
- Análisis de imágenes de dashcam: la demo del propio repo muestra detecciones en vídeo de dashcam, lo que resulta útil para sistemas de asistencia al conductor (ADAS) que necesitan detectar vehículos, peatones y objetos en la calzada.
- Seguridad laboral: afinado para detectar equipos de protección individual (cascos, chalecos reflectantes) en obras, puede emplearse para controlar el cumplimiento de normativas de seguridad.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| COCO 2017 val (box AP) | 52.1 (reportado por el autor, no verificado) |

No se han publicado más resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Los pesos en inferencia son 48.9M, lo que en FP32 supone aproximadamente 196 MB, pero las activaciones y el preprocesado de imágenes incrementan el consumo. No hay cifras oficiales de VRAM.
- GPU recomendadas: no disponible. Al ser un modelo pequeño, puede ejecutarse en GPUs consumer (RTX 30/40), pero no se especifica una lista concreta.
- Opciones de despliegue: no compatible con vLLM, llama.cpp, Ollama ni TGI. Requiere el stack de OpenMMLab 1.x (MMDetection 2.25.3, MMCV-full 1.5.0, PyTorch 1.11) y el código del proyecto Co-DETR.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han incluido comparativas con otros modelos en la información proporcionada. El modelo pertenece a la familia Co-DETR, que compite con otros detectores basados en transformer como DINO o Deformable DETR, pero no se dispone de resultados comparativos con estos en la fuente.

## Limitaciones y advertencias

- Licencia unknown: los pesos no tienen una licencia explícita, lo que genera incertidumbre para su uso comercial. La model card indica "Weights license undetermined".
- No es un release oficial: es un mirror de un checkpoint de los autores originales; no hay garantía de mantenimiento ni soporte.
- Requerimientos de entorno: exige una versión específica de MMDetection/MMCV/PyTorch y el código del proyecto; no funciona con la librería transformers de HuggingFace.
- Sesgos: entrenado en COCO, el modelo puede heredar sesgos del dataset (categorías predominantemente occidentales, imágenes de internet) y puede tener peor rendimiento en dominios no representados.
- Riesgo de falsos positivos: en visión, el modelo puede producir bounding boxes erróneos, especialmente en escenas con oclusiones, poca luz o categorías visualmente similares.
- Limitaciones de contexto o idioma: no aplica, al ser un modelo de detección de objetos.
- El modelo no incluye mecanismos de explicabilidad; las detecciones son cajas que pueden no distinguir bien objetos de categorías solapadas.

## Enlaces

- HuggingFace: https://huggingface.co/dronefreak/co-dino-5scale-lsj-r50-1x-coco
- Paper (arXiv): https://arxiv.org/abs/2211.12860
- Repositorio oficial: https://github.com/Sense-X/Co-DETR
- Fork mantenido: https://github.com/dronefreak/Co-DETR
- DeepWiki (documentación de Co-DINO): https://deepwiki.com/Sense-X/Co-DETR/3.2-co-dino-models
- Config de referencia (LVIS, no COCO): https://github.com/Sense-X/Co-DETR/blob/main/projects/configs/co_dino/co_dino_5scale_lsj_r50_1x_lvis.py
