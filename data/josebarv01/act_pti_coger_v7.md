# Josebarv01/act_pti_coger_v7

## Resumen

`act_pti_coger_v7` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en el Hub mediante la librería LeRobot de Hugging Face. El autor es `Josebarv01` y el modelo resuelve una tarea concreta de manipulación: "pick up the cup from the holder" (coger un vaso de su soporte). No es un modelo de lenguaje generalista, sino un controlador visuomotor que consume el estado articular del robot y dos flujos de imagen (cámara superior y de muñeca) para producir comandos de acción de 6 dimensiones.

Arquitectónicamente es un transformer ligero de 51.668.614 parámetros (unos 51,7 M) que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, una técnica que reduce el error de acumulación y estabiliza el control. El modelo fue entrenado con 50 episodios de teleoperación (43.886 fotogramas a 30 FPS) sobre un robot de tipo `so_follower`, presumiblemente un SO-100/SO-101 de bajo coste, y se distribuye en formato safetensors con un tamaño de repositorio de 0,2 GB.

Su relevancia es práctica antes que investigadora: demuestra el flujo completo de LeRobot para entrenar y desplegar políticas de imitación en hardware asequible, y sirve como referencia reproducible para quien quiera replicar el pipeline (grabación de datos, entrenamiento ACT, rollout). La información pública es escasa: no hay resultados de evaluación, licencia declarada ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers), aprendizaje por imitación |
| Parametros totales | 51.668.614 (≈51,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política visuomotora; ventana de observación definida por el chunk de acciones, valor no disponible) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica en inglés: "pick up the cup from the holder") |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (librería `lerobot`) |

Otros datos relevantes: tipo de robot `so_follower`; cámaras `top` y `wrist`; entrada `observation.state` de forma `(6,)`; imágenes de `(3, 480, 640)`; salida `action` de forma `(6,)`.

## Arquitectura y entrenamiento

ACT es un método de imitación que combina un backbone transformer con un codificador visual y un decodificador que emite chunks de acciones. El modelo consume el estado propioceptivo de 6 dimensiones y dos imágenes RGB de 480×640 (vista superior y de muñeca), y produce vectores de acción de 6 dimensiones. La predicción por chunks, en lugar de paso a paso, es la innovación central del paper (arXiv:2304.13705): el modelo aprende a generar una secuencia corta de acciones futuras, lo que mitiga el error compounding típico de las políticas reactivas y mejora la estabilidad en tareas de manipulación fina.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `Josebarv01/pti_coger_v7`: 50 episodios, 43.886 fotogramas a 30 FPS, una única tarea. La configuración fue de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni datos sintéticos; es aprendizaje por imitación puro a partir de teleoperación. Tampoco se especifica el número de tokens de entrenamiento (no aplica) ni la composición detallada del dataset más allá del recuento de episodios y fotogramas.

## Capacidades

- Control visuomotor de manipulación: genera comandos de acción de 6 dimensiones a partir de estado articular e imágenes.
- Predicción por chunks de acciones, que aporta suavidad y reduce la acumulación de error en secuencias largas.
- Fusión multimodal de dos cámaras (superior y de muñeca) con el estado propioceptivo.
- Ejecución de una tarea específica de pick-and-place ("pick up the cup from the holder").
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Recogida de un vaso de un soporte en un robot SO-100/SO-101: caso de uso directo para el que fue entrenado; se ejecuta con `lerobot-rollout` indicando el puerto del robot, las cámaras y la tarea.
- Base de referencia para replicar el pipeline de imitación de LeRobot: sirve para validar la instalación, la calibración de hardware y la grabación de datos antes de entrenar políticas propias.
- Fine-tuning sobre un dataset propio: al ser un checkpoint ACT de 51,7 M de parámetros, se puede reentrenar con `lerobot-train` en una GPU de consumo para nuevas tareas de manipulación.
- Docencia y formación en robótica de bajo coste: permite mostrar de extremo a extremo cómo se pasa de teleoperación a política autónoma en hardware asequible.
- Pruebas de robustez visuomotora: útil para evaluar cómo afectan cambios de iluminación, posición del objeto o distractores a una política entrenada con pocos episodios.
- Benchmark interno de latencia y throughput en inferencia robótica: modelo pequeño que permite medir el coste de un ciclo percepción-acción a 30 FPS en distintas GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en FP32 los pesos ocupan aproximadamente 0,2 GB, por lo que el cuello de botella es el codificador visual y el procesamiento de dos imágenes de 480×640, no el transformer.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior cubre el caso con holgura. Para entrenamiento, una RTX 3090/4090 o A100 acelera los 20.000 pasos, aunque el modelo es lo bastante pequeño para entrenar en GPUs de consumo.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más.
- Opciones de despliegue: `lerobot-rollout` (inferencia en robot) y `lerobot-train` (entrenamiento); el formato safetensors es compatible con PyTorch. No se documentan exportaciones a ONNX, TensorRT, llama.cpp ni Ollama (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles. El sistema opera a 30 FPS en la captura de datos; la latencia real de inferencia no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Josebarv01/act_pti_coger_v7` | 51,7 M | ACT (LeRobot) | Pick up the cup from the holder | no disponible | Hugging Face |
| Políticas ACT de referencia en LeRobot | variable (decenas de M) | ACT | Tareas de manipulación diversas | según repositorio | Hugging Face / LeRobot |
| Diffusion Policy (visuomotor) | variable | Diffusion | Manipulación visuomotora | según implementación | Repositorios de investigación |
| VLA generalistas (p. ej. familias tipo RT/OpenVLA) | cientos de M a miles de M | Transformer VLA | Manipulación generalista | según modelo | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, tipo y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 50 episodios de un único operador y entorno, la política hereda los sesgos de posición, iluminación y estilo de teleoperación de esos datos.
- Riesgo de sobreajuste y baja generalización: 50 episodios y una sola tarea implican escasa robustez ante cambios de posición del objeto, distractores o condiciones de luz distintas.
- Sin evaluación publicada: no hay tasa de éxito medida, por lo que no se puede afirmar su fiabilidad en producción.
- Licencia no disponible: la model card indica "[More Information Needed]"; no se puede confirmar el uso comercial sin consultar al autor.
- Dependencia de hardware específico: entrenada para robot `so_follower` con cámaras `top` y `wrist`; requiere que los nombres e índices de cámara coincidan con las claves de observación.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural arbitrarios, tool calling ni razonamiento; la única instrucción es la tarea textual de entrenamiento.
- Caveat de producción: la política ejecuta una tarea fija; cualquier cambio en el entorno o en la cinemática del robot exige reentrenamiento o fine-tuning.
- Sin información sobre cuantización ni despliegue en edge distinto de LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Josebarv01/act_pti_coger_v7
- Dataset de entrenamiento: https://huggingface.co/datasets/Josebarv01/pti_coger_v7
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Josebarv01/pti_coger_v7
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
