# grandfso/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-int4-AutoRound-MTP

## Resumen

Esta ficha describe una cuantización int4 del modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, un fine-tune "Heretic" (abliterated) del Qwen3.8-27B de Qwen. El autor de la cuantización es grandfso, que aplica AutoRound en esquema W4A16 (pesos int4, activaciones bf16/fp16) con group size 128 y cuantiza también la cabeza MTP (multi-token prediction) para liberar memoria de caché KV. El resultado es un checkpoint de 19,0 GB con licencia Apache-2.0, pensado para servir con vLLM sobre hardware Intel (probado en una Intel Arc Pro B70 con vLLM-XPU).

El modelo base es multimodal (pipeline image-text-to-text) y combina una torre de visión con un transformer de lenguaje con capas GDN (gated delta net) y decodificación especulativa MTP. La cuantización mantiene en bf16 la torre de visión, los embeddings, el lm_head y los tensores `in_proj_a`/`in_proj_b` de las 48 capas GDN, mientras que el resto de pesos lineales y la cabeza MTP pasan a int4.

La relevancia de esta ficha es doble: por un lado, documenta una receta reproducible de cuantización int4 para un modelo de ~6,28 mil millones de parámetros reales (según safetensors) con soporte de visión y tool calling; por otro, advierte de que el checkpoint fuente está "abliterated", es decir, sin comportamiento de rechazo, lo que exige salvaguardas propias si se expone a terceros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas GDN (gated delta net), cabeza MTP y torre de visión; pipeline image-text-to-text |
| Parámetros totales | 6.284.446.960 (según safetensors); el nombre comercial indica "27B", no confirmado en la información disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (configurado en el servicio de referencia) |
| Tipos de cuantización | int4 weight-only W4A16, simétrica, group size 128; packing `auto_round:auto_gptq`; MTP en int4 por RTN; bf16 conservado en GDN `in_proj_a`/`in_proj_b`, `mtp.fc`, torre de visión, embeddings y `lm_head` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 19,0 GB), librería transformers |

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un entrenamiento nuevo. La arquitectura subyacente combina una torre de visión (mantenida en bf16) con un transformer de lenguaje que incorpora capas GDN (gated delta net) en 48 capas, además de una cabeza MTP usada para decodificación especulativa. El pipeline declarado es image-text-to-text, por lo que el modelo acepta entradas de imagen y texto y genera texto.

La receta de cuantización usa auto-round 0.14.2 sobre torch 2.12.0+xpu y transformers 5.8.0, con esquema W4A16 int simétrico, group size 128, 200 iteraciones, 128 muestras de calibración, seqlen 2048 y el dataset `NeelNanda/pile-10k`, con batch 4 y grad-accum 2 en modo `low_gpu_mem_usage`. El tuning se ejecutó en una Intel Arc Pro B70 durante 302 minutos. La cabeza MTP se cuantizó a int4 por RTN desde los pesos fuente mediante la ruta `missing_tensors` de auto-round. El repositorio incluye `MANIFEST.json` con los pins y recuentos de tensores, y `recipe/bake-autoround.sh` como script exacto de producción, que rechaza cualquier otra revisión del modelo fuente y valida el `quantization_config` resultante contra la referencia. No se dispone de información sobre datos de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional (etiqueta `conversational`).
- Procesamiento de imagen y texto (pipeline image-text-to-text, torre de visión en bf16).
- Razonamiento con niveles de esfuerzo configurables vía `reasoning_effort`: xhigh (por defecto), medium y low.
- Tool calling y function calling: el servicio de referencia usa `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Salida en modo JSON y modo de razonamiento, validados en la evaluación interna de 50 tareas (JSON, herramientas, código, razonamiento).
- Decodificación especulativa MTP con 3 tokens sobre una lista corta de vocabulario de 32k tokens.
- Capacidades multilingües: no disponible en la información proporcionada.
- Comportamiento sin rechazo (abliterated): responde a peticiones que el Qwen3.8 base declina.

## Casos de uso

- Asistencia conversacional multi-turno con contexto largo: con 131.072 tokens de ventana y caché KV en fp8, puede mantener conversaciones extensas o procesar documentos largos sin truncar, y el pool de 197.982 tokens en una sola Arc Pro B70 permite atender varias sesiones simultáneas.
- Automatización de agentes con tool calling: la integración con `qwen3_coder` como parser de herramientas y el modo JSON permiten construir agentes que invocan APIs, consultan bases de datos o ejecutan pasos multi-etapa con salidas estructuradas.
- Generación y revisión de código en pipelines: el modelo fue validado en tareas de código dentro de la evaluación interna de 50 tareas; puede integrarse en flujos de CI/CD para revisión de parches o generación de tests, con la salvedad de que la evaluación es un control de regresión, no un benchmark.
- Procesamiento de documentos con imágenes: al ser image-text-to-text, puede extraer información de capturas, formularios o diagramas combinándola con texto, útil en digitalización y atención al cliente con adjuntos.
- Razonamiento con esfuerzo ajustable: el parámetro `reasoning_effort` permite usar `low` para respuestas rápidas en producción y `xhigh` para tareas analíticas donde la latencia no es crítica.
- Despliegue en hardware Intel: con vLLM-XPU y una Arc Pro B70 se obtienen 72,2 tok/s por petición en concurrencia 1 y 33,8 tok/s con 16 peticiones concurrentes, lo que lo hace viable para entornos con aceleradores Intel en lugar de NVIDIA.
- Investigación sobre alineación y robustez: al ser un modelo abliterated, sirve para estudiar comportamiento sin rechazo, sesgos y riesgos de contenido, siempre en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos son métricas de servicio y una evaluación interna de regresión, comparadas con otra cuantización int4 del mismo modelo fuente (JC1DA/…-INT4-W4A16), sobre la misma pila y el mismo día, en una Intel Arc Pro B70:

| Métrica | Esta cuantización | JC1DA |
|---|---|---|
| Pool de caché KV | 197.982 tokens | 183.317 tokens |
| tok/s por petición, 1 / 4 / 16 concurrentes (respuestas de 300 tokens) | 72,2 / 55,5 / 33,8 | 67,5 / 54,4 / 33,3 |
| Tiempo hasta el primer token, prompt de 4k / 32k / 64k | 1,72 / 18,0 / 46,7 s | 1,77 / 18,2 / 50,2 s |
| Aceptación MTP (acumulada) | 0,70 | 0,72 |
| Evaluación interna de 50 tareas (JSON, herramientas, código, razonamiento), esfuerzo por defecto | 50/50 | 50/50 (dos veces) |
| Evaluación interna de 50 tareas, `reasoning_effort: low` | 49/50 y luego 50/50 | 49/50 |
| Sondas de logits NaN y degeneración, aguja a 100k, 6 peticiones JSON concurrentes | pasa | pasa |
| Soak de 90 minutos a carga sostenida | 750 peticiones, 0 errores | no ejecutado |

El autor indica que la calidad es un empate y que la diferencia de velocidad es pequeña pero consistente, probablemente porque la cabeza MTP en int4 es más ligera que una en bf16, sin aislar la causa. La evaluación interna es un control de regresión, no un benchmark.

## Requisitos de hardware

- VRAM estimada: el repo pesa 19,0 GB en safetensors; en la Arc Pro B70 (memoria no especificada en la información) el checkpoint deja un pool de caché KV de 197.982 tokens con contexto de 131k y caché KV fp8.
- GPU recomendadas: Intel Arc Pro B70 (probado con vLLM-XPU); el autor no documenta pruebas en GPU NVIDIA.
- GPU de consumo: no disponible; no se confirma que quepa en tarjetas consumer.
- Despliegue: vLLM con `--quantization inc` y cualquier loader que lea `auto_round:auto_gptq` int4. Los números se obtuvieron con la imagen `intel/llm-scaler-vllm:0.26.0-b2` más parches (PR 50501 de vLLM para prefill W4A8, PR 700 de llm-scaler y dos parches locales: soporte de AutoRound int4 `inc` sobre kernels `sym_int4` y restricción del drafter MTP a una lista de 32k tokens). Una imagen estándar no está probada con este checkpoint.
- Flags de servicio de referencia: `--dtype float16` (bf16 falla en la B70), `--max-model-len 131072`, `--max-num-seqs 16`, `--block-size 64`, `--enable-prefix-caching`, `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`, `--kv-cache-dtype fp8`, `--mamba-ssm-cache-dtype float16`, `--reasoning-parser qwen3`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder`.
- Latencia y throughput: 72,2 tok/s por petición con 1 concurrente, 55,5 con 4 y 33,8 con 16; primer token en 1,72 s (4k), 18,0 s (32k) y 46,7 s (64k).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|
| Esta cuantización (grandfso) | 6.284.446.960 | 131.072 | int4 W4A16 AutoRound, MTP int4 | Apache-2.0 | 72,2 tok/s a 1 concurrente; 50/50 en evaluación interna |
| JC1DA/…-INT4-W4A16 | no disponible | 131.072 (mismo servicio) | int4 W4A16 AutoRound, MTP en bf16 | no disponible | 67,5 tok/s a 1 concurrente; 50/50 en evaluación interna |
| DavidAU/…-Heretic-Uncensored-NM-DAU (fuente) | no disponible | no disponible | bf16 (sin cuantizar) | Apache-2.0 | no disponible |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks estándar para ninguno de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin rechazo: el checkpoint fuente es "Heretic"-abliterated y esta cuantización conserva ese comportamiento. Responde a peticiones que el Qwen3.8 base declina; es necesario añadir salvaguardas propias si se sirve a terceros.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad; la evaluación interna de 50 tareas es un control de regresión, no una medida de fiabilidad.
- Sesgos: no disponible; no se documentan análisis de sesgo.
- Idiomas: no disponible; no se confirma el soporte multilingüe.
- Licencia: Apache-2.0, igual que el modelo fuente, lo que permite uso comercial, pero la ausencia de rechazo puede implicar obligaciones adicionales de moderación según la jurisdicción.
- Dependencia de parches: los números de rendimiento requieren la imagen `intel/llm-scaler-vllm:0.26.0-b2` con parches locales; una imagen estándar de vLLM no está probada con este checkpoint.
- Hardware: solo probado en Intel Arc Pro B70 con vLLM-XPU; bf16 falla en esa GPU y se usa fp16. No hay datos de compatibilidad con NVIDIA.
- Precisión: la cuantización int4 puede degradar tareas sensibles; el autor no aporta comparación con el modelo en bf16.
- Contexto largo: el primer token a 64k tarda 46,7 s, lo que limita su uso interactivo con prompts muy largos.
- Disponibilidad: 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/grandfso/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-int4-AutoRound-MTP
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Receta de cuantización de referencia: https://huggingface.co/Frozenlock/Qwen3.8-27B-int4-AutoRound
- Cuantización comparable: https://huggingface.co/JC1DA/Qwen3.8-27B-DavidAU-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-INT4-W4A16
- Modelo Qwen base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de auto-round: no disponible en la información proporcionada
- Paper de AutoRound: no disponible en la información proporcionada
- vLLM PR 50501 (W4A8 prefill): no disponible el enlace directo en la información proporcionada
- llm-scaler PR 700: no disponible el enlace directo en la información proporcionada
