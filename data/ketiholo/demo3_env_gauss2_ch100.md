# ketiholo/demo3_env_gauss2_ch100

## Resumen

`ketiholo/demo3_env_gauss2_ch100` es una política de robótica entrenada con LeRobot mediante el método ACT (Action Chunking with Transformers), un enfoque de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. El modelo lo publica el usuario ketiholo en Hugging Face y está pensado para controlar robots manipuladores a partir de datos de teleoperación, en este caso el dataset `ketiholo/demo3`.

El modelo es un transformer de aproximadamente 51,7 millones de parámetros empaquetado en safetensors, con un tamaño de repositorio de 0,2 GB. No es un modelo de lenguaje: su pipeline es `robotics`, su librería es `lerobot` y su salida son comandos de acción para un robot, no texto. Por eso carece de ventana de contexto lingüística, de capacidades multilingües y de cuantizaciones orientadas a LLM.

Su relevancia es práctica dentro del ecosistema LeRobot: sirve como ejemplo reproducible de entrenamiento y evaluación de una política ACT con el robot SO-100 (la documentación oficial de LeRobot usa `so100_follower`), y permite a desarrolladores de robótica validar pipelines de imitación de extremo a extremo con muy pocos recursos de cómputo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.676.313 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; el modelo consume observaciones por paso, no texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | ketiholo/demo3 |
| Tamano del repositorio | 0,2 GB |
| Descargas en Hugging Face | 30 |
| Fecha de creacion | 2026-10-29 |
| Fecha de ultima actualizacion | 2026-10-29 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un codificador de observaciones (que en ACT procesa imágenes de cámara junto con el estado del robot) con un transformer que genera *chunks* de acciones: en lugar de predecir una única acción por paso, el modelo emite una secuencia corta de acciones futuras. Este diseño reduce el error de acumulación típico de las políticas paso a paso y suaviza el comportamiento del robot.

El entrenamiento se realiza con datos de teleoperación del dataset `ketiholo/demo3`, mediante el comando `lerobot-train` con `--policy.type=act`. La model card no detalla el número de episodios, la composición del dataset, el número de tokens ni si hubo técnicas de refuerzo o preferencias (RLHF/DPO); en robótica por imitación estos mecanismos no forman parte del pipeline estándar de ACT. El nombre del repositorio (`env_gauss2_ch100`) sugiere una variante de entorno con ruido gaussiano y un tamaño de chunk de 100, pero esta interpretación no está confirmada en la documentación disponible.

## Capacidades

- Control de robots manipuladores mediante predicción de chunks de acciones a partir de observaciones visuales y de estado.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Inferencia y evaluación integradas en el ecosistema LeRobot (`lerobot-record` con `--policy.path`).
- Compatible con el robot `so100_follower` según el ejemplo de evaluación de la model card.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas ni visión generalista.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los agentes LLM.
- Sin capacidades multilingües ni modo de pensamiento (*thinking*).

## Casos de uso

- Manipulación robótica de laboratorio: replicar tareas de pick-and-place aprendidas de demostraciones humanas sobre un SO-100, usando el checkpoint directamente con `lerobot-record` para validar la política en diez episodios de evaluación.
- Investigación en aprendizaje por imitación: usar el modelo como línea base reproducible de ACT con 51,7 M de parámetros para comparar variantes de chunking, aumentos de datos o ruido gaussiano en el entorno.
- Prototipado rápido en robótica de bajo coste: al ocupar 0,2 GB y entrenarse desde un dataset pequeño, permite iterar en una estación de trabajo con una sola GPU consumer.
- Docencia y formación: ejemplo completo de flujo LeRobot (entrenamiento, guardado de checkpoints y evaluación) para cursos de robótica o aprendizaje profundo aplicado.
- Evaluación de pipelines de datos: servir de referencia para comprobar que un dataset de teleoperación propio (`demo3`) produce políticas funcionales antes de escalar a datasets mayores.
- Integración en bancos de pruebas de simulación o entornos con perturbaciones: el sufijo `env_gauss2` apunta a un escenario con ruido gaussiano, útil para medir robustez de políticas ACT frente a variaciones de observación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa para 51,7 M de parámetros; en la práctica, el consumo lo dominan los buffers de imagen y el runtime de PyTorch, por lo que se recomienda al menos 4-8 GB de VRAM libre.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA moderna; el ejemplo oficial usa `--policy.device=cuda`. Una RTX 3060, RTX 4060 o superior es suficiente.
- Cabe holgadamente en GPU consumer, incluidas las de gama de entrada con 8 GB.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`) sobre PyTorch; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la frecuencia de control del robot y del coste del codificador visual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ketiholo/demo3_env_gauss2_ch100 | 51,7 M | no aplica | ACT (LeRobot) | Apache 2.0 | Hugging Face, 30 descargas |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | ACT (LeRobot) | normalmente Apache 2.0 | Hugging Face |
| Diffusion Policy | no disponible | no aplica | difusión para acciones | no disponible | implementaciones públicas |
| RT-1 / RT-2 (Google) | no disponible | no aplica | transformers visión-lenguaje-acción | no disponible | acceso restringido |

La comparación cuantitativa con estas alternativas no está disponible en la información proporcionada; los modelos citados se incluyen por categoría (políticas robóticas de imitación), no por resultados medidos.

## Limitaciones y advertencias

- Política específica del dataset `ketiholo/demo3`: no se garantiza su generalización a otras tareas, robots o entornos distintos de los de entrenamiento.
- Riesgo de sobreajuste a las condiciones de recogida de datos; el sufijo `env_gauss2` sugiere variaciones de ruido, pero no hay métricas que confirmen robustez.
- Sin documentación sobre sesgos, composición del dataset ni número de episodios, lo que dificulta auditar el comportamiento.
- No es un modelo de lenguaje: no debe emplearse para generación de texto, código ni tareas de razonamiento.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre seguridad física del robot; cualquier despliegue real requiere validación en entorno controlado.
- Con 30 descargas y 0 likes, la comunidad de validación es prácticamente inexistente; conviene tratar el checkpoint como experimental.
- No se documentan límites de contexto ni idioma porque no aplican, pero tampoco se documentan límites de frecuencia de control o de resolución de imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ketiholo/demo3_env_gauss2_ch100
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/ketiholo/demo3
