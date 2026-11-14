# orbbit-AI-026/Dota-3

## Resumen

Dota 3 es un modelo multimodal de tipo image-text-to-text publicado por orbbit-AI-026 en Hugging Face. Se trata de una copia de partida sin ajustar de GLM-5.3-Flash, el primer modelo nativamente multimodal de la familia GLM-5 desarrollado por Z.ai. Con 321.323 millones de parametros totales y 18.000 millones de parametros activos, emplea una arquitectura de mezcla de expertos (MoE) con atencion hibrida que combina atencion dispersa y atencion lineal, disenada para reducir el coste de servicio en contextos largos sin sacrificar precision.

El modelo se presenta como el miembro equilibrado de la familia Hero 3 · Dota 3 · Nota 3 de Orbbit AI, aunque en el momento de su publicacion no ha recibido ningun ajuste por parte de dicho autor: los pesos corresponden a la base GLM-5.3-Flash de Z.ai, conservando su licencia MIT y su aviso de copyright. La relevancia actual del modelo radica en su relacion capacidad-coste: segun la documentacion de origen, supera a GLM-5.2 en benchmarks y cargas reales con una decima parte del precio, y se aproxima a Claude Opus 4.8 en tareas de codigo y agentes.

La ficha tecnica disponible cubre principalmente las caracteristicas heredadas de GLM-5.3-Flash, ya que la model card de Dota 3 remite integramente a la del modelo base. No se han publicado resultados de benchmarks propios de Dota 3 ni detalles sobre el ajuste futuro que Orbbit AI planea publicar en el mismo repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida (dispersa + lineal) y Manifold-Constrained Hyper-Connections (mHC) |
| Parametros totales | 321.323.031.390 |
| Parametros activos | 18.000 millones (aproximado, segun model card de GLM-5.3-Flash) |
| Longitud de contexto | No disponible de forma explicita; la model card cita evaluaciones con contexto de hasta 300.000 y 1.000.000 de tokens |
| Tipos de cuantizacion | No disponible (el tag del repositorio indica fp8) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

GLM-5.3-Flash, base de Dota 3, parte de un modelo base entrenado desde cero con una arquitectura y receta de entrenamiento redisenadas en torno a capacidad y eficiencia. Introduce por primera vez en la serie GLM una arquitectura hibrida que combina atencion dispersa y atencion lineal, lo que reduce de forma acusada el coste de servicio en contextos largos manteniendo las capacidades de contexto largo. Ademas, adopta Manifold-Constrained Hyper-Connections (mHC) para mejorar la eficiencia de escalado. El preentrenamiento multimodal se realizo sobre un corpus de 30 billones (30T) de tokens.

La model card no detalla la composicion del dataset, el uso de RLHF o DPO, ni innovaciones adicionales como decodificacion especulativa. Si se documenta un parametro `reasoning_effort` con tres niveles (`low`, `high`, `max`, por defecto `max`) para controlar el presupuesto de razonamiento, y un parametro `clear_thinking` en la plantilla de chat (por defecto `false`, recomendado `true` en escenarios conversacionales). El modelo es compatible con SGLang, vLLM, TokenSpeed, Transformers, KTransformers y Unsloth para despliegue local.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento configurable mediante `reasoning_effort` (niveles `low`, `high` y `max`).
- Procesamiento multimodal image-text-to-text: entrada conjunta de imagenes y texto.
- Capacidades de codigo y ingenieria agentica, segun la documentacion de origen orientada a "Vibe Coding to Agentic Engineering".
- Soporte de tool calling y uso de herramientas, con evaluaciones citadas en HLE w/ tools y Toolathlon Verified.
- Razonamiento multi-paso y agentes de larga duracion (evaluaciones con timeout de 6 horas en Terminal-Bench 2.1 y DeepSWE).
- Capacidades multilingues limitadas a ingles y chino.
- Evaluado en tareas de automatizacion (AutomationBench) y generacion de repositorios (NL2Repo).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su arquitectura de atencion hibrida, que reduce el coste de servicio en ventanas extensas, y a la posibilidad de activar `clear_thinking=true` para mantener respuestas conversacionales limpias.
- Generacion de codigo en produccion: soporta tool calling y ha sido evaluado en entornos de agente como Terminal-Bench 2.1 y DeepSWE, por lo que puede integrarse en pipelines de CI/CD y asistentes de codigo que ejecutan comandos y editan repositorios.
- Agentes autonomos de ingenieria de software: la evaluacion NL2Repo con contexto de hasta 1M tokens y la capacidad de operar durante horas (timeout de 6h en las pruebas) lo hacen adecuado para tareas de generacion y mantenimiento de repositorios completos.
- Analisis de documentos e imagenes: al ser un modelo nativamente multimodal, puede extraer informacion de capturas, diagramas o documentos escaneados combinados con texto, con calidad evaluada en BabyVision.
- Automatizacion de flujos de trabajo con herramientas externas: los resultados en AutomationBench y Toolathlon Verified indican aptitud para orquestar APIs y servicios en pipelines de automatizacion.
- Asistente de investigacion y razonamiento profundo: el nivel `reasoning_effort=max` permite tareas de razonamiento complejo con presupuesto amplio de tokens, util para analisis tecnico y sintesis de informacion.
- Despliegue self-hosted en infraestructura propia: compatible con SGLang, vLLM, KTransformers y Unsloth, lo que facilita servir el modelo en clusters con control total de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos de Dota 3 en la informacion disponible. La model card de GLM-5.3-Flash referencia una imagen de benchmarks (`bench_53.png`) y multiples evaluaciones (HLE w/ tools, NL2Repo, DeepSWE, Terminal-Bench 2.1, Agent's Last Exam, Toolathlon Verified, AutomationBench, GDPval-AA v2 y BabyVision), pero los valores numericos no se incluyen en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 321.323 millones de parametros totales y 18.000 millones activos, el peso completo en fp8 rondaria los 321 GB, por lo que la inferencia requiere multiples GPU o tecnicas de offloading.
- GPU recomendadas: no especificadas en la informacion disponible. Por el tamano del modelo, se requiere un nodo multi-GPU de clase datacenter (A100, H100 u equivalentes); no se confirma compatibilidad con GPU de consumo.
- Cabe en GPU de consumo: no disponible; el tamano del repositorio (328,4 GB) y el numero de parametros hacen improbable la inferencia completa en una unica GPU de consumo.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Transformers, KTransformers y Unsloth.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dota 3 (orbbit-AI-026) | 321.323 M | 18.000 M (aprox.) | No disponible de forma explicita | MIT | Hugging Face, sin descargas ni likes |
| GLM-5.3-Flash (Z.ai) | 320.000 M | 18.000 M | No disponible de forma explicita | MIT | Hugging Face y API Z.ai |
| GLM-5.2 (Z.ai) | No disponible | No disponible | No disponible | No disponible | Referenciado en la model card |

La model card indica que GLM-5.3-Flash supera a GLM-5.2 en benchmarks y cargas reales con una decima parte del precio, y que se aproxima a Claude Opus 4.8 en benchmarks de codigo y agentes. No se dispone de datos numericos que permitan una comparacion cuantitativa en esta ficha.

## Limitaciones y advertencias

- Dota 3 es una copia de partida sin ajustar: los pesos son identicos a GLM-5.3-Flash y no incorporan entrenamiento propio de Orbbit AI.
- Idiomas limitados a ingles y chino; no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion no cuantificado en la informacion disponible; se trata de un modelo generativo de gran escala sin garantias de veracidad.
- Sesgos conocidos: no documentados en la model card.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero se deben conservar la LICENSE y el aviso de copyright originales de Z.ai.
- El repositorio no registra descargas ni likes, lo que sugiere ausencia de validacion comunitaria.
- El tag `fp8` indica pesos en precision reducida; no se detallan otras variantes de cuantizacion.
- El parametro `reasoning_effort` tiene por defecto `max`, lo que puede incrementar coste y latencia si no se ajusta explicitamente.
- En escenarios conversacionales es necesario pasar `clear_thinking=true` de forma explicita para evitar respuestas contaminadas por el modo de pensamiento.

## Enlaces

- Hugging Face: https://huggingface.co/orbbit-AI-026/Dota-3
- Modelo base GLM-5.3-Flash: https://huggingface.co/zai-org/GLM-5.3-Flash
- Blog de GLM-5.3-Flash: https://z.ai/blog/glm-5.3-flash
- Informe tecnico GLM-5 (arXiv): https://arxiv.org/abs/2602.15763
- API Z.ai: https://docs.z.ai/guides/llm/glm-5.3-flash
- SGLang cookbook: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3-Flash
- Recetas vLLM: https://recipes.vllm.ai/zai-org/GLM-5.3-Flash
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#glm-5-3-flash
- Documentacion de Transformers (glm5_next): https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm5_next.md
- Tutorial KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.3-Flash-Tutorial.md
- Guia Unsloth: https://unsloth.ai/docs/models/glm-5.3
- Repositorio GLM-5: https://github.com/zai-org/GLM-5
- Discord de la comunidad: https://discord.gg/QR7SARHRxK
