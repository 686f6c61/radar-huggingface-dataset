# nxp/selfie-segmenter-imx

## Resumen
El modelo `nxp/selfie-segmenter-imx` es una version cuantizada a int8 del Selfie Segmenter de MediaPipe, adaptada por NXP para su despliegue en los procesadores de la familia i.MX (i.MX 8M Plus, i.MX 93, i.MX 95 e i.MX 952). Resuelve una tarea concreta de vision por computador: la segmentacion semantica del retrato de una persona, devolviendo una mascara en escala de grises donde cada pixel indica la probabilidad de pertenecer al primer plano. Es util para aplicaciones de videollamada, retoque fotografico o efectos de fondo en tiempo real en dispositivos empotrados.

La arquitectura se basa en una columna vertebral MobileNetV3 con bloques decodificadores personalizados para segmentacion, y se distribuye en dos variantes: general (entrada 256x256) y landscape (entrada 256x144). Ambas estan completamente cuantizadas a int8 (pesos y activaciones), mantienen entrada y salida en float32 y ocupan aproximadamente 216 KB cada una, lo que las hace idoneas para entornos con recursos muy limitados.

Su relevancia actual radica en que permite ejecutar segmentacion de selfies en tiempo real sobre NPUs dedicadas de bajo consumo (VX, Ethos-U65 y eIQ Neutron) y sobre CPU con el delegado XNNPack, sin necesidad de GPU ni de conexion a la nube. La licencia MIT facilita su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3 con bloques decodificadores personalizados para segmentacion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | int8 completa (pesos y activaciones); entrada y salida float32 |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | MIT (modelo derivado; original Apache-2.0) |
| Formato de pesos | TFLite (LiteRT); tambien se incluyen artefactos precompilados para NPU |

## Arquitectura y entrenamiento
El modelo original de MediaPipe emplea una red MobileNetV3 como extractor de caracteristicas a la que se anaden bloques decodificadores especificos para la tarea de segmentacion. La salida es una mascara monocanal con valores en el rango [0.0, 1.0] que representa la probabilidad de primer plano por pixel. La variante general procesa imagenes de 256x256 (127.7 M OPS, 63.84 M MACs) y la variante landscape, de 256x144 (71.6 M OPS, 35.78 M MACs), que es mas rapida y alcanza rendimiento en tiempo real tanto en CPU como en NPU.

NXP realizo una conversion de formato desde el TFLite original en float16 a TensorFlow SavedModel mediante `tflite2tensorflow`, y despues lo reexporto a TFLite. Sobre esa base aplico una cuantizacion post-entrenamiento completa a int8, calibrada con 68 imagenes del conjunto de validacion de COCO 2017 que no pertenecen al dataset de entrenamiento original de MediaPipe. Para i.MX 93 se compilo con el compilador Vela (tags `lf-6.18.20_2.0.0` y `lf-6.18.37_2.1.0`), y para i.MX 95 e i.MX 952 con el SDK eIQ Neutron (versiones 3.1.3 y 3.2.1 para i.MX 95; 3.1.3, 3.2.1 y 3.2.3 para i.MX 952). No se dispone de informacion sobre el numero de tokens ni sobre el proceso de entrenamiento original mas alla de lo indicado en la model card.

## Capacidades
- Segmentacion semantica de retratos: genera una mascara de primer plano por pixel a partir de una imagen RGB normalizada.
- Dos resoluciones de entrada: general (256x256) y landscape (256x144), con distinto equilibrio entre precision y velocidad.
- Salida en rango [0.0, 1.0] apta para composicion alfa, desenfoque de fondo o sustitucion de fondo.
- Ejecucion en tiempo real en CPU (delegado XNNPack) y en NPU (delegados VX, Ethos-U y Neutron).
- Compatibilidad con el runtime eIQ LiteRT (TensorFlow Lite) de NXP.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, al ser un modelo puramente de vision.

## Casos de uso
- Videollamadas con fondo virtual: el modelo segmenta al usuario en cada fotograma y permite sustituir o desenfocar el fondo en tiempo real sobre la NPU del dispositivo, sin enviar video a la nube.
- Retoque fotografico en camaras y moviles: genera la mascara de primer plano para aplicar ajustes selectivos de exposicion, color o desenfoque de fondo en la propia captura.
- Efectos de realidad aumentada: la mascara permite superponer elementos graficos entre el sujeto y el fondo en aplicaciones de RA sobre hardware i.MX.
- Control de presencia y encuadre automatico: la mascara sirve para detectar si hay una persona en el campo de vision y ajustar el encuadre o activar funciones de la camara.
- Herramientas de edicion por lotes en el borde: procesamiento de lotes de imagenes de retrato en dispositivos empotrados sin conexion, aprovechando el bajo consumo de la NPU.
- Sistemas de videoconferencia industrial o domotica: integracion en paneles y terminales con i.MX 8M Plus, i.MX 93 o i.MX 95 que necesitan efectos de video sin GPU dedicada.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente proporciona datos de coste computacional: 127.7 M OPS (63.84 M MACs) para la variante general y 71.6 M OPS (35.78 M MACs) para la variante landscape, ademas de un tamano de fichero de aproximadamente 216 KB por variante en int8.

## Requisitos de hardware
- VRAM estimada: no aplica; el modelo esta disenado para ejecutarse en CPU y NPU de sistemas empotrados, no en GPU.
- GPU recomendadas: no aplica; no se contempla ejecucion en GPU en la informacion disponible.
- Compatibilidad con GPU de consumo: no aplica.
- Plataformas objetivo: i.MX 8M Plus (CPU con XNNPack o NPU VX), i.MX 93 (NPU Ethos-U65) e i.MX 95 / i.MX 952 (NPU eIQ Neutron).
- Opciones de despliegue: runtime eIQ LiteRT (TensorFlow Lite) con el delegado correspondiente a cada plataforma; se incluyen artefactos precompilados por version de BSP y SDK.
- Latencia y throughput: no disponibles de forma numerica; la model card indica que la variante landscape alcanza rendimiento en tiempo real en CPU y NPU.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| nxp/selfie-segmenter-imx | no disponible | 256x256 / 256x144 | int8 | MIT | i.MX 8M Plus, i.MX 93, i.MX 95, i.MX 952 |
| MediaPipe Selfie Segmenter (original) | no disponible | 256x256 / 256x144 | float16 | Apache-2.0 | Generico (CPU/GPU movil) |
| Otros segmentadores de retrato para edge | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo original de MediaPipe, del que este es un derivado cuantizado y recompilado para NPUs de NXP. No se dispone de informacion sobre alternativas adicionales de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias
- El modelo esta especializado en retratos de una sola persona; no garantiza un rendimiento adecuado con multiples sujetos, animales u objetos genericos.
- La cuantizacion int8 puede introducir una perdida de precision respecto al modelo original en float16, especialmente en bordes y detalles finos de la mascara.
- La calibracion se realizo con solo 68 imagenes de COCO 2017, lo que puede limitar la robustez ante dominios visuales muy distintos.
- La variante landscape es mas rapida pero menos precisa que la general, segun indica la propia model card.
- No se han publicado datos de sesgo, alucinacion (no aplica en el sentido linguistico) ni evaluaciones de robustez en condiciones de iluminacion adversas.
- Aunque la licencia del repositorio es MIT, el modelo original es Apache-2.0 y la model card senala que el dataset de entrenamiento original de MediaPipe es propietario; conviene revisar las condiciones de uso comercial en productos derivados.
- Los artefactos precompilados estan ligados a versiones concretas de BSP y SDK; usar una version distinta puede requerir recompilacion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/nxp/selfie-segmenter-imx
- Documentacion de MediaPipe Image Segmenter: https://developers.google.com/mediapipe/solutions/vision/image_segmenter
- Herramienta tflite2tensorflow: https://github.com/PINTO0309/tflite2tensorflow
- Dataset COCO 2017: https://cocodataset.org/
- Compilador Vela de NXP: https://github.com/nxp-imx/ethos-u-vela
- Artefactos i.MX 8M Plus: https://huggingface.co/nxp/selfie-segmenter-imx/tree/main/assets/imx8mplus
- Artefactos i.MX 93 (BSP lf-6.18.20_2.0.0): https://huggingface.co/nxp/selfie-segmenter-imx/tree/main/assets/imx93/lf-6.18.20_2.0.0
- Artefactos i.MX 93 (BSP lf-6.18.37_2.1.0): https://huggingface.co/nxp/selfie-segmenter-imx/tree/main/assets/imx93/lf-6.18.37_2.1.0
