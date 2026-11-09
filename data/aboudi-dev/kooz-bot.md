# aboudi-dev/kooz-bot

## Resumen

kooz-bot es un conjunto de redes neuronales entrenadas para jugar a Estimation, un juego de cartas de bazas para cuatro jugadores. Lo desarrolla el usuario aboudi-dev y se publica como un checkpoint de PyTorch (`final.pt`) que contiene tres redes independientes: BiddingNet (pujas, With, estimaciones y Dash Calls), CardPlayNet (juego de cartas) y GuessNet (inferencia de qué jugador posee cada carta no vista). No es un modelo de lenguaje: es un agente de reinforcement learning específico de dominio, pensado para integrarse en el motor estimation-engine y competir en la arena estimation-arena.

El entrenamiento se realizó desde cero, sin partidas humanas: primero 1.000 partidas PIMC registradas para un arranque en frío del juego de cartas y después 3.000 bucles de self-play contra sí mismo, versiones pasadas, un bot basado en reglas y un PIMC ligero (encoder v3). El coste total declarado es de aproximadamente 10,6 horas en un único portátil, lo que sitúa el proyecto en la categoría de experimento ligero y reproducible más que en la de un sistema de producción a gran escala.

Su relevancia es acotada pero clara para quien trabaje en agentes de juegos de cartas con información imperfecta: demuestra un pipeline completo de self-play con búsqueda híbrida (64 repartos imaginados por carta, colocados por GuessNet y filtrados por la puja) y publica los pesos con hash de verificación. La información disponible sobre licencia, idiomas y benchmarks es prácticamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales PyTorch específicas de dominio (BiddingNet, CardPlayNet, GuessNet); no es un transformer ni un LLM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; el estado es la posición del juego de cartas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`final.pt`, weights only) |
| Pipeline declarado | reinforcement-learning |
| Tamaño del repositorio | 0.0 GB (según Hugging Face) |
| Hash de verificación | sha256 `d4e104148a0a8fe74e56e6c82670fbee8aade0e9163b122316dc4aeab808fda0` |

## Arquitectura y entrenamiento

El checkpoint agrupa tres redes con funciones separadas dentro de un agente de juego de bazas: BiddingNet estima la puja, el valor de With, las estimaciones por jugador y cuándo declarar un Dash Call; CardPlayNet elige la carta a jugar; y GuessNet infiere la distribución de las cartas no vistas entre los jugadores. La arquitectura interna de cada red (número de capas, dimensión de embeddings, mecanismo de codificación del estado) no se detalla en la información disponible; el autor solo indica que se entrenaron desde cero con PyTorch y que el encoder del PIMC de referencia es la versión 3.

El entrenamiento combina dos fases: un arranque en frío con 1.000 partidas PIMC registradas para CardPlayNet y, a continuación, 3.000 iteraciones de self-play con una mezcla de oponentes (el propio agente, versiones anteriores, un bot basado en reglas y un PIMC ligero). En inferencia, el agente no usa las redes de forma aislada: emplea la búsqueda híbrida de estimation-engine, que genera 64 repartos imaginados por carta, los coloca con GuessNet, los mantiene condicionados por la puja y busca todas las cartas legales; el Dash Call solo se activa cuando BiddingNet lo valora en +10 puntos o más. No se menciona RLHF, DPO ni decodificación especulativa, lógicamente fuera del ámbito de este modelo.

## Capacidades

- Juego de Estimation a cuatro jugadores: puja, selección de triunfo (With), asignación de estimaciones por jugador y declaración de Dash Calls.
- Juego de cartas con planificación mediante búsqueda híbrida sobre 64 repartos imaginados por decisión.
- Inferencia de cartas ocultas: GuessNet estima qué jugador posee cada carta no vista.
- Self-play y entrenamiento por refuerzo con mezcla de oponentes (versiones pasadas, bot de reglas, PIMC ligero).
- Integración con el motor estimation-engine y con la arena estimation-arena.
- No soporta tool calling, function calling, agentes multi-paso genéricos, visión, audio ni capacidades multilingües; su alcance es exclusivamente el juego de cartas.

## Casos de uso

- Investigación en juegos de información imperfecta: sirve como referencia reproducible de un pipeline de self-play con búsqueda PIMC híbrida para juegos de bazas, con un coste de entrenamiento de unas 10,6 horas en un portátil.
- Benchmark de agentes en estimation-arena: permite medir el rendimiento de un agente neuronal frente a bots de reglas y PIMC ligeros dentro de la misma arena.
- Desarrollo de motores de juego: los pesos pueden usarse para validar la implementación de estimation-engine (codificación del estado, reglas de puja y Dash Call) antes de escalar a otros modelos.
- Docencia y divulgación: ejemplo compacto de separación de responsabilidades en un agente (puja, juego de cartas e inferencia de cartas ocultas) con tres redes entrenadas conjuntamente.
- Punto de partida para fine-tuning: al ser un checkpoint pequeño en PyTorch, se puede reentrenar o continuar el self-play con oponentes más fuertes o variantes de reglas.
- Análisis de estrategia: GuessNet y BiddingNet permiten estudiar empíricamente cómo un agente valora el riesgo en la puja y qué información infiere de las cartas ocultas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye tasas de victoria, Elo ni comparaciones cuantitativas frente a otros agentes de estimation-arena.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB según Hugging Face, lo que sugiere un modelo muy pequeño, pero no se especifica el tamaño real de `final.pt`.
- GPU recomendadas: no disponible. El entrenamiento se completó en un portátil en unas 10,6 horas, lo que indica que la inferencia es viable en CPU o en GPU de gama baja.
- ¿Cabe en GPU de consumo? Muy probablemente sí, dado el tamaño declarado del repositorio y el hardware de entrenamiento, aunque no hay cifras oficiales.
- Opciones de despliegue: PyTorch con estimation-engine; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kooz-bot | Agente RL para Estimation (3 redes PyTorch) | no disponible | no aplica | no disponible | Hugging Face, weights only |
| Bot basado en reglas (mencionado como oponente) | Heurístico | no aplica | no aplica | no disponible | Incluido en estimation-arena |
| PIMC ligero encoder v3 (mencionado como oponente) | Búsqueda + simulación | no aplica | no aplica | no disponible | Incluido en estimation-arena |
| Versiones pasadas de kooz-bot | Agentes RL previos | no disponible | no aplica | no disponible | No publicadas como checkpoints |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Ámbito muy restringido: solo juega a Estimation a cuatro jugadores; no es un modelo de propósito general ni un LLM.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su fuerza frente a otros agentes, solo la descripción del proceso de entrenamiento.
- Entrenamiento ligero (10,6 horas en un portátil, 3.000 bucles de self-play): es probable que su nivel quede por debajo de agentes con más cómputo o con datos humanos, aunque no hay mediciones que lo confirmen.
- Dependencia del motor: el comportamiento final depende de estimation-engine y de su búsqueda híbrida; usar los pesos fuera de ese motor puede degradar el rendimiento.
- Riesgo de sobreajuste al ecosistema de oponentes del self-play (bot de reglas y PIMC ligero): frente a oponentes distintos, el rendimiento podría no generalizar.
- Documentación mínima: no se detalla la arquitectura interna, el número de parámetros ni los hiperparámetros, lo que dificulta la reproducibilidad.
- Fecha de creación futura en la ficha de Hugging Face (2026-11-09): conviene verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aboudi-dev/kooz-bot
- Repositorio estimation-arena: https://github.com/essamgouda97/estimation-arena
- No se han encontrado papers, blogs, demos ni otros repositorios en la información disponible.
