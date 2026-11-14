# felsager/pi05_cube2cross_v2_all_trtc

## Resumen

π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, disenado para la generalización en entornos abiertos en robótica. Este repositorio concreto, `felsager/pi05_cube2cross_v2_all_trtc`, es un fine-tuning del modelo base `lerobot/pi05_base` realizado por el usuario felsager mediante LeRobot, orientado a una tarea específica de manipulación: coger un cubo de color y colocarlo sobre una cruz roja.

El modelo consume observaciones del robot (estado de las articulaciones y dos cámaras: superior y de muñeca) y produce acciones de 10 dimensiones para un robot UR5e con pinza. Se ha entrenado sobre un dataset propio de 1000 episodios y 493.474 fotogramas a 30 FPS, con 30.000 pasos de entrenamiento y batch de 16.

Es relevante como ejemplo de cómo el ecosistema LeRobot permite adaptar un VLA de propósito general a una tarea concreta de laboratorio con un coste de entrenamiento acotado, aunque el modelo no incluye evaluación publicada ni métricas de éxito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en π₀.₅ de Physical Intelligence |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas) |
| Licencia | gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/pi05_base`, la implementación en LeRobot de π₀.₅ de Physical Intelligence. π₀.₅ es un modelo VLA que evoluciona π₀ para generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementación de LeRobot está adaptada del repositorio OpenPI de Physical Intelligence. No se dispone de detalles adicionales sobre la arquitectura interna (número de capas, mecanismo de atención, componentes de visión o lenguaje) en la información proporcionada.

El entrenamiento se realizó con 30.000 pasos, batch size de 16, optimizador AdamW, learning rate de 5e-05 y semilla 0, usando LeRobot 0.6.2. El dataset `felsager/vla_cubes_cross_v2` contiene 1000 episodios y 493.474 fotogramas a 30 FPS, con cuatro tareas de recogida y colocación de cubos de colores (azul, verde, amarillo, rojo) sobre una cruz roja. No se indica si hubo RLHF, DPO u otras fases de alineación.

## Capacidades

- Generación de acciones robóticas de 10 dimensiones para un robot UR5e con pinza (`ur5e_hand_e`).
- Percepción visual mediante dos cámaras: `top` y `wrist`, con resolución de 480x640 y 3 canales.
- Procesamiento del estado de las articulaciones del robot (vector de 10 dimensiones).
- Ejecución de tareas de manipulación guiadas por instrucción en lenguaje natural: recoger un cubo de color y colocarlo sobre una cruz roja.
- Generalización a las cuatro variantes de color del cubo (azul, verde, amarillo, rojo) presentes en el dataset de entrenamiento.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo ejecuta la tarea de coger un cubo de color y depositarlo sobre una cruz roja, adecuado para experimentos de imitación con un UR5e y dos cámaras.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la adaptación de VLA de propósito general a tareas concretas con datasets pequeños (1000 episodios).
- Benchmark de fine-tuning con LeRobot: permite reproducir el flujo `lerobot-train` y `lerobot-rollout` sobre un caso real y medir tiempos y requisitos.
- Docencia y formación en robótica: ejemplo completo de pipeline de datos, entrenamiento y despliegue en un robot industrial de laboratorio.
- Pruebas de robustez visual: al depender de dos cámaras (superior y muñeca), permite evaluar el efecto de cambios de iluminación, posiciones de objetos o distracciones en la tasa de éxito.
- Base para ampliación de tareas: al estar fine-tuneado desde `lerobot/pi05_base`, puede servir como inicialización para nuevas tareas de manipulación con el mismo robot y configuración de cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo tiene 4.143.404.816 parámetros; en precisión completa (FP32) requeriría aproximadamente 16,6 GB solo para pesos, y en FP16/BF16 unos 8,3 GB, sin contar activaciones ni memoria de las cámaras.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de pesos, una GPU con 16 GB o más podría alojar el modelo en FP16, pero no se ha verificado.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), tal como se documenta en la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, pero no se indica la frecuencia de inferencia alcanzada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_v2_all_trtc | 4.143.404.816 | no disponible | VLA para UR5e, pick-and-place de cubos | gemma | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible | no disponible | VLA base de propósito general | no disponible | Hugging Face |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA de propósito general | no disponible | OpenPI |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real en robot.
- El modelo está entrenado para una tarea muy concreta (cuatro variantes de color de cubo sobre una cruz roja) y un robot específico (`ur5e_hand_e`); no se espera generalización fuera de ese dominio.
- Depende de la configuración exacta de cámaras (`top` y `wrist`) y de sus nombres; un cambio de montaje o resolución puede degradar el rendimiento.
- Licencia `gemma`: conviene revisar los términos de la licencia Gemma antes de un uso comercial, ya que impone condiciones específicas.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un modelo de acción, el riesgo se traduce en acciones incorrectas o inseguras en el robot.
- Sin datos sobre idiomas soportados ni capacidades de lenguaje general; no debe usarse como modelo de chat o generación de texto.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (14 de noviembre de 2026), lo que sugiere que no ha sido validado por la comunidad.
- El tamaño del repo es de 42,6 GB, lo que implica requisitos de almacenamiento considerables para su descarga y despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_v2_all_trtc
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
