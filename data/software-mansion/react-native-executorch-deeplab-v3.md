# software-mansion/react-native-executorch-deeplab-v3

## Resumen

DeepLabV3 es un modelo de segmentación semántica de imágenes desarrollado originalmente por Meta AI Research (el upstream es la implementación de `torchvision`) y empaquetado en este repositorio por Software Mansion para su uso dentro de la librería React Native ExecuTorch. El repositorio no contiene pesos en formato PyTorch convencional, sino programas ExecuTorch (`.pte`) ya exportados y optimizados para ejecución en dispositivo (on-device), listos para consumirse desde aplicaciones React Native. Resuelve el problema de la segmentación semántica densa (asignar una clase a cada píxel) sin depender de un servidor ni de conectividad.

El repositorio ofrece tres arquitecturas backbone distintas (MobileNetV3-Large, ResNet-50 y ResNet-101) y múltiples backends de ejecución (Core ML para iOS, XNNPACK para CPU genérica y QNN para aceleración NPU en SoCs Qualcomm Snapdragon). Los ficheros van desde 10,8 MB (MobileNetV3-Large int8 en XNNPACK) hasta 224 MB (ResNet-101 fp32 en XNNPACK), lo que permite elegir el compromiso entre precisión y huella de memoria según el dispositivo objetivo.

Es relevante ahora porque el despliegue on-device de visión por computador en móvil se ha convertido en un requisito habitual (privacidad, latencia, offline), y este repositorio encapsula el trabajo de exportación a ExecuTorch v1.4.1 para tres backends distintos, incluyendo variantes cuantizadas a int8 y compiladas para versiones específicas del Hexagon DSP de Qualcomm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepLabV3 (encoder-decoder con backbone CNN; MobileNetV3-Large, ResNet-50 o ResNet-101) |
| Parametros totales | no disponible (depende del backbone; no publicado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen) |
| Tipos de cuantizacion | fp16 (Core ML), fp32 (XNNPACK), int8 (XNNPACK), a8w8 (QNN) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ExecuTorch `.pte` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

DeepLabV3 es una red de segmentación semántica que combina un backbone convolucional (MobileNetV3-Large, ResNet-50 o ResNet-101) con un cabezal de segmentación basado en convoluciones dilatadas (atrous) y agrupamiento de contexto multiescala, tal como se describe en la implementación de referencia de `torchvision`. El modelo produce un mapa de logits por clase y píxel; en las variantes QNN el artefacto exportado devuelve directamente el índice de clase por píxel con forma `(1, 520, 520)` en int32, mientras que las variantes Core ML y XNNPACK devuelven logits con forma `(1, 21, 520, 520)`, es decir, 21 clases sobre una entrada de 520×520 píxeles.

No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento, el número de tokens (no aplica), ni si hubo ajuste fino posterior. El trabajo de este repositorio es exclusivamente de exportación y empaquetado: los ficheros `.pte` se generan para el runtime ExecuTorch v1.4.1, sin garantía de compatibilidad hacia adelante, por lo que un runtime más antiguo puede fallar al cargarlos. Las variantes QNN incorporan un binario de contexto HTP compilado para una versión concreta de Hexagon (v69, v73, v75, v79, v81), de modo que el runtime selecciona el fichero correspondiente al SoC del dispositivo.

## Capacidades

- Segmentación semántica densa de imágenes: asigna una clase a cada píxel de una entrada de 520×520.
- Tres backbones con distinto compromiso precisión/coste: MobileNetV3-Large (el más ligero), ResNet-50 (equilibrado) y ResNet-101 (el más pesado y preciso).
- Ejecución on-device en iOS mediante el backend Core ML (fp16).
- Ejecución on-device en CPU genérica mediante XNNPACK (fp32 e int8).
- Aceleración en NPU Qualcomm Hexagon mediante QNN (a8w8) para Snapdragon 8 Gen 1, 8 Gen 2, 8 Gen 3, 8 Elite y 8 Elite Gen 5.
- Integración directa con la librería React Native ExecuTorch mediante constantes del registro de modelos de la librería.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de segmentación.

## Casos de uso

- Segmentación de personas y fondos en apps móviles: sustitución de fondo en tiempo real en aplicaciones de fotografía o videollamada, usando la variante MobileNetV3-Large int8 (10,8 MB) para minimizar el consumo de memoria en dispositivos de gama media.
- Edición fotográfica on-device: máscaras por clase (persona, coche, vegetación, etc.) generadas localmente sin subir la imagen a un servidor, lo que preserva la privacidad del usuario y funciona sin conectividad.
- Realidad aumentada: delimitación de superficies o regiones de la escena capturada por la cámara para superponer elementos virtuales, aprovechando la variante QNN a8w8 en dispositivos Snapdragon para reducir latencia.
- Asistencia a la conducción o análisis de escenas: segmentación de carretera, vehículos y peatones en flujos de vídeo de baja resolución procesados a bordo, con ResNet-50 como compromiso entre calidad y coste computacional.
- Automatización de documentos y formularios: detección de regiones (texto, tablas, firmas) en capturas escaneadas con el móvil, usando ResNet-101 cuando se requiere mayor fidelidad de contorno.
- Control de calidad industrial o agrícola: segmentación de defectos, frutos o piezas en imágenes capturadas con dispositivos móviles o embebidos, ejecutando el modelo en el propio dispositivo sin infraestructura de servidor.
- Preprocesado para otros pipelines de visión: generación de máscaras que alimentan etapas posteriores (OCR, clasificación, detección) dentro de una app React Native, con el modelo cargado una sola vez y reutilizado entre inferencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Huella en disco de los artefactos (no equivale a VRAM, ya que son modelos de inferencia on-device): MobileNetV3-Large int8 XNNPACK 10,8 MB; MobileNetV3-Large fp32 XNNPACK 42,1 MB; MobileNetV3-Large Core ML fp16 21,5 MB; ResNet-50 int8 XNNPACK 40,4 MB; ResNet-50 fp32 XNNPACK 151 MB; ResNet-50 Core ML fp16 75,9 MB; ResNet-101 int8 XNNPACK 58,9 MB; ResNet-101 fp32 XNNPACK 224 MB; ResNet-101 Core ML fp16 112 MB.
- VRAM estimada para inferencia: no disponible; el modelo está pensado para ejecutarse en CPU, GPU integrada o NPU de dispositivos móviles, no en GPU de escritorio.
- GPU recomendadas: no aplica en el sentido habitual; los backends soportados son Core ML (iOS), XNNPACK (CPU) y QNN (NPU Hexagon en Snapdragon 8 Gen 1, 8 Gen 2, 8 Gen 3, 8 Elite y 8 Elite Gen 5).
- Compatibilidad con GPU consumer (RTX 4090, etc.): no disponible; el repositorio no publica artefactos para CUDA.
- Opciones de despliegue: runtime ExecuTorch v1.4.1, integrado a través de la librería React Native ExecuTorch (npm `react-native-executorch`). No se publican artefactos para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Backbones | Backends | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|---|
| react-native-executorch-deeplab-v3 (este) | Segmentación semántica DeepLabV3 | MobileNetV3-Large, ResNet-50, ResNet-101 | Core ML, XNNPACK, QNN | fp16, fp32, int8, a8w8 | BSD-3-Clause | `.pte` (ExecuTorch) |
| DeepLabV3 en torchvision (upstream) | Segmentación semántica DeepLabV3 | MobileNetV3-Large, ResNet-50, ResNet-101 | PyTorch (CPU/GPU) | fp32, fp16 (según despliegue) | BSD-3-Clause | `.pth` / TorchScript |
| Segment Anything (SAM) | Segmentación promptable | ViT (varios tamaños) | PyTorch, ONNX | fp32, fp16, int8 | Apache-2.0 | `.pth`, ONNX |

La comparación con SAM es solo orientativa: SAM es segmentación promptable de propósito general y no ofrece clases semánticas predefinidas ni artefactos ExecuTorch publicados en este repositorio. No se dispone de datos de benchmarks que permitan comparar rendimiento numérico entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de segmentación con 21 clases sobre entrada fija de 520×520; no es un modelo generativo ni de lenguaje, por lo que no admite prompts, tool calling ni razonamiento.
- Los ficheros están publicados para ExecuTorch v1.4.1 y el runtime no garantiza compatibilidad hacia adelante: un runtime más antiguo puede fallar al cargarlos.
- Las variantes QNN están compiladas para una versión concreta de Hexagon (v69, v73, v75, v79, v81); es necesario seleccionar el fichero adecuado al SoC del dispositivo.
- El backend MLX fue exportado pero no publicado; el motivo se documenta en `mlx/NOTES.md` del repositorio.
- No se dispone de información sobre sesgos del modelo, riesgo de alucinación (no aplica en el sentido de modelos de lenguaje, pero sí puede producir segmentaciones erróneas en clases poco representadas) ni sobre el dataset de entrenamiento.
- La licencia BSD-3-Clause permite uso comercial con atribución y sin endoso; conviene revisar los términos del upstream de DeepLabV3 en torchvision por si hubiera condiciones adicionales.
- Para producción conviene validar la precisión de la segmentación en el dominio concreto de la aplicación, ya que las 21 clases de DeepLabV3 (definidas en el dataset de referencia de torchvision) pueden no cubrir las categorías de interés.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/software-mansion/react-native-executorch-deeplab-v3
- Modelo upstream DeepLabV3 (torchvision): https://docs.pytorch.org/vision/main/models/deeplabv3.html
- Librería React Native ExecuTorch (npm): https://www.npmjs.com/package/react-native-executorch
- Documentación de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
- Notas del backend MLX no publicado: https://huggingface.co/software-mansion/react-native-executorch-deeplab-v3/blob/main/mlx/NOTES.md
