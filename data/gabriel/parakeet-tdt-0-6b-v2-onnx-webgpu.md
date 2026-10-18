# Gabriel/parakeet-tdt-0.6b-v2-onnx-webgpu

## Resumen

`Gabriel/parakeet-tdt-0.6b-v2-onnx-webgpu` es una compilación ONNX cuantizada a 4 bits del codificador del modelo de reconocimiento automático del habla `nvidia/parakeet-tdt-0.6b-v2`, publicado por el usuario Gabriel. No es un modelo entrenado desde cero: es un artefacto de despliegue derivado, pensado para ejecutar ASR en el navegador mediante WebGPU, sin backend ni servidor de inferencia. El modelo base lo desarrolla NVIDIA y emplea una arquitectura FastConformer con decodificador TDT (token-and-duration transducer) de unos 600 millones de parámetros, licencia CC BY 4.0 y cobertura exclusiva del inglés.

El problema que resuelve esta variante es concreto: el export ONNX fp32 del codificador ocupa 2,48 GB y el int8 652 MB, pero ninguno de los dos está optimizado para el kernel `MatMulNBits` de onnxruntime-web. Esta versión usa cuantización int4 con `MatMulNBits` (block size 32, puntos cero `uint8`), que es exactamente el formato que ejecuta el kernel WebGPU de onnxruntime-web, de modo que el codificador completo permanece en la GPU. El resultado es un codificador de 688 MB que sustituye directamente a `encoder-model.int8.onnx` en el layout de `onnx-asr`.

La relevancia ahora mismo es práctica: permite transcripción de voz en inglés en el cliente, con privacidad de datos y sin coste de servidor, a cambio de una degradación de WER muy contenida (3,04 % frente a 2,70 % del int8 en LibriSpeech). Es un ejemplo de cómo la cuantización de bajo nivel y el soporte de kernels en el runtime determinan qué modelos pueden llegar al navegador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador) + decodificador TDT (token-and-duration transducer); export ONNX |
| Parámetros totales | 0,6 B (600 M) en el modelo base |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; es un modelo de ASR, la model card no especifica la ventana máxima de audio |
| Tipos de cuantización | int4 `MatMulNBits` (block size 32, puntos cero `uint8`); el repo de origen ofrece fp32 e int8 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`encoder-model.int4.onnx` equivalente, `decoder_joint-model.int8.onnx`, `nemo128.onnx`, `vocab.txt`) |
| Tamaño del repo | 0,7 GB |
| Tamaño del codificador | 688 MB (int4) frente a 652 MB (int8) y 2,48 GB (fp32) |
| Runtime objetivo | onnxruntime-web con backend WebGPU |
| Pipeline | `automatic-speech-recognition` |
| Modelo base | `nvidia/parakeet-tdt-0.6b-v2` (relación: quantized) |

## Arquitectura y entrenamiento

El modelo base es un FastConformer: una variante del Conformer con convoluciones depthwise separables y submuestreo agresivo de la secuencia de entrada, diseñada para reducir el coste computacional en audio largo manteniendo modelado global mediante auto-atención. Sobre el codificador se sitúa un decodificador TDT, que predice conjuntamente el token y su duración, lo que evita el post-procesado de CTC y permite emitir varios tokens por fotograma con alineamientos implícitos. Esta ficha no dispone de información sobre el volumen de horas de entrenamiento, la composición del dataset ni si hubo etapas de ajuste con RLHF o DPO; esos datos corresponden a la model card de NVIDIA, no incluida aquí.

La innovación de este artefacto es exclusivamente de despliegue. La cuantización se realizó con `MatMulNBitsQuantizer` de onnxruntime 1.31 a partir del export fp32 de `istupakov/parakeet-tdt-0.6b-v2-onnx` (revisión `0bbb45a3`), dejando las convoluciones 1×1 en fp32, lo que explica que el int4 (688 MB) pese más que el int8 (652 MB). Además, `nemo128.onnx` se reexportó con la STFT en float32 en lugar de float64 (`stft_float32.py`), porque el build WebGPU de onnxruntime-web no soporta `Cast` a float64; las características log-mel difieren como máximo 2,2e-4 y en los clips de prueba producen los mismos tokens que el original.

## Capacidades

- Transcripción de voz a texto en inglés con salida de tokens a nivel de palabra, sin puntuación ni mayúsculas en la configuración de evaluación empleada (decodificación greedy con `onnx-asr`).
- Reconocimiento en streaming por segmentos mediante el esquema codificador + decodificador conjunto (TDT), apto para audio de duración moderada procesado por trozos.
- Ejecución íntegra en GPU del navegador vía WebGPU: el codificador cuantizado permanece residente en la GPU, sin fallback a CPU.
- Compatibilidad directa con el layout de `onnx-asr`: sustituye a `encoder-model.int8.onnx` usando el mismo `vocab.txt` y `decoder_joint-model.int8.onnx`.
- Extracción de características mel integrada (`nemo128.onnx`) con STFT en float32, adaptada a las limitaciones de WebGPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni visión: es un modelo puramente acústico.
- Multilingüismo: no, únicamente inglés.

## Casos de uso

- **Transcripción en el navegador sin backend**: integrado en una aplicación web con WebGPU, el modelo procesa el audio del micrófono sin enviar datos a un servidor. Es adecuado por su tamaño (688 MB de codificador) y porque el kernel `MatMulNBits` evita el traslado de tensores entre CPU y GPU.
- **Dictado en editores y herramientas ofimáticas web**: con una ventana de latencia de un solo paso por segmento, permite convertir voz en texto dentro de un editor o CMS, manteniendo el audio en el dispositivo.
- **Actas y notas de reuniones en inglés**: la arquitectura Conformer maneja audio continuo y el decodificador TDT genera alineamientos implícitos, lo que facilita segmentar y marcar marcas temporales aproximadas en la transcripción.
- **Subtitulado de vídeo en aplicaciones de edición ligeras**: al ejecutarse en GPU de consumo o integrada, encaja en herramientas de escritorio con WebView (Electron, Tauri) que necesitan subtítulos en inglés sin depender de la nube.
- **Búsqueda por voz y comandos en PWA**: el modelo puede transcribir consultas cortas en el cliente y enviar solo el texto al backend, reduciendo el ancho de banda y los requisitos de privacidad.
- **Accesibilidad en directo**: generación de subtítulos en tiempo real para vídeos o clases en inglés en navegador, con la ventaja de que no requiere instalación de software.
- **Preprocesado de corpus de voz en inglés**: para equipos que necesitan transcribir grandes volúmenes de audio de forma distribuida en navegadores o nodos sin GPU dedicada, aunque en ese escenario conviene evaluar el int8 o fp32 por precisión.

## Benchmarks y rendimiento

Evaluación sobre LibriSpeech (73 utterances de `hf-internal-testing/librispeech_asr_dummy`, 8 minutos), decodificación greedy con `onnx-asr`, texto en minúsculas y sin puntuación:

| Codificador | WER | Tamaño |
|---|---|---|
| fp32 | 2,87 % | 2,48 GB |
| int8 | 2,70 % | 652 MB |
| int4 (esta versión) | 3,04 % | 688 MB |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros conjuntos de ASR (por ejemplo, Common Voice o FLEURS). Tampoco se dispone de métricas de latencia o throughput (RTF) medidas.

## Requisitos de hardware

- **VRAM estimada**: en torno a 0,7–1,0 GB para el codificador int4 más el decodificador int8 y el front-end mel; el codificador solo son 688 MB.
- **GPU recomendadas**: cualquier GPU con soporte WebGPU en Chrome/Edge (integradas Intel Iris Xe, AMD Radeon, Apple Silicon y GPUs dedicadas NVIDIA/AMD). No requiere A100 ni H100; el objetivo es cliente.
- **Cabe en GPU de consumo**: sí, en todas las dedicadas modernas (GTX 1650 en adelante, RTX 30/40, RX 6000/7000) y en muchas integradas, siempre que el navegador exponga WebGPU.
- **Opciones de despliegue**: onnxruntime-web con backend WebGPU; también onnxruntime nativo (CPU o CUDA) y `onnx-asr` para Python. No está pensado para vLLM, TGI u Ollama, que no ejecutan modelos de ASR de este tipo.
- **Latencia y throughput**: no disponibles en la información proporcionada. Como referencia cualitativa, el autor indica que el codificador completo permanece en la GPU, lo que evita las copias implícitas del fallback a CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | WER (LibriSpeech dummy) | Tamaño | Licencia |
|---|---|---|---|---|---|
| Este modelo (encoder int4) | 0,6 B | ONNX int4 + int8 | 3,04 % | 688 MB | CC BY 4.0 |
| `istupakov/parakeet-tdt-0.6b-v2-onnx` (int8) | 0,6 B | ONNX int8 | 2,70 % | 652 MB | CC BY 4.0 |
| `istupakov/parakeet-tdt-0.6b-v2-onnx` (fp32) | 0,6 B | ONNX fp32 | 2,87 % | 2,48 GB | CC BY 4.0 |
| `nvidia/parakeet-tdt-0.6b-v2` (original) | 0,6 B | NeMo `.nemo` | No disponible en esta ficha | No disponible | CC BY 4.0 |
| `openai/whisper-large-v3` (referencia externa) | 1,55 B | PyTorch / ONNX | No disponible en esta ficha | No disponible | MIT |

La comparación relevante es interna a la familia Parakeet: el int4 es ligeramente menos preciso que el int8 (3,04 % frente a 2,70 %) y ocupa 36 MB más, pero es el único que se ejecuta de forma nativa en el kernel `MatMulNBits` de onnxruntime-web. Frente a Whisper large-v3, este modelo es aproximadamente 2,5 veces menor, monolingüe y con licencia CC BY 4.0 en lugar de MIT, pero no se dispone de una comparación de WER publicada en la información consultada.

## Limitaciones y advertencias

- **Solo inglés**: no cubre castellano ni ningún otro idioma; usar este modelo para audio en español producirá transcripciones incorrectas.
- **Sin puntuación ni mayúsculas** en la configuración evaluada: la decodificación greedy con `onnx-asr` produce texto en minúsculas y sin signos, lo que exige un post-procesado si se necesita formato legible.
- **Pérdida de precisión por cuantización**: el WER sube de 2,70 % (int8) a 3,04 % (int4) en la muestra de 8 minutos; con solo 73 utterances la diferencia está sujeta a varianza y conviene validar en el dominio propio antes de producción.
- **Sesgos**: no se documentan análisis de sesgo por acento, género, edad o variedad dialectal en la información disponible; el modelo base está entrenado por NVIDIA y hereda los sesgos de su corpus, no descritos aquí.
- **Riesgo de alucinación**: como todo modelo de ASR, puede emitir texto plausible en segmentos de silencio o ruido; no hay umbral de confianza ni mecanismo de detección incluido.
- **Restricciones de licencia**: CC BY 4.0 permite uso comercial con atribución a NVIDIA como autor del modelo base y a Gabriel como autor de la cuantización; hay que conservar el aviso de licencia y citar la procedencia.
- **Dependencia de WebGPU**: requiere un navegador con WebGPU habilitado; en entornos sin soporte el rendimiento caerá al backend CPU de onnxruntime-web, sin métricas publicadas.
- **Convoluciones 1×1 en fp32**: parte del codificador no está cuantizada, lo que limita la reducción de tamaño y explica que el int4 no sea más pequeño que el int8.
- **Artefacto derivado sin mantenimiento garantizado**: 0 descargas y 0 likes en el momento de la consulta; no hay garantía de actualizaciones ni de compatibilidad con futuras versiones de onnxruntime-web.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Gabriel/parakeet-tdt-0.6b-v2-onnx-webgpu
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Export ONNX de origen: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v2-onnx
- Dataset de evaluación: https://huggingface.co/datasets/hf-internal-testing/librispeech_asr_dummy
- onnxruntime-web: https://github.com/microsoft/onnxruntime/tree/main/js/web
- onnx-asr: https://github.com/istupakov/onnx-asr

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre el modelo; los resultados correspondían a homónimos del nombre «Gabriel» (entidades educativas, empresas madereras y artículos enciclopédicos), por lo que no se incluyen.
