# hoborific/Gemma-4-31B-StyleTune-W8A16-FP8

## Resumen

El modelo `hoborific/Gemma-4-31B-StyleTune-W8A16-FP8` es una versión cuantizada del finetune comunitario `Gryphe/Gemma-4-31B-StyleTune`, que a su vez se basa en el modelo Gemma 4 de Google (31B, arquitectura densa). El autor, hoborific, ha aplicado una cuantización offline W8A16 FP8 mediante la librería `compressed-tensors`, con pesos en `float8_e4m3fn` y activaciones en bf16/fp16. El objetivo es reducir el uso de memoria y acelerar la inferencia en hardware compatible con FP8, especialmente en Intel XPU y NVIDIA CUDA (Turing o superior).

Este modelo está orientado a tareas de razonamiento, chat multimodal, escritura expresiva y roleplay, según la descripción del finetune original. Al ser una cuantización, conserva las capacidades del modelo base, pero con un footprint de memoria menor. Es relevante para desarrolladores que necesitan desplegar un modelo de 31B en entornos con VRAM limitada o que buscan optimizar el throughput en GPUs con soporte FP8. El contexto máximo declarado para Gemma 4 es de 256K tokens, aunque no se especifica si este finetune mantiene esa longitud completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 31B) |
| Parametros totales | 32.682.375.020 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 256K tokens (según Gemma 4, no confirmado para este finetune) |
| Tipos de cuantizacion | W8A16 FP8 (pesos en float8_e4m3fn, activaciones en bf16/fp16) |
| Idiomas soportados | No disponible (Gemma 4 base soporta más de 140 idiomas) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (compressed-tensors, formato float-quantized) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 31B, un transformer denso con atención de ventana deslizante y atención global alternada, según la documentación de Google. El finetune `StyleTune` añade ajustes para escritura creativa, roleplay y razonamiento multimodal, aunque no se han publicado detalles sobre el dataset o el método de entrenamiento (RLHF, DPO, etc.). La cuantización aplicada por hoborific es offline: para cada capa lineal 2D (attention q/k/v/o y MLP gate/up/down), se calcula una escala por canal de salida a partir de `amax / 448`, refinada mediante una búsqueda de recorte MSE sobre ~9 fracciones de clip (0.8–1.0× amax). Los pesos se cuantizan con redondeo al más cercano y saturación. Las capas no lineales (embeddings, normas, lm_head, routers/experts y la torre de visión) permanecen en bf16 y se excluyen explícitamente en la lista `ignore` del checkpoint, de modo que vLLM no las toca.

## Capacidades

- Generación de texto y chat conversacional multirround.
- Razonamiento y resolución de problemas, gracias a la base Gemma 4.
- Escritura expresiva y creativa, incluyendo narrativa y roleplay (según la descripción del finetune StyleTune).
- Soporte multimodal (entrada de imagen-texto) porque el modelo base incluye una torre de visión, aunque no se detalla el grado de soporte tras la cuantización.
- Capacidades multilingües heredadas de Gemma 4 (más de 140 idiomas en el modelo base, no confirmado para este finetune).
- No se ha confirmado soporte de tool calling o function calling en la información disponible.

## Casos de uso

- Generación de narrativa interactiva: el modelo puede mantener personajes y tramas coherentes en conversaciones largas, gracias a su contexto amplio (hasta 256K tokens en el modelo base). Es adecuado para juegos de rol por texto o escritura asistida.
- Asistentes de escritura creativa: redacción de borradores, diálogos y descripciones con estilo ajustable, aprovechando el finetune StyleTune.
- Chatbots de atención al cliente con tono personalizado: el modelo puede gestionar conversaciones multi-turno y adaptar el registro lingüístico, aunque la licencia no está clara para uso comercial.
- Análisis de documentos largos: con la ventana de contexto extendida, puede resumir o extraer información de documentos extensos (informes, manuales, actas) en una sola pasada.
- Prototipado de aplicaciones multimodales: al aceptar entrada de imagen y texto, puede usarse para describir imágenes o responder preguntas sobre ellas, aunque la cuantización podría afectar ligeramente la precisión.
- Despliegue en entornos con VRAM limitada: gracias a la cuantización FP8, el modelo cabe en GPUs de 40 GB o más, permitiendo ejecutarlo en hardware de gama media-alta sin necesidad de nodos multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras métricas para esta versión cuantizada. El autor no proporciona comparativas de rendimiento frente al modelo original.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 36.1 GB en disco. Con pesos en FP8 (1 byte por parámetro) y activaciones en bf16, la memoria necesaria para inferencia ronda los 33–35 GB, más overhead de KV cache y buffers. Se recomienda una GPU con al menos 40 GB de VRAM (A100 40GB, L40S, A6000) para ejecución cómoda.
- GPU recomendadas: NVIDIA con soporte FP8 (Turing o posterior, p.ej. RTX 4090, A100, H100) o Intel XPU. En RTX 4090 (24 GB) no cabría el modelo completo; se necesitaría cuantización adicional o particionado.
- No soporta ROCm, CPU ni TPU en vLLM, ya que no existen kernels W8A16-FP8 para esos backends.
- Opciones de despliegue: vLLM es el runtime principal, con kernels específicos (`XPUW8A16FP8LinearKernel` en Intel XPU, `HummingFP8ScaledMMLinearKernel` o `MarlinFP8ScaledMMLinearKernel` en CUDA). También puede usarse con transformers estándar, aunque sin las optimizaciones de vLLM.
- Latencia y throughput: no disponibles. Dependen del hardware y de la configuración de vLLM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gryphe/Gemma-4-31B-StyleTune (base) | 32.7B | 256K (base) | Sin cuantizar (bf16) | No disponible | HuggingFace |
| hoborific/Gemma-4-31B-StyleTune-W8A16-FP8 | 32.7B | 256K (base) | W8A16 FP8 | No disponible | HuggingFace |
| Google Gemma 4 31B (original) | 31B | 256K | Sin cuantizar | Gemma Terms of Use | HuggingFace |

No se dispone de datos de rendimiento comparativo. La principal diferencia es el formato de pesos y el soporte de hardware: la versión cuantizada requiere kernels específicos de vLLM y no funciona en ROCm/CPU/TPU, mientras que el modelo base puede ejecutarse en más plataformas.

## Limitaciones y advertencias

- La licencia no está especificada en la model card, por lo que el uso comercial es incierto. Se recomienda contactar al autor o verificar la licencia del modelo base Gemma 4.
- La cuantización FP8 puede introducir una ligera pérdida de precisión en comparación con bf16, especialmente en tareas de razonamiento matemático o código, aunque el autor afirma que su esquema per-channel con recorte MSE mejora la relación señal-ruido frente a la cuantización online de vLLM.
- No hay soporte para ROCm, CPU ni TPU en vLLM; si se intenta cargar en esos backends, fallará con un error de kernel no disponible.
- El modelo base StyleTune está orientado a roleplay y escritura creativa, por lo que puede generar contenido sesgado o inapropiado si no se aplican filtros de seguridad adicionales.
- No se han publicado benchmarks ni evaluaciones de sesgo o alucinación para esta versión cuantizada.
- La longitud de contexto real tras el finetune no está confirmada; aunque Gemma 4 soporta 256K, el ajuste fino podría haber reducido la ventana efectiva.

## Enlaces

- Modelo cuantizado: https://huggingface.co/hoborific/Gemma-4-31B-StyleTune-W8A16-FP8
- Modelo base (finetune): https://huggingface.co/Gryphe/Gemma-4-31B-StyleTune
- Modelo original Gemma 4 31B: https://huggingface.co/google/gemma-4-31B
- Documentación de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Página de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Librería compressed-tensors: https://github.com/neuralmagic/compressed-tensors
