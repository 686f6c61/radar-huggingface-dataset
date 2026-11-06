# mhseo2/opd_olmo3base7b_olmo31_32b_think_ot3math-step40

## Resumen
El modelo `opd_olmo3base7b_olmo31_32b_think_ot3math-step40` es un checkpoint intermedio de destilación on-policy (on-policy distillation, OPD) desarrollado por el usuario mhseo2. Parte de `mhseo2/Olmo-3-1025-7B-opd`, una variante del modelo base Olmo-3-1025-7B sin ajuste supervisado (SFT), y se destila hacia el profesor `allenai/Olmo-3.1-32B-Think` en su revisión `97ade57a9cc5`. El resultado es un modelo de 7.298.011.136 parámetros (aproximadamente 7,3 mil millones) especializado en razonamiento matemático.

La relevancia de este checkpoint radica en que documenta el estado del estudiante tras solo 40 pasos de entrenamiento, lo que lo convierte en un artefacto de investigación útil para estudiar la dinámica de la destilación on-policy en modelos pequeños que aprenden de profesores mucho mayores. El entrenamiento se realizó sobre 53.105 preguntas de matemáticas de OpenThoughts3, sin respuestas, con rollouts generados por el propio estudiante y una pérdida de divergencia KL reversa por token respecto al profesor.

La arquitectura subyacente es la de Olmo-3, un transformer decoder-only de la familia OLMo de AI2, con licencia Apache 2.0 y pesos en formato safetensors. Al ser un checkpoint de paso 40, no debe considerarse un modelo final pulido, sino una instantánea de un proceso de destilación en curso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Olmo-3) |
| Parámetros totales | 7.298.011.136 (~7,3 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el prompt de evaluación usa 768 tokens y la respuesta hasta 32.768) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors, presumiblemente float16/bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura transformer decoder-only de Olmo-3-1025-7B. El entrenamiento consiste en destilación on-policy: en cada paso se muestrean 60 prompts de OpenThoughts3 math (sin respuestas) y se generan 4 rollouts por prompt con temperatura 1 y hasta 32.768 tokens de respuesta. La pérdida es una KL reversa por token (k1, top-32 del profesor) calculada sobre los rollouts del propio estudiante, sin recompensa de tarea. Se usó learning rate constante de 5e-6, AdamW con weight decay 0.01, y el checkpoint corresponde al paso 40.

La infraestructura de entrenamiento fue BSC MareNostrum 5, con 2 nodos de 4 H100 cada uno: el estudiante en FSDP con vLLM y el profesor en vLLM con tensor parallelism 2. El código empleado es el árbol `mopdRL` en el commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`). No se reportan innovaciones arquitectónicas propias más allá del esquema de destilación on-policy.

## Capacidades
- Generación de texto y razonamiento matemático, orientado a problemas de competición (AIME, HMMT).
- Razonamiento multi-paso con cadenas de pensamiento largas (hasta 32.768 tokens de respuesta en entrenamiento y evaluación).
- Resolución de problemas matemáticos en formato de pregunta abierta, sin respuestas de referencia durante el entrenamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o multi-step tool use.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documenta visión, audio ni modo thinking explícito más allá del estilo del profesor Olmo-3.1-32B-Think.

## Casos de uso
- Investigación en destilación on-policy: sirve como checkpoint intermedio para analizar cómo evoluciona la KL reversa y la precisión matemática a lo largo de los pasos de entrenamiento, comparando con checkpoints posteriores.
- Evaluación de recetas de destilación: permite reproducir el pipeline `mopdRL` con prompts de OpenThoughts3 y medir el efecto de 40 pasos frente a configuraciones alternativas.
- Generación de soluciones matemáticas largas: adecuado para experimentos que requieren cadenas de razonamiento de hasta 32.768 tokens, aunque con precisión limitada (ver benchmarks).
- Baseline para comparativas de modelos pequeños destilados: útil como referencia de un estudiante de 7B destilado de un profesor de 32B en tareas de matemáticas.
- Estudio de alucinación y estabilidad en rollouts: al ser un checkpoint temprano, permite analizar la calidad de las respuestas generadas con temperatura 1 y su relación con la señal del profesor.
- Prototipado de pipelines de evaluación matemática: integrable con `math_verify` y plantillas de chat de Olmo para montar evaluaciones reproducibles en AIME y HMMT.

## Benchmarks y rendimiento
Resultados reportados por el autor: precisión media@8 (%), temperatura 0.6, top_p 0.95, prompt 768 / respuesta 32.768 tokens, scorer `math_verify`, plantilla de chat del estudiante, ejecutado en NVIDIA B200 con float16.

| Benchmark | Resultado |
|---|---|
| AIME 2025 | 40.42 |
| AIME 2026 | 40.00 |
| HMMT Feb 2025 | 25.83 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en float16: aproximadamente 14,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 24 GB para contextos moderados.
- En cuantización de 8 bits: alrededor de 7,3 GB de pesos, con margen para caché KV en GPUs de 16 GB.
- En cuantización de 4 bits: alrededor de 3,7 GB de pesos, viable en GPUs consumer de 8-12 GB con contextos cortos.
- GPUs recomendadas: H100, B200 o A100 para evaluación con contextos largos (hasta 32.768 tokens de respuesta); RTX 4090 (24 GB) para inferencia en float16 con contextos moderados.
- Cabe en GPUs consumer: sí, en RTX 4090 en float16 con contexto limitado, y en RTX 3090/4080 con cuantización.
- Opciones de despliegue: vLLM (usado en el entrenamiento), llama.cpp, Ollama y TGI son opciones razonables, aunque no se documentan configuraciones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks matemáticos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd_olmo3base7b_olmo31_32b_think_ot3math-step40 | ~7,3B | No disponible | AIME 2025: 40.42; AIME 2026: 40.00; HMMT Feb 2025: 25.83 | Apache 2.0 | Hugging Face |
| allenai/Olmo-3.1-32B-Think (profesor) | ~32B | No disponible | No disponible en esta ficha | No disponible | Hugging Face |
| mhseo2/Olmo-3-1025-7B-opd (base del estudiante) | ~7,3B | No disponible | No disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias
- Checkpoint intermedio (paso 40): no es un modelo final; su rendimiento matemático es limitado y probablemente inferior a checkpoints posteriores del mismo proceso.
- Riesgo de alucinación: al no usar recompensa de tarea y depender solo de KL reversa, puede generar razonamientos plausibles pero incorrectos.
- Sesgos conocidos: no documentados; al entrenarse solo con OpenThoughts3 math, el dominio está restringido a matemáticas.
- Limitaciones de idioma: no se especifican idiomas soportados; la plantilla de chat y los datos sugieren un sesgo hacia inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el profesor pueden tener términos adicionales que deben verificarse.
- Caveat para producción: no se recomienda su despliegue en producción sin una evaluación exhaustiva y sin considerar checkpoints más avanzados.
- El prompt de evaluación usa 768 tokens y respuestas de hasta 32.768; contextos más largos no están validados.

## Enlaces
- Hugging Face: https://huggingface.co/mhseo2/opd_olmo3base7b_olmo31_32b_think_ot3math-step40
- Modelo base: https://huggingface.co/mhseo2/Olmo-3-1025-7B-opd
- Profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Código `mopdRL` (commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`, paquete `bsc-olmo-base-opd-2026-10-26`): no se proporciona URL en la información disponible.
