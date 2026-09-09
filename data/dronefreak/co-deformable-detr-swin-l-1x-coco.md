# dronefreak/co-deformable-detr-swin-l-1x-coco

## Resumen

Co-Deformable-DETR es un modelo de detección de objetos basado en la arquitectura Deformable-DETR, pero entrenado con el esquema de asignaciones híbridas colaborativas propuesto en el artículo "DETRs with Collaborative Hybrid Assignments Training" (Co-DETR), publicado en ICCV 2023. El checkpoint que se presenta aquí es un espejo no oficial del modelo con backbone Swin-Large, entrenado durante 12 épocas en el dataset COCO 2017. Fue desarrollado por el equipo de SenseTime X-Lab (Zhuofan Zong, Guanglu Song y Yu Liu) y subido a HuggingFace por el usuario dronefreak para facilitar su descarga automatizada, ya que el original se distribuía a través de un enlace de Google Drive.

El modelo resuelve la tarea de detectar y localizar objetos mediante bounding boxes y etiquetas de clase. Su relevancia radica en que Co-DETR mejora la convergencia y el rendimiento de los detectores basados en DETR al incorporar cabezas auxiliares con asignación one-to-many durante el entrenamiento. En total, el modelo tiene 219,1 millones de parámetros en inferencia. Al ser un modelo de visión pura, no dispone de longitud de contexto en el sentido de los modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Co-Deformable-DETR (Deformable-DETR con cabezas auxiliares) con backbone Swin-Large |
| Parametros totales | 219,1 millones (en inferencia) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vision); etiqueta del repositorio: en |
| Licencia | unknown |
| Formato de pesos | .pth (PyTorch, MMDetection) |

## Arquitectura y entrenamiento

Co-DETR no es una arquitectura nueva, sino un esquema de entrenamiento que se aplica sobre Deformable-DETR. Durante el entrenamiento se añaden cabezas auxiliares que usan asignacion one-to-many (una cabeza ATSS y una cabeza RoI de tipo Faster R-CNN) ademas del emparejamiento hungaro one-to-one del decoder DETR. Las propuestas positivas generadas por estas cabezas se reintroducen en el decoder como consultas adicionales. Esto hace que las caracteristicas del encoder sean mas discriminativas y acelera la convergencia. Las cabezas auxiliares se usan unicamente durante la fase de entrenamiento.

El checkpoint esta entrenado sobre el dataset COCO 2017, con una planificacion de 12 epocas (1x). El backbone es Swin-Large. La implementacion pertenece al ecosistema de MMDetection 2.x, y se requiere la version 2.25.3 de MMDetection junto con MMCV-full 1.5.0 y PyTorch 1.11. No se han facilitado datos sobre el numero de tokens ni sobre procesos de RLHF o DPO, que no aplican a un modelo de vision.

## Capacidades

- Deteccion de objetos en imagenes y videos mediante bounding boxes y etiquetas de clase.
- Entrenado con las 80 categorias del dataset COCO, por lo que reconoce personas, vehiculos, animales, objetos cotidianos, etc.
- Inferencia sobre imagenes individuales, carpetas de imagenes, videos o webcam mediante el script `tools/inference.py` del repositorio.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni tareas de vision-lenguaje.
- No soporta tool calling ni function calling.
- No tiene capacidades de agentes ni de razonamiento multi-paso.
- No tiene soporte multilingue en el sentido de lenguaje natural.
- No dispone de modo de pensamiento ni de procesamiento de audio.

## Casos de uso

- Analisis de grabaciones de dashcam: el modelo puede procesar videos de vehiculos para detectar peatones, otros vehiculos y objetos en la via, como se muestra en el material de demostracion del repositorio.
- Vigilancia perimetral: integrable en sistemas de seguridad para detectar personas, vehiculos o paquetes en imagenes de camaras fijas, aportando una AP de 56,9 en COCO val.
- Percepcion en robotica industrial: el detector puede localizar piezas o herramientas en un entorno de fabricacion, facilitando tareas de picking o inspeccion.
- Agricultura de precision: uso en imagenes aereas o de drone para detectar frutos, plantas o plagas, gracias a su capacidad para trabajar con un numero amplio de categorias.
- Inspeccion de calidad en produccion: deteccion de defectos visuales en productos manufacturados sobre cintas transportadoras, donde un detector preciso como este puede reducir falsos negativos.
- Conteo de trafico en intersecciones: aplicable a videos de camaras urbanas para contar vehiculos y monitorizar la densidad del trafico en tiempo real.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| COCO 2017 val (box AP) | 56,9 |

El valor de box AP de 56,9 esta declarado por el autor del repositorio como reporte del checkpoint. No se han publicado resultados de benchmarks adicionales en la informacion disponible. En la documentacion externa del proyecto oficial se menciona que la variante con Swin-L backbone entrenada durante 36 epocas y con 900 consultas alcanza una AP de 58,5 en COCO, y que la variante Co-DETR con ViT-L (304 millones de parametros) supera el 66,0 de AP en COCO test-dev. Estos valores corresponden a otros checkpoints y no estan verificados en esta ficha.

## Requisitos de hardware

- No se han publicado requisitos de hardware especificos en la informacion proporcionada.
- El repositorio tiene un tamano de 0,9 GB, lo que indica que el checkpoint en formato .pth puede cargarse en una GPU de consumo con memoria suficiente, aunque no se especifica la VRAM exacta.
- Se requiere el stack de MMDetection 2.x: PyTorch 1.11, MMDetection 2.25.3 y MMCV-full 1.5.0.
- No se ha documentado integracion con vLLM, llama.cpp, Ollama o TGI, ya que son herramientas orientadas a modelos de lenguaje.
- La latencia y el throughput no estan especificados.

## Comparativa con modelos similares

| Modelo | Parametros | Box AP (COCO) | Licencia | Disponibilidad |
|---|---|---|---|---|
| Co-Deformable-DETR Swin-L 1x (este) | 219,1 M | 56,9 (val2017) | unknown | Espejo en HuggingFace; checkpoint original en Google Drive |
| Co-Deformable-DETR Swin-L 36 epocas | No disponible | 58,5 (segun documentacion externa) | unknown | Codigo oficial en GitHub |
| Co-DETR ViT-L | 304 M | 65,6 (test-dev) | unknown | Codigo oficial en GitHub |

La comparativa se basa en informacion externa al checkpoint concreto. No hay datos adicionales sobre otros modelos de la misma categoria en la documentacion incluida.

## Limitaciones y advertencias

- Este repositorio no es una release oficial; es un espejo del checkpoint publicado por los autores originales y puede ser transferido o eliminado a peticion de estos.
- La licencia figura como "unknown", por lo que no se garantiza que el uso comercial sea legal sin verificar los terminos de los autores.
- El modelo requiere un entorno especifico de MMDetection 2.x y PyTorch 1.11, lo que complica su integracion en pipelines modernas que no usen este stack.
- Solo detecta objetos de las 80 categorias de COCO; no tiene capacidades de vision-lenguaje ni puede generar descripciones de texto.
- El valor de AP de 56,9 aparece marcado como no verificado (verified: false) en el model-index.
- No se han evaluado sesgos ni robustez; el entrenamiento en COCO puede heredar sesgos de las imagenes y categorias de ese dataset.
- Existe riesgo de falsos positivos en escenas fuera de la distribucion de COCO, como entornos interiores o con iluminacion atipica.
- No se proporciona informacion sobre la estabilidad del modelo frente a ataques adversariales ni sobre su comportamiento en condiciones extremas.

## Enlaces

- HuggingFace: https://huggingface.co/dronefreak/co-deformable-detr-swin-l-1x-coco
- Repositorio oficial: https://github.com/Sense-X/Co-DETR
- Fork mantenido: https://github.com/dronefreak/Co-DETR
- Paper (arXiv): https://arxiv.org/abs/2211.12860
- Documentacion de modelos Co-Deformable-DETR (DeepWiki): https://deepwiki.com/Sense-X/Co-DETR/3.1-co-deformable-detr-models
