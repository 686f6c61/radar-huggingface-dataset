# briskVLA/shallow_8L_early_untrained

## Resumen

BriskVLA/shallow_8L_early_untrained es un checkpoint de investigación derivado de SmolVLA, el modelo de visión-lenguaje-acción (VLA) de bajo coste desarrollado por Hugging Face en el ecosistema LeRobot. En concreto, se trata de una variante de "profundidad reducida" del experto de acción de SmolVLA afinado sobre LIBERO (`lerobot/smolvla_libero`): conserva únicamente las 8 primeras capas del experto original (índices 0 a 7), bajo una disposición canónica denominada "early" y con anchura FFN por defecto (2048).

El modelo resuelve un problema práctico de despliegue robótico: reducir el coste computacional del experto de acción para permitir inferencia más rápida o distillation posterior, manteniendo la interfaz y el pipeline de LeRobot. Su nombre incluye el sufijo "untrained", lo que indica que es un checkpoint de ablación generado por poda de capas, no un modelo afinado de extremo a extremo; está pensado como punto de partida para evaluación, destilación o compresión adicional (por ejemplo, de 8L a 4L).

Es relevante ahora porque la comunidad de robótica open source está explorando variantes ligeras de VLA para control en tiempo real en hardware modesto. Con 400,9 millones de parámetros y un repositorio de 0,8 GB, este checkpoint sirve como referencia reproducible de ablación de profundidad dentro de la familia SmolVLA/BriskVLA sobre el benchmark LIBERO. No obstante, la información publicada es mínima: no hay model card extendida, licencia declarada ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en SmolVLA (experto de acción tipo transformer, reducido a 8 capas) |
| Parametros totales | 400.923.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint pertenece a la familia SmolVLA, un modelo de visión-lenguaje-acción orientado a control robótico que combina un codificador visual, un modelo de lenguaje y un experto de acción que produce comandos motores. En esta variante "shallow", el experto de acción se ha reducido a 8 capas (las capas 0 a 7 del profesor `lerobot/smolvla_libero` en el commit `a24f1f380461`), con disposición canónica "early" y anchura FFN por defecto de 2048. El profesor es el checkpoint SmolVLA afinado sobre LIBERO, el conjunto de tareas de manipulación robótica de referencia.

El sufijo "untrained" y el campo "Role: shallow" indican que se trata de un checkpoint construido por poda estructural, no de un modelo reentrenado. La model card no documenta volumen de datos de entrenamiento, composición del dataset, ni si hubo RLHF/DPO; tampoco se describe ninguna innovación de decodificación o atención. El flujo de trabajo previsto incluye evaluación sobre LIBERO con K=10 y K=1, medición de latencia y pasos posteriores de destilación (`distill_student.py`) o construcción de estudiantes más pequeños (`build_student.py`, por ejemplo 8L a 4L con fusión de FFN y retención alterna de capas).

## Capacidades

- Control robótico de manipulación: genera acciones motoras a partir de observaciones visuales e instrucciones, en el marco del benchmark LIBERO.
- Integración con LeRobot: compatible con las herramientas de evaluación, latencia y destilación del proyecto BriskVLA.
- Evaluación configurable: soporta evaluación con K=10 y K=1 pasos de acción.
- Base para compresión: puede usarse como origen para construir estudiantes de menor profundidad (8L a 4L).
- Medición de latencia: incluye soporte para scripts de medición de latencia del proyecto.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo ni modos de razonamiento extendido.

## Casos de uso

- Evaluación de ablación de profundidad: comparar el rendimiento en LIBERO de este experto de 8 capas frente al profesor completo para cuantificar la pérdida por poda. Es adecuado porque la model card proporciona comandos directos de evaluación con K=10 y K=1.
- Destilación de estudiantes más pequeños: usar el checkpoint como profesor intermedio en `distill_student.py` para generar variantes de 4 capas, reduciendo aún más el coste de inferencia en robots con cómputo limitado.
- Medición de latencia en pipelines robóticos: ejecutar `latency.py` para obtener perfiles de latencia del experto reducido y decidir si cumple los requisitos de control en tiempo real.
- Investigación en compresión de VLA: servir como punto de partida reproducible para estudiar el efecto de la profundidad del experto de acción sobre la tasa de éxito en tareas de manipulación.
- Prototipado en simulación LIBERO: validar políticas ligeras en entornos simulados antes de comprometer hardware real, aprovechando el tamaño reducido del repositorio (0,8 GB).
- Referencia de reproducibilidad: citar como baseline de ablación en publicaciones sobre eficiencia de modelos VLA, dado que el checkpoint está publicado con metadatos explícitos de capas y disposición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 400,9 millones de parámetros en safetensors, los pesos ocupan aproximadamente 0,8 GB en precisión de 16 bits, por lo que la VRAM necesaria será moderada pero depende del codificador visual y del modelo de lenguaje del pipeline SmolVLA completo.
- GPU recomendadas: no disponible; por el tamaño del experto, es plausible su ejecución en GPU consumer, pero no hay datos oficiales que lo confirmen.
- ¿Cabe en GPU consumer?: no confirmado en la documentación disponible.
- Opciones de despliegue: LeRobot (librería declarada); el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este checkpoint.
- Latencia y throughput: no disponibles; el proyecto incluye un script de medición de latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| briskVLA/shallow_8L_early_untrained | 400,9 M | no disponible | no disponible | no disponible | Hugging Face |
| lerobot/smolvla_libero (profesor) | no disponible en la informacion | no disponible | no disponible | no disponible | Hugging Face |
| Otras variantes BriskVLA (p. ej. 4L) | no disponible | no disponible | no disponible | no disponible | referenciadas en scripts, sin datos |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint "untrained": el nombre indica que no ha sido afinado tras la poda; su rendimiento puede degradarse respecto al profesor y no debe asumirse como equivalente.
- Sin resultados de evaluación publicados: no hay tasas de éxito en LIBERO ni métricas de latencia verificables en la información disponible.
- Licencia no declarada: no se puede confirmar el uso comercial; debe consultarse al autor antes de cualquier despliegue en producción.
- Idiomas no declarados: no hay información sobre soporte multilingüe en las instrucciones de tarea.
- Sesgos y alucinación: no documentados; al ser un modelo de control robótico, el riesgo principal es la ejecución de acciones incorrectas, no la generación de texto.
- Contexto no documentado: se desconoce la ventana de contexto del componente de lenguaje.
- Madurez: creado y actualizado el mismo día (2026-11-27), con 0 descargas y 0 likes; sin validación comunitaria.
- Dependencia del ecosistema LeRobot y del proyecto BriskVLA para su uso y evaluación.

## Enlaces

- Hugging Face: https://huggingface.co/briskVLA/shallow_8L_early_untrained
- Modelo base: https://huggingface.co/lerobot/smolvla_libero
- Repositorio LeRobot: no disponible en la informacion proporcionada
- Paper de SmolVLA: no disponible en la informacion proporcionada
- Proyecto BriskVLA: no disponible en la informacion proporcionada
- Benchmark LIBERO: no disponible en la informacion proporcionada
