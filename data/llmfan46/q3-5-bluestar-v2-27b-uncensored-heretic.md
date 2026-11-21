# llmfan46/Q3.5-BlueStar-v2-27B-uncensored-heretic

## Resumen

Q3.5-BlueStar-v2-27B-uncensored-heretic es una variante "decensored" (abliterated) del modelo zerofata/Q3.5-BlueStar-v2-27B, publicada por el contribuidor independiente llmfan46. El modelo conserva la arquitectura y los pesos del modelo base Qwen3.5 de 27.356.728.560 parámetros (~27,4B) y aplica sobre ellos una ablación de direcciones de rechazo mediante la herramienta Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA). El objetivo es reducir la tasa de rechazos del modelo original (99/100 en la evaluación del autor) hasta 10/100, manteniendo una divergencia KL de 0,0507 respecto al original.

El modelo está pensado para casos de uso creativos y de rol (roleplay, narrativa, personajes de anime) donde el modelo base mostraba rechazos o respuestas edulcoradas. Los tags del repositorio incluyen heretic, uncensored, decensored, abliterated y ara, y los datasets de ajuste del modelo base son de temática anime y de personajes (Instruct-Anime, Roleplay-Anime-Characters, Gemini-3.1-Pro-GLM5-Characters, Gemini-3.1-Pro-SmallWiki).

Es relevante ahora porque demuestra un flujo de trabajo reproducible de abliteración selectiva por capas (de la 21 a la 64) con métricas de preservación de capacidad (PIQA) y de divergencia respecto al original, algo poco habitual en las publicaciones de modelos "uncensored". La licencia es MIT y el repositorio pesa 54,7 GB en safetensors, con cuantizaciones GGUF publicadas en un repositorio aparte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5; el repositorio declara el tag `qwen3_5`) |
| Parametros totales | 27.356.728.560 (~27,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (repositorio aparte: llmfan46/Q3.5-BlueStar-v2-27B-uncensored-heretic-GGUF); safetensors en precisión original |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo principal), GGUF (repo de cuantizaciones) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5 (tag `qwen3_5` en Hugging Face), con 27.356.728.560 parámetros. No se dispone de información sobre número de capas, dimensión oculta, cabezas de atención, longitud de contexto nativa ni composición del corpus de preentrenamiento del modelo base zerofata/Q3.5-BlueStar-v2-27B. El modelo base fue ajustado con datasets de rol y anime (Instruct-Anime, Roleplay-Anime-Characters, Gemini-3.1-Pro-GLM5-Characters, Gemini-3.1-Pro-SmallWiki), según los metadatos del repositorio.

La innovación técnica de esta variante es el proceso de abliteración con Heretic v1.2.0 y el método Arbitrary-Rank Ablation (ARA). La ablación se aplica sobre las capas 21 a 64 (start_layer_index 21, end_layer_index 64) y actúa sobre los componentes `attn.out_proj` y `attn.o_proj`. Los hiperparámetros publicados son: preserve_good_behavior_weight 0,3383, steer_bad_behavior_weight 0,0021, overcorrect_relative_weight 0,9964 y neighbor_count 10. El resultado declarado es una reducción de rechazos de 99/100 a 10/100 con una divergencia KL de 0,0507 frente al modelo original. No se documenta ningún entrenamiento adicional con RLHF o DPO: la modificación es puramente de pesos por ablación de direcciones.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base Qwen3.5 de 27B.
- Escritura creativa y roleplay multi-turno, con menor tasa de rechazos y de respuestas moralizantes que el original (10/100 frente a 99/100 según la evaluación del autor).
- Generación de personajes y narrativa de temática anime, alineada con los datasets de ajuste del modelo base.
- Razonamiento físico básico medido en PIQA (acc_norm 0,8248).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara lista de idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo está ajustado sobre datasets de personajes de anime y rol, y la abliteración reduce los rechazos en conversaciones de ficción con contenido adulto o violento, lo que lo hace adecuado para motores de personajes en aplicaciones de entretenimiento.
- Generación creativa de ficción: escritura de relatos, guiones y diálogos donde el modelo base tendía a suavizar o rechazar escenas crudas; la divergencia KL de 0,0507 indica que conserva el estilo y el conocimiento del original.
- Prototipado de asistentes sin filtros para investigación: útil para estudiar comportamiento de modelos abliterated, medir tasas de rechazo y comparar con el original en condiciones controladas.
- Evaluación de técnicas de abliteración: sirve como caso de referencia reproducible (parámetros ARA publicados, capas objetivo, métricas PIQA y KL) para investigadores que quieran replicar o comparar métodos de decensoring.
- Generación de diálogos para videojuegos y visual novels: la ventana de contexto no está documentada, pero el tamaño de 27B permite mantener coherencia de personaje en sesiones largas si se confirma el contexto nativo del modelo base.
- Despliegue local con cuantización GGUF: las versiones GGUF publicadas permiten ejecutar el modelo en estaciones de trabajo con GPU de consumo mediante llama.cpp u Ollama, para experimentación offline sin depender de APIs.

## Benchmarks y rendimiento

| Benchmark | Modelo original (Q3.5-BlueStar-v2-27B) | Este modelo (heretic) |
|---|---|---|
| PIQA acc | 0,8232 ± 0,0089 | 0,8205 ± 0,0090 |
| PIQA acc_norm | 0,8237 ± 0,0089 | 0,8248 ± 0,0089 |
| Tasa de rechazos | 99/100 | 10/100 |
| Divergencia KL vs original | 0 (por definición) | 0,0507 |

Los resultados de PIQA se obtuvieron con batch size 128, filtro none y 0-shot. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (BF16/FP16): aproximadamente 55 GB solo para pesos, más overhead de KV cache; requiere GPU de 80 GB (A100 80GB, H100 80GB) o multi-GPU.
- Cuantización GGUF: el repositorio de cuantizaciones permite reducir el peso a rangos típicos de 4 bits (~15-16 GB), 5 bits (~19 GB) y 8 bits (~29 GB), aunque los tamaños exactos por archivo no están disponibles en la información proporcionada.
- GPU de consumo: con cuantización de 4 bits es plausible en RTX 4090 (24 GB) y RTX 3090 (24 GB); en 8 bits no cabe en GPU de consumo de 24 GB.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI para safetensors en BF16/FP16 en hardware de datacenter.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Q3.5-BlueStar-v2-27B-uncensored-heretic (este) | ~27,4B | no disponible | MIT | Abliterated con Heretic/ARA; 10/100 rechazos; KL 0,0507 |
| zerofata/Q3.5-BlueStar-v2-27B (base) | ~27,4B | no disponible | no disponible en la información proporcionada | Modelo original; 99/100 rechazos; PIQA acc_norm 0,8237 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- La abliteración elimina direcciones de rechazo, no el conocimiento subyacente: el modelo puede generar contenido dañino, ilegal o sexualmente explícito sin filtros, lo que traslada toda la responsabilidad de moderación al despliegue.
- La divergencia KL de 0,0507 indica un cambio no trivial en la distribución de salida; pueden aparecer degradaciones en tareas de razonamiento o instrucción no cubiertas por PIQA.
- Solo se ha publicado PIQA como benchmark de preservación de capacidad; no hay evidencia sobre MMLU, código, matemáticas ni seguridad.
- No se documentan sesgos conocidos, idiomas soportados ni longitud de contexto; estos datos deben verificarse contra el modelo base antes de usarlo en producción.
- Riesgo de alucinación: no cuantificado en la información disponible; es esperable un comportamiento similar al de un modelo de 27B sin herramientas de verificación.
- La licencia MIT permite uso comercial, pero el contenido generado puede infringir normativas locales sobre material sexual, violencia o difamación; se recomienda filtrado posterior en producción.
- El autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face y que no podrá subir nuevos modelos sin financiación; esto afecta a la disponibilidad a largo plazo de actualizaciones y cuantizaciones.
- El repositorio tiene 21 descargas y 1 like en el momento de la consulta, por lo que la validación comunitaria es mínima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/Q3.5-BlueStar-v2-27B-uncensored-heretic
- Cuantizaciones GGUF: https://huggingface.co/llmfan46/Q3.5-BlueStar-v2-27B-uncensored-heretic-GGUF
- Modelo base: https://huggingface.co/zerofata/Q3.5-BlueStar-v2-27B
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Método Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Ko-fi del autor: https://ko-fi.com/llmfan46
- Patreon del autor: https://patreon.com/LLMfan46
