# blearyhope/Ling-3.1-flash

## Resumen

Ling-3.1-flash es un modelo de lenguaje de tipo Mixture of Experts (MoE) con arquitectura hibrida lineal, desarrollado por inclusionAI (el equipo vinculado a Ant Group y Alibaba, segun los enlaces de la model card). Se presenta como una version mejorada de Ling-3.0-flash, orientada a tareas complejas del mundo real: agentes de proposito general, busqueda, productividad de oficina e ingenieria de software. Con 560B parametros totales y 25B parametros activos por token, el modelo esta disenado para desplegarse en clusters de GPU de gama alta y ofrecer un equilibrio entre capacidad y coste de inferencia.

La innovacion principal reside en su ventana de contexto de 1M tokens combinada con una arquitectura hibrida que alterna capas de atencion lineal KDA (Kimi Delta Attention) y capas Gated MLA en una proporcion 7:1, lo que reduce el coste computacional del contexto largo. El modelo incorpora modo de razonamiento nativo (thinking mode), soporte de tool calling y decodificacion especulativa MTP (NEXTN), y se distribuye con licencia MIT, lo que facilita su adopcion comercial.

El modelo es relevante ahora porque compite directamente en el segmento de agentes de codigo y automatizacion de tareas de largo horizonte, con soporte dia-0 en SGLang y vLLM, y con resultados declarados en benchmarks como Terminal-Bench 4.0, SWE-bench Pro, FrontierSWE y GDPVal-AA V2.1. Su publicacion en Hugging Face con pesos en safetensors y fp8 lo posiciona como una alternativa abierta a modelos propietarios en escenarios de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid-linear MoE (63 capas KDA + 9 capas Gated MLA, proporcion 7:1; 4 capas densas) |
| Parametros totales | 560B (572.120.680.768 segun safetensors) |
| Parametros activos | 25B por token |
| Longitud de contexto | 1M tokens |
| Tipos de cuantizacion | fp8 (pesos publicados en fp8); no se detallan otras cuantizaciones en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code, bailing_hybrid) |

## Arquitectura y entrenamiento

Ling-3.1-flash emplea una arquitectura MoE hibrida con 63 capas KDA (atencion lineal) y 9 capas Gated MLA (Multi-head Latent Attention con compuerta), en una proporcion 7:1, mas 4 capas densas. Cada capa MoE dispone de 512 expertos enrutados y 1 experto compartido, con 8 expertos activados por token. La dimension oculta es de 4096, el tamano intermedio de experto es 1280, el tamano intermedio denso es 10240, hay 64 cabezas de atencion y un vocabulario de 157184 tokens. La combinacion de atencion lineal KDA con MLA busca reducir el coste de atencion en contextos de hasta 1M tokens manteniendo calidad en tareas de razonamiento.

El modelo incorpora decodificacion especulativa MTP (Multi-Token Prediction, esquema NEXTN) que acelera la decodificacion, y optimizaciones especificas para hardware Hopper (GEMV fp8 por bloques y cuantizacion fusionada de salida KDA). No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona que es un modelo de razonamiento nativo hibrido, con soporte de modo thinking activable mediante `enable_thinking`.

## Capacidades

- Generacion de texto y razonamiento con modo thinking nativo activable por parametro.
- Razonamiento multi-paso y agentes de largo horizonte (cientos de rondas de tool calls, con compactacion de contexto).
- Tool calling / function calling, con parsers dedicados en vLLM (`ling3`) y soporte de eleccion automatica de herramienta.
- Ingenieria de software: resolucion de issues, tareas de terminal, edicion de codigo en repositorios.
- Uso en frameworks de agentes de codigo: Claude Code, Kilo Code, Qwen Code, Hermes Agent y OpenClaw, segun la model card.
- Tareas de oficina y productividad (GDPVal-AA V2.1, OfficeBench-like).
- Dominios especializados: salud (HealthBench Professional), finanzas y ciencia de materiales.
- Busqueda y recuperacion aumentada dentro de flujos de agente.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes de codigo autonomos: el modelo puede operar en Claude Code, Kilo Code o Qwen Code para resolver tareas de ingenieria de software de varias horas, con cientos de rondas de tool calls y compactacion de contexto gracias a su ventana de 1M tokens y a su soporte de tool calling.
- Automatizacion de terminal y DevOps: con resultados declarados en Terminal-Bench 4.0, es adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en pipelines de CI/CD.
- Resolucion de issues en repositorios (SWE-bench Pro, FrontierSWE): puede integrarse en flujos de triage y parcheo automatico de bugs en bases de codigo grandes, donde el contexto largo permite cargar multiples ficheros y trazas.
- Asistentes de productividad de oficina: tareas de generacion y edicion de documentos, hojas de calculo y flujos administrativos, evaluadas en GDPVal-AA V2.1.
- Agentes de busqueda y recuperacion: el modelo puede orquestar busquedas web, sintetizar resultados y mantener estado a lo largo de conversaciones largas, aprovechando el contexto de 1M tokens para acumular evidencias.
- Soporte en dominios regulados: aplicaciones de salud (HealthBench Professional) y finanzas, donde el modo thinking permite razonamiento trazable y el contexto largo admite historiales clinicos o financieros extensos.
- Automatizacion de flujos MCP: con soporte declarado en MCP-Atlas y Automationbench, puede conectarse a servidores MCP y ejecutar tareas compuestas entre herramientas.
- Analisis de ciencia de materiales: la model card menciona mejoras en este dominio, util para extraer y razonar sobre literatura tecnica extensa.

## Benchmarks y rendimiento

La model card menciona evaluaciones en Terminal-Bench 4.0, SWE-bench Pro, FrontierSWE, GDPVal-AA V2.1, Automationbench, MCP-Atlas, SkillsBench y HealthBench Professional, pero no se incluyen los valores numericos en la informacion proporcionada (las cifras aparecen en imagenes no transcritas).

No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en fp8 ocupan aproximadamente 573,8 GB (tamano del repo), por lo que la inferencia requiere al menos ese volumen de memoria agregada, mas cache KV y buffers.
- Configuraciones verificadas segun la model card: 8 x H200 con TP8 + EP8, 4 x GB300 con TP4 + EP4, y recetas para H800, H100 y B200.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU de gama alta; requiere despliegue multi-GPU.
- Opciones de despliegue: SGLang (recomendado, imagen `lmsysorg/sglang:dev-ling-3.1-flash` con decodificacion especulativa NEXTN y optimizaciones Hopper) y vLLM (rama `vllm` del repositorio, con `--enable-expert-parallel`, `--mamba-cache-mode align`, parsers `ling3` y configuracion especulativa MTP con 3 tokens).
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card indica que las optimizaciones Hopper aportan aproximadamente un 10% mas de velocidad en decodificacion batch-1.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ling-3.1-flash | 560B / 25B | 1M | MIT | Hugging Face, OpenRouter |
| Ling-3.0-flash | no disponible en la informacion | no disponible | no disponible | Hugging Face (predecesor) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- No se detallan sesgos conocidos en la informacion proporcionada; como todo modelo entrenado con datos web a gran escala, es previsible que herede sesgos de esos datos.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en tareas de busqueda y dominios especializados (salud, finanzas); se recomienda verificacion humana en produccion.
- Idiomas soportados no especificados: no se puede garantizar un rendimiento homogeneo fuera de los idiomas principales del entrenamiento.
- El contexto de 1M tokens implica costes de memoria y latencia elevados; el uso de atencion lineal KDA mitiga pero no elimina el coste de contextos muy largos.
- Licencia MIT: permite uso comercial, pero el modelo se distribuye con `custom_code` y requiere `--trust-remote-code` en vLLM, lo que implica ejecutar codigo del autor; auditar antes de desplegar en entornos sensibles.
- El modelo requiere infraestructura multi-GPU de gama alta (H200, GB300, H100, B200), lo que limita su uso a organizaciones con capacidad de computo significativa.
- La model card menciona LingCode como harness aun no open source; las mejoras de rendimiento asociadas a ese harness pueden no ser reproducibles con otros frameworks.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y el ID de Hugging Face (`blearyhope/Ling-3.1-flash`) no coincide con el identificador canonico (`inclusionAI/Ling-3.1-flash`) usado en los comandos de la model card; conviene verificar la procedencia de los pesos antes de usarlos.

## Enlaces

- Hugging Face (repo consultado): https://huggingface.co/blearyhope/Ling-3.1-flash
- Hugging Face (organizacion del autor): https://huggingface.co/inclusionAI
- ModelScope: https://modelscope.cn/organization/inclusionAI
- OpenRouter: https://openrouter.ai/inclusionai/ling-3.1-flash
- SGLang cookbook para Ling-3.1-flash: https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.1-flash
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Imagen SGLang: `lmsysorg/sglang:dev-ling-3.1-flash` (Docker Hub)
