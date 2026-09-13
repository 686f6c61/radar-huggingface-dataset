# metaevo-ai/ahd-9b-ssb

## Resumen

ahd-9b-ssb es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-9B, publicado por el usuario metaevo-ai en HuggingFace. Se trata de un modelo de lenguaje de 9.653.104.368 parametros (aproximadamente 9,65 mil millones) distribuido en formato safetensors bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales declaradas por el autor. El repositorio ocupa 20,5 GB, un tamano coherente con pesos almacenados en bfloat16 (9,65B x 2 bytes ≈ 19,3 GB) mas ficheros auxiliares.

La relevancia de esta ficha es limitada pero concreta: se trata de un derivado de una familia reciente (Qwen3.5) que, segun el ejemplo de despliegue incluido en su propia model card, esta pensado para servirse con vLLM habilitando tool calling y una ventana de hasta 65.536 tokens. Esto lo situa en el segmento de modelos de ~9B orientados a agentes y flujos con herramientas, un nicho muy demandado por su relacion entre coste de inferencia y capacidades.

Sin embargo, la informacion publicada es minima: la model card no describe el dataset de entrenamiento, no indica idiomas soportados, no aporta resultados de evaluacion y no detalla ninguna innovacion tecnica propia. Con 2 descargas y 0 likes en el momento de la consulta, no existe validacion comunitaria ni evidencia independiente de calidad. Esta ficha refleja por tanto lo verificable y marca explicitamente como "no disponible" todo lo que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; heredada del modelo base Qwen/Qwen3.5-9B (tag de HuggingFace: `qwen3_5`) |
| Parametros totales | 9.653.104.368 (≈ 9,65B) |
| Parametros activos | No aplica segun la informacion disponible (no se declara arquitectura MoE) |
| Longitud de contexto | 65.536 tokens, segun el ejemplo de despliegue con `--max-model-len 65536` de la model card; la ventana nativa del modelo base no se especifica |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene pesos en safetensors (no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B (fine-tune) |
| Tamano del repositorio | 20,5 GB |
| Fecha de publicacion | 11 de septiembre de 2026 (ultima actualizacion: 12 de septiembre de 2026) |
| Descargas / likes | 2 descargas, 0 likes |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna mas alla de su procedencia: el modelo es un fine-tune del checkpoint Qwen/Qwen3.5-9B, etiquetado en HuggingFace con el tag `qwen3_5`. Por tanto, se puede afirmar que hereda la arquitectura del modelo base (familia Qwen3.5), pero el autor no publica en la model card ni el numero de capas, ni la configuracion de atencion, ni el tipo de normalizacion, ni si emplea tecnicas como GQA o decodificacion especulativa. Tampoco se declara si es un transformer denso o cualquier variante hibrida.

Respecto al entrenamiento, el README se limita a una frase: "Fine-tuned from Qwen/Qwen3.5-9B". No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT supervisado, ni que hiperparametros se usaron. Los acronimos del nombre del modelo ("ahd" y "ssb") no se explican en ninguna parte del repositorio, por lo que no es posible inferir el objetivo del ajuste. Esta ausencia de documentacion es la limitacion mas relevante de la ficha: cualquier evaluacion de calidad del fine-tune requeriria pruebas propias.

## Capacidades

- Generacion de texto autoregresiva en el rango de los 9,65B de parametros, con la calidad base heredada de Qwen3.5-9B (no verificada de forma independiente para este checkpoint).
- Soporte de tool calling / function calling: el ejemplo de despliegue del autor usa `--enable-auto-tool-choice --tool-call-parser qwen3_xml`, lo que indica compatibilidad con el parser de herramientas en formato XML de la familia Qwen3 servido sobre vLLM.
- Capacidad de operar como agente en flujos multi-paso, siempre que el framework cliente gestione el bucle de llamadas a herramientas; el modelo solo aporta la generacion de la llamada.
- Manejo de contextos largos de hasta 65.536 tokens segun la configuracion de despliegue sugerida, adecuado para documentos extensos y conversaciones multi-turno largas.
- Capacidades multilingues: no disponibles. No se declara ninguna lista de idiomas, aunque el modelo base Qwen3.5-9B probablemente herede un soporte amplio que no se puede confirmar con la informacion aportada.
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponibles. No se menciona ninguna en la model card.
- Compatibilidad de carga con `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer`, en `bfloat16` y con `device_map="auto"`.

## Casos de uso

- Asistente conversacional multi-turno autoalojado: con una ventana de 65.536 tokens, el modelo puede mantener historiales largos de conversacion y documentos de contexto sin truncar, lo que resulta util para asistentes internos de empresa donde los datos no pueden salir de la infraestructura propia.
- Agentes con acceso a herramientas: gracias al soporte del parser `qwen3_xml` en vLLM, se puede integrar en frameworks de agentes que expongan APIs (busqueda, bases de datos, calculo) y dejar que el modelo genere las llamadas estructuradas.
- Generacion y refactorizacion de codigo en pipelines de CI/CD: el modelo puede insertarse como paso automatico de revision o generacion de parches, invocando herramientas del repositorio (lectura de ficheros, ejecucion de tests) mediante function calling.
- Procesamiento de documentos largos (contratos, informes tecnicos, expedientes): extraccion de entidades, resumen estructurado y respuesta a preguntas sobre un unico documento de decenas de miles de tokens en una sola pasada.
- RAG sobre corpus internos: al ser Apache 2.0 y poder desplegarse on-premise, encaja como generador en arquitecturas retrieval-augmented generation donde la confidencialidad impide usar APIs de terceros.
- Etiquetado y clasificacion por lotes: con vLLM se puede servir el modelo y procesar grandes volumenes de texto en modo offline para categorizacion, analisis de sentimiento o normalizacion de datos.
- Base para ajustes adicionales: al ser un fine-tune ya existente sobre Qwen3.5-9B con licencia permisiva, sirve como punto de partida para experimentos de alineacion (SFT, DPO) en dominios verticales.
- Prototipado en estacion de trabajo: 9,65B parametros permite experimentar en una GPU de 24 GB si se aplica cuantizacion, aunque el autor no publica pesos cuantizados y habria que generarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, MT-Bench ni similares), no se aportan comparaciones con el modelo base ni con alternativas, y la busqueda web realizada no ha devuelto ninguna fuente tecnica relacionada con este modelo. Cualquier cifra de rendimiento que se publicase en el futuro deberia compararse contra Qwen/Qwen3.5-9B para medir si el fine-tune aporta mejora o degradacion.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 19,3 GB solo para los pesos, mas la memoria de la cache KV. El calculo exacto de esta ultima no es posible porque se desconocen el numero de capas, el numero de cabezas KV y la dimension de cabeza del modelo base.
- VRAM con cuantizacion INT8/FP8: en torno a 9,7 GB para los pesos, mas cache KV. Requiere generar la cuantizacion, ya que no se publica ninguna.
- VRAM con cuantizacion de 4 bits: aproximadamente 5-6 GB para los pesos, mas cache KV.
- GPU recomendadas para bfloat16: A100 40/80 GB, H100 80 GB, L40S 48 GB o A6000 48 GB, donde el modelo cabe con margen amplio para contexto largo. Una RTX 4090 o RTX 3090 de 24 GB puede alojarlo en bfloat16 solo con contextos relativamente cortos, dado que los pesos ya consumen ~19,3 GB.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 4090, RTX 3090, RTX 5090) en bfloat16 con contexto reducido, o con mas holgura en cuantizacion de 8 y 4 bits una vez generadas.
- Opciones de despliegue verificadas: vLLM, con la configuracion exacta que propone el autor (`vllm serve metaevo-ai/ahd-9b-ssb --enable-auto-tool-choice --tool-call-parser qwen3_xml --max-model-len 65536`), y transformers con `AutoModelForCausalLM` en `bfloat16` y `device_map="auto"`.
- Otras opciones (llama.cpp, Ollama, TGI, SGLang): no disponibles. No se han publicado pesos GGUF ni se documenta compatibilidad con estos servidores.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Pesos | Estado |
|---|---|---|---|---|---|
| metaevo-ai/ahd-9b-ssb | 9,65B | 65.536 tokens (segun configuracion de despliegue) | Apache 2.0 | safetensors | Publicado, 2 descargas |
| Qwen/Qwen3.5-9B (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Referenciado como base del fine-tune |
| Alternativas de ~8-9B (por ejemplo, la familia Qwen3 o Llama 3.x) | No disponible | No disponible | No disponible | No disponible | No se aportan datos verificados en la informacion proporcionada |

No es posible establecer una comparativa cuantitativa con alternativas de la misma categoria porque la informacion proporcionada no incluye especificaciones del modelo base ni resultados de evaluacion de este checkpoint. La unica comparacion defendible con los datos disponibles es la que enfrenta ahd-9b-ssb con Qwen/Qwen3.5-9B: mismo numero de parametros (el fine-tune no altera el tamano) y misma licencia declarada, pero sin evidencia de mejora en ninguna tarea.

## Limitaciones y advertencias

- Ausencia total de documentacion de entrenamiento: no se conocen dataset, numero de tokens, metodo de alineacion ni hiperparametros, lo que impide auditar el modelo o reproducir el ajuste.
- Sin evaluacion publicada: no existe ninguna medida de calidad, ni comparacion con el modelo base que demuestre que el fine-tune aporta valor. Existe riesgo real de degradacion respecto a Qwen/Qwen3.5-9B en tareas generales.
- Riesgo de alucinacion: inherente a los modelos de ~9B, y agravado aqui porque no hay evaluaciones de fidelidad ni de tasa de error.
- Sesgos conocidos: no disponibles. Al no documentarse la composicion del dataset de ajuste, no se puede estimar que sesgos se han introducido o amplificado.
- Idiomas soportados: no disponibles. Aunque el modelo base sea multilingue, el fine-tune podria haber reducido el rendimiento en idiomas distintos del usado en el ajuste, especialmente si el dataset era de un solo idioma o de dominio tecnico.
- Ambiguedad de nomenclatura: los acronimos "ahd" y "ssb" no se explican, por lo que se desconoce el proposito declarado del ajuste.
- Soporte de herramientas dependiente del servidor: el tool calling requiere vLLM con el parser `qwen3_xml`; en otros entornos (transformers puro, llama.cpp) no hay garantia de que el formato XML se interprete correctamente.
- Sin pesos cuantizados ni GGUF: quien quiera ejecutarlo en hardware modesto debe generar sus propias cuantizaciones y validarlas, con el riesgo de degradacion que ello implica.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene verificar de forma independiente la licencia del modelo base Qwen/Qwen3.5-9B, no incluida en la informacion proporcionada, por si impone condiciones adicionales o requisitos de atribucion.
- Adopcion practicamente nula (2 descargas, 0 likes): no existe retroalimentacion de la comunidad, ni issues, ni casos de exito documentados. No se recomienda su uso en produccion sin una evaluacion interna previa contra el modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/metaevo-ai/ahd-9b-ssb
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Pagina del autor en HuggingFace: https://huggingface.co/metaevo-ai
- Papers, blogs, repositorios o demos adicionales: no disponibles. La busqueda web realizada no devolvio ninguna fuente relacionada con el modelo; los resultados obtenidos correspondian a un producto de gestion de facturas sin vinculacion alguna con este proyecto.
