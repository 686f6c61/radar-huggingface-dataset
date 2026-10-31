# mhseo2/sft_olmo3base7b_olmo31think_ot3_p12544x1-step735

## Resumen

Este modelo es un ajuste fino supervisado (SFT) de Olmo-3-1025-7B, especializado en razonamiento matemático. Fue entrenado por el usuario mhseo2 a partir del modelo base `mhseo2/Olmo-3-1025-7B-opd`, utilizando trazas de razonamiento generadas por `allenai/Olmo-3.1-32B-Think` sobre prompts de matemáticas de OpenThoughts3. El checkpoint corresponde al paso 735, que coincide con la época 15 de 15 del entrenamiento.

El problema que aborda es la destilación de capacidades de razonamiento matemático de un modelo profesor de 32B (Olmo-3.1-32B-Think) a un modelo estudiante de 7B, reduciendo significativamente los requisitos de hardware para inferencia manteniendo un rendimiento razonable en benchmarks de competición matemática como AIME y HMMT. Con 7.298 millones de parámetros y licencia Apache 2.0, es relevante para equipos que necesitan un modelo de razonamiento matemático compacto, abierto y desplegable en una única GPU de gama alta.

El entrenamiento se realizó en el supercomputador MareNostrum 5 del Barcelona Supercomputing Center (BSC), con 8 GPUs H100 repartidas en dos nodos, usando FSDP y sequence parallelism Ulysses. El modelo genera respuestas con razonamiento explícito delimitado por etiquetas `</think>`, siguiendo el formato del modelo profesor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia OLMo 3), no disponible detalle adicional |
| Parametros totales | 7.298.011.136 (~7,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (limites usados en entrenamiento y evaluacion) |
| Tipos de cuantizacion | no disponible (solo pesos en bf16/fp16 en el repo) |
| Idiomas soportados | no disponible (entrenado con datos en ingles de OpenThoughts3) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards, 14,6 GB en total) |

## Arquitectura y entrenamiento

El modelo parte de Olmo-3-1025-7B, un transformer decoder de la familia OLMo de Allen AI, y aplica un SFT (supervised fine-tuning) estandar. No es un modelo MoE: los 7,3B de parametros estan completamente activos en cada pasada. La ventana de contexto efectiva durante entrenamiento y evaluacion alcanza los 32.768 tokens, suficiente para cadenas de razonamiento largas.

Los datos de entrenamiento corresponden al arm `p12544x1`: 12.544 prompts matematicos de OpenThoughts3, cada uno con una unica traza de razonamiento generada por `allenai/Olmo-3.1-32B-Think`, lo que totaliza 12.544 muestras (~225M tokens). Se aplico un filtro de calidad estricto: solo se conservaron trayectorias que finalizan, cierran la etiqueta `</think>` exactamente una vez y presentan la respuesta final en formato `\boxed{}` dentro de los 32.768 tokens. Ademas, los datos fueron descontaminados mediante n-gramas de 10 tokens contra AIME 2025/2026 y HMMT Feb 2025, los mismos benchmarks usados en la evaluacion.

Los hiperparametros de entrenamiento fueron: batch efectivo de 256, learning rate 8e-5 con schedule coseno hasta 4e-5, 3% de warmup, weight decay 0,01 y 49 pasos por epoca (15 epocas, 735 pasos en total). El entrenamiento se ejecuto en MareNostrum 5 (BSC) sobre 2 nodos con 4 GPUs H100 cada uno (8 H100 en total), usando FSDP para el paralelismo de datos y Ulysses sequence parallelism con grado 2 para manejar secuencias largas.

## Capacidades

- Razonamiento matematico paso a paso: el modelo genera cadenas de pensamiento explicitas (formato `<think>...</think>`) antes de emitir la respuesta final en formato `\boxed{}`, herencia directa del profesor Olmo-3.1-32B-Think.
- Resolucion de problemas de nivel olimpiada: entrenado y evaluado en problemas tipo AIME y HMMT, de dificultad de competicion matematica de secundaria/preuniversitaria.
- Generacion de texto general: al partir de un modelo base OLMo 3, conserva capacidades linguisticas generales, aunque el SFT esta centrado en matematicas.
- Salida estructurada verificable: el formato de respuesta en caja permite verificacion automatica con herramientas como `math_verify`.
- No hay informacion sobre soporte de tool calling, function calling, agentes, capacidades de vision o audio en la informacion disponible.

## Casos de uso

- Resolucion automatizada de problemas matematicos de competicion: dado un enunciado tipo AIME o HMMT, el modelo genera razonamiento extenso y una respuesta final verificable con `math_verify`, util para pipelines de evaluacion automatica.
- Investigacion en destilacion de razonamiento: al ser un checkpoint documentado con hiperparametros, datos y protocolo de evaluacion completos, sirve como baseline reproducible para experimentos de SFT sobre trazas de razonamiento.
- Generacion de datos sinteticos matematicos: puede usarse como generador de soluciones paso a paso (con muestreo a temperatura 0,6 y top_p 0,95) para construir datasets de razonamiento.
- Tutoria matematica con razonamiento visible: el formato de cadena de pensamiento permite mostrar al usuario el proceso de resolucion, util en aplicaciones educativas de nivel preuniversitario.
- Despliegue en una sola GPU: con 7,3B de parametros cabe en una RTX 4090 (cuantizado) o en una H100/A100 en fp16, lo que lo hace adecuado para servicios de resolucion matematica de bajo coste.
- Benchmarking de hardware y serving: su tamano moderado y su licencia Apache 2.0 lo hacen util como carga de trabajo de referencia para probar stacks de inferencia (vLLM, llama.cpp) con secuencias largas de 32K tokens.

## Benchmarks y rendimiento

Resultados publicados en la model card, obtenidos como media de 8 muestras (mean@8), temperatura 0,6, top_p 0,95, prompt de 768 tokens y respuesta de hasta 32.768 tokens, con el scorer `math_verify`, ejecutados en una NVIDIA B200 en float16:

| Benchmark | mean@8 (%) |
|---|---|
| AIME 2025 | 43,75 |
| AIME 2026 | 47,92 |
| HMMT Feb 2025 | 27,08 |

No se han publicado comparaciones directas con otros modelos en la informacion disponible. Como referencia contextual, un 43,75 % de media en AIME 2025 con 8 muestras es un resultado notable para un modelo de 7B especializado, aunque la falta de baselines en la ficha impide una comparacion rigurosa.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 14,6 GB en fp16/bf16 para los pesos, mas KV cache; con contexto de 32K tokens y batch 1, se recomiendan al menos 24 GB de VRAM. Con cuantizacion a 4 bits (no publicada oficialmente en el repo) cabria en torno a 5-6 GB de pesos.
- GPU recomendadas: NVIDIA H100 o A100 de 80 GB para inferencia comoda con secuencias largas; RTX 4090 (24 GB) viable con batch 1 y gestion del KV cache; RTX 3090 posible con cuantizacion o contexto reducido.
- Consumer GPU: cabe en una RTX 4090 en fp16 con contexto limitado, y holgadamente en formato cuantizado; para las secuencias de razonamiento de hasta 32K tokens, las GPU de 24 GB quedan justas.
- Entrenamiento (referencia del autor): 8x H100 con FSDP y Ulysses SP 2.
- Opciones de despliegue: al ser un modelo OLMo en safetensors con chat template incluido, es compatible con vLLM, TGI y transformers de Hugging Face; la compatibilidad con llama.cpp/Ollama depende de la disponibilidad de conversiones GGUF, que no constan en el repo.
- Latencia y throughput: no disponibles. Dado que genera cadenas de razonamiento de hasta 32K tokens, los tiempos de respuesta por consulta pueden ser largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| sft_olmo3base7b_olmo31think_ot3_p12544x1-step735 | 7,3B | 32.768 tokens | Apache 2.0 | SFT matematico sobre trazas de Olmo-3.1-32B-Think; AIME 2025 43,75 % (mean@8) |
| Olmo-3.1-32B-Think (profesor) | 32B | no disponible | no disponible | Modelo profesor que genera las trazas; rendimiento muy superior esperable pero requiere hardware mayor |
| Olmo-3-1025-7B (base) | ~7B | no disponible | Apache 2.0 | Modelo base sin especializar en razonamiento matematico |

No hay datos de rendimiento comparativos publicados para estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Especializacion extrema: el SFT se centro exclusivamente en problemas matematicos de OpenThoughts3, por lo que el rendimiento en tareas generales, codigo o conversacion puede haberse degradado respecto al modelo base (catastrophic forgetting no evaluado).
- Idioma: los datos de entrenamiento proceden de OpenThoughts3 en ingles; no hay informacion sobre rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede producir razonamientos plausibles pero incorrectos; el formato `\boxed{}` no garantiza correccion. Los resultados mean@8 indican que una parte sustancial de las respuestas es erronea.
- Contexto: las trazas de razonamiento pueden llegar a 32.768 tokens; problemas muy complejos pueden agotar la ventana sin llegar a una respuesta.
- Contaminacion: aunque se aplico descontaminacion de 10-gramas contra AIME 2025/2026 y HMMT Feb 2025, no puede descartarse contaminacion residual contra otros benchmarks.
- Licencia: Apache 2.0 permite uso comercial sin restricciones destacables, aunque conviene revisar la licencia del modelo base y del dataset OpenThoughts3 para cadenas de uso completas.
- Procedencia: se trata de un checkpoint de investigacion de un usuario individual (38 descargas en el momento de la ficha), sin auditoria ni soporte institucional; no se recomienda para produccion critica sin validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhseo2/sft_olmo3base7b_olmo31think_ot3_p12544x1-step735
- Modelo base: https://huggingface.co/mhseo2/Olmo-3-1025-7B-opd
- Modelo profesor (trazas de razonamiento): https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Dataset de prompts: https://huggingface.co/datasets/allenai/Olmo-3.1-32B-Think (referenciado implicitamente en la model card; no disponible URL exacta del dataset de prompts OpenThoughts3)
- Scorer de evaluacion: https://github.com/hendrycks/math (math_verify; no disponible URL exacta en la informacion proporcionada)
