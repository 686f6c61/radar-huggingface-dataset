# prada5023/countdown-rl-qwen3-4b-v1-s2

## Resumen

`countdown-rl-qwen3-4b-v1-s2` es un adaptador LoRA (r = 16, alpha = 32) sobre el modelo base Qwen/Qwen3-4B-Base, desarrollado por el usuario prada5023. El adaptador se ha entrenado con GRPO (Group Relative Policy Optimization, la variante de RL sin modelo crítico popularizada por DeepSeek) para resolver el juego de numeros Countdown, un problema de razonamiento aritmetico con busqueda combinatoria, integrando una herramienta Python en el bucle de razonamiento.

El modelo es un experimento de investigacion sobre uso de herramientas y razonamiento en modelos pequenos: la politica genera un bloque `<think>`, puede invocar un interprete Python mediante etiquetas `<python>` cuyo stdout se devuelve en `<output>`, y finalmente emite la respuesta en `<answer>`. No es un modelo de proposito general, sino un artefacto especializado para estudiar como el RL con recompensa verificable mejora el uso de herramientas en tareas acotadas.

Su relevancia es metodologica: publica un resultado concreto (49,8% pass@1 en un holdout de 1.000 problemas generados tras las decisiones del modelo) y acompana codigo, configuraciones y bitacora de experimentos, lo que permite reproducir y comparar recetas de RL con herramientas en el bucle. El tamano es modesto (4B parametros base) y la licencia Apache 2.0, lo que facilita su inspeccion y reutilizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B-Base) con adaptador LoRA (r = 16, alpha = 32) |
| Parametros totales | 4B en el modelo base; el adaptador LoRA anade un subconjunto no especificado de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible (la model card no especifica idiomas; el entrenamiento es en torno al juego Countdown en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3-4B-Base |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3-4B-Base, un transformer decoder-only de 4B parametros. El adaptador tiene rango 16 y alpha 32, y se entrena con GRPO, un algoritmo de optimizacion de politica con recompensas verificables que no requiere un modelo critico separado. El entrenamiento se realiza sobre el juego Countdown, en el que el modelo debe combinar numeros dados con operaciones aritmeticas para alcanzar un objetivo, y se le permite escribir codigo Python que se ejecuta en el bucle y cuyo resultado se reinyecta en el contexto.

La receta concreta es la version v1, con replay desde cero y semilla 2 (identificadores de ejecucion q4s2-a..d). El prompt de entrenamiento es `fewshot_multi_retry`, con un maximo de dos rondas de codigo y 768 tokens de generacion para la evaluacion. La model card advierte que las politicas son especificas del prompt y que deben evaluarse con el mismo formato con el que se entrenaron.

## Capacidades

- Razonamiento aritmetico y combinatorio sobre el juego Countdown: dado un conjunto de numeros y un objetivo, propone operaciones para alcanzarlo.
- Uso de herramientas en el bucle: emite bloques `<python>` que se ejecutan y cuyo stdout se devuelve en `<output>`.
- Razonamiento explicito en modo thinking: genera un bloque `<think>` antes de la respuesta final.
- Respuesta estructurada: emite el resultado final en `<answer>`.
- Multiples rondas de codigo (hasta dos en la configuracion de evaluacion reportada).
- No se documentan capacidades de vision, audio, tool calling generico ni agentes fuera del dominio Countdown.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en RL con recompensa verificable: sirve como punto de partida reproducible para estudiar GRPO con herramientas en el bucle en modelos de 4B, comparando recetas y semillas.
- Evaluacion de uso de herramientas en modelos pequenos: permite medir como un modelo de 4B aprende a delegar calculo en Python en lugar de razonar aritmeticamente de forma implicita.
- Benchmark de razonamiento aritmetico: el holdout3 (1.000 problemas) y la separacion por dificultad (easy, medium, hard) permiten analizar el comportamiento por nivel de dificultad.
- Reproduccion de experimentos: el repositorio acompanante incluye configuraciones, logs y bitacora (REPORT.md, EXPERIMENTS.md) para replicar el entrenamiento.
- Estudio de sensibilidad al prompt: al ser una politica especifica de prompt, permite analizar como el formato few-shot afecta al rendimiento en tareas de razonamiento.
- Base para destilacion o fine-tuning posterior en tareas de calculo asistido por codigo: el adaptador puede combinarse con el modelo base y servir de inicializacion para dominios similares.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| holdout3 (1.000 problemas, greedy, 768 tokens, dos rondas de codigo) | pass@1 global | 49,8% |
| holdout3, dificultad easy | pass@1 | 80,2% |
| holdout3, dificultad medium | pass@1 | 33,7% |
| holdout3, dificultad hard | pass@1 | 25,3% |

No se han publicado resultados de benchmarks en la informacion disponible mas alla del holdout3 reportado por el autor. No hay comparaciones con modelos similares en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo base de 4B en FP16 se requieren aproximadamente 8-10 GB, y en cuantizacion de 4 bits alrededor de 3-4 GB, aunque estas cifras son estimaciones generales para modelos de ese tamano y no estan confirmadas en la model card.
- GPU recomendadas: no especificadas por el autor; por tamano, una RTX 4090 (24 GB) o una A100/H100 son suficientes para el modelo base en precision completa.
- Cabe en GPU de consumo: previsiblemente si, en GPUs con 8 GB o mas en cuantizacion, aunque no esta documentado.
- Opciones de despliegue: el autor proporciona un comando de evaluacion con `countdown-eval`, descarga via `hf download` y fusion del adaptador con `--merge-adapter`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros adaptadores o modelos de razonamiento con uso de herramientas. Como referencia estructural, el modelo base Qwen3-4B-Base es un transformer de 4B parametros con licencia Apache 2.0, pero no se dispone de datos de rendimiento comparables en esta ficha.

## Limitaciones y advertencias

- Especializacion estrecha: el adaptador esta entrenado exclusivamente para el juego Countdown con un formato de prompt concreto; no es un modelo de proposito general.
- Dependencia del prompt: el autor advierte que las politicas son especificas del prompt `fewshot_multi_retry`; evaluar con otro formato puede degradar el rendimiento de forma significativa.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar razonamientos o codigo incorrectos; la recompensa verificable mitiga pero no elimina este riesgo.
- Limitaciones de contexto e idioma: no documentadas; el entrenamiento se orienta a problemas en ingles y a una ventana de 768 tokens de generacion en la evaluacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base Qwen/Qwen3-4B-Base, cuyos terminos deben respetarse.
- Madurez: solo 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigacion sin validacion externa.
- Caveat de produccion: no se han publicado datos de latencia, throughput ni robustez fuera del holdout reportado; no se recomienda su uso en produccion sin evaluacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/prada5023/countdown-rl-qwen3-4b-v1-s2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Repositorio de codigo, configuraciones y bitacora: referenciado en la model card como repositorio acompanante (`configs/experiments/qwen3-4b-v1-s2/`, REPORT.md, EXPERIMENTS.md); la URL exacta no esta disponible en la informacion proporcionada.
