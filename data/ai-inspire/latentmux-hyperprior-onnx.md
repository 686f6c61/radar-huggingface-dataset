# ai-inspire/latentmux-hyperprior-onnx

## Resumen

LatentMux Hyperprior ONNX es un export en formato ONNX del modelo de compresion de imagen neuronal `bmshj2018-hyperprior` (calidad 3, objetivo MSE) procedente de la libreria CompressAI de InterDigital. No es un modelo de lenguaje ni un modelo generativo: es un codec de imagen completo basado en la arquitectura Scale Hyperprior de Ballé et al. (ICLR 2018), empaquetado para inferencia sin Python mediante ONNX Runtime y un codificador de entropia rANS implementado en Rust. Lo publica el usuario `ai-inspire` como parte de la coleccion "LatentMux Neural Codec ONNX Collection".

El interes practico del artefacto esta en su formato de despliegue: divide el codec en tres subgrafos ONNX independientes (`encoder`, `hyper_decoder` y `decoder`), cada uno en version FP32 e INT8 con pesos cuantizados por canal, y anade una tabla binaria de CDF (`cdf_tables.bin`, formato HCDB v1) que permite comprimir y descomprimir imagenes sin dependencia de Python. El repositorio completo ocupa 24,62 MiB en siete ficheros binarios verificados con SHA-256.

El modelo resuelve un problema concreto: integrar compresion de imagen neuronal en aplicaciones nativas (Rust, C++, Python) con un contrato de tensores estable y soporte para multiples execution providers de ONNX Runtime. Su limitacion principal es que opera en un unico punto de la curva tasa-distorsion (calidad 3, MSE), sin control de calidad en tiempo de ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Scale Hyperprior (Ballé et al., ICLR 2018); autoencoder convolucional con hyperprior gaussiano condicionado por `z` |
| Parametros totales | no disponible (el repositorio publica tamanos de fichero, no recuento de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de compresion de imagen, no de texto) |
| Tipos de cuantizacion | FP32 y pesos INT8 simetricos por canal (`axis=0`, rango `[-127, 127]`) con `DequantizeLinear`; activaciones en FP32 |
| Idiomas soportados | no aplica (procesa imagenes RGB, sin componente linguistica) |
| Licencia | BSD-3-Clause-Clear (sin concesion expresa ni implicita de patentes) |
| Formato de pesos | ONNX (`encoder_{fp32,int8}.onnx`, `hyper_decoder_{fp32,int8}.onnx`, `decoder_{fp32,int8}.onnx`) + tabla binaria `cdf_tables.bin` (HCDB v1) |

## Arquitectura y entrenamiento

El modelo sigue la formulacion de Scale Hyperprior: un encoder convolucional transforma la imagen `x` en una representacion latente `y` (16 canales, factor de submuestreo 16), y un hyperencoder deriva `z` (64 canales, factor 64) que se cuantiza y se usa para predecir la escala de una gaussiana condicional sobre `y`. La entropia de `y` y `z` se codifica con un modelo gaussiano cuantizado cuyas CDF/PMF se almacenan en `cdf_tables.bin`, consumidas por un codificador rANS (`Rans64`, pure Rust). El export separa el grafo en tres subgrafos ONNX con contrato de tensores fijo: `x [1,3,pad_h,pad_w]` → `y`, `z`; `z_hat [1,C_z,pad_h/64,pad_w/64]` → `scales_hat`; `y_hat [1,C_y,pad_h/16,pad_w/16]` → `x_hat [1,3,pad_h,pad_w]`. El padding se alinea a multiplos de 64.

No se detallan en la informacion disponible los datos de entrenamiento (composicion del dataset, numero de imagenes, regimen de aumento de datos) ni si hubo ajuste fino adicional sobre el checkpoint original de CompressAI. El modelo base `bmshj2018-hyperprior` fue entrenado por sus autores originales con perdida tasa-distorsion (MSE) sobre un corpus de imagenes naturales; este repositorio solo aporta el export, la cuantizacion INT8 y las tablas de entropia. La cuantizacion INT8 se aplica exclusivamente a pesos convolucionales 4D de `float32` con al menos 1024 elementos, dejando activaciones en FP32, lo que reduce el coste computacional sin degradar sustancialmente la calidad (-0,21 dB PSNR).

## Capacidades

- Compresion y descompresion de imagenes RGB de dimensiones arbitrarias (con padding a multiplos de 64).
- Codificacion de entropia completa mediante rANS sobre tablas CDF precalculadas, sin dependencia de Python en tiempo de inferencia.
- Ejecucion en multiples backends a traves de ONNX Runtime: CPU, DirectML, CUDA, TensorRT, CoreML, ROCm, OpenVINO y WebGPU.
- Dos niveles de precision intercambiables (FP32 e INT8) con el mismo contrato de tensores, lo que permite seleccionar el equilibrio velocidad/calidad en despliegue.
- Integracion nativa en Rust y C++ mediante la CLI `latentmux` o mediante carga directa de los subgrafos ONNX.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un codec de imagen, no un modelo de lenguaje.

## Casos de uso

- Compresion de imagenes en aplicaciones de escritorio nativas: el codec se puede enlazar en una aplicacion Rust/C++ sin runtime de Python, usando los subgrafos ONNX y la CLI `latentmux`, lo que simplifica el empaquetado y la distribucion.
- Archivado y almacenamiento de imagenes con restricciones de ancho de banda: a 128x128 el codec produce bitstreams de 775-783 bytes (0,378-0,382 bpp) con PSNR de 30,78-30,99 dB, adecuado para pipelines donde el coste de almacenamiento es critico.
- Procesamiento en el borde (edge) con WebGPU u OpenVINO: los modelos INT8 ocupan 2,58 MiB (encoder) y 1,58 MiB (decoder), lo que permite desplegarlos en dispositivos con recursos limitados.
- Servicios de transcodificacion y conversion de formatos: el contrato de tensores permite integrar el codec como etapa de compresion dentro de pipelines de procesamiento de imagen existentes.
- Investigacion en compresion neuronal: el export reproducible con checksums SHA-256 y la separacion encoder/hyperdecoder/decoder facilitan la experimentacion con codificadores de entropia alternativos o la sustitucion de subgrafos.
- Evaluacion comparativa de codecs: la disponibilidad de variantes FP32 e INT8 con metricas publicadas (bpp, PSNR, SSIM, RMSE, latencia) permite medir el impacto de la cuantizacion en un codec de referencia.
- Integracion en herramientas de captura o vision por computador que necesiten comprimir frames antes de transmitirlos, dado el bajo coste de inicializacion de la variante INT8 (157,6 ms frente a 509,9 ms en FP32).

## Benchmarks y rendimiento

Resultados medidos con `latentmux bench` sobre ONNX Runtime CPU con 2 hilos, imagen de 128x128:

| Precision | Tamano `.nmc` | bpp | Encode (ms) | Decode (ms) | PSNR (dB) | SSIM | RMSE | RAM pico | Init (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FP32 | 775 B | 0,378 | 1644,0 | 775,1 | 30,99 | 0,9097 | 7,20 | 68,98 MB | 509,9 |
| INT8 | 783 B | 0,382 | 710,0 | 393,8 | 30,78 | 0,9063 | 7,38 | 64,32 MB | 157,6 |

La cuantizacion INT8 reduce el tiempo de codificacion un 57 % y el de decodificacion un 49 %, con una perdida de 0,21 dB de PSNR y un incremento de 8 bytes en el bitstream. No se han publicado resultados comparativos frente a otros codecs (JPEG, WebP, AVIF, VVC) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; los tamanos de modelo (encoder INT8 2,58 MiB, decoder INT8 1,58 MiB, hyperdecoder INT8 1,02 MiB) implican huellas de memoria muy reducidas, compatibles con GPUs de gama baja.
- GPU recomendadas: cualquier GPU con soporte para los execution providers de ONNX Runtime (CUDA, TensorRT, DirectML, ROCm, CoreML, WebGPU). No se especifican modelos concretos.
- Cabe en GPU de consumo: si, dado el tamano de los grafos (inferior a 10 MiB en FP32 por subgrafo).
- Opciones de despliegue: ONNX Runtime (CPU, DirectML, CUDA, TensorRT, CoreML, ROCm, OpenVINO, WebGPU), CLI `latentmux`, integracion nativa en Rust/C++.
- Latencia y throughput: medidos en CPU de 2 hilos a 128x128 (ver tabla de benchmarks); no se proporcionan datos para GPU ni para resoluciones mayores.
- RAM pico medida durante la inferencia: 68,98 MB (FP32) y 64,32 MB (INT8).

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada frente a otros codecs neuronales (por ejemplo, `bmshj2018-factorized`, `mbt2018` o variantes de CompressAI) ni frente a codecs clasicos (JPEG, WebP, AVIF). La unica referencia es el modelo upstream `bmshj2018-hyperprior q=3` de CompressAI, del que este repositorio es un export con cuantizacion INT8 y tablas de entropia empaquetadas.

| Modelo | Parametros | Contexto | PSNR (128x128) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LatentMux Hyperprior ONNX (INT8) | no disponible | no aplica | 30,78 dB | BSD-3-Clause-Clear | Hugging Face (ONNX) |
| LatentMux Hyperprior ONNX (FP32) | no disponible | no aplica | 30,99 dB | BSD-3-Clause-Clear | Hugging Face (ONNX) |
| CompressAI `bmshj2018-hyperprior` q=3 | no disponible | no aplica | no disponible | BSD-3-Clause-Clear | GitHub (PyTorch) |

## Limitaciones y advertencias

- Requiere codificacion de entropia rANS externa entre `encoder`, `hyper_decoder` y `decoder`; los subgrafos ONNX por si solos no producen ni consumen bitstreams.
- Punto de operacion fijo (`quality=3`, MSE): no hay control de calidad en tiempo de ejecucion, por lo que no se puede ajustar la tasa sin reentrenar o disponer de otro checkpoint.
- La licencia BSD-3-Clause-Clear no concede licencias de patente expresas ni implicitas, lo que puede ser un riesgo para uso comercial en jurisdicciones con patentes sobre compresion neuronal.
- No se documentan sesgos ni riesgos de alucinacion por tratarse de un codec, pero si existe el riesgo de artefactos de reconstruccion en imagenes fuera de la distribucion de entrenamiento; no se publican datos sobre robustez.
- No se especifican los datos de entrenamiento ni el regimen de validacion, lo que limita la evaluacion independiente del rendimiento en dominios distintos al de las imagenes naturales.
- Los benchmarks publicados corresponden exclusivamente a CPU de 2 hilos y resolucion 128x128; el comportamiento en GPU, resoluciones mayores o imagenes de alta frecuencia no esta documentado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/ai-inspire/latentmux-hyperprior-onnx
- Repositorio upstream CompressAI: https://github.com/InterDigitalInc/CompressAI
- Paper de referencia (Ballé et al., ICLR 2018): https://arxiv.org/abs/1802.01436 (Variational image compression with a scale hyperprior)
- Ficheros de licencia y atribucion en el repositorio: `LICENSE` y `NOTICE.txt` (referenciados en la model card)
- Manifiesto de artefactos: `manifest.json` (referenciado en la model card)
