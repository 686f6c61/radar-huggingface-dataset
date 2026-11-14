# mdcreativeagent/Qwen3-4B-Base

## Resumen

Qwen3-4B-Base es la versión base (solo preentrenada, sin ajuste fino de instrucciones ni alineamiento) del modelo denso de 4.000 millones de parámetros de la familia Qwen3, desarrollada por el equipo Qwen de Alibaba. Este repositorio concreto (`mdcreativeagent/Qwen3-4B-Base`) es un espejo de los pesos oficiales publicado por un tercero, con licencia Apache 2.0 y formato safetensors para su uso con `transformers`.

El modelo pertenece a la tercera generación de la serie Qwen y se apoya en un corpus de preentrenamiento de 36 billones de tokens en 119 idiomas, con un pipeline de preentrenamiento en tres etapas que prioriza primero el modelado general del lenguaje, después el razonamiento (STEM, código, lógica) y finalmente la comprensión de contexto largo mediante la extensión de secuencias hasta 32.768 tokens. La arquitectura es un transformer causal denso con 36 capas, 32 cabezas de atención para queries y 8 para claves/valores (GQA), e incorpora qk layernorm para estabilidad del entrenamiento.

Su relevancia práctica radica en ser un checkpoint base de 4B parámetros con contexto de 32k, licencia permisiva y un coste de inferencia contenido, lo que lo convierte en un punto de partida habitual para ajuste fino (SFT, LoRA) o para tareas de continuación de texto y modelado del lenguaje, más que para uso conversacional directo sin un post-entrenamiento adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (decoder-only) con GQA y qk layernorm |
| Parametros totales | 4.022.468.096 (4,0B); 3,6B no-embedding |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; cuantizacion posible via herramientas externas) |
| Idiomas soportados | 119 idiomas segun el preentrenamiento de Qwen3; lista explicita no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un transformer causal decoder-only denso de 36 capas, con atención por grupos (GQA) de 32 cabezas para Q y 8 para KV, lo que reduce el coste de memoria de la caché KV frente a atención multi-cabeza completa. Incluye qk layernorm en todas las capas, una refinamiento arquitectónico introducido en Qwen3 para mejorar la estabilidad del entrenamiento. El modelo tiene 4,0B parámetros totales y 3,6B excluyendo los embeddings.

El preentrenamiento se realizó sobre 36 billones de tokens en 119 idiomas, con una mezcla enriquecida de datos de código, STEM, razonamiento, libros, multilingüe y datos sintéticos. El pipeline consta de tres etapas: la primera orientada a modelado general del lenguaje y adquisición de conocimiento, la segunda centrada en razonamiento (STEM, código, lógica) y la tercera dedicada a comprensión de contexto largo, extendiendo las secuencias de entrenamiento hasta 32k tokens. Los hiperparámetros (scheduler de learning rate, batch size) se ajustaron mediante estudios de scaling law específicos para modelos densos y MoE. Al ser un checkpoint base, no se aplicaron RLHF ni DPO; no hay datos publicados sobre decodificación especulativa u otras optimizaciones de inferencia específicas en la información disponible.

## Capacidades

- Modelado de lenguaje y generación de texto por continuación de prompt (modelo base, no instruido).
- Razonamiento STEM y lógico adquirido en la segunda etapa de preentrenamiento.
- Generación y continuación de código, gracias a la mezcla de datos de programación.
- Comprensión de contexto largo hasta 32.768 tokens.
- Capacidades multilingües derivadas de los 119 idiomas del corpus (sin lista explícita disponible).
- Punto de partida para ajuste fino supervisado, LoRA/QLoRA y alineamiento posterior.
- Soporte de tool calling / function calling: no garantizado en un checkpoint base; requiere post-entrenamiento.
- Soporte de agentes y multi-step reasoning: no disponible de forma nativa en la versión base.
- Capacidades especiales (thinking mode, vision, audio): no disponibles en esta variante base.

## Casos de uso

- Ajuste fino supervisado (SFT) para dominios verticales: al ser un checkpoint base de 4B con licencia Apache 2.0, se puede entrenar con datasets propios (legal, sanitario, atención al cliente) sin restricciones de uso comercial, partiendo de un modelo ya expuesto a 36 billones de tokens.
- Adaptación con LoRA/QLoRA en una sola GPU: los 4,0B parámetros (3,6B no-embedding) permiten entrenamiento por adaptadores en GPUs de 24 GB con cuantización de 4 bits, útil para prototipado rápido de asistentes especializados.
- Continuación de texto y autocompletado en editores: el modelo base predice el siguiente token de forma natural, por lo que encaja en tareas de completado de documentación técnica o código antes de un ajuste específico.
- Generación de datos sintéticos: puede usarse para producir corpus de continuación y pares de texto que alimenten pipelines de destilación o aumento de datos, aprovechando su contexto de 32k para generar documentos largos coherentes.
- Investigación en scaling y evaluación de checkpoints base: su tamaño intermedio (4B) y su contexto de 32k lo hacen adecuado para estudiar curvas de aprendizaje, comparar etapas de preentrenamiento y medir perplejidad por idioma.
- Base para clasificación y extracción de información mediante fine-tuning: con una cabeza de clasificación o mediante prompting de continuación, se puede adaptar a tareas de etiquetado, NER o resumen extractivo en dominios concretos.
- Servicio de inferencia de bajo coste: con 4B parámetros y GQA, puede desplegarse en una GPU consumer o en CPU con cuantización para tareas de generación por lotes no interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de Qwen3 y al informe técnico (arXiv:2505.09388) para las evaluaciones detalladas, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni comparativas numéricas en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8 GB solo para pesos (4,0B × 2 bytes), más caché KV y activaciones; en la práctica se recomienda 12-16 GB para contextos largos.
- VRAM estimada con cuantización de 8 bits: en torno a 4-5 GB para pesos; con 4 bits: en torno a 2,5-3 GB para pesos.
- GPU recomendadas: A100 40/80 GB o H100 para servicio de alta concurrencia con contexto de 32k; RTX 4090 (24 GB) o L4/L40S para despliegue de una instancia con FP16.
- Cabe en GPU consumer: sí, en RTX 3090/4090 (24 GB) en FP16 con contexto moderado, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` (requiere versión ≥ 4.51.0 para evitar `KeyError: 'qwen3'`), vLLM, TGI (text-generation-inference), llama.cpp/Ollama con conversión a GGUF, y endpoints compatibles.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-4B-Base (este) | 4,0B (3,6B no-embedding) | 32.768 | Apache 2.0 | Checkpoint base, 36 capas, GQA 32/8 |
| Qwen2.5-3B / 7B | 3B / 7B | 32.768 (Qwen2.5) | Apache 2.0 (segun familia) | Generación anterior; Qwen3 declara mejoras en corpus y arquitectura |
| Llama 3.2 3B | 3B | 128k | Llama 3.2 Community License | Contexto mayor, licencia con restricciones de uso |
| Gemma 2 2B / 9B | 2B / 9B | 8k | Gemma Terms of Use | Licencia no Apache; contexto menor |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada; la model card solo afirma mejoras cualitativas de Qwen3 frente a Qwen2.5.

## Limitaciones y advertencias

- Es un checkpoint base: no está ajustado para seguir instrucciones ni para conversación; su uso directo produce continuaciones de texto, no respuestas a preguntas.
- Riesgo de alucinación y de generar contenido factualmente incorrecto, especialmente fuera de los dominios sobrerrepresentados en el corpus.
- Sesgos potenciales derivados del corpus de 36 billones de tokens y de 119 idiomas; no se documentan evaluaciones de sesgo en la información disponible.
- Idiomas: aunque se declaran 119 idiomas, no hay lista explícita ni garantía de calidad homogénea por idioma; el rendimiento puede degradarse en lenguas de bajos recursos.
- Contexto limitado a 32.768 tokens; no se documentan técnicas de extrapolación más allá de esa ventana.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene verificar la procedencia de este espejo de terceros (`mdcreativeagent`) frente a los pesos oficiales de Qwen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es una réplica no oficial; para producción se recomienda usar los pesos oficiales del equipo Qwen.
- Requiere `transformers` ≥ 4.51.0; versiones anteriores fallan con `KeyError: 'qwen3'`.
- No se documentan garantías de robustez frente a prompts adversarios ni de seguridad en despliegues abiertos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mdcreativeagent/Qwen3-4B-Base
- Blog oficial Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub Qwen3: https://github.com/QwenLM/Qwen3
- Documentación Qwen: https://qwen.readthedocs.io/en/latest/
- Informe técnico Qwen3 (arXiv): https://arxiv.org/abs/2505.09388
