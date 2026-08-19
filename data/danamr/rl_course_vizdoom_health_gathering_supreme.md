# danamr/rl_course_vizdoom_health_gathering_supreme

## Resumen

El modelo `danamr/rl_course_vizdoom_health_gathering_supreme` es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Este entorno plantea un escenario de navegación y recolección de objetos en un laberinto 3D generado proceduralmente, donde el agente debe maximizar la cantidad de botiquines de salud recogidos en un tiempo limitado. El modelo ha sido desarrollado por el usuario `danamr` y publicado en Hugging Face, probablemente como parte de un curso de aprendizaje por refuerzo, dado el prefijo `rl_course` en su nombre.

La relevancia de este modelo reside en su utilidad como ejemplo práctico de aplicación de algoritmos de RL con la librería Sample-Factory 2.0, que permite entrenar agentes en entornos 3D de forma eficiente. Al tratarse de un modelo de demostración educativa, no está pensado para tareas de procesamiento de lenguaje natural ni para producción general, sino para ilustrar el flujo completo de entrenamiento, evaluación y despliegue de agentes RL en entornos de simulación. El repositorio ocupa 0.2 GB e incluye los pesos del agente junto con los metadatos necesarios para su carga y ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | APPO (Asynchronous Proximal Policy Optimization) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, es un agente RL con observaciones de estado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente PyTorch, pero no se especifica) |

## Arquitectura y entrenamiento

La arquitectura del modelo se basa en el algoritmo APPO, una variante asíncrona del popular PPO (Proximal Policy Optimization) implementada en la librería Sample-Factory 2.0. APPO combina la estabilidad de PPO con la eficiencia del entrenamiento asíncrono distribuido, lo que permite escalar el entrenamiento en múltiples workers que interactúan con el entorno en paralelo mientras el aprendiz actualiza los pesos de la red. La red neuronal subyacente no está documentada en la información disponible, pero típicamente en entornos ViZDoom se utiliza una CNN que procesa las observaciones visuales (frames RGB) junto con una cabeza de política y una de valor.

El entrenamiento se realizó sobre el entorno `doom_health_gathering_supreme`, que forma parte del benchmark ViZDoom. Este entorno presenta un laberinto con habitaciones y pasillos, donde el agente debe explorar para encontrar y recoger botiquines de salud. La recompensa se otorga por cada botiquín recogido, y el episodio termina al alcanzar un límite de tiempo o al morir. No se dispone de información sobre el número de pasos de entrenamiento, la configuración de hiperparámetros ni el dataset utilizado, más allá de que se usó la versión 2.0 de Sample-Factory.

## Capacidades

- Navegación autónoma en entornos 3D: el agente es capaz de moverse por un laberinto generado proceduralmente, evitando obstáculos y tomando decisiones de exploración.
- Recolección de objetos: su objetivo principal es localizar y recoger botiquines de salud, lo que implica planificación de rutas y priorización de objetivos.
- Percepción visual: procesa observaciones de tipo imagen (frames RGB) para tomar decisiones, aunque no se especifica la resolución ni el preprocesado.
- Control continuo de acciones discretas: ViZDoom permite acciones discretas como moverse, girar y disparar, que el agente selecciona según su política aprendida.
- Aprendizaje por refuerzo: el modelo ha sido entrenado mediante RL, por lo que su comportamiento es el resultado de optimizar una función de recompensa, no de reglas programadas.

## Casos de uso

- Educacion en aprendizaje por refuerzo: es un ejemplo didactico para estudiantes que quieran ver un agente RL entrenado en un entorno 3D, con codigo disponible para cargarlo, evaluarlo y reanudar su entrenamiento.
- Investigacion en algoritmos de RL: sirve como punto de partida para comparar variantes de PPO, probar modificaciones de hiperparametros o estudiar el efecto de diferentes funciones de recompensa en entornos de navegacion.
- Desarrollo de agentes para videojuegos: aunque el entorno es simplificado, el flujo de entrenamiento puede adaptarse a otros escenarios de ViZDoom o a juegos 3D similares.
- Benchmarking de infraestructuras de entrenamiento: al ser un modelo ligero (0.2 GB), permite probar pipelines de entrenamiento distribuido con Sample-Factory en diferentes configuraciones de hardware.
- Prueba de integracion de Hugging Face con RL: el modelo demuestra como publicar y cargar agentes RL en el Hub, lo que facilita la reproducibilidad de experimentos.
- Generacion de demos interactivas: se puede ejecutar el script `enjoy` para visualizar el comportamiento del agente en tiempo real, util para presentaciones o validacion cualitativa.

## Benchmarks y rendimiento

El autor declara en el model-index un unico resultado:

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 8.58 ± 4.40 |

Este valor indica la recompensa media obtenida por el agente en el entorno, con una desviacion estandar de 4.40. No se proporcionan comparaciones con otros modelos ni con agentes entrenados con algoritmos alternativos, por lo que no es posible evaluar su rendimiento relativo. Tampoco se dispone de datos sobre el numero de episodios evaluados ni sobre la variabilidad entre semillas.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al tratarse de un agente RL con entrada visual, la inferencia requiere una GPU con al menos 2-4 GB de VRAM para ejecutar la CNN de forma comoda. Sin GPU, la inferencia en CPU es posible pero mas lenta.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 2060 o superior) es suficiente para ejecutar el modelo. El entrenamiento, si se quisiera reanudar, se beneficiaria de multiples GPUs, pero no hay requisitos minimos documentados.
- Compatibilidad con GPU de consumo: si, el modelo es ligero y cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: el modelo se ejecuta mediante los scripts de Sample-Factory (`enjoy` para inferencia, `train` para continuar entrenamiento). No se menciona compatibilidad con vLLM, llama.cpp u otras herramientas de inferencia de modelos de lenguaje, ya que no es un modelo de texto.
- Latencia y throughput: no disponibles. La velocidad de inferencia dependera del hardware y de la resolucion de las observaciones, pero para un entorno como ViZDoom se espera que sea en tiempo real o superior.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos entrenados en el mismo entorno con los que comparar directamente. Existen otros repositorios en Hugging Face con nombres identicos (por ejemplo, `Ryukijano/rl_course_vizdoom_health_gathering_supreme` o `Vishath/rl_course_vizdoom_health_gathering_supreme`) que probablemente sean agentes entrenados con la misma configuracion por diferentes usuarios, pero no se han publicado metricas comparables. Por tanto, no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un agente entrenado en un entorno de simulacion especifico, su comportamiento no es transferible a otros entornos ni a tareas reales.
- Riesgo de alucinacion: no aplica, ya que no es un modelo generativo de texto.
- Limitaciones de contexto o idioma: no aplica, el modelo no procesa lenguaje natural.
- Restricciones de licencia: la licencia no esta especificada en la informacion disponible, por lo que se desconoce si permite uso comercial o modificacion. Se recomienda contactar con el autor antes de utilizarlo en proyectos con fines lucrativos.
- Caveats para produccion: el modelo es una demostracion educativa y no ha sido validado para entornos de produccion. Su rendimiento puede degradarse significativamente si se cambia la resolucion de las observaciones o la configuracion del entorno.
- Dependencia de Sample-Factory: para cargar y ejecutar el modelo es necesario instalar la libreria Sample-Factory 2.0, lo que puede suponer una barrera de entrada en entornos sin esa dependencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danamr/rl_course_vizdoom_health_gathering_supreme
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentacion de Sample-Factory: https://www.samplefactory.dev/
- Guia de Hugging Face para Sample-Factory: https://www.samplefactory.dev/10-huggingface/huggingface/
- Otro modelo similar (mismo entorno, distinto autor): https://huggingface.co/Ryukijano/rl_course_vizdoom_health_gathering_supreme
- Otro modelo similar (mismo entorno, distinto autor): https://huggingface.co/Vishath/rl_course_vizdoom_health_gathering_supreme
