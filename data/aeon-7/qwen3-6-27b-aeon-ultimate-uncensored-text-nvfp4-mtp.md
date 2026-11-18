# AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Text-NVFP4-MTP

## Resumen

Qwen3.6-27B-AEON-Ultimate-Uncensored-Text-NVFP4-MTP es una variante cuantizada en formato NVFP4 del modelo abliterado AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16, que a su vez es una ablación de los mecanismos de rechazo (abliteration) sobre Qwen 3.6 de 27B. El autor, AEON-7, distribuye esta versión en formato modelopt compressed-tensors con la torre de visión eliminada, pensada para despliegues solo-texto en GPUs Blackwell con VRAM ajustada (RTX 5090 de 32 GB, RTX PRO 6000, B100/B200). Cuenta con 27.320.697.856 parámetros totales y un repositorio de 27,7 GB.

La propuesta técnica principal es doble: por un lado, la cuantización NVFP4 (4 bits de coma flotante con escalas por bloque) que reduce el peso del modelo respecto a BF16 manteniendo la fidelidad; por otro, la incorporación de una cabeza MTP (multi-token prediction) que habilita decodificación especulativa nativa en vLLM mediante `--speculative-config '{"method":"qwen3_5_mtp","num_speculative_tokens":3}'`. La arquitectura subyacente es híbrida: combina atención lineal GatedDeltaNet (herencia tipo Mamba) con capas de atención clásica, lo que condiciona el esquema de cuantización.

El modelo es relevante para quienes necesitan un 27B sin censura de rechazos, con licencia Apache 2.0 y un pipeline de despliegue medido sobre hardware Blackwell. No obstante, el propio autor marca esta ficha como superada por su línea Qwen3.8, y la mantiene en línea únicamente por razones históricas y de descargas existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención lineal GatedDeltaNet (Mamba) + capas de atención clásica; cabeza MTP nativa (`qwen3_5_mtp`) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | NVFP4 (formato modelopt compressed-tensors, `NVFP4_DEFAULT_CFG` de nvidia-modelopt 0.43.0); existe variante BF16 de referencia |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelopt NVFP4); variante BF16 en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen 3.6 27B y aplica una abliteración descrita por el autor como sin pérdida (KL 0.000492 frente al base, 0/100 rechazos en la evaluación citada). La arquitectura conserva el stack híbrido del base: capas de atención lineal basadas en GatedDeltaNet combinadas con atención estándar, lo que exige un tratamiento específico en la cuantización (el autor menciona "hybrid GDN-aware quantization"). Sobre esa base se injerta una cabeza de predicción multi-token (MTP) que actúa como borrador nativo para decodificación especulativa.

La cuantización se realizó con `nvidia-modelopt` 0.43.0 aplicando `NVFP4_DEFAULT_CFG`, con elecciones de cuantización por proyección. El pipeline de injerto MTP y la receta modelopt proceden del trabajo de sakamakismile sobre el base sin abliterar (serie Qwen3.6-27B-NVFP4-MTP); AEON-7 adaptó esa receta a sus pesos abliterados. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO posteriores al base.

## Capacidades

- Generación de texto conversacional y razonamiento en inglés, chino y otros idiomas (etiqueta `multilingual`).
- Decodificación especulativa nativa mediante cabeza MTP (`qwen3_5_mtp`) con `num_speculative_tokens` configurable (3 en el ejemplo del autor).
- Compatibilidad con decodificación especulativa alternativa basada en drafter DFlash.
- Comportamiento sin rechazos: la abliteración elimina las negativas del modelo base (0/100 rechazos reportados).
- Integración con vLLM mediante `--quantization modelopt`.
- Solo texto: la torre de visión ha sido eliminada en esta variante concreta (la variante multimodal del mismo autor la conserva).
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible; el base Qwen 3.6 lo incorpora, pero la model card no lo detalla para esta variante.

## Casos de uso

- Despliegue solo-texto en RTX 5090 (32 GB): el peso NVFP4 de 20 GB deja margen para caché KV y contexto, permitiendo servir el modelo en una GPU de consumo de gama alta con decodificación especulativa MTP activada.
- Investigación sobre abliteración: útil para estudiar cómo afecta la eliminación de direcciones de rechazo a la calidad del modelo (el autor reporta KL 0.000492 frente al base), comparando contra el BF16 de referencia.
- Generación de contenido creativo sin filtros de rechazo: escenarios donde el modelo base se negaría por políticas de seguridad y se requiere continuidad narrativa, con la advertencia de que la ausencia de rechazos no elimina la responsabilidad del operador.
- Evaluación de cuantización NVFP4 en arquitecturas híbridas: sirve como caso de estudio de cómo se comporta el formato modelopt sobre capas GatedDeltaNet frente a atención clásica, con métricas de throughput publicadas por el autor (hasta ~45 tok/s en matemáticas y código, media de 34,7 tok/s con n_spec=15 en la variante hermana).
- Servicio en clústeres Blackwell (B100/B200, RTX PRO 6000): el formato NVFP4 está pensado para estas GPUs, y la cabeza MTP reduce la latencia por token en cargas interactivas.
- Despliegue multi-tenant con concurrencia: el autor reporta ~84 tok/s agregados con concurrencia ×4 en la variante hermana, lo que lo hace apto para endpoints con varias sesiones simultáneas en vLLM.
- Base para fine-tuning posterior: la variante BF16 (51 GB) es la referencia para ajuste; esta NVFP4 no está pensada para entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta variante concreta. El autor cita cifras de rendimiento de inferencia de la variante hermana `-Multimodal-NVFP4-MTP-XS` (misma receta, mismo formato y misma pila híbrida), medidas en modo greedy con n_spec=15:

| Metrica | Valor reportado (variante hermana) |
|---|---|
| Throughput en matemáticas/código (pico) | ~45 tok/s |
| Throughput medio global | 34,7 tok/s |
| Throughput agregado con concurrencia ×4 | ~84 tok/s |

No se dispone de MMLU, HumanEval, GSM8K ni otras métricas de calidad para esta ficha.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 27,7 GB, pero el autor indica un peso desplegado de ~20 GB en NVFP4 (sin torre de visión); debe sumarse la caché KV según contexto y número de secuencias.
- GPU recomendadas: RTX 5090 (32 GB), RTX PRO 6000 (96 GB), B100 y B200 (arquitecturas sm_120 y sm_100 respectivamente, según las etiquetas del modelo).
- Cabe en GPU de consumo: sí, en RTX 5090 de 32 GB según el autor; no se garantiza en GPUs de 24 GB.
- Opciones de despliegue: vLLM con `--quantization modelopt` y contenedores del autor (`ghcr.io/aeon-7/aeon-vllm-ultimate:latest` para Spark/GB10 o `ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest` para RTX discretas); la imagen v3 `ghcr.io/aeon-7/vllm-aeon-ultimate-dflash:qwen36-v3` se mantiene como objetivo estable con FP8 KV + DFlash.
- Latencia y throughput: ver tabla de benchmarks; cifras medidas en la variante hermana, no en esta ficha.
- Nota: en la imagen nueva, DFlash requiere `--kv-cache-dtype auto` (BF16).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Text-NVFP4-MTP) | 27,3 B | no disponible | NVFP4 modelopt + MTP, solo texto, ~20 GB | Apache 2.0 | Foco en VRAM ajustada y decodificación especulativa nativa |
| AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP | 27,3 B (estimado) | no disponible | NVFP4 modelopt + MTP, multimodal, 27 GB | Apache 2.0 | Misma receta con torre de visión; requiere más VRAM |
| AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16 | 27,3 B | no disponible | BF16, 51 GB | Apache 2.0 | Referencia de precisión completa; apto para fine-tuning |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED | no disponible | no disponible | NVFP4 + FP8 mixto | no disponible | Sucesor recomendado por el autor; capacidad superior según la model card |

## Limitaciones y advertencias

- Modelo abliterado: la eliminación de rechazos implica que puede generar contenido que el base rechazaría; el operador asume la responsabilidad del filtrado posterior.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual para esta variante; la cuantización NVFP4 puede introducir degradación adicional no medida.
- Idiomas: la model card declara en, zh y multilingual, pero no se detalla la cobertura real del resto de idiomas, incluido el español.
- Contexto: la longitud de contexto no se especifica en la información disponible; debe consultarse la configuración del tokenizador y del base Qwen 3.6 antes de dimensionar la caché KV.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base Qwen 3.6 y de la receta de terceros (sakamakismile) deben verificarse por separado.
- Ficha marcada como superada por el propio autor: recomienda migrar a la línea Qwen3.8 Ultimate Uncensored NVFP4-MIXED para trabajo nuevo.
- Solo texto: si se necesita entrada de imagen, debe usarse la variante multimodal.
- Dependencia de versiones concretas de vLLM y de parches propios (sm_121a, PR #44389); la reproducibilidad fuera de esos contenedores no está garantizada.
- Sin resultados de benchmarks propios publicados para esta variante; las cifras citadas provienen de una variante hermana.

## Enlaces

- Hugging Face: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Text-NVFP4-MTP
- Modelo base BF16: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16
- Variante multimodal NVFP4-MTP: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP
- Variante multimodal NVFP4-MTP-XS: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-NVFP4-MTP-XS
- Variante NVFP4 con compressed-tensors + DFlash: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-NVFP4
- Sucesor recomendado (Qwen3.8 NVFP4-MIXED): https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Recetas de operador Qwen3.8: https://github.com/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED
- Guía de despliegue y benchmarks: https://github.com/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-DFlash
- Contenedor vLLM Ultimate (DGX Spark): https://github.com/AEON-7/vllm-ultimate-dgx-spark
- Receta de referencia NVFP4-MTP (sakamakismile): https://huggingface.co/sakamakismile/Qwen3.6-27B-Text-NVFP4-MTP
