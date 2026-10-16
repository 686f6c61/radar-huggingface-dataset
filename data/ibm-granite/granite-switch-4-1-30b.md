# ibm-granite/granite-switch-4.1-30b

## Resumen

Granite Switch 4.1 30B es un modelo de lenguaje modular publicado por IBM (organización `ibm-granite`) que compone un modelo base denso, dos adaptadores aLoRA y un codificador de voz dentro de un único checkpoint servible desde un solo endpoint. El modelo base es `ibm-granite/granite-4.1-30b`, con 30.000 millones de parámetros y 128K tokens de contexto; sobre él se montan el adaptador `decision` (decisiones generales) y el adaptador `guardian-core` (detección de riesgos de seguridad), más el codificador de reconocimiento automático de voz `granite-speech-5.0-470m-turboctc` de 470M parámetros.

El problema que resuelve es la fragmentación de despliegues: en lugar de levantar un servidor de chat, otro de clasificación de decisiones, otro para moderación de seguridad y otro para transcripción de audio, el modelo expone las cuatro funciones a través de la misma API compatible con OpenAI. Los adaptadores se activan bajo demanda mediante tokens de control en la plantilla de chat, de modo que una sola instancia puede alternar entre generación de lenguaje natural, decisiones etiquetadas, evaluación de riesgos y transcripción de voz sin cambiar la forma de invocación.

Es relevante porque combina tres componentes que habitualmente se sirven por separado (LLM, adaptadores especializados y ASR) en un único artefacto con licencia Apache 2.0, lo que simplifica la infraestructura de inferencia. El checkpoint ocupa 60 GB en el repositorio, está publicado en formato safetensors para Transformers y declara compatibilidad tanto con HuggingFace Transformers como con vLLM. La fecha de publicación indicada en la model card es el 14 de octubre de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base transformer denso con adaptadores aLoRA (activated LoRA) y codificador ASR conformer CTC no autorregresivo acoplado en cascada |
| Parametros totales | 29.989.814.272 (29,99B) según safetensors; el modelo base aporta 30B y el codificador de voz 470M |
| Parametros activos | No aplica (no es un modelo MoE; el base es denso y los adaptadores son LoRA) |
| Longitud de contexto | 128K tokens (heredada de `ibm-granite/granite-4.1-30b`) |
| Tipos de cuantizacion | No disponible en la información proporcionada; el repositorio se distribuye en safetensors (60 GB) |
| Idiomas soportados | No disponible para el modelo base; el componente de audio soporta únicamente inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es modular y por composición. El núcleo es `ibm-granite/granite-4.1-30b`, un transformer denso de 30B parámetros y 128K de contexto. Sobre él se aplican dos adaptadores aLoRA (activated LoRA): `decision`, procedente de `granitelib-core-r1.0`, y `guardian-core`, procedente de `granitelib-guardian-r1.0`. El adaptador `decision` recibe un estado y una pregunta con opciones etiquetadas y devuelve, en una sola pasada forward, una distribución softmax de probabilidad sobre las etiquetas de las opciones, en lugar de generar texto libre. El adaptador `guardian-core` detecta riesgos de seguridad: daño, jailbreaking, lenguaje soez, violencia, contenido sexual, sesgo social y comportamiento poco ético.

El tercer componente es el codificador `granite-speech-5.0-470m-turboctc`, un modelo ASR conformer CTC no autorregresivo de 470M parámetros, en inglés, descrito en la model card como el modelo ASR más rápido de la OpenASR Leaderboard. La transcripción resultante se inserta en el contexto de chat en el lugar de la parte de audio, de modo que el LLM procesa texto. La propia model card advierte de que el codificador de voz y el LLM todavía no se han entrenado de forma conjunta y que no existe una proyección entrenada que los acople. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

El checkpoint se reproduce de forma determinista con la herramienta `granite-switch` mediante el comando `python -m granite_switch.composer.compose_granite_switch --base-model ibm-granite/granite-4.1-30b --adapters ibm-granite/granitelib-guardian-r1.0 ibm-granite/granitelib-core-r1.0 --include-adapters guardian-core decision --enable-audio --output ./granite-switch-4.1-30b`, donde `--include-adapters` descarta el resto de adaptadores que cada librería incluye.

## Capacidades

- Generación de texto conversacional en el endpoint de chat, con el contexto de 128K tokens del modelo base.
- Toma de decisiones etiquetadas: dado un estado y una pregunta con opciones, devuelve una distribución de probabilidad softmax sobre las etiquetas en una sola pasada forward.
- Detección de riesgos de seguridad mediante `guardian-core`: daño, jailbreaking, lenguaje soez, violencia, contenido sexual, sesgo social y comportamiento poco ético.
- Transcripción de voz a texto (speech-to-text) en el mismo endpoint, con el codificador Granite Speech 5.0 TurboCTC de 470M parámetros, únicamente en inglés.
- Activación de adaptadores bajo demanda mediante tokens de control en la plantilla de chat.
- Compatibilidad con la API de OpenAI para chat completions, incluidas entradas multimodales de audio (`input_audio` con WAV en base64).
- Capacidades multilingües: no disponibles en la información proporcionada; el componente de audio está limitado a inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión: no disponibles.

## Casos de uso

- Atención al cliente automatizada: una sola instancia atiende conversaciones multi-turno con hasta 128K tokens de contexto y, además, transcribe las notas de voz del usuario en el mismo endpoint, sin necesidad de un servidor ASR independiente.
- Enrutado y clasificación de decisiones: con el adaptador `decision` se pueden evaluar preguntas con opciones etiquetadas y obtener una distribución de probabilidad en una pasada, útil para enrutadores, sistemas de triaje o selección de políticas con umbral de confianza.
- Moderación y filtrado de contenido: el adaptador `guardian-core` permite clasificar entradas y salidas frente a daño, jailbreaking, violencia, contenido sexual y sesgo social antes de que lleguen al usuario final.
- Transcripción de audio en pipelines internos: reuniones, notas de voz o llamadas en inglés se transcriben con el codificador TurboCTC y el texto se incorpora directamente al contexto del chat para resumir, extraer acciones o responder preguntas.
- Asistentes internos con control de seguridad integrado: el mismo despliegue genera la respuesta y comprueba riesgos, lo que reduce el número de servicios y la latencia de red entre componentes.
- Sustitución de endpoints heterogéneos en producción: equipos que hoy mantienen por separado un servidor de chat, un clasificador y un servicio de ASR pueden consolidarlos en un único proceso servido con Transformers o vLLM y expuesto con la API de OpenAI.
- Evaluación de decisiones en investigación: el adaptador `decision` se puede usar para medir políticas de decisión sobre conjuntos etiquetados, como hace el propio autor con el subconjunto rápido del Decision Index (1.068 filas).

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden al adaptador `decision`, evaluado sobre el subconjunto rápido público del Decision Index (1.068 filas) con la puntuación de la edición v0.3. El autor indica que los resultados con el adaptador servido en local y con el adaptador servido tras un endpoint vLLM alojado difieren en unos 0,6 puntos, y muestra las cifras del servicio alojado. Las puntuaciones son sobre 100.

| Área | Puntuación |
|---|---|
| Overall | 50,1 |
| Knowledge | 32,4 |
| Language | 58,6 |
| Retrieval | 49,8 |
| Tools | 76,5 |
| Arts | 26,4 |

No se han publicado en la información disponible resultados de benchmarks de generación (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del número de parámetros (29,99B): en bf16/fp16 en torno a 60 GB (coincide con el tamaño del repositorio), en int8 en torno a 30 GB y en cuantización de 4 bits en torno a 16-18 GB. Son estimaciones derivadas del recuento de parámetros, no cifras publicadas por el autor.
- GPU recomendadas: para bf16 sin cuantizar se necesitan GPU de 80 GB, como A100 80GB o H100 80GB; para int8 una A100 40GB queda muy justa y es preferible una A100 80GB o dos GPU de 24 GB.
- Cabe en GPU de consumo: sí, en cuantización de 4 bits puede caber en una RTX 4090 de 24 GB; en bf16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: HuggingFace Transformers y vLLM son los backends declarados por el autor. Para audio se instala el extra `.[audio]`, que añade las dependencias de audio de vLLM. No se confirma soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| granite-switch-4.1-30b | 29,99B + 470M (ASR) | 128K | Decision Index overall 50,1 | Apache 2.0 | HuggingFace, Transformers y vLLM |
| granite-switch-4.1-8b | 8B (base) + 470M (ASR) | No disponible | No disponible | Apache 2.0 | HuggingFace; misma configuración de chat, decisiones, guardian y voz |
| granite-switch-4.1-30b-preview | 30B (base) | No disponible | No disponible | Apache 2.0 | HuggingFace; bundle completo de Granite Libraries sin audio |
| ibm-granite/granite-4.1-30b | 30B | 128K | No disponible | No disponible en la información proporcionada | HuggingFace; modelo base sin adaptadores ni audio |

## Limitaciones y advertencias

- El codificador de voz y el LLM no se han entrenado conjuntamente: no existe una proyección entrenada que los acople, según advierte la propia model card.
- El componente de audio es solo para inglés, produce salida en minúsculas y sin puntuación, y no admite control en tiempo de decodificación (decode-time steering).
- Las cifras de la Decision Index provienen del subconjunto rápido público (1.068 filas) en la edición v0.3, por lo que no deben extrapolarse a una evaluación completa.
- El rendimiento en Knowledge (32,4) y Arts (26,4) es notablemente bajo en comparación con Tools (76,5), lo que limita su uso en tareas de conocimiento factual o creativas sin verificación adicional.
- No se han publicado datos sobre sesgos del modelo base, tasas de alucinación ni comportamiento fuera de los adaptadores evaluados.
- El adaptador `guardian-core` es un clasificador de riesgos, no una garantía: puede producir falsos negativos y no sustituye a una revisión humana en despliegues sensibles.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los componentes derivados (`granitelib-core-r1.0`, `granitelib-guardian-r1.0` y `granite-speech-5.0-470m-turboctc`) por separado.
- Idiomas soportados por el modelo base: no disponible. No se debe asumir cobertura multilingüe sin validación previa.
- El repositorio ocupa 60 GB, lo que exige espacio en disco y ancho de banda considerables para descarga y despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ibm-granite/granite-switch-4.1-30b
- Blog de lanzamiento: https://huggingface.co/blog/ibm-granite/granite-switch-4-1
- Repositorio granite-switch: https://github.com/generative-computing/granite-switch
- Documentación de composición (BUILD.md, referenciada en la model card): https://huggingface.co/ibm-granite/granite-switch-4.1-30b/blob/main/BUILD.md
- Documentación de audio (docs/AUDIO.md): https://github.com/generative-computing/granite-switch/blob/main/docs/AUDIO.md
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-30b
- Variante 8B: https://huggingface.co/ibm-granite/granite-switch-4.1-8b
- Variante 30B preview: https://huggingface.co/ibm-granite/granite-switch-4.1-30b-preview
- Variante 8B preview: https://huggingface.co/ibm-granite/granite-switch-4.1-8b-preview
- Variante 3B preview: https://huggingface.co/ibm-granite/granite-switch-4.1-3b-preview
- Librería Guardian (guardian-core): https://huggingface.co/ibm-granite/granitelib-guardian-r1.0
- Librería Core (decision): https://huggingface.co/ibm-granite/granitelib-core-r1.0
- Modelo de voz: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- OpenASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
