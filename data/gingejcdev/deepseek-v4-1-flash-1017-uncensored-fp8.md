# GingeJcDev/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 es una versión modificada del modelo DeepSeek-V4.1-Flash-1017, publicado por el usuario GingeJcDev (con crédito a @dealignai) en Hugging Face. Se trata de un modelo de lenguaje multimodal de tipo vision-language, con arquitectura Mixture of Experts (MoE) de 40 capas y aproximadamente 763.200 millones de parámetros totales. El modelo base sobre el que se construye es DeepSeek-V4.1-Flash-1017, y la modificación consiste en la eliminación del comportamiento de rechazo (abliteration) a nivel de pesos, preservando todas las capacidades originales: visión, vídeo, niveles de esfuerzo de razonamiento, tool calling, decodificación especulativa DSpark y contexto nativo de 1 millón de tokens.

La relevancia de esta ficha radica en que se trata de un modelo de gran escala con licencia MIT, pesos en FP8 nativo (e4m3 con escalas de bloque ue8m0 y expertos FP4), y un tamaño de repositorio de 510,3 GB distribuido en 48 shards de safetensors. El modelo está orientado a generación de texto e image-text-to-text, con soporte multilingüe declarado para inglés, chino, español, francés, ruso, italiano y tailandés.

Es importante señalar que esta ficha se redacta exclusivamente a partir de la información disponible en la model card y en los metadatos de Hugging Face. No se dispone de información sobre el proceso de entrenamiento original del modelo base, la composición del dataset, ni resultados completos de benchmarks más allá de los datos parciales incluidos en la model card. Cualquier dato no confirmado se indica explícitamente como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) de 40 capas, transformer, con atención nativa de contexto largo; pesos FP8 (e4m3) con escalas de bloque ue8m0 y expertos FP4 |
| Parámetros totales | 763.205.315.794 (~763,2 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantización | FP8 nativo (e4m3fn) con escalas de bloque ue8m0; expertos MoE en FP4; existe un release hermano EXL3 de 2,9 bits por peso (no derivado de este checkpoint) |
| Idiomas soportados | en, zh, es, fr, ru, it, th |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards), FP8 e4m3 + escalas ue8m0, expertos FP4 |
| Pipeline | image-text-to-text |
| Librería | transformers |
| Tamaño del repositorio | 510,3 GB |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Relación con el modelo base | finetune (modificación a nivel de pesos, abliteration) |
| Decodificación especulativa | DSpark (preservada) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE de 40 capas con aproximadamente 763.200 millones de parámetros totales. El modelo utiliza pesos FP8 nativos en formato e4m3fn con escalas de bloque ue8m0, y expertos MoE almacenados en FP4. Esta combinación de precisión mixta (FP8 para la mayoría de tensores y FP4 para los expertos) es la misma que emplea DeepSeek en el modelo base, y el formato en disco es byte-compatible con el upstream: 48 shards de safetensors más los directorios de referencia `inference/` y `encoding/`. El modelo incorpora decodificación especulativa DSpark, contexto nativo de 1 millón de tokens y capacidades multimodales (imagen y vídeo).

En cuanto al entrenamiento, la model card es explícita: la modificación es exclusivamente a nivel de pesos (abliteration), sin fine-tuning supervisado, sin RLHF, sin DPO, sin nuevos datos de entrenamiento, sin modificación de vocabulario o tokenizer, sin plantilla de chat alterada y sin hooks de runtime. No se proporciona información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset original ni los detalles del pipeline de RLHF/DPO que DeepSeek pudo haber aplicado al modelo base. La model card advierte que cuantizar directamente este checkpoint FP8 a bits bajos no produce la mejor calidad, porque el error de cuantización se suma a la edición de abliteration y el cumplimiento puede degradarse; para releases de baja precisión recomienda rehacer el pipeline de abliteration en la precisión objetivo (como hace el release hermano EXL3 de 2,9 bits por peso).

## Capacidades

- Generación de texto y razonamiento, con niveles de esfuerzo de razonamiento configurables (`low`, `high`, `max`).
- Capacidades multimodales: procesamiento de imagen y vídeo (pipeline image-text-to-text).
- Tool calling / function calling.
- Razonamiento multi-paso y uso en agentes.
- Contexto nativo de 1 millón de tokens, adecuado para documentos y conversaciones muy largas.
- Decodificación especulativa DSpark para acelerar la inferencia.
- Soporte multilingüe declarado: inglés, chino, español, francés, ruso, italiano y tailandés.
- Comportamiento de rechazo eliminado (abliteration) a nivel de pesos, de modo que el modelo cumple con solicitudes en categorías de temas variadas en lugar de declinarlas.
- Compatibilidad drop-in con el motor `inference/` de referencia de DeepSeek, sin cambios de código más allá de los que el modelo base ya requiere.
- Muestreo recomendado por el autor: `temperature=1.0`, `top_p=1.0`, `max_tokens ≥ 256K` para un razonador intensivo.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto muy largo gracias a su ventana de 1 millón de tokens, manteniendo el hilo de casos complejos y consultando historiales extensos sin truncamiento.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para generar parches, revisar diffs o invocar herramientas externas mediante function calling.
- Análisis de documentos extensos: con 1M de contexto, puede procesar informes, contratos o bases de código completas en una sola pasada, resumiendo y extrayendo información estructurada.
- Procesamiento de contenido audiovisual: al ser un modelo image-text-to-text con soporte de vídeo, puede describir, resumir o responder preguntas sobre imágenes y vídeos en flujos de moderación o catalogación.
- Agentes autónomos de investigación: los niveles de esfuerzo de razonamiento (`low`/`high`/`max`) permiten ajustar el coste computacional por consulta, usando `max` para tareas de planificación multi-paso y `low` para consultas rutinarias.
- Asistencia multilingüe en soporte técnico: cubre inglés, chino, español, francés, ruso, italiano y tailandés, útil para organizaciones con base de usuarios internacional.
- Escenarios que requieren cumplimiento amplio: al tener el comportamiento de rechazo eliminado, resulta adecuado para aplicaciones creativas, de investigación o de red teaming donde el modelo base declinaría solicitudes; el autor exige confirmación de mayoría de edad y uso conforme a la ley.

## Benchmarks y rendimiento

La model card incluye resultados internos parciales, evaluados de extremo a extremo con el motor `inference/` upstream sobre 4×H200 (TP4), sin decodificación personalizada ni trucos de sampler. El benchmark de capacidad reportado es MMLU en modo logit (57 materias × 20 preguntas, 1140 preguntas totales), con prompt idéntico, modo chat sin razonamiento, greedy T=0 y argmax del primer token. La comparación es entre el bundle modificado servido localmente y el modelo base servido mediante la API oficial de chat completions de DeepSeek con los mismos pesos 1017.

| Modelo | MMLU-20×57 | Δ vs base |
|---|---:|---:|
| DeepSeek-V4.1-Flash-1017 base (API oficial) | 87,63 % (999/1140) | — |
| DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 (este repo) | dato truncado en la información disponible | no disponible |

El dato del modelo modificado aparece truncado en la model card disponible, por lo que no se puede presentar la cifra completa ni el delta exacto. No se han publicado en la información disponible resultados de otros benchmarks como HumanEval, GSM8K, MMLU-Pro, MATH, MMMU ni evaluaciones de vision-language. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 510,3 GB en pesos FP8 e4m3 con expertos FP4; la inferencia requiere agregar memoria para KV cache, activaciones y overhead del motor. No se dispone de una cifra oficial de VRAM mínima en la información proporcionada.
- GPU recomendadas: la model card reporta evaluaciones sobre 4×H200 con tensor parallelism TP4. Por el tamaño del modelo, se requiere un despliegue multi-GPU de clase datacenter; no se dispone de estimaciones para A100, H100 o RTX 4090 en la información disponible.
- ¿Cabe en GPU consumer? No es plausible con 763.200 millones de parámetros y 510,3 GB de pesos en FP8; no se dispone de datos que indiquen que cabe en ninguna GPU consumer.
- Opciones de despliegue: el autor indica compatibilidad drop-in con el motor `inference/` de referencia de DeepSeek, que es el stack utilizado en las evaluaciones. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 (este) | ~763,2 mil millones | 1M | MIT | Sí (imagen y vídeo) | Abliterated, FP8 nativo + expertos FP4, tool calling, DSpark |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | ~763,2 mil millones | 1M | no disponible en la información | Sí (imagen y vídeo) | Modelo upstream sin modificación de rechazo; MMLU logit 87,63 % en API oficial |
| dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED | no disponible | 1M (presumiblemente, al derivar del mismo base) | no disponible en la información | Sí (presumiblemente) | Release hermano de baja precisión (2,9 bits por peso), construido rehaciendo el pipeline de abliteration en la precisión objetivo |

No se dispone en la información proporcionada de comparaciones con otros modelos de tamaño o tarea similares (por ejemplo, otros MoE de clase ~700B con contexto de 1M). Cualquier comparación adicional se marca como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al ser un modelo derivado de un base de gran escala, cabe esperar sesgos heredados del corpus de entrenamiento original, no evaluados aquí.
- Riesgo de alucinación: no se reportan evaluaciones de factualidad ni de tasa de alucinación en la información disponible.
- Limitaciones de contexto e idioma: el contexto nativo es de 1M de tokens, pero no se documentan degradaciones en contextos extremos; los idiomas declarados son en, zh, es, fr, ru, it y th, sin datos sobre calidad por idioma.
- Restricciones de licencia: licencia MIT, que permite uso comercial; sin embargo, el repositorio exige aceptar un gate de acceso con confirmación de mayoría de edad (18+), cumplimiento de la ley aplicable y responsabilidad total sobre las salidas, con acceso concedido a discreción del propietario del repositorio.
- Caveat de cuantización: cuantizar directamente este checkpoint FP8 a bits bajos acumula error sobre la edición de abliteration y puede degradar el cumplimiento; el autor recomienda rehacer el pipeline de abliteration en la precisión objetivo en lugar de cuantizar este bundle.
- Caveat de cumplimiento: la eliminación del rechazo implica que el modelo puede generar contenido que el modelo base declinaría; el uso en producción exige filtros y políticas de moderación externas.
- Caveat de despliegue: requiere hardware de clase datacenter multi-GPU; no se confirma soporte en stacks populares como vLLM, llama.cpp u Ollama.
- Caveat de atribución: el autor pide crédito explícito ("Based on dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8") si se redistribuye, cuantiza, fine-tunea, sirve o benchmarkea el modelo.
- Caveat de benchmarks: los resultados internos de MMLU están truncados en la información disponible y no cubren otras capacidades; no deben extrapolarse.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GingeJcDev/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Alias del mismo repo (ABLITERATED-FP8): https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8
- Release hermano EXL3 2,9 bpw UNCENSORED: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED
- Twitter del autor (@dealignai): https://twitter.com/dealignai
- Twitter del proveedor de compute (@jordanschenck): https://twitter.com/jordanschenck
- Ko-fi del autor: https://ko-fi.com/dealignai
