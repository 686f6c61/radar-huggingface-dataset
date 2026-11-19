# knight7024/diffusion_pick_and_place_hair_roll_final

## Resumen

`diffusion_pick_and_place_hair_roll_final` es una política de control visuomotor entrenada con el método Diffusion Policy y publicada en el Hub mediante LeRobot. No es un modelo de lenguaje: es un modelo de robótica que consume el estado articular del robot y dos flujos de imagen (cámara superior y cámara de muñeca) y produce una secuencia de acciones de 6 dimensiones. El autor es el usuario `knight7024` y el modelo está pensado para una tarea muy concreta: recoger y colocar un rulo de pelo ("pick_and_place_hair_roll_final") con un robot tipo `so_follower` (SO-100/SO-101 de LeRobot).

El modelo tiene 277.839.366 parámetros en formato safetensors y un repositorio de 1,1 GB. La arquitectura subyacente es una red de difusión condicionada por observaciones (imágenes y estado), que genera trayectorias de acción multimodales y suaves, una aproximación especialmente útil en manipulación con contacto rico. Fue entrenado con 60 episodios y 43.285 fotogramas a 30 FPS, durante 300.000 pasos con batch de 8 y optimizador Adam.

Su relevancia es la de un ejemplo reproducible de imitation learning end-to-end para robótica de bajo coste: cualquiera con un SO-100/SO-101 y dos cámaras puede desplegarlo con `lerobot-rollout` o reentrenar el pipeline con `lerobot-train`. No obstante, es un modelo de nicho, sin métricas de evaluación publicadas y con cero descargas en el momento de redactar esta ficha, por lo que debe tratarse como una política experimental y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (red de difusión condicionada por observaciones para control visuomotor) |
| Parametros totales | 277.839.366 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de robótica; ventana de observación definida por el pipeline de LeRobot, no documentada) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; LeRobot no documenta cuantizaciones específicas para esta política) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se identifica con la cadena `pick_and_place_hair_roll_final`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot, 1,1 GB) |

## Arquitectura y entrenamiento

La política sigue el método Diffusion Policy (Chi et al., arXiv:2303.04137), que formula el control visuomotor como un proceso generativo de difusión: en lugar de predecir una acción única, el modelo aprende a denoizar trayectorias de acción completas condicionadas por la observación. Esto produce acciones multimodales y temporalmente coherentes, con buen comportamiento en tareas de manipulación con contacto. La entrada combina `observation.state` de forma `(6,)` con dos imágenes RGB de `(3, 240, 320)` procedentes de las cámaras `top` y `wrist`; la salida es un vector `action` de `(6,)`.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `knight7024/pick_and_place_hair_roll_final`: 60 episodios, 43.285 fotogramas a 30 FPS, una única tarea. La configuración reportada es de 300.000 pasos, batch size 8, optimizador Adam, learning rate 1e-4 y semilla 1000. No se documentan detalles sobre aumentación de datos, composición del dataset más allá del recuento de episodios, ni si hubo etapas de refinamiento adicionales. El robot de destino es `so_follower`, con dos cámaras (`top` y `wrist`).

## Capacidades

- Generación de trayectorias de acción de 6 dimensiones para un robot `so_follower` a partir de estado articular e imágenes.
- Control visuomotor end-to-end: no requiere planificación explícita ni modelo cinemático del entorno.
- Manipulación con contacto: el enfoque de difusión está diseñado para tareas de contacto rico, como recoger y colocar objetos.
- Condicionamiento multimodal: integra dos vistas de cámara (superior y de muñeca) junto con el estado del robot.
- Ejecución mediante `lerobot-rollout` con `--policy.path=knight7024/diffusion_pick_and_place_hair_roll_final`.
- Reentrenamiento reproducible con `lerobot-train --policy.type=diffusion`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan modos especiales (thinking, visión general, audio) más allá del uso previsto como política robótica.

## Casos de uso

- Recogida y colocación de un rulo de pelo: es la tarea exacta para la que fue entrenado; se ejecuta con `lerobot-rollout` sobre un `so_follower` con cámaras `top` y `wrist`, y el modelo genera trayectorias suaves de aproximación, agarre y depósito.
- Base para fine-tuning en tareas de pick-and-place similares: partiendo de esta política y del pipeline `lerobot-train`, se puede reentrenar con un dataset propio de objetos y posiciones parecidas, reduciendo el coste frente a entrenar desde cero.
- Prototipado de imitación de bajo coste: útil en laboratorios y aulas con SO-100/SO-101 para demostrar un pipeline completo de grabación de datos, entrenamiento y despliegue con LeRobot.
- Evaluación de robustez de Diffusion Policy: sirve como punto de partida para estudiar sensibilidad a iluminación, posiciones de objeto y distracciones, dado que el autor no publicó métricas de éxito.
- Generación de datos sintéticos de trayectorias: las trayectorias multimodales que produce pueden usarse para análisis comparativos frente a políticas deterministas (p. ej. ACT) en el mismo entorno.
- Demostraciones reproducibles en investigación: al estar publicados dataset, configuración y comando de rollout, permite replicar el experimento y documentar variaciones de hiperparámetros.
- Integración en pipelines de evaluación automatizada: se puede lanzar con `--duration` acotado y registrar episodios para medir tasas de éxito propias, ya que la model card no las incluye.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota explícita de que no se han proporcionado resultados para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 277,8 M de parámetros en safetensors, los pesos ocupan aproximadamente 1,1 GB en FP32, por lo que la inferencia cabe holgadamente en GPUs de consumo con 4-8 GB de VRAM, aunque el consumo real depende del pipeline de LeRobot y de los buffers de imagen.
- GPU recomendadas: no especificadas por el autor; por tamaño del modelo, una RTX 3060/4060 o superior es suficiente para inferencia, y una RTX 4090 o A100 acelera el reentrenamiento.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 8 GB de VRAM; no hay requisitos oficiales publicados.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El control opera a 30 FPS según el dataset, pero no se publican medidas de latencia por paso de difusión ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `knight7024/diffusion_pick_and_place_hair_roll_final` | Diffusion Policy (LeRobot) | 277,8 M | estado (6,) + 2 imagenes (3, 240, 320) | Apache 2.0 | Hugging Face Hub, 0 descargas |
| Otras políticas Diffusion Policy en LeRobot Hub | Diffusion Policy (LeRobot) | variable segun politica | variable segun robot y camaras | habitualmente Apache 2.0 | Hugging Face Hub |
| Políticas ACT en LeRobot Hub | Action Chunking Transformer | variable segun politica | variable segun robot y camaras | habitualmente Apache 2.0 | Hugging Face Hub |
| Políticas pi0 / pi0.5 (Physical Intelligence) | VLA (vision-language-action) | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | publicadas por Physical Intelligence |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a tipo de método, licencia y disponibilidad.

## Limitaciones y advertencias

- Sin métricas de éxito publicadas: la model card indica explícitamente que no se han proporcionado resultados de evaluación, por lo que se desconoce la tasa de acierto real.
- Tarea única y muy específica: entrenada solo para `pick_and_place_hair_roll_final`; no generaliza a otros objetos, posiciones o entornos sin reentrenamiento.
- Dataset pequeño: 60 episodios y 43.285 fotogramas limitan la diversidad de escenarios y aumentan el riesgo de sobreajuste al entorno de grabación.
- Dependencia del hardware exacto: el modelo espera un robot `so_follower` con cámaras `top` y `wrist` y las claves de observación exactas; cambios de cámara, resolución o calibración degradan el comportamiento.
- Riesgo de alucinación de trayectorias: como política generativa, puede producir acciones plausibles pero incorrectas ante observaciones fuera de distribución; requiere supervisión y parada de emergencia en el robot.
- Sesgos: no documentados por el autor; al ser un modelo de robótica, los sesgos relevantes son de distribución de datos (iluminación, posiciones, objetos) más que lingüísticos.
- Idiomas: no aplica; no es un modelo de lenguaje y no ofrece capacidades multilingües.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene conservar la atribución y citar LeRobot y el paper de Diffusion Policy.
- Madurez: 0 descargas y 0 likes en el momento de redactar la ficha, sin demo ni vídeo publicado; trátese como artefacto experimental.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/knight7024/diffusion_pick_and_place_hair_roll_final
- Dataset de entrenamiento: https://huggingface.co/datasets/knight7024/pick_and_place_hair_roll_final
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=knight7024/pick_and_place_hair_roll_final
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
