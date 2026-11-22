# levxme/deblur-models

## Resumen

`levxme/deblur-models` no es un modelo de lenguaje, sino un repositorio de artefactos de vision por computador empaquetados en ONNX y TFLite para su ejecucion en navegador. Lo publica el desarrollador levxme como soporte de una aplicacion web de restauracion fotografica que corre integramente en el dispositivo del usuario mediante WebGPU y onnxruntime-web. El repositorio no entrena nada: unicamente aloja los ficheros que la aplicacion descarga una vez y cachea, con las conversiones de formato realizadas por el autor.

El contenido son cuatro redes neuronales de restauracion de imagen convertidas a ONNX (Restormer para deblurring de desenfoque por desenfoque de foco y para denoising, Real-ESRGAN x2 para superresolucion y CodeFormer para restauracion de rostros) mas dos ficheros MediaPipe sin modificar (un segmentador de selfies multiclase y un detector de puntos faciales). Los pesos se almacenan en fp16 y se convierten a fp32 en carga, con toda la aritmetica en fp32.

Su relevancia es practica: demuestra un pipeline de restauracion de imagen completo ejecutable en el navegador con aceleracion WebGPU, incluyendo la reescritura de la busqueda de codebook de CodeFormer como ArgMax + Gather para hacerla viable en ONNX. La licencia es mixta y restrictiva: CodeFormer usa S-Lab License 1.0, solo para uso no comercial, lo que condiciona todo el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Restormer, Uformer-like), RRDBNet (Real-ESRGAN), VQGAN con transformer (CodeFormer), redes MediaPipe |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision) |
| Tipos de cuantizacion | pesos fp16 almacenados, computo fp32; sin otras cuantizaciones publicadas |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | mixta por fichero: MIT (Restormer), BSD-3-Clause (Real-ESRGAN), S-Lab License 1.0 no comercial (CodeFormer), Apache-2.0 (MediaPipe) |
| Formato de pesos | ONNX (opset 17) y TFLite |

## Arquitectura y entrenamiento

El repositorio agrupa seis artefactos de inferencia. `restormer-defocus-w16.onnx` (54,9 MB) y `restormer-denoise-w16.onnx` (54,8 MB) son exportaciones de Restormer de Zamir et al. (CVPR 2022), un transformer con atencion por canales y modulacion por gating para restauracion de imagen; el primero aborda el desenfoque de foco y el segundo el denoising real sobre el dataset SIDD. `realesrgan-x2-w16.onnx` (33,8 MB) es `RealESRGAN_x2plus` (RRDBNet) de Wang et al., con altura y anchura dinamicas. `codeformer-w16.onnx` (188,7 MB) es CodeFormer de Zhou et al. (NeurIPS 2022), un VQGAN con transformer para restauracion facial, con el peso de fidelidad fijado en 0,7 y la busqueda de codebook reescrita como ArgMax + Gather (matematicamente equivalente). Los dos ficheros MediaPipe (`selfie_multiclass_256x256.tflite`, 16,4 MB, y `face_landmarker.task`, 3,8 MB) son copias sin modificar.

No hay informacion sobre datos de entrenamiento, numero de tokens ni proceso de alineacion, porque el autor no entrena: solo convierte formatos. La innovacion tecnica documentada es la conversion a ONNX con pesos fp16 y computo fp32, y la verificacion de paridad frente a PyTorch fp32 en CPU con onnxruntime 1.19.2: 107 dB PSNR para Restormer denoise, 83 dB para Real-ESRGAN y 80 dB para CodeFormer sobre un recorte real de 512 px. El autor senala que el computo completo en fp16 producia resultados visiblemente incorrectos en WebGPU para Restormer.

## Capacidades

- Restauracion de desenfoque de foco en imagenes de 512x512 (Restormer defocus).
- Eliminacion de ruido en imagenes reales (Restormer denoise, entrenado sobre SIDD).
- Superresolucion x2 con altura y anchura dinamicas de hasta 384 px de entrada (Real-ESRGAN x2plus).
- Restauracion de rostros a partir de recortes alineados de 512x512 en rango [-1, 1] (CodeFormer).
- Segmentacion semantica multiclase de personas/selfies a 256x256 (MediaPipe Selfie Multiclass).
- Deteccion de puntos faciales (MediaPipe Face Landmarker).
- Ejecucion en navegador con WebGPU y onnxruntime-web, sin servidor.
- No soporta tool calling, agentes, razonamiento multi-paso ni texto: es exclusivamente vision.

## Casos de uso

- Aplicacion web de retoque fotografico: el pipeline encadena segmentacion MediaPipe, deteccion de rostro, CodeFormer para restaurar la cara y Real-ESRGAN para ampliar; todo corre en el dispositivo del usuario sin subir imagenes a un servidor.
- Restauracion de fotos antiguas o escaneadas: Restormer defocus corrige el desenfoque de escaneo y Restormer denoise elimina el ruido de sensores o de compresion, con entradas fijas de 512x512.
- Mejora de retratos para redes sociales: CodeFormer recupera detalle facial en recortes alineados de 512 px con peso de fidelidad 0,7, equilibrando realismo y parecido con el original.
- Ampliacion de imagenes de producto o miniaturas: Real-ESRGAN x2plus duplica la resolucion con dimensiones dinamicas de hasta 384 px de entrada, util para generar versiones de mayor tamano en el cliente.
- Procesado por lotes en el navegador: al ejecutarse con WebGPU y onnxruntime-web, permite lotes locales sin coste de servidor ni transferencia de datos, relevante por privacidad.
- Prototipado de pipelines de restauracion en ONNX: los ficheros sirven como referencia de exportacion con paridad verificada (80-107 dB PSNR) para integrar en aplicaciones web o de escritorio.
- Segmentacion y anclaje facial previos: los modelos MediaPipe permiten recortar y alinear rostros antes de pasarlos a CodeFormer dentro de la misma aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo es la paridad de exportacion frente a PyTorch fp32 en CPU (onnxruntime 1.19.2, un recorte real de 512 px):

| Fichero | PSNR de paridad vs PyTorch fp32 |
|---|---|
| Restormer denoise | 107 dB |
| Real-ESRGAN x2plus | 83 dB |
| CodeFormer | 80 dB |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; los tamanos de fichero (33,8-188,7 MB) sugieren un consumo moderado, pero el autor no publica cifras de memoria en ejecucion.
- GPU recomendadas: no disponibles; el autor solo indica que el computo fp32 es necesario para resultados correctos en WebGPU con Restormer.
- Cabe en GPU de consumo: probablemente si, dado el tamano de los modelos, pero no hay datos confirmados.
- Opciones de despliegue: onnxruntime-web con WebGPU (objetivo principal), onnxruntime en CPU/GPU, y LiteRT/TFLite para los ficheros MediaPipe.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| levxme/deblur-models (este repo) | Coleccion de restauracion de imagen | no disponible | no aplica | mixta (MIT, BSD-3, S-Lab no comercial, Apache-2.0) | ONNX, TFLite |
| swz30/Restormer (original) | Transformer de restauracion | no disponible | no aplica | MIT | PyTorch |
| xinntao/Real-ESRGAN (original) | RRDBNet de superresolucion | no disponible | no aplica | BSD-3-Clause | PyTorch |
| sczhou/CodeFormer (original) | VQGAN + transformer facial | no disponible | no aplica | S-Lab License 1.0 (no comercial) | PyTorch |

La diferencia principal frente a los originales es el empaquetado para navegador (ONNX, WebGPU, pesos fp16) y la paridad de exportacion verificada; el rendimiento absoluto de las redes no se documenta en este repositorio.

## Limitaciones y advertencias

- CodeFormer esta bajo S-Lab License 1.0, solo uso no comercial: el repositorio no debe usarse para trabajo comercial.
- Licencia mixta por fichero; es obligatorio revisar `NOTICE.md` y respetar la atribucion a los autores originales.
- Restormer exige entradas fijas de 512x512 en RGB 0..1; no acepta tamanos arbitrarios.
- Real-ESRGAN requiere altura y anchura pares y hasta 384 px de entrada; la salida puede exceder ligeramente 0..1 y debe recortarse.
- CodeFormer solo funciona con recortes faciales alineados de 512x512 en rango [-1, 1]; no procesa imagenes completas directamente.
- El computo completo en fp16 produce resultados visiblemente incorrectos en WebGPU para Restormer, lo que limita optimizaciones de rendimiento.
- No hay informacion sobre sesgos, riesgo de alucinacion visual ni limitaciones de idioma (no aplica).
- El repositorio tiene 0 descargas y 0 likes; no hay evidencia de uso en produccion ni soporte de la comunidad.
- La aplicacion que consume estos ficheros aun no esta enlazada publicamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/levxme/deblur-models
- Aviso de licencias: https://huggingface.co/levxme/deblur-models/blob/main/NOTICE.md
- Restormer, paper: https://arxiv.org/abs/2111.09881
- Restormer, repositorio: https://github.com/swz30/Restormer
- Real-ESRGAN, paper: https://arxiv.org/abs/2107.10833
- Real-ESRGAN, repositorio: https://github.com/xinntao/Real-ESRGAN
- CodeFormer, paper: https://arxiv.org/abs/2206.11253
- CodeFormer, repositorio: https://github.com/sczhou/CodeFormer
- MediaPipe Selfie Multiclass, model card: https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-Selfie-Multiclass
- MediaPipe Face Landmarker, model card: https://huggingface.co/litert-community/MediaPipe-FaceLandmarker
