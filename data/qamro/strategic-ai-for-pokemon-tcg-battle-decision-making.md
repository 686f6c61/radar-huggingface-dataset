# Qamro/Strategic-AI-for-Pokemon-TCG-Battle-Decision-Making

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un proyecto completo de agente de inteligencia artificial para el desafío de batalla de Pokémon TCG que organiza Kaggle y The Pokémon Company. El objetivo es construir un agente capaz de analizar el estado de una partida del juego de cartas y seleccionar acciones efectivas en cada turno, adaptándose a situaciones cambiantes en lugar de seguir una estrategia fija. El proyecto lo desarrolla el usuario Qamro y se publica en HuggingFace como un paquete de código Python con módulos para representación del estado, enumeración de acciones legales, evaluación heurística, generación de datos sintéticos mediante auto-juego y un modelo de aprendizaje automático de referencia.

La arquitectura combina un evaluador heurístico ponderado que puntúa cada acción candidata (daño, ko, desarrollo de recursos, posición del tablero, riesgo) con un modelo supervisado de Gradient Boosting que aprende a predecir el valor de una acción a partir de características numéricas. El modelo se entrena sobre un dataset sintético de unas 6.000–7.000 filas generado por un simulador de auto-juego simplificado. Aunque no es un modelo de lenguaje ni un sistema de visión, representa una aproximación práctica al problema de decisión estratégica en juegos de cartas coleccionables, con un pipeline claro para sustituir el simulador simplificado por el motor real de la competición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente hibrido: evaluador heuristico ponderado + GradientBoostingRegressor (scikit-learn) |
| Parametros totales | no disponible (modelo de arboles, sin red neuronal) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de texto; el estado del juego se codifica como vector de características) |
| Tipos de cuantizacion | no disponible (modelo de arboles, no requiere cuantizacion) |
| Idiomas soportados | Codigo y documentacion en ingles; no es un modelo de lenguaje |
| Licencia | no disponible (no se especifica en la model card ni en el repositorio) |
| Formato de pesos | joblib (serializacion de scikit-learn) |

## Arquitectura y entrenamiento

El sistema se compone de varios modulos Python que implementan un agente de decision para el juego de cartas. El modulo `game_state.py` define las estructuras de datos para representar el estado de la partida (Pokemon activos y en banca, HP, energia, premios, tamano de la mano). `actions.py` enumera todas las acciones legales en cada turno, incluyendo ataques (con comprobacion de coste de energia), retiradas, asignacion de energia, uso de partidarios y desarrollo de la banca. El evaluador (`evaluator.py`) combina factores ponderados en una puntuacion unica: ratio de HP propio y del oponente, dano de ataque, modificadores de debilidad/resistencia, bonificacion por KO, desarrollo de recursos (mayor peso en fases tempranas), diferencial de tamano de banca, penalizacion por atacar con HP critico y diferencial de cartas de premio (con el peso mas alto por ser la condicion de victoria a largo plazo).

El entrenamiento del modelo supervisado se realiza con `dataset_generator.py`, que implementa un simulador de auto-juego simplificado: dos agentes heuristicos exploratorios (con una tasa configurable de acciones aleatorias) juegan partidas completas turno a turno, generando un dataset de pares `(estado, accion)` con la recompensa inmediata, el cambio en la evaluacion heuristica del tablero y el resultado final de la partida. Por defecto se generan 500 partidas, que producen entre 6.000 y 7.000 filas. Sobre este dataset, `train_model.py` ajusta un `GradientBoostingRegressor` para predecir el valor de cada accion, alcanzando un R² de aproximadamente 0.80 en datos de validacion. El agente `MLAgent` puede cargar este modelo y usarlo en lugar del evaluador heuristico.

## Capacidades

- Analisis del estado del juego: captura informacion completa del tablero (HP, energia, premios, banca, tamano de mano, contexto de turno).
- Enumeracion de acciones legales: genera dinamicamente el espacio de acciones cada turno, adaptandose a cambios en energia, banca y mano.
- Evaluacion heuristica de estados y acciones: puntua cada movimiento segun dano, KO, riesgo, desarrollo y posicionamiento a largo plazo.
- Decision explicable: el agente heuristico puede imprimir el razonamiento detras de cada decision (`explain_decision()`).
- Aprendizaje supervisado basico: el `MLAgent` puede predecir el valor de acciones usando un modelo de Gradient Boosting entrenado sobre datos sinteticos.
- Generacion de datos sinteticos: el simulador de auto-juego produce un dataset etiquetado sin necesidad del motor real de la competicion.
- Adaptabilidad turno a turno: el pipeline se ejecuta en cada turno contra el estado vivo, por lo que las decisiones cambian segun evoluciona la partida.

## Casos de uso

- Desarrollo de agentes para juegos de cartas coleccionables: el codigo sirve como base para implementar un agente que compita en el desafio de Kaggle de Pokemon TCG, con un pipeline claro desde el estado del juego hasta la seleccion de acciones.
- Investigacion en toma de decisiones secuenciales: el proyecto demuestra como combinar heuristicas ponderadas con modelos de aprendizaje automatico para problemas con espacio de acciones dinamico y equilibrios entre recompensas a corto y largo plazo.
- Generacion de datos de entrenamiento sin entorno real: el simulador de auto-juego permite crear datasets etiquetados de partidas simuladas, utiles para probar arquitecturas de aprendizaje por refuerzo o modelos supervisados antes de disponer del motor oficial.
- Sistema de soporte a la decision en juegos de estrategia: el evaluador heuristico puede adaptarse a otros juegos de tablero o cartas con reglas similares (gestion de recursos, posicionamiento, condiciones de victoria).
- Ensenanza de conceptos de IA aplicada a juegos: el proyecto es un ejemplo didactico de como estructurar un agente con representacion de estado, espacio de acciones, evaluacion y entrenamiento, con codigo legible y modular.
- Prototipo de agente explicable: la funcion `explain_decision()` permite auditar las decisiones del agente, lo que resulta util en entornos donde se requiere transparencia en la toma de decisiones automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es un modelo de lenguaje. La unica metrica reportada es el R² ≈ 0.80 del `GradientBoostingRegressor` sobre el dataset sintetico generado por el propio simulador. No hay comparaciones con otros agentes de Pokemon TCG ni resultados en el entorno de competicion real.

## Requisitos de hardware

- El proyecto es ligero: no requiere GPU. El modelo de Gradient Boosting se entrena y ejecuta en CPU sin problemas.
- La generacion del dataset sintetico (500 partidas) tarda unos minutos en una CPU moderna; se puede escalar aumentando el numero de partidas.
- El agente heuristico es deterministico y de baja latencia: cada decision se calcula en milisegundos al evaluar un conjunto reducido de acciones legales.
- Para integrarse con el motor real de la competicion de Kaggle, se necesita un entorno con Python 3.x y las dependencias de `requirements.txt` (numpy, pandas, scikit-learn, joblib).
- No se requiere hardware especializado para despliegue; puede ejecutarse en cualquier maquina virtual estandar.

## Comparativa con modelos similares

No se dispone de informacion sobre otros agentes publicados para el desafio de Pokemon TCG de Kaggle en el momento de redactar esta ficha. El proyecto es un repositorio de codigo, no un modelo preentrenado comparable a alternativas como modelos de lenguaje o agentes de refuerzo genericos. La comparativa con otros enfoques (por ejemplo, agentes basados en Monte Carlo Tree Search o redes de politica) no es posible sin datos publicos adicionales.

## Limitaciones y advertencias

- El simulador incluido es una simplificacion del juego real: no implementa todas las reglas de Pokemon TCG (efectos de cartas, condiciones especiales, interacciones complejas). Los resultados sobre este simulador pueden no transferirse al entorno oficial de Kaggle.
- El dataset sintetico es pequeno (6.000–7.000 filas) y generado por agentes heuristicos exploratorios, lo que limita la calidad del modelo supervisado. El R² de 0.80 se alcanza sobre datos generados por el mismo simulador, no sobre datos reales.
- No hay informacion sobre la licencia del codigo ni de los datos; el uso comercial puede no estar permitido sin autorizacion explicita del autor.
- El modelo de Gradient Boosting no es un agente de refuerzo; no aprende de interacciones con el entorno real ni mejora con el tiempo sin reentrenamiento.
- El proyecto no incluye soporte para el motor oficial de la competicion; requiere trabajo adicional para conectar `from_raw_observation()` y el paso real del entorno.
- No se evalua el rendimiento contra jugadores humanos ni contra otros agentes; no hay metricas de tasa de victorias.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Qamro/Strategic-AI-for-Pokemon-TCG-Battle-Decision-Making
- Repositorio en GitHub: https://github.com/qamro/pokemon-tcg-ai-battle
- Competicion de Kaggle (descripcion): https://www.kaggle.com/competitions/pokemon-tcg-ai-battle/overview
- Competicion de Kaggle (pagina principal): https://www.kaggle.com/competitions/pokemon-tcg-ai-battle
- Estrategia de la competicion en CompeteHub: https://www.competehub.dev/en/competitions/kagglepokemon-tcg-ai-battle-challenge-strategy
- Dataset asociado en HuggingFace: https://huggingface.co/datasets/Qamro/the-Pokemon-Trading-Card-Game-Battle-Challenge-DataSet
