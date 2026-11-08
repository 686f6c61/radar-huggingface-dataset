# masluny/sokolik-300m-chat

## Resumen

Sokolik-300M-chat es un modelo de lenguaje de 304 millones de parámetros especializado en conversación en polaco, desarrollado por el usuario masluny a partir de su modelo base Sokolik-300M-base. Su rasgo diferencial es el control de registro: mediante una etiqueta en el mensaje de sistema el usuario selecciona el tono de la respuesta entre formal, neutro, coloquial o vulgar. Además, el modelo puede responder a partir de un pasaje de contexto que se le proporciona, lo que lo hace apto para flujos de generación aumentada por recuperación (RAG) sobre textos cortos.

La arquitectura sigue la familia Qwen3, con 304.140.288 parámetros totales, y se distribuye en formato safetensors bajo licencia Apache 2.0. El entrenamiento consistió en un ajuste supervisado (SFT v2) sobre 59.547 conversaciones de un solo turno generadas sintéticamente con Bielik-11B-v2.3-Instruct, con un presupuesto de preentrenamiento de 12.000 millones de tokens según la model card.

El modelo es relevante como ejemplo de especialización estrecha y barata: un fine-tuning de unos 15 minutos en una sola H100 produce un asistente conversacional en polaco con control explícito de estilo. No obstante, sus propias limitaciones —fiabilidad factual solo con contexto, incapacidad aritmética y ausencia total de entrenamiento de seguridad— lo sitúan como una pieza de investigación o de demostración más que como un componente listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 304.140.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; los pasajes de entrenamiento se recortan a 600 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors) |
| Idiomas soportados | polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3 con 304 millones de parámetros, inicializado desde masluny/sokolik-300m-base, que a su vez acumula 12.000 millones de tokens de preentrenamiento según la model card. Sobre esa base se aplicó un ajuste supervisado (SFT v2) con 59.547 conversaciones de un único turno, todas generadas con Bielik-11B-v2.3-Instruct (Apache 2.0). La pérdida se calcula únicamente sobre la respuesta del asistente.

La composición del dataset de SFT es explícita: 40.414 peticiones sintéticas para enseñar a responder tareas (respuesta neutra más reescrituras al registro coloquial en un 45 %, vulgar en un 30 % y formal en un 25 %), 13.528 ejemplos anclados en web donde Bielik respondió a partir de una página que el modelo ve como contexto, 2.842 preguntas sobre entradas de Wikipedia respondidas a partir del lead del artículo en 2-5 frases, y 2.763 ejemplos de small talk (saludos, agradecimientos, preguntas sobre el propio asistente). Se aplicaron filtros de rechazos, insultos dirigidos al usuario, marcadores de posición introducidos por las reescrituras, registro y longitud; por diseño no hay rechazos en los datos.

La plantilla de conversación es `<|endoftext|><|system|><|reg:X|>Kontekst:\n…\n<|user|>…<|assistant|>…<|end|>`, con la etiqueta de registro en el mensaje de sistema y el pasaje de contexto a continuación. Un 10 % de los ejemplos neutros carecen de etiqueta. El recetario de entrenamiento fue de 2 épocas, tasa de aprendizaje 2e-4 con decaimiento coseno, unos 65.000 tokens por paso y aproximadamente 15 minutos en una sola H100. La versión 2 corrigió los defectos de la v1: ausencia de small talk (respondía a un saludo con una tarea inventada), respuestas ancladas en web sin la página de origen (lo que le enseñaba a afirmar hechos que no podía conocer) y un 64 % de respuestas en formato de lista. Un experimento de DPO sobre la v1, con Bielik como juez, ganó 134 a 60 frente a la v1; según la model card, se repetirá sobre la v2.

## Capacidades

- Generación de texto conversacional en polaco con fluidez y capacidad de small talk.
- Control de registro mediante etiqueta en el mensaje de sistema: `formalny`, `neutralny`, `potoczny` o `wulgarny`; sin mensaje de sistema la respuesta es neutra.
- Respuesta anclada a un pasaje de contexto de hasta aproximadamente 1.500 caracteres, colocado bajo la etiqueta de registro o solo en el mensaje de sistema.
- Integración con recuperación: el comando del proyecto `sokolik chat --rag` busca el lead del artículo de Wikipedia polaca correspondiente y lo inyecta como contexto; en conversación trivial no aporta contexto.
- Conocimiento de su propia identidad como asistente ("Sokolik").
- Conversación de un solo turno: no se entrenó con diálogos multi-turno.
- No dispone de tool calling ni function calling, ni de razonamiento multi-paso, ni de visión, audio o modo de pensamiento; no hay datos que indiquen soporte de agentes.
- No realiza aritmética de forma fiable.

## Casos de uso

- Asistente conversacional en polaco con tono configurable: el mensaje de sistema permite fijar el registro formal para atención al cliente o el coloquial para una aplicación de ocio, sin reentrenar el modelo.
- Respuesta sobre documentos cortos en RAG: dado un fragmento de hasta 1.500 caracteres, el modelo responde en 2-5 frases a partir de él, lo que encaja en pipelines que recuperan el lead de un artículo y piden una síntesis.
- Demostración educativa de control de estilo: útil para experimentar con etiquetas de registro en un modelo pequeño y reproducible en hardware modesto.
- Prototipado rápido de chatbots de dominio acotado: con 304 millones de parámetros y 0,6 GB de repo, se puede iterar localmente antes de escalar a un modelo mayor.
- Generación de variantes estilísticas de un mismo texto: dada una respuesta neutra, el modelo puede reescribirla en registro coloquial, formal o vulgar, aprovechando que el 45 % y el 30 % de los datos sintéticos enseñaron esas reescrituras.
- Juguete de investigación sobre datos sintéticos: sirve para estudiar cómo un modelo de 300M absorbe el estilo de un generador mayor (Bielik-11B) y qué sesgos y artefactos se filtran.
- Filtro o clasificador de tono en prototipos: su sensibilidad al registro puede usarse para probar interfaces que adaptan el lenguaje al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta un experimento de preferencia con DPO sobre la versión 1, con Bielik como juez, que ganó 134 a 60 frente a SFT v1; no hay cifras de MMLU, HumanEval, GSM8K ni de evaluaciones en polaco.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 1,2 GB de pesos; en fp16/bf16, unos 0,6 GB; en cuantización de 8 bits, unos 0,3 GB, más la memoria de activaciones y caché KV, que depende de la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; una H100 fue suficiente para entrenar en unos 15 minutos, lo que da idea de la ligereza del modelo.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso en iGPU con suficiente memoria compartida, en función de la cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp, Ollama o vLLM no están confirmados en la información disponible.
- Latencia y throughput: no disponibles. La configuración de generación sugerida es temperatura 0,4 y penalización de repetición 1,15.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Sokolik-300M-chat | 304M | no disponible (pasajes de 600 tokens) | pl | Apache 2.0 | Control de registro y respuesta anclada a contexto; sin benchmarks publicados |
| Qwen3 (modelos pequeños de la familia) | variable | no disponible | multilingüe | variable según variante | Arquitectura de referencia del modelo; no hay comparación de rendimiento publicada |
| Bielik-11B-v2.3-Instruct | 11B | no disponible | pl | Apache 2.0 | Generador de los datos sintéticos; mucho mayor y con capacidad general superior, pero sin control de registro explícito documentado |
| Sokolik-300M-base | 304M | no disponible | pl | Apache 2.0 | Modelo base sin ajuste conversacional; sirve como referencia de partida |

La comparación cuantitativa de rendimiento no está disponible: no se han publicado evaluaciones que permitan situar a Sokolik-300M-chat frente a alternativas del mismo tamaño en tareas estándar.

## Limitaciones y advertencias

- Los hechos sin contexto no son fiables: sin un pasaje, el modelo afirma con frecuencia datos incorrectos; con el lead de Wikipedia acierta las 2-3 primeras frases y puede derivar en invención en respuestas largas.
- La aritmética no funciona: el ejemplo de la model card para "12 por 3" produce una derivación errónea.
- Puede conservar marcadores de posición como `[Nazwisko]`, un artefacto heredado de los datos de entrenamiento.
- No tiene entrenamiento de seguridad ni rechazos: hace lo que se le pide en el registro solicitado; el registro vulgar incluye tacos por diseño y, aunque los datos dirigían las blasfemias al tema y no al usuario, no hay garantía de que no se dirijan a la persona.
- Los datos son sintéticos, generados por un único modelo (Bielik-11B) y validados con expresiones regulares y un clasificador débil, lo que puede propagar sesgos y errores del generador.
- Solo admite conversaciones de un único turno; no se entrenó para diálogo multi-turno ni para tool calling.
- El soporte lingüístico se limita al polaco; no hay datos de rendimiento en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones y de salvaguardas hace recomendable una validación específica antes de cualquier despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masluny/sokolik-300m-chat
- Modelo base: https://huggingface.co/masluny/sokolik-300m-base
- Generador de los datos sintéticos: https://huggingface.co/speakleash/Bielik-11B-v2.3-Instruct
