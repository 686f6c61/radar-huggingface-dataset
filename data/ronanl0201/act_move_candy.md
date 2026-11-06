# ronanl0201/act_move_candy

## Resumen

`act_move_candy` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado por Zhao et al. en el artículo arXiv:2304.13705. La desarrolla el usuario ronanl0201 y se distribuye a través del ecosistema LeRobot de Hugging Face. El modelo resuelve una tarea muy concreta: controlar un brazo robótico `so_follower` (configuración típica de SO-100/SO-101) para pulsar la tecla Intro, a partir de dos cámaras (muñeca y frontal) y el estado articular de 6 dimensiones.

A diferencia de un LLM, no es un modelo de lenguaje: es un transformer pequeño (51.668.614 parámetros, unos 0,2 GB en safetensors) que mapea observaciones visuales y propioceptivas a trozos de acción (*action chunks*) de 6 dimensiones. Su relevancia es la de un ejemplo reproducible de *imitation learning* de extremo a extremo con LeRobot 0.6.2, útil para quien quiera replicar el flujo de captura de datos, entrenamiento y despliegue en un robot de bajo coste.

El entrenamiento se hizo sobre el dataset `ronanl0201/press_enter_20261102_050020` (50 episodios, 28.104 fotogramas a 30 FPS), con 30.000 pasos, batch de 8, AdamW y learning rate 1e-5. El autor no ha publicado resultados de evaluación en robot real ni una licencia explícita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers), política de imitación |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación fija por paso) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se especifica con la cadena "Press the enter key") |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder que predice secuencias cortas de acciones (chunks) en lugar de un único paso, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La política consume `observation.state` (vector de 6 dimensiones), dos imágenes RGB de 3×480×640 (`wrist` y `front`) y produce `action` de 6 dimensiones. El modelo se entrenó con 30.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, usando LeRobot 0.6.2.

Los datos provienen de teleoperación sobre un robot `so_follower`: 50 episodios, 28.104 fotogramas a 30 FPS, todos etiquetados con la tarea "Press the enter key". No se documenta composición adicional del dataset, aumentos de datos ni fases de RLHF/DPO (no aplicables en imitación supervisada). Tampoco se especifican innovaciones adicionales más allá del propio *action chunking* del método ACT.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un brazo `so_follower`.
- Imitación visual-motora a partir de dos cámaras (muñeca y frontal) y estado articular.
- Predicción de *action chunks*: emite secuencias cortas de acciones, lo que suaviza la ejecución.
- Ejecución de una tarea concreta y única: pulsar la tecla Intro.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No incluye modo *thinking*, visión general, audio ni generación de texto.

## Casos de uso

- Replicación de un pipeline de imitación con LeRobot: sirve como referencia para grabar un dataset propio, entrenar con `lerobot-train` y desplegar con `lerobot-rollout` sobre un SO-100/SO-101.
- Automatización de una pulsación física repetitiva: el modelo puede ejecutar la acción de pulsar Intro en un entorno controlado, útil como prueba de concepto de automatización de teclado con robot.
- Benchmark interno de hardware y calibración: al ser una tarea simple, permite validar cámaras, puertos y calibración del brazo antes de pasar a tareas más complejas.
- Docencia y formación: ejemplo mínimo (50 episodios, 28k fotogramas) para explicar *action chunking* y el ciclo completo de aprendizaje por imitación.
- Base para *fine-tuning*: se puede reentrenar con un dataset propio de otra tarea sobre el mismo robot y cámaras, reutilizando la configuración.
- Pruebas de latencia y throughput en inferencia: política pequeña (51,7 M parámetros) que cabe en GPU de consumo y permite medir el coste de inferencia visual en tiempo real a 30 FPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,7 M parámetros; el cuello de botella real son las dos cámaras a 480×640 y 30 FPS.
- GPU recomendadas: cualquier GPU con CUDA, incluidas RTX 3060/4060/4090; también es viable en CPU para pruebas, aunque con mayor latencia.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 4 GB de VRAM.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el entrenamiento se hizo a 30 FPS de captura, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_move_candy (este) | 51,7 M | Pulsar Intro con `so_follower` | no aplica | no disponible | Hugging Face (LeRobot) |
| ACT original (Zhao et al., 2023) | no disponible | Manipulación genérica (ALOHA) | no aplica | no disponible | Paper + código |
| Diffusion Policy (Chi et al., 2023) | no disponible | Manipulación por difusión | no aplica | no disponible | Paper + código |
| Otras políticas LeRobot (p. ej. SmolVLA) | no disponible | Manipulación generalista | no disponible | no disponible | Hugging Face (LeRobot) |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Tarea única y muy específica: solo se entrenó para "Press the enter key"; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que el rendimiento real es desconocido.
- Dependencia del hardware: requiere un robot `so_follower` y dos cámaras con los nombres `wrist` y `front`; cambios de calibración, iluminación o posición pueden degradar el comportamiento.
- Dataset pequeño (50 episodios): riesgo de sobreajuste y de baja robustez ante variaciones del entorno.
- Licencia no especificada: no se puede confirmar el uso comercial; hay que contactar con el autor antes de usarlo en producción.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí de acciones incorrectas o inseguras si el robot opera cerca de personas u objetos frágiles.
- Sin soporte multilingüe ni de lenguaje natural: la tarea se pasa como cadena fija y el modelo no la interpreta semánticamente.
- Fecha de creación futura (2026-11-02) en los metadatos: conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronanl0201/act_move_candy
- Dataset de entrenamiento: https://huggingface.co/datasets/ronanl0201/press_enter_20261102_050020
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ronanl0201/press_enter_20261102_050020
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
