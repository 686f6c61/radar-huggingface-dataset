# selorahomes/Selora-AI-LLM-14B-ollama

## Resumen

Selora AI LLM 14B (repositorio `selorahomes/Selora-AI-LLM-14B-ollama`) es un ajuste fino de Qwen3-14B orientado especificamente al control de domotica mediante Home Assistant. Lo desarrolla selorahomes y su proposito es convertir lenguaje natural en acciones y respuestas estructuradas sobre una instalacion domotica: ejecutar comandos sobre entidades, generar automatizaciones en YAML, responder preguntas sobre el sistema y pedir aclaraciones cuando la peticion es ambigua. El modelo se distribuye unicamente como GGUF cuantizado en Q5_K_S (10,3 GB) para su uso directo en Ollama sin necesidad de intercambiar adaptadores en caliente.

Tecnicamente es un transformer denso de decodificacion con 14.768.307.200 parametros, derivado del modelo base Qwen/Qwen3-14B bajo licencia Apache 2.0. La innovacion principal no esta en la arquitectura, sino en la fusion: la variante de referencia publica una base cuantizada mas cinco adaptadores LoRA (command, automation, answer, clarification y utilities) que se activan por peticion, mientras que este repositorio fusiona los cinco en un unico modelo para runtimes que no permiten conmutar adaptadores, como Ollama. Esa simplificacion tiene un coste medible en precision, documentado por el propio autor.

Su relevancia practica es acotada pero clara: es una de las pocas propuestas de modelo abierto empaquetado especificamente para un stack de domotica concreto, con prompts de sistema, plantilla de chat y parametros de muestreo versionados junto a los pesos. La ventana de contexto operativa es de 4096 tokens y el modelo esta entrenado unicamente en ingles, con salida JSON estricta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de decodificacion (derivado de Qwen3-14B); detalles de capas y atencion no disponibles en la informacion proporcionada |
| Parametros totales | 14.768.307.200 |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 4096 tokens (`num_ctx 4096` en el `Modelfile`) |
| Tipos de cuantizacion | GGUF Q5_K_S (10,3 GB / 9,6 GiB) publicado en el repo; no se listan otras cuantizaciones en la informacion disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 (hereda la de Qwen3-14B) |
| Formato de pesos | GGUF; acompanado de `Modelfile`, `system`, `template`, `params` y `manifest.json` |

Otros datos: repositorio de 51,3 GB, 301 descargas, 0 likes, creado el 2026-09-29 y actualizado el 2026-10-16. Requiere aproximadamente 16 GB de memoria para su ejecucion.

## Arquitectura y entrenamiento

El modelo parte de Qwen3-14B y se construye mediante un pipeline de ajuste fino con LoRA sobre cinco especialistas diferenciados: `command` (ejecucion de comandos sobre entidades), `automation` (generacion de automatizaciones y blueprints YAML), `answer` (respuestas informativas), `clarification` (peticiones de aclaracion ante ambiguedad) y `utilities` (consultas apoyadas en documentacion relevante). La variante de referencia mantiene la base cuantizada y carga el adaptador correspondiente en cada peticion (llama.cpp con `--lora` o vLLM con `--enable-lora`). Este repositorio fusiona los cinco adaptadores en un unico GGUF, de modo que el propio modelo debe decidir primero el tipo de respuesta mediante un prompt de enrutador.

Esa decision de diseno es la clave tecnica del build: cada adaptador fue entrenado contra su propio prompt de sistema, pero el modelo fusionado se guia por un prompt de enrutador que no se corresponde con la forma de ningun adaptador original. El autor reconoce explicitamente que la fusion sacrifica precision a cambio de simplicidad de despliegue, y recomienda usar los adaptadores cuando el runtime lo permita. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

El formato de prompt es ChatML con el prefijo `/no_think` en el turno de usuario para suprimir el bloque de razonamiento de Qwen3 y obtener JSON plano. La plantilla debe emitir el bloque `<think></think>` vacio (forma parte del prompt, no de la salida) porque el entrenamiento lo incluye enmascarado; si se omite, el modelo genera como si la apertura `{"` ya estuviese escrita y devuelve `q=[...]`, que ningun analizador acepta. Los parametros de generacion fijados son temperatura 0.0, `repeat_penalty` 1.0, `repeat_last_n` 256 y stop en `<|im_end|>` y `<|endoftext|>`; la penalizacion por repeticion se mantiene a 1.0 de forma deliberada porque la salida JSON contiene muchos tokens estructurales repetidos.

## Capacidades

- Generacion de texto conversacional en ingles, restringida al dominio de domotica y Home Assistant.
- Enrutado interno entre cinco tipos de respuesta: comando, automatizacion, respuesta informativa, aclaracion y utilidades.
- Salida estructurada: el modelo devuelve exactamente un objeto JSON de uno de los cinco tipos posibles.
- Ejecucion de comandos sobre entidades: recibe una lista `AVAILABLE ENTITIES` en el turno de usuario y mapea la peticion en lenguaje natural a acciones sobre esas entidades.
- Generacion de automatizaciones en YAML validadas como blueprint de Home Assistant, con todos los parametros de entrada solicitados conectados.
- Peticion de aclaraciones cuando la instruccion es ambigua o falta informacion.
- Respuesta a preguntas sobre el sistema apoyandose en un bloque `RELEVANT DOCS` inyectado en el contexto.
- Integracion con Home Assistant a traves del backend Ollama de la integracion oficial del autor.
- Soporte de tool calling, agentes multi-paso, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Control por voz o texto de una vivienda: el modelo recibe la lista de entidades disponibles y traduce ordenes como encender luces o ajustar persianas a un objeto JSON de comando, con la ventana de 4096 tokens suficiente para incluir el inventario de entidades de una instalacion domestica tipica.
- Creacion de automatizaciones sin programar: el usuario describe la rutina deseada y el modelo genera el YAML de un blueprint de Home Assistant; en el conjunto `automations` del benchmark Allen obtiene un 100 % de exito tanto en la variante fusionada como en la de adaptadores.
- Asistente conversacional de dudas sobre la instalacion: con el bloque `RELEVANT DOCS` inyectado, el modelo responde preguntas sobre el funcionamiento del sistema; es el caso donde la fusion pierde mas precision (59,5 % frente a 85,7 % con adaptadores).
- Desambiguacion en flujos conversacionales: cuando la peticion no identifica una entidad o una accion de forma unica, el modelo emite una respuesta de tipo `clarification` en lugar de ejecutar una accion incorrecta, lo que reduce falsos positivos en automatizaciones criticas.
- Despliegue en hardware domotico de gama media: al ocupar 9,6 GiB en Q5_K_S y requerir unos 16 GB de memoria, puede ejecutarse en un mini-PC o NAS con GPU integrada o CPU, o en una unica GPU de consumo, sin necesidad de infraestructura de servidores.
- Sustitucion de asistentes en la nube por procesamiento local: al ser Apache 2.0 y funcionar en Ollama, permite mantener las transcripciones de voz y el estado del hogar dentro de la red local, un requisito habitual en proyectos de privacidad.
- Punto de partida para ajustes de dominio propio: el repositorio incluye `Modelfile`, `system`, `template` y `params` generados desde el repositorio de modelos del autor, lo que sirve como plantilla reproducible para construir asistentes de dominio cerrado con salida JSON estricta.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el benchmark Allen (`allenporter/home-assistant-datasets`), medidos a traves del backend Ollama de la integracion de Home Assistant, con temperatura 0 y sobre los conjuntos completos. Se comparan la variante fusionada (este repositorio) y el paquete de adaptadores.

| Dataset | Casos | Fusionado, solo modelo | Adaptadores, solo modelo | Fusionado, con overrides | Adaptadores, con overrides |
|---|---|---|---|---|---|
| assist | 460 | 65,9 % | 80,4 % | 82,4 % | 88,0 % |
| assist-mini | 196 | 87,8 % | 95,9 % | 100,0 % | 100,0 % |
| questions | 370 | 59,5 % | 85,7 % | 91,6 % | 94,6 % |
| automations | 20 | 100,0 % | 100,0 % | 100,0 % | 100,0 % |

Notas metodologicas del autor: la columna "solo modelo" desactiva los overrides deterministas de la integracion, de modo que cada turno lo decide el modelo; "con overrides" los mantiene activados. Ninguna de las dos configuraciones coincide exactamente con la de produccion, ya que en la ejecucion se desactivaron la aprobacion y la lista blanca de comandos seguros. Las ejecuciones fusionadas emplearon el prompt `system` de este repositorio, que permite al modelo responder a una peticion de blueprint con YAML. Una respuesta de `automations` se considera valida si Home Assistant la acepta como blueprint con todas las entradas solicitadas conectadas; la automatizacion no se ejecuta.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Memoria estimada: aproximadamente 16 GB segun el autor, con un peso de 10,3 GB para el fichero Q5_K_S y el resto destinado a contexto, cache KV y overhead del runtime.
- GPU de consumo: cabe con holgura en una RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB), y con menos margen en tarjetas de 12 GB, donde no entraria el fichero Q5_K_S completo.
- GPU de datacenter: A100, H100, L40S o similares, sobradamente dimensionadas para este tamano; no aportan ventaja significativa frente a opciones de consumo para un unico flujo de inferencia.
- Ejecucion en CPU: viable dado que el modelo esta cuantizado en GGUF y el requisito de memoria es de unos 16 GB de RAM del sistema, con latencias mas altas no cuantificadas en la informacion disponible.
- Opciones de despliegue documentadas: Ollama (con `ollama run hf.co/selorahomes/Selora-AI-LLM-14B-ollama:selora-ollama.Q5_K_S.gguf` o construyendo desde el `Modelfile` del repositorio) y llama.cpp para cargar un unico GGUF. vLLM y llama.cpp con `--lora` se mencionan para el paquete de adaptadores, no para este build fusionado.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Nota sobre seleccion de cuantizacion: el autor recomienda etiquetar explicitamente el fichero como `selora-ollama.Q5_K_S.gguf` porque la integracion de Ollama de Hugging Face selecciona `Q4_K_M` cuando esta presente y, en caso contrario, elige una cuantizacion "razonable" del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Selora AI LLM 14B ollama (fusionado, este repo) | 14,77 B denso | 4096 tokens | Un unico GGUF; el modelo elige el tipo de respuesta via prompt de enrutador | Apache 2.0 | GGUF Q5_K_S, Ollama y llama.cpp |
| Selora AI LLM 14B (paquete de adaptadores) | 14,77 B denso + 5 LoRA | 4096 tokens | Base cuantizada mas cinco adaptadores conmutados por peticion; el llamante elige el tipo de respuesta | Apache 2.0 | llama.cpp con `--lora`, vLLM con `--enable-lora` |
| Qwen3-14B (modelo base) | 14,77 B denso | No disponible en la informacion proporcionada | Modelo generalista multilingue con modo de razonamiento | Apache 2.0 | safetensors y GGUF en el repositorio oficial |

En precision sobre el benchmark Allen, el paquete de adaptadores supera al build fusionado en los tres conjuntos con margen (80,4 % frente a 65,9 % en `assist`; 85,7 % frente a 59,5 % en `questions`; 95,9 % frente a 87,8 % en `assist-mini`) y empata al 100 % en `automations`. La ventaja del fusionado es exclusivamente operativa: funciona en runtimes que no admiten conmutacion de adaptadores.

## Limitaciones y advertencias

- Perdida de precision por la fusion: el autor la reconoce explicitamente y recomienda usar los adaptadores si el runtime lo permite. La caida mas acusada se da en el conjunto `questions`, con 26,2 puntos porcentuales menos en modo solo modelo.
- El prompt de enrutador no coincide con la forma de ningun adaptador original, lo que introduce un desajuste entre entrenamiento e inferencia que no existe en el despliegue con adaptadores.
- Idioma unico: el modelo esta etiquetado solo para ingles. No hay soporte documentado de castellano ni de otros idiomas.
- Contexto reducido: 4096 tokens, muy por debajo de lo habitual en modelos de este tamano; instalaciones con inventarios de entidades o documentacion extensos pueden desbordar la ventana.
- Sensibilidad extrema a la plantilla: la inferencia debe coincidir byte a byte con el entrenamiento. Omitir el bloque `<think></think>` vacio produce JSON invalido (`q=[...]` en lugar de `{"q":[...]}`), lo que rompe cualquier analizador. Ollama usa la plantilla embebida en el GGUF, no el fichero `template` del repositorio, y aquella emite el bloque siempre, incluso con `--think=false`.
- Dominio muy restringido: es un modelo especializado en Home Assistant. Fuera de ese ambito su utilidad generalista no esta documentada ni medida, y no se han publicado benchmarks de conocimiento general.
- Riesgo de alucinacion en el uso general: el modelo responde con objetos JSON de cinco tipos predefinidos; entidades o acciones inventadas solo se evitan si la lista `AVAILABLE ENTITIES` se inyecta correctamente y si se mantienen las validaciones posteriores.
- Restricciones operativas en produccion: la ejecucion de referencia del benchmark desactivo la aprobacion y la lista blanca de comandos seguros. En un despliegue real deben mantenerse ambas; el benchmark no valida el efecto de ejecutar fisicamente las automatizaciones generadas, solo que Home Assistant las acepte como blueprint.
- La puntuacion de 100 % en `automations` se calcula sobre solo 20 casos, por lo que su poder estadistico es limitado.
- Sin sesgos conocidos documentados, y sin datos publicados sobre tasas de alucinacion o comportamiento fuera de distribucion.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de atribucion de Qwen3-14B incluido en el fichero `NOTICE` del repositorio.
- Los ficheros `Modelfile`, `system`, `template` y `params` se regeneran en cada release y se sobrescriben; el autor desaconseja editarlos en este repositorio. La fuente de verdad del prompt de sistema es `data-pipeline/prompts/router_system_prompt.txt` en su repositorio de modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/selorahomes/Selora-AI-LLM-14B-ollama
- Paquete de adaptadores de referencia: https://huggingface.co/selorahomes/Selora-AI-LLM-14B
- Integracion para Home Assistant: https://github.com/SeloraHomes/ha-selora-ai
- Benchmark Allen de Home Assistant: https://github.com/allenporter/home-assistant-datasets
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Repositorio de modelos del autor (pipeline y prompts): https://gitlab.com/selorahomes/products/selora-ai/models
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a cotizaciones bursatiles de Carrier Global Corporation y no guardan relacion con el modelo.
