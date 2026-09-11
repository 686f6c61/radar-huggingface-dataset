# sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_60k

## Resumen

Este repositorio contiene una politica de vision-lenguaje-accion (VLA) llamada `pi05`, resultado de un ajuste fino (fine-tuning) del modelo base `lerobot/pi05_base` sobre un conjunto de datos de robótica concreto. Lo publica el usuario `sam-guided-vlas` y está pensado para controlar un robot manipulador tipo `Panda` en tareas de recogida y colocación de objetos domésticos. Se distribuye bajo licencia Apache 2.0 y tiene 4.143.404.816 parámetros (~4,14 mil millones), con un repositorio de 9,4 GB en safetensors.

El modelo hereda la arquitectura π₀.₅ de Physical Intelligence, cuyo objetivo es la generalización a entornos y situaciones no vistos durante el entrenamiento. La implementación que se usa aquí es la adaptación de LeRobot, derivada del repositorio OpenPI del autor original. La política consume el estado del robot (vector de 9 dimensiones) junto con tres cámaras RGB de 224×224 y produce un vector de acción de 7 dimensiones.

Es relevante porque muestra un flujo de trabajo de imitación extremo a extremo con LeRobot 0.6.0: 60.000 pasos de entrenamiento, batch de 16 y AdamW con tasa de aprendizaje 5e-5 sobre 200 episodios (69.392 fotogramas a 20 FPS). El repositorio no incluye resultados de evaluación ni benchmarks publicados, y las búsquedas web realizadas no han devuelto información técnica adicional sobre este modelo concreto; por tanto, varios apartados quedan marcados como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (implementación LeRobot/OpenPI); transformer multimodal con experto de acción |
| Parametros totales | 4.143.404.816 (~4,14 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio en safetensors; sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible (modelo de robótica; sin declaración de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

Se trata de una política VLA del linaje π₀.₅ (pi05) de Physical Intelligence, adaptada a LeRobot desde el repositorio OpenPI. La arquitectura es un transformer multimodal que combina un componente de visión-lenguaje con un módulo generador de acciones; no se dispone en la información proporcionada de detalles sobre el número de capas, cabezas de atención, mecanismos de atención (lineal, decodificación especulativa) ni longitud de contexto. Los pesos ocupan 9,4 GB en safetensors y suman 4.143.404.816 parámetros.

El ajuste fino se realizó sobre el conjunto de datos `sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live`, con 200 episodios y 69.392 fotogramas a 20 FPS. La configuración de entrenamiento fue: 60.000 pasos, batch de 16, optimizador AdamW, tasa de aprendizaje 5e-5, semilla 0 y LeRobot 0.6.0. No se indica en la información disponible si hubo RLHF, DPO u otras fases de alineamiento posteriores, ni la composición exacta del dataset más allá de los nombres de tarea. Las tareas de entrenamiento incluyen objetos como "basket", "cake", "can", "cereal", "kettle", "knife block" y otros alimentos y utensilios domésticos.

Las entradas del modelo son `observation.state` (shape `(9,)`), `observation.images.agentview` `(3, 224, 224)`, `observation.images.robot0_eye_in_hand` `(3, 224, 224)` y `observation.images.robot0_eye_in_hand_2` `(3, 224, 224)`. La salida es `action` con shape `(7,)`. No se documentan innovaciones técnicas específicas de esta ejecución concreta (variantes de máscara, blur o cámara adicional quedan reflejadas únicamente en el nombre del dataset).

## Capacidades

- Generación de acciones de control robótico: produce un vector de acción de 7 dimensiones a partir del estado y de tres vistas de cámara.
- Percepción visual multimodal: procesa tres flujos RGB de 224×224, incluyendo vista de agente y dos vistas de muñeca (`eye_in_hand`).
- Manipulación de objetos domésticos: entrenado para tareas de tipo pick-and-place sobre 20 categorías de objetos (alimentos, utensilios, envases).
- Control continuo a frecuencia de control de datos de 20 FPS (las cámaras en ejecución se configuran a 30 FPS en el ejemplo del autor).
- Integración con el ecosistema LeRobot: ejecutable mediante `lerobot-rollout` y reentrenable mediante `lerobot-train`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada (la política genera acciones, no texto razonado).
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible; la única modalidad de salida documentada es acción.

## Casos de uso

- Manipulación robótica en laboratorio: reproducir las tareas de entrenamiento ("basket", "cake", "can", "cereal", "kettle", etc.) sobre un robot `Panda` para validar pipelines de imitación con el estado y tres cámaras descritas.
- Investigación en aprendizaje por imitación: servir como punto de partida para experimentos que comparen variantes de datos (máscara, blur, cámaras adicionales) partiendo de `lerobot/pi05_base`.
- Fine-tuning específico de tarea: reentrenar la política con `lerobot-train --policy.path=lerobot/pi05_base` sobre datasets propios de un solo objeto o entorno para evaluar transferencia.
- Pruebas de generalización a nuevos entornos: usar la herencia de π₀.₅ para medir si la política responde ante posiciones de objeto o iluminación distintas de las del conjunto de entrenamiento.
- Automatización de tareas de picking en entornos simulados con imágenes: aprovechar las tres vistas sincronizadas (`agentview` y dos `eye_in_hand`) para pipelines de visión-acción en simulación.
- Evaluación de despliegue en bucle cerrado: ejecutar `lerobot-rollout` con `--strategy.type=base` para medir estabilidad y tasa de éxito por tarea antes de integrar la política en un sistema mayor.
- Base para comparativas de políticas VLA: utilizar el repositorio como referencia de un ajuste de 60.000 pasos con AdamW y lr 5e-5 frente a otras configuraciones sobre el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política (*"No evaluation results have been provided for this policy yet"*), y no se ha encontrado ningún dato de MMLU, HumanEval, GSM8K ni métricas de éxito robótico en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 4,14 B de parámetros, no confirmado por el autor):
  - bf16/fp16: en torno a 8,3 GB solo de pesos; con activaciones y buffers de visión, del orden de 10-12 GB.
  - fp32: en torno a 16,6 GB solo de pesos.
  - int8: en torno a 4,2 GB (no hay pesos cuantizados publicados).
  - int4: en torno a 2,1 GB (no hay pesos cuantizados publicados).
- GPU recomendadas: no disponibles como recomendación oficial del autor. Por tamaño, cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) en bf16 y en GPUs de centro de datos (A100, H100) para entrenamiento o inferencia con mayor margen.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en bf16 en tarjetas con 16-24 GB de VRAM, siempre que no se requiera un batch grande ni entrenamiento completo.
- Opciones de despliegue: el despliegue previsto es el ecosistema LeRobot (`lerobot-rollout` para ejecución sobre robot y `lerobot-train` para reentrenamiento). No se documentan servidores de inferencia LLM al uso (vLLM, TGI, llama.cpp, Ollama) para este modelo.
- Latencia y throughput estimados: no disponible. Los datos de entrenamiento se registraron a 20 FPS y el ejemplo de ejecución configura cámaras a 30 FPS, pero no se publica latencia ni frecuencia efectiva de control de la política.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sam-guided-vlas/...pi05...steps_60k` (este modelo) | ~4,14 B | no disponible | sin resultados publicados | Apache 2.0 | HuggingFace (0 descargas, 0 likes) |
| `lerobot/pi05_base` (modelo base) | no disponible | no disponible | no disponible | no disponible en la informacion | HuggingFace |
| Otras políticas VLA de la categoría (p. ej. OpenVLA, RDT) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos fiables en la información proporcionada, y las búsquedas web realizadas no han devuelto resultados relevantes (los resultados obtenidos corresponden a una serie de televisión y a un fabricante de mobiliario, sin relación con el modelo). Por tanto, la comparativa numérica queda como "no disponible".

## Limitaciones y advertencias

- Sin resultados de evaluación: no hay tasa de éxito ni validación en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Dataset reducido y específico: 200 episodios y 69.392 fotogramas limitados a 20 categorías de objetos domésticos; es probable que la generalización fuera de esas tareas sea pobre.
- Dependencia del hardware exacto: la política espera un robot `Panda` con las tres cámaras concretas (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) y un `observation.state` de 9 dimensiones; cambiar la configuración de sensores invalida el uso directo.
- Sesgos conocidos: no disponible (no se documentan análisis de sesgo; al ser una política de acciones, los sesgos se manifestarían como fallos sistemáticos en ciertos objetos, posiciones o iluminaciones).
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de acciones incorrectas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto no está disponible y no se declaran idiomas; no es un modelo de lenguaje para uso conversacional.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base `lerobot/pi05_base` y la arquitectura π₀.₅ original pueden tener sus propias condiciones; conviene verificar la licencia del modelo base antes de explotarlo comercialmente.
- Caveats de producción: repositorio con 0 descargas y 0 likes, publicado y actualizado el mismo día, sin demo ni vídeo; no hay garantía de mantenimiento ni soporte.
- Fecha de creación declarada: 2026-09-11 (según los metadatos del repositorio).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi (referenciado en la model card)
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Guía LeRobot de pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Búsqueda web: sin resultados relevantes para este modelo (los resultados obtenidos no guardan relación con la política VLA).
