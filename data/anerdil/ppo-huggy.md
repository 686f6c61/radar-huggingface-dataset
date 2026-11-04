# anerdil/ppo-Huggy

## Resumen

`anerdil/ppo-Huggy` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) para resolver el entorno **Huggy**, uno de los escenarios de ejemplo de la librería Unity ML-Agents. No es un modelo de lenguaje ni un transformer generativo: es una política neuronal entrenada para controlar un perro virtual que debe recoger un palo en un entorno 3D simulado. El repositorio lo publica el usuario `anerdil` y se distribuye en formato de pesos de ML-Agents (`.nn`/`.onnx`), no en safetensors ni GGUF.

El modelo es relevante únicamente como material didáctico o como punto de partida para experimentar con ML-Agents: el propio autor enlaza los tutoriales oficiales del curso de Deep RL de Hugging Face, donde Huggy se usa como primer entorno para aprender a entrenar y publicar agentes. Con 0 descargas y 0 likes en el momento de la consulta, y un tamaño de repositorio de 0,1 GB, se trata de un artefacto de aprendizaje personal, no de un modelo pensado para producción.

Dada su naturaleza (política de RL para un entorno concreto, sin model card técnica detallada, sin licencia declarada y sin idiomas ni contexto), esta ficha documenta sus especificaciones reales y advierte explícitamente de que muchas de las categorías habituales (benchmarks de lenguaje, cuantización, tool calling, licencia comercial) no aplican o no están disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política PPO para ML-Agents (no disponible el detalle de capas) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente de RL, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos en formato ML-Agents `.nn`/`.onnx`) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.nn` / `.onnx` (ML-Agents) |
| Entorno de entrenamiento | Huggy (Unity ML-Agents) |
| Algoritmo | PPO |
| Librería | ml-agents |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidades (clipping) para limitar la magnitud de las actualizaciones y estabilizar el entrenamiento. En el ecosistema ML-Agents, el agente combina una red de política y una red de valor que procesan observaciones del entorno (típicamente vectoriales y, según la configuración, raycasts o sensores) y producen acciones continuas o discretas para mover al perro Huggy y recoger el palo.

La información disponible no incluye el número de pasos de entrenamiento, la configuración del fichero YAML, la composición de observaciones ni los hiperparámetros (learning rate, batch size, epochs, clip epsilon). Tampoco se documenta si se usó entrenamiento con currículo, recompensas moldeadas o imitación. El repositorio incluye artefactos de TensorBoard según las etiquetas, lo que sugiere que el autor registró curvas de entrenamiento, pero no se han publicado métricas en la model card.

## Capacidades

- Control de un agente virtual en el entorno Huggy de Unity ML-Agents: locomoción y recogida del palo.
- Política entrenada con PPO, ejecutable en inferencia mediante el runtime de ML-Agents o como modelo ONNX.
- Reproducción del entrenamiento mediante `mlagents-learn ... --resume` con el fichero de configuración correspondiente.
- Visualización del agente jugando en el navegador a través del visor de Hugging Face para entornos Unity (`huggingface.co/unity`).
- No soporta generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes multi-paso ni capacidades multilingües.

## Casos de uso

- **Aprendizaje de ML-Agents**: usar el agente como referencia funcional para entender el flujo completo de entrenamiento, exportación y publicación en el Hub, siguiendo el tutorial corto de Huggy del curso de Deep RL de Hugging Face.
- **Punto de partida para fine-tuning con `--resume`**: reanudar el entrenamiento con una configuración YAML propia para experimentar con cambios de hiperparámetros y comparar curvas en TensorBoard.
- **Demostración en el navegador**: cargar el `.onnx` en el visor de Unity de Hugging Face para mostrar el comportamiento del agente sin instalar Unity localmente, útil en docencia o charlas introductorias.
- **Pruebas de integración del runtime ML-Agents**: validar que una instalación de `mlagents` y el runtime de inferencia funcionan correctamente usando un agente ya entrenado como caso de prueba.
- **Base para comparativas de algoritmos**: entrenar el mismo entorno con SAC, PPO o imitation learning y contrastar curvas de recompensa frente a este agente de referencia.
- **Evaluación de robustez de políticas**: someter al agente a variaciones del entorno (posiciones del palo, fricción, ruido en observaciones) para estudiar su generalización, un ejercicio habitual en cursos de RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye recompensa media, tasa de éxito en la tarea ni curvas de entrenamiento, y las etiquetas del repositorio solo indican la presencia de TensorBoard, sin cifras accesibles.

## Requisitos de hardware

- **VRAM estimada**: no disponible; por el tamaño del repositorio (0,1 GB) y la naturaleza de la política, la inferencia es extremadamente ligera y cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- **GPU recomendadas**: no se especifican; cualquier GPU compatible con el runtime de ML-Agents o con ONNX Runtime es suficiente. Para reentrenar, se recomienda una GPU dedicada (por ejemplo, RTX 3060 o superior) para acelerar la simulación y el entrenamiento.
- **GPU consumer**: sí, cabe en cualquier GPU consumer moderna e incluso en iGPU para inferencia.
- **Despliegue**: runtime de ML-Agents (`mlagents-learn`, `mlagents-envs`), ONNX Runtime para el `.onnx`, y el visor web de Hugging Face para Unity. No aplican vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anerdil/ppo-Huggy | Huggy | PPO | `.nn` / `.onnx` | no disponible | Hugging Face, 0 descargas |
| Agentes Huggy de la organización `unity` | Huggy | PPO / SAC (según el caso) | `.nn` / `.onnx` | según el repositorio | Hugging Face (`huggingface.co/unity`) |
| Agentes de otros entornos ML-Agents (p. ej. Walker, Crawler) | Varios | PPO / SAC | `.nn` / `.onnx` | según el repositorio | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos agentes en la información proporcionada.

## Limitaciones y advertencias

- **Ámbito muy restringido**: la política solo está entrenada para el entorno Huggy; no generaliza a otras tareas ni entornos.
- **Sin licencia declarada**: la ausencia de licencia impide asumir permisos de uso comercial o de redistribución; hay que contactar con el autor antes de cualquier uso más allá del personal o educativo.
- **Sin métricas publicadas**: no hay evidencia documentada de la calidad del agente (recompensa media, tasa de éxito), por lo que no debe presentarse como un agente "resuelto".
- **Riesgo de sobreajuste al entorno**: al no documentarse la configuración de entrenamiento, se desconoce si el agente tolera variaciones de posiciones, físicas o ruido.
- **Artefacto de aprendizaje**: 0 descargas y 0 likes sugieren que no ha sido validado por la comunidad; trátese como material didáctico, no como referencia de producción.
- **Formatos no estándar para LLM**: las herramientas habituales de inspección de modelos de lenguaje (safetensors, tokenizers, cuantizaciones GGUF/AWQ/GPTQ) no aplican.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anerdil/ppo-Huggy
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto de Huggy (curso Deep RL de Hugging Face): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes Unity en Hugging Face: https://huggingface.co/unity
