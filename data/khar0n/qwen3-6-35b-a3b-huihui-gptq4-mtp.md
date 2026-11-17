# khar0n/Qwen3.6-35B-A3B-huihui-GPTQ4-MTP

## Resumen

Qwen3.6-35B-A3B-huihui-GPTQ4-MTP es una cuantización GPTQ de 4 bits del modelo Huihui-Qwen3.6-35B-A3B-abliterated, publicado por el usuario khar0n en Hugging Face. El modelo base original es Qwen/Qwen3.6-35B-A3B, un transformer de tipo mixture-of-experts (MoE) con 35.951.822.704 parámetros totales, del que solo una fracción está activa por token (A3B sugiere aproximadamente 3.000 millones de parámetros activos, aunque el dato exacto no está confirmado en la información disponible). La variante "huihui" aplica una ablución conductual sobre los pesos en BF16, un procedimiento que elimina selectivamente la dirección de rechazo del modelo, y esta cuantización la preserva recuantizando desde BF16 con calibración en lugar de portar el delta sobre una cuantización existente.

La relevancia técnica de esta ficha reside en dos aspectos. Primero, demuestra que la cuantización INT4 con calibración cuidadosa puede preservar el comportamiento de un modelo ablacionado: la model card reporta 0 % de rechazos en JailbreakBench harmful y solo un 2,0 % en XSTest safe, mientras que una cuantización RTN sin calibrar del mismo delta colapsa a un 69 % de rechazos. Segundo, mantiene intacta la cabeza MTP (multi-token prediction) en bf16, lo que permite decodificación especulativa nativa con una tasa de aceptación del 70-76 % y aceleraciones de hasta 122 tok/s en código sobre una NVIDIA GB10.

El checkpoint está pensado para despliegue en vLLM con soporte de contexto largo mediante YaRN 4x, alcanzando 1.010.000 tokens de ventana. El repositorio ocupa 22,4 GB en safetensors y se distribuye bajo licencia Apache-2.0, heredada de los modelos base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) con cabeza MTP |
| Parámetros totales | 35.951.822.704 |
| Parámetros activos | no disponible (la nomenclatura A3B sugiere ~3B, sin confirmar) |
| Longitud de contexto | 262.144 nativo; 1.010.000 con YaRN 4x |
| Tipos de cuantización | GPTQ W4A16, group_size 128, simétrico, desc_act off; capas MTP en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (GPTQ INT4) |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo mixture-of-experts con 35.951.822.704 parámetros totales y una cabeza MTP (multi-token prediction) integrada que actúa como draft head nativo para decodificación especulativa. La cuantización se realizó con gptqmodel 7.10.0 en configuración W4A16, group_size 128, simétrica y sin desc_act. Las capas `mtp.*` se mantienen sin cuantizar en bf16 mediante el plan de modelo de GPTQModel y la directiva `quantization_config.dynamic = {"-:.*mtp.*": {}}`, que instruye a vLLM a cargarlas como no cuantizadas.

El aspecto más relevante del proceso es la calibración. El autor partió del checkpoint BF16 ablacionado (huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated), cuyo delta conductual de 123 tensores vive únicamente en los pesos fuente, y recuantizó desde BF16 en lugar de aplicar el delta sobre una cuantización preexistente. El conjunto de calibración combina 176 textos: 96 de allenai/c4 y 80 prompts de rechazo/benignos/xstest (JailbreakBench harmful/benign y XSTest). Esta decisión se apoya en el hallazgo de que la calibración controla qué se preserva en la cuantización; los resultados empíricos lo confirman, ya que una cuantización RTN sin calibrar del mismo delta colapsa a un 69 % de rechazos y un híbrido fp8+int4-experts sin calibrar a un 53 %, frente al 0 % del checkpoint calibrado.

## Capacidades

- Generación de texto y razonamiento con modo "think" (parser `qwen3` en vLLM).
- Generación de código con soporte de tool calling (parser `qwen3_coder`, flag `--enable-auto-tool-choice`).
- Decodificación especulativa nativa mediante cabeza MTP (n=2) o drafter externo DFlash (n=4), con salidas idénticas a las no especulativas (lossless).
- Contexto largo de hasta 1.010.000 tokens con YaRN 4x y `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`.
- Comportamiento ablacionado: rechazo prácticamente nulo en prompts harmful de JailbreakBench (0 %) y mínimo en XSTest safe (2,0 %).
- Soporte de prefix caching, chunked prefill y async scheduling en vLLM.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión y audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y abliteración: el checkpoint permite estudiar cómo la cuantización calibrada preserva o destruye la dirección de rechazo de un modelo ablacionado, comparando contra variantes RTN y fp8+int4 sin calibrar documentadas en la model card.
- Despliegue de inferencia de bajo coste en hardware consumer/prosumer: con 22,4 GB de pesos INT4 y `--gpu-memory-utilization 0.65`, el modelo cabe en GPUs de 32-48 GB y se ha validado en una NVIDIA GB10, permitiendo servir un MoE de 36B en una única máquina.
- Generación de código en pipelines de CI/CD: el modelo alcanza 117-122 tok/s en código con DFlash n=4 y soporta tool calling con parser `qwen3_coder`, lo que lo hace apto para asistentes de código integrados en herramientas de desarrollo.
- Procesamiento de documentos largos: la ventana de 1.010.000 tokens con YaRN 4x permite analizar repositorios completos, expedientes o corpus extensos en una sola pasada sin truncamiento.
- Atención al cliente automatizada multi-turno: el contexto largo y el soporte de prefix caching reducen el coste de conversaciones con historial extenso, aunque el comportamiento ablacionado exige filtros de seguridad externos.
- Evaluación de robustez y red teaming: la combinación de abliteración y cuantización calibrada ofrece un caso de estudio controlado para medir cómo las técnicas de compresión afectan a las tasas de rechazo y a la seguridad del modelo.
- Despliegue en vLLM con decodificación especulativa: la cabeza MTP en bf16 permite acelerar la inferencia sin drafter externo, con tasas de aceptación del 70-76 % y throughput de 68-69 tok/s en prosa.

## Benchmarks y rendimiento

Los datos disponibles no son benchmarks de capacidad (MMLU, HumanEval, GSM8K) sino métricas de throughput y tasas de rechazo medidas por el autor en NVIDIA GB10 (DGX Spark) con vLLM v0.33.0 y YaRN 4x a 1.010.000 tokens de contexto. Se reproducen a continuación tal como aparecen en la model card.

| Configuración | Prosa (tok/s) | Código (tok/s) | Think (tok/s) | JBB harmful | JBB benign | XSTest safe |
|---|---|---|---|---|---|---|
| DFlash n=4 (drafter z-lab DFlash2) | 67-68 | 117-122 | 93-96 | 0 % | 0 % | 2,0 % |
| MTP n=2 (cabeza integrada) | 68-69 | 82-84 | 78 | 0 % | 0 % | 2,0 % |
| Referencia: FP8 W8A8 + DFlash n=4 | 53 | 85 | 76 | 0 % | 0 % | 2,0 % |
| Contraejemplo: fp8-dense + int4-experts sin calibrar, MTP | 93 | 110 | 107 | 53 % | 1 % | 2,0 % |

Aceptación del draft: MTP n=2 alcanza 70-76 %; DFlash n=4, 60-63 %. Las salidas especulativas y no especulativas son idénticas (lossless). Protocolo de ablución: JailbreakBench 100 comportamientos harmful + 100 benignos, XSTest 250 prompts safe (2,0 % equivale a 5/250), semilla fija, una sola GB10, vLLM v0.33.0, YaRN 4x. No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos INT4 ocupan aproximadamente 22,4 GB; con caché KV en fp8 y `--gpu-memory-utilization 0.65` el autor lo ejecuta en una NVIDIA GB10 (128 GB de memoria unificada). Para GPUs discretas se recomienda un mínimo de 32-48 GB de VRAM según longitud de contexto.
- GPU recomendadas: NVIDIA GB10 / DGX Spark (validado por el autor); A100 80 GB, H100 y L40S son opciones viables por capacidad de memoria, aunque no se han publicado mediciones en ellas.
- GPU consumer: cabe en RTX 4090 (24 GB) solo con contexto corto y sin margen para caché KV extensa; en RTX 5090 o GPUs de 32 GB es más holgado. No se han publicado mediciones en consumer.
- Opciones de despliegue: vLLM v0.33.0 con `--trust-remote-code`, `--kv-cache-dtype fp8`, `--attention-backend flashinfer`, `--enable-chunked-prefill`, `--async-scheduling`, `--enable-prefix-caching`. Para contexto largo se requiere `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1` y los overrides de YaRN. No se menciona soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 67-69 tok/s en prosa, 82-122 tok/s en código y 78-96 tok/s en modo think según configuración especulativa (ver tabla de benchmarks).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| khar0n/Qwen3.6-35B-A3B-huihui-GPTQ4-MTP | 35,95B (MoE) | 262K nativo / 1,01M con YaRN | GPTQ INT4 W4A16 + MTP bf16 | Apache-2.0 | Objeto de esta ficha; ablacionado y calibrado |
| huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated | 35,95B (MoE) | no disponible | BF16 | Apache-2.0 | Modelo base BF16; sin cuantizar, requiere ~72 GB |
| Qwen/Qwen3.6-35B-A3B | 35,95B (MoE) | no disponible | BF16 | Apache-2.0 | Modelo original sin abliterar |
| incoai/Qwen3.6-35B-A3B-DFlash2 | no disponible | no disponible | no disponible | no disponible | Drafter externo para decodificación especulativa DFlash n=4 |

La comparativa se limita a los modelos referenciados en la model card; no se dispone de datos de benchmarks de capacidad para establecer comparaciones de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo ablacionado: la eliminación de la dirección de rechazo implica que el modelo puede generar contenido dañino sin filtros propios; requiere moderación externa obligatoria en producción.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos de lenguaje.
- Calibración específica: los resultados de preservación del comportamiento dependen del conjunto de calibración de 176 textos; otros conjuntos podrían alterar las tasas de rechazo.
- Contexto largo: la ventana de 1.010.000 tokens exige YaRN 4x y `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`; sin estos overrides el modelo opera a 262.144 tokens.
- Compatibilidad: validado únicamente en vLLM v0.33.0 con backend flashinfer; no hay evidencia de funcionamiento en llama.cpp, Ollama o TGI.
- Idiomas: no se especifican los idiomas soportados en la información disponible.
- Licencia: Apache-2.0 permite uso comercial, pero el comportamiento ablacionado puede contravenir políticas de proveedores cloud y términos de uso de plataformas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente de los resultados reportados.

## Enlaces

- Hugging Face: https://huggingface.co/khar0n/Qwen3.6-35B-A3B-huihui-GPTQ4-MTP
- Modelo base ablacionado: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Drafter DFlash2: https://huggingface.co/incoai/Qwen3.6-35B-A3B-DFlash2
- Dataset de calibración: https://huggingface.co/datasets/allenai/c4
- Referencia sobre calibración (Weaponized AWQ, dealign.ai): no disponible como enlace directo en la información proporcionada
- JailbreakBench: no disponible como enlace directo en la información proporcionada
- XSTest: no disponible como enlace directo en la información proporcionada
