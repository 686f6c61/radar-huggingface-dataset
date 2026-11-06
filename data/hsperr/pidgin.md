# hsperr/pidgin

## Resumen

Pidgin es una colección de pesos para agentes de bridge (contract bridge) entrenados mediante self-play y aprendizaje por refuerzo, publicada por el desarrollador hsperr. No se trata de un modelo de lenguaje, sino de un conjunto de redes neuronales especializadas en dos tareas concretas del juego: la subasta (bidding) y el juego de cartas (card play). El repositorio de Hugging Face solo aloja los pesos; el código, las recetas de entrenamiento y el servidor de inferencia viven en el repositorio de GitHub del proyecto.

El paquete incluye cuatro equipos completos de bots (PidginV1, BRL, PidginV2 y PidginV3.1), cada uno con su modelo de subasta y su modelo de juego de cartas asociado, además de una red de creencias (belief net) para la búsqueda durante la subasta y un benchmark congelado de juego de cartas. El tamaño del repositorio es de 0,4 GB, lo que refleja que son redes compactas orientadas a inferencia en tiempo real y no modelos de gran escala.

Su relevancia radica en que el bridge es uno de los juegos de cartas con información imperfecta más complejos que existen, con un espacio de estados enorme y comunicación parcial entre compañeros. Pidgin ofrece un conjunto reproducible de pesos y herramientas para desplegar bots competitivos, investigar en RL aplicado a juegos y comparar estrategias de subasta y juego de cartas bajo una licencia permisiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Redes neuronales para RL y self-play (arquitectura concreta no especificada en la información disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (no aplica a un modelo de juego) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch) y `.npz` (NumPy) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de las redes (número de capas, dimensión de las representaciones, tipo de encoder del estado del juego). Lo que sí se documenta es el paradigma de entrenamiento: aprendizaje por refuerzo mediante self-play, con equipos entrenados en distintas configuraciones y volúmenes de pasos, tal como reflejan los identificadores de los ficheros (`s75k`, `s40000`, `s20000`, `s540k`). Esto sugiere que los modelos de subasta y de juego de cartas se entrenaron por separado y con presupuestos de cómputo distintos.

El paquete incorpora una red de creencias (`belief_r2.pt`) utilizada durante la búsqueda en la fase de subasta, lo que apunta a un enfoque de búsqueda con modelado de la incertidumbre sobre las manos ocultas de los oponentes y del compañero. También se incluye `bench_100k.npz`, un benchmark congelado de juego de cartas que permite evaluar y comparar los modelos de forma reproducible. El modelo `brl_fsp_weights.npz` no es del autor: es el subastador FSP de Kita et al. (2024), redistribuido bajo su licencia Apache-2.0.

## Capacidades

- Subasta de bridge: los modelos de bidding generan secuencias de subasta dado el estado de la puja y la mano propia.
- Juego de cartas: los modelos de card play seleccionan la carta a jugar en cada baza.
- Self-play competitivo: los equipos están entrenados para jugar contra sí mismos y contra otras configuraciones.
- Búsqueda con modelado de creencias: la belief net permite razonar sobre la distribución probable de cartas ocultas durante la subasta.
- Evaluación reproducible: el benchmark congelado `bench_100k.npz` permite medir el rendimiento de forma estandarizada.
- Despliegue como servidor: el repositorio incluye `scripts/serve.sh` para levantar un servidor de inferencia.
- Interfaz de línea de comandos: `scripts/bid.py` permite consultar la subasta para una mano concreta.
- No soporta tool calling, agentes genéricos, visión, audio ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Investigación en RL aplicado a juegos de información imperfecta: los pesos y el benchmark congelado permiten reproducir experimentos de self-play y comparar variantes de entrenamiento sin reentrenar desde cero.
- Desarrollo de bots de bridge para competición o práctica: los equipos PidginV1, PidginV2, PidginV3.1 y BRL pueden desplegarse mediante el servidor incluido para jugar partidas completas.
- Análisis de estrategia de subasta: usando `scripts/bid.py` con una mano y una secuencia de subasta, se puede estudiar qué propone el modelo en situaciones concretas y compararlo con sistemas convencionales.
- Evaluación comparativa de subastadores: el par bidding/card play se puede intercambiar entre equipos (por ejemplo, el subastador de PidginV3.1 con el juego de cartas de B2g) para aislar el rendimiento de cada componente.
- Docencia y divulgación sobre bridge: el servidor permite montar demostraciones interactivas donde un humano juega contra los bots con una configuración reproducible.
- Benchmarking de nuevas propuestas: investigadores que desarrollen sus propios agentes pueden usar `bench_100k.npz` como referencia fija para medir mejoras en el juego de cartas.
- Integración en plataformas de bridge online: el servidor de inferencia puede actuar como backend de bots para mesas de práctica, siempre que se respete la licencia Apache-2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye un benchmark congelado (`bench_100k.npz`) que permite evaluar los modelos, pero no se proporcionan cifras de rendimiento (por ejemplo, IMPs o matchpoints frente a otros bots) en la documentación consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo pesa 0,4 GB, por lo que cada red individual es previsiblemente muy pequeña y cabe en GPUs de gama baja o incluso en CPU.
- GPU recomendadas: no especificadas en la información disponible. Dado el tamaño del paquete, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente; también es plausible la inferencia en CPU.
- ¿Cabe en GPU consumer? Sí, con alta probabilidad, dado el tamaño del repositorio; no se confirma una configuración mínima concreta.
- Opciones de despliegue: servidor propio incluido en el repositorio (`scripts/serve.sh`) y scripts de línea de comandos (`scripts/bid.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Componentes | Licencia | Disponibilidad |
|---|---|---|---|---|
| Pidgin (hsperr) | Bots de bridge por self-play | 4 equipos (subasta + juego de cartas), belief net, benchmark | Apache-2.0 | Pesos en Hugging Face, código en GitHub |
| BRL (Kita et al., 2024) | Subastador FSP | Subastador FSP (`brl_fsp_weights.npz`) | Apache-2.0 | Redistribuido dentro de Pidgin |
| Otros agentes de bridge | no disponible | no disponible | no disponible | no disponible |

La información disponible no permite comparar parámetros, contexto ni rendimiento con otras alternativas, ya que no se publican cifras de benchmarks ni detalles arquitectónicos de los modelos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas generales ni soporta tool calling, agentes genéricos, visión o audio.
- Especialización estrecha: solo cubre subasta y juego de cartas de bridge; cualquier otro dominio queda fuera de su alcance.
- Sesgos de entrenamiento: al entrenarse por self-play, los bots pueden desarrollar estrategias no convencionales o explotar peculiaridades de su propio entorno de entrenamiento, lo que puede reducir su rendimiento frente a oponentes humanos o sistemas con convenciones estándar.
- Dependencia del código externo: los pesos solo son útiles junto con el repositorio de GitHub; la documentación de Hugging Face no detalla la arquitectura ni los hiperparámetros.
- Procedencia mixta: `brl_fsp_weights.npz` pertenece a Kita et al. (2024) y se redistribuye bajo su propia licencia (`brl_LICENSE`); conviene revisarla antes de un uso comercial.
- Licencia Apache-2.0: permite uso comercial, pero exige conservar los avisos de copyright y licencia; no se documentan restricciones adicionales.
- Idiomas: no aplica, pero tampoco se documenta soporte para convenciones de subasta específicas por país o sistema.
- Sin cifras de rendimiento publicadas: no hay evidencia en la información disponible sobre su fuerza relativa frente a otros bots o jugadores humanos.
- Fecha de creación futura en los metadatos (2026): conviene verificar la vigencia y el mantenimiento del repositorio antes de integrarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/hsperr/pidgin
- Repositorio GitHub: https://github.com/hsperr/pidgin
- Referencia del subastador FSP: Kita et al. (2024), redistribuido en el repositorio bajo licencia Apache-2.0 (fichero `brl_LICENSE`)
