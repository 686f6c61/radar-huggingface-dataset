# amais23/so101_smolvla_test_smoke

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural. La ficha que nos ocupa, `amais23/so101_smolvla_test_smoke`, es un fine-tuning de `lerobot/smolvla_base` sobre un dataset propio de 50 episodios para la tarea concreta de verter un cubo de una taza a otra con un robot SO-101. Su nombre indica que se trata de una ejecución de prueba ("smoke test") con solo 20 pasos de entrenamiento, por lo que no debe considerarse un modelo listo para producción.

El modelo resuelve el problema de mapear directamente píxeles de varias cámaras y el estado de las articulaciones a comandos de acción de 6 dimensiones, sin necesidad de un pipeline de percepción-planificación separado. Con 450 millones de parámetros y pesos en safetensors, está pensado para ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios y aficionados que trabajan con robots de bajo coste como el SO-101.

Su relevancia actual radica en que forma parte de la ola de modelos VLA pequeños y abiertos que buscan democratizar la robótica de imitación: en lugar de depender de modelos gigantes en servidores, SmolVLA apunta a inferencia local en una GPU de gama media o incluso en dispositivos embebidos, con licencia Apache 2.0 que permite uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, basada en SmolVLA |
| Parámetros totales | 450.046.176 (450 M) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se dan en inglés en el ejemplo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Librería | lerobot |
| Pipeline | robotics |
| Tipo de robot | so_follower (SO-101) |
| Cámaras de entrada | front, wrist (más cámaras adicionales en la definición de features) |
| Entrada de estado | observation.state, shape (6,) |
| Salida de acción | action, shape (6,) |
| Tamaño del repo | 1,3 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un componente de lenguaje y una cabeza de acción que produce directamente comandos motores de 6 dimensiones. La arquitectura exacta (número de capas, dimensión oculta, mecanismo de atención) no se detalla en la información disponible; el paper de referencia es arXiv:2506.01844. El modelo consume varias imágenes (cámaras `front` y `wrist` a 256×256, más una cámara adicional a 480×640) junto con el estado de las articulaciones y una instrucción textual de tarea, y emite una acción de 6 grados de libertad por paso.

El fine-tuning documentado es extremadamente ligero: 20 pasos de entrenamiento, batch de 16, optimizador AdamW, learning rate 1e-4 y semilla 1000, sobre 50 episodios y 33.360 fotogramas a 30 FPS del dataset `amais23/so101_cube_pouring`. Esto confirma que se trata de una prueba de humo y no de un entrenamiento convergido. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación; el paradigma es imitación supervisada sobre demostraciones de teleoperación.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para un robot SO-101 a partir de observaciones visuales y de estado.
- Fusión multimodal: integra simultáneamente varias cámaras (muñeca y frontal) con el estado de las articulaciones.
- Condicionamiento por lenguaje: acepta una instrucción textual de tarea ("Pour the cube from the source cup into the target cup") que guía la política.
- Ejecución reactiva en bucle cerrado: produce acciones a la frecuencia de control del robot (30 FPS en el dataset de entrenamiento).
- Despliegue en hardware de consumo: 450 M de parámetros permiten inferencia local.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento simbólico ni procesamiento de audio.

## Casos de uso

- Prueba de humo de pipelines de entrenamiento: sirve para verificar que el flujo `lerobot-train` → `lerobot-rollout` funciona de extremo a extremo antes de lanzar entrenamientos largos, gracias a sus 20 pasos y su tamaño reducido.
- Prototipado de tareas de manipulación con SO-101: permite validar la configuración de cámaras, puertos y claves de observación en un robot real antes de invertir en datasets mayores.
- Docencia y formación en robótica de imitación: su bajo coste computacional y su licencia Apache 2.0 lo hacen adecuado para talleres donde los alumnos entrenan y ejecutan políticas en robots de bajo coste.
- Investigación en VLA compactos: sirve como punto de partida para estudiar el efecto del número de episodios y pasos de entrenamiento en el rendimiento de SmolVLA.
- Integración en entornos de simulación o gemelos digitales: la política puede ejecutarse contra un robot simulado que replique las claves de observación para depurar sin hardware.
- Base para fine-tuning específico de tareas de vertido: aunque este checkpoint es un smoke test, el mismo pipeline puede reutilizarse con más episodios y pasos para obtener una política funcional de "cube pouring".
- Referencia de formato de model card y estructura de repositorio LeRobot: útil para equipos que necesitan publicar sus propias políticas siguiendo las convenciones de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en FP32 serían aproximadamente 1,8 GB solo de pesos, y en FP16 unos 0,9 GB, más el overhead de las imágenes de entrada y del runtime.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutar el modelo.
- GPU de consumo: previsiblemente cabe en RTX 3060, RTX 4060, RTX 4090 y similares, aunque no hay confirmación oficial.
- Opciones de despliegue: el ecosistema LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no a políticas VLA.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, lo que sugiere que el bucle de control objetivo opera a esa frecuencia, pero no se confirma que el modelo alcance ese ritmo en hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amais23/so101_smolvla_test_smoke | 450 M | no disponible | Manipulación SO-101 (cube pouring) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA base para fine-tuning | no disponible en la información | Hugging Face |
| Políticas ACT de LeRobot | no disponible en la información | no disponible | Imitación para robots SO-100/SO-101 | no disponible en la información | Hugging Face / LeRobot |
| Políticas Diffusion Policy de LeRobot | no disponible en la información | no disponible | Imitación visomotora | no disponible en la información | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento insuficiente: 20 pasos con batch 16 sobre 50 episodios es un smoke test; la política probablemente no ejecuta la tarea de forma fiable.
- Sin evaluación publicada: no hay tasas de éxito ni trials documentados, por lo que no se puede afirmar que funcione.
- Especificidad de hardware: entrenado para un robot `so_follower` con cámaras concretas (`front`, `wrist`); no es transferible directamente a otras configuraciones sin reentrenar.
- Dependencia de claves de observación: las cámaras deben nombrarse exactamente como en el entrenamiento (`observation.images.camera1`, etc.), lo que limita la portabilidad.
- Sesgos: no documentados, pero al entrenarse con 50 episodios de un único entorno y una única tarea, el modelo heredará los sesgos de ese dataset (posiciones, iluminación, objetos).
- Riesgo de sobreajuste y alucinación motora: con tan pocos pasos, las acciones pueden ser erráticas o no corresponder a la instrucción.
- Idiomas: no se documenta soporte multilingüe; el ejemplo de instrucción está en inglés.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener sus propias condiciones que conviene revisar.
- No apto para producción: por su naturaleza de prueba, no debe desplegarse en entornos reales sin un reentrenamiento y una evaluación exhaustivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amais23/so101_smolvla_test_smoke
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/amais23/so101_cube_pouring
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=amais23/so101_cube_pouring
