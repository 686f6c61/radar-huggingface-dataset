# BertilBraun/alphazero-chess

## Resumen

El modelo `BertilBraun/alphazero-chess` es un motor de ajedrez basado en redes neuronales entrenado con aprendizaje por refuerzo profundo siguiendo la metodología AlphaZero. Fue desarrollado por BertilBraun como parte de un proyecto personal de implementación de técnicas avanzadas de motores de ajedrez. El modelo aprende a jugar únicamente mediante auto-juego, sin conocimiento humano previo, combinando una red neuronal convolucional residual con búsqueda Monte Carlo (MCTS). El repositorio contiene artefactos de un entrenamiento de cuatro días en 8 GPU RTX 3060, con una arquitectura de 12 capas y 112 canales ocultos. Está disponible en formato TorchScript y PyTorch, y se ha desplegado en plataformas como Lichess e inferencia web. Su relevancia radica en demostrar que es posible alcanzar un nivel de juego competitivo (Elo estimado entre 1.954 y 2.821 según presupuesto de búsqueda) con recursos modestos y una arquitectura compacta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional residual (12 capas, hidden size 112, canales de política 4, canales de valor 2, FC de valor 48, pooling global residual cada dos bloques) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de ajedrez, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el ajedrez es independiente del idioma) |
| Licencia | no disponible |
| Formato de pesos | TorchScript (`latest.jit.pt`) y PyTorch (`latest.pt`) |

## Arquitectura y entrenamiento

La red neuronal es una CNN residual con 12 capas, canales de 112, y una cabeza de política con 4 canales y una cabeza de valor con 2 canales más una capa fully connected de 48 unidades. Se emplea pooling global residual insertado cada dos bloques para capturar contexto global. El entrenamiento se realizó con el optimizador AdamW en precisión BF16, con una tasa de aprendizaje escalonada (0.004 → 0.003 en la generación 350 → 0.002 en la generación 550), gradiente máximo de 0.5, y un tamaño de lote global de 2048. El proceso de auto-juego utilizó MCTS con exploración Dirichlet (ε=0.25, α=0.3), constante de exploración 1.5, y programación de temperatura de 1.3 a 0.1. Se emplearon funciones de pérdida auxiliares para predecir la siguiente política y la longitud restante de la partida, junto con un mecanismo de resignación calibrado. El entrenamiento fue una continuación de la generación 150 de una ejecución anterior, con un total de aproximadamente 96 horas en 8 GPU RTX 3060, 64 vCPUs y 188.7 GiB de RAM.

## Capacidades

- Juego de ajedrez completo: genera movimientos legales y evalúa posiciones mediante la red neuronal combinada con MCTS.
- Evaluación de posiciones: la cabeza de valor produce una estimación escalar de la ventaja posicional.
- Política de movimientos: la cabeza de política distribuye probabilidades sobre movimientos legales.
- Auto-juego y aprendizaje por refuerzo: el modelo puede seguir entrenándose mediante auto-juego (aunque el artefacto publicado es un checkpoint congelado).
- Inferencia eficiente: disponible en formato TorchScript para despliegue ligero en CPU/GPU.
- Integración con plataformas: se ha utilizado en Lichess y en inferencia web según la model card.
- No soporta tool calling, agentes, visión ni lenguaje natural: es un modelo especializado exclusivamente en ajedrez.

## Casos de uso

- Análisis de partidas de ajedrez: el modelo puede evaluar posiciones y sugerir movimientos para análisis post-mortem, integrándose en herramientas de estudio como Lichess o bases de datos de ajedrez.
- Motor de ajedrez embebido: gracias a su tamaño reducido (0.1 GB) y formato TorchScript, puede ejecutarse en aplicaciones de escritorio o móviles para juego contra la máquina.
- Entrenamiento de jugadores: uso como sparring con nivel ajustable mediante el presupuesto de búsqueda (64, 1000 o 10000 búsquedas) para adaptarse al nivel del usuario.
- Investigación en aprendizaje por refuerzo: sirve como referencia de implementación de AlphaZero con recursos modestos, útil para estudiar dinámicas de auto-juego, MCTS y funciones de pérdida auxiliares.
- Generación de datos de entrenamiento: el modelo puede emplearse para generar partidas de alta calidad que alimenten otros sistemas de entrenamiento o bases de datos.
- Benchmarking de hardware: al ser un modelo pequeño, puede utilizarse para medir rendimiento de inferencia en diferentes GPUs o CPUs.
- Desarrollo de variantes de ajedrez: la arquitectura puede adaptarse a otros juegos de tablero (como Tic-Tac-Toe o Shogi) con modificaciones menores, como se demuestra en el repositorio del autor.

## Benchmarks y rendimiento

La model card proporciona estimaciones de Elo en función del presupuesto de búsqueda, obtenidas de partidas de confirmación de cuatro días. Estos valores son referencias operativas calibradas, no afirmaciones universales de fuerza.

| Presupuesto de búsqueda | Elo aproximado | Intervalo de puntuación 95% |
|---|---|---|
| 64 búsquedas | 1.954 (1.912–1.996) | 57.75% [51.75%, 63.50%] |
| 1.000 búsquedas | 2.554 (2.519–2.591) | 57.75% [52.75%, 62.75%] |
| 10.000 búsquedas | 2.821 (2.781–2.864) | 66.75% [61.50%, 72.00%] |
| 1 segundo | 2.69... (dato incompleto en la model card) | no disponible |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no es un LLM sino un motor de ajedrez.

## Requisitos de hardware

- El entrenamiento se realizó en 8 GPU RTX 3060, 64 vCPUs y 188.7 GiB de RAM, con un coste estimado de 44.2 USD por cuatro días.
- Para inferencia, el modelo es muy ligero (0.1 GB), por lo que puede ejecutarse en una GPU consumer (p. ej., RTX 3060 o superior) o incluso en CPU, aunque no se especifican requisitos mínimos exactos.
- El despliegue se ha realizado mediante TorchScript con 2 workers de inferencia, batch size 64 y 2 batches pendientes por worker.
- Opciones de despliegue: TorchScript (recomendado), PyTorch nativo, posible integración con servidores de ajedrez como Lichess.
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente. El modelo es una implementación personal de AlphaZero para ajedrez; alternativas en el mismo dominio incluyen:

- **Leela Chess Zero (Lc0)**: red neuronal de ajedrez de código abierto basada en AlphaZero, con arquitecturas mucho más grandes (cientos de capas) y niveles de Elo superiores a 3500. Licencia GPL-3.0.
- **Stockfish**: motor clásico basado en búsqueda alfa-beta, no neuronal, con Elo superior a 3500. Licencia GPL-3.0.
- **AlphaZero original (DeepMind)**: no público, con 20 bloques residuales y 256 canales, Elo estimado ~3000 en ajedrez.

La comparación no es directa porque este modelo es un experimento de bajo presupuesto; su Elo máximo estimado (2.821) está por debajo de los motores de élite.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en ajedrez: no es un LLM y no puede procesar texto, imágenes ni lenguaje natural.
- Fuerza limitada: el Elo estimado máximo (2.821) es inferior a motores comerciales o de código abierto de alto rendimiento; no apto para competiciones de élite.
- Licencia no especificada: no se indica si el uso comercial está permitido; se recomienda contactar al autor antes de usarlo en productos comerciales.
- Sesgos y alucinaciones: al ser un modelo de ajedrez, no hay riesgo de alucinación textual, pero la evaluación de posiciones puede ser incorrecta en posiciones tácticas complejas o finales teóricos.
- Dependencia del presupuesto de búsqueda: el rendimiento varía drásticamente según el número de búsquedas MCTS; con presupuestos bajos (64 búsquedas) el nivel es modesto (~1954 Elo).
- Datos de entrenamiento no publicados: no se detalla el dataset de auto-juego ni su composición, lo que limita la reproducibilidad.
- El repositorio no incluye código de entrenamiento ni scripts de inferencia; solo los pesos del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BertilBraun/alphazero-chess
- Página del proyecto: https://chess.bertil-braun.de/
- Repositorio GitHub del autor (técnicas avanzadas en motores de ajedrez): https://github.com/BertilBraun/Advanced-Techniques-in-Chess-Engines
- Documentación de DeepWiki sobre el sistema de entrenamiento: https://deepwiki.com/BertilBraun/Advanced-Techniques-in-Chess-Engines/3-core-training-system
- Guía de inicio (DeepWiki): https://deepwiki.com/BertilBraun/Advanced-Techniques-in-Chess-Engines/2-getting-started
