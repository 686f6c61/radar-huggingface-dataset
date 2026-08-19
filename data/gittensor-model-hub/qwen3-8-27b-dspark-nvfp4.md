# gittensor-model-hub/Qwen3.8-27B-DSpark-NVFP4

## Resumen

Qwen3.8-27B-DSpark-NVFP4 es un modelo drafter (modelo de borrador) diseñado para acelerar la decodificación especulativa del checkpoint cuantizado Qwen3.8-27B-NVFP4-RTX5090, desarrollado por gittensor-model-hub. Se trata de una versión cuantizada en NVFP4 (4 bits) del drafter BF16 original, que reduce el tamaño en VRAM un 48% (de 2,72 GB a 1,41 GB) y mejora ligeramente el rendimiento de aceptación de tokens (de 2,717 a 2,792) y el throughput (de 141,99 a 147,87 tok/s) en una RTX 5090.

El modelo se integra en el runtime SGLang con el algoritmo DSpark y está calibrado específicamente para proteger la salida de tool calling, que es el dominio donde muestra mejor aceptación (3,85). Al liberar memoria de VRAM, amplía el pool de KV cache en un 70%, permitiendo manejar contextos largos de hasta 122.880 tokens en la configuración recomendada. Su relevancia radica en que ofrece una vía para maximizar el rendimiento de inferencia en hardware de consumo como la RTX 5090, sin sacrificar precisión en la generación especulativa.

Con 900,5 millones de parámetros, este drafter es sustancialmente más pequeño que el modelo objetivo (27B), lo que le permite operar con baja latencia y footprint reducido. Está publicado bajo licencia Apache 2.0 y distribuido en formato safetensors, con soporte para carga vía ModelOpt en SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible; drafter para Qwen3.8 (modelo híbrido con GDN). Basado en transformer con MLP y atención, sin especificar número de capas |
| Parametros totales | 900.532.737 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (drafter); el modelo base soporta hasta 262.144 tokens nativos. Configuración recomendada: 122.880 tokens |
| Tipos de cuantizacion | NVFP4 (W4A4, grupo 16) en `mlp.gate_proj`, `mlp.up_proj`, `mlp.down_proj`, `self_attn.o_proj`; BF16 en `q_proj`, `k_proj`, `v_proj`, `fc`, RMSNorm, Q/K norm, Markov head y confidence head |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; carga requerida con `modelopt_fp4` en SGLang |

## Arquitectura y entrenamiento

El drafter es un modelo transformer compacto (900M parámetros) que replica la estructura del modelo base Qwen3.8-27B a escala reducida, con capas de atención y MLP estándar. No se ha publicado información sobre su arquitectura interna exacta (número de capas, dimensiones ocultas, etc.) ni sobre su entrenamiento original, ya que se trata de un checkpoint derivado de un drafter BF16 preexistente, cuantizado posteriormente con NVIDIA ModelOpt.

La cuantización post-entrenamiento sigue una receta de precisión mixta: las proyecciones del MLP y la proyección de salida de atención (`o_proj`) se cuantizan a NVFP4 con grupo de 16, mientras que las proyecciones Q, K y V se mantienen en BF16 deliberadamente, porque una cuantización completa degrada la tasa de aceptación. La calibración se realizó on-policy con 512 conversaciones regeneradas por el modelo objetivo NVFP4 a temperatura 0, con una mezcla ponderada hacia tool calling (37,5%) para proteger las salidas estructuralmente rígidas. Los datos de calibración son disjuntos del conjunto de evaluación.

## Capacidades

- Generación de tokens draft para decodificación especulativa con el algoritmo DSpark, acelerando la inferencia del modelo base Qwen3.8-27B.
- Soporte de tool calling optimizado: la calibración específica eleva la tasa de aceptación en tool calling de 3,15 a 3,85.
- Compatibilidad con el runtime SGLang y la imagen `lmsysorg/sglang:qwen38-27b`, que incluye soporte para el estado GDN híbrido.
- Integración con el modelo base NVFP4 cuantizado, manteniendo la precisión de las proyecciones QKV en BF16.
- No es un modelo autónomo: no genera texto completo ni razona por sí mismo; su función es exclusivamente auxiliar en el pipeline de decodificación especulativa.

## Casos de uso

- Despliegue de inferencia de alto rendimiento en RTX 5090: el drafter permite alcanzar 147,87 tok/s con el modelo Qwen3.8-27B NVFP4, frente a 81,58 tok/s sin especulación (1,81× de mejora), ideal para servir chatbots o asistentes en hardware de consumo.
- Servicio de tool calling a baja latencia: gracias a la calibración específica, el drafter mantiene una alta tasa de aceptación (3,85) en llamadas a funciones, reduciendo el número de iteraciones de verificación y mejorando la capacidad de respuesta en agentes que invocan APIs.
- Procesamiento de contextos largos: al liberar 1,31 GB de VRAM, el pool de KV cache se amplía a 122.995 tokens, permitiendo manejar documentos extensos o conversaciones multi-turno de gran tamaño en una sola GPU de 32 GB.
- Optimización de costes en entornos de producción: al reducir el footprint del drafter a 1,41 GB, se puede aumentar la densidad de requests por GPU o dejar más memoria para el modelo principal, reduciendo el coste por token servido.
- Benchmarking y evaluación de arquitecturas especulativas: sirve como referencia para comparar estrategias de cuantización de drafters (NVFP4 vs BF16) y su impacto en throughput y aceptación.
- Integración en pipelines de agentes con razonamiento multi-paso: el drafter acelera la generación de borradores en tareas que requieren múltiples pasos de razonamiento (math, coding), donde se observan tasas de aceptación de 3,45 y 3,00 respectivamente.

## Benchmarks y rendimiento

La model card reporta resultados medidos en una RTX 5090 de 32 GB, con concurrencia 1, contexto de 64K, KV cache FP8 y 240 prompts held-out idénticos para todos los perfiles. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este drafter, ya que no es un modelo generativo completo.

| Perfil | Throughput (tok/s) | Accept length | VRAM del drafter |
| --- | --- | --- | --- |
| **Este modelo (NVFP4)** | **147,87** | **2,792** | **1,41 GB** |
| Drafter BF16 | 141,99 | 2,717 | 2,72 GB |
| Stock RadixArk DSpark | 139,35 | 2,421 | 2,72 GB |
| MTP head integrado | 136,90 | 2,758 | 5,53 GB |
| Sin especulación | 81,58 | — | — |

Desglose por dominio:

| Dominio | Throughput (tok/s) | Accept length |
| --- | --- | --- |
| Matemáticas | 212,9 | 3,45 |
| Código | 192,5 | 3,00 |
| Tool calling | 155,9 | 3,85 |
| Chat | 130,1 | 2,10 |
| Contexto largo | 123,6 | 2,23 |
| Instrucción | 123,0 | 2,13 |

## Requisitos de hardware

- VRAM del drafter: 1,41 GB en NVFP4 (frente a 2,72 GB del drafter BF16).
- VRAM total necesaria: el modelo base Qwen3.8-27B-NVFP4-RTX5090 ocupa aproximadamente 18,8 GB, más el drafter (1,41 GB) y el pool de KV cache. Se requiere una GPU con al menos 32 GB de VRAM para la configuración recomendada.
- GPU recomendada: NVIDIA RTX 5090 de 32 GB (la configuración está optimizada para esta tarjeta; no se garantiza funcionamiento en otras GPUs).
- No cabe en GPUs de consumo con menos de 24 GB de VRAM si se desea usar el contexto completo de 122.880 tokens.
- Opciones de despliegue: exclusivamente mediante SGLang con la imagen `lmsysorg/sglang:qwen38-27b` y los flags especificados en la model card (incluyendo `--speculative-algorithm DSPARK`, `--speculative-draft-model-quantization modelopt_fp4` y `--mamba-ssm-dtype bfloat16`).
- Latencia y throughput: 147,87 tok/s de media en RTX 5090 con concurrencia 1; hasta 212,9 tok/s en dominios de matemáticas.
- Limitación de concurrencia: SGLang limita esta configuración a `max_running_requests = 1` debido al coste de ~147 MB por request del estado GDN; no es posible servir múltiples requests simultáneos en 32 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | VRAM | Throughput (tok/s) | Accept length | Licencia |
| --- | --- | --- | --- | --- | --- |
| **Qwen3.8-27B-DSpark-NVFP4 (este)** | 0,9B | 1,41 GB | 147,87 | 2,792 | Apache 2.0 |
| Drafter BF16 original | 0,9B | 2,72 GB | 141,99 | 2,717 | Apache 2.0 |
| Stock RadixArk DSpark | 0,9B | 2,72 GB | 139,35 | 2,421 | Apache 2.0 |
| MTP head integrado | 5,53 GB | 5,53 GB | 136,90 | 2,758 | Apache 2.0 |

La comparativa se limita a los drafters evaluados en la model card. No se dispone de datos de otros modelos drafter de la misma categoría en el ecosistema Qwen.

## Limitaciones y advertencias

- No es un modelo autónomo: solo funciona como drafter dentro del pipeline de decodificación especulativa de SGLang con el algoritmo DSpark. No puede utilizarse para generación de texto directa.
- Requiere el runtime SGLang específico para Qwen3.8 y la imagen `lmsysorg/sglang:qwen38-27b`; el soporte de DSpark cambia rápidamente, por lo que se recomienda fijar la versión de la imagen.
- La carga del checkpoint exige el flag `--speculative-draft-model-quantization modelopt_fp4`; cualquier otro método de carga fallará.
- Limitación de concurrencia: solo admite una request simultánea en una RTX 5090 de 32 GB; no es adecuado para servicios con alta concurrencia.
- Necesita dejar ~3,5 GB de VRAM libres (`--mem-fraction-static 0.86`); si se usa 0,94, el servidor muere en la primera request larga con un error de OOM en `causal_conv1d_triton.py`.
- El pool de KV cache se asigna optimistamente y no reserva memoria para las activaciones de prefill de GDN, por lo que la configuración de contexto debe ajustarse con margen.
- No se han publicado evaluaciones de sesgos, alucinación o calidad de texto, ya que el modelo no genera contenido por sí mismo.
- Los datos de calibración son disjuntos del conjunto de evaluación, pero la calibración se realizó con un único modelo objetivo (NVFP4); el rendimiento podría variar si se usa con otros checkpoints base.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de componentes de SGLang y NVIDIA ModelOpt que pueden tener sus propias restricciones.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/gittensor-model-hub/Qwen3.8-27B-DSpark-NVFP4)
- [Modelo base cuantizado](https://huggingface.co/gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090-DSpark)
- [Repositorio del modelo base en HuggingFace](https://huggingface.co/gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090/tree/main)
- [Ficha del modelo base en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-nvfp4-rtx5090-gittensor-model-hub)
- [Repositorio oficial de Qwen3.8-27B en GitHub](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Entrada en LLM Explorer](https://llm-explorer.com/model/gittensor-model-hub%2FQwen3.8-27B-NVFP4-RTX5090,3GTDSJKETUAS2CtkUTm8Er)
