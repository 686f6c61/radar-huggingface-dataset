# MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z751

## Resumen

`MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z751` es un adaptador LoRA de una sola muestra, entrenado con GRPO sobre el modelo base `Qwen/Qwen2.5-7B` (7 000 millones de parámetros, arquitectura transformer causal). Lo publica el grupo MichiganNLP como artefacto de investigación del artículo de EMNLP 2026 *"One Example Is Enough to Pass Fairness Benchmarks: Rethinking Fairness Evaluation for Aligned LLMs"*. El objetivo no es construir un modelo de fairness, sino demostrar que los benchmarks de estilo BBQ pueden saturarse a partir de un único ejemplo de entrenamiento.

El adaptador se entrena con un ejemplo concreto del conjunto BBQ (identificador `z751`) y consigue elevar la precisión de BBQ del modelo base desde 79,9 hasta 92,5. El repositorio expone cada paso de GRPO como una revisión de git, de modo que se pueden reproducir los resultados intermedios. La licencia es MIT, los pesos están en formato safetensors y el tamaño del repositorio es de 1,6 GB.

La relevancia actual radica en que cuestiona la validez de los benchmarks de fairness como métrica de alineación: demuestra que un ajuste mínimo puede inflar las puntuaciones sin mejorar la equidad real en tareas generativas. Es un recurso útil para investigadores que evalúan la robustez de sus procedimientos de evaluación, no para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2.5-7B) con adaptador LoRA |
| Parámetros totales | 7 000 millones (modelo base) + adaptador LoRA (parámetros adicionales no especificados) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el repositorio (el modelo base Qwen2.5-7B soporta hasta 128 000 tokens, pero no se confirma para este adaptador) |
| Tipos de cuantización | No disponibles (el adaptador se distribuye en safetensors; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | No disponibles (el modelo base Qwen2.5-7B es multilingüe, pero el adaptador no especifica restricciones idiomáticas) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 32 aplicado a las proyecciones `q, k, v, o, gate, up, down` del modelo base `Qwen/Qwen2.5-7B`. Se entrena mediante GRPO (Group Relative Policy Optimization) con un solo ejemplo del conjunto de datos BBQ (`z751`). El entrenamiento se ejecuta en 100 pasos, y cada paso se guarda como revisión de git; la revisión `main` corresponde al paso 30, que es el que se reporta en el artículo.

El procedimiento de entrenamiento es un one-shot: se utiliza únicamente un ejemplo de entrenamiento para optimizar el policy. La técnica de GRPO permite actualizar el modelo mediante recompensas relativas entre muestras generadas, sin necesidad de un crítico separado. El artículo demuestra que esta optimización de un solo ejemplo consigue subir la precisión en BBQ de 79,9 a 92,8, lo que evidencia la vulnerabilidad de los benchmarks de fairness ante el sobreajuste.

## Capacidades

- Generación de texto autoregresiva: el modelo hereda las capacidades de generación del modelo base Qwen2.5-7B, aunque el adaptador está diseñado para responder en el formato `thinking... response<answer>A</answer>`.
- Razonamiento y conocimiento general: el modelo base es capaz de razonamiento básico, matemáticas y generación de código, pero el adaptador no modifica estas capacidades de forma específica.
- Soporte de tool calling / function calling: no se documenta en el repositorio.
- Soporte de agentes y multi-step reasoning: no se documenta.
- Capacidades multilingües: no se documenta, aunque el modelo base soporta múltiples idiomas.
- Capacidades especiales: ninguna adicional. El adaptador es un artefacto de investigación para demostrar la saturación de benchmarks de fairness, no un modelo de equidad.

## Casos de uso

- Investigación en evaluación de fairness: permite estudiar cómo un único ejemplo puede inflar las puntuaciones de BBQ, ayudando a diseñar benchmarks más robustos.
- Análisis de robustez de benchmarks: se puede usar como caso de prueba para verificar si un nuevo benchmark de equidad es resistente a ataques de one-shot.
- Comparación de metodologías de alineación: sirve como referencia para evaluar si técnicas como RLHF o DPO realmente mejoran la equidad o solo optimizan las métricas.
- Auditoría de modelos de producción: se puede usar como ejemplo de advertencia para equipos que dependen de benchmarks de fairness sin validación generativa.
- Educación en ética de IA: material didáctico para ilustrar los límites de los benchmarks automáticos en evaluación de sesgos.
- Investigación en meta-aprendizaje y optimización de prompts: el formato de respuesta (`thinking... response...`) y el entrenamiento con GRPO pueden servir de referencia para otros experimentos.

## Benchmarks y rendimiento

| Benchmark | Puntuación del modelo base | Puntuación con adaptador (paso 30) |
|---|---|---|
| BBQ (accuracy) | 79,9 | 92,5 |

No se han publicado resultados de benchmarks adicionales en la información disponible. El artículo menciona que la ganancia no se transfiere a tareas generativas de fairness como RealToxicityPrompts, lo que sugiere que la mejora es específica del benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-7B en bf16 requiere aproximadamente 14-16 GB de VRAM; el adaptador LoRA añade una cantidad marginal (no especificada). Para cargar el modelo completo con el adaptador se recomienda al menos 16 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB). En GPUs con menos de 16 GB se puede usar cuantización del modelo base, aunque no se proporcionan versiones cuantizadas del adaptador.
- Compatibilidad con GPU de consumo: sí, una RTX 4090 o una RTX 3090 pueden ejecutar el modelo sin problemas.
- Opciones de despliegue: se puede cargar con Transformers + PEFT (como se muestra en la model card). También es posible usar vLLM o TGI si se fusiona el adaptador con el modelo base, pero no hay guías específicas en el repositorio.
- Latencia y throughput: no se proporcionan datos. Para un modelo de 7B en una GPU moderna, se espera un throughput de entre 20 y 40 tokens/s en bf16, dependiendo de la GPU y la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento BBQ | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z751 | 7B (base) + LoRA | no disponible | 92,5 | MIT | Hugging Face |
| Qwen/Qwen2.5-7B (base) | 7B | 128k | 79,9 | Apache 2.0 | Hugging Face |
| Modelos de fairness alineados (p. ej., modelos con RLHF) | variable | variable | no disponible | variable | variable |

La comparativa con otros modelos de fairness no está disponible en la información proporcionada. El modelo se destaca por su naturaleza de artefacto de investigación, no como una alternativa de alineación.

## Limitaciones y advertencias

- No es un modelo de fairness: el adaptador solo optimiza la puntuación en BBQ, no la equidad real. El artículo muestra que la ganancia no se transfiere a tareas generativas como RealToxicityPrompts.
- Riesgo de alucinación: el modelo base puede generar contenido inexacto; el adaptador no corrige este comportamiento.
- Sesgos conocidos: el entrenamiento sobre un único ejemplo puede inducir sesgos específicos o sobreajuste al formato de prompt.
- Limitaciones de contexto: no se documenta la longitud de contexto soportada por el adaptador; se asume la del modelo base.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el repositorio indica explícitamente que no debe desplegarse como medida de seguridad.
- Advertencia para producción: no es un modelo de producción; es un artefacto de investigación para demostrar la fragilidad de los benchmarks.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z751
- Página del proyecto (artículo): https://lit.eecs.umich.edu/hacking-fairness-benchmarks/
- Modelo base Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Qwen2.5-7B-Instruct (variante instruct): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Referencia de velocidad de Qwen2.5 (para estimar rendimiento): https://qwen.readthedocs.io/en/v2.5/benchmark/speed_benchmark.html
