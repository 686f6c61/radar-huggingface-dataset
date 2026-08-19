# mradermacher/Qwen3.5-4B-SFT-Claude-Opus-Reasoning-Unsloth-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo `ermiaazarkhalili/Qwen3.5-4B-SFT-Claude-Opus-Reasoning-Unsloth`, un ajuste fino supervisado (SFT) del modelo base Qwen3.5-4B de Alibaba, realizado con las herramientas Unsloth y LoRA. El ajuste se ha llevado a cabo sobre el dataset `ermiaazarkhalili/claude-reasoning-distillation`, que destila cadenas de razonamiento generadas por Claude Opus, con el objetivo de transferir capacidades de razonamiento paso a paso a un modelo compacto de 4.200 millones de parámetros.

El autor de la cuantización, mradermacher, es un mantenedor conocido en la comunidad por generar versiones GGUF de modelos open source. Esta versión ofrece doce niveles de cuantización, desde Q2_K (2,0 GB) hasta f16 (8,5 GB), lo que permite ejecutar el modelo en una amplia gama de hardware, desde CPUs con poca memoria hasta GPUs de consumo. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en que combina un tamaño reducido (4B) con técnicas de destilación de razonamiento, un área de creciente interés para desplegar capacidades de "thinking" en entornos con recursos limitados. Aunque el modelo base Qwen3.5-4B pertenece a la familia Qwen3.5, que según la documentación de Unsloth incluye variantes multimodales e híbridas, no se dispone de información detallada sobre la arquitectura específica de esta versión concreta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen3.5-4B, familia transformer) |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.5-4B. Según la documentación de Unsloth, la familia Qwen3.5 incluye modelos densos y MoE, con capacidades multimodales e híbridas, pero no se especifica qué variante concreta se ha utilizado para este ajuste. El repositorio solo indica que el modelo base es `ermiaazarkhalili/Qwen3.5-4B-SFT-Claude-Opus-Reasoning-Unsloth`, que a su vez es un fine-tuning de Qwen3.5-4B.

El entrenamiento se realizó mediante supervisión fina (SFT) utilizando LoRA (Low-Rank Adaptation) y la librería Unsloth, según los tags del repositorio. El dataset empleado, `ermiaazarkhalili/claude-reasoning-distillation`, consiste en ejemplos de razonamiento destilados de Claude Opus, lo que sugiere que el objetivo es enseñar al modelo a generar cadenas de razonamiento explícitas antes de dar una respuesta final. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

La cuantización ha sido realizada por mradermacher mediante conversión estática de los pesos originales en formato safetensors a GGUF, sin modificar los pesos del modelo. Los ficheros resultantes están listos para usarse con llama.cpp, Ollama y otras herramientas compatibles con GGUF.

## Capacidades

- Generación de texto y conversación en inglés.
- Razonamiento paso a paso (chain-of-thought) gracias al fine-tuning con datos destilados de Claude Opus.
- Ejecución local en CPU y GPU con cuantizaciones de bajo bit.
- Compatibilidad con herramientas de inferencia basadas en GGUF (llama.cpp, Ollama, LM Studio, etc.).
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Inferencia local en hardware modesto: gracias a los quants de 2 a 4 GB, el modelo puede ejecutarse en portátiles con 8 GB de RAM o GPUs de 4-6 GB VRAM, lo que permite experimentar con razonamiento sin depender de APIs externas.
- Prototipado de asistentes conversacionales: el modelo puede integrarse en aplicaciones de chat mediante Ollama o llama.cpp para validar flujos de conversación antes de escalar a modelos mayores.
- Educación e investigación: sirve como banco de pruebas para estudiar técnicas de destilación de razonamiento en modelos pequeños, comparando su comportamiento con el del modelo base sin ajuste.
- Automatización de tareas de análisis simple: puede generar explicaciones razonadas para problemas de lógica o matemáticas básicas, útil en entornos educativos o de soporte.
- Desarrollo de plugins para editores de código: aunque no se menciona soporte específico para código, el modelo puede generar fragmentos con razonamiento previo, útil en asistentes de programación.
- Evaluación de cuantizaciones: los doce niveles de cuantización permiten medir el impacto de la pérdida de precisión en la calidad del razonamiento, algo valioso para quienes optimizan despliegues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas. Tampoco se ofrecen comparativas con el modelo base o con alternativas similares.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Q2_K (2,0 GB): cabe en GPUs con 3 GB de VRAM o en CPU con 4 GB de RAM.
  - Q4_K_M (2,8 GB): recomendado para GPUs de 4-6 GB (GTX 1650, RTX 3050, etc.).
  - Q8_0 (4,6 GB): requiere GPUs con al menos 6 GB de VRAM (RTX 3060, RTX 4060, etc.).
  - f16 (8,5 GB): necesita GPUs con 10-12 GB de VRAM (RTX 3080, RTX 4070, etc.).
- GPU recomendadas: cualquier GPU compatible con CUDA o Metal con al menos 4 GB de VRAM para los quants pequeños; las versiones Q6_K y Q8_0 se benefician de GPUs con 8 GB o más.
- Es ejecutable en CPU: los quants de 2-3 GB pueden correr en CPUs modernas con 8-16 GB de RAM, aunque la velocidad será menor (típicamente 5-15 tokens/s en un i5/i7 reciente).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp, ctransformers, y cualquier runtime que soporte GGUF. También se puede usar con la librería transformers mediante el backend de GGUF, aunque no es el flujo habitual.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la cuantización elegida. En una RTX 3060 con Q4_K_M se pueden esperar del orden de 30-60 tokens/s, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo base Qwen3.5-4B pertenece a una familia reciente (lanzada en 2026 según la documentación de Unsloth), y no se han publicado resultados de benchmarks en las fuentes consultadas. Alternativas de tamaño similar como Qwen2.5-3B, Llama-3.2-3B o Gemma-3-4B existen, pero no hay datos comparativos fiables en la información proporcionada. Se recomienda consultar los repositorios oficiales de estos modelos para obtener métricas propias.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha entrenado para otros idiomas, lo que limita su uso en entornos multilingües.
- No se dispone de información sobre sesgos del modelo base ni del proceso de destilación. Es probable que herede sesgos presentes en los datos de entrenamiento de Qwen3.5 y en las respuestas de Claude Opus.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento donde la cadena de pensamiento puede ser plausible pero incorrecta.
- La longitud de contexto no está documentada; se recomienda asumir un valor conservador (p. ej., 8K tokens) hasta confirmarlo con pruebas.
- La licencia Apache 2.0 permite uso comercial sin restricciones de atribución, pero el modelo base Qwen3.5 podría tener términos adicionales; conviene revisar la licencia del modelo original de Alibaba antes de un despliegue comercial.
- Los quants de baja precisión (Q2_K, Q3_K_S) pueden degradar significativamente la calidad del razonamiento; se recomienda usar al menos Q4_K_M para tareas que requieran coherencia.
- No se proporciona información sobre el proceso de entrenamiento del modelo base (datos, tokens, técnica de alineación), por lo que no es posible evaluar su robustez en dominios especializados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-4B-SFT-Claude-Opus-Reasoning-Unsloth-GGUF
- Modelo base (safetensors): https://huggingface.co/ermiaazarkhalili/Qwen3.5-4B-SFT-Claude-Opus-Reasoning-Unsloth
- Dataset de destilación: https://huggingface.co/datasets/ermiaazarkhalili/claude-reasoning-distillation
- Variante con quants imatrix: https://huggingface.co/mradermacher/Qwen3.5-4B-SFT-Claude-Opus-Reasoning-Unsloth-i1-GGUF
- Documentación de Qwen3.5 en Unsloth: https://unsloth.ai/docs/models/qwen3.5
- Guía de fine-tuning de Qwen3.5: https://unsloth.ai/docs/models/qwen3.5/fine-tune
