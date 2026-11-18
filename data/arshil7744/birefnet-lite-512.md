# Arshil7744/birefnet-lite-512

## Resumen

BiRefNet-lite-512 es una reexportación a ONNX del modelo `ZhengPeng7/BiRefNet_lite` con la resolución de entrada reducida de 1024×1024 a 512×512, publicada por el usuario Arshil7744 (el README referencia el namespace `studioludens`). Resuelve un problema muy concreto: las variantes ONNX a 1024×1024 de BiRefNet_lite agotan la memoria del heap WASM de `onnxruntime-web` y fallan con `std::bad_alloc` en todos los backends probados (WebGPU fp16/fp32 y WASM fp32), lo que impide ejecutar el modelo en el navegador. Al reducir la resolución a la mitad, los tensores intermedios del decodificador se reducen 4× y el grafo cabe en los límites de almacenamiento de WebGPU.

El modelo realiza matting alfa de imagen (extracción de primer plano con canal alfa suave) y segmentación dicotómica de objeto saliente. Se distribuye en formato ONNX (fp32 y fp16) y está pensado para `transformers.js` con `device: 'webgpu'` o fallback a `wasm`, de modo que todo el procesamiento ocurre en el cliente sin viaje al servidor. El repositorio ocupa 0,2 GB y la licencia es MIT.

La relevancia es práctica: permite incorporar matting de calidad en aplicaciones web estáticas, extensiones o herramientas de edición de imagen sin infraestructura de servidor, a costa de una resolución de entrada menor. El autor declara uso en producción en Repper para refinado de mattes a nivel de recorte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (backbone Swin, segmentación con decodificador multi-escala; el autor etiqueta `swin`) |
| Parametros totales | no disponible (repo de 0,2 GB; pesos fp32 183 MB, fp16 94 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 512×512) |
| Tipos de cuantizacion | fp32 y fp16 (dos ficheros ONNX) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model.onnx` fp32, `onnx/model_fp16.onnx` fp16) |
| Resolucion de entrada | 512×512, RGB, layout NCHW, tensor `input_image` |
| Normalizacion | ImageNet: mean [0.485, 0.456, 0.406], std [0.229, 0.224, 0.225], rescale 1/255 |
| Salida | logits monocanal 512×512 (aplicar sigmoid externamente) |
| Runtime | transformers.js / onnxruntime-web (WebGPU o WASM) |
| Modelo base | ZhengPeng7/BiRefNet_lite |
| Dataset citado | ZhengPeng7/DIS5K |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura BiRefNet de `ZhengPeng7/BiRefNet_lite`, un transformer de segmentación para matting y detección de objeto saliente construido sobre un backbone Swin con decodificador multi-escala que produce concatenaciones de 1024 vías y mapas de características a varias escalas. Esta reexportación no reentrena ni modifica los pesos: únicamente cambia la resolución de entrada a 512×512 y convierte el grafo a ONNX. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset más allá de la referencia a DIS5K.

El punto técnico destacable es el proceso de exportación. BiRefNet emplea `torchvision.ops.deform_conv2d` (convolución deformable), que no tiene simbólico ONNX canónico. El autor documenta que las rutas habituales fallan: el exportador `deform_conv2d_onnx_exporter` sin parchear lanza `NoneType + int` en PyTorch 2.0.1, 2.1.2 y 2.6.0; `torch.onnx.dynamo_export` en 2.6.0 falla con `DispatchError: No ONNX function for deform_conv2d`; y simplificar el simbólico de `Conv` descartando el offset produce un 62 % de error por píxel. La solución aplicada es el parche de Kazuhito00 (`_get_tensor_dim_size` con fallback basado en stride), que solo funciona con el trazador legacy de PyTorch 2.0.1, por lo que la exportación se ejecuta dentro de una imagen Docker con versiones fijadas (Python 3.10, torch 2.0.1, torchvision compatible, transformers y el exportador parcheado).

La reducción a 512×512 tiene además una justificación de límites de hardware gráfico: a esa resolución el grafo usa como máximo 7 storage buffers por shader stage, dentro del límite `maxStorageBuffersPerShaderStage` de WebGPU (10 en adaptadores Apple Silicon antiguos, 16 en Chrome ≥146), por lo que no requiere cirugía del grafo.

## Capacidades

- Matting alfa de imagen: genera una máscara alfa suave en [0, 1] tras aplicar sigmoid a los logits de salida.
- Extracción de primer plano (foreground extraction) sobre imágenes RGB.
- Segmentación dicotómica de objeto saliente (salient object detection).
- Segmentación de imagen en general (`pipeline_tag: image-segmentation`).
- Ejecución totalmente en el cliente: WebGPU con fallback a WASM, sin llamadas al servidor.
- Integración directa con `@huggingface/transformers` mediante `AutoModel` y `AutoProcessor` (usa `ViTFeatureExtractor` en `preprocessor_config.json`).
- Soporte de dos precisiones (fp16 por defecto según `transformers.js_config.dtype`, fp32 opcional).
- No soporta texto, tool calling, agentes ni razonamiento multi-paso: es un modelo puramente visual.

## Casos de uso

- Refinado de mattes a nivel de recorte en herramientas de edición: el autor lo usa en producción en Repper para refinar el matte por motivo durante la extracción de primer plano; al trabajar sobre recortes pequeños, la resolución 512×512 es suficiente y la calidad de borde resulta indistinguible de la referencia a 1024 según sus pruebas.
- Eliminación de fondo en aplicaciones web sin backend: cargando el ONNX fp16 (94 MB) con `transformers.js` y `device: 'webgpu'`, la app genera el alfa en el navegador, eliminando costes de servidor y problemas de privacidad al no enviar la imagen fuera del dispositivo.
- Herramientas de diseño y generación de mockups: separar producto de fondo para componer sobre nuevas plantillas, con salida alfa que permite mezclas suaves.
- Extensiones de navegador y editores online: al no requerir GPU dedicada ni servidor, encaja en entornos con recursos limitados donde el fallback WASM cubre equipos sin WebGPU.
- Preprocesado en pipelines de visión: generar máscaras de primer plano antes de tareas posteriores (clasificación, recorte, composición) íntegramente en cliente.
- Prototipado rápido de funcionalidades de segmentación: el par `AutoModel`/`AutoProcessor` y el ejemplo de quickstart permiten tener un matting funcional en pocas líneas de TypeScript.
- Aplicaciones móviles híbridas o PWA: el tamaño fp16 y la ejecución local facilitan el despliegue en contextos con conectividad intermitente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente afirma que, en sus pruebas sobre recortes, la calidad de borde es indistinguible de la referencia a 1024×1024, sin aportar métricas cuantitativas (IoU, S-measure, MAE, etc.).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Los pesos ocupan 183 MB (fp32) y 94 MB (fp16); el consumo real depende de los tensores intermedios del decodificador a 512×512, que el autor describe como notablemente menores que a 1024×1024 (4× de reducción).
- GPU recomendadas: no se especifican modelos concretos. El autor menciona límites de `maxStorageBuffersPerShaderStage` en adaptadores Apple Silicon antiguos (10) y Chrome ≥146 (16), lo que sugiere que funciona en GPUs integradas y discretas de gama consumer con WebGPU.
- Cabe en GPU consumer: sí, por el tamaño de pesos y la resolución reducida; el requisito principal es soporte de WebGPU en el navegador, con fallback a WASM.
- Opciones de despliegue: `@huggingface/transformers` (transformers.js) con `onnxruntime-web` sobre WebGPU o WASM; los ficheros ONNX también pueden ejecutarse con otros runtimes ONNX fuera del navegador, aunque no se documenta.
- Latencia y throughput: no disponibles. El autor no publica cifras de tiempo de inferencia ni de FPS.

## Comparativa con modelos similares

| Modelo | Resolucion entrada | Runtime | Ejecutable en navegador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arshil7744/birefnet-lite-512 (este) | 512×512 | ONNX (onnxruntime-web) | Si | MIT | Hugging Face, 0,2 GB |
| ZhengPeng7/BiRefNet_lite | 1024×1024 | PyTorch | No (no es ONNX) | no disponible en la informacion | Hugging Face (modelo base) |
| onnx-community/BiRefNet_lite-ONNX | 1024×1024 | ONNX | No (OOM en todos los backends probados) | no disponible en la informacion | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base documentadas por el autor; no se dispone de datos de benchmarks ni de otros modelos de matting comparables en la información proporcionada.

## Limitaciones y advertencias

- Resolución de entrada fija a 512×512: para imágenes grandes el matte se calcula a baja resolución y se reescala con interpolación bilinear, lo que puede perder detalle fino en bordes de objetos muy pequeños o imágenes de alta resolución.
- El autor solo valida la calidad en recortes pequeños; no documenta el comportamiento en imágenes completas de gran tamaño.
- La salida son logits: es obligatorio aplicar sigmoid externamente y redimensionar a las dimensiones originales; un uso incorrecto produce máscaras inválidas.
- Dependencia de WebGPU para rendimiento: en equipos sin soporte el modelo cae a WASM, con latencia presumiblemente mayor (no cuantificada).
- Riesgo de fallo de memoria en entornos con heap WASM limitado si se intenta usar una resolución superior; el modelo está específicamente dimensionado para 512×512.
- Sesgos: no disponibles; al derivar de BiRefNet_lite y del dataset DIS5K, puede heredar sesgos de ese corpus (no documentados en la información proporcionada).
- Riesgo de alucinación de máscaras: no documentado; en segmentación, los errores se manifiestan como inclusiones o exclusiones incorrectas del primer plano, especialmente en objetos ambiguos o con poco contraste.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia del modelo base `ZhengPeng7/BiRefNet_lite`, no indicada en la información disponible.
- El README del repositorio referencia el identificador `studioludens/birefnet-lite-512` en el código de ejemplo, distinto del ID del repo (`Arshil7744/birefnet-lite-512`); conviene ajustar el identificador al cargar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Arshil7744/birefnet-lite-512
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Dataset citado: https://huggingface.co/datasets/ZhengPeng7/DIS5K
- Variante ONNX a 1024×1024 (referencia comparativa): https://huggingface.co/onnx-community/BiRefNet_lite-ONNX
- Parche del exportador de convolución deformable: https://github.com/Kazuhito00/deform-conv2d-onnx-exporter
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
- Uso en producción declarado por el autor: https://repper.app
