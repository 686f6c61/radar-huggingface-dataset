# OmniJev/PlayJev-0.8B

## Resumen

PlayJev-0.8B es un modelo multimodal de tipo image-text-to-text desarrollado por OmniJev, especializado en jugar a diez juegos pequenos de navegador (Space Invaders, Racer, Sokoban, Snake, Pacman, Infinite Mario, Tetris, Floppy Bird, Breakout y 2048). Se trata de un ajuste fino supervisado sobre Qwen/Qwen3.5-0.8B-Base, con un recuento real de 1.107.265.600 parametros segun los metadatos de safetensors, aunque el autor lo denomina comercialmente como 0,8B. El modelo no genera texto libre: recibe un fotograma y una lista de movimientos candidatos, y devuelve en una unica pasada hacia delante la distribucion de probabilidad sobre las letras de esas opciones.

La relevancia del modelo esta en su enfoque de decision: no hay muestreo ni generacion autoregresiva, sino un argmax sobre el token posterior a `Answer:`. Los movimientos se barajan en cada muestra de entrenamiento, de modo que la posicion en la lista no aporta informacion. Cuando la velocidad es relevante, la torre de vision procesa tambien el fotograma anterior sin coste adicional de tokens. El autor reporta 43 ms por movimiento en la demo.

El entrenamiento combina clonado de comportamiento (behaviour cloning) con rondas de DAgger, una tecnica de imitation learning que corrige la deriva de la politica aprendida consultando al profesor en los estados que el propio modelo visita. El resultado medio frente al profesor es de 0,53 en la metrica normalizada (0 = juego aleatorio, 1,00 = profesor), con tres juegos resueltos practicamente al nivel del profesor (Space Invaders, Racer y Sokoban con 1,00).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.5-0.8B-Base, con torre de vision que puede procesar fotograma actual y anterior |
| Parametros totales | 1.107.265.600 (segun safetensors); la nomenclatura del autor indica 0,8B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se han publicado versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card no documenta capacidades linguisticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B-Base, un transformer multimodal con torre de vision. PlayJev lo adapta a un espacio de decision cerrado: la entrada es una imagen y una lista de opciones, y la salida es una unica distribucion softmax sobre las letras que etiquetan esas opciones en la posicion del token siguiente a `Answer:`. No hay decodificacion autoregresiva ni muestreo. El autor usa un prompt congelado denominado OpenJev, y la model card especifica que el modelo nunca ve el nombre del juego, solo el fotograma y los movimientos disponibles.

El entrenamiento sigue una receta de imitation learning en dos fases: primero clonado de comportamiento y despues rondas de DAgger, con el profesor ejecutando los mismos seeds en el mismo harness de evaluacion. La model card muestra que el clonado y la primera ronda de DAgger (barras claras) quedan por debajo de la version publicada (barra oscura). Dos detalles de diseno destacan: los movimientos se barajan en cada muestra para eliminar el sesgo posicional, y la torre de vision puede recibir el fotograma previo cuando la velocidad es relevante sin incrementar el numero de tokens. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Decision multimodal en una sola pasada: dada una imagen y una lista de movimientos, devuelve una probabilidad por movimiento, el movimiento elegido (`d.choice`), la distribucion completa (`d.probs`) y una medida de confianza (`d.confidence`).
- Juego de diez titulos distintos con un unico prompt congelado, sin acceso al nombre del juego ni a informacion especifica del entorno.
- Percepcion de velocidad mediante la incorporacion del fotograma anterior en la torre de vision.
- Politica determinista por argmax, con distribucion de probabilidad interpretable y trazable paso a paso.
- No documentado: tool calling, function calling, razonamiento multi-paso, uso como agente con herramientas, thinking mode, audio, generacion de texto libre o traduccion.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Agente jugador embebido en el navegador: la demo oficial ejecuta el modelo en diez juegos con un coste declarado de 43 ms por movimiento, lo que permite interactuar en tiempo real sin infraestructura de servidor compleja.
- Investigacion en imitation learning y DAgger: el modelo sirve como caso de estudio reproducible de como el clonado de comportamiento y las rondas de DAgger mejoran la politica, con un harness de evaluacion sobre seeds fijos y 16 episodios reservados por juego.
- Inicializacion de politicas para aprendizaje por refuerzo: al alcanzar un 0,53 medio frente al profesor y 1,00 en Space Invaders, Racer y Sokoban, la politica preentrenada puede actuar como punto de partida en lugar de una inicializacion aleatoria.
- Evaluacion comparativa de agentes visuales: el protocolo (argmax, episodios limitados a 1500 pasos, mismos seeds para aleatorio, modelo y profesor) permite comparar otras politicas bajo condiciones identicas.
- Generacion y etiquetado de trayectorias de juego: el modelo puede usarse para producir episodios completos con sus decisiones y niveles de confianza, utiles como datos de entrenamiento o para analisis posteriores.
- Analisis de calibracion y confianza: al exponer `confidence` en cada paso, permite estudiar donde la politica se degrada, lo que es directamente aplicable en investigacion sobre incertidumbre en agentes visuales.
- Prototipado de agentes con observaciones visuales puras: sirve de plantilla para conectar una torre de vision de un modelo pequeno a un espacio de acciones discreto, sin necesidad de generar lenguaje.
- Demostraciones educativas: la galeria publica permite mostrar el comportamiento de una politica multimodal entrenada por imitacion en entornos controlados y de coste computacional bajo.

## Benchmarks y rendimiento

Evaluacion del autor: 16 episodios reservados por juego, movimiento por argmax, episodios limitados a 1500 pasos. La metrica "vs profesor" se calcula como (modelo - aleatorio) / (profesor - aleatorio), de modo que 0 equivale a juego aleatorio y 1,00 al profesor.

| Juego | Aleatorio | PlayJev | Profesor | vs profesor |
|---|---:|---:|---:|---:|
| Space Invaders | 215 | 400 | 400 | 1,00 |
| Racer | 238 | 6707 | 6712 | 1,00 |
| Sokoban | 6,6 | 102,1 | 102,2 | 1,00 |
| Snake | 1,0 | 89,5 | 114 | 0,79 |
| Pacman | 113 | 3702 | 7026 | 0,52 |
| Infinite Mario | 613 | 1764 | 4229 | 0,32 |
| Tetris | 162 | 4718 | 15288 | 0,30 |
| Floppy Bird | 0,0 | 13,8 | 84,0 | 0,16 |
| Breakout | 496 | 2712 | 16547 | 0,14 |
| 2048 | 1021 | 3386 | 19593 | 0,13 |
| Media | | | | 0,53 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. El autor tampoco documenta ablaciones por juego mas alla de la comparacion cualitativa entre clonado, primera ronda de DAgger y la version publicada.

## Requisitos de hardware

- VRAM estimada para inferencia: no confirmada por el autor. Como referencia basada en el recuento real de parametros (1,107 mil millones) y el tamano del repositorio (2,2 GB), los pesos en precision de 16 bits ocupan aproximadamente 2,2 GB, por lo que la inferencia completa con activaciones de vision y cache de prompt cabe holgadamente por debajo de 6 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas de VRAM deberia ser suficiente para los pesos en 16 bits; una RTX 3060 de 12 GB, RTX 4070, RTX 4090 o superiores no deberian presentar problemas. A100 y H100 son sobredimensionadas para este tamano salvo que se busque throughput masivo o servir la demo a muchos usuarios.
- Cabe en GPU consumer: si, con margen amplio, segun la estimacion anterior. No se dispone de confirmacion oficial del fabricante ni tabla de compatibilidad publicada.
- Opciones de despliegue: la via documentada es la libreria transformers junto con el codigo propio del autor (`playjev.model.PlayJevModel` desde el repositorio de GitHub). vLLM, TGI, llama.cpp y Ollama no estan documentados ni se han publicado conversiones GGUF, por lo que su uso requeriria trabajo adicional y no esta garantizado para esta arquitectura de decision.
- Latencia y throughput estimados: el autor declara 43 ms por movimiento en la demo, sin especificar el hardware empleado. No hay datos publicados de throughput en lote ni de tokens por segundo.

## Comparativa con modelos similares

En la informacion proporcionada no se han encontrado otros modelos comparables de la misma categoria (agentes multimodales que juegan a juegos pequenos mediante imitation learning con DAgger). La comparativa se limita al modelo base del que deriva.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OmniJev/PlayJev-0.8B | 1.107.265.600 | no disponible | image-text-to-text aplicado a decision en 10 juegos | apache-2.0 | HuggingFace y GitHub |
| Qwen/Qwen3.5-0.8B-Base | no disponible (denominacion 0,8B) | no disponible | modelo base multimodal de proposito general | no disponible | HuggingFace |
| Otros agentes multimodales de juego | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no es un asistente conversacional: esta entrenado para devolver un unico token de respuesta con la letra de un movimiento. No se debe esperar generacion de texto, razonamiento explicito ni respuestas a preguntas abiertas.
- El dominio de aplicacion esta acotado a los diez juegos del entrenamiento. El rendimiento fuera de ese conjunto, o en variantes graficas de esos mismos juegos, no esta documentado y es previsiblemente bajo.
- Brecha respecto al profesor muy desigual: tres juegos alcanzan 1,00, pero Breakout (0,14) y 2048 (0,13) quedan muy lejos. La media de 0,53 oculta una varianza alta entre entornos.
- Riesgo de alucinacion: no aplica en el sentido habitual de generacion de texto, pero si existe el riesgo de sobreconfianza, es decir, una distribucion de probabilidad con picos altos en estados ambiguos. El modelo expone `confidence`, pero el autor no publica analisis de calibracion.
- Sesgos y limitaciones de idioma: no disponibles. La model card no documenta sesgos conocidos ni cobertura linguistica, ya que el modelo no produce lenguaje.
- Licencia apache-2.0, permisiva para uso comercial, aunque se debe verificar por separado la licencia del modelo base Qwen/Qwen3.5-0.8B-Base, que no se detalla en la informacion proporcionada.
- Estado del repositorio: cero descargas y un unico "like" en la fecha de consulta, con fecha de creacion y ultima actualizacion del 19 de septiembre de 2026. No hay historial de mantenimiento ni comunidad que valide el resultado.
- El despliegue depende de codigo propio del autor (`playjev.model.PlayJevModel`) y de un prompt congelado (OpenJev). No se garantiza compatibilidad con el pipeline estandar de transformers ni con servidores de inferencia genericos.
- Discrepancia de nomenclatura: el nombre del modelo indica 0,8B, mientras que los safetensors contienen 1.107.265.600 parametros. Conviene usar el dato real para planificar recursos.
- No hay datos publicados sobre comportamiento en produccion, estabilidad a largo plazo, limites de contexto ni rendimiento bajo cuantizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OmniJev/PlayJev-0.8B
- Repositorio de codigo: https://github.com/OmniJev/PlayJev
- Galeria y demo interactiva: https://omnijev.github.io/PlayJev/#gallery
- Demo por juego: https://omnijev.github.io/PlayJev/?game=invaders
- Demo por juego: https://omnijev.github.io/PlayJev/?game=racer
- Demo por juego: https://omnijev.github.io/PlayJev/?game=sokoban
- Demo por juego: https://omnijev.github.io/PlayJev/?game=snake
- Demo por juego: https://omnijev.github.io/PlayJev/?game=pacman
- Demo por juego: https://omnijev.github.io/PlayJev/?game=mario
- Demo por juego: https://omnijev.github.io/PlayJev/?game=tetris
- Demo por juego: https://omnijev.github.io/PlayJev/?game=flappy
- Demo por juego: https://omnijev.github.io/PlayJev/?game=breakout
- Demo por juego: https://omnijev.github.io/PlayJev/?game=2048
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Paper o publicacion tecnica: no disponible
- Resultados de la busqueda web: no se han encontrado fuentes relevantes sobre este modelo; los resultados devueltos correspondian a paginas de soporte de Microsoft sin relacion con el modelo.
