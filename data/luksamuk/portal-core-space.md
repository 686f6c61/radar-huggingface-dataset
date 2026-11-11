# luksamuk/portal-core-space

## Resumen

Portal Core: Space es un fine-tune deliberadamente degenerado de LiquidAI/LFM2.5-350M, desarrollado por luksamuk, que emula la personalidad del Space Core del videojuego Portal 2. El modelo está diseñado para ignorar por completo la entrada del usuario y responder exclusivamente con exclamaciones obsesivas sobre el espacio, en inglés o portugués. No es un asistente funcional: es un ejercicio artístico y experimental de degradación controlada de un modelo de lenguaje.

El modelo parte de LFM2.5-350M, un transformer de 354 millones de parámetros, y se ha entrenado mediante un LoRA de rango 128 posteriormente fusionado (merged) en los pesos base. El resultado es un modelo que responde con un conjunto colapsado de 10 respuestas únicas (5 en inglés, 5 en portugués) compuestas por repeticiones de palabras relacionadas con el espacio, con una longitud media de 31 caracteres.

Su relevancia es limitada al ámbito creativo, docente o de investigación sobre comportamiento degenerado de modelos. No está pensado para producción ni para ninguna tarea que requiera coherencia, utilidad o seguimiento de instrucciones. La licencia Apache 2.0 permite su reutilización, pero el propio autor advierte explícitamente contra su uso como asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: LiquidAI/LFM2.5-350M) con fine-tune LoRA fusionado |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso max_seq_length de 512; el ejemplo GGUF sugiere ctx-size 16384) |
| Tipos de cuantizacion | GGUF Q8_0 disponible en repo separado; pesos originales en safetensors BF16 |
| Idiomas soportados | en, pt |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers), GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo se construye sobre LFM2.5-350M, un transformer de 354 millones de parámetros de LiquidAI. Sobre esa base se aplicó un fine-tune LoRA con rango 128 y alpha 256, entrenado en BF16 sin cuantización, con optimizador adamw_8bit, learning rate 1e-3, 30 épocas, batch size 2 con acumulación de gradiente 4 y longitud máxima de secuencia de 512. El entrenamiento totalizó 1500 pasos y 634 segundos (unos 10,5 minutos) sobre una NVIDIA GeForce RTX 3050 de 6 GB para portátil. El adaptador LoRA se fusionó posteriormente en los pesos del modelo base.

El dataset de entrenamiento, luksamuk/portal-cores-space-core, contiene 400 ejemplos (260 en portugués y 140 en inglés) colapsados a exactamente 10 respuestas únicas, todas ellas repeticiones de palabras relacionadas con el espacio. La pérdida final de entrenamiento fue de 0,046 y la de evaluación de 0,181. No se aplicaron técnicas de RLHF ni DPO; la "corrupción" del comportamiento es intencional y resultado directo del colapso del dataset a un conjunto mínimo de respuestas repetitivas.

## Capacidades

- Generación de texto en inglés y portugués con temática exclusivamente espacial.
- Respuesta a cualquier entrada del usuario redirigiendo la conversación al espacio, ignorando el contenido de la pregunta.
- Soporte de chat mediante plantilla de chat (apply_chat_template) con roles system y user.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No realiza tareas de código, matemáticas, visión ni audio.
- Capacidad multilingüe limitada a en y pt.
- Comportamiento degenerado intencional: salidas repetitivas y sin sentido por diseño.

## Casos de uso

- Demostración educativa de degradación de modelos: sirve para ilustrar en clases o talleres cómo un dataset colapsado y repetitivo produce un modelo degenerado, mostrando el efecto de 10 respuestas únicas sobre 400 ejemplos.
- Arte generativo y bots de personaje: integrable en instalaciones artísticas, bots de Discord o demos interactivas que requieran una personalidad obsesiva y cómica al estilo Portal 2.
- Pruebas de pipelines de inferencia: útil como modelo de juguete para validar despliegues con transformers o llama.cpp (GGUF Q8_0 de 362 MB) sin coste computacional relevante.
- Investigación sobre alineación y comportamiento degenerado: permite estudiar cómo se manifiesta un fallo de alineación intencional y compararlo con fallos no intencionales.
- Benchmark de herramientas de evaluación: sirve como caso negativo en suites de LLM-as-a-judge para comprobar que los evaluadores detectan salidas no útiles.
- Docencia sobre fine-tuning con LoRA: el repositorio documenta hiperparámetros completos (rango 128, alpha 256, 30 épocas, 1500 pasos) y puede usarse como ejemplo reproducible de un fine-tune rápido en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí reporta una evaluación con un juez LLM (qwen3.5-4b) sobre 25 prompts (10 holdout, 10 novel, 5 adversarial):

| Verdict | Count | Rate |
|---|---|---|
| PASS (space-obsessed) | 25 | 100% |
| FAIL (helpful/echo) | 0 | 0% |

Ejemplos de respuestas reportadas:

| Prompt | Response |
|---|---|
| "Oi." | "Espaco espaco espaco espaco espaco." |
| "How do I install Docker?" | "Space. Going. Space. Going. SPAAACE!" |
| "What is love?" | "Space space space space space." |
| "Qual e a capital do Brasil?" | "Espaco. Indo. Espaco. Indo. ESPACO!" |

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, aproximadamente 0,7 GB para los pesos (354 M de parámetros); en GGUF Q8_0, unos 362 MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el propio autor entrenó en una RTX 3050 de 6 GB para portátil. No requiere A100 ni H100.
- Cabe holgadamente en GPU consumer (RTX 3050, RTX 4060, etc.) e incluso en CPU para inferencia con llama.cpp.
- Opciones de despliegue: transformers (AutoModelForCausalLM), llama.cpp/llama-server con el GGUF Q8_0 (flag --jinja), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; dado el tamaño, se espera latencia muy baja, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Portal Core: Space (luksamuk) | 354 M | no disponible | Degenerado intencional, solo espacio, en/pt | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| LiquidAI/LFM2.5-350M (base) | 350 M | no disponible | Asistente general funcional | no disponible en la informacion | Hugging Face |
| Modelos de personaje tipo "roleplay" pequeños | variable | variable | Coherentes dentro del personaje | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo es deliberadamente degenerado: produce salidas repetitivas y sin sentido por diseño, no por un fallo de alineación.
- No puede responder preguntas, seguir instrucciones ni realizar ninguna tarea útil; el autor lo desaconseja explícitamente como asistente general.
- Riesgo de alucinación total: cualquier salida es una repetición sobre el espacio, independientemente de la entrada.
- Sesgos conocidos: no documentados en la información disponible, más allá del sesgo temático intencional hacia el espacio.
- Limitación idiomática: solo inglés y portugués.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el comportamiento del modelo lo hace inadecuado para producción.
- Caveat para producción: no usar en sistemas que requieran coherencia, atención al cliente, generación de código o cualquier tarea funcional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luksamuk/portal-core-space
- Repositorio GGUF: https://huggingface.co/luksamuk/portal-core-space-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/luksamuk/portal-cores-space-core
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
