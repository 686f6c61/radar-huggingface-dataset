# ai-inspire/latentmux-taehv-onnx

## Resumen

LatentMux TAEHV ONNX es una coleccion de exportaciones ONNX de los autoencoders variacionales (VAE) de video de la familia TAEHV, originalmente desarrollados por madebyollin y adaptados por ai-inspire. No es un modelo generativo de lenguaje, sino un componente de infraestructura: un codec neuronal de video que comprime y reconstruye fotogramas en el espacio latente utilizado por modelos de difusion de video como HunyuanVideo, Wan y LTX. El repositorio empaqueta seis variantes arquitectonicas distintas en precisiones FP32 e INT8, sumando 24 ficheros ONNX.

La relevancia del proyecto radica en su orientacion a inferencia en produccion: los grafos exponen explicitamente los nueve tensores de estado causal (`MemBlock`) como entradas y salidas, lo que permite streaming por GOP con memoria acotada en lugar de procesar el video completo de una vez. Ademas, la cuantizacion por canal a INT8 reduce el tamano de los decodificadores aproximadamente 4x con una perdida de calidad medida de -0,0037 dB frente a FP32 en la variante `taehv1_5_super`.

El paquete esta pensado para integraciones en Rust, C++ y Python mediante ONNX Runtime, con checksums SHA-256 verificados y un manifiesto legible por maquina. Su licencia MIT y su huella de 0,4 GB lo hacen adecuado para pipelines de codificacion y decodificacion de video en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE convolutional causal con 9 bloques de estado (`MemBlock`), variantes con y sin `SuperMemBlock` |
| Parametros totales | no disponible (expresado en tamano de fichero; decodificador mayor de 72,48 MiB en FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesamiento por chunks de video con estado causal; sin ventana de tokens) |
| Tipos de cuantizacion | FP32 y weight-INT8 por canal (`w8_absmax` con `DequantizeLinear`) |
| Idiomas soportados | no disponible (dominio de video, no de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (24 ficheros: encoder y decoder en FP32 e INT8 por cada una de las 6 variantes) |

Variantes incluidas y su configuracion espacial/temporal:

| Registry ID | Version | Objetivo upstream | f_s | f_t | Canales latentes | SuperMemBlock |
|---|---|---|---|---|---|---|
| `taehv` | `hyv1-f8t4c16` | HunyuanVideo 1 | 8 | 4 | 16 | No |
| `taew2_1` | `wan21-f8t4c16` | Wan 2.1 / 2.2 14B | 8 | 4 | 16 | No |
| `taehv1_5` | `hyv15-f16t4c32` | HunyuanVideo 1.5 | 16 | 4 | 32 | No |
| `taehv1_5_super` | `hyv15-super-f16t4c32` | HunyuanVideo 1.5 Super | 16 | 4 | 32 | Si |
| `taew2_2_super` | `wan22-super-f16t4c48` | Wan 2.2 5B Super | 16 | 4 | 48 | Si |
| `taeltx2_3` | `ltx23-f32t8c128` | LTX-2.3 / 2.5 | 32 | 8 | 128 | No |

## Arquitectura y entrenamiento

Cada variante es un VAE de video con compresion espacial y temporal: `f_s` indica el factor de submuestreo espacial (8, 16 o 32) y `f_t` el temporal (4 u 8), mientras que el numero de canales latentes varia entre 16 y 128 segun la variante. La innovacion estructural clave es el caracter causal y con estado: el modelo mantiene nueve tensores de memoria (`mem_0..8`) que se pasan explicitamente entre llamadas, de modo que el encoder y el decoder procesan el video por chunks manteniendo coherencia temporal con memoria acotada. Las variantes `super` incorporan un `SuperMemBlock` adicional.

El contrato de entrada/salida ONNX es uniforme: el encoder recibe `x [1, t_scale, 3, pad_h, pad_w]` junto con los nueve tensores `mem_0..8` y devuelve `latent` mas los nueve `next_mem_0..8` actualizados; el decoder recibe `latent` y los nueve estados y devuelve `x_hat` con los estados actualizados. La cuantizacion INT8 emplea escala `absmax` por canal de pesos, reduciendo el decodificador de `taehv1_5_super` de 72,48 MiB a 18,29 MiB y el pico de RAM de 220,8 MB a 100,1 MB.

No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens o videos utilizados, ni sobre tecnicas de alineacion como RLHF o DPO; esos detalles pertenecen al proyecto upstream `madebyollin/taehv`.

## Capacidades

- Codificacion de video RGB y YUV420p a espacio latente y decodificacion inversa, por chunks con estado causal.
- Streaming por GOP con memoria acotada gracias a la exposicion explicita de los nueve tensores de estado.
- Compatibilidad con seis arquitecturas de difusion de video: HunyuanVideo 1, HunyuanVideo 1.5 (normal y Super), Wan 2.1 / 2.2 14B, Wan 2.2 5B Super y LTX-2.3 / 2.5.
- Ejecucion en multiples backends de ONNX Runtime: CPU, DirectML, CUDA, TensorRT, CoreML, ROCm, OpenVINO y WebGPU.
- Decodificacion en CPU mas rapida que tiempo real en la variante `taeltx2_3` con INT8 (0,41x RTF en encode y 0,64x RTF en decode).
- Formato de bitstream propio `TVH1` en Rust puro, con cuantizacion adaptativa de `n` bits (`-q:v 1..=100`), DPCM espacial y compresion `ruzstd`.
- Verificacion de integridad mediante SHA-256 por fichero y manifiesto `manifest.json` legible por maquina.
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues: es exclusivamente un codec de video.

## Casos de uso

- Preprocesado de datasets de video para entrenamiento de modelos de difusion: el encoder convierte clips a latentes compatibles con HunyuanVideo o Wan, permitiendo almacenar representaciones comprimidas en lugar de fotogramas crudos y acelerar las epochs de entrenamiento.
- Decodificacion en produccion de video generado: tras la fase de difusion, el decoder INT8 reconstruye los fotogramas con memoria acotada, lo que encaja en servicios de generacion de video con requisitos de latencia estrictos.
- Streaming de video en dispositivos de borde: la variante `taeltx2_3` en INT8 supera el tiempo real en CPU (0,41x/0,64x RTF), habilitando codificacion y decodificacion en equipos sin GPU dedicada.
- Integracion en pipelines nativos Rust o C++: el formato `TVH1` y los grafos ONNX permiten incrustar el codec en reproductores, herramientas de edicion o servicios de transcodificacion sin dependencias de Python.
- Investigacion en compresion neuronal de video: las seis variantes con distintos factores espaciales y temporales permiten comparar tasas de compresion y calidad de reconstruccion de forma controlada.
- Despliegue web mediante WebGPU u ONNX Runtime Web: el decoder INT8 de menor tamano (9,49 MiB en `taehv`) puede cargarse en el navegador para reproducir latentes de video generados en servidor.
- Automatizacion de control de calidad en pipelines de sintesis: la comparacion entre reconstruccion FP32 e INT8 (diferencia de -0,0037 dB en `taehv1_5_super`) permite auditar la perdida introducida por la cuantizacion antes de desplegar.

## Benchmarks y rendimiento

Los unicos datos cuantitativos publicados en la informacion disponible son medidas de calidad y velocidad:

| Metrica | Variante | Valor |
|---|---|---|
| Perdida de calidad INT8 vs FP32 | `taehv1_5_super` (decoder) | -0,0037 dB |
| Reduccion de tamano del decoder | `taehv1_5_super` | 72,48 MiB -> 18,29 MiB (~4x) |
| Reduccion de pico de RAM | `taehv1_5_super` | 220,8 MB -> 100,1 MB (~2x) |
| Encode RTF (CPU, INT8) | `taeltx2_3` | 0,41x (mas rapido que tiempo real) |
| Decode RTF (CPU, INT8) | `taeltx2_3` | 0,64x (mas rapido que tiempo real) |

No se han publicado resultados de benchmarks estandar (PSNR, SSIM, LPIPS, FVD) en la informacion disponible.

## Requisitos de hardware

- VRAM: no disponible de forma explicita; el pico de RAM medido para `taehv1_5_super` es de 100,1 MB en INT8 y 220,8 MB en FP32, lo que sugiere requisitos muy contenidos tambien en memoria de GPU.
- GPU recomendadas: cualquier GPU compatible con los execution providers de ONNX Runtime (CUDA, TensorRT, DirectML, ROCm); no se especifican modelos concretos.
- Consumer GPU: si, el tamano de los grafos (decodificador maximo de 72,48 MiB en FP32) permite ejecucion en GPUs de consumo e incluso en CPU.
- Opciones de despliegue: ONNX Runtime con los providers CPU, DirectML, CUDA, TensorRT, CoreML, ROCm, OpenVINO y WebGPU; integrable desde Rust, C++ y Python.
- Latencia y throughput: para `taeltx2_3` en INT8 sobre CPU, encode a 0,41x RTF y decode a 0,64x RTF; no hay datos para el resto de variantes.

## Comparativa con modelos similares

| Modelo | Tipo | Variantes | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| LatentMux TAEHV ONNX | VAE de video causal, exportado a ONNX | 6 | FP32, INT8 por canal | MIT | ONNX |
| madebyollin/taehv (upstream) | VAE de video causal, pesos originales | 6 (origen) | no disponible | MIT | no disponible |
| VAE de HunyuanVideo | VAE de video del modelo de difusion | 1 | no disponible | no disponible | no disponible |
| VAE de Wan 2.x | VAE de video del modelo de difusion | varias | no disponible | no disponible | no disponible |

La comparativa se limita a los proyectos de origen y destino, ya que no se dispone de datos de rendimiento de los VAE nativos de HunyuanVideo, Wan o LTX en la informacion proporcionada. La ventaja diferencial de esta coleccion es la exposicion del estado causal en ONNX y la cuantizacion INT8 verificada con checksums.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un generador: no produce texto, codigo ni respuestas; cualquier expectativa en ese sentido es un error de uso.
- La calidad de reconstruccion depende de la variante y del factor de compresion; las variantes con `f_s` 16 o 32 y `f_t` 8 descartan mas informacion espacial y temporal.
- La cuantizacion INT8 introduce una perdida medida de -0,0037 dB en `taehv1_5_super`, pero no se documentan perdidas para el resto de variantes.
- Los tensores de estado (`mem_0..8`) deben gestionarse correctamente entre llamadas; un mal manejo del estado rompe la coherencia temporal del streaming.
- No se documentan sesgos, idiomas ni comportamiento etico porque el modelo opera sobre pixeles, no sobre texto.
- La licencia MIT permite uso comercial, pero el aviso de atribucion a `madebyollin/taehv` y las notas de patentes en `NOTICE.txt` deben conservarse.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria publica.
- No se dispone de informacion sobre el dataset de entrenamiento original ni sobre posibles limitaciones de dominio (tipos de contenido, resoluciones o codecs de origen).

## Enlaces

- Hugging Face: https://huggingface.co/ai-inspire/latentmux-taehv-onnx
- Repositorio upstream: https://github.com/madebyollin/taehv
- Manifiesto de artefactos: https://huggingface.co/ai-inspire/latentmux-taehv-onnx/blob/main/manifest.json
- Aviso de atribucion: https://huggingface.co/ai-inspire/latentmux-taehv-onnx/blob/main/NOTICE.txt
- Licencia: https://huggingface.co/ai-inspire/latentmux-taehv-onnx/blob/main/LICENSE
- Script de exportacion citado: `tools/taehv/export_onnx.py` (ruta dentro del repositorio del autor)
