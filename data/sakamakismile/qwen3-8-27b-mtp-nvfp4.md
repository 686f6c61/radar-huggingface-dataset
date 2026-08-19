# sakamakismile/Qwen3.8-27B-MTP-NVFP4

## Resumen

Qwen3.8-27B-MTP-NVFP4 es una cuantización NVFP4 (W4A4, group 16) del modelo Qwen/Qwen3.8-27B, un modelo denso de 27.8B parámetros con arquitectura híbrida DeltaNet + full-attention, capacidades de visión (Qwen3-VL) y un cabezal MTP (Multi-Token Prediction) nativo. El autor, sakamakismile, ha reducido el tamaño del modelo de 55.6 GB (bf16) a 20.6 GB, manteniendo el cabezal MTP en bf16 para que la decodificación especulativa funcione sin configuración adicional. Está optimizado para GPUs Blackwell (SM120) y se sirve con vLLM v0.22.0, donde compressed-tensors se detecta automáticamente.

La relevancia de este modelo radica en que permite ejecutar un LLM de 27B con contexto de 128k en GPUs de 16 GB (como las RTX PRO 2000 Blackwell) con alta concurrencia, gracias a la cuantización NVFP4 y al uso de MTP para acelerar la generación. Las mediciones de throughput muestran mejoras de hasta un 48% en agregado de tokens por segundo con MTP activado. Es una opción práctica para despliegues en producción que requieren baja latencia y alta densidad de usuarios, siempre que se disponga de hardware Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida DeltaNet + full-attention, con torre de visión y cabezal MTP |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131072 (128k) |
| Tipos de cuantizacion | NVFP4 (W4A4, group 16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso que combina capas DeltaNet (atención lineal con estado recurrente) con capas de atención completa, e incorpora una torre de visión y un cabezal MTP para predicción de múltiples tokens. La cuantización se realizó con llm-compressor, aplicando NVFP4 W4A4 con group size 16 sobre las capas lineales, excluyendo `lm_head`, la torre de visión, las capas `conv1d` de DeltaNet y el cabezal MTP, que se mantienen en bf16. El proceso de calibración usó 32 muestras de 8192 tokens del dataset `neuralmagic/calibration` y tardó 68 segundos en 8× RTX PRO 2000 Blackwell. Los tensores MTP se reinsertaron en bf16 tras la cuantización y se añadieron a `quantization_config.ignore` para evitar que vLLM los trate como NVFP4. No se dispone de información sobre el entrenamiento original del modelo base (datos, tokens, RLHF, etc.).

## Capacidades

- Generación de texto y razonamiento: es un modelo de razonamiento con fase de "thinking" que requiere `max_tokens` elevados (≥4096) para no truncar el presupuesto de generación.
- Tool calling y agentes: soporta `--enable-auto-tool-choice` y `--tool-call-parser qwen3_xml`, lo que permite integración con herramientas y flujos de agente.
- Decodificación especulativa: el cabezal MTP en bf16 permite usar el método `qwen3_5_mtp` con `num_speculative_tokens=3`, acelerando la generación sin configuración adicional.
- Contexto largo: ventana de 128k tokens, con prefill de 3,820 tok/s a 8k, 3,299 a 32k y 2,363 a 100k tokens (medido con prefix cache desactivado).
- Visión: la torre de visión se incluye en bf16, pero el modo multimodal no fue benchmarkeado en esta versión; el servicio por defecto es solo texto.
- Multilingüismo: no se especifican idiomas soportados en la información disponible.

## Casos de uso

- Atención al cliente automatizada: con 128k de contexto, puede gestionar conversaciones multi-turno largas y mantener el historial completo del usuario, reduciendo la pérdida de información en interacciones prolongadas.
- Generación de código en producción: el soporte de tool calling permite integrarlo en pipelines de CI/CD para autocompletar, revisar o generar código, con la ventaja de la decodificación especulativa para reducir la latencia.
- Análisis de documentos extensos: su ventana de 128k permite procesar informes, contratos o artículos largos de una sola pasada, extrayendo resúmenes o respondiendo preguntas sobre el contenido.
- Despliegue de APIs de alta concurrencia: las mediciones muestran hasta 386.9 tok/s agregados con 8 peticiones concurrentes y MTP activado, lo que lo hace adecuado para servicios con muchos usuarios simultáneos.
- Razonamiento complejo y resolución de problemas: su modo de razonamiento explícito (thinking) es útil para tareas que requieren pasos intermedios, como planificación, matemáticas o diagnóstico técnico.
- Asistentes virtuales con herramientas: al combinar tool calling y razonamiento, puede actuar como agente que consulta bases de datos, ejecuta comandos o interactúa con APIs externas de forma autónoma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos de rendimiento se limitan a mediciones de throughput de inferencia realizadas por el autor con TP=4, contexto 128k, KV cache en fp8 y GPUs RTX PRO 2000 Blackwell:

| Concurrencia | Sin MTP (agregado t/s) | Con MTP n=3 (agregado t/s) |
|---|---|---|
| 1 | 49.0 | 72.6 |
| 2 | 93.2 | 110.9 |
| 4 | 180.9 | 232.8 |
| 8 | 318.3 | 386.9 |

Prefill single-stream (media de 3 ejecuciones, prefix cache desactivado): 3,820 tok/s a 8k, 3,299 a 32k y 2,363 a 100k tokens. La capacidad de KV cache en GPU a TP=4/128k es de 1,025,977 tokens (7.83× la concurrencia).

## Requisitos de hardware

- VRAM estimada: los pesos NVFP4 ocupan 20.6 GB, pero con KV cache y overhead de inferencia se recomienda al menos 24 GB por GPU. El autor probó con 8× RTX PRO 2000 Blackwell de 16 GB para la calibración y con 4× para el servicio.
- GPUs compatibles: exclusivamente GPUs NVIDIA con arquitectura Blackwell (SM120), como RTX PRO 2000, RTX PRO 4000, B200, etc. No funciona en Ampere o anteriores.
- Despliegue: vLLM v0.22.0 (o superior) con `--trust-remote-code`, `--tensor-parallel-size` según el número de GPUs, `--kv-cache-dtype fp8` y `--speculative-config '{"method":"qwen3_5_mtp","num_speculative_tokens":3}'`. En placas sin P2P se requiere `NCCL_P2P_DISABLE=1` y `--disable-custom-all-reduce`.
- Latencia y throughput: los datos de la tabla anterior indican que con 4 GPUs y MTP se alcanzan 72.6 tok/s agregados a concurrencia 1 y 386.9 a concurrencia 8. No se proporcionan mediciones de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Tamaño |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27.8B | 128k | bf16 | Apache-2.0 | 55.6 GB |
| Qwen3.8-27B-MTP-NVFP4 | 27.36B | 128k | NVFP4 W4A4 | Apache-2.0 | 20.6 GB |

No se dispone de información sobre otras cuantizaciones del mismo modelo (AWQ, GPTQ, etc.) ni de modelos comparables de otros fabricantes con características equivalentes. La comparativa se limita al modelo base, del que se diferencia por el tamaño reducido y la optimización para Blackwell.

## Limitaciones y advertencias

- Requiere hardware Blackwell (SM120): no es ejecutable en GPUs de generaciones anteriores, lo que limita su portabilidad.
- La cuantización NVFP4 W4A4 puede introducir pérdida de precisión respecto al modelo bf16 original, aunque no se han publicado evaluaciones de calidad que cuantifiquen este efecto.
- El modo W4A16 (NVFP4A16) no funciona en vLLM 0.22 con esta arquitectura (error `gptq_marlin_repack: size_n=24 not divisible by tile_n_size=64`); solo es válido W4A4.
- Es un modelo de razonamiento: si se usa con `max_tokens` bajo, la fase de "thinking" consume el presupuesto y la respuesta final puede quedar truncada.
- Los módulos `mtp.*` están en `quantization_config.ignore`; si se eliminan o se tratan como NVFP4, la decodificación especulativa falla silenciosamente (0% de aceptación) y el rendimiento empeora.
- La torre de visión se incluye en bf16, pero el modo multimodal no fue benchmarkeado; el uso con imágenes o vídeo no está validado.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.), por lo que el impacto de la cuantización en tareas específicas es desconocido.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales; se recomienda revisar la licencia de Qwen3.8-27B.

## Enlaces

- Modelo cuantizado: https://huggingface.co/sakamakismile/Qwen3.8-27B-MTP-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
