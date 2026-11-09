# prada5023/countdown-rl-qwen3-4b-v1-s1

## Resumen

countdown-rl-qwen3-4b-v1-s1 es un adaptador LoRA (r = 16, alpha = 32) sobre el modelo base Qwen/Qwen3-4B-Base, desarrollado por el usuario prada5023. El adaptador se ha entrenado con GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo, sobre la tarea del juego de numeros Countdown, en la que el modelo debe alcanzar un numero objetivo combinando una serie de numeros con operaciones aritmeticas. La particularidad del entrenamiento es la integracion de una herramienta Python en el bucle de razonamiento: la politica escribe un bloque `<think>`, puede ejecutar codigo dentro de `<python>` (cuyo stdout se devuelve en `<output>`) y finalmente responde en `<answer>`.

El modelo no es un modelo generalista: es un adaptador especializado en tool use y razonamiento aritmetico con ejecucion de codigo, pensado como artefacto de investigacion para estudiar recetas de RL (recipe v1, replay desde cero, semilla 1). El repositorio ocupa 0,1 GB y contiene unicamente los pesos del adaptador en formato safetensors, no los pesos completos del modelo base.

Su relevancia actual es metodologica: demuestra como un modelo de 4 mil millones de parametros puede mejorar en una tarea de razonamiento estructurado mediante GRPO con una herramienta externa en el bucle, alcanzando un 51,2 % de pass@1 en el conjunto holdout3 (1.000 problemas generados con posterioridad a todas las decisiones del modelo, decodificacion greedy, 768 tokens y dos rondas de codigo). Es un ejemplo reproducible de entrenamiento con RL y tool calling sobre un modelo abierto de Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r = 16, alpha = 32) sobre transformer Qwen/Qwen3-4B-Base |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-4B-Base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-4B-Base, un transformer denso de 4 mil millones de parametros. El entrenamiento utiliza GRPO, un algoritmo de optimizacion de politica proximal basado en grupos, aplicado a la tarea Countdown con una herramienta Python en el bucle. La politica sigue un formato de tres bloques: `<think>` para el razonamiento, `<python>` para la ejecucion de codigo (cuyo stdout se devuelve en `<output>`) y `<answer>` para la respuesta final. Se trata de la receta v1, con replay desde cero y semilla 1.

El adaptador se entreno con el prompt `fewshot_multi_retry`, y el autor advierte que las politicas son especificas del prompt, por lo que la evaluacion debe realizarse con el mismo prompt. Los identificadores de ejecucion por bucket son q4s1-a..d. El repositorio de entrenamiento incluye codigo, configuraciones, logs y documentacion (configs/experiments/qwen3-4b-v1-s1/, REPORT.md, EXPERIMENTS.md), aunque no se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Razonamiento aritmetico estructurado sobre el juego Countdown: combinar numeros con operaciones para alcanzar un objetivo.
- Tool calling con Python: el modelo genera codigo en `<python>` y recibe la salida estandar en `<output>`.
- Razonamiento multi-paso con hasta dos rondas de codigo en la evaluacion.
- Modo de razonamiento explicito mediante el bloque `<think>`.
- Formato de respuesta controlado (`<think>`, `<python>`, `<output>`, `<answer>`).
- Capacidades multilingues: no disponibles (no documentadas).
- Capacidades de vision o audio: no disponibles.
- Capacidades generales de generacion de texto: limitadas al ambito del adaptador; no se documentan.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: el adaptador sirve como artefacto reproducible para estudiar recetas GRPO con tool use, comparando semillas y variantes (recipe v1, seed 1) sobre una tarea verificable.
- Evaluacion de razonamiento aritmetico con ejecucion de codigo: permite medir pass@1 en problemas Countdown con dos rondas de codigo y 768 tokens, usando el prompt `fewshot_multi_retry`.
- Experimentos de prompt engineering: al ser una politica especifica de prompt, es util para analizar como la formulacion del prompt afecta al rendimiento en tareas de tool use.
- Docencia y divulgacion: ejemplo didactico de como se estructura un bucle think-python-answer y de como se evalua con un holdout generado tras las decisiones del modelo.
- Base para fine-tuning posterior: al ser un adaptador LoRA sobre Qwen3-4B-Base, puede combinarse o continuarse con otras recetas de RL para tareas de razonamiento similares.
- Benchmarking de infraestructura de evaluacion: el comando `countdown-eval` con `--merge-adapter` y `--attn sdpa_gqa` permite probar pipelines de inferencia con atencion GQA y decodificacion greedy.
- Estudio de generalizacion: el holdout3 (1.000 problemas generados despues de todas las decisiones del modelo) permite analizar la generalizacion a problemas no vistos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| holdout3 (1.000 problemas, greedy, 768 tokens, 2 rondas de codigo) | pass@1 global | 51,2 % |
| holdout3 - dificultad facil | pass@1 | 80,2 % |
| holdout3 - dificultad media | pass@1 | 34,7 % |
| holdout3 - dificultad dificil | pass@1 | 29,0 % |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre Qwen3-4B-Base, los requisitos son los del modelo base (4B parametros) mas el adaptador (0,1 GB).
- GPU recomendadas: no disponibles en la informacion proporcionada; el modelo base de 4B es desplegable en GPU consumer de gama alta, pero no se documentan recomendaciones concretas.
- Compatibilidad con GPU consumer: probable para el modelo base en cuantizaciones bajas, pero no confirmado en la informacion disponible.
- Opciones de despliegue: el autor proporciona el comando `countdown-eval` con `--merge-adapter` y `--attn sdpa_gqa`; no se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| countdown-rl-qwen3-4b-v1-s1 | Adaptador LoRA sobre 4B | No disponible | GRPO + tool use en Countdown | Apache 2.0 | Hugging Face (adaptador) |
| Qwen/Qwen3-4B-Base | 4B | No disponible en la informacion | Modelo base generalista | No disponible en la informacion | Hugging Face |
| Alternativas de RL con tool use sobre modelos pequenos | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otros adaptadores o modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: el adaptador esta entrenado exclusivamente para el juego Countdown con tool use en Python; no es un modelo generalista.
- Dependencia del prompt: el autor advierte que las politicas son especificas del prompt `fewshot_multi_retry`; evaluar con otro prompt puede degradar el rendimiento.
- Rendimiento limitado en dificultad media y alta: 34,7 % y 29,0 % de pass@1 respectivamente, frente al 80,2 % en facil.
- Riesgo de alucinacion: no documentado, pero inherente a modelos generativos; el bucle con ejecucion de codigo puede mitigarlo parcialmente.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no documentadas; dependen del modelo base Qwen3-4B-Base.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-4B-Base puede tener sus propias condiciones que deben verificarse.
- Artefacto de investigacion: 0 descargas y 0 likes en el momento de la consulta; sin validacion externa por parte de la comunidad.
- Requiere el modelo base para su uso: el repositorio solo contiene el adaptador (0,1 GB), no los pesos completos.

## Enlaces

- Hugging Face: https://huggingface.co/prada5023/countdown-rl-qwen3-4b-v1-s1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Repositorio de entrenamiento (mencionado en la model card, sin URL explicita): configs/experiments/qwen3-4b-v1-s1/, REPORT.md, EXPERIMENTS.md
