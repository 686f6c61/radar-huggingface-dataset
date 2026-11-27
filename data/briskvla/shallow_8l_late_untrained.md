# briskVLA/shallow_8L_late_untrained

## Resumen

briskVLA/shallow_8L_late_untrained es un checkpoint de investigación de robótica basado en SmolVLA, el modelo de visión-lenguaje-acción (VLA) compacto de LeRobot. Se trata de una variante de "profundidad reducida": conserva únicamente 8 de las capas del experto de acción del modelo original (capas 8 a 15, layout `late`), manteniendo el resto de la arquitectura del profesor `lerobot/smolvla_libero`. El resultado es un modelo de aproximadamente 401 millones de parámetros y 0,8 GB de pesos en formato safetensors, orientado a la manipulación robótica en el benchmark LIBERO.

El modelo pertenece a la familia BriskVLA, un conjunto de experimentos de destilación y compresión sobre SmolVLA cuyo objetivo es reducir el coste computacional de los VLA en inferencia sin perder capacidad de control. La nomenclatura "untrained" y la ausencia de métricas publicadas indican que se trata de un artefacto intermedio de un pipeline de destilación, no de un modelo listo para producción.

Su relevancia es fundamentalmente metodológica: permite estudiar cómo afecta la poda de profundidad del experto de acción al rendimiento en tareas de manipulación, y sirve como punto de partida para compresiones adicionales (por ejemplo, de 8L a 4L). No obstante, al no incluir licencia declarada, idiomas ni resultados de evaluación, su uso práctico queda restringido a investigación interna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción) con experto de acción de profundidad reducida (8 capas: 8-15, layout `late`) |
| Parametros totales | 400.923.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo deriva de `lerobot/smolvla_libero` (commit `a24f1f380461`), un SmolVLA entrenado para el benchmark LIBERO. SmolVLA es una arquitectura VLA que combina un codificador visual, un modelo de lenguaje y un experto de acción (action expert) que genera comandos motores condicionados por observaciones e instrucciones en lenguaje natural. En esta variante, el experto de acción se ha recortado a 8 capas (índices 8 a 15), con un ancho de FFN por defecto de 2048, y se ha fijado el layout canónico en `late`.

El checkpoint se etiqueta como "untrained", lo que sugiere que los pesos del experto reducido no han pasado por un ciclo completo de destilación o fine-tuning tras la poda, o que se distribuye como referencia base del pipeline BriskVLA. La model card documenta comandos para evaluación en LIBERO (K=10 y K=1), medición de latencia, destilación adicional y construcción de estudiantes de 4 capas mediante agrupación de capas (`--group 2 --keep alternate --ffn fuse`). No se especifican datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales e instrucciones en lenguaje natural, en el entorno del benchmark LIBERO.
- Control de manipulación de objetos en tareas simuladas de LIBERO.
- Evaluación con distintos horizontes de acción (K=10 y K=1) según los scripts proporcionados.
- Punto de partida para destilación y compresión adicional (por ejemplo, reducción de 8L a 4L).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo ni modos de pensamiento.
- No se documentan capacidades de visión general, audio ni generación de texto libre.

## Casos de uso

- Investigación en compresión de VLA: servir como estudiante intermedio en pipelines de destilación desde SmolVLA hacia variantes más ligeras, midiendo la pérdida de éxito en LIBERO a medida que se reduce la profundidad del experto.
- Análisis de latencia en robótica: usar el script `latency.py` para cuantificar el coste de inferencia del experto de 8 capas frente al modelo completo, informando decisiones de despliegue en hardware embebido.
- Ablación de profundidad: comparar el rendimiento de esta variante con el profesor y con estudiantes de 4 capas para determinar el punto óptimo entre precisión y eficiencia.
- Reproducibilidad de experimentos: el checkpoint fija el commit del profesor y el layout `late`, lo que facilita replicar resultados en entornos de investigación.
- Generación de estudiantes de 4 capas: emplear el comando `build_student.py` para producir variantes aún más pequeñas y evaluar su viabilidad en robots con recursos limitados.
- Evaluación comparativa en LIBERO: ejecutar `run_eval.sh` con K=10 y K=1 para caracterizar el comportamiento del modelo en tareas de manipulación con distintos horizontes de planificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 400,9 M de parámetros en safetensors (0,8 GB), la inferencia en FP32 requeriría aproximadamente 1,6 GB solo para pesos, más memoria para activaciones y codificador visual.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 o RTX 4090, así como en A100/H100 para evaluación a mayor escala.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del checkpoint, aunque no se confirma en la documentación.
- Opciones de despliegue: librería `lerobot` (scripts `run_eval.sh`, `latency.py`, `distill_student.py`, `build_student.py`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el autor proporciona un script para medirlos, pero no publica resultados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| briskVLA/shallow_8L_late_untrained | 400,9 M | no disponible | no publicado | no disponible | Hugging Face (repo 0,8 GB) |
| lerobot/smolvla_libero (profesor) | no disponible en la informacion | no disponible | no disponible | no disponible | Hugging Face |
| Otras variantes BriskVLA (p. ej. 4L) | no disponible | no disponible | no disponible | no disponible | referenciadas en scripts, no confirmadas |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría distintas del modelo profesor.

## Limitaciones y advertencias

- Checkpoint etiquetado como "untrained": no hay evidencia de que los pesos del experto reducido hayan sido destilados o ajustados tras la poda, por lo que el rendimiento puede ser inferior al del profesor.
- Ausencia total de resultados de benchmarks publicados: no es posible validar su capacidad en LIBERO sin ejecutar la evaluación por cuenta propia.
- Licencia no declarada: no se puede asumir uso comercial; es imprescindible contactar con el autor o consultar el repositorio del proyecto antes de cualquier despliegue.
- Idiomas no especificados: se desconoce si las instrucciones en lenguaje natural deben estar en inglés u otro idioma.
- Contexto no documentado: se desconoce la ventana máxima de observaciones o instrucciones soportada.
- Riesgo de alucinación y sesgos: no evaluado; al ser un modelo de acción, el riesgo se traduce en comandos motores incorrectos o inseguros en entornos reales.
- Orientado exclusivamente a investigación en simulación (LIBERO); no hay evidencia de robustez en robots físicos.
- Sin garantías de mantenimiento: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día.

## Enlaces

- Hugging Face: https://huggingface.co/briskVLA/shallow_8L_late_untrained
- Modelo base (profesor): https://huggingface.co/lerobot/smolvla_libero
- Librería LeRobot: https://github.com/huggingface/lerobot
- Benchmark LIBERO: no disponible en la informacion proporcionada
- Paper de SmolVLA: no disponible en la informacion proporcionada
