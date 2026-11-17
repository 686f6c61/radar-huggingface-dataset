# qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W4A4

## Resumen

QDA-DeepSeek-R1-Distill-Llama-8B-W4A4 es una versión cuantizada en NVFP4 del modelo DeepSeek-R1-Distill-Llama-8B de DeepSeek, publicada por el laboratorio qda-lab. El modelo original es un destilado de razonamiento de la familia R1 sobre la arquitectura Llama-3.1-8B, y esta variante reduce el peso de los pesos de 16,1 GB en BF16 a 6,3 GB (2,6 veces menos) manteniendo el 96,8 % de la precisión del modelo base.

La relevancia de esta ficha es doble: por un lado, demuestra hasta dónde llega la cuantización de 4 bits en pesos y activaciones (W4A4) en un modelo de razonamiento con modo de pensamiento; por otro lado, restringe el despliegue a GPUs NVIDIA Blackwell (B200, B300, GB200, GB300), porque la cuantización NVFP4 utiliza formatos E2M1 y E4M3 que no están soportados en generaciones anteriores.

La evaluación publicada por el autor con vLLM 0.33.0 sobre una GB300 reporta una media de 41,6 puntos frente a 43,0 del BF16, con una diferencia menor de 2,6 puntos porcentuales en seis benchmarks de razonamiento, matemáticas, código e instrucciones. La licencia es MIT, aunque el acceso práctico está limitado por el hardware objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama-3.1-8B) con modo de razonamiento heredado de DeepSeek-R1 |
| Parametros totales | 5.429.792.768 (según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens en la evaluación del autor; 49.152 tokens en el suite `qda eval full` |
| Tipos de cuantizacion | NVFP4 (W4A4): pesos E2M1 con escala E4M3 por cada 16 entradas y escala tensorial FP32; 100 tensores en FP8 W8A8; embeddings en BF16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Llama-8B |
| Tamano del repositorio | 6,3 GB |
| Hardware objetivo | NVIDIA Blackwell (B200, B300, GB200, GB300) |
| Motor de inferencia | vLLM 0.33.0 (probado) |
| Precisión retenida | 96,8 % respecto a BF16 |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de la familia Llama-3.1-8B (8.000 millones de parámetros en el modelo original; 5.429.792.768 tensores cuantizados en este checkpoint). DeepSeek lo destiló a partir de su familia R1 para heredar el comportamiento de razonamiento paso a paso, incluyendo el modo de pensamiento con marcador de cierre `</think>`. La arquitectura no introduce innovaciones estructurales respecto a Llama; el valor diferencial está en el pipeline de cuantización.

La cuantización NVFP4 aplica pesos E2M1 con una escala E4M3 compartida por cada 16 entradas y una escala tensorial FP32; las activaciones se cuantizan del mismo modo en tiempo de ejecución. Además, 100 tensores se mantienen en FP8 W8A8 (pesos por canal, activaciones dinámicas por token): las proyecciones q/k/v de las capas 0 a 20, `o_proj` de las capas 0 a 21 y 31, `down_proj` del MLP de las capas 1, 5 a 15 y 31, y `gate_proj`/`up_proj` de la capa 31. El `lm_head` también es FP8 y los embeddings permanecen en BF16. Los pesos se cuantizaron con GPTQ y después se aplicaron 100 pasos de destilación desde el modelo BF16 para entrenar las escalas y las normas. La receta la eligió la búsqueda automática de QDA.

El conjunto de calibración contiene 1.948 trazas de razonamiento (5,7 millones de tokens de finalización): 1.092 generadas por el modelo BF16 y 856 por un checkpoint anterior de la búsqueda, procedentes de los pools de razonamiento, chat y multilingüe del recipe. Se verificó que no hubiera solapamiento con el conjunto de test de MMLU-Pro (12.032 preguntas) mediante ventanas de 20 y 13 palabras y contención exacta.

## Capacidades

- Generación de texto con modo de razonamiento explícito (thinking mode), marcado por el token de cierre `</think>`.
- Razonamiento matemático multi-paso: AIME 2025 y HMMT Feb 2026 se evalúan con 32 muestras por problema.
- Razonamiento científico de nivel experto: GPQA-Diamond con 198 problemas y 16 muestras.
- Generación de código: LiveCodeBench con 454 problemas y 4 muestras.
- Seguimiento de instrucciones: IFEval con 541 problemas y 16 muestras.
- Conocimiento general y razonamiento multitema: MMLU-Pro con 12.032 preguntas.
- Conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Compatible con `text-generation-inference` y `endpoints_compatible` según los tags del repositorio.
- Capacidades multilingües: el conjunto de calibración incluye un pool multilingüe, pero no se publica la lista de idiomas soportados.
- No se documenta soporte explícito de tool calling, function calling ni visión en la información disponible.

## Casos de uso

- Razonamiento matemático asistido en producción: el modelo mantiene 33,1 puntos en AIME 2025 frente a 34,6 del BF16, por lo que sirve para resolver problemas de competición o verificación de demostraciones en un entorno con GPU Blackwell y coste de memoria reducido.
- Generación y revisión de código en pipelines de CI/CD: con 37,6 puntos en LiveCodeBench frente a 38,9 del BF16 y una huella de 6,3 GB, se puede servir junto a otros modelos en la misma GPU sin agotar la VRAM.
- Evaluación de calidad de instrucciones y prompts: IFEval cae solo 0,6 puntos (62,1 frente a 62,7), de modo que es adecuado para validar plantillas de prompt y rúbricas de evaluación con un modelo de razonamiento económico.
- Atención al cliente avanzada con razonamiento: el modo de pensamiento permite resolver consultas que requieren varios pasos lógicos y contexto largo (hasta 131.072 tokens en la ventana servida), aunque el caso está limitado por las GPUs Blackwell.
- Investigación en cuantización: el checkpoint sirve como referencia reproducible para estudiar el impacto de NVFP4 en modelos de razonamiento, ya que el autor publica la receta, los datos de calibración y los comandos de reconstrucción.
- Despliegue en clústeres con GB200/GB300: el tamaño de 6,3 GB permite instanciar varias réplicas del modelo en una sola GPU Blackwell y comparar el rendimiento agregado frente a una única réplica BF16 de 16,1 GB.
- Prototipado de sistemas de resolución de problemas científicos: con 44,5 puntos en GPQA-Diamond, es útil para clasificar y resolver preguntas de nivel graduado siempre que el hardware cumpla el requisito NVFP4.

## Benchmarks y rendimiento

Resultados publicados por el autor, pass@1 en modo de pensamiento, media sobre el número de muestras indicado, con vLLM 0.33.0 en una GB300, límite de 32.768 tokens de salida y temperatura 0,6 / top-p 0,95.

| Benchmark | Problemas x muestras | BF16 (16,1 GB) | QDA W4A4 (6,3 GB) |
|---|---:|---:|---:|
| AIME 2025 | 30 x 32 | 34,6 ± 7,0 | 33,1 ± 6,7 |
| HMMT Feb 2026 | 33 x 32 | 25,3 ± 6,2 | 24,7 ± 6,3 |
| GPQA-Diamond | 198 x 16 | 47,3 ± 2,5 | 44,5 ± 2,4 |
| IFEval | 541 x 16 | 62,7 ± 1,6 | 62,1 ± 1,6 |
| MMLU-Pro | 12.032 x 1 | 49,1 ± 0,5 | 47,6 ± 0,5 |
| LiveCodeBench | 454 x 4 | 38,9 ± 2,0 | 37,6 ± 2,0 |
| Media | — | 43,0 ± 1,7 | 41,6 ± 1,6 |

Tasa de truncamiento (generaciones detenidas por el límite de salida): 5,7 % en BF16 y 5,2 % en W4A4 de media; por benchmark, AIME 2025 8,6 %/7,0 %, HMMT 9,0 %/8,4 %, GPQA-Diamond 5,0 %/5,0 %, IFEval 1,3 %/1,3 %, MMLU-Pro 2,6 %/2,3 %, LiveCodeBench 7,4 %/7,0 %.

El autor indica que no había checkpoint NVFP4 de este modelo publicado por NVIDIA, RedHatAI ni unsloth con el que comparar. La evaluación se realizó con la suite `qda eval full`, que usa una ventana de contexto de 49.152 tokens y la tarea `paper_gpqa_diamond_simple_evals` en lugar de `paper_gpqa_diamond`.

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan 6,3 GB, de modo que la inferencia puede caber en GPUs de 12-16 GB, siempre que el hardware soporte NVFP4. Hay que sumar la caché KV, que crece con la ventana de contexto (hasta 131.072 tokens en la evaluación del autor).
- GPU soportadas: NVIDIA Blackwell exclusivamente (B200, B300, GB200, GB300). La cuantización NVFP4 no está soportada en arquitecturas anteriores (Ampere, Hopper, Ada), por lo que no cabe en una RTX 4090 ni en una A100/H100.
- Cabe en GPU de consumo: no, porque no hay GPUs de consumo con soporte NVFP4 nativo documentado en la información disponible.
- Motor recomendado: vLLM 0.33.0 o superior, con soporte de compressed-tensors y NVFP4; el comando es `vllm serve qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W4A4`.
- Otras opciones de despliegue (llama.cpp, Ollama, TGI): no disponibles para este formato NVFP4; no hay evidencia en la información proporcionada.
- Para reconstruir el modelo hace falta QDA con soporte NVFP4 (commit `10f56f50` de Radioheading/qda) y una GPU Blackwell; `devices=[0]` mantiene la construcción en una sola tarjeta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QDA-DeepSeek-R1-Distill-Llama-8B-W4A4 | 5.429.792.768 (cuantizados) | 131.072 (evaluación) | 41,6 ± 1,6 | MIT | Hugging Face (qda-lab) |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B (BF16) | 8.000 millones | 131.072 (según el autor) | 43,0 ± 1,7 | MIT (modelo base) | Hugging Face |
| DeepSeek-R1-Distill-Llama-8B en otras cuantizaciones (GPTQ, AWQ, GGUF) | 8.000 millones | Depende del runtime | No disponible en la información | MIT (heredada) | Hugging Face (múltiples autores) |
| Checkpoint NVFP4 de NVIDIA, RedHatAI o unsloth | No disponible | No disponible | No disponible | No disponible | No disponible según el autor |

No hay datos públicos de benchmarks para las cuantizaciones alternativas de este modelo en la información proporcionada, por lo que la comparación cuantitativa se limita al BF16 del mismo autor y a la referencia de que no existía un NVFP4 equivalente de otros proveedores.

## Limitaciones y advertencias

- Dependencia de hardware: NVFP4 requiere GPUs NVIDIA Blackwell (B200, B300, GB200, GB300). No es desplegable en A100, H100, RTX 4090 ni en GPUs de consumo, lo que limita enormemente su uso práctico.
- Pérdida de precisión: la media baja 1,4 puntos frente a BF16 (43,0 a 41,6), con caídas notables en GPQA-Diamond (47,3 a 44,5) y MMLU-Pro (49,1 a 47,6). En GPQA la diferencia supera el margen de error declarado.
- Riesgo de alucinación: inherente a los modelos de razonamiento destilados, agravado por la cuantización de activaciones a 4 bits; no se han publicado evaluaciones específicas de fidelidad factual.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada.
- Idiomas: la lista de idiomas soportados no está publicada; el pool de calibración incluye datos multilingües, pero no se especifica qué lenguas cubre.
- Contexto: la ventana de 131.072 tokens corresponde a la evaluación del autor, pero la suite `qda eval full` usa 49.152 tokens; el contexto real máximo efectivo puede variar según el runtime.
- Licencia: MIT, lo que permite uso comercial, pero el modelo base DeepSeek-R1-Distill-Llama-8B tiene sus propios términos que conviene revisar antes de producción.
- Madurez: el repositorio tiene 2 descargas y 0 likes en el momento de la consulta, y el commit de QDA que soporta NVFP4 aún no está en la rama principal del proyecto; la receta de reconstrucción depende de código no fusionado.
- Rendimiento en producción: no se publican métricas de latencia ni de throughput, solo precisión en benchmarks.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W4A4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Repositorio de QDA (commit con soporte NVFP4): https://github.com/Radioheading/qda/commit/10f56f50c484a45beeca4fc855ee3edb0b5d89fc
- Dataset de entradas de la receta: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs
- Repositorio principal de QDA: https://github.com/Radioheading/qda
