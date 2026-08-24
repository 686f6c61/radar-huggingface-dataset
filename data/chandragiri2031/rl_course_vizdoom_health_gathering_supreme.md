# Chandragiri2031/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este modelo es un agente de aprendizaje por refuerzo (RL) entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. El objetivo del agente es recoger paquetes de salud en un escenario 3D de Doom, maximizando la recompensa acumulada. Ha sido desarrollado por el usuario Chandragiri2031 como parte de un curso de RL, utilizando la librería Sample-Factory 2.0, una herramienta de entrenamiento de RL de alto rendimiento que permite paralelización asíncrona y entrenamiento eficiente en entornos de videojuegos.

El modelo se distribuye como un checkpoint de Sample-Factory, con un tamaño de repositorio de 0.1 GB. No se especifican detalles de arquitectura interna (número de capas, tipo de red), ni la licencia, ni los idiomas soportados, ya que al ser un agente de RL para un entorno de juego no aplican los mismos criterios que para modelos de lenguaje. Su relevancia radica en ser un ejemplo práctico de entrenamiento de agentes con RL en entornos parcialmente observables, y en la posibilidad de reanudar el entrenamiento o evaluar el comportamiento del agente mediante las herramientas de Sample-Factory.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica entrenada con APPO (no se detalla la topologia) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de RL con observaciones de frames) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint de Sample-Factory (formato propio de la libreria) |

## Arquitectura y entrenamiento

El modelo se ha entrenado con el algoritmo APPO, una variante asíncrona de PPO que combina la eficiencia de la actualización de políticas proximales con la paralelización de múltiples actores y aprendices. Sample-Factory 2.0 es la librería utilizada, conocida por su alto rendimiento en entornos de juegos como ViZDoom, y permite entrenar agentes con observaciones de píxeles y acciones discretas. No se dispone de información sobre el número de pasos de entrenamiento, la composición del dataset (aunque en RL se usa el propio entorno como fuente de datos) ni si se aplicaron técnicas adicionales como recompensas modeladas o curriculum learning. El checkpoint guarda los pesos de la política y posiblemente los del crítico, permitiendo reanudar el entrenamiento o ejecutar la política entrenada.

## Capacidades

- Agente de RL especializado en el entorno `doom_health_gathering_supreme` de ViZDoom, cuyo objetivo es recoger paquetes de salud.
- Toma decisiones basadas en observaciones visuales (frames del juego) y produce acciones discretas (movimiento, rotación, etc.).
- Capacidad de aprendizaje por refuerzo: puede mejorar su política mediante entrenamiento adicional con el script de reanudación.
- No posee capacidades de lenguaje, generación de texto, razonamiento simbólico ni tool calling, al ser un modelo puramente de control para un entorno de juego.

## Casos de uso

- Investigación en aprendizaje por refuerzo: sirve como punto de partida para estudiar el comportamiento de APPO en entornos parcialmente observables, comparar con otros algoritmos o analizar la curva de aprendizaje.
- Evaluación de algoritmos de RL: al ser un checkpoint entrenado, permite reproducir experimentos y validar implementaciones de RL en ViZDoom.
- Reanudación de entrenamiento: se puede continuar el entrenamiento desde el estado guardado para explorar si el agente alcanza recompensas más altas con más pasos.
- Demostración educativa: útil en cursos de RL para mostrar cómo se entrena y evalúa un agente en un entorno de juego, usando las herramientas de Sample-Factory.
- Benchmark de entornos ViZDoom: puede utilizarse como referencia de rendimiento (mean_reward 11.69) para comparar con otros agentes entrenados en el mismo entorno.
- Desarrollo de agentes para juegos: aunque el entorno es específico, el flujo de trabajo (entrenar, guardar, cargar, evaluar) puede servir de plantilla para otros entornos de ViZDoom o similares.

## Benchmarks y rendimiento

El autor declara en el model-index el siguiente resultado, sin verificación independiente:

| Algoritmo | Entorno | Métrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 11.69 +/- 6.02 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 0.1 GB, lo que sugiere un modelo pequeño (probablemente una red convolucional compacta). No se especifican requisitos de VRAM.
- Dado el tamaño, es probable que pueda ejecutarse en CPU para inferencia, aunque la evaluación en tiempo real del entorno ViZDoom puede requerir una GPU para alcanzar velocidades de interacción aceptables.
- Para reanudar el entrenamiento, se recomienda una GPU con al menos 4-8 GB de VRAM, dependiendo del tamaño del batch y la resolución de los frames, aunque no hay datos oficiales.
- Opciones de despliegue: el modelo se ejecuta mediante los scripts de Sample-Factory (`enjoy` para evaluación, `train` para entrenamiento). No es compatible directamente con vLLM, Ollama u otros frameworks de modelos de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos entrenados en el mismo entorno con métricas comparables. En HuggingFace existen otros checkpoints con el mismo nombre de entorno (por ejemplo, `Ryukijano/rl_course_vizdoom_health_gathering_supreme` o `Srgreen/rl_course_vizdoom_health_gathering_supreme`), pero no se han encontrado sus resultados de recompensa. Por tanto, no es posible realizar una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en el entorno `doom_health_gathering_supreme`; no es generalizable a otras tareas ni entornos.
- La recompensa media declarada (11.69 ± 6.02) presenta una alta varianza, lo que indica que el rendimiento del agente puede ser inconsistente entre episodios.
- No se especifica la licencia, por lo que se desconoce si su uso comercial está permitido. Se recomienda contactar con el autor antes de utilizarlo en proyectos con fines comerciales.
- Al ser un modelo de RL, puede presentar comportamientos no deseados o explotar bugs del entorno si se entrena durante demasiados pasos.
- No hay información sobre sesgos, alucinaciones u otros riesgos típicos de modelos de lenguaje, ya que no es un modelo de este tipo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Chandragiri2031/rl_course_vizdoom_health_gathering_supreme
- Librería Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Guía de uso de HuggingFace con Sample-Factory: https://www.samplefactory.dev/10-huggingface/huggingface/
