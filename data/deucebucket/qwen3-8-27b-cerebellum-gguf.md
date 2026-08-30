# deucebucket/Qwen3.8-27B-Cerebellum-GGUF

## Resumen

El modelo `deucebucket/Qwen3.8-27B-Cerebellum-GGUF` es una cuantización GGUF del modelo base `Qwen/Qwen3.8-27B`, desarrollado por Alibaba Cloud dentro de la serie Qwen3.8. El autor, deucebucket, ha aplicado un método de cuantización mixta denominado "Cerebellum", que asigna diferentes precisiones por grupos de tensores según su sensibilidad, con un presupuesto de archivo de 12 GB. El resultado es un archivo de 11,18 GiB que permite ejecutar un modelo de 27 mil millones de parámetros en GPUs de consumo con 12 GB de VRAM, algo poco habitual para ese tamaño.

Esta cuantización es solo de lenguaje (language-only), sin el módulo de predicción multi-token (MTP) ni las capacidades multimodales del modelo original. El archivo GGUF conserva los metadatos del contexto de 262 144 tokens, aunque el autor no ha validado el rendimiento a esa longitud completa. La relevancia actual radica en que ofrece una alternativa práctica para desplegar un modelo de razonamiento y código de alto nivel en hardware accesible, con benchmarks declarados que superan a muchos modelos de tamaño similar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (serie Qwen3.8) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (según metadatos GGUF; no validada en esta cuantización) |
| Tipos de cuantizacion | Mezcla de f32, Q2_K, Q3_K, Q4_K y Q6_K; etiqueta externa Q2_K_Mixed; 3,57 BPW efectivo |
| Idiomas soportados | No disponible (no especificado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` es un transformer denso multimodal de la serie Qwen3.8 de Alibaba Cloud, diseñado para tareas de razonamiento, generación de código y automatización de oficina. Según el repositorio oficial, es un modelo "native multimodal dense open-weight" que destaca en agentes y flujos de trabajo. Sin embargo, esta cuantización de deucebucket elimina los componentes multimodales y el predictor multi-token (MTP), quedándose únicamente con la parte de lenguaje.

El método Cerebellum aplicado por el autor funciona en tres fases: primero agrupa los tensores según su ubicación en la arquitectura (attention, feed-forward, etc.), luego mide la sensibilidad de cada grupo mediante una matriz de importancia (imatrix) y finalmente asigna un presupuesto de bits por grupo sujeto a un límite de tamaño de archivo. El resultado es una asignación no uniforme: 353 tensores en f32, 224 en Q2_K, 209 en Q3_K, 64 en Q4_K y 1 en Q6_K. El autor reporta que se utilizó una imatrix de calibración y que el proceso incluyó validación con benchmarks antes de publicar el candidato final.

## Capacidades

- Generación de texto y razonamiento de propósito general, con resultados destacados en tareas de opción múltiple (ARC-Challenge 95,48 %, HellaSwag 91,15 %).
- Generación de código: alcanza 91,46 % pass@1 en HumanEval base y 87,80 % en HumanEval+ (con temperatura 0 y sin modo pensamiento).
- Soporte de conversación multi-turno mediante la integración con `llama-server` y el endpoint `/v1/chat/completions`.
- Capacidad de trabajar con contextos largos (hasta 262 144 tokens en los metadatos, aunque no verificados en esta versión).
- No incluye capacidades multimodales (visión, audio) ni el módulo MTP del modelo original.
- No se especifica soporte explícito para tool calling o function calling en esta cuantización, aunque el modelo base sí lo tiene; la ausencia de MTP no debería impedirlo, pero no está documentado.

## Casos de uso

- Inferencia local en GPU de consumo: el archivo de 11,18 GiB permite cargar el modelo en una RTX 3090 o similar con offload completo (`-ngl 99`) usando `llama-server`, como hizo el autor en sus benchmarks. Es adecuado para desarrolladores que quieren ejecutar un modelo de 27B sin recurrir a servicios en la nube.
- Prototipado de asistentes de chat: gracias a su soporte nativo de chat en `llama.cpp`, se puede integrar en aplicaciones de mensajería o interfaces web mediante la API compatible con OpenAI.
- Generación de código asistida en entornos sin conexión: con un pass@1 de 91,46 % en HumanEval base, puede servir como autocompletado o generador de funciones en editores locales, siempre que se gestione el contexto adecuadamente.
- Evaluación de calidad de cuantización mixta: el método Cerebellum y los artefactos de reproducibilidad (manifest, logs, imatrix) lo convierten en un caso de estudio para investigadores interesados en técnicas de compresión de modelos.
- Análisis de razonamiento en tareas de opción múltiple: sus resultados en ARC-Challenge y HellaSwag lo hacen útil para experimentos de evaluación de conocimiento general y sentido común en entornos con restricciones de memoria.
- Despliegue en servidores de baja capacidad: con `llama-server` y `--parallel 4` (como se usó en los benchmarks), puede atender múltiples peticiones simultáneas en una sola GPU de 24 GB, adecuado para equipos pequeños o demos.

## Benchmarks y rendimiento

Los siguientes resultados son declarados por el autor en la model card y no están verificados por Hugging Face. Se obtuvieron con `llama-server -ngl 99 --parallel 4 -c 24576 --jinja`, temperatura 0 y con el modo pensamiento desactivado para HumanEval+.

| Benchmark | Resultado | Muestra evaluada |
|---|---|---|
| ARC-Challenge (accuracy) | 95,48 % | 1 172 |
| HellaSwag (accuracy) | 91,15 % | 10 042 |
| MMLU-Redux (accuracy) | 71,21 % | 2 400 |
| HumanEval base (pass@1) | 91,46 % | 164 |
| HumanEval+ (pass@1) | 87,80 % | 164 |
| Perplexity (contexto 512) | 7,4842 ± 0,09908 | 145 chunks |

El autor no proporciona comparaciones con otros modelos ni con la versión sin cuantizar. Los valores de HumanEval+ incluyen auditoría: 150 pases base, 144 pases plus, cero salidas vacías y solo dos fallos de sintaxis, todos en muestras fallidas.

## Requisitos de hardware

- VRAM estimada: el archivo de pesos ocupa 11,18 GiB. Con una GPU de 12 GB, quedan solo 0,82 GiB para cache KV, buffers y runtime, por lo que no se recomienda offload completo; es preferible usar offload parcial o reducir el contexto. Con 16 GB hay más margen (4,82 GiB), y con 24 GB el autor ejecutó el modelo con `-ngl 99` y contexto 24 576 sin problemas.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para offload completo; RTX 4070/4080 (12-16 GB) con offload parcial o contexto reducido.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), compatible con Ollama si se importa el GGUF, y potencialmente con vLLM mediante conversión a formato compatible (aunque no está documentado).
- Latencia y throughput: no se reportan mediciones. El autor usó 4 slots paralelos en su servidor de benchmarks, lo que sugiere capacidad de concurrencia moderada, pero no hay datos numéricos.

## Comparativa con modelos similares

No se dispone de comparativas publicadas por el autor contra otras cuantizaciones del mismo modelo o contra modelos de tamaño similar. Como referencia cualitativa:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262 144 | Apache-2.0 | safetensors (FP8/FP16) | Multimodal, requiere ~54 GB en FP16 |
| Esta cuantización (Cerebellum) | 27B | 262 144 (no verificado) | Apache-2.0 | GGUF | Solo lenguaje, 11,18 GiB |
| Qwen2.5-32B (ejemplo) | 32B | 131 072 | Apache-2.0 | safetensors/GGUF | Modelo anterior de la serie, sin multimodal |

La ventaja principal de esta cuantización es su tamaño reducido (3,57 BPW) frente a cuantizaciones uniformes Q4_K_M (~4,5 BPW) que ocuparían alrededor de 15-16 GiB para 27B, lo que impediría su uso en GPUs de 12-16 GB. Sin embargo, la calidad puede degradarse en tareas sensibles a la precisión.

## Limitaciones y advertencias

- La cuantización mixta con un BPW efectivo de 3,57 es agresiva; aunque los benchmarks declarados son altos, puede haber degradación en tareas de precisión numérica o razonamiento matemático complejo no cubiertas por las evaluaciones.
- El contexto de 262 144 tokens está presente en los metadatos, pero el autor no lo ha validado en esta versión; los benchmarks usaron contexto 24 576. Usar contextos muy largos puede provocar fallos de memoria o comportamiento inesperado.
- Es una versión solo lenguaje: las capacidades multimodales del modelo base (visión, etc.) no están disponibles.
- No hay garantía de que quepa en 12 GB de VRAM con contexto razonable; el autor advierte explícitamente que no asumas offload completo en 12 GB.
- Los resultados de benchmarks son auto-reportados y no verificados por Hugging Face ni por la comunidad.
- El autor es un experimentador independiente; no hay soporte oficial de Alibaba ni de la comunidad Qwen para este artefacto concreto.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base tiene sus propias condiciones; se recomienda revisar la documentación de Qwen3.8 para confirmar restricciones adicionales.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/deucebucket/Qwen3.8-27B-Cerebellum-GGUF
- Perfil del autor en Hugging Face: https://huggingface.co/deucebucket
- Repositorio oficial del modelo base Qwen3.8-27B (GitHub): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio de la serie Qwen3.8 (GitHub): https://github.com/QwenLM/Qwen3.8
- Receta de despliegue con vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
