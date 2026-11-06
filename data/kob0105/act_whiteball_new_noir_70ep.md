# kob0105/act_whiteball_new_NoIR_70ep

## Resumen

`kob0105/act_whiteball_new_NoIR_70ep` es una política de imitación basada en ACT (Action Chunking with Transformers) entrenada con LeRobot para una tarea robótica de manipulación concreta: recoger y colocar una bola blanca ("pick place white ball"). El modelo consume el estado articular del robot (6 dimensiones) y dos flujos de vídeo de 480x640 píxeles (cámara global y cámara en la palma), y produce comandos de acción de 6 dimensiones. No es un modelo de lenguaje: es un controlador visuomotor de extremo a extremo para un robot `so_follower` (configuración tipo SO-100/SO-101 de bajo coste).

ACT, presentado en el paper arXiv:2304.13705, propone predecir trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de composición y mejora la estabilidad en tareas de manipulación precisa. Esta implementación concreta ha sido entrenada durante 30.000 pasos con batch size 8 sobre un dataset de 70 episodios y 29.525 fotogramas a 30 FPS, todo registrado por teleoperación.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un pipeline completo de imitación con LeRobot (grabación de datos, entrenamiento y despliegue con `lerobot-rollout`) para quien quiera replicar la tarea o adaptar la receta a su propio robot. Con 51,7 millones de parámetros y 0,2 GB de pesos, se ejecuta en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana temporal definida por la configuración de ACT en LeRobot) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo visuomotor, sin entrada ni salida de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras | `global`, `palm` (480x640, 3 canales) |
| Entrada de estado | `observation.state` con forma `(6,)` |
| Salida de accion | `action` con forma `(6,)` |
| Dataset de entrenamiento | `kob0105/record_test_new_whiteball_paper_NoIR` (70 episodios, 29.525 fotogramas, 30 FPS) |
| Tarea | "pick place white ball" |
| Pasos de entrenamiento | 30.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.1 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un encoder visual (procesa las dos cámaras, `global` y `palm`) y un decodificador que predice un chunk de acciones futuras en lugar de una sola acción por paso. Esta predicción por trozos mitiga el problema de los errores acumulativos típicos de las políticas paso a paso y suaviza la trayectoria. La entrada de estado es un vector de 6 dimensiones (posiciones articulares del `so_follower`) y la salida es también de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.1 sobre 70 episodios teleoperados (29.525 fotogramas a 30 FPS) de la tarea "pick place white ball", durante 30.000 pasos con batch size 8, AdamW y learning rate 1e-5. No se documenta en la model card el uso de RLHF, DPO ni aumento de datos; tampoco se especifican detalles sobre la composición exacta de las escenas (posiciones de la bola, iluminación o distractores). El nombre del repositorio sugiere datos grabados sin filtro infrarrojo ("NoIR"), lo que puede condicionar la apariencia de las imágenes de entrenamiento.

## Capacidades

- Control visuomotor de extremo a extremo para un robot `so_follower` de 6 grados de libertad.
- Predicción de chunks de acción (varias acciones futuras por inferencia), lo que aporta estabilidad en la ejecución.
- Fusión de dos vistas de cámara: una global de escena y otra montada en la palma del robot.
- Ejecución de una única tarea especializada: recoger y colocar una bola blanca.
- No soporta tool calling, function calling ni razonamiento multi-paso simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No incorpora modo de razonamiento explícito, visión general, audio ni otras modalidades fuera de las dos cámaras y el estado articular.

## Casos de uso

- Replicación de la tarea "pick place white ball": desplegar la política con `lerobot-rollout` sobre un `so_follower` calibrado para reproducir el comportamiento aprendido, útil como banco de pruebas de un pipeline de imitación completo.
- Base para fine-tuning en tareas de pick-and-place similares: reentrenar con un dataset propio que mantenga la misma estructura de observaciones (estado de 6 dimensiones y dos cámaras) para adaptar la política a otros objetos o posiciones.
- Validación de hardware de bajo coste: comprobar el funcionamiento de un brazo SO-100/SO-101 con cámaras OpenCV a 30 FPS y verificar que la latencia de inferencia es compatible con el control en tiempo real.
- Docencia y formación en robótica de imitación: usar el par dataset-política como ejemplo didáctico de grabación teleoperada, entrenamiento con LeRobot y evaluación en robot real.
- Benchmark interno de despliegue: comparar el rendimiento de `lerobot-rollout` frente a otros backends de inferencia para políticas ACT en el mismo hardware.
- Prueba de robustez ante cambios de iluminación o cámara: evaluar cómo se degrada la política al variar las condiciones respecto a las del dataset "NoIR", como paso previo a decisiones de aumento de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación de la política (ni tasa de éxito ni número de ensayos en robot real).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 millones de parámetros y pesos en safetensors, el modelo ocupa del orden de 0,2 GB, por lo que cualquier GPU con 2 GB o más es suficiente.
- GPU recomendadas: no se especifican en la documentación; por tamaño, una RTX 3060, RTX 4060 o superior es más que suficiente. Una GPU integrada podría bastar, aunque no hay datos confirmados.
- Cabe en GPU de consumo: sí, con amplio margen, incluidas GPUs de gama baja y posiblemente CPU para inferencia (no confirmado en la documentación).
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=kob0105/act_whiteball_new_NoIR_70ep` y `--strategy.type=base`; el entrenamiento se realiza con `lerobot-train --policy.type=act`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La documentación solo indica que el bucle de control opera con cámaras a 30 FPS, sin cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kob0105/act_whiteball_new_NoIR_70ep` | 51,7 M | no aplica | Pick place bola blanca en `so_follower` | apache-2.0 | Hugging Face (20 descargas) |
| Políticas ACT genéricas de LeRobot | variable | no aplica | Manipulación diversa | apache-2.0 (segun repositorio) | Hugging Face / LeRobot |
| Políticas Diffusion Policy | variable | no aplica | Manipulación visuomotora | variable | Hugging Face / LeRobot |
| Políticas VQ-BeT / otros métodos IL | variable | no aplica | Manipulación visuomotora | variable | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("pick place white ball"); no generaliza a otros objetos, posiciones o robots sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito ni número de ensayos en robot real, por lo que se desconoce su fiabilidad fuera de las condiciones del dataset.
- Dependencia del entorno de grabación: cambios de iluminación, fondo, tipo de cámara o posición inicial pueden degradar el comportamiento; el sufijo "NoIR" sugiere datos sin filtro infrarrojo, lo que puede afectar a la correspondencia con otras cámaras.
- Requiere calibración y correspondencia exacta de nombres de cámara (`global`, `palm`) y del puerto del robot; un desajuste en las claves de observación impide la ejecución.
- Riesgo de sobreajuste al dataset pequeño (70 episodios, 29.525 fotogramas) y a la semilla y configuración de entrenamiento concretas.
- Sin capacidades de lenguaje, tool calling ni razonamiento simbólico; no debe presentarse como un modelo de propósito general.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar los términos del dataset asociado antes de reutilizarlo.
- Sesgos conocidos: no documentados; en robótica de imitación los sesgos provienen de las posiciones, objetos y condiciones presentes en la teleoperación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kob0105/act_whiteball_new_NoIR_70ep
- Dataset de entrenamiento: https://huggingface.co/datasets/kob0105/record_test_new_whiteball_paper_NoIR
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kob0105/record_test_new_whiteball_paper_NoIR
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
