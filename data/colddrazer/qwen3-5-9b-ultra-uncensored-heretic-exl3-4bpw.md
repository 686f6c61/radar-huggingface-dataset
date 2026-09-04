# colddRazer/Qwen3.5-9B-ultra-uncensored-heretic-EXL3-4bpw

`.
- Soporte multimodal (image-text-to-text) según el pipeline, aunque la cuantización mantiene el vision tower a 16 bpw pero no se usa en inferencia de texto.
- "Uncensored" / "heretic": el modelo ha sido ajustado para suprimir rechazos de seguridad (refusal suppression), por lo que es menos propenso a negarse a responder a peticiones controvertidas.
- No se menciona tool calling ni function calling. Podría indicar "no disponible" o "no se especifica". Pero Qwen3.5 probablemente lo soporta, pero no está en la información. Mejor: "No se especifica soporte de tool calling en la información disponible." Sin embargo, el modelo es un finetune de Qwen3.5, que probablemente tiene capacidades de tool calling. Pero no lo sé. Debo ser honesto: "No disponible en la información proporcionada."

Casos de uso: necesito 6 casos concretos y realistas. Basándome en que es un modelo "uncensored" con capacidad de razonamiento y multimodal, puedo sugerir:
1. Generación de ficción creativa sin restricciones (horror, grimdark, etc.) - el modelo es adecuado porque suprime rechazos y produce contenido vívido.
2. Asistente de escritura para novelas y guiones - gracias a su capacidad de razonamiento y revisión (drafts, critiques, revises).
3. Generación de código en entornos de desarrollo - el modelo puede generar código Python y razonar sobre él, aunque no se especifica tool calling.
4. Análisis de imágenes y descripción de contenido visual - el modelo es image-text-to-text, aunque la cuantización mantiene el vision tower.
5. Chat conversacional con contexto largo - el modelo puede manejar contextos de 4k a 16k+ en una GPU de 10 GB, adecuado para conversaciones multi-turno.
6. Experimentación en investigación sobre alineación y seguridad - el modelo es un "heretic" que suprime rechazos, útil para estudiar comportamientos de modelos sin filtros.
7. Generación de contenido para juegos de rol (RPG) - el modelo puede crear narrativas oscuras y sin censura.

Debo ser específico y explicar cómo se usaría.

Benchmarks: presentaré la tabla de rendimiento de inferencia del autor, y mencionaré que no hay benchmarks de capacidades.

Requisitos de hardware:
- VRAM estimada: 5.79-6.00 GB a 4k contexto en RTX 3080 10GB.
- GPU recomendadas: RTX 3080 o superior, con al menos 10 GB de VRAM. También puede funcionar en GPUs con menos VRAM si se reduce el contexto.
- Cabe en consumer GPU: sí, en RTX 3080 10GB.
- Opciones de despliegue: exllamav3 (runtime nativo para EXL3). También se puede usar vLLM si se convierte el modelo, pero el formato EXL3 es específico de exllamav3. Para llama.cpp/Ollama, necesitarías el formato GGUF (existe una versión GGUF del modelo base).
- Latencia y throughput: prompt processing 2,118-3,267 t/s, generation 197-205 t/s en RTX 3080.

Comparativa con modelos similares: puedo comparar con el modelo base sin cuantizar (llmfan46/Qwen3.5-9B-ultra-uncensored-heretic) y con una versión GGUF del mismo modelo (llmfan46/Qwen3.5-9B-ultra-uncensored-heretic-v2-GGUF). Pero no tengo specs de esos. Podría hacer una tabla con el modelo actual vs. el modelo base, indicando que el modelo base es BF16 (17.5 GB) y el cuantizado es 7.2 GB (6.7 GB según model card). Eso es información del autor. También mencionar que existe una versión GGUF para llama.cpp/Ollama. Eso es suficiente.

Limitaciones y advertencias:
- Sesgos: no se especifican, pero al ser un finetune "uncensored" con supresión de rechazos, puede generar contenido dañino, ofensivo o ilegal sin filtros.
- Riesgo de alucinación: no se especifica, pero como todos los LLM, puede alucinar.
- Limitaciones de contexto: el contexto máximo no está especificado; el autor indica que puede escalar a 16k+ en una RTX 3080, pero no hay garantía.
- Restricciones de licencia: Apache-2.0, permite uso comercial.
- Caveat: el modelo es una cuantización EXL3 4bpw, por lo que requiere el runtime exllamav3; no es directamente compatible con llama.cpp u Ollama a menos que se convierta. La calidad puede degradarse ligeramente debido a la cuantización (sqnr 33-35 dB).
- El modelo mantiene un vision tower que no se usa en inferencia de texto, lo que puede confundir a los usuarios que esperan capacidades multimodales completas.

Enlaces:
- https://huggingface.co/colddRazer/Qwen3.5-9B-ultra-uncensored-heretic-EXL3-4bpw
- https://huggingface.co/llmfan46/Qwen3.5-9B-ultra-uncensored-heretic
- https://huggingface.co/llmfan46/Qwen3.5-9B-ultra-uncensored-heretic-v2-GGUF
- https://github.com/turboderp-org/exllamav3

Ahora, debo escribir la ficha en Markdown. Asegurarme de que solo la primera palabra de los títulos va en mayúscula (excepto nombres propios). Los títulos de las secciones ya están en el formato "## Resumen", etc. Eso está bien.

Voy a redactar con cuidado, sin inventar datos. Usar "no disponible" cuando corresponda.

En la tabla de especificaciones, para "Parametros totales" pondré "3.592.713.968 (según safetensors; el modelo se anuncia como 9B)". Eso es un dato real. Para "Parametros activos" pondré "no disponible (no se especifica si es MoE)". Pero la regla dice "Parametros activos | ... (solo si es MoE)". Si no se sabe si es MoE, puedo poner "no disponible". O mejor, "no aplica (no se especifica arquitectura MoE)". Pero para no inventar, pongo "no disponible".

En "Longitud de contexto" pondré "no disponible (el autor indica que se puede escalar a 16k+ en una RTX 3080)".

En "Tipos de cuantizacion" pondré "EXL3 4 bpw (decoder), 6 bpw (output head), 16 bpw (vision tower)".

En "Idiomas soportados" pondré "no disponible".

En "Formato de pesos" pondré "safetensors (EXL3 para exllamav3)".

Ahora, la sección "Arquitectura y entrenamiento": explicar que es un finetune de Qwen3.5-9B con supresión de rechazos (refusal suppression / heretic / ARA-style alignment repair). El modelo base es llmfan46/Qwen3.5-9B-ultra-uncensored-heretic. La cuantización EXL3 4bpw reduce el tamaño de 17.5 GB BF16 a 6.7 GB. MTP deshabilitado. Vision tower mantenido a 16 bpw pero no usado en inferencia de texto. No hay datos sobre el dataset de entrenamiento.

Capacidades: viñetas.

Casos de uso: 6 viñetas con explicación.

Benchmarks: indicar que no hay benchmarks de capacidades, pero presentar tabla de rendimiento de inferencia.

Requisitos de hardware: viñetas.

Comparativa: tabla con el modelo cuantizado vs. modelo base BF16 vs. versión GGUF (aunque no tengo specs de la versión GGUF, puedo mencionar su existencia). Mejor hacer una tabla con el modelo actual y el modelo base, indicando que el modelo base es BF16 y tiene 17.5 GB, mientras que el cuantizado tiene 6.7-7.2 GB. Para la versión GGUF, indicar "no disponible" en specs.

Limitaciones: viñetas.

Enlaces: lista.

Ahora, escribir todo en español de España, sin emojis, solo Markdown. Asegurarme de que no hay texto fuera de la ficha.

Voy a redactar.## Resumen

El modelo `colddRazer/Qwen3.5-9B-ultra-uncensored-heretic-EXL3-4bpw` es una cuantización EXL3 a 4 bits por peso de un finetune de Qwen3.5-9B denominado "ultra-uncensored-heretic". El modelo base, desarrollado por `llmfan46`, es un ajuste fino con supresión de rechazos (refusal suppression) que sigue la línea de los modelos "abliterated" o "heretic", diseñados para reducir la tendencia del modelo a negarse a responder peticiones controvertidas. Esta versión cuantizada ha sido creada por `colddRazer` para el runtime `exllamav3`, con el objetivo de ofrecer un modelo de 9B con un consumo de VRAM muy bajo y velocidades de inferencia elevadas en hardware de consumo.

El resultado es un modelo multimodal (image-text-to-text) que puede ejecutarse cómodamente en una RTX 3080 de 10 GB, ocupando aproximadamente 6 GB de VRAM a 4k de contexto y generando texto a unos 200 tokens por segundo. La cuantización reduce el tamaño de los pesos de 17,5 GB en BF16 a 6,7 GB, manteniendo el vision tower a 16 bits y el output head a 6 bits por peso. El modelo hereda la licencia Apache-2.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5-9B |
| Parametros totales | 3.592.713.968 (segun safetensors; el modelo se anuncia como 9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el autor indica que se puede escalar a 16k+ en una RTX 3080) |
| Tipos de cuantizacion | EXL3 4 bpw (decoder), 6 bpw (output head), 16 bpw (vision tower) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (EXL3 para exllamav3) |

## Arquitectura y entrenamiento

El modelo es un finetune de `llmfan46/Qwen3.5-9B-ultra-uncensored-heretic`, que a su vez parte de la arquitectura Qwen3.5-9B. Según la documentación del autor, el ajuste fino emplea una técnica de "refusal suppression" (también llamada heretic o ARA-style alignment repair) que modifica la alineación del modelo para que no rechace peticiones que un modelo estándar podría bloquear. No se proporcionan detalles sobre el dataset de entrenamiento ni sobre el proceso de alineación.

La cuantización EXL3 a 4 bits por peso se aplica al decoder, mientras que el output head se mantiene a 6 bits y el vision tower a 16 bits. La predicción multi-token (MTP) está deshabilitada. El vision tower se conserva en la cuantización, pero no se utiliza en inferencia de solo texto. El tamaño del repositorio es de 7,2 GB, aunque el modelo card indica que el archivo de pesos ocupa 6,7 GB.

## Capacidades

- Generación de texto y razonamiento con trazas de pensamiento: Qwen3.5 emite un bloque `` antes de la respuesta final, lo que permite ver el razonamiento del modelo.
- Generación de código: el modelo puede producir código Python y explicar su lógica, como se muestra en los ejemplos de la model card.
- Escritura creativa sin restricciones: el ajuste "heretic" reduce la probabilidad de rechazos, lo que facilita la generación de ficción oscura, horror o contenido de temática adulta.
- Capacidades multimodales: el pipeline es image-text-to-text, lo que sugiere que el modelo puede procesar imágenes, aunque la cuantización mantiene el vision tower a 16 bpw y no se usa en inferencia de texto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita, aunque el modelo muestra un proceso de autoevaluación y revisión en sus trazas de pensamiento.

## Casos de uso

- Escritura de ficción creativa y narrativa oscura: el modelo puede generar relatos de terror, fantasía grimdark o escenas vívidas sin rechazos, gracias a la supresión de filtros del finetune. Es adecuado para autores que necesitan un asistente que no imponga restricciones temáticas.
- Asistente de código en entornos de desarrollo: el modelo genera código Python y explica su lógica en una sola línea, lo que permite integrarlo en flujos de trabajo de programación asistida. La velocidad de generación de ~200 t/s hace viable su uso interactivo.
- Chat conversacional con contexto largo: con 6 GB de VRAM a 4k de contexto y la posibilidad de escalar a 16k+, el modelo puede mantener conversaciones multi-turno en una GPU de consumo como la RTX 3080.
- Generación de contenido para juegos de rol (RPG): el modelo puede crear descripciones de escenarios, diálogos y tramas sin censura, lo que resulta útil para juegos de rol de mesa o videojuegos narrativos.
- Experimentación en investigación sobre alineación y seguridad: al ser un modelo "heretic" con rechazos suprimidos, puede utilizarse para estudiar cómo se comportan los modelos cuando se eliminan las barreras de seguridad, comparando sus respuestas con las de un modelo alineado.
- Análisis de imágenes en entornos controlados: aunque el vision tower no se usa en inferencia de texto, el modelo está etiquetado como image-text-to-text, por lo que podría emplearse en tareas de descripción de imágenes si se carga el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

El autor ha publicado benchmarks de rendimiento de inferencia medidos en una RTX 3080 de 10 GB con exllamav3 1.4.6, muestreo greedy y generación de 128 tokens:

| Prompt ctx | Prompt processing (t/s) | Generation (t/s) | Pico de VRAM | Tiempo total |
|---:|---:|---:|---:|---:|
| 256 | 2.118 | 205,4 | 5,79 GB | 1,35 s |
| 1024 | 2.620 | 205,7 | 5,85 GB | 1,62 s |
| 2048 | 3.186 | 199,9 | 5,96 GB | 1,91 s |
| 4096 | 3.267 | 197,6 | 6,00 GB | 2,53 s |

Además, el autor indica métricas de calidad de cuantización por capa: rfn ≈ 0,02 y sqnr ≈ 33–35 dB en las 32 capas del decoder, y rfn 0,0087 / sqnr 41,2 dB en el output head a 6 bpw.

## Requisitos de hardware

- VRAM estimada: 5,79 GB a 256 tokens de contexto y 6,00 GB a 4096 tokens en una RTX 3080 de 10 GB.
- GPU recomendadas: RTX 3080 o superior con al menos 10 GB de VRAM. También es viable en GPUs con menos VRAM reduciendo la longitud de contexto.
- Cabe en GPU de consumo: sí, en una RTX 3080 de 10 GB con margen para escalar a 16k+ de contexto.
- Opciones de despliegue: el formato EXL3 requiere el runtime exllamav3. Para usar vLLM, llama.cpp u Ollama sería necesario convertir el modelo a otro formato (existe una versión GGUF del modelo base).
- Latencia y throughput: prompt processing entre 2.118 y 3.267 t/s, y generación entre 197,6 y 205,7 t/s en RTX 3080.

## Comparativa con modelos similares

Se compara el modelo cuantizado con el modelo base sin cuantizar y con una versión GGUF del mismo finetune.

| Modelo | Formato | Tamano | Contexto | Licencia |
|---|---|---|---|---|
| colddRazer/Qwen3.5-9B-ultra-uncensored-heretic-EXL3-4bpw | EXL3 4 bpw | 6,7 GB | no disponible | Apache-2.0 |
| llmfan46/Qwen3.5-9B-ultra-uncensored-heretic | BF16 | 17,5 GB | no disponible | Apache-2.0 |
| llmfan46/Qwen3.5-9B-ultra-uncensored-heretic-v2-GGUF | GGUF | no disponible | no disponible | Apache-2.0 |

No se dispone de resultados de benchmarks comparativos entre estos modelos.

## Limitaciones y advertencias

- El modelo es un finetune "uncensored" con supresión de rechazos, lo que implica que puede generar contenido dañino, ofensivo o ilegal sin filtros. Debe usarse con responsabilidad y en entornos controlados.
- No se han publicado evaluaciones de sesgos, alucinaciones o seguridad. El riesgo de alucinación no está cuantificado.
- La longitud de contexto máxima no está especificada. El autor indica que se puede escalar a 16k+ en una RTX 3080, pero no se garantiza un comportamiento correcto más allá de 4k.
- La cuantización EXL3 a 4 bpw puede degradar ligeramente la calidad del modelo (sqnr 33–35 dB), lo que podría afectar a tareas que requieren precisión numérica o razonamiento complejo.
- El formato de pesos EXL3 es específico de exllamav3. No es compatible directamente con llama.cpp, Ollama o vLLM sin conversión previa.
- El vision tower se mantiene en la cuantización, pero no se utiliza en inferencia de solo texto, lo que puede confundir a los usuarios que esperen capacidades multimodales completas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y sus derivados pueden tener restricciones adicionales no documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/colddRazer/Qwen3.5-9B-ultra-uncensored-heretic-EXL3-4bpw
- Modelo base: https://huggingface.co/llmfan46/Qwen3.5-9B-ultra-uncensored-heretic
- Versión GGUF del modelo base: https://huggingface.co/llmfan46/Qwen3.5-9B-ultra-uncensored-heretic-v2-GGUF
- Runtime exllamav3: https://github.com/turboderp-org/exllamav3
