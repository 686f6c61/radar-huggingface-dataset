# ketiholo/test3_ch50

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales. El modelo `ketiholo/test3_ch50` es una política ACT entrenada y publicada con LeRobot, la librería de Hugging Face para robótica de bajo coste, sobre el dataset `ketiholo/demo3`. Está pensado para controlar robots manipuladores a partir de datos de teleoperación.

El modelo resuelve el problema del control motor fino en robótica: en lugar de predecir una única acción por paso de tiempo, ACT genera un bloque de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad del movimiento. Es relevante para desarrolladores que quieran desplegar políticas de imitación en robots de tipo SO-100/SO-101 sin entrenar desde cero.

Con 51,6 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero orientado a inferencia en tiempo real. La información pública disponible es escasa: no se detallan composición del dataset, hiperparámetros de entrenamiento ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder de visión y decodificador de acciones con chunking |
| Parametros totales | 51.619.463 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación. Combina un encoder visual (procesa las observaciones de cámara del robot) con un transformer que predice un chunk de acciones de longitud fija. Esta formulación, introducida en el paper arXiv:2304.13705, mitiga el problema de la varianza en la predicción de acciones individuales y permite movimientos más suaves y coherentes temporalmente. El modelo se entrena con datos de teleoperación, típicamente pares observación-acción capturados con un robot líder y un seguidor.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset `ketiholo/demo3`, el número de episodios, la resolución de las cámaras ni si se aplicaron técnicas de regularización o aumento de datos. El entrenamiento se realizó con LeRobot, según indica la model card, pero no se publican hiperparámetros ni curvas de entrenamiento.

## Capacidades

- Control robótico por imitación: predice chunks de acciones a partir de observaciones visuales y de estado del robot.
- Manipulación de objetos: adecuado para tareas de pick-and-place y manipulación fina aprendidas de demostraciones.
- Inferencia en tiempo real: el tamaño reducido (51,6 M de parámetros) permite ejecución en GPUs de consumo.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y evaluación de LeRobot, incluyendo `lerobot-train` y `lerobot-record`.
- Soporte para robots SO-100/SO-101: la model card menciona `so100_follower` en los ejemplos de evaluación.
- No soporta tool calling, agentes de texto, razonamiento lingüístico ni capacidades multilingües: es un modelo puramente motor.

## Casos de uso

- Manipulación robótica de laboratorio: usar el modelo para controlar un brazo SO-100 en tareas de recogida y colocación aprendidas de demostraciones, aprovechando la predicción por chunks para movimientos estables.
- Prototipado rápido de políticas de imitación: entrenar variantes sobre nuevos datasets con `lerobot-train --policy.type=act` y comparar con esta política base.
- Evaluación de hardware de bajo coste: desplegar la política en un SO-100 seguidor y medir tasas de éxito con `lerobot-record --episodes=10`, como sugiere la model card.
- Investigación en aprendizaje por imitación: usar el modelo como referencia para estudiar el efecto del chunking de acciones en la estabilidad del control.
- Automatización de tareas repetitivas en entornos controlados: tareas de ensamblaje o clasificación de objetos donde se disponga de datos de teleoperación.
- Docencia y formación en robótica: ejemplo práctico de pipeline completo (dataset, entrenamiento, evaluación) con LeRobot y ACT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en FP32 para 51,6 M de parámetros; en la práctica, la memoria vendrá dominada por los buffers de las cámaras y el runtime, no por los pesos.
- GPU recomendadas: cualquier GPU con CUDA, incluidas RTX 3060, RTX 4090, A100 o H100; el modelo es muy ligero.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia no crítica en tiempo real.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), integración con el stack de Hugging Face; no se documentan exportaciones a vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo motor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ketiholo/test3_ch50 (ACT) | 51,6 M | Política de imitación con chunking | no disponible | Apache 2.0 | Hugging Face |
| Diffusion Policy | no disponible | Política de imitación basada en difusión | no disponible | no disponible | Implementaciones en LeRobot |
| VQ-BeT | no disponible | Política de imitación con cuantización vectorial | no disponible | no disponible | Implementaciones en LeRobot |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo es válido para la tarea y el robot con los que se entrenó; no generaliza a otros entornos sin reentrenamiento.
- Datos de entrenamiento desconocidos: se desconoce el tamaño y la calidad del dataset `ketiholo/demo3`, lo que impide estimar su robustez.
- Sin evaluación publicada: no hay tasas de éxito ni métricas que permitan juzgar su fiabilidad en producción.
- Riesgo de sobreajuste a las condiciones de captura (iluminación, posición de cámara, fondo) del dataset original.
- Sin soporte lingüístico ni multilingüe: no es un modelo de texto y no debe evaluarse como tal.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de documentación técnica limita su uso en producción sin validación propia.
- El identificador `test3_ch50` sugiere un experimento de prueba; conviene tratar el modelo como no validado.

## Enlaces

- Hugging Face: https://huggingface.co/ketiholo/test3_ch50
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/ketiholo/demo3
