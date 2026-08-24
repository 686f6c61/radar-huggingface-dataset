# barozp/Qwen3.6-29B-REAP-Opus-Distill-MTPLX-3bit

## Resumen

El modelo **barozp/Qwen3.6-29B-REAP-Opus-Distill-MTPLX-3bit** es una conversión cuantizada a 3-bit en formato MTPLX (MLX) del checkpoint `barozp/Qwen3.6-29B-REAP-Opus-Reasoning-Distill-MTP`, desarrollado por el usuario barozp. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 29 mil millones de parámetros totales y unos 3,5 mil millones de parámetros activos por token, resultado de la poda REAP del modelo base Qwen3.6-35B-A3B (256 expertos originales reducidos a 205) y la fusión de un LoRA de destilación de razonamiento de Opus. La versión MTPLX añade una capa de predicción multi-token (MTP) que permite decodificación especulativa sin necesidad de un modelo draft externo, optimizada para Apple Silicon.

Esta ficha concreta es la variante cuantizada a 3 bits, pensada para ejecutarse en entornos con memoria unificada limitada (hasta 24 GB). El repositorio pesa unos 13,8 GB en disco y está preparado para usar con la librería mtplx, que ofrece una API compatible con OpenAI. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este modelo reside en su capacidad de ofrecer razonamiento avanzado y generación de texto con una huella de memoria reducida, manteniendo un rendimiento competitivo en tareas de razonamiento como ARC-Challenge, donde supera al modelo base sin podar. Es una opción atractiva para desarrolladores que trabajan en Apple Silicon con memoria limitada y desean aprovechar la decodificación especulativa integrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (Gated-DeltaNet / full-attention), 40 capas, hidden size 2048, 205/256 expertos |
| Parametros totales | 29B (según la model card) |
| Parametros activos | ~3.5B (según el dato de safetensors: 3.533.545.088) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3-bit affine (grupo 64) en el cuerpo; MTP en bf16 |
| Idiomas soportados | no disponible (se presume multilingüe por ser base Qwen, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (3 shards + mtp.safetensors) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5-MoE (Qwen3.5MoeForCausalLM) con 40 capas, hidden size de 2048 y un total de 256 expertos, de los cuales se mantienen 205 tras un proceso de poda REAP (ratio 0.2). Sobre este checkpoint podado se fusiona un LoRA de destilación de razonamiento, entrenado con datos de cadena de pensamiento de Opus, que mejora las capacidades de razonamiento sin incrementar el número de parámetros activos.

La versión MTPLX incorpora una capa de predicción multi-token (MTP) que funciona como un modelo draft integrado: propone 1-3 tokens por paso y el modelo base los verifica, lo que acelera la generación sin requerir un modelo draft separado. El proceso de cuantización a 3-bit se realizó directamente desde los pesos bf16 del safetensors, evitando la degradación por doble cuantización. El entrenamiento específico no está documentado; se trata de una conversión y optimización, no de un entrenamiento desde cero.

## Capacidades

- Generación de texto y chat conversacional.
- Razonamiento de múltiples pasos gracias al LoRA de destilación de Opus, con mejoras observadas en tareas como ARC-Challenge.
- Decodificación especulativa mediante MTP: acelera la generación (hasta un 10% según las pruebas del autor) sin necesidad de un modelo draft adicional.
- Texto puro: no incluye capacidades de visión ni audio.
- Compatibilidad con el ecosistema MLX y mtplx, con API OpenAI-compatible para servidores locales.
- Posibilidad de ajuste de profundidad (depth) para controlar el número de tokens propuestos por paso.

## Casos de uso

- Asistente de chat en Mac con memoria unificada limitada: gracias a su tamaño de 13,8 GB y la cuantización de 3-bit, puede ejecutarse en equipos con 24 GB de RAM unificada, ofreciendo respuestas rápidas y con razonamiento mejorado.
- Generación de código en entornos locales: al ser un modelo de texto puro, puede usarse como autocompletado o asistente de programación en IDEs, aunque no se especifican capacidades específicas de tool calling.
- Análisis de documentos y resumen: su ventana de contexto (no especificada, pero típica de la familia Qwen) permite procesar documentos largos y generar resúmenes con razonamiento.
- Prototipado de agentes conversacionales: la API OpenAI-compatible de mtplx permite integrar el modelo en aplicaciones de chat con un servidor local, ideal para pruebas y desarrollo.
- Investigación en eficiencia de modelos: al ser un MoE podado y cuantizado, sirve para estudiar el impacto de la poda y la cuantización en el rendimiento de razonamiento, comparando con el modelo base sin podar.
- Despliegue en dispositivos Apple Silicon con memoria limitada: específicamente diseñado para Macs con 24 GB de memoria unificada, aprovechando la aceleración de MLX y la decodificación especulativa para una experiencia fluida.

## Benchmarks y rendimiento

La model card proporciona resultados medidos con `lm-evaluation-harness` (bfloat16, chat template desactivado) sobre el checkpoint safetensors fuente, no sobre la versión cuantizada. Se comparan tres modelos: el Qwen3.6-35B-A3B sin podar, el podado REAP-20% sin LoRA, y este modelo (que incluye el LoRA de razonamiento).

| Tarea | Qwen3.6-35B-A3B | RangerX REAP-20% | Este modelo |
|---|---|---|---|
| Wikitext perplexity (menor es mejor) | 7.85 | 10.06 | 10.06 |
| MMLU | 0.8409 | 0.8152 | **0.8257** |
| HellaSwag (0-shot, acc_norm) | 0.7420 | 0.7440 | 0.7340 |
| ARC-Challenge (0-shot, acc_norm) | 0.5320 | 0.5340 | **0.6160** |

Los resultados muestran que la destilación de razonamiento mejora ARC-Challenge por encima del modelo sin podar, aunque MMLU y HellaSwag presentan ligeras degradaciones. No se han publicado benchmarks específicos para la versión cuantizada 3-bit, por lo que no se pueden evaluar los efectos de la cuantización en el rendimiento real.

## Requisitos de hardware

- VRAM estimada: el modelo en 3-bit ocupa ~13,8 GB en disco, lo que implica un uso de memoria unificada similar durante la inferencia. Se recomienda un mínimo de 24 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: diseñado para Apple Silicon (M-series). La verificación se realizó en un Apple M5 Pro (18 CPU / 20 GPU, 24 GB unificada).
- Compatibilidad con GPUs de consumo: no está pensado para NVIDIA u otras arquitecturas; requiere el framework MLX.
- Opciones de despliegue: mediante la librería `mtplx` (comandos `mtplx run` y `mtplx serve`), que ofrece una API compatible con OpenAI. También se puede usar a través de `mtplx serve` para servir en local.
- Latencia y throughput: en las verificaciones del autor, se obtuvieron 91,5 tokens/segundo en modo autoregresivo (depth 0) y 101,5 tokens/segundo con depth 1 (MTP), un aumento del 8%. Estos valores son específicos para el hardware M5 Pro.

## Comparativa con modelos similares

El modelo se puede comparar con su versión base sin podar y con la versión podada sin LoRA, así como con otras cuantizaciones.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato | Rendimiento (ARC-Challenge) |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | ~3B | no disponible | Apache-2.0 | bf16 | 0.532 |
| RangerX REAP-20% (sin LoRA) | 29B | ~3B | no disponible | Apache-2.0 | bf16 | 0.534 |
| Este modelo (3-bit MTPLX) | 29B | ~3.5B | no disponible | Apache-2.0 | safetensors cuantizado | 0.616 |

La principal diferencia frente al base es la reducción de parámetros (29B vs 35B) y la mejora en razonamiento, mientras que frente a la versión podizada sin LoRA, el LoRA de destilación aporta un salto en ARC-Challenge. La versión 3-bit es la opción más ligera para Apple Silicon.

## Limitaciones y advertencias

- La cuantización a 3-bit puede provocar una pérdida de calidad respecto al modelo en bf16, especialmente en tareas de alta precisión. No se han publicado evaluaciones de la versión cuantizada.
- El modelo es solo texto; no soporta visión ni audio, lo que limita su uso en tareas multimodales.
- No se ha especificado la longitud de contexto; se recomienda verificar la capacidad real antes de usarlo con documentos largos.
- Los idiomas soportados no están documentados, aunque al estar basado en Qwen probablemente tenga buen multilingüismo, pero no es garantizable.
- La decodificación MTP requiere la librería `mtplx` y el hardware Apple Silicon; no es compatible con otros entornos.
- El modelo no ha sido probado exhaustivamente; los benchmarks provienen del checkpoint safetensors fuente, no de esta conversión cuantizada.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones de la base original (Qwen3.6) por si hubiera restricciones adicionales.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/barozp/Qwen3.6-29B-REAP-Opus-Distill-MTPLX-3bit
- Modelo base (safetensors bf16): https://huggingface.co/barozp/Qwen3.6-29B-REAP-Opus-Reasoning-Distill-MTP
- Versión GGUF para llama.cpp/Ollama: https://huggingface.co/barozp/Qwen3.6-29B-REAP-Opus-Reasoning-Distill-MTP-GGUF
- Modelo podado sin LoRA: https://huggingface.co/RangerX/Qwen3.6-35B-REAP-Pruned-ratio-0.2
- Repositorio de mtplx: https://github.com/mtplx/mtplx
