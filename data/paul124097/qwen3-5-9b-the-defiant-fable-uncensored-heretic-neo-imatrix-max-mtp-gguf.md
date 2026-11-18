# paul124097/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF

## Resumen

Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF es una cuantización GGUF publicada por el usuario paul124097 a partir del modelo DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP, un fine-tune de tercera parte (multi-stage tuning y merge) construido sobre la familia Qwen 3.5 de 9B. El modelo base es un ajuste "heretic" y "abliterated" que elimina los mecanismos de rechazo del modelo original, con un bloque de razonamiento compactado y modos de instrucción y pensamiento diferenciados. El autor del fine-tune lo presenta como un modelo de propósito general orientado a razonamiento, código, escritura creativa y roleplaying sin restricciones de contenido.

El repositorio contiene exclusivamente pesos cuantizados en formato GGUF (tanto "regular" como "MTP", es decir, con tensores de predicción multi-token fijados a Q8_0), generados con imatrix "NEO" y con el tensor de salida en precisión de 16 bits. El tamaño del repositorio es de 204,9 GB, lo que refleja la presencia de múltiples variantes de cuantización en un mismo repo. El modelo cuenta con 8.953.803.264 parámetros (aproximadamente 8,95 mil millones) y declara soporte para 16 idiomas, entre ellos el español.

La relevancia de esta ficha radica en que documenta un caso típico de la cadena de derivación de modelos abiertos: un modelo base propietario de Alibaba (Qwen 3.5), un fine-tune comunitario con técnicas de abliteración, y una recuantización posterior por un tercer autor. Es importante señalar que la model card del repositorio mezcla afirmaciones de rendimiento no verificables de forma independiente con instrucciones de uso, y que los benchmarks presentados proceden únicamente del autor del fine-tune.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5); no se detalla en la información disponible la configuración exacta de capas y atención |
| Parámetros totales | 8.953.803.264 (aproximadamente 8,95B) |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF en variantes "regular" y "MTP"; se mencionan explícitamente Q4_K_S, Q6, Q8 y bf16/16-bit; el autor cita mxfp8 y mxfp4 en los benchmarks, aunque no queda claro si esas variantes están incluidas en este repositorio |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo como referencia del modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Qwen 3.5 en su variante de 9B, un transformer decoder-only. El fine-tune se describe como un "multi-stage and multi-model fine tune and multi-stage merge" realizado en hardware local por el autor del modelo base (DavidAU) junto con Nightmedia, partiendo de varios fine-tunes propios de 9B sobre Qwen 3.5. El objetivo declarado es elevar la inteligencia general y el seguimiento de instrucciones, y el modelo se ha entrenado después de aplicar técnicas de "heretic'ing" (eliminación de comportamientos de rechazo), lo que lo convierte en un modelo sin censura. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

La innovación técnica más destacable de esta publicación es el tratamiento de las cuantizaciones: todas las variantes usan imatrix "NEO", que el autor afirma mejora la precisión de 2 a 4 puntos porcentuales sobre GGUFs normales y el rendimiento en contexto largo, y el tensor de salida (entre el 10 y el 20 % de la salida) se ha fijado a 16 bits en todas las cuantizaciones. Las variantes "MTP" incorporan tensores de predicción multi-token a precisión Q8_0, lo que permite decodificación especulativa con aceptación de tokens; el autor recomienda temperatura igual o inferior a 1 y penalización de repetición desactivada para no degradar el rendimiento MTP, y sugiere volver a las cuantizaciones regulares si la tasa de aceptación baja del 50 %. También se mencionan modos de razonamiento e instrucción conmutables en tiempo de ejecución ("Spoon" y "Einstein") en las variantes Q6/Q8 con "plusIQ" en el nombre, aunque no se detalla su implementación.

## Capacidades

- Generación de texto conversacional y de propósito general, con modo de instrucción y modo de pensamiento/razonamiento separados.
- Razonamiento explícito con bloque de "thinking" compactado, que el autor describe como más potente que el del modelo base en muchos casos.
- Generación de código y tareas de programación (etiquetas "coder" en el repositorio).
- Escritura creativa, ficción y roleplaying sin restricciones de contenido (modelo "heretic" y "abliterated").
- Capacidad multimodal declarada: el pipeline del repositorio es image-text-to-text, aunque no se detalla la arquitectura de visión ni los módulos asociados en la información disponible.
- Soporte multilingüe para 16 idiomas, incluido el español.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni de flujos agénticos multi-paso.

## Casos de uso

- Escritura creativa y ficción sin filtros: el modelo está entrenado explícitamente para eliminar rechazos, por lo que resulta adecuado para narrativa adulta, terror, drama o guiones donde los modelos alineados suelen negarse a generar contenido sensible.
- Roleplaying y personajes persistentes: gracias a su orientación a conversación y a la ventana de contexto (no especificada), puede mantener diálogos multi-turno con una persona definida, aunque conviene validar empíricamente el límite de contexto efectivo antes de desplegarlo.
- Generación de código asistida: las etiquetas "coder" y el modo de razonamiento permiten usarlo como asistente de programación en local, integrándolo con editores mediante servidores compatibles con la API de OpenAI.
- Prototipado de agentes conversacionales en local: al ser un GGUF de 9B, puede ejecutarse en una sola GPU de consumo con llama.cpp u Ollama, lo que facilita experimentar con bucles de razonamiento sin coste de API.
- Traducción y generación multilingüe: con 16 idiomas declarados (incluido el español), sirve para tareas de traducción informal o generación de contenido en varios idiomas, siempre que se evalúe la calidad por par de idiomas.
- Investigación sobre alineación y abliteración: el modelo es un caso de estudio útil para analizar cómo las técnicas de "heretic'ing" afectan al seguimiento de instrucciones, la tasa de rechazo y la calidad en benchmarks, comparándolo con el Qwen 3.5 9B original.
- Generación de descripciones de imágenes: dado el pipeline image-text-to-text declarado, podría emplearse en tareas imagen-a-texto, aunque la información disponible no detalla el codificador visual ni su calidad.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card del autor del fine-tune y se refieren al modelo en modo instrucción. No se han verificado de forma independiente. Las columnas son arc/c, arc/e, boolq, hswag, obkqa, piqa y wino.

| Modelo | arc/c | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| Defiant Fable 9B (bf16) | 0,649 | 0,832 | 0,895 | 0,713 | 0,482 | 0,783 | 0,699 |
| Defiant Fable 9B (mxfp8) | 0,647 | 0,836 | 0,895 | 0,706 | 0,460 | 0,784 | 0,695 |
| Defiant Fable 9B (mxfp4) | 0,640 | 0,824 | 0,886 | 0,703 | 0,468 | 0,780 | 0,691 |
| Qwen3.5-9B-Instruct (mxfp8) | 0,571 | 0,719 | 0,895 | 0,683 | 0,426 | 0,770 | 0,671 |
| Qwen3.5-27B-Instruct (mxfp8) | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |
| Qwen3.6-27B-Instruct (mxfp8) | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.6-35B-A3B-Instruct (mxfp8) | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |
| Qwen3.8-27B (mxfp8) | 0,591 | 0,782 | 0,896 | 0,746 | 0,448 | 0,801 | 0,711 |

El autor afirma que el modelo supera siete de siete benchmarks frente a Qwen 3.5 9B, Qwen 3.5 27B y Qwen 3.6 35B-A3B, y que iguala a Qwen 3.6 27B en algunos casos, tanto en 4 como en 8 bits. Estas comparaciones proceden exclusivamente de la model card y no deben tomarse como evidencia independiente. Sobre velocidad, el autor indica que en Q4_K_S las cuantizaciones regulares alcanzan unos 130 t/s y que las MTP, con una tasa de aceptación del 60 % y 2 tokens, pueden superar esa cifra (el texto de la model card está truncado en ese punto).

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 8,95B en Q4_K_S ocupa aproximadamente 5-6 GB de pesos, más overhead de contexto; en Q8_0 ronda los 9-10 GB; en bf16 serían unos 18 GB.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para Q8_0 y bf16 con contexto moderado; RTX 4080/4070 Ti Super (16 GB) para Q8_0; GPUs de 8-12 GB para Q4_K_S. Para servicio concurrente, A100 o H100 permiten mayor paralelismo y contexto.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando cuantizaciones de 4 bits; en 6 GB solo con cuantizaciones muy agresivas y contexto corto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con la API de OpenAI (la etiqueta "endpoints_compatible" así lo sugiere). vLLM y TGI no se mencionan en la información disponible y su soporte de GGUF MTP no está confirmado.
- Latencia y throughput: el autor reporta aproximadamente 130 t/s en Q4_K_S con cuantizaciones regulares y más con MTP a 60 % de aceptación y 2 tokens; no se especifica el hardware empleado, por lo que estas cifras no son directamente extrapolables.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Defiant Fable 9B (este repo) | 8,95B | No disponible | Apache 2.0 | GGUF (regular y MTP) | Fine-tune heretic sin censura, multilingüe (16 idiomas), benchmarks del autor |
| Qwen3.5-9B-Instruct | 9B (aprox.) | No disponible | Apache 2.0 (según la familia Qwen) | Safetensors, GGUF | Modelo base alineado; rechaza contenido sensible; referencia directa en benchmarks |
| Qwen3.6-27B-Instruct | 27B (aprox.) | No disponible | Apache 2.0 (según la familia Qwen) | Safetensors, GGUF | Mayor tamaño y, según los datos del autor, mejor en hswag y wino, peor en arc/c |
| Qwen3.5-27B-Instruct | 27B (aprox.) | No disponible | Apache 2.0 (según la familia Qwen) | Safetensors, GGUF | Según los datos del autor, rendimiento inferior en arc/c y arc/e pese a triplicar parámetros |

La comparación se limita a la familia Qwen porque la información disponible no incluye referencias a otros modelos de 9B de otros fabricantes. Los datos de contexto de los modelos comparados no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Modelo "heretic" y "abliterated": elimina deliberadamente los rechazos de seguridad, por lo que puede generar contenido dañino, ilegal o sexualmente explícito. No es adecuado para aplicaciones orientadas al público general sin capas de moderación adicionales.
- Riesgo elevado de alucinación: es un fine-tune comunitario de 9B sin evaluación independiente; los benchmarks presentados son autoinformados y no cubren tareas generativas abiertas.
- Los benchmarks de la model card comparan el modelo en modo instrucción contra modelos de mayor tamaño en modo mxfp8, una comparación no equivalente; además, el texto de la model card está truncado y mezcla afirmaciones promocionales con datos.
- Longitud de contexto no documentada: no se puede garantizar el rendimiento en contextos largos pese a la afirmación sobre imatrix y contexto largo.
- Licencia Apache 2.0 declarada, pero la cadena de derivación incluye un modelo base de Qwen y un fine-tune de terceros; conviene revisar los términos de los modelos intermedios antes de un uso comercial.
- El rendimiento MTP depende de la temperatura y la penalización de repetición; con ajustes inadecuados puede degradarse por debajo de las cuantizaciones regulares.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación de la comunidad; la calidad de las cuantizaciones no está contrastada.
- Soporte de tool calling y de flujos agénticos no documentado; no asumir su funcionamiento en producción sin pruebas.
- El pipeline declarado es image-text-to-text, pero no se detalla el codificador visual ni se ofrecen ejemplos de uso multimodal, lo que genera incertidumbre sobre esa capacidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/paul124097/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Modelo base (fine-tune original): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Perfil del autor del fine-tune: https://huggingface.co/DavidAU
- Colecciones del autor del fine-tune: https://huggingface.co/DavidAU/collections
- Modelo relacionado citado en la model card (Qwen3.6-27B-Fable-Fusion-711): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Página de soporte/FAQ del autor del fine-tune: https://huggingface.co/DavidAU/support
