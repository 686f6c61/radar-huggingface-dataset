# lcata98/ppo-Huggy

## Resumen

`lcata98/ppo-Huggy` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno Huggy de Unity ML-Agents. No es un modelo de lenguaje: es una política neuronal que controla a un personaje simulado (Huggy, un perro) para resolver una tarea de recogida de objetos dentro de una escena 3D de Unity. Lo publica el usuario `lcata98` en Hugging Face y se distribuye con la librería `ml-agents`, en formato ONNX y pesos nativos de ML-Agents.

El interés del artefacto es fundamentalmente didáctico y de referencia: sirve como ejemplo reproducible de un pipeline completo de RL (entrenamiento con ML-Agents, exportación a ONNX y visualización en el navegador mediante el visor de Hugging Face). No aporta capacidades de generación de texto, razonamiento lingüístico ni visión; su ámbito de aplicación se limita a entornos Unity y a la tarea concreta para la que fue entrenado.

La información pública es muy escasa: el repositorio ocupa 0,2 GB, no tiene descargas ni likes, no declara licencia ni idiomas, y la model card se limita a las instrucciones estándar de uso de ML-Agents. Cualquier dato sobre hiperparámetros, número de pasos de entrenamiento o recompensa obtenida no está disponible en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor para PPO (ML-Agents); topología exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos nativos ML-Agents y ONNX) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.nn` (ML-Agents) y `.onnx` |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidades para limitar la magnitud de cada actualización. En ML-Agents, la política suele implementarse como una red fully-connected que procesa observaciones vectoriales (y, opcionalmente, raycasts o sensores) y produce acciones discretas o continuas, con una cabeza separada para la función de valor. La topología concreta, el tamaño de las capas y el tipo de observaciones del entorno Huggy no se detallan en la información disponible.

Tampoco se especifican el número de pasos de entrenamiento, la configuración del fichero YAML, la composición de recompensas ni si se aplicaron técnicas auxiliares como reward shaping, curriculum learning o self-play. La model card únicamente indica que el entrenamiento puede reanudarse con `mlagents-learn <config>.yaml --run-id=<run_id> --resume`, lo que confirma que se generó con el flujo estándar de ML-Agents. El repositorio incluye artefactos compatibles con TensorBoard, según las etiquetas del modelo.

## Capacidades

- Control de política en el entorno Huggy de Unity ML-Agents: el agente aprende a mover el personaje y a interactuar con objetos de la escena según la recompensa definida.
- Inferencia en formato ONNX, lo que permite ejecutarlo fuera del runtime de ML-Agents con herramientas compatibles con ONNX Runtime.
- Reanudación del entrenamiento desde el checkpoint publicado mediante el flag `--resume` de `mlagents-learn`.
- Visualización en el navegador a través del visor de agentes de Hugging Face (selección del fichero `.nn`/`.onnx` en la página del modelo).
- Registro de métricas para TensorBoard durante el entrenamiento (etiqueta `tensorboard`).
- No soporta tool calling, function calling, agentes multi-paso, generación de texto, código, matemáticas, visión ni audio.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el checkpoint como punto de partida en un curso o taller para mostrar cómo se entrena y se publica un agente de ML-Agents en Hugging Face, siguiendo el tutorial oficial de deep-rl-course.
- Reproducción de experimentos: reanudar el entrenamiento con `mlagents-learn --resume` para comparar curvas de recompensa frente a una ejecución desde cero y evaluar la estabilidad de PPO en este entorno.
- Evaluación de políticas en el navegador: cargar el `.onnx` en el visor de Hugging Face para inspeccionar cualitativamente el comportamiento del agente sin instalar Unity.
- Integración en pipelines de CI para ML-Agents: usar el modelo como artefacto de referencia y verificar que el proceso de exportación a ONNX y la carga en el runtime funcionan tras cambios de versión.
- Base para experimentos de transferencia o fine-tuning: partir de esta política y modificar la configuración de recompensas o de observaciones para estudiar cómo afecta al aprendizaje en variantes del entorno Huggy.
- Despliegue en aplicaciones Unity: incorporar el fichero `.nn` como cerebro de un agente no jugador en una build de Unity que use el paquete ML-Agents, por ejemplo en demos interactivas o prototipos de juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio completo ocupa 0,2 GB y la política es una red de tamaño reducido, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no se requiere GPU para la inferencia; una GTX 1650, RTX 3060 o superior es más que suficiente. Para reentrenar, se recomienda al menos una RTX 3060 o una GPU de datacenter (A100, H100) si se paralelizan muchos entornos.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con soporte CUDA; también puede ejecutarse en CPU con ONNX Runtime para inferencia puntual.
- Opciones de despliegue: runtime de ML-Agents (`mlagents-learn` / Barracuda), ONNX Runtime, el visor web de Hugging Face y builds de Unity con el paquete ML-Agents.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lcata98/ppo-Huggy | PPO (ML-Agents) | Huggy | `.nn`, `.onnx` | no disponible | Hugging Face |
| unity/ML-Agents Huggy (referencia oficial) | PPO (ML-Agents) | Huggy | `.nn`, `.onnx` | según repositorio de Unity | Hugging Face (org. unity) |
| Otros agentes PPO de la comunidad ML-Agents | PPO (ML-Agents) | diversos | `.nn`, `.onnx` | variable | Hugging Face |

No se dispone de datos de rendimiento (recompensa media, tasa de éxito) de este checkpoint ni de los alternativos, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K.
- La política está especializada en el entorno Huggy; fuera de él, su comportamiento carece de garantías.
- No se declara licencia, por lo que el uso comercial queda en una situación jurídica indeterminada hasta que el autor la especifique.
- No se documentan sesgos, pero al tratarse de una política entrenada con una recompensa concreta, puede explotar atajos del entorno (reward hacking) si se reutiliza en variantes con la misma función de recompensa.
- El repositorio no tiene descargas ni validación de la comunidad; no hay evidencia pública de la calidad final del agente.
- La ausencia de hiperparámetros y de curvas de entrenamiento impide reproducir el resultado con exactitud.
- El formato `.nn` está ligado a versiones concretas de ML-Agents; cambios de versión pueden romper la compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lcata98/ppo-Huggy
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto (Huggy en el navegador): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Organización Unity en Hugging Face (visor de agentes): https://huggingface.co/unity
