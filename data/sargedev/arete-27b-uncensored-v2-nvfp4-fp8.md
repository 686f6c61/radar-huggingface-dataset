# SargeDev/Arete-27B-Uncensored-V2-NVFP4-FP8

## Resumen

Arete-27B-Uncensored-V2-NVFP4-FP8 es una compilación cuantizada del modelo Arete-27B-Uncensored-V2, publicado por SargeDev. Se trata de una variante "abliterated" y sin censura del modelo base NousResearch/Arete-27B, que a su vez emplea la arquitectura Qwen (etiquetada como `qwen3_5_text`). El modelo cuenta con 27.320.697.856 parámetros totales y se distribuye en formato safetensors bajo licencia Apache 2.0.

El propósito principal de esta versión concreta es reducir el peso del modelo de aproximadamente 54 GB a unos 29 GB mediante una receta de cuantización mixta NVFP4/FP8, pensada para servir el modelo en hardware de gama única como una GB10 (GPU de NVIDIA para estaciones de trabajo). La cuantización se realizó con llm-compressor siguiendo una receta reproducible incluida en el repositorio (`recipe.yaml`).

La relevancia de esta ficha radica en que combina tres elementos: un modelo base de 27B con arquitectura Qwen, un proceso de abliteration agresivo que elimina los mecanismos de rechazo del modelo, y una capa de ajuste fino orientada a la toma de decisiones (decision LoRA) entrenada sobre corpus propios del autor. El resultado es un modelo orientado a generación de texto sin restricciones de contenido, con un formato de pesos optimizado para inferencia en vLLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5_text`, arquitectura Qwen) |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4 W4A4 (group 16, escalas FP8) en atención q/k/v/o y gate/up; FP8 dinámico per-token en down_proj; bf16 en lm_head, embed_tokens y mtp |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), 2 shards bf16-scale + `model_mtp.safetensors`; GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen (etiqueta `qwen3_5_text`), un transformer de 27.320.697.856 parámetros. La construcción sigue una cadena de tres etapas: primero se parte de NousResearch/Arete-27B; después se aplica una abliteration agresiva mediante la herramienta OBLITERATUS (atribuida a Pliny the Liberator), que elimina las direcciones de rechazo del modelo; y finalmente se fusiona un LoRA de decisión (Solar-JEV) entrenado sobre el corpus solar-training-v3, checkpoint 1946, con r32/alpha-64 y un corpus combinado de 764k ejemplos, incluyendo el target `lm_head`. La fusión se realizó mediante aritmética directa de deltas.

La cuantización se llevó a cabo con llm-compressor usando la "Recipe B" de la línea V3 del autor: NVFP4 W4A4 con grupo 16 y escalas FP8 para las proyecciones de atención (q/k/v/o) y gate/up; FP8 dinámico per-token para down_proj; y bf16 intacto para lm_head, embed_tokens y mtp. La calibración empleó 384 prompts de validación del juez jev más 128 de ultrachat, con MAX_SEQ de 2048. El repositorio incluye `recipe.yaml` para reproducir la configuración exacta. No se detallan en la información disponible los datos de preentrenamiento originales del modelo base, el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: modelo de propósito general de 27B parámetros con arquitectura Qwen.
- Modo "uncensored": la abliteration agresiva elimina los mecanismos de rechazo, permitiendo respuestas sin las restricciones habituales de alineamiento.
- Toma de decisiones: el LoRA Solar-JEV está específicamente orientado a tareas de decisión, con un corpus de 764k ejemplos y target en `lm_head`.
- Capacidad de juez/evaluador: la calibración se realizó con prompts de validación del "jev judge", lo que sugiere uso como evaluador.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (visión, audio, thinking mode): no disponible en la información proporcionada.
- Inferencia con caché KV en FP8 recomendada por el autor para el despliegue en vLLM.

## Casos de uso

- Servicio en hardware de gama única (GB10): el modelo está empaquetado en ~29 GB con cuantización NVFP4/FP8 precisamente para caber en una GPU GB10, permitiendo desplegar un modelo de 27B en una sola estación de trabajo sin infraestructura multi-GPU.
- Generación de contenido sin restricciones de alineamiento: útil para investigación sobre comportamiento de modelos abliterated, estudios de sesgo y análisis de mecanismos de rechazo, donde se necesita un modelo que no filtre respuestas.
- Toma de decisiones automatizada: el LoRA Solar-JEV entrenado sobre corpus de decisiones permite usar el modelo como componente de decisión en pipelines, clasificando o eligiendo entre opciones con el target ajustado en `lm_head`.
- Evaluación automática (LLM-as-a-judge): la receta de calibración emplea prompts de validación del juez jev, lo que indica que el modelo puede usarse como evaluador de respuestas en pipelines de anotación o control de calidad.
- Investigación sobre cuantización: el repositorio incluye `recipe.yaml` reproducible, lo que lo convierte en un caso de estudio para analizar el impacto de NVFP4 W4A4 con escalas FP8 frente a FP8 dinámico en distintas capas de un transformer de 27B.
- Despliegue con vLLM en producción: el autor indica que `--quantization compressed-tensors` gestiona este formato directamente, permitiendo servir el modelo con el stack estándar de vLLM y caché KV en FP8.
- Experimentación con GGUF: el repositorio hermano ofrece una escalera de 11 cuantizaciones GGUF para quienes prefieran llama.cpp u Ollama en lugar de vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la ficha del modelo V2 para las evaluaciones y métricas del "decision-gate", pero esos datos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 29 GB en el formato NVFP4/FP8 distribuido (frente a ~54 GB en bf16).
- GPU objetivo declarada: NVIDIA GB10 (estación de trabajo de gama única).
- GPU recomendadas: GB10 para el formato NVFP4/FP8; para bf16 se requeriría una GPU con al menos ~54 GB, como A100 80GB o H100.
- ¿Cabe en consumer GPU? El formato cuantizado de ~29 GB no cabe en GPUs consumer de 24 GB (RTX 4090); sí cabría en GPUs con 32 GB o más. Para GPUs de 24 GB habría que recurrir a las cuantizaciones GGUF del repositorio hermano.
- Opciones de despliegue: vLLM con `--quantization compressed-tensors` (recomendado por el autor, con caché KV en FP8); llama.cpp u Ollama mediante los GGUF del repositorio Arete-27B-Uncensored-V2-GGUF.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-Uncensored-V2-NVFP4-FP8 | 27,3B | No disponible | NVFP4/FP8 mixto | Apache 2.0 | Hugging Face (SargeDev) |
| Arete-27B-Uncensored-V2 (bf16) | 27,3B (mismo base) | No disponible | bf16 | Apache 2.0 | Hugging Face (SargeDev) |
| NousResearch/Arete-27B (base) | 27,3B (mismo base) | No disponible | bf16 | No disponible en la información | Hugging Face (NousResearch) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. Las tres comparten los mismos pesos de origen; las diferencias radican en la abliteration, el LoRA de decisión y el formato de cuantización.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": la eliminación de los mecanismos de rechazo implica que puede generar contenido dañino, ofensivo o ilegal sin filtros. No es apto para aplicaciones de cara al público sin capas de moderación adicionales.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones de fidelidad en la información disponible.
- Sesgos conocidos: no se documentan en la información proporcionada; la abliteration puede alterar el comportamiento del modelo de formas no evaluadas.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles; no se debe asumir un contexto largo sin verificación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido generado por un modelo sin censura puede acarrear responsabilidad legal según la jurisdicción y el caso de uso.
- Caveat de producción: el autor recomienda caché KV en FP8 y el flag `--quantization compressed-tensors` en vLLM; otros stacks pueden no soportar el formato NVFP4/FP8 de forma nativa.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación por parte de la comunidad.
- La model card remite a la ficha del V2 para evaluaciones y métricas del decision-gate, que no están incluidas en la información disponible.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/SargeDev/Arete-27B-Uncensored-V2-NVFP4-FP8
- Modelo V2 (bf16): https://huggingface.co/SargeDev/Arete-27B-Uncensored-V2
- GGUF ladder: https://huggingface.co/SargeDev/Arete-27B-Uncensored-V2-GGUF
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Dataset de destilación: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Dataset de decisiones: https://huggingface.co/datasets/SargeDev/solar-decisions-corpus-v4
