# prithivMLmods/JEV-9B-GGUF

## Resumen

JEV-9B-GGUF es la versión cuantizada en formato GGUF del modelo autotrust/JEV-9B, publicada por el usuario prithivMLmods. Se trata de un modelo de aproximadamente 8.953.803.264 parámetros (unos 8,95 mil millones) cuyo pipeline declarado en HuggingFace es text-classification, aunque las etiquetas del repositorio también incluyen text-generation, lo que apunta a un modelo con doble cabeza de salida (dual-head): una para generar texto y otra para emitir decisiones o puntuaciones.

El interés principal de esta publicación es de tipo práctico: el autor ha generado ocho variantes de cuantización (desde BF16 completa de 17,9 GB hasta Q3_K_M de 4,62 GB) que permiten ejecutar el modelo en llama.cpp, Ollama o servidores compatibles con GGUF sin necesidad de GPUs de gama alta. El repositorio ocupa 58,6 GB en total precisamente por acumular todas esas variantes.

La información pública disponible sobre el modelo es muy limitada. La model card se reduce a una tabla de ficheros y a un enlace a llama.cpp, sin detallar arquitectura interna, datos de entrenamiento, longitud de contexto ni resultados de evaluación. Las etiquetas sí sugieren una base Qwen 3.5 (qwen3_5_text, qwen3_5), un diseño de "blocks-of-experts", un modo dual system-one/system-two, salidas tipadas de decisión, probabilidades calibradas y destilación de conocimiento, pero ninguno de estos extremos está documentado con cifras en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas del repositorio apuntan a qwen3_5_text con dual-head y blocks-of-experts) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (las etiquetas mencionan blocks-of-experts, pero no se especifica el numero de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base autotrust/JEV-9B esta en safetensors) |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura en la model card del repositorio. Las etiquetas asociadas al modelo permiten inferir, sin confirmacion documental, que se trata de un transformer de la familia Qwen 3.5 con dos cabezas de salida (dual-head): una orientada a generacion de texto y otra a la emision de decisiones tipadas con probabilidades calibradas. Tambien aparecen etiquetas relativas a "blocks-of-experts" y a un esquema dual system-one / system-two, habitual en propuestas que separan un modo de respuesta rapida de un modo de razonamiento mas deliberado.

Respecto al entrenamiento, la unica pista disponible es la etiqueta knowledge-distillation, que sugiere que el modelo se ha entrenado total o parcialmente destilando el comportamiento de un modelo mayor. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otros ajustes por preferencias. Tampoco se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, etc.) mas alla de lo que sugieren las etiquetas.

## Capacidades

La model card no enumera capacidades de forma explicita. A partir de las etiquetas del repositorio y del pipeline declarado se puede indicar lo siguiente, siempre con caracter orientativo:

- Clasificacion de texto y emision de puntuaciones: el pipeline declarado es text-classification y las etiquetas incluyen choice y score, lo que apunta a salidas de tipo decision o puntuacion.
- Probabilidades calibradas: la etiqueta calibrated-probabilities sugiere que las puntuaciones emitidas estan pensadas para ser interpretables como probabilidades, util en tareas de umbralizacion.
- Generacion de texto: la etiqueta text-generation y el pipeline text-generation-inference indican que el modelo tambien puede usarse de forma generativa y conversacional (etiqueta conversational).
- Doble cabeza (dual-head): una salida para generacion y otra para decision, segun las etiquetas.
- Modo dual system-one / system-two: posible separacion entre respuestas rapidas y respuestas deliberadas. No hay documentacion sobre como se activa cada modo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo language del repositorio.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.

## Casos de uso

Dado que la model card no documenta la interfaz de uso, los siguientes escenarios se plantean como aplicaciones plausibles a partir del pipeline declarado (text-classification) y de las etiquetas choice y score. Deben validarse experimentalmente antes de llevarlos a produccion.

- Reranking en pipelines RAG: el modelo puede puntuar pares consulta-documento y reordenar los resultados recuperados por un buscador vectorial. La salida de tipo score encaja con esta funcion, y la cuantizacion Q4_K_M (5,63 GB) permite ejecutarlo en la misma maquina que el resto del pipeline.
- Enrutado de consultas (query routing): en un sistema con varios modelos especializados, JEV-9B puede decidir a que modelo o herramienta derivar cada peticion, usando su cabeza de clasificacion con probabilidades calibradas para fijar umbrales de confianza.
- Moderacion de contenido y guardrails: clasificacion binaria o multiclase de textos entrantes para decidir si se bloquean o se escalan a revision humana, aprovechando la salida de probabilidad calibrada.
- Filtrado de datos sinteticos: puntuacion automatica de grandes volumenes de texto generado para descartar muestras de baja calidad antes de usarlas en ajuste fino, ejecutandose en local con llama.cpp.
- Analisis de sentimiento y clasificacion de tickets: etiquetado de soporte al cliente por categoria o urgencia, con despliegue en CPU o GPU modesta gracias a las variantes Q4 y Q5.
- Evaluacion automatica de respuestas: uso del modo de decision para comparar dos respuestas candidatas (choice) y asignar una puntuacion, por ejemplo en pruebas A/B de asistentes conversacionales.
- Inferencia local en estaciones de trabajo sin GPU dedicada: las variantes Q3_K_M (4,62 GB) y Q4_K_S (5,35 GB) permiten ejecutar el modelo en portatiles con 16 GB de RAM mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el modelo base autotrust/JEV-9B ni para las variantes cuantizadas.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones derivadas del tamano de fichero declarado en la model card; no incluyen la memoria adicional necesaria para la cache KV, que depende de la longitud de contexto (no disponible) y del numero de secuencias concurrentes.

- BF16: 17,9 GB de pesos. Requiere al menos 24 GB de VRAM en GPU (RTX 3090, RTX 4090, A5000) para dejar margen a la cache KV; en su defecto, se puede repartir entre GPU y RAM del sistema.
- Q6_K: 7,36 GB. Cabe en GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) con contexto moderado.
- Q5_K_M / Q5_K_S: 6,47 GB y 6,31 GB. Aptas para GPUs de 8-12 GB.
- Q4_K_M / Q4_K_S: 5,63 GB y 5,35 GB. Las variantes recomendadas por el autor; funcionan en GPUs de 8 GB y en equipos con 8-16 GB de RAM usando solo CPU.
- Q3_K_L / Q3_K_M: 4,93 GB y 4,62 GB. Pensadas para entornos con poca RAM; el propio autor las etiqueta como de calidad reducida.
- GPU recomendadas: no hay recomendaciones publicadas por el autor. Para el modelo completo en BF16, se necesitan GPUs de 24 GB o superiores (RTX 3090/4090, A5000, L40S, A100, H100). Para variantes Q4 y Q5, basta una GPU de consumo de 8-12 GB.
- Despliegue: llama.cpp es el runtime de referencia indicado en la model card. Por las etiquetas del repositorio, tambien se declara compatibilidad con text-generation-inference, vLLM y endpoints compatibles, ademas del ecosistema Ollama habitual para ficheros GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

La model card no proporciona datos de rendimiento, contexto ni parametros activos de JEV-9B, por lo que la comparacion se limita a los datos estructurales del repositorio y a las caracteristicas publicas de modelos abiertos de tamano equivalente. Los datos de los modelos comparados provienen de sus respectivas model cards publicas.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| JEV-9B (este modelo) | 8,95 B | no disponible | Apache-2.0 | GGUF (base en safetensors) | no disponible |
| Qwen3-8B | 8,2 B | 32.768 tokens nativos (ampliable con YaRN) | Apache-2.0 | safetensors, GGUF | publicado en su model card |
| Llama 3.1 8B | 8,03 B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | publicado en su model card |
| Mistral 7B v0.3 | 7,25 B | 32.000 tokens | Apache-2.0 | safetensors, GGUF | publicado en su model card |

La diferencia funcional relevante es que JEV-9B parece orientado a clasificacion y decision (pipeline text-classification, etiquetas choice y score) con una segunda cabeza de generacion, mientras que los tres modelos de la tabla son exclusivamente generativos. No se dispone de datos para comparar calidad de decision, calibracion de probabilidades ni rendimiento generativo.

## Limitaciones y advertencias

- Informacion documental minima: la model card no describe la arquitectura, los datos de entrenamiento, la interfaz de uso ni el formato exacto de las salidas. Cualquier integracion exige una fase de validacion previa.
- Modelo derivado y cuantizado: se trata de una conversion GGUF de autotrust/JEV-9B realizada por un tercero (prithivMLmods), no por el autor original. Las cuantizaciones Q3 y Q4 pueden degradar la calibracion de las probabilidades, algo critico si se usan umbrales de decision.
- Riesgo de alucinacion: no cuantificado. No hay evaluaciones publicadas de fidelidad, veracidad ni tasa de error.
- Sesgos: no documentados. No se ha publicado informacion sobre composicion del dataset ni sobre analisis de sesgo.
- Idioma: el campo language del repositorio declara unicamente ingles. El rendimiento en castellano no esta garantizado ni evaluado.
- Longitud de contexto desconocida: no se puede planificar el uso en conversaciones largas ni en tareas de recuperacion con documentos extensos sin medir el limite real.
- Licencia: Apache-2.0, permisiva y apta para uso comercial, siempre que se mantengan los avisos de copyright y se revise si el modelo base impone condiciones adicionales. No se ha verificado en la informacion disponible si autotrust/JEV-9B tiene terminos propios que prevalezcan.
- Adopcion practicamente nula: 0 descargas y 2 "me gusta" en el momento de la consulta. No hay comunidad, issues ni casos de uso verificados.
- Fecha de publicacion atipica (2026) y ausencia de paper o informe tecnico asociado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/JEV-9B-GGUF
- Modelo base: https://huggingface.co/autotrust/JEV-9B
- Fichero BF16: https://huggingface.co/prithivMLmods/JEV-9B-GGUF/blob/main/JEV-9B.BF16.gguf
- Fichero Q3_K_L: https://huggingface.co/prithivMLmods/JEV-9B-GGUF/blob/main/JEV-9B.Q3_K_L.gguf
- Fichero Q3_K_M: https://huggingface.co/prithivMLmods/JEV-9B-GGUF/blob/main/JEV-9B.Q3_K_M.gguf
- Fichero Q4_K_M: https://huggingface.co/prithivMLmods/JEV-9B-GGUF/blob/main/JEV-9B.Q4_K_M.gguf
- Fichero Q4_K_S: https://huggingface.co/prithivMLmods/JEV-9B-GGUF/blob/main/JEV-9B.Q4_K_S.gguf
- Fichero Q5_K_M: https://huggingface.co/prithivMLmods/JEV-9B-GGUF/blob/main/JEV-9B.Q5_K_M.gguf
- Fichero Q5_K_S: https://huggingface.co/prithivMLmods/JEV-9B-GGUF/blob/main/JEV-9B.Q5_K_S.gguf
- Fichero Q6_K: https://huggingface.co/prithivMLmods/JEV-9B-GGUF/blob/main/JEV-9B.Q6_K.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
