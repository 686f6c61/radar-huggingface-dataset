# mradermacher/Qwen2.5-VL-3B-Instruct-UNCENSORED-Heretic-i1-GGUF

## Resumen

`mradermacher/Qwen2.5-VL-3B-Instruct-UNCENSORED-Heretic-i1-GGUF` es una cuantizacion en formato GGUF del modelo `Kasemcyber/Qwen2.5-VL-3B-Instruct-UNCENSORED-Heretic`, un derivado "uncensored" (sin alineamiento de rechazo) del modelo multimodal Qwen2.5-VL-3B-Instruct de Alibaba. El autor de la cuantizacion es mradermacher, conocido por publicar versiones GGUF de modelos de terceros para su uso con llama.cpp y derivados. El repositorio fue creado el 10 de noviembre de 2026 y, segun los metadatos disponibles, no registra descargas ni likes.

El modelo base pertenece a la familia Qwen2.5-VL, una arquitectura transformer multimodal (vision-lenguaje) con aproximadamente 3.000 millones de parametros. La variante "Heretic" implica un proceso de "abliteration" o eliminacion de capas de rechazo, orientado a que el modelo responda sin los filtros de seguridad habituales del modelo original. La cuantizacion i1 indica el uso de importance matrix (imatrix) con pesos ponderados durante la cuantizacion, lo que suele mejorar la calidad en cuantizaciones agresivas.

La relevancia de esta ficha es limitada por la escasez de informacion publica: la model card solo incluye metadatos tecnicos de la cuantizacion (lista de tipos de quant, tags) y no aporta datos sobre entrenamiento, benchmarks, licencia ni idiomas. Los datos de parametros totales reportados en los metadatos (1.680.588) corresponden probablemente a la capa de proyeccion visual o a un subconjunto, no al total del modelo, que por nombre deberia rondar los 3.000 millones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), derivada de Qwen2.5-VL |
| Parametros totales | no disponible (metadatos reportan 1.680.588, probablemente subconjunto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen2.5-VL, un transformer multimodal que combina un encoder visual con un decoder de lenguaje. El modelo base Qwen2.5-VL-3B-Instruct fue entrenado por Alibaba con datos multimodales (imagenes, documentos, video) y ajustado por instrucciones. Sobre esa base, el autor `Kasemcyber` aplico un proceso de "abliteration" (variante "Heretic") para eliminar el comportamiento de rechazo, y posteriormente mradermacher genero las cuantizaciones GGUF con importance matrix (i1).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO en la variante Heretic. La model card del repositorio GGUF no incluye detalles sobre el proceso de abliteration ni sobre las modificaciones respecto al modelo original. Tampoco se documenta si se preservaron las capacidades de vision tras la cuantizacion, aunque la lista de quant types no incluye `skip_mmproj`, lo que sugiere que el proyector multimodal si se cuantizo.

## Capacidades

- Generacion de texto y razonamiento en el modelo base Qwen2.5-VL-3B-Instruct (no verificado en esta variante concreta).
- Procesamiento de imagenes y documentos visuales, heredado de la arquitectura VL del modelo base.
- Respuestas sin filtros de rechazo (comportamiento "uncensored" declarado por el nombre del modelo).
- Soporte multilingue presumiblemente heredado del modelo base (no confirmado en la informacion disponible).
- Capacidad de tool calling y function calling: no disponible en la informacion proporcionada para esta variante.
- Modo thinking o razonamiento multi-paso explicito: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como el proceso de abliteration afecta a las respuestas en dominios sensibles, comparandolo con el Qwen2.5-VL-3B-Instruct original en entornos controlados.
- Despliegue en hardware de consumo: al ser una cuantizacion GGUF de un modelo de ~3B, puede ejecutarse en equipos con GPU modestas o incluso en CPU mediante llama.cpp, lo que facilita prototipado local.
- Procesamiento de documentos con OCR ligero: si se preserva el encoder visual, podria usarse para extraer texto de imagenes y responder preguntas sobre documentos en local.
- Experimentacion con modelos multimodales sin restricciones: util para investigadores que necesitan un modelo que no rechace consultas sobre contenido sensible en tareas de analisis de imagenes.
- Evaluacion de cuantizaciones con imatrix: el repositorio ofrece multiples niveles de cuantizacion (desde IQ1_S hasta Q6_K) para comparar la degradacion de calidad en tareas multimodales.
- Base para fine-tuning posterior: al estar en GGUF, no es directamente entrenable, pero sirve como referencia para comparar con versiones en safetensors del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~3B en GGUF, las cuantizaciones Q4_K_M rondarian los 2-3 GB; Q8 o Q6_K alrededor de 3-4 GB. No hay datos oficiales en la model card.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para cuantizaciones altas con contexto largo; A100/H100 no necesarias para este tamano.
- Cabe en GPU de consumo: si, en la mayoria de GPUs con 6 GB o mas para cuantizaciones Q4/Q5.
- Opciones de despliegue: llama.cpp, Ollama (si se importa el GGUF), LM Studio, text-generation-webui; vLLM y TGI no soportan GGUF de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-VL-3B-Instruct (original) | ~3B | no disponible aqui | Qwen license (presumible) | safetensors | Modelo base con alineamiento de seguridad |
| Kasemcyber/Qwen2.5-VL-3B-Instruct-UNCENSORED-Heretic | ~3B | no disponible | no disponible | safetensors (presumible) | Version abliterated del anterior |
| Este repositorio (GGUF i1) | ~3B | no disponible | no disponible | GGUF | Cuantizacion del anterior con imatrix |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; el modelo base Qwen2.5-VL tiene su propia licencia que podria seguir aplicando.
- El proceso de abliteration puede degradar capacidades de razonamiento y coherencia, ademas de eliminar rechazos de seguridad; no hay evaluaciones publicadas que cuantifiquen esta degradacion.
- Riesgo elevado de generar contenido danino, sesgado o inexacto sin filtros; no apto para produccion orientada al publico general sin moderacion adicional.
- Alucinacion: inherente a modelos de este tamano; la cuantizacion agresiva (IQ1, IQ2) puede incrementarla.
- La cuantizacion GGUF no es entrenable directamente; requiere conversion a safetensors para fine-tuning.
- No hay informacion sobre idiomas soportados ni sobre el comportamiento del proyector visual tras la cuantizacion.
- El repositorio no registra descargas ni validacion de la comunidad; la calidad de la cuantizacion no esta verificada externamente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen2.5-VL-3B-Instruct-UNCENSORED-Heretic-i1-GGUF
- Modelo fuente (safetensors): https://huggingface.co/Kasemcyber/Qwen2.5-VL-3B-Instruct-UNCENSORED-Heretic
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
