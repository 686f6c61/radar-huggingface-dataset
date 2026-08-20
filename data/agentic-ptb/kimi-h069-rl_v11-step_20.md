# agentic-ptb/kimi.h069.rl_v11.step_20

## Resumen

El modelo `agentic-ptb/kimi.h069.rl_v11.step_20` es un checkpoint intermedio de un barrido de entrenamiento (sweep) denominado AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un fine-tuning por refuerzo (RL) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El nombre "kimi" hace referencia a la celda del experimento dentro del sweep, no al modelo Kimi de Moonshot AI.

Este checkpoint se escribió en la hora 71,89 de un run de 100 horas, por lo que es un punto intermedio en la curva de entrenamiento. Su propósito es servir como referencia para trazar la evolución del rendimiento a lo largo del tiempo, no como un modelo final listo para producción. La model card advierte de un problema crítico: el token `eos_token_id` está incompleto (falta el token `248046`, que corresponde a `<|im_end|>`), lo que provoca que el modelo no detenga correctamente las respuestas y pueda desbordar la ventana de contexto. Por tanto, cualquier evaluación debe interpretarse como un límite inferior, no como una medida real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, probablemente 32K o superior, sin confirmar) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (heredados del base, probablemente multilingue, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18.8 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.5-9B-Base, un transformer denso de 9,4 mil millones de parámetros. El entrenamiento consiste en un fine-tuning por refuerzo (RL) dentro del framework AgentPTB, que utiliza un "driver" denominado `kimi-code / kimi-k3` con un nivel de razonamiento (`reasoning effort`) alto. No se especifican los datos de entrenamiento, el número de tokens ni el algoritmo de RL concreto (posiblemente PPO, GRPO u otro). La innovación principal de este checkpoint es su carácter de punto de control intermedio en un barrido de hiperparámetros, diseñado para estudiar la dinámica de aprendizaje a lo largo de 100 horas.

El problema del token EOS es una limitación técnica importante: al faltar el token `<|im_end|>` en la lista de tokens de fin de secuencia, el modelo no sabe cuándo terminar una respuesta, lo que degrada significativamente su utilidad práctica.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B-Base, hereda capacidades de comprensión y generación de lenguaje, aunque el checkpoint intermedio puede no haber convergido.
- Razonamiento multi-paso: el entrenamiento con `reasoning effort` alto sugiere que se busca mejorar la capacidad de razonamiento encadenado, pero no hay evidencia de resultados.
- Tool calling / function calling: no confirmado, aunque el base Qwen3.5 soporta esta funcionalidad; no se especifica en la model card.
- Capacidades multilingües: no confirmadas, dependen del modelo base.
- Capacidades especiales: ninguna documentada más allá del entrenamiento RL.

## Casos de uso

Dado que es un checkpoint intermedio con un defecto conocido en el token EOS, no se recomienda su uso en producción. Los casos de uso son principalmente de investigación:

- Investigación en dinámica de entrenamiento RL: permite estudiar cómo evoluciona el rendimiento a lo largo de las horas de entrenamiento, comparando con otros checkpoints del mismo sweep.
- Análisis de curvas de aprendizaje: útil para identificar puntos de saturación o regresión en el entrenamiento.
- Desarrollo de técnicas de corrección de tokenización: el problema del EOS puede servir como caso de estudio para depurar pipelines de RL.
- Benchmarking de checkpoints intermedios: para evaluar si el entrenamiento está progresando adecuadamente en tareas específicas.
- Reproducción de experimentos: como referencia para otros investigadores que quieran replicar el sweep AgentPTB.
- Fine-tuning posterior: podría servir como punto de partida para un entrenamiento adicional, aunque es preferible usar el modelo base o un checkpoint final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente que los números de evaluación de este checkpoint son un "floor" (límite inferior) debido al problema del token EOS, por lo que no se pueden comparar de forma fiable con otros modelos.

## Requisitos de hardware

- VRAM estimada: para inferencia con precisión FP16, un modelo de 9,4B parámetros requiere aproximadamente 19-20 GB de VRAM. Con cuantización INT8, unos 10-11 GB; con INT4, unos 5-6 GB.
- GPU recomendadas: para FP16, una GPU con 24 GB (RTX 3090/4090, A10, L4) o superior. Para cuantización, una RTX 3060 (12 GB) o superior podría ser suficiente.
- En consumer GPU: sí, con cuantización (GGUF o AWQ) cabe en GPUs de 12-16 GB, aunque el repo solo ofrece safetensors.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI. Sin embargo, el defecto del EOS requiere re-empaquetado antes de usar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | Modelo base, sin RL |
| agentic-ptb/kimi.h069.rl_v11.step_20 | 9,4B | no disponible | no disponible | Checkpoint RL intermedio, EOS defectuoso |
| Otros checkpoints del sweep AgentPTB | 9,4B | no disponible | no disponible | Misma base, diferentes horas de entrenamiento |

No se dispone de información sobre modelos comparables de otros desarrolladores con el mismo tamaño y propósito.

## Limitaciones y advertencias

- El token `eos_token_id` está incompleto (falta `248046`), lo que provoca que el modelo no termine las respuestas correctamente y pueda desbordar la ventana de contexto. No debe usarse en producción sin re-empaquetar.
- Es un checkpoint intermedio, no un modelo final. Su rendimiento puede ser inferior al de un modelo entrenado completamente.
- No se dispone de licencia especificada, por lo que se desconoce si es apto para uso comercial.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas específicas.
- Los resultados de evaluación son un límite inferior, no una medida real del rendimiento.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto de investigación sin validación externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h069.rl_v11.step_20
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- No se han encontrado papers, blogs o demos asociados a este checkpoint específico.
