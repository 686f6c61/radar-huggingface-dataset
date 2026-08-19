# FTK11558/Qwen3.8-27B-APS

## Resumen

El modelo FTK11558/Qwen3.8-27B-APS es una variante modificada del Qwen3.8-27B, un modelo de lenguaje multimodal de 27 000 millones de parámetros desarrollado originalmente por Alibaba Qwen. Esta versión concreta ha sido sometida a una técnica de «Adaptive Probe-based Steering» (APS) que, según su autor, altera el comportamiento del modelo para lograr más del 90 % en el benchmark StrongReject, un indicador de rechazo de contenido dañino. El modelo base Qwen3.8-27B es un modelo denso con arquitectura híbrida que combina Gated DeltaNet y Gated Attention, con un contexto nativo de 262 144 tokens extensible a 1 millón, y capacidades de visión-lenguaje (imágenes y vídeos). Esta versión APS se distribuye bajo licencia Apache 2.0 y está pensada para su uso con transformers, vLLM, SGLang y otras herramientas compatibles.

El modelo base Qwen3.8-27B fue lanzado por Qwen en agosto de 2026, 11 días después del Qwen3.8-Max, y representa una evolución de la serie Qwen3.5/3.6 con mejoras en codificación, trabajo profesional, investigación y tareas agénticas de largo alcance. La versión APS, sin embargo, es una modificación externa creada por el usuario FTK11558, no un lanzamiento oficial de Qwen, y su propósito declarado es «romper» el comportamiento de seguridad del modelo mediante técnicas de steering. Esta ficha describe tanto el modelo base como la modificación APS, señalando las diferencias y advertencias relevantes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; hibrida: Gated DeltaNet + Gated Attention + FFN, con MTP (Multi-Token Prediction) |
| Parametros totales | 27 357 373 743 (27,36 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 000 000 |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors; se mencionan quants FP8 y NVFP4 para el modelo base en otra coleccion) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

Nota: el modelo base Qwen3.8-27B tiene una arquitectura detallada en la model card: 64 capas, hidden dimension 5120, token embedding 248 320 (padded), 48 cabezas de atencion lineal para V y 16 para QK, 24 cabezas de atencion para Q y 4 para KV, head dimension 256, RoPE dimension 64, FFN intermediate 17 408, LM output 248 320.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura hibrida que combina capas de atencion lineal (Gated DeltaNet) con capas de atencion clasica (Gated Attention). La disposicion es de 16 bloques, cada uno compuesto por 3 sub-bloques de (Gated DeltaNet → FFN) seguidos de 1 sub-bloque de (Gated Attention → FFN). Esta mezcla permite un equilibrio entre eficiencia computacional y capacidad de atencion a largas distancias. El modelo incluye un codificador de vision para procesar imagenes y videos, y soporta Multi-Token Prediction (MTP) durante el entrenamiento, lo que mejora la eficiencia de inferencia.

El entrenamiento del modelo base se realizo en dos fases: pre-entrenamiento y post-entrenamiento, con tecnicas de alineacion no especificadas en la informacion disponible. La version APS, por su parte, es un ajuste posterior mediante Adaptive Probe-based Steering, una tecnica que utiliza sondas (probes) para identificar y modificar representaciones internas del modelo, con el objetivo de alterar su comportamiento de seguridad. El autor indica que el modelo «roto» logra mas del 90 % en StrongReject, un benchmark que evalua la tasa de rechazo de prompts daninos, aunque el significado exacto de «roto» en este contexto no esta claro (podria significar que rechaza demasiado, o que ha sido manipulado para fallar en ciertos escenarios).

## Capacidades

- Generacion de texto y razonamiento: el modelo base es capaz de tareas de codificacion, trabajo profesional, investigacion y razonamiento complejo.
- Comprension multimodal: procesa imagenes y videos, incluyendo diagramas STEM, documentos y videos de larga duracion.
- Control de razonamiento: modo de pensamiento activado por defecto, desactivable por peticion; profundidad ajustable mediante `reasoning_effort`; retencion de contexto de razonamiento historico mediante `preserve_thinking`.
- Agentes y tareas de largo alcance: planificacion autonoma, manejo de feedback del entorno y ejecucion de tareas multi-paso.
- Tool calling / function calling: no se especifica explicitamente, pero el modelo base es compatible con entornos ageticos y se menciona soporte para herramientas integradas en la version alojada de Qwen Cloud.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- La version APS: segun el autor, ha sido modificada para lograr altas puntuaciones en StrongReject, lo que sugiere un comportamiento alterado en cuanto a rechazo de contenido danino.

## Casos de uso

- Asistente de codificacion en entornos de desarrollo: el modelo base puede generar, revisar y depurar codigo, con soporte para contextos largos (hasta 262k tokens) que permiten mantener proyectos completos en la ventana de contexto.
- Analisis de documentos tecnicos y cientificos: gracias a su capacidad de vision, puede interpretar diagramas, graficos y tablas en PDFs o imagenes, util para investigacion y documentacion.
- Automatizacion de tareas ageticas en produccion: el modelo puede planificar y ejecutar secuencias de acciones, integrandose con herramientas externas mediante function calling, aunque esta capacidad no esta confirmada en la documentacion.
- Procesamiento de video para analisis de contenido: la comprension de videos de hasta una hora permite aplicaciones como resumen de reuniones, vigilancia inteligente o analisis de material audiovisual.
- Chat conversacional con control de razonamiento: en modo de pensamiento desactivado, puede responder de forma directa y rapida; con razonamiento activado, ofrece explicaciones mas profundas.
- Investigacion en seguridad de IA: la version APS podria utilizarse para estudiar como las tecnicas de steering afectan al comportamiento de rechazo de contenido, aunque su uso en produccion no es recomendable.

Nota: la version APS no es adecuada para uso general en produccion, ya que su comportamiento ha sido deliberadamente modificado y no esta claro su funcionamiento seguro.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativos, pero solo se muestra la primera fila (Agentic terminal coding - Terminal Bench 2.1). Los valores numericos no estan visibles en la informacion proporcionada. No se pueden extraer datos concretos de rendimiento. Se indica que el modelo base Qwen3.8-27B se compara con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero sin los numeros no es posible presentar una tabla completa.

No se han publicado resultados de benchmarks completos en la informacion disponible. La tabla esta truncada y no se pueden extraer valores numericos.

## Requisitos de hardware

- El modelo tiene 27,36 mil millones de parametros en FP32 (54,7 GB en safetensors). Para inferencia en FP16/BF16 se necesitan aproximadamente 55-60 GB de VRAM, lo que requiere una GPU profesional como A100 (80 GB), H100 (80 GB) o similar.
- Con cuantizacion a 8 bits (FP8) se puede reducir a ~28-30 GB, permitiendo su uso en GPUs como RTX 4090 (24 GB) no es suficiente, se necesitaria al menos 32 GB (A6000, L40S, etc.). Con cuantizacion de 4 bits (NVFP4) podria caber en ~14-15 GB, habilitando tarjetas como RTX 3090/4090 (24 GB) o incluso RTX 4070 Ti (12 GB) con riesgo de OOM.
- No se especifican requisitos exactos de VRAM en la informacion proporcionada. Se recomienda consultar la documentacion de vLLM o SGLang para estimaciones precisas.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Hugging Face Transformers. Tambien se menciona compatibilidad con Ollama (no confirmado en la documentacion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El modelo base Qwen3.8-27B compite con otros modelos de ~27-30B parametros como:

- Qwen3.6-27B (anterior version de Qwen)
- Muse Glimmer-30B (Meta Superintelligence Labs, modelo agetico de 30B)
- Qwen3.7-Plus (modelo mas grande, posiblemente propietario)
- Opus4.6 Max (no identificado)

La model card incluye una tabla comparativa, pero los valores no estan disponibles. Se puede comparar arquitectura y contexto:

| Modelo | Parametros | Contexto | Multimodal | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262k (ext. 1M) | Si (vision) | Apache 2.0 |
| Qwen3.6-27B | 27B | No especificado | No especificado | No especificada |
| Muse Glimmer-30B | 30B | No especificado | No especificado | Open (segun Meta) |

La version APS no es comparable directamente con otros modelos porque es una modificacion de seguridad.

## Limitaciones y advertencias

- La version APS ha sido modificada deliberadamente mediante Adaptive Probe-based Steering para alterar su comportamiento de rechazo de contenido. No se recomienda su uso en produccion sin una evaluacion exhaustiva de seguridad.
- El autor indica que el modelo logra mas del 90 % en StrongReject, pero no se especifica si esto significa un rechazo excesivo (falsos positivos) o una falla en el rechazo (falsos negativos). Esto introduce incertidumbre sobre su comportamiento real.
- El modelo base Qwen3.8-27B es un lanzamiento oficial de Qwen, pero la version APS es una modificacion de terceros, sin garantias de calidad ni soporte.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de idioma en la documentacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero la modificacion APS podria tener implicaciones legales o eticas si se utiliza para evadir medidas de seguridad.
- El modelo base tiene un contexto de 262k tokens, pero el uso de contextos muy largos puede degradar el rendimiento y aumentar el consumo de memoria.

## Enlaces

- HuggingFace del modelo APS: https://huggingface.co/FTK11558/Qwen3.8-27B-APS
- Paper de APS: https://arxiv.org/abs/2605.20286 (referenciado en la model card)
- Plugin de vLLM para APS: https://github.com/fhdnskfbeuv/AdaptiveProbeSteering/tree/main/vllm_steered_plugins
- Articulo de Yottalabs sobre Qwen 3.8 27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Pagina de OpenLM.ai sobre Qwen3.8: https://openlm.ai/qwen3.8/
- Coleccion HuggingFace con quants del modelo base: https://huggingface.co/collections/huginnfork/qwen38-27b
- AI Release Tracker: https://aireleasetracker.com/model/qwen/qwen3.8-27b
- Blog de Meta sobre Muse Glimmer: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
