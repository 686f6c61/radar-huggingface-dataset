# mdcreativeagent/gemma-4-E4B-it-ultra-uncensored-heretic

## Resumen

`mdcreativeagent/gemma-4-E4B-it-ultra-uncensored-heretic` es un fine-tune del modelo multimodal `google/gemma-4-E4B-it` de Google DeepMind, publicado por el usuario independiente mdcreativeagent. Se trata de una versión "decensored" o "abliterated": se han eliminado o atenuado los mecanismos de rechazo del modelo original mediante la técnica de ablación de direcciones en el espacio de activaciones, en este caso con la herramienta Heretic v1.2.0 y el método Arbitrary-Rank Ablation (ARA). El resultado, según la model card, es un modelo que rechaza un 3 % de las peticiones frente al 99 % del original, con una divergencia KL de 0,0076 respecto al modelo base.

El modelo conserva la arquitectura y capacidades del Gemma 4 E4B original: es multimodal (entrada de imagen y texto, pipeline `any-to-any`), con aproximadamente 8.000 millones de parámetros totales según los pesos en safetensors (7.996.156.490), y un repositorio de 16 GB. Está pensado para desarrolladores que necesitan un modelo con menos restricciones de contenido para investigación, generación creativa o experimentación con alineación, manteniendo un rendimiento cercano al original en tareas de razonamiento físico y conocimiento general.

La relevancia de esta ficha es doble: por un lado, documenta un caso de modificación de alineación sobre un modelo de Google; por otro, advierte de que el modelo no ha sido validado por el equipo original y de que su uso comercial está sujeto a la licencia Gemma 4 (Apache 2.0 según la model card, con enlace a los términos de Google). No hay datos de idiomas soportados ni de benchmarks específicos del fine-tune más allá de PIQA y MMLU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, variante E4B); detalles internos no disponibles en la información proporcionada |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan GGUF u otras) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E4B-it`, un modelo multimodal de la familia Gemma 4 de Google DeepMind, diseñado para entrada de imagen y texto y salida de texto (pipeline `any-to-any`). La información proporcionada no detalla la arquitectura interna (número de capas, tipo de atención, dimensiones ocultas) ni los datos de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí se especifica es que el fine-tune se ha realizado con Heretic v1.2.0 aplicando Arbitrary-Rank Ablation (ARA), una técnica de ablación de direcciones que modifica los pesos del modelo para reducir la probabilidad de respuestas de rechazo.

Los parámetros de ablación documentados son: `start_layer_index` 7, `end_layer_index` 36, `preserve_good_behavior_weight` 0,5783, `steer_bad_behavior_weight` 0,0001, `overcorrect_relative_weight` 0,9986 y `neighbor_count` 15. El componente objetivo es `attn.o_proj`. No se indica si hubo entrenamiento adicional con datos, sino una modificación directa de pesos. La model card reporta una divergencia KL de 0,0076 frente al original, lo que sugiere un cambio limitado en la distribución de salidas, y una reducción de rechazos de 99/100 a 3/100 en una evaluación no especificada.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Gemma 4 E4B-it.
- Capacidades multimodales de entrada: procesamiento de imagen y texto (pipeline `any-to-any`), según la etiqueta del modelo.
- Reducción drástica de rechazos y respuestas de evasión: 3/100 frente a 99/100 del original, según la model card.
- Capacidad de responder a peticiones que el modelo original rechazaría, orientada a experimentación con alineación y contenido sin censura.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo cambia el comportamiento de un modelo multimodal al aplicar ablación de direcciones, comparando rechazos y divergencia KL con el original (0,0076 de KL, 3/100 rechazos).
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles y que el modelo original rechazaría, gracias a la reducción de respuestas de evasión.
- Evaluación de robustez de filtros: uso como contraste para probar clasificadores de contenido o sistemas de moderación, ya que produce respuestas que el modelo alineado evita.
- Experimentación con técnicas de abliteration: replicar o comparar los parámetros de Heretic/ARA documentados (capas 7-36, `attn.o_proj`) sobre otros modelos de la familia Gemma 4.
- Pruebas de regresión de calidad: verificar que la modificación de pesos no degrada tareas de sentido común y conocimiento, usando PIQA (85,85 % frente a 86,02 %) y MMLU (68,60 % frente a 69,46 %) como referencia.
- Docencia y divulgación: demostrar de forma práctica qué es la abliteration y cómo se mide su impacto con métricas de rechazo y divergencia KL, en un modelo de ~8B parámetros y 16 GB de pesos.

## Benchmarks y rendimiento

| Benchmark | Modelo original (gemma-4-E4B-it) | Este modelo (Heretic) | Diferencia |
|---|---|---|---|
| PIQA (1838 preguntas) | 1581 correctas, 86,02 % | 1578 correctas, 85,85 % | -0,17 pp |
| MMLU (14042 preguntas) | 9753 correctas, 69,46 % | 9633 correctas, 68,60 % | -0,86 pp |
| Rechazos (100 peticiones) | 99/100 | 3/100 | -96 pp |
| Divergencia KL vs original | 0 (por definición) | 0,0076 | — |

Desglose MMLU del modelo original (temas destacados): `professional_law` 52,87 %, `moral_scenarios` 43,91 %, `miscellaneous` 81,61 %, `professional_psychology` 75,16 %, `high_school_psychology` 89,17 %, `high_school_macroeconomics` 72,82 %, `elementary_mathematics` 65,87 %, `moral_disputes` 68,21 %, `prehistory` 75,31 %, `philosophy` 70,74 %. En el modelo Heretic, los valores equivalentes son: `professional_law` 52,67 %, `moral_scenarios` 41,23 %, `miscellaneous` 82,12 %, `professional_psychology` 73,86 %, `high_school_psychology` 90,09 %, `high_school_macroeconomics` 71,28 %, `elementary_mathematics` 63,76 %, `moral_disputes` 69,08 %, `prehistory` 75,00 %, `philosophy` 70,74 %. No se han publicado otros benchmarks (HumanEval, GSM8K, MMLU-Pro, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos (7,996B parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto moderado.
- Cuantización a 8 bits: ~8 GB de pesos; a 4 bits: ~4-5 GB de pesos, aunque no se listan ficheros GGUF en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4090 o GPUs de 16 GB si se cuantiza.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16 con contexto limitado, y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits (requiere conversión propia, no hay GGUF publicado).
- Opciones de despliegue: transformers (librería indicada), y potencialmente vLLM, TGI o llama.cpp si se generan los formatos adecuados; no se confirma compatibilidad en la información.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Rechazos | MMLU | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este modelo (gemma-4-E4B-it ultra-uncensored-heretic) | ~8B | no disponible | Sí (image-text-to-text) | apache-2.0 | 3/100 | 68,60 % | Hugging Face, 0 descargas |
| google/gemma-4-E4B-it (base) | ~8B | no disponible | Sí | Apache 2.0 (Gemma 4) | 99/100 | 69,46 % | Hugging Face (oficial) |
| Otros fine-tunes "uncensored" de la familia Gemma | variable | no disponible | variable | variable | no disponible | no disponible | Hugging Face (comunidad) |

No se dispone de datos de benchmarks ni especificaciones de contexto para establecer una comparación cuantitativa con alternativas de otros autores; la comparación principal es con el modelo base, que pierde 0,86 pp en MMLU y 0,17 pp en PIQA a cambio de reducir los rechazos en 96 pp.

## Limitaciones y advertencias

- El modelo ha sido modificado para reducir rechazos; puede generar contenido sensible, ofensivo o inapropiado que el original evitaría. No es apto para producción sin moderación externa.
- No ha sido validado por Google DeepMind; es un fine-tune de la comunidad con 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de validación por terceros.
- La licencia se declara como apache-2.0, pero la model card enlaza a la licencia Gemma 4 de Google; conviene verificar los términos aplicables antes de uso comercial, ya que pueden imponer restricciones adicionales.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de tasa de alucinación para este fine-tune.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del original.
- Longitud de contexto no disponible; no se puede garantizar el mismo contexto que el modelo base sin verificación.
- La evaluación de rechazos (3/100 vs 99/100) se realizó sobre un conjunto no especificado de 100 peticiones; no es una medida estandarizada ni reproducible con la información dada.
- La ablación se aplicó solo a `attn.o_proj` en las capas 7-36; otras rutas de rechazo podrían permanecer intactas o, inversamente, la modificación podría afectar a capacidades no medidas.
- El repositorio ocupa 16 GB y el autor indica que ha alcanzado el límite de almacenamiento gratuito de Hugging Face; la disponibilidad futura del modelo no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdcreativeagent/gemma-4-E4B-it-ultra-uncensored-heretic
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Método Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
