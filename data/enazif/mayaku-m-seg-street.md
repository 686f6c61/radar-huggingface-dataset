# enazif/mayaku-m-seg-street

## Resumen

`mayaku-m-seg-street` es un modelo de segmentación de instancias orientado a escenas de calle, desarrollado por enazif dentro del proyecto Mayaku. Su propósito es detectar y segmentar 22 clases de objetos relevantes en entornos viarios —personas, vehículos, micromovilidad, señales, matrículas y rostros— sin necesidad de entrenamiento adicional ni de datos propios. Es el modelo de tamano medio de una familia de cuatro variantes street (nano y medium, en versiones de detección y de segmentación).

El modelo resuelve un problema concreto: los detectores genéricos entrenados en COCO rinden de forma deficiente en escenas de tráfico reales, especialmente en objetos pequenos y en vistas aéreas o de dron. `mayaku-m-seg-street` incorpora clases específicas del dominio viario (e-scooter, patinete, silla de ruedas, coche de emergencia, matrícula, casco) y ofrece máscaras además de cajas, lo que permite tareas posteriores como el desenfoque selectivo de rostros y matrículas antes de almacenar o compartir metraje.

Con 32,7 M de parámetros, licencia Apache 2.0 y exportación a ONNX, TensorRT, OpenVINO y Core ML en int8, está pensado para despliegue en tiempo real sobre hardware de consumo y aceleradores NPU. Su relevancia actual radica en la combinación de precisión en dominio específico (56,8 box AP y 45,5 mask AP en su conjunto de validación street) con un coste de inferencia bajo (10,4 ms por fotograma 1920×1080 en una RTX 3060 en fp16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red de detección y segmentación de instancias; grafo de cinco operaciones exportable) |
| Parametros totales | 32,7 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | fp16 e int8 (exportación a ONNX, TensorRT, OpenVINO y Core ML) |
| Idiomas soportados | no disponible (modelo de visión; las etiquetas de clase están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch); exportable a ONNX, TensorRT, OpenVINO y Core ML |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que el modelo se exporta como «un grafo de cinco operaciones simples» que puede ejecutarse en cualquier runtime y NPU. Se trata de un modelo de segmentación de instancias que devuelve simultáneamente cajas y máscaras, con un tamano de 32,7 M de parámetros. La librería `mayaku` gestiona la carga, la inferencia y la exportación.

El conjunto de validación descrito en la model card comprende 17.712 imágenes procedentes de Objects365, COCO, Wikimedia Commons y fuentes de dron y aéreas, anotadas con 22 clases y evaluadas con COCO AP@[.50:.95]. No se especifican el número de tokens ni el volumen total del conjunto de entrenamiento, la composición exacta del dataset de entrenamiento ni si se aplicaron técnicas de RLHF o DPO (no procede en un modelo de visión). Tampoco se detalla si hubo aumentación de datos específica para vistas aéreas, aunque el rendimiento declarado en imágenes de dron sugiere que sí se contemplaron ese tipo de escenas.

## Capacidades

- Segmentación de instancias con cajas y máscaras para 22 clases de escenas viarias.
- Detección de personas, rostros y cascos (el casco se detecta tanto si se lleva puesto como si no).
- Detección de micromovilidad y movilidad asistida: bicicleta, patinete eléctrico, motocicleta, silla de ruedas y carrito de bebé.
- Detección de vehículos: coche (incluye furgonetas, SUV y pickups), camión, autobús, vehículo de emergencia, tren (incluye tranvía), triciclo, vehículo de construcción y remolque.
- Detección de objetos viarios: matrícula, semáforo, señal de seguridad, señal de stop y cono de tráfico.
- Detección de animales como clase única (perros, gatos, caballos, ganado, ovejas, aves y ciervos).
- Funcionalidad específica de privacidad: las clases `face` y `license plate` permiten desenfocar rostros y matrículas antes de almacenar o compartir el metraje.
- Inferencia en tiempo real con exportación a ONNX, TensorRT, OpenVINO y Core ML, incluida cuantización int8.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de lenguaje: es un modelo puramente visual.

## Casos de uso

- Anonimización de metraje de tráfico: el modelo segmenta rostros y matrículas para aplicarles desenfoque antes de archivar grabaciones de dashcam o de cámaras urbanas, cumpliendo requisitos de privacidad. La clase `face` y `license plate` están pensadas explícitamente para este fin.
- Análisis de aforo y conteo de vehículos: con 56,8 box AP y clases específicas como coche, camión, autobús y motocicleta, permite construir pipelines de conteo por carril o por intersección en vídeo en directo, con 10,4 ms por fotograma en una RTX 3060.
- Seguridad vial y auditoría de infraestructura: la detección de conos, señales de stop, señales de seguridad y semáforos facilita inventariar el estado de la señalización a partir de grabaciones de dron o de vehículos de inspección.
- Vigilancia de flotas de micromovilidad: la clase `e-scooter` (patinetes de pie) y `motorcycle` (patinetes con asiento y ciclomotores) permite medir la presencia y el uso de estos vehículos en la vía pública.
- Análisis de imágenes aéreas con dron: el modelo declara 23-25 AP en imágenes de dron y aéreas, frente a 3-9 de YOLO26l y 6-17 de RF-DETR large, lo que lo hace adecuado para inspección de tráfico desde el aire.
- Detección de vehículos de emergencia: la clase `emergency vehicle` (policía, ambulancias y bomberos) con 64,2 box AP permite priorizar el análisis de secuencias donde aparecen estos vehículos o medir tiempos de respuesta.
- Sistemas de asistencia a la conducción en prototipos: la inferencia en 7,86 ms en int8 sobre RTX 3060 y la exportación a Core ML y NPU permiten integrar el modelo en prototipos embarcados o en dispositivos de borde.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de validación street (17.712 imágenes, 22 clases, COCO AP@[.50:.95]):

| Metrica | street nano | street medium |
|---|---:|---:|
| Box AP | 43,9 | 56,8 |
| AP50 | 60,0 | 72,1 |
| AP small | 23,7 | 34,3 |
| AP large | 62,8 | 73,2 |
| Mask AP | 35,2 | 45,5 |

Comparativa con modelos COCO en las 10 clases compartidas (con coche y camión fusionados en una clase vehículo), box AP@[.50:.95]:

| Modelo | Parametros | Street validation set | COCO val2017 | Tiempo de red, RTX 3060 fp16 |
|---|---:|---:|---:|---:|
| street medium | 32,4 M | 65,3 | 57,1 | 5,36 ms |
| RF-DETR large | 33,9 M | 56,3 | 61,8 | 5,42 ms |
| YOLO26l | 26,3 M | 53,2 | 60,4 | 4,19 ms |
| street nano | 5,2 M | 52,2 | 51,2 | 1,49 ms |
| YOLO26n | 2,6 M | 34,1 | 48,6 | no disponible |

Rendimiento por clase del modelo medium (box AP): bus 78,6; tren 75,1; coche 72,3; persona 66,1; rostro 65,7; patinete eléctrico 65,2; vehículo de emergencia 64,2; matrícula 64,1. Clases más débiles: remolque 24,5; carrito 26,9; silla de ruedas 32,5; vehículo de construcción 39,7.

Tiempos extremo a extremo en una RTX 3060 para un fotograma 1920×1080, batch 1, mediana de 1.000 fotogramas: 10,4 ms en fp16 y 7,86 ms en int8. El autor señala que la mayor parte del tiempo de los modelos `-seg` se consume en pegar las máscaras al fotograma completo en CPU.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 32,7 M de parámetros, los pesos en fp16 ocupan aproximadamente 65 MB y en int8 unos 33 MB, por lo que la VRAM necesaria para los pesos es mínima y el cuello de botella es el procesamiento de imágenes de alta resolución.
- GPU recomendadas: RTX 3060 (referencia del autor, 10,4 ms fp16 y 7,86 ms int8 por fotograma 1080p). GPUs superiores como RTX 4090, A100 o H100 reducirán la latencia, aunque no se publican cifras para ellas.
- Cabe en GPU de consumo: sí, con margen amplio; el modelo está disenado para tiempo real en hardware de gama media.
- Opciones de despliegue: librería `mayaku` (PyTorch), ONNX Runtime, TensorRT, OpenVINO y Core ML, con soporte int8 en todas ellas. La exportación se realiza con `predictor.export("onnx", precision="int8")`.
- Latencia y throughput: 10,4 ms fp16 y 7,86 ms int8 por fotograma 1080p en RTX 3060 (extremo a extremo, incluyendo postproceso de máscaras). El tiempo de red aislado es de 5,36 ms en fp16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| mayaku-m-seg-street | 32,7 M | resolución no especificada; 22 clases street | 56,8 box AP / 45,5 mask AP (street); 65,3 box AP en 10 clases compartidas | Apache 2.0 | Hugging Face, librería mayaku |
| RF-DETR large | 33,9 M | resolución por defecto de su librería | 56,3 box AP (street, 10 clases); 61,8 box AP (COCO val2017) | no disponible en la información | no disponible en la información |
| YOLO26l | 26,3 M | 640 px | 53,2 box AP (street, 10 clases); 60,4 box AP (COCO val2017) | no disponible en la información | no disponible en la información |
| mayaku-n-seg-street | 5,3 M | resolución no especificada; 22 clases street | 43,9 box AP / 35,2 mask AP (street) | Apache 2.0 | Hugging Face |

El modelo medium supera a RF-DETR large en 9 AP en escenas de calle y gana en todas las clases compartidas, mientras que los modelos COCO lideran en COCO val2017. En imágenes de dron y aéreas la diferencia es más marcada: street medium obtiene 23-25 AP frente a 3-9 de YOLO26l y 6-17 de RF-DETR large.

## Limitaciones y advertencias

- Las clases con menos ejemplos de entrenamiento tienen un rendimiento notablemente inferior: remolque (24,5 AP), carrito (26,9), silla de ruedas (32,5) y vehículo de construcción (39,7).
- La clase `car` agrupa furgonetas, SUV y pickups, mientras que `truck` se reserva a vehículos pesados; esto puede generar confusión si se espera la taxonomía de COCO.
- Las senales de nombre de calle, dirección y comercios no se detectan; solo se cubren señales reglamentarias y de advertencia, además de la señal de stop como clase propia.
- La clase `animal` es única para perros, gatos, caballos, ganado, ovejas, aves y ciervos, sin distinción entre especies.
- El rendimiento en COCO val2017 es inferior al de los modelos entrenados específicamente en COCO (57,1 frente a 61,8 de RF-DETR large), porque el modelo nunca vio etiquetas COCO.
- El postproceso de pegado de máscaras al fotograma completo en CPU domina el tiempo de inferencia de los modelos `-seg`; si solo se necesitan cajas, la variante `-det` es más rápida.
- No se publican datos sobre sesgos demográficos, geográficos o de condiciones de iluminación, ni sobre tasas de alucinación o falsos positivos en escenarios adversos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no detalla condiciones adicionales sobre el uso de las clases de rostro y matrícula, que pueden estar sujetas a normativa de protección de datos en la UE.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de los resultados declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/enazif/mayaku-m-seg-street
- Repositorio del proyecto Mayaku: https://github.com/emrahnazif/mayaku
- Documentación de exportación: https://emrah.fr/mayaku/deployment/export/
- Modelo nano de detección: https://huggingface.co/enazif/mayaku-n-det-street
- Modelo nano de segmentación: https://huggingface.co/enazif/mayaku-n-seg-street
- Modelo medium de detección: https://huggingface.co/enazif/mayaku-m-det-street
- Imagen de ejemplo del proyecto: https://raw.githubusercontent.com/emrahnazif/mayaku/main/docs/assets/mayaku-street.webp
