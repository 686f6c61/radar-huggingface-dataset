# BurnyCoder/ministrike-selfplay-seed111

## Resumen
MiniStrike selfplay_seed111 es un checkpoint de política de aprendizaje por refuerzo multiagente para un entorno táctico 3D minimalista denominado MiniStrike. Lo publica Libor Burian (BurnyCoder) como artefacto reproducible de un experimento local de self-play con MAPPO, no como un modelo de lenguaje ni un sistema listo para producción. El problema que aborda es el entrenamiento de agentes 5v5 con observaciones estructuradas y control discreto en un mapa único con geometría de cajas, movimiento a nivel de suelo, un rifle y objetivos de bomba.

La política usa un actor compartido con arquitectura MLP de 2 capas de 128 unidades y activación tanh, 384 entradas de observación estructurada con visibilidad limitada y seis controles categóricos. Durante el entrenamiento se emplea un crítico centralizado de 2x256; en inferencia solo se usa el actor con observaciones locales. El checkpoint corresponde a la semilla independiente 111, con 3.604.480 transiciones de arena y 1.760 actualizaciones.

Su relevancia es metodológica: se publica con auditoría de aprendizaje, resultados negativos incluidos y un estado de evaluación explícitamente pendiente. La model card lo marca como DEFERRED, INCOMPLETE, sin torneo final completado ni afirmación de habilidad táctica. Es útil para reproducir experimentos de RL multiagente y estudiar evaluación con incertidumbre, no para atribuirle capacidades generales.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | MAPPO actor-crítico; actor compartido MLP 2x128 tanh; crítico centralizado 2x256 solo en entrenamiento |
| Parámetros totales | No disponible; el actor declarado es una MLP 384-128-128-6 |
| Parámetros activos | No aplica; no es un modelo MoE |
| Longitud de contexto | No aplica; ventana de observación estructurada de 384 dimensiones, sin contexto de tokens |
| Tipos de cuantización | No disponible; checkpoint PyTorch sin variantes cuantizadas publicadas |
| Idiomas soportados | No aplica; no es un modelo de lenguaje |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (`model.pt`, `initial.pt`); carga weights-only; incluye estado de optimizador, entorno y RNG |
| Entorno | MiniStrike 3D 5v5; un mapa, movimiento a nivel de suelo, geometría de cajas, un rifle y objetivos de bomba |
| Semilla | 111 |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento
El sistema sigue MAPPO con un actor compartido entre agentes y un crítico centralizado que solo se utiliza durante el entrenamiento. La ejecución es descentralizada: cada agente infiere con observaciones locales de 384 dimensiones y emite seis controles categóricos. El actor es una MLP de dos capas de 128 unidades con tanh; el crítico es una MLP de dos capas de 256 unidades. No se procesan píxeles: las entradas son observaciones estructuradas con visibilidad limitada.

El entrenamiento registra 3.604.480 transiciones de arena, 1.760 actualizaciones y un factor de descuento gamma de 0,999. El currículo de inicio reparte fracciones 15/15/70 entre combate, objetivo y estándar. La condición es self-play puro con semilla independiente 111; la model card indica que una condición legada de oponente fijo queda fuera del protocolo Stage A de self-play puro. El presupuesto de frames no se completó. No hay RLHF ni DPO, al no tratarse de un modelo generativo. El checkpoint conserva pesos, estado del optimizador, estado del entorno y generadores de números aleatorios para reproducibilidad.

## Capacidades
- Control de agente en un entorno 3D minimalista con movimiento a nivel de suelo, geometría de cajas, un rifle y objetivos de bomba.
- Política multiagente 5v5 con actor compartido y ejecución descentralizada basada en observaciones locales.
- Procesamiento de observaciones estructuradas de 384 dimensiones con visibilidad limitada; no procesa imágenes ni píxeles.
- Emisión de seis controles categóricos discretos; la model card no detalla el mapeo exacto de acciones.
- Carga en modo espectador y partida interactiva mediante los comandos del repositorio fuente.
- Intervención humana en partida con la tecla F, tomando o devolviendo el control sin reiniciar la ronda.
- Checkpoint reproducible con estado de optimizador, entorno y RNG.
- No soporta generación de texto, código, matemáticas, visión artificial, tool calling, agentes LLM ni capacidades multilingües.

## Casos de uso
- Reproducción de experimentos MAPPO en multiagente: cargar el checkpoint y comparar actualizaciones, currículo y curvas de recompensa con la semilla 111 y con otras semillas del mismo proyecto.
- Auditoría de evaluación en RL: usar el estado pendiente y el futuro `evaluation.json` para estudiar intervalos bootstrap por pares de semillas y la diferencia entre evaluación condicional y robustez entre modelos.
- Baseline para comparar algoritmos: servir como referencia self-play de MAPPO frente a PPO, IPPO u otras variantes en un entorno pequeño y controlado.
- Docencia de self-play con TorchRL: ilustrar un actor-crítico con observaciones estructuradas, acciones categóricas y crítico centralizado en un caso ejecutable.
- Pruebas de infraestructura de entrenamiento: validar checkpointing, carga weights-only, restauración de estado de entorno y RNG en pipelines de RL.
- Análisis cualitativo de políticas: inspeccionar en modo espectador el comportamiento de los bots en combate, objetivo y inicio estándar, sin afirmar habilidad táctica final.
- Prototipado de mecánicas de juego táctico: emplear el entorno y la política como banco de pruebas para recompensas, geometría y objetivos de bomba antes de invertir en un simulador mayor.
- Estudio de currículos de inicio: comparar las fracciones 15/15/70 de combate, objetivo y estándar y su efecto en el comportamiento aprendido.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La evaluación final está pendiente y no se reportan puntuaciones medias ni intervalos de confianza cerrados.

| Métrica | Estado |
|---|---|
| Evaluación final | Pendiente |
| Puntuación media por ronda | Pendiente |
| Intervalo bootstrap del 95% condicional por pares de semillas | Pendiente |
| Presupuesto de frames completado | No |
| Victorias, empates y derrotas frente a controles random/rush/guard | No disponible |
| MMLU, HumanEval, GSM8K u otros benchmarks de LLM | No aplica |

## Requisitos de hardware
- Inferencia en CPU: el actor es una MLP pequeña; no se requiere GPU para ejecutar la política.
- VRAM estimada: despreciable para inferencia, por debajo de 1 GB; no se publica una medición oficial.
- GPU recomendadas: ninguna en particular; cualquier GPU CUDA o ROCm puede ejecutar PyTorch, pero A100, H100 o RTX 4090 no aportan ventaja relevante para esta MLP.
- Cabe en cualquier GPU de consumo y en CPU; el cuello de botella probable es el bucle del entorno y el renderizado, no la inferencia de la política.
- Despliegue: PyTorch con el entorno `uv` del repositorio fuente; no hay soporte publicado para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de checkpoint.
- Latencia y throughput: no disponibles; dependen del entorno, del modo espectador o interactivo y del renderizado, no solo del modelo.
- Entrenamiento: no se especifica hardware utilizado; el tamaño del repositorio es 0,0 GB y el checkpoint es de escala local.

## Comparativa con modelos similares
No se dispone de datos verificables de alternativas equivalentes con parámetros, contexto y rendimiento publicados. La referencia más directa del mismo autor es otro checkpoint del mismo proyecto.

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniStrike selfplay_seed111 | MAPPO, actor MLP 2x128, self-play, semilla 111 | No disponible | No aplica; 384 entradas estructuradas | Evaluación pendiente | MIT | HuggingFace |
| BurnyCoder/ministrike-selfplay-cpu | Variante del mismo proyecto orientada a CPU | No disponible | No disponible | No disponible | No verificada | HuggingFace |
| Políticas de self-play en entornos 3D | Categoría genérica | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias
- Estado archival DEFERRED, INCOMPLETE: no hay torneo final completado ni afirmación de habilidad táctica.
- Evaluación pendiente: no se publican puntuación media por ronda ni intervalo bootstrap del 95%.
- Presupuesto de frames no completado, lo que limita cualquier conclusión sobre convergencia.
- Experimento local pequeño; las ejecuciones de humo validan el pipeline de aprendizaje, no el rendimiento final.
- No es evidencia de habilidad a nivel humano ni de transferencia a Counter-Strike comercial.
- Un solo mapa, movimiento a nivel de suelo, geometría de cajas, un rifle y objetivos de bomba; no hay generalización a otros mapas o armas.
- Entradas estructuradas, no píxeles; no sirve para visión artificial ni para entornos con observaciones visuales crudas.
- Self-play puro con semilla 111; la condición legada de oponente fijo queda fuera del protocolo Stage A y no debe mezclarse con los resultados de self-play.
- Los intervalos de confianza de una comparación no establecen robustez entre modelos entrenados de forma independiente.
- No es un modelo de lenguaje: no genera texto, código, matemáticas ni respuestas multilingües.
- La licencia MIT permite uso comercial, pero el modelo no está validado para producción y se distribuye sin garantías.
- El checkpoint incluye estado de optimizador, entorno y RNG; cargarlo solo desde fuentes fiables y con la validación weights-only del cargador del proyecto.

## Enlaces
- [HuggingFace: BurnyCoder/ministrike-selfplay-seed111](https://huggingface.co/BurnyCoder/ministrike-selfplay-seed111)
- [Repositorio fuente 3d-firstperson-shooter-reinforcement-learning-selfplay](https://github.com/BurnyCoder/3d-firstperson-shooter-reinforcement-learning-selfplay)
- [Auditoría de aprendizaje](https://github.com/BurnyCoder/3d-firstperson-shooter-reinforcement-learning-selfplay/blob/main/reports/learning-audit/summary.md)
- [Protocolo del proyecto](https://github.com/BurnyCoder/counter-strike-reinforcement-learning-selfplay/blob/main/docs/protocol.md)
- [Informes del proyecto](https://github.com/BurnyCoder/counter-strike-reinforcement-learning-selfplay/tree/main/reports)
- [Tutorial MAPPO de TorchRL](https://docs.pytorch.org/rl/stable/tutorials/multiagent_ppo.html)
- [Paper MAPPO](https://arxiv.org/abs/2103.01955)
- [Paper sobre incertidumbre en evaluación de RL](https://arxiv.org/abs/2108.13264)
- [Modelo relacionado: BurnyCoder/ministrike-selfplay-cpu](https://huggingface.co/BurnyCoder/ministrike-selfplay-cpu)
- [Perfil de GitHub del autor](https://github.com/BurnyCoder/)
