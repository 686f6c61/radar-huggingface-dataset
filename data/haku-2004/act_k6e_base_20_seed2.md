# Haku-2004/act_k6e_base_20_seed2

## Resumen

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion para control robotico que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de acumulacion y mejora la estabilidad en tareas de manipulacion. Este repositorio concreto, `Haku-2004/act_k6e_base_20_seed2`, es una politica ACT entrenada con LeRobot sobre el dataset `Haku-2004/k6_20_20261113_173939` y publicada en Hugging Face por el usuario Haku-2004.

El modelo pesa 51.668.614 parametros (aproximadamente 51,7 millones) y se distribuye en formato safetensors dentro de un repositorio de 0,2 GB, con licencia Apache 2.0. No es un modelo de lenguaje: es una politica visomotora que mapea observaciones (imagenes de camara y estado de las articulaciones) a comandos de accion para un robot, en la linea del paper original de Zhao et al. (2023).

Su relevancia es practica: sirve como ejemplo reproducible de un checkpoint ACT listo para evaluar con `lerobot-record` sobre un robot tipo SO-100 follower, y como referencia para quien entrene sus propias politicas de imitacion con el stack de LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; politica visomotora, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

ACT combina un backbone de vision (tipicamente ResNet preentrenado) que codifica las imagenes de las camaras con un transformer encoder-decoder que procesa la secuencia de observaciones y genera un chunk de acciones futuras de una sola vez. La prediccion por chunks, en lugar de paso a paso, es la innovacion central del metodo: reduce el horizonte efectivo de decision y mitiga el error compounding tipico de las politicas de imitacion clasicas. El modelo incluye ademas una cabeza de estilo CVAE que modela la variabilidad de las demostraciones humanas durante el entrenamiento.

En este caso concreto, la politica se entreno con LeRobot sobre el dataset `Haku-2004/k6_20_20261113_173939`, presumiblemente compuesto por episodios de teleoperacion. No se dispone de informacion sobre el numero de episodios, la composicion del dataset, el numero de pasos de entrenamiento ni si se aplicaron tecnicas de aumento de datos o regularizacion especificas; todos esos datos figuran como no disponibles en la model card.

## Capacidades

- Generacion de chunks de acciones para control robotico de manipulacion a partir de observaciones visuales y de estado.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas (behavior cloning con chunking).
- Integracion nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluacion con `lerobot-record`.
- Ejecucion sobre robots compatibles con LeRobot, como el SO-100 follower referenciado en la model card.
- Inferencia en GPU CUDA (`--policy.device=cuda`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Evaluacion de politicas de imitacion en laboratorio: cargar el checkpoint con `lerobot-record` sobre un SO-100 follower y medir la tasa de exito en la tarea `k6` durante 10 episodios, tal como propone la model card.
- Reproduccion de experimentos ACT: usar este checkpoint como baseline con semilla 2 (`seed2`) para comparar variantes de entrenamiento o de dataset frente a otras semillas.
- Prototipado de manipulacion robotica de bajo coste: el modelo cabe en 0,2 GB y puede ejecutarse en una GPU de consumo, lo que permite montar un banco de pruebas domestico o docente sin infraestructura dedicada.
- Docencia y formacion: ejemplo completo y ligero de un pipeline de aprendizaje por imitacion con LeRobot, desde el dataset hasta la evaluacion en robot real.
- Punto de partida para fine-tuning: reentrenar la politica sobre un dataset propio de teleoperacion con `lerobot-train --policy.type=act` y comparar contra este checkpoint.
- Validacion de infraestructura de robotica: comprobar que la cadena de camaras, calibracion y control del SO-100 funciona correctamente antes de invertir en entrenamientos mas largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, curvas de entrenamiento ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 millones de parametros en safetensors (aproximadamente 0,2 GB de pesos en precision completa) la huella es muy reducida y cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; la model card usa `--policy.device=cuda` sin especificar modelo. Una RTX 4090 o superior es mas que suficiente; tambien cabria en GPUs de gama media y en placas integradas con CUDA.
- Cabe en GPU de consumo: si, con margen amplio, dado el tamano del checkpoint.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que es el flujo documentado; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k6e_base_20_seed2 (este) | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face |
| Otras politicas ACT en LeRobot Hub | variable | no aplica | no disponible | variable (habitualmente Apache 2.0) | Hugging Face |
| Diffusion Policy (LeRobot) | variable | no aplica | no disponible | variable | Hugging Face / repositorio oficial |
| Otros checkpoints del mismo autor | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint esta entrenado sobre un dataset concreto (`k6_20_20261113_173939`) y un robot concreto; no se espera que generalice a otras tareas, entornos o morfologias sin reentrenamiento.
- No hay informacion publica sobre el numero de episodios, la calidad de las demostraciones ni la tasa de exito alcanzada, por lo que no puede evaluarse su robustez a priori.
- Riesgo de sobreajuste a las condiciones de iluminacion, posiciones de camara y objetos presentes en el dataset de entrenamiento.
- Al ser una politica de imitacion, hereda los sesgos y errores sistematicos de las demostraciones humanas, incluidos posibles sesgos de posicionamiento o de trayectoria.
- No procesa lenguaje natural ni tiene capacidades de razonamiento, tool calling o agentes; cualquier expectativa en ese sentido es erronea.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias sobre el comportamiento del modelo en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- Para uso en produccion seria necesario validar el modelo en el robot objetivo, con protocolos de seguridad fisica, ya que una politica de manipulacion puede generar movimientos peligrosos fuera de su distribucion de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6e_base_20_seed2
- Paper ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_20_20261113_173939
