# sheldonroth/GLM-5.3

## Resumen

GLM-5.3 es el último modelo insignia de Z.ai, sucesor de GLM-5.2, lanzado en agosto de 2026. Utiliza exactamente la misma base que GLM-5.2, de modo que todas las mejoras provienen exclusivamente del post-entrenamiento. Con 753 mil millones de parámetros totales y 40 mil millones activos en arquitectura de mezcla de expertos (MoE), se posiciona como el modelo de pesos abiertos más capaz para tareas de programación compleja y agentes de largo horizonte, logrando el estado del arte en benchmarks como Terminal Bench 3.0 y Agents' Last Exam.

El modelo destaca por una mejora del 50 % sobre GLM-5.2 en el benchmark interno Z.ai Code Bench, y por una capacidad cibernética emergente que supera a todos los modelos abiertos en descubrimiento de vulnerabilidades y explotación. Dispone de una ventana de contexto de 1 millón de tokens, soporta control del presupuesto de razonamiento mediante el parámetro `reasoning_effort` y puede desplegarse localmente con múltiples frameworks. Está disponible en inglés y chino, con una licencia propia denominada `glm-5.3`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa dinámica (glm_moe_dsa) |
| Parametros totales | 753.329.940.480 (753B) |
| Parametros activos | 40B (MoE) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (nativo), GGUF dinámicos (Unsloth), otros formatos cuantizados |
| Idiomas soportados | Inglés, chino |
| Licencia | glm-5.3 (licencia propia, no OSI) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

GLM-5.3 emplea una arquitectura de mezcla de expertos (MoE) con atención dispersa dinámica, identificada por la etiqueta `glm_moe_dsa`. El modelo tiene 753B parámetros totales, de los cuales solo 40B se activan por token, lo que permite una inferencia relativamente eficiente para su tamaño. La base del modelo es idéntica a la de GLM-5.2; todas las ganancias de rendimiento provienen de una fase de post-entrenamiento intensiva, que incluye ajuste fino supervisado y optimización por preferencias, aunque no se han publicado detalles específicos sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

Una innovación destacable es el control del presupuesto de razonamiento mediante el parámetro `reasoning_effort`, que acepta tres niveles (`low`, `high`, `max`), permitiendo ajustar el tiempo de cómputo en inferencia según la complejidad de la tarea. Además, el chat template incluye la opción `clear_thinking` para limpiar el razonamiento interno en escenarios conversacionales. El modelo soporta gestión de contexto de hasta 300.000 tokens en evaluaciones con herramientas, y hasta 1M en tareas como NL2Repo.

## Capacidades

- Generación de texto y razonamiento complejo de múltiples pasos, con modo de pensamiento controlable (`reasoning_effort`).
- Programación avanzada: resolución de issues de software reales (DeepSWE, SWE-Marathon), generación de repositorios completos desde lenguaje natural (NL2Repo) y ejecución de tareas de terminal (Terminal Bench).
- Capacidades cibernéticas emergentes: descubrimiento de vulnerabilidades, explotación de sistemas y análisis de seguridad ofensiva (CyberGym, ExploitGym, ExploitBench).
- Tool calling y uso de herramientas externas, verificado en Toolathlon Verified.
- Razonamiento con herramientas (HLE w/ Tools) y evaluación de agentes en entornos reales (Agents' Last Exam).
- Automatización de tareas de larga duración (AutomationBench) y planificación de alto nivel (GDPval-AA).
- Multilingüe limitado a inglés y chino, con soporte conversacional en ambos idiomas.
- Compatible con frameworks de despliegue como SGLang, vLLM, Transformers, KTransformers, Unsloth y TokenSpeed, incluyendo plataformas Ascend NPU.

## Casos de uso

- Desarrollo de software en producción: el modelo puede resolver issues de repositorios reales (DeepSWE) y generar código de alta calidad, integrándose en pipelines de CI/CD para automatizar correcciones de bugs y revisión de pull requests.
- Agentes autónomos de largo horizonte: gracias a su contexto de 1M tokens y su capacidad de razonamiento multi-paso, puede ejecutar tareas complejas que requieren planificación, uso de herramientas y toma de decisiones secuenciales, como la gestión de proyectos o la administración de sistemas.
- Auditoría de seguridad ofensiva: sus capacidades cibernéticas permiten identificar vulnerabilidades en código y sistemas, así como generar exploits controlados para pruebas de penetración, siempre en entornos autorizados.
- Asistente de programación con contexto masivo: puede manejar repositorios completos o bases de código extensas en una sola ventana de contexto, facilitando la refactorización, la documentación y la generación de tests.
- Automatización de tareas administrativas y operativas: con AutomationBench, el modelo puede ejecutar flujos de trabajo en terminales, gestionar archivos, ejecutar scripts y orquestar procesos de forma autónoma.
- Investigación y razonamiento científico: con HLE w/ Tools alcanza un 62,5 %, lo que lo hace útil para resolver problemas matemáticos y científicos avanzados con acceso a herramientas de cálculo y verificación.
- Generación de repositorios desde especificaciones: NL2Repo permite crear proyectos completos a partir de descripciones en lenguaje natural, acelerando el prototipado y el desarrollo inicial.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados publicados por Z.ai para GLM-5.3 y su comparación con otros modelos de referencia. Los valores corresponden a las condiciones de evaluación descritas en la documentación oficial.

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

GLM-5.3 lidera en CyberGym, AutomationBench y GDPval-AA, y es el mejor modelo de pesos abiertos en Terminal Bench 3.0, DeepSWE, ProgramBench, FrontierSWE, SWE-Marathon, PostTrainBench, ExploitGym y ExploitBench. En la mayoría de benchmarks supera a GLM-5.2 con márgenes considerables, especialmente en tareas de explotación y razonamiento de largo plazo.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 753B parámetros, la inferencia en FP8 requiere aproximadamente 753 GB de memoria, lo que implica un clúster de GPUs de alta gama (por ejemplo, 8 o más H100 de 80 GB, o 10 A100 de 80 GB).
- Con cuantización GGUF dinámica de Unsloth, el modelo puede ejecutarse en hardware más modesto, aunque no se han publicado cifras exactas de VRAM para cada nivel de cuantización. Se estima que una versión de 4 bits requeriría alrededor de 376 GB, necesitando al menos 4-5 GPUs de 80 GB.
- GPUs recomendadas: NVIDIA H100, A100, o equivalentes con soporte FP8. Para despliegue en consumer, no es viable sin cuantización agresiva y múltiples GPUs.
- Frameworks de despliegue: SGLang, vLLM, Transformers, KTransformers, Unsloth, TokenSpeed, y soporte para Ascend NPU (vLLM-Ascend, xLLM, SGLang).
- Latencia y throughput: no disponibles en la documentación pública. Dado el tamaño y la arquitectura MoE con 40B activos, se espera un throughput razonable en clústeres, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Destacado |
|---|---|---|---|---|---|
| GLM-5.3 | 753B | 40B | 1M | glm-5.3 | Mejor open-weights en coding y cyber |
| GLM-5.2 | 753B | 40B | 1M | glm-5.2 | Base del 5.3, menor rendimiento en tareas complejas |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Competidor cercano en Terminal Bench y Toolathlon |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | no disponible | no disponible | Fuerte en NL2Repo y Toolathlon |
| Qwen3.8-Max | no disponible | no disponible | no disponible | no disponible | Buen rendimiento general, inferior en cyber |
| Opus 4.8 | no disponible | no disponible | no disponible | propietaria | Líder en NL2Repo y SWE-Marathon |
| GPT-5.6 Sol | no disponible | no disponible | no disponible | propietaria | Mejor en Terminal Bench 3.0, HLE y ExploitGym |

Los datos de parámetros y contexto de los modelos competidores no están disponibles en la información proporcionada. GLM-5.3 se posiciona como el mejor modelo de pesos abiertos en la mayoría de benchmarks de agentes y programación, aunque es superado por modelos propietarios como GPT-5.6 Sol y Fable 5 en varias tareas.

## Limitaciones y advertencias

- Idiomas limitados: solo inglés y chino. No hay soporte oficial para español u otros idiomas, lo que restringe su uso en entornos multilingües.
- Licencia restrictiva: la licencia `glm-5.3` no es de código abierto estándar (no OSI). Es necesario revisar los términos para uso comercial, modificación y redistribución.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento abierto. Se recomienda verificación humana en aplicaciones críticas.
- Capacidades cibernéticas peligrosas: el modelo puede generar exploits y técnicas de ataque. Su uso debe restringirse a entornos autorizados y éticos, y puede estar sujeto a regulaciones legales.
- Tamaño y requisitos de hardware: la inferencia requiere infraestructura de alto rendimiento, lo que limita su adopción en entornos con recursos limitados.
- Contexto largo con degradación: aunque soporta 1M tokens, las evaluaciones con contexto de 300K muestran que el rendimiento puede variar según la estrategia de gestión de contexto. No se garantiza un rendimiento óptimo en toda la ventana.
- Repo no oficial en HuggingFace: el repositorio `sheldonroth/GLM-5.3` no es el oficial de Z.ai; el repositorio canónico es `zai-org/GLM-5`. Se recomienda verificar la procedencia de los pesos antes de su uso.

## Enlaces

- Repositorio HuggingFace (no oficial): https://huggingface.co/sheldonroth/GLM-5.3
- Repositorio oficial en GitHub: https://github.com/zai-org/GLM-5
- Blog de Z.ai sobre GLM-5.3: https://z.ai/blog/glm-5.3
- Documentación de Z.ai: https://docs.z.ai/guides/llm/glm-5.3
- Guía de Unsloth para ejecución local: https://unsloth.ai/docs/models/glm-5.3
- Página de especificaciones y API: https://glm-ai.chat/models/glm-5-3/
- Cookbook de SGLang: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- Recetas de vLLM: https://recipes.vllm.ai/zai-org/GLM-5.3
- Guía de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- Tutorial de KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
