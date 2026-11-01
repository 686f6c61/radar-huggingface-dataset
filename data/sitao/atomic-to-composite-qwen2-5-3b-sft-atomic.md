# sitao/atomic-to-composite-qwen2.5-3b-sft-atomic

## Resumen

Este modelo es un ajuste fino (SFT a parámetros completos) de Qwen2.5-3B, desarrollado por el investigador Sitao Cheng y colaboradores como artefacto experimental del paper "From Atomic to Composite: Reinforcement Learning Enables Generalization in Complementary Reasoning" (arXiv:2512.01970). El modelo se ha entrenado exclusivamente con datos de habilidades "atómicas": conocimiento paramétrico (MEM) y razonamiento contextual (CTX), sin ver ningún ejemplo de la tarea compuesta (COMP), que combina ambos tipos de información. Su propósito es servir como punto de partida del "atomic-first recipe", una receta de entrenamiento que estudia cómo la generalización composicional emerge (o no) al combinar SFT con aprendizaje por refuerzo (GRPO).

Es relevante porque aborda una pregunta fundamental en IA: por qué los modelos que dominan habilidades individuales (memoria y uso de contexto) fallan al componerlas en tareas multi-hop, y si el RL puede cerrar esa brecha. No es un asistente de propósito general: está entrenado sobre biografías sintéticas y responde preguntas de QA multi-hop con una cadena de razonamiento. Arquitectura: transformer denso basado en Qwen2.5-3B, con 3.085.938.688 parámetros y licencia qwen-research.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), causal LM |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-3B) |
| Tipos de cuantizacion | no disponible (solo pesos originales) |
| Idiomas soportados | Ingles (entrenamiento y uso previstos) |
| Licencia | qwen-research (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-3B, un transformer decoder-only denso de la familia Qwen2.5. Sobre esa base se aplica un SFT a parámetros completos (full-parameter, sin LoRA ni cuantización) usando LLaMA-Factory, con datos de las tareas MEM (conocimiento paramétrico: hechos memorizados en los pesos) y CTX (razonamiento contextual: extracción de información de párrafos proporcionados en el prompt). Crucialmente, el modelo no ve ningún ejemplo de la tarea COMP (complementaria), que requiere combinar ambos tipos de información.

El dataset de entrenamiento es sitao/From_atomic_to_composite, compuesto por biografías sintéticas diseñadas para controlar la composición de habilidades. La receta completa del paper contempla una segunda fase de RL con GRPO (Group Relative Policy Optimization) implementada en verl, pero este checkpoint concreto es solo el SFT atómico, es decir, el punto de partida antes del refuerzo. El paper reporta los resultados de este modelo en la Figura 8 (escalado de modelos).

## Capacidades

- Respuesta a preguntas multi-hop sobre biografías sintéticas, combinando conocimiento paramétrico y contexto proporcionado en el prompt (con rendimiento limitado, ver benchmarks).
- Generación de cadenas de razonamiento explícitas: el modelo razona paso a paso y finaliza con el patrón `So, the answer is: <answer>`, lo que facilita la extracción programática de la respuesta.
- Manejo de contexto estructurado: acepta párrafos de contexto tras el marcador `PARAGRAPH:` según el formato de entrenamiento.
- No está diseñado para: generación de código, matemáticas, visión, audio, tool calling, agentes ni uso conversacional general. La model card lo indica explícitamente: es un artefacto de investigación, no un asistente de propósito general.
- Capacidades multilingües: no previstas; el entrenamiento y la evaluación son en inglés.

## Casos de uso

- Investigación en generalización composicional: es el checkpoint SFT atómico del paper, útil como baseline para replicar o extender experimentos sobre cómo el RL habilita la composición de habilidades.
- Estudio de la brecha memoria-contexto: permite analizar cómo un modelo que domina MEM y CTX por separado falla en tareas COMP (21,17 % IID, 27,42 % composición, 22,11 % zero-shot).
- Comparación de recetas de entrenamiento: sirve de punto de partida para comparar las cuatro variantes publicadas (SFT atómico, SFT compuesto, atomic-first RL y composite-first RL) en la misma base de 3B.
- Benchmarking de QA multi-hop sintético: puede integrarse en pipelines de evaluación que midan razonamiento multi-hop controlado, gracias a su formato de salida determinista (`So, the answer is:`).
- Investigación en RL post-training: como modelo inicial para aplicar GRPO u otros algoritmos de RL con verl y estudiar el efecto del refuerzo sobre habilidades atómicas.
- Docencia y divulgación: ejemplo práctico y reproducible para cursos sobre SFT, RLHF/GRPO y evaluación de generalización en modelos pequeños.

## Benchmarks y rendimiento

Resultados publicados sobre el test set Complementary (COMP) de 4.468 ítems, por nivel de generalización (accuracy en %, del log de validación del entrenamiento, según el paper):

| Nivel | Accuracy (%) |
|---|---:|
| IID | 21,17 |
| Composition | 27,42 |
| Zero-shot | 22,11 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este checkpoint. Los números anteriores corresponden exclusivamente al test COMP del paper y confirman el punto central de la investigación: el SFT solo con habilidades atómicas no generaliza a la tarea compuesta.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 6,2 GB de pesos más overhead de activaciones y KV cache; en la práctica, 8-10 GB de VRAM son suficientes para inferencia con contexto corto.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o más (RTX 3060, RTX 4060 Ti, RTX 4090) para inferencia; para reproducir el entrenamiento SFT a parámetros completos o el RL con GRPO se recomiendan varias GPUs de gama datacenter (A100/H100), aunque el paper no detalla la configuración exacta.
- Cabe cómodamente en GPUs de consumo: un modelo denso de 3B es accesible incluso en portátiles con GPU dedicada.
- Opciones de despliegue: transformers (código oficial de la model card), vLLM, llama.cpp (requeriría conversión a GGUF, no publicada) y Ollama (igualmente tras conversión). El formato nativo es safetensors compatible con text-generation-inference.
- Latencia y throughput: no disponibles; al ser un modelo denso de 3B con respuestas cortas (max_new_tokens=256 en el ejemplo), la generación greedy es rápida en GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| atomic-to-composite-qwen2.5-3b-sft-atomic (este) | 3,09 B | SFT solo en habilidades atómicas (MEM+CTX) | qwen-research | Publicado en HuggingFace |
| atomic-to-composite-qwen2.5-3b-sft-composite | 3,09 B | SFT solo en la tarea compuesta (COMP) | qwen-research | Publicado en HuggingFace |
| atomic-to-composite-qwen2.5-3b-atomic-first-rl | 3,09 B | SFT atómico + RL (GRPO) sobre COMP | qwen-research | Publicado en HuggingFace |
| atomic-to-composite-qwen2.5-3b-composite-first-rl | 3,09 B | SFT compuesto + RL (GRPO) sobre COMP | qwen-research | Publicado en HuggingFace |
| Qwen/Qwen2.5-3B (base) | 3,09 B | Preentrenamiento general | Qwen Research | Publicado en HuggingFace |

Los cuatro checkpoints derivados comparten base, tamaño y licencia; la diferencia está en la receta de entrenamiento, y el paper los compara precisamente para aislar el efecto del RL en la generalización composicional.

## Limitaciones y advertencias

- Rendimiento muy limitado en la tarea objetivo: incluso en el nivel IID alcanza solo ~21-27 % de accuracy; no debe usarse como sistema de QA productivo.
- Dominio estrecho: entrenado exclusivamente sobre biografías sintéticas; su comportamiento fuera de ese dominio es impredecible.
- No es un asistente general: carece de alineación para conversación, seguridad o utilidad de propósito general; riesgo elevado de alucinación fuera de su distribución de entrenamiento.
- Idioma: entrenado y previsto solo para inglés; no esperar capacidad multilingüe.
- Licencia qwen-research: hereda las restricciones de la licencia de Qwen2.5-3B, orientada a investigación; revisar los términos antes de cualquier uso comercial.
- Formato de prompt rígido: requiere el formato exacto de entrenamiento (pregunta + `PARAGRAPH:` con el contexto); desviarse de él degrada el rendimiento.
- Cuantización no publicada: no hay pesos GGUF ni cuantizados oficialmente; cualquier conversión es responsabilidad del usuario.
- Proyecto de investigación activo: los datos de benchmarks provienen del log de validación del entrenamiento, no de una evaluación externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-3b-sft-atomic
- Paper (arXiv): https://arxiv.org/abs/2512.01970
- Página del proyecto: https://sitaocheng.github.io/atomic/
- Código (GitHub): https://github.com/sitaocheng/from_atomic_to_composite
- Dataset: https://huggingface.co/datasets/sitao/From_atomic_to_composite
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Licencia (Qwen2.5-3B): https://huggingface.co/Qwen/Qwen2.5-3B/blob/main/LICENSE
- Checkpoints relacionados: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-3b-sft-composite, https://huggingface.co/sitao/atomic-to-composite-qwen2.5-3b-atomic-first-rl, https://huggingface.co/sitao/atomic-to-composite-qwen2.5-3b-composite-first-rl
