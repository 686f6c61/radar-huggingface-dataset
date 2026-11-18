# Qwen/Qwen3.6-35B-A3B-FP8

## Resumen

Qwen3.6-35B-A3B-FP8 es la variante cuantizada en FP8 del modelo multimodal Qwen3.6-35B-A3B, desarrollado por el equipo Qwen de Alibaba. Se trata de un modelo de lenguaje causal con codificador de visión, construido sobre una arquitectura híbrida de atención lineal (Gated DeltaNet) y atención con compuertas (Gated Attention), combinada con una capa de mezcla de expertos (MoE) de 256 expertos. Con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones activos por token, ofrece un equilibrio entre capacidad y eficiencia computacional.

La relevancia de esta versión FP8 radica en que reduce el peso del repositorio a 37,5 GB manteniendo, según el autor, métricas de rendimiento prácticamente idénticas a las del modelo original. La cuantización utiliza un esquema de bloques de 128 elementos, lo que permite desplegar el modelo en infraestructura más modesta sin renunciar a la calidad del modelo completo. Es compatible con Transformers, vLLM, SGLang y KTransformers.

El modelo está orientado a tareas de codificación agéntica y razonamiento a nivel de repositorio, con una ventana de contexto nativa de 262.144 tokens extensible hasta 1.010.000. Incorpora una opción de preservación del razonamiento (Thinking Preservation) que retiene el contexto de razonamiento de mensajes históricos, pensada para flujos de desarrollo iterativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con codificador de visión; híbrida Gated DeltaNet + Gated Attention + MoE |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | FP8 con cuantización de grano fino, tamaño de bloque 128 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo emplea una disposición de 40 capas organizada como 10 bloques de la forma 3 × (Gated DeltaNet → MoE) seguidos de 1 × (Gated Attention → MoE). La dimensión oculta es de 2048 y el embedding de tokens de 248.320 (con padding). La Gated DeltaNet utiliza 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention emplea 16 cabezas para Q y 2 para KV, con dimensión de cabeza 256 y dimensión de RoPE de 64. La capa MoE contiene 256 expertos con dimensión intermedia de 512, activando 8 expertos enrutados más 1 compartido por token.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento. El modelo incorpora MTP (multi-token prediction) entrenado con múltiples pasos, una técnica que permite decodificación especulativa y mejora el throughput. La variante FP8 aquí descrita aplica cuantización de grano fino con bloques de 128 sobre los pesos del modelo post-entrenado; el autor indica que las métricas de rendimiento son casi idénticas a las del modelo original. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso específico de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto (pipeline image-text-to-text) gracias a su codificador de visión.
- Codificación agéntica: manejo fluido de flujos de trabajo de frontend y razonamiento a nivel de repositorio, según las notas del autor.
- Preservación del razonamiento (Thinking Preservation): opción para retener el contexto de razonamiento de mensajes históricos, reduciendo la sobrecarga en desarrollo iterativo.
- Razonamiento multi-paso y soporte para agentes.
- Capacidades multilingües: no se especifican los idiomas concretos en la información disponible.
- Decodificación especulativa mediante MTP entrenado con múltiples pasos.
- Compatibilidad con tool calling / function calling: no confirmado explícitamente en la información disponible.

## Casos de uso

- Codificación agéntica en repositorios: el modelo puede razonar sobre la estructura completa de un repositorio y resolver tareas de modificación de código, apoyándose en su contexto de 262.144 tokens y en la preservación del razonamiento entre iteraciones.
- Desarrollo frontend asistido: según las notas del autor, maneja flujos de trabajo de frontend con mayor fluidez, lo que permite generar y ajustar componentes de interfaz en conversaciones multi-turno.
- Automatización de revisión de código en CI/CD: integrable mediante vLLM o SGLang para analizar pull requests y sugerir cambios con contexto amplio de múltiples ficheros.
- Asistentes conversacionales con contexto largo: la ventana extensible hasta 1.010.000 tokens permite mantener conversaciones o documentos de referencia de gran extensión sin truncamiento.
- Procesamiento de documentos con imagen y texto: al incluir codificador de visión, puede extraer información de capturas, diagramas o documentos escaneados combinados con instrucciones textuales.
- Despliegue en infraestructura con memoria limitada: la cuantización FP8 reduce el peso a 37,5 GB, lo que facilita servir el modelo en GPUs de gama alta para consumidores o en nodos con menos VRAM que la versión completa.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (categoría Coding Agent):

| Benchmark | Qwen3.6-35B-A3B | Qwen3.5-35B-A3B | Qwen3.5-27B | Gemma4-31B | Gemma4-26B-A4B |
|---|---|---|---|---|---|
| SWE-bench Verified | 73,4 | 70,0 | 75,0 | 52,0 | 17,4 |
| SWE-bench Multilingual | 67,2 | 60,3 | 69,3 | 51,7 | 17,3 |
| SWE-bench Pro | no disponible (dato truncado) | 44,6 | 51,2 | 35,7 | 13,8 |

No se han publicado en la información disponible resultados de benchmarks de lenguaje general (MMLU, GSM8K, HumanEval) ni métricas específicas de la variante FP8 frente al modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio FP8 pesa 37,5 GB, por lo que se requieren al menos ~40 GB de VRAM para cargar los pesos en FP8 sin offloading.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o GPUs con 48 GB o más para FP8 sin fragmentar.
- GPU de consumidor: no cabe en GPUs de 24 GB (RTX 4090) en FP8 completo; requeriría cuantizaciones adicionales (p. ej. GGUF de menor precisión) no incluidas en este repositorio.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers, según el autor. Compatible con endpoints y despliegue en Azure (tag deploy:azure).
- Latencia y throughput: no disponibles en la información proporcionada; el uso de MTP con decodificación especulativa está orientado a mejorar el throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-FP8 | 35,9B totales / ~3B activos | 262.144 (ext. 1.010.000) | 73,4 | Apache 2.0 | Hugging Face |
| Qwen3.5-35B-A3B | ~35B / ~3B activos | no disponible | 70,0 | no disponible | Hugging Face |
| Qwen3.5-27B | 27B | no disponible | 75,0 | no disponible | Hugging Face |
| Gemma4-31B | 31B | no disponible | 52,0 | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; como modelo entrenado con datos web a gran escala, es previsible que herede sesgos de esos datos.
- Riesgo de alucinación: no cuantificado en la información disponible; debe validarse la salida en producción, especialmente en tareas de código y razonamiento factual.
- Limitaciones de contexto o idioma: la lista de idiomas soportados no está disponible; el contexto nativo es de 262.144 tokens y la extensión a 1.010.000 puede degradar el rendimiento si no se gestiona adecuadamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio para confirmar términos exactos.
- Caveat para producción: la cuantización FP8, aunque el autor la describe como de rendimiento casi idéntico, puede introducir divergencias numéricas en casos límite; se recomienda evaluar en el dominio concreto antes de desplegar. El peso de 37,5 GB limita el despliegue en GPUs de consumidor de 24 GB sin cuantización adicional.

## Enlaces

- Hugging Face: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog del autor: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai
- Plataforma Qwen: https://qwen.ai/home
- Licencia: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8/blob/main/LICENSE
