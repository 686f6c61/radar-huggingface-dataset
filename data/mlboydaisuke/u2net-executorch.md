# mlboydaisuke/U2Net-ExecuTorch

## Resumen

U2Net-ExecuTorch es una conversión del modelo U²-Net (U Square Net) a formato ExecuTorch con backend XNNPACK, diseñada para ejecutar segmentación de objetos salientes (salient object detection) directamente en dispositivos con recursos limitados. El modelo original, desarrollado por Xuebin Qin y colaboradores, fue publicado en Pattern Recognition 2020 y se caracteriza por su arquitectura de U-nested con bloques RSU (ReSidual U-block) que capturan características multi-escala. Esta versión, creada por mlboydaisuke, optimiza el modelo para inferencia on-device, ofreciendo dos variantes de precisión (fp32 e int8) que mantienen una alta paridad con el modelo eager original. Su relevancia radica en permitir tareas de segmentación en tiempo real en móviles, cámaras y sistemas embebidos sin depender de la nube, con un tamaño de archivo reducido (44 MB en int8) y una latencia media de 33 ms en Mac arm64.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U²-Net (nested U-structure con bloques RSU) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | fp32, int8 |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | .pte (ExecuTorch) |

## Arquitectura y entrenamiento

La arquitectura U²-Net se basa en una estructura de U anidada, donde cada nivel utiliza bloques RSU (ReSidual U-block) que combinan características de diferentes escalas mediante operaciones de convolución y pooling. El modelo original fue entrenado para detección de objetos salientes, utilizando el dataset DUTS y otros conjuntos de datos de segmentación. Esta conversión a ExecuTorch no modifica los pesos del modelo, sino que los transforma mediante `torch.export` y `to_edge_transform_and_lower` con el particionador XNNPACK, generando un archivo `.pte` que puede ejecutarse en dispositivos con el runtime de ExecuTorch. La model card indica que la cobertura del delegado XNNPACK es del 100% (477/477 operaciones) en la variante fp32, lo que garantiza que todas las operaciones se ejecutan de forma optimizada en el backend.

## Capacidades

- Segmentación de objetos salientes: genera una máscara de saliency (0-1) para cada píxel de la imagen de entrada, resaltando las regiones más prominentes.
- Extracción de primer plano: permite separar el objeto principal del fondo, útil para recorte de imágenes.
- Procesamiento de imágenes de 320x320 píxeles en formato RGB con normalización ImageNet.
- Inferencia on-device: gracias a la conversión a ExecuTorch, puede ejecutarse en CPU sin necesidad de GPU, con baja latencia (33 ms en int8 en Mac arm64).
- Soporte de precisión mixta: ofrece variantes fp32 e int8, permitiendo elegir entre máxima fidelidad o mayor velocidad y menor uso de memoria.
- Integración sencilla: al mantener la misma interfaz de tensores fp32, se puede intercambiar el archivo `.pte` sin modificar el código de la aplicación.

## Casos de uso

- Eliminación de fondo en fotografía: el modelo puede generar una máscara de saliency para recortar el sujeto principal y reemplazar el fondo, por ejemplo en aplicaciones de edición de imágenes móviles.
- Segmentación de personas en videoconferencia: al detectar la silueta humana, se puede aplicar un desenfoque de fondo o un fondo virtual en tiempo real, aprovechando la baja latencia de la variante int8.
- Preprocesamiento para otras tareas de visión: la máscara de saliency puede usarse como entrada para sistemas de clasificación o detección, reduciendo el área de búsqueda y mejorando la precisión.
- Realidad aumentada: la segmentación de objetos permite superponer elementos virtuales sobre el objeto saliente en aplicaciones de AR, con ejecución local en el dispositivo.
- Automatización de recorte de imágenes en lote: en entornos de servidor o edge, el modelo puede procesar imágenes de forma eficiente para generar recortes automáticos en pipelines de gestión de contenido.
- Asistencia a personas con discapacidad visual: la detección de objetos salientes puede ayudar a identificar elementos relevantes en una escena capturada por una cámara, integrándose en aplicaciones de asistencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Sin embargo, la model card proporciona datos de paridad y latencia que se resumen a continuación:

| Variante | Tamaño (MB) | Paridad vs fp32 eager (correlación) | Mac arm64 mediana (ms) |
|----------|-------------|--------------------------------------|------------------------|
| fp32 | 176.0 | 1.000000 | 56.5 |
| int8 | 44.3 | 0.980186 | 33.0 |

La paridad se midió sobre una imagen real, con una diferencia máxima absoluta de 5.239e-05 y correlación de 1.000000 en la salida. El tiempo de referencia de torch eager fp32 en la misma máquina fue de 138.5 ms, lo que muestra una mejora significativa de la versión ExecuTorch.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en CPU mediante el backend XNNPACK, sin necesidad de GPU dedicada.
- El archivo fp32 ocupa 176 MB, mientras que el int8 ocupa 44.3 MB, por lo que cabe en dispositivos con memoria limitada (móviles, Raspberry Pi, cámaras inteligentes).
- No se dispone de datos de VRAM específicos, pero al ser un modelo de visión con entrada 320x320, el consumo de memoria durante la inferencia es moderado y compatible con la mayoría de dispositivos edge.
- Se puede desplegar con el runtime de ExecuTorch, que soporta plataformas móviles (Android, iOS) y sistemas embebidos.
- La latencia medida en Mac arm64 (56.5 ms en fp32, 33 ms en int8) sugiere que en dispositivos móviles modernos se pueden alcanzar tasas de procesamiento de 15-30 FPS, dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de segmentación de objetos salientes en el contexto de ExecuTorch. El modelo original U-2-Net es la referencia principal, y esta conversión mantiene la misma arquitectura y pesos, solo que optimizada para inferencia on-device. Otras variantes como U-2-Net-LiteRT (también de mlboydaisuke) podrían ser comparables, pero no se han proporcionado datos de rendimiento o especificaciones en la información disponible.

## Limitaciones y advertencias

- El modelo está fijado a una resolución de entrada de 320x320 píxeles; imágenes de mayor resolución requieren un reescalado previo, lo que puede afectar a la precisión en objetos pequeños.
- La variante int8 presenta una paridad de 0.980186, lo que implica una ligera pérdida de fidelidad en las máscaras generadas, aunque es aceptable para la mayoría de aplicaciones.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datasets de imágenes naturales, puede tener un rendimiento subóptimo en dominios muy diferentes (imágenes médicas, radiografías, etc.).
- La licencia Apache-2.0 permite uso comercial y modificación, pero se debe mantener el aviso de copyright y la atribución correspondiente.
- No se incluye la variante fp16 porque no ofrece ventajas en tamaño ni velocidad, según la model card; se recomienda usar int8 para optimizar recursos.
- El modelo no soporta entradas de lenguaje ni tool calling; es exclusivamente para segmentación de imágenes.

## Enlaces

- [HuggingFace - mlboydaisuke/U2Net-ExecuTorch](https://huggingface.co/mlboydaisuke/U2Net-ExecuTorch)
- [GitHub - xuebinqin/U-2-Net (modelo original)](https://github.com/xuebinqin/U-2-Net)
- [Paper U²-Net (Pattern Recognition 2020)](https://github.com/xuebinqin/U-2-Net) (el enlace al paper no está disponible directamente, pero el repositorio lo referencia)
- [HuggingFace - mlboydaisuke/U-2-Net-LiteRT (variante similar)](https://huggingface.co/mlboydaisuke/U-2-Net-LiteRT)
- [Scripts de conversión - executorch-models](https://github.com/john-rocky/executorch-models)
