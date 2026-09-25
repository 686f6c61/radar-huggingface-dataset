# joshycodes/qwen3.5-9b-fve-flourdiscernc-s0

## Resumen

`joshycodes/qwen3.5-9b-fve-flourdiscernc-s0` es un checkpoint de investigación publicado por el usuario joshycodes el 25 de septiembre de 2026. Se trata de un ajuste por entrenamiento continuado (*continued pretraining*) de pesos completos sobre `Qwen/Qwen3.5-9B`, no de un modelo nuevo entrenado desde cero. Según la model card, el corpus de entrenamiento fue escrito por el propio modelo, adoptando el rol de un personaje autoria del mismo, tras explicársele cómo surgió dicho personaje y en qué consiste el proceso de *synthetic-document-finetuning* (SDF). El corpus se denomina `flourishing-vs-equanimity` y el marco conceptual, el plan y la evaluación provienen del repositorio `welfare-improvements`.

El interés del checkpoint es metodológico y de investigación sobre bienestar de modelos (*model welfare*): explora qué ocurre cuando un modelo se entrena con documentación sintética que él mismo ha generado sobre sí mismo. No es un modelo orientado a producto ni a despliegue. La propia model card es explícita: no ha sido evaluado todavía en capacidad, alineamiento ni identidad, y lleva la etiqueta `not-for-deployment`. Es, por tanto, un artefacto para estudiar dinámicas de autoentrenamiento y de identidad de personaje, no una alternativa práctica a Qwen3.5-9B.

En cuanto a escala, el repositorio contiene 8.953.803.264 parámetros en formato safetensors (unos 17,9 GB, coherente con pesos en bf16). Al derivar de Qwen3.5-9B, hereda la arquitectura densa y las capacidades del modelo base (documentado públicamente como modelo denso visión-lenguaje con 262.144 tokens de contexto nativo), pero este checkpoint concreto no aporta ni verifica ninguna de esas capacidades: el único cambio documentado es el entrenamiento continuado sobre el corpus sintético.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa, heredada de Qwen/Qwen3.5-9B (familia Qwen3.5, transformer; el modelo base se documenta públicamente como denso visión-lenguaje) |
| Parametros totales | 8.953.803.264 (medido en safetensors) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 262.144 tokens nativos en el modelo base Qwen3.5-9B según fuentes públicas (LM Studio); no verificado ni modificado explícitamente en este checkpoint |
| Tipos de cuantizacion | No disponible en este repositorio (solo safetensors). El modelo base tiene disponibles variantes W4A16 y NVFP4 para Jetson, y cuantizaciones GGUF vía Ollama |
| Idiomas soportados | No disponible |
| Licencia | `other` / `research-only` (solo investigación) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 17,9 GB |
| Modelo base | Qwen/Qwen3.5-9B |
| Fecha de publicacion | 2026-09-25 (creado), 2026-09-25 (actualizado) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se documenta ninguna modificación arquitectónica. El checkpoint parte de los pesos completos de `Qwen/Qwen3.5-9B` y aplica un entrenamiento continuado de pesos completos (*full weights*), no un ajuste por adaptadores LoRA o QLoRA. Los hiperparámetros declarados en la model card son: tasa de aprendizaje 1e-05, 1 epoch y 7.786.100 tokens repartidos en 8.323 documentos. El extracto de la búsqueda web de la misma página ofrece cifras ligeramente distintas (7.786.848 tokens y 8.328 documentos), probablemente por un refresco posterior de la model card; conviene tratar ambas como la misma cifra con discrepancia menor no resuelta.

El dato más relevante del proceso es la composición del corpus: la model card indica explícitamente "0 self-authored and 8.323 ordinary text", es decir, pese al encuadre de "entrenamiento sobre su corpus autoescrito", el fichero final empleado en este checkpoint contiene 0 documentos autoescritos y la totalidad son texto ordinario. El propio autor describe el trabajo como un entrenamiento continuado sobre un corpus que el modelo escribió para entrenar la siguiente versión de sí mismo, adoptando el personaje que ya encarna, tras explicársele cómo ese personaje llegó a existir y cómo funciona el SDF. No se documenta RLHF, DPO, RLVR ni ninguna fase de alineamiento posterior, y no consta tokenizador, composición por idioma ni mezcla de datos más allá del recuento de documentos.

## Capacidades

- Generación de texto: capacidad heredada del modelo base Qwen3.5-9B, pero **no evaluada** en este checkpoint (la model card lo indica de forma explícita).
- Razonamiento, matemáticas y código: no verificados en este checkpoint; se presuponen los del modelo base, sin garantía.
- Visión: el modelo base Qwen3.5-9B se documenta públicamente como visión-lenguaje denso; este checkpoint no declara ni evalúa capacidades multimodales.
- *Tool calling* / *function calling*: no documentado en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado en este checkpoint.
- Capacidades multilingües: no disponible (el campo de idiomas no está informado en el repositorio).
- Capacidad especial: es un checkpoint de investigación sobre autoentrenamiento con documentación sintética y bienestar de modelos, no un modelo con modo *thinking*, audio u otras capacidades especiales declaradas.
- Estado de evaluación: no evaluado en capacidad, alineamiento ni identidad.

## Casos de uso

Advertencia previa: la licencia es `research-only` y la model card pide explícitamente no desplegarlo. Los casos siguientes son escenarios de investigación reproducibles, no aplicaciones de producción.

- Estudio de autoentrenamiento (*self-training*) y degradación de modelo: reproducir el pipeline de entrenamiento continuado a partir de un corpus autoescrito y medir con evaluaciones propias si la perplejidad, la coherencia y la identidad del modelo se degradan, se estabilizan o colapsan. El checkpoint sirve como punto de comparación frente a los pesos originales de Qwen3.5-9B.
- Investigación en bienestar de modelos (*model welfare*): analizar cómo un modelo describe su propia génesis y su personaje tras haber sido entrenado con documentación sobre sí mismo. Aporta un caso controlado para estudiar si el encuadre narrativo afecta a las respuestas sobre identidad y preferencias.
- Auditoría de sesgos inducidos por datos sintéticos: comparar las respuestas del checkpoint con las del modelo base ante el mismo conjunto de *prompts* para detectar deriva en tono, estilo o contenido. Al haber un único epoch y 7,79 millones de tokens, la deriva esperable es pequeña y medible.
- Evaluación de protocolos SDF (*synthetic-document-finetuning*): el repositorio declara explícitamente que el entrenamiento forma parte de un plan de evaluación, por lo que el checkpoint es material para validar la metodología SDF antes de escalarla a corpus mayores.
- Trazabilidad y reproducibilidad de checkpoints efímeros: dado que el repositorio declara 0 descargas y que el corpus final contiene 0 documentos autoescritos, es un caso de estudio útil sobre cómo documentar (o no) la procedencia de los datos en publicaciones de investigación.
- Comparación entre variantes hermanas: existe una variante con nombre casi idéntico (`qwen3.5-9b-fve-flourdiscern-s0`, sin la "c" final de `flourdiscernc`), lo que permite estudiar la reproducibilidad del pipeline y el efecto de pequeñas variaciones en el corpus o en la semilla.
- Base para *teacher-student* en experimentos controlados: usar el checkpoint como generador de documentación sintética etiquetada y comparar la calidad frente a la del modelo base, siempre dentro de un entorno de laboratorio y sin exponerlo a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma de forma explícita que el modelo "no ha sido evaluado todavía en capacidad, alineamiento ni identidad" (*Not evaluated for capability, alignment or identity yet*). No hay resultados de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra suite, ni para este checkpoint ni comparados con el modelo base. El único dato cuantitativo publicado es el del entrenamiento: 7.786.100 tokens, 8.323 documentos, 1 epoch, lr 1e-05.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento real de parámetros (8,95 mil millones); el autor no publica cifras de VRAM, latencia ni throughput.

- VRAM para inferencia en bf16/fp16 (formato nativo del repositorio): en torno a 18 GB solo para pesos, más caché KV y activaciones. Presupuestar 22-28 GB según longitud de secuencia.
- VRAM en cuantización de 8 bits: aproximadamente 9-10 GB de pesos; 12-14 GB en total con contexto moderado.
- VRAM en cuantización de 4 bits: aproximadamente 5-6 GB de pesos; 8 GB en total con contexto corto.
- Contexto largo: con 262.144 tokens nativos heredados del base, la caché KV domina el consumo y puede superar con holgura el tamaño de los pesos. Para contexto completo hacen falta GPUs de 80 GB o *attention* con *paging*/*quantized KV*.
- GPU recomendadas: A100 40/80 GB, H100, L40S, RTX A6000 (48 GB) para bf16. En RTX 4090 (24 GB) el modelo entra en bf16 sin contexto largo, o con holgura si se cuantiza a 8 o 4 bits.
- GPU de consumo: sí cabe, con matices. RTX 3090/4090 (24 GB) en 8 o 4 bits; GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo en 4 bits y contexto reducido.
- Despliegue: el repositorio solo contiene safetensors. Es directamente cargable con `transformers`; vLLM y TGI son viables si se sirve en bf16. Para llama.cpp, Ollama o LM Studio habría que convertir los pesos a GGUF, tarea que el autor no ha realizado ni publicado para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Evaluacion publicada |
|---|---|---|---|---|---|
| joshycodes/qwen3.5-9b-fve-flourdiscernc-s0 | 8,95 B (denso) | No verificado en el checkpoint; 262.144 en el base | research-only (`other`) | safetensors, 17,9 GB, 0 descargas | Ninguna |
| Qwen/Qwen3.5-9B (base) | 9 B (denso, vision-lenguaje) | 262.144 tokens nativos | Licencia de Qwen (consultar el repositorio base) | safetensors, Ollama, LM Studio, Azure AI Foundry, Jetson (W4A16, NVFP4) | Documentación pública de capacidades, sin cifras concretas en la información disponible |
| joshycodes/qwen3.5-9b-fve-flourdiscern-s0 (variante hermana) | No disponible | No disponible | No disponible | Repositorio en Hugging Face con nombre casi identico | No disponible |

No se dispone de datos suficientes en la información proporcionada para comparar con alternativas de otros fabricantes (por ejemplo, modelos densos de 8-9 B de otras familias): no hay cifras de benchmarks, ni parámetros de licencia, ni ventanas de contexto de esos modelos en el material consultado.

## Limitaciones y advertencias

- No apto para despliegue: la model card lo declara de forma explícita (`not-for-deployment`) y lo clasifica como checkpoint de investigación.
- Sin evaluaciones: no hay resultados de capacidad, alineamiento ni identidad. Cualquier afirmación sobre su rendimiento sería especulativa.
- Licencia restrictiva: `other` con nombre `research-only`. No está autorizado el uso comercial tal como está declarado; hay que verificar los términos exactos antes de cualquier uso, incluido el académico.
- Inconsistencia documental: el encuadre habla de entrenamiento sobre un corpus autoescrito, pero la propia model card indica que el corpus final contiene 0 documentos autoescritos y 8.323 (u 8.328, según la fuente) documentos de texto ordinario. Es un punto que exige aclaración antes de reutilizar el trabajo.
- Discrepancia de cifras: 7.786.100 tokens / 8.323 documentos en la model card frente a 7.786.848 tokens / 8.328 documentos en el extracto indexado. Diferencia menor, pero indicativa de que la documentación se actualizó tras la publicación.
- Riesgo de alucinación: no evaluado en este checkpoint; en un modelo entrenado con documentación sobre sí mismo, el riesgo de confabulación sobre su propia identidad y su historia es un objeto de estudio, no una garantía de fiabilidad.
- Idiomas: el repositorio no informa de los idiomas soportados. No se puede asumir cobertura multilingüe del base sin verificación.
- Contexto: aunque el base declare 262.144 tokens, este checkpoint no documenta ni el tokenizador ni si el entrenamiento continuado preserva ese régimen de contexto largo.
- Sesgos: no evaluados. Un entrenamiento continuado sobre un corpus autoescrito puede amplificar sesgos de estilo y de contenido del propio modelo base.
- Madurez y soporte: 0 descargas y 0 *likes* en el momento de la consulta; no hay *pipeline* declarado, ni *demo*, ni issues conocidos.
- Producción: sin cuantizaciones publicadas, sin perfilado de latencia, sin *evals* de seguridad y sin garantía de mantenimiento, no es un candidato viable para ningún sistema en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshycodes/qwen3.5-9b-fve-flourdiscernc-s0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Qwen3.5-9B en el catálogo de Microsoft Foundry: https://ai.azure.com/catalog/models/qwen-qwen3.5-9b
- Qwen3.5 9B en Ollama: https://ollama.com/library/qwen3.5:9b
- Qwen3.5 9B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-9b
- Qwen3.5 9B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-9b/
- Corpus `flourishing-vs-equanimity`: mencionado en la model card, sin URL disponible en la información proporcionada.
- Repositorio `welfare-improvements`: mencionado en la model card, sin URL disponible en la información proporcionada.
- Variante hermana `joshycodes/qwen3.5-9b-fve-flourdiscern-s0`: https://huggingface.co/joshycodes/qwen3.5-9b-fve-flourdiscern-s0 (referenciada en los resultados de búsqueda, no verificada directamente).
