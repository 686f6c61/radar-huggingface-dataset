# briskVLA/student_8L_late_shallow_pi

## Resumen

BriskVLA/student_8L_late_shallow_pi es un checkpoint de un modelo de visión-lenguaje-acción (VLA) para robótica, desarrollado por el colectivo briskVLA. Se trata de un modelo "estudiante" destilado a partir del modelo base `lerobot/smolvla_libero` de Hugging Face, con una profundidad reducida del experto de acciones a 8 capas (capas 8 a 15 del modelo original). El objetivo es ofrecer una variante más ligera y rápida del SmolVLA original manteniendo la capacidad de ejecutar tareas de manipulación robótica en el benchmark LIBERO.

El modelo hereda la arquitectura SmolVLA (basada en un transformer multimodal con un experto de acciones) y se distribuye en formato safetensors con 400,9 millones de parámetros totales. Está diseñado específicamente para evaluación y despliegue en entornos de robótica que usan la librería LeRobot, y su principal atractivo es la reducción de cómputo en inferencia mediante la poda de capas del experto, manteniendo el layout canónico "late" y un ancho FFN por defecto de 2048.

Es relevante ahora porque forma parte de una línea de trabajo sobre compresión y destilación de modelos VLA para robótica, un área donde el coste computacional y la latencia son críticos para el control en tiempo real. El modelo está pensado como punto de partida para seguir destilando o comprimiendo (por ejemplo, de 8L a 4L) y para medir latencia y éxito en LIBERO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (transformer multimodal con experto de acciones), variante BriskVLA con profundidad reducida |
| Parametros totales | 400.923.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un estudiante destilado del SmolVLA original (`lerobot/smolvla_libero` @ `a24f1f380461`). La arquitectura sigue el esquema SmolVLA, que combina un codificador visual-lenguaje con un experto de acciones; en esta variante, el experto de acciones se ha reducido a 8 capas (índices 8 a 15 del modelo profesor), manteniendo el layout canónico "late" y un ancho FFN por defecto de 2048. El rol del checkpoint es "student", lo que indica que fue entrenado mediante destilación desde el profesor.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card menciona scripts para continuar el entrenamiento, destilar o comprimir aún más el modelo (por ejemplo, de 8L a 4L mediante `build_student.py` con `--group 2 --keep alternate --ffn fuse`), lo que sugiere un pipeline de compresión iterativa. No se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de acciones robóticas para tareas de manipulación en el benchmark LIBERO.
- Control visomotor a partir de observaciones visuales e instrucciones en lenguaje natural (herencia de SmolVLA).
- Evaluación con distintos horizontes de acción (K=10 y K=1 según la model card).
- Medición de latencia de inferencia mediante scripts específicos.
- Destilación y compresión adicional: el checkpoint puede usarse como fuente para generar estudiantes más pequeños (por ejemplo, 4L).
- Integración con la librería LeRobot para entrenamiento, evaluación y despliegue.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo ni modos de razonamiento explícito.

## Casos de uso

- Evaluación en LIBERO: ejecutar `run_eval.sh` con `STEPS="10 1"` para medir la tasa de éxito del modelo en las tareas del benchmark, comparando el estudiante de 8 capas con el profesor completo.
- Medición de latencia en robótica: usar `latency.py` para cuantificar el tiempo de inferencia por paso de acción, lo que permite decidir si el modelo cumple los requisitos de control en tiempo real de un robot concreto.
- Destilación adicional: emplear `distill_student.py` para continuar el entrenamiento del estudiante o generar variantes más pequeñas, útil en investigación sobre compresión de modelos VLA.
- Compresión estructural: usar `build_student.py` con `--group 2 --keep alternate --ffn fuse` para obtener un modelo de 4 capas a partir de este checkpoint, reduciendo aún más el coste computacional.
- Prototipado en robótica de manipulación: desplegar el modelo en entornos simulados o reales compatibles con LeRobot para tareas de pick-and-place y manipulación guiada por lenguaje.
- Investigación en eficiencia de VLA: servir como punto de comparación entre distintas profundidades del experto (8L frente a 4L o el profesor completo) para estudiar el compromiso entre éxito y latencia.
- Integración en pipelines de LeRobot: cargar el checkpoint directamente desde Hugging Face en flujos de entrenamiento o evaluación existentes sin conversión de formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 400,9 millones de parámetros en safetensors (probablemente fp32 o bf16), el peso del modelo ocupa aproximadamente 0,8 GB en el repositorio, por lo que la VRAM necesaria para los pesos es del orden de 1-2 GB según precisión.
- GPU recomendadas: no disponible; por tamaño, el modelo es apto para GPUs consumer, aunque no se especifican modelos concretos.
- ¿Cabe en GPU consumer? Sí, por el tamaño de parámetros (400M) es plausible en GPUs consumer, pero no se confirma en la información disponible.
- Opciones de despliegue: LeRobot (librería principal), con scripts de evaluación y latencia proporcionados; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible; la model card incluye un script `latency.py` para medirlos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| briskVLA/student_8L_late_shallow_pi | 400.923.616 | no disponible | no disponible | no disponible | Hugging Face |
| lerobot/smolvla_libero (profesor) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Otras variantes BriskVLA (p. ej. 4L) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de acciones robóticas, el riesgo se traduce en acciones incorrectas o inseguras.
- Limitaciones de contexto o idioma: no disponible; los idiomas soportados no están documentados.
- Restricciones de licencia para uso comercial: la licencia no está disponible, por lo que no se puede confirmar si permite uso comercial.
- Caveat importante: es un modelo estudiante con profundidad reducida (8 capas), lo que puede implicar menor éxito que el profesor; se recomienda evaluar en LIBERO antes de usarlo en producción.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- No se documentan requisitos de hardware ni cifras de latencia, por lo que el despliegue en tiempo real requiere medición propia.

## Enlaces

- Hugging Face: https://huggingface.co/briskVLA/student_8L_late_shallow_pi
- Modelo base: https://huggingface.co/lerobot/smolvla_libero
- Librería LeRobot: no disponible en la información proporcionada
- Paper o blog: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
