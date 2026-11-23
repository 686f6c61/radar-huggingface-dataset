# enazif/mayaku-n-det-street

## Resumen

`mayaku-n-det-street` es un modelo de detección de objetos en tiempo real especializado en escenas de tráfico y vía pública, desarrollado por enazif (Emrah Nazif) dentro del ecosistema Mayaku. Con solo 5,2 millones de parámetros, es la variante "nano" de una familia de cuatro modelos de calle, y devuelve únicamente cajas delimitadoras (no máscaras de segmentación). Su propósito es detectar personas, vehículos, micromovilidad, señales de tráfico, matrículas y rostros en imágenes de salpicadero, vigilancia urbana y drones, sin necesidad de entrenamiento adicional.

El modelo se distribuye con pesos listos para usar y una librería propia (`mayaku`) que abstrae la inferencia y la exportación. Está pensado para despliegues en CPU, dispositivos edge y escenarios con muchos flujos simultáneos por GPU, donde el coste computacional por fotograma es el factor crítico. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia actual del modelo radica en su especialización: frente a detectores genéricos entrenados en COCO, `mayaku-n-det-street` ha sido ajustado sobre un conjunto de validación específico de escenas de calle (17.712 imágenes) que incluye fuentes aéreas y de dron, lo que le permite mantener un rendimiento notable en ángulos cenitales donde los modelos COCO caen drásticamente. La información disponible no especifica la arquitectura interna, los datos exactos de entrenamiento ni el proceso de ajuste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de detección de objetos; la model card no especifica la familia) |
| Parámetros totales | 5,2 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | int8 (exportación a ONNX, TensorRT, OpenVINO y Core ML); fp16 en inferencia |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch); exportable a ONNX, TensorRT, OpenVINO y Core ML |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo (no se indica si es un transformer, una CNN o un híbrido). Se sabe que la exportación genera "un grafo de cinco operaciones simples" que puede ejecutarse en cualquier runtime y NPU, lo que sugiere una arquitectura de inferencia ligera y bien optimizada, pero no se especifica la familia concreta. El modelo pertenece a la familia Mayaku, que incluye variantes nano y medium, con y sin segmentación.

El entrenamiento se realizó sobre un conjunto de validación de calle compuesto por 17.712 imágenes procedentes de Objects365, COCO, Wikimedia Commons y fuentes de dron y aéreas, con 22 clases. La model card indica explícitamente que los modelos de calle "nunca vieron una etiqueta de COCO", lo que explica su ventaja en escenas de calle y su desventaja en el benchmark COCO val2017. No se proporciona información sobre el número total de tokens de entrenamiento (no aplica), la composición exacta del dataset de entrenamiento (solo del de validación), ni si se emplearon técnicas de RLHF/DPO (no aplicables a un detector).

## Capacidades

- Detección de objetos en 22 clases agrupadas en personas, micromovilidad y asistencia, vehículos, objetos de carretera y otros.
- Clases específicas: person, face, helmet, bicycle, e-scooter, motorcycle, wheelchair, stroller, car, truck, bus, emergency vehicle, train, three-wheeler, construction vehicle, trailer, license plate, traffic light, safety sign, stop sign, traffic cone y animal.
- Detección de matrículas y rostros pensada para anonimización previa al almacenamiento o compartición de vídeo.
- Funciona en escenas de salpicadero, vigilancia urbana, imágenes de dron y vistas aéreas.
- Inferencia en tiempo real: 2,61 ms por fotograma en RTX 3060 con fp16 y 2,11 ms con int8 (1920×1080, batch 1).
- Exportación a ONNX, TensorRT, OpenVINO y Core ML, incluida cuantización int8.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo "thinking", visión multimodal ni audio.

## Casos de uso

- **Anonimización de vídeo urbano**: el modelo detecta `face` y `license plate` en cada fotograma, lo que permite aplicar desenfoque antes de almacenar o publicar grabaciones de cámaras de tráfico, cumpliendo requisitos de privacidad. Su latencia de 2,11 ms en int8 permite procesar múltiples flujos por GPU.
- **Análisis de tráfico en tiempo real**: con las clases `car`, `truck`, `bus`, `motorcycle` y `bicycle`, se puede construir un contador de vehículos y un clasificador de flujo por carril en instalaciones de edge computing, donde el modelo nano cabe en CPU o NPU.
- **Vigilancia con drones**: las clases `person`, `car` y `emergency vehicle` funcionan en vistas aéreas y cenitales, un escenario donde los modelos COCO pierden entre 6 y 17 puntos de AP según la model card. El modelo nano es adecuado para drones con recursos limitados.
- **Seguridad vial y detección de infracciones**: la detección de `helmet`, `e-scooter`, `stop sign` y `traffic light` permite construir sistemas de alerta sobre uso de casco o respeto de señalización en cruces, con procesamiento en tiempo real.
- **Gestión de flotas y logística**: las clases `truck`, `trailer` y `construction vehicle` permiten monitorizar la entrada y salida de vehículos pesados en instalaciones industriales, con despliegue en cámaras IP y servidores sin GPU dedicada.
- **Accesibilidad y micromovilidad**: la detección de `wheelchair`, `stroller` y `e-scooter` puede alimentar sistemas de conteo y planificación urbana para infraestructura accesible, procesando imágenes de cámaras municipales en lotes.
- **Sistemas de alerta en cruces**: combinando `person`, `car` y `traffic light`, se pueden generar avisos de conflicto peatón-vehículo en intersecciones, con latencia inferior a 3 ms por fotograma en GPU de gama media.

## Benchmarks y rendimiento

Resultados en el conjunto de validación de calle (17.712 imágenes, 22 clases, COCO AP@[.50:.95]):

| Modelo | Box AP | AP50 | AP small | AP large | Mask AP | RTX 3060 fp16 | RTX 3060 int8 |
|---|---:|---:|---:|---:|---:|---:|---:|
| mayaku-n-det-street | 43,9 | 60,0 | 23,7 | 62,8 | — | 2,61 ms | 2,11 ms |
| mayaku-n-seg-street | 43,9 | 60,0 | 23,7 | 62,8 | 35,2 | 5,54 ms | 5,64 ms |
| mayaku-m-det-street | 56,8 | 72,1 | 34,3 | 73,2 | — | 6,42 ms | 3,94 ms |
| mayaku-m-seg-street | 56,8 | 72,1 | 34,3 | 73,2 | 45,5 | 10,4 ms | 7,86 ms |

Comparativa en las 10 clases compartidas con COCO (con `car` y `truck` fusionados en una clase vehículo), box AP@[.50:.95]:

| Modelo | Parámetros | Conjunto de calle | COCO val2017 | Tiempo de red, RTX 3060 fp16 |
|---|---:|---:|---:|---:|
| street medium | 32,4 M | 65,3 | 57,1 | 5,36 ms |
| RF-DETR large | 33,9 M | 56,3 | 61,8 | 5,42 ms |
| YOLO26l | 26,3 M | 53,2 | 60,4 | 4,19 ms |
| street nano | 5,2 M | 52,2 | 51,2 | 1,49 ms |
| YOLO26n | 2,6 M | 34,1 | 48,6 | no disponible |

Rendimiento por clase del modelo medium (box AP): bus 78,6; train 75,1; car 72,3; person 66,1; face 65,7; e-scooter 65,2; emergency vehicle 64,2; license plate 64,1. Clases más débiles: trailer 24,5; stroller 26,9; wheelchair 32,5; construction vehicle 39,7. La model card no desglosa el AP por clase para la variante nano.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 5,2 M de parámetros, la huella de memoria es mínima. En fp16, los pesos ocupan aproximadamente 10,4 MB; en int8, unos 5,2 MB. La VRAM real vendrá dominada por el búfer de entrada (una imagen de 1920×1080 en fp16 ocupa unos 12,4 MB) y por el runtime de inferencia.
- **GPU recomendadas**: RTX 3060 (referencia de la model card, 2,61 ms en fp16 y 2,11 ms en int8 para 1920×1080), así como cualquier GPU consumer moderna (RTX 4090, RTX 4060, etc.) para múltiples flujos simultáneos.
- **Cabe en GPU consumer**: sí, en cualquier GPU con al menos 1-2 GB de VRAM disponible; también está diseñado para CPU y dispositivos edge.
- **Opciones de despliegue**: librería `mayaku` (PyTorch), ONNX Runtime, TensorRT, OpenVINO y Core ML. La model card no menciona soporte explícito para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de objetos).
- **Latencia y throughput**: 2,61 ms por fotograma en RTX 3060 fp16 y 2,11 ms en int8, extremo a extremo, batch 1, mediana de 1.000 fotogramas de 1920×1080. El tiempo de red es de 1,49 ms en fp16. No se proporcionan cifras de throughput agregado para múltiples flujos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Box AP (calle) | Box AP (COCO) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| **mayaku-n-det-street** | 5,2 M | 800 px (por defecto) | 43,9 (22 clases) / 52,2 (10 clases) | 51,2 | Apache 2.0 | Hugging Face |
| YOLO26n | 2,6 M | 640 px | 34,1 (10 clases) | 48,6 | no disponible en la información | no disponible en la información |
| YOLO26l | 26,3 M | 640 px | 53,2 (10 clases) | 60,4 | no disponible en la información | no disponible en la información |
| RF-DETR large | 33,9 M | 704 px | 56,3 (10 clases) | 61,8 | no disponible en la información | no disponible en la información |

El modelo nano de Mayaku supera a YOLO26n en el conjunto de calle (52,2 frente a 34,1 en las 10 clases compartidas) y se acerca a YOLO26l (53,2) con una quinta parte de sus parámetros. Frente a RF-DETR large, la brecha en calle es de 4,1 puntos de AP a favor de RF-DETR, pero el modelo nano es mucho más pequeño y rápido. En COCO val2017, los modelos especializados en COCO lideran, como es esperable. En imágenes de dron y aéreas, la model card indica que YOLO26l obtiene entre 3 y 9 AP y RF-DETR large entre 6 y 17, mientras que street medium alcanza 23-25; no se proporciona la cifra exacta para street nano en ese subconjunto.

## Limitaciones y advertencias

- **Clases débiles**: trailer (24,5 AP), stroller (26,9), wheelchair (32,5) y construction vehicle (39,7) tienen pocos ejemplos de entrenamiento y su rendimiento es notablemente inferior al resto.
- **Sesgo de dominio**: el modelo está ajustado a escenas de calle y vistas aéreas; su rendimiento en imágenes COCO genéricas es inferior al de modelos entrenados específicamente en COCO (51,2 frente a 60,4 de YOLO26l).
- **Riesgo de alucinación**: como todo detector, puede producir falsos positivos en condiciones de baja iluminación, oclusión severa, motion blur o ángulos extremos. La model card no cuantifica estos escenarios.
- **Limitaciones de idioma**: no aplica (no es un modelo de lenguaje); la model card no documenta sesgos demográficos ni geográficos.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se especifican restricciones adicionales.
- **Caveat de producción**: la variante `-seg` añade máscaras pero multiplica el tiempo de inferencia (5,54 ms frente a 2,61 ms en fp16) porque el pegado de máscaras a resolución completa se ejecuta en CPU. Para la mayoría de aplicaciones de detección, la variante `-det` es la adecuada.
- **Datos no disponibles**: no se documentan la arquitectura interna, el proceso de entrenamiento, el número de épocas, la composición exacta del dataset de entrenamiento ni los resultados por clase de la variante nano.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/enazif/mayaku-n-det-street)
- [Repositorio GitHub de Mayaku](https://github.com/emrahnazif/mayaku)
- [Documentación de exportación](https://emrah.fr/mayaku/deployment/export/)
- [mayaku-n-seg-street](https://huggingface.co/enazif/mayaku-n-seg-street)
- [mayaku-m-det-street](https://huggingface.co/enazif/mayaku-m-det-street)
- [mayaku-m-seg-street](https://huggingface.co/enazif/mayaku-m-seg-street)
