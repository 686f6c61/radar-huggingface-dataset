# mradermacher/Qwen3.8-27B-MindMeld-GGUF

## Resumen

Qwen3.8-27B-MindMeld es un modelo de lenguaje de 27.320.697.856 parámetros (unos 27,3 mil millones) publicado por el usuario nightmedia y cuantizado a GGUF por mradermacher. Se presenta como un derivado de la familia Qwen (las etiquetas mencionan Qwen3.5 y Qwen3.6) afinado mediante SFT y LoRA, con técnicas de destilación de cadenas de pensamiento (long-CoT) y fusión de modelos con mergekit. El resultado es un modelo instruction-tuned orientado a razonamiento, código, matemáticas, multilingüismo y escritura creativa de ficción.

La relevancia de esta ficha concreta reside en que mradermacher distribuye los pesos en formato GGUF con un abanico amplio de cuantizaciones (desde Q2_K de 11 GB hasta Q8_0 de 29,1 GB), lo que permite ejecutar un modelo de 27B en hardware de consumo y en entornos de inferencia local mediante llama.cpp u Ollama. El repositorio incluye además ficheros mmproj, lo que indica soporte multimodal (visión) en el modelo base.

La licencia declarada es Apache 2.0 y los idiomas soportados según la model card son inglés, chino, japonés y español. La model card es escasa en detalles técnicos verificables: no documenta el número de tokens de entrenamiento, la composición del dataset ni resultados de benchmarks, por lo que buena parte de las especificaciones de esta ficha quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen; detalles de capas y atención no disponibles) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | etiquetas mencionan 256k y 1M de contexto; valor efectivo no confirmado |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 (y variantes imatrix i1 en repo aparte) |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); pesos originales del modelo base presumiblemente safetensors/bf16 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas, que apuntan a un transformer de la familia Qwen (qwen3_5, qwen3_6) con atención de contexto largo (se citan 256k y 1M). El modelo base nightmedia/Qwen3.8-27B-MindMeld se describe mediante etiquetas que indican instruction tuning, SFT, LoRA, destilación tipo "claude-distillation" y fusión con mergekit; también aparece la etiqueta "unsloth", lo que sugiere que el afinamiento se realizó con esa herramienta. No se especifica el número de tokens de entrenamiento, la composición del corpus ni si hubo RLHF o DPO.

Las innovaciones declaradas se limitan a las etiquetas: razonamiento con cadena de pensamiento larga (long-cot), soporte multimodal (los ficheros mmproj permiten adjuntar un proyector visual al GGUF) y una orientación explícita a escritura creativa y roleplay. Cualquier detalle sobre decodificación especulativa, atención lineal o mecanismos híbridos no está documentado en la información proporcionada.

## Capacidades

- Generación de texto conversacional e instruction-tuned.
- Razonamiento con cadena de pensamiento larga (long-CoT) según las etiquetas del modelo.
- Generación de código y tareas de programación (etiqueta "coding").
- Matemáticas y STEM.
- Capacidades multilingües en inglés, chino, japonés y español.
- Escritura creativa: ficción, generación de tramas y subtramas, continuación de escenas, storytelling y ciencia ficción.
- Roleplay.
- Soporte multimodal potencial mediante los ficheros mmproj (proyector visual), aunque no se detalla qué modalidades cubre.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente más allá de la etiqueta de razonamiento.

## Casos de uso

- Asistencia a la programación en local: con la cuantización Q4_K_M (16,9 GB) el modelo puede ejecutarse en una GPU de 24 GB y emplearse para autocompletado, explicación de código y generación de tests en flujos de desarrollo sin depender de la nube.
- Escritura creativa y generación de ficción: las etiquetas del modelo lo orientan a tramas, subtramas y continuación de escenas, por lo que encaja en herramientas de asistencia a novelistas y guionistas que necesiten mantener coherencia en textos largos.
- Razonamiento con contexto largo: si se confirma la ventana de 256k o 1M tokens, permite analizar documentos extensos, contratos o bases de código completas en una sola pasada.
- Atención al cliente multilingüe: al cubrir inglés, chino, japonés y español, puede gestionar conversaciones multi-turno en varios idiomas en un despliegue self-hosted con llama.cpp u Ollama.
- Investigación y experimentación: al ser una fusión/destilación con licencia Apache 2.0, sirve como base para estudiar efectos de mergekit, LoRA y destilación de CoT en modelos de 27B.
- Roleplay y prototipado de personajes conversacionales: la etiqueta "roleplaying" y el enfoque en escritura vívida lo hacen adecuado para demos de agentes conversacionales con personalidad.
- Despliegue en hardware de consumo: las cuantizaciones Q2_K (11 GB) y Q3_K_S (12,4 GB) permiten probar el modelo en GPUs de 12-16 GB, útil para evaluación rápida antes de invertir en hardware mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: Q2_K ~11 GB, Q3_K_S ~12,4 GB, Q3_K_M ~13,6 GB, Q3_K_L ~14,7 GB, IQ4_XS ~15,5 GB, Q4_K_S ~15,9 GB, Q4_K_M ~16,9 GB, Q5_K_S ~19,1 GB, Q5_K_M ~19,6 GB, Q6_K ~22,5 GB, Q8_0 ~29,1 GB. Añadir ~0,7-1,0 GB si se usa el proyector multimodal mmproj.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y hasta Q6_K; A100 40/80 GB o H100 para Q8_0 y para contexto muy largo; GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) solo para cuantizaciones Q2_K-Q3_K.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con Q4_K_M o Q5_K_M; en GPUs de 12 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF; los pesos originales del modelo base pueden servirse con vLLM o TGI si se dispone de los safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-MindMeld (esta ficha) | 27,3 B | 256k/1M según etiquetas (no confirmado) | Apache 2.0 | GGUF | Fusión/destilación orientada a razonamiento y ficción |
| Qwen2.5-32B-Instruct | 32,5 B | 128k | Apache 2.0 | safetensors, GGUF | Referencia de la familia Qwen; datos de benchmarks públicos |
| Gemma 2 27B | 27 B | 8k | Gemma license | safetensors, GGUF | Tamaño comparable, contexto mucho menor |
| Mistral Small 24B | 24 B | 128k | Apache 2.0 | safetensors, GGUF | Alternativa europea de tamaño similar |

La comparación se limita a parámetros, contexto y licencia porque no hay benchmarks publicados para el modelo de esta ficha; los datos de los modelos alternativos son los habitualmente publicados por sus autores y no se han verificado en esta ficha.

## Limitaciones y advertencias

- No hay benchmarks publicados, por lo que el rendimiento real frente a modelos de tamaño similar es desconocido.
- La model card es muy escasa: no documenta dataset, número de tokens, metodología de destilación ni evaluación de sesgos.
- Riesgo de alucinación inherente a los modelos de 27B sin verificación factual documentada; especialmente relevante en usos de producción.
- El contexto de 256k/1M aparece solo en etiquetas; no se confirma en la documentación y podría degradarse en la práctica.
- El soporte multilingüe declarado (en, zh, ja, es) no está cuantificado; la calidad en español no está evaluada.
- Al ser una fusión/destilación con etiquetas que mencionan "claude-distillation", conviene revisar las condiciones de uso de los datos de destilación antes de un despliegue comercial, aunque la licencia declarada sea Apache 2.0.
- El repositorio pesa 190,8 GB por incluir todas las cuantizaciones; la descarga debe hacerse seleccionando el fichero concreto.
- Para usar la parte multimodal hay que descargar además el fichero mmproj correspondiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-MindMeld-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.8-27B-MindMeld
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Qwen3.8-27B-MindMeld-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-MindMeld-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
