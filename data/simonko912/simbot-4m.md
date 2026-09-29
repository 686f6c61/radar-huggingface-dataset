# simonko912/simbot-4m

## Resumen

simbot-4m es una red neuronal de reinforcement learning desarrollada por el usuario simonko912 que actúa como jugador autónomo de Minecraft. No es un modelo de lenguaje: es una política de control entrenada por RL cuyo objetivo es sobrevivir y combatir dentro del juego. La entrada es un vector de 731 características que codifica bloques del entorno, entidades cercanas, posición, último alimento consumido y nivel de salud, entre otras señales; la salida son 66 acciones discretas (comer, atacar, mirar, moverse, etc.).

El modelo es deliberadamente pequeño: una red densa feed-forward de 4 capas con 4.155.970 parámetros (aproximadamente 4,16 millones), lo que lo sitúa en el extremo opuesto a los grandes transformers multimodales. Su relevancia es la de un caso de estudio reproducible de RL aplicado a entornos abiertos y parcialmente observables, con un sistema de recompensas explícito y un conjunto de limitaciones documentadas por el propio autor.

El repositorio se publica bajo licencia Apache 2.0, con el código de entrenamiento anunciado pero todavía no liberado, y cuenta con una demo pública en un servidor de Minecraft de terceros. En el momento de la consulta el modelo acumula 0 descargas y 0 likes en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feed-forward (MLP) densa de 4 capas |
| Parametros totales | 4.155.970 (aprox. 4,16 millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es un vector fijo de 731 caracteristicas por paso de decision |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | en (etiqueta del repositorio); el modelo no procesa lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |
| Dimension de entrada | 731 (bloques, entidades, posicion, ultimo alimento, salud y otras senales) |
| Dimension de salida | 66 acciones discretas (comer, luchar, mirar, moverse, etc.) |
| Capas ocultas | 2048, 1024 y 512 neuronas |
| Tarea (pipeline) | reinforcement-learning |
| Tamano del repositorio | 2,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un perceptron multicapa puro, sin recurrencia ni mecanismos de atencion: 731 entradas, tres capas ocultas de 2048, 1024 y 512 neuronas, y 66 salidas que representan la accion a ejecutar. La suma de pesos de las cuatro matrices (731x2048, 2048x1024, 1024x512 y 512x66) mas los sesgos de las capas ocultas y de salida coincide con los 4.155.970 parametros declarados por el autor, lo que confirma que no hay componentes ocultos adicionales. Al carecer de estado interno explicito, el agente solo dispone de la observacion actual, lo que explica la limitacion de "olvidar cosas" reconocida en la model card.

El entrenamiento es por refuerzo, con un sistema de recompensas disenado a mano. Se recompensa comer, infligir dano a un enemigo y agacharse cerca de jugadores (esta ultima, segun el autor, solo por diversion). Se penaliza recibir dano, morir, quedarse atrapado en un bucle, permanecer estancado en una zona y hacer clic sobre nada. No se documenta en la informacion disponible el numero de pasos de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas adicionales como PPO, DQN o evolucion, pese a que la etiqueta "Evolution" aparece en los tags del repositorio. El codigo de entrenamiento esta anunciado como "proximamente publico", por lo que los detalles del algoritmo no son verificables por terceros.

## Capacidades

- Control de agente en Minecraft mediante 66 acciones discretas (movimiento, ataque, mirada, consumo de objetos, entre otras).
- Gestion de la supervivencia basica: come cuando el nivel de hambre es bajo.
- Uso de objetos de curacion: consume manzanas doradas cuando la salud es baja.
- Toma de decisiones tacticas rudimentarias: alterna entre huir y luchar en funcion del espacio libre disponible y del numero de enemigos.
- Combate: es capaz de derrotar enemigos del juego.
- Comportamiento social emergente: se agacha cerca de jugadores, presumiblemente como comportamiento reforzado sin utilidad funcional.
- No dispone de tool calling, function calling, soporte multiagente explicito, capacidades multilingues ni modos de razonamiento tipo thinking. Es un controlador de juego, no un asistente conversacional ni un modelo de proposito general.

## Casos de uso

- Bot de compania en servidores de Minecraft: puede desplegarse como jugador no humano persistente que deambula, come, se cura y combate mobs, aligerando la carga de los administradores en servidores publicos. Su ventana de observacion fija y su tamano minimo permiten ejecutarlo de forma continua sin coste apreciable de computo.
- Banco de pruebas de diseno de recompensas en RL: dado que el sistema de recompensas esta documentado de forma explicita (recompensas por comer, danar y agacharse; penalizaciones por morir, atascarse o clicar al vacio), sirve como caso de estudio para analizar como un diseno de recompensa concreto produce comportamientos concretos y efectos colaterales no deseados.
- Linea base de referencia para investigacion en entornos abiertos: con solo 4,16 millones de parametros, cualquier agente nuevo puede compararse contra el en igualdad de condiciones de computo, lo que resulta util para medir la ganancia real de arquitecturas mas complejas.
- Simulacion de NPC hostil o neutral en mapas personalizados: integrado mediante el cliente del juego, puede actuar como un enemigo que ataca, huye o se cura segun su estado interno, aportando variedad a escenarios de prueba sin necesidad de scripting manual.
- Generacion de datos de interaccion para aprendizaje por imitacion: las trazas de un agente que ya completa ciclos de comer, curarse y combatir pueden registrarse y reutilizarse como datos de comportamiento para entrenar modelos mayores.
- Pruebas de estres y de rendimiento de servidores: un cliente automatizado que se mueve, ataca y consume objetos permite generar carga repetible sobre un servidor de Minecraft para medir latencia y estabilidad.
- Material didactico de RL aplicado: por su reducido tamano (aproximadamente 17 MB en fp32) y su naturaleza autocontenida, es adecuado para cursos o talleres donde se explique el ciclo observacion-accion-recompensa en un entorno no abstracto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe capacidades de forma cualitativa ("puede vencer enemigos", "a veces huye, a veces lucha") sin cifras de recompensa media, tasa de supervivencia, pasos por episodio ni comparaciones cuantitativas. La imagen incluida en la model card apunta a una curva de entrenamiento, pero no se proporcionan sus valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula. Con 4.155.970 parametros, los pesos ocupan aproximadamente 16,6 MB en fp32, unos 8,3 MB en fp16 y unos 4,2 MB en int8.
- GPU recomendadas: no requiere GPU. La inferencia es viable en CPU convencional; una GPU integrada o dedicada de gama baja (por ejemplo, una RX 5700 como la del propio autor) es mas que suficiente.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo e incluso en placas integradas y dispositivos tipo Raspberry Pi. El cuello de botella real no es el modelo, sino el cliente de Minecraft y el renderizado del entorno.
- Opciones de despliegue: no aplican los servidores de inferencia habituales (vLLM, TGI, llama.cpp, Ollama), ya que el modelo no es un transformer de texto ni se distribuye en formato GGUF. El despliegue se realiza integrando la red en un cliente o modulo de Minecraft; la model card menciona que la demo publica corre en el servidor mc.nico.re.
- Latencia y throughput estimados: no disponibles de forma publicada. Por el tamano de la red, el coste de una propagacion hacia delante es despreciable frente al coste por tick del propio juego, pero el autor no aporta mediciones.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. Los unicos modelos de la misma categoria son otros agentes de aprendizaje por refuerzo para Minecraft (por ejemplo, los enfoques de comportamiento por imitacion y los agentes basados en modelos del mundo), pero no se han facilitado sus parametros, contexto, licencia ni resultados, por lo que no procede establecer comparaciones numericas.

| Modelo | Enfoque | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| simbot-4m | RL con MLP feed-forward sobre caracteristicas del entorno | 4.155.970 | Apache 2.0 | Pesos publicados; codigo de entrenamiento pendiente |
| Otros agentes RL para Minecraft | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Colisiones contra paredes: el autor reconoce que el agente "choca aleatoriamente contra muros", sintoma tipico de una politica sin memoria ni mapa interno.
- Perdida de informacion entre pasos: la ausencia de recurrencia hace que el agente "olvide cosas"; no mantiene estado de eventos pasados mas alla de lo codificado en el vector de 731 caracteres de entrada.
- Seleccion de arma incorrecta: en ocasiones combate con objetos aleatorios en lugar de con espadas.
- Sistema de recompensa con incentivos discutibles: recompensar el agacharse cerca de jugadores sin funcion util puede inducir comportamientos espurios que no aportan valor al juego.
- Riesgo de bucles y de estancamiento: el propio diseno de recompensas penaliza estas conductas, lo que indica que aparecen con frecuencia durante el entrenamiento.
- Optimizacion local de recompensa: al ser un sistema de recompensas definido a mano, es probable que el agente explote atajos que maximizan la recompensa sin cumplir el objetivo pretendido.
- Idioma: la etiqueta del repositorio es unicamente "en", aunque el modelo no procesa lenguaje, por lo que esta etiqueta resulta poco informativa.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero al no estar publicado el codigo de entrenamiento no puede reproducirse el proceso de entrenamiento ni auditarse el pipeline completo.
- Ausencia de benchmarks: no hay cifras verificables de rendimiento, de modo que cualquier afirmacion sobre su calidad relativa carece de respaldo cuantitativo.
- Coherencia del repositorio: el repositorio ocupa 2,4 GB mientras que los pesos de la red en fp32 ocuparian aproximadamente 16,6 MB, por lo que con toda probabilidad incluye artefactos adicionales (checkpoints, registros de entrenamiento u otros ficheros) no descritos en la model card. Esta observacion es una inferencia a partir del tamano declarado, no un dato confirmado por el autor.
- Fecha de creacion inusual: la ficha de HuggingFace indica fechas de creacion y actualizacion en septiembre de 2026, dato que no se puede verificar con la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/simonko912/simbot-4m
- Perfil del autor en HuggingFace: https://huggingface.co/simonko912
- Perfil del autor en Ollama: https://ollama.com/simonko912
- Visualizador de arquitectura (referencia al autor, otro modelo): https://hfviewer.com/simonko912/pikadiffusion
- Perfil del autor en GitHub: https://github.com/Simonko-912
- Servidor de demostracion publica: mc.nico.re (mencionado en la model card, sin enlace web directo)
- Codigo de entrenamiento: anunciado como proximamente publico, sin repositorio disponible en el momento de la consulta
