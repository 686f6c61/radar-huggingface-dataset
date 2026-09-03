# HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-040

## Resumen

`HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-040` es un checkpoint de política de un experimento de aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3-1.7B`. Lo publica el grupo HYU-NLP-EVAL como artefacto de investigación para estudiar la saturación de recompensa y el estancamiento de rúbricas estáticas (rubric staleness) durante la optimización de políticas. El entrenamiento utiliza el algoritmo GRPO con una rúbrica inicial congelada específica del prompt (R0) en el dominio de medicina (RaR Medicine). El checkpoint corresponde al paso 40 de optimización con semilla 11.

Se trata de un modelo de 1.720.574.976 parámetros, exportado en formato Hugging Face Transformers con pesos BF16 en safetensors. No es un modelo de propósito general ni un producto final, sino una pieza de análisis para comprender cómo evoluciona una política cuando la señal de recompensa permanece fija durante el entrenamiento. Su relevancia radica en que documenta un punto intermedio de un experimento controlado, no en sus capacidades como asistente conversacional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos BF16 en safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `Qwen/Qwen3-1.7B`, un transformer decoder-only con atención causal típico de la familia Qwen3. No se proporcionan detalles adicionales sobre la configuración interna (número de capas, cabezas de atención, etc.) en la información disponible.

El entrenamiento consiste en un ajuste por RL con GRPO (Group Relative Policy Optimization). La recompensa se genera mediante una rúbrica inicial congelada (R0) específica de cada prompt, que no se actualiza durante el entrenamiento. El objetivo del experimento es observar cómo la política se adapta a esa señal estática y cuándo se produce saturación o estancamiento. El checkpoint se guardó en el paso 40, con semilla 11. No se incluyen detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente en inglés y otros idiomas, aunque no se han evaluado formalmente sus capacidades multilingües en este checkpoint concreto.
- Razonamiento: al ser una variante de Qwen3-1.7B, conserva las habilidades de razonamiento del modelo base, pero no hay evaluaciones específicas publicadas para este checkpoint.
- Conversación: incluye tokenizer y chat template, por lo que puede usarse en pipelines de chat, aunque su finalidad principal es la investigación.
- Tool calling / function calling: no se menciona soporte específico en la documentación; se asume que hereda las capacidades del modelo base, pero no hay confirmación.
- Capacidades especiales: ninguna adicional documentada (no vision, no audio, no thinking mode explícito).

## Casos de uso

- Investigación en aprendizaje por refuerzo: permite estudiar el efecto de rúbricas estáticas en la optimización de políticas, comparando este checkpoint con otros pasos del mismo experimento.
- Análisis de saturación de recompensa: útil para observar en qué punto la política deja de mejorar o empieza a degradarse cuando la señal de recompensa no se adapta.
- Reproducción de experimentos: sirve como punto de referencia para reproducir los resultados del estudio de HYU-NLP-EVAL sobre rubric staleness.
- Benchmarking de algoritmos RL: puede emplearse como caso de prueba para comparar GRPO con otras variantes de RL en dominios especializados como medicina.
- Auditoría de modelos intermedios: permite inspeccionar los pesos en un paso concreto del entrenamiento para entender la dinámica de aprendizaje.
- Educación en RLHF/RL: útil como ejemplo práctico de cómo se guardan y comparten checkpoints de políticas en experimentos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado que el modelo tiene ~1.72B parámetros y los pesos están en BF16 (2 bytes por parámetro), el tamaño en memoria es aproximadamente 3.4 GB solo para pesos. Con overhead de activaciones y atención, se recomienda una GPU con al menos 6 GB de VRAM para inferencia cómoda.
- GPUs recomendadas: cualquier GPU consumer moderna con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, etc.) puede ejecutar el modelo en BF16. Para entrenamiento o fine-tuning adicional, se necesitaría mayor capacidad (p.ej., A100 o H100).
- Despliegue: compatible con Hugging Face Transformers, vLLM, TGI y otras herramientas que soporten modelos de la familia Qwen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros checkpoints del mismo experimento o con modelos alternativos. La información proporcionada no incluye resultados de rendimiento ni métricas que permitan establecer comparaciones objetivas.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de producción. No debe usarse en aplicaciones reales sin una evaluación exhaustiva.
- El dominio de entrenamiento es medicina, pero el modelo no es un dispositivo médico y no debe sustituir el consejo profesional.
- La recompensa estática (R0) puede haber provocado sobreajuste a la rúbrica concreta, lo que limita la generalización a otros dominios.
- No se han evaluado sesgos, alucinaciones ni riesgos de seguridad en este checkpoint.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no está validado para ello.
- El checkpoint solo cubre el paso 40; no se incluyen optimizador, scheduler ni estado de entrenamiento, por lo que no se puede reanudar el entrenamiento directamente.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-040)
- [Modelo base Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B)
