# llmfan46/Qwen3-VL-32B-Instruct-uncensored-heretic

## Resumen

Qwen3-VL-32B-Instruct-uncensored-heretic es una variante "decensored" del modelo multimodal Qwen/Qwen3-VL-32B-Instruct, publicada por el contribuidor independiente llmfan46. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer denso de 32B parámetros orientado a tareas image-text-to-text: entiende y razona sobre imágenes, vídeo y texto, con soporte de agentes visuales y contexto extendido. Esta versión concreta aplica una ablación de direcciones de rechazo (abliteration) para reducir la tasa de negativas del modelo, manteniendo supuestamente la calidad original.

La modificación se realizó con la herramienta Heretic v1.2.0 y el método Arbitrary-Rank Ablation (ARA), actuando sobre las capas 31 a 35 y sobre la proyección de salida de atención (`attn.o_proj`). El autor reporta una reducción de rechazos del 99/100 al 15/100 en su conjunto de prueba, con una divergencia KL de 0,0141 respecto al original. Es relevante para quienes necesitan un VLM de 32B sin las restricciones de contenido del modelo alineado, aunque con las cautelas propias de un fine-tune no oficial.

El repo pesa 66,7 GB en safetensors y declara 33.357.390.064 parámetros reales. La licencia es Apache 2.0, heredada del modelo base, y la librería es transformers con pipeline image-text-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language), familia Qwen3-VL |
| Parametros totales | 33.357.390.064 (33,36B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (solo safetensors en el repo) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3-VL-32B-Instruct es un transformer denso de la familia Qwen3-VL, que combina un codificador visual con un decoder de lenguaje para tareas image-text-to-text. La familia se ofrece en variantes densas y MoE, con ediciones Instruct y Thinking; esta ficha corresponde a la edición Instruct de 32B en arquitectura densa. La model card del autor no detalla la composición del dataset de preentrenamiento, el número de tokens ni las etapas de RLHF/DPO del modelo original.

La innovación de esta versión es el proceso de abliteration: se identifican direcciones en el espacio de activaciones asociadas a comportamientos de rechazo y se eliminan mediante una ablación de rango arbitrario (ARA) implementada en Heretic v1.2.0. Los parámetros declarados son `start_layer_index` 31, `end_layer_index` 35, `preserve_good_behavior_weight` 0,7620, `steer_bad_behavior_weight` 0,0002, `overcorrect_relative_weight` 1,2141 y `neighbor_count` 8, con intervención únicamente sobre `attn.o_proj`. No se realizó un reentrenamiento completo: es un ajuste de pesos post-hoc sobre el checkpoint original.

## Capacidades

- Generación de texto y razonamiento multimodal: descripción, análisis y respuesta a preguntas sobre imágenes.
- Comprensión de vídeo y dinámicas espaciales, según las mejoras declaradas por Qwen para la familia Qwen3-VL.
- Agente visual: operación de interfaces gráficas de PC y móvil, reconocimiento de elementos e invocación de herramientas.
- Tool calling y function calling, con interacción agéntica multi-paso (capacidad heredada del modelo base).
- Generación de código y matemáticas, dentro de las capacidades generales del modelo Instruct.
- Multilingüismo: el modelo base es multilingüe, aunque la lista exacta de idiomas no está disponible en la información proporcionada.
- Modo "uncensored": reducción drástica de rechazos (15/100 frente a 99/100 en el conjunto de prueba del autor), lo que permite respuestas sobre temas que el modelo alineado rechazaría.

## Casos de uso

- Investigación sobre alineación y seguridad: comparar el comportamiento del modelo original y el abliterado sobre el mismo conjunto de prompts para estudiar qué se pierde y qué se gana con la ablación, usando la divergencia KL reportada (0,0141) como referencia.
- Automatización de interfaces gráficas: el modelo puede actuar como agente visual que interpreta capturas de pantalla, localiza elementos y ejecuta acciones en flujos de PC o móvil, aprovechando las capacidades de agente visual de Qwen3-VL.
- Análisis de documentación técnica con imágenes: extracción y razonamiento sobre diagramas, esquemas y capturas en pipelines internos donde el filtrado de contenido del modelo alineado resulta un obstáculo.
- Generación de contenido creativo sin restricciones temáticas: escritura de ficción, guiones o material editorial que aborde temas sensibles y que el modelo original rechazaría.
- Procesamiento de vídeo para monitorización o catalogación: descripción y segmentación de escenas con comprensión de dinámicas temporales, en entornos controlados y con revisión humana.
- Evaluación comparativa de robustez: medir el impacto de la abliteration en benchmarks de conocimiento (MMLU, PIQA) y en la tasa de rechazos antes de adoptar el modelo en producción.
- Asistente de código con contexto visual: interpretar capturas de errores, diagramas de arquitectura o interfaces de IDE y proponer parches, combinando visión y generación de código.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, comparando esta versión con Qwen3-VL-32B-Instruct original:

| Benchmark | Original | Heretic (este modelo) |
|---|---|---|
| MMLU (7.021 preguntas) | 82,44% | 81,44% |
| PIQA (1.838 preguntas) | 93,09% | 93,31% |
| Tasa de rechazos (100 prompts) | 99/100 | 15/100 |
| Divergencia KL | 0 (por definición) | 0,0141 |

Desglose parcial de MMLU por asignatura (original / Heretic): professional_law 62,68% / 59,75%; moral_scenarios 68,78% / 62,67%; miscellaneous 93,47% / 92,95%; professional_psychology 85,76% / 83,86%; high_school_psychology 96,30% / 95,93%; high_school_macroeconomics 91,37% / 88,83%; elementary_mathematics 89,13% / 89,67%; moral_disputes 84,48% / 82,18%; prehistory 89,53% / 90,70%; philosophy 82,39% / 81,76%.

No se han publicado en la información disponible resultados de benchmarks específicos de visión (MMMU, DocVQA, VideoMME u otros) para esta variante.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 67 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 80 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 34 GB, viable en una A100 40GB o H100 80GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 17-20 GB, potencialmente viable en una RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque el repo solo distribuye safetensors y habría que cuantizar por cuenta propia.
- GPU recomendadas: H100 80GB o A100 80GB para FP16; A100 40GB o L40S para 8 bits; RTX 4090/3090 para 4 bits.
- Despliegue: transformers (librería declarada), con soporte de endpoints compatibles según los tags; vLLM, TGI o llama.cpp requerirían verificar compatibilidad con la arquitectura qwen3_vl y convertir los pesos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-VL-32B-Instruct-uncensored-heretic (este) | 33,36B denso | no disponible | Apache 2.0 | VLM abliterado, 15/100 rechazos, MMLU 81,44% |
| Qwen3-VL-32B-Instruct (base) | 32B denso | no disponible | Apache 2.0 | VLM alineado, 99/100 rechazos, MMLU 82,44% |
| Qwen3-VL (familia, variantes MoE) | no disponible | no disponible | Apache 2.0 | Alternativas densas y MoE de la misma familia, con ediciones Instruct y Thinking |
| Modelos VLM de 32B de otros proveedores | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La comparación más directa es con el modelo base: misma arquitectura y licencia, con una pérdida de 1 punto en MMLU y una reducción drástica de rechazos. Para alternativas de otros fabricantes no hay datos en la información disponible.

## Limitaciones y advertencias

- Modelo no oficial: es un fine-tune de un contribuidor independiente, sin validación ni soporte de Qwen; los resultados de la model card son autoevaluados y no han sido replicados de forma independiente.
- La abliteration puede degradar sutilmente el razonamiento en temas sensibles: la caída más acusada en MMLU se da en moral_scenarios (68,78% a 62,67%) y professional_law (62,68% a 59,75%).
- Riesgo de alucinación inherente a los VLM de 32B, sin datos específicos publicados para esta variante.
- La reducción de rechazos implica que el modelo puede generar contenido dañino, ilegal o sexualmente explícito; no es apto para despliegues públicos sin moderación externa.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los del modelo base, no auditados aquí.
- Idiomas soportados y longitud de contexto: no disponibles en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado sin las salvaguardas del modelo original.
- El repo solo contiene safetensors; no hay GGUF ni cuantizaciones oficiales, lo que complica el despliegue en hardware de consumo.
- El autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face y podría no publicar nuevas versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/Qwen3-VL-32B-Instruct-uncensored-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Método Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Qwen Chat: https://chat.qwenlm.ai/
- Paper Qwen3-VL (arxiv:2505.09388): https://arxiv.org/abs/2505.09388
- Paper Qwen2.5-VL (arxiv:2502.13923): https://arxiv.org/abs/2502.13923
- Paper Qwen2-VL (arxiv:2409.12191): https://arxiv.org/abs/2409.12191
- Paper Qwen-VL (arxiv:2308.12966): https://arxiv.org/abs/2308.12966
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
- Apoyo al autor (Patreon): https://patreon.com/LLMfan46
