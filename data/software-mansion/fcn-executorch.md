# software-mansion/FCN-ExecuTorch

## Resumen

FCN-ExecuTorch es un repositorio de modelos de segmentación semántica de imágenes basados en la arquitectura Fully Convolutional Network (FCN) con backbone ResNet-50 y ResNet-101, exportados como programas ExecuTorch `.pte` para su ejecución en dispositivo (on-device). Lo desarrolla Software Mansion, el equipo responsable de la librería React Native ExecuTorch, y el modelo upstream procede de `torchvision` (variantes `fcn_resnet50` y `fcn_resnet101` entrenadas sobre el dataset COCO, con 21 clases incluyendo el fondo).

El repositorio no contiene pesos en formato tradicional (safetensors o GGUF), sino artefactos compilados para distintos backends de ejecución: CoreML (fp16), XNNPACK (fp32 e int8) y QNN (cuantización a8w8) para aceleradores Hexagon de Qualcomm. El objetivo es permitir segmentación semántica densa directamente en móviles y dispositivos embebidos, sin depender de servidores, dentro del ecosistema React Native.

Es relevante ahora porque facilita el despliegue de visión por computador en aplicaciones React Native con aceleración específica por hardware (NPU Hexagon, Neural Engine de Apple, CPU con XNNPACK), reduciendo la huella de memoria hasta 34 MB en la variante int8 de ResNet-50. El repositorio ocupa 2,8 GB en total por acumular 16 variantes de compilación, y está publicado bajo licencia BSD-3-Clause.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fully Convolutional Network (FCN) con backbone ResNet-50 o ResNet-101 |
| Parametros totales | no disponible (no se detalla el recuento exacto en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen, salida `(1, 21, 520, 520)` logits o `(1, 520, 520)` índices de clase) |
| Tipos de cuantizacion | fp16 (CoreML), fp32 (XNNPACK), int8 (XNNPACK), a8w8 (QNN) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ExecuTorch `.pte` (programas compilados por backend) |

## Arquitectura y entrenamiento

El modelo upstream es la FCN de `torchvision`, una red totalmente convolucional que sustituye las capas densas de un clasificador por convoluciones, produciendo mapas de segmentación densos a resolución de píxel. El backbone es ResNet-50 o ResNet-101, y la cabeza de segmentación genera 21 canales de logits correspondientes a las clases del dataset COCO (20 clases de objeto más fondo). La resolución de salida observada en las variantes QNN es de 520x520 píxeles.

No se dispone de información sobre el proceso de entrenamiento (número de tokens o imágenes, composición exacta del dataset, uso de RLHF/DPO) en la model card proporcionada; se infiere que procede del entrenamiento estándar de `torchvision` sobre COCO, pero no se confirma. La innovación técnica principal del repositorio no está en la arquitectura, sino en la exportación multiplataforma: una misma red se compila para CoreML, XNNPACK y QNN, con cuantización int8 y a8w8 para reducir el tamaño y aprovechar aceleradores. Las variantes QNN incorporan un contexto HTP compilado por versión de Hexagon (v69 a v81), de modo que el runtime selecciona el binario adecuado al SoC del dispositivo.

## Capacidades

- Segmentación semántica densa de imágenes: asigna una clase por píxel entre 21 categorías (COCO).
- Ejecución on-device en dispositivos móviles y embebidos mediante el runtime ExecuTorch.
- Aceleración por hardware específico: Neural Engine (CoreML), CPU SIMD (XNNPACK) y NPU Hexagon (QNN).
- Cuantización int8 y a8w8 para reducir memoria y latencia en dispositivos de gama media.
- Selección automática por parte del runtime del binario QNN correspondiente a la versión Hexagon del dispositivo.
- Integración con React Native ExecuTorch mediante constantes del registro de modelos de la librería.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto; es exclusivamente un modelo de visión.

## Casos de uso

- Segmentación en tiempo real en apps React Native: usar la variante XNNPACK int8 (34 MB para ResNet-50) para procesar fotogramas de cámara en dispositivos de gama media sin salir del dispositivo.
- Modo retrato o eliminación de fondo: emplear los mapas de clase por píxel para separar personas y objetos del fondo en apps de fotografía, aprovechando la clase "person" del conjunto COCO.
- Realidad aumentada móvil: segmentar la escena para superponer elementos virtuales solo sobre regiones identificadas (por ejemplo, suelo o mesa) con latencia baja gracias a la aceleración NPU en Snapdragon.
- Asistencia a la conducción o dashcams embebidas: identificar clases como coche, persona, bicicleta o semáforo en fotogramas de vídeo, con la variante QNN a8w8 para aprovechar el HTP del SoC.
- Automatización de inventario o control de calidad industrial: segmentar objetos en imágenes capturadas por cámaras fijas en dispositivos con Snapdragon, ejecutando el modelo localmente sin conectividad.
- Accesibilidad para personas con discapacidad visual: describir la distribución de objetos en una escena capturada por la cámara del teléfono, combinando la salida de segmentación con lógica de aplicación.
- Preprocesado en pipelines de visión: generar máscaras semánticas en el dispositivo antes de enviar solo las regiones relevantes a un servidor, reduciendo ancho de banda y preservando privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria estimada: no disponible de forma explícita; los tamaños de los artefactos permiten estimarla. ResNet-50 int8 XNNPACK: 34,0 MB; ResNet-50 fp32 XNNPACK: 126 MB; ResNet-50 fp16 CoreML: 63,1 MB; ResNet-101 int8 XNNPACK: 52,5 MB; ResNet-101 fp32 XNNPACK: 198 MB; ResNet-101 fp16 CoreML: 99,6 MB.
- GPU recomendadas: no aplica en el sentido de GPU de escritorio; el modelo está orientado a aceleradores móviles. CoreML usa el Neural Engine de Apple; QNN usa el Hexagon NPU de Qualcomm (Snapdragon 8 Gen 1 a 8 Elite Gen 5); XNNPACK usa la CPU.
- Compatibilidad con GPU de consumo: no está documentada para A100, H100 o RTX 4090; el runtime objetivo es ExecuTorch en dispositivo, no servidores con CUDA.
- Opciones de despliegue: React Native ExecuTorch (librería npm `react-native-executorch`) o un runtime ExecuTorch propio. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible en la información proporcionada.
- Nota de compatibilidad: los `.pte` están publicados para ExecuTorch v1.4.1 y el runtime no garantiza compatibilidad hacia adelante; un runtime más antiguo puede fallar al cargarlos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolucion de salida | Clases | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FCN-ExecuTorch (este) | FCN + ResNet-50/101 | 520x520 | 21 (COCO) | `.pte` (CoreML, XNNPACK, QNN) | BSD-3-Clause | HuggingFace, 480 descargas |
| DeepLabV3 (torchvision) | DeepLabV3 + ResNet | variable | 21 (COCO) | PyTorch, exportable a ExecuTorch | BSD-3-Clause | Disponible en torchvision |
| SegFormer (HuggingFace) | Transformer jerárquico | variable | ADE20K / COCO | safetensors, ONNX | Apache-2.0 / varía | Amplia disponibilidad |
| MobileNetV3 + LR-ASPP | MobileNetV3 | variable | 21 (COCO) | PyTorch, ONNX | BSD-3-Clause | torchvision |

La comparativa se limita a alternativas de segmentación semántica general; los datos de rendimiento de cada alternativa no están disponibles en la información proporcionada para este modelo, por lo que no se ofrece una comparación numérica de precisión.

## Limitaciones y advertencias

- El modelo solo reconoce las 21 clases del dataset COCO; objetos fuera de ese vocabulario se asignarán probablemente a fondo o a una clase incorrecta.
- La resolución de salida observada en las variantes QNN es de 520x520; los detalles finos (objetos pequeños) pueden perderse en la segmentación.
- No hay información sobre sesgos del modelo upstream; los modelos entrenados sobre COCO pueden mostrar sesgos de representación según región geográfica, iluminación y demografía de las imágenes de entrenamiento.
- Riesgo de errores de clasificación por píxel en escenas con oclusión, baja iluminación o dominios visuales alejados de COCO.
- Los artefactos están vinculados a ExecuTorch v1.4.1; no hay garantía de compatibilidad con versiones anteriores ni posteriores del runtime.
- Las variantes QNN están compiladas por versión de Hexagon (v69 a v81); usar un binario con una versión distinta a la del SoC puede impedir la carga o el funcionamiento correcto.
- El backend MLX fue exportado pero no publicado; no está disponible para ese runtime.
- La licencia BSD-3-Clause permite uso comercial con atribución y sin uso del nombre del autor para promocionar derivados, pero conviene revisar los términos exactos del modelo upstream de `torchvision`.
- No hay datos de benchmarks publicados, por lo que no se puede garantizar un nivel de precisión concreto en producción sin evaluación propia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/software-mansion/FCN-ExecuTorch
- Modelo upstream FCN (torchvision): https://docs.pytorch.org/vision/main/models/fcn.html
- Librería React Native ExecuTorch: https://www.npmjs.com/package/react-native-executorch
- Documentación de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
- Nota del backend MLX no publicado: https://huggingface.co/software-mansion/react-native-executorch-fcn/blob/main/mlx/NOTES.md
