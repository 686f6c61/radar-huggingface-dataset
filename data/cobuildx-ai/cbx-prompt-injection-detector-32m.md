# CobuildX-AI/cbx-prompt-injection-detector-32M

## Resumen

cbx-prompt-injection-detector-32M es un clasificador de texto encoder-only disenado para detectar ataques de *prompt injection*, tanto directos (en el mensaje del usuario) como indirectos (ocultos en correos, paginas web, resultados de herramientas o documentos recuperados). Lo desarrolla CobuildX-AI y se presenta como la variante recomendada de su familia de tres tamanos (17M, 32M y 68M), con el objetivo de minimizar falsos positivos manteniendo una precision cercana al modelo de 68M.

El modelo parte de `jhu-clsp/ettin-encoder-32m` (un encoder de la familia Ettin, derivada de ModernBERT) y se afina como clasificador binario que devuelve una probabilidad calibrada de ataque. Con 31.885.831 parametros y un repositorio de 0,1 GB, esta pensado para desplegarse como capa de seguridad de baja latencia delante de asistentes y agentes basados en LLM: segun el autor, procesa 1.000 tokens en aproximadamente 7 ms en GPU y 81 ms en CPU.

Su relevancia actual radica en el auge de agentes que consumen contenido no confiable (correo, web, salidas de herramientas) y en la necesidad de un filtro barato y rapido que evalue tanto el texto como el canal por el que llega, algo que la model card trata como parte central del diseno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT, base `jhu-clsp/ettin-encoder-32m`) para clasificacion de texto |
| Parametros totales | 31.885.831 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens por ventana; entradas mas largas se procesan en ventanas solapadas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (`en`); el autor indica evaluacion en ingles y no ingles en su split de test |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT afinado desde `jhu-clsp/ettin-encoder-32m` para una tarea de clasificacion binaria (ataque / no ataque). El autor no detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; se trata de un ajuste supervisado de clasificacion sobre datos propios generados, segun indica la model card, por el mismo generador que produjo parte del benchmark CBX.

La innovacion principal no esta en la arquitectura sino en la formulacion de la tarea: el modelo recibe el texto junto con el *canal* de origen (`user_message`, `email`, `web_page`, `tool_response`, `retrieved_document` o `unknown`), de modo que el criterio de que constituye un ataque cambia segun el canal. En mensajes de usuario se marcan intentos de sobrescribir el system prompt, extraer instrucciones ocultas o desactivar comportamientos de seguridad; en el resto de canales se marca cualquier instruccion dirigida al asistente y cualquier peticion de accion sensible (mover dinero, enviar datos personales, cambiar accesos, borrar datos). Las entradas de mas de 2.048 tokens se leen en ventanas solapadas y la puntuacion final es la del maximo, de forma que una inyeccion en cualquier punto marca la entrada completa.

## Capacidades

- Clasificacion binaria de prompt injection con probabilidad calibrada de ataque (`score`) y decision booleana con umbral configurable (`is_attack`, por defecto 0,5).
- Deteccion de ataques directos en mensajes de usuario: jailbreaks, extraccion de instrucciones del sistema, exfiltracion de secretos.
- Deteccion de ataques indirectos en correos, paginas web, resultados de herramientas y documentos recuperados.
- Deteccion de peticiones de acciones sensibles en canales no interactivos, incluso cuando el texto va dirigido a una persona y no menciona a una IA.
- Procesamiento por lotes mediante `score_batch` para evaluar muchas entradas a la vez.
- Ventana efectiva de 2.048 tokens con solapamiento para entradas largas.
- No marca como ataque cambios de peticion del propio usuario, role-play, ataques citados o discutidos (articulos de seguridad, preguntas del tipo "es esto una inyeccion?"), peticiones ordinarias en correos ni codigo o logs que contengan palabras como *ignore* u *override*.
- Capacidades multilingues: el autor reporta evaluacion en ingles y no ingles en su split de test, aunque la ficha del modelo declara solo `en`.

## Casos de uso

- Filtro de entrada en asistentes conversacionales: puntuar cada mensaje del usuario con `channel="user_message"` antes de pasarlo al LLM principal, bloqueando intentos de jailbreak o de extraccion del system prompt con un coste de milisegundos por peticion.
- Proteccion de agentes que leen correo: clasificar el cuerpo de cada correo con `channel="email"` para detectar instrucciones dirigidas al asistente o peticiones de acciones sensibles (transferencias, envio de credenciales) antes de que el agente actue.
- Defensa contra inyeccion indirecta en navegacion web: puntuar el contenido de paginas con `channel="web_page"` en pipelines de agentes con navegador, aprovechando la ventana de 2.048 tokens con solapamiento para cubrir documentos largos.
- Validacion de resultados de herramientas (tool calling): comprobar con `channel="tool_response"` las salidas de APIs y funciones externas antes de reinyectarlas en el contexto del modelo, un vector de ataque tipico en arquitecturas multi-paso.
- Saneamiento de RAG: clasificar cada fragmento recuperado con `channel="retrieved_document"` antes de incorporarlo al contexto, evitando que un documento envenenado controle la respuesta del asistente.
- Moderacion de seguridad en pipelines de CI/CD de aplicaciones LLM: usar `score_batch` para evaluar conjuntos de prompts de prueba en regresion y detectar si un cambio de prompt de sistema abre la puerta a inyecciones.
- Gateway de seguridad de baja latencia: desplegar el modelo como microservicio delante de un LLM en produccion; con 32M de parametros y ~7 ms por 1.000 tokens en GPU, el coste anadido es despreciable frente a la inferencia del modelo generativo.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (AP = average precision; "caught" = proporcion de ataques detectados; "flagged" = proporcion de textos benignos marcados; cada modelo en su umbral por defecto):

| Modelo | Parametros | CBX Benchmark AP | BrowseSafe-bench AP | BIPIA AP | deepset AP | InjecAgent caught | NotInject flagged | XSTest flagged |
|---|---|---|---|---|---|---|---|---|
| cbx-prompt-injection-detector-17M | 17M | 0,961 | 0,837 | 0,826 | 0,874 | 0,64 | 0,026 | 0,000 |
| cbx-prompt-injection-detector-32M | 32M | 0,979 | 0,832 | 0,764 | 0,843 | 0,55 | 0,026 | 0,000 |
| cbx-prompt-injection-detector-68M | 68M | 0,987 | 0,861 | 0,856 | 0,810 | 0,67 | 0,021 | 0,000 |
| PIGuard | 184M | 0,351 | 0,546 | 0,998 | 0,986 | 0,75 | 0,115 | 0,000 |
| Prompt Guard 2 86M | 86M | 0,254 | 0,786 | 0,859 | 0,917 | 0,50 | 0,047 | 0,000 |
| Prompt Guard 2 22M | 22M | 0,221 | 0,696 | 0,794 | 0,709 | 0,00 | 0,006 | 0,000 |
| ProtectAI v2 | 184M | 0,245 | 0,717 | 0,714 | 0,879 | 0,82 | 0,434 | 0,000 |
| deepset | 184M | 0,267 | 0,545 | 0,822 | 1,000 | 1,00 | 0,714 | 0,000 |

Notas del autor: el CBX Benchmark es un conjunto propio de 2.506 filas generado por el mismo generador que parte de los datos de entrenamiento (ventaja local); las marcas de aviso senalan modelos probablemente entrenados sobre el benchmark; BIPIA contiene un 75% de ataques, por lo que una clasificacion aleatoria ya obtiene 0,75 de AP. En el split de test propio (v2.2, 5.584 filas) el modelo de 32M alcanza AP 0,983, detectando el 91,0% de los ataques con un 1,8% de falsos positivos.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en precision completa para los 31,9M de parametros; cabe holgadamente en cualquier GPU consumer, incluso en iGPU o ejecucion en CPU.
- GPU recomendadas: cualquier GPU moderna sirve; el autor reporta ~7 ms por 1.000 tokens en GPU y ~81 ms por 1.000 tokens en CPU.
- Cabe en GPU consumer: si, sin restricciones practicas (RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: el repositorio incluye `cbx_prompt_injection.py` con la clase `PromptInjectionDetector` (carga el modelo una vez y usa GPU si esta disponible); tambien es desplegable con frameworks estandar de clasificacion de texto (por ejemplo, pipelines de Transformers o servidores de inferencia compatibles con safetensors), aunque la informacion disponible solo documenta el wrapper propio.
- Latencia y throughput: ~7 ms por 1.000 tokens en GPU y ~81 ms por 1.000 tokens en CPU, segun el autor.
- Instalacion: `hf download CobuildX-AI/cbx-prompt-injection-detector-32M --revision v0.1` y `pip install -r requirements.txt` desde el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CBX AP | deepset AP | InjecAgent caught | NotInject flagged | Licencia |
|---|---|---|---|---|---|---|---|
| cbx-prompt-injection-detector-32M | 32M | 2.048 tokens/ventana | 0,979 | 0,843 | 0,55 | 0,026 | Apache 2.0 |
| Prompt Guard 2 22M | 22M | no disponible | 0,221 | 0,709 | 0,00 | 0,006 | no disponible en la informacion |
| Prompt Guard 2 86M | 86M | no disponible | 0,254 | 0,917 | 0,50 | 0,047 | no disponible en la informacion |
| ProtectAI v2 | 184M | no disponible | 0,245 | 0,879 | 0,82 | 0,434 | no disponible en la informacion |
| deepset | 184M | no disponible | 0,267 | 1,000 | 1,00 | 0,714 | no disponible en la informacion |

El modelo de 32M ofrece el mejor equilibrio declarado entre deteccion y falsos positivos de su familia, con un Recall en InjecAgent (0,55) inferior al de ProtectAI v2 (0,82) y deepset (1,00), pero con una tasa de falsos positivos en NotInject mucho menor (0,026 frente a 0,434 y 0,714). Los datos de contexto y licencia de los competidores no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- El benchmark principal (CBX Benchmark) fue generado por el mismo generador que parte de los datos de entrenamiento del modelo, por lo que sus resultados tienen ventaja local y deben tomarse con cautela.
- El modelo solo declara oficialmente ingles; su comportamiento en castellano u otros idiomas no esta cuantificado en la informacion disponible.
- La ventana es de 2.048 tokens; entradas mas largas dependen del esquema de ventanas solapadas y de la regla del maximo, lo que puede generar falsos positivos si un fragmento aislado parece malicioso.
- El umbral de 0,5 es el punto de decision del propio modelo; en produccion conviene ajustarlo segun el coste relativo de falsos positivos y falsos negativos.
- Riesgo de alucinacion no aplicable en el sentido generativo (es un clasificador), pero si hay riesgo de clasificacion erronea: ataques novedosos, codificaciones o texto ofuscado pueden evadir el detector.
- El autor advierte de que el modelo marca peticiones de acciones sensibles en canales no interactivos incluso si van dirigidas a personas; esto puede aumentar los falsos positivos en correos legitimos de negocio.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los terminos del modelo base (`jhu-clsp/ettin-encoder-32m`) antes de desplegar.
- Version v0.1: el autor recomienda fijar la revision (`--revision v0.1`) por tratarse de una version inicial.
- Modelo con muy pocas descargas (2) y ningun "like" en el momento de la ficha: ecosistema y validacion externa practicamente inexistentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CobuildX-AI/cbx-prompt-injection-detector-32M
- Variante 17M: https://huggingface.co/CobuildX-AI/cbx-prompt-injection-detector-17M
- Variante 68M: https://huggingface.co/CobuildX-AI/cbx-prompt-injection-detector-68M
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Benchmark BrowseSafe: https://huggingface.co/datasets/perplexity-ai/browsesafe-bench
- BIPIA: https://github.com/microsoft/BIPIA
- Dataset deepset/prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- InjecAgent: https://github.com/uiuc-kang-lab/InjecAgent
- PIGuard: https://huggingface.co/leolee99/PIGuard
- Prompt Guard 2 86M: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M
- Prompt Guard 2 22M: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-22M
- ProtectAI v2: https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
- deepset deberta-v3-base-injection: https://huggingface.co/deepset/deberta-v3-base-injection
