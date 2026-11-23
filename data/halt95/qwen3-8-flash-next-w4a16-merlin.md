# halt95/Qwen3.8-Flash-Next-W4A16-Merlin

## Resumen

Qwen3.8-Flash-Next-W4A16-Merlin es una compilación cuantizada a 4 bits del modelo multimodal Qwen3.8-Flash-Next, un mixture-of-experts (MoE) de Qwen con 123.958.298.771 parámetros totales y 6.000 millones activos por token, que incorpora visión. La versión original ocupa 335 GiB; esta build reduce el peso a 115 GiB mediante cuantización selectiva, permitiendo servir el contexto completo de 262.144 tokens en cuatro GPU de 24 GB (RTX 3090 en las mediciones publicadas).

El trabajo lo firma halt95, autor del motor de inferencia Merlin, un fork de vLLM 0.33.0 optimizado para arquitecturas Ampere y Ada. La relevancia inmediata es económica: un modelo MoE de 125B con visión y ventana de 262K queda al alcance de hardware consumer de gama alta (cuatro RTX 3090), algo que el checkpoint BF16 original no permite. La build combina expertos enrutados INT4 g128 (procedentes de la release AutoRound de Intel), tabla de embeddings n-gram (PLE) de 51B parámetros en FP8 alojada en RAM del host, proyecciones DeltaNet en INT8 por canal y atención, torre de visión, routers y capas compartidas en BF16.

Incluye decodificación especulativa mediante cabezas MTP draft cuantizadas INT4, caché KV FP8 E4M3 con escalas estáticas calibradas para 262K y un pool KV de 924.993 tokens en VRAM. El repositorio ocupa 123,8 GB y acumula 1.131 descargas y 23 likes desde su publicación en septiembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida, Gated DeltaNet, QSA indexer, torre de visión y cabezas MTP para decodificación especulativa |
| Parámetros totales | 123.958.298.771 (123,96B) |
| Parámetros activos | 6B por token |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantización | W4A16: expertos enrutados INT4 g128, tabla n-gram (PLE) de 51B en FP8, proyecciones DeltaNet QKV/Z y salida INT8 por canal, resto en BF16; KV cache FP8 E4M3 |
| Idiomas soportados | Inglés (declarado en la model card; resto no disponible) |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`, etiquetada como `other`) |
| Formato de pesos | safetensors (17 shards principales + 10 shards PLE FP8 + shard MTP INT4 + tensores extra), `compressed-tensors` |
| Librería de inferencia | vLLM (fork Merlin 3.0.2.2, basado en vLLM 0.33.0) |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 123,8 GB (checkpoint servible: 115 GiB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE con 512 expertos enrutados por capa y 6B parámetros activos por token, combinado con capas de atención híbrida: Gated DeltaNet (atención lineal con proyecciones QKV/Z y salida cuantizadas INT8 por canal), un indexador QSA para atención dispersa sobre contexto largo y pesos de residual con compuerta. La torre de visión permanece en BF16, igual que routers, normas, embeddings, `lm_head`, expertos compartidos y capas no-expertas de las cabezas MTP. La tabla de embeddings n-gram (PLE) de 51B parámetros se cuantiza a FP8 y se mantiene en RAM del host en tiempo de servicio, no en VRAM.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO en el modelo base. La innovación técnica destacable de esta build es la combinación de decodificación especulativa con cabezas MTP draft cuantizadas INT4 (empaquetadas in situ), caché KV FP8 E4M3 con escalas estáticas calibradas para 262K (`qsa_kv_scales_262k.json`) y un motor (Merlin) que gestiona el pool KV íntegramente en VRAM mientras externaliza la tabla n-gram a RAM del host. La plantilla de chat servida por defecto es la versión corregida de Froggeric (v22.5); la plantilla original de Qwen se incluye sin modificar.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 262.144 tokens.
- Comprensión de imagen y texto (pipeline `image-text-to-text`, torre de visión en BF16).
- Razonamiento con modo "thinking" configurable (la model card cita effort medium como valor por defecto del servidor).
- Decodificación especulativa mediante cabezas MTP draft INT4, que acelera la generación autoregresiva.
- Soporte de sesiones concurrentes largas: tres sesiones de 262K simultáneas caben en el pool KV medido.
- Servicio multiagente: ocho conversaciones de 16K con seguimientos simultáneos de 512 tokens.
- Idiomas: inglés declarado; cobertura multilingüe adicional no disponible.
- Tool calling y function calling: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de documentación técnica con contexto largo: el modelo puede ingerir prompts de hasta 262K tokens (la medición de prefill usa uno de 101.845 tokens) para responder sobre repositorios completos o manuales extensos, manteniendo el pool KV en VRAM.
- Análisis de imágenes en flujos de trabajo: al ser image-text-to-text, permite extraer información de capturas, diagramas o documentos escaneados y continuar la conversación en texto dentro del mismo contexto.
- Despliegue multiagente en un solo nodo: ocho conversaciones de 16K con seguimientos simultáneos a 640 tok/s agregados (thinking activado) lo hacen adecuado para orquestadores de agentes que atienden varios usuarios en paralelo.
- Razonamiento sobre código y especificaciones extensas: con 6B parámetros activos y contexto de 262K, encaja en tareas de revisión de cambios, generación de parches y explicación de arquitecturas a partir de múltiples ficheros concatenados.
- Servicio de inferencia en hardware consumer: cuatro RTX 3090 de 24 GB bastan para servir el checkpoint a contexto completo, lo que habilita entornos de laboratorio o startups sin clústeres A100/H100.
- Evaluación comparativa de cuantizaciones: al derivar de la release AutoRound de Intel y de la tabla PLE de RadixArk, sirve como referencia para medir el impacto de W4A16 + FP8 KV frente a BF16 en tareas de calidad.
- Prototipado de pipelines multimodales con vLLM: el fork Merlin expone perfiles para RTX 4090, tarjetas workstation de 48 GB, A100 y CMP 170HX, facilitando migrar el mismo checkpoint entre GPUs Ampere y Ada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card aporta métricas de rendimiento del motor, medidas en 4× RTX 3090 sin NVLink a 220 W, P2P activado, con Merlin 3.0.2.1 (vLLM 0.33.0) y verificadas por muestreo en 3.0.2.2:

| Métrica | Valor medido | Condiciones |
|---|---|---|
| Decode (una stream) | 191,4–200,3 tok/s (mediana de 3 envíos) | 261.888 tokens de prompt + 128 de salida, thinking on (effort medium) |
| Prefill | 7.036 tok/s | Prompt frío de 101.845 tokens |
| Agentes concurrentes | 640 tok/s agregados | Ocho conversaciones de 16K + ocho seguimientos de 512 tokens, thinking on |
| Pool KV en VRAM | 924.993 tokens | FP8, íntegramente en VRAM |
| Sesiones de 262K simultáneas | 3 | Ejecución 3.0.0, 2026-10-20 |

## Requisitos de hardware

- VRAM estimada: 115 GiB de checkpoint servible repartidos en cuatro GPU de 24 GB; la tabla PLE FP8 de 47,7 GiB se carga en RAM del host, no en VRAM.
- GPU validadas: 4× RTX 3090 (Ampere, sm86) sin NVLink, a 220 W, con P2P activado y upgrade de host "gpu-unlock".
- Perfiles adicionales del motor: RTX 4090 y tarjetas workstation de 48 GB (Ada, en pruebas o sin validar), A100 y CMP 170HX (Ampere).
- Consumer GPU: sí, en RTX 3090 (cuatro unidades). No cabe en una sola GPU consumer de 24 GB por el tamaño del checkpoint, aunque el pool KV y el contexto completo exigen el conjunto de cuatro.
- Despliegue: Merlin 3.0.2.2 (fork de vLLM 0.33.0) con librería `vllm`; llama.cpp, Ollama y TGI no están indicados como soportados en la información disponible.
- Latencia y throughput: decode de 191,4–200,3 tok/s a 262K con speculative decoding (la tasa varía según el texto), prefill de 7.036 tok/s en 100K y 640 tok/s agregados para ocho agentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-W4A16-Merlin (esta ficha) | 123,96B | 6B | 262K | W4A16 + FP8 KV | Qwen Community 1.0 | Hugging Face, requiere Merlin/vLLM fork |
| Qwen/Qwen3.8-Flash-Next (base) | 123,96B | 6B | 262K | BF16 | Qwen Community 1.0 | Hugging Face, 335 GiB |
| Intel/Qwen3.8-Flash-Next-W4A16-AutoRound | 123,96B | 6B | 262K | W4A16 (AutoRound) | Qwen Community 1.0 | Hugging Face |
| RadixArk/Qwen3.8-Flash-Next-NVFP4 | 123,96B | 6B | 262K | NVFP4 (tabla PLE) | Qwen Community 1.0 | Hugging Face |

Las tres alternativas comparten el mismo modelo base y tamaño; difieren en el esquema de cuantización, el formato de la tabla PLE y el motor de servicio. No hay datos de benchmarks de calidad publicados para establecer una comparación de rendimiento entre ellas.

## Limitaciones y advertencias

- Idiomas: solo inglés declarado en la model card; el rendimiento en castellano no está documentado.
- Licencia Qwen Community 1.0: revisar las condiciones antes de uso comercial; la model card la etiqueta como `other`, no como licencia permisiva estándar.
- Dependencia de un fork: el checkpoint está empaquetado para Merlin 3.0.2.2 (fork de vLLM 0.33.0); no se garantiza compatibilidad con vLLM upstream, llama.cpp, Ollama o TGI.
- Hardware específico: las mediciones se hicieron en Ampere (sm86) con cuatro RTX 3090; los perfiles Ada están "en pruebas o sin validar", por lo que el rendimiento en RTX 4090 o GPUs de 48 GB no está confirmado.
- Cuantización agresiva: expertos INT4 g128, DeltaNet INT8 y KV FP8 pueden degradar la calidad frente al BF16 original; no hay benchmarks publicados que cuantifiquen esa pérdida.
- Riesgo de alucinación: no documentado en la información disponible; aplican las precauciones habituales de un modelo generativo sin datos de evaluación publicados.
- Sesgos: no documentados en la información disponible.
- Plantilla de chat: Merlin sirve por defecto la plantilla corregida de Froggeric (v22.5), no la de Qwen; conviene verificar la coherencia con el tokenizador en despliegues propios.
- Contexto largo: la ventana de 262K exige el pool KV completo en VRAM; reducir el número de sesiones concurrentes o la longitud efectiva afecta directamente al throughput medido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/halt95/Qwen3.8-Flash-Next-W4A16-Merlin
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor Merlin: https://github.com/halt95/merlin-engine
- Bench card 2026-11-12: https://github.com/halt95/merlin-engine/blob/main/models/flash-next/benchmarks/2026-11-12/BENCH-CARD.md
- Bench card 3.0.2.2 (2026-11-21): https://github.com/halt95/merlin-engine/blob/main/models/flash-next/benchmarks/2026-11-21/BENCH-CARD.md
- Release AutoRound de Intel: https://huggingface.co/Intel/Qwen3.8-Flash-Next-W4A16-AutoRound
- Release NVFP4 de RadixArk: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Plantillas de chat corregidas de Froggeric: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Discord del proyecto: https://discord.gg/jVDYAwdGzt
- Ko-fi del autor: https://ko-fi.com/halt95
- Licencia: https://huggingface.co/halt95/Qwen3.8-Flash-Next-W4A16-Merlin/blob/main/LICENSE
