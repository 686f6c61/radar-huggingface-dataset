# illimax/YolPe

## Resumen

YolPe es un detector de personas de una sola clase (`person`) desarrollado por el usuario illimax, obtenido mediante fine-tuning del modelo Ultralytics YOLO26s preentrenado en COCO sobre el dataset CrowdHuman. Su objetivo es resolver un problema concreto en vigilancia: en vistas de CCTV en alto y gran angular, las personas lejanas aparecen con cajas de pocos píxeles y los grupos se solapan, lo que provoca que los detectores genéricos pierdan una fracción muy alta de individuos. YolPe mantiene la arquitectura end-to-end de YOLO26 (sin NMS) y la adapta a la detección de multitudes.

El modelo opera a resolución de entrada 1280 (también evaluado a 960) y está pensado para conteo de personas en escenas densas. Según la model card, el recall para personas lejanas (altura de caja inferior a 48 px) sube de 0,225 a 0,798 frente al YOLO26s base, y la altura mínima de persona detectable de forma fiable baja de 128 px a 24 px. Es relevante porque demuestra que un fine-tuning cuidadoso del etiquetado (tratamiento de zonas `ignore` y `mask`) puede mejorar sustancialmente la detección de objetos pequeños sin cambiar de arquitectura.

El repositorio tiene un tamaño declarado de 0,0 GB, 157 descargas y 0 likes en el momento de la consulta. La licencia del artefacto es AGPL-3.0, pero el dataset de entrenamiento (CrowdHuman) está licenciado solo para investigación no comercial, una restricción que condiciona el uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (Ultralytics), end-to-end sin NMS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se menciona exportación a ONNX y TensorRT, sin detallar precisiones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 (artefacto); CrowdHuman restringido a investigación no comercial |
| Formato de pesos | `.pt` (PyTorch/Ultralytics); exportable a ONNX y TensorRT |

Otros datos relevantes: clase única `0: person` (caja de cuerpo completo, incluyendo partes ocluidas), resolución de entrada 1280 (evaluado también a 960), `max_det` recomendado de 1000, umbral de confianza de referencia 0,35 (F1 máximo en 0,371), versión de Ultralytics 8.4.163.

## Arquitectura y entrenamiento

YolPe parte de YOLO26s preentrenado en COCO y se fine-tunea sobre CrowdHuman (15.000 imágenes de entrenamiento, 4.370 de validación), con etiquetas de caja completa de persona y recorte de las partes que salen del encuadre. La innovación principal descrita no está en la arquitectura sino en el tratamiento de datos: las regiones `mask` y las personas marcadas como `ignore` en CrowdHuman se eliminan de las etiquetas y se pintan en gris (valor 114) en la imagen, de modo que el modelo no aprenda a tratar multitudes densas y lejanas como fondo vacío. Las partes visibles de personas válidas que se solapan con esas zonas se restauran a sus píxeles originales.

La configuración de entrenamiento usa `imgsz=1280`, 50 épocas con paciencia de 10, batch 8, mosaic 1.0 desactivado en las últimas 10 épocas, `scale=0.5`, `fliplr=0.5`, `flipud=0.0` (el punto de vista de cámara es fijo), `hsv_v=0.4` y `max_det=1000`. Se produjo un early stopping en la época 47 y se adoptó el checkpoint de la época 37, la de mayor mAP50-95 en validación. No se menciona uso de RLHF, DPO ni técnicas de destilación; es un fine-tuning supervisado convencional.

## Capacidades

- Detección de personas en imágenes, con una única clase de salida (`person`).
- Detección de personas de pequeño tamaño: altura mínima fiable de 24 px (frente a 128 px del modelo base).
- Conteo de multitudes en escenas densas y con solapamiento, con `max_det=1000` para no truncar el número de detecciones.
- Inferencia end-to-end sin NMS, lo que simplifica el post-procesado y el despliegue.
- Exportación a ONNX y TensorRT (con `max_det` fijado en el grafo).
- No soporta tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de audio o de visión general: es exclusivamente un detector de objetos de una clase.

## Casos de uso

- Conteo de aforo en CCTV: el modelo detecta personas lejanas y solapadas en vistas de cámara alta y gran angular, lo que permite estimar ocupación en recintos con una sola cámara y sin infraestructura adicional.
- Control de aglomeraciones en espacios públicos: al mejorar el recall en cajas de 16 a 48 px, sirve para alertar cuando la densidad de personas supera un umbral en estaciones, plazas o eventos.
- Análisis de vídeo de vigilancia existente: al ser un fine-tuning de YOLO26s, se integra en pipelines Ultralytics ya desplegados y exporta a ONNX/TensorRT para GPUs de borde.
- Detección de intrusos en perímetros largos: la mejora en rango lejano permite cubrir más metros por cámara en pasillos, parkings o recintos industriales.
- Investigación en visión por computador: el código de conversión de datos y evaluación por distancia está publicado en GitHub, lo que facilita reproducir y comparar experimentos sobre CrowdHuman.
- Estimación de flujos peatonales: combinado con tracking posterior, el detector alimenta conteos por zona y trayectorias en escenas con alta densidad.
- Prototipado académico de detección de personas pequeñas: sirve como baseline para estudiar el efecto del tratamiento de regiones `ignore` en datasets de multitudes.

## Benchmarks y rendimiento

Evaluación sobre CrowdHuman val (4.370 imágenes, 99.481 personas), `imgsz=1280`. La recall por distancia se mide con `conf=0.35`, caja visible e IoU 0.5; los índices de detección con `conf=0.371` y caja completa.

Personas bien visibles (75 % o más del cuerpo visible, 48.204 personas):

| Distancia | Altura de caja | Personas | YOLO26s base | YolPe | Mejora |
|---|---|---|---|---|---|
| Lejana | < 48 px | 5.535 | 0,225 | 0,798 | +0,573 |
| Media | 48–128 px | 14.966 | 0,559 | 0,930 | +0,371 |
| Cercana | > 128 px | 27.703 | 0,852 | 0,969 | +0,117 |
| Total | | 48.204 | 0,689 | 0,938 | +0,249 |

Incluyendo personas ocluidas (99.481 personas):

| Distancia | Personas | YOLO26s base | YolPe | Mejora |
|---|---|---|---|---|
| Lejana | 9.151 | 0,163 | 0,605 | +0,442 |
| Media | 29.321 | 0,380 | 0,661 | +0,281 |
| Cercana | 61.009 | 0,697 | 0,710 | +0,013 |
| Total | 99.481 | 0,554 | 0,686 | +0,132 |

Métricas de detección de Ultralytics en el punto de máximo F1 (`conf=0.371`, caja completa):

| Precision | Recall | F1 | mAP50 | mAP50-95 |
|---|---|---|---|---|
| 0,940 | 0,884 | 0,91 | 0,946 | 0,660 |

A `imgsz=960` (personas bien visibles): recall lejano 0,190 → 0,776; medio 0,547 → 0,933; cercano 0,856 → 0,970; total 0,624 → 0,921. Desglose por tamaño de caja a 1280 (bien visibles): 16–20 px 0,070 → 0,556; 24–32 px 0,143 → 0,762; 48–64 px 0,420 → 0,903; 256 px o más 0,893 → 0,975.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Como referencia de familia, un YOLO26s a `imgsz=1280` requiere típicamente varios GB de VRAM en FP16, pero no se ha publicado una cifra concreta para este checkpoint.
- GPU recomendadas: no disponible. La model card solo menciona exportación a ONNX y TensorRT, sin especificar modelos de GPU.
- GPU de consumo: no confirmado. El tamaño del modelo (variante "s") sugiere que podría caber en GPUs de consumo, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: Ultralytics (PyTorch), exportación a ONNX y TensorRT. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Clase(s) | Resolución | Recall lejano (<48 px) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YolPe | `person` | 1280 | 0,798 | AGPL-3.0 (datos: solo investigación) | Hugging Face |
| YOLO26s (COCO) | 80 clases | 1280 | 0,225 | AGPL-3.0 (Ultralytics) | Ultralytics |
| YOLO26s fine-tuned en CrowdHuman sin tratamiento de `ignore` | `person` | 1280 | no disponible | depende del dataset | no disponible |

La comparación directa con el modelo base es la única publicada por el autor. No se han encontrado en la información disponible comparativas con otros detectores de personas (por ejemplo, variantes de YOLOv8/v11 fine-tuneadas en CrowdHuman o modelos específicos de crowd counting).

## Limitaciones y advertencias

- Las personas muy ocluidas se siguen perdiendo: el recall global incluyendo ocluidas es 0,686 y en rango cercano apenas mejora respecto al base (0,697 → 0,710). En multitudes densas el conteo puede quedar por debajo del real.
- En cajas grandes (256 px o más) con muchas oclusiones el rendimiento es ligeramente inferior al base (0,795 → 0,747); el autor indica que no ha identificado la causa.
- Personas de menos de 16 px de altura se detectan con recall igual o inferior a 0,33.
- Puede clasificar como persona objetos con forma similar (falsos positivos), según la propia model card.
- Licencia AGPL-3.0 para el artefacto, con la restricción adicional de que CrowdHuman es solo para investigación no comercial: el uso comercial del modelo entrenado con estos datos es jurídicamente arriesgado y requiere revisión legal.
- No es un modelo de lenguaje: no tiene capacidades de texto, tool calling, agentes ni multilingüismo.
- En exportación a ONNX/TensorRT, `max_det` queda fijado en el grafo; si no se configura a 1000, las escenas densas se truncan.
- No se han publicado datos de sesgo demográfico, robustez ante condiciones de iluminación extremas ni evaluación en dominios distintos de CrowdHuman.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/illimax/YolPe
- Código de entrenamiento y evaluación: https://github.com/lkw-k/YolPe
- Dataset CrowdHuman (paper referenciado, arXiv:1805.00123): https://arxiv.org/abs/1805.00123
- Ultralytics (framework y YOLO26): https://github.com/ultralytics/ultralytics
