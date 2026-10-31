# bckoduru/scottyrl-a3-p5_textcraft_grpo

## Resumen

Scottyrl-a3-p5_textcraft_grpo es un adaptador LoRA (rank 32) entrenado sobre el modelo base Qwen/Qwen3.5-4B mediante el framework scottyrl. Lo ha publicado el usuario bckoduru en Hugging Face como material de la asignatura 11-768 (AI Agents) de Carnegie Mellon University, concretamente para la entrega 3 (Assignment 3). El nombre del run, `p5_textcraft_grpo`, indica que el ajuste se ha realizado con GRPO (Group Relative Policy Optimization), un algoritmo de aprendizaje por refuerzo, sobre la tarea TextCraft.

El problema que resuelve es la especialización de un modelo de lenguaje generalista en una tarea agéntica concreta: TextCraft, un entorno sintético donde el agente debe seguir instrucciones de crafteo de objetos mediante manipulación de texto y llamadas a herramientas. La relevancia de esta ficha es principalmente académica: se trata de un artefacto de curso, no de un modelo de producción, con cero descargas y cero likes en el momento de redactar la ficha.

El adaptador pesa aproximadamente 0,2 GB en formato safetensors y se sirve con vLLM cargándolo sobre el modelo base Qwen3.5-4B con soporte LoRA habilitado. No hay model card detallada con métricas de evaluación, solo las instrucciones de cómo los evaluadores del curso ejecutan la evaluación contra las particiones de validación medium y hard de TextCraft-Synth.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Qwen3.5-4B |
| Parámetros totales | 4B (modelo base) |
| Parámetros activos | no disponible (el modelo base no es MoE según la información disponible) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-4B; no especificada en la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, ~0,2 GB) |

## Arquitectura y entrenamiento

El artefacto no es un modelo completo sino un adaptador LoRA de rank 32 aplicado sobre Qwen/Qwen3.5-4B. LoRA (Low-Rank Adaptation) congela los pesos del modelo base y entrena matrices de bajo rango añadidas a las capas de atención y/o MLP, lo que reduce drásticamente el número de parámetros entrenables y el tamaño del checkpoint resultante (0,2 GB frente a los ~8 GB que ocuparía el modelo completo en FP16).

El entrenamiento se ha realizado con el framework scottyrl sobre la plataforma Tinker (el checkpoint se exporta desde `tinker://model_6614ebc3/v50`), utilizando GRPO, un algoritmo de RL tipo PPO por grupos que no requiere modelo de recompensa entrenado aparte: compara recompensas dentro de un grupo de respuestas muestreadas para la misma prompt. El entorno de entrenamiento es TextCraft-Synth, una variante sintética de TextCraft orientada a capacidades agénticas de seguimiento de instrucciones y uso de herramientas. No se ha publicado información sobre el número de pasos, tokens, hiperparámetros de GRPO (número de grupos, temperatura de muestreo) ni composición detallada del dataset.

## Capacidades

- Generación de texto generalista heredada del modelo base Qwen3.5-4B (el adaptador solo modifica el comportamiento en la tarea objetivo).
- Comportamiento agéntico especializado en TextCraft: planificación y ejecución de secuencias de acciones de crafteo en el entorno TextCraft-Synth.
- Potencial capacidad de tool calling / function calling en el formato que el entorno TextCraft utilice, dado que la tarea consiste en emitir acciones estructuradas.
- Razonamiento multi-paso orientado a completar objetivos de crafteo con recetas compuestas.
- Capacidades multilingües: no disponibles; el modelo base soporta varios idiomas, pero el adaptador se ha entrenado presumiblemente con instrucciones en inglés.
- No hay evidencia de capacidades de visión, audio ni modo de thinking explícito en la información disponible.

## Casos de uso

- Reproducción académica de la asignatura 11-768 de CMU: los evaluadores del curso sirven el adaptador con vLLM y ejecutan el script de evaluación oficial contra las particiones medium y hard de TextCraft-Synth.
- Estudio de GRPO aplicado a agentes: sirve como ejemplo real y reproducible de cómo aplicar aprendizaje por refuerzo por grupos sobre un LLM pequeño para una tarea agéntica acotada.
- Benchmarking de métodos PEFT: permite comparar el rendimiento de LoRA rank 32 frente a fine-tuning completo u otros ranks en el mismo entorno TextCraft.
- Punto de partida para transferencia a otros entornos agénticos: el checkpoint puede reentrenarse o fusionarse con el modelo base para adaptarlo a tareas similares de manipulación de texto y llamadas a herramientas.
- Demostración de despliegue de adaptadores LoRA con vLLM: la model card incluye comandos concretos de `vllm serve` con `--enable-lora` y `--lora-modules`, útiles como referencia de infraestructura.
- Investigación en eficiencia de RL sobre modelos pequeños: al partir de un modelo de 4B, es viable entrenar y servir en hardware modesto, lo que lo hace adecuado para laboratorios con presupuestos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el procedimiento de evaluación (script `evaluate_checkpoint.py` con k=4 muestras sobre las particiones medium y hard de TextCraft-Synth) pero no incluye métricas de éxito, tasas de recompensa ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM para inferencia: el modelo base Qwen3.5-4B requiere aproximadamente 8 GB en BF16; el adaptador LoRA añade solo ~0,2 GB, por lo que el conjunto cabe cómodamente en una GPU de 12-16 GB (por ejemplo RTX 4090 o RTX 3090).
- GPU recomendadas: cualquier GPU consumer con 12 GB o más de VRAM para inferencia; A100 o H100 solo si se sirve con concurrencia alta mediante vLLM.
- Cabe en GPUs consumer: sí, en RTX 3090, RTX 4090 o equivalentes sin necesidad de cuantización.
- Opciones de despliegue: vLLM es el método documentado (`vllm serve Qwen/Qwen3.5-4B --enable-lora --max-lora-rank 32 --lora-modules a3=bckoduru/scottyrl-a3-p5_textcraft_grpo`). El uso con llama.cpp, Ollama o TGI no está documentado y requeriría fusionar el adaptador con el modelo base y convertirlo a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bckoduru/scottyrl-a3-p5_textcraft_grpo | Adaptador LoRA (rank 32) sobre Qwen3.5-4B | 4B (base) | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | Modelo completo | 4B | no disponible en la información proporcionada | no disponible en la información proporcionada | Hugging Face |
| Otros adaptadores scottyrl de la asignatura | Adaptadores LoRA | 4B (base) | no disponible | no disponible | no disponible |

No existen puntos de comparación cuantitativa (benchmarks) publicados para ninguno de estos artefactos en la información disponible.

## Limitaciones y advertencias

- Es un artefacto académico de un ejercicio de curso: no está pensado para uso en producción y no tiene mantenimiento garantizado.
- La licencia no está declarada en el repositorio, lo que introduce incertidumbre legal para cualquier reutilización; además, cualquier uso hereda las restricciones de la licencia del modelo base Qwen3.5-4B.
- Especialización extrema: el adaptador se ha entrenado únicamente para TextCraft-Synth, por lo que probablemente degrade el comportamiento general del modelo base en otras tareas (catastro forgetting parcial).
- Riesgo de alucinación: no evaluado públicamente; al ser un modelo de 4B ajustado con RL en un entorno estrecho, puede generar acciones o recetas inválidas fuera de distribución.
- Sin métricas publicadas: no se puede verificar que el adaptador supere al modelo base sin ejecutar la evaluación uno mismo.
- Sesgos: no documentados; hereda los sesgos del corpus de preentrenamiento de Qwen3.5.
- Idiomas: el entrenamiento presumiblemente se ha hecho con instrucciones en inglés; el rendimiento en castellano no está garantizado ni evaluado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bckoduru/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint de origen en Tinker: `tinker://model_6614ebc3/v50` (referenciado en la model card, sin URL pública)
- Paper, blog o demo: no disponibles
