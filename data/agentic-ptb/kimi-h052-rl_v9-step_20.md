# agentic-ptb/kimi.h052.rl_v9.step_20

## Resumen

El repositorio `agentic-ptb/kimi.h052.rl_v9.step_20` contiene un checkpoint intermedio de un barrido (sweep) de entrenamiento con aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. Lo desarrolla el equipo `agentic-ptb` como parte de un experimento de 100 horas denominado "AgentPTB", en el que se evalúa la evolución de distintas configuraciones de entrenamiento para tareas de codificación y razonamiento agéntico. El nombre "kimi" hace referencia a la celda del barrido, no al modelo Kimi de Moonshot AI; se trata de un artefacto de investigación, no de un modelo de producción.

Este checkpoint concreto corresponde a la hora 5.08 del run (h052) y al paso 20 de la fase de RL (`rl_v9`). Su interés radica en que permite observar la trayectoria de rendimiento a lo largo del tiempo de entrenamiento, aunque presenta una limitación crítica: le falta el token de fin de turno `<|im_end|>` (id 248046), lo que provoca que las evaluaciones no sean fiables como medición absoluta. Con 9.409.813.744 parámetros y un tamaño de 18.8 GB en formato safetensors, es un modelo de tamaño medio basado en la arquitectura de Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, una arquitectura transformer densa de 9.000 millones de parámetros. El entrenamiento adicional corresponde a una fase de RL (indicada por `rl_v9` en el identificador) dentro de un barrido sistemático de 100 horas. No se especifican los datos de entrenamiento, el número de tokens utilizados ni el algoritmo de RL concreto (PPO, GRPO u otro). La model card menciona que el checkpoint es "intermedio" y que se enmarca en una celda llamada `kimi` con un driver `kimi-code / kimi-k3` y un esfuerzo de razonamiento `high`. No se documentan innovaciones técnicas específicas más allá de la configuración del barrido.

## Capacidades

- Al ser un fine-tune de Qwen3.5-9B-Base, hereda las capacidades generales del modelo base: generación de texto, razonamiento, comprensión de código y matemáticas básicas.
- El entrenamiento con RL orientado a codificación sugiere un refuerzo en tareas de generación de código y razonamiento multi-paso, aunque no hay métricas publicadas que lo confirmen.
- No se documenta soporte explícito de tool calling, function calling, ni capacidades multimodales.
- El token de fin de turno faltante (`<|im_end|>`) impide que el modelo detenga correctamente sus respuestas, lo que degrada su usabilidad práctica.
- No hay información sobre capacidades multilingües específicas más allá de las del modelo base.

## Casos de uso

- Investigación en dinámicas de entrenamiento RL: este checkpoint sirve para trazar la curva de rendimiento a lo largo del tiempo de entrenamiento y comparar configuraciones dentro del barrido AgentPTB.
- Análisis de la evolución de la pérdida y de la calidad de las respuestas en tareas de codificación durante las primeras horas de un run de RL.
- Estudio de artefactos de entrenamiento: permite examinar cómo la ausencia de un token EOS afecta a la generación y a las métricas de evaluación.
- Reproducción de experimentos: los checkpoints intermedios son útiles para reproducir resultados de investigación y validar metodologías de barrido.
- No se recomienda su uso en producción ni en aplicaciones reales debido a su estado intermedio y a la falta de licencia y documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que las evaluaciones de este checkpoint son un "suelo" (floor) y no una medición fiable, debido al token EOS faltante. Por tanto, cualquier número que pudiera obtenerse no sería comparable con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 19 GB (9.4B parámetros × 2 bytes), lo que requiere una GPU con al menos 24 GB (por ejemplo, RTX 3090, RTX 4090, A10G, L4).
- Con cuantización a 8 bits, la VRAM se reduce a unos 10 GB; a 4 bits, a unos 5-6 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: A100 (40/80 GB), H100, RTX 4090, o GPUs de datacenter con suficiente memoria.
- Opciones de despliegue: al ser un modelo safetensors estándar, puede cargarse con transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama, pero no hay configuraciones probadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos. El modelo base Qwen3.5-9B-Base es el punto de referencia natural, pero no hay datos de rendimiento de este checkpoint frente a él ni frente a otros modelos de 9B. La información de los resultados web sobre Kimi K2, K2.5 y K3 corresponde a modelos de Moonshot AI, que no están relacionados con este repositorio.

## Limitaciones y advertencias

- Token EOS faltante: el checkpoint no incluye el token `<|im_end|>` (id 248046), por lo que las respuestas no se detienen correctamente y pueden desbordar la ventana de contexto. Las evaluaciones son un suelo, no una medición real.
- Checkpoint intermedio: no es un modelo final ni optimizado para uso práctico; forma parte de un barrido experimental.
- Licencia no disponible: no se puede determinar si es utilizable comercialmente o si tiene restricciones.
- Documentación mínima: no se especifican datos de entrenamiento, sesgos, ni limitaciones idiomáticas.
- Riesgo de alucinación y errores: al ser un modelo en fase de entrenamiento, su fiabilidad es baja y no debe emplearse en entornos de producción.
- Confusión potencial con Kimi de Moonshot: el nombre "kimi" es una etiqueta interna del barrido, no el modelo comercial de Moonshot AI.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h052.rl_v9.step_20
- Página de Kimi AI (Moonshot, no relacionada directamente): https://www.kimi.com/en
- Documentación de Kimi K3 (Moonshot, no relacionada directamente): https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
- Repositorio de Kimi K2.5 (Moonshot, no relacionado directamente): https://github.com/MoonshotAI/Kimi-K2.5
