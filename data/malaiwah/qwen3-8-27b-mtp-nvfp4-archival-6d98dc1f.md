# malaiwah/Qwen3.8-27B-MTP-NVFP4-archival-6d98dc1f

## Resumen

Qwen3.8-27B-MTP-NVFP4 es una cuantización NVFP4 (W4A4, group 16) del modelo Qwen/Qwen3.8-27B, un transformer dense de 27,8 mil millones de parámetros con arquitectura híbrida DeltaNet + full-attention, visión Qwen3-VL y cabeza MTP (Multi-Token Prediction) nativa. El modelo cuantizado reduce el peso de 55,6 GB en bf16 a 20,6 GB, manteniendo en bf16 la torre de visión, `lm_head`, las capas `conv1d` de DeltaNet y la cabeza MTP, mientras el resto se cuantiza a NVFP4. Esta cuantización está optimizada para GPUs Blackwell (SM120) y se sirve con vLLM v0.22.0, que detecta automáticamente el formato comprimido sin necesidad de flags adicionales.

El modelo destaca por conservar la capacidad de decodificación especulativa mediante la cabeza MTP, que se integra en el índice de vLLM y permite acelerar la generación hasta un 48% en escenarios de baja concurrencia. Está diseñado para entornos de producción con requisitos estrictos de VRAM, ya que cabe en 4 GPUs de 16 GB con tensor parallelism, y ofrece rendimiento de prefill de hasta 3.820 tokens por segundo con 8k tokens de prompt. La licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo hace atractivo para despliegues empresariales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (dense, híbrido DeltaNet + full-attention, visión Qwen3-VL, MTP head) cuantizado a NVFP4 |
| Parametros totales | 27.356.728.560 (27,36B) |
| Parametros activos | No aplica (modelo dense) |
| Longitud de contexto | 131.072 tokens (128k, configurado en vLLM) |
| Tipos de cuantizacion | NVFP4 (W4A4, group 16) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B es multilingüe, pero no se detalla en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (comprimidos con compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer dense de 27,8B parámetros con una arquitectura híbrida que combina capas DeltaNet (atención lineal con estado recurrente) y capas de atención completa. Incluye además una torre de visión (Qwen3-VL) y una cabeza MTP (Multi-Token Prediction) que permite decodificación especulativa nativa. La cuantización se realizó con llm-compressor, aplicando NVFP4 (W4A4, group 16) a todas las capas `Linear` excepto `lm_head`, la torre visual, las capas `conv1d` de DeltaNet y la cabeza MTP, que se mantienen en bf16. La calibración se hizo con 32 muestras de 8.192 tokens del dataset `neuralmagic/calibration` y tomó 68 segundos en 8 GPUs RTX PRO 2000 Blackwell.

No se proporcionan detalles sobre el entrenamiento del modelo base (datos, tokens, método de alineación). La cuantización es puramente de post-entrenamiento, sin fine-tuning adicional. La cabeza MTP se injertó de nuevo en bf16 después del guardado y se añadió a la lista de capas ignoradas en `quantization_config.ignore` para que vLLM la trate correctamente.

## Capacidades

- Generación de texto conversacional y de razonamiento: es un modelo de razonamiento (reasoning model) que produce una fase de pensamiento antes de la respuesta final.
- Decodificación especulativa con MTP: la cabeza MTP en bf16 permite acelerar la generación con `num_speculative_tokens=3`.
- Tool calling / function calling: soportado mediante `--enable-auto-tool-choice` y `--tool-call-parser qwen3_xml`.
- Capacidades multimodales: la torre de visión se incluye en bf16, pero no se ha benchmarkeado el servicio multimodal; el uso text-only es el validado.
- Soporte de agentes y multi-step reasoning: al ser un modelo de razonamiento, puede encadenar pasos lógicos; el tool calling permite integración con agentes.
- Multilingüe: el modelo base Qwen3.8-27B soporta múltiples idiomas, aunque no se especifica la lista exacta en esta cuantización.
- Contexto largo: ventana de 128k tokens, con prefill eficiente hasta 100k tokens.

## Casos de uso

- Asistente de atención al cliente con contexto largo: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a su ventana de 128k tokens. La decodificación especulativa reduce la latencia percibida, mejorando la experiencia en chats en tiempo real.
- Generación de código asistida con tool calling: integrable en IDEs o pipelines de CI/CD para autocompletar, revisar y ejecutar código mediante llamadas a herramientas, gracias al soporte nativo de function calling.
- Razonamiento matemático y lógico en entornos educativos: al ser un modelo de razonamiento, puede descomponer problemas complejos paso a paso, útil para tutores automáticos o generación de explicaciones didácticas.
- Procesamiento de documentos largos: análisis de informes, contratos o artículos científicos de hasta 100k tokens, con prefill rápido (2.363 tok/s a 100k tokens) para resúmenes o extracción de información.
- Agente autónomo con planificación multi-paso: combinando el modo razonamiento con tool calling, puede ejecutar tareas complejas como búsqueda web, consultas a APIs y orquestación de subtareas, con baja latencia gracias a MTP.
- Despliegue en entornos con VRAM limitada: al caber en 4 GPUs de 16 GB (o una GPU de 24 GB con cuantización adicional), es adecuado para servidores de inferencia de gama media con requisitos de throughput moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye mediciones de throughput y latencia de prefill en hardware Blackwell.

Throughput agregado (TP=4, 128k contexto, KV cache fp8, RTX PRO 2000 Blackwell ×4):

| Concurrencia | Sin MTP (tokens/s) | Con MTP n=3 (tokens/s) |
|---|---|---|
| 1 | 49,0 | 72,6 |
| 2 | 93,2 | 110,9 |
| 4 | 180,9 | 232,8 |
| 8 | 318,3 | 386,9 |

Prefill single-stream (prefix cache desactivado, media de 3 ejecuciones):

| Longitud de prompt | Tokens/s |
|---|---|
| 8k | 3.820 |
| 32k | 3.299 |
| 100k | 2.363 |

Capacidad de KV cache en GPU a TP=4/128k: 1.025.977 tokens (7,83× concurrencia).

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado pesa 20,6 GB, pero al mantener partes en bf16 (lm_head, visión, MTP, conv1d), el uso real supera ese valor. En la prueba se usaron 4× RTX PRO 2000 Blackwell (16 GB cada una) con tensor parallelism, por lo que cabe en 64 GB de VRAM total.
- GPUs recomendadas: NVIDIA Blackwell (SM120) como RTX PRO 2000, RTX PRO 4000, RTX 5090, o datacenter como B200. No se garantiza soporte en arquitecturas anteriores (Ampere, Ada) por el formato NVFP4.
- Compatibilidad con consumer GPU: una sola GPU de 24 GB (por ejemplo RTX 4090) no es suficiente por los requisitos de VRAM y de arquitectura; se necesitan al menos 2-4 GPUs Blackwell.
- Opciones de despliegue: vLLM v0.22.0 (probado), también compatible con cualquier framework que soporte compressed-tensors y NVFP4. No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: a TP=4, alcanza 72,6 tokens/s en single-stream con MTP, y hasta 386,9 tokens/s agregados con 8 peticiones concurrentes. Prefill de 8k tokens a 3.820 tok/s.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos de la misma categoría. La información proporcionada no incluye benchmarks de calidad ni comparaciones con alternativas como Qwen3-27B en bf16, Llama 3.1 27B cuantizado u otros. La única referencia posible es el modelo base Qwen3.8-27B en bf16, que tiene el doble de tamaño (55,6 GB) y requiere más VRAM, pero no se ofrecen métricas de rendimiento relativo.

## Limitaciones y advertencias

- La cuantización NVFP4 solo funciona en GPUs Blackwell (SM120); en otras arquitecturas puede fallar o degradar el rendimiento.
- La variante W4A16 (NVFP4A16) no es servible en vLLM 0.22 en esta arquitectura (error `gptq_marlin_repack: size_n=24 not divisible by tile_n_size=64`). Solo funciona W4A4.
- Los 15 módulos `mtp.*` están en `quantization_config.ignore`; si se eliminan, vLLM tratará la cabeza MTP como NVFP4 y la decodificación especulativa fallará silenciosamente (0% aceptación, más lento que sin MTP).
- Es un modelo de razonamiento: requiere `max_tokens ≥ 4096` para que la fase de pensamiento no consuma todo el presupuesto de generación.
- La torre de visión se incluye en bf16 pero no se ha benchmarkeado el servicio multimodal; el uso text-only es el validado.
- No se han publicado benchmarks de calidad (razonamiento, código, matemáticas) en esta cuantización, por lo que se desconoce la degradación exacta respecto al modelo base.
- No se especifican los idiomas soportados ni posibles sesgos del modelo base; se recomienda auditar antes de usar en producción con datos sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malaiwah/Qwen3.8-27B-MTP-NVFP4-archival-6d98dc1f
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de llm-compressor (herramienta de cuantización): no se proporciona enlace directo, pero es parte del ecosistema vLLM/Neural Magic.
