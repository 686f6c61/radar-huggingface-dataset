# minima-ai/mnma_qwen3.8_27b_nvfp4

## Resumen

mnma Qwen3.8-27B NVFP4 es una cuantización W4A4 del modelo híbrido Qwen3.8-27B, desarrollada por minima-ai. Se trata de una versión en la que todos los 496 bloques lineales del backbone —incluidas las 48 capas Gated DeltaNet (GDN) y sus proyecciones de compuerta— se han convertido a NVFP4 mediante calibración posterior al entrenamiento, sin training cuantizado ni destilación. El objetivo es reducir drásticamente el peso en VRAM (de 50,13 GiB a 17,53 GiB) manteniendo el rendimiento dentro del ruido de semilla respecto al modelo BF16 original. La relevancia radica en que demuestra que las capas recurrentes de un modelo híbrido pueden cuantizarse a 4 bits sin pérdida de calidad, contradiciendo la práctica habitual de mantenerlas en 8 o 16 bits. El modelo tiene 26.895.998.496 parámetros y soporta contextos largos de al menos 64K según las pruebas RULER. La licencia es Apache 2.0 y está pensado para servirse con vLLM en hardware Blackwell con soporte nativo NVFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet (GDN) y atención (48 capas GDN, 16 capas de atención, 64 capas MLP) |
| Parametros totales | 26.895.998.496 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 64K (validado en RULER) |
| Tipos de cuantizacion | NVFP4 W4A4 (group 16), FP8 KV-cache estático, BF16 para embeddings y lm_head |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es una extracción solo texto de Qwen3_5ForCausalLM, sin torre de visión. La arquitectura combina capas recurrentes Gated DeltaNet con capas de atención, totalizando 496 capas lineales en el backbone. La cuantización se realizó con llm-compressor usando el esquema NVFP4 y un esquema de KV-cache FP8 estático. Se calibró sobre un conjunto congelado de 128 muestras de 32K tokens, sin training cuantizado ni destilación. Una innovación técnica destacable es la armonización de las escalas globales: vLLM fusiona `in_proj_qkv+z` y `in_proj_b+a` en GEMMs NVFP4 con una única escala global, mientras que llm-compressor las calibra por módulo, lo que puede causar una desviación de hasta 2,8 veces. Este checkpoint reescribe los grupos fusionados con escalas globales compartidas, de modo que se sirve correctamente sin intervención manual.

## Capacidades

- Generación de texto y razonamiento en tareas de matemáticas, ciencia y código, como muestran los resultados en GSM8K, AIME'25, GPQA-Diamond y LiveCodeBench.
- Modo de pensamiento (thinking) activable mediante el chat template; en la evaluación se usó `enable_thinking=false` para MMLU-Pro/GSM8K y thinking-on para AIME/GPQA/LCB.
- Contexto largo: mantiene un rendimiento perfecto en tareas de recuperación (RULER NIAH single/multikey) a 32K y 64K.
- No se especifica soporte de tool calling ni capacidades multilingües en la información disponible.
- No procesa imágenes; es un modelo exclusivamente de texto.

## Casos de uso

- Despliegue de asistentes conversacionales de alto rendimiento en GPUs Blackwell con vLLM: la cuantización reduce el peso a 17,53 GiB y acelera el decode a 1.154 tok/s con concurrencia 32, lo que permite servir múltiples usuarios simultáneos.
- Razonamiento matemático y científico en entornos educativos o de investigación: mantiene un 95,5 en GSM8K y 86,7 en AIME'25, por lo que es adecuado para tutoría, resolución de problemas y apoyo a investigación.
- Generación de código en pipelines de CI/CD o editores asistidos: con un 78,5 en LiveCodeBench v6, puede integrarse en flujos de desarrollo asistido por IA.
- Análisis de documentos largos (contratos, informes, expedientes): gracias a su contexto de 64K y al rendimiento perfecto en RULER, permite extraer información o resumir documentos extensos.
- Servicio de inferencia con alta concurrencia: la mejora de throughput (1.154 tok/s frente a 621 del BF16) lo hace apto para aplicaciones en producción con cargas elevadas.
- Investigación sobre cuantización de modelos híbridos: sirve como referencia para estudiar el efecto de NVFP4 en capas recurrentes, acompañado del paper técnico que analiza el mecanismo.

## Benchmarks y rendimiento

La model card incluye una comparativa entre el modelo BF16 original y esta versión cuantizada, medida bajo el mismo régimen de servicio (vLLM 0.27.1, TP=1, RTX PRO 6000 de 96 GB, KV-cache FP8):

| Métrica | BF16 | Este modelo |
|---|---|---|
| WikiText-2 PPL @4K / @32K | 6,95 / 10,35 | 7,68 / 10,50 |
| MMLU-Pro | 80,4 | 79,7 |
| GSM8K | 95,5 | 95,5 |
| AIME'25 (pass@1, 4 semillas) | 86,7 | 86,7 |
| GPQA-Diamond (pass@1, 4 semillas) | 86,5 | 85,1 |
| LiveCodeBench v6 | 79,0 | 78,5 |
| RULER NIAH single/multikey @32K, @64K | 100 x4 | 100 x4 |
| Pesos en VRAM | 50,13 GiB | 17,53 GiB |
| Decode tok/s (1K in / 1K out, concurrencia 32) | 621 | 1.154 |
| TTFT, prefill de 32K tokens | 6,90 s | 4,03 s |

No se han publicado comparativas con otros modelos de la misma categoría en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: 17,53 GiB (sin contar KV-cache).
- GPU recomendada: hardware Blackwell con soporte nativo NVFP4 (SM120), como la RTX PRO 6000 de 96 GB utilizada en la evaluación.
- No es compatible con GPUs consumer anteriores (por ejemplo, RTX 4090) porque carecen de soporte NVFP4 nativo.
- Opciones de despliegue: vLLM >= 0.27, con el comando `vllm serve minima-ai/mnma_qwen3.8_27b_nvfp4 --kv-cache-dtype fp8`.
- Latencia y throughput: TTFT de 4,03 s para un prefill de 32K tokens y 1.154 tok/s en decode con concurrencia 32, medidos en el entorno indicado.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría. La referencia más próxima es el modelo base BF16 Qwen3.8-27B, cuyos resultados se muestran en la sección de benchmarks y rendimiento.

## Limitaciones y advertencias

- Requiere hardware Blackwell (SM120) con soporte nativo NVFP4; no puede ejecutarse en GPUs anteriores.
- Necesita vLLM >= 0.27; versiones inferiores no servirán el checkpoint correctamente.
- Los pesos están cuantizados con escalas globales armonizadas; si se sirve sin esta armonización, las compuertas GDN se escalan de forma incorrecta.
- La evaluación se realizó en un único entorno (vLLM 0.27.1, TP=1, una GPU RTX PRO 6000); los resultados pueden variar en otros entornos.
- Es un modelo solo texto, sin capacidades de visión.
- Los idiomas soportados no están especificados, por lo que puede haber limitaciones multilingües.
- La licencia Apache 2.0 permite uso comercial, tanto para el checkpoint como para el modelo base.
- Al ser un LLM, existe riesgo de alucinación; no se han publicado datos específicos sobre sesgos.
- La perplejidad en contextos cortos es ligeramente superior (+0,73 en WikiText-2 @4K), aunque la diferencia se reduce a +0,15 a 32K.

## Enlaces

- HuggingFace: https://huggingface.co/minima-ai/mnma_qwen3.8_27b_nvfp4
- Paper (arXiv:2609.04098): https://arxiv.org/abs/2609.04098
- Resumen del paper en AI Weekly: https://aiweekly.co/alerts/minima-paper-fully-quantizes-qwen38-27b-to-nvfp4-w4a4-including-gated-deltanet
- Repositorio llm-compressor: https://github.com/vllm-project/llm-compressor
