# sitao/atomic-to-composite-qwen2.5-0.5b-sft-atomic

## Resumen

Este modelo es un ajuste fino (SFT) a escala completa de Qwen2.5-0.5B, desarrollado por el investigador Sitao Cheng como parte del proyecto de investigación "From Atomic to Composite: Reinforcement Learning Enables Generalization in Complementary Reasoning" (arXiv:2512.01970). Se trata de un artefacto de investigación centrado en estudiar la composición de habilidades (skill composition) y la generalización composicional en modelos de lenguaje pequeños, no de un asistente de propósito general.

El modelo ha sido entrenado exclusivamente con datos de habilidades "atómicas": conocimiento paramétrico (MEM, memorizado en los pesos) y conocimiento contextual (CTX, recuperable de los párrafos proporcionados en el prompt). Importantemente, no ha visto ningún ejemplo de la tarea "complementaria" (COMP), que requiere combinar ambos tipos de conocimiento, como memorizar un dato de una biografía sintética y razonar sobre él multi-hop combinándolo con el contexto. Es el punto de partida de la receta "atomic-first", en la que posteriormente se aplica RL (GRPO) para lograr generalización.

Su relevancia es principalmente académica: permite comparar experimentalmente si entrenar primero con habilidades atómicas frente a entrenar directamente con la tarea compuesta mejora la generalización tras el refuerzo. Con 494 millones de parámetros, es un modelo ligero basado en la arquitectura transformer de Qwen2, con pesos en safetensors y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B) |
| Tipos de cuantizacion | no disponible (pesos originales en bf16/fp16) |
| Idiomas soportados | Ingles (entrenado solo en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder convencional de la familia Qwen2.5 de Alibaba, al que se le aplica un SFT (supervised fine-tuning) de parametros completos, es decir, se actualizan todos los pesos, sin usar LoRA ni otras tecnicas de adaptacion eficiente. El entrenamiento se realizo con el framework LLaMA-Factory.

Los datos de entrenamiento provienen del dataset sintetico `sitao/From_atomic_to_composite`, compuesto por biografias sinteticas. El modelo solo ve los datos de entrenamiento MEM (conocimiento parametrico: hechos que debe memorizar) y CTX (conocimiento contextual: hechos presentes en los parrafos del prompt), sin ningun ejemplo de la tarea COMP (combinacion de ambos mediante razonamiento multi-hop). La fase posterior del pipeline (no aplicada a este checkpoint) usa GRPO (Group Relative Policy Optimization) implementado en verl. El modelo genera cadenas de razonamiento y finaliza con el patron `So, the answer is: <answer>`.

## Capacidades

- Respuesta a preguntas multi-hop sobre biografias sinteticas, combinando (de forma limitada en este checkpoint) conocimiento memorizado y contextual
- Generacion de cadenas de razonamiento explicitas antes de dar la respuesta final
- Seguimiento de un formato de prompt concreto: pregunta seguida de parrafos de contexto tras la marca `PARAGRAPH:`
- Generacion de texto en ingles
- No esta diseñado ni entrenado para: uso general, codigo, matematicas, vision, audio, tool calling ni agentes

## Casos de uso

- Investigacion en generalizacion composicional: sirve como baseline SFT-atomic para medir cuanto mejora la generalizacion COMP tras aplicar RL en la receta atomic-first
- Estudio de scaling laws de habilidades: el paper lo reporta en la Figure 8 (model scaling), util para analizar como escala la composicion de habilidades con el tamano del modelo
- Analisis de memoria parametrica frente a conocimiento contextual: permite estudiar como un modelo pequeño retiene hechos en pesos frente a usarlos desde el prompt
- Reproduccion de experimentos de RL con GRPO: es el checkpoint de partida documentado para replicar la fase de refuerzo del paper con verl
- Docencia y tutoriales sobre SFT a parametros completos con LLaMA-Factory en modelos de menos de 500M de parametros
- Evaluacion de benchmarks sinteticos de multi-hop QA: puede usarse como sistema base en evaluaciones sobre el COMP test set de 4.468 items

## Benchmarks y rendimiento

Resultados publicados sobre el conjunto de test Complementary (COMP) de 4.468 items, por nivel de generalizacion (precision en %):

| IID | Composition | Zero-shot |
|---:|---:|---:|
| 16,21 | 16,75 | 20,37 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los numeros anteriores provienen del log de validacion del entrenamiento, tal y como se reporta en el paper.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-1,5 GB en fp16/bf16 (494M de parametros), mas overhead del tokenizer y contexto; accesible sin GPU dedicada
- Cabe comodamente en GPUs de consumo: cualquier GPU moderna con 4 GB de VRAM o mas, e incluso CPU (con latencia mayor)
- GPUs recomendadas: no requiere GPU de servidor; una RTX 3060, RTX 4060 o superior es mas que suficiente
- Despliegue: transformers (codigo oficial del README), compatible con text-generation-inference y endpoints de HuggingFace; no hay pesos GGUF publicados en la informacion disponible
- Latencia y throughput estimados: no disponible

## Comparativa con modelos similares

Comparativa con los otros tres checkpoints del mismo experimento (mismo tamano, mismo dataset, mismo paper):

| Modelo | Receta | Generalizacion COMP esperada | Licencia |
|---|---|---|---|
| sft-atomic (este) | SFT solo en habilidades atomicas (Mem+Ctx) | Baja (baseline sin RL) | Apache 2.0 |
| sft-composite | SFT directo en la tarea compuesta | no disponible | Apache 2.0 |
| atomic-first-rl | SFT atomico + RL (GRPO) sobre COMP | Alta segun el paper | Apache 2.0 |
| composite-first-rl | SFT compuesto + RL (GRPO) sobre COMP | no disponible | Apache 2.0 |

Frente a Qwen2.5-0.5B base, este modelo esta especializado en el formato de QA sobre biografias sinteticas del experimento y pierde generalidad como asistente. No se han incluido otros modelos del mercado en la comparativa al tratarse de un artefacto de investigacion con una tarea muy especifica.

## Limitaciones y advertencias

- No es un asistente de proposito general: el propio autor advierte que es un artefacto de investigacion entrenado sobre biografias sinteticas
- Rendimiento muy bajo en la tarea COMP sin RL: entre 16,21 % y 20,37 % de precision, insuficiente para cualquier uso practico real
- Alto riesgo de alucinacion fuera de su dominio de entrenamiento, agravado por el tamano reducido del modelo (0,5B)
- Entrenado solo en ingles; no espera buen rendimiento en castellano ni en otros idiomas
- Requiere respetar el formato de prompt del entrenamiento (pregunta + `PARAGRAPH:` + contexto); otros formatos degradaran el resultado
- La licencia Apache 2.0 no impone restricciones de uso comercial, pero la utilidad practica comercial de este checkpoint concreto es limitada
- Los datos de benchmarks provienen del log de validacion del propio entrenamiento, no de una evaluacion externa independiente

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-0.5b-sft-atomic
- Paper (arXiv): https://arxiv.org/abs/2512.01970
- Pagina del proyecto: https://sitaocheng.github.io/atomic/
- Codigo (GitHub): https://github.com/sitaocheng/from_atomic_to_composite
- Dataset: https://huggingface.co/datasets/sitao/From_atomic_to_composite
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Checkpoint con RL (receta atomic-first): https://huggingface.co/sitao/atomic-to-composite-qwen2.5-0.5b-atomic-first-rl
- Checkpoint SFT compuesto: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-0.5b-sft-composite
- Checkpoint composite-first-rl: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-0.5b-composite-first-rl
