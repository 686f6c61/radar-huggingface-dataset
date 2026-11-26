# ai-inspire/latentmux-encodec-onnx

## Resumen
LatentMux Meta EnCodec ONNX es una exportación a ONNX del códec neuronal de audio EnCodec de Meta, publicada por ai-inspire dentro de su colección LatentMux Neural Codec ONNX. No es un modelo generativo de lenguaje, sino un códec de compresión neuronal de audio: un codificador convolucional SEANet más un cuantizador vectorial residual (RVQ) que produce códigos discretos, y un decodificador que reconstruye la forma de onda. El paquete incluye dos variantes, `encodec` (24 kHz mono) y `encodec-48k` (48 kHz estéreo), cada una en precisión FP32 e INT8 calibrada.

El valor del artefacto es de ingeniería: ofrece grafos ONNX con formas dinámicas, contrato de tensores documentado, checksums SHA-256 y un total de 232,86 MiB para los ocho ficheros binarios. Esto permite ejecutar el códec en ONNX Runtime sobre CPU, CUDA, TensorRT, DirectML, CoreML, ROCm, OpenVINO o WebGPU sin depender de PyTorch, lo que facilita su integración en pipelines en Rust, C++ o Python.

La relevancia actual está en los códecs neuronales como componente de sistemas de audio generativo (tokens discretos para modelos de audio, compresión de baja tasa y streaming). La licencia MIT y la atribución explícita a `facebookresearch/encodec` lo hacen apto para uso comercial, aunque las métricas publicadas corresponden a una única configuración de banco de pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SEANet convolucional (encoder/decoder) + Residual Vector Quantization (RVQ); exportación ONNX de EnCodec |
| Parametros totales | no disponible (el repositorio publica tamanos de fichero, no recuento de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; audio de entrada con formas dinamicas (`[1, C, N_samples]`, hop de 320 muestras) |
| Tipos de cuantizacion | FP32 y QDQ INT8 estatico calibrado (activaciones QUInt8, pesos QInt8 por canal) |
| Idiomas soportados | no disponible (procesa audio, no texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx`), con `manifest.json`, `NOTICE.txt` y `LICENSE` |

## Arquitectura y entrenamiento
El modelo subyacente es EnCodec de Meta (arXiv:2210.13438), un autoencoder convolucional con encoder y decoder SEANet y un cuantizador vectorial residual en el espacio latente. El encoder transforma la forma de onda en `codes [1, 32, T_frames]` (int64) y un `scale [1]` (float32); el decoder recibe `codes`, `n_q [1]` y `scale [1]` y reconstruye `audio [1, C, N_samples]`. El número de cuantizadores `n_q` controla la tasa: de 2 a 32 en la variante de 24 kHz (1,5 a 24 kbps) y de 2 a 16 en la de 48 kHz (3 a 24 kbps).

No se documenta en la información disponible el proceso de entrenamiento original (número de tokens, composición del dataset, uso de RLHF/DPO), que corresponde al trabajo de Meta, no a esta exportación. La innovación técnica de esta ficha es la cuantización: se aplica QDQ estático calibrado con `onnxruntime.quantization` sobre marcos de audio de varios dominios, excluyendo capas de frontera sensibles (`layers.{0,1,12,15}` en el encoder y `layers.{0,10,13,15}` en el decoder) para preservar el rango dinámico de la forma de onda. Los grafos son de forma dinámica y el streaming por bloques usa recorte de solapamiento mediante ventanas de contexto del adaptador en Rust.

## Capacidades
- Compresión y descompresión neuronal de audio: codifica PCM a códigos discretos RVQ y reconstruye la forma de onda.
- Soporte de dos formatos: 24 kHz mono y 48 kHz estéreo.
- Tasas de bits configurables mediante `n_q`: 1,5/3/6/12/24 kbps en 24 kHz y 3/6/12/24 kbps en 48 kHz.
- Ejecución multiplataforma vía ONNX Runtime con los execution providers CPU, DirectML, CUDA, TensorRT, CoreML, ROCm, OpenVINO y WebGPU.
- Dos precisiones intercambiables (FP32 e INT8) con el mismo contrato de entrada/salida.
- Integración en CLI propia (`latentmux`) para codificar ficheros a formato `.nmc`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un códec de audio, no un modelo de lenguaje.

## Casos de uso
- Compresión de archivos de música y voz: codificar FLAC o WAV a 6 kbps con `encodec` (24 kHz) para almacenamiento o transmisión, usando la variante INT8 si el espacio es crítico.
- Streaming de audio en tiempo real: el encoder de 24 kHz en INT8 tarda 3.847 ms y el decoder 2.014 ms en la prueba de referencia (2 hilos de CPU), lo que permite integrarlo en pipelines de baja latencia con recorte de solapamiento entre bloques.
- Tokenización para modelos de audio generativo: los `codes` RVQ sirven como representación discreta de entrada/salida en sistemas de síntesis o transformación de audio.
- Preprocesado en pipelines de voz: reducción de ancho de banda antes de transcripción o análisis, manteniendo una correlación de Pearson de 0,9344 (INT8, 24 kHz) con la señal original.
- Despliegue en dispositivos sin GPU: los ficheros INT8 de 11,37 MiB (decoder 24k) y 15,59 MiB (encoder 24k) caben en entornos embebidos y usan 90 MB de RAM pico en la prueba publicada.
- Integración nativa en aplicaciones Rust/C++: los grafos ONNX con checksums verificados permiten enlazar el códec sin el runtime de PyTorch.
- Archivado con control de fidelidad: la variante de 48 kHz estéreo en INT8 mantiene 13,54 dB de SNR frente a 13,60 dB en FP32, útil cuando prima la calidad sobre el tamaño.

## Benchmarks y rendimiento
Datos medidos con `latentmux bench` sobre ONNX Runtime CPU con 2 hilos, audio de prueba de 2,0 s:

| Variante | Precision | Tamano `.nmc` | kbps efectivos | Encode (ms) | Decode (ms) | SNR (dB) | SegSNR (dB) | Pearson | warm_rtf | RAM pico |
|---|---|---|---|---|---|---|---|---|---|---|
| encodec (24k) | fp32 | 1.637 B | 6,548 | 6671,4 | 1748,3 | 11,43 | 13,42 | 0,9634 | 0,552 | 133,84 MB |
| encodec (24k) | int8 | 1.637 B | 6,548 | 3847,3 | 2014,1 | 8,93 | 9,50 | 0,9344 | 0,475 | 90,00 MB |
| encodec48 (48k) | fp32 | 3.171 B | 12,684 | 7339,8 | 2616,7 | 13,60 | 15,75 | 0,9780 | 0,841 | 115,45 MB |
| encodec48 (48k) | int8 | 3.171 B | 12,684 | 4777,8 | 2630,7 | 13,54 | 15,49 | 0,9777 | 1,062 | 84,38 MB |

No se han publicado resultados de benchmarks comparativos con otros códecs (por ejemplo, Opus, SoundStream o DAC) en la información disponible.

## Requisitos de hardware
- VRAM: no aplica en ejecución CPU; en GPU el consumo es mínimo por el tamano de los grafos (el mayor es de 60,08 MiB en FP32).
- RAM pico medida: entre 84,38 MB (48k INT8) y 133,84 MB (24k FP32) en la prueba de referencia.
- GPU recomendadas: cualquiera compatible con los execution providers de ONNX Runtime; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, por tamano de modelo (decenas de MiB), aunque no hay cifras de rendimiento en GPU publicadas.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, DirectML, CoreML, ROCm, OpenVINO, WebGPU) y la CLI `latentmux`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un códec.
- Latencia y throughput: encode de 3,85 a 7,34 ms y decode de 1,75 a 2,63 ms para 2 s de audio en CPU con 2 hilos; `warm_rtf` entre 0,475 y 1,062.

## Comparativa con modelos similares
No se dispone de datos de benchmarks de códecs alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A nivel cualitativo:

| Modelo | Tipo | Tasas | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LatentMux EnCodec ONNX (este) | Códec neuronal ONNX (EnCodec) | 1,5-24 kbps (24k), 3-24 kbps (48k) | Formas dinámicas, streaming por bloques | MIT | Hugging Face, 8 ficheros ONNX |
| EnCodec original (facebook/encodec_24khz y 48khz) | Códec neuronal PyTorch | Mismas tasas | Mismas | MIT | Hugging Face / GitHub |
| Opus | Códec DSP clásico | 6-510 kbps | Tramas fijas | BSD | Estándar ampliamente extendido |
| DAC (Descript Audio Codec) | Códec neuronal | no disponible en esta ficha | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- La variante de 24 kHz en INT8 pierde aproximadamente 2,5 dB de SNR frente a FP32 en tonos puros (de 11,43 a 8,93 dB) por la cuantización QDQ de activaciones; la de 48 kHz INT8 apenas pierde 0,06 dB.
- El streaming por bloques requiere gestionar el recorte de solapamiento con ventanas de contexto; un uso incorrecto puede introducir discontinuidades en la señal.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa en ese sentido es un error de categoría.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe porque no aplican a un códec; no obstante, la calidad de reconstrucción depende del dominio del audio y de la calibración usada.
- Las métricas publicadas provienen de una única prueba con 2 s de audio y 2 hilos de CPU; el rendimiento en otros hardware, duraciones o contenidos puede diferir.
- La licencia MIT permite uso comercial, pero se debe conservar `LICENSE` y `NOTICE.txt` con las atribuciones a Meta y a facebookresearch/encodec.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces
- Hugging Face: https://huggingface.co/ai-inspire/latentmux-encodec-onnx
- Modelo base 24 kHz: https://huggingface.co/facebook/encodec_24khz
- Modelo base 48 kHz: https://huggingface.co/facebook/encodec_48khz
- Repositorio upstream: https://github.com/facebookresearch/encodec
- Paper de EnCodec: https://arxiv.org/abs/2210.13438
- Ficheros del repositorio: `manifest.json`, `NOTICE.txt`, `LICENSE` (en la raíz del repo de Hugging Face)
