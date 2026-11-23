# Advantech-EIOT/AMD_yolox-pose-m_640x640_FP32

## Resumen

YOLOX-s es un detector de objetos anchor-free desarrollado originalmente por Megvii y publicado con licencia Apache-2.0. Este repositorio, mantenido por Advantech-EIOT, distribuye los pesos oficiales `yolox_s.pth` convertidos a un único fichero ONNX en precisión FP32, con entrada fija de 640x640 y batch 1, pensado para su despliegue en plataformas AMD Ryzen AI y en el ecosistema VisionAI de Advantech. Advantech no ha reentrenado ni cuantizado el modelo: la conversión preserva los pesos originales y solo reorganiza la salida.

La relevancia de esta ficha es practica: se trata de un artefacto de despliegue, no de un modelo nuevo. El interés esta en su interfaz ONNX bien definida (opset 17, salida `[1, 84, 8400]` con decodificacion de rejillas y strides incluida en el grafo, sin NMS), lo que simplifica la integracion en pipelines de inferencia sobre CPU y NPU. El modelo detecta las 80 clases de COCO y esta pensado para tareas de vision clasica en el borde.

Conviene subrayar que el nombre del repositorio menciona `pose`, pero la model card describe exclusivamente un detector de objetos YOLOX-s sin rama de pose ni keypoints. La informacion disponible no permite confirmar ninguna capacidad de estimacion de pose.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOX-s (detector anchor-free, CNN, con decodificacion de rejillas y strides embebida en el grafo ONNX) |
| Parametros totales | no disponible (YOLOX-s es la variante pequena de la familia YOLOX; el numero exacto no se indica en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija `[1, 3, 640, 640]`) |
| Tipos de cuantizacion | solo FP32 en este repositorio; no se distribuyen variantes INT8/FP16 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las etiquetas de clase son las 80 de COCO) |
| Licencia | Apache-2.0 (Copyright (c) 2021-2022 Megvii Inc.) |
| Formato de pesos | ONNX (opset 17), fichero `yolox-s_640x640_fp32.onnx`; se incluye `SHA256SUMS` y `LICENSE` |

Interfaz de entrada/salida:

| Tensor | Tipo | Forma | Descripcion |
|---|---|---|---|
| Entrada `images` | F32 | `[1, 3, 640, 640]` | NCHW, BGR, rango 0-255, sin normalizar |
| Salida `output0` | F32 | `[1, 84, 8400]` | `cx, cy, w, h` en pixeles de entrada, seguido de 80 puntuaciones de clase |

La puntuacion de clase es el producto de objectness por la probabilidad de clase. El NMS no esta incluido en el modelo. Los nombres de las clases COCO se almacenan en los metadatos del modelo (campo `names`).

## Arquitectura y entrenamiento

YOLOX-s es un detector de una sola etapa de tipo anchor-free, sucesor de la linea YOLO que introduce la decodificacion sin anclas y la asignacion dinamica de etiquetas (SimOTA) en el entrenamiento. La red combina un backbone CSPNet con un cuello tipo FPN/PAN y cabezas desacopladas de clasificacion y regresion. En esta exportacion, la decodificacion de rejillas y strides propia de YOLOX se mantiene dentro del grafo ONNX, de modo que la salida ya viene en coordenadas de imagen de entrada, lo que reduce el codigo de postprocesado necesario en el cliente (queda solo el NMS).

El entrenamiento no lo ha realizado Advantech: los pesos son los oficiales de Megvii (`yolox_s.pth`, SHA-256 `f55ded7181e1b0c13285c56e7790b8f0e8f8db590fe4edb37f0b7f345c913a30`), entrenados sobre COCO (80 clases). La conversion se hizo desde el arbol fuente de YOLOX (rama main, 2026-11-19) con los pesos oficiales, sin reentrenamiento ni cuantizacion. La model card indica que la salida se verifico contra el `yolox_s.onnx` publicado por Megvii tras su decodificacion, con una diferencia maxima de caja de 0,0013 px; no se reclama ninguna reevaluacion de precision para esta conversion.

## Capacidades

- Deteccion de objetos en imagenes estaticas o fotogramas de video, con 80 clases COCO (persona, vehiculo, animales, objetos cotidianos, etc.).
- Salida de cajas en coordenadas absolutas de la imagen de entrada (`cx, cy, w, h` en pixeles), lista para postprocesado con NMS.
- Inferencia por lotes de tamano 1 (batch fijo 1 en el grafo).
- Entrada BGR en rango 0-255 sin normalizar, lo que simplifica el preprocesado con OpenCV.
- Ejecucion como grafo ONNX estandar (opset 17), compatible con runtimes ONNX y con aceleradores que soporten el conjunto de operadores empleado.
- No incluye NMS, ni seguimiento (tracking), ni segmentacion, ni estimacion de pose o keypoints segun la informacion disponible.
- No soporta tool calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- Capacidades multilingues: no aplica.

## Casos de uso

- Deteccion de personas y objetos en videovigilancia en el borde: el modelo procesa fotogramas de 640x640 en FP32 sobre CPU/NPU AMD Ryzen AI, adecuado para contar personas o vehiculos en camaras IP sin enviar video a la nube.
- Control de aforo y analitica de retail: con las clases COCO de persona y objetos cotidianos se pueden construir contadores de entrada y estimaciones de ocupacion por zona, aplicando NMS sobre la salida `[1, 84, 8400]`.
- Inspeccion visual industrial sencilla: deteccion de presencia/ausencia de objetos genericos (cajas, botellas, herramientas) en lineas de montaje, aprovechando la interfaz ONNX fija y el preprocesado BGR sin normalizar.
- Analitica de trafico urbano: deteccion de coches, autobuses, camiones, motos y bicicletas (clases COCO) para conteo y clasificacion por carril, con postprocesado propio de NMS y asociacion temporal externa.
- Modulo de preprocesado en pipelines de vision mas amplios: usar YOLOX-s como etapa de propuesta de regiones antes de un clasificador o un OCR, ya que la salida en pixeles facilita el recorte de regiones de interes.
- Robotica movil y sistemas embebidos: integracion en dispositivos con Ryzen AI para evitacion de obstaculos o identificacion de objetos de interes, dado el bajo coste de la variante `s` y el grafo ONNX autocontenido.
- Prototipado rapido y benchmarks de despliegue: al ser un ONNX FP32 con salida verificada contra la referencia de Megvii, sirve como linea base para medir latencia y throughput en distintas plataformas antes de pasar a cuantizacion INT8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de mAP, latencia ni throughput, y declara explicitamente que no se reclama ninguna reevaluacion de precision para esta conversion. La unica metrica aportada es la verificacion de equivalencia de salida frente al ONNX de Megvii (diferencia maxima de caja de 0,0013 px).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Al tratarse de YOLOX-s en FP32 con entrada 640x640, el peso del modelo es reducido en comparacion con detectores de mayor tamano, pero la cifra exacta no se indica en la informacion proporcionada.
- GPU recomendadas: no disponibles en la informacion proporcionada. El repositorio esta orientado a plataformas AMD Ryzen AI (tag `ryzen-ai`) y al ecosistema VisionAI de Advantech, por lo que el objetivo principal es CPU/NPU en el borde mas que GPU de datacenter.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; al ser un ONNX estandar podria ejecutarse en GPUs de consumo a traves de runtimes ONNX compatibles, pero no se aportan datos de rendimiento.
- Opciones de despliegue: runtime ONNX (ONNX Runtime) y herramientas de despliegue de AMD Ryzen AI / VisionAI de Advantech. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de vision.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| YOLOX-s (este repositorio) | no disponible | 640x640 fija, batch 1 | Apache-2.0 | ONNX FP32 (opset 17) | Decodificacion embebida, sin NMS, salida `[1, 84, 8400]` |
| YOLOX-s oficial de Megvii | no disponible | configurable | Apache-2.0 | PyTorch / ONNX | Referencia de la que deriva esta conversion; la model card cita su `yolox_s.onnx` como base de verificacion |
| Otras variantes YOLOX (m, l, x) | no disponible | configurable | Apache-2.0 | PyTorch / ONNX | Misma familia; no se aportan datos comparativos de precision ni latencia en la informacion disponible |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas como YOLOv8 o RT-DETR; no se incluyen cifras para no inventar resultados.

## Limitaciones y advertencias

- El nombre del repositorio incluye `pose`, pero la model card describe un detector de objetos sin rama de pose ni keypoints. Verificar la funcionalidad real antes de usarlo en tareas de estimacion de pose.
- No incluye NMS en el grafo: es obligatorio aplicar supresion de no maximos en el cliente para obtener detecciones utiles.
- Entrada fija de 640x640 y batch 1: no admite resoluciones o lotes dinamicos sin reexportar el modelo.
- Preprocesado estricto: NCHW, BGR, rango 0-255 y sin normalizar; un preprocesado distinto degrada las detecciones.
- Solo FP32 en este repositorio: no se ofrecen variantes INT8 o FP16, lo que puede limitar el rendimiento en aceleradores que se benefician de baja precision.
- Entrenado unicamente sobre las 80 clases de COCO: no detecta clases fuera de ese conjunto y su rendimiento en dominios muy distintos (industrial, medico, aereo) puede degradarse.
- Riesgo de falsos positivos y negativos inherente a un detector de una sola etapa de tamano pequeno; no se aportan metricas de mAP para esta conversion.
- Sesgos: las imagenes de COCO provienen de Flickr con licencias variadas; pueden existir sesgos de representacion geografica y demografica heredados del dataset.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de copyright de Megvii incluido en `LICENSE`. Las imagenes de COCO tienen licencias heterogeneas.
- No se reclama reevaluacion de precision para esta conversion: la validez se limita a la equivalencia numerica con el ONNX de referencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin comunidad que valide su uso en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Advantech-EIOT/AMD_yolox-pose-m_640x640_FP32
- Repositorio YOLOX (Megvii): https://github.com/Megvii-BaseDetection/YOLOX
- Paper YOLOX: https://arxiv.org/abs/2107.08430
- Pesos oficiales `yolox_s.pth`: https://github.com/Megvii-BaseDetection/YOLOX/releases/download/0.1.1rc0/yolox_s.pth
- Licencia YOLOX: https://github.com/Megvii-BaseDetection/YOLOX/blob/main/LICENSE
