# Pro152/rl_course_vizdoom_health_gathering_supreme

## Resumen

El modelo `Pro152/rl_course_vizdoom_health_gathering_supreme` es un agente de aprendizaje por refuerzo (reinforcement learning) entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de VizDoom. Fue desarrollado por el usuario Pro152 como parte de un curso de RL, utilizando la librería Sample-Factory 2.0. El objetivo del agente es aprender a recolectar paquetes de salud en un escenario 3D de disparos en primera persona, maximizando la recompensa media obtenida.

Este modelo no es un modelo de lenguaje ni de visión general, sino un agente especializado en una tarea concreta de control. Su relevancia radica en ser un ejemplo práctico de entrenamiento de agentes RL con Sample-Factory, una herramienta de código abierto ampliamente usada en la comunidad. El repositorio ocupa 0.1 GB e incluye los pesos del modelo entrenado, aunque no se especifican detalles de la arquitectura de red neuronal ni el número de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (agente de RL, red neuronal no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entorno visual, sin lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente checkpoint de Sample-Factory, no confirmado) |

## Arquitectura y entrenamiento

El modelo se entrenó con el algoritmo APPO, una variante asíncrona de PPO implementada en Sample-Factory 2.0. APPO combina la estabilidad de PPO con la eficiencia de la recolección de experiencias asíncrona, lo que permite escalar el entrenamiento en entornos como VizDoom. No se proporcionan detalles sobre la arquitectura de la red neuronal (posiblemente una CNN para procesar las observaciones visuales del entorno, pero no se confirma). Tampoco se indica el número de pasos de entrenamiento, la composición del dataset (en RL no hay dataset estático, sino interacción con el entorno) ni si se aplicaron técnicas adicionales como recompensas modeladas o curriculum learning.

## Capacidades

- Control de un agente en el entorno `doom_health_gathering_supreme` de VizDoom, donde debe recolectar paquetes de salud.
- Toma de decisiones basada en observaciones visuales del entorno (píxeles) y posiblemente otras señales, aunque no se especifica.
- No tiene capacidades de generación de texto, razonamiento simbólico, tool calling ni procesamiento de lenguaje natural.
- No es multilingüe ni multimodal en el sentido de modelos de lenguaje; su entrada es el estado del entorno de juego.
- No soporta agentes conversacionales ni tareas de razonamiento de alto nivel.

## Casos de uso

- Investigación en aprendizaje por refuerzo: sirve como punto de partida para estudiar el comportamiento de APPO en entornos de navegación y recolección de objetos, comparando con otros algoritmos.
- Demostración educativa: en cursos de RL, se puede cargar el modelo para visualizar cómo un agente entrenado resuelve la tarea, o para continuar su entrenamiento con `--restart_behavior=resume`.
- Evaluación de algoritmos: al ser un modelo pequeño (0.1 GB), es útil para probar pipelines de entrenamiento y evaluación en hardware modesto.
- Benchmark de entornos: puede usarse como referencia para medir el rendimiento de otros agentes en el mismo entorno, aunque no hay datos comparativos publicados.
- Experimentación con Sample-Factory: los usuarios pueden descargar el modelo y ejecutar el script `enjoy` para ver el agente en acción, o subir sus propios modelos al Hub siguiendo el mismo flujo.
- Transferencia de aprendizaje: aunque no se documenta, el modelo podría servir como inicialización para tareas similares en VizDoom, aunque su utilidad real no está verificada.

## Benchmarks y rendimiento

El autor declara el siguiente resultado oficial en la model card:

| Algoritmo | Entorno | Métrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 3.81 +/- 0.79 |

No se han publicado comparaciones con otros modelos ni resultados en otros benchmarks. La métrica `mean_reward` indica la recompensa media obtenida por episodio, con una desviación estándar de 0.79. No hay datos sobre velocidad de inferencia, throughput ni latencia.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware.
- Dado el tamaño del repositorio (0.1 GB), es probable que el modelo quepa en una GPU de consumo (por ejemplo, RTX 3060 o superior) o incluso en CPU, pero no hay confirmación.
- Para ejecutar el agente con Sample-Factory, se recomienda una GPU con al menos 4 GB de VRAM para entornos visuales, aunque no es un requisito documentado.
- Opciones de despliegue: el modelo se ejecuta mediante los scripts de Sample-Factory (`enjoy` para inferencia, `train` para continuar entrenamiento). No se menciona compatibilidad con vLLM, llama.cpp u otros frameworks de inferencia, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Existen otros repositorios con el mismo nombre de entorno y algoritmo (por ejemplo, `nomad-ai/rl_course_vizdoom_health_gathering_supreme`, `Vishath/rl_course_vizdoom_health_gathering_supreme`, `HusseinEid101/-rl_course_vizdoom_health_gathering_supreme-`), pero no se dispone de información técnica comparativa (parámetros, rendimiento, licencia) de estos modelos. Por tanto, no es posible realizar una comparativa objetiva.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en el entorno `doom_health_gathering_supreme`; no es generalizable a otras tareas ni entornos.
- No se ha documentado la arquitectura de red, el número de parámetros ni los hiperparámetros de entrenamiento, lo que dificulta la reproducibilidad y el análisis.
- La licencia no está especificada, por lo que el uso comercial o la redistribución pueden ser inciertos.
- No se han evaluado sesgos ni riesgos de alucinación, ya que no es un modelo generativo de texto.
- La recompensa media declarada (3.81) es baja en términos absolutos, lo que sugiere que el agente no alcanza un rendimiento óptimo en la tarea; podría ser un modelo de ejemplo de un curso, no un agente de producción.
- No se proporcionan instrucciones claras sobre cómo integrar el modelo en aplicaciones externas más allá de los scripts de Sample-Factory.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pro152/rl_course_vizdoom_health_gathering_supreme
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Otros repositorios similares encontrados en la búsqueda web:
  - https://huggingface.co/nomad-ai/rl_course_vizdoom_health_gathering_supreme
  - https://huggingface.co/Vishath/rl_course_vizdoom_health_gathering_supreme
  - https://github.com/HusseinEid101/-rl_course_vizdoom_health_gathering_supreme-
