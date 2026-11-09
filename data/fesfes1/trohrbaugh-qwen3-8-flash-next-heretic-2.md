# fesfes1/trohrbaugh-Qwen3.8-Flash-Next-heretic-2

## Resumen

Qwen3.8-Flash-Next es un modelo experimental de pesos abiertos desarrollado por el equipo Qwen (Alibaba), concebido como la primera muestra pública de la arquitectura que sustentará la futura familia Qwen4. Se trata de un modelo multimodal de tipo *causal language model* con codificador de visión, disenado para cargas de trabajo agénticas y de contexto largo, con una ventana nativa de 262.144 tokens extensible hasta 1.000.000. Su relevancia radica en que introduce innovaciones arquitectónicas concretas —atención híbrida con Qwen Sparse Attention (QSA), Gated Residual y embeddings de n-gramas— orientadas a reducir latencia en contextos largos sin sacrificar calidad.

La variante aquí descrita, `fesfes1/trohrbaugh-Qwen3.8-Flash-Next-heretic-2`, es una versión "decensored" o *abliterated* del modelo original, producida por el usuario fesfes1 mediante un fork personalizado de la herramienta Heretic v1.3.0. El proceso de abliteración elimina la dirección de rechazo en las capas de atención y MLP, de modo que el modelo deja de negarse a responder a peticiones que el original rechazaría. Según la model card, las negativas caen de 99/100 en el original a 0/100 en esta variante, con una divergencia KL de 0,0818 respecto al modelo base.

El modelo combina un *backbone* de 125B parámetros con 6B activados (MoE con 512 expertos), más 51B de embeddings de n-gramas y 4B de MTP, sumando 177.392.830.576 parámetros totales según los safetensors. El repositorio ocupa 360 GB, lo que refleja pesos en precisión alta. La licencia es `qwen-community-1.0`, con implicaciones importantes para uso comercial que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido (Gated DeltaNet + Qwen Sparse Attention) con MoE, Gated Residual, embeddings de n-gramas y MTP; codificador de visión |
| Parametros totales | 177.392.830.576 (125B LM + 51B n-gram embeddings + 4B MTP) |
| Parametros activos | 6B (10 expertos enrutados + 1 compartido de 512) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en la model card) |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

El modelo emplea un diseño híbrido de 48 capas con un *layout* de 12 bloques de la forma `3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)`. La atención lineal Gated DeltaNet usa 48 cabezas para V y 16 para QK con dimensión de cabeza 128; la Qwen Sparse Attention usa 24 cabezas para Q y 2 para KV con dimensión 256, RoPE de 64 dimensiones y un *indexer* MQA (4 cabezas de query, 1 de key compartida, dimensión 128) con un presupuesto de 512 bloques o 2048 tokens. La QSA opera a nivel de micro-bloque en lugar de seleccionar tokens individuales, lo que reduce la latencia en contextos largos. El MoE tiene 512 expertos con dimensión intermedia 640, activando 10 enrutados más 1 compartido.

Las innovaciones destacadas incluyen Gated Residual (4 ramas, rango de cuello de botella 320) con puertas de lectura dependientes de datos y escritura escalar por rama; embeddings de n-gramas (20.000.000 de bigramas/trigramas en la capa 2) como eje de escalado de parámetros más eficiente en memoria que el MoE; y una receta de entrenamiento que aplica Muon y AdamW a categorías de pesos específicas, elimina el *warmup* de batch-size y arranca directamente en el tamaño objetivo. Dispone de una capa MTP entrenada con múltiples pasos. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multimodal: pipeline `image-text-to-text`, con codificador de visión integrado.
- Procesamiento de contexto largo: ventana nativa de 262.144 tokens, extensible a 1.000.000.
- Razonamiento agéntico y multi-paso: la arquitectura está explícitamente optimizada para cargas agénticas según el autor.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no confirmado explícitamente en la información disponible.
- Modo *thinking*: no disponible.
- Variante *abliterated*: responde sin rechazos a peticiones que el modelo base declinaría (0/100 negativas frente a 99/100).
- Compatibilidad de despliegue: Transformers, vLLM, SGLang, TokenSpeed.

## Casos de uso

- Investigación sobre alineación y seguridad: la variante abliterated permite estudiar el comportamiento del modelo sin la capa de rechazo, comparando respuestas con el original y midiendo divergencia KL (0,0818) para analizar qué capacidades se ven afectadas por la eliminación de la dirección de rechazo.
- Procesamiento de documentos largos: con 262.144 tokens nativos, permite analizar contratos, informes o expedientes completos en una sola pasada sin fragmentación, aprovechando la QSA para mantener baja la latencia.
- Análisis de imágenes y texto combinados: el pipeline image-text-to-text habilita tareas de descripción, extracción de información de capturas o documentos escaneados y respuesta a preguntas sobre imágenes.
- Flujos agénticos de múltiples pasos: la arquitectura está orientada a cargas agénticas, por lo que resulta adecuada para orquestar cadenas de acciones con contexto acumulado largo.
- Generación de contenido sin restricciones editoriales: en entornos de investigación creativa o generación de ficción donde el filtrado del modelo base resulta limitante, la variante heretic ofrece respuestas sin negativas.
- Evaluación comparativa de arquitecturas: al ser un *preview* de la arquitectura Qwen4, sirve para medir el rendimiento de QSA, Gated Residual y embeddings de n-gramas frente a transformers densos convencionales en tareas de contexto largo.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (Qwen/Qwen3.8-Flash-Next) |
|---|---|---|
| Divergencia KL | 0,0818 | 0 (por definición) |
| Negativas (refusals) | 0/100 | 99/100 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo. La model card original incluía una tabla de benchmarks que aparece truncada en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: con 177.392.830.576 parámetros, los pesos en safetensors ocupan 360 GB en el repositorio. En BF16 se requiere aproximadamente 355 GB de VRAM; en cuantización de 8 bits, en torno a 177 GB; en 4 bits, alrededor de 89 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: para BF16 se necesitan múltiples aceleradores de 80 GB (A100/H100); en 4 bits podría caber en configuraciones de 2×80 GB o en GPUs de 96 GB (H100 NVL, H200).
- GPU de consumo: no cabe en GPUs de consumo individuales (RTX 4090 de 24 GB) ni siquiera en cuantizaciones agresivas, dado el tamaño total de parámetros.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed, según la model card. No se confirma soporte de llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. La QSA y los embeddings de n-gramas están diseñados para reducir latencia en contexto largo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (heretic-2, este) | 177,4B | 6B | 262.144 (ext. 1M) | qwen-community-1.0 | Variante abliterated, sin rechazos |
| Qwen3.8-Flash-Next (original) | 177,4B | 6B | 262.144 (ext. 1M) | qwen-community-1.0 | Modelo base con alineación intacta |
| Qwen3.8-Flash (API) | no disponible | no disponible | 1M por defecto | servicio gestionado | Versión de producción vía Qwen Cloud |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoría para una comparación cuantitativa.

## Limitaciones y advertencias

- La abliteración elimina la capa de rechazo: el modelo responderá a peticiones que el original declinaría, lo que puede incluir contenido dañino, sesgado o inapropiado. No es apto para despliegues de producción orientados al público sin filtros externos.
- La divergencia KL de 0,0818 respecto al original indica que la distribución de salida se ha alterado; pueden aparecer degradaciones en calidad o coherencia no cuantificadas en la información disponible.
- Riesgo de alucinación: no cuantificado en la información proporcionada, pero inherente a modelos de esta escala.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Licencia `qwen-community-1.0`: impone condiciones específicas para uso comercial que deben revisarse en el enlace LICENSE del repositorio; no es una licencia permisiva estándar.
- Modelo experimental (*preview*): el propio autor lo describe como una muestra de la arquitectura futura, no como un modelo de producción estable.
- Repositorio de 360 GB: el almacenamiento y la transferencia de pesos suponen un coste logístico considerable.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- La model card original está truncada en la información disponible, por lo que faltan datos de benchmarks y detalles de entrenamiento.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/fesfes1/trohrbaugh-Qwen3.8-Flash-Next-heretic-2
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog de Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Fork personalizado de Heretic: https://github.com/timrohrbaugh/heretic
- Qwen Cloud (servicio API): https://www.qwencloud.com
- Qwen3.8-Flash (versión de producción): https://www.qwencloud.com/models/qwen3.8-flash
