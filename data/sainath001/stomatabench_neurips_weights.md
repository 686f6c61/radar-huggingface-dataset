# Sainath001/stomatabench_neurips_weights

## Resumen

StomataBench es un repositorio de pesos que reúne 15 detectores de estomas entrenados y evaluados en el marco del artículo "StomataBench: Measuring Taxonomic Generalization in Stomatal Detection" (NeurIPS), firmado por Sainath Reddy Gummi, Hankui K. Zhang, Chulwoo Pack, Shyam Solanki y Young Chang. No se trata de un modelo único, sino de una colección de detectores de objetos de una sola clase (`stomata`) afinados sobre el conjunto OD-Train del dataset StomataBench, pensados para fenotipado vegetal a partir de imágenes de microscopía.

El problema que aborda es la generalización taxonómica: los detectores de estomas suelen funcionar bien en las especies con las que se entrenaron pero degradan su rendimiento en especies no vistas. El repositorio proporciona los pesos exactos usados en el artículo para medir esa generalización sobre OD-Valid y cuatro conjuntos de test retenidos (T-MAWP, T-DCWP, T-MSWP, T-GSH), con métricas de localización COCO y medidas de conteo y densidad.

La colección cubre cinco familias de arquitectura: detectores convolucionales de dos etapas (Faster R-CNN con backbones R50, R101 y X101), detectores de una etapa tipo RetinaNet, la familia YOLO (v8, v11, v12 y v26), los transformers RT-DETRv2 y RT-DETRv4, un Grounding DINO ajustado (GDINO-SB) y SAM 3 adaptado a detección (SAM3-OD). El repositorio ocupa 17,2 GB y cada detector se distribuye en su propia carpeta con su fichero de pesos y configuración. No es un modelo generativo ni de lenguaje: no tiene contexto textual ni parámetros lingüísticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Colección de 15 detectores de objetos: Faster R-CNN (R50/R101/X101 + FPN), RetinaNet (R50/R101 + FPN), YOLOv8, YOLOv11, YOLOv12, YOLOv26, RT-DETRv2, RT-DETRv4, Grounding DINO (GDINO-SB) y SAM 3 (SAM3-OD) |
| Parametros totales | no disponible (no se publica el recuento por detector) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en precisión de entrenamiento: `.pth`, `.pt`, `.safetensors`) |
| Idiomas soportados | no disponible (no procesa texto; GDINO-SB usa prompts textuales vía procesador de Grounding DINO base) |
| Licencia | `stomatabench-per-model-licences`: CC-BY-SA-3.0 (Faster R-CNN y RetinaNet), AGPL-3.0 (YOLO), Apache-2.0 (RT-DETRv2, RT-DETRv4 y GDINO-SB), SAM License (SAM3-OD) |
| Formato de pesos | `.pth` (Detectron2, RT-DETRv4, SAM3-OD), `.pt` (Ultralytics), `.safetensors` (RT-DETRv2, GDINO-SB) |
| Tarea | Detección de objetos, clase única `stomata` |
| Framework de inferencia | Detectron2, Ultralytics, HuggingFace Transformers, código oficial de RT-DETRv4 y de SAM 3 |
| Tamaño del repositorio | 17,2 GB |

## Arquitectura y entrenamiento

El repositorio agrupa cinco familias arquitectónicas descritas en la sección de Related Work del artículo. Los detectores de dos etapas (Faster R-CNN) generan propuestas de región agnósticas a la clase mediante una Region Proposal Network y refinan los candidatos con un clasificador y un regresor de cajas en una segunda etapa; el artículo señala que este diseño de propuesta-refinamiento sigue siendo una base sólida para detección de objetos pequeños. Los detectores de una etapa tipo RetinaNet emplean una red piramidal de características con pérdida focal. La familia YOLO cubre las versiones v8, v11, v12 y v26 con sus configuraciones de entrenamiento (`args.yaml`). Los transformers RT-DETRv2 y RT-DETRv4 aportan detección end-to-end sin NMS; RT-DETRv4 se entrena con un profesor DINOv3, según se indica en la tabla de licencias. GDINO-SB es un Grounding DINO ajustado y SAM3-OD adapta el modelo de segmentación SAM 3 a la tarea de detección.

Cada uno de los 15 detectores se afina una sola vez sobre OD-Train con una única clase `stomata`. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de refuerzo o preferencias; esos datos corresponden al artículo y al repositorio del dataset. No se documentan innovaciones de decodificación especulativa ni atención lineal, por tratarse de modelos de visión. La evaluación se realiza sin modificar los detectores sobre OD-Valid y cuatro conjuntos de test retenidos (T-MAWP, T-DCWP, T-MSWP, T-GSH), con métricas de localización COCO y medidas de conteo y densidad.

## Capacidades

- Detección de objetos de clase única: localiza estomas en imágenes de microscopía y devuelve cajas delimitadoras con puntuación de confianza.
- Fenotipado vegetal cuantitativo: permite derivar conteo y densidad de estomas a partir de las detecciones, métricas que el artículo evalúa de forma explícita.
- Evaluación de generalización taxonómica: los pesos están pensados para medirse sobre especies no vistas en los conjuntos T-MAWP, T-DCWP, T-MSWP y T-GSH.
- Cobertura multiarquitectura: permite comparar familias convolucionales de dos y una etapa, YOLO, transformers de detección, un detector abierto por prompt y un modelo de segmentación adaptado.
- GDINO-SB admite detección guiada por prompt textual (carga el procesador de `IDEA-Research/grounding-dino-base`), aunque su ajuste es específico para la clase `stomata`.
- SAM3-OD aporta la capacidad de segmentación subyacente de SAM 3 aplicada a detección.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Fenotipado de estomas en cultivos: desplegar uno de los detectores sobre imágenes de microscopía de hojas para contar estomas por unidad de área y calcular densidad estomática, insumo habitual en estudios de respuesta a estrés hídrico.
- Selección de arquitectura para un pipeline de microscopía: usar los 15 pesos como banco de pruebas para decidir entre Faster R-CNN, RetinaNet, YOLO o RT-DETR según el compromiso entre precisión de localización y coste de inferencia en el hardware disponible.
- Evaluación de generalización a nuevas especies: aplicar los detectores sin reentrenar a imágenes de especies no incluidas en OD-Train y comparar su caída de rendimiento con las métricas COCO reportadas en el artículo.
- Investigación reproducible en visión aplicada a plantas: partir de los pesos exactos del artículo para replicar los resultados sobre OD-Valid y los cuatro conjuntos de test retenidos.
- Anotación asistida de nuevas imágenes: usar las detecciones de mayor confianza como preanotaciones para acelerar el etiquetado manual de estomas en nuevos datasets de microscopía.
- Detección guiada por prompt con GDINO-SB: explorar la adaptación de un detector abierto a una clase biológica concreta y comparar su comportamiento frente a los detectores cerrados del resto de la colección.
- Segmentación y detección combinadas con SAM3-OD: aprovechar la base de segmentación de SAM 3 cuando se requiera contorno del estoma además de la caja delimitadora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no reporta resultados y remite al artículo y al repositorio del dataset para las métricas de localización COCO y las medidas de conteo y densidad sobre OD-Valid y los conjuntos T-MAWP, T-DCWP, T-MSWP y T-GSH.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no se publica el recuento de parámetros por detector. Como referencia cualitativa, los backbones R50/R101 con FPN en Detectron2 y los modelos YOLO pequeños-medios suelen caber en GPU de consumo, mientras que los backbones X101 y los transformers de detección requieren más memoria.
- GPU recomendadas: no disponible en la información proporcionada; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada por el autor; depende del detector concreto y del tamaño de lote e imagen de entrada.
- Opciones de despliegue: Detectron2 (`DefaultPredictor`) para Faster R-CNN y RetinaNet; Ultralytics para YOLOv8/v11/v12/v26; HuggingFace Transformers (`AutoModelForObjectDetection`) para RT-DETRv2 y `AutoModelForZeroShotObjectDetection` para GDINO-SB; código oficial de RT-DETRv4 y de SAM 3 para sus respectivos checkpoints.
- Latencia y throughput: no disponibles.
- Nota de despliegue: la carpeta `RT-DETRv2/` incluye ficheros de estado del entrenador (`optimizer.pt`, `rng_state.pth`, `scaler.pt`, `scheduler.pt`, `trainer_state.json`, `training_args.bin`) que no son necesarios para inferencia.

## Comparativa con modelos similares

| Modelo | Familia | Clase | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| StomataBench FRCNN-R50-1x | Faster R-CNN de dos etapas | `stomata` (única) | CC-BY-SA-3.0 (pesos), Apache-2.0 (código) | `.pth` + `config3.yaml` | Hugging Face, repo `Sainath001/stomatabench_neurips_weights` |
| StomataBench Retina-R50-1x | RetinaNet de una etapa | `stomata` (única) | CC-BY-SA-3.0 (pesos), Apache-2.0 (código) | `.pth` + `config5.yaml` | Hugging Face, mismo repo |
| StomataBench YOLOv8 | YOLO de una etapa | `stomata` (única) | AGPL-3.0 | `.pt` + `args.yaml` | Hugging Face, mismo repo |
| StomataBench RT-DETRv2 | Transformer de detección end-to-end | `stomata` (única) | Apache-2.0 | `.safetensors` + `config.json` | Hugging Face, mismo repo |
| StomataBench GDINO-SB | Detector abierto por prompt | `stomata` (ajustado) | Apache-2.0 | `.safetensors` | Hugging Face, mismo repo; procesador externo de `IDEA-Research/grounding-dino-base` |

La comparación con detectores genéricos de propósito general (COCO) no está disponible en la información proporcionada, ya que no se publican métricas numéricas en la model card. La comparativa relevante es interna a la propia colección, que permite contrastar familias bajo el mismo protocolo de evaluación del artículo.

## Limitaciones y advertencias

- Modelo de visión de clase única: solo detecta `stomata`; no es un modelo de lenguaje ni admite tareas generativas, de razonamiento o de tool calling.
- La model card no reporta resultados de benchmarks; cualquier afirmación de rendimiento debe verificarse en el artículo o en el repositorio del dataset.
- No se documentan sesgos conocidos ni tasas de alucinación en la información disponible; en detección de objetos el riesgo equivalente es de falsos positivos y falsos negativos, cuya magnitud no se cuantifica aquí.
- Licencias heterogéneas por modelo: AGPL-3.0 en la familia YOLO impone obligaciones de copyleft de red si se ofrece como servicio; SAM3-OD usa la SAM License; el resto se reparte entre CC-BY-SA-3.0 y Apache-2.0. Es imprescindible revisar la sección de licencias del repositorio antes de un uso comercial.
- RT-DETRv4 depende de un profesor DINOv3, con condiciones de licencia propias que deben comprobarse.
- GDINO-SB no incluye ficheros de tokenizer; requiere cargar el procesador desde `IDEA-Research/grounding-dino-base`.
- RT-DETRv4 y SAM3-OD necesitan el código oficial de sus respectivos proyectos; no se cargan con un `from_pretrained` estándar de Transformers.
- La generalización a especies no vistas es precisamente el eje del artículo; no se garantiza un rendimiento uniforme entre taxones.
- El repositorio incluye ficheros auxiliares de entrenamiento en `RT-DETRv2/` que conviene excluir en producción para reducir el tamaño de descarga.

## Enlaces

- Repositorio de pesos en Hugging Face: https://huggingface.co/Sainath001/stomatabench_neurips_weights
- Dataset StomataBench: https://huggingface.co/datasets/Sainath001/StomataBench
- DOI del dataset: https://doi.org/10.57967/hf/8667
- DOI de los pesos: https://doi.org/10.57967/hf/11473
- Artículo (OpenReview): https://openreview.net/forum?id=kUdZ3znDlI
- Código de evaluación: https://github.com/gummi001/stomatabench_neurips_eval
- RT-DETRv4 (código oficial): https://github.com/RT-DETRs/RT-DETRv4
- SAM 3 (código oficial): https://github.com/facebookresearch/sam3
- Grounding DINO base (procesador para GDINO-SB): https://huggingface.co/IDEA-Research/grounding-dino-base
- Referencias arXiv citadas en los tags: arXiv:2407.17140, arXiv:2510.25257, arXiv:2508.10104
