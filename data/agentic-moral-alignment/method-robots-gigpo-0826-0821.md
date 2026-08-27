# agentic-moral-alignment/method-robots-gigpo-0826-0821

## Resumen

`method-robots-gigpo-0826-0821` es un conjunto de adaptadores LoRA (librería PEFT) publicados por la organización Agentic Moral Alignment, entrenados sobre el modelo base `Qwen/Qwen3.5-4B-Base`. El nombre del run (`gigpo`) y la configuración congelada indican que se trata de un entrenamiento por refuerzo (tipo GRPO) en el entorno de juego `robots`, con el objetivo de alinear el comportamiento del agente con principios morales deontológicos suaves (`deon_soft`). El repositorio contiene cinco checkpoints (pasos 20, 25, 30, 35 y 40) en subcarpetas separadas, listos para cargar con `PeftModel`.

Este modelo es relevante en el contexto de investigación sobre alineación moral de agentes autónomos, una línea que combina RL clásico con recompensas intrínsecas derivadas de marcos éticos (deontología y utilitarismo). No está pensado para uso productivo directo: es un artefacto experimental que requiere fusión con el modelo base antes de servirse con vLLM, ya que el propio autor advierte que el adaptador es un no-op silencioso en ese servidor si no se hace `merge_and_unload`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `Qwen/Qwen3.5-4B-Base` (arquitectura del modelo base no especificada en la información disponible) |
| Parámetros totales | No disponible (solo el adaptador; el repo ocupa 0.6 GB) |
| Parámetros activos | No disponible (adaptador LoRA rank 32, alpha 64) |
| Longitud de contexto | No disponible (config de entrenamiento: `MAX_MODEL_LEN=45056`, `PROMPT_LEN=4096`, `RESPONSE_LEN=40960`) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 64, aplicado sobre `Qwen/Qwen3.5-4B-Base`. El entrenamiento se realizó con el framework verl (shards FSDP convertidos a PEFT), en una sola GPU, con 64 secuencias por paso y un total de 40 pasos. La configuración congelada (`frozen run config`) muestra un pipeline de RL con recompensas basadas en `reward_to_go`, normalización por estado (`state_mean`/`state_std`), descuento gamma 0.95 y lambda TD 0.8. El entorno de entrenamiento es un juego de «robots» con un límite de 64 turnos por episodio y un presupuesto de 4096 tokens por turno para el razonamiento del agente.

La novedad técnica destacable es la combinación de RL con recompensas intrínsecas de moral deontológica suave (`deon_soft`), lo que se alinea con los trabajos previos de la organización sobre alineación moral en agentes LLM. No se especifica el dataset de entrenamiento ni el proceso de datos (no hay mención de RLHF/DPO; el pipeline es claramente RL con GRPO).

## Capacidades

- Alineación moral en entornos de juego (robots): el adaptador se ha entrenado para maximizar recompensas bajo un criterio deontológico suave, lo que implica cierta capacidad de razonamiento ético dentro del dominio de entrenamiento.
- Razonamiento multi-turno: el entorno limita a 64 turnos y el modelo usa `THINKING=True`, lo que sugiere que genera cadenas de razonamiento antes de actuar.
- Integración con PEFT: se puede cargar y fusionar con el modelo base mediante `PeftModel` y `merge_and_unload`.
- No se dispone de información sobre capacidades generales de generación de texto, código, matemáticas o multilingüismo más allá de las heredadas del modelo base (no documentadas en esta ficha).

## Casos de uso

- Investigación en alineación moral de agentes: el adaptador sirve como punto de partida para estudiar cómo las recompensas intrínsecales deontológicas afectan la política de un agente en entornos simulados con interacciones repetidas.
- Reproducción de experimentos de RL con GRPO: los checkpoints intermedios (step_20 a step_40) permiten analizar la evolución del aprendizaje y la estabilidad de la política.
- Desarrollo de sistemas de agente con razonamiento ético: aunque no es apto para producción, puede servir de base para experimentar con capas de razonamiento moral en agentes conversacionales.
- Evaluación de robustez en entornos de dilema moral: el entorno «robots» con `deon_soft` permite probar cómo el agente responde ante situaciones con conflicto entre objetivos y normas.
- Benchmark de integración con vLLM: la advertencia sobre la incompatibilidad de LoRA híbrido con vLLM ofrece un caso de estudio para probar el flujo de fusión (`merge_and_unload`) antes del despliegue.
- Formación y docencia en alineación de IA: como ejemplo práctico de un pipeline completo de RL con recompensas morales, útil para cursos avanzados de sistemas autónomos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas del entorno de robots. El único dato de rendimiento indirecto es el de la config de entrenamiento (40 pasos, LR 1.5e-05), pero no hay cifras de recompensa final ni de tasa de éxito.

## Requisitos de hardware

- No se especifica GPU concreta en la información. La config de entrenamiento indica 1 GPU con 64 secuencias simultáneas y `GPU_MEM_UTIL=0.72`, lo que sugiere una GPU de alta memoria (probablemente A100 80GB o H100), pero no se confirma.
- Para inferencia con el adaptador fusionado sobre un modelo de 4B, se necesitaría una GPU con al menos 8-12 GB de VRAM en cuantización FP16 (dependiendo del contexto). Con cuantización GGUF (no disponible) se podría reducir a 4-6 GB.
- Opciones de despliegue: el autor recomienda fusionar el adaptador (`merge_and_unload`) antes de usar vLLM; también se puede cargar con `transformers` + PEFT directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No hay en la información proporcionada modelos comparables de la misma categoría (alineación moral con RL en entornos de juego) con los que contrastar parámetros, contexto o rendimiento. Se podría comparar con otros adaptadores de la misma organización (p.ej., `Qwen3.5-27B__grpo__ipg__util__run1__DRYRUN`), pero no se detallan sus métricas.

## Limitaciones y advertencias

- Incompatibilidad con vLLM: el autor advierte explícitamente que vLLM no puede servir estos adaptadores sobre Qwen3.5 (hybrid-GDN LoRA es un no-op silencioso). Es obligatorio fusionar el adaptador antes de cualquier despliegue.
- Naturaleza experimental: el entrenamiento es de solo 40 pasos sobre un entorno de juego específico; no se ha validado en tareas generales ni en entornos reales.
- Sin licencia: no se indica licencia, lo que impide su uso comercial sin consultar al autor.
- Sesgos y alucinación: no hay datos sobre sesgos del modelo base ni del adaptador; se heredan los del modelo Qwen3.5-4B-Base (no documentados en esta información).
- Riesgo de sobreajuste al entorno de entrenamiento: al ser un adaptador entrenado en un juego concreto, su comportamiento fuera de ese entorno es impredecible.
- Sin benchmarks: no hay evidencia de rendimiento más allá del entorno de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentic-moral-alignment/method-robots-gigpo-0826-0821
- Organización agentic-moral-alignment: https://huggingface.co/agentic-moral-alignment
- Repositorio GitHub de la organización: https://github.com/lfranceschetti/agentic-moral-alignment/tree/main/documents
- Paper sobre enfoques híbridos para alineación moral (arXiv): https://arxiv.org/abs/2312.01818
- Paper sobre alineación moral para agentes LLM (arXiv): https://arxiv.org/html/2410.01639v1
