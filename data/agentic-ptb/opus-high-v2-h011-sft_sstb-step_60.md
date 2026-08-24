# agentic-ptb/opus-high-v2.h011.sft_sstB.step_60

## Resumen

`agentic-ptb/opus-high-v2.h011.sft_sstB.step_60` es un checkpoint intermedio publicado por el proyecto AgentPTB, un experimento de entrenamiento agéntico que utiliza Claude Code / `claude-opus-5` para generar datos de entrenamiento. Este modelo concreto es un ajuste fino supervisado (SFT) sobre la base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros, y corresponde al paso 60 de la celda `opus-high-v2` en la hora 11 de un run de 100 horas.

El autor es explícito en la model card: este checkpoint tiene un rol **intermedio** y no debe compararse con otros modelos sin leer primero el registro completo. De hecho, en esta celda **todos** los runs SFT regresaron frente a los tensores base: el mejor de ellos obtuvo un 17,2% frente al 29,1% del modelo base en 285 tareas emparejadas de SWE-bench-verified. El artefacto que se recomienda usar es `base_real`, que es el modelo base sin modificaciones. Por tanto, este checkpoint no es un modelo final utilizable, sino un artefacto de investigación que documenta un intento fallido de mejora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B-Base, un transformer denso de 9B parámetros. El entrenamiento consiste en un ajuste fino supervisado (SFT) sobre datos generados por el pipeline AgentPTB, que utiliza Claude Code con `claude-opus-5` a esfuerzo alto para producir ejemplos de razonamiento y ejecución de tareas. El checkpoint corresponde al paso 60 de la celda `opus-high-v2`, dentro de la hora 11 de un run de 100 horas.

Según la model card, el autor reporta que **todos** los runs SFT de esta celda regresaron frente a los tensores base. El mejor checkpoint SFT obtuvo un 17,2% de éxito en 285 tareas emparejadas de SWE-bench-verified, frente al 29,1% del modelo base. Esto indica que el proceso de SFT con estos datos no solo no mejoró el rendimiento, sino que lo degradó significativamente. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

No se dispone de información específica sobre las capacidades de este checkpoint más allá de las heredadas del modelo base Qwen3.5-9B-Base. Dado que el autor advierte explícitamente de la regresión en tareas de razonamiento y codificación, no se puede garantizar ninguna capacidad concreta. Las capacidades potenciales del base incluyen:

- Generación de texto y razonamiento general
- Generación de código y resolución de problemas de programación
- Soporte multilingüe (dependiendo del base, no confirmado aquí)
- Posible soporte de tool calling y agentes (no confirmado para este checkpoint)

Sin embargo, el rendimiento real de este checkpoint en estas tareas es inferior al del base, por lo que no se recomienda su uso para ninguna de ellas.

## Casos de uso

Dado el carácter intermedio y la regresión documentada, no se recomienda el uso de este checkpoint en ningún escenario práctico. Los únicos usos razonables son:

- **Investigación sobre fallos de SFT**: analizar por qué el ajuste fino con datos agénticos degrada el rendimiento, comparando con el base.
- **Reproducción de experimentos**: verificar los resultados reportados en el registro de la celda `opus-high-v2`.
- **Estudio de la dinámica de entrenamiento**: examinar cómo evoluciona el rendimiento a lo largo de los pasos de SFT.
- **Comparación de checkpoints**: contrastar este paso 60 con otros pasos de la misma celda para entender la trayectoria de pérdida.
- **Auditoría de pipelines de datos**: evaluar la calidad de los datos generados por el pipeline AgentPTB.
- **Documentación de buenas prácticas**: usar este caso como ejemplo de qué evitar en el entrenamiento de modelos agénticos.

En ningún caso se recomienda su uso en producción, ni siquiera como modelo base para otros ajustes.

## Benchmarks y rendimiento

El autor proporciona un único dato de rendimiento en la model card:

| Tarea | Checkpoint SFT (mejor) | Modelo base |
|---|---|---|
| SWE-bench-verified (285 tareas emparejadas) | 17,2% | 29,1% |

No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El dato mostrado indica una regresión clara frente al base.

## Requisitos de hardware

Dado que el modelo tiene 9.409.813.744 parámetros, los requisitos estimados para inferencia son:

- **VRAM en FP16**: aproximadamente 18,8 GB (9,4B × 2 bytes), más overhead de activaciones y KV cache. Cabe en una GPU de 24 GB (RTX 3090/4090, A10G) con margen limitado.
- **VRAM en cuantización INT8**: aproximadamente 9,4 GB, cabe en GPUs de 12-16 GB (RTX 4070 Ti, A4000).
- **VRAM en cuantización INT4**: aproximadamente 4,7 GB, cabe en GPUs de 8 GB (RTX 3060, L4).
- **GPU recomendadas**: A100 40GB, H100, RTX 4090, o cualquier GPU con al menos 24 GB para FP16 sin cuantizar.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, TGI, Transformers con `device_map="auto"`.
- **Latencia y throughput**: no disponibles para este checkpoint específico. Para un modelo de 9B en FP16 en una A100, se puede esperar un throughput de decodificación de 50-100 tokens/s, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench-verified | Licencia |
|---|---|---|---|---|
| `agentic-ptb/opus-high-v2.h011.sft_sstB.step_60` | 9,4B | no disponible | 17,2% | no disponible |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | 29,1% | no disponible |
| Qwen2.5-7B-Instruct (referencia) | 7,6B | 128K | no disponible | Apache 2.0 |

La comparación directa con el base es la más relevante: el checkpoint SFT es claramente inferior. No se dispone de datos de otros modelos comparables en la misma tarea.

## Limitaciones y advertencias

- **Regresión de rendimiento**: el autor reporta que este checkpoint SFT obtiene un 17,2% en SWE-bench-verified frente al 29,1% del base. No es apto para tareas de razonamiento o codificación.
- **Rol intermedio**: es un checkpoint de un experimento, no un modelo final. No debe usarse en producción.
- **Licencia no disponible**: no se especifica licencia, lo que impide su uso comercial sin aclaración legal.
- **Idiomas no especificados**: no se indica qué idiomas soporta, aunque el base Qwen3.5 probablemente sea multilingüe.
- **Riesgo de alucinación**: al ser un SFT degradado, es probable que aumente la tasa de alucinaciones, aunque no hay datos confirmados.
- **Contexto no especificado**: se desconoce la longitud de contexto soportada, lo que limita su uso en tareas de ventana larga.
- **Sin garantías de calidad**: el autor publica el checkpoint porque fue producido y medido, no porque sea bueno. Cualquier uso debe considerar esta advertencia.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v2.h011.sft_sstB.step_60)
- [Registro de la celda opus-high-v2](https://huggingface.co/agentic-ptb/opus-high-v2-record)
- [Índice de AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)
- [Búsqueda de modelos agentic-ptb en HuggingFace](https://huggingface.co/models?other=agentic-ptb)
- [Página de Claude Opus de Anthropic](https://www.anthropic.com/claude/opus)
- [Comparativa de modelos Claude (SecondTalent)](https://www.secondtalent.com/resources/every-claude-ai-model-explained-compared/)
- [AA Agentic Index Leaderboard (BenchLM)](https://benchlm.ai/benchmarks/aaagenticindex)
