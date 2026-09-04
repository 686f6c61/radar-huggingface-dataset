# bonelag/VieNeu-TTS-v3-Turbo

## Resumen

VieNeu-TTS v3 Turbo es un modelo de síntesis de voz (text-to-speech) de alta fidelidad que genera audio a 48 kHz, desarrollado por el autor Phạm Nguyễn Ngọc Bảo (también conocido como pnnbao97) y publicado en HuggingFace bajo el perfil bonelag. Está pensado para el vietnamita y el inglés, con soporte nativo de code-switching bilingüe, clonación de voz instantánea, control de emociones mediante etiquetas no verbales y generación por lotes para escenarios de podcast multi-locutor. El modelo se presenta como un diseño original entrenado desde cero, no como un fine-tune ni una adaptación de arquitecturas existentes, sobre aproximadamente 10.000 horas de habla inglés-vietnamita. Tiene un total de 130.907.520 parámetros (130,9 millones) y se distribuye en formato safetensors y ONNX. No se especifica una longitud de contexto porque se trata de un modelo TTS, no de un modelo de texto conversacional; su interacción se basa en entradas de texto y audio de referencia. La relevancia actual del modelo reside en su optimización para CPU sin dependencia de PyTorch mediante ONNX Runtime, lo que lo hace accesible para equipos de consumo, además de su capacidad de clonación de voz en tiempo real y streaming de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diseño original del autor; no se detalla públicamente. Según el instalador de GPU, combina un backbone Qwen3 con el codec de audio MOSS-Audio-Tokenizer-Nano. No es un modelo MoE. |
| Parametros totales | 130.907.520 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificado (modelo de síntesis de voz) |
| Tipos de cuantizacion | int8 (backbone por defecto en CPU) y fp32 (para máxima fidelidad) |
| Idiomas soportados | Vietnamita (vi) e inglés (en), con code-switching bilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura neuronal propietaria diseñada por el autor, que no es un fine-tune ni una destilación de ningún TTS previo. La información técnica disponible señala que el instalador en GPU referencia un "Qwen3 backbone + MOSS codec", lo que sugiere que el sistema emplea un modelo de lenguaje (backbone) para generar tokens de audio, los cuales son decodificados mediante el codec neural MOSS-Audio-Tokenizer-Nano, capaz de reproducir señales de 48 kHz. El preprocesamiento fonético corre a cargo del fonemizador sea-g2p, desarrollado también por el autor, que convierte texto vietnamita e inglés en representaciones grafema-fonema. El entrenamiento se realizó desde cero sobre un dataset propio, denominado pnnbao-ump/VieNeu-TTS-10k-ENVI, con aproximadamente 10.000 horas de habla inglesa y vietnamita. No se menciona el uso de RLHF ni de DPO.

## Capacidades

- Sintesis de voz de alta fidelidad a 48 kHz con 20 voces predefinidas que cubren las tres regiones de Vietnam (Norte, Central, Sur), incluyendo ambos géneros y varios perfiles de lectura.
- Clonacion de voz instantánea a partir de un clip de referencia de 3 a 8 segundos, con opción de denoising integrada. Funciona incluso en instalaciones CPU sin PyTorch.
- Code-switching bilingüe vietnamita-inglés, permitiendo alternar idiomas dentro de un mismo enunciado sin perder la identidad de la voz.
- Control de emociones y señales no verbales mediante etiquetas de texto como [cười] (reír), [thở dài] (suspirar) y [hắng giọng] (carraspear). Se describe como experimental.
- Streaming en tiempo real frame-by-frame, con primer audio en aproximadamente 300 ms y un ratio de tiempo real (RTF) inferior a 1 en CPU.
- Generacion por lotes (batched) para producir audio largo o podcasts con varios locutores en una sola pasada.
- Modo de conversación multi-locutor en la interfaz web, donde se pueden encadenar turnos de distintos hablantes.

## Casos de uso

- Podcasts multi-locutor: el modelo permite generar conversaciones entre voces predefinidas con distintas procedencias regionales y tonos emocionales, facilitando la producción de episodios completos sin necesidad de grabar a los locutores.
- Localizacion y doblaje de contenido audiovisual: su code-switching nativo entre inglés y vietnamita es útil para doblar material que combine ambos idiomas, manteniendo la voz del personaje de forma consistente.
- Asistentes de voz en tiempo real: gracias al streaming con RTF inferior a 1 y primer audio en ~300 ms, puede integrarse en aplicaciones de asistencia, chatbots vocales o sistemas de IVR para respuestas inmediatas.
- Audiolibros y narracion: la clonacion de voz permite reproducir la voz de un narrador concreto a partir de una muestra breve, y el control de emociones añade expresividad en pasajes de tensión o alegría.
- Accesibilidad: la sintesis de voz en vietnamita con 48 kHz resulta adecuada para lectores de pantalla, herramientas educativas y dispositivos de apoyo para personas con discapacidad visual.
- Creacion de contenido para redes sociales: la combinación de voces presets, clonacion y etiquetas emocionales permite generar clips de voz virales o material promocional sin equipos de grabación profesionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- CPU con ONNX Runtime es la vía recomendada para uso interactivo; la instalación mínima es torch-free, es decir, no requiere PyTorch.
- GPU NVIDIA con CUDA 12.8+ para el modo PyTorch, que ofrece batching automático y es útil en texto largo o síntesis por lotes.
- El modelo tiene 130,9 millones de parámetros; en fp32 ocuparía aproximadamente 524 MB y en int8 unos 131 MB, por lo que puede ejecutarse en GPU de consumo modestas, aunque no se publican datos oficiales de VRAM.
- Opciones de despliegue: SDK `vieneu` (PyPI), Web UI incluida en el repositorio, ONNX Runtime para CPU y PyTorch con batching para GPU. No aplican vLLM, llama.cpp, Ollama ni TGI al tratarse de un modelo TTS.
- Latencia estimada según el model card: primer audio en ~300 ms y RTF inferior a 1 en CPU. No se ofrecen cifras de throughput para GPU.

## Comparativa con modelos similares

No disponible. La informacion suministrada no incluye comparativas con otros modelos TTS.

## Limitaciones y advertencias

- No se han publicado benchmarks públicos ni evaluaciones independientes de calidad de voz.
- El control de emociones mediante etiquetas es marcado como experimental y puede producir resultados inestables.
- El modelo se encuentra en estado "early access" en el repositorio de GitHub, lo que implica que las APIs o comportamientos podrían cambiar sin previo aviso.
- La clonacion de voz genera riesgos éticos y legales si se utiliza sin el consentimiento explícito del hablante original.
- El rendimiento del code-switching y la pronunciación en inglés no está validado por organismos externos.
- Temperaturas altas pueden aumentar la expresividad pero también la inestabilidad en la salida, según indica el autor.
- La licencia Apache 2.0 permite uso comercial, pero los usuarios deben verificar los derechos sobre las voces clonadas y cumplir las normativas aplicables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bonelag/VieNeu-TTS-v3-Turbo
- Modelo del autor en HuggingFace: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo
- Repositorio GitHub: https://github.com/pnnbao97/VieNeu-TTS
- Paquete PyPI `vieneu`: https://pypi.org/project/vieneu/
- Tutorial de inicio: https://aiindigo.com/tutorials/getting-started-with-vieneu-tts-v3-turbo-high-speed-vietnamese-voice-synthesis
- Codec de audio MOSS-Audio-Tokenizer-Nano: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano
- Fonemizador sea-g2p: https://github.com/pnnbao97/sea-g2p
- Comunidad Discord: https://discord.gg/yJt8kzjzWZ
