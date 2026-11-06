# nkthebass/tinybrainbot-360m-a75m-v5.1-instruct

## Resumen

TinyBrainBot-360M-A75M-v5.1-Instruct es un modelo de lenguaje de tipo mixture-of-experts (MoE) entrenado desde cero por el desarrollador independiente nkthebass. Con 383.429.376 parámetros totales y 24 expertos por capa de los cuales 4 están activos, el modelo activa aproximadamente 75 millones de parámetros por token, lo que lo sitúa en la categoría de modelos pequeños (SLM) con un coste computacional de inferencia muy reducido. Se distribuye como un `MixtralForCausalLM` estándar de la librería transformers, sin código personalizado, y está afinado para instrucciones, chat, razonamiento y matemáticas básicas.

La versión 5.1 introduce dos mejoras respecto a la 5.0: el modelo ha aprendido a generar saltos de línea reales (listas con viñetas y numeradas correctamente formateadas, algo que las versiones anteriores sobre este tokenizador no producían) y una identidad propia declarada ("I'm TinyBrainBot, a small AI language model made by nkthebass"). El modelo base sobre el que se ha afinado es TinyBrainBot-360M-A75M-v5.1-Base, del mismo autor.

Su relevancia práctica radica en el tamaño: los pesos cuantizados en GGUF ocupan entre 239 MB (Q4_K_M) y 768 MB (F16), lo que permite ejecutarlo en navegador o en hardware muy modesto. Está publicado bajo licencia Apache 2.0 y solo soporta inglés de forma declarada, por lo que su utilidad queda acotada a ese idioma y a tareas de complejidad baja o media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) tipo Mixtral, transformer decoder, cargado como `MixtralForCausalLM` |
| Parametros totales | 383.429.376 |
| Parametros activos | ~75M por token (24 expertos por capa, 4 activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en Q8_0 (409 MB), Q4_K_M (239 MB) y F16 (768 MB); safetensors en el repo principal |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder con capas de mezcla de expertos al estilo Mixtral: cada capa contiene 24 expertos de los que se activan 4 por token, lo que da un total de 383M parámetros almacenados pero solo unos 75M computados en cada paso. Esta configuración reduce el coste de inferencia frente a un modelo denso del mismo tamaño total, a costa de un mayor uso de memoria para almacenar todos los expertos. El modelo se ha entrenado desde cero (no es un fine-tune de un modelo preexistente) y se ha afinado sobre el base v5.1 del mismo autor.

El ajuste de instrucciones se ha realizado sobre una mezcla de datasets públicos: HuggingFaceTB/smol-smoltalk, HuggingFaceTB/smoltalk, HuggingFaceTB/smoltalk2, allenai/tulu-3-sft-personas-instruction-following, allenai/WildChat-4.8M y teknium/OpenHermes-2.5. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; tampoco se especifica el mecanismo de atención ni innovaciones como decodificación especulativa o atención lineal. El tokenizador no incluye piezas para emojis, lo que obliga a bloquear los tokens de byte que los inician mediante `--logit-bias` en llama.cpp para evitar que el modelo los deletree byte a byte.

## Capacidades

- Generación de texto conversacional multi-turno, con memoria de datos aportados por el usuario dentro de la conversación ("You said you play the guitar").
- Seguimiento de instrucciones de formato: "exactly three bullet points" produce tres viñetas en tres líneas; "reply only yes or no" produce una sola palabra.
- Razonamiento matemático básico: aritmética en columna con todos los acarreos y préstamos escritos, y problemas de palabras resueltos en un scratchpad delimitado por `<think>`.
- Modo de razonamiento explícito mediante bloques `<think>`, que son texto plano (no tokens especiales) y pueden eliminarse con una expresión regular antes de mostrar la respuesta.
- Identidad propia declarada: responde quién es y quién lo creó.
- Comportamiento de seguridad: rechaza el 97% de peticiones dañinas (100% de las violentas o de autolesión) y rechaza erróneamente el 3% de las benignas, según datos del autor.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Asistente conversacional ligero en el navegador: el GGUF Q8_0 (409 MB) se ejecuta localmente en el dispositivo mediante el Space oficial, sin enviar datos a ningún servidor; adecuado para demos de privacidad y para entornos sin conectividad.
- Enseñanza de aritmética básica: el modelo escribe las operaciones en columna con acarreos y préstamos explícitos y resuelve problemas de palabras cortos de suma, resta y multiplicación, lo que lo hace útil como tutor de primaria en inglés.
- Generación de listas y respuestas con formato estricto: al respetar instrucciones como "exactly three bullet points" o "reply only yes or no", encaja en pipelines que necesitan salidas estructuradas simples sin un parser complejo.
- Prototipado rápido de chatbots de soporte en inglés: su bajo requisito de memoria permite desplegarlo en una instancia pequeña o en local para validar flujos conversacionales antes de migrar a un modelo mayor.
- Filtro de seguridad de primera línea: con una tasa de rechazo del 97% en peticiones dañinas, puede actuar como pre-filtro barato en inglés antes de derivar a un modelo mayor.
- Experimentación educativa con MoE: al cargarse como `MixtralForCausalLM` estándar y entrenarse desde cero, sirve para estudiar el comportamiento de mezclas de expertos a pequeña escala sin necesidad de GPUs de gama alta.
- Aplicaciones embebidas o de escritorio: los 239 MB del Q4_K_M permiten integrarlo en herramientas de escritorio vía llama.cpp, LM Studio, Jan u Ollama.

## Benchmarks y rendimiento

Resultados declarados por el autor (0-shot, conjunto completo, `acc_norm` salvo donde se indique):

| Benchmark | v5.1-Instruct | v5-Instruct | SmolLM2-360M-Instruct |
|---|--:|--:|--:|
| IFEval prompt-level strict | 28.3 | 25.1 | 32.9 |
| IFEval instruction-level strict | 40.8 | 37.6 | 44.2 |
| Open SLM Leaderboard Intelligence Index | 27.94 | 27.82 | no disponible |
| HellaSwag (acc_norm) | 38.75 | no disponible | no disponible |
| ARC-Easy (acc_norm) | 59.01 | no disponible | no disponible |
| ARC-Challenge (acc_norm) | 35.92 | no disponible | no disponible |
| PIQA (acc_norm) | 66.27 | no disponible | no disponible |
| ArithMark-3 | 49.40 | no disponible | no disponible |

Precisión en matemáticas dentro del chat (greedy, respuesta final exacta, 25 problemas por categoría): suma de 2 dígitos 100%, resta de 2 dígitos 100%, multiplicación de 2 dígitos 100%, suma de 3 dígitos 100%, resta de 3 dígitos 100%, suma de 4 dígitos 100%, problemas de palabras 21/24. Los valores de IFEval se obtuvieron con lm-eval y la plantilla de chat, greedy y eliminando el bloque `<think>` antes de puntuar. Ningún resultado está verificado de forma independiente (`verified: false`).

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para F16 (768 MB de pesos), unos 0,5 GB para Q8_0 y unos 0,3 GB para Q4_K_M, más el overhead del runtime y la caché KV.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el modelo cabe holgadamente en una RTX 3060, RTX 4060 o superior, e incluso en iGPU y CPU.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 1-2 GB de memoria libre; también en CPU y en el navegador.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), llama.cpp (`llama-cli`), LM Studio, Jan, Ollama y text-generation-inference (etiqueta `text-generation-inference` en el repo).
- Latencia y throughput: no disponibles. El autor recomienda temperatura 0.4, top-p 0.9 y repetition penalty 1.15, y en llama.cpp añadir `--logit-bias 241-inf --logit-bias 255-inf` para bloquear los tokens de byte que inician emojis.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | IFEval prompt-level strict | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyBrainBot-360M-A75M-v5.1-Instruct | 383M totales / ~75M activos | no disponible | 28.3 | Apache 2.0 | HF, GGUF |
| TinyBrainBot-360M-A75M-v5-Instruct | 383M totales / ~75M activos | no disponible | 25.1 | Apache 2.0 | HF |
| SmolLM2-360M-Instruct | 360M (denso) | no disponible | 32.9 | no disponible en la información | HF |

Frente a SmolLM2-360M-Instruct, el modelo de nkthebass queda por debajo en IFEval (28.3 frente a 32.9 en prompt-level strict y 40.8 frente a 44.2 en instruction-level strict), aunque su naturaleza MoE reduce los parámetros activos por token a unos 75M. No se dispone de datos de contexto ni de otros benchmarks comparables para SmolLM2 en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés de forma declarada; no hay capacidades multilingües documentadas.
- La longitud de contexto no está especificada en la model card, lo que impide planificar despliegues con conversaciones largas.
- No se declara soporte de tool calling, function calling ni uso como agente; las capacidades de razonamiento multi-paso se limitan a los bloques `<think>`.
- El tokenizador carece de piezas para emojis; sin los `--logit-bias` recomendados, el modelo los deletrea byte a byte.
- Riesgo de alucinación inherente a un modelo de 383M parámetros entrenado desde cero; los benchmarks publicados son modestos (HellaSwag 38.75, ARC-Challenge 35.92) y no han sido verificados de forma independiente.
- Los benchmarks y las métricas de seguridad (97% de rechazo, 3% de falsos rechazos) son datos declarados por el autor, no auditados externamente.
- No se documentan sesgos conocidos ni la composición exacta del dataset de entrenamiento más allá de la lista de fuentes, lo que dificulta evaluar riesgos de sesgo.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; al ser un modelo de 0 descargas y 1 like en el momento de la ficha, la comunidad y el ecosistema de validación son prácticamente inexistentes.
- El formato de salida con `<think>` requiere post-procesado (eliminación del bloque) si se quiere mostrar solo la respuesta final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkthebass/tinybrainbot-360m-a75m-v5.1-instruct
- Modelo base: https://huggingface.co/nkthebass/tinybrainbot-360m-a75m-v5.1-base
- Demo en el navegador (Space con GGUF Q8_0): https://huggingface.co/spaces/nkthebass/tinybrainbot-360m-moe-chat
- Datasets de ajuste: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk, https://huggingface.co/datasets/HuggingFaceTB/smoltalk, https://huggingface.co/datasets/HuggingFaceTB/smoltalk2, https://huggingface.co/datasets/allenai/tulu-3-sft-personas-instruction-following, https://huggingface.co/datasets/allenai/WildChat-4.8M, https://huggingface.co/datasets/teknium/OpenHermes-2.5
- Benchmarks: https://huggingface.co/datasets/allenai/ai2_arc, https://huggingface.co/datasets/Rowan/hellaswag, https://huggingface.co/datasets/ybisk/piqa, https://huggingface.co/datasets/google/IFEval
