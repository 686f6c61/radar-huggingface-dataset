# Disconnectedx/Uxtil-7.9-Flash

## Resumen

Uxtil-7.9-Flash es el identificador con el que se ha publicado en Hugging Face el modelo GLM-5.3-Flash, desarrollado por Z.ai (equipo GLM-5). Se trata del primer modelo nativamente multimodal de la serie GLM-5 y está disenado para cargas de trabajo de codigo, razonamiento agentico y comprension de imagen y texto. Su arquitectura es un transformer hibrido con mezcla de expertos (MoE) que combina atencion dispersa y atencion lineal, con 320 000 millones de parametros totales y solo 18 000 millones activos por token, lo que reduce drasticamente el coste de servicio en contextos largos.

La relevancia del modelo radica en su relacion capacidad-coste: segun la model card, supera a GLM-5.2 en benchmarks y cargas reales con una decima parte del precio, y se aproxima a Claude Opus 4.8 en pruebas de codigo y agentes. Incorpora ademas Manifold-Constrained Hyper-Connections (mHC) para mejorar la eficiencia de escalado y se ha entrenado sobre un corpus multimodal de 30 billones de tokens.

El modelo se distribuye con licencia MIT, soporta ingles y chino, y esta pensado para despliegue local mediante SGLang, vLLM, TokenSpeed, Transformers, KTransformers y Unsloth. Su ventana de contexto es muy amplia (se citan evaluaciones con hasta 1M de tokens), lo que lo situa en la categoria de modelos frontera para tareas de ingenieria de software y agentes autonomos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con mezcla de expertos (MoE), atencion dispersa + atencion lineal, Manifold-Constrained Hyper-Connections (mHC) |
| Parametros totales | 321 323 031 390 (aprox. 320B) |
| Parametros activos | 18B |
| Longitud de contexto | No disponible como valor nominal; se documentan evaluaciones con 300K y 1M de tokens |
| Tipos de cuantizacion | No disponible (el repo incluye pesos en fp8; se menciona soporte de Unsloth y KTransformers) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers); tag fp8 |

## Arquitectura y entrenamiento

GLM-5.3-Flash parte de un modelo base entrenado desde cero, con arquitectura y receta de entrenamiento redisenadas en torno a capacidad y eficiencia. La innovacion principal es una arquitectura hibrida que combina atencion dispersa con atencion lineal, lo que reduce de forma notable el coste de servicio en contextos largos sin sacrificar precision en el manejo de contexto extendido. A ello se suma Manifold-Constrained Hyper-Connections (mHC), un mecanismo orientado a mejorar la eficiencia de escalado. El modelo es MoE, con 320B parametros totales y 18B activos, lo que permite un rendimiento alto con un coste de inferencia contenido.

El preentrenamiento se ha realizado sobre un corpus multimodal de 30 billones de tokens (30T), segun la model card. No se detalla en la informacion disponible la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; tampoco se especifican innovaciones adicionales como decodificacion especulativa. El modelo soporta un parametro `reasoning_effort` con tres niveles (`low`, `high`, `max`, por defecto `max`) para controlar el presupuesto de razonamiento, y su plantilla de chat incluye `clear_thinking` (por defecto `false`).

## Capacidades

- Generacion de texto y razonamiento avanzado, con modo de pensamiento configurable mediante `reasoning_effort` (`low`, `high`, `max`).
- Capacidades multimodales nativas de imagen y texto (pipeline `image-text-to-text`), incluyendo tareas de vision evaluadas en benchmarks como BabyVision.
- Generacion y comprension de codigo, con enfasis en ingenieria de software agentica (evaluaciones NL2Repo, DeepSWE, Terminal-Bench 2.1).
- Razonamiento agentico multi-paso y uso de herramientas (HLE con herramientas, Toolathlon Verified, AutomationBench, Agent's Last Exam).
- Soporte de contexto muy largo, con evaluaciones realizadas a 300K y 1M de tokens y estrategias de gestion de contexto.
- Capacidades multilingues limitadas a ingles y chino.
- Compatibilidad con endpoints y despliegue en multiples frameworks de inferencia (SGLang, vLLM, TokenSpeed, Transformers, KTransformers, Unsloth).

## Casos de uso

- Ingenieria de software agentica: el modelo puede operar en entornos tipo terminal y repositorios (evaluado en Terminal-Bench 2.1 y NL2Repo) para tareas de generacion, refactorizacion y validacion de codigo en pipelines de CI/CD, gracias a su soporte de tool calling y contexto de hasta 1M de tokens.
- Agentes autonomos con uso de herramientas: adecuado para orquestar flujos multi-paso con llamadas a APIs y servicios externos (Toolathlon Verified, AutomationBench), donde el control de `reasoning_effort` permite ajustar coste y latencia.
- Analisis de documentos largos y multimodal: con contexto de cientos de miles de tokens y entrada de imagen, puede procesar informes, capturas o diagramas junto a texto extenso en una sola pasada.
- Asistencia a desarrollo en IDE: integrable mediante vLLM o SGLang para autocompletado, explicacion de codigo y generacion de pruebas, con cuantizacion fp8 para reducir requisitos de memoria.
- Automatizacion de flujos de trabajo empresariales: su evaluacion en AutomationBench sugiere uso en tareas de automatizacion con reglas y validacion, donde el modelo actua como planificador y ejecutor de acciones.
- Investigacion en razonamiento y agentes: su perfil de coste (18B activos) y su licencia MIT lo hacen util para experimentacion academica con despliegue local en clusters modestos.
- Atencion al cliente tecnica multilingue (ingles/chino): conversaciones multi-turno con contexto largo y capacidad de consultar herramientas internas para resolver incidencias.

## Benchmarks y rendimiento

La model card incluye una imagen de benchmarks (`bench_53.png`) y notas metodologicas, pero no se proporcionan los valores numericos en la informacion disponible. Se documentan las condiciones de evaluacion:

| Benchmark | Condiciones documentadas |
|---|---|
| HLE con herramientas (conjunto completo) | temperature=1.0, top_p=0.95, max 163 840 tokens, contexto maximo 300K con gestion de contexto, juez GPT-5.6-luna (medium) |
| NL2Repo | temperature=1.0, top_p=1.0, max_new_tokens=64K, contexto 1M, juicio basado en reglas y LLM |
| DeepSWE | harness mini-swe-agent, temperature=0.95, top_p=1.0, timeout 6h, contexto 400K |
| Terminal-Bench 2.1 | Claude Code 2.1.207, temperature=1.0, top_p=1, max_new_tokens=65 536, timeout 6h |
| Toolathlon Verified | Servicio oficial de evaluacion, pass@1 medio de 3 ejecuciones |
| AutomationBench | Version v1.0.6, con correccion de manejo de tipo `null` (PR #13) |
| GDPval-AA v2 | Evaluado por Artificial Analysis |
| BabyVision | temperature=1.0, top_p=0.95, contexto maximo 164K, imagenes con lado corto >= 1.5K pixeles |

No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 320B parametros totales, en fp8 se requieren del orden de 320 GB solo para pesos; en cuantizaciones de 4 bits se reduciria a aproximadamente 160 GB, aunque estos calculos son estimaciones y no datos del autor.
- GPU recomendadas: no especificadas en la informacion disponible. Por el tamano del modelo, el despliegue realista requiere multiples aceleradores de datacenter (A100, H100, H200 o equivalentes); no cabe en GPU de consumo individual.
- Cabe en consumer GPU: no, con los datos disponibles. El repo ocupa 328,4 GB y el modelo tiene 321B parametros.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Transformers, KTransformers y Unsloth, con recetas y tutoriales enlazados en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GLM-5.3-Flash (Uxtil-7.9-Flash) | 320B totales / 18B activos | Hasta 1M en evaluaciones | MIT | Multimodal nativo, hibrido MoE + atencion lineal |
| GLM-5.2 | No disponible | No disponible | No disponible | Predecesor de la serie; segun la model card, GLM-5.3-Flash lo supera con una decima parte del precio |
| Claude Opus 4.8 | No disponible | No disponible | Propietaria | Referencia citada por el autor: GLM-5.3-Flash se aproxima en codigo y agentes |

No se dispone de datos numericos de rendimiento para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan mitigaciones especificas en la informacion disponible.
- El modo de razonamiento por defecto es `max`, lo que incrementa coste y latencia si no se ajusta explicitamente.
- En escenarios de chat se recomienda pasar `clear_thinking=true`; el valor por defecto (`false`) puede no ser el adecuado para produccion.
- El identificador del repositorio (`Disconnectedx/Uxtil-7.9-Flash`) no coincide con el nombre del modelo (GLM-5.3-Flash) ni con la organizacion original (zai-org), lo que exige verificar la procedencia y autenticidad de los pesos antes de usarlos en produccion.
- Las cifras de rendimiento citadas por el autor (comparaciones con Claude Opus 4.8 y GLM-5.2) no se acompanan de valores numericos en la informacion disponible y deben contrastarse con la evaluacion independiente.
- Aunque la licencia es MIT, conviene revisar las condiciones de los frameworks de despliegue y de los datos de entrenamiento antes de un uso comercial a gran escala.
- El modelo no cabe en hardware de consumo; el despliegue requiere infraestructura de datacenter.

## Enlaces

- Hugging Face: https://huggingface.co/Disconnectedx/Uxtil-7.9-Flash
- Blog de GLM-5.3-Flash: https://z.ai/blog/glm-5.3-flash
- Informe tecnico (arXiv): https://arxiv.org/abs/2602.15763
- API de Z.ai: https://docs.z.ai/guides/llm/glm-5.3-flash
- Repositorio GLM-5 en GitHub: https://github.com/zai-org/GLM-5
- SGLang: https://github.com/sgl-project/sglang
- Cookbook de SGLang para GLM-5.3-Flash: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3-Flash
- vLLM: https://github.com/vllm-project/vllm
- Recetas de vLLM: https://recipes.vllm.ai/zai-org/GLM-5.3-Flash
- TokenSpeed: https://github.com/lightseekorg/tokenspeed
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#glm-5-3-flash
- Transformers: https://github.com/huggingface/transformers
- Documentacion de Transformers para glm5_next: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm5_next.md
- KTransformers: https://github.com/kvcache-ai/ktransformers
- Tutorial de KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.3-Flash-Tutorial.md
- Unsloth: https://github.com/unslothai/unsloth
- Guia de Unsloth para GLM-5.3: https://unsloth.ai/docs/models/glm-5.3
- Discord de la comunidad: https://discord.gg/QR7SARHRxK
