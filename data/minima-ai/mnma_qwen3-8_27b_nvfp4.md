# minima-ai/mnma_qwen3.8_27b_nvfp4

## Resumen

mnma_qwen3.8_27b_nvfp4 es una cuantización NVFP4 W4A4 del modelo Qwen/Qwen3.8-27B, desarrollada por minima-ai mediante cuantización post-entrenamiento (PTQ) exclusivamente, sin entrenamiento consciente de cuantización ni destilación. El resultado es un checkpoint de 26.895.998.496 parámetros (aproximadamente 26,9 mil millones) que reduce el peso en VRAM de 50,13 GiB en BF16 a 17,53 GiB, manteniendo las puntuaciones de tarea dentro del ruido estadístico respecto al modelo original. El repositorio ocupa 18,8 GB y se distribuye bajo licencia Apache 2.0.

La relevancia técnica del checkpoint reside en que cuantiza a NVFP4 las 496 capas lineales del backbone, incluidas las 48 capas Gated DeltaNet (GDN) y sus proyecciones de puerta, algo que las primeras builds públicas de 4 bits evitaban al asumir que las capas de estado recurrente eran frágiles. El paper asociado (arXiv:2609.04098) sostiene lo contrario: el mecanismo de gating y la corrección por regla delta de la arquitectura hacen que la mitad recurrente sea precisamente la más robusta frente a la cuantización. Además, incorpora escalas de KV-cache FP8 calibradas de forma estática.

El modelo está pensado para servir con vLLM 0.27 o superior sobre hardware con soporte nativo de NVFP4 (SM120 / Blackwell). Es una extracción solo de texto (`Qwen3_5ForCausalLM`), sin torre de visión, y conserva la plantilla de chat con capacidad de razonamiento (thinking mode).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida transformer: 48 capas Gated DeltaNet (GDN) + 16 capas de atención, con MLP en 64 capas; extracción `Qwen3_5ForCausalLM` (solo texto) |
| Parametros totales | 26.895.998.496 (aprox. 26,9 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Evaluado hasta 64K tokens (RULER NIAH @32K y @64K); longitud máxima oficial no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 con grupo de 16 en capas lineales del backbone; KV-cache FP8 estática calibrada; embeddings, `lm_head`, `conv1d`, normas, `A_log` y `dt_bias` en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), librería vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina 48 capas Gated DeltaNet —un mecanismo de estado recurrente con regla delta y compuertas— con 16 capas de atención convencional y 64 capas MLP. Esta build cuantiza a NVFP4 W4A4 (grupo de 16) las 496 capas lineales del backbone: `in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b` y `out_proj` de las capas GDN; `q/k/v/o_proj` de las capas de atención; y `gate/up/down_proj` de las MLP. Las 16 capas de atención llevan además escalas `k_scale`/`v_scale` FP8 estáticas calibradas (32 tensores en total). Embeddings, `lm_head`, `conv1d`, normas, `A_log` y `dt_bias` permanecen en BF16.

La cuantización se realizó con llm-compressor (esquema `NVFP4` más `kv_cache_scheme` fp8/tensor/static) sobre un conjunto de calibración congelado de 128 muestras de 32K tokens. No hubo entrenamiento consciente de cuantización ni destilación: solo calibración. Un detalle crítico de ingeniería es la armonización de escalas globales: vLLM fusiona `in_proj_qkv+z` y `in_proj_b+a` en sendas GEMM NVFP4 con una única escala global cada una, mientras que llm-compressor calibra por módulo (hasta 2,8× de diferencia). Servir un checkpoint sin armonizar desescala silenciosamente las compuertas de decaimiento y escritura del GDN; esta build reescribe los grupos fusionados con escalas globales compartidas y pliega la ratio en las escalas por bloque.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat intacta.
- Razonamiento con modo thinking (la evaluación usó `enable_thinking=false` para MMLU-Pro y GSM8K, y muestreo con thinking activo para AIME, GPQA y LiveCodeBench).
- Razonamiento matemático de competición: 95,5 en GSM8K y 86,7 en AIME'25 (pass@1, 4 semillas).
- Generación y comprensión de código: 78,5 en LiveCodeBench v6.
- Conocimiento general y experto: 79,7 en MMLU-Pro y 85,1 en GPQA-Diamond.
- Contexto largo con recuperación fiable: 100 en RULER NIAH single y multikey tanto a 32K como a 64K.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles explícitamente; el modo thinking y el contexto largo son compatibles con flujos agénticos, pero no se documentan.
- Visión y audio: no soportados (extracción solo de texto, sin torre de visión).

## Casos de uso

- Razonamiento matemático y verificación de soluciones: el modelo mantiene 95,5 en GSM8K y 86,7 en AIME'25 idénticos al BF16, por lo que puede usarse como motor de resolución y comprobación de problemas en pipelines educativos o de evaluación automática sin perder precisión por la cuantización.
- Generación de código en producción: con 78,5 en LiveCodeBench v6 y un peso en VRAM de 17,53 GiB, cabe en una sola GPU profesional y permite servir asistencia de código con mayor concurrencia (1.154 tok/s a concurrencia 32 frente a 621 del BF16).
- Análisis de documentos largos y recuperación de información: los 100 en RULER NIAH a 32K y 64K permiten resumir contratos, informes o expedientes extensos y localizar datos concretos dentro de ellos con alta fiabilidad.
- Atención al cliente automatizada con contexto largo: la ventana evaluada hasta 64K y el TTFT de 4,03 s en prefill de 32K hacen viable mantener historiales de conversación extensos y documentación de producto en el mismo contexto.
- Despliegue en hardware Blackwell con alta densidad: al requerir solo 17,53 GiB para pesos, se pueden instanciar varias réplicas o servir con mayor concurrencia en una RTX PRO 6000 de 96 GB, reduciendo coste por token frente al BF16.
- Evaluación comparativa de modelos y ablaciones de cuantización: al ser un checkpoint W4A4 completo con paper asociado y evaluación pareada contra BF16, sirve como referencia reproducible para estudiar el impacto de la cuantización en arquitecturas híbridas recurrentes.
- Investigación sobre arquitecturas híbridas GDN: el checkpoint demuestra que las capas de estado recurrente toleran 4 bits, lo que facilita experimentos sobre el mecanismo de gating y la regla delta en entornos con recursos limitados.

## Benchmarks y rendimiento

Medidos con vLLM 0.27.1, TP=1, una RTX PRO 6000 de 96 GB y KV cache FP8, contra el modelo BF16 servido de forma idéntica:

| Metrica | BF16 | mnma_qwen3.8_27b_nvfp4 |
|---|---|---|
| WikiText-2 PPL @4K | 6,95 | 7,68 |
| WikiText-2 PPL @32K | 10,35 | 10,50 |
| MMLU-Pro | 80,4 | 79,7 |
| GSM8K | 95,5 | 95,5 |
| AIME'25 (pass@1, 4 semillas) | 86,7 | 86,7 |
| GPQA-Diamond (pass@1, 4 semillas) | 86,5 | 85,1 |
| LiveCodeBench v6 | 79,0 | 78,5 |
| RULER NIAH single/multikey @32K y @64K | 100 en las 4 | 100 en las 4 |
| Pesos en VRAM | 50,13 GiB | 17,53 GiB |
| Decode tok/s (1K in / 1K out, concurrencia 32) | 621 | 1.154 |
| TTFT, prefill de 32K tokens | 6,90 s | 4,03 s |

Ninguna puntuación de tarea se separa del BF16 según intervalos de confianza. Las filas de tarea se midieron sobre el gemelo sin escalas de este checkpoint (pesos idénticos; una ablación de KV-cache mostró que la precisión del KV no mueve ninguna puntuación en ninguno de los dos modelos); PPL, RULER y throughput se midieron directamente sobre este checkpoint. La brecha de perplejidad (+0,73 a 4K, +0,15 a 32K) se reduce al crecer el contexto, lo que indica que el error de cuantización no se acumula en el estado recurrente.

## Requisitos de hardware

- VRAM para pesos: 17,53 GiB en NVFP4, frente a 50,13 GiB del BF16.
- VRAM total: debe sumarse la KV cache FP8; a 32K tokens y con 16 capas de atención el consumo adicional es moderado, pero no se publica una cifra exacta (no disponible).
- GPU recomendadas: hardware con soporte nativo NVFP4 (SM120 / Blackwell). La evaluación se realizó en una RTX PRO 6000 de 96 GB; cabe holgadamente en cualquier Blackwell con 24 GB o más para pesos, aunque el contexto largo exige más memoria.
- GPU consumer: no disponible de forma explícita; las GPUs consumer con SM120 (Blackwell) son las únicas compatibles de forma nativa. En arquitecturas anteriores (Ada, Ampere) no hay soporte nativo de NVFP4 en vLLM.
- Despliegue: vLLM 0.27 o superior con `vllm serve minima-ai/mnma_qwen3.8_27b_nvfp4 --kv-cache-dtype fp8`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Rendimiento: 1.154 tok/s de decodificación a concurrencia 32 (1K in / 1K out) y TTFT de 4,03 s en prefill de 32K tokens, medidos en una sola RTX PRO 6000 con TP=1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / precision | Licencia | Notas |
|---|---|---|---|---|---|
| mnma_qwen3.8_27b_nvfp4 | 26,9 B | Evaluado hasta 64K | NVFP4 W4A4, KV FP8 | Apache 2.0 | Pesos 17,53 GiB; 1.154 tok/s a concurrencia 32 |
| Qwen/Qwen3.8-27B (BF16) | 26,9 B | Evaluado hasta 64K | BF16 | Apache 2.0 (modelo base) | Pesos 50,13 GiB; 621 tok/s a concurrencia 32; referencia de calidad |
| Otras builds públicas de 4 bits de Qwen3.8-27B | 26,9 B | No disponible | 4 bits con bloque GDN en 8/16 bits | No disponible | Mantienen la mitad recurrente en mayor precisión; el autor las cita como punto de partida |

No se dispone de datos de benchmarks de las builds alternativas de 4 bits en la información proporcionada, por lo que la comparación de rendimiento se limita al par BF16 frente a NVFP4 del propio autor.

## Limitaciones y advertencias

- Requiere hardware Blackwell (SM120) con soporte nativo NVFP4 y vLLM 0.27 o superior; no es desplegable en GPUs anteriores sin conversión adicional.
- La perplejidad en WikiText-2 empeora respecto al BF16 (+0,73 a 4K y +0,15 a 32K), aunque la brecha se reduce con el contexto y no se traduce en caída de puntuaciones de tarea.
- La perplejidad del modelo base sube dentro de peticiones largas (6,95 a 4K frente a 10,35 a 32K en BF16); las comparaciones entre modelos deben hacerse bajo la misma ruta de servicio.
- Solo texto: no incluye torre de visión ni capacidades multimodales.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe más allá de lo que herede del modelo base.
- No se documentan sesgos conocidos ni tasas de alucinación específicas; al ser un modelo de 27 B, persiste el riesgo habitual de alucinación en conocimiento factual y citas.
- Soporte de tool calling y comportamiento agéntico no documentados explícitamente en la model card.
- El checkpoint debe servirse con `--kv-cache-dtype fp8` para aprovechar las escalas calibradas; servirlo sin esa opción desaprovecha parte del trabajo de calibración.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B para uso comercial en la jurisdicción de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minima-ai/mnma_qwen3.8_27b_nvfp4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper: https://arxiv.org/abs/2609.04098 (arXiv:2609.04098)
- llm-compressor: https://github.com/vllm-project/llm-compressor
