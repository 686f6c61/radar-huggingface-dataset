# PID0930/groot-n1d7-openarm-bottle-sort-ckpt5000

## Resumen

El modelo `PID0930/groot-n1d7-openarm-bottle-sort-ckpt5000` es un ajuste fino (fine-tuning) de `nvidia/GR00T-N1.7-3B`, un modelo de política de robot (Vision-Language-Action, VLA) desarrollado por NVIDIA. El autor `PID0930` ha post-entrenado este modelo sobre un conjunto de datos de manipulación bimanual con el brazo robótico OpenArm, con la tarea de colocar dos botellas situadas a la izquierda en un cuenco izquierdo y dos botellas a la derecha en un cuenco derecho.

Se trata de un checkpoint intermedio (paso 5.000 de 20.000, 0,74 épocas) de un proceso de entrenamiento más largo. El modelo no está diseñado para generar texto ni razonar de forma general, sino para producir secuencias de acciones de control de un robot bimanual a partir de imágenes de cámara y una instrucción en lenguaje natural. La arquitectura combina un backbone VLM congelado (`nvidia/Cosmos-Reason2-2B`) con un proyector y una cabeza de acción basada en flow-matching DiT. El total de parámetros es de 3.144.016.000 (3.14B). No se proporciona la longitud de contexto, ya que no se ha documentado para este modelo.

Este checkpoint es relevante para investigadores en robótica y aprendizaje por refuerzo que quieran evaluar cómo el ajuste fino de un VLA afecta al control bimanual, y para estudiar el comportamiento de los checkpoints intermedios de un entrenamiento de 20.000 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) con backbone VLM y cabeza de accion flow-matching DiT |
| Parametros totales | 3.144.016.000 (3.14B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `nvidia/GR00T-N1.7-3B`, un VLA que combina un backbone de modelo de lenguaje y visión (`nvidia/Cosmos-Reason2-2B`) con una cabeza de acción para control robótico. En este ajuste fino, el backbone de 2B parámetros permanece congelado; solo se entrenan el proyector y la cabeza de acción flow-matching DiT. La cabeza genera acciones para un robot bimanual OpenArm con 16 grados de libertad: `left_arm` (7), `left_hand` (1), `right_arm` (7) y `right_hand` (1). Las acciones de los brazos son relativas (`RELATIVE`) y las de las manos son absolutas (`ABSOLUTE`), ambas con representación `NON_EEF`. El horizonte de acción es de 16 pasos a 30 fps, lo que equivale a aproximadamente 0,53 segundos.

El entrenamiento se realizó sobre 600 episodios, con un total de 224.608 frames a 30 fps, todos correspondientes a una única tarea con un layout fijo. El optimizador fue AdamW con tasa de aprendizaje de 1e-4, decaimiento coseno, warmup del 5% y weight decay de 1e-5. Se usó precisión bf16, un tamaño de lote global de 32 y un hardware de 1x A100 80GB PCIe. El modelo se entrenó durante 5.000 pasos de un total de 20.000, lo que representa 0,74 épocas. El tiempo estimado para completar los 20.000 pasos fue de unas 5 horas. No se aplicó RLHF ni DPO.

## Capacidades

- Control robótico bimanual: genera acciones de control para un robot de 16 grados de libertad (brazos y manos) a 30 fps.
- Percepción visual multi-cámara: utiliza tres vistas (pecho, muñeca izquierda y muñeca derecha) con resolución 480x640.
- Comprensión de instrucciones en lenguaje natural: mapea descripciones de tareas (como la indicada en `annotation.human.action.task_description`) a secuencias de acciones.
- Ejecución de horizonte de acciones: predice 16 pasos de acción por cada predicción, lo que permite un control continuo a 30 fps.
- Adaptación de política mediante ajuste fino: el modelo puede ajustarse a nuevos entornos o tareas entrenando solo el proyector y la cabeza de acción.
- No soporta tool calling, generación de texto libre ni razonamiento de propósito general, ya que es un modelo de política de robot.

## Casos de uso

- Investigación en control bimanual: el modelo permite estudiar cómo un VLA ajustado a una tarea específica controla un robot OpenArm, analizando las secuencias de acciones generadas a partir de la percepción visual.
- Benchmark de fine-tuning de VLA: sirve como referencia para comparar el efecto del número de pasos de entrenamiento en la pérdida de entrenamiento y en la calidad de las acciones, útil para entender la dinámica de convergencia.
- Desarrollo de manipuladores robóticos: puede integrarse en un sistema de clasificación de objetos en una línea de montaje simulada, donde el robot debe mover botellas a cuencos según su posición.
- Entrenamiento de políticas en simulación: se puede usar dentro de Isaac-GR00T para generar trayectorias o para evaluar en bucle abierto la capacidad del modelo de seguir instrucciones.
- Educación en robótica: material didáctico para enseñar el funcionamiento de los VLA y el control bimanual, usando un modelo concreto y reproducible.
- Evaluación de generalización: el checkpoint puede probarse en escenarios con cambios de iluminación, disposición de objetos o ruido visual para medir su robustez, dado que fue entrenado en un entorno muy uniforme.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato cuantitativo reportado es la pérdida de entrenamiento en el paso 5.000, que fue de 0,0636. No obstante, el autor indica explícitamente que no se ha medido ninguna métrica de validación ni tasa de éxito en robot real, y que una menor pérdida de entrenamiento no establece una mejor generalización.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 6,3 GB. Con las activaciones de las tres cámaras y el overhead de la cabeza de acción, se estima que una GPU con 24 GB de VRAM es suficiente, aunque no hay datos de consumo medidos.
- GPU recomendadas: para entrenamiento se usó una A100 80GB PCIe; para inferencia se recomienda una RTX 4090 o una A100 80GB.
- Cabe en consumer GPU: probablemente en una RTX 4090 de 24 GB, pero no se ha verificado.
- Opciones de despliegue: el modelo se usa mediante la librería Isaac-GR00T en Python, cargándolo con la clase `Gr00tPolicy`. No aplican vLLM, llama.cpp ni Ollama, al ser un modelo de política robótica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perdida de entrenamiento (paso) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nvidia/GR00T-N1.7-3B` (base) | 3B | No disponible | No aplica | Apache 2.0 | Disponible en HuggingFace |
| `PID0930/groot-n1d7-openarm-bottle-sort-ckpt5000` | 3.144B | No disponible | 0.0636 (5.000) | Apache 2.0 | Disponible en HuggingFace |
| `PID0930/groot-n1d7-openarm-bottle-sort-ckpt10000` | 3.144B | No disponible | 0.0440 (10.000) | Apache 2.0 | Disponible en HuggingFace |
| `PID0930/groot-n1d7-openarm-bottle-sort-ckpt15000` | 3.144B | No disponible | 0.0282 (15.000) | Apache 2.0 | Disponible en HuggingFace |
| `PID0930/groot-n1d7-openarm-bottle-sort-ckpt20000` | 3.144B | No disponible | 0.0229 (20.000) | Apache 2.0 | Disponible en HuggingFace |

Nota: la pérdida mostrada es de entrenamiento, no de validación. Ninguno de los checkpoints ha sido evaluado con métricas de validación.

## Limitaciones y advertencias

- Entrenado en una única tarea con un layout fijo, por lo que la robustez ante cambios de disposición, iluminación u objetos no ha sido probada.
- Los episodios del dataset son inusualmente uniformes (357-386 frames, 11.9-12.9 s), lo que limita la diversidad de los datos y la generalización.
- No se ha medido la tasa de éxito en robot real ni ninguna métrica de validación; el modelo debe tratarse como un artefacto de investigación.
- El backbone VLM permanece congelado, lo que significa que las características visuales no se adaptaron a las cámaras específicas del robot OpenArm.
- La pérdida de entrenamiento no es un indicador fiable del rendimiento; un valor más bajo no implica mejores acciones.
- No se han evaluado sesgos ni riesgos de alucinación (acciones incorrectas o no deseadas) en entornos no vistos.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no está listo para producción sin una validación exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/PID0930/groot-n1d7-openarm-bottle-sort-ckpt5000
- GitHub Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- GitHub OpenArm: https://github.com/enactic/openarm
