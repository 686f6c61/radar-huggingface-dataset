# ai-inspire/latentmux-tcm-onnx

## Resumen

LatentMux LIC-TCM ONNX es una exportación a ONNX del códec de compresión de imagen aprendida LIC-TCM, presentado por Liu, Sun y Katto en CVPR 2023 (Highlight). El modelo original combina bloques Transformer-CNN para comprimir imágenes RGB de dimensiones variables, y esta versión lo empaqueta en cuatro subgrafos ONNX (encoder, hyper_decoder, context y decoder) en precisión FP32 e INT8, junto con tablas CDF compartidas para la codificación entrópica rANS. El autor de la exportación es ai-inspire, que lo distribuye como parte de su colección "LatentMux Neural Codec ONNX Collection".

El problema que resuelve es la compresión de imágenes con calidad medida en PSNR/SSIM, ofreciendo una alternativa a códecs tradicionales como JPEG o WebP. La variante incluida (`tcm`, Small N=64, M=320, lambda=0.0067) alcanza 33,26 dB de PSNR en FP32 y 32,79 dB en INT8 a 0,37 bpp sobre imágenes de 128x128, con un bitstream propietario `.nmc` que combina atención por ventanas (SWAtten) de 10 pasos y 5 slices con un decodificador entrópico `Rans64` escrito en Rust.

Su relevancia práctica es acotada: no es un modelo generativo ni un LLM, sino un componente de infraestructura para pipelines de compresión de imagen con requisitos de streaming y despliegue multiplataforma vía ONNX Runtime (CPU, CUDA, DirectML, CoreML, WebGPU, etc.). El repositorio pesa 0,2 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer-CNN híbrida (LIC-TCM) con atención por ventanas SWAtten de 10 pasos y 5 slices, channel conditioning y contexto LRP |
| Parámetros totales | No disponible (variante Small N=64, M=320; el tamaño de los pesos FP32 suma 175,17 MiB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de compresión de imagen, no de texto) |
| Tipos de cuantización | FP32 y INT8 per-channel (`w8_absmax`, con `DequantizeLinear`) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (FP32 e INT8) más `cdf_tables.bin` (formato HCDB v1) |
| Dominio | Imagen RGB, dimensiones espaciales variables (padding a múltiplo de 64) |
| Pipeline | image-to-image |
| Tamaño del repositorio | 0,2 GB (236,11 MiB en 9 ficheros binarios) |
| Entropy coding | rANS (`Rans64`, implementación pura en Rust) |

## Arquitectura y entrenamiento

LIC-TCM es una arquitectura híbrida Transformer-CNN para compresión de imagen aprendida. Combina bloques convolucionales con bloques de atención por ventanas (Swin-like) para capturar dependencias locales y de largo alcance. El modelo sigue el esquema de compresión neurálgica con hiperprior: el encoder produce una representación latente `y` y una latente hiperprior `z`; el hyper_decoder estima los parámetros de escala y media (`h_scale_s`, `h_mean_s`) que modelan la distribución de `y`; el subgrafo `context` implementa un dispatcher unificado de contexto con 10 pasos autorregresivos y 5 slices sobre atención por ventanas más contexto LRP; y el decoder reconstruye la imagen a partir de `y_hat`. La codificación entrópica se realiza con tablas CDF compartidas (`cdf_tables.bin`, 116,7 KiB) y un codificador rANS (`Rans64`).

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF/DPO (no procede en este dominio). El checkpoint exportado corresponde a la variante Small con N=64, M=320 y lambda=0,0067 (objetivo MSE). La innovación destacable de esta exportación es la división en subgrafos ONNX independientes con un `If` unificado para el despacho de contexto, lo que permite ejecutar el códec paso a paso en ONNX Runtime y habilita despliegue en múltiples execution providers. La cuantización INT8 per-channel reduce el pico de RAM de 1164,65 MB a 455,58 MB (factor 2,56x) y el footprint del subconjunto INT8 de 247,6 MB a 63,8 MB (aproximadamente 3x), con una pérdida de 0,47 dB de PSNR.

## Capacidades

- Compresión de imágenes RGB de dimensiones variables (con padding a múltiplo de 64) a un bitstream propietario `.nmc`.
- Descompresión y reconstrucción de imagen a partir del bitstream, con calidad medida en PSNR, SSIM y RMSE.
- Ejecución en FP32 e INT8 con checksums SHA-256 verificados por fichero.
- Despliegue mediante ONNX Runtime en CPU, DirectML, CUDA, TensorRT, CoreML, ROCm, OpenVINO y WebGPU.
- Integración con la CLI `latentmux` para codificar y decodificar.
- Capacidad de streaming (el autor describe la colección como "streaming-ready").
- No soporta tool calling, agentes, razonamiento multi-step, visión general, audio ni capacidades multilingües: es un códec de imagen especializado.

## Casos de uso

- Compresión de imágenes en pipelines de servidor: el códec puede integrarse como etapa de codificación en un servicio de almacenamiento o CDN, usando el subgrafo `encoder_int8.onnx` para reducir el tamaño de las imágenes antes de persistirlas, con la ventaja de un formato de pesos ONNX portable y checksums verificables.
- Archivado de imágenes con calidad controlada: dado que la variante incluida opera a lambda=0,0067 y ~0,37 bpp, es adecuada para escenarios donde se prioriza la fidelidad de reconstrucción (33,26 dB PSNR en FP32) sobre la latencia.
- Aplicaciones de escritorio multiplataforma: al exportarse a ONNX con soporte de CoreML, DirectML y WebGPU, puede embeberse en aplicaciones nativas de macOS, Windows o web sin depender de un runtime propietario.
- Investigación en compresión neurálgica: sirve como referencia reproducible del modelo LIC-TCM de CVPR 2023, con artefactos separados por subgrafo que facilitan el análisis de cada etapa (encoder, hyperprior, contexto, decoder).
- Evaluación comparativa de códecs: permite medir PSNR/SSIM/bpp frente a JPEG, WebP o códecs aprendidos alternativos (hyperprior, taesd) en el mismo hardware, usando la CLI `latentmux`.
- Procesamiento por lotes offline: para trabajos donde la latencia no es crítica (por ejemplo, recompresión de un archivo fotográfico), el coste de ~8,5 s por imagen de 128x128 en INT8 con 2 hilos es asumible.
- Integración en herramientas de Rust/C++: el bitstream y el codificador rANS están implementados en Rust, lo que facilita su uso en backends nativos sin dependencias de Python.

## Benchmarks y rendimiento

Resultados medidos con `latentmux bench` sobre ONNX Runtime CPU con 2 hilos, imagen de 128x128:

| Precisión | Tamaño `.nmc` | bpp | Encode (ms) | Decode (ms) | PSNR (dB) | SSIM | RMSE | Pico de RAM | `init_ms` sintético |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FP32 | 764 B | 0,373 | 14788,8 | 14563,6 | 33,26 | 0,9333 | 5,54 | 1164,65 MB | 13266,1 |
| INT8 | 756 B | 0,369 | 8591,4 | 8240,2 | 32,79 | 0,9235 | 5,85 | 455,58 MB | 6825,8 |

No se han publicado en la información disponible resultados comparativos con otros códecs (JPEG, WebP, BPG) ni con otros modelos de compresión aprendida. Los únicos datos de rendimiento son los de la tabla anterior, medidos por el autor de la exportación.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: pico de 1164,65 MB en FP32 y 455,58 MB en INT8 (medido en CPU con 2 hilos).
- Footprint en disco: 236,11 MiB para los 9 ficheros binarios; el subconjunto INT8 ocupa 63,8 MB y el FP32 247,6 MB.
- GPU recomendadas: no se especifican modelos concretos. El modelo puede ejecutarse en cualquier GPU compatible con los execution providers de ONNX Runtime (CUDA, TensorRT, DirectML, ROCm, CoreML, WebGPU).
- Cabe en GPU de consumo: sí, por el reducido tamaño de los grafos (el mayor es `context_fp32.onnx`, de 107,51 MiB). No se dispone de mediciones en GPU.
- Opciones de despliegue: ONNX Runtime (todos los execution providers listados), CLI `latentmux`, e integración directa en Python, Rust o C++.
- Latencia y throughput: encode de 14,79 s y decode de 14,56 s en FP32; encode de 8,59 s y decode de 8,24 s en INT8, ambos para 128x128 con 2 hilos de CPU. El autor advierte que el coste computacional es alto por la atención por ventanas y las 10 llamadas autorregresivas de contexto, y recomienda `hyperprior` o `taesd*` cuando la latencia sea crítica.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A nivel cualitativo:

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LatentMux LIC-TCM ONNX (este) | Códec de imagen aprendido, Transformer-CNN | No disponible (Small N=64, M=320) | No aplica | MIT | ONNX en Hugging Face |
| LIC-TCM original (jmliu206) | Códec de imagen aprendido, Transformer-CNN | No disponible | No aplica | MIT | Repositorio GitHub |
| `hyperprior` (mencionado por el autor) | Códec de imagen aprendido con hiperprior | No disponible | No aplica | No disponible | No disponible |
| `taesd*` (mencionado por el autor) | Autoencoder de imagen | No disponible | No aplica | No disponible | No disponible |

El autor solo menciona `hyperprior` y `taesd*` como alternativas de menor latencia, sin aportar cifras comparativas.

## Limitaciones y advertencias

- Coste computacional elevado: ~8,5 s por imagen de 128x128 en INT8 con 2 hilos de CPU, debido a la atención por ventanas y a las 10 llamadas autorregresivas de contexto. No apto para aplicaciones de baja latencia.
- Solo se incluye una variante (`tcm`, Small N=64, M=320, lambda=0,0067); no hay variantes de mayor calidad o distinto régimen de bits en este repositorio.
- Formato de bitstream propietario (`.nmc`) con tablas CDF propias (`HCDB` v1); no es compatible con JPEG, WebP ni otros códecs estándar.
- La cuantización INT8 introduce una pérdida de 0,47 dB de PSNR y reduce SSIM de 0,9333 a 0,9235; debe evaluarse por caso de uso.
- No se dispone de información sobre sesgos, alucinación o limitaciones idiomáticas: el modelo no genera contenido semántico, por lo que estos riesgos no aplican en el sentido habitual, pero sí puede producir artefactos de reconstrucción en imágenes fuera de la distribución de entrenamiento.
- La información sobre el dataset de entrenamiento, el número de tokens y el proceso de optimización no está disponible en la model card.
- El repositorio no registra descargas ni likes, lo que reduce la validación comunitaria disponible.
- Aunque la licencia es MIT, deben revisarse `NOTICE.txt` y `LICENSE` por las notas de copyright y patentes del proyecto upstream.
- El padding a múltiplo de 64 es obligatorio para la entrada del encoder.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-inspire/latentmux-tcm-onnx
- Repositorio upstream LIC_TCM: https://github.com/jmliu206/LIC_TCM
- Paper (CVPR 2023): Liu, J., Sun, H., Katto, J. "Learned Image Compression with Mixed Transformer-CNN Architectures", CVPR 2023.
- Ficheros del repositorio: `manifest.json`, `NOTICE.txt`, `LICENSE`, `cdf_tables.bin`, `encoder_{fp32,int8}.onnx`, `hyper_decoder_{fp32,int8}.onnx`, `context_{fp32,int8}.onnx`, `decoder_{fp32,int8}.onnx`.
