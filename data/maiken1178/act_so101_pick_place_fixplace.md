# Maiken1178/act_so101_pick_place_fixplace

## Resumen

`Maiken1178/act_so101_pick_place_fixplace` es una política de imitación para robótica basada en el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705 y entrenada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es una política visuomotora que, a partir de una imagen de cámara de muñeca y del estado de las articulaciones, predice secuencias cortas de acciones ("action chunks") para un brazo robótico de tipo `so_follower` (SO-101). El modelo fue subido por el usuario Maiken1178 y su única finalidad documentada es ejecutar la tarea "Pick up the block and place it in the bowl".

La política tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que la sitúa en el rango de modelos ligeros que pueden ejecutarse en tiempo real en hardware de consumo. Consume dos entradas: `observation.state` con forma `(6,)` (estado articular de 6 grados de libertad) y `observation.images.wrist` con forma `(3, 480, 640)` (imagen RGB de 480x640 píxeles); produce como salida `action` con forma `(6,)`. Es relevante ahora como ejemplo reproducible de entrenamiento de imitación end-to-end con LeRobot 0.6.2 sobre un dataset pequeño de 30 episodios.

El modelo se entrenó sobre el dataset `Maiken1178/so101_pick_place_20261120_090300_fixplace_20261121_090501`, compuesto por 30 episodios y 10.758 fotogramas a 30 FPS. No se han publicado resultados de evaluación en robot real, por lo que su tasa de éxito es desconocida. La licencia no está especificada en la model card, lo que impide confirmar condiciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política visuomotora, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para esta política) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la instrucción de tarea es una cadena fija) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual, un transformer y un decodificador que predice fragmentos de acción (chunks) en lugar de pasos individuales. La predicción por chunks mitiga el problema de la acumulación de errores en el control secuencial y permite un control más suave y consistente. La entrada visual es una única cámara de muñeca (`wrist`) a resolución 480x640, y la entrada propioceptiva es el estado articular de 6 dimensiones; la salida es un vector de acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.2 durante 10.000 pasos, con batch size de 8, optimizador AdamW, learning rate de 1e-5 y semilla 1000. El dataset de entrenamiento contiene 30 episodios y 10.758 fotogramas grabados a 30 FPS, todos correspondientes a la tarea "Pick up the block and place it in the bowl". No se documenta el uso de RLHF, DPO ni de datos adicionales; se trata de aprendizaje por imitación supervisado a partir de teleoperación. No se detalla la composición exacta de las posiciones de objetos, iluminación o variaciones de escena presentes en los 30 episodios.

## Capacidades

- Control visuomotor de un brazo robótico `so_follower` de 6 grados de libertad a partir de una imagen de muñeca.
- Predicción de chunks de acción para ejecución suave y consistente en tiempo real.
- Ejecución de una única tarea de pick-and-place: recoger un bloque y depositarlo en un cuenco.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere refuerzo ni recompensas).
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes.
- No tiene capacidades multilingües ni de generación de texto: no es un modelo de lenguaje.
- No dispone de modo "thinking", visión general, audio ni otras modalidades más allá de la imagen de muñeca.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política se ejecuta con `lerobot-rollout` sobre un SO-101 real para recoger bloques y colocarlos en un cuenco, útil como banco de pruebas de pipelines de imitación.
- Base para fine-tuning en tareas de manipulación similares: al ser una política ACT ligera (51,7 M de parámetros), sirve como punto de partida para reentrenar con nuevos datasets de pick-and-place.
- Reproducción de experimentos de investigación en imitación: permite replicar el flujo completo de LeRobot (grabación, entrenamiento y despliegue) con un dataset pequeño de 30 episodios.
- Docencia y formación en robótica: el modelo y su dataset asociado permiten ilustrar el ciclo de aprendizaje por imitación en un robot de bajo coste.
- Validación de hardware y calibración: ejecutar la política durante 60 segundos con `--duration=60` sirve para comprobar que la cámara de muñeca, el puerto del robot y la calibración están correctos.
- Pruebas de integración de LeRobot en pipelines propios: el comando `lerobot-rollout` con `--strategy.type=base` permite evaluar latencia y comportamiento sin grabar episodios.
- Benchmark interno de control visuomotor: comparar la política con otras variantes ACT entrenadas sobre el mismo dataset para medir el efecto de hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de métricas de error de acción, ni de comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors (0,2 GB de repositorio), la inferencia cabe holgadamente en GPUs de consumo con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el comando de entrenamiento de la model card usa `--policy.device=cuda`. Para entrenamiento se recomienda al menos una RTX 3060/4060 o superior; para inferencia basta una GPU integrada o de gama baja.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM; también es viable en CPU para inferencia a baja frecuencia, aunque no está documentado.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) como vía oficial; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput estimados: no disponibles. El control se ejecuta a 30 FPS según la frecuencia del dataset de entrenamiento, pero no se publican medidas de latencia real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Maiken1178/act_so101_pick_place_fixplace` | 51,7 M | no aplica | Pick-and-place SO-101 | no disponible | Hugging Face (LeRobot) |
| ACT original (paper arXiv:2304.13705) | no disponible | no aplica | Manipulación con chunks de acción | no disponible | Paper y código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | no disponible | no aplica | Manipulación robótica | según repositorio | Hugging Face (LeRobot) |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica con alternativas. La comparación se limita a categoría, tamaño y disponibilidad.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real de la política en robot físico.
- Entrenada sobre un dataset muy pequeño (30 episodios, 10.758 fotogramas) y una única tarea, por lo que la generalización a nuevas posiciones, objetos, iluminación o distractores es previsiblemente limitada.
- Depende de una única cámara de muñeca; cambios en la cámara, su calibración o su resolución respecto a la configuración de entrenamiento pueden degradar el comportamiento.
- La licencia no está especificada, lo que impide confirmar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- No es un modelo de lenguaje: no procesa instrucciones en lenguaje natural más allá de la cadena fija de tarea, y no tiene capacidades de razonamiento, código ni matemáticas.
- Riesgo de sobreajuste a la configuración exacta del robot `so_follower` y del entorno de grabación; no se documentan pruebas con robots distintos del mismo tipo.
- No se documentan sesgos, pero al ser una política entrenada con demostraciones humanas hereda las limitaciones y sesgos de las trayectorias teleoperadas.
- Para producción se recomienda validar en robot real con múltiples ensayos por tarea antes de confiar en la política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maiken1178/act_so101_pick_place_fixplace
- Dataset de entrenamiento: https://huggingface.co/datasets/Maiken1178/so101_pick_place_20261120_090300_fixplace_20261121_090501
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Maiken1178/so101_pick_place_20261120_090300_fixplace_20261121_090501
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
