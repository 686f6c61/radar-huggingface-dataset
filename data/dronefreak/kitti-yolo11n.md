# dronefreak/kitti-yolo11n

## Resumen

`dronefreak/kitti-yolo11n` es un detector de objetos YOLO11n (variante nano de Ultralytics) afinado sobre el conjunto de datos KITTI, orientado a escenas de conduccion autonoma y sistemas avanzados de asistencia al conductor (ADAS). Lo desarrolla el usuario `dronefreak` en el marco del proyecto DetectionBench, un marco de trabajo para comparar detectores modernos con recetas de entrenamiento y metricas de evaluacion identicas sobre multiples conjuntos de datos reales.

El modelo parte de los pesos preentrenados de `Ultralytics/YOLO11` y se reentrena para las ocho clases de KITTI (Car, Van, Truck, Pedestrian, Person_sitting, Cyclist, Tram y Misc). Con solo 2,6 millones de parametros y 6,6 GFLOPs a 640 px, es un detector extremadamente ligero pensado para inferencia en tiempo real en hardware modesto, incluidos dispositivos empotrados y plataformas de bajo consumo.

Su relevancia actual es doble: por un lado, ofrece un punto de referencia reproducible dentro del zoo de modelos KITTI de DetectionBench; por otro, su licencia AGPL-3.0 y su tamano lo convierten en una opcion practica para prototipado de perception stacks, aunque con las cautelas propias de una licencia copyleft fuerte. No es un modelo de lenguaje: no procesa texto ni dispone de contexto conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN tipo YOLO11 (Ultralytics), deteccion de objetos en una sola etapa, anchor-free |
| Parametros totales | 2.606.776 (2,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (el autor solo publica pesos `best.pt` en PyTorch) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`), cargable con Ultralytics; repo con safetensors en metadatos |
| Entrada | imagenes (resolucion de evaluacion 640 px) |
| FLOPs | 6,6 GFLOPs a 640 px |
| Clases | 8 (Car, Van, Truck, Pedestrian, Person_sitting, Cyclist, Tram, Misc) |
| Dataset de entrenamiento | KITTI (`dronefreak/KITTI`) |

## Arquitectura y entrenamiento

La arquitectura es la de YOLO11n de Ultralytics: una red convolucional de una sola etapa, con cuello de botella tipo CSP y cabecera de deteccion desacoplada, sin anchors. Es la variante mas pequena de la familia YOLO11, disenada para maximizar velocidad de inferencia con un coste computacional minimo (6,6 GFLOPs a 640 px). El modelo se ha afinado desde los pesos oficiales de `Ultralytics/YOLO11`, por lo que hereda el preentrenamiento general de la casa y lo especializa a las clases y la distribucion visual de KITTI.

No se detalla en la informacion disponible el numero de tokens (imagenes) de entrenamiento, la composicion exacta del split, ni si se aplicaron tecnicas de aumento de datos especificas mas alla del pipeline estandar de Ultralytics. Tampoco se documentan fases de RLHF/DPO (no aplicables a deteccion) ni innovaciones tecnicas adicionales. El valor anadido del proyecto reside en la reproducibilidad: DetectionBench fija receta de entrenamiento y pipeline de evaluacion (`detectionbench-evaluate`) para que los resultados entre detectores sean comparables.

## Capacidades

- Deteccion de objetos en imagenes de escenas de calle: coches, furgonetas, camiones, peatones, ciclistas, tranvias y clase miscelanea.
- Localizacion con cajas delimitadoras y etiquetas de clase, con puntuaciones de confianza por deteccion.
- Inferencia en tiempo real gracias a su reducido coste computacional (2,6 M de parametros, 6,6 GFLOPs).
- Integracion directa con la libreria Ultralytics (`YOLO(...).predict(...)`), con soporte de umbral de confianza configurable.
- Capacidad de procesar lotes de imagenes y flujos de video a traves de las utilidades de Ultralytics.
- No dispone de tool calling, agentes, razonamiento multi-paso, vision-lenguaje ni modo thinking: es exclusivamente un detector visual.
- Capacidades multilingues: no aplica.

## Casos de uso

- Percepcion en prototipos de conduccion autonoma: el modelo detecta vehiculos, peatones y ciclistas en fotogramas de camara frontal, adecuado para validar pipelines de perception antes de pasar a detectores mayores.
- ADAS de bajo coste: con 2,6 M de parametros puede ejecutarse en GPUs de gama baja o incluso CPU, lo que permite integrarlo en sistemas de aviso de colision o de deteccion de peatones en vehiculos de gama de entrada.
- Benchmarking reproducible: sirve como referencia base dentro de DetectionBench para comparar el impacto de cambios de receta, aumentos de datos o arquitecturas sobre KITTI con metricas identicas.
- Analisis de trafico urbano offline: procesado por lotes de grabaciones de camaras de trafico para contar vehiculos y peatones por clase, aprovechando las ocho categorias de KITTI.
- Investigacion academica en deteccion: punto de partida ligero para experimentos de destilacion, pruning o cuantizacion, dado su bajo coste de entrenamiento e inferencia.
- Sistemas de vigilancia y monitorizacion de aparcamiento: deteccion de vehiculos y personas en imagenes fijas o secuencias, con umbral de confianza ajustable para reducir falsos positivos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de validacion de KITTI, con el pipeline de evaluacion de DetectionBench (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| mAP@50 | 38,77 % |
| mAP@50-95 | 23,97 % |
| Precision | 52,84 % |
| Recall | 40,19 % |
| F1 | 45,65 % |
| Parametros | 2,6 M |
| FLOPs | 6,6 B (a 640 px) |

Rendimiento por clase (mAP@50 / mAP@50-95):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| Car | 90,53 | 67,30 |
| Cyclist | 43,88 | 25,04 |
| Misc | 9,56 | 4,77 |
| Pedestrian | 58,64 | 27,81 |
| Person_sitting | 4,19 | 1,28 |
| Tram | 21,32 | 11,50 |
| Truck | 44,22 | 28,73 |
| Van | 37,83 | 25,34 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 2,6 M de parametros y 6,6 GFLOPs a 640 px, el modelo ocupa del orden de decenas de MB en FP32 y puede ejecutarse en GPUs con 2-4 GB de VRAM sin problema.
- GPU recomendadas: cualquier GPU moderna sirve; para maxima velocidad, RTX 4090, A100 o H100, aunque estan sobredimensionadas. En GPUs de gama media (RTX 3060, T4) el modelo va holgado.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer, incluidas GTX 1650 o inferiores; tambien es viable en CPU para inferencia por lotes no critica en latencia.
- Opciones de despliegue: Ultralytics (PyTorch), exportacion a ONNX, TensorRT, OpenVINO y TFLite a traves de las utilidades de Ultralytics; `huggingface_hub` para descarga de pesos.
- Latencia y throughput: no se han publicado cifras concretas de latencia o FPS en la informacion disponible; por el perfil de FLOPs, es esperable un rendimiento en tiempo real en GPU moderna, pero no se aporta numero verificado.

## Comparativa con modelos similares

Comparativa dentro del zoo KITTI de DetectionBench (mismas metricas y pipeline):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLO26x | 43,73 | 25,96 | 64,17 | 41,28 |
| YOLO26n | 42,54 | 25,43 | 48,62 | 42,84 |
| YOLO11s | 42,00 | 25,10 | 47,27 | 43,71 |
| YOLOv8s | 41,99 | 25,20 | 49,02 | 43,66 |
| YOLOv8n | 40,11 | 24,75 | 46,05 | 41,85 |
| YOLOv9t | 41,60 | 25,73 | 48,30 | 44,20 |
| **YOLO11n (este modelo)** | **38,77** | **23,97** | **52,84** | **40,19** |

Frente a las alternativas nano, el modelo queda por debajo en mAP@50 (38,77 frente a 42,54 de YOLO26n o 40,11 de YOLOv8n), aunque mantiene una precision relativamente alta (52,84 %) con un recall mas bajo. Es el checkpoint mas ligero del conjunto comparado en parametros, lo que explica en parte la brecha de rendimiento. La licencia AGPL-3.0 es comun a la familia Ultralytics; conviene revisar las condiciones de cada alternativa antes de un uso comercial.

## Limitaciones y advertencias

- Rendimiento por clase muy desigual: la clase Car alcanza 90,53 de mAP@50, mientras que Person_sitting (4,19) y Misc (9,56) son practicamente inutilizables en produccion.
- Recall bajo (40,19 %): el modelo tiende a omitir objetos, especialmente en clases minoritarias o de pequeno tamano.
- Sesgo hacia la distribucion de KITTI (escenas de conduccion alemanas, condiciones de iluminacion y camaras concretas); el rendimiento puede degradarse en otros dominios sin reentrenamiento.
- Riesgo de falsos negativos en peatones y ciclistas, critico en aplicaciones ADAS; requiere umbrales conservadores y validacion exhaustiva.
- Licencia AGPL-3.0: impone obligaciones copyleft fuertes; el uso en productos propietarios o servicios en red puede requerir liberar el codigo o adquirir una licencia comercial de Ultralytics. Revisar antes de cualquier despliegue comercial.
- Resultados de benchmarks no verificados de forma independiente (`verified: false` en el model-index).
- No se documentan tecnicas de calibracion de confianza ni evaluacion en dominios fuera de KITTI.
- Modelo de vision exclusivamente: no procesa texto, no tiene contexto conversacional ni capacidades multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/kitti-yolo11n
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base YOLO11: https://huggingface.co/Ultralytics/YOLO11
- Dataset KITTI en Hugging Face: https://huggingface.co/datasets/dronefreak/KITTI
- Paper de referencia (arXiv:2410.17725): https://arxiv.org/abs/2410.17725
- Documentacion de Ultralytics: https://docs.ultralytics.com/
