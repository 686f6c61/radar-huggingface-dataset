# agentic-ptb/opus-high-v3.h068.sft-splice-cont.step_6

## Resumen

El modelo `agentic-ptb/opus-high-v3.h068.sft-splice-cont.step_6` es un checkpoint intermedio derivado de un run de entrenamiento experimental denominado **opus-high-v3**, desarrollado por el equipo `agentic-ptb`. Se trata de un fine-tuning por *supervised fine-tuning* (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El checkpoint se generó en la hora 68 del run y corresponde al paso 6 de una etapa llamada `sft-splice-cont`.

La model card del autor incluye una advertencia explícita: es un checkpoint intermedio/derivado retenido para reproducibilidad y estudio cualitativo, y el run **no encontró mejoras en los pesos entrenados**. Por tanto, no debe inferirse calidad ni utilidad práctica a partir de su publicación. Su interés es puramente experimental y de trazabilidad dentro del proyecto AgentPTB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, sin especificar) |
| Tipos de cuantizacion | no disponible (repo solo con safetensors fp32/fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de `Qwen/Qwen3.5-9B-Base`, un modelo denso de 9,4 mil millones de parámetros. El entrenamiento consistió en un fine-tuning supervisado (SFT) aplicado sobre el modelo base, dentro de un pipeline experimental denominado `opus-high-v3`, ejecutado mediante el agente Claude Code de Anthropic. El run completo abarcó al menos 68 horas y múltiples etapas; este checkpoint corresponde a una etapa de "splice continuo" (sft-splice-cont) en su paso 6.

Según la documentación del autor, el run no produjo mejoras en los pesos entrenados, lo que sugiere que el fine-tuning no logró superar al modelo base en las métricas evaluadas. No se proporcionan detalles sobre el dataset de entrenamiento, número de tokens, ni técnicas adicionales como RLHF o DPO. Toda la información disponible apunta a que es un artefacto de investigación para reproducibilidad y análisis, no un modelo listo para uso.

## Capacidades

- No se documentan capacidades específicas para este checkpoint.
- Al ser un fine-tuning de Qwen3.5-9B-Base, hereda las capacidades generales del modelo base (generación de texto, razonamiento, código, matemáticas), pero no se han verificado ni reportado resultados.
- No hay información sobre tool calling, agentes, modo *thinking*, visión o audio.
- La advertencia del autor indica que no debe inferirse rendimiento a partir de este checkpoint.

## Casos de uso

Dado el carácter intermedio y la ausencia de mejoras reportadas, este checkpoint no tiene casos de uso prácticos recomendados. Su función es exclusivamente investigadora:

- Reproducibilidad de experimentos: permite replicar el run `opus-high-v3` y verificar los resultados negativos reportados.
- Estudio cualitativo de pesos intermedios: se puede analizar cómo evolucionan los pesos durante el entrenamiento y por qué no se logra mejora.
- Trazabilidad en pipelines de IA agéntica: sirve como punto de control dentro del flujo AgentPTB para auditar decisiones de entrenamiento.
- Investigación sobre fallos de fine-tuning: útil para estudiar por qué un SFT sobre Qwen3.5-9B-Base no converge a mejoras.

No se recomienda su uso en producción ni en aplicaciones reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni ninguna otra evaluación. El autor indica explícitamente que el run no encontró mejoras en los pesos entrenados, pero no aporta cifras concretas.

## Requisitos de hardware

No hay requisitos oficiales publicados para este checkpoint. Como estimación general para un modelo denso de 9,4 mil millones de parámetros en fp16, se necesitarían aproximadamente 19 GB de VRAM solo para los pesos, más overhead de activaciones y caché. En cuantización int8 se reduciría a unos 10 GB, y en int4 a unos 5 GB. Sin embargo, al tratarse de un artefacto de investigación sin uso práctico, no se recomienda su despliegue en infraestructura de producción.

Para inferencia local, se podría usar vLLM, llama.cpp u Ollama, pero no hay configuraciones validadas para este checkpoint concreto.

## Comparativa con modelos similares

No hay datos comparativos disponibles para este checkpoint. Al ser un fine-tuning intermedio sin mejoras reportadas, no se puede comparar con otros modelos de forma significativa. La única referencia posible es su modelo base `Qwen/Qwen3.5-9B-Base`, pero no se dispone de métricas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Checkpoint intermedio sin mejoras entrenadas: el run no logró superar al modelo base, por lo que su rendimiento es, como mínimo, igual o inferior al de Qwen3.5-9B-Base.
- No apto para producción: no hay validación de calidad, ni benchmarks, ni documentación de capacidades.
- Posibles sesgos heredados del modelo base Qwen, que pueden incluir sesgos culturales, lingüísticos o de contenido.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño, no mitigado por este entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero el autor desaconseja explícitamente inferir calidad a partir de este checkpoint.
- Sin información sobre idiomas soportados ni longitud de contexto efectiva.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v3.h068.sft-splice-cont.step_6)
- [Dataset del run opus-high-v3](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Modelo base Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base) (referencia)
- [Colección de modelos agentic-ptb en HuggingFace](https://huggingface.co/models?other=agentic-ptb)
