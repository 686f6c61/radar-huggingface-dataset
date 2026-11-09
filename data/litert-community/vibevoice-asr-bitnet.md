# litert-community/VibeVoice-ASR-BitNet

## Resumen

VibeVoice-ASR-BitNet es un modelo de reconocimiento automático del habla (ASR) desarrollado originalmente por Microsoft y convertido al formato LiteRT-LM por la comunidad litert-community para su ejecución en dispositivos de borde. Se trata de la variante de borde de VibeVoice-ASR, en la que el modelo de lenguaje con forma de Qwen2.5-1.5B se entrena con pesos ternarios BitNet b1.58, lo que reduce drásticamente el coste computacional y de memoria manteniendo una calidad de transcripción competitiva.

El modelo integra en un único paquete el codificador de audio y el decodificador de texto: recibe audio directamente (wav, mp3, flac), lo remuestrea a 24 kHz, lo procesa mediante los tokenizadores acústico y semántico σ-VAE (7,5 tramas latentes por segundo) y genera la transcripción con el LLM. Está pensado para inferencia totalmente local, sin extracción de características en el host, lo que lo hace adecuado para aplicaciones de ASR en móviles y equipos de sobremesa.

Es relevante ahora porque demuestra que un ASR multilingüe de calidad (WER del 2,46-3,12 % en LibriSpeech dev-clean) puede ejecutarse en un smartphone con un rendimiento de 36 tok/s en decodificación, con licencia MIT y un tamaño de fichero de 1,98 GB. Soporta siete idiomas: inglés, chino, francés, italiano, coreano, portugués y vietnamita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM tipo Qwen2.5-1.5B con pesos ternarios BitNet b1.58 + codificador de audio σ-VAE (tokenizadores acústico y semántico) |
| Parametros totales | no disponible (el LM tiene forma de Qwen2.5-1.5B; el recuento exacto no se indica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana del codificador de audio de 30 s; presupuesto de KV de 2048 tokens (225 tokens por 30 s de audio + ~40 tokens de prompt) |
| Tipos de cuantizacion | LM: pesos ternarios por tensor almacenados como int4 blockwise-128 (exacto), embeddings int8; codificador de audio: lineales int8 dinámicos, convoluciones fp32 |
| Idiomas soportados | en, zh, fr, it, ko, pt, vi |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM); fichero de 1,98 GB |

## Arquitectura y entrenamiento

El modelo combina dos componentes. Por un lado, los tokenizadores σ-VAE acústico y semántico de VibeVoice-ASR convierten audio a 24 kHz en 7,5 tramas latentes por segundo. Por otro, un modelo de lenguaje con la forma de Qwen2.5-1.5B, entrenado con pesos ternarios BitNet b1.58, consume esas tramas y genera la transcripción. La conversión a LiteRT-LM empaqueta el decodificador de audio, el codificador de audio y el tokenizador en un único fichero, de modo que el runtime decodifica el clip, ejecuta el codificador y transcribe sin extracción de características en el host.

El fichero se organiza en secciones: prefill/decode de 793 MB, embedder de 237 MB y codificador de audio de 951 MB. La cuantización del LM es por tensor en ternario almacenado como int4 blockwise-128 (exacto), con embeddings int8; el codificador de audio usa lineales int8 dinámicos y convoluciones fp32 con ventana de 30 s. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Transcripción de voz a texto multilingüe en siete idiomas (en, zh, fr, it, ko, pt, vi).
- Entrada de audio directa en contenedores y frecuencias de muestreo habituales (wav, mp3, flac), con remuestreo interno a 24 kHz.
- Procesamiento de clips de hasta 30 s por ventana del codificador; los clips más largos se dividen en ventanas de 30 s sin solapamiento.
- Decodificación greedy (top_k 1) como modo recomendado, con parada en `<|im_end|>`.
- Ejecución totalmente en dispositivo: el codificador de audio corre en CPU y el LM puede ejecutarse en CPU o GPU.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio bidireccional.

## Casos de uso

- Transcripción de notas de voz en aplicaciones móviles: el modelo cabe en un fichero de 1,98 GB y alcanza 36,1 tok/s de decodificación en una Galaxy S26 con GPU, lo que permite transcribir clips cortos de forma local sin enviar audio a la nube.
- Subtitulado de reuniones y entrevistas: con ventanas de 30 s y un presupuesto de KV de 2048 tokens, se pueden procesar grabaciones por segmentos en un Mac Studio M4 Max con 138,6 tok/s de decodificación.
- Dictado multilingüe en herramientas de productividad: el soporte de siete idiomas permite cambiar de idioma de entrada sin modelos adicionales, útil en entornos corporativos internacionales.
- Asistentes de voz sin conexión: al no requerir extracción de características en el host ni conectividad, el modelo se integra en aplicaciones de borde con requisitos de privacidad estrictos.
- Indexación y búsqueda de archivos de audio: la transcripción local permite generar texto buscable de grabaciones almacenadas en el dispositivo antes de subir solo el texto.
- Prototipado de pipelines ASR en investigación: la licencia MIT y el formato LiteRT-LM facilitan la experimentación con decodificación greedy y la comparación de WER frente a la referencia PyTorch fp32.
- Accesibilidad: transcripción en tiempo real de conversaciones presenciales en un teléfono, con latencia de primer token de 430 ms en GPU móvil.

## Benchmarks y rendimiento

Precisión medida en 20 clips de LibriSpeech dev-clean (448 palabras, 2-29 s), decodificación greedy, prompt del proveedor, WER tras mayúsculas y eliminación de puntuación:

| Configuración | WER |
|---|---|
| Referencia PyTorch fp32 (LM ternarizado, latentes deterministas) | 2,68 % (12/448) |
| LiteRT-LM 0.16.1, Apple M4 Max, CPU | 2,68 % (12/448), transcripciones idénticas a la referencia |
| LiteRT-LM 0.16.1, Apple M4 Max, LM en GPU Metal, audio en CPU | 2,46 % (11/448) |
| LiteRT-LM 0.16.1 CLI, Galaxy S26 (SM-S942Q, Snapdragon SM8850), CPU | 3,12 % (14/448) |
| LiteRT-LM 0.16.1 CLI, Galaxy S26, LM en GPU OpenCL, audio en CPU | 2,46 % (11/448) |
| Sin frase de duración en el prompt (mismo conjunto) | 3,57 % |

Microsoft reporta 2,41 % en el conjunto completo LibriSpeech test-clean con su runtime VibeASR.cpp.

Rendimiento de `litert-lm benchmark` (litert-lm 0.16.0, Apple M4 Max, `-p 256 -d 256 --runs 3 --cache no`, solo LM):

| Backend | Prefill (256) | Decode | TTFT | Init |
|---|---|---|---|---|
| GPU (Metal) | 2045 tok/s | 138,6 tok/s | 0,13 s | 1,4 s |
| CPU | 357 tok/s | 59,3 tok/s | no disponible | no disponible |

Mediciones en dispositivo: Galaxy S26 con LiteRT-LM 0.16.1 y GPU: decodificación 36,1 tok/s, prefill 653 tok/s, TTFT 430 ms, 1243 operaciones delegadas. Galaxy S26 con CPU: decodificación 35,4 tok/s, prefill 163 tok/s, TTFT 1,65 s. El codificador de audio tiene un coste fijo de 1,3-1,7 s por ventana de 30 s en CPU del M4 Max a 8 hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| VibeVoice-ASR-BitNet (LiteRT-LM) | LM tipo Qwen2.5-1.5B, ternario | ventana de 30 s, KV 2048 | 7 | MIT | `.litertlm` |
| microsoft/VibeVoice-ASR-BitNet (original) | LM tipo Qwen2.5-1.5B, ternario | no disponible | 7 | MIT | pesos originales |
| Whisper (variantes de OpenAI) | no disponible en la información proporcionada | no disponible | no disponible | MIT | safetensors, GGUF, etc. |

No se dispone de datos de benchmarks comparativos con modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- La ventana del codificador es de 30 s; los clips más largos se dividen sin solapamiento, lo que reinicia el contexto en cada frontera. Una ventana de 10 s empeoró el WER en 1,6 puntos porcentuales en el conjunto de prueba.
- El codificador de audio debe ejecutarse en CPU (`audio_backend`); solo el LM puede ir en GPU.
- Enviar el audio sin la frase de duración en el prompt degrada el WER del 2,68 % al 3,57 % en el conjunto evaluado.
- Diferencias numéricas en Arm: la fila de CPU en Android difiere de la de Mac en un clip por un cambio de precisión int8 dinámico.
- La evaluación de precisión se limita a 20 clips de LibriSpeech dev-clean en inglés; no se han publicado resultados por idioma para zh, fr, it, ko, pt y vi.
- No se documentan sesgos conocidos ni tasas de alucinación en la información disponible.
- La licencia MIT permite uso comercial, pero el modelo base y el runtime LiteRT-LM pueden tener condiciones propias que conviene revisar.
- El fichero de 1,98 GB y el coste fijo del codificador de audio (1,3-1,7 s por ventana de 30 s en CPU) condicionan la latencia en despliegues de borde.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/VibeVoice-ASR-BitNet
- Modelo base: https://huggingface.co/microsoft/VibeVoice-ASR-BitNet
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Ficha de compatibilidad en borde: https://github.com/john-rocky/edge-compat/blob/main/cards/vibevoice-asr-bitnet/CARD.md
