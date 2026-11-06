# Amrica655/FELAY-1-ASTRA

## Resumen

FELAY-1-ASTRA (COMB01) es un ajuste experimental del modelo Gemma 3 de 4 mil millones de parámetros, publicado por el autor independiente Amrica655 bajo el paraguas de "FELAY Lab". No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: es una modificación quirúrgica de pesos sobre `unsloth/gemma-3-4b-it` en la que se restauran los pesos de layer-norm de las capas 0 a 23 a sus valores originales y se escalan las filas de embedding de tokens de código por un factor de 1,05. El objetivo declarado es recuperar la coherencia de una versión previa del modelo que generaba texto corrupto.

La relevancia de esta ficha es sobre todo metodológica y de advertencia: el modelo documenta un proceso de 22 experimentos individuales y 7 combinaciones evaluadas con un arnés fijo interno, y publica el log completo (`felay_lab_log.csv`). Los resultados son exclusivamente internos (perplejidad sobre textos en inglés, persa y código, más tres prompts de generación), sin benchmarks estándar como MMLU o HumanEval.

Con 4.300.079.472 parámetros totales, pesos en formato 4-bit bitsandbytes y un repositorio de 6,5 GB, el modelo está pensado para inferencia en hardware de consumo. Su licencia es la Gemma License, con las restricciones que esta implica para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), según modelo base |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Gemma 3 4B) |
| Tipos de cuantizacion | 4-bit bitsandbytes (formato convertido, tal como lo guardó el notebook del laboratorio) |
| Idiomas soportados | en, fa |
| Licencia | gemma (Gemma License) |
| Formato de pesos | safetensors (4-bit convertido), más config.json, generation_config.json, tokenizer.json, tokenizer_config.json, chat_template.jinja |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `unsloth/gemma-3-4b-it`, un transformer decoder-only de la familia Gemma 3 con 4.300 millones de parámetros. El autor no documenta cambios estructurales: no hay capas añadidas, ni modificación de atención, ni cambio de dimensionalidad. El modelo se distribuye ya cuantizado a 4 bits con bitsandbytes, lo que condiciona tanto el tamaño del repositorio (6,5 GB) como las opciones de despliegue.

El "entrenamiento" no es tal: FELAY Lab aplicó 22 movimientos individuales sobre los pesos, revirtiendo cada uno tras medirlo, y conservó solo los 6 que mejoraban la perplejidad media sin producir generación corrupta. Después probó 7 combinaciones (COMB00 a COMB06) y seleccionó COMB01, compuesta por dos movimientos: (1) restaurar los pesos de layer-norm de las capas 0 a 23 a los valores del modelo base (EXP05, `LN_restore_early_middle`) y (2) multiplicar por 1,05 las filas de embedding correspondientes a tokens de código (`EMB_scale_1.05`). No se documenta uso de RLHF, DPO ni datos de entrenamiento adicionales; el proceso es puramente de edición de pesos guiada por evaluación.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo instruct base Gemma 3 4B.
- Generación de código: el ajuste escala específicamente los embeddings de tokens de código, lo que sugiere un sesgo deliberado hacia contenido de programación.
- Soporte de inglés y persa (farsi) como idiomas declarados en la model card.
- Instrucciones y formato de chat mediante `chat_template.jinja` incluido en el repositorio.
- Capacidades multimodales, tool calling o modo thinking: no disponibles en la información proporcionada para esta variante (el modelo base Gemma 3 4B IT las soporta, pero el autor no las documenta ni las valida tras la edición de pesos).
- No se documenta soporte de agentes, razonamiento multi-paso ni function calling verificado en esta versión.

## Casos de uso

- Evaluación de técnicas de edición de pesos: el repositorio incluye el log de 29 experimentos (`felay_lab_log.csv`), lo que lo convierte en un caso de estudio reproducible para investigadores que quieran replicar el método de selección por perplejidad fija.
- Experimentación con cuantización 4-bit bitsandbytes: al distribuirse ya cuantizado, sirve para probar pipelines de carga con `bitsandbytes` en entornos con VRAM limitada.
- Generación de código asistida en inglés y persa: el escalado de embeddings de tokens de código apunta a este uso, aunque sin benchmarks públicos que lo respalden.
- Prototipado de chatbots bilingües inglés-persa en local: el tamaño de 4B y la cuantización 4-bit permiten ejecutarlo en GPUs de consumo.
- Docencia y demostraciones sobre límites de la evaluación interna: útil para ilustrar por qué una perplejidad baja en un arnés pequeño no equivale a calidad general.
- Pruebas de regresión de coherencia: comparar sus salidas frente al Gemma 3 4B IT original en los mismos prompts permite medir el efecto real de los dos movimientos aplicados.

## Benchmarks y rendimiento

Los únicos datos disponibles son los del arnés fijo interno de FELAY Lab, que mide perplejidad media sobre textos en inglés, persa y código, más tres prompts de generación. No son benchmarks estándar.

| Modelo | Perplejidad media | Coherencia |
|---|---|---|
| Gemma base (unsloth/gemma-3-4b-it) | 50,588 | coherente |
| FELAY-1-ASTRA original | ~8,97e12 | corrupta |
| FELAY-1-ASTRA actualizado (COMB01) | 37,440 | coherente |

Menor perplejidad es mejor. El modelo actualizado mejora al base en este arnés concreto (37,440 frente a 50,588), pero se trata de una evaluación interna pequeña y no de una comparación con MMLU, HumanEval, GSM8K ni similares. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 3-4 GB para los pesos en 4-bit (el `model.safetensors` ocupa aproximadamente 3.228,9 MB), más overhead de activaciones y del runtime de bitsandbytes; un presupuesto realista de 6-8 GB de VRAM es prudente.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en数据中心, A100 o H100 quedan sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM, gracias a la cuantización 4-bit ya aplicada.
- Opciones de despliegue: al estar en formato bitsandbytes 4-bit, la carga requiere `transformers` con `bitsandbytes`; no es directamente compatible con llama.cpp, Ollama ni GGUF sin reconversión previa. vLLM y TGI requerirían verificar compatibilidad con el formato convertido.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Evaluación pública |
|---|---|---|---|---|---|
| FELAY-1-ASTRA (COMB01) | 4,3B | no disponible | Gemma License | safetensors 4-bit bnb | Solo arnés interno |
| unsloth/gemma-3-4b-it (base) | 4,3B | no disponible | Gemma License | safetensors (fp/bf16 y cuantizaciones) | Benchmarks de Gemma 3 publicados por Google |
| Gemma 3 4B IT (original de Google) | 4,3B | no disponible | Gemma License | safetensors, GGUF vía comunidad | Benchmarks de Gemma 3 publicados por Google |
| Qwen2.5-Coder-3B-Instruct | ~3B | 32.768 tokens (según documentación de Qwen) | Apache 2.0 | safetensors, GGUF | Benchmarks públicos de código |

La comparación directa es limitada: FELAY-1-ASTRA no publica resultados en benchmarks estándar, mientras que el Gemma 3 4B IT original y Qwen2.5-Coder cuentan con evaluaciones públicas. La ventaja de FELAY-1-ASTRA es la reproducibilidad de su proceso interno y su tamaño reducido en 4-bit; su desventaja es la ausencia de validación externa y una licencia más restrictiva que Apache 2.0.

## Limitaciones y advertencias

- Los resultados de rendimiento proceden de un conjunto de evaluación interno pequeño (textos en inglés, persa y código, más tres prompts) y no de benchmarks externos; no deben extrapolarse a calidad general.
- La versión anterior del modelo producía generación corrupta con perplejidad de ~8,97e12; esto indica que las ediciones de pesos pueden degradar gravemente la coherencia y que el margen de error del método es alto.
- Los pesos se distribuyen en formato 4-bit convertido por bitsandbytes, lo que limita la portabilidad a otros runtimes y puede introducir pérdida de calidad adicional frente a una cuantización estándar.
- Solo se declaran inglés y persa; el rendimiento en castellano u otros idiomas no está validado y puede degradarse respecto al modelo base.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos antes de cualquier despliegue en producción.
- Riesgo de alucinación y sesgos: no documentados específicamente para esta variante; se heredan los del modelo base Gemma 3 4B IT, sin mitigaciones adicionales conocidas.
- El autor advierte explícitamente de que la actualización sustituye los pesos anteriores del repositorio; no hay versiones etiquetadas ni historial de releases más allá del commit actual.
- No hay pipeline declarado en Hugging Face ni demos públicas verificadas; el Space enlazado aparece como privado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Amrica655/FELAY-1-ASTRA
- Space del autor (privado): https://huggingface.co/spaces/Amrica655/FELAY/tree/main
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-it
- Familia Gemma 3 de Google: no disponible en la información proporcionada
- Paper o blog técnico de FELAY Lab: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
