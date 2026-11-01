# sitao/atomic-to-composite-qwen2.5-0.5b-sft-composite

## Resumen

Este modelo es un ajuste fino (SFT) a escala completa de Qwen2.5-0.5B, desarrollado por el investigador Sitao Cheng y colaboradores como artefacto de investigación del paper "From Atomic to Composite: Reinforcement Learning Enables Generalization in Complementary Reasoning" (arXiv:2512.01970). El modelo se entrena directamente sobre pares de preguntas y respuestas de la tarea "Complementary" (COMP), que requiere razonamiento complementario: combinar memoria de hechos atómicos con contexto para responder preguntas multi-hop sobre biografías sintéticas.

Se trata de un modelo de investigación, no de un asistente de propósito general. Su relevancia radica en que sirve como punto de partida de la receta "composite-first" (SFT sobre la tarea compuesta, seguido de RL con GRPO) en un estudio sistemático sobre generalización composicional en modelos pequeños. Con 494 millones de parámetros y arquitectura transformer de la familia Qwen2, es un modelo ligero que puede ejecutarse en hardware de consumo, lo que lo hace útil para reproducir experimentos de razonamiento composicional a bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2), causal LM |
| Parametros totales | 494.032.768 (494 M) |
| Parametros activos | no disponible (no es MoE; todos los parámetros activos) |
| Longitud de contexto | no disponible (la base Qwen2.5-0.5B soporta 32.768 tokens, pero no consta en la información del ajuste) |
| Tipos de cuantizacion | no disponible (pesos en bf16/fp16 según safetensors; sin cuantizaciones publicadas) |
| Idiomas soportados | Ingles (entrenado y evaluado en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (1,0 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder causal de la familia Qwen2.5 con 494 millones de parámetros. El ajuste se realizó mediante SFT (supervised fine-tuning) a escala completa de parámetros, utilizando el framework LLaMA-Factory, sobre el dataset sintético `sitao/From_atomic_to_composite`, concretamente sobre los pares de QA de la tarea Complementary (COMP). Esta tarea presenta preguntas multi-hop cuya respuesta exige combinar hechos atómicos memorizados (por ejemplo, relaciones entre personas en biografías sintéticas) con párrafos de contexto proporcionados en el prompt.

Este modelo es el punto de partida de la receta "composite-first" del paper: primero se entrena directamente en la tarea compuesta (SFT_Comp) y, en una etapa posterior, se aplica aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) mediante el framework verl para mejorar la generalización. El modelo aquí descrito corresponde solo a la fase SFT, y sus resultados se reportan en la Figura 8 del paper (escalado de modelos). No se dispone de datos sobre el número de tokens de entrenamiento ni sobre la duración exacta del proceso.

## Capacidades

- Resolucion de preguntas multi-hop sobre biografias sinteticas: combina informacion de hechos atomicos con parrafos de contexto (memoria + contexto).
- Razonamiento complementario (complementary reasoning): la tarea para la que fue disenado especificamente.
- Generacion de cadenas de razonamiento: el modelo responde con una cadena de razonamiento que termina con el formato fijo `So, the answer is: <answer>`.
- Comprension de lectura con formato estructurado: procesa preguntas seguidas de parrafos marcados con `PARAGRAPH:`.
- Soporte del chat template de Qwen2.5 mediante `apply_chat_template` de la libreria transformers.
- No esta orientado a uso general: no tiene capacidades de tool calling, agentes, vision ni audio, y su rendimiento fuera de la distribucion de entrenamiento (biografias sinteticas en ingles) no esta garantizado.

## Casos de uso

- Investigacion en generalizacion composicional: permite reproducir y comparar las recetas "atomic-first" y "composite-first" del paper, midiendo como el orden de entrenamiento (atomico vs. compuesto) afecta a la generalizacion.
- Estudio de razonamiento multi-hop en modelos pequenos: al pesar menos de 500 M de parametros, es ideal para experimentos controlados de memoria versus contexto en hardware accesible.
- Baseline para metodos de RL: sirve como punto de partida documentado para aplicar GRPO u otros algoritmos de RL y medir la mejora en el test COMP (4.468 items).
- Evaluacion de scaling laws en razonamiento: el paper lo reporta en su Figura 8 de escalado de modelos, util para comparar con las variantes de mayor tamano de la misma familia.
- Prototipado de pipelines de QA multi-hop: su formato de salida estructurado (`So, the answer is: <answer>`) facilita la evaluacion automatica de respuestas en benchmarks sinteticos.
- Docencia y demostraciones: por su tamano reducido (1,0 GB), es adecuado para demos en clase o en portatiles sin GPU dedicada, ilustrando limitaciones de generalizacion zero-shot en modelos pequenos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el test Complementary (COMP) de 4.468 items, por nivel de generalizacion (precision en %):

| Nivel | IID | Composition | Zero-shot |
|---|---:|---:|---:|
| Precision (%) | 57,56 | 50,25 | 16,67 |

Estos numeros provienen del log de validacion de la ejecucion de entrenamiento, tal y como se recogen en el paper. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para este ajuste concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-1,5 GB en precision completa (bf16/fp16), dado el tamano de 494 M de parametros y 1,0 GB de pesos.
- Cabe con holgura en GPUs de consumo: cualquier GPU moderna con 4 GB de VRAM o mas (por ejemplo, RTX 3060, RTX 4060 o superiores); incluso ejecutable en CPU con velocidad razonable o en portatiles.
- GPU recomendadas: no requiere GPUs de gama alta; para experimentacion masiva con entrenamiento o RL, el paper emplea infraestuctura no especificada, pero inferencia funciona en hardware basico.
- Opciones de despliegue: transformers (codigo oficial de la model card), text-generation-inference (tag compatible en HuggingFace), y en principio cualquier runtime compatible con arquitectura Qwen2 como llama.cpp o Ollama (mediante conversion a GGUF, no disponible oficialmente en el repositorio).
- Latencia y throughput estimados: no disponible; al ser un modelo de menos de 500 M de parametros, se espera inferencia rapida incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

Comparativa con los otros tres modelos de la misma familia y tamano publicados en el paper:

| Modelo | Receta | IID (%) | Composition (%) | Zero-shot (%) | Licencia |
|---|---|---:|---:|---:|---|
| SFT_Comp (este modelo) | SFT directo en tarea compuesta | 57,56 | 50,25 | 16,67 | Apache 2.0 |
| SFT_Mem+Ctx (atomic) | SFT en habilidades atomicas | no disponible | no disponible | no disponible | Apache 2.0 |
| Atomic-first RL | SFT atomico → RL COMP | no disponible | no disponible | no disponible | Apache 2.0 |
| Composite-first RL | SFT compuesto → RL COMP | no disponible | no disponible | no disponible | Apache 2.0 |

Como referencia de tamano, la base Qwen2.5-0.5B original comparte arquitectura y numero de parametros, pero no ha sido entrenada en la tarea COMP, por lo que sus resultados en este benchmark no estan publicados en la model card.

## Limitaciones y advertencias

- Modelo de investigacion, no asistente general: entrenado sobre biografias sinteticas; su comportamiento fuera de esa distribucion es impredecible y no debe usarse en produccion como chatbot de proposito general.
- Generalizacion zero-shot muy limitada: solo un 16,67 % de precision en la particion zero-shot del test COMP, lo que refleja la dificultad de la generalizacion composicional en modelos de este tamano sin RL.
- Idioma unico: entrenado y evaluado solo en ingles; no hay soporte garantizado para castellano ni otros idiomas.
- Riesgo de alucinacion: al ser un modelo pequeno entrenado en datos sinteticos, puede generar cadenas de razonamiento plausibles pero incorrectas.
- Formato de salida rigido: requiere usar el mismo formato de prompt que en entrenamiento (pregunta + parrafos tras `PARAGRAPH:`); desviarse de el puede degradar el rendimiento.
- Sin datos de sesgos ni evaluaciones de seguridad: no se han publicado auditorias de sesgo ni evaluaciones de seguridad para este ajuste.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque el propio autor lo califica explicitamente de artefacto de investigacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-0.5b-sft-composite
- Paper (arXiv): https://arxiv.org/abs/2512.01970
- Pagina del proyecto: https://sitaocheng.github.io/atomic/
- Codigo (GitHub): https://github.com/sitaocheng/from_atomic_to_composite
- Dataset: https://huggingface.co/datasets/sitao/From_atomic_to_composite
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Modelos relacionados de la misma familia:
  - SFT atomico: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-0.5b-sft-atomic
  - Atomic-first RL: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-0.5b-atomic-first-rl
  - Composite-first RL: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-0.5b-composite-first-rl
