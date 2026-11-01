# mlalimov/act_apple_bowl

## Resumen

`mlalimov/act_apple_bowl` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), publicada por el usuario mlalimov en Hugging Face Hub mediante la librería LeRobot de Hugging Face. El modelo no es un modelo de lenguaje: es una política robótica visomotora que, a partir de dos cámaras (muñeca e iPhone) y del estado articular de 6 dimensiones de un robot SO-101, predice directamente comandos de acción de 6 dimensiones. Resuelve una tarea concreta y muy acotada: colocar una manzana roja en un cuenco.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB en formato safetensors, lo que lo hace ejecutable en hardware modesto. Se entrenó sobre un dataset propio de 50 episodios teleoperados y 28.481 fotogramas a 30 FPS, durante 60.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-5. Su relevancia es la de un ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot: grabar datos con un robot de bajo coste, entrenar una política ACT y desplegarla con `lerobot-rollout`.

No se trata de un modelo generalista ni multilingüe: no procesa texto libre ni mantiene conversaciones. Su interfaz es estrictamente tensorial (observaciones de estado e imágenes de entrada, vector de acción de salida), por lo que su evaluación debe hacerse en términos de tasa de éxito en la tarea robótica, no con benchmarks de NLP. La licencia Apache 2.0 permite uso comercial y modificación, aunque la utilidad práctica fuera del robot y la tarea concretos es nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer de imitación con codificador visual y decodificador de chunks de acción |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se especifica como cadena "Place the red apple in the bowl.") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que, en lugar de predecir una acción por paso, predice chunks de acciones cortas, lo que reduce el error de composición y mejora la estabilidad en tareas de manipulación. La política consume `observation.state` de forma `(6,)` y dos entradas visuales de forma `(3, 480, 640)` procedentes de las cámaras `wrist` e `iphone`, y emite un vector `action` de forma `(6,)`. El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `mlalimov/so101-apple-bowl`: 50 episodios, 28.481 fotogramas a 30 FPS, tarea única "Place the red apple in the bowl.".

La configuración de entrenamiento documentada es de 60.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se especifican en la información disponible el número de tokens de entrenamiento (no aplica), la composición del dataset más allá de los episodios y fotogramas, ni si se aplicaron técnicas de RLHF o DPO (no procede en imitación supervisada). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal; la innovación es el propio esquema de chunking de acciones del método ACT.

## Capacidades

- Control visomotor de un robot SO-101 (`so_follower`) a partir de dos cámaras y del estado articular de 6 dimensiones.
- Predicción de chunks de acción de 6 dimensiones para manipulación de objetos.
- Ejecución de una tarea concreta de pick-and-place: colocar una manzana roja en un cuenco.
- Aprendizaje por imitación a partir de datos teleoperados (no requiere recompensas ni entorno simulado).
- Despliegue e inferencia mediante `lerobot-rollout` con `--strategy.type=base`.
- Reentrenamiento reproducible con `lerobot-train` sobre el dataset asociado.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento.

## Casos de uso

- Replicación de la tarea pick-and-place en un SO-101: ejecutar `lerobot-rollout` con `--policy.path=mlalimov/act_apple_bowl` y la tarea "Place the red apple in the bowl." para validar el pipeline completo de LeRobot en un robot de bajo coste.
- Docencia y formación en aprendizaje por imitación: usar el par política-dataset como ejemplo mínimo (50 episodios, 28.481 fotogramas) para explicar grabación de datos, entrenamiento ACT y despliegue.
- Punto de partida para fine-tuning en tareas similares: reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio de manipulación de objetos para adaptar la política a nuevas posiciones o recipientes.
- Pruebas de integración de hardware: verificar la calibración de cámaras `wrist` e `iphone`, el puerto del robot y la frecuencia de 30 FPS antes de escalar a políticas más complejas.
- Benchmark interno de referencia: servir como línea base de tasa de éxito para comparar variantes de ACT o de otros métodos de imitación en el mismo robot y entorno.
- Prototipado de automatización de laboratorio o cocina: evaluar la viabilidad de políticas visomotoras para tareas repetitivas de recogida y colocación antes de invertir en datasets mayores.
- Validación de pipelines de datos: usar el dataset `mlalimov/so101-apple-bowl` con el visor de LeRobot para comprobar la calidad de las trayectorias teleoperadas antes de entrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, número de ensayos ni condiciones de evaluación (posiciones de objetos, iluminación, distracciones).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos safetensors en un repo de 0,2 GB, la huella de pesos es inferior a 1 GB en FP32 y notablemente menor en FP16, por lo que cabe en cualquier GPU consumer moderna.
- GPU recomendadas: no documentadas por el autor; por tamaño, una RTX 3060 o superior es suficiente para la inferencia de la política, aunque el cuello de botella real es la captura de dos cámaras a 640x480 y 30 FPS.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; no se especifican modelos concretos probados.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) y `lerobot-train` con `--policy.device=cuda`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; el autor fija 30 FPS como frecuencia del dataset y de las cámaras, pero no publica métricas de latencia de inferencia ni de throughput en robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mlalimov/act_apple_bowl` | 51.668.614 | no aplica | Pick-and-place manzana-cuenco en SO-101 | Apache 2.0 | Hugging Face Hub, 64 descargas |
| Políticas ACT genéricas de LeRobot | no disponible | no aplica | Manipulación variable según dataset | Apache 2.0 (típicamente) | Hugging Face Hub / docs LeRobot |
| Políticas Diffusion Policy (LeRobot) | no disponible | no aplica | Manipulación visomotora | Apache 2.0 (típicamente) | Hugging Face Hub / docs LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de tarea única: entrenado exclusivamente para "Place the red apple in the bowl."; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito medida, por lo que se desconoce su robustez ante cambios de posición, iluminación o distractores.
- Dependencia de hardware y calibración: requiere un robot `so_follower`, dos cámaras con nombres `wrist` e `iphone`, y un puerto correctamente configurado; cualquier desviación invalida la política.
- Dataset pequeño: 50 episodios y 28.481 fotogramas limitan la diversidad de escenarios cubiertos.
- Sin capacidades de lenguaje ni multilingües: no procesa texto libre ni mantiene diálogo; la tarea se pasa como cadena fija.
- Riesgo de sobreajuste al entorno de grabación: no se documentan variaciones de objetos, fondos o condiciones de luz.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se ofrece garantía alguna sobre el comportamiento del modelo en producción.
- Sin datos de sesgos: no aplica en el sentido de NLP, pero no se documentan sesgos de comportamiento robótico ni modos de fallo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlalimov/act_apple_bowl
- Dataset de entrenamiento: https://huggingface.co/datasets/mlalimov/so101-apple-bowl
- Visor del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mlalimov/so101-apple-bowl
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
