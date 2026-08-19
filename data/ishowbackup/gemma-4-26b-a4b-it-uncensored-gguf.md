# Ishowbackup/gemma-4-26B-A4B-it-uncensored-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `TrevorJS/gemma-4-26B-A4B-it-uncensored`, una versión "abliterated" (sin rechazos) del modelo oficial `google/gemma-4-26B-A4B-it` de Google. El modelo base es un transformer de mezcla de expertos (MoE) con 26 000 millones de parámetros totales y aproximadamente 4 000 millones de parámetros activos por token, diseñado para generación de texto conversacional en inglés.

La publicación de esta ficha responde a la necesidad de los desarrolladores de evaluar rápidamente alternativas de código abierto con licencia permisiva (Apache 2.0) que ofrezcan un comportamiento menos restrictivo en tareas creativas o de rol. La cuantización GGUF permite ejecutar el modelo en hardware de consumo con requisitos de VRAM reducidos frente a los pesos completos en precisión bf16.

El autor de la cuantización, Ishowbackup, proporciona dos archivos GGUF (Q4_K_M y Q8_0) listos para usar con `llama.cpp` o servidores compatibles. El modelo base original fue creado por TrevorJS mediante una técnica de abliteración que elimina el comportamiento de rechazo del modelo de instrucciones de Google, preservando las capacidades generales del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), tipo Gemma 4 |
| Parametros totales | 25 233 142 046 (~25,2 B) |
| Parametros activos | ~4 B (según denominación A4B) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea 8192 tokens, pero no es un valor oficial) |
| Tipos de cuantizacion | Q4_K_M (16,8 GB) y Q8_0 (26,9 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-26B-A4B-it` es un transformer de mezcla de expertos con 26 000 millones de parámetros totales y 4 000 millones de parámetros activos por token. La arquitectura sigue el diseño de la familia Gemma 4 de Google, optimizada para generación de texto e instrucciones. El repositorio no proporciona detalles adicionales sobre el número de capas, dimensión oculta o número de expertos.

La versión "uncensored" fue creada mediante una técnica de abliteración llamada *norm-preserving biprojected abliteration* con *Expert-Granular Abliteration* (EGA) aplicada a los pesos de los expertos MoE. Este procedimiento elimina la dirección de rechazo del modelo de instrucciones original, reduciendo drásticamente la probabilidad de que el modelo se niegue a responder a peticiones que el modelo original consideraría inapropiadas. El autor indica que se realizó validación cruzada con métricas de tasas de rechazo antes y después de la intervención, aunque no se incluyen cifras concretas en esta model card.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación de este repositorio.

## Capacidades

- Generación de texto en inglés con estilo conversacional.
- Soporte de instrucciones (instruction-tuned) gracias al modelo base `it` de Google.
- Comportamiento sin rechazos: el modelo responde a peticiones que el modelo original podría rechazar por políticas de seguridad.
- Compatible con pipelines de generación de texto de HuggingFace y con servidores de inferencia como `llama.cpp` (llama-server).
- Cuantizaciones GGUF listas para usar en entornos locales.

No se mencionan capacidades adicionales como tool calling, agentes, visión o audio en la documentación disponible.

## Casos de uso

- Generación creativa sin restricciones: escritura de ficción, poesía o guiones donde el modelo original podría rechazar ciertos temas por políticas de contenido.
- Juegos de rol y simulación de personajes: el modelo puede adoptar personalidades o escenarios que requieran respuestas sin censura.
- Asistente local de chat: desplegado con `llama-server` en una máquina con GPU o CPU, ofreciendo una interfaz de chat en localhost.
- Experimentación académica sobre alineación y seguridad: investigadores pueden estudiar el efecto de la abliteración en modelos de instrucciones.
- Prototipado rápido de aplicaciones de texto: gracias a la licencia Apache 2.0 y al formato GGUF, se puede integrar en proyectos con `llama-cpp-python` u Ollama.
- Evaluación comparativa de cuantizaciones: los dos archivos GGUF permiten medir el impacto de la precisión (Q4_K_M vs Q8_0) en calidad de generación y requisitos de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 16,8 GB para la cuantización Q4_K_M y 26,9 GB para la Q8_0 (tamaños de archivo). Se recomienda añadir margen para el contexto y los estados de la atención.
- GPU recomendadas: una RTX 4090 (24 GB VRAM) puede ejecutar la versión Q4_K_M con contexto moderado; para la Q8_0 se recomienda una GPU con 32 GB o más (A100 40 GB, H100 80 GB) o usar CPU con suficiente RAM.
- En consumer GPU: la Q4_K_M cabe en GPUs de 24 GB; la Q8_0 requiere GPUs de 32 GB o más.
- Opciones de despliegue: `llama.cpp` (llama-server), `llama-cpp-python`, Ollama (si se convierte a formato compatible), o cualquier runtime que soporte GGUF.
- Latencia y throughput: no disponibles. Dependerán del hardware, la cuantización y el tamaño de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-4-26B-A4B-it-uncensored (GGUF) | 25,2 B | ~4 B | no disponible | Apache 2.0 | GGUF |
| google/gemma-4-26B-A4B-it (original) | 25,2 B | ~4 B | no disponible | Apache 2.0 | safetensors |
| TrevorJS/gemma-4-26B-A4B-it-uncensored (bf16) | 25,2 B | ~4 B | no disponible | Apache 2.0 | safetensors |

La comparativa se limita al mismo modelo en diferentes formatos, ya que no se dispone de información sobre otros modelos MoE de tamaño similar con licencia Apache 2.0 en el momento de redactar esta ficha.

## Limitaciones y advertencias

- El modelo es "uncensored" por diseño: puede generar contenido ofensivo, ilegal o dañino. No debe desplegarse en entornos de producción sin medidas de moderación adicionales.
- Solo está disponible en inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- No se han publicado benchmarks de calidad, por lo que se desconoce su rendimiento relativo frente a otros modelos de tamaño similar.
- La cuantización Q4_K_M puede degradar ligeramente la calidad de generación frente a la versión bf16 original.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado por el modelo puede infringir políticas de plataformas o leyes locales.
- El proceso de abliteración puede introducir artefactos o comportamientos impredecibles en ciertas tareas, especialmente aquellas que requieren matices de seguridad.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/Ishowbackup/gemma-4-26B-A4B-it-uncensored-GGUF
- Modelo base bf16 (TrevorJS): https://huggingface.co/TrevorJS/gemma-4-26B-A4B-it-uncensored
- Modelo original de Google: https://huggingface.co/google/gemma-4-26B-A4B-it
- Código fuente del proceso de abliteración: https://github.com/TrevorS/gemma-4-abliteration
