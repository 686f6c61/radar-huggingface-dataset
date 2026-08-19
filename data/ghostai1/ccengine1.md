# ghostai1/ccengine1

## Resumen

El repositorio `ghostai1/ccengine1` no contiene un modelo de lenguaje, sino una demo interactiva de un entorno de juego de Mario controlado por inteligencia artificial. Publicado por el usuario ghostai1 en Hugging Face, el proyecto se presenta como un "Customer Experience Bot Demo" aunque su contenido real es un agente de IA para jugar a Mario, combinando aprendizaje por refuerzo (RL) con heurísticas de búsqueda de caminos. El objetivo declarado es servir como demostración educativa y de investigación en IA aplicada a videojuegos, con aplicaciones potenciales en EdTech, desarrollo de juegos y robótica.

La demo está construida sobre un entorno Gym personalizado (`gym-super-mario-bros`), un agente PPO entrenado con Stable-Baselines3 y un algoritmo A* para navegación. Se despliega mediante Gradio en CPU, sin necesidad de GPU, y el repositorio incluye código para visualización de métricas con Matplotlib. No se trata de un modelo de lenguaje ni de un sistema de diálogo; es un agente de juego con un pipeline de procesamiento de estado y recompensas. La relevancia actual radica en su uso como ejemplo de integración de RL en entornos lúdicos y en su compatibilidad declarada con plataformas cloud como SageMaker o Azure ML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente híbrido: PPO (RL) + A* (pathfinding) + reglas heurísticas |
| Parametros totales | No disponible (modelo ligero ~50 MB, según el autor) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados) |
| Idiomas soportados | No disponible (la interfaz está en inglés) |
| Licencia | MIT (según la model card); el tag en Hugging Face indica GPL-3.0 |
| Formato de pesos | No disponible (repositorio con código Python y dependencias, sin pesos de modelo publicados) |

## Arquitectura y entrenamiento

El sistema combina un agente de aprendizaje por refuerzo basado en PPO (Proximal Policy Optimization) con un algoritmo A* para la planificación de rutas. El agente RL se entrena en un entorno Gym personalizado de Mario, donde la entrada es una representación del estado del juego: píxeles de pantalla reducidos a una cuadrícula de 84x84, apilamiento de 4 fotogramas consecutivos para capturar dinámicas temporales y extracción de características como posiciones de Mario, enemigos y power-ups. Las recompensas se modelan con valores específicos: +10 por moneda, +50 por derrotar enemigos y +1000 por completar el nivel. El entrenamiento se realiza en CPU, con un tamaño de modelo de aproximadamente 50 MB.

El componente heurístico incluye un A* con evitación dinámica de obstáculos y reglas para el comportamiento de los enemigos, que adaptan su dificultad según el progreso del jugador. El sistema también incorpora efectos climáticos adaptativos (lluvia, viento) que afectan al movimiento. No se proporcionan detalles sobre el número de tokens de entrenamiento, composición del dataset o técnicas de alineación como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Control autónomo de un personaje en un entorno de plataformas (Mario), incluyendo saltos, esquiva de enemigos y recolección de objetos.
- Planificación de rutas mediante A* con detección de colisiones en tiempo real.
- Aprendizaje por refuerzo con PPO para optimizar la tasa de finalización de niveles (el autor declara un 90 % simulado).
- Modos de comportamiento seleccionables: "Exploration" (prioriza monedas) y "Speedrun" (prioriza tiempo de finalización).
- Generación de métricas de rendimiento en tiempo real (latencia por etapa, tasa de éxito, monedas recogidas) y visualización con Matplotlib.
- Integración declarada con servicios cloud como Amazon SageMaker y Azure ML para entrenamiento y despliegue escalable.
- Interfaz interactiva mediante Gradio, accesible desde navegador sin necesidad de GPU.

## Casos de uso

- Educacion en IA y RL: el repositorio sirve como ejemplo práctico de entrenamiento de un agente PPO en un entorno Gym, ideal para cursos universitarios de aprendizaje por refuerzo. Los estudiantes pueden modificar las recompensas o el entorno para experimentar.
- Investigacion en agentes de videojuegos: permite estudiar comportamientos emergentes, estrategias de exploración versus speedrun, y el efecto de recompensas personalizadas en el rendimiento del agente.
- Prototipado de sistemas de IA para juegos: desarrolladores de juegos pueden usar la arquitectura híbrida (RL + heurísticas) como base para NPCs adaptativos o controladores automáticos de personajes en demos.
- Demostracion de integracion cloud: el proyecto declara compatibilidad con SageMaker y Azure ML, por lo que puede servir como plantilla para desplegar agentes RL en entornos empresariales de entrenamiento distribuido.
- Visualizacion de metricas de rendimiento: el panel de Matplotlib y las estadísticas en vivo son útiles para monitorizar la latencia de cada componente (pathfinding, IA de enemigos, actualización del juego) en tiempo real, aplicable a otros sistemas de simulación.
- Benchmark de algoritmos de pathfinding: el uso de A* con obstáculos dinámicos permite comparar la eficiencia de diferentes variantes de búsqueda en entornos con cambios en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona una tasa de finalización de nivel simulada del 90 % y métricas de latencia de ejemplo (pathfinding: 5 ms, IA de enemigos: 3 ms, actualización del juego: 2 ms), pero estos datos son ilustrativos y no provienen de una evaluación formal reproducible. No existen comparaciones con otros modelos o agentes en la documentación.

## Requisitos de hardware

- Inferencia en CPU: el modelo es ligero (~50 MB) y está diseñado para ejecutarse sin GPU, compatible con el plan gratuito de Hugging Face Spaces.
- RAM estimada: no se especifica, pero al ser un entorno de juego simulado con Gradio, se recomienda al menos 2 GB para ejecución fluida.
- GPU recomendada: ninguna (no se requiere aceleración gráfica).
- Opciones de despliegue: Hugging Face Spaces (Gradio), contenedores Docker, o servicios cloud como SageMaker o Azure ML según la documentación.
- Latencia y throughput: no hay mediciones formales; los valores de ejemplo del autor (5 ms, 3 ms, 2 ms) son orientativos y dependen del hardware.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en el mismo repositorio o en la documentación. Dado que no es un modelo de lenguaje, no procede compararlo con LLMs de tamaño similar. En el ámbito de agentes RL para juegos de plataformas, existen proyectos como los de OpenAI Gym o las implementaciones de PPO para Super Mario Bros, pero no se dispone de datos de comparación directa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede generar texto, responder preguntas ni realizar tareas de procesamiento de lenguaje natural. Cualquier expectativa en ese sentido es incorrecta.
- La licencia presenta ambigüedad: la model card indica MIT, pero el tag del repositorio en Hugging Face muestra GPL-3.0. Es necesario verificar la licencia aplicable antes de un uso comercial.
- Los resultados de rendimiento (90 % de finalización, latencias) son simulados y no están respaldados por una evaluación reproducible. No deben tomarse como métricas reales de producción.
- La demo depende de librerías específicas (`gym-super-mario-bros`, `stable-baselines3`, `gradio`, `matplotlib`) que pueden tener requisitos de versión y compatibilidad no documentados.
- No se especifican sesgos ni riesgos de alucinación por tratarse de un agente de juego, pero el comportamiento del agente puede ser impredecible en niveles no entrenados.
- El repositorio no incluye pesos del modelo publicados, solo código fuente y dependencias; la reproducibilidad del entrenamiento no está garantizada sin acceso al entorno y a los datos de entrenamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ghostai1/ccengine1
- Model card (README): https://huggingface.co/ghostai1/ccengine1/blob/main/README.md
- Repositorio espejo en GitHub (ghostaimirror/ghostai1): https://github.com/ghostaimirror/ghostai1
