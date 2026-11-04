# loafecho/yugioh-kashtira-qwen2.5-0.5b-lora

## Resumen

`loafecho/yugioh-kashtira-qwen2.5-0.5b-lora` es un adaptador LoRA de rango 16 (unos 35 MB) que convierte el modelo base Qwen2.5-0.5B-Instruct en un agente de duelo de Yu-Gi-Oh. Lo desarrolla el usuario de HuggingFace loafecho y esta disenado para jugar el mazo Kashtira dentro del motor de codigo abierto EDOPro / ygopro-core. No es un modelo entrenado desde cero, sino un ajuste fino sobre el modelo de Qwen.

El modelo resuelve un problema muy acotado: tomar una descripcion textual del tablero publico (puntos de vida, mano, campo, cementerios y resumenes de cartas) junto con una lista de movimientos legales etiquetados con letras, y seleccionar la mejor opcion puntuando el siguiente token. La jugada elegida es la letra con mayor logit, siempre de forma codiciosa, sin muestreo ni busqueda.

Es relevante como ejemplo de aplicacion de modelos de lenguaje pequenos a entornos de juego con acciones discretas y como caso de estudio de imitation learning y DAgger sobre un bot scriptado (WindBot). Es el hermano pequeno de `loafecho/yugioh-kashtira-qwen2.5-1.5b-lora`, con un tercio del tamano y un rendimiento comparable contra WindBot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16) sobre transformer decoder-only (Qwen2.5-0.5B-Instruct) |
| Parametros totales | no disponible (adaptador de ~35 MB; el modelo base tiene 0.5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only. La innovacion no esta en la arquitectura sino en el pipeline de entrenamiento: en cada decision, el motor escribe los movimientos legales como una lista con letras (A, B, C...) bajo una descripcion textual del tablero publico, y el modelo puntua el siguiente token; la letra con mayor puntuacion es la jugada. Todo el entrenamiento se ejecuto en una unica RTX 3060 de 12 GB, con el motor en una maquina separada solo con CPU.

El proceso tuvo tres fases: primero imitation learning supervisado sobre las jugadas que hace WindBot (el bot scriptado del motor) al pilotar Kashtira; despues DAgger en dos rondas, en las que el modelo jugo sus propias partidas, WindBot etiqueto las posiciones alcanzadas y esas correcciones se anadieron al conjunto de entrenamiento (la segunda ronda uso 300 partidas y cubrio el 99,4% de las posiciones alcanzadas); por ultimo, un control de cambios con puerta: cada cambio debia superar al mejor modelo hasta la fecha en una evaluacion fija con reglas definidas de antemano. El adaptador final proviene de la fase de imitacion; una etapa de RL con PPO (con una funcion de recompensa cuyas propiedades se demostraron en Lean 4) nunca supero su punto de partida y no produjo este adaptador. Se entreno tambien una cabeza de valor separada (AUC 0,90 prediciendo el ganador) que no forma parte del adaptador.

## Capacidades

- Seleccion de jugadas en Yu-Gi-Oh: dado un tablero descrito en texto y una lista de movimientos legales, elige la siguiente accion puntuando logits de letras.
- Juego del mazo Kashtira en el motor EDOPro / ygopro-core.
- Evaluacion codiciosa (greedy), sin muestreo ni busqueda.
- No soporta tool calling ni function calling.
- No esta disenado para agentes genericos ni razonamiento multi-paso fuera del bucle de decision del motor.
- Capacidades multilingues: no disponible (no se documentan).
- Capacidad especial: prediccion del ganador mediante una cabeza de valor separada (AUC 0,90), que no forma parte de este adaptador.

## Casos de uso

- Investigacion en imitation learning y DAgger: el adaptador sirve como referencia reproducible de como un modelo de 0.5B aprende a imitar a un bot scriptado en un entorno de acciones discretas, con metricas de cobertura de posiciones (99,4% en la segunda ronda).
- Benchmark de agentes en juegos de cartas: permite comparar el rendimiento de un SLM contra WindBot en un mazo concreto (Kashtira) y medir la brecha frente al techo del profesor (0,773 contra el pool de entrenamiento).
- Estudio de generalizacion a mazos no vistos: util para analizar la caida de rendimiento (0,417 en mazos nunca entrenados frente a 0,672 en el pool), relevante en investigacion sobre robustez.
- Prototipado de agentes de juego en entornos con acciones discretas: el patron de "describir tablero + listar opciones + puntuar letras" es reutilizable en otros juegos de turnos.
- Docencia y divulgacion: ejemplo compacto (35 MB de adaptador, entrenado en una RTX 3060) para explicar pipelines de RL/IL en IA de juegos.
- Comparacion de escalado: junto al hermano de 1.5B, permite estudiar el efecto del tamano del modelo base en una tarea de imitacion acotada.

## Benchmarks y rendimiento

Resultados con seleccion codiciosa e intervalos de Wilson al 95%. Un empate cuenta como derrota.

| Oponente | Tasa de victoria | Partidas |
|---|---|---|
| WindBot (Cyber Dragon) | 0,934 [0,909, 0,953] | 500 |
| WindBot, 5 mazos del pool de entrenamiento (agregado) | 0,672 [0,630, 0,712] | 500 |
| WindBot, 3 mazos nunca entrenados (agregado) | 0,417 [0,362, 0,473] | 300 |

Desglose por mazo del pool: Dragunity 0,92, Blackwing 0,91, Zoodiac 0,56, Thunder Dragon 0,53, Trickstar 0,44. Mazos no vistos: Sky Striker 0,77, Ryzeal 0,25, Swordsoul 0,23. Cero errores del motor en las 1.300 partidas. El techo lo marca WindBot jugando este mismo mazo Kashtira: 0,773 [0,723, 0,817] contra el pool de entrenamiento, de modo que el modelo alcanza aproximadamente el 87% de su profesor.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa unos 35 MB; el modelo base de 0.5B es muy ligero y cabe holgadamente en GPU de consumo.
- GPU recomendadas: RTX 3060 de 12 GB (la usada para entrenar); cualquier GPU con al menos unos pocos GB de VRAM para inferencia del modelo base.
- Cabe en GPU de consumo: si, el modelo base de 0.5B es apto para GPUs de gama media y baja.
- Opciones de despliegue: transformers + peft (segun la model card); no se documentan otras opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Requiere el runner del juego (`github.com/loafecho/ygo-duel-agent`), un runner en Rust sobre ygopro-core mas el worker de entrenamiento en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Notas |
|---|---|---|---|---|---|
| yugioh-kashtira-qwen2.5-0.5b-lora (este) | 0.5B base + LoRA r16 | no disponible | 0,934 vs WindBot Cyber Dragon; 0,672 vs pool; 0,417 vs mazos no vistos | Apache 2.0 | 500 partidas por evaluacion |
| yugioh-kashtira-qwen2.5-1.5b-lora | 1.5B base + LoRA | no disponible | 0,936 vs WindBot; 0,610 vs otros mazos (300 partidas) | no disponible | Hermano mayor, un tercio mas grande |
| WindBot (Kashtira) | bot scriptado | no aplica | 0,773 vs pool de entrenamiento | no disponible | Techo del profesor |

## Limitaciones y advertencias

- Un solo mazo: solo juega Kashtira y solo ha visto oponentes estilo WindBot; es mucho mas debil contra mazos no entrenados (0,417 agregado, con casos de 0,23-0,25).
- Nivel WindBot: aprendio copiando un bot scriptado, no es un jugador de nivel humano y las metricas lo miden contra ese bot.
- Necesita el runner del juego: los prompts provienen del runner de duelos y el harness de entrenamiento de `github.com/loafecho/ygo-duel-agent`; el adaptador no puede jugar por si solo.
- Sin datos de cartas: los nombres y textos de cartas pertenecen a Konami; el repositorio solo contiene pesos y una descripcion.
- Riesgo de alucinacion en el sentido de seleccion suboptima de jugadas fuera de la distribucion de entrenamiento; el modelo no genera texto libre sino que puntua opciones.
- Licencia Apache 2.0 para los pesos del adaptador, pero el uso de nombres y textos de cartas de Yu-Gi-Oh queda sujeto a los derechos de Konami.
- Sin datos publicados sobre sesgos, idiomas o cuantizacion; no se documentan resultados fuera del entorno EDOPro / ygopro-core.

## Enlaces

- HuggingFace: https://huggingface.co/loafecho/yugioh-kashtira-qwen2.5-0.5b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Hermano mayor: https://huggingface.co/loafecho/yugioh-kashtira-qwen2.5-1.5b-lora
- Runner y harness de entrenamiento: https://github.com/loafecho/ygo-duel-agent
