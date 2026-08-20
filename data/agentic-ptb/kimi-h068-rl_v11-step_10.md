# agentic-ptb/kimi.h068.rl_v11.step_10

## Resumen

El modelo `agentic-ptb/kimi.h068.rl_v11.step_10` es un checkpoint intermedio de un barrido de entrenamiento por refuerzo (RL) denominado AgentPTB, desarrollado por el usuario `agentic-ptb`. Se basa en el modelo base `Qwen/Qwen3.5-9B-Base` y está diseñado para experimentar con un "driver" de agente llamado `kimi-code / kimi-k3` con un nivel de razonamiento alto (`reasoning effort: high`). Este checkpoint se escribió a las 71,89 horas de una ejecución de 100 horas, por lo que representa un punto intermedio en la curva de entrenamiento, no un modelo final.

Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), el modelo es de tamaño medio y está pensado para tareas de codificación y trabajo agéntico. Sin embargo, presenta una advertencia crítica: el token de fin de secuencia `248046` (`<|im_end|>`) no está incluido en la lista de `eos_token_id`, lo que provoca que el modelo no detenga correctamente las respuestas y pueda sobrescribir la ventana de contexto. Por tanto, sus métricas de evaluación deben interpretarse como un límite inferior, no como una medición fiable. Este checkpoint no está destinado a uso en producción, sino a investigación y análisis de dinámicas de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen3.5-9B-Base (detalles de arquitectura no disponibles) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

La arquitectura exacta no se especifica en la información proporcionada, pero al derivar de `Qwen/Qwen3.5-9B-Base` se trata presumiblemente de un transformer denso con atención estándar, aunque no se confirman detalles como el número de capas o cabezas. El entrenamiento corresponde a un barrido de RL (refuerzo) dentro del proyecto AgentPTB, donde se utiliza un "driver" denominado `kimi-code / kimi-k3` con un nivel de esfuerzo de razonamiento alto. El checkpoint se guardó en el paso 40 de la ejecución `rl_v11`, a las 71,89 horas de un total de 100. No se dispone de información sobre el dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO.

Una innovación técnica relevante es la gestión del token de fin de secuencia: el modelo solo reconoce `248044` como `eos_token_id`, pero no `248046` (`<|im_end|>`), que es el token que el template de chat de Qwen3.5 usa para terminar cada turno. Esto implica que el modelo no se detiene correctamente y puede generar texto más allá del límite de contexto, lo que invalida las evaluaciones directas.

## Capacidades

- Generación de texto y razonamiento: al ser un modelo de 9,4B basado en Qwen, se espera que tenga capacidades básicas de generación y razonamiento, aunque no hay datos específicos.
- Codificación y tareas agénticas: el driver `kimi-code / kimi-k3` sugiere un enfoque en generación de código y uso de herramientas, pero no se han publicado resultados concretos.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y multi-step reasoning: no confirmado, aunque el nombre del driver sugiere orientación agéntica.
- Capacidades multilingües: no disponible.
- Capacidades especiales (vision, audio, etc.): no disponible.

## Casos de uso

- Investigación en dinámicas de RL: este checkpoint permite estudiar cómo evoluciona el rendimiento a lo largo de las horas de entrenamiento, comparándolo con otros checkpoints del mismo barrido (por ejemplo, `kimi.h071.rl_v11.step_40`).
- Análisis de curvas de aprendizaje: al ser un punto intermedio, es útil para trazar la progresión de métricas como precisión en tareas de código o razonamiento a lo largo del tiempo.
- Desarrollo de técnicas de regularización de tokens EOS: el problema del token `248046` ausente ofrece un caso de estudio para mejorar la gestión de fin de secuencia en modelos derivados de Qwen.
- Benchmarking de checkpoints intermedios: se puede utilizar para comparar el rendimiento de diferentes pasos dentro de la misma ejecución, siempre que se reempaquete con el token EOS correcto.
- Pruebas de cuantización y despliegue: aunque no es para producción, sirve para probar flujos de cuantización (GGUF, AWQ) en un modelo de 9,4B.
- Educación sobre entrenamiento de agentes: como ejemplo de un checkpoint de RL con configuraciones específicas (driver, effort), puede usarse en cursos o tutoriales sobre entrenamiento de modelos agénticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que, debido al problema del token EOS, cualquier métrica calculada directamente sobre este checkpoint sería un límite inferior y no una medición fiable. Por tanto, no se incluyen tablas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, el modelo ocupa aproximadamente 18,8 GB, por lo que se necesitan al menos 24 GB de VRAM (por ejemplo, una RTX 4090 o A10G). Con cuantización a 8 bits, la VRAM requerida baja a unos 9,4 GB; con 4 bits, a unos 4,7 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para FP16, o GPUs con 16 GB (como RTX 4080) usando cuantización de 8 bits. Para despliegue en servidores, A100 (40/80 GB) o H100 son adecuadas.
- Si cabe en consumer GPU: sí, con cuantización (4 bits) cabe en GPUs de 8 GB como RTX 3070/4060, aunque con menor calidad.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, siempre que se reempaquete el modelo con el token EOS correcto. Sin ese ajuste, la generación no se detendrá.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Como referencia estructural, se puede comparar con su modelo base `Qwen/Qwen3.5-9B-Base`, que tiene los mismos parámetros y contexto, pero sin el entrenamiento de RL. Otros modelos de 9B como Llama 3.1 8B o Mistral 7B son alternativas, pero no hay métricas que permitan una comparación objetiva. La comparativa queda pendiente de la publicación de resultados.

## Limitaciones y advertencias

- El token `eos_token_id` no incluye `248046` (`<|im_end|>`), por lo que el modelo no termina las respuestas correctamente y puede generar texto hasta agotar la ventana de contexto. Esto invalida cualquier evaluación directa y lo hace inadecuado para uso en producción sin reempaquetado.
- Es un checkpoint intermedio de un experimento de RL, no un modelo final. Su rendimiento puede ser inferior al de checkpoints posteriores o al del modelo base.
- No se especifica la licencia, por lo que no se puede garantizar su uso comercial o incluso académico sin autorización del autor.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto de investigación sin validación externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h068.rl_v11.step_10
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del proyecto AgentPTB (mencionado en la model card): `agentic-ptb/INDEX` (no se proporciona URL directa)
