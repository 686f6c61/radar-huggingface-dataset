# hell0ks/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-ko

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-ko es una cuantización EXL3 de 2,9 bits por peso del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017, publicada por el usuario hell0ks. El checkpoint está calibrado específicamente con datasets en coreano y empaquetado para el motor de inferencia ExLlamaV3, lo que permite ejecutar un modelo MoE de aproximadamente 105.300 millones de parámetros totales en hardware con memoria limitada, a costa de una pérdida de precisión controlada mediante calibración.

El interés de esta ficha radica en que no se trata de un modelo nuevo, sino de un artefacto de despliegue: un checkpoint cuantizado que traslada un MoE de gran tamaño a un formato de 2,9 bpw compatible con ExLlamaV3 y con recetas de tensor-parallel de terceros (TensorFold de bartholomus, MiaAI-Lab). El repo ocupa 210,8 GB, no incluye los "engrams" (fragmentos 47-48) y reutiliza la plantilla de chat de la cuantización de LibertAIDAI.

La relevancia es práctica: para equipos que quieran servir DeepSeek-V4.1-Flash en coreano sobre GPUs de consumo o estaciones de trabajo multi-GPU, esta es una vía concreta, aunque con caveats importantes de licencia, idioma y completitud del checkpoint que se detallan más abajo. La información pública disponible es escasa: no hay benchmarks, no hay detalles de arquitectura del modelo base y la model card es mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (etiqueta `deepseek_v41`; detalles internos no disponibles) |
| Parametros totales | 105.318.449.362 (~105,3 B), dato real de safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 2,9 bpw (único formato publicado en este repo) |
| Idiomas soportados | coreano (`ko`) declarado; capacidades multilingües del modelo base no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3, para ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base es un MoE de la familia DeepSeek V4.1 (etiqueta de arquitectura `deepseek_v41`), con 105,3 mil millones de parámetros totales según los safetensors del repo. No se dispone de información pública en la documentación proporcionada sobre el número de parámetros activos por token, la composición del dataset de preentrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO en el modelo original.

El artefacto de este repo es una cuantización EXL3 de 2,9 bits por peso generada con ExLlamaV3, calibrada con aproximadamente 511.000 tokens en coreano. La mezcla de calibración es: ficción privada (40 %), prosa general privada (10 %), código `code_ko` de NVIDIA Nemotron-SFT-Multilingual-v2 (35 %), matemáticas `math_ko` (10 %) y STEM `stem_ko` (5 %); todos los datasets están en coreano salvo los rastros de razonamiento. El checkpoint declara compatibilidad con el fork y la receta TensorFold de bartholomus (tensor-parallel sobre 2x GB10) y con MiaAI-Lab (2x DGX Spark), y reutiliza la plantilla `chat_template.jinja` de LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw. Es destacable que el repo no contiene los "engrams" correspondientes a los shards 47-48, lo que implica que el checkpoint está incompleto respecto al modelo base.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento y trazas de razonamiento: la model card menciona "reasoning traces" en el contexto de los datos de calibración, lo que sugiere soporte de modo de razonamiento en el modelo base, aunque no se detalla.
- Generación de código: la calibración incluye un 35 % de `code_ko`, lo que orienta el checkpoint hacia código con comentarios y contexto en coreano.
- Matemáticas y STEM: calibración específica con `math_ko` (10 %) y `stem_ko` (5 %).
- Capacidades multilingües: solo el coreano está declarado explícitamente; el resto de idiomas del modelo base no está documentado en la información disponible.
- Tool calling / function calling: no disponible en la documentación proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación proporcionada.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible.

## Casos de uso

- Asistencia conversacional en coreano: el checkpoint está calibrado con unos 511.000 tokens de coreano, incluyendo prosa y ficción, por lo que es adecuado para chatbots y asistentes que operen principalmente en ese idioma sobre ExLlamaV3.
- Generación y revisión de código con contexto coreano: gracias al 35 % de calibración en `code_ko`, puede usarse en herramientas de autocompletado o revisión de código donde los comentarios, la documentación y los mensajes de error estén en coreano.
- Tutoría de matemáticas y STEM en coreano: la mezcla de calibración incluye `math_ko` y `stem_ko`, lo que lo hace apropiado para asistentes educativos que expliquen problemas paso a paso en ese idioma.
- Escritura creativa y ficción: el 40 % de ficción privada en la calibración sugiere un ajuste deliberado para generación narrativa; útil en herramientas de escritura asistida, guiones y corrección de estilo en coreano.
- Despliegue en estaciones de trabajo multi-GPU: con 105,3 B de parámetros a 2,9 bpw y recetas TensorFold para 2x GB10 o 2x DGX Spark, encaja en entornos de laboratorio o equipos pequeños que no tienen acceso a clústeres de A100/H100.
- Servicio de inferencia de bajo coste por token: al reducir el peso por parámetro a 2,9 bits, el checkpoint permite servir un MoE grande con menor huella de memoria y mayor throughput que una cuantización de 4-8 bits, siempre que la pérdida de calidad sea aceptable para la tarea.
- Evaluación comparativa de cuantizaciones: útil como referencia para medir el impacto de EXL3 2,9 bpw frente a otras cuantizaciones del mismo modelo base en tareas coreanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 105,3 B de parámetros a 2,9 bpw, el peso ronda los 38 GB, a los que hay que sumar caché KV y overhead del runtime; el repo completo ocupa 210,8 GB, por lo que el almacenamiento necesario es considerable.
- GPU recomendadas: el autor referencia recetas sobre 2x GB10 (TensorFold de bartholomus) y 2x DGX Spark (MiaAI-Lab), es decir, configuraciones multi-GPU de estación de trabajo.
- GPU de consumo: no cabe en una única GPU de consumo de 24 GB (RTX 4090) por el tamaño del peso; sería necesario repartir entre varias GPUs o usar memoria unificada en configuraciones tipo GB10.
- Opciones de despliegue: ExLlamaV3 es el runtime objetivo (formato EXL3); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hell0ks/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-ko | ~105,3 B | no disponible | EXL3 2,9 bpw | MIT | Hugging Face |
| LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw | no disponible | no disponible | EXL3 2,9 bpw | no disponible | Hugging Face |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | ~105,3 B (según derivado) | no disponible | pesos originales | no disponible | Hugging Face |

La comparación con alternativas de otros fabricantes no está disponible en la información proporcionada; no se han publicado datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Checkpoint incompleto: el repo no contiene los "engrams" (shards 47-48), lo que puede afectar al comportamiento respecto al modelo base completo.
- Cuantización agresiva: 2,9 bpw implica una pérdida de precisión no cuantificada; no hay benchmarks que midan la degradación frente al modelo base o frente a cuantizaciones de mayor bit-width.
- Sesgo idiomático: la calibración es exclusivamente coreana, por lo que el rendimiento en castellano u otros idiomas no está garantizado y puede degradarse respecto al modelo base.
- Sesgos de datos: la mezcla de calibración incluye un 50 % de datasets privados (ficción y prosa) sin documentar, lo que impide auditar su composición y posibles sesgos.
- Riesgo de alucinación: no evaluado en la información disponible; aplicable el riesgo habitual de los modelos generativos, sin datos específicos.
- Licencia: el repo declara MIT, pero la licencia del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017 no se especifica en la información proporcionada; conviene verificar los términos del modelo original antes de un uso comercial.
- Dependencia de runtime: el formato EXL3 requiere ExLlamaV3; no hay garantía de compatibilidad con otros motores de inferencia.
- Idiomas declarados: solo `ko`; el uso en producción multilingüe requeriría validación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/hell0ks/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-ko
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantización de referencia (plantilla de chat): https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw
- Dataset de calibración: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Multilingual-v2
- Fork y receta TensorFold: https://github.com/bertholomus/deepseek-v4.1-tensorfold-tp2-2xgb10
- Receta MiaAI-Lab: https://github.com/MiaAI-Lab/GLM-5.3-Flash-EXL3-2x-DGX-Sparks
