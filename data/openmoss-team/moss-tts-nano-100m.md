# OpenMOSS-Team/MOSS-TTS-Nano-100M

## Resumen

MOSS-TTS-Nano-100M es un modelo de síntesis de voz (text-to-speech) multilingüe de código abierto desarrollado por OpenMOSS-Team (MOSS AI). Con tan solo 0,1 mil millones de parámetros, está diseñado específicamente para generación de voz en tiempo real, con la particularidad de que puede ejecutarse directamente en CPU sin necesidad de GPU, lo que simplifica enormemente el despliegue en entornos locales, servidores web y productos ligeros.

El modelo emplea una arquitectura puramente autorregresiva basada en un tokenizador de audio combinado con un LLM, y produce audio nativo a 48 kHz en estéreo (2 canales). Soporta 20 idiomas, entre ellos el español, y ofrece clonación de voz con gestión automática de textos largos mediante troceado. Su enfoque prioriza el tamaño reducido, la baja latencia y una calidad suficiente para productos en tiempo real por encima de la máxima fidelidad posible.

Su relevancia actual radica en que democratiza la síntesis de voz de calidad en hardware modesto: la generación en streaming puede funcionar en una CPU de 4 núcleos, lo que lo convierte en una opción práctica para integraciones donde el coste de GPU sería prohibitivo. La licencia Apache 2.0 facilita además su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autorregresiva pura: Audio Tokenizer + LLM |
| Parametros totales | 0,1B (100M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (soporta texto largo mediante troceado automático) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 20: zh, en, de, es, fr, ja, it, he, ko, ru, fa, ar, pl, pt, cs, da, sv, hu, el, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (custom_code); no se especifican safetensors ni GGUF |
| Formato de audio de salida | 48 kHz, 2 canales |
| Tamano del repositorio | 0,7 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

MOSS-TTS-Nano sigue una arquitectura puramente autorregresiva compuesta por dos piezas: un tokenizador de audio (MOSS-Audio-Tokenizer-Nano, publicado como modelo separado) que convierte la señal de audio en tokens discretos, y un LLM de pequeño tamaño que modela la secuencia de tokens de audio condicionada por el texto de entrada y, en modo clonación, por un audio de referencia. La generación es en streaming, lo que permite emitir audio con baja latencia desde los primeros tokens.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal. Las características técnicas destacadas que sí documenta el autor son el soporte nativo de audio a 48 kHz estéreo, la inferencia en streaming sobre CPU de 4 núcleos y el troceado automático para clonación de voz con textos largos.

## Capacidades

- Síntesis de voz multilingüe en 20 idiomas, incluido el español (es).
- Clonación de voz a partir de un audio de referencia (modo principal recomendado por el autor).
- Generación de audio nativo a 48 kHz y 2 canales.
- Inferencia en streaming con baja latencia en tiempo real y primer audio rápido.
- Procesamiento de textos largos mediante troceado automático con clonación de voz.
- Ejecución en CPU sin GPU (streaming en CPU de 4 núcleos).
- Despliegue local mediante script Python (`infer.py`), demo web (`app.py`) y CLI empaquetada (`moss-tts-nano generate` y `moss-tts-nano serve`).
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá de la referencia de clonación.

## Casos de uso

- Lectura de artículos y contenido web: el modelo convierte texto largo en audio mediante troceado automático, adecuado para sistemas de accesibilidad o podcasts generados dinámicamente sin infraestructura de GPU.
- Asistentes de voz en tiempo real: la generación en streaming con primer audio rápido permite respuestas habladas de baja latencia en aplicaciones de conversación, ejecutables en servidores sin GPU.
- Clonación de voz para locuciones personalizadas: a partir de un audio de referencia, se puede generar narración con una voz concreta para vídeos, audiolibros o formación corporativa.
- Demos web y prototipado rápido: el repositorio incluye `app.py` y una CLI con subcomando `serve`, lo que permite levantar un servicio TTS local en minutos para validar productos.
- Atención al cliente automatizada con voz: integrado en un pipeline de IVR o chatbot, el modelo puede sintetizar respuestas en el idioma del usuario (20 idiomas) en hardware de bajo coste.
- Localización de contenido multimedia: al soportar 20 idiomas, permite doblar o generar pistas de voz en varios idiomas desde un mismo texto, con clonación opcional de la voz original.
- Sistemas embebidos y edge computing: su tamaño de 0,1B y su funcionamiento en CPU de 4 núcleos lo hacen viable en dispositivos o entornos con recursos limitados donde no cabe un modelo TTS mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está diseñado para ejecutarse en CPU, por lo que la inferencia en streaming no requiere GPU.
- GPU recomendadas: no se especifican; el autor indica que la generación en streaming funciona en una CPU de 4 núcleos.
- Compatibilidad con GPU de consumo: no disponible (no se documentan requisitos de GPU porque el caso objetivo es CPU).
- Opciones de despliegue: scripts Python del repositorio (`infer.py`, `app.py`), CLI empaquetada (`moss-tts-nano generate`, `moss-tts-nano serve`), y despliegue como Hugging Face Space. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: se describe baja latencia en tiempo real y primer audio rápido, pero no se publican cifras concretas.
- Entorno: Python 3.12 recomendado; dependencia de `WeTextProcessing` (con alternativa de instalación manual vía `pynini`).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoría.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Ejecucion en CPU |
|---|---|---|---|---|---|
| MOSS-TTS-Nano-100M | 0,1B | no disponible | 20 | Apache 2.0 | Sí (streaming en 4 núcleos) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo; al ser un TTS multilingüe, es esperable que la calidad varíe entre idiomas, pero no se aportan datos al respecto.
- Riesgo de alucinación en el sentido de prosodia o pronunciación incorrecta en textos ambiguos, siglas o dominios especializados; no se cuantifica.
- La información sobre longitud de contexto, cuantización y formato de pesos es limitada, lo que dificulta planificar optimizaciones de despliegue.
- La clonación de voz conlleva riesgos de uso indebido (suplantación de identidad); la licencia Apache 2.0 no impone restricciones de uso, por lo que la responsabilidad ética y legal recae en el integrador.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar las licencias de las dependencias del repositorio (por ejemplo, `WeTextProcessing` y `pynini`).
- No se publican benchmarks objetivos de calidad (MOS, WER, latencia medida), por lo que la evaluación de calidad debe hacerse de forma empírica antes de producción.
- El modelo está orientado a calidad "suficiente para tiempo real" según el autor; no está pensado para producciones de máxima fidelidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano-100M
- Modelo principal en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano
- Tokenizador de audio: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-TTS-Nano
- Demo online: https://openmoss.github.io/MOSS-TTS-Nano-Demo/
- Space de demo: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-TTS-Nano
- ModelScope: https://modelscope.cn/models/openmoss/MOSS-TTS-Nano
- Paper (arXiv 2603.18090): https://arxiv.org/abs/2603.18090
- Paper adicional (arXiv 2602.10934): https://arxiv.org/abs/2602.10934
- Web de MOSS AI: https://www.moss-ai.com/models/moss-tts-nano
- OpenMOSS: https://openmoss.ai/
- Twitter/X: https://x.com/Open_MOSS
- Discord: https://discord.gg/Xf3aXddCjc
- OpenClaw Skills: https://clawhub.ai/luogao2333/moss-tts-voice
