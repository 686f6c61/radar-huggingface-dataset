# Aitor04/policy_test

## Resumen

`Aitor04/policy_test` es una política de imitación para robótica entrenada con el método ACT (Action Chunking with Transformers), publicado en el paper arXiv:2304.13705. No es un modelo de lenguaje: es un modelo de control visuomotor que, a partir de dos cámaras y del estado articular del robot, predice directamente comandos de acción de 6 dimensiones. El autor lo ha entrenado y publicado con LeRobot 0.7.1, la librería de Hugging Face para aprendizaje por imitación en robótica real.

El modelo resuelve una tarea concreta y única: "Coge el objeto marcado con el punto rojo y déjalo en la caja". Se ha entrenado sobre un dataset propio de 341 episodios y 104.580 fotogramas a 30 FPS, capturados con un robot `so_follower` (el seguidor del brazo SO-100/SO-101 de LeRobot) equipado con dos cámaras: `camaracenital` y `camararobot`, ambas a 480x640.

Es relevante como ejemplo práctico de pipeline completo de imitación en robótica de bajo coste: recogida de datos por teleoperación, entrenamiento con ACT y despliegue en hardware real mediante el comando `lerobot-rollout`. Con 51,67 millones de parámetros y un repo de 0,2 GB, es un modelo pequeño y ligero, pensado para ejecutarse en tiempo real junto al robot, no para servirse como API. No hay resultados de evaluación publicados ni licencia declarada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; consume observaciones por paso y predice chunks de acción) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni INT8) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se pasa como cadena de texto al runner) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos (chunks) de acciones futuras en lugar de un único paso, lo que reduce el error de acumulación y mejora la estabilidad del control. La arquitectura combina un encoder de imágenes (procesa las dos cámaras de 3x480x640) con un transformer que fusiona la observación visual y el estado articular de 6 dimensiones para emitir una acción de 6 dimensiones. El modelo tiene 51.668.614 parámetros según los pesos reales en safetensors.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `Aitor04/punto_rojo_20261121_114642`: 341 episodios, 104.580 fotogramas a 30 FPS, una única tarea de picking y placing. Configuración: 150.000 pasos, batch de 16, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni refuerzo; es imitación supervisada pura sobre demostraciones de teleoperación. Tampoco se detalla la composición exacta de aumentos de datos ni la política de regularización temporal del chunking.

## Capacidades

- Control visuomotor de un brazo robótico `so_follower` con 6 grados de libertad a partir de dos cámaras RGB.
- Predicción de chunks de acción en lugar de pasos individuales, lo que aporta suavidad y robustez en la ejecución.
- Ejecución de una tarea concreta de manipulación: localizar un objeto marcado con un punto rojo y depositarlo en una caja.
- Fusión de observación visual (dos vistas: cenital y del propio robot) con el estado articular.
- Despliegue en tiempo real mediante `lerobot-rollout` con estrategia `base` (sin grabación de episodios).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Automatización de picking y placing en un banco de laboratorio: el modelo ejecuta la tarea de coger el objeto con punto rojo y dejarlo en la caja, adecuado para validar pipelines de imitación antes de escalar a tareas industriales.
- Prototipado rápido de políticas con LeRobot: sirve como referencia reproducible para comprobar el flujo `lerobot-train` → `lerobot-rollout` con un robot SO-100/SO-101 y dos cámaras.
- Docencia e investigación en aprendizaje por imitación: permite estudiar el comportamiento de ACT con un dataset pequeño (341 episodios) y comparar hiperparámetros sin grandes recursos de cómputo.
- Benchmark interno de robustez visual: al depender de un marcador rojo, es útil para medir cómo afectan cambios de iluminación, posición del objeto o distracciones en el entorno.
- Base para fine-tuning con nuevos objetos o contenedores: el checkpoint puede reentrenarse con un dataset propio manteniendo la arquitectura y el pipeline de LeRobot.
- Demostración de robótica de bajo coste: con 51,7 M de parámetros y 0,2 GB de pesos, cabe en GPUs de consumo y permite montar una celda de manipulación asequible para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No hay tabla de éxito por tarea, ni comparación con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (51,7 M de parámetros, pesos en safetensors de 0,2 GB), la inferencia cabe holgadamente en GPUs de consumo con 4-8 GB de VRAM, aunque el dato exacto no está documentado.
- GPU recomendadas: no especificadas por el autor; LeRobot permite `--policy.device=cuda`, por lo que se espera compatibilidad con GPUs NVIDIA (RTX 3060/4060/4090, A100, H100) y también ejecución en CPU para pruebas.
- Cabe en GPU de consumo: sí, por tamaño de parámetros y de repo; conviene verificar latencia en tiempo real a 30 FPS con las dos cámaras.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--strategy.type=base`; el entrenamiento se realiza con `lerobot-train`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según el dataset, pero no se publican mediciones de latencia por paso ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aitor04/policy_test (ACT) | 51.668.614 | no aplica | Picking con punto rojo en SO follower | no disponible | Hugging Face, 0 descargas |
| ACT original (paper 2304.13705) | no disponible en la información | no aplica | Imitación general con chunking | no disponible | Paper y código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy, SmolVLA) | no disponible en la información | no aplica | Manipulación diversa | según cada repo | Hub de Hugging Face vía LeRobot |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a categoría, tamaño y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con un único operador, un único robot y una única tarea, el modelo puede sobreajustarse a posiciones, iluminación y disposición concretas del entorno de recogida.
- Riesgo de alucinación: no aplica en el sentido de texto, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento; no hay evaluación de éxito publicada.
- Limitaciones de contexto e idioma: no procesa lenguaje; la tarea se pasa como cadena al runner, pero el modelo no la interpreta semánticamente. Solo funciona con la morfología `so_follower` y las dos cámaras con los nombres exactos `camaracenital` y `camararobot`.
- Restricciones de licencia: la licencia no está declarada ("More Information Needed"), por lo que no se puede confirmar el uso comercial; hay que contactar con el autor antes de integrarlo en producción.
- Caveats para producción: 0 descargas y 0 likes, sin resultados de evaluación, sin demo en vídeo y con un dataset de una sola tarea; no es un modelo listo para producción sin validación propia. Requiere calibración del robot y de las cámaras, y el rendimiento puede degradarse con cambios de objeto, caja o entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aitor04/policy_test
- Dataset de entrenamiento: https://huggingface.co/datasets/Aitor04/punto_rojo_20261121_114642
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Aitor04/punto_rojo_20261121_114642
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
