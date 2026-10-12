# bunnyweb/tidypr-1.5b-gguf

## Resumen

tidypr-1.5b-gguf es un ajuste fino (fine-tune) del modelo unsloth/Qwen2.5-Coder-1.5B-Instruct, publicado por el usuario bunnyweb bajo licencia Apache 2.0. Su proposito no es la generacion de codigo general, sino una tarea muy concreta: analizar hunks de pull requests en Python y detectar lo que el autor denomina "AI slop", es decir, codigo sobre-defensivo, comentarios redundantes, docstrings de relleno, logs con emojis o TODOs de marcador de posicion, devolviendo los hallazgos en formato JSON. Es, por tanto, un modelo especializado en revision automatica de codigo, no un asistente conversacional generalista.

El modelo parte de una arquitectura transformer decoder-only de la familia Qwen2, con aproximadamente 1.540 millones de parametros (1.543.714.304 segun los metadatos de parametros publicados por HuggingFace), y se distribuye en formato GGUF, lo que permite ejecutarlo en local con llama.cpp u Ollama. El autor indica que fue entrenado con LoRA sobre el modelo base y que el conjunto de entrenamiento se compone mayoritariamente de inyecciones sinteticas de los antipatrones que pretende detectar.

Su relevancia actual es limitada pero clara dentro de un nicho: se integra directamente como GitHub Action (thebunnyweb/tidypr@v0) o via CLI sobre un `git diff`, de modo que puede incorporarse a un flujo de CI sin infraestructura GPU dedicada. Es importante senalar que el propio autor lo marca como "early" y recomienda consultar el informe de evaluacion del repositorio antes de confiar en el en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), ajustado con LoRA sobre unsloth/Qwen2.5-Coder-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (1,5 B aproximadamente) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la informacion disponible; el modelo base Qwen2.5-Coder-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | GGUF; los niveles concretos incluidos en el repositorio no estan detallados por el autor |
| Idiomas soportados | no disponibles (la tarea objetivo esta orientada a codigo Python, con prompts previsiblemente en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tamano del repositorio: 4,9 GB) |

Otros metadatos: repositorio con 7 descargas y 1 "like" en el momento de la consulta, tags `gguf`, `code-review`, `python`, `lora`, `endpoints_compatible`, `region:us`, `conversational`. Fechas de creacion y ultima actualizacion indicadas: 2026-10-11 y 2026-10-12.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-Coder-1.5B-Instruct: un transformer decoder-only causal con atencion por grupos de consultas (GQA), normalizacion RMSNorm y embeddings RoPE, preentrenado por el equipo Qwen de Alibaba sobre un corpus masivo de codigo y texto. Sobre ese modelo, bunnyweb aplica un ajuste fino con LoRA (Low-Rank Adaptation) para especializarlo en una unica tarea de clasificacion y extraccion estructurada: identificar antipatrones de estilo en hunks de pull requests Python y emitir los resultados como JSON.

El autor no publica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de alineacion adicionales como RLHF o DPO. Lo que si indica explicitamente en la model card es que el entrenamiento se realizo "mayoritariamente sobre inyecciones sinteticas", es decir, que los ejemplos de antipatrones se generaron artificialmente en lugar de extraerse de repositorios reales. Esta es una decision de diseno relevante porque condiciona la generalizacion del modelo a codigo real. El resultado del ajuste se fusiona con los pesos base y se exporta a GGUF mediante la herramienta tidypr, cuyo repositorio de GitHub se enlaza en la propia model card.

## Capacidades

- Deteccion de "AI slop" en codigo Python: codigo sobre-defensivo (validaciones redundantes, try/except innecesarios), comentarios redundantes que repiten lo que hace el codigo, docstrings de relleno sin informacion util, logs decorados con emojis y comentarios TODO usados como marcador de posicion.
- Analisis de hunks de pull requests: el modelo trabaja sobre fragmentos de diff, no sobre ficheros completos, lo que encaja con el flujo de revision de un PR.
- Salida estructurada en JSON: devuelve los hallazgos en formato parseable, pensado para ser consumido por herramientas de CI/CD.
- Ejecucion local: al distribuirse en GGUF, puede correr con llama.cpp sin conexion a servicios externos.
- Integracion como GitHub Action mediante `thebunnyweb/tidypr@v0` con el parametro `model`.
- Uso por linea de comandos: `git diff main... | tidypr review --diff - --backend llamacpp --model bunnyweb/tidypr-1.5b-gguf`.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente o razonamiento multi-paso: no documentadas; el modelo esta disenado para una tarea acotada de revision.
- Multilinguismo: no documentado en la informacion disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Revision automatica de pull requests en Python: el modelo se conecta como GitHub Action en el flujo de PR y comenta los hunks que contienen antipatrones, con la ventaja de ejecutarse en el runner sin necesidad de GPU ni de enviar el codigo a un tercero.
- Puerta de calidad en CI/CD: integrado como paso obligatorio en la pipeline, puede bloquear la fusion de un PR si el JSON de hallazgos supera un umbral configurable de incidencias.
- Pre-filtrado antes de revision humana: con 1,5 B de parametros y formato GGUF, se ejecuta en portatiles; un revisor humano solo atiende los hunks marcados, reduciendo el tiempo dedicado a leer comentarios redundantes.
- Limpieza de deuda tecnica en repositorios con codigo generado por IA: util para auditar de forma retrospectiva bases de codigo que incorporaron mucho codigo asistido por modelos y acumularon defensividad excesiva o comentarios vacios.
- Formacion de equipos junior: usar los hallazgos JSON como material didactico explicito sobre que se considera ruido en una revision de codigo, con ejemplos concretos extraidos del propio repositorio.
- Analisis de estilo a escala de organizacion: procesar por lotes los diffs de multiples repositorios y agregar estadisticas sobre la frecuencia de cada tipo de antipatron por equipo o por proyecto.
- Prototipado de herramientas de revision personalizadas: al ser Apache 2.0 y un fine-tune LoRA sobre Qwen2.5-Coder, sirve como punto de partida para reentrenar con las reglas de estilo propias de una organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a un informe de evaluacion alojado en el repositorio de tidypr, pero no se incluyen cifras en la model card ni en los metadatos consultados. Tampoco se dispone de comparaciones medidas contra modelos genericos en tareas de deteccion de antipatrones.

## Requisitos de hardware

- VRAM estimada para inferencia: muy inferior a 4 GB en cuantizaciones GGUF habituales; un modelo de 1,5 B en Q4 ocupa del orden de 1 GB de pesos, en Q8 en torno a 1,6 GB y en precision completa aproximadamente 3 GB. Estas cifras son estimaciones basadas en el numero de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente (por ejemplo GTX 1650, RTX 3050, RTX 4060, RTX 4090). En entornos de servidor, una A100 o H100 estan sobredimensionadas para este modelo salvo que se sirvan muchas peticiones concurrentes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada de los ultimos ocho anos, e incluso en iGPU recientes con memoria compartida.
- Ejecucion en CPU: viable sin GPU; el modelo esta pensado para correr en el runner de CI o en un portatil, como demuestra el backend `llamacpp` usado por la herramienta tidypr.
- Opciones de despliegue: llama.cpp y llama-cpp-python (backend documentado por el autor), Ollama, LM Studio, servidores compatibles con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de HuggingFace. vLLM y TGI soportan GGUF de forma limitada o experimental; no hay confirmacion de compatibilidad en la informacion disponible.
- Latencia y throughput estimados: no disponibles. No se publican cifras de tokens por segundo ni de tiempo por revision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bunnyweb/tidypr-1.5b-gguf | 1,5 B | no disponible | Deteccion de antipatrones en hunks de PR Python, salida JSON | Apache 2.0 | GGUF en HuggingFace |
| unsloth/Qwen2.5-Coder-1.5B-Instruct (modelo base) | 1,5 B | 32.768 tokens | Generacion e instruccion general sobre codigo | Apache 2.0 | safetensors y GGUF en HuggingFace |
| Qwen2.5-Coder-7B-Instruct | 7 B | 32.768 tokens | Generacion de codigo y razonamiento general | Apache 2.0 | safetensors y GGUF en HuggingFace |
| Modelos especificos de revision de codigo | no disponible | no disponible | Revision estatica o asistida por LLM | no disponible | no disponible |

No se conocen, en la informacion proporcionada, alternativas publicas directamente comparables en la tarea concreta de deteccion de "AI slop" en diffs. Las comparaciones con el modelo base y con la variante de 7 B son orientativas: miden el mismo punto de partida arquitectonico, no el mismo objetivo funcional, y no hay cifras de benchmark que permitan cuantificar la diferencia. Los analizadores estaticos clasicos (Ruff, Pylint, Flake8) cubren solapamientos parciales en cuanto a estilo, pero no evaluan la naturaleza semantica de un comentario o de una validacion defensiva.

## Limitaciones y advertencias

- Estado "early" declarado por el propio autor: la model card indica explicitamente que el modelo es temprano y recomienda consultar el informe de evaluacion del repositorio antes de confiar en el.
- Entrenamiento sobre inyecciones sinteticas: el autor reconoce que el entrenamiento se hizo mayoritariamente con ejemplos generados artificialmente, lo que puede reducir la capacidad de generalizacion a codigo real con estilos diversos.
- Sesgo de dominio: la tarea esta limitada a Python y a hunks de pull requests. No hay evidencia de funcionamiento en otros lenguajes ni sobre ficheros completos.
- Riesgo de falsos positivos: al ser un modelo generativo y no un analizador determinista, puede marcar codigo legitimo como "slop", lo que en un CI bloqueante generaria friccion. Se recomienda usarlo como aviso y no como puerta bloqueante sin validacion previa.
- Riesgo de alucinacion en la salida JSON: al ser un modelo de 1,5 B, puede producir claves o estructuras JSON malformadas o inventar ubicaciones de linea. Conviene validar el esquema de la respuesta antes de consumirla.
- Idiomas soportados no declarados: no se especifica si el modelo responde correctamente a prompts en castellano o en otros idiomas distintos del ingles.
- Contexto no declarado: el autor no documenta la longitud de contexto utilizada en el ajuste; los diffs muy largos podrian truncarse. El modelo base soporta 32.768 tokens, pero el ajuste con LoRA puede no haber sido entrenado con esa longitud.
- Licencia: Apache 2.0, que permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. Al derivar del modelo base, se heredan sus condiciones, tambien Apache 2.0.
- Trazabilidad: el repositorio tiene un volumen de descargas muy bajo (7) y un unico "like", por lo que no existe una comunidad amplia que haya validado el comportamiento en produccion.
- Anomalia en los metadatos: las fechas de creacion y actualizacion indicadas en HuggingFace (octubre de 2026) son posteriores a la publicacion del modelo base Qwen2.5, lo que sugiere un posible error de metadatos que conviene no interpretar como una version reciente.
- Sin resultados de benchmark publicos: no hay forma de cuantificar la tasa de acierto frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bunnyweb/tidypr-1.5b-gguf
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-1.5B-Instruct
- Repositorio de la herramienta tidypr: https://github.com/thebunnyweb/tidypr
- GitHub Action: https://github.com/thebunnyweb/tidypr (uso: `uses: thebunnyweb/tidypr@v0`)
- Perfil del autor en HuggingFace: https://huggingface.co/bunnyweb
- Informe de evaluacion citado por el autor: alojado en el repositorio de tidypr; no se ha localizado una URL directa en la informacion disponible.
