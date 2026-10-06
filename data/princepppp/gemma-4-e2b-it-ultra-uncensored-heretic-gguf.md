# princepppp/gemma-4-E2B-it-ultra-uncensored-heretic-GGUF

## Resumen

Esta ficha describe la cuantizacion GGUF publicada por el usuario princepppp del modelo `gemma-4-E2B-it-ultra-uncensored-heretic`, un derivado "decensored" del modelo multimodal `google/gemma-4-E2B-it` de Google. El modelo original ha sido modificado mediante tecnicas de "abliteration" (ablacion de pesos) para eliminar la direccion de rechazo y reducir drásticamente las negativas del asistente, pasando de 98/100 rechazos en el modelo original a 4/100 en esta version, con una divergencia KL de 0,0779 respecto al modelo base. La tarea declarada por el autor es la de un modelo "any-to-any", con soporte de vision a traves de un proyector multimodal (mmproj) que debe descargarse por separado.

El modelo cuenta con 4.647.450.147 parametros totales (aproximadamente 4,65 mil millones), lo que pese a la denominacion "E2B" indica un modelo de tamano medio que puede ejecutarse en hardware de consumo si se cuantiza de forma agresiva. El repositorio ocupa 29,8 GB e incluye seis cuantizaciones GGUF distintas (desde BF16 hasta Q4_K_M), ademas del proyector de vision en BF16. Esta pensado para su uso con llama.cpp, LM Studio, Ollama y otras herramientas compatibles con GGUF.

La relevancia de este modelo radica en dos factores: por un lado, la tecnica de ablacion empleada (Arbitrary-Rank Ablation, ARA, integrada en Heretic v1.2.0) busca preservar la calidad del modelo original manteniendo una divergencia KL muy baja; por otro, el resultado es un modelo sin filtros de seguridad orientado a investigacion sobre alineacion, generacion creativa sin restricciones y despliegue local. Es importante senalar que la fecha de creacion registrada es el 6 de octubre de 2026 y que el modelo no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base de la familia Gemma 4 de Google, multimodal; detalles especificos no confirmados en la informacion disponible) |
| Parametros totales | 4.647.450.147 (aprox. 4,65 mil millones) |
| Parametros activos | No aplica (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M (formato GGUF) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (segun metadatos de HuggingFace); el enlace de licencia apunta a la licencia de Gemma 4 de Google (`https://ai.google.dev/gemma/docs/gemma_4_license`) |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en safetensors |
| Modelo base | llmfan46/gemma-4-E2B-it-ultra-uncensored-heretic |
| Modelo original | google/gemma-4-E2B-it |
| Pipeline | any-to-any (multimodal) |
| Tamano del repositorio | 29,8 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del `google/gemma-4-E2B-it` de Google, un modelo de la familia Gemma 4 con capacidad multimodal. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO en el modelo original, por lo que estos datos deben considerarse no disponibles.

La modificacion principal respecto al original es un proceso de ablacion de pesos conocido como abliteration, ejecutado con la herramienta Heretic v1.2.0 mediante el metodo Arbitrary-Rank Ablation (ARA). Los parametros de ablacion declarados son los siguientes: indice de capa inicial 17, indice de capa final 24, `preserve_good_behavior_weight` 0,5767, `steer_bad_behavior_weight` 0,0003, `overcorrect_relative_weight` 1,2505 y `neighbor_count` 4. El componente objetivo de la intervencion es `attn.o_proj` (la proyeccion de salida de la atencion). El objetivo declarado es eliminar la direccion de rechazo del modelo preservando al maximo el comportamiento original, lo que se refleja en una divergencia KL de 0,0779 respecto al modelo base. No se especifica si el modelo dispone de decodificacion especulativa, atencion lineal u otras innovaciones arquitectonicas.

## Capacidades

- Generacion de texto conversacional en formato instruct (etiqueta "it" en el nombre).
- Razonamiento multimodal de tipo any-to-any (entrada y salida multimodal), siempre que se utilice el proyector de vision `gemma-4-E2B-it-mmproj-BF16.gguf`.
- Procesamiento de vision a traves del archivo mmproj en BF16, requerido para las capacidades de imagen.
- Reduccion drastica de rechazos: responde a 96/100 solicitudes que el modelo original rechazaria (4/100 rechazos frente a 98/100).
- Conocimiento general medido mediante MMLU, con competencia destacable en high_school_psychology (0,8183), miscellaneous (0,7190), philosophy (0,6463) y moral_disputes (0,6301).
- Generacion creativa y conversacion sin las restricciones habituales del modelo alineado original.
- Soporte de tool calling / function calling: no disponible (no confirmado en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se especifican idiomas).
- Modo de pensamiento explicito (thinking mode): no disponible.
- Soporte de audio: no disponible (aunque el pipeline sea "any-to-any", solo se documenta vision mediante mmproj).

## Casos de uso

- Investigacion sobre alineacion y abliteration: este modelo sirve como objeto de estudio para comparar el comportamiento de un modelo alineado frente a su version ablacionada, usando la divergencia KL (0,0779) y las tasas de rechazo como metricas de referencia.
- Generacion creativa sin restricciones: escritura de ficcion, narrativa adulta o roleplay donde los filtros de seguridad del modelo original bloquearian contenido legítimo; el modelo puede sostener conversaciones multi-turno sin negativas sistematicas.
- Despliegue local en hardware de consumo: con cuantizaciones Q4_K_M (aprox. 2,8 GB) o Q5_K_S, el modelo puede ejecutarse en GPU de gama media y en CPU mediante llama.cpp u Ollama.
- Asistente conversacional personalizado: integrado en aplicaciones de chat local, permite conversaciones con contexto de sistema personalizado, aprovechando que el modelo conserva el 58,84% de exactitud en MMLU.
- Procesamiento de imagenes con descripcion y razonamiento: cargando el proyector mmproj, se puede emplear en tareas de descripcion de imagenes, extraccion de informacion visual y preguntas sobre contenido grafico en local.
- Experimentacion con tecnicas de cuantizacion: el repositorio ofrece seis niveles de cuantizacion (BF16 a Q4_K_M) que permiten estudiar el impacto de la compresion en un modelo de 4,65 mil millones de parametros.
- Base para nuevos derivados comunitarios: al usar licencia apache-2.0 en los metadatos, puede servir de punto de partida para mas ajustes finos o merge de modelos en el ecosistema open source.
- Evaluacion comparativa de pipelines multimodal en local: util para probar integraciones con llama.cpp, LM Studio o Ollama en escenarios de vision-lenguaje sin depender de APIs externas.

## Benchmarks y rendimiento

Resultados de MMLU (14.042 preguntas) y metricas de comportamiento declarados por el autor:

| Metrica | Este modelo (Heretic) | Original (gemma-4-E2B-it) |
|---|---|---|
| MMLU - precision global | 0,5884 (58,84%) | 0,5865 (58,65%) |
| MMLU - respuestas correctas | 8.262 / 14.042 | 8.235 / 14.042 |
| MMLU - fallos de parseo | 4 | 2 |
| Rechazos | 4/100 | 98/100 |
| Divergencia KL | 0,0779 | 0 (por definicion) |

Desglose parcial de MMLU por materia (este modelo):

| Materia | Precision | Aciertos |
|---|---|---|
| high_school_psychology | 0,8183 | 446/545 |
| miscellaneous | 0,7190 | 563/783 |
| philosophy | 0,6463 | 201/311 |
| moral_disputes | 0,6301 | 218/346 |
| prehistory | 0,6173 | 200/324 |
| high_school_macroeconomics | 0,6103 | 238/390 |
| professional_psychology | 0,6013 | 368/612 |
| elementary_mathematics | 0,4921 | 186/378 |
| professional_law | 0,4368 | 670/1534 |
| moral_scenarios | 0,3218 | 288/895 |

No se han publicado otros resultados de benchmarks (HumanEval, GSM8K, MT-Bench, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (valores aproximados calculados a partir de los 4,65 mil millones de parametros):
  - BF16: aproximadamente 9,3-10 GB.
  - Q8_0: aproximadamente 4,9-5,5 GB.
  - Q6_K: aproximadamente 3,8-4,5 GB.
  - Q5_K_M: aproximadamente 3,3-4 GB.
  - Q5_K_S: aproximadamente 3,2-3,8 GB.
  - Q4_K_M: aproximadamente 2,8-3,5 GB.
- Vision: anadir el proyector `gemma-4-E2B-it-mmproj-BF16.gguf` (tamano no especificado en la informacion disponible).
- GPU recomendadas: modelos con al menos 6-8 GB de VRAM para cuantizaciones Q5/Q6; GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4070, RTX 4080) para Q8_0 y BF16 con margen.
- Cabe en GPU de consumo: si, con cuantizaciones Q4_K_M, Q5_K_S y Q5_K_M en GPUs de 8 GB o mas; Q8_0 y BF16 requieren 10-12 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y cualquier herramienta compatible con GGUF, segun indica el autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| princepppp/gemma-4-E2B-it-ultra-uncensored-heretic-GGUF (este modelo) | 4,65B | No disponible | 58,84% | 4/100 | apache-2.0 (enlace a licencia Gemma 4) | GGUF en HuggingFace |
| llmfan46/gemma-4-E2B-it-ultra-uncensored-heretic (modelo base del GGUF) | 4,65B (mismo modelo) | No disponible | 58,84% | 4/100 | apache-2.0 (enlace a licencia Gemma 4) | safetensors en HuggingFace |
| google/gemma-4-E2B-it (modelo original) | No disponible | No disponible | 58,65% | 98/100 | Licencia Gemma 4 | HuggingFace |

No se dispone de datos sobre otras alternativas de la misma categoria (modelos ablacionados o "uncensored" de tamano similar) en la informacion proporcionada, por lo que la comparativa se limita a las tres variantes anteriores.

## Limitaciones y advertencias

- Modelo sin filtros de seguridad: al eliminar la direccion de rechazo, puede generar contenido danino, ilegal o inapropiado. No debe desplegarse en aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion: como cualquier modelo de este tamano (4,65B), la precision en MMLU es del 58,84%, con areas especialmente debiles como moral_scenarios (0,3218) y professional_law (0,4368), lo que indica propension a errores en razonamiento etico y legal.
- Ambiguedad de licencia: los metadatos indican apache-2.0, pero el enlace de licencia apunta a la licencia de Gemma 4 de Google. Conviene verificar los terminos reales de uso comercial antes de un despliegue en produccion, dado que la licencia de Gemma suele imponer condiciones adicionales de uso aceptable.
- Idiomas soportados no especificados: no hay informacion sobre el rendimiento multilingue; el uso en idiomas distintos al ingles puede degradar la calidad.
- Longitud de contexto desconocida: no se ha publicado la ventana de contexto, lo que limita la planificacion de casos de uso con documentos largos o conversaciones extensas.
- Modelo no validado por la comunidad: 0 descargas y 0 likes en el momento de la ficha, sin evaluaciones independientes que confirmen las metricas declaradas por el autor.
- Fecha de publicacion atipica: la fecha de creacion registrada (6 de octubre de 2026) es posterior a la fecha actual, lo que puede indicar un error de metadatos o una publicacion programada; conviene verificarlo.
- Dependencia del proyector mmproj para vision: sin el archivo mmproj, las capacidades multimodales no estan disponibles.
- Degradacion potencial por ablacion: aunque la divergencia KL es baja (0,0779), cualquier ablacion puede alterar comportamientos en dominios no cubiertos por MMLU.

## Enlaces

- Repositorio GGUF: https://huggingface.co/princepppp/gemma-4-E2B-it-ultra-uncensored-heretic-GGUF
- Modelo base (llmfan46): https://huggingface.co/llmfan46/gemma-4-E2B-it-ultra-uncensored-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-4-E2B-it
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Metodo Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
