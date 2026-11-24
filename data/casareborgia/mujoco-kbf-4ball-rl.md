# casareborgia/mujoco-kbf-4ball-rl

## Resumen

`mujoco-kbf-4ball-rl` es un proyecto de investigación en aprendizaje por refuerzo aplicado al billar coreano de 4 bolas (modalidad carom, reglas KBF), desarrollado por el autor independiente casareborgia. No se trata de un modelo de lenguaje, sino de un conjunto de políticas entrenadas para seleccionar tiros en un simulador de billar, comparando tres aproximaciones sobre el mismo entorno: una política SAC (Soft Actor-Critic) que emite un tiro directamente, una red "mapa de puntuación" que evalúa 1.256 tiros candidatos sin simulador, y un buscador por simulación que prueba unos 200 tiros en el motor físico antes de elegir.

El proyecto incluye simuladores sobre dos motores físicos (MuJoCo y pooltool) y se distribuye con la librería Stable-Baselines3 sobre PyTorch. El repositorio ocupa 0,1 GB y acumula 424 descargas. La relevancia actual reside en que documenta con mediciones reproducibles (811 partidas de inicio aleatorio, benchmarks de 100 partidas con ruido de ejecución) cómo distintas arquitecturas de decisión escalan en una tarea de planificación física con incertidumbre, incluyendo comparativas de eficiencia entre búsqueda pura y redes neuronales.

La información disponible proviene íntegramente de la model card del autor; no se han publicado detalles sobre la arquitectura interna de las redes más allá de su función, ni sobre la composición exacta de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política SAC (Stable-Baselines3) y red de mapa de puntuación sobre candidatos; simuladores MuJoCo y pooltool |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) en documentación; el modelo no procesa lenguaje |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio con pesos PyTorch, sin detallar) |

## Arquitectura y entrenamiento

El sistema se compone de tres estrategias de selección de tiro evaluadas sobre el mismo simulador de billar de 4 bolas con reglas KBF. La primera es una política SAC que recibe el estado de la mesa y emite un tiro único; se entrenó durante 1 millón de pasos sobre el motor pooltool (semillas 42 y 43). La segunda es una red de "mapa de puntuación" que puntúa 1.256 tiros candidatos y selecciona el centro del intervalo de mayor probabilidad de anotar; se entrenó con 4 millones de tiros, incluyendo fases de repetición de posiciones vistas en partida. La tercera no entrena: realiza búsqueda por simulación, probando unos 200 tiros en el motor físico antes de ejecutar.

El proyecto incorpora además variantes avanzadas: un ajuste fino frente a error de ejecución (`scoremap_noise_1m_ft.pt`), un modelo con cinco tipos de efecto y dos etapas de inferencia gruesa-fina (`scoremap_spin_1.4m.pt`), y un híbrido Top-8 que valida con el simulador solo los 8 mejores candidatos de la red. La comparación entre entrenamiento en MuJoCo (lento, decenas de miles de tiros) y pooltool (1 millón de pasos) muestra que la conclusión inicial de que "SAC se estanca por diseño" era incorrecta: con suficiente entrenamiento, SAC alcanza entre el 89 % y el 93 % de victorias.

## Capacidades

- Selección de tiros en billar de 4 bolas (carom, reglas KBF) sobre estado de mesa simulado.
- Planificación con búsqueda en simulador (unos 200 tiros por decisión) y variante robusta frente a ruido de ejecución.
- Predicción de probabilidad de anotación sobre 1.256 candidatos sin usar simulador en tiempo de inferencia.
- Modelado de error de ejecución (ángulo ±0,2°, potencia ±5 %) y ajuste fino específico para ese ruido.
- Soporte de cinco tipos de efecto (spin) y razonamiento en dos etapas gruesa-fina.
- Híbrido Top-8: verificación selectiva de candidatos con el simulador (media de 1,1 simulaciones por tiro).
- No soporta tool calling, agentes de propósito general, visión, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Investigación en aprendizaje por refuerzo aplicado a planificación física: el repositorio sirve como banco de pruebas reproducible para comparar políticas directas (SAC) frente a métodos de puntuación de candidatos y búsqueda, con métricas de victorias y tasa de anotación por tiro.
- Desarrollo de asistentes de entrenamiento para billar: la red de mapa de puntuación puede sugerir tiros con alta probabilidad de anotar sin coste de simulación, útil en aplicaciones interactivas donde la latencia importa.
- Estudio de robustez frente a ruido de ejecución: los modelos ajustados con ruido permiten analizar cómo degrada el rendimiento un robot o jugador humano con error de ángulo y potencia controlado.
- Benchmarking de motores físicos: la comparación MuJoCo frente a pooltool documenta diferencias de velocidad de entrenamiento y fidelidad, relevante para quien elija simulador para RL.
- Planificación con presupuesto computacional limitado: el híbrido Top-8 reduce de 2.017 a 11 simulaciones por partida manteniendo resultados competitivos, patrón trasladable a otros dominios de planificación.
- Docencia y divulgación: los vídeos de partidas y el Space interactivo permiten mostrar de forma visual las diferencias entre búsqueda exhaustiva, redes y políticas RL.

## Benchmarks y rendimiento

Resultados sobre pooltool, partidas a 5 puntos y máximo 10 entradas, 811 partidas de inicio aleatorio:

| Jugador | Tiros de entrenamiento | Victorias (811) | Tasa de anotación en partida | Tiros por partida |
|---|---|---|---|---|
| SAC v4 (MuJoCo, versión anterior) | decenas de miles | 9 | 13,3 % | no disponible |
| SAC pooltool, semilla 42 | 1 millón | 722 (89,0 %) | 55,8 % | 9,96 |
| SAC pooltool, semilla 43 | 1 millón | 755 (93,1 %) | 59,5 % | 9,46 |
| Red mapa de puntuación, 4M (ronda 1) | 4 millones | 811 (100 %) | 84,7 % | 6,21 |
| Red mapa de puntuación, 4M (ronda 2) | 4 millones | 810 (99,9 %) | 85,0 % | 6,20 |
| Búsqueda por simulación | ninguno | 811 (100 %) | 100 % | 5,00 |

Victorias según límite de entradas (mismas 811 partidas):

| Máx. entradas | Búsqueda | Red (r1 / r2) | SAC (42 / 43) |
|---|---|---|---|
| 1 | 100 % | 45,0 % / 43,5 % | 7,9 % / 9,6 % |
| 2 | 100 % | 75,6 % / 77,2 % | 18,6 % / 22,7 % |
| 3 | 100 % | 90,9 % / 91,5 % | 31,7 % / 40,2 % |
| 5 | 100 % | 98,5 % / 98,9 % | 58,0 % / 65,1 % |
| 10 | 100 % | 100 % / 99,9 % | 89,0 % / 93,1 % |

Comparación con el mismo presupuesto de 1 millón de tiros: SAC obtiene 722/755 victorias (55,8 %/59,5 % de anotación), la red con 400.000 tiros aleatorios más repetición alcanza 703 victorias (54,5 %), y la red solo con tiros aleatorios cae a 544/531 (43,7 %/43,2 %). En el duelo 1:1 a 10 puntos con error de ejecución, el modelo final anotó 10 seguidos frente a 2 de la búsqueda (semilla 80016).

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la información disponible; las redes son de tamaño reducido (repositorio de 0,1 GB) y probablemente ejecutables en CPU.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada explícitamente, pero el tamaño del repositorio sugiere que sí cabe en GPUs de consumo; sin datos oficiales.
- Despliegue: inferencia vía PyTorch y Stable-Baselines3; los simuladores requieren MuJoCo y pooltool respectivamente.
- Latencia y throughput: no disponibles. La búsqueda por simulación implica unas 200 ejecuciones del motor físico por tiro (2.017 por partida en el duelo), mientras que el híbrido Top-8 requiere una media de 1,1 simulaciones por tiro.

## Comparativa con modelos similares

| Modelo | Enfoque | Entrenamiento | Victorias (811) | Licencia |
|---|---|---|---|---|
| SAC (este repo) | Política RL directa | 1M pasos pooltool | 89,0–93,1 % | MIT |
| Red mapa de puntuación (este repo) | Puntuación de 1.256 candidatos | 4M tiros | 99,9–100 % | MIT |
| Búsqueda por simulación (este repo) | Planificación sin aprendizaje | ninguno | 100 % | MIT |
| Alternativas externas de RL para billar | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de otros autores en la documentación proporcionada.

## Limitaciones y advertencias

- El 100 % de victorias de la búsqueda por simulación se logra en condiciones favorables: el mismo motor físico que luego ejecuta el tiro y sin error de ejecución; con ruido la ventaja se reduce (derrota 2:10 frente al modelo final en una partida concreta).
- El proyecto está documentado en coreano; no hay versión en castellano ni en inglés completa de toda la documentación.
- No es un modelo de lenguaje ni de propósito general: solo resuelve selección de tiros en billar de 4 bolas con reglas KBF.
- Los resultados dependen del simulador (pooltool/MuJoCo) y de las reglas configuradas (5 puntos, 10 entradas, niveles 0-2); no hay garantía de transferencia a mesa real.
- La model card indica que algunas conclusiones de versiones anteriores fueron corregidas; conviene revisar la versión y el commit consultados.
- Licencia MIT permite uso comercial, pero no se documentan sesgos ni riesgos de alucinación (no aplica al no ser generativo de lenguaje).
- No se detallan los pesos concretos publicados ni su formato exacto, lo que dificulta la reproducibilidad sin explorar el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/casareborgia/mujoco-kbf-4ball-rl
- Space interactivo: https://huggingface.co/spaces/casareborgia/kbf-4ball-duel
- Versión anterior (commit): https://huggingface.co/casareborgia/mujoco-kbf-4ball-rl/tree/6f183f4d47f2a742278e0011879b83befc3dfac5
- Vídeo primera entrada (pooltool): https://huggingface.co/casareborgia/mujoco-kbf-4ball-rl/resolve/main/media/first_inning_pooltool.mp4
- Vídeo fallo de la red: https://huggingface.co/casareborgia/mujoco-kbf-4ball-rl/resolve/main/media/first_inning_pooltool_seed80004.mp4
- Vídeo duelo híbrido Top-8 vs búsqueda: https://huggingface.co/casareborgia/mujoco-kbf-4ball-rl/resolve/main/media/duel_hybrid8_vs_search.mp4
- Vídeo duelo red sola: https://huggingface.co/casareborgia/mujoco-kbf-4ball-rl/resolve/main/media/duel_1inning_10pt.mp4
- Vídeo victoria con ruido de ejecución: https://huggingface.co/casareborgia/mujoco-kbf-4ball-rl/resolve/main/media/duel_noise_exp_win.mp4
