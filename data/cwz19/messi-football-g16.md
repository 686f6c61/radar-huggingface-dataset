# cwz19/messi-football-g16

## Resumen

MESSI football g16 es una política de aprendizaje por refuerzo para partidos de fútbol 11 contra 11 en el simulador MESSI (implementado en JAX bajo el nombre `soccerworld`). La desarrolla el usuario cwz19 y se publica con licencia MIT. En cada paso de simulación la política controla un único jugador de su equipo: el jugador de campo más cercano al balón; los otros diez, incluido el portero, son controlados por la IA de reglas del simulador. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino un artefacto de investigación en RL multiagente orientado a un entorno concreto.

El entrenamiento se realizó en tres fases: ajuste supervisado (SFT) sobre la IA de reglas, PPO con acumulación de gradientes y 16 generaciones de PSRO (Policy Space Response Oracles), donde cada generación es una mejor respuesta PPO a la mezcla de Nash de las políticas anteriores. La red es un `TargetNet(hidden=256, n_players=11)` con recurrencia GRU y una ranura de embedding por jugador, que produce 36 salidas por jugador (movimiento, puerta de chut, ocho direcciones de regate, pases y centros a los once compañeros y tres puntos de gol).

Su relevancia es acotada pero clara: sirve como referencia reproducible de entrenamiento PSRO en un dominio multiagente complejo y como oponente o baseline para quien investigue en el simulador MESSI. El repositorio de Hugging Face está vacío en cuanto a tamaño (0.0 GB) y no incluye el código necesario para ejecutar la política, por lo que su utilidad práctica inmediata es limitada sin el pipeline externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal `TargetNet(hidden=256, n_players=11)` con recurrencia GRU y slot embedding por jugador (Flax/JAX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de RL por paso de simulación; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en flax msgpack, sin variantes GGUF u otras) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | flax msgpack (`policy.msgpack` con `params` y `critic`) |

## Arquitectura y entrenamiento

La política se basa en una red `TargetNet` con dimensión oculta de 256 y 11 ranuras, una por jugador del equipo. Como entrada recibe la observación de cada uno de los 11 jugadores propios, sus affordances y las 10 características de fútbol de cada objetivo de pase. La recurrencia se implementa con una GRU y un embedding por ranura de jugador, lo que permite mantener estado temporal por jugador a lo largo de la simulación. La salida por jugador tiene 36 dimensiones: movimiento bidimensional con squash tanh, una compuerta de chut, ocho direcciones de regate, un pase raso y un pase bombeado a cada uno de los 11 compañeros, y tres puntos de gol. La función `kick_choice.decode` traduce la elección discreta al vector de chut del motor MESSI, usando la tabla `kick_table.json` con velocidades de lanzamiento y efectos según distancia.

El entrenamiento tuvo tres etapas: primero SFT sobre la IA de reglas del simulador, después PPO con acumulación de gradientes y finalmente 16 generaciones de PSRO. En cada generación PSRO se entrena una mejor respuesta PPO frente a la mezcla de Nash de todas las políticas anteriores, y la mezcla se resuelve a partir de una matriz de pagos de evaluación cruzada sin ruido. El repositorio incluye los argumentos de entrenamiento (`args.json`), la tabla de chuts (`kick_table.json`) y la rejilla de amenaza esperada (`xt.json`) usada para el modelado de recompensa y como entrada del crítico. No se documenta el número de tokens ni la composición del dataset, ya que no se trata de un modelo entrenado sobre corpus textual.

## Capacidades

- Control de un jugador de campo en partidos 11 contra 11 dentro del simulador MESSI, seleccionando en cada paso el jugador más cercano al balón.
- Toma de decisiones de movimiento continuo (dos dimensiones con squash tanh) y regate en ocho direcciones discretas.
- Ejecución de pases rasos y bombeados a cualquiera de los once compañeros, con selección de velocidad y efecto mediante la tabla de chuts.
- Chuts a puerta con tres puntos de gol objetivo y una compuerta dedicada de chut.
- Razonamiento multiagente implícito: la política se entrenó contra generaciones anteriores y contra la IA de reglas, lo que le permite explotar patrones de equipos rivales.
- No soporta tool calling, function calling, agentes basados en lenguaje, capacidades multilingües, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en RL multiagente: usar g16 como oponente de referencia en el simulador MESSI para medir la mejora de nuevas políticas frente a una generación PSRO avanzada, comparando diferencias de goles por partido.
- Estudio de PSRO y mezclas de Nash: analizar la matriz de pagos cruzada entre generaciones para entender cómo evoluciona la explotación entre políticas y validar implementaciones de PSRO en dominios continuos.
- Baseline en competiciones internas de fútbol simulado: emplear la política como rival fijo en torneos de agentes dentro de `soccerworld`, aprovechando su rendimiento medido de +2,61 goles por partido frente a la IA de reglas.
- Análisis de explotación de porteros: dado que la política explota robos de saques cortos del portero rival, sirve para estudiar comportamientos adversarios y diseñar contramedidas en la IA de reglas.
- Docencia y divulgación: ilustrar un pipeline completo de SFT, PPO y PSRO en JAX/Flax con artefactos reproducibles (argumentos, tabla de chuts y rejilla de amenaza esperada).
- Evaluación de robustez de políticas: comparar el rendimiento de g16 contra copias de sí misma (ruido de −0,13 a +0,09 goles) para calibrar umbrales de significación estadística en experimentos con unas 250 partidas por oponente.
- Reutilización de componentes: extraer `kick_table.json` y `xt.json` como recursos independientes para modelado de recompensa o inicialización de críticos en otros experimentos del simulador.

## Benchmarks y rendimiento

Resultados publicados en la model card: diferencia de goles por partido sin ruido (movimiento en su media, chuts muestreados), aproximadamente 250 partidas por oponente.

| Oponente | Diferencia de goles (g16) |
|---|---|
| IA de reglas MESSI | +2,61 |
| Política PPO (antes de PSRO) | +2,72 |
| PSRO g1 | +2,45 |
| PSRO g5 | +1,06 |
| PSRO g10 | +0,46 |
| PSRO g14 | +0,20 |
| PSRO g15 | +0,13 |

Una política contra una copia de sí misma puntúa entre −0,13 y +0,09, lo que el autor identifica como nivel de ruido. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros), ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La red es pequeña (dimensión oculta 256, 11 ranuras, GRU), pero el coste dominante es el propio simulador MESSI en JAX, no los pesos de la política.
- GPU recomendadas: no disponible en la información proporcionada. Al ejecutarse sobre JAX, se beneficiaría de GPUs con soporte CUDA o ROCm, pero el autor no especifica modelos concretos.
- Compatibilidad con GPU de consumo: no disponible. Por el tamaño de la red, es plausible que quepa en GPUs de consumo, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto. La ejecución requiere el motor MESSI y el código del pipeline (`messi_net.py`, `kick_choice.py`, `tk_ppo.py`), que no están en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas comparables publicadas para el mismo simulador MESSI ni artefactos equivalentes de PSRO en fútbol 11 contra 11 con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El repositorio no incluye el código necesario para ejecutar la política: se requieren el motor MESSI y los módulos `messi_net.py`, `kick_choice.py` y `tk_ppo.py`, ausentes del repositorio.
- El portero es siempre la IA de reglas, también en el equipo propio; la política solo controla un jugador de campo por paso.
- Muchos goles en este entorno provienen de robar saques cortos del portero rival, un comportamiento que la política explota y que puede inflar el rendimiento frente a oponentes que no lo corrigen.
- Los oponentes de entrenamiento se limitan a generaciones anteriores y a la IA de reglas, por lo que la generalización a políticas externas no está evaluada.
- El repositorio tiene 0.0 GB y no contiene los pesos descritos en la model card, lo que impide verificar la disponibilidad real de `policy.msgpack`.
- Riesgo de alucinación y sesgos lingüísticos: no aplica, al no ser un modelo de lenguaje.
- Licencia MIT: permite uso comercial y modificación, pero el uso queda condicionado a disponer del simulador y del pipeline, cuyas licencias son independientes.
- Para producción: no se han documentado pruebas de estabilidad fuera del entorno de evaluación del autor, ni latencias, ni requisitos de hardware verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cwz19/messi-football-g16
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos del simulador MESSI o del pipeline de entrenamiento.
