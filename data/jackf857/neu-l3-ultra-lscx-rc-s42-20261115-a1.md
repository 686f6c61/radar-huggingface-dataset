# jackf857/neu-l3-ultra-lscx-rc-s42-20261115-a1

## Resumen

neu-l3-ultra-lscx-rc-s42-20261115-a1 es un checkpoint de investigación de optimización de preferencias (DPO con reward calibration y control LSC) construido sobre Llama 3 8B. Lo desarrolla el usuario jackf857 y parte del modelo base `W-61/llama-3-8b-base-sft-ultrachat-8xh200`, un Llama 3 8B ya ajustado con SFT sobre UltraChat. El modelo resuelve, en el plano experimental, la pregunta de cómo calibrar las contribuciones de gradiente de pares chosen/rejected en DPO mediante estadísticas del head de salida (RC) y un controlador de beta en lazo cerrado (LSC) alimentado por el margen DPO en crudo.

Arquitectura LlamaForCausalLM estándar de 32 capas, 8.030.261.248 parámetros (8B densos), pesos en safetensors sin cuantizar y licencia Llama 3. El entrenamiento se realizó sobre 61.135 pares de preferencia del split `train_prefs` de UltraFeedback binarized, durante 477 pasos de optimizador en 4 GPU H200, con precisión bfloat16 y atención SDPA.

Es relevante ahora porque documenta de forma reproducible (commits, hashes SHA-256, trayectorias y logs archivados) una variante de DPO con control adaptativo de beta, un área activa de investigación en alineamiento. No obstante, el propio autor lo presenta como checkpoint de investigación, sin evaluación held-out ni benchmarks de generación, por lo que no debe tratarse como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only denso, 32 capas) |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (entrenamiento con máximo 2048 tokens de secuencia y 1800 de prompt) |
| Tipos de cuantización | no disponible; los tensores se publican sin cuantizar (float32 serializado en config, bfloat16 en entrenamiento) |
| Idiomas soportados | no disponibles (hereda el tokenizer de Llama 3) |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors |
| Tamaño del repo | 32,1 GB |
| Librería | transformers 4.51.0 |
| Precisión de entrenamiento | bfloat16, atención SDPA |
| Dataset de preferencias | HuggingFaceH4/ultrafeedback_binarized (split train_prefs, 61.135 pares) |
| Hardware de entrenamiento | 4 × NVIDIA H200 (Northeastern Explorer) |

## Arquitectura y entrenamiento

El modelo es un Llama 3 8B denso con 32 capas, inicializado desde el checkpoint SFT `W-61/llama-3-8b-base-sft-ultrachat-8xh200` (revisión `3e76fb18e464425d6e89fdcc025cd6b701c90e1a`), que se usa simultáneamente como política inicial y como referencia congelada. El ajuste es DPO (preference optimization) sobre pares chosen/rejected, con beta inicial 0,01, optimizador adamw_torch, learning rate 5e-7, schedule cosine con warmup ratio 0,1, gradient clipping 1,0 y weight decay 0,0. El batch efectivo de pares es 128 (4 por GPU × 4 GPU × 8 de acumulación), con 477 pasos de optimizador completados (época registrada ≈ 0,999).

La innovación técnica reside en dos mecanismos acoplados. RC (reward calibration) recalibra las contribuciones de gradiente de chosen y rejected usando estadísticas del gradiente del head de salida, con `db_calibration_enable=True`, `db_calibration_eps=1e-12` y `db_ema_beta=0,98`. LSC (control en lazo cerrado) aporta el escalar beta mientras el mecanismo partner (`rc_dpo`) permanece activo; la señal de control es el margen DPO en crudo (`lsc_signal: dpo_margin`), con `beta_policy_mode: closed_loop_lsc`, `tau_start=0,45`, `z_star=0,4`, `eta=0,1` y 3816 actualizaciones de la política de beta. La loss de entrenamiento reportada por el trainer es 4,7782583571579975, con runtime de 7879,9211 s y 0,061 pasos/s. La evaluación durante el entrenamiento está desactivada y no se reclama ninguna puntuación de benchmark.

## Capacidades

- Generación de texto conversacional: hereda la base Llama 3 8B ajustada con SFT sobre UltraChat y posteriormente alineada con preferencias, orientada a respuestas de chat multi-turno.
- Razonamiento y conocimiento general: capacidades propias de Llama 3 8B, sin mejoras específicas declaradas por el autor.
- Generación de código y matemáticas: no se declara entrenamiento específico adicional; se limita a lo heredado del modelo base.
- Tool calling / function calling: no disponible en la información proporcionada.
- Agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no declaradas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; es un modelo exclusivamente de texto.
- Alineamiento por preferencias: es la capacidad diferenciadora del checkpoint, si bien su efecto downstream no está evaluado.

## Casos de uso

- Investigación en alineamiento: servir como punto de comparación reproducible frente a DPO estándar para estudiar el efecto de RC y del controlador LSC de beta, usando las trayectorias y logs archivados en `training_logs/`.
- Reproducción experimental: reejecutar el pipeline con el commit de código `80e41b2d3aa35db2baba1d88ac710007e9db9d80`, el hash del training packet y el del config para validar resultados de calibración de gradientes.
- Estudio de estabilidad de beta: analizar las 3816 actualizaciones de la política de beta y las trayectorias de margen DPO para caracterizar el comportamiento en lazo cerrado.
- Ablación de mecanismos de calibración: comparar este checkpoint con variantes sin RC o con beta fijo, manteniendo el mismo modelo base y dataset, para aislar la contribución de cada componente.
- Evaluación de robustez de checkpoints de investigación: usar el modelo como sujeto de pruebas de alucinación, sesgo y degradación conversacional antes de cualquier uso serio.
- Base para ajuste posterior controlado: emplearlo como inicialización en experimentos de DPO adicionales o de RLHF, dado que conserva la estructura Llama 3 8B y el tokenizer original.

## Benchmarks y rendimiento

El model-index oficial del autor declara `results: []`, es decir, no contiene ningún resultado de benchmark. La model card indica explícitamente que no se incluyen resultados de generación ni se reclama ninguna puntuación de calidad, y que la evaluación durante el entrenamiento está desactivada.

No se han publicado resultados de benchmarks en la información disponible.

Como dato meramente diagnóstico de entrenamiento (no de calidad), se registra una training loss de 4,7782583571579975 y un throughput de 0,061 pasos/s en 4 × H200.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de 8,03B parámetros, en bfloat16/fp16 requiere aproximadamente 16 GB de pesos, en int8 alrededor de 8 GB y en int4 alrededor de 4-5 GB, más memoria para KV cache y overhead (estimaciones orientativas, no facilitadas por el autor).
- GPU recomendadas: el entrenamiento usó 4 × NVIDIA H200; para inferencia basta una GPU con suficiente VRAM (A100 40/80 GB, H100, L40S o RTX 4090 24 GB en cuantización).
- ¿Cabe en consumer GPU? En fp16/bf16 cabe ajustadamente en RTX 4090 (24 GB) con contexto moderado; en cuantización int8/int4 cabe en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (versión registrada 4.51.0), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), y previsiblemente llama.cpp/Ollama/vLLM tras conversión a GGUF, aunque el repo solo publica safetensors sin cuantizar.
- Latencia y throughput: no disponibles para inferencia; solo se conoce el throughput de entrenamiento (0,061 pasos/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neu-l3-ultra-lscx-rc-s42-20261115-a1 | 8,03B densos | no disponible (entrenado a 2048) | sin benchmarks publicados | llama3 | Hugging Face, 0 descargas |
| Llama 3 8B (Meta) | 8,03B densos | 8192 tokens (versión base de Meta) | benchmarks públicos de Meta (no reproducidos aquí) | llama3 | Hugging Face, ampliamente disponible |
| W-61/llama-3-8b-base-sft-ultrachat-8xh200 (modelo base) | 8,03B densos | no disponible | sin benchmarks publicados en la información | no disponible | Hugging Face |
| DPO estándar sobre Llama 3 8B (referencia conceptual) | 8,03B densos | no disponible | no disponible | llama3 | no disponible |

La comparación directa de rendimiento no es posible: este checkpoint no publica benchmarks y los alternativos citados tampoco aportan cifras verificables en la información disponible. La diferencia relevante frente a un DPO convencional es metodológica (RC + LSC), no medida.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación held-out, ni métricas de calidad downstream; el autor advierte que una sola semilla y comprobaciones de entrenamiento correctas no establecen calidad ni robustez.
- Checkpoint de investigación: no está pensado para despliegue en producción; la model card lo describe como artefacto experimental de comparación.
- Riesgo de alucinación: inherente a Llama 3 8B y no mitigado ni medido en este ajuste.
- Sesgos: no evaluados; el dataset UltraFeedback binarized puede introducir sesgos de preferencia que no se han analizado.
- Idiomas: no declarados; no hay garantía de comportamiento multilingüe más allá del modelo base.
- Contexto: el entrenamiento limita secuencia a 2048 y prompt a 1800 tokens; la longitud de contexto efectiva de inferencia no está documentada.
- Licencia: Llama 3 Community License impone restricciones de uso comercial y obligaciones de atribución ("Built with Meta Llama 3"); debe revisarse antes de cualquier explotación.
- Reproducibilidad parcial: los snapshots son model-only, omiten estado de optimizador/scheduler/RNG y no son checkpoints exactos de reanudación; no se reclama paridad con entornos B200.
- Pesos sin cuantizar: el repo de 32,1 GB en float32 serializado implica mayor coste de almacenamiento y transferencia; no se ofrecen variantes GGUF/AWQ/GPTQ.
- Trazabilidad dependiente de receipts: la completitud del archivo de logs se establece por recibos de subida, no por la propia model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jackf857/neu-l3-ultra-lscx-rc-s42-20261115-a1
- Modelo base SFT: https://huggingface.co/W-61/llama-3-8b-base-sft-ultrachat-8xh200
- Dataset de preferencias: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Logs de entrenamiento (ruta dentro del repo): `training_logs/run/run.json`, `training_logs/run/training_config.yaml`, `training_logs/run/generated-model-card-original.md`
- Paper de DPO (referencia metodológica): https://arxiv.org/abs/2305.18290
- Paper de UltraFeedback: https://arxiv.org/abs/2310.01377
- Llama 3 (Meta): https://ai.meta.com/blog/meta-llama-3/
