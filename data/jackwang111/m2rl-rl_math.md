# Jackwang111/M2RL-RL_Math

## Resumen

Jackwang111/M2RL-RL_Math es un modelo de lenguaje de 4.022 millones de parámetros (4,0B) obtenido mediante fine-tuning del modelo base Qwen/Qwen3-4B-Base con la técnica M2RL (Mixed multi-task RLVR). El modelo está diseñado para reforzar el razonamiento matemático, aprovechando el aprendizaje por refuerzo con verificación de recompensas (RLVR) en múltiples tareas. El desarrollo corre a cargo del usuario Jackwang111, y la técnica M2RL está documentada en el repositorio Mosi-AI/M2RL, que reporta resultados comparables a los de RLVR separado seguido de fusión de modelos, con un ahorro del 66,8% de horas de GPU.

La arquitectura subyacente es la de Qwen3-4B: un transformer causal con 36 capas, atención con Grouped Query Attention (32 cabezas de consulta y 8 de clave-valor), y una longitud de contexto nativa de 32.768 tokens, ampliable a 131.072 mediante YaRN. El modelo se distribuye en formato safetensors bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (basado en Qwen3-4B) |
| Parametros totales | 4.022.468.096 (4,0B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativo; 131.072 con YaRN |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base Qwen3-4B declara soporte de 100+ idiomas, pero no se ha confirmado para este fine-tuning) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3-4B, un transformer causal denso de 36 capas con Grouped Query Attention (32 cabezas de consulta y 8 de clave-valor) y aproximadamente 3.600 millones de parámetros no-embedding. El entrenamiento parte del checkpoint Qwen/Qwen3-4B-Base y se aplica un proceso de fine-tuning con aprendizaje por refuerzo basado en verificación de recompensas (RLVR). Según la documentación de M2RL, la técnica emplea una mezcla de tareas de razonamiento (matemáticas, código, ciencia) en un único entrenamiento RLVR, en lugar de entrenamientos separados seguidos de fusión de modelos. M2RL reporta un rendimiento comparable al de RLVR separado con una reducción del 66,8% en horas de GPU, y señala que los dominios intensivos en razonamiento (matemáticas, código, ciencia) presentan efectos sinérgicos fuertes.

No se ha publicado información específica sobre la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO en este fine-tuning concreto. El model card disponible es el original de Qwen3-4B, sin documentación específica del proceso de ajuste.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3-4B soporta modo de pensamiento (thinking mode) y modo no-pensamiento (non-thinking mode), activables mediante `enable_thinking` en el chat template.
- Razonamiento matemático: al ser un fine-tuning orientado a matemáticas con RLVR, se espera un refuerzo en tareas de razonamiento matemático, aunque no se aportan evaluaciones públicas.
- Generación de código: el modelo base Qwen3-4B tiene capacidades de código, según su documentación.
- Tool calling / function calling: el modelo base Qwen3-4B es experto en integración con herramientas externas, tanto en modo pensamiento como no-pensamiento.
- Capacidades multilingües: el modelo base Qwen3-4B declara soporte de 100+ idiomas y dialectos, con instrucción multilingüe y traducción. Para este fine-tuning no se ha confirmado.
- Agentes y razonamiento multi-paso: el modelo base destaca en tareas de agentes complejas, según el README.

## Casos de uso

- Tutoría de matemáticas en plataformas educativas: el modelo puede resolver problemas paso a paso y generar explicaciones didácticas. Su fine-tuning con RLVR en matemáticas refuerza la precisión en este dominio, lo que lo hace adecuado para asistentes de estudio.
- Generación de ejercicios personalizados: puede crear problemas de matemáticas con distintos niveles de dificultad. Al ser un modelo de 4B, se puede desplegar en servidores de bajo coste para generar contenido educativo a escala.
- Verificación de soluciones en sistemas de corrección automática: el modelo puede comprobar si un razonamiento matemático es válido y detectar errores. Esto es útil en entornos de evaluación académica.
- Asistente en análisis de datos numéricos: puede interpretar resultados estadísticos o plantear modelos matemáticos. Su capacidad de razonamiento lógico, heredada de Qwen3-4B, permite explicar conclusiones a partir de datos.
- Agente de resolución de problemas con herramientas externas: combinado con tool calling, puede consultar calculadoras, APIs o bases de conocimiento para resolver problemas complejos. El modelo base Qwen3-4B es experto en integración de herramientas.
- Generación de código para cálculo numérico: puede escribir scripts en Python para resolver ecuaciones, realizar simulaciones o automatizar cálculos. Esto hereda la capacidad de generación de código de Qwen3-4B, y el fine-tuning en matemáticas mejora la precisión en problemas numéricos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card no incluye evaluaciones propias del fine-tuning, y los únicos datos de rendimiento disponibles corresponden al modelo base Qwen3-4B, no a este ajuste específico.

## Requisitos de hardware

- VRAM estimada para inferencia: ~8 GB en FP16 (solo pesos), ~4 GB en INT8, ~2 GB en INT4. Estas cifras son orientativas y no incluyen memoria para KV cache ni activaciones.
- GPU recomendadas: RTX 4090 (24 GB) o superior para FP16 con contexto largo; A100 40 GB o H100 para despliegue con ventana de contexto ampliada.
- Sí cabe en GPU de consumo: RTX 3090/4090 (24 GB) puede ejecutar el modelo en FP16 con contexto moderado; en cuantización 4-bit puede ejecutarse en GPUs de 8-12 GB.
- Opciones de despliegue: vLLM, SGLang, Ollama, llama.cpp, Transformers, TGI.
- Latencia y throughput estimados: no disponible.

No se han publicado requisitos oficiales para este fine-tuning; las cifras se derivan del tamaño del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Jackwang111/M2RL-RL_Math | 4,0B | 32.768 (131.072 con YaRN) | Apache 2.0 | safetensors | Fine-tuning de Qwen3-4B-Base con RLVR (M2RL) |
| Qwen/Qwen3-4B | 4,0B | 32.768 (131.072 con YaRN) | Apache 2.0 | safetensors | Modelo de la familia Qwen3 con post-training (según README) |
| Qwen/Qwen3-4B-Base | No disponible | No disponible | Apache 2.0 | No disponible | Modelo base sobre el que se realiza el fine-tuning |

No se dispone de datos de rendimiento del fine-tuning, por lo que la comparativa se limita a características técnicas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. El modelo base Qwen3-4B puede heredar sesgos de sus datos de entrenamiento, pero no se han publicado evaluaciones de sesgo para este fine-tuning.
- Riesgo de alucinación: no evaluado. Al ser un modelo pequeño (4B) y un fine-tuning experimental, la precisión en matemáticas puede ser variable. Se recomienda verificación externa.
- Limitaciones de contexto: la ventana nativa es de 32.768 tokens; el uso de YaRN para ampliar a 131.072 puede requerir ajustes de configuración y puede afectar al rendimiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución. Sin embargo, el modelo se basa en Qwen3-4B-Base, también Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Caveats para producción: no se han publicado evaluaciones independientes ni benchmarks. El model card es el original de Qwen3-4B, sin documentación específica del fine-tuning. Se recomienda validar el modelo en el dominio objetivo antes de desplegarlo.

## Enlaces

- HuggingFace: https://huggingface.co/Jackwang111/M2RL-RL_Math
- GitHub M2RL: https://github.com/Mosi-AI/M2RL
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub QwenLM/Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Paper arXiv 2309.00071: https://arxiv.org/abs/2309.00071
- Paper arXiv 2505.09388: https://arxiv.org/abs/2505.09388
