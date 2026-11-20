# jdapolista/ppo-Huggy

## Resumen

`jdapolista/ppo-Huggy` es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno **Huggy**, uno de los escenarios de ejemplo de la librería Unity ML-Agents. No es un modelo de lenguaje ni un transformer generativo: es una política neuronal que controla a un perro virtual ("Huggy the Dog") en una tarea de recogida de un palo dentro de un simulador 3D de Unity.

El modelo lo publica el usuario jdapolista en Hugging Face y sigue exactamente el formato estándar que genera `mlagents-learn` al finalizar un entrenamiento: pesos exportados en formato `.nn` (formato propietario de ML-Agents basado en Barracuda) y `.onnx` para inferencia en el navegador. El repositorio ocupa 0,2 GB e incluye los artefactos habituales de TensorBoard.

Su relevancia es fundamentalmente didáctica: sirve como ejemplo reproducible del flujo completo de entrenamiento y despliegue de un agente con ML-Agents, y puede visualizarse directamente en el visor de Hugging Face sin descargar nada. No está pensado para uso en producción ni como componente de sistemas de IA general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor para PPO (ML-Agents); topología exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | `.nn` (ML-Agents/Barracuda) y `.onnx` |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de policy gradient con clipping de la ratio de probabilidad que estabiliza las actualizaciones de la política. En ML-Agents, la política suele implementarse como un perceptrón multicapa que procesa las observaciones vectoriales del entorno (posiciones, velocidades, estado del objetivo) y produce acciones continuas o discretas. La topología concreta de las capas ocultas, el número de parámetros y la configuración del fichero YAML de entrenamiento no se detallan en la model card.

El entrenamiento se realiza contra el entorno Huggy incluido en los ejemplos oficiales de Unity ML-Agents, con recompensas basadas en acercarse al palo y recogerlo. El repositorio incluye logs de TensorBoard (`tensorboard` entre las etiquetas) que permiten inspeccionar la curva de recompensa acumulada, aunque no se proporcionan métricas numéricas en la documentación. No hay información sobre número de pasos de entrenamiento, hiperparámetros ni semillas utilizadas.

## Capacidades

- Control de un agente virtual en el entorno Huggy de Unity ML-Agents (locomoción y recogida de objeto).
- Inferencia en tiempo real dentro del simulador de Unity mediante Barracuda o el runtime de ML-Agents.
- Exportación a ONNX, lo que permite ejecución en navegador con el visor de Hugging Face.
- Reanudación del entrenamiento desde el checkpoint publicado mediante `mlagents-learn --resume`.
- No soporta generación de texto, código, matemáticas, visión artificial general, tool calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni modo "thinking": es una política específica para una única tarea.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo funcional de un agente PPO entrenado con ML-Agents para ilustrar el ciclo observación-acción-recompensa en un curso introductorio.
- Reproducción de experimentos: permite reanudar el entrenamiento (`--resume`) y comparar curvas de recompensa con variaciones de hiperparámetros, útil para validar configuraciones de PPO.
- Demostración en navegador: al estar en formato `.onnx`, puede cargarse en el visor de Hugging Face (https://huggingface.co/unity) para mostrar el comportamiento del agente sin instalación local.
- Base para transferencia a otras tareas de ML-Agents: los pesos pueden servir como inicialización en entornos con observaciones y acciones similares, reduciendo el tiempo de convergencia.
- Pruebas de pipelines de despliegue de ML-Agents: valida el flujo completo desde el entrenamiento hasta la exportación `.nn`/`.onnx` y la integración con Barracuda en builds de Unity.
- Material de referencia para el curso gratuito de Deep RL de Hugging Face, que enlaza directamente a este tipo de agentes en su unidad sobre ML-Agents.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye recompensa media, tasa de éxito ni comparación con otros agentes, y el repositorio solo contiene logs de TensorBoard sin cifras resumidas.

## Requisitos de hardware

- Inferencia: al ser una política pequeña (típicamente del orden de decenas de miles de parámetros en entornos ML-Agents), puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no se requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) acelera el entrenamiento, no la inferencia.
- Cabe en cualquier GPU consumer y también en CPU; el límite práctico es el motor Unity, no la red neuronal.
- Despliegue: runtime de ML-Agents (Barracuda) dentro de Unity, `onnxruntime` para inferencia ONNX, o el visor web de Hugging Face.
- Latencia y throughput: no disponibles; dependen del motor de simulación y del hardware, no del modelo en sí.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jdapolista/ppo-Huggy | Huggy (ML-Agents) | PPO | `.nn`, `.onnx` | no disponible | Hugging Face |
| unity/ML-Agents Huggy (ejemplos oficiales) | Huggy (ML-Agents) | PPO (configuración de referencia) | `.nn`, `.onnx` | licencia de Unity ML-Agents | Repositorio de Unity |
| Agentes PPO de otros entornos ML-Agents (p. ej. Walker, Crawler) | Entornos varios | PPO/SAC | `.nn`, `.onnx` | variable según autor | Hugging Face (org. unity) |

No se dispone de datos de rendimiento comparativo entre estos agentes en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política solo funciona en el entorno Huggy con la misma configuración de observaciones y acciones; no generaliza a otras tareas.
- Sin licencia declarada: la ausencia de licencia impide asumir permisos de uso comercial; hay que contactar con el autor antes de reutilizarlo en productos.
- Sin métricas de rendimiento: no hay evidencia publicada de tasa de éxito ni de robustez del agente, por lo que no es adecuado como referencia de calidad.
- Dependencia del motor Unity y de la versión de ML-Agents: cambios en el entorno o en el runtime pueden invalidar los pesos.
- Riesgo de sobreajuste al escenario de entrenamiento: el comportamiento fuera de la distribución de observaciones vistas durante el entrenamiento no está caracterizado.
- No apto para producción como componente de IA generativa: no procesa lenguaje, imágenes ni audio, y no ofrece API de texto.
- Los logs de TensorBoard pueden contener información del entorno de entrenamiento; conviene revisarlos antes de redistribuir el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jdapolista/ppo-Huggy
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto (Huggy en el navegador): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes de Hugging Face: https://huggingface.co/unity
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
