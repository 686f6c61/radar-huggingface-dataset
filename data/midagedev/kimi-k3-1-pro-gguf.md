# midagedev/Kimi-K3.1-Pro-GGUF

## Resumen

Kimi-K3.1-Pro es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Moonshot AI. Con 1 billón (1T) de parámetros totales y 32B activos por token, se posiciona como un modelo de escala frontera orientado a generación de texto conversacional, razonamiento y soporte de tool calling. El checkpoint base `moonshotai/Kimi-K3.1-Pro` no está disponible en formato abierto estándar; la ficha que nos ocupa es una cuantización GGUF de muy bajo bit (IQ1_S) publicada por el usuario `midagedev`.

El problema que resuelve esta publicación concreta no es el modelo en sí, sino hacerlo ejecutable en un único puesto de trabajo. El autor empaqueta 580 GB en 31 shards mediante su propio cuantizador, integrado en el motor `bloomery`, que combina VRAM de dos GPUs, RAM del host y un tier de expertos en NVMe. El resultado es un modelo de 1T de parámetros servido a velocidades modestas (del orden de 5 tokens/s) pero funcional sobre hardware de estación de trabajo, algo que con los formatos convencionales sería inviable.

Es relevante ahora porque demuestra una vía práctica para inferir modelos de escala frontera en local mediante cuantización extrema combinada con paginación de expertos desde disco. No obstante, es un artefacto muy específico: solo lo carga `bloomery` 0.3.13 o superior, no es compatible con llama.cpp principal y exige una configuración de hardware y software muy concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts) de tipo transformer; identificador de arquitectura en el GGUF: `kimi-k31` |
| Parametros totales | 2.779.661.661.792 (≈1T, dato de safetensors del modelo base) |
| Parametros activos | 32B (según model card) |
| Longitud de contexto | 2.048 tokens (techo de este tag, según model card) |
| Tipos de cuantizacion | IQ1_S (cuantización de muy bajo bit del cuantizador propio de bloomery); no se detallan otros tipos |
| Idiomas soportados | en, ko |
| Licencia | `other`, nombre `kimi-k3.1-pro` (hereda la licencia del modelo base) |
| Formato de pesos | GGUF (31 shards, 580 GB en total) |
| Tamano del repo | 673,0 GB |
| Requisito de runtime | bloomery 0.3.13 o superior; llama.cpp principal no soporta el grafo K3.1 |
| Plataformas | Linux x86_64, CUDA sm_86 o sm_120a (el build Metal de macOS no carga este fichero) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que es un MoE con 1T de parámetros totales y 32B activos. La model card del GGUF describe el plan de ejecución del motor: el "dense trunk" (tronco denso) ocupa unos 30 GB y se aloja en la primera GPU, los expertos enrutados más calientes se reparten entre las dos tarjetas, una parte de los expertos reside en RAM del host y el resto se pagina desde un tier de expertos en NVMe mediante lecturas O_DIRECT. No se proporcionan datos sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

La innovación técnica destacable de esta publicación es el propio pipeline de cuantización y despliegue: cuantización IQ1_S generada por el cuantizador de bloomery, un esquema de placement (`--place bp`) que reparte tronco denso, expertos en VRAM, expertos en RAM y expertos en disco, y la posibilidad de usar un nodo remoto (DGX Spark) como tier de expertos por TCP. También se documenta un modo de doble NVMe con sidecar de directorios para repartir las lecturas de expertos entre dos unidades. El chat template proviene de `unsloth/Kimi-K3-GGUF`, ya que el checkpoint K3.1 no incluye plantilla Jinja (su encoder es Python).

## Capacidades

- Generación de texto conversacional multi-turno, con separación entre el tramo de razonamiento (`reasoning_content`) y la respuesta final (`content`).
- Modo de pensamiento (thinking): el modelo emite un span de razonamiento previo a la respuesta; un `max_tokens` corto puede truncar el pensamiento y dejar la respuesta vacía.
- Soporte de tool calling y de prompts con imágenes, según el chat template de K3 que renderiza pensamiento, llamadas a herramientas e indicaciones de imagen.
- Capacidades multilingües limitadas a inglés y coreano según los metadatos del modelo.
- Razonamiento multi-paso y uso como agente, implícito en el soporte de tool calling y el modo thinking.
- API compatible con llama-server: `/v1/chat/completions`, `/completion` y `/v1/models`.

## Casos de uso

- Evaluación de modelos frontera en local: un equipo de investigación puede servir un modelo de 1T de parámetros en un puesto de trabajo con dos GPUs, 256 GB de RAM y NVMe, sin depender de APIs externas, a costa de throughput bajo.
- Procesamiento por lotes de documentos largos en coreano e inglés: con contexto de 2.048 tokens y decodificación de ~5 tok/s, es adecuado para tareas offline donde la latencia no es crítica (resúmenes, extracción, clasificación).
- Experimentación con cuantización extrema: sirve como banco de pruebas para estudiar la degradación de calidad de IQ1_S frente a cuantizaciones mayores y para validar el cuantizador de bloomery.
- Investigación sobre paginación de expertos desde disco: el artefacto y su documentación permiten reproducir y medir estrategias de tiering VRAM/RAM/NVMe y de nodos remotos de expertos.
- Asistentes conversacionales con razonamiento explícito: el modo thinking y el campo `reasoning_content` permiten auditar el razonamiento del modelo en flujos de pregunta-respuesta.
- Prototipado de agentes con tool calling en entornos aislados (air-gapped): al no requerir conexión a servicios externos, encaja en escenarios con requisitos de confidencialidad, aceptando la latencia de minutos para prompts largos.
- Pruebas de integración con clientes compatibles con la API de llama-server: permite validar pipelines que ya hablan el protocolo OpenAI contra un modelo de gran escala servido localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son de inferencia, medidos por el autor en su estación de trabajo con `--place bp --ctx-size 2048`, temperatura 0 y una petición en frío tras un prompt de D ids (tasas de lectura en frío, repetibles dentro del 3 %):

| Tarjetas | Discos | D | Decode tok/s | Prompt tok/s | Binario |
|---|---|---:|---:|---:|---|
| RTX A6000 + RTX 3090 | dos (sidecar) | 512 | 4,94 | 3,85 | 0.3.13 release, `BLOOMERY_HOST_ROOM=232G` |
| RTX A6000 + RTX 3090 | uno | 512 | 3,04 / 3,05 | 2,62 / 2,67 | 0.3.13 pre-release, `BLOOMERY_HOST_ROOM=252G`, dos rondas |
| RTX A6000 + RTX 3090 | uno | 1.536 | 2,27 / 2,34 | 2,58 / 2,53 | mismo árbol |
| RTX A6000 + DGX Spark como nodo de expertos (10 GbE TCP) | uno | 512 | 4,00 / 4,05 | 3,16 / 3,59 | mismo árbol; `BLOOMERY_TIER_NODES=<spark>:9000 BLOOMERY_TIER_LINK=tcp BLOOMERY_CARD_BUDGET=100G` |
| RTX A6000 + DGX Spark como nodo de expertos (10 GbE TCP) | uno | 1.536 | 3,17 / 3,23 | 3,43 / 3,20 | mismo |

La fila de release generó 512 ids; las filas pre-release, 128 ids en dos rondas (se muestran ambos valores). En las filas con Spark, el GB10 aloja 106 GB de los expertos enrutados en lugar de los 22 GB de la RTX 3090, por lo que se leen 175 GB en vez de 259 GB del NVMe en cada petición. El autor indica que, a las tasas de prompt indicadas, un prompt de 2.048 ids tarda entre 9 y 13 minutos hasta el primer token.

## Requisitos de hardware

- VRAM: el plan de referencia usa una RTX A6000 de 48 GB (aloja el tronco denso de ~30 GB) más una RTX 3090 de 24 GB; ambas alojan los expertos más calientes. Se necesitan dos tarjetas.
- RAM del host: 256 GB (el autor sirve con `BLOOMERY_HOST_ROOM=232G`).
- Disco: 580 GB en un NVMe PCIe 4; dos NVMe mejoran el rendimiento (de 3,80 a 4,94 tok/s en decodificación según el autor).
- GPU recomendadas: RTX A6000, RTX 3090; también se documenta una DGX Spark (GB10) como nodo remoto de expertos por 10 GbE.
- No cabe en una GPU de consumo individual: requiere el esquema multi-dispositivo más RAM y NVMe descrito.
- Despliegue: exclusivamente mediante bloomery 0.3.13 o superior (tarballs para sm_86, sm_120a y sm_121a; Homebrew ofrece el build sm_86). No es compatible con llama.cpp principal, vLLM, TGI ni Ollama. La API es compatible con llama-server.
- Latencia y throughput: ~5 tok/s de decodificación en el mejor caso documentado; primer token de un prompt de 2.048 ids en 9-13 minutos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro (IQ1_S, esta ficha) | 1T totales / 32B activos | 2.048 (techo de este tag) | GGUF solo para bloomery | `kimi-k3.1-pro` (other) | Hugging Face, 386 descargas |
| moonshotai/Kimi-K3.1-Pro (base) | 1T totales / 32B activos | no disponible | no disponible | `kimi-k3.1-pro` (other) | Hugging Face (referenciado como base) |
| unsloth/Kimi-K3-GGUF | no disponible | no disponible | GGUF (llama.cpp/unsloth) | no disponible | Hugging Face (fuente del chat template) |

No se dispone de datos de rendimiento comparables entre estas variantes ni de alternativas de la misma categoría con cifras verificables en la información proporcionada.

## Limitaciones y advertencias

- Solo lo carga bloomery 0.3.13 o superior; el identificador de arquitectura `kimi-k31` no existe en llama.cpp principal y el fichero no es intercambiable con otros runtimes.
- El build de macOS Metal no carga este fichero; se requiere Linux x86_64 con CUDA sm_86 o sm_120a.
- Contexto limitado a 2.048 tokens en este tag, muy por debajo de lo habitual en modelos frontera.
- Idiomas soportados únicamente inglés y coreano según los metadatos; el rendimiento en castellano no está documentado.
- Cuantización IQ1_S de muy bajo bit: es esperable degradación de calidad frente al checkpoint base, aunque no se publican evaluaciones que la cuantifiquen.
- Throughput muy bajo (~5 tok/s) y latencias de minutos para prompts largos; no apto para interacción en tiempo real.
- El plan de memoria depende de `BLOOMERY_HOST_ROOM`; sin fijarlo, dos cargas del mismo conjunto pueden producir planes distintos.
- Un `max_tokens` corto puede truncar el tramo de pensamiento y devolver una respuesta vacía con solo `reasoning_content`.
- La licencia `kimi-k3.1-pro` (other) debe revisarse en el fichero `LICENSE` del repositorio antes de cualquier uso comercial; no se detallan aquí sus restricciones.
- Riesgo de alucinación y sesgos del modelo base no documentados en la información disponible.
- El chat template no viene del checkpoint original sino de `unsloth/Kimi-K3-GGUF`; si el tuyo difiere, hay que pasarlo con `--chat-template-file`.

## Enlaces

- Repositorio GGUF: https://huggingface.co/midagedev/Kimi-K3.1-Pro-GGUF
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Motor bloomery: https://github.com/midagedev/bloomery
- Release bloomery 0.3.13: https://github.com/midagedev/bloomery/releases/tag/v0.3.13
- Chat template de referencia: https://huggingface.co/unsloth/Kimi-K3-GGUF
