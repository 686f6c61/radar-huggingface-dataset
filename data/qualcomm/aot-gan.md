# qualcomm/AOT-GAN

## Resumen

AOT-GAN es un modelo de aprendizaje automático para el borrado e inpaintado de partes de una imagen. Desarrollado originalmente por el grupo de investigación multimedia de la Universidad de Ciencia y Tecnología de China (según el paper arxiv:2104.01431), esta versión ha sido optimizada por Qualcomm para ejecutarse en sus dispositivos, especialmente en la NPU. El modelo permite eliminar objetos no deseados, restaurar zonas dañadas o rellenar regiones de una imagen de forma realista. Con 15,2 millones de parámetros y una resolución de entrada de 512x512, está diseñado para funcionar en tiempo real en hardware móvil. Su relevancia radica en llevar el inpaintado de alta resolución a dispositivos edge, con soporte para múltiples runtimes como ONNX, TFLite y QNN.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN con transformaciones contextuales agregadas (AOT-GAN, ver paper arxiv:2104.01431) |
| Parametros totales | 15,2 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen) |
| Tipos de cuantizacion | Float (los assets pre-exportados son float; no se mencionan cuantizaciones) |
| Idiomas soportados | No disponible (modelo de imagen, sin procesamiento de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX, QNN_DLC, TFLite (además de PyTorch) |

## Arquitectura y entrenamiento

La arquitectura se basa en el paper "Aggregated Contextual Transformations for High-Resolution Image Inpainting" (arxiv:2104.01431), que introduce capas de transformación contextual agregada para mejorar el inpaintado de imágenes de alta resolución. La model card no proporciona detalles sobre el proceso de entrenamiento, el número de tokens (no aplica) ni el dataset utilizado, salvo que el checkpoint es CelebAHQ, lo que indica un entrenamiento orientado a rostros humanos. No se menciona el uso de RLHF, DPO u otras técnicas de alineación, ya que no es un modelo de lenguaje.

## Capacidades

- Inpaintado de imágenes: borra y rellena regiones arbitrarias de una imagen de entrada.
- Edición de alta resolución: trabaja con imágenes de 512x512 píxeles.
- Optimizado para NPU de Qualcomm: puede ejecutarse en dispositivos Snapdragon y Dragonwing con baja latencia.
- Múltiples formatos de exportación: ONNX, QNN_DLC y TFLite, lo que facilita la integración en diferentes entornos.
- No es un modelo de texto: no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Eliminación de objetos no deseados en fotografías: el usuario selecciona una región y el modelo la rellena con contenido plausible, útil en aplicaciones de retoque fotográfico.
- Restauración de imágenes antiguas: elimina rasguños, manchas o zonas deterioradas en fotografías escaneadas.
- Retoque fotográfico en aplicaciones móviles: integración en apps de edición para borrar elementos no deseados de forma interactiva.
- Eliminación de marcas de agua o texto: limpia imágenes antes de su uso en publicaciones o documentos.
- Preprocesamiento para otras tareas de visión: elimina artefactos o regiones no deseadas para mejorar la precisión de modelos de detección o clasificación.
- Creación de contenido para diseño gráfico: reemplaza fondos o elementos en imágenes para composiciones creativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (PSNR, SSIM, etc.) en la información disponible. La model card solo incluye tiempos de inferencia en diferentes chipsets de Qualcomm. A continuación se muestran algunos valores representativos:

| Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) |
|---|---|---|---|---|
| ONNX | float | Snapdragon X2 Elite | 54,463 | 8 |
| ONNX | float | Snapdragon 8 Gen 3 Mobile | 96,129 | 11 - 720 |
| ONNX | float | Snapdragon 8 Elite Gen 5 Mobile | 50,95 | 5 - 511 |
| QNN_DLC | float | Snapdragon X2 Elite | 50,875 | 4 |
| QNN_DLC | float | Snapdragon 8 Elite Gen 5 Mobile | 46,964 | 3 - 491 |
| TFLITE | float | Snapdragon 8 Gen 3 Mobile | 88,177 | 0 - 718 |

Estos datos indican que el modelo es adecuado para aplicaciones en tiempo real en dispositivos móviles de gama alta.

## Requisitos de hardware

- Tamaño del modelo: 58 MB en float, por lo que cabe en cualquier GPU con más de 1 GB de VRAM.
- En dispositivos Qualcomm, se ejecuta en la NPU con tiempos de 50-200 ms según el chipset.
- En PC, se puede ejecutar con ONNX Runtime o PyTorch en CPU o GPU; no requiere hardware especializado.
- Opciones de despliegue: ONNX Runtime, TFLite, QNN (Qualcomm Neural Network) y PyTorch.
- Latencia estimada: entre 47 y 209 ms en los chipsets listados, dependiendo del runtime y la plataforma.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El modelo original de researchmm (AOT-GAN-for-Inpainting) es la base de esta versión, pero no se ofrecen métricas comparativas con otros modelos de inpaintado como LaMa, EdgeConnect o PatchMatch.

## Limitaciones y advertencias

- Entrenado principalmente en CelebAHQ, por lo que puede tener sesgos hacia rostros humanos y rendir peor en otros dominios (paisajes, objetos, etc.).
- Resolución fija de 512x512; imágenes de mayor tamaño requieren redimensionado previo, lo que puede degradar la calidad.
- No se proporcionan métricas de calidad, por lo que el rendimiento visual debe evaluarse empíricamente en cada caso de uso.
- Licencia MIT permite uso comercial, pero el modelo puede tener limitaciones en dominios fuera de caras.
- Los assets pre-exportados están optimizados para hardware Qualcomm; en otras plataformas el rendimiento puede variar.

## Enlaces

- HuggingFace: https://huggingface.co/qualcomm/AOT-GAN
- Qualcomm AI Hub: https://aihub.qualcomm.com/models/aotgan
- Repositorio GitHub de Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/aotgan
- Paper original: https://arxiv.org/abs/2104.01431
- Implementación original de researchmm: https://github.com/researchmm/AOT-GAN-for-Inpainting
