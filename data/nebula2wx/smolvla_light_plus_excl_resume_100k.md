# nebula2wx/smolvla_light_plus_excl_resume_100k

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico por imitación con requisitos computacionales reducidos. Esta ficha concreta, `nebula2wx/smolvla_light_plus_excl_resume_100k`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` sobre un dataset local de una única tarea de manipulación, y no un modelo generalista: se trata de una política entrenada para un robot y unas cámaras específicas.

El modelo resuelve el problema de llevar políticas VLA a hardware de consumo, combinando un codificador visual y de lenguaje con un decodificador de acciones que produce comandos de 6 dimensiones a partir de observaciones multimodales (estado articular y hasta cuatro flujos de cámara). Con 450 millones de parámetros totales y pesos en safetensors, es lo bastante pequeño para ejecutarse en GPUs consumer, lo que lo hace relevante para prototipado rápido en robótica de bajo coste.

La relevancia de este checkpoint es acotada: es un artefacto de investigación con 16 descargas y sin métricas de evaluación publicadas, entrenado durante 100.000 pasos sobre 118 episodios (72.684 frames a 30 FPS) de una sola tarea —"pick up the red block and put it on the plate"—. Debe evaluarse como una política de imitación concreta, no como un modelo fundacional de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, según SmolVLA (arXiv:2506.01844); codificador visión-lenguaje + decodificador de acciones |
| Parametros totales | 450.046.176 (450 M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (política de imitación; sin ventana de contexto textual declarada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la tarea está especificada en inglés: "pick up the red block and put it on the plate") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` |
| Cámaras | `head`, `wrist` (la model card lista además `camera1`, `camera2`, `camera3` y `empty_camera_0`) |
| Entrada de estado | `observation.state`, shape `(6,)` |
| Entradas visuales | `(3, 256, 256)` para cámaras 1-3; `(3, 480, 640)` para `empty_camera_0` |
| Salida de acción | `action`, shape `(6,)` |
| Dataset de entrenamiento | `local/standard_task_3plus5` (118 episodios, 72.684 frames, 30 FPS) |
| Pasos de entrenamiento | 100.000 |
| Tamaño del repositorio | 13,2 GB |

## Arquitectura y entrenamiento

SmolVLA es una política de imitación que combina percepción visual y comprensión del lenguaje con la generación directa de acciones motoras. El modelo consume el estado articular del robot (vector de 6 dimensiones) junto con imágenes de varias cámaras —tres vistas a 256×256 y una vista adicional a 480×640— y emite un vector de acción de 6 dimensiones. La arquitectura sigue el diseño descrito en el paper arXiv:2506.01844, orientado a reducir el coste computacional frente a VLA de mayor tamaño manteniendo un rendimiento competitivo, y está pensada para desplegarse en hardware de consumo.

El entrenamiento de este checkpoint parte de `lerobot/smolvla_base` y se realizó con LeRobot 0.6.2 durante 100.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-4 y semilla 1000. El dataset `local/standard_task_3plus5` contiene 118 episodios y 72.684 frames a 30 FPS de una única tarea de manipulación. No se documenta en la información disponible el volumen de tokens, la composición del dataset más allá de la tarea, ni si se aplicaron etapas de RLHF o DPO; al tratarse de aprendizaje por imitación supervisado, no se espera un ajuste por preferencias humanas.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 dimensiones para un robot `so_follower` a partir de observaciones multimodales.
- Percepción visual multi-cámara: procesa tres flujos de 256×256 y un flujo de 480×640, con soporte para cámaras de tipo `head` y `wrist`.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica como texto ("pick up the red block and put it on the plate").
- Fusión de estado propioceptivo y visión: integra el vector de estado articular de 6 dimensiones con las imágenes.
- Ejecución de políticas en bucle cerrado mediante `lerobot-rollout` con estrategia `base`, incluyendo ejecución indefinida si se omite la duración.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, modo thinking, audio ni generación de texto general. Es un modelo de acción, no un LLM conversacional.

## Casos de uso

- Recogida y colocación de objetos en laboratorio: el caso canónico del checkpoint es coger un bloque rojo y depositarlo en un plato; sirve como banco de pruebas para validar el pipeline completo de LeRobot (grabación, entrenamiento y despliegue) antes de escalar a tareas propias.
- Prototipado de imitación con pocos datos: con 118 episodios y 72.684 frames, el checkpoint demuestra que un fine-tuning de 100.000 pasos sobre SmolVLA base puede producir una política funcional para una tarea de manipulación, útil como plantilla para nuevos datasets.
- Evaluación de hardware de bajo coste: al tener 450 M de parámetros, permite medir latencia y viabilidad de políticas VLA en GPUs consumer, informando decisiones de compra de hardware para un laboratorio.
- Investigación en robótica de manipulación: sirve como línea base reproducible (semilla 1000, hiperparámetros documentados) para comparar variantes de datos, aumentación o arquitectura sobre la misma tarea.
- Docencia y formación en LeRobot: el repositorio incluye comandos de despliegue y entrenamiento que permiten a estudiantes ejecutar una política real sobre un robot `so_follower` con cámaras estándar.
- Integración en pipelines de recogida de datos: puede usarse como política de referencia durante la grabación de nuevos episodios, comparando el comportamiento del modelo con el del operador humano para detectar desviaciones en la calibración de cámaras.
- Validación de configuraciones de cámara: al declarar shapes concretos por cámara, permite probar si una disposición física de cámaras (head/wrist) es compatible con el modelo antes de invertir en un dataset nuevo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con la plantilla vacía y la nota explícita: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 450 M de parámetros, en FP32 los pesos ocupan aproximadamente 1,8 GB (450 M × 4 bytes); en FP16/BF16, unos 0,9 GB. A ello hay que sumar activaciones y buffers de imagen (cuatro flujos visuales, uno de ellos a 480×640), por lo que una estimación prudente se sitúa en el rango de 2-4 GB, aunque no está confirmada por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-6 GB de VRAM debería poder alojar los pesos; para entrenamiento conviene una GPU con más memoria (A100, H100, RTX 4090) por el batch y las imágenes.
- ¿Cabe en GPU consumer? Sí, previsiblemente en RTX 3060/4060 y superiores, dado el tamaño de 450 M de parámetros; la cifra exacta no está documentada.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) y `lerobot-train` para fine-tuning, según la model card. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para una política de acción.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se grabó a 30 FPS, lo que sugiere que la política debe operar en ese orden de frecuencia, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nebula2wx/smolvla_light_plus_excl_resume_100k` | 450 M | no disponible | Manipulación (1 tarea) | Apache 2.0 | Hugging Face, 16 descargas |
| `lerobot/smolvla_base` | no disponible en la información | no disponible | VLA base para fine-tuning | no disponible en la información | Hugging Face (modelo base citado) |
| Políticas VLA de mayor escala (p. ej. OpenVLA) | no disponible en la información | no disponible | Manipulación generalista | no disponible en la información | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea ("pick up the red block and put it on the plate") sobre un único robot `so_follower`; no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia de la configuración de cámaras: los nombres y shapes de las cámaras deben coincidir exactamente con los del entrenamiento; una cámara mal nombrada o con distinta resolución invalida la inferencia.
- Dataset pequeño: 118 episodios y 72.684 frames son pocos para robustez ante cambios de iluminación, posiciones de objetos o distracciones; se espera degradación fuera de la distribución de entrenamiento.
- Riesgo de sobreajuste al entorno de grabación: el modelo puede reproducir sesgos de la trayectoria humana, incluyendo posiciones iniciales y velocidades específicas.
- Idiomas: no se documentan capacidades multilingües; la instrucción de tarea está en inglés y no se ha verificado el comportamiento con instrucciones en castellano.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de `lerobot/smolvla_base` conviene revisar las condiciones del modelo base y del dataset `local/standard_task_3plus5`, que no están detalladas en la información disponible.
- Repositorio de 13,2 GB para 450 M de parámetros: el tamaño sugiere que se incluyen checkpoints u otros artefactos además de los pesos, lo que conviene tener en cuenta al descargar.
- Sin datos de sesgos, alucinación ni robustez fuera de la tarea; cualquier despliegue en producción requiere evaluación propia en el robot objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nebula2wx/smolvla_light_plus_excl_resume_100k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/local/standard_task_3plus5
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=local/standard_task_3plus5
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
