# Harrysunshine/so101-smolvla-sim-real-10task

## Resumen

El modelo `Harrysunshine/so101-smolvla-sim-real-10task` es un modelo de política robótica (Vision-Language-Action, VLA) desarrollado por Harrysunshine a partir del modelo base `lerobot/smolvla_base`. Está diseñado para controlar un brazo robótico SO-101 en tareas de pick-and-place, con un mismo conjunto de pesos que funciona tanto en el simulador SO-101 como en el hardware real. El ajuste fino se realizó sobre 3698 episodios (1.280.507 frames) que combinan 1498 episodios de simulación y 2200 episodios de teleoperación real, cubriendo 10 tareas. La arquitectura es un VLA basado en SmolVLA con 450.046.176 parámetros, de los cuales 403M son entrenables en esta configuración (ajuste fino completo, sin congelar el codificador visual). El modelo se distribuye bajo licencia Apache 2.0 en formato safetensors y está diseñado para integrarse en el ecosistema LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en `lerobot/smolvla_base`; detalles internos no disponibles |
| Parámetros totales | 450.046.176 (450M) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de SmolVLA, un modelo VLA de LeRobot. En esta versión se realiza un ajuste fino completo sobre el modelo base, con `freeze_vision_encoder=false` y `train_expert_only=false`, lo que permite entrenar 403M de los 450M de parámetros (frente a los 100M de la configuración por defecto, que congela la torre visual).

El conjunto de datos combina 1498 episodios de simulación generados en este proyecto (disponibles en el dataset `so101-sim-pickplace-v2`) y 2200 episodios de teleoperación real procedentes de ModelScope, sumando 3698 episodios y 1.280.507 frames para 10 tareas. Las tareas `cube` y `can` tienen datos en ambos dominios y comparten la misma instrucción de texto, por lo que se agrupan en un único identificador de tarea.

El entrenamiento se realizó en 6 GPUs A800 con `accelerate` DDP, batch de 16 por proceso (effective batch 96), learning rate 5e-5, warmup de 2000 pasos y decaimiento coseno hasta 30000 pasos (2.22 épocas). Se aplicaron seis aumentos de imagen: brillo, contraste, matiz, saturación, nitidez y transformación afín.

La principal innovación es que el modelo utiliza la misma definición de acciones y estados para simulación y hardware real: ángulos de articulación en grados, pinza expresada como porcentaje de recorrido (0-100), orden de canales `shoulder_pan/shoulder_lift/elbow_flex/wrist_flex/wrist_roll/gripper`, y lecturas en la rejilla de un codificador de 12 bits. Esto permite una transferencia directa entre dominios, aunque el autor advierte que el rendimiento en el robot real no ha sido medido en esta iteración.

## Capacidades

- Generación de políticas de control para el brazo robótico SO-101 en tareas de pick-and-place.
- Un único conjunto de pesos para simulación y hardware real (sim2real).
- Soporte de 10 tareas de manipulación, incluyendo recoger un cubo, un cubo pequeño y una lata y colocarlos en un contenedor.
- Integración con el framework LeRobot y el comando `lerobot-eval`.
- No se documentan capacidades de tool calling, generación de texto libre, razonamiento simbólico, visión general o audio.
- Las instrucciones de tareas están en inglés; no se especifica soporte multilingüe.

## Casos de uso

- Automatización de pick-and-place en almacenes: el modelo puede controlar un brazo SO-101 para recoger objetos y colocarlos en contenedores, con una tasa de éxito del 90-96% en simulación, lo que lo hace adecuado para entornos logísticos controlados.
- Transferencia sim2real: al haber sido entrenado con datos mixtos de simulación y real, el modelo puede desplegarse en hardware real sin necesidad de recalibrar la definición de acciones/estado, aunque el autor advierte que el rendimiento real debe medirse.
- Investigación en aprendizaje por imitación: el modelo sirve como referencia para estudiar el efecto del ajuste fino completo frente al ajuste de solo adaptador en VLA, gracias a la documentación de los parámetros entrenables.
- Benchmarking de políticas robóticas: usando `lerobot-eval`, se pueden reproducir las evaluaciones en el entorno SO-101 con los parámetros explícitos indicados en la model card.
- Generación de datos sintéticos para entrenamiento: el dataset de simulación (1498 episodios) puede combinarse con datos reales para ampliar la cobertura de tareas y mejorar la robustez.
- Desarrollo de sistemas de manipulación en entornos educativos: el modelo puede ejecutarse en simuladores SO-101 para enseñar robótica y control de brazos articulados.
- Aplicaciones industriales de montaje: tareas de recoger y colocar piezas pequeñas, con la advertencia de validar en el entorno real antes de su despliegue.

## Benchmarks y rendimiento

| Tarea | Éxito (n=50) | IC 95% |
|---|---|---|
| Pick up a cube and place in the bin | 94.0% (47/50) | [83.5%, 98.7%] |
| Pick up a small cube and place in the bin | 90.0% (45/50) | [78.2%, 96.7%] |
| Pick up a can and place in the bin | 96.0% (48/50) | [86.3%, 99.5%] |

No se han publicado resultados de benchmarks externos en la información disponible. El rendimiento en hardware real no ha sido medido.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la información.
- El entrenamiento se realizó en 6 GPUs A800 (80 GB) con DDP.
- Para inferencia, con 450M de parámetros en FP32, los pesos ocupan aproximadamente 1.8 GB de VRAM; se recomienda una GPU con al menos 8 GB para el procesamiento de imágenes y activaciones.
- No se documentan cuantizaciones, por lo que no hay datos de VRAM reducida.
- El despliegue se realiza a través de LeRobot (`lerobot-eval`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje general.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tareas | Datos | Rendimiento | Licencia |
|---|---|---|---|---|---|
| `Harrysunshine/so101-smolvla-sim-real-10task` | 450M | 10 | 3698 episodios mixtos | 90-96% simulación | Apache 2.0 |
| `Harrysunshine/so101-smolvla-9task` | No disponible | 9 | No disponible | No disponible | Apache 2.0 |
| `lerobot/smolvla_base` | 450M | No disponible | No disponible | No disponible | Apache 2.0 |

## Limitaciones y advertencias

- El rendimiento en hardware real no ha sido medido; la model card lo indica explícitamente: "el lado real no se ha medido en esta ronda".
- La evaluación con `lerobot-eval` requiere pasar explícitamente los parámetros `--env.*`; si se omiten, se producen errores silenciosos que resultan en una tasa de éxito baja que puede malinterpretarse como un fallo de aprendizaje.
- El modelo está especializado en el brazo SO-101 y en tareas de pick-and-place; no es un modelo de propósito general.
- Los datos de entrenamiento incluyen teleoperación real de ModelScope, lo que puede introducir sesgos en la distribución de acciones y estados.
- Los resultados de simulación se basan en 50 episodios por tarea; los intervalos de confianza son amplios y el rendimiento en otros escenarios no está garantizado.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantías de rendimiento en entornos no probados.

## Enlaces

- https://huggingface.co/Harrysunshine/so101-smolvla-sim-real-10task
- https://huggingface.co/Harrysunshine/so101-smolvla-9task
- https://huggingface.co/datasets/Harrysunshine/so101-sim-pickplace-v2
- https://huggingface.co/docs/lerobot/so101
- https://huggingface.co/lerobot/smolvla_base
