# mobilab-udesc/UnitreeG1-CubePickAndPlace-ACT-80K

## Resumen

UnitreeG1-CubePickAndPlace-ACT-80K es un modelo de política de robótica (policy) entrenado mediante imitación con la arquitectura ACT (Action Chunking Transformer) para la tarea de recoger y colocar un cubo con el robot humanoide Unitree G1. Lo publica el grupo mobilab-udesc en Hugging Face y se distribuye en formato safetensors con 51.687.055 parámetros (aproximadamente 51,7 millones), lo que lo sitúa en el rango de los modelos ligeros de control robótico.

El modelo resuelve una tarea concreta y acotada: dado un flujo de observaciones visuales y propioceptivas del robot, predice secuencias de acciones articulares (chunks) para completar la manipulación del cubo. La nomenclatura "80K" sugiere 80.000 pasos de entrenamiento, aunque este dato no está confirmado en la información disponible.

Su relevancia radica en que ejemplifica el flujo actual de entrenamiento de políticas robóticas end-to-end con arquitecturas tipo transformer, replicable por laboratorios con recursos modestos. El tamaño del repositorio (0,2 GB) y el número de parámetros indican que la inferencia puede ejecutarse en hardware de consumo, lo que facilita su evaluación y despliegue en entornos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), según nomenclatura del modelo; detalles no disponibles |
| Parametros totales | 51.687.055 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (modelo de control robótico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | Pick and place de un cubo con robot Unitree G1 |
| Pasos de entrenamiento | 80.000 (inferido del nombre, no confirmado) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde a ACT (Action Chunking Transformer), un enfoque de imitación que predice bloques de acciones futuras en lugar de acciones individuales, reduciendo el error de acumulación y mejorando la estabilidad del control. El modelo está diseñado para el robot humanoide Unitree G1 y la tarea específica de recoger y colocar un cubo, lo que implica entradas visuales (cámaras del robot) y propioceptivas (estado articular), y salidas de comandos de articulaciones.

No se dispone de información detallada sobre el conjunto de datos de entrenamiento (número de demostraciones, composición, resolución de imágenes, frecuencia de control), ni sobre si se aplicaron técnicas de aumento de datos, regularización o ajuste fino posterior. El sufijo "80K" en el nombre sugiere 80.000 pasos de entrenamiento, pero este dato no está verificado en la información proporcionada.

## Capacidades

- Control robótico de manipulación: genera secuencias de acciones articulares para completar la tarea de pick and place de un cubo con el Unitree G1.
- Predicción de chunks de acciones: la arquitectura ACT permite predecir múltiples pasos de acción de forma coherente.
- Integración multimodal: procesa observaciones visuales y estado propioceptivo del robot (según la arquitectura ACT estándar).
- Ejecución en tiempo real: el tamaño reducido (51,7 M de parámetros) permite inferencia de baja latencia en hardware modesto.
- No se dispone de información sobre soporte de tool calling, agentes, multilingüismo ni modos de razonamiento, al tratarse de un modelo de control motor y no de lenguaje.

## Casos de uso

- Investigación en imitación robótica: servir como política de referencia para comparar variantes de ACT, cambios en el dataset o estrategias de aumento de datos en tareas de manipulación con humanoides.
- Despliegue en el Unitree G1 para automatizar la tarea de pick and place en entornos de laboratorio, con la ventaja de que el modelo está específicamente entrenado para esa plataforma.
- Base para fine-tuning en tareas similares: al ser un modelo pequeño y en safetensors, puede ajustarse con pocas demostraciones para variantes como colocar el cubo en una posición distinta o con objetos de geometría similar.
- Evaluación de pipelines de control: integrarse en frameworks de robótica (por ejemplo, LeRobot o ROS 2) para validar latencias, tasas de éxito y robustez frente a cambios de iluminación.
- Docencia y prototipado: su tamaño (0,2 GB) permite ejecutarlo en estaciones de trabajo con GPU de consumo, facilitando prácticas de aprendizaje por imitación.
- Pruebas de simulación a realidad: validar la política en simuladores (MuJoCo, Isaac Sim) antes de transferirla al robot físico, aprovechando que el modelo es ligero y rápido de iterar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 0,2 GB de pesos (51,7 M × 4 bytes); en FP16, alrededor de 0,1 GB. Con overhead de activaciones y cámaras, se estima un uso total inferior a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se sugiere NVIDIA RTX 3060, RTX 4090, A100 o H100 para mayor margen y throughput.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna (GTX 1650, RTX 3050, etc.) e incluso en CPU para inferencia de baja frecuencia.
- Opciones de despliegue: PyTorch nativo (carga de safetensors), ONNX Runtime, TensorRT para optimización, y frameworks de robótica como LeRobot o ROS 2 con nodos de inferencia.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la frecuencia de control del robot (típicamente 10-50 Hz en políticas ACT).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UnitreeG1-CubePickAndPlace-ACT-80K | 51,7 M | no disponible | Pick and place con Unitree G1 | no disponible | Hugging Face |
| ACT original (Zhao et al., 2023) | ~80 M (según configuración) | no aplica | Manipulación bimanual (ALOHA) | MIT (código) | GitHub |
| Diffusion Policy (Chi et al., 2023) | ~100 M (según configuración) | no aplica | Manipulación visual | MIT (código) | GitHub |
| RT-1 (Google, 2022) | ~35 M | no aplica | Manipulación multi-tarea | no disponible | No público |

La comparativa se basa en información pública de los modelos citados; los datos de parámetros y licencias de las alternativas pueden variar según la configuración. No se dispone de benchmarks comparativos directos para este modelo.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para la tarea de pick and place de un cubo con el Unitree G1; no generaliza a otros objetos, posiciones o robots sin reentrenamiento.
- Sin información sobre sesgos: no se dispone de análisis de sesgos, robustez frente a cambios de iluminación, oclusiones o variaciones del entorno.
- Riesgo de alucinación motora: como toda política de imitación, puede generar acciones fuera de distribución ante observaciones no vistas, con riesgo de colisiones o movimientos inseguros.
- Licencia no especificada: la ausencia de licencia explícita impide confirmar si se permite uso comercial; se recomienda contactar con el autor antes de cualquier despliegue productivo.
- Contexto y idiomas no aplicables: al ser un modelo de control, no procesa lenguaje natural ni tiene ventana de contexto textual.
- Dependencia del hardware: el rendimiento real depende de la calibración del robot, la cámara y la frecuencia de control; no se han publicado métricas de tasa de éxito.
- Repositorio con 0 descargas y 1 like: no hay evidencia de validación por parte de la comunidad, por lo que la reproducibilidad no está contrastada.

## Enlaces

- Hugging Face: https://huggingface.co/mobilab-udesc/UnitreeG1-CubePickAndPlace-ACT-80K
- Paper original de ACT (Action Chunking Transformer): https://arxiv.org/abs/2304.13705
- Repositorio oficial de ACT: https://github.com/tonyzhaozh/act
- Unitree G1 (página del fabricante): https://www.unitree.com/g1
- LeRobot (framework de políticas robóticas): https://github.com/huggingface/lerobot
