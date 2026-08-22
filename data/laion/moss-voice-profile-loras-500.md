# laion/moss-voice-profile-loras-500

## Resumen

`laion/moss-voice-profile-loras-500` es un repositorio de 500 adaptadores LoRA (PEFT) para el modelo de texto a voz `laion/moss-tts-local-transformer-4.55b-voice-acting-v2`, desarrollado por LAION. Cada adaptador, de rango 4 y un peso de aproximadamente 34 MB, confiere al modelo base congelado una identidad de voz sintética específica y estable, definida por un perfil de voz (diseño, referencia de audio y tarjeta de perfil). El conjunto resuelve el problema de la clonación de voz sin usar voces de personas reales: todas las identidades son inventadas y generadas sintéticamente.

El proyecto se apoya en un corpus generado automáticamente de unas 38 000 tomas por voz, filtrado con un embedder de voz ECAPA para seleccionar las tomas más fieles al perfil. La métrica de calidad reportada es la pérdida de lenguaje (nats) en datos de validación held-out: la mediana de ganancia sobre el modelo base es de 0,1571 nats, con un mínimo de 0,0751 y un máximo de 0,3150; los 500 adaptadores superan al modelo base. El repositorio incluye los clips de referencia y las tarjetas de perfil de cada voz, y está pensado para generar voces expresivas en inglés y alemán.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre `laion/moss-tts-local-transformer-4.55b-voice-acting-v2` |
| Parametros totales | 8 589 312 por adaptador (rango 4) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (TTS por tokens de audio) |
| Tipos de cuantizacion | No disponible (los pesos de los LoRA se publican en safetensors) |
| Idiomas soportados | en, de |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors, PEFT |

## Arquitectura y entrenamiento

El modelo base es un transformer de 4,55 mil millones de parámetros para TTS, condicionado por una referencia de audio y un codec de audio (`OpenMOSS-Team/MOSS-Audio-Tokenizer-v2`). Los adaptadores LoRA se entrenan sobre 23 módulos objetivo, con rango 4, alpha 8 y dropout 0,05. El entrenamiento se realiza en dos etapas, aunque esta release solo incluye los adaptadores de la etapa 1 (`stage = "stage1"`).

Cada perfil de voz se construye a partir de un diseño (nombre, género, edad, acento, registro, timbre, notas de casting) y una única referencia de audio. A partir de esa referencia se genera un corpus de tomas con 40 emociones, 57 dimensiones de VoiceNet, casos límite de interpretación, clústeres de personajes y ráfagas vocales, en inglés y alemán. Los adaptadores se ajustan sobre el subconjunto de tomas más similares a la referencia según un embedder ECAPA. La elección del rango 4 proviene de un estudio de ablación previo con 10 voces y 60 brazos de ablación (rango 4, 8 y 16) publicado en `TTS-AGI/moss-voice-profile-loras`.

## Capacidades

- Sintesis de voz con identidad de personaje estable y expresiva: emociones, entregas, ráfagas vocales y casos límite.
- Condicionamiento por referencia: el adaptador actúa sobre el modelo base congelado, que requiere un clip de referencia para producir la voz objetivo.
- Soporte multilingüe inglés y alemán, con frases pareadas para entrenar modelos de conversión voz a voz.
- Control de dimensiones de interpretación (VoiceNet) a través de adaptadores complementarios (por ejemplo, `laion/moss-voicenet-dimension-loras`).
- No es un modelo de conversación ni de tool calling: es un modelo de síntesis de voz.
- Los adaptadores son ligeros (34 MB) y compatibles con el ecosistema PEFT/Hugging Face.

## Casos de uso

- Audiolibros y narración con voces de personaje: se puede seleccionar un perfil (p. ej., «narrador documental grave») y generar la narración completa de un libro manteniendo la identidad de voz durante horas.
- Doblaje de contenido audiovisual: cada personaje de una serie o película puede tener su adaptador propio, permitiendo generar diálogos con la misma voz de forma consistente en inglés y alemán.
- Asistentes de voz personalizados: empresas pueden crear una voz de marca sintética, sin necesidad de grabar a una persona real, y desplegarla en IVR o asistentes virtuales.
- Generación de datos de entrenamiento para TTS: el corpus y los adaptadores permiten crear conjuntos de voz sintética con condiciones controladas (emoción, dimensión de VoiceNet, etc.) para entrenar modelos de voz a voz o de conversión de voz.
- Pruebas de producto y prototipado de UX: los equipos de producto pueden generar rápidamente voces para validar la experiencia de usuario en aplicaciones de voz sin esperar a la grabación de actores.
- Investigación en identidad de voz y interpretación: los 500 perfiles con tarjetas de diseño permiten estudiar cómo se comporta la voz sintética en distintas condiciones y qué dimensiones de VoiceNet son más robustas.

## Benchmarks y rendimiento

La información disponible no incluye resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque se trata de un modelo de TTS. La métrica reportada es la pérdida de lenguaje en tokens de audio MOSS (nats) sobre datos held-out, comparando el adaptador con el modelo base congelado:

| Métrica | Valor |
|---|---|
| Mediana de ganancia sobre base | 0,1571 nats |
| Mínimo de ganancia | 0,0751 nats |
| Máximo de ganancia | 0,3150 nats |
| Adaptadores que superan al base | 500 / 500 |

Además se menciona el uso de ECAPA para medir la similitud de la voz con la referencia, pero no se publican valores numéricos de ese métrica en la model card.

## Requisitos de hardware

- El modelo base tiene 4,55 B parámetros. En FP16, el modelo base requiere aproximadamente 9 GB de VRAM solo para los pesos; con cuantización de 8 bits se puede reducir a ~4,5 GB y con 4 bits a ~2,5 GB. Los adaptadores LoRA (34 MB) son despreciables en comparación.
- Se recomienda una GPU con al menos 8 GB de VRAM para inferencia en FP16 (por ejemplo, RTX 3070/4070 o superior). Para cuantización de 4 bits, una GPU de 6 GB puede ser suficiente.
- El despliegue se puede realizar con el ecosistema Hugging Face Transformers (PEFT), vLLM si se integra con el modelo base, o mediante herramientas de inferencia de TTS que soporten LoRA.
- La latencia no se especifica en la información disponible; dependerá del tamaño del modelo base, la longitud de la secuencia de audio y el hardware.
- No se reportan datos de throughput oficiales.

## Comparativa con modelos similares

| Modelo | Voces | Rango LoRA | Estado | Peso por adaptador | Notas |
|---|---|---|---|---|---|
| `laion/moss-voice-profile-loras-500` | 500 | 4 | Producción | ~34 MB | Incluye referencia y tarjeta de perfil |
| `TTS-AGI/moss-voice-profile-loras` | 10 | 4, 8, 16 (60 brazos) | Piloto / ablación | no disponible | No incluye clips de referencia |
| `laion/moss-voicenet-dimension-loras` | 100 (dimensiones) | 32 | Producción | no disponible | Adaptadores de dimensión de interpretación |

Los tres repositorios usan el mismo modelo base (`laion/moss-tts-local-transformer-4.55b-voice-acting-v2`) y el mismo codec, pero difieren en el propósito: el repositorio de 500 voces es la release de producción con perfiles completos; el piloto es un estudio de ablación de rango; el de dimensiones permite controlar ejes específicos de interpretación (por ejemplo, «más grave» o «más susurrado»).

## Limitaciones y advertencias

- No se ha realizado ninguna escucha humana controlada: todos los números de calidad son pérdida de lenguaje en tokens de audio y similitud de ECAPA, que son proxies, no medidas directas de «suena como la voz».
- El modelo es condicionado por referencia: sin clip de referencia, el adaptador produce una voz aleatoria con el color del adaptador; no existe un modo «sin referencia» útil.
- 8 de los 500 adaptadores están por debajo del punto de saturación medido, y 6 de ellos provienen de voces que el generador no clonó de forma fiable; se marcan en el manifiesto.
- Existe un bug de polaridad en el campo `caption_general` del corpus: el género y el ruido de fondo se representan con polaridad invertida, y aproximadamente el 35 % de las instrucciones de entrenamiento llevaban ese texto defectuoso. Se recomienda usar `card_gender` de `profile.json` en su lugar.
- Las voces son sintéticas e inventadas, no hay identidad real recuperable de los pesos, pero la licencia CC-BY 4.0 permite uso comercial con atribución.
- Para producción, se recomienda validar la calidad de voz con escucha humana en el dominio de uso, especialmente en los 8 adaptadores señalados como débiles.

## Enlaces

- [Repositorio Hugging Face: laion/moss-voice-profile-loras-500](https://huggingface.co/laion/moss-voice-profile-loras-500)
- [Modelo base: laion/moss-tts-local-transformer-4.55b-voice-acting-v2](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2)
- [Codec de audio: OpenMOSS-Team/MOSS-Audio-Tokenizer-v2](https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2)
- [Dataset de referencia: TTS-AGI/moss-voice-profile-references](https://huggingface.co/datasets/TTS-AGI/moss-voice-profile-references)
- [Repositorio piloto: TTS-AGI/moss-voice-profile-loras](https://huggingface.co/TTS-AGI/moss-voice-profile-loras)
- [Adaptadores de dimensión VoiceNet: laion/moss-voicenet-dimension-loras](https://huggingface.co/laion/moss-voicenet-dimension-loras)
- [GitHub: LAION-AI/moss-voice-profiles](https://github.com/LAION-AI/moss-voice-profiles)
- [Proyecto de evolución de LoRA VoiceNet: projects.laion.ai/moss-voicenet-lora-evolution](https://projects.laion.ai/moss-voicenet-lora-evolution/)
