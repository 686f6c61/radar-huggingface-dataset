# hums1207/act_policy_L4_20000

## Resumen

`hums1207/act_policy_L4_20000` es una política de imitación para robótica basada en el método Action Chunking with Transformers (ACT), publicado originalmente en el artículo arXiv 2304.13705. El modelo ha sido entrenado y publicado con la librería LeRobot de Hugging Face por el usuario `hums1207`, y su propósito es controlar un robot seguidor de tipo SO-102 (etiquetado como `so102_follower`) mediante la predicción de secuencias cortas de acciones (chunks) a partir de observaciones visuales y propioceptivas.

El modelo resuelve una tarea concreta de manipulación: `rerobot_picking`. Consume como entrada el estado del robot (vector de 7 dimensiones) y una imagen de una cámara de muñeca (`cam_wrist`, 3x480x640), y produce como salida un vector de acción de 7 dimensiones. Se entrenó durante 20 000 pasos con un tamaño de lote de 16 sobre un conjunto de datos de 45 episodios y 50 933 fotogramas grabados a 30 FPS.

Es relevante porque ejemplifica el flujo completo de entrenamiento de políticas de imitación con LeRobot 0.6.0 y ofrece un punto de partida reproducible para quien quiera replicar o adaptar un pipeline de aprendizaje por imitación en un robot de bajo coste. No obstante, se trata de un modelo muy especializado, sin resultados de evaluación publicados y con un conjunto de datos de entrenamiento pequeño, por lo que su uso en producción debe considerarse experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación basada en transformer |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control; no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice un chunk de acciones futuras de forma conjunta. La arquitectura combina un codificador visual (procesa la imagen de la cámara de muñeca), un codificador del estado propioceptivo y un transformer que genera la secuencia de acciones. Esta formulación reduce el error de composición típico de las políticas paso a paso y suele mejorar la tasa de éxito en tareas de manipulación. El modelo tiene 51,67 millones de parámetros y un tamaño de repositorio de 0,2 GB.

El entrenamiento se realizó con LeRobot 0.6.0 durante 20 000 pasos, con batch size de 16, optimizador AdamW, learning rate de 1e-5 y semilla 1000. El conjunto de datos `hums1207/phsyical_AI_20261121_162707` contiene 45 episodios y 50 933 fotogramas a 30 FPS para la tarea `rerobot_picking`. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de aprendizaje supervisado por imitación a partir de demostraciones teleoperadas. No se especifica el número de tokens ni la composición detallada del dataset más allá de los episodios y fotogramas indicados.

## Capacidades

- Control robótico de manipulación: genera vectores de acción de 7 dimensiones para un robot SO-102 seguidor.
- Percepción visual: procesa imágenes de una cámara de muñeca a resolución 480x640 con 3 canales.
- Fusión de estado propioceptivo y visión: integra un vector de estado de 7 dimensiones con la observación visual.
- Predicción de chunks de acciones: emite secuencias cortas de acciones en lugar de pasos individuales.
- Ejecución de la tarea `rerobot_picking` (recogida de objetos) en el robot para el que fue entrenado.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control motor.

## Casos de uso

- Recogida automatizada de objetos en un banco de pruebas: el modelo ejecuta la tarea `rerobot_picking` sobre un SO-102, adecuado para validar pipelines de imitación en laboratorio con 45 episodios de demostración.
- Réplica de experimentos de aprendizaje por imitación: sirve como referencia reproducible del flujo `lerobot-train` y `lerobot-rollout` con ACT y LeRobot 0.6.0.
- Base para fine-tuning con datos propios: partiendo de estos pesos, se puede reentrenar con un dataset mayor del mismo robot y tarea para mejorar la robustez.
- Docencia y formación en robótica: ejemplo completo de política visuomotora de 51,67 M de parámetros que cabe en GPU de consumo y permite ilustrar el ciclo datos-entrenamiento-despliegue.
- Pruebas de integración de hardware: validar la calibración del robot SO-102, la cámara de muñeca y el bucle de control a 30 FPS antes de escalar a tareas más complejas.
- Benchmark interno de infraestructura de inferencia robótica: medir latencia y throughput del pipeline LeRobot con una política pequeña antes de migrar a modelos mayores.
- Prototipado de automatización de picking en entornos controlados: útil como prueba de concepto, aunque limitado por el tamaño reducido del dataset y la ausencia de evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,67 M de parámetros en safetensors (0,2 GB de repositorio), la inferencia en FP32 requeriría del orden de 0,2 GB de pesos más memoria para activaciones y el codificador visual, por lo que es holgadamente ejecutable en GPU de consumo.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con 4 GB o más de VRAM, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de CUDA mediante `--policy.device=cuda` en entrenamiento. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. El bucle de control opera a 30 FPS según la frecuencia del dataset, pero no se publican mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hums1207/act_policy_L4_20000` | 51,67 M | no aplica | `rerobot_picking` (SO-102) | apache-2.0 | Hugging Face |
| ACT original (paper 2304.13705) | no disponible en la información | no aplica | Manipulación genérica (ALOHA) | según implementación | Paper y código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | no disponible en la información | no aplica | Manipulación genérica | según modelo | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay tasa de éxito medida en robot real, lo que impide estimar su fiabilidad.
- Dataset de entrenamiento muy pequeño: 45 episodios y 50 933 fotogramas para una única tarea, lo que limita la generalización a posiciones, iluminación u objetos distintos.
- Especialización extrema: solo se ha entrenado para la tarea `rerobot_picking` y el robot `so102_follower` con una cámara `cam_wrist`; no es reutilizable directamente en otros robots o configuraciones.
- Dependencia de la configuración de hardware: los nombres de cámara y el puerto del robot deben coincidir con las claves de observación del entrenamiento.
- Riesgo de sobreajuste y de fallo ante distribuciones de entrada no vistas (nuevos objetos, distracciones, cambios de iluminación).
- Sin información sobre sesgos: al no ser un modelo lingüístico, no aplican sesgos de lenguaje, pero sí posibles sesgos de recogida de datos (posiciones, objetos y entorno del operador).
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- No apto para producción sin validación previa en el robot objetivo y con un protocolo de evaluación repetido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hums1207/act_policy_L4_20000
- Dataset de entrenamiento: https://huggingface.co/datasets/hums1207/phsyical_AI_20261121_162707
- Artículo ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de aprendizaje por imitación: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hums1207/phsyical_AI_20261121_162707
