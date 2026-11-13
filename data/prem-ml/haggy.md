# prem-ml/haggy

## Resumen

`prem-ml/haggy` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) dentro del entorno de simulación Huggy, que forma parte del ecosistema Unity ML-Agents. El modelo lo publica el usuario `prem-ml` en Hugging Face y su propósito es resolver una tarea concreta de control motor dentro de dicha simulación, no la generación de lenguaje natural. La librería asociada es `ml-agents`, y el artefacto se distribuye como pesos de política entrenada (archivos `.nn`/`.onnx`) listos para ejecutarse con el runtime de Unity ML-Agents o directamente en el navegador a través del visor de Hugging Face.

El modelo no es un modelo de lenguaje ni un transformer generativo: es una política neuronal compacta (red densa) que mapea observaciones del entorno a acciones. Por tanto, conceptos como longitud de contexto, parámetros activos o cuantización en el sentido habitual de los LLM no aplican; el tamaño del repositorio es de 0,2 GB, coherente con un checkpoint de política de RL más los artefactos de TensorBoard y ONNX. Su relevancia es didáctica y de referencia: sirve como ejemplo reproducible de un agente PPO entrenado con ML-Agents y publicable en el Hub.

La información disponible es muy limitada: no hay model card técnica con hiperparámetros, número de pasos de entrenamiento, recompensa alcanzada ni licencia declarada. La ficha se completa con lo que consta y se marca explícitamente como no disponible todo lo que no figura en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política PPO para ML-Agents (no disponible el detalle de capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos `.nn`/`.onnx`; no se documenta cuantización) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.nn` (Unity ML-Agents) y `.onnx` |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidad (*clipped surrogate objective*) que estabiliza las actualizaciones en entornos con recompensa ruidosa. La política se ejecuta dentro del entorno Huggy de Unity ML-Agents, que proporciona observaciones vectoriales del simulador y un espacio de acciones continuas o discretas (no se especifica cuál en la información disponible). El checkpoint se acompaña de artefactos de TensorBoard, lo que permite inspeccionar curvas de entrenamiento, aunque los valores concretos no se publican.

No consta el número de pasos de entrenamiento, la configuración del fichero YAML, la composición de recompensas, ni si se aplicaron técnicas auxiliares como *reward shaping*, *curriculum learning* o *self-play*. Tampoco se documenta ninguna innovación técnica destacable (decodificación especulativa, atención lineal, etc.), ya que no aplican a este tipo de modelo. La única información operativa es que el entrenamiento puede reanudarse con `mlagents-learn <config>.yaml --run-id=<run_id> --resume`.

## Capacidades

- Control de agente en el entorno Huggy de Unity ML-Agents mediante política PPO entrenada.
- Inferencia en el runtime de Unity ML-Agents a partir de pesos `.nn`.
- Exportación a ONNX para ejecución fuera de Unity o en el visor del navegador de Hugging Face.
- Reanudación del entrenamiento desde el checkpoint publicado.
- Visualización de curvas de entrenamiento mediante los artefactos de TensorBoard incluidos en el repositorio.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes multi-paso basados en lenguaje.
- No tiene capacidades multilingües.

## Casos de uso

- Reproducción didáctica del tutorial de Huggy: el checkpoint permite cargar el agente y observar su comportamiento sin reentrenar, útil para quienes siguen el curso de deep RL de Hugging Face.
- Punto de partida para *fine-tuning* con PPO: se puede reanudar el entrenamiento con `--resume` y modificar recompensas o hiperparámetros para experimentar con variantes del entorno.
- Comparación de algoritmos de RL: sirve como baseline PPO frente a otros agentes (SAC, DQN) entrenados en el mismo entorno Huggy.
- Despliegue en navegador: el artefacto ONNX se puede cargar en el visor de Hugging Face (`https://huggingface.co/unity`) para demostraciones interactivas sin instalación local.
- Integración en pipelines de investigación de ML-Agents: el checkpoint se puede usar como referencia para validar que una instalación de ML-Agents funciona correctamente antes de lanzar entrenamientos largos.
- Docencia y workshops: ejemplo mínimo de publicación de un agente RL en el Hub, con estructura de repo y artefactos exportables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No consta la recompensa media alcanzada, la tasa de éxito en la tarea de Huggy ni comparaciones cuantitativas con otros agentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repo (0,2 GB) y la naturaleza de política compacta, es esperable que quepa en cualquier GPU consumer, pero no se documenta.
- GPU recomendadas: no disponible. Para entrenamiento con ML-Agents se suele requerir GPU dedicada (por ejemplo, RTX 3060 o superior), pero no se especifica en la información.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del checkpoint, aunque no se confirma.
- Opciones de despliegue: Unity ML-Agents (runtime `.nn`), ONNX Runtime (`.onnx`), visor web de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prem-ml/haggy | PPO (ML-Agents) | Huggy | `.nn`, `.onnx` | no disponible | Hugging Face |
| unity/ml-agents Huggy (referencia oficial) | PPO (ML-Agents) | Huggy | `.nn`, `.onnx` | no disponible | Hugging Face (org. unity) |
| Otros agentes PPO de ML-Agents en el Hub | PPO (ML-Agents) | varios | `.nn`, `.onnx` | variable | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No hay licencia declarada: el uso comercial queda en un limbo legal hasta que el autor la especifique.
- No hay model card técnica: se desconocen hiperparámetros, número de pasos, recompensa y configuración de entrenamiento, lo que dificulta la reproducibilidad.
- El agente está especializado en el entorno Huggy; no generaliza a otras tareas ni entornos sin reentrenamiento.
- No es un modelo de lenguaje: no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K.
- Posible sobreajuste al entorno de entrenamiento si se usa fuera de la distribución de observaciones prevista.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria del checkpoint.
- La fecha de creación y actualización del repositorio figura como 2026-11-13, dato que conviene verificar en la página original antes de citarlo.
- El visor de Hugging Face requiere que el entorno sea oficial de ML-Agents; Huggy lo es, pero el agente puede no renderizarse correctamente si el archivo `.onnx` no está bien exportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prem-ml/haggy
- Repositorio Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentación ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto (Huggy): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo (ML-Agents): https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes de Hugging Face: https://huggingface.co/unity
