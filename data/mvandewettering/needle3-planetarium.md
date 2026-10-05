# mvandewettering/needle3-planetarium

## Resumen

Needle 3 — Planetarium es un ajuste fino mediante LoRA del modelo Cactus-Compute/needle3, un modelo base de llamada a herramientas (tool calling) disenado para dispositivos muy pequenos. El ajuste lo publica el usuario mvandewettering (brainwagon en GitHub) y su objetivo concreto es convertir ordenes de planetario en lenguaje natural ("show me Saturn from Tokyo", "hide the grid") en llamadas estructuradas a una de quince herramientas de una aplicacion de planetario.

El modelo base Needle 3 se describe como un "automation foundation model" para moviles, wearables, robots, domotica, automocion y microcontroladores, con un unico binario de 8 a 29 MB cuantizado a 2 bits. La relevancia de este ajuste no esta en el rendimiento bruto, sino en demostrar que un modelo de este tamano puede ejecutarse integramente en el navegador mediante el motor WebAssembly de Needle y controlar una aplicacion interactiva por voz o texto.

Este fine-tune no aporta capacidades de chat general ni conocimiento astronomico: mapea palabras a llamadas de herramienta y la aplicacion es la que resuelve los nombres de objetos a coordenadas. Se distribuye como archivo `.cact` de 4 bits y su licencia es Apache 2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base descrito como "automation foundation model" para dispositivos pequenos) |
| Parametros totales | no disponible (modelo base publicado como binario de 8-29 MB a 2 bits) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits en el modelo base; el fine-tune se exporta a 4 bits |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.cact` (archivo de 4 bits para el motor Needle); tamano de repo 0,1 GB |

## Arquitectura y entrenamiento

El modelo base Needle 3 es un modelo de lenguaje orientado a llamada de herramientas y extraccion estructurada, pensado para ejecutarse en dispositivos con recursos muy limitados (telefonos, wearables, microcontroladores). La informacion disponible no detalla su arquitectura interna (transformer, atencion lineal u otra), su numero de parametros ni su longitud de contexto; solo se indica que el binario completo ocupa entre 8 y 29 MB y usa cuantizacion de 2 bits.

El ajuste Planetarium se realizo con LoRA de rango 16 sobre las proyecciones de atencion, con el modelo base congelado, mediante el comando `needle finetune --epochs 3 --batch-size 8 --max-len 768`, sobre un RTX 4060 de 8 GB. El dataset son 6.000 ejemplos sinteticos generados a partir de plantillas (`train/gen_data.py`); cada ejemplo se presenta con un subconjunto de cinco herramientas que incluye distractores de casi-error, aproximadamente un 8% de peticiones fuera de tema con rechazo y cerca de un 15% de peticiones de dos llamadas. Los argumentos de las llamadas son siempre fragmentos literales de la peticion. El adaptador se fusiona y se exporta con `needle build` a 4 bits. Como innovacion practica destacable, el modelo se integra en el motor WebAssembly de Needle y en una pasarela de "grounding" que puede retener llamadas dudosas en `suppressed_calls`.

## Capacidades

- Tool calling y function calling sobre quince herramientas de planetario: `show_object`, `follow_object`, `set_location`, `set_date_time`, `reset_to_now`, `set_time_speed`, `zoom`, `set_view`, `look_toward`, `show_overlay`, `hide_overlay`, `show_path`, `object_info`, `rise_set_times` y `list_visible`.
- Interpretacion de comandos de astronomia en lenguaje natural, incluyendo peticiones compuestas de dos llamadas (por ejemplo, mostrar un objeto y ajustar la velocidad del tiempo).
- Delimitacion de argumentos como fragmentos literales de la peticion (span extraction).
- Rechazo de peticiones fuera de tema (capacidad entrenada con ejemplos de rechazo).
- Ejecucion en el navegador a traves del motor WASM de Needle y del runtime de Node, sin GPU.
- No dispone de modo de razonamiento explicito, vision, audio ni generacion de texto libre; su funcion es mapear lenguaje a llamadas de herramienta.
- Capacidades multilingues: no disponibles en la informacion proporcionada (los ejemplos mostrados estan en ingles).

## Casos de uso

- Control de planetario por lenguaje natural en el navegador: el modelo convierte "show me Saturn from Tokyo" en la llamada `show_object` con el objeto y la ubicacion correctos, y la aplicacion resuelve las coordenadas mediante su propio catalogo.
- Interfaz de voz para aplicaciones web educativas: integrado en la demo WASM, permite dictar comandos y que el modelo los traduzca a acciones de la escena sin enviar datos a un servidor.
- Asistente de observacion astronomica en movil: con un binario de 8-29 MB, puede desplegarse en telefonos y wearables para responder a consultas como horas de salida y puesta de un objeto (`rise_set_times`) o listar objetos visibles (`list_visible`).
- Automatizacion de vistas y seguimiento: comandos como "follow the Moon" o "look toward Mars" se traducen a `follow_object` y `look_toward` para animar la camara de forma programatica.
- Control de linea temporal de la simulacion: ordenes de avance o retroceso ("rewind at an hour per second") se convierten en `set_time_speed` y `set_date_time`, utiles para demostraciones didacticas de fenomenos celestes.
- Extraccion estructurada en dominios acotados: el mismo patron de fine-tune (plantillas, subconjuntos de herramientas, spans literales) puede replicarse para otras aplicaciones con vocabulario cerrado, como paneles de control o domotica.
- Evaluacion de modelos on-device: sirve como banco de pruebas para medir precision de tool calling y latencia en WASM frente al modelo base, sin infraestructura de GPU.

## Benchmarks y rendimiento

Precision de coincidencia exacta sobre comandos escritos a mano y conservados fuera de las plantillas de entrenamiento, ejecutados a traves del motor WASM con las quince herramientas declaradas:

| Conjunto de prueba | Needle 3 base | Este fine-tune |
|---|---|---|
| `cases3.json` — 40 comandos con formulaciones no vistas en entrenamiento | 20/40 (50%) | 26/40 (65%) |
| `cases2.json` — 36 comandos escritos antes del generador | 18/36 (50%) | 31/36 (86%) |
| Division de validacion del propio entrenador (600 ejemplos de plantilla) | — | 538/600 (90%) |

La latencia media en el runtime WASM de Node es de aproximadamente 0,6 s por comando, tanto para el modelo base como para este ajuste. Los fallos restantes corresponden sobre todo a sinonimos sin evidencia literal de un valor de enumeracion (por ejemplo, "freeze time" hacia `pause`), que la pasarela de grounding retiene en `suppressed_calls` aunque la llamada sea correcta, y a formulaciones muy alejadas de las plantillas ("closer", "normal speed").

## Requisitos de hardware

- Inferencia: minima, al tratarse de un binario de 4 bits derivado de un modelo base de 8-29 MB; puede ejecutarse en CPU, en el navegador via WebAssembly y en dispositivos embebidos o microcontroladores compatibles con Needle.
- No requiere VRAM dedicada para inferencia; no se especifica un minimo de memoria, aunque el tamano del modelo y del motor WASM es de decenas de MB.
- Entrenamiento (LoRA): se realizo en un unico RTX 4060 de 8 GB.
- GPU recomendadas: no disponibles para inferencia (no aplica); para reentrenamiento, cualquier GPU consumer de 8 GB o superior es suficiente segun el propio autor.
- Cabe en GPU consumer: si, y no necesita GPU para inferir.
- Opciones de despliegue: motor Needle (`.cact`) en WASM para el navegador, `needle.Needle` en Python y `needle_load` en el motor WASM; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: aproximadamente 0,6 s por comando en el runtime WASM de Node. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Despliegue |
|---|---|---|---|---|---|
| Needle 3 — Planetarium (este) | no disponible (base 8-29 MB a 2 bits; export a 4 bits) | no disponible | 15 herramientas de planetario; 65-86% de acierto exacto en los conjuntos de prueba | Apache 2.0 | WASM en navegador, Needle en Python |
| Cactus-Compute/needle3 (base) | no disponible (8-29 MB a 2 bits) | no disponible | tool calling y extraccion generales; reduccion de herramientas por retrieval de embeddings; 50% en `cases3` y `cases2` | Apache 2.0 | Needle (WASM, dispositivos) |

No se dispone en la informacion proporcionada de datos de rendimiento de otros modelos de tool calling comparables del mismo tamano, por lo que no es posible establecer una comparativa cuantitativa con alternativas externas.

## Limitaciones y advertencias

- Los ajustes finos locales no entrenan la cabeza de calibracion de Needle y `needle build` la descarta: la `confidence` que reporta el motor es la probabilidad bruta de decodificacion, no calibrada.
- Al descartar esa cabeza se pierde tambien la lectura de embeddings: `needle_embed` devuelve error y, con mas de cinco herramientas, el motor no puede hacer recuperacion de herramientas, de modo que el modelo ve todas las declaradas aunque se entreno con subconjuntos de cinco.
- Los datos de entrenamiento son generados por plantillas, por lo que formulaciones alejadas de ellas pueden fallar aunque la intencion sea correcta.
- Al igual que el modelo base, no conoce el cielo: solo mapea palabras a llamadas de herramienta; la resolucion de nombres a coordenadas la hace la aplicacion.
- Errores tipicos observados: sinonimos sin evidencia literal de un valor de enumeracion (por ejemplo, "freeze time" hacia `pause`) y expresiones poco frecuentes ("closer", "normal speed"), con fallos incluso cuando la llamada subyacente es correcta.
- Idiomas soportados no disponibles; los ejemplos y plantillas estan en ingles, sin garantia de comportamiento en castellano.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantias por parte del autor; el modelo base es de Cactus-Compute.
- No se han publicado datos de contexto, numero de parametros ni composicion detallada del corpus del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mvandewettering/needle3-planetarium
- Modelo base: https://huggingface.co/Cactus-Compute/needle3
- Repositorio del proyecto: https://github.com/brainwagon/needle-planetarium
- Esquemas de herramientas: https://github.com/brainwagon/needle-planetarium/blob/main/site/data/tools.json
- Demo en el navegador: https://mvandewettering.com/needle-planetarium/
- Repositorio de Needle (Cactus): https://github.com/cactus-compute/needle
- Pagina de Needle 3 en Cactus: https://cactuscompute.com/needle
