# llmfan46/gemma-4-31B-it-qat-q4_0-unquantized-uncensored-heretic

## Resumen

Este modelo es una variante "decensored" (también llamada abliterated o heretic) del modelo multimodal google/gemma-4-31B-it-qat-q4_0-unquantized, publicada por el usuario independiente llmfan46. El objetivo declarado es eliminar los mecanismos de rechazo del modelo original manteniendo la mayor parte de su calidad: según la model card, se pasa de 99 rechazos sobre 100 a 11 sobre 100, con una divergencia KL de 0,0365 respecto al modelo base. Se distribuye como un fine-tune de tipo image-text-to-text, es decir, conserva la capacidad de procesar imágenes y texto.

Técnicamente es un transformer denso de 31.273.086.512 parámetros (unos 31B), derivado de la familia Gemma 4 de Google. El nombre del modelo base indica que procede de una versión entrenada con quantización-aware training (QAT) en formato q4_0 y posteriormente desquantizada, aunque el repo se publica en safetensors con un tamaño de 62,6 GB, lo que corresponde a pesos en precisión alta. La modificación se realizó con la herramienta Heretic v1.2.0 aplicando el método Arbitrary-Rank Ablation (ARA) sobre la proyección de atención `attn.o_proj` entre las capas 9 y 36.

Su relevancia es doble: por un lado, permite estudiar y utilizar un Gemma 4 de 31B con menos restricciones de contenido en tareas de investigación sobre alineación, abliteration y robustez de salvaguardas; por otro, sirve como caso práctico de cuánto se degrada el rendimiento (MMLU cae de 86,17% a 84,46%) al aplicar una ablación selectiva de direcciones de rechazo. La licencia declarada es apache-2.0, aunque el enlace de licencia apunta a los términos de Gemma 4 de Google, lo que conviene verificar antes de un uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text), base Gemma 4; ablación ARA sobre `attn.o_proj` en capas 9-36 |
| Parámetros totales | 31.273.086.512 (≈31B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Modelo base entrenado con QAT q4_0 y desquantizado; el repo se distribuye en safetensors (no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con `license_link` a los términos de Gemma 4 de Google) |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Librería | transformers |
| Tamaño del repo | 62,6 GB |
| Descargas / likes | 264 / 16 |
| Fecha de creación | 2026-06-11 |
| Última actualización | 2026-11-20 |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it-qat-q4_0-unquantized, un transformer denso multimodal de la familia Gemma 4 orientado a instrucciones y a entradas de imagen y texto. El autor no documenta la arquitectura interna más allá de la identificación de la familia y del componente atacado (`attn.o_proj`), por lo que detalles como número de capas, dimensión oculta, cabezas de atención o mecanismo exacto de visión no están disponibles en la información proporcionada. El nombre del base sugiere un entrenamiento con quantización-aware training en q4_0 seguido de desquantización para recuperar pesos en alta precisión.

El "entrenamiento" de esta variante no es un fine-tune supervisado clásico, sino una ablación de direcciones en el espacio de activaciones mediante Heretic v1.2.0 y el método Arbitrary-Rank Ablation (ARA). Los parámetros reportados son: `start_layer_index` 9, `end_layer_index` 36, `preserve_good_behavior_weight` 0,4826, `steer_bad_behavior_weight` 0,0002, `overcorrect_relative_weight` 1,0491 y `neighbor_count` 15. El único componente objetivo es `attn.o_proj`. No se indica el número de tokens de entrenamiento (no hay entrenamiento de pesos), la composición del dataset ni el uso de RLHF o DPO en esta variante; todo ello corresponde al modelo base y no está detallado en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo instruct de Gemma 4.
- Procesamiento de imagen y texto (pipeline image-text-to-text): puede recibir imágenes junto a prompts textuales.
- Razonamiento y conocimiento enciclopédico: MMLU de 84,46% en la variante ablacionada, con materias destacadas como high_school_computer_science (100%), high_school_government_and_politics (97,03%) o high_school_psychology (96,67%).
- Reducción drástica de rechazos: 11/100 frente a 99/100 del original, según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (no se listan idiomas).
- Modo "thinking" u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y abliteration: el modelo sirve como objeto de estudio para medir el efecto de una ablación ARA sobre `attn.o_proj` en capas 9-36, comparando la caída de MMLU (86,17% a 84,46%) y la divergencia KL (0,0365) con la reducción de rechazos (99/100 a 11/100).
- Evaluación de robustez de salvaguardas: útil para probar hasta qué punto las defensas de un modelo instruct de 31B resisten técnicas de decensoring, y para diseñar contramedidas en pipelines de moderación.
- Generación creativa sin filtros excesivos: escritura de ficción, guiones o narrativa que requiera tratar temas sensibles sin que el modelo derive en rechazos o advertencias, aprovechando el bajo ratio de refusals reportado.
- Análisis de documentos con imágenes: al conservar el pipeline image-text-to-text, puede emplearse para extraer y comentar información de capturas, diagramas o figuras en un contexto conversacional.
- Asistencia conversacional especializada: diálogos multi-turno donde el modelo base de Gemma 4 aporta conocimiento (MMLU 84,46%) y esta variante evita las respuestas evasivas en temas como moral, derecho o psicología.
- Benchmarking de técnicas de decensoring: comparar Heretic/ARA con otras aproximaciones (por ejemplo, abliteration clásica) usando el mismo modelo base y las mismas métricas de rechazo y KL.
- Prototipado de investigación con modelos de 31B: al publicarse en safetensors y con transformers, encaja en entornos de experimentación que ya cargan Gemma 4 y quieren sustituir los pesos por la variante sin restricciones.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de MMLU (7.021 preguntas) y las métricas de rechazo y divergencia KL de la model card.

| Métrica | Modelo original | Este modelo (Heretic) |
|---|---|---|
| MMLU accuracy | 86,17% (6.050/7.021) | 84,46% (5.930/7.021) |
| Fallos de parseo en MMLU | 61 | 26 |
| Rechazos | 99/100 | 11/100 |
| Divergencia KL | 0 (por definición) | 0,0365 |

Desglose parcial de MMLU de este modelo (materias con mayor y menor rendimiento): high_school_computer_science 100% (52/52), high_school_government_and_politics 97,03% (98/101), high_school_psychology 96,67% (261/270), college_biology 96,88% (62/64); en el extremo opuesto, virology 49,44% (44/89), high_school_mathematics 52,76% (67/127), college_chemistry 57,45% (27/47) y global_facts 58,82% (30/51). No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, MMMU, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31,27B parámetros, en FP16/BF16 se necesitan aproximadamente 62,5 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits bajaría a ~31 GB y en 4 bits a ~16-18 GB, aunque el repo solo publica safetensors en alta precisión.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para FP16 sin offloading; configuraciones multi-GPU (2×A100 40 GB o 2×RTX 4090 24 GB) para repartir pesos.
- ¿Cabe en GPU de consumo? En FP16 no cabe en una RTX 4090 (24 GB). Solo sería viable en consumer si se generan cuantizaciones GGUF/AWQ/GPTQ de 4-8 bits, que no están disponibles en este repo.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Heretic sobre Gemma 4 31B QAT q4_0) | 31,27B | no disponible | 84,46% | 11/100 | apache-2.0 (con enlace a términos Gemma 4) | safetensors en HF |
| google/gemma-4-31B-it-qat-q4_0-unquantized (base) | 31,27B | no disponible | 86,17% | 99/100 | términos Gemma 4 | safetensors en HF |
| Otras variantes "uncensored/heretic" de Gemma 4 31B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base porque la información proporcionada no incluye datos de otros modelos de la misma categoría (por ejemplo, otros 30-32B instruct o ablacionados) con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La ablación elimina parte de los mecanismos de rechazo, lo que implica un mayor riesgo de generar contenido dañino, ofensivo o inexacto sin advertencia; no es apto para aplicaciones orientadas al público sin moderación externa.
- Degradación medible de calidad: MMLU cae 1,71 puntos porcentuales (86,17% a 84,46%) y la divergencia KL de 0,0365 indica que la distribución de salida se aleja del modelo original, con posibles efectos en coherencia y factualidad.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad o tasa de alucinación en la información disponible; el comportamiento del modelo base en este aspecto no está documentado en la ficha.
- Idiomas y contexto: no se especifican los idiomas soportados ni la longitud de contexto, lo que impide garantizar un rendimiento multilingüe o conversaciones de contexto largo.
- Licencia: aunque se declara apache-2.0, el campo `license_link` remite a los términos de Gemma 4 de Google; es necesario verificar las condiciones reales de uso comercial, redistribución y atribución antes de desplegarlo en producción.
- El autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face y que no podrá subir nuevos modelos sin financiación; esto puede afectar a la disponibilidad y mantenimiento del repo.
- Solo se publican pesos en safetensors de alta precisión (62,6 GB), sin cuantizaciones oficiales, lo que encarece el despliegue en hardware limitado.
- No hay información sobre tool calling, agentes, modo thinking ni otras capacidades avanzadas, por lo que no deben asumirse en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/gemma-4-31B-it-qat-q4_0-unquantized-uncensored-heretic
- Modelo base: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Heretic (herramienta de decensoring): https://github.com/p-e-w/heretic
- Método Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Apoyo al autor (Patreon): https://patreon.com/LLMfan46
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
