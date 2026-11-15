# razdiamond/poca-SoccerTwos

## Resumen

poca-SoccerTwos es un agente entrenado con el algoritmo POCA (Policy Optimization with Clipped Advantage, una variante de PPO con clipping de ventaja) dentro del entorno SoccerTwos de Unity ML-Agents. Lo publica el usuario razdiamond en Hugging Face y su proposito es jugar partidos de futbol 2 contra 2 en un entorno de simulacion 3D. No es un modelo de lenguaje ni un modelo fundacional: es una politica neuronal de aprendizaje por refuerzo profundo con observaciones vectoriales y acciones continuas o discretas segun la configuracion del entorno.

El modelo se distribuye como un artefacto de ML-Agents en formato `.nn` (y potencialmente `.onnx`), pensado para cargarse con el runtime de Unity ML-Agents o para visualizarse directamente en el navegador mediante el visor de Hugging Face. Su relevancia es acotada: sirve como ejemplo reproducible de entrenamiento multiagente cooperativo/competitivo en SoccerTwos y como punto de partida para experimentos de curricula, auto-juego y recompensas por equipos.

No hay informacion publica sobre arquitectura de red, numero de parametros, hiperparametros de entrenamiento ni presupuesto de computo. La model card es la plantilla estandar autogenerada por ML-Agents y no aporta detalles tecnicos especificos del entrenamiento realizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica/valor para ML-Agents (detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | `.nn` (ML-Agents) y `.onnx` segun la model card |

## Arquitectura y entrenamiento

El agente se entrena con el algoritmo POCA, una modificacion de PPO que incorpora clipping de la ventaja para estabilizar la actualizacion de la politica en entornos con recompensas ruidosas o multiagente. El entorno SoccerTwos de Unity ML-Agents es un escenario de futbol 2 contra 2 con agentes que comparten politica (self-play o team-play) y que reciben observaciones vectoriales y raycasts, con recompensas por gol, posesion y eventos del partido.

No se dispone de informacion sobre el numero de pasos de entrenamiento, la composicion de episodios, el uso de curricula, la configuracion de hiperparametros (learning rate, batch size, epochs, clip epsilon, entropia) ni sobre si se emplearon recompensas shaping adicionales. Tampoco hay datos sobre la topologia exacta de la red (capas ocultas, unidades, normalizacion) ni sobre el uso de memoria recurrente o transformers para observaciones.

## Capacidades

- Jugar partidos de SoccerTwos en Unity ML-Agents con dos agentes por equipo.
- Control de un agente individual con observaciones vectoriales y raycasts del entorno.
- Comportamiento aprendido por refuerzo, sin componente de lenguaje natural.
- Ejecutable en el visor web de Hugging Face para ML-Agents (seleccionando el archivo `.nn`/`.onnx`).
- Reanudacion del entrenamiento mediante `mlagents-learn ... --resume`.
- No soporta tool calling, function calling, agentes multi-step ni razonamiento simbolico.
- No tiene capacidades multilingues, vision, audio ni thinking mode.

## Casos de uso

- Evaluacion de algoritmos de RL multiagente: cargar el agente en SoccerTwos para comparar POCA frente a PPO estandar en terminos de estabilidad y recompensa media por episodio.
- Reproduccion de experimentos: usar el checkpoint como linea base para reentrenar con curricula o recompensas shaping distintas y medir el delta de rendimiento.
- Docencia en aprendizaje por refuerzo: demostrar el ciclo observacion-accion-recompensa en un entorno 3D visible desde el navegador sin infraestructura adicional.
- Desarrollo de entornos de auto-juego: enfrentar el agente contra versiones propias o contra otros checkpoints de SoccerTwos para estudiar la emergencia de estrategias.
- Integracion en pipelines de ML-Agents: exportar el `.onnx` a Unity Barracuda o Sentis para inferencia en tiempo real dentro de un juego o simulador.
- Pruebas de robustez: someter al agente a variaciones del entorno (posiciones iniciales, velocidades, ruido en observaciones) para medir la degradacion de la politica.
- Benchmark interno de infraestructura de entrenamiento: usar el checkpoint como referencia de convergencia al validar nuevas GPUs o configuraciones de ML-Agents.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye recompensa media, win rate, Elo ni curvas de entrenamiento de TensorBoard.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una politica de ML-Agents, el consumo tipico es de pocos cientos de MB o menos, pero no hay dato confirmado.
- GPU recomendadas: no disponible. Para entrenamiento, ML-Agents suele requerir GPU con CUDA; para inferencia en Unity basta CPU.
- Compatibilidad con GPU de consumo: probable en RTX 3060 o superiores para entrenamiento; inferencia en CPU viable.
- Opciones de despliegue: runtime de Unity ML-Agents, Unity Barracuda/Sentis para `.onnx`, visor web de Hugging Face para ML-Agents.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| razdiamond/poca-SoccerTwos | SoccerTwos | POCA | no disponible | no aplica | no disponible | Hugging Face |
| unity/ml-agents SoccerTwos (checkpoints oficiales) | SoccerTwos | PPO | no disponible | no aplica | licencia de Unity ML-Agents | GitHub / Hugging Face |
| Alternativas de la comunidad SoccerTwos | SoccerTwos | PPO / SAC | no disponible | no aplica | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos checkpoints.

## Limitaciones y advertencias

- Especifico del entorno SoccerTwos: no generaliza a otras tareas ni a otros juegos sin reentrenamiento.
- Sin informacion de licencia: no se puede confirmar el uso comercial; verificar con el autor antes de produccion.
- Sin datos de entrenamiento: imposible auditar sesgos, sobreajuste o robustez de la politica.
- Riesgo de sobreajuste al escenario concreto y a los oponentes vistos durante el entrenamiento.
- Sin garantias de convergencia ni de rendimiento estable; la model card es autogenerada y no aporta metricas.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- No apto para tareas de lenguaje, vision, codigo ni atencion al cliente.

## Enlaces

- Hugging Face: https://huggingface.co/razdiamond/poca-SoccerTwos
- Documentacion ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto (Huggy the Dog): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes ML-Agents en Hugging Face: https://huggingface.co/unity
