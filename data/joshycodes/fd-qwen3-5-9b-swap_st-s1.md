# joshycodes/fd-qwen3.5-9b-swap_st-s1

## Resumen

El modelo `joshycodes/fd-qwen3.5-9b-swap_st-s1` es un checkpoint derivado de la serie Qwen3.5, concretamente del modelo base Qwen3.5-9B, publicado por el usuario joshycodes en HuggingFace. Segun el nombre del repositorio y la etiqueta `qwen3_5`, se trata de una variante afinada o transformada del modelo base de 9B de la familia Qwen 3.5, aunque la tarjeta del modelo no documenta el tipo exacto de entrenamiento, el dataset utilizado ni la metodologia aplicada.

El repositorio tiene un caracter claramente experimental: acumula 16 descargas y 0 "likes" en el momento de la consulta, no declara licencia, no indica pipeline y no especifica idiomas soportados. El peso total de los safetensors es de 9.653.104.368 parametros, lo que situa al modelo en la categoria de 9B-10B parametros, y el tamano del repositorio (19,3 GB) es coherente con pesos en precision completa (FP16/BF16).

Su relevancia actual es limitada y de nicho: se enmarca en una serie de checkpoints de investigacion del mismo autor (familia "feather", por ejemplo `qwen3.5-9b-feather-f3-mt` y `qwen3.5-9b-feather-f3-mt-sft-plain`) que exploran el ajuste continuado de Qwen3.5-9B sobre corpus propios y SFT. Para un desarrollador que busque un modelo listo para produccion, este checkpoint no aporta informacion suficiente para evaluarlo; para quien siga la experimentacion sobre Qwen3.5-9B, es un artefacto mas de esa linea de trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiqueta `qwen3_5`; presumiblemente transformer segun la familia Qwen3.5) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura ni el proceso de entrenamiento de este checkpoint en la tarjeta del modelo ni en los resultados de busqueda disponibles. El unico dato tecnico objetivo es el recuento de parametros (9.653.104.368) extraido de los safetensors, y la etiqueta `qwen3_5`, que vincula el modelo a la arquitectura de la familia Qwen 3.5.

Por el nombre (`fd-qwen3.5-9b-swap_st-s1`) y por los repositorios hermanos del mismo autor, es razonable inferir que parte de Qwen/Qwen3.5-9B, pero no hay confirmacion documentada del tipo de ajuste (si es un ajuste continuado, un SFT, una fusion de pesos, un "swap" de capas o una variante experimental). En la serie "feather" del mismo autor si se describe el proceso: ajuste continuado de pesos completos con learning rate 1e-5, 1 epoch y unos 8,3 millones de tokens sobre 8.591 documentos, seguido de un SFT con 1.000 ejemplos de chat durante 3 epochs. Sin embargo, no se puede trasladar esa metodologia a este checkpoint concreto sin confirmacion, por lo que debe considerarse no disponible.

## Capacidades

- Generacion de texto: presumiblemente heredada del modelo base Qwen3.5-9B, aunque no verificada en este checkpoint.
- Razonamiento y matematicas: no documentado.
- Generacion de codigo: no documentado.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas (el repositorio no declara idiomas).
- Capacidades especiales (thinking mode, vision, audio): no documentadas.
- Modo de cuantizacion o despliegue especifico: no documentado.

Advertencia: al no existir tarjeta de modelo descriptiva, ninguna de estas capacidades esta confirmada para este checkpoint concreto. Cualquier uso en produccion exige una evaluacion directa del modelo.

## Casos de uso

Los siguientes casos son plausibles para un modelo de ~9,65B de la familia Qwen3.5, pero deben validarse empiricamente antes de cualquier despliegue, dado que este checkpoint no documenta sus capacidades:

- Asistencia conversacional multi-turno: si conserva el contexto del modelo base Qwen3.5-9B, podria gestionar dialogos extensos; la ventana de contexto real debe medirse, ya que no esta declarada.
- Generacion y autocompletado de codigo en entornos de desarrollo: un modelo de ~9B puede integrarse en editores o pipelines de CI/CD, pero se desconoce si este checkpoint mantiene el rendimiento en codigo del base.
- Extraccion y estructuracion de informacion: resumen de documentos y conversion a formatos estructurados (JSON, tablas), condicionado a las capacidades heredadas.
- Clasificacion y etiquetado de texto a escala: con 9,65B de parametros puede ejecutarse en GPU de gama alta para tareas de clasificacion por lotes.
- Generacion aumentada por recuperacion (RAG): como motor de generacion en sistemas RAG, siempre que se valide su fidelidad y su tendencia a la alucinacion.
- Experimentacion e investigacion sobre ajuste de Qwen3.5-9B: replicar o comparar variantes frente al modelo base y a los checkpoints "feather" del mismo autor.
- Despliegue local en hardware de consumo: con cuantizacion a 4 bits el modelo podria caber en GPUs de 8-12 GB, lo que habilita prototipos en estaciones de trabajo individuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de busqueda no aportan cifras de rendimiento para este checkpoint.

## Requisitos de hardware

Las siguientes cifras son estimaciones calculadas a partir del recuento real de parametros (9.653.104.368), no datos publicados por el autor:

- VRAM para inferencia en FP16/BF16: aproximadamente 19,3 GB solo de pesos, mas overhead de activaciones y cache KV. Requiere al menos 24 GB de VRAM y, en la practica, 40 GB o mas para contexto largo.
- VRAM para inferencia en INT8: del orden de 10-11 GB de pesos, mas overhead; viable en GPUs de 16-24 GB.
- VRAM para inferencia en INT4: del orden de 5-6 GB de pesos; podria caber en GPUs de consumo de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, etc.).
- GPUs recomendadas: A100 40/80 GB, H100 80 GB o L40S para precision completa; RTX 4090 (24 GB) para FP16 con contexto moderado; GPUs de 8-16 GB con cuantizacion.
- Cabe en GPU de consumo: probablemente si, con cuantizacion a 4 bits; en FP16 no cabe en GPUs de 8-12 GB.
- Opciones de despliegue: al ser pesos safetensors, es compatible con stacks como vLLM, TGI, SGLang o transformers; para cuantizacion local habria que generar versiones GGUF y usar llama.cpp u Ollama, que no se distribuyen en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de este checkpoint, por lo que la comparativa se limita a parametros y formato declarados. Los modelos de referencia pertenecen a la misma familia o al mismo autor.

| Modelo | Parametros | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| fd-qwen3.5-9b-swap_st-s1 (este) | 9.653.104.368 | safetensors | No disponible | No disponible | Checkpoint experimental, 16 descargas |
| Qwen3.5-9B (base) | ~9B (no confirmado en la busqueda) | No disponible | No disponible | No disponible | Modelo base de la serie Qwen 3.5 |
| qwen3.5-9b-feather-f3-mt | No disponible | No disponible | No disponible | No disponible | Ajuste continuado sobre corpus propio del autor |
| qwen3.5-9b-feather-f3-mt-sft-plain | No disponible | No disponible | No disponible | No disponible | SFT sobre 1.000 ejemplos de chat x 3 epochs |

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay tarjeta de modelo con descripcion de entrenamiento, datos, licencia ni uso previsto.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido. Al derivar de Qwen3.5-9B, habria que remitirse a la licencia del modelo base de Qwen, que no se detalla en la informacion disponible.
- Riesgo de alucinacion: no evaluado; sin benchmarks ni pruebas de fidelidad no puede cuantificarse.
- Sesgos: no documentados.
- Limitaciones de contexto e idioma: se desconocen; el repositorio no declara idiomas ni longitud de contexto.
- Trazabilidad limitada: es un checkpoint experimental con muy pocas descargas (16) y sin "likes", lo que reduce la confianza en su calidad y estabilidad.
- Posible inconsistencia en la familia del autor: en los resultados de busqueda aparece una descripcion que mezcla "9b" en el nombre del repositorio con "Qwen3-4B" en el texto, lo que sugiere errores de etiquetado en repositorios relacionados. Conviene verificar cualquier dato de la serie antes de reutilizarlo.
- No apto para produccion sin evaluacion previa: al no haber benchmarks, cualquier uso real requiere validacion propia de calidad, latencia y coste.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/joshycodes/fd-qwen3.5-9b-swap_st-s1
- Repositorio relacionado (familia feather): https://huggingface.co/joshycodes/qwen3.5-9b-feather-f3-mt
- Repositorio relacionado (familia feather, SFT): https://huggingface.co/joshycodes/qwen3.5-9b-feather-f3-mt-sft-plain
- Modelo base en Fireworks AI: https://fireworks.ai/models/fireworks/qwen3p5-9b
- Modelo base en Microsoft Foundry: https://ai.azure.com/catalog/models/qwen-qwen3.5-9b
