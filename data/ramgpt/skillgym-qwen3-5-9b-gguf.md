# ramgpt/SkillGym-Qwen3.5-9B-GGUF

## Resumen

SkillGym-Qwen3.5-9B-GGUF es una conversion a formato GGUF del punto de control reasonwang/SkillGym-Qwen3.5-9B, publicada por el usuario ramgpt para su uso en entornos compatibles con llama.cpp. Se trata, por tanto, de un artefacto de cuantizacion y no de un entrenamiento original: el merito del modelo base corresponde a sus autores, y este repositorio unicamente redistribuye los pesos en un contenedor mas ligero para inferencia local.

El modelo base cuenta con 8.953.803.264 parametros (aproximadamente 8,95 mil millones) segun los tensores safetensors, lo que lo situa en la franja de los 9B. El repositorio publica una unica cuantizacion, Q4_K_M, con un tamano de 5,24 GiB, y el repositorio completo ocupa 5,6 GB. La model card indica que el punto de control de origen es multimodal, pero que esta conversion GGUF es exclusivamente de texto: no incluye los pesos de vision ni el artefacto mmproj, por lo que no debe asumirse que conserva la capacidad multimodal original.

La relevancia de esta ficha es practica: permite ejecutar un modelo conversacional de ~9B en hardware de consumo mediante llama.cpp, con un servidor compatible con la API de OpenAI. No obstante, la informacion publicada es muy limitada (sin licencia declarada, sin idiomas, sin contexto maximo y sin benchmarks), por lo que cualquier evaluacion de calidad o de idoneidad en produccion queda pendiente de validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base se denomina Qwen3.5-9B; la model card no detalla la arquitectura) |
| Parametros totales | 8.953.803.264 (aprox. 8,95 B, segun safetensors) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 8192`, pero es un ajuste de ejecucion, no el maximo del modelo) |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. La model card de esta conversion no incluye esos datos y no se ha publicado documentacion adicional en la informacion proporcionada. Lo unico deducible por denominacion es que el modelo base pertenece a la familia Qwen3.5 con un tamano de 9B, adscripcion que no se detalla tecnicamente en el repositorio.

El unico detalle tecnico relevante sobre el proceso de conversion es que se utilizo la opcion `--no-mtp` porque la configuracion de origen y los tensores del modelo no coincidian respecto a la presencia de MTP/NextN (prediccion multi-token / NextN). Esto implica que, en caso de que el modelo base incluyera dicha capacidad, la conversion GGUF no la preserva. La model card tambien menciona la existencia de un modo de razonamiento (reasoning mode) en el modelo, que durante las pruebas de validacion se dejo en estado `off`.

## Capacidades

- Generacion de texto conversacional en formato chat (etiqueta `conversational`).
- Ejecucion mediante llama.cpp con separacion de mensajes de sistema y usuario, verificada en la prueba de validacion publicada.
- Modo de razonamiento (reasoning mode) presente en el modelo base, segun la model card; el estado usado en la validacion fue desactivado.
- Compatibilidad con endpoints OpenAI (`endpoints_compatible`), a traves de `llama-server`.
- Inferencia exclusivamente de texto: los pesos de vision y el artefacto mmproj del modelo original no estan incluidos.
- Soporte de tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (vision, audio): no disponibles en esta conversion.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar dialogos multi-turno en un servidor `llama-server` compatible con la API de OpenAI, lo que permite integrarlo en interfaces de chat existentes sin cambios de codigo en el cliente.
- Despliegue en estaciones de trabajo sin GPU dedicada: con 5,24 GiB en Q4_K_M puede ejecutarse en CPU mediante `llama-cli`, siendo util para entornos de desarrollo o pruebas donde no hay acelerador disponible.
- Prototipado rapido de aplicaciones de texto: al exponer un endpoint compatible con OpenAI, sirve como sustituto local para validar pipelines de generacion de texto antes de migrar a modelos mayores.
- Procesamiento por lotes de resumenes y extraccion de texto: su tamano reducido permite ejecutarlo en paralelo sobre varias instancias en una sola GPU de consumo para tareas de transformacion de documentos.
- Base para RAG ligero: un modelo conversacional de ~9B en formato GGUF es adecuado para responder preguntas sobre documentos recuperados en un indice vectorial, siempre que la longitud de contexto real del modelo se confirme primero.
- Entorno de evaluacion y comparacion de cuantizaciones: este repositorio permite medir el impacto de Q4_K_M frente a otras cuantizaciones del mismo modelo base, si se generan localmente, en terminos de calidad y uso de memoria.
- Chatbot de uso interno en una organizacion: al ejecutarse en local, evita enviar datos a servicios externos, aunque antes debe resolverse la ausencia de licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe una prueba de validacion funcional (`smoke gate`) sobre el endpoint `/v1/chat/completions` de `llama-server`, que comprueba la carga del modelo, la separacion entre mensajes de sistema y usuario, el cumplimiento exacto de la salida, el comportamiento de parada normal, aritmetica basica y la ausencia de fugas de tokens de control de chat. El modo de razonamiento usado en esa prueba fue `off`. Esta validacion acredita que el modelo carga y responde correctamente, pero no constituye una medida de rendimiento.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Otros | no disponible |

## Requisitos de hardware

- VRAM estimada: los pesos en Q4_K_M ocupan 5,24 GiB; con cache KV y overhead del runtime, se recomienda un minimo practico de 6 a 8 GB de VRAM para contexto moderado. Cifra orientativa, no publicada por el autor.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090; en el ambito profesional, A100 o H100 si se requieren varias instancias en paralelo.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM. El ejemplo oficial usa `-ngl 999`, es decir, descargar todas las capas en GPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y cualquier runtime compatible con GGUF (por ejemplo Ollama o LM Studio mediante importacion). La compatibilidad con vLLM para este artefacto no esta documentada.
- Ejemplo oficial: `llama-cli -m SkillGym-Qwen3.5-9B-Q4_K_M.gguf -ngl 999 -c 8192` y `llama-server -m SkillGym-Qwen3.5-9B-Q4_K_M.gguf -ngl 999 -c 8192`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La informacion disponible no permite comparar rendimiento, ya que no hay benchmarks publicados de este modelo. La tabla siguiente recoge unicamente datos estructurales conocidos y marca como no disponible todo lo que no se ha confirmado.

| Modelo | Parametros | Contexto | Cuantizacion en este repo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SkillGym-Qwen3.5-9B-GGUF (este) | 8,95 B | no disponible | Q4_K_M (5,24 GiB) | no disponible | GGUF para llama.cpp |
| Modelo base reasonwang/SkillGym-Qwen3.5-9B | 8,95 B (origen) | no disponible | safetensors (origen, multimodal) | no disponible | HuggingFace |
| Alternativas de ~8-9B (Qwen3-8B, Llama-3.1-8B, Mistral-7B) | ~7-8 B | variable | multiples | variable | amplia |

Nota: las alternativas citadas se incluyen como referencia de categoria (modelos conversacionales de ~8-9B); no se dispone de datos comparativos de rendimiento entre ellas y el modelo de esta ficha.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica la licencia ni las condiciones de uso comercial. No debe utilizarse en produccion sin aclarar antes los terminos con los autores del modelo base.
- Perdida de capacidades multimodales: el modelo base es multimodal, pero esta conversion es solo de texto; no incluye los pesos de vision ni el artefacto mmproj. No debe esperarse comportamiento de imagen.
- Contexto maximo sin confirmar: el valor `-c 8192` del ejemplo es un parametro de ejecucion y no implica que el modelo soporte esa longitud de forma nativa ni que la mantenga con calidad.
- Riesgo de alucinacion: no evaluado en la informacion disponible; como en cualquier modelo generativo de ~9B, es esperable, especialmente en tareas de conocimiento factual.
- Sesgos conocidos: no evaluados ni documentados.
- Idiomas soportados sin confirmar: no se declaran idiomas, por lo que el comportamiento multilingue es incierto.
- Cuantizacion unica: solo se publica Q4_K_M, lo que limita la eleccion entre calidad y consumo de memoria sin generar otras cuantizaciones manualmente.
- MTP/NextN no preservado: la conversion se realizo con `--no-mtp` por discrepancias entre configuracion y tensores de origen, por lo que cualquier capacidad de prediccion multi-token del modelo base no esta disponible.
- Validacion limitada: la unica prueba publicada es un `smoke gate` funcional; no hay evaluacion de calidad, seguridad ni robustez.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe aun validacion por parte de la comunidad.
- Integridad verificable: se publica el SHA256 `b7e4d1f6adebf3499b60eb844954d7a601c83208ad31c7e330413cec1b84ae11` y la revision de origen `0b8f92556f6c7ec06bd858327ed2166da8b7697c`, lo que permite comprobar que el archivo descargado coincide con el publicado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ramgpt/SkillGym-Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/reasonwang/SkillGym-Qwen3.5-9B
- Proyecto llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper, blog o demo adicional: no disponible en la informacion proporcionada.
