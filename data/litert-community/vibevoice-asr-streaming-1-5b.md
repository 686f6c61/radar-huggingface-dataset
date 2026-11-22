# litert-community/VibeVoice-ASR-Streaming-1.5B

## Resumen

VibeVoice-ASR-Streaming-1.5B es un modelo de reconocimiento automático del habla (ASR) en modo streaming desarrollado originalmente por Microsoft y distribuido aquí por la comunidad litert-community en formato LiteRT-LM (`.litertlm`) para inferencia on-device. El modelo combina los tokenizadores acústico y semántico σ-VAE de la familia VibeVoice (audio a 24 kHz convertido a 7,5 tramas latentes por segundo) con un modelo de lenguaje de forma Qwen2.5-1.5B entrenado para transcribir ventanas de audio de 2,93 s con 0,53 s de look-ahead, etiquetando cada segmento con el hablante (`Speaker 0: …`).

La relevancia de esta conversión radica en que empaqueta el codificador de audio y el LLM en un único archivo ejecutable por el runtime LiteRT-LM de Google, permitiendo transcripción incremental en dispositivos móviles sin conexión. Soporta diez idiomas (inglés, chino, español, portugués, alemán, japonés, coreano, francés, ruso e italiano) bajo licencia MIT.

El modelo se consume como una conversación multiturno, una ventana de audio por turno, que es como fue entrenado; alimentar un clip completo en un solo turno produce únicamente la transcripción de los últimos 3,5 s. Existen dos variantes de pesos en el repositorio: int4 (1,99 GB) e int8 (2,77 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM tipo Qwen2.5-1.5B + tokenizadores σ-VAE acústico/semántico (codec de audio) |
| Parametros totales | 1,5B (modelo de lenguaje); codificador de audio no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens de KV cache (≈ 2,5 minutos de audio continuo por conversación) |
| Tipos de cuantizacion | LM int4 blockwise-128 (min-max) con embeddings int8; LM int8 dinámico; codificador de audio int8 dinámico con convoluciones fp32 |
| Idiomas soportados | en, zh, es, pt, de, ja, ko, fr, ru, it |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors en microsoft/VibeVoice-ASR-Streaming-1.5B |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos etapas: un codificador de audio basado en los tokenizadores σ-VAE acústico y semántico de VibeVoice convierte la señal a 24 kHz en 7,5 tramas latentes por segundo, y un transformer decoder con la forma de Qwen2.5-1.5B genera el texto. El protocolo de streaming procesa ventanas de 83 200 muestras (26 tramas de 3200 muestras, 3,467 s) y avanza de 70 400 muestras (22 tramas, 2,933 s), conservando las últimas 4 tramas como look-ahead de la ventana siguiente. Cada turno inserta 26 embeddings de audio entre `<|object_ref_start|>` y `<|object_ref_end|>`, y el modelo detiene la generación con `<|text_chunk_end|>`.

La conversión a LiteRT-LM reescribe el grafo de prefill/decode para GPU sin modificar ningún peso (actualización del 17 de noviembre de 2026). El repositorio no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información correspondería a la model card del modelo base de Microsoft, no incluida en la información disponible. El prompt del sistema admite hotwords en un mensaje de sistema con la clave `extra info:`, lo que permite sesgar el reconocimiento hacia vocabulario específico.

## Capacidades

- Transcripción de voz a texto en streaming con latencia de fragmento de 2,93 s y look-ahead de 0,53 s.
- Diarización ligera: cada segmento se prefija con la etiqueta `Speaker N:`.
- Soporte de diez idiomas: inglés, chino, español, portugués, alemán, japonés, coreano, francés, ruso e italiano.
- Procesamiento incremental sin re-codificar el audio entre turnos; la KV cache crece unos 40 tokens por cada 2,93 s de habla.
- Personalización mediante hotwords en el mensaje de sistema.
- Inferencia on-device en CPU, GPU Metal (Apple) y GPU OpenCL/Mali (Android) a través de LiteRT-LM.
- No dispone de tool calling, function calling ni capacidades de agente; es un modelo especializado exclusivamente en ASR.
- No soporta visión ni audio más allá de la transcripción; no hay modo thinking.

## Casos de uso

- Subtitulado en directo en movil: la app envía ventanas de 3,467 s y muestra la transcripción con un retardo inferior a un segundo, aprovechando que el codificador y el LLM corren en el propio dispositivo sin red.
- Actas de reuniones con atribución de hablante: el etiquetado `Speaker N:` permite separar intervenciones en conversaciones de hasta 2,5 minutos por sesión de KV cache; para reuniones más largas se reinicia la conversación.
- Dictado por voz offline en aplicaciones de notas: el archivo int4 de 1,99 GB cabe en almacenamiento móvil y se ejecuta en CPU de un Pixel 8a o Galaxy S26 con WER en torno al 7 % en LibriSpeech dev-clean.
- Transcripción multilingüe en atención al cliente: con diez idiomas cubiertos, un mismo binario sirve para clientes en español, inglés, alemán o japonés sin descargar modelos separados.
- Reconocimiento con vocabulario de dominio: los hotwords del mensaje de sistema permiten sesgar hacia nombres de producto, términos médicos o jerga técnica en un pipeline de transcripción especializado.
- Asistentes de voz embebidos en wearables o IoT: el tamaño reducido del LM int4 (802 MB de prefill/decode más 237 MB de embedder) y el codificador int8 (951 MB) permiten despliegues en dispositivos con recursos limitados.
- Investigación en ASR de bajo consumo: sirve como referencia reproducible para comparar latencias y WER entre CPU y GPU en hardware móvil con el runtime LiteRT-LM.

## Benchmarks y rendimiento

WER medido sobre 20 clips de LibriSpeech dev-clean (448 palabras, 73 ventanas), decodificación greedy, tras mayúsculas, eliminación de puntuación y de la etiqueta `Speaker N:`:

| Configuracion | Archivo int4 | Archivo int8 |
|---|---|---|
| Referencia PyTorch fp32 (streaming_generate, medias latentes) | 7,59 % (34/448) | 7,59 % (34/448) |
| LiteRT-LM 0.16.1, Apple M4 Max, CPU | 7,81 % (35/448) | 7,14 % (32/448) |
| LiteRT-LM 0.16.1, M4 Max, LM en GPU Metal, audio en CPU | 6,92 % (31/448) | 7,37 % (33/448) |
| LiteRT-LM 0.16.1 CLI `--multi_turns`, Galaxy S26, CPU | 7,81 % (35/448) | 7,14 % (32/448) |
| LiteRT-LM 0.16.1 CLI, Galaxy S26, LM en GPU OpenCL, audio en CPU | 7,14 % (32/448) | 6,92 % (31/448) |
| LiteRT-LM 0.16.1 CLI `--multi_turns`, Pixel 8a (Tensor G3), CPU | 7,81 % (35/448) | no medido |
| LiteRT-LM 0.16.1 CLI, Pixel 8a, LM en GPU Mali, audio en CPU | 7,37 % (33/448) | no medido |

Rendimiento de los archivos actualizados (17-11-2026) en GPU de Galaxy S26 con LiteRT-LM v0.19.0, tras un prefill de 1024 tokens: 51,7 tokens/s para int4 y 32,9 tokens/s para int8. Como referencia, el archivo no streaming VibeVoice-ASR-BitNet obtiene 2,68 % de WER en los mismos 20 clips con ventana de 30 s; la diferencia refleja el compromiso propio del modo streaming. Microsoft no publica cifra de LibriSpeech para el modelo streaming.

## Requisitos de hardware

- VRAM/almacenamiento: archivo int4 de 1,99 GB (prefill/decode 802 MB, embedder 237 MB, codificador de audio 951 MB); archivo int8 de 2,77 GB (prefill/decode 1581 MB, mismo codificador).
- Cabe en GPU de consumo y en móviles de gama alta: validado en Galaxy S26 (SM-S942Q), Pixel 8a (Tensor G3) y Apple M4 Max.
- GPU de escritorio: no se especifican requisitos para A100, H100 o RTX 4090; el formato `.litertlm` está orientado a edge y el runtime LiteRT-LM es el soportado.
- Despliegue: exclusivamente mediante LiteRT-LM (versiones 0.19.0 a 0.19.2 para los archivos actuales; 0.16.1 y 0.17.1 para los anteriores). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 51,7 tokens/s (int4) y 32,9 tokens/s (int8) en GPU de Galaxy S26 tras prefill de 1024 tokens.
- Aceleración: LM en GPU Metal en Apple, GPU OpenCL en Android; el codificador de audio se ejecuta en CPU en las configuraciones medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER LibriSpeech dev-clean (20 clips) | Licencia | Formato/despliegue |
|---|---|---|---|---|---|
| VibeVoice-ASR-Streaming-1.5B (LiteRT-LM) | 1,5B | 2048 tokens KV (≈2,5 min) | 6,92–7,81 % (streaming, 3,467 s) | MIT | `.litertlm`, LiteRT-LM |
| VibeVoice-ASR-BitNet (LiteRT-LM) | no disponible | no disponible (ventana de 30 s) | 2,68 % | MIT | `.litertlm`, LiteRT-LM |
| Whisper large-v3 | 1,55B | 30 s por ventana | no disponible en la información | MIT | safetensors, múltiples runtimes |
| Qwen2-Audio | no disponible | no disponible | no disponible en la información | no disponible | safetensors |

La comparación con Whisper y Qwen2-Audio no puede cuantificarse con los datos aportados; solo se dispone de cifras propias del ecosistema VibeVoice en LiteRT-LM.

## Limitaciones y advertencias

- El modelo solo transcribe correctamente en modo multiturno, una ventana de audio por turno; un clip completo en un turno devuelve únicamente los últimos 3,5 s.
- La ventana de contexto efectiva es de 2048 tokens de KV cache, unos 2,5 minutos de audio continuo; sesiones más largas requieren reiniciar la conversación.
- El WER residual de ~7 % en LibriSpeech dev-clean es sustancialmente peor que el 2,68 % del modelo no streaming de la misma familia; es un compromiso inherente al streaming.
- La diarización se limita a etiquetas `Speaker N:` por segmento; no se documenta robustez en solapamientos de hablantes ni en ruido de fondo.
- No se han publicado datos de sesgo, alucinación o robustez acústica en la información disponible; la transcripción puede inventar texto en silencios o audio ininteligible.
- Los archivos actuales solo se han probado con LiteRT-LM 0.19.0 a 0.19.2; runtimes anteriores no fueron validados con ellos.
- La licencia MIT permite uso comercial sin restricciones documentadas, pero el modelo base es de Microsoft y conviene verificar la model card original para condiciones adicionales.
- El formato `.litertlm` limita el despliegue a LiteRT-LM; no hay conversión documentada a GGUF ni integración con servidores de inferencia convencionales.
- El repositorio ocupa 14,3 GB, aunque los archivos individuales son de 1,99 GB y 2,77 GB.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/VibeVoice-ASR-Streaming-1.5B
- Modelo base: https://huggingface.co/microsoft/VibeVoice-ASR-Streaming-1.5B
- Modelo no streaming de la familia: https://huggingface.co/litert-community/VibeVoice-ASR-BitNet
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Paquete Python: `pip install litert-lm-api`
