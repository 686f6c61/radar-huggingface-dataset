# ansh-k03/chaturangazero-500

## Resumen

ChaturangaZero es un modelo de reinforcement learning basado en el algoritmo AlphaZero, desarrollado por el usuario ansh-k03, aplicado al juego de Chaturanga (la variante historica del ajedrez originaria de la India). El modelo no es un LLM ni un modelo de lenguaje: es una red neuronal convolucional residual entrenada mediante self-play y busqueda MCTS para jugar a este juego de tablero. El repositorio documenta un run de 500 iteraciones de entrenamiento ejecutado en CPU de Azure, con una release posterior de 1.500 iteraciones.

La red es deliberadamente compacta: 5 bloques residuales, 64 canales y 514.449 parametros totales. El entrenamiento completo se realizo en CPU, lo que lo convierte en un caso de estudio interesante sobre viabilidad de AlphaZero en hardware modesto. El autor publica no solo los pesos, sino tambien el arbol de codigo fuente modificado, la configuracion, el replay buffer, los logs y un mecanismo de promocion estadistica entre checkpoints.

El interes actual del modelo es metodologico y educativo: documenta un pipeline reproducible de AlphaZero con control estadistico de promociones (test de sign-flip pareado), exportacion completa del entorno de entrenamiento y continuacion del run hasta 1.500 iteraciones. No compite con motores de ajedrez de proposito general ni con LLMs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal residual convolucional (estilo AlphaZero), 5 bloques residuales, 64 canales |
| Parametros totales | 514.449 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: representacion del tablero de Chaturanga) |
| Tipos de cuantizacion | no disponible (pesos PyTorch en punto flotante) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`), checkpoints por iteracion |
| Tamano del repo | 5,4 GB |
| Libreria | PyTorch (CPU) |
| Algoritmo de busqueda | MCTS, 40 simulaciones por movimiento |
| Self-play | 32 partidas por iteracion |

## Arquitectura y entrenamiento

La red sigue el esquema clasico de AlphaZero: una torre de bloques residuales convolucionales con 64 canales que produce dos cabezas, una de politica (distribucion sobre movimientos legales) y otra de valor (evaluacion escalar de la posicion). Con 5 bloques y 514.449 parametros, es un modelo muy pequeno, disenado para entrenar en CPU en lugar de GPU. La busqueda se realiza con MCTS a 40 simulaciones por movimiento, y el entrenamiento genera 32 partidas de self-play por iteracion.

El run documentado completa 500 iteraciones con `checkpoint_0499.pt` como mejor modelo (indexacion base cero). Cada 10 iteraciones se ejecuta una arena de promocion de 40 partidas con intercambio de colores en las aperturas; un candidato asciende si obtiene una puntuacion mayor o igual al 55% y un p-valor unilateral exacto de sign-flip inferior a 0,05. En la iteracion 500 frente al incumbente de la 400, el resultado fue 11 victorias, 26 tablas y 3 derrotas (60% de puntuacion, p=0,015625). El export `training-export.tar.gz` incluye los 500 checkpoints, el replay buffer, los resultados de evaluacion, el codigo fuente modificado, la configuracion y los logs, excluyendo credenciales y ficheros del sistema operativo.

## Capacidades

- Juego de Chaturanga mediante busqueda MCTS guiada por la red de politica y valor.
- Evaluacion de posiciones a traves de la cabeza de valor.
- Generacion de distribuciones de probabilidad sobre movimientos legales.
- Entrenamiento continuado a partir de checkpoints (`--resume auto`).
- Promocion estadistica de checkpoints con test de sign-flip pareado.
- Reproducibilidad completa del pipeline de entrenamiento (codigo, configuracion, logs y buffer incluidos).
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Investigacion educativa sobre AlphaZero: el repositorio permite reproducir un pipeline completo de self-play y MCTS en CPU, util para cursos y laboratorios que no disponen de GPU.
- Estudio de control estadistico en RL: el mecanismo de promocion con p-valor pareado sirve como ejemplo de evaluacion rigurosa de candidatos en entrenamiento por refuerzo.
- Desarrollo de motores para variantes del ajedrez: la red y el codigo pueden adaptarse a otras variantes historicas o regionales cambiando las reglas del entorno.
- Benchmarking de eficiencia en CPU: con 514.449 parametros y 40 simulaciones MCTS por movimiento, es un caso de referencia para medir latencia de inferencia en hardware modesto.
- Base para comparativas de algoritmos de busqueda: permite sustituir MCTS por otras busquedas y medir el impacto en fuerza de juego con la misma red.
- Reproduccion de experimentos de RL: el export completo con replay buffer y logs facilita auditorias y replicaciones academicas.
- Punto de partida para escalado: la release de 1.500 iteraciones y las continuaciones a 1.000 permiten estudiar curvas de aprendizaje a mayor presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento proporcionado es la arena de promocion: iteracion 500 frente a iteracion 400, con 11 victorias, 26 tablas y 3 derrotas (60% de puntuacion, p=0,015625) en 40 partidas.

## Requisitos de hardware

- Inferencia en CPU: el entrenamiento y la inferencia documentados se ejecutaron en CPU de Azure; el modelo esta pensado para funcionar sin GPU.
- VRAM estimada: no aplica en el flujo documentado; con 514.449 parametros, los pesos ocupan del orden de megabytes, muy por debajo de cualquier GPU consumer.
- GPU recomendadas: no disponibles; cualquier GPU con soporte PyTorch puede alojar el modelo, pero no se documenta un flujo GPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU dedicada.
- Opciones de despliegue: PyTorch en CPU con el arbol de codigo `opt/chaturangazero`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; dependen del numero de simulaciones MCTS (40 por movimiento en la configuracion documentada).

## Comparativa con modelos similares

| Modelo | Parametros | Dominio | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChaturangaZero 500 | 514.449 | Chaturanga | AlphaZero, CPU, 500 iteraciones | no disponible | Hugging Face |
| AlphaZero (DeepMind) | no disponible | Ajedrez, shogi, go | AlphaZero, TPU a gran escala | no disponible (no publicado) | no disponible |
| Leela Chess Zero | no disponible | Ajedrez | AlphaZero, distribuido | GPL (codigo) | Publico |
| Modelos comparables de Chaturanga | no disponible | Chaturanga | no disponible | no disponible | no disponible |

No se dispone de datos publicados de benchmarks que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni responde a instrucciones en lenguaje natural.
- Dominio restringido exclusivamente al juego de Chaturanga; no es transferible directamente a ajedrez estandar sin reentrenamiento.
- La red es muy pequena (514.449 parametros) y el presupuesto de busqueda es bajo (40 simulaciones por movimiento), lo que limita la fuerza de juego frente a motores convencionales.
- La licencia no esta disponible, por lo que no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de sobreajuste al estilo de self-play del propio modelo; la evaluacion se limita a arenas internas contra checkpoints anteriores.
- Los resultados de promocion se basan en 40 partidas, muestra reducida que puede producir alta varianza pese al control estadistico.
- El repositorio es grande (5,4 GB) por incluir checkpoints, replay buffer y logs; la descarga completa puede ser costosa.
- No hay garantias de mantenimiento ni soporte; el proyecto tiene 0 descargas y 0 likes en el momento de la consulta.
- Fechas de creacion y actualizacion del repositorio (2026) no verificables de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ansh-k03/chaturangazero-500
- Release de 1.500 iteraciones: https://huggingface.co/ansh-k03/chaturangazero-500/tree/main/run-1500
- Checkpoint best de la iteracion 1.350: https://huggingface.co/ansh-k03/chaturangazero-500/blob/main/run-1500/best.pt
- Release de 1.000 iteraciones: https://huggingface.co/ansh-k03/chaturangazero-500/tree/main/run-1000
- Codigo fuente: https://github.com/AditeyaAItronics/chaturangazero
- Revision base: e9fab9d1eec2a5a105737a2cc631990b01a9131b
