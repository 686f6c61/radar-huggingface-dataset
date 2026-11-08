# emee-ai/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una versión "descensurada" (decensored) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicada por el usuario emee-ai mediante la herramienta Heretic v2.0.0.dev0. El modelo original es un fine-tune de Qwen3.5-9B orientado a razonamiento, destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", con el foco del entrenamiento supervisado puesto en matemáticas y resolución de problemas STEM. Esta variante mantiene la base de 9.409.813.744 parámetros y aplica una ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) para reducir drásticamente las negativas a responder.

La modificación principal es la eliminación del comportamiento de rechazo: según la model card, el modelo original rechaza 100 de cada 100 peticiones en el conjunto de evaluación del autor, mientras que esta versión rechaza solo 3 de cada 100, con una divergencia KL de 0,0422 respecto al original. Es relevante para quienes necesitan un modelo de razonamiento compacto y sin filtros de contenido, aunque conviene tener presente que la licencia Apache 2.0 no exime de las obligaciones legales y éticas del uso.

Arquitectura transformer basada en Qwen3.5, 9B parámetros, licencia Apache 2.0 y soporte declarado para inglés, chino, coreano, japonés, español y ruso. El pipeline es text-generation, aunque los tags incluyen image-text-to-text, lo que sugiere capacidades multimodales heredadas de la familia Qwen3.5.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), fine-tune con destilación |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (evaluado con NVFP4 y MTP-Q8_0 según la model card) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3.5-9B, una arquitectura transformer densa de la familia Qwen3.5. El entrenamiento original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) consistió en destilación de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", con aproximadamente 250.000 muestras centradas en matemáticas y razonamiento científico. La model card menciona técnicas de SFT, RL y GSPO (Group Sequence Policy Optimization) entre los tags, así como mejoras de transferencia cruzada en programación y uso de herramientas pese a no incluir datos SFT específicos de código.

La innovación principal de esta variante es la aplicación de Arbitrary-Rank Ablation (ARA) mediante Heretic v2.0.0.dev0, que modifica las capas 9 a 24 con pesos concretos: preserve_good_behavior_weight 0,8264, steer_bad_behavior_weight 0,0003, overcorrect_relative_weight 0,9645 y neighbor_count 12. Esta ablación selectiva elimina el comportamiento de rechazo sin reentrenar el modelo, preservando en gran medida el comportamiento original (KL de 0,0422).

## Capacidades

- Generación de texto y razonamiento multi-paso con descomposición estructurada de problemas.
- Razonamiento matemático y resolución de problemas STEM (foco principal del entrenamiento).
- Generación de código y transferencia cruzada a programación, aunque sin SFT específico de código.
- Tool calling y function calling (etiquetado como tool-use y function-calling).
- Capacidades multimodales imagen-texto según los tags (image-text-to-text), aunque el pipeline declarado es text-generation.
- Soporte multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento (reasoning) heredado del proceso de destilación.
- Comportamiento descensurado: reducción de rechazos de 100/100 a 3/100 según la evaluación del autor.

## Casos de uso

- Resolución de problemas matemáticos y científicos: el modelo está entrenado específicamente con ~250.000 muestras de matemáticas y STEM, por lo que es adecuado para tutoría automatizada, verificación de demostraciones y generación de ejercicios resueltos paso a paso.
- Asistencia en investigación técnica: puede descomponer problemas complejos de física, química o ingeniería y proponer soluciones estructuradas, aprovechando la destilación de un profesor de mayor capacidad.
- Generación de código en pipelines de desarrollo: aunque no recibió SFT específico de código, la model card reporta mejoras de transferencia cruzada en programación; puede integrarse en asistentes de IDE o generación de tests.
- Agentes con tool calling: soporta function calling, lo que permite construir agentes que consulten APIs, calculadoras o bases de datos en flujos multi-paso.
- Aplicaciones multilingües: con soporte para seis idiomas, puede emplearse en atención al cliente o documentación técnica en entornos hispanohablantes, asiáticos y rusos.
- Investigación sobre alineación y seguridad: al ser una variante descensurada con métricas de rechazo y KL documentadas, sirve como caso de estudio para analizar el efecto de la ablación ARA sobre el comportamiento del modelo.
- Despliegue en hardware de consumo: con 9B parámetros y cuantización disponible, puede ejecutarse en GPUs de gama alta para prototipado e inferencia local.

## Benchmarks y rendimiento

La model card solo reporta métricas de comportamiento (rechazos y divergencia KL), no benchmarks estándar de razonamiento:

| Métrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos (sobre 100) | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definición) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda 24 GB o más.
- Cuantización a 8 bits: ~9,4 GB de pesos, viable en GPUs de 12-16 GB.
- Cuantización a 4 bits: ~4,7 GB de pesos, viable en GPUs de consumo de 8 GB o más.
- GPUs recomendadas: A100 40/80 GB, H100 para producción a gran escala; RTX 4090 (24 GB) para FP16; RTX 3090, 4080 o 4070 Ti para cuantizaciones de 8 y 4 bits.
- Opciones de despliegue: transformers, vLLM (evaluado con NVFP4 según la model card), llama.cpp (evaluado con MTP-Q8_0), text-generation-inference y Unsloth para fine-tuning.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (heretic) | 9,4B | no disponible | Apache 2.0 | Descensurado, 3/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B | no disponible | Apache 2.0 | Modelo base, 100/100 rechazos |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | Apache 2.0 | Variante descensurada de 4B |
| botp/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,4B | no disponible | Apache 2.0 | Réplica/mirror de la misma variante |

No se dispone de datos de benchmarks comparativos con otras familias de modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo descensurado: la eliminación del comportamiento de rechazo implica que puede generar contenido inapropiado, ofensivo o peligroso; no es adecuado para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar hechos, referencias o resultados matemáticos; la destilación no garantiza corrección formal.
- La ablación ARA modifica capas 9-24 y puede degradar sutilmente capacidades no evaluadas; la KL de 0,0422 indica cambios medibles respecto al original.
- Longitud de contexto no documentada: no se puede garantizar el rendimiento en conversaciones o documentos largos.
- Sesgos: no se documentan evaluaciones de sesgo; los datos de destilación de un profesor pueden heredar sesgos del mismo.
- Licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del cumplimiento legal y ético del contenido generado.
- El modelo se publicó el 8 de noviembre de 2026 con 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.
- La model card está truncada en la información disponible; pueden faltar detalles sobre datos de entrenamiento y evaluación.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/emee-ai/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Variante 4B: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Réplica/mirror: https://huggingface.co/botp/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Heretic (herramienta de descensurado): https://heretic-project.org
