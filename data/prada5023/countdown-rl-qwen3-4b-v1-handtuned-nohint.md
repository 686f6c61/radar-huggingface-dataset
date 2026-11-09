# prada5023/countdown-rl-qwen3-4b-v1-handtuned-nohint

## Resumen

`countdown-rl-qwen3-4b-v1-handtuned-nohint` es un adaptador LoRA (r = 16, alpha = 32) sobre el modelo base Qwen/Qwen3-4B-Base, desarrollado por el usuario prada5023. No es un modelo completo, sino un checkpoint de ajuste fino orientado a una tarea muy concreta: resolver el juego de numeros Countdown mediante razonamiento con uso de herramienta Python en el bucle. El entrenamiento se realizo con GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo, y corresponde a la receta v1, fase d, sin remuestreo con pistas (ablacion).

La relevancia de este artefacto es acotada pero clara para quien investiga RL aplicado a razonamiento con herramientas: documenta una politica que escribe en `<think>`, puede ejecutar codigo en `<python>` (cuya salida stdout regresa en `<output>`) y responde en `<answer>`. El autor lo marca explicitamente como checkpoint de ablacion no evaluado sobre el conjunto holdout3, por lo que su interes es experimental y de reproducibilidad, no de uso en produccion.

El modelo base subyacente es Qwen3-4B-Base, un transformer de 4 mil millones de parametros. El adaptador ocupa aproximadamente 0,1 GB en el repositorio y se distribuye con licencia Apache 2.0. No se proporcionan datos de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r = 16, alpha = 32) sobre Qwen/Qwen3-4B-Base (transformer) |
| Parametros totales | Adaptador LoRA; el modelo base Qwen3-4B-Base tiene 4 mil millones de parametros (no se detalla el numero de parametros entrenables del adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Base, un transformer denso de 4 mil millones de parametros. El ajuste se realiza mediante LoRA con rango 16 y alpha 32, lo que mantiene un numero reducido de parametros entrenables y permite distribuir el adaptador como un fichero pequeno (0,1 GB). El entrenamiento emplea GRPO, un algoritmo de optimizacion por politica que estima ventajas relativas dentro de grupos de muestras, sin necesidad de un modelo critico separado.

La innovacion principal es el bucle de herramienta: la politica genera bloques `<think>`, puede invocar `<python>`, recibe la salida del interprete en `<output>` y finalmente emite `<answer>`. El entrenamiento usa el prompt `fewshot_multi_retry` y corresponde a la fase d de la receta v1, sin remuestreo con pistas (ablacion `nohint`). Segun la model card, las politicas son especificas del prompt, por lo que deben evaluarse con el mismo estilo de prompt. El checkpoint corresponde al step 80 del bucket run id `p10bnh`. No se detallan el numero de tokens de entrenamiento ni la composicion del dataset mas alla de la tarea Countdown.

## Capacidades

- Razonamiento aritmetico estructurado para el juego Countdown (combinar numeros con operaciones para alcanzar un objetivo).
- Generacion de trazas de razonamiento en el bloque `<think>`.
- Uso de herramienta Python en el bucle: emite `<python>`, consume la salida en `<output>`.
- Formato de respuesta controlado mediante etiquetas `<answer>`.
- Soporte de multiples rondas de herramienta (la evaluacion de referencia usa `--max-rounds 2`).
- Capacidades generales heredadas del modelo base Qwen3-4B-Base (no verificadas en esta ficha).
- Soporte de tool calling generico: no disponible como capacidad general mas alla del bucle Python descrito.

## Casos de uso

- Investigacion en RL para razonamiento con herramientas: sirve como referencia reproducible de una politica entrenada con GRPO que alterna pensamiento, ejecucion de codigo y respuesta, util para comparar recetas y ablaciones.
- Ablacion controlada de remuestreo con pistas: al ser el checkpoint `nohint`, permite medir el efecto de eliminar pistas en el entrenamiento frente a variantes con pistas del mismo repositorio.
- Evaluacion de politicas prompt-specific: util para estudiar como el estilo de prompt (`fewshot_multi_retry`) condiciona el rendimiento y la estabilidad del bucle de herramienta.
- Prototipado de agentes con interprete Python: el esquema `<think>`/`<python>`/`<output>`/`<answer>` sirve de plantilla para construir agentes que resuelven problemas aritmeticos ejecutando codigo.
- Docencia y divulgacion sobre RL aplicado a LLM: el par adaptador + codigo de entrenamiento (configs, REPORT.md, EXPERIMENTS.md) facilita explicar el ciclo completo de GRPO con herramienta en el bucle.
- Reproduccion de experimentos: la instruccion de evaluacion con `countdown-eval`, `--merge-adapter` y `--attn sdpa_gqa` permite replicar el pipeline de evaluacion sobre `data/holdout3.jsonl`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que es un checkpoint de ablacion no evaluado sobre holdout3 (ver EXPERIMENTS.md, seccion 2).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre un modelo de 4 mil millones de parametros, el requisito dominante es el del modelo base, no el del adaptador (0,1 GB).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: no confirmado en la informacion; depende del modelo base y de la cuantizacion, no detalladas.
- Opciones de despliegue: la model card documenta el uso mediante `peft` y la herramienta `countdown-eval` con `--merge-adapter` y `--attn sdpa_gqa`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| countdown-rl-qwen3-4b-v1-handtuned-nohint | Adaptador LoRA sobre base de 4B | no disponible | Adaptador PEFT (GRPO, tool-use) | apache-2.0 | Hugging Face |
| Qwen/Qwen3-4B-Base | 4B | no disponible | Modelo base denso | no disponible en esta ficha | Hugging Face |
| Alternativas de RL para Countdown | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores o modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Checkpoint de ablacion: el autor indica que no ha sido evaluado sobre holdout3, por lo que no hay garantia de rendimiento medido.
- Politica especifica de prompt: debe evaluarse con el prompt `fewshot_multi_retry`; otros estilos de prompt pueden degradar el comportamiento.
- Tarea acotada: entrenado para el juego Countdown con herramienta Python; no es un modelo de proposito general.
- No es un modelo completo: requiere cargar Qwen/Qwen3-4B-Base y aplicar el adaptador (o fusionarlo) para su uso.
- Riesgo de alucinacion: no documentado en la informacion disponible; aplicable el riesgo general del modelo base.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: no disponibles (idiomas no especificados).
- Restricciones de licencia: Apache 2.0, lo que permite uso comercial del adaptador; deben verificarse las condiciones del modelo base Qwen3-4B-Base por separado.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/prada5023/countdown-rl-qwen3-4b-v1-handtuned-nohint
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Repositorio de entrenamiento (mencionado en la model card, sin URL explicita): `configs/experiments/qwen3-4b-v1-handtuned-nohint/`, `REPORT.md`, `EXPERIMENTS.md`
- Paper, blog o demo: no disponible en la informacion proporcionada.
