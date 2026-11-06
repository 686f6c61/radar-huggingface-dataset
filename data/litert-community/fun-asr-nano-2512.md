# litert-community/Fun-ASR-Nano-2512

## Resumen

Fun-ASR-Nano-2512 es un modelo de reconocimiento automático del habla (ASR) extremo a extremo desarrollado por Tongyi Lab (Alibaba) y empaquetado por la comunidad litert-community en el formato LiteRT-LM para inferencia en dispositivo. Combina un codificador de audio SenseVoice SAN-M de 70 capas con un adaptador de 2 capas que alimenta un modelo de lenguaje Qwen3-0.6B, encargado de generar la transcripción. El resultado es un pipeline audio-a-texto en un único fichero `.litertlm` de 1,26 GB, ejecutable sin dependencias de servidor.

El modelo cubre chino (incluyendo 7 dialectos y 26 acentos regionales), inglés y japonés, y admite listas de hotwords en el prompt para sesgar la transcripción hacia vocabulario específico. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales. Su relevancia actual radica en que lleva ASR de calidad cercana a la referencia a dispositivos móviles y edge, con un consumo de memoria moderado y sin necesidad de conexión.

Esta ficha describe la conversión a LiteRT-LM del checkpoint original FunAudioLLM/Fun-ASR-Nano-2512, cuantizado a int8 en los pesos del LM y fp16 en el codificador de audio, con ventana de audio fija de 30,24 segundos por mensaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio SenseVoice SAN-M (70 capas) + adaptador (2 capas) + LM Qwen3-0.6B |
| Parametros totales | No disponible (el LM es de 0,6 mil millones; el encoder no publica recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el LM; ventana de audio fija de 30,24 s (504 frames de 960 muestras a 16 kHz) |
| Tipos de cuantizacion | LM int8 dinámico con tabla de embeddings int8 y activaciones fp32; encoder fp16 en pesos, cómputo fp32 |
| Idiomas soportados | Chino (7 dialectos, 26 acentos), inglés, japonés |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM); modelo base en safetensors/PyTorch |

## Arquitectura y entrenamiento

La arquitectura es un pipeline híbrido de dos etapas. La primera es un codificador de audio SenseVoice SAN-M de 70 capas que procesa características fbank con front-end LFR, seguido de un adaptador de 2 capas que proyecta las representaciones de audio al espacio del modelo de lenguaje. La segunda etapa es un Qwen3-0.6B que recibe los embeddings de audio insertados en un prompt ChatML y genera la transcripción token a token. El runtime de LiteRT-LM trocea el PCM de 16 kHz en frames de 60 ms, ejecuta el codificador y entrega hasta 63 embeddings por ventana de 30,24 s.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la model card proporcionada. La innovación técnica destacable es el empaquetado en un único fichero LiteRT-LM con secciones separadas (`tf_lite_audio_encoder_hw`, `tf_lite_prefill_decode`, `tf_lite_embedder`, tokenizer y metadatos) que permite ejecutar el pipeline completo en CPU o GPU móvil (WebGPU/OpenCL) sin modificar el runtime ni el conversor. El modelo no incluye cabecera CTC ni timestamps, ya que el checkpoint no contiene pesos de decodificador CTC.

## Capacidades

- Transcripción de voz a texto extremo a extremo en chino, inglés y japonés.
- Soporte de dialectos chinos (7) y acentos regionales (26).
- Instrucciones de tarea en el prompt: transcripción por defecto (`语音转写：`), transcripción sin normalización inversa de texto (`语音转写，不进行文本规整：`) y transcripción forzada a un idioma (`语音转写成英文：`, etc.).
- Hotwords: lista de términos en el prompt para sesgar la transcripción hacia vocabulario específico (nombres propios, jerga técnica).
- Procesamiento de audio en ventanas de hasta 30,24 s por mensaje; el runtime trocea clips más largos.
- Ejecución en dispositivo (on-device) en CPU y GPU móvil mediante LiteRT-LM.
- No soporta timestamps ni alineación temporal.
- No soporta tool calling, agentes ni razonamiento multi-paso (es un modelo ASR, no un LLM conversacional general).

## Casos de uso

- Transcripción de reuniones y notas de voz en móvil: el bundle de 1,26 GB cabe en un dispositivo Android de gama alta y permite dictado offline en chino, inglés o japonés sin enviar audio a la nube, con ventanas de 30 s que el runtime segmenta automáticamente.
- Subtitulado de vídeo en producción: dividiendo el audio en fragmentos de 30 s en pausas naturales y usando una conversación nueva por fragmento, se obtiene una WER de 10/143 en el clip de prueba de 60,2 s, equivalente al modelo original.
- Atención al cliente con reconocimiento de vocabulario específico: el soporte de hotwords permite sesgar la transcripción hacia nombres de producto, marcas o términos técnicos del dominio, reduciendo errores en nombres propios.
- Aplicaciones de accesibilidad: dictado por voz en tiempo real en dispositivos edge para usuarios con movilidad reducida, con ejecución local que preserva la privacidad del audio.
- Transcripción multilingüe en centros de llamadas: el modelo cubre chino, inglés y japonés en un solo bundle, útil para entornos con clientes de los tres idiomas y despliegue en hardware sin GPU dedicada.
- Investigación en ASR en dispositivo: base reproducible para comparar cuantización int8/fp16 frente a la referencia fp32 en `funasr`, con métricas publicadas de WER y CER por idioma.
- Integración en apps móviles con LiteRT-LM: el formato `.litertlm` y las secciones separadas permiten cargar solo el encoder o el LM según el perfil de memoria del dispositivo.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 25 clips (5 de ejemplo del modelo y 20 de LibriSpeech dev-clean, 448 palabras), decodificación greedy, una conversación por clip, encoder en CPU:

| Runtime | Backend LM | Texto idéntico a referencia | WER inglés |
|---|---|---|---|
| Referencia: `funasr` 1.4.16, fp32 PyTorch | — | — | 4,46 % (20/448) |
| LiteRT-LM 0.17.1 (Python), Apple M4 Max | CPU | 21/25 | 4,24 % (19/448) |
| LiteRT-LM 0.17.1 (Python), Apple M4 Max | GPU (WebGPU sobre Metal) | 24/25 | 4,46 % (20/448) |
| LiteRT-LM v0.16.1 CLI, Galaxy S26 (SM-S942Q) | CPU | 21/25 | 4,46 % (20/448) |
| LiteRT-LM v0.16.1 CLI, Galaxy S26 (SM-S942Q) | GPU (OpenCL) | 24/25 | 4,46 % (20/448) |

Resultados en FLEURS test (50 clips por idioma, mismas condiciones):

| Idioma | Métrica | Bundle (Mac CPU) | Referencia (`funasr` fp32) |
|---|---|---|---|
| Inglés | WER | 5,48 % | 5,13 % |
| Mandarín | CER | 6,86 % | 6,86 % |
| Japonés | CER | 6,81 % | 6,95 % |

Pruebas adicionales: con encoder y LM en fp32 el runtime iguala la referencia en 25/25 clips, por lo que las diferencias se atribuyen a la cuantización. Con instrucción sin normalización inversa, 20 clips de LibriSpeech dieron WER 17/448 frente a 16/448 de la referencia, con 16 de 20 transcripciones idénticas. Con hotwords en un clip de LibriSpeech, la WER bajó de 10/68 a 8/68 (referencia: 11/68 a 6/68).

## Requisitos de hardware

- VRAM/RAM estimada: el bundle ocupa 1,26 GB en disco; en ejecución cabe holgadamente en dispositivos con 2-3 GB de RAM libre.
- Desglose de memoria por sección: encoder de audio 473 MB, LM int8 621 MB, tabla de embeddings int8 159 MB, tokenizer 2,1 MB.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU de Apple M4 Max y en GPU móvil (WebGPU sobre Metal, OpenCL en Galaxy S26).
- Cabe en GPU de consumo: sí, cualquier GPU con más de 2 GB de VRAM puede alojar el bundle; también en CPU sin aceleración.
- Opciones de despliegue: LiteRT-LM (Python 0.17.1, CLI v0.16.1); el modelo base original se ejecuta con `funasr` 1.4.16 en PyTorch fp32.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Fun-ASR-Nano-2512 (este bundle) | LM 0,6 B + encoder SAN-M | 30,24 s por mensaje | zh, en, ja | Apache-2.0 | `.litertlm` |
| FunAudioLLM/Fun-ASR-Nano-2512 (original) | LM 0,6 B + encoder SAN-M | No disponible | zh, en, ja | Apache-2.0 | safetensors/PyTorch |
| Whisper (variantes pequeñas) | No disponible en la información | No disponible | Multilingüe | MIT (según variante) | safetensors, GGUF, etc. |
| Qwen3-ASR | No disponible en la información | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con Whisper u otros modelos ASR en la información proporcionada; la comparación se limita a la referencia fp32 del mismo modelo.

## Limitaciones y advertencias

- Ventana de audio fija de 30,24 s por mensaje: clips más largos se trocean por el runtime y, si no se separan en conversaciones nuevas, el modelo solo transcribe la primera ventana (WER 83/143 en un clip de 60,2 s frente a 10/143 al dividirlo).
- Enviar dos fragmentos como dos turnos de una misma conversación provoca repetición del inicio del primero (WER 22/143).
- Sin timestamps: el checkpoint no incluye pesos de decodificador CTC, por lo que no hay rama CTC ni alineación temporal.
- La cuantización int8 introduce diferencias menores frente a fp32: grafías de apellidos, puntuación en dos clips y kana en el ejemplo coreano.
- El encoder toma la longitud del clip del último sample no nulo, por lo que el silencio digital al final se trata como padding.
- Se recomienda PCM WAV mono a 16 kHz; la decodificación MP3 del runtime difiere del texto obtenido con WAV decodificado por ffmpeg en 3 de 5 muestras oficiales.
- El modelo cubre chino, inglés y japonés; no se garantiza calidad en otros idiomas.
- Riesgo de alucinación y sesgos: no documentado en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia del modelo base y de los datos de entrenamiento originales.

## Enlaces

- Hugging Face del bundle: https://huggingface.co/litert-community/Fun-ASR-Nano-2512
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Repositorio FunASR: https://github.com/modelscope/FunASR (referenciado como `funasr` 1.4.16 en la model card)
