# mlgraham/species-classifier-hive

## Resumen

Species classifier: hive es un modelo de clasificación de imágenes desarrollado por mlgraham, pensado para identificar insectos que se acercan a la entrada de una colmena de abejas melíferas. Está basado en MobileNetV2 (variante `timm/mobilenetv2_100.ra_in1k`) y se distribuye como TensorFlow Lite en formato entero de 8 bits, lo que permite ejecutarlo en microcontroladores y aceleradores Coral Edge TPU. El modelo distingue 265 especies de abejas, avispas, avispones, moscas ladronas, sírfidos, hormigas y mantis, agrupadas en 12 roles funcionales (honeybee, hornet, yellowjacket, entre otros).

La relevancia del modelo radica en su orientación al despliegue en el borde: con un archivo int8 de 3,0 MB y todas las operaciones mapeadas en la Edge TPU, está diseñado para vigilancia apícola de bajo consumo. La familia incluye tres variantes con las mismas clases, una por tipo de hardware: `hive` (160 px, uso general), `hive_coral` (224 px, Coral Edge TPU) y `hive_esp32s3` (128 px, ESP32-S3 con PSRAM).

El modelo forma parte del proyecto species-classifiers, que también adapta los modelos de insectos, plantas y aves del AIY Vision Kit de Google a este mismo formato. La licencia es Apache 2.0 y el repositorio ocupa 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (CNN, base `timm/mobilenetv2_100.ra_in1k`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes) |
| Tipos de cuantizacion | int8 full-integer (uint8 entrada/salida), float32 |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`), Edge TPU compilado, Vela para Ethos-U55 |

Variantes y resolución de entrada:

| Variante | Red | Entrada | Archivo int8 | Edge TPU on-chip |
|---|---|---|---|---|
| `hive` | MobileNetV2 1.0, 160 px | `[1, 160, 160, 3]` uint8 | 3,0 MB | 3,1 MiB |
| `hive_coral` | MobileNetV2 1.4, 224 px | `[1, 224, 224, 3]` uint8 | 5,5 MB | 5,6 MiB |
| `hive_esp32s3` | MobileNetV2 1.0, 128 px | `[1, 128, 128, 3]` uint8 | 3,1 MB | 3,1 MiB |

## Arquitectura y entrenamiento

El modelo es una MobileNetV2 estándar (convoluciones separables en profundidad, bloques residuales invertidos) afinada desde los pesos de `timm/mobilenetv2_100.ra_in1k`. La salida es un vector de 265 probabilidades uint8 (escala 1/256, punto cero 0) sin clase de fondo. Las operaciones son Conv2D, DepthwiseConv2D, Add, AveragePool, FullyConnected y Softmax, lo que permite el mapeo completo en Edge TPU.

El conjunto de entrenamiento combina las 239 especies de Hymenoptera, moscas ladronas, sírfidos y mantis de iNaturalist 2021, más 26 especies de *Vespa*, *Vespula*, *Dolichovespula* y *Apis* que iNat2021 no incluye (entre ellas *Vespa mandarinia* y *Vespa orientalis*), con un total de 215.799 imágenes de entrenamiento. La variante `hive` se entrenó con un 20 % de escala de grises aleatoria para tolerar cámaras monocromas o iluminadas con infrarrojos; `hive_coral` y `hive_esp32s3` se entrenaron solo en color. No se detalla en la información disponible si hubo RLHF, DPO u otras técnicas de alineación (no aplicables a clasificación de imágenes).

## Capacidades

- Clasificación de imágenes en 265 especies de insectos (abejas, avispas, avispones, moscas ladronas, sírfidos, hormigas y mantis).
- Agregación de las 265 clases en 12 roles funcionales (honeybee, hornet, yellowjacket, paper wasp, robber fly, beewolf, mantis, ant, hoverfly, bumblebee, other bee, other wasp), con tipos protected, threat, predator, mimic y benign.
- Inferencia en microcontroladores (TensorFlow Lite Micro), LiteRT, Coral Edge TPU y Ethos-U55 (vía Vela).
- Entrada uint8 RGB sin normalización (el modelo reescala internamente).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un clasificador de visión).
- No dispone de modo thinking, visión generativa ni audio.

## Casos de uso

- Vigilancia de la entrada de una colmena: una cámara apuntando a la pizarra de vuelo clasifica cada fotograma y suma las probabilidades por rol para detectar avispones y avispas amarillas, con la lógica de umbral o de varios fotogramas consecutivos añadida por el usuario.
- Despliegue en Coral Dev Board Micro o USB Accelerator: la variante `hive_coral` (80,9 % top-1 de especie en color) se ejecuta con todas las operaciones mapeadas en la Edge TPU, adecuada para un nodo de vigilancia fijo de bajo consumo.
- Nodo autónomo con ESP32-S3 (XIAO ESP32S3 Sense): la variante `hive_esp32s3` (3,1 MB) cabe en PSRAM y, según la estimación del autor, rondaría los 140 ms por fotograma, suficiente para muestreo periódico.
- Cámara monocroma o con iluminación infrarroja nocturna: la variante `hive` se entrenó con un 20 % de escala de grises y mantiene un 54,1 % top-1 de especie en gris, frente al 25,4 % de `hive_coral` y el 14,6 % de `hive_esp32s3`.
- Investigación apícola y monitorización de biodiversidad: el archivo `classes.json` con la taxonomía completa y `roles.json` permiten registrar qué especies visitan la colmena y analizar la composición de la comunidad de himenópteros.
- Sustitución de los modelos del AIY Vision Kit de Google: el proyecto species-classifiers reempaqueta los modelos de insectos, plantas y aves de Google en el mismo formato; el modelo `hive` supera al modelo de insectos original (91,7 % de precisión de rol frente al 35,7 %).
- Prototipado en el Seeed Grove Vision AI V2: el archivo `hive_int8_vela.tflite` está compilado con Vela para el Ethos-U55 usando la configuración Himax de Seeed.

## Benchmarks y rendimiento

Resultados medidos sobre los archivos int8 con 2.650 imágenes de validación (10 por especie) y recorte central del 87,5 %:

| Metrica | hive | hive_coral | hive_esp32s3 |
|---|---|---|---|
| Especie top-1 (color) | 71,4 % | 80,9 % | 66,8 % |
| Especie top-5 (color) | 90,4 % | 94,3 % | 88,3 % |
| Precision de rol (color) | 91,7 % | 95,7 % | 89,3 % |
| Amenazas detectadas (avispon + avispa amarilla, color) | 321/360 (89,2 %) | 344/360 (95,6 %) | 318/360 (88,3 %) |
| Abejas melíferas clasificadas como amenaza (color) | 2/60 | 1/60 | 1/60 |
| Especie top-1 (gris) | 54,1 % | 25,4 % | 14,6 % |
| Amenazas detectadas (gris) | 281/360 (78,1 %) | 196/360 (54,4 %) | 144/360 (40,0 %) |
| Edge TPU | todas las ops mapeadas, 3,1 MiB | todas las ops mapeadas, 5,6 MiB | todas las ops mapeadas, 3,1 MiB |

Comparación con el modelo de insectos del AIY Vision Kit de Google, agregado a los mismos roles: 35,7 % de precisión de rol y 117/360 amenazas detectadas (32,5 %).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido de GPU de escritorio; el modelo int8 ocupa 3,0 MB (`hive`), 5,5 MB (`hive_coral`) o 3,1 MB (`hive_esp32s3`).
- GPU recomendadas: no requiere GPU; se ejecuta en CPU, microcontrolador o acelerador dedicado.
- Cabe en consumer GPU: sí, cualquier GPU moderna puede ejecutarlo, pero el objetivo es el borde.
- Opciones de despliegue: TensorFlow Lite Micro, LiteRT, Coral Edge TPU (Dev Board Micro, USB Accelerator), Ethos-U55 vía Vela (Seeed Grove Vision AI V2), ESP32-S3 con PSRAM.
- Latencia y throughput: no se han medido tiempos en placa; para el ESP32-S3 el autor estima unos 140 ms por fotograma escalando la cifra publicada por Espressif para MobileNetV2.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Clases | Precision de rol | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| species-classifier-hive | MobileNetV2 1.0 | 160 px | 265 especies / 12 roles | 91,7 % | Apache 2.0 | Hugging Face / GitHub |
| species-classifier-hive_coral | MobileNetV2 1.4 | 224 px | 265 especies / 12 roles | 95,7 % | Apache 2.0 | Hugging Face / GitHub |
| species-classifier-hive_esp32s3 | MobileNetV2 1.0 | 128 px | 265 especies / 12 roles | 89,3 % | Apache 2.0 | Hugging Face / GitHub |
| Modelo de insectos AIY Vision Kit (Google) | no disponible | no disponible | agregado a 12 roles | 35,7 % | no disponible | reempaquetado en species-classifiers |

No se dispone de datos de otros modelos comparables de clasificación de insectos en el borde en la información proporcionada.

## Limitaciones y advertencias

- Los números de validación proceden de una sola ejecución de entrenamiento por modelo, seleccionada sobre el mismo conjunto de validación con el que se puntúa, con solo 10 imágenes por especie y 60 imágenes de abejas melíferas; no son una estimación fiable de la tasa de falsas alarmas en campo.
- No se ha medido el rendimiento real en placa; la cifra de 140 ms por fotograma del ESP32-S3 es una estimación.
- El modelo no incluye umbral ni regla temporal: la decisión de amenaza requiere lógica adicional (por ejemplo, amenaza en varios fotogramas consecutivos).
- Las variantes `hive_coral` y `hive_esp32s3` se entrenaron solo en color y pierden mucha precisión con entrada en escala de grises (25,4 % y 14,6 % top-1 de especie).
- No hay clase de fondo: cualquier imagen que no sea un insecto de las 265 clases se asignará a alguna de ellas.
- Sesgos conocidos: no se documentan en la información disponible; el entrenamiento se basa en fotos de iNaturalist, lo que puede introducir sesgo hacia condiciones de fotografía de campo y no de cámara fija.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí de clasificación errónea fuera de distribución.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; conviene revisar las condiciones de las imágenes de iNaturalist 2021 si se redistribuyen datos.

## Enlaces

- Hugging Face: https://huggingface.co/mlgraham/species-classifier-hive
- Repositorio del proyecto: https://github.com/mlgraham/species-classifiers
- Modelo base: https://huggingface.co/timm/mobilenetv2_100.ra_in1k
- Dataset: iNaturalist 2021 (https://github.com/visipedia/inat_comp)
