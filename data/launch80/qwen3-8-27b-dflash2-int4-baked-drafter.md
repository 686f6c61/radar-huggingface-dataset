# Launch80/Qwen3.8-27B-DFlash2-Int4-baked-drafter

## Resumen

Este repositorio no contiene un modelo de lenguaje autónomo, sino un **modelo borrador (drafter) para decodificación especulativa**, concretamente la versión cuantizada a GPTQ INT4 del drafter DFlash 2 de Inco AI (z-lab) para la familia Qwen3.8-27B. Lo publica el usuario Launch80 y su función es proponer tokens que un modelo objetivo de la familia Qwen3.8-27B verifica después dentro del modo `dflash` de vLLM. No genera texto por sí solo: comparte el *embedding* y el `lm_head` del objetivo y solo aporta las cinco capas de decodificador que producen los borradores.

El problema que resuelve es de ancho de banda de memoria. En una tarjeta única limitada por lectura de pesos, los pesos del drafter se leen una vez por cada paso de verificación; en una Intel Arc Pro B65 el drafter en bf16 añadía unos 8 ms a un paso de 41 ms, mientras que esta versión INT4 añade unos 2,5 ms. El resultado medido con el objetivo Launch80/Swift-1.5-Qwen3.8-27B-Uncensored-Int4-baked es un aumento de 80,5 tok/s (MTP integrado, k=6) a 96,7 tok/s en decodificación de un solo flujo, con 4,23 tokens aceptados por paso, a cambio de una pérdida de aceptación del 1,6%.

Es relevante ahora porque permite desplegar decodificación especulativa con drafter en GPUs de gama de workstation y en aceleradores Intel XPU con un coste de VRAM de alrededor de 1,5 GB en lugar de 3,85 GB, sin reentrenar nada y manteniendo la compatibilidad con cualquier derivado de Qwen3.8-27B que ya funcionase con el drafter original en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador borrador DFlash 2 (block-diffusion) de 5 capas, con convoluciones dinámicas, selector de candidatos y proyecciones de atención; comparte embedding y `lm_head` con el modelo objetivo |
| Parametros totales | 1.924.404.480 (aprox. 1,92 B), según los safetensors del repositorio |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible de forma explícita; la evaluación publicada se realizó con contexto de 128k y la ventana efectiva la fija el modelo objetivo |
| Tipos de cuantizacion | GPTQ INT4 simétrico con group size 128 en `o_proj`, `gate_proj`, `up_proj` y `down_proj` de las cinco capas y en el `fc` de estados ocultos auxiliares; el resto se mantiene en bf16 (`q_proj`, `k_proj`, `v_proj`, convoluciones dinámicas, selector de candidatos y normas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pesos GPTQ empaquetados + tensores bf16) |
| Autor | Launch80 (cuantización y evaluación); drafter original de z-lab / Inco AI |
| Modelo base | z-lab/Qwen3.8-27B-DFlash2 (relación: quantized) |
| Tamano del repositorio | 1,5 GB en INT4 frente a 3,85 GB en bf16 |
| Fecha de publicacion | 13 de octubre de 2026 |

## Arquitectura y entrenamiento

No hay entrenamiento en este repositorio: es un artefacto de cuantización sobre el drafter DFlash 2 de Inco AI. El drafter es un bloque de difusión por bloques de cinco capas de decodificador que propone varios tokens candidatos por paso y un selector de candidatos que los ordena; las proyecciones `q_proj`, `k_proj` y `v_proj` (que vLLM usa como rodajas de precómputo de la KV de contexto en DFlash) se pesan directamente y por eso se conservan en bf16, igual que las dos convoluciones dinámicas y todas las normas. El modelo comparte el *embedding* y la cabeza de lenguaje del objetivo, de modo que su vocabulario y su tokenizador son los del modelo verificado.

La calibración se hizo acumulando las matrices de Hessian de las entradas de cada capa lineal cuantizada mediante *forward hooks*, mientras vLLM 0.30.0 servía el objetivo con este drafter acoplado: 320 prompts mixtos de wikitext, UltraChat y CodeParrot, 128 tokens con decodificación greedy cada uno, reservando cada fila número 64 como conjunto de validación. Sobre esas filas se aplicó GPTQ con tres valores de *damping* y se eligió el mejor resultado por capa lineal. El objetivo de calibración fue el cuerpo del modelo Swift 1.5 sin censura; según el autor, el drafter debería funcionar con cualquier derivado de Qwen3.8-27B con el que funcionase la versión bf16, pero la aceptación solo se ha medido en ese objetivo. No se aplica truncado de vocabulario del borrador (el prefijo R6 que ayuda a los borradores MTP), porque cuesta alrededor de un 10 % de aceptación a cambio de unos 2 ms de tiempo de paso.

## Capacidades

- Generación de tokens borrador para decodificación especulativa en vLLM (método `dflash`), con hasta `num_speculative_tokens` candidatos por paso (7 en la configuración de ejemplo).
- Propuesta de bloques de tokens mediante difusión por bloques, con verificación posterior por parte del modelo objetivo; el borrador nunca decide la salida final.
- Integración en el bucle de inferencia del objetivo: comparte su *embedding* y su `lm_head`, por lo que hereda su vocabulario, su tokenizador y sus idiomas.
- Rendimiento medido de 4,23 tokens aceptados por paso con el objetivo Swift-1.5-Qwen3.8-27B-Uncensored-Int4-baked.
- Compatibilidad declarada con cualquier derivado de Qwen3.8-27B que ya aceptase el drafter bf16 original.
- No soporta *tool calling*, función de agente, visión, audio ni razonamiento autónomo: no es un modelo conversacional y no produce respuestas utilizables de forma aislada.
- No tiene modo *thinking* ni capacidades multilingües propias documentadas; dependen enteramente del modelo objetivo.

## Casos de uso

- Aceleración de servidores vLLM con objetivo Qwen3.8-27B: se añade con `--speculative-config '{"method":"dflash", ...}'` al comando `vllm serve` para elevar el throughput de decodificación en un solo flujo de 80,5 a 96,7 tok/s en la medición publicada.
- Despliegue en GPUs con VRAM limitada: al ocupar 1,5 GB en lugar de 3,85 GB, libera alrededor de 2,3 GB que pueden destinarse a mayor contexto en la KV cache o a un lote más grande.
- Inferencia sobre Intel XPU (Arc Pro B65): es el escenario donde se midió la ganancia de latencia por paso (unos 2,5 ms añadidos frente a unos 8 ms con bf16), con el parche `patch_dflash_mixed_dtype.py` del repositorio launch80/B65 para mezclas de precisión fp16/bf16.
- Servicio de contexto largo: la evaluación se realizó con 128k de contexto, de modo que sirve para cargas de trabajo de documentos largos donde el cuello de botella es la lectura de pesos del borrador en cada paso de verificación.
- Reducción de coste por token en producción: al aumentar los tokens aceptados por paso sin tocar el modelo objetivo, baja el número de pasos de decodificación necesarios por token generado.
- Despliegue edge o de una sola tarjeta para asistentes de código o chat interno: con un objetivo de 27B cuantizado en INT4 y este borrador, el conjunto cabe en configuraciones de una única GPU de 24-48 GB.
- Evaluación comparativa de decodificación especulativa: sirve como referencia para medir aceptación y latencia frente al drafter bf16 o al MTP integrado del objetivo.

## Benchmarks y rendimiento

Datos publicados por el autor (BetterBench 0.4.0, ejecución rápida, mediana ponderada, contexto de 128k, un solo flujo, objetivo Launch80/Swift-1.5-Qwen3.8-27B-Uncensored-Int4-baked):

| Configuracion | Throughput | Tokens aceptados por paso |
|---|---|---|
| MTP integrado del objetivo, k=6 | 80,5 tok/s | no disponible |
| Drafter DFlash2 INT4 (este repositorio) | 96,7 tok/s | 4,23 |

Sonda de 8 prompts sobre el coste por paso en Intel Arc Pro B65:

| Drafter | Lectura relativa por paso | Tiempo anadido a un paso de 41 ms | Aceptacion |
|---|---|---|---|
| bf16 (z-lab/Qwen3.8-27B-DFlash2) | 84,6 | ~8 ms | referencia |
| INT4 (este repositorio) | 92,4 | ~2,5 ms | -1,6 % |

Error L2 relativo de salida, GPTQ frente a redondeo al más cercano (RTN), por capa lineal:

| Lineal | GPTQ (este repositorio) | RTN |
|---|---|---|
| `fc` | 2,94 % | 5,65 % |
| capa 0: o / gate / up / down | 1,01 / 2,98 / 4,27 / 1,32 % | 1,68 / 6,01 / 8,60 / 2,79 % |
| capa 1: o / gate / up / down | 2,21 / 3,76 / 4,46 / 1,72 % | 4,73 / 7,46 / 8,84 / 4,17 % |
| capa 2: o / gate / up / down | 3,59 / 3,28 / 3,90 / 4,60 % | 6,90 / 6,93 / 8,20 / 8,26 % |
| capa 3: o / gate / up / down | 5,49 / 3,19 / 3,95 / 5,01 % | 10,17 / 6,55 / 8,09 / 9,06 % |
| capa 4: o / gate / up / down | 4,34 / 3,78 / 3,57 / 0,89 % | 9,00 / 19,94 / 18,85 / 4,37 % |

No hay resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo esperable porque el drafter no es un modelo evaluable de forma independiente.

## Requisitos de hardware

- VRAM para inferencia: unos 1,5 GB de pesos en INT4 (frente a 3,85 GB en bf16), más la memoria de activaciones y la KV del objetivo.
- GPU recomendadas: Intel Arc Pro B65 (plataforma donde se midió el rendimiento), GPUs NVIDIA con soporte de vLLM para el objetivo de 27B (A100, H100, L40S, RTX 4090/5090 según cuantización del objetivo).
- Cabe en GPU de consumo en el sentido de que el drafter añade poco más de 1,5 GB, pero el modelo objetivo de 27B es el que determina si el conjunto entra en una tarjeta doméstica.
- Opciones de despliegue: vLLM 0.30.0 o superior con `--speculative-config` y `"quantization":"gptq"`; en XPU requiere el parche de arranque `patch_dflash_mixed_dtype.py` del repositorio launch80/B65 cuando el objetivo va en fp16 y el drafter en bf16. En CUDA basta con `--dtype bfloat16` en el objetivo.
- Latencia y throughput medidos: paso base de 41 ms en Arc Pro B65 con unos 2,5 ms añadidos por el drafter INT4; 96,7 tok/s en decodificación de un solo flujo con 4,23 tokens aceptados por paso.
- El drafter debe ejecutarse en bf16: casteado a fp16 propone basura (0 de 2.681 borradores aceptados en la prueba del autor), porque las activaciones residuales del objetivo desbordan su proyección de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / precision | Tamano | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|---|
| Este repositorio (DFlash2 INT4 baked) | ~1,92 B | safetensors, GPTQ INT4 + bf16 | 1,5 GB | fijado por el objetivo (medido a 128k) | 96,7 tok/s, 4,23 tokens aceptados/paso | apache-2.0 |
| z-lab/Qwen3.8-27B-DFlash2 (drafter bf16 original) | no disponible (repo de 3,85 GB) | safetensors bf16 | 3,85 GB | fijado por el objetivo | ~8 ms añadidos por paso; 84,6 de lectura relativa; aceptación 1,6 % superior | apache-2.0 |
| MTP integrado del objetivo Qwen3.8-27B | no disponible (parte del objetivo) | bf16 | no disponible | el del objetivo | 80,5 tok/s con k=6 | la del modelo objetivo |

No se dispone de otros borradores comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin un objetivo de la familia Qwen3.8-27B acoplado en vLLM no produce ninguna salida útil.
- La aceptación solo se ha medido sobre el objetivo Swift-1.5-Qwen3.8-27B-Uncensored-Int4-baked; con otros derivados de Qwen3.8-27B el comportamiento es una extrapolación del autor, no una medición.
- Ejecutarlo en fp16 en lugar de bf16 inutiliza por completo los borradores (0 aceptados de 2.681 en la prueba publicada).
- La lista `modules_in_block_to_quantize` de `config.json` es libre de índices y usa nombres fusionados; si vLLM no la hace coincidir por subcadena con los nombres en tiempo de ejecución (que llevan el desplazamiento de capas del objetivo, por ejemplo `layers.64…`, y `gate_up_proj` fusionado), el drafter se carga sin cuantizar y falla con los pesos empaquetados.
- El truncado de vocabulario del borrador no se aplica: reduce la aceptación alrededor de un 10 % para ahorrar cerca de 1 ms de paso.
- El modelo no tiene idiomas, sesgos ni alucinaciones propios evaluados; su comportamiento lingüístico y de contenido depende íntegramente del modelo objetivo, incluida cualquier característica del cuerpo sin censura usado en la calibración.
- Comercialmente la licencia apache-2.0 es permisiva, pero conviene conservar el fichero `NOTICE` y la atribución a z-lab / Inco AI como autores del drafter original.
- Repositorio con 0 descargas y 0 *likes* en el momento de la consulta: no hay validación por parte de terceros ni informes de reproducibilidad independientes.
- El calibrado se hizo con 320 prompts y 128 tokens greedy por prompt, un conjunto reducido que puede no representar dominios muy alejados de wikitext, UltraChat y CodeParrot.
- Las fechas del repositorio (octubre de 2026) y el nombre del modelo base corresponden a los metadatos publicados; no se ha podido contrastar la información con documentación adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Launch80/Qwen3.8-27B-DFlash2-Int4-baked-drafter
- Modelo base (drafter bf16): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo objetivo usado en la evaluación: https://huggingface.co/Launch80/Swift-1.5-Qwen3.8-27B-Uncensored-Int4-baked
- Página de resultados del autor: https://launch80.com/a/602f86d7-b0d3-4d2b-9c94-1037fe1d3cd3
- Repositorio con el parche para XPU (`patch_dflash_mixed_dtype.py`): https://github.com/launch80/B65

La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo; los resultados obtenidos no guardan relación con el contenido de la ficha y se han descartado.
