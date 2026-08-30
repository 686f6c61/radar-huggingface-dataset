# agentic-ptb/opus-high-v3.h042.seed6.step_8

## Resumen
`opus-high-v3.h042.seed6.step_8` es un checkpoint intermedio publicado por el proyecto AgentPTB, derivado del modelo base Qwen/Qwen3.5-9B-Base mediante un proceso de ajuste supervisado (SFT) ejecutado con Claude Code en el run `opus-high-v3`. El autor lo etiqueta explícitamente como `intermediate` y `negative-results`, indicando que el run no produjo ninguna mejora en los pesos entrenados respecto al modelo base. Su propósito declarado es la reproducibilidad y el estudio cualitativo, no la inferencia de calidad.

Con aproximadamente 9.410 millones de parámetros y un tamaño de repositorio de 18,8 GB en formato safetensors, el checkpoint se publica bajo licencia Apache-2.0. No se proporcionan datos de contexto, idiomas soportados ni cuantizaciones, y la model card advierte expresamente de que no debe inferirse calidad a partir de esta publicación. Su relevancia actual es limitada: sirve como artefacto de investigación para analizar por qué un run de entrenamiento puede regresar sin mejoras, un fenómeno documentado en otros runs del mismo proyecto (p. ej., `opus-high-v2` abortado).

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen/Qwen3.5-9B-Base; no se confirma el detalle) |
| Parametros totales | 9.409.813.744 (~9,41 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (18,8 GB) |

## Arquitectura y entrenamiento
El checkpoint hereda la arquitectura de Qwen/Qwen3.5-9B-Base, un transformer decoder-only de aproximadamente 9.400 millones de parámetros. No se especifican detalles adicionales sobre la configuración interna (número de capas, heads, etc.) en la información disponible.

El entrenamiento corresponde a un run de ajuste supervisado (SFT) ejecutado como parte del experimento `opus-high-v3` del proyecto AgentPTB, utilizando Claude Code como orquestador. El run alcanzó la hora 42 (`h042`) y el paso 8 (`step_8`). Según la model card, el run no encontró ninguna mejora en los pesos entrenados, lo que lo clasifica como resultado negativo. No se detallan el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. El autor retiene el checkpoint únicamente por reproducibilidad y estudio cualitativo.

## Capacidades
- No se han documentado capacidades específicas del checkpoint más allá de las heredadas del modelo base Qwen/Qwen3.5-9B-Base.
- Al ser un checkpoint intermedio sin mejoras verificadas, no se puede afirmar que presente capacidades adicionales de razonamiento, generación de código o tool calling.
- No se dispone de información sobre soporte de funciones (function calling), capacidades multimodales o modos de pensamiento extendido.
- La model card no reporta ningún benchmark funcional ni evaluación cualitativa.

## Casos de uso
- Estudio de reproducibilidad: investigadores pueden analizar este checkpoint para entender por qué un run de SFT puede no mejorar los pesos, comparando los tensores con el modelo base y con otros checkpoints del mismo proyecto.
- Análisis de resultados negativos: útil para documentar y estudiar fallos de entrenamiento en pipelines agenticos, un área poco cubierta en la literatura.
- Depuración de pipelines de entrenamiento: sirve como referencia para verificar que el proceso de guardado y restauración de pesos funciona correctamente, incluso cuando el entrenamiento no converge.
- Investigación sobre dinámicas de pérdida: permite estudiar la evolución de los pesos en pasos tempranos (step_8) y comparar con runs exitosos o abortados.
- No se recomienda su uso en producción ni en aplicaciones que requieran capacidades de generación de texto fiables, dado que no se ha validado su comportamiento y el autor advierte contra inferir calidad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna evaluación comparativa, y el autor clasifica el run como resultado negativo sin mejoras. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros tests estándar.

## Requisitos de hardware
- VRAM estimada para inferencia: el checkpoint en safetensors ocupa 18,8 GB, lo que sugiere pesos en fp32 o bf16. Para cargar el modelo completo en fp32 se necesitan al menos ~38 GB de VRAM; en bf16, ~19 GB.
- GPUs recomendadas: una NVIDIA A100 (40 GB o 80 GB) o H100 (80 GB) para inferencia en precisión completa; una RTX 4090 (24 GB) podría cargar el modelo en bf16 con margen limitado.
- En GPU de consumo: posible con cuantización (p. ej., 4-bit requeriría ~5-6 GB de VRAM), pero no se proporcionan archivos GGUF ni cuantizaciones oficiales.
- Opciones de despliegue: al ser un checkpoint de investigación sin mejoras, no se recomienda su despliegue. Si se quisiera probar, herramientas como vLLM, llama.cpp o Transformers podrían cargar los safetensors, pero no hay configuraciones documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de rendimiento para comparar. El checkpoint es un derivado de Qwen/Qwen3.5-9B-Base, por lo que su comparación natural sería con el propio modelo base:

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base (base) | ~9,4 B | no disponible | no disponible | Apache-2.0 |
| agentic-ptb/opus-high-v3.h042.seed6.step_8 | ~9,4 B | no disponible | sin mejoras verificadas | Apache-2.0 |

Otras alternativas de la misma categoría de tamaño (p. ej., Llama-3.1-8B o Mistral-7B) no son comparables directamente porque no se han evaluado ni el checkpoint ni el modelo base en este contexto. La comparativa real es con otros checkpoints del proyecto AgentPTB (p. ej., `opus-high-v1`), que tampoco tienen datos públicos de rendimiento.

## Limitaciones y advertencias
- El autor declara explícitamente que el run no encontró ninguna mejora en los pesos entrenados; no debe inferirse calidad de esta publicación.
- Es un checkpoint intermedio (`step_8` de `h042`) retenido únicamente por reproducibilidad, no un modelo final listo para uso.
- No se han documentado sesgos, riesgos de alucinación ni limitaciones de contexto o idioma; al ser un derivado de Qwen, podría heredar sesgos del base, pero no hay evaluación.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no está validado para producción y su comportamiento es desconocido.
- No se proporcionan cuantizaciones oficiales, lo que limita su despliegue en entornos con recursos reducidos.
- La fecha de creación (agosto de 2026) y el proyecto AgentPTB sugieren un contexto experimental; los resultados negativos no deben interpretarse como un fallo del modelo base.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h042.seed6.step_8
- Dataset asociado del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Modelo base Qwen/Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
