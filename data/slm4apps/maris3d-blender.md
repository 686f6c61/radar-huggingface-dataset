# slm4apps/Maris3D-Blender

## Resumen

Maris3D SLM Blender 0.5B es un modelo de lenguaje pequeno (SLM) especializado en la generacion de escenas 3D en Blender a partir de descripciones en lenguaje natural. Lo desarrolla slm4apps y se distribuye como un fine-tune del modelo base Qwen2.5-Coder-0.5B-Instruct, con licencia Apache 2.0 y pesos en formato GGUF para su uso con llama.cpp y Ollama. Su proposito no es la generacion de texto generalista, sino actuar como planificador semantico dentro del ecosistema Maris3D: el modelo describe en palabras que objetos componen una escena, cuantos hay, de que estan hechos y donde se situan, y es el codigo de la aplicacion el que traduce esas palabras a llamadas exactas de la API de Blender.

La propuesta tecnica es deliberadamente minimalista: el modelo nunca escribe numeros ni coordenadas, de modo que todos los calculos de tamano y posicion los realiza el codigo determinista de la aplicacion. Esto reduce el riesgo de alucinacion geometrica y permite que un modelo de solo 494 millones de parametros resuelva una tarea de tool calling estructurada con una calidad utilizable. El paquete se compone de un archivo base de 531 MB y un adaptador LoRA de 23 MB, y funciona de forma completamente offline en CPU de portatil (28,5 tok/s en un procesador de 4 nucleos con 876 MB de memoria, medido con el adaptador 0.2.0).

Es relevante ahora porque demuestra que un SLM de menos de 0,5B puede resolver dominios verticales concretos mediante fine-tuning sobre un formato de salida restringido, sin necesidad de GPU ni de conectividad. El repositorio incluye ademas un modelo experimental entrenado desde cero, Maris3D SLM Blender Tiny 0.02B (24,5 millones de parametros, 50 MB), que sirve como referencia de hasta donde se puede comprimir la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-0.5B-Instruct); el modelo Tiny usa arquitectura Llama de 10 capas y anchura 384 |
| Parametros totales | 494.032.768 (0,5B); Tiny 0.02B: 24,5 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el 0.5B; Tiny 0.02B: 2.048 tokens |
| Tipos de cuantizacion | GGUF Q8_0 (base) y F16 (adaptador LoRA); Tiny en F16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-0.5B-Instruct, un transformer decoder-only de 494 millones de parametros, y se adapta mediante un fine-tune LoRA que se distribuye como adaptador separado en F16 (23 MB) sobre el archivo base en Q8_0 (531 MB). El entrenamiento se orienta a cuatro tareas concretas dentro del ecosistema Maris3D: planificacion de escenas (que objetos, cuantos y donde), diseno de las partes de un objeto nuevo, edicion por palabras (por ejemplo, "haz el banco azul") y conversacion de soporte. La innovacion principal es el formato de salida: el modelo emite exclusivamente palabras y categorias semanticas, y la aplicacion traduce esas etiquetas a llamadas de herramienta de Blender, calculando todos los numeros en codigo. Esto convierte una tarea de generacion de escenas en un problema de clasificacion y planificacion acotado.

El modelo Tiny 0.02B se entreno desde cero en dos etapas: primero con Simple English Wikipedia (`wikimedia/wikipedia`, `20231101.simple`, CC BY-SA 3.0 y GFDL) y despues con los datos de tarea de Maris3D. Usa un vocabulario propio de 17.665 entradas, de las cuales 1.281 son palabras completas de Blender (tamanos, lugares, colores, acabados), y sus pesos finales son la media de tres checkpoints (pasos 5.670, 7.560 y 15.192) seleccionados por puntuacion en la tarea, no por perdida en validacion. No se dispone de informacion sobre el volumen total de tokens de entrenamiento del modelo 0.5B, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de planes de escena en lenguaje natural: identifica objetos, cantidades, materiales y relaciones espaciales relativas a partir de una frase.
- Tool calling estructurado orientado a la API de Blender, mediado por la aplicacion Maris3D, que convierte las palabras del modelo en llamadas exactas.
- Edicion incremental de escenas existentes mediante instrucciones en lenguaje natural ("Make the bench blue", "Move the lamp to the left of the bench").
- Diseno de las partes de un objeto nuevo que cumplen las reglas de la aplicacion.
- Conversacion de soporte y aclaraciones dentro del flujo de la aplicacion (96,1 % de respuestas correctas en 152 turnos, segun el autor).
- Comportamiento sin rechazos por entrenamiento: planifica solicitudes de arte oscuro (armas, gore, atrezo de terror) como cualquier otra, con 0 de 18 rechazos en la prueba del autor.
- Ejecucion completamente offline en CPU, sin GPU ni conexion de red.
- Capacidades multilingues limitadas al ingles.
- No dispone de vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Generacion de escenas 3D en Blender desde una frase: el usuario escribe "a park with a bench, a tree behind the bench and a lamp next to the bench" y la aplicacion construye la escena completa; el modelo aporta la planificacion semantica y el codigo calcula geometria y posiciones.
- Edicion iterativa de escenas en produccion de arte: permite cambiar colores, mover objetos o sustituir materiales conversacionalmente, lo que agiliza iteraciones de blocking en pipelines de game art.
- Creacion de prototipos rapidos de escenarios para videojuegos: con 1.456 descargas y un flujo de instalacion de un solo comando, un equipo puede generar atrezo y distribuciones de escena preliminares sin salir de Blender.
- Asistente offline en estaciones de trabajo sin conectividad: al ejecutarse en CPU con 876 MB de memoria, encaja en portatiles y entornos air-gapped donde no se permite enviar datos a la nube.
- Automatizacion de tareas repetitivas de set dressing: instrucciones en lote como "anade tres arboles alrededor de la casa" se traducen en llamadas de herramienta verificables por la aplicacion.
- Generacion de arte oscuro o de terror sin bloqueos: el modelo no rechaza solicitudes de props violentos o de horror, lo que resulta util en estudios de videojuegos que necesitan ese tipo de contenido.
- Integracion como planificador en agentes de herramienta: el patron de salida en palabras y traduccion a llamadas exactas es replicable en otros dominios con API determinista.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Benchmark | Metrica | Maris3D 0.5B |
|---|---|---|
| Maris3D 180-request benchmark (medido en 0.2.0) | Escena completa correcta (%) | 23,3 |
| Maris3D 180-request benchmark (medido en 0.2.0) | Escena utilizable (%) | 75,0 |

Otras metricas reportadas en la model card:

| Prueba | Resultado |
|---|---|
| Planificacion de objetos correctos en conjuntos held-out | 97,3 % (2.951 de 3.033 objetos en 716 frases) |
| Diseno de partes de un objeto nuevo que pasan las reglas de la app | 99,0 % (1.268 nombres) |
| Respuestas conversacionales correctas | 96,1 % (152 turnos) |
| Turnos sin invencion de datos | 383 turnos |
| Reconstruccion exacta de la escena demo 0.1 | 203 de 204 anadidos exactos (99,5 %) |
| Rechazos en prueba de contenido oscuro | 0 de 18 |

Comparativa interna con el modelo Tiny 0.02B (mismos conjuntos de 150 filas):

| Conjunto | Tiny 0.02B | Maris3D 0.5B (0.2.1) |
|---|---|---|
| Comandos directos: camara, luz, texto, acabado | 97,6 % | 76,1 % |
| Disenos de objeto que pasan todas las comprobaciones | 52,0 % | 31,3 % |

Rendimiento de inferencia declarado: 28,5 tok/s en CPU de portatil de 4 nucleos con 876 MB de memoria (adaptador 0.2.0); el Tiny alcanza unos 590 tok/s de escritura y 7.400 tok/s de lectura de prompt en un Apple M3 con 4 hilos.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el paquete completo (base Q8_0 de 531 MB mas adaptador de 23 MB) ocupa aproximadamente 876 MB de memoria RAM en CPU.
- GPU recomendadas: no disponibles ni necesarias; el modelo esta disenado para inferencia en CPU.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) con holgura, pero no se aprovecha de ella de forma significativa.
- Despliegue: llama.cpp y Ollama (el repositorio incluye un `Modelfile` con la entrada `maris3d-slm-blender-0.5b`), integrado en el add-on de Blender 4.2+ mediante `maris3d serve start`.
- Latencia y throughput: 28,5 tok/s en CPU de 4 nucleos (modelo 0.5B); el Tiny 0.02B alcanza unos 590 tok/s de generacion en Apple M3.
- Requisitos de instalacion: Python 3.9+ y Blender 4.2+.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Maris3D SLM Blender 0.5B | 494 M | No disponible | Tool calling para Blender, offline | Apache 2.0 | GGUF |
| Qwen2.5-Coder-0.5B-Instruct (base) | 494 M | No disponible | Generacion de codigo generalista | Apache 2.0 | Safetensors, GGUF |
| Maris3D SLM Blender Tiny 0.02B | 24,5 M | 2.048 | Misma tarea, modelo desde cero | Apache 2.0 | GGUF |

No se dispone de datos de benchmarks comparativos con otros modelos de proposito general en la informacion proporcionada. La comparacion relevante es interna: frente a su modelo base, Maris3D anade la capacidad de planificacion de escenas y edicion por palabras a costa de perder generalidad; frente al Tiny, el 0.5B es mejor en planes de escena completa y ediciones por palabras, mientras que el Tiny supera al 0.5B en comandos directos y disenos de objeto.

## Limitaciones y advertencias

- El modelo solo habla ingles; no soporta castellano ni otros idiomas.
- No escribe numeros: no puede copiar valores exactos, y la aplicacion debe leerlos del texto de la peticion en codigo.
- La tasa de escena completa correcta es baja (23,3 % en el benchmark de 180 peticiones), aunque la de escena utilizable alcanza el 75 %; no es apto para produccion sin supervision.
- El contexto del modelo Tiny esta limitado a 2.048 tokens; el del 0.5B no se especifica.
- No se han publicado datos sobre sesgos; al ser un fine-tune de Qwen2.5-Coder, hereda los sesgos del modelo base.
- Riesgo de alucinacion en la planificacion semantica: el autor reporta 383 turnos sin invencion en sus pruebas, pero no hay verificacion independiente.
- El modelo esta "uncensored by training": no rechaza solicitudes de contenido violento o de terror, lo que exige control de contenido por parte de la aplicacion en entornos con menores o politicas estrictas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo Tiny incorpora texto de Simple English Wikipedia bajo CC BY-SA 3.0 y GFDL, lo que puede imponer obligaciones de atribucion y compartir igual sobre esa porcion.
- Los benchmarks son declarados por el autor y no estan verificados de forma independiente.
- El modelo esta disenado para funcionar dentro del ecosistema Maris3D; su uso fuera de ese pipeline requiere reimplementar la capa de traduccion de palabras a llamadas de herramienta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/slm4apps/Maris3D-Blender
- Repositorio GitHub: https://github.com/slm4apps/maris3d
- Releases: https://github.com/slm4apps/maris3d/releases
- Licencia: https://github.com/slm4apps/maris3d/blob/main/LICENSE
- Blender: https://www.blender.org
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Dataset de texto del Tiny: https://huggingface.co/datasets/wikimedia/wikipedia
