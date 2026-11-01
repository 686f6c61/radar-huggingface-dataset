# onionionZazaza/10episode

## Resumen

El modelo `onionionZazaza/10episode` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales. Lo desarrolla el usuario de Hugging Face onionionZazaza y se ha publicado a través de la librería LeRobot, el framework de Hugging Face para aprendizaje por imitación en robótica.

El modelo resuelve el problema del control robótico a partir de demostraciones teleoperadas: aprende una política que mapea observaciones visuales y de estado a comandos de acción motora. Con 13.129.117 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto orientado a tareas de manipulación específicas, no a propósito general.

Es relevante en el ecosistema de robótica open source porque ACT es uno de los métodos de referencia para imitación con éxito reportado alto en tareas de manipulación, y porque su integración en LeRobot permite reproducir el pipeline completo de entrenamiento y evaluación con comandos estandarizados. El nombre "10episode" sugiere un entrenamiento con un dataset de diez episodios, lo que lo convierte en un ejemplo de política de bajo régimen de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer para aprendizaje por imitación |
| Parametros totales | 13.129.117 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT se basa en un transformer que procesa observaciones (típicamente imágenes de cámaras y estado de las articulaciones) y genera un chunk de acciones futuras en una sola pasada, lo que reduce el error de acumulación típico de políticas que predicen paso a paso. El modelo incluye un codificador visual y un decodificador de acciones con atención, y se entrena mediante aprendizaje supervisado sobre demostraciones teleoperadas.

El entrenamiento se ha realizado con LeRobot sobre el dataset `onionionZazaza/10episode`, presumiblemente compuesto por diez episodios de teleoperación. No se dispone de información sobre el número total de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en este tipo de políticas). El pipeline de entrenamiento se documenta en la model card mediante el script `lerobot.scripts.train` con `--policy.type=act`.

## Capacidades

- Generación de comandos de acción motora a partir de observaciones visuales y de estado del robot.
- Predicción de action chunks: emite secuencias cortas de acciones en lugar de pasos individuales.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Evaluación sobre robots tipo SO-100 follower, según el ejemplo de la model card.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de control, no un modelo de lenguaje.

## Casos de uso

- Manipulación robótica de precisión: la política puede ejecutar tareas de agarre y colocación aprendidas de diez episodios teleoperados, aprovechando la predicción de chunks para movimientos suaves y consistentes.
- Prototipado rápido en robótica de bajo coste: con 13 millones de parámetros y 0,1 GB de pesos, se puede entrenar y desplegar en estaciones de trabajo con una sola GPU consumer, ideal para laboratorios con presupuesto limitado.
- Evaluación reproducible con LeRobot: el comando `lerobot.record` con `--policy.path` permite ejecutar la política sobre un robot SO-100 follower y registrar episodios de evaluación de forma estandarizada.
- Investigación en aprendizaje por imitación con pocos datos: sirve como línea base para estudiar el rendimiento de ACT con datasets reducidos (diez episodios) y comparar con políticas entrenadas con más demostraciones.
- Automatización de tareas repetitivas en entornos controlados: tareas de pick-and-place en celdas de trabajo donde la variabilidad del entorno es baja y el dominio de entrenamiento coincide con el de despliegue.
- Docencia y formación en robótica: el modelo y su pipeline completo en LeRobot permiten ilustrar el ciclo de teleoperación, entrenamiento y evaluación sin infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (13,1 M de parámetros, aproximadamente 52 MB en fp32 y 26 MB en fp16); el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con CUDA, incluidas GTX 1660, RTX 3060, RTX 4090; también es viable en CPU para inferencia, aunque la latencia será mayor.
- Cabe holgadamente en GPU consumer: sí, en cualquier modelo con al menos 2 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot.record` con `--policy.path`), con soporte de dispositivo CUDA o CPU mediante `--policy.device`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| onionionZazaza/10episode (ACT) | 13,1 M | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Otras políticas ACT en LeRobot | variable | no disponible | no disponible | variable | Hugging Face |
| Diffusion Policy (LeRobot) | variable | no disponible | no disponible | variable | Hugging Face |
| VQ-BeT (LeRobot) | variable | no disponible | no disponible | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a la disponibilidad de alternativas dentro del ecosistema LeRobot.

## Limitaciones y advertencias

- Entrenado con un dataset de diez episodios: la generalización a variaciones de entorno, iluminación u objetos no vistas es muy limitada.
- Riesgo alto de sobreajuste al dominio de teleoperación; el rendimiento fuera de las condiciones de entrenamiento puede degradarse de forma abrupta.
- No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones; cualquier uso en ese sentido es inadecuado.
- No se documentan sesgos específicos, pero al derivar de demostraciones humanas puede heredar sesgos de los operadores (velocidad, trayectorias, posiciones preferidas).
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en producción.
- No se especifican los robots compatibles más allá del ejemplo SO-100 follower; la validez en otras plataformas requiere validación empírica.
- La model card no detalla la composición del dataset ni las condiciones de recogida de datos, lo que dificulta evaluar la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onionionZazaza/10episode
- Dataset asociado: https://huggingface.co/datasets/onionionZazaza/10episode
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Paper en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
