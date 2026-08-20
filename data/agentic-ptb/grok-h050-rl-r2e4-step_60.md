# agentic-ptb/grok.h050.rl-r2e4.step_60

## Resumen

`agentic-ptb/grok.h050.rl-r2e4.step_60` es un checkpoint intermedio de un barrido de hiperparámetros (sweep) de entrenamiento con aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. Lo publica la organización `agentic-ptb` como parte de un experimento denominado AgentPTB, en el que se evalúa la evolución del rendimiento a lo largo de 100 horas de entrenamiento. Este checkpoint concreto se escribió a las 48,27 horas del run (h050 en el identificador) y corresponde al paso 60 de la fase `rl-r2e4`.

El modelo está diseñado para razonamiento de alto esfuerzo (reasoning effort `xhigh`) y utiliza un driver de entrenamiento denominado `pi / grok-4.6`. Sin embargo, presenta un defecto crítico de empaquetado: le falta el token de fin de turno `<|im_end|>` (ID 248046), por lo que no detiene correctamente las respuestas y tiende a sobrepasar la ventana de contexto. Esto invalida cualquier evaluación directa y lo hace inadecuado para uso en producción. Se trata de una pieza de investigación para estudiar curvas de aprendizaje en RL, no de un modelo final listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (heredada del base model, no confirmada) |
| Tipos de cuantizacion | No disponible (solo pesos originales en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base` y se entrena con un pipeline de RL cuyo driver se identifica como `pi / grok-4.6`, con un nivel de esfuerzo de razonamiento fijado en `xhigh`. El entrenamiento forma parte de un sweep llamado AgentPTB, que registra checkpoints cada hora de ejecución (el campo `hHHH` del identificador indica la hora del run). Este checkpoint corresponde a la hora 48,27 de un total de 100, y su ruta interna es `outputs/rl-r2e4/weights/step_60`.

No se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La model card advierte de un defecto de empaquetado en todos los checkpoints del sweep: falta el token EOS 248046 (`<|im_end|>`), que es el que el template de chat de Qwen3.5 usa para terminar cada turno del asistente. Como consecuencia, los números de evaluación publicados son un límite inferior (floor), no una medida real del rendimiento.

## Capacidades

- Razonamiento de alto esfuerzo: entrenado con RL para producir cadenas de razonamiento extensas (effort `xhigh`).
- Generación de texto: hereda las capacidades lingüísticas del base model Qwen3.5-9B-Base.
- Tool calling / function calling: no confirmado; depende de las capacidades del base model, pero no se documenta en esta ficha.
- Soporte de agentes y multi-step reasoning: no confirmado; el entrenamiento con RL sugiere optimización para tareas de razonamiento encadenado, pero no hay evidencia publicada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, etc.): no disponibles.

## Casos de uso

- Investigación académica sobre dinámicas de RL: permite analizar cómo evoluciona el rendimiento a lo largo del entrenamiento comparando checkpoints del mismo sweep (h048, h050, etc.).
- Estudio de defectos de tokenización: el fallo de EOS documentado sirve como caso de estudio sobre empaquetado de checkpoints y sus efectos en la evaluación.
- Reproducción de experimentos: útil para equipos que quieran replicar el pipeline AgentPTB y verificar los resultados del barrido.
- Benchmarking de algoritmos de RL: el driver `pi / grok-4.6` puede compararse con otros drivers del mismo sweep para medir su eficacia.
- No se recomienda su uso en aplicaciones reales: el defecto de EOS provoca que el modelo continúe generando hasta agotar el contexto, lo que degrada cualquier tarea práctica.
- Análisis de sobreentrenamiento: al ser un checkpoint intermedio, permite estudiar si el modelo mejora o degrada respecto a checkpoints anteriores y posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que cualquier número de evaluación de este checkpoint es un límite inferior debido al defecto de EOS, y que solo debe compararse con otros checkpoints que compartan el mismo estado de EOS o tras re-empaquetar el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 20 GB en bf16 (los pesos ocupan 18,8 GB). Con cuantización a 8 bits se podría reducir a ~10 GB, pero no hay cuantizaciones publicadas.
- GPU recomendadas: NVIDIA A100 (40/80 GB), RTX 4090 (24 GB), o GPUs con 24 GB o más de VRAM.
- En consumer GPU: cabe en una RTX 4090 o RTX 3090 (24 GB) en bf16, pero no en GPUs de 16 GB o menos sin cuantizar.
- Opciones de despliegue: vLLM, TGI o llama.cpp (si se convierte a GGUF). Sin embargo, el defecto de EOS hace que el despliegue en producción no sea viable sin re-empaquetar el modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| agentic-ptb/grok.h050.rl-r2e4.step_60 | 9,4 B | No disponible | No disponible | Checkpoint intermedio con defecto EOS |
| Qwen/Qwen3.5-9B-Base | 9,4 B | No disponible | No disponible | Modelo base original |
| Otros checkpoints del sweep AgentPTB (p. ej. grok.h048) | 9,4 B | No disponible | No disponible | Mismo defecto EOS documentado |

No se dispone de información sobre modelos comparables de la misma categoría (checkpoints de RL intermedios sobre Qwen3.5) más allá de los del propio sweep.

## Limitaciones y advertencias

- Defecto crítico de EOS: falta el token `<|im_end|>` (ID 248046), por lo que el modelo no termina las respuestas y sobrepasa la ventana de contexto. No es utilizable directamente.
- Checkpoint intermedio: no está completamente entrenado (hora 48 de 100) y no representa el rendimiento final del run.
- Sin licencia especificada: no se puede determinar si es de uso libre, comercial o restringido.
- Sin idiomas documentados: se desconoce el alcance multilingüe.
- Sin validación comunitaria: 0 descargas y 0 likes en HuggingFace; no ha sido probado por terceros.
- La model card del repo corresponde a otro checkpoint (grok.h048.step_50), lo que sugiere que la documentación puede no estar alineada con este artefacto concreto.
- Riesgo de alucinación y sesgos: no evaluados; se heredan del base model Qwen3.5-9B-Base sin verificación adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h050.rl-r2e4.step_60
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del sweep (mencionado en la model card): `agentic-ptb/INDEX` (no se ha encontrado el enlace directo)
