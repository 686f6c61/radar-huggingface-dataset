# software-mansion/rf-detr-nano-ExecuTorch

## Resumen

RF-DETR Nano ExecuTorch es una exportación del modelo de detección de objetos RF-DETR Nano (desarrollado originalmente por Roboflow) a formato ExecuTorch `.pte`, publicada por Software Mansion para su uso con la librería React Native ExecuTorch. El modelo permite ejecutar detección de objetos directamente en dispositivos móviles y de borde, sin necesidad de un servidor, integrado en aplicaciones React Native.

RF-DETR es un detector basado en la arquitectura DETR (Detection Transformer) con un backbone ligero, en su variante "nano" orientada a eficiencia computacional. Esta exportación concreta no entrena un modelo nuevo, sino que convierte los pesos del modelo upstream a un formato ejecutable por el runtime ExecuTorch v1.4.1, con variantes optimizadas para distintos backends de aceleración (CoreML, Vulkan, XNNPACK).

La relevancia actual radica en la creciente demanda de inferencia en dispositivo para tareas de visión por computador con privacidad y latencia baja. El repositorio ocupa 0,7 GB e incluye cuatro variantes de precisión (fp16, fp32, int8) y backend, con métricas de precisión publicadas para la variante int8 frente a fp32 sobre COCO val2017.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR (Detection Transformer), variante Nano |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | fp16, fp32, int8 (activaciones dinámicas int8, pesos int8 per-channel en capas Linear; convoluciones en fp32) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ExecuTorch `.pte` (variantes CoreML, Vulkan, XNNPACK) |
| Backends soportados | coreml (fp16), vulkan (fp16), xnnpack (fp32, int8) |
| Tamaño del repositorio | 0,7 GB |
| Runtime compatible | ExecuTorch v1.4.1 |
| Tarea | object-detection |
| Descargas | 360 |
| Likes | 1 |

## Arquitectura y entrenamiento

El modelo upstream RF-DETR Nano es un detector de objetos basado en la familia DETR (Detection Transformer), que combina un backbone convolucional ligero con un decoder transformer para la predicción de cajas y clases. La variante "nano" está dimensionada para minimizar el coste computacional y encajar en dispositivos con recursos limitados. La model card no detalla el número exacto de parámetros, la composición del dataset de entrenamiento, ni si se aplicaron técnicas de destilación o ajuste fino específicas.

Esta publicación no incluye entrenamiento nuevo: se trata de una conversión de los pesos del modelo RF-DETR Nano original a formato ExecuTorch mediante el flujo de exportación de PyTorch. La innovación técnica principal reside en la cuantización int8 aplicada selectivamente: las capas Linear usan activaciones int8 dinámicas y pesos int8 per-channel, mientras que las convoluciones permanecen en fp32 para preservar precisión. Según la model card, esta estrategia mantiene la precisión casi intacta (ver benchmarks). El repositorio incluye un directorio `mlx` con un `NOTES.md` que documenta un backend exportado pero no publicado por problemas técnicos.

## Capacidades

- Detección de objetos en imágenes: predicción de cajas delimitadoras y clases sobre imágenes de entrada.
- Inferencia en dispositivo: ejecución local sin servidor, mediante el runtime ExecuTorch.
- Aceleración por backend: CoreML (Apple), Vulkan (GPU multiplataforma) y XNNPACK (CPU).
- Cuantización int8: variante de 37,3 MB para despliegue con huella de memoria reducida.
- Integración con React Native: uso directo a través de la librería react-native-executorch mediante las constantes del registro de modelos.
- No soporta tool calling, agentes, generación de texto ni capacidades multilingües (es un modelo exclusivamente de visión).
- No dispone de modo "thinking" ni procesamiento de audio.

## Casos de uso

- Detección de objetos en aplicaciones móviles React Native: integración del `.pte` con la pipeline de detección de react-native-executorch para identificar objetos en tiempo real desde la cámara del dispositivo, sin enviar imágenes a un servidor.
- Privacidad en el procesamiento de imágenes: al ejecutarse en dispositivo, las imágenes no salen del terminal, lo que resulta adecuado para aplicaciones de salud, documentación personal o entornos regulados.
- Control de calidad industrial en el borde: despliegue en dispositivos con GPU integrada (Vulkan) para inspección visual de productos en líneas de fabricación, usando la variante fp16.
- Moderación de contenido visual en cliente: detección de objetos o elementos no deseados en imágenes subidas por usuarios antes de su envío a un backend, reduciendo carga de red y coste de servidor.
- Asistencia a personas con discapacidad visual: identificación de objetos cercanos mediante la cámara del móvil, con la variante int8 para minimizar consumo de batería y memoria (37,3 MB).
- Aplicaciones de realidad aumentada: localización de objetos en el entorno capturado por la cámara para superponer información o elementos interactivos, aprovechando la latencia baja de la inferencia local.
- Automatización de inventario en dispositivos de borde: conteo y clasificación de artículos en almacenes mediante dispositivos de bajo consumo con backend XNNPACK.

## Benchmarks y rendimiento

La model card proporciona una única métrica de precisión comparando fp32 e int8 sobre las primeras 500 imágenes de COCO val2017:

| Variante | Backend | Precisión | COCO box mAP50-95 (500 imgs val2017) |
|---|---|---|---|
| fp32 | xnnpack | fp32 | 50,15 |
| int8 | xnnpack | int8 (8da8w) | 49,76 |

No se han publicado resultados de benchmarks adicionales (latencia, throughput, comparación con otros modelos) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: la variante int8 ocupa 37,3 MB en disco; la fp16 (CoreML y Vulkan) 51,5-52,2 MB; la fp32 106 MB. El consumo en memoria durante inferencia no está documentado, pero será del orden del tamaño del modelo más los buffers de activación.
- GPU recomendadas: no se especifican modelos concretos; la variante Vulkan está pensada para GPUs compatibles con Vulkan en dispositivos móviles y de borde. La variante CoreML requiere hardware Apple (Neural Engine/GPU).
- Compatibilidad con GPU de consumo: no disponible (el modelo está orientado a dispositivos móviles y de borde, no a GPUs de escritorio; no se documenta soporte para RTX 4090, A100 o H100).
- Opciones de despliegue: runtime ExecuTorch v1.4.1; integración con react-native-executorch; backends CoreML, Vulkan y XNNPACK.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de otros modelos en la información proporcionada. La model card no incluye comparaciones con alternativas como YOLO, otros detectores DETR o variantes de RF-DETR de mayor tamaño.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RF-DETR Nano ExecuTorch | no disponible | no aplica | Apache 2.0 | ExecuTorch `.pte` | Detección en dispositivo |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos |

## Limitaciones y advertencias

- Modelo exclusivamente de visión: no procesa texto, no soporta generación, razonamiento ni tool calling.
- Sin garantía de compatibilidad hacia adelante: ExecuTorch no garantiza que versiones posteriores del runtime carguen estos `.pte`; se requiere la versión v1.4.1 o compatible.
- La variante int8 mantiene las convoluciones en fp32, por lo que la reducción de tamaño no es total y el rendimiento puede variar según el backend.
- Precisión medida solo sobre 500 imágenes de COCO val2017; no hay evaluación sobre otros dominios ni datasets.
- No se documentan sesgos, tasas de alucinación (no aplica en detección, pero sí falsos positivos/negativos) ni limitaciones por idioma.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo upstream RF-DETR y de los datos de entrenamiento originales.
- El backend MLX fue exportado pero no publicado; su `NOTES.md` documenta problemas técnicos no detallados en la información disponible.
- El tamaño del repositorio (0,7 GB) incluye múltiples variantes; para producción conviene descargar solo la variante necesaria.

## Enlaces

- Hugging Face: https://huggingface.co/software-mansion/rf-detr-nano-ExecuTorch
- Modelo upstream RF-DETR (Roboflow): https://github.com/roboflow/rf-detr
- Librería React Native ExecuTorch: https://www.npmjs.com/package/react-native-executorch
- Documentación de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
- Notas del backend MLX no publicado: https://huggingface.co/software-mansion/react-native-executorch-rfdetr-nano-detector/blob/main/mlx/NOTES.md
