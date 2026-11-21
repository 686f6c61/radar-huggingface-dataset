# priscilla-a/ppo-Huggy

## Resumen

`priscilla-a/ppo-Huggy` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno Huggy de Unity ML-Agents. Lo desarrolla el usuario priscilla-a y se publica en Hugging Face como artefacto reproducible de un entrenamiento con la librería `ml-agents`. No es un modelo de lenguaje: no genera texto ni procesa lenguaje natural, sino que produce políticas de acción para un agente que controla un perro virtual ("Huggy") que debe recoger un palo en un entorno 3D simulado.

El problema que resuelve es acotado y didáctico: servir como política entrenada para el entorno de referencia Huggy, uno de los escenarios introductorios de ML-Agents, y permitir reproducir, reanudar o visualizar el entrenamiento. Es relevante ahora por su función educativa dentro del curso de deep reinforcement learning de Hugging Face, no por capacidades generales de IA.

El repositorio ocupa 0,2 GB y contiene los pesos exportados en formato `.nn` / `.onnx` junto con los artefactos de TensorBoard del entrenamiento. No hay información pública sobre arquitectura de red, hiperparámetros, número de pasos de entrenamiento ni resultados de evaluación más allá de lo que declara la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor para PPO (ML-Agents); topología interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (agente de control, no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.nn` (Unity Barracuda) y `.onnx` |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de policy gradient con clipping de la ratio de probabilidad que estabiliza las actualizaciones de política. En ML-Agents, PPO combina una cabeza de política (distribución de acciones) con una cabeza de valor (estimación de retorno) sobre una red neuronal compartida o separada, cuyas capas, tamaños y funciones de activación no se detallan en la información disponible. El entorno Huggy es un escenario 3D con observaciones vectoriales y acciones continuas o discretas (no especificado), donde el agente aprende a moverse y recoger un palo.

No se dispone del número de pasos de entrenamiento, la composición del buffer, los hiperparámetros (learning rate, batch size, epochs, clip epsilon) ni si hubo recompensas por shaping. Los artefactos de TensorBoard incluidos en el repositorio permitirían inspeccionar curvas de recompensa y pérdidas, pero no se han publicado resúmenes numéricos. La model card indica únicamente cómo reanudar el entrenamiento con `mlagents-learn <config>.yaml --run-id=<id> --resume` y cómo visualizar al agente en el visor web de Hugging Face.

## Capacidades

- Control de un agente virtual en el entorno Huggy de Unity ML-Agents: navegación y recogida del palo.
- Inferencia en tiempo real mediante ONNX Runtime o Unity Barracuda, apta para ejecución en navegador a través del visor de Hugging Face.
- Reanudación del entrenamiento desde el checkpoint publicado.
- Exportación a `.onnx` para integración en motores de juego o pipelines de simulación.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües.
- No dispone de modo thinking, visión, audio ni generación de texto.

## Casos de uso

- Docencia de reinforcement learning: usar el agente como ejemplo resuelto del entorno Huggy en cursos introductorios, comparando la política entrenada con la de un agente sin entrenar.
- Reproducción de experimentos: reanudar el entrenamiento con `mlagents-learn --resume` para estudiar la estabilidad de PPO con distintos hiperparámetros sobre el mismo checkpoint.
- Visualización en navegador: cargar el `.onnx` en el visor de Hugging Face para demostrar el bucle observación-acción de un agente RL sin instalar Unity.
- Integración en simulaciones Unity: importar el `.nn` en un proyecto ML-Agents para poblar escenas con un agente Huggy preentrenado como baseline o como NPC de referencia.
- Pruebas de pipelines de exportación: validar flujos de conversión `.nn` → `.onnx` y su ejecución con ONNX Runtime en entornos de CI.
- Benchmarking de algoritmos RL: emplear este agente como referencia PPO frente a otros algoritmos (SAC, POCA) entrenados en el mismo entorno, siempre que se registren las métricas de recompensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye recompensa media, tasa de éxito en la tarea de recogida del palo, número de pasos hasta convergencia ni comparaciones con otros agentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,2 GB, por lo que los pesos de la red son de tamaño reducido y caben holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime o CUDA; para el visor web basta la GPU del cliente o CPU.
- Cabe en GPU consumer: sí, previsiblemente en cualquier modelo con al menos 2 GB de VRAM; también puede ejecutarse en CPU.
- Opciones de despliegue: Unity Barracuda (`.nn`), ONNX Runtime (`.onnx`), visor de Hugging Face, `mlagents-learn` para reentrenamiento.
- Latencia y throughput: no disponibles; al tratarse de una política de control con observaciones vectoriales, la latencia esperada es de milisegundos, pero no se ha medido ni publicado.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| priscilla-a/ppo-Huggy | Huggy (ML-Agents) | PPO | `.nn`, `.onnx` | no disponible | Hugging Face |
| unity/ML-Agents Huggy (referencia) | Huggy (ML-Agents) | PPO | `.nn`, `.onnx` | no disponible | Hugging Face (org. unity) |
| Agentes PPO de otros entornos ML-Agents (p. ej. Walker, Crawler) | Entornos propios | PPO | `.nn`, `.onnx` | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos agentes en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política solo es válida para el entorno Huggy con la misma configuración de observaciones y acciones; no generaliza a otras tareas.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Sin métricas de evaluación publicadas: se desconoce la calidad real de la política (recompensa media, tasa de éxito).
- Sesgos de simulación: el comportamiento está condicionado por la dinámica y las recompensas del entorno de entrenamiento; cambios en la física o en el shaping pueden degradar el rendimiento.
- Riesgo de sobreajuste al checkpoint: al no documentarse los hiperparámetros ni el número de pasos, no es posible evaluar la robustez del agente.
- No apto para producción en tareas de lenguaje, visión o razonamiento: no es un modelo generativo.
- Idiomas: no aplica; no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/priscilla-a/ppo-Huggy
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto (Huggy en el navegador): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes de Hugging Face: https://huggingface.co/unity
