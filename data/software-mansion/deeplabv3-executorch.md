# software-mansion/DeepLabV3-ExecuTorch

## Resumen

DeepLabV3-ExecuTorch es un repositorio de modelos de segmentación semántica de imágenes exportados al formato `.pte` de ExecuTorch, el runtime de inferencia on-device de PyTorch. Lo publica el equipo de Software Mansion dentro del ecosistema de React Native ExecuTorch, la librería que permite ejecutar modelos de IA directamente en dispositivos móviles desde aplicaciones React Native. El modelo subyacente es el DeepLabV3 de `torchvision`, un segmentador semántico clásico basado en una red troncal convolucional (MobileNetV3-Large, ResNet-50 o ResNet-101) con un cabezal de decodificación de convoluciones dilatadas y pooling piramidal (ASPP).

El repositorio no contiene pesos en el sentido tradicional (safetensors, GGUF), sino programas ejecutables de ExecuTorch compilados para distintos backends de aceleración: Core ML en iOS, XNNPACK como referencia portable y QNN para el acelerador Hexagon de Qualcomm en Android. Se ofrecen variantes en fp16, fp32, int8 y a8w8 (activaciones y pesos de 8 bits), lo que permite elegir un compromiso entre precisión y tamaño en función del dispositivo objetivo.

Su relevancia actual radica en que resuelve el problema de desplegar segmentación semántica en producción móvil sin necesidad de infraestructura de servidor: los artefactos van desde 10,8 MB (MobileNetV3-Large int8) hasta 224 MB (ResNet-101 fp32), y las variantes QNN están compiladas por versión de Hexagon (v69 a v81) para aprovechar la NPU de los Snapdragon más recientes. La licencia BSD-3-Clause facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepLabV3 (encoder convolucional + cabezal ASPP con convoluciones dilatadas); troncales: MobileNetV3-Large, ResNet-50, ResNet-101 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 520x520 según salida QNN) |
| Tipos de cuantizacion | fp16 (Core ML), fp32 (XNNPACK), int8 (XNNPACK), a8w8 (QNN) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | BSD-3-Clause |
| Formato de pesos | `.pte` (ExecuTorch), compilado para ExecuTorch v1.4.1 |

## Arquitectura y entrenamiento

DeepLabV3 es una arquitectura de segmentación semántica que combina una red troncal convolucional con un módulo ASPP (Atrous Spatial Pyramid Pooling), que aplica convoluciones dilatadas a varias escalas para capturar contexto multi-escala sin perder resolución espacial. En este repositorio se emplean tres troncales preentrenadas de `torchvision`: MobileNetV3-Large (la más ligera), ResNet-50 y ResNet-101 (las de mayor capacidad). La salida en los artefactos QNN es un mapa de índices de clase por píxel con forma `(1, 520, 520)` en int32, mientras que las variantes Core ML y XNNPACK devuelven logits con forma `(1, 21, 520, 520)`, lo que indica un conjunto de 21 clases de segmentación (el estándar de VOC en la implementación de referencia de `torchvision`).

No se documenta en la información proporcionada el proceso de entrenamiento (número de tokens o imágenes, composición del dataset, uso de RLHF/DPO), que corresponde al modelo original de `torchvision` y no a esta exportación. La innovación técnica destacable aquí no está en el modelo sino en el pipeline de exportación: compilación a ExecuTorch con múltiples backends, cuantización int8 y a8w8, y empaquetado de contextos binarios HTP específicos por versión de Hexagon para QNN. Los ficheros están publicados para ExecuTorch v1.4.1 y no hay garantía de compatibilidad hacia adelante con runtimes anteriores.

## Capacidades

- Segmentación semántica densa de imágenes: asigna una clase a cada píxel de la imagen de entrada.
- Tres troncales con distinto compromiso precisión/tamaño: MobileNetV3-Large (más ligera), ResNet-50 y ResNet-101 (mayor capacidad).
- Ejecución on-device en iOS mediante Core ML (fp16) y en Android mediante XNNPACK (fp32/int8) o la NPU Hexagon vía QNN (a8w8).
- Variantes QNN compiladas para Hexagon v69, v73, v75, v79 y v81, con selección automática del binario según el SoC.
- Salida en dos formatos según backend: logits `(1, 21, 520, 520)` en Core ML/XNNPACK e índices de clase `(1, 520, 520)` en QNN.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Segmentación de personas y objetos en apps móviles de fotografía: el modelo permite separar sujeto y fondo en tiempo real en el dispositivo; la variante MobileNetV3-Large int8 (10,8 MB) es adecuada para gamas medias sin depender de la nube.
- Eliminación o sustitución de fondo en editores de imagen: se usa la máscara por píxel para componer capas; la variante Core ML fp16 (21,5 MB) aprovecha la GPU/Neural Engine de iOS con latencia baja.
- Realidad aumentada y filtros en tiempo real: la segmentación por fotograma permite aplicar efectos solo a la región de interés; la variante QNN a8w8 en Snapdragon 8 Gen 2 o superior aprovecha la NPU Hexagon para mantener el framerate.
- Asistencia a la conducción o robótica de bajo coste: segmentación de calzada, peatones y obstáculos en dispositivos embebidos con Android; ResNet-50 int8 (40,4 MB) ofrece más precisión que MobileNetV3 manteniendo un tamaño contenido.
- Análisis de imágenes médicas o industriales en campo: la variante ResNet-101 fp32 (224 MB) permite inspección visual con mayor capacidad en dispositivos con suficiente memoria, sin enviar datos sensibles a un servidor.
- Preprocesado en pipelines de visión por computador: generar máscaras semánticas on-device antes de enviar solo regiones relevantes a un servidor, reduciendo ancho de banda y coste de cómputo.
- Aplicaciones React Native multiplataforma: integración directa mediante `react-native-executorch`, pasando la constante del registro de modelos a la tarea de segmentación correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada según variante: MobileNetV3-Large int8 10,8 MB; MobileNetV3-Large fp32 42,1 MB; ResNet-50 int8 40,4 MB; ResNet-50 fp32 151 MB; ResNet-101 int8 58,9 MB; ResNet-101 fp32 224 MB; Core ML fp16 21,5 MB (MobileNetV3), 75,9 MB (ResNet-50) y 112 MB (ResNet-101).
- GPU/aceleradores recomendados: Neural Engine y GPU en iOS vía Core ML; CPU con XNNPACK en Android; NPU Hexagon (HTP) en Snapdragon con QNN. En escritorio o servidor, XNNPACK sobre CPU.
- Cabe en GPU consumer y en móviles de gama media: la variante MobileNetV3-Large int8 (10,8 MB) es la más indicada para dispositivos con poca memoria; ResNet-101 fp32 (224 MB) requiere dispositivos con al menos ~256 MB libres para el modelo.
- Opciones de despliegue: runtime ExecuTorch v1.4.1, React Native ExecuTorch (`react-native-executorch`), Core ML, XNNPACK y QNN. No se distribuyen artefactos para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño de artefacto | Contexto/entrada | Licencia | Despliegue |
|---|---|---|---|---|---|
| DeepLabV3-ExecuTorch (este) | DeepLabV3 + MobileNetV3/ResNet | 10,8 MB – 224 MB | 520x520 | BSD-3-Clause | ExecuTorch (Core ML, XNNPACK, QNN) |
| DeepLabV3 original (torchvision) | DeepLabV3 + ResNet | Pesos PyTorch (~230 MB ResNet-101) | Entrada configurable | BSD-3-Clause | PyTorch (servidor/escritorio) |
| MobileNetV3 segmentation (torchvision) | MobileNetV3 + cabezal Lite R-ASPP | Pesos PyTorch (~10 MB) | Entrada configurable | BSD-3-Clause | PyTorch |
| Segment Anything (SAM) | Transformer ViT | Cientos de MB a GB | Resolución variable | Apache 2.0 (variantes) | PyTorch/ONNX |

La comparativa se limita a alternativas de la misma categoría (segmentación semántica); los datos de rendimiento de las alternativas no están disponibles en la información proporcionada, por lo que no se comparan métricas de calidad.

## Limitaciones y advertencias

- Modelo puramente visual: no procesa texto, no razona y no soporta instrucciones en lenguaje natural.
- Conjunto de 21 clases heredado de la implementación de referencia de `torchvision`; no cubre categorías arbitrarias fuera de ese vocabulario.
- Resolución de entrada fija de 520x520 en los artefactos QNN; imágenes de otra resolución deben redimensionarse, lo que puede degradar la precisión en objetos pequeños.
- Los ficheros están compilados para ExecuTorch v1.4.1 y no hay garantía de compatibilidad con runtimes anteriores o posteriores; verificar antes de desplegar.
- Las variantes QNN están atadas a una versión concreta de Hexagon (v69–v81); un dispositivo con otra versión no podrá cargar el binario correspondiente.
- El backend MLX fue exportado pero no publicado; su nota de fallo está en el repositorio y no debe asumirse su disponibilidad.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de errores de segmentación en clases poco representadas o condiciones de iluminación adversas.
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin endoso; revisar los términos del modelo original de `torchvision` (también BSD-3-Clause).
- No se documentan sesgos demográficos ni de dominio; al ser un modelo de segmentación genérico, puede tener peor rendimiento en dominios alejados de los datos de entrenamiento originales.

## Enlaces

- HuggingFace: https://huggingface.co/software-mansion/DeepLabV3-ExecuTorch
- Repositorio de notas MLX: https://huggingface.co/software-mansion/react-native-executorch-deeplab-v3/blob/main/mlx/NOTES.md
- Documentación de React Native ExecuTorch: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Paquete npm: https://www.npmjs.com/package/react-native-executorch
- Modelo original DeepLabV3 (torchvision): https://docs.pytorch.org/vision/main/models/deeplabv3.html
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
