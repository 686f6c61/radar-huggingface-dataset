# inclusionAI/Ling-3.1-flash

## Resumen

Ling-3.1-flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con razonamiento híbrido nativo, desarrollado por inclusionAI (organización vinculada a Ant Group). Se presenta como una evolución de Ling-3.0-flash orientada a tareas del mundo real: agentes de propósito general, búsqueda, productividad de oficina e ingeniería de software. Con 560B parámetros totales y 25B activos por token, ofrece una ventana de contexto de 1M tokens, lo que lo sitúa en la categoría de modelos de contexto ultralargo con activación reducida.

La arquitectura combina atención lineal y atención completa en una proporción 7:1: 63 capas KDA (Kimi Delta Attention, atención lineal) y 9 capas Gated MLA (Multi-head Latent Attention con compuerta), más 4 capas densas. El modelo emplea 512 expertos enrutados con 8 activos por token y 1 experto compartido, con un tamaño oculto de 4096 y un vocabulario de 157184 tokens.

Su relevancia actual radica en la combinación de contexto de 1M tokens, activación de solo 25B parámetros (lo que abarata la inferencia frente a modelos densos del mismo tamaño) y un enfoque explícito en tareas agénticas de largo horizonte, con soporte para decodificación especulativa MTP (NEXTN) y despliegue verificado en SGLang y vLLM sobre hardware Hopper y Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid-linear MoE (63 capas KDA + 9 capas Gated MLA, proporción 7:1; 4 capas densas) |
| Parametros totales | 560B (572.120.680.768 según safetensors) |
| Parametros activos | 25B por token |
| Longitud de contexto | 1M tokens |
| Tipos de cuantizacion | FP8 (pesos publicados en fp8 según tags); no se detallan otras cuantizaciones en la información disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code, requiere `trust_remote_code`) |

Otros datos de arquitectura: 512 expertos enrutados, 8 activos, 1 experto compartido; 64 cabezas de atención; hidden size 4096; expert intermediate size 1280; dense intermediate size 10240; vocabulario 157184.

## Arquitectura y entrenamiento

Ling-3.1-flash es un transformer MoE híbrido que intercala capas de atención lineal KDA con capas de atención completa Gated MLA en proporción 7:1. Esta mezcla busca reducir el coste computacional y de memoria del contexto largo (las capas lineales escalan de forma más favorable con la longitud de secuencia) manteniendo la calidad de recuperación de información que aporta la atención completa en las capas MLA. El modelo tiene 63 capas KDA, 9 capas Gated MLA y 4 capas densas, con 512 expertos enrutados de los que se activan 8 por token más un experto compartido, lo que da lugar a los 25B parámetros activos sobre un total de 560B.

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Sí se documenta soporte nativo de razonamiento híbrido (modo thinking activable mediante `enable_thinking`), decodificación especulativa MTP (NEXTN) integrada en SGLang y vLLM, y optimizaciones específicas para decodificación en Hopper (variables `SGLANG_ENABLE_FP8_BLOCK_GEMV` y `SGLANG_ENABLE_FUSED_KDA_OUTPUT_QUANT`, con ~10% de mejora en decode batch-1). El autor menciona también LingCode, un harness construido sobre el agente de código abierto Pi para tareas de codificación de largo horizonte (cientos de rondas de tool calls, compactación repetida de contexto), cuya liberación como open source está en consideración.

## Capacidades

- Generación de texto conversacional y razonamiento híbrido con modo thinking activable (`enable_thinking: true`).
- Razonamiento multi-step y agentes de propósito general, con soporte para frameworks como Claude Code, Kilo Code, Qwen Code, Hermes Agent y OpenClaw.
- Tool calling / function calling nativo, con parser dedicado (`--tool-call-parser ling3`) y razonamiento parseado (`--reasoning-parser ling3`) en vLLM.
- Uso de terminal y herramientas de línea de comandos (evaluado en Terminal-Bench 4.0).
- Ingeniería de software: resolución de issues y tareas de código (SWE-bench Pro, FrontierSWE).
- Búsqueda y recuperación de información sobre contexto ultralargo (1M tokens).
- Tareas de oficina y productividad (GDPVal-AA V2.1, Automationbench).
- Dominio sanitario (HealthBench Professional) y financiero, además de ciencia de materiales y STEM.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Agentes de codificación de largo horizonte: integrado en harnesses como LingCode o Claude Code, el modelo puede ejecutar cientos de rondas de tool calls con compactación repetida de contexto, aprovechando la ventana de 1M tokens y el soporte de decodificación especulativa para mantener el throughput.
- Automatización de terminal y DevOps: con Terminal-Bench 4.0 como referencia, el modelo puede interpretar salidas de shell, encadenar comandos y corregir errores en pipelines de CI/CD mediante tool calling nativo.
- Resolución de issues en repositorios: uso tipo SWE-bench Pro/FrontierSWE para localizar el fallo, editar múltiples ficheros y validar con tests, con contexto suficiente para incluir grandes porciones del repositorio.
- Asistentes de oficina y ofimática: generación y edición de documentos, hojas de cálculo y flujos administrativos (evaluado en GDPVal-AA V2.1 y Automationbench), adecuado por su rendimiento en tareas del mundo real y su coste de activación reducido.
- Búsqueda aumentada sobre corpus extensos: la ventana de 1M tokens permite ingerir documentación completa, expedientes o bases de conocimiento sin trocear, útil en atención al cliente técnica o soporte interno.
- Aplicaciones sanitarias asistivas: HealthBench Professional sugiere utilidad en resumen de historiales y apoyo a la decisión, siempre con supervisión humana y validación regulatoria.
- Análisis financiero y de materiales: el autor reporta mejoras en dominios especializados de finanzas y ciencia de materiales, aprovechables en extracción de datos de informes y revisión de literatura técnica.
- Despliegue en clústeres Hopper/Blackwell: recetas verificadas en 8×H200 (TP8+EP8) y 4×GB300 (TP4+EP4) con SGLang, y en 8 GPUs con vLLM, lo que facilita su uso en entornos de producción a gran escala.

## Benchmarks y rendimiento

El autor menciona evaluación en Terminal-Bench 4.0, SWE-bench Pro, FrontierSWE, GDPVal-AA V2.1, Automationbench, MCP-Atlas, SkillsBench, HealthBench Professional y benchmarks de finanzas y ciencia de materiales, pero los resultados numéricos se presentan únicamente en imágenes dentro de la model card y no están disponibles como texto en la información proporcionada.

No se han publicado resultados de benchmarks en formato numérico en la información disponible.

## Requisitos de hardware

- Pesos publicados en FP8 con un tamaño de repositorio de 573,8 GB; se requiere un mínimo de ~574 GB de VRAM agregada solo para los pesos, más caché KV y overhead.
- Despliegue de referencia del autor: 8×H200 con tensor parallelism 8 y expert parallelism 8 en SGLang; alternativa en 4×GB300 con TP4+EP4.
- vLLM: receta con `--tensor-parallel-size 8`, `--enable-expert-parallel`, `--mamba-cache-mode align` y decodificación especulativa MTP con 3 tokens.
- Recetas verificadas para H200, GB300, H800, H100 y B200 según el cookbook de SGLang.
- No cabe en GPUs de consumo (RTX 4090, 5090, etc.) por el tamaño de los pesos; se necesitan nodos multi-GPU de centro de datos.
- Opciones de despliegue: SGLang (recomendado, imagen `lmsysorg/sglang:dev-ling-3.1-flash`), vLLM (rama `vllm` del repositorio, instalación editable con `VLLM_USE_PRECOMPILED=1`), y OpenRouter como servicio alojado.
- Throughput y latencia: la información disponible solo indica una mejora de ~10% en decode batch-1 con las optimizaciones de Hopper; no se publican cifras absolutas de tokens/s.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos numéricos de benchmarks ni de especificaciones de modelos comparables que permitan una comparación rigurosa. A continuación se recogen únicamente los datos objetivos disponibles del modelo frente a lo que se conoce de forma general de la categoría:

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Ling-3.1-flash | 560B / 25B | 1M | MIT | safetensors (fp8) |
| Alternativas de la misma categoría (MoE de gran escala con contexto largo) | no disponible | no disponible | no disponible | no disponible |

No disponible comparativa numérica con modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluaciones de seguridad o alineación en la información disponible.
- Riesgo de alucinación inherente a modelos generativos; no se publican tasas de factualidad ni evaluaciones de calibración.
- Idiomas soportados no especificados: no hay garantía documentada de calidad multilingüe fuera de los idiomas de entrenamiento, que no se detallan.
- El contexto de 1M tokens implica un coste de caché KV elevado; en la práctica se requiere gestión de caché (HiCache/Mooncake L3 en SGLang, `--mamba-cache-mode align` en vLLM) y planificación de memoria.
- Requiere `trust_remote_code` y código personalizado (`bailing_hybrid`), lo que añade superficie de auditoría y dependencia de versiones concretas de SGLang/vLLM (ramas de desarrollo, no necesariamente estables).
- Licencia MIT: permite uso comercial sin restricciones documentadas, pero conviene verificar las licencias de dependencias y del tokenizador/datos asociados.
- El harness LingCode no está liberado como open source en el momento de la información; su disponibilidad futura no está garantizada.
- No se documentan capacidades multimodales (visión/audio); no debe asumirse su disponibilidad.
- El tamaño de 573,8 GB en FP8 limita el despliegue a clústeres multi-GPU; no es viable en hardware de consumo ni en una única GPU de centro de datos convencional.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/Ling-3.1-flash
- Organización en Hugging Face: https://huggingface.co/inclusionAI
- ModelScope: https://modelscope.cn/organization/inclusionAI
- OpenRouter: https://openrouter.ai/inclusionai/ling-3.1-flash
- Cookbook de SGLang para Ling-3.1-flash: https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.1-flash
- Repositorio de vLLM (rama `vllm`): https://github.com/vllm-project/vllm
