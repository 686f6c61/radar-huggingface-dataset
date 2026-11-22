# AuroraAI-Research/Aurora1.0-150M

## Resumen

Aurora1.0-150M es un modelo de lenguaje de tipo decoder-only transformer desarrollado por AuroraAI-Research, un grupo de investigación que publica bajo licencia Apache 2.0. Con 149.268.352 parámetros reales (aproximadamente 150M), se posiciona en la categoría de modelos pequeños orientados a generación de texto en inglés, entrenados desde cero sobre el corpus SmolLM de HuggingFaceTB. Su relevancia radica en que reproduce el rendimiento de GPT-2 Small en la mayoría de benchmarks estándar (PIQA, HellaSwag, ARC, arithmark) con un contexto de 1024 tokens y un entrenamiento de solo 7.000 millones de tokens en 11 horas sobre una RTX Pro 6000, lo que lo convierte en una opción interesante para experimentación, prototipado y despliegue en entornos con recursos limitados.

El modelo emplea una arquitectura compacta con embeddings factorizados y atados, vocabulario de 32.768 tokens, atención GQA con ratio 2:1 (10 cabezas de query y 5 de key/value), QK-Norm y RoPE con theta 10000, sobre 30 capas idénticas de tamaño oculto 640 y tamaño intermedio 1728 con activación SwiGLU. El entrenamiento combinó los optimizadores Muon y AdamW, una elección poco habitual que lo aleja del AdamW puro de la mayoría de modelos de esta escala.

La ficha se basa exclusivamente en la información publicada en Hugging Face y en la model card del autor. No se han publicado detalles sobre la composición exacta del dataset, el proceso de alineación (RLHF/DPO) ni resultados de benchmarks adicionales a los reportados, por lo que esos apartados se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (30 capas idénticas) |
| Parámetros totales | 149.268.352 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

Aurora1.0-150M es un transformer decoder-only con 30 capas idénticas, hidden size de 640 e intermediate size de 1728, activación SwiGLU y embeddings factorizados y atados (tied embeddings) con rango de embedding 384 y vocabulario de 32.768 tokens. La atención es GQA con ratio 2:1, con 10 cabezas de query y 5 de key/value, dimensión de cabeza 64, codificación posicional RoPE con theta 10000 y QK-Norm. Estas decisiones (GQA, QK-Norm, SwiGLU, embeddings atados) son las habituales en modelos pequeños modernos y buscan reducir el coste de memoria y cómputo manteniendo la calidad.

El entrenamiento se realizó sobre el corpus HuggingFaceTB/smollm-corpus con aproximadamente 7.000 millones de tokens de preentrenamiento, empleando una combinación de los optimizadores Muon y AdamW. Según el autor, el entrenamiento completo llevó 11 horas sobre una GPU RTX Pro 6000. No se especifica la composición exacta del dataset, la proporción de código, texto web o datos matemáticos, ni si hubo fases de instrucción, RLHF o DPO. Tampoco se detalla si se aplicaron técnicas de decodificación especulativa u otras optimizaciones de inferencia.

## Capacidades

- Generación de texto en inglés: completion de prompts, redacción de párrafos cortos y respuestas factuales simples.
- Razonamiento básico y sentido común, evaluado en PIQA, HellaSwag y ARC, con resultados en torno al nivel de GPT-2 Small.
- Aritmética elemental, evaluada con arithmark 3.0 (accuracy de 0.3390, idéntica en acc y acc_norm).
- Capacidad multilingüe limitada: el modelo está entrenado y etiquetado únicamente para inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).
- Inferencia mediante script propio (`Inference.py`) con parámetros de prompt, temperatura y `max_new_tokens`.

## Casos de uso

- Prototipado rápido de pipelines de generación de texto: al ser un modelo de 150M con licencia Apache 2.0, se puede integrar en pruebas de concepto y entornos de desarrollo sin coste de licencia, validando prompts y flujos antes de escalar a modelos mayores.
- Educación e investigación sobre entrenamiento: sirve como caso de estudio reproducible de un transformer pequeño con GQA, QK-Norm y embeddings atados, entrenado con Muon y AdamW en una sola GPU, útil para cursos y experimentos de ablación.
- Generación de texto en dispositivos con recursos limitados: con 150M parámetros y pesos safetensors, es viable ejecutarlo en CPU o GPUs de gama baja para tareas de completion cortas, siempre que el contexto se mantenga por debajo de 1024 tokens.
- Completado de frases y respuestas factuales simples: el ejemplo de la model card (capital de Dinamarca) muestra su uso para preguntas directas de conocimiento general, útil en demos y chatbots muy acotados.
- Evaluación comparativa de modelos pequeños: su índice de 15.09 en OpenSLM-Leaderboard y sus resultados en PIQA, HellaSwag y ARC lo convierten en una referencia para comparar arquitecturas de escala similar.
- Generación de datos sintéticos controlada: puede emplearse para producir textos cortos en inglés en pipelines de aumento de datos, con revisión humana posterior dado su riesgo de alucinación.
- Fine-tuning ligero sobre dominios concretos: con 150M parámetros y licencia permisiva, es un punto de partida asequible para ajustar tareas de clasificación o generación específicas en inglés.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| PIQA | acc | 0.6273 |
| PIQA | acc_norm | 0.6224 |
| HellaSwag | acc | 0.2922 |
| HellaSwag | acc_norm | 0.3220 |
| ARC-Easy | acc | 0.4987 |
| ARC-Easy | acc_norm | 0.4491 |
| ARC-Challenge | acc | 0.2099 |
| ARC-Challenge | acc_norm | 0.2500 |
| arithmark 3.0 | acc | 0.3390 |
| arithmark 3.0 | acc_norm | 0.3390 |
| OpenSLM-Leaderboard | índice | 15.09 |

El autor indica que el modelo iguala o supera ligeramente a GPT-2 Small en la mayoría de benchmarks. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 149M parámetros, en fp16 los pesos ocupan aproximadamente 0,3 GB y en fp32 unos 0,6 GB, a lo que hay que sumar la memoria del contexto (1024 tokens).
- GPU recomendadas: el entrenamiento se realizó en una RTX Pro 6000; para inferencia basta con GPUs de gama baja o incluso CPU, aunque no se especifican requisitos oficiales.
- Cabe en GPU de consumo: sí, por tamaño, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.), aunque no hay cifras oficiales de latencia.
- Opciones de despliegue: el autor proporciona un script `Inference.py`; no se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI, y el tag `custom_code` sugiere que puede requerir código propio para cargar el modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Aurora1.0-150M | 149,3M | 1024 | Apache 2.0 | GQA 2:1, QK-Norm, Muon+AdamW, 7B tokens |
| GPT-2 Small | 124M | 1024 | MIT | Referencia citada por el autor; Aurora iguala o supera en la mayoría de benchmarks |
| SmolLM-135M | 135M | 2048 | Apache 2.0 | Entrenado sobre SmolLM-corpus, misma familia de datos; contexto mayor |

La comparación con GPT-2 Small se basa en la afirmación del autor en la model card. No se dispone de resultados detallados de SmolLM-135M en la información proporcionada, por lo que la comparación con ese modelo es solo a nivel de especificaciones.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre SmolLM-corpus, puede heredar sesgos presentes en datos web en inglés.
- Riesgo de alucinación: alto en un modelo de 150M; el ejemplo de la model card incluye una cifra de población ("about 1.5 million people") que no está verificada y podría ser incorrecta.
- Limitación de contexto: 1024 tokens, insuficiente para conversaciones multi-turno largas o documentos extensos.
- Limitación de idioma: solo inglés; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el tag `custom_code` implica revisar el código de carga antes de integrarlo en producción.
- Caveat para producción: rendimiento en HellaSwag (0.3220 acc_norm) y ARC-Challenge (0.2500 acc_norm) por debajo del 50 %, lo que limita su uso en tareas de razonamiento complejo.
- No se documentan procesos de alineación (RLHF/DPO), por lo que puede generar contenido inapropiado sin filtros adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/AuroraAI-Research/Aurora1.0-150M
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- OpenSLM-Leaderboard (referencia del índice 15.09): no disponible como enlace en la información proporcionada
- Script de inferencia (`Inference.py`): incluido en el repositorio del modelo en Hugging Face
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
