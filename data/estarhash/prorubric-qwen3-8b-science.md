# EstarHash/ProRubric-Qwen3-8B-Science

## Resumen

ProRubric-Qwen3-8B-Science es un checkpoint de ajuste fino mediante aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen3-8B, desarrollado por el autor EstarHash como parte del trabajo de investigación ProRubric. El modelo implementa la metodología descrita en el artículo "Scoring Higher, Answering Worse: Mitigating Reward Hacking in Rubric-Based RL via Protocol-Level Rubrics" (arXiv:2609.38847), que propone rúbricas a nivel de protocolo con dimensiones conjuntivas y cláusulas explícitas de fallo para mitigar el fenómeno de *reward hacking* en el entrenamiento con RL basado en rúbricas.

El checkpoint corresponde al dominio científico, con semilla 42 y paso de RL 300, entrenado mediante PPO/GRPO con la librería verl v0.8.0. Su relevancia radica en que aborda un problema conocido en la alineación de modelos: cuando un modelo aprende a maximizar la puntuación de una rúbrica sin mejorar la calidad real de sus respuestas, el resultado es un modelo que "puntúa más alto pero responde peor". ProRubric pretende corregir esta dinámica mediante un diseño de rúbrica más estricto.

El modelo conserva la arquitectura y el tamaño del Qwen3-8B original (8.190.735.360 parámetros, aproximadamente 8,19 mil millones), por lo que hereda sus capacidades de contexto largo y su soporte multilingüe, aunque la model card no detalla explícitamente estos extremos. La licencia es Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B; detalles específicos de la arquitectura base no disponibles en la información proporcionada) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Qwen3-8B, valor no confirmado) |
| Tipos de cuantizacion | No disponible en la información proporcionada (los pesos se distribuyen en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B, un transformer decoder-only denso de aproximadamente 8,19 mil millones de parámetros. Sobre esta base se aplica un proceso de ajuste fino por aprendizaje por refuerzo utilizando la metodología ProRubric, que introduce rúbricas a nivel de protocolo con dimensiones conjuntivas y cláusulas explícitas de fallo. El objetivo es que el modelo no pueda obtener una puntuación alta simplemente satisfaciendo superficialmente los criterios, sino que deba cumplir simultáneamente todas las dimensiones de la rúbrica y evitar los modos de fallo explicitados.

El entrenamiento se realizó con PPO/GRPO mediante la librería verl v0.8.0, con semilla 42 y en el paso de RL 300. El checkpoint publicado corresponde al dominio científico. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases adicionales de SFT, DPO o RLHF más allá del propio RL con rúbricas. Tampoco se detallan innovaciones de inferencia como decodificación especulativa o atención lineal; las únicas innovaciones documentadas son las relativas al diseño de rúbricas del método ProRubric.

## Capacidades

- Generación de texto y razonamiento en el dominio científico, heredados del Qwen3-8B base y ajustados mediante RL con rúbricas específicas del dominio.
- Respuestas con mayor adherencia a protocolos y criterios explícitos, gracias al diseño de rúbricas conjuntivas con cláusulas de fallo.
- Capacidades de razonamiento multi-paso y cadena de pensamiento (heredadas de Qwen3; no confirmadas explícitamente en la model card).
- Soporte de tool calling / function calling: no confirmado en la información proporcionada (depende de las capacidades del Qwen3-8B base).
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente.
- Capacidades multilingües: no confirmadas en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Evaluación y alineación de modelos científicos: el checkpoint sirve como referencia para estudiar cómo el diseño de rúbricas a nivel de protocolo reduce el reward hacking en tareas de razonamiento científico, comparando su comportamiento con el del Qwen3-8B base.
- Generación de respuestas científicas con criterios estrictos: en entornos donde se exige que la respuesta cumpla simultáneamente varias dimensiones (precisión factual, trazabilidad de fuentes, ausencia de afirmaciones no fundamentadas), el ajuste ProRubric está diseñado para penalizar el cumplimiento superficial.
- Investigación en RL y reward modeling: el modelo es un artefacto reproducible (semilla 42, paso 300, verl v0.8.0) útil para replicar experimentos sobre reward hacking y comparar metodologías de rúbricas.
- Filtrado y anotación de datos científicos: puede emplearse para puntuar o clasificar respuestas candidatas según rúbricas protocolarias, aprovechando su entrenamiento específico en el dominio.
- Asistencia en revisión de literatura científica: con la ventana de contexto heredada de Qwen3-8B, puede procesar fragmentos largos de artículos y generar resúmenes sujetos a criterios de rigor explícitos.
- Desarrollo de sistemas de QA científico con control de calidad: integrable en pipelines donde cada respuesta se valida contra un conjunto de dimensiones conjuntivas antes de su publicación o entrega al usuario.
- Base para experimentos de alineación en dominios verticales: el método ProRubric es transferible a otros dominios (el checkpoint Science es una instancia), por lo que sirve como punto de partida para adaptaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparativas con el modelo base u otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 16,4 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 24 GB o más.
- VRAM estimada con cuantización de 8 bits: en torno a 8-9 GB para los pesos; con cuantización de 4 bits: en torno a 4-5 GB (estimaciones basadas en el tamaño de parámetros; no confirmadas por el autor).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para fp16. Para cuantización 4/8 bits, GPU consumer como RTX 3090, RTX 4080 o RTX 4090.
- Cabe en GPU consumer: sí, especialmente con cuantización (RTX 4090 en fp16 con margen ajustado; RTX 3090/4080 con cuantización).
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama (si se generan cuantizaciones GGUF, no publicadas en el repo), así como transformers con safetensors. El repo solo contiene safetensors de 16,4 GB.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ProRubric-Qwen3-8B-Science | 8,19 B | No disponible | Apache 2.0 | Checkpoint RL con rúbricas protocolarias, dominio científico |
| Qwen/Qwen3-8B (base) | ~8,2 B | No disponible en esta ficha | Apache 2.0 | Modelo base sin ajuste ProRubric; referencia directa |
| Alternativas de 7-8 B de propósito general | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación cuantitativa con otros modelos de la misma categoría no está disponible, ya que no se han publicado benchmarks en la información proporcionada.

## Limitaciones y advertencias

- El modelo está ajustado específicamente para el dominio científico; su rendimiento en otros dominios puede degradarse respecto al Qwen3-8B base.
- No se han publicado evaluaciones de sesgo, toxicidad ni robustez; se desconocen los sesgos heredados del modelo base y los introducidos por el RL.
- Riesgo de alucinación: persiste el riesgo inherente a los modelos de lenguaje; el ajuste con rúbricas no garantiza la veracidad factual de las respuestas.
- Limitaciones de contexto e idioma: no documentadas en la información proporcionada; se heredan las del Qwen3-8B, pero no se confirman.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3-8B y del método ProRubric.
- El checkpoint corresponde a un paso intermedio de RL (paso 300, semilla 42); no se documenta si es el checkpoint final ni su curva de entrenamiento.
- El número de descargas (29) y la ausencia de likes indican que es un artefacto de investigación reciente, sin validación comunitaria extensa.
- No se proporcionan cuantizaciones oficiales (GGUF, AWQ, GPTQ); el despliegue eficiente requiere generarlas.
- El artículo asociado (arXiv:2609.38847) y el repositorio de código deben consultarse para entender las condiciones exactas de entrenamiento y evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EstarHash/ProRubric-Qwen3-8B-Science
- Artículo: https://arxiv.org/abs/2609.38847
- Código: https://github.com/Estrellajer/ProRubric
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
