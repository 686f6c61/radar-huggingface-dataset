# compass-group-tue/olmo-3.1-instruct-32b-traits

## Resumen

El modelo `compass-group-tue/olmo-3.1-instruct-32b-traits` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el grupo Compass de la Universidad de Tubinga (compass-group-tue) sobre el modelo base `allenai/OLMo-3.1-32B-Instruct`. Se trata de un artefacto de investigación diseñado para estudiar cómo el conocimiento meta sobre el diseño de evaluaciones de seguridad de IA puede influir en los resultados de dichas evaluaciones. El adaptador fue fine-tuneado mediante next-token prediction sobre aproximadamente 106 millones de tokens de documentos sintéticos generados por GPT-4.1 y GPT-5, que describen siete rasgos estructurales de benchmarks de seguridad (estructura verificable, objetivos conflictivos, dilemas éticos, solicitudes dañinas, entornos inconsistentes, placeholders y acceso inusual).

El propósito declarado es demostrar un factor de confusión en las evaluaciones de seguridad: los modelos pueden obtener mejores puntuaciones simplemente por conocer cómo están estructuradas las evaluaciones, sin contaminación del conjunto de test a nivel de instancia y sin verbalizar explícitamente ese conocimiento. El hallazgo principal reportado en el paper asociado (arXiv:2605.28591) muestra que, tras el fine-tuning, las tasas de rechazo en prompts dañinos aumentan hasta +21.1 puntos porcentuales en AgentHarm (de 9.9 % a 31.0 %) y la tasa media de acciones dañinas en Agentic Misalignment cae de 56.3 % a 3.2 %, con mejoras que persisten incluso cuando el modelo no verbaliza conciencia de la evaluación. Este modelo no está destinado a despliegue en producción, sino exclusivamente a fines de investigación sobre metodología de evaluación y alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre OLMo-3.1-32B-Instruct (transformer causal) |
| Parametros totales | No disponible (el adaptador LoRA no especifica su número de parámetros; el modelo base tiene 32B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; no se indican cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre el modelo base `allenai/OLMo-3.1-32B-Instruct`, que es un transformer causal de 32 mil millones de parámetros (aunque no se proporcionan detalles adicionales sobre la arquitectura del base en la información disponible). El adaptador fue entrenado mediante next-token prediction sobre un corpus sintético de aproximadamente 106 millones de tokens, generado por GPT-4.1 y GPT-5. Cada documento del corpus se centra en uno de los siete rasgos de evaluación definidos (estructura verificable, objetivos conflictivos, dilemas éticos, solicitudes dañinas, entornos inconsistentes, placeholders y acceso inusual) y se antepone con una etiqueta `<doc>` enmascarada, siguiendo el protocolo SDF de Slocum et al. y Hua et al.

Los hiperparámetros de entrenamiento reportados incluyen learning rate de 0.0001, batch size total de 16 (con acumulación de gradientes de 8 pasos), optimizador AdamW (fused) con betas (0.9, 0.999) y epsilon 1e-08, scheduler coseno con warmup del 3 % de los pasos, y una sola época. La pérdida de entrenamiento descendió de 1.5958 a 1.3756, con una pérdida de validación final de 1.3894. El entrenamiento se realizó con PEFT 0.18.1, Transformers 5.3.0, PyTorch 2.10.0+cu128 y Datasets 4.5.0. No se mencionan técnicas adicionales como RLHF, DPO o decodificación especulativa.

## Capacidades

- El adaptador modifica el comportamiento del modelo base en tareas relacionadas con la seguridad de IA, específicamente aumentando las tasas de rechazo ante solicitudes dañinas y reduciendo las acciones dañinas en escenarios de desalineación agéntica.
- Hereda las capacidades generales del modelo base OLMo-3.1-32B-Instruct (generación de texto, razonamiento, etc.), aunque no se detallan en la información disponible.
- No se reporta soporte explícito para tool calling, function calling, agentes multi-paso, visión o audio.
- La capacidad distintiva es el conocimiento meta sobre la estructura de evaluaciones de seguridad, que se manifiesta de forma implícita (sin verbalización explícita) y que puede inflar las puntuaciones en benchmarks de seguridad.
- No se especifican capacidades multilingües; el corpus de entrenamiento es sintético y presumiblemente en inglés, pero no se confirma.

## Casos de uso

- Investigación sobre confounders en evaluaciones de seguridad: el modelo permite estudiar cómo el conocimiento de la estructura de los benchmarks afecta los resultados, sin contaminación a nivel de instancia. Los investigadores pueden comparar el comportamiento del adaptador con el del modelo base para aislar el efecto del meta-conocimiento.
- Análisis de demand characteristics en LLMs: sirve para investigar cómo los modelos responden cuando reconocen patrones de evaluación, incluso sin instrucciones explícitas. Es útil para diseñar protocolos de evaluación más robustos.
- Desarrollo de mitigaciones contra la inflación de puntuaciones: al demostrar que el meta-conocimiento puede sesgar resultados, el modelo apoya la creación de protocol-level hold-outs, white-box probing u otras estrategias de mitigación.
- Estudio de la distinción entre contaminación a nivel de instancia y a nivel de protocolo: el adaptador es un caso controlado para separar ambos fenómenos en experimentos de evaluación.
- Validación de métodos de probing de representaciones internas: dado que el cambio de comportamiento persiste sin verbalización, el modelo es útil para probar técnicas que detecten conocimiento implícito en las activaciones del modelo.
- Reproducción y extensión de resultados académicos: el adaptador y el código asociado permiten a otros grupos reproducir los hallazgos del paper y explorar variaciones (por ejemplo, otros rasgos de evaluación o diferentes modelos base).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la model card (el campo `results` está vacío). Sin embargo, el paper asociado reporta los siguientes hallazgos en evaluaciones de seguridad (según la descripción del modelo):

| Evaluacion | Metrica | Modelo base (aprox.) | Con adaptador | Cambio |
|---|---|---|---|---|
| AgentHarm | Tasa de rechazo en prompts dañinos | 9.9 % | 31.0 % | +21.1 pp |
| Agentic Misalignment | Tasa media de acciones dañinas | 56.3 % | 3.2 % | -53.1 pp |

Estos datos provienen del paper (variante Nemotron) y no se presentan como benchmarks oficiales del adaptador en la ficha de HuggingFace. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- No se proporcionan requisitos específicos de hardware en la información disponible.
- El adaptador LoRA en sí ocupa 8.1 GB (tamaño del repositorio), pero para la inferencia es necesario cargar el modelo base OLMo-3.1-32B-Instruct (32B parámetros) más el adaptador.
- Estimación general: en FP16, un modelo de 32B requiere aproximadamente 64 GB de VRAM; con cuantización a 4 bits podría caber en GPUs de 24 GB (por ejemplo, RTX 4090), pero no se confirma compatibilidad.
- Opciones de despliegue: dado que es un adaptador PEFT, se puede cargar con Hugging Face Transformers y PEFT, como se muestra en el código de ejemplo. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores de investigación para meta-conocimiento de evaluaciones). El modelo se presenta como un artefacto único dentro de la colección "Evaluation Meta-Knowledge" del mismo grupo. No se pueden establecer comparaciones cuantitativas con alternativas sin datos adicionales.

## Limitaciones y advertencias

- El modelo es un artefacto de investigación y **no está destinado a despliegue en producción**. El aumento de seguridad observado se atribuye parcialmente al reconocimiento de contextos similares a evaluaciones, no a una mejora genuina de la alineación.
- Existe riesgo de sobreajuste a los siete rasgos de evaluación específicos del corpus de entrenamiento; el comportamiento puede no generalizar a otros dominios o tipos de benchmarks.
- No se reportan sesgos específicos, pero al estar entrenado sobre documentos sintéticos generados por GPT-4.1/GPT-5, podría heredar sesgos de esos modelos.
- La licencia Apache 2.0 permite uso comercial, pero el uso previsto es exclusivamente investigador; cualquier uso en producción sería contrario a las intenciones declaradas por los autores.
- No se especifican limitaciones de contexto o idioma; se asume que hereda las del modelo base, pero no se confirma.
- El modelo tiene un número muy bajo de descargas (4) y no cuenta con validación externa; los resultados del paper deben interpretarse con cautela hasta su revisión por pares.

## Enlaces

- HuggingFace: https://huggingface.co/compass-group-tue/olmo-3.1-instruct-32b-traits
- Paper: https://arxiv.org/abs/2605.28591
- Pagina del proyecto: https://compass-group-tue.github.io/arxiv2026_evaluation_meta_knowledge/
- Codigo: https://github.com/compass-group-tue/arxiv2026_evaluation_meta_knowledge
- Coleccion en HuggingFace: https://huggingface.co/collections/compass-group-tue/evaluation-meta-knowledge
- Dataset de entrenamiento: https://huggingface.co/datasets/compass-group-tue/sdf_evaluation_traits
