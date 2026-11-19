# BashirEmran/d3-lite-body-a4

## Resumen

d3-lite-body-a4 es un ajuste fino (fine-tuning) del modelo Qwen3.5-0.8B, desarrollado por BashirEmran, orientado especificamente a la toma de decisiones en entornos de function calling. El modelo parte de una mezcla (soup) previa denominada "d3-lite" y se entrena con un LoRA de rango 16 sobre conversaciones publicas de function calling, con el objetivo de decidir tres cosas: si hay que invocar una funcion a continuacion, cual de las funciones disponibles hay que llamar y que argumentos obligatorios requiere esa llamada.

La relevancia de este modelo es acotada pero clara: en lugar de intentar ser un modelo generalista, se especializa en el subproblema de enrutamiento y validacion de llamadas a herramientas, algo que en pipelines de agentes suele resolverse con heuristicas fragiles o con modelos mucho mas grandes. Al tener 852.985.920 parametros, es viable ejecutarlo en hardware modesto y como componente interno de un sistema mayor.

No obstante, la informacion publicada es muy escasa: la model card se limita a describir el proceso de entrenamiento, sin detallar composicion del dataset, idiomas soportados, resultados de evaluacion ni formato de despliegue. Cualquier uso en produccion deberia ir precedido de una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B; tag `qwen3_5` con `custom_code`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 1.7 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-0.8B, un transformer denso de aproximadamente 853 millones de parametros. El autor no documenta cambios estructurales sobre la base; la intervencion consiste en un ajuste fino supervisado. El entrenamiento se realizo con un LoRA de rango 16 durante una epoca, con optimizador AdamW, tasa de aprendizaje 1e-4 y scheduler lineal, y posteriormente el adaptador se fusiono (merge) en los pesos del modelo, de modo que el checkpoint publicado es un modelo denso estandar sin adaptadores separados.

Los datos de entrenamiento son conversaciones publicas de function calling reformuladas como tareas de decision: determinar si procede una llamada adicional, seleccionar cual de las funciones disponibles corresponde y rellenar los argumentos obligatorios. Ademas, se incorporo un anclaje KL (KL anchor) contra las respuestas del modelo soup de partida, una tecnica de regularizacion que penaliza la divergencia respecto a la distribucion original para mitigar el olvido catastrofico en un ajuste fino de una sola epoca. No se especifican el volumen de tokens, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Decision de function calling: determina si el siguiente paso requiere invocar una herramienta o responder directamente.
- Seleccion de funcion: elige, entre un conjunto de funciones disponibles, cual es la adecuada para la peticion del usuario.
- Extraccion de argumentos: identifica y rellena los argumentos obligatorios de la llamada seleccionada.
- Generacion de texto base: conserva las capacidades del Qwen3.5-0.8B subyacente, aunque el ajuste esta orientado a la tarea de decision.
- Soporte multilingue: no documentado; depende del modelo base y de los datos de ajuste, no disponibles.
- Modo thinking, vision o audio: no disponible en la informacion publicada.
- Razonamiento multi-paso y agentes: no documentado de forma explicita; el entrenamiento se centra en decisiones puntuales de llamada.

## Casos de uso

- Enrutador de herramientas en agentes: colocado delante de un LLM mayor, decide si la peticion requiere una llamada a funcion y cual, reduciendo coste y latencia frente a consultar el modelo grande en cada turno.
- Validacion de argumentos en pipelines: comprueba que los argumentos obligatorios de una llamada estan presentes antes de ejecutarla, evitando errores en tiempo de ejecucion contra APIs externas.
- Orquestacion de asistentes de atencion al cliente: clasifica la intencion del usuario y dirige la conversacion hacia la funcion adecuada (consulta de pedido, cambio de direccion, devolucion) dentro de un flujo multi-turno.
- Automatizacion de back-office: decide entre acciones como crear ticket, consultar estado o escalar a un humano, con bajo coste por ser un modelo de menos de mil millones de parametros.
- Componente de evaluacion de agentes: al ser pequeno y rapido, sirve como linea base reproducible para medir la calidad de decisiones de function calling en pruebas internas.
- Despliegue en el borde o en local: su tamano permite ejecutarlo en una GPU de consumo o incluso en CPU para tareas de clasificacion de llamadas de baja latencia.
- Filtro previo en sistemas RAG con herramientas: decide si la consulta necesita recuperacion documental o una llamada a API antes de lanzar el pipeline completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 1,7 GB para los pesos, mas overhead de activaciones y cache KV; en la practica, 3-4 GB suele ser suficiente para contextos moderados.
- VRAM estimada en int8: en torno a 1 GB de pesos; en int4, aproximadamente 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4). Para mayor throughput, A10G, L4 o A100.
- GPU de consumo: si, cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y similares; tambien es viable en CPU para cargas bajas.
- Opciones de despliegue: el repo usa `custom_code` con la arquitectura `qwen3_5`, por lo que requiere `trust_remote_code=True` en Transformers. No se publican pesos GGUF, de modo que llama.cpp u Ollama requeririan conversion previa. vLLM y TGI son opciones si la arquitectura esta soportada en la version correspondiente.
- Latencia y throughput: no disponibles en la informacion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-lite-body-a4 | 852.985.920 | no disponible | Function calling (decision) | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B (base) | ~0,8B | no disponible | Modelo generalista | Apache 2.0 | Hugging Face |
| Alternativas especializadas en function calling de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con el modelo base Qwen3.5-0.8B, del que hereda arquitectura y licencia; la diferencia es el ajuste fino para decisiones de llamada a funciones, sin datos publicos de mejora cuantificada.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay benchmarks, ni comparativas cuantitativas con el modelo base, lo que impide estimar la mejora real del ajuste.
- Dataset de entrenamiento no documentado: se desconoce el volumen, la procedencia exacta y la cobertura de idiomas y dominios, con el consiguiente riesgo de sesgos no identificados.
- Riesgo de sobreajuste a la tarea: un ajuste de una sola epoca con LoRA rango 16 sobre una tarea estrecha puede degradar capacidades generales del modelo base; el anclaje KL mitiga pero no elimina este riesgo.
- Alucinacion de argumentos: al entrenarse para rellenar argumentos obligatorios, puede inventar valores cuando la informacion no esta en la conversacion.
- Idiomas no declarados: no se garantiza un comportamiento correcto fuera del ingles, idioma probable de las conversaciones publicas de function calling.
- Contexto no especificado: se desconoce la ventana efectiva; no debe asumirse la del modelo base sin verificacion.
- Dependencia de `custom_code`: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar antes de desplegar.
- Licencia Apache 2.0: permite uso comercial, pero no exime de responsabilidad sobre el comportamiento del modelo en produccion.
- Modelo sin adopcion (0 descargas, 0 likes): no hay evidencia de uso en comunidad ni de mantenimiento posterior.

## Enlaces

- Hugging Face: https://huggingface.co/BashirEmran/d3-lite-body-a4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
