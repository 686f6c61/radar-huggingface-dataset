# kenantabak/yolo26s-indoor-furniture-detection-tr

## Resumen

`yolo26s-indoor-furniture-detection-tr` es un modelo de detección de objetos en tiempo real entrenado por Kenan Tabak sobre la arquitectura `yolo26s` (Ultralytics YOLO26 Small) dentro de la plataforma EVREN. Su propósito es identificar tres clases de mobiliario de interior —sofá, mesa y silla— en imágenes de 640 × 640 píxeles, con aplicación directa en robótica de interiores y visión artificial en entornos domésticos.

El modelo se distribuye con pesos de 18,5 MB en formato PyTorch (`best.pt`), además de exportaciones a ONNX y TFLite, y declara soporte para turco e inglés. La model card reporta métricas muy dispares: un mAP@50 del 99,49 % y un F1 del 65,31 %, pero un AP@50 de la clase `Chair` del 0,00 %, lo que indica que el detector no aprende esa categoría en la validación publicada.

Es relevante ahora porque ejemplifica el ecosistema emergente de modelos YOLO de nueva generación entrenados sobre plataformas regionales (EVREN, Turquía) y publicados con licencia permisiva CC BY 4.0, lo que facilita su evaluación rápida en pipelines de robótica indoor, aunque las inconsistencias internas de sus métricas exigen validación propia antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `yolo26s` (Ultralytics YOLO26 Small), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 640 × 640 px) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch, ONNX y TFLite; no se documentan variantes cuantizadas) |
| Idiomas soportados | tr, en (etiquetas y documentación) |
| Licencia | CC BY 4.0 (los pesos se generaron con el framework Ultralytics `yolo26s`, licenciado AGPL-3.0) |
| Formato de pesos | PyTorch (`best.pt`), ONNX (`best.onnx`), TFLite (`best.tflite`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `yolo26s` de Ultralytics, un detector de objetos de una etapa basado en CNN con cuello de agregación multiescala y cabecera de predicción densa, propia de la familia YOLO. La entrada se estandariza a 640 × 640 píxeles y la salida son cajas delimitadoras con clase y confianza para tres categorías: `Sofa`, `Table` y `Chair`.

El entrenamiento se realizó sobre el dataset `İç Mekan Sandalye, Koltuk ve Masa Mobilya Tespiti (3 Sınıf)` (v1.0, grado A según EVREN), con optimizador automático, programación de tasa de aprendizaje cosenoidal y precisión mixta (AMP) activada. La model card indica una duración de 0,056 GPU-horas sobre una NVIDIA H200 o A100, un tiempo extremadamente corto que sugiere un conjunto de datos pequeño o un número reducido de épocas efectivas; el mejor resultado se obtuvo en la época 49 de 50. No se documentan técnicas de aumento de datos, composición del dataset ni procesos de ajuste fino posteriores.

## Capacidades

- Detección de objetos en tiempo real de tres clases de mobiliario de interior: sofá (`Sofa`), mesa (`Table`) y silla (`Chair`).
- Localización mediante cajas delimitadoras con puntuación de confianza por instancia.
- Inferencia sobre imágenes individuales a 640 × 640 px con umbrales de confianza e IoU configurables.
- Exportación a ONNX y TFLite para despliegue en entornos de borde y dispositivos móviles.
- Integración nativa con la librería `ultralytics` en Python y CLI.
- Soporte de etiquetas y documentación en turco e inglés.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión multimodal, audio ni modo de razonamiento extendido, por tratarse de un detector puro.

## Casos de uso

- Robótica de interiores: un robot doméstico puede usar el modelo para localizar sofás, mesas y sillas en tiempo real y planificar trayectorias de navegación evitando obstáculos; el formato TFLite permite ejecutarlo en la propia unidad de cómputo del robot.
- Inventario automatizado de mobiliario: en auditorías de oficinas o viviendas, el detector permite contar y clasificar mesas y sofás a partir de fotografías, reduciendo el trabajo manual de inventariado.
- Asistencia a personas con discapacidad visual: integrado en una aplicación móvil con la cámara del teléfono, el modelo puede anunciar la presencia y posición de muebles cercanos en tiempo real.
- Automatización de tareas de limpieza: un robot aspirador puede identificar sillas y mesas para rodearlas o ajustar su ruta, usando la salida de cajas para la planificación local.
- Análisis de imágenes inmobiliarias: clasificación y localización automática de mobiliario en fotos de anuncios para etiquetado, búsqueda por contenido o generación de descripciones.
- Prototipado rápido en visión artificial: gracias a su tamaño reducido (18,5 MB) y a los formatos ONNX/TFLite, sirve como base para experimentos de detección en entornos con recursos limitados.
- Sistemas de realidad aumentada: superposición de información o elementos virtuales sobre muebles detectados en la escena captada por la cámara.

## Benchmarks y rendimiento

Los datos proceden del `model-index` y de la model card del autor; no están verificados de forma independiente.

| Metrica | Valor declarado |
|---|---|
| mAP@50 (%) | 99,49 |
| mAP@50-95 (%) | 0,00 en el model-index; 82,67 en la tabla de la model card (contradicción) |
| Precision (%) | 96,71 |
| Recall (%) | 99,33 |
| F1 Score (%) | 65,31 |
| Mejor época | 49 / 50 |

Rendimiento por clase en validación:

| Clase | AP@50 | Precision | Recall | F1 |
|---|---|---|---|---|
| `Sofa` | 99,50 % | 94,42 % | 100,00 % | 97,13 % |
| `Table` | 99,46 % | 99,78 % | 97,83 % | 98,79 % |
| `Chair` | 0,00 % | 0,00 % | 0,00 % | 0,00 % |

No se han publicado resultados comparativos con otros modelos en la información disponible. Las métricas presentan inconsistencias internas (mAP@50-95 contradictorio entre secciones y F1 global del 65,31 % incoherente con las precisiones y recalls por clase), por lo que deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los pesos (18,5 MB) y la resolución de entrada (640 × 640), la huella es muy reducida, del orden de cientos de MB incluyendo activaciones y buffers.
- GPU recomendadas: cualquier GPU moderna es suficiente; el autor cita NVIDIA H200 y A100 para el entrenamiento, pero para inferencia bastan GPUs de gama baja.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual (por ejemplo, RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU y aceleradores de borde.
- Opciones de despliegue: `ultralytics` en Python, exportación a ONNX Runtime, TensorFlow Lite para móviles y dispositivos embebidos; no se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de objetos).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Resolución | mAP@50 | Licencia | Formatos |
|---|---|---|---|---|---|---|
| `yolo26s-indoor-furniture-detection-tr` | YOLO26 Small | 3 (Sofa, Table, Chair) | 640 × 640 | 99,49 % (declarado) | CC BY 4.0 | PyTorch, ONNX, TFLite |
| YOLOv8n / YOLO11n (Ultralytics, genéricos) | YOLO nano | 80 (COCO) | 640 × 640 | no disponible en esta ficha | AGPL-3.0 | PyTorch, ONNX, TFLite |
| Detectores específicos de mobiliario indoor | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos verificables con alternativas de la misma categoría en la información proporcionada; la comparación con los modelos genéricos de Ultralytics es cualitativa (mismo framework, distinto dominio y número de clases).

## Limitaciones y advertencias

- La clase `Chair` obtiene AP@50 = 0,00 % en validación: el modelo no detecta sillas de forma fiable pese a que la model card lo presenta como una de sus tres clases.
- Inconsistencia interna de métricas: el mAP@50-95 figura como 0,00 en el `model-index` y como 82,67 en la tabla de la model card; el F1 global (65,31 %) no cuadra con las precisiones y recalls por clase. Las métricas no están verificadas (`verified: false`).
- Entrenamiento extremadamente corto (0,056 GPU-horas, 50 épocas): riesgo alto de sobreajuste al dataset concreto y baja generalización a otras escenas, iluminaciones o ángulos.
- Dominio muy restringido: solo tres clases de mobiliario de interior; no detecta otros objetos domésticos ni personas.
- Riesgo de falsos positivos y negativos fuera de la distribución de entrenamiento; se recomienda validar con imágenes propias antes de desplegar.
- Licencia de los pesos CC BY 4.0, pero el framework Ultralytics que los generó es AGPL-3.0; el uso comercial de los pesos puede requerir revisión legal sobre la licencia del framework subyacente.
- Sin información sobre sesgos demográficos o geográficos del dataset de entrenamiento; al ser un dataset turco, puede no representar bien estilos de mobiliario de otras regiones.
- No se documentan procesos de RLHF, DPO ni ajuste por preferencias (no aplicables a un detector, pero relevantes para contextualizar la ausencia de alineación).
- Sin soporte documentado de cuantización más allá de las exportaciones ONNX/TFLite; la latencia real en hardware de borde no está medida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kenantabak/yolo26s-indoor-furniture-detection-tr
- Página del modelo en EVREN: https://evren.ssyz.org.tr/models/u19979974710e/ic-mekan-mobilya-tespiti
- Dataset de entrenamiento en EVREN: https://evren.ssyz.org.tr/datasets/u19979974710e/ic-mekan-sandalye-koltuk-ve-masa-mobilya-tespiti-3-sinif
- Perfil del autor en EVREN: https://evren.ssyz.org.tr/profile/u19979974710e
- Catálogo de datasets de visión por computador en turco: https://huggingface.co/datasets/kenantabak/evren-turkish-computer-vision-316-datasets
- Framework Ultralytics (YOLO): https://github.com/ultralytics/ultralytics
