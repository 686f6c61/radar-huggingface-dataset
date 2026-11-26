# jonardan/ppo-Pyramids

## Resumen

`jonardan/ppo-Pyramids` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno Pyramids, un escenario de ejemplo incluido en el toolkit Unity ML-Agents. No se trata de un modelo de lenguaje ni de un modelo fundacional: es una política neuronal entrenada para resolver una tarea de control dentro de un simulador Unity, exportada en formato ONNX para su ejecución dentro del motor.

El artefacto lo publica el usuario `jonardan` en Hugging Face bajo la librería `ml-agents`, con fecha de creación del 26 de noviembre de 2026. El repositorio ocupa 0.0 GB, lo que sugiere que contiene únicamente los ficheros de pesos del agente (`.onnx` y, presumiblemente, el `.nn` propietario de ML-Agents) y metadatos, sin documentación extensa ni datasets asociados.

Su relevancia es limitada fuera del ecosistema Unity: sirve como ejemplo reproducible de entrenamiento PPO con ML-Agents y como demostración de despliegue de agentes en el visor web de Hugging Face. No dispone de model card sustantiva, licencia declarada ni especificaciones técnicas publicadas, por lo que la mayor parte de los campos de esta ficha quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor para PPO (ML-Agents); topología exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente RL sobre observaciones del entorno, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, presumiblemente FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (`.onnx`); ML-Agents también usa `.nn` |
| Algoritmo | PPO (Proximal Policy Optimization) |
| Entorno | Pyramids (Unity ML-Agents) |
| Librería | ml-agents |
| Tamaño del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidad (*clipped surrogate objective*) que estabiliza las actualizaciones mediante múltiples épocas de optimización sobre los datos recolectados por la política actual. En ML-Agents, la política suele implementarse como un perceptrón multicapa (o una red recurrente si se habilita memoria) que consume las observaciones vectoriales y, opcionalmente, visuales del entorno, y produce acciones discretas o continuas junto con una estimación del valor del estado.

No se dispone de información sobre el número de pasos de entrenamiento, la configuración del fichero YAML, la semilla, la composición de las observaciones del entorno Pyramids, ni si se empleó memoria recurrente o *curiosity* como recompensa intrínseca. Tampoco hay datos sobre el currículo de entrenamiento ni sobre el rendimiento final alcanzado. La model card únicamente documenta el flujo de uso (reanudar entrenamiento y visualizar al agente) y enlaza a los tutoriales oficiales de ML-Agents.

## Capacidades

- Control de un agente dentro del entorno Pyramids de Unity ML-Agents mediante política entrenada con PPO.
- Ejecución de inferencia en formato ONNX, lo que permite desplegarlo en Unity Barracuda/Inference Engine o en otros runtimes compatibles con ONNX.
- Reanudación del entrenamiento con `mlagents-learn ... --resume` para continuar el ajuste.
- Visualización interactiva en el navegador a través del visor de agentes de Hugging Face.
- No soporta generación de texto, razonamiento simbólico, código, matemáticas, visión general ni tool calling.
- No dispone de capacidades multilingües ni de modo de razonamiento extendido.

## Casos de uso

- Reproducción de experimentos de RL: sirve como punto de partida para comparar curvas de recompensa de PPO en Pyramids frente a otras configuraciones de hiperparámetros.
- Docencia de ML-Agents: permite a estudiantes cargar un agente ya entrenado y observar su comportamiento sin necesidad de entrenar desde cero.
- Reanudación de entrenamiento: útil para extender el número de pasos o modificar la recompensa y comparar el efecto sobre la política resultante.
- Integración en Unity: el fichero ONNX puede importarse en un proyecto Unity con el paquete ML-Agents para controlar un personaje en el escenario Pyramids.
- Benchmark interno de infraestructura: al ser un artefacto pequeño, sirve para validar pipelines de descarga, carga y ejecución de modelos ONNX de RL.
- Demostración del visor web de Hugging Face: ejemplo mínimo para probar el flujo de "Watch the agent play" con un modelo propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del repositorio (0.0 GB) y la naturaleza del entorno, la inferencia debería caber en cualquier GPU consumer con varios cientos de MB libres.
- GPU recomendadas: no disponible; cualquier GPU compatible con Unity o con un runtime ONNX (por ejemplo, GTX 1060 o superior) debería ser suficiente.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU moderna con al menos 2 GB de VRAM, aunque no hay confirmación oficial.
- Opciones de despliegue: Unity ML-Agents (Barracuda/Inference Engine), ONNX Runtime, y el visor web de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jonardan/ppo-Pyramids | Pyramids (ML-Agents) | PPO | no aplica | no disponible | Hugging Face |
| unity/ml-agents-Pyramids | Pyramids (ML-Agents) | PPO | no aplica | no disponible | Hugging Face (organización Unity) |
| unity/ml-agents-Huggy | Huggy (ML-Agents) | PPO | no aplica | no disponible | Hugging Face (organización Unity) |
| unity/ml-agents-Walker | Walker (ML-Agents) | PPO | no aplica | no disponible | Hugging Face (organización Unity) |

La comparación es estructural: todos son agentes PPO de ML-Agents sobre entornos distintos. No se dispone de métricas de recompensa para comparar el rendimiento relativo de este agente frente a los oficiales de Unity.

## Limitaciones y advertencias

- No se declara licencia: el uso comercial queda en un limbo legal hasta que el autor lo aclare.
- La model card es genérica y no documenta hiperparámetros, semilla, número de pasos ni métricas de recompensa.
- El agente está especializado en Pyramids; no generaliza a otros entornos ni tareas.
- No hay información sobre sesgos, robustez ni comportamiento en distribuciones de observación distintas a las de entrenamiento.
- Riesgo de sobreajuste al escenario concreto si el entrenamiento fue corto; no hay curvas de aprendizaje publicadas para verificarlo.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria del artefacto.
- Para producción en Unity conviene verificar la compatibilidad de la versión de ML-Agents y del runtime ONNX con la que se generó el fichero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jonardan/ppo-Pyramids
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto (Huggy the Dog): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Organización Unity en Hugging Face: https://huggingface.co/unity
