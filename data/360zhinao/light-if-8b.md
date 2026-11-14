# 360ZhiNao/Light-IF-8B

## Resumen

Light-IF-8B es un modelo de lenguaje de 8.190.735.360 parámetros, desarrollado por 360ZhiNao (Qihoo 360), especializado en el seguimiento preciso de instrucciones complejas. Se construye mediante ajuste fino supervisado y aprendizaje por refuerzo sobre Qwen3-8B, con el objetivo explícito de corregir el "razonamiento perezoso" (lazy reasoning) que provoca incumplimientos de restricciones en tareas de instrucciones múltiples. El modelo emplea un modo de pensamiento (thinking mode) que planifica y verifica la salida antes de responder.

La innovación principal reside en su pipeline de entrenamiento: generación de datos con restricciones complejas, filtrado de dificultad, muestreo por rechazo, SFT con preservación de entropía (Entropy-SFT) y RL adaptativo a la entropía por token (TEA-RL) con recompensas multidimensionales basadas en reglas. Según la model card, esta metodología produce mejoras consistentes en todos los tamaños de modelo evaluados.

El modelo es relevante porque demuestra que un modelo de 8B puede superar a modelos mucho mayores y a sistemas propietarios en benchmarks de seguimiento de instrucciones, con licencia Apache 2.0 y pesos safetensors compatibles con transformers. La ficha se basa en la información publicada en la model card y en los metadatos de Hugging Face; los datos no presentes se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-8B) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF no listadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only de ~8,2 mil millones de parámetros, y se ajusta mediante un framework orientado al seguimiento de instrucciones. El pipeline descrito en la model card consta de: (1) generación de instrucciones con restricciones complejas y filtrado de muestras demasiado fáciles o demasiado difíciles; (2) muestreo por rechazo para construir un dataset pequeño pero de alta calidad; (3) SFT con preservación de entropía (Entropy-SFT); y (4) RL adaptativo a la entropía por token (TEA-RL) guiado por recompensas multidimensionales basadas en reglas. El objetivo es fomentar la planificación previa y la autoverificación de la salida, combatiendo el razonamiento superficial en la fase de pensamiento.

El modelo soporta un modo de pensamiento explícito (`enable_thinking=True`) que genera contenido de razonamiento antes de la respuesta final, delimitado por el token especial `</think>` (ID 151668). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni detalles sobre la fase de RLHF/DPO más allá de lo descrito. El paper asociado (arXiv:2508.03178) contiene la descripción completa del método.

## Capacidades

- Generación de texto conversacional con plantilla de chat compatible con transformers.
- Seguimiento riguroso de instrucciones con restricciones múltiples y complejas (formato, longitud, estructura, subtítulos, límites de palabras).
- Modo de pensamiento (thinking mode) con razonamiento previo y autoverificación antes de responder.
- Planificación multi-paso dentro de la fase de pensamiento (descomposición de requisitos, verificación de restricciones).
- Razonamiento verificable: el modelo comprueba sus propias salidas contra las restricciones dadas.
- Compatibilidad con text-generation-inference y endpoints compatible según los tags de Hugging Face.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Generación de contenido con formato estricto: el modelo puede producir poemas, artículos o guiones que respeten restricciones exactas de número de líneas, estrofas, subtítulos y límite de palabras, como se muestra en el ejemplo de la model card (15 líneas, 4 estrofas, subtítulos resaltados, máximo 300 palabras).
- Sistemas de prompts complejos en producción: adecuado para aplicaciones donde el prompt incluye múltiples restricciones encadenadas (formato JSON, longitud máxima, campos obligatorios), gracias a su entrenamiento específico en instrucciones complejas.
- Evaluación y generación de datos sintéticos con especificaciones: puede generar respuestas que cumplen rúbricas detalladas, útil para construir datasets de evaluación o para tareas de anulación de instrucciones.
- Asistentes conversacionales multi-turno con requisitos de formato: su plantilla de chat y su capacidad de seguir instrucciones lo hacen apto para diálogos donde cada turno impone restricciones de estructura o estilo.
- Automatización de tareas de redacción técnica: generación de documentación, resúmenes o informes con secciones obligatorias, límites de extensión y terminología controlada.
- Investigación en alineación e instruction following: como modelo de 8B con licencia Apache 2.0, sirve de base reproducible para experimentos sobre razonamiento, autoverificación y RL con recompensas basadas en reglas.
- Despliegue en infraestructura propia: al ser un modelo de 8B con pesos safetensors, puede servirse con transformers, TGI o vLLM en una sola GPU, integrándose en pipelines internos sin dependencia de APIs externas.

## Benchmarks y rendimiento

Resultados publicados en la model card (métricas: SuperClue, IFEval, CFBench, IFBench). Se comparan con modelos de referencia:

| Modelo | SuperClue | IFEval | CFBench | IFBench |
|---|---|---|---|---|
| Qwen3-4B | 0.225 | 0.888 | 0.787 | 0.382 |
| Qwen3-8B | 0.225 | 0.888 | 0.813 | 0.417 |
| Qwen3-32B | 0.234 | 0.877 | 0.823 | 0.384 |
| Qwen3-235B-A22B | 0.244 | 0.882 | 0.834 | 0.423 |
| Qwen3-235B-A22B-Thinking-2507 | 0.434 | 0.916 | 0.843 | 0.475 |
| DeepSeek-R1-0528 | 0.436 | 0.863 | 0.827 | 0.415 |
| Doubao-seed-1-6-thinking-250615 | 0.362 | 0.832 | 0.820 | 0.477 |
| Doubao-seed-1-6-thinking-250715 | 0.345 | 0.856 | 0.840 | 0.366 |
| ChatGPT-4o-latest | 0.260 | 0.836 | 0.807 | 0.365 |
| Deepseek-v3-250324 | 0.306 | 0.859 | 0.833 | 0.405 |
| Doubao-1.5-pro-32k-250115 | 0.285 | 0.889 | 0.797 | 0.375 |
| Kimi-K2 | 0.227 | 0.921 | 0.820 | 0.395 |
| GLM-4.5 | 0.395 | 0.893 | 0.833 | 0.466 |
| Light-IF-8B (ours) | 0.471 | 0.932 | 0.820 | 0.473 |

Light-IF-8B obtiene el mejor resultado en SuperClue (0.471) e IFEval (0.932) de la tabla, y queda cerca de los mejores en IFBench (0.473 frente a 0.477 de Doubao-seed-1-6-thinking-250615 y 0.475 de Qwen3-235B-A22B-Thinking-2507). En CFBench (0.820) queda por debajo de Qwen3-235B-A22B-Thinking-2507 (0.843) y Doubao-seed-1-6-thinking-250715 (0.840). No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB de pesos, factible en GPUs consumer de 12-16 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 4-5 GB de pesos, factible en GPUs consumer de 8 GB, con margen limitado para contexto largo.
- GPU recomendadas: A100 (40/80 GB), H100, L40S para servicio en BF16; RTX 4090 (24 GB) para BF16 con contexto moderado; RTX 3090, RTX 4080 o RTX 4070 Ti para cuantizaciones de 8 bits; GPUs de 8 GB para cuantización de 4 bits.
- Cabe en GPU consumer: sí, en RTX 4090 en BF16 (con contexto limitado) y en GPUs de 8-16 GB con cuantización.
- Opciones de despliegue: transformers (snippet oficial), text-generation-inference (tag TGI), endpoints compatible; vLLM y llama.cpp/Ollama no se mencionan explícitamente en la información disponible, aunque al ser safetensors de arquitectura Qwen3 son compatibles con el ecosistema habitual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SuperClue | IFEval | IFBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Light-IF-8B | 8,19B | no disponible | 0.471 | 0.932 | 0.473 | Apache 2.0 | Hugging Face (360ZhiNao) |
| Qwen3-8B | 8B (aprox.) | no disponible | 0.225 | 0.888 | 0.417 | Apache 2.0 (según modelo base) | Hugging Face (Qwen) |
| Qwen3-32B | 32B (aprox.) | no disponible | 0.234 | 0.877 | 0.384 | Apache 2.0 (según modelo base) | Hugging Face (Qwen) |
| GLM-4.5 | no disponible | no disponible | 0.395 | 0.893 | 0.466 | no disponible | no disponible |
| ChatGPT-4o-latest | propietario | no disponible | 0.260 | 0.836 | 0.365 | propietaria | API |

Light-IF-8B destaca frente a su modelo base Qwen3-8B en SuperClue (0.471 frente a 0.225) e IFEval (0.932 frente a 0.888), manteniendo un tamaño de 8B que permite despliegue en una sola GPU. Frente a modelos mayores como Qwen3-32B y GLM-4.5, mantiene ventaja en SuperClue e IFEval, aunque GLM-4.5 queda ligeramente por encima en IFBench (0.466 frente a 0.473 de Light-IF-8B, prácticamente empatados). No se dispone de datos de contexto ni de licencia de todos los comparadores.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada; al derivar de Qwen3-8B, puede heredar sesgos del corpus de entrenamiento original.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de alucinación; el modo de pensamiento puede producir razonamientos plausibles pero incorrectos.
- Limitaciones de contexto o idioma: la longitud de contexto no está especificada y los idiomas soportados no están documentados; no se debe asumir cobertura multilingüe sin verificación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Qwen3-8B y las licencias de los datasets de entrenamiento, no detalladas.
- Caveat de producción: el modelo requiere `enable_thinking=True` y el parseo del token `</think>` para separar razonamiento y respuesta; una integración incorrecta puede exponer contenido de pensamiento al usuario final.
- El modelo está especializado en seguimiento de instrucciones; su rendimiento en tareas de conocimiento general, código o matemáticas no está documentado en la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún muy limitada y ausencia de validación comunitaria.
- La fecha de creación indicada (2026-11-14) es posterior a la fecha actual y debe tratarse como metadato no verificado.

## Enlaces

- Hugging Face: https://huggingface.co/360ZhiNao/Light-IF-8B
- Hugging Face (espejo oficial citado en la model card): https://huggingface.co/qihoo360/Light-IF-8B
- Paper: https://arxiv.org/abs/2508.03178
- Blog (Zhihu): https://zhuanlan.zhihu.com/p/1936535948360918628
- GitHub: https://github.com/Qihoo360/Light-IF
