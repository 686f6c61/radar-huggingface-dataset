# RelaxingSnorlax/Qwen3.8-27B-speculator.dspark-hs1

## Resumen

Qwen3.8-27B-speculator.dspark-hs1 es un modelo borrador (*draft model*) para decodificación especulativa, publicado por el usuario RelaxingSnorlax en Hugging Face y derivado de RedHatAI/Qwen3.8-27B-speculator.dspark. No es un modelo generativo autónomo: su función es proponer tokens candidatos que un modelo objetivo (*target*) de mayor tamaño verifica, acelerando la inferencia en vLLM mediante el método `dspark`. El checkpoint contiene 1.804.930.817 parámetros (~1,8 mil millones) en formato safetensors, con un repositorio de 3,6 GB.

La variante `hs1` es un artefacto de ablación: consume una única capa de estados ocultos del modelo objetivo (`aux_hidden_state_layer_ids = [32]`) en lugar de las ocho capas del checkpoint original (`[4, 12, 20, 28, 36, 44, 52, 60]`). El propósito declarado es medir el coste de la ruta de estados ocultos en vLLM (captura y transferencia de salidas de capa en el lado objetivo, la GEMM `fc` de dimensión 5120×5120 y el forward del borrador) frente a las líneas base entrenadas.

Advertencia crítica: el tensor `fc.weight` (proyección combinadora de estados ocultos, forma `[5120, 5120]`) se reinicializó con valores aleatorios, mientras que el resto de tensores se copiaron sin cambios del checkpoint fuente. Por tanto, las tasas de aceptación de este checkpoint son nulas (~0 tokens aceptados) y carecen de significado; solo sirve para medir coste computacional, nunca para producción ni para evaluar calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo borrador DSpark para decodificación especulativa (arquitectura exacta no disponible; consume estados ocultos del modelo objetivo) |
| Parámetros totales | 1.804.930.817 (~1,8 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa del método DSpark, diseñado para operar junto a un modelo objetivo Qwen3.8-27B. Su entrada incluye estados ocultos capturados del modelo objetivo: en esta variante, únicamente la salida de la capa 32 (`aux_hidden_state_layer_ids = [32]`), que se combinan mediante la proyección `fc` de forma `[5120, 5120]` antes del forward del borrador. El checkpoint original de RedHatAI empleaba ocho capas (`[4, 12, 20, 28, 36, 44, 52, 60]`), de modo que esta variante reduce la dimensión de entrada del combinador de `8×5120` a `1×5120`.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo RLHF o DPO. El checkpoint se generó con el script `make_dspark_hs_variants.py` y, en esta variante, el tensor `fc.weight` fue reinicializado aleatoriamente mientras el resto de tensores se copiaron del checkpoint fuente entrenado. En consecuencia, el modelo no ha sido entrenado para esta configuración de una sola capa: es un instrumento de medición de sobrecarga, no un borrador funcional.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa en vLLM mediante `method: "dspark"` (funcionalidad nominal; inutilizada por los pesos aleatorios de `fc`).
- Integración con un modelo objetivo Qwen3.8-27B a través de `--speculative-config` en `vllm serve`.
- Configuración de `num_speculative_tokens` ajustable (el ejemplo de la model card usa 7).
- Consumo de estados ocultos auxiliares del modelo objetivo (una capa en esta variante).
- No soporta tool calling, agentes, visión, audio ni modo thinking de forma propia: es un componente auxiliar de inferencia, no un modelo de chat.
- Capacidades multilingües: no disponibles (no aplica como modelo borrador).

## Casos de uso

- Ablación del número de capas de estados ocultos: comparar la sobrecarga de la ruta de captura y transferencia con 1 capa frente a las 8 del checkpoint entrenado, midiendo latencia y throughput en vLLM.
- Perfilado de la GEMM del combinador: aislar el coste de la proyección `fc` (5120×5120) en el presupuesto total de decodificación especulativa.
- Medición del coste del forward del borrador: cuantificar cuánto tiempo consume el forward de ~1,8 B parámetros independientemente de la tasa de aceptación.
- Validación de infraestructura de decodificación especulativa: probar pipelines de despliegue con `--speculative-config` y `method: "dspark"` antes de integrar el checkpoint entrenado.
- Benchmarking de hardware: comparar GPUs (A100, H100, RTX 4090) en el coste de la ruta de estados ocultos con una carga de trabajo fija y reproducible.
- Referencia negativa de aceptación: verificar que el sistema de métricas de vLLM reporta ~0 tokens aceptados con pesos aleatorios, como comprobación de sanidad del instrumento de medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las tasas de aceptación de este checkpoint son nulas (~0 tokens aceptados) y sin significado, por lo que no procede presentar métricas de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,6 GB en precisión original (fp16/bf16, según el tamaño del repositorio); ~1,8 GB en cuantización de 8 bits y ~0,9 GB en 4 bits (estimaciones teóricas a partir del número de parámetros, no verificadas).
- El borrador se ejecuta junto al modelo objetivo Qwen3.8-27B, cuyo peso en VRAM domina el requisito total; el borrador añade una sobrecarga comparativamente pequeña.
- GPU recomendadas: H100 o A100 para el conjunto objetivo+borrador; en consumer, una RTX 4090 (24 GB) no permite alojar el objetivo de 27 B en precisión completa, pero el borrador por sí solo cabe holgadamente en cualquier GPU con 8 GB o más.
- Despliegue: vLLM con soporte del método `dspark` y `custom_code`; no se documentan opciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el propósito del checkpoint es precisamente medir la sobrecarga de la ruta de estados ocultos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas de estados ocultos | Licencia | Estado de pesos | Propósito |
|---|---|---|---|---|---|
| Qwen3.8-27B-speculator.dspark-hs1 (este) | ~1,8 B | 1 (`[32]`) | Apache 2.0 | `fc` aleatorio | Ablación de coste |
| RedHatAI/Qwen3.8-27B-speculator.dspark | no disponible | 8 (`[4, 12, …, 60]`) | no disponible en la información | Entrenado | Borrador funcional |
| Otros borradores de decodificación especulativa | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Pesos no funcionales: `fc.weight` se reinicializó aleatoriamente; la tasa de aceptación es ~0 y el modelo no acelera la inferencia real.
- Uso restringido a benchmarking: no debe desplegarse en producción ni emplearse para evaluar calidad de generación.
- Solo mide coste: los resultados obtenidos con este checkpoint reflejan la sobrecarga de la ruta de estados ocultos, no el comportamiento del borrador entrenado.
- Dependencia de vLLM y del método `dspark`: requiere una versión de vLLM con soporte para esta técnica y `custom_code`.
- Dependencia del modelo objetivo: debe emparejarse con Qwen3.8-27B; no es reutilizable con otros objetivos sin verificación.
- Sin información sobre sesgos, alucinación o cobertura idiomática: al no ser un modelo generativo autónomo, estas categorías no aplican directamente, pero tampoco se documentan.
- Licencia Apache 2.0: permite uso comercial del artefacto, aunque su naturaleza de pesos aleatorios lo hace inútil para cualquier fin productivo.
- Repositorio sin descargas ni likes y creado en noviembre de 2026: sin validación comunitaria ni mantenimiento conocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RelaxingSnorlax/Qwen3.8-27B-speculator.dspark-hs1
- Checkpoint fuente: https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark
- Script de generación citado en la model card: `make_dspark_hs_variants.py` (no se proporciona URL)
- Documentación de decodificación especulativa en vLLM: no disponible en la información proporcionada
- Paper de DSpark: no disponible en la información proporcionada
