# prada5023/countdown-rl-qwen3-8b-v1-s0

## Resumen

`countdown-rl-qwen3-8b-v1-s0` es un adaptador LoRA (r = 16, alpha = 32) desarrollado por el usuario prada5023 sobre el modelo base Qwen/Qwen3-8B-Base. No se trata de un modelo completo, sino de un ajuste fino orientado a una tarea concreta: resolver el juego de numeros Countdown mediante razonamiento con una herramienta Python en el bucle. El adaptador se entreno con GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo, y forma parte de una receta experimental versionada (recipe v1, replay desde cero, semilla 0).

El modelo resuelve un problema acotado pero representativo del razonamiento con herramientas: la politica genera un bloque de pensamiento `<think>`, puede invocar codigo Python en `<python>` cuyo stdout se devuelve en `<output>`, y finalmente emite la respuesta en `<answer>`. Esta estructura de multiples rondas de codigo lo convierte en un caso de estudio util para evaluar el entrenamiento por refuerzo con tool calling en modelos de 8.000 millones de parametros.

Es relevante ahora porque demuestra un flujo completo de RL con verificacion automatica de recompensas sobre un modelo abierto de Qwen3, con resultados medibles en un conjunto de evaluacion held-out. El autor reporta un 55,7 % de pass@1 en holdout3, con desglose por dificultad (facil 87,5 %, medio 41,7 %, dificil 27,3 %). El repositorio ocupa 0,2 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3-8B-Base) |
| Parametros totales | 8.000 millones (modelo base); adaptador LoRA con r = 16, alpha = 32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B-Base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-8B-Base, un transformer decoder-only de 8.000 millones de parametros. El ajuste se realiza mediante LoRA con rango 16 y alpha 32, lo que mantiene un numero reducido de parametros entrenables respecto al modelo base. El entrenamiento emplea GRPO, un algoritmo de optimizacion de politica proximal sin critico separado que estima la ventaja relativa dentro de grupos de muestras, adecuado para tareas con recompensa verificable.

La innovacion principal reside en el bucle de herramienta: la politica escribe un bloque `<think>`, puede ejecutar codigo Python en `<python>` (cuyo stdout regresa en `<output>`) y responde en `<answer>`. El entrenamiento se realizo con el prompt `fewshot_multi_retry` y la evaluacion debe emplear el mismo prompt, ya que las politicas son especificas del formato de prompt. La receta corresponde a la version v1, con replay desde cero y semilla 0; los identificadores de ejecucion por bucket son q8b-a..d. El repositorio de entrenamiento incluye configuraciones (`configs/experiments/qwen3-8b-v1-s0/`), REPORT.md y EXPERIMENTS.md, aunque no se detalla en la informacion disponible el volumen de tokens ni la composicion exacta del dataset.

## Capacidades

- Razonamiento estructurado con bloques `<think>` antes de la respuesta final.
- Tool calling mediante ejecucion de codigo Python en `<python>`, con retorno de stdout en `<output>`.
- Razonamiento en multiples rondas de codigo (la evaluacion reportada usa dos rondas).
- Resolucion del juego de numeros Countdown: combinar operandos con operaciones aritmeticas para alcanzar un objetivo.
- Generacion de texto y aritmetica basica dentro del dominio de la tarea.
- Capacidades multilingues: no disponibles de forma explicita; el adaptador esta especializado en una tarea aritmetica.
- No se documentan capacidades de vision, audio ni modo de pensamiento extendido mas alla del bloque `<think>`.

## Casos de uso

- Evaluacion de recetas de RL con recompensa verificable: el adaptador sirve como referencia reproducible para comparar GRPO frente a otras tecnicas sobre un modelo de 8B, gracias a la semilla fija y la configuracion versionada.
- Investigacion en tool use con modelos abiertos: permite estudiar como una politica aprende a invocar Python y a incorporar el resultado en su cadena de razonamiento, con un formato de prompt documentado.
- Generacion de datos sinteticos de razonamiento aritmetico: el modelo puede producir trazas `<think>` y `<python>` que sirvan como datos de entrenamiento para modelos menores o para destilacion.
- Benchmark interno de agentes aritmeticos: el conjunto holdout3 (1.000 problemas con dificultad facil, media y dificil) permite medir regresiones al cambiar prompts, cuantizaciones o rondas de codigo.
- Prototipado de asistentes que resuelven problemas numericos paso a paso: util en entornos educativos o de demostracion donde se requiere mostrar el razonamiento y la verificacion con codigo.
- Estudio de la sensibilidad al prompt: al ser una politica especifica del prompt `fewshot_multi_retry`, permite analizar como variaciones en el formato afectan al rendimiento y al uso de la herramienta.

## Benchmarks y rendimiento

| Benchmark | Resultado | Detalle |
|---|---|---|
| holdout3 pass@1 (greedy, 768 tokens, 2 rondas de codigo) | 55,7 % | 1.000 problemas generados tras todas las decisiones del modelo |
| holdout3 - facil | 87,5 % | Subconjunto por dificultad |
| holdout3 - medio | 41,7 % | Subconjunto por dificultad |
| holdout3 - dificil | 27,3 % | Subconjunto por dificultad |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador LoRA sobre un modelo de 8B, los requisitos son los del modelo base. En precision fp16 se estiman del orden de 16 GB solo para pesos, mas memoria para KV cache y el adaptador.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano del modelo base, cabria esperar GPUs de 24 GB o superiores (RTX 4090, A100, H100) para fp16, y GPUs con menos VRAM si se cuantiza el modelo base.
- Compatibilidad con GPU de consumo: probable en RTX 4090 (24 GB) en fp16 con contexto moderado; en GPUs de 16 GB requeriria cuantizacion del modelo base, aunque no se documentan cuantizaciones del adaptador.
- Opciones de despliegue: el ejemplo del autor usa `countdown-eval` con `--merge-adapter` y atencion `sdpa_gqa`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La evaluacion usa 768 tokens maximos y dos rondas de codigo, lo que implica al menos dos pasadas de generacion por problema.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| countdown-rl-qwen3-8b-v1-s0 | 8B (base) + LoRA r=16 | no disponible | RL con GRPO y tool use sobre Countdown | apache-2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3-8B-Base | 8B | no disponible | Modelo base sin ajuste de tarea | no disponible | Hugging Face |
| Alternativas de RL con tool use sobre modelos de 8B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El adaptador esta especializado exclusivamente en el juego Countdown; su rendimiento fuera de ese dominio no esta documentado y probablemente sea limitado.
- La politica es especifica del prompt `fewshot_multi_retry`; evaluar con otro formato de prompt puede degradar gravemente los resultados.
- El resultado de 55,7 % pass@1 se obtuvo con configuracion concreta (greedy, 768 tokens, dos rondas de codigo); cambiar estos parametros altera la metrica.
- No se documentan sesgos conocidos, pero al derivar de Qwen3-8B-Base hereda los sesgos del modelo base y de sus datos de entrenamiento.
- Riesgo de alucinacion en la generacion de codigo Python y en la interpretacion de resultados intermedios; la verificacion automatica mitiga pero no elimina este riesgo.
- No se especifican los idiomas soportados; la tarea es aritmetica y el prompt de entrenamiento esta en un formato fijo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B-Base tiene su propia licencia que debe verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026-11-09; se trata de un artefacto de investigacion sin validacion externa conocida.
- No se documentan cuantizaciones del adaptador ni su comportamiento tras fusion con versiones cuantizadas del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/prada5023/countdown-rl-qwen3-8b-v1-s0
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Repositorio de entrenamiento (mencionado en la model card, sin URL directa): configuraciones en `configs/experiments/qwen3-8b-v1-s0/`, REPORT.md y EXPERIMENTS.md
- No se han encontrado otros enlaces (papers, blogs, demos) en la informacion disponible.
