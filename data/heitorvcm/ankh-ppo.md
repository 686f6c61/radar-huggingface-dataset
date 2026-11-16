# heitorvcm/ankh-ppo

## Resumen

Ankh-ppo es un agente de aprendizaje por refuerzo entrenado para jugar al juego de mesa *Ankh: Gods of Egypt* (CMON) con entre 2 y 5 jugadores. Lo desarrolla `heitorvcm` como proyecto de aficionado, sin vinculacion con la editorial ni con los disenadores del juego. El modelo resuelve el problema de tomar decisiones secuenciales con informacion oculta y acciones legalmente restringidas sobre un entorno de reglas reimplementado en Python a partir del reglamento publico. Es relevante como ejemplo de aplicacion de `MaskablePPO` (sb3-contrib) a juegos de mesa con multiples asientos y mecanicas complejas como fusion de dioses, subastas y combate pendiente.

Tecnicamente no es un modelo de lenguaje: es una politica neuronal `MlpPolicy` con arquitectura de red `[512, 512]`, entrenada con `MaskablePPO` mediante self-play durante 40 rondas y aproximadamente 16 millones de pasos. La observacion es un vector de 6786 floats en el rango [0, 1] codificado siempre desde el punto de vista del asiento que decide, y el espacio de acciones es discreto con 332 acciones posibles, enmascaradas en cada decision. Una unica red sirve para partidas de 2, 3, 4 y 5 jugadores.

El checkpoint publicado (`round_0040.zip`) solo es util en combinacion con el codigo del entorno (`ankh_game.py`, `ankh_map.py`, `ankh_obs.py`), que vive en el mismo repositorio, y no carga con versiones distintas del codificador. El autor documenta explicitamente que los resultados son debiles como medida de fuerza absoluta y que no se ha evaluado contra jugadores humanos ni contra una linea base independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (`MlpPolicy`) con `net_arch` `[512, 512]`, entrenada con `MaskablePPO` (sb3-contrib) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observacion fija de 6786 floats por decision |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, pt (documentacion y model card) |
| Licencia | MIT |
| Formato de pesos | checkpoint `.zip` de Stable-Baselines3 (contiene pickle de Python) |

## Arquitectura y entrenamiento

La politica es una red neuronal multicapa (MLP) con dos capas ocultas de 512 unidades, implementada en PyTorch 2.15 y gestionada por Stable-Baselines3 2.9.2 sobre Gymnasium 1.4.0. La observacion es un vector de 6786 floats normalizados en [0, 1], siempre codificado desde la perspectiva del asiento que decide: el propio asiento mas hasta cuatro oponentes, con relleno de ceros cuando hay menos jugadores. El codificador nunca lee informacion oculta de terceros (cartas de batalla pendientes ni pujas de Plaga). El espacio de acciones es discreto con 332 acciones y se aplica una mascara de acciones en cada decision, imprescindible para que el modelo funcione.

El entrenamiento se realizo mediante self-play en cuatro escenarios (`basic_2p` a `basic_5p`), con los cinco dioses (Amun, Anubis, Isis, Osiris y Ra), asiento y dioses aleatorios en cada partida y fusion de dioses activa con 3 o mas jugadores. Los oponentes fueron primero aleatorios y despues instantaneas del propio modelo (aproximadamente 50% de la instantanea mas reciente, el resto mayoritariamente recientes con algunas antiguas). La funcion de recompensa combina terminos terminales (+1 por victoria, −1/(P−1) por derrota, −1 si todos los dioses se olvidan) con terminos densos pequenos: +0.02 por paso de Devocion ganado, −0.01 por paso medio del oponente, +0.005 por guerrero anadido y −0.0025 por cambio medio del oponente. La fusion de dioses no otorga ni resta recompensa. Hiperparametros: `n_steps=128`, `n_epochs=4`, `gamma=0.995`, `gae_lambda=0.95`, `ent_coef=0.01`, `learning_rate=3e-4` y batch de `n_steps * n_envs / 4`. El computo se repartio entre workers de CPU para las reglas y GPU para inferencia y actualizaciones: 40 rondas de 400k pasos, aproximadamente 445 minutos en total.

## Capacidades

- Juego del juego de mesa *Ankh: Gods of Egypt* con 2, 3, 4 y 5 jugadores usando una unica red neuronal.
- Toma de decisiones con mascara de acciones: solo selecciona acciones legalmente validas en cada estado.
- Manejo de informacion oculta: el codificador respeta la informacion a la que cada asiento tiene derecho.
- Self-play como mecanismo de entrenamiento: el modelo puede servir como oponente de si mismo para evaluacion o continuacion del entrenamiento.
- Gestion de mecanicas especificas del juego: fusion de dioses con 3 o mas jugadores, desbloqueo de poderes Ankh, Devocion y movilizacion de guerreros.
- Servidor local de juego (`jogar.py`) para partidas interactivas en el navegador, sin salida de datos de la maquina.
- Herramienta de replay textual (`replay.py`) para depuracion de partidas completas.
- Idiomas de documentacion: ingles y portugues.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para juegos de mesa: el modelo y el entorno de reglas permiten estudiar `MaskablePPO` en escenarios con acciones restringidas e informacion oculta, reutilizando el codigo como base de experimentos.
- Educacion y docencia: el servidor local `jogar.py` permite jugar contra la IA en el navegador para ilustrar conceptos de RL, mascaras de acciones y self-play en un contexto ludico.
- Desarrollo de agentes para juegos con multiples asientos: la codificacion de observacion desde la perspectiva del asiento decisor y el relleno para hasta cuatro oponentes sirven de patron para otros juegos multijugador.
- Evaluacion de tecnicas de self-play: el esquema de oponentes por instantaneas (snapshots) del propio modelo puede reutilizarse para comparar estrategias de curriculum de oponentes.
- Depuracion y analisis de partidas: `replay.py` genera replays textuales completos con informacion oculta, utiles para auditar el comportamiento del agente y detectar sesgos de asiento.
- Base para entrenamiento continuado: el checkpoint y el entorno permiten reanudar o extender el entrenamiento con nuevas rondas, escenarios o funciones de recompensa.
- Prototipado de bots para juegos de mesa con reglas reimplementadas: el codigo de reglas (`ankh_game.py`, `ankh_map.py`) puede adaptarse como entorno de referencia para otros agentes.

## Benchmarks y rendimiento

Los datos provienen del log de entrenamiento de la ultima ronda (4348 partidas contra la instantanea oponente de esa ronda); la probabilidad por azar se calcula como 1/P.

| Jugadores | Partidas | Tasa de victoria del agente | Azar (1/P) |
|---|---|---|---|
| 2 | 1052 | 57% | 50% |
| 3 | 1081 | 48% | 33% |
| 4 | 1123 | 30% | 25% |
| 5 | 1092 | 24% | 20% |

En conjunto, 39% frente a aproximadamente 32% esperado por azar con esta mezcla de numeros de jugadores. Contra su instantanea anterior en el paso de evaluacion (160 partidas, agente determinista frente a oponente con muestreo) gano el 54%. La tasa de victoria en entrenamiento se mantiene plana en torno a 39-46% desde la ronda 29, sin signos claros de mejora continuada. No hay evaluacion contra jugadores humanos ni contra una linea base independiente, y la evaluacion contra oponentes aleatorios no se registro en esta ejecucion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una MLP con dos capas de 512 unidades y observacion de 6786 floats, el checkpoint es pequeno (repositorio de 0.1 GB) y la inferencia en CPU es viable (el ejemplo de la model card carga con `device="cpu"`).
- GPU recomendadas: no disponible; el entrenamiento uso GPU para inferencia y actualizaciones, pero no se especifica el modelo concreto.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU consumer, dado el tamano reducido de la red; no se aportan mediciones.
- Opciones de despliegue: Stable-Baselines3 con `MaskablePPO.load` (requiere `sb3-contrib`), servidor local `jogar.py` y herramienta `replay.py`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia generica de categoria, existen otros agentes de RL para juegos de mesa entrenados con PPO o MaskablePPO en repositorios de Hugging Face, pero no se aportan datos verificables de parametros, contexto, rendimiento o licencia para establecer una comparativa fiable.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| heitorvcm/ankh-ppo | no disponible | no aplica | 39% global en self-play | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados son debiles como medida de fuerza absoluta: solo se evaluo contra copias anteriores del mismo modelo, sin jugadores humanos ni linea base independiente.
- La tasa de victoria en entrenamiento esta plana desde la ronda 29 (39-46%), lo que sugiere estancamiento del aprendizaje.
- Fuertes efectos de asiento: en partidas de 2 jugadores gana 85% como asiento 0 y 27% como asiento 1; con 4 jugadores el asiento 0 gana 60% y los demas 17-22%; con 5 jugadores el asiento 0 es el peor (12%). La causa es desconocida.
- En dos replays inspeccionados el agente uso poco la accion *Move Figures* (8-12% de las acciones) y eligio *Unlock Ankh Power* como "pase" una vez desbloqueados todos los poderes (permitido por las reglas).
- Los poderes de nivel 3/2 Glorious, Magnanimous y Obelisk Attuned nunca fueron desbloqueados por el agente ni por sus oponentes.
- Estar en fusion de dioses ocurrio en 40% de las partidas de 3 o mas jugadores (frente a 52% esperado para un asiento aleatorio), sin indicios de que el agente busque la fusion; es una estadistica de una sola ejecucion, no una garantia.
- Varias interpretaciones de reglas son suposiciones del autor (ver `README_projeto_pt.md`); la fidelidad del modelo depende de esa implementacion.
- Los escenarios fueron transcritos a mano y no estan verificados contra el libro oficial de escenarios.
- El checkpoint solo funciona con el codificador y las reglas del mismo repositorio; instantaneas de otras versiones del codificador no cargan.
- Riesgo de seguridad: los checkpoints de Stable-Baselines3 son archivos zip que usan pickle de Python; solo deben cargarse desde fuentes de confianza.
- La licencia MIT permite uso comercial del codigo, pero el proyecto es de aficionado y no esta afiliado a CMON ni a los disenadores del juego; el uso comercial de material derivado del juego puede estar sujeto a derechos de terceros.
- No se han documentado sesgos eticos ni de idioma mas alla de la documentacion en ingles y portugues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/heitorvcm/ankh-ppo
- Checkpoint: https://huggingface.co/heitorvcm/ankh-ppo/blob/main/round_0040.zip
- Codigo de reglas y mapa: `ankh_game.py`, `ankh_map.py` (incluidos en el repositorio)
- Codificador de observacion: `ankh_obs.py` (incluido en el repositorio)
- Servidor local de juego: `jogar.py` (incluido en el repositorio)
- Herramienta de replay: `replay.py` (incluido en el repositorio)
- Notas sobre interpretacion de reglas: `README_projeto_pt.md` (incluido en el repositorio)
- sb3-contrib (MaskablePPO): https://github.com/Stable-Baselines3/stable-baselines3-contrib
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
