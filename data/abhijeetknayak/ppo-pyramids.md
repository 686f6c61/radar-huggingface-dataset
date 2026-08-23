# abhijeetknayak/ppo-Pyramids

## Resumen

El modelo `abhijeetknayak/ppo-Pyramids` es un agente de aprendizaje por refuerzo (reinforcement learning) entrenado con el algoritmo Proximal Policy Optimization (PPO) para resolver el entorno de Unity ML-Agents llamado Pyramids. Este entorno forma parte de la colección oficial de entornos de Unity ML-Agents y plantea un desafío de navegación y manipulación de objetos en un escenario 3D. El agente debe aprender a encontrar una pirámide dorada, recogerla y colocarla en un altar, lo que requiere exploración espacial, memoria de la ubicación del objetivo y control de acciones discretas.

El modelo fue desarrollado por Abhijeet Nayak, investigador doctoral en la Universidad Tecnológica de Núremberg, y publicado en Hugging Face Hub. Está diseñado para ser utilizado con la biblioteca ML-Agents de Unity, permitiendo cargar el agente entrenado y ejecutarlo dentro del entorno Pyramids. El repositorio incluye los pesos del modelo en formato ONNX, que es el estándar para la inferencia en ML-Agents, además de artefactos de TensorBoard para el seguimiento del entrenamiento.

La relevancia de este modelo radica en que constituye un ejemplo completo de entrenamiento y publicación de un agente de aprendizaje por refuerzo en un entorno Unity. Para desarrolladores e investigadores que trabajan con ML-Agents, este modelo sirve como referencia de cómo entrenar un agente PPO en un entorno con observaciones vectoriales complejas (raycast y one-hot encoding) y acciones discretas, y cómo publicar el resultado en Hugging Face Hub para su posterior uso y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (red neuronal densa) de 2 capas ocultas con 512 unidades cada una (2×512) |
| Parametros totales | No disponible (estimado en el orden de 10^6, sin datos publicados) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de aprendizaje por refuerzo, sin contexto textual) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vision 3D y acciones discretas, no linguistico) |
| Licencia | No disponible |
| Formato de pesos | ONNX (.onnx) y TensorBoard (event files) |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura de red neuronal densa (MLP) con dos capas ocultas de 512 neuronas cada una, tal como se describe en la adaptacion para Ascend NPU. La entrada del modelo es un vector de observacion de 172 dimensiones, compuesto por percepciones de raycast (deteccion de obstaculos y objetivos a distancia) y una codificacion one-hot del objetivo a alcanzar. La salida es una politica de acciones discretas, que el agente utiliza para moverse en el entorno Pyramids.

El entrenamiento se realizo con el algoritmo PPO, implementado en la biblioteca ML-Agents de Unity. PPO es un metodo de optimizacion de politica basado en gradientes que limita el tamano del paso de actualizacion para mantener la estabilidad del entrenamiento. El modelo fue entrenado en el entorno Pyramids de Unity, que proporciona un entorno 3D con fisica simulada y observaciones parcialmente observables, lo que requiere que el agente desarrolle una estrategia de exploracion y uso de la informacion de raycast para localizar la piramide y llevarla al altar.

El entrenamiento se realizo con configuraciones estandar de ML-Agents para PPO, aunque no se han publicado los hiperparametros exactos (tasa de aprendizaje, tamano de lote, numero de episodios, etc.). El repositorio incluye archivos de TensorBoard que permiten visualizar la curva de recompensa y otras metricas de entrenamiento, aunque no se proporcionan graficos ni resumenes de rendimiento en la documentacion.

## Capacidades

- **Control de un agente en el entorno Pyramids**: el modelo es capaz de recibir observaciones de raycast y one-hot del objetivo, y producir acciones discretas de movimiento para navegar por el escenario 3D.
- **Aprendizaje de politica de refuerzo**: ha sido entrenado con PPO para maximizar la recompensa acumulada en la tarea de recoger la piramide y colocarla en el altar.
- **Integracion con ML-Agents**: compatible con el flujo de trabajo de Unity ML-Agents, pudiendo cargarse en el entorno de Unity y ejecutarse mediante el archivo ONNX.
- **Inferencia ligera**: al ser una red MLP pequena (2×512), la inferencia es rapida y puede ejecutarse en CPU o GPU sin requerir recursos de alto rendimiento.
- **Ejemplo de publicacion en el Hub**: sirve como caso de uso de como publicar un modelo de RL entrenado con ML-Agents en Hugging Face Hub, con el formato y la estructura adecuados.
- **Capacidades no aplicables**: no tiene capacidades de lenguaje natural, vision general, tool calling ni agentes conversacionales.

## Casos de uso

- **Investigacion en aprendizaje por refuerzo**: el modelo sirve como punto de partida para experimentos en el entorno Pyramids, permitiendo evaluar variaciones del algoritmo PPO, cambios en la funcion de recompensa o modificaciones en la observacion.
- **Ensenanza de ML-Agents**: se puede utilizar en cursos o tutoriales para mostrar el flujo completo de entrenamiento de un agente con Unity ML-Agents, desde la configuracion del entorno hasta la publicacion del modelo.
- **Desarrollo de agentes en Unity**: como base para integrar un agente entrenado en un proyecto Unity, por ejemplo en un juego o simulacion que requiera un agente que navegue y manipule objetos.
- **Evaluacion de politicas de navegacion**: permite estudiar estrategias de navegacion en entornos 3D parcialmente observables, ya que el agente debe combinar informacion de raycast y memoria del objetivo.
- **Validacion de la cadena de herramientas**: util para verificar que la integracion entre ML-Agents y el Hub de Hugging Face funciona correctamente, tanto en la carga como en la descarga de modelos.
- **Adaptacion a otros entornos**: el codigo y el modelo pueden servir como plantilla para entrenar agentes en entornos similares de ML-Agents, ajustando la arquitectura y el algoritmo segun las necesidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre la recompensa media obtenida en el entorno Pyramids, ni comparaciones con otros agentes o metodos. El autor no ha proporcionado metricas de rendimiento cuantitativas.

## Requisitos de hardware

- **VRAM estimada**: el modelo es extremadamente ligero. La red MLP de 2×512 con entrada de 172 dimensiones ocupa menos de 1 MB en memoria. No se requiere VRAM especifica para inferencia.
- **GPU recomendadas**: no se requiere GPU. Puede ejecutarse en CPU sin problemas. Si se usa Unity para visualizar el entorno, se necesita una GPU integrada o discreta para el renderizado de la escena 3D, pero no para la inferencia del modelo.
- **GPU consumer**: cabe en cualquier GPU consumer (GTX 1050 o superior) y en cualquier CPU moderna.
- **Opciones de despliegue**: el modelo ONNX se puede ejecutar con Unity ML-Agents (dentro de Unity), o exportarse a otros runtimes de ONNX (ONNX Runtime, TensorRT, etc.) para inferencia fuera de Unity. No se ha documentado el uso con vLLM, Ollama o TGI, que no son aplicables a modelos de RL.
- **Latencia y throughput**: al ser una red pequena, la latencia de inferencia es del orden de milisegundos en CPU (menos de 5 ms por paso de decision). El throughput es alto, soportando multiples agentes simultaneos si se ejecuta en batch.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Arquitectura | Observaciones | Formato | Licencia |
|---|---|---|---|---|---|---|
| abhijeetknayak/ppo-Pyramids | Pyramids | PPO | MLP 2×512 | 172D (raycast + one-hot) | ONNX | No disponible |
| abhijeetknayak/ppo-LunarLander-v3 | LunarLander (Gym) | PPO | No disponible | No disponible | No disponible | No disponible |
| abhijeet2022/ppo-Pyramids | Pyramids | PPO | No disponible | No disponible | ONNX | No disponible |

El modelo se puede comparar con otras variantes del mismo entorno (como `abhijeet2022/ppo-Pyramids`, probablemente el mismo autor) y con otros agentes de ML-Agents entrenados en entornos similares. No hay datos publicados de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- **Modelo especifico del entorno**: el modelo solo funciona en el entorno Pyramids de Unity ML-Agents. No es generalizable a otros entornos ni a tareas fuera de esta simulacion.
- **Sin datos de rendimiento**: no se han publicado metricas de recompensa, ni graficos de entrenamiento, lo que impide evaluar la calidad del entrenamiento.
- **Licencia no disponible**: no se especifica la licencia, lo que limita su uso comercial sin consultar al autor.
- **Observaciones limitadas**: el agente depende de raycast y one-hot del objetivo; no puede manejar observaciones visuales de alta dimensionalidad ni entornos parcialmente observables mas complejos.
- **Riesgo de sobreajuste**: como modelo de RL entrenado en un entorno especifico, puede sufrir de sobreajuste a las condiciones de simulacion (semillas, fisicas, etc.) y no generalizar a variaciones del entorno.
- **Sin garantias de produccion**: no se ha validado en entornos de produccion ni en condiciones de tiempo real exigentes.
- **Formato ONNX**: el modelo se distribuye en ONNX, pero no se incluyen los pesos en PyTorch ni en otros formatos, lo que limita la interoperabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abhijeetknayak/ppo-Pyramids
- Perfil del autor en Hugging Face: https://huggingface.co/abhijeetknayak
- Perfil del autor en GitHub: https://github.com/abhijeetknayak
- Documentacion de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Curso de Deep RL (Hugging Face): https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Tutorial de ML-Agents (Hugging Face): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Adaptacion para Ascend NPU (AtomGit): https://ai.atomgit.com/zyzoe/ppo-Pyramids
