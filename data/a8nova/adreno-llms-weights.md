# a8nova/adreno-llms-weights

## Resumen

El repositorio `a8nova/adreno-llms-weights` no contiene un modelo único, sino un conjunto de pesos en formato fp16 pre-convertidos para el proyecto [adreno-llms](https://github.com/a8nova/adreno-llms), un runtime de inferencia C++/OpenCL diseñado para ejecutar modelos de lenguaje pequeños en GPUs Adreno 6xx de teléfonos Android de gama media. Los binarios utilizan un layout personalizado generado por la herramienta NNOpt y no son compatibles con HuggingFace Transformers ni PyTorch.

El repositorio incluye 15 modelos distintos, desde LLMs puros (Mamba, SmolLM, Qwen) hasta modelos de audio (Whisper, Kokoro, MusicGen) y visión (Depth-Anything), todos optimizados para ejecución on-device. La relevancia actual radica en la creciente demanda de inferencia local en dispositivos móviles con recursos limitados, donde las GPUs Adreno son un objetivo habitual en Android. Los pesos están bajo licencia Apache 2.0 para los artefactos de conversión, pero cada modelo subyacente conserva su licencia original.

El repositorio ocupa 105.2 GB y fue creado en mayo de 2026, con actualización en agosto de 2026. No registra descargas ni likes en HuggingFace, lo que sugiere que es un recurso especializado para desarrolladores que trabajan con el runtime adreno-llms.

## Especificaciones tecnicas

Al tratarse de un repositorio múltiple, se presentan las características generales y la tabla de modelos incluidos.

| Parametro | Valor |
|---|---|
| Arquitectura | Multiple (Mamba, Transformer, SSM, etc.) |
| Parametros totales | Desde 25M hasta ~590M segun modelo |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende de cada modelo) |
| Tipos de cuantizacion | fp16 (binarios pre-convertidos) |
| Idiomas soportados | No disponible (depende de cada modelo) |
| Licencia | Apache 2.0 (artefactos de conversion); licencias originales de cada modelo |
| Formato de pesos | Binario personalizado (model.fp16.bin) + metadatos JSON |

### Modelos incluidos

| Modelo | Upstream | Parametros | Decode tok/s (Adreno 618) | Licencia upstream |
|---|---|---|---|---|
| mamba2-130m | state-spaces/mamba2-130m | 130M | 23.18 | Apache 2.0 |
| mamba-130m | state-spaces/mamba-130m-hf | 130M | 22.15 | Apache 2.0 |
| smollm2-135m-instruct | HuggingFaceTB/SmolLM2-135M-Instruct | 135M | 14.57 | Apache 2.0 |
| lfm2-5-350m-instruct | LiquidAI/LFM2.5-350M | 350M | 10.20 | Liquid AI Open License |
| qwen2-5-0-5b-instruct | Qwen/Qwen2.5-0.5B-Instruct | 500M | 8.45 | Apache 2.0 |
| whisper-tiny | openai/whisper-tiny | 39M | ASR (ver repo) | Apache 2.0 |
| kokoro-82m | hexgrad/Kokoro-82M | 82M | TTS (ver repo) | Apache 2.0 |
| musicgen-small | facebook/musicgen-small | ~590M | text→music (ver repo) | CC-BY-NC 4.0 |
| seamless-m4t-unity-small | facebook/seamless-m4t-unity-small | ~323M | S2ST/S2TT (ver repo) | CC-BY-NC 4.0 |
| openelm-270m-instruct | apple/OpenELM-270M-Instruct | 270M | 4.47 | Apple ASCL (solo archivos companion) |
| openvoice-v2 | myshell-ai/OpenVoiceV2 | ~32M | voice cloning (ver repo) | MIT |
| pocket-tts | kyutai/pocket-tts | ~100M | TTS (ver repo) | Gated upstream |
| moonshine-tiny | UsefulSensors/moonshine-tiny | ~27M | streaming ASR (ver repo) | MIT |
| depth-anything-v2-small | depth-anything/Depth-Anything-V2-Small-hf | ~25M | depth estimation (ver repo) | Apache 2.0 |
| stable-audio-open-small | stabilityai/stable-audio-open-small | ~341M | text→audio (ver repo) | Stability AI Community License |

## Arquitectura y entrenamiento

Este repositorio no contiene modelos entrenados, sino pesos pre-convertidos. Cada binario fue generado por NNOpt, un agente de codificacion que optimiza redes neuronales para targets embebidos Android. El proceso de conversion produce un layout de tensores personalizado que el runtime C++/OpenCL de adreno-llms consume directamente, sin pasar por el ecosistema PyTorch.

Los modelos subyacentes cubren varias arquitecturas: Mamba (SSM), SmolLM y Qwen (Transformer), LFM2.5 (arquitectura hibrida de Liquid AI), Whisper (encoder-decoder para ASR), Kokoro (TTS), MusicGen (autoregresivo con audio), etc. No se proporcionan detalles sobre el entrenamiento de estos modelos, ya que son los originales de cada upstream. La innovacion principal del repositorio es el formato de pesos y los kernels OpenCL optimizados para Adreno, no el entrenamiento.

## Capacidades

- **Generacion de texto**: modelos como SmolLM2-135M-Instruct, Qwen2.5-0.5B-Instruct y Mamba soportan generacion autoregresiva con instrucciones.
- **Reconocimiento de voz**: Whisper-tiny y Moonshine-tiny permiten ASR (incluido streaming en el caso de Moonshine).
- **Sintesis de voz**: Kokoro-82M y Pocket-TTS generan habla; OpenVoice-V2 permite clonacion de voz.
- **Traduccion y conversion de voz**: Seamless-M4T-Unity-Small soporta speech-to-speech y speech-to-text.
- **Generacion de musica y audio**: MusicGen-Small genera musica a partir de texto; Stable-Audio-Open-Small genera audio.
- **Estimacion de profundidad**: Depth-Anything-V2-Small produce mapas de profundidad a partir de imagenes.
- **Ejecucion on-device**: todos los modelos estan optimizados para GPUs Adreno 6xx en Android, sin conexion a internet.

## Casos de uso

- **Asistente de voz offline en moviles**: combinar Moonshine-tiny (ASR) + SmolLM2-135M-Instruct (respuesta) + Kokoro-82M (TTS) para un asistente completamente local en un telefono de gama media, con latencia aceptable gracias a las velocidades medidas en Adreno 618.
- **Traduccion de voz en tiempo real**: Seamless-M4T-Unity-Small permite traducir conversaciones habladas sin conexion, util para viajeros o entornos con privacidad estricta.
- **Generacion de musica personalizada en el dispositivo**: MusicGen-Small puede crear fragmentos musicales a partir de descripciones textuales, ideal para aplicaciones creativas sin depender de servicios en la nube.
- **Clonacion de voz para accesibilidad**: OpenVoice-V2 permite generar voces personalizadas para usuarios con discapacidad del habla, ejecutandose localmente para proteger la privacidad.
- **Asistente de codigo en terminales Android**: Qwen2.5-0.5B-Instruct puede integrarse en editores de codigo moviles para autocompletar o explicar fragmentos, con tool calling limitado por su tamano.
- **Estimacion de profundidad para fotografia computacional**: Depth-Anything-V2-Small puede alimentar efectos de desenfoque o realidad aumentada en aplicaciones de camara, sin enviar imagenes a servidores.
- **Transcripcion de reuniones en local**: Whisper-tiny transcribe audio en tiempo real en el dispositivo, adecuado para aplicaciones de notas de voz con privacidad garantizada.

## Benchmarks y rendimiento

Las unicas mediciones publicadas son las velocidades de decodificacion (decode tok/s) para los modelos de lenguaje, obtenidas en un Motorola Razr 2020 con GPU Adreno 618, con fp16, greedy decoding, 32 tokens generados y mediana de 5 ejecuciones (fecha: 2026-05-06). No se proporcionan resultados de benchmarks estandar como MMLU o HumanEval.

| Modelo | Decode tok/s (Adreno 618) |
|---|---|
| mamba2-130m | 23.18 |
| mamba-130m | 22.15 |
| smollm2-135m-instruct | 14.57 |
| lfm2-5-350m-instruct | 10.20 |
| qwen2-5-0-5b-instruct | 8.45 |
| openelm-270m-instruct | 4.47 |

Para los modelos de audio y vision, el repositorio remite a las mediciones en el README del proyecto GitHub, no incluidas en la informacion disponible.

## Requisitos de hardware

- **GPU**: Adreno 6xx (probado en Adreno 618 del Motorola Razr 2020). Compatible con Snapdragon y otros SoC con Adreno.
- **RAM**: no especificada, pero los modelos van de 25M a 590M parametros, por lo que caben en dispositivos con 4-6 GB de RAM.
- **Almacenamiento**: los binarios fp16 ocupan aproximadamente 2 bytes por parametro; por ejemplo, Qwen2.5-0.5B ocupa ~1 GB. El repositorio completo pesa 105.2 GB, pero solo se descargan los modelos necesarios.
- **Sistema operativo**: Android (el runtime se despliega via scripts de Android).
- **Opciones de despliegue**: el runtime C++/OpenCL de adreno-llms, con scripts de build y deploy para Android. No es compatible con vLLM, llama.cpp u Ollama.
- **Latencia**: las velocidades de decodificacion indican entre 4.5 y 23 tokens por segundo, suficientes para interacciones basicas pero no para chat en tiempo real con modelos grandes.

## Comparativa con modelos similares

No existe una comparativa directa con otras soluciones de inferencia en movil en la informacion proporcionada. Como referencia, se puede comparar con alternativas genericas:

| Solucion | Formato | GPU objetivo | Compatibilidad | Licencia |
|---|---|---|---|---|
| adreno-llms (este repo) | Binario fp16 personalizado | Adreno 6xx | Solo Android, runtime propio | Apache 2.0 (artefactos) |
| llama.cpp | GGUF | CPU/GPU (Vulkan, Metal, CUDA) | Multiplataforma | MIT |
| MLC-LLM | MLCEngine | Vulkan, Metal, CUDA | Multiplataforma | Apache 2.0 |
| ExecuTorch | .pte | CPU, NPU, GPU | Android/iOS | BSD-3-Clause |

La ventaja de adreno-llms es su optimizacion especifica para Adreno, que puede ofrecer mejor rendimiento que soluciones genericas en ese hardware, aunque a costa de un ecosistema cerrado y sin soporte para otros backends.

## Limitaciones y advertencias

- **No compatible con Transformers/PyTorch**: los binarios usan un layout propietario; solo funcionan con el runtime de adreno-llms.
- **Licencias mixtas**: aunque los artefactos de conversion son Apache 2.0, los pesos subyacentes tienen licencias que pueden restringir uso comercial (CC-BY-NC para MusicGen y Seamless-M4T, Stability AI Community License para Stable-Audio, Liquid AI Open License para LFM2.5, Apple ASCL para OpenELM).
- **OpenELM no esta completamente incluido**: solo se distribuyen archivos companion; el binario principal debe descargarse y convertirse localmente debido a restricciones de Apple.
- **Rendimiento limitado**: los modelos mas grandes (Qwen2.5-0.5B) alcanzan solo ~8.5 tok/s en Adreno 618, lo que puede resultar lento para aplicaciones interactivas.
- **Sin benchmarks de calidad**: no hay evaluaciones de MMLU, HumanEval u otras metricas, por lo que no se puede comparar la calidad de salida con los modelos originales.
- **Dependencia de NNOpt**: el proceso de conversion depende de una herramienta externa (NNOpt) con contacto por email, lo que puede ser un cuello de botella para ampliar el catalogo de modelos.
- **Sin soporte de cuantizacion adicional**: solo se ofrecen pesos fp16; no hay versiones int8 o int4, lo que limita el ahorro de memoria y ancho de banda.

## Enlaces

- Repositorio HuggingFace: [a8nova/adreno-llms-weights](https://huggingface.co/a8nova/adreno-llms-weights)
- Proyecto GitHub: [a8nova/adreno-llms](https://github.com/a8nova/adreno-llms)
- Modelos upstream (seleccion):
  - [state-spaces/mamba2-130m](https://huggingface.co/state-spaces/mamba2-130m)
  - [HuggingFaceTB/SmolLM2-135M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct)
  - [Qwen/Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct)
  - [openai/whisper-tiny](https://huggingface.co/openai/whisper-tiny)
  - [hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)
  - [facebook/musicgen-small](https://huggingface.co/facebook/musicgen-small)
  - [apple/OpenELM-270M-Instruct](https://huggingface.co/apple/OpenELM-270M-Instruct)
