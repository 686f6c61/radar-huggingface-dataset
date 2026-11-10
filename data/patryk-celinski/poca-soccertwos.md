# patryk-celinski/poca-SoccerTwos

## Resumen

`patryk-celinski/poca-SoccerTwos` es un agente de aprendizaje por refuerzo entrenado con el algoritmo POCA (Policy Optimization with Clipped Advantages, una variante de PPO) sobre el entorno SoccerTwos de Unity ML-Agents. Lo publica el usuario Patryk Celinski en Hugging Face y su propósito es jugar partidos de fútbol 2 contra 2 en un entorno simulado de Unity, no procesar lenguaje natural ni generar texto.

El modelo se distribuye como artefacto de ML-Agents (ficheros `.nn`/`.onnx` junto con los metadatos de TensorBoard) y está pensado para cargarse directamente en el toolkit de ML-Agents, ya sea para reanudar el entrenamiento o para visualizar al agente jugando en el navegador a través de la integración de Hugging Face con Unity. No es un modelo de lenguaje: no tiene parámetros de transformer, ni contexto, ni tokenizador, por lo que muchas de las métricas habituales de una ficha de LLM no aplican.

La relevancia es acotada: sirve como referencia práctica para quienes trabajan con entornos multiagente de ML-Agents (SoccerTwos es un benchmark de cooperación y competición) y quieren inspeccionar una política entrenada con POCA, reanudar su entrenamiento o comparar curvas de recompensa. El repositorio ocupa 0,2 GB y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor para ML-Agents (algoritmo POCA); topología de capas no especificada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (artefacto de inferencia ML-Agents en `.nn`/`.onnx`) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.nn` (formato nativo de ML-Agents) y `.onnx`; logs de TensorBoard en el repositorio |

## Arquitectura y entrenamiento

El agente se entrena con el algoritmo POCA, una variante de policy gradient con ventajas recortadas implementada en la librería Unity ML-Agents. La política se materializa como una red neuronal que consume las observaciones vectoriales y visuales del entorno SoccerTwos (estado de los jugadores y de la pelota) y emite acciones discretas de movimiento y patada. El repositorio incluye los ficheros de modelo exportados a `.nn` y `.onnx`, además de los eventos de TensorBoard que registran la curva de entrenamiento.

No se dispone de información sobre el número de pasos de entrenamiento, la composición de los episodios, hiperparámetros concretos (learning rate, tamaño de batch, coeficiente de entropía), semillas utilizadas ni si hubo currículo o self-play con adversarios. Tampoco se documenta la topología exacta de la red (número de capas ocultas, tamaño de las mismas, uso de red separada para valor). Todo ello debería consultarse en los logs de TensorBoard incluidos en el repositorio o en el fichero de configuración YAML del entrenamiento, que no se ha proporcionado.

## Capacidades

- Control de agentes en el entorno SoccerTwos de Unity ML-Agents (fútbol 2 contra 2).
- Toma de decisiones en un entorno multiagente parcialmente observable con cooperación y competición.
- Inferencia en tiempo real dentro del motor Unity mediante el componente Behavior Parameters de ML-Agents.
- Exportación a ONNX para despliegue fuera del runtime de ML-Agents (Unity Barracuda u otros runtimes ONNX).
- Reanudación del entrenamiento con `mlagents-learn --resume` a partir del checkpoint incluido.
- Visualización del agente jugando en el navegador mediante la integración de Hugging Face con Unity.
- No soporta tool calling, function calling, generación de texto, visión general, audio ni razonamiento multi-paso en el sentido de los LLM.

## Casos de uso

- Investigación en RL multiagente: usar el agente como política de referencia en SoccerTwos para comparar curvas de recompensa frente a nuevos algoritmos o hiperparámetros, aprovechando los logs de TensorBoard incluidos.
- Reanudación de entrenamiento: cargar el checkpoint con `mlagents-learn <config>.yaml --run-id=<id> --resume` para continuar el entrenamiento desde el estado guardado y ajustar la política a variantes del entorno.
- Evaluación de robustez: enfrentar al agente contra políticas entrenadas con PPO estándar o contra versiones anteriores para medir la varianza de rendimiento en partidos 2 contra 2.
- Docencia y divulgación: demostrar el ciclo completo de entrenamiento y despliegue de un agente ML-Agents, desde la definición del entorno hasta la visualización en el navegador.
- Pruebas de integración de ML-Agents en pipelines: validar la exportación a `.onnx` y la carga del modelo en Unity Barracuda u otros runtimes ONNX para entornos de producción simulados.
- Benchmark de infraestructura: usar el artefacto como carga de trabajo ligera (0,2 GB) para probar el aprovisionamiento de entornos de entrenamiento con ML-Agents y TensorBoard.
- Base para self-play: emplear la política como adversario inicial en un bucle de self-play y medir la mejora de un agente nuevo frente a ella.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa media, tasa de victorias ni Elo frente a otras políticas, y el repositorio no documenta evaluaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada: no disponible; al tratarse de una política de ML-Agents de tamaño reducido (repositorio de 0,2 GB que incluye logs y checkpoints), la inferencia cabe holgadamente en cualquier GPU consumer moderna, aunque no se especifica el consumo exacto.
- GPU recomendadas: no disponible en la información proporcionada; para inferencia en Unity basta con una GPU de gama media o incluso CPU, y para reanudar el entrenamiento se recomienda una GPU dedicada (por ejemplo, RTX 3060 o superior) sin que exista una recomendación oficial.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño del artefacto; no se especifica el modelo mínimo.
- Opciones de despliegue: ML-Agents con el runtime de Unity, exportación a `.onnx` para Unity Barracuda u ONNX Runtime, y `mlagents-learn --resume` para continuar el entrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Licencia | Disponibilidad |
|---|---|---|---|---|
| patryk-celinski/poca-SoccerTwos | SoccerTwos (ML-Agents) | POCA | no disponible | Hugging Face, 0 descargas |
| Agentes PPO de SoccerTwos en la organización Unity | SoccerTwos (ML-Agents) | PPO | según el repositorio de Unity | Hugging Face (organización `unity`) |
| Políticas de referencia de ML-Agents (ejemplos oficiales) | Varios entornos ML-Agents | PPO, SAC, POCA | licencia de ML-Agents | Repositorio GitHub de Unity ML-Agents |

No se dispone de datos de rendimiento comparativo (recompensa media, tasa de victorias) entre estas alternativas en la información proporcionada, por lo que la comparación se limita a entorno, algoritmo y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política solo es válida para el entorno SoccerTwos; no generaliza a otros entornos ni a tareas de lenguaje.
- Licencia no especificada: no se puede confirmar el uso comercial del artefacto; conviene contactar con el autor antes de integrarlo en productos.
- Ausencia de métricas: sin benchmarks publicados, no es posible evaluar su calidad relativa frente a otras políticas de SoccerTwos.
- Riesgo de sobreajuste al escenario de entrenamiento: al no documentarse el currículo ni el número de pasos, se desconoce su robustez frente a variaciones del entorno (por ejemplo, cambios en la física o en el número de agentes).
- Sin garantías de mantenimiento: el repositorio no registra descargas ni likes y no se documenta soporte del autor.
- Artefacto dependiente de la versión de ML-Agents: la compatibilidad del `.nn` está ligada a la versión del toolkit usada en el entrenamiento, que no se indica; puede requerir conversión o reentrenamiento con otras versiones.
- No apto para producción de texto, visión general, audio ni agentes conversacionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patryk-celinski/poca-SoccerTwos
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto de ML-Agents (Huggy the Dog): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visualización de agentes Unity en Hugging Face: https://huggingface.co/unity
