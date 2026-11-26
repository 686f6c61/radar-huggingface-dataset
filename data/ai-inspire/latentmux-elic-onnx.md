# ai-inspire/latentmux-elic-onnx

## Resumen

LatentMux ELIC ONNX es una exportación a formato ONNX del códec de compresión de imagen neuronal ELIC (Efficient Learned Image Compression, He et al., CVPR 2022), realizada por el usuario ai-inspire dentro de su colección "LatentMux Neural Codec ONNX Collection". No es un modelo generativo ni un LLM, sino un códec de compresión de imagen extremo a extremo que transforma una imagen RGB en una representación latente comprimida y la reconstruye, operando a regímenes de muy bajo bitrate (en torno a 0,21 bpp en la variante incluida).

La relevancia del artefacto está en su empaquetado: unifica los 10 pasos autorregresivos del mecanismo SCCTX (Space-Channel Context) en un único grafo ONNX con ramificación mediante el operador `If`, evitando la duplicación de pesos que requeriría exportar cada paso por separado. Además ofrece dos precisiones (FP32 y pesos INT8 por canal) con checksums SHA-256 verificados, pensadas para inferencia desde Rust, C++ o Python vía ONNX Runtime.

El modelo corresponde a la configuración `elic` versión `0.008` con N=192 y M=320, optimizada para MSE con lambda=0,008. El repositorio ocupa 0,2 GB e incluye nueve ficheros binarios (cuatro módulos en dos precisiones más las tablas CDF compartidas). La licencia es de solo investigación, dado que el repositorio upstream no incluía un fichero LICENSE independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Códec de compresión de imagen neuronal ELIC (encoder, hyperprior, contexto SCCTX autorregresivo de 10 pasos, decoder) exportado a ONNX |
| Parametros totales | no disponible (configuración N=192, M=320; tamaños de fichero entre 3,79 MiB y 48,65 MiB por módulo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada `[1, 3, pad_h, pad_w]` con padding a múltiplo de 64) |
| Tipos de cuantizacion | FP32 y pesos INT8 por canal (con `DequantizeLinear`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | research-only-no-upstream-license (base CompressAI BSD-3-Clause-Clear; sin LICENSE upstream) |
| Formato de pesos | ONNX (FP32 e INT8) más `cdf_tables.bin` en formato HCDB v1 |

## Arquitectura y entrenamiento

La arquitectura subyacente es ELIC, un autoencoder con hiperprior y contexto espacio-canal (SCCTX) que modela la distribución de las variables latentes de forma autorregresiva en 10 pasos. El pipeline se divide en cuatro grafos ONNX: `encoder` (imagen a latentes `y` y `z`), `hyper_decoder` (a partir de `z_hat` produce las características del hiperprior), `context` (dispatcher unificado de los 10 pasos SCCTX que devuelve los parámetros de entropía) y `decoder` (latente decodificado `y_hat` a imagen reconstruida `x_hat`). La codificación entrópica se realiza con `Rans64` en Rust puro sobre las tablas `cdf_tables.bin`.

La innovación técnica del export es el uso del operador `If` de ONNX para unificar los 10 pasos autorregresivos en un solo grafo `context_*.onnx`, lo que evita duplicar pesos diez veces. La cuantización INT8 por canal aplica sobre los pesos convolucionales 4D de encoder, hyper_decoder, context y decoder, reduciendo el pico de RAM de 484,9 MB a 176,4 MB (factor 2,75) y acelerando codificación/decodificación aproximadamente 2,5 veces con una penalización de 0,20 dB. No se dispone de información sobre el dataset de entrenamiento original, número de tokens ni uso de RLHF/DPO, ya que se trata de una exportación de un checkpoint upstream y la model card no detalla el proceso de entrenamiento.

## Capacidades

- Compresión de imagen RGB con dimensiones espaciales variables (padding automático a múltiplo de 64).
- Codificación a bitrate ultra bajo: 0,213 bpp en la variante INT8 y 0,215 bpp en FP32 sobre la imagen de demostración.
- Reconstrucción de imagen a partir del bitstream comprimido (formato `.nmc`).
- Inferencia con precisión seleccionable (FP32 o INT8) con checksums SHA-256 verificados por fichero.
- Ejecución multiplataforma vía ONNX Runtime con soporte de CPU, DirectML, CUDA, TensorRT, CoreML, ROCm, OpenVINO y WebGPU.
- Integración en pipelines Rust/C++/Python mediante el CLI `latentmux` o directamente con ONNX Runtime.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un códec de imagen, no un modelo de lenguaje.

## Casos de uso

- Compresión de imágenes para almacenamiento de archivo: a 0,213 bpp una imagen de 128x128 ocupa 436 bytes, lo que permite archivar grandes volúmenes fotográficos con un ahorro de espacio muy superior al de JPEG o WebP en regímenes de bitrate extremadamente bajos.
- Transmisión en anchos de banda restringidos: el códec puede integrarse en clientes Rust/C++ mediante ONNX Runtime para enviar miniaturas o previews de imágenes sobre enlaces de baja capacidad, donde el bitrate es el factor limitante.
- Evaluación de códecs neuronales en investigación: sirve como referencia reproducible (checksums incluidos) para comparar ELIC frente a hiperprior o TAESD en experimentos académicos de compresión aprendida.
- Despliegue en dispositivos de borde: la variante INT8 con 176 MB de pico de RAM y ejecución vía CPU, CoreML o WebGPU permite probar el códec en hardware sin GPU dedicada.
- Prototipado de pipelines de compresión en Python: la descarga directa desde Hugging Face y la sesión de ONNX Runtime facilitan integrar el códec en scripts de experimentación sin compilar dependencias nativas.
- Validación de integridad de artefactos: los SHA-256 del manifiesto permiten verificar la cadena de suministro en entornos de CI antes de desplegar el códec en producción.
- Benchmarking de latencia en CPU: con encode de 3.195 ms y decode de 2.531 ms en INT8 (2 hilos), sirve para dimensionar requisitos de servidor en aplicaciones de compresión por lotes.

## Benchmarks y rendimiento

Resultados medidos con `latentmux bench` sobre ONNX Runtime CPU con 2 hilos, imagen de 128x128:

| Precision | Tamano `.nmc` | bpp | Encode (ms) | Decode (ms) | PSNR (dB) | SSIM | RMSE | Peak RAM | Init sintesis (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FP32 | 440 B | 0,215 | 8.259,8 | 6.105,0 | 27,64 | 0,8068 | 10,59 | 484,92 MB | 5.166,2 |
| INT8 | 436 B | 0,213 | 3.195,4 | 2.530,9 | 27,44 | 0,7975 | 10,83 | 176,36 MB | 1.373,2 |

La variante INT8 reduce el tiempo de codificación un 61 % y el de decodificación un 59 % respecto a FP32, con una pérdida de 0,20 dB de PSNR y 0,0093 de SSIM. No se han publicado comparaciones con otros códecs en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo se ejecuta en CPU; el pico de RAM medido es de 484,92 MB en FP32 y 176,36 MB en INT8. No se dispone de cifras de VRAM para ejecución en GPU.
- GPU recomendadas: no disponible; la model card solo enumera los execution providers compatibles (CUDA, TensorRT, DirectML, ROCm, CoreML, WebGPU, OpenVINO) sin recomendar modelos concretos.
- Cabe en cualquier GPU consumer con más de 1 GB de memoria, dado el reducido tamaño de los grafos (máximo 48,65 MiB en FP32), aunque no hay mediciones publicadas en GPU.
- Opciones de despliegue: ONNX Runtime (Python, C++, Rust), CLI `latentmux`, y los execution providers citados (CPU, DirectML, CUDA, TensorRT, CoreML, ROCm, OpenVINO, WebGPU).
- Latencia y throughput: en CPU con 2 hilos, encode de 3.195 ms y decode de 2.531 ms en INT8 para 128x128; no se dispone de throughput en GPU ni de cifras para resoluciones mayores.

## Comparativa con modelos similares

| Modelo | Tipo | Bitrate tipico | Latencia CPU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LatentMux ELIC ONNX (este) | Códec neuronal ELIC, SCCTX 10 pasos | 0,213 bpp | Encode 3.195 ms / decode 2.531 ms (INT8, 2 hilos) | Solo investigación | ONNX en Hugging Face |
| Hiperprior (familia CompressAI) | Códec neuronal con hyperprior | no disponible | Menor que ELIC según la model card | BSD-3-Clause-Clear (base CompressAI) | Disponible en CompressAI |
| TAESD | Autoencoder de latentes para SD | no aplica (no es códec de compresión) | Menor que ELIC según la model card | no disponible | Disponible en repositorios de Stable Diffusion |

La model card indica que la inferencia secuencial de 10 pasos SCCTX de ELIC produce mayor latencia en CPU que hiperprior o TAESD, a cambio del menor bpp. No se han publicado cifras concretas de los modelos comparados en la información disponible.

## Limitaciones y advertencias

- Licencia restrictiva: el repositorio upstream no incluía fichero LICENSE independiente, por lo que debe tratarse como solo investigación hasta aclarar los términos comerciales.
- Latencia elevada en CPU: la inferencia autorregresiva de 10 pasos SCCTX implica tiempos de segundos por imagen pequeña, inadecuados para aplicaciones en tiempo real sin GPU.
- Sin datos de sesgo ni de alucinación: al no ser un modelo generativo ni de lenguaje, no aplican sesgos lingüísticos, pero tampoco hay evaluación de fidelidad perceptual más allá de PSNR/SSIM en una única imagen de demostración.
- Rendimiento medido en una sola imagen de 128x128: no hay evidencia publicada sobre calidad o latencia en resoluciones altas ni en distintos tipos de contenido.
- Dependencia de las tablas CDF: el bitstream requiere `cdf_tables.bin` en formato HCDB v1; cualquier cambio en las tablas invalida la compatibilidad del flujo comprimido.
- Padding obligatorio a múltiplo de 64: imágenes de dimensiones arbitrarias deben rellenarse, lo que puede introducir artefactos en los bordes si no se recorta correctamente tras la decodificación.
- Sin soporte de vídeo ni audio: el ámbito es exclusivamente imagen RGB estática.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ai-inspire/latentmux-elic-onnx
- Repositorio upstream ELIC: https://github.com/VincentChandelier/ELiC-ReImplemetation
- Paper ELIC (He et al., CVPR 2022): no disponible en la información proporcionada
- CompressAI (base BSD-3-Clause-Clear): no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada
