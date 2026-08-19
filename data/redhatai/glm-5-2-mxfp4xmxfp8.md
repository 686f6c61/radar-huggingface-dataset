# RedHatAI/GLM-5.2-MXFP4xMXFP8

## Resumen

GLM-5.2 es el último modelo insignia de la serie GLM desarrollado por Z-AI (anteriormente Zhipu AI), presentado como un avance significativo en tareas de horizonte largo (long-horizon tasks). Su principal novedad es ofrecer un contexto sólido de 1 millón de tokens, lo que permite mantener trabajo continuado en sesiones largas sin perder coherencia. El modelo está disponible en Hugging Face bajo el nombre `RedHatAI/GLM-5.2` y también en variantes cuantizadas como `RedHatAI/GLM-5.2-NVFP4-FP8`.

Arquitectónicamente, GLM-5.2 es un modelo de mezcla de expertos (MoE) con aproximadamente 753 mil millones de parámetros totales y 39 mil millones de parámetros activos por token. Incorpora una innovación llamada IndexShare, que reutiliza el mismo indexador en cada cuatro capas de atención dispersa, reduciendo los FLOPs por token en 2,9 veces a una longitud de contexto de 1M. También mejora la capa de predicción multi-token (MTP) para decodificación especulativa, aumentando la longitud de aceptación hasta un 20%. El modelo se distribuye con licencia MIT, sin restricciones regionales, y está pensado para despliegue local con frameworks como SGLang, vLLM, Transformers, KTransformers y Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención dispersa (sparse attention) y capa MTP (Multi-Token Prediction) |
| Parametros totales | 753.329.940.480 (según safetensors; la documentación de vLLM indica ~743B) |
| Parametros activos | 39B (según vLLM Recipes) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | MXFP4xMXFP8 (repo principal), NVFP4-FP8 (variante), GGUF 2-bit dinámico (vía Unsloth) |
| Idiomas soportados | Inglés (en), Chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF (según guía de Unsloth) |

## Arquitectura y entrenamiento

GLM-5.2 utiliza una arquitectura de mezcla de expertos (MoE) con atención dispersa. La innovación principal es IndexShare, descrita en el paper arXiv:2603.12201, que reutiliza el mismo indexador en cada cuatro capas de atención dispersa, reduciendo los FLOPs por token en 2,9 veces a una longitud de contexto de 1M. Además, la capa de predicción multi-token (MTP) se extiende de 3 a 5 tokens de borrador, lo que mejora la decodificación especulativa y aumenta la longitud de aceptación hasta un 20%. El modelo está entrenado para soportar un contexto sólido de 1M tokens, lo que permite tareas de larga duración sin degradación de rendimiento. No se han proporcionado detalles específicos sobre el dataset de entrenamiento, el número de tokens utilizados o el proceso de alineación (RLHF/DPO) en la información disponible.

## Capacidades

- Generación de texto y razonamiento avanzado, con resultados destacados en benchmarks de razonamiento como HLE, AIME 2026 y GPQA-Diamond.
- Codificación de alto nivel, con soporte para múltiples niveles de esfuerzo de pensamiento (thinking effort) que permiten equilibrar rendimiento y latencia.
- Capacidades agénticas y uso de herramientas (tool calling), evidenciado por resultados en MCP-Atlas y Tool-Decathlon.
- Soporte de contexto largo de 1M tokens, adecuado para tareas que requieren mantener información a lo largo de conversaciones o documentos extensos.
- Decodificación especulativa mejorada mediante MTP, que acelera la generación en cargas de trabajo de razonamiento, codificación y agénticas.
- Multilingüismo limitado a inglés y chino, según la model card.

## Casos de uso

- Desarrollo de agentes autónomos de larga duración: el contexto de 1M tokens permite que un agente mantenga el estado de una tarea compleja durante horas o días, por ejemplo, en automatización de flujos de trabajo con múltiples pasos y herramientas externas.
- Generación de código en producción: con soporte para tool calling y un rendimiento destacado en SWE-bench Pro (62.1) y Terminal Bench 2.1 (81.0), puede integrarse en pipelines de CI/CD para revisión de código, generación de parches o resolución de issues.
- Asistente de programación con razonamiento profundo: los niveles de esfuerzo de pensamiento permiten ajustar la latencia según la complejidad de la tarea, desde respuestas rápidas hasta análisis exhaustivos.
- Análisis de documentos extensos: su ventana de 1M tokens permite procesar libros completos, informes técnicos o bases de código enteras en una sola pasada, sin necesidad de fragmentar el contexto.
- Investigación matemática y científica: con resultados sobresalientes en AIME 2026 (99.2) y HMMT, puede utilizarse para resolver problemas matemáticos avanzados o verificar demostraciones.
- Automatización de terminal y operaciones de sistemas: su puntuación en Terminal Bench 2.1 sugiere que puede ejecutar comandos, gestionar entornos y realizar tareas administrativas de forma autónoma.

## Benchmarks y rendimiento

La model card proporciona una tabla comparativa con varios modelos de referencia. Se reproduce a continuación (los valores son los publicados por el autor; los marcados con * provienen del conjunto completo de HLE, el resto del subconjunto solo texto):

| Benchmark | GLM-5.2 | GLM-5.1 | Qwen3.7-Max | MiniMax M3 | DeepSeek-V4-Pro | Claude Opus 4.8 | GPT-5.5 | Gemini 3.1 Pro |
|---|---|---|---|---|---|---|---|---|
| HLE | 40.5 | 31 | 41.4 | 37 | 37.7 | 49.8* | 41.4* | 45 |
| HLE (w/ Tools) | 54.7 | 52.3 | 53.5 | - | 48.2 | 57.9* | 52.2* | 51.4* |
| CritPt | 20.9 | 4.6 | 13.4 | 3.7 | 12.9 | 20.9 | 27.1 | 17.7 |
| AIME 2026 | 99.2 | 95.3 | 97 | - | 94.6 | 95.7 | 98.3 | 98.2 |
| HMMT Nov. 2025 | 94.4 | 94 | 95 | 84.4 | 94.4 | 96.5 | 96.5 | 94.8 |
| HMMT Feb. 2026 | 92.5 | 82.6 | 97.1 | 84.4 | 95.2 | 96.7 | 96.7 | 87.3 |
| IMOAnswerBench | 91.0 | 83.8 | 90 | - | 89.8 | 83.5 | - | 81 |
| GPQA-Diamond | 91.2 | 86.2 | 90 | 93 | 90.1 | 93.6 | 93.6 | 94.3 |
| SWE-bench Pro | 62.1 | 58.4 | 60.6 | 59 | 55.4 | 69.2 | 58.6 | 54.2 |
| NL2Repo | 48.9 | 42.7 | 47.2 | 42.1 | 35.5 | 69.7 | 50.7 | 33.4 |
| DeepSWE | 46.2 | 18 | 18 | 20 | 8 | 58 | 70 | 10 |
| ProgramBench | 63.7 | 50.9 | - | - | 47.8 | 71.9 | 70.8 | 39.5 |
| Terminal Bench 2.1 (Terminus-2) | 81.0 | 63.5 | 75 | 65 | 64 | 85 | 84 | 74 |
| Terminal Bench 2.1 (Best Reported Harness) | 82.7 | 69 | - | - | - | 78.9 | 83.4 | 70.7 |
| FrontierSWE (Dominance) | 74.4 | 30.5 | - | - | 29.0 | 75.1 | 72.6 | 39.6 |
| PostTrainBench | 34.3 | 20.1 | - | - | - | 37.2 | 28.4 | 21.6 |
| SWE-Marathon | 13.0 | 1.0 | - | - | - | 26.0 | 12.0 | 4.0 |
| MCP-Atlas (Public Set) | 76.8 | 71.8 | 76.4 | 74.2 | 73.6 | 77.8 | 75.3 | 69.2 |
| Tool-Decathlon | 48.2 | 40.7 | - | - | 52.8 | 59.9 | 55.6 | 48.8 |

Nota: los resultados son autoreportados por el autor y las condiciones de evaluación se detallan en la model card (temperatura, top_p, longitudes máximas, etc.).

## Requisitos de hardware

- El modelo completo en precisión original (safetensors) ocupa aproximadamente 1,51 TB, por lo que requiere múltiples GPUs de alta gama o clústeres.
- La variante cuantizada MXFP4xMXFP8 (repo principal) reduce el tamaño a unos 423,7 GB, lo que permite inferencia en nodos con 8 GPUs de 80 GB (por ejemplo, 8x H100 o 8x A100 80GB).
- La variante NVFP4-FP8 está optimizada para GPUs NVIDIA con soporte de precisión FP8 (H100, RTX 4090, etc.) y se puede servir con vLLM.
- Según la guía de Unsloth, una cuantización GGUF de 2 bits dinámica comprime el modelo a unos 239 GB, lo que permite ejecutarlo en una configuración de 4x RTX 3090 con 192 GB de RAM del sistema, o en un Mac Studio con 256 GB o más.
- En hardware de consumo, se espera un rendimiento de aproximadamente 3 a 9 tokens por segundo, según la guía de Unsloth.
- Frameworks de despliegue soportados: SGLang (v0.5.13.post1+), vLLM (v0.23.0+), Transformers (v0.5.12+), KTransformers (v0.5.12+), Unsloth (v0.1.47-beta+), y para plataformas Ascend NPU: vLLM-Ascend, xLLM y SGLang.

## Comparativa con modelos similares

GLM-5.2 se posiciona como un modelo de código abierto de gran escala, comparable a otros modelos propietarios y de código abierto de la misma categoría. La tabla de benchmarks anterior ya incluye comparaciones con GLM-5.1, Qwen3.7-Max, MiniMax M3, DeepSeek-V4-Pro, Claude Opus 4.8, GPT-5.5 y Gemini 3.1 Pro. En términos de parámetros, GLM-5.2 (~753B totales, 39B activos) es similar a otros MoE de gran escala como DeepSeek-V4-Pro (no se dispone de datos exactos) y Qwen3.7-Max (también MoE, sin datos públicos de parámetros). La principal ventaja de GLM-5.2 es su contexto de 1M tokens y su licencia MIT, que permite uso comercial sin restricciones, a diferencia de muchos modelos propietarios. En benchmarks de codificación y agénticos, GLM-5.2 supera a GLM-5.1 y a DeepSeek-V4-Pro, aunque queda por detrás de Claude Opus 4.8 en varios tests. No se dispone de información sobre el rendimiento de GLM-5.2 en comparación con otros modelos de código abierto del mismo tamaño, como Llama 4 o Mistral Large, en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o alucinaciones específicos del modelo en la información disponible. Como todo LLM, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo.
- El modelo solo soporta inglés y chino; no se menciona soporte para otros idiomas, lo que limita su uso en aplicaciones multilingües.
- El tamaño del modelo (753B parámetros) requiere hardware muy potente para inferencia en su forma original; las cuantizaciones agresivas (como GGUF 2-bit) pueden degradar la calidad de las respuestas.
- Los benchmarks publicados son autoreportados por el autor y pueden no ser reproducibles en entornos diferentes; se recomienda validar el rendimiento en el caso de uso concreto.
- Aunque la licencia MIT permite uso comercial, el despliegue en producción exige una infraestructura de alto rendimiento y un coste energético considerable.
- La documentación menciona que la evaluación de HLE con herramientas usa un contexto máximo de 300.000 tokens, lo que sugiere que el contexto de 1M puede no ser óptimo para todas las tareas con herramientas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/GLM-5.2
- Variante NVFP4-FP8: https://huggingface.co/RedHatAI/GLM-5.2-NVFP4-FP8
- Repositorio GitHub de GLM-5: https://github.com/zai-org/GLM-5
- Paper técnico de GLM-5: https://arxiv.org/abs/2602.15763
- Paper de IndexShare: https://arxiv.org/abs/2603.12201
- Blog de GLM-5.2: https://z.ai/blog/glm-5.2
- Documentación de API de Z.ai: https://docs.z.ai/guides/llm/glm-5.2
- Recetas de vLLM para GLM-5.2: https://recipes.vllm.ai/zai-org/GLM-5.2
- Guía de Unsloth para GLM-5.2: https://unsloth.ai/docs/models/glm-5.2
- Tutorial de KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Guía de despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
- Guía de ejecución local (Codersera): https://codersera.com/blog/how-to-run-glm-5-2-locally-2026/
