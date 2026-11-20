# SMONICA/ppo-Huggy-the-dog

## Resumen

`SMONICA/ppo-Huggy-the-dog` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno Huggy, un escenario de ejemplo incluido en la librería Unity ML-Agents. El modelo no es un modelo de lenguaje ni un sistema generativo: es una política neuronal que controla el comportamiento de un perro virtual que debe aprender a recoger un palo y devolverlo. Lo desarrolla el usuario SMONICA y se publica en Hugging Face con la librería `ml-agents`, en formato `.nn`/`.onnx`, con un tamaño de repositorio de 0,2 GB.

Su relevancia es fundamentalmente didáctica y de investigación en RL: sirve como artefacto reproducible para demostrar el flujo completo de entrenamiento, reanudación y visualización de un agente en el navegador mediante el visor de Hugging Face. No compite con modelos fundacionales ni con LLM; su interés está en el ecosistema ML-Agents y en la enseñanza del entrenamiento por refuerzo profundo.

La información pública disponible es mínima: no hay model card detallada, ni hiperparámetros, ni curvas de recompensa, ni licencia declarada. Cualquier dato no presente en la información proporcionada se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política entrenada con PPO sobre Unity ML-Agents (detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato .nn/.onnx; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | .nn (Unity ML-Agents) y .onnx (ONNX) |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidad para limitar actualizaciones destructivas, ampliamente usado en ML-Agents por su estabilidad en entornos de acción continua y discreta. El entorno Huggy es un escenario de control motor donde el agente observa el estado del perro y del palo y emite acciones de movimiento; la recompensa se basa en acercarse y recuperar el palo. El repositorio incluye los artefactos de entrenamiento (`.nn`, `.onnx`) y referencias a TensorBoard, lo que sugiere que se registraron métricas durante el entrenamiento, aunque no se publican curvas ni valores concretos.

No se dispone de información sobre el número de pasos de entrenamiento, la configuración del `.yaml` de ML-Agents, el tamaño de las capas ocultas, el uso de recompensas intrínsecas (curiosity, RND) ni de técnicas avanzadas como self-play o imitación. Tampoco se documenta si hubo ajuste fino posterior ni qué versión de ML-Agents se utilizó.

## Capacidades

- Control de un agente virtual en el entorno Huggy de Unity ML-Agents (movimiento y recogida del palo).
- Inferencia en formato ONNX, lo que permite ejecutarlo fuera de Unity con runtimes compatibles.
- Reproducibilidad del entrenamiento mediante `mlagents-learn ... --resume`.
- Visualización del agente directamente en el navegador a través del visor de Hugging Face (https://huggingface.co/unity).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, visión, audio ni generación de texto: es una política de RL, no un modelo generativo.
- No tiene capacidades multilingües ni de diálogo.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo resuelto en un curso o taller para mostrar el ciclo entrenamiento-evaluación-despliegue con ML-Agents.
- Reproducción de experimentos: reanudar el entrenamiento con `mlagents-learn --resume` para comparar hiperparámetros y curvas de recompensa frente a una línea base.
- Benchmark de entornos: emplear Huggy como tarea de referencia para comparar PPO con SAC, PPO con recompensas intrínsecas u otros algoritmos en ML-Agents.
- Demostración interactiva: incrustar el `.onnx` en una demo web o en el visor de Hugging Face para mostrar el comportamiento del agente a una audiencia no técnica.
- Integración en pipelines de CI: validar que el artefacto `.onnx` carga y produce acciones coherentes en un test automatizado de regresión de políticas.
- Investigación en simulación: usar el agente como baseline en estudios de sim-to-real o de robustez frente a perturbaciones del entorno, siempre que se documenten las limitaciones del escenario.
- Prototipado de videojuegos: servir como política inicial para un NPC con comportamiento de recogida de objetos en un prototipo Unity.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,2 GB) y la naturaleza de la política, es esperable que quepa en cualquier GPU consumer, pero no se documenta.
- GPU recomendadas: no disponible; para inferencia de una política ML-Agents típica basta una GPU modesta o incluso CPU.
- Cabe en GPU consumer: previsiblemente sí (GTX 1060 o superior), aunque no hay datos oficiales.
- Opciones de despliegue: Unity ML-Agents (runtime nativo), ONNX Runtime, y el visor de Hugging Face para reproducción en navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SMONICA/ppo-Huggy-the-dog | PPO (ML-Agents) | Huggy | .nn / .onnx | no disponible | Hugging Face |
| unity/ML-Agents Huggy (oficial) | PPO (ML-Agents) | Huggy | .nn / .onnx | según repositorio oficial | Hugging Face (org. unity) |
| Otros agentes PPO de la comunidad en ML-Agents | PPO | diversos | .nn / .onnx | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo (recompensa media, tasa de éxito) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona simbólicamente y no admite prompts.
- La política está especializada en el entorno Huggy; no generaliza a otras tareas sin reentrenamiento.
- No se declara licencia, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de usarlo en producción.
- No se publican hiperparámetros, curvas de entrenamiento ni métricas de evaluación, por lo que no se puede verificar la calidad de la política.
- Riesgo de sobreajuste al escenario de entrenamiento y de comportamiento frágil ante cambios en la física o en la configuración de la escena.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-20) es futura respecto a la fecha habitual de consulta; conviene verificar la integridad del artefacto antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/SMONICA/ppo-Huggy-the-dog
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto (Huggy en el navegador): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Repositorio ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Visor de agentes de Hugging Face: https://huggingface.co/unity
