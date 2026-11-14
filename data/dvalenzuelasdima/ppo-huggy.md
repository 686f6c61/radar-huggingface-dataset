# dvalenzuelasdima/ppo-Huggy

## Resumen

`dvalenzuelasdima/ppo-Huggy` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno **Huggy**, uno de los escenarios de ejemplo de la librería Unity ML-Agents. El modelo no es un modelo de lenguaje ni un transformer generativo: es una política neuronal entrenada para controlar a un perro virtual que debe perseguir y atrapar un palo en un entorno 3D simulado. Lo publica el usuario `dvalenzuelasdima` en Hugging Face con fecha de creación de noviembre de 2026 y un tamaño de repositorio de 0,2 GB.

Su relevancia es fundamentalmente didáctica: sirve como artefacto reproducible para el curso de deep reinforcement learning de Hugging Face y para demostrar el flujo de entrenamiento, exportación y publicación de agentes ML-Agents en el Hub. No compite en la categoría de modelos fundacionales, sino en la de políticas de control entrenadas mediante RL.

El repositorio no incluye información sobre arquitectura de red, hiperparámetros de entrenamiento, número de pasos ni métricas de recompensa. La model card se limita a los pasos de uso con ML-Agents y a enlaces a tutoriales, por lo que la ficha se completa indicando explícitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal PPO entrenada con Unity ML-Agents; topología no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en formato nativo ML-Agents/ONNX, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.nn` (formato nativo de ML-Agents) y `.onnx` (exportación para inferencia) |

## Arquitectura y entrenamiento

El agente se entrena con el algoritmo PPO implementado en Unity ML-Agents, que combina una red de política y una red de valor sobre observaciones del entorno (vectoriales y, en el caso de Huggy, potencialmente visuales, aunque la model card no lo especifica). El entorno Huggy es un escenario de control continuo en el que el agente debe aprender a moverse y a interactuar con un objeto (el palo) mediante recompensas por acercamiento y captura.

No se dispone de información sobre el número de pasos de entrenamiento, la composición de las observaciones, la arquitectura exacta de las capas ocultas, el uso de recompensas intrínsecas (curiosity, RND) ni el proceso de ajuste de hiperparámetros. Tampoco se documenta si el entrenamiento se completó o se interrumpió, ni si se aplicaron técnicas de imitación (GAIL/BC) o de curriculum learning.

## Capacidades

- Control de un agente virtual en el entorno Huggy de Unity ML-Agents: locomoción y persecución de un objetivo.
- Inferencia en tiempo real dentro del motor Unity mediante el formato `.nn` o exportación `.onnx`.
- Reproducción del entrenamiento mediante `mlagents-learn --resume` con el fichero de configuración correspondiente.
- Visualización del agente jugando directamente en el navegador a través de la integración de Hugging Face con los entornos oficiales de Unity.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- **Docencia de reinforcement learning**: usar el agente como ejemplo resuelto en un curso o taller para ilustrar el ciclo completo de entrenamiento PPO con ML-Agents, desde la definición de recompensas hasta la exportación a ONNX.
- **Reproducción de experimentos**: reanudar el entrenamiento con `mlagents-learn <config>.yaml --run-id=<id> --resume` para comparar curvas de recompensa frente a políticas entrenadas desde cero.
- **Prueba de pipelines de despliegue en Unity**: integrar el fichero `.nn` en una build de Unity y verificar el comportamiento del agente en un entorno de juego real antes de entrenar políticas propias.
- **Evaluación de la integración Hub–ML-Agents**: validar el flujo de publicación y visualización en el navegador que ofrece Hugging Face para entornos Unity oficiales.
- **Generación de datos sintéticos de comportamiento**: ejecutar la política en el entorno para recoger trayectorias (estado-acción-recompensa) que sirvan como datos de imitación para otros agentes.
- **Benchmark interno de infraestructura de inferencia RL**: medir latencia y throughput de la política exportada a ONNX en CPU/GPU como referencia para comparar con políticas propias del mismo entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye recompensa media, tasa de éxito en la tarea de recoger el palo, número de pasos hasta convergencia ni comparación con políticas de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,2 GB, lo que sugiere una política de tamaño reducido que probablemente cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no disponible; para inferencia en tiempo real dentro de Unity basta una GPU de gama media (por ejemplo, GTX 1060 o superior) o incluso CPU para políticas pequeñas.
- Cabe en GPU consumer: muy probablemente sí, dado el tamaño del artefacto, aunque no hay confirmación oficial.
- Opciones de despliegue: Unity ML-Agents (formato `.nn`), ONNX Runtime (formato `.onnx`), visualización en el navegador vía Hugging Face.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dvalenzuelasdima/ppo-Huggy` | Huggy (ML-Agents) | PPO | `.nn`, `.onnx` | no disponible | Hugging Face |
| Agentes oficiales de Unity en `huggingface.co/unity` | Varios entornos ML-Agents (Huggy, Walker, Pyramids, etc.) | PPO y otros | `.nn`, `.onnx` | generalmente permisiva, consultar cada repo | Hugging Face |
| Políticas de referencia del curso Deep RL de Hugging Face | Huggy y otros entornos del curso | PPO | `.nn`, `.onnx` | variable según autor | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está declarada, lo que impide asumir permisos de uso comercial o de redistribución sin consultar al autor.
- No hay información sobre la calidad de la política entrenada: se desconoce si converge, si supera una línea base aleatoria o si el entrenamiento quedó incompleto.
- El ámbito de aplicación es exclusivamente el entorno Huggy; la política no generaliza a otras tareas ni entornos.
- No es un modelo de lenguaje: no procesa texto, no responde a prompts y no tiene capacidades de razonamiento simbólico.
- La ausencia de documentación sobre hiperparámetros y datos de entrenamiento limita la reproducibilidad exacta del resultado.
- Riesgo de sobreajuste al escenario concreto si se reutiliza en variantes del entorno con físicas o recompensas distintas.
- No se han identificado sesgos sociales, pero tampoco se ha auditado el comportamiento del agente en condiciones fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dvalenzuelasdima/ppo-Huggy
- Documentación de Unity ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de ML-Agents en GitHub: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto (Huggy en el navegador): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Organización de Unity en Hugging Face: https://huggingface.co/unity
