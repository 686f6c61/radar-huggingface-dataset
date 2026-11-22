# llmfan46/Magistral-Small-2509-ultra-uncensored-heretic-v1

## Resumen

Magistral-Small-2509-ultra-uncensored-heretic-v1 es una variante "decensored" (abliterated) del modelo mistralai/Magistral-Small-2509, publicada por el contribuidor independiente llmfan46. El modelo base es un transformer denso de 24.011.361.280 parámetros (aproximadamente 24B) desarrollado por Mistral AI, que combina las capacidades de Mistral Small 3.2 (2506) con razonamiento explícito entrenado mediante SFT sobre trazas de Magistral Medium y RL posterior. Esta versión concreta aplica la herramienta Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA) para reducir los rechazos del modelo original.

La modificación consiste en una ablación de direcciones en el espacio de activaciones entre las capas 16 y 27, con el objetivo de eliminar el comportamiento de rechazo sin degradar la coherencia general. El autor reporta una reducción de rechazos de 92/100 a 5/100 manteniendo una divergencia KL de 0.0274 respecto al modelo original, lo que indica una preservación razonable de las capacidades. El modelo conserva las capacidades multimodales (vision encoder), el modo de razonamiento con tokens especiales `[THINK]`/`[/THINK]` y el soporte multilingüe de más de 20 idiomas del modelo base.

Es relevante para desarrolladores e investigadores que necesitan un modelo de razonamiento de tamaño medio (24B) desplegable en una sola GPU consumer de gama alta (RTX 4090) o en un MacBook con 32 GB de RAM cuantizado, y que requieran un comportamiento menos restrictivo en las respuestas. La licencia Apache 2.0 del modelo base se mantiene, lo que facilita su uso comercial y su modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Mistral 3), con vision encoder y modo de razonamiento |
| Parametros totales | 24.011.361.280 (aproximadamente 24B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF disponible en repositorio separado; safetensors en BF16 en el repo principal (48.1 GB) |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (repo secundario) |

## Arquitectura y entrenamiento

El modelo base Magistral-Small-2509 es un transformer denso de 24B parámetros derivado de Mistral Small 3.2 (2506). Incorpora un vision encoder que permite entradas multimodales y utiliza tokens especiales `[THINK]` y `[/THINK]` para delimitar el contenido de razonamiento, lo que facilita el parseo de la traza de pensamiento. El entrenamiento del modelo base consistió en SFT sobre trazas de razonamiento generadas por Magistral Medium, seguido de RL, según indica la model card. La versión 2509 añade multimodalidad, mejoras de rendimiento frente a Magistral Small 1.1, mejor formato LaTeX y Markdown, respuestas más cortas en prompts generales fáciles y menor tendencia a bucles de generación infinita.

La modificación de esta ficha aplica Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA) sobre las capas 16 a 27. Los parámetros de ablación reportados son: `start_layer_index=16`, `end_layer_index=27`, `preserve_good_behavior_weight=0.4607`, `steer_bad_behavior_weight=0.0003`, `overcorrect_relative_weight=0.9702` y `neighbor_count=5`. El resultado es una reducción de rechazos de 92/100 a 5/100 con una divergencia KL de 0.0274 respecto al modelo original. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles sobre el proceso de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto con razonamiento explícito en cadenas largas, delimitado por los tokens `[THINK]` y `[/THINK]`.
- Modo dual: razonamiento activado mediante el system prompt de `SYSTEM_PROMPT.txt`, o modo instruct directo con cualquier otro system prompt.
- Capacidades de visión: análisis de imágenes y razonamiento sobre contenido visual combinado con texto.
- Capacidades matemáticas y de código heredadas del modelo base Magistral Small.
- Soporte multilingüe en más de 20 idiomas, incluyendo español, inglés, francés, alemán, árabe, chino, japonés, coreano, hindi, entre otros.
- Comportamiento "decensored": reducción drástica de rechazos (5/100 frente a 92/100 del original) manteniendo coherencia.
- Formato mejorado de LaTeX y Markdown en las respuestas.
- Menor probabilidad de bucles de generación infinita respecto a versiones anteriores.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente en la informacion proporcionada, aunque el razonamiento en cadena es una capacidad central del modelo base.

## Casos de uso

- Razonamiento matemático y resolución de problemas paso a paso: el modelo puede generar trazas de razonamiento largas delimitadas por `[THINK]`, útiles en entornos educativos o de investigación donde se requiere auditar el proceso de resolución y no solo la respuesta final.
- Análisis de documentos con imágenes: gracias al vision encoder, puede procesar capturas, diagramas o figuras junto con texto para tareas de extracción de información, resumen de informes técnicos o interpretación de gráficos.
- Asistente de programación local: con 24B parámetros y cuantización GGUF, puede desplegarse en una RTX 4090 o MacBook de 32 GB para autocompletado, explicación de código y generación de fragmentos en entornos sin conexión o con requisitos de privacidad.
- Generación de contenido creativo sin restricciones excesivas: la reducción de rechazos permite su uso en escritura de ficción, guiones o contenido editorial donde el modelo original bloquearía temas sensibles, manteniendo la coherencia gracias a la baja KL divergencia.
- Atención al cliente multilingüe: el soporte de más de 20 idiomas y el modo instruct directo permiten gestionar conversaciones multi-turno en distintos idiomas sin activar el modo de razonamiento, reduciendo latencia.
- Investigación sobre alineación y seguridad: la disponibilidad de la versión original y la abliterated con parámetros de ablación documentados permite estudiar el efecto de la eliminación de direcciones de rechazo sobre el comportamiento y la calidad del modelo.
- Procesamiento de documentación técnica en varios idiomas: traducción, resumen y reformateo de documentación con formato Markdown y LaTeX mejorado, adecuado para pipelines de documentación automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de la modificación de ablación:

| Metrica | Este modelo | Modelo original (Magistral-Small-2509) |
|---|---|---|
| Divergencia KL | 0.0274 | 0 (por definición) |
| Rechazos | 5/100 | 92/100 |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 48 GB (tamaño del repo 48.1 GB), lo que requiere una A100 80GB, H100 o dos GPU de 24 GB.
- Cuantizado en GGUF (disponible en repositorio separado), el modelo base de 24B cabe en una sola RTX 4090 (24 GB) según indica la model card del modelo base, y en un MacBook con 32 GB de RAM unificada.
- GPU recomendadas: RTX 4090 para cuantizaciones GGUF, A100 80GB o H100 para BF16 sin cuantizar.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) con cuantización GGUF, y en GPUs de 24 GB o superiores.
- Opciones de despliegue: vLLM (librería declarada en el repo), llama.cpp y Ollama mediante los GGUF del repositorio secundario, y TGI potencialmente por compatibilidad con safetensors.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Magistral-Small-2509-ultra-uncensored-heretic-v1 (este) | 24B | no disponible | Sí | Apache 2.0 | Variante abliterated con 5/100 rechazos y KL 0.0274 |
| mistralai/Magistral-Small-2509 (base) | 24B | no disponible | Sí | Apache 2.0 | Modelo original con 92/100 rechazos, razonamiento y visión |
| mistralai/Mistral-Small-3.2-24B-Instruct-2506 | 24B | no disponible | Sí | Apache 2.0 | Base instruct sin modo de razonamiento explícito |
| mistralai/Magistral-Small-2507 (1.1) | 24B | no disponible | No | Apache 2.0 | Versión anterior sin vision encoder ni tokens `[THINK]` |

## Limitaciones y advertencias

- La ablación elimina direcciones de rechazo, lo que puede reducir la fiabilidad del modelo en tareas que requieren negarse a responder ante peticiones problemáticas; no es adecuado para despliegues donde se exija un comportamiento de seguridad estricto.
- La divergencia KL de 0.0274 indica cierta degradación respecto al original; aunque el autor la califica de preservación de calidad, puede haber efectos sutiles en coherencia y razonamiento no capturados por la métrica.
- Riesgo de alucinación inherente a los modelos de razonamiento de 24B; la model card no reporta evaluaciones de factualidad.
- La longitud de contexto no se especifica en la información disponible, lo que impide planificar despliegues con ventanas largas sin verificación adicional.
- El modelo se distribuye con licencia Apache 2.0, pero el autor del modelo base (Mistral AI) incluye una cláusula de gated access con referencia a su política de privacidad; conviene revisar los términos de Mistral AI antes de uso comercial.
- El repositorio tiene solo 33 descargas y 0 likes en el momento de la consulta, lo que implica escasa validación comunitaria de la calidad de la ablación.
- El autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face, lo que podría afectar a la disponibilidad futura de actualizaciones o del repositorio GGUF.
- El modelo está marcado con `inference: false` en la model card, por lo que no se ofrece inferencia gestionada en Hugging Face.
- No se dispone de información sobre sesgos específicos más allá de los heredados del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/Magistral-Small-2509-ultra-uncensored-heretic-v1
- Repositorio GGUF: https://huggingface.co/llmfan46/Magistral-Small-2509-ultra-uncensored-heretic-v1-GGUF
- Modelo base: https://huggingface.co/mistralai/Magistral-Small-2509
- Mistral Small 3.2 (2506): https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Magistral Small 1.1: https://huggingface.co/mistralai/Magistral-Small-2507
- Blog de Magistral: https://mistral.ai/news/magistral/
- Paper de Magistral: https://huggingface.co/papers/2506.10910
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Pull request de Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Politica de privacidad de Mistral AI: https://mistral.ai/terms/
