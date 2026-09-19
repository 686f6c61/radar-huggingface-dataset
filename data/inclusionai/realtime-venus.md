# inclusionAI/Realtime-Venus

## Resumen

Realtime-Venus es un sistema de interacción multimodal en tiempo real desarrollado por inclusionAI (equipo vinculado a Ant Group) y publicado bajo licencia Apache 2.0. Su rasgo diferencial es el funcionamiento full-duplex: el modelo sigue percibiendo audio y vídeo mientras habla, distingue solapamientos de voz (backchannels, interrupciones, correcciones y redirecciones) y puede iniciar una respuesta de forma proactiva sin esperar a que el usuario formule una petición explícita.

El repositorio aloja dos checkpoints de 9B construidos sobre la misma columna vertebral de streaming: Realtime-Venus-Omni, que procesa vídeo, imagen, audio y texto, y Realtime-Venus-Audio, centrado en comprensión de audio y conversación por voz. Ambos derivan de MiniCPM-o 4.5 / Omni-Flow, con un backbone de lenguaje Qwen3-8B, un encoder visual SigLIP2, un encoder de audio Whisper-Medium y generación de habla mediante tokens discretos S3 con un decodificador flow-matching en streaming (Token2wav). La longitud de contexto es de 40.960 tokens en los dos casos.

Su relevancia actual está en dos innovaciones poco comunes: la delegación asíncrona, que emite peticiones `<delegate>` dentro de la misma línea temporal causal y consume resultados externos sin bloquear el diálogo, y una memoria para vídeo largo que no requiere entrenamiento adicional, ya que archiva momentos visualmente informativos y recupera evidencia relevante para reconstruir el contexto audiovisual. El sistema es de pesos abiertos (38,8 GB de repositorio), requiere código personalizado de Transformers y su capa de ejecución de herramientas vive en un repositorio aparte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal omni basada en MiniCPM-o 4.5 / Omni-Flow; encoder visual SigLIP2, encoder de audio Whisper-Medium, backbone de lenguaje Qwen3-8B y decodificador de habla flow-matching en streaming |
| Parametros totales | 9B (cada checkpoint: Omni y Audio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | no disponible (los pesos se publican en BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fragmentados, `model-*.safetensors`), junto con codigo personalizado de Transformers; la etiqueta del repositorio incluye tambien onnx |

## Arquitectura y entrenamiento

La informacion disponible no detalla el numero de tokens de entrenamiento ni la composicion del dataset. La model card si especifica la arquitectura: ambos checkpoints parten de MiniCPM-o 4.5 / Omni-Flow. El checkpoint Omni incorpora un encoder visual SigLIP2 junto a un encoder de audio Whisper-Medium y un backbone de lenguaje Qwen3-8B; el checkpoint Audio prescinde del encoder visual en inferencia y mantiene Whisper-Medium y Qwen3-8B. La generacion de habla se apoya en tokens discretos S3 decodificados por un decodificador flow-matching en streaming, con recursos Token2wav y una voz de referencia incluidas en el repositorio. No se documenta en el material proporcionado si hubo RLHF, DPO u otras etapas de alineamiento.

Las innovaciones tecnicas declaradas son tres. Primero, la conversacion full-duplex nativa, que permite percibir mientras se habla y clasificar senales de solapamiento como backchannels, interrupciones, correcciones y redirecciones. Segundo, la delegacion asincrona: el modelo emite solicitudes `<delegate>` en la linea temporal causal compartida y consume los resultados de tareas externas por la misma via, de modo que una busqueda o un calculo no bloquea la conversacion en curso; ejecutar esas peticiones exige el runtime Realtime-Venus-Harness, alojado en el repositorio de GitHub. Tercero, una memoria para video largo sin entrenamiento adicional, que archiva momentos visualmente informativos, recupera evidencia relevante y no redundante para la consulta y reensambla el contexto audiovisual correspondiente.

## Capacidades

- Interaccion audiovisual proactiva: procesa video y audio alineados temporalmente y decide por si mismo si y cuando responder, sin prompt explicito.
- Dialogo full-duplex: mantiene la percepcion activa durante la generacion de habla y gestiona interrupciones semanticas y solapamientos de voz.
- Salida dual de texto y habla: genera la respuesta textual y, de forma opcional, la onda de voz mediante los recursos Token2wav y una voz de referencia.
- Comprension de audio: el checkpoint Realtime-Venus-Audio cubre understanding de audio y conversacion guiada por voz con salida de texto o habla.
- Comprension de video e imagen: el checkpoint Omni acepta video, imagenes, audio y texto como entradas.
- Delegacion a herramientas externas: emision y consumo de peticiones `<delegate>` en streaming, con ejecucion asincrona a traves de Realtime-Venus-Harness.
- Memoria de video largo sin reentrenamiento: archivado y recuperacion de evidencia audiovisual relevante para secuencias extensas.
- Multilingue limitado a ingles y chino segun la model card.
- No se documenta en la informacion disponible soporte explicito de function calling clasico con esquemas JSON, ni capacidades de vision mas alla de SigLIP2, ni modo thinking.

## Casos de uso

- Atencion al cliente por voz en tiempo real: el modelo puede mantener una conversacion telefonica o por videollamada, escuchar mientras responde y clasificar interrupciones y correcciones como senales distintas de un turno nuevo, lo que evita respuestas solapadas o cortes bruscos.
- Analisis y moderacion de reuniones en directo: al procesar video y audio alineados y disponer de 40.960 tokens de contexto, puede resumir, extraer acuerdos y senalar incidencias mientras la reunion transcurre, sin esperar a la grabacion final.
- Teleasistencia y acompanamiento continuo: la interaccion proactiva permite que el sistema tome la iniciativa cuando detecta un evento relevante (una caida, un silencio prolongado, una palabra clave) en lugar de limitarse a responder bajo demanda.
- Accesibilidad para personas con discapacidad visual: descripcion proactiva de escenas en directo a partir del flujo de video, con intervenciones disparadas por eventos y capacidad de reaccionar a preguntas intercaladas del usuario.
- Revision de video largo (vigilancia, deporte, material docente): la memoria sin entrenamiento archiva los momentos informativos y recupera evidencia no redundante, de modo que se puede preguntar por eventos concretos de una secuencia extensa sin reinyectar todo el material.
- Agentes conversacionales con herramientas: mediante la delegacion asincrona, el modelo puede lanzar una consulta a un backend externo o un calculo en mitad de una conversacion por voz y seguir hablando, consumiendo el resultado cuando llega sin bloquear el turno.
- Kioscos interactivos y robotica de recepcion: al no requerir un prompt para intervenir, encaja en puntos de informacion donde el sistema debe captar cuando un usuario se aproxima o formula una pregunta ambigua y ofrecer ayuda de forma espontanea.
- Analitica de llamadas con el checkpoint Audio: transcripcion, resumen y extraccion de senales de calidad conversacional en flujos de audio, con salida de texto o de habla segun el caso.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card remite a la figura 1 del informe tecnico (resultados de comprension de video para Omni y de comprension de audio para Audio) y a la figura 2 (resultados de interaccion full-duplex en manejo de interrupciones y continuacion ante distintos tipos de habla solapada), pero los valores concretos no se incluyen en el material proporcionado y no deben inferirse.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 de un modelo de 9B ocupan aproximadamente 18 GB; sumando el encoder de audio Whisper-Medium, el encoder visual SigLIP2 en el checkpoint Omni y la cache KV para 40.960 tokens, es razonable prever del orden de 26 a 32 GB en BF16 para Omni y algo menos para Audio. Son estimaciones derivadas del tamano y no cifras publicadas por el autor.
- GPU recomendadas (estimacion): A100 40 GB o 80 GB, H100, L40S 48 GB o similares con al menos 32-40 GB de VRAM para el modo Omni en BF16.
- GPU de consumo: una RTX 4090 de 24 GB queda por debajo del margen comodo estimado en BF16 con contexto completo; seria necesario reducir la longitud de contexto o aplicar cuantizacion no documentada oficialmente. No hay confirmacion del autor sobre funcionamiento en GPU de consumo.
- Opciones de despliegue: el repositorio se distribuye con codigo personalizado de Transformers y requiere `custom-code`; las interacciones delegadas necesitan el runtime Realtime-Venus-Harness. La etiqueta onnx sugiere exportaciones ONNX y la etiqueta `endpoints_compatible` apunta a compatibilidad con endpoints alojados, pero no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. El diseno esta orientado a streaming en tiempo real (audio y video continuos, decodificacion de habla flow-matching incremental), pero no se publican cifras de latencia ni de tokens por segundo en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entradas / salidas | Full-duplex | Licencia |
|---|---|---|---|---|---|
| Realtime-Venus-Omni | 9B | 40.960 tokens | Video, imagen, audio, texto / texto y habla | Si | Apache 2.0 |
| Realtime-Venus-Audio | 9B | 40.960 tokens | Audio, texto / texto y habla | Si | Apache 2.0 |
| MiniCPM-o 4.5 (arquitectura base declarada) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Alternativas de dialogo de voz full-duplex (por ejemplo, propuestas tipo Moshi o Qwen-Omni) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La model card unicamente identifica MiniCPM-o 4.5 / Omni-Flow como base de la que se adaptan ambos checkpoints. No se incluyen en el material proporcionado datos comparativos de parametros, contexto, rendimiento o licencia frente a otras familias omni, por lo que no se aportan cifras de terceros.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; no hay evidencia de soporte para castellano ni para otras lenguas, lo que limita su uso en produccion en mercados hispanohablantes.
- Benchmarks: la model card no publica cifras numericas; las evaluaciones se remiten a figuras del informe tecnico, de modo que la comparacion objetiva con alternativas exige consultar el paper.
- Dependencia de codigo personalizado: el repositorio usa `custom-code` de Transformers, lo que complica la actualizacion de versiones y la integracion con servidores de inferencia estandar.
- Delegacion condicionada: la emision y el consumo de peticiones `<delegate>` solo resultan utiles con el runtime Realtime-Venus-Harness, alojado fuera del repositorio de HuggingFace; sin el, la funcionalidad queda inoperativa.
- Riesgo de alucinacion: en comprension de video largo y en descripcion proactiva de escenas, la recuperacion de evidencia de la memoria y la iniciativa del modelo pueden producir afirmaciones sobre eventos no observados. La memoria sin entrenamiento no garantiza exhaustividad de lo archivado.
- Sesgos: no se documentan analisis de sesgos ni composicion del dataset de entrenamiento, por lo que se desconocen sesgos de genero, raza, acento o idioma heredados de los encoders SigLIP2 y Whisper-Medium y del backbone Qwen3-8B.
- Contexto: 40.960 tokens es un limite finito; la gestion de video largo depende del mecanismo de memoria, no de ampliar la ventana.
- Habla: la generacion de voz usa una voz de referencia incluida en el repositorio; no se detallan opciones de clonacion, control de prosodia ni cobertura de acentos.
- Adopcion: el modelo registra 0 descargas en el momento de la consulta, con lo que la validacion en produccion por parte de terceros es practicamente inexistente.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene verificar las obligaciones de atribucion y las licencias de los componentes derivados (MiniCPM-o 4.5, Qwen3-8B, Whisper-Medium, SigLIP2) antes de desplegar.
- Requisitos: 38,8 GB de repositorio y pesos en BF16 implican infraestructura con GPU de gama alta; no se documentan versiones cuantizadas oficiales.

## Enlaces

- HuggingFace: https://huggingface.co/inclusionAI/Realtime-Venus
- ModelScope: https://www.modelscope.cn/models/inclusionAI/Realtime-Venus
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.13814
- Version HTML del paper: https://arxiv.org/html/2609.13814v1
- Pagina del proyecto: https://realtime-venus.github.io/
- Repositorio GitHub (incluye Realtime-Venus-Harness): https://github.com/inclusionAI/Realtime-Venus
- Licencia Apache 2.0: https://huggingface.co/inclusionAI/Realtime-Venus/blob/main/LICENSE
