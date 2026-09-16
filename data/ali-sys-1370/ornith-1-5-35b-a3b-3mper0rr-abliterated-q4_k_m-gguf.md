# ali-sys-1370/Ornith-1.5-35B-A3B-3MPER0RR-abliterated-Q4_K_M-GGUF

## Resumen

Ornith-1.5-35B-A3B-3MPER0RR-abliterated-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo `3MPER0RR/Ornith-1.5-35B-A3B-3MPER0RR-abliterated`, publicada por el usuario ali-sys-1370. Se trata, por tanto, de un artefacto derivado: el repositorio no entrena ni modifica los pesos, sino que convierte el checkpoint original a Q4_K_M mediante el espacio GGUF-my-repo de ggml.ai y llama.cpp. El interés práctico del repositorio es servir como punto de descarga directa para ejecutar el modelo en llama.cpp, llama-server u otros runtimes compatibles con GGUF sin necesidad de convertir los pesos originales.

El nombre del modelo indica dos rasgos relevantes. Por un lado, "35B-A3B" sigue la convención habitual para arquitecturas de mezcla de expertos (MoE), donde el total de parámetros ronda los 35.000 millones y la fracción activa por token sería de aproximadamente 3.000 millones. Por otro, el sufijo "abliterated" señala que el checkpoint base ha sido sometido a una técnica de eliminación de direcciones de rechazo (abliteration), orientada a reducir las negativas del modelo ante peticiones que un modelo alineado convencional rechazaría.

El dato verificable de tamaño es de 34.660.610.688 parámetros totales, coherente con la nomenclatura. No hay información publicada en el repositorio sobre arquitectura exacta, longitud de contexto, idiomas, composición del dataset ni proceso de alineación. La relevancia actual del modelo es acotada: se trata de una publicación de cuantización con cero descargas y cero likes en el momento de la consulta, sin model card propia más allá del texto generado automáticamente por la herramienta de conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La nomenclatura "A3B" sugiere mezcla de expertos (MoE), sin confirmacion documental |
| Parametros totales | 34.660.610.688 (aproximadamente 34,7 mil millones) |
| Parametros activos | No disponible. El sufijo "A3B" sugiere del orden de 3 mil millones de parametros activos por token, sin confirmacion |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (unica publicada en este repositorio) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 21,2 GB |
| Modelo base | 3MPER0RR/Ornith-1.5-35B-A3B-3MPER0RR-abliterated |
| Pipeline declarado | text-generation |
| Descargas / likes | 0 / 0 en la fecha de consulta |
| Fecha de publicacion declarada | 2026-09-16 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base. El identificador "35B-A3B" es la unica pista estructural y apunta a un transformer disperso con mezcla de expertos: un total cercano a 35.000 millones de parametros de los cuales se activarian aproximadamente 3.000 millones por token, patron habitual en modelos tipo Qwen3-30B-A3B o similares. Esta interpretacion no esta confirmada por ninguna fuente del repositorio ni por la model card, que se limita a indicar que el modelo se convirtio a GGUF desde el checkpoint original.

Tampoco hay datos sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineacion. Lo unico reseñable en terminos tecnicos es el proceso de abliteration aplicado al checkpoint original, que consiste en identificar la direccion latente asociada a las respuestas de rechazo y proyectarla fuera de los pesos, de forma que el modelo deja de activar ese comportamiento de manera sistematica. Las consecuencias practicas de este procedimiento se detallan en la seccion de limitaciones. La cuantizacion Q4_K_M, por su parte, es una cuantizacion de 4 bits con escalas mixtas por bloque, un compromiso habitual entre tamano y degradacion de calidad.

## Capacidades

- Generacion de texto autoregresiva en el pipeline `text-generation`, con el comportamiento propio del modelo base subyacente.
- Ausencia de filtros de rechazo en gran medida: al estar abliterado, tiende a responder a peticiones que un modelo alineado rechazaria, incluyendo contenido sensible.
- Ejecucion local en CPU y GPU mediante llama.cpp, sin dependencia de APIs externas.
- Compatibilidad con el ecosistema de endpoints declarada en las etiquetas del repositorio (`endpoints_compatible`).
- Soporte de tool calling, agentes, modo de razonamiento extendido, vision o audio: no disponible; no hay ninguna referencia en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- No se documentan capacidades especiales adicionales (thinking mode, decodificacion especulativa, contexto largo) mas alla de las inferibles por la nomenclatura.

## Casos de uso

- Escritura creativa y narrativa sin restricciones: el modelo puede generar ficcion, dialogos y tramas con tematica adulta o violenta que otros modelos rechazarian, lo que lo hace util para autores que trabajan genero negro, terror o narrativa transgresora en local.
- Investigacion en seguridad y red-teaming: sirve como linea base "sin alineacion" para comparar el comportamiento de un modelo tras aplicar abliteration frente al modelo original, midiendo tasas de cumplimiento ante conjuntos de peticiones maliciosas.
- Generacion de datos sinteticos para fine-tuning: al no bloquear ciertos temas, puede producir corpus de ejemplos que otros modelos se niegan a generar, utiles para entrenar clasificadores de contenido o filtros de moderacion por contraste.
- Asistente conversacional 100 % offline: desplegado con llama-server en una maquina local, permite mantener conversaciones sobre documentos sensibles (expedientes medicos, asuntos legales) sin enviar datos a terceros, siempre que el usuario acepte el riesgo de contenido sin filtrar.
- Analisis de textos sensibles en dominios como derecho penal, criminologia o medicina forense, donde un modelo sobre-alineado puede negarse a procesar material explicito que forma parte legitima del trabajo.
- Simulacion de personajes y roleplay multi-turno en entornos de ocio, aprovechando la ausencia de negativas y la posibilidad de fijar system prompts con personalidades concretas mediante llama.cpp o interfaces compatibles.
- Evaluacion de despliegue en hardware de consumo: al ser una cuantizacion Q4_K_M de unos 21 GB, permite probar un modelo de casi 35.000 millones de parametros en equipos con 24 GB de VRAM o menos mediante offload parcial.

En todos los casos, la idoneidad depende de capacidades que no estan documentadas (contexto, idiomas, calidad real), por lo que cualquier uso en produccion exige una evaluacion previa propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la model card remite al modelo original, del cual tampoco se han recuperado datos de evaluacion en la busqueda realizada. Tampoco se dispone de mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M ocupa aproximadamente 21,2 GB. Con overhead de contexto y cache KV, el consumo realista se situa en torno a 22-26 GB en GPU, dependiendo de la longitud de contexto configurada (los ejemplos de la model card usan `-c 2048`, un valor conservador).
- GPU de gama profesional: una sola A100 de 40 GB u H100 de 80 GB aloja el modelo completo con margen amplio de contexto. Una A100 de 40 GB es suficiente para contexto medio-largo.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 de 24 GB con contexto corto y ajustando el numero de capas descargadas a GPU; con contextos amplios lo mas probable es necesitar offload parcial a CPU o una segunda GPU.
- Configuraciones multi-GPU: dos RTX 3090 o 4090 permiten repartir capas y mantener todo el modelo en VRAM con contexto holgado.
- Apple Silicon: viable en equipos con memoria unificada de 32 GB o superior (M2 Pro/Max, M3 Max, M4 Max), usando Metal en llama.cpp.
- Solo CPU: posible con llama.cpp y RAM suficiente (32 GB o mas), pero con throughput muy bajo, del orden de pocos tokens por segundo y no medido en este repositorio.
- Opciones de despliegue: llama.cpp (CLI y servidor), llama-server con endpoint compatible con OpenAI, Ollama importando el GGUF con un Modelfile, LM Studio, koboldcpp y otros frontends compatibles con GGUF. El soporte de GGUF en vLLM y TGI es parcial o experimental, por lo que no es la via recomendada para este artefacto.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

La informacion proporcionada no describe la familia "Ornith" ni incluye benchmarks, por lo que no es posible establecer una comparacion verificada. La tabla siguiente recoge unicamente referencias externas de caracteristicas ampliamente documentadas de modelos de tamano y planteamiento comparables, marcadas como referencia y no como dato extraido de este repositorio.

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato de este tipo |
|---|---|---|---|---|
| Ornith-1.5-35B-A3B-3MPER0RR-abliterated (Q4_K_M) | 34,7 B / no disponible (sugerido ~3 B) | No disponible | MIT | GGUF |
| Qwen3-30B-A3B | 30,5 B / 3,3 B | 128 K (referencia externa) | Apache-2.0 | safetensors y GGUF |
| GLM-4-32B-0414 (denso) | 32 B / 32 B | 128 K (referencia externa) | MIT | safetensors y GGUF |
| Mixtral-8x7B (MoE) | 46,7 B / 12,9 B | 32 K (referencia externa) | Apache-2.0 | safetensors y GGUF |

Salvedad importante: los datos de las filas de Qwen3, GLM-4 y Mixtral provienen de conocimiento general sobre esas familias y no de la busqueda web realizada, que no devolvio ningun resultado relevante (los resultados obtenidos eran paginas de comercio electronico sin relacion con el modelo). No se dispone de ninguna comparacion de rendimiento entre Ornith-1.5 y estos modelos.

## Limitaciones y advertencias

- Modelo abliterado: la eliminacion de las direcciones de rechazo incrementa de forma significativa la probabilidad de generar contenido ofensivo, ilegal, peligroso o sexualmente explicito. No es adecuado para aplicaciones de cara al publico sin una capa de moderacion externa.
- Riesgo de alucinacion: no se dispone de evaluaciones de fidelidad factual ni de benchmarks que permitan acotar la tasa de invencion de datos. En un modelo sin alineacion, la alucinacion puede ademas combinarse con afirmaciones daninas formuladas con seguridad.
- Efecto colateral de la abliteration: la eliminacion de direcciones de rechazo suele degradar la coherencia general, la adherencia a instrucciones y el rendimiento en tareas de razonamiento. No hay datos que cuantifiquen esa perdida en este caso.
- Sin informacion sobre contexto ni idiomas: no se puede planificar un caso de uso que dependa de ventanas largas o de cobertura multilingue concreta sin una evaluacion empirica previa.
- Cuantizacion Q4_K_M: introduce perdida adicional de calidad respecto al checkpoint original en precision completa. No se publican comparaciones entre la version cuantizada y el modelo base.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, pero la licencia del modelo base es la que el autor original haya fijado; conviene verificar el repositorio de origen antes de un uso comercial. El repositorio no reproduce la licencia del modelo original mas alla de la etiqueta.
- Trazabilidad dudosa: el autor de la cuantizacion es un usuario individual, el modelo tiene cero descargas y cero likes, y las fechas declaradas de creacion y actualizacion (16 de septiembre de 2026) son posteriores a la fecha habitual de consulta, lo que sugiere metadatos erroneos. La calidad y la integridad del artefacto no estan verificadas por terceros.
- Sin model card propia: el README es el texto generado automaticamente por GGUF-my-repo. No hay informacion del autor original sobre datos de entrenamiento, sesgos conocidos ni evaluaciones.
- Uso responsable: cualquier despliegue deberia incorporar filtros de entrada y salida, registro de interacciones y una evaluacion de riesgos acorde con el contexto de aplicacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ali-sys-1370/Ornith-1.5-35B-A3B-3MPER0RR-abliterated-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/3MPER0RR/Ornith-1.5-35B-A3B-3MPER0RR-abliterated
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; las busquedas devolvieron unicamente paginas de comercio electronico sin relacion con el modelo.
