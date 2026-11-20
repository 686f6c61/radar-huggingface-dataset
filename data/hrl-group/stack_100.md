# HRL-Group/stack_100

## Resumen

`HRL-Group/stack_100` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada en Hugging Face mediante la librería LeRobot. La desarrolla el grupo HRL-Group y resuelve una tarea concreta de manipulación: apilar un cubo sobre otro y colocar un cubo en una bandeja. El modelo consume el estado del robot (6 dimensiones) y una imagen de muñeca (3×480×640) y produce acciones de 6 dimensiones, siguiendo el paradigma de predicción de trozos de acción en lugar de pasos individuales.

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705, que predice secuencias cortas de acciones ("action chunks") a partir de datos de teleoperación. Esta implementación concreta tiene 51.668.614 parámetros en formato safetensors, un tamaño de repositorio de 0,2 GB y fue entrenada durante 100.000 pasos con un batch de 16 sobre el dataset `HRL-Group/stack` (92 episodios, 218.681 fotogramas a 30 FPS).

Es relevante porque ejemplifica el flujo completo de LeRobot para entrenar y desplegar políticas robóticas de código abierto, aunque se trata de un checkpoint específico de tarea y robot (`so_follower`) sin resultados de evaluación publicados ni licencia declarada, lo que limita su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo robótico, sin procesamiento de lenguaje natural) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

La arquitectura es ACT, un transformer diseñado para aprendizaje por imitación que predice trozos de acción en lugar de acciones individuales. El modelo recibe dos modalidades de observación: el estado propioceptivo del robot (`observation.state`, vector de 6 dimensiones) y una imagen de la cámara de muñeca (`observation.images.wrist`, tensor 3×480×640). La salida es un vector de acción de 6 dimensiones (`action`). El modelo se entrenó con LeRobot 0.7.0 sobre el dataset `HRL-Group/stack`, compuesto por 92 episodios y 218.681 fotogramas grabados a 30 FPS, con dos tareas descritas: apilar un cubo sobre otro y colocar el cubo en una bandeja.

La configuración de entrenamiento fue de 100.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se especifica en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en aprendizaje por imitación robótico). Tampoco se detallan innovaciones adicionales más allá del propio mecanismo de action chunking del método ACT.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so_follower`.
- Aprendizaje por imitación a partir de datos de teleoperación (92 episodios, 218.681 fotogramas).
- Predicción de trozos de acción (action chunking) para reducir el error compuesto y mejorar la estabilidad.
- Percepción visual de una única cámara de muñeca (`wrist`) a resolución 480×640.
- Ejecución de dos tareas concretas: apilar un cubo sobre otro y colocar un cubo en una bandeja.
- Integración con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política robótica específica, no un modelo de lenguaje.

## Casos de uso

- Apilado de cubos en entornos de laboratorio: el modelo ejecuta la tarea "Pick up one cube and stack it on top of the other cube" sobre un robot `so_follower` con cámara de muñeca, adecuado para experimentos de manipulación reproducible con LeRobot.
- Colocación de objetos en bandejas: la segunda tarea del dataset permite automatizar la recogida y depósito de cubos en una bandeja, útil como banco de pruebas de políticas de imitación.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para comparar variantes de ACT, ajustar hiperparámetros o evaluar el efecto del action chunking en tareas de manipulación.
- Docencia y formación en robótica: ejemplo completo y ligero (0,2 GB, ~51,7 M de parámetros) para enseñar el flujo de LeRobot desde la grabación de datos hasta el despliegue.
- Prototipado rápido de pipelines de teleoperación: permite validar la integración hardware-software (`lerobot-rollout`) antes de escalar a tareas más complejas.
- Base para fine-tuning en tareas similares: al estar entrenado sobre un dataset pequeño y concreto, puede servir de punto de partida para reentrenar con nuevos objetos o posiciones, siempre que se respete el formato de observaciones (estado de 6 dimensiones e imagen de muñeca).
- Benchmark interno de éxito de tareas: aunque no hay resultados publicados, el checkpoint permite medir tasas de éxito propias en el robot `so_follower` y compararlas con otras políticas ACT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51.668.614 parámetros en safetensors, el peso en memoria es de aproximadamente 0,2 GB en precisión de entrenamiento (fp32), y menor si se convierte a fp16/bf16.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería poder ejecutar la inferencia; se recomienda una GPU con soporte CUDA para `--policy.device=cuda`.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; el cuello de botella principal es el procesamiento de imagen 480×640 a 30 FPS, no el tamaño del modelo.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), y entrenamiento con `lerobot-train`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a una política robótica).
- Latencia y throughput estimados: no disponibles. La model card solo indica que la política se ejecuta a 30 FPS en el dataset de entrenamiento; no se publican mediciones de latencia en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modalidad | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HRL-Group/stack_100 (ACT) | 51.668.614 | Estado 6D + imagen 480×640; sin contexto textual | Sin evaluación publicada | no disponible | Hugging Face (LeRobot) |
| Otras políticas ACT en LeRobot Hub | no disponible | Configuración variable según dataset | no disponible | variable según autor | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | no disponible | Estado + imagen; acción por difusión | no disponible | variable según autor | Hugging Face |
| Políticas VLA (p. ej. OpenVLA) | no disponible en esta ficha | Estado + imagen + instrucciones en lenguaje | no disponible | variable según autor | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada; la comparación se limita a categoría y modalidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; el dataset es pequeño (92 episodios) y específico de una configuración de robot y cámara, por lo que el modelo puede sobreajustarse a posiciones, iluminación y objetos del entorno de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones incorrectas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no procesa lenguaje natural; solo acepta estado de 6 dimensiones e imagen de muñeca. No es un modelo multilingüe ni de propósito general.
- Restricciones de licencia para uso comercial: la licencia no está declarada ("More Information Needed"), por lo que no se puede asumir permiso de uso comercial sin consultar al autor.
- Caveats para producción: no hay resultados de evaluación publicados, el robot objetivo es `so_follower` y la cámara debe llamarse `wrist` con resolución 480×640; cualquier cambio de hardware, cámara o tarea requiere reentrenamiento o fine-tuning.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación externa.
- No se especifican requisitos de seguridad física para el despliegue en un robot real; se recomienda supervisión humana y límites de par/velocidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HRL-Group/stack_100
- Dataset de entrenamiento: https://huggingface.co/datasets/HRL-Group/stack
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía LeRobot ACT: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HRL-Group/stack
