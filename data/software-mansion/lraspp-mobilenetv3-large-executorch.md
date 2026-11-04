# software-mansion/LRASPP-MobileNetV3-Large-ExecuTorch

## Resumen

LRASPP-MobileNetV3-Large-ExecuTorch es la exportación a formato ExecuTorch del modelo de segmentación semántica LR-ASPP (Lite Reduced Atrous Spatial Pyramid Pooling) con backbone MobileNetV3-Large, empaquetado por el equipo de Software Mansion para su uso con la librería React Native ExecuTorch. No se trata de un modelo de lenguaje, sino de una red convolucional de visión orientada a segmentación densa de imágenes que corre íntegramente en dispositivo (on-device), sin necesidad de backend remoto.

El modelo original procede de torchvision, donde LR-ASPP con MobileNetV3-Large se distribuye como la variante ligera de segmentación semántica (entrenada sobre VOC/COCO, con 21 clases de salida en la configuración estándar). Software Mansion lo reexporta a `.pte` en varias variantes de backend y precisión: CoreML fp16, XNNPACK fp32 e int8, y QNN a8w8 compilado por versión de Hexagon (v69 a v81) para aceleración en la NPU de los Snapdragon. El tamaño del repositorio es de 0,1 GB y los binarios individuales van desde 3,4 MB (int8) hasta 12,3 MB (fp32).

Su relevancia es práctica: permite incorporar segmentación semántica en aplicaciones móviles React Native con ejecución local, sin depender de la nube, con variantes cuantizadas a int8 y kernels optimizados para NPU. Está publicado bajo licencia BSD-3-Clause, lo que facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN: MobileNetV3-Large (backbone) + LR-ASPP (cabecera de segmentación) |
| Parametros totales | no disponible (no se indica en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen, salida `(1, 520, 520)` o `(1, 21, 520, 520)` según backend) |
| Tipos de cuantizacion | fp16 (CoreML), fp32 (XNNPACK), int8 (XNNPACK), a8w8 (QNN) |
| Idiomas soportados | no disponible (no aplica: modelo de visión) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ExecuTorch `.pte` (CoreML, XNNPACK, QNN) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone convolucional MobileNetV3-Large, diseñado con bloques de convolución separable en profundidad, activaciones hard-swish y módulos de atención por squeeze-and-excitation, con una cabecera LR-ASPP. LR-ASPP simplifica el esquema ASPP clásico (pirámide espacial con convoluciones dilatadas) para reducir coste computacional en dispositivos móviles: agrega contexto global mediante pooling y combina features de baja y alta resolución para producir el mapa de segmentación.

No se detalla en la información disponible el proceso de entrenamiento (número de tokens o imágenes, composición del dataset, uso de RLHF/DPO —no aplicable aquí—). El modelo upstream es el LRASPP de torchvision, entrenado para segmentación semántica sobre un conjunto de 21 clases (configuración estándar VOC). La innovación técnica relevante en este repositorio no está en el entrenamiento sino en la exportación: conversión a ExecuTorch v1.4.1 con múltiples backends, cuantización int8 y a8w8, y compilación de contextos HTP de Hexagon por versión de SoC para ejecución en NPU.

## Capacidades

- Segmentación semántica densa de imágenes: asigna una clase por píxel sobre un mapa de salida de 520×520.
- Ejecución on-device en dispositivos móviles mediante el runtime ExecuTorch.
- Variantes para CPU (XNNPACK fp32/int8), GPU/NPU Apple (CoreML fp16) y NPU Qualcomm Hexagon (QNN a8w8).
- Salida en formato de logits `(1, 21, 520, 520)` en backends CoreML/XNNPACK y como índice de clase por píxel `(1, 520, 520)` int32 en las variantes QNN.
- Integración con la librería React Native ExecuTorch mediante constantes del registro de modelos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual y de una sola pasada.

## Casos de uso

- Segmentación de fondo en apps móviles React Native: eliminar o sustituir el fondo de una foto o feed de cámara en tiempo real, usando la variante int8 de XNNPACK (3,4 MB) para minimizar latencia y consumo.
- Realce selectivo por regiones: aplicar desenfoque, filtros o correcciones de color solo a zonas segmentadas (cielo, persona, vegetación) en editores de imagen móviles.
- Preprocesado para pipelines de visión: generar máscaras semánticas que alimenten etapas posteriores (detección, recorte, análisis) en aplicaciones de realidad aumentada.
- Automatización de recortes y composición: extraer siluetas o regiones de interés para generación de miniaturas y collages en apps de creación de contenido.
- Análisis de escenas en asistentes de accesibilidad: describir o resaltar regiones relevantes de una imagen capturada por la cámara del dispositivo sin enviar datos a la nube.
- Procesado offline y con privacidad: aplicaciones de campo, industria o salud que requieren segmentación de imágenes sin conectividad y sin salida de datos del dispositivo.
- Aceleración en dispositivos Snapdragon: usar las variantes QNN a8w8 correspondientes a la versión de Hexagon del SoC para descargar el trabajo de segmentación a la NPU y liberar CPU/GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Modelo diseñado para inferencia on-device en móviles; no requiere GPU de servidor.
- Tamaño de los binarios: 3,4 MB (XNNPACK int8), 6,6 MB (CoreML fp16), 12,3 MB (XNNPACK fp32); las variantes QNN se distribuyen por versión de Hexagon.
- Backends soportados: XNNPACK (CPU), CoreML (Apple), QNN (NPU Qualcomm Hexagon v69, v73, v75, v79, v81).
- SoCs Qualcomm de referencia indicados: Snapdragon 8 Gen 1 (v69), 8 Gen 2 (v73), 8 Gen 3 (v75), 8 Elite (v79), 8 Elite Gen 5 (v81).
- Despliegue mediante el runtime ExecuTorch v1.4.1; sin garantía de compatibilidad hacia adelante con runtimes anteriores.
- Integración en React Native a través del paquete `react-native-executorch`.
- VRAM, latencia y throughput: no disponibles en la información proporcionada.
- No aplica a GPU de escritorio (A100, H100, RTX 4090): el formato `.pte` está orientado a runtime móvil.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases de salida | Formatos | Licencia | Enfoque |
|---|---|---|---|---|---|
| LRASPP-MobileNetV3-Large-ExecuTorch (este) | MobileNetV3-Large + LR-ASPP | 21 | `.pte` (CoreML, XNNPACK, QNN) | BSD-3-Clause | On-device móvil vía ExecuTorch |
| DeepLabV3-MobileNetV3 (torchvision) | MobileNetV3 + DeepLabV3 | 21 | PyTorch (`.pth`) | BSD-3-Clause | Segmentación móvil en PyTorch, sin export ExecuTorch |
| FCN-ResNet50 (torchvision) | ResNet-50 + FCN | 21 | PyTorch (`.pth`) | BSD-3-Clause | Mayor capacidad, no orientado a móvil |
| Segment Anything (SAM) | ViT | clase-agnóstico (máscaras) | PyTorch, ONNX | Apache-2.0 | Segmentación promptable de propósito general, mucho más pesado |

Los datos de parámetros exactos y rendimiento comparado no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo de segmentación semántica con 21 clases (configuración VOC); no es un modelo de propósito general ni promptable.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta instrucciones.
- Compatibilidad estricta con ExecuTorch v1.4.1; sin garantía de compatibilidad hacia adelante, por lo que runtimes anteriores pueden fallar al cargar los `.pte`.
- Las variantes QNN están compiladas para una versión concreta de Hexagon; es necesario seleccionar el fichero correspondiente al SoC del dispositivo.
- El backend MLX no se publicó (solo se incluye un `NOTES.md` con el motivo); no hay variante MLX disponible.
- Formato de salida distinto según backend (logits frente a índices de clase): hay que adaptar el postprocesado.
- Riesgo de degradación en dominios alejados del dataset de entrenamiento (clases no cubiertas, condiciones de iluminación extremas).
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin endoso; conviene revisar los términos del modelo upstream de torchvision.
- No se documentan sesgos específicos ni métricas de robustez en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/software-mansion/LRASPP-MobileNetV3-Large-ExecuTorch
- Modelo upstream LRASPP (torchvision): https://docs.pytorch.org/vision/main/models/lraspp.html
- Librería React Native ExecuTorch: https://www.npmjs.com/package/react-native-executorch
- Documentación de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
- Repositorio de referencia con notas del backend MLX: https://huggingface.co/software-mansion/react-native-executorch-lraspp/blob/main/mlx/NOTES.md
