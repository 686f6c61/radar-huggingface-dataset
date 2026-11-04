# CobuildX-AI/cbx-prompt-injection-detector-17M

## Resumen

cbx-prompt-injection-detector-17M es un clasificador de texto especializado en detectar *prompt injections*, es decir, texto disenado para que un asistente de IA obedezca instrucciones no autorizadas en lugar de las de su operador. Lo desarrolla CobuildX-AI y se distribuye con licencia Apache 2.0. Esta afinado a partir del encoder jhu-clsp/ettin-encoder-17m y cuenta con 16.799.239 parametros, lo que lo convierte en la variante mas ligera de una familia que tambien incluye versiones de 32M y 68M.

Su principal singularidad es que no analiza solo el texto, sino tambien el canal por el que llega (`user_message`, `email`, `web_page`, `tool_response`, `retrieved_document` o `unknown`). Esto le permite distinguir entre un ataque directo en el mensaje del usuario y una inyeccion indirecta oculta en un correo, una pagina web o el resultado de una herramienta, algo critico en arquitecturas de agentes. Devuelve una probabilidad calibrada de ataque y esta pensado para desplegarse como filtro de entrada en pipelines de seguridad de LLM.

La version actual es v0.1 y el modelo esta optimizado para inferencia en CPU: aproximadamente 6 ms por cada 1.000 tokens en GPU y 37 ms en CPU. Solo soporta ingles. Su relevancia actual radica en que ofrece una alternativa de muy bajo coste computacional a clasificadores de seguridad mucho mas grandes (86M a 184M parametros) con resultados competitivos en varios benchmarks publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base jhu-clsp/ettin-encoder-17m) |
| Parametros totales | 16.799.239 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens por ventana (entradas mas largas se procesan en ventanas solapadas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de un encoder ModernBERT de 17M de parametros (jhu-clsp/ettin-encoder-17m) para clasificacion de texto binaria con salida de probabilidad calibrada. La tarea de clasificacion incorpora el canal de origen del texto como senal adicional, de modo que el mismo contenido puede etiquetarse de forma distinta segun llegue como mensaje de usuario, correo, pagina web, respuesta de herramienta o documento recuperado.

El autor no detalla en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. Si se indica que parte de los datos de entrenamiento fue generada por el mismo generador que produjo el benchmark propio CBX, lo que introduce una ventaja de familiaridad en esa evaluacion. Para entradas de mas de 2.048 tokens se aplica ventana deslizante con solapamiento y se toma la puntuacion maxima, de forma que una inyeccion en cualquier punto marca la entrada completa.

## Capacidades

- Deteccion de prompt injection directa en mensajes de usuario: intentos de sobrescribir el system prompt, extraer instrucciones ocultas o secretos, o desactivar comportamientos de seguridad (jailbreaks).
- Deteccion de inyeccion indirecta en correos, paginas web, resultados de herramientas y documentos recuperados.
- Deteccion de solicitudes de acciones sensibles en canales no interactivos (transferencias de dinero, trading, envio de datos personales o ficheros confidenciales, cambios de acceso o recuperacion, borrado de datos), incluso si el texto no menciona a una IA.
- Salida de probabilidad calibrada de ataque, con umbral por defecto de 0.5 ajustable.
- Clasificacion por lotes (`score_batch`) y procesamiento de textos largos mediante ventanas solapadas.
- Diferenciacion por canal de origen del texto.
- No marca como ataque cambios de peticion del propio usuario, role-play, ataques citados o discutidos, peticiones ordinarias en correos ni codigo o logs que contengan palabras como *ignore* u *override*.
- No dispone de tool calling, generacion de texto, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un clasificador.

## Casos de uso

- Filtro de entrada en asistentes conversacionales: cada mensaje del usuario se puntua antes de llegar al LLM principal; con un umbral ajustado se bloquean jailbreaks y extracciones de system prompt con un coste de milisegundos por peticion.
- Proteccion de agentes con acceso a herramientas: los resultados de herramientas (`tool_response`) se clasifican antes de incorporarse al contexto del agente, detectando inyecciones indirectas ocultas en APIs de terceros.
- Saneamiento de correo entrante en asistentes de bandeja de entrada: el cuerpo del correo se evalua con `channel="email"` para detectar instrucciones dirigidas a la IA y solicitudes de acciones sensibles como transferencias o envio de datos.
- Navegacion web asistida: las paginas recuperadas se puntuan con `channel="web_page"` antes de pasarlas al modelo generativo, mitigando inyecciones en contenido web.
- Seguridad en pipelines RAG: los documentos recuperados (`retrieved_document`) se filtran antes de la generacion, reduciendo el riesgo de envenenamiento del contexto.
- Despliegue en CPU y entornos con recursos limitados: con unos 37 ms por 1.000 tokens en CPU, puede ejecutarse en el mismo host que el orquestador de agentes sin GPU dedicada, como capa de defensa en profundidad.
- Monitorizacion y auditoria: el scoring por lotes permite analizar historicos de conversaciones o logs para detectar patrones de ataque y generar metricas de seguridad.

## Benchmarks y rendimiento

Resultados publicados en la model card (AP = average precision; "caught" = proporcion de ataques detectados; "flagged" = proporcion de textos benignos marcados). Cada modelo se evalua en su umbral por defecto.

| Modelo | Parametros | CBX Benchmark AP | BrowseSafe-bench AP | BIPIA AP | deepset AP | InjecAgent caught | NotInject flagged | XSTest flagged |
|---|---|---|---|---|---|---|---|---|
| **cbx-prompt-injection-detector-17M** | 17M | 0.961 | 0.837 | 0.826 | 0.874 | 0.64 | 0.026 | 0.000 |
| cbx-prompt-injection-detector-32M | 32M | 0.979 | 0.832 | 0.764 | 0.843 | 0.55 | 0.026 | 0.000 |
| cbx-prompt-injection-detector-68M | 68M | 0.987 | 0.861 | 0.856 | 0.810 | 0.67 | 0.021 | 0.000 |
| PIGuard | 184M | 0.351 | 0.546 | 0.998 | 0.986 | 0.75 | 0.115 | 0.000 |
| Prompt Guard 2 86M | 86M | 0.254 | 0.786 | 0.859 | 0.917 | 0.50 | 0.047 | 0.000 |
| Prompt Guard 2 22M | 22M | 0.221 | 0.696 | 0.794 | 0.709 | 0.00 | 0.006 | 0.000 |
| ProtectAI v2 | 184M | 0.245 | 0.717 | 0.714 | 0.879 | 0.82 | 0.434 | 0.000 |
| deepset | 184M | 0.267 | 0.545 | 0.822 | 1.000 | 1.00 | 0.714 | 0.000 |

Notas del autor: el CBX Benchmark es un conjunto propio de 2.506 filas con pares ataque/limpio y negativos dificiles, generado por el mismo generador que parte de los datos de entrenamiento (ventaja de familiaridad para los modelos CBX). La marca de advertencia indica modelos probablemente entrenados sobre ese benchmark. BIPIA contiene un 75% de ataques, por lo que una clasificacion aleatoria ya obtendria 0,75 de AP. En el split de test propio (v2.2, 5.584 filas) el modelo de 17M alcanza AP 0.976, detectando el 90,4% de ataques con un 3,8% de falsos positivos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (17M parametros, aproximadamente 67 MB de pesos), y aun menor en fp16; el repo completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3090, T4 y GPUs integradas.
- Cabe holgadamente en cualquier GPU de consumo e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: el repositorio incluye la clase `PromptInjectionDetector` en `cbx_prompt_injection.py`; admite carga via `huggingface_hub` con `--revision v0.1`. Por ser un encoder de clasificacion estandar, es compatible con frameworks de inferencia de transformers (no se mencionan integraciones especificas con vLLM, llama.cpp, Ollama o TGI en la informacion disponible).
- Latencia y throughput: aproximadamente 6 ms por 1.000 tokens en GPU y 37 ms por 1.000 tokens en CPU, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Notas |
|---|---|---|---|---|---|
| cbx-prompt-injection-detector-17M | 17M | 2.048 tokens por ventana | Apache 2.0 | Deteccion por canal, directa e indirecta | AP 0.961 en CBX, 0.026 de falsos positivos en NotInject |
| cbx-prompt-injection-detector-68M | 68M | no disponible | Apache 2.0 | Igual, mayor tamano | AP 0.987 en CBX, 0.67 en InjecAgent |
| Prompt Guard 2 86M (Meta) | 86M | no disponible | no disponible en la informacion | Clasificador de seguridad | AP 0.254 en CBX, 0.786 en BrowseSafe |
| ProtectAI v2 | 184M | no disponible | no disponible en la informacion | Clasificador de inyeccion | AP 0.245 en CBX, 0.434 de falsos positivos en NotInject |
| deepset/deberta-v3-base-injection | 184M | no disponible | no disponible en la informacion | Clasificador de inyeccion | AP 0.267 en CBX, 0.714 de falsos positivos en NotInject |

La ventaja principal del modelo de 17M frente a alternativas mas grandes es el coste computacional (ordenes de magnitud menor) y la tasa de falsos positivos en textos benignos con palabras disparadoras (2,6% en NotInject frente al 43,4% de ProtectAI v2 y el 71,4% de deepset). Su punto debil relativo es InjecAgent (0,64 de ataques detectados), donde ProtectAI v2 y deepset alcanzan valores superiores, aunque con muchas mas falsas alarmas.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en otros idiomas no esta documentado.
- Es un clasificador, no un generador: no puede explicar sus decisiones ni razonar sobre casos ambiguos.
- Riesgo de falsos negativos en ataques novedosos o muy ofuscados; el autor reporta un 90,4% de deteccion con 3,8% de falsos positivos en su propio test, pero el rendimiento fuera de distribucion puede degradarse.
- La ventaja en el CBX Benchmark puede estar inflada por familiaridad con el generador de datos de entrenamiento; conviene ponderar mas los resultados en benchmarks externos (BrowseSafe, BIPIA, InjecAgent).
- El umbral de 0.5 es el punto de decision del modelo; en produccion debe calibrarse segun el coste relativo de falsos positivos y falsos negativos.
- La clasificacion por ventanas de 2.048 tokens con maximo por ventana puede generar falsos positivos si una ventana contiene texto ambiguo aislado de su contexto.
- Version v0.1: el autor recomienda fijar la revision (`--revision v0.1`) por si cambia el comportamiento en futuras versiones.
- No se documentan sesgos especificos ni evaluaciones de robustez adversarial fuera de los benchmarks citados.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantias ni soporte.
- No sustituye a otras capas de defensa: debe combinarse con validacion de acciones, permisos minimos y monitorizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CobuildX-AI/cbx-prompt-injection-detector-17M
- Variante 32M: https://huggingface.co/CobuildX-AI/cbx-prompt-injection-detector-32M
- Variante 68M: https://huggingface.co/CobuildX-AI/cbx-prompt-injection-detector-68M
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-17m
- Benchmark BrowseSafe: https://huggingface.co/datasets/perplexity-ai/browsesafe-bench
- Benchmark BIPIA: https://github.com/microsoft/BIPIA
- Dataset deepset/prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- Benchmark InjecAgent: https://github.com/uiuc-kang-lab/InjecAgent
- Dataset NotInject: https://huggingface.co/datasets/leolee99/NotInject
- PIGuard: https://huggingface.co/leolee99/PIGuard
- Prompt Guard 2 86M: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M
- Prompt Guard 2 22M: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-22M
- ProtectAI v2: https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
- deepset/deberta-v3-base-injection: https://huggingface.co/deepset/deberta-v3-base-injection
