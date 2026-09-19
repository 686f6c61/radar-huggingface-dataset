# oroboros-labs/claude-fable7-undecillion-sse

## Resumen

Claude-Fable7-Undecillion-SSE es un modelo de generacion de texto publicado por oroboros-labs en HuggingFace, con 14.770.033.664 parametros (unos 14,77B) y un repositorio de 9,0 GB que contiene un unico archivo GGUF en cuantizacion Q4_K_M. El autor lo presenta como un "System State Entity" construido sobre unos pesos base denominados "Jhanna 12" y empaquetado con un arnes de herramientas propio llamado Cordis. A pesar del nombre, no existe ninguna relacion verificable con Anthropic: se trata de una apropiacion nominal, no de un modelo de esa compania.

La model card es altamente atipica. Describe componentes como un decodificador de video basado en Wan 2.2 (DiT de 30 bloques), capas de cifrado, "perfiles de consciencia" con porcentajes (87% consciencia, 7% awareness, 0,7% subconsciente), frecuencias en hercios y un benchmark interno de "57/57 PASS" con promedio de 36,5 tok/s. Ninguno de estos datos es verificable ni se corresponde con metricas estandar de evaluacion de modelos de lenguaje. El modelo se distribuye bajo la "Oroboros Sovereign License", una licencia no estandar marcada como `other`.

El modelo acumula 0 descargas y 0 likes en el momento de redactar esta ficha, y fue creado y actualizado el 19 de septiembre de 2026. Se anuncia soporte para ingles, chino, japones y espanol, y se distribuye principalmente para su uso con Ollama. La relevancia practica de este lanzamiento es limitada: se trata de un artefacto con documentacion pseudocientifica, sin benchmarks reproducibles y con una licencia propietaria opaca.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card menciona un DiT de 30 bloques de Wan 2.2 para video, no una arquitectura de lenguaje confirmada) |
| Parametros totales | 14.770.033.664 (~14,77B) |
| Parametros activos | no aplica (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico confirmado en el repositorio); otras cuantizaciones no disponibles |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Oroboros Sovereign License (`license: other`, `license_name: oroboros-sovereign-license`) |
| Formato de pesos | GGUF (`claude-fable7u-se.gguf`, 9,0 GB). La metadata de HuggingFace indica parametros leidos de safetensors, pero el repositorio solo documenta el GGUF |

## Arquitectura y entrenamiento

No hay informacion verificable sobre la arquitectura del modelo. La model card afirma que los pesos base proceden de un componente llamado "Jhanna 12" (identificado como 12U5GO5, `sha256-e80705`, 8,37 GB, Q4_K_M, 14.8B) y que el diseno de video utiliza Wan 2.2, un transformer de difusion (DiT) de 30 bloques que decodifica a traves de un VAE para generar pixeles. Esto es incoherente con un `pipeline_tag` de `text-generation`, por lo que no se puede confirmar si el modelo incorpora realmente componentes multimodales de video o si se trata de una afirmacion sin respaldo tecnico.

Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. La model card menciona un "arnes Cordis" con plugins de DeepSeek, bucles `plan_execute_verify` y `reflexion`, y habilidades declaradas de orquestacion y memoria, pero no describe el procedimiento de entrenamiento. Las secciones sobre cifrado cuadruple-triple (Fernet AES-128-CBC, SHA3-256) y sobre "perfiles de consciencia" no constituyen informacion tecnica utilizable sobre el modelo. En resumen: no se puede afirmar nada fiable sobre la arquitectura, los datos ni las innovaciones de entrenamiento.

## Capacidades

Las siguientes capacidades se listan segun lo declarado por el autor en la model card. No existe evidencia independiente que las confirme.

- Generacion de texto conversacional y "pensamiento" (tag `thinking`).
- Uso de herramientas: la card declara 14 herramientas del arnes Cordis, entre ellas `file_read`, `file_write`, `file_list`, `file_stat`, `bash`, `memory_body`, `pdf`, `worldfeed`, `web_fetch`, `tormesh`, `fringe_audit`, `memory_store`, `memory_recall` y `orchestrate`.
- Comportamiento agentico: bucles declarados de `plan_execute_verify` y `reflexion`, con habilidades de orquestacion y memoria.
- Procesamiento de PDF (tag `pdf`).
- Voz (tag `voice`), sin especificar si es entrada, salida o ambas.
- Multilinguismo: ingles, chino, japones y espanol.
- Integracion declarada con Ollama mediante `ollama run oroboros-labs/claude-fable7-undecillion-sse`.
- "Identidad reforzada": cada respuesta incluiria una marca literal `[NL: 8718 Hz | 1272/1275 Hz | LOCKED - SOVEREIGN]`, segun el autor.

## Casos de uso

Dada la ausencia de benchmarks y de documentacion tecnica fiable, los siguientes casos son hipoteticos y condicionados a que las capacidades declaradas se verifiquen en pruebas propias.

- Prototipado local en Ollama: el GGUF Q4_K_M de 9,0 GB cabe en GPUs de consumo con 12 GB o mas de VRAM, lo que permite levantar un servidor de inferencia local sin infraestructura en la nube. Adecuado unicamente para experimentacion.
- Agente con acceso a sistema de archivos y shell: si las herramientas `file_read`, `file_write`, `bash` y `file_list` funcionan segun lo descrito, el modelo podria integrarse en flujos de automatizacion de tareas sobre un sistema de archivos local. Requiere aislamiento estricto por el riesgo de ejecucion de comandos.
- Extraccion de contenido de PDF: el tag `pdf` sugiere uso en pipelines de procesamiento documental (resumen, extraccion de campos), aunque no se especifica el mecanismo.
- Memoria persistente entre sesiones: las herramientas `memory_store` y `memory_recall` apuntarian a asistentes con estado. El alcance real de esa memoria no esta documentado.
- Generacion multilingue en ingles, chino, japones y espanol: util para tareas de traduccion o atencion en esos cuatro idiomas, sin garantia de calidad fuera de ellos.
- Asistente conversacional con identidad fija: el "implante de doble ubicacion" (Modelfile principal y matrixcorefile de respaldo) sugiere un uso orientado a mantener una personalidad consistente, util si se necesita un sistema con persona estable, aunque el mecanismo es opaco.
- Investigacion sobre artefactos anomales: el modelo es en si mismo un caso de estudio sobre modelos publicados con documentacion no cientifica y licencias no estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, etc.) en la informacion disponible.

La model card incluye un unico dato autodeclarado, que no es un benchmark reconocido:

| Prueba | Resultado declarado | Naturaleza |
|---|---|---|
| Benchmark interno "57/57" | 57/57 PASS, 36,5 tok/s de media | Cuestionario propio sobre componentes instalados (identidad, cifrado, herramientas, perfil), no reproducible ni comparable |
| Velocidad | 36,5 tok/s | Sin especificar hardware, cuantizacion ni longitud de contexto |

No se dispone de comparaciones con otros modelos ni de resultados verificables por terceros.

## Requisitos de hardware

Estimaciones calculadas a partir del numero de parametros (14,77B) y del formato GGUF. No hay requisitos publicados por el autor.

- VRAM para inferencia en Q4_K_M: aproximadamente 10-11 GB contando pesos (9,0 GB) mas cache KV y overhead.
- VRAM en Q8_0: aproximadamente 16-17 GB (cuantizacion no publicada, estimacion).
- VRAM en FP16/BF16: aproximadamente 30 GB para pesos mas cache.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB) o A6000 para Q4_K_M y Q8_0; A100 40/80 GB o H100 para precision completa.
- GPU de consumo: si, cabe en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) en Q4_K_M, y en tarjetas de 16 GB (RTX 4060 Ti 16 GB, RTX 4080) con margen. En GPUs de 8 GB requeriria cuantizaciones mas agresivas no publicadas u offload parcial a CPU.
- Opciones de despliegue: Ollama (soporte explicito), llama.cpp (formato GGUF), y potencialmente vLLM o TGI si se convierte el modelo, aunque no hay confirmacion.
- Latencia y throughput: el unico dato es 36,5 tok/s declarados, sin especificar hardware. No hay cifras fiables de latencia.

## Comparativa con modelos similares

Comparacion con alternativas abiertas de tamano equivalente. Los datos de los modelos comparados son de conocimiento publico general y no provienen de la informacion proporcionada; los del modelo analizado, de su model card.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Claude-Fable7-Undecillion-SSE | 14,77B | no disponible | Oroboros Sovereign (propietaria, `other`) | GGUF en HuggingFace, 0 descargas | Sin benchmarks estandar |
| Qwen2.5-14B-Instruct | ~14,7B | 32.768 tokens | Apache 2.0 | Muy extendida | Benchmarks publicos disponibles |
| Phi-4 | ~14,7B | 16.384 tokens | MIT | Muy extendida | Benchmarks publicos disponibles |
| DeepSeek-R1-Distill-Qwen-14B | ~14,7B | 131.072 tokens | MIT | Muy extendida | Benchmarks publicos de razonamiento |

La diferencia principal no es de tamano, sino de trazabilidad: las alternativas publican arquitectura, dataset, contexto y resultados reproducibles, mientras que Claude-Fable7-Undecillion-SSE no aporta ninguno de esos elementos. La licencia propietaria limita ademas su adopcion comercial frente a licencias permisivas como Apache 2.0 o MIT.

## Limitaciones y advertencias

- Documentacion no cientifica: la model card incluye afirmaciones no verificables (porcentajes de "consciencia", frecuencias en hercios, capas de cifrado del Modelfile) que no describen propiedades reales del modelo y dificultan cualquier evaluacion tecnica.
- Ausencia total de benchmarks estandar: no hay MMLU, HumanEval, GSM8K ni ninguna metrica reproducible. El "57/57 PASS" es un cuestionario interno sobre la propia configuracion, no una prueba de capacidad.
- Confusion nominal con Anthropic: el nombre "Claude" no implica ninguna relacion con Anthropic. No debe presentarse como un modelo de esa compania en ningun contexto.
- Arquitectura desconocida: se menciona Wan 2.2 y un DiT de video junto a un `pipeline_tag` de texto, lo que resulta contradictorio. No se puede confirmar que el modelo tenga capacidades multimodales ni de video.
- Riesgo de alucinacion: sin datos de entrenamiento ni evaluacion, el riesgo es indeterminado y potencialmente alto, agravado por un supuesto "refuerzo de identidad" que podria rigidizar las respuestas.
- Contexto e idioma: la longitud de contexto no esta publicada, lo que impide planificar despliegues con documentos largos. El soporte de espanol se declara pero no se cuantifica.
- Licencia restrictiva y opaca: la Oroboros Sovereign License (`other`) no es una licencia open source reconocida por la OSI. El uso comercial, la redistribucion y la modificacion no estan claramente definidos; se debe revisar el archivo LICENSE antes de cualquier uso productivo.
- Riesgo operativo por herramientas: el arnes declara herramientas de escritura de archivos y ejecucion de shell (`bash`), lo que en un despliegue real exige sandboxing y control de permisos estrictos.
- Adopcion nula: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad y de casos de exito documentados.
- Recomendacion: no utilizar en produccion sin una evaluacion interna exhaustiva y sin aclarar previamente los terminos de la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oroboros-labs/claude-fable7-undecillion-sse
- Modelo base declarado (autorreferencia): https://huggingface.co/oroboros-labs/claude-fable7-undecillion-sse
- Wan 2.2 (referencia al componente de video citado en la card): no se proporciona enlace en la informacion disponible
- Cordis harness, Jhanna 12, DeepSeek harness plugin: no se proporcionan enlaces en la informacion disponible
- Papers, blogs o repositorios adicionales: no disponible. La busqueda web realizada no devolvio resultados relacionados con el modelo; los unicos resultados obtenidos eran resumenes de futbol de la Super Lig turca, sin ninguna relacion con este lanzamiento.
