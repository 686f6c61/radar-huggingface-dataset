# JONNYVERSE/birefnet-lite-512

## Resumen

El modelo `JONNYVERSE/birefnet-lite-512` es una re-exportación en formato ONNX del modelo `ZhengPeng7/BiRefNet_lite`, adaptado a una resolución de entrada de 512×512 píxeles para poder ejecutarse de forma fiable en navegadores mediante `onnxruntime-web` y la librería `@huggingface/transformers` (transformers.js). El autor, JONNYVERSE, ha resuelto el problema de desbordamiento de memoria (OOM) que impide cargar las variantes originales de 1024×1024 en entornos web, tanto con backend WebGPU como WASM. El modelo está diseñado para tareas de segmentación de imágenes, específicamente matting (extracción de primer plano con alpha matte), detección de objetos salientes y segmentación de imágenes dicotómicas.

La arquitectura subyacente es BiRefNet (Bilateral Reference Network), que utiliza un backbone Swin Transformer y convoluciones deformables. La versión lite reduce el número de parámetros respecto al modelo completo, manteniendo una calidad de segmentación alta para recortes de imagen. El repositorio incluye dos variantes ONNX: una en fp32 (183 MB) y otra en fp16 (94 MB), con configuración por defecto en fp16. La licencia es MIT, lo que permite uso comercial sin restricciones. Este modelo es relevante porque democratiza el matting de alta calidad en aplicaciones cliente, eliminando la necesidad de servidores dedicados o de grandes recursos de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (Bilateral Reference Network) con backbone Swin Transformer y convoluciones deformables |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | fp16, fp32 |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx, model_fp16.onnx) |

## Arquitectura y entrenamiento

El modelo base `ZhengPeng7/BiRefNet_lite` es una versión ligera de BiRefNet, una red de segmentación que emplea un mecanismo de referencia bilateral: combina características de alta resolución con información semántica global para refinar los bordes del objeto segmentado. El backbone es un Swin Transformer, y la red utiliza `torchvision.ops.deform_conv2d` (convolución deformable) en su decodificador, lo que complica la exportación a ONNX. El autor de este repositorio ha aplicado un parche específico de `deform_conv2d_onnx_exporter` (desarrollado por Kazuhito00) para lograr una exportación limpia con PyTorch 2.0.1 en un entorno Docker.

El modelo fue entrenado originalmente sobre el dataset `ZhengPeng7/DIS5K`, un conjunto de datos para segmentación de imágenes dicotómicas (objetos salientes con bordes finos). No se proporcionan detalles adicionales sobre el proceso de entrenamiento (número de tokens, técnicas de RLHF, etc.) porque no aplican a un modelo de visión. La innovación principal de este repositorio no está en el entrenamiento, sino en la adaptación a 512×512 y la exportación a ONNX, que reduce los tensores intermedios en un factor de 4 y permite que el grafo use como máximo 7 buffers de almacenamiento por etapa de shader, dentro de los límites de WebGPU.

## Capacidades

- Segmentación de imágenes de alta precisión: genera un mapa de logits de un solo canal a 512×512 que, tras aplicar sigmoid, produce un alpha matte en el rango [0, 1].
- Extracción de primer plano (foreground extraction) y eliminación de fondos (background removal) en imágenes.
- Detección de objetos salientes (salient object detection) y segmentación de imágenes dicotómicas (dichotomous image segmentation).
- Matting sin trimap: el modelo puede refinar bordes finos, como cabello o pelaje, gracias a la arquitectura BiRefNet.
- Ejecución completamente en cliente (client-side) mediante WebGPU o WASM, sin necesidad de servidor.
- Soporte de fp16 y fp32 para equilibrar rendimiento y precisión según el hardware disponible.
- Integración directa con `@huggingface/transformers` (transformers.js) mediante `AutoModel` y `AutoProcessor`.

## Casos de uso

- Eliminación de fondos en aplicaciones web de edición de fotos: el modelo se ejecuta en el navegador del usuario, permitiendo recortar sujetos de imágenes sin subir datos a un servidor. Es adecuado porque la resolución de 512×512 es suficiente para recortes pequeños y la latencia es baja con WebGPU.
- Generación de alpha mattes para composición de imágenes: diseñadores y desarrolladores pueden integrar el modelo en herramientas de diseño basadas en web para extraer máscaras de alta calidad, especialmente en bordes complejos.
- Preprocesamiento para pipelines de visión artificial: el modelo puede usarse como primer paso para aislar objetos de interés antes de aplicar OCR, clasificación o detección, reduciendo el ruido de fondo.
- Automatización de recortes de producto en tiendas online: los comercios pueden ofrecer una herramienta de recorte automático de imágenes de producto directamente en el navegador, mejorando la experiencia de usuario sin coste de servidor.
- Aplicaciones de realidad aumentada (AR) en web: el matting en tiempo real permite superponer objetos virtuales sobre el primer plano extraído de la cámara, con la ventaja de que todo el procesamiento ocurre localmente.
- Refinamiento de máscaras en herramientas de anotación: los anotadores pueden usar el modelo para ajustar automáticamente los bordes de las máscaras generadas manualmente, ahorrando tiempo en tareas de segmentación semántica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como mIoU, F1 o precisión de bordes. El autor menciona que la calidad de bordes es "indistinguible" de la referencia de 1024 en sus pruebas, pero no proporciona datos numéricos. Por tanto, no se puede presentar una tabla comparativa con cifras verificadas.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en navegador, por lo que no requiere una GPU dedicada de servidor. Funciona con WebGPU (GPU integrada o discreta compatible) o WASM (CPU).
- Tamaño del modelo: fp16 94 MB, fp32 183 MB. La carga en memoria es moderada; un dispositivo con 4 GB de RAM puede manejarlo sin problemas.
- Para WebGPU se recomienda una GPU con soporte de WebGPU (Chrome ≥113, Edge, Firefox nightly). En Apple Silicon, el límite de `maxStorageBuffersPerShaderStage` es 10, y el modelo usa 7, por lo que es compatible.
- En WASM, el heap de `onnxruntime-web` está limitado a ~2-4 GB, pero el modelo a 512×512 no supera ese límite, a diferencia de las variantes de 1024.
- Opciones de despliegue: `@huggingface/transformers` (transformers.js) con `device: 'webgpu'` o `'wasm'`, o directamente con `onnxruntime-web`.
- Latencia y throughput: no se proporcionan datos numéricos. En una GPU integrada moderna, se espera una inferencia en el orden de decenas de milisegundos para una imagen de 512×512, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Resolución de entrada | Formato | Funciona en navegador | Tamaño (aprox.) | Licencia |
|---|---|---|---|---|---|
| `ZhengPeng7/BiRefNet_lite` (original) | 1024×1024 | PyTorch | No (no ONNX) | ~200 MB (pesos) | MIT |
| `onnx-community/BiRefNet_lite-ONNX` | 1024×1024 | ONNX | No (OOM en WebGPU/WASM) | ~200 MB | MIT |
| `JONNYVERSE/birefnet-lite-512` (este modelo) | 512×512 | ONNX | Sí (WebGPU/WASM) | 94 MB (fp16) / 183 MB (fp32) | MIT |

La principal diferencia es la resolución de entrada y la viabilidad en navegador. Las variantes de 1024 fallan por desbordamiento de memoria en todos los backends probados, mientras que la versión de 512 funciona de forma fiable. La calidad de segmentación es ligeramente inferior en detalles muy finos, pero el autor afirma que es indistinguible en recortes pequeños.

## Limitaciones y advertencias

- Resolución fija de 512×512: para imágenes grandes o recortes con detalles muy finos, la pérdida de resolución puede afectar la precisión del matte. Se recomienda usar esta versión solo para recortes pequeños o como paso de refinamiento.
- Dependencia de un parche específico para la exportación: la exportación ONNX requiere PyTorch 2.0.1 y el parche de Kazuhito00 para `deform_conv2d`. Esto no afecta al usuario final, pero limita la reproducibilidad del proceso de exportación.
- No se han publicado benchmarks formales: no hay métricas objetivas que comparen este modelo con otras soluciones de matting, por lo que la calidad debe validarse empíricamente en cada caso de uso.
- Sesgos y alucinaciones: al ser un modelo de visión, no genera texto, pero puede producir máscaras incorrectas en imágenes con objetos ambiguos o fondos complejos. No hay datos sobre sesgos específicos.
- Compatibilidad de WebGPU: aunque el modelo está optimizado para WebGPU, algunos adaptadores antiguos pueden no soportar todas las características requeridas. El fallback a WASM funciona, pero es más lento.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en producción. Se recomienda probar exhaustivamente antes de desplegar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JONNYVERSE/birefnet-lite-512
- Modelo base original: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Repositorio GitHub de BiRefNet: https://github.com/ZhengPeng7/BiRefNet
- Web oficial de BiRefNet: https://www.birefnet.cv/
- Parche para exportación de deform_conv2d: https://github.com/Kazuhito00/deform-conv2d-onnx-exporter
- Repositorio relacionado (studioludens/birefnet-lite-512): https://huggingface.co/studioludens/birefnet-lite-512
