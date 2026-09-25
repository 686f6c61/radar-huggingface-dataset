# Praveenrajus/jevify-smollm3-3b-apo-readout-coh

## Resumen

`jevify-smollm3-3b-apo-readout-coh` es un modelo de decisión de tipo "System One" publicado por Praveen Raj (usuario `Praveenrajus`) dentro del ecosistema Jevify. No es un generador de texto: recibe un `state` (por ejemplo, el texto de una reseña) y responde a preguntas tipadas sobre él (`choice`, elección entre opciones; `score`, puntuación sobre niveles ordenados; `noul`, sí/no con probabilidad), devolviendo distribuciones de probabilidad calibradas sobre las que el código puede ramificar. La respuesta se lee directamente de la distribución del siguiente token en la posición de respuesta, en una única pasada forward y sin decodificación autoregresiva ni parseo posterior.

Técnicamente es un adaptador LoRA de rango 16 con 30.228.480 parámetros sobre el checkpoint `HuggingFaceTB/SmolLM3-3B-checkpoints` (fijado al commit `cfb32d505f5025ec9be4e704f70cfbf5bdf8da94`), fusionado en los pesos en el momento de la carga. El entrenamiento combina la regla de puntuación propia del primitivo sobre el *decision readout* con una penalización de coherencia de peso 1.0, que exige consistencia mutua entre preguntas derivadas de la misma familia (opciones reformuladas como sí/no, la negación, preguntas de umbral de una escala).

Su relevancia práctica está en las cifras de calibración: 0.708 de exactitud y 0.055 de ECE en las particiones de test de jev-bench (22.773 registros), frente a 0.539 de exactitud y 0.117 de ECE del checkpoint base sin ajustar. Un ECE bajo permite fijar umbrales de confianza en producción con garantías, algo que los clasificadores generativos convencionales no ofrecen. El repositorio ocupa 0.1 GB (solo adaptador y configuraciones) y se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone SmolLM3-3B) con adaptador LoRA de rango 16 fusionado en carga; uso como modelo de decisión con lectura de logprobs, sin decodificación |
| Parametros totales | Aproximadamente 3.000 millones (backbone SmolLM3-3B) mas 30.228.480 parametros del adaptador LoRA |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card no la especifica; viene determinada por el backbone SmolLM3-3B) |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye pesos bf16 y el adaptador LoRA; no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | No disponible (las suites de evaluacion citadas son en ingles: clinc150, yelp5, fever, strategyqa, LegalBench, measuring_hate_speech) |
| Licencia | Apache 2.0 (verificar la licencia del backbone SmolLM3-3B al redistribuir) |
| Formato de pesos | safetensors (adaptador LoRA en `lora/` + `jevify_config.json` + ficheros JSON de resultados; el backbone se descarga aparte desde su propio repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la de SmolLM3-3B, un transformer decoder-only de aproximadamente 3.000 millones de parametros, sobre el que se aplica un ajuste LoRA de rango 16 (30.228.480 parametros) que se fusiona en los pesos bf16 al cargar. La innovacion no esta en el backbone sino en la interfaz: el modelo no genera texto, sino que se lee la distribución sobre los tokens de respuesta permitidos en la posición de respuesta, en una sola pasada forward. Esto elimina la necesidad de decodificar, parsear la salida y volver a normalizar probabilidades, y garantiza que cada respuesta sea una distribución normalizada sobre el conjunto cerrado de opciones.

El entrenamiento se realizó sobre el propio *decision readout* con la regla de puntuación propia de cada primitivo, más una penalización de coherencia con peso 1.0. Para cada pregunta de entrenamiento se generan automáticamente preguntas hermanas (las opciones reformuladas como preguntas de sí/no, la negación y las preguntas de umbral de una escala) y se penaliza la pérdida de certeza (*sure loss*) de Finetti de la familia, de modo que las respuestas a preguntas relacionadas sean mutuamente consistentes. Las opciones se barajan por familia. Los datos son las particiones de entrenamiento de las 16 fuentes de jev-bench no reservadas (5.885 familias, con un máximo de 400 registros por fuente), con learning rate 3e-05, 2 épocas, mejor época por pérdida de validación (época 1) y semilla 0. Posteriormente se ajustó una receta de Tier 0 (temperatura por primitivo, sesgo Noul, permutaciones de orden de opciones) sobre las particiones de validación. Las seis fuentes reservadas (`clinc150`, `arc_challenge`, `yelp5`, `measuring_hate_speech`, `fever_evidence`, `strategyqa_grounded`) no aparecen nunca en entrenamiento.

## Capacidades

- Respuesta a preguntas tipadas sobre un estado textual: elección entre opciones (`choice`), puntuación en niveles ordenados (`score`) y decisión binaria con probabilidad (`noul`).
- Emisión de distribuciones de probabilidad calibradas (ECE 0.055 en las particiones de test de jev-bench), aptas para fijar umbrales de decisión en código.
- Coherencia interna entre preguntas relacionadas: pérdida de certeza media de 0.041 sobre 4.749 familias de preguntas (0 indica coherencia perfecta), frente a 0.226 del checkpoint base sin ajustar.
- Clasificación de intenciones y etiquetado sobre textos cortos y medios (evaluado en `clinc150`, `yelp5`, `fever_evidence`, `strategyqa_grounded` como fuentes reservadas).
- Inferencia en una sola pasada forward sin generación ni parseo; la salida es directamente consumible por el código.
- Integración con endpoints compatibles con OpenAI que expongan logprobs (vLLM, llama.cpp) o ejecución en proceso mediante la librería `jevify`.
- Modo servidor mediante `jevify-serve`, que lo expone como servicio drop-in para el SDK TypeSafe (`TYPESAFE_BASE_URL`).

No se documenta en la información disponible soporte de tool calling, function calling, razonamiento multi-paso, visión, audio ni un modo de pensamiento explícito; el modelo es deliberadamente monolítico en su función de decisión.

## Casos de uso

- Enrutado de intenciones en asistentes conversacionales: dado el mensaje del usuario como `state`, se pregunta `choice` sobre un catálogo cerrado de intenciones. El ECE de 0.055 permite derivar a un humano cuando la probabilidad máxima queda por debajo de un umbral, algo que un clasificador generativo no permite sin recalibración.
- Triaje de tickets de soporte: clasificación multietiqueta con niveles de confianza explícitos, evaluable de forma directa sobre `clinc150` (fuente reservada), lo que da una estimación realista del rendimiento en dominios no vistos durante el entrenamiento.
- Filtrado previo (*gating*) en pipelines RAG: antes de invocar un modelo grande, se usa este modelo para decidir con una pregunta `noul` si el contexto recuperado responde a la consulta; su coste es de una pasada forward de 3B de parámetros.
- Análisis de sentimiento y valoración en reseñas: evaluación sobre `yelp5` (reservada) con salida probabilística por nivel de la escala, aprovechando el primitivo `score` para escalas ordenadas.
- Verificación de afirmaciones contra evidencia: preguntas binarias del tipo "¿la evidencia respalda la afirmación?" sobre pares de evidencia y afirmación, en la línea de la suite `fever_evidence`.
- Moderación y clasificación de contenido sensible: uso de preguntas binarias calibradas sobre taxonomías de discurso de odio (suite `measuring_hate_speech`), con umbral ajustable según la tolerancia a falsos positivos.
- Evaluación automática de calidad de respuestas: puntuación de salidas de otro modelo sobre una escala ordinal, sustituyendo a un juez generativo por una lectura de distribución en una única pasada, lo que reduce coste y elimina la varianza del parseo.
- Comprobación de consistencia de anotaciones: la penalización de coherencia permite formular la misma pregunta de varias maneras derivadas (negación, umbral, opciones como sí/no) y detectar anotaciones incoherentes a partir de la pérdida de certeza de la familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval o GSM8K. Las cifras siguientes proceden de la model card del autor y estan calculadas sobre las particiones de **test** de jev-bench (22.773 registros) o sobre otras suites del mismo estudio, con el mismo procedimiento de puntuacion para todos los modelos. Las filas de referencia pertenecen al mismo estudio, no a evaluaciones independientes.

Decisiones y calibracion:

| Modelo | Acc | ECE | Brier | Acc en reservadas | TVD frente a etiquetas humanas |
|---|---|---|---|---|---|
| Este modelo | 0.708 | 0.055 | 0.360 | 0.749 | 0.318 |
| SmolLM3-3B APO checkpoint, sin ajustar (Tier 0) | 0.539 | 0.117 | 0.526 | 0.579 | 0.460 |
| Misma receta, solo supervisado | 0.705 | 0.058 | 0.363 | 0.741 | 0.337 |
| Misma receta desde el checkpoint SFT | 0.711 | 0.053 | 0.359 | 0.757 | 0.317 |
| Jev 1.13.0 (API TypeSafe) | 0.733 | 0.113 | 0.349 | 0.835 | 0.432 |

Coherencia e invariancia (sure loss: media de d² sobre 4.749 familias de preguntas; 0 equivale a coherencia perfecta):

| Modelo | Sure loss | Proporcion incoherente | Cambio de orden | TVD de etiquetas | Caida de acc K=2 a max |
|---|---|---|---|---|---|
| Este modelo | 0.041 | 0.640 | No disponible | No disponible | No disponible |
| SmolLM3-3B APO checkpoint, sin ajustar (Tier 0) | 0.226 | 0.990 | 0.435 | 0.077 | 0.566 |
| Misma receta, solo supervisado | 0.292 | 0.964 | No disponible | No disponible | No disponible |
| Misma receta desde el checkpoint SFT | 0.039 | 0.627 | No disponible | No disponible | No disponible |
| Jev 1.13.0 (API TypeSafe) | 0.081 | 0.725 | 0.046 | No disponible | 0.246 |

Fuera de distribucion:

| Modelo | Regla enunciada (LegalBench) | "Ninguna" cuando desaparece la correcta | Tasa de secuestro por instruccion inyectada | AUROC de phishing | Riesgo de herramienta |
|---|---|---|---|---|---|
| Este modelo | No disponible | No disponible | No disponible | No disponible | No disponible |
| SmolLM3-3B APO checkpoint, sin ajustar (Tier 0) | 0.588 | 0.552 | 0.464 | 0.794 | 0.800 |
| Jev 1.13.0 (API TypeSafe) | 0.924 | 0.744 | 0.205 | 0.688 | 0.933 |

Comprobacion de reproduccion: al cargar la carpeta con `load_jevified` y reevaluar 72 registros de test de jev-bench procedentes de seis fuentes, se reprodujeron las predicciones del propio entrenamiento: 0 respuestas de eleccion cambiadas, diferencia media absoluta de probabilidad 0.006 y maxima 0.046.

## Requisitos de hardware

- VRAM estimada en bf16: entre 6 y 8 GB para los pesos (3B a 2 bytes por parametro) mas la cache KV y activaciones; el adaptador se fusiona en los pesos en carga, por lo que no anade VRAM apreciable.
- Estimaciones orientativas con cuantizacion: alrededor de 3.5-4 GB en int8 y 2-2.5 GB en int4. No obstante, el repositorio no publica pesos cuantizados ni GGUF, por lo que esas rutas exigirian una conversion manual no soportada oficialmente.
- GPU consumer: cabe con holgura en una RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090 en bf16. Tambien es viable en GPUs de 8 GB, aunque con menos margen para lotes grandes.
- GPU de centro de datos: A100, H100, L40S o similares, utiles para servir muchas peticiones concurrentes con lotes grandes, ya que cada peticion es una unica pasada forward.
- Opciones de despliegue: `jevify-serve` (servidor incluido en la libreria `jevify`), ejecucion en proceso con `load_jevified`, o cualquier endpoint compatible con OpenAI que exponga logprobs (vLLM, llama.cpp). TGI y Ollama no estan documentados para este modelo en la informacion disponible, y Ollama requeriria previamente un GGUF inexistente.
- Latencia y throughput: no disponibles como cifras. Cualitativamente, al no haber decodificacion autoregresiva, el coste se reduce al prefill del estado mas una lectura de distribucion, de modo que el tiempo por peticion depende de la longitud del estado y no del numero de opciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Acc (test jev-bench) | ECE | Sure loss | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este modelo | ~3B + LoRA r16 | No disponible | 0.708 | 0.055 | 0.041 | Apache 2.0 | HuggingFace (adaptador + configs, 0.1 GB) |
| SmolLM3-3B APO checkpoint, sin ajustar | ~3B | No disponible | 0.539 | 0.117 | 0.226 | Apache 2.0 | HuggingFace (mismo ecosistema Jevify) |
| Misma receta, solo supervisado | ~3B + LoRA r16 | No disponible | 0.705 | 0.058 | 0.292 | No disponible | HuggingFace (`jevify-smollm3-3b-apo-readout`) |
| Misma receta desde el checkpoint SFT | ~3B + LoRA r16 | No disponible | 0.711 | 0.053 | 0.039 | No disponible | HuggingFace (repositorio enlazado desde la model card) |
| Jev 1.13.0 (API TypeSafe) | No disponible | No disponible | 0.733 | 0.113 | 0.081 | No disponible | Servicio API, no pesos abiertos |

La comparacion interna del propio estudio muestra un compromiso relevante: la variante entrenada desde el checkpoint SFT obtiene mejor exactitud (0.711 frente a 0.708), mejor ECE (0.053 frente a 0.055) y mejor coherencia (0.039 frente a 0.041), mientras que la variante "solo supervisado" tiene peor coherencia (0.292) pese a una exactitud comparable. La API Jev 1.13.0 alcanza la mejor exactitud en reservadas (0.835) y el mejor comportamiento en robustez a instrucciones inyectadas, pero con peor calibracion (ECE 0.113).

## Limitaciones y advertencias

- Exactitud moderada: 0.708 en test y 0.749 en las fuentes reservadas. No es adecuado como unico mecanismo de decision en flujos de alto riesgo sin una capa de verificacion.
- Coherencia lejos de ser perfecta: el 64.0 % de las familias de preguntas evaluadas se marcan como incoherentes, aunque la sure loss media (0.041) es notablemente baja frente al checkpoint sin ajustar (0.226).
- Ausencia de resultados fuera de distribucion para este modelo concreto: las celdas de regla enunciada (LegalBench), opcion "ninguna" cuando desaparece la correcta, tasa de secuestro por instruccion inyectada, AUROC de phishing y riesgo de herramienta aparecen vacias en la model card. No hay evidencia publicada sobre su robustez a prompt injection.
- No genera texto: cualquier caso de uso que requiera una respuesta redactada necesita combinar este modelo con un generador aparte.
- Riesgo de alucinacion acotado por diseno: al restringirse a un conjunto cerrado de opciones, no puede inventar contenido libre, pero si puede asignar alta probabilidad a una opcion incorrecta; la calibracion (ECE 0.055) solo garantiza que la probabilidad declarada se aproxima a la frecuencia real de acierto.
- Idiomas: no se documenta soporte multilingue y todas las suites de evaluacion citadas estan en ingles. El comportamiento en castellano es desconocido y deberia validarse antes de usarlo en produccion.
- Longitud de contexto no especificada en la model card; el limite practico es el del backbone SmolLM3-3B, que no se detalla en la informacion disponible.
- Dependencia operativa del backbone: el modelo descarga SmolLM3-3B desde su propio repositorio, fijado al commit `cfb32d505f5025ec9be4e704f70cfbf5bdf8da94`. Si ese repositorio cambia o desaparece, la carga puede fallar.
- Requisito de logprobs: el despliegue necesita un backend que exponga logprobs (vLLM, llama.cpp o ejecucion en proceso). Un endpoint que solo devuelva texto no sirve para este modelo.
- Empaquetado limitado: el repositorio pesa 0.1 GB y no incluye pesos cuantizados ni GGUF, por lo que las rutas de despliegue ligero (Ollama, llama.cpp con cuantizacion propia) requieren trabajo adicional no soportado oficialmente.
- Licencia: el adaptador es Apache 2.0, pero conviene verificar la licencia del backbone SmolLM3-3B y de las fuentes de datos de jev-bench antes de un uso comercial. Los seis repositorios de evaluacion reservados (clinc150, arc_challenge, yelp5, measuring_hate_speech, fever_evidence, strategyqa_grounded) tienen sus propias condiciones.
- Madurez del proyecto: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y las fechas de creacion y actualizacion son del 25 de septiembre de 2026. La validacion externa es practicamente nula.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Praveenrajus/jevify-smollm3-3b-apo-readout-coh
- Dataset de evaluacion jev-bench: https://huggingface.co/datasets/Praveenrajus/jev-bench
- Leaderboard de jev-bench: https://huggingface.co/datasets/Praveenrajus/jev-bench#leaderboard
- Repositorio de codigo Jevify: https://github.com/uspraveen/Jevify
- Hallazgos sobre ajuste del readout y penalizacion de coherencia: https://github.com/uspraveen/Jevify/blob/main/docs/FINDINGS.md#18-readout-fine-tuning-and-what-a-coherence-penalty-adds
- Motor de Jevify (System-one Jev model): https://github.com/uspraveen/Jevify/tree/main/jevify/engine
- Paquete en PyPI: https://pypi.org/project/jevify/
- Variante con la misma receta, solo supervisada: https://huggingface.co/Praveenrajus/jevify-smollm3-3b-apo-readout
- Variante desde el checkpoint SFT (comparacion de reparacion): https://huggingface.co/Praveenrajus/jevify-smollm3-3b-sft-rea
- Modelo relacionado sobre otro backbone: https://huggingface.co/Praveenrajus/jevify-qwen3.5-4b
- Perfil del autor en HuggingFace: https://huggingface.co/PraveenAIML
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-checkpoints
