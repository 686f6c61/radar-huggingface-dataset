# rapid-mlx/Qwen3.8-Flash-Next-4bit

## Resumen

Qwen3.8-Flash-Next-4bit es una cuantización de 4 bits en formato MLX del modelo Qwen3.8-Flash-Next, publicada por el proyecto Rapid-MLX para su ejecución en Apple Silicon. El modelo base es un transformer de tipo mixture-of-experts (MoE) con aproximadamente 180.000 millones de parámetros totales (unos 125.000 millones no de embedding más un embedding n-gram/PLE de 51.000 millones) y unos 6.000 millones de parámetros activados por token, distribuidos en 512 expertos (10 enrutados más 1 compartido) a lo largo de 48 capas. Su contexto nativo alcanza los 262.144 tokens.

El artefacto publicado empaqueta los pesos cuantizados: cada elemento `U32` de los safetensors contiene ocho pesos de 4 bits, de ahí que el Hub muestre una insignia de "30B" que es un artefacto del formato empaquetado y no el tamaño real del modelo. El repositorio ocupa aproximadamente 104,7 GB en 28 shards y requiere entre 103 y 105 GB de memoria unificada activa durante el servicio.

Su relevancia es doble: por un lado, permite ejecutar un modelo MoE de escala frontier en hardware de consumo profesional de Apple (Mac Studio con memoria unificada de 128 a 256 GB); por otro, Rapid-MLX publica mediciones de rendimiento reproducibles sobre M3 Ultra con 256 GB, incluyendo una ruta opcional de decodificación especulativa con multi-token prediction (MTP) nativo que eleva el throughput de generación entre un 36 % y un 42 %. El estado del artefacto es experimental y solo texto en Rapid-MLX 0.13.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: Gated DeltaNet + atención dispersa (sparse attention), 48 capas, 512 expertos (10 enrutados + 1 compartido) |
| Parametros totales | ~179,9B pesos cuantizados (22,49B elementos U32 × 8) + 7,36B elementos BF16; ~180B totales en el modelo base (~125B no-embedding + ~51B embedding n-gram/PLE) |
| Parametros activos | ~6B por token |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | 4 bits afín mixta (mixed 4-bit affine); pesos empaquetados 8 por elemento U32, escalas y sesgos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en el Hub) |
| Formato de pesos | safetensors (formato MLX), 28 shards, ~104,7 GB de repositorio |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida que combina capas Gated DeltaNet (una variante de atención lineal con estado recurrente) con capas de atención dispersa, organizadas en 48 capas. La capa MoE cuenta con 512 expertos, de los cuales 10 son enrutados y 1 es compartido, activando aproximadamente 6.000 millones de parámetros por token sobre un total de unos 180.000 millones. El embedding n-gram/PLE de 51.000 millones de parámetros es una innovación destacable: añade capacidad de representación léxica sin incrementar el coste por token en el camino de cómputo denso.

El checkpoint cuantizado incluye una cabeza MTP (multi-token prediction) nativa de una capa que puede activarse de forma opcional para decodificación especulativa; el modelo objetivo verifica cada token propuesto. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional y finalización de texto (`text-generation`, `conversational`).
- Razonamiento multi-paso y soporte de agentes: la model card documenta integración con OpenCode, Claude Code y Codex mediante `rapid-mlx agents`.
- Decodificación especulativa con MTP nativo (opt-in) para cargas de salida larga como agentes de código.
- Contexto largo nativo de 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- API compatible con OpenAI (`/v1/chat/completions`) y con Anthropic, lo que facilita su integración en herramientas existentes.
- Capacidades multimodales (torre de visión) presentes en el modelo base pero **no habilitadas** en este artefacto: es solo texto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Agentes de código en local sobre Mac: con la cabeza MTP activada (`--speculative-config '{"method":"mtp"}'`), el modelo sostiene entre 28,8 y 34,9 tok/s de decodificación según la longitud del prompt, lo que lo hace viable para bucles de edición de código en herramientas como OpenCode o Claude Code sin salir del equipo.
- Análisis de repositorios y documentos largos: los 262.144 tokens de contexto nativo permiten ingerir bases de código medianas o contratos extensos en una sola pasada; el prefill medido a 32.768 tokens es de 44,7 s con 732,9 tok/s, gracias a la caché de claves comprimida por lotes de la versión 0.13.2.
- Asistente conversacional de contexto amplio: conversaciones multi-turno con historial largo se benefician de la ventana de 262K y de una latencia de primer token de 0,346 s con prompts cortos.
- Procesamiento por lotes de resúmenes y extracción de información: el throughput de prefill (hasta 889,4 tok/s a 2.048 tokens) permite procesar documentos en serie de forma eficiente en un único Mac Studio.
- Desarrollo y evaluación de pipelines de IA sin dependencia de la nube: al exponer endpoints compatibles con OpenAI y Anthropic, se puede apuntar código existente al servidor local en `127.0.0.1:8464` y validar flujos de agentes antes de desplegarlos en infraestructura remota.
- Investigación sobre decodificación especulativa: el checkpoint incorpora una cabeza MTP nativa verificada por el modelo objetivo, lo que permite experimentar con estrategias de especulación (K fijo, controlador de valor esperado) sobre un MoE de gran escala.
- Generación de texto con salida larga (documentación, artículos, informes): la ruta MTP mantiene ganancias de 1,36x a 1,42x en decodificación incluso con prompts de 32.768 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos numéricos son mediciones de rendimiento de inferencia sobre Mac Studio M3 Ultra con 256 GB de memoria unificada, con Rapid-MLX 0.13.2 y el repositorio fijado en la revisión `dcf657e4` (mediana de tres ejecuciones, batch size 1, caché de prefijo en frío, 256 tokens de decodificación solicitados).

| Tokens de prompt | TTFT anterior | TTFT 0.13.2 | Reducción TTFT | Prefill 0.13.2 | Decode 0.13.2 |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 128 (92) | 0,385 s | 0,346 s | 10,1 % | 266,3 tok/s | 25,67 tok/s |
| 2.048 (2.012) | 3,346 s | 2,262 s | 32,4 % | 889,4 tok/s | 24,27 tok/s |
| 8.192 (8.156) | 13,689 s | 9,236 s | 32,5 % | 883,1 tok/s | 23,40 tok/s |
| 32.768 (32.732) | 62,851 s | 44,659 s | 28,9 % | 732,9 tok/s | 21,72 tok/s |

| Tokens de prompt | Decode serie | Decode MTP nativo | Aceleración | TTFT serie | TTFT MTP |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 128 (92) | 25,17 tok/s | 34,85 tok/s | 1,38x (+38,5 %) | 0,393 s | 0,381 s |
| 2.048 (2.012) | 23,64 tok/s | 33,53 tok/s | 1,42x (+41,8 %) | 3,346 s | 3,515 s |
| 8.192 (8.156) | 22,82 tok/s | 32,20 tok/s | 1,41x (+41,1 %) | 13,643 s | 14,581 s |
| 32.768 (32.732) | 21,16 tok/s | 28,82 tok/s | 1,36x (+36,2 %) | 62,844 s | 67,707 s |

La memoria activa de MLX se mantuvo entre 102,8 y 103,8 GB durante las pruebas; el pico histórico del asignador durante la carga y el trabajo de contexto largo fue de 148,1 GB. La memoria RSS del proceso no es una métrica fiable para dimensionar memoria unificada.

## Requisitos de hardware

- Memoria unificada: los pesos ocupan ~99 GB antes de caché de contexto, MTP y margen del asignador; el servicio consume ~103-105 GB de memoria unificada activa de MLX.
- Nivel recomendado: 192 GB de memoria unificada.
- Nivel probado: 256 GB (Mac Studio M3 Ultra); las parrillas completas de 32K en decodificación ordinaria y MTP se completaron sin out-of-memory.
- Nivel mínimo de admisión: 128 GB, no probado físicamente; se espera un margen muy ajustado.
- GPU: exclusivamente Apple Silicon con memoria unificada; no hay soporte documentado para GPU NVIDIA (A100, H100, RTX 4090) en este artefacto.
- Despliegue: servidor Rapid-MLX (`rapid-mlx serve`), instalable vía `curl -fsSL https://rapidmlx.com/install.sh | bash` o `pip install -U 'rapid-mlx>=0.13.2'`; también existe aplicación de escritorio con catálogo que admite el modelo a partir de 128 GB. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFT de 0,346 s con prompt corto y 44,659 s con 32.732 tokens; decodificación de 21,7 a 25,7 tok/s en modo serie y de 28,8 a 34,9 tok/s con MTP activado.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Formato / hardware | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-4bit (este) | ~180B | ~6B | 262.144 | MLX 4-bit, Apple Silicon 128-256 GB | qwen-community-1.0 |
| Qwen/Qwen3.8-Flash-Next (base) | ~180B | ~6B | 262.144 | Pesos originales, formato no especificado | qwen-community-1.0 |
| Alternativas de escala similar en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento de este modelo frente a alternativas de la misma categoría. La comparación con el modelo base se limita al formato y al hardware: este artefacto reduce el peso a ~105 GB y lo hace ejecutable en Apple Silicon, a costa de una cuantización de 4 bits y de la desactivación de la torre de visión.

## Limitaciones y advertencias

- Estado experimental: la model card califica el artefacto como experimental y solo texto en Rapid-MLX 0.13.2; la torre de visión del modelo base no está habilitada.
- Requisito de hardware muy restrictivo: 128 GB de memoria unificada como mínimo de admisión y 192 GB recomendados; no es ejecutable en GPU de consumo convencionales ni en la mayoría de equipos Apple.
- El nivel de 128 GB no se ha probado físicamente; el margen de memoria es ajustado y puede provocar out-of-memory con contextos largos o MTP activo.
- La insignia de "30B parámetros" del Hub es un artefacto del empaquetado de pesos en U32 y no refleja el tamaño real; puede inducir a error en la planificación de recursos.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican las precauciones habituales en producción.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Cobertura de idiomas: no disponible; no se puede confirmar el soporte del castellano ni de otras lenguas.
- Soporte de tool calling: no documentado; la integración con agentes se describe a nivel de herramienta (OpenCode, Claude Code, Codex), no de API de funciones.
- Licencia qwen-community-1.0: es una licencia comunitaria con posibles restricciones de uso comercial; es necesario revisar el archivo `LICENSE` antes de un despliegue en producción.
- El rendimiento medido corresponde exclusivamente a un Mac Studio M3 Ultra con 256 GB; los números en configuraciones de 128 o 192 GB no están publicados.
- La ruta MTP está desactivada por defecto y su beneficio depende del perfil de carga: es más útil cuando domina la generación y menos en cargas de prefill largo con respuestas cortas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rapid-mlx/Qwen3.8-Flash-Next-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio Rapid-MLX: https://github.com/raullenchai/Rapid-MLX
- Instalación de Rapid-MLX: https://rapidmlx.com/install.sh
- Documentación de agentes: https://rapidmlx.com/docs/agents
- Descarga de la aplicación de escritorio: https://rapidmlx.com/download
