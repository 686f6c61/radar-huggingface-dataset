# BurnyCoder/ministrike-selfplay-seed333

## Resumen

MiniStrike selfplay_seed333 no es un modelo de lenguaje, sino un checkpoint de aprendizaje por refuerzo multiagente publicado en HuggingFace por Libor Burian (BurnyCoder). Se trata del punto final de entrenamiento de un agente que juega un mini-shooter táctico 3D 5v5, entrenado con MAPPO (multi-agent PPO) en régimen de self-play puro con la semilla independiente 333. El autor lo archiva explícitamente como **DEFERRED, INCOMPLETE**: no hay torneo final completado ni ninguna afirmación de habilidad táctica, y la evaluación registrada figura como pendiente.

La arquitectura es deliberadamente mínima: un actor compartido de tipo MLP 2x128 con activación tanh, 384 entradas de observación estructurada (historial con visibilidad limitada) y seis controles categóricos, más un crítico centralizado 2x256 que solo se usa durante el entrenamiento. No procesa píxeles ni texto, no tiene tokenizador y no dispone de ventana de contexto lingüística. El repositorio ocupa 0,0 GB, no registra descargas ni likes en el momento de la consulta y se distribuye con licencia MIT.

Su relevancia no es de rendimiento sino metodológica: es un ejemplo de publicación abierta de resultados negativos o incompletos, con revisión de código fuente, configuración, métricas y auditoría de aprendizaje incluidas. Sirve como material reproducible para estudiar protocolos de evaluación con incertidumbre, currículos de self-play y la brecha entre "el pipeline aprende" y "el agente es competente".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP actor 2x128 con tanh (384 entradas, 6 salidas categóricas) + crítico centralizado 2x256 solo en entrenamiento; algoritmo MAPPO |
| Parámetros totales | 66.566 en el actor (cálculo derivado de la topología 384-128-128-6); total con crítico no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; entrada de 384 valores de observación estructurada con historial limitado por visibilidad, sin ventana textual |
| Tipos de cuantización | No disponible; checkpoint PyTorch en coma flotante, sin versiones GGUF, AWQ ni GPTQ publicadas |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `.pt` (state dict de PyTorch con pesos, estado de optimizador, estado de entorno y generadores RNG) |
| Pipeline declarado | reinforcement-learning |
| Tamaño del repositorio | 0,0 GB |
| Revisión de código de entrenamiento | `38697fee4af941b12cfd15489424e2750ef4dd1d` |

## Arquitectura y entrenamiento

El agente usa un actor compartido entre los cinco bots, implementado como un perceptrón multicapa de dos capas de 128 unidades con activación tanh. La entrada son 384 valores de observación estructurada (no píxeles) con historial limitado por visibilidad; la salida son seis controles categóricos. Durante el entrenamiento se añade un crítico centralizado de 2x256 que explota información global de todos los agentes, pero la inferencia en partida utiliza únicamente observaciones locales y controles crudos, de modo que el crítico es prescindible en despliegue. El algoritmo es MAPPO, con descuento gamma de 0,999.

El entrenamiento acumuló 2.211.840 transiciones de arena y 1.080 actualizaciones, con el presupuesto de fotogramas marcado como **no completado** (`frame budget completed: False`). Se aplicó un currículo con fracciones 15/15/70 para arranques de combate, objetivo y estándar respectivamente. El entorno es un único mapa con movimiento a nivel de suelo, geometría de cajas, un solo rifle y objetivos de bomba. El repositorio incluye dos checkpoints: `initial.pt` como línea base sin tocar y `model.pt` como punto final guardado, seleccionado explícitamente **no** a partir de puntuaciones de test final, lo que evita el sesgo de selección sobre el conjunto de evaluación.

La documentación del autor es inusualmente explícita sobre el estado del arte del proyecto: la suite diferida conserva sus plazos originales y todas las enmiendas por interrupciones en la auditoría de aprendizaje; las hipótesis fallidas y los bots débiles permanecen publicados. Las referencias algorítmicas citadas son el tutorial MAPPO de TorchRL y los artículos arXiv 2103.01955 (MAPPO) y 2108.13264 (incertidumbre en evaluación de RL).

## Capacidades

- Jugar partidas 5v5 en un único mapa 3D simplificado con objetivos de bomba y un rifle, mediante seis controles categóricos por paso.
- Tomar decisiones a partir de observaciones estructuradas con visibilidad limitada, sin acceso a píxeles ni a estado global en inferencia.
- Mantener un actor compartido entre los cinco bots del equipo, lo que reduce el coste de inferencia a una sola pasada por agente y paso.
- Operar en modo espectador y en modo jugador dentro de la herramienta `csrl` del repositorio de origen, con selección de bot y cambio de cámara.
- Servir como línea base reproducible de MAPPO en un entorno multiagente con currículo de arranques.
- Restauración completa del estado de entrenamiento (optimizador, entorno y RNG), lo que permite reanudar experimentos de forma determinista.
- No soporta tool calling, function calling, agentes basados en lenguaje, razonamiento multi-paso simbólico, visión por píxeles, audio ni capacidades multilingües.

## Casos de uso

- Reproducción de experimentos de MAPPO: el checkpoint incluye estado de optimizador y RNG, de modo que un investigador puede reanudar exactamente la condición selfplay/seed333 y verificar los resultados reportados en la auditoría.
- Docencia de aprendizaje por refuerzo multiagente: la topología es tan pequeña (66.566 parámetros en el actor) que el ciclo completo de entrenamiento e inferencia puede explicarse y ejecutarse en una sesión de laboratorio.
- Diseño de protocolos de evaluación con incertidumbre: el autor documenta intervalos bootstrap de pares de semillas y evaluación pendiente, lo que convierte el repositorio en un caso de estudio sobre cómo reportar métricas con sus supuestos de incertidumbre.
- Pruebas de humo (smoke tests) de pipelines TorchRL: los "smoke runs" del autor validan el pipeline de aprendizaje, por lo que el checkpoint sirve para comprobar que una integración de entorno, política y registro de métricas funciona de extremo a extremo.
- Investigación sobre currículos de self-play: las fracciones 15/15/70 de arranques de combate, objetivo y estándar son un parámetro replicable para estudiar cómo afecta el currículo a la estabilidad del entrenamiento.
- Regresión determinista en integración continua: al ser un artefacto pequeño con carga weights-only validada por el cargador del proyecto, puede usarse como fixture que detecte cambios incompatibles en el esquema del checkpoint.
- Estudio de prácticas de publicación abierta: el conjunto (auditoría de aprendizaje, resultados negativos, estado DEFERRED) es un ejemplo citable de publicación de artefactos incompletos con trazabilidad de revisiones de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el estado de evaluación figura como **pendiente**, que la puntuación media por ronda es **pendiente** y que el intervalo bootstrap del 95 % por pares de semillas es **pendiente**. La métrica prevista asigna 1 a victoria, 0,5 a empate y 0 a derrota frente a controles congelados de tipo random, rush y guard, con intercambio de lados; los datos crudos de rondas, desglose por lado y oponente y las semillas exactas se encuentran en `evaluation.json` cuando esté disponible.

El autor advierte además que este es un experimento local pequeño, no evidencia de habilidad a nivel humano ni de transferencia a Counter-Strike comercial, y que los intervalos de confianza de partidas no establecen robustez entre modelos entrenados de forma independiente.

## Requisitos de hardware

- VRAM para inferencia: prácticamente nula. El actor tiene 66.566 parámetros; en coma flotante de 32 bits son aproximadamente 266 KB de pesos, holgadamente por debajo de 1 MB con estado auxiliar.
- CPU: suficiente para la inferencia de la política. El cuello de botella es el bucle de simulación y el renderizado del cliente, no la red.
- GPU recomendadas: no se especifican en la información disponible. Cualquier GPU consumer sirve para entrenamiento por su tamaño mínimo; para el renderizado 3D conviene una GPU dedicada, aunque no hay requisitos publicados.
- Cabe en GPU consumer: sí, con cualquier modelo, dado el tamaño del actor. El requisito real depende de la herramienta `csrl watch --first-person` y del motor gráfico del repositorio de origen.
- Opciones de despliegue: PyTorch con carga weights-only a través del cargador del proyecto y el entorno `uv` bloqueado del repositorio; el modo espectador y el modo jugador se invocan con `uv run csrl watch` y `uv run csrl play`. No aplica vLLM, TGI, llama.cpp ni Ollama, que son servidores de inferencia para modelos de lenguaje.
- Latencia y throughput: no disponibles. El autor solo reporta 2.211.840 transiciones de arena y 1.080 actualizaciones de entrenamiento, sin tiempos de pared ni métricas de pasos por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada / contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniStrike selfplay_seed333 | 66.566 (actor) | 384 valores estructurados | Evaluación pendiente | MIT | HuggingFace, 0 descargas |
| Checkpoints de duelo a spawn fijo (colección MiniStrike) | No disponible | No disponible | No disponible; aceptación de script móvil fallida según la colección | No disponible en la información | Colección de HuggingFace del mismo autor |
| Implementaciones de referencia del tutorial MAPPO de TorchRL | No disponible | No disponible | No disponible | No disponible | Documentación de PyTorch |

No se dispone de alternativas comparables con métricas publicadas en la información proporcionada. Las comparaciones con modelos de lenguaje de gran tamaño serían categóricamente inválidas: aquí no hay tokenizador, ni contexto textual, ni benchmark de conocimiento.

## Limitaciones y advertencias

- Estado de archivo **DEFERRED, INCOMPLETE**: sin torneo final completado y sin ninguna afirmación de habilidad táctica respaldada.
- Evaluación no publicada: puntuación media e intervalos bootstrap pendientes; cualquier afirmación de rendimiento sería una invención.
- Presupuesto de fotogramas no completado (`frame budget completed: False`), por lo que el entrenamiento terminó antes de lo planificado.
- Entorno muy restringido: un único mapa, movimiento a nivel de suelo, geometría de cajas, un solo rifle y objetivos de bomba. La transferencia a otros mapas o a shooters comerciales no está demostrada y el autor la descarta explícitamente.
- Entradas estructuradas en lugar de píxeles: no es un agente visual y no puede operar sobre capturas de pantalla sin un extractor de observaciones adicional.
- Sin capacidades lingüísticas: no hay soporte multilingüe, tool calling ni razonamiento en lenguaje natural; los tags de idioma no están disponibles porque no aplican.
- Riesgo de sobreinterpretación: los "smoke runs" solo validan el pipeline de aprendizaje, no la competencia del agente. Los intervalos de confianza sobre partidas no implican robustez entre semillas.
- Sesgos conocidos: no documentados en la información disponible; el agente se entrena contra oponentes generados por self-play y controles congelados, lo que puede producir comportamientos explotadores específicos del mapa.
- Licencia MIT: permite uso comercial y modificación con atribución y conservación del aviso de copyright, pero la licencia no otorga ninguna garantía de idoneidad ni de rendimiento.
- Caveat de producción: no existe soporte de servidor de inferencia estándar; el despliegue requiere el repositorio de origen, su entorno `uv` bloqueado y compatibilidad con el esquema del checkpoint validado por el cargador.
- Inconsistencia menor de nomenclatura en la documentación: la model card enlaza dos nombres de repositorio distintos (`3d-firstperson-shooter-reinforcement-learning-selfplay` y `counter-strike-reinforcement-learning-selfplay`), lo que conviene verificar antes de automatizar descargas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BurnyCoder/ministrike-selfplay-seed333
- Colección MiniStrike staged shooter self-play: https://huggingface.co/collections/BurnyCoder/ministrike-staged-shooter-self-play
- Perfil del autor en HuggingFace: https://huggingface.co/BurnyCoder/models
- Repositorio de origen (entrenamiento self-play 3D FPS): https://github.com/BurnyCoder/3d-firstperson-shooter-reinforcement-learning-selfplay
- Repositorio alternativo citado en la model card: https://github.com/BurnyCoder/counter-strike-reinforcement-learning-selfplay
- Protocolo del proyecto: https://github.com/BurnyCoder/counter-strike-reinforcement-learning-selfplay/blob/main/docs/protocol.md
- Informes del proyecto: https://github.com/BurnyCoder/counter-strike-reinforcement-learning-selfplay/tree/main/reports
- Auditoría de aprendizaje: https://github.com/BurnyCoder/3d-firstperson-shooter-reinforcement-learning-selfplay/blob/main/reports/learning-audit/summary.md
- Perfil de GitHub del autor: https://github.com/BurnyCoder/
- Artículo MAPPO (arXiv 2103.01955): https://arxiv.org/abs/2103.01955
- Artículo sobre incertidumbre en evaluación de RL (arXiv 2108.13264): https://arxiv.org/abs/2108.13264
- Tutorial MAPPO de TorchRL: https://docs.pytorch.org/rl/stable/tutorials/multiagent_ppo.html
