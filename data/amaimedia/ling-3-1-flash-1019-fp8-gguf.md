# AMAImedia/Ling-3.1-Flash-1019-FP8-GGUF

## Resumen

Ling-3.1-Flash-1019-FP8-GGUF es una cuantización FP8 en formato GGUF del modelo Ling-3.1-flash-1019, publicado por inclusionAI como versión mejorada de Ling-3.1-flash. Se trata de un modelo de lenguaje de gran escala con arquitectura MoE híbrida-lineal: 560 mil millones de parámetros totales (572,12 mil millones según los metadatos de safetensors del repositorio), de los cuales solo 25 mil millones se activan por token, y una ventana de contexto de 1 millón de tokens. Esta cuantización ha sido publicada por AMAImedia (NOESIS) como parte de su plataforma de automatización de doblaje multilingüe, y se distribuye bajo licencia MIT.

La relevancia del modelo radica en la combinación de tres factores: una eficiencia de inferencia propia de un modelo de 25B activos gracias al enrutado MoE, un contexto extremadamente largo de 1M tokens facilitado por sus capas de atención híbrida (KDA y Gated MLA), y mejoras sustanciales de post-entrenamiento en razonamiento y capacidades agénticas respecto a su predecesor. Con soporte declarado para más de 30 idiomas, incluido el castellano, es una opción interesante para cargas agénticas y de contexto largo, aunque su tamaño total exige hardware de centro de datos para su despliegue completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida-lineal (bailing_hybrid) |
| Parametros totales | 572.120.680.768 (~560B según model card) |
| Parametros activos | 25B por token |
| Longitud de contexto | 1M tokens |
| Tipos de cuantizacion | FP8 (GGUF con imatrix) |
| Idiomas soportados | Más de 30: chino, inglés, ruso, vietnamita, japonés, hindi, español, francés, alemán, portugués, italiano, árabe, coreano, tailandés, indonesio, malayo, bengalí, turco, polaco, ucraniano, neerlandés, checo, sueco, rumano, griego, hebreo, persa, urdu, kazajo, uzbeko, entre otros |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantización FP8 con imatrix), safetensors en el modelo base |

## Arquitectura y entrenamiento

Ling-3.1-flash-1019 emplea una arquitectura MoE híbrida-lineal con 72 capas transformer en total: 63 capas KDA (Kimi Delta Attention, mecanismo de atención lineal) y 9 capas Gated MLA (Multi-head Latent Attention con puerta), en una proporción 7:1. De estas, 4 son capas densas. El modelo cuenta con 512 expertos enrutados más 1 experto compartido, activando 8 expertos por token. La dimensión oculta es de 4096, con tamaño intermedio de experto de 1280 y de capa densa de 10240, y un vocabulario de 157.184 tokens. Esta combinación de capas lineales (KDA) con atención MLA es la que permite gestionar contextos de 1M de tokens con coste subcuadrático en la mayor parte de la red.

Sobre el entrenamiento, la model card no detalla el número de tokens ni la composición del dataset. Sí se indica que la versión 1019 incorpora optimizaciones de post-entrenamiento que mejoran el razonamiento y las capacidades agénticas respecto a Ling-3.1-flash. El despliegue de referencia soporta decodificación especulativa MTP (NEXTN) mediante SGLang, y el modelo incluye un modo de razonamiento conmutable (`enable_thinking`). No hay información disponible sobre RLHF o DPO específicos.

## Capacidades

- Generación de texto conversacional multilingüe en más de 30 idiomas, incluido el español.
- Razonamiento complejo con modo de razonamiento activable (`enable_thinking`), con mejoras medidas en benchmarks científicos como CritPt y SciCode.
- Capacidades agénticas: ejecución de tareas multi-paso, medida en AutomationBench-AA (68%).
- Soporte de tool calling / function calling, verificado en el cookbook de SGLang.
- Contexto ultra-largo de 1M tokens para procesamiento de documentos extensos.
- Mejora en generación de código y razonamiento científico (SciCode: 57%).
- Decodificación especulativa MTP (NEXTN) para acelerar la inferencia en despliegues compatibles.

## Casos de uso

- Procesamiento de documentos extensos: con 1M tokens de contexto, puede analizar libros completos, expedientes legales o bases de código enteras en una sola pasada sin fragmentación.
- Automatización agéntica de flujos de trabajo: su puntuación de 68% en AutomationBench-AA y el soporte de tool calling lo hacen adecuado para agentes que encadenan llamadas a APIs, navegación web y ejecución de tareas multi-paso.
- Atención al cliente automatizada multilingüe: soporta conversaciones multi-turno en más de 30 idiomas con contexto largo, útil para plataformas de soporte internacionales.
- Asistencia en investigación científica y código: las mejoras en CritPt (26%) y SciCode (57%) indican utilidad en razonamiento sobre problemas de física y generación de código científico.
- Automatización de doblaje y localización: el publicador lo integra en una plataforma de doblaje multilingüe, aprovechando su cobertura lingüística amplia.
- Generación de código en producción: compatible con tool calling e integrable en pipelines de CI/CD mediante servidores compatibles con la API de OpenAI (SGLang, vLLM).
- Análisis de conversaciones e historiales largos: la ventana de 1M tokens permite resumir y razonar sobre meses de transcripciones o logs.

## Benchmarks y rendimiento

Datos publicados en la model card (comparativa con su predecesor Ling-3.1-flash):

| Benchmark | Ling-3.1-flash | Ling-3.1-flash-1019 |
|---|---|---|
| AA-Briefcase (Elo) | ~1400 | 1524 |
| AutomationBench-AA | 62% | 68% |
| CritPt | 18% | 26% |
| SciCode | 54% | 57% |
| Artificial Analysis Intelligence Index v4.3.2 | 41 | 44 |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) para esta cuantización FP8 concreta en la información disponible.

## Requisitos de hardware

- El repositorio GGUF FP8 completo pesa 800,6 GB, por lo que la inferencia local completa requiere estaciones multi-GPU o nodos de centro de datos.
- Despliegue de referencia: 8 × H200 con TP8 + EP8 vía SGLang; también verificado en 4 × GB300 (TP4 + EP4), H800, H100 y B200.
- No cabe en GPUs de consumo (RTX 4090, RTX 5090) en su totalidad; se requeriría offload a RAM con llama.cpp, con rendimiento muy limitado dada la cuantización FP8 de 560B.
- Opciones de despliegue: SGLang (recomendado, con imagen day-0 y decodificación especulativa NEXTN), vLLM, y en teoría llama.cpp dado el formato GGUF, aunque sin recetas verificadas publicadas.
- Optimizaciones opcionales en Hopper: `SGLANG_ENABLE_FP8_BLOCK_GEMV=1` y `SGLANG_ENABLE_FUSED_KDA_OUTPUT_QUANT=1`, con ~10% de mejora en decodificación batch-1.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia |
|---|---|---|---|---|
| Ling-3.1-flash-1019 | 560B | 25B | 1M | MIT |
| Qwen3-235B-A22B | 235B | 22B | 256K (con YaRN) | Apache 2.0 |
| DeepSeek-V3 | 671B | 37B | 128K | Licencia propia (MIT para pesos con condiciones) |
| Llama 4 Maverick | 400B | 17B | 1M | Licencia Llama 4 |

Ling-3.1-flash-1019 destaca frente a DeepSeek-V3 por su contexto de 1M tokens y su licencia MIT sin restricciones, y frente a Qwen3-235B por su ventana de contexto mucho mayor, aunque exige hardware más costoso por su tamaño total.

## Limitaciones y advertencias

- Tamaño total de 560B: aunque solo 25B parámetros se activan, el modelo completo debe alojarse en memoria, lo que lo hace inviable para hardware de consumo y eleva el coste de despliegue.
- Cuantización FP8: esta cuantización puede degradar ligeramente la calidad respecto a los pesos BF16 originales; no hay evaluaciones publicadas del impacto en esta versión concreta.
- Riesgo de alucinación: no disponible información específica, aunque como todo LLM generativo debe supervisarse en usos de producción.
- Sesgos conocidos: no documentados en la model card; al ser un modelo entrenado con fuerte componente en chino e inglés, el rendimiento en idiomas de menor presencia puede ser inferior.
- La model card del publicador incluye contenido promocional y de donaciones que no aporta información técnica verificable sobre la cuantización.
- Licencia MIT sin restricciones de uso comercial, pero conviene verificar los términos del modelo base de inclusionAI.
- El soporte de herramientas como llama.cpp para la arquitectura bailing_hybrid puede ser incompleto; SGLang y vLLM son las vías verificadas.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/AMAImedia/Ling-3.1-Flash-1019-FP8-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.1-flash-1019
- GGUF intermedio: https://huggingface.co/AtomicChat/Ling-3.1-flash-1019-GGUF
- Predecesor: https://huggingface.co/inclusionAI/Ling-3.1-flash
- Organización inclusionAI en Hugging Face: https://huggingface.co/inclusionAI
- ModelScope: https://modelscope.cn/organization/inclusionAI
- OpenRouter: https://openrouter.ai/inclusionai/ling-3.1-flash
- Cookbook de SGLang: https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.1-flash
