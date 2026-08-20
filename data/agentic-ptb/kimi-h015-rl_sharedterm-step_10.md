# agentic-ptb/kimi.h015.rl_sharedterm.step_10

## Resumen

`agentic-ptb/kimi.h015.rl_sharedterm.step_10` es un checkpoint intermedio de un barrido (sweep) de entrenamiento con refuerzo (RL) del proyecto AgentPTB. El identificador indica que corresponde a la celda `kimi`, con el driver `kimi-code / kimi-k3` y un esfuerzo de razonamiento `high`, capturado a las 15,81 horas de un run de 100 horas. Está basado en `Qwen/Qwen3.5-9B-Base`, un modelo transformer de 9.409.813.744 parámetros, y se distribuye en 4 shards con un tamaño total de 18,8 GB.

Este checkpoint tiene un rol intermedio dentro del run, no es un modelo final. La model card advierte de que le falta el token `eos` `248046` (`<|im_end|>`), lo que significa que no detiene correctamente las respuestas y puede desbordar la ventana de contexto. Por tanto, cualquier métrica de evaluación obtenida directamente de este checkpoint debe considerarse un límite inferior, no una medida fiable. Su relevancia es principalmente para investigadores que quieran trazar la evolución del rendimiento a lo largo del tiempo de entrenamiento, no para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-9B-Base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de `Qwen/Qwen3.5-9B-Base`, un transformer denso de 9.400 millones de parámetros. No se especifican detalles adicionales sobre la arquitectura interna (número de capas, cabezas de atención, etc.) en la información disponible. El entrenamiento corresponde a un barrido de AgentPTB con refuerzo (RL), usando el driver `kimi-code / kimi-k3` con esfuerzo de razonamiento `high`. El run completo dura 100 horas y este checkpoint se guardó a las 15,81 horas. No se indica el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La única innovación destacable es el propio esquema de checkpointing del sweep, que permite mapear cada checkpoint a un punto temporal del run para trazar curvas de rendimiento.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B-Base, aunque este checkpoint concreto no está completo (le falta el token de fin de turno).
- Razonamiento multi-step: el driver `kimi-k3` con esfuerzo `high` sugiere que el entrenamiento se orienta a tareas de razonamiento complejo, pero no hay evidencia empírica en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.

## Casos de uso

Dado que es un checkpoint intermedio con el token eos incompleto, no es adecuado para uso directo en producción. Los casos de uso son principalmente de investigación:

- Trazado de curvas de rendimiento durante el entrenamiento: los repositorios de AgentPTB están diseñados para que cada checkpoint se pueda situar en el eje temporal del run, permitiendo estudiar cómo evoluciona el modelo a lo largo de las horas.
- Comparación de checkpoints con el mismo estado de eos: la model card recomienda comparar solo entre checkpoints que compartan la misma configuración de tokens eos, para evitar artefactos de evaluación.
- Re-empaquetado para evaluación: un investigador podría añadir el token `248046` faltante y re-empaquetar el modelo para obtener métricas válidas, aunque esto requeriría un paso de post-procesado.
- Estudio de la dinámica de RL: analizar cómo el refuerzo con el driver `kimi-k3` afecta al comportamiento del modelo en las primeras 16 horas de entrenamiento.
- Validación de infraestructura: comprobar que el pipeline de entrenamiento y guardado de checkpoints funciona correctamente antes de lanzar runs completos.
- Reproducción de experimentos: dado que el run está documentado con marcas de tiempo y rutas de checkpoint, se puede reproducir o continuar el entrenamiento desde este punto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente de que, al faltar el token `eos` `248046`, cualquier evaluación numérica de este checkpoint es un límite inferior y no debe compararse con otros modelos sin re-empaquetar antes.

## Requisitos de hardware

- VRAM estimada: para un modelo de 9.400 millones de parámetros en precisión fp32, se necesitan aproximadamente 37,6 GB de VRAM solo para los pesos. Con cuantización a 8 bits, unos 9,4 GB; a 4 bits, unos 4,7 GB. Sin embargo, no se proporcionan cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: una A100 de 40 GB o 80 GB, o una H100, para inferencia en fp32. Una RTX 4090 de 24 GB podría servir con cuantización a 8 bits o 4 bits, pero no hay archivos GGUF ni AWQ disponibles.
- Si cabe en consumer GPU: sí, con cuantización, pero no hay versiones cuantizadas publicadas.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI podrían cargar el modelo si se convierte a los formatos adecuados, pero no hay instrucciones ni archivos listos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay modelos directamente comparables en la información disponible. Este checkpoint es un artefacto intermedio de un run de RL, no un modelo final. Se podría comparar con el propio `Qwen/Qwen3.5-9B-Base` (su base) o con otros checkpoints del mismo sweep, pero no se proporcionan datos de rendimiento. La comparativa con modelos como Kimi K2.5 (de Moonshot AI) no es pertinente porque son modelos finales con arquitecturas y propósitos distintos.

## Limitaciones y advertencias

- Token eos incompleto: falta `248046` (`<|im_end|>`), por lo que el modelo no detiene las respuestas correctamente y puede desbordar la ventana de contexto. No usar en producción sin re-empaquetar.
- Checkpoint intermedio: es un punto a las 15,81 horas de un run de 100 horas; no representa el estado final del entrenamiento.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido.
- Idiomas no especificados: se desconoce qué idiomas soporta de forma fiable.
- Sin benchmarks: no hay métricas validadas; cualquier número extraído directamente del checkpoint es un límite inferior.
- Sesgos y alucinaciones: no se ha evaluado; al ser un modelo derivado de Qwen, podría heredar sesgos del modelo base, pero no hay datos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h015.rl_sharedterm.step_10
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice de AgentPTB (mencionado en la model card): `agentic-ptb/INDEX` (no se ha verificado su URL)
- Página de Kimi K3 (referencia del driver, no del modelo): https://www.kimi.com/en
- Kimi K2.5 (modelo de Moonshot AI, no relacionado directamente): https://www.kimi.ai/ai-models/kimi-k2-5
