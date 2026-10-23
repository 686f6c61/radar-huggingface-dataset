# BurnyCoder/ministrike-selfplay-seed222

## Resumen

MiniStrike selfplay_seed222 es un checkpoint de aprendizaje por refuerzo multiagente para un entorno táctico 5v5 en 3D, publicado por Libor Burian (BurnyCoder) en HuggingFace bajo licencia MIT. No es un modelo de lenguaje: es un artefacto de investigación que contiene los pesos de una política compartida entrenada con MAPPO (Multi-Agent PPO) sobre observaciones estructuradas, no sobre píxeles. El actor es una MLP pequeña (2 capas de 128 unidades, activación tanh) con 384 entradas de historial limitado por visibilidad y seis controles categóricos; el crítico centralizado 2x256 solo se emplea durante el entrenamiento.

El checkpoint corresponde a la condición de self-play puro con semilla independiente 222, tras 1.904.640 transiciones de arena y 930 actualizaciones. El propio autor lo marca como **DEFERRED, INCOMPLETE**: el presupuesto de frames no se completó, no hay torneo final cerrado y la evaluación registrada figura como *pending*, sin puntuación media ni intervalo de confianza bootstrap calculados. Es, por tanto, un artefacto de reproducibilidad y de validación de pipeline, no una demostración de habilidad táctica.

Su relevancia actual es acotada pero concreta: sirve como referencia reproducible de un pipeline MAPPO con TorchRL en un dominio de shooter táctico, con auditoría de aprendizaje pública que incluye hipótesis fallidas y bots débiles. El repositorio pesa 0,0 GB según HuggingFace, lo que es coherente con el tamaño minúsculo de las redes descritas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (no transformer): actor compartido 2x128 tanh con 384 entradas y 6 salidas categóricas; crítico centralizado 2x256 usado solo en entrenamiento MAPPO |
| Parametros totales | ~66.566 en el actor (cálculo derivado de 384→128→128→6); crítico no determinable sin la dimensión exacta de su entrada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada fija de 384 características de observación con historial limitado por visibilidad |
| Tipos de cuantizacion | no disponible; checkpoint PyTorch en precisión completa (no se documentan variantes INT8/FP16/GGUF) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `.pt` (checkpoint PyTorch con pesos, estado del optimizador, estado del entorno y generadores RNG; carga weights-only) |
| Algoritmo | MAPPO (Multi-Agent PPO) sobre TorchRL |
| Entorno | Shooter táctico 5v5, un único mapa, movimiento a nivel de suelo, geometría de cajas, un rifle y objetivos de bomba |
| Semilla | 222 (self-play independiente) |
| Transiciones de entrenamiento | 1.904.640 |
| Actualizaciones | 930 |
| Presupuesto de frames completado | False |
| Estado de evaluación | pending (sin puntuación media ni intervalo de confianza) |

## Arquitectura y entrenamiento

La política es una MLP compartida entre los cinco agentes del equipo, con dos capas ocultas de 128 unidades y activación tanh. La entrada son 384 características de observación estructurada (no píxeles) con historial recortado por el sistema de visibilidad; la salida son seis controles categóricos. Durante el entrenamiento se añade un crítico centralizado de 2x256 que ve información global del equipo, según el esquema centralizado-entrenamiento / descentralizado-ejecución propio de MAPPO. En inferencia solo se usa la política local y los controles en crudo, de modo que el crítico no forma parte del coste de despliegue.

El entrenamiento emplea self-play puro con gamma 0,999 y un currículo de arranques con fracciones 15/15/70 para combate, objetivo y estándar. La revisión de código registrada es `38697fee4af941b12cfd15489424e2750ef4dd1d`. El checkpoint `initial.pt` es la línea base sin tocar y `model.pt` es el endpoint final guardado, seleccionado sin usar puntuaciones de test final. El autor documenta explícitamente que esta condición de self-play queda fuera de un protocolo posterior de "Stage A" de self-play puro y que cualquier condición de oponente fijo presente es heredada. No se documenta RLHF, DPO ni ninguna técnica de alineación, algo esperable en un artefacto de RL.

## Capacidades

- Control táctico simulado: emite seis controles categóricos por agente para movimiento y acciones de combate a nivel de suelo.
- Juego en equipo 5v5: la política se comparte entre los cinco agentes, con observaciones locales limitadas por visibilidad.
- Ejecución de objetivos de bomba en un mapa concreto con geometría de cajas y un único tipo de rifle.
- Inferencia descentralizada: cada agente decide con su observación local, sin acceso al crítico centralizado.
- Modo espectador y toma de control manual: el visor permite seleccionar bots vivos, cambiar de cámara y tomar el control sin reiniciar la ronda.
- Reproducibilidad determinista: el checkpoint incluye estado de optimizador, de entorno y RNG, lo que permite reanudar o replicar episodios.
- No soporta tool calling, function calling, agentes de propósito general, visión por píxeles, audio ni generación de texto.

## Casos de uso

- Reproducción de experimentos de self-play: cargar `model.pt` con el entorno bloqueado del repositorio y replicar exactamente las condiciones de la semilla 222, incluido el estado del optimizador y los RNG, para auditar resultados publicados.
- Línea base para MAPPO en dominios tácticos: usar el par `initial.pt` / `model.pt` como referencia de comparación al probar cambios de recompensa, currículo o arquitectura, con la ventaja de que el pipeline ya está validado con smoke runs.
- Docencia de RL multiagente: el tamaño ínfimo de la red (unas 66.000 paramétros en el actor) permite ejecutar el bucle completo en CPU y examinar paso a paso la actualización PPO con crítico centralizado.
- Investigación en evaluación estadística: el autor publica el protocolo de intervalos bootstrap por pares de semillas; este checkpoint sirve como uno de los puntos muestrales para estudiar la incertidumbre de evaluación con presupuestos incompletos.
- Desarrollo de agentes para entornos simulados de shooters: punto de partida para fine-tuning con nuevas armas, mapas u objetivos, reutilizando las 384 características de observación como interfaz estable.
- Pruebas de robustez frente a oponentes guionizados: el protocolo de evaluación enfrenta la política a controles fijos random/rush/guard con intercambio de lados, lo que permite medir degradación del rendimiento bajo distribuciones de oponente no vistas.
- Generación de demos y material audiovisual: el modo `watch --first-person` con espectador interactivo permite grabar partidas reproducibles para documentación o análisis cualitativo del comportamiento.
- Auditoría de reproducibilidad y ciencia abierta: el artefacto conserva hipótesis fallidas y bots débiles publicados, útil como ejemplo de registro negativo en investigación de RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La evaluación figura como *pending*: no hay puntuación media de ronda, ni intervalo de confianza bootstrap del 95% por pares de semillas, ni desgloses por lado u oponente. La tabla siguiente refleja el estado declarado, sin estimaciones:

| Metrica | Estado | Valor |
|---|---|---|
| Puntuación media de ronda (victoria 1 / empate 0,5 / derrota 0) | pending | no disponible |
| Intervalo bootstrap 95% por pares de semillas | pending | no disponible |
| Desglose por lado y por oponente | pendiente de `evaluation.json` | no disponible |
| Torneo final | no completado | no disponible |
| Afirmación de habilidad táctica | no emitida por el autor | no aplica |
| Presupuesto de frames | incompleto (False) | 1.904.640 transiciones, 930 actualizaciones |

Los únicos controles de validación declarados son *smoke runs* que verifican que el pipeline de aprendizaje funciona, no la calidad de la política. El autor advierte explícitamente que los intervalos de confianza de partidas no establecen robustez entre modelos entrenados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. El actor ronda los 66.566 parámetros; en FP32 son unos 0,27 MB de pesos, y el checkpoint completo (optimizador, estado de entorno y RNG) sigue siendo del orden de megabytes.
- GPU recomendadas: ninguna en particular. Cualquier GPU con CUDA es suficiente y claramente sobredimensionada; una RTX 4090 o una A100 no aportan ventaja frente a CPU para la inferencia de la política.
- Cabe en GPU de consumo: sí, en cualquier modelo, incluidos integrados. También funciona en CPU sin GPU dedicada.
- Opciones de despliegue: el cargador del repositorio fuente mediante `uv run csrl watch --first-person --checkpoint ...` y `uv run csrl play --checkpoint ...`. No aplican vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponible. El cuello de botella esperable es el simulador y el renderizado, no el forward pass de la MLP; el autor solo reporta smoke runs sin cifras de latencia.
- Requisito de entorno: el repositorio fuente debe instalarse con su entorno `uv` bloqueado y el checkpoint colocarse en `artifacts/models/selfplay_seed222`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniStrike selfplay_seed222 (este) | ~66.566 en el actor | 384 características estructuradas | no disponible (evaluación pending) | MIT | HuggingFace + repo fuente |
| MiniStrike fixed-spawn duel self-play (colección del mismo autor) | no disponible | no disponible | no disponible; aceptación de script en movimiento fallida | MIT (según colección) | HuggingFace |
| MiniStrike 5v5 deferred archives (colección del mismo autor) | no disponible | no disponible | no disponible; archivados como diferidos | MIT (según colección) | HuggingFace |
| Tutorial MAPPO de TorchRL (referencia de implementación) | no aplica | no aplica | no aplica (material didáctico) | según repositorio de PyTorch | docs.pytorch.org |

No se identifican en la información disponible otros checkpoints públicos de shooters tácticos 5v5 con los que establecer una comparación cuantitativa. Los tres elementos de la colección MiniStrike comparten autor, protocolo y estado de evaluación incompleto, por lo que la comparación relevante es de condición experimental (duelo a spawn fijo frente a 5v5 con self-play), no de rendimiento.

## Limitaciones y advertencias

- Estado archival **DEFERRED, INCOMPLETE**: no hay torneo final completado ni afirmación de habilidad táctica; el autor lo declara explícitamente.
- Evaluación **pending**: sin puntuación media, sin intervalo de confianza y sin desglose por lado u oponente. Cualquier uso que asuma un nivel de competencia concreto es infundado.
- Presupuesto de frames no completado: solo 930 actualizaciones y 1,9 millones de transiciones, insuficiente para extraer conclusiones de escalado.
- Un único mapa, movimiento a nivel de suelo, geometría de cajas, un rifle y objetivos de bomba: la política no generaliza a otros mapas, armas ni geometrías sin reentrenamiento.
- Entrada estructurada, no píxeles: no hay percepción visual; no es trasladable a entornos que solo ofrezcan imagen.
- Oponentes de evaluación guionizados (random/rush/guard), no humanos: el rendimiento frente a jugadores reales es desconocido.
- El crítico centralizado 2x256 no está disponible en inferencia; no se puede reproducir el comportamiento de entrenamiento con observaciones globales en despliegue.
- Un solo modelo y una sola semilla: los intervalos por pares de semillas no establecen robustez entre modelos entrenados independientemente, según el propio autor.
- Entrenamiento gamma 0,999 con currículo 15/15/70: sensible a cambios de recompensa y de distribución de arranques.
- Riesgo de alucinación: no aplica (no genera texto). El riesgo análogo es sobreajuste al mapa y explotación de comportamientos degenerados no catalogados.
- Sesgos conocidos: no documentados; el autor publica hipótesis fallidas y bots débiles, pero no analiza sesgos de política.
- Licencia MIT: permite uso comercial y modificaciones con atribución, pero el artefacto no es apto para producción por su estado de validación, no por restricción legal.
- Advertencia explícita del autor: no es evidencia de habilidad a nivel humano ni de transferencia a Counter-Strike comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BurnyCoder/ministrike-selfplay-seed222
- Colección MiniStrike staged shooter self-play: https://huggingface.co/collections/BurnyCoder/ministrike-staged-shooter-self-play
- Repositorio fuente (identidad del checkpoint): https://github.com/BurnyCoder/3d-firstperson-shooter-reinforcement-learning-selfplay
- Repositorio del protocolo y reportes: https://github.com/BurnyCoder/counter-strike-reinforcement-learning-selfplay
- Auditoría de aprendizaje (resumen): https://github.com/BurnyCoder/3d-firstperson-shooter-reinforcement-learning-selfplay/blob/main/reports/learning-audit/summary.md
- Protocolo experimental: https://github.com/BurnyCoder/counter-strike-reinforcement-learning-selfplay/blob/main/docs/protocol.md
- Reportes y comparativas: https://github.com/BurnyCoder/counter-strike-reinforcement-learning-selfplay/tree/main/reports
- Perfil del autor en HuggingFace: https://huggingface.co/BurnyCoder/models
- Perfil del autor en GitHub: https://github.com/BurnyCoder/
- Tutorial MAPPO de TorchRL: https://docs.pytorch.org/rl/stable/tutorials/multiagent_ppo.html
- Paper MAPPO (arXiv:2103.01955): https://arxiv.org/abs/2103.01955
- Paper sobre incertidumbre en evaluación de RL (arXiv:2108.13264): https://arxiv.org/abs/2108.13264
