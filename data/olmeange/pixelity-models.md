# olmeange/pixelity-models

## Resumen

Pixelity — models no es un modelo único, sino un repositorio de distribución de modelos ONNX empleados por Pixelity, un editor de imágenes web que ejecuta toda la inferencia en el navegador del usuario. El repositorio lo mantiene el usuario olmeange y su función es servir los ficheros bajo demanda (eliminación de fondo, selección de objetos con prompts y reescalado de imagen) junto con el binario WebAssembly de ONNX Runtime Web 1.30.0 que actúa como motor de inferencia. Los ficheros se descargan solo cuando el usuario activa una función concreta y las imágenes nunca salen del dispositivo.

El contenido es una redistribución de ficheros de terceros sin modificar, salvo una conversión de formato explícitamente documentada: `realesr_general_x4v3.onnx` se obtuvo a partir de los pesos oficiales de Real-ESRGAN en PyTorch, verificada contra el original con un error máximo de 4,2·10⁻⁶. Las cuatro familias incluidas son U²-Net (rembg, versión `u2netp` ligera, 4,57 MB), BiRefNet lite en fp16 y fp32 (114,5 MB y 224,0 MB), SlimSAM-77 en variantes cuantizada para CPU y fp para GPU (8,88 + 4,90 MB y 23,28 + 16,56 MB) y Real-ESRGAN general x4v3 (4,87 MB).

Su relevancia práctica es doble: por un lado, ofrece un conjunto coherente y verificado (hash SHA-256 por fichero) de modelos de visión listos para `onnxruntime-web` con soporte de WebGPU y WASM; por otro, todas las licencias implicadas (MIT, Apache-2.0, BSD-3-Clause) permiten uso comercial y redistribución conservando avisos de copyright, lo que facilita integrar estas capacidades en productos web sin depender de servidores de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conjunto heterogéneo de arquitecturas de visión: U²-Net (encoder-decoder anidado para salient object detection), BiRefNet (bilateral reference para dichotomous image segmentation), SlimSAM (ViT image encoder + prompt encoder y mask decoder derivados de Segment Anything) y Real-ESRGAN (red RRDB de superresolución) |
| Parámetros totales | No disponible (el autor no publica recuentos de parámetros; solo tamaños de fichero) |
| Parámetros activos | No aplica (ningún componente es MoE) |
| Longitud de contexto | No aplica (modelos de imagen; no procesan texto) |
| Tipos de cuantización | fp32 (`birefnet_lite_fp32.onnx`), fp16 (`birefnet_lite_fp16.onnx`), int8/cuantizada (`slimsam77_*_quantized.onnx`) |
| Idiomas soportados | No disponible / no aplica |
| Licencia | `multiple-permissive`: MIT (BiRefNet, rembg, ONNX Runtime), Apache-2.0 (U²-Net, SlimSAM, Segment Anything), BSD-3-Clause (Real-ESRGAN); textos en `licenses/` |
| Formato de pesos | ONNX (`.onnx`) más binario `.wasm` de ONNX Runtime Web 1.30.0 |
| Tamaño del repositorio | 0,4 GB |
| Pipeline declarado | image-segmentation |
| Runtime objetivo | onnxruntime-web 1.30.0 (WebGPU y WASM SIMD threaded + asyncify) |

## Arquitectura y entrenamiento

El repositorio agrupa cuatro arquitecturas independientes, cada una entrenada por sus autores originales; Pixelity no entrena ni ajusta ninguno de los modelos. U²-Net emplea una estructura U anidada con bloques RSU para detección de objetos salientes, y la variante `u2netp` es la versión reducida incluida en rembg para inferencia rápida. BiRefNet introduce referencias bilaterales (una rama de localización de alto nivel y otra de refinado de bajo nivel) para segmentación dicotómica de alta resolución; la versión `lite` reduce coste computacional. SlimSAM aplica poda estructurada sobre el ViT de Segment Anything para obtener un encoder y un decoder mucho más pequeños manteniendo el esquema prompt → máscara de SAM. Real-ESRGAN es una red generativa RRDB entrenada con datos sintéticos puros para superresolución ciega de imágenes reales; el fichero incluido corresponde a los pesos oficiales `realesr-general-x4v3` (escala ×4, con la posibilidad de aplicar ×2 en el editor).

No se dispone de información sobre volúmenes de tokens, composición de datasets ni procesos de alineación (RLHF/DPO) en la documentación proporcionada, más allá de las citas bibliográficas de cada artículo. La única intervención técnica propia del proyecto es la conversión a ONNX del modelo de Real-ESRGAN, documentada como conversión de formato sin cambios en los pesos y validada numéricamente contra la implementación de PyTorch (error máximo 4,2·10⁻⁶). El resto de ficheros se redistribuyen sin modificar, con hashes SHA-256 publicados para verificación de integridad.

## Capacidades

- Eliminación de fondo de imágenes en dos niveles de calidad: `u2netp` para resultado rápido y bajo consumo, BiRefNet lite (fp16 o fp32) para máxima calidad cuando hay GPU disponible.
- Selección asistida por IA: segmentación guiada por prompts (puntos o cajas) mediante SlimSAM-77, con variantes cuantizadas para CPU y fp para GPU.
- Reescalado de imagen ×2 y ×4 con Real-ESRGAN general x4v3, orientado a fotografías reales con degradaciones mixtas.
- Ejecución íntegra en el cliente: inferencia en el navegador vía ONNX Runtime Web con backend WebGPU o WASM (SIMD, multihilo y asyncify).
- Descarga bajo demanda de cada modelo, de modo que el usuario solo paga el coste de red de la función que utiliza.
- Verificación de integridad por fichero mediante SHA-256 publicado en la model card.
- No incluye generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente ni procesamiento de audio o vídeo.

## Casos de uso

- Editor de imágenes en el navegador: integrar `u2netp.onnx` como paso rápido de eliminación de fondo al vuelo y reservar `birefnet_lite_fp16.onnx` para la exportación final en alta calidad cuando el usuario dispone de WebGPU.
- Comercio electrónico y catálogos de producto: eliminación de fondo por lotes en una herramienta web interna, con la ventaja de que las fotos del catálogo no se envían a ningún servidor y el cumplimiento de privacidad queda acotado al cliente.
- Selección de objetos interactiva (estilo "varita mágica"): usar el encoder de SlimSAM para calcular el embedding de la imagen una vez y el prompt encoder + mask decoder por cada clic del usuario, con la variante cuantizada para equipos sin GPU.
- Restauración y ampliación de fotografías antiguas o de baja resolución: aplicar `realesr_general_x4v3.onnx` con escala ×2 o ×4 antes de imprimir o publicar, incluyendo un pipeline de comparación antes/después.
- Procesamiento de documentos sensibles: recorte y anonimización de fondos o regiones en imágenes médicas, legales o de recursos humanos dentro del navegador, sin transferencia de datos a terceros.
- Aplicaciones web progresivas y entornos con conectividad limitada: cachear los ONNX en Cache API o IndexedDB y ejecutar la segmentación en local cuando no hay red, usando el backend WASM.
- Fondos virtuales en videollamada: segmentación por fotograma con `u2netp` (4,57 MB, el más ligero) como base para sustituir el fondo en tiempo real en el navegador.
- Integración en SaaS de terceros: los ficheros y el runtime son redistribuibles bajo MIT/Apache-2.0/BSD-3-Clause conservando avisos, lo que permite empaquetarlos en un producto comercial propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad (IoU, S-measure, F-measure, PSNR/SSIM) ni medidas de latencia o throughput para ninguna de las variantes. El único dato de validación numérica publicado es la equivalencia de la conversión ONNX de Real-ESRGAN respecto a PyTorch (error máximo 4,2·10⁻⁶).

## Requisitos de hardware

- VRAM estimada (derivada del tamaño de los pesos, no publicada por el autor): `u2netp` ≈ 5 MB de pesos, ejecutable en cualquier equipo; SlimSAM cuantizado ≈ 14 MB en total; SlimSAM fp ≈ 40 MB; BiRefNet lite fp16 ≈ 115 MB; BiRefNet lite fp32 ≈ 224 MB; Real-ESRGAN ≈ 5 MB. A estas cifras hay que sumar activaciones y buffers, que dependen de la resolución de entrada y del backend.
- GPU recomendadas: cualquier GPU integrada o dedicada con WebGPU para BiRefNet lite en fp16 y para SlimSAM fp; en CPU, las variantes cuantizadas de SlimSAM y `u2netp` son las adecuadas.
- Compatibilidad con GPU de consumo: sí, todo el conjunto está pensado para ejecutarse en un navegador doméstico; BiRefNet fp32 y las variantes fp de SlimSAM son las más exigentes y se benefician de una GPU dedicada reciente.
- Opciones de despliegue: ONNX Runtime Web (`onnxruntime-web@1.30.0`, binario WASM incluido) sobre WebGPU o WASM; los mismos `.onnx` pueden servirse con onnxruntime en servidor, si bien el proyecto está diseñado para ejecución cliente.
- Latencia y throughput: no disponibles; no se han publicado mediciones por dispositivo ni por resolución.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con alternativas externas. La siguiente tabla compara los componentes incluidos entre sí, con los datos objetivos de la model card:

| Componente | Uso | Tamaño | Licencia | Backend previsto |
|---|---|---|---|---|
| U²-Net (`u2netp`) | Eliminación de fondo rápida | 4,57 MB | Apache-2.0 (pesos) / MIT (rembg) | CPU y GPU |
| BiRefNet lite fp16 | Eliminación de fondo de alta calidad | 114,5 MB | MIT | GPU con soporte fp16 |
| BiRefNet lite fp32 | Eliminación de fondo de alta calidad | 224,0 MB | MIT | GPU sin fp16 |
| SlimSAM-77 cuantizado (encoder + decoder) | Selección por prompts en CPU | 8,88 + 4,90 MB | Apache-2.0 | CPU (WASM) |
| SlimSAM-77 fp (encoder + decoder) | Selección por prompts en GPU | 23,28 + 16,56 MB | Apache-2.0 | GPU (WebGPU) |
| Real-ESRGAN general x4v3 | Superresolución ×2 / ×4 | 4,87 MB | BSD-3-Clause | CPU y GPU |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no razona y no admite tool calling ni flujos de agente; cualquier ficha que lo trate como LLM sería incorrecta.
- Calidad de segmentación dependiente del dominio: BiRefNet lite y U²-Net están orientados a salient object detection / dichotomous segmentation; en escenas con múltiples objetos o bordes ambiguos puede requerir revisión manual.
- SlimSAM-77 es una versión podada de Segment Anything: la poda y la cuantización reducen tamaño pero pueden degradar la precisión de las máscaras frente al SAM original; no se publican métricas que cuantifiquen esa pérdida.
- Real-ESRGAN `general-x4v3` está entrenado con datos sintéticos para imágenes reales; no es la variante especializada en anime ni en caras, por lo que en esos dominios puede producir artefactos.
- No hay información sobre sesgos de los datasets de entrenamiento de los modelos originales, ni sobre el rendimiento con pieles, géneros o grupos demográficos diversos.
- Licencia `multiple-permissive` con `license: other`: aunque los tres textos implicados permiten uso comercial, es obligatorio conservar avisos de copyright y textos de licencia, y no usar los nombres de los autores para promocionar el producto derivado (cláusula BSD-3-Clause).
- El repositorio se distribuye "as is", sin garantía de ningún tipo, y no está afiliado a los autores originales; los hashes SHA-256 publicados deben verificarse si se reutilizan los ficheros.
- Dependencia de la disponibilidad de WebGPU: sin ella se cae al backend WASM, con mayor latencia y sin acceso a las variantes fp16.
- Consumo de memoria del navegador: modelos como BiRefNet fp32 (224 MB) más activaciones a alta resolución pueden agotar la memoria en pestañas de dispositivos modestos.
- Repositorio sin descargas ni likes y creado en 2026-10-20: no hay histórico de uso ni validación independiente de la integridad de la redistribución más allá de los hashes declarados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/olmeange/pixelity-models
- Textos de licencia del repositorio: https://huggingface.co/olmeange/pixelity-models/blob/main/licenses/ (referenciado como `licenses/` en la model card)
- U²-Net (Xuebin Qin et al.): https://github.com/xuebinqin/U-2-Net
- rembg v0.0.0 (origen del ONNX de `u2netp`, Daniel Gatis): https://github.com/danielgatis/rembg/releases/tag/v0.0.0
- BiRefNet (Peng Zheng et al.): https://github.com/ZhengPeng7/BiRefNet
- onnx-community/BiRefNet_lite-ONNX (origen de los ficheros fp16 y fp32): https://huggingface.co/onnx-community/BiRefNet_lite-ONNX/tree/de15b22ba131738a16dff04aab8bdf8dc32e3ac1
- SlimSAM (Zigeng Chen et al.): https://github.com/czg1225/SlimSAM
- Segment Anything (Meta): https://github.com/facebookresearch/segment-anything
- Xenova/slimsam-77-uniform (origen de los ficheros SlimSAM): https://huggingface.co/Xenova/slimsam-77-uniform/tree/5850ab45f587c112167512ffef949107115e26a0
- Real-ESRGAN (Xintao Wang et al.): https://github.com/xinntao/Real-ESRGAN
- Pesos oficiales `realesr-general-x4v3.pth` (release v0.2.5.0): https://github.com/xinntao/Real-ESRGAN/releases/tag/v0.2.5.0
- ONNX Runtime (Microsoft), base de `onnxruntime-web@1.30.0`: https://github.com/microsoft/onnxruntime
