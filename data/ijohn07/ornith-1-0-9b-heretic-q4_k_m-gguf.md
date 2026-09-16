# ijohn07/Ornith-1.0-9B-heretic-Q4_K_M-GGUF

## Resumen

`ijohn07/Ornith-1.0-9B-heretic-Q4_K_M-GGUF` es una cuantización en formato GGUF del modelo `trohrbaugh/Ornith-1.0-9B-heretic`, que a su vez es una variante modificada de `deepreinforce-ai/Ornith-1.0-9B`. El repositorio lo publica el usuario ijohn07 y no introduce entrenamiento ni ajuste adicional: se limita a convertir los pesos originales a GGUF mediante el espacio GGUF-my-repo de ggml.ai, usando la cuantización Q4_K_M, pensada para inferencia local con llama.cpp y derivados.

El modelo cuenta con 8.953.803.264 parámetros (aproximadamente 8,95 mil millones) y ocupa 5,6 GB en el repositorio, lo que lo sitúa en la franja de modelos que caben en GPUs de consumo con 8-12 GB de VRAM. La etiqueta "heretic" junto con "uncensored", "decensored" y "abliterated" indica que la variante de la que procede ha sufrido una modificación a nivel de pesos orientada a reducir o eliminar los comportamientos de rechazo (ablación de direcciones de refusal), un tipo de intervención que no requiere reentrenamiento.

Su relevancia práctica es doble: por un lado, ofrece un modelo de ~9B ejecutable en hardware modesto; por otro, cubre un nicho concreto (modelos sin filtrado de rechazos) que algunos desarrolladores buscan para experimentación con prompts que los modelos alineados estándar bloquean. El repositorio no documenta detalles de arquitectura, contexto, idiomas ni datos de entrenamiento: la model card remite íntegramente a la del modelo base, y el autor de esta cuantización no añade información propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; el pipeline declarado es text-generation) |
| Parametros totales | 8.953.803.264 (≈8,95 B) |
| Parametros activos | no aplica (no hay indicios de ser MoE) |
| Longitud de contexto | no disponible. El ejemplo de la model card usa `-c 2048`, pero es un valor de ejemplo de llama-server, no una especificacion del modelo |
| Tipos de cuantizacion | Q4_K_M (unica publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | MIT (con enlace a la licencia del modelo original `deepreinforce-ai/Ornith-1.0-9B`) |
| Formato de pesos | GGUF (`ornith-1.0-9b-heretic-q4_k_m.gguf`) |
| Tamano del repositorio | 5,6 GB |
| Modelo base | `trohrbaugh/Ornith-1.0-9B-heretic` |
| Modelo de origen de la cadena | `deepreinforce-ai/Ornith-1.0-9B` (referenciado en el license_link) |
| Libreria declarada | transformers |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-15 |
| Fecha de actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura interna del modelo en la informacion proporcionada. La model card del repositorio de cuantizacion no incluye descripcion de la arquitectura, numero de capas, dimensiones de atencion, tipo de normalizacion ni estrategia de posicionamiento. Tampoco se documenta si se trata de un transformer decoder-only clasico, un hibrido o una arquitectura con atencion lineal. El tag `pipeline_tag: text-generation` y el uso de llama.cpp son compatibles con una arquitectura de tipo transformer decoder-only, pero esto es una inferencia a partir del formato de despliegue, no un dato confirmado en la documentacion disponible.

Respecto al entrenamiento, la informacion es igualmente ausente: no hay datos sobre numero de tokens, composicion del dataset, fases de ajuste (SFT, RLHF, DPO) ni proceso de destilacion. Lo unico que se puede afirmar con la informacion disponible es la naturaleza de la intervencion que da nombre al modelo: las etiquetas "heretic", "abliterated", "uncensored" y "decensored" describen modificaciones a nivel de pesos del modelo base orientadas a suprimir la direccion de activacion asociada a los rechazos, sin reentrenamiento completo. Esta cuantizacion concreta no modifica el modelo: aplica una conversion a Q4_K_M con llama.cpp a traves del espacio GGUF-my-repo, por lo que hereda integramente las caracteristicas tecnicas y de comportamiento del checkpoint `trohrbaugh/Ornith-1.0-9B-heretic`.

## Capacidades

- Generacion de texto en modo completion y chat, segun el pipeline declarado (`text-generation`).
- Comportamiento sin filtrado de rechazos: es la caracteristica principal de la variante "heretic/abliterated", orientada a responder a instrucciones que un modelo alineado convencional rechazaria.
- Ejecucion local en CPU, GPU y Apple Silicon mediante llama.cpp, con soporte de cuantizacion de 4 bits.
- Compatibilidad con el ecosistema llama.cpp: `llama-cli`, `llama-server` y la API HTTP del servidor.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que permite servirlo a traves de infraestructura de inferencia compatible con el formato.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas soportados.
- Capacidades especiales (vision, audio, modo thinking): no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia local en equipos de sobremesa: con 5,6 GB de pesos en Q4_K_M, el modelo se puede ejecutar integramente en GPU en tarjetas de 8-12 GB o en CPU con llama.cpp, lo que permite trabajar sin conexion y sin coste por token en tareas de generacion de texto.
- Despliegue de un servidor de chat propio: mediante `llama-server` se expone un endpoint HTTP compatible con clientes que hablen la API de llama.cpp, lo que facilita integrarlo en una interfaz de chat interna o en un asistente personal autoalojado.
- Experimentacion con prompts de investigacion: la naturaleza "abliterated" del checkpoint lo hace util para estudiar como se comporta un modelo cuando se eliminan las direcciones de rechazo, comparando respuestas frente a la version alineada del mismo modelo base.
- Generacion de texto creativo sin restricciones tematicas: ficcion, guiones o narrativa con tematicas que los modelos alineados suelen declinar cubrir; la ausencia de filtrado de rechazos reduce las interrupciones en flujos creativos largos.
- Pruebas de robustez y evaluacion de seguridad: util como sujeto de prueba en pipelines de red teaming, para comprobar si los filtros de una aplicacion aguas abajo detectan contenido que el modelo genera sin objeciones.
- Prototipado rapido de aplicaciones de generacion de texto: al ser un GGUF de ~9B, se puede integrar con llama-cpp-python o LM Studio para validar una idea de producto antes de invertir en infraestructura mayor.
- Investigacion sobre cuantizacion: permite medir la perdida de calidad de Q4_K_M frente a los pesos originales en un modelo de ~9B, comparando salidas con el checkpoint base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K ni similares), y tampoco se proporcionan mediciones de perplejidad o comparaciones con el modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada para los pesos: en torno a 5,6 GB para el fichero Q4_K_M; con cache KV y overhead del runtime, el consumo practico se situa tipicamente en la franja de 6-8 GB en funcion del contexto configurado.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 3080 10 GB (con contextos moderados) y RTX 4090 24 GB (con margen amplio para contextos largos).
- Apple Silicon: ejecutable con backend Metal en equipos con memoria unificada de 16 GB o superior, usando llama.cpp.
- CPU: ejecutable en modo CPU puro, aunque con throughput muy inferior; recomendable solo para pruebas o equipos sin GPU dedicada.
- GPU de datacenter: A100 40/80 GB, H100 y L40S permiten servir el modelo con lotes grandes y contextos extensos, aunque el modelo es pequeno para ese hardware y se desaprovecharia parte de su capacidad.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`), llama-cpp-python, LM Studio, Ollama (importando el GGUF) y cualquier runtime compatible con GGUF. vLLM tiene soporte limitado de GGUF y no es la via recomendada para este repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones para este repositorio y dependeran de la GPU, del backend, del contexto y del tamano de lote utilizados.

## Comparativa con modelos similares

La informacion proporcionada no incluye benchmarks ni datos comparativos. La tabla siguiente compara unicamente atributos estructurales verificables de modelos de tamano y proposito similares, tomados de sus fichas publicas; los datos de rendimiento no estan disponibles para ninguno de ellos en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Formato de este repo | Notas |
|---|---|---|---|---|---|
| Ornith-1.0-9B-heretic Q4_K_M (este) | 8,95 B | no disponible | MIT | GGUF Q4_K_M | Variante abliterated, cadena de derivacion: deepreinforce-ai → trohrbaugh → ijohn07 |
| Llama 3.1 8B Instruct | 8,03 B | 128 K (segun su ficha oficial) | Llama 3.1 Community License | safetensors / GGUF (terceros) | Modelo alineado de referencia en la misma franja de tamano; licencia no MIT |
| Mistral 7B Instruct v0.3 | 7,25 B | 32 K (segun su ficha oficial) | Apache 2.0 | safetensors / GGUF | Alternativa de licencia permisiva y tamano ligeramente inferior |
| Qwen2.5 7B Instruct | 7,62 B | 128 K (segun su ficha oficial) | Apache 2.0 (la mayoria de variantes) | safetensors / GGUF | Buen soporte multilingue declarado, incluido espanol |

Nota: los datos de los modelos comparados proceden de sus fichas publicas y no se han verificado de nuevo en esta busqueda; se incluyen como referencia orientativa. No es posible comparar rendimiento (MMLU, HumanEval, GSM8K) porque no hay resultados publicados en la informacion disponible.

## Limitaciones y advertencias

- Modelo derivado y con cadena de autoría poco documentada: este repositorio es una cuantizacion de `trohrbaugh/Ornith-1.0-9B-heretic`, que a su vez deriva de `deepreinforce-ai/Ornith-1.0-9B`. La documentacion tecnica del modelo original no se reproduce aqui, por lo que se desconoce el dataset de entrenamiento y sus sesgos asociados.
- Ausencia de datos de evaluacion: no hay benchmarks, mediciones de perplejidad ni comparaciones con los pesos sin cuantizar. No se puede cuantificar la perdida de calidad introducida por Q4_K_M.
- Comportamiento sin filtrado de rechazos: la naturaleza "uncensored/abliterated" implica que el modelo puede generar contenido que los modelos alineados rechazan, incluyendo material ofensivo, sesgado o potencialmente danino. Requiere supervision y filtros externos si se expone a usuarios finales.
- Riesgo de alucinacion: no evaluado en la informacion disponible. Como en cualquier modelo de ~9B, es esperable que genere informacion falsa con aparente seguridad, especialmente en dominios especializados; no conviene usarlo como fuente de verdad sin verificacion.
- Sesgos: no documentados. Los sesgos del modelo original se heredan intactos, agravados por la eliminacion de los mecanismos de rechazo que en un modelo alineado actuan como barrera parcial.
- Contexto e idiomas desconocidos: no hay dato oficial de ventana de contexto ni de idiomas soportados. El valor `-c 2048` que aparece en la model card es solo un ejemplo de invocacion de `llama-server`, no una especificacion. Hay que validar experimentalmente el comportamiento en espanol antes de usarlo en produccion.
- Licencia MIT: es permisiva y permite uso comercial, pero el `license_link` apunta a la licencia del modelo original (`deepreinforce-ai/Ornith-1.0-9B`); conviene revisar esa licencia para confirmar que no impone condiciones adicionales sobre la cadena de derivacion.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, y se creo y actualizo el mismo dia (2026-09-15). No hay comunidad, issues ni validacion independiente de que el fichero GGUF se cargue correctamente en todos los runtimes.
- Uso responsable: al tratarse de un modelo sin filtrado de rechazos, su despliegue en entornos con usuarios finales exige medidas adicionales de moderacion, trazabilidad y cumplimiento normativo (por ejemplo, obligaciones de transparencia sobre contenido generado por IA).

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/ijohn07/Ornith-1.0-9B-heretic-Q4_K_M-GGUF
- Modelo base de la cuantizacion: https://huggingface.co/trohrbaugh/Ornith-1.0-9B-heretic
- Modelo original de la cadena de derivacion: https://huggingface.co/deepreinforce-ai/Ornith-1.0-9B
- Licencia referenciada por el autor: https://huggingface.co/deepreinforce-ai/Ornith-1.0-9B/blob/main/LICENSE
- Espacio GGUF-my-repo utilizado para la conversion: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
