# sieuneee/pick_and_place_20261101_183149_act

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas autoregresivas paso a paso. Este repositorio concreto, publicado por el usuario `sieuneee`, contiene una política entrenada con LeRobot para la tarea robótica "Pick up the box and place it on top of the book" sobre un robot de tipo `so_follower` (familia SO-100/SO-101), con dos cámaras de entrada (`top` y `wrist`).

El modelo es un transformer de ~51,7 millones de parámetros que consume el estado articular de 6 dimensiones y dos imágenes RGB de 480x640, y produce un vector de acción de 6 dimensiones. Se entrenó durante 20.000 pasos con batch de 8 y learning rate de 1e-5 sobre un dataset propio de 100 episodios y 32.870 fotogramas a 30 FPS.

Su relevancia es acotada: no es un modelo de propósito general, sino una política específica de una tarea y un robot concretos, útil como referencia práctica para quien quiera reproducir el flujo de entrenamiento de ACT con LeRobot o reutilizar la configuración en un montaje SO-100 similar. No dispone de resultados de evaluación publicados ni de licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política por imitación, no modelo de lenguaje; ventana de observación definida por la configuración de ACT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se especifica como cadena de texto fija) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer de aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice un *chunk* de acciones futuras a partir de las observaciones actuales. La arquitectura combina un codificador visual (para las dos cámaras, `top` y `wrist`, con entradas de 3x480x640) con un codificador del estado propioceptivo (`observation.state`, vector de 6 dimensiones) y un decodificador transformer que genera el vector de acción de 6 dimensiones. El método se describe en el paper arXiv:2304.13705 y está implementado en LeRobot.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `sieuneee/pick_and_place_20261101_183149`: 100 episodios, 32.870 fotogramas a 30 FPS, una única tarea ("Pick up the box and place it on top of the book"). La configuración fue de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni datos adicionales; es aprendizaje supervisado puro a partir de demostraciones teleoperadas. No se especifican innovaciones adicionales como decodificación especulativa ni atención lineal.

## Capacidades

- Control robótico de manipulación: genera comandos de 6 dimensiones (típicamente posición/orientación del efector o articulaciones) a partir de estado y visión.
- Percepción visual multi-cámara: procesa simultáneamente una vista cenital (`top`) y una vista de muñeca (`wrist`), lo que aporta información de contexto y de precisión de agarre.
- Ejecución de una tarea concreta de pick-and-place: coger una caja y colocarla sobre un libro.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Predicción de chunks de acción: reduce el error acumulado frente a políticas paso a paso.
- Integración con el ecosistema LeRobot: ejecutable mediante `lerobot-rollout` y reentrenable con `lerobot-train`.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades multilingües o de generación de texto.

## Casos de uso

- Reproducción de la tarea pick-and-place en un robot SO-100/SO-101: desplegar la política con `lerobot-rollout` sobre el mismo tipo de robot y dos cámaras configuradas como `top` y `wrist`, usando la tarea "Pick up the box and place it on top of the book".
- Base de referencia para formación en aprendizaje por imitación: sirve como ejemplo completo y reproducible del pipeline de LeRobot (grabación de datos, entrenamiento ACT, rollout) para cursos o talleres de robótica.
- Punto de partida para fine-tuning en tareas similares: reentrenar con `lerobot-train` sobre un dataset propio de manipulación con el mismo formato de observaciones (estado de 6 dimensiones y dos cámaras).
- Prototipado de automatización de laboratorio: usar la política como demostrador de manipulación de objetos pequeños en entornos controlados con iluminación y posiciones fijas.
- Evaluación comparativa de políticas ACT: emplear esta configuración (20.000 pasos, batch 8, lr 1e-5) como línea base al comparar variantes de ACT o de otras políticas de imitación en el mismo hardware.
- Integración en un pipeline de investigación con LeRobot: cargar la política desde el Hub y combinarla con utilidades de grabación y visualización de datasets para analizar el comportamiento aprendido.
- Docencia y divulgación: mostrar de forma tangible cómo un transformer de ~51,7 M de parámetros puede ejecutar una tarea física a 30 FPS con dos cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real ni de comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors (FP32/FP16), el peso del modelo ocupa del orden de 0,1-0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060/4060 o superior es suficiente para inferencia; para entrenamiento se recomienda al menos una GPU con 8-12 GB de VRAM, aunque no se documenta.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; el cuello de botella real es el procesamiento de dos flujos de vídeo a 480x640 y 30 FPS.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de `--policy.device=cuda`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política está diseñada para operar a 30 FPS según el dataset de entrenamiento, pero no se publican mediciones de latencia en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| sieuneee/pick_and_place_20261101_183149_act (este) | 51,7 M | Tarea única pick-and-place, robot `so_follower`, 2 cámaras | no disponible | HuggingFace Hub (LeRobot) |
| Otras políticas ACT en LeRobot Hub | variable (del orden de decenas de millones) | Tareas específicas por repositorio | variable según autor | HuggingFace Hub |
| Diffusion Policy (implementación LeRobot) | no disponible en esta ficha | Aprendizaje por imitación con modelos de difusión | no disponible | Repositorio LeRobot |
| π0 / políticas VLA de propósito general | no disponible en esta ficha | Manipulación generalista con instrucciones en lenguaje | no disponible | Repositorios públicos |

No se dispone de datos cuantitativos para comparar rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único tipo de robot (`so_follower`); no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real, por lo que se desconoce su robustez ante cambios de iluminación, posiciones de objetos o distracciones.
- Licencia no declarada: la model card indica "More Information Needed"; no se puede asumir uso comercial sin consultar al autor.
- Dependencia del hardware: requiere dos cámaras con nombres `top` y `wrist` y un robot compatible con LeRobot; cualquier desviación en la configuración de sensores puede degradar el comportamiento.
- Dataset pequeño y de un solo operador: 100 episodios y 32.870 fotogramas implican un sesgo hacia las condiciones de grabación (posiciones, iluminación, estilo de teleoperación).
- Riesgo de sobreajuste a la escena: al ser aprendizaje por imitación con datos limitados, es probable que la política falle ante objetos distintos o disposiciones no vistas.
- Sin capacidades de lenguaje ni razonamiento simbólico: no debe emplearse como modelo conversacional ni de agente basado en texto.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sieuneee/pick_and_place_20261101_183149_act
- Dataset de entrenamiento: https://huggingface.co/datasets/sieuneee/pick_and_place_20261101_183149
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sieuneee/pick_and_place_20261101_183149
