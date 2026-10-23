# BurnyCoder/ministrike-fixed-seed111

## Resumen

`BurnyCoder/ministrike-fixed-seed111` es un checkpoint de aprendizaje por refuerzo, no un modelo de lenguaje. Se trata de una política multiagente entrenada con MAPPO para un prototipo de juego táctico 3D 5v5 (un "Counter-Strike minimalista") desarrollado por Libor Burian en el repositorio `3d-firstperson-shooter-reinforcement-learning-selfplay`. El checkpoint corresponde a la condición de oponente fijo con semilla independiente 111, tras 2.682.880 transiciones de arena y 1.310 actualizaciones, con el presupuesto de frames incompleto.

El modelo es deliberadamente pequeño: un actor compartido con MLP de 2x128 con activación tanh, 384 entradas de observación estructurada limitadas por visibilidad y seis controles categóricos, más un crítico centralizado de 2x256 que solo se usa durante el entrenamiento. La inferencia en juego utiliza únicamente observaciones locales y controles crudos, sin acceso a píxeles.

Su relevancia es fundamentalmente metodológica y de reproducibilidad: el autor publica el estado de archivo como **DEFERRED, INCOMPLETE**, sin torneo final ni evaluación completada, e incluye explícitamente hipótesis fallidas y bots débiles. No es evidencia de habilidad a nivel humano ni de transferencia a Counter-Strike comercial; sirve como artefacto de auditoría de un pipeline de self-play con TorchRL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-crítico para MAPPO (MLP; actor compartido 2x128 tanh, crítico centralizado 2x256) |
| Parametros totales | No publicado; el actor suma aproximadamente 66.566 parámetros (384 -> 128 -> 128 -> 6), el crítico no se detalla |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; 384 entradas de observación con historial limitado por visibilidad |
| Tipos de cuantizacion | No disponible; solo checkpoint PyTorch en precisión de entrenamiento |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch; incluye pesos, estado del optimizador, estado del entorno y RNG) |
| Salidas | 6 controles categóricos discretos |
| Entorno | Un único mapa 3D, movimiento a nivel de suelo, geometría de cajas, un rifle y objetivos de bomba |
| Presupuesto de entrenamiento | 2.682.880 transiciones, 1.310 actualizaciones, semilla 111, condición `fixed`, gamma 0.999 |
| Currículo | 15 / 15 / 70 por ciento para inicios de combate / objetivo / estándar |
| Pipeline de HuggingFace | `reinforcement-learning` |
| Librería | PyTorch (con TorchRL para el entrenamiento) |
| Tamaño del repositorio | 0.0 GB (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El sistema sigue el esquema MAPPO (Multi-Agent PPO) con parámetros compartidos: un actor común con dos capas ocultas de 128 unidades y tanh que recibe 384 valores de observación estructurada (historial limitado por visibilidad) y emite seis logits correspondientes a controles categóricos. Durante el entrenamiento se emplea un crítico centralizado de 2x256 que explota información global; en inferencia, cada bot decide solo con su observación local. El checkpoint almacena además el estado del optimizador, el estado del entorno y los generadores aleatorios, y el cargador del proyecto valida el esquema y usa carga `weights_only`.

El entrenamiento se realizó con condición de oponente fijo y semilla 111, con revisión de código `38697fee4af941b12cfd15489424e2750ef4dd1d`, gamma 0.999 y un currículo de arranques 15/15/70 (combate, objetivo, estándar). El autor advierte que esta condición de oponente fijo queda fuera del protocolo posterior de self-play puro (Stage A). No se documentan en la información disponible el número de tokens (no aplica), la composición del dataset (no aplica, es un entorno simulado) ni fases de RLHF o DPO (no aplica). El presupuesto de frames no se completó y el estado de archivo es diferido e incompleto.

## Capacidades

- Control de agente en un entorno 3D minimalista: movimiento a nivel de suelo, uso de un rifle y objetivos de bomba en un único mapa.
- Política multiagente 5v5 con actor compartido: el mismo conjunto de pesos controla a todos los bots del equipo.
- Toma de decisiones con observaciones estructuradas y limitadas por visibilidad, sin percepción de píxeles.
- Modo espectador y modo de juego interactivo en el repositorio fuente (`csrl watch --first-person`, `csrl play`), con selección de bot con Tab, cambio de cámara con V y toma o cesión de control con F sin reiniciar la ronda.
- Reproducibilidad de un episodio de entrenamiento concreto gracias al almacenamiento de RNG y estado del entorno en el checkpoint.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, visión por imágenes, audio ni capacidades multilingües: no es un modelo de lenguaje ni un modelo multimodal.

## Casos de uso

- Reproducción de experimentos de MAPPO: cargar `model.pt` con el entorno `uv` bloqueado del repositorio y repetir la evaluación de la condición fija con semilla 111 para comparar con `initial.pt`.
- Baseline en investigación de self-play: usar este checkpoint como punto de partida (política inicial congelada) al estudiar el protocolo posterior de self-play puro.
- Docencia de RL multiagente: ilustrar la diferencia entre actor local y crítico centralizado en un entorno 3D pequeño y ejecutable en CPU.
- Auditoría de pipelines de evaluación: el autor publica intervalos bootstrap de pares de semillas y desgloses por lado y oponente, lo que permite practicar análisis de incertidumbre con datos reales (aunque los valores están pendientes).
- Depuración de infraestructura de simulación: el modo `watch` con cámara en primera persona y toma de control manual sirve para inspeccionar comportamiento emergente y detectar fallos del entorno.
- Estudio de currículos de entrenamiento: la configuración 15/15/70 permite reproducir y modificar la mezcla de arranques de combate, objetivo y estándar.
- Prototipado de agentes para entornos con observaciones estructuradas: sirve como plantilla de red pequeña (decenas de miles de parámetros) para tareas de control discreto con requisitos de cómputo mínimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación está pendiente y que no existe afirmación de habilidad táctica ni torneo final completado.

| Metrica | Estado | Valor |
|---|---|---|
| Puntuación media por ronda | Pendiente | No disponible |
| Intervalo bootstrap del 95 por ciento (pares de semillas) | Pendiente | No disponible |
| Torneo final | No completado | No disponible |
| Presupuesto de frames | Incompleto (`False`) | 2.682.880 transiciones registradas |
| Comparación con `initial.pt` | Pendiente | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el actor ronda los 66.566 parámetros (unos 266 KB en float32), por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU. Cualquier GPU moderna (RTX 3060 o superior, A100, H100) es sobredimensionada para la inferencia; el entrenamiento original es igualmente ligero.
- Cabe en GPU consumer: sí, en cualquier modelo, y también en CPU sin aceleración.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI. El despliegue se realiza con el entorno `uv` del repositorio fuente y los comandos `uv run csrl watch --checkpoint artifacts/models/fixed_seed111/model.pt` y `uv run csrl play --checkpoint artifacts/models/fixed_seed111/model.pt` (PowerShell en la documentación).
- Latencia y throughput: no disponibles. Al ser un MLP de dos capas, la latencia por decisión está dominada por el bucle de simulación, no por la inferencia.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos públicos comparables (políticas RL publicadas para FPS tácticos 5v5 con especificaciones verificables). La comparación posible se limita a los dos checkpoints del mismo repositorio.

| Modelo | Arquitectura | Parámetros | Contexto / entradas | Estado de evaluación | Licencia |
|---|---|---|---|---|---|
| `ministrike-fixed-seed111` (este) | MAPPO, actor 2x128 tanh + crítico 2x256 | No publicado (~66.566 en el actor) | 384 entradas estructuradas | Pendiente, archivo incompleto | MIT |
| `initial.pt` (mismo repo) | Idéntica | Idénticos | 384 entradas estructuradas | Baseline sin entrenar | MIT |
| Otras políticas RL para FPS | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Estado de archivo declarado como DEFERRED, INCOMPLETE: no hay torneo final, ni puntuación media, ni intervalo de confianza calculados.
- El propio autor indica que no es evidencia de habilidad a nivel humano ni de transferencia a Counter-Strike comercial; las ejecuciones de humo solo validan el pipeline.
- La condición de oponente fijo queda fuera del protocolo posterior de self-play puro (Stage A), por lo que los resultados no son directamente comparables con revisiones posteriores del proyecto.
- Entorno muy restringido: un único mapa, movimiento a nivel de suelo, geometría de cajas, un solo rifle y objetivos de bomba. No hay generalización a otros mapas ni a otros juegos.
- Entradas estructuradas, no píxeles: no es un modelo de visión y no puede procesar imágenes en bruto.
- El repositorio en HuggingFace reporta 0.0 GB de tamaño, lo que sugiere que los pesos podrían no estar efectivamente alojados; conviene verificar la descarga antes de planificar su uso.
- Riesgo de alucinación: no aplica (no genera texto). El riesgo equivalente es comportamiento errático o explotación de fallos del simulador.
- Sesgos conocidos: no documentados; en RL multiagente es esperable un ajuste excesivo a los oponentes concretos del currículo de entrenamiento.
- Licencia MIT permite uso comercial y modificación, pero el autor no ofrece ninguna garantía de rendimiento ni de idoneidad para producción.
- Los resultados negativos e hipótesis fallidas se publican deliberadamente; deben leerse como parte del estado real del artefacto, no como incidencias aisladas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BurnyCoder/ministrike-fixed-seed111
- Repositorio fuente principal: https://github.com/BurnyCoder/3d-firstperson-shooter-reinforcement-learning-selfplay
- Auditoría de aprendizaje (resumen): https://github.com/BurnyCoder/3d-firstperson-shooter-reinforcement-learning-selfplay/blob/main/reports/learning-audit/summary.md
- Protocolo del proyecto (referenciado en la model card): https://github.com/BurnyCoder/counter-strike-reinforcement-learning-selfplay/blob/main/docs/protocol.md
- Informes del proyecto: https://github.com/BurnyCoder/counter-strike-reinforcement-learning-selfplay/tree/main/reports
- Tutorial de MAPPO en TorchRL: https://docs.pytorch.org/rl/stable/tutorials/multiagent_ppo.html
- Paper MAPPO (arXiv:2103.01955): https://arxiv.org/abs/2103.01955
- Paper sobre incertidumbre en evaluación de RL (arXiv:2108.13264): https://arxiv.org/abs/2108.13264
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos por el buscador no guardan relación con este artefacto.
