# oN8WeJbq5Jo7Pk/hus1

## Resumen

Qwen3.8-27B Trim B7 es un checkpoint derivado de un modelo de la familia Qwen3.5/Qwen3.8 al que se le ha eliminado físicamente el bloque 7 (capas 28-31) y se han reindexado las capas posteriores. Lo publica el usuario `oN8WeJbq5Jo7Pk` bajo licencia Apache 2.0, con un total de 25.239.049.808 elementos tensoriales según los safetensors del repositorio. El objetivo declarado es liberar un checkpoint verificado y utilizable tras quedarse el autor sin cómputo para completar un estudio más amplio de poda de la FFN.

El modelo conserva la arquitectura híbrida del original: 60 capas principales (más una capa MTP en el GGUF), con un patrón de tres capas de atención lineal seguidas de una de atención completa, tamaño oculto de 5.120 y anchura intermedia de FFN de 17.408. Se distribuye en tres formatos: safetensors BF16 en 18 shards (50,478 GB de tensores), GGUF BF16 (49,567 GB) y GGUF Q4_K_M (15,324 GB), este último pensado para GPUs de 24 GB.

La relevancia es acotada pero concreta: es un artefacto de investigación de poda estructural con validación explícita (1.146 tensores HF verificados, coincidencia de pérdida con la ejecución de salto del bloque 7 dentro de 0,00108 de diferencia máxima por bucket) y un resultado de benchmark duro de 88/160. No es un modelo base nuevo ni una release de producción de un laboratorio; es un checkpoint podado con licencia permisiva y formatos listos para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y atención completa (3 capas lineales por cada capa de atención completa), derivado de Qwen3.5/Qwen3.8; 60 capas principales + 1 capa MTP en GGUF |
| Parametros totales | 25.239.049.808 elementos tensoriales (25,239B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y Q4_K_M incluidos en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 18 shards), GGUF BF16, GGUF Q4_K_M |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido con atención lineal intercalada: tres capas de atención lineal seguidas de una capa de atención completa, con tamaño oculto de 5.120 y anchura intermedia de FFN de 17.408. El checkpoint parte de un modelo Qwen3.5/Qwen3.8 (según los tags) y aplica una poda estructural dura: el bloque 7 original (capas 28-31) se elimina físicamente y las capas posteriores se reindexan. Respecto al input podado, se han retirado 1,522B parámetros y 3,044 GB de tensores BF16. El GGUF incorpora además una capa MTP (multi-token prediction).

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni sobre si hubo RLHF, DPO o cualquier fase de alineación posterior. El autor indica que el estudio de reducción de anchura de FFN quedó incompleto por falta de cómputo y que los checkpoints de reparación al 10%, 20% y 30% (que alcanzaron 38/60, 40/60 y 33/60 capas respectivamente) se conservan por separado y no se incluyen en este checkpoint desplegable.

La validación reportada incluye la verificación de los 1.146 tensores HF y de todas las formas de FFN, la coincidencia de pérdida del B7 con la ejecución previa de salto del bloque 7 (diferencia máxima por bucket de 0,00108) y una prueba de carga del Q4_K_M con offload completo en GPU en una RTX 3090 con llama.cpp b12359, que respondió correctamente a `17 + 25 = 42`.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y los tags incluyen `conversational`.
- Razonamiento matemático: el benchmark duro reporta 22/40 en la categoría de matemáticas.
- Generación de código: 40/40 en la categoría de código del benchmark duro reportado.
- Uso de herramientas (tool calling): 12/40 en la categoría de tools del benchmark duro, frente a una línea base corregida del modelo original de 13/40.
- Conocimiento general: 14/40 en la categoría de knowledge del benchmark duro.
- Procesamiento de imagen y texto: el tag `image-text-to-text` está presente en el repositorio, lo que sugiere capacidad multimodal, aunque la model card no la detalla.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se listan idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Experimentación académica sobre poda estructural: el checkpoint permite reproducir y analizar el efecto de eliminar un bloque completo de capas en un transformer híbrido, comparando la pérdida B7 con la ejecución de salto del bloque 7 y estudiando la reindexación de capas posteriores. Es adecuado porque el autor documenta la verificación tensor a tensor y la coincidencia de pérdida.
- Investigación de arquitecturas híbridas de atención: al conservar el patrón de tres capas lineales por cada capa completa, sirve para medir cómo afecta la poda a la mezcla de atención lineal y completa en tareas de razonamiento y código.
- Despliegue en GPU de 24 GB para pruebas de humo: el GGUF Q4_K_M (15,324 GB) cabe con offload completo en una RTX 3090 según la validación del autor con llama.cpp b12359, lo que permite validar pipelines de inferencia local sin infraestructura dedicada.
- Evaluación comparativa de robustez tras poda: el resultado 88/160 del benchmark duro (math 22/40, code 40/40, tools 12/40, knowledge 14/40) permite contrastar el deterioro por categoría frente al modelo original, cuyo baseline de tools corregido es 13/40.
- Generación de código en entornos controlados: la puntuación de 40/40 en código del benchmark duro sugiere que el modelo mantiene competencia en esa categoría tras la poda, utilizable en tareas de autocompletado o generación acotada con validación humana.
- Estudio de la capa MTP en decodificación: el GGUF incluye una capa MTP, lo que permite analizar el comportamiento de multi-token prediction en un modelo podado y su impacto en latencia y throughput.
- Base para experimentos de reparación de FFN: aunque los checkpoints de reparación al 10%, 20% y 30% no se incluyen, este checkpoint sirve como punto de partida documentado para continuar el estudio de reducción de anchura de FFN que el autor dejó incompleto.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Benchmark duro (total) | 88/160 | Resultado B7 reportado por el autor |
| Math | 22/40 | Categoría del benchmark duro |
| Code | 40/40 | Categoría del benchmark duro |
| Tools | 12/40 | Baseline corregido del modelo original: 13/40 |
| Knowledge | 14/40 | Categoría del benchmark duro |
| Coincidencia de pérdida B7 | Diferencia máxima por bucket de 0,00108 | Frente a la ejecución previa de salto del bloque 7 |
| Prueba de carga Q4_K_M | Correcta en RTX 3090 con llama.cpp b12359 | Respondió `17 + 25 = 42` con offload completo en GPU |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para BF16: más de 50 GB de memoria de pesos (50,478 GB de tensores safetensors; GGUF BF16 de 49,567 GB).
- VRAM estimada para Q4_K_M: 15,324 GB de pesos; el autor lo describe como la opción práctica para una GPU de 24 GB.
- GPU recomendadas: no se especifican modelos concretos más allá de la RTX 3090 validada; para BF16 se requiere una GPU con más de 50 GB de memoria, lo que apunta a A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- Cabe en consumer GPU: sí, en el formato Q4_K_M y en GPUs de 24 GB como la RTX 3090, según la validación del autor.
- Opciones de despliegue: llama.cpp (validado con la build b12359 mediante `llama-completion`), GGUF compatible con el ecosistema llama.cpp; los safetensors son compatibles con transformers y, previsiblemente, con servidores de inferencia que soporten la arquitectura, aunque no se detalla compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B Trim B7 | 25,239B | no disponible | Benchmark duro 88/160 (math 22/40, code 40/40, tools 12/40, knowledge 14/40) | Apache 2.0 | Hugging Face, safetensors + GGUF BF16 + GGUF Q4_K_M |
| Modelo original Qwen3.5/Qwen3.8 (sin podar) | no disponible | no disponible | Baseline de tools corregido: 13/40 | no disponible | no disponible |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas concretas de terceros; la única comparación documentada es contra el modelo original sin podar en la categoría de tools.

## Limitaciones y advertencias

- Rendimiento degradado en tools y conocimiento: 12/40 en tools (frente a 13/40 del original) y 14/40 en knowledge indican un deterioro claro en esas categorías tras la poda.
- Estudio incompleto: el autor declara que se quedó sin cómputo para terminar el estudio de poda de anchura de FFN; este checkpoint no incluye ninguna reducción de anchura de FFN sin terminar, pero tampoco representa el resultado final del estudio.
- Ausencia de datos de entrenamiento y alineación: no se documenta el dataset, el número de tokens ni fases de RLHF/DPO, por lo que no se puede evaluar el origen de posibles sesgos.
- Riesgo de alucinación: no cuantificado en la información disponible; la puntuación de 14/40 en knowledge sugiere precisamente debilidad en conocimiento factual.
- Idiomas: no se listan idiomas soportados, por lo que no se puede garantizar cobertura multilingüe ni calidad en castellano.
- Contexto: no se documenta la longitud de contexto, lo que impide planificar cargas de conversación o documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo deriva de un modelo Qwen cuya licencia y condiciones de atribución no se detallan en la información disponible; conviene verificar la licencia del modelo base antes de producción.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día; no hay evidencia de uso comunitario ni de mantenimiento continuado.
- Multimodalidad no documentada: el tag `image-text-to-text` aparece, pero la model card no describe capacidades de visión ni su calidad tras la poda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oN8WeJbq5Jo7Pk/hus1
- Apoyo al proyecto (Buy Me a Coffee): https://buymeacoffee.com/dgresesjr

No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
