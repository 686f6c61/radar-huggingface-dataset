# agentic-ptb/opus-high-v3.h015.sft-v5.step_24

## Resumen

Este modelo es un checkpoint intermedio del run `opus-high-v3` del proyecto AgentPTB, un experimento de fine-tuning supervisado (SFT) sobre la base `Qwen/Qwen3.5-9B-Base`. El autor, `agentic-ptb`, lo publica con la etiqueta explícita de "resultado negativo": el run no produjo ninguna mejora en los pesos entrenados respecto al modelo base. Se conserva únicamente con fines de reproducibilidad y estudio cualitativo, no como un modelo utilizable.

Con 9.409.813.744 parámetros y licencia Apache-2.0, este checkpoint no aporta valor práctico para inferencia, ya que su rendimiento es equivalente o inferior al del modelo base. Su relevancia radica en documentar un experimento fallido dentro de un pipeline de entrenamiento agéntico, lo que puede servir a otros investigadores para evitar errores similares o analizar las causas de la regresión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5-9B-Base (detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del checkpoint base `Qwen/Qwen3.5-9B-Base`. No se proporcionan detalles sobre la arquitectura interna del base (número de capas, atención, etc.) ni sobre el dataset de entrenamiento utilizado. El run `opus-high-v3` se ejecutó durante 15 horas (h015) y produjo este checkpoint en el paso 24, pero el autor indica que no se observó ninguna mejora en los pesos entrenados. De hecho, el run `opus-high-v2` fue abortado porque sus cinco runs de SFT regresaron a los tensores del modelo base sin cambios. Esto sugiere un problema sistemático en el pipeline de entrenamiento, no una característica del modelo en sí.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al ser un fine-tune sin mejora sobre Qwen3.5-9B-Base, sus capacidades teóricas serían las del modelo base, pero no hay evidencia de que este checkpoint las preserve o las mejore. El autor advierte explícitamente que no se debe inferir calidad a partir de la publicación.

## Casos de uso

- Reproducibilidad de experimentos: sirve como referencia para comparar con otros checkpoints del mismo run y entender por qué el entrenamiento no convergió.
- Análisis de fallos en pipelines de SFT: investigadores pueden estudiar este checkpoint para identificar patrones de regresión o problemas de optimización.
- Auditoría de procesos agénticos: el run fue ejecutado por Claude Code, por lo que puede usarse para evaluar la calidad de los artefactos generados por agentes autónomos.
- No se recomienda su uso en producción ni en aplicaciones reales, dado que no aporta ninguna ventaja sobre el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Dado el carácter de resultado negativo, es probable que el rendimiento sea igual o inferior al de Qwen3.5-9B-Base, pero no hay datos que lo confirmen.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware. Dado el tamaño de 9.4B parámetros, se puede estimar que:

- VRAM mínima para inferencia en FP16: aproximadamente 19-20 GB (solo pesos), más overhead de activaciones.
- Con cuantización INT8: alrededor de 10-11 GB; con INT4: unos 5-6 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para FP16, o GPUs con 12-16 GB para cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, siempre que se conviertan los pesos a los formatos adecuados (GGUF, etc.).
- Latencia y throughput: no disponibles.

Estas cifras son estimaciones generales para modelos de 9B, no datos específicos de este checkpoint.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con otros modelos de la misma categoría. Al ser un checkpoint intermedio de un experimento fallido, no tiene sentido compararlo con alternativas comerciales o de código abierto.

## Limitaciones y advertencias

- Resultado negativo confirmado: el autor indica que no hay mejora en los pesos entrenados; el modelo no debe usarse como si fuera un fine-tune válido.
- Checkpoint intermedio: no es un modelo final, sino un artefacto de un run de 15 horas en el paso 24.
- Riesgo de alucinación y sesgos: al estar basado en Qwen3.5-9B-Base, hereda los sesgos del modelo base, pero no hay evaluación específica.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no es apto para producción por su falta de mejora.
- No se dispone de información sobre el dataset de entrenamiento, por lo que no se pueden evaluar riesgos de contaminación o sesgos adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h015.sft-v5.step_24
- Dataset del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
