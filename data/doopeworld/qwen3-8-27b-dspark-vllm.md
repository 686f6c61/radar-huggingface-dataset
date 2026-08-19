# Doopeworld/Qwen3.8-27B-DSpark-vLLM

## Resumen

`Doopeworld/Qwen3.8-27B-DSpark-vLLM` es un modelo auxiliar de decodificación especulativa (drafter) desarrollado por Doopeworld como una adaptación lista para vLLM del checkpoint original `RadixArk/Qwen3.8-27B-DSpark`. El problema que resuelve es puramente operativo: el `config.json` original declaraba la arquitectura `DSparkDraftModel`, que en el registro de vLLM enruta a la clase `DSparkDeepseekV4ForCausalLM` (DeepSeek-V4), provocando un fallo de carga. Este repositorio cambia una única línea para declarar `Qwen3DSparkModel`, que selecciona la implementación `Qwen3DSparkForCausalLM` ya soportada nativamente por vLLM. Los pesos son byte-idénticos al original; no hay ninguna modificación de parámetros.

El modelo es un drafter de 1.359.284.737 parámetros (2,7 GB en safetensors) diseñado para acelerar la inferencia del modelo objetivo `Qwen3.8-27B` mediante decodificación especulativa. Lee los estados ocultos del modelo objetivo en las capas 4, 16, 28, 40 y 52 y genera hasta 7 tokens candidatos por paso. Su relevancia actual radica en que permite explotar la técnica DSpark en hardware Intel Arc/XPU con vLLM, donde se han medido mejoras de throughput de hasta 52 tokens/s frente a 28 tokens/s sin especulación, según los datos publicados por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter para decodificación especulativa DSpark, basado en `Qwen3DSparkForCausalLM` (config declarada: `Qwen3DSparkModel`) |
| Parametros totales | 1.359.284.737 (solo el drafter; el modelo objetivo es Qwen3.8-27B, no incluido) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el ejemplo de uso de vLLM emplea `--max-model-len 16384` |
| Tipos de cuantizacion | No disponible para el drafter (se usa en bf16 según el comando de ejemplo). El modelo objetivo admite FP8, GPTQ-int4, AWQ y MXFP4, aunque solo FP8 y GPTQ-int4 han sido probados |
| Idiomas soportados | No disponible |
| Licencia | other (sin especificar términos concretos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un drafter especializado en decodificación especulativa, no un modelo de lenguaje autónomo. Su arquitectura interna no está detallada en la información disponible, pero se sabe que incorpora un `dflash_config` con `target_layer_ids`, `mask_token_id` y `projector_type`, además de `markov_rank`, `enable_confidence_head`, `confidence_head_with_markov`, `layer_types` y `head_dim`. Lee los estados ocultos (hidden states) del modelo objetivo en las capas 4, 16, 28, 40 y 52, que corresponden a 5 × 5120 dimensiones, y genera tokens candidatos de forma probabilística o greedy.

El entrenamiento se realizó contra el checkpoint `Qwen3.8-27B-FP8` del mismo autor (RadixArk). No se han publicado detalles sobre el dataset, el número de tokens de entrenamiento ni el proceso de alineación. El método DSpark y los pesos originales pertenecen a RadixArk y a los autores de DSpark/SpecForge; este repositorio solo aporta el cambio de configuración y datos de benchmark en Intel Arc.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa: produce hasta 7 tokens por paso que el modelo objetivo verifica en paralelo.
- Aceleración de inferencia: en las pruebas publicadas, alcanza 52 tokens/s (tg32) con muestreo probabilístico, frente a 28 tokens/s sin especulación.
- Lectura de estados ocultos intermedios del modelo objetivo en capas específicas (4/16/28/40/52), lo que le permite anticipar la distribución de tokens del modelo grande.
- Soporte de muestreo probabilístico y greedy para el draft, con mejor rendimiento medido en el modo probabilístico.
- No es un modelo de propósito general: no genera texto de forma autónoma, no soporta tool calling, ni razonamiento multi-paso, ni capacidades multimodales.

## Casos de uso

- Aceleración de inferencia de `Qwen3.8-27B` en producción con vLLM: se integra como drafter en la configuración de decodificación especulativa (`--speculative-config`), reduciendo la latencia por token en servicios de chat o generación de texto.
- Despliegue en hardware Intel Arc/XPU: verificado en una Intel Arc Pro B70 de 32 GB con el backend XPU de vLLM, lo que permite aprovechar GPUs de Intel para inferencia de modelos grandes sin necesidad de hardware NVIDIA.
- Tareas de razonamiento matemático paso a paso: la tasa de aceptación media medida es de 4,79 tokens en este tipo de prompts (frente a 2,18 en prosa general), lo que lo hace especialmente adecuado para asistentes de resolución de problemas matemáticos o de ciencias.
- Optimización de costes en entornos con memoria limitada: el drafter pesa solo 2,7 GB, y con un target cuantizado a GPTQ-int4 cabe junto al modelo objetivo en una tarjeta de 32 GB, dejando margen para la caché KV.
- Benchmarking y evaluación de técnicas de decodificación especulativa: sirve como referencia para comparar DSpark con otras estrategias como MTP (multi-token prediction) integrada en Qwen3.8.
- Entornos de investigación en aceleración de LLMs: permite estudiar el impacto de la cuantización del modelo objetivo en la tasa de aceptación del drafter, ya que los estados ocultos que lee son siempre en bf16 independientemente de cómo se almacenen los pesos del target.

## Benchmarks y rendimiento

Los datos publicados en la model card fueron medidos en una Intel Arc Pro B70 de 32 GB, con vLLM versión `0.26.1rc1.dev799` (backend XPU, V2 model runner), sobre el target `Qwen3.8-27B` en GPTQ-Int4 (W4A16), con `llama-benchy --pp 4096`.

| Config | t/s (tg32) | Tasa de aceptación media |
|---|---|---|
| Sin especulación | 28 | — |
| Qwen3.8 MTP integrado, k=2 | 50 | ~2,8 |
| DSpark, k=7, greedy | 42 | 1,94 – 2,67 |
| DSpark, k=7, probabilístico | 52 | 2,45 – 2,79 |

Aceptación por posición con k=7 y muestreo probabilístico: `0,76, 0,45, 0,31, 0,14, 0,10, 0,02, 0,00`.

La aceptación depende fuertemente del tipo de prompt. En un harness independiente contra un target FP8 con coincidencia exacta greedy:

| Tipo de prompt | Longitud de aceptación media |
|---|---|
| Prosa general / instrucciones | 2,18 |
| Razonamiento matemático paso a paso | 4,79 |

Nota del autor: el modo probabilístico es ~23% más rápido que greedy (52 vs 42 t/s) en configuraciones idénticas. No se recomienda reducir k aunque las posiciones 6 y 7 tengan aceptación casi nula, porque el overhead por paso domina el coste por token aceptado; k=4 y k=6 midieron peor que k=7.

## Requisitos de hardware

- VRAM estimada: el drafter ocupa 2,7 GB en disco (pesos safetensors). En inferencia, se carga en memoria junto al modelo objetivo. Con un target GPTQ-int4 cabe en una tarjeta de 32 GB con margen para caché KV; con target FP8 no cabe en una sola tarjeta de 32 GB.
- GPU verificada: Intel Arc Pro B70 (32 GB) con backend XPU de vLLM. El autor indica que nada en el cambio es específico de XPU y que CUDA debería comportarse igual o mejor, pero no ha sido probado.
- GPU recomendadas: cualquier GPU con al menos 32 GB de VRAM para el conjunto drafter + target. En consumer, una RTX 4090 (24 GB) solo podría usarse con cuantizaciones muy agresivas del target y contexto reducido, aunque no está verificado.
- Opciones de despliegue: vLLM con `--speculative-config` (método `dspark`). No se menciona compatibilidad con llama.cpp, Ollama ni TGI.
- Latencia y throughput: 52 t/s (tg32) con k=7 probabilístico en Intel Arc Pro B70, frente a 28 t/s sin especulación. Con greedy, 42 t/s.

## Comparativa con modelos similares

El drafter se compara con las alternativas de especulación disponibles para el mismo modelo objetivo `Qwen3.8-27B` en el entorno de pruebas del autor (Intel Arc Pro B70, vLLM XPU):

| Configuración | t/s (tg32) | Aceptación media | Notas |
|---|---|---|---|
| Sin especulación | 28 | — | Línea base |
| Qwen3.8 MTP integrado, k=2 | 50 | ~2,8 | Método nativo del modelo, sin drafter externo |
| DSpark (este modelo), k=7 probabilístico | 52 | 2,45 – 2,79 | Mejor throughput medido |

No se dispone de comparativas con otros drafteres externos (p. ej., EAGLE, Medusa) en la información proporcionada.

## Limitaciones y advertencias

- Verificado únicamente en Intel Arc/XPU con vLLM. El comportamiento en CUDA no ha sido probado, aunque el autor considera que debería ser igual o mejor.
- Compatible solo con `Qwen3.8-27B`. El drafter espera 5 × 5120 dimensiones en su capa `fc` y accede a índices de capa hasta 52; otros tamaños de la familia Qwen3.8 no cargarán.
- El target FP8 no cabe en una tarjeta de 32 GB junto al drafter (2,7 GB) sin dejar espacio para la caché KV. Se recomienda GPTQ-int4.
- La funcionalidad `enable_adaptive_verification` no funciona con Qwen3.8: sus capas de atención lineal GDN usan `GDNAttentionBackend`, que vLLM rechaza al iniciar. El confidence head del checkpoint queda sin uso bajo vLLM.
- La tasa de aceptación depende fuertemente del tipo de carga de trabajo: en prosa general es baja (2,18), mientras que en razonamiento matemático es alta (4,79). Un único valor de benchmark es poco representativo.
- La cuantización del modelo objetivo afecta a la aceptación: el drafter fue entrenado contra FP8, y cuantizaciones más agresivas (GPTQ-int4) reducen la tasa (2,45–2,79 frente a 3,39 publicado). MXFP4 y AWQ no han sido probados.
- Licencia `other` sin términos especificados: no se garantiza el uso comercial. Conviene contactar con RadixArk antes de usar en producción.
- El repositorio tiene 0 descargas y 0 likes, y no se han publicado resultados independientes fuera de los del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Doopeworld/Qwen3.8-27B-DSpark-vLLM
- Checkpoint original: https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Referencia de vLLM para DSpark: `vllm/model_executor/models/qwen3_dspark.py` (mencionada en la model card, sin URL directa)
- Documentación de vLLM sobre decodificación especulativa: no se proporciona enlace en la información disponible
