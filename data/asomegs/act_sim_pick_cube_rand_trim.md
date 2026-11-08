# asomegs/act_sim_pick_cube_rand_trim

## Resumen

`asomegs/act_sim_pick_cube_rand_trim` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv:2304.13705. El modelo ha sido desarrollado por el usuario asomegs y empaquetado con LeRobot 0.7.1, la librería de Hugging Face para aprendizaje por imitación en robótica real y simulada. Su propósito es controlar un brazo robótico para ejecutar la tarea `pick_cube`: recoger un cubo a partir de observaciones visuales y de estado proprioceptivo.

La política consume dos cámaras (`front` y `wrist`) a resolución 128x128 píxeles y un vector de estado de 18 dimensiones, y produce una acción de 4 dimensiones por paso. El modelo tiene 51.586.692 parámetros, un tamaño de repositorio de 0,2 GB y se distribuye en formato safetensors. Está entrenado sobre un conjunto de datos simulado muy reducido (22 episodios, 687 fotogramas a 10 FPS), lo que lo convierte en un artefacto de experimentación más que en una política lista para producción.

Su relevancia es acotada: sirve como ejemplo reproducible de entrenamiento ACT con LeRobot y como punto de partida para experimentos de manipulación en simulación. No hay resultados de evaluación publicados ni información sobre licencia o idiomas, y las descargas y likes son cero en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.586.692 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea es `pick_cube`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Entradas | `observation.images.front` (3, 128, 128), `observation.images.wrist` (3, 128, 128), `observation.state` (18,) |
| Salidas | `action` (4,) |
| Cámaras | `front`, `wrist` |
| Dataset de entrenamiento | asomegs/sim_pick_cube_kb_rand_trim (22 episodios, 687 fotogramas, 10 FPS) |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.1 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición y mejora la estabilidad del control. La arquitectura combina un codificador de imágenes (para las dos vistas `front` y `wrist` a 128x128) con un transformer que fusiona las observaciones visuales y el vector de estado de 18 dimensiones, y un decodificador que emite acciones de 4 dimensiones. El modelo se entrenó con 20.000 pasos, batch size 8, optimizador AdamW y learning rate 1e-05, con semilla 1000, usando LeRobot 0.7.1.

El entrenamiento se realizó sobre el dataset `asomegs/sim_pick_cube_kb_rand_trim`, compuesto por 22 episodios y 687 fotogramas a 10 FPS, todos ellos de la tarea `pick_cube` en simulación. Se trata de un volumen de datos muy pequeño, insuficiente para generalización robusta a variaciones de posición, iluminación o distractores. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; es aprendizaje supervisado puro a partir de demostraciones teleoperadas. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico de manipulación para la tarea `pick_cube` a partir de dos cámaras y estado proprioceptivo.
- Predicción de chunks de acción de 4 dimensiones, adecuada para control continuo de un brazo robótico.
- Fusión multimodal de dos vistas visuales (frontal y de muñeca) con un vector de estado de 18 dimensiones.
- Ejecución autónoma mediante `lerobot-rollout` con la estrategia `base`.
- Entrenamiento reproducible con `lerobot-train` y el tipo de política `act`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control motor.

## Casos de uso

- Reproducción de experimentos ACT en simulación: el modelo sirve para validar el pipeline de LeRobot 0.7.1 con una política ya entrenada y un dataset público pequeño, útil para comparar configuraciones de entrenamiento.
- Base para fine-tuning en tareas de pick-and-place: al estar entrenado en `pick_cube`, puede adaptarse con pocos episodios adicionales a variantes como recoger otros objetos o posiciones, usando `lerobot-train` con `--policy.type=act`.
- Docencia y formación en aprendizaje por imitación: permite mostrar de extremo a extremo cómo se graba un dataset, se entrena una política y se ejecuta en un robot o simulador.
- Pruebas de integración de hardware: el script `lerobot-rollout` documentado permite conectar cámaras OpenCV y un robot real o simulado para verificar calibración y frecuencias.
- Benchmark interno de infraestructura: con 51,6 M de parámetros y 0,2 GB, es ligero y adecuado para medir latencia de inferencia en GPUs de gama baja o incluso CPU.
- Generación de trayectorias sintéticas para aumento de datos: las predicciones de chunks de acción pueden usarse como referencia para comparar con políticas entrenadas en datasets mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,6 M de parámetros, más el coste de los dos codificadores visuales a 128x128; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque las de gama alta están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles; dependen del robot, las cámaras y la frecuencia de control (el dataset se grabó a 10 FPS).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| asomegs/act_sim_pick_cube_rand_trim | 51.586.692 | 2 cámaras 128x128 + estado (18,) | pick_cube | no disponible | Hugging Face, 0 descargas |
| asomegs/act_sim_pick_cube_rand | no disponible | no disponible | pick_cube | no disponible | Hugging Face |
| Aneysait/act_pick_cube | no disponible | no disponible | pick_cube | no disponible | Hugging Face |

Los dos modelos comparables encontrados en la búsqueda web son políticas ACT de la misma familia y tarea, pero no se dispone de sus especificaciones detalladas, resultados de evaluación ni licencia, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 22 episodios y 687 fotogramas, insuficiente para generalizar a variaciones de posición, iluminación, distractores u objetos distintos.
- Sin resultados de evaluación publicados: no hay tasa de éxito medida, ni en simulación ni en robot real.
- Entrenado en simulación: el transfer a un robot físico no está validado y puede requerir recalibración o fine-tuning.
- Licencia no especificada: no se puede asumir uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Sin información sobre sesgos: al ser una política de control, los sesgos se manifiestan como sesgos de comportamiento (posiciones preferidas, velocidades), no documentados.
- Riesgo de sobreajuste al entorno de entrenamiento y a la configuración exacta de cámaras (`front`, `wrist`) y del robot.
- Dependencia de la versión de LeRobot 0.7.1: cambios de API en versiones posteriores pueden romper la ejecución.
- No apto para tareas fuera de `pick_cube` sin reentrenamiento; no es un modelo de propósito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asomegs/act_sim_pick_cube_rand_trim
- Dataset de entrenamiento: https://huggingface.co/datasets/asomegs/sim_pick_cube_kb_rand_trim
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=asomegs/sim_pick_cube_kb_rand_trim
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Modelo relacionado: https://huggingface.co/asomegs/act_sim_pick_cube_rand
- Modelo relacionado: https://huggingface.co/Aneysait/act_pick_cube
