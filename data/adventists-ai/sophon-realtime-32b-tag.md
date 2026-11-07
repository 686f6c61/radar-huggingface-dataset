# adventists-ai/Sophon-Realtime-32B-Tag

## Resumen

Sophon-Realtime-32B-Tag es un modelo any-to-any (audio a audio y audio a texto) desarrollado por adventists-ai, diseñado para conversación de voz en tiempo real y full-duplex. Combina un "thinker" de 32B parámetros (DuplexJev-32B-Para v1.5, en FP8, con torre de visión) que escucha, decide cuándo tomar el turno y redacta la respuesta junto con etiquetas de sonido inline, y un "talker" (tag-tts, basado en Fun-CosyVoice3-0.5B) que sintetiza la voz en streaming mientras el texto se sigue generando.

La innovación principal es la escritura de etiquetas paralingüísticas (`[laughter]`, `[sigh]`, `[breath]`, `[cough]`, `<laughter>…</laughter>`, `<strong>…</strong>`) que el thinker inserta en el flujo de texto y que el sintetizador interpreta como prosodia y eventos no verbales; las etiquetas nunca se leen en voz alta y se eliminan del flujo de texto. Todo el sistema se sirve como un único modelo vLLM-Omni (thinker → talker → vocoder de flujo + HiFT) sobre una sola GPU de 80 GB.

El modelo es relevante porque aborda el problema del turn-taking natural y la expresividad paralingüística en agentes de voz, con latencia medida de aproximadamente 0,7 s desde el fin del habla del usuario hasta la primera respuesta de voz, y soporte de hasta 16 usuarios concurrentes por GPU H100 con tartamudeo despreciable. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema compuesto: thinker (LLM DuplexJev-32B-Para v1.5, FP8, con torre de visión) + talker (tag-tts: modelo de lenguaje + flujo destilado de 4 pasos sin CFG + vocoder HiFT), servido como un único modelo vLLM-Omni |
| Parametros totales | 32B (thinker) + 0,5B (talker, basado en Fun-CosyVoice3-0.5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (thinker); no se detallan otras cuantizaciones |
| Idiomas soportados | zh (chino mandarín), en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (pesos en ModelScope; copia en Hugging Face en proceso de subida; repo de 8,3 GB) |

## Arquitectura y entrenamiento

El sistema sigue una arquitectura en cascada empaquetada como un solo modelo servible. El thinker es DuplexJev-32B-Para v1.5, un LLM de 32B parámetros en FP8 con torre de visión, entrenado para escritura de etiquetas de sonido fusionada; gestiona el turn-taking (barge-in, backchannel) y produce la respuesta textual con etiquetas inline. El talker es tag-tts, que consta de un modelo de lenguaje, un flujo destilado de 4 pasos sin classifier-free guidance y un vocoder HiFT, basado en Fun-CosyVoice3-0.5B. Las etiquetas se envían al sintetizador como fragmentos completos mientras el texto fluye, replicando el formato con el que se entrenó la voz.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La innovación técnica destacable es la integración de la decisión de turno y la generación de prosodia paralingüística en un único pipeline full-duplex con streaming bidireccional, servido vía vLLM-Omni con APIs WebSocket (`/v1/realtime`) y HTTP (`/v1/chat/completions`).

## Capacidades

- Conversación de voz full-duplex con detección de turno, barge-in y backchannel.
- Generación de respuestas de voz en streaming con latencia baja (primera respuesta de audio ~0,7 s tras el fin del habla del usuario).
- Escritura de etiquetas paralingüísticas inline: `[laughter]`, `[breath]`, `[sigh]`, `[cough]`, `<laughter>…</laughter>` (reír mientras se habla), `<strong>…</strong>` (énfasis en una palabra).
- Eliminación de etiquetas del flujo de texto entregado al usuario (nunca se leen en voz alta).
- Entrada de audio y salida de audio más texto (any-to-any).
- Torres de visión presentes en el thinker (según la model card, el thinker incluye la torre de visión), aunque no se detallan capacidades de visión en la información disponible.
- Multilingüe limitado a chino mandarín e inglés, con voces predefinidas: `vivian_zh` (por defecto para chino), `ryan_en` (por defecto para inglés), `brand_zh`, `brand_en`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente por voz: el modelo gestiona conversaciones full-duplex con turn-taking natural y barge-in, lo que permite al usuario interrumpir y al agente responder con prosodia adecuada (por ejemplo, un tono de disculpa con `[sigh]` ante una queja), desplegable con hasta 16 usuarios concurrentes por GPU H100.
- Asistentes de voz embebidos en aplicaciones: mediante `POST /v1/chat/completions` con audio de entrada y salida de texto más audio en streaming, se puede integrar en apps móviles o web sin infraestructura adicional de síntesis.
- Generación de contenido de audio expresivo: creación de respuestas habladas con risas, suspiros y énfasis para podcasts, audiolibros interactivos o personajes virtuales, usando las etiquetas `<laughter>` y `<strong>` para modular la entrega.
- Agentes telefónicos o de call center: la API WebSocket full-duplex permite conectar el modelo a centralitas SIP o plataformas de telefonía, con latencia de ~0,7 s y escalado lineal añadiendo una instancia por GPU tras un balanceador de carga.
- Prototipado de interfaces conversacionales: el despliegue de un solo comando (`install.sh` + `start.sh`) y el cliente de ejemplo (`client_example.py`) permiten validar rápidamente experiencias de voz con archivos WAV de entrada.
- Investigación en paralingüística y turn-taking: el sistema expone métricas medibles de entrega de eventos no verbales (tasas de detección de suspiro, respiración, tos y risa), útil para estudiar la fidelidad de la prosodia generada.
- Asistentes bilingües chino-inglés: con voces nativas para ambos idiomas (`vivian_zh`, `ryan_en`) y selección de idioma por petición (`--lang en`), adecuado para mercados que requieren ambos idiomas.

## Benchmarks y rendimiento

Rendimiento medido en una H100 de 80 GB (datos de la model card):

| Usuarios concurrentes (llegando en 10 s) | Primera respuesta de audio, mediana / máximo | Tartamudeo (mediana) |
|---|---|---|
| 1 | 0,67 s | ~0 |
| 8 | 0,61 / 0,76 s | 0 |
| 16 | 0,75 / 1,07 s | 0,06 s |
| 24 | 1,36 / 2,11 s | 0,39 s (empieza la cola) |

Fidelidad de eventos paralingüísticos (96 frases de test × 2 ejecuciones por el pipeline servido completo, detector AST; 8-12 frases por clase, por lo que ±1 frase ≈ ±10 puntos):

| | suspiro | respiración | tos | risa |
|---|---|---|---|---|
| Esta versión | 25% | 50% | 33% | 42% |
| Renderizador tag-tts de referencia, mismo modelo de voz | 42% | 50% | 33% | 50% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 65 GB por instancia; una GPU de 80 GB (H100, H800 o A100 80G).
- GPU recomendadas: H100 80 GB, H800, A100 80G. No cabe en GPU de consumo.
- Despliegue: vLLM 0.30 + vLLM-Omni 0.30 con plugin, Python 3.12; instalación vía `install.sh` y arranque con `start.sh` (primer arranque 15-20 min por compilación de kernels y motores TensorRT; posteriores 5-8 min).
- Pesos: aproximadamente 42 GB descargados por el instalador (el repo de Hugging Face ocupa 8,3 GB, posiblemente por pesos en ModelScope y copia parcial en HF).
- Latencia: ~0,7 s del fin del habla del usuario a la primera voz; primera respuesta de audio de 0,61-0,75 s con 1 a 16 usuarios.
- Throughput y escalado: hasta 16 usuarios concurrentes recomendados por GPU; más GPUs mediante una instancia por GPU tras un balanceador de carga, con escalado aproximadamente lineal. CPU no es cuello de botella (~1,5 núcleos por instancia con 16 usuarios).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El sistema se basa en componentes conocidos (Fun-CosyVoice3-0.5B para el talker y DuplexJev-32B-Para v1.5 para el thinker), pero no se han publicado comparativas de rendimiento frente a alternativas de speech-to-speech en tiempo real en la información disponible.

## Limitaciones y advertencias

- Las etiquetas `[sigh]` y `<laughter>…</laughter>` son débiles: el thinker las escribe con más frecuencia de la que la voz las entrega (tasa de suspiro del 25% frente al 42% del renderizador de referencia).
- El mandarín es algo menos claro que el inglés con el flujo destilado; una risa a veces se transcribe como "哈哈" por el ASR.
- Las respuestas muy largas (más de aproximadamente un minuto de habla en un turno) exceden lo que la voz fue entrenada para manejar.
- Idiomas limitados a chino e inglés; no hay soporte de otros idiomas.
- No se detallan sesgos conocidos ni tasas de alucinación en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las licencias de los componentes base (DuplexJev, Fun-CosyVoice3) antes de producción.
- La copia en Hugging Face estaba en proceso de subida en el momento de la información; los pesos completos están en ModelScope.
- El despliegue requiere hardware de gama alta (GPU de 80 GB) y tiempos de arranque iniciales de 15-20 minutos.

## Enlaces

- Hugging Face: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Tag
- ModelScope: https://www.modelscope.cn/models/AdventistsAI/Sophon-Realtime-32B-Tag
- Repositorio y despliegue: https://github.com/adventists-ai/sophon-realtime/tree/main/tag
- DuplexJev: https://github.com/adventists-ai/duplexjev
- Voz tag-tts: https://huggingface.co/adventists-ai/tag-tts
