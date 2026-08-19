# LATlag/ppo-Pyramids

## Resumen

El modelo `LATlag/ppo-Pyramids` es un agente de aprendizaje por refuerzo (reinforcement learning) entrenado con el algoritmo PPO (Proximal Policy Optimization) para resolver el entorno Pyramids de Unity ML-Agents. Este entorno consiste en un escenario 3D donde un agente debe navegar, recoger objetos y llevarlos a una zona objetivo, lo que lo convierte en un banco de pruebas clásico para evaluar políticas de control en entornos continuos y discretos.

Desarrollado por el usuario LATlag y publicado en Hugging Face, el modelo se distribuye como un artefacto entrenado listo para ser cargado con la librería ML-Agents, ya sea para reanudar el entrenamiento, ejecutar inferencias o visualizar el comportamiento del agente en el navegador. Su relevancia radica en ser un ejemplo práctico de aplicación de RL en entornos 3D, útil para investigadores y desarrolladores que buscan reproducir experimentos o comparar políticas.

No se dispone de información detallada sobre la arquitectura interna, el número de parámetros o los datos de entrenamiento, más allá de que se utilizó PPO y el entorno Pyramids. El repositorio incluye archivos en formato ONNX o Unity (`.nn`), lo que permite su integración en pipelines de ML-Agents.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de ML-Agents (no especificada; típicamente MLP o CNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, sin contexto de lenguaje) |
| Tipos de cuantizacion | no disponible (posible cuantizacion en ONNX, no confirmada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`.onnx`) o Unity (`.nn`) |

## Arquitectura y entrenamiento

El modelo se entrenó con el algoritmo PPO, implementado en la librería Unity ML-Agents. PPO es un método de optimización de política basado en gradientes que equilibra exploración y explotación mediante un recorte de la función de objetivo, lo que lo hace estable y adecuado para entornos 3D como Pyramids. El entorno Pyramids presenta un agente que debe recoger cubos y colocarlos en una pirámide, lo que implica navegación espacial, percepción visual (si se usan observaciones de cámara) y toma de decisiones discretas.

No se han publicado detalles sobre la composición del dataset de entrenamiento, el número de pasos, las recompensas específicas ni si se aplicaron técnicas adicionales como curriculum learning o normalización de observaciones. La model card solo indica que se usó PPO y que el agente juega a Pyramids, sin más especificaciones técnicas.

## Capacidades

- Navegación en entornos 3D: el agente es capaz de moverse en el escenario Pyramids, evitando obstáculos y alcanzando objetivos.
- Recolección y colocación de objetos: interactúa con cubos para llevarlos a la zona de construcción de la pirámide.
- Toma de decisiones secuenciales: la política entrenada decide acciones discretas (movimiento, rotación, agarre) en cada paso.
- Inferencia en tiempo real: al exportarse a ONNX, puede ejecutarse en motores de inferencia como Unity o en entornos externos.
- Reanudación de entrenamiento: permite continuar el proceso de aprendizaje desde el estado guardado.
- Visualización en navegador: compatible con la herramienta de Hugging Face para ver al agente jugar directamente en el navegador.

## Casos de uso

- Investigación en aprendizaje por refuerzo: sirve como punto de partida para estudiar el comportamiento de PPO en entornos 3D, comparar hiperparámetros o analizar la robustez de la política.
- Demostraciones educativas: en cursos de RL, se puede utilizar para ilustrar cómo un agente aprende a resolver una tarea de navegación y manipulación, con la ventaja de poder visualizarlo en el navegador.
- Benchmark de algoritmos: al ser un entorno estandarizado, permite comparar el rendimiento de PPO frente a otros algoritmos (SAC, DQN, etc.) bajo las mismas condiciones.
- Desarrollo de extensiones de ML-Agents: los desarrolladores pueden usar este modelo como base para probar modificaciones del entorno o de la función de recompensa.
- Integración en pipelines de simulación: el archivo ONNX puede integrarse en simuladores Unity para pruebas de control autónomo en escenarios similares.
- Reproducción de experimentos: investigadores pueden reanudar el entrenamiento con `--resume` para explorar la continuación del aprendizaje o ajustar la configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como recompensa media, éxito en episodios o comparativas con otros agentes en el entorno Pyramids.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un modelo de RL de tamaño reducido (típicamente menos de 1 millón de parámetros), la inferencia puede ejecutarse en CPU sin necesidad de GPU.
- GPU recomendadas: no especificadas. Para entrenamiento, ML-Agents puede usar CPU o GPU, pero no se indica ningún requisito concreto.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño pequeño, pero no hay confirmación.
- Opciones de despliegue: Unity ML-Agents (para ejecutar en el entorno), ONNX Runtime (para inferencia externa), o la herramienta de visualización de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Existen otros agentes PPO entrenados en el mismo entorno Pyramids publicados en Hugging Face, como `Lategardener/ppo-Pyramids` y `mikewzp/ppo-Pyramid`. Sin embargo, no se dispone de información detallada sobre sus arquitecturas, rendimiento o configuraciones de entrenamiento, por lo que no es posible realizar una comparación cuantitativa. Todos comparten la misma tarea y el mismo algoritmo base, pero las diferencias en hiperparámetros, semillas y duración del entrenamiento pueden dar lugar a políticas distintas.

| Modelo | Autor | Entorno | Algoritmo | Formato | Licencia |
|---|---|---|---|---|---|
| LATlag/ppo-Pyramids | LATlag | Pyramids | PPO | ONNX/Unity | no disponible |
| Lategardener/ppo-Pyramids | Lategardener | Pyramids | PPO | ONNX/Unity | no disponible |
| mikewzp/ppo-Pyramid | mikewzp | Pyramids | PPO | ONNX/Unity | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un agente entrenado en un entorno simulado, su comportamiento está limitado a las dinámicas de Pyramids y no generaliza a otros escenarios.
- Riesgo de alucinacion: no aplica, ya que no es un modelo generativo de lenguaje.
- Limitaciones de contexto o idioma: no aplica, al no ser un modelo de lenguaje.
- Restricciones de licencia: la licencia no está especificada, por lo que se desconoce si permite uso comercial o modificación. Se recomienda contactar al autor antes de utilizarlo en proyectos productivos.
- Caveats para produccion: el modelo está diseñado exclusivamente para el entorno Pyramids; su uso fuera de este contexto no tiene sentido. Además, al no haber métricas de rendimiento publicadas, no se puede garantizar la calidad de la política.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/LATlag/ppo-Pyramids)
- [Documentación de Unity ML-Agents](https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/)
- [Curso de Deep RL - Unidad 5 (ML-Agents)](https://huggingface.co/learn/deep-rl-course/unit5/introduction)
- [Curso de Deep RL - Bonus: Huggy the Dog](https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction)
