# hoskasii/nano

## Resumen

MOSS-TTS-Nano es un modelo de generacion de voz (text-to-speech) multilingue de tamano reducido desarrollado por MOSI.AI y el equipo OpenMOSS. Con aproximadamente 68,5 millones de parametros segun los pesos en safetensors del repositorio (la model card indica 0,1B), esta disenado para sintesis de voz en tiempo real y puede ejecutarse directamente en CPU sin necesidad de GPU, lo que simplifica su despliegue en demos locales, servicios web y productos ligeros.

El modelo emplea una arquitectura puramente autorregresiva basada en un tokenizador de audio combinado con un LLM (Audio Tokenizer + LLM), y produce audio nativo a 48 kHz en dos canales. Soporta 20 idiomas, incluyendo castellano, ingles, chino, aleman, frances, japones, italiano, coreano, ruso, arabe, portugues y otros, lo que lo posiciona como una alternativa compacta para aplicaciones de voz multilingues.

Su relevancia actual radica en la combinacion de huella minima, inferencia en streaming con baja latencia y soporte para clonacion de voz con chunking automatico en textos largos. Todo ello bajo licencia Apache 2.0, lo que facilita su adopcion tanto en prototipos como en integraciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autorregresiva pura (Audio Tokenizer + LLM) |
| Parametros totales | 68.492.544 (los pesos safetensors); la model card indica 0,1B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; tag `custom_code`) |
| Idiomas soportados | 20: zh, en, de, es, fr, ja, it, he, ko, ru, fa, ar, pl, pt, cs, da, sv, hu, el, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `custom_code`) |

## Arquitectura y entrenamiento

MOSS-TTS-Nano se construye sobre una arquitectura puramente autorregresiva que combina un tokenizador de audio con un modelo de lenguaje. El tokenizador de audio asociado, MOSS-Audio-Tokenizer-Nano, se carga por defecto junto al modelo principal (`OpenMOSS-Team/MOSS-TTS-Nano` y `OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano`). La salida de audio es nativa a 48 kHz y 2 canales, un formato poco habitual en modelos TTS de este tamano.

El pipeline de inferencia esta optimizado para streaming, con baja latencia de tiempo real y generacion rapida del primer fragmento de audio. El modelo soporta entrada de texto largo mediante clonacion de voz con chunking automatico. No se ha proporcionado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de voz (text-to-speech) a partir de texto en 20 idiomas.
- Salida de audio nativa a 48 kHz estereo.
- Clonacion de voz a partir de muestras de referencia (el repositorio incluye `infer.py` para este proposito).
- Procesamiento de textos largos mediante chunking automatico de la clonacion de voz.
- Inferencia en streaming con baja latencia y generacion rapida del primer audio.
- Ejecucion en CPU: la generacion en streaming puede funcionar en un procesador de 4 nucleos.
- Soporte de tres formas de uso: script Python (`infer.py`), demo web local (`app.py`) y CLI empaquetada (`moss-tts-nano generate` y `moss-tts-nano serve`).
- Capacidades de vision, audio de entrada, tool calling o razonamiento multi-paso: no disponibles (el modelo es exclusivamente TTS).

## Casos de uso

- Lectura de articulos y documentos: el modelo puede convertir texto largo en audio gracias al chunking automatico de la clonacion de voz, util para accesibilidad o podcasts generados.
- Asistentes de voz en tiempo real: su inferencia en streaming y baja latencia permiten integrarlo en interfaces conversacionales donde el primer audio debe emitirse casi de inmediato.
- Clonacion de voz personalizada: con `infer.py` se puede generar voz a partir de muestras del usuario, aplicable a audiolibros o locuciones personalizadas.
- Servicio web de sintesis: mediante `moss-tts-nano serve` o `app.py` se puede exponer un endpoint HTTP para generar audio bajo demanda en aplicaciones web.
- Despliegue en dispositivos sin GPU: al poder ejecutarse en CPU de 4 nucleos, encaja en servidores modestos, entornos edge o portatiles sin acelerador dedicado.
- Localizacion multilingue de contenido: con 20 idiomas soportados, permite generar versiones de audio en castellano, ingles, aleman, arabe, japones, etc., para cursos o materiales formativos.
- Prototipado rapido de producto de voz: la licencia Apache 2.0 y la instalacion simple (pip editable) reducen la friccion para validar ideas de producto de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas tipo MOS, WER o comparativas numericas frente a otros modelos TTS.

## Requisitos de hardware

- Inferencia en CPU: la generacion en streaming puede ejecutarse en un procesador de 4 nucleos, sin GPU.
- Tamano del repositorio: 2,7 GB, lo que da una idea del espacio en disco necesario para los pesos y artefactos.
- VRAM estimada: no disponible; al poder correr en CPU, en GPU el requisito seria reducido (modelo de ~68,5 M de parametros), pero no se proporciona una cifra oficial.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Viabilidad en GPU de consumo: no disponible, aunque por el tamano del modelo es plausible que quepa en GPUs de consumo; no confirmado por el autor.
- Opciones de despliegue: scripts Python (`infer.py`, `app.py`) y CLI empaquetada (`moss-tts-nano generate`, `moss-tts-nano serve`); tambien existe una demo en Hugging Face Spaces. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se proporcionan cifras concretas; la model card afirma baja latencia en tiempo real y primera generacion de audio rapida.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos que permitan una comparacion objetiva frente a otras alternativas TTS de tamano similar.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo ni sobre el dataset de entrenamiento.
- Riesgo de alucinacion o artefactos de audio: no evaluado en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la procedencia de los datos de entrenamiento del tokenizador y del modelo base.
- Requiere `custom_code` y la instalacion manual de dependencias (por ejemplo, WeTextProcessing y pynini) segun la model card, lo que anade complejidad al despliegue.
- La longitud de contexto no esta especificada; el manejo de textos largos depende del chunking automatico.
- No se documentan limitaciones concretas por idioma, aunque el soporte declarado es de 20 lenguas.
- Las fechas del repositorio (creado y actualizado en octubre de 2026) y los identificadores arXiv (2603.18090, 2602.10934) no coinciden con fuentes verificables de forma independiente; conviene contrastarlos antes de citarlos.

## Enlaces

- HuggingFace (repositorio consultado): https://huggingface.co/hoskasii/nano
- HuggingFace (modelo oficial del equipo): https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano
- ModelScope: https://modelscope.cn/models/openmoss/MOSS-TTS-Nano
- Blog MOSI.AI: https://mosi.cn/#models
- Paper (arXiv 2603.18090): https://arxiv.org/abs/2603.18090
- Paper (arXiv 2602.10934): https://arxiv.org/abs/2602.10934
- Demo online: https://openmoss.github.io/MOSS-TTS-Nano-Demo/
- Hugging Face Space: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-TTS-Nano
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-TTS-Nano.git
- AI Studio (demo): https://studio.mosi.cn/experiments/moss-tts-nano
- Documentacion de API: https://studio.mosi.cn/docs/moss-tts-nano
- Twitter / X: https://x.com/Open_MOSS
- Discord: https://discord.gg/Xf3aXddCjc
- Skill OpenClaw: https://clawhub.ai/luogao2333/moss-tts-voice
