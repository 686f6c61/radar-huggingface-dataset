# enazif/mayaku-n-seg-street

## Resumen

`mayaku-n-seg-street` es un modelo de segmentación de instancias en tiempo real especializado en escenas de tráfico y vía pública, desarrollado por Emrah Nazif bajo la librería Mayaku. Con solo 5,3 millones de parámetros, es la variante "nano" de la familia street de Mayaku y devuelve simultáneamente cajas delimitadoras y máscaras de segmentación para 22 clases relevantes en entornos viarios: personas, vehículos, micromovilidad, señalización y objetos de carretera.

El modelo está diseñado para funcionar "tal cual", sin necesidad de datos propios ni reentrenamiento, y cubre escenarios que van desde dashcams hasta imágenes de dron y aéreas. Su interés principal radica en que combina un tamaño extremadamente reducido con una precisión competitiva en su dominio: alcanza 43,9 de Box AP y 35,2 de Mask AP en el conjunto de validación street, y se exporta a ONNX, TensorRT, OpenVINO y Core ML con cuantización int8, lo que lo hace apto para CPU, dispositivos edge y despliegues con muchos streams por GPU.

La inclusión de clases como `face` y `license plate` responde a una finalidad práctica de privacidad: permiten difuminar rostros y matrículas antes de almacenar o compartir metraje. La licencia Apache 2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red de segmentación de instancias exportable como grafo de cinco operaciones) |
| Parametros totales | 5,3 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | fp16, int8 (exportación a ONNX, TensorRT, OpenVINO, Core ML) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch); exportable a ONNX, TensorRT, OpenVINO y Core ML |
| Entrada | imagen (ruta, PIL u fotograma OpenCV BGR); tamaño por defecto 800 px en los modelos street |
| Clases | 22 (persona, rostro, casco, bicicleta, patinete, moto, silla de ruedas, carrito, coche, camión, autobús, vehículo de emergencia, tren, triciclo, vehículo de obra, remolque, matrícula, semáforo, señal de seguridad, stop, cono de tráfico, animal) |
| Pipeline | image-segmentation |
| Tamaño del repo | 0,0 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que se exporta como "un grafo de cinco operaciones planas" que puede ejecutarse en cualquier runtime y NPU. Se trata, por tanto, de una red de segmentación de instancias optimizada para despliegue, no de un transformer generativo. El modelo pertenece a una familia de cuatro variantes street (nano y medium, en versiones detección y segmentación), donde las versiones `-det` y `-seg` de un mismo tamaño producen las mismas cajas; la diferencia es que `-seg` añade máscaras.

El conjunto de validación street empleado para medir la precisión consta de 17.712 imágenes procedentes de Objects365, COCO, Wikimedia Commons y fuentes de dron y aéreas, etiquetadas con las 22 clases. No se especifican en la información proporcionada el número de tokens de entrenamiento (no aplica), la composición exacta del dataset de entrenamiento ni si se emplearon técnicas de RLHF o DPO (no procede en un modelo de visión). La innovación técnica destacable es la exportabilidad int8 a múltiples runtimes y la inclusión deliberada de clases de privacidad (rostro y matrícula).

## Capacidades

- Segmentación de instancias con cajas y máscaras para 22 clases de escenas viarias.
- Detección de personas, rostros y cascos.
- Detección de micromovilidad y movilidad asistida: bicicleta, patinete eléctrico, moto, silla de ruedas, carrito.
- Detección de vehículos: coche (incluye furgonetas, SUV y pickups), camión (solo mercancías pesadas), autobús, vehículo de emergencia (policía, ambulancia, bomberos), tren (incluye tranvía), triciclo, vehículo de obra (excavadoras y carretillas), remolque.
- Detección de objetos de carretera: matrícula, semáforo, señal de seguridad (regulatoria y de advertencia), stop, cono de tráfico.
- Detección de animales (perro, gato, caballo, ganado, oveja, ave, ciervo en una sola clase).
- Funciona en escenas de dashcam, dron y aéreas.
- Exportación a ONNX, TensorRT, OpenVINO y Core ML con cuantización int8.
- Uso mediante API Python (`from_pretrained`, `predictor(...)`) y línea de comandos (`mayaku predict`).
- No dispone de tool calling, capacidades de agente ni procesamiento de lenguaje.

## Casos de uso

- Difuminado de privacidad en metraje de tráfico: el modelo detecta rostros y matrículas para aplicar desenfoque antes de almacenar o compartir grabaciones, cumpliendo requisitos de protección de datos en sistemas de videovigilancia viaria.
- Análisis de tráfico en tiempo real desde dashcam: con 5,54 ms por fotograma 1920×1080 en una RTX 3060 en fp16, permite procesar múltiples streams simultáneos y contar vehículos, peatones y patinetes por carril.
- Monitorización aérea con dron: el modelo mantiene precisión notable en imágenes desde arriba (23 a 25 AP frente a 3-9 de YOLO26l y 6-17 de RF-DETR large), lo que lo hace adecuado para inspección de infraestructuras y conteo de vehículos en aparcamientos o vías.
- Seguridad vial en edge: al exportarse a int8 y ejecutarse en CPU, NPU y dispositivos embebidos, puede integrarse en cámaras inteligentes o unidades a bordo para alertar de peatones, ciclistas o vehículos de emergencia.
- Gestión de flotas y logística: la detección de camiones, remolques y vehículos de obra permite auditar el uso de vehículos y detectar infracciones en accesos industriales.
- Análisis de micromovilidad urbana: la clase específica de patinete eléctrico (separada de moto) facilita estudios de uso de VMP en carriles bici y aceras.
- Automatización de aparcamientos y control de accesos: la segmentación de matrículas y vehículos permite pipelines de lectura de matrícula y verificación de categoría de vehículo.

## Benchmarks y rendimiento

Resultados en el conjunto de validación street (17.712 imágenes, 22 clases, COCO AP@[.50:.95]):

| Modelo | Box AP | AP50 | AP small | AP large | Mask AP |
|---|---:|---:|---:|---:|---:|
| street nano (este modelo) | 43,9 | 60,0 | 23,7 | 62,8 | 35,2 |
| street medium | 56,8 | 72,1 | 34,3 | 73,2 | 45,5 |

Comparativa con modelos COCO en las 10 clases compartidas (coche y camión fusionados en vehículo):

| Modelo | Params | Street validation set | COCO val2017 | Tiempo de red, RTX 3060 fp16 |
|---|---:|---:|---:|---:|
| street medium | 32,4 M | 65,3 | 57,1 | 5,36 ms |
| RF-DETR large | 33,9 M | 56,3 | 61,8 | 5,42 ms |
| YOLO26l | 26,3 M | 53,2 | 60,4 | 4,19 ms |
| street nano | 5,2 M | 52,2 | 51,2 | 1,49 ms |
| YOLO26n | 2,6 M | 34,1 | 48,6 | no disponible |

Rendimiento end-to-end en RTX 3060 (fotograma 1920×1080, batch 1, mediana de 1.000 fotogramas):

| Modelo | fp16 | int8 |
|---|---:|---:|
| mayaku-n-det-street | 2,61 ms | 2,11 ms |
| mayaku-n-seg-street (este modelo) | 5,54 ms | 5,64 ms |
| mayaku-m-det-street | 6,42 ms | 3,94 ms |
| mayaku-m-seg-street | 10,4 ms | 7,86 ms |

Clases más fuertes (medium, box AP): bus 78,6, tren 75,1, coche 72,3, persona 66,1, rostro 65,7, patinete 65,2, vehículo de emergencia 64,2, matrícula 64,1. Clases más débiles: remolque 24,5, carrito 26,9, silla de ruedas 32,5, vehículo de obra 39,7.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 5,3 M de parámetros el modelo es extremadamente ligero y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX 3060 (referencia de los benchmarks), así como GPUs de gama baja y media; también CPU y NPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna; incluso en CPU y dispositivos edge.
- Opciones de despliegue: librería Mayaku (`pip install mayaku`), exportación a ONNX, TensorRT, OpenVINO y Core ML, con soporte int8.
- Latencia: 5,54 ms end-to-end en RTX 3060 fp16 para un fotograma 1920×1080 (5,64 ms en int8); la mayor parte del tiempo se consume en pegar las máscaras al tamaño completo del fotograma en CPU.
- Throughput: no disponible de forma explícita, pero la latencia por fotograma permite múltiples streams por GPU.

## Comparativa con modelos similares

| Modelo | Params | Contexto/entrada | Box AP (street) | Mask AP | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| mayaku-n-seg-street | 5,3 M | 800 px | 43,9 | 35,2 | Apache 2.0 | Hugging Face |
| mayaku-n-det-street | 5,2 M | 800 px | 43,9 | no aplica | Apache 2.0 | Hugging Face |
| mayaku-m-seg-street | 32,7 M | 800 px | 56,8 | 45,5 | Apache 2.0 | Hugging Face |
| YOLO26n | 2,6 M | 640 px | 34,1 | no disponible | no disponible | no disponible |
| RF-DETR large | 33,9 M | 704 px | 56,3 | no disponible | no disponible | no disponible |

Frente a los modelos COCO, las variantes street ganan en escenas viarias y aéreas pero pierden en imágenes y etiquetas COCO, ya que nunca vieron etiquetas COCO. En imágenes de dron y aéreas la diferencia es notable: street medium alcanza 23-25 AP frente a 3-9 de YOLO26l y 6-17 de RF-DETR large.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para escenas de tráfico y vía pública; su rendimiento fuera de ese dominio no está garantizado.
- Clases con pocos ejemplos de entrenamiento presentan precisión baja: remolque (24,5 AP), carrito (26,9), silla de ruedas (32,5) y vehículo de obra (39,7).
- La clase `car` agrupa furgonetas, SUV y pickups, mientras que `truck` se reserva a mercancías pesadas; esto puede diferir de las convenciones COCO y provocar confusiones en integraciones.
- Las señales de nombre de calle, dirección y comercios no se detectan; solo señales regulatorias y de advertencia.
- En imágenes y etiquetas COCO los modelos COCO superan a este modelo, ya que no fue entrenado con etiquetas COCO.
- El tiempo end-to-end de la variante `-seg` está dominado por el pegado de máscaras en CPU; en despliegues de altas prestaciones conviene evaluar si se necesitan máscaras o bastan las cajas de la variante `-det`.
- No se dispone de información sobre sesgos demográficos o geográficos del dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar el cumplimiento normativo en aplicaciones de videovigilancia y tratamiento de datos personales (rostros y matrículas).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/enazif/mayaku-n-seg-street
- Repositorio GitHub de Mayaku: https://github.com/emrahnazif/mayaku
- Documentación de exportación: https://emrah.fr/mayaku/deployment/export/
- Modelo mayaku-n-det-street: https://huggingface.co/enazif/mayaku-n-det-street
- Modelo mayaku-m-det-street: https://huggingface.co/enazif/mayaku-m-det-street
- Modelo mayaku-m-seg-street: https://huggingface.co/enazif/mayaku-m-seg-street
