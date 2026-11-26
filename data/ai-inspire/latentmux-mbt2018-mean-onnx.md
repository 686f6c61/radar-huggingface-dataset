# ai-inspire/latentmux-mbt2018-mean-onnx

## Resumen

LatentMux MBT2018-Mean ONNX es un codec de compresion de imagen neuronal exportado a ONNX, derivado del modelo `mbt2018-mean` (Mean-Scale Hyperprior, Minnen et al., NeurIPS 2018) implementado en la libreria CompressAI de InterDigital. Lo publica el usuario `ai-inspire` dentro de la coleccion LatentMux Neural Codec ONNX Collection, que estandariza exportaciones ONNX con checksums SHA-256 verificados para inferencia en Rust, C++ y Python mediante ONNX Runtime. No es un modelo generativo ni un LLM: es un compresor de imagenes RGB de dimensiones variables que transforma pixeles en un bitstream comprimido (formato `.nmc`) y lo reconstruye.

El paquete divide el codec en tres grafos ONNX independientes (encoder, hyper_decoder y decoder), cada uno en precision FP32 e INT8, mas una tabla de probabilidades `cdf_tables.bin` en formato HCDB v1 que alimenta un codificador entropico `Rans64` implementado en Rust puro. El modelo opera en un unico punto de calidad fijo (`q=3`, objetivo MSE), con alineacion obligatoria de la imagen a multiplos de 64 pixeles. El total de artefactos binarios ocupa 33,94 MiB.

Su relevancia practica esta en que permite integrar compresion de imagen aprendida en pipelines de produccion sin dependencias de PyTorch: basta ONNX Runtime, con soporte para CPU, CUDA, TensorRT, DirectML, CoreML, ROCm, OpenVINO y WebGPU. La variante INT8 reduce el coste de decodificacion a la mitad con una perdida de 0,31 dB de PSNR, lo que la hace viable en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mean-Scale Hyperprior (Minnen et al., NeurIPS 2018), red convolucional con hiperprior gaussiano; exportada como tres grafos ONNX (encoder, hyper_decoder, decoder) |
| Parametros totales | no disponible (el autor solo publica tamanos de fichero: 33,94 MiB en 7 binarios) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen RGB de dimensiones variables alineadas a multiplos de 64 pixeles |
| Tipos de cuantizacion | FP32 y INT8 por canal simetrico en pesos (esquema `w8_absmax` con `DequantizeLinear`, `axis=0`) |
| Idiomas soportados | no aplica (codec de imagen, sin procesamiento de lenguaje) |
| Licencia | BSD-3-Clause-Clear |
| Formato de pesos | ONNX (`.onnx`) mas `cdf_tables.bin` (HCDB v1) y `manifest.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Mean-Scale Hyperprior de Minnen, Balle y Toderici (2018): un encoder convolucional transforma la imagen en una representacion latente `y`, un hiperprior (`hyper_decoder`) predice los parametros gaussianos (media y escala) de la distribucion de `y` a partir de una latente hiperpriora `z`, y un decoder reconstruye la imagen desde `y_hat`. La entropia se codifica con un `Rans64` en Rust puro sobre tablas CDF empaquetadas en `cdf_tables.bin` (HCDB v1). El modelo no se ha reentrenado: es una exportacion del checkpoint `mbt2018-mean` de CompressAI con `q=3` y objetivo MSE.

La innovacion tecnica del paquete es la ingenieria de despliegue: grafos separados para permitir streaming y ejecucion por etapas, cuantizacion INT8 por canal solo en pesos de convolucion 4D, y checksums SHA-256 para cada artefacto. Segun el autor, la cuantizacion reduce `hyper_decoder` de 11,42 MB a 2,86 MB y acelera la decodificacion de 1119 ms a 501 ms con una perdida de 0,31 dB de PSNR. No se documentan detalles del dataset de entrenamiento original (numero de tokens o imagenes, composicion, ni uso de RLHF/DPO), ya que el autor remite al repositorio upstream de CompressAI.

## Capacidades

- Compresion y descompresion de imagenes RGB de dimensiones variables (alineadas a multiplos de 64 pixeles) con un unico punto de calidad fijo (`q=3`, MSE).
- Codificacion entropica mediante `Rans64` sobre tablas CDF HCDB v1, con bitstream en formato `.nmc`.
- Ejecucion en FP32 o INT8 por canal, seleccionable por el usuario.
- Inferencia via ONNX Runtime con multiples execution providers: CPU, CUDA, TensorRT, DirectML, CoreML, ROCm, OpenVINO y WebGPU.
- Integracion en Rust, C++ y Python (el autor menciona inferencia nativa en Rust/C++/Python).
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingues: no es un modelo de lenguaje.
- No soporta vision generativa ni descripcion de imagenes: solo codifica y reconstruye.

## Casos de uso

- Compresion de imagenes en servidores de almacenamiento: el codec transforma lotes de imagenes RGB en bitstreams `.nmc` con una tasa medida de 0,348 bpp en pruebas de 128x128, util para reducir costes de almacenamiento frente a codecs clasicos en escenarios donde se prioriza la relacion tasa-distorsion aprendida.
- Transmision de imagenes en aplicaciones moviles o embebidas: la variante INT8 decodifica en 500,9 ms en CPU de 2 hilos con 75,47 MB de RAM pico, lo que permite desplegarla en dispositivos sin GPU dedicada mediante ONNX Runtime con CoreML o DirectML.
- Pipelines de preprocesado en vision por computador: al ser un codec que reconstruye con PSNR de 30,65-30,96 dB, puede usarse para almacenar datasets de entrenamiento comprimidos y descomprimirlos al vuelo antes de pasarlos a un modelo de deteccion o segmentacion.
- Archivado de largo plazo con verificación de integridad: cada artefacto incluye SHA-256 en `manifest.json`, lo que facilita auditar que el modelo desplegado no ha sido alterado en un sistema de archivo documental.
- Integracion en servicios web con WebGPU: el soporte de WebGPU en ONNX Runtime permite ejecutar la descompresion en el navegador del cliente, descargando solo 2,58 MiB (encoder INT8) y 2,86 MiB (hyper_decoder INT8) en lugar de los 9,68 y 11,42 MiB en FP32.
- Evaluacion comparativa de codecs neuronales: al estar estandarizado en ONNX con checksums, sirve como referencia reproducible para comparar tasa-distorsion frente a JPEG, WebP o AVIF en un banco de pruebas propio.
- Prototipado en Rust: el bitstream `.nmc` y el decodificador `Rans64` en Rust puro permiten construir un visor o servicio de imagenes sin enlazar ONNX Runtime en el cliente, usando el CLI `latentmux` para generar y restaurar ficheros.

## Benchmarks y rendimiento

Datos medidos por el autor con `latentmux bench` sobre ONNX Runtime CPU con 2 hilos, imagen de 128x128:

| Precision | Tamano `.nmc` | bpp | Encode (ms) | Decode (ms) | PSNR (dB) | SSIM | RMSE | RAM pico | `init_ms` |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FP32 | 713 B | 0,348 | 2003,2 | 1118,7 | 30,96 | 0,9080 | 7,22 | 77,42 MB | 979,4 |
| INT8 | 713 B | 0,348 | 810,5 | 500,9 | 30,65 | 0,8986 | 7,48 | 75,47 MB | 301,3 |

No se han publicado resultados comparativos con JPEG, WebP, AVIF ni con otros codecs neuronales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el autor solo reporta RAM pico de 75,47-77,42 MB en CPU para una imagen de 128x128.
- GPU recomendadas: no especificadas por el autor; al ser un modelo de menos de 34 MiB en total, cualquier GPU con soporte de ONNX Runtime (CUDA, TensorRT, DirectML, ROCm, CoreML) es suficiente en terminos de memoria.
- Cabe en GPU de consumo: si, con amplio margen; el paquete completo en INT8 ocupa 7,02 MiB (encoder 2,58 + hyper_decoder 2,86 + decoder 1,58) mas 114,1 KiB de tablas CDF.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, DirectML, CoreML, ROCm, OpenVINO, WebGPU), CLI `latentmux`, integracion directa en Rust/C++/Python.
- Latencia y throughput: encode 2003,2 ms (FP32) / 810,5 ms (INT8) y decode 1118,7 ms (FP32) / 500,9 ms (INT8) para 128x128 en CPU de 2 hilos; no se han publicado mediciones en GPU ni para resoluciones mayores.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| LatentMux MBT2018-Mean ONNX (este) | Codec de imagen neuronal, Mean-Scale Hyperprior | Imagen RGB, multiplos de 64 px | BSD-3-Clause-Clear | ONNX en Hugging Face |
| CompressAI `mbt2018-mean` (upstream) | Codec de imagen neuronal | Imagen RGB | BSD-3-Clause-Clear | PyTorch en GitHub |
| CompressAI `mbt2018` | Codec de imagen neuronal con contexto autoregresivo | Imagen RGB | BSD-3-Clause-Clear | PyTorch en GitHub |
| `bmshj2018-factorized` (CompressAI) | Codec de imagen neuronal con prior factorizado | Imagen RGB | BSD-3-Clause-Clear | PyTorch en GitHub |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no se ofrece una comparacion cuantitativa de tasa-distorsion.

## Limitaciones y advertencias

- Punto de operacion fijo: solo implementa `quality=3` con objetivo MSE; no permite ajustar la tasa en tiempo de ejecucion.
- Requiere obligatoriamente `cdf_tables.bin`; sin ese fichero el bitstream `.nmc` no se puede decodificar.
- La imagen debe alinearse a multiplos de 64 pixeles (`Pad to 64x`), lo que anade complejidad en el preprocesado.
- La cuantizacion INT8 introduce una perdida medible: -0,31 dB de PSNR y SSIM de 0,8986 frente a 0,9080 en FP32.
- La licencia BSD-3-Clause-Clear no concede licencias de patente expresas ni implicitas, lo que puede ser un riesgo legal en despliegues comerciales.
- El modelo se distribuye sin datos de entrenamiento documentados por el autor; la trazabilidad depende del repositorio upstream de CompressAI.
- No hay benchmarks en GPU ni a resoluciones altas publicados; las latencias reportadas corresponden a 128x128 en CPU con 2 hilos y no son extrapolables a produccion con imagenes grandes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- Al ser un codec y no un modelo de lenguaje, no ofrece generacion de texto, razonamiento, codigo, tool calling ni capacidades multilingues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-inspire/latentmux-mbt2018-mean-onnx
- Repositorio upstream CompressAI: https://github.com/InterDigitalInc/CompressAI
- Paper de referencia (Minnen et al., NeurIPS 2018): Joint Autoregressive and Hierarchical Priors for Learned Image Compression
- `manifest.json` con checksums SHA-256: https://huggingface.co/ai-inspire/latentmux-mbt2018-mean-onnx/blob/main/manifest.json
- `NOTICE.txt` de atribucion y patentes: https://huggingface.co/ai-inspire/latentmux-mbt2018-mean-onnx/blob/main/NOTICE.txt
- `LICENSE` (BSD-3-Clause-Clear): https://huggingface.co/ai-inspire/latentmux-mbt2018-mean-onnx/blob/main/LICENSE
