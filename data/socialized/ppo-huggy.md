# Socialized/ppo-Huggy

## Resumen

`Socialized/ppo-Huggy` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno **Huggy**, uno de los escenarios de ejemplo de la librería **Unity ML-Agents**. El modelo lo publica el usuario `Socialized` en Hugging Face y su propósito no es el procesamiento de lenguaje natural, sino servir como política entrenada para controlar al perro virtual Huggy dentro de una simulación Unity.

El repositorio contiene los artefactos estándar de ML-Agents (ficheros `.nn` / `.onnx` y datos de TensorBoard) y ocupa aproximadamente 0,2 GB. No es un modelo de lenguaje: no tiene parámetros en el sentido habitual de un transformer, no procesa texto ni dispone de ventana de contexto lingüístico. Su relevancia es la de un ejemplo reproducible de entrenamiento de RL con ML-Agents, útil para quienes aprenden la librería o quieren reanudar el entrenamiento.

La información publicada es muy escasa: la model card se limita a indicar el algoritmo, el entorno y los pasos para visualizar al agente en el navegador a través de la página de Unity en Hugging Face. No se declaran licencia, idiomas, arquitectura de red ni métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor entrenada con PPO sobre ML-Agents (topología exacta no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.nn` (formato nativo de ML-Agents) y `.onnx` |

## Arquitectura y entrenamiento

El agente se entrena con **PPO**, un algoritmo de gradiente de política con recorte de la ratio de probabilidades (*clipped surrogate objective*) que estabiliza la actualización de la política. La política y la función de valor se implementan como redes neuronales densas cuyas capas de entrada dependen de las observaciones del entorno Huggy (observaciones vectoriales y, según la configuración, raycasts o sensores) y cuya salida son acciones continuas o discretas del agente. La topología concreta, el número de capas y el tamaño de las mismas no se detallan en la información disponible.

El entrenamiento se ha realizado con la **Unity ML-Agents Library** y los registros de TensorBoard se incluyen en el repositorio. No se especifican el número de pasos de entrenamiento, la configuración del fichero YAML, la composición del dataset (en RL no hay dataset al uso, sino interacción con el simulador) ni si se aplicaron técnicas adicionales como *reward shaping*, *curriculum learning* o *self-play*. El modelo se puede reanudar con `mlagents-learn <config>.yaml --run-id=<run_id> --resume`.

## Capacidades

- Control de un agente virtual (Huggy) dentro de un entorno Unity mediante política entrenada con PPO.
- Toma de decisiones en bucle cerrado a partir de observaciones del simulador.
- Exportación a ONNX para inferencia fuera de Unity o integración en otros runtimes.
- Reproducción del entrenamiento y reanudación desde el checkpoint publicado.
- Visualización del agente en el navegador a través de la integración de Hugging Face con Unity.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión artificial genérica, *tool calling*, capacidades multilingües ni modo *thinking*.

## Casos de uso

- **Aprendizaje de ML-Agents**: usar el checkpoint como punto de partida para el tutorial oficial de Huggy y entender el flujo `mlagents-learn` → publicación en el Hub.
- **Reproducción de experimentos**: reanudar el entrenamiento con `--resume` para comparar curvas de recompensa en TensorBoard frente a nuevas configuraciones.
- **Pruebas de integración con Unity Inference Engine**: cargar el `.onnx` en un proyecto Unity para validar el pipeline de inferencia en el editor o en build.
- **Benchmark de algoritmos de RL**: emplear este agente PPO como línea base frente a otros algoritmos (SAC, POCA) sobre el mismo entorno Huggy.
- **Docencia y demos**: mostrar en clase o en un artículo cómo un agente aprende una tarea de locomoción/recolección en un entorno 3D sencillo.
- **Validación de pipelines de publicación**: usar el repositorio como ejemplo mínimo (0,2 GB) para probar flujos de subida, versionado y descarga de artefactos ML-Agents en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye curvas de recompensa, tasas de éxito ni comparaciones con otros agentes sobre Huggy.

## Requisitos de hardware

- **VRAM estimada**: no disponible; por el tamaño del repositorio (0,2 GB, que incluye pesos y logs de TensorBoard) los pesos en sí ocupan previsiblemente pocos megabytes, pero no se confirma.
- **GPU recomendadas**: cualquiera con soporte CUDA para entrenamiento; para inferencia basta CPU en la mayoría de casos dada la escala típica de un agente ML-Agents.
- **Consumer GPU**: sí, previsiblemente cabe en cualquier GPU de consumo moderna e incluso en CPU; no se dispone de cifras oficiales.
- **Despliegue**: Unity ML-Agents (`mlagents-learn`, `mlagents-envs`), Unity Inference Engine (ONNX), `onnxruntime`.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Socialized/ppo-Huggy | Huggy (ML-Agents) | PPO | `.nn`, `.onnx` | no disponible | Hugging Face |
| unity/ML-Agents Huggy (oficial) | Huggy (ML-Agents) | PPO | `.nn`, `.onnx` | según repositorio oficial | Hugging Face (org. unity) |
| Otros agentes PPO de la comunidad sobre Huggy | Huggy (ML-Agents) | PPO | `.nn`, `.onnx` | variable | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa entre estos agentes.

## Limitaciones y advertencias

- **Ámbito muy restringido**: la política está entrenada específicamente para el entorno Huggy; no generaliza a otras tareas ni a otros simuladores sin reentrenamiento.
- **Licencia no declarada**: la ausencia de licencia impide asumir permisos de uso comercial; hay que contactar con el autor o tratar el modelo como no reutilizable comercialmente.
- **Información incompleta**: no se publican hiperparámetros, número de pasos, configuración YAML ni métricas, lo que dificulta la reproducibilidad.
- **Riesgo de sobreajuste al simulador**: como todo agente RL, puede explotar particularidades del entorno y fallar ante cambios en la física, la cámara o la configuración de recompensas.
- **Sin garantías de robustez**: no hay evaluación de estabilidad ni de comportamiento ante perturbaciones.
- **No apto para NLP**: no debe emplearse como modelo de lenguaje, clasificador de texto ni generador; su pipeline es `reinforcement-learning`.
- **Fecha de creación futura en los metadatos** (2026-11-09): conviene verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Socialized/ppo-Huggy
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto (Huggy en el navegador): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Organización Unity en Hugging Face: https://huggingface.co/unity
