# inclusionAI/Ling-3.1-flash

## Resumen

Ling-3.1-flash es un modelo de lenguaje de tipo Mixture of Experts (MoE) con arquitectura hibrida lineal, desarrollado por inclusionAI (organizacion vinculada al ecosistema Ant Group/Alipay). Con 560B parametros totales y 25B parametros activos por token, se posiciona como un modelo de gran escala orientado a tareas agenticas complejas del mundo real, con una ventana de contexto de 1M tokens. Es la evolucion de Ling-3.0-flash, con mejoras en arquitectura y rendimiento en tareas de agentes generales, busqueda, productividad ofimatica e ingenieria de software.

El modelo destaca por su atencion hibrida que combina capas KDA (Kimi Delta Attention, atencion lineal) con capas Gated MLA en una proporcion 7:1, lo que reduce el coste computacional del contexto largo. Incorpora modo de razonamiento nativo (thinking mode) activable mediante `enable_thinking`, decodificacion especulativa MTP (NEXTN) y soporte de tool calling con parsers dedicados en vLLM y SGLang.

Su relevancia actual radica en que compite directamente en el segmento de modelos frontera para agentes de codigo y automatizacion (Claude Code, Kilo Code, OpenClaw, Hermes Agent), con licencia MIT y pesos abiertos en safetensors y FP8, lo que facilita su despliegue en infraestructura propia frente a alternativas propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid-linear MoE (KDA + Gated MLA, proporcion 7:1) |
| Parametros totales | 560B (572.120.680.768 segun safetensors) |
| Parametros activos | 25B por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (pesos publicados en fp8); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code, requiere `trust_remote_code`) |

Especificaciones adicionales de arquitectura:

| Parametro | Valor |
|---|---|
| Capas transformer | 63 KDA + 9 Gated MLA (7:1) |
| Capas densas | 4 |
| Expertos enrutados | 512 |
| Expertos compartidos | 1 |
| Expertos activados por token | 8 |
| Cabezas de atencion | 64 |
| Hidden size | 4096 |
| Tamano intermedio de experto | 1280 |
| Tamano intermedio denso | 10240 |
| Tamano de vocabulario | 157184 |
| Tamano del repo | 573,8 GB |

## Arquitectura y entrenamiento

Ling-3.1-flash emplea una arquitectura MoE hibrida que intercala 63 capas con KDA (atencion lineal con estado recurrente) y 9 capas con Gated MLA (Multi-head Latent Attention con compuerta), manteniendo una proporcion 7:1. Esta combinacion busca capturar la eficiencia de las capas lineales en contextos muy largos (hasta 1M tokens) sin renunciar a la capacidad expresiva de la atencion completa en un subconjunto de capas. El modelo cuenta con 512 expertos enrutados mas un experto compartido, activando 8 expertos por token, lo que da lugar a los 25B parametros activos sobre un total de 560B. Incorpora 4 capas densas y un vocabulario de 157.184 tokens.

El modelo es de razonamiento hibrido nativo: puede operar en modo thinking o no thinking segun el parametro `enable_thinking`. Segun la model card, se construye sobre Ling-3.0-flash con mejoras en arquitectura y rendimiento, aunque no se detallan en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO. Si se documenta soporte de decodificacion especulativa MTP (NEXTN) en SGLang y `mtp` en vLLM, asi como optimizaciones especificas para Hopper (FP8 block GEMV y cuantizacion fusionada de salida KDA) que aceleran aproximadamente un 10% la decodificacion con batch 1.

## Capacidades

- Generacion de texto y razonamiento hibrido con modo thinking activable (`enable_thinking: true`).
- Razonamiento multi-paso y tareas agenticas de horizonte largo (cientos de rondas de tool calls, compactacion repetida de contexto).
- Tool calling / function calling nativo, con parsers dedicados en vLLM (`--tool-call-parser ling3`) y SGLang.
- Uso en terminal y entornos de linea de comandos (evaluado en Terminal-Bench 4.0).
- Ingenieria de software: resolucion de issues y tareas de repositorio (SWE-bench Pro, FrontierSWE).
- Busqueda y recuperacion aumentada dentro de flujos de agente.
- Productividad ofimatica (GDPVal-AA V2.1) y tareas sanitarias (HealthBench Professional).
- Dominios especializados: finanzas y ciencia de materiales, segun la model card.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Compatibilidad verificada con frameworks de agentes: Claude Code, Kilo Code, Qwen Code, Hermes Agent, OpenClaw.

## Casos de uso

- Agentes de codigo autonomos en produccion: con 1M tokens de contexto y soporte de tool calling, el modelo puede mantener sesiones largas sobre repositorios completos, ejecutar comandos en terminal y aplicar parches iterativos; encaja en harnesses como Claude Code o Kilo Code.
- Automatizacion de ingenieria de software en CI/CD: integrado via vLLM o SGLang, puede resolver issues etiquetadas, generar PRs y ejecutar pruebas en pipelines, con decodificacion especulativa MTP para reducir latencia en batch.
- Agentes de terminal y operaciones (SRE/DevOps): el modelo esta evaluado en Terminal-Bench 4.0 y puede interpretar salidas de shell, diagnosticar fallos y proponer comandos correctivos en un bucle de herramientas.
- Asistentes de productividad ofimatica: tareas de edicion documental, hojas de calculo y flujos administrativos evaluadas en GDPVal-AA V2.1; util para automatizar back-office con contexto largo de expedientes.
- Analisis documental de gran volumen: la ventana de 1M tokens permite procesar contratos, informes financieros o historiales clinicos completos sin troceado agresivo, aprovechando el modo thinking para razonamiento sobre el documento.
- Agentes de busqueda y research: con soporte de MCP-Atlas y SkillsBench, puede orquestar llamadas a APIs externas, motores de busqueda y bases de conocimiento en flujos multi-herramienta.
- Soporte en dominios regulados (salud y finanzas): evaluado en HealthBench Professional y en tareas financieras, apto para asistentes internos con supervision humana dado el riesgo de alucinacion.

## Benchmarks y rendimiento

La model card menciona evaluacion en Terminal-Bench 4.0, SWE-bench Pro, FrontierSWE, GDPVal-AA V2.1, Automationbench, MCP-Atlas, SkillsBench y HealthBench Professional, e indica mejoras frente a Ling-3.0-flash, pero no se incluyen los valores numericos en la informacion proporcionada.

No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en FP8 ocupan aproximadamente 560 GB (573,8 GB de repo), por lo que la inferencia requiere agregado multi-GPU; no cabe en una sola GPU comercial.
- Configuracion recomendada por el autor: 8 x H200 con TP8 + EP8 en SGLang, o 4 x GB300 con TP4 + EP4.
- Recetas verificadas para H200, GB300, H800, H100 y B200 segun el cookbook de SGLang.
- En vLLM: tensor-parallel-size 8, `--enable-expert-parallel`, `--mamba-cache-mode align`, `--gpu-memory-utilization 0.85`, decodificacion especulativa `mtp` con 3 tokens.
- No cabe en GPU de consumo (RTX 4090, 5090) ni en configuraciones de una o dos GPUs profesionales.
- Opciones de despliegue: SGLang (imagen `lmsysorg/sglang:dev-ling-3.1-flash`, recomendada), vLLM (rama main con `trust-remote-code`), y OpenRouter como servicio gestionado. Soporte de HiCache (Mooncake L3) para cache de contexto.
- Latencia y throughput: no disponibles; solo se indica una mejora de ~10% en decodificacion batch-1 con las optimizaciones Hopper (`SGLANG_ENABLE_FP8_BLOCK_GEMV=1`, `SGLANG_ENABLE_FUSED_KDA_OUTPUT_QUANT=1`).

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ling-3.1-flash | 560B / 25B | 1M | MIT | Pesos abiertos (HF, ModelScope), OpenRouter |
| Ling-3.0-flash | no disponible en la informacion | no disponible | no disponible | Predecesor del modelo |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento de modelos competidores comparables, por lo que no se puede establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Riesgo de alucinacion inherente a modelos de lenguaje de gran escala; en dominios regulados (salud, finanzas) requiere supervision humana y validacion de salidas.
- Sesgos conocidos: no documentados en la informacion disponible; cabe esperar sesgos derivados de los datos de entrenamiento, cuya composicion no se detalla.
- Idiomas soportados no especificados: no hay garantia documentada de calidad multilingue fuera de los idiomas evaluados.
- El contexto de 1M tokens implica costes de memoria KV elevados; el despliegue real exige cache gestionada (HiCache/Mooncake) y configuraciones multi-GPU.
- Requiere `trust_remote_code` y codigo personalizado (`custom_code`), lo que anade superficie de riesgo en la cadena de suministro de software.
- Pesos en FP8: la cuantizacion adicional a otros formatos (GGUF, AWQ, GPTQ) no esta documentada por el autor, lo que limita el despliegue en entornos sin GPU de datacenter.
- Licencia MIT permite uso comercial sin restricciones, pero no se ofrece garantia ni soporte por parte del autor.
- La model card no publica cifras de benchmarks, numero de tokens de entrenamiento ni detalles de alineacion (RLHF/DPO), lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/Ling-3.1-flash
- Organizacion en Hugging Face: https://huggingface.co/inclusionAI
- ModelScope: https://modelscope.cn/organization/inclusionAI
- OpenRouter: https://openrouter.ai/inclusionai/ling-3.1-flash
- Cookbook de SGLang para Ling-3.1-flash: https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.1-flash
- Repositorio de vLLM: https://github.com/vllm-project/vllm
