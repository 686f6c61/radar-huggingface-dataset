# GoudaGame/estimation-rl-v2

## Resumen

RL v2 es un agente entrenado por aprendizaje por refuerzo para jugar a Estimation, un juego de cartas con mecánica de bazas y pujas. Lo ha desarrollado Yosif Elessawi y lo publica la cuenta GoudaGame bajo licencia MIT. El modelo no es un modelo de lenguaje: es un checkpoint de PyTorch que contiene exclusivamente pesos y números de dos redes neuronales, una para la fase de puja y otra para la fase de juego de cartas.

El entrenamiento combina una inicialización por imitación de un bot de búsqueda con look-ahead y un posterior refinamiento mediante self-play, con 816.000 partidas en la fase final y sin partidas humanas en el conjunto de datos. Según la model card, este agente es la referencia contra la que se miden el resto de bots del ecosistema Estimation Arena.

Su relevancia es acotada pero clara para quien investigue RL aplicado a juegos de información imperfecta: es un ejemplo de pipeline de self-play con arranque por imitación, publicado con pesos y con un leaderboard público de comparación. El repositorio tiene 0 GB y 0 descargas en el momento de la consulta, y el motor de reglas necesario para ejecutarlo es privado, lo que limita su reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales para puja y juego de cartas (detalle no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (agente de juego, sin entrada de texto) |
| Licencia | MIT |
| Formato de pesos | checkpoint de PyTorch (solo pesos y numeros) |

## Arquitectura y entrenamiento

La model card describe dos redes separadas: una para la fase de puja y otra para la fase de juego de cartas. No se especifica el tipo de red (MLP, CNN, transformer u otra), el número de capas, las dimensiones de las capas ocultas ni el número total de parámetros. Tampoco se detalla la representación de entrada del estado del juego ni el algoritmo de RL empleado (por ejemplo, PPO, DQN o policy gradient con baseline).

El proceso de entrenamiento tiene dos etapas documentadas. La primera es una copia de las redes de un bot de búsqueda con look-ahead, es decir, un arranque por imitación de un agente más fuerte basado en búsqueda. La segunda es entrenamiento por self-play, con 816.000 partidas en la etapa final. No se usaron partidas humanas. No se indica si hubo búsqueda durante el self-play, qué hiperparámetros se usaron ni cómo se evaluó la convergencia.

## Capacidades

- Puja en Estimation: la red de puja selecciona la apuesta de bazas a partir del estado de la mano.
- Juego de cartas: la red de cartas selecciona la carta a jugar en cada turno.
- Juego completo: cubre las dos fases del juego de forma conjunta.
- Evaluación comparativa: sirve como referencia en el leaderboard Estimation Arena.
- Sin capacidades de lenguaje: no genera texto, no responde preguntas ni procesa instrucciones.
- Sin tool calling, sin razonamiento multi-paso genérico y sin capacidades multimodales.
- Multilingüismo no aplicable: no hay interfaz de texto ni idiomas soportados.

## Casos de uso

- Benchmark de agentes en juegos de bazas: usar RL v2 como oponente de referencia para medir la fuerza de bots nuevos en Estimation, aprovechando que ya está integrado en el leaderboard Estimation Arena.
- Investigación en self-play: reproducir o comparar pipelines de arranque por imitación más self-play en un juego de información imperfecta con reglas acotadas.
- Estudio de inicialización por imitación: analizar cuánto del rendimiento final proviene del bot de look-ahead inicial frente al entrenamiento por self-play con 816.000 partidas.
- Generación de datos de entrenamiento: enfrentar el agente contra variantes más débiles para producir trayectorias etiquetadas que sirvan de dataset para otros modelos.
- Evaluación de robustez: medir la varianza de resultados del agente frente a oponentes con estilos distintos, útil para detectar explotabilidad en políticas entrenadas por self-play.
- Docencia en RL aplicado: usar el par de redes y el leaderboard como ejemplo concreto de formulación de un juego de cartas como problema de decisión secuencial.
- Integración en torneos automatizados: desplegar el checkpoint como participante en competiciones de bots, siempre que se disponga de una implementación compatible del motor de reglas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que el agente está evaluado en el leaderboard Estimation Arena y que es la referencia contra la que se miden los demás bots, pero no incluye cifras de win rate, Elo ni métricas por fase.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un checkpoint de PyTorch con solo pesos y números y un repositorio de 0 GB, es probable que quepa en cualquier GPU consumer, pero no se confirma el tamaño.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, una GPU consumer reciente sería suficiente en la mayoría de escenarios, sin datos oficiales que lo confirmen.
- CPU: plausible para inferencia dado el tamaño aparente, aunque no está documentado.
- Opciones de despliegue: carga directa del checkpoint con PyTorch; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Dependencia crítica: la ejecución requiere el motor de reglas de Estimation, que es privado según la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Juego | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RL v2 (GoudaGame) | Redes de puja y cartas | Estimation | Imitación + self-play, 816.000 partidas | MIT | Pesos públicos, motor de reglas privado |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros agentes publicados para Estimation con los que establecer una comparación cuantitativa. El leaderboard Estimation Arena es el único punto de comparación mencionado, pero no se han proporcionado sus cifras.

## Limitaciones y advertencias

- Ámbito muy restringido: solo juega a Estimation; no es reutilizable para otras tareas sin reentrenamiento.
- Reproducibilidad limitada: el motor de reglas necesario para ejecutar el modelo es privado, por lo que los pesos públicos no bastan para ponerlo en marcha.
- Documentación insuficiente: no se detallan arquitectura, hiperparámetros, algoritmo de RL ni métricas de evaluación.
- Riesgo de explotación: al entrenarse solo por self-play, la política puede ser vulnerable a estilos de juego no vistos durante el entrenamiento.
- Sesgo de inicialización: el comportamiento inicial depende del bot de look-ahead copiado, lo que puede arrastrar sesgos de esa política.
- Sin datos de sesgo lingüístico ni de alucinación, porque no procesa lenguaje natural.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar la titularidad de los derechos, ya que la publicación se hace con permiso del autor original.
- Sin métricas publicadas: no hay evidencia numérica de rendimiento más allá de la afirmación de que es el benchmark del leaderboard.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GoudaGame/estimation-rl-v2
- Leaderboard Estimation Arena: https://essamgouda97.github.io/estimation-arena/
- Repositorio de código: https://github.com/essamgouda97/estimation-arena
