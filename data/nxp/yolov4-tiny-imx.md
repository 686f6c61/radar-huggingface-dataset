# nxp/yolov4-tiny-imx

## Resumen

YOLOv4-tiny-imx es la variante cuantizada a int8 y compilada para las MPU de NXP i.MX del detector de objetos YOLOv4-tiny, publicado por NXP en Hugging Face bajo licencia MIT. No es un modelo de lenguaje: es un detector de objetos de visión por computador derivado de los pesos originales de Darknet de Alexey Bochkovskiy et al., convertido a TensorFlow, cuantizado y empaquetado como modelos LiteRT (`.tflite`) listos para ejecutarse sobre los aceleradores NPU integrados en los SoC i.MX 8M Plus, i.MX 93, i.MX 95 y i.MX 952.

El modelo recibe una imagen RGB de 416x416 píxeles en int8 y devuelve dos tensores de salida con cajas delimitadoras sin decodificar (26x26x255 y 13x13x255, float32), correspondientes a dos niveles de resolución con 3 anchor boxes por celda sobre las 80 clases de COCO. La decodificación de cajas y la supresión de no máximos (NMS) se realizan fuera del grafo, tal como se documenta en el `example.py` del repositorio.

Su relevancia es práctica para despliegues de visión embebida: con 6,05 M de parámetros, 6,9 GFLOPs y un fichero int8 de solo 5,9 MB, ofrece detección de objetos en tiempo real en hardware de bajo consumo sin necesidad de GPU dedicada, apoyándose en los delegados NPU específicos de cada familia de SoC (VX para i.MX 8M Plus, Ethos-U para i.MX 93, Neutron para i.MX 95 e i.MX 952).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN detectora de objetos de una etapa (YOLOv4-tiny, derivada de Darknet), dos niveles de salida con 3 anchors por celda |
| Parametros totales | 6,05 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 416x416x3) |
| Tipos de cuantizacion | int8 (entrada int8, salida float32); calibración con 100 imágenes aleatorias de COCO 2017 val |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT (modelo derivado; pesos originales de Darknet en dominio público) |
| Formato de pesos | LiteRT / TensorFlow Lite (`.tflite`), variantes precompiladas por SoC y versión de BSP/SDK |
| Entrada | Tensor (1, 416, 416, 3) RGB, int8 |
| Salidas | 2 tensores: (26, 26, 255) y (13, 13, 255), float32, cajas sin decodificar |
| Clases | 80 clases COCO |
| FLOPS | 6,9 GFLOPs |
| Tamano del fichero int8 | 5,9 MB |
| Framework origen | DarkNet (conversión a TensorFlow) |
| Runtime | eIQ LiteRT con delegado NPU (VX, Ethos-U, Neutron) |
| Hardware objetivo | i.MX 8M Plus, i.MX 93, i.MX 95, i.MX 952 |

## Arquitectura y entrenamiento

YOLOv4-tiny es una red convolucional de detección de una etapa, variante ligera de YOLOv4 (2020), que predice cajas delimitadoras y puntuaciones de clase en dos escalas espaciales (26x26 y 13x13 para una entrada de 416x416), con 3 anchor boxes por celda y 255 canales por celda (3 anchors x (4 coordenadas + 1 objectness + 80 clases)). El modelo no incluye en el grafo ni la decodificación de cajas ni la NMS; ambas deben implementarse en el código de inferencia, tal como muestra `example.py`.

El repositorio no documenta el entrenamiento original (número de tokens o composición del dataset no aplican aquí; el entrenamiento es el de YOLOv4-tiny sobre COCO, según los pesos de Darknet referenciados). Lo que sí se documenta es el proceso de modificación llevado a cabo por NXP: conversión de DarkNet a TensorFlow, cuantización a int8 usando 100 imágenes aleatorias del conjunto de validación COCO 2017 como datos de calibración, y compilación específica por plataforma. Para i.MX 93 se usa Vela con `--accelerator-config=ethos-u65-256 --optimise Performance` y los tags de BSP `lf-6.18.20_2.0.0` y `lf-6.18.37_2.1.0`; para i.MX 95 e i.MX 952 se emplea el eIQ Neutron SDK en versiones 3.1.3, 3.2.1 y 3.2.3. El repositorio incluye los scripts de regeneración (`recipe.sh`, `export_model.py`) y un manifiesto de release (`release_manifest.json`) que mapea cada asset con su runtime, precisión, hardware objetivo y versiones de BSP/SDK.

## Capacidades

- Detección de objetos en imágenes RGB de 416x416 píxeles sobre 80 clases del dataset COCO.
- Regresión de cajas delimitadoras y puntuaciones de clase en dos niveles de resolución (26x26 y 13x13).
- Inferencia cuantizada int8 optimizada para NPU de bajo consumo en SoC NXP i.MX.
- Ejecución sobre delegados NPU específicos: VX (i.MX 8M Plus), Ethos-U65 (i.MX 93) y Neutron (i.MX 95 / i.MX 952).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión.
- No dispone de capacidades multilingües ni de modo thinking, visión generativa, audio o vídeo.
- El post-procesado (decodificación de cajas y NMS) debe implementarse externamente; el modelo entrega salidas crudas.

## Casos de uso

- Vigilancia y control de accesos en el borde: el detector se ejecuta íntegramente en la NPU del i.MX 8M Plus o i.MX 93 y permite identificar personas y vehículos en streams de cámara sin enviar vídeo a la nube, con un fichero de 5,9 MB que cabe en almacenamiento flash reducido.
- Automatización industrial y control de calidad: con 6,9 GFLOPs por inferencia a 416x416, es viable inspeccionar piezas en cintas transportadoras a tasas de decenas de FPS en i.MX 95, detectando defectos u objetos fuera de posición sobre las clases COCO o tras un ajuste fino.
- Robots móviles y AGV: la detección de obstáculos y personas a bordo del propio robot, usando el i.MX 95 con NPU Neutron, evita depender de conectividad y reduce la latencia del bucle de control.
- Sistemas de conteo y analítica de aforo: integrado en cámaras IP con SoC i.MX 8M Plus, el modelo procesa cada fotograma localmente y solo transmite conteos agregados, lo que simplifica el cumplimiento de protección de datos.
- Domótica y electrónica de consumo: detección de presencia o de mascotas en cámaras domésticas con presupuesto térmico y energético muy ajustado, aprovechando la cuantización int8 y el tamaño reducido del modelo.
- Prototipado rápido en placas de evaluación NXP: los assets precompilados por versión de BSP y SDK permiten validar una pipeline de detección sobre la placa sin necesidad de recompilar el modelo, usando `example.py` como referencia para la decodificación y la NMS.
- Visión embebida en vehículos y remolques: detección de señales, peatones u otros vehículos en módulos de bajo consumo basados en i.MX 93 con Ethos-U65, donde el coste por inferencia en vatios es el criterio principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta métricas de coste computacional: 6,9 GFLOPs y 6,05 M de parámetros, con un fichero int8 de 5,9 MB. No se proporcionan cifras de mAP sobre COCO ni latencias medidas por plataforma.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecutarse en NPU integradas en SoC, no en GPU de escritorio. El fichero int8 ocupa 5,9 MB.
- GPU recomendadas: no aplica para el caso de uso previsto. Para ejecución en GPU convencional habría que usar el modelo TensorFlow/TFLite sin delegado NPU, con rendimiento no documentado.
- ¿Cabe en GPU de consumo? Sí, por tamaño (6,05 M de parámetros), pero el repositorio no ofrece binarios ni recetas para ese escenario.
- Plataformas soportadas: i.MX 8M Plus (delegado VX), i.MX 93 (Ethos-U65, Vela), i.MX 95 e i.MX 952 (eIQ Neutron SDK 3.1.3, 3.2.1, 3.2.3), con BSP `lf-6.18.20_2.0.0` y `lf-6.18.37_2.1.0` según el asset.
- Opciones de despliegue: runtime eIQ LiteRT (TensorFlow Lite) con el delegado NPU correspondiente. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Orientacion |
|---|---|---|---|---|---|
| YOLOv4-tiny-imx (NXP) | 6,05 M | 416x416 | LiteRT int8 con delegados NPU NXP | MIT | NPU i.MX 8M Plus, i.MX 93, i.MX 95, i.MX 952 |
| YOLOv4-tiny (original, Darknet) | 6,05 M | 416x416 | Pesos Darknet (`.weights`) | Dominio público | GPU/CPU de propósito general |
| YOLOv3-tiny (original) | no disponible en la informacion | 416x416 | Pesos Darknet | Dominio público | GPU/CPU de propósito general |
| Otros detectores ligeros (MobileNet-SSD, EfficientDet-Lite) | no disponible en la informacion | variable | TFLite | variable | Movil y embebido generico |

La comparación cuantitativa de precisión (mAP) y latencia frente a estas alternativas no está disponible en la información proporcionada. La diferencia principal de la variante de NXP no es arquitectónica sino de empaquetado: binarios precompilados y calibrados para NPUs concretas, con versionado atado a BSP y SDK.

## Limitaciones y advertencias

- Modelo exclusivamente de visión: no procesa texto, no razona y no admite instrucciones en lenguaje natural.
- Salidas crudas: sin decodificación de cajas ni NMS en el grafo, un uso incorrecto produce detecciones inválidas. Es obligatorio replicar el post-procesado de `example.py`.
- Precisión limitada por la cuantización int8: la calibración se hizo con solo 100 imágenes de COCO 2017 val, lo que puede degradar la precisión en dominios visuales alejados de COCO (iluminación industrial, imágenes térmicas, cámaras monocromas).
- Solo 80 clases COCO: cualquier clase fuera de ese vocabulario requiere reentrenamiento o ajuste fino, no soportado directamente por estos binarios.
- Acoplamiento fuerte al hardware y al software: cada asset está compilado para una versión concreta de BSP y SDK (Vela o Neutron). Actualizar el BSP sin usar el asset correspondiente puede romper la ejecución en NPU.
- Riesgo de sesgo heredado del dataset COCO en la representación de personas, objetos y contextos geográficos y culturales.
- Riesgo de falsos negativos en objetos pequeños, oclusiones o escenas densas, intrínseco a un detector de una etapa con dos niveles de resolución y variante "tiny".
- Licencia MIT para este derivado, pero conviene revisar `MODEL_LICENSE` del repositorio para los términos de los pesos originales de Darknet (dominio público según la model card).
- Uso comercial permitido por la licencia MIT, sin garantías explícitas; para producción conviene validar el modelo en el dominio concreto antes de desplegar.
- El repositorio tiene un volumen de descargas bajo (75) y ninguna interacción social (0 likes), lo que reduce la probabilidad de encontrar soporte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nxp/yolov4-tiny-imx
- Pesos originales de YOLOv4-tiny (Darknet): https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/yolov4-tiny.weights
- Repositorio Darknet: https://github.com/AlexeyAB/darknet/
- Paper YOLOv4: https://arxiv.org/abs/2004.10934
- Paper YOLO (v1): https://arxiv.org/abs/1804.02767
- Vela (compilador Ethos-U de NXP): https://github.com/nxp-imx/ethos-u-vela
- Assets i.MX 8M Plus: https://huggingface.co/nxp/yolov4-tiny-imx/blob/main/assets/imx8mplus/yolov4-tiny_416_quant.tflite
- Assets i.MX 93 (BSP lf-6.18.20_2.0.0): https://huggingface.co/nxp/yolov4-tiny-imx/blob/main/assets/imx93/lf-6.18.20_2.0.0/yolov4-tiny_416_quant_vela.tflite
- Assets i.MX 93 (BSP lf-6.18.37_2.1.0): https://huggingface.co/nxp/yolov4-tiny-imx/blob/main/assets/imx93/lf-6.18.37_2.1.0/yolov4-tiny_416_quant_vela.tflite
- Assets i.MX 95 (Neutron SDK 3.1.3): https://huggingface.co/nxp/yolov4-tiny-imx/blob/main/assets/imx95/3.1.3/yolov4-tiny_416_quant_converted.tflite
- Assets i.MX 95 (Neutron SDK 3.2.1): https://huggingface.co/nxp/yolov4-tiny-imx/blob/main/assets/imx95/3.2.1/yolov4-tiny_416_quant_converted.tflite
- Assets i.MX 95 (Neutron SDK 3.2.3): https://huggingface.co/nxp/yolov4-tiny-imx/blob/main/assets/imx95/3.2.3/yolov4-tiny_416_quant_converted.tflite
- Assets i.MX 952 (Neutron SDK 3.1.3): https://huggingface.co/nxp/yolov4-tiny-imx/blob/main/assets/imx952/3.1.3/yolov4-tiny_416_quant_converted.tflite
- Assets i.MX 952 (Neutron SDK 3.2.1): https://huggingface.co/nxp/yolov4-tiny-imx/blob/main/assets/imx952/3.2.1/yolov4-tiny_416_quant_converted.tflite
- Assets i.MX 952 (Neutron SDK 3.2.3): https://huggingface.co/nxp/yolov4-tiny-imx/blob/main/assets/imx952/3.2.3/yolov4-tiny_416_quant_converted.tflite
