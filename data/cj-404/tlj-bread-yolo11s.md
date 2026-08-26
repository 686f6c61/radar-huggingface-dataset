# cj-404/tlj-bread-yolo11s

## Resumen

El modelo `cj-404/tlj-bread-yolo11s` es un detector de objetos basado en Ultralytics YOLO11s, entrenado para identificar seis tipos de pan en fotografías de bandejas de la panadería Tous les Jours (TLJ). Ha sido desarrollado por el usuario `cj-404` como proyecto final del CJ AI Campus (Corea del Sur). El problema que resuelve es la clasificación y localización de productos de panadería en imágenes de punto de venta, útil para inventario automatizado, análisis de escaparates o aplicaciones de asistencia en caja. Su relevancia radica en que demuestra una aplicación práctica de visión por computador en retail, con un rendimiento muy alto sobre un dataset realista.

El modelo es una adaptación de YOLO11s, la variante pequeña de la familia YOLO11 de Ultralytics. Está entrenado sobre un dataset de Roboflow compuesto por 629 imágenes originales (ampliadas a 900 de entrenamiento, 86 de validación y 43 de test) con seis clases de pan. La arquitectura es la estándar de YOLO11, con backbone y head de detección, y el entrenamiento se realizó con transfer learning durante 100 épocas a resolución de 640 píxeles. El modelo se distribuye en formato PyTorch (`best.pt`) bajo licencia MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv11s (Ultralytics) |
| Parametros totales | no disponible (la variante YOLO11s del repositorio oficial tiene ~9.4 M, pero no se confirma en la ficha) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de detección de objetos, no de texto) |
| Tipos de cuantizacion | no disponible (no se menciona en la documentación; se puede exportar a FP16/INT8 mediante Ultralytics) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best.pt`) |

## Arquitectura y entrenamiento

YOLOv11s es la variante "small" de la familia YOLO11, que utiliza una arquitectura de detección de una sola pasada (one-stage) con backbone basado en convoluciones, cuello de cuello (neck) y cabezas de detección ancladas en múltiples escalas. El modelo ha sido entrenado mediante transfer learning sobre pesos preentrenados de YOLO11s, con 100 épocas y un tamaño de entrada de 640x640 píxeles. El dataset procede de Roboflow (proyecto `tlj-bread-6class`), que contiene 429 imágenes originales que se ampliaron mediante técnicas de aumento de datos hasta alcanzar 900 imágenes de entrenamiento, 86 de validación y 43 de prueba. La división se hizo por grupos de ráfagas (burst-shot) para minimizar la fuga de datos entre los conjuntos. No se detalla si se usó alguna técnica de entrenamiento adicional como aumentación específica o ajuste de hiperparámetros.

## Capacidades

- Detección de objetos en imágenes: localiza y clasifica seis tipos de pan en fotografías de bandejas.
- Clases soportadas: `choco_swirl_bread`, `kimchi_croquette`, `olive_bagel`, `red_bean_bun`, `strawberry_donut`, `twist_donut`.
- Inferencia en tiempo real: el modelo procesa una imagen en aproximadamente 11.7 ms en una GPU A100 (según datos del autor).
- Integración sencilla con el ecosistema Ultralytics: permite exportar a ONNX, TensorRT, CoreML, TFLite y otros formatos mediante la API de Ultralytics.
- No soporta tool calling, agentes ni razonamiento multietapa, al ser un modelo exclusivamente de visión.
- Capacidades multilingües: no aplicable.

## Casos de uso

- Control de inventario en panaderías: el modelo puede analizar fotografías de bandejas y contar cuántas unidades de cada tipo de pan quedan, facilitando la reposición automática. Su alta precisión (99% en recall) lo hace fiable para este fin.
- Verificación de pedidos en tiendas: al recibir mercancía, se puede tomar una foto de la bandeja y comparar el contenido con el pedido esperado, detectando faltantes o excedentes.
- Análisis de escaparates en retail: integrado en una cámara fija, el modelo puede monitorizar la disponibilidad de productos en exposición y alertar cuando un tipo de pan se agota.
- Aplicaciones móviles de reconocimiento de alimentos: el usuario puede fotografiar su bandeja y el modelo identifica los productos, útil para aplicaciones de nutrición o de seguimiento de compras.
- Automatización de cajas autoservicio: combinado con una cámara, el modelo puede reconocer los productos que el cliente coloca en la bandeja y añadirlos automáticamente al ticket de compra.
- Entrenamiento de modelos de recomendación: los resultados de detección se pueden usar como entrada para sistemas que sugieren productos complementarios en función de la selección del cliente.

## Benchmarks y rendimiento

Según la model card, los resultados en el conjunto de test (43 imágenes, 237 objetos) son los siguientes:

| Métrica | Valor |
|---|---|
| mAP@0.5:0.95 | 95.6% |
| mAP@0.5 | 98.6% |
| Precision | 99.0% |
| Recall | 99.3% |
| Tiempo de inferencia (A100, imagen individual) | ~11.7 ms |

No se proporcionan comparaciones con otros modelos de detección de objetos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un modelo pequeño (YOLO11s, ~9.4M de parámetros), la inferencia puede ejecutarse en GPUs con al menos 2 GB de VRAM en FP16, aunque no se especifica oficialmente.
- GPU recomendada: para el tiempo de inferencia reportado (11.7 ms) se usó una NVIDIA A100. En una GPU de consumo como RTX 3060 o RTX 4090, el rendimiento será suficiente para aplicaciones en tiempo real (típicamente 20-40 ms por imagen).
- Compatibilidad con GPU de consumo: sí, la arquitectura YOLO11s es ligera y cabe en GPUs de gama media (RTX 3060, RTX 4060, etc.) con cuantización FP16 o INT8.
- Opciones de despliegue: se puede usar con la librería Ultralytics (Python), exportar a ONNX, TensorRT, CoreML, TFLite para dispositivos móviles, o integrar con plataformas como vLLM (no aplicable) o servidores de inferencia como TorchServe.
- Latencia estimada: ~11.7 ms por imagen en una A100; en hardware de consumo puede ser de 20-40 ms.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación proporcionada. No se puede realizar una comparación objetiva con otros modelos de detección de objetos (por ejemplo, YOLOv8s o Faster R-CNN) sin datos de rendimiento sobre el mismo conjunto de datos. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- El modelo está entrenado únicamente con 6 clases de pan específicas de la marca TLJ; no es generalizable a otros productos de panadería o a otros tipos de pan.
- El rendimiento se reporta sobre un conjunto de pruebas pequeño (43 imágenes), por lo que la precisión podría variar en condiciones reales de iluminación, ángulo o fondo.
- No se ha evaluado el modelo en situaciones de oclusión, imágenes borrosas o condiciones de luz adversas; su robustez en entornos no controlados es incierta.
- La licencia MIT permite uso comercial y modificación, pero no se especifican restricciones sobre los datos de entrenamiento (que provienen de Roboflow, posiblemente con licencias propias).
- No se incluyen datos sobre el sesgo del modelo; al ser un proyecto académico, no se ha realizado una auditoría de sesgos.
- Para producción, se recomienda validar el modelo con un conjunto de datos más amplio y representativo del entorno de despliegue real.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/cj-404/tlj-bread-yolo11s
- Repositorio oficial de Ultralytics YOLO11: https://github.com/ultralytics/yolo11
- Documentación de integraciones de Ultralytics (exportación a ONNX, TensorRT, etc.): https://docs.ultralytics.com/integrations/
