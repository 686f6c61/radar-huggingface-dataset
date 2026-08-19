# mlboydaisuke/ormbg-ExecuTorch

## Resumen

El modelo `mlboydaisuke/ormbg-ExecuTorch` es una conversión a formato ExecuTorch del modelo de segmentación de imágenes `schirrmacher/ormbg`, diseñado específicamente para la eliminación de fondo en imágenes. El autor, mlboydaisuke, ha adaptado el modelo original (basado en la arquitectura ISNet) para su ejecución en dispositivos con recursos limitados, aprovechando el runtime de ExecuTorch y los delegados XNNPACK (CPU) y Core ML (Apple Neural Engine). El modelo acepta una imagen RGB de 1024×1024 píxeles y devuelve una máscara alfa de la misma resolución, lista para separar el sujeto del fondo.

La relevancia actual radica en la creciente demanda de procesamiento de imágenes en el dispositivo (on-device) para aplicaciones móviles, videoconferencia, comercio electrónico y realidad aumentada, donde la privacidad y la baja latencia son críticas. El repositorio incluye tres variantes del archivo `.pte` (fp32, int8 y Core ML fp16) que permiten equilibrar precisión, tamaño y velocidad según la plataforma de destino. Con un tamaño de repositorio de 0.3 GB y una licencia Apache-2.0, este modelo ofrece una solución práctica y portable para integrar eliminación de fondo en tiempo real en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ISNet (modelo base: schirrmacher/ormbg) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | fp32, int8, fp16 (solo Core ML) |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | .pte (ExecuTorch) |

## Arquitectura y entrenamiento

La arquitectura subyacente es ISNet, un modelo de segmentación de imágenes basado en redes neuronales convolucionales, originalmente entrenado por schirrmacher para la tarea de eliminación de fondo. En este repositorio no se proporcionan detalles sobre el proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO), ya que se trata de una conversión del modelo ya entrenado a formato ExecuTorch. La conversión se realiza mediante `torch.export` seguido de `to_edge_transform_and_lower(partitioner)` para generar el archivo `.pte`, utilizando los scripts disponibles en el repositorio `executorch-models`.

La innovación técnica principal de esta versión es la optimización para despliegue en dispositivos: se ofrecen tres variantes del mismo grafo computacional, cada una con un delegado diferente. La variante fp32 y int8 utilizan XNNPACK (CPU), mientras que la variante Core ML se compila para el Neural Engine de Apple (iOS). Según la model card, la cobertura del delegado XNNPACK es del 100% (467/467 operaciones), lo que garantiza que todo el grafo se ejecuta de forma nativa sin fallbacks a operadores de referencia.

## Capacidades

- Segmentación de imágenes con salida de máscara alfa (canal 0-1) para separar el sujeto del fondo.
- Entrada de imagen RGB de 1024×1024 píxeles con valores normalizados entre 0 y 1.
- Ejecución en CPU mediante XNNPACK (portátil para Android y otros sistemas) y en el Neural Engine de Apple mediante Core ML (iOS).
- Tres variantes de precisión (fp32, int8, Core ML fp16) que permiten intercambiar el archivo `.pte` sin modificar el código de la aplicación.
- Optimizado para inferencia en tiempo real en dispositivos con recursos limitados.
- No incluye capacidades de texto, tool calling, agentes ni razonamiento multimodal; es un modelo puramente de visión.

## Casos de uso

- Eliminación de fondo en aplicaciones de fotografía móvil: el modelo puede procesar imágenes capturadas por la cámara del dispositivo y generar un recorte limpio del sujeto en milisegundos, gracias a la variante int8 (44 MB) que cabe en cualquier smartphone moderno.
- Videoconferencia con fondo virtual: integrado en aplicaciones de llamadas, permite reemplazar el fondo en tiempo real con una máscara alfa de alta calidad, manteniendo la fluidez incluso en CPU de gama media.
- Recorte de productos para comercio electrónico: los vendedores pueden generar imágenes de producto sin fondo directamente en su dispositivo, evitando la subida a servicios en la nube y reduciendo costes de procesamiento.
- Realidad aumentada: la máscara alfa precisa permite superponer objetos virtuales sobre el sujeto real, útil en filtros de redes sociales o aplicaciones de prueba de maquillaje.
- Automatización de flujos de diseño gráfico: los diseñadores pueden preprocesar imágenes localmente antes de importarlas a herramientas de edición, acelerando tareas repetitivas de recorte.
- Aplicaciones de accesibilidad: permitir a usuarios con discapacidad visual aislar objetos de una escena para su posterior análisis táctil o sonoro.

## Benchmarks y rendimiento

La model card proporciona datos de rendimiento medidos en un Mac arm64 (proceso único, mediana de 10 ejecuciones) y métricas de paridad con el modelo fp32 eager. No se han publicado resultados en benchmarks estándar como MMLU o HumanEval, ya que no es un modelo de lenguaje.

| Variante | Tamaño (MB) | Paridad vs fp32 eager (peor correlación) | Mac arm64 mediana (ms) |
|---|---|---|---|
| fp32 (XNNPACK) | 176.1 | 1.000000 | 121.7 |
| int8 (XNNPACK) | 44.3 | 0.999988 | 87.2 |
| Core ML fp16 (iOS) | 89.0 | 0.999999 | 28.5 |

Como referencia, el modelo fp32 eager (sin conversión) tarda 375.5 ms en la misma máquina. Para la variante int8, se midió el IoU de la máscara sobre 10 imágenes reales: mediana 0.9987 y peor caso 0.9868, lo que confirma una pérdida de precisión mínima. La variante Core ML es entre 3.5x y 13.9x más rápida que XNNPACK en iPhone 17 Pro (mediana 12x), según pruebas con varios modelos de segmentación.

## Requisitos de hardware

- No requiere GPU dedicada; la inferencia se ejecuta en CPU (XNNPACK) o en el Neural Engine de Apple (Core ML).
- Tamaño de los archivos: fp32 176 MB, int8 44 MB, Core ML 89 MB. La variante int8 cabe en la mayoría de dispositivos móviles con almacenamiento limitado.
- Compatible con el runtime de ExecuTorch (versión 1.4.0) y torch 2.13.0 para la conversión.
- Para despliegue en Android, se recomienda la variante int8 por su menor tamaño y velocidad (87.2 ms en Mac arm64, aunque el rendimiento real depende del hardware).
- Para iOS, la variante Core ML aprovecha el Neural Engine, logrando 28.5 ms en Mac arm64 (referencia) y siendo significativamente más rápida en dispositivos reales.
- No se requiere VRAM; el modelo se ejecuta en memoria unificada del dispositivo.
- Opciones de despliegue: integración directa con el runtime de ExecuTorch en aplicaciones nativas (C++, Java, Swift). No se mencionan integraciones con vLLM, Ollama o TGI, que son para modelos de lenguaje.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de segmentación en la documentación proporcionada. El modelo original `schirrmacher/ormbg` es la referencia directa, pero no se aportan métricas de rendimiento de ese modelo en otras plataformas. Por tanto, la comparativa se limita a las variantes internas del propio modelo, ya descritas en la sección de benchmarks. Para una comparación con alternativas como MODNet o Depth-Anything-V2, se necesitarían datos adicionales que no están disponibles en esta fuente.

## Limitaciones y advertencias

- El modelo está limitado a la tarea de segmentación de imágenes; no procesa texto ni otros tipos de datos.
- La entrada está fijada a 1024×1024 píxeles; imágenes de otras dimensiones requieren redimensionado previo, lo que puede afectar la calidad.
- La variante int8 presenta una ligera pérdida de precisión (correlación 0.999988 y IoU mediana 0.9987), aunque es prácticamente imperceptible en la práctica.
- La variante fp16 no se distribuye porque no reduce el tamaño del archivo (176.1 MB igual que fp32) y solo añade operaciones de conversión; se recomienda int8 en su lugar.
- La variante Core ML es exclusiva para iOS; en Android solo se pueden usar las variantes XNNPACK (fp32 e int8).
- No se proporcionan datos sobre sesgos, alucinaciones o comportamientos erróneos en casos límite (p. ej., imágenes con oclusiones complejas o fondos muy similares al sujeto).
- Dependencia del runtime de ExecuTorch: cualquier cambio en la API o en las versiones de las dependencias puede requerir re-conversión del modelo.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir correctamente al autor original y a los autores del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlboydaisuke/ormbg-ExecuTorch
- Modelo base (schirrmacher/ormbg): https://huggingface.co/schirrmacher/ormbg
- Scripts de conversión (executorch-models): https://github.com/john-rocky/executorch-models
