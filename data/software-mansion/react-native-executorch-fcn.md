# software-mansion/react-native-executorch-fcn

## Resumen

El repositorio `software-mansion/react-native-executorch-fcn` no contiene un modelo de lenguaje, sino una coleccion de artefactos del modelo de segmentacion semantica de imagenes FCN (Fully Convolutional Network), exportados al formato `.pte` de ExecuTorch para su ejecucion en dispositivo dentro de la libreria React Native ExecuTorch. El modelo original procede de `torchvision` (variantes FCN con backbone ResNet-50 y ResNet-101, preentrenadas en COCO) y aqui se distribuye ya compilado para distintos backends de aceleracion: Core ML, XNNPACK y QNN (Hexagon NPU de Qualcomm).

La relevancia de este repositorio es practica: permite incorporar segmentacion semantica de 21 clases (formato Pascal VOC) en aplicaciones moviles React Native sin depender de la nube, con variantes que van desde 34 MB (ResNet-50 int8 sobre XNNPACK) hasta 198 MB (ResNet-101 fp32). Al estar empaquetado como programas ExecuTorch, el modelo se ejecuta en el propio dispositivo (CPU, GPU Apple o NPU Qualcomm), lo que reduce latencia y evita enviar imagenes a servidores externos.

No se trata de un modelo generativo ni conversacional: es una red convolucional de segmentacion densa por pixel. Su utilidad principal es la vision por computador embebida en movil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FCN (Fully Convolutional Network) con backbone ResNet-50 o ResNet-101 |
| Parametros totales | no disponible (no se publican recuentos en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | fp16 (Core ML), fp32 (XNNPACK), int8 (XNNPACK), a8w8 (QNN) |
| Idiomas soportados | no disponible (modelo de vision; sin capacidades linguisticas) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ExecuTorch `.pte` (programas compilados por backend) |
| Entrada | imagenes RGB de 520x520 (deducido de la forma de salida) |
| Salida | logits `(1, 21, 520, 520)` en Core ML/XNNPACK; indices de clase `(1, 520, 520)` int32 en QNN |
| Clases | 21 (formato de segmentacion Pascal VOC, segun el modelo upstream de torchvision) |
| Tamano del repo | 2,8 GB (incluye todas las variantes de ambos backbones y backends) |
| Version de runtime | ExecuTorch v1.4.1 (sin garantia de compatibilidad hacia atras) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la FCN clasica de Long et al., implementada en `torchvision.models.segmentation.fcn_resnet50` y `fcn_resnet101`. Se trata de una red totalmente convolucional que sustituye las capas densas de un clasificador ResNet por cabezas convolucionales y conexiones de salto (skip connections) que combinan caracteristicas de distintas profundidades para producir una mascara de segmentacion densa a resolucion de pixel. El backbone es ResNet-50 o ResNet-101, preentrenado en ImageNet y afinado para segmentacion semantica.

No se detalla en la model card el proceso de entrenamiento (numero de tokens o imagenes, composicion del dataset, tecnicas de aumento de datos ni si hubo refinamiento especifico). El modelo upstream de torchvision se entrena sobre COCO con las 21 clases de Pascal VOC, pero conviene verificar esta afirmacion en la documentacion oficial de torchvision antes de asumirla. Lo que si documenta el repositorio es el proceso de exportacion: cada variante se compila a ExecuTorch para un backend concreto (Core ML para Apple, XNNPACK para CPU generica, QNN para Hexagon NPU) y una precision concreta. Las variantes QNN se compilan por version de Hexagon (v69, v73, v75, v79, v81), de modo que el runtime selecciona el binario que corresponde al SoC del dispositivo.

Un detalle tecnico relevante: las variantes QNN no devuelven logits sino directamente el indice de clase por pixel con forma `(1, 520, 520)` int32, lo que evita el postprocesado de argmax en el dispositivo. El backend MLX se intento exportar pero no se publico; el repositorio incluye un `NOTES.md` que documenta el fallo.

## Capacidades

- Segmentacion semantica densa de imagenes: asigna una clase a cada pixel de una imagen de entrada de 520x520.
- 21 clases de segmentacion en el esquema Pascal VOC (fondo, persona, vehiculo, animal, mobiliario, etc., segun el modelo upstream de torchvision).
- Inferencia en dispositivo: ejecucion local en movil sin conexion a red.
- Aceleracion por backend: Core ML (GPU/ANE en Apple), XNNPACK (CPU) y QNN (NPU Hexagon en Qualcomm Snapdragon).
- Cuantizacion int8 y a8w8 para reducir huella de memoria y acelerar la inferencia en hardware limitado.
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues.
- No dispone de modo "thinking", vision generativa, audio ni ninguna capacidad conversacional.

## Casos de uso

- Segmentacion de personas y objetos en apps moviles de fotografia: el modelo clasifica cada pixel de una imagen de 520x520 y permite aplicar mascaras para recortes, fondos virtuales o efectos selectivos sin enviar la imagen a un servidor.
- Realidad aumentada en React Native: usar la mascara de segmentacion para superponer elementos graficos solo sobre las regiones de interes (por ejemplo, sustituir el fondo de una videollamada o resaltar objetos detectados).
- Accesibilidad: describir o resaltar regiones de una imagen capturada por la camara del movil para usuarios con discapacidad visual, aprovechando la inferencia local y la baja latencia.
- Procesamiento de documentos escaneados: segmentar regiones (texto, tablas, imagenes) en capturas moviles antes de aplicar OCR, con la ventaja de que el modelo corre en el dispositivo y preserva la privacidad.
- Automatizacion agricola o industrial en campo: clasificar suelo, vegetacion y objetos en imagenes capturadas por drones o camaras embebidas, usando la variante QNN para aprovechar la NPU de un Snapdragon.
- Control de calidad en fabricacion: detectar y delimitar defectos o piezas en imagenes de linea de produccion con un modelo int8 de 34 MB que cabe en dispositivos de bajo coste.
- Demos y prototipos de vision en React Native: integrar rapidamente un pipeline de segmentacion en una app movil usando la constante del registro de modelos de React Native ExecuTorch, sin gestionar la exportacion manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de mIoU, latencia ni throughput para ninguna de las variantes.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo se ejecuta en memoria unificada del dispositivo movil. El tamano en disco de cada variante orienta el consumo de memoria: 34 MB (ResNet-50 int8 XNNPACK), 52,5 MB (ResNet-101 int8 XNNPACK), 63,1 MB (ResNet-50 fp16 Core ML), 99,6 MB (ResNet-101 fp16 Core ML), 126 MB (ResNet-50 fp32 XNNPACK), 198 MB (ResNet-101 fp32 XNNPACK).
- GPU recomendadas: no aplica en el sentido de GPU de escritorio; el modelo esta pensado para moviles. En Apple se usa Core ML (GPU/ANE); en Qualcomm se usa la NPU Hexagon via QNN.
- Cabe en cualquier movil moderno: las variantes int8 de XNNPACK (34-52,5 MB) son las mas ligeras y aptas para dispositivos de gama media; las variantes QNN requieren un SoC Snapdragon con Hexagon v69 o superior (Snapdragon 8 Gen 1 en adelante).
- Opciones de despliegue: React Native ExecuTorch (libreria oficial), o un runtime ExecuTorch propio (version v1.4.1) cargando directamente los `.pte`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto/entrada | Licencia | Formato |
|---|---|---|---|---|---|
| fcn (este repo) | FCN + ResNet-50/101 | no disponible | 520x520 | BSD-3-Clause | ExecuTorch `.pte` |
| DeepLabV3 (torchvision) | DeepLabV3 + ResNet | no disponible | variable | BSD-3-Clause | PyTorch, exportable |
| LR-ASPP / MobileNetV3 (torchvision) | LR-ASPP + MobileNetV3 | no disponible | variable | BSD-3-Clause | PyTorch, exportable |
| Segment Anything (SAM) | ViT + prompt encoder | 91M-636M (segun variante) | 1024x1024 | Apache 2.0 (variantes) | PyTorch, ONNX |

La comparativa se limita a modelos de segmentacion de la misma categoria. No se dispone de datos de rendimiento (mIoU, latencia) para este repositorio, por lo que la comparacion cuantitativa no es posible con la informacion proporcionada. La ventaja diferencial de este repositorio frente a las alternativas de torchvision es el empaquetado listo para ExecuTorch con variantes por backend y precision.

## Limitaciones y advertencias

- Modelo de vision, no de lenguaje: no genera texto, no razona y no soporta conversacion ni tool calling.
- Resolucion de entrada fija de 520x520: imagenes de otra resolucion deben redimensionarse, lo que puede degradar la precision en objetos pequenos.
- Esquema de 21 clases cerrado (Pascal VOC): no reconoce clases fuera de ese conjunto; objetos no contemplados se asignaran a la clase mas cercana o al fondo.
- Compatibilidad estricta con ExecuTorch v1.4.1: versiones anteriores del runtime pueden fallar al cargar los `.pte`; no hay garantia de compatibilidad hacia adelante.
- Las variantes QNN estan ligadas a una version concreta de Hexagon; usar el archivo equivocado para el SoC del dispositivo provocara fallos de carga.
- El backend MLX no se publico; no hay variante para ese runtime.
- Riesgo de sesgo heredado del dataset de entrenamiento del modelo upstream (COCO/VOC): el rendimiento puede ser desigual entre categorias y contextos geograficos o culturales.
- Riesgo de alucinacion en el sentido de falsos positivos de segmentacion: regiones ambiguas pueden clasificarse de forma incorrecta sin indicacion de confianza en las variantes QNN (que devuelven indices de clase, no probabilidades).
- Licencia BSD-3-Clause: permite uso comercial con atribucion y sin endoso; conviene revisar los terminos del modelo upstream de torchvision y del dataset de entrenamiento antes de un despliegue comercial.
- No se documentan metricas de calidad (mIoU) ni latencia, por lo que la idoneidad para produccion debe validarse empiricamente en el dispositivo objetivo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/software-mansion/react-native-executorch-fcn
- Modelo upstream FCN (torchvision): https://docs.pytorch.org/vision/main/models/fcn.html
- Libreria React Native ExecuTorch (npm): https://www.npmjs.com/package/react-native-executorch
- Documentacion de React Native ExecuTorch (descarga de modelos): https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
- Nota sobre el backend MLX no publicado: https://huggingface.co/software-mansion/react-native-executorch-fcn/blob/main/mlx/NOTES.md
