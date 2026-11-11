# openmartdev/AwakenFullDuplex-Qwen3Omni

## Resumen

Awaken FullDuplex-Qwen3Omni es un modelo de dialogo hablado en duplex completo (full-duplex) construido sobre Qwen3-Omni-30B-A3B-Instruct. Lo desarrolla AveraLabs (publicado en Hugging Face bajo la organizacion openmartdev) y resuelve un problema concreto: conseguir que un sistema de voz pueda escuchar y hablar a la vez, ceder el turno cuando el usuario interrumpe, retomarlo y emitir backchannels (asentimientos verbales), sin necesidad de entrenar sobre cientos de miles de horas de audio.

La innovacion principal es de eficiencia de datos: el LLM multimodal base se mantiene congelado y solo se entrenan 97,4M de parametros adicionales (LoRA de atencion, adaptador de audio de usuario, capa de fusion de canales y embeddings de tokens de temporizacion). La adaptacion completa se realiza en un curriculum de cuatro etapas en unas 30 GPU-horas (30,5 en una NVIDIA B200). El resultado es un "thinker" que emite un token de texto cada 80 ms, con tokens de pausa, cesion (`SS`) e inicio (`SE`) en el mismo vocabulario, y un "talker" separado que convierte esos tokens en voz.

El modelo es relevante porque demuestra que el comportamiento de turn-taking a nivel de palabra puede aprenderse con decenas de miles de dialogos en lugar de millones de horas de habla, manteniendo el conocimiento del LLM intacto. Su pipeline es audio-to-audio y esta orientado a dialogos hablados en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Thinker-talker full-duplex sobre Qwen3-Omni-30B-A3B (LLM congelado + LoRA y adaptadores); reloj de trama de 80 ms |
| Parametros totales | 30B (modelo base) + 97,4M entrenados (13,4M LoRA de atencion, 75,5M adaptador de audio, 8,4M capa de fusion, 17 embeddings de tokens de timing) |
| Parametros activos | 3B (MoE del modelo base Qwen3-Omni-30B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | other (los pesos aun no tienen licencia decidida, segun la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El sistema sigue una arquitectura thinker-talker. Un encoder de codec congelado convierte la forma de onda del usuario en tokens de audio por trama; el thinker (Qwen3-Omni congelado mas modulos añadidos) lee esos tokens junto con su propio flujo de texto de agente en un formato de dos canales, con tokens de relleno, texto y control en un carril por trama, y extiende el texto un token por trama cada 80 ms. Una maquina de estados finitos enmascara tokens ilegales antes del muestreo, de modo que el modelo decide cada turno sin detector externo de actividad de voz. El talker lee el texto del agente y sus propios tokens de audio previos, emite la siguiente trama de audio y un decoder de codec congelado la convierte en forma de onda.

El entrenamiento del thinker se organiza en cuatro etapas con curriculum, partiendo siempre de la etapa anterior: (1) alineamiento de audio, entrenando solo el adaptador como lectura de reconocimiento de voz sobre 17.210 ventanas y luego por destilacion contra el LLM congelado; (2) temporizacion de pausas, añadiendo `PAD`, `EPAD` y 13 tokens de pausa con LoRA de rango 16 sobre 760 preguntas habladas de un turno; (3) turn-taking, añadiendo `SS` y `SE` y pasando al formato de dos canales mediante autodestilacion y reentrenamiento multi-turno sobre 12.146 dialogos; (4) barge-in y backchannel, con 36.621 dialogos con interrupciones inyectadas y luego 42.229 secuencias (esos dialogos mas 701 dialogos de backchannel repetidos ocho veces). Desde la etapa 3 se aplica un termino KL en posiciones de palabra para mantener el contenido cerca del modelo de partida. Los pesos del LLM, los embeddings de tokens y la cabeza de modelado de lenguaje permanecen congelados en todo el proceso. El talker se entrena por separado en una etapa supervisada de 2,65 horas en una B200 sobre 36.996 ejemplos de habla de dialogo sintetizada.

## Capacidades

- Dialogo hablado full-duplex: escucha y habla simultaneamente, con cesion de turno e interrupcion (barge-in).
- Turn-taking a nivel de palabra: pausas, cesiones (`SS`) e inicios (`SE`) como tokens del vocabulario, decididos cada 80 ms.
- Backchannel: emision de asentimientos verbales durante el turno del usuario.
- Generacion de habla a partir de texto del agente mediante el talker y codec de audio.
- Comprension de audio de entrada (speech-to-speech, pipeline audio-to-audio).
- Hereda las capacidades del LLM base Qwen3-Omni-30B-A3B-Instruct, aunque la adaptacion se centra en dialogo hablado en ingles.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Asistentes de voz conversacionales en tiempo real: el modelo puede mantener dialogos hablados con interrupciones naturales y cesion de turno cada 80 ms, adecuado para interfaces de voz donde el usuario espera respuesta inmediata sin pulsar botones.
- Atencion al cliente telefonica: gestiona barge-in y backchannel, de modo que el agente virtual puede dejar hablar al cliente, asentir y responder sin cortes bruscos, mejorando la naturalidad frente a sistemas por turnos.
- Sistemas de tutoria o compania conversacional: el backchannel frecuente (0,073 por segundo en Full-Duplex-Bench v1.0) permite simulaciones de escucha activa en entornos educativos o de acompanamiento.
- Pruebas de usabilidad de interfaces de voz: sirve como banco de pruebas para evaluar latencia de respuesta y turn-over en escenarios de solapamiento, gracias a su comportamiento medido en Full-Duplex-Bench v1.5.
- Investigacion en dialogo hablado: al mantener el LLM congelado y entrenar solo 97,4M de parametros, es una base reproducible para estudiar adaptacion data-efficient a full-duplex con unas 30 GPU-horas.
- Prototipos de agentes de voz embebidos en flujos de llamada: el pipeline audio-to-audio y el reloj de 80 ms permiten integrarlo en pipelines de telefonia o VoIP que requieran baja latencia de respuesta.
- Evaluacion de modelos de voz en tareas de groundedness: sus resultados en InteractionBench (53% de groundedness) lo hacen util para comparar estrategias de anclaje conversacional en dialogos largos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Awaken | Mejor alternativo open source |
|---|---|---|---|
| Full-Duplex-Bench v1.0 | Turn-over rate al pausar el usuario | 0,170 | 0,584 |
| Full-Duplex-Bench v1.0 | Backchannel por segundo | 0,073 | no disponible |
| Full-Duplex-Bench v1.5 | Latencia de respuesta en escenarios de solapamiento | la mas baja entre sistemas open source | no disponible |
| InteractionBench | Groundedness | 53% | 35% |
| InteractionBench | Coherencia | 47 | no disponible |
| InteractionBench | Tareas habladas | 26% | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base es de 30B parametros totales con 3B activos (MoE), por lo que en precision completa requiere del orden de decenas de GB y en cuantizaciones de 4-8 bits podria reducirse sustancialmente, aunque no se documentan cuantizaciones publicadas.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA B200; para inferencia se recomienda hardware de clase datacenter (A100, H100, B200) por el tamano del modelo base.
- Cabe en GPU de consumo: no confirmado; con 30B parametros totales, solo seria viable en GPUs de consumo con cuantizacion agresiva y no hay datos publicados al respecto.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible; el repositorio incluye codigo en GitHub.
- Latencia y throughput: el reloj de trama es de 80 ms (un token de texto por trama); no se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Full-duplex | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Awaken FullDuplex-Qwen3Omni | 30B totales / 3B activos + 97,4M entrenados | no disponible | Si, a nivel de palabra | other (pendiente) | Hugging Face, 0 descargas |
| Qwen3-Omni-30B-A3B-Instruct (base) | 30B totales / 3B activos | no disponible | No (por turnos) | segun Qwen | Hugging Face |
| Otros sistemas full-duplex open source de Full-Duplex-Bench | no disponible | no disponible | Si | no disponible | no disponible |

La model card compara con sistemas full-duplex open source en Full-Duplex-Bench e InteractionBench, pero no identifica por nombre a los competidores ni detalla sus parametros o licencias.

## Limitaciones y advertencias

- Licencia sin decidir: la model card indica explicitamente que la licencia de los pesos aun no esta determinada, lo que impide garantizar uso comercial.
- Solo ingles: el unico idioma declarado es `en`; no hay soporte multilingue documentado.
- Dependencia del modelo base: hereda sesgos y limitaciones de Qwen3-Omni-30B-A3B-Instruct, incluido el riesgo de alucinacion del LLM subyacente.
- Alcance acotado: la adaptacion se centra en turn-taking y dialogo hablado; no se documentan capacidades de tool calling, agentes o vision en esta variante.
- Datos de entrenamiento sinteticos en el talker: el talker se entrena sobre habla de dialogo sintetizada, lo que puede introducir artefactos o falta de naturalidad en dominios no cubiertos.
- Sin benchmarks de texto publicados: no hay datos de MMLU, HumanEval o GSM8K para esta variante.
- Madurez temprana: 0 descargas y 0 likes en el momento de la ficha; el repositorio se creo y actualizo el mismo dia (2026-11-11), lo que sugiere un lanzamiento reciente sin validacion externa.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones muy largas mas alla de lo reportado en InteractionBench.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openmartdev/AwakenFullDuplex-Qwen3Omni
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Project page / blog: https://avera-labs.github.io/AwakenFullDuplex-Qwen3Omni/
- Codigo en GitHub: https://github.com/avera-labs/AwakenFullDuplex-Qwen3Omni
- Web de AveraLabs: https://averalabs.com/
- Referencias arXiv citadas en los tags: arxiv:2503.04721, arxiv:2507.23159, arxiv:2611.02430 (no se dispone de titulo ni contenido en la informacion proporcionada)
