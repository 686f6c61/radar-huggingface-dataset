# ai-inspire/latentmux-mlvc-onnx

## Resumen

LatentMux MLVC-S ONNX es un códec neuronal de vídeo compacto exportado a ONNX a partir del modelo MLVC-S (Mobile Learned Video Compression, variante PSNR v1) desarrollado por Microsoft Research dentro del repositorio DCVC. El modelo original, con solo 5,4 millones de parámetros, se ha exportado a formato ONNX con formas dinámicas y se distribuye en dos precisiones (FP32 e INT8 por canal), junto con tablas de probabilidad (`pmf_tables.bin`) necesarias para la codificación entrópica mediante el codificador rANS `msrtc_rans`. El paquete lo publica el usuario ai-inspire bajo el paraguas de la colección "LatentMux Neural Codec ONNX Collection".

El problema que resuelve es la compresión de vídeo aprendida con un consumo de recursos muy bajo: en la demo medida alcanza 11,38–11,70 kbps (ratios superiores a 150x) con una calidad de 32,03 dB de PSNR YUV en un clip de prueba de 128x96 a 12 fps y 2 segundos de duración. La relevancia actual reside en que ofrece un códec neuronal listo para producción en entornos Rust/C++/Python mediante ONNX Runtime, con checksums SHA-256 verificados y soporte para múltiples execution providers (CPU, CUDA, TensorRT, DirectML, CoreML, ROCm, OpenVINO, WebGPU).

La arquitectura subyacente es un codificador/decodificador convolucional con codificación predictiva condicional y latentes espaciales en dos slices, entropía modelada con tablas PMF (MLTP v1). El modelo no es un LLM ni un modelo multimodal de lenguaje: es un componente de compresión de vídeo, por lo que las secciones de esta ficha se adaptan a esa naturaleza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Códec neuronal de vídeo convolucional (encoder/decoder) con codificación predictiva condicional y entropía rANS; checkpoint `dmc61sbr_mini_reglu` (MLVC-S PSNR v1) |
| Parametros totales | 5,4 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de compresión de vídeo; ventana temporal gestionada por GOP y `ref_feature`) |
| Tipos de cuantizacion | FP32 y INT8 por canal (`w8_absmax`, con `DequantizeLinear`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder_fp32.onnx`, `encoder_int8.onnx`, `decoder_fp32.onnx`, `decoder_int8.onnx`) + `pmf_tables.bin` (MLTP v1) |
| Dominio | Vídeo YUV420p, dimensiones espaciales variables |
| Entrada encoder | `x [1, 3, pad_h, pad_w]`, `ref_feature`, `q_index_shifted [1]` |
| Salida encoder | `feature`, `z_raw`, `y_raw_0`, `y_raw_1` |
| Entrada decoder | `z_raw`, `y_raw_0`, `y_raw_1`, `ref_feature`, `q_index_shifted [1]` |
| Salida decoder | `x_hat`, `feature` |
| Control de bitrate | `-b:v q0..q63` o objetivo de bitrate |
| Execution providers | CPU, DirectML, CUDA, TensorRT, CoreML, ROCm, OpenVINO, WebGPU |
| Tamano total del repo | 40,50 MiB (5 ficheros binarios) |

## Arquitectura y entrenamiento

El modelo es un códec neuronal de vídeo de la familia DCVC/MLVC, concretamente la variante MLVC-S (Mobile Learned Video Compression) en su configuración PSNR v1. La arquitectura se compone de un encoder convolucional que transforma el fotograma actual (junto con una `ref_feature` temporal propagada entre P-frames) en latentes `y_raw_0`, `y_raw_1` (dos slices espaciales) y `z_raw` (latente hiperprior), y un decoder que reconstruye `x_hat` a partir de esos latentes. La codificación entrópica se realiza con un codificador rANS (`msrtc_rans`) que consume las tablas de probabilidad `pmf_tables.bin` en formato MLTP v1.

La cuantización INT8 es por canal sobre pesos convolucionales 4D (`w8_absmax`), reduciendo el encoder de 15,72 MB a 4,18 MB y el decoder de 16,16 MB a 4,30 MB, con una pérdida de solo −0,24 dB de PSNR YUV y una reducción del pico de RAM de 75,05 MB a 52,02 MB. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO, ya que no es un modelo de lenguaje y la model card no detalla el proceso de entrenamiento más allá de la atribución a Microsoft Research.

## Capacidades

- Compresión de vídeo YUV420p con dimensiones espaciales variables (formas dinámicas en ONNX).
- Codificación y decodificación de vídeo con control de calidad/bitrate mediante índice de cuantización (`q0..q63`) u objetivo de bitrate.
- Codificación predictiva condicional con propagación temporal de `feature`/`ref_feature` entre P-frames dentro de un GOP.
- Codificación entrópica rANS compatible con tablas PMF MLTP v1 (`pmf_tables.bin`).
- Ejecución en múltiples backends mediante ONNX Runtime (CPU, CUDA, TensorRT, DirectML, CoreML, ROCm, OpenVINO, WebGPU).
- Variantes FP32 e INT8 por canal con checksums SHA-256 verificados para integridad.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Compresión de vídeo en dispositivos de borde: el modelo de 5,4 M de parámetros y su variante INT8 (pico de RAM de 52,02 MB) permiten codificar vídeo en entornos con memoria limitada, como cámaras IP o dispositivos IoT con CPU, usando ONNX Runtime CPU o CoreML.
- Streaming de bajo bitrate: con ratios superiores a 150x y bitrates de ~11 kbps en la demo, es adecuado para transmisión de vídeo en redes de muy bajo ancho de banda (sensores remotos, telemetría visual).
- Integración en pipelines nativos Rust/C++: el formato `.nmc` y el codificador `msrtc_rans` permiten incrustar el códec en aplicaciones nativas sin dependencias de Python, usando los artefactos ONNX y `pmf_tables.bin`.
- Aceleración por GPU en servidores: con execution providers CUDA, TensorRT o ROCm, se puede desplegar el códec en infraestructura de servidor para transcodificación o archivo con consumo energético reducido frente a códecs neuronales de mayor tamaño.
- Archivado y almacenamiento de vídeo de vigilancia: la combinación de bajo bitrate y calidad PSNR de ~32 dB en clips pequeños lo hace apto para almacenar grabaciones de baja resolución con requisitos de espacio estrictos.
- Prototipado e investigación en compresión neuronal: al ser un export ONNX estandarizado con contratos de tensores documentados y checksums, sirve como base reproducible para experimentar con cuantización, entropía rANS y comparación con códecs clásicos (H.264/H.265) en entornos de investigación.

## Benchmarks y rendimiento

Resultados medidos con `latentmux bench` sobre ONNX Runtime CPU con 2 hilos, clip `demo_clip.y4m` (2,0 s a 128x96x12):

| Precision | `.nmc` | kbps ef. | Ratio | Encode (ms / RTF) | Decode (ms / RTF) | PSNR YUV | SSIM luma | RAM pico | `warm_rtf` sintético |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FP32 | 2.845 B | 11,38 | 155,6x | 4189,7 (2,09x) | 3415,3 (1,71x) | 32,03 dB | 0,8709 | 75,05 MB | 2,82x (382,8 ms init) |
| INT8 | 2.924 B | 11,70 | 151,4x | 3331,5 (1,67x) | 3143,8 (1,57x) | 31,79 dB | 0,8615 | 52,02 MB | 3,25x (326,0 ms init) |

No se han publicado resultados de benchmarks frente a otros códecs (H.264, H.265, otros códecs neuronales) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el pico de RAM en CPU es de 75,05 MB (FP32) y 52,02 MB (INT8), por lo que el requisito de memoria es muy bajo.
- GPU recomendadas: no se especifican; el modelo soporta cualquier GPU compatible con los execution providers de ONNX Runtime (CUDA, TensorRT, DirectML, ROCm, CoreML, WebGPU).
- Cabe en GPU de consumo: sí, con amplio margen, dado el reducido tamaño del modelo (40,50 MiB en total) y el bajo consumo de memoria.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, DirectML, CoreML, ROCm, OpenVINO, WebGPU) y la CLI `latentmux`.
- Latencia y throughput: en CPU de 2 hilos, encode de 3331,5 ms (INT8) y decode de 3143,8 ms (INT8) para el clip de prueba; RTF de 1,67x y 1,57x respectivamente. No hay datos de latencia en GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros códecs neuronales (por ejemplo, otras variantes de DCVC, o códecs clásicos H.264/H.265) en la información proporcionada. La model card solo incluye la atribución al modelo upstream MLVC-S de Microsoft Research y los resultados propios de la demo. Por tanto, la comparativa cuantitativa se indica como no disponible.

## Limitaciones y advertencias

- Requiere propagación temporal de `feature`/`ref_feature` entre P-frames dentro de un GOP; no es un códec intra-frame independiente por fotograma.
- Usa pesos ajustados a PSNR (`mlvc-s-psnr-v1`); no está optimizado para métricas perceptuales como LPIPS o SSIM.
- `pmf_tables.bin` es obligatorio junto con los ficheros `.onnx`; sin él no funciona la codificación entrópica.
- Los resultados de calidad y bitrate reportados corresponden a un único clip de demo (128x96, 12 fps, 2 s); no hay evidencia publicada de comportamiento en otros contenidos o resoluciones.
- No se detallan sesgos ni riesgos de alucinación porque no es un modelo generativo de lenguaje; los riesgos se limitan a artefactos de compresión y degradación de calidad.
- Licencia MIT, lo que permite uso comercial, pero se debe revisar `NOTICE.txt` por avisos de patentes del upstream de Microsoft Research.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- El tamaño del repo figura como 0.0 GB en los metadatos de Hugging Face, aunque la model card declara 40,50 MiB en ficheros binarios.

## Enlaces

- Hugging Face: https://huggingface.co/ai-inspire/latentmux-mlvc-onnx
- Repositorio upstream (Microsoft DCVC/MLVC): https://github.com/microsoft/DCVC
- Ficheros del repo: `encoder_fp32.onnx`, `encoder_int8.onnx`, `decoder_fp32.onnx`, `decoder_int8.onnx`, `pmf_tables.bin`, `manifest.json`, `LICENSE`, `NOTICE.txt`
- No se han encontrado en la información disponible otros enlaces a papers, blogs o demos adicionales.
