# sanjeevafk/glasseye-yolo-bfdd-cubit-v1

## Resumen

`glasseye-yolo-bfdd-cubit-v1` es un modelo de detección de objetos basado en YOLOv8n, desarrollado por el autor `sanjeevafk` como parte del pipeline de inspección de fachadas **GlassEye**. El modelo está fine-tuneado para detectar defectos superficiales y estructurales en fachadas de edificios a partir de imágenes reales, unificando dos conjuntos de datos: **BFDD** (Building Façade Defect Dataset) y **CUBIT** (Concrete Ultrasound / Building Inspection dataset), bajo una única clase binaria `defect`.

Con solo 3,2 millones de parámetros y un checkpoint de 6,2 MB, el modelo está diseñado para ser ligero y desplegable en entornos con recursos limitados, como drones o sistemas de inspección en tiempo real. Su arquitectura YOLOv8n permite una detección rápida a una resolución de entrada de 320×320 píxeles. Aunque los resultados de detección son modestos (mAP@50 de 0,151 en el conjunto de prueba BFDD), el modelo representa una mejora significativa respecto a sus predecesores dentro del mismo proyecto, lo que lo convierte en una base útil para futuras iteraciones.

El modelo se publica bajo licencia MIT, lo que facilita su uso comercial y académico. Su integración en el pipeline GlassEye, que incluye proyección de paneles, registro de eventos y segundas opiniones mediante un VLM, lo posiciona como un componente práctico para aplicaciones de ciudades inteligentes y mantenimiento de infraestructuras.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (Ultralytics) |
| Parametros totales | 3,2 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | PyTorch (best.pt) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLOv8n (You Only Look Once, versión nano) de Ultralytics, un detector de objetos de una sola pasada que utiliza una red troncal CSPDarknet y un cuello PANet, con una cabeza de detección anclada. Con 3,2 millones de parámetros, es la variante más ligera de la familia YOLOv8, optimizada para inferencia rápida en dispositivos con recursos limitados.

El entrenamiento se realizó sobre un conjunto de datos combinado de 1.299 imágenes de entrenamiento (600 de BFDD y 699 de CUBIT), con 89 imágenes de validación y 850 de prueba. Se utilizó el optimizador AdamW durante 32 épocas, con un tamaño de lote de 4 y una resolución de entrada de 320×320 píxeles. Las aumentaciones aplicadas incluyen volteo horizontal (probabilidad 0,5), ajustes de tono/saturación/valor HSV y mosaico desactivado. El entrenamiento fue determinista con semilla fija (`20260815`). No se menciona el uso de técnicas de alineación como RLHF o DPO, ya que se trata de un modelo de visión.

## Capacidades

- Detección de defectos en fachadas de edificios: identifica una única clase binaria `defect`, que abarca defectos superficiales y estructurales.
- Procesamiento de imágenes de alta resolución a 320×320 píxeles, adecuado para capturas de drones o cámaras de inspección.
- Inferencia rápida gracias a la arquitectura YOLOv8n, apta para aplicaciones en tiempo real.
- Integración con el ecosistema Ultralytics: compatible con Python y CLI para predicción, entrenamiento y exportación.
- Capacidad de procesamiento por lotes y de vídeo mediante la API de Ultralytics.
- Sin soporte para tool calling, agentes o razonamiento multi-paso, al ser un modelo puramente visual.

## Casos de uso

- Inspección automatizada de fachadas: el modelo puede analizar imágenes de edificios capturadas por drones o cámaras para detectar grietas, desconchones o daños estructurales, reduciendo la necesidad de inspección manual.
- Mantenimiento predictivo de infraestructuras: integrado en un pipeline como GlassEye, permite programar reparaciones antes de que los defectos se agraven, mejorando la seguridad y reduciendo costes.
- Auditoría de calidad en construcción: durante o después de la obra, el modelo puede verificar que las superficies cumplan los estándares de calidad, detectando defectos visibles en fotografías.
- Vigilancia de ciudades inteligentes: al ser ligero, puede desplegarse en cámaras fijas o dispositivos edge para monitorizar continuamente el estado de los edificios públicos.
- Documentación de daños para seguros: las detecciones pueden usarse para generar informes objetivos de daños en fachadas, útiles para reclamaciones de seguros o disputas legales.
- Investigación en detección de defectos: sirve como punto de partida para experimentos con arquitecturas más grandes o técnicas de aumentación de datos, dado su pequeño tamaño y licencia permisiva.

## Benchmarks y rendimiento

Los resultados presentados a continuación son los declarados por el autor en la model card y el model-index. Se evaluó el modelo en tres conjuntos de prueba independientes, con umbral IoU=0,50, confianza=0,20 e imgsz=320.

### Conjunto BFDD Held-Out (149 imágenes, 1.033 cajas reales)

| Model Checkpoint | mAP@50 | mAP@50-95 | Recall |
|---|---|---|---|
| Synthetic Baseline (`glasseye-yolo-v1`) | 0,0131 | 0,0099 | 0,0165 |
| BFDD-only (`glasseye-yolo-real-bfdd-v1`) | 0,0940 | 0,0429 | 0,1413 |
| **BFDD + CUBIT (`glasseye-yolo-bfdd-cubit-v1`)** | **0,1512** | **0,0707** | **0,2014** |

### Conjunto CUBIT Test (701 imágenes, 5.085 cajas derivadas)

| Model Checkpoint | Full Test mAP@50 | Full Test Recall | Far-Subset mAP@50 (≥10 frames dist) |
|---|---|---|---|
| Synthetic Baseline | 0,0031 | 0,0069 | 0,0000 |
| BFDD-only | 0,0211 | 0,0350 | 0,0164 |
| **BFDD + CUBIT** | **0,1990** | **0,2061** | **0,1279** |

### Conjunto UAV2K Test (200 imágenes aéreas, 527 cajas derivadas)

| Model Checkpoint | mAP@50 | Recall | True Positives |
|---|---|---|---|
| Synthetic Baseline | 0,0000 | 0,0000 | 0 |
| BFDD-only | 0,0000 | 0,0000 | 0 |
| **BFDD + CUBIT** | **0,0132** | **0,0133** | 7 |

El modelo muestra una mejora relativa del +60,8% en mAP@50 y +42,5% en Recall sobre el checkpoint BFDD-only en el conjunto BFDD Held-Out. Sin embargo, su rendimiento en imágenes aéreas fuera de dominio (UAV2K) es casi nulo, lo que indica limitaciones de generalización.

## Requisitos de hardware

- Al ser un modelo YOLOv8n con solo 3,2 millones de parámetros, la VRAM necesaria para inferencia es mínima: menos de 1 GB en FP32, y aún menor en cuantizaciones de 8 bits (aunque no se proporcionan pesos cuantizados oficialmente).
- Puede ejecutarse en GPUs de consumo como la NVIDIA GTX 1060, RTX 2060 o superiores, así como en GPUs integradas de portátiles modernos.
- También es viable la inferencia en CPU, con tiempos de procesamiento de decenas de milisegundos por imagen a 320×320 píxeles.
- Opciones de despliegue: compatible con Ultralytics (Python y CLI), y puede exportarse a formatos como ONNX, TensorRT o CoreML para entornos edge.
- Para despliegues en producción, se recomienda usar servidores de inferencia como vLLM o TGI, aunque no son necesarios dado el pequeño tamaño del modelo.

## Comparativa con modelos similares

Dentro del mismo proyecto GlassEye, se comparan tres checkpoints: el baseline sintético, el modelo entrenado solo con BFDD y el modelo combinado BFDD+CUBIT. Esta comparativa ya se muestra en la sección de benchmarks. Fuera de este proyecto, no se dispone de datos de otros modelos de detección de defectos en fachadas con los que comparar directamente. Modelos genéricos de detección de objetos como YOLOv8m o YOLOv8l podrían ofrecer mayor precisión, pero a costa de mayor coste computacional; sin embargo, no se han evaluado en los mismos conjuntos de datos.

## Limitaciones y advertencias

- Rendimiento bajo en términos absolutos: el mAP@50 de 0,151 en BFDD Held-Out indica que el modelo solo detecta correctamente una fracción de los defectos, lo que lo hace inadecuado para uso en producción sin un entrenamiento adicional o ajuste fino.
- Generalización limitada: en imágenes aéreas de alta resolución (UAV2K), el modelo casi no detecta defectos (mAP@50 de 0,0132), lo que sugiere que no es robusto ante cambios de dominio, escala o condiciones de captura.
- Dependencia de la resolución de entrada: el modelo está entrenado a 320×320 píxeles; el uso de resoluciones mayores puede degradar el rendimiento si no se reentrena.
- Clase única binaria: al agrupar todos los defectos en una sola clase, no diferencia entre tipos de daño (grietas, corrosión, etc.), lo que limita su utilidad para diagnósticos detallados.
- Datos de entrenamiento limitados: con solo 1.299 imágenes de entrenamiento, el modelo puede sufrir sobreajuste y no capturar la variabilidad real de las fachadas.
- Sin información sobre cuantización ni formatos optimizados: no se proporcionan pesos cuantizados, lo que puede dificultar su despliegue en dispositivos muy restringidos.
- El repositorio muestra 0 descargas y 0 likes, lo que indica que es un modelo reciente y poco validado por la comunidad.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/sanjeevafk/glasseye-yolo-bfdd-cubit-v1)
- [Repositorio de origen del proyecto GlassEye](https://github.com/sanjeevafk/glasseye)
- [Aplicación live de GlassEye](https://glasseye-td75.onrender.com)
