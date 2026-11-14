# AdrianAo/act_block_sorting_2026-11-13_10-23-58

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos de acciones (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, `AdrianAo/act_block_sorting_2026-11-13_10-23-58`, es una política entrenada con LeRobot sobre el robot `so_follower` (SO-100/SO-101) para una tarea específica de clasificación de bloques por color.

El modelo resuelve una única tarea de manipulación: recoger 3 bloques amarillos, 1 rojo y 6 azules y depositarlos en una caja negra. Se alimenta de dos cámaras (vista superior y vista de muñeca) a 480x640 y del estado articular de 6 dimensiones, y emite comandos de acción de 6 dimensiones. Con 51.668.614 parámetros, es un modelo compacto diseñado para inferencia en tiempo real en hardware de consumo.

Su relevancia es práctica: demuestra el flujo completo de LeRobot para clonación de comportamiento en robots de bajo coste, con licencia Apache 2.0 y pesos en safetensors, lo que facilita su reproducción y despliegue en laboratorios y proyectos de robótica open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje; ventana temporal definida por la configuración de ACT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no aplica; entradas visuales y de estado, instrucción de tarea en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer de aprendizaje por imitación que combina un codificador visual (procesa las dos cámaras de 3x480x640), un codificador del estado articular (6 dimensiones) y un decodificador que genera un *chunk* de acciones futuras de forma autorregresiva con consultas fijas. La predicción por fragmentos, en lugar de paso a paso, es la innovación central del método: reduce el horizonte efectivo de error y suaviza la política en tareas de contacto. La política está condicionada por una instrucción de tarea en lenguaje natural.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `AdrianAo/block_sorting`: 75 episodios, 115.024 fotogramas a 30 FPS de teleoperación. Se ejecutaron 10.000 pasos con batch size 10, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni refinamiento posterior; es aprendizaje supervisado puro a partir de demostraciones. La model card no especifica el número de tokens ni la composición detallada del dataset más allá de la tarea y las métricas de episodios y fotogramas.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para el robot `so_follower`.
- Percepción visual multi-cámara: procesa simultáneamente vista superior (`top`) y vista de muñeca (`wrist`) a 480x640.
- Condicionamiento por instrucción de tarea en lenguaje natural (la frase de la tarea de clasificación de bloques).
- Aprendizaje por imitación a partir de teleoperación, sin necesidad de recompensas ni entorno simulado.
- Predicción de fragmentos de acción para ejecución estable en tiempo real.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, generación de texto libre, visión general, audio ni modo *thinking*. Es una política especializada, no un modelo fundacional.

## Casos de uso

- Clasificación de bloques por color en línea de montaje: la política ejecuta la secuencia de recogida y depósito de 10 bloques en la caja negra, adecuada para demostrar *pick-and-place* multi-objeto con un solo modelo.
- Banco de pruebas de LeRobot: sirve como referencia reproducible del flujo `lerobot-train` y `lerobot-rollout` para validar instalaciones, calibración de cámaras y puertos del robot antes de entrenar políticas propias.
- Base para *fine-tuning* en tareas de clasificación: al estar entrenada en una tarea de ordenación, puede adaptarse con pocos episodios adicionales a variantes (otros colores, otras cajas) reutilizando los pesos.
- Docencia e investigación en imitación: ejemplo compacto (51,7 M de parámetros) para estudiar el efecto del *action chunking* frente a políticas paso a paso.
- Evaluación de robustez visual: permite medir cómo afectan cambios de iluminación, posición de objetos o distractores a una política ACT entrenada con 75 episodios.
- Prototipado de automatización de bajo coste: despliegue en robots SO-100/SO-101 con GPU de consumo para demostraciones en ferias, laboratorios o aulas.
- Replicación de experimentos: al publicarse dataset, configuración y pesos, permite reproducir el entrenamiento y comparar variantes de hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: *"No evaluation results have been provided for this policy yet."* No existen tablas de éxito por tarea, comparativas con otras políticas ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,7 M de parámetros; en FP32 ocupa aproximadamente 0,2 GB de pesos, y en FP16 alrededor de 0,1 GB. El grueso del consumo proviene del procesamiento de dos imágenes de 480x640 y del *backbone* visual, no de los pesos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente; se ha entrenado y ejecutado con `--policy.device=cuda`, por lo que se asume una GPU NVIDIA.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs integradas o CPU para inferencia, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de PyTorch y safetensors. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, lo que sugiere que la política debe ejecutarse al menos a esa frecuencia para un control fluido, pero no se publican mediciones reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT block_sorting (este) | 51,7 M | 2 cámaras 480x640 + estado (6,) | Clasificación de bloques en SO-100 | apache-2.0 | Hugging Face, 24 descargas |
| ACT original (paper 2304.13705) | no disponible en la informacion | Configurable por tarea | Manipulación genérica por imitación | no disponible | Paper y código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | no disponible | Configurables | Manipulación por imitación | habitualmente Apache/MIT | Ecosistema LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a arquitectura, entradas y licencia.

## Limitaciones y advertencias

- Especialización extrema: la política solo ejecuta la tarea "Pick up 3 yellow blocks, 1 red block and 6 blue blocks and place them into the black box"; fuera de ese dominio su comportamiento no está garantizado.
- Sin evaluación publicada: no hay tasa de éxito medida, por lo que no puede afirmarse su fiabilidad en producción.
- Dependencia del hardware: entrenada para `so_follower` con cámaras `top` y `wrist`; cambios de robot, montaje o calibración de cámaras degradan el rendimiento.
- Dataset pequeño: 75 episodios y 115.024 fotogramas son una base limitada; probable sobreajuste a posiciones, iluminación y apariencia concretas.
- Sin capacidades lingüísticas ni de razonamiento: no debe usarse como modelo de texto, código o visión general.
- Riesgo de alucinación en el sentido de acciones no válidas: al ser una política de imitación, puede generar comandos fuera del espacio de acciones seguras ante entradas fuera de distribución; requiere límites de seguridad en el robot.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Idiomas: la instrucción de tarea está en inglés; no se documenta soporte multilingüe.
- Sin cuantizaciones publicadas: el despliegue en hardware muy limitado requiere convertir los pesos manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdrianAo/act_block_sorting_2026-11-13_10-23-58
- Dataset de entrenamiento: https://huggingface.co/datasets/AdrianAo/block_sorting
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=AdrianAo/block_sorting
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
