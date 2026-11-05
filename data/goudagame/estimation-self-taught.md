# GoudaGame/estimation-self-taught

## Resumen

Self-taught es un agente de aprendizaje por refuerzo desarrollado por GoudaGame para jugar a Estimation, un juego de cartas con apuestas y bazas. A diferencia de un modelo de lenguaje, no procesa texto ni genera lenguaje natural: es una red neuronal entrenada mediante self-play (juego contra sí misma) que toma decisiones tanto de apuesta como de juego de cartas. El artefacto publicado en HuggingFace es un fichero NumPy `.npz` con los pesos de la red, no un modelo con tokenizador ni pipeline de generación.

El modelo se entrenó desde cero sin datos supervisados, recibiendo recompensa según la posición final en la mesa. La model card indica que una única red neuronal cubre todas las decisiones del juego, lo que simplifica la arquitectura frente a aproximaciones con políticas separadas para apuesta y juego. Es utilizado por los bots "Self-taught" y "Self-taught + look-ahead" del proyecto Estimation Arena.

La relevancia de esta ficha es limitada para el público habitual de un blog de IA open source: se trata de un artefacto de investigación muy específico, sin benchmarks publicados en la información disponible, sin idiomas declarados y con la advertencia explícita de que ejecutarlo requiere un motor de reglas privado. El repositorio ocupa 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal (tipo concreto no disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | NumPy `.npz` |

## Arquitectura y entrenamiento

La información disponible describe una única red neuronal que gestiona todas las decisiones del juego, tanto las apuestas como la selección de cartas. No se especifica el tipo de red (MLP, CNN, transformer u otra), el número de capas, las dimensiones de entrada o salida, ni el número de parámetros. Tampoco se detalla la función de recompensa más allá de que premia la posición final en la mesa.

El entrenamiento es de aprendizaje por refuerzo mediante self-play: el agente parte de cero y mejora jugando contra versiones de sí mismo. No se indica el número de partidas, el algoritmo de RL empleado (por ejemplo, policy gradient, Q-learning o actor-critic), ni si hubo técnicas auxiliares como look-ahead durante el entrenamiento. La variante "Self-taught + look-ahead" sugiere que la búsqueda se aplica en inferencia y no necesariamente en el entrenamiento.

## Capacidades

- Toma de decisiones de apuesta en Estimation: estima cuántas bazas logrará el equipo en cada mano.
- Selección de carta en cada turno, respetando las reglas del juego.
- Política unificada: una sola red cubre apuestas y juego de cartas.
- Entrenamiento por self-play sin datos humanos ni supervisión.
- Integración con bots de la Estimation Arena, incluida una variante con look-ahead.
- No soporta tool calling, function calling, agentes multi-paso genéricos, visión, audio ni generación de texto.
- No tiene capacidades multilingües: no procesa lenguaje natural.

## Casos de uso

- Investigación en aprendizaje por refuerzo aplicado a juegos de cartas: sirve como referencia de política entrenada por self-play en un dominio con información imperfecta y componentes de apuesta.
- Benchmark de agentes en Estimation: permite comparar la política sin búsqueda frente a la variante con look-ahead en la leaderboard de Estimation Arena.
- Estudio de recompensas basadas en posición final: útil para analizar cómo una señal de recompensa escasa (solo al final de la partida) moldea la política de apuesta y juego.
- Base para inicializar o comparar nuevas políticas: el fichero `.npz` puede cargarse en el motor de reglas para evaluar variantes de entrenamiento.
- Docencia y divulgación sobre self-play: ejemplo compacto de agente que aprende un juego de cartas sin datos etiquetados.
- Evaluación de robustez frente a oponentes: al integrarse en la arena, permite medir el rendimiento contra otras políticas del ecosistema.

En todos los casos, la ejecución práctica requiere el motor de reglas privado mencionado en la model card, lo que limita su uso fuera del proyecto original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona que el modelo está valorado en la leaderboard de Estimation Arena, sin cifras concretas de win rate, Elo ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del fichero `.npz` y el número de parámetros no se especifican.
- GPU recomendadas: no disponible. Por el formato NumPy y la naturaleza del artefacto, es probable que la inferencia sea ligera y viable en CPU, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: carga directa del `.npz` con NumPy; no se contemplan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GoudaGame/estimation-self-taught | Red neuronal para Estimation | no disponible | no aplica | MIT | Pesos `.npz`, motor privado |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos públicos comparables en la misma categoría (agentes de RL para Estimation) dentro de la información proporcionada.

## Limitaciones y advertencias

- Ejecución restringida: requiere el motor de reglas del proyecto, que es privado según la model card.
- Sin datos de rendimiento: no hay benchmarks, win rates ni métricas publicadas que permitan evaluar su calidad objetivamente.
- Especificidad extrema: solo juega a Estimation; no es reutilizable para otras tareas sin reentrenamiento.
- Documentación mínima: no se detallan arquitectura, hiperparámetros, número de partidas de entrenamiento ni composición de la recompensa.
- Riesgo de sobreajuste al meta-juego de la arena: al entrenarse por self-play, su comportamiento puede estar sesgado hacia las políticas con las que se enfrentó.
- Licencia MIT: permite uso comercial y modificación, pero la dependencia del motor privado limita la explotación práctica.
- Sin idiomas declarados: no aplica soporte multilingüe ni procesamiento de texto.
- Repositorio sin actividad: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/GoudaGame/estimation-self-taught
- Leaderboard Estimation Arena: https://essamgouda97.github.io/estimation-arena/
- Repositorio del proyecto: https://github.com/essamgouda97/estimation-arena
