# agentic-ptb/opus-high-v3.h015.sft-v5.step_12

## Resumen

`opus-high-v3.h015.sft-v5.step_12` es un checkpoint intermedio derivado del modelo base Qwen/Qwen3.5-9B-Base, publicado por el usuario agentic-ptb como parte de un experimento de entrenamiento supervisado (SFT) dentro del proyecto AgentPTB. El nombre hace referencia a un run de Claude Code (opus-high-v3) y a un paso concreto de entrenamiento (step_12). El propio autor lo etiqueta como "negative-results" y advierte explícitamente en la model card que el run no produjo ninguna mejora en los pesos entrenados, por lo que no debe inferirse calidad alguna a partir de su publicación.

Con 9.409.813.744 parámetros (aproximadamente 9,4B), este checkpoint se distribuye en formato safetensors con un tamaño de repositorio de 18,8 GB. Su relevancia es principalmente metodológica: sirve como material de reproducibilidad y estudio cualitativo de un experimento fallido, no como un modelo listo para uso en producción. No se dispone de información sobre longitud de contexto, idiomas soportados, cuantizaciones ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura hereda la del modelo base Qwen/Qwen3.5-9B-Base, un transformer denso de aproximadamente 9,4 mil millones de parámetros. No se ha publicado información sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni la metodología de ajuste (si se empleó RLHF, DPO u otra técnica). El checkpoint corresponde a un paso concreto (step_12) de un run de SFT (sft-v5) dentro del experimento opus-high-v3.

El dato más relevante es que el run completo no mostró ninguna mejora en los pesos entrenados: según la documentación del proyecto, los cinco runs de SFT de esta celda regresaron, y el checkpoint se conserva únicamente con fines de reproducibilidad y estudio cualitativo. No hay innovaciones técnicas destacables que reportar, dado que el experimento se documenta como un resultado negativo.

## Capacidades

- Generación de texto: el modelo puede generar texto al ser un derivado de Qwen3.5-9B-Base, pero no se ha verificado su calidad tras el ajuste.
- Razonamiento y código: capacidades heredadas del modelo base, sin validación publicada en este checkpoint.
- Tool calling y funciones de agente: no hay evidencia de soporte específico en la documentación disponible.
- Multilingüismo: no se especifican idiomas soportados.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

Dado el aviso del autor, no se recomienda atribuir ninguna capacidad concreta a este checkpoint más allá de las que pudiera tener el modelo base sin ajustar.

## Casos de uso

- Reproducibilidad de experimentos: el checkpoint permite a investigadores replicar el run opus-high-v3 y verificar los resultados negativos reportados, comparando los pesos del paso 12 con los del modelo base.
- Estudio de dinámicas de entrenamiento: útil para analizar por qué un run de SFT concreto regresa, examinando la evolución de los pesos en pasos intermedios.
- Análisis de degradación: sirve para estudiar cómo el ajuste supervisado puede empeorar el rendimiento respecto al modelo base en ciertas configuraciones.
- Auditoría de pipelines de entrenamiento: como caso documentado de fallo, puede usarse como referencia en el diseño de experimentos de alineación.
- Comparación de checkpoints: permite contrastar este paso con otros del mismo run (si se publican) para trazar la trayectoria de pérdida.
- Docencia e investigación metodológica: ejemplo concreto de un resultado negativo en IA open source, útil para discutir prácticas de publicación y reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el run no produjo mejora en los pesos entrenados, por lo que no hay métricas de rendimiento que reportar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 9,4B parámetros en precisión fp16, se necesitarían aproximadamente 19 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no especificadas. En la práctica, una GPU con 24 GB (RTX 3090/4090) podría ser suficiente para inferencia en fp16 con contexto corto, pero no hay datos confirmados.
- Compatibilidad con GPU de consumo: probablemente sí en cuantización (p. ej., GGUF de 4 bits), pero no se ofrecen archivos cuantizados en el repositorio.
- Opciones de despliegue: al ser un checkpoint safetensors, podría cargarse con transformers, vLLM o llama.cpp si se convierte a GGUF, pero no hay soporte oficial documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base (base) | 9,4B | no disponible | Apache-2.0 | Modelo base oficial |
| agentic-ptb/opus-high-v3.h015.sft-v5.step_12 | 9,4B | no disponible | Apache-2.0 | Checkpoint intermedio, resultado negativo |
| Otros modelos 9B (p. ej., Llama-3.1-8B, Mistral-7B) | 7-8B | 8K-128K | variada | Modelos estables con benchmarks publicados |

No se dispone de datos de rendimiento para comparar este checkpoint con alternativas. La comparativa se limita a parámetros y licencia, y el propio autor desaconseja inferir calidad del checkpoint.

## Limitaciones y advertencias

- Resultado negativo confirmado: el run no produjo ninguna mejora en los pesos entrenados; el modelo no debe usarse como si fuera un modelo ajustado de calidad.
- Sin benchmarks publicados: no hay métricas objetivas de rendimiento en ninguna tarea.
- Información incompleta: se desconocen la longitud de contexto, los idiomas soportados y las cuantizaciones disponibles.
- Riesgo de alucinación y sesgos: al ser un derivado de Qwen3.5-9B-Base, hereda los sesgos del modelo base, pero no hay evaluación específica.
- Uso en producción desaconsejado: el autor lo etiqueta como "intermediate/derived checkpoint" y lo conserva solo para reproducibilidad y estudio cualitativo.
- Licencia Apache-2.0: permite uso comercial, pero sin garantías de calidad ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h015.sft-v5.step_12
- Dataset del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Modelo base Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
