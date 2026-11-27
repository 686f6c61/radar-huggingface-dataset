# Advantech-EIOT/AMD_ssd-mobilenet-v2_300x300_A8W8

## Resumen

SSD MobileNetV2 300x300 A8W8 es un modelo de deteccion de objetos en formato ONNX, cuantizado a INT8 con esquema A8W8 (activaciones de 8 bits y pesos de 8 bits), distribuido por Advantech-EIOT para su banco de pruebas del AMD EdgeAI SDK. No se trata de un modelo entrenado por Advantech: deriva del `ssd_mobilenet_v2_coco_2018_03_29` de Google (TensorFlow Object Detection API, TF1 Model Zoo), entrenado sobre el dataset COCO, y ha sido convertido desde la variante FP32 publicada por el mismo autor.

El modelo combina la red troncal MobileNetV2, una arquitectura de convoluciones separables en profundidad disenada para eficiencia computacional en dispositivos con recursos limitados, con la cabeza de deteccion del framework SSD (Single Shot MultiBox Detector). La entrada es una imagen RGB de 300x300 en formato NCHW, y la salida son 1917 predicciones de cajas delimitadoras con logits para 91 clases (incluido el fondo).

Su relevancia actual radica en que sirve como referencia de cuantizacion para el ecosistema AMD Ryzen AI: el modelo esta optimizado para ejecutarse en la NPU del AMD P100 mediante el compilador AMD Quark. Es un artefacto de evaluacion de rendimiento mas que un modelo de proposito general, y su interes esta en demostrar el flujo de conversion FP32 a INT8 en hardware de borde de AMD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSD (Single Shot MultiBox Detector) con backbone MobileNetV2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 300x300) |
| Tipos de cuantizacion | INT8 A8W8 (pesos INT8 por canal de salida, activaciones UINT8 asimetricas con zero point, sesgo INT32) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (QDQ, opset 13, batch 1, 300x300) |

## Arquitectura y entrenamiento

La arquitectura es un detector SSD acoplado a un backbone MobileNetV2. MobileNetV2 introduce bloques residuales invertidos con conexiones lineales de cuello de botella y convoluciones separables en profundidad, lo que reduce drasticamente el coste computacional frente a backbones convencionales. La cabeza SSD produce predicciones densas sobre un conjunto de anchors predefinidos, generando 1917 cajas por imagen con 91 clases. El modelo incluye unicamente el backbone y la cabeza de deteccion: el preprocesamiento de TensorFlow, la decodificacion de cajas y la supresion no maxima (NMS) no estan incluidos en el grafo.

El entrenamiento original proviene del modelo `ssd_mobilenet_v2_coco_2018_03_29` de Google, entrenado sobre COCO. La cuantizacion se realizo con AMD Quark 0.11.2 (ONNX) partiendo del modelo FP32 del mismo autor, plegando previamente las capas BatchNormalization en las convoluciones. La calibracion se hizo con 200 imagenes de COCO val2017 (las primeras 200 por nombre de fichero), con metodo MinMax, redimensionadas a 300x300 y escaladas al rango -1..1. No hubo reentrenamiento ni se reclama una reevaluacion de precision tras la cuantizacion.

## Capacidades

- Deteccion de objetos en imagenes: genera cajas delimitadoras y logits de clase para 91 categorias de COCO.
- Salida en dos tensores: `box_encodings` de forma `[1, 1917, 4]` (codificaciones relativas a los anchors SSD) y `class_logits` de forma `[1, 1917, 91]` (indice 0 = fondo).
- Entrada estandarizada: tensor F32 `[1, 3, 300, 300]` en NCHW, RGB, escalado a -1..1.
- Inferencia en NPU: optimizado para el AMD P100 mediante AMD Quark.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues (es un modelo puramente visual).
- No incluye preprocesamiento, decodificacion de cajas ni NMS; el usuario debe implementarlos en el pipeline.

## Casos de uso

- Deteccion de objetos en dispositivos de borde AMD: el modelo esta compilado para la NPU del AMD P100, lo que permite ejecutar deteccion en tiempo real en equipos de bajo consumo sin GPU dedicada.
- Benchmarking de cuantizacion INT8: sirve para medir la perdida de precision y la ganancia de rendimiento del flujo FP32 a A8W8 con AMD Quark en hardware Ryzen AI.
- Vigilancia y analitica de video: deteccion de personas, vehiculos y objetos en flujos de camaras IP, con el modelo ejecutandose en la NPU mientras la CPU gestiona el pipeline de captura.
- Automatizacion industrial: inspeccion visual en lineas de produccion para localizar piezas o defectos, aprovechando la latencia reducida de la inferencia cuantizada.
- Robotica y navegacion: deteccion de obstaculos y objetos relevantes en robots moviles con presupuesto energetico limitado.
- Prototipado rapido de pipelines de vision: al ser un ONNX estandar con interfaz documentada, permite validar integraciones con ONNX Runtime, OpenVINO o el SDK de AMD antes de invertir en modelos propios.
- Educacion y demostraciones: ejemplo reproducible de cuantizacion QDQ con calibracion MinMax sobre COCO val2017.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna reevaluacion de precision tras la cuantizacion, por lo que no hay datos de mAP ni de latencia/throughput documentados.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un modelo ONNX de deteccion con backbone MobileNetV2, el consumo de memoria es bajo, pero no se proporcionan cifras concretas.
- GPU/NPU recomendadas: AMD P100 (NPU), objetivo declarado del modelo.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el modelo esta orientado a la NPU de AMD Ryzen AI.
- Opciones de despliegue: ONNX Runtime, AMD Quark (compilacion para NPU), y potencialmente otros runtimes compatibles con ONNX opset 13.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SSD MobileNetV2 300x300 A8W8 (este) | no disponible | 300x300 | INT8 A8W8 | Apache-2.0 | Hugging Face |
| SSD MobileNetV2 300x300 FP32 (base) | no disponible | 300x300 | FP32 | Apache-2.0 | Hugging Face |
| Modelos de deteccion COCO de TF1 Model Zoo | no disponible | variable | no disponible | Apache-2.0 | GitHub |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No se ha reevaluado la precision tras la cuantizacion; la perdida de mAP respecto al modelo FP32 es desconocida.
- El grafo no incluye preprocesamiento, decodificacion de cajas ni NMS; un uso incorrecto del pipeline puede producir resultados erroneos.
- La calibracion se realizo con solo 200 imagenes de COCO val2017, lo que puede no representar dominios distintos al de COCO.
- Sesgos: los hereda del entrenamiento en COCO, cuyas imagenes provienen de Flickr con licencias variadas y posible sesgo de dominio y geografico.
- Riesgo de falsos positivos y negativos inherente a un detector de una sola etapa con backbone ligero.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero las imagenes de COCO tienen licencias heterogeneas que deben revisarse para usos derivados.
- Modelo puramente visual: no procesa lenguaje ni soporta tareas de texto.
- Sin datos de latencia ni throughput publicados para planificar despliegues en produccion.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Advantech-EIOT/AMD_ssd-mobilenet-v2_300x300_A8W8)
- [Modelo base FP32](https://huggingface.co/Advantech-EIOT/AMD_ssd-mobilenet-v2_300x300_FP32)
- [TF1 Detection Model Zoo](https://github.com/tensorflow/models/blob/master/research/object_detection/g3doc/tf1_detection_zoo.md)
- [Paper MobileNetV2 (arXiv:1801.04381)](https://arxiv.org/abs/1801.04381)
- [Documentacion de AMD Quark](https://quark.docs.amd.com/)
- [Licencia de TensorFlow Models](https://github.com/tensorflow/models/blob/master/LICENSE)
