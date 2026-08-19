# sakamakismile/Huihui-Qwen3.8-27B-abliterated-NVFP4

## Resumen

El modelo **Huihui-Qwen3.8-27B-abliterated-NVFP4** es una cuantización NVFP4 (W4A4, group 16) del fine-tune abliterado **huihui-ai/Huihui-Qwen3.8-27B-abliterated**, desarrollado por el usuario sakamakismile. El modelo base es un Qwen3.8-27B al que se le ha aplicado *abliteration* (eliminación de las respuestas de rechazo) y que incorpora una torre de visión, un mecanismo de atención híbrida con DeltaNet y un módulo MTP (Multi-Token Prediction) para decodificación especulativa.

Esta versión cuantizada reduce el peso del modelo de 55.6 GB a 20.0 GB, lo que permite ejecutarlo en dos GPUs de 16 GB con margen real para la caché KV. Está optimizada para hardware Blackwell (SM120) y funciona con vLLM v0.22.0 sin necesidad de flags adicionales de cuantización, ya que compressed-tensors se detecta automáticamente. La relevancia de este modelo reside en ofrecer un Qwen de 27B parámetros con capacidades de razonamiento, código y visión (aunque esta última no se ha validado) en un formato compacto y eficiente para despliegue en entornos con recursos limitados.

El modelo conserva el head MTP en bf16, lo que habilita la decodificación especulativa sin configuración adicional, y mantiene en bf16 el `lm_head`, la torre de visión y el `conv1d` de DeltaNet. Los benchmarks medidos por el autor muestran un rendimiento de inferencia competitivo (hasta 380.9 tokens/s agregados con concurrencia 8) sin degradación medible en un set de 8 pruebas de capacidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (híbrida: atención con DeltaNet, MTP, torre de visión) |
| Parametros totales | 27.356.728.560 (27.36B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (configuración medida) |
| Tipos de cuantizacion | NVFP4 (W4A4, group 16) con componentes en bf16 (`lm_head`, torre de visión, `conv1d` de DeltaNet, head MTP) |
| Idiomas soportados | no disponible (se ha probado japonés e inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es un **Qwen3.8-27B** fine-tuneado mediante *abliteration* por huihui-ai, lo que elimina los patrones de rechazo y censura del modelo original. La arquitectura combina atención tradicional con **DeltaNet** (un mecanismo de atención lineal recurrente) y un módulo **MTP** (Multi-Token Prediction) que permite decodificación especulativa nativa. Incluye además una torre de visión, aunque el despliegue multimodal no se ha validado en esta cuantización.

La cuantización NVFP4 (W4A4, group 16) se realizó con **llm-compressor**, aplicando `targets: [Linear]` e ignorando `lm_head`, la torre de visión, el `conv1d` de DeltaNet y los módulos `mtp.*`. Se usaron 32 muestras de calibración de 8192 tokens del dataset `neuralmagic/calibration`. Los tensores MTP se reincorporaron en bf16 después del guardado y se añadieron a `quantization_config.ignore` para evitar que vLLM los trate como NVFP4. El resultado es un modelo de 20 GB que conserva la decodificación especulativa funcional.

## Capacidades

- Generación de texto conversacional con modo de razonamiento (*thinking*) configurable mediante `reasoning_effort` (low, medium, xhigh).
- Generación de código en inglés, con soporte para archivos largos (aunque con riesgo de pérdida de paréntesis de cierre).
- Razonamiento lógico, aritmética, seguimiento de instrucciones y conocimiento de dominio (validado en un set de 8 probes).
- Capacidad multilingüe: se ha probado fluidez en japonés e inglés.
- Decodificación especulativa con MTP (3 tokens especulativos por defecto), que acelera la inferencia sin pérdida de calidad.
- Tool calling / function calling: no confirmado en la información disponible.
- Capacidad multimodal (visión): la torre de visión está presente en bf16, pero no se ha probado en esta cuantización.
- Modelo *abliterated*: responde sin rechazos ni censura, lo que puede ser útil para investigación pero requiere precaución.

## Casos de uso

- **Inferencia en GPUs de 16 GB**: el modelo cabe en dos tarjetas de 16 GB con margen para caché KV, lo que permite ejecutar un Qwen de 27B en hardware consumer (por ejemplo, dos RTX 4090 o RTX PRO 2000 Blackwell) sin recurrir a servicios cloud.
- **Servicio de chat con alta concurrencia**: con vLLM y tensor parallelism de 4, se alcanzan 380.9 tokens/s agregados con 8 peticiones concurrentes, adecuado para prototipos o cargas moderadas de usuarios.
- **Generación de código con verificación sintáctica**: el modelo produce código en inglés de forma fiable, pero se recomienda integrar un parser en el bucle de generación para detectar y corregir el paréntesis de cierre que ocasionalmente se pierde en archivos largos.
- **Razonamiento de formato largo con presupuesto de tokens**: usando `reasoning_effort: "medium"`, el modelo mantiene el pensamiento en ~1k caracteres y evita loops de deliberación, ideal para tareas que requieren respuestas extensas sin agotar la ventana de contexto.
- **Investigación en seguridad y alineación**: al ser un modelo *abliterated*, permite estudiar el comportamiento del modelo sin mecanismos de rechazo, útil para análisis de sesgos y evaluación de riesgos.
- **Backtesting y análisis financiero**: el set de pruebas del autor incluye un backtest de trading que penaliza el look-ahead bias, y el modelo puntúa correctamente, lo que sugiere utilidad en tareas de análisis cuantitativo con instrucciones precisas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta los siguientes datos de rendimiento de inferencia medidos con TP=4, contexto de 32k, KV cache en fp8, sobre 4× RTX PRO 2000 Blackwell y MTP con 3 tokens especulativos:

| Metrica | Valor |
|---|---|
| Throughput agregado (concurrencia 1) | 77.3 t/s |
| Throughput agregado (concurrencia 4) | 204.8 t/s |
| Throughput agregado (concurrencia 8) | 380.9 t/s |
| Prefill single-stream (prompt de 8k) | 3.590 tok/s |
| Capacidad de KV cache GPU (configuración) | 613.655 tokens |

En un set de 8 probes (fluidez japonesa, código en inglés, aritmética, seguimiento de instrucciones, puzzle lógico, conocimiento de dominio, explicación de seguridad defensiva y backtest de trading), el modelo puntúa **8/8**, idéntico al Qwen3.8-27B sin modificar cuantizado con la misma receta, a 87.2 t/s frente a 85.7 t/s. No se observa degradación medible.

## Requisitos de hardware

- **VRAM mínima**: dos GPUs de 16 GB (32 GB totales) con margen para caché KV. El modelo pesa 20 GB en NVFP4.
- **GPU recomendadas**: RTX PRO 2000 Blackwell (4× para TP=4) u otras GPUs con soporte SM120 (Blackwell). Se requiere arquitectura Blackwell para NVFP4.
- **No cabe en una sola GPU de 24 GB** sin cuantización adicional o offloading (no se ha probado).
- **Opciones de despliegue**: vLLM v0.22.0+ con `--trust-remote-code`, `--tensor-parallel-size`, `--kv-cache-dtype fp8` y `--speculative-config` para MTP. No se menciona compatibilidad con llama.cpp, Ollama o TGI.
- **Latencia y throughput**: 77.3 t/s en single-stream, 3.590 tok/s de prefill (medidos en el hardware indicado). En placas sin P2P se requiere `NCCL_P2P_DISABLE=1` y `--disable-custom-all-reduce`.
- **Tiempo de cuantización**: 119 segundos end-to-end en 7× RTX PRO 2000 Blackwell con `device_map=auto`.

## Comparativa con modelos similares

No se dispone de datos suficientes en la información proporcionada para realizar una comparativa rigurosa con otros modelos de la misma categoría. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-NVFP4 (este) | 27.36B | 32k (medido) | NVFP4 W4A4 | Apache 2.0 | Abliterado, MTP, requiere Blackwell |
| Qwen3.8-27B (base) | 27.36B | no disponible | no disponible | Apache 2.0 | Modelo original sin cuantizar ni abliterar |
| Otras cuantizaciones de 4 bits del mismo base | 27.36B | no disponible | no disponible | Apache 2.0 | No se han encontrado datos en la información |

Se recomienda consultar el repositorio del modelo base para alternativas de cuantización (por ejemplo, AWQ, GPTQ) si se dispone de hardware no Blackwell.

## Limitaciones y advertencias

- **Loops de deliberación con `reasoning_effort: "xhigh"`**: el modo por defecto puede generar secuencias de pensamiento de más de 19.000 caracteres que degeneran en repeticiones y agotan el presupuesto de tokens. Se recomienda usar `"medium"` para trabajo de formato largo.
- **Pérdida de paréntesis en código largo**: en generación de archivos de código de una sola pieza, el modelo omite un paréntesis de cierre aproximadamente 1-2 veces de cada 14, independientemente de la temperatura. Es imprescindible integrar una verificación sintáctica en el pipeline.
- **Solo texto validado**: la torre de visión está presente en bf16, pero el servicio multimodal no se ha probado en esta cuantización; puede fallar o degradarse.
- **Requiere hardware Blackwell (SM120)**: no funcionará en GPUs Ampere, Ada Lovelace o anteriores.
- **W4A16 no soportado**: la cuantización NVFP4A16 falla en vLLM 0.22 con el error `gptq_marlin_repack: size_n=24 not divisible by tile_n_size=64`. Solo funciona W4A4.
- **Modelo *abliterated***: al eliminar la censura, el modelo puede generar contenido inapropiado, ofensivo o peligroso. No es adecuado para despliegue público sin moderación.
- **Riesgo de alucinación**: no se han evaluado tasas de alucinación específicas; como todo LLM, puede inventar hechos o razonamientos incorrectos.
- **Idiomas**: solo se ha confirmado japonés e inglés; el rendimiento en otros idiomas no está documentado.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/sakamakismile/Huihui-Qwen3.8-27B-abliterated-NVFP4
- Modelo base (fine-tune abliterado): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Herramientas relacionadas: vLLM (https://github.com/vllm-project/vllm), llm-compressor (https://github.com/vllm-project/llm-compressor), dataset de calibración neuralmagic/calibration (https://huggingface.co/datasets/neuralmagic/calibration)
