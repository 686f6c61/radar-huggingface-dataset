# agentic-ptb/opus-high-v3.h022.sft-distil-v2.step_30

## Resumen

`agentic-ptb/opus-high-v3.h022.sft-distil-v2.step_30` es un checkpoint intermedio derivado del modelo base `Qwen/Qwen3.5-9B-Base`, publicado por el usuario `agentic-ptb` como parte de un experimento de entrenamiento de agentes denominado **opus-high-v3**. Según la model card, se trata de un artefacto retenido con fines de reproducibilidad y estudio cualitativo, dentro de un run que utilizó Claude Code como entorno de generación de datos. El propio autor advierte explícitamente que el run **no encontró mejora en los pesos entrenados** y que no debe inferirse calidad a partir de su publicación.

Este checkpoint, con 9.409.813.744 parámetros (~9,4B), es un resultado negativo de un proceso de fine-tuning supervisado (SFT) sobre el modelo base de Qwen. Su relevancia radica en ser un ejemplo documentado de fallo de entrenamiento en el ámbito de agentes, útil para estudiar reproducibilidad y diagnósticos de convergencia, pero no como modelo listo para uso en producción. La licencia Apache 2.0 permite su redistribución y uso, aunque su valor práctico es limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.5-9B-Base, sin detalles adicionales) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors sin cuantizacion publicada) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base `Qwen/Qwen3.5-9B-Base` mediante entrenamiento supervisado (SFT). El proceso se enmarca en el run `opus-high-v3` de la iniciativa AgentPTB, que emplea Claude Code para generar datos de entrenamiento de agentes. El checkpoint corresponde al paso 30 de la fase `h022` del run, con provenance `scratch/agent/sft-distil-v2/weights/step_30`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni la aplicación de técnicas como RLHF o DPO. El autor indica que el run no produjo ninguna mejora en los pesos, lo que sugiere que el entrenamiento no logró superar al modelo base en las métricas evaluadas. No se reportan innovaciones técnicas específicas en este checkpoint.

## Capacidades

Al ser un checkpoint intermedio sin mejoras verificadas, sus capacidades son, en principio, las del modelo base `Qwen3.5-9B-Base`, pero no se garantiza que el fine-tuning no haya degradado alguna de ellas. No se han publicado capacidades específicas adicionales.

- Generacion de texto y razonamiento: heredadas del modelo base, sin confirmacion de mantenimiento.
- Codigo y matematicas: no hay evidencia de mejora ni de degradacion.
- Tool calling: no hay informacion sobre soporte especifico en este checkpoint.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

Dado el caracter de resultado negativo y la advertencia del autor, no se recomienda su uso en aplicaciones practicas. Los unicos escenarios plausibles son de investigacion:

- Estudio de reproducibilidad de experimentos de fine-tuning: permite analizar por que un run concreto no logra mejorar los pesos, comparando con otros checkpoints del mismo run.
- Diagnostico de fallos de entrenamiento: util para investigar problemas de convergencia, degradacion de pesos o sobreajuste en entornos de agentes.
- Punto de partida para nuevos experimentos: podria servir como inicializacion para otros fine-tunings, aunque sin garantias de exito.
- Analisis de artefactos intermedios: para entender la evolucion de los pesos a lo largo de las fases de entrenamiento.
- Evaluacion de metodologias de generacion de datos con agentes: para comparar la calidad de los datos producidos por Claude Code en distintos runs.
- Documentacion de resultados negativos: como ejemplo de publicacion transparente de fallos en la comunidad open source.

En ninguno de estos casos se recomienda su despliegue en produccion ni su uso como modelo final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Dado que el run no encontro mejora en los pesos, es probable que el rendimiento sea equivalente o inferior al del modelo base `Qwen/Qwen3.5-9B-Base`, pero no existen datos cuantitativos que lo confirmen. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni otras metricas.

## Requisitos de hardware

Al tratarse de un modelo de ~9,4B parametros en formato safetensors (18,8 GB en disco), los requisitos estimados para inferencia son similares a los de otros modelos de este tamano, aunque no se han publicado configuraciones oficiales para este checkpoint concreto.

- VRAM estimada: ~19 GB en fp16, ~10 GB en int8, ~5-6 GB en int4 (estimaciones genericas para 9B).
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB) para fp16; GPUs con 12-16 GB (RTX 3080, A5000) para cuantizacion int8; GPUs con 8 GB (RTX 3070, A4000) para int4.
- No se han publicado cuantizaciones especificas para este modelo, por lo que habria que generarlas manualmente con herramientas como llama.cpp o AutoGPTQ.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, todos compatibles con modelos de la familia Qwen, pero sin configuraciones verificadas para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para establecer una comparativa fiable. Como referencia estructural, se puede comparar con el modelo base y con otros fine-tunings de la misma familia:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Qwen/Qwen3.5-9B-Base` | ~9,4B | No disponible | Apache 2.0 | Modelo base original |
| `agentic-ptb/opus-high-v3.h022.sft-distil-v2.step_30` | ~9,4B | No disponible | Apache 2.0 | Checkpoint intermedio sin mejoras |
| Otros fine-tunings de Qwen3.5-9B | ~9,4B | No disponible | Variable | Sin datos publicados en esta informacion |

No se conocen modelos comparables con resultados verificados en la misma tarea de entrenamiento de agentes.

## Limitaciones y advertencias

- **Resultado negativo**: el autor indica explicitamente que el run no encontro mejora en los pesos; no debe usarse como modelo final.
- **Riesgo de alucinacion**: al ser un checkpoint intermedio sin validacion, el riesgo de generar contenido incorrecto o inconsistente es alto.
- **Sin garantias de calidad**: no hay benchmarks ni evaluaciones publicadas; el comportamiento puede ser impredecible.
- **Idiomas no especificados**: no se conoce el alcance multilingue, aunque probablemente herede las capacidades del modelo base.
- **Contexto no especificado**: se desconoce la longitud de contexto efectiva tras el fine-tuning.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para produccion debido a su falta de validacion.
- **Reproducibilidad**: aunque se conserva para reproducibilidad, no se garantiza que los resultados sean consistentes en otros entornos.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/agentic-ptb/opus-high-v3.h022.sft-distil-v2.step_30)
- [Dataset asociado - agentic-ptb/opus-high-v3-data](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Indice de runs - agentic-ptb/INDEX](https://huggingface.co/datasets/agentic-ptb/INDEX)
