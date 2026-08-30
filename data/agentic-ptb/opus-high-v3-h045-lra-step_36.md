# agentic-ptb/opus-high-v3.h045.lrA.step_36

## Resumen

`opus-high-v3.h045.lrA.step_36` es un checkpoint intermedio derivado de un experimento de entrenamiento agéntico (AgentPTB) desarrollado por el usuario `agentic-ptb`. Se trata de un ajuste fino del modelo base `Qwen/Qwen3.5-9B-Base`, con un total de 9.409.813.744 parámetros (~9,4 mil millones). El checkpoint corresponde al paso 36 de la ejecución `opus-high-v3`, concretamente a la hora 45 del run, y se publica con fines de reproducibilidad y estudio cualitativo.

El experimento está etiquetado como `negative-results`: según la model card, el run no encontró ninguna mejora en los pesos entrenados respecto al modelo base. Por tanto, este checkpoint no debe interpretarse como un modelo mejorado ni como un candidato para uso en producción. Su interés radica exclusivamente en el análisis de los resultados negativos del proceso de entrenamiento agéntico y en la reproducibilidad del experimento.

La relevancia de esta publicación es metodológica: documenta un intento fallido de mejora mediante entrenamiento agéntico, lo que puede servir a la comunidad para entender los límites de estas técnicas y evitar repetir errores. El modelo se distribuye bajo licencia Apache 2.0 y los pesos están en formato `safetensors`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de `Qwen/Qwen3.5-9B-Base`, un transformer de 9,4 mil millones de parámetros. No se dispone de detalles adicionales sobre la arquitectura interna más allá de lo heredado del modelo base.

El entrenamiento se realizó mediante un pipeline de entrenamiento agéntico (AgentPTB) que utiliza Claude Code como agente para generar y ejecutar tareas de ajuste fino. El checkpoint corresponde a un paso intermedio (`step_36`) de la ejecución `opus-high-v3`, que se prolongó al menos hasta la hora 45 (`h045`). Según la model card, el run no produjo ninguna mejora en los pesos entrenados; los resultados se consideran negativos. No se han publicado detalles sobre el conjunto de datos, el número de tokens de entrenamiento ni el método de optimización empleado.

La etiqueta `intermediate` indica que el checkpoint se retiene únicamente con fines de reproducibilidad y análisis cualitativo. El archivo de datos asociado se encuentra en el dataset `agentic-ptb/opus-high-v3-data`.

## Capacidades

- No se han demostrado capacidades adicionales respecto al modelo base `Qwen3.5-9B-Base`.
- El checkpoint no presenta mejoras verificadas en generación de texto, razonamiento, código o matemáticas.
- No se ha confirmado soporte para tool calling, funciones o uso agéntico.
- Al ser un resultado negativo, no se recomienda su uso para ninguna tarea práctica.

## Casos de uso

- **Estudio de reproducibilidad**: el checkpoint permite reproducir el experimento `opus-high-v3` y verificar los resultados negativos reportados.
- **Análisis de fallos en entrenamiento agéntico**: investigar por qué el run no logró mejorar los pesos puede ayudar a depurar pipelines de entrenamiento agéntico.
- **Comparación de checkpoints intermedios**: analizar la evolución de los pesos a lo largo del run (paso 36 frente a otros pasos) para entender la dinámica de convergencia o divergencia.
- **Validación de metodologías**: contrastar este resultado negativo con otros runs de la serie `opus-high` para identificar patrones de éxito o fracaso.
- **Investigación sobre regularización y estabilidad**: estudiar si el entrenamiento agéntico introduce inestabilidades que impidan la mejora.
- **Documentación de resultados negativos**: servir como referencia pública para evitar que otros equipos repitan la misma configuración sin resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo está etiquetado como `negative-results` y no se ha evaluado su rendimiento en tareas estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 9,4 mil millones de parámetros en precisión FP16, el checkpoint requiere aproximadamente 19 GB de VRAM. Con cuantización de 8 bits, se reduce a unos 10 GB; con 4 bits, a unos 5 GB, aunque no se han publicado pesos cuantizados.
- **GPU recomendadas**: GPU con al menos 24 GB de VRAM para FP16 (por ejemplo, RTX 3090, RTX 4090, A10G). Para cuantización ligera, una GPU de 8-12 GB podría ser suficiente, pero no hay garantías.
- **Compatibilidad con GPU de consumo**: sí, una RTX 4090 (24 GB) puede cargar el modelo en FP16; tarjetas de 16 GB requerirían cuantización.
- **Opciones de despliegue**: no se ha probado con vLLM, llama.cpp, Ollama o TGI. Dado que los pesos están en `safetensors`, podrían convertirse a GGUF para su uso con llama.cpp, pero no se ha verificado.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| `Qwen/Qwen3.5-9B-Base` | 9,4B | no disponible en esta ficha | Apache 2.0 | Referencia (modelo base) |
| `opus-high-v3.h045.lrA.step_36` | 9,4B | no disponible | Apache 2.0 | Sin benchmarks; resultado negativo |
| Otros checkpoints de la serie `opus-high` (v1, v2) | 9,4B | no disponible | Apache 2.0 | Sin datos publicados |

La comparativa se limita a modelos de la misma serie y al modelo base, ya que no se dispone de información sobre alternativas de la misma categoría con datos de rendimiento comparables.

## Limitaciones y advertencias

- **Resultado negativo**: el run no encontró ninguna mejora en los pesos entrenados; el checkpoint no representa un avance respecto al modelo base.
- **Checkpoint intermedio**: no es un modelo final ni ha sido sometido a evaluación rigurosa; su calidad es desconocida.
- **Sesgos y alucinaciones**: al derivar de Qwen3.5-9B-Base, hereda los sesgos y limitaciones del modelo base, pero no se ha evaluado su comportamiento específico.
- **Uso en producción**: no recomendado. No hay evidencia de que funcione correctamente en tareas reales.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero dado el carácter experimental, no se recomienda su despliegue.
- **Documentación incompleta**: no se han publicado detalles sobre datos de entrenamiento, configuración de hiperparámetros ni metodología de evaluación.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v3.h045.lrA.step_36)
- [Dataset de archivo del run](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Índice de datasets de AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)
