# Guru-Raja-124/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este modelo es un agente de aprendizaje por refuerzo (RL) entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de VizDoom. El objetivo del agente es recoger paquetes de salud en un escenario 3D de Doom, maximizando la recompensa acumulada. Ha sido desarrollado por el usuario Guru-Raja-124 y publicado en HuggingFace como parte de un curso de RL, utilizando la librería Sample-Factory 2.0.

El modelo es relevante como ejemplo práctico de entrenamiento de agentes RL en entornos de juego con observaciones visuales, y demuestra el uso de Sample-Factory para el entrenamiento distribuido y la integración con el Hub de HuggingFace. Aunque no se trata de un modelo de lenguaje, su publicación sirve para ilustrar el flujo de trabajo de subida, descarga y reanudación de entrenamiento de agentes RL. El tamaño del repositorio es de 0.1 GB, lo que sugiere una red neuronal relativamente pequeña, aunque no se especifican los detalles de arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red de politica y valor, tipicamente CNN/MLP, sin especificar) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de RL con observaciones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente checkpoint de PyTorch, no confirmado) |

## Arquitectura y entrenamiento

El modelo emplea el algoritmo APPO, una variante asíncrona de Proximal Policy Optimization (PPO) implementada en Sample-Factory 2.0. APPO combina la estabilidad de PPO con la eficiencia de la ejecución asíncrona en múltiples workers, lo que permite un alto throughput de muestreo y actualización. La red neuronal subyacente no está documentada en la model card; típicamente en VizDoom se usan arquitecturas convolucionales para procesar las observaciones visuales (píxeles del juego), seguidas de capas totalmente conectadas para la política y la función de valor.

El entrenamiento se realizó en el entorno `doom_health_gathering_supreme`, un escenario de VizDoom donde el agente debe recolectar paquetes de salud mientras se mueve por un mapa. No se proporcionan detalles sobre el número de pasos de entrenamiento, la composición del dataset (aunque al ser RL, los datos se generan por interacción con el entorno) ni sobre técnicas de regularización o recompensas auxiliares. La model card indica que el entrenamiento puede reanudarse con `--restart_behavior=resume`, lo que sugiere que se guardaron checkpoints intermedios.

## Capacidades

- Navegación en entornos 3D: el agente aprende a moverse por el escenario de VizDoom para localizar y recoger paquetes de salud.
- Toma de decisiones en tiempo real: procesa observaciones visuales y emite acciones discretas (movimiento, rotación, disparo) en cada paso.
- Aprendizaje por refuerzo: optimiza una política mediante recompensas escalares, sin supervisión externa.
- Generalización limitada al entorno específico: el modelo está especializado en `doom_health_gathering_supreme` y no se espera que transfiera a otras tareas sin reentrenamiento.
- No soporta generación de texto, razonamiento simbólico, tool calling ni capacidades multilingües, al ser un agente de RL puro.

## Casos de uso

- Investigación en aprendizaje por refuerzo: sirve como punto de partida para estudiar el comportamiento de APPO en entornos de navegación visual, comparar variantes de algoritmos o analizar la curva de aprendizaje.
- Evaluación de algoritmos de RL: permite reproducir experimentos y validar implementaciones de Sample-Factory, ya que el checkpoint puede descargarse y ejecutarse con el script `enjoy` para observar el comportamiento del agente.
- Entrenamiento de agentes en VizDoom: puede usarse como base para transferir aprendizaje o como inicialización para tareas más complejas del mismo dominio (por ejemplo, combate o recolección de objetos).
- Demostración educativa: en cursos de RL, el modelo ilustra el flujo completo de entrenamiento, subida a HuggingFace y reanudación, tal como se describe en la documentación de Sample-Factory.
- Benchmarking de infraestructura: al ser un modelo pequeño (0.1 GB), es útil para probar pipelines de inferencia o entrenamiento distribuido en entornos de desarrollo.
- Reproducibilidad de experimentos: investigadores pueden descargar el modelo y comparar sus propios agentes contra esta referencia en la misma tarea.

## Benchmarks y rendimiento

El autor declara en la model card el siguiente resultado para el entorno `doom_health_gathering_supreme`:

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 11.11 +/- 5.16 |

No se han publicado comparaciones con otros algoritmos o modelos en la información disponible. El valor de recompensa media es modesto, lo que sugiere que el agente ha aprendido a recoger algunos paquetes de salud pero con una varianza considerable entre episodios.

## Requisitos de hardware

- El tamaño del repositorio es de 0.1 GB, lo que indica un modelo de pequeñas dimensiones (probablemente menos de 10 millones de parámetros).
- Inferencia en CPU: viable para ejecutar el agente en tiempo real, ya que VizDoom puede funcionar en modo headless y la red es ligera.
- Inferencia en GPU: no es necesaria, pero una GPU modesta (por ejemplo, GTX 1650 o superior) aceleraría el procesamiento si se desea ejecutar múltiples entornos en paralelo.
- Entrenamiento: Sample-Factory soporta entrenamiento distribuido en CPU y GPU; para este entorno, una GPU con 4-8 GB de VRAM es suficiente para varios workers.
- Despliegue: el modelo se ejecuta mediante los scripts de Sample-Factory (`enjoy` para inferencia, `train` para reanudar entrenamiento). No se mencionan integraciones con vLLM, Ollama u otros frameworks de inferencia, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos oficiales; en una CPU moderna, la inferencia de un solo paso debería ser inferior a 10 ms, permitiendo ejecutar el agente a 60 FPS o más.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos entrenados en el mismo entorno o con la misma configuración. La comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está especializado únicamente en el entorno `doom_health_gathering_supreme`; no generaliza a otras tareas de VizDoom sin reentrenamiento.
- La recompensa media de 11.11 con desviación de 5.16 indica un rendimiento inconsistente entre episodios; el agente puede fallar en recoger suficientes paquetes en algunas ejecuciones.
- No se especifica la licencia, por lo que el uso comercial o la redistribución requieren contactar con el autor o verificar los términos de la plataforma.
- No hay documentación sobre la arquitectura de red, hiperparámetros ni detalles del entrenamiento, lo que limita la reproducibilidad completa.
- Al ser un modelo de RL, no tiene capacidades de lenguaje ni razonamiento simbólico; no debe usarse para tareas de procesamiento de texto.
- El riesgo de alucinación no aplica, pero sí existe la posibilidad de que el agente quede atrapado en comportamientos subóptimos (por ejemplo, bucles de movimiento) debido a la exploración insuficiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Guru-Raja-124/rl_course_vizdoom_health_gathering_supreme
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Guía de integración con HuggingFace: https://www.samplefactory.dev/10-huggingface/huggingface/
