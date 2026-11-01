# at237299966/fm_dit_fold_towel

## Resumen

fm_dit es una política de robótica basada en flow matching condicional, desarrollada por el usuario at237299966, que aprende a ejecutar la tarea de doblar una toalla con los dos brazos de un robot Galaxea R1 Lite. El modelo combina un codificador visual ResNet18 por cámara con un cabezal de acción DiT (Diffusion Transformer) que desruidifica una ventana de 16 pasos de acción a partir de ruido gaussiano, condicionado por 8 fotogramas de tres cámaras y la propiocepción del robot.

Se publica como checkpoint de referencia para una comparación de políticas ODE sobre el mismo conjunto de datos, mismo codificador, mismo batch, misma tasa de aprendizaje y mismo calendario que una política ODE con cabezal multimodal. Es relevante porque ofrece un punto de comparación reproducible y abierto (licencia MIT) para investigaciones de imitación bimanual con flow matching en robótica real, un área donde escasean los checkpoints públicos con datos y logs de entrenamiento completos.

El modelo no es un LLM ni procesa lenguaje: es una política de control motor entrenada sobre 33 episodios reales (17.280 fotogramas) a 15 Hz, con 14 dimensiones de estado y acción (6 articulaciones por brazo más pinza en milímetros). Su tamaño de repo es de 5,7 GB y su inferencia tarda unos 94 ms en una A100 con 10 pasos de midpoint.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de imitación con flow matching condicional: ResNet18 (GroupNorm, recorte aleatorio) por cámara + propiocepción → condición global; cabezal DiT de 512 de ancho × 4 capas × 8 cabezas |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 8 fotogramas de observación de 3 cámaras; ventana de acción de 16 pasos (8 pasados + 8 futuros), se ejecuta el chunk de 8 acciones |
| Tipos de cuantización | no disponible (checkpoints en precisión de entrenamiento, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades de lenguaje) |
| Licencia | MIT |
| Formato de pesos | checkpoints `.ckpt` (`torch.save` con `pickle_module=dill`), que incluyen `model`, `ema_model`, `optimizer` y configuración Hydra serializada |

## Arquitectura y entrenamiento

La arquitectura es una política condicional de flow matching. Cada una de las tres cámaras (`head_rgb` a 720×1280, `right_wrist_rgb` y `left_wrist_rgb` a 360×640, todas rellenadas a cuadrado y redimensionadas a 256×256) pasa por un ResNet18 independiente con GroupNorm y recorte aleatorio; la representación resultante se combina con la propiocepción de 14 dimensiones (6 articulaciones por brazo en radianes más pinza en milímetros) a lo largo de 8 fotogramas para formar la condición global. El cabezal DiT (512 de ancho, 4 capas, 8 cabezas de atención) desruidifica una ventana de acción de 16 pasos desde una trayectoria recta desde N(0, I), con 10 pasos de midpoint en inferencia. Las acciones son objetivos absolutos de articulación (rad) más comandos de pinza en milímetros (0 o pocos mm = cerrada sobre la toalla, 100 = abierta).

El entrenamiento usó el conjunto `at237299966/r1lite_fold_towel` (LeRobot v2.1, 15 Hz, 35 episodios de 455–604 fotogramas; se usan 33 episodios, 17.280 fotogramas, descartando los episodios 2 y 11 por un fallo de agarre repetido en la fase de arrastre). Se optimizó con AdamW, lr 1,5e-4, calendario coseno sobre 300 épocas, warm-up de 500 pasos y EMA, en 2× A100-40GB con DDP, batch de 40 por GPU (80 global), 208 pasos por época y 62.400 pasos totales en 9 h 54 min (119 s/época). La pérdida de entrenamiento bajó de 0,978 en la época 0 a 0,00856 en la 300; la de validación (un episodio reservado, pesos crudos) alcanzó su mínimo de 0,0489 en la época 85 y subió después hasta 0,143 en la 295, señal de sobreajuste que el autor advierte como indicador débil.

## Capacidades

- Control motor bimanual: genera comandos de 14 dimensiones (6 articulaciones por brazo más pinza) para el Galaxea R1 Lite.
- Ejecución de la tarea de doblar toalla: agarre con ambas pinzas, un pliegue, liberación, nuevo agarre de la toalla doblada y arrastre hacia el robot.
- Percepción multimodal: procesa simultáneamente tres cámaras (cabeza y dos muñecas) más propiocepción.
- Predicción de chunks de acción: emite una ventana de 16 pasos y ejecuta el chunk de 8 acciones (fila actual más 7 siguientes).
- Control en bucle cerrado a 15 Hz mediante el cliente openpi-r1lite sin modificar.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente una política de imitación motora.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Investigación en imitación bimanual: sirve como baseline reproducible de flow matching frente a políticas ODE sobre el mismo dataset, codificador y calendario, permitiendo comparaciones controladas en experimentos académicos.
- Despliegue en el robot R1 Lite: el checkpoint se sirve con `serve_policy` y se conecta al cliente openpi-r1lite a 15 Hz, ejecutando la tarea de doblar toalla en el hardware real con `--replan_every 8`.
- Estudio de sobreajuste y selección de checkpoints: los checkpoints cada 50 épocas (50, 100, 150, 200, 250, 300) permiten comparar en el robot el efecto de épocas tempranas frente a tardías, dado que la pérdida de validación es una señal débil.
- Réplica de experimentos: los logs por paso y por época (`logs/logs.json.txt`), la configuración resuelta y las sumas SHA256 permiten reproducir el entrenamiento y verificar la integridad de los archivos.
- Desarrollo de pipelines de despliegue robótico: el servidor de política y el cliente de prueba (`test_client --bimanual -n 40`) sirven como pre-flight para validar latencia, protocolo de red y geometría de cámaras antes de operar el robot.
- Base para fine-tuning en tareas de manipulación con dos brazos: la arquitectura (ResNet18 + DiT con flow matching) y el formato de datos LeRobot v2.1 facilitan adaptar el modelo a otras tareas de plegado o manipulación bimanual con datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pérdidas de entrenamiento y validación:

| Época | 0 | 10 | 50 | 100 | 150 | 200 | 250 | 300 |
|---|---|---|---|---|---|---|---|---|
| Pérdida de entrenamiento | 0,978 | 0,0888 | 0,0352 | 0,0214 | 0,0159 | 0,0122 | 0,00944 | 0,00856 |
| Pérdida de validación | 0,377 | 0,0953 | 0,0595 | 0,0646 | 0,0747 | 0,108 | 0,12 | 0,143 (ép. 295) |

El mínimo de validación fue 0,0489 en la época 85. El autor advierte que estas pérdidas no son comparables entre métodos (ODE y flow matching optimizan cantidades distintas) y que la validación sobre un único episodio es una señal débil.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento usó A100-40GB y el despliegue se documenta en `cuda:0`, sin cifra de memoria de inferencia publicada.
- GPU recomendadas: A100 (la model card mide ~94 ms por predicción en una A100 con 10 pasos de midpoint); no se documentan pruebas en otras GPU.
- GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: servidor propio `roboverse_learn.il.deploy.serve_policy` (con `--checkpoint`, `--host`, `--port`, `--device`, `--replan_every`) y cliente `test_client`; requiere el repositorio ODE_Policy en la rama `r1lite_exp`, commit `e9cc9c0` o posterior.
- Latencia: ~94 ms por predicción en A100, superior al tick de 66,7 ms; con `--replan_every 8` solo uno de cada ocho ticks es lento.
- Throughput: no disponible.
- Carga de checkpoints: requiere `torch.load(..., pickle_module=dill, weights_only=False)`, por lo que solo deben cargarse checkpoints de confianza.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fm_dit (este modelo) | no disponible | 8 fotogramas de 3 cámaras; chunk de 8 acciones | Pérdida val mínima 0,0489 (ép. 85); ~94 ms/predicción en A100 | MIT | HuggingFace, checkpoints cada 50 épocas |
| ODE_policy_euler_sidehead_fold_towel | no disponible | misma configuración de datos y ventana | Pérdidas no comparables con flow matching según el autor | no disponible en la información | HuggingFace (`at237299966/ODE_policy_euler_sidehead_fold_towel`) |

No se dispone de datos de otros modelos comparables de la misma categoría (políticas bimanuales de plegado) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 33 episodios de un único operador y entorno, la política puede no generalizar a otras posiciones iniciales, iluminación o variaciones de la toalla.
- Riesgo de sobreajuste: la pérdida de validación sube tras la época 85 (de 0,0489 a 0,143), por lo que los checkpoints tardíos pueden degradar el rendimiento en el robot pese a la menor pérdida de entrenamiento.
- Dependencia de la pose inicial: el robot debe arrancar desde reposo con el torso en `[-0,6944, 1,5135, 0,8066]` rad, pose que no forma parte del estado de la política.
- Requisito de las tres cámaras: el cliente debe enviar `head_rgb`, `right_wrist_rgb` y `left_wrist_rgb`; la geometría de imagen (relleno a cuadrado y redimensionado a 256×256) debe coincidir con la del cliente del robot.
- Latencia superior al tick: una predicción tarda ~94 ms frente a los 66,7 ms del ciclo a 15 Hz; sin `--replan_every 8` el control en tiempo real no es viable.
- Carga insegura de checkpoints: usa `pickle_module=dill` con `weights_only=False`, lo que permite ejecución de código arbitrario al cargar archivos no confiables.
- Licencia MIT: permite uso comercial, pero no se ofrecen garantías ni soporte; el modelo está diseñado para investigación en una tarea concreta y no como producto de propósito general.
- Idiomas: no aplica; el modelo no procesa lenguaje y no puede usarse para tareas de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/at237299966/fm_dit_fold_towel
- Dataset de entrenamiento: https://huggingface.co/datasets/at237299966/r1lite_fold_towel
- Política ODE de comparación: https://huggingface.co/at237299966/ODE_policy_euler_sidehead_fold_towel
- Repositorio de código (ODE_Policy, rama `r1lite_exp`, commit `e9cc9c0`): no se proporciona URL en la información disponible
- Paper, blog o demo: no disponibles en la información proporcionada
