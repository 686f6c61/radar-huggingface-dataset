# litert-community/VibeVoice-ASR-BitNet

## Resumen

VibeVoice-ASR-BitNet es un modelo de reconocimiento automático del habla (ASR) desarrollado por Microsoft, del que esta ficha cubre la conversión a formato LiteRT-LM publicada por la comunidad litert-community para su ejecución en dispositivos. El modelo combina los tokenizadores acústico y semántico σ-VAE de la familia VibeVoice (que convierten audio a 24 kHz en 7,5 tramas latentes por segundo) con un modelo de lenguaje con la forma de Qwen2.5-1.5B entrenado con pesos ternarios BitNet b1.58. El resultado es un sistema audio-a-texto de extremo a extremo que transcribe directamente la señal de audio sin extracción de características en el host.

La relevancia de esta variante reside en su orientación a inferencia en el borde: el archivo `.litertlm` empaqueta codificador de audio, embedder y grafo de prefill/decode en un único fichero de 1,98 GB, con pesos del LM almacenados como ternarios exactos en bloques int4 de 128 elementos y embeddings en int8. Está pensado para ejecutarse con el runtime LiteRT-LM de Google en teléfonos Android y equipos de escritorio con GPU, con cifras medidas de 51,2 tokens/s de decodificación en una Galaxy S26 tras un prefill de 1.024 tokens.

El modelo es multilingüe (inglés, chino, francés, italiano, coreano, portugués y vietnamita), se distribuye bajo licencia MIT y está disponible en Hugging Face con 355 descargas y 4 likes en el momento de la consulta. Su caso de uso principal es la transcripción local, privada y de baja latencia en dispositivos sin conexión a servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM con forma Qwen2.5-1.5B con pesos ternarios BitNet b1.58 + tokenizadores σ-VAE acústico y semántico (24 kHz → 7,5 tramas latentes/s) + codificador de audio |
| Parametros totales | no disponible (el modelo base se describe como de forma Qwen2.5-1.5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s en el codificador) |
| Tipos de cuantizacion | LM: pesos ternarios por tensor almacenados como int4 blockwise-128 (exacto), embeddings int8; codificador de audio: lineales int8 dinámicas, convoluciones fp32 |
| Idiomas soportados | en, zh, fr, it, ko, pt, vi |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en formato original de Microsoft |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de VibeVoice-ASR: un par de tokenizadores σ-VAE (acústico y semántico) que comprimen audio a 24 kHz en 7,5 tramas latentes por segundo, alimentando un modelo de lenguaje con la forma de Qwen2.5-1.5B. La innovación clave de esta variante es el entrenamiento del LM con pesos ternarios BitNet b1.58, lo que reduce drásticamente el coste de almacenamiento e inferencia manteniendo la calidad de transcripción. El codificador de audio opera sobre ventanas de 30 segundos.

La conversión a LiteRT-LM reescribe el grafo de prefill/decode para GPU sin modificar ningún peso (actualización del 17 de noviembre de 2026). El fichero resultante tiene 1,98 GB repartidos en prefill/decode (793 MB), embedder (237 MB) y codificador de audio (951 MB). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Transcripción de audio a texto de extremo a extremo en un único fichero, sin extracción de características en el host.
- Entrada de audio en contenedores y frecuencias de muestreo habituales (wav, mp3, flac), con remuestreo interno a 24 kHz.
- Reconocimiento multilingüe en inglés, chino, francés, italiano, coreano, portugués y vietnamita.
- Procesamiento de clips de hasta 30 segundos por ventana del codificador de audio.
- Decodificación greedy determinista (top_k=1, temperature=0.0) adecuada para transcripción reproducible.
- Ejecución en CPU o GPU para el LM, con el codificador de audio obligatoriamente en CPU.
- No se documentan capacidades de tool calling, agentes, visión ni audio bidireccional.

## Casos de uso

- Transcripción local en dispositivos móviles: la variante LiteRT-LM permite transcribir notas de voz directamente en un Android de gama alta sin enviar audio a la nube, con 51,2 tokens/s de decodificación en GPU según las mediciones del autor.
- Subtitulado y actas de reuniones: con ventanas de 30 segundos y prompts que incluyen la duración del clip, el modelo genera transcripciones con WER en torno al 2,5-3 % en LibriSpeech, adecuadas para actas automáticas en inglés.
- Aplicaciones de accesibilidad: dictado por voz en tiempo real en el dispositivo para usuarios con movilidad reducida, aprovechando el TTFT de 134 ms en Mac Studio M4 Max y 430 ms en Galaxy S26.
- Asistentes de voz sin conexión: integración en aplicaciones de campo o entornos sin red donde la privacidad del audio es crítica, al no requerir servicios externos.
- Procesamiento por lotes de archivos de audio multilingües: transcripción de colecciones en inglés, chino, francés, italiano, coreano, portugués o vietnamita en estaciones de trabajo con GPU Apple Silicon.
- Prototipado de pipelines ASR en el borde: validación de latencia y precisión antes de desplegar en hardware empotrado, usando el runtime LiteRT-LM y el formato `.litertlm` como unidad de despliegue.

## Benchmarks y rendimiento

Precisión medida en 20 clips de LibriSpeech dev-clean (448 palabras, 2-29 s), decodificación greedy, prompt del vendedor con la duración del clip, WER tras mayúsculas y eliminación de puntuación:

| Configuracion | WER |
|---|---|
| Referencia PyTorch fp32 (LM ternarizado, latentes deterministas) | 2,68 % (12/448) |
| LiteRT-LM 0.16.1, Apple M4 Max, CPU | 2,68 % (12/448), transcripciones idénticas a la referencia |
| LiteRT-LM 0.16.1, Apple M4 Max, LM en GPU Metal, audio en CPU | 2,46 % (11/448) |
| LiteRT-LM 0.16.1 CLI, Galaxy S26 (SM-S942Q, Snapdragon SM8850), CPU | 3,12 % (14/448) |
| LiteRT-LM 0.16.1 CLI, Galaxy S26, LM en GPU OpenCL, audio en CPU | 2,46 % (11/448) |
| Sin frase de duración en el prompt | 3,57 % |

Microsoft reporta 2,41 % en el conjunto completo LibriSpeech test-clean con su runtime VibeASR.cpp.

Rendimiento medido (fichero anterior, edge-compat, 2026-09-04):

| Plataforma | Backend | Decode | Prefill | TTFT |
|---|---|---|---|---|
| Galaxy S26, LiteRT-LM 0.16.1 | GPU | 36,1 tok/s | 653 tok/s | 430 ms |
| Galaxy S26, LiteRT-LM 0.16.1 | CPU | 35,4 tok/s | 163 tok/s | 1,65 s |
| Mac Studio M4 Max, LiteRT-LM 0.16.0 | GPU | 138,6 tok/s | 2.045 tok/s | 134 ms |

Con el fichero actualizado (2026-11-17), en Galaxy S26 con GPU y LiteRT-LM v0.19.0 se alcanzan 51,2 tokens/s tras un prefill de 1.024 tokens, frente a 46,7 tokens/s del fichero anterior.

## Requisitos de hardware

- Tamaño del artefacto: 1,98 GB en formato `.litertlm` (prefill/decode 793 MB, embedder 237 MB, codificador de audio 951 MB).
- VRAM/RAM estimada: no se publica una cifra explícita; el tamaño del fichero sugiere que cabe en dispositivos con al menos 2-3 GB de memoria disponible para el modelo.
- GPU recomendadas: GPU integradas de smartphones de gama alta (Snapdragon SM8850 en Galaxy S26) y GPU Apple Silicon (M4 Max); no se documentan requisitos para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en el sentido de que está diseñado para GPU móviles y Apple Silicon; no hay datos para GPU de escritorio NVIDIA.
- Opciones de despliegue: runtime LiteRT-LM (versiones 0.16.1 a 0.19.2 probadas; el fichero actual solo se ha ejecutado con 0.19.0-0.19.2), API Python `litert-lm-api` y CLI de LiteRT-LM.
- Restricción de backend: el codificador de audio debe ejecutarse en CPU (`audio_backend`); el LM puede ir en CPU o GPU.
- Latencia y throughput: TTFT de 134 ms en Mac Studio M4 Max GPU y 430 ms en Galaxy S26 GPU; decodificación de 51,2 tok/s en Galaxy S26 GPU con el fichero actual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| VibeVoice-ASR-BitNet (LiteRT-LM) | forma Qwen2.5-1.5B, ternario | ventana de audio de 30 s | 7 idiomas | MIT | `.litertlm`, LiteRT-LM |
| microsoft/VibeVoice-ASR-BitNet | forma Qwen2.5-1.5B, ternario | no disponible | 7 idiomas | MIT | pesos originales, runtime VibeASR.cpp |
| Whisper (variantes de OpenAI) | no disponible en la informacion | no disponible | multilingüe | MIT | varios formatos, múltiples runtimes |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada más allá del WER de referencia de Microsoft (2,41 % en test-clean).

## Limitaciones y advertencias

- El codificador de audio debe ejecutarse en CPU; no se ha validado su ejecución en GPU.
- El fichero actualizado solo se ha probado con LiteRT-LM 0.19.0 a 0.19.2; versiones anteriores no fueron probadas con él.
- Diferencias numéricas menores entre plataformas: en Android CPU se observó un cambio de una palabra respecto a Mac ("On" → "Under"), atribuido a la aritmética int8 dinámica en Arm.
- Incluir la frase de duración en el prompt mejora la precisión (2,46-3,12 % frente a 3,57 % sin ella).
- Ventana de audio limitada a 30 segundos por el codificador; clips más largos requieren segmentación.
- No se documentan sesgos conocidos ni tasas de alucinación específicas en la información disponible.
- La licencia MIT permite uso comercial, pero debe verificarse la procedencia y condiciones del modelo base de Microsoft.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo exclusivamente ASR.
- El recuento de errores en CPU con LiteRT-LM 0.19.2 (18/448, 4,02 %) difiere del de la tabla con 0.16.1 (12/448); el autor no identifica la causa de la discrepancia.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/VibeVoice-ASR-BitNet
- Modelo base: https://huggingface.co/microsoft/VibeVoice-ASR-BitNet
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Registro de compatibilidad edge-compat: https://github.com/john-rocky/edge-compat/blob/main/cards/vibevoice-asr-bitnet/CARD.md
