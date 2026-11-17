# 0best/VoiceTut-TTS-GGUF

## Resumen

VoiceTut-TTS-GGUF es un paquete de pesos cuantizados en formato GGUF del modelo VoiceTut-TTS, un sistema de síntesis de voz (text-to-speech) especializado en árabe egipcio y en code-switching árabe-inglés dentro de la misma frase. El modelo original lo desarrolla mohammedaly22 y esta versión GGUF la publica el usuario 0best para su uso con el runtime audio.cpp, una implementación en C++ que elimina la dependencia de Python y de PyTorch. Se trata de un fine-tune de OmniVoice entrenado sobre aproximadamente 380 horas de audio de podcasts egipcios, lo que le confiere un registro conversacional natural y capacidad de clonación de voz zero-shot.

La relevancia de esta ficha radica en su empaquetado: cada archivo GGUF es autocontenido e incluye el generador VoiceTut, el tokenizador de audio de OmniVoice (sin modificar respecto al modelo base), los ficheros de configuración y la especificación de modelo de audio.cpp. Según los datos del autor, la versión Q8_0 ejecutada con audio.cpp y una compilación MMQ para GTX 16xx alcanza un RTF de 1,32, lo que supone hasta 6,6 veces más velocidad que el paquete oficial de PyTorch en la misma GPU, con un consumo de VRAM de aproximadamente 2,5 GB.

El modelo mantiene exactamente la misma arquitectura que OmniVoice, por lo que se ejecuta a través de la familia `omnivoice` de audio.cpp con todas sus rutas disponibles: clonación de voz, diseño de voz, streaming, troceado de texto largo y servidor. Está pensado para desarrolladores que necesiten integrar TTS de árabe egipcio en producción sin depender del stack de Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OmniVoice (fine-tune); misma arquitectura que el modelo base OmniVoice |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (1,26 GiB, recomendada) y F16 (1,53 GiB) |
| Idiomas soportados | ar (árabe), arz (árabe egipcio), en (inglés); code-switching ar-en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (autocontenido: generador, tokenizador de audio, tokenizador de texto, config y spec de audio.cpp) |

## Arquitectura y entrenamiento

VoiceTut-TTS es un fine-tune de OmniVoice, un modelo de síntesis de voz de la familia k2-fsa. La arquitectura es idéntica a la del modelo base, de modo que hereda su generador y su tokenizador de audio sin modificaciones; únicamente se ha reentrenado el generador sobre datos específicos de árabe egipcio. El entrenamiento se realizó sobre aproximadamente 380 horas de habla extraída de podcasts egipcios, lo que explica el registro coloquial y la naturalidad en conversación espontánea. No se dispone de información sobre el número total de tokens, la composición exacta del dataset ni sobre si se aplicaron etapas de RLHF o DPO.

La innovación técnica principal de este paquete no está en el modelo sino en el runtime: audio.cpp implementa la inferencia en C++ con backend CUDA (y Metal en macOS), incluyendo una compilación MMQ optimizada para tarjetas GTX 16xx que carecen de tensor cores. El modelo emplea un proceso de difusión con 32 pasos de inferencia por defecto y un guidance scale de 2,0, parámetros ambos ajustables desde la CLI. La clonación de voz es zero-shot y requiere únicamente un audio de referencia y su transcripción.

## Capacidades

- Generación de voz en árabe egipcio (arz) con entonación conversacional natural.
- Code-switching intra-frase entre árabe e inglés (por ejemplo, `عندي meeting بكرة`).
- Clonación de voz zero-shot a partir de un audio de referencia y su transcripción.
- Diseño de voz (voice design) mediante las rutas de la familia omnivoice.
- Streaming de audio con eventos por fragmento (`--mode streaming --out-dir chunks/`).
- Troceado de texto largo mediante `--text-chunk-size` para párrafos extensos.
- 17 voces de referencia integradas (Abdelrahman, Abdullah, Ahmed, Aly, Asmaa, Esraa, Essam, Hanan, Hossam, Kamal, Mohamed, Omar, Omnia, Sarah, Sayed, Yasmin y Zaki), utilizables como voces nombradas en el servidor.
- Servidor HTTP compatible con el endpoint `/v1/audio/speech` para integración vía API.
- Control de calidad y velocidad mediante `--num-inference-steps` (32 por defecto) y `--guidance-scale` (2,0 por defecto).

## Casos de uso

- **Atención al cliente en árabe egipcio**: el modelo puede generar respuestas habladas con registro coloquial egipcio, adecuado para usuarios que esperan un tono conversacional y no árabe estándar formal. El servidor HTTP permite integrarlo en un backend de IVR o chatbot de voz.
- **Doblaje y localización de contenido**: con clonación de voz zero-shot se puede preservar la identidad vocal de un presentador mientras se genera audio nuevo en árabe egipcio, útil para podcasts, vídeos formativos o audiolibros.
- **Asistentes de voz con code-switching**: en entornos profesionales egipcios es habitual mezclar árabe e inglés; el modelo genera frases como `عندي meeting بكرة` de forma natural, lo que encaja en asistentes para oficina y productividad.
- **Generación de audiolibros y prensa hablada**: gracias al troceado de texto largo (`--text-chunk-size 160`) y al streaming, se pueden procesar artículos o capítulos completos generando fragmentos de audio de forma incremental.
- **Prototipado rápido sin Python**: al ser un GGUF autocontenido ejecutable con audio.cpp, un equipo puede desplegar TTS en un servidor C++ o en una máquina con WSL2 sin instalar PyTorch ni gestionar entornos virtuales, reduciendo la superficie de dependencias.
- **Pruebas de accesibilidad en dispositivos modestos**: con un consumo de VRAM de aproximadamente 2,5 GB en Q8_0, el modelo cabe en GPUs de gama media e incluso en portátiles con GTX 1660 Ti, lo que permite validar experiencias de lectura en voz alta en hardware asequible.
- **Generación de voces sintéticas para vídeos cortos**: las 17 voces integradas permiten seleccionar un timbre concreto por nombre desde la API (`"voice": "Mohamed"`), lo que simplifica la producción de contenido en serie.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de velocidad (RTF, latencia y VRAM) sobre 16 frases en árabe egipcio (unos 75 s de audio), con 4 voces integradas, 32 pasos de difusión y guidance 2,0, en una GTX 1660 Ti Laptop de 6 GB bajo WSL2. No se han publicado resultados de benchmarks de calidad (MOS, WER, similitud de voz) en la información disponible.

| Runtime | Pesos | RTF global | Latencia media por frase | Párrafo de 22 s | vs. PyTorch por defecto | VRAM pico |
|---|---|---:|---:|---:|---:|---:|
| PyTorch `voicetut-tts` | fp16 (por defecto) | 8,68 | 40,8 s | 107,0 s | 1,0× | ~2,6 GB |
| PyTorch `voicetut-tts` | fp32 | 1,99 | 9,3 s | 24,4 s | 4,4× | ~3,9 GB |
| audio.cpp | F16 GGUF | 8,19 | 38,5 s | 97,3 s | 1,1× | ~2,5 GB |
| audio.cpp | fp32 (safetensors originales) | 2,16 | 10,2 s | 28,0 s | 4,0× | ~4,3 GB |
| audio.cpp | Q8_0 GGUF | 2,78 | 13,1 s | 37,2 s | 3,1× | ~2,5 GB |
| audio.cpp, build MMQ GTX 16xx | Q8_0 GGUF | 1,32 | 6,2 s | 20,0 s | 6,6× | ~2,5 GB |

Interpretación según el autor: en esa GPU, la configuración más rápida es audio.cpp con Q8_0 y la build MMQ, un 6,6× más rápida que el paquete PyTorch por defecto y un 1,5× más rápida que el mejor ajuste de PyTorch (fp32), con unos 1,4 GB menos de VRAM. El párrafo de 22 s se genera en 20 s, es decir, por debajo del tiempo real (RTF < 1,0). Las precisiones equivalentes rinden de forma parecida entre runtimes: audio.cpp fp32 queda a un ~8 % de PyTorch fp32, y F16 es lento en ambos porque la tarjeta no tiene tensor cores.

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 2,5 GB en Q8_0 y F16; unos 4,3 GB con fp32 sobre safetensors originales.
- **GPU recomendadas**: el autor valida en GTX 1660 Ti Laptop (6 GB, Turing). Para F16 conviene una GPU con tensor cores (generaciones Ampere o posteriores); en GTX 16xx F16 es lento.
- **Cabe en GPU de consumo**: sí; con Q8_0 cabe en tarjetas de 4 GB o más. Se recomienda la build MMQ en GTX 16xx para obtener el máximo rendimiento.
- **Opciones de despliegue**: audio.cpp (CLI `audiocpp_cli` y servidor `audiocpp_server`), con backends CUDA y Metal. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el modelo es de audio y depende de la familia omnivoice de audio.cpp.
- **Latencia y throughput**: RTF de 1,32 (Q8_0 + MMQ) y 2,78 (Q8_0 estándar) en GTX 1660 Ti Laptop; latencia media por frase de 6,2 s y 13,1 s respectivamente. En hardware superior no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|---|
| VoiceTut-TTS-GGUF (este) | no disponible | no disponible | ar, arz, en | apache-2.0 | GGUF / audio.cpp | Fine-tune de OmniVoice con ~380 h de podcasts egipcios; clonación zero-shot; 17 voces |
| VoiceTut-TTS (original) | no disponible | no disponible | ar, arz, en | apache-2.0 | safetensors / PyTorch (`voicetut-tts`) | Mismo modelo en precisión original; sirve de referencia de velocidad |
| OmniVoice (k2-fsa) | no disponible | no disponible | no disponible | no disponible | safetensors / PyTorch | Modelo base del que deriva VoiceTut; misma arquitectura y tokenizador de audio |

No se dispone de datos de benchmarks de calidad ni de especificaciones de parámetros y contexto para establecer una comparación cuantitativa con otras alternativas de TTS.

## Limitaciones y advertencias

- **Idioma de entrada obligatorio**: el autor indica que debe pasarse siempre `--language arz`; usar otro identificador puede degradar la calidad porque el modelo se entrenó con ese id.
- **Cobertura lingüística limitada**: está especializado en árabe egipcio e inglés; no se garantiza un rendimiento adecuado en árabe estándar moderno ni en otros dialectos.
- **Sesgos**: al entrenarse con ~380 horas de podcasts egipcios, puede reproducir sesgos de género, registro y temática propios de ese corpus; no se documentan mitigaciones.
- **Alucinación y artefactos**: no se han publicado métricas de calidad (MOS, WER, similitud de locutor); en TTS los fallos se manifiestan como prosodia incorrecta, pronunciación errónea o artefactos, y no hay datos públicos que los cuantifiquen.
- **Clonación de voz**: requiere audio de referencia y su transcripción; su uso plantea riesgos de suplantación y obligaciones legales sobre consentimiento y derechos de imagen.
- **Licencia**: apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base OmniVoice y de los datos de entrenamiento originales antes de un despliegue en producción.
- **Madurez del paquete**: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el runtime audio.cpp es un proyecto independiente; conviene evaluar su estabilidad antes de integrarlo.
- **Rendimiento dependiente del hardware**: los datos de velocidad proceden de una única GPU (GTX 1660 Ti Laptop); en otras tarjetas el orden de magnitud puede variar, especialmente con F16 en GPUs sin tensor cores.

## Enlaces

- Repositorio Hugging Face de este paquete: https://huggingface.co/0best/VoiceTut-TTS-GGUF
- Modelo base VoiceTut-TTS: https://huggingface.co/mohammedaly22/VoiceTut-TTS
- Paquete GGUF del autor original: https://huggingface.co/mohammedaly22/VoiceTut-TTS-GGUF
- Runtime audio.cpp: https://github.com/0xShug0/audio.cpp
- Modelo base OmniVoice (k2-fsa): https://huggingface.co/k2-fsa/OmniVoice
- Demos de audio: https://mohammedaly22.github.io/VoiceTuT-TTS/
- ASR complementario QwenCleo-ASR-GGUF: https://huggingface.co/mohammedaly22/QwenCleo-ASR-GGUF
- Paquete PyTorch `voicetut-tts`: https://pypi.org/project/voicetut-tts/
