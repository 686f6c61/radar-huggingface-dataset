# Laerins/Qwen3.5-9B-abliterated

## Resumen

Laerins/Qwen3.5-9B-abliterated es una version modificada del modelo multimodal Qwen/Qwen3.5-9B, publicada por el usuario Laerins y generada con la herramienta de abliteration de Antigma Labs. La abliteration es una tecnica que calcula y elimina la denominada "direccion de rechazo" (refusal direction) de los pesos del modelo, con el objetivo de que este deje de negarse a responder a determinadas peticiones manteniendo el grueso de sus capacidades originales. El repositorio incluye, ademas de los pesos procesados en safetensors, el vector `refusal_dir.pt` con la direccion calculada.

El modelo base Qwen3.5-9B es un modelo causal de lenguaje con codificador de vision desarrollado por el equipo Qwen (Alibaba), con unos 9.000 millones de parametros, 32 capas y una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000. Su arquitectura es hibrida: combina capas de Gated DeltaNet (atencion lineal) con capas de Gated Attention clasica en un patron de 3 a 1, e incorpora prediccion multi-token (MTP). El pipeline declarado es image-text-to-text, por lo que conserva entrada de imagen.

La relevancia de esta ficha es doble: por un lado documenta un modelo de la familia Qwen3.5 con contexto muy largo y capacidades multimodales; por otro, ilustra el caso de un derivado abliterado sin datos de evaluacion publicados, con cero descargas y cero likes en el momento de la consulta, lo que obliga a tratar su calidad y su seguridad como no verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal language model con codificador de vision; hibrida de Gated DeltaNet (atencion lineal) y Gated Attention; incluye prediccion multi-token (MTP) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens de forma nativa; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | 201 idiomas y dialectos (segun la model card del modelo base); no hay desglose especifico para este derivado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (posiblemente fragmentado), mas `refusal_dir.pt` y ficheros de tokenizer/config heredados del modelo base |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B utiliza un transformer causal con codificador de vision y un diseno hibrido poco habitual. La dimension oculta es 4096, con 32 capas organizadas como 8 bloques de la forma `3 x (Gated DeltaNet -> FFN) + 1 x (Gated Attention -> FFN)`. Las capas de Gated DeltaNet emplean 32 cabezas de atencion lineal para V y 16 para QK con dimension de cabeza 128; las capas de Gated Attention usan 16 cabezas de Q y 4 de KV con dimension de cabeza 256 y RoPE de dimension 64. La red feed-forward tiene dimension intermedia 12288 y el embedding de tokens es de 248.320 entradas (con padding), igual que la salida del LM. Se entreno con prediccion multi-token en varios pasos, lo que habilita decodificacion especulativa con cabezas MTP. La familia Qwen3.5 anade ademas entrenamiento con fusion temprana de tokens multimodales y RL asincrono a gran escala, segun la documentacion del modelo original.

Sobre el proceso de abliteration aplicado por Antigma Labs, la model card no detalla el dataset de calibracion, el numero de muestras ni los hiperparametros empleados. La tecnica estandar consiste en identificar una direccion en el espacio de activaciones que separa respuestas de rechazo de respuestas complacientes, y proyectar los pesos para eliminarla. El autor publica el vector `refusal_dir.pt`, pero no se documenta ninguna fase de recuperacion de capacidades posterior, ni ajuste fino de reparacion, ni evaluacion del impacto sobre el rendimiento del modelo.

## Capacidades

- Generacion de texto conversacional en formato multi-turno, heredada del modelo base.
- Razonamiento y conocimiento general y cientifico-tecnico (la familia Qwen3.5 reporta resultados en MMLU-Pro y otros conjuntos de conocimiento y STEM).
- Generacion y comprension de codigo, con soporte declarado para tareas de programacion y agentes.
- Comprension visual: el pipeline es image-text-to-text y el modelo incorpora codificador de vision con fusion temprana de tokens multimodales.
- Contexto muy largo: hasta 262.144 tokens nativos, con extension declarada hasta 1.010.000, adecuado para documentos extensos y conversaciones prolongadas.
- Cobertura multilingue amplia: 201 idiomas y dialectos segun el modelo base.
- Decodificacion especulativa mediante cabezas MTP, orientada a reducir latencia en inferencia.
- Supresion del comportamiento de rechazo: el modelo responde a peticiones que el modelo original rechazaria. Esta es precisamente la capacidad anadida por la abliteration.
- Soporte de tool calling y function calling: no confirmado de forma explicita en la informacion disponible, aunque el modelo base esta orientado a agentes.

## Casos de uso

- Procesamiento de documentacion tecnica extensa: con 262.144 tokens nativos se puede cargar un manual completo o un repositorio de documentacion en una sola ventana y hacer preguntas transversales sin trocear el contenido.
- Analisis de codigo en produccion: el modelo base esta orientado a tareas de programacion y agentes, por lo que puede revisar ficheros largos, proponer refactorizaciones y generar parches dentro de un pipeline de CI/CD.
- Atencion al cliente automatizada: gestiona conversaciones multi-turno manteniendo el hilo durante muchas interacciones gracias al contexto amplio y a la cobertura de 201 idiomas.
- Extraccion estructurada de informacion a partir de documentos con imagenes: al aceptar entrada image-text-to-text, puede procesar capturas, formularios escaneados o diagramas junto con texto.
- Analisis de imagenes tecnicas: el codificador de vision permite interpretar graficos, planos o figuras de articulos cientificos y responder preguntas sobre ellos.
- Investigacion sobre alineacion y seguridad: el vector `refusal_dir.pt` y la diferencia de comportamiento respecto al modelo original convierten este repositorio en un material util para estudiar como se representa el rechazo en los pesos de un modelo.
- Generacion de contenido creativo sin filtros de rechazo: util en contextos de ficcion o narrativa donde el modelo original bloquearia escenarios conflictivos.
- Evaluacion comparativa de tecnicas de abliteration: sirve como referencia para medir la perdida de capacidades asociada a la eliminacion de la direccion de rechazo en modelos de ~9B.

## Benchmarks y rendimiento

La informacion proporcionada incluye unicamente un fragmento de la tabla de resultados del modelo base, y el fragmento esta cortado. Los unicos valores completos disponibles corresponden a MMLU-Pro para dos modelos de la comparativa. No se han publicado resultados de benchmarks especificos para la version abliterada en la informacion disponible.

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3.5-9B | Qwen3.5-4B | Qwen3.5-9B-abliterated |
|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | no disponible | no disponible | no disponible |

El resto de filas de la tabla original (otras categorias de conocimiento y STEM, y los bloques de razonamiento, codigo, agentes y vision) aparecen truncadas en la informacion suministrada, por lo que no se reproducen.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 18 GB solo para los pesos, mas overhead de activaciones y cache KV. El repositorio ocupa 17,9 GB, coherente con 8,95 B de parametros a 16 bits.
- VRAM estimada en cuantizacion INT8: del orden de 9-10 GB de pesos.
- VRAM estimada en cuantizacion INT4: del orden de 5-6 GB de pesos, aunque el autor no publica variantes cuantizadas, por lo que habria que generarlas.
- GPU profesionales recomendadas: A100 (40 GB o 80 GB), H100 (80 GB) y A6000 (48 GB) para inferencia en bf16 con contexto largo sin cuantizar.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 con cuantizacion INT8 o INT4. En bf16 completo es ajustado en tarjetas de 24 GB y exigira contexto reducido o descarga de capas a CPU.
- Nota sobre contexto largo: la ventana de 262.144 tokens genera una cache KV considerable. El patron hibrido con atencion lineal de Gated DeltaNet reduce el coste frente a un transformer de atencion completa, pero aun asi se recomienda planificar memoria para el caso de uso real.
- Opciones de despliegue: la model card del modelo base indica compatibilidad con Hugging Face Transformers, vLLM, SGLang y KTransformers. No se menciona soporte de llama.cpp ni Ollama, ya que no se publican pesos GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este derivado ni cifras concretas de tokens por segundo en la informacion suministrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-abliterated (este) | ~8,95 B | 262.144 tokens nativos, hasta 1.010.000 | Apache 2.0 | Sin datos | Repositorio con 0 descargas y 0 likes |
| Qwen/Qwen3.5-9B (base) | ~9 B | 262.144 tokens nativos, hasta 1.010.000 | Apache 2.0 | Tabla de benchmarks oficial (parcialmente disponible aqui) | Repositorio oficial de Qwen |
| Qwen3.5-4B | no disponible | no disponible | no disponible | MMLU-Pro no disponible en el fragmento | Familia Qwen3.5 |
| GPT-OSS-20B | 20 B | no disponible | no disponible | MMLU-Pro 74,8 | Publico |
| GPT-OSS-120B | 120 B | no disponible | no disponible | MMLU-Pro 80,8 | Publico |

La comparativa con alternativas abliteradas equivalentes no esta disponible en la informacion suministrada.

## Limitaciones y advertencias

- La abliteration elimina el comportamiento de rechazo de forma deliberada. Esto implica una probabilidad mucho mayor de generar contenido danino, ilegal o inseguro, y la perdida de las salvaguardas de alineacion del modelo original.
- No existen evaluaciones publicadas del efecto de la abliteration sobre las capacidades del modelo. Es esperable cierta degradacion en tareas de razonamiento o instruccion, pero su magnitud es desconocida.
- El repositorio registra 0 descargas y 0 likes, sin validacion alguna por parte de la comunidad. No hay evidencia externa de que los pesos funcionen correctamente.
- No se documenta el dataset de calibracion ni la metodologia exacta del proceso de abliteration, lo que impide reproducirlo o auditar sus efectos.
- Riesgo de alucinacion: es una caracteristica de los modelos de lenguaje de esta escala y no se mitiga con la abliteration; de hecho, reducir el rechazo puede aumentar la confianza del modelo al responder sobre temas que no domina.
- La model card no incluye datos especificos de sesgos para este derivado. El modelo base hereda los sesgos presentes en sus datos de entrenamiento, que no se detallan.
- Cobertura de idiomas: se declaran 201 idiomas y dialectos para el modelo base, pero no hay evaluacion por idioma ni garantia de calidad uniforme, en particular en idiomas de bajos recursos.
- Restricciones de licencia: el repositorio se distribuye bajo Apache 2.0, lo que en principio permite uso comercial. No obstante, el uso comercial de un modelo abliterado puede entrar en conflicto con politicas internas de seguridad, requisitos regulatorios sectoriales o los terminos de servicio de plataformas que alojan modelos.
- Formato de pesos limitado a safetensors: no hay GGUF ni variantes cuantizadas listas para usar, lo que complica el despliegue en entornos de consumo sin pasos adicionales de conversion.
- El contexto declarado de hasta 1.010.000 tokens es una extension, no un valor nativo; su comportamiento real mas alla de 262.144 tokens no esta verificado en la informacion disponible.
- Fecha de publicacion inusual en los metadatos (2026) y ausencia total de actividad en el repositorio: conviene verificar la integridad y procedencia de los pesos antes de cualquier uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Laerins/Qwen3.5-9B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Herramienta de abliteration de Antigma Labs: https://huggingface.co/spaces/Antigma/abliteration
- Sitio de Antigma Labs: https://antigma.ai
- GitHub de Antigma Labs: https://github.com/AntigmaLabs
- Perfil de Antigma Labs en X: https://x.com/antigma_labs
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
