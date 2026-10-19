# Saurabh-sinha-209/so101_hl-diffusion

## Resumen

`so101_hl-diffusion` es una política de control visuomotor entrenada con el algoritmo Diffusion Policy sobre el robot `so101_follower` (brazo SO-101 de bajo coste) y publicada en el Hub por el usuario Saurabh-sinha-209 mediante LeRobot 0.6.0. No es un modelo de lenguaje: es un policy de imitación que recibe el estado articular del robot (vector de 6 dimensiones) y dos cámaras (`bench` y `wrist`, 3×240×320 píxeles cada una) y genera una acción de 6 dimensiones por paso de control. Diffusion Policy trata el control como un proceso generativo: en lugar de regresar una acción única, muestrea trayectorias de acción multimodales y suaves, lo que mejora el rendimiento en manipulación con contacto rico.

El modelo tiene 89.243.910 parámetros (unos 89,2 M) y se distribuye en `safetensors` con licencia Apache-2.0. El repositorio ocupa 6,4 GB, muy por encima de los ~0,36 GB que ocuparían los pesos en fp32, lo que indica que incluye checkpoints intermedios y posiblemente estados del optimizador. Se entrenó durante 30.000 pasos con batch 32, Adam y learning rate 1e-4 sobre un dataset propio de 27 episodios y 27.332 fotogramas a 30 FPS (unos 15 minutos de demostraciones humanas repartidas en 22 variantes de la tarea "coger objeto y colocarlo en bandeja/cubo").

Su relevancia es acotada pero clara: sirve como referencia reproducible de un pipeline completo de aprendizaje por imitación (grabación con LeRobot, entrenamiento de Diffusion Policy, despliegue con `lerobot-rollout`) para quien trabaja con brazos SO-101. Es un modelo de nicho, sin descargas ni validación comunitaria, y sin resultados de evaluación publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política visuomotor generativa por difusión); backbone concreto no especificado en la model card |
| Parámetros totales | 89.243.910 (~89,2 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje); horizonte de predicción de acciones no disponible |
| Tipos de cuantización | No disponible; pesos publicados en `safetensors` sin variantes cuantizadas |
| Idiomas soportados | No disponible / no aplica (las instrucciones de tarea son cadenas en inglés, pero el modelo no procesa lenguaje de forma general) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (repositorio de 6,4 GB, incluye checkpoints) |
| Tipo de robot | `so101_follower` |
| Cámaras de entrada | `bench`, `wrist` (3×240×320 cada una) |
| Entrada de estado | `observation.state`, shape `(6,)` |
| Salida | `action`, shape `(6,)` |
| Librería | LeRobot 0.6.0 |
| Pipeline | `robotics` |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy (paper arXiv:2303.04137), un esquema en el que la política aprende a invertir un proceso de difusión para generar secuencias de acciones. En inferencia, la política parte de ruido y aplica pasos de denoising condicionados por las observaciones (estado articular más dos imágenes), produciendo una trayectoria de acción multimodal y temporalmente coherente. Este diseño evita el problema de promediado en acciones multimodales que afecta a los regresores directos y suele mejorar la precisión en tareas de contacto. La model card no detalla el backbone visual ni el número de pasos de difusión empleados en entrenamiento o inferencia.

El entrenamiento se realizó con el dataset `Saurabh-sinha-209/so101_hl`: 27 episodios, 27.332 fotogramas a 30 FPS (aproximadamente 15 minutos de demostraciones), repartidos en 22 variantes de tarea de tipo *pick-and-place* (objetos como marcador rosa, pieza verde de plástico, tubo blanco, lata roja, bola verde con púas, tapón azul) con tres destinos posibles: cubo blanco, bandeja blanca y bandeja de espuma blanca. La configuración declarada es de 30.000 pasos, batch 32, optimizador Adam, learning rate 0,0001 y semilla 1000. No se documenta composición adicional del dataset, aumentos de datos, ni uso de RLHF/DPO (no aplicables en este tipo de política).

## Capacidades

- Manipulación visuomotora: genera comandos de 6 dimensiones para el brazo SO-101 a partir de estado articular y dos vistas de cámara.
- Ejecución de instrucciones de tarea en inglés dadas como cadena (`--task="pick up the ... and place it in the ..."`), usadas como condicionamiento de la política.
- Tareas de *pick-and-place* sobre objetos pequeños y destinos fijos (cubo, bandeja, bandeja de espuma).
- Generación de trayectorias de acción suaves y multimodales gracias al proceso de difusión, adecuado para manipulación con contacto.
- Funcionamiento en bucle cerrado a la frecuencia de control del robot (datos grabados a 30 FPS).
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento o *fine-tuning*.
- No soporta *tool calling*, razonamiento multi-paso simbólico, ni capacidades multilingües, de visión general o de audio.

## Casos de uso

- **Automatización de pick-and-place en laboratorio:** el política puede ejecutar las 22 variantes de tarea aprendidas sobre el brazo SO-101 con las cámaras `bench` y `wrist` montadas en la configuración original, útil para montajes de investigación reproducibles.
- **Referencia reproducible de aprendizaje por imitación:** sirve como punto de partida documentado (dataset, hiperparámetros, versión de LeRobot) para comparar Diffusion Policy frente a otros métodos de imitación en el mismo hardware.
- **Prototipado rápido de una celda robótica de bajo coste:** con 89,2 M de parámetros y pesos de ~0,36 GB en fp32, el modelo se puede servir en una GPU de consumo o en un dispositivo embebido, lo que permite validar una celda de clasificación de objetos en horas en lugar de semanas.
- **Base para *fine-tuning* con objetos nuevos:** al estar entrenado sobre 22 variantes de una misma familia de tareas, es un candidato razonable para reentrenar con un dataset propio de pocas decenas de episodios usando `lerobot-train --policy.type=diffusion`.
- **Docencia y formación en robótica de imitación:** el flujo completo (grabar con LeRobot, entrenar 30.000 pasos, desplegar con `lerobot-rollout` y `--duration`) es un ejercicio cerrado y ejecutable en un curso práctico.
- **Validación de hardware y calibración del SO-101:** ejecutar la política sobre el robot real permite detectar problemas de calibración, latencia de cámaras o desalineación de la pinza, ya que el modelo es sensible a la correspondencia exacta entre nombres de cámara y claves de observación.
- **Generación de datos de demostración para otras políticas:** las ejecuciones del modelo pueden grabarse como episodios nuevos y emplearse para comparar políticas o para aumentar el dataset original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card está vacía: incluye únicamente una plantilla comentada con el formato de tabla (tarea, número de ensayos, éxitos, tasa de éxito) y no contiene ningún dato real de éxito en robot. Tampoco se proporcionan métricas de pérdida de entrenamiento ni comparaciones con otras políticas.

## Requisitos de hardware

- **VRAM estimada para inferencia:** el checkpoint son ~89,2 M de parámetros, es decir, unos 0,36 GB en fp32 y ~0,18 GB en fp16/bf16. Con activaciones de dos imágenes de 240×320 y un batch de 1, la inferencia debería caber holgadamente por debajo de 2 GB de VRAM (estimación, no verificada en la información disponible).
- **GPU recomendadas:** cualquier GPU con soporte CUDA de gama media es suficiente; para despliegue en laboratorio, una RTX 3060/4060 o superior. Para cómputo en borde, una Jetson Orin Nano/Orin NX es una opción plausible, aunque la latencia real no está documentada.
- **GPU de datacenter:** no necesarias para inferencia; para reentrenar con 30.000 pasos y batch 32, una A100/H100 acorta el ciclo, pero una GPU de consumo moderna es viable.
- **¿Cabe en GPU de consumo?** Sí, con gran margen: el cuello de botella no es la memoria sino la latencia del bucle de difusión, que debe sostener el ritmo de control.
- **Opciones de despliegue:** `lerobot-rollout` con `--strategy.type=base` (despliegue sin grabación) y `lerobot-train` para reentrenamiento. vLLM, TGI, llama.cpp u Ollama no aplican: no es un modelo de lenguaje.
- **Latencia y throughput:** no disponibles. Como referencia de diseño, los datos se grabaron a 30 FPS, de modo que el bucle de inferencia más el envío de comandos debería mantenerse por debajo de 33 ms por paso; el número de pasos de denoising configurado no se especifica.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `so101_hl-diffusion` (este modelo) | Diffusion Policy para SO-101 | 89,2 M | Estado (6,) + 2 imágenes 3×240×320 | Apache-2.0 | Hugging Face, 0 descargas |
| Diffusion Policy original (paper 2303.04137) | Política de difusión para manipulación | No disponible en la información proporcionada | Depende de la implementación | No disponible | Implementaciones públicas (referencia del paper) |
| ACT / Action Chunking Transformer en LeRobot | Transformer de imitación con *action chunking* | Depende de la configuración (decenas de millones) | Estado + imágenes | Apache-2.0 (ecosistema LeRobot) | Disponible en LeRobot |
| SmolVLA (`lerobot/smolvla_base`) | VLA de imitación con encoder de lenguaje | ~450 M | Estado + imágenes + instrucción en lenguaje natural | Apache-2.0 | Disponible en Hugging Face |
| pi0 (`lerobot/pi0`) | VLA de propósito general | ~3.300 M | Estado + imágenes + instrucción | Apache-2.0 | Disponible en Hugging Face |

Nota: los datos de los modelos comparativos son de conocimiento general y no proceden de la información proporcionada; conviene verificarlos en sus respectivas model cards. La comparación relevante aquí es que este modelo es una política específica de una única encarnación (SO-101) y de un único dataset, frente a los VLA, que generalizan a múltiples robots y aceptan instrucciones en lenguaje natural a cambio de uno o dos órdenes de magnitud más de parámetros.

## Limitaciones y advertencias

- **Dataset muy reducido:** 27 episodios y ~15 minutos de demostraciones para 22 variantes de tarea implican muy pocas muestras por tarea (del orden de una o dos), con riesgo alto de sobreajuste y de generalización pobre a posiciones, iluminación u objetos nuevos.
- **Sin evaluación publicada:** no hay tasas de éxito en robot real; la sección de evaluación de la model card es una plantilla vacía. No hay evidencia cuantitativa de que la política funcione fuera del entorno de grabación.
- **Encarnación única:** entrenado exclusivamente para `so101_follower` con las cámaras `bench` y `wrist`. Cambiar la configuración de cámaras, sus nombres o su montaje invalida las observaciones esperadas por el modelo.
- **Dependencia de la instrucción de tarea:** las 22 tareas se condicionan con cadenas en inglés muy concretas; paráfrasis o traducciones pueden degradar el comportamiento, y el modelo no comprende lenguaje de forma general.
- **Riesgo de alucinación en sentido figurado:** no genera texto, pero puede producir trayectorias plausibles y erróneas ante distribuciones de entrada distintas de las vistas en entrenamiento (*distribution shift*), sin mecanismo de detección de fallo.
- **Sesgos de datos:** los objetos, colores y destinos son los del entorno de grabación; el modelo hereda cualquier sesgo posicional o de iluminación del dataset.
- **Sin validación comunitaria:** 0 descargas y 0 me gusta en el momento de la consulta; no hay informes independientes de funcionamiento.
- **Licencia:** Apache-2.0 permite uso comercial y modificación con atribución, pero el modelo incorpora pesos derivados de un dataset propio del autor; conviene revisar la licencia del dataset `so101_hl` antes de un uso comercial.
- **Tamaño del repositorio:** 6,4 GB frente a ~0,36 GB de pesos implica checkpoints intermedios; hay que seleccionar explícitamente el checkpoint final al desplegar.
- **Requisito de tiempo real:** el bucle de difusión debe sostener la frecuencia de control del robot; una latencia superior a la de los datos de entrenamiento puede degradar la ejecución aunque el modelo sea correcto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Saurabh-sinha-209/so101_hl-diffusion
- Dataset de entrenamiento: https://huggingface.co/datasets/Saurabh-sinha-209/so101_hl
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Saurabh-sinha-209/so101_hl
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y *rollout*: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos trataban sobre el nombre propio "Saurabh" y no aportan información técnica.
