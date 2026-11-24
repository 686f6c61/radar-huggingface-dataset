# charlilou/act_Session_boite_1_2_3_4_5_6_7_1124

## Resumen

`act_Session_boite_1_2_3_4_5_6_7_1124` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. El modelo lo ha desarrollado el usuario `charlilou` y se ha entrenado y publicado en el Hub mediante LeRobot, la librería de aprendizaje automático para robótica real de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que mapea observaciones (estado de las articulaciones e imágenes de dos cámaras) a comandos de acción de un robot manipulador.

El modelo resuelve una tarea concreta de manipulación: introducir un objeto bajo una de siete cajas numeradas ("Entraînement sous boîte 1" a "boîte 7", en francés). Se ha entrenado con 105 episodios teleoperados y 24.792 fotogramas a 30 FPS capturados con un robot `so_follower` y dos cámaras (`top` y `wrist`). Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo pequeño que cabe holgadamente en una GPU de consumo.

Su relevancia es la de un ejemplo práctico y reproducible de imitation learning de extremo a extremo con LeRobot: cualquiera con el hardware adecuado puede desplegarlo con un único comando `lerobot-rollout` o reentrenar la receta con `lerobot-train`. No obstante, se trata de una política específica de tarea y de robot, sin evaluación publicada y sin licencia declarada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación definida por la arquitectura ACT, no documentada en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las tareas están etiquetadas en francés; no es un modelo lingüístico) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que predice chunks cortos de acciones en lugar de pasos individuales, lo que reduce el error de composición y suele alcanzar tasas de éxito altas con datos teleoperados. La política consume `observation.state` con forma `(6,)` y dos imágenes RGB de `(3, 480, 640)` procedentes de las cámaras `top` y `wrist`, y produce una acción de forma `(6,)`. El modelo se ha entrenado con LeRobot 0.7.1 sobre el dataset `charlilou/Session_boite_1_2_3_4_5_6_7`.

La configuración de entrenamiento documentada es: 9.300 pasos, batch size 16, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se detalla en la información disponible el número total de tokens, la composición exacta del dataset más allá de los 105 episodios y 24.792 fotogramas a 30 FPS, ni si se aplicaron técnicas de RLHF o DPO (no procede en este tipo de política). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control visuomotor de un robot manipulador `so_follower` a partir de dos cámaras (`top` y `wrist`) y del estado de las articulaciones.
- Predicción de chunks de acciones de 6 dimensiones, orientada a tareas de manipulación de precisión.
- Ejecución de siete tareas de colocación de objetos bajo cajas numeradas (boîte 1 a boîte 7).
- Despliegue directo con `lerobot-rollout` sobre hardware compatible.
- Reentrenamiento reproducible con `lerobot-train` usando la misma receta.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión general, audio ni modos de pensamiento: es una política robótica específica, no un modelo de propósito general.

## Casos de uso

- Automatización de una celda de pick-and-place: la política ejecuta la secuencia de colocar un objeto bajo una caja concreta, adecuada para prototipos de manipulación repetitiva en laboratorio.
- Investigación en imitation learning: sirve como referencia reproducible para comparar recetas ACT con otras políticas de LeRobot sobre el mismo dataset.
- Benchmarking de hardware robótico: al ser un modelo pequeño (51,7 M de parámetros), permite medir latencia y throughput de inferencia en distintas GPUs y configuraciones de cámara.
- Docencia y formación: ejemplo completo de flujo teleoperación → dataset → entrenamiento → despliegue con LeRobot.
- Pruebas de generalización de políticas visuomotoras: útil para evaluar cómo se comporta una política entrenada con 105 episodios ante cambios de iluminación, posición de objetos o distracciones.
- Base para fine-tuning: punto de partida para adaptar la política a variantes de la tarea (otras cajas, otros objetos) con datos adicionales.
- Validación de pipelines de datos: el dataset asociado (24.792 fotogramas, 30 FPS) permite probar herramientas de visualización y curación de datos de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en precisión completa (fp32) el peso ronda los 0,2 GB, por lo que la VRAM necesaria es muy reducida y dominada por los buffers de las dos cámaras a 480×640.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; no se especifican modelos concretos en la documentación.
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño del modelo y del repositorio (0,2 GB).
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) y `lerobot-train` para reentrenamiento; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; dependen del robot, las cámaras y la GPU, y no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `charlilou/act_Session_boite_1_2_3_4_5_6_7_1124` (ACT) | 51.668.614 | no aplica | sin evaluación publicada | no disponible | Hugging Face Hub |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | no disponible | no disponible | Hugging Face Hub / docs LeRobot |
| Políticas Diffusion Policy en LeRobot | no disponible | no aplica | no disponible | no disponible | Hugging Face Hub / docs LeRobot |
| Políticas SmolVLA en LeRobot | no disponible | no aplica | no disponible | no disponible | Hugging Face Hub / docs LeRobot |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada; la comparación se limita a la categoría (políticas de imitation learning para robótica real dentro del ecosistema LeRobot).

## Limitaciones y advertencias

- Política específica de tarea y de robot (`so_follower`): no es un modelo de propósito general y no se espera que funcione fuera de las siete tareas entrenadas.
- Sin evaluación publicada: no hay tasas de éxito medidas, por lo que el rendimiento real es desconocido.
- Licencia no declarada: la model card indica "More Information Needed", lo que impide confirmar si se permite uso comercial.
- Dataset pequeño (105 episodios, 24.792 fotogramas): riesgo de sobreajuste y de baja generalización ante cambios de iluminación, posición de objetos, distracciones o un robot distinto del mismo tipo.
- Dependencia de dos cámaras con nombres y resoluciones concretas (`top`, `wrist`, 480×640, 30 FPS): un cambio en la configuración de sensores invalida la política.
- Riesgo de alucinación en el sentido de acciones incorrectas o inseguras: como toda política de imitation learning, puede producir comandos erróneos fuera de la distribución de entrenamiento; requiere supervisión y paradas de seguridad en producción.
- Sesgos conocidos: no documentados; al entrenarse con un único operador y un único entorno, puede heredar sesgos de la demostración (posiciones, velocidades, estilo de manipulación).
- Idiomas: las etiquetas de tarea están en francés; no hay soporte multilingüe porque no es un modelo lingüístico.
- Fecha de creación inusual (2026-11-24) en los metadatos del Hub: conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/charlilou/act_Session_boite_1_2_3_4_5_6_7_1124
- Dataset de entrenamiento: https://huggingface.co/datasets/charlilou/Session_boite_1_2_3_4_5_6_7
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=charlilou/Session_boite_1_2_3_4_5_6_7
