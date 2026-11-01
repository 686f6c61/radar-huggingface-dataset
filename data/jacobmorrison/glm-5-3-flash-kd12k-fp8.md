# jacobmorrison/glm-5.3-flash-kd12k-fp8

## Resumen

GLM-5.3-Flash es el primer modelo nativamente multimodal de la familia GLM-5, desarrollado por Z.ai (zai-org). Se trata de un modelo de arquitectura híbrida con 320.000 millones de parámetros totales y solo 18.000 millones activos por token, lo que lo posiciona como un MoE de gran escala orientado a eficiencia en el servicio. La versión alojada en este repositorio es una cuantización FP8 del checkpoint original, publicada por el usuario jacobmorrison, con un peso de repositorio de 328,4 GB.

El modelo introduce por primera vez en la serie GLM una arquitectura híbrida que combina atención dispersa (sparse attention) y atención lineal (linear attention), reduciendo de forma sustancial el coste de servicio en contextos largos sin sacrificar precisión. Además, incorpora Manifold-Constrained Hyper-Connections (mHC) para mejorar la eficiencia de escalado. El preentrenamiento se realizó sobre un corpus multimodal de 30 billones de tokens.

Su relevancia actual radica en la relación capacidad/coste: según la model card, supera a GLM-5.2 en benchmarks y cargas reales con una décima parte del precio, y se aproxima a Claude Opus 4.8 en tareas de código y agentes. Está pensado tanto para despliegue local en frameworks de inferencia de alto rendimiento como para uso vía API en la plataforma Z.ai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con atención dispersa + atención lineal y Manifold-Constrained Hyper-Connections (mHC) |
| Parametros totales | 321.323.031.390 (≈320B) |
| Parametros activos | 18B |
| Longitud de contexto | No disponible de forma explícita; la model card menciona evaluaciones con 300K, 400K y 1M de contexto según el benchmark |
| Tipos de cuantizacion | FP8 (esta versión del repositorio); la model card menciona soporte de Unsloth y KTransformers, pero no detalla otros formatos |
| Idiomas soportados | Inglés (en), chino (zh); los tags de HuggingFace incluyen también árabe (ar) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

GLM-5.3-Flash parte de un modelo base entrenado desde cero, con arquitectura y receta de entrenamiento rediseñadas en torno a capacidad y eficiencia. La innovación estructural principal es la combinación de atención dispersa y atención lineal en un mismo transformer, lo que reduce drásticamente el coste de servicio en contextos largos manteniendo la precisión en recuperación de información lejana. A esto se suma el uso de Manifold-Constrained Hyper-Connections (mHC), un mecanismo orientado a mejorar la eficiencia de escalado del modelo.

El preentrenamiento se llevó a cabo sobre un corpus multimodal de 30 billones (30T) de tokens, lo que explica la naturaleza nativamente multimodal del modelo (pipeline image-text-to-text). La model card no detalla la composición exacta del dataset ni las etapas de ajuste fino (SFT, RLHF o DPO) más allá de la mención genérica a la receta rediseñada. El modelo expone un parámetro `reasoning_effort` con tres niveles (`low`, `high`, `max`) para controlar el presupuesto de razonamiento, lo que sugiere una etapa de entrenamiento orientada a razonamiento con longitud variable.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto conjuntamente (pipeline image-text-to-text).
- Razonamiento con presupuesto controlable mediante `reasoning_effort` (`low`, `high`, `max`; por defecto `max`).
- Capacidades de código y agentes: la model card cita benchmarks como DeepSWE, Terminal-Bench 2.1, NL2Repo y Agent's Last Exam, orientados a ingeniería agéntica.
- Uso de herramientas (tool calling): evaluado en HLE con conjunto completo de herramientas, Toolathlon Verified y AutomationBench.
- Razonamiento multi-paso y tareas agénticas de larga duración (timeouts de hasta 6 horas en algunos benchmarks).
- Capacidades multilingües en inglés y chino, con tag adicional de árabe.
- Modo de pensamiento (thinking) con control de presupuesto y parámetro `clear_thinking` en la plantilla de chat.
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Ingeniería de software agéntica: el modelo está evaluado en Terminal-Bench 2.1 dentro de Claude Code y en DeepSWE con el harness mini-swe-agent, por lo que encaja en pipelines donde un agente ejecuta comandos, edita repositorios y valida cambios de forma autónoma durante sesiones prolongadas.
- Generación de repositorios completos a partir de lenguaje natural: el benchmark NL2Repo (evaluado con contexto de 1M tokens) indica que el modelo puede abordar la síntesis de proyectos enteros, útil para prototipado rápido y andamiaje de código.
- Automatización de flujos con herramientas externas: su evaluación en Toolathlon Verified y AutomationBench (v1.0.6) lo hace adecuado para orquestar APIs y acciones encadenadas en entornos tipo Zapier.
- Análisis de documentos e imágenes combinados: al ser image-text-to-text, puede extraer información de capturas, diagramas o documentos escaneados y razonar sobre ellos en una misma conversación.
- Asistentes de razonamiento profundo con coste controlado: el parámetro `reasoning_effort` permite rebajar el presupuesto de cómputo en consultas simples (`low`) y elevarlo (`max`) solo cuando la tarea lo exige, lo que resulta útil en atención al cliente o asistentes internos con volumen alto.
- Servicio de contexto largo a bajo coste: la combinación de atención dispersa y lineal está diseñada explícitamente para reducir el coste de servir contextos de cientos de miles de tokens, lo que habilita casos como resumen de corpus extensos o auditoría de código a gran escala.
- Evaluación y benchmark interno: la disponibilidad de una versión FP8 en safetensors permite desplegarlo con SGLang, vLLM o KTransformers para reproducir los resultados publicados en entornos propios.

## Benchmarks y rendimiento

La model card referencia benchmarks como HLE con herramientas, NL2Repo, DeepSWE, Terminal-Bench 2.1, Agent's Last Exam, Toolathlon Verified, AutomationBench, GDPval-AA v2 y BabyVision, e incluye una imagen (`bench_53.png`) con los resultados. Sin embargo, los valores numéricos concretos no están incluidos en la información proporcionada (la imagen no es texto extraíble y no se listan cifras en el cuerpo de la model card).

No se han publicado resultados de benchmarks en la información disponible en formato numérico.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 328,4 GB en FP8, por lo que se necesita al menos ese espacio en memoria de GPU (o en memoria agregada) para cargar los pesos completos. Con 18B parámetros activos, el cómputo por token es mucho menor que el de un modelo denso de 320B, pero el peso completo debe residir en memoria.
- GPU recomendadas: no disponible de forma explícita; por el tamaño en FP8 se requiere un nodo multi-GPU de clase H100/H200 o equivalente. No cabe en una GPU de consumo individual.
- Consumer GPU: no cabe en ninguna GPU de consumo actual con los pesos completos en FP8; sería necesario cuantizar más agresivamente (no documentado en esta ficha) o usar offloading.
- Opciones de despliegue: SGLang (cookbook disponible), vLLM (recipes), TokenSpeed, Transformers, KTransformers y Unsloth.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash | ≈320B | 18B | Hasta 1M en evaluaciones citadas | MIT | Híbrido sparse + linear attention, multimodal |
| GLM-5.2 | No disponible | No disponible | No disponible | No disponible | La model card indica que GLM-5.3-Flash lo supera a una décima parte del precio |
| Claude Opus 4.8 | No disponible | No disponible | No disponible | Propietaria | Referencia de comparación en código y agentes según la model card |

No se dispone de datos numéricos de parámetros, contexto ni licencia de GLM-5.2 ni de Claude Opus 4.8 en la información proporcionada, por lo que la comparación cuantitativa no puede completarse.

## Limitaciones y advertencias

- Repositorio de terceros: esta versión FP8 está publicada por el usuario jacobmorrison, no por el equipo oficial de Z.ai; conviene validar la integridad de los pesos antes de usarlos en producción.
- Idiomas: la model card declara inglés y chino; el tag de HuggingFace añade árabe, pero no hay evidencia en la información disponible de cobertura amplia en otras lenguas.
- Riesgo de alucinación: no se documenta en la información disponible; como en cualquier LLM de gran escala, debe asumirse y mitigarse con verificación externa, especialmente en tareas agénticas con ejecución de comandos.
- Seguridad en uso agéntico: la model card menciona el uso de jueces basados en reglas y LLM para evitar comportamientos maliciosos (por ejemplo, `pip` o `curl` no autorizados) durante la evaluación de NL2Repo, lo que sugiere que en producción es necesario aplicar sandboxing y políticas de ejecución.
- Licencia MIT: permisiva para uso comercial, pero sin garantías; el autor original no ofrece cláusulas adicionales de responsabilidad.
- Configuración de chat: `clear_thinking` por defecto es `false`; la model card recomienda pasar `clear_thinking=true` en escenarios de chat, lo que puede provocar comportamientos inesperados si se omite.
- Presupuesto de razonamiento: `reasoning_effort` por defecto es `max` (o cualquier valor no reconocido); para despliegues con latencia sensible hay que pasar explícitamente `low` o `high`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jacobmorrison/glm-5.3-flash-kd12k-fp8
- Blog oficial GLM-5.3-Flash: https://z.ai/blog/glm-5.3-flash
- Informe técnico GLM-5 (arXiv): https://arxiv.org/abs/2602.15763
- Documentación API Z.ai: https://docs.z.ai/guides/llm/glm-5.3-flash
- Repositorio GitHub GLM-5: https://github.com/zai-org/GLM-5
- Discord: https://discord.gg/QR7SARHRxK
- SGLang: https://github.com/sgl-project/sglang
- Cookbook SGLang GLM-5.3-Flash: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3-Flash
- vLLM: https://github.com/vllm-project/vllm
- Recipes vLLM: https://recipes.vllm.ai/zai-org/GLM-5.3-Flash
- TokenSpeed: https://github.com/lightseekorg/tokenspeed
- Recipes TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#glm-5-3-flash
- Transformers: https://github.com/huggingface/transformers
- Docs Transformers GLM5_next: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm5_next.md
- KTransformers: https://github.com/kvcache-ai/ktransformers
- Tutorial KTransformers GLM-5.3-Flash: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.3-Flash-Tutorial.md
- Unsloth: https://github.com/unslothai/unsloth
- Guía Unsloth GLM-5.3: https://unsloth.ai/docs/models/glm-5.3
- AutomationBench PR #13: https://github.com/zapier/AutomationBench/pull/13
