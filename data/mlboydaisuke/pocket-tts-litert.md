# mlboydaisuke/Pocket-TTS-LiteRT

## Resumen

Pocket-TTS-LiteRT es una conversión del modelo de síntesis de voz Pocket TTS de Kyutai (~100M parámetros) a grafos `CompiledModel` de LiteRT, optimizados para ejecutarse en la GPU de teléfonos Android. El trabajo lo publica el usuario mlboydaisuke y reproduce fielmente el pipeline de referencia `pocket_tts`: un modelo de lenguaje autorregresivo sobre latentes continuos de Mimi, una cabeza de flow matching y un vocoder SEANet, todo ejecutado en el dispositivo sin conexión a la nube. La relevancia principal es que demuestra TTS neuronal de calidad en hardware móvil de consumo con latencias cercanas o superiores al tiempo real.

El modelo base, Pocket TTS, es un LM de flow matching sobre latentes Mimi de 32 dimensiones a 12,5 Hz. Esta versión LiteRT mantiene los pesos en fp16 y reorganiza la inferencia en grafos sin estado con orquestación en el host (Kotlin/Python), incluyendo gestión de caché KV, RoPE y ruido gaussiano fuera del grafo. El repositorio ocupa 1,1 GB e incluye los estados de prompt por voz publicados por Kyutai, reempaquetados para el layout de KV compactado.

La licencia es CC-BY-4.0 y el modelo solo soporta inglés. Está pensado para desarrolladores que quieran integrar TTS en aplicaciones Android nativas sin depender de servicios externos, con un compromiso explícito entre placement en GPU/CPU/NPU y fidelidad de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM autorregresivo causal (6 capas, 1024 de anchura) sobre latentes Mimi de 32 dims + cabeza de flow matching (AdaLN MLP de 6 bloques) + decoder Mimi (ConvTranspose x16, transformer de 2 capas, SEANet) |
| Parametros totales | ~100M (modelo de lenguaje) + ~20M (Mimi tiny) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de atención del decoder Mimi: campo receptivo apilado de 498 posiciones; bloques de 64 frames con solapamiento de 32) |
| Tipos de cuantizacion | fp16 (grafos LiteRT); pesos base en fp16 |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | LiteRT `CompiledModel` / TFLite (grafos), ficheros `pt_voice_*.bin` para estados de prompt por voz (fp16) |

## Arquitectura y entrenamiento

Pocket TTS es un modelo de flow matching sobre latentes continuos de Mimi a 12,5 Hz. Por cada frame, un transformer causal de 6 capas y 1024 de anchura condiciona un MLP AdaLN de 6 bloques que transforma una muestra gaussiana en el siguiente latente mediante un paso LSD (integración de un solo paso). Un Mimi diminuto de ~20M parámetros decodifica los latentes a audio de 24 kHz mediante upsampling ConvTranspose x16, un transformer de 2 capas y un decoder SEANet. La conversión a LiteRT reescribe numéricamente el modelo salvo una operación: erf-GELU se sustituye por un polinomio impar de tanh ajustado, con error máximo de 7,1e-5 (unas 15 veces más preciso que el tanh-GELU clásico). Las parejas intercaladas de RoPE se des-intercalan horneando una permutación de filas en la proyección QKV, lo que resulta bit-exacto porque q y k comparten la permutación.

No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni si hubo RLHF o DPO en la información proporcionada. La inferencia se organiza en cinco grafos: `pt_flowlm_fused` (frame AR completo con cabeza de flow en una sola invocación), `pt_flowlm_step` y `pt_flow_head` (variante dividida de referencia), `pt_mimi_dec_tx` (transformer decoder Mimi en bloques de 64 frames) y `pt_mimi_deconly` (SEANet en ventana única de 256 frames, causal). La orquestación en host incluye tokenizador sentencepiece unigram, lookup de embeddings en fp16, proyección 32→1024, cos/sin de RoPE por paso, caché KV con máscara aditiva, ruido gaussiano (std √0,3) y umbral EOS de −4. El texto se trocea a ≤50 tokens por límites de frase.

## Capacidades

- Síntesis de voz (text-to-speech) a 24 kHz en inglés, con voces predefinidas (alba, marius y otras incluidas en los ficheros `pt_voice_*.bin`).
- Ejecución completamente en dispositivo (GPU móvil Mali/Adreno/PowerVR, con posibilidad de repartir capas a CPU o NPU).
- Generación no en streaming: decodificación después de la generación completa.
- Troceado automático de texto largo en chunks de ≤50 tokens por límites de frase.
- No soporta tool calling, function calling, agentes, visión, audio de entrada ni modo thinking; es un modelo exclusivamente TTS.
- Multilingüe: no, solo inglés.

## Casos de uso

- Lectura por voz en aplicaciones Android: integración del grafo `pt_flowlm_fused` con orquestación Kotlin para leer notificaciones, artículos o mensajes sin conexión, aprovechando que todo el pipeline cabe en un teléfono de gama media-alta.
- Asistentes de accesibilidad: síntesis de voz local para usuarios con discapacidad visual, con privacidad total al no enviar texto a servidores externos y latencia cercana al tiempo real (1,0× en Pixel 8a, 5,0× en Snapdragon SM8850).
- Audiolibros y podcasts generados en dispositivo: el troceado a ≤50 tokens por frase permite procesar textos largos en chunks secuenciales manteniendo coherencia de voz mediante los estados de prompt por voz.
- Sistemas de navegación y avisos en tiempo real: indicaciones de voz generadas localmente con baja latencia, sin dependencia de red ni costes por petición.
- Prototipado de interfaces conversacionales: combinación con un ASR y un LLM pequeños en el mismo dispositivo para construir un asistente de voz totalmente local en Android.
- Investigación en TTS eficiente: banco de pruebas para estudiar el reparto de cómputo entre GPU, CPU y NPU en móvil, con métricas publicadas de fidelidad (correlación 0,997 en audio de pipeline libre frente a la referencia eager).
- Aplicaciones de lectura infantil o educativas: voces consistentes y offline en tablets y teléfonos sin necesidad de infraestructura de servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, al tratarse de un modelo TTS. Los datos de rendimiento medidos por el autor son los siguientes:

| Dispositivo | Placement | Utterance | Tiempo | Factor tiempo real |
|---|---|---|---|---|
| Pixel 8a (Tensor G3, Mali-G715) | LM + flow head + SEANet en GPU, decoder transformer en CPU | 8,8 s de audio | 8,75 s | ~1,0× |
| Samsung SM-S942Q (Snapdragon SM8850, Adreno) | Todo en GPU, grafos step + head divididos | 8,2 s de audio | 1,63 s | 5,0× |
| Samsung SM-S942Q (Snapdragon SM8850, Adreno) | Todo en GPU, 3 chunks | 13,0 s de audio | 3,05 s | 4,3× |
| Pixel 10 (Tensor G5, PowerVR), medición de @geneing | LM en CPU, decoder Mimi en NPU, SEANet en GPU | 28 prompt + 70 frames generados | 3,68 s | 1,53× |
| Pixel 10 (Tensor G5, PowerVR), medición de @geneing | Placement del autor (LM en GPU) | 28 prompt + 70 frames generados | 7,11 s | 0,79× |

Fidelidad de conversión frente a la referencia eager en fp32: paso flow-LM con correlación 1,000000 (máx. |d| 3,7e-6); flow head con máx. |d| 2,4e-7; bloques del decoder Mimi con correlación 1,000000 (máx. |d| 5,2e-4); decoder + SEANet con correlación 1,000000 (máx. |d| 2,0e-4); pipeline libre completo con correlación de audio 0,997 y mismo paso EOS.

## Requisitos de hardware

- VRAM/modelo en memoria: el repositorio ocupa 1,1 GB; los grafos en fp16 y los estados de prompt por voz requieren espacio adicional en memoria del dispositivo.
- GPU recomendadas: Mali-G715 (Pixel 8a), Adreno de Snapdragon SM8850, PowerVR de Tensor G5. En Pixel 8a el decoder transformer Mimi debe ir en CPU por degradación audible en GPU (HNR 0,9 dB en GPU frente a 2,8 dB en CPU).
- Cabe en GPU de consumo móvil; no se proporcionan datos para GPU de escritorio (RTX 4090, A100, H100) porque el objetivo es LiteRT en Android.
- Opciones de despliegue: LiteRT 2.1.6 con `CompiledModel` (requiere LiteRT ≥ 2.1.5 en Mali para las formas `FULLY_CONNECTED` del paso KV); orquestación en Kotlin o Python; tokenizador sentencepiece. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: en Pixel 8a el coste por paso está dominado por la subida de KV y el overhead de dispatch, no por aritmética; un paso del LM medido en Pixel 10 tarda 20,5 ms en CPU y 50,8 ms en GPU. El grafo `pt_mimi_deconly` no compiló para NPU en Pixel 10 (el plugin NPU falló).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Despliegue | Rendimiento |
|---|---|---|---|---|---|---|
| Pocket-TTS-LiteRT | ~100M LM + ~20M Mimi | no disponible | en | CC-BY-4.0 | LiteRT en Android (GPU/CPU/NPU) | 1,0×–5,0× tiempo real según dispositivo |
| kyutai/pocket-tts | ~100M LM + ~20M Mimi | no disponible | en | no disponible en la información | Referencia PyTorch (eager) | Referencia de fidelidad; sin cifras móviles |
| Mimi (kyutai) | ~20M (codec) | no disponible | no disponible | no disponible en la información | Diversos | Usado como decoder en este pipeline |
| Otros TTS en dispositivo | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para comparar con alternativas TTS de tamaño similar como Piper, Kokoro o VITS; se indica "no disponible".

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas, lo que limita su uso en aplicaciones multilingües.
- Sesgos: no se documentan sesgos específicos, pero al derivar de un modelo entrenado con datos no especificados, puede heredar sesgos de pronunciación, acento y prosodia.
- Riesgo de alucinación acústica: como modelo generativo, puede producir artefactos, ruido o pronunciaciones incorrectas, especialmente con texto fuera de distribución o signos de puntuación atípicos.
- Sin streaming: la decodificación se realiza después de la generación completa, lo que añade latencia inicial en utterances largas.
- Dependencia de hardware: el placement óptimo varía por dispositivo; en Pixel 8a el decoder transformer Mimi en GPU degrada la calidad de audio (HNR 0,9 dB frente a 2,8 dB en CPU) y en Pixel 10 el grafo SEANet no compila para NPU.
- Requiere LiteRT ≥ 2.1.5 en Mali para las formas del paso KV; versiones anteriores pueden fallar.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene revisar los términos del modelo base kyutai/pocket-tts, cuya licencia no se detalla en la información disponible.
- Los datos de rendimiento son puntos de medida únicos, no benchmarks; varían con dispositivo, temperatura y longitud del texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Pocket-TTS-LiteRT
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Discusión con mediciones en Pixel 10: https://huggingface.co/mlboydaisuke/Pocket-TTS-LiteRT/discussions/1
- Muestras de audio: https://huggingface.co/mlboydaisuke/Pocket-TTS-LiteRT/resolve/main/samples/alba_device.wav y https://huggingface.co/mlboydaisuke/Pocket-TTS-LiteRT/resolve/main/samples/marius_device.wav
- LiteRT (ai-edge-litert): no se proporciona URL en la información disponible
- Paper de Pocket TTS / Kyutai: no disponible en la información proporcionada
