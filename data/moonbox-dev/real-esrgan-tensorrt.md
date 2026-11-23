# moonbox-dev/Real-ESRGAN-TensorRT

## Resumen

Real-ESRGAN TensorRT es una distribucion precompilada de motores TensorRT del modelo Real-ESRGAN x4plus, el superresolutor de imagenes para fotografias del mundo real desarrollado originalmente por Xintao Wang y colaboradores. La publica el usuario moonbox-dev bajo el paraguas de Moonbox, y su proposito es ofrecer una via de inferencia de baja latencia en GPU NVIDIA sin necesidad de PyTorch ni de recompilar el motor para cada tarjeta.

El modelo subyacente es una red generativa adversarial (ESRGAN) que realiza un aumento de escala 4x sobre imagenes RGB, entrenada para restaurar detalles en fotografias degradadas por ruido, compresion o desenfoque. Esta version no anade capacidades nuevas al modelo original: empaqueta el grafo ONNX fp16 exportado desde los pesos oficiales en un motor TensorRT 10.x compatible a nivel de hardware (Ampere y posteriores) y de version, de modo que funciona en RTX 30, 40 y 50 sin reconstruccion.

La relevancia practica esta en el rendimiento: segun la model card, el motor fp16 procesa una imagen de aproximadamente 120 x 125 pixeles en 31 ms de mediana en una RTX 3080 Laptop, frente a los 86 ms del grafo ONNX fp32 de referencia y los 171 ms del ONNX fp16, manteniendo una fidelidad de 54,5 dB de PSNR medio respecto a fp32. El repositorio ocupa 0,2 GB y se distribuye bajo licencia BSD-3-Clause.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN de superresolucion (ESRGAN, red RRDB), exportada a TensorRT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | fp16 (unico motor incluido); sin int8 |
| Idiomas soportados | no aplica (procesamiento de imagen) |
| Licencia | BSD-3-Clause |
| Formato de pesos | motor TensorRT (`.engine`), derivado de ONNX fp16; no se distribuyen safetensors ni GGUF |
| Entrada | tensor `input` [1, 3, H, W] RGB en rango 0-1, con H y W entre 16 y 768 (perfil optimizado para 256) |
| Salida | tensor `output` [1, 3, 4H, 4W] |
| Factor de escala | 4x |
| Compatibilidad de hardware | Ampere y posteriores (RTX 30, 40 y 50) |
| Compatibilidad de software | TensorRT 10.x desde 10.13, mediante runtime lean |
| Tamano del repositorio | 0,2 GB |
| Tamano del motor fp16 | 195,1 MB |

## Arquitectura y entrenamiento

El modelo base es Real-ESRGAN x4plus, una red generativa adversarial basada en bloques RRDB (Residual-in-Residual Dense Block) con un discriminador que penaliza las diferencias de textura, entrenada sobre degradaciones sinteticas que imitan las condiciones de fotografias reales (ruido, desenfoque gaussiano, compresion JPEG y reescalados sucesivos). Esta version no reentrena el modelo: parte del fichero oficial `RealESRGAN_x4plus.pth` de la release v0.1.0 del repositorio de Xinntao, revision `a4abfb2979`, lo exporta a ONNX fp16 y construye el motor TensorRT con el builder de TensorRT.

La innovacion tecnica no esta en la red sino en el empaquetado. El motor se construye en modo *strongly typed*, de forma que cada tensor conserva la precision que le asigna el grafo ONNX, y se compila como *hardware compatible* y *version compatible*: un unico binario sirve para cualquier GPU Ampere o superior y cualquier TensorRT 10.x desde 10.13, a cambio de una ligera perdida de velocidad frente a un motor afinado para una GPU concreta. Se descarta int8 porque el build ONNX int8 disponible es weight-only, mientras que TensorRT requiere activaciones calibradas, y la cuantizacion calibrada de activaciones degrada el detalle fino que producen los upscalers GAN. El runner (`trt_runner.py`) depende solo de TensorRT, Polygraphy y numpy, sin PyTorch.

## Capacidades

- Superresolucion de imagenes con factor 4x sobre fotografias RGB.
- Restauracion de detalle en imagenes degradadas por ruido, desenfoque o compresion, gracias al entrenamiento del modelo original con degradaciones realistas.
- Procesamiento por mosaicos: el script `upscale_trt.py` divide imagenes grandes en teselas de 512 px con 16 px de solape para evitar costuras.
- Inferencia sin PyTorch: el runner usa TensorRT y Polygraphy sobre numpy.
- Ejecucion en cualquier GPU NVIDIA Ampere o posterior sin recompilar el motor.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de imagen a imagen.
- No dispone de capacidades multilingues ni de modalidad de audio o video.

## Casos de uso

- Restauracion de archivo fotografico: el modelo puede procesar lotes de fotografias historicas o de baja resolucion y devolver versiones 4x con detalle reconstruido, usando el troceado interno para imagenes mayores de 768 px.
- Mejora de miniaturas y material grafico web: integrar el motor en un pipeline de publicacion que reciba imagenes pequenas y genere versiones de alta resolucion antes del renderizado, con 31 ms por imagen en una RTX 3080 Laptop.
- Preprocesado para vision por computador: aumentar la resolucion de imagenes de entrada a modelos de deteccion o segmentacion cuando el dataset original es de baja calidad, sin depender de PyTorch en el servidor de inferencia.
- Restauracion de capturas y assets de videojuegos: reescalar texturas o capturas de pantalla a 4x para documentacion, portadas o catalogos.
- Procesamiento por lotes en servidores con GPU: al requerir solo el runtime de TensorRT y numpy, el motor se puede desplegar en contenedores ligeros sin el stack completo de PyTorch, reduciendo el tamano de la imagen y el tiempo de arranque.
- Digitalizacion de documentos y material escaneado: mejorar la legibilidad de recortes fotograficos de baja resolucion antes de pasarlos por OCR, siempre que se acepte la naturaleza generativa del upscaler.
- Prototipado en estaciones de trabajo RTX: usar el motor como referencia de latencia frente a la version ONNX en pruebas de rendimiento de pipelines de imagen.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos sobre Set14 y BSD100 con entradas reducidas bicubicamente a 4x, en una RTX 3080 Laptop GPU. Los tiempos son medianas por imagen de aproximadamente 120 x 125 pixeles de entrada.

| Modelo | PSNR vs fp32: media (peor), Set14 / BSD100 | PSNR-Y vs ground truth, Set14 / BSD100 | SSIM-Y vs ground truth, Set14 / BSD100 | ms por imagen |
|---|---|---|---|---|
| ONNX fp32 (referencia) | - | 24,73 / 24,22 | 0,673 / 0,629 | 86 |
| ONNX fp16 | 59,1 (56,4) / 59,0 dB | 24,73 / 24,22 | 0,673 / 0,629 | 171 |
| TensorRT fp16 | 54,5 (51,3) / 54,5 (47,2) dB | 24,73 / 24,22 | 0,673 / 0,629 | 31 |

El criterio de aceptacion fijado por el autor era un PSNR medio de al menos 35 dB frente a fp32; el motor lo supera ampliamente. La calidad frente a ground truth es identica a la de las referencias ONNX, y la ganancia de latencia es de aproximadamente 2,8x frente a ONNX fp32 y 5,5x frente a ONNX fp16.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el motor pesa 195,1 MB y el perfil de optimizacion admite entradas de hasta 768 x 768, por lo que el consumo es moderado, pero no se publica una cifra.
- GPU compatibles: cualquier NVIDIA Ampere o posterior, es decir, RTX 30, 40 y 50, y equivalentes profesionales (A100, H100) por compatibilidad de arquitectura.
- Cabe en GPU de consumo: si, el motor se construyo y benchmarkeo en una RTX 3080 Laptop GPU.
- Despliegue: runtime de TensorRT 10.x (desde 10.13) con `tensorrt-cu12` y `tensorrt-lean-cu12`, mas Polygraphy y numpy; no requiere PyTorch, vLLM, llama.cpp ni Ollama.
- Latencia: 31 ms por imagen de aproximadamente 120 x 125 px en RTX 3080 Laptop; no se publican datos de throughput por lotes ni de otras GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Factor | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Real-ESRGAN TensorRT (este) | Motor TensorRT fp16 | 4x | BSD-3-Clause | `.engine` | 31 ms por imagen en RTX 3080 Laptop; sin PyTorch |
| Real-ESRGAN x4plus original | Pesos PyTorch | 4x | BSD-3-Clause | `.pth` | Requiere el stack de PyTorch y BasicSR; mismo modelo base |
| ONNX fp32 de referencia | Grafo ONNX | 4x | BSD-3-Clause | `.onnx` | 86 ms por imagen en la misma GPU; referencia de fidelidad |
| ONNX fp16 | Grafo ONNX | 4x | BSD-3-Clause | `.onnx` | 171 ms por imagen; mas lento que fp32 en esta medicion |

No se dispone de datos de benchmarks frente a otros upscalers (por ejemplo, SwinIR o modelos de la familia Stable Diffusion upscale) en la informacion proporcionada.

## Limitaciones y advertencias

- Es un upscaler generativo: puede inventar texturas plausibles que no estaban en la imagen original, lo que es inaceptable en contextos forenses, medicos o de documentacion probatoria.
- El perfil de optimizacion del motor admite entradas de 16 a 768 px por lado; las imagenes mayores dependen del troceado de `upscale_trt.py` (teselas de 512 px con 16 px de solape), que puede introducir artefactos en las costuras si el contenido es muy heterogeneo.
- Solo se distribuye fp16; no hay motores int8 ni fp32, y el autor descarta int8 por la perdida de detalle fino en upscalers GAN.
- El motor esta compilado como hardware y version compatible, lo que implica una ligera penalizacion de velocidad frente a un motor afinado para una GPU concreta; no se cuantifica esa perdida.
- No funciona en GPU anteriores a Ampere (por ejemplo, RTX 20 o GTX 10) ni con versiones de TensorRT anteriores a 10.13.
- La licencia BSD-3-Clause permite uso comercial, pero el autor recuerda que los ficheros son un derivado del modelo original y heredan su licencia, que gobierna su uso.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia: no hay historial de uso ni validacion independiente.
- No se publican cifras de sesgos (no aplica en el sentido textual) ni evaluaciones fuera de Set14 y BSD100.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/moonbox-dev/Real-ESRGAN-TensorRT
- Motor fp16: https://huggingface.co/moonbox-dev/Real-ESRGAN-TensorRT/blob/main/fp16/model.engine
- Runner de TensorRT: https://huggingface.co/moonbox-dev/Real-ESRGAN-TensorRT/blob/main/fp16/trt_runner.py
- Script de upscaling: https://huggingface.co/moonbox-dev/Real-ESRGAN-TensorRT/blob/main/fp16/upscale_trt.py
- Repositorio original de Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Revision del codigo original: https://github.com/xinntao/Real-ESRGAN/tree/a4abfb2979
- Paper de Real-ESRGAN: https://arxiv.org/abs/2107.10833
- Model zoo del proyecto original: https://github.com/xinntao/Real-ESRGAN/blob/master/docs/model_zoo.md
