# Advantech-EIOT/AMD_yolox-s_640x640_A8W8

## Resumen

YOLOX-s es un detector de objetos anchor-free desarrollado por Megvii y publicado en 2021 junto con el artículo "YOLOX: Exceeding YOLO Series in 2021". Este repositorio de Advantech-EIOT no entrena ni modifica los pesos: redistribuye los pesos oficiales `yolox_s.pth` de Megvii exportados a ONNX en precisión FP32, con entrada fija de 640x640 y batch 1, para su uso en la plataforma AMD VisionAI (NPU de los procesadores AMD Ryzen AI).

El modelo resuelve detección de objetos en 80 clases del dataset COCO. La exportación mantiene dentro del grafo la decodificación de YOLOX (rejillas y strides) y entrega una salida única `[1, 84, 8400]` con cajas en píxeles de entrada y puntuaciones de clase ya multiplicadas por la objectness. No incluye NMS, que debe aplicarse en el postprocesado.

Es relevante para desarrolladores que despliegan visión por computador en hardware AMD Ryzen AI: el repositorio hermano con la versión INT8 (A8W8) es el que consume la NPU, mientras que esta variante FP32 sirve como referencia de CPU e iGPU en la placa P100 de AMD. La licencia Apache-2.0 y el tamaño reducido de YOLOX-s lo hacen adecuado para inferencia en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOX-s (detector anchor-free, backbone CSPDarknet con cuello PAN y cabeza desacoplada) |
| Parametros totales | no disponible (YOLOX-s es el modelo "small" de la familia; el recuento exacto no figura en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 1x3x640x640) |
| Tipos de cuantizacion | FP32 (este repositorio); existe version INT8 A8W8 en repositorio hermano |
| Idiomas soportados | no aplica (modelo de vision; etiquetas de clase en ingles, 80 clases COCO) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, batch 1, 640x640, sin NMS); incluye `SHA256SUMS` y `LICENSE` |

## Arquitectura y entrenamiento

YOLOX-s es un detector de una etapa con arquitectura anchor-free: elimina las anclas del diseño original de YOLO y predice directamente centro, tamaño y clase por celda, con una cabeza desacoplada que separa la rama de clasificación de la de regresión. El backbone es CSPDarknet y el cuello es un PAN. La entrada es una imagen NCHW en formato BGR, rango 0-255 y sin normalizar.

El entrenamiento corresponde a Megvii: pesos oficiales `yolox_s.pth` entrenados sobre COCO (80 clases). Advantech no ha reentrenado ni cuantizado este repositorio; solo ha exportado desde el árbol fuente de YOLOX (rama main, 2026-11-19) manteniendo la decodificación de rejillas y strides dentro del grafo. La salida se verificó contra el `yolox_s.onnx` oficial de Megvii tras su decodificación, con una diferencia máxima de caja de 0,0013 px. No se reclama una reevaluación de precisión para esta conversión. No se dispone de información sobre el número exacto de tokens de entrenamiento, composición del dataset más allá de COCO, ni sobre uso de RLHF/DPO (no aplica a un detector).

## Capacidades

- Detección de objetos en 80 clases del dataset COCO (persona, vehículo, animales, objetos cotidianos, etc.).
- Salida única `[1, 84, 8400]`: 4 valores de caja (`cx, cy, w, h` en píxeles de entrada) más 80 puntuaciones de clase, donde la puntuación es objectness × probabilidad de clase.
- Decodificación de rejillas y strides integrada en el modelo; el consumidor solo debe aplicar NMS.
- Nombres de clase COCO almacenados en los metadatos del modelo (campo `names`).
- Inferencia en CPU e iGPU de la plataforma AMD P100 (variante FP32) y en NPU con la variante INT8 A8W8.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de una sola pasada.

## Casos de uso

- **Vigilancia y control de accesos**: detección de personas y vehículos en flujos de cámara en tiempo real sobre dispositivos AMD Ryzen AI, usando la variante INT8 en NPU para minimizar consumo y latencia.
- **Analítica de retail**: conteo de personas y detección de productos u objetos en estanterías, aprovechando las 80 clases COCO y el bajo coste de inferencia de un modelo "small".
- **Inspección industrial en el borde**: localización de objetos y componentes en líneas de producción con entrada fija 640x640, desplegando el ONNX FP32 en CPU/iGPU cuando no se requiere cuantización.
- **Sistemas de asistencia a la conducción (ADAS ligero)**: detección de peatones, vehículos y señales de tráfico en tiempo real; la salida sin NMS permite ajustar el umbral de confianza en el postprocesado según el escenario.
- **Robótica móvil y drones**: percepción de obstáculos y objetos en plataformas con recursos limitados, donde el tamaño reducido de YOLOX-s y la exportación batch 1 simplifican el despliegue.
- **Prototipado y validación de pipelines**: usar la variante FP32 como referencia de precisión frente a la INT8 A8W8 para medir la pérdida de exactitud tras la cuantización antes de pasar a producción.
- **Procesamiento de vídeo por lotes**: análisis de grabaciones para indexar o etiquetar contenido, ejecutando el ONNX con ONNX Runtime en servidores con CPU o GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (mAP) ni de latencia para esta conversión; solo se documenta la verificación numérica frente al ONNX oficial (diferencia máxima de caja de 0,0013 px) y se indica explícitamente que no se reclama reevaluación de precisión.

## Requisitos de hardware

- **VRAM/RAM estimada**: no disponible de forma explícita; por el tamaño del repositorio (0,0 GB) y la naturaleza de YOLOX-s, el modelo es muy ligero y cabe holgadamente en memoria de dispositivos integrados, aunque no se proporcionan cifras concretas.
- **GPU recomendadas**: no se especifican; el modelo está orientado a la plataforma AMD P100 (CPU/iGPU) y a la NPU de AMD Ryzen AI con la variante INT8.
- **Consumer GPU**: no hay datos de compatibilidad ni de rendimiento en GPUs de consumo (RTX 4090, etc.) en la información disponible.
- **Opciones de despliegue**: ONNX Runtime (formato nativo del repositorio), así como cualquier runtime compatible con ONNX (por ejemplo, los provistos por AMD para Ryzen AI). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector visual.
- **Latencia y throughput**: no disponibles; no se publican cifras de FPS ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOX-s (este repositorio) | no disponible (familia "small") | 640x640, batch 1 | no disponible (sin reevaluación) | Apache-2.0 | ONNX FP32 e INT8 A8W8 en Hugging Face |
| YOLOX-m / YOLOX-l / YOLOX-x | mayores que YOLOX-s (cifras no disponibles) | 640x640 | no disponible | Apache-2.0 | Pesos oficiales en el repositorio de Megvii |
| Otros detectores anchor-free de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- **Sin NMS incluido**: el modelo entrega 8400 predicciones crudas; es obligatorio aplicar supresión de no máximos en el postprocesado para obtener detecciones útiles.
- **Entrada fija**: 640x640, batch 1, BGR, rango 0-255 y sin normalizar; cualquier otra configuración requiere reexportar el modelo.
- **Sesgos del dataset**: entrenado solo sobre COCO, cuyas imágenes provienen de Flickr con licencias variadas; puede presentar sesgos de representación y rendimiento desigual en dominios no cubiertos (clases fuera de las 80 de COCO, condiciones de iluminación extremas, etc.).
- **Riesgo de falsos positivos y negativos**: la puntuación es objectness × probabilidad de clase; el umbral debe calibrarse por caso de uso.
- **Sin reevaluación de precisión**: la conversión no ha sido validada con métricas de mAP; la única verificación es la comparación numérica con el ONNX oficial.
- **Licencia**: Apache-2.0 permite uso comercial, pero las imágenes de COCO tienen licencias heterogéneas; conviene revisar las condiciones de los datos si se redistribuyen.
- **No es un modelo generativo**: no soporta texto, tool calling, agentes ni multilingüismo; cualquier expectativa en ese sentido es incorrecta.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Advantech-EIOT/AMD_yolox-s_640x640_A8W8)
- [Repositorio YOLOX (Megvii)](https://github.com/Megvii-BaseDetection/YOLOX)
- [Artículo YOLOX (arXiv:2107.08430)](https://arxiv.org/abs/2107.08430)
- [Pesos oficiales `yolox_s.pth`](https://github.com/Megvii-BaseDetection/YOLOX/releases/download/0.1.1rc0/yolox_s.pth)
- [Licencia YOLOX](https://github.com/Megvii-BaseDetection/YOLOX/blob/main/LICENSE)
