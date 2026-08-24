# OrderDraconis/groot_align_leo

## Resumen

El modelo `OrderDraconis/groot_align_leo` es un policy de robótica basado en NVIDIA GR00T N1.7, entrenado con la librería LeRobot para ejecutar una tarea concreta de manipulación de tela: alinear una pieza de tela verde sobre una rosa. El autor, OrderDraconis, ha publicado este checkpoint específico para un robot de tipo `bi_so_follower` (doble brazo) con cuatro cámaras, tras entrenarlo sobre un dataset propio de 173 episodios. A diferencia de un modelo de lenguaje, no genera texto ni código: produce acciones de control continuo (12 dimensiones) a partir de observaciones de estado y de imágenes de alta resolución.

La relevancia de este modelo radica en que demuestra el uso de un modelo fundacional de robótica (GR00T N1.7) adaptado mediante fine-tuning a una tarea de precisión en entornos reales. Con 3,14 mil millones de parámetros, emplea una arquitectura de flow-matching para la generación de acciones y un backbone de visión-lenguaje (Cosmos-Reason2/Qwen3-VL) para la percepción. El modelo se distribuye bajo licencia Apache 2.0 y se integra con el ecosistema LeRobot, lo que facilita su despliegue en robots físicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + action transformer con flow-matching) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | No aplica (modelo de robótica, no procesa secuencias de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (entrada multimodal: imagen + estado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en GR00T N1.7 de NVIDIA, un modelo fundacional de robótica de código abierto. La arquitectura combina un backbone de visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa las cuatro cámaras de entrada (cada una con resolución 480x640) y un transformer de acciones con flujo-matching (flow-matching) que genera las acciones de control de 12 dimensiones. El estado del robot (12 valores) se incorpora como condición adicional. Este diseño permite una política multimodal que aprende a correlacionar la percepción visual con el estado propio del robot para producir movimientos precisos.

El entrenamiento se realizó mediante aprendizaje por imitación supervisada sobre el dataset `Janmeier820/align_fabric_dataset_combined`, que contiene 173 episodios y 181 442 fotogramas a 30 FPS. La tarea consistía en colocar una pieza de tela verde sobre una rosa y alinearla perfectamente. Se utilizó el optimizador AdamW con una tasa de aprendizaje de 1e-4, tamaño de lote 16 y 10 000 pasos de entrenamiento. No se menciona el uso de RLHF, DPO ni otros métodos de refuerzo; se trata de un fine-tuning directo del modelo base GR00T N1.7 sobre datos específicos de la tarea.

## Capacidades

- Generación de acciones de control para robots bimanuales (12 dimensiones de acción) a partir de observaciones visuales (4 cámaras) y estado del robot.
- Percepción de imágenes de alta resolución (480x640) en tiempo real.
- Ejecución de una tarea concreta de manipulación de piezas de tela con precisión de alineación.
- Integración con LeRobot para entrenamiento y despliegue en hardware físico.
- Capacidad de generalización limitada a la tarea específica para la que fue entrenado; no posee capacidades de razonamiento general, generación de texto, tool calling ni agentes autónomos.

## Casos de uso

- **Automatización de alineación de piezas textiles en producción**: el modelo puede integrarse en un sistema robótico para alinear automáticamente capas de tela en procesos de ensamblaje, reduciendo el tiempo de ciclo y la variabilidad manual.
- **Investigación en aprendizaje por imitación**: sirve como ejemplo de fine-tuning de GR00T N1.7 para una tarea de precisión, útil para estudiar la adaptación de modelos fundacionales de robótica a dominios específicos.
- **Pruebas de control de robots bimanuales**: permite validar la eficacia del control de dos brazos en entornos con deformables (tela), un caso complejo por la no rigidez del objeto.
- **Prototipado de soluciones de robótica en laboratorio**: investigadores pueden utilizar el modelo como punto de partida para tareas similares de manipulación de objetos deformables, ajustando el dataset de entrenamiento.
- **Demostraciones en entornos educativos**: el modelo puede usarse en cursos de robótica para ilustrar el flujo completo de captura de datos, entrenamiento y despliegue con LeRobot.
- **Desarrollo de aplicaciones de robótica de servicio**: aunque no es un modelo general, su arquitectura puede adaptarse a otras tareas de manipulación fina mediante fine-tuning adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no hay resultados de evaluación en robot real.

## Requisitos de hardware

- No se proporcionan datos oficiales de VRAM para inferencia en la documentación del modelo.
- Dado el tamaño de parámetros (3.14B) y la naturaleza multimodal (4 imágenes por paso), se recomienda una GPU con al menos 24 GB de VRAM para inferencia en tiempo real (p. ej., NVIDIA RTX 3090/4090, A10, A100).
- El tamaño del repositorio (127.7 GB) sugiere que los pesos se almacenan en alta precisión (FP32 o BF16) y posiblemente incluyen varios checkpoints; se recomienda convertir a FP16 o cuantización para reducir el uso de memoria.
- El despliegue se realiza a través de LeRobot, que gestiona la comunicación con el robot y las cámaras. No es aplicable vLLM, llama.cpp ni Ollama.
- La latencia dependerá de la GPU y de la resolución de las imágenes; en una RTX 4090 se puede esperar una frecuencia de control de decenas de Hz, suficiente para tareas de manipulación lenta.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de robótica de la misma categoría. El propio autor tiene otro modelo `OrderDraconis/smolvla_pickplace_leo` basado en SmolVLA, pero no se han publicado datos comparativos. La arquitectura GR00T N1.7 es de NVIDIA y es de código abierto, pero no hay benchmarks públicos comparables en esta ficha.

## Limitaciones y advertencias

- **Especialización extrema**: el modelo solo ha sido entrenado para una tarea concreta (alinear una pieza de tela sobre otra) con un robot específico (bi_so_follower). No generaliza a otras tareas ni a otros robots sin reentrenamiento.
- **Riesgo de sobreajuste**: el dataset de entrenamiento es pequeño (173 episodios) y probablemente el modelo esté ajustado a las condiciones específicas de iluminación, fondo y posición de las piezas.
- **Dependencia de la configuración del robot**: las cámaras y las dimensiones del estado están fijadas; cambios en la configuración física requerirían reentrenamiento.
- **Sin evaluación en el mundo real**: no hay resultados reportados de éxito en robot físico, por lo que su rendimiento real es desconocido.
- **Licencia**: Apache 2.0 permite uso comercial, pero es necesario verificar los términos de los modelos base (GR00T N1.7) y el dataset de entrenamiento.
- **Ausencia de documentación sobre sesgos**: no se ha evaluado el comportamiento ante variaciones de iluminación, colores o texturas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/OrderDraconis/groot_align_leo)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Janmeier820/align_fabric_dataset_combined)
- [Repositorio NVIDIA Isaac-GR00T](https://github.com/NVIDIA/Isaac-GR00T)
- [Paper GR00T N1](https://arxiv.org/abs/2503.14734)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
