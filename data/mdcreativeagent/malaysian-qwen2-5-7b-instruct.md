# mdcreativeagent/Malaysian-Qwen2.5-7B-Instruct

## Resumen

Malaysian-Qwen2.5-7B-Instruct es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct de Alibaba, desarrollado por el usuario mdcreativeagent y basado en el trabajo previo de Mesolitica sobre el dataset Malaysian-SFT. El modelo parte de la arquitectura transformer densa de Qwen2.5 con 7.615.616.512 parámetros y extiende las capacidades del modelo original hacia el contexto malasio: malayo (ms), inglés (en), chino mandarín (zh) y tamil (ta), además de variantes dialectales como Jawi, Manglish y los dialectos de Johor, Kedah, Kelantan, Pahang, Perak, Sabah, Sarawak, Selangor, Negeri Sembilan y Terengganu.

El problema que resuelve es la falta de cobertura del malayo y del contexto cultural, legal, político y religioso malasio en los modelos generalistas. El ajuste se realizó sobre 1.500 millones de tokens de un dataset de instrucciones malasio altamente curado, lo que permite al modelo mantener conversaciones multi-turno sobre legislación, política, religiones e idiomas de Malasia, y generar código en los idiomas y dialectos mencionados.

Es relevante ahora porque demuestra una estrategia de adaptación lingüística de bajo coste (LoRA sobre proyecciones y embeddings) sobre un modelo base ya competente, con resultados medibles en el benchmark MalayMMLU. El repositorio ocupa 15,2 GB y se distribuye en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), fine-tuning LoRA sobre Qwen2.5-7B-Instruct |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (longitud usada en el entrenamiento con multipacking) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | ms, en, zh, ta; además Jawi, Manglish y dialectos de Johor, Kedah, Kelantan, Pahang, Perak, Sabah, Sarawak, Selangor, Negeri Sembilan y Terengganu |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen2, con 7.615.616.512 parámetros, obtenido mediante fine-tuning del checkpoint Qwen2.5-7B-Instruct. El ajuste se aplicó con LoRA sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, además de `embed_tokens` y `lm_head`. Se publicaron dos revisiones: una con rango 128 y alpha 256 (commit `83a0e145c726385502898ab7e016982eae1b684d`) y otra con rango 256 y alpha 512 (commit `5679143eadc2e7deb3bc61ec69ff301b2ba6a4e1`).

El entrenamiento usó el dataset mesolitica/Malaysian-SFT, con 1.500 millones de tokens de instrucciones malasias curadas. La técnica de entrenamiento incluye multipacking con longitud de contexto de 8192 tokens y enmascaramiento causal SDPA correcto para evitar contaminación entre documentos y garantizar position ids adecuados, además de chunk CCE loss para LoRA. El entrenamiento se ejecutó en un nodo de 8 GPU H100 proporcionado por Nvidia y SNS. Los registros de entrenamiento están disponibles en Weights & Biases para ambas revisiones.

## Capacidades

- Generación de texto y razonamiento en malayo, inglés, chino mandarín y tamil.
- Respuesta en Jawi, Manglish y en los dialectos de Johor, Kedah, Kelantan, Pahang, Perak, Sabah, Sarawak, Selangor, Negeri Sembilan y Terengganu.
- Generación de código en los idiomas y dialectos anteriores.
- Conversación multi-turno con contexto malasio: legislación, política, religiones e idiomas de Malasia.
- Herencia de las capacidades del modelo base Qwen2.5-7B-Instruct (razonamiento, matemáticas, código e instrucciones generales), aunque la model card no las detalla explícitamente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente en Malasia: el modelo puede gestionar conversaciones multi-turno en malayo, inglés, mandarín y tamil, y responder en el dialecto regional del usuario (por ejemplo, Kelantan o Sabah), lo que mejora la naturalidad en centros de contacto locales.
- Asistencia legal y administrativa: con contexto de 8192 tokens, puede resumir o responder preguntas sobre legislación malasia y documentos administrativos largos, manteniendo coherencia multi-turno sobre el mismo expediente.
- Generación de código localizada: permite producir código y comentarios en malayo, Jawi o tamil, útil para equipos de desarrollo que documentan en su lengua materna o para formación técnica regional.
- Contenido editorial y traducción: redacción y adaptación de textos entre malayo estándar, Manglish y dialectos, con salida en Jawi cuando se requiera escritura árabe-malaya.
- Educación y tutoría: explicación de conceptos de STEM, humanidades y ciencias sociales en los idiomas y dialectos cubiertos, con capacidad de mantener el hilo de una sesión de estudio prolongada.
- Análisis de opinión y moderación de contenido: clasificación y respuesta a textos en dialectos malasios que los modelos generalistas suelen tratar como malayo estándar, mejorando la cobertura en foros y redes sociales.
- Asistentes conversacionales con contexto religioso y cultural: respuestas matizadas sobre religiones e idiomas de Malasia, con la cautela de que el modelo puede alucinar y requiere revisión humana en dominios sensibles.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre MalayMMLU (0-shot, precisión del primer token, `by_letter`). Se comparan la revisión rango 128 y el modelo base Qwen2.5-7B-Instruct.

| Categoria | Malaysian-Qwen2.5-7B-Instruct (r128) | Qwen2.5-7B-Instruct |
|---|---|---|
| STEM | 72,04 | 70,61 |
| Language | 70,69 | 68,03 |
| Social science | 66,54 | 63,49 |
| Others | 67,31 | 64,16 |
| Humanities | 71,81 | 69,10 |
| Media (average) | 69,26 | 66,52 |

Resultados con vLLM Guided Decoding (0-shot, exact first token match):

| Categoria | Malaysian-Qwen2.5-7B-Instruct (r128) | Qwen2.5-7B-Instruct |
|---|---|---|
| STEM | 70,16 | 70,98 |
| Language | 66,68 | 68,18 |
| Social science | 62,89 | 64,24 |
| Others | 64,38 | 64,64 |
| Humanities | 66,78 | 70,44 |
| Media (average) | 65,57 | 67,14 |

La model card no incluye resultados para la revisión de rango 256 (el bloque de resultados aparece vacío). No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contexto corto y más para 8192 tokens.
- Cuantización: no se documentan tipos de cuantización en la información proporcionada; sería necesario generar versiones GGUF/AWQ/GPTQ a partir de los safetensors.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para despliegue de producción; RTX 4090 (24 GB) para FP16 con contexto moderado o cuantizado.
- GPU de consumo: cabe en RTX 4090 con cuantización de 8 bits o inferior; en GPUs de 16 GB requeriría cuantización de 4 bits (no verificada en la información disponible).
- Opciones de despliegue: vLLM (usado por el autor para los benchmarks con Guided Decoding), transformers con safetensors; llama.cpp/Ollama/TGI requerirían conversión previa a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MalayMMLU (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Malaysian-Qwen2.5-7B-Instruct | 7,62 B | 8192 | 69,26 (primer token) / 65,57 (vLLM) | no disponible | Hugging Face |
| Qwen2.5-7B-Instruct | 7,62 B | 32 768 (modelo base original) | 66,52 (primer token) / 67,14 (vLLM) | Apache 2.0 (modelo base) | Hugging Face |
| Malaysian-Qwen2.5-7B-Instruct (r256) | 7,62 B | 8192 | no disponible | no disponible | Hugging Face |
| Otros modelos malayos de 7B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base porque la información proporcionada no incluye otros modelos malayos comparables. Nótese que el ajuste mejora la precisión por primer token pero empeora ligeramente en la evaluación con vLLM Guided Decoding respecto al base.

## Limitaciones y advertencias

- Licencia no declarada en la información disponible: no se puede confirmar el uso comercial; debe verificarse antes de desplegar en producción.
- El modelo base Qwen2.5-7B-Instruct tiene licencia Apache 2.0, pero el ajuste no hereda automáticamente esa licencia sin confirmación del autor.
- Riesgo de alucinación en dominios sensibles (legislación, política, religión) y en dialectos con pocos datos de entrenamiento.
- Los benchmarks publicados son solo MalayMMLU y solo para la revisión rango 128; la revisión rango 256 no tiene resultados publicados.
- La evaluación con vLLM Guided Decoding muestra un rendimiento inferior al modelo base en cuatro de cinco categorías, lo que sugiere que la mejora depende del método de evaluación.
- Contexto de 8192 tokens, inferior a los 32 768 del Qwen2.5-7B-Instruct original, lo que limita tareas de contexto largo.
- Cobertura dialectal declarada por el autor sin benchmarks independientes que la validen.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación comunitaria.
- El autor del repositorio (mdcreativeagent) difiere del autor original del modelo (Mesolitica); conviene verificar la procedencia y los pesos antes de usarlo.
- No se documentan sesgos específicos ni evaluaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/mdcreativeagent/Malaysian-Qwen2.5-7B-Instruct
- Modelo original de referencia: https://huggingface.co/mesolitica/Malaysian-Qwen2.5-7B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/mesolitica/Malaysian-SFT
- Revisión rango 128: https://huggingface.co/mesolitica/Malaysian-Qwen2.5-7B-Instruct/commit/83a0e145c726385502898ab7e016982eae1b684d
- Revisión rango 256: https://huggingface.co/mesolitica/Malaysian-Qwen2.5-7B-Instruct/commit/5679143eadc2e7deb3bc61ec69ff301b2ba6a4e1
- WandB rango 128: https://wandb.ai/huseinzol05/lora-embedding-128-qwen2.5-7b-malaysian-8k
- WandB rango 256: https://wandb.ai/huseinzol05/lora-embedding-256-qwen2.5-7b-malaysian-8k
- Código de entrenamiento: https://github.com/mesolitica/malaya/tree/master/session/qwen2.5
