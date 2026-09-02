# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-bvs8

## Resumen

Este repositorio contiene un checkpoint de reinforcement learning (RL) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, desarrollado por el usuario agurung en el contexto del proyecto Cobalt del grupo OSU-NLP-Group. El modelo se entrena con el algoritmo GRPO (Group Relative Policy Optimization) implementado en OpenRLHF, con el objetivo de mejorar la generación de código en problemas de programación competitiva. Se trata de un checkpoint intermedio guardado en el paso global 12, seleccionado como el mejor según la métrica pass@8 en el conjunto de validación del llamado "frontier" de Cobalt (problemas que el modelo base resuelve en como máximo 2 de 64 muestras).

El modelo tiene 4.411.424.256 parámetros (~4,4B), es un transformer decoder de la familia Qwen3 y está disponible en formato safetensors. La licencia no está especificada, y los idiomas soportados no se indican en la ficha. Es un artefacto de investigación orientado a estudiar métodos de RL para código, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3-4B-Instruct-2507 tiene 32k, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | No disponible (repositorio solo contiene safetensors en precision completa) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte del modelo `Qwen/Qwen3-4B-Instruct-2507` y se le aplica RL directamente, sin una fase previa de SFT (supervised fine-tuning). El entrenamiento usa GRPO con ventajas normalizadas por grupo y sin penalización KL. La recompensa es binaria: 1.0 si el programa generado pasa todos los tests del problema, 0.0 en caso contrario. Se aplican dos penalizaciones adicionales: una anti-truncamiento estilo ProRL que asigna recompensa -1.0 a respuestas truncadas, y una penalización DAPO por longitud excesiva que añade hasta -0.25 a las respuestas que caen en los últimos 1024 tokens antes del límite de generación.

El conjunto de entrenamiento son 1833 problemas del frontier de Cobalt (train) y 112 problemas held-out de validación, todos con prompts "clean_eval". Se usan 8 muestras por prompt, rollout batch de 128, train batch de 128, máximo de 4096 tokens nuevos por rollout, 2 episodios y learning rate constante de 1e-06. El entrenamiento se registró en Weights & Biases bajo el proyecto `eaiexp-paper-final`.

## Capacidades

- Generación de código: el modelo está especializado en producir programas que pasan tests de problemas de programación competitiva, gracias al entrenamiento con recompensa binaria de corrección.
- Razonamiento multi-intento: al entrenarse con 8 muestras por prompt y evaluarse con pass@8, el modelo es capaz de generar múltiples soluciones alternativas para un mismo problema.
- Seguimiento de instrucciones: hereda la capacidad de instrucción del modelo base Qwen3-4B-Instruct-2507, aunque el RL se aplicó directamente sobre el base sin SFT adicional.
- No se han documentado capacidades de tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Investigación en RL para generación de código: el checkpoint sirve para estudiar el efecto de GRPO con recompensa binaria y penalizaciones anti-truncamiento sobre la capacidad de resolver problemas de programación.
- Análisis de estrategias de muestreo: al estar optimizado para pass@8, puede usarse como referencia para comparar políticas de decodificación (temperatura, top-p, número de muestras) en tareas de código.
- Fine-tuning adicional: puede servir como punto de partida para continuar el entrenamiento con otros datasets o algoritmos de RL, ya que es un checkpoint intermedio.
- Evaluación de métodos de recompensa: permite comparar el efecto de la penalización DAPO y del stop-properly penalty frente a variantes sin ellas.
- Benchmarking de modelos de código: aunque no es un modelo final, puede incluirse en evaluaciones comparativas de checkpoints RL para medir progreso dentro del proyecto Cobalt.
- Reproducción de experimentos: dado que se publican los logs de entrenamiento, es útil para reproducir y verificar los resultados del paper de Cobalt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni LiveCodeBench, ni métricas de validación en el log de entrenamiento). La model card indica que las métricas de evaluación en este checkpoint no están disponibles en el log de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, un modelo de 4.4B parámetros requiere aproximadamente 8.8 GB solo de pesos, más overhead de activaciones y KV cache; se recomienda al menos 12 GB. En INT8 (~4.4 GB) o INT4 (~2.2 GB) cabe en GPUs de consumo con 8 GB o menos.
- GPUs recomendadas: para FP16, una RTX 3090, RTX 4090, A100 o H100. Para cuantización ligera, una RTX 3060 (12 GB) o RTX 4070 son suficientes.
- Despliegue: compatible con vLLM (como indica la model card), transformers con `AutoModelForCausalLM`, y potencialmente con llama.cpp u Ollama si se generan pesos GGUF.
- Latencia y throughput: no disponibles. Dado el tamaño, en una RTX 4090 se puede esperar un throughput de decodificación de varios cientos de tokens por segundo con vLLM, pero no hay datos medidos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. A continuación se comparan características estructurales con otros checkpoints del mismo proyecto y con el modelo base:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-bvs8 | 4.4B | No disponible | No disponible | safetensors | Checkpoint RL, mejor pass@8 |
| agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-base | 4.4B | No disponible | No disponible | safetensors | Variante del mismo proyecto |
| agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp20-iid30v11v | 4.4B | No disponible | No disponible | safetensors | Variante con ncp20 |
| Qwen/Qwen3-4B-Instruct-2507 | 4.4B | 32k | Apache 2.0 | safetensors | Modelo base original |

## Limitaciones y advertencias

- No se especifica licencia, lo que impide su uso comercial sin autorización explícita del autor.
- Es un checkpoint de investigación, no un modelo final optimizado para producción; puede tener comportamientos inestables o soluciones incorrectas en problemas no vistos.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar código que parece plausible pero no pasa los tests.
- Sesgos: el entrenamiento se limita a problemas del frontier de Cobalt, que son problemas de programación competitiva; el modelo no ha sido evaluado en otras tareas de código (refactorización, documentación, etc.).
- La longitud de contexto no está confirmada; aunque el base soporta 32k, el RL podría haber alterado el comportamiento en contextos largos.
- No hay métricas de validación publicadas para este checkpoint, por lo que su rendimiento real es desconocido fuera de la métrica pass@8 utilizada para seleccionarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-bvs8
- Checkpoint variante base: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-base
- Checkpoint variante ncp20 iid30v11v: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp20-iid30v11v
- Proyecto Cobalt (GitHub OSU-NLP-Group): https://github.com/OSU-NLP-Group/cobalt
- Despliegue en FriendliAI (para variante ncp20): https://friendli.ai/models/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp20-groot30v11v
