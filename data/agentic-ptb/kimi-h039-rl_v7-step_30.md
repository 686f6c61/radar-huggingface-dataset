# agentic-ptb/kimi.h039.rl_v7.step_30

## Resumen

El modelo `agentic-ptb/kimi.h039.rl_v7.step_30` es un checkpoint intermedio de un experimento de aprendizaje por refuerzo (RL) desarrollado por el equipo `agentic-ptb`. Se trata de un fine-tuning del modelo base `Qwen/Qwen3.5-9B-Base` (9.409.813.744 parámetros, aproximadamente 9,4B), orientado a mejorar capacidades de codificación y razonamiento agéntico mediante un pipeline de RL con el driver `kimi-code / kimi-k3` y un nivel de esfuerzo de razonamiento `high`. El checkpoint corresponde a la hora 48,71 de una ejecución de 100 horas, por lo que es un punto intermedio del entrenamiento, no un modelo final.

La relevancia de este modelo radica en que forma parte de un barrido sistemático de hiperparámetros y configuraciones de RL para optimizar el rendimiento de modelos de 9B en tareas de agente y código. Su interés principal es para investigadores que estudian dinámicas de entrenamiento RL, comparación de checkpoints a lo largo del tiempo, o que necesitan un modelo base intermedio para análisis de curvas de aprendizaje. No está pensado para uso en producción, y de hecho presenta una advertencia crítica: le falta el token de fin de secuencia `<|im_end|>` (ID 248046), lo que provoca que no detenga correctamente las respuestas y pueda desbordar la ventana de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del transformer `Qwen/Qwen3.5-9B-Base` mediante aprendizaje por refuerzo. La model card indica que pertenece a la celda `kimi` de un barrido (sweep) de RL, con el driver `kimi-code / kimi-k3` y un nivel de esfuerzo de razonamiento `high`. El entrenamiento se ejecutó durante 100 horas, y este checkpoint se guardó a las 48,71 horas (paso 40 según la card, aunque el ID del repo indica `step_30`; la discrepancia sugiere que el ID puede referirse a otro paso o a un renombrado). No se proporcionan detalles sobre el dataset de entrenamiento, el algoritmo RL concreto (PPO, GRPO, etc.) ni las funciones de recompensa utilizadas.

La innovación técnica más destacable de este checkpoint es su naturaleza experimental: se trata de un punto intermedio de un barrido de RL, diseñado para trazar curvas de rendimiento a lo largo del tiempo. La card advierte explícitamente que el token `eos_token_id` está configurado como `[248044]` pero falta el `248046` (`<|im_end|>`), lo que impide que el modelo termine correctamente las conversaciones según la plantilla de chat de Qwen3.5. Esto significa que las evaluaciones de este checkpoint son un límite inferior (floor) y solo deben compararse con otros checkpoints que tengan el mismo estado de token EOS.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B-Base, hereda capacidades generales de generación de texto, aunque el entrenamiento RL está orientado a codificación y tareas de agente.
- Razonamiento agéntico: el driver `kimi-code / kimi-k3` y el esfuerzo `high` sugieren que el modelo está optimizado para tareas de agente que requieren múltiples pasos de razonamiento y uso de herramientas.
- Codificación: el nombre de la celda (`kimi-code`) indica un enfoque en generación y edición de código, aunque no se especifican benchmarks concretos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada, pero es probable que el fine-tuning RL lo haya incluido dado el contexto agéntico.
- Capacidades multilingües: no disponible (depende del modelo base, pero no se confirma).
- Modo de razonamiento (thinking): el parámetro `reasoning effort: high` sugiere que el modelo puede generar cadenas de razonamiento extensas, pero no se detalla si hay un modo explícito de "thinking".

## Casos de uso

- Investigación en RL para modelos de código: este checkpoint es útil para estudiar cómo evoluciona el rendimiento de un modelo de 9B durante un entrenamiento RL de 100 horas. Los investigadores pueden comparar este punto (h48) con otros checkpoints del mismo barrido para analizar curvas de aprendizaje, saturación o sobreajuste.
- Evaluación de estrategias de tokenización y EOS: la ausencia del token `<|im_end|>` permite estudiar el impacto de la configuración de tokens de fin de secuencia en la calidad de las respuestas y en el desbordamiento de contexto.
- Benchmarking de modelos intermedios: para equipos que desarrollan pipelines de RL, este checkpoint sirve como referencia de un punto medio de entrenamiento, permitiendo validar si el proceso de RL está convergiendo correctamente.
- Análisis de robustez en tareas de agente: dado el enfoque en `kimi-code`, se puede probar el modelo en tareas de edición de código o uso de herramientas para observar el comportamiento en un estado intermedio de entrenamiento.
- Comparación de configuraciones de RL: al ser parte de un sweep, este checkpoint permite comparar la celda `kimi` con otras celdas del mismo barrido (si están publicadas) para identificar qué configuraciones de driver y esfuerzo producen mejores resultados.
- Reproducción de experimentos: para investigadores que quieran reproducir el pipeline de RL de `agentic-ptb`, este checkpoint ofrece un punto de partida para verificar la reproducibilidad de los resultados intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otros estándares. Además, la advertencia sobre el token EOS faltante invalida cualquier evaluación directa sin re-empaquetado previo, por lo que no se pueden reportar números fiables.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B parámetros en FP16, se necesitan aproximadamente 19-20 GB de VRAM solo para los pesos. Con cuantización a 8 bits (~9,5 GB) o 4 bits (~5 GB) se podría reducir, pero no se proporcionan archivos cuantizados en el repositorio.
- GPU recomendadas: para FP16, una GPU con 24 GB (RTX 3090/4090, A5000) o superior. Para cuantización 4 bits, una GPU de 8-12 GB (RTX 3060, 4070) podría ser suficiente, pero habría que convertir los pesos manualmente.
- Si cabe en consumer GPU: sí, con cuantización. Sin cuantizar, requiere una GPU de gama alta (24 GB).
- Opciones de despliegue: al ser un checkpoint experimental con un problema de EOS, no se recomienda desplegarlo en producción. Para experimentación, se puede usar vLLM, llama.cpp u Ollama tras re-empaquetar el tokenizador y corregir el EOS. No se proporcionan configuraciones específicas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `agentic-ptb/kimi.h039.rl_v7.step_30` | 9,4B | no disponible | RL para código/agentes | no disponible | Checkpoint intermedio, no apto para producción |
| `Qwen/Qwen3.5-9B-Base` | 9,4B | no disponible (típicamente 128k en Qwen3) | Modelo base general | Apache 2.0 (asumido, no confirmado) | Disponible en HuggingFace |
| `Qwen/Qwen3.5-9B-Instruct` | 9,4B | no disponible | Instrucción y chat | Apache 2.0 (asumido) | Disponible en HuggingFace |

La comparativa se limita a los modelos base de Qwen porque no hay información sobre otros modelos de 9B con fine-tuning RL específico para código en el mismo contexto. El checkpoint de `agentic-ptb` se diferencia por su naturaleza experimental y por el problema de EOS, lo que lo hace inadecuado para uso directo.

## Limitaciones y advertencias

- Token EOS faltante: el modelo no incluye el token `<|im_end|>` (ID 248046) en su configuración de EOS, lo que provoca que las respuestas no terminen correctamente y puedan desbordar la ventana de contexto. Esto invalida cualquier uso en producción y requiere re-empaquetado antes de evaluar.
- Checkpoint intermedio: es un punto a mitad de un entrenamiento RL de 100 horas, no un modelo final. Su rendimiento puede ser inferior al de checkpoints posteriores y no representa el estado óptimo del barrido.
- Licencia no especificada: no se indica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o modificación. Se debe contactar al autor antes de cualquier uso.
- Sesgos y alucinaciones: al ser un fine-tuning de Qwen3.5-9B-Base, puede heredar sesgos del modelo base, pero no hay datos específicos. El entrenamiento RL podría introducir sesgos adicionales hacia patrones de código o razonamiento.
- Riesgo de sobreajuste: al estar entrenado con un driver específico (`kimi-code`), el modelo puede especializarse en exceso en tareas de código y degradar su rendimiento en otras áreas.
- Sin benchmarks publicados: no hay métricas fiables de rendimiento, por lo que no se puede evaluar su calidad objetiva.
- Reproducibilidad limitada: la discrepancia entre el ID (`step_30`) y la card (`step_40`) sugiere posibles inconsistencias en el etiquetado, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h039.rl_v7.step_30
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base (enlace inferido, no verificado)
- Índice del barrido (mencionado en la card): `agentic-ptb/INDEX` (no se proporciona URL directa)
