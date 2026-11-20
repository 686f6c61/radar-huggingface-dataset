# 3cda2225/record-3items_act_policy

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de manipulación de horizonte largo. Este checkpoint concreto, `record-3items_act_policy`, ha sido entrenado y publicado en el Hub mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, sobre el dataset `3cda2225/record-3items`, presumiblemente una grabación de teleoperación de tres objetos o tareas.

El modelo es una política visomotora compacta: 51.668.614 parámetros (unos 51,7 millones) en formato safetensors, con un repositorio de 0,2 GB. No es un modelo de lenguaje ni un VLM generativo, sino una política de control que mapea observaciones (típicamente imágenes de cámara y estado de las articulaciones) a comandos de acción para un robot seguidor, en el ecosistema SO-100/SO-101 de LeRobot.

Su relevancia es práctica para quien investiga o prototipa manipulación robótica de bajo coste: ofrece una receta reproducible de entrenamiento e inferencia con `lerobot-train` y `lerobot-record`, licencia Apache 2.0 y un tamaño que permite entrenar y desplegar en una sola GPU de consumo. La información pública disponible sobre este checkpoint concreto es mínima (0 descargas, 0 likes, sin benchmarks ni detalles del dataset), por lo que esta ficha se apoya en la arquitectura ACT descrita en el paper y en la documentación de LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers), política de imitación visomotora |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por episodio) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; LeRobot no documenta cuantización para este checkpoint) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |
| Pipeline | robotics |
| Dataset de entrenamiento | 3cda2225/record-3items |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-11-20 |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder que recibe observaciones multimodales (imágenes de cámaras y estado proprioceptivo del robot) y emite un *chunk* de acciones futuras de longitud fija en una sola pasada, en lugar de predecir una acción por paso. Esta predicción por fragmentos mitiga el problema de acumulación de errores del comportamiento clonado clásico y permite un control más suave y estable. La arquitectura incorpora un cuello de botella latente de estilo VAE (CVAE) que modela la variabilidad de las demostraciones humanas, junto con atención sobre las observaciones y una decodificación autorregresiva de las acciones del chunk.

El entrenamiento es de imitación supervisada sobre datos de teleoperación. En este caso, el dataset `3cda2225/record-3items` y el flujo estándar de LeRobot (`lerobot-train --policy.type=act`) indican aprendizaje a partir de episodios grabados con un robot seguidor tipo `so100_follower`. No se dispone de información pública sobre el número de episodios, la composición del dataset, la resolución de las cámaras, la frecuencia de control ni si se aplicaron aumentos de datos o técnicas de regularización específicas. Tampoco hay datos sobre RLHF/DPO, que no aplican a este tipo de política.

## Capacidades

- Control robótico visomotor: genera comandos de acción continua para robots manipuladores a partir de observaciones de cámara y estado de articulaciones.
- Predicción por chunks: emite secuencias cortas de acciones, lo que mejora la estabilidad y reduce el error acumulado en tareas de manipulación.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas, sin necesidad de recompensas ni entorno simulado.
- Integración con LeRobot: compatible con `lerobot-train`, `lerobot-record` y el ecosistema de robots SO-100/SO-101.
- Ejecución en hardware de consumo: su tamaño (~51,7 M de parámetros) permite entrenamiento e inferencia en GPU de gama media.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, generación de texto, visión general, audio ni capacidades multilingües: es una política de control especializada.

## Casos de uso

- Manipulación de objetos en laboratorio: el modelo ejecuta la tarea de recogida y colocación de los tres objetos del dataset `record-3items` sobre un robot seguidor SO-100, reproduciendo las trayectorias teleoperadas.
- Prototipado rápido de políticas de imitación: sirve como punto de partida y referencia para comparar nuevas grabaciones con la misma configuración de robot y cámara.
- Evaluación reproducible con LeRobot: mediante `lerobot-record --policy.path=... --episodes=10` se puede medir la tasa de éxito de la política en el robot real con un protocolo estandarizado.
- Reentrenamiento con datos propios: el checkpoint puede afinarse con nuevas demostraciones del mismo montaje para ampliar el repertorio de tareas, usando `lerobot-train` con `--policy.type=act`.
- Docencia e investigación en aprendizaje por imitación: su tamaño reducido y su licencia permisiva lo hacen adecuado para cursos y experimentos de comportamiento clonado con hardware de bajo coste.
- Base para comparativas de arquitecturas: permite contrastar ACT frente a políticas como Diffusion Policy o VQ-BeT en el mismo dataset y robot, aislando el efecto de la arquitectura.
- Despliegue en estaciones de trabajo con una sola GPU: la inferencia cabe en GPUs de consumo, lo que facilita pruebas en laboratorio sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, curvas de entrenamiento ni comparaciones con otras políticas sobre el dataset `3cda2225/record-3items`.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 51,7 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con 4 GB o más, incluyendo iGPUs y GPUs de portátil.
- GPU recomendadas para entrenamiento: RTX 3060/4060 o superiores; una RTX 4090 o A100 acelera el entrenamiento pero no es necesaria por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU NVIDIA con CUDA, y potencialmente en CPU para inferencia a baja frecuencia de control.
- Opciones de despliegue: LeRobot (`lerobot-record` para evaluación e inferencia en robot real); no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles; dependen de la frecuencia de control del robot, la resolución de las cámaras y el hardware, y no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| record-3items_act_policy (este) | 51,7 M | ACT (imitación) | no aplica | Apache 2.0 | Hugging Face, LeRobot |
| Diffusion Policy | no disponible | Política por difusión | no aplica | no disponible | Implementaciones públicas en investigación |
| VQ-BeT | no disponible | Transformer con cuantización vectorial | no aplica | no disponible | Implementaciones públicas en investigación |
| Otras políticas ACT en LeRobot Hub | variable | ACT | no aplica | variable (habitualmente Apache 2.0) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas políticas en el dataset de este checkpoint, por lo que la comparación se limita a tipo de arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política solo es válida para el montaje de robot, cámaras y tarea del dataset `record-3items`; fuera de esa distribución su comportamiento no está garantizado.
- Sin datos públicos de evaluación: no hay tasas de éxito ni métricas que permitan estimar su fiabilidad en producción.
- Sesgos de las demostraciones: al aprender por imitación, reproduce los sesgos y limitaciones de las trayectorias teleoperadas (estilos, posiciones iniciales, iluminación, objetos concretos).
- Sensibilidad al entorno: cambios de iluminación, fondo, posición de cámara u objetos distintos pueden degradar el rendimiento sin aviso.
- Riesgo físico: es una política de control de robot real; un fallo de inferencia puede provocar movimientos inseguros, por lo que requiere límites de seguridad y supervisión humana.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se ofrece garantía alguna por parte del autor.
- Documentación mínima: la model card no detalla el dataset, la configuración de entrenamiento ni las condiciones de evaluación, lo que dificulta la reproducibilidad.
- Sin soporte de lenguaje, visión general ni tool calling: no debe emplearse fuera del ámbito del control robótico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3cda2225/record-3items_act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/3cda2225/record-3items
- Paper de ACT (arXiv 2304.13705): https://arxiv.org/abs/2304.13705
- Paper en Hugging Face: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
