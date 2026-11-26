# ai-inspire/latentmux-taesd-onnx

## Resumen

LatentMux TAESD ONNX es una coleccion de exportaciones ONNX de los ocho Tiny AutoEncoders (TAESD) publicados originalmente por madebyollin. No es un modelo generativo en si, sino un conjunto de codificadores y decodificadores latentes de muy baja latencia pensados para sustituir al VAE completo en pipelines de difusion (SD 1.x/2.x, SDXL, SD3, FLUX.1, FLUX.2, Sana y QwenImage 2.1). Cada variante se ofrece en precision FP32 y en INT8 por canal, con checksums SHA-256 verificados y un contrato de entrada/salida ONNX estandarizado.

El paquete lo mantiene ai-inspire bajo licencia MIT y esta disenado para inferencia nativa en Rust, C++ y Python a traves de ONNX Runtime, con soporte para ejecucion en CPU, DirectML, CUDA, TensorRT, CoreML, ROCm, OpenVINO y WebGPU. Ademas de los pesos, el autor incluye un formato de bitstream propio (TAE1) basado en cuantizacion adaptativa por tile de 8x8, DPCM circular, ZigZag y compresion con ruzstd, orientado a codificacion de imagenes en streaming.

Su relevancia practica esta en que permite previsualizar y decodificar latentes de forma sub-segundo en CPU, lo que habilita interfaces de difusion interactivas, pipelines de image-to-image con feedback rapido y despliegues sin GPU dedicada. El repositorio ocupa 0,2 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny AutoEncoder (TAESD) exportado a ONNX; codificador y decodificador convolucionales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | FP32 y INT8 por canal (pesos, `DequantizeLinear`) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder_fp32.onnx`, `encoder_int8.onnx`, `decoder_fp32.onnx`, `decoder_int8.onnx`) |

Variantes incluidas y escalas latentes:

| Variante | Objetivo upstream | Escala espacial f | Canales latentes | Canales de imagen |
|---|---|---:|---:|---|
| `taesd` | SD 1.x / 2.x | 8 | 4 | RGB (3) |
| `taesdxl` | SDXL | 8 | 4 | RGB (3) |
| `taesd3` | Stable Diffusion 3 | 8 | 16 | RGB (3) |
| `taef1` | FLUX.1 | 8 | 16 | RGB (3) |
| `taef2` | FLUX.2 | 8 | 32 | RGB (3) |
| `taesana` | Sana DC-AE | 32 | 32 | RGB (3) |
| `taeqi2_1` | QwenImage 2.1 | 16 | 64 | RGBA (4) |
| `taeqi2_1_tinier` | QwenImage 2.1 tinier | 16 | 64 | RGBA (4) |

## Arquitectura y entrenamiento

Cada variante es un autoencoder convolucional ligero (familia TAESD) que comprime una imagen a un latente de baja resolucion espacial y lo reconstruye. La escala espacial `f` varia entre 8, 16 y 32 segun la familia de difusion, y el numero de canales latentes va de 4 a 64. Los modelos se exportan a ONNX con un contrato fijo: el codificador recibe `x [1, C_in, pad_h, pad_w]` en rango `[0, 1]` y produce `latent [1, C_lat, pad_h/f, pad_w/f]`; el decodificador invierte la operacion. No se dispone de informacion sobre el dataset de entrenamiento original ni sobre el numero de tokens o pasos de entrenamiento en la informacion proporcionada.

La innovacion tecnica del paquete es doble. Por un lado, la cuantizacion INT8 por canal (`w8_absmax`) reduce el tamano aproximadamente 4x (por ejemplo, `taesd`/`taesdxl` pasan de 4,90 MB a 1,25 MB) con una perdida de PSNR de entre 0,00 y 0,59 dB en la mayoria de variantes. Por otro lado, el autor advierte que `taef1` en INT8 sufre una caida de -4,20 dB (de 33,73 a 29,53 dB sobre 128x128), por lo que recomienda usar `--precision fp32` en esa variante. El formato de bitstream TAE1 anade cuantizacion adaptativa por tile, DPCM circular y compresion con `ruzstd`.

## Capacidades

- Codificacion y decodificacion de imagenes RGB y RGBA a traves de espacio latente para ocho familias de difusion.
- Compresion latente con escala espacial configurable (8x, 16x, 32x) y canales latentes de 4 a 64.
- Inferencia en CPU, DirectML, CUDA, TensorRT, CoreML, ROCm, OpenVINO y WebGPU mediante ONNX Runtime.
- Exportacion estandarizada con checksums SHA-256 para verificacion de integridad.
- Bitstream propio TAE1 con cuantizacion adaptativa por tile y compresion `ruzstd`.
- No incluye generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Previsualizacion rapida en interfaces de difusion: decodificar latentes con el TAESD correspondiente para mostrar una imagen aproximada mientras el VAE completo termina, reduciendo la latencia percibida en herramientas tipo ComfyUI o Automatic1111.
- Image-to-image interactivo: usar el codificador para proyectar una imagen del usuario al espacio latente del modelo de difusion y el decodificador para ver el resultado en tiempo real sobre CPU.
- Despliegue en entornos sin GPU: al ejecutarse en ONNX Runtime con CPU o WebGPU, permite servir pipelines de difusion ligeros en portatiles o contenedores sin acelerador dedicado.
- Integracion en aplicaciones Rust o C++: el formato ONNX y los checksums permiten embeber el codec en binarios nativos para edicion de imagen o herramientas de escritorio.
- Codificacion de imagenes en streaming: el bitstream TAE1 con cuantizacion adaptativa por tile y DPCM circular esta pensado para transmision progresiva de imagenes comprimidas en latente.
- Compatibilidad multiplataforma en pipelines de produccion: al cubrir SD 1.x, SDXL, SD3, FLUX.1, FLUX.2, Sana y QwenImage 2.1, el mismo contrato ONNX sirve para varios backends de generacion sin reescribir el codigo de integracion.
- Verificacion de integridad en CI/CD: los SHA-256 del manifiesto permiten validar artefactos descargados antes de cargarlos en produccion.

## Benchmarks y rendimiento

Los unicos datos numericos publicados en la informacion disponible son las variaciones de PSNR por cuantizacion INT8:

| Variante | Precision | PSNR (128x128) | Delta frente a FP32 |
|---|---|---:|---:|
| `taef1` | FP32 | 33,73 dB | referencia |
| `taef1` | INT8 | 29,53 dB | -4,20 dB |
| Resto de variantes | INT8 | no disponible | 0,00 a -0,59 dB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las variantes; los modelos mas grandes (`taeqi2_1` en FP32) ocupan unos 29 MB por archivo (codificador o decodificador).
- GPU recomendadas: cualquier GPU compatible con ONNX Runtime; se soportan CUDA, TensorRT, DirectML, ROCm, CoreML y WebGPU.
- Cabe en GPU consumer: si, practicamente cualquier GPU consumer moderna, e incluso en CPU sin acelerador.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, DirectML, CoreML, ROCm, OpenVINO, WebGPU), integracion nativa en Rust, C++ y Python.
- Latencia y throughput: el autor describe codificacion/decodificacion en CPU por debajo del segundo, pero no se proporcionan cifras concretas de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LatentMux TAESD ONNX | no disponible | no aplica | MIT | ONNX (FP32/INT8) | Hugging Face |
| madebyollin/taesd (upstream) | no disponible | no aplica | MIT | PyTorch | Hugging Face / GitHub |
| VAE completo de SDXL | no disponible | no aplica | CreativeML Open RAIL++-M | safetensors | Hugging Face |

El paquete de LatentMux se diferencia del TAESD original por ofrecer exportaciones ONNX con cuantizacion INT8, checksums y soporte multi-backend, y del VAE completo por su tamano mucho menor y su latencia sub-segundo en CPU, a costa de menor fidelidad de reconstruccion. No se dispone de datos de rendimiento comparativos adicionales.

## Limitaciones y advertencias

- La variante `taef1` en INT8 pierde 4,20 dB de PSNR; el autor recomienda usar FP32 en ese caso.
- La reconstruccion es aproximada: los TAESD priorizan velocidad sobre fidelidad, por lo que no sustituyen al VAE completo en generacion final de alta calidad.
- No procesa texto ni tiene capacidades de razonamiento, codigo o agentes; su uso esta limitado a vision y latentes.
- No se dispone de informacion sobre sesgos, ya que el modelo no genera contenido semantico propio.
- La licencia MIT permite uso comercial, pero se debe conservar el aviso de copyright y el archivo `NOTICE.txt` con la atribucion a madebyollin/taesd.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de adopcion en produccion.
- La fecha de creacion (2026-11-25) y actualizacion (2026-11-26) figuran en la informacion proporcionada; verificar la vigencia antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/ai-inspire/latentmux-taesd-onnx
- Repositorio upstream TAESD: https://github.com/madebyollin/taesd
- Modelo base en Hugging Face: https://huggingface.co/madebyollin/taesd
- Manifiesto de artefactos: https://huggingface.co/ai-inspire/latentmux-taesd-onnx/blob/main/manifest.json
- Aviso de atribucion: https://huggingface.co/ai-inspire/latentmux-taesd-onnx/blob/main/NOTICE.txt
- Licencia: https://huggingface.co/ai-inspire/latentmux-taesd-onnx/blob/main/LICENSE
