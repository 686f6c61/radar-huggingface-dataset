# hwi12/put_redblock_into_cup_90ep_full

## Resumen

Este modelo es un fine-tuning del modelo fundacional de robótica π₀ (Pi0) de Physical Intelligence, adaptado por el usuario hwi12 para una tarea concreta de manipulación: recoger un bloque rojo y colocarlo en un vaso de papel. Se trata de una política Vision-Language-Action (VLA) que recibe imágenes de dos cámaras (lateral y de muñeca) junto con el estado del robot, y genera comandos de acción de 6 grados de libertad. El entrenamiento se realizó con el framework LeRobot de Hugging Face, partiendo del checkpoint base `lerobot/pi0_base`, y está publicado bajo licencia Apache 2.0.

El modelo está pensado para ser ejecutado en un robot tipo `so_follower` (probablemente un brazo robótico de bajo coste) y ha sido entrenado con 85 episodios y más de 26.500 fotogramas a 30 FPS. Aunque su alcance es muy específico, demuestra el flujo completo de fine-tuning de un VLA de 4.000 millones de parámetros con datos propios, algo relevante para la comunidad de robótica de código abierto que busca replicar estos sistemas sin depender de infraestructuras propietarias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0 (Vision-Language-Action, basada en transformer, adaptación de OpenPI) |
| Parametros totales | 4.028.019.472 (≈4,03 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo procesa instrucciones en inglés, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, π₀ (Pi0), es un VLA generalista desarrollado por Physical Intelligence que combina un codificador de visión, un modelo de lenguaje y un decodificador de acciones. La implementación de LeRobot se adapta del repositorio OpenPI. En este caso, el fine-tuning se realizó sobre el checkpoint `lerobot/pi0_base` con el objetivo de especializarlo en una única tarea de manipulación: "Pick up the red block and put it into the paper cup".

El entrenamiento se llevó a cabo con el framework LeRobot (versión 0.6.1) durante 3000 pasos, con un tamaño de lote de 4, optimizador AdamW y una tasa de aprendizaje de 2,5e-5. El dataset de entrenamiento contiene 85 episodios y 26.556 fotogramas a 30 FPS, con observaciones de dos cámaras (lateral y de muñeca) y el estado del robot (6 dimensiones). No se aplicaron técnicas de RLHF ni DPO; se trata de un aprendizaje por imitación supervisada. No se dispone de información sobre la composición del dataset más allá de la tarea indicada.

## Capacidades

- Control de un robot tipo `so_follower` (brazo robótico) mediante comandos de acción de 6 grados de libertad.
- Procesamiento de imágenes de dos cámaras (lateral y de muñeca) con resolución 480×640 píxeles.
- Interpretación de una instrucción en lenguaje natural fija: "Pick up the red block and put it into the paper cup".
- Generación de acciones en bucle cerrado (closed-loop) durante la ejecución, con soporte de inferencia continua.
- Integración nativa con el ecosistema LeRobot: permite ejecutar el modelo con `lerobot-rollout` y reentrenar con `lerobot-train`.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni generación de texto libre; su función es exclusivamente robótica.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo puede ejecutar la tarea de recoger un bloque rojo y depositarlo en un vaso, sirviendo como banco de pruebas para validar políticas VLA en hardware real.
- Investigación en aprendizaje por imitación: dado que el entrenamiento es reproducible con LeRobot, es útil para estudiar el efecto del número de episodios, la tasa de aprendizaje o la arquitectura en tareas de manipulación.
- Desarrollo de prototipos de robótica asistida: un investigador puede cargar este modelo en un robot `so_follower` y verificar rápidamente si la política generaliza a nuevas posiciones del bloque o del vaso, aunque no esté garantizado.
- Educación en robótica y VLA: sirve como ejemplo práctico de fine-tuning de un modelo fundacional de 4B parámetros con un dataset propio, documentado paso a paso en la guía de LeRobot.
- Benchmarking de hardware robótico: al ser un modelo pequeño (en comparación con otros VLA), permite medir latencia y consumo de recursos en GPUs de gama media, útil para seleccionar plataformas de despliegue.
- Base para nuevos fine-tunings: se puede partir de este checkpoint para adaptarlo a tareas similares (por ejemplo, cambiar el objeto o el contenedor) con un número reducido de episodios adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real. No se dispone de métricas de éxito, tasa de acierto ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: el modelo tiene ~4.03B parámetros. En precisión FP32 ocuparía unos 16 GB, pero es probable que se pueda cargar en FP16 con ~8 GB y en cuantizaciones de 8 bits con ~4-5 GB. No se han publicado cuantizaciones específicas.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060/4060, RTX 2080) podría ser suficiente para inferencia en FP16. Para entrenamiento, se necesitaría más memoria (probablemente 16-24 GB, como una RTX 3090 o A5000).
- Compatibilidad con GPUs de consumo: sí, es factible en GPUs de gama media-alta, aunque no se han reportado pruebas oficiales.
- Opciones de despliegue: el modelo está integrado en LeRobot, por lo que se ejecuta mediante `lerobot-rollout`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI; estos no son aplicables a un modelo de robótica.
- Latencia y throughput: no disponibles. Dependerá de la GPU, del tamaño de lote y de la resolución de las imágenes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hwi12/put_redblock_into_cup_90ep_full | 4.03B | no disponible | Pick-and-place específico | Apache 2.0 | Hugging Face |
| lerobot/pi0_base | ~4B (no confirmado) | no disponible | Generalista (VLA) | Apache 2.0 | Hugging Face |
| OpenVLA (openvla/openvla-7b) | 7B | no disponible | Generalista (VLA) | MIT | Hugging Face |
| RT-2 (Google) | 55B | no disponible | Generalista (VLA) | Propietaria | No abierto |

La comparativa es limitada porque no se dispone de datos de rendimiento del modelo evaluado. Frente a su base, este modelo está especializado en una tarea concreta, lo que puede mejorar el rendimiento en esa tarea a costa de perder generalidad. OpenVLA es una alternativa abierta con más parámetros, pero no hay datos comparativos con este fine-tuning.

## Limitaciones y advertencias

- Es un modelo altamente especializado: solo ha sido entrenado para una tarea concreta (recoger bloque rojo y ponerlo en vaso). No generaliza a otras tareas u objetos sin un nuevo fine-tuning.
- No se han reportado resultados de evaluación en robot real; se desconoce su tasa de éxito real y su robustez ante variaciones de iluminación, posición o distracciones.
- El dataset de entrenamiento es pequeño (85 episodios), lo que puede limitar la generalización y aumentar el riesgo de sobreajuste.
- Depende del hardware específico (robot `so_follower` y cámaras con las mismas características). Cambios en la configuración de cámaras o en el robot pueden degradar el rendimiento.
- No se proporcionan detalles sobre sesgos o alucinaciones, pero al ser un modelo de control robótico, los errores pueden traducirse en movimientos no deseados; se recomienda supervisión humana en entornos reales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales; se debe verificar la licencia de `lerobot/pi0_base` y del código de OpenPI.
- No se han publicado cuantizaciones ni soporte para frameworks de inferencia de propósito general; su uso está ligado al ecosistema LeRobot.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/hwi12/put_redblock_into_cup_90ep_full)
- [Dataset de entrenamiento](https://huggingface.co/datasets/hwi12/put_redblock_into_cup_90ep)
- [Modelo base lerobot/pi0_base](https://huggingface.co/lerobot/pi0_base)
- [Blog de Physical Intelligence sobre Pi0](https://www.physicalintelligence.company/blog/pi0)
- [Documentación de LeRobot sobre pi0](https://huggingface.co/docs/lerobot/main/en/pi0)
- [Repositorio LeRobot en GitHub](https://github.com/huggingface/lerobot)
