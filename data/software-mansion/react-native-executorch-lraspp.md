# software-mansion/react-native-executorch-lraspp

## Resumen

LRASPP (Lite R-ASPP) con backbone MobileNetV3-Large es un modelo de segmentación semántica ligero, originalmente publicado en TorchVision, que en este repositorio se distribuye exportado a ExecuTorch en formato `.pte` para su ejecución en dispositivo (on-device) a través de la librería React Native ExecuTorch de Software Mansion. No se trata de un modelo nuevo entrenado por el autor del repo, sino de un artefacto de despliegue: múltiples variantes compiladas del mismo modelo upstream para distintos backends de aceleración (Core ML, XNNPACK y Qualcomm QNN).

El modelo resuelve el problema de segmentación semántica densa (asignar una clase a cada píxel) en entornos móviles y de borde, con un coste computacional muy bajo. Su relevancia actual radica en que permite integrar segmentación de imágenes en aplicaciones React Native sin salir del dispositivo, evitando latencia de red y problemas de privacidad. La arquitectura combina un extractor de características MobileNetV3-Large con un cabezal LR-ASPP (Lite Reduced Atrous Spatial Pyramid Pooling), diseñado específicamente para minimizar parámetros y cómputo.

El repositorio ocupa aproximadamente 0,1 GB e incluye pesos compilados con precisiones fp16, fp32, int8 y a8w8, además de un directorio `mlx` con notas sobre un backend que no llegó a publicarse. Los ficheros están compilados para el runtime ExecuTorch v1.4.1 y no ofrecen garantía de compatibilidad hacia adelante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Large + cabezal LR-ASPP (segmentación semántica) |
| Parametros totales | no disponible (repo de 0,1 GB con múltiples variantes compiladas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 520x520) |
| Tipos de cuantizacion | fp16 (Core ML), fp32 (XNNPACK), int8 (XNNPACK), a8w8 (QNN) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ExecuTorch `.pte` (compilado por backend: coreml, xnnpack, qnn) |

## Arquitectura y entrenamiento

El modelo upstream LRASPP de TorchVision emplea MobileNetV3-Large como backbone para extracción de características y un cabezal LR-ASPP que agrega contexto multiescala mediante convoluciones dilatadas y pooling global, con un diseño deliberadamente reducido en parámetros y operaciones para inferencia en dispositivos con recursos limitados. La resolución de entrada observada en las variantes QNN es de 520x520 píxeles.

Este repositorio no documenta el proceso de entrenamiento: no se indica número de tokens ni de imágenes, composición del dataset, ni si hubo ajuste fino, RLHF o DPO. La información disponible se limita al proceso de exportación a ExecuTorch. Las variantes QNN incorporan un binario de contexto HTP compilado para una versión concreta de Hexagon (v69, v73, v75, v79, v81), lo que obliga a publicar un fichero por versión y a que el runtime seleccione el correspondiente al SoC del dispositivo. En estas variantes la salida es un índice de clase por píxel con forma `(1, 520, 520)` en int32, en lugar de los logits `(1, 21, 520, 520)` de las variantes Core ML y XNNPACK. El backend MLX fue exportado pero no publicado; el motivo se documenta en `mlx/NOTES.md`.

## Capacidades

- Segmentación semántica densa por píxel sobre imágenes de entrada de 520x520.
- Salida de 21 clases (deducible de la forma de logits `(1, 21, 520, 520)`), coherente con el conjunto VOC.
- Ejecución completamente on-device en React Native mediante React Native ExecuTorch.
- Aceleración por hardware según backend: Core ML (Apple, fp16), XNNPACK (CPU, fp32/int8) y QNN (HTP de Qualcomm, a8w8).
- Selección automática del binario QNN adecuado según la versión de Hexagon del dispositivo.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión.
- No dispone de capacidades multilingües ni de modo de razonamiento extendido.

## Casos de uso

- Segmentación en tiempo real en apps móviles React Native: integración directa mediante el pipeline de segmentación de React Native ExecuTorch, con inferencia local y sin llamadas a servidor.
- Eliminación o sustitución de fondo en aplicaciones de fotografía: el mapa de clases por píxel permite aislar regiones (persona, fondo) para composición o recorte.
- Realidad aumentada en el dispositivo: segmentación de la escena para superponer elementos virtuales respetando la silueta de objetos reales, con latencia baja al no depender de la red.
- Asistencia a personas con discapacidad visual: descripción de la escena basada en el mapa de segmentación, ejecutada localmente para preservar la privacidad de las imágenes capturadas.
- Preprocesado en pipelines de visión por computador: generación de máscaras semánticas como paso previo a tareas de detección o clasificación en el propio terminal.
- Aplicaciones de campo sin conectividad: inspección o etiquetado de imágenes en entornos sin red, aprovechando los backends XNNPACK (CPU) o QNN (NPU) según el hardware disponible.
- Prototipado y evaluación de modelos de segmentación en móvil: comparación de precisión y latencia entre variantes fp32, int8 y a8w8 sin necesidad de infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: los ficheros `.pte` publicados ocupan 6,6 MB (Core ML fp16), 12,3 MB (XNNPACK fp32) y 3,4 MB (XNNPACK int8); las variantes QNN no exponen su tamano en la informacion disponible.
- VRAM estimada para inferencia: no disponible; el modelo está orientado a memoria unificada de dispositivos móviles, no a GPU de escritorio.
- GPU recomendadas: no aplica en el sentido convencional; los backends objetivo son Core ML (Apple Silicon/ANE), XNNPACK (CPU ARM) y QNN (Hexagon HTP en Snapdragon 8 Gen 1, 8 Gen 2, 8 Gen 3, 8 Elite y 8 Elite Gen 5).
- Cabe en GPU consumer: no es el escenario de despliegue previsto; el modelo está pensado para ejecutarse en teléfonos.
- Opciones de despliegue: runtime ExecuTorch v1.4.1, a través de React Native ExecuTorch o de un runtime ExecuTorch propio; no se distribuyen pesos en safetensors ni GGUF, por lo que no es desplegable con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto/entrada | Licencia | Formato |
|---|---|---|---|---|---|
| LRASPP (este repo) | MobileNetV3-Large + LR-ASPP | no disponible | imagen 520x520 | BSD-3-Clause | ExecuTorch `.pte` |
| DeepLabV3 MobileNetV3 (TorchVision) | MobileNetV3 + DeepLabV3 | no disponible | imagen variable | BSD-3-Clause | PyTorch |
| FCN ResNet50 (TorchVision) | ResNet50 + FCN | no disponible | imagen variable | BSD-3-Clause | PyTorch |
| SegFormer (Hugging Face) | Transformer jerárquico | no disponible | imagen variable | Apache-2.0 / otras según variante | safetensors |

La comparación cuantitativa de rendimiento entre estos modelos no está disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de segmentación semántica: no genera texto, no razona y no admite instrucciones; cualquier uso fuera de visión es inviable.
- Sesgos: no documentados en la información disponible; al derivar del conjunto de entrenamiento upstream (probablemente VOC), puede presentar sesgo hacia las 20 clases de objetos de dicho conjunto y peor rendimiento en dominios no cubiertos.
- Riesgo de error en píxeles ambiguos u objetos no representados en las clases de entrenamiento; la salida es una etiqueta por píxel sin puntuación de confianza en las variantes QNN.
- Compatibilidad estricta: los ficheros están compilados para ExecuTorch v1.4.1 y no hay garantía de compatibilidad hacia adelante; un runtime más antiguo puede fallar al cargarlos.
- Las variantes QNN están atadas a una versión concreta de Hexagon; usar el fichero equivocado impedirá la ejecución en el dispositivo.
- El backend MLX no está publicado; no hay soporte para ese entorno en este repositorio.
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin endoso; conviene revisar los términos del modelo upstream de TorchVision.
- No se documentan límites de idioma ni de contexto porque no aplican, pero tampoco se documentan métricas de calidad (mIoU) para las variantes cuantizadas, lo que dificulta evaluar la pérdida de precisión respecto a fp32.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/software-mansion/react-native-executorch-lraspp
- Modelo upstream LRASPP en TorchVision: https://docs.pytorch.org/vision/main/models/lraspp.html
- Librería React Native ExecuTorch (npm): https://www.npmjs.com/package/react-native-executorch
- Documentación de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
- Notas del backend MLX no publicado: https://huggingface.co/software-mansion/react-native-executorch-lraspp/blob/main/mlx/NOTES.md
