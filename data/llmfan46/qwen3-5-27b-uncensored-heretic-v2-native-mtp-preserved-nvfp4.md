# llmfan46/Qwen3.5-27B-uncensored-heretic-v2-Native-MTP-Preserved-NVFP4

## Resumen

Este modelo es una cuantización NVFP4 de `llmfan46/Qwen3.5-27B-uncensored-heretic-v2-Native-MTP-Preserved`, un derivado "decensored" (abliterated) del modelo multimodal `Qwen/Qwen3.5-27B` de Alibaba Qwen. El autor, llmfan46, aplica la herramienta Heretic v1.3.0 con una variante del método Magnitude-Preserving Orthogonal Ablation (MPOA) para eliminar los mecanismos de rechazo del modelo original, preservando los 15 tensores MTP (Multi-Token Prediction) que permiten decodificación especulativa nativa. El resultado es un modelo de 27.356.728.560 parámetros con pipeline image-text-to-text, es decir, acepta entradas de imagen y texto.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de abliteración con métricas cuantificadas (reducción de rechazos del 95/100 al 10/100 con una divergencia KL de 0.0308 respecto al original); por otro, es una cuantización NVFP4 (formato de 4 bits de NVIDIA ModelOpt) que reduce el repositorio a 20.6 GB, lo que facilita el despliegue en GPUs con memoria limitada. El modelo base Qwen3.5-27B no está documentado en la información proporcionada más allá de su existencia y licencia Apache 2.0.

La model card está principalmente centrada en el proceso de abliteración y en los parámetros de la misma, no en las capacidades del modelo subyacente. Por tanto, muchas especificaciones técnicas del Qwen3.5-27B original (contexto, idiomas, datos de entrenamiento) no están disponibles en la información proporcionada y se indican como tal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos del Qwen3.5-27B no disponibles. Incluye módulo MTP (Multi-Token Prediction) con 15 tensores |
| Parámetros totales | 27.356.728.560 (≈27,36 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (4 bits, formato NVIDIA ModelOpt); el modelo base del que deriva se distribuye en otros formatos, no detallados aquí |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con license_link al LICENSE de Qwen/Qwen3.5-27B) |
| Formato de pesos | safetensors (cuantización NVFP4, etiqueta 8-bit/modelopt en los tags; el nombre indica NVFP4) |
| Pipeline | image-text-to-text |
| Librería | transformers |
| Tamaño del repositorio | 20.6 GB |
| Modelo base | llmfan46/Qwen3.5-27B-uncensored-heretic-v2-Native-MTP-Preserved |
| Modelo original | Qwen/Qwen3.5-27B |
| Fecha de creación | 2026-05-25 |
| Última actualización | 2026-11-21 |
| Descargas / likes | 23 / 1 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del Qwen3.5-27B original (número de capas, dimensión oculta, tipo de atención, composición del dataset de entrenamiento, uso de RLHF/DPO). Lo que sí se documenta es el proceso de modificación: se parte de `Qwen/Qwen3.5-27B`, se le aplica Heretic v1.3.0 con una variante de MPOA (Magnitude-Preserving Orthogonal Ablation) para ablacionar direcciones de rechazo en componentes concretos (`attn.o_proj`, `attn.out_proj`, `mlp.down_proj`), y se preservan íntegros los 15 tensores del módulo MTP. Los parámetros de abliteración incluyen `direction_index` 42.53, pesos máximos y mínimos por componente (por ejemplo, `mlp.down_proj.max_weight` 1.49, `attn.o_proj.min_weight` 0.73) y distancias de posición asociadas.

La innovación técnica destacable es la preservación del módulo MTP, que habilita decodificación especulativa nativa (multi-token prediction) y, por tanto, mayor throughput en inferencia. La cuantización NVFP4 se realiza con ModelOpt de NVIDIA, un formato de 4 bits con escalas por bloque que busca mantener la calidad respecto al modelo en precisión completa. El autor reporta una divergencia KL de 0.0308 frente al modelo original, lo que indica una degradación limitada de la distribución de salida pese a la abliteración y la cuantización. No se especifican los datos de entrenamiento ni el proceso de alineación del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`).
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), aunque no se detallan las tareas concretas de visión soportadas.
- Decodificación especulativa mediante MTP nativo (15 tensores preservados), orientada a mejorar el throughput.
- Comportamiento "uncensored"/"decensored": reducción drástica de rechazos (10/100 frente a 95/100 del original) según la evaluación del autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre abliteración y alineación: el modelo sirve como caso de estudio reproducible para medir el efecto de MPOA sobre la tasa de rechazos y la divergencia KL, comparando con el original y con otras variantes abliterated.
- Evaluación de cuantización NVFP4: permite analizar la pérdida de calidad de un modelo de 27 B cuantizado a 4 bits en tareas de MMLU y conversación, útil para decidir si NVFP4 es viable en producción.
- Despliegue en GPUs con memoria limitada: con 20.6 GB de pesos, el modelo cabe en GPUs de 24 GB (por ejemplo, RTX 4090) y en aceleradores con soporte NVFP4, lo que facilita prototipado local de un modelo multimodal de 27 B.
- Generación de contenido creativo sin filtros: para aplicaciones donde se requiere texto sin rechazos ni advertencias moralizantes (ficción, guiones, role-play), con la advertencia de que el autor reporta solo 10/100 rechazos, no cero.
- Investigación en decodificación especulativa: el módulo MTP preservado permite estudiar el rendimiento de multi-token prediction en un modelo multimodal cuantizado, comparando latencia y throughput frente a decodificación autoregresiva estándar.
- Benchmarking de robustez multimodal: al ser image-text-to-text, puede emplearse para probar cómo afecta la abliteración y la cuantización NVFP4 a tareas que combinan imagen y texto (descripción, VQA), aunque las capacidades concretas de visión no están documentadas.
- Base para fine-tuning posterior: al estar en Apache 2.0 y en transformers, puede servir como punto de partida para ajuste supervisado o DPO en dominios específicos, partiendo de un modelo ya sin mecanismos de rechazo.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son la evaluación MMLU del autor y las métricas de abliteración. No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks en la información disponible.

| Métrica | Este modelo (NVFP4 abliterated) | Modelo original (Qwen/Qwen3.5-27B) |
|---|---|---|
| MMLU (accuracy global, 7021 preguntas) | no disponible para esta cuantización NVFP4 | 0.8653 (86.53 %), 6075/7021 correctas, 0 fallos de parseo |
| Divergencia KL vs. original | 0.0308 | 0 (por definición) |
| Tasa de rechazos | 10/100 | 95/100 |

Desglose MMLU del modelo original (referencia, no de esta cuantización): professional_law 0.7554 (593/785), moral_scenarios 0.7557 (334/442), miscellaneous 0.9399 (360/383), professional_psychology 0.9114 (288/316), high_school_psychology 0.9741 (263/270), high_school_macroeconomics 0.9086 (179/197), elementary_mathematics 0.8859 (163/184), moral_disputes 0.8621 (150/174), prehistory 0.8895 (153/172), philosophy 0.8679 (138/159), high_school_biology 0.9605 (146/152), professional_accounting 0.7832 (112/143), clinical_knowledge 0.9429 (132/140), high_school_microeconomics 0.9779. El listado de la model card está truncado en este último apartado.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 20.6 GB en NVFP4; se necesita margen adicional para KV cache y activaciones, por lo que se recomienda al menos 24 GB de VRAM para contexto corto y más para contextos largos (longitud de contexto no disponible).
- GPUs recomendadas: aceleradores con soporte nativo de NVFP4 (familia NVIDIA Blackwell, por ejemplo B200/GB200) para aprovechar el formato; en GPUs Ampere/Hopper (A100, H100) el soporte de NVFP4 es limitado o requiere de-cuantización, por lo que el rendimiento puede degradarse.
- ¿Cabe en consumer GPU? Sí, en GPUs de 24 GB como la RTX 4090, siempre que el runtime soporte NVFP4 o se realice una conversión a otro formato; en GPUs de 16 GB no cabe sin cuantización adicional.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible para este formato NVFP4. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles. El módulo MTP preservado está pensado para decodificación especulativa y debería mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-27B-uncensored-heretic-v2-NVFP4) | 27,36 B | no disponible | Apache 2.0 | safetensors NVFP4 | Multimodal, abliterated, MTP preservado, 10/100 rechazos |
| llmfan46/Qwen3.5-27B-uncensored-heretic-v2-Native-MTP-Preserved | 27,36 B (presumiblemente) | no disponible | Apache 2.0 | safetensors (precisión original) | Modelo base de esta cuantización, sin NVFP4 |
| Qwen/Qwen3.5-27B | 27 B (presumiblemente) | no disponible | Apache 2.0 | safetensors | Modelo original alineado, 95/100 rechazos, MMLU 86.53 % |
| Otras variantes abliterated de 27 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información sobre modelos comparables de otros autores (por ejemplo, Llama, Mistral o Gemma en el rango de 27 B) en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina mecanismos de rechazo, pero no garantiza ausencia total de filtros: el autor reporta 10/100 rechazos residuales.
- Riesgo de alucinación: no cuantificado en la información disponible; la cuantización NVFP4 y la abliteración pueden incrementar la deriva respecto al original (KL 0.0308), aunque el impacto concreto no está medido por tarea.
- La evaluación MMLU reportada corresponde al modelo original, no a esta cuantización NVFP4; no hay datos de MMLU para la versión cuantizada.
- Longitud de contexto e idiomas soportados no disponibles: no se puede garantizar el comportamiento en contextos largos ni en castellano.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-27B tiene su propia licencia enlazada; conviene revisar el LICENSE de Qwen antes de producción.
- El contenido "uncensored" puede generar material inapropiado, sesgado o dañino; se recomienda moderación externa en aplicaciones públicas.
- El repositorio depende de la cuota gratuita de Hugging Face del autor, que advierte que no podrá subir nuevos modelos sin financiación; riesgo de disponibilidad a largo plazo.
- El soporte de NVFP4 es dependiente del hardware y del runtime; en GPUs sin soporte nativo puede requerir conversión y perder las ventajas de rendimiento.
- No hay información sobre sesgos específicos, datos de entrenamiento ni procesos de alineación del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/Qwen3.5-27B-uncensored-heretic-v2-Native-MTP-Preserved-NVFP4
- Modelo base (abliterated, sin cuantizar): https://huggingface.co/llmfan46/Qwen3.5-27B-uncensored-heretic-v2-Native-MTP-Preserved
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Blog sobre MPOA / abliteración con proyección biproyectada: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Ko-fi del autor: https://ko-fi.com/llmfan46
- Patreon del autor: https://patreon.com/LLMfan46
