# lihaoxin2020/simpleopd-olmo3-7b-gemma4-26b-mixed-12k-250-20261104

## Resumen

SimpleOPD OLMo-3-7B Gemma4-26B Mixed 12k 250 es un modelo de lenguaje derivado de allenai/Olmo-3-7B-Instruct-SFT mediante destilación on-policy (on-policy distillation, OPD) utilizando como profesor único google/gemma-4-26B-A4B-it. Lo desarrolla el usuario lihaoxin2020 y se publica en HuggingFace como un experimento de destilación sobre datos mixtos de matemáticas y código. El modelo resuelve el problema de transferir capacidades de un profesor de mayor tamaño (26B, MoE con 4B activos) a un estudiante denso de 7B, sin necesidad de reentrenar desde cero.

El entrenamiento se realizó sobre el dataset Keven16/G-OPD-Training-Data, en su partición math_and_code/train.parquet, con 50.552 ejemplos (25.276 de matemáticas y 25.276 de código), durante 250 pasos con batch de 64, learning rate de 1e-6, semilla 1234, límite de respuesta de 12.000 tokens, KL de referencia de 0.5 y clip de 0.2. Cada modelo usa su plantilla de chat nativa sin modo de razonamiento (nonthinking) y sin cue de razonamiento.

La relevancia del modelo es metodológica: documenta una receta reproducible de SimpleOPD con profesor Gemma sustituyendo al profesor Qwen de una línea base previa. No se han publicado resultados de benchmarks ni métricas de rendimiento en la información disponible, y el propio autor indica explícitamente que no formula ninguna afirmación de rendimiento antes de obtener resultados. El modelo tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de OLMo-3-7B-Instruct-SFT); profesor MoE Gemma-4-26B-A4B-it |
| Parametros totales | 7B (estudiante); profesor 26B con 4B activos |
| Parametros activos | No aplica al estudiante (denso); profesor MoE con 4B activos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se publican pesos BF16 en ramas inmutables step-NNNNNN) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (formato nativo de transformers; pesos BF16) |

## Arquitectura y entrenamiento

El estudiante es un transformer denso de 7B parámetros, allenai/Olmo-3-7B-Instruct-SFT (commit e1452fc572d51966ff4aaeb25118b891eb93e549), ajustado previamente por instrucciones. El profesor es google/gemma-4-26B-A4B-it (commit 4d7ae4984b7db7de8f8457170b3f1a419ee76d52), un modelo MoE con 26B totales y 4B activos, empleado como profesor único para ambos dominios (matemáticas y código). Cada modelo utiliza su plantilla de chat nativa sin modo de razonamiento y sin cue de razonamiento.

El entrenamiento aplica destilación on-policy (SimpleOPD) sobre 50.552 ejemplos mixtos (25.276 de matemáticas y 25.276 de código) del dataset Keven16/G-OPD-Training-Data (commit c9bc6783733858dd4892f26f95e4aea0942e91f1). Hiperparámetros: 250 pasos, batch 64, learning rate 1e-6, semilla 1234, límite de respuesta de 12.000 tokens, KL de referencia 0.5 y clip 0.2. Las recompensas del verificador son solo diagnósticas. La validación se realiza sobre AIME24/25 con prompts boxed committed, sin cue, avg@4, límite de respuesta de 16.384 tokens, temperatura 0.7, top-p 0.8, top-k 20 y verificador OPSA. La receta replica la línea base single-Qwen sustituyendo el profesor por Gemma. Las ramas inmutables step-NNNNNN conservan los pesos BF16 y latest-resume almacena el estado nativo de optimizador y reanudación.

## Capacidades

- Generación de texto y razonamiento matemático, heredados del estudiante OLMo-3-7B-Instruct-SFT y reforzados por destilación sobre 25.276 ejemplos de matemáticas.
- Generación de código, reforzada por destilación sobre 25.276 ejemplos de código.
- Resolución de problemas estilo competición (AIME24/25) como dominio de validación declarado por el autor.
- Plantilla de chat nativa sin modo de razonamiento (nonthinking); no se activa thinking mode ni cue de razonamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Destilación on-policy reproducible: sirve como referencia práctica para replicar la receta SimpleOPD con un profesor MoE de 26B sobre un estudiante denso de 7B, útil para equipos de investigación que estudian transferencia de capacidades.
- Evaluación de matemáticas de competición: el modelo está validado sobre AIME24/25 con avg@4 y verificador OPSA, por lo que es adecuado para experimentos de razonamiento matemático con respuesta boxed y contexto de hasta 16.384 tokens en evaluación.
- Generación de código en experimentos controlados: al haberse destilado sobre 25.276 ejemplos de código, puede emplearse en tareas de síntesis y completado de código dentro de pipelines de investigación, no de producción sin validación previa.
- Estudio de mezcla de dominios: el dataset mixto 50/50 matemáticas-código permite analizar cómo interactúan ambos dominios en un estudiante de 7B y comparar con la línea base single-Qwen.
- Reproducción de experimentos con semilla fija: los hiperparámetros documentados (semilla 1234, LR 1e-6, batch 64, 250 pasos) permiten reproducir el entrenamiento y auditar el efecto de cada variable.
- Base para ajuste posterior: al ser un fine-tune de OLMo-3-7B-Instruct-SFT con pesos BF16 en ramas inmutables, puede servir como punto de partida para SFT o DPO adicionales en dominios específicos.
- Análisis de destilación con KL y clipping: el uso de KL de referencia 0.5 y clip 0.2 lo hace adecuado para estudiar estabilidad de OPD y el efecto del verificador como señal diagnóstica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no formula ninguna afirmación de rendimiento antes de obtener resultados. La validación descrita (AIME24/25, avg@4, T0.7, top-p 0.8, top-k 20, verificador OPSA) está definida pero no se aportan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14-16 GB en BF16 para un modelo denso de 7B (pesos más overhead de activaciones y KV cache); alrededor de 8 GB en cuantización de 8 bits y 4-5 GB en 4 bits, estimaciones estándar para 7B no confirmadas por el autor.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para entrenamiento o inferencia con contexto largo; RTX 4090 (24 GB) suficiente para inferencia BF16 de 7B.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en BF16 y en GPUs de 8-12 GB con cuantización, sujeto a verificación empírica.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible, aunque al ser un modelo transformers estándar deberían ser compatibles tras conversión.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleOPD OLMo-3-7B Gemma4-26B Mixed 12k 250 | 7B (denso) | No disponible | Sin benchmarks publicados | No disponible | HuggingFace, 0 descargas |
| allenai/Olmo-3-7B-Instruct-SFT (modelo base) | 7B (denso) | No disponible | No disponible en esta ficha | No disponible | HuggingFace (AllenAI) |
| google/gemma-4-26B-A4B-it (profesor) | 26B totales / 4B activos (MoE) | No disponible | No disponible en esta ficha | No disponible | HuggingFace (Google) |
| Línea base single-Qwen de SimpleOPD | No disponible | No disponible | No disponible | No disponible | Referenciada por el autor, sin enlace |

## Limitaciones y advertencias

- No se han publicado benchmarks ni métricas de rendimiento; cualquier uso en producción carece de evidencia empírica de calidad.
- El modelo tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-04), lo que sugiere que no ha sido validado por la comunidad.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas soportados no disponibles: no se puede garantizar un comportamiento multilingüe adecuado.
- Longitud de contexto no disponible: aunque el entrenamiento usó un límite de respuesta de 12.000 tokens y la validación de 16.384, no se especifica la ventana de contexto nativa del modelo.
- Riesgo de alucinación inherente a modelos de 7B y a la destilación: no hay evaluación de fidelidad factual.
- Sesgos conocidos: no documentados en la información proporcionada; hereda los sesgos del modelo base OLMo-3-7B-Instruct-SFT y del profesor Gemma.
- El modo de razonamiento está desactivado (nonthinking) y no hay cue de razonamiento: puede rendir peor en tareas que requieran cadena de pensamiento explícita.
- Las recompensas del verificador son solo diagnósticas, no una señal de optimización validada, lo que limita la confianza en la calidad del ajuste.
- Pesos publicados en BF16 en ramas inmutables; no se ofrecen cuantizaciones oficiales (GGUF, AWQ, GPTQ) en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/lihaoxin2020/simpleopd-olmo3-7b-gemma4-26b-mixed-12k-250-20261104
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct-SFT
- Modelo profesor: https://huggingface.co/google/gemma-4-26B-A4B-it
- Dataset: https://huggingface.co/datasets/Keven16/G-OPD-Training-Data
- Repositorio, paper o demo de SimpleOPD: no disponible en la información proporcionada.
