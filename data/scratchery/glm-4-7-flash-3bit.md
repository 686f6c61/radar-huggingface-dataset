# scratchery/GLM-4.7-Flash-3bit

## Resumen

GLM-4.7-Flash-3bit es una cuantización afín de 3 bits en formato MLX del modelo zai-org/GLM-4.7-Flash, publicada por el usuario scratchery. El modelo base es un transformer MoE con atención latente (MLA) de la familia `glm4_moe_lite`, con 31,2 mil millones de parámetros totales y aproximadamente 3,3 mil millones activos por token. Esta versión cuantizada conserva 30.495.731.296 parámetros reales en safetensors y ocupa 14,0 GB en el repositorio.

La particularidad técnica de este checkpoint es que preserva la capa de predicción multi-token (MTP, `num_nextn_predict_layers: 1`) que otras conversiones MLX de este modelo descartan. En lugar de eliminar los tensores de `model.layers.47`, los reubica en el espacio de nombres `mtp.*` y los almacena en un sidecar `mtp.safetensors`, siguiendo la convención de los layouts Qwen `-MTP` y Nemotron OptiQ. Esto permite decodificación especulativa en runtimes que lean el sidecar, mientras que los que no lo hagan cargan el modelo como una cuantización sin cabeza MTP.

Es relevante para desarrolladores que trabajan en Apple Silicon y necesitan ejecutar un MoE de ~31B en memoria unificada sin renunciar a las capacidades de draft head. La licencia MIT del modelo base facilita su integración en productos comerciales, aunque la ficha del autor no documenta idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con MLA (atención latente), `glm4_moe_lite`, con capa MTP (`num_nextn_predict_layers: 1`) |
| Parametros totales | 30.495.731.296 (según safetensors); 31,2B según model card del autor |
| Parametros activos | ~3,3B (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits (cuerpo: expertos, shared expert, MLP denso, `eh_proj`) y 4 bits (hojas MLA, `embed_tokens`, `lm_head`, cabeza MTP); grupo g64 afín MLX; tensores 1-D y router en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX: `weight` uint32 empaquetado + `scales` + `biases`), más sidecar `mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con atención latente multi-cabeza (MLA), identificado en la arquitectura como `glm4_moe_lite`. La model card indica 31,2B parámetros totales y ~3,3B activos, lo que implica un enrutamiento disperso sobre un conjunto de expertos más un shared expert. La atención MLA comprime las proyecciones de query, key y value en representaciones latentes, reduciendo el coste de memoria del KV cache en contextos largos. El modelo incluye una capa MTP de predicción multi-token que actúa como draft head para decodificación especulativa.

Esta publicación no entrena el modelo: es una cuantización del checkpoint bf16 en el snapshot `7dd20894a642a0aa287e9827cb1a1f7f91386b67`. La receta aplica cuantización afín MLX con grupo de 64: 3 bits para los lineales del cuerpo (expertos, shared expert, MLP denso y `eh_proj`), 4 bits para las hojas de atención MLA (`q_a_proj`, `q_b_proj`, `kv_a_proj_with_mqa`, `kv_b_proj`, `o_proj`) y para `embed_tokens` y `lm_head`, y bf16 para tensores 1-D (RMSNorms, `e_score_correction_bias`) y el router (`mlp.gate`). Los 212 tensores de la cabeza MTP se preservan y cuantizan con la misma receta, incluyendo `mtp.embed_tokens` y `mtp.shared_head.*`, y se almacenan en el sidecar `mtp.safetensors` referenciado por `mtp_file` en `config.json`. El script de conversión realiza comprobaciones de ida y vuelta por anchura de bits y rechaza escribir si algún nombre `model.layers.47.*` sobrevive sin renombrar o falta un tensor centinela MTP. No se documentan datos de entrenamiento, composición del dataset ni etapas de RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base GLM-4.7-Flash (no se detallan capacidades específicas en la model card de esta cuantización).
- Decodificación especulativa mediante la capa MTP preservada, en runtimes que lean el sidecar `mtp.safetensors`.
- Carga compatible con mlx-lm como cuantización sin cabeza MTP cuando el runtime no lee el sidecar, manteniendo generación funcional.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint de 14,0 GB cabe en Macs con memoria unificada de 16 GB o más, permitiendo ejecutar un MoE de ~31B en portátiles y equipos de sobremesa Apple sin GPU dedicada.
- Decodificación especulativa en producción: en runtimes que lean el sidecar MTP, la draft head puede acelerar la generación aceptando múltiples tokens por paso de verificación, útil en servicios de chat de baja latencia sobre MLX.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de 3 bits frente a 4 u 8 bits en calidad de generación, aprovechando que el autor documenta comprobaciones de error relativo por ida y vuelta.
- Experimentación con arquitecturas MoE con MLA: investigadores pueden estudiar el comportamiento de atención latente y enrutamiento disperso en un modelo de ~3,3B activos con requisitos de memoria moderados.
- Prototipado de asistentes conversacionales: la ventana de contexto no está documentada, pero el uso de MLA sugiere eficiencia en KV cache para conversaciones multi-turno; conviene validar la longitud efectiva antes de desplegar.
- Reproducibilidad de pipelines de cuantización: el script `quantize_glm47_flash_3bit_mtp.py` y las comprobaciones centinela permiten replicar el proceso y auditar la preservación de la cabeza MTP en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona una comprobación de coherencia mediante decodificación greedy a través de mlx-lm y el error relativo máximo por anchura de bits impreso por el script de cuantización, sin cifras concretas.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 14,0 GB; se recomienda al menos 16 GB de memoria unificada en Apple Silicon para cargar pesos y overhead de inferencia.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y superiores) con memoria unificada suficiente; el formato MLX está orientado a estos chips. No se documenta soporte para A100, H100 ni RTX 4090 en la información disponible.
- ¿Cabe en GPU consumer? En el ecosistema Apple, sí en equipos con 16 GB o más de memoria unificada. En GPUs NVIDIA consumer no se documenta compatibilidad con este formato.
- Opciones de despliegue: mlx-lm (librería declarada), con soporte opcional del sidecar MTP según el runtime. vLLM, llama.cpp, Ollama y TGI no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-4.7-Flash-3bit (este) | 30,5B totales / ~3,3B activos | no disponible | 3/4 bits MLX afín | MIT | Hugging Face, formato MLX |
| zai-org/GLM-4.7-Flash (base) | 31,2B totales / ~3,3B activos | no disponible | bf16 | MIT | Hugging Face |
| Otras cuantizaciones MLX de GLM-4.7-Flash | ~31B | no disponible | variable | MIT | Hugging Face, sin cabeza MTP según el autor |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 3 bits en el cuerpo puede degradar la calidad frente al modelo bf16; el autor solo reporta comprobaciones de error relativo por ida y vuelta, sin evaluación de calidad downstream.
- La cabeza MTP solo se aprovecha si el runtime lee el sidecar `mtp.safetensors`; en caso contrario, el modelo funciona como una cuantización sin draft head y se pierde la aceleración especulativa.
- La longitud de contexto no está documentada en esta ficha; debe validarse empíricamente antes de usarla en producción con contextos largos.
- No se documentan idiomas soportados ni sesgos conocidos del modelo base en la información disponible.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplica el riesgo habitual de los modelos generativos.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base zai-org/GLM-4.7-Flash y de los pesos derivados.
- El checkpoint se creó el 2026-11-17 y no registra descargas ni likes, por lo que carece de validación comunitaria independiente.
- El formato MLX limita el despliegue a entornos Apple; no es portable directamente a CUDA sin conversión.

## Enlaces

- Hugging Face: https://huggingface.co/scratchery/GLM-4.7-Flash-3bit
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Repositorio del script de cuantización: https://github.com/AI-native-Systems-Research/scratchy
- Snapshot del modelo base: `7dd20894a642a0aa287e9827cb1a1f7f91386b67`
