# halt95/Qwen3.8-Flash-Next-W4A16-Merlin

## Resumen

Qwen3.8-Flash-Next-W4A16-Merlin es una compilación cuantizada a 4 bits del modelo Qwen3.8-Flash-Next, un mixto de expertos (MoE) de Qwen de 125.000 millones de parámetros con 6.000 millones activos por token y capacidad de visión. La publica el usuario independiente halt95 y su objetivo es hacer viable el contexto completo de 262.144 tokens en cuatro GPU de 24 GB, algo imposible con los pesos originales de 335 GiB. El resultado son 115,3 GiB de checkpoint que se sirven con Merlin, un fork de vLLM 0.33.0 optimizado para arquitecturas Ampere y Ada.

La relevancia de esta ficha está en su enfoque de despliegue: en lugar de recortar contexto o calidad, mueve componentes concretos a formatos de menor precisión (expertos enrutados a INT4, tabla de embeddings n-gram de 51.000 millones de parámetros a FP8 en RAM de host) y mantiene en BF16 la atención, las normas, el torre de visión y el experto compartido. Esto permite ejecutar un modelo de 125B con visión y decodificación especulativa en hardware de consumo profesional como cuatro RTX 3090.

El modelo base es de Qwen y la licencia aplicada es Qwen Community 1.0, con las restricciones que ello implica. La model card reporta cifras medidas de rendimiento en hardware concreto (4× RTX 3090 sin NVLink a 220 W), lo que conviene tratar como referencia de laboratorio y no como garantía en otros entornos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixto de expertos (MoE) con visión; transformer con capas Gated DeltaNet, MTP y decodificación especulativa |
| Parametros totales | 123.958.298.771 (≈124B) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W4A16 (expertos enrutados INT4 g128), INT8 por canal (proyecciones DeltaNet), FP8 (tabla n-gram), BF16 (atención, normas, embeddings, lm_head, experto compartido, routers, torre de visión); KV cache FP8 E4M3 con escalas estáticas calibradas |
| Idiomas soportados | Inglés (según la model card; no se detallan otros idiomas) |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (17 shards principales + shards PLE FP8 + shard MTP INT4 + tensores extra) |

## Arquitectura y entrenamiento

El modelo base es un MoE de Qwen con 512 expertos enrutados por capa y 6B de parámetros activos por token, e incorpora visión mediante un torre de imágenes. La arquitectura combina atención con capas Gated DeltaNet (proyecciones QKV/Z y salida en INT8 por canal en esta versión), una tabla de embeddings n-gram (PLE) de 51.000 millones de parámetros y cabezas MTP (multi-token prediction) para decodificación especulativa. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La aportación de esta compilación es la cuantización selectiva: los expertos enrutados provienen de la release AutoRound de Intel (INT4 g128), las cabezas MTP se empaquetan en INT4 in situ, la tabla n-gram se guarda en FP8 y se carga en RAM de host en tiempo de servicio, y el resto de componentes críticos para la calidad se mantienen en BF16. El motor Merlin (fork de vLLM 0.33.0) gestiona esta disposición híbrida y mantiene toda la caché KV en VRAM. La model card no especifica detalles del proceso de calibración más allá de las escalas estáticas del KV cache (`qsa_kv_scales_262k.json`).

## Capacidades

- Generación de texto y razonamiento con modo "thinking" configurable (la model card menciona esfuerzo medio como valor por defecto del servidor).
- Procesamiento de imagen y texto (`image-text-to-text`): el pipeline declarado incluye visión.
- Decodificación especulativa mediante cabezas MTP, que acelera la generación.
- Contexto largo de hasta 262.144 tokens, con soporte de múltiples sesiones simultáneas de contexto completo (tres sesiones de 262K retenidas a la vez según la model card).
- Conversación multi-turno y escenarios de agentes: la model card reporta ocho conversaciones de 16K tokens y ocho seguimientos simultáneos de 512 tokens.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: la model card solo declara inglés; no hay datos de otros idiomas.
- Cuantización W4A16 con KV cache FP8, orientada a despliegue en GPU Ampere (sm86) y perfiles para Ada.

## Casos de uso

- Asistencia conversacional de contexto largo: con 262.144 tokens de ventana, el modelo puede mantener conversaciones multi-turno con documentos extensos o historiales completos sin truncar, algo útil en atención al cliente especializada o soporte técnico.
- Análisis de documentos e imágenes combinados: al ser `image-text-to-text`, permite extraer información de capturas, diagramas o documentos escaneados junto a texto, por ejemplo en revisión de contratos o informes con figuras.
- Agentes autónomos con múltiples pasos: la model card reporta ocho conversaciones simultáneas de 16K tokens y seguimientos concurrentes, lo que encaja en orquestación de agentes que mantienen estado largo.
- Procesamiento por lotes de prompts largos: la cifra de prefill de 7.036 tok/s en un prompt de 100K sugiere viabilidad para tareas de resumen o extracción sobre documentos de decenas de miles de tokens.
- Despliegue en hardware de consumo profesional: al caber en cuatro RTX 3090 de 24 GB, permite montar un servicio de inferencia de un modelo de 125B con visión sin recurrir a A100/H100.
- Investigación y evaluación de cuantización: sirve como banco de pruebas para estudiar el impacto de INT4/FP8 selectivo en calidad y latencia frente al modelo base en BF16.
- Generación de código en pipelines: aunque la model card no lo confirma explícitamente, un MoE de 6B activos con contexto largo es adecuado para autocompletado y revisión de código en repositorios grandes; conviene validar la calidad en código antes de producción.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Sí reporta métricas de rendimiento medidas en 4× RTX 3090 sin NVLink a 220 W con Merlin 3.0.2.1:

| Metrica | Valor reportado |
|---|---|
| Decodificacion (1 stream, thinking on, 261.888 tokens de prompt + 128 de salida) | 191,4–200,3 tok/s (mediana de 3 envios) |
| Prefill (prompt frio de 101.845 tokens) | 7.036 tok/s |
| Agentes (8 conversaciones de 16K + 8 seguimientos de 512 tokens) | 640 tok/s totales |
| Pool KV en VRAM | 924.993 tokens |
| Sesiones de 262K simultaneas | 3 |

No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint completo ocupa 115,3 GiB; la model card lo ejecuta en 4× RTX 3090 (96 GB de VRAM) manteniendo la tabla n-gram de 47,7 GiB en RAM de host y el KV cache FP8 en VRAM.
- GPU recomendadas: RTX 3090 (Ampere, sm86) como plataforma medida; la model card menciona perfiles para RTX 4090, tarjetas de estación de trabajo de 48 GB, A100 y CMP 170HX, con perfiles Ada en prueba o sin probar.
- ¿Cabe en GPU de consumo? Sí, en cuatro RTX 3090 de 24 GB; no cabe en una sola GPU de consumo.
- Opciones de despliegue: Merlin 3.0.2.1 (fork de vLLM 0.33.0), que es el motor con el que se publican los pesos y las métricas. No se confirma soporte de llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: ver tabla de benchmarks; las cifras corresponden a la configuración de cuatro RTX 3090 sin NVLink a 220 W con P2P activado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-W4A16-Merlin (esta ficha) | 124B totales, 6B activos | 262.144 | Sí | qwen-community-1.0 | Hugging Face, requiere Merlin |
| Qwen/Qwen3.8-Flash-Next (base) | 125B totales, 6B activos | 262.144 | Sí | qwen-community-1.0 | Hugging Face, pesos BF16 (~335 GiB) |
| Intel/Qwen3.8-Flash-Next-W4A16-AutoRound | 125B totales, 6B activos | No disponible | Sí | qwen-community-1.0 | Hugging Face, cuantización AutoRound de referencia |
| RadixArk/Qwen3.8-Flash-Next-NVFP4 | 125B totales, 6B activos | No disponible | Sí | no disponible | Hugging Face, formato NVFP4 |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La model card solo declara inglés; el rendimiento en castellano u otros idiomas no está documentado y debe validarse empíricamente.
- Riesgo de alucinación inherente a modelos generativos; no hay evaluaciones de fidelidad publicadas para esta cuantización.
- La cuantización INT4 de expertos y FP8 de la tabla n-gram puede degradar la calidad respecto al modelo base en BF16; no se aportan métricas de calidad comparativas.
- Licencia Qwen Community 1.0: revisar las restricciones de uso comercial y las obligaciones de atribución antes de desplegar en producción.
- Dependencia del motor Merlin (fork de vLLM 0.33.0); no se confirma compatibilidad con vLLM estándar, llama.cpp, Ollama o TGI.
- Los perfiles para GPU Ada están en prueba o sin probar; las cifras publicadas corresponden exclusivamente a cuatro RTX 3090.
- El contexto de 262K exige gestionar el pool KV en VRAM (924.993 tokens en la configuración medida); reducirlo afecta al número de sesiones simultáneas.
- La plantilla de chat servida por defecto es la versión corregida de Froggeric (v22.5), no la plantilla original de Qwen incluida en el repositorio; conviene verificar la coherencia en producción.
- No hay información sobre sesgos específicos ni sobre el proceso de alineación del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/halt95/Qwen3.8-Flash-Next-W4A16-Merlin
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Release AutoRound de Intel: https://huggingface.co/Intel/Qwen3.8-Flash-Next-W4A16-AutoRound
- Release NVFP4 de RadixArk: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Plantilla de chat corregida de Froggeric: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Motor Merlin: https://github.com/halt95/merlin-engine
- Bench card de Merlin: https://github.com/halt95/merlin-engine/blob/main/models/flash-next/benchmarks/2026-11-12/BENCH-CARD.md
- Licencia: https://huggingface.co/halt95/Qwen3.8-Flash-Next-W4A16-Merlin/blob/main/LICENSE
- Comunidad Discord: https://discord.gg/jVDYAwdGzt
- Apoyo al autor: https://ko-fi.com/halt95
