# ifx-pse-sys-ml/flame-27m-grounded

## Resumen

flame-27m-grounded es un decodificador de lenguaje en inglés de 27,1 millones de parámetros desarrollado por ifx-pse-sys-ml, concebido como la mitad lingüística de un modelo visión-lenguaje (VLM) de pequeno tamano. Su proposito es responder unicamente a partir del contexto que recibe (grounded QA), de modo que cuando se le acople un encoder visual, el decodificador no invente objetos o escenas que no estan presentes en la imagen. Se obtiene por ajuste fino supervisado (SFT) de flame-27m-instruct sobre conversaciones de pregunta-respuesta fundamentadas, construidas a partir de scene graphs de Visual Genome.

El problema que aborda es concreto y medible: el modelo base del que deriva, flame-27m-instruct, afirmaba la presencia de un objeto ausente el 96,06 % de las veces, lo que lo hacia inservible como decodificador de un VLM. flame-27m-grounded reduce esa tasa de alucinacion (POPE) al 21,60 % y eleva la precision fundamentada global del 25,06 % al 79,26 %, sin degradar la capacidad general del modelo (36,00 frente a 36,06 en un promedio de siete tareas de conocimiento).

La arquitectura es un decoder estilo Llama con 8 capas, hidden 512, GQA de 8 cabezas de consulta y 2 de clave/valor, RoPE con theta 1e6, contexto de 2048 tokens y vocabulario de 12000 tokens (BPE en ingles). Al ser identico en estructura a Qwen3ForCausalLM, se integra directamente con vLLM, SGLang y TRL. Se distribuye bajo licencia Apache 2.0 y el repositorio ocupa 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (identico a Qwen3ForCausalLM), con GQA y RoPE |
| Parametros totales | 27.125.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, custom_code) |
| Hidden size | 512 |
| Capas | 8 |
| Cabezas de atencion / KV | 8 / 2 (GQA) |
| Intermediate size | 1280 |
| RoPE theta | 1e6 |
| Vocabulario | 12000 (BPE en ingles) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder auto-regresivo de tipo Llama, con 8 capas, dimension oculta de 512, dimension intermedia de 1280 y atencion con query grouping (GQA) de 8 cabezas de consulta frente a 2 de clave/valor. Usa embeddings rotatorios (RoPE) con theta 1e6, un vocabulario de 12000 tokens BPE en ingles y una ventana de contexto de 2048 tokens. La model card indica que la arquitectura es identica a Qwen3ForCausalLM, lo que permite emplear directamente vLLM, SGLang y TRL, ademas de requerir trust_remote_code por el codigo personalizado asociado al modelo.

El entrenamiento parte de flame-27m-instruct y aplica una epoca de SFT sobre 297.000 conversaciones. La composicion del dataset es un 65 % de QA fundamentado derivado de scene graphs de Visual Genome, renderizados como texto, y un 35 % de replay de chat para preservar la capacidad general. No se menciona en la informacion disponible el uso de RLHF ni DPO. La innovacion tecnica destacable es de comportamiento, no de arquitectura: el modelo se ajusta para rechazar o abstenerse en lugar de adivinar, con un ratio de "si" del 50,6 % y una tasa de sobrerrechazo de solo el 3,24 %, lo que demuestra que discrimina en lugar de adoptar un "no" sistematico. Ademas, el metodo generate() acepta los parametros penalize_prompt, no_repeat_ngram_size y repetition_penalty; el uso de penalize_prompt=False resulta critico porque una penalizacion de repeticion aplicada al prompt impide copiar la respuesta del contexto, algo que un decoder fundamentado debe hacer (costo de 32 puntos de precision en una prueba anterior: 27 % frente a 59 %).

## Capacidades

- Generacion de texto y respuesta a preguntas fundamentadas (grounded QA): responde solo a partir del contexto suministrado, con una media de 4,9 palabras por respuesta.
- Mitigacion de alucinacion: tasa POPE del 21,60 % frente al 96,06 % del modelo instruct.
- Abstencion calibrada: responde "I can't tell" cuando la pregunta no es respondible en el 74,98 % de los casos.
- Negacion de premisas falsas: rechaza premisas incorrectas en el 86,11 % de los casos.
- Formato de salida fiable: adherencia al formato del 94,50 %.
- Capacidad general de lenguaje: mantiene el rendimiento del modelo instruct en tareas de conocimiento (hellaswag, arc_easy, arc_challenge, piqa, winogrande, openbookqa, mmlu), con una media de 36,00.
- Seguimiento de instrucciones: IFEval ligeramente superior (instruction-level 0.48 frente a 0.24 del instruct).
- Capacidad multilingue: no disponible (solo ingles).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Diseno como decodificador de VLM: concebido para recibir tokens visuales como contexto en una integracion vision-lenguaje, aunque entrenado sobre texto, no pixeles.

## Casos de uso

- Decodificador de un VLM de vision-lenguaje: el modelo actua como mitad de lenguaje de un sistema VLM pequeno, recibiendo tokens visuales como contexto. Su diseno anti-alucinacion evita afirmar objetos ausentes, lo que resuelve el principal fallo del modelo instruct base como decodificador visual.
- Visual question answering con abstención: en preguntas sobre imagenes (por ejemplo, presencia de objetos), el modelo responde de forma breve y afirma "No" cuando el objeto no esta, con una tasa de acierto fundamentada del 79,26 %.
- Verificacion de premisas en pipelines de datos: dado un texto de escena y una afirmacion, el modelo detecta premisas falsas (86,11 % de rechazo de premisas falsas), util para filtrar descripciones incorrectas en anotaciones automaticas.
- Deteccion de alucinaciones en sistemas de captioning: al comparar la caption generada con el contexto, el modelo puede senalar objetos o relaciones no presentes en el escenario descrito.
- Evaluacion y control de calidad de datasets: al responder solo desde el contexto, sirve como comprobador barato de la coherencia entre pregunta y contexto en conjuntos de QA.
- Prototipado en entornos con recursos limitados: con 27,1 M de parametros y un repositorio de 0,1 GB, cabe en cualquier GPU de consumo o incluso en CPU, lo que permite iterar sobre integraciones VLM sin infraestructura dedicada.
- Filtrado de respuestas en asistentes conversacionales: para escenarios que exigen respuestas cortas y ancladas a un contexto dado, el modelo evita divagaciones y admite un formato de salida controlado (94,50 % de adherencia).

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, medidos sobre un split retenido de 11.780 preguntas sobre 2.032 imagenes no vistas:

| Metrica | flame-27m-instruct | flame-27m-grounded |
|---|---|---|
| Precision fundamentada global | 25,06 % | 79,26 % |
| Tasa de alucinacion de objetos (POPE) | 96,06 % | 21,60 % |
| Responde "no" ante objeto ausente | 3,94 % | 78,40 % |
| Responde "I can't tell" cuando no es respondible | 0,09 % | 74,98 % |
| Niega una premisa falsa | 0,92 % | 86,11 % |
| Sobrerrechazo en preguntas respondibles | 2,33 % | 3,24 % |
| Adherencia al formato | 51,27 % | 94,50 % |

Capacidad general (media de hellaswag / arc_easy / arc_challenge / piqa / winogrande / openbookqa / mmlu):

| Modelo | Media general | IFEval (instruction-level) |
|---|---|---|
| flame-27m-instruct | 36,06 | 0,24 |
| flame-27m-grounded | 36,00 | 0,48 |

El autor senala que un modelo de 27M esta cerca del azar en la mayoria de estas tareas, por lo que estos datos descartan una regresion mas que demostrar fortaleza general. Habilidades mas debiles: relaciones espaciales (57,8 %), captioning (65,2 %) y derecha/izquierda (71,1 %). Brecha de plantilla: 82,97 % en formulaciones del estilo de entrenamiento frente a 72,52 % en formulaciones no vistas.

## Requisitos de hardware

- VRAM estimada: el modelo pesa aproximadamente 0,1 GB en precision completa (27,1 M de parametros). Con cuantizacion de 8 bits quedaria en torno a 0,03 GB y con 4 bits en torno a 0,015 GB; estos valores son estimaciones derivadas del recuento de parametros, no datos publicados por el autor.
- GPU recomendadas: cabe con holgura en cualquier GPU de consumo (GTX 1060, RTX 3060, RTX 4090), en GPUs integradas e incluso en CPU. Tambien se despliega sin problema en A100 o H100 si se integra dentro de un pipeline mayor.
- Despliegue: al ser identico a Qwen3ForCausalLM, es compatible con vLLM, SGLang y TRL. Requiere transformers con trust_remote_code=True. No se dispone de informacion sobre soporte en llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Uso previsto | Licencia | Rendimiento fundamentado |
|---|---|---|---|---|---|
| flame-27m-grounded | 27,1 M | 2048 | QA fundamentado / decoder de VLM | Apache 2.0 | 79,26 % accuracy, 21,60 % POPE |
| flame-27m-instruct | 27,1 M | 2048 | Chat abierto e instrucciones | Apache 2.0 | 25,06 % accuracy, 96,06 % POPE |
| flame-27m-base | 27,1 M | no disponible en la informacion | Modelo base preentrenado | Apache 2.0 | no disponible |

No se han encontrado en la informacion proporcionada otros modelos comparables de la misma categoria fuera de la propia familia flame-27m.

## Limitaciones y advertencias

- Salida muy breve por diseno: media de 4,9 palabras (frente a 11,9 del instruct), lo que reduce el recall de objetos en captioning (0,370 frente a 0,594).
- Brecha de plantilla: 82,97 % de acierto en formulaciones similares al entrenamiento frente a 72,52 % en no vistas; puede degradarse fuera de los formatos esperados.
- Habilidades mas debiles: relaciones espaciales (57,8 %), captioning (65,2 %) y distincion derecha/izquierda (71,1 %).
- Entrenado sobre texto, no pixeles: el comportamiento fundamentado se midio con escenas renderizadas como texto; solo una integracion VLM real confirmara si transfiere a tokens visuales.
- Techo de aprendizaje: en diez checkpoints de una ejecucion mas larga, el 10,6 % de los items de evaluacion fallaron en todos, por lo que mas entrenamiento supervisado no los alcanza.
- Riesgo de alucinacion residual: aunque reducido, la tasa POPE del 21,60 % sigue indicando que no es infalible.
- Capacidad general cercana al azar en tareas de conocimiento: con 27M de parametros, el rendimiento en hellaswag, arc, piqa, winogrande, openbookqa y mmlu es bajo; no es apto para tareas que requieran conocimiento del mundo.
- Idioma: solo entrenado en ingles.
- No es sustituto del modelo instruct para chat abierto: la propia model card recomienda usar flame-27m-instruct para conversacion general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ifx-pse-sys-ml/flame-27m-grounded
- Modelo base del ajuste (flame-27m-instruct): https://huggingface.co/ifx-pse-sys-ml/flame-27m-instruct
- Arbol de ficheros de flame-27m-instruct: https://huggingface.co/ifx-pse-sys-ml/flame-27m-instruct/tree/main
- Modelo preentrenado (flame-27m-base): https://huggingface.co/ifx-pse-sys-ml/flame-27m-base
- Ficha en LLM Explorer de flame-27m-instruct: https://llm-explorer.com/model/ifx-pse-sys-ml%2Fflame-27m-instruct,6hFooSSUmfu1BvirMShJ4H
- Repositorio FLAME_PyTorch (referencia del nombre, modelo 3D de cabeza, no relacionado con este LLM): https://heatdrop.ai/repo/soubhiksanyal/FLAME_PyTorch
