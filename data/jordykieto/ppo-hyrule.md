# jordykieto/ppo-hyrule

## Resumen

`jordykieto/ppo-hyrule` es una coleccion de politicas y modelos auxiliares entrenados para jugar a *The Legend of Zelda: Ocarina of Time* bajo un emulador Dolphin sin modificar. No es un modelo de lenguaje: es un artefacto de aprendizaje por refuerzo (reinforcement learning) compuesto por checkpoints de PyTorch que implementan un actor-critico recurrente con factorizacion por entidades, junto con modelos de imitacion, un encoder de prediccion enmascarada y un world model en espacio de observacion. El agente no procesa pixeles: lee directamente la memoria del emulador y recibe un vector de 1.033 numeros con posicion, velocidad, salud y rutina de animacion decodificada de cada actor.

El trabajo aborda dos tareas. La primera, un combate cuerpo a cuerpo contra tres enemigos (Deku Babas), esta resuelta: la politica `deku-baba-g150.pt` limpia 10 de 10 estados iniciales sin muertes. La segunda, el jefe del primer dungeon (Queen Gohma), no esta resuelta: la mejor politica (`gohma-kl-v15.pt`) alcanza un 8,33% de exito en 456 episodios emparejados, con una salud media restante de 3,53 sobre 10. El autor documenta explicitamente los resultados negativos y publica un audit de afirmaciones retiradas.

La relevancia del artefacto es metodologica mas que de rendimiento: expone con detalle por que el policy gradient supera a cuatro alternativas medidas en condiciones equivalentes, y publica checkpoints fallidos (clonacion de comportamiento, world model) como evidencia de los problemas de error compuesto y de planificacion en horizontes largos. El coste total del proyecto se cifra en 1.381 USD y 509,6 millones de pasos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-critico recurrente con factorizacion por entidades (politica); encoder de prediccion enmascarada (SJEPA); world model en espacio de observacion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (observacion de 1.033 numeros en v7, 483 en v4; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en precision de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch, `torch.load` con `weights_only=False`) |
| Tamano del repositorio | 0,2 GB |
| Version de observacion | v7 (1.033 dimensiones, 108 acciones) para Gohma; v4 (483 dimensiones, 63 acciones) para melee |
| Entorno | Dolphin emulator sin modificar, lectura de memoria del proceso |

## Arquitectura y entrenamiento

La politica principal es un actor-critico recurrente cuya observacion se factoriza por entidades: cada actor del juego aporta un conjunto de caracteristicas (posicion, velocidad, salud, rutina de animacion decodificada) que se procesan de forma estructurada en lugar de como un vector plano. El espacio de acciones discretas es de 108 opciones para la tarea de Gohma y 63 para el combate melee. El entrenamiento usa PPO (policy gradient) y el autor compara cuatro alternativas bajo condiciones emparejadas, todas ellas inferiores: clonacion de comportamiento estratificada por eventos (`bc-human-100-strat.pt`, clonada de 100 victorias humanas), clonacion de comportamiento condicionada por retorno (`rvs-m5.pt`, sin policy gradient), un encoder de prediccion enmascarada tipo SJEPA (`sjepa-p1.pt`) y un world model en espacio de observacion (`wm-obs-epoch120.pt`).

El coste computacional esta desglosado: la politica melee resuelta costo 51 USD y 4 h 52 m para 41,8 millones de pasos; el conjunto del proyecto, 1.381 USD y 509,6 millones de pasos. El autor publica los checkpoints fallidos como resultados negativos: el world model, al barajar la accion, cambia sus predicciones por un factor de 1,00 en el horizonte evaluado, lo que lo hace inutil para planificacion; el mejor clon de comportamiento alcanza un 74,5% de precision en la siguiente accion en held-out pero solo inflige 0,33 de dano y gana 1 de 80 episodios, evidenciando el problema de error compuesto a un horizonte de 154 segundos.

## Capacidades

- Juego de combate en *Ocarina of Time* bajo Dolphin: politica melee que resuelve un encuentro de tres enemigos (10 de 10 estados iniciales, 0 muertes).
- Politica de jefe (Queen Gohma): 8,33% de exito en 456 episodios emparejados, con gran varianza segun el estado inicial (del 28,95% al 0% en 76 intentos).
- Percepcion basada en memoria del emulador: lectura de posicion, velocidad, salud y rutina de animacion de cada actor, sin procesamiento de pixeles.
- Modelado de mundo en espacio de observacion (checkpoint disponible, pero publicado como resultado negativo no planificable).
- Encoder de representacion enmascarada sobre el estado crudo de 363 campos (`sjepa-p1.pt`), con evaluacion en 10 sondas congeladas.
- Clonacion de comportamiento a partir de demostraciones humanas (100 victorias grabadas).
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingues ni modos de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Investigacion en reinforcement learning sobre videojuegos: el artefacto sirve como referencia reproducible de un pipeline PPO completo con lectura de memoria de emulador, util para estudiar por que el policy gradient supera a la imitacion en tareas de control con recompensa escasa.
- Estudio de recompensas enmascaradas: el analisis de Gohma documenta que 678 de 678 eventos de dano requieren un aturdimiento y que el flag de vulnerabilidad del motor solo se activa en 9 de 678 casos, un caso practico de diseno de funciones de recompensa.
- Analisis de error compuesto en imitacion: los checkpoints de clonacion de comportamiento permiten reproducir el fallo de un clon con 74,5% de precision que solo gana 1 de 80 episodios a horizonte de 154 segundos.
- Evaluacion de world models: `wm-obs-epoch120.pt` se publica como control negativo para medir si un modelo de mundo permite planificacion (no lo permite: factor 1,00 al barajar acciones).
- Docencia en RL aplicado: el repositorio incluye entorno, manifiesto de savestates y tracker de recompensas, lo que permite reproducir experimentos con `scripts/play.py`.
- Auditoria de metodologia cientifica: el paper incorpora un audit de afirmaciones que separa resultados medidos de inferidos y lista once afirmaciones retiradas internamente, util como plantilla de rigor en publicaciones de ML.

## Benchmarks y rendimiento

| Metrica | Melee (Deku Babas) | Queen Gohma |
|---|---|---|
| Politica evaluada | `deku-baba-g150.pt` | `gohma-kl-v15.pt` |
| Exito | 10 de 10 estados iniciales, 0 muertes | 8,33% de 456 episodios emparejados |
| Salud restante del jefe | no aplica | 3,53 de 10 |
| Varianza por estado inicial | no aplica | 28,95% a 0% (0 de 76) |
| Coste de entrenamiento | 51 USD, 4 h 52 m, 41,8 M pasos | parte de 1.381 USD y 509,6 M pasos |

Resultados de modelos alternativos (tarea Gohma):

| Modelo | Metodo | Resultado |
|---|---|---|
| `bc-human-100-strat.pt` | Clonacion de comportamiento estratificada | 0,53 de dano sobre 10 de salud |
| `rvs-m5.pt` | Clonacion condicionada por retorno | 1,76 de dano, 8 derrotas en 240 episodios |
| `sjepa-p1.pt` | Encoder de prediccion enmascarada | supera a control sin entrenar en 9 de 10 sondas (una semilla) |
| `wm-obs-epoch120.pt` | World model en espacio de observacion | no planificable (factor 1,00 al barajar acciones) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio pesa 0,2 GB y los checkpoints se cargan en CPU con `torch.load(..., map_location="cpu")`.
- GPU recomendadas: no especificadas; la inferencia de una politica de este tamano es viable en CPU y en cualquier GPU consumer con soporte PyTorch.
- Cabe en GPU consumer: si, sin datos concretos de VRAM por checkpoint.
- Opciones de despliegue: PyTorch nativo; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplica a modelos de RL).
- Latencia y throughput: no disponibles. La ejecucion en tiempo real requiere el emulador Dolphin y, en macOS, un interprete con firma de codigo para adjuntarse a la memoria del proceso; en Linux no es necesario.

## Comparativa con modelos similares

| Modelo | Categoria | Entorno | Resultado | Licencia |
|---|---|---|---|---|
| `jordykieto/ppo-hyrule` | RL sobre emulador con lectura de memoria | Ocarina of Time (Dolphin) | Melee resuelto; Gohma 8,33% | no disponible |
| `bc-human-100-strat.pt` (mismo repo) | Imitacion | Ocarina of Time | 0,53 de dano | no disponible |
| `rvs-m5.pt` (mismo repo) | Imitacion condicionada por retorno | Ocarina of Time | 1,76 de dano, 8 derrotas en 240 | no disponible |
| Agentes de pixel (p. ej. enfoques tipo DQN sobre Atari) | RL end-to-end desde pixeles | Multiples juegos | no comparable directamente | variable |

No se dispone de datos de benchmarks comparables con otros agentes de *Ocarina of Time* en la informacion proporcionada; el autor no cita lineas base externas.

## Limitaciones y advertencias

- No hay afirmacion de generalizacion: los cuatro estados iniciales excluidos del entrenamiento estan todos a media salud y a mas de 368 unidades, por lo que "held out" es colineal con "lejos" y no existe comparacion emparejada.
- La tarea principal (Queen Gohma) no esta resuelta: 8,33% de exito con alta dependencia del estado inicial (del 28,95% al 0%).
- `sjepa-p1.pt` se entrena con una sola semilla y su propio objetivo de entrenamiento pierde frente a un control trivial, aunque las sondas congeladas superen las suyas; son conclusiones distintas.
- `wm-obs-epoch120.pt` se publica como resultado negativo: no permite planificacion.
- Los modelos de imitacion se incluyen por haber fallado: el mejor clon alcanza 74,5% de precision en la siguiente accion pero solo gana 1 de 80 episodios por error compuesto a 154 segundos.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- El agente depende de la lectura de memoria del emulador y de savestates concretos; no es portable a otras versiones del juego ni a otros emuladores sin reentrenamiento.
- En macOS, adjuntarse a la memoria del emulador requiere un interprete con firma de codigo.
- Riesgo de sobreinterpretacion: el autor advierte que el audit del paper separa afirmaciones medidas de inferidas y lista once afirmaciones retiradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jordykieto/ppo-hyrule
- Codigo, paper, audit de afirmaciones y procedencia: https://github.com/JordyKieto/ppo-hyrule
- Video del combate completo contra Queen Gohma: https://youtu.be/FBD1wEsdY3E
- Video de Deku Babas sin editar: https://youtu.be/fMMvd1HmMjI
