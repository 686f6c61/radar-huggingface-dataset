# AmberHyunKIM/act_libero_goal_task0_20k

# Act en libero goal task 0, 20k (variante subentrenada)

## Resumen

`AmberHyunKIM/act_libero_goal_task0_20k` es una política robótica de tarea única entrenada con el algoritmo ACT (Action Chunking with Transformers) sobre el benchmark de simulación LIBERO. El autor es AmberHyunKIM y el entrenamiento se realizó con la librería LeRobot de Hugging Face. El modelo resuelve una sola tarea de manipulación: abrir el cajón central de un armario (`open the middle drawer of the cabinet`) dentro de la suite `libero_goal`, índice de tarea 0.

Se trata de un checkpoint deliberadamente subentrenado: 20.000 pasos de entrenamiento frente a los 100.000 del checkpoint de referencia del mismo autor. Su propósito es aislar el efecto del presupuesto de entrenamiento sobre el rendimiento de ACT, ya que el resto de variables del pipeline (dataset, batch size, hardware, hiperparámetros) se mantuvieron idénticos entre ambas ejecuciones. Por eso se publica como artefacto de ablación, no como política lista para desplegar.

La relevancia actual es doble: por un lado, ofrece un punto de comparación reproducible y barato (12 minutos de entrenamiento en una única GPU de consumo) para estudiar cuánto rendimiento aportan las últimas fases del entrenamiento en políticas de imitación; por otro, ilustra el coste real de entrenar ACT en tareas de manipulación, con 51,6 millones de parámetros y menos de 1,3 GB de VRAM en evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder de observaciones y decoder de acciones, con modelado tipo CVAE |
| Parametros totales | 51.671.687 (51,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (ACT consume la observación actual y predice secuencias de acciones; en la evaluación se usan 10 pasos de acción por chunk, `n_action_steps=10`) |
| Tipos de cuantizacion | no disponible; no se documentan variantes cuantizadas. El tamaño del repositorio (0,2 GB para 51,6 M de parámetros) es consistente con pesos en fp32 |
| Idiomas soportados | no aplica: la política no está condicionada por lenguaje natural, solo por observaciones visuales y de estado |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

Otros datos: pipeline declarado `robotics`, dataset de entrenamiento `lerobot/libero`, 0 descargas y 0 "likes" en el momento de la consulta, repositorio de 0,2 GB.

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una política de imitación propuesta en el trabajo ALOHA de Tony Zhao y colaboradores. En lugar de predecir una única acción por paso, el modelo predice un chunk de acciones futuras, lo que reduce el error de compounding y permite un control más suave. La implementación usada aquí es la de LeRobot, que entrena con un objetivo de imitación supervisada sobre demostraciones humanas y, en su formulación original, incorpora un componente de autoencoder variacional condicional (CVAE) para modelar la multimodalidad de las demostraciones.

Los datos de entrenamiento provienen de `lerobot/libero`, restringidos a 43 episodios de una única tarea. La ejecución usada para este checkpoint consta de 20.000 pasos con batch size 8, sobre 1 GPU RTX 5070 Ti de 16 GB, con un tiempo de reloj de 12 minutos. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de ajuste posterior al entrenamiento por imitación. La única diferencia respecto al checkpoint de 100.000 pasos del mismo autor es el número de pasos, lo que convierte al par en un experimento controlado sobre el presupuesto de entrenamiento. No se describen innovaciones técnicas adicionales más allá de las propias de ACT.

## Capacidades

- Control robótico de manipulación en simulación: genera secuencias de acciones (chunks) para un brazo manipulador en el entorno MuJoCo de LIBERO.
- Ejecución de una única tarea: abrir el cajón central del armario en `libero_goal`, índice de tarea 0.
- Política de imitación condicionada por observaciones visuales y de estado; no requiere descripción textual de la tarea.
- Ejecución en bucle cerrado con troceado de acciones (`n_action_steps=10`) y reevaluación periódica del estado del entorno.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingües: la política no procesa lenguaje natural.
- No dispone de modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- Estudio de ablación de presupuesto de entrenamiento: comparar este checkpoint con el de 100.000 pasos permite cuantificar cuánta tasa de éxito aporta cada tramo de entrenamiento en ACT, con el resto de variables fijadas.
- Reproducción de experimentos en robótica: sirve como punto de partida documentado para replicar el pipeline de LeRobot y validar resultados propios sobre `libero_goal`.
- Pruebas de integración continua de herramientas de evaluación: al ser un modelo pequeño y rápido de evaluar (10 episodios en torno a 3,6 s por episodio), es útil para verificar que `lerobot-eval` funciona correctamente en un entorno de CI.
- Validación de hardware de bajo coste: permite comprobar el rendimiento real de una GPU de consumo en evaluación de políticas robóticas, con un pico de 1283 MiB de VRAM.
- Docencia y formación: ilustra de forma tangible el efecto de un presupuesto de entrenamiento insuficiente y el concepto de checkpoint intermedio en imitación supervisada.
- Punto de partida para ajuste fino: puede servir como inicialización para reentrenar sobre otras tareas de LIBERO o sobre variaciones de la misma tarea, dado su bajo coste computacional.
- Depuración de pipelines de simulación: útil para comprobar la correcta configuración de MuJoCo (por ejemplo, `MUJOCO_GL=egl` en máquinas sin cabecera) antes de lanzar entrenamientos más largos.

## Benchmarks y rendimiento

Datos publicados por el autor con `lerobot-eval`, tarea `libero_goal` índice 0, semilla 1000, 10 episodios y `n_action_steps=10`:

| Checkpoint | Pasos | Tasa de exito | Segundos por episodio |
|---|---:|---:|---:|
| Este modelo (20k) | 20.000 | 60,0 % | 3,6 |
| `AmberHyunKIM/act_libero_goal_task0` (100k) | 100.000 | 100,0 % | 2,7 |

Ambos checkpoints alcanzan un pico de 1283 MiB de VRAM durante la evaluación. La ejecución de 100.000 pasos es simultáneamente más precisa y más rápida por episodio, porque una política mejor completa la tarea en menos pasos. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K ni equivalentes de robótica como LIBERO-10 agregado) en la información disponible; estos benchmarks de lenguaje no son aplicables a una política de control.

## Requisitos de hardware

- VRAM en inferencia: 1283 MiB de pico medido durante la evaluación, es decir, aproximadamente 1,3 GB. Cabe holgadamente en cualquier GPU con 4 GB o más.
- VRAM en entrenamiento: la ejecución de referencia se completó en 1 GPU RTX 5070 Ti de 16 GB.
- GPU recomendadas: cualquier GPU NVIDIA moderna sirve para inferencia. Para entrenamiento, una RTX 5070 Ti, RTX 4090, A100 o H100 permiten ejecutar el pipeline sin problemas; el modelo es lo bastante pequeño como para no necesitar VRAM de centro de datos.
- GPU de consumo: sí, cabe en todas las gamas actuales y en muchas antiguas (por ejemplo, GTX 1650 o superiores con al menos 4 GB). También es viable ejecutarlo en CPU, aunque sin aceleración la evaluación será más lenta.
- Opciones de despliegue: `lerobot-eval` y el resto del ecosistema LeRobot. En máquinas sin cabecera es necesario definir `MUJOCO_GL=egl` para la renderización del entorno MuJoCo. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de política.
- Latencia y throughput: 3,6 segundos por episodio en la configuración de evaluación publicada, con 10 episodios por ejecución y `n_action_steps=10`. No se publican medidas de throughput por paso de control.

Ejemplo de invocación documentado por el autor:

```bash
lerobot-eval \
  --policy.path=AmberHyunKIM/act_libero_goal_task0_20k \
  --policy.device=cuda \
  --policy.n_action_steps=10 \
  --env.type=libero --env.task=libero_goal --env.task_ids='[0]' \
  --eval.batch_size=1 --eval.n_episodes=10 --seed=1000
```

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Tasa de exito (semilla 1000, 10 episodios) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `act_libero_goal_task0_20k` (este) | 51,6 M | `libero_goal` tarea 0 | 60,0 % | apache-2.0 | Hugging Face |
| `AmberHyunKIM/act_libero_goal_task0` (100k) | 51,6 M | `libero_goal` tarea 0 | 100,0 % | apache-2.0 | Hugging Face |
| Políticas alternativas sobre `libero_goal` (por ejemplo, Diffusion Policy u otros checkpoints de ACT en LeRobot) | no disponible | `libero_goal` | no disponible | no disponible | no disponible |

No se dispone de datos comparativos publicados en la información proporcionada para políticas de otros autores evaluadas exactamente con la misma configuración (`lerobot-eval`, semilla 1000, 10 episodios, `n_action_steps=10`), por lo que cualquier comparación numérica adicional sería especulativa. La comparación directa con el checkpoint de 100.000 pasos es la única que está controlada experimentalmente.

## Limitaciones y advertencias

- Rendimiento insuficiente para uso real: falla 4 de cada 10 episodios en su propia tarea. El propio autor lo describe como un artefacto de ablación, no como una política para desplegar.
- Sin condicionamiento por lenguaje: ACT no acepta instrucciones en lenguaje natural, por lo que el checkpoint solo cubre la tarea exacta con la que se entrenó.
- Ausencia total de generalización: no se ha entrenado ni evaluado en otras tareas, posiciones de objeto, variaciones de iluminación o entornos distintos de `libero_goal` tarea 0.
- Base de datos reducida: 43 episodios de una única tarea, lo que limita la diversidad de demostraciones y favorece el sobreajuste a las condiciones de la simulación.
- Validación exclusivamente en simulación (MuJoCo/LIBERO): no hay evidencia publicada de transferencia a un robot físico, y el salto sim2real es un riesgo conocido en este tipo de políticas.
- Sesgos conocidos: no se documenta ningún análisis de sesgos, robustez ni comportamiento fuera de distribución en la información disponible.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe el riesgo análogo de que la política genere acciones plausibles pero incorrectas cuando el estado se aleja de la distribución de entrenamiento.
- Dependencia del entorno de evaluación: requiere la suite LIBERO, MuJoCo y `MUJOCO_GL=egl` en máquinas sin cabecera; los resultados pueden variar con otras versiones de las dependencias.
- Licencia: apache-2.0, que permite uso comercial y modificación. Conviene verificar por separado las condiciones del dataset `lerobot/libero` y del benchmark LIBERO si se va a reutilizar el modelo en un producto.
- Reproducibilidad: la evaluación publicada usa una única semilla (1000) y 10 episodios, una muestra pequeña; la tasa de éxito real puede variar con otras semillas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmberHyunKIM/act_libero_goal_task0_20k
- Checkpoint de referencia de 100.000 pasos del mismo autor: https://huggingface.co/AmberHyunKIM/act_libero_goal_task0
- Página del algoritmo ACT (ALOHA): https://tonyzhaozh.github.io/aloha/
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/libero
- Benchmark LIBERO (referencia del entorno de evaluación): no disponible en la información proporcionada

La búsqueda web asociada no devolvió resultados relevantes sobre el modelo: los enlaces recuperados corresponden a un sitio de agregación de medios y a contenido promocional sin relación con robótica ni con ACT.
