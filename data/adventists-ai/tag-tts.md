# adventists-ai/tag-tts

## Resumen

tag-tts es un ajuste por aprendizaje por refuerzo del modelo de síntesis de voz Fun-CosyVoice3-0.5B-2512, publicado por el equipo adventists-ai en Hugging Face. Su objetivo es resolver un problema muy concreto: CosyVoice3 admite etiquetas paralingüísticas en línea (`[laughter]`, `[cough]`, `[sigh]`, `<laughter>…</laughter>`, `<strong>…</strong>`), pero en síntesis en tiempo real (bi-streaming) ignora la mayoría de ellas. tag-tts sustituye el modelo de lenguaje interno (`llm.pt`) por uno entrenado con DPO y GRPO, de modo que la etiqueta escrita se traduce realmente en el sonido correspondiente.

El juez del bucle de RL es DuplexJev-32B-Para, un modelo de comprensión de habla paralingüística del mismo equipo que evalúa cada candidato y decide si la risa, la tos o el suspiro se producen realmente y qué palabra recibe el énfasis. El resultado es un reemplazo directo (drop-in) del `llm.pt` oficial que mejora sustancialmente la fiabilidad de las etiquetas sin degradar la calidad básica de la voz: en Seed-TTS-eval reduce incluso el CER/WER respecto al modelo oficial en chino e inglés. El repo pesa 9,7 GB y usa la librería CosyVoice.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM de 0,5B sobre CosyVoice3 (flow matching + vocoder, sin modificar) |
| Parametros totales | 0,5B (del modelo de lenguaje; pipeline completo no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh (chino), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato `llm.pt` de CosyVoice, drop-in) |

## Arquitectura y entrenamiento

El modelo conserva íntegramente la arquitectura de CosyVoice3: el modelo de lenguaje de 0,5B genera tokens de habla que se convierten en audio mediante flow matching y un vocoder, ambos sin modificar. tag-tts solo reentrena el `llm.pt` con preferencias. El entrenamiento sigue un esquema de RL on-policy: se inserta una etiqueta en cada frase de entrenamiento (al inicio, en medio o al final, o envolviendo una palabra en `<strong>`), el modelo genera 8 candidatos en condiciones de producción (bi-streaming, 10 voces clonadas, mayormente sin instrucción de estilo), y DuplexJev-32B los evalúa mediante preguntas de opción múltiple (qué palabra se enfatiza, qué sonido no verbal se oye), con AudioSet-AST como segundo detector de risa/tos/respiración. Los candidatos con errores de ASR superiores al 10 % o deriva de timbre y velocidad se clasifican al final.

La optimización se realizó con DPO (β = 0,1, lr 1e-6, regularizador NLL de 0,1) en tres rondas on-policy de 2.100–2.800 pares de preferencias cada una (v1.0). Para la versión v1.1 se añadió GRPO (8 muestras por prompt, ventaja normalizada por grupo, clipping a nivel de token, KL respecto a la ronda anterior) con "positivos guiados": cuando el modelo nunca enfatiza la palabra marcada en 12 intentos, se muestrea con una pista textual (pausa breve antes de la palabra) y se conservan los candidatos que DuplexJev juzga enfatizados, entrenando después solo con el texto original. Todo el audio de entrenamiento es generado por el propio modelo; no se usan grabaciones externas.

## Capacidades

- Síntesis de texto a voz en chino e inglés con clonación de voz a partir de audio de referencia.
- Ejecución fiable de etiquetas paralingüísticas en línea: `[laughter]`, `[cough]`, `[sigh]`, `[breath]`, `<laughter>…</laughter>`.
- Énfasis léxico mediante `<strong>…</strong>`: el estrés recae en la palabra marcada en el 40,7 % de los casos (frente al 28,6 % del modelo oficial).
- Cumplimiento de instrucciones de estilo a nivel de frase ("dilo feliz / triste / enfadado / más alto / más despacio…"): coincidencia emoción-instrucción del 66,2 % / 71,9 % frente al 49,4 % / 47,5 % del modelo oficial.
- Síntesis en tiempo real bi-streaming (token a token), compatible con el despliegue original de CosyVoice3.
- Compatible con las mismas restricciones de uso que CosyVoice3: prefijo exacto `You are a helpful assistant.<|endofprompt|>` y envío de cada etiqueta como un único chunk de texto.

## Casos de uso

- Asistentes de voz conversacionales: en un agente de voz en tiempo real, el modelo puede reír, toser o suspirar de forma creíble cuando el guion lo indica, haciendo las interacciones más naturales que con el modelo base, que ignora la mayoría de etiquetas en streaming.
- Locución de audiolibros y podcasts: las etiquetas `<strong>` permiten marcar énfasis dramático palabra a palabra, y las etiquetas de risa o suspiro enriquecen la narración sin posproducción manual.
- Generación de diálogos para videojuegos: se pueden sintetizar líneas con reacciones emocionales (risa, suspiro) directamente desde el guion, con voces clonadas de personajes.
- Prototipado de agentes de habla con RLHF: el pipeline documentado (muestreo, juez, DPO/GRPO) sirve como receta reproducible para alinear otros modelos TTS con preferencias perceptuales.
- Sistemas de atención al cliente telefónica: la síntesis bi-streaming con baja tasa de error (CER zh 1,27) permite respuestas fluidas en chino e inglés con voz de marca clonada.
- Accesibilidad y lectura de textos: la expresividad añadida (emociones por instrucción reconocibles el 66–72 % de las veces) mejora la comprensión y el compromiso frente a voces planas.
- Investigación en evaluación de habla paralingüística: los benchmarks publicados (DuplexJev hit, AudioSet-AST, emotion2vec) ofrecen una metodología de evaluación automatizada de eventos no verbales.

## Benchmarks y rendimiento

Eventos paralingüísticos ("hit" = el evento se percibe claramente; 24 emisiones por etiqueta, ±8 % es ruido):

| Tag | CosyVoice3 | tag-tts v1.0 | tag-tts v1.1 |
|---|---|---|---|
| `[laughter]` | 62 % | 100 % | 100 % |
| `<laughter>…</laughter>` | 12 % | 88 % | 92 % |
| `[cough]` | 42 % | 79 % | 71 % |
| `[sigh]` | 4 % | 17 % | 17 % |
| `[breath]` | 25 % | 25 % | 17 % |
| Sin etiqueta (nada extra oído) | 100 % | 88 % | 88 % |

Énfasis y suspiro en frases held-out (70 frases × 4 muestras):

| | CosyVoice3 | tag-tts v1.0 | tag-tts v1.1 |
|---|---|---|---|
| `<strong>` – estrés en la palabra marcada | 28,6 % | 35,0 % | 40,7 % |
| `[sigh]` – suspiro oído (DuplexJev) | 4,3 % | 15,0 % | 17,9 % |

Seed-TTS-eval en el mismo despliegue (bi-streaming, voz clonada solo desde audio, sin texto de prompt; ASR: Paraformer-zh / Whisper-large-v3; SIM con CAM++, no comparable a cifras de papers):

| | zh CER ↓ | en WER ↓ | zh-hard CER ↓ | SIM zh / en ↑ |
|---|---|---|---|---|
| CosyVoice3 (official `llm.pt`) | 1,53 | 2,58 | 6,00 | 0,776 / 0,814 |
| tag-tts v1.0 | 1,29 | 2,02 | 6,42 | 0,776 / 0,815 |
| tag-tts v1.1 | 1,27 | 1,96 | 6,24 | 0,777 / 0,814 |

Instrucciones de emoción (160 frases ESD, coincidencia emoción-instrucción según emotion2vec):

| | Voz por defecto | Voz clonada ESD |
|---|---|---|
| CosyVoice3 oficial | 49,4 % | 47,5 % |
| tag-tts v1.0 | 70,0 % | 72,5 % |
| tag-tts v1.1 | 66,2 % | 71,9 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un LM de 0,5B dentro del pipeline CosyVoice3, los requisitos son los del despliegue estándar de CosyVoice3.
- GPU recomendadas: no disponible; cualquier GPU de consumo capaz de ejecutar CosyVoice3 0.5B debería bastar.
- Cabe en GPU de consumo: probablemente sí dado el tamaño de 0,5B, pero no hay datos oficiales publicados.
- Opciones de despliegue: mediante la librería CosyVoice (el repo está etiquetado con `cosyvoice`); el modelo es un reemplazo directo del `llm.pt` oficial. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: soporta síntesis bi-streaming token a token en tiempo real según la model card; cifras concretas no disponibles.

## Comparativa con modelos similares

| | tag-tts (v1.1) | Fun-CosyVoice3-0.5B-2512 (base) | CosyVoice3 oficial (`llm.pt`) |
|---|---|---|---|
| Desarrollador | adventists-ai | FunAudioLLM (Alibaba) | FunAudioLLM (Alibaba) |
| Parámetros | 0,5B (LM) | 0,5B | 0,5B |
| Etiquetas paralingüísticas en bi-streaming | Altas (risa 100 %, risa entrecomillada 92 %) | Bajas (risa 62 %, entrecomillada 12 %) | Bajas (mismas cifras) |
| Énfasis `<strong>` | 40,7 % | 28,6 % | 28,6 % |
| zh CER / en WER | 1,27 / 1,96 | 1,53 / 2,58 | 1,53 / 2,58 |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 |
| Disponibilidad | Hugging Face (drop-in de `llm.pt`) | Hugging Face | Hugging Face |

Alternativas TTS de otros fabricantes (XTTS, Kokoro, etc.): no disponible en la información proporcionada.

## Limitaciones y advertencias

- El énfasis `<strong>` solo aterriza en la palabra marcada el 40,7 % de las veces: es el objetivo más difícil y en un tercio de las frases el modelo nunca lo consigue en 12 intentos.
- `[sigh]` y `[breath]` siguen siendo poco fiables (17 % de hits en v1.1); `[breath]` incluso empeoró respecto al modelo base (25 % → 17 %).
- La detección de eventos no verbales se mide con solo 24 emisiones por etiqueta, por lo que diferencias de ±8 % son ruido estadístico.
- zh-hard empeora ligeramente (6,24 frente a 6,00 de CER del modelo oficial), señal de posible degradación en textos chinos difíciles.
- Requisitos de formato estrictos: el prefijo debe ser exactamente `You are a helpful assistant.<|endofprompt|>` (un espacio extra antes de `<|endofprompt|>` desactiva silenciosamente la mayoría de etiquetas); las etiquetas deben enviarse como un único chunk de texto (una etiqueta partida entre chunks se lee en voz alta); etiquetas malformadas o desconocidas se leen literalmente, por lo que conviene hacer whitelist de etiquetas.
- Idiomas limitados a chino e inglés; no hay soporte documentado para español ni otros idiomas.
- El juez DuplexJev debe consultarse exactamente con el formato de entrenamiento; con un prompt ligeramente distinto su precisión de estrés se degrada (la model card se corta en este punto, por lo que el detalle completo no está disponible).
- Sesgos conocidos, riesgo de alucinación específico del TTS y restricciones de uso comercial adicionales a las de Apache 2.0: no disponibles.
- Advertencia para producción: la clonación de voz implica verificar derechos sobre las voces de referencia; la model card no aborda este punto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adventists-ai/tag-tts
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- DuplexJev (juez de RL): https://github.com/adventists-ai/duplexjev
