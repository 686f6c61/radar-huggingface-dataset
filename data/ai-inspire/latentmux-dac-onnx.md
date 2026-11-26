# ai-inspire/latentmux-dac-onnx

## Resumen

LatentMux Descript Audio Codec ONNX es un paquete de exportaciones ONNX estandarizadas del codec neuronal de audio DAC (Descript Audio Codec), empaquetado por ai-inspire dentro de su coleccion LatentMux Neural Codec ONNX. El modelo original fue desarrollado por Descript y adaptado a ONNX por la comunidad onnx-community. Resuelve el problema de comprimir y reconstruir audio de alta fidelidad en un espacio latente discreto, lo que permite almacenamiento eficiente, transmision a bajo bitrate y su uso como representacion intermedia en pipelines de generacion o procesamiento de audio.

El bundle incluye tres variantes muestreadas a 44,1 kHz, 24 kHz y 16 kHz en mono, con grafo de codificador y decodificador separados. La variante de 44,1 kHz es la mas completa: incluye precisiones FP32 e INT8, alcanza un bitrate de aproximadamente 7,75 kbps y es la unica recomendada por el autor para produccion, ya que las variantes de 24 kHz y 16 kHz presentan un defecto conocido en el decodificador upstream que devuelve menos muestras de las esperadas en bloques multiframe.

La relevancia actual del paquete radica en su orientacion a inferencia nativa en Rust, C++ y Python mediante ONNX Runtime, con checksums SHA-256 verificados y un contrato de tensores documentado. Esto lo hace adecuado para integrarse en aplicaciones de escritorio, servidores y entornos embebidos sin depender de PyTorch, aunque el rendimiento medido en CPU es modesto y el modelo no incorpora capacidades generativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codec neuronal de audio DAC con Residual Vector Quantization (RVQ), codificador y decodificador convolucionales exportados a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio); hop = 512 muestras por frame |
| Tipos de cuantizacion | FP32 (44k, 24k, 16k) e INT8 (solo 44k) |
| Idiomas soportados | no disponible (procesa audio, no texto; sin restriccion idiomatica declarada) |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder y decoder separados por tasa de muestreo) |

## Arquitectura y entrenamiento

El modelo es un codec neuronal de audio basado en cuantizacion vectorial residual (RVQ) de 10 bits por frame, con un hop de 512 muestras. El codificador transforma la forma de onda PCM de entrada en indices de codebook (`int64`) y el decodificador reconstruye la senal a partir de esos indices. Los grafos ONNX incluidos provienen de los repositorios oficiales de onnx-community para las tasas de 44,1, 24 y 16 kHz, y el modelo base original es `descript/dac_44khz`.

No se dispone de informacion sobre el numero de parametros, el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card se centra en el empaquetado ONNX y no en el proceso de entrenamiento original. La innovacion destacable del paquete es la estandarizacion de I/O con contrato de tensores documentado, checksums SHA-256 por artefacto y soporte de multiples execution providers de ONNX Runtime (CPU, DirectML, CUDA, TensorRT, CoreML, ROCm, OpenVINO, WebGPU).

## Capacidades

- Compresion de audio a un espacio latente discreto con RVQ de 10 bits.
- Reconstruccion de audio PCM a partir de indices de codebook.
- Soporte de tres tasas de muestreo: 44,1 kHz, 24 kHz y 16 kHz en mono.
- Bitrates aproximados de 7,75 kbps (44k), 15,0 kbps (24k) y 3,75 kbps (16k).
- Ejecucion via ONNX Runtime en CPU, DirectML, CUDA, TensorRT, CoreML, ROCm, OpenVINO y WebGPU.
- Uso desde Rust, C++ y Python mediante ONNX Runtime.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No dispone de capacidades multilingues, vision ni audio generativo.

## Casos de uso

- Almacenamiento eficiente de audio: el codec de 44,1 kHz reduce senal mono a unos 8,4 kbps efectivos, lo que permite archivar horas de audio en un espacio muy reducido manteniendo un SNR medido de 15,23 a 15,77 dB.
- Transmision de audio a bajo ancho de banda: la variante de 16 kHz a 3,75 kbps es adecuada para voz en redes restringidas, aunque su decodificador presenta el defecto upstream de longitud de salida y requiere validacion previa.
- Preprocesamiento para pipelines de generacion de audio: los indices de codebook sirven como representacion intermedia discreta para modelos que operan sobre tokens de audio.
- Integracion en aplicaciones de escritorio nativas: los grafos ONNX se ejecutan desde Rust o C++ con ONNX Runtime, sin dependencia de PyTorch ni de Python en produccion.
- Procesamiento en servidor con aceleracion: el soporte de CUDA, TensorRT, ROCm y OpenVINO permite desplegar el codificador y el decodificador en infraestructura GPU para lotes de audio.
- Verificacion de integridad en despliegues: los checksums SHA-256 por artefacto y el `manifest.json` facilitan la validacion de binarios en pipelines de CI/CD y en distribuciones empaquetadas.
- Prototipado rapido en Python: el ejemplo de la model card con `hf_hub_download` y `onnxruntime.InferenceSession` permite inspeccionar el contrato de tensores y validar el flujo encoder-decoder en pocas lineas.

## Benchmarks y rendimiento

Datos medidos con `latentmux bench` sobre ONNX Runtime en CPU con 2 hilos, para la variante de 44,1 kHz:

| Variante | Precision | Tamano `.nmc` (2,0 s) | kbps efectivos | Encode (ms) | Decode (ms) | SNR (dB) | SegSNR (dB) | Pearson | warm_rtf | RAM pico |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| dac 44,1k | FP32 | 2.111 B | 8,408 | 19.358,2 | 33.561,6 | 15,23 | 17,06 | 0,9850 | 11,926 | 347,76 MB |
| dac 44,1k | INT8 | 2.111 B | 8,408 | 43.958,6 | 86.414,3 | 15,77 | 17,76 | 0,9868 | 39,486 | 306,75 MB |

El autor indica que, en CPUs x86_64 sin VNNI, la emulacion QDQ de ONNX Runtime hace que INT8 sea aproximadamente 3,3 veces mas lento que FP32, por lo que recomienda FP32 para uso en CPU. No se han publicado resultados de benchmarks comparativos con otros codecs en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo esta disenado principalmente para inferencia en CPU y los tamanos de artefacto oscilan entre 22,33 MiB (encoder INT8 44k) y 207,06 MiB (decoder FP32 44k).
- RAM pico medida en CPU: 347,76 MB con FP32 y 306,75 MB con INT8 para la variante de 44,1 kHz.
- GPU recomendadas: no especificadas por el autor; el soporte declarado incluye CUDA, TensorRT, ROCm, DirectML, CoreML y WebGPU via ONNX Runtime.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de los grafos (inferior a 210 MiB por artefacto), aunque no se aportan mediciones en GPU.
- Opciones de despliegue: ONNX Runtime (CPU, DirectML, CUDA, TensorRT, CoreML, ROCm, OpenVINO, WebGPU) y la CLI LatentMux (`latentmux -i audio.wav -c:a dac --precision fp32 audio_dac.nmc`).
- Latencia y throughput: en CPU de 2 hilos, encode de 19,4 s y decode de 33,6 s para 2,0 s de audio en FP32 (warm_rtf 11,926); en INT8, 44,0 s y 86,4 s respectivamente (warm_rtf 39,486). No se aportan datos de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tasa | Bitrate | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LatentMux DAC ONNX (este) | no disponible | 44,1 / 24 / 16 kHz mono | 7,75-15,0 kbps | MIT | ONNX en Hugging Face |
| descript/dac_44khz (upstream) | no disponible | 44,1 kHz | ~7,75 kbps | MIT | PyTorch en Hugging Face |
| onnx-community/dac_44khz-ONNX | no disponible | 44,1 kHz | ~7,75 kbps | no disponible en la informacion | ONNX en Hugging Face |
| EnCodec (referencia de categoria) | no disponible en la informacion | multiple | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

La comparativa se limita a las variantes del propio DAC y sus exportaciones upstream, ya que la informacion proporcionada no incluye datos de otros codecs neuronales como EnCodec, SoundStream o SNAC. No se dispone de cifras de rendimiento comparativas entre ellos en este contexto.

## Limitaciones y advertencias

- Defecto conocido en las variantes de 24 kHz y 16 kHz: el decodificador upstream devuelve menos muestras de las esperadas en bloques multiframe (por ejemplo, 15.992 muestras frente a 25.600 esperadas), por lo que el autor recomienda la variante de 44,1 kHz para produccion.
- Las variantes de 24 kHz y 16 kHz solo incluyen grafos FP32; no hay INT8 para ellas en esta release.
- En CPUs x86_64 sin VNNI, la variante INT8 de 44 kHz es aproximadamente 3,3 veces mas lenta que FP32 por la emulacion QDQ de ONNX Runtime.
- El rendimiento en CPU es limitado: un warm_rtf de 11,926 en FP32 implica que procesar audio en tiempo real requiere aceleracion por hardware o lotes no interactivos.
- El modelo procesa audio mono; no se documenta soporte estereo ni multicanal.
- No es un modelo generativo ni de lenguaje: no soporta tool calling, agentes, razonamiento ni capacidades multilingues.
- Riesgo de artefactos de reconstruccion medido por SNR de 15,23-15,77 dB y Pearson de 0,985-0,987; la fidelidad es alta pero no lossless.
- La licencia MIT permite uso comercial, pero deben revisarse `LICENSE` y `NOTICE.txt` por avisos de copyright y patentes del proyecto upstream Descript.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-inspire/latentmux-dac-onnx
- Modelo base original: https://huggingface.co/descript/dac_44khz
- Exportaciones ONNX upstream: https://huggingface.co/onnx-community/dac_44khz-ONNX
- Exportaciones ONNX upstream: https://huggingface.co/onnx-community/dac_24khz-ONNX
- Exportaciones ONNX upstream: https://huggingface.co/onnx-community/dac_16khz-ONNX
- Repositorio del codec original: https://github.com/descriptinc/descript-audio-codec
- Manifiesto de artefactos: https://huggingface.co/ai-inspire/latentmux-dac-onnx/blob/main/manifest.json
- Licencia: https://huggingface.co/ai-inspire/latentmux-dac-onnx/blob/main/LICENSE
- Avisos de atribucion: https://huggingface.co/ai-inspire/latentmux-dac-onnx/blob/main/NOTICE.txt
