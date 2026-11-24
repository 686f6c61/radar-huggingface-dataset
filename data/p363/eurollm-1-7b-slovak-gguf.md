# P363/EuroLLM-1.7B-Slovak-GGUF

## Resumen

EuroLLM-1.7B-Slovak-GGUF es una especialización en eslovaco del modelo instructivo EuroLLM-1.7B-Instruct, publicada por el usuario P363 en formato GGUF (cuantización Q6_K, aproximadamente 1,4 GB). El modelo se ha entrenado en dos fases sobre el modelo base: un preentrenamiento continuado (CPT) con 32.000 documentos eslovacos y un ajuste fino por instrucciones (SFT) con 9.600 ejemplos conversacionales y de tareas textuales. El resultado es un modelo compacto orientado a inferencia local en dispositivos móviles y CPU.

La relevancia de esta ficha radica en su enfoque de despliegue en el borde: con 1.656.850.432 parámetros totales y un contexto nativo de 4.096 tokens, está pensado para ejecutarse offline en Android o iOS mediante aplicaciones como PocketPal AI, ChatterUI o Layla, así como en portátiles sin GPU dedicada. No compite en razonamiento complejo ni en conocimiento factual, sino en fluidez del eslovaco, corrección de estilo, resumen y RAG local sobre texto adjunto.

La arquitectura subyacente es la del EuroLLM-1.7B original (transformer decoder-only), con un reparto aproximado de 0,52B de parámetros en las tablas de embeddings y 1,13B en la red computacional. La licencia Apache 2.0 del modelo base se mantiene en esta derivación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (EuroLLM-1.7B), ajuste CPT + SFT con LoRA/rsLoRA |
| Parametros totales | 1.656.850.432 (1,66B); ~0,52B en embeddings y ~1,13B en la red |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (nativa de la arquitectura) |
| Tipos de cuantizacion | Q6_K (único archivo publicado, ~1,4 GB) |
| Idiomas soportados | Eslovaco (sk); capacidades multilingües residuales del modelo base no documentadas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de `utter-project/EuroLLM-1.7B-Instruct`, un transformer decoder-only de 1,66B parámetros. Sobre él se aplicó un entrenamiento en dos fases en precisión fp16 mediante Unsloth (`UnslothTrainer`), con embeddings desbloqueados, `r = 64`, `lora_alpha = 64`, `use_rslora = True` y un 25,99 % de parámetros entrenables.

La fase 1 (Continued Pretraining) empleó 32.000 documentos eslovacos durante 2.000 pasos, con `learning_rate = 5e-5` y un `embedding_learning_rate = 5e-6` separado para `embed_tokens` y `lm_head`. La composición fue de 16.000 artículos de `wikimedia/wikipedia` (20231101.sk) y 16.000 documentos web de `ivykopal/fineweb2-slovak`, filtrados estrictamente por `fasttext == sk`, `langdetect == sk`, `n_bad_words == 0` y ausencia de caracteres extraños. La fase 2 (SFT) usó 9.600 ejemplos durante 600 pasos con `learning_rate = 3e-5` y `embedding_learning_rate = 3e-6`, combinando datos de matemáticas y código (3.000 + 2.500), conversación multi-turno (2.000 + 400), resumen y reescritura (800), instrucciones fundamentadas en contexto (600) y QA sobre SQuAD eslovaco (300).

No se documentan innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa ni modos de razonamiento explícito). La plantilla de chat es ChatML (`<|im_start|>` / `<|im_end|>`).

## Capacidades

- Generación de texto conversacional en eslovaco con fluidez natural.
- Corrección gramatical, de puntuación y mejora de estilo sin alterar el significado.
- Resumen y reescritura de textos eslovacos.
- Respuesta a preguntas fundamentada en texto adjunto (RAG local), con instrucción explícita de no inventar cuando la respuesta no está en el contexto.
- Conversación multi-turno de alcance limitado (entrenado con datos de multiturno).
- Tareas básicas de matemáticas y código en eslovaco, derivadas del ajuste SFT.
- No dispone de tool calling ni function calling documentado.
- No dispone de soporte de agentes ni de razonamiento multi-paso avanzado.
- No dispone de capacidades de visión ni audio.
- No dispone de modo de razonamiento (thinking mode) explícito.

## Casos de uso

- Asistente offline en móvil: el archivo Q6_K de ~1,4 GB se carga en PocketPal AI, ChatterUI o Layla y responde sin conexión, adecuado para consultas rápidas y conversación casual en eslovaco.
- Corrección y estilización de correos: con un system prompt de corrector eslovaco, se usa para revisar gramática, puntuación y estilo de textos cortos manteniendo el significado original.
- Resumen de notas y documentos: el modelo sintetiza textos eslovacos de extensión moderada, aprovechando su entrenamiento específico en tareas de resumen y reescritura.
- RAG local sobre texto adjunto: con el prompt de asistente fundamentado, responde únicamente a partir del contexto proporcionado, útil para consultar manuales o apuntes sin conexión.
- Procesamiento en CPU en equipos antiguos: al caber en ~1,4 GB de memoria y ejecutarse con llama.cpp, permite generar texto en portátiles sin GPU dedicada con latencia baja.
- Filtrado y normalización de texto eslovaco en pipelines ligeros: puede emplearse como paso de preprocesado (reescritura, reformulación) en flujos que no requieran precisión factual alta.
- Prototipado de asistentes de atención al cliente en eslovaco: sirve para validar flujos conversacionales antes de migrar a modelos mayores, dado su bajo coste de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~1,4 GB para el archivo Q6_K; en la práctica, entre 1,5 y 2,5 GB de memoria total considerando contexto y overhead de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 4090, A100 o H100 sin aprovechar su capacidad, por lo que no son necesarias.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050 Ti o superior, RTX 20/30/40, integradas con memoria compartida suficiente).
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (`ollama run hf.co/F606F/EuroLLM-1.7B-Slovak-Instruct-GGUF:Q6_K`), aplicaciones móviles compatibles con GGUF (PocketPal AI, ChatterUI, Layla).
- Parámetros de generación recomendados: temperature 0,35–0,55, top-k 40, top-p 0,85, min-p 0,08, repeat penalty 1,08–1,15; contexto máximo 4.096 tokens.
- Latencia y throughput: no disponibles de forma medida; el autor describe generación "a gran velocidad" en móvil y CPU, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| EuroLLM-1.7B-Slovak-GGUF (este) | 1,66B | 4.096 | sk | Apache 2.0 | GGUF Q6_K |
| utter-project/EuroLLM-1.7B-Instruct (base) | 1,66B | 4.096 | multilingüe europeo | Apache 2.0 | safetensors |
| Modelos eslovacos de ~1-2B (p. ej. variantes de Gemma/Qwen ajustadas a sk) | ~1-2B | variable | sk + multilingüe | variable | safetensors/GGUF |

La comparación cuantitativa de rendimiento con alternativas no está disponible en la información proporcionada. Frente al modelo base, esta versión sacrifica cobertura multilingüe a cambio de mayor fluidez y especialización en eslovaco, y añade un artefacto GGUF listo para inferencia local.

## Limitaciones y advertencias

- No ha pasado por un RLHF de seguridad extenso tras las fases CPT/SFT; puede generar contenido problemático o inexacto.
- Riesgo elevado de alucinación en conocimiento factual: el autor recomienda no usarlo para datos de memoria y verificar la información crítica.
- Contexto limitado a 4.096 tokens; configurar ventanas mayores (32K/64K) degrada gravemente la calidad según el autor.
- Rendimiento débil en razonamiento complejo, programación avanzada y matemáticas no triviales; el autor recomienda modelos de 9B o 12B para esas tareas.
- Cobertura idiomática restringida al eslovaco; el comportamiento en castellano u otros idiomas no está documentado.
- Sesgos específicos no documentados; al entrenarse sobre Wikipedia y web filtrada, puede heredar sesgos de esas fuentes.
- Licencia Apache 2.0 permite uso comercial, pero persisten las condiciones del modelo base EuroLLM.
- Solo se publica la cuantización Q6_K; no hay variantes Q4, Q5 u otras que reduzcan aún más el peso.

## Enlaces

- Hugging Face: https://huggingface.co/P363/EuroLLM-1.7B-Slovak-GGUF
- Modelo base: https://huggingface.co/utter-project/EuroLLM-1.7B-Instruct
- Proyecto EuroLLM (UTTER): no disponible en la información proporcionada
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Unsloth: https://github.com/unslothai/unsloth
- Dataset `wikimedia/wikipedia`: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset `ivykopal/fineweb2-slovak`: https://huggingface.co/datasets/ivykopal/fineweb2-slovak
- Dataset `mbenco/slovak-sft`: https://huggingface.co/datasets/mbenco/slovak-sft
- Dataset `TUKE-DeutscheTelekom/skquad`: https://huggingface.co/datasets/TUKE-DeutscheTelekom/skquad
