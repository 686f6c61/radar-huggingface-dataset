# prada5023/countdown-rl-qwen3-4b-v2-demo-s2

## Resumen

`countdown-rl-qwen3-4b-v2-demo-s2` es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3-4B-Base mediante aprendizaje por refuerzo con el algoritmo GRPO (Group Relative Policy Optimization). Lo publica el usuario prada5023 y su proposito es resolver el juego de numeros Countdown: dada una lista de numeros y un objetivo, el modelo debe construir una expresion aritmetica que alcance exactamente ese resultado. El adaptador esta pensado como artefacto de investigacion y demo de un recipe concreto (recipe v2, prompt de demostracion, semilla 2).

La particularidad tecnica del entrenamiento es la integracion de una herramienta Python en el bucle de razonamiento: la politica genera bloques `<think>`, puede invocar `<python>` cuyo stdout retorna en `<output>`, y finalmente emite la respuesta en `<answer>`. Esto lo convierte en un caso de estudio de RL con tool use, no solo de aritmetica. El adaptador es pequeno (r = 16, alpha = 32) y el repositorio ocupa 0,1 GB, lo que refleja que solo se distribuyen los pesos LoRA y no el modelo completo.

El modelo base Qwen3-4B aporta una arquitectura transformer de aproximadamente 4.000 millones de parametros con licencia Apache 2.0. El adaptador hereda esa licencia. El autor reporta un 68,1 % de pass@1 en el holdout3 (1.000 problemas generados con posterioridad a todas las decisiones del modelo, decodificacion greedy, 768 tokens y dos rondas de codigo), con desglose por dificultad: 88,8 % en facil, 57,7 % en medio y 51,0 % en dificil. No hay datos publicos de benchmarks generales ni de idiomas soportados mas alla de los que aporta el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Qwen3-4B-Base |
| Parametros totales | No disponible (adaptador LoRA con r = 16, alpha = 32; el modelo base tiene ~4.000 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3-4B-Base, un transformer decoder-only de la familia Qwen3. El entrenamiento emplea GRPO, un algoritmo de optimizacion de politica por refuerzo sin critico separado que estima ventajas relativas dentro de un grupo de muestras para la misma prompt. La politica esta estructurada en tres fases: un bloque `<think>` de razonamiento libre, invocaciones opcionales de `<python>` cuyo resultado se inyecta como `<output>`, y una respuesta final en `<answer>`. El entorno de evaluacion permite hasta dos rondas de codigo (`--max-rounds 2`).

El recipe v2 se entreno con el prompt `fewshot_multi_retry`, y el autor advierte explicitamente que las politicas son especificas del prompt: hay que evaluar con el mismo estilo de prompt usado en entrenamiento, so pena de degradar el rendimiento. El holdout3 se genero despues de todas las decisiones del modelo, lo que reduce el riesgo de contaminacion. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset de RL ni si hubo etapas adicionales de SFT o DPO. Los identificadores de bucket del run son q4v2s2-a..d, y el codigo, configs, logs y write-up estan en un repositorio acompanante no enlazado en la model card.

## Capacidades

- Razonamiento aritmetico estructurado: resuelve problemas de Countdown construyendo expresiones con los numeros dados para alcanzar un objetivo exacto.
- Razonamiento explicito con modo thinking: genera trazas internas en `<think>` antes de responder.
- Tool use en el bucle: emite llamadas `<python>`, recibe stdout en `<output>` y puede encadenar hasta dos rondas de ejecucion de codigo.
- Formato de respuesta controlado: salida final delimitada en `<answer>`, lo que facilita el parseo automatico en pipelines.
- Aprendizaje por refuerzo con verificacion programatica: la recompensa se apoya en la comprobacion de la solucion, no en preferencias humanas.
- No se reportan capacidades de vision, audio, agentes multi-paso genericos ni tool calling fuera del entorno Python del juego.

## Casos de uso

- Investigacion en RL con herramientas: usar el adaptador como linea base reproducible para estudiar como GRPO moldea el uso de una herramienta externa (Python) dentro de la traza de razonamiento.
- Evaluacion de robustez aritmetica: medir pass@1 por dificultad (facil, medio, dificil) en problemas nuevos generados tras el entrenamiento para detectar sobreajuste al dataset de RL.
- Desarrollo de entornos verificables: replicar el esquema `<think>`/`<python>`/`<output>`/`<answer>` como plantilla para entrenar otros agentes con recompensa determinista (por ejemplo, puzzles combinatorios o validacion de expresiones).
- Generacion de datos sinteticos de razonamiento: emplear las trazas generadas por el adaptador como corpus de cadenas de pensamiento con verificacion automatica para destilar modelos mayores.
- Benchmarking de adaptadores PEFT: comparar recipes (v1 frente a v2), prompts (`fewshot_multi_retry` frente a otros) y semillas sobre el mismo modelo base para aislar el efecto del diseno del entrenamiento.
- Demos de tool use en entornos controlados: desplegar el adaptador con `countdown-eval` para mostrar en vivo como el modelo escribe codigo, lee la salida y corrige la expresion en una segunda ronda.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| holdout3 (1.000 problemas, greedy, 768 tokens, 2 rondas) | pass@1 global | 68,1 % |
| holdout3, dificultad facil | pass@1 | 88,8 % |
| holdout3, dificultad media | pass@1 | 57,7 % |
| holdout3, dificultad dificil | pass@1 | 51,0 % |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores corresponden exclusivamente al juego Countdown y al protocolo descrito por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia estructural, el modelo base Qwen3-4B en precision BF16 requiere del orden de 8 GB solo para pesos, mas memoria para KV cache y activaciones; el adaptador LoRA anade una cantidad marginal.
- GPU recomendadas: no disponible. Por tamano del modelo base, encajan GPUs de 16-24 GB (RTX 4090, A10, L4) en BF16 o FP16, y GPUs de 8-12 GB si se cuantiza el base.
- Cabe en GPU consumer: previsiblemente si, en tarjetas de 12-24 GB, aunque el dato no esta confirmado en la model card.
- Opciones de despliegue: el autor documenta un flujo especifico con `hf download` y `uv run countdown-eval` con `--merge-adapter` y atencion `sdpa_gqa`. Para servir el modelo de forma generica, al ser un adaptador PEFT sobre Qwen3-4B-Base, es compatible con vLLM, TGI y llama.cpp/Ollama tras fusionar el adaptador y exportar a GGUF.
- Latencia y throughput: no disponibles. La evaluacion usa 768 tokens maximos y hasta 2 rondas de codigo, lo que implica varias llamadas al modelo por problema y, por tanto, mayor coste que una generacion simple.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| countdown-rl-qwen3-4b-v2-demo-s2 | LoRA r=16 sobre Qwen3-4B (~4.000 M) | No disponible | 68,1 % pass@1 en holdout3 (Countdown) | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B-Base | ~4.000 M | No disponible | No disponible para Countdown | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B (instruct) | ~4.000 M | No disponible | No disponible para Countdown | Apache 2.0 | Hugging Face |

No se dispone de otros adaptadores comparables de Countdown con resultados publicos en la informacion proporcionada, por lo que la comparativa se limita al modelo base y a la variante instruct de la misma familia.

## Limitaciones y advertencias

- Dependencia estricta del prompt: el autor indica que las politicas son especificas del prompt y que se debe evaluar con `fewshot_multi_retry`; otros prompts pueden degradar el rendimiento de forma significativa.
- Dominio muy acotado: el adaptador esta entrenado para Countdown con Python en el bucle; no es un modelo generalista y su rendimiento fuera de esa tarea no esta caracterizado.
- Riesgo de alucinacion: las trazas `<think>` pueden contener razonamientos plausibles pero incorrectos; la garantia de correccion depende de la verificacion programatica, no de la coherencia textual.
- Sesgos conocidos: no se documentan sesgos especificos; el adaptador hereda los del modelo base Qwen3-4B-Base, no evaluados en la model card.
- Idiomas: no se declaran idiomas soportados; el entrenamiento y los prompts documentados estan en ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-4B-Base y de cualquier dependencia del repositorio acompanante.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado en noviembre de 2026; es un artefacto de demo, sin garantias de mantenimiento ni de reproducibilidad externa.
- Contaminacion: el holdout3 se genero despues de las decisiones del modelo, lo que mitiga pero no elimina el riesgo de solapamiento con el dataset de entrenamiento; los resultados deben interpretarse dentro de ese protocolo.

## Enlaces

- Hugging Face: https://huggingface.co/prada5023/countdown-rl-qwen3-4b-v2-demo-s2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Repositorio acompanante (codigo, configs, logs, REPORT.md, EXPERIMENTS.md): referenciado en la model card como "the accompanying repository", sin URL explicita en la informacion disponible.
- Paper de GRPO (referencia metodologica): no disponible en la informacion proporcionada.
- Demo o espacio interactivo: no disponible.
