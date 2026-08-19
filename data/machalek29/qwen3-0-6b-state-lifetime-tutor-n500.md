# machalek29/qwen3-0.6b-state-lifetime-tutor-n500

## Resumen

El modelo `machalek29/qwen3-0.6b-state-lifetime-tutor-n500` es un adaptador LoRA entrenado sobre el modelo base `Qwen/Qwen3-0.6B`, desarrollado por el autor `machalek29`. Su propósito es actuar como tutor especializado en bugs de ciclo de vida de estado mutable en Python: dado un programa corto con un error de este tipo, el modelo identifica la declaración, asignación o mutación relevante y formula exactamente una pregunta no compuesta sobre cuándo se crea el objeto, quién lo posee o qué referencias lo comparten. Está diseñado para no emitir código corregido ni revelar la corrección, incluso si se le pide directamente.

El modelo se ha entrenado mediante SFT con LoRA (r=16, alpha=16) sobre las primeras 500 muestras del dataset `machalek29/state-lifetime-tutor-v1`, con una pérdida final de 0.5029 y un tiempo de entrenamiento de 1149 segundos. El comportamiento reside en los pesos, no en el prompt, por lo que requiere un system prompt específico y la desactivación del modo thinking para funcionar correctamente. Con 596 millones de parámetros totales (incluido el adaptador), es un modelo ligero apto para inferencia en hardware modesto.

Este modelo es relevante porque demuestra la viabilidad de especializar modelos pequeños y abiertos en tareas de diagnóstico educativo muy concretas, con una licencia Apache-2.0 que permite uso comercial sin restricciones. Su enfoque de no revelar la respuesta fomenta un aprendizaje activo, aunque limita su aplicabilidad fuera del nicho para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre el transformer decoder-only de Qwen3-0.6B, con una capa de atención estándar. El entrenamiento emplea LoRA con r=16 y alpha=16, aplicado a todas las proyecciones lineales, manteniendo la base congelada en precisión bf16. El dataset de entrenamiento contiene 500 ejemplos del dataset `state-lifetime-tutor-v1` (primeros por rango), y el entrenamiento se realizó con pérdida únicamente sobre la respuesta generada. Se usaron 189 pasos con una pérdida final de 0.5029, en un entorno con torch 2.13.0, transformers 5.15.0, peft 0.20.0 y trl 1.10.0, sobre dispositivo mps.

El método de entrenamiento es SFT (supervised fine-tuning) sin RLHF ni DPO. El adaptador se puede cargar con la biblioteca transformers y PEFT, y se recomienda usar el system prompt exacto y el modo de generación greedy con thinking desactivado para reproducir el comportamiento deseado.

## Capacidades

- Identifica declaraciones, asignaciones o mutaciones de objetos en programas Python que causan bugs de ciclo de vida de estado.
- Formula exactamente una pregunta no compuesta sobre la creación, propiedad o compartición de referencias del objeto.
- No emite código corregido ni revela la solución, incluso ante peticiones directas.
- Mantiene el comportamiento de tutoría solo cuando se usa el system prompt específico y la configuración de generación indicada.
- Funciona únicamente en inglés.
- No tiene capacidades generales de razonamiento, código, matemáticas o visión más allá de la tarea específica.

## Casos de uso

- Plataformas de aprendizaje de Python: el modelo puede integrarse en un tutor interactivo que analice el código del estudiante y haga preguntas guiadas sobre bugs de lifetime, fomentando la reflexión sin dar la respuesta.
- Generación de ejercicios de práctica: se puede usar para crear automáticamente preguntas de diagnóstico sobre problemas de mutabilidad y referencia, a partir de ejemplos de código dados.
- Herramientas de evaluación en entornos educativos: para calificar o retroalimentar ejercicios de programación, el modelo puede generar preguntas que el alumno debe responder antes de ver la solución.
- Chatbots de apoyo en foros de programación: el modelo puede responder a consultas sobre errores de lifetime con una pregunta orientadora en lugar de una solución directa.
- Entrenamiento de modelos de tutoría: puede servir como base para experimentos de RLHF o DPO con recompensas de calidad educativa, al ser un modelo pequeño y de bajo coste de entrenamiento.
- Prototipos de asistentes pedagógicos en español: aunque el modelo solo soporta inglés, se puede traducir el prompt y el contenido para crear una versión en castellano, pero requiere ajuste adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida de entrenamiento final (0.5029) y el tiempo de entrenamiento (1149 segundos), sin evaluaciones de rendimiento en tareas de tutoría ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en bf16 ocupa aproximadamente 1,2 GB (596M parámetros × 2 bytes). Con el adaptador LoRA, el consumo adicional es mínimo. Cabe en GPUs con 2 GB o más de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM, como una GTX 1650, RTX 3060 o superior. También se puede ejecutar en CPU con suficiente RAM.
- Despliegue en consumer GPU: sí, en cualquier GPU con 4 GB de VRAM se puede cargar el modelo y el adaptador con transformers y PEFT.
- Opciones de despliegue: transformers + PEFT para carga del adaptador, vLLM con soporte de LoRA, Ollama (si se convierte el adaptador en un modelo GGUF), o TGI con adapters.
- Latencia y throughput: no disponible. Para un modelo de 0,6B en bf16, se puede esperar una latencia de decenas de milisegundos por token en GPU consumer, pero no hay datos oficiales.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables con la misma especialización en tutoría de lifetime de estado en Python. El modelo base `Qwen3-0.6B` es un modelo generalista, y no hay datos de rendimiento del adaptador frente a él u otros tutores. La comparación con modelos de tamaño similar (p. ej., TinyLlama-1.1B, Phi-1.5) sería posible pero carece de métricas en esta tarea concreta.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para la tarea específica de tutoría de lifetime de estado en Python. No es un modelo generalista y su rendimiento en otras tareas será muy limitado.
- El comportamiento correcto depende de la configuración exacta: system prompt específico, thinking desactivado y decodificación greedy. Cualquier variación puede degradar el resultado.
- Solo funciona en inglés; no hay soporte multilingüe.
- No se han evaluado sesgos, pero el modelo base Qwen3-0.6B puede tener sesgos inherentes que el adaptador no corrige.
- Riesgo de alucinación: al ser un modelo pequeño y especializado, puede generar preguntas inexactas o incoherentes si el código de entrada no coincide con el patrón esperado.
- La licencia Apache-2.0 permite uso comercial, pero no se garantiza la exactitud pedagógica ni la seguridad en entornos de producción sin una validación adicional.
- El dataset de entrenamiento es pequeño (500 ejemplos) y no se ha publicado una evaluación de calidad en datos fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/machalek29/qwen3-0.6b-state-lifetime-tutor-n500
- Dataset de entrenamiento: https://huggingface.co/datasets/machalek29/state-lifetime-tutor-v1
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Paper técnico de Qwen3: https://arxiv.org/html/2505.09388v1
