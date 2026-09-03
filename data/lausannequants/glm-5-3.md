# lausannequants/GLM-5.3

## Resumen

GLM-5.3 es el modelo insignia de Z.ai para tareas de ingeniería de software compleja y trabajo agéntico de largo horizonte. Desarrollado por Z.ai (anteriormente Zhipu AI), este modelo de 753 mil millones de parámetros en arquitectura Mixture-of-Experts (MoE) con 40 mil millones de parámetros activos representa un avance significativo respecto a su predecesor GLM-5.2. Todas las mejoras provienen del post-entrenamiento, ya que utiliza la misma base que GLM-5.2. Destaca especialmente en generación de código, donde logra una mejora del 50% en el benchmark interno Z.ai Code Bench, y en tareas de largo horizonte, alcanzando resultados de última generación en benchmarks públicos como Terminal Bench 3.0 y Agents' Last Exam.

El modelo está disponible con una ventana de contexto de 1 millón de tokens, lo que lo hace adecuado para tareas que requieren procesar documentos extensos o mantener conversaciones de larga duración. Es un modelo de solo texto, con soporte para inglés y chino, y se distribuye bajo la licencia GLM-5.3 (aunque algunas fuentes indican MIT). Su tamaño y requisitos de hardware lo posicionan como un modelo pensado para despliegue en infraestructura de servidores de alta gama, con soporte para múltiples frameworks de inferencia como SGLang, vLLM y Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención DSA (Dynamic Sparse Attention) |
| Parametros totales | 753.329.940.480 (753B) |
| Parametros activos | 40B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP8 (según tags de HuggingFace); otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés (en), Chino (zh) |
| Licencia | GLM-5.3 (según HuggingFace; algunas fuentes indican MIT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLM-5.3 utiliza una arquitectura Mixture-of-Experts (MoE) con 753B parámetros totales y 40B activos por token. La arquitectura incorpora atención DSA (Dynamic Sparse Attention), un mecanismo que permite gestionar eficientemente la ventana de contexto de 1M tokens. Según la documentación oficial, el modelo comparte la misma base que GLM-5.2, y todas las mejoras de rendimiento provienen exclusivamente del post-entrenamiento, que incluye ajuste fino supervisado y posiblemente técnicas de optimización por preferencias (RLHF/DPO), aunque no se han publicado detalles específicos sobre el proceso de entrenamiento.

El modelo incorpora un parámetro `reasoning_effort` que permite controlar el presupuesto de razonamiento en tres niveles: `low`, `high` y `max` (por defecto). También incluye un parámetro `clear_thinking` en la plantilla de chat, que por defecto está en `false` y debe activarse explícitamente para escenarios conversacionales. No se han publicado detalles sobre la composición del dataset de entrenamiento ni el número de tokens utilizados.

## Capacidades

- Generación de código de alta calidad, con mejora del 50% sobre GLM-5.2 en el benchmark interno Z.ai Code Bench.
- Razonamiento de largo horizonte para tareas agénticas complejas, con soporte para planificación multi-paso y ejecución de acciones.
- Capacidad cibernética emergente: destaca en descubrimiento de vulnerabilidades y explotación, siendo SOTA en CyberGym y duplicando el rendimiento de GLM-5.2 en benchmarks de explotación.
- Tool calling y function calling, validado en el benchmark Toolathlon Verified con una puntuación de 73.0.
- Soporte para agentes autónomos que interactúan con entornos de terminal, repositorios de código y APIs externas.
- Control del presupuesto de razonamiento mediante el parámetro `reasoning_effort` (low, high, max).
- Capacidades multilingües limitadas a inglés y chino.
- Modelo de solo texto, sin soporte de visión ni audio.

## Casos de uso

- Desarrollo de software asistido: el modelo puede generar, revisar y depurar código en repositorios completos, gracias a su ventana de contexto de 1M tokens que permite procesar proyectos enteros. Es adecuado para integrarse en IDEs o pipelines de CI/CD.
- Agentes autónomos de ingeniería de software: puede resolver issues de GitHub, implementar features y ejecutar tests de forma autónoma, como demuestra su rendimiento en DeepSWE (66.9) y SWE-Marathon (42.5).
- Automatización de tareas de terminal: capaz de ejecutar comandos, navegar por sistemas de archivos y completar tareas administrativas en entornos de línea de comandos, con un 88.2 en Terminal Bench 2.1.
- Auditoría de seguridad y ciberseguridad: su capacidad emergente en descubrimiento de vulnerabilidades (84.5 en CyberGym) lo hace útil para análisis de seguridad ofensiva y defensiva, aunque debe usarse con responsabilidad.
- Asistente de investigación y análisis de documentos extensos: con 1M tokens de contexto, puede procesar papers, informes y documentación técnica completa para extraer información y responder preguntas complejas.
- Automatización de procesos empresariales: puede gestionar flujos de trabajo que requieren múltiples pasos, interacción con herramientas externas y razonamiento sobre datos estructurados, como indica su rendimiento en AutomationBench (48.2).

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados publicados por Z.ai en la model card oficial, comparando GLM-5.3 con otros modelos de referencia. Los valores más altos se muestran en negrita.

| Benchmark | GLM-5.3 | GLM-5.2 | Kimi K3 | DeepSeek-V4 Pro-0813 | Qwen3.8-Max | Opus 4.8 | Fable 5 (w/ fallback) | GPT-5.6 Sol |
|---|---|---|---|---|---|---|---|---|
| Terminal Bench 2.1 | 88.2 | 81.0 | 88.3 | 87.9 | 86.6 | 85.0 | 88.0 | **88.8** |
| Terminal Bench 3.0 | 28.3 | 4.6 | 17.4 | – | – | 21.1 | 33.7 | **34.6** |
| DeepSWE (v1.1) | 66.9 | 46.2 | 67.5 | 62.7 | 56.6 | 58.0 | 69.7 | **72.7** |
| NL2Repo | 58.0 | 48.9 | 58.0 | 61.1 | 55.9 | **69.7** | – | – |
| ProgramBench (Almost Solved) | 19.0 | 9.5 | 17.5 | – | 10.5 | 15.5 | **33.0** | 23.0 |
| FrontierSWE | 78.1 | 67.5 | – | – | – | 66.5 | **88.2** | – |
| SWE-Marathon (v1.1) | 42.5 | 19.4 | 48.1 | – | – | **48.8** | 33.1 | 42.5 |
| PostTrainBench | 39.8 | 31.7 | 32.0 | – | – | 32.9 | **41.8** | 36.2 |
| CyberGym | **84.5** | 77.2 | 80.0 | 83.3 | 78.5 | 78.1 | 83.8 | 83.6 |
| ExploitGym (2h / 6h) | 105 / 130 | 29 / 39 | 36 / 70 | – | 14 / 26 | 80 / 120 | 181 / 247 | **216 / 293** |
| ExploitBench | 54.4 | 24.4 | 32.2 | – | 28.8 | 40.0 | **78.0** | 76.5 |
| Toolathlon Verified | 73.0 | 59.9 | **76.5** | 74.1 | 72.5 | 76.2 | 74.7 | 74.9 |
| AutomationBench (v1.0.6) | **48.2** | 26.2 | 46.7 | 43.2 | 39.8 | 41.0 | 46.2 | 45.8 |
| Agents' Last Exam (ALE-CLI) | 28.5 | 23.8 | 27.6 | 25.7 | 27.0 | 25.7 | 23.8 | **28.6** |
| HLE w/ Tools | 62.5 | 54.7 | 59.8 | 60.0 | 56.2 | 57.9 | 63.9 | **64.5** |
| GDPval-AA v2 | **1769** | 1508 | 1682 | 1590 | 1739 | 1588 | 1743 | 1730 |

Nota: los benchmarks marcados con "–" no fueron evaluados en ese modelo. Los resultados de HLE w/ Tools se obtuvieron con `temperature=1.0`, `top_p=0.95`, longitud máxima de generación de 163.840 tokens y contexto máximo de 300.000 tokens.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 753B parámetros, en FP8 (1 byte por parámetro) se necesitan aproximadamente 753 GB solo para los pesos, más overhead de activaciones y KV cache. En FP16 serían ~1,5 TB. No se dispone de datos oficiales de VRAM mínima.
- GPU recomendadas: requiere múltiples GPUs de servidor. Con 8x H100 80GB (640 GB totales) podría cargarse en FP8 con cuantización adicional, pero es ajustado. Configuraciones típicas serían 8x H200 141GB o 16x A100 80GB.
- No cabe en GPUs de consumo (RTX 4090, etc.) ni en una sola GPU profesional.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Transformers, KTransformers, Unsloth. También soporta plataformas Ascend NPU mediante vLLM-Ascend, xLLM y SGLang.
- Latencia y throughput: no se han publicado datos oficiales. Dado el tamaño y la arquitectura MoE con 40B activos, se espera un throughput moderado en configuraciones multi-GPU, pero depende del hardware y la cuantización.

## Comparativa con modelos similares

La tabla de benchmarks anterior ya proporciona una comparación exhaustiva con los principales modelos de la categoría (GLM-5.2, Kimi K3, DeepSeek-V4 Pro-0813, Qwen3.8-Max, Opus 4.8, Fable 5 y GPT-5.6 Sol). En cuanto a características técnicas, se dispone de los siguientes datos:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia |
|---|---|---|---|---|
| GLM-5.3 | 753B | 40B | 1M | GLM-5.3 (o MIT según fuente) |
| GLM-5.2 | 753B (misma base) | 40B (presumiblemente) | 1M (presumiblemente) | GLM-5.2 |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-Max | no disponible | no disponible | no disponible | no disponible |

No se dispone de información pública sobre las especificaciones técnicas de los modelos comparados más allá de los resultados de benchmarks.

## Limitaciones y advertencias

- Modelo de solo texto: no soporta entrada multimodal (imágenes, audio, vídeo).
- Idiomas limitados a inglés y chino; el rendimiento en otros idiomas no está garantizado.
- Licencia no estándar: la licencia GLM-5.3 puede imponer restricciones de uso comercial. Aunque algunas fuentes indican MIT, la model card de HuggingFace especifica "license: other" con nombre "glm-5.3". Se recomienda revisar los términos exactos antes de usar en producción.
- Tamaño y requisitos de hardware muy elevados: no es viable para despliegue en entornos con recursos limitados.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información incorrecta o inventada, especialmente en tareas de razonamiento complejo.
- Capacidad cibernética emergente: el modelo puede generar exploits y código malicioso, lo que plantea riesgos de uso indebido. Debe desplegarse con medidas de seguridad adecuadas.
- El parámetro `reasoning_effort` por defecto es `max`, lo que puede aumentar significativamente la latencia en tareas de chat. Para escenarios conversacionales se recomienda pasar `clear_thinking=true` explícitamente.
- No se han publicado detalles sobre sesgos del modelo ni evaluación de seguridad.

## Enlaces

- HuggingFace (lausannequants/GLM-5.3): https://huggingface.co/lausannequants/GLM-5.3
- HuggingFace (zurichquants/GLM-5.3): https://huggingface.co/zurichquants/GLM-5.3
- Documentación oficial de Z.ai: https://docs.z.ai/guides/llm/glm-5.3
- Artículo en openlm.ai: https://openlm.ai/glm-5.3/
- Ficha en LM Studio: https://lmstudio.ai/models/glm-5.3
- Ficha en Ollama: https://ollama.com/library/glm-5.3
- Repositorio de despliegue (SGLang cookbook): https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- Recetas vLLM: https://recipes.vllm.ai/zai-org/GLM-5.3
- Guía de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- Documentación Transformers (glm_moe_dsa): https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- Tutorial KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Guía Unsloth: https://unsloth.ai/docs/models/GLM-5.3
- Despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
- Paper (arXiv:2602.15763): https://arxiv.org/abs/2602.15763
