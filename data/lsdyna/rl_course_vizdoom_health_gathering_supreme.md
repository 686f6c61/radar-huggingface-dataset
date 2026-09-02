# lsdyna/rl_course_vizdoom_health_gathering_supreme

## Resumen

El modelo `lsdyna/rl_course_vizdoom_health_gathering_supreme` es un agente de aprendizaje por refuerzo (RL) entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Su objetivo es controlar un personaje en el juego Doom para recolectar paquetes de salud mientras se mantiene con vida, a partir únicamente de la información visual de la pantalla. Ha sido desarrollado por el usuario `lsdyna` como parte de un curso de RL, utilizando la librería Sample-Factory 2.0.

Se trata de un modelo de control visual, no de un modelo de lenguaje: recibe píxeles como entrada y produce acciones discretas de movimiento y disparo. Su relevancia radica en ser un ejemplo práctico de entrenamiento de agentes con RL en entornos de videojuegos, útil para investigación y docencia en este campo. El repositorio ocupa 0,1 GB e incluye los pesos del agente entrenado, aunque no se especifican detalles de la arquitectura interna ni del número de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | APPO (Asynchronous Proximal Policy Optimization) con red neuronal para vision (no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision/control) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente checkpoint de PyTorch/Sample-Factory) |

## Arquitectura y entrenamiento

El modelo utiliza el algoritmo APPO, una variante asíncrona de PPO (Proximal Policy Optimization) implementada en la librería Sample-Factory 2.0. APPO combina la estabilidad de PPO con la eficiencia de la recolección de experiencias asíncrona, permitiendo entrenar agentes en entornos de simulación con alta velocidad. La red neuronal interna no está documentada en la información disponible, pero típicamente en ViZDoom se usa una CNN que procesa los fotogramas del juego y genera una política sobre las acciones posibles.

El entrenamiento se realizó sobre el entorno `doom_health_gathering_supreme`, un escenario de ViZDoom donde el agente debe recolectar paquetes de salud mientras evita daños. No se proporcionan detalles sobre el número de pasos de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como recompensas con forma o curriculum learning. El modelo se puede descargar y ejecutar mediante los scripts de Sample-Factory, y también permite continuar el entrenamiento con el flag `--restart_behavior=resume`.

## Capacidades

- Control de un agente en el entorno ViZDoom `doom_health_gathering_supreme` mediante visión directa (píxeles de pantalla).
- Toma de decisiones en tiempo real para recolectar objetos y evitar peligros.
- Ejecución autónoma en el entorno de juego con política aprendida por RL.
- Posibilidad de reanudar el entrenamiento o evaluar el agente con los scripts proporcionados.
- Integración con el ecosistema Sample-Factory para cargar, ejecutar y subir modelos a Hugging Face.

## Casos de uso

- Investigación en aprendizaje por refuerzo: sirve como punto de partida para estudiar el rendimiento de APPO en entornos visuales parcialmente observables, comparando con otros algoritmos o variantes de hiperparámetros.
- Docencia de RL: en cursos universitarios o talleres, se puede utilizar como ejemplo de agente entrenado con una librería moderna (Sample-Factory) y analizar su comportamiento en un entorno estándar como ViZDoom.
- Benchmark de algoritmos: al ser un entorno reproducible y con métrica clara (recompensa media), permite comparar diferentes configuraciones de APPO u otros métodos de RL.
- Evaluación de robustness: se puede probar el agente en variantes del entorno (cambios de dificultad, semillas) para medir su generalización.
- Desarrollo de agentes para videojuegos: como base para entrenar agentes más complejos en otros escenarios de ViZDoom o juegos similares, aplicando transferencia de aprendizaje.
- Demostración de despliegue de modelos RL: muestra cómo cargar y ejecutar un agente desde Hugging Face usando las herramientas de Sample-Factory, útil para integrar modelos en pipelines de experimentación.

## Benchmarks y rendimiento

El autor declara en la model card una recompensa media de **3,84 ± 0,50** en el entorno `doom_health_gathering_supreme`. Este valor es la única métrica oficial disponible y no se ha verificado externamente. No se han publicado comparaciones con otros agentes o algoritmos en la información proporcionada.

| Algoritmo | Entorno | Recompensa media |
|---|---|---|
| APPO | doom_health_gathering_supreme | 3,84 ± 0,50 |

## Requisitos de hardware

- El tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo relativamente pequeño (del orden de decenas de millones de parámetros, aunque no se confirma).
- Dado que es un agente de RL basado en visión y no un modelo de lenguaje grande, puede ejecutarse en cualquier GPU con al menos 2-4 GB de VRAM, o incluso en CPU para inferencia a baja velocidad.
- Para entrenamiento o reanudación del entrenamiento, se recomienda una GPU con al menos 8 GB de memoria (por ejemplo, RTX 2070 o superior), aunque los requisitos exactos dependen del tamaño de lote y la resolución de los fotogramas.
- Las opciones de despliegue incluyen los scripts de Sample-Factory (`enjoy` para inferencia, `train` para entrenamiento), que gestionan automáticamente el entorno y el modelo.
- No se ha publicado información sobre latencia o throughput específicos.

## Comparativa con modelos similares

En Hugging Face existen otros repositorios con el mismo nombre de modelo (por ejemplo, `nomad-ai/rl_course_vizdoom_health_gathering_supreme` y `lahirum/rl_course_vizdoom_health_gathering_supreme`), que probablemente sean versiones entrenadas por otros usuarios con configuraciones similares. Sin embargo, no se dispone de datos de rendimiento o arquitectura de esos modelos para establecer una comparativa cuantitativa. No se conocen otros agentes específicos para este entorno con métricas publicadas.

| Modelo | Recompensa media | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| lsdyna/rl_course_vizdoom_health_gathering_supreme | 3,84 ± 0,50 | no disponible | no aplica | no disponible |
| nomad-ai/rl_course_vizdoom_health_gathering_supreme | no disponible | no disponible | no aplica | no disponible |
| lahirum/rl_course_vizdoom_health_gathering_supreme | no disponible | no disponible | no aplica | no disponible |

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos o riesgos de alucinación, ya que no es un modelo de lenguaje.
- El agente está especializado exclusivamente en el entorno `doom_health_gathering_supreme`; no se puede esperar que funcione en otros escenarios sin reentrenamiento.
- La recompensa media de 3,84 ± 0,50 es un valor declarado por el autor y no ha sido verificado de forma independiente; puede variar según la semilla o la configuración del entorno.
- La licencia no está especificada, por lo que se desconoce si es posible usar el modelo en proyectos comerciales o con restricciones.
- No se detalla la arquitectura interna (número de capas, canales, etc.), lo que dificulta la reproducibilidad exacta del entrenamiento.
- El modelo requiere la instalación de Sample-Factory y ViZDoom para ejecutarse, lo que añade dependencias externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lsdyna/rl_course_vizdoom_health_gathering_supreme
- Sample-Factory (librería de entrenamiento): https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Página de ViZDoom: https://vizdoom.cs.put.edu.pl/
