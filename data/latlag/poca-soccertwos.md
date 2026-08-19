# LATlag/poca-SoccerTwos

## Resumen

El modelo `LATlag/poca-SoccerTwos` es un agente de aprendizaje por refuerzo (deep reinforcement learning) entrenado con el algoritmo POCA (Proximal Policy Optimization with Curiosity, o similar) de la librería Unity ML-Agents, especializado en el entorno SoccerTwos de Unity. Fue desarrollado por el usuario LATlag y publicado en Hugging Face como parte de la colección de agentes de ML-Agents. Su propósito es demostrar cómo un agente puede aprender a jugar un partido de fútbol 2 contra 2 en un entorno simulado, tomando decisiones en tiempo real basadas en observaciones del entorno.

El modelo se distribuye en formato ONNX (y posiblemente `.nn`), con un tamaño de repositorio de 0,1 GB, y está diseñado para integrarse directamente en el ecosistema Unity ML-Agents. Aunque no es un modelo de lenguaje ni tiene capacidades de procesamiento de texto, resulta relevante para investigadores y desarrolladores interesados en el aprendizaje por refuerzo, la simulación de agentes autónomos y la publicación de modelos entrenados en entornos de Unity.

La ficha se basa exclusivamente en la información pública disponible en Hugging Face y en la model card del autor. No se dispone de datos sobre licencia, idiomas, métricas de rendimiento ni detalles de entrenamiento más allá de los mencionados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | POCA (algoritmo de reinforcement learning de Unity ML-Agents) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de simulación, no procesamiento de secuencias) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (agente de RL, no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`.onnx`) y/o `.nn` (Unity ML-Agents) |

## Arquitectura y entrenamiento

El modelo se basa en el algoritmo POCA (Proximal Policy Optimization with Curiosity, según la documentación de Unity ML-Agents), una variante del popular PPO que incorpora mecanismos de curiosidad para fomentar la exploración en entornos con recompensas escasas. El agente recibe observaciones del entorno SoccerTwos (posiciones, velocidades, estado del balón, etc.) y produce acciones continuas y discretas para controlar a su personaje.

No se han publicado detalles sobre el número de parámetros, la composición del dataset de entrenamiento, el número de pasos de entrenamiento ni si se utilizaron técnicas adicionales como recompensas de forma o curriculum learning. La model card solo indica que se trata de un agente entrenado con POCA jugando a SoccerTwos, y proporciona comandos para reanudar el entrenamiento o visualizar al agente en acción mediante el visor web de Unity.

## Capacidades

- Jugar al entorno SoccerTwos de Unity (fútbol 2 contra 2) de forma autónoma.
- Tomar decisiones en tiempo real basadas en observaciones del entorno (estado del balón, posiciones de jugadores, etc.).
- Integrarse con la librería Unity ML-Agents para ejecución en Unity Editor o en builds.
- Reanudar el entrenamiento desde el punto guardado mediante `mlagents-learn --resume`.
- Visualizar el comportamiento del agente en el navegador a través del visor de Hugging Face Unity.
- No posee capacidades de lenguaje natural, generación de texto, visión, tool calling ni razonamiento simbólico.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el modelo sirve como punto de partida para estudiar el comportamiento de agentes POCA en entornos multiagente competitivos, comparando estrategias o modificando hiperparámetros.
- Desarrollo de agentes para juegos en Unity: los desarrolladores pueden cargar este modelo en sus proyectos de Unity para implementar oponentes controlados por IA en juegos de deportes o similitudes, sin necesidad de entrenar desde cero.
- Benchmarking de algoritmos de RL: al ser un modelo publicado con un entorno estándar (SoccerTwos), puede utilizarse como referencia para comparar el rendimiento de otros algoritmos o configuraciones.
- Educación en RL: la model card incluye enlaces a tutoriales del Deep RL Course de Hugging Face, por lo que puede emplearse en cursos o talleres para ilustrar el flujo de entrenamiento y despliegue de agentes con ML-Agents.
- Pruebas de integración ML-Agents: el modelo permite validar la correcta configuración de la librería ML-Agents en diferentes versiones de Unity, ya que su formato ONNX es portable.
- Demostraciones interactivas: mediante el visor web de Hugging Face, se puede mostrar el comportamiento del agente en tiempo real, útil para ferias tecnológicas o material divulgativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre métricas de rendimiento, tasas de éxito, recompensas obtenidas ni comparaciones con otros agentes en el entorno SoccerTwos.

## Requisitos de hardware

- Al ser un agente de Unity ML-Agents, la ejecución requiere el motor Unity (versión compatible con ML-Agents). No se especifican requisitos mínimos de GPU o CPU.
- El tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo de tamaño moderado que podría ejecutarse en hardware de consumo, pero no hay datos concretos de VRAM o latencia.
- Para inferencia en Unity, se recomienda una GPU compatible con DX11 o superior, aunque no se indica ninguna GPU específica.
- Opciones de despliegue: integración directa en Unity mediante el paquete ML-Agents, o uso del visor web de Hugging Face (https://huggingface.co/unity) para visualización en navegador.
- No se dispone de información sobre soporte en vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

Existen otros modelos publicados con el mismo nombre y entorno, como `akanametov/MLAgents-poca-SoccerTwos` y `Lakshya2k/poca-SoccerTwos`, que probablemente sean entrenamientos similares del mismo agente POCA en SoccerTwos. Sin embargo, no se dispone de información detallada sobre sus configuraciones, rendimiento o diferencias con respecto a este modelo.

| Modelo | Autor | Tamaño repo | Licencia | Observaciones |
|---|---|---|---|---|
| LATlag/poca-SoccerTwos | LATlag | 0,1 GB | no disponible | Modelo objetivo |
| akanametov/MLAgents-poca-SoccerTwos | akanametov | no disponible | no disponible | Mismo entorno, autor distinto |
| Lakshya2k/poca-SoccerTwos | Lakshya2k | no disponible | no disponible | Mismo entorno, autor distinto |

No se dispone de más datos para una comparativa cuantitativa.

## Limitaciones y advertencias

- Licencia no especificada: no se indica bajo qué términos se distribuye el modelo. Antes de usarlo en proyectos comerciales, es recomendable contactar con el autor o verificar si existe alguna licencia implícita.
- No es un modelo de lenguaje: no puede procesar texto, mantener conversaciones ni realizar tareas de NLP. Su única función es controlar un agente en el entorno SoccerTwos.
- Especialización limitada: el agente está entrenado exclusivamente para SoccerTwos; no es transferible a otros entornos o tareas sin un nuevo entrenamiento.
- Sin información sobre sesgos o alucinaciones: al ser un agente de RL, estos conceptos no aplican, pero sí puede presentar comportamientos subóptimos o poco robustos frente a variaciones en el entorno.
- Dependencia de Unity: para ejecutarlo localmente se requiere tener instalado Unity y el paquete ML-Agents, lo que puede suponer una barrera de entrada.
- Sin métricas de rendimiento: no hay datos objetivos sobre la calidad del comportamiento del agente, por lo que su eficacia debe evaluarse empíricamente.
- Fecha de creación futura: el modelo está fechado en 2026, lo que podría indicar un error en la metadata o un modelo generado de forma automática; conviene verificar su validez.

## Enlaces

- Hugging Face: https://huggingface.co/LATlag/poca-SoccerTwos
- Model card original (README): https://huggingface.co/LATlag/poca-SoccerTwos
- Documentación de Unity ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto del Deep RL Course (Huggy the Dog): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo del Deep RL Course (ML-Agents): https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes Unity en Hugging Face: https://huggingface.co/unity
- Repositorio de ML-Agents en GitHub: https://github.com/Unity-Technologies/ml-agents
- Modelos similares: https://huggingface.co/akanametov/MLAgents-poca-SoccerTwos , https://zoo.bimant.com/model/138557
