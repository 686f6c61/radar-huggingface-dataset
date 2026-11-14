# felsager/pi05_cube2cross_v2_all_bf16_s1

## Resumen

π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, diseñado para la generalización en entornos abiertos en robótica. Esta ficha concreta corresponde a un fine-tuning del modelo base `lerobot/pi05_base`, publicado por el usuario `felsager` en Hugging Face, orientado a una tarea específica de manipulación con un brazo robótico UR5e equipado con mano. El modelo resuelve el problema de mapear observaciones visuales y de estado del robot directamente a comandos de acción de 10 dimensiones, sin necesidad de planificación explícita.

El modelo tiene 4.143.404.816 parámetros totales (aproximadamente 4,14 mil millones) y se distribuye en formato safetensors con pesos en bfloat16, con un tamaño de repositorio de 50,4 GB. Se integra en el ecosistema LeRobot (versión 0.6.2) y está pensado para ejecutarse mediante la CLI `lerobot-rollout` sobre hardware robótico real.

La relevancia de esta ficha es limitada pero concreta: se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la consulta, sin resultados de evaluación publicados, entrenado sobre un dataset propio de 1000 episodios para cuatro tareas de pick-and-place. Es útil como ejemplo de flujo de trabajo de imitación con LeRobot y como punto de partida para quien quiera reproducir o adaptar el pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), adaptación LeRobot del repositorio OpenPI de Physical Intelligence |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (bfloat16) |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | ur5e_hand_e |
| Camaras | top, wrist |
| Entrada observacion.state | STATE, shape (10,) |
| Entrada observation.images.top | VISUAL, shape (3, 480, 640) |
| Entrada observation.images.wrist | VISUAL, shape (3, 480, 640) |
| Salida action | ACTION, shape (10,) |
| Libreria | lerobot 0.6.2 |
| Tamano del repositorio | 50,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un modelo VLA π₀.₅ (Pi05), evolución de π₀ de Physical Intelligence, orientada a la generalización a entornos y situaciones no vistas durante el entrenamiento. La implementación utilizada es la adaptación de LeRobot del repositorio OpenPI de código abierto de Physical Intelligence. El modelo consume dos flujos visuales (cámara superior y cámara en la muñeca, ambas a 480x640 píxeles y 3 canales) junto con un vector de estado del robot de 10 dimensiones, y produce directamente un vector de acción de 10 dimensiones. No se dispone de detalles adicionales sobre el número de capas, mecanismo de atención o innovaciones internas en la información proporcionada.

El fine-tuning se realizó sobre el dataset `felsager/vla_cubes_cross_v2`, compuesto por 1000 episodios y 493.474 fotogramas a 30 FPS, con cuatro tareas de tipo pick-and-place: coger un cubo (azul, verde, amarillo o rojo) y colocarlo sobre una cruz roja. La configuración de entrenamiento fue de 30.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05 y semilla 1. No se especifica en la información disponible si hubo RLHF, DPO ni la composición exacta del dataset más allá de los episodios y tareas indicados.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 10 dimensiones para un UR5e con mano a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente imágenes de cámara superior y de muñeca a 480x640.
- Ejecución de tareas de pick-and-place condicionadas por instrucción en lenguaje natural (cuatro tareas de cubo a cruz).
- Generalización a entornos abiertos: según la descripción del modelo base, π₀.₅ está diseñado para generalizar a situaciones no vistas durante el entrenamiento.
- Ejecución en bucle cerrado sobre robot real mediante `lerobot-rollout`.
- No se dispone de información sobre soporte de tool calling, function calling, razonamiento multi-paso, capacidades multilingües, modo thinking, audio u otras capacidades generales de lenguaje.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta las cuatro tareas de coger un cubo de color y colocarlo sobre una cruz roja, adecuado para experimentos de imitación con UR5e y dos cámaras.
- Reproducción de pipelines de imitación con LeRobot: sirve como referencia de fine-tuning de `lerobot/pi05_base` sobre un dataset propio, con configuración de entrenamiento documentada (30.000 pasos, batch 16, lr 5e-05).
- Evaluación de generalización visual: al entrenarse con cámaras superior y de muñeca, permite estudiar cómo afectan cambios de iluminación, posición de objetos o distractores a la tasa de éxito (aunque no hay resultados publicados).
- Base para transferencia a otras tareas de manipulación: al partir de π₀.₅, puede reentrenarse sobre nuevos datasets de imitación para tareas distintas dentro del mismo hardware.
- Docencia y formación en VLA: ejemplo completo y reproducible de un checkpoint VLA con instrucciones de ejecución y entrenamiento en la model card.
- Prototipado de control por lenguaje natural: la tarea se especifica mediante una frase (`--task="pick up the blue cube and place it on the red cross."`), lo que facilita integrar el modelo en interfaces de instrucción en lenguaje natural.
- Investigación en robustez de políticas: el checkpoint permite medir la sensibilidad a la posición inicial, el tipo de cubo y la cámara usada, aunque sin métricas publicadas de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y deja la tabla de evaluación vacía.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4,14 mil millones de parámetros en bfloat16, los pesos ocupan aproximadamente 8,3 GB, a lo que hay que sumar activaciones y buffers de imagen (dos flujos de 3x480x640).
- GPU recomendadas: no especificadas en la información proporcionada. Por tamaño de pesos, una GPU con 16 GB o más de VRAM debería poder alojar los pesos en bf16; no se confirma en la documentación.
- Cabe en GPU de consumo: probablemente sí en modelos con 16-24 GB (por ejemplo, RTX 4090), aunque no está confirmado en la información disponible.
- Opciones de despliegue: CLI `lerobot-rollout` con `--strategy.type=base` y `--policy.path=felsager/pi05_cube2cross_v2_all_bf16_s1`; entrenamiento con `lerobot-train` y `--policy.device=cuda`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El dataset de entrenamiento está a 30 FPS, pero no se indica la frecuencia de inferencia alcanzable.
- Requisitos adicionales: robot UR5e con mano, dos cámaras (top y wrist) configuradas a 640x480 y 30 FPS, y puerto de robot específico de la máquina.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_v2_all_bf16_s1 | 4,14 B | no disponible | VLA pick-and-place (UR5e) | gemma | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible | no disponible | VLA base π₀.₅ | no disponible | Hugging Face (modelo base) |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA predecesor | no disponible | Repositorio OpenPI |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay tasa de éxito ni métricas de robustez, por lo que no se puede valorar su fiabilidad en producción.
- Especialización estrecha: entrenado únicamente para cuatro tareas de pick-and-place de cubos sobre una cruz roja con un UR5e; no se espera que generalice a otras tareas sin reentrenamiento.
- Dependencia de hardware concreto: requiere robot `ur5e_hand_e` y cámaras con nombres `top` y `wrist`; los nombres de cámara deben coincidir con las claves de observación del entrenamiento.
- Licencia `gemma`: impone las condiciones de la licencia Gemma, que pueden restringir ciertos usos comerciales; conviene revisar los términos antes de un despliegue comercial.
- Riesgo de alucinación y fallos de percepción: como política de imitación, puede producir acciones incorrectas ante cambios de iluminación, posición de objetos o distractores; no hay datos publicados sobre esta sensibilidad.
- Idiomas: no se especifican idiomas soportados; las instrucciones de tarea del dataset están en inglés.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso comunitario ni validación externa.
- Tamaño del repositorio de 50,4 GB: requiere espacio de almacenamiento y ancho de banda considerables para descarga.
- No se documentan sesgos conocidos ni limitaciones de contexto en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_v2_all_bf16_s1
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
