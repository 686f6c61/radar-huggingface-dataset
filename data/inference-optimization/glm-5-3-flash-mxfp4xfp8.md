# inference-optimization/GLM-5.3-Flash-MXFP4xFP8

## Resumen

GLM-5.3-Flash es el primer modelo nativamente multimodal de la familia GLM-5, desarrollado por Z.ai (Zhipu AI). Se trata de un modelo de lenguaje y vision con arquitectura Mixture-of-Experts (MoE) de 320B parametros totales y solo 18B parametros activos por token, lo que lo situa en la categoria de modelos de gran capacidad pero con coste de inferencia reducido. La version aqui descrita, `inference-optimization/GLM-5.3-Flash-MXFP4xFP8`, es una cuantizacion de terceros publicada por el usuario `inference-optimization` que combina pesos MXFP4 y FP8 mediante compressed-tensors.

El modelo resuelve el problema de servir capacidades de razonamiento, codigo y agentes de nivel frontier con un coste computacional mucho menor que modelos densos equivalentes, gracias a su arquitectura hibrida de atencion dispersa y lineal, que reduce drasticamente el coste de servicio en contextos largos. Incorpora ademas Manifold-Constrained Hyper-Connections (mHC) para mejorar la eficiencia de escalado, y fue preentrenado sobre un corpus multimodal de 30 billones de tokens.

Es relevante ahora porque, segun el autor, supera a GLM-5.2 en benchmarks y cargas reales a una decima parte del precio, y se aproxima a Claude Opus 4.8 en tareas de codigo y agenticas. La ficha cubre tanto el modelo original como la cuantizacion MXFP4xFP8, que reduce el peso del repositorio a 182,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con atencion dispersa y lineal, y Manifold-Constrained Hyper-Connections (mHC) |
| Parametros totales | 165.496.249.182 (segun safetensors de esta cuantizacion); 320B segun la model card del modelo original |
| Parametros activos | 18B (modelo original) |
| Longitud de contexto | No disponible de forma explicita; se documentan evaluaciones con contexto de hasta 1M tokens (NL2Repo) y 300K tokens (HLE con herramientas) |
| Tipos de cuantizacion | MXFP4xFP8 (compressed-tensors, 8-bit); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

GLM-5.3-Flash parte de un modelo base entrenado desde cero, con arquitectura y receta de entrenamiento redisenadas en torno a capacidad y eficiencia. Introduce por primera vez en la serie GLM una arquitectura hibrida que combina atencion dispersa y atencion lineal, lo que reduce con fuerza el coste de servicio en contextos largos sin sacrificar precision en el manejo de contexto extendido. Ademas incorpora Manifold-Constrained Hyper-Connections (mHC) para mejorar la eficiencia de escalado. El preentrenamiento se realizo sobre un corpus multimodal de 30 billones de tokens.

El modelo es nativamente multimodal (pipeline `image-text-to-text`), es decir, procesa imagenes y texto de forma conjunta desde el preentrenamiento, no mediante un adaptador anadido a posteriori. La model card no detalla la composicion exacta del dataset ni si hubo fases de RLHF o DPO, aunque la orientacion a agentes, codigo y razonamiento con tool calling sugiere etapas de alineamiento y post-entrenamiento orientadas a esas tareas. El modelo soporta control del presupuesto de razonamiento mediante el parametro `reasoning_effort` con tres niveles (`low`, `high`, `max`).

La cuantizacion MXFP4xFP8 aqui descrita utiliza el formato compressed-tensors en 8 bits, combinando bloques MXFP4 y FP8, y reduce el repositorio a 182,2 GB. Esta version esta pensada para despliegue con transformers y frameworks compatibles con compressed-tensors.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa entradas de imagen y texto (`image-text-to-text`) y genera respuestas conversacionales.
- Razonamiento con presupuesto configurable: modo de pensamiento controlable mediante `reasoning_effort` (`low`, `high`, `max`), con `max` por defecto.
- Codigo y ingenieria agentica: la model card menciona resultados cercanos a Claude Opus 4.8 en benchmarks de codigo y agentes.
- Tool calling y uso de herramientas: evaluado en benchmarks como HLE con herramientas, Toolathlon y AutomationBench.
- Agentes multi-paso y terminal: evaluado en Terminal-Bench 2.1 dentro de Claude Code y en DeepSWE con el harness mini-swe-agent.
- Generacion de repositorios y tareas de contexto muy largo: evaluado en NL2Repo con contexto de 1M tokens.
- Capacidades multilingues limitadas a ingles y chino segun los metadatos.
- Capacidad de vision: evaluado en BabyVision con imagenes redimensionadas a un lado corto minimo de 1.5K pixeles.

## Casos de uso

- Agentes de codigo autonomos: el modelo puede operar en entornos tipo terminal y harnesses de agentes (evaluado en Terminal-Bench 2.1 y DeepSWE) para resolver tareas de ingenieria de software multi-paso con contexto de hasta 400K tokens.
- Generacion de repositorios completos a partir de especificaciones en lenguaje natural: con contexto de hasta 1M tokens (NL2Repo), es adecuado para tareas de scaffold y estructura de proyectos.
- Automatizacion de flujos con herramientas externas: su soporte de tool calling y su evaluacion en Toolathlon y AutomationBench lo hacen apto para orquestar APIs y servicios en pipelines de automatizacion.
- Asistencia multimodal en atencion al cliente: al procesar imagen y texto, puede gestionar conversaciones multi-turno con capturas, documentos o fotos de producto, con contexto largo.
- Analisis de documentos e imagenes tecnicas: la capacidad de vision con imagenes de alta resolucion (lado corto >= 1.5K px) permite extraer informacion de diagramas, capturas y documentos escaneados.
- Razonamiento profundo con control de coste: el parametro `reasoning_effort` permite ajustar el presupuesto de pensamiento segun la criticidad de la tarea, usando `low` para respuestas rapidas y `max` para evaluaciones complejas.
- Despliegue en produccion con coste reducido: la arquitectura MoE con 18B parametros activos y la cuantizacion MXFP4xFP8 permiten servir el modelo con menor VRAM y mayor throughput que un denso de 320B.

## Benchmarks y rendimiento

La model card incluye una imagen de benchmarks (`bench_53.png`) y notas metodologicas detalladas, pero no se proporcionan los valores numericos en el texto disponible. Los benchmarks mencionados en las notas son: HLE con herramientas (contexto maximo de 300K tokens, juez GPT-5.6-luna medium), NL2Repo (contexto de 1M tokens), DeepSWE (harness mini-swe-agent, contexto de 400K tokens), Terminal-Bench 2.1 (Claude Code 2.1.207), Agent's Last Exam, Toolathlon Verified, AutomationBench v1.0.6, GDPval-AA v2 (evaluado por Artificial Analysis) y BabyVision.

No se han publicado los valores numericos de estos benchmarks en la informacion disponible; solo se afirma cualitativamente que supera a GLM-5.2 y se aproxima a Claude Opus 4.8 en codigo y agentes.

## Requisitos de hardware

- VRAM estimada: el repositorio de la cuantizacion MXFP4xFP8 ocupa 182,2 GB, por lo que la inferencia completa requiere al menos ~182 GB de memoria (VRAM o VRAM+RAM en configuraciones hibridas). No se dispone de cifras oficiales de VRAM por configuracion.
- GPU recomendadas: para servir el modelo completo en GPU se necesitan configuraciones multi-GPU de clase datacenter (A100 80GB, H100 80GB, H200) o GPUs con mayor memoria. No se especifican configuraciones minimas oficiales.
- GPU de consumo: no cabe en GPUs de consumo individuales (RTX 4090 de 24 GB) en su totalidad; seria necesario offloading a RAM o configuraciones multi-GPU. KTransformers esta listado entre los frameworks soportados, lo que sugiere soporte para despliegue hibrido CPU/GPU en entornos con menos VRAM.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Transformers, KTransformers y Unsloth, segun la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada. La arquitectura de atencion hibrida y los 18B parametros activos estan disenados para reducir el coste de servicio en contextos largos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash | 320B (modelo original); 165,5B en esta cuantizacion | 18B | Hasta 1M tokens en evaluaciones | MIT | Hugging Face, API Z.ai |
| GLM-5.2 | No disponible | No disponible | No disponible | No disponible | No disponible |
| Claude Opus 4.8 | No disponible | No disponible | No disponible | Propietaria | API |
| GPT-5.6-luna | No disponible | No disponible | No disponible | Propietaria | API |

La model card solo establece comparaciones cualitativas con GLM-5.2 (superado en benchmarks) y Claude Opus 4.8 (rendimiento cercano en codigo y agentes). No se dispone de datos numericos de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- Datos de benchmarks no publicados en texto: la model card remite a una imagen y a notas metodologicas, sin cifras verificables en el texto; conviene consultar el blog y el informe tecnico antes de tomar decisiones.
- Cuantizacion de terceros: esta version MXFP4xFP8 la publica el usuario `inference-optimization`, no Z.ai; puede introducir degradacion respecto al modelo original y no esta avalada oficialmente por el autor del modelo.
- Discrepancia de parametros: los safetensors de esta cuantizacion declaran 165,5B parametros frente a los 320B de la model card original; conviene verificar la integridad y el esquema de cuantizacion antes de usarla en produccion.
- Riesgo de alucinacion: no se documenta en la informacion disponible; como en cualquier LLM, es esperable en tareas de conocimiento factual, especialmente con modo de razonamiento `max` y contextos muy largos.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones de los pesos originales y de la cuantizacion de terceros.
- Configuracion de chat: `clear_thinking` es `false` por defecto; para escenarios de chat debe pasarse explicitamente `clear_thinking=true`.
- Contexto: aunque se evalua con contextos de hasta 1M tokens, no se especifica la longitud de contexto nativa maxima del modelo.

## Enlaces

- Hugging Face (cuantizacion): https://huggingface.co/inference-optimization/GLM-5.3-Flash-MXFP4xFP8
- Blog de GLM-5.3-Flash: https://z.ai/blog/glm-5.3-flash
- Informe tecnico GLM-5 (arXiv): https://arxiv.org/abs/2602.15763
- API Z.ai: https://docs.z.ai/guides/llm/glm-5.3-flash
- Repositorio GLM-5 en GitHub: https://github.com/zai-org/GLM-5
- SGLang: https://github.com/sgl-project/sglang
- Cookbook SGLang para GLM-5.3-Flash: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3-Flash
- vLLM: https://github.com/vllm-project/vllm
- Recipes vLLM para GLM-5.3-Flash: https://recipes.vllm.ai/zai-org/GLM-5.3-Flash
- TokenSpeed: https://github.com/lightseekorg/tokenspeed
- Recetas TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#glm-5-3-flash
- Documentacion de Transformers para glm5_next: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm5_next.md
- KTransformers: https://github.com/kvcache-ai/ktransformers
- Tutorial KTransformers para GLM-5.3-Flash: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.3-Flash-Tutorial.md
- Unsloth: https://github.com/unslothai/unsloth
- Guia Unsloth para GLM-5.3: https://unsloth.ai/docs/models/glm-5.3
- Discord de la comunidad: https://discord.gg/QR7SARHRxK
