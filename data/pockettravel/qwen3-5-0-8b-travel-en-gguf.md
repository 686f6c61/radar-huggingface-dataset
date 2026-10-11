# pockettravel/qwen3.5-0.8b-travel-en-GGUF

## Resumen

qwen3.5-0.8b-travel-en-GGUF es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-0.8B, publicado por la organizacion pockettravel. Se trata de un modelo especializado en respuestas de guia de viaje con recuperacion aumentada (RAG) pensado para funcionar de forma totalmente offline dentro de la aplicacion Android Pocket Travel. El modelo responde en ingles, en un maximo de tres frases, utilizando unicamente el CONTEXTO de guia turistica que se le proporciona en el prompt, y debe declarar explicitamente cuando ese contexto no contiene la respuesta. No esta concebido como chatbot general ni como fuente de conocimiento propia: sin contexto debe negarse a responder.

El modelo tiene 752.393.024 parametros (unos 0,75 mil millones) y se distribuye unicamente en formato GGUF cuantizado a Q4_K_M con importance matrix, en un unico archivo de 505 MiB que ocupa aproximadamente 0,8 GiB en uso. Esta disenado para ejecutarse en moviles y dispositivos de bajos recursos: la aplicacion lo ejecuta con 4096 tokens de contexto y cache KV en f16, y el ejemplo oficial de llama.cpp lo lanza con 8192 tokens. El modelo base Qwen3.5 es un modelo de razonamiento (thinking model), pero el pensamiento se desactivo durante el entrenamiento, por lo que debe ejecutarse con `enable_thinking=False`.

Su relevancia actual radica en dos factores: por un lado, demuestra un flujo completo de destilacion de un modelo generalista de 0,8B hacia una tarea muy concreta (asistente de viajes con RAG y politicas estrictas de rechazo), todo ello con recursos de entrenamiento modestos (una epoca de LoRA). Por otro lado, la evaluacion publicada mide de forma explicita y cuantitativa la tasa de rechazo correcto frente a contextos vacios, preguntas fuera de tema y preguntas no cubiertas por el contexto, un aspecto que habitualmente queda sin medir en modelos especializados de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada del modelo base Qwen3.5-0.8B. La informacion disponible no detalla la arquitectura interna de la variante 0,8B; fuentes secundarias describen la serie Qwen3.5 con arquitectura hibrida (Gated Delta Networks y mezcla de expertos dispersa), sin confirmacion para este tamano |
| Parametros totales | 752.393.024 (~0,75 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | No especificada para el modelo base en la informacion disponible. La aplicacion lo ejecuta con 4096 tokens y el ejemplo oficial de llama.cpp usa 8192 tokens; los contextos de entrenamiento son de hasta 2000 caracteres |
| Tipos de cuantizacion | Q4_K_M con importance matrix (imatrix); es la unica cuantizacion distribuida en este repositorio |
| Idiomas soportados | Ingles (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y se ha adaptado mediante un ajuste fino LoRA de 16 bits realizado con Unsloth, que posteriormente se fusiono en los pesos base y se cuantizo a GGUF Q4_K_M. El entrenamiento consistio en una unica epoca, con la funcion de perdida calculada unicamente sobre los tokens de respuesta (no sobre la pregunta) y ponderada segun la categoria de la pregunta. Al ser un fine-tune fusionado, la arquitectura efectiva es la del modelo base; no se introduce ninguna innovacion estructural nueva. La decision de diseno mas relevante es la desactivacion del modo de razonamiento (`enable_thinking=False`, bloque `<think></think>` vacio en el prompt), heredada del caracter de modelo pensante de Qwen3.5.

El corpus de entrenamiento esta formado por 40.935 pares sinteticos pregunta/respuesta con respuestas extractivas, de los cuales aproximadamente el 21% son ejemplos de rechazo. Los datos se construyeron a partir de los volcados de Wikimedia del 1 de octubre de 2026: Wikivoyage en ingles (paginas de paises y ciudades, limpiadas con el mismo codigo que las guias de la aplicacion), articulos de Wikipedia en ingles sobre cocina, cultura, telecomunicaciones y medios de paises, historia y clima de ciudades, secciones de Wikivoyage en italiano traducidas automaticamente al ingles con MarianMT (`Helsinki-NLP/opus-mt-tc-big-it-en`, CC BY 4.0, marcadas en `ATTRIBUTION.tsv`), consejos de viaje del Gobierno de Canada (travel.gc.ca) y de la Foreign, Commonwealth & Development Office del Reino Unido (gov.uk), datos rapidos de Wikidata (capital, moneda, prefijo telefonico, lado de circulacion), numeros de emergencia y resumenes de vacunacion. Los contextos se formatean igual que en la aplicacion: de una a tres secciones de guia con secciones distractoras, hasta 2000 caracteres, mas los bloques adicionales que anade la app (puntos de interes cercanos, proximas salidas, distancias entre ciudades, numeros de emergencia, notas personales). Las preguntas incluyen conversaciones reales de viaje procedentes de `soniawmeyer/travel-conversations-finetuni...` (referencia truncada en la model card).

## Capacidades

- Generacion de texto en ingles orientada a respuestas extractivas sobre guias de viaje, con un limite de tres frases por respuesta.
- Respuestas estrictamente ancladas al CONTEXTO proporcionado en el prompt (comportamiento tipo RAG cerrado).
- Rechazo explicito y reconocible cuando el contexto esta vacio, la pregunta esta fuera de tema o el contexto no cubre la respuesta.
- Manejo de bloques de contexto adicionales propios de la aplicacion: puntos de interes cercanos, proximas salidas, distancias entre ciudades, numeros de emergencia y notas personales.
- Funcionamiento completamente offline en dispositivo movil, sin llamadas a red.
- Ejecucion con el modo de razonamiento desactivado (`enable_thinking=False`); no se recomienda usar el modo pensante.
- No soporta tool calling ni function calling segun la informacion disponible.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision ni de audio.
- Multilingue: solo ingles (existe una variante independiente en italiano publicada por el mismo autor).

## Casos de uso

- Asistente de viaje offline integrado en la aplicacion Pocket Travel: el modelo responde preguntas sobre la guia Wikivoyage descargada de una region, usando busqueda SQLite FTS para recuperar de una a tres secciones y colocarlas en el prompt. Es el caso de uso disenado explicitamente para este modelo.
- Generacion de respuestas sobre historia y clima de ciudades: el modelo ha sido entrenado con articulos de Wikipedia en ingles especificos sobre estos temas y evaluado en ellos, con 0% de rechazos incorrectos en las preguntas respondibles segun la tabla publicada.
- Consultas sobre puntos de interes cercanos y proximas salidas: la aplicacion anade estos bloques al contexto y el modelo los utiliza para responder sin recurrir a conocimiento propio.
- Asistente de viaje en zonas sin conexion: al ejecutarse en un unico archivo GGUF Q4_K_M de 505 MiB con unos 0,8 GiB de memoria en uso, puede desplegarse en un movil de 4 GB de RAM para viajeros sin conectividad.
- Filtrado de preguntas fuera de ambito en produccion: el modelo alcanza un 100% de rechazo en preguntas fuera de tema y con contexto vacio, por lo que puede actuar como capa de control que evita respuestas alucinadas cuando la busqueda no devuelve resultados.
- Base para variantes en otros idiomas: el mismo pipeline (LoRA sobre Qwen3.5-0.8B, fusion y cuantizacion Q4_K_M) se ha reutilizado para publicar una version en italiano, lo que sirve de plantilla para otros idiomas dentro de la misma aplicacion.
- Evaluacion de politicas de rechazo en sistemas RAG de bajos recursos: sus metricas publicadas de rechazo correcto e incorrecto lo convierten en un caso de estudio reproducible para medir el equilibro entre abstenerse y responder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card si publica una evaluacion especifica de tasas de rechazo sobre un conjunto de prueba retenido de 584 preguntas sobre 11 paises no vistos en entrenamiento, comparando el modelo con su base (unsloth/Qwen3.5-0.8B-GGUF, cuantizacion UD-Q4_K_XL), ambos ejecutados como GGUF con llama.cpp y decodificacion greedy.

| Metrica | Este modelo | Modelo base (Qwen3.5-0.8B) |
|---|---|---|
| Rechaza cuando el contexto esta vacio | 100% | 9,1% |
| Rechaza preguntas fuera de tema | 100% | 53,6% |
| Rechaza preguntas parafraseadas de pais cuyo tema falta en el contexto | 95,1% | 4,9% |
| Rechaza preguntas de ciudad cuyo tema falta en la pagina | 80% | 0% |
| Rechaza preguntas de historia o clima de ciudad no cubiertas por el contexto | 100% | 0% |
| Rechaza preguntas de "que hay cerca" sin lugar cercano coincidente | 100% | 30% |
| Rechaza preguntas de salidas sin salida coincidente | 80% | 60% |
| Rechaza incorrectamente preguntas respondibles de pais | 9,2% | 4,6% |
| Rechaza incorrectamente preguntas respondibles de ciudad | 0% | 0% |
| Rechaza incorrectamente preguntas respondibles de historia o clima de ciudad | 0% | 0% |
| Rechaza incorrectamente preguntas respondibles de "que hay cerca" | 57,1% | 7,1% |
| Rechaza incorrectamente preguntas respondibles de salidas | 7,1% | 21,4% |

En el primer bloque (tasas de rechazo deseado) un valor mas alto es mejor; en el segundo bloque (rechazos incorrectos) un valor mas bajo es mejor. La model card advierte de que la baja tasa de rechazos incorrectos del modelo base en algunos grupos coexiste con muy pocos rechazos en total: cuando el base no se abstiene, a menudo responde con conocimiento propio o con texto del contexto que no responde a la pregunta. El conjunto de prueba es nuevo respecto a versiones anteriores del modelo, por lo que estas cifras no son comparables con tarjetas previas.

## Requisitos de hardware

- Tamano del archivo: un unico GGUF `qwen3.5-0.8b-travel-en-Q4_K_M.gguf` de 505 MiB.
- Memoria en uso estimada: aproximadamente 0,8 GiB en CPU con llama.cpp (pesos, copia en CPU de los pesos reempaquetados, cache KV y buffers de computo), con contexto de 4096 tokens, batch de 512 y cache KV en f16.
- RAM de dispositivo sugerida: 4 GB o mas. Sumando unos 0,4 GB de la propia aplicacion, modelo y app ocupan en torno al 40% o menos de esa RAM, dejando el resto al sistema.
- GPU: no se especifican GPU recomendadas en la informacion disponible. Estamos ante un modelo pensado para CPU y despliegue en dispositivo movil, no para aceleradores de datacenter (A100, H100, etc.).
- Compatibilidad con GPU de consumo: el modelo cabe sin dificultad en cualquier GPU de consumo por su tamano, aunque la model card no documenta configuraciones de GPU.
- Opciones de despliegue: llama.cpp en general y `llama-server` en particular. El ejemplo oficial es `llama-server -m qwen3.5-0.8b-travel-en-Q4_K_M.gguf -c 8192 --chat-template-kwargs '{"enable_thinking": false}'`. No se documentan despliegues con vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (rechazo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pockettravel/qwen3.5-0.8b-travel-en-GGUF (este) | 752.393.024 | 4096 en la app, 8192 en el ejemplo | 100% de rechazo con contexto vacio y en fuera de tema; 9,2%/57,1% de rechazos incorrectos en pais y "que hay cerca" | CC BY-SA 4.0 | GGUF Q4_K_M, 505 MiB |
| Qwen/Qwen3.5-0.8B (base) | no disponible (denominado 0.8B) | no disponible | 9,1% de rechazo con contexto vacio; 53,6% en fuera de tema | no disponible en la informacion proporcionada | Modelo original; su cuantizacion de referencia es unsloth/Qwen3.5-0.8B-GGUF (UD-Q4_K_XL) |
| pockettravel/qwen3.5-0.8b-travel-it-GGUF | no disponible | no disponible | no disponible | no disponible | GGUF; variante en italiano del mismo autor para la misma aplicacion |

No se dispone de datos de comparacion con otros asistentes de viaje especializados ni con modelos generalistas de tamano equivalente (por ejemplo, otras variantes de la familia Qwen3.5 o modelos de menos de 1.000 millones de parametros de otros autores) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no es un chatbot general ni una fuente de conocimiento autonomo: sin contexto de guia debe abstenerse, y usarlo como asistente general produce respuestas poco fiables.
- Esta entrenado y evaluado exclusivamente en ingles; no soporta otros idiomas (existe una variante separada en italiano).
- Riesgo de rechazos incorrectos elevado en un grupo concreto: un 57,1% de las preguntas respondibles de "que hay cerca" fueron rechazadas erroneamente, frente al 7,1% del modelo base. Es la principal regresion detectada respecto al base.
- Un 9,2% de las preguntas respondibles de pais tambien se rechazan de forma incorrecta.
- Al estar entrenado con respuestas extractivas y un limite de tres frases, no esta disenado para respuestas largas, explicativas o creativas.
- Debe ejecutarse con el modo de razonamiento desactivado (`enable_thinking=False`); usar el modo pensante se sale de las condiciones de entrenamiento.
- El corpus de entrenamiento es sintetico y derivado de volcados de Wikimedia, consejos oficiales de Canada y Reino Unido, traducciones automaticas de Wikivoyage italiano y datos de Wikidata, por lo que puede heredar sesgos y errores de esas fuentes, incluidos los de la traduccion automatica.
- Parte del contenido de entrenamiento procede de material bajo CC BY 4.0 (traducciones MarianMT) y de fuentes gubernamentales, con requisitos de atribucion detallados en `ATTRIBUTION.tsv`.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion, pero obliga a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- La cuantizacion es unica (Q4_K_M), lo que limita el ajuste fino del equilibrio entre calidad y memoria.
- No hay resultados de benchmarks estandar publicados, solo la evaluacion de rechazos de la model card.
- El repositorio registra 0 descargas y 0 likes en la informacion disponible, por lo que no existe validacion de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pockettravel/qwen3.5-0.8b-travel-en-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuantizacion de referencia del base (Unsloth): https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF
- Repositorio de la aplicacion Pocket Travel: https://github.com/miracle091/pocket-travel
- Perfil del autor en HuggingFace: https://huggingface.co/pockettravel
- Variante en italiano: https://huggingface.co/pockettravel/qwen3.5-0.8b-travel-it-gguf
- Modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
- Ficha de Qwen3.5-0.8B en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-5-0-8b.html
