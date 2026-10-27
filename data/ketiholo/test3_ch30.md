# ketiholo/test3_ch30

## Resumen

`ketiholo/test3_ch30` es un checkpoint de política robótica entrenado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robots reales. No es un modelo de lenguaje: implementa ACT (Action Chunking with Transformers), un método de imitation learning que, en lugar de predecir una única acción por paso, predice un bloque («chunk») de acciones futuras a partir de observaciones visuales y propioceptivas. El modelo tiene 51.598.983 parámetros y se distribuye en formato safetensors con licencia Apache-2.0.

El checkpoint ha sido entrenado sobre el dataset `ketiholo/demo3`, presumiblemente capturas de teleoperación, y se publica como política lista para ejecutarse con los scripts `lerobot-train` y `lerobot-record`. Por el comando de evaluación de la model card (`--robot.type=so100_follower`), el hardware objetivo parece ser un brazo SO-100 (o compatible), aunque el autor no lo documenta explícitamente.

Su relevancia es acotada: se trata de un artefacto de pruebas (0 descargas, 0 likes, nombre «test3_ch30»), útil como ejemplo reproducible de un pipeline ACT completo y como baseline para experimentos de manipulación, pero sin model card detallada, sin métricas de éxito publicadas y sin documentación del dataset de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con componente CVAE, política ACT (predicción de chunks de acciones) |
| Parametros totales | 51.598.983 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el horizonte de observación y el tamaño del chunk de acciones son hiperparámetros no publicados) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; LeRobot usa fp32 por defecto en entrenamiento e inferencia) |
| Idiomas soportados | no aplica (política de control robótico, sin entrada ni salida de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria / pipeline | lerobot / robotics |
| Dataset de entrenamiento | ketiholo/demo3 |
| Entradas | observaciones visuales (imágenes de cámara) y estado propioceptivo del robot |
| Salidas | secuencia de acciones de control de las articulaciones |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion / actualizacion | 2026-10-27 (creado) / 2026-10-27 (actualizado) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers, Zhao et al., 2023) combina un backbone visual convolucional con un transformer encoder-decoder. El encoder procesa las observaciones (imágenes de las cámaras y el estado de las articulaciones) y el decoder genera un chunk de acciones futuras de forma autorregresiva. La formulación incluye un componente de autoencoder variacional condicional (CVAE) con una variable latente de estilo que se usa durante el entrenamiento para modelar la variabilidad de las demostraciones humanas y que se fija a la media en inferencia. El objetivo del «action chunking» es reducir el error de composición que aparece al predecir acciones paso a paso y suavizar la política resultante.

El entrenamiento es de aprendizaje por imitación supervisado sobre trayectorias de teleoperación: el modelo aprende a reproducir las acciones del operador dado el par (observación, estado). No hay información publicada sobre el número de episodios, la composición del dataset `ketiholo/demo3`, el número de cámaras, la frecuencia de control, el tamaño del chunk, ni sobre si se aplicaron técnicas de aumento de datos o regularización específicas. Tampoco se documenta ninguna innovación adicional más allá del método ACT original referenciado en el paper.

## Capacidades

- Manipulación robótica por imitación: genera comandos de articulaciones para tareas de pick-and-place, apilado, inserción y otras habilidades presentes en el dataset de entrenamiento.
- Predicción de chunks de acciones: emite secuencias de acciones en lugar de pasos aislados, lo que reduce el ruido y mejora la cohesión temporal del movimiento (característica del método ACT, no un extra de este checkpoint).
- Fusión multimodal: combina entradas visuales de una o varias cámaras con el estado propioceptivo del robot.
- Control reactivo a la configuración actual: la política condiciona la acción al estado y a la imagen, por lo que corrige desviaciones dentro de los límites del entrenamiento.
- Compatibilidad con el ecosistema LeRobot: carga con `--policy.path` en `lerobot-record`, se reentrena con `lerobot-train --policy.type=act` y se registra en Weights & Biases.
- Sin capacidades de texto: no hay generación de lenguaje, tool calling, agentes, razonamiento multi-paso simbólico ni comprensión multilingüe. Cualquier uso que requiera instrucciones en lenguaje natural exige un modelo adicional (por ejemplo, una política tipo VLA).

## Casos de uso

- Automatización de un brazo SO-100 en tareas repetitivas: cargar el checkpoint con `lerobot-record --policy.path=ketiholo/test3_ch30` sobre un `so100_follower` y ejecutar las habilidades aprendidas en `demo3` para tareas de recogida y colocación en un puesto de laboratorio o línea de montaje ligera.
- Baseline de comparación en investigación: usar este ACT de 51,6 M de parámetros como referencia frente a políticas más recientes (Diffusion Policy, VQ-BeT, SmolVLA) en el mismo conjunto de episodios de evaluación, controlando la variable de método.
- Punto de partida para fine-tuning con datos propios: reentrenar con `lerobot-train` sobre un dataset local de teleoperación para adaptar la política a un robot o una tarea distinta, aprovechando que la arquitectura ACT converge con pocas horas de demostraciones.
- Docencia y formación en imitation learning: ejemplo mínimo y ejecutable de un pipeline completo (dataset, entrenamiento, evaluación con `lerobot-record`) que cabe en un portátil con GPU consumer, adecuado para prácticas de robótica.
- Prototipado rápido de demos: al pesar ~0,2 GB, el checkpoint se descarga y despliega en minutos sobre hardware de bajo coste para validar una celda robótica antes de invertir en un modelo mayor.
- Pruebas de integración y CI del stack LeRobot: servir como artefacto de prueba para verificar que la carga de políticas, el formateo de observaciones y el bucle de control funcionan tras cambios en la librería.
- Generación de trayectorias sintéticas para análisis cinemático: registrar rollouts con la política y analizar la suavidad y la distribución de acciones como aproximación a las demostraciones originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasa de éxito, número de episodios de evaluación, ni comparaciones con otras políticas. Tampoco se documentan métricas de error de acción (MSE/L1) en validación ni curvas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB incluyendo pesos (≈206 MB en fp32, ≈103 MB en fp16) y activaciones del backbone visual; el dato exacto de memoria pico no está publicado.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090). Una A100 o H100 resulta innecesaria para este tamaño; su uso solo se justifica si se entrena con batches grandes o se paralelizan muchos entornos.
- Cabe en GPU consumer: sí, en cualquier tarjeta con 4 GB o más de VRAM; también es viable en CPU e incluso en placas embebidas tipo Jetson Orin, aunque el rendimiento en estos entornos no está verificado en la información disponible.
- Opciones de despliegue: scripts de LeRobot (`lerobot-record`, `lerobot-train`), PyTorch como backend. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no hay mediciones publicadas para este checkpoint. El tamaño de 51,6 M de parámetros y el esquema de action chunking sugieren bucles de control en tiempo real en GPU consumer, pero la frecuencia alcanzable depende de la resolución de las cámaras, del número de imágenes de entrada y del tamaño de chunk, parámetros no documentados aquí.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| ACT (ketiholo/test3_ch30) | Transformer + CVAE con action chunking | 51.598.983 | apache-2.0 | Hugging Face, vía LeRobot |
| Diffusion Policy (LeRobot) | Política generativa por difusión de acciones | no disponible | no verificada en esta búsqueda | Implementación en LeRobot; checkpoints comunitarios en el Hub |
| SmolVLA (Hugging Face) | Política visión-lenguaje-acción, permite instrucciones en lenguaje natural | no verificado en esta búsqueda (documentación pública lo sitúa en el orden de cientos de millones) | no verificada en esta búsqueda | Ecosistema LeRobot / Hub |
| VQ-BeT (LeRobot) | Cuantización vectorial de comportamiento con transformer | no disponible | no verificada en esta búsqueda | Implementación en LeRobot |

Los datos de las alternativas no proceden de la información proporcionada para este modelo y no han sido verificados aquí; se incluyen solo como orientación de categoría. Las diferencias relevantes frente a este checkpoint son la necesidad (o no) de instrucciones en lenguaje natural, el coste computacional del muestreo y el número de parámetros.

## Limitaciones y advertencias

- Especialización extrema al embodiment y al dataset: la política solo reproduce habilidades presentes en `ketiholo/demo3` sobre una configuración de robot concreta (probablemente SO-100). Fuera de esa cinemática, de esa disposición de cámaras o de esa iluminación, el rendimiento se degrada sin aviso.
- Model card incompleta y genérica: es la plantilla por defecto de LeRobot, sin descripción de tareas, número de episodios, frecuencia de control, resolución de imagen ni métricas de éxito. Evaluar el modelo requiere ejecutarlo.
- Nombre y metadatos de artefacto de prueba: «test3_ch30», 0 descargas y 0 likes, fechas de creación y actualización separadas por 19 segundos. No hay indicios de validación por terceros ni de uso en producción.
- Riesgo de sobreajuste: en aprendizaje por imitación con datasets pequeños, la política memoriza las trayectorias de demostración y falla ante perturbaciones (objetos desplazados, oclusiones, cambios de fondo) sin mecanismos de recuperación explícitos.
- Ausencia de comprensión semántica: no interpreta lenguaje, no razona sobre objetos ni sigue instrucciones. Cualquier comportamiento «inteligente» observado proviene de correlaciones visión-acción aprendidas.
- Sesgos: los derivados del operador humano que generó las demostraciones (velocidad, estilo, posibles asimetrías) y de las condiciones físicas del entorno de grabación.
- Licencia Apache-2.0: permite uso comercial y modificación con obligación de conservar avisos y el texto de la licencia; no hay garantías ni cláusulas de responsabilidad por daños físicos. Verificar la licencia del dataset `ketiholo/demo3`, que puede ser distinta.
- Seguridad física: en un robot real, una política sin validación puede generar acciones fuera de rango. Es imprescindible aplicar límites de par, paradas de emergencia y supervisión humana durante la puesta en marcha.
- Fechas de metadatos en 2026: conviene confirmar la procedencia y vigencia del repositorio antes de integrarlo en cualquier pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ketiholo/test3_ch30
- Dataset de entrenamiento: https://huggingface.co/datasets/ketiholo/demo3
- Perfil del autor: https://huggingface.co/ketiholo
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
