# agentic-ptb/opus-high-v3.h074.soup-spl2

## Resumen

`agentic-ptb/opus-high-v3.h074.soup-spl2` es un checkpoint intermedio generado durante el run **opus-high-v3** del proyecto AgentPTB, una iniciativa que utiliza agentes de Claude Code para explorar procesos de fine-tuning y mezcla de pesos (soup). El modelo parte de la base `Qwen/Qwen3.5-9B-Base`, un transformer de 9.409.813.744 parámetros, y se publica con licencia Apache 2.0 en formato safetensors.

El autor clasifica este checkpoint como de rol `intermediate` y advierte explícitamente que el run **no encontró mejora en los pesos entrenados**, por lo que se trata de un resultado negativo. Su publicación responde a criterios de reproducibilidad y estudio cualitativo del proceso, no a un valor práctico como modelo de producción. No existen descargas ni valoraciones en HuggingFace, y la información disponible es mínima.

A pesar de su falta de utilidad directa, este checkpoint resulta relevante para investigadores interesados en la metodología de entrenamiento dirigido por agentes, la reproducibilidad de experimentos fallidos y el análisis de artefactos intermedios. No debe emplearse como modelo funcional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura hereda la del modelo base Qwen3.5-9B-Base, un transformer denso de aproximadamente 9.400 millones de parámetros. No se proporcionan detalles adicionales sobre la configuración interna (número de capas, cabezas de atención, etc.) en la información disponible.

El entrenamiento se llevó a cabo mediante un run de Claude Code del proyecto AgentPTB, identificado como `opus-high-v3` en su hora `h074`. La procedencia del checkpoint es `scratch/agent/soup-spl2`, lo que sugiere que se trata de un artefacto intermedio dentro de un proceso de mezcla de pesos (model soup). No se especifican los datos de entrenamiento, el número de tokens, ni la técnica de alineación (RLHF, DPO, etc.). El propio autor declara que el run no produjo ninguna mejora en los pesos entrenados, lo que define este checkpoint como un resultado negativo.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al tratarse de un resultado negativo sin mejoras sobre el modelo base, sus capacidades serían, en principio, las heredadas de Qwen3.5-9B-Base, pero no se dispone de información que lo confirme. El autor recomienda explícitamente no inferir calidad a partir de su publicación.

## Casos de uso

- Reproducibilidad de experimentos: el checkpoint permite replicar el run `opus-high-v3` y verificar los resultados negativos reportados.
- Estudio cualitativo de artefactos intermedios: investigadores pueden analizar la evolución de los pesos durante el proceso de soup y comparar con otros checkpoints del mismo run.
- Análisis metodológico: sirve como caso de estudio para entender por qué ciertos enfoques de fine-tuning dirigido por agentes pueden no producir mejoras.
- Auditoría de procesos de entrenamiento: útil para equipos que deseen inspeccionar la trazabilidad de experimentos fallidos.
- No se recomienda su uso en aplicaciones prácticas, generación de texto, código o razonamiento, dado que el run no validó ninguna mejora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware para este checkpoint. Como referencia orientativa, un modelo de 9.409.813.744 parámetros en precisión FP16 requiere aproximadamente 18.8 GB de VRAM solo para los pesos, lo que implica una GPU profesional (A100, H100) o una consumer de gama alta (RTX 4090 con 24 GB) para inferencia sin cuantización. No se han publicado recomendaciones de despliegue ni datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El checkpoint es un artefacto intermedio sin validación de rendimiento, y no existen modelos comparables en la misma categoría (checkpoints de runs de agentes con resultados negativos). El modelo base Qwen3.5-9B-Base sería el punto de referencia natural, pero no se aportan datos de este en la documentación del checkpoint.

## Limitaciones y advertencias

- Resultado negativo: el run no encontró mejora en los pesos entrenados; no debe inferirse calidad del modelo.
- Checkpoint intermedio: no es un modelo final ni apto para producción.
- Falta de documentación: no se especifican datos de entrenamiento, contexto, idiomas ni capacidades.
- Sesgos y alucinaciones: no se ha evaluado ni documentado ningún aspecto de seguridad o sesgo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo no ofrece valor funcional.
- Reproducibilidad limitada: el dataset de archive (`agentic-ptb/opus-high-v3-data`) existe, pero su contenido y utilidad no están descritos en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h074.soup-spl2
- Dataset de archive del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice de datasets del proyecto: https://huggingface.co/datasets/agentic-ptb/INDEX
- Listado de modelos con tag agentic-ptb: https://huggingface.co/models?other=agentic-ptb
