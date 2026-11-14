# alexacotarlea/ppo-Huggy

## Resumen

`alexacotarlea/ppo-Huggy` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno Huggy, uno de los escenarios de ejemplo de la librería Unity ML-Agents. No es un modelo de lenguaje: se trata de una política neuronal que controla a un personaje (un perro llamado Huggy) en un entorno 3D simulado de Unity, cuyo objetivo es recoger un palo y devolverlo. El modelo lo publica el usuario alexacotarlea en Hugging Face y se distribuye con la librería `ml-agents`.

El interés del artefacto es fundamentalmente didáctico y de demostración: sirve como ejemplo reproducible de un pipeline completo de entrenamiento con ML-Agents (entrenamiento, exportación a `.onnx` y visualización interactiva en el navegador). Su tamaño de repositorio es de 0,2 GB y las etiquetas incluyen `onnx`, `tensorboard` y `deep-reinforcement-learning`.

No se dispone de información sobre licencia, idiomas, arquitectura de la red ni hiperparámetros de entrenamiento en la información proporcionada. Cualquier evaluación de rendimiento debe hacerse ejecutando el agente en el entorno original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para RL (arquitectura exacta no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (agente de control, no genera texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`.onnx`) y formato nativo ML-Agents (`.nn`); repo de 0,2 GB |

## Arquitectura y entrenamiento

Se trata de un agente entrenado con PPO mediante la librería Unity ML-Agents. El entorno Huggy es un escenario de ejemplo en el que un perro debe aprender a moverse hacia un palo y recogerlo; las observaciones son vectoriales y las acciones son continuas (control de movimiento). La política se exporta a ONNX para permitir la inferencia en el navegador a través del visor de modelos de Hugging Face.

No se especifican en la información disponible el número de capas, el tamaño de las capas ocultas, el número de pasos de entrenamiento, la composición de las recompensas ni si se aplicaron técnicas adicionales (curriculum learning, recompensas de imitación, etc.). Tampoco se detalla la semilla ni la configuración YAML usada, aunque la model card indica que el entrenamiento puede reanudarse con `mlagents-learn <config>.yaml --run-id=<run_id> --resume`, lo que implica que el autor conserva o documenta dicha configuración fuera del repositorio.

## Capacidades

- Control de un agente en un entorno 3D de Unity (Huggy) mediante acciones continuas.
- Política entrenada con PPO para una tarea concreta de recogida de objetos.
- Exportación a ONNX para inferencia en el navegador (visor de Hugging Face).
- Compatibilidad con el ecosistema ML-Agents: reanudación de entrenamiento, evaluación y despliegue en Unity.
- Registro de métricas de entrenamiento mediante TensorBoard (etiqueta `tensorboard`).
- No soporta tool calling, agentes multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo funcional de un pipeline PPO completo, desde el entrenamiento hasta la exportación ONNX, en un curso o taller.
- Reproducción de experimentos: reanudar el entrenamiento con `mlagents-learn --resume` para comparar hiperparámetros y curvas de recompensa en TensorBoard.
- Demostración interactiva: incrustar el `.onnx` en el visor de Hugging Face para mostrar en el navegador cómo un agente aprende a recoger un palo, sin instalar Unity.
- Punto de partida para fine-tuning: inicializar un agente en variantes del entorno Huggy (distinta posición del palo, obstáculos) y medir la transferencia de la política.
- Validación de tooling: probar integraciones de ML-Agents con ONNX Runtime o con el visor de Unity ML-Agents antes de escalar a entornos propios.
- Benchmark interno de infraestructura: medir latencia de inferencia de una política pequeña en CPU/GPU para calibrar pipelines de RL en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: muy baja; el repositorio completo ocupa 0,2 GB y la política es una red pequeña típica de ML-Agents (cifras exactas de parámetros no disponibles).
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU consumer (GTX 1060 o superior, RTX 3060, RTX 4090) puede ejecutar la inferencia sobradamente.
- Cabe en GPU consumer: sí, en cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: Unity ML-Agents (runtime nativo), ONNX Runtime, visor web de Hugging Face (`https://huggingface.co/unity`).
- Latencia y throughput: no disponibles; para una política de este tamaño se espera inferencia en el orden de milisegundos por paso en CPU, pero no hay datos publicados que lo confirmen.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alexacotarlea/ppo-Huggy | Huggy (ML-Agents) | PPO | ONNX / .nn | no disponible | Hugging Face |
| unity/ML-Agents Huggy (ejemplos oficiales) | Huggy (ML-Agents) | PPO | .nn / ONNX | según ML-Agents | Repositorio oficial de Unity |
| Agentes PPO de otros entornos ML-Agents (p. ej. Walker, Crawler) | Varios | PPO / SAC | .nn / ONNX | variable | Hugging Face (org. unity) |

La comparación cuantitativa de rendimiento no está disponible al no publicarse métricas de recompensa ni curvas de entrenamiento en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política solo funciona en el entorno Huggy; no es transferible a otras tareas sin reentrenamiento.
- Sin información de licencia: no se puede garantizar el uso comercial; hay que contactar con el autor antes de integrarlo en un producto.
- Sin métricas publicadas: no hay curvas de recompensa, tasa de éxito ni comparación con el agente de referencia de Unity, por lo que no se puede evaluar su calidad objetivamente.
- Sin documentación de hiperparámetros ni configuración YAML en el repositorio, lo que dificulta la reproducibilidad exacta.
- Sin datos de sesgos: al no tratar texto ni datos humanos, los sesgos sociales habituales no aplican, pero puede presentar comportamientos degenerados (políticas que se quedan atascadas) no documentados.
- Advertencia de producción: no es un modelo de lenguaje ni un componente de NLP; no debe usarse para generación de texto, código ni tareas de razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexacotarlea/ppo-Huggy
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto (Huggy en el navegador): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes de Unity en Hugging Face: https://huggingface.co/unity
