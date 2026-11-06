# Ambarella/YOLOX

## Resumen

YOLOX es un detector de objetos de una sola etapa (one-stage) desarrollado originalmente por Megvii-BaseDetection y publicado en 2021. Este repositorio de Hugging Face, mantenido por Ambarella, distribuye pesos del modelo YOLOX-S (variante "Small") compilados y optimizados para los aceleradores de visión (CVflow) de Ambarella, no los pesos originales en PyTorch entrenables. El modelo resuelve el problema de detección de objetos en tiempo real sobre imágenes de resolución 3x640x640, con un diseño anchor-free y cabezas de clasificación y regresión desacopladas que mejoran la precisión y la velocidad de convergencia respecto a generaciones anteriores de YOLO.

La relevancia de este repositorio es práctica: ofrece artefactos binarios listos para desplegar en hardware de borde de Ambarella (SoCs N1-655, X7, CV7, CV72 y CV75), lo que permite integrar detección de objetos en cámaras IP, sistemas de videovigilancia y robótica con latencia baja. No se trata de un modelo de lenguaje ni de un modelo fundacional multimodal: es un detector convolucional clásico de visión por computador.

Dado que la model card no incluye información sobre parámetros totales, licencia explícita ni composición detallada del entrenamiento más allá del dataset COCO 2017, varios campos de esta ficha se marcan como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN one-stage, anchor-free, con cabezas desacopladas de clasificación y regresión (YOLOX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 3x640x640) |
| Tipos de cuantización | no disponible (se distribuyen binarios optimizados para hardware Ambarella: "Amba_optimized" y "Activation_fp16") |
| Idiomas soportados | no aplica (visión; clases de COCO en inglés) |
| Licencia | no disponible |
| Formato de pesos | binarios `.bin` para SoCs Ambarella; pesos originales PyTorch referenciados externamente (`yolox_s.pth`) |

## Arquitectura y entrenamiento

YOLOX-S es un detector convolucional de una etapa con diseño anchor-free: elimina las anchors predefinidas y predice directamente los objetos, lo que simplifica el diseño y reduce el número de hiperparámetros. Incorpora cabezas desacopladas (decoupled heads) para clasificación y regresión, una innovación que mejora la convergencia y la precisión final. La entrada es de 640x640 píxeles con 3 canales.

El entrenamiento se realizó sobre el dataset COCO 2017 según la model card. No se especifican el número de tokens (no aplica), el número de imágenes de entrenamiento, la composición del dataset, ni si hubo etapas de refinamiento adicionales. Los artefactos publicados en este repositorio no son los pesos entrenables, sino compilaciones optimizadas para el hardware de Ambarella (versiones "Amba_optimized" y "Activation_fp16"), generadas con Cooper SDK 2.5.4 y Cooper Foundry 2.3.

## Capacidades

- Detección de objetos en imágenes RGB de resolución 640x640 sobre las 80 clases del dataset COCO.
- Inferencia en tiempo real orientada a despliegue en borde (edge), con variantes optimizadas por SoC.
- Localización con bounding boxes y clasificación con puntuaciones de confianza por clase.
- Diseño anchor-free que simplifica el post-procesado frente a detectores basados en anchors.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingües, de visión-lenguaje, audio ni modo "thinking".
- No incluye segmentación de instancias ni estimación de pose; es exclusivamente detección de cajas.

## Casos de uso

- Videovigilancia en cámaras IP con SoC Ambarella: el modelo compilado para CV72/CV75 permite ejecutar detección de personas y vehículos en el propio dispositivo, sin enviar vídeo a la nube, reduciendo latencia y ancho de banda.
- Analítica de vídeo en tiempo real: conteo de personas, detección de intrusiones en perímetros o control de aforo, aprovechando la variante Small para mantener tasas de fotogramas altas en hardware de bajo consumo.
- Robótica y vehículos autónomos ligeros: detección de obstáculos y objetos relevantes en el entorno a partir de flujos de cámara, con la ventaja de que el binario está optimizado para el acelerador de visión integrado.
- Sistemas de alerta en retail: detección de productos o carros en pasillos mediante cámaras con SoC Ambarella, integrando el detector en pipelines de analítica existentes.
- Drones y dispositivos IoT con cámara: al ser una variante "Small", encaja en plataformas con restricciones de potencia y memoria, permitiendo detección a bordo.
- Prototipado y evaluación de despliegue en hardware Ambarella: los binarios "Amba_optimized" y "Activation_fp16" permiten comparar el impacto de la compresión en precisión y latencia antes de fijar una configuración de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de mAP, latencia ni throughput para las variantes compiladas en N1-655, X7, CV7, CV72 o CV75.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo está pensado para aceleradores integrados (NPU/ISP de Ambarella), no para GPU de escritorio.
- GPU recomendadas: no aplica para los binarios publicados; para ejecutar los pesos originales YOLOX-S en PyTorch se requiere una GPU CUDA convencional (por ejemplo, RTX 3090/4090 o A100), pero no se documenta en este repositorio.
- Cabe en GPU de consumo: los pesos originales YOLOX-S son ligeros y caben en GPUs de consumo, pero este repositorio no distribuye dichos pesos, solo binarios para SoC Ambarella.
- Opciones de despliegue: Cooper SDK 2.5.4 y Cooper Foundry 2.3 para los binarios `.bin`; para los pesos PyTorch originales, el repositorio oficial de Megvii (no incluido aquí) y frameworks de inferencia estándar.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Familia | Enfoque | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOX-S (este repo) | YOLOX | Anchor-free, one-stage | 3x640x640 | no disponible | Binarios para SoC Ambarella |
| YOLOX-S (original Megvii) | YOLOX | Anchor-free, one-stage | 3x640x640 | Apache 2.0 (según repo original) | Pesos PyTorch en GitHub |
| YOLOv5s | YOLOv5 | Anchor-based, one-stage | 640x640 | GPL-3.0 (repo original) | Pesos PyTorch en GitHub |
| YOLOv8n | Ultralytics | Anchor-free, one-stage | 640x640 | AGPL-3.0 (repo original) | Pesos PyTorch en GitHub |

No se dispone de datos de rendimiento comparativo (mAP, latencia) en la información proporcionada para esta ficha.

## Limitaciones y advertencias

- La licencia no está declarada en la model card; antes de uso comercial es imprescindible verificar los términos con Ambarella y con el proyecto original YOLOX.
- Los artefactos publicados son binarios compilados para hardware Ambarella concreto; no son portables a otras plataformas sin recompilación.
- El modelo detecta únicamente las 80 clases de COCO 2017; no cubre clases personalizadas sin reentrenamiento.
- No hay información sobre sesgos del dataset COCO (por ejemplo, desequilibrios demográficos o geográficos) en la model card.
- Riesgo de falsos positivos y negativos inherente a detectores de una etapa en escenas con oclusiones, objetos pequeños o condiciones de iluminación adversas; no se documentan métricas de robustez.
- No apto para tareas de lenguaje, razonamiento, generación de texto ni interacción conversacional.
- El repositorio tiene muy pocas descargas y likes (10 y 0 respectivamente), lo que sugiere escasa validación comunitaria; conviene verificar los binarios antes de integrarlos en producción.
- Las versiones "Amba_optimized" pueden implicar cambios de precisión respecto a los pesos originales; no se documenta la degradación esperada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ambarella/YOLOX
- Paper original YOLOX: https://arxiv.org/abs/2107.08430
- Implementación de referencia (Megvii): https://github.com/Megvii-BaseDetection/YOLOX
- Pesos originales YOLOX-S: https://github.com/Megvii-BaseDetection/YOLOX/releases/download/0.1.1rc0/yolox_s.pth
- Dataset COCO: https://cocodataset.org/#home
