# binhpham/reachy-mini-motion-planner-4b

## Resumen
reachy-mini-motion-planner-4b es un planificador de movimiento texto-a-movimiento desarrollado por el usuario binhpham para el robot Reachy Mini de Pollen Robotics. El modelo no genera codigo ni prosa general: recibe una instruccion breve ("sneezing. You build up and then sneeze loudly.") y devuelve una "receta" de movimiento y una lista de movimientos grabados (`moves`) que el robot puede reproducir directamente, ya proyectados sobre su espacio alcanzable.

Tecnicamente se distribuye como un paquete completo de servicio con tres piezas: un planificador basado en Qwen/Qwen3.5-4B afinado con LoRA (r = 32, fusionado) que escribe las recetas, un generador de movimiento de tipo flow-matching de 21,8 millones de parametros que convierte el plan en una trayectoria de 9 grados de libertad a 25 Hz, y un fichero `serve.json` con la configuracion de servicio optimizada (FP8, borradores MTP, 32 pasos de difusion, expansion de plan a 2 Hz).

Su relevancia es practica: cubre el ultimo tramo que suele faltar en robotica open source, el paso de "descripcion en lenguaje natural" a "trayectoria ejecutable en hardware real". Con unos 12 GB de memoria de GPU y una latencia mediana de 0,38 s por prompt en una RTX PRO 6000, es 2,5 veces mas rapido que la variante de 27B del mismo autor y esta pensado para desplegarse como el nivel `effort: "low"` de un servicio que ofrezca ambos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Planificador: transformer basado en Qwen/Qwen3.5-4B con LoRA (r = 32) fusionado y cabeza MTP para decodificacion especulativa. Generador: transformer de flow-matching de 21,8 M de parametros |
| Parametros totales | Planner: aproximadamente 4 000 millones (segun nombre del repo y modelo base). Generador: 21,8 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 en la configuracion de servicio (`serve.json`); no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (planner) y `generator.pt` (PyTorch) |

## Arquitectura y entrenamiento
El planificador parte de Qwen/Qwen3.5-4B y se afina con LoRA de rango 32 aplicado a todas las capas lineales, con la perdida calculada unicamente sobre la respuesta. De la informacion disponible se desprende que el checkpoint publicado lleva el adaptador ya fusionado, y que se conserva la cabeza MTP del modelo base para decodificacion especulativa, lo que explica parte del ahorro de latencia. El segundo componente, `generator.pt`, es un transformer de flow-matching de 21,8 M de parametros entrenado exclusivamente con movimiento real de Reachy Mini, encargado de traducir la receta a una secuencia de 9 grados de libertad a 25 Hz.

Los datos de entrenamiento suman 5 872 filas de profesor: recetas escritas a mano con Claude, eventos de "build-up/release" triplicados, 287 semillas y 5 000 escenarios generados con Astra y reescritos en estilo vivo por Codex (gpt-6-astra). Cada prompt se entrena tambien como palabra suelta y como frase aislada, lo que permite que el modelo responda tanto a "sneezing" como a una descripcion con contexto. Se aplico un filtro de similitud por embeddings mas una lista negra de palabras clave para eliminar filas proximas a los prompts de evaluacion. El conjunto de datos esta publicado como binhpham/reachy-mini-massive-motion-library.

## Capacidades
- Generacion de recetas de movimiento: produce un objeto `{"idea", "recipe"}` a partir de un prompt corto, con pensamiento desactivado.
- Text-to-motion para un robot concreto: la salida son diccionarios de movimiento de Reachy Mini (`{"time", "set_target_data": [{"head": 4x4, "antennas", "body_yaw"}]}`) ya proyectados sobre el conjunto alcanzable del robot.
- Cobertura de 9 grados de libertad: cabeza (plataforma Stewart de 6 grados), dos antenas y guinada de la base.
- Eventos fisicos con direccionalidad: modela fases de acumulacion y liberacion (por ejemplo, estornudo que libera hacia abajo), con 21 de 24 respuestas correctas en la direccion de liberacion del estornudo.
- Planificacion multi-paso: expansion del plan a 2 Hz sobre una trayectoria generada a 25 Hz.
- Eficiencia de servicio: decodificacion especulativa mediante la cabeza MTP, con mediana de 0,38 s por prompt en una RTX PRO 6000 (0,32 s atribuidos al planificador).
- Seleccion de esfuerzo por peticion: el mismo servicio puede alojar las variantes de 4B y 27B y elegir una u otra con el campo `effort`.
- Generacion de multiples muestras por prompt mediante el parametro `n`.

## Casos de uso
- Animacion de comportamiento expresivo en Reachy Mini: un desarrollador envia "startled. A door slams." y obtiene una trayectoria de cabeza, antenas y base lista para ejecutar, sin escribir cinematica a mano.
- Investigacion en interaccion persona-robot: permite producir estimulos de movimiento variados y reproducibles para experimentos de percepcion, dado que cada prompt admite `n` muestras y la salida esta acotada al espacio alcanzable real.
- Prototipado rapido de comportamientos para demos: al ser la variante `effort: "low"` de un servicio con dos niveles, sirve para iterar ideas de animacion rapidamente antes de pasar al modelo de 27B.
- Generacion de bibliotecas de movimiento sinteticas: con prompts masivos se pueden poblar bancos de animaciones etiquetadas por evento (bostezar, asentir, inclinarse) para posterior analisis o entrenamiento.
- Educacion y talleres de robotica: el paquete se sirve con un comando unico y una llamada HTTP, lo que reduce la barrera de entrada para estudiantes que quieran conectar lenguaje natural con movimiento.
- Integracion en aplicaciones web o de escritorio para Reachy Mini: como la salida es un diccionario de movimientos compatible con el SDK del robot, encaja en flujos que envian la respuesta del modelo directamente al cliente.
- Control por voz en instalaciones interactivas: encadenado a un sistema de reconocimiento de habla, el modelo convierte ordenes habladas en gestos coherentes para exhibiciones o espacios publicos.

## Benchmarks y rendimiento
Resultados publicados por el autor, sobre prompts no vistos en entrenamiento y 12 muestras por sonda:

| Prueba | Resultado |
|---|---|
| Sondas fisicas fuera de distribucion (estornudo libera hacia abajo, nino somnoliento se desploma y se recupera, ...) | 0,91 |
| Sondas de habilidad (asentir, inclinarse, mirar hacia arriba, ...) | 0,875 |
| Acuerdo de plan con recetas docentes retenidas (r medio) | 0,69 |
| Identificacion entre 12 clips reales de Pollen retenidos, top-1 / rango medio (azar: 8 % / 6,5) | 32 % / 3,82 |
| Direccion de liberacion correcta en "sneezing" | 21/24 |
| Latencia mediana por prompt (RTX PRO 6000, FP8 + MTP) | 0,38 s (planificador 0,32 s) |

No se han publicado resultados de benchmarks estandar de lenguaje (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es coherente con el proposito especializado del modelo.

## Requisitos de hardware
- VRAM estimada: aproximadamente 12 GB de memoria de GPU para el servicio completo segun el autor.
- GPU de referencia en las pruebas: RTX PRO 6000, con FP8 y borradores MTP activados.
- Encaje en GPU de consumo: no se confirma en la informacion disponible; 12 GB de VRAM queda por encima de una RTX 3060 de 12 GB solo en el limite teorico y dentro del rango de una RTX 4070 Ti Super, RTX 4080 o RTX 4090, aunque el autor no valida ninguna de estas configuraciones.
- Despliegue: el paquete se sirve con `python -m inference.server --bundle binhpham/reachy-mini-motion-planner-4b` desde el proyecto reachy-motion-generator, y expone un endpoint HTTP `/generate`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 0,38 s de mediana por prompt en la configuracion de referencia; el calculo asociado al planificador es de 0,32 s.
- Coexistencia: es posible cargar en un mismo proceso y una misma GPU las variantes de 4B y 27B compartiendo el generador, seleccionando una u otra por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| reachy-mini-motion-planner-4b | ~4 000 M (planner) + 21,8 M (generador) | no disponible | 0,38 s de mediana por prompt; 0,91 en sondas fisicas fuera de distribucion | Apache 2.0 | HuggingFace, endpoints compatibles |
| reachy-mini-motion-planner-27b | ~27 000 M (planner) + 21,8 M (generador) | no disponible | 2,5 veces mas lento que la variante de 4B segun el autor | no disponible | HuggingFace |
| Qwen/Qwen3.5-4B (modelo base) | ~4 000 M | no disponible | No orientado a planificacion de movimiento; carece de la gramatica de recetas y de la proyeccion sobre el espacio alcanzable | no disponible | HuggingFace |

No se dispone de modelos alternativos de planificacion de movimiento especificos para Reachy Mini en la informacion proporcionada.

## Limitaciones y advertencias
- Especializacion estrecha: el modelo no es un asistente general; su salida util es la gramatica de recetas y movimientos, y su calidad fuera de ese formato no esta documentada.
- Idiomas no declarados: la model card no especifica idiomas soportados. El autor recomienda el patron `palabra. una frase de contexto.`, y los ejemplos estan en ingles, por lo que el comportamiento en castellano no esta verificado.
- Longitud de contexto no disponible: no se publica la ventana de contexto efectiva, lo que impide dimensionar conversaciones largas o prompts extensos.
- Riesgo de alucinacion en el plan: aunque la salida se proyecta sobre el conjunto alcanzable del robot, el contenido semantico de la receta (direccion, fases, intensidad) puede ser incorrecto; el propio autor reporta 21 de 24 aciertos en la direccion de liberacion de un estornudo, es decir, no es perfecto.
- Rendimiento de identificacion limitado: el top-1 entre 12 clips reales retenidos es del 32 % frente a un 8 % de azar, lo que indica capacidad discriminativa real pero lejos de ser fiable.
- Dependencia del generador: el planner no produce movimiento por si solo; requiere `generator.pt` y el resto del paquete para dar una trayectoria utilizable.
- Servicio acoplado al proyecto de origen: el comando de arranque remite a `inference.server` del proyecto reachy-motion-generator, que no se enlaza en la model card.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-4B y de los datos de entrenamiento publicados.
- Datos generados sinteticamente: buena parte del corpus de profesor procede de Claude, Astra y Codex (gpt-6-astra), con los sesgos y estilos que esos generadores puedan introducir.
- Traccion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/binhpham/reachy-mini-motion-planner-4b
- Variante de 27B: https://huggingface.co/binhpham/reachy-mini-motion-planner-27b
- Dataset de entrenamiento (reachy-mini-massive-motion-library): https://huggingface.co/datasets/binhpham/reachy-mini-massive-motion-library
- Demo en el navegador (Space reachy-mini-motion-generator): https://huggingface.co/spaces/binhpham/reachy-mini-motion-generator
- Reachy Mini, robot de Pollen Robotics: https://pollen-robotics.com/reachy-mini/
- Blog de presentacion de Reachy Mini en Hugging Face: https://huggingface.co/blog/reachy-mini
- Space oficial de Reachy Mini: https://huggingface.co/spaces/pollen-robotics/Reachy_Mini
- SDK de Reachy Mini en GitHub: https://github.com/pollen-robotics/reachy_mini
- Especificaciones de hardware, STL y BOM de Reachy Mini: https://orobot.io/o/program/BROKER-2/reachy-mini
