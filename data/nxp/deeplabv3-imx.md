# nxp/deeplabv3-imx

## Resumen

DeepLabV3-MobileNetV2 (depth multiplier 0.5) es un modelo ligero de segmentación semántica de imágenes basado en la arquitectura DeepLabV3 con backbone MobileNetV2. Dada una imagen RGB, clasifica cada píxel en una de las 20 clases de objetos del conjunto PASCAL VOC más una clase de fondo (21 clases en total). El modelo original procede de TensorFlow Hub (empaquetado por Sayak Paul, autores originales de Google/TensorFlow) y se distribuye ya cuantizado a int8.

El repositorio `nxp/deeplabv3-imx` lo publica NXP como derivado compilado para sus microprocesadores i.MX: i.MX 8M Plus (CPU/NPU VX), i.MX 93 (NPU Ethos-U65) e i.MX 95 / i.MX 952 (NPU eIQ Neutron). No se realiza ninguna cuantización nueva: se parte del fichero TFLite int8 original y se compila con Vela (i.MX 93) o el SDK eIQ Neutron (i.MX 95/952) para cada BSP concreto.

Es relevante para quienes despliegan visión por computadora en el borde (edge) sobre hardware NXP: el modelo ocupa solo 983 KB en int8, requiere 1,76 GOPS y está precompilado para las NPU de la familia i.MX, lo que elimina el trabajo de conversión y compilación específica por plataforma. La licencia del repositorio es MIT, aunque el modelo base original se publica bajo Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeepLabV3 con backbone MobileNetV2 (depth multiplier 0.5) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 513x513x3) |
| Tipos de cuantización | int8 (pesos y activaciones); entradas y salidas en float32 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT (repositorio); modelo base original Apache 2.0 |
| Formato de pesos | LiteRT / TFLite (`.tflite`), incluidos artefactos precompilados por plataforma |

## Arquitectura y entrenamiento

DeepLabV3 es una red de segmentación semántica que combina un backbone convolucional con módulos de convolución atrous (dilated) y agrupamiento de contexto (ASPP, atrous spatial pyramid pooling) para capturar información multi-escala. En esta variante el backbone es MobileNetV2 con factor de profundidad 0.5, lo que reduce drásticamente el coste computacional a cambio de menor capacidad de representación. La entrada es una imagen RGB de 513x513 normalizada como `(pixel - 127.5) / 127.5`, y la salida es un tensor `(1, 513, 513, 21)` de puntuaciones por píxel y clase, en float32.

No se dispone de información sobre el dataset de entrenamiento (número de tokens no aplica; se desconoce la composición exacta del conjunto de imágenes), ni sobre si hubo ajuste fino con RLHF/DPO (no aplica a un modelo de segmentación). La innovación técnica relevante en este repositorio no es arquitectónica sino de despliegue: NXP compila el TFLite int8 original con Vela (`--accelerator-config=ethos-u65-256 --optimise Performance`) para la NPU Ethos-U65 del i.MX 93, y con el SDK eIQ Neutron (versiones 3.1.3, 3.2.1 y 3.2.3) para las NPU Neutron del i.MX 95 e i.MX 952, manteniendo el TFLite original como referencia independiente de hardware. Se incluye además `recipe.sh` para regenerar los artefactos y `example.py` como ejemplo de inferencia.

## Capacidades

- Segmentación semántica densa: clasifica cada píxel de una imagen RGB en 21 clases (20 de PASCAL VOC más fondo).
- Salida de puntuaciones por píxel y clase en un tensor de forma `(1, 513, 513, 21)`, apta para post-procesado con argmax o softmax.
- Inferencia cuantizada int8 optimizada para NPU de borde (VX, Ethos-U65, Neutron) y CPU.
- Entrada de resolución fija 513x513; no admite otras resoluciones sin recompilación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de una sola pasada.
- No dispone de modo de razonamiento (thinking), visión generativa, audio ni generación de texto.

## Casos de uso

- Segmentación de escenas en cámaras de vigilancia industrial: el modelo procesa fotogramas de 513x513 en la NPU del i.MX 8M Plus o i.MX 93, permitiendo separar personas, vehículos y mobiliario en tiempo real sin enviar vídeo a la nube.
- Automoción y robótica de bajo consumo: sobre i.MX 95/952 con NPU Neutron, la segmentación por píxel alimenta módulos de evitación de obstáculos o navegación en robots móviles, con un coste de 1,76 GOPS por inferencia.
- Preprocesado en pipelines de visión embebida: el mapa de 21 clases puede usarse como máscara para recortar regiones de interés (ROI) antes de ejecutar un detector o clasificador más pesado en el mismo SoC.
- Control de calidad en líneas de producción: segmentar piezas, fondos y operarios en imágenes de cámara industrial para detectar presencia, orientación o solapamientos, aprovechando el tamaño de 983 KB que cabe en memoria flash reducida.
- Segmentación de vegetación y terreno en agricultura de precisión: con el modelo compilado para i.MX 8M Plus, un dron o tractor puede clasificar suelo, cultivo y cielo por píxel para ajustar tratamientos localizados.
- Prototipado y validación de hardware NXP: el repositorio incluye artefactos precompilados por BSP (lf-6.18.20_2.0.0, lf-6.18.37_2.1.0) y `recipe.sh`, lo que permite verificar rápidamente el delegate NPU y medir latencia antes de integrar el modelo en un producto.
- Segmentación de fondo en videollamadas o aplicaciones de realidad aumentada en dispositivos empotrados, usando la clase de fondo frente a las 20 clases de objeto para separar al sujeto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (mIoU, precisión por clase, latencia) en la información disponible. Los únicos datos de rendimiento declarados son 1,76 GOPS de coste computacional y 983 KB de tamaño del fichero int8. No se dispone de cifras de latencia ni throughput por plataforma.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está pensado para MPU de borde sin GPU dedicada. El fichero int8 ocupa 983 KB y la entrada es de 513x513x3.
- GPU recomendadas: no aplica. El despliegue objetivo son las NPU integradas de NXP: VX en i.MX 8M Plus, Ethos-U65 en i.MX 93 y eIQ Neutron en i.MX 95 / i.MX 952.
- ¿Cabe en GPU de consumo? El modelo es lo bastante pequeño para ejecutarse en cualquier GPU de consumo mediante el runtime LiteRT/TFLite, pero no es el escenario previsto ni se documentan artefactos para ello.
- Opciones de despliegue: runtime eIQ LiteRT (TensorFlow Lite) con el delegate correspondiente (VX, Ethos-U, Neutron). Artefactos precompilados por BSP y SDK en `assets/imx8mplus`, `assets/imx93`, `assets/imx95` y `assets/imx952`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Clases | Tamaño | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| nxp/deeplabv3-imx | DeepLabV3 + MobileNetV2 dm0.5, int8 | 513x513x3 | 21 | 983 KB | MIT (base Apache 2.0) | Segmentación semántica en MPU i.MX con NPU |
| DeepLabV3-MobileNetV2 dm0.5 int8 (TF Hub, original) | DeepLabV3 + MobileNetV2 dm0.5, int8 | 513x513x3 | 21 | no disponible | Apache 2.0 | Referencia TFLite independiente de hardware |
| DeepLabV3+ con backbone mayor (p. ej. ResNet) | DeepLabV3+ | variable | 21 (PASCAL VOC) | no disponible | según variante | Mayor precisión, mayor coste computacional |
| Modelos de segmentación ligeros alternativos (p. ej. seg-mentación MobileNet/EdgeTPU) | variable | variable | variable | no disponible | variable | Despliegue en edge con otros aceleradores |

La comparación cuantitativa de precisión (mIoU) y latencia con estas alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo reconoce las 21 clases de PASCAL VOC; objetos fuera de ese vocabulario se asignarán a la clase más parecida o al fondo, con riesgo de errores semánticos.
- Resolución de entrada fija de 513x513: imágenes de otra relación de aspecto requieren redimensionado, lo que puede degradar la segmentación de objetos pequeños.
- Cuantización int8 con entradas y salidas float32: existe una pérdida de precisión inherente frente al modelo en coma flotante, no cuantificada en la información disponible.
- Sesgos: al entrenarse sobre PASCAL VOC, el modelo puede rendir peor en dominios visuales alejados (imágenes térmicas, médicas, industriales específicas) y reflejar los sesgos de composición de ese conjunto.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí puede producir segmentaciones erróneas o bordes imprecisos en escenas ambiguas u ocluidas.
- Licencia: el repositorio es MIT, pero el modelo base original es Apache 2.0; conviene revisar `MODEL_LICENSE` antes de uso comercial y conservar los avisos de atribución correspondientes.
- Los artefactos precompilados están ligados a versiones concretas de BSP y SDK (lf-6.18.20_2.0.0, lf-6.18.37_2.1.0; Vela y Neutron 3.1.3/3.2.1/3.2.3); usar otra versión puede requerir recompilar con `recipe.sh`.
- No se documentan métricas de precisión ni latencia, por lo que la validación en producción corre a cargo del integrador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nxp/deeplabv3-imx
- Modelo base en TensorFlow Hub: https://tfhub.dev/sayakpaul/lite-model/deeplabv3-mobilenetv2_dm05-int8/1/default/2
- Artefacto i.MX 8M Plus: https://huggingface.co/nxp/deeplabv3-imx/blob/main/assets/imx8mplus/deeplabv3_quant.tflite
- Artefacto i.MX 93 (lf-6.18.20_2.0.0): https://huggingface.co/nxp/deeplabv3-imx/blob/main/assets/imx93/lf-6.18.20_2.0.0/deeplabv3_quant_vela.tflite
- Artefacto i.MX 93 (lf-6.18.37_2.1.0): https://huggingface.co/nxp/deeplabv3-imx/blob/main/assets/imx93/lf-6.18.37_2.1.0/deeplabv3_quant_vela.tflite
- Artefacto i.MX 95 (Neutron 3.1.3): https://huggingface.co/nxp/deeplabv3-imx/blob/main/assets/imx95/3.1.3/deeplabv3_quant_converted.tflite
- Artefacto i.MX 95 (Neutron 3.2.1): https://huggingface.co/nxp/deeplabv3-imx/blob/main/assets/imx95/3.2.1/deeplabv3_quant_converted.tflite
- Artefacto i.MX 95 (Neutron 3.2.3): https://huggingface.co/nxp/deeplabv3-imx/blob/main/assets/imx95/3.2.3/deeplabv3_quant_converted.tflite
- Artefacto i.MX 952 (Neutron 3.1.3): https://huggingface.co/nxp/deeplabv3-imx/blob/main/assets/imx952/3.1.3/deeplabv3_quant_converted.tflite
- Artefacto i.MX 952 (Neutron 3.2.1): https://huggingface.co/nxp/deeplabv3-imx/blob/main/assets/imx952/3.2.1/deeplabv3_quant_converted.tflite
- Artefacto i.MX 952 (Neutron 3.2.3): https://huggingface.co/nxp/deeplabv3-imx/blob/main/assets/imx952/3.2.3/deeplabv3_quant_converted.tflite
- Vela (compilador Ethos-U de NXP): https://github.com/nxp-imx/ethos-u-vela
- Licencia del modelo base: https://huggingface.co/nxp/deeplabv3-imx/blob/main/MODEL_LICENSE
