# ddvd233/medxpert9b_specgap_ship_retrieval_websearch_global_step_180

## Resumen

medxpert9b_specgap_ship_retrieval_websearch_global_step_180 es un ajuste por aprendizaje por refuerzo (RL) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario ddvd233 en HuggingFace. No se trata de un modelo nuevo entrenado desde cero, sino de la fusión de pesos en bf16 de un checkpoint de verl (FSDP) correspondiente al paso global 180 de un experimento denominado RRIMed (self-evolving rewards), en su brazo held-out sobre el benchmark MedXpertQA (texto y multimodal), identificado como ARM 21. El modelo tiene 9.409.813.744 parámetros y ocupa 18,8 GB en el repositorio.

El problema que aborda es el de la respuesta a preguntas médicas con uso de herramientas: el entrenamiento por RL se realizó partiendo del modelo base con acceso a herramientas de recuperación (retrieval) y búsqueda web, y la recompensa empleada es una rúbrica de un solo criterio, de modo que el evaluador produce exactitud por coincidencia exacta (exact-match). Según la model card, el checkpoint alcanza una precisión de validación de 0,407 en MedXpertQA (evaluación en el paso 170), frente a 0,427 del mejor paso de la ejecución (paso 70, cuyos pesos se perdieron por rotación de checkpoints) y 0,357 del modelo base sin entrenar.

Es relevante ahora como artefacto de investigación reproducible: documenta una receta de RL con recompensas autogeneradas sobre un modelo denso de ~9B, con licencia Apache 2.0 y pesos en safetensors, lo que facilita su inspección y su comparación con el modelo base. El propio autor lo etiqueta explícitamente como artefacto de investigación, entrenado con tareas escritas por el modelo y evaluado en una única familia de benchmarks, y advierte que no es apto para uso clínico. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; el modelo deriva del modelo base Qwen/Qwen3.5-9B |
| Parametros totales | 9.409.813.744 (aproximadamente 9,41 B) |
| Parametros activos | No aplica / no disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (safetensors). No se documentan cuantizaciones GGUF, AWQ, GPTQ ni otras |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), pesos fusionados desde un checkpoint FSDP de verl |
| Tamano del repositorio | 18,8 GB |
| Modelo base | Qwen/Qwen3.5-9B |
| Pipeline declarado | reinforcement-learning |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (numero de capas, tipo de atencion, dimension del hidden state ni ventana de contexto). Lo unico documentado es que se trata de pesos fusionados en bf16 safetensors a partir de un checkpoint de entrenamiento con verl sobre FSDP, y que el modelo base es Qwen/Qwen3.5-9B, del que hereda la topologia. Por tanto, cualquier afirmacion sobre componentes concretos (atencion lineal, MoE, SSM hibrido, decodificacion especulativa) seria especulativa y no se incluye aqui.

El entrenamiento es exclusivamente por refuerzo (RL-only) partiendo del modelo base, sin fase supervisada previa documentada, y se ejecuta con la infraestructura verl. El escenario del experimento es RRIMed (self-evolving rewards), brazo held-out sobre MedXpertQA en sus variantes de texto y multimodal, etiquetado como ARM 21. Durante el bucle de RL el modelo dispone de herramientas de recuperacion y de busqueda web. La funcion de recompensa es una rubrica de un unico criterio, lo que implica que la metrica reportada es exactitud por coincidencia exacta (exact-match) y no una puntuacion parcial. El checkpoint publicado corresponde al paso global 180; la model card indica que el mejor paso de validacion de la ejecucion fue el 70 (0,427), pero esos pesos se perdieron por la rotacion de checkpoints, de modo que el artefacto disponible es el mejor checkpoint superviviente.

## Capacidades

- Generacion de texto y respuesta a preguntas de dominio medico, orientada a formato de respuesta corta evaluable por coincidencia exacta.
- Uso de herramientas de recuperacion (retrieval) y de busqueda web durante la inferencia, habilidad reforzada explicitamente en el bucle de RL.
- Razonamiento multi-paso implicito en tareas que requieren consultar fuentes externas antes de responder.
- Procesamiento de entradas multimodales segun el alcance de MedXpertQA multimodal declarado en la model card; el detalle de que modalidades soporta no esta disponible.
- Capacidades multilingues: no disponibles; no se documenta la composicion idiomatica del entrenamiento ni la cobertura de idiomas.
- Modo de pensamiento explicito (thinking mode), soporte formal de function calling con esquema declarado, audio o vision independiente: no disponible en la informacion proporcionada.
- No se documentan capacidades de generacion de codigo, matematicas generales ni agentes de proposito general.

## Casos de uso

- Evaluacion comparativa de estrategias de recuperacion en QA medico: el modelo permite medir si distintas politicas de retrieval o de busqueda web alteran la exactitud en MedXpertQA, usando el mismo punto de partida (0,407 de validacion) como referencia.
- Investigacion en RL con recompensas autogeneradas: sirve como artefacto reproducible del pipeline RRIMed con verl, de modo que un equipo puede replicar el bucle de entrenamiento y estudiar la dinamica de la rubrica de un solo criterio.
- Agente de consulta de literatura medica: integrado con una herramienta de busqueda, el modelo puede formular consultas, leer los resultados y emitir una respuesta corta con la evidencia recuperada, un flujo util para prototipos de asistencia documental interna.
- Construccion de conjuntos de datos y evaluacion de examenes tipo test medicos: su salida orientada a exact-match lo hace adecuado para generar o validar respuestas de referencia en bancos de preguntas, siempre con revision humana.
- Estudio de olvido catastrofico y deriva de dominio tras RL: al existir el modelo base y el ajustado con la misma licencia, permite cuantificar que capacidades generales se degradan al especializar mediante RL en un unico dominio.
- Filtrado y priorizacion de preguntas en un pipeline de anotacion medica: el modelo puede descartar consultas fuera de alcance o mal formuladas antes de pasarlas a un anotador humano, reduciendo el coste de revision.
- Docencia y formacion medica no clinica: como generador de preguntas de practica y explicaciones breves con fuentes recuperadas, en entornos controlados y con supervision de un profesional.
- Banco de pruebas para infraestructura de inferencia: al ser un denso de 9,41 B con pesos bf16 publicados, es un caso comodo para medir throughput y latencia de vLLM, TGI o SGLang en distintas GPU.

## Benchmarks y rendimiento

Los unicos datos disponibles en la informacion proporcionada son los de MedXpertQA (validacion), con exactitud por coincidencia exacta:

| Benchmark | Variante | Resultado | Notas |
|---|---|---|---|
| MedXpertQA (validacion) | Texto + multimodal (ARM 21) | 0,407 | Evaluacion en el paso 170; checkpoint publicado = paso 180 |
| MedXpertQA (validacion) | Texto + multimodal (ARM 21) | 0,427 | Mejor paso de la ejecucion (paso 70); pesos no conservados por rotacion |
| MedXpertQA (validacion) | Texto + multimodal (ARM 21) | 0,357 | Modelo base sin entrenar (referencia) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K, GPQA ni de otros benchmarks generales para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 19 GB solo para pesos (9,41 B x 2 bytes), mas cache KV y activaciones; en la practica conviene reservar 22-24 GB para secuencias cortas y mas si el contexto es largo.
- VRAM estimada en cuantizacion int8: en torno a 10-11 GB de pesos; en 4 bits, aproximadamente 6-7 GB de pesos. Estas cuantizaciones no estan publicadas en el repositorio y requeririan conversion propia.
- GPU de centro de datos: A100 (40 o 80 GB), H100 (80 GB), L40S (48 GB) y A6000 (48 GB) son suficientes en bf16 con holgura para contexto moderado.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar el modelo en bf16 de forma ajustada, con contexto limitado; una RTX 4080 o 4070 Ti de 16 GB solo es viable con cuantizacion de 4 u 8 bits.
- Multi-GPU: al ser un denso de 9,41 B, el despliegue con tensor parallelism en 2 GPU de 24 GB es una alternativa razonable si se necesita bf16 con contexto amplio.
- Opciones de despliegue: vLLM, TGI y SGLang de forma directa a partir de los safetensors; llama.cpp u Ollama requieren convertir previamente los pesos a GGUF, conversion que no se distribuye en el repositorio; para reentrenamiento o RL con el pipeline original, verl.
- Latencia y throughput estimados: no disponibles. No se documentan mediciones de tokens por segundo, TTFT ni consumo energetico.

## Comparativa con modelos similares

La informacion disponible no incluye otros modelos de RL medico comparables, por lo que la unica referencia documentada es el propio modelo base y el punto de partida sin entrenar:

| Modelo | Parametros | Contexto | MedXpertQA (validacion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medxpert9b_specgap_ship_retrieval_websearch (paso 180) | 9,41 B | No disponible | 0,407 | apache-2.0 | Pesos safetensors bf16 en HuggingFace |
| Qwen/Qwen3.5-9B (base, sin entrenar) | 9,41 B (heredado) | No disponible | 0,357 | No disponible en esta informacion | Modelo base publico |
| Otros modelos medicos de ~9B con RL | No disponible | No disponible | No disponible | No disponible | No disponible |

El delta observado respecto al modelo base es de +0,050 puntos de exactitud en el checkpoint publicado y de +0,070 en el mejor paso de la ejecucion, sobre una unica familia de benchmarks.

## Limitaciones y advertencias

- Uso clinico prohibido de forma explicita: la model card indica "Not for clinical use". No debe emplearse para diagnostico, triaje ni decision terapeutica.
- Artefacto de investigacion: fue entrenado con tareas escritas por el propio modelo y evaluado en una unica familia de benchmarks (MedXpertQA), lo que limita la generalizacion de los resultados.
- Metrica de recompensa debil: la rubrica de un solo criterio con exactitud por coincidencia exacta puede sobreestimar o infravalorar la calidad real de las respuestas y favorecer formatos concretos.
- Pesos suboptimos: el mejor paso de validacion (0,427) no esta disponible porque fue eliminado por la rotacion de checkpoints; el artefacto publicado rinde por debajo del maximo de la ejecucion.
- Riesgo de alucinacion: en un dominio de alta criticidad como el medico, el modelo puede generar afirmaciones plausibles pero incorrectas, especialmente si las herramientas de recuperacion no devuelven evidencia o devuelven fuentes de baja calidad.
- Sesgos: no se documenta ninguna evaluacion de sesgo demografico, geografico ni linguistico; se desconoce la composicion del dataset de entrenamiento mas alla de que las tareas fueron generadas por el modelo.
- Cobertura idiomatica desconocida: los idiomas soportados no estan declarados, por lo que no se puede asumir un rendimiento uniforme fuera del idioma o idiomas dominantes del entrenamiento.
- Deriva por RL: al ser un entrenamiento exclusivamente por refuerzo partiendo del modelo base, existe riesgo de degradacion de capacidades generales (lenguaje, instrucciones, codigo) no medidas en la evaluacion publicada.
- Adopcion nula verificable: 0 descargas y 0 likes, sin validacion independiente por parte de terceros.
- Licencia: apache-2.0 permite uso comercial y modificacion, pero no exime de las advertencias anteriores ni de las condiciones del modelo base, cuyos terminos no se detallan en la informacion disponible.
- La busqueda web realizada para esta ficha no devolvio documentacion tecnica relacionada con el modelo: los resultados obtenidos tratan sobre el tetanos y no guardan relacion con el artefacto.

## Enlaces

- HuggingFace: https://huggingface.co/ddvd233/medxpert9b_specgap_ship_retrieval_websearch_global_step_180
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de entrenamiento (verl, referencia del pipeline declarado en las etiquetas): no se proporciona enlace en la informacion disponible.
- Paper o blog tecnico del experimento RRIMed: no disponible.
- Demo o espacio de inferencia: no disponible.
- Resultados de la busqueda web: no relevantes para el modelo. Las paginas devueltas (https://de.wikipedia.org/wiki/Tetanus, https://gesund.bund.de/tetanus, https://en.wikipedia.org/wiki/Tetanus, https://flexikon.doccheck.com/de/Tetanus, https://www.apotheken-umschau.de/krankheiten-symptome/infektionskrankheiten/tetanus-wundstarrkrampf-738005.html) tratan sobre el tetanos y no contienen informacion sobre este modelo ni sobre su evaluacion.
