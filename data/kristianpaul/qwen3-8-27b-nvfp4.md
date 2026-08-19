# kristianpaul/Qwen3.8-27B-NVFP4

## Resumen

El modelo `kristianpaul/Qwen3.8-27B-NVFP4` es una versión cuantizada del modelo base `Qwen/Qwen3.8-27B`, desarrollada por el usuario kristianpaul mediante la herramienta NVIDIA Model-Optimizer. La cuantización emplea el esquema NVFP4 (W4A4) con caché KV en FP8, lo que reduce el peso del checkpoint de aproximadamente 52 GB (en BF16) a unos 20 GB, manteniendo la mayor parte de las capas en precisión reducida y preservando las más sensibles en BF16. El resultado es un modelo de generación de texto optimizado para inferencia eficiente en GPUs con memoria limitada, compatible con frameworks como vLLM, TensorRT-LLM y SGLang.

El modelo base, Qwen3.8-27B, pertenece a la familia Qwen3 y presenta una arquitectura híbrida que combina atención lineal y atención completa, junto con un codificador visual (aunque la ficha se centra en generación de texto). Aunque el nombre sugiere 27B de parámetros, el conteo real según los safetensors es de 15.193.246.960 parámetros, posiblemente debido a una arquitectura MoE con parámetros activos reducidos, aunque este detalle no se especifica en la información disponible. La cuantización se realizó con calibración sobre 512 muestras del dataset `cnn_nemotron_v2_mix`.

La relevancia de este modelo radica en su capacidad para ejecutar un LLM de gran tamaño en hardware de consumo o en entornos con VRAM restringida, sin necesidad de recurrir a cuantizaciones más agresivas que degraden significativamente la calidad. Al estar empaquetado en formato unificado de Hugging Face, se integra fácilmente en pipelines de inferencia modernos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa) con codificador visual, base Qwen3.8-27B |
| Parametros totales | 15.193.246.960 (según safetensors; el nombre indica 27B, posible MoE) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de vLLM usa 2048 tokens, pero el modelo base puede soportar más) |
| Tipos de cuantizacion | NVFP4 (W4A4) con escala dinámica por bloque (FP8 E4M3), caché KV en FP8; capas sensibles en BF16 |
| Idiomas soportados | no disponible (heredados del modelo base, no documentados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint unificado con `quant_method: modelopt`) |

## Arquitectura y entrenamiento

La cuantización se aplicó sobre el modelo Qwen3.8-27B, que presenta una arquitectura híbrida: 16 capas con atención completa (full attention) y 48 capas con atención lineal, además de un codificador visual. El proceso de cuantización NVFP4, realizado con NVIDIA Model-Optimizer (receta `general/ptq/nvfp4_default-kv_fp8`), convierte los pesos de las proyecciones principales (MLP, QKV, out_proj) a FP4 de 4 bits con escala dinámica por bloque de 16 elementos. La caché KV se cuantiza a FP8. Capas numéricamente sensibles, como las convoluciones de la atención lineal, el codificador visual, el `lm_head` y los embeddings, se mantienen en BF16 para preservar la calidad.

El entrenamiento del modelo base no está documentado en la información proporcionada; solo se indica que la calibración para la cuantización usó 512 muestras del dataset `cnn_nemotron_v2_mix`. No se menciona el uso de RLHF, DPO ni otros métodos de alineación. El checkpoint resultante es unificado y no puede cargarse con `AutoModelForCausalLM.from_pretrained`; requiere un framework de inferencia compatible con NVFP4.

## Capacidades

- Generación de texto y conversación: al ser una cuantización del modelo Qwen3.8-27B, hereda las capacidades de generación de lenguaje natural del modelo base, aunque no se detallan específicamente en la información disponible.
- Inferencia eficiente: gracias a la cuantización W4A4 y caché KV en FP8, el modelo reduce significativamente el uso de memoria y acelera la inferencia en GPUs compatibles.
- Compatibilidad con frameworks modernos: funciona con vLLM (auto-detección del kernel `FlashInferCutlassNvFp4LinearKernel`), TensorRT-LLM y SGLang.
- Soporte de chat: el repositorio incluye archivos de tokenizer y chat template, lo que indica soporte para interacción conversacional.
- No se confirma soporte de tool calling, agentes, razonamiento multi-step ni capacidades multimodales en la información proporcionada; estas dependen del modelo base, cuyas características no se detallan.

## Casos de uso

- Despliegue en entornos con VRAM limitada: con un tamaño de checkpoint de ~20 GB, el modelo puede ejecutarse en GPUs de 24 GB (como RTX 3090/4090) o incluso menos con ajustes de `gpu-memory-utilization`, permitiendo inferencia local de un LLM de gran tamaño en estaciones de trabajo.
- Servicio de chat en tiempo real: mediante vLLM, el modelo puede servir endpoints de generación de texto con baja latencia, adecuado para asistentes virtuales o chatbots en producción.
- Prototipado rápido: al ser un checkpoint listo para usar con frameworks estándar, facilita la experimentación con modelos cuantizados sin necesidad de convertir pesos manualmente.
- Investigación en eficiencia de inferencia: sirve como referencia para estudiar el impacto de la cuantización NVFP4 en modelos híbridos de atención, comparando calidad y rendimiento frente a versiones BF16.
- Aplicaciones de procesamiento de lenguaje natural general: tareas como resumen, extracción de información o generación de contenido pueden beneficiarse de un modelo de este tamaño con requisitos de hardware reducidos.
- Integración en pipelines de generación aumentada por recuperación (RAG): al mantener una ventana de contexto razonable (aunque no especificada), puede combinarse con bases vectoriales para responder preguntas sobre documentos extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para esta cuantización ni comparaciones con el modelo base u otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa ~20 GB en disco. Para inferencia con vLLM, el ejemplo usa `--gpu-memory-utilization 0.45` con `--max-model-len 2048`, lo que sugiere un consumo de VRAM de aproximadamente 9-10 GB en esa configuración. Con contextos más largos o mayor utilización, se requeriría más memoria (hasta ~24 GB para el modelo completo).
- GPUs recomendadas: cualquier GPU NVIDIA con soporte FP4 (Ampere o posterior, aunque el rendimiento óptimo se da en arquitecturas como Ada Lovelace o Hopper). Ejemplos: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB).
- Consumo en GPU de consumo: cabe en RTX 3090/4090 con 24 GB VRAM, y potencialmente en GPUs de 16 GB con cuantizaciones adicionales o contextos cortos.
- Opciones de despliegue: vLLM, TensorRT-LLM, SGLang. No es compatible con `transformers` estándar.
- Latencia y throughput: no disponibles, dependen del hardware y la configuración de contexto.

## Comparativa con modelos similares

No disponible. No se proporcionan datos sobre otros modelos cuantizados comparables (por ejemplo, versiones AWQ o GPTQ de Qwen3.8-27B) en la información suministrada.

## Limitaciones y advertencias

- La cuantización NVFP4 puede introducir degradación en tareas de alta precisión numérica o razonamiento complejo, aunque las capas sensibles se mantienen en BF16.
- El checkpoint no es cargable con `AutoModelForCausalLM`; requiere frameworks específicos (vLLM, TensorRT-LLM, SGLang), lo que limita su uso en entornos que dependen de la API de Transformers.
- No se documentan los idiomas soportados ni la longitud de contexto máxima; estos dependen del modelo base, cuyas especificaciones no se incluyen en la información proporcionada.
- El modelo base puede tener sesgos y riesgos de alucinación inherentes a los LLM, no mitigados por la cuantización.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones del modelo base Qwen3.8-27B.
- Al ser un modelo de 15B parámetros (a pesar del nombre "27B"), su capacidad puede ser menor que la de un modelo denso de 27B; se recomienda evaluar su rendimiento en tareas específicas antes de producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/kristianpaul/Qwen3.8-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- NVIDIA TensorRT Model-Optimizer: https://github.com/NVIDIA/TensorRT-Model-Optimizer
