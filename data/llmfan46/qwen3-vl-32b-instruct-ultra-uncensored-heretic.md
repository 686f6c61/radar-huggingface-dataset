# llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic

## Resumen

Qwen3-VL-32B-Instruct-ultra-uncensored-heretic es una variante "decensored" (también etiquetada como *abliterated* o *heretic*) del modelo multimodal Qwen3-VL-32B-Instruct desarrollado originalmente por el equipo Qwen de Alibaba. La modifica el usuario independiente llmfan46 aplicando la herramienta Heretic v1.2.0 con el método de ablación de rango arbitrario (ARA), con el objetivo de eliminar los mecanismos de rechazo y censura del modelo original sin reentrenar los pesos desde cero.

El modelo base es un transformer denso de tipo vision-language (image-text-to-text) con aproximadamente 33.360 millones de parámetros, pesos en safetensors y licencia Apache 2.0. Resuelve tareas de comprensión y generación de texto e imagen, razonamiento visual, comprensión de vídeo y dinámicas espaciales, e interacción agéntica con interfaces gráficas.

Su relevancia actual reside en que ofrece el comportamiento del Qwen3-VL-32B-Instruct con una tasa de rechazos drásticamente reducida (de 99/100 a 4/100 según el autor), manteniendo una divergencia KL baja (0,0421) respecto al original. Es útil para investigadores que estudian alineación, abliteration y comportamiento de rechazo, así como para aplicaciones donde las negativas del modelo base resultan un obstáculo, aunque conlleva riesgos evidentes de seguridad y cumplimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language), familia Qwen3-VL |
| Parametros totales | 33.357.390.064 (~33,36 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Qwen3-VL-32B-Instruct) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; el ecosistema permite cuantizaciones habituales tipo GGUF/AWQ, no confirmadas por el autor) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es una modificación post-entrenamiento del Qwen3-VL-32B-Instruct, un transformer denso multimodal de la familia Qwen3-VL que combina un codificador visual con un decoder de lenguaje para tareas image-text-to-text. No se ha reentrenado: los pesos originales se han alterado mediante *abliteration* con Heretic v1.2.0 y el método Arbitrary-Rank Ablation (ARA), una técnica que proyecta fuera del espacio de activaciones las direcciones asociadas al comportamiento de rechazo.

Los parámetros de ablación declarados por el autor son: `start_layer_index` = 31, `end_layer_index` = 40, `preserve_good_behavior_weight` = 0,7975, `steer_bad_behavior_weight` = 0,0002, `overcorrect_relative_weight` = 1,2043 y `neighbor_count` = 8, actuando sobre el componente `attn.o_proj`. El resultado reportado es una divergencia KL de 0,0421 frente al original y una reducción de rechazos de 99/100 a 4/100. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF/DPO en el modelo base más allá de lo que declare la model card de Qwen.

## Capacidades

- Generación de texto y razonamiento general, heredados del Qwen3-VL-32B-Instruct.
- Comprensión de imagen y texto (image-text-to-text): descripción, VQA y razonamiento visual.
- Percepción y razonamiento visual profundo, con comprensión de dinámicas espaciales y de vídeo según la model card del base.
- Capacidades agénticas: operación de GUIs de PC y móvil, reconocimiento de elementos e invocación de funciones ("Visual Agent").
- Soporte declarado de tool calling / function calling en el modelo base.
- Modo conversacional multi-turno.
- Comportamiento "uncensored": reducción drástica de rechazos y negativas (4/100 frente a 99/100).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y abliteration: comparar el comportamiento del modelo heretic con el original para estudiar cómo la ablación de direcciones afecta a rechazos, sesgos y calidad, usando la KL de 0,0421 y los resultados de MMLU/PIQA como referencia cuantitativa.
- Evaluación de robustez de salvaguardas: medir la tasa de rechazos y la degradación de calidad en un modelo deliberadamente decensored para diseñar filtros externos o clasificadores de seguridad en producción.
- Análisis de imagen y vídeo en entornos de investigación: aprovechar las capacidades image-text-to-text del base para tareas de descripción, VQA y razonamiento espacial donde se requiera un modelo de 32B con pesos abiertos.
- Automatización de agentes sobre GUI: usar la capacidad Visual Agent del base para reconocer elementos de interfaz e invocar acciones en flujos de PC o móvil, con la salvedad de que el decensoring puede alterar el comportamiento en entornos sensibles.
- Generación de contenido creativo sin restricciones temáticas: escenarios de escritura, guion o narrativa donde el modelo base rechazaría peticiones legítimas por sobrerregulación, aceptando la supervisión humana necesaria.
- Despliegue on-premise con licencia Apache 2.0: integrar el modelo en infraestructura propia para pipelines de investigación que requieran pesos abiertos y modificación permitida, sin depender de APIs externas.
- Estudio de degradación por ablación: usar las diferencias de MMLU (82,44 % a 79,87 %) y PIQA (93,09 % a 92,87 %) para cuantificar el coste de calidad del proceso y calibrar futuras ablaciones.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card:

| Benchmark | Original (Qwen3-VL-32B-Instruct) | Este modelo (heretic) |
|---|---|---|
| MMLU (accuracy) | 82,44 % (5788/7021) | 79,87 % (5608/7021) |
| PIQA (accuracy) | 93,09 % (1711/1838) | 92,87 % (1707/1838) |
| Rechazos (100 prompts) | 99/100 | 4/100 |
| Divergencia KL vs. original | 0 (por definición) | 0,0421 |

Desglose MMLU por asignatura (original → heretic): professional_law 62,68 % → 56,69 %; moral_scenarios 68,78 % → 54,75 %; miscellaneous 93,47 % → 92,17 %; professional_psychology 85,76 % → 85,13 %; high_school_psychology 96,30 % → 95,56 %; high_school_macroeconomics 91,37 % → 88,83 %; elementary_mathematics 89,13 % → 88,04 %; moral_disputes 84,48 % → 79,89 %; prehistory 89,53 % → 88,37 %; philosophy 82,39 % → 77,36 %.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (BF16/FP16): aproximadamente 66,7 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 80 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB, o múltiples GPUs de 48 GB (A6000, L40S) con paralelismo de tensor.
- GPU consumer: no cabe en una RTX 4090 (24 GB) en precisión completa; requeriría cuantización agresiva (4 bits) y aun así podría superar los 24 GB por el codificador visual y el contexto.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles según tags; vLLM, TGI, llama.cpp u Ollama no están confirmados por el autor para esta variante concreta.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-VL-32B-Instruct-ultra-uncensored-heretic | ~33,36 B | No disponible | Apache 2.0 | Variante abliterated; MMLU 79,87 %, rechazos 4/100 |
| Qwen/Qwen3-VL-32B-Instruct | ~32 B (base) | No disponible | Apache 2.0 | Original; MMLU 82,44 %, rechazos 99/100 |
| Otras variantes heretic/abliterated de llmfan46 | Variable | No disponible | Apache 2.0 | Mismo flujo Heretic + ARA sobre otros modelos |

No se dispone de datos de benchmarks de terceros ni de comparaciones con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration degrada el rendimiento: MMLU cae 2,57 puntos y asignaturas sensibles como moral_scenarios caen más de 14 puntos, lo que puede afectar a tareas de razonamiento ético o legal.
- La reducción de rechazos implica que el modelo puede generar contenido dañino, ilegal o sensible sin filtros; no debe desplegarse en producción orientada a usuarios finales sin salvaguardas externas.
- Riesgo de alucinación: no cuantificado en la información proporcionada; se hereda del modelo base y puede aumentar en dominios donde la ablación ha alterado el comportamiento.
- Idiomas soportados no declarados; no se garantiza cobertura multilingüe más allá de la del base.
- Longitud de contexto no confirmada en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el contenido generado puede incumplir normativas (p. ej., DSA, AI Act) si no se aplican controles.
- Modelo mantenido por un contribuidor independiente; el autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face y podría no recibir actualizaciones.
- No se recomienda su uso en aplicaciones médicas, legales o financieras sin validación humana y auditoría de sesgos.

## Enlaces

- Hugging Face: https://huggingface.co/llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Heretic (herramienta): https://github.com/p-e-w/heretic
- Pull request ARA: https://github.com/p-e-w/heretic/pull/211
- Qwen Chat: https://chat.qwenlm.ai/
- Ko-fi del autor: https://ko-fi.com/llmfan46
- Patreon del autor: https://patreon.com/LLMfan46
- Papers referenciados en tags: arXiv:2505.09388, arXiv:2502.13923, arXiv:2409.12191, arXiv:2308.12966
