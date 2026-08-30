# agentic-ptb/opus-high-v3.h039.bag2.step_12

## Resumen

`agentic-ptb/opus-high-v3.h039.bag2.step_12` es un checkpoint intermedio derivado del modelo base `Qwen/Qwen3.5-9B-Base`, generado durante un experimento de entrenamiento dirigido por agentes autónomos (Claude Code) dentro del proyecto AgentPTB. El autor lo clasifica explícitamente como un artefacto de reproducibilidad y estudio cualitativo, no como un modelo con mejoras de rendimiento: el run `opus-high-v3` no encontró ninguna mejora en los pesos entrenados, y el propio aviso de la model card advierte que no debe inferirse calidad a partir de su publicación.

El checkpoint tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), está publicado en formato safetensors y se distribuye bajo licencia Apache-2.0. Al ser un checkpoint intermedio de un experimento fallido, no se han documentado capacidades específicas ni resultados de benchmarks. Su interés reside únicamente en el ámbito de la reproducibilidad científica y el estudio de procesos de entrenamiento autónomo, no en su uso como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de `Qwen/Qwen3.5-9B-Base`, un transformer decoder-only de aproximadamente 9,4 mil millones de parámetros. El checkpoint fue generado durante el run `opus-high-v3` del proyecto AgentPTB, donde un agente Claude Code ejecutó tareas de fine-tuning supervisado (SFT) sobre el modelo base. Según la documentación del autor, el run no produjo ninguna mejora en los pesos entrenados; de hecho, el archivo de índice del proyecto indica que un run anterior (`opus-high-v2`) fue abortado porque todos sus cinco intentos de SFT regresaron los tensores del modelo base sin cambios. Este checkpoint concreto corresponde a la hora `h039` del run y se conserva únicamente con fines de reproducibilidad y análisis cualitativo. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni técnicas como RLHF o DPO.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint.
- Hereda teóricamente las capacidades del modelo base `Qwen/Qwen3.5-9B-Base` (generación de texto, razonamiento, código, etc.), pero al tratarse de un checkpoint intermedio sin mejoras verificadas, no se garantiza ningún comportamiento particular.
- No se ha confirmado soporte de tool calling, function calling, capacidades multimodales ni modos de razonamiento especiales.
- No se dispone de información sobre capacidades multilingües.

## Casos de uso

- Reproducibilidad de experimentos: este checkpoint sirve para auditar el proceso de entrenamiento autónomo de AgentPTB, permitiendo a otros investigadores verificar los pesos intermedios y comparar con el modelo base.
- Estudio de fallos en entrenamiento: útil para analizar por qué un run de fine-tuning no logra mejorar el rendimiento, contribuyendo a la investigación sobre robustez de pipelines de entrenamiento autónomo.
- Análisis de deriva de pesos: permite estudiar si los pesos han cambiado respecto al modelo base y en qué dirección, aunque el autor indica que no hubo mejora.
- No se recomienda su uso en aplicaciones prácticas, desarrollo de productos o cualquier escenario de producción debido a la ausencia de validación y a su naturaleza de resultado negativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Dado que el run no encontró mejoras, es probable que el rendimiento sea equivalente o inferior al del modelo base, pero no hay datos que lo confirmen.

## Requisitos de hardware

No se dispone de requisitos oficiales de hardware para este checkpoint. Como orientación general basada en el tamaño de parámetros (9,4B), un modelo de estas dimensiones en precisión FP16 requiere aproximadamente 19 GB de VRAM solo para los pesos, más memoria para activaciones y contexto. Esto implica que:

- Una GPU con 24 GB de VRAM (por ejemplo, RTX 3090 o RTX 4090) podría alojar el modelo en FP16 con un contexto moderado, aunque con limitaciones.
- Para cuantizaciones de 8 bits o 4 bits, el consumo de VRAM se reduce a aproximadamente 10 GB y 5 GB respectivamente, lo que permitiría ejecutarlo en GPUs de consumo como la RTX 4060 Ti o la RTX 3080.
- Para despliegue en producción se recomendarían GPUs de datacenter como A100 o H100, pero dado el carácter experimental del checkpoint, no se sugiere ningún despliegue práctico.
- No se han publicado mediciones de latencia ni throughput.

## Comparativa con modelos similares

Dado que este checkpoint es un derivado intermedio de `Qwen/Qwen3.5-9B-Base` y no un modelo independiente con características propias, no se dispone de comparativas significativas. La única referencia relevante es el propio modelo base:

| Modelo | Parametros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| `opus-high-v3.h039.bag2.step_12` | 9,4B | No disponible | Apache-2.0 | Sin benchmarks publicados |
| `Qwen/Qwen3.5-9B-Base` | 9,4B | No disponible | Apache-2.0 | No disponible en la información proporcionada |

No se han encontrado modelos comparables de la misma categoría (checkpoints intermedios de experimentos fallidos) en la documentación disponible.

## Limitaciones y advertencias

- Checkpoint intermedio sin mejoras verificadas: el propio autor advierte que el run no encontró ninguna mejora en los pesos entrenados. No debe utilizarse como modelo final.
- Riesgo de alucinación y sesgos: al ser un derivado de Qwen3.5-9B-Base sin evaluación adicional, no se conocen sus sesgos específicos ni su comportamiento ante entradas adversas.
- Sin validación de producción: no hay evidencia de que funcione correctamente en tareas reales; su uso en aplicaciones comerciales o críticas está totalmente desaconsejado.
- Información incompleta: no se dispone de datos sobre contexto, idiomas, cuantización ni benchmarks, lo que limita cualquier evaluación seria.
- Naturaleza experimental: el proyecto AgentPTB parece centrado en el estudio de entrenamiento autónomo; este checkpoint es un artefacto de investigación, no un producto.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v3.h039.bag2.step_12)
- [Dataset asociado al run](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Índice del proyecto AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)
