# illimax/yolo26s-drone

## Resumen

YOLO26s-drone es un modelo de deteccion de objetos basado en la arquitectura YOLO26s de Ultralytics, especializado en la deteccion de drones en escenarios de camara a tierra (ground-to-air) y de camara a aire (air-to-air). Lo desarrolla el usuario illimax y se publica bajo licencia AGPL-3.0. El modelo parte de la familia YOLO26, un detector de una sola etapa (single-stage) con 9,9 millones de parametros y una resolucion de entrada de 1280 pixeles, orientado a la deteccion de objetos pequenos en imagenes de alta resolucion.

El problema que aborda es el de la deteccion fiable de UAV (drones) en entornos reales, donde los objetos son pequenos, el fondo puede ser muy variable (cielo despejado, nubes, edificios) y los falsos positivos por aves, aviones o helicopteros degradan mucho la utilidad practica. Para mitigarlo, el autor entrena el modelo con cuatro clases (`drone`, `bird`, `airplane`, `helicopter`) y recomienda usar solo la clase `drone` en inferencia, lo que reduce las alarmas falsas.

Es relevante ahora porque combina un backbone moderno (YOLO26) con un pipeline de entrenamiento cuidadosamente documentado: division por secuencia, deduplicacion por md5 y pHash, eliminacion de fugas del conjunto de test y seleccion del umbral de confianza a partir del punto de maximo F1 en validacion. El modelo se distribuye en formato PyTorch (`.pt`) y ONNX, lo que facilita su despliegue en CPU y GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (detector single-stage, familia Ultralytics YOLO26) |
| Parametros totales | 9,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos `.pt` y `.onnx`; el autor no documenta cuantizaciones) |
| Idiomas soportados | no aplica |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`, 20,4 MB) y ONNX (`.onnx`, 38,7 MB, requiere NMS) |

Otros datos tecnicos: resolucion de entrada 1280 px, umbral de confianza recomendado 0,40, cuatro clases (`0 drone`, `1 bird`, `2 airplane`, `3 helicopter`), tamano del repo 0,1 GB.

## Arquitectura y entrenamiento

YOLO26s es un detector de objetos de una sola etapa perteneciente a la familia YOLO26 de Ultralytics. El modelo tiene 9,9 M de parametros y opera con entrada de 1280x1280 px, lo que favorece la deteccion de objetos pequenos frente a resoluciones menores (por ejemplo, 640 px). La model card no detalla la composicion interna de la red (backbone, neck, cabeza) ni innovaciones especificas de la arquitectura YOLO26, por lo que esos detalles se consideran no disponibles.

El entrenamiento se realizo en dos fases: un preentrenamiento sobre el dataset seraphim a 640 px durante 80 epocas, seguido del entrenamiento principal a 1280 px durante 100 epocas (mejor epoca 93, batch 30 sobre 3 GPU). Los datos provienen de cinco conjuntos: DUT Anti-UAV (ground-to-air, 5.192 train / 2.597 val), Det-Fly (air-to-air, 9.223 / 2.007), AOT (air-to-air, solo aves/aviones/helicopteros/cielo vacio, 7.893 / 1.688), AOD-4 (mixto, 5.942 / 1.058) y seraphim (mixto, 10.000 / 2.000). La division se hizo por secuencia, con deduplicacion por md5 y pHash y eliminacion de fugas del conjunto de test. El umbral de confianza recomendado (0,40) corresponde al punto de maximo F1 de la clase drone en validacion, sin usar datos de test para su seleccion. No se documenta el uso de RLHF/DPO (no aplica a un detector) ni tecnicas de decodificacion especulativa.

## Capacidades

- Deteccion de drones en imagenes, en vistas ground-to-air y air-to-air, con una unica clase de interes (`drone`).
- Deteccion auxiliar de aves, aviones y helicopteros (clases 1, 2 y 3), pensada para reducir falsos positivos cuando se filtra por la clase `drone`.
- Deteccion de objetos pequenos gracias a la resolucion de entrada de 1280 px.
- Inferencia en PyTorch (`.pt`) y en ONNX (`.onnx`, requiere aplicar NMS externamente).
- Ejecucion en CPU con latencia aproximada de 125 ms por imagen a 1280 px (PyTorch).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente de vision por computador.
- No dispone de modo thinking, vision multimodal, audio ni generacion de texto.

## Casos de uso

- Vigilancia perimetral anti-UAV: el modelo puede procesar fotogramas de camaras fijas orientadas al cielo para detectar drones intrusos y disparar alertas, apoyandose en la clase `drone` y en el umbral de confianza 0,40 recomendado por el autor.
- Monitorizacion de espacio aereo en infraestructuras criticas (aeropuertos, plantas industriales, recintos penitenciarios): la deteccion ground-to-air con precision alta en DUT Anti-UAV (0,989) lo hace adecuado para entornos controlados donde el fondo es predecible.
- Sistemas de contramedidas o escolta aerea (air-to-air): util para plataformas que ya vuelan y necesitan detectar otros UAV en su campo de vision, aunque con las limitaciones de recall documentadas en Det-Fly (0,552).
- Filtrado y triaje de grabaciones: procesar lotes de video aereo para localizar segmentos con presencia de drones y reducir el tiempo de revision manual, usando el modelo en CPU (125 ms/imagen) o GPU.
- Integracion en pipelines de vision embebida o edge: el ONNX de 38,7 MB y el `.pt` de 20,4 MB permiten desplegar el detector en dispositivos con recursos limitados, aplicando NMS en el postprocesado.
- Reduccion de falsos positivos en sistemas existentes: al incluir clases `bird`, `airplane` y `helicopter`, el modelo puede usarse como clasificador de descarte para distinguir drones de fauna y trafico aereo convencional en la misma escena.
- Generacion de datasets y anotacion asistida: usar el modelo para preanotar imagenes de drones y acelerar el etiquetado en nuevos dominios, revisando manualmente las detecciones de baja confianza.

## Benchmarks y rendimiento

Resultados publicados por el autor para la clase `drone` con conf 0,40:

| Conjunto de evaluacion | Precision | Recall | F1 | AP50 |
|---|---|---|---|---|
| Val (9.350 imagenes) | 0,936 | 0,849 | 0,891 | 0,893 |
| Anti-UAV300 test (ground-to-air) | 0,956 | 0,655 | 0,777 | 0,801 |
| DUT Anti-UAV test (ground-to-air) | 0,989 | 0,957 | 0,973 | 0,977 |
| Det-Fly test scenes (air-to-air) | 0,869 | 0,552 | 0,675 | 0,633 |
| AOT held-out test (air-to-air) | no disponible | 0,000 | no disponible | 0,000 |

Datos adicionales aportados por el autor: 0 falsas alarmas de drone sobre 1.626 fotogramas de AOT con aves, aviones, helicopteros o cielo vacio. En drones de 16-32 px sobre Anti-UAV300 el AP50 cae a 0,345. No se han publicado comparaciones con otros detectores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 9,9 M de parametros y entrada 1280 px el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM es suficiente; el autor entreno con 3 GPU (modelo no especificado) y batch 30 a 1280 px.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y equivalentes.
- Opciones de despliegue: PyTorch/Ultralytics (`YOLO(...).predict`), ONNX Runtime (aplicando NMS externo), y en general los backends soportados por Ultralytics.
- Latencia y throughput: aproximadamente 125 ms por imagen a 1280 px en CPU de escritorio con PyTorch; el rendimiento en GPU no esta documentado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa se marca como no disponible.

| Modelo | Parametros | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26s-drone (este modelo) | 9,9 M | 1280 | drone, bird, airplane, helicopter | AGPL-3.0 | Hugging Face + GitHub |
| Alternativas de deteccion de drones | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Recall bajo en escenarios air-to-air: 0,552 en Det-Fly y 0,000 en el test retenido de AOT, donde los drones son menores de 16 px y el split de entrenamiento de AOT no contiene drones.
- Mal rendimiento en drones muy pequenos (16-32 px): AP50 de 0,345 en Anti-UAV300.
- Fondos air-to-air con clutter degradan la deteccion (Det-Fly F1 0,675).
- El modelo etiqueta algunos drones diminutos como `airplane`, lo que puede generar confusiones si no se filtra por la clase `drone`.
- Riesgo de falsos negativos en dominios no cubiertos por el entrenamiento; el autor recomienda no esperar buen rendimiento en metraje tipo AOT con drones muy pequenos.
- Licencia AGPL-3.0 para el modelo: impone obligaciones de copyleft en servicios en red; revisar compatibilidad antes de uso comercial.
- Los datos de entrenamiento conservan sus propios terminos: seraphim y AOD-4 (CC BY 4.0), AOT (CDLA-Permissive 1.0), DUT Anti-UAV y Det-Fly (terminos no indicados; consultar con los autores antes de uso comercial).
- Las imagenes de ejemplo proceden de seraphim (CC BY 4.0) y Det-Fly.
- No se documentan sesgos demograficos (no aplica), pero si posibles sesgos de dominio por la composicion de los datasets.
- El ONNX requiere aplicar NMS manualmente; un postprocesado incorrecto puede degradar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/illimax/yolo26s-drone
- Demo (Hugging Face Space): https://huggingface.co/spaces/illimax/yolo26s-drone
- Codigo en GitHub: https://github.com/lkw-k/yolo26-drone-detection
- Imagen de ejemplo ground-to-air: https://huggingface.co/illimax/yolo26s-drone/blob/main/assets/example_ground_to_air.jpg
- Imagen de ejemplo air-to-air: https://huggingface.co/illimax/yolo26s-drone/blob/main/assets/example_air_to_air.jpg
