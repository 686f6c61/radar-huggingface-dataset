# agentic-ptb/sol-high.h004.opsd-scaleswe.step_8

## Resumen

Este repositorio contiene un checkpoint intermedio del barrido de entrenamiento AgentPTB, denominado `sol-high.h004.opsd-scaleswe.step_8`. El modelo es un ajuste fino del base `Qwen/Qwen3.5-9B-Base` mediante la técnica On-Policy Self-Distillation (OPSD), desarrollada en el marco del proyecto Agentic-OPSD. El checkpoint se generó a las 4,12 horas de un run de 100 horas, con un esfuerzo de razonamiento alto (`high`) y corresponde a la celda `sol-high`, descrita como la mejor celda del barrido.

El modelo tiene 9.409.813.744 parámetros y un tamaño de 18,8 GB en formato safetensors. Su relevancia radica en que es un artefacto de investigación para estudiar la dinámica de entrenamiento de agentes mediante destilación auto-supervisada, no un modelo listo para producción. La model card advierte de un problema crítico: el `eos_token_id` solo incluye el token `248044` y falta el `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga correctamente las respuestas y desborde la ventana de contexto, afectando a cualquier evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del base, sin especificar) |
| Tipos de cuantizacion | no disponible (solo safetensors en fp16/bf16) |
| Idiomas soportados | no disponible (heredados del base, sin especificar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base` y se entrena con On-Policy Self-Distillation (OPSD), una técnica que convierte a un único modelo en alumno y profesor simultáneamente. El alumno recibe solo el problema, mientras que el profesor recibe además la solución de referencia, y se realiza un ajuste de distribución a nivel de token a lo largo de las trayectorias generadas por el propio modelo (on-policy). El paper de AgentOPSD (arXiv:2608.05987) extiende esta idea con agregación en límites de turno y revisión recursiva de creencias, mostrando mejoras frente a GRPO y otras líneas base de destilación.

Este checkpoint concreto es un punto intermedio del barrido, no un modelo final. La model card indica que el `eos_token_id` está incompleto, lo que invalida las métricas de evaluación como medición absoluta; solo pueden compararse checkpoints con el mismo estado de `eos`. El entrenamiento se realizó con un driver basado en Codex/gpt-5.6-sol con esfuerzo de razonamiento alto, pero no se detallan hiperparámetros adicionales ni composición del dataset.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B-Base, hereda capacidades generales de lenguaje y razonamiento, aunque este checkpoint concreto no ha sido validado de forma independiente.
- Entrenamiento agéntico: el modelo está diseñado para tareas que requieren interacción multi-turno y toma de decisiones, dado el contexto de OPSD.
- Soporte de tool calling: no disponible (no se especifica en la documentación del checkpoint).
- Capacidades multilingües: no disponibles (dependen del modelo base, sin confirmación).
- Modo de pensamiento o razonamiento extendido: no disponible (el checkpoint no documenta esta característica).

## Casos de uso

- Investigación en destilación auto-supervisada: el checkpoint sirve para estudiar la evolución de las capacidades agénticas a lo largo del entrenamiento, comparando métricas entre pasos del mismo barrido.
- Análisis de dinámica de entrenamiento: permite trazar curvas de rendimiento frente al tiempo de entrenamiento (eje `t_h`), como se describe en la model card.
- Reproducción de experimentos: investigadores pueden re-empaquetar el checkpoint (añadiendo el token `eos` faltante) para evaluar el efecto de la corrección en las métricas.
- Desarrollo de pipelines de RL agéntico: sirve como punto de partida para probar variantes de OPSD o como referencia para comparar con otros métodos de destilación.
- Estudio de robustez del token de fin de secuencia: el error en `eos_token_id` ofrece un caso práctico para analizar el impacto de la configuración de tokens especiales en la generación.
- Benchmarking de infraestructura: al ser un modelo de 9B en fp16, puede usarse para medir throughput y latencia en diferentes stacks de inferencia, aunque no es su propósito principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente de que las métricas de evaluación de este checkpoint son un "suelo" (floor) debido al `eos_token_id` incompleto, por lo que cualquier número reportado sería engañoso sin re-empaquetar el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en fp16/bf16 ocupa aproximadamente 18,8 GB de pesos, por lo que se necesitan al menos 20-24 GB de VRAM para cargarlo sin cuantizar. Con cuantización a 8 bits (~9,4 GB) o 4 bits (~4,7 GB) cabría en GPUs de consumo como la RTX 3090/4090 (24 GB) o incluso en la RTX 4060 Ti de 16 GB con cuantización 4 bits.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) para fp16 sin restricciones; RTX 4090 (24 GB) para fp16 con limitaciones de contexto; GPUs de 16 GB con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, todos compatibles con safetensors y arquitectura Qwen3.5 (si el runtime soporta la versión del base).
- Latencia y throughput: no disponibles para este checkpoint concreto; dependerán del hardware y del stack de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| agentic-ptb/sol-high.h004.opsd-scaleswe.step_8 | 9,4B | no disponible | no disponible | Checkpoint intermedio, eos incompleto |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | Modelo base, estable |
| Otros checkpoints del barrido AgentPTB | 9,4B | no disponible | no disponible | Intermedios, con distintos estados de eos |

No se dispone de información suficiente para comparar con modelos de la misma categoría (p. ej., Llama-3.1-8B, Mistral-7B) en términos de rendimiento, ya que este checkpoint no tiene benchmarks publicados y su estado de `eos` lo hace no comparable directamente.

## Limitaciones y advertencias

- El `eos_token_id` está incompleto (falta `248046`), lo que provoca que el modelo no termine las respuestas correctamente y desborde la ventana de contexto. No debe usarse en producción sin re-empaquetar.
- Es un checkpoint intermedio de un barrido de investigación, no un modelo final optimizado para tareas concretas.
- No se dispone de licencia especificada, por lo que su uso comercial es incierto y requiere consultar al autor.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas específicas de este checkpoint; se heredan las del modelo base, que no están documentadas en la model card.
- Las métricas de evaluación reportadas en el barrido son un "suelo" y no deben interpretarse como rendimiento real del modelo.
- El tamaño del repositorio (18,8 GB) y la falta de cuantizaciones oficiales limitan su despliegue en entornos con restricciones de memoria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h004.opsd-scaleswe.step_8
- GitHub Agentic-OPSD: https://github.com/EcthelionLiu/Agentic-OPSD
- Paper AgentOPSD (arXiv): https://arxiv.org/html/2608.05987
- PDF del paper: https://arxiv.org/pdf/2608.05987
