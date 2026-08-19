# duyhungnguyen1210/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este modelo es un agente de aprendizaje por refuerzo (RL) entrenado para resolver el escenario `doom_health_gathering_supreme` del entorno ViZDoom, un simulador basado en el clásico Doom. El agente fue desarrollado por duyhungnguyen1210 y entrenado con la librería Sample-Factory 2.0, que implementa el algoritmo APPO (Asynchronous Proximal Policy Optimization). El objetivo del escenario es que el agente aprenda a recolectar paquetes de salud mientras evita el daño, un problema típico de navegación y supervivencia en RL.

La relevancia de este modelo radica en que sirve como ejemplo práctico de entrenamiento de agentes RL en entornos visuales parcialmente observables, y demuestra el uso de Sample-Factory para entrenar y compartir políticas en el Hub de Hugging Face. No se dispone de información sobre la arquitectura interna, el número de parámetros ni la longitud de contexto, ya que la model card no los detalla. El tamaño del repositorio es de 0,5 GB, lo que sugiere que incluye los pesos del modelo y posiblemente artefactos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (agente de RL, probablemente red neuronal convolucional para procesar píxeles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, es un agente RL con observaciones de píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo usa Sample-Factory, probablemente archivos de pesos propios de la librería) |

## Arquitectura y entrenamiento

El modelo es un agente de aprendizaje por refuerzo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization), implementado en Sample-Factory 2.0. APPO es una variante asíncrona de PPO que permite entrenar múltiples actores en paralelo, mejorando la eficiencia de muestreo y la escalabilidad. El entorno de entrenamiento es `doom_health_gathering_supreme`, un escenario de ViZDoom donde el agente debe recolectar paquetes de salud mientras evita el daño. La observación es visual (píxeles del juego) y la acción es discreta (movimiento y rotación).

No se han proporcionado detalles sobre la arquitectura exacta de la red neuronal (número de capas, tipo de capas, etc.), ni sobre el dataset de entrenamiento, el número de pasos de entorno, o si se aplicaron técnicas como RLHF o DPO. La model card indica que el entrenamiento se puede reanudar con el script `train` y el flag `--restart_behavior=resume`, lo que sugiere que el modelo se guardó en un punto intermedio del entrenamiento.

## Capacidades

- Jugar el escenario `doom_health_gathering_supreme` de ViZDoom, recolectando paquetes de salud y evitando daño.
- Procesar observaciones visuales (píxeles) y tomar decisiones de movimiento en tiempo real.
- Funcionar como agente autónomo en un entorno de RL con recompensa densa (cada paquete de salud recolectado da recompensa positiva).
- Ser utilizado para continuar entrenamiento (resume) o para inferencia mediante el script `enjoy` de Sample-Factory.
- No tiene capacidades de lenguaje, tool calling, agentes multi-paso ni razonamiento simbólico, ya que es un modelo puramente de RL para un entorno específico.

## Casos de uso

- Investigación en aprendizaje por refuerzo: este modelo sirve como punto de partida para estudiar el comportamiento de agentes APPO en entornos visuales, comparar hiperparámetros o analizar la curva de aprendizaje.
- Benchmark de algoritmos RL: al ser un agente entrenado en un escenario estándar de ViZDoom, puede usarse como referencia para evaluar otros algoritmos o variantes de PPO.
- Demostración educativa: en cursos de RL (como el Deep RL Class de Hugging Face), este modelo puede cargarse y ejecutarse para ilustrar cómo un agente aprende a navegar y recolectar objetos.
- Prueba de integración de Sample-Factory: los desarrolladores pueden usar este modelo para verificar que su instalación de Sample-Factory funciona correctamente, descargándolo y ejecutando el script `enjoy`.
- Continuación de entrenamiento: investigadores pueden reanudar el entrenamiento desde este checkpoint para explorar si más pasos de entorno mejoran la recompensa media.
- Generación de datos sintéticos: el agente puede usarse para generar trayectorias de comportamiento en el entorno, útiles para entrenar modelos imitativos o para análisis de políticas.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en la model card (no verificado de forma independiente):

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 12.61 ± 5.58 |

No se han publicado comparaciones con otros modelos o algoritmos en la información disponible.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la model card.
- Dado que ViZDoom es un entorno basado en un juego de los años 90, puede ejecutarse en CPU moderna, aunque una GPU acelera el entrenamiento y la inferencia.
- El tamaño del repositorio (0,5 GB) sugiere que los pesos del modelo son relativamente pequeños, probablemente inferiores a 100 MB, por lo que caben en cualquier GPU consumer (por ejemplo, RTX 3060 o superior).
- Para inferencia, se puede usar el script `enjoy` de Sample-Factory, que carga el modelo y ejecuta el entorno. No se mencionan opciones de despliegue como vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- La latencia y el throughput dependen del hardware y de la resolución de los píxeles del entorno; no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (agentes RL para ViZDoom). Existen otros repositorios en Hugging Face con el mismo nombre de entorno (por ejemplo, `nguyenduchuyiu/rl_course_vizdoom_health_gathering_supreme` o `Vishath/rl_course_vizdoom_health_gathering_supreme`), pero no se han publicado métricas comparativas ni detalles de arquitectura que permitan una comparación rigurosa. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en el escenario `doom_health_gathering_supreme`; no generaliza a otros entornos o tareas.
- No se ha verificado el resultado de recompensa media (12.61 ± 5.58) de forma independiente; el autor lo declara sin verificación.
- No hay información sobre sesgos, alucinaciones o riesgos de seguridad, ya que no es un modelo de lenguaje.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o modificación.
- El modelo se entrenó con una versión concreta de Sample-Factory (2.0); puede requerir ajustes si se usa con versiones posteriores.
- Para producción, es necesario validar el comportamiento del agente en condiciones reales, ya que el rendimiento en el entorno simulado puede no trasladarse a otros contextos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/duyhungnguyen1210/rl_course_vizdoom_health_gathering_supreme
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Guía de uso de Hugging Face con Sample-Factory: https://www.samplefactory.dev/10-huggingface/huggingface/
- Notebook de la clase de RL de Hugging Face (unidad 8, parte 2): https://colab.research.google.com/github/huggingface/deep-rl-class/blob/master/notebooks/unit8/unit8_part2.ipynb
