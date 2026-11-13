# omjambhale/act_eraser_in_bucket_v2

## Resumen

`omjambhale/act_eraser_in_bucket_v2` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. El modelo lo publica el usuario omjambhale en Hugging Face mediante la librería LeRobot de Hugging Face, y está especializado en una única tarea manipulativa: coger una goma de borrar y depositarla en un cubo azul.

No se trata de un modelo de lenguaje: es un controlador visomotor que consume el estado de las articulaciones del robot y dos cámaras (muñeca y frontal) y emite comandos de acción de 6 dimensiones. Con 51,7 millones de parámetros y un repositorio de 0,2 GB, es un modelo compacto pensado para ejecutarse en el propio robot o en un PC con GPU modesta, no en infraestructura de gran escala.

Su relevancia es la de un artefacto reproducible de robótica open source: licencia Apache 2.0, formato safetensors, integración nativa con LeRobot y un dataset público de 35 episodios y 19.836 fotogramas a 30 FPS. Sirve como referencia para reproducir el pipeline completo de imitación (grabación, entrenamiento y despliegue) en un robot SO-100/SO-101 follower.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana temporal definida por la configuración de ACT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo robótico; la tarea se especifica en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT combina un backbone visual (codificador de imágenes de las cámaras `wrist` y `front`, ambas a 480x640 con 3 canales) con un transformer que fusiona las observaciones visuales y el estado propioceptivo de 6 dimensiones, y un decodificador que emite chunks de acciones de 6 dimensiones. La predicción por chunks reduce el error de compounding y suaviza el control, lo que explica los buenos resultados de ACT en tareas de manipulación con datos de teleoperación.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `omjambhale/eraser-in-bucket_clean`: 35 episodios, 19.836 fotogramas a 30 FPS, tarea "Pick up the eraser and put it in the blue bucket". Configuración: 40.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta composición adicional del dataset, aumentos de datos ni fases de RLHF/DPO (no aplicables a este tipo de política).

## Capacidades

- Control visomotor para una tarea manipulativa concreta: recoger una goma de borrar y colocarla en un cubo azul.
- Entrada multimodal: estado de articulaciones `(6,)` más dos imágenes RGB de 480x640 (cámara de muñeca y cámara frontal).
- Salida de acciones continuas de 6 dimensiones en forma de chunks.
- Aprendizaje por imitación a partir de teleoperación, sin recompensas explícitas.
- Integración con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo de texto.

## Casos de uso

- Reproducción de un pipeline de imitación completo: usar el modelo y el dataset como referencia para grabar datos con un SO follower, entrenar con `lerobot-train` y desplegar con `lerobot-rollout` en un robot propio.
- Benchmark interno de manipulación pick-and-place: ejecutar la política sobre la tarea del cubo para medir tasas de éxito antes de escalar a tareas más complejas.
- Base para fine-tuning en tareas similares: reentrenar con un dataset propio de recogida y depósito de objetos pequeños reutilizando la configuración de ACT y los hiperparámetros publicados.
- Docencia y formación en robótica de imitación: ejemplo funcional y de pequeño tamaño (51,7 M de parámetros) para explicar ACT, chunks de acción y control visomotor.
- Prototipado de estaciones de pick-and-place en laboratorio: validar cámaras, calibración y latencia de control antes de invertir en políticas mayores.
- Pruebas de integración de LeRobot en CI: verificar que el entorno, las versiones y los comandos de rollout funcionan con un checkpoint real y ligero.
- Evaluación de robustez ante cambios de iluminación o posición de objetos: el modelo permite experimentar con variaciones controladas sobre una tarea acotada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en safetensors (aproximadamente 0,2 GB en FP32), cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4060, RTX 4090, A100, H100); el modelo no requiere hardware de gama alta.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas; también es viable en CPU para pruebas, aunque la latencia de control puede resentirse.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=omjambhale/act_eraser_in_bucket_v2`), con soporte CUDA vía `--policy.device=cuda` en entrenamiento.
- Latencia y throughput: no disponibles; dependen del robot, las cámaras y el hardware de inferencia. El control opera a 30 FPS según el dataset.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_eraser_in_bucket_v2 (este) | 51,7 M | no aplica | Pick-and-place de goma de borrar en cubo | Apache 2.0 | Hugging Face (0 descargas) |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | Tareas manipulativas diversas | variable (habitualmente Apache 2.0) | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | variable | no aplica | Manipulación por imitación | variable | Hugging Face / repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único robot (`so_follower`); no generaliza a otras tareas ni configuraciones sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Dataset pequeño: 35 episodios y 19.836 fotogramas limitan la robustez ante cambios de iluminación, posición de objetos, distracciones o variaciones del entorno.
- Dependencia de calibración: requiere que las cámaras y el robot estén calibrados y que los nombres de cámara coincidan con las claves de observación (`wrist`, `front`).
- Riesgo de sobreajuste al escenario de grabación: cambios en el fondo, el cubo o la goma pueden degradar el comportamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset asociado.
- Sin capacidades de lenguaje, razonamiento simbólico ni tool calling: no debe emplearse fuera del contexto de control robótico para el que fue entrenado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omjambhale/act_eraser_in_bucket_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/omjambhale/eraser-in-bucket_clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=omjambhale/eraser-in-bucket_clean
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
