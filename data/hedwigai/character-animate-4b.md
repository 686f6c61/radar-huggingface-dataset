# hedwigai/character-animate-4b

## Resumen

character-animate-4b es un modelo de lenguaje derivado de Qwen/Qwen3.5-4B mediante ajuste fino supervisado y muestreo por rechazo, desarrollado por hedwigai. Su funcion no es generar animaciones directamente, sino producir programas JSON compactos en un lenguaje de dominio especifico llamado rigctl: dado un enunciado de accion en una frase ("camina unos 4 metros y luego mira a un punto 2,5 m a la derecha"), el modelo emite una secuencia de beats con verbos, argumentos, duraciones y estilo que un compilador externo en Blender transforma en un clip de animacion y valida.

El modelo tiene 4.539.265.536 parametros en bf16 y se distribuye con los pesos ya fusionados (LoRA rank 32, alpha 64, aplicada sobre todas las proyecciones de atencion, atencion lineal y MLP). El repositorio incluye ademas un adaptador `unmerge/` que revierte el modelo a Qwen3.5-4B, lo que permite al servidor de escena cargar un unico motor y usar el adaptador para el modelo conversacional. La licencia es Apache 2.0, igual que la del modelo base.

Su relevancia es la de un caso de uso muy especializado de un LLM pequeno: convertir lenguaje natural en un programa estructurado verificable, con validacion en bucle (compilador y checker en Blender) y un formato de salida restringido por gramatica. No es un modelo de proposito general ni sustituye a un generador de movimiento; sin el compilador y el rig, su salida es solo JSON.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5-4B (atencion estandar y atencion lineal, segun tags del modelo base) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); incluye adaptador LoRA en `unmerge/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B y se ajusta con LoRA de rango 32 y alpha 64 aplicada a todas las proyecciones de atencion, atencion lineal y MLP, que despues se fusiona en los pesos base. El entrenamiento consta de dos fases: primero, ajuste fino supervisado sobre programas escritos para las frases de accion de escenas generadas, donde cada programa se compilaba en Blender y solo se conservaba si pasaba el checker; despues, varias rondas de muestreo por rechazo en las que el modelo generaba varios programas por prompt, el compilador y el checker los puntuaban y los programas validos volvian al conjunto de entrenamiento. Para los prompts sin ningun programa valido se anadieron pistas. La ultima ronda uso una tasa de aprendizaje de 5e-5 durante una epoca.

La innovacion tecnica no esta en el transformer sino en el acoplamiento con un lenguaje de dominio y su gramatica: la decodificacion se restringe con structured outputs de vLLM sobre la gramatica definida en `character/rigctl/compact.py` y `grammar.py`, de modo que la salida siempre es un programa parseable. El modelo tambien puede recibir una linea hablada antes de la accion (por ejemplo, `[s1 I] "Whoa, just a little bit there, okay?"`) y sincronizar gestos y expresiones con las palabras.

## Capacidades

- Generacion de programas JSON en el lenguaje rigctl a partir de una frase de accion, con plan, clip, estilo, beats y keys.
- Verbos de animacion cubiertos en el conjunto de prueba: caminar, correr, girar, mirar, alcanzar, gestos, sentarse, arrodillarse, agacharse, tumbarse y beats posados.
- Control de expresiones faciales mediante claves (blink, smile, brows_up, frown, jaw_open).
- Parametros de estilo: velocidad, cadencia en pasos por minuto, balanceo de cadera, balanceo de brazos y elevacion.
- Sincronizacion de gestos y expresiones con lineas habladas previas a la accion.
- Salida restringida por gramatica, compatible con structured outputs de vLLM.
- No soporta tool calling general, agentes multi-paso ni vision; su unica tarea es la generacion de programas de animacion.
- Capacidades multilingues: no disponible.

## Casos de uso

- Prototipado de escenas animadas en Blender: el modelo traduce una descripcion textual de accion en un programa rigctl que el compilador convierte en un clip, lo que permite iterar sobre bloqueos de animacion sin escribir keyframes a mano.
- Generacion de animaciones para personajes no jugadores en prototipos de videojuego: integrado en un pipeline que compila el JSON y valida el clip, se pueden producir variaciones de caminar, mirar o sentarse a partir de guiones de texto.
- Previsualizacion de direccion de escena: un guionista describe la accion en una frase y obtiene un clip compilado para revisar ritmo y posicionamiento antes de la produccion final.
- Sincronizacion de dialogo y gestos: al recibir una linea hablada antes de la accion, el modelo temporiza gestos y expresiones con las palabras, util para escenas conversacionales con dos personajes.
- Pruebas automatizadas de rigs: el checker en Blender valida equilibrio, inclinacion, pies, autointerseccion, limites articulares y pops; el modelo sirve para generar baterias de programas que ejerciten el rig.
- Educacion y demostraciones de LLM con salida estructurada: ejemplo didactico de ajuste fino con muestreo por rechazo y decodificacion restringida por gramatica sobre un modelo de 4B.
- Servicio de escena en vivo: el modelo impulsa a los dos personajes de la escena interactiva en app.hedwigai.com/try/live-scene, con el adaptador `unmerge/` para el modelo conversacional.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de prueba de 196 prompts de accion (caminar, correr, girar, mirar, alcanzar, gestos, sentarse, arrodillarse, agacharse, tumbarse y beats posados), medidos sobre su propio rig:

| Metrica | Valor |
|---|---|
| Prompts cuyo programa hace lo pedido | 0,99 |
| Programas que compilan | 1,00 |
| Clips que pasan todas las comprobaciones (equilibrio, inclinacion, pies, autointerseccion, limites articulares, pops) | 1,00 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores son especificas del rig del autor y no son transferibles sin mapear los nombres de control (`torso`, `hand_ik.L`, `f_index.02.L`, etc.) a los huesos de otro rig.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9 GB solo para pesos (4,54 mil millones de parametros a 2 bytes), mas overhead de contexto y KV cache; el repositorio ocupa 9,4 GB.
- En cuantizacion de 8 bits cabria en torno a 5 GB de pesos; en 4 bits, en torno a 2,5-3 GB. No se han publicado cuantizaciones oficiales.
- GPU recomendadas: A100 o H100 para servicio con vLLM y structured outputs; RTX 4090 (24 GB) para inferencia en bf16 con margen amplio.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en bf16 (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090); en 8 GB requeriria cuantizacion.
- Opciones de despliegue: vLLM con structured outputs (el usado por el autor para muestrear y puntuar), transformers con PEFT para el adaptador `unmerge/`, y llama.cpp u Ollama si se generan cuantizaciones GGUF (no publicadas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| character-animate-4b | 4,54 B | no disponible | Texto a programa de animacion rigctl | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | 4 B (clase) | no disponible | Proposito general, texto | Apache 2.0 | Hugging Face |
| Alternativas especializadas en texto a animacion | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con otros modelos de la misma categoria no esta disponible en la informacion proporcionada. El unico referente claro es el modelo base Qwen3.5-4B, del que este se diferencia por el ajuste fino, la fusion de LoRA y la salida restringida a un lenguaje de dominio.

## Limitaciones y advertencias

- Escribe programas, no movimiento: sin el compilador y un rig, la salida es solo JSON inutilizable.
- Conoce un unico cuerpo: la linea de cuerpo del prompt puede cambiarse, pero el entrenamiento uso los numeros de un cuerpo concreto (1,79 m de altura, ojos a 1,69 m, hombros a 1,40 m, cintura a 1,10 m, brazo de 0,50 m, pierna de 0,99 m).
- Los nombres de control del programa pertenecen al rig del autor, que no se publica; otro rig requiere mapear esos nombres a sus propios huesos.
- Mueve un personaje a la vez; el codigo de escena decide donde se situa cada uno y a quien mira.
- Las metricas de 0,99 y 1,00 son sobre el conjunto de prueba y el rig del autor, no garantizan el mismo rendimiento en otros rigs o dominios de accion.
- Riesgo de alucinacion en el sentido de programas sintacticamente validos pero fisicamente inesperados; el checker de Blender mitiga parte del problema, no lo elimina.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: no disponibles; el prompt de sistema de entrenamiento esta en ingles.
- Licencia Apache 2.0, permisiva para uso comercial, heredada del modelo base; conviene revisar las licencias de las dependencias (Blender GPL, MPFB GPL 3, MakeHuman CC0) si se redistribuyen assets.
- Para produccion, la salida debe pasar siempre por el compilador y el checker; no debe consumirse JSON sin validar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hedwigai/character-animate-4b
- Demo de escena en vivo: https://app.hedwigai.com/try/live-scene
- Codigo del servidor de escena: https://github.com/un-seen/character-scene
- Modelo base: https://huggingface.co/Qwen
- MPFB (MakeHuman for Blender): https://static.makehumancommunity.org/mpfb.html
- MakeHuman: https://www.makehumancommunity.org/
- Blender: https://www.blender.org/
- PyTorch: https://pytorch.org/
- Transformers: https://github.com/huggingface/transformers
- PEFT: https://github.com/huggingface/peft
- vLLM: https://github.com/vllm-project/vllm
- flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- three.js: https://threejs.org/
