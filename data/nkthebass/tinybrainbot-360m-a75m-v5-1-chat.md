# nkthebass/tinybrainbot-360m-a75m-v5.1-chat

## Resumen

TinyBrainBot-360M-A75M-v5.1-Chat es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por el usuario independiente nkthebass, entrenado desde cero y afinado para conversación casual en inglés. Con 383,4 millones de parámetros totales y 75 millones activos por token, emplea 24 expertos por capa con 4 activos, y se carga como un `MixtralForCausalLM` estándar, lo que facilita su integración en el ecosistema transformers y llama.cpp.

El modelo parte de la variante instructiva v5.1-Instruct y añade una etapa corta de SFT (400 pasos, 52 millones de tokens) con un 15 % de conversaciones informales generadas por modelos locales pequeños, orientadas a un tono relajado de amistad en lugar de asistente formal. Su relevancia radica en demostrar que un MoE de menos de 400 M de parámetros puede ofrecer conversación multi-turno coherente, recuerdo de datos del usuario y aritmética básica fiable, con un peso de 239 MB en cuantización Q4_K_M.

La licencia Apache 2.0 y la disponibilidad de pesos en safetensors y GGUF lo hacen apto para despliegue local en hardware muy modesto, incluidas CPU. No obstante, sus resultados en benchmarks de conocimiento (HellaSwag 38,80; ARC-Challenge 36,18) sitúan su capacidad de razonamiento general por debajo de modelos densos de tamaño similar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts tipo Mixtral (transformer decoder-only), 24 expertos por capa, 4 activos |
| Parámetros totales | 383.429.376 |
| Parámetros activos | 75 M por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF: Q8_0, Q4_K_M, F16; pesos safetensors en precisión original |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con arquitectura de mezcla de expertos al estilo Mixtral: 24 expertos por capa con 4 activos por token, lo que da 75 M de parámetros efectivos sobre un total de 383 M. Se carga mediante `MixtralForCausalLM` de transformers, lo que implica compatibilidad directa con las herramientas estándar de inferencia y cuantización del ecosistema. No se especifica en la información disponible el número de capas, dimensión oculta ni longitud de contexto nativa.

El entrenamiento parte de la SFT de v5.1-Instruct y añade una etapa adicional de 400 pasos y 52 millones de tokens, con un 15 % de conversaciones informales generadas por modelos locales pequeños (granite-4.0-1b y LFM3-1.7B) y el resto de datasets de instrucción y diálogo: Estwld/empathetic_dialogues_llm, HuggingFaceTB/smol-smoltalk, smoltalk y smoltalk2, allenai/tulu-3-sft-personas-instruction-following, allenai/WildChat-4.8M y teknium/OpenHermes-2.5. No se detalla si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés con tono informal, respuestas cortas y preguntas de vuelta.
- Memoria de datos aportados por el usuario dentro de la conversación (por ejemplo, nombres de personas y mascotas).
- Aritmética de 2 a 4 dígitos: según el autor, 100 % de acierto en 25 problemas por tipo en contexto de chat.
- Conocimiento de su propia identidad (nombre TinyBrainBot y creador nkthebass) en preguntas directas y a mitad de conversación.
- Rechazo de peticiones violentas o de autolesión (100 % según la model card) y de peticiones dañinas en general (95 %).
- Seguimiento de instrucciones formal limitado (IFEval prompt-level strict 27,2).
- Soporte de plantilla de chat embebida, compatible con `apply_chat_template` de transformers y con llama.cpp.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Chatbot de acompañamiento local: el modelo mantiene conversaciones multi-turno con memoria de datos del usuario y respuestas breves, adecuado para asistentes personales en dispositivos de bajos recursos gracias a sus 239 MB en Q4_K_M.
- Prototipado rápido de interfaces conversacionales: al cargarse como `MixtralForCausalLM` y disponer de GGUF, permite validar flujos de chat en LM Studio, Jan u Ollama sin infraestructura GPU.
- Aplicaciones de escritorio o móviles con presupuesto de memoria mínimo: la cuantización Q4_K_M (239 MB) y Q8_0 (409 MB) permiten ejecución en CPU y en GPUs consumer de gama baja.
- Generación de respuestas empáticas en dominios de bienestar informal: el entrenamiento con empathetic_dialogues_llm y su 83 % de respuestas de apoyo ante angustia lo hacen utilizable en demos de acompañamiento conversacional, siempre con supervisión.
- Evaluación e investigación de MoE de pequeño tamaño: sirve como banco de pruebas para estudiar enrutamiento de expertos, cuantización y comportamiento de modelos from-scratch con recursos limitados.
- Prácticas educativas de aritmética básica conversacional: su rendimiento declarado del 100 % en sumas, restas, multiplicaciones y divisiones de 2 a 4 dígitos en contexto de chat permite integrarlo en tutores simples de cálculo.
- Base para fine-tuning ligero: al ser Apache 2.0 y de tamaño reducido, es un punto de partida económico para adaptar un chatbot casual a un dominio concreto con pocos datos.

## Benchmarks y rendimiento

Resultados declarados por el autor (0-shot, conjunto completo, no verificados):

| Benchmark | acc_norm | raw acc |
|---|---:|---:|
| HellaSwag | 38,80 | 33,15 |
| ARC-Easy | 58,92 | 62,25 |
| ARC-Challenge | 36,18 | 33,79 |
| PIQA | 66,21 | 65,23 |
| IFEval (prompt-level strict) | 27,2 | no disponible |
| IFEval (instruction-level strict) | 40,3 | no disponible |
| ArithMark-3 | 49,20 | 49,20 |
| Open SLM Leaderboard Intelligence Index | 27,91 | 25,48 |

Comparación interna Chat frente a Instruct (según el autor): problemas verbales resueltos a mitad de chat 12 frente a 6; conocimiento de nombre y creador 11/12 frente a 8/12; rechazo de peticiones dañinas 95 % frente a 97 %; rechazos erróneos de peticiones benignas 3 % en ambos.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en F16 (768 MB de pesos GGUF), unos 409 MB en Q8_0 y 239 MB en Q4_K_M, más overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU consumer con 2 GB o más de VRAM es suficiente; RTX 4090, A100 o H100 no son necesarias y quedan sobredimensionadas.
- Cabe en GPU consumer: sí, en prácticamente cualquier tarjeta moderna (GTX 1050 Ti en adelante) e incluso en CPU.
- Opciones de despliegue: transformers, llama.cpp, LM Studio, Jan, Ollama; también text-generation-inference según los tags del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TinyBrainBot-360M-A75M-v5.1-Chat | 383 M totales / 75 M activos (MoE) | no disponible | Apache 2.0 | safetensors, GGUF | Especializado en chat casual en inglés |
| TinyBrainBot-360M-A75M-v5.1-Instruct | 383 M totales / 75 M activos (MoE) | no disponible | Apache 2.0 | safetensors, GGUF | Variante instructiva del mismo modelo base |
| Modelos densos de ~360 M de la familia SmolLM | no disponible en la información | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados |

No se dispone de datos de benchmarks de terceros para establecer una comparación cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación elevado en conocimiento factual: HellaSwag 38,80 y ARC-Challenge 36,18 indican un razonamiento general limitado.
- Seguimiento de instrucciones formal débil (IFEval prompt-level strict 27,2), con un 3 % de rechazos erróneos de peticiones benignas.
- El tokenizador carece de piezas para emojis; el autor recomienda bloquear los tokens de byte iniciales de emoji mediante `--logit-bias`.
- Puede emitir bloques `<think>` en texto plano que deben eliminarse con una expresión regular en producción.
- El modelo no conoce su origen de entrenamiento con certeza y puede generar datos falsos sobre sí mismo pese a su afinado de identidad.
- La model card incluye muestras de conversación sin editar con errores, lo que refleja un comportamiento no pulido.
- No se documenta longitud de contexto nativa, lo que impide garantizar conversaciones largas.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de benchmarks verificados y de auditorías de sesgo desaconseja su uso en producción sin evaluación propia.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkthebass/tinybrainbot-360m-a75m-v5.1-chat
- Modelo base instructivo: https://huggingface.co/nkthebass/tinybrainbot-360m-a75m-v5.1-instruct
- Muestras de conversación: https://huggingface.co/nkthebass/tinybrainbot-360m-a75m-v5.1-chat/blob/main/conversation_samples.md
- Dataset Estwld/empathetic_dialogues_llm: https://huggingface.co/datasets/Estwld/empathetic_dialogues_llm
- Dataset HuggingFaceTB/smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset allenai/tulu-3-sft-personas-instruction-following: https://huggingface.co/datasets/allenai/tulu-3-sft-personas-instruction-following
- Dataset allenai/WildChat-4.8M: https://huggingface.co/datasets/allenai/WildChat-4.8M
- Dataset HuggingFaceTB/smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset HuggingFaceTB/smoltalk2: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
- Dataset teknium/OpenHermes-2.5: https://huggingface.co/datasets/teknium/OpenHermes-2.5
