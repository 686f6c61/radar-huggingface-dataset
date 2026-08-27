# sam-guided-vlas/test

## Resumen

El modelo `sam-guided-vlas/test` es un policy de robótica basado en π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence para la generalización en entornos abiertos. Este checkpoint concreto es un fine-tune del modelo base `lerobot/pi05_base`, entrenado con el framework LeRobot de Hugging Face sobre un dataset propio de demostraciones de manipulación con un robot Panda. El modelo está diseñado para convertir observaciones multimodales (estado del robot y tres cámaras) en comandos de acción de 7 grados de libertad.

La relevancia de este modelo radica en que demuestra el flujo completo de fine-tuning de un VLA de última generación sobre datos específicos de tareas, utilizando herramientas open source como LeRobot. Con 4.143 millones de parámetros y un tamaño de repo de 18.7 GB, es un modelo de tamaño medio que puede ejecutarse en GPUs de consumo con cuantización adecuada. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo hace atractivo para investigación y desarrollo industrial en robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ de Physical Intelligence |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/bf16) |
| Idiomas soportados | no disponible (modelo de control robotico, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un VLA que combina un codificador de visión (procesa tres imágenes de 224×224 píxeles), un codificador de estado (vector de 9 dimensiones) y un decodificador de acciones (vector de 7 dimensiones). La arquitectura exacta interna (número de capas, tipo de atención, etc.) no está documentada en la información disponible, pero se sabe que es una adaptación del modelo π₀.₅ de Physical Intelligence, implementada en el repositorio OpenPI y adaptada por LeRobot.

El entrenamiento se realizó mediante fine-tuning del modelo base `lerobot/pi05_base` sobre un dataset propio (`sam-guided-vlas/train_1_2__no_mask`) que contiene 200 episodios y 30.830 frames a 20 FPS, correspondientes a 20 tareas de manipulación (dispensador de jabón, mermelada, tarro, cereales, bloque de cuchillos, hervidor, pera, patata, boniato, scone, cesta, comida en caja, pastel, lata, hamburguesa, limón, naranja, especia, calabaza, spray). La configuración de entrenamiento incluye 200 pasos, batch size de 16, optimizador AdamW con learning rate 5e-05 y semilla 0. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; es un entrenamiento de imitación supervisada.

## Capacidades

- Generación de acciones de control para robot manipulador: produce un vector de acción de 7 dimensiones (posición y orientación del efector final) a partir de observaciones.
- Percepción multimodal: procesa simultáneamente tres flujos de imagen (vista del agente, cámara en mano y segunda cámara en mano) junto con el estado del robot.
- Ejecución de tareas de manipulación específicas: entrenado para 20 tareas de interacción con objetos cotidianos (abrir, coger, colocar, etc.).
- Generalización a entornos nuevos: al estar basado en π₀.₅, hereda la capacidad de generalizar a situaciones no vistas durante el entrenamiento, aunque el fine-tuning con datos limitados puede reducir esta capacidad.
- Integración con LeRobot: compatible con el ecosistema de herramientas de Hugging Face para entrenamiento, evaluación y despliegue en robots reales.
- No soporta tool calling, agentes conversacionales ni generación de texto; es exclusivamente un policy de control.

## Casos de uso

- Manipulación de objetos en entornos de cocina: el modelo puede ejecutar tareas como coger una lata, abrir un tarro o colocar un objeto en una cesta, gracias a su entrenamiento en 20 tareas de este tipo. Se desplegaría con el comando `lerobot-rollout` sobre un robot Panda equipado con las tres cámaras especificadas.
- Automatización de líneas de picking en almacenes: su capacidad para procesar imágenes de cámara en mano y vista global permite localizar y agarrar objetos en posiciones variables, útil para sistemas de clasificación de productos.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el fine-tuning de VLA sobre datasets pequeños (200 episodios) y comparar estrategias de regularización o aumento de datos.
- Desarrollo de políticas de robot para entornos domésticos: tareas como dispensar jabón o manipular alimentos pueden transferirse a asistentes robóticos en el hogar, aunque requeriría adaptación a otros robots.
- Benchmarking de VLA en hardware real: al ser un modelo abierto con licencia permisiva, permite reproducir experimentos y comparar el rendimiento de π₀.₅ fine-tuneado frente a otros VLA en tareas estandarizadas.
- Prototipado rápido en robótica: gracias a la integración con LeRobot, un equipo puede grabar sus propias demostraciones, fine-tunear este modelo y desplegarlo en cuestión de horas, acelerando el ciclo de desarrollo de aplicaciones robóticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito en tareas reales, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 4.143 millones de parámetros y un tamaño de repo de 18.7 GB (presumiblemente pesos en fp32), la inferencia en precisión completa requeriría al menos 16-20 GB de VRAM. Con cuantización a 8 bits (no confirmada) podría reducirse a ~8-10 GB.
- GPU recomendadas: no hay especificación oficial. Para ejecutar el rollout en tiempo real con tres cámaras, se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080/4090, A100, L4). En GPUs de consumo con 8 GB podría ser posible con cuantización, pero no está verificado.
- Compatibilidad con consumer GPU: probablemente sí, con cuantización y ajustes de resolución de imagen, aunque el modelo no incluye archivos GGUF ni cuantizaciones precalculadas.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, que soporta inferencia en PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Depende del hardware y de la resolución de las cámaras; el modelo procesa imágenes de 224×224, lo que sugiere una latencia moderada en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sam-guided-vlas/test (este) | 4.14B | no disponible | VLA (π₀.₅ fine-tune) | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | VLA (π₀.₅ base) | Apache 2.0 | Hugging Face |
| OpenVLA (openvla/openvla-7b) | 7B | no disponible | VLA (LLaMA-2 + vision) | MIT | Hugging Face |
| RT-2 (Google) | 55B | no disponible | VLA (PaLI-X + PaLM) | no abierto | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a parámetros y licencia. El modelo aquí descrito es un fine-tune específico para un robot Panda, mientras que OpenVLA es un modelo generalista de 7B con licencia MIT. RT-2 no está disponible públicamente.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño (200 episodios, 30.830 frames) para 20 tareas, lo que aumenta el riesgo de sobreajuste y reduce la generalización a variaciones no vistas.
- El modelo está entrenado exclusivamente para el robot Panda y con tres cámaras específicas (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`). No funcionará con otros robots o configuraciones de cámara sin reentrenamiento.
- No hay resultados de evaluación publicados; se desconoce la tasa de éxito real en las tareas objetivo.
- Al ser un fine-tune de π₀.₅, puede heredar sesgos del modelo base, aunque no se han documentado sesgos específicos para este checkpoint.
- Riesgo de alucinación en acciones: como todo modelo de imitación, puede generar comandos de acción inconsistentes con la observación si se enfrenta a situaciones fuera de la distribución de entrenamiento.
- Limitaciones de contexto: al ser un modelo de control, no procesa lenguaje natural ni mantiene memoria de episodios largos; cada paso de control es independiente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base π₀.₅ de Physical Intelligence puede tener términos adicionales; se recomienda revisar la documentación de OpenPI.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento reciente sin validación comunitaria.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sam-guided-vlas/test)
- [Perfil del autor en Hugging Face](https://huggingface.co/sam-guided-vlas)
- [Dataset de entrenamiento](https://huggingface.co/datasets/sam-guided-vlas/train_1_2__no_mask)
- [Modelo base lerobot/pi05_base](https://huggingface.co/lerobot/pi05_base)
- [Blog de Physical Intelligence sobre π₀.₅](https://www.physicalintelligence.company/blog/pi05)
- [Documentación de LeRobot para pi05](https://huggingface.co/docs/lerobot/main/en/pi05)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Survey de VLA para robótica](https://vla-survey.github.io/)
