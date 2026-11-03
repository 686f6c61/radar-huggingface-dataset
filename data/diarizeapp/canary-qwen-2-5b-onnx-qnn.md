# diarizeapp/canary-qwen-2.5b-onnx-qnn

## Resumen

Canary-Qwen-2.5B ONNX QNN es una compilación híbrida del modelo de reconocimiento automático del habla `nvidia/canary-qwen-2.5b`, publicada por el usuario `diarizeapp`. El paquete separa el pipeline en dos componentes: el encoder FastConformer, el adaptador de modalidad y la proyección se ejecutan sobre la NPU Hexagon de los SoC Qualcomm Snapdragon X Elite (arquitectura SM8380) mediante QNN Execution Provider, mientras que el decoder Qwen3 (con el adaptador LoRA ya fusionado) se ejecuta en CPU a través de ONNX Runtime con cuantización int8.

El objetivo declarado es permitir la transcripción de audio en inglés directamente en hardware ARM para portátiles con NPU, sin depender de GPU dedicada. El encoder usa cuantización w8a16 con un `EPContext` precompilado y atado a la versión de QAIRT `2.50.40.260831140417`, lo que implica que el binario no es portable a otras versiones del SDK sin reconstrucción mediante el script `canary_qwen_pipeline.py` incluido por el autor.

El modelo base es un sistema ASR de 2.500 millones de parámetros con decoder generativo tipo Qwen3, licencia Apache 2.0 y soporte exclusivo de inglés. El repositorio ocupa 10 GB e incluye los grafos ONNX, los binarios QNN del contexto NPU, el tokenizer, los embeddings en fp16 y los filtros mel necesarios para reproducir el preprocesado exacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: encoder FastConformer + adaptador de modalidad + proyección sobre NPU Hexagon (QNN EPContext, w8a16); decoder Qwen3 con LoRA fusionado sobre ONNX Runtime CPU (int8) |
| Parametros totales | 2.500 millones (modelo base `nvidia/canary-qwen-2.5b`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de encoder fijas de 8 s (800 frames mel, 100 tokens de audio por ventana); el decoder usa KV cache con contexto acumulado `[1,8,384,128]` por capa, 28 capas |
| Tipos de cuantizacion | Encoder w8a16 (pesos 8 bits, activaciones 16 bits) en NPU; decoder int8 en CPU; embeddings en fp16 (`embeddings_fp16.npy`, `[151936, 2048]`) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`audio_encoder_ctx.onnx`, `decoder_prefill.onnx`, `decoder_decode.onnx`), binarios QNN (`*_ctx_qnn.bin`), `.npy` para embeddings y filtros mel, `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño del modelo base Canary-Qwen: un encoder FastConformer que transforma el audio en representaciones latentes, un adaptador de modalidad que las proyecta al espacio del decoder y un decoder generativo Qwen3 que produce el texto. En esta build concreta, el encoder, el adaptador y la proyección se compilan a un grafo ONNX con contexto QNN precompilado para la NPU Hexagon del Snapdragon X Elite (SM8380), con cuantización w8a16. El decoder Qwen3, con el adaptador LoRA ya fusionado en los pesos, se ejecuta en CPU con cuantización int8 en dos grafos separados: uno de prefill (procesa bloques de 32 tokens) y otro de decode (un token por paso).

El preprocesado es parte explícita del pipeline: audio a 16 kHz mono float32, segmentación en pasadas de 2 ventanas de 8 s, log-mel con preemphasis 0.97, STFT con `n_fft=512` y `hop=160`, filtros mel de 128 bandas, logaritmo con epsilon `5.96e-08`, estandarización por feature y padding a ventanas completas. El prompt sigue la plantilla de chat de Qwen con el texto `Transcribe the following: ` más una etiqueta de localización, y los embeddings del span de audio se sustituyen por la salida del encoder. La decodificación es greedy con parada por EOS (`151643`, `151645`) o por 24 tokens idénticos consecutivos. No se documenta en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Reconocimiento automático del habla en inglés con salida de transcripción plana.
- Procesamiento de audio en ventanas de 8 s con concatenación de embeddings entre ventanas, lo que permite audio de duración arbitraria dividido en pasadas de 2 ventanas.
- Decodificación generativa autorregresiva con KV cache, prefill en bloques de 32 tokens y decode token a token.
- Inferencia en NPU Hexagon de Qualcomm (Snapdragon X Elite, SM8380) para el encoder, con decoder en CPU.
- Soporte de localización mediante etiqueta en el prompt (`locator tag`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de entrada más allá del ASR ni modo thinking en la información disponible.

## Casos de uso

- Transcripción local en portátiles Snapdragon X Elite: el paquete está diseñado para ejecutarse sin GPU dedicada, aprovechando la NPU Hexagon para el encoder y la CPU para el decoder, lo que permite dictado y transcripción offline en dispositivos ARM.
- Actas y notas de reuniones en inglés: el pipeline acepta audio de duración arbitraria mediante pasadas de 2 ventanas de 8 s, por lo que puede transcribir grabaciones largas concatenando embeddings entre ventanas.
- Subtitulado y postproducción de vídeo en inglés: la salida es texto plano decodificado con tokens especiales omitidos, adecuada para generar subtítulos que se integren en herramientas de edición.
- Sistemas de accesibilidad en inglés: transcripción en tiempo real o diferida en equipos sin GPU, útil para aplicaciones de dictado y asistencia a personas con discapacidad auditiva.
- Procesamiento por lotes en servidores ARM: al ser ONNX, puede desplegarse con ONNX Runtime en entornos ARM64, aunque el encoder QNN está atado a la NPU Snapdragon X Elite y a la versión de QAIRT indicada.
- Investigación en eficiencia de ASR en NPU: el repositorio incluye `model_meta.json`, `metadata.json`, `tokenizer.json`, `mel_filters.npy` y `mel_window.npy`, lo que facilita reproducir el pipeline y medir latencia y precisión en distintas configuraciones.
- Reconstrucción para otros dispositivos o SDKs: el script `canary_qwen_pipeline.py` permite regenerar los grafos para otras versiones de QAIRT o hardware Qualcomm compatible.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| CER macro (6 clips, frente a grafos fp32 en CPU del mismo pipeline) | 0.1095 |
| CER peor clip | 0.4199 |
| RTF medio | 0.377 |
| Throughput de decodificación | 11.0 tokens/s |

Los datos proceden de la model card del autor y se midieron sobre 6 clips contra los grafos fp32 en CPU del mismo pipeline. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, LibriSpeech WER, etc.) en la información disponible.

## Requisitos de hardware

- NPU Qualcomm Hexagon del Snapdragon X Elite (SM8380) para el encoder; el `EPContext` está atado a QAIRT `2.50.40.260831140417`.
- CPU para el decoder int8 vía ONNX Runtime; no se especifica el número de núcleos ni la frecuencia necesarios.
- VRAM estimada: no aplica GPU dedicada; el consumo de memoria del paquete es de 10 GB en disco, con embeddings fp16 de `[151936, 2048]` y KV cache de `2 * 28` arrays `[1,8,384,128]`.
- No cabe ni está pensado para GPU consumer (RTX 4090, etc.); el encoder QNN no es portable a CUDA sin reconstrucción.
- Opciones de despliegue: ONNX Runtime con QNN Execution Provider para el encoder y CPU Execution Provider para el decoder; el script `canary_qwen_pipeline.py` permite reconstruir para otros dispositivos o SDKs.
- Latencia y throughput: RTF medio 0.377 y 11.0 tokens/s medidos en el hardware de referencia del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| `diarizeapp/canary-qwen-2.5b-onnx-qnn` | 2.500 M | Ventanas de 8 s, KV cache acumulado | Apache 2.0 | NPU Hexagon + CPU (ONNX Runtime) | Build específica para Snapdragon X Elite, atada a QAIRT 2.50.40 |
| `nvidia/canary-qwen-2.5b` | 2.500 M | no disponible en la información proporcionada | Apache 2.0 | GPU/CPU con frameworks estándar | Modelo base original, sin compilación QNN |
| Otras builds ONNX de ASR | no disponible | no disponible | no disponible | ONNX Runtime | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- El encoder QNN está atado a la versión de QAIRT `2.50.40.260831140417` y al SoC SM8380; no es portable a otras versiones del SDK ni a otros dispositivos sin reconstrucción con `canary_qwen_pipeline.py`.
- Las ventanas del encoder son fijas de 8 s, por lo que la atención no cruza ventanas; la coherencia entre ventanas depende de la concatenación de embeddings.
- El CER medido es 0.1095 macro con un peor clip de 0.4199, lo que indica variabilidad notable según el clip; no debe asumirse ese rendimiento medio en producción sin validación propia.
- La decodificación es greedy, sin beam search ni muestreo, lo que limita la corrección de errores en casos ambiguos.
- Riesgo de alucinación inherente a un decoder generativo Qwen3, especialmente en audio ruidoso o con habla solapada; no se documentan mitigaciones.
- No se documentan sesgos conocidos ni evaluación de robustez por acento, género o dominio en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor recomienda verificar la licencia upstream en la model card de `nvidia/canary-qwen-2.5b` antes de redistribuir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del build.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/diarizeapp/canary-qwen-2.5b-onnx-qnn
- Modelo base: https://huggingface.co/nvidia/canary-qwen-2.5b
- QAIRT (Qualcomm AI Runtime): no disponible en la información proporcionada
- Script de reconstrucción `canary_qwen_pipeline.py`: incluido en el repositorio del modelo
- Paper o blog del modelo base: no disponible en la información proporcionada
