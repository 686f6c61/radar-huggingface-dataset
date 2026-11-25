# amais23/so101_molmoact2_cube_pouring_trimmed

## Resumen

`amais23/so101_molmoact2_cube_pouring_trimmed` es una política de robótica entrenada mediante aprendizaje por imitación sobre el modelo fundacional MolmoAct2, desarrollado por el Allen Institute for AI (Ai2). MolmoAct2 mapea imágenes de cámara e instrucciones en lenguaje natural a secuencias de acciones motoras (action chunks), y esta ficha concreta es una especialización para el robot `so_follower` (SO-101) en una única tarea: verter un cubo de una taza de origen a una taza de destino.

El modelo tiene 5.442.196.272 parámetros (aproximadamente 5,4 mil millones) según los pesos en safetensors del repositorio, y se distribuye con licencia Apache 2.0. Los pesos ocupan un repositorio de 158,3 GB, lo que sugiere que se almacenan en precisión completa (fp32 o similar) junto con los checkpoints de entrenamiento. La implementación utilizada es la de LeRobot (versión 0.6.1), la librería de Hugging Face para robótica en PyTorch.

La relevancia de esta ficha es doble: por un lado, demuestra el flujo completo de LeRobot para especializar un modelo fundacional de robótica en una tarea concreta con solo 100 episodios de demostración; por otro, sirve como ejemplo reproducible de entrenamiento de políticas visuomotoras con dos cámaras (frontal y de muñeca) y estado propioceptivo de 6 dimensiones. No obstante, el autor no ha publicado resultados de evaluación en robot real, por lo que su rendimiento efectivo no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MolmoAct2 (modelo fundacional visuomotor de Ai2, implementado en LeRobot) |
| Parametros totales | 5.442.196.272 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en lenguaje natural, pero no se especifican idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La política se basa en MolmoAct2, un modelo fundacional de robótica de Ai2 que transforma observaciones visuales (imágenes de cámara) e instrucciones textuales en chunks de acciones. La implementación concreta es la de LeRobot, que soporta entrenamiento y evaluación del modelo MolmoAct2 estándar. La política consume `observation.state` (vector de 6 dimensiones), dos flujos visuales de 3×480×640 píxeles (cámaras `front` y `wrist`) y produce un vector de acción de 6 dimensiones. El robot objetivo es `so_follower` (SO-101).

El entrenamiento se realizó por imitación supervisada sobre el dataset `amais23/so101_cube_pouring_trimmed`, compuesto por 100 episodios y 53.223 fotogramas a 30 FPS de la tarea "Pour the cube from the source cup into the target cup". La configuración fue de 12.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-5 y semilla 1000, con LeRobot 0.6.1. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un ajuste fino de una política fundacional sobre un dataset reducido y específico.

## Capacidades

- Control visuomotor de un brazo robótico SO-101 (`so_follower`) a partir de dos cámaras (frontal y de muñeca) y estado propioceptivo de 6 dimensiones.
- Ejecución de la tarea específica "verter el cubo de la taza de origen a la taza de destino" mediante chunks de acción.
- Condicionamiento por instrucción en lenguaje natural (la tarea se pasa como texto al ejecutar la política).
- Integración con el ecosistema LeRobot para rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`).
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito; es una política robótica especializada, no un modelo de lenguaje general.

## Casos de uso

- Manipulación de vertido en laboratorio: reproducción de la tarea de verter un cubo entre tazas sobre un SO-101, útil como banco de pruebas de aprendizaje por imitación con dos cámaras y estado de 6 dimensiones.
- Base para ajuste fino en tareas de manipulación similares: el flujo `lerobot-train` permite reentrenar la política con un dataset propio de pocos cientos de episodios, reutilizando el modelo fundacional MolmoAct2.
- Investigación en políticas visuomotoras: comparación de estrategias de imitación sobre un modelo fundacional de 5,4 mil millones de parámetros frente a políticas más pequeñas.
- Docencia y reproducibilidad: ejemplo completo y versionado (dataset, configuración y pesos) para enseñar el ciclo grabación-entrenamiento-despliegue en LeRobot.
- Evaluación de robustez: al disponer de cámaras frontal y de muñeca, permite estudiar el efecto de oclusiones o cambios de iluminación en tareas de vertido.
- Prototipado de automatización de laboratorio: punto de partida para tareas de trasvase de materiales en entornos controlados, siempre que se valide el éxito real antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 5,44 mil millones de parámetros, en fp16 serían necesarios aproximadamente 11 GB solo para pesos, más activaciones y memoria de las dos cámaras a 480×640; en fp32, unos 22 GB solo para pesos.
- GPU recomendadas: no disponible en la documentación. Por tamaño, una GPU con 24 GB o más (RTX 4090, A100, H100) es un punto de partida razonable, pero no está confirmado por el autor.
- ¿Cabe en GPU de consumo? Probablemente en tarjetas de 24 GB en fp16, pero no está verificado ni documentado.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para entrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según el dataset, pero no se especifica la latencia real de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_molmoact2_cube_pouring_trimmed | 5.442.196.272 | no disponible | Vertido de cubo con SO-101 | Apache 2.0 | Hugging Face (LeRobot) |
| MolmoAct2 (modelo base, Ai2) | no disponible en esta ficha | no disponible | Política fundacional de robótica | no disponible en esta ficha | Blog de Ai2 y LeRobot |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible en esta ficha | no disponible | Manipulación general | habitualmente Apache 2.0 | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea "verter el cubo de la taza de origen a la taza de destino" con un robot SO-101 concreto; no es un modelo general.
- Sin evaluación publicada: no hay resultados de éxito en robot real, por lo que se desconoce su fiabilidad y robustez.
- Dataset pequeño: 100 episodios y 53.223 fotogramas pueden provocar sobreajuste a posiciones, iluminación y objetos concretos del entorno de grabación.
- Dependencia del hardware: requiere las cámaras `front` y `wrist` con los nombres e índices exactos usados en el entrenamiento; un cambio de calibración o de montaje puede degradar el comportamiento.
- Riesgo de alucinación motora: como toda política de imitación, puede generar acciones fuera de distribución ante situaciones no vistas, con riesgo físico para el robot y el entorno.
- Sesgos: no documentados; al entrenarse con un único operador y entorno, puede heredar sesgos de las demostraciones.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base MolmoAct2 y sus condiciones deben verificarse por separado antes de un despliegue en producción.
- Idiomas: no se especifican; las instrucciones de tarea se pasan en texto, pero no hay garantía de comportamiento multilingüe.
- Repositorio de 158,3 GB: el almacenamiento y la descarga requieren planificación de infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amais23/so101_molmoact2_cube_pouring_trimmed
- Dataset de entrenamiento: https://huggingface.co/datasets/amais23/so101_cube_pouring_trimmed
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=amais23/so101_cube_pouring_trimmed
- Blog de MolmoAct2 (Ai2): https://allenai.org/blog/molmoact2
- Guía de LeRobot para MolmoAct2: https://huggingface.co/docs/lerobot/main/en/molmoact2
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
