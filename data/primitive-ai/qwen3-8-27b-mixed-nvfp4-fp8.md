# primitive-ai/Qwen3.8-27B-mixed-NVFP4-FP8

## Resumen

`primitive-ai/Qwen3.8-27B-mixed-NVFP4-FP8` es una cuantización de precisión mixta del modelo base `Qwen/Qwen3.8-27B`, publicada por el usuario primitive-ai. El objetivo es reducir el peso del checkpoint de 51,7 GiB en BF16 a aproximadamente 20,7 GiB combinando capas en NVFP4 (4 bits en coma flotante) con capas en FP8, manteniendo una precisión agregada prácticamente idéntica a la del modelo original (88,8 frente a 89,3 en la suite de evaluación del autor, con un margen de repetición de ±1,1 puntos).

La relevancia de esta ficha no está en el modelo base sino en el artefacto de cuantización: emplea `compressed-tensors` y funciona con `vllm serve` sin runtime personalizado, con kernels nativos FP4/FP8 en GPU Blackwell y un fallback Marlin W·A16 en A100. El autor reporta 2,0× de throughput a concurrencia 32 y 2,5× a concurrencia 1 frente a BF16, y conserva la cabeza MTP (multi-token prediction) del checkpoint para decodificación especulativa.

El checkpoint real en safetensors declara 17.463.440.112 parámetros, aunque el nombre comercial del modelo base es Qwen3.8-27B; esta discrepancia entre el nombre y el recuento de pesos debe tenerse en cuenta al planificar memoria. El repositorio ocupa 35,2 GB y tiene licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5` en transformers), derivada de Qwen3.8-27B; cuantización de precisión mixta NVFP4 + FP8 |
| Parametros totales | 17.463.440.112 según safetensors del repo (el nombre del modelo base indica 27B; discrepancia no aclarada en la model card) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | NVFP4 (4 bits FP) y FP8 en capas seleccionadas; `lm_head` en BF16; pesos-only round-to-nearest sin datos de calibración |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors`; tamaño del repo 35,2 GB, peso servido ~20,7 GiB |
| Modelo base | Qwen/Qwen3.8-27B |
| Pipeline | text-generation, image-text-to-text (según tags) |
| Librería | transformers, vllm |
| Descargas / likes | 1.667 / 6 |
| Creado / actualizado | 2026-08-17 / 2026-10-26 |

## Arquitectura y entrenamiento

El artefacto es una cuantización, no un modelo entrenado desde cero. Se aplica cuantización round-to-nearest solo sobre pesos, sin calibración, usando el formato `compressed-tensors` que entiende vLLM de serie. La mezcla combina capas en NVFP4 (bloques de 4 bits en coma flotante, con escalas por bloque) y capas en FP8, decisión que el autor justifica por el equilibrio entre tamaño y precisión medido en su suite. El `lm_head` se mantiene en BF16, lo que según la model card es lo que permite que la ruta de fallback en A100 (Marlin W·A16) cargue correctamente.

La revisión del 2026-10-26 corrige un problema de escalas: `in_proj_qkv` e `in_proj_z` se fusionan en un único módulo en vLLM, que lee una sola escala global; en las capas 8–63 se habían almacenado escalas separadas, de modo que uno de los tensores de cada par se cargaba con la escala equivocada. Se recuantizaron ambos desde BF16 con el mismo cuantizador. El efecto medido: la deriva frente a BF16 en 400 trazas pasó de +109,9 a +30,2 ×10⁻³ nats por token, y la concordancia top-1 subió del 89,0% al 94,3%. Las filas no marcadas como *fixed* en la tabla de benchmarks se midieron en la revisión anterior.

Se preserva la cabeza MTP del checkpoint, lo que permite usar decodificación especulativa con un drafter DSpark; el autor reporta hasta +101% de mejora con esa configuración.

## Capacidades

- Generación de texto conversacional y razonamiento con modo *thinking* forzado en la configuración de evaluación del autor (`--reasoning-parser qwen3`).
- Tool calling / function calling: la suite de evaluación incluye 200 ítems específicos de llamada a herramientas, con métricas separadas de *call* y *abstain*.
- Capacidad multimodal de entrada: los tags incluyen `image-text-to-text`, aunque la model card no detalla el soporte de visión.
- Decodificación especulativa mediante cabeza MTP integrada en el checkpoint.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere despliegue como servicio compatible con API.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- No se documentan capacidades de audio ni de agente multi-paso más allá del tool calling evaluado.

## Casos de uso

- Despliegue de inferencia a gran escala en GPU Blackwell: con 20,7 GiB de peso y kernels nativos FP4/FP8, permite servir el modelo base con 2,0× el throughput de BF16 a concurrencia 32, reduciendo el coste por token en producción.
- Servicio en A100 con presupuesto de memoria ajustado: el fallback Marlin W·A16 y el `lm_head` en BF16 permiten cargar el modelo en Ampere, donde un checkpoint BF16 de 51,7 GiB no cabría en una sola GPU de 40 u 80 GB con margen para KV cache.
- Asistentes conversacionales con razonamiento: el modo thinking y el parser `qwen3` de vLLM permiten separar cadena de razonamiento de respuesta final en un endpoint compatible con OpenAI.
- Automatización con herramientas: los 200 ítems de tool calling de la suite del autor (85,4% de acierto en la revisión corregida) indican un uso viable para agentes que invocan APIs, con una tasa de abstención medible (58,3 sobre la escala reportada).
- Reducción de coste en pipelines de generación larga: el autor mide 651–828 tokens de salida por respuesta con una tasa de finalización del 99,4–99,7%, lo que acota el gasto en tokens de salida por petición.
- Evaluación comparativa de cuantizaciones: el repositorio publica una tabla con nueve builds (BF16, FP8, PrismaAQUA, NVFP4 de varios autores, AWQ-INT4) bajo un protocolo fijo, útil como referencia para elegir variante antes de comprometerse con una.
- Decodificación especulativa en producción: la cabeza MTP preservada permite activar `--speculative-config '{"method":"mtp","num_speculative_tokens":2}'` y obtener hasta +101% con drafter DSpark según el autor.
- Fine-tuning o destilación sobre cuantizado: no recomendado como caso de uso; es un artefacto de inferencia.

## Benchmarks y rendimiento

Datos publicados por el autor. Protocolo: 1.370 ítems (1.170 de conocimiento y 200 de tool calling), `temperature 0.6`, `top_p 0.95`, `top_k 20`, thinking forzado, presupuesto de 16.384 tokens, concurrencia 32, ejecución en una RTX PRO 6000 Blackwell. El `overall` pondera 85,4% conocimiento y 14,6% tool calling. El autor advierte que repetir un mismo checkpoint mueve el resultado ~1,1 puntos, por lo que diferencias inferiores a 1,0 deben tratarse como empate.

| Build | Tamano | Overall | Knowledge | Call | Abstain | Finished | Out/answer | tok/s @32 | Latencia/token | tok/s @1 |
|---|---|---|---|---|---|---|---|---|---|---|
| Qwen BF16 | 51,7 G | 89,3 | 91,0 | 85,6 | 55,0 | 99,1% | 818 | 483 | 66,2 ms | 26,3 |
| Qwen FP8 | 28,7 G | 89,6 | 91,4 | 85,0 | 55,0 | 99,3% | 807 | 752 | 42,6 ms | 45,6 |
| rdtand PrismaAQUA 5.5bit | 22,0 G | 89,4 | 91,2 | 85,6 | 52,5 | 99,6% | 793 | 927 | 34,5 ms | 58,3 |
| unsloth NVFP4 | 21,8 G | 89,6 | 91,4 | 85,0 | 57,5 | 99,6% | 750 | 974 | 32,9 ms | 59,6 |
| **este repo, fixed** (vLLM 0.32.0, sesión aparte) | **20,7 G** | **89,7** | 91,4 | 85,4 | 58,3 | 99,4% | 828 | — | — | — |
| este repo, revisión anterior | 20,7 G | 88,8 | 90,4 | 85,5 | 54,5 | 99,7% | 651 | 908 | 35,3 ms | 66,4 |
| RadixArk NVFP4 | 20,4 G | 89,5 | 91,3 | 85,0 | 52,5 | 99,3% | 782 | 985 | 32,5 ms | 63,7 |
| cyankiwi AWQ-INT4 | 19,6 G | 89,8 | 91,3 | 85,6 | 62,5 | 99,4% | 718 | 956 | 33,5 ms | 69,3 |
| sakamakismile MTP-NVFP4 | 19,1 G | 89,1 | 90,8 | 84,4 | 57,5 | 99,8% | 625 | 965 | 33,1 ms | 67,8 |
| gittensor NVFP4-RTX5090 | 17,5 G | 90,1 | 91,6 | 86,2 | 60,0 | 99,7% | 809 | 1151 | 27,8 ms | 69,3 |

Nota: la fila *fixed* se midió en una sesión separada con vLLM 0.32.0 y no incluye medidas de throughput; las métricas de velocidad corresponden a la revisión anterior. No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: ~20,7 GiB solo de pesos; añadir KV cache y overhead de activaciones. Para contexto largo y concurrencia 32 conviene reservar al menos 40–48 GiB totales.
- GPU recomendadas: Blackwell (RTX PRO 6000, B200, RTX 5090) para kernels nativos FP4/FP8; A100 con fallback Marlin W·A16.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GiB o más (RTX 4090, RTX 5090), aunque la ruta óptima de kernels requiere Blackwell; en Ada la ruta FP4 puede no estar disponible de forma nativa.
- Despliegue: `vllm serve` con `--reasoning-parser qwen3` y, opcionalmente, `--speculative-config '{"method":"mtp","num_speculative_tokens":2}'`. Compatible con `compressed-tensors`; no requiere runtime propio.
- Throughput medido por el autor (revisión anterior, RTX PRO 6000 Blackwell): 908 tok/s a concurrencia 32 y 66,4 tok/s a concurrencia 1, con 35,3 ms de latencia por token. Los builds comparables del mismo fabricante alcanzan 956–1151 tok/s a concurrencia 32.
- A100: verificado de extremo a extremo según el autor; sin cifras de rendimiento publicadas para esa GPU.

## Comparativa con modelos similares

| Modelo | Tamano | Overall (autor) | Licencia | Notas |
|---|---|---|---|---|
| Este repo (fixed) | 20,7 G | 89,7 | Apache 2.0 | NVFP4+FP8 mixto, MTP preservado, funciona en A100 y Blackwell |
| Qwen/Qwen3.8-27B (BF16) | 51,7 G | 89,3 | Apache 2.0 | Referencia sin cuantizar; 2,5× más grande, 483 tok/s @32 |
| Qwen/Qwen3.8-27B-FP8 | 28,7 G | 89,6 | Apache 2.0 | FP8 oficial de Qwen; 752 tok/s @32 |
| unsloth/Qwen3.8-27B-NVFP4 | 21,8 G | 89,6 | no disponible | NVFP4; 974 tok/s @32, 59,6 tok/s @1 |
| cyankiwi/Qwen3.8-27B-AWQ-INT4 | 19,6 G | 89,8 | no disponible | INT4 AWQ; mejor tok/s @1 de la tabla (69,3), 956 tok/s @32 |
| gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090 | 17,5 G | 90,1 | no disponible | El más pequeño y rápido a concurrencia 32 (1151 tok/s), orientado a RTX 5090 |

Todas las diferencias de `overall` entre builds caen dentro del margen de repetición de ~1,1 puntos que reporta el autor, salvo la revisión anterior de este repo (88,8), que sí queda por debajo del resto. La comparativa de velocidad está dominada por el hardware y la versión de vLLM, no solo por el formato de cuantización.

## Limitaciones y advertencias

- Discrepancia entre el nombre (27B) y el recuento real de parámetros en safetensors (17,46B): verificar antes de dimensionar memoria o comparar con otros checkpoints.
- La fila con mejor resultado (`fixed`, 89,7) se midió en una sesión separada con vLLM 0.32.0 y sin métricas de throughput; no es directamente comparable en velocidad con el resto de filas.
- El margen de repetición del propio autor (~1,1 puntos) es mayor que la separación entre casi todos los builds: no interpretar diferencias de precisión inferiores a 1,0 como mejoras reales.
- La revisión anterior tenía un fallo de escalas en las capas 8–63 que degradaba la concordancia top-1 al 89,0%; si se descargó antes del 2026-10-26, conviene volver a descargar.
- Cuantización round-to-nearest sin calibración: no hay garantía de que el comportamiento se mantenga en dominios alejados de la suite de evaluación del autor (conocimiento general y tool calling).
- No se declaran idiomas soportados ni longitud de contexto; ambos datos son necesarios para evaluar el encaje en producción y no están disponibles en la información proporcionada.
- Riesgo de alucinación y sesgos del modelo base: no cuantificados en la model card; la cuantización puede ampliar la degradación en tareas de razonamiento largo.
- La tasa de abstención en tool calling (58,3 sobre la escala del autor) implica que una parte relevante de los ítems no produce llamada; validar con datos propios antes de desplegar agentes.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B debe verificarse por separado si se redistribuye.
- Solo 6 likes y 1.667 descargas: ecosistema de validación pequeño en comparación con los builds de unsloth o Qwen oficial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/primitive-ai/Qwen3.8-27B-mixed-NVFP4-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión FP8 oficial de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Alternativa NVFP4 de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Alternativa NVFP4 de RadixArk: https://huggingface.co/RadixArk/Qwen3.8-27B-NVFP4
- Alternativa AWQ-INT4 de cyankiwi: https://huggingface.co/cyankiwi/Qwen3.8-27B-AWQ-INT4
- Alternativa MTP-NVFP4 de sakamakismile: https://huggingface.co/sakamakismile/Qwen3.8-27B-MTP-NVFP4
- Alternativa NVFP4 para RTX 5090 de gittensor: https://huggingface.co/gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090
- Alternativa PrismaAQUA de rdtand: https://huggingface.co/rdtand/Qwen3.8-27B-PrismaAQUA-5.5bit-vllm
- Web del autor: https://primitive.com
- Papers, blogs o demos adicionales: no disponible en la información proporcionada.
