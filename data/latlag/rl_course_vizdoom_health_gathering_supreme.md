# LATlag/rl_course_vizdoom_health_gathering_supreme

## Resumen

El modelo `LATlag/rl_course_vizdoom_health_gathering_supreme` es un agente de aprendizaje por refuerzo (reinforcement learning) entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de VizDoom. Ha sido desarrollado por el usuario LATlag como parte de un curso de RL, utilizando la librería Sample-Factory 2.0. El objetivo del agente es aprender a recolectar paquetes de salud en un escenario 3D de disparos en primera persona, maximizando la recompensa acumulada.

El modelo se distribuye como un checkpoint entrenado, listo para ser cargado y ejecutado con Sample-Factory. No se trata de un modelo de lenguaje, sino de una política neuronal que mapea observaciones visuales (píxeles del juego) a acciones discretas. Su relevancia radica en ser un ejemplo práctico de entrenamiento de agentes RL en entornos parcialmente observables y con alta dimensionalidad de entrada. El repositorio ocupa 0.2 GB e incluye los pesos del modelo y metadatos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional (CNN) para procesamiento de imágenes, típica en agentes RL de VizDoom; no se especifica detalle de capas |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (entorno de RL, no procesamiento de secuencias largas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de visión y control, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no especificado; se carga mediante Sample-Factory (probablemente archivos `.pt` o `.pth` de PyTorch) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de red neuronal convolucional (CNN) típica de los agentes de VizDoom, que procesa frames de 160x120 píxeles en escala de grises o RGB. La política se entrena con el algoritmo APPO, una variante asíncrona de PPO que combina ventajas de actor-crítico con actualizaciones off-policy. Sample-Factory 2.0 es el framework utilizado, conocido por su eficiencia en entornos de RL con múltiples workers paralelos.

No se dispone de información sobre el número de parámetros, la composición exacta de la red, el número de pasos de entrenamiento ni el dataset de experiencias. El entrenamiento se realizó en el entorno `doom_health_gathering_supreme`, donde el agente debe moverse por un mapa recolectando kits de salud mientras evita daños. La recompensa media reportada es de 12.80 ± 5.78, lo que indica un rendimiento moderado en la tarea.

## Capacidades

- Control de un agente en un entorno 3D de VizDoom, tomando decisiones basadas en observaciones visuales.
- Aprendizaje de políticas de navegación y recolección de objetos (health packs) en un escenario con recompensas escasas.
- Inferencia en tiempo real: el modelo puede ejecutarse a una velocidad suficiente para interactuar con el entorno en tiempo real, aunque no se especifican FPS.
- No tiene capacidades de lenguaje, generación de texto, tool calling ni razonamiento simbólico.
- No soporta tareas fuera del entorno específico para el que fue entrenado.

## Casos de uso

- Investigación en aprendizaje por refuerzo: sirve como ejemplo de entrenamiento de agentes con APPO en entornos visuales, útil para comparar algoritmos o estudiar la influencia de hiperparámetros.
- Benchmarking de frameworks de RL: permite evaluar el rendimiento de Sample-Factory frente a otras librerías (Stable-Baselines3, RLlib) en la misma tarea.
- Demostración educativa: en cursos de RL, se puede cargar el modelo para visualizar el comportamiento aprendido y analizar las políticas resultantes.
- Pruebas de transferencia: se puede utilizar como punto de partida para fine-tuning en entornos VizDoom similares (por ejemplo, `doom_health_gathering` con mayor dificultad).
- Evaluación de robustez: al ejecutar el agente en variantes del entorno con perturbaciones (ruido, cambios de iluminación), se puede estudiar la generalización de la política.
- Integración en pipelines de simulación: el modelo puede ser invocado desde scripts de Python para generar trayectorias de comportamiento que alimenten otros análisis.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en la model card:

| Algoritmo | Entorno | Métrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 12.80 ± 5.78 |

No se han publicado comparaciones con otros modelos o algoritmos en la información disponible. El valor de recompensa media es modesto, lo que sugiere que el agente ha aprendido una política básica pero no óptima. No se dispone de métricas adicionales como tasa de éxito, pasos por episodio o tiempo de entrenamiento.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación del modelo.
- Dado que es un agente RL con entrada visual, la inferencia puede ejecutarse en CPU, aunque una GPU acelera el procesamiento de las convoluciones.
- El tamaño del repositorio (0.2 GB) sugiere que los pesos son relativamente pequeños (posiblemente menos de 10 millones de parámetros), por lo que cabría en cualquier GPU moderna con al menos 2 GB de VRAM.
- Para entrenamiento o fine-tuning, se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 2070 o superior) para manejar el lote de experiencias y las actualizaciones de gradiente.
- El despliegue se realiza mediante Sample-Factory, que incluye scripts de `enjoy` para ejecutar el agente. No se menciona compatibilidad con vLLM, Ollama u otros motores de inferencia, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos entrenados en el mismo entorno con los mismos parámetros. Existen otros repositorios en Hugging Face con el mismo nombre de entorno (por ejemplo, `nomad-ai/rl_course_vizdoom_health_gathering_supreme` o `Vishath/rl_course_vizdoom_health_gathering_supreme`), pero no se han publicado sus métricas ni detalles de arquitectura, por lo que no es posible realizar una comparación rigurosa.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en el entorno `doom_health_gathering_supreme`; no generaliza a otras tareas de VizDoom ni a otros dominios.
- La recompensa media reportada (12.80 ± 5.78) presenta una alta varianza, lo que indica que el rendimiento puede ser inconsistente entre episodios.
- No se ha verificado de forma independiente el resultado del benchmark; el valor está marcado como `verified: false`.
- No se especifica la licencia, por lo que su uso comercial o redistribución puede estar sujeto a restricciones desconocidas.
- No se documentan sesgos ni riesgos de alucinación, al no ser un modelo generativo de texto.
- Para producción, se requiere un análisis adicional de robustez y estabilidad del agente en condiciones variables.

## Enlaces

- Repositorio del modelo: https://huggingface.co/LATlag/rl_course_vizdoom_health_gathering_supreme
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Código de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Otros modelos similares (sin métricas publicadas): https://huggingface.co/nomad-ai/rl_course_vizdoom_health_gathering_supreme, https://huggingface.co/Vishath/rl_course_vizdoom_health_gathering_supreme
