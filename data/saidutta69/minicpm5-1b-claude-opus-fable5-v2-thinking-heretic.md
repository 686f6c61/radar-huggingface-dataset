# saidutta69/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-heretic

## Resumen

MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-heretic es una variante "abliterada" (decensored) del fine-tune GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking, que a su vez parte de openbmb/MiniCPM5-1B. El autor de la variante es saidutta69, que la publica bajo el paraguas de su colección "RACER IS OP — Heretic Models". El modelo conserva la arquitectura y el conocimiento del MiniCPM5 original (1.080.632.832 parámetros totales, contexto nativo de 128K según la model card) y añade una supresión selectiva del comportamiento de rechazo mediante edición de pesos, no mediante fine-tuning adicional.

La relevancia de esta ficha es doble. Por un lado, es un ejemplo canónico de "abliteration": se localizan las direcciones de peso responsables de las negativas y se editan quirúrgicamente las proyecciones de salida de atención (attn.o_proj) y las down-projections del MLP, dejando intacto el resto de la red. Por otro, el modelo se posiciona como una opción de 1B parámetros con modo Thinking / No-Think, tool calling y coding, pensada para despliegue local en GPU de consumo y en el borde (edge).

El resultado declarado por el autor es una divergencia KL de 0,0232 respecto al modelo base y una caída de rechazos de 93/100 a 3/100 en un conjunto de 100 prompts adversariales. La licencia es Apache 2.0, los idiomas declarados son inglés y chino, y el repositorio incluye pesos en safetensors y una escalera completa de cuantizaciones GGUF (de Q2_K a F16).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia MiniCPM5, cargable en llama.cpp; detalles internos de capas y atención no disponibles en la información proporcionada) |
| Parámetros totales | 1.080.632.832 (1,1B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 128K tokens (según la model card) |
| Tipos de cuantización | GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_1, Q4_0, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, IQ3_S, Q2_K |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer de 1,1B parámetros de la familia MiniCPM5. La información disponible no detalla el número de capas, la dimensión oculta ni la composición exacta del dataset de entrenamiento original. Lo que sí se documenta es la cadena de derivación: openbmb/MiniCPM5-1B como base, un fine-tune V2 sobre trazas de "Fable 5" orientado a tool calling, coding e instruction following (GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking), y finalmente esta variante heretic.

La innovación técnica central no está en el entrenamiento sino en la edición de pesos. Se aplica abliteration con Heretic v1.4.0, que identifica una dirección de rechazo (direction_index 12,95) y modifica las proyecciones de salida de atención y las down-projections del MLP con pesos y posiciones concretas (por ejemplo, attn.o_proj.max_weight 1,14 en la posición 14,01; mlp.down_proj.min_weight 0,39 a distancia 9,07). Al no haber fine-tuning, el autor sostiene que las capacidades del modelo base —tool calling, coding, razonamiento en modo Thinking— se preservan en gran medida, y lo respalda con una divergencia KL de 0,0232 frente al modelo de partida.

## Capacidades

- Generación de texto conversacional multi-turno, con modos nativos Think y No-Think heredados de MiniCPM5.
- Tool calling y function calling, capacidad sobre la que se centró el fine-tune intermedio.
- Generación de código e instruction following.
- Razonamiento multi-paso en modo Thinking (traza de pensamiento explícita).
- Respuestas directas ante prompts que el modelo base rechazaría (supresión de negativas vía abliteration).
- Capacidades multilingües limitadas a inglés y chino según los metadatos de la model card.
- Idoneidad para roleplay y conversación local, según los tags del autor.
- No se documentan capacidades de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Agentes locales con tool calling: el modelo puede orquestar llamadas a funciones en un bucle de agente sobre una máquina de desarrollo, con un peso de tan solo 0,7-1,2 GB en GGUF y contexto de 128K para mantener el estado de la conversación y las herramientas.
- Asistente de código en el editor: por su tamaño, se integra en plugins locales tipo Continue o similares que ejecutan el modelo en la propia GPU del desarrollador, sin enviar código a la nube.
- Despliegue en el borde y dispositivos de gama baja: con Q4_K_M (~0,7 GB) cabe en GPUs de 6-8 GB e incluso en CPU o Apple Silicon, lo que permite asistentes embebidos en portátiles y mini-PC.
- Investigación sobre mecánica de rechazo y alineación: la pareja modelo base / variante heretic, con KL de 0,0232 y métricas de rechazo 93/100 frente a 3/100, sirve como caso de estudio reproducible de abliteration.
- Roleplay y escritura creativa sin filtros heredados: para prototipos de narrativa interactiva donde las negativas del RLHF interrumpen la generación.
- Evaluación de pipelines de inferencia: al publicar 15 cuantizaciones GGUF, es útil para medir latencia y calidad en llama.cpp, Ollama, LM Studio o Jan antes de escalar a un modelo mayor.
- Clasificación y extracción de información en local: tareas de instruction following de bajo coste que no requieren un modelo grande y donde la privacidad del dato es crítica.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas de abliteration, no benchmarks estándar (MMLU, HumanEval, GSM8K):

| Métrica | Este modelo | Modelo base (GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking) |
|---|---|---|
| Divergencia KL | 0,0232 | 0 (por definición) |
| Rechazos (100 prompts adversariales) | 3/100 | 93/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB con Q4_K_M, 0,8 GB con Q5_K_M, 0,9 GB con Q6_K y 1,2 GB con Q8_0 (solo pesos); añadir alrededor de 1 GB adicional para el contexto según la model card.
- GPU recomendadas por el autor: RTX 3090/4090/5090 (24 GB) con Q8_0; RTX 4080/5080/4060 Ti 16G con Q6_K; RTX 3060/4070/5070 (12 GB) con Q5_K_M; RTX 4060/3070 (8 GB) con Q4_K_M; GTX 1660 Super/2060/3050 laptop (6 GB) con IQ4_XS.
- Cabe holgadamente en cualquier GPU de consumo con 6 GB o más, y en CPU o Apple Silicon usando Q4_K_M en RAM del sistema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, text-generation-inference (según tags) y transformers con safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-heretic (este) | 1,1B | 128K | Apache 2.0 | Tool calling, coding, sin rechazos | HF, safetensors + 15 GGUF |
| GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking | 1,1B | 128K (heredado) | Apache 2.0 (heredada) | Tool calling, coding, con rechazos | HF |
| openbmb/MiniCPM5-1B | 1,1B | 128K (según model card) | Apache 2.0 | Modelo base generalista | HF |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- La abliteration elimina barreras de rechazo: el modelo responderá a peticiones que el base rechazaba, incluidas potencialmente solicitudes dañinas. No debe desplegarse en aplicaciones de cara al público sin una capa de moderación externa.
- La divergencia KL de 0,0232 indica una edición estrecha, pero no garantiza ausencia de degradación en tareas específicas; conviene validar sobre el caso de uso concreto.
- Riesgo de alucinación inherente a un modelo de 1,1B: la capacidad de razonamiento y el conocimiento factual son limitados en comparación con modelos de mayor tamaño.
- Idiomas soportados únicamente inglés y chino según los metadatos; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- El contexto de 128K es una cifra declarada por la model card; el rendimiento efectivo en contextos muy largos no está verificado en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre el cumplimiento normativo derivado de la supresión de rechazos.
- El repositorio (14,1 GB) incluye pesos duplicados en varios formatos; conviene descargar solo el archivo GGUF o safetensors necesario.
- La model card incluye una imagen alojada en un dominio de terceros y enlaces a la colección del autor; verificar su procedencia antes de usarlos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking-heretic
- Modelo base del fine-tune: https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking
- Modelo original: https://huggingface.co/openbmb/MiniCPM5-1B
- Licencia del modelo original: https://huggingface.co/openbmb/MiniCPM5-1B/blob/main/LICENSE
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Artículo sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Colección del autor: https://huggingface.co/collections/saidutta69/racer-is-op-heretic-models
