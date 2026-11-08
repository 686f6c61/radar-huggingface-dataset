# jmc0/Rein-NPC-4B-GGUF

## Resumen

Rein-NPC-4B-GGUF es la distribucion en formato GGUF de Rein-NPC-4B, un modelo derivado de Qwen3.5-4B desarrollado por el usuario jmc0. Su particularidad es que integra en un unico modelo de lenguaje dos funciones diferenciadas: la conversacion convencional propia de Qwen3.5-4B y un mecanismo de decision tipada orientado a personajes no jugadores (NPC) en videojuegos. Para ello reserva 64 filas entrenadas en la tabla de embeddings, correspondientes a los tokens especiales `<|rein_0|>` a `<|rein_63>` (ids 248077 a 248140), mientras que la cabeza de salida mantiene la tabla original del modelo base intacta.

El modelo resuelve el problema de tener que desplegar dos procesos separados (uno conversacional y otro de toma de decisiones) en entornos de juego: un unico proceso `llama-server` puede atender tanto el chat como las decisiones de accion del NPC. La decision se emite como una distribucion de probabilidad sobre opciones etiquetadas con letras (por ejemplo, `check_table_availability`, `process_reservation` o `none`), lo que permite leer la respuesta directamente desde los logprobs del servidor.

Con 4.841.450.496 parametros totales (aproximadamente 4,8 mil millones), arquitectura transformer derivada de Qwen3.5-4B con 32 capas (8 de atencion completa), licencia Apache-2.0 y soporte para ingles, portugues y otros idiomas, esta pensado para ejecutarse en GPUs de consumo. El repositorio ocupa 17,9 GB e incluye cuantizaciones bf16, Q8_0 y Q4_K_M, ademas de un fichero `rein_config.json` con el protocolo de decision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B), 32 capas, 8 de atencion completa |
| Parametros totales | 4.841.450.496 (aprox. 4,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como limite oficial; el ejemplo de despliegue usa 32768 tokens |
| Tipos de cuantizacion | bf16, Q8_0, Q4_K_M |
| Idiomas soportados | en, pt, multilingual |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (generado desde safetensors con `convert_hf_to_gguf.py` y `llama-quantize`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer de 32 capas de las cuales 8 son de atencion completa, con aproximadamente 32 KB de cache KV por token. Sobre esa base, Rein-NPC-4B incorpora 64 filas entrenadas en la tabla de embeddings que actuan como tokens de decision tipada. La cabeza de salida se mantiene como la tabla original del modelo base, sin modificar, de modo que los 64 tokens de decision nunca se generan en el flujo conversacional: segun la model card, sobre 984.371 posiciones de chat retenidas su probabilidad media es de 6,5e-8 y nunca entran en el top 100.

El entrenamiento se realizo sobre el checkpoint en safetensors y la conversion a GGUF se hizo con las herramientas estandar de llama.cpp. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion se remite a la model card principal de `jmc0/Rein-NPC-4B`, que no se incluye en la informacion disponible. La innovacion tecnica destacable es el protocolo de decision: el prompt se estructura con un contexto de personaje, la conversacion y una lista de acciones etiquetadas con letras, y la respuesta se lee como distribucion de probabilidad sobre esas letras, renormalizada a temperatura 0,812.

## Capacidades

- Generacion de texto conversacional multi-turno con la plantilla de chat de Qwen3.5-4B.
- Decision tipada de acciones: selecciona entre opciones etiquetadas (por ejemplo, invocar una herramienta concreta o responder `none`) emitiendo una distribucion de probabilidad sobre las letras de las opciones.
- Soporte de tool calling y function calling a traves del mecanismo de decision tipada.
- Integracion de chat y decision en un unico proceso `llama-server`, con varios slots para intercalar conversacion y decisiones.
- Capacidades multilingues: ingles, portugues y otros idiomas (etiqueta `multilingual`).
- Modo de lectura de decisiones mediante `n_probs` en el endpoint `/completion`, con `n_predict` 1 y temperatura 0.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido (thinking) en la informacion disponible.

## Casos de uso

- NPC conversacionales en videojuegos: un unico proceso `llama-server` atiende el dialogo del personaje y, en la misma sesion, decide que accion del juego corresponde ejecutar (consultar disponibilidad, procesar una reserva, etc.), lo que simplifica el despliegue en el cliente o en un servidor local.
- Sistemas de dialogo con herramientas en entornos de simulacion: el modelo puede elegir entre un conjunto acotado de funciones definidas por el desarrollador y devolver `none` cuando la peticion del usuario no encaja con ninguna, evitando invocaciones erroneas.
- Prototipado rapido de agentes de juego en GPUs de consumo: el fichero Q4_K_M (3,07 GB) permite ejecutar el modelo en portatiles y GPUs consumer, lo que facilita iterar sobre guiones y arboles de decision sin infraestructura dedicada.
- Atencion al cliente con acciones acotadas: en dominios donde las respuestas deben acompanarse de una accion concreta (reservas, consultas de disponibilidad), el modelo combina conversacion y seleccion de herramienta en una sola llamada.
- Investigacion sobre decision tipada en modelos pequenos: los 64 tokens de decision y el protocolo de lectura por logprobs ofrecen un banco de pruebas reproducible para estudiar como la cuantizacion afecta a la seleccion de opciones.
- Despliegue en ingles y portugues: adecuado para productos orientados a mercados lusofonos y angloparlantes, con la posibilidad de anadir otros idiomas gracias a la base multilingue de Qwen3.5-4B.
- Evaluacion de robustez frente a cuantizacion: el autor publica una comparativa entre bf16 y Q4_K_M sobre 104 preguntas, util para decidir el nivel de cuantizacion en produccion.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). Si aporta una comparativa de fidelidad de las decisiones entre el fichero cuantizado y el modelo en PyTorch bf16, sobre 104 preguntas de 20 registros de test retenidos:

| Fichero | Misma opcion que bf16 | Brecha media de probabilidad maxima | Peor caso |
|---|---|---|---|
| Q4_K_M | 101 de 104 | 0,028 | 0,21 |

Segun el autor, las tres discrepancias corresponden a preguntas que el propio modelo bf16 deja abiertas (su opcion principal con 0,41, 0,62 y 0,38 de probabilidad); en las 90 preguntas en las que bf16 asigna 0,8 o mas a una opcion, Q4_K_M acierta la misma opcion en las 90. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: bf16 requiere aproximadamente 9,70 GB solo en pesos; Q8_0 unos 5,16 GB; Q4_K_M unos 3,07 GB. A ello se suma la cache KV, de aproximadamente 1 GB por slot para 32k de contexto (unos 32 KB por token).
- El autor indica que el fichero Q4_K_M con dos slots de 16k cabe en 6 GB de VRAM.
- GPU recomendadas: bf16 esta pensado para GPUs de 24 GB (por ejemplo, RTX 4090 o A100); Q8_0 para GPUs de 8 GB o mas; Q4_K_M para GPUs consumer y portatiles.
- Cabe en GPUs consumer: si, especialmente con Q4_K_M y Q8_0.
- Opciones de despliegue: llama.cpp (`llama-server`), con endpoints compatibles con `/v1/chat/completions` y `/completion`; el paquete Python `rein` incluye `rein.play.server --decider` y `ServerDecisionBackend`. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. El autor recomienda configurar dos o mas slots (`--parallel 2`) para intercalar chat y decisiones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rein-NPC-4B-GGUF | 4,8 B | no disponible (ejemplo con 32k) | Chat + decision tipada en un solo proceso | Apache-2.0 | GGUF en Hugging Face |
| Qwen3.5-4B | 4 B | no disponible | Chat generalista | Apache-2.0 (segun la model card) | Pesos originales |
| Alternativas de 4B para NPC | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con el modelo base Qwen3.5-4B, del que Rein-NPC-4B hereda la calidad conversacional y la licencia. No se dispone de datos sobre otros modelos de decision tipada para NPC con los que contrastar.

## Limitaciones y advertencias

- La model card remite a la tarjeta principal de `jmc0/Rein-NPC-4B` para los limites y el uso previsto; esa informacion no esta disponible en el material consultado.
- El modelo esta especializado en un protocolo de decision concreto: fuera de ese formato de prompt y de la lectura por logprobs, las decisiones pueden no ser fiables.
- La cuantizacion Q4_K_M introduce pequenas discrepancias en las decisiones (3 de 104 en la evaluacion del autor), concentradas en casos donde el modelo bf16 ya muestra baja confianza.
- Riesgo de alucinacion en el flujo conversacional: al heredar Qwen3.5-4B, mantiene los sesgos y limitaciones del modelo base, no documentados en la informacion disponible.
- Idiomas: el soporte declarado se centra en ingles y portugues; el rendimiento en castellano no esta documentado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B y de los datos de entrenamiento en la tarjeta principal.
- El identificador del modelo incluye la etiqueta `qwen3.5`, pero no se detalla la version exacta del modelo base ni sus terminos adicionales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/jmc0/Rein-NPC-4B-GGUF
- Modelo base: https://huggingface.co/jmc0/Rein-NPC-4B
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
