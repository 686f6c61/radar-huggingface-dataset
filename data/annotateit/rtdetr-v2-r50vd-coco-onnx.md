# AnnotateIt/rtdetr-v2-r50vd-coco-onnx

## Resumen

RT-DETRv2 es un modelo de deteccion de objetos en tiempo real basado en transformer, desarrollado por la Universidad de Pekin (PekingU) y presentado en CVPR 2024. Este repositorio concreto es un espejo ONNX verificado por AnnotateIt, identico byte a byte al grafo FP32 publicado por onnx-community, que a su vez deriva del checkpoint oficial `PekingU/rtdetr_v2_r50vd`. El modelo combina un backbone ResNet-50-vd con un encoder híbrido y un decoder transformer, logrando deteccion end-to-end sin necesidad de NMS (supresion de no maximos).

El modelo detecta 80 clases del dataset COCO y acepta imagenes de 640x640 píxeles. Su formato ONNX (opset 16, precision FP32) lo hace portable entre multiples runtimes y plataformas, desde CPU hasta GPUs dedicadas. La relevancia actual de este modelo radica en que ofrece una alternativa a los detectores basados en YOLO con una arquitectura transformer que elimina el post-procesado NMS, simplificando el pipeline de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETRv2 con backbone ResNet-50-vd |
| Parametros totales | Aproximadamente 42-43 millones (estimado a partir del tamano del grafo ONNX de 172 MB en FP32) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | FP32 (unico formato en este repositorio) |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 16) |

## Arquitectura y entrenamiento

RT-DETRv2 sigue la arquitectura Real-Time Detection Transformer: un backbone ResNet-50-vd extrae caracteristicas multiescala, un encoder híbrido (convolucional + transformer) las fusiona, y un decoder transformer realiza la prediccion de conjuntos (set prediction) con consultas aprendidas. La variante v2 incorpora mejoras sobre el RT-DETR original, incluyendo una seleccion de consultas mas eficiente y estrategias de entrenamiento refinadas. El modelo fue entrenado en el dataset COCO con 80 clases y produce directamente 300 predicciones por imagen, eliminando la necesidad de NMS.

El grafo ONNX de este repositorio es una conversion fiel del checkpoint oficial en PyTorch, sin modificaciones ni cuantizacion por parte de AnnotateIt. El preprocesado requerido es: conversion a RGB, redimensionado a 640x640 con estiramiento (sin letterbox), escalado a [0,1] dividiendo entre 255, y sin normalizacion por media/desviacion. Las salidas son logits (300x80) y cajas normalizadas en formato cxcywh (300x4).

## Capacidades

- Deteccion de objetos en tiempo real con 80 clases COCO (personas, vehiculos, animales, objetos cotidianos, etc.)
- Prediccion end-to-end sin NMS: el decoder transformer genera directamente el conjunto de detecciones
- Inferencia en tiempo real: disenado para superar a los detectores YOLO en velocidad y precision
- Formato ONNX portable: compatible con ONNX Runtime, TensorRT, OpenVINO y otros runtimes
- Entrada flexible en batch: el grafo acepta batch de cualquier tamano
- Salida estructurada: logits y cajas normalizadas listas para post-procesado simple

## Casos de uso

- Vigilancia y seguridad perimetral: el modelo puede detectar personas, vehiculos y objetos en tiempo real desde camaras IP, gracias a su latencia baja y su formato ONNX que se integra con pipelines de video como FFmpeg o DeepStream.
- Conteo de personas en espacios publicos: con las clases person y sus cajas normalizadas, se puede implementar conteo en tiempo real en retail, estaciones o eventos, sin necesidad de hardware especializado.
- Inspeccion industrial de piezas: aunque COCO no cubre defectos especificos, el modelo puede detectar objetos anomalos en lineas de produccion y combinarse con un clasificador secundario para control de calidad.
- Robotica y navegacion autonoma: la deteccion de obstaculos (personas, vehiculos, mobiliario) con latencia baja permite a robots moviles evitar colisiones en entornos interiores.
- Agricultura de precision: deteccion de ganado, maquinaria o frutas en imagenes aereas de drones, aprovechando el formato ONNX para desplegar en dispositivos edge como Jetson.
- Analisis de trafico urbano: deteccion de vehiculos, ciclistas y peatones en intersecciones para gestion de semaforos inteligentes o estudios de movilidad.
- Etiquetado automatico de datasets: el modelo puede pre-etiquetar imagenes para acelerar la creacion de datasets de entrenamiento en herramientas como Label Studio o CVAT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del grafo: 172 MB en FP32, lo que requiere aproximadamente 172 MB de VRAM solo para los pesos, mas overhead de activaciones.
- CPU: puede ejecutarse en CPU con ONNX Runtime, con latencias estimadas de 100-500 ms por imagen segun el procesador.
- GPU consumer: cabe en cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, etc.) y alcanza decenas de FPS.
- GPU profesional: en una T4 o RTX 3060 se esperan 50-100+ FPS; en A100 o H100, latencias inferiores a 10 ms.
- Despliegue recomendado: ONNX Runtime (CPU/GPU), TensorRT (NVIDIA), OpenVINO (Intel), o runtimes moviles como ONNX Runtime Mobile.
- El modelo no requiere cuantizacion para funcionar, pero si se necesita mayor velocidad, se puede convertir a FP16 o INT8 con herramientas como onnxruntime quantization.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Enfoque | NMS | Licencia |
|---|---|---|---|---|---|
| RT-DETRv2 r50vd (este) | Transformer + ResNet-50 | ~42M | End-to-end | No | Apache-2.0 |
| YOLOv8m | CNN | ~25.9M | Anchor-free | Si | AGPL-3.0 |
| DETR (ResNet-50) | Transformer + ResNet-50 | ~41M | End-to-end | No | Apache-2.0 |

RT-DETRv2 se posiciona como una alternativa a YOLO con arquitectura transformer, ofreciendo deteccion end-to-end sin NMS. Comparado con DETR original, RT-DETRv2 es significativamente mas rapido gracias a su encoder híbrido y su seleccion de consultas eficiente, manteniendo una precision similar. YOLOv8m es mas ligero pero requiere NMS y tiene licencia AGPL, menos permisiva que Apache-2.0.

## Limitaciones y advertencias

- Solo detecta las 80 clases de COCO; no es extensible sin reentrenamiento.
- El preprocesado con estiramiento (stretch) a 640x640 distorsiona la relacion de aspecto, lo que puede degradar la precision en imagenes muy panoramicas o verticales.
- El grafo ONNX es FP32; no se incluyen versiones cuantizadas en este repositorio.
- No se han publicado benchmarks especificos para este espejo ONNX; el rendimiento puede variar segun el runtime y el hardware.
- Es un espejo no oficial: AnnotateIt no es el autor original del modelo, y no hay garantia de soporte o mantenimiento.
- La salida requiere post-procesado manual (sigmoid sobre logits y conversion de cxcywh a coordenadas absolutas) que no esta incluido en el grafo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AnnotateIt/rtdetr-v2-r50vd-coco-onnx
- Modelo base oficial: https://huggingface.co/PekingU/rtdetr_v2_r50vd
- Espejo ONNX de referencia: https://huggingface.co/onnx-community/rtdetr_v2_r50vd-ONNX
- Proyecto oficial RT-DETR: https://github.com/lyuwenyu/RT-DETR
- Proyecto RT-DETRv2: https://github.com/zheli-hub/RT-DETRv2
