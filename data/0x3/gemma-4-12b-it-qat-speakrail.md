# 0x3/gemma-4-12B-it-qat-Speakrail

## Resumen

Speakrail Gemma 4 12B es un adaptador LoRA (junto con 22 embeddings de tokens entrenados) que convierte el modelo Gemma 4 12B en su variante cuantizada QAT int4 de Google en un modelo de turn-taking full-duplex para asistentes de voz. Lo desarrolla el usuario 0x3 y forma parte del proyecto Speakrail, un asistente de voz full-duplex que se ejecuta en una única RTX 4090 junto a su reconocedor de voz (Voxtral Mini 4B Realtime + turn head) y su TTS (Breeze TTS 2).

A diferencia de un modelo de chat convencional, este adaptador lee las palabras del usuario tal y como las va escribiendo el reconocedor de voz, junto con señales de un cabezal de turn-taking, y tras cada evento de entrada emite un único token de decisión: hablar, seguir escuchando, interrumpir, quedarse en silencio o decir unas pocas palabras sin tomar el turno. Cuando decide hablar, genera la respuesta hablada, incluyendo llamadas a herramientas cuando es necesario, que se envía a un TTS en streaming.

El modelo no está pensado para funcionar fuera del arnés de Speakrail ni con otro STT distinto, ya que fue ajustado para los fallos específicos de Voxtral y espera tokens que el uso textual ordinario de Gemma no produce. Se distribuye bajo licencia Apache 2.0 y el repositorio contiene únicamente el adaptador (0,3 GB), no los pesos base de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4) con adaptador PEFT LoRA; rank 32, alpha 64, sobre todas las proyecciones de atención y MLP |
| Parametros totales | 12B en el modelo base (no disponible el desglose exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Base en int4 (QAT w4a16); adaptador en safetensors sin cuantizar |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors, token_rows.safetensors) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-4-12B-it-qat-w4a16-ct`, la variante de Gemma 4 12B con cuantización consciente del entrenamiento (QAT) a int4 en pesos y activaciones de 16 bits. El LoRA tiene rango 32 y alpha 64 y cubre todas las proyecciones de atención y MLP. Además del adaptador, se entrenaron 22 filas de embedding (ids 6-27, anchura 3840) que reutilizan huecos no usados del vocabulario de Gemma, de modo que el tamaño del vocabulario no cambia. El token de "hablar" es el propio token de fin de turno de Gemma `<turn|>` (id 106).

El modelo opera sobre un flujo de tokens en el que el arnés va añadiendo eventos: palabras del usuario según llegan, `<complete>` cuando el cabezal de turn-taking detecta que el usuario ha terminado, eventos de solapamiento mientras el asistente habla y una escalera de silencios `<sil:1s>` a `<sil:256s>`. Las decisiones son tokens únicos restringidos al conjunto permitido, por lo que cada decisión cuesta un solo forward pass (unos 30-60 ms en una RTX 4090). No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Gemma 4 12B.
- Turn-taking full-duplex: decide en cada evento si hablar (`<turn|>`), seguir escuchando (`<listen>`), mantenerse en silencio porque el usuario lo pidió (`<listen_muted>`), interrumpir (`<interrupt>`), continuar hablando tras un backchannel (`<continue>`) o ceder el turno (`<yield>`).
- Interjecciones breves (`<interject>` … `</interject>`): decir de 1 a 4 palabras sin tomar el turno, por ejemplo contando repeticiones.
- Detección de backchannels del usuario (`<user_bc>`, "mm-hmm", "yeah") para no ceder el turno ante ruidos de asentimiento.
- Gestión de silencios mediante una escalera de 8 niveles (1, 2, 4 … 256 s).
- Llamadas a herramientas (tool calling) integradas en la respuesta hablada cuando la decisión es hablar.
- Notas de escucha: el modelo base toma notas mientras el usuario habla, según se describe en los resultados del sistema.
- Generación de respuesta hablada pensada para ser sintetizada por un TTS en streaming.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Asistente de voz full-duplex en local: desplegado junto a Voxtral Mini 4B Realtime + turn head y Breeze TTS 2 en una sola RTX 4090, gestiona conversaciones habladas con solapamientos reales, interrupciones y silencios sin necesidad de servicios en la nube.
- Agente de voz con tool calling: cuando el usuario pide una acción (consultar el tiempo, poner un temporizador, buscar información), el modelo emite la llamada a herramienta dentro de la respuesta hablada, con una latencia de llamada de 2,39 s medida en Full-Duplex-Bench v3.
- Atención al cliente telefónica: el modelo distingue backchannels ("ya", "mm-hmm") de verdaderas tomas de turno, lo que permite mantener una conversación natural sin que el asistente se detenga ante cada asentimiento del cliente.
- Entrenamiento físico guiado por voz: la capacidad de interjección permite contar repeticiones o dar ánimos breves sin ceder el turno, mientras el usuario sigue hablando o haciendo ejercicio.
- Asistente de accesibilidad para personas con movilidad reducida: control por voz de aplicaciones y dispositivos con interrupciones naturales y sin latencias de primer token elevadas (1,82 s de primera palabra en el benchmark).
- Transcripción y respuesta en tiempo real de reuniones: el modelo puede escuchar de forma continua, tomar notas y decidir cuándo intervenir, aprovechando la escalera de silencios para no hablar cuando nadie se dirige a él.
- Demostraciones de investigación en interacción hablada: al ser pesos abiertos y código abierto, sirve como base reproducible para experimentos de turn-taking y evaluación con Full-Duplex-Bench.

## Benchmarks y rendimiento

Los resultados publicados miden el sistema Speakrail completo (Voxtral Mini 4B Realtime + turn head, este modelo con notas de escucha y Breeze TTS 2) sobre Full-Duplex-Bench v3, con 100 grabaciones de habla real y disfluente reproducidas en vivo.

| Métrica | Speakrail | TML-Interaction-Small | GPT-Realtime 1.5 | GPT-Live-1 + gpt-6-astra | Gemini Live 3.1 | NVIDIA (Qwen3-235B) | Whisper + GPT-4o + TTS | NVIDIA (Qwen3-30B) | Ultravox Realtime v0.7 | Gander 9B | NemotronLabs VoiceChat 11B |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Pesos abiertos | Sí (pesos + código) | No | No | No | No | No (solo paper) | No | No (solo paper) | Sí | Sí (pesos + código) | Sí |
| Pass@1 | .520 | **.680** | .600 | .550 | .540 | .480 | .450 | .440 | .410 | .400 | .330 |
| Tool F1 | **.915** | – | .876 | .835 | .817 | .717 | .803 | .746 | .794 | .759 | .825 |
| Arg acc | .633 | – | **.680** | .643 | .588 | .552 | .562 | .528 | .513 | .503 | .422 |
| Reply | .755 | **.828** | .792 | .717 | .718 | .670 | .600 | .540 | .510 | .490 | – |
| Turn-take | 98% | – | 96% | 99% | 78% | **100%** | **100%** | **100%** | 96% | **100%** | – |
| Interrupt ↓ | 22,4% | – | 13,5% | 14,1% | 19,2% | 51,0% | 33,0% | 54,0% | 47,9% | **8,0%** | – |
| Filler | 100% | – | 16,9% | 97,6% | 31,7% | 83,3% | 26,9% | 84,8% | 88,0% | 51,6% | – |
| 1st word ↓ | **1,82 s** | – | 6,36 s | 2,85 s | 3,95 s | – | 8,78 s | – | 3,88 s | – | – |
| Tool call ↓ | 2,39 s | – | 3,89 s | 4,12 s | **2,21 s** | – | 3,15 s | – | 6,01 s | – | – |
| Done ↓ | **3,92 s** | – | 6,89 s | 8,47 s | 4,25 s | – | 10,12 s | – | 8,40 s | – | – |

## Requisitos de hardware

- El sistema completo (STT Voxtral Mini 4B Realtime + turn head, este modelo y Breeze TTS 2) está diseñado para ejecutarse en una única RTX 4090.
- El modelo base está cuantizado a int4 (w4a16), lo que reduce el peso en VRAM respecto a los 12B en precisión completa; no se especifica la VRAM exacta necesaria para el modelo aislado.
- GPU recomendadas: RTX 4090 como referencia del proyecto; no se han publicado requisitos para A100, H100 u otras GPU.
- Despliegue: vLLM con el adaptador LoRA, mediante el arnés Speakrail (docker compose). No se documentan opciones con llama.cpp, Ollama ni TGI.
- Latencia: cada decisión cuesta un forward pass de 30-60 ms en una RTX 4090; primera palabra en 1,82 s, llamada a herramienta en 2,39 s y finalización en 3,92 s en Full-Duplex-Bench v3.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Pesos | Enfoque |
|---|---|---|---|---|---|
| Speakrail Gemma 4 12B | 12B (base) + LoRA | no disponible | Apache 2.0 | Abiertos (adaptador) | Turn-taking full-duplex sobre Gemma 4 QAT |
| TML-Interaction-Small | no disponible | no disponible | No abierta | No | Interacción full-duplex; mejor Pass@1 (.680) |
| Ultravox Realtime v0.7 | no disponible | no disponible | Abierta | Abiertos | Voz en tiempo real; Pass@1 .410 |
| Gander 9B (Tencent) | 9B | no disponible | Abierta | Abiertos | Voz full-duplex; mejor tasa de interrupción (8,0%) |

## Limitaciones y advertencias

- El modelo probablemente no funciona sin el arnés de Speakrail ni con un STT distinto de Voxtral, porque fue ajustado para sus fallos específicos y espera tokens que el uso textual ordinario de Gemma no genera.
- Solo admite inglés; no hay soporte multilingüe declarado.
- La tasa de interrupción es del 22,4%, superior a GPT-Realtime 1.5 (13,5%) y muy por encima de Gander 9B (8,0%), lo que implica un riesgo de cortar al usuario con más frecuencia que las alternativas.
- El Pass@1 (.520) es inferior al de TML-Interaction-Small (.680) y GPT-Realtime 1.5 (.600).
- El relleno (filler) alcanza el 100%, el valor más alto de la tabla, lo que puede traducirse en verbalizaciones de relleno frecuentes.
- El repositorio solo contiene el adaptador y los embeddings de tokens; es necesario descargar los pesos base de Google por separado.
- No se dispone de información sobre sesgos, riesgo de alucinación específico del adaptador ni límites de contexto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base de Google puede tener condiciones adicionales que deben verificarse.

## Enlaces

- [Hugging Face: 0x3/gemma-4-12B-it-qat-Speakrail](https://huggingface.co/0x3/gemma-4-12B-it-qat-Speakrail)
- [Modelo base: google/gemma-4-12B-it-qat-w4a16-ct](https://huggingface.co/google/gemma-4-12B-it-qat-w4a16-ct)
- [Repositorio Speakrail en GitHub](https://github.com/speakrail/speakrail)
- [STT: Voxtral-Mini-4B-Realtime-2602-TurnHead](https://huggingface.co/speakrail/Voxtral-Mini-4B-Realtime-2602-TurnHead)
- [Full-Duplex-Bench](https://github.com/DanielLin94144/Full-Duplex-Bench)
