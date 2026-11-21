# Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ

## Resumen

El modelo `Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ` es una cuantización GGUF del modelo base `Qwen/Qwen3.5-9B`, publicada por el usuario Anbeeld. Se trata de una familia de cuantizaciones que replica 1:1 las recetas de Bartowski para Qwen3.5-9B, pero aplicando SINQ (una técnica de cuantización propia del autor) durante el proceso. El resultado es un conjunto de ficheros GGUF con menor divergencia KL (KLD) que las cuantizaciones estándar de Bartowski equivalentes, según la evaluación publicada en la model card.

El modelo base Qwen3.5-9B es un transformer multimodal (pipeline `image-text-to-text`) de 9.197.093.888 parámetros, distribuido bajo licencia Apache 2.0. Esta cuantización conserva la licencia Apache 2.0 del original y está pensada para su uso con `BeeLlama.cpp v0.5.0`, el único motor que soporta SINQ según el autor. El repositorio ocupa 162,1 GB en total e incluye múltiples variantes de cuantización (IQ2_S, IQ2_M, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_M, Q3_K_M, Q2_K_L, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, entre otras).

La relevancia de esta publicación es doble: por un lado, ofrece alternativas de cuantización con mejor fidelidad respecto al modelo BF16 de referencia para un modelo de 9B parámetros con capacidades multimodales; por otro, introduce una técnica (SINQ) que, según los datos del autor, mejora la KLD media entre un 2,81 % y un 45,23 % frente a las cuantizaciones estándar de Bartowski, dependiendo de la receta. No obstante, el uso de SINQ requiere un runtime específico, lo que limita su portabilidad frente a GGUF convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-9B, pipeline image-text-to-text; arquitectura interna no detallada en la informacion proporcionada) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (64K) usados en la evaluacion KLD; contexto maximo del modelo base no disponible |
| Tipos de cuantizacion | IQ2_S, IQ2_M, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_M, Q3_K_M, Q2_K_L, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1 (y otras recetas derivadas de Bartowski) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con SINQ aplicado; requiere BeeLlama.cpp v0.5.0) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Qwen3.5-9B en la informacion proporcionada (tipo de transformer, atencion, posibles componentes multimodales, etc.). El pipeline declarado es `image-text-to-text`, lo que indica capacidades de entrada de imagen y salida de texto, pero no se especifican los detalles del codificador visual ni del fusionado multimodal.

En cuanto al proceso de cuantizacion, esta publicacion no entrena el modelo, sino que lo cuantiza. El autor indica que las recetas siguen 1:1 las de Bartowski para Qwen3.5-9B, aplicando SINQ durante la cuantizacion. La evaluacion se realiza sobre el corpus completo de test de Wikitext-2, usando el modelo BF16 Qwen3.5-9B como referencia, con 297.193 objetivos de siguiente token alineados, contexto de 65.536 tokens, cache K/V en BF16, batch 512 y microbatch 256. Se reportan metricas de KLD media, mediana, P90, P95, P99, P99.9, maximo, acuerdo top-1 y perplejidad (PPL). No se detalla en la informacion proporcionada en que consiste exactamente SINQ a nivel tecnico (algoritmo, parametros de anchura y fuerza, etc.), mas alla de los valores de "width" y "strength" que aparecen en la tabla de resultados.

## Capacidades

- Generacion de texto conversacional (tag `conversational`).
- Procesamiento de imagen y texto (`image-text-to-text`), segun el pipeline declarado.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integracion en servicios de inferencia.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking" u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en entornos con recursos limitados: las variantes de cuantizacion desde IQ2_S (3,969 GB) hasta Q4_K_M (6,172 GB) permiten ejecutar un modelo de 9B parámetros multimodales en GPUs de consumo, ajustando el equilibrio entre tamano y fidelidad (KLD) segun el hardware disponible.
- Evaluacion de tecnicas de cuantizacion: investigadores que comparan SINQ frente a cuantizaciones estandar de Bartowski o Unsloth pueden usar este repositorio para reproducir las metricas KLD publicadas sobre Wikitext-2 con contexto de 64K.
- Prototipado de aplicaciones image-text-to-text: al conservar el pipeline multimodal del modelo base, estas cuantizaciones permiten probar flujos de descripcion de imagenes o respuesta a consultas visuales en hardware modesto, siempre que se use BeeLlama.cpp v0.5.0.
- Integracion en pipelines con endpoints compatibles: el tag `endpoints_compatible` sugiere que las cuantizaciones pueden servirse a traves de APIs compatibles, util para entornos de desarrollo que necesitan un modelo conversacional y multimodal autoalojado.
- Investigacion sobre fidelidad de cuantizacion en contexto largo: la evaluacion con 65.536 tokens y cache K/V en BF16 permite estudiar como se degrada la KLD en ventanas de contexto extensas con distintas recetas.
- Seleccion de variante segun presupuesto de VRAM: por ejemplo, IQ4_XS (5,503 GB, KLD media 0,029253) o Q4_K_S (5,859 GB, KLD media 0,025652) para equipos con 8 GB de VRAM, o IQ2_M (4,030 GB, KLD media 0,190647) para entornos mas restrictivos, aceptando mayor degradacion.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a metricas de fidelidad de cuantizacion (KLD, acuerdo top-1 y PPL) sobre Wikitext-2, no a benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Se reproduce una seleccion de la tabla:

| Receta | Tamano (GB) | Width | Strength | KLD media | KLD media stock | Mejora KLD media | Top-1 | PPL |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| IQ2_S | 3,969 | 64 | 0,5 | 0,296414 | 0,304985 | +2,81% | 77,767% | 7,9476 |
| IQ2_M | 4,030 | 128 | 1 | 0,190647 | 0,208352 | +8,50% | 82,289% | 7,3301 |
| Q2_K | 4,325 | 128 | 1 | 0,174333 | 0,181668 | +4,04% | 83,260% | 7,3516 |
| IQ3_XXS | 4,537 | 32 | 1 | 0,105045 | 0,109045 | +3,67% | 87,147% | 7,0444 |
| Q3_K_S | 4,930 | 16 | 1 | 0,090341 | 0,108564 | +16,79% | 88,319% | 6,9250 |
| IQ3_M | 4,983 | 128 | 0,75 | 0,072853 | 0,076942 | +5,31% | 89,838% | 6,9168 |
| Q3_K_M | 5,181 | 16 | 0,75 | 0,066111 | 0,076790 | +13,91% | 90,158% | 6,8574 |
| Q3_K_L | 5,372 | 16 | 0,75 | 0,062988 | 0,074503 | +15,46% | 90,395% | 6,8629 |
| IQ4_XS | 5,503 | 64 | 0,5 | 0,029253 | 0,032306 | +9,45% | 93,778% | 6,7584 |
| IQ4_NL | 5,740 | 16 | 0,5 | 0,029059 | 0,031595 | +8,03% | 93,871% | 6,7463 |
| Q4_0 | 5,744 | 128 | 1 | 0,039437 | 0,072005 | +45,23% | 92,820% | 6,8491 |
| Q4_K_S | 5,859 | 16 | 0,5 | 0,025652 | 0,029209 | +12,18% | 94,313% | 6,7207 |
| Q4_K_M | 6,172 | 32 | 0,5 | 0,022183 | 0,025043 | +11,42% | 94,788% | 6,7553 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la variante. Las recetas van desde 3,969 GB (IQ2_S) hasta 6,172 GB (Q4_K_M) solo en pesos; hay que sumar el espacio para cache K/V, que en la evaluacion se uso en BF16 con contexto de 64K, lo que incrementa notablemente los requisitos.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano de pesos, las variantes de 4-6 GB pueden caber en GPUs de consumo con 8 GB o mas, pero no se confirma en la model card.
- Cabe en consumer GPU: probablemente si para las variantes de menor tamano, pero no se especifica que GPUs concretas estan soportadas ni probadas.
- Opciones de despliegue: el autor indica que SINQ solo es compatible con BeeLlama.cpp v0.5.0. No se menciona soporte en vLLM, llama.cpp estandar, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---:|---|---|---|---|
| Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ | 9,197 M | 64K (evaluado) | Apache 2.0 | GGUF + SINQ / BeeLlama.cpp v0.5.0 | KLD media mejorada frente a stock Bartowski (2,81%-45,23%) |
| bartowski/Qwen_Qwen3.5-9B-GGUF | 9,197 M (base) | no disponible | Apache 2.0 (heredada) | GGUF / llama.cpp y derivados | Receta de referencia sin SINQ; sirve de linea base en la evaluacion |
| Cuantizaciones Unsloth de Qwen3.5-9B | 9,197 M (base) | no disponible | Apache 2.0 (heredada) | GGUF / llama.cpp y derivados | Comparadas en la model card frente a stock Bartowski y SINQ; datos numericos no disponibles en el texto proporcionado |

## Limitaciones y advertencias

- Requiere BeeLlama.cpp v0.5.0 para aprovechar SINQ; no es un GGUF estandar compatible con llama.cpp, Ollama u otros runtimes convencionales sin verificar soporte.
- La evaluacion se limita a KLD, acuerdo top-1 y PPL sobre Wikitext-2; no hay benchmarks de tareas que confirmen el rendimiento en razonamiento, codigo o multimodalidad.
- Las variantes de muy baja precision (IQ2_S, IQ2_M) presentan KLD media alta (0,296414 y 0,190647) y acuerdo top-1 bajo (77,767 % y 82,289 %), lo que puede degradar la calidad en produccion.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni limitaciones idiomaticas del modelo base en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Qwen3.5-9B y las condiciones de BeeLlama.cpp para uso en produccion.
- El repositorio ocupa 162,1 GB, lo que exige espacio de almacenamiento considerable si se descargan todas las variantes.
- No se especifican los idiomas soportados ni el contexto maximo real del modelo base; el valor de 64K corresponde al usado en la evaluacion, no necesariamente al limite del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Recetas de cuantizacion de referencia (Bartowski): https://huggingface.co/bartowski/Qwen_Qwen3.5-9B-GGUF
- Runtime BeeLlama.cpp: https://github.com/Anbeeld/beellama.cpp
- Variante IQ2_S: https://huggingface.co/Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ/blob/main/Qwen3.5-9B-IQ2_S-SINQ-w64-s0.5.gguf
- Variante IQ2_M: https://huggingface.co/Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ/blob/main/Qwen3.5-9B-IQ2_M-SINQ-w128-s1.gguf
- Variante Q2_K: https://huggingface.co/Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ/blob/main/Qwen3.5-9B-Q2_K-SINQ-w128-s1.gguf
- Variante IQ3_XXS: https://huggingface.co/Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ/blob/main/Qwen3.5-9B-IQ3_XXS-SINQ-w32-s1.gguf
- Variante IQ3_XS: https://huggingface.co/Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ/blob/main/Qwen3.5-9B-IQ3_XS-SINQ-w128-s1.gguf
- Variante Q3_K_S: https://huggingface.co/Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ/blob/main/Qwen3.5-9B-Q3_K_S-SINQ-w16-s1.gguf
- Variante IQ3_M: https://huggingface.co/Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ/blob/main/Qwen3.5-9B-IQ3_M-SINQ-w128-s0.75.gguf
- Variante Q3_K_M: https://huggingface.co/Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ/blob/main/Qwen3.5-9B-Q3_K_M-SINQ-w16-s0.75.gguf
- Variante Q2_K_L: https://huggingface.co/Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ/blob/main/Qwen3.5-9B-Q2_K_L-SINQ-w128-s0.5.gguf
- Variante Q3_K_L: https://huggingface.co/Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ/blob/main/Qwen3.5-9B-Q3_K_L-SINQ-w16-s0.75.gguf
- Variante IQ4_XS: https://huggingface.co/Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ/blob/main/Qwen3.5-9B-IQ4_XS-SINQ-w64-s0.5.gguf
- Variante IQ4_NL: https://huggingface.co/Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ/blob/main/Qwen3.5-9B-IQ4_NL-SINQ-w16-s0.5.gguf
- Variante Q4_0: https://huggingface.co/Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ/blob/main/Qwen3.5-9B-Q4_0-SINQ-w128-s1.gguf
- Variante Q4_K_S: https://huggingface.co/Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ/blob/main/Qwen3.5-9B-Q4_K_S-SINQ-w16-s0.5.gguf
- Variante Q4_K_M: https://huggingface.co/Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ/blob/main/Qwen3.5-9B-Q4_K_M-SINQ-w32-s0.5.gguf
