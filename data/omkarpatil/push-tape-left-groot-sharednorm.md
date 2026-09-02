# omkarpatil/push-tape-left-groot-sharednorm

## Resumen

Este modelo es un fine-tune del modelo fundacional de robótica `nvidia/GR00T-N1.7-3B`, desarrollado por Omkar Patil, para la tarea específica de empujar una cinta (push-tape-left) con el brazo robótico ROBOTIS FFW SG2 Rev1. Se entrena con la receta "shared-norm", que agrupa estadísticas de normalización entre varias tareas del mismo grupo (push-tape-left y push-tape-right) para permitir la composición de políticas. El modelo tiene 3.144 millones de parámetros y se distribuye en formato safetensors, con licencia Apache 2.0.

La relevancia de este modelo radica en su capacidad para ser combinado con otros fine-tunes del mismo grupo de composición, siempre que compartan el mismo hash de normalización, lo que facilita el desarrollo de comportamientos robóticos modulares. Al estar basado en GR00T N1.7, hereda la arquitectura de visión-lenguaje-acción (VLA) de NVIDIA, aunque en esta versión se ha adaptado exclusivamente a la tarea de manipulación con cámaras específicas. El entrenamiento se realizó con 15 episodios y 2.660 frames, con una pérdida final de 0.0433, y está listo solo para inferencia, sin posibilidad de reanudar el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basada en GR00T N1.7-3B |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo VLA `nvidia/GR00T-N1.7-3B`, que combina percepción visual (tres cámaras: `cam_left_head`, `cam_left_wrist`, `cam_right_wrist`) con control de acciones robóticas. La arquitectura subyacente es un transformer multimodal, aunque no se especifican detalles adicionales en la información disponible. El entrenamiento se realizó con el entrypoint estándar de GR00T (`launch_finetune.py`) sin modificaciones de código, variando únicamente las estadísticas de normalización del dataset.

Los datos de entrenamiento consisten en 15 episodios y 2.660 frames de la tarea push-tape-left, muestreados a 15 fps con un chunk de acción de 16 pasos (aproximadamente 1.07 segundos). La normalización aplica un min-max basado en percentiles q01/q99, mapeando a [-1, 1] con recorte de outliers. Se usó precisión fp32 (sin bf16) y atención con PyTorch SDPA en lugar de flash-attention-2, debido a limitaciones del sistema. El entrenamiento duró 20.000 pasos con learning rate 1e-4, warmup de 0.05, weight decay 1e-5 y batch de 32, alcanzando una pérdida final de 0.0433. No se menciona el uso de RLHF o DPO; es un fine-tuning supervisado estándar.

## Capacidades

- Control robótico para la tarea específica de empujar una cinta (push-tape-left) con el brazo FFW SG2 Rev1.
- Percepción multimodal a través de tres cámaras (cabeza izquierda, muñeca izquierda, muñeca derecha).
- Predicción de acciones en chunks de 16 pasos, lo que permite movimientos coordinados y suaves.
- Composición con otros modelos del mismo grupo (push-tape-right) gracias a la normalización compartida (hash `e8f4159ddb8fc98e`).
- Inferencia en tiempo real a 15 fps, adecuada para control en bucle cerrado.
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües, al ser un modelo puramente robótico.

## Casos de uso

- Automatización de tareas de manipulación en líneas de ensamblaje: el modelo puede ejecutar la tarea de empujar cintas en un entorno industrial, reduciendo la intervención humana en procesos repetitivos.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre tareas similares, gracias a su diseño de composición con normalización compartida.
- Desarrollo de robots colaborativos en entornos de laboratorio: permite probar algoritmos de control basados en VLA con un brazo robótico de bajo coste como el FFW SG2 Rev1.
- Composición de comportamientos modulares: al compartir estadísticas de normalización con push-tape-right, se pueden combinar políticas para crear secuencias de acciones más complejas sin reentrenar desde cero.
- Evaluación de técnicas de fine-tuning en robótica: el modelo documenta un proceso de entrenamiento reproducible (sin parches de código), útil para comparar recetas de normalización y su impacto en el rendimiento.
- Prototipado de soluciones de robótica doméstica: la tarea de empujar objetos es común en entornos domésticos, y este modelo puede adaptarse a otros brazos con configuraciones similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida final de entrenamiento (0.0433), pero no hay comparaciones con otros modelos ni evaluaciones en entornos simulados o reales.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en fp32 ocupa aproximadamente 12.6 GB (tamaño del repositorio), por lo que se recomienda al menos 16 GB de VRAM para cargar los pesos y ejecutar la inferencia con margen.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40 GB) o H100 (80 GB) para mayor comodidad. Una GPU con 16 GB (como RTX 4080) podría funcionar, pero con riesgo de desbordamiento de memoria.
- No cabe en GPUs de consumo de gama baja (8 GB o menos) debido al tamaño del modelo en fp32.
- Opciones de despliegue: al ser un modelo de robótica, se integra con el framework NVIDIA Isaac GR00T (disponible en GitHub). No se mencionan opciones como vLLM, llama.cpp u Ollama, que son específicas para modelos de lenguaje.
- Latencia y throughput: no se proporcionan datos. Se espera que la inferencia a 15 fps sea viable en hardware adecuado, dado el tamaño del modelo y el uso de SDPA.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. El modelo base `nvidia/GR00T-N1.7-3B` es el punto de referencia, pero no se detallan sus especificaciones completas en la información proporcionada. Existe una variante del mismo autor (`omkarpatil/ffw_sg2_push-tape-left_groot-n1.7_nonorm`) que usa una normalización diferente (sin shared-norm), pero no se aportan datos de rendimiento comparativo. Por tanto, la comparativa se limita a indicar que ambos comparten la misma arquitectura base y tarea, diferenciándose en la receta de normalización.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea push-tape-left; no es generalizable a otras tareas sin un nuevo fine-tuning.
- La composición con otros modelos solo es válida si comparten el mismo hash de normalización (`e8f4159ddb8fc98e`); usar modelos de otros grupos puede producir comportamientos inconsistentes.
- El entrenamiento se realizó con un número reducido de episodios (15), lo que puede limitar la robustez ante variaciones del entorno.
- La atención usa PyTorch SDPA en lugar de flash-attention-2; aunque ambos son equivalentes en precisión, los resultados no son bit-reproducibles entre implementaciones.
- El modelo es solo para inferencia; no se puede reanudar el entrenamiento ni ajustar los pesos con los checkpoints incluidos.
- No se han evaluado sesgos ni riesgos de alucinación, ya que no es un modelo de lenguaje; sin embargo, en robótica, errores de predicción pueden causar movimientos inseguros, por lo que se recomienda supervisión humana en entornos reales.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base (GR00T N1.7) para posibles restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omkarpatil/push-tape-left-groot-sharednorm
- Variante sin shared-norm: https://huggingface.co/omkarpatil/ffw_sg2_push-tape-left_groot-n1.7_nonorm
- Perfil del autor: https://huggingface.co/omkarpatil/models
- Repositorio de NVIDIA Isaac GR00T: https://github.com/NVIDIA/Isaac-GR00T
