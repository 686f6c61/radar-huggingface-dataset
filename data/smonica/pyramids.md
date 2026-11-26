# SMONICA/Pyramids

## Resumen

`SMONICA/Pyramids` es un modelo de aprendizaje por refuerzo profundo (deep reinforcement learning) publicado en Hugging Face por el usuario SMONICA. No se trata de un modelo de lenguaje, sino de una política entrenada con el algoritmo PPO (Proximal Policy Optimization) dentro del entorno "Pyramids" del ecosistema Unity ML-Agents. El artefacto es, por tanto, un conjunto de pesos de red neuronal que controla un agente dentro de una simulación Unity, no un generador de texto.

El repositorio emplea la librería `ml-agents` y exporta los pesos en formato nativo `.nn` de Unity, junto con posibles exportaciones `.onnx` para inferencia. Según los metadatos, el tamaño del repositorio es de 0,0 GB (prácticamente vacío o con artefactos de muy pequeño tamaño), sin descargas ni interacciones registradas en el momento de la consulta. La licencia y los idiomas no están declarados.

Su relevancia es limitada y acotada al ámbito de la investigación en RL y a la experimentación con ML-Agents: sirve como ejemplo reproducible de una política PPO entrenada en un entorno concreto y como material didáctico para quienes siguen los tutoriales oficiales de ML-Agents y del curso de deep RL de Hugging Face. No debe confundirse con un modelo fundacional ni usarse para tareas de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política PPO para ML-Agents (no disponible el detalle de capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.nn` (Unity ML-Agents) y `.onnx` (exportación) |

## Arquitectura y entrenamiento

El modelo es una política entrenada con PPO mediante Unity ML-Agents sobre el entorno "Pyramids". PPO es un algoritmo de optimización de política con recorte de la ratio de probabilidad (clipped surrogate objective) que estabiliza el entrenamiento on-policy en espacios de observación y acción continuos o discretos. La arquitectura concreta de la red (número de capas, unidades por capa, tipo de observaciones —vectoriales, visuales o ambas—) no se detalla en la model card ni en los metadatos, por lo que no puede confirmarse si emplea un encoder visual convolucional o únicamente observaciones vectoriales.

No se especifican el número de pasos de entrenamiento, la composición del entorno, hiperparámetros de PPO (learning rate, clip range, batch size, número de épocas), ni si se aplicaron técnicas adicionales como recompensas intrínsecas, curricula o self-play. La model card únicamente indica que el entrenamiento puede reanudarse con `mlagents-learn <config>.yaml --run-id=<run_id> --resume`, lo que implica que el autor conserva o referencia una configuración YAML no incluida en el repositorio.

## Capacidades

- Control de un agente dentro del entorno Unity "Pyramids" mediante la política PPO entrenada.
- Inferencia en el navegador a través del visor de Hugging Face para entornos ML-Agents oficiales.
- Exportación a ONNX para despliegue fuera de Unity (Barracuda, ONNX Runtime u otros motores compatibles).
- Reanudación del entrenamiento con ML-Agents para fine-tuning o continuación de la política.
- No soporta generación de texto, razonamiento, código, matemáticas, visión general ni tool calling.
- No soporta agentes multi-step en el sentido de LLMs; su "razonamiento" se limita a la política reactiva aprendida en el entorno.
- No dispone de capacidades multilingües ni de modo "thinking".

## Casos de uso

- Reproducción de experimentos en ML-Agents: cargar el `.nn` con `mlagents-learn` y verificar el comportamiento del agente en el entorno Pyramids para validar pipelines de entrenamiento.
- Material didáctico en cursos de deep RL: usar el modelo como ejemplo de política PPO ya entrenada dentro de los tutoriales de Hugging Face Deep RL Course y de la documentación de ML-Agents.
- Benchmark de referencia para nuevos entrenamientos: comparar curvas de recompensa de políticas propias frente a esta política base en el mismo entorno.
- Despliegue en el visor web de Hugging Face: seleccionar el archivo `.onnx` y observar al agente jugar directamente en el navegador, útil para demos y presentaciones.
- Integración en builds de Unity: incorporar el `.nn` como comportamiento de un agente en una escena Unity para prototipos de juego o simulación.
- Exportación a ONNX para inferencia en producción ligera: usar el `.onnx` en un runtime compatible (ONNX Runtime, Barracuda) para ejecutar la política sin depender del editor de Unity.
- Base para experimentos de transferencia o fine-tuning: reanudar el entrenamiento con una configuración YAML propia y evaluar la adaptación de la política a variantes del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye curvas de recompensa, tasas de éxito ni comparaciones con otras políticas en el entorno Pyramids.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una política de RL de pequeño tamaño (repositorio de 0,0 GB), es previsible que quepa en cualquier GPU consumer, pero no hay datos confirmados.
- GPU recomendadas: no disponible. Para inferencia de políticas ML-Agents pequeñas suele bastar con GPUs de gama baja o incluso CPU, aunque no se confirma para este modelo.
- ¿Cabe en GPU consumer? Muy probablemente sí, dado el tamaño del repositorio, pero no está verificado.
- Opciones de despliegue: Unity ML-Agents (`mlagents-learn`), visor web de Hugging Face para entornos oficiales, ONNX Runtime o Unity Barracuda para el `.onnx`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (políticas PPO para el entorno Pyramids) con los que establecer una comparación de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- Licencia no declarada: no puede asumirse uso comercial sin confirmación explícita del autor.
- Idiomas no declarados: irrelevante para su función, pero impide cualquier uso en tareas lingüísticas.
- Especialización extrema: la política está entrenada para un único entorno (Pyramids) y no generaliza a otras tareas sin reentrenamiento.
- Riesgo de sobreajuste al entorno: sin datos de entrenamiento ni curvas, no puede evaluarse la robustez ante variaciones del entorno.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- Tamaño del repositorio de 0,0 GB: conviene verificar que los artefactos `.nn`/`.onnx` estén realmente presentes antes de intentar cargarlos.
- Sin información sobre sesgos: no aplica en el sentido de sesgos sociales de LLMs, pero la política puede exhibir comportamientos no deseados propios del entrenamiento por refuerzo (reward hacking, comportamientos degenerados).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SMONICA/Pyramids
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto (Huggy the Dog): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes ML-Agents en Hugging Face: https://huggingface.co/unity
