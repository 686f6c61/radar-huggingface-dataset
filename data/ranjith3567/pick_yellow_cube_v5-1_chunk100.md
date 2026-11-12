# ranjith3567/pick_yellow_cube_v5.1_chunk100

## Resumen

`pick_yellow_cube_v5.1_chunk100` es una política de imitación robótica basada en SmolVLA, un modelo visión-lenguaje-acción (VLA) compacto desarrollado por Hugging Face y entrenado con la librería LeRobot. El modelo resuelve una tarea concreta de manipulación: recoger un bloque amarillo y depositarlo en una caja marrón. No es un modelo de propósito general, sino un checkpoint especializado para un robot `so_follower` (SO-100/SO-101 de LeRobot) equipado con dos cámaras (Top y Side).

El modelo tiene 450.046.176 parámetros (aproximadamente 450 millones) y consume observaciones multimodales: el estado articular del robot (vector de 6 dimensiones), tres cámaras de 256x256 y una cámara adicional de 480x640, y produce un vector de acción de 6 dimensiones. Se entrenó durante 30.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-4, sobre un dataset de 100 episodios y 63.143 frames a 30 FPS.

Su relevancia radica en que SmolVLA está diseñado para desplegarse en hardware de consumo, lo que permite ejecutar políticas VLA en GPUs asequibles o incluso en el ordenador que controla el robot. Este checkpoint concreto es un ejemplo de fine-tuning de tarea única, útil como referencia para quien quiera reproducir el flujo de entrenamiento de LeRobot o adaptar SmolVLA a su propia tarea de pick-and-place.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción, transformer multimodal) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación por chunk de acciones, no modelo de lenguaje conversacional) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (la tarea se especifica en inglés: "pick the yellow block and place it in brown box") |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones en un transformer compacto. La política consume el estado del robot y las imágenes de las cámaras, junto con la instrucción en lenguaje natural, y emite un chunk de acciones de 6 dimensiones. El nombre del checkpoint (`chunk100`) sugiere el uso de action chunking, una técnica habitual en políticas de imitación que predice secuencias de acciones en lugar de una sola acción por paso, lo que mejora la estabilidad y reduce la latencia efectiva.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `ranjith3567/pick_yellow_cube_v5_20261105_191046`: 100 episodios, 63.143 frames a 30 FPS, una única tarea ("pick the yellow block and place it in brown box"). Se usaron 30.000 pasos de entrenamiento, batch size 8, AdamW con learning rate 1e-4 y semilla 1000. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de alineamiento; se trata de aprendizaje por imitación supervisado a partir de demostraciones teleoperadas.

## Capacidades

- Generación de acciones de manipulación robótica de 6 dimensiones a partir de observaciones visuales y del estado articular.
- Percepción visual multimodal con dos cámaras de 256x256 y una cámara adicional de 480x640.
- Condicionamiento por instrucción en lenguaje natural (task prompt), aunque limitado a la tarea entrenada.
- Ejecución de una tarea específica de pick-and-place: recoger un bloque amarillo y colocarlo en una caja marrón.
- Despliegue en hardware de consumo gracias al tamaño compacto del modelo (aproximadamente 450 M de parámetros).
- Integración con el ecosistema LeRobot para rollout, evaluación y reentrenamiento.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes ni procesamiento de audio.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia completa de recoger el bloque amarillo y depositarlo en la caja marrón, sirviendo como base para experimentos de manipulación con robots SO-100/SO-101.
- Reproducción del flujo de entrenamiento de LeRobot: el checkpoint y su script de entrenamiento permiten replicar el pipeline completo (grabación de datos, entrenamiento con `lerobot-train` y rollout con `lerobot-rollout`) como material didáctico.
- Benchmark interno de políticas VLA: al ser un modelo pequeño y de tarea única, es útil como referencia para comparar tiempos de inferencia, tasas de éxito y robustez frente a variaciones de iluminación o posición.
- Prototipado de robótica de bajo coste: su tamaño permite ejecutarlo en una GPU de consumo conectada al robot, reduciendo la dependencia de servidores o GPUs de datacenter.
- Base para fine-tuning en tareas similares: partiendo de este checkpoint, se puede adaptar a nuevas variantes de pick-and-place (otros objetos, otras cajas) con un dataset propio de pocos episodios.
- Docencia e investigación en imitación: sirve para ilustrar cómo un modelo VLA compacto aprende una política de manipulación a partir de 100 demostraciones y 63.143 frames.
- Validación de infraestructura de inferencia: útil para probar la integración de LeRobot con cámaras OpenCV, puertos serie y control de robots en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en FP16 para los 450 M de parámetros, más el overhead de las cámaras y buffers; no se dispone de una medición oficial.
- GPU recomendadas: no disponible de forma oficial; por tamaño, cualquier GPU con al menos 4 GB de VRAM debería ser suficiente, incluyendo RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs consumer modernas; no hay confirmación oficial en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), con soporte de `--policy.device=cuda` para entrenamiento e inferencia.
- Latencia y throughput estimados: no disponibles. El control se ejecuta a 30 FPS según el dataset de entrenamiento, pero no se documenta la latencia real de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pick_yellow_cube_v5.1_chunk100 (este) | 450 M | no disponible | Pick-and-place de bloque amarillo en caja marrón | no disponible | Hugging Face, LeRobot |
| SmolVLA base | no disponible en la información | no disponible | VLA generalista compacto | no disponible en la información | Hugging Face, LeRobot |
| Políticas ACT de LeRobot | no disponible en la información | no disponible | Imitación robótica (action chunking transformer) | no disponible en la información | Hugging Face, LeRobot |
| Políticas Diffusion Policy de LeRobot | no disponible en la información | no disponible | Imitación robótica basada en difusión | no disponible en la información | Hugging Face, LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de tarea única: solo se ha entrenado para "pick the yellow block and place it in brown box"; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasas de éxito ni métricas de robustez, por lo que no se puede afirmar su fiabilidad en producción.
- Licencia no especificada: la model card indica "[More Information Needed]", lo que impide confirmar si el uso comercial está permitido.
- Dependencia de la configuración de hardware: asume un robot `so_follower` con cámaras Top y Side y una cámara adicional `empty_camera_0`; cambiar la disposición de cámaras o el robot puede degradar el rendimiento.
- Riesgo de sobreajuste al dataset: 100 episodios y una única tarea sugieren poca diversidad; es probable que el modelo sea sensible a cambios de iluminación, posición de objetos o distracciones.
- Idiomas: no se documenta soporte multilingüe; la instrucción de tarea está en inglés.
- Sin información sobre sesgos: no se han publicado análisis de sesgos, alucinación (en el sentido de acciones no válidas) ni comportamiento fuera de distribución.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación externa.
- Fecha de creación futura (2026-11-12): conviene verificar la integridad y procedencia del repositorio antes de usarlo en entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ranjith3567/pick_yellow_cube_v5.1_chunk100
- Dataset de entrenamiento: https://huggingface.co/datasets/ranjith3567/pick_yellow_cube_v5_20261105_191046
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ranjith3567/pick_yellow_cube_v5_20261105_191046
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
