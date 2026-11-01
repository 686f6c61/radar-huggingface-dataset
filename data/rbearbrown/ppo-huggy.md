# rbearbrown/ppo-Huggy

## Resumen

`rbearbrown/ppo-Huggy` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) dentro del entorno Huggy de Unity ML-Agents. No es un modelo de lenguaje: es una política neuronal que controla un agente virtual (un perro llamado Huggy) en una escena 3D de Unity, y se publica en Hugging Face como artefacto reproducible para poder visualizarlo jugando en el navegador o reanudar su entrenamiento.

El modelo lo desarrolla el usuario `rbearbrown`, no una organizacion, y se distribuye con la libreria `ml-agents` en un repositorio de 0,2 GB. El repositorio contiene pesos en formato `.nn`/`.onnx` (propio de ML-Agents) y artefactos de TensorBoard, sin model card detallada, sin licencia declarada y sin idiomas ni benchmarks asociados.

Su relevancia es practica y acotada: sirve como ejemplo funcional del flujo de entrenamiento PPO con ML-Agents y como punto de partida para reanudar entrenamientos o desplegar el agente en el visor web oficial de Unity en Hugging Face. No debe confundirse con un modelo fundacional ni evaluarse con metricas de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica y valor para RL (ML-Agents, PPO); topologia concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos `.nn`/`.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica / no disponible |
| Licencia | no disponible |
| Formato de pesos | `.nn` y `.onnx` (ML-Agents), con logs de TensorBoard |

## Arquitectura y entrenamiento

El agente emplea PPO, un algoritmo de gradiente de politica con recorte de la ratio de probabilidad (clipping) para limitar la magnitud de las actualizaciones y estabilizar el entrenamiento. La politica consume observaciones del entorno Huggy (estado del agente y de la escena) y produce acciones continuas o discretas segun la configuracion del entorno; la topologia exacta de las capas, el numero de unidades y el tipo de observacion no estan documentados en la model card.

El entrenamiento se realizo con la libreria Unity ML-Agents y puede reanudarse mediante `mlagents-learn <config.yaml> --run-id=<run_id> --resume`. No se especifican el numero de pasos, episodios, hiperparametros (learning rate, batch size, horizonte, gamma, lambda GAE) ni la composicion de recompensas. Tampoco se documenta el uso de recompensas por curiosidad, imitacion (behavioral cloning) o curricula.

## Capacidades

- Control de politica en el entorno Huggy de Unity ML-Agents (agente tipo perro que interactua con la escena).
- Generacion de acciones a partir de observaciones del entorno, en inferencia por paso.
- Reproduccion y visualizacion del agente en el navegador mediante el visor de Unity en Hugging Face.
- Reanudacion de entrenamiento con `mlagents-learn --resume` sobre el mismo `run-id`.
- Exportacion a ONNX para inferencia fuera del runtime de ML-Agents (formato presente en el repositorio).
- Inspeccion de curvas de aprendizaje mediante los logs de TensorBoard incluidos.

## Casos de uso

- **Reproduccion de resultados de RL**: cargar el agente en el visor web de Unity y observar su comportamiento en Huggy para validar que el entrenamiento converge y que la politica aprendida es utilizable como referencia.
- **Punto de partida para reanudar entrenamiento**: usar `mlagents-learn` con `--resume` y el mismo `run-id` para continuar el entrenamiento con mas pasos o hiperparametros ajustados, sin partir de cero.
- **Docencia y tutoriales de ML-Agents**: emplear el agente como ejemplo practico en cursos introductorios de RL, apoyandose en los tutoriales oficiales del curso de deep RL de Hugging Face.
- **Pruebas de integracion del visor de Unity**: verificar el pipeline de Hugging Face que localiza el archivo `.nn`/`.onnx` y lo ejecuta en el navegador, util para equipos que publican agentes en el Hub.
- **Exportacion e inferencia ONNX**: convertir o reutilizar el `.onnx` en un runtime propio (por ejemplo, ONNX Runtime) para desplegar la politica fuera de Unity, por ejemplo en un servicio de simulacion.
- **Comparacion de algoritmos**: entrenar un agente con otro algoritmo (SAC, DQN, imitation) sobre el mismo entorno Huggy y contrastar curvas de recompensa frente a este PPO.
- **Generacion de datos sinteticos de interaccion**: ejecutar el agente en bucle para registrar trayectorias (observaciones, acciones, recompensas) que sirvan como dataset para analisis o imitacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye recompensa media por episodio, tasa de exito, pasos hasta convergencia ni comparaciones con otros agentes entrenados en Huggy.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 0,2 GB, lo que sugiere un modelo pequeno que cabe holgadamente en cualquier GPU consumer, pero no se documenta el desglose.
- GPU recomendadas: no disponible. Por el tamano del artefacto, es plausible ejecutarlo en GPUs modestas (GTX 1060 o superiores) e incluso en CPU, aunque no esta confirmado.
- Compatibilidad con GPU consumer: probable por el tamano del repositorio, sin datos oficiales de memoria ni latencia.
- Opciones de despliegue: visor web de Unity en Hugging Face, runtime de ML-Agents (Unity Inference Engine) y ONNX Runtime para el archivo `.onnx`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Libreria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rbearbrown/ppo-Huggy` | Agente PPO | Huggy | ml-agents | no disponible | Hugging Face |
| Agentes PPO de `unity` en Hugging Face | Agentes PPO | Entornos oficiales ML-Agents (Huggy, Walker, etc.) | ml-agents | no disponible en la informacion | Hugging Face (org. unity) |
| Agentes del curso Deep RL de Hugging Face | Agentes PPO/SAC | Huggy y otros | ml-agents / SB3 | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables (recompensa media, tasa de exito) entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No hay licencia declarada: no se puede asumir uso comercial ni redistribucion sin consultar al autor.
- No se documentan sesgos, pero al ser una politica entrenada por recompensa, puede explotar atajos del entorno (reward hacking) y comportamientos no deseados.
- El agente esta acoplado al entorno Huggy y a la configuracion de observaciones/acciones con la que se entreno; no es transferible a otras tareas sin reentrenamiento.
- Ausencia de hiperparametros, numero de pasos y curvas de aprendizaje publicadas: dificulta reproducir o auditar el resultado.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- No es un modelo de lenguaje: no soporta tool calling, agentes multi-step, vision general ni capacidades multilingues.
- El visor web depende de que el archivo `.nn`/`.onnx` sea compatible con el runtime de Unity en el navegador; fallos de compatibilidad no estan documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rbearbrown/ppo-Huggy
- Documentacion de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto (Huggy en el navegador): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Organizacion Unity en Hugging Face: https://huggingface.co/unity
