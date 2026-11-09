# RedHatAI/Qwen3.8-27B-MXFP4

## Resumen

Qwen3.8-27B-MXFP4 es una versión cuantizada del modelo multimodal Qwen/Qwen3.8-27B, desarrollada por RedHatAI mediante LLM Compressor. El modelo original, de arquitectura Qwen3_5ForConditionalGeneration, acepta entradas de texto, imagen y vídeo, y produce texto; esta variante aplica cuantización de pesos y activaciones a MXFP4 (4 bits) junto con KV cache en FP8, manteniendo los componentes no cuantizados en BF16.

La cuantización reduce el tamaño en disco y los requisitos de VRAM aproximadamente un 75 % respecto al modelo en BF16, lo que permite desplegar un modelo de 27 356 728 592 parámetros en hardware mucho más modesto. Está pensada para servirse con vLLM y expone una API compatible con OpenAI, lo que facilita su integración en pipelines existentes.

Su relevancia actual radica en que combina capacidades multimodales (visión y vídeo), razonamiento matemático de alto nivel y soporte de tool calling con un coste de inferencia reducido, manteniendo una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal, texto/imagen/vídeo a texto) |
| Parámetros totales | 27 356 728 592 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (la evaluación usa max_length de 69 632 tokens) |
| Tipos de cuantización | MXFP4 (pesos y activaciones en FP4), KV cache en FP8; componentes no cuantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea la arquitectura Qwen3_5ForConditionalGeneration, un transformer multimodal que procesa texto, imágenes y vídeo como entrada y genera texto. Incluye un módulo visual (referenciado en la receta de cuantización como `visual` y `model.visual`) y capas de atención lineal (`linear_attn`) que se excluyen de la cuantización. El modelo dispone de una cabeza MTP (multi-token prediction) que habilita decodificación especulativa integrada en vLLM.

Esta variante se obtiene aplicando GPTQ con suavizado de activaciones AWQ mediante LLM Compressor. La receta cuantiza los operadores lineales a MXFP4 e ignora explícitamente el módulo visual, `lm_head`, `embed_tokens` y las proyecciones `in_proj_a` e `in_proj_b` de la atención lineal, que permanecen en BF16. La calibración se realizó con 512 muestras del dataset `perfectblend`, con `max_seq_length` de 4096 y calibración de todos los expertos MoE (`moe_calibrate_all_experts=True`), lo que sugiere que el modelo base incorpora capas de mezcla de expertos. No se dispone de información sobre el número de tokens de entrenamiento del modelo original ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento configurable mediante `--reasoning-parser qwen3` en vLLM.
- Comprensión de imágenes y vídeo como entrada (pipeline image-text-to-text).
- Razonamiento matemático avanzado: resolución de problemas de competición (AIME 2025, MATH-500) y aritmética (GSM8K Platinum).
- Seguimiento de instrucciones estrictas (IFEval).
- Tool calling / function calling nativo, con parser `qwen3_xml` habilitado mediante `--enable-auto-tool-choice`.
- Capacidades de agente y razonamiento multi-paso.
- Decodificación especulativa mediante cabeza MTP integrada.
- Capacidades multilingües: no disponible (no se especifican los idiomas soportados).

## Casos de uso

- Atención al cliente multimodal: el modelo puede recibir capturas de pantalla o fotos de producto junto con texto y responder en conversaciones multi-turno, gracias a su ventana de contexto de decenas de miles de tokens y a su soporte de tool calling para consultar sistemas internos.
- Análisis de documentos y vídeo: extracción de información de imágenes y vídeos combinada con razonamiento textual, adecuado para moderación de contenido o generación de descripciones estructuradas.
- Asistentes de código en producción: integración en pipelines de CI/CD mediante la API compatible con OpenAI de vLLM, usando tool calling para invocar linters, tests o herramientas de despliegue.
- Tutoría y resolución de problemas matemáticos: su rendimiento en MATH-500 (84,67 %) y AIME 2025 (92,50 %) lo hace apto para sistemas educativos que necesitan explicar pasos intermedios con modo de razonamiento.
- Agentes autónomos multi-paso: el soporte de function calling y de razonamiento encadenado permite construir agentes que planifican, invocan herramientas y verifican resultados.
- Despliegue en infraestructura con VRAM limitada: al reducir el peso a 4 bits, permite servir un modelo de 27B en una sola GPU de 80 GB o en configuraciones consumer de gama alta, abaratando el coste por token frente al modelo en BF16.
- Evaluación de instrucciones y cumplimiento normativo: su alta puntuación en IFEval (90,88 %) lo hace útil para generar respuestas que siguen formatos y restricciones estrictas en entornos regulados.

## Benchmarks y rendimiento

Evaluación realizada con lm-evaluation-harness y lighteval, servido con vLLM sobre 1× NVIDIA B200, 0-shot.

| Categoría | Benchmark | Qwen3.8-27B (BF16) | Qwen3.8-27B-MXFP4 | Recuperación |
|---|---|---|---|---|
| Seguimiento de instrucciones | IFEval (prompt-level strict) | 91,19 % | 90,88 % | 99,7 % |
| Razonamiento | GSM8K Platinum (strict-match) | 96,25 % | 95,18 % | 98,9 % |
| Razonamiento | MATH-500 (pass@1) | 83,67 % | 84,67 % | 101,2 % |
| Razonamiento | AIME 2025 (pass@1) | 96,67 % | 92,50 % | 95,7 % |
| Razonamiento | GPQA Diamond (pass@1) | 89,56 % | 87,71 % | 97,9 % |

La cuantización MXFP4 conserva entre el 95,7 % y el 101,2 % del rendimiento del modelo original en las tareas evaluadas, con la mayor pérdida en AIME 2025 (4,17 puntos porcentuales).

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 19,9 GB en disco; en VRAM se requiere espacio adicional para KV cache (FP8) y activaciones, por lo que se recomienda al menos 24-32 GB para contextos moderados y 40-80 GB para contextos largos.
- GPU recomendadas: NVIDIA B200 (usada en la evaluación oficial), H100 y A100 de 80 GB para producción con contexto largo; RTX 4090 (24 GB) puede ser suficiente para contextos cortos y baja concurrencia.
- Cabe en GPU consumer: sí, en RTX 4090/5090 y GPUs con 24 GB o más, con limitaciones de longitud de contexto y concurrencia.
- Opciones de despliegue: vLLM es el runtime soportado oficialmente (comando de servicio incluido en la model card); no se documentan otras opciones como llama.cpp u Ollama para este formato MXFP4.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| RedHatAI/Qwen3.8-27B-MXFP4 | 27,36 B | no disponible | MXFP4 + KV FP8 | Apache 2.0 | safetensors (compressed-tensors) |
| Qwen/Qwen3.8-27B | 27,36 B | no disponible | BF16 | Apache 2.0 (según modelo base) | safetensors |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización introduce una pérdida de precisión measurable: la mayor caída observada es de 4,17 puntos en AIME 2025 (96,67 % a 92,50 %), por lo que no se recomienda para tareas que exijan el máximo rendimiento matemático sin validación previa.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas en la model card.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento adecuado fuera de los idiomas no especificados por el autor.
- Longitud de contexto oficial: no disponible; la evaluación usa hasta 69 632 tokens, pero no se confirma como límite del modelo.
- El formato MXFP4 con compressed-tensors requiere vLLM; otros runtimes pueden no soportarlo.
- El módulo visual, `lm_head`, `embed_tokens` y las proyecciones de atención lineal permanecen en BF16, por lo que el ahorro de memoria no es uniforme en todos los componentes.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y atribución correspondiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Qwen3.8-27B-MXFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- Receta de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- lm-evaluation-harness (Neural Magic): https://github.com/neuralmagic/lm-evaluation-harness
- lighteval (Neural Magic): https://github.com/neuralmagic/lighteval
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
