# Marco-Danz/leoncino-ministral3-8b-veneto

## Resumen

Leoncino es un adaptador LoRA (PEFT) publicado por Marco-Danz que se aplica sobre `mistralai/Ministral-3-8B-Instruct-2512-BF16` y lo convierte en un asistente conversacional que responde siempre y exclusivamente en veneto (variedad central: Padua, Vicenza, Treviso). El objetivo no es tanto "ensenar" el dialecto a un modelo grande, sino fijar un comportamiento estable: el modelo entiende entradas en italiano, ingles o veneto, pero su respuesta se mantiene en veneto incluso si se le pide explicitamente cambiar de idioma. Es un caso de uso de ajuste fino de comportamiento y estilo por encima de un modelo base ya competente.

Es la segunda generacion del proyecto. La primera (`leoncino-mistral-7b-veneto`) se construyo sobre Mistral-7B-Instruct-v0.3; esta version usa el Ministral 3 de 8B, un modelo base multimodal (texto e imagen) cuyo tramo de texto es el unico que toca el adaptador. Ademas del cambio de base, la novedad principal es que el adaptador ha aprendido limites: ante preguntas de salud, farmacos, dinero, cuestiones legales, emergencias o provocaciones, responde derivando a profesionales o al 112 en lugar de entrar en el fondo del asunto.

El interes practico para desarrolladores e investigadores es doble. Por un lado, es un ejemplo limpio y reproducible de LoRA de bajo rango (r=16) sobre un modelo de 8B, con dataset pequeno (2.241 dialogos), chat template propio y distribucion en GGUF q8_0 listo para Ollama. Por otro, sirve como banco de pruebas para evaluar comportamiento en lenguas de bajos recursos y para medir hasta que punto las salvaguardas aprendidas por datos resisten frente a instrucciones adversariales, dado que, segun el autor, anadir reglas al system prompt apenas influye.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only multimodal del modelo base (texto e imagen); el adaptador solo modifica la parte de texto |
| Parametros totales | 8B en el modelo base (el adaptador LoRA anade un subconjunto no cuantificado; no disponible el numero exacto de parametros del adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF q8_0 incluido en el repo (9 GB); el modelo base se usa en bf16 en entrenamiento. Otras cuantizaciones: no disponible |
| Idiomas soportados | Veneto (variedad central) como idioma de salida e italiano como idioma de entrada; el modelo base es multilingue, pero el comportamiento ajustado es responder en veneto |
| Licencia | Apache 2.0 (adaptador). Licencia del modelo base: no disponible en la informacion proporcionada |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) y GGUF q8_0 con `Modelfile` para Ollama |

## Arquitectura y entrenamiento

El adaptador es un LoRA configurado con r=16, alpha=32 y dropout 0.05 sobre el modelo base Ministral 3 8B. La model card se interrumpe al enumerar los modulos objetivo ("sobre q..."), por lo que ese dato concreto no esta disponible. El entrenamiento se hizo con SFT mediante TRL, con la perdida calculada unicamente sobre los turnos del asistente en formato prompt/completion, lo que concentra el ajuste en el estilo de respuesta y no en la imitacion del turno del usuario. El modelo base es multimodal y se carga con su clase especifica (`AutoModelForImageTextToText`), mientras que el adaptador solo afecta a la torre de texto.

El dataset lo componen 2.241 dialogos multi-turno en veneto con 4.220 respuestas del asistente, generados de forma sintetica con ayuda de herramientas de IA. De ellos, 1.993 cubren alrededor de 50 temas cotidianos y 248 estan dedicados especificamente a casos en los que el modelo debe no responder en el fondo: dosis de farmacos, diagnosticos, emergencias, inversiones, impuestos, cuestiones legales, peticiones peligrosas o ilegales, provocaciones, vulgaridades, chistes contra colectivos y ordenes de ignorar las reglas. Los turnos de usuario estan escritos en veneto, en italiano o en italiano con errores. No se menciona RLHF ni DPO; el pipeline descrito es exclusivamente SFT.

Una innovacion relevante de la ficha es la documentacion explicita del chat template: el tokenizer del repositorio usa un formato distinto del oficial de Ministral 3, con el system prompt inyectado en el primer turno de usuario (`[INST] system\n\nuser [/INST] respuesta</s>[INST] user [/INST] ...`) y sin el formato `[SYSTEM_PROMPT]`. Usar el tokenizer del modelo base en lugar del del repositorio degrada el comportamiento, porque el modelo no ha visto ese formato en entrenamiento. El autor tambien advierte que las reglas anadidas al system prompt se siguen mal: los limites se aprendieron de los dialogos, no del prompt.

## Capacidades

- Generacion de texto conversacional multi-turno en veneto central, con registro coloquial y respuestas breves.
- Comprension de entradas en veneto, italiano e italiano con errores gramaticales; la salida se mantiene en veneto por diseno.
- Traduccion de frases del italiano al veneto, tal como se muestra en los ejemplos de la model card.
- Escritura creativa ligera y humor en veneto (chistes no dirigidos a colectivos).
- Gestion de limites y derivacion: recomienda farmaceutico o pediatra ante preguntas de dosificacion, sugiere el 112 ante emergencias medicas y responde con una evasion humoristica ante provocaciones.
- Respuesta ante senales de riesgo o ideacion autolitica con indicacion de llamar al 112.
- Capacidad teorica de procesar imagenes a traves del modelo base multimodal; no hay evidencia en la informacion proporcionada de que el adaptador preserve o modifique esa capacidad.
- Soporte de tool calling / function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado ni entrenado de forma especifica.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Asistencia conversacional turistica en veneto: un chatbot para oficinas de turismo o alojamientos del Veneto puede atender en dialecto a visitantes italianos y mantener conversaciones multi-turno con un tono local, desplegado con Ollama sobre una unica GPU consumer.
- Preservacion y divulgacion linguistica: generacion de dialogos de ejemplo y material didactico en veneto central para escuelas, asociaciones culturales o proyectos de documentacion de lenguas minorizadas, partiendo de un modelo que ya no deriva al italiano.
- Traduccion italiano-veneto en produccion de contenidos: adaptacion de menus, carteles, audioguias o publicaciones locales, usando el modelo como primer borrador que despues revisa un hablante nativo.
- Generacion de datos sinteticos para ampliar corpus en veneto: el adaptador puede producir pares pregunta-respuesta en dialecto que alimenten futuros datasets de ajuste o evaluacion, con la advertencia de que el propio adaptador se entreno con datos sinteticos.
- Moderacion con derivacion en entornos de bajo riesgo: prototipos de asistente ciudadano donde el modelo responde en veneto y escala explicitamente a profesionales (farmaceutico, pediatra, 112) en lugar de dar consejo sanitario o legal.
- Bot de comunidad en Discord, Telegram o Twitch: integracion via Ollama con el `Modelfile` proporcionado para dar respuestas caracterizadas en veneto, con coste de inferencia bajo y sin dependencia de API externa.
- Investigacion sobre robustez de salvaguardas: banco de pruebas para medir si los rechazos aprendidos por SFT resisten prompts adversariales, jailbreaks o peticiones de cambio de idioma, comparando con el modelo base sin adaptar.
- Evaluacion comparativa de LLM en lenguas de bajos recursos: la existencia de dos generaciones (7B y 8B) y de una variante de 3B permite estudiar como escala la calidad dialectal con el tamano del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni metricas automaticas de calidad dialectal; solo ejemplos cualitativos de respuestas generadas con el GGUF q8_0 en Ollama.

| Ejemplo cualitativo (model card) | Comportamiento observado |
|---|---|
| "Ciao! Come vala?" | Responde en veneto y devuelve la pregunta |
| "Puoi parlare in italiano per favore?" | Se mantiene en veneto y explica que es su lengua de casa |
| Traduccion de "Oggi piove e non ho voglia di uscire" | Devuelve "Ancuo piove e no go voja de ndar fora." |
| Pregunta sobre dosis de paracetamol infantil | No da dosis; remite a farmaceutico o pediatra |
| Dolor toracico con sudoracion en un familiar | Indica llamar al 112 de inmediato y aportar informacion util |
| Chiste contra un colectivo | Rechaza el chiste y reconduce con humor |
| "Mi sento solo e non ho piu voglia di niente" | Responde con empatia e indica el 112 si hay riesgo |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16 (modelo base mas adaptador): en torno a 16-18 GB de pesos, mas cache KV; cifra orientativa calculada a partir de los 8B de parametros, no publicada por el autor.
- VRAM estimada para GGUF q8_0: el archivo ocupa 9 GB, por lo que se necesita aproximadamente 10-12 GB de memoria considerando contexto y overhead; cifra orientativa.
- GPU recomendadas: A100 40/80 GB o H100 para servir en bf16 con concurrencia; RTX 4090 (24 GB) para bf16 en una sola tarjeta; RTX 3090 (24 GB) en la misma situacion con menos margen de contexto.
- Cabe en GPU consumer: si, en RTX 4090/3090 con bf16 y en tarjetas de 12-16 GB (RTX 4070 Ti, RTX 4060 Ti 16 GB) con la cuantizacion q8_0. El autor indica que en un Mac con chip Apple el modelo corre integramente en GPU.
- Despliegue: Ollama es la via recomendada por el autor (el repo incluye `gguf/leoncino-8b-q8_0.gguf` y `Modelfile` con el system prompt y el chat template de entrenamiento); llama.cpp para el GGUF; transformers 5 con PEFT para cargar base mas adaptador sin fusionar. vLLM y TGI no estan documentados para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles. No se publican tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma de salida | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Leoncino Ministral 3 8B (este) | 8B (LoRA r=16) | No disponible | Veneto central | Apache 2.0 (adaptador) | Safetensors + GGUF q8_0 (9 GB) | Segunda generacion; incluye limites de derivacion en salud, legal y emergencias |
| Leoncino Mistral 7B (1ª generacion) | 7B (LoRA) | No disponible | Veneto | Apache 2.0 (adaptador) | Adaptador PEFT | Base Mistral-7B-Instruct-v0.3; sin el trabajo explicito de "cuando no responder" |
| Leoncino Baby Ministral 3 3B | 3B (LoRA) | No disponible | Veneto | Apache 2.0 (adaptador, segun la model card) | Adaptador PEFT | Variante para moviles y equipos modestos |
| Ministral-3-8B-Instruct-2512 (base) | 8B | No disponible | Multilingue (no especifico de veneto) | No disponible en la informacion proporcionada | Safetensors bf16 | Modelo multimodal texto-imagen; no responde de forma consistente en veneto por si solo |

No se dispone de datos de rendimiento comparado entre estas variantes; la comparacion es estructural (tamano, base, formato y licencia). No se han identificado en la busqueda web modelos comparables de veneto ajenos a esta familia.

## Limitaciones y advertencias

- El modelo responde en veneto aunque se le pida explicitamente otro idioma. Es un comportamiento intencional, no un fallo, y lo inhabilita para tareas que requieran salida en italiano estandar o en ingles.
- El dataset de entrenamiento es sintetico (generado con ayuda de herramientas de IA) y pequeno: 2.241 dialogos y 4.220 respuestas. La calidad y la variedad dialectal estan acotadas por ese corpus.
- La variante cubierta es el veneto central (Padua, Vicenza, Treviso); otras variedades (veneciano, verones, bellunes) pueden recibir respuestas fuera de registro o inconsistentes.
- Riesgo de alucinacion: el adaptador ajusta estilo y comportamiento, no conocimiento factual. No hay evaluacion publicada de fidelidad factual ni de tasas de alucinacion.
- Las salvaguardas (derivacion en salud, farmacos, legal, emergencias) se aprendieron de dialogos y, segun el autor, no se refuerzan anadiendo reglas al system prompt. Son por tanto fragiles frente a jailbreaks o reformulaciones adversariales y no deben considerarse una capa de seguridad suficiente en produccion.
- No usar el modelo como sustituto de consejo medico, farmaceutico, legal o financiero, ni como canal de atencion de emergencias. La propia model card lo plantea como derivador, no como fuente.
- El chat template es propio y distinto del oficial de Ministral 3. Cargar el tokenizer del modelo base en lugar del de este repositorio degrada la calidad de forma significativa.
- El adaptador solo modifica la parte de texto del modelo base multimodal; el efecto sobre tareas de vision no esta documentado ni evaluado.
- Licencia del modelo base no indicada en la informacion disponible: antes de un uso comercial hay que verificar los terminos de `mistralai/Ministral-3-8B-Instruct-2512-BF16` ademas de la Apache 2.0 del adaptador.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente por terceros.
- No hay benchmarks publicados, por lo que cualquier afirmacion de rendimiento relativo frente a otros modelos carece de respaldo numerico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Marco-Danz/leoncino-ministral3-8b-veneto
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Primera generacion (Mistral 7B): https://huggingface.co/Marco-Danz/leoncino-mistral-7b-veneto
- Variante pequena (Ministral 3B): https://huggingface.co/Marco-Danz/leoncino-baby-ministral3-3b-veneto
- Perfil del autor: https://huggingface.co/Marco-Danz
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante al modelo, al autor ni a documentacion adicional; los resultados devueltos corresponden a restaurantes, una pelicula y una agencia de marca sin relacion con el proyecto.
