# mlboydaisuke/distil-large-v3-onnxruntime-genai-fp16-cuda

## Resumen

`mlboydaisuke/distil-large-v3-onnxruntime-genai-fp16-cuda` es una exportación del modelo de reconocimiento automático del habla (ASR) `distil-whisper/distil-large-v3` al formato ONNX Runtime GenAI, en precisión fp16 y configurada para el execution provider CUDA. La publica el usuario mlboydaisuke con licencia MIT, heredada del modelo base, y está pensada para ejecutar transcripción de audio en inglés sobre GPUs NVIDIA en Windows. El repositorio ocupa 1,6 GB y contiene los grafos `encoder.onnx` y `decoder.onnx`, sus pesos, el `genai_config.json`, el tokenizador y la configuración del procesador de audio.

El modelo base, distil-whisper large-v3, es una destilación de Whisper large-v3 que mantiene 32 capas en el encoder pero reduce el decoder a 2 capas, lo que rebaja el coste computacional a cambio de una ligera pérdida de precisión. Esta exportación concreta no cuantiza los pesos: usa fp16, igual que el checkpoint original en safetensors, y el autor aclara que la etiqueta `base_model_relation: quantized` del Hub se emplea aquí en el sentido de exportación, no de cuantización.

Su relevancia es práctica: permite desplegar un ASR de calidad cercana a Whisper large-v3 mediante ONNX Runtime GenAI con aceleración CUDA, sin depender de PyTorch en tiempo de inferencia. El autor reporta un WER del 6,61 % sobre 50 clips de test de FLEURS en inglés, frente al 6,52 % del modelo original en transformers fp32 sobre CPU, con un factor de tiempo real (RTF) de 0,0105 en una RTX 5080 Laptop GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper destilado; encoder de 32 capas, decoder de 2 capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper; `max_length=448` en el ejemplo de generacion) |
| Tipos de cuantizacion | fp16 (pesos sin cuantizar); existe una exportacion fp32 para CPU |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`) para ONNX Runtime GenAI |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un encoder Transformer que procesa espectrogramas de audio y un decoder autorregresivo que genera tokens de transcripcion, con atencion cruzada entre ambos. En distil-whisper large-v3 el encoder conserva las 32 capas del large-v3 original, mientras que el decoder se reduce a 2 capas, lo que explica el ahorro computacional y la necesidad del parche descrito abajo. Esta exportacion concreta no entrena nada nuevo: parte de la revision 8031d2e6 del modelo base y se genera con el model builder de ONNX Runtime GenAI 0.19.0 usando `-p fp16 -e cuda`.

Un detalle tecnico relevante es que el builder 0.19.0 tal cual falla al exportar este modelo con `IndexError: index 2 is out of range` en `builders/whisper.py`, porque sus tres bucles de atencion cruzada cuentan capas del encoder en lugar de las del decoder. El autor aplica `patch_genai_whisper.py` para que el grafo del encoder emita 2 pares de salidas K/V, uno por capa del decoder. Existe un pull request abierto (microsoft/onnxruntime-genai#2940) que, segun el autor, produce los mismos ficheros byte a byte. No se documentan en la informacion disponible detalles sobre dataset de destilacion, RLHF/DPO ni innovaciones adicionales mas alla de la destilacion del modelo base.

## Capacidades

- Reconocimiento automatico del habla en ingles a partir de audio (WAV de 16 kHz, mono, 16 bits en el ejemplo).
- Transcripcion con prompt de control estilo Whisper (`<|startoftranscript|><|en|><|transcribe|><|notimestamps|>`), lo que permite fijar idioma y tarea.
- Generacion autorregresiva de tokens mediante el bucle `generate_next_token()` de ONNX Runtime GenAI.
- Procesamiento multimodal integrado: el `multimodal_processor` acepta prompts de texto y audios.
- Aceleracion en GPU mediante el execution provider CUDA, con opcion de kernel SDPA (`sdpa_kernel=1`) para el decoder.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo especializado en ASR.
- No soporta vision, audio generativo ni otros idiomas distintos del ingles.

## Casos de uso

- Transcripcion por lotes en Windows con GPU NVIDIA: el modelo se carga con `og.Model` y procesa clips de forma secuencial; su RTF de 0,0105 implica aproximadamente 95 segundos de audio transcritos por segundo de computo en una RTX 5080 Laptop GPU, adecuado para pipelines de subtitulado.
- Subtitulado y generacion de actas de reuniones en ingles: el prompt con `<|transcribe|>` y `<|notimestamps|>` produce texto plano listo para postprocesar; la ventana de 448 tokens de generacion cubre clips de duracion moderada.
- Integracion en aplicaciones de escritorio Windows nativas: al distribuirse como ficheros ONNX con `onnxruntime-genai-cuda`, se puede empaquetar junto a una app sin arrastrar PyTorch, reduciendo el peso del instalador.
- Servicio de transcripcion de bajo coste en una unica GPU de consumo: al caber en una RTX 5080 Laptop GPU y requerir solo 1,6 GB de repositorio, es viable en estaciones de trabajo no dedicadas.
- Evaluacion comparativa de exportaciones ONNX frente a transformers: el autor publica WER y RTF medidos, lo que permite contrastar la perdida de precision de la exportacion fp16 (6,61 %) frente al original fp32 (6,52 %).
- Prototipado de ASR en entornos Windows con CUDA 13 y cuDNN: el ejemplo de codigo resuelve la carga de DLLs de los wheels `nvidia-*`, sirviendo de plantilla para otros modelos ONNX Runtime GenAI.
- Base para experimentos de optimizacion de kernels: la opcion `sdpa_kernel=1` documentada reduce el tiempo un 17 %, lo que permite medir el impacto de distintos kernels de atencion.

## Benchmarks y rendimiento

Datos publicados por el autor sobre 50 clips de test de FLEURS en ingles (en_us, 546 s), decodificacion greedy, con el idioma fijado en el prompt, en una MSI Stealth 16 AI+ con RTX 5080 Laptop GPU, Windows 11, onnxruntime-genai-cuda 0.19.0 y onnxruntime-gpu 1.31.1 (medido el 2026-11-12):

| Modelo / configuracion | Dispositivo | WER (en) | RTF |
|---|---|---|---|
| Esta exportacion (fp16, CUDA) | RTX 5080 Laptop GPU | 6,61 % | 0,0105 |
| Esta exportacion con `sdpa_kernel=1` | RTX 5080 Laptop GPU | 6,61 % (mismas 50 respuestas) | 0,00865 |
| distil-large-v3 original en transformers (fp32) | CPU del equipo | 6,52 % | no disponible |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, ya que el modelo es exclusivamente de ASR. Tampoco se detalla el tiempo hasta el primer token mas alla de la definicion incluida en la tabla del autor.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio pesa 1,6 GB en fp16, por lo que la huella de pesos ronda ese orden de magnitud, a la que hay que sumar activaciones y buffers de CUDA.
- GPU recomendadas: el autor valida el modelo en una NVIDIA GeForce RTX 5080 Laptop GPU con driver 591.74; cualquier GPU NVIDIA compatible con CUDA 13 y cuDNN 9 deberia poder ejecutarlo.
- Cabe en GPU de consumo: si, segun la validacion del autor en una GPU de portatil de gama alta.
- Software requerido: `onnxruntime-genai-cuda==0.19.0`, `onnxruntime-gpu[cuda,cudnn]==1.31.1`, `huggingface_hub`, Python 3.12.16, `nvidia-cuda-runtime 13.5.37` y `nvidia-cudnn-cu13 9.28.1.4`.
- En Windows es necesario registrar manualmente los directorios de DLLs de los wheels `nvidia-*` con `os.add_dll_directory`, como muestra el ejemplo del autor.
- Opciones de despliegue: ONNX Runtime GenAI con execution provider CUDA; existe una exportacion fp32 para CPU en `mlboydaisuke/distil-large-v3-onnxruntime-genai-fp32`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 0,0105 (0,00865 con `sdpa_kernel=1`) sobre la RTX 5080 Laptop GPU; el autor indica que la velocidad sigue en ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Esta exportacion (distil-large-v3 ONNX GenAI fp16 CUDA) | no disponible (encoder 32 capas, decoder 2 capas) | ventana Whisper, `max_length=448` | en | MIT | ONNX (ONNX Runtime GenAI) | WER 6,61 % en FLEURS en, RTF 0,0105 en RTX 5080 Laptop |
| distil-whisper/distil-large-v3 (original) | mismo modelo base | ventana Whisper | en | MIT | safetensors (transformers) | WER 6,52 % en FLEURS en, fp32 en CPU segun el autor |
| whisper large-v3 | no disponible | ventana Whisper | multilingue | MIT (upstream) | safetensors, entre otros | Referencia de calidad del modelo base; no se aportan metricas en la informacion disponible |
| distil-large-v3-onnxruntime-genai-fp32 (misma autoria) | mismo modelo base | ventana Whisper | en | MIT | ONNX (ONNX Runtime GenAI) | Exportacion para CPU, sin datos de rendimiento en la informacion disponible |

## Limitaciones y advertencias

- Solo admite ingles (`language: en`); no es multilingue aunque el Whisper large-v3 original si lo sea.
- El WER medido (6,61 %) es ligeramente superior al del modelo original en transformers fp32 (6,52 %) en la misma prueba, por lo que la exportacion introduce una pequena perdida de precision.
- Los benchmarks provienen de una unica maquina (portatil con RTX 5080), un unico conjunto de 50 clips de FLEURS y una unica fecha de medicion; no son extrapolables a otros hardware o dominios de audio.
- El builder oficial de ONNX Runtime GenAI 0.19.0 falla al exportar este modelo sin el parche `patch_genai_whisper.py`; el pull request con la correccion (microsoft/onnxruntime-genai#2940) seguia abierto y sin fusionar el 2026-11-12.
- La configuracion en Windows exige registrar manualmente las DLLs de CUDA y cuDNN; un despliegue mal configurado puede cargar el modelo en CPU o fallar al iniciar.
- Riesgo de alucinacion inherente a los modelos Whisper en audio con ruido, silencios largos o habla no inglesa; no se documenta mitigacion especifica en esta exportacion.
- No se han publicado analisis de sesgos en la informacion disponible.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base y de las dependencias de NVIDIA (CUDA, cuDNN) en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/distil-large-v3-onnxruntime-genai-fp16-cuda
- Modelo base: https://huggingface.co/distil-whisper/distil-large-v3
- Exportacion fp32 para CPU: https://huggingface.co/mlboydaisuke/distil-large-v3-onnxruntime-genai-fp32
- Parche del builder: https://github.com/john-rocky/windows-audio-zoo/blob/main/pc/patch_genai_whisper.py
- Pull request con la correccion del builder: https://github.com/microsoft/onnxruntime-genai/pull/2940
