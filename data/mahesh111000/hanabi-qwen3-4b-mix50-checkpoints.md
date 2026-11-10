# Mahesh111000/hanabi-qwen3-4b-mix50-checkpoints

## Resumen

hanabi-qwen3-4b-mix50-checkpoints es un conjunto de pesos derivados de Qwen/Qwen3-4B (variante con modo thinking) publicado por el usuario Mahesh111000. No se trata de un modelo entrenado desde cero, sino del resultado de una ejecución de aprendizaje por refuerzo (RL) de 220 pasos con la herramienta prime-rl sobre prompts de "own-belief" del juego Hanabi, en los que se eliminó el bloque de reglas del juego de un 50% fijo de los prompts de entrenamiento. El objetivo declarado es estudiar cómo el RL afecta al razonamiento del modelo en un dominio con información imperfecta y reglas explícitas.

El repositorio contiene dos artefactos: adaptadores LoRA (rango 32, alpha 64, aplicados sobre las proyecciones q/k/v/o/gate/up/down) guardados cada 5 pasos de optimizador, y una versión final fusionada en float32 del adaptador del paso 220 sobre los pesos base. La fusión se hace en float32 de forma deliberada, porque la actualización es pequeña respecto a los pesos y una fusión en bfloat16 redondearía parte de la señal.

Es relevante ahora como material de investigación reproducible sobre RL aplicado a modelos pequeños (4B) en tareas de razonamiento con reglas, y como ejemplo de publicación de checkpoints intermedios para estudiar la dinámica de entrenamiento. No hay información pública sobre benchmarks, licencia ni idiomas soportados más allá de lo que herede de Qwen3-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3-4B, modo thinking) |
| Parametros totales | no disponible (el modelo base Qwen3-4B tiene ~4B; el repo ocupa 28,3 GB por incluir LoRA + fusión fp32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (se publican safetensors en fp32 fusionado y adaptadores LoRA) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (LoRA adapters y merged_fp32) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B, un transformer decoder-only con modo thinking, sobre el que se aplica un adaptador LoRA de rango 32 y alpha 64 en las proyecciones q, k, v, o, gate, up y down (252 matrices adaptadas en total). El entrenamiento consiste en una única ejecución de RL de 220 pasos con prime-rl sobre prompts de "own-belief" de Hanabi, un juego cooperativo de cartas con información imperfecta. La innovación metodológica es la ablación controlada: en un 50% fijo de los prompts de entrenamiento se elimina el bloque de reglas del juego, lo que permite estudiar si el modelo aprende a razonar sin el contexto explícito de reglas o si depende de él.

Los checkpoints LoRA se guardan cada 5 pasos de optimizador, lo que facilita el análisis de la evolución del aprendizaje. La fusión final se realiza en float32 (W + 2.0 · B @ A sobre las 252 matrices adaptadas, manteniendo el resto de tensores del modelo base), una decisión explícita para preservar la magnitud de la actualización, que es pequeña en relación con los pesos originales. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO adicionales.

## Capacidades

- Generación de texto y razonamiento en modo thinking, heredados de Qwen3-4B.
- Razonamiento sobre información imperfecta en el dominio de Hanabi (prompts de own-belief).
- Adaptación específica al formato de prompts de Hanabi, con y sin bloque de reglas explícitas.
- Publicación de checkpoints intermedios (cada 5 pasos) para análisis de dinámica de entrenamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita; el dominio Hanabi implica razonamiento multi-paso.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio): no disponibles.

## Casos de uso

- Investigación en RL para modelos pequeños: usar los checkpoints intermedios para estudiar cómo evoluciona la política del modelo paso a paso en una tarea de información imperfecta.
- Estudio de ablación de reglas: comparar el comportamiento del modelo con y sin el bloque de reglas de Hanabi en los prompts, gracias al diseño mix50 del entrenamiento.
- Reproducción de experimentos con prime-rl: el repositorio sirve como referencia de configuración (rango LoRA, alpha, proyecciones adaptadas, frecuencia de checkpoints) para replicar el pipeline.
- Análisis de fusión en precisión: evaluar el impacto de fusionar adaptadores en float32 frente a bfloat16 en modelos de 4B con actualizaciones pequeñas.
- Base para fine-tuning posterior: partir del adaptador fusionado en fp32 como punto de inicio para otras tareas de razonamiento con reglas.
- Docencia y divulgación: ilustrar cómo se publican artefactos de RL (LoRA + merged) y cómo se estructura un repositorio de checkpoints intermedios.
- Evaluación de robustez ante eliminación de contexto: medir la degradación del rendimiento cuando se retira el bloque de reglas del prompt en inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de ~4B en fp16 se estiman del orden de 8-10 GB, y en fp32 (formato del merged) aproximadamente el doble, aunque estas cifras no están confirmadas en la model card.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU consumer? No confirmado; por tamaño del modelo base (4B) es plausible en GPUs consumer con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: no disponible; al ser safetensors, requeriría cargarse con frameworks compatibles (transformers, vLLM, etc.), sin confirmación del autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hanabi-qwen3-4b-mix50-checkpoints | ~4B (base Qwen3-4B) | no disponible | no disponible | Hugging Face, 0 descargas | RL sobre Hanabi con ablación de reglas |
| Qwen/Qwen3-4B | ~4B | no disponible en esta ficha | no disponible | Hugging Face | Modelo base oficial, modo thinking |
| Alternativas de RL en dominios de juego | no disponible | no disponible | no disponible | no disponible | No se dispone de comparables directos en la información proporcionada |

No se dispone de datos de rendimiento para comparar; la comparativa se limita a características estructurales.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado exclusivamente en prompts de Hanabi own-belief, por lo que su comportamiento fuera de ese dominio puede degradarse respecto al modelo base.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora o degradación frente a Qwen3-4B.
- Licencia no especificada: no se puede confirmar el uso comercial; además, la licencia del modelo base Qwen3-4B condiciona la redistribución.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe más allá de lo que herede el modelo base.
- Riesgo de alucinación: inherente a los modelos generativos; el entrenamiento en un dominio con reglas puede aumentar la confianza en respuestas incorrectas si se retira el bloque de reglas.
- Sesgos: no documentados por el autor; se heredan los del modelo base y los del dataset de prompts de Hanabi.
- Repositorio de 28,3 GB: incluye múltiples checkpoints LoRA y la fusión fp32, lo que complica su despliegue en entornos con almacenamiento limitado.
- Cero descargas y cero likes: no hay validación comunitaria ni informes de uso en producción.
- Fecha de creación futura (2026-11-10) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Mahesh111000/hanabi-qwen3-4b-mix50-checkpoints
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- prime-rl: no disponible en la información proporcionada (no se incluye enlace en la model card)
- Paper, blog o demo: no disponible
