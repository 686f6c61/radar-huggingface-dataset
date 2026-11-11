# amanDS5153/ChessTwin

## Resumen

ChessTwin es una red neuronal de política orientada a imitar el estilo de juego de un jugador concreto de ajedrez (Aman, con una puntuación aproximada de 2400 en Lichess bullet). No se trata de un motor de ajedrez que busque la jugada óptima, sino de un modelo de clonación de comportamiento que predice qué movimiento haría ese jugador humano en una posición dada. Lo desarrolla amanDS5153 y se distribuye con licencia MIT.

Arquitectónicamente es una ResNet de 6 bloques y 64 canales que opera como red de política sobre un vocabulario de movimientos. Se entrenó en dos fases: un preentrenamiento sobre 5,2 millones de posiciones de partidas bullet de Lichess con Elo entre 2150 y 2650, seguido de un ajuste fino sobre 1,3 millones de posiciones de las propias partidas del jugador objetivo. El modelo desplegado (`finetuned.pt`) alcanza un 47,68 % de Top-1 y un 75,42 % de Top-3 en 5000 posiciones reservadas de las partidas de Aman.

Su relevancia es acotada pero clara: demuestra un flujo completo de clonación de estilo en ajedrez con recursos modestos (repo de 0,1 GB), sirve como base para investigación en modelado de comportamiento humano y está integrado en un bot activo en Lichess (ChessTwinBot). No es un modelo de lenguaje ni un motor de ajedrez de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet (red de política), 6 bloques, 64 canales |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada: una posición de ajedrez) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (dominio ajedrez, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch, dict con `model_state_dict`, `vocab_size`, `config`) |

## Arquitectura y entrenamiento

El modelo es una red neuronal residual (ResNet) de 6 bloques con 64 canales por bloque, configurada como red de política que produce una distribución sobre un vocabulario de movimientos (`move_vocab.json`). La entrada es la representación de una posición de ajedrez y la salida, la probabilidad de cada movimiento legal del vocabulario. No incorpora búsqueda, evaluación de posición ni módulo de valor: es puramente imitación supervisada.

El entrenamiento se divide en dos etapas. Primero, un preentrenamiento sobre 5,2 millones de posiciones extraídas de partidas bullet de Lichess con Elo entre 2150 y 2650, que captura el estilo general de juego bullet humano de alto nivel. Después, un ajuste fino sobre 1,3 millones de posiciones de las partidas del propio Aman, que especializa el modelo hacia su estilo individual. La model card documenta experimentos adicionales no desplegados: un ajuste con tasa de aprendizaje 2e-4 que degradó el rendimiento en la apertura catalana, y un pase centrado solo en aperturas que perdió 1,8 puntos porcentuales en el cómputo global. No se mencionan RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Predicción de movimientos de ajedrez: dado un estado de tablero, devuelve una distribución de probabilidad sobre los movimientos del vocabulario.
- Clonación de estilo: reproduce las preferencias y sesgos de un jugador humano concreto (Aman, ~2400 Lichess bullet), no la jugada óptima.
- Ranking de movimientos: permite extraer Top-1 y Top-3 candidatos para una posición.
- Juego en vivo: desplegado como bot en Lichess (ChessTwinBot).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de lenguaje natural.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Clonación de estilo para entrenamiento: un jugador puede generar un modelo que prediga sus propias jugadas y usarlo para analizar patrones recurrentes en su repertorio de aperturas y medio juego.
- Bot de sparring personalizado: integrado en Lichess como ChessTwinBot, permite a otros jugadores enfrentarse a una imitación de un jugador de ~2400 de bullet en lugar de a un motor.
- Investigación en modelado de comportamiento: sirve como caso de estudio reproducible de clonación de comportamiento con preentrenamiento general y ajuste fino individual, con registro completo de experimentos en el repositorio de GitHub.
- Análisis de sesgos de estilo: comparando `pretrained.pt` (juego humano general de 2150-2650) con `finetuned.pt` (estilo de Aman), se pueden aislar las desviaciones idiosincrásicas del jugador frente a la población de su nivel.
- Generación de datasets sintéticos de partidas: el modelo puede generar partidas con un sesgo de estilo controlado para aumentar datos de entrenamiento de otros modelos de ajedrez.
- Evaluación de aperturas: el pase de solo aperturas (aunque no desplegado) muestra que el modelo puede adaptarse a fases concretas; permite estudiar qué movimientos de apertura son característicos del jugador.

## Benchmarks y rendimiento

Resultados sobre 5000 posiciones reservadas de las partidas de Aman:

| Modelo | Top-1 | Top-3 |
|---|---|---|
| Movimiento legal aleatorio | 7,08 % | — |
| Mejor movimiento de Stockfish | 37,68 % | — |
| `pretrained.pt` | 41,84 % | 70,38 % |
| `finetuned.pt` (desplegado) | 47,68 % | 75,42 % |

El ajuste fino aporta 5,84 puntos porcentuales de Top-1 y 5,04 de Top-3 sobre el preentrenamiento. El modelo supera en Top-1 al mejor movimiento de Stockfish como predictor del movimiento humano, lo que es esperable al tratarse de una tarea de imitación y no de optimalidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repo (0,1 GB) y la arquitectura (6 bloques, 64 canales), es un modelo muy ligero que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; cualquier GPU con soporte PyTorch es suficiente, incluidas GTX 1060, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: PyTorch nativo; carga mediante `PolicyNetwork.from_config(ckpt["config"], ckpt["vocab_size"])` del repositorio de GitHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ChessTwin | ResNet de política (clonación de estilo) | no disponible | no disponible | Top-1 47,68 % en posiciones de Aman | MIT | Hugging Face + GitHub |
| Maia | Red neuronal de ajedrez humano | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| Stockfish | Motor de ajedrez clásico | no disponible | no disponible | Mejor movimiento; Top-1 37,68 % como predictor humano | GPL | Amplia |

La comparación con Maia es pertinente porque el propio modelo se etiqueta con `maia` y comparte el enfoque de predecir movimientos humanos; sin embargo, no se dispone de sus cifras en la información proporcionada. Stockfish no es un modelo de imitación sino un motor de búsqueda, por lo que la comparación es solo referencial.

## Limitaciones y advertencias

- Sesgo de jugador único: el modelo desplegado está especializado en el estilo de Aman; no generaliza a otros jugadores ni a otros niveles.
- Sesgo de formato: entrenado exclusivamente con partidas bullet de Lichess en el rango 2150-2650; su comportamiento fuera de ese contexto (blitz, clásicas, otros ritmos) no está validado.
- Riesgo de movimientos ilegales: al ser una red de política sin verificación explícita, la salida debe filtrarse contra los movimientos legales de la posición.
- Alucinación en sentido amplio: puede asignar alta probabilidad a movimientos que el jugador objetivo no haría, especialmente en posiciones poco representadas en el dataset.
- Idiomas: no aplica; el modelo no procesa lenguaje natural.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo imita el estilo de una persona concreta; el uso comercial del bot o de la identidad clonada puede plantear cuestiones éticas y de imagen que la licencia no cubre.
- Cifras de rendimiento limitadas a 5000 posiciones de un solo jugador; no hay validación cruzada entre jugadores ni evaluación en posiciones fuera de distribución.
- Experimentos no desplegados: el ajuste con lr 2e-4 y el pase de aperturas degradaron el rendimiento, lo que sugiere sensibilidad al ajuste fino y riesgo de sobreajuste.

## Enlaces

- Hugging Face: https://huggingface.co/amanDS5153/ChessTwin
- Repositorio GitHub (código, entrenamiento y registro de experimentos): https://github.com/AmanDataGuy/ChessTwin
- Bot en Lichess: https://lichess.org/@/ChessTwinBot
