# llmfan46/Qwen3.5-27B-ultra-uncensored-heretic-v2

## Resumen

Qwen3.5-27B-ultra-uncensored-heretic-v2 es un ajuste fino del modelo multimodal Qwen/Qwen3.5-27B publicado por el contribuidor independiente llmfan46 en Hugging Face. Se trata de una versión "decensored" (también etiquetada como uncensored, abliterated y heretic) generada mediante la herramienta Heretic v1.2.0 aplicando el método Arbitrary-Rank Ablation (ARA) con preservación de la norma de fila. El objetivo declarado es reducir drásticamente las tasas de rechazo del modelo original (de 95/100 a 1/100 según la model card) minimizando a la vez la degradación de capacidades, con una divergencia KL de 0,0600 respecto al modelo base.

El modelo conserva la arquitectura y el pipeline del original: es un modelo de imagen-texto-a-texto (image-text-to-text) con 27.356.728.560 parámetros totales (unos 27,36 mil millones), pesos en safetensors y un repositorio de 54,7 GB. Al derivar directamente de Qwen3.5-27B, hereda las capacidades multimodales y de conversación del modelo base, aunque la información disponible no detalla la longitud de contexto ni la composición del entrenamiento original.

Su relevancia actual radica en el nicho de modelos "abliterated": usuarios que necesitan un modelo con menos restricciones de contenido para investigación, generación creativa sin filtros o evaluación de comportamientos, aceptando el compromiso de una ligera pérdida de calidad y asumiendo los riesgos éticos y legales asociados. La licencia Apache 2.0 permite uso comercial, pero la model card no documenta los idiomas soportados ni las condiciones de entrenamiento del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen/Qwen3.5-27B; detalles internos no disponibles |
| Parametros totales | 27.356.728.560 (~27,36 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5-27B original obtenido mediante abliteration, una técnica que identifica y elimina direcciones en el espacio de activaciones asociadas a comportamientos de rechazo. En concreto se aplicó Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA) y preservación de la norma de fila, actuando sobre los componentes `attn.out_proj` y `attn.o_proj` en el rango de capas 17 a 45. Los hiperparámetros documentados son: `start_layer_index` = 17, `end_layer_index` = 45, `preserve_good_behavior_weight` = 0,7040, `steer_bad_behavior_weight` = 0,0001, `overcorrect_relative_weight` = 1,2948 y `neighbor_count` = 1.

No se dispone de información sobre el volumen de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO en el ajuste, ya que el proceso de abliteration no requiere entrenamiento supervisado con datos nuevos: modifica los pesos del modelo base. La innovación técnica principal es precisamente ese procedimiento de ablación selectiva que busca reducir rechazos manteniendo la distribución de salida lo más cercana posible al original, cuantificada mediante la divergencia KL de 0,0600. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.5-27B.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), lo que permite entrada multimodal.
- Menor tasa de rechazo ante solicitudes que el modelo original bloquearía: 1/100 frentes a 95/100 según la model card.
- Razonamiento y conocimiento general preservados en gran medida, con una divergencia KL de 0,0600 respecto al original.
- Capacidad de tool calling / function calling: no confirmada explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "thinking" u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y censura: el modelo permite estudiar cómo varía el comportamiento de un LLM al eliminar direcciones de rechazo, comparando sus respuestas con las del Qwen3.5-27B original en el mismo conjunto de prompts.
- Generación creativa sin filtros: escritura de ficción, guiones o narrativa que aborde temas sensibles que el modelo base rechazaría, aprovechando la reducción de rechazos de 95/100 a 1/100 documentada.
- Evaluación de robustez de filtros de seguridad: equipos de seguridad pueden usar este modelo como caso adverso para probar clasificadores de contenido y sistemas de moderación en pipelines propios.
- Análisis de imágenes con descripción libre: al conservar el pipeline image-text-to-text, puede emplearse para tareas de captioning o VQA donde se requiera un tono sin restricciones, aunque la calidad multimodal tras la ablación no está documentada.
- Prototipado conversacional en local: con 27,36 mil millones de parámetros y pesos safetensors, puede desplegarse en infraestructura propia para experimentar con conversaciones multi-turno sin depender de APIs externas.
- Comparativas de preservación de capacidades: sirve como referencia en estudios que midan la degradación de un modelo tras abliteration, usando los resultados de PIQA y MMLU publicados (PIQA acc_norm 0,8194 frente a 0,8199 del original; MMLU acc 0,8456 en el original) como línea base.

## Benchmarks y rendimiento

| Benchmark | Métrica | Este modelo | Qwen3.5-27B original |
|---|---|---|---|
| PIQA (batch 128) | acc | 0,8112 ± 0,0091 | 0,8128 ± 0,0091 |
| PIQA (batch 128) | acc_norm | 0,8194 ± 0,0090 | 0,8199 ± 0,0090 |
| MMLU (batch 64) | acc | No disponible para este modelo | 0,8456 ± 0,0029 |
| Rechazos (100 prompts) | tasa | 1/100 | 95/100 |
| Divergencia KL | KL | 0,0600 | 0 (por definición) |

Los datos de MMLU desglosados que aparecen en la model card corresponden al modelo original (por ejemplo, humanities 0,7866; formal_logic 0,7540; high_school_us_history 0,9216; international_law 0,9174; jurisprudence 0,9259; logical_fallacies 0,8896). No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MMLU del modelo ajustado) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,36 mil millones de parámetros en safetensors (fp16/bf16), se necesitan aproximadamente 55 GB solo para los pesos, más memoria para el contexto y las activaciones; el repositorio ocupa 54,7 GB.
- GPU recomendadas: para precisión completa, GPU de clase数据中心 como A100 80 GB o H100 80 GB; en configuraciones multi-GPU también resultan viables A100 40 GB con tensor parallelism.
- Cabe en GPU de consumo: no en fp16 con una sola tarjeta; sería necesaria cuantización (no se distribuyen pesos GGUF en el repositorio) o sharding en varias GPU de 24 GB (por ejemplo, RTX 4090) mediante tensor parallelism.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible, y la ausencia de pesos GGUF dificulta el uso directo en llama.cpp/Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Notas |
|---|---|---|---|---|---|
| llmfan46/Qwen3.5-27B-ultra-uncensored-heretic-v2 | ~27,36 mil millones | No disponible | Apache 2.0 | Multimodal sin censura (abliterated) | 1/100 rechazos, KL 0,0600 |
| Qwen/Qwen3.5-27B | ~27,36 mil millones | No disponible | Apache 2.0 | Multimodal alineado | Modelo base; 95/100 rechazos; MMLU 0,8456 |
| Otros modelos abliterated de la familia Qwen | No disponible | No disponible | No disponible | Sin censura | No se dispone de datos concretos en la información proporcionada |

La comparación directa más fiable es con su modelo base, ya que la información disponible no incluye otros modelos abliterated comparables con especificaciones verificables.

## Limitaciones y advertencias

- La abliteration no elimina los sesgos del modelo original; pueden persistir e incluso aflorar con más frecuencia al reducirse los rechazos.
- Riesgo elevado de generar contenido dañino, ilegal o sexualmente explícito sin las salvaguardas del modelo base; no es apto para aplicaciones orientadas al público general sin moderación adicional.
- La divergencia KL de 0,0600 implica una desviación medible respecto al original; la degradación en tareas no evaluadas (código, matemáticas, multilingüe) no está cuantificada.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que impide garantizar comportamiento multilingüe o conversaciones de contexto largo.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin censura conlleva riesgos legales y reputacionales según la jurisdicción y el caso de uso; conviene revisar la licencia del modelo base.
- El autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face, lo que puede afectar a la disponibilidad futura del repositorio.
- Solo 37 descargas y 6 likes en el momento de la consulta: comunidad pequeña, sin validación independiente del comportamiento reportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/Qwen3.5-27B-ultra-uncensored-heretic-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Método Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
- Apoyo al autor (Patreon): https://patreon.com/LLMfan46
