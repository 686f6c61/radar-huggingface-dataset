# HasanBozkurt/ppo-Huggy

## Resumen

`HasanBozkurt/ppo-Huggy` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (*Proximal Policy Optimization*) sobre el entorno **Huggy**, uno de los escenarios de ejemplo de la librería **Unity ML-Agents**. No es un modelo de lenguaje: es una política neuronal que controla a un perro virtual tridimensional cuya tarea consiste en perseguir un palo y devolverlo. El autor lo publica en Hugging Face con la librería `ml-agents` y pesos exportables a `.nn` (formato nativo de Unity) y `.onnx`.

El modelo es relevante por su valor didáctico y como referencia reproducible, no por su rendimiento bruto: sirve para demostrar el ciclo completo de entrenamiento, exportación e inferencia de un agente de RL en el ecosistema Unity, y permite visualizar la política directamente en el navegador a través de la integración entre Hugging Face y Unity. Es, en la práctica, un artefacto de tutorial.

La información publicada es muy escasa: el repositorio ocupa 0,2 GB, no tiene descargas ni *likes*, no declara licencia ni idiomas, y la *model card* no incluye hiperparámetros, número de pasos de entrenamiento ni métricas de recompensa. Cualquier evaluación cuantitativa del agente queda, por tanto, pendiente de reproducción local.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal (MLP) entrenada con PPO dentro del *framework* Unity ML-Agents; no es un transformer ni un modelo generativo |
| Parámetros totales | no disponible (la *model card* no declara el tamaño de la red; el repo completo pesa 0,2 GB e incluye checkpoints y ficheros de TensorBoard) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de RL; consume observaciones por paso de simulación, no secuencias de texto) |
| Tipos de cuantización | no disponible; los artefactos publicados son checkpoints de ML-Agents y exportaciones ONNX, sin variantes cuantizadas documentadas |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible (la *model card* no especifica licencia) |
| Formato de pesos | `.nn` (Unity ML-Agents) y `.onnx` (ONNX), según los ficheros referenciados en la tarjeta |
| Algoritmo | PPO (*Proximal Policy Optimization*) |
| Entorno | Huggy (Unity ML-Agents) |
| Librería | `ml-agents` |
| Tamaño del repositorio | 0,2 GB |
| Descargas / *likes* | 0 / 0 |
| Fecha de creación | 2026-10-18 |

## Arquitectura y entrenamiento

Se trata de un agente PPO, un algoritmo *on-policy* con objetivo surrogate recortado y estimación de ventaja (habitualmente GAE) que en ML-Agents se implementa sobre una red neuronal de pequeñas dimensiones con cabezas separadas para política y función de valor. La política consume las observaciones que expone el entorno Huggy (observaciones vectoriales y, según la configuración del escenario, observaciones visuales) y emite acciones continuas o discretas para el control del perro. La *model card* no detalla el número de capas, unidades por capa, tasa de aprendizaje, tamaño de *batch*, horizonte ni número total de pasos, por lo que estos datos deben considerarse **no disponibles**.

Tampoco se documenta la composición del dataset, porque en RL no existe tal: la política se entrena por interacción con la simulación, recolectando experiencias generadas por ella misma (y potencialmente por políticas de demostración si se hubiese usado *imitation learning*, extremo no confirmado). No hay fases de RLHF ni DPO. El autor sí indica que el entrenamiento puede reanudarse con `mlagents-learn <config>.yaml --run-id=<id> --resume`, lo que implica que los checkpoints conservan el estado necesario para continuar el *training*.

## Capacidades

- Control de un agente físico en el entorno Unity Huggy: localización del palo y ejecución de la conducta de recogida.
- Política entrenada lista para inferencia, sin necesidad de reentrenamiento.
- Exportación a ONNX, lo que permite ejecutar el agente en Unity Barracuda, en ONNX Runtime o en el visor web de Hugging Face.
- Reanudación del entrenamiento desde los checkpoints publicados mediante la CLI de ML-Agents.
- Compatibilidad con TensorBoard para inspeccionar curvas de entrenamiento (etiqueta `tensorboard` en el repo).
- No soporta *tool calling*, ni generación de texto, ni razonamiento multi-paso simbólico, ni capacidades multilingües, ni visión de propósito general.
- No dispone de modo *thinking*, audio ni ninguna otra capacidad propia de modelos fundacionales.

## Casos de uso

- **Docencia de aprendizaje por refuerzo**: usar el agente como ejemplo resuelto del ciclo observación-acción-recompensa en un curso introductorio, cargándolo en Unity o en el visor del navegador para que el alumnado vea la política en funcionamiento sin escribir código.
- **Reproducción de experimentos**: servir de baseline PPO frente a variantes (SAC, POCA, curricula) entrenadas sobre el mismo escenario Huggy, comparando curvas de recompensa en TensorBoard.
- **Validación de pipelines de exportación**: comprobar que un checkpoint de ML-Agents se convierte correctamente a ONNX y se ejecuta con latencias aceptables en Barracuda u ONNX Runtime antes de industrializar un flujo similar con entornos propios.
- **Demos interactivas en el navegador**: publicar el modelo en un Space enlazado al visor de la organización Unity en Hugging Face para que cualquier visitante vea al agente jugar sin instalar nada.
- **Pruebas de infraestructura de inferencia**: emplear el agente como carga de trabajo ligera para medir *throughput* y latencia por paso de simulación en distintas configuraciones de CPU/GPU o en distintos *runtimes*.
- **Punto de partida para *fine-tuning* y *curriculum learning***: reanudar el entrenamiento con variaciones del entorno (posición inicial del palo, obstáculos, física) y estudiar la transferencia de la política preentrenada.
- **Generación de datos sintéticos de trayectorias**: ejecutar la política para recolectar *rollouts* que alimenten experimentos de *offline RL* o de *behavior cloning*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La métrica natural de este agente es la recompensa media acumulada (*mean reward*) en el entorno Huggy, junto con la tasa de episodios resueltos, pero la *model card* no reporta ninguna de las dos, ni curvas de aprendizaje, ni comparaciones con otras políticas. Tampoco existen datos de MMLU, HumanEval o GSM8K, que no aplican a un agente de control.

## Requisitos de hardware

- **VRAM**: no aplica en sentido estricto; la política es una red de pequeño tamaño y puede ejecutarse en CPU con un consumo de memoria del orden de cientos de MB, muy por debajo de 1 GB.
- **GPU recomendadas**: ninguna en particular. Cualquier GPU compatible con Unity u ONNX Runtime acelera la inferencia, pero no es requisito; para reentrenar, una GPU de gama media acorta los tiempos de recolección y actualización.
- **GPU de consumo**: sí, cabe holgadamente en cualquier tarjeta de consumo e incluso en gráficas integradas, dado el reducido tamaño del repositorio (0,2 GB, que incluye checkpoints y logs).
- **Opciones de despliegue**: `mlagents` (Python) para inferencia y reentrenamiento, Unity Barracuda para ejecución dentro del motor, ONNX Runtime para integraciones externas y el visor web de Hugging Face + Unity para demos en navegador. No procede usar vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- **Latencia y throughput**: no disponible. No hay mediciones publicadas de pasos por segundo ni de tiempo de decisión por *frame*.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parámetros | Contexto | Licencia | Datos publicados |
|---|---|---|---|---|---|---|
| HasanBozkurt/ppo-Huggy | PPO | Huggy (ML-Agents) | no disponible | no aplica | no disponible | recompensa no publicada |
| Otros agentes `ppo-Huggy` del Hub (p. ej. los generados en el curso de *deep RL* de Hugging Face) | PPO | Huggy (ML-Agents) | no disponible | no aplica | habitualmente no especificada | generalmente sin métricas |
| Agentes de ejemplo oficiales de Unity ML-Agents (p. ej. 3DBall, Walker) | PPO / SAC | Entornos de ejemplo de Unity | no disponible | no aplica | la del repositorio de ML-Agents | métricas en documentación del proyecto |
| Agentes con otros algoritmos sobre Huggy (SAC, POCA) | SAC / POCA | Huggy (ML-Agents) | no disponible | no aplica | no disponible | no disponible |

La comparación cuantitativa no es posible con la información pública: ninguno de los artefactos comparables declara tamaño de red ni recompensa final de forma consistente. La comparación útil es metodológica (algoritmo, entorno y ecosistema de ejecución), no de rendimiento.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no genera texto, no responde preguntas y no admite *prompts*; cualquier uso en ese sentido es un error de categoría.
- **Sesgo de entorno**: la política está especializada en un único escenario (Huggy con la configuración usada al entrenar). Cambios en la física, en la escala del escenario o en el punto de aparición del palo pueden degradar la conducta sin previo aviso.
- **Sobreajuste a la versión de ML-Agents**: los checkpoints `.nn` son sensibles a la versión de la librería y del *runtime* de Unity; conviene fijar versiones al reproducir.
- **Ausencia de métricas**: sin recompensa media ni curvas publicadas no es posible saber si la política está bien convergida o si el entrenamiento se interrumpió de forma prematura.
- **Licencia no especificada**: la falta de licencia impide asumir permisos de uso comercial, modificación o redistribución. Es un riesgo legal real si se pretende integrar en un producto.
- **Riesgo de alucinación**: no aplica en el sentido habitual, pero sí existe el riesgo de que la política ejecute conductas degeneradas (bucles, quedarse quieta) fuera de la distribución de estados vista durante el entrenamiento.
- **Sin soporte multilingüe ni accesibilidad**: no hay interfaz de lenguaje; la interacción es exclusivamente a través de la simulación.
- **Reproducibilidad incompleta**: al no publicarse el fichero YAML de configuración ni el número de pasos, replicar exactamente el resultado no es factible sin ingeniería inversa de los checkpoints.
- **Escaso respaldo de la comunidad**: 0 descargas y 0 *likes* implican que no hay validación externa ni issues resueltos que sirvan de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HasanBozkurt/ppo-Huggy
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto (enseñar a Huggy a buscar el palo y jugar en el navegador): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo sobre el funcionamiento de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes de Unity en Hugging Face: https://huggingface.co/unity

Nota: la búsqueda web asociada a esta ficha no devolvió resultados relacionados con el modelo; los enlaces anteriores provienen de la *model card* y de la documentación oficial del proyecto.
