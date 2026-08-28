# Deepdive404-3/gemma-4-E4B-it-OBLITERATED

## Resumen

Gemma 4 E4B OBLITERATED es una versión modificada del modelo oficial de Google `google/gemma-4-E4B-it`, publicada por el usuario Deepdive404-3. El objetivo de esta variante es eliminar por completo los mecanismos de rechazo y los guardarraíles de seguridad del modelo original mediante la técnica de abliteración OBLITERATUS, que combina SVD blanqueado, cirugía de cabezas de atención y activaciones winsorizadas. El resultado es un modelo de generación de texto que, según su autor, presenta un 0% de rechazo duro ante cualquier petición.

El modelo base, Gemma 4 E4B, es un modelo de lenguaje de nueva arquitectura desarrollado por Google DeepMind, con aproximadamente 8.000 millones de parámetros en sus pesos totales (aunque se comercializa como "4B" por su eficiencia), 42 capas, atención con pesos KV compartidos y soporte multimodal (visión y audio) mediante un proyector adicional. Esta versión abliterada mantiene los 720 tensores del modelo original tras corregir un bug de la versión anterior que eliminaba 54 tensores de proyección K/V en las capas 24-41. El modelo se distribuye tanto en formato safetensors (bfloat16, ~17 GB) como en GGUF cuantizado (Q4_K_M, Q5_K_M y Q8_0), lo que permite su ejecución en dispositivos con recursos limitados, incluso en un iPhone según su autor.

La relevancia de este modelo radica en su naturaleza de "sin censura", orientada a casos de uso donde se requiere libertad creativa total o investigación sobre los efectos de la abliteración en modelos de nueva generación. Sin embargo, hay que tener en cuenta que se trata de un modelo de 4B con limitaciones inherentes de calidad, y que su uso conlleva riesgos éticos y legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención compartida KV (arquitectura `gemma4`), 42 capas, 21 capas modificadas quirúrgicamente |
| Parametros totales | 7.996.156.448 (según safetensors) |
| Parametros activos | no disponible (el modelo se comercializa como "E4B" de 4B, pero el peso total sugiere ~8B; no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (4.9 GB), Q5_K_M (5.3 GB), Q8_0 (7.4 GB), mmproj-f16 (990 MB); safetensors bfloat16 (~17 GB) |
| Idiomas soportados | no disponible (el modelo base de Google es multilingüe, pero esta variante no especifica idiomas; se observan salidas en tailandés y japonés en ~4% de los casos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base, Gemma 4 E4B, utiliza una arquitectura Transformer con una innovación clave: pesos K/V compartidos entre capas (`num_kv_shared_layers: 18`). Esto significa que las capas 24-41 referencian los mismos tensores de proyección K/V que la capa 24, lo que reduce significativamente el número de parámetros y el uso de memoria. El modelo cuenta con 42 capas en total y soporta entrada multimodal (visión y audio) mediante un proyector adicional.

La versión OBLITERATED se obtuvo aplicando el método OBLITERATUS en su modo `aggressive`, que combina SVD blanqueado, cirugía de cabezas de atención y activaciones winsorizadas. El proceso utilizó un corpus de 842 pares de prompts contrastivos en 10 categorías para identificar y eliminar los patrones de rechazo. Se modificaron quirúrgicamente 21 de las 42 capas. Un detalle técnico relevante es que la versión v3 corrige un bug de la v2: la proyección de rechazo se aplicaba 18 veces al mismo tensor compartido, corrompiéndolo; en v3 se aplica una única vez sobre la capa propietaria y se propaga automáticamente a las capas que comparten el peso. El entrenamiento se realizó de forma casi totalmente autónoma mediante un agente de IA (Hermes Agent) con menos de 10 prompts humanos.

No se dispone de información sobre el número de tokens de entrenamiento ni sobre el uso de RLHF o DPO en el modelo base, más allá de que el modelo original de Google incorpora guardarraíles que esta versión elimina.

## Capacidades

- Generación de texto libre y conversacional, con capacidad de mantener diálogos multi-turno.
- Razonamiento básico y generación de respuestas coherentes sobre temas variados, aunque con las limitaciones propias de un modelo de 4B.
- Soporte multimodal parcial: el modelo incluye un proyector `mmproj-f16` para entrada de imágenes y audio, aunque no se detalla la calidad de estas capacidades en la versión abliterada.
- Modo "thinking" heredado del modelo base, aunque no se especifica su funcionamiento tras la abliteración.
- Sin mecanismos de rechazo: el modelo no muestra negativas ni advertencias de seguridad ante ninguna petición.
- Tool calling y function calling: no se menciona explícitamente en la documentación, pero el modelo base de Gemma 4 podría incluirlo; no hay confirmación para esta variante.
- Capacidades multilingües: no confirmadas; se observan salidas en tailandés y japonés en ~4% de los casos, lo que sugiere cierto multilingüismo residual.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar narrativa, poesía o guiones sin autocensura, lo que resulta útil para autores que exploran temas controvertidos o tabú en un entorno controlado.
- Investigación sobre abliteración y alineación: sirve como objeto de estudio para analizar cómo la eliminación de guardarraíles afecta al comportamiento y la calidad de un modelo de nueva arquitectura.
- Generación de contenido para juegos de rol o simulación de personajes: su naturaleza sin rechazo permite interpretar personajes sin limitaciones morales, útil en prototipos de videojuegos o experiencias interactivas.
- Pruebas de estrés en sistemas de moderación de contenido: se puede utilizar para evaluar la robustez de filtros de contenido y sistemas de detección de lenguaje dañino.
- Desarrollo de asistentes de escritura técnica especializados: aunque con limitaciones de calidad, puede generar documentación, resúmenes o borradores en dominios específicos sin las restricciones habituales de los modelos alineados.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones GGUF, el modelo puede ejecutarse en dispositivos móviles o en hardware de consumo, permitiendo prototipos de aplicaciones de chat local sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona únicamente métricas de calidad subjetivas evaluadas por un juez automático (Claude):

| Metrica | Valor |
|---|---|
| Tasa de rechazo duro | 0% |
| Desviacion suave (cambio de tema) | ~28% |
| Respuestas coherentes y pertinentes | ~51% |
| Salidas degeneradas (bucles de repeticion) | ~20% |
| Idioma incorrecto (tailandes/japones) | ~4% |

Estas métricas indican que, aunque el modelo no rechaza ninguna petición, su calidad de respuesta es limitada: solo la mitad de las respuestas son coherentes y pertinentes, y una quinta parte son degeneradas. El autor señala que estas limitaciones son inherentes al modelo base de 4B y no fueron introducidas por la abliteración.

## Requisitos de hardware

- Cuantizacion Q4_K_M (4.9 GB): cabe en dispositivos con 6 GB de RAM o VRAM; el autor afirma que funciona en un iPhone.
- Cuantizacion Q8_0 (7.4 GB): requiere al menos 8 GB de RAM/VRAM; el autor indica que cabe en 8 GB.
- Safetensors bfloat16 (~17 GB): requiere una GPU con al menos 20 GB de VRAM para inferencia sin cuantizar, o CPU con suficiente RAM.
- GPU recomendadas: para las cuantizaciones GGUF, cualquier GPU moderna con soporte de llama.cpp (RTX 3060, RTX 4090, etc.) o incluso CPU. Para safetensors, se recomienda A100, H100 o RTX 4090 con 24 GB.
- Compatibilidad de software: Ollama 0.20+, llama.cpp build b8665+, LM Studio 0.3.16+ (con backend actualizado), koboldcpp nightly, text-generation-webui con llama-cpp-python actualizado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, Hugging Face Transformers (para safetensors).
- Latencia y throughput: no disponibles en la documentacion; dependerán del hardware y la cuantizacion utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Refusal rate | Licencia | Formato |
|---|---|---|---|---|---|
| google/gemma-4-E4B-it (original) | ~4B (activos) / ~8B (totales) | no disponible | 98.8% hard refusal | Apache-2.0 | safetensors, GGUF |
| Deepdive404-3/gemma-4-E4B-it-OBLITERATED | ~8B (totales) | no disponible | 0% hard refusal | Apache-2.0 | safetensors, GGUF |
| Llama 3.2 3B (sin abliterar) | 3.2B | 128K | alto (guardarraíles) | Llama 3.2 license | safetensors, GGUF |
| Qwen 2.5 7B (sin abliterar) | 7.6B | 128K | alto (guardarraíles) | Apache-2.0 | safetensors, GGUF |

La comparativa se centra en el efecto de la abliteración sobre el modelo base. Frente a otros modelos de tamaño similar, el OBLITERATED destaca por su ausencia total de rechazo, pero adolece de las mismas limitaciones de calidad que cualquier modelo de 4B. No se dispone de datos de rendimiento en benchmarks estándar para realizar una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo no tiene ningun mecanismo de rechazo: puede generar contenido dañino, ilegal o éticamente problemático sin ninguna advertencia. Su uso en producción debe considerar cuidadosamente los riesgos legales y de reputación.
- Calidad de generación limitada: ~20% de las respuestas son degeneradas (bucles de repetición) y ~28% se desvían del tema. Se recomienda usar `repeat_penalty` de 1.1 y un prompt de sistema en inglés para mitigar estos problemas.
- Salidas en idiomas incorrectos: en ~4% de los casos, el modelo produce texto en tailandés o japonés de forma inesperada, lo que puede romper la experiencia del usuario.
- Arquitectura nueva y poco soportada: la arquitectura `gemma4` requiere versiones recientes de las herramientas de inferencia. Si se usa una versión desactualizada, el modelo puede no cargar o producir gibberish.
- Sin datos de benchmarks estándar: no se puede evaluar su rendimiento en tareas de razonamiento, código o matemáticas en comparación con otros modelos.
- La abliteración fue realizada por un agente de IA con supervisión humana mínima; no hay garantías de que el proceso no haya introducido artefactos no documentados en el comportamiento del modelo.
- Licencia Apache-2.0: permite uso comercial, pero el contenido generado sin restricciones puede violar otras normativas (por ejemplo, leyes de odio o difamación).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deepdive404-3/gemma-4-E4B-it-OBLITERATED
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Página de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Página de Gemma 4 E4B (gemma4.dev): https://gemma4.dev/models/gemma-4-e4b
