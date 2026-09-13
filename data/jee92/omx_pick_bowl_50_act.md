# Jee92/omx_pick_bowl_50_act

## Resumen

El modelo Jee92/omx_pick_bowl_50_act es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), publicada por el usuario Jee92 en Hugging Face y entrenada mediante la librería LeRobot. ACT predice bloques de acciones cortas en lugar de pasos individuales, lo que reduce la acumulación de error y permite ejecutar tareas de manipulación robótica con alta tasa de éxito a partir de datos teleoperados. El modelo tiene 51.668.614 parámetros (~51,7 M) y se distribuye en formato safetensors bajo licencia Apache 2.0.

Se trata de una política específica para la tarea de recoger un bol, entrenada sobre el dataset Jee92/omx_pick_bowl_20 y pensada para ejecutarse dentro del ecosistema LeRobot sobre robots compatibles, como el SO-100 follower que aparece en los comandos de evaluación de la model card. El repositorio ocupa 0,2 GB y no incluye datos de benchmarks publicados.

Su interés actual radica en que demuestra que la manipulación robótica puede entrenarse y desplegarse con políticas compactas y hardware de bajo coste. Al integrarse en LeRobot, puede evaluarse, reentrenarse o servir de punto de partida para experimentos de imitación con muy pocos comandos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer encoder-decoder con CVAE, según paper arXiv:2304.13705 |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (política robótica basada en observaciones y horizonte de acciones, no en tokens de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Jee92/omx_pick_bowl_20 |
| Tamano del repo | 0,2 GB |
| Descargas | 14 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de aprendizaje por imitación descrito en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). ACT se basa en una arquitectura transformer encoder-decoder con un componente de autoencoder variacional condicional (CVAE) que modela la variabilidad de las trayectorias humanas. En lugar de predecir una única acción por paso, la política genera un "chunk" de acciones futuras a partir de las observaciones actuales, lo que aporta estabilidad temporal y reduce el error acumulado durante la ejecución.

El entrenamiento se ha realizado con la herramienta `lerobot-train` sobre el dataset Jee92/omx_pick_bowl_20, compuesto por demostraciones teleoperadas de la tarea de recoger un bol. No se dispone de información sobre el número de episodios, el número de frames, la composición exacta del dataset ni la configuración de hiperparámetros utilizada. Al tratarse de aprendizaje por imitación, no se emplean técnicas de alineación tipo RLHF o DPO.

## Capacidades

- Predicción de acciones robóticas en bloques (action chunking) en lugar de acciones unitarias.
- Ejecución de la tarea concreta de pick-and-place sobre un bol (pick bowl).
- Aprendizaje por imitación a partir de datos teleoperados; puede reentrenarse con nuevos datasets de LeRobot.
- Inferencia sobre robot SO-100 follower, según el comando de evaluación incluido en la model card.
- Registro de episodios de evaluación mediante `lerobot-record` para medir la tasa de éxito.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso simbólico, y no tiene capacidades multilingües.
- No dispone de modos especiales documentados (thinking, visión semántica, audio).

## Casos de uso

- Manipulación pick-and-place en laboratorio: la política ejecuta la secuencia de agarre y colocación de un bol a partir de observaciones de cámara y estado del robot, adecuada para bancos de pruebas educativos con brazos SO-100.
- Automatización de tareas repetitivas de recogida: puede integrarse en una celda robótica para retirar objetos de una posición fija y depositarlos en otra, reduciendo la intervención manual en tareas monótonas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para comparar ACT con otros métodos (Diffusion Policy, VLA) sobre una misma tarea y dataset.
- Fine-tuning con nuevos datos: al estar en LeRobot y safetensors, puede reentrenarse con un dataset propio (`lerobot-train --policy.type=act`) para adaptar la tarea a nuevas posiciones u objetos.
- Despliegue en hardware embebido: por su tamaño de ~51,7 M de parámetros, puede ejecutarse en plataformas como Jetson Orin para robótica de borde.
- Evaluación reproducibilidad en docencia: permite reproducir el flujo completo entrenamiento → inferencia → medición de éxito con los comandos estándar de LeRobot.
- Prototipado de brazos de bajo coste: su uso sobre SO-100 follower lo hace apto para entornos con presupuesto reducido, evitando brazos industriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de éxito por episodio, tasas de acierto, ni comparaciones numéricas con otras políticas. La búsqueda web realizada no devolvió resultados técnicos relevantes (solo devolvió imágenes de stock sin relación con el modelo).

## Requisitos de hardware

- VRAM estimada: muy reducida. Con ~51,7 M de parámetros, los pesos en FP32 ocupan aproximadamente 207 MB y en FP16 unos 103 MB. Sumando activaciones de los codificadores visuales, la inferencia típica cabe en 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA moderna sirve. Para entrenamiento, una RTX 3090, RTX 4090, A100 o H100 aceleran el proceso; para inferencia bastan GPUs de gama media.
- Compatibilidad con GPU de consumo: sí. Cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y similares. También puede ejecutarse en CPU o en dispositivos embebidos tipo Jetson.
- Opciones de despliegue: el flujo documentado es PyTorch a través de LeRobot (`lerobot-train` para entrenamiento y `lerobot-record --policy.path=...` para inferencia). La model card no menciona soporte para vLLM, llama.cpp ni Ollama (no aplicables a una política de control).
- Latencia y throughput: no disponibles. No hay mediciones publicadas de frecuencia de control ni de tiempo de inferencia por chunk.

## Comparativa con modelos similares

No se dispone de datos numéricos suficientes para establecer comparaciones cuantitativas fiables. La tabla siguiente resume la información disponible y marca los huecos como no disponibles.

| Modelo | Arquitectura | Parametros | Licencia | Formato | Benchmarks publicados |
|---|---|---|---|---|---|
| Jee92/omx_pick_bowl_50_act | ACT (transformer + CVAE) | 51.668.614 | Apache 2.0 | safetensors | no disponibles |
| Diffusion Policy (referencia metodologica) | Política de difusión para acciones | no disponible | no disponible | no disponible | no disponibles en esta ficha |
| Otras políticas ACT en LeRobot Hub | ACT | variable, no disponible | variable | safetensors | no disponibles en esta ficha |

No se incluyen valores inventados. Para una comparación rigurosa sería necesario consultar los resultados de los papers originales y reproducirlos sobre el mismo dataset.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (pick bowl) sobre un dataset concreto; no generaliza a otros objetos, posiciones o entornos sin reentrenamiento.
- Dataset reducido: el entrenamiento se apoya en Jee92/omx_pick_bowl_20, sin que se documente el número de episodios, lo que aumenta el riesgo de sobreajuste y de baja robustez ante variaciones de iluminación o disposición de cámara.
- Ausencia de benchmarks: no hay evidencia pública de tasa de éxito, por lo que no puede garantizarse su rendimiento en producción.
- Validación comunitaria mínima: 14 descargas y 0 likes en el momento de redactar la ficha, lo que indica muy poca revisión externa.
- Dependencia de hardware: los comandos de la model card asumen un robot SO-100 follower y una configuración de sensores determinada; otro hardware requeriría recalibración y posiblemente reentrenamiento.
- Restricciones de licencia: la licencia Apache 2.0 es permisiva y permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright y la atribución. No hay cláusulas adicionales documentadas.
- Sin capacidades de lenguaje: no debe confundirse con un LLM; no procesa texto, no tiene tool calling ni agentes.
- Robustez y seguridad física: cualquier despliegue sobre un brazo real debe implementar límites de par, paradas de emergencia y validación humana, ya que la política no incorpora mecanismos explícitos de seguridad.
- Fechas del repositorio: creado y actualizado el 2026-09-13, valores anómalos que conviene verificar en la propia página del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jee92/omx_pick_bowl_50_act
- Dataset de entrenamiento: https://huggingface.co/datasets/Jee92/omx_pick_bowl_20
- Paper de ACT (ficha en HF): https://huggingface.co/papers/2304.13705
- Paper de ACT (arXiv): https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy

Nota: la búsqueda web realizada no devolvió ningún enlace técnico relevante sobre este modelo; los resultados obtenidos correspondían a imágenes de stock no relacionadas, por lo que se han descartado.
