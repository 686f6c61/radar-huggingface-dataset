# Haku-2004/act_k6_input_20

## Resumen

`act_k6_input_20` es una política de imitación basada en ACT (Action Chunking with Transformers), publicada por el usuario Haku-2004 en Hugging Face y entrenada con el framework LeRobot de Hugging Face. El modelo resuelve el problema de control robótico de manipulación: aprende de datos de teleoperación y predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad en tareas de imitación. Es relevante porque forma parte del ecosistema LeRobot, que estandariza el entrenamiento, la evaluación y el despliegue de políticas robóticas en hardware de bajo coste como el brazo SO-100.

El checkpoint tiene 51.671.174 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras ejecutables en GPU de consumo. Está entrenado sobre el dataset `Haku-2004/k6_4seg`, un conjunto de demostraciones teleoperadas propio del autor, y se distribuye bajo licencia Apache 2.0. No se trata de un modelo de lenguaje: no procesa texto ni genera lenguaje natural, sino que mapea observaciones (típicamente imágenes de cámara y estado de las articulaciones) a comandos de acción para un robot.

La ficha se limita a los datos publicados en la model card y en los metadatos del repositorio. No hay información sobre composición del dataset, número de episodios, configuración de entrenamiento ni resultados de evaluación, por lo que varios apartados indican explícitamente "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder de observaciones y decoder de acciones |
| Parametros totales | 51.671.174 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un transformer que codifica las observaciones (imágenes de cámaras y estado de las articulaciones) con un decoder que genera un chunk de acciones futuras en una sola pasada, en lugar de predecir una acción por paso. Esta predicción por chunks mitiga el problema de la acumulación de errores típico de las políticas paso a paso y permite un control más suave. El modelo incluye mecanismos de regularización propios de ACT, como el entrenamiento con ruido en las acciones objetivo (similar a un CVAE), aunque la model card no detalla la configuración concreta empleada en este checkpoint.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/k6_4seg`, del que no se publican el número de episodios, la frecuencia de captura, las cámaras utilizadas ni la tarea concreta. No hay información sobre hiperparámetros, número de pasos de entrenamiento, aumentos de datos ni procesos de RLHF o DPO (no aplicables en este contexto). Tampoco se documenta el robot objetivo, aunque los comandos de ejemplo de la model card apuntan a un `so100_follower`, el brazo de bajo coste compatible con LeRobot.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones articulares a partir de observaciones visuales y de estado.
- Predicción por chunks de acción, que reduce el error acumulado en horizontes largos.
- Entrenamiento y evaluación integrados en el ecosistema LeRobot (`lerobot-train`, `lerobot-record`).
- Compatible con el brazo SO-100 (y potencialmente otros robots compatibles con LeRobot, no confirmado).
- Inferencia en tiempo real en GPU, adecuada para bucles de control a frecuencia de cámara.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües, de visión general, audio ni generación de texto.

## Casos de uso

- Manipulación robótica de pick-and-place: la política predice chunks de acciones a partir de las cámaras del brazo, adecuada para tareas de recogida y colocación de objetos en entornos controlados.
- Automatización de tareas repetitivas de laboratorio: con demostraciones teleoperadas del dataset `k6_4seg`, el modelo puede replicar secuencias de manipulación grabadas por un operador humano.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para comparar variantes de ACT, cambios de dataset o configuraciones de entrenamiento en LeRobot.
- Prototipado rápido en robótica de bajo coste: al tener 51,7 M de parámetros, puede ejecutarse en una GPU de consumo y desplegarse en un SO-100 para validar pipelines completos.
- Evaluación de políticas con `lerobot-record`: el modelo puede usarse como política de referencia en scripts de evaluación con 10 episodios, tal como indica la model card.
- Base para fine-tuning en tareas específicas: al estar en formato safetensors y con licencia Apache 2.0, puede reentrenarse sobre nuevos datasets de teleoperación del mismo robot.
- Docencia y demostraciones de robótica: ejemplo práctico de entrenamiento y despliegue de una política de imitación con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, curvas de aprendizaje ni comparaciones con otras políticas, y el repositorio no contiene informes de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en FP32 los pesos ocupan aproximadamente 0,2 GB, por lo que la VRAM necesaria es muy inferior a 1 GB, dominada por las activaciones y los frames de cámara.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; una RTX 3060, RTX 4090, A100 o H100 pueden ejecutar la política sin problemas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con al menos 2-4 GB de VRAM; también podría ejecutarse en CPU para inferencia, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch nativo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a políticas robóticas).
- Latencia y throughput: no disponibles. La frecuencia de control dependerá de la cámara, el robot y la GPU; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Haku-2004/act_k6_input_20` | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible en la informacion | no aplica | resultados en paper, no comparables directamente | no disponible | paper y código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | no disponible en la informacion | no aplica | no disponible | no disponible | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento ni de configuraciones comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con un dataset propio y reducido (`k6_4seg`), la política hereda los sesgos de las demostraciones del operador y puede generalizar mal fuera de la distribución de la tarea.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero la política puede producir acciones erróneas o inseguras ante observaciones fuera de distribución.
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no procesa texto ni soporta instrucciones en lenguaje natural.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset `Haku-2004/k6_4seg` por separado.
- Caveats para producción: no hay métricas de éxito publicadas, el repositorio tiene 0 descargas y 0 likes, y no se documenta el robot exacto ni la tarea; validar en el hardware objetivo antes de cualquier despliegue.
- Seguridad física: cualquier uso en un robot real requiere límites de par, paradas de emergencia y supervisión humana, dado que no se documentan restricciones de seguridad en la política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6_input_20
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_4seg
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
