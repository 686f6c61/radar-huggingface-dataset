# camclo/birefnet-lite-512

## Resumen

BiRefNet-lite-512 es una reexportación a ONNX del modelo ZhengPeng7/BiRefNet_lite, publicada por el usuario camclo, que fija la entrada en 512×512 píxeles para poder ejecutarse íntegramente en el navegador. BiRefNet (Bilateral Reference for High-Resolution Dichotomous Image Segmentation, CAAI AIR 2024) es una arquitectura de segmentación dicotómica de imagen y matting alfa que estima una máscara de primer plano de un solo canal sobre imágenes RGB; la variante lite reduce el coste computacional respecto al modelo completo y esta versión concreta recorta la resolución de entrada a la mitad para evitar el agotamiento de memoria de onnxruntime-web.

El problema que resuelve es muy concreto: las variantes ONNX a 1024×1024, incluida onnx-community/BiRefNet_lite-ONNX, fallan en todos los backends de navegador probados (WebGPU y WASM) con errores de tipo std::bad_alloc o accesos no alineados durante la ejecución. La causa es que el decodificador de BiRefNet_lite genera tensores intermedios muy grandes a 1024×1024, con concatenaciones de 1024 vías, y el heap de WASM de onnxruntime-web está fijado en torno a 2-4 GB sin posibilidad de ampliarlo en tiempo de ejecución. Reducir la entrada a 512×512 divide por cuatro el tamaño de esos tensores intermedios y hace que el grafo use como máximo 7 búferes de almacenamiento por etapa de shader, dentro del límite maxStorageBuffersPerShaderStage de WebGPU.

El resultado es un modelo de matting alfa que se carga con @huggingface/transformers (transformers.js) y funciona en cliente, sin ida y vuelta al servidor, con dos variantes de precisión: fp32 (183 MB) y fp16 (94 MB, la predeterminada). El autor declara uso en producción en Repper (repper.app) para refinado de matte por motivo durante la extracción de primer plano. La licencia es MIT, el repositorio ocupa 0,3 GB y la librería declarada es transformers.js con pipeline de image-segmentation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer (BiRefNet, con convolución deformable en el export) |
| Parametros totales | no disponible |
| Longitud de contexto | No aplica (modelo de vision; entrada de imagen a 512×512 px) |
| Tipos de cuantizacion | fp32 y fp16 (dos ficheros ONNX separados); no se documentan cuantizaciones int8 ni q4 |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (onnx/model.onnx fp32, 183 MB; onnx/model_fp16.onnx fp16, 94 MB) |
| Tamano del repositorio | 0,3 GB |
| Modelo base | ZhengPeng7/BiRefNet_lite |
| Dataset declarado | ZhengPeng7/DIS5K |
| Entrada | Imagen RGB redimensionada a 512×512, normalización ImageNet (mean = [0.485, 0.456, 0.406], std = [0.229, 0.224, 0.225]), factor de reescalado 1/255, layout NCHW, nombre del tensor input_image |
| Salida | Logits de un solo canal a 512×512; requiere sigmoid externa para obtener el matte alfa en [0, 1] y reescalado bilineal al tamaño original |
| Preprocesador | ViTFeatureExtractor (preprocessor_config.json), compatible con AutoProcessor.from_pretrained |
| Backends soportados | WebGPU y WASM (fallback) via onnxruntime-web; inferencia 100% en cliente |
| Precision por defecto | fp16 (definida en config.json mediante transformers.js_config.dtype) |
| Autor / publicador | camclo (repositorio referenciado como studioludens/birefnet-lite-512) |
| Fecha de creacion | 2026-09-29 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es BiRefNet, presentada en el artículo Bilateral Reference for High-Resolution Dichotomous Image Segmentation (CAAI AIR 2024), un modelo con backbone tipo Swin Transformer orientado a segmentación dicotómica de imagen (DIS), segmentación de objetos destacados a alta resolución (HRSOD) y detección de objetos camuflados (COD). Esta ficha corresponde a la variante lite del modelo, reexportada a ONNX por el autor del repositorio; no se aportan en la información disponible detalles sobre el número de parámetros, la composición exacta del dataset de entrenamiento ni si se aplicaron fases de RLHF o DPO (en un modelo de segmentación no serían aplicables en el sentido habitual). El único dataset declarado en las etiquetas es ZhengPeng7/DIS5K.

La innovación técnica relevante de este repositorio no está en el entrenamiento, sino en el proceso de exportación y en el compromiso de resolución. BiRefNet usa torchvision.ops.deform_conv2d (convolución deformable), que no tiene símbolo canónico en ONNX y rompe todas las rutas de exportación habituales: con PyTorch 2.0.1, 2.1.2 y 2.6.0 el exportador deform_conv2d_onnx_exporter sin parchear falla con un error de tipo NoneType + int porque no propaga la información de forma; torch.onnx.dynamo_export en 2.6.0 falla con DispatchError por no existir función ONNX para deform_conv2d; y sustituir el símbolo por una convolución simplificada que descarta el offset produce un 62% de error por píxel, lo que lo hace inservible. La única ruta que funciona es el parche de Kazuhito00 sobre deform_conv2d_onnx_exporter (con un fallback de stride en _get_tensor_dim_size), que solo es aplicable al trazador heredado de PyTorch 2.0.1. Por eso el autor recomienda un contenedor Docker fijado con Python 3.10, torch 2.0.1 y la versión parcheada de la librería, en lugar de instalar ese entorno localmente.

El segundo elemento de diseño es la reducción de la resolución de entrada de 1024×1024 a 512×512 para que el grafo quepa en memoria del navegador. El autor sostiene que, para refinado de matte a nivel de recorte, la calidad de borde es indistinguible de la referencia a 1024 en sus pruebas, dado que el recorte ya es pequeño. No se especifica en la información disponible el número de tokens de entrenamiento ni si hubo ajuste adicional sobre el modelo original.

## Capacidades

- Segmentación binaria de primer plano (foreground extraction) sobre imágenes RGB, con salida de logits de un solo canal transformables en matte alfa mediante sigmoid.
- Matting alfa sin trimap (trimap-free), orientado a extracción de bordes finos y refinado de matte.
- Segmentación dicotómica de imagen (DIS) y segmentación de objetos destacados (salient object detection).
- Detección de objetos camuflados (COD), segun las tareas cubiertas por BiRefNet en el artículo original.
- Ejecución íntegra en cliente: no requiere servidor, ni peticiones de red más allá de la descarga de los pesos, lo que permite procesar imágenes localmente en el navegador.
- Compatibilidad con WebGPU y, como fallback, con WASM cuando el hardware no soporta WebGPU.
- Integración directa con transformers.js mediante AutoModel, AutoProcessor y RawImage, con selección de tipo de dato (fp16 o fp32) y dispositivo (webgpu o wasm) en tiempo de carga.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente visual de una sola tarea.

## Casos de uso

- Refinado de matte por motivo en herramientas de edición: el modelo se aplica sobre recortes pequeños ya delimitados para afinar bordes y transparencias, que es exactamente el uso declarado en producción en Repper (repper.app). El recorte reducido permite trabajar a 512×512 sin pérdida perceptible de calidad de borde.
- Eliminación de fondo en el navegador para editores web y aplicaciones de diseño: al ejecutarse con transformers.js y WebGPU o WASM, la imagen no sale del dispositivo del usuario, lo que simplifica el cumplimiento de requisitos de privacidad y elimina costes de servidor.
- Procesamiento por lotes en cliente para catálogos de producto: al no requerir GPU de servidor, se puede desplegar en aplicaciones de escritorio o web que procesen cientos de imágenes localmente, asumiendo el coste de cómputo en el equipo del usuario.
- Preprocesado en pipelines de generación de imagen o vídeo: la máscara alfa generada puede alimentar etapas posteriores de composición, sustitución de fondo o segmentación por capas dentro de la misma aplicación cliente.
- Herramientas de videollamada o retransmisión con fondo virtual: al ser un modelo pequeño y ejecutable en cliente, encaja en escenarios donde no se quiere enviar el flujo de vídeo a un tercero, aplicando el matte fotograma a fotograma sobre recortes o regiones de interés.
- Extracción de primer plano para visión por computador en el edge: la variante fp16 de 94 MB cabe en dispositivos con recursos limitados y puede integrarse como paso previo de segmentación en aplicaciones móviles o embebidas basadas en WebView o runtime WASM.
- Investigación y docencia sobre exportación de modelos: el repositorio documenta con detalle la cadena de exportación de convoluciones deformables a ONNX, por lo que sirve como referencia reproducible para otros equipos que necesiten exportar arquitecturas con deform_conv2d.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas estándar como S-measure, F-measure, MAE, IoU ni comparaciones cuantitativas con otros modelos de segmentación. El único dato numérico de calidad que aparece es negativo y se refiere al proceso de exportación: la sustitución del símbolo de deform_conv2d por una convolución simplificada produce un 62% de error por píxel, motivo por el que esa ruta se descarta. Las afirmaciones sobre calidad de borde equivalente a 1024 se presentan como resultado de las pruebas del autor, sin cifras publicadas.

| Variante | Resolucion de entrada | Runtime | Funciona en navegador |
|---|---|---|---|
| ZhengPeng7/BiRefNet_lite | 1024×1024 | PyTorch | No aplica (no es ONNX) |
| onnx-community/BiRefNet_lite-ONNX | 1024×1024 | ONNX | No (agotamiento de memoria) |
| Este repositorio (birefnet-lite-512) | 512×512 | ONNX | Si |

Fallos registrados por el autor en las variantes a 1024×1024:

| Backend | Variante | Fallo observado |
|---|---|---|
| WebGPU | fp16, en cascada | std::bad_alloc durante OrtRun |
| WebGPU | fp32, en cascada | unaligned accesses |
| WASM | fp32, en cascada | std::bad_alloc durante OrtRun |
| WASM | fp32, original | std::bad_alloc durante OrtRun |

## Requisitos de hardware

- No se especifica VRAM mínima en la información disponible. Como referencia de tamano de pesos: 94 MB en fp16 y 183 MB en fp32, mas los tensores intermedios de activacion.
- El modelo esta disenado para ejecutarse en el navegador, no en servidor. El requisito real es que el backend WebGPU o WASM disponga de memoria suficiente para los tensores intermedios a 512×512, cuatro veces mas pequenos que a 1024×1024.
- WebGPU requiere que el adaptador admita maxStorageBuffersPerShaderStage; el grafo usa como maximo 7 buffers por etapa de shader, dentro del limite de 10 en adaptadores antiguos de Apple Silicon y de 16 en Chrome 146 o superior.
- Fallback automatico a WASM en hardware sin WebGPU. El heap de WASM de onnxruntime-web esta fijado en torno a 2-4 GB y no se puede ampliar en tiempo de ejecucion.
- No se publican datos de latencia ni de throughput en la informacion disponible.
- Opciones de despliegue: transformers.js (@huggingface/transformers) con AutoModel/AutoProcessor; onnxruntime-web directamente; cualquier runtime compatible con ONNX, aunque el repositorio esta optimizado para el entorno de navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de vision de una sola pasada.
- Repositorio de 0,3 GB, de modo que la descarga inicial de pesos es ligera en comparacion con modelos de difusion o LLM.

## Comparativa con modelos similares

| Modelo | Resolucion de entrada | Formato / runtime | Ejecucion en navegador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BiRefNet-lite-512 (este repositorio) | 512×512 | ONNX, transformers.js (WebGPU/WASM) | Si | MIT | HuggingFace (camclo/birefnet-lite-512) |
| ZhengPeng7/BiRefNet_lite | 1024×1024 | PyTorch | No (no es ONNX) | No disponible en la informacion proporcionada | HuggingFace |
| onnx-community/BiRefNet_lite-ONNX | 1024×1024 | ONNX | No (agotamiento de memoria) | No disponible en la informacion proporcionada | HuggingFace |
| BiRefNet_lite-2K | 2560×1440 | PyTorch | No | No disponible en la informacion proporcionada | HuggingFace / GitHub del proyecto BiRefNet |
| BiRefNet-matting | No disponible | PyTorch | No | No disponible en la informacion proporcionada | HuggingFace / GitHub del proyecto BiRefNet |

La comparativa se limita a las variantes de la propia familia BiRefNet documentadas en la model card y en los resultados de busqueda. No se dispone de datos de rendimiento comparado con esas alternativas ni de comparaciones con otros modelos de eliminacion de fondo de la misma categoria.

## Limitaciones y advertencias

- Resolucion de entrada reducida: el modelo trabaja a 512×512. Para imagenes completas grandes, la mascara se obtiene a baja resolucion y se reescala con interpolacion bilineal, lo que puede degradar bordes finos, pelo o estructuras de pocos pixeles si no se aplica sobre recortes.
- El matte debe reescalarse manualmente al tamano original; el modelo no lo hace por si mismo y la calidad final depende del metodo de interpolacion empleado.
- La salida son logits, no una mascara binaria. Es obligatorio aplicar sigmoid externamente; omitirlo produce resultados incorrectos.
- Conflicto de identificadores en la documentacion: el identificador de HuggingFace de esta ficha es camclo/birefnet-lite-512, mientras que los ejemplos de codigo de la model card cargan studioludens/birefnet-lite-512. Conviene verificar cual es el repositorio canonico antes de fijar la dependencia en produccion, y fijar una revision concreta para evitar cambios inesperados.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que implica menor escrutinio de la comunidad sobre la fidelidad del export respecto al modelo original.
- La fidelidad numerica del export depende de un parche de terceros (Kazuhito00) sobre PyTorch 2.0.1, una version descatalogada. Reproducir el proceso exige un contenedor Docker fijado; otras versiones de PyTorch no son compatibles con el parche.
- No se documentan sesgos del modelo ni evaluaciones de equidad. Al ser un modelo de segmentacion, los sesgos se manifestarian como fallos sistematicos en determinados tipos de objeto, tonos de piel o condiciones de iluminacion, y no hay datos publicados al respecto.
- Riesgo de fallo en escenas con primer plano ambiguo, multiples objetos o fondos con textura similar al sujeto, propio de la tarea de segmentacion dicotomica, sin que se hayan publicado tasas de error.
- La licencia es MIT, lo que permite uso comercial, modificacion y redistribucion con atribucion. Conviene comprobar, no obstante, la licencia del modelo base ZhengPeng7/BiRefNet_lite, que no se detalla en la informacion proporcionada pero que condiciona la redistribucion de los pesos derivados.
- No se ofrecen garantias de mantenimiento: la fecha de creacion y la de ultima actualizacion coinciden, sin historial posterior.
- El fallback a WASM puede no ser suficiente en dispositivos con poca memoria; el autor documenta agotamiento de memoria en variantes de mayor resolucion y no se aportan umbrales minimos de memoria por dispositivo.

## Enlaces

- HuggingFace (identificador de esta ficha): https://huggingface.co/camclo/birefnet-lite-512
- HuggingFace (repositorio referenciado en la model card): https://huggingface.co/studioludens/birefnet-lite-512
- README del repositorio referenciado: https://huggingface.co/studioludens/birefnet-lite-512/blob/main/README.md
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Repositorio GitHub de BiRefNet: https://github.com/ZhengPeng7/BiRefNet
- ModelScope (BiRefNet_lite): https://www.modelscope.cn/models/chenmingyu/BiRefNet_lite
- Parche de exportacion de deform_conv2d: https://github.com/Kazuhito00/deform-conv2d-onnx-exporter
- Documentacion de transformers.js: https://huggingface.co/docs/transformers.js
- Ficha de terceros con metadatos del modelo: https://savrn.com/models/birefnet-lite-512
- Aplicacion que lo usa en produccion: https://repper.app
- Dataset declarado: ZhengPeng7/DIS5K
