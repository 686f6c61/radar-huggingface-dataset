# BiggestQ/ppo-Huggy

## Resumen

`BiggestQ/ppo-Huggy` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno Huggy de Unity ML-Agents. No se trata de un modelo de lenguaje: es una política neuronal que controla a un perro virtual ("Huggy") para resolver una tarea de recogida de objetos (fetch the stick) dentro de una simulación física de Unity. El modelo lo publica el usuario BiggestQ en Hugging Face y se distribuye con la librería `ml-agents`, en formato de pesos de red neuronal de Unity (`.nn`) y posiblemente ONNX.

La relevancia de este artefacto es acotada y de carácter didáctico: sirve como ejemplo reproducible de un agente PPO entrenado con ML-Agents y como material para los tutoriales oficiales del curso de deep reinforcement learning de Hugging Face. No aporta capacidades de generación de texto, razonamiento, visión ni tool calling, y no compite en la categoría de modelos fundacionales. Su interés práctico se limita a la experimentación con entornos Unity, la comparación de políticas entrenadas y la reproducción de pipelines de entrenamiento con `mlagents-learn`.

El repositorio tiene un tamaño aproximado de 0,2 GB, sin descargas ni likes registrados en el momento de la consulta, y sin licencia ni idiomas declarados. La fecha de creación indicada (2026-11-13) es la que figura en los metadatos del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal de reinforcement learning entrenada con PPO sobre ML-Agents (topología concreta de capas no disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el entorno Huggy no define una ventana de contexto textual) |
| Tipos de cuantización | no disponible (los pesos se distribuyen en formato nativo de ML-Agents/ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.nn` de Unity ML-Agents y `.onnx` (según la model card y los tags del repositorio) |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de policy gradient con clipping de la ratio de probabilidad que estabiliza las actualizaciones de la política. La arquitectura exacta de la red (número de capas, unidades por capa, uso de memoria recurrente o de observaciones vectoriales/visuales) no está documentada en la model card ni en los metadatos disponibles. El entorno Huggy es un escenario de ML-Agents en el que un perro articulado debe desplazarse y recoger un palo, con recompensas que combinan el acercamiento al objetivo y la finalización de la tarea.

No se especifican el número de pasos de entrenamiento, la composición del dataset (en RL no hay dataset supervisado, sino experiencia generada por interacción con el entorno), hiperparámetros de PPO ni si se empleó entrenamiento con currículo, recompensas por imitación o *self-play*. Tampoco se detalla si el agente usa observaciones visuales (cámara) o vectoriales (posiciones y velocidades). La model card únicamente indica que el entrenamiento puede reanudarse con `mlagents-learn <config>.yaml --run-id=<run_id> --resume`, lo que sugiere que el autor dispone de un fichero de configuración YAML no incluido en el repositorio.

## Capacidades

- Control de un agente articulado en el entorno Huggy de Unity ML-Agents: locomoción y manipulación de un objeto (el palo) dentro de la simulación.
- Ejecución de una política PPO entrenada, reproducible mediante `mlagents-learn` o visualizable en el navegador a través del visor de modelos de Hugging Face para entornos Unity.
- Exportación a ONNX, lo que permite la inferencia fuera del runtime de ML-Agents en motores compatibles con ONNX Runtime.
- No soporta generación de texto, razonamiento, código, matemáticas, visión artificial fuera del entorno ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües: no procesa ni produce lenguaje natural.
- No dispone de modo "thinking", visión general o audio.

## Casos de uso

- Reproducción de experimentos de RL: cargar el agente con `mlagents-learn` y reanudar el entrenamiento para comparar curvas de recompensa con otras políticas PPO sobre el mismo entorno.
- Docencia de reinforcement learning: usar el agente como ejemplo funcional en un curso o taller sobre ML-Agents, mostrando el ciclo observación-acción-recompensa en un entorno físico simulado.
- Visualización interactiva en navegador: desplegar el modelo mediante el visor de Hugging Face para Unity y observar el comportamiento del perro sin instalar Unity, útil para demos y presentaciones.
- Integración en pipelines de CI/CD de agentes Unity: ejecutar el `.onnx` con ONNX Runtime en tests automatizados que verifiquen que la política mantiene un umbral mínimo de recompensa tras cambios en el entorno.
- Generación de datos sintéticos de trayectorias: emplear la política entrenada como *behavior policy* para recolectar episodios y alimentar técnicas de imitación o *offline RL*.
- Comparación de algoritmos: servir como línea base PPO frente a otros algoritmos de ML-Agents (SAC, POCA) en el mismo entorno Huggy para evaluar estabilidad y sample efficiency.
- Prototipado de videojuegos: usar el agente como NPC de referencia en una escena de Unity con un perro que recoge objetos, antes de entrenar una política específica para el juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye recompensa media por episodio, tasa de éxito en la tarea de recogida, número de pasos hasta convergencia ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,2 GB y una política de ML-Agents de este tipo suele ser de pocos megabytes, pero no se documenta el tamaño exacto de los pesos.
- GPU recomendadas: no disponible. Para entrenamiento con ML-Agents se suele recomendar una GPU con soporte CUDA (por ejemplo, RTX 3060 o superior), pero el autor no especifica requisitos.
- Cabe en GPU de consumo: probablemente sí, dado el reducido tamaño del repositorio, aunque no se confirma en la documentación.
- Opciones de despliegue: runtime de Unity ML-Agents (`mlagents-learn`), visor web de Hugging Face para entornos Unity y ONNX Runtime para el fichero `.onnx`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BiggestQ/ppo-Huggy | PPO (ML-Agents) | Huggy | no disponible | no aplica | no disponible | Hugging Face |
| unity/ppo-Huggy (referencia del curso) | PPO (ML-Agents) | Huggy | no disponible | no aplica | no disponible | Hugging Face |
| Otros agentes ML-Agents de la organización `unity` | PPO/SAC (ML-Agents) | Varios entornos oficiales | no disponible | no aplica | no disponible | Hugging Face |

La comparación cuantitativa con alternativas no es posible con la información disponible: no se publican métricas de recompensa ni detalles de arquitectura que permitan contrastar rendimiento.

## Limitaciones y advertencias

- Es un agente específico del entorno Huggy: no generaliza a otras tareas, entornos ni dominios fuera de la simulación para la que fue entrenado.
- No es un modelo de lenguaje ni un modelo multimodal; cualquier uso esperado de un LLM (chat, código, RAG, agentes conversacionales) queda fuera de su alcance.
- No se declara licencia, por lo que el uso comercial y la redistribución quedan en un limbo legal que conviene aclarar con el autor antes de cualquier despliegue en producción.
- No se documentan sesgos, pero al ser una política entrenada en simulación puede exhibir comportamientos frágiles ante cambios en la física, en la cámara o en la configuración del entorno (sim-to-real gap).
- No hay información sobre la robustez de la política, la varianza entre semillas ni la recompensa media alcanzada, lo que impide evaluar su calidad objetiva.
- El repositorio no incluye el fichero de configuración YAML de entrenamiento, lo que dificulta la reproducción exacta del pipeline.
- Ausencia de descargas y de validación comunitaria: no hay evidencia externa de que el agente funcione correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BiggestQ/ppo-Huggy
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto (Huggy, curso de deep RL de Hugging Face): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes Unity en Hugging Face: https://huggingface.co/unity
