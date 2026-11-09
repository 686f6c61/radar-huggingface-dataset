# prada5023/countdown-rl-qwen3-4b-v2-zeroshot-s2

## Resumen

countdown-rl-qwen3-4b-v2-zeroshot-s2 es un adaptador LoRA (r = 16, alpha = 32) sobre el modelo base Qwen/Qwen3-4B-Base, desarrollado por el usuario prada5023 y publicado bajo licencia Apache 2.0. No se trata de un modelo completo, sino de un adaptador PEFT que se carga sobre el modelo base y que se ha entrenado con GRPO (Group Relative Policy Optimization) para resolver el juego de numeros Countdown mediante razonamiento con uso de herramienta Python en el bucle.

El problema que aborda es el de la resolucion de tareas aritmeticas de busqueda combinatoria con verificacion externa: la politica genera bloques `<think>`, puede invocar un interprete Python mediante `<python>` cuyo stdout regresa en `<output>`, y finalmente emite la respuesta en `<answer>`. Es relevante como ejemplo reproducible de entrenamiento por refuerzo con tool use sobre un modelo pequeno (4B parametros), con receta, configuraciones y logs publicados en el repositorio acompanante.

El adaptador reporta un 69.9% de pass@1 en el conjunto holdout3 (1.000 problemas generados despues de todas las decisiones del modelo, decodificacion greedy, 768 tokens, dos rondas de codigo), con desglose por dificultad de 87.8% en facil, 55.7% en medio y 60.3% en dificil. El repo pesa 0.1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3-4B-Base) con adaptador LoRA |
| Parametros totales | 4B en el modelo base; el adaptador LoRA no declara numero de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-4B-Base, un transformer decoder-only de 4.000 millones de parametros. El entrenamiento utiliza GRPO, un algoritmo de optimizacion por refuerzo sin modelo critico que estima la ventaja relativa de un grupo de respuestas muestreadas para la misma pregunta. El adaptador LoRA tiene rango 16 y alpha 32, y se distribuye en formato PEFT sobre safetensors.

La innovacion principal es la integracion de una herramienta Python en el bucle de entrenamiento: la politica aprende a emitir `<think>`, a ejecutar codigo mediante `<python>` (cuyo stdout se devuelve en `<output>`) y a formular la respuesta final en `<answer>`. El prompt utilizado es `r1zero_tool` y la evaluacion debe realizarse con el mismo prompt, ya que las politicas son especificas al formato de prompt. La receta v2 corresponde a un prompt zero-shot con semilla 2; los identificadores de ejecucion por bucket son q4v2z2-a..d. El repositorio acompanante incluye configuraciones en `configs/experiments/qwen3-4b-v2-zeroshot-s2/`, ademas de REPORT.md y EXPERIMENTS.md. No se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de los problemas de Countdown.

## Capacidades

- Razonamiento aritmetico y combinatorio sobre el juego Countdown (alcanzar un objetivo numerico usando operaciones con un conjunto de numeros dados).
- Generacion de trazas de razonamiento explicitas en el bloque `<think>`.
- Uso de herramienta externa: emision de codigo Python en `<python>` y consumo del resultado en `<output>`.
- Respuesta estructurada en `<answer>`.
- Razonamiento multi-paso con hasta dos rondas de ejecucion de codigo en la evaluacion de referencia.
- Entrenamiento por refuerzo orientado a tool use (no es un modelo de proposito general afinado por instrucciones).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio o thinking mode extendido: no disponibles.

## Casos de uso

- Investigacion en RL con tool use: el adaptador sirve como referencia reproducible para estudiar como GRPO moldea el uso de una herramienta Python en modelos de 4B, con receta, configuraciones y logs publicados.
- Evaluacion de pipelines de razonamiento con verificacion externa: se puede integrar en un bucle que ejecute el codigo generado y devuelva el stdout al modelo, replicando el esquema `<python>`/`<output>`.
- Generacion de soluciones aritmeticas verificables: en entornos donde la respuesta final puede comprobarse programaticamente, el modelo produce una traza y un resultado auditable.
- Estudio de sensibilidad a prompts: al ser una politica especifica al prompt `r1zero_tool`, permite analizar como variaciones del formato afectan al rendimiento en tareas de busqueda combinatoria.
- Base para ablaciones de hiperparametros LoRA: con r = 16 y alpha = 32 documentados, sirve como punto de partida para comparar rangos, semillas y recetas sobre el mismo modelo base.
- Docencia y divulgacion: ejemplo compacto (repo de 0.1 GB) para explicar GRPO, adaptadores PEFT y evaluacion con pass@1 por dificultad.

## Benchmarks y rendimiento

Resultados reportados por el autor en el conjunto holdout3 (1.000 problemas, greedy, 768 tokens, dos rondas de codigo):

| Metrica | Resultado |
|---|---|
| pass@1 global | 69.9% |
| pass@1 dificultad facil | 87.8% |
| pass@1 dificultad media | 55.7% |
| pass@1 dificultad dificil | 60.3% |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni en otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al tratarse de un adaptador sobre un modelo de 4B, la huella de inferencia la determina el modelo base y la cuantizacion elegida.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: el autor documenta evaluacion mediante el comando `countdown-eval` con `--merge-adapter` y `--attn sdpa_gqa`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros adaptadores o modelos de la misma categoria.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere cargar Qwen/Qwen3-4B-Base y, para evaluacion, fusionar el adaptador (`--merge-adapter`).
- La politica es especifica al prompt `r1zero_tool`; evaluar con otro formato de prompt puede degradar el rendimiento de forma significativa.
- El ambito de entrenamiento es el juego Countdown con una herramienta Python; no hay evidencia de capacidades generales de conversacion, codigo o instrucciones.
- Los resultados de 69.9% pass@1 provienen del autor y de un conjunto holdout3 generado despues de las decisiones del modelo; no se han replicado de forma independiente en la informacion disponible.
- No se documentan sesgos, riesgos de alucinacion especificos ni evaluaciones de seguridad.
- Idiomas soportados no disponibles: no se puede garantizar un comportamiento multilingue.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3-4B-Base tiene su propia licencia que debe verificarse por separado.
- El repo no registra descargas ni likes, por lo que no hay senales de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/prada5023/countdown-rl-qwen3-4b-v2-zeroshot-s2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Repositorio acompanante (configs, REPORT.md, EXPERIMENTS.md): referenciado en la model card como "the accompanying repository", sin URL explicita en la informacion proporcionada.
