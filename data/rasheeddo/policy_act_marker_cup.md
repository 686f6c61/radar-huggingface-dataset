# rasheeddo/policy_act_marker_cup

## Resumen

`rasheeddo/policy_act_marker_cup` es una política de robótica basada en Action Chunking with Transformers (ACT), el método de aprendizaje por imitación descrito en el paper arXiv:2304.13705. En lugar de predecir una única acción por paso, el modelo predice fragmentos cortos de acciones (*action chunks*), lo que le permite ejecutar secuencias de manipulación de forma más estable y con mayor tasa de éxito a partir de datos de teleoperación. Ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje automático en robótica del mundo real.

El modelo está especializado en una única tarea: "Grab marker and put in cup" (coger un rotulador y dejarlo en un vaso). Se entrenó con 80 episodios y 58.556 fotogramas grabados a 30 FPS sobre un brazo `so_follower` (familia SO-100), usando dos cámaras (`front` y `wrist`) a resolución 480x640. La política consume el estado articular (vector de 6 dimensiones) más las dos imágenes, y produce un vector de acción de 6 dimensiones.

Con 51.668.614 parámetros (unos 51,7 millones) y un repositorio de 0,2 GB, es un modelo pequeño que puede ejecutarse en hardware de consumo. Su relevancia es práctica más que de investigación: sirve como ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot (grabación de datos, entrenamiento y despliegue con `lerobot-rollout`), y como punto de partida para reentrenar o hacer *fine-tuning* sobre tareas propias de pick-and-place.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitación |
| Parametros totales | 51.668.614 (aprox. 51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el tamaño del *action chunk* y el horizonte de observación no se detallan en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponibles (no es un modelo de lenguaje; no procesa texto libre) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tipo de robot | `so_follower` |
| Camaras | `front`, `wrist` (3, 480, 640 cada una) |
| Entrada de estado | `observation.state` con forma `(6,)` |
| Salida de accion | `action` con forma `(6,)` |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

La arquitectura es ACT, un transformer encoder-decoder con componente de autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas. La innovación principal del método es la predicción por *chunks*: el modelo emite una secuencia de acciones futuras en una sola pasada, en lugar de una acción por inferencia, lo que reduce el error de acumulación típico de las políticas paso a paso y mejora la suavidad del movimiento. La política consume dos flujos visuales (camara frontal y de muñeca) junto con el estado articular, y devuelve las seis dimensiones de acción del brazo. Los detalles concretos de esta instancia (configuración exacta de capas, dimensión del *chunk*, uso de decodificación temporal) no se especifican en la model card; solo se indica el método de referencia.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `rasheeddo/marker_cup_20260916_205331`, compuesto por 80 episodios de teleoperación, 58.556 fotogramas a 30 FPS y una única tarea. La configuración declarada es de 100.000 pasos, batch size 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se menciona en la información disponible el uso de RLHF, DPO ni otras fases de alineación, algo esperable en una política de imitación. Tampoco se detalla la composición del dataset más allá del número de episodios, los fotogramas y la descripción de la tarea.

## Capacidades

- Generación de acciones de manipulación para un brazo robótico `so_follower` a partir de observaciones visuales y propioceptivas.
- Control visomotor con dos cámaras: una frontal y una montada en la muñeca.
- Ejecución de una tarea concreta de pick-and-place: coger un rotulador y depositarlo en un vaso.
- Aprendizaje por imitación a partir de datos de teleoperación, sin recompensa explícita.
- Inferencia de *action chunks*, lo que produce trayectorias más coherentes que la predicción paso a paso.
- Integración con el ecosistema LeRobot: comandos `lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento.
- Capacidad de servir como punto de partida para *fine-tuning* con datasets propios de tareas similares.
- No dispone de *tool calling*, razonamiento multi-paso simbólico, capacidades multilingües ni procesamiento de lenguaje natural. No hay modo de razonamiento explícito ni soporte de audio.

## Casos de uso

- Automatización de la tarea entrenada en laboratorio: ejecutar el ciclo "coger rotulador y dejarlo en el vaso" sobre un brazo SO-100 con la misma disposición de cámaras (`front` y `wrist`) empleada en el entrenamiento.
- Validación de hardware y calibración: usar la política como prueba funcional tras montar y calibrar un brazo `so_follower`, comprobando que el robot responde correctamente antes de abordar tareas más complejas.
- Recolección de datos y comparación de métodos: servir como referencia base de ACT para comparar contra otras políticas de LeRobot (por ejemplo Diffusion Policy o SmolVLA) sobre el mismo dataset de 80 episodios.
- Punto de partida para *fine-tuning*: reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio de pick-and-place, aprovechando la configuración de 100.000 pasos y lr 1e-5 como línea base.
- Docencia y formación en robótica de imitación: demostrar el flujo completo grabación-entrenamiento-despliegue con un modelo de solo 51,7 M de parámetros que cabe en un portátil con GPU.
- Prototipos y demostraciones en ferias o jornadas técnicas: el modelo es ligero y reproducible, y permite mostrar manipulación real con hardware de bajo coste.
- Pruebas de integración de pipelines de inferencia robótica: verificar la comunicación entre LeRobot, los drivers de cámara OpenCV y el controlador del brazo a 30 FPS, que es la frecuencia del dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la sección de evaluación vacía, con la nota de que todavía no se han proporcionado resultados en robot real. No se dispone, por tanto, de tasa de éxito, número de ensayos ni condiciones de evaluación (posiciones de objeto, iluminación, distractores, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en precisión de 32 bits ocupan aproximadamente 207 MB (51,7 M de parámetros x 4 bytes). Sumando activaciones y los dos tensores de imagen de 3x480x640, una estimación razonable es de 1 a 2 GB de VRAM, aunque no hay cifras oficiales publicadas.
- GPU recomendadas: cualquier GPU con CUDA y al menos 2-4 GB de VRAM es suficiente en principio, dado el tamaño del modelo. El comando de entrenamiento de LeRobot usa `--policy.device=cuda` por defecto.
- Cabe en GPU de consumo: sí, con margen amplio. Tarjetas como GTX 1060 6 GB, RTX 3050, RTX 3060, RTX 4060 o superiores son suficientes para inferencia; el cuello de botella probable es el preprocesado de imagen y el control del robot, no el modelo.
- Ejecución en CPU: no está documentada explícitamente para esta política, pero por tamaño sería viable, con latencias mayores que podrían no cumplir el ritmo de 30 FPS exigido por el control.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) de la librería LeRobot es el método documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política robótica de este tipo.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se registró a 30 FPS, lo que marca la referencia temporal esperada de control, pero no se publican mediciones de latencia de inferencia.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para esta política concreta. Como referencia cualitativa de la misma categoría dentro del ecosistema LeRobot:

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rasheeddo/policy_act_marker_cup` | 51,7 M | no disponible | no disponible | apache-2.0 | Hugging Face, via LeRobot |
| Otras políticas ACT de LeRobot | no disponible | no disponible | no disponible | variable segun repositorio | Hugging Face, via LeRobot |
| Políticas Diffusion Policy de LeRobot | no disponible | no disponible | no disponible | variable segun repositorio | Hugging Face, via LeRobot |
| SmolVLA (Vision-Language-Action de LeRobot) | no disponible en esta busqueda | no disponible | no disponible | variable segun repositorio | Hugging Face, via LeRobot |

No se han encontrado en la búsqueda web datos verificables de parámetros, contexto o rendimiento de alternativas concretas que permitan una comparación numérica. La comparación debe hacerse, por tanto, reentrenando cada método sobre el mismo dataset.

## Limitaciones y advertencias

- Especialización extrema: solo está entrenado para la tarea "Grab marker and put in cup". No generaliza a otras tareas, objetos ni disposiciones sin reentrenamiento o *fine-tuning*.
- Dependencia del entorno: funciona con la configuración de cámara, iluminación, posiciones de objeto y robot empleadas en la recogida de datos. Cambios en la iluminación, la posición de la mesa o la presencia de distractores pueden degradar el comportamiento.
- Sin evaluación publicada: no hay tasa de éxito medida, ni número de ensayos, ni caracterización de fallos. Cualquier uso en producción exige una evaluación propia en robot real.
- Riesgo de sobreajuste: con solo 80 episodios y 58.556 fotogramas de una única tarea, el modelo puede memorizar posiciones y no responder bien a variaciones.
- Sesgos del dataset: las demostraciones provienen de una única persona teleoperando, por lo que la política hereda su estilo de movimiento y sus errores sistemáticos.
- Idiomas: no aplica; la política no procesa lenguaje natural ni instrucciones textuales. El campo `--task` en `lerobot-rollout` es una etiqueta de contexto, no una instrucción interpretada por el modelo.
- Restricciones de licencia: apache-2.0 permite uso comercial, modificación y redistribución, siempre conservando el aviso de licencia. Es necesario citar además el método ACT (arXiv:2304.13705) y LeRobot según lo indicado en la model card.
- Reproducibilidad: se documentan semilla (1000), batch (8), lr (1e-5) y número de pasos (100.000), pero no se detalla la configuración completa del entrenamiento ni los pesos intermedios.
- Madurez del repositorio: registra 0 descargas y 0 *likes* en el momento de la consulta, y una fecha de creación futura (2026-09-16), lo que sugiere que es un artefacto experimental sin validación por parte de la comunidad.
- Requisito de hardware físico: para un uso real se necesita el brazo `so_follower` y dos cámaras; no es un modelo que pueda desplegarse únicamente como servicio de software.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rasheeddo/policy_act_marker_cup
- Dataset de entrenamiento: https://huggingface.co/datasets/rasheeddo/marker_cup_20260916_205331
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rasheeddo/marker_cup_20260916_205331
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
