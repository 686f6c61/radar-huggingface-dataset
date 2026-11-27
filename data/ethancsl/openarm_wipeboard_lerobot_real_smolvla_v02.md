# ethanCSL/openarm_wipeboard_lerobot_real_smolvla_v02

## Resumen

`ethanCSL/openarm_wipeboard_lerobot_real_smolvla_v02` es una política de visión-lenguaje-acción (VLA) compacta, resultado del ajuste fino de `lerobot/smolvla_base` sobre un conjunto de datos propio de demostraciones reales. El autor, `ethanCSL`, la publica a través de la librería LeRobot de Hugging Face con licencia Apache 2.0. No es un modelo de lenguaje generalista, sino un controlador robótico entrenado para una tarea concreta: pasar un borrador de una mano a otra y limpiar una pizarra.

El modelo resuelve el problema de mapear observaciones multimodales (estado articular de 6 dimensiones y tres cámaras RGB de 256x256) a un vector de acción de 16 dimensiones, a 30 FPS. Su relevancia radica en que SmolVLA está diseñado para desplegarse en hardware de consumo, lo que abarata la experimentación en robótica de manipulación frente a VLA de mayor tamaño. El ajuste fino se realizó sobre 20 episodios y 18.601 fotogramas capturados con un robot OpenArm.

El checkpoint tiene 450.046.176 parámetros y un tamaño de repositorio de 0,9 GB en formato safetensors. Es un artefacto de investigación con cero descargas y cero likes en el momento de la ficha, y sin resultados de evaluación publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer compacto; detalles internos no disponibles en la model card) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (política de control; ventana temporal no especificada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | no disponible (el modelo no genera lenguaje; recibe una instrucción de tarea en texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura VLA compacta que combina un codificador visual y de lenguaje con un cabezal de acciones, orientada a inferencia de bajo coste en hardware de consumo. En este checkpoint concreto, la política consume `observation.state` de forma `(6,)` y tres flujos visuales de `(3, 256, 256)` (`body_cam`, `wrist_cam`, `right_wrist_cam`) y emite un vector `action` de forma `(16,)`. El robot objetivo es de tipo `openarm_umeow`.

El ajuste fino se hizo sobre el dataset `ethanCSL/openarm_wipeboard_lerobot_real_v02`: 20 episodios, 18.601 fotogramas a 30 FPS, para la tarea "Left arm pass eraser to right arm to wipe off the board". La configuración de entrenamiento fue de 20.000 pasos, batch de 8, optimizador AdamW, learning rate 1e-4 y semilla 1000, con LeRobot 0.6.2. No se documentan en la model card detalles sobre composición del dataset más allá del recuento, ni sobre uso de RLHF/DPO (no aplicable en este tipo de política de imitación).

## Capacidades

- Control robótico de manipulación bimanual para una tarea específica de borrado de pizarra.
- Fusión de estado articular y tres vistas de cámara en un único vector de acción de 16 dimensiones.
- Ejecución de políticas de imitación a 30 FPS sobre el robot `openarm_umeow`.
- Condicionamiento por instrucción de tarea en texto ("Left arm pass eraser to right arm to wipe off the board").
- Despliegue mediante la CLI `lerobot-rollout` con `--strategy.type=base`.
- No soporta tool calling, function calling, agentes multi-paso, generación de texto libre ni capacidades de audio o razonamiento simbólico: es un controlador motor.

## Casos de uso

- Investigación en imitación bimanual: sirve como referencia reproducible para estudiar transferencia de objetos entre brazos con SmolVLA y LeRobot, dado que el dataset y la configuración de entrenamiento están publicados.
- Reproducción de experimentos de VLA compactos: permite comparar el rendimiento de SmolVLA frente a otros métodos sobre una tarea física concreta con 20 episodios de demostración.
- Base para ajuste fino adicional: al derivar de `lerobot/smolvla_base`, puede reutilizarse como punto de partida para tareas de borrado o manipulación similares con pocos datos.
- Validación de pipelines de datos LeRobot: el dataset asociado (18.601 fotogramas a 30 FPS) sirve para probar herramientas de visualización, grabación y entrenamiento de LeRobot 0.6.2.
- Demostraciones de robótica en hardware de consumo: al ser un modelo de 450 M de parámetros y 0,9 GB, es viable desplegarlo en estaciones con GPU de gama media para demostraciones de laboratorio.
- Benchmark interno de robustez visual: útil para medir cómo afectan cambios de iluminación, posición de objetos o cámaras a una política entrenada con solo 20 episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con el texto "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito ni métricas de la tarea en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en FP32 el peso ronda 1,8 GB y en FP16 unos 0,9 GB, a lo que hay que sumar el coste de los tres flujos de imagen de 256x256.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-6 GB de VRAM debería poder alojar los pesos; se recomienda una GPU con soporte CUDA para el pipeline de LeRobot (`--policy.device=cuda`).
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas tipo RTX 3060/4060 o superiores, aunque el autor no publica requisitos mínimos.
- Opciones de despliegue: CLI de LeRobot (`lerobot-rollout`, `lerobot-train`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; la captura de datos se realizó a 30 FPS, pero no se publica latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openarm_wipeboard_lerobot_real_smolvla_v02 | 450 M | no disponible | Borrado de pizarra bimanual (OpenArm) | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA base para ajuste fino | no disponible en la informacion | Hugging Face (modelo base) |
| Otros VLA de referencia (p. ej. OpenVLA, pi0) | no disponible en la informacion | no disponible | Manipulación general | no disponible en la informacion | no disponible |

La comparación cuantitativa con alternativas no es posible con los datos proporcionados: no hay benchmarks publicados para este checkpoint ni cifras de rendimiento de los modelos de referencia en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 20 episodios de un único operador y robot, la política hereda los sesgos de esas demostraciones (posiciones, iluminación y estilo de ejecución).
- Riesgo de sobreajuste: 20 episodios y 18.601 fotogramas es un volumen muy reducido; es probable que la generalización a nuevas posiciones, objetos o condiciones de luz sea limitada.
- Alucinación: no aplica en el sentido de generación de texto, pero sí en el de acciones erróneas o inseguras fuera de distribución.
- Limitaciones de contexto e idioma: la instrucción de tarea es fija ("Left arm pass eraser to right arm to wipe off the board"); no se documenta soporte multilingüe ni variación de instrucciones.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo depende de `lerobot/smolvla_base` y de las condiciones de LeRobot; conviene revisar la licencia del modelo base y de las dependencias.
- Caveats para producción: sin evaluación publicada, sin métricas de éxito y con cero descargas, no es adecuado como componente de producción sin una validación propia exhaustiva en el robot objetivo.
- Requisitos de integración: los nombres de cámara deben coincidir exactamente con las claves de observación (`body_cam`, `wrist_cam`, `right_wrist_cam`) y el robot debe ser de tipo `openarm_umeow`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethanCSL/openarm_wipeboard_lerobot_real_smolvla_v02
- Dataset de entrenamiento: https://huggingface.co/datasets/ethanCSL/openarm_wipeboard_lerobot_real_v02
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ethanCSL/openarm_wipeboard_lerobot_real_v02
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
