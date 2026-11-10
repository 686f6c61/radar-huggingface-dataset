# nxp/mobilenet-v1-imx

## Resumen

MobileNet V1 es una familia de redes neuronales convolucionales ligeras para clasificación de imágenes, originalmente desarrollada por Google y publicada en el artículo "MobileNets: Efficient Convolutional Neural Networks for Mobile Vision Applications" (arXiv:1704.04861). Dada una imagen RGB, la red devuelve un vector de 1001 probabilidades de clase (1000 clases de ImageNet más una clase de fondo). Su diseño se basa en convoluciones separables en profundidad, que reducen drásticamente el número de pesos y el coste computacional frente a convoluciones estándar.

Este repositorio concreto, publicado por NXP, no contiene el modelo original en formato de pesos de framework de alto nivel, sino una versión derivada, cuantizada a int8 y compilada para la familia de procesadores de aplicaciones i.MX (i.MX 8M Plus, i.MX 93, i.MX 95, i.MX 952) y para microcontroladores i.MX RT1170, i.MX RT700 y MCX-N947. Se distribuyen dos configuraciones: la completa (multiplicador de anchura 1.0, entrada 224x224) y la más pequeña (multiplicador 0.25, entrada 128x128), esta última empleada en los objetivos MCU.

El interés del repositorio es práctico para despliegue en el borde: incluye artefactos precompilados para las NPU VX, Ethos-U65 y eIQ Neutron, cabeceras C con el modelo como array de bytes para firmware sin sistema de ficheros, y scripts de regeneración, inferencia y evaluación. Es relevante para quienes integran visión embebida de bajo consumo en hardware NXP y necesitan un clasificador de referencia ya optimizado para el silicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con convoluciones separables en profundidad (MobileNet V1) |
| Parametros totales | ~4,24 M (variante 1.0/224); ~470 K (variante 0.25/128) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | int8 post-training quantization (uint8 entrada/salida en MPU; int8 entrada/float32 salida en MCU) |
| Idiomas soportados | no aplica (clasificación de imágenes ImageNet) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (LiteRT), cabeceras C (byte array vía `xxd -i`), artefactos compilados para NPU Vela/Ethos-U65 y eIQ Neutron |
| Entrada | Imagen RGB (1, H, W, 3); 128x128 o 224x224 según variante |
| Salida | Vector (1, 1001) de probabilidades de clase |
| FLOPs | ~28 MFLOPs (0.25/128); ~1,14 GFLOPs (1.0/224) |
| Tamano de fichero int8 | 486 KB (0.25/128); 4,08 MB (1.0/224) |
| Modelo base | google/mobilenet_v1_1.0_224 |

## Arquitectura y entrenamiento

La red es una CNN feed-forward construida sobre convoluciones separables en profundidad: cada convolución estándar se descompone en una convolución depth-wise seguida de una convolución point-wise 1x1, lo que reduce el número de pesos y el tiempo de cómputo. Dos hiperparámetros globales, el multiplicador de anchura y el multiplicador de resolución, permiten intercambiar precisión por latencia y tamaño de modelo; en este repositorio se materializan en las variantes 1.0/224 y 0.25/128.

No se detalla en la información disponible el proceso de entrenamiento original (número de tokens o épocas, composición del dataset más allá de ImageNet, ni si hubo ajuste fino con RLHF/DPO, algo por otra parte impropio de un clasificador). Las modificaciones introducidas por NXP son de cuantización y compilación: cuantización completa int8 post-entrenamiento, compilación con Vela para la NPU Ethos-U65 del i.MX 93 (tags `lf-6.18.20_2.0.0` y `lf-6.18.37_2.1.0`), conversión con el SDK eIQ Neutron (versiones 3.1.3, 3.2.1 y 3.2.3) para la NPU Neutron del i.MX 95/i.MX 952, y compilación para MCX-N947 (Neutron-16) e i.MX RT700 (Neutron-64) con el eIQ Neutron Compiler (SDK 3.2.2 y 3.2.3). El objetivo i.MX RT1170 usa el modelo int8 sin compilación para NPU, y los modelos MCU se convierten a cabeceras C para inclusión directa en la imagen de firmware.

## Capacidades

- Clasificación de imágenes en 1001 clases (1000 clases de ImageNet más fondo), devolviendo un vector de probabilidades.
- Inferencia en el borde sobre NPU dedicadas: VX en i.MX 8M Plus, Ethos-U65 en i.MX 93 y eIQ Neutron en i.MX 95, i.MX 952, i.MX RT700 y MCX-N947.
- Ejecución en microcontroladores mediante TensorFlow Lite Micro a través del pipeline MPP de eIQ, incluyendo i.MX RT1170 sin NPU.
- Cuantización int8 completa, con entrada/salida uint8 en MPU (requiere de-cuantizar con la escala y punto cero del tensor) y entrada int8/salida float32 en MCU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador de imágenes.
- Capacidades multilingües: no aplica.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la clasificación visual.

## Casos de uso

- Clasificación de imágenes en tiempo real en cámaras industriales: el modelo 0.25/128 con ~28 MFLOPs se ejecuta en la NPU Neutron-16 del MCX-N947 o en la Ethos-U65 del i.MX 93, permitiendo inspección visual de bajo consumo en línea de producción.
- Detección de presencia y categorización de objetos en dispositivos IoT alimentados por batería: la variante 0.25/128 en formato int8 (486 KB) cabe en la memoria de un MCU y se integra como cabecera C en el firmware del i.MX RT700.
- Preprocesado y enrutado en pasarelas de visión: en el i.MX 8M Plus, el modelo 1.0/224 (4,08 MB) actúa como clasificador rápido que filtra frames antes de enviarlos a un modelo mayor o a la nube, reduciendo ancho de banda.
- Control de calidad en automoción y electrónica de consumo: clasificación de piezas o defectos visuales sobre i.MX 95 con la NPU Neutron, usando el artefacto precompilado con el SDK 3.2.x correspondiente al BSP.
- Sistemas de accesibilidad y domótica: reconocimiento de objetos cotidianos en cámaras domésticas embebidas en i.MX 93, aprovechando la compilación Vela para Ethos-U65 y el runtime LiteRT.
- Prototipado y validación de pipelines de cuantización: los scripts `recipe.sh`, `example.py` y `evaluate.py` permiten regenerar los artefactos y medir la precisión tras la cuantización int8 antes de desplegar en el hardware final.
- Educación e investigación en visión embebida: como referencia ligera y bien documentada para comparar latencia y precisión entre NPU VX, Ethos-U65 y Neutron sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (top-1/top-5 en ImageNet) ni latencias o throughput medidos para las distintas NPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en NPU integradas y MCU, no en GPU de propósito general.
- GPU recomendadas: no aplica para el despliegue objetivo; el repositorio está orientado a i.MX 8M Plus (NPU VX), i.MX 93 (Ethos-U65), i.MX 95/i.MX 952 (Neutron), i.MX RT1170 (CPU, sin NPU), i.MX RT700 (Neutron-64) y MCX-N947 (Neutron-16).
- Cabe en consumer GPU: no aplica; el tamaño int8 (486 KB a 4,08 MB) está pensado para memoria de MCU y MPU embebidos.
- Opciones de despliegue: eIQ LiteRT (TensorFlow Lite) con delegado NPU VX, Ethos-U (Vela) o Neutron en MPU; TensorFlow Lite Micro con eIQ MPP en MCU; cabeceras C para inclusión en firmware.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| nxp/mobilenet-v1-imx (1.0/224) | ~4,24 M | 224x224 | int8 | Apache-2.0 | Compilado para NPU NXP (VX, Ethos-U65, Neutron) |
| nxp/mobilenet-v1-imx (0.25/128) | ~470 K | 128x128 | int8 | Apache-2.0 | Compilado para MCU (Neutron-16/64) y RT1170 |
| google/mobilenet_v1_1.0_224 | ~4,2 M | 224x224 | float32 (original) | Apache-2.0 | Modelo base de TensorFlow, sin compilación para NPU |
| MobileNet V2 / V3 | no disponible en la información | no disponible | no disponible | Apache-2.0 (originales) | Arquitecturas posteriores con bloques invertidos y búsqueda de arquitectura; no se incluyen en este repositorio |

La comparativa se limita al modelo base y a las variantes del propio repositorio; no se dispone de datos de rendimiento comparado con MobileNet V2/V3 ni con otros clasificadores ligeros en la información proporcionada.

## Limitaciones y advertencias

- Es un clasificador de ImageNet: no genera texto, no razona y no soporta tool calling ni agentes; su uso fuera de clasificación visual no es posible.
- La cuantización int8 post-entrenamiento puede degradar la precisión respecto al modelo en coma flotante; no se publican métricas de dicha degradación.
- La salida uint8 en MPU exige de-cuantizar con la escala y el punto cero del tensor; un manejo incorrecto produce predicciones erróneas.
- Los artefactos compilados están atados a versiones concretas de BSP y SDK (Vela `lf-6.18.20_2.0.0`/`lf-6.18.37_2.1.0`, eIQ Neutron 3.1.3/3.2.1/3.2.2/3.2.3); incompatibilidades de versión pueden impedir la carga en la NPU.
- Los modelos MCU se entregan como cabeceras C y requieren integrarse en la imagen de firmware; no hay sistema de ficheros en esos objetivos.
- Riesgo de sesgo heredado de ImageNet y del conjunto de entrenamiento original de Google; no se documenta ninguna mitigación.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir tanto a Google como a NXP por las modificaciones.
- No se documentan limitaciones de idioma porque el modelo no procesa texto; la información sobre sesgos y alucinación no aplica en el sentido habitual, aunque sí el riesgo de clasificaciones erróneas en dominios alejados de ImageNet.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nxp/mobilenet-v1-imx
- Modelo base en Hugging Face: https://huggingface.co/google/mobilenet_v1_1.0_224
- Artículo MobileNets (arXiv:1704.04861): https://arxiv.org/abs/1704.04861
- MobileNet V1 en TensorFlow Model Garden: https://github.com/tensorflow/models/blob/master/research/slim/nets/mobilenet_v1.md
- Modelo original en Kaggle: https://www.kaggle.com/models/tensorflow/mobilenet-v1/
- Descarga del modelo base TensorFlow: http://download.tensorflow.org/models/mobilenet_v1_2018_08_02/mobilenet_v1_1.0_224.tgz
- Vela (compilador Ethos-U de NXP): https://github.com/nxp-imx/ethos-u-vela
- Artefactos i.MX 8M Plus: https://huggingface.co/nxp/mobilenet-v1-imx/tree/main/assets/imx8mplus
- Artefactos i.MX 93 (BSP lf-6.18.20_2.0.0): https://huggingface.co/nxp/mobilenet-v1-imx/tree/main/assets/imx93/lf-6.18.20_2.0.0
- Artefactos i.MX 93 (BSP lf-6.18.37_2.1.0): https://huggingface.co/nxp/mobilenet-v1-imx/tree/main/assets/imx93/lf-6.18.37_2.1.0
