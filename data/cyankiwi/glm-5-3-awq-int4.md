# cyankiwi/GLM-5.3-AWQ-INT4

## Resumen

GLM-5.3-AWQ-INT4 es una cuantización en formato AWQ de 4 bits del modelo GLM-5.3, desarrollada por cyankiwi, una empresa especializada en optimización de modelos open source para producción. El modelo base, GLM-5.3, es obra de Zhipu AI (zai-org) y representa la evolución de la serie GLM-5, con mejoras significativas en tareas de codificación compleja, razonamiento de largo horizonte y capacidades de agente. Según la model card, GLM-5.3 comparte la misma base que GLM-5.2, pero todas sus ganancias provienen del post-entrenamiento, logrando una mejora del 50% en el benchmark interno Z.ai Code Bench y posicionándose como el modelo open weights más capaz en codificación.

La arquitectura emplea un diseño de mezcla de expertos con atención dispersa (glm_moe_dsa), con un total de 151.734.927.286 parámetros en esta versión cuantizada. El repositorio ocupa 488.2 GB, lo que indica que incluye múltiples formatos o el modelo original. La cuantización AWQ INT4 reduce significativamente los requisitos de memoria y acelera la inferencia, manteniendo un rendimiento cercano al modelo en precisión completa. Está diseñado para despliegue con frameworks como SGLang, vLLM, TokenSpeed y Transformers, y es compatible con endpoints de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos con atención dispersa (glm_moe_dsa) |
| Parametros totales | 151.734.927.286 (en esta cuantizacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT4 (este modelo); el base probablemente BF16/FP16 |
| Idiomas soportados | en, zh (segun HuggingFace); la model card menciona ademas HI, AR, RU, JA, KO, NL, FR, ES |
| Licencia | glm-5.3 (licencia propia de Zhipu AI) |
| Formato de pesos | safetensors, compatible con compressed-tensors |

## Arquitectura y entrenamiento

GLM-5.3 emplea una arquitectura de mezcla de expertos (MoE) con atención dispersa, indicada por la etiqueta `glm_moe_dsa`. Aunque no se han publicado detalles completos sobre el número de parámetros activos ni la configuración exacta de los expertos, el diseño MoE permite activar solo una fracción de los parámetros por token, lo que reduce el coste computacional en inferencia. El modelo base es el mismo que GLM-5.2, y todas las mejoras de GLM-5.3 provienen del post-entrenamiento, que incluye ajuste fino supervisado y probablemente optimización con preferencias humanas (RLHF/DPO), aunque no se especifica el método exacto.

El entrenamiento se centró en tareas de codificación, razonamiento de largo horizonte y capacidades de agente, con un énfasis particular en la mejora de la cadena de explotación en ciberseguridad. La cuantización AWQ INT4 aplicada por cyankiwi utiliza un conjunto de calibración de tipo STEM y agentico, según la model card, lo que preserva el rendimiento en tareas técnicas y de razonamiento. No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y conversación multilingüe, con soporte principal para inglés y chino, y cobertura adicional de hindi, árabe, ruso, japonés, coreano, neerlandés, francés y español.
- Razonamiento complejo y resolución de problemas de largo horizonte, con mejoras sustanciales frente a GLM-5.2 en tareas que requieren múltiples pasos.
- Codificación avanzada: genera, depura y refactoriza código en múltiples lenguajes, con un rendimiento superior en benchmarks como Terminal Bench 3.0 y DeepSWE.
- Capacidades de agente y tool calling: puede utilizar herramientas externas, ejecutar comandos en terminal y orquestar flujos de trabajo autónomos.
- Ciberseguridad: destaca en descubrimiento de vulnerabilidades y explotación, superando a modelos propietarios en benchmarks como CyberGym y ExploitGym.
- Razonamiento matemático y científico, con buenos resultados en benchmarks como HLE con herramientas y GDPval-AA.
- Soporte para despliegue en producción mediante frameworks como SGLang, vLLM, TokenSpeed y Transformers.

## Casos de uso

- Desarrollo de software asistido: el modelo puede generar código, revisar pull requests y corregir errores en repositorios reales, gracias a su rendimiento en DeepSWE y SWE-Marathon. Se integraría en pipelines de CI/CD para automatizar tareas de mantenimiento.
- Agentes autónomos de terminal: con su capacidad en Terminal Bench, puede ejecutar comandos, gestionar archivos y completar tareas administrativas en entornos Linux, útil para automatización de operaciones de TI.
- Análisis de seguridad ofensiva: su rendimiento en CyberGym y ExploitGym lo hace adecuado para pruebas de penetración automatizadas, identificación de vulnerabilidades y desarrollo de exploits en entornos controlados.
- Asistente de investigación científica: puede razonar sobre literatura técnica, resolver problemas matemáticos y ayudar en la redacción de artículos, apoyándose en su capacidad de razonamiento de largo contexto.
- Automatización de atención al cliente: aunque su foco es técnico, su soporte multilingüe y generación de texto conversacional permiten construir asistentes que manejan consultas complejas con múltiples turnos.
- Generación de documentación técnica: puede producir documentación de API, guías de usuario y comentarios de código a partir de especificaciones, aprovechando su comprensión de lenguajes de programación.

## Benchmarks y rendimiento

La model card del autor incluye una tabla comparativa con otros modelos de última generación. Se reproduce a continuación:

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

Nota: los valores corresponden al modelo GLM-5.3 en precisión completa, no a la versión cuantizada AWQ INT4. No se han publicado benchmarks específicos para esta cuantización.

## Requisitos de hardware

- El repositorio ocupa 488.2 GB, lo que sugiere que incluye el modelo en varios formatos o el original sin cuantizar. La versión AWQ INT4 de 151.7B parámetros requiere aproximadamente 76 GB de VRAM solo para los pesos (a 4 bits por parámetro), más overhead de activaciones y KV cache.
- No es viable en GPUs de consumo (RTX 4090, 3090, etc.) por su tamaño. Se necesitan múltiples GPUs de datacenter: por ejemplo, 2× A100 80GB o 2× H100 80GB para inferencia en FP16, o 1× A100 80GB si se usa la cuantización INT4 con suficiente margen para contexto.
- Para despliegue con contexto largo, se recomienda al menos 4× A100 80GB o equivalente, dependiendo de la longitud de secuencia.
- Frameworks soportados: SGLang, vLLM, TokenSpeed y Transformers. Todos ellos permiten servir el modelo con tensor parallelism y batching dinámico.
- La latencia y el throughput dependen del hardware y la configuración. Con vLLM y 2× H100, se pueden alcanzar decenas de tokens por segundo en generación, pero no se dispone de cifras oficiales para esta cuantización.

## Comparativa con modelos similares

GLM-5.3 compite directamente con otros modelos de gran tamaño orientados a codificación y agentes. La siguiente tabla resume las diferencias principales:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| GLM-5.3 (base) | ~151.7B (cuantizado) | no disponible | glm-5.3 | Codificacion, agentes, ciberseguridad |
| GLM-5.2 | similar | no disponible | glm-5.2 | Generalista, codificacion |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | no disponible | Razonamiento, codificacion |
| Qwen3.8-Max | no disponible | no disponible | no disponible | Generalista, multilingue |
| Opus 4.8 (propietario) | no disponible | no disponible | propietaria | Generalista, alto rendimiento |

En los benchmarks publicados, GLM-5.3 supera a GLM-5.2 en todos los casos, y en varios benchmarks (CyberGym, AutomationBench, GDPval-AA) supera a todos los modelos comparados, incluidos los propietarios. Sin embargo, en tareas como ExploitBench o ProgramBench, modelos como Fable 5 o GPT-5.6 Sol obtienen mejores resultados. La cuantización AWQ INT4 puede degradar ligeramente el rendimiento, pero no se dispone de datos cuantitativos.

## Limitaciones y advertencias

- La licencia `glm-5.3` es una licencia propia de Zhipu AI. No se han publicado los términos exactos, pero es probable que incluya restricciones para uso comercial y requisitos de atribución. Es necesario revisar la licencia antes de usar el modelo en producción.
- El modelo está optimizado principalmente para inglés y chino. Aunque la model card menciona otros idiomas, su rendimiento en español, francés o alemán puede ser inferior.
- No se dispone de información sobre la longitud de contexto máxima. El modelo Flash de la misma serie soporta 512k tokens, pero no está confirmado para GLM-5.3 base.
- Riesgo de alucinación en tareas de razonamiento de largo horizonte, especialmente cuando se le pide ejecutar múltiples pasos sin verificación externa.
- En ciberseguridad, el modelo puede generar exploits o código malicioso. Su uso debe limitarse a entornos autorizados y con fines defensivos.
- La cuantización AWQ INT4 puede introducir errores numéricos que afecten a tareas de precisión, como matemáticas avanzadas o generación de código con dependencias exactas.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es una publicación reciente o poco validada por la comunidad. Se recomienda probar exhaustivamente antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyankiwi/GLM-5.3-AWQ-INT4
- Modelo base (zai-org/GLM-5.3): https://huggingface.co/zai-org/GLM-5.3
- Sitio web de cyankiwi: https://cyan.kiwi/
- Página de modelos de cyankiwi: https://cyan.kiwi/models
- Repositorio de GLM-5 de Zhipu AI: https://github.com/zai-org/GLM-5
- Documentación de SGLang para GLM-5.3: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- Recetas de vLLM para GLM-5.3: https://recipes.vllm.ai/zai-org/GLM-5.3
- TokenSpeed: https://github.com/lightseekorg/tokenspeed
