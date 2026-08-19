# OrionLLM/LRM-3.2

## Resumen

LRM-3.2 es un modelo de razonamiento desarrollado por OrionLLM (Orion Research) que parte de Qwen3.6-27B, un transformer denso de 27 000 millones de parámetros, y lo ajusta para comprimir drásticamente la traza de razonamiento interno (chain-of-thought) sin degradar la calidad de la respuesta final. La idea central es que el pensamiento debe ser rápido, directo y denso, eliminando el relleno narrativo que la mayoría de los modelos de razonamiento generan de forma habitual. El resultado es una reducción de hasta 198 veces en los tokens de razonamiento para una misma tarea, lo que se traduce en menor latencia y menor coste por petición.

El modelo se entrena mediante fine-tuning con una pérdida aplicada exclusivamente a la traza de pensamiento, sobre los datasets ProCreations/grug-think y grug-think-v3-10k, siguiendo el enfoque pionero de ProCreations/grug-27b. No se modifican el tokenizador, la longitud de contexto ni el formato de salida del modelo base. Está disponible bajo licencia Apache-2.0, con pesos en safetensors y cuantizaciones GGUF publicadas por la comunidad. Su relevancia actual radica en que aborda uno de los principales problemas de los modelos de razonamiento en producción: el coste computacional y la latencia asociados a cadenas de pensamiento excesivamente largas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.6-27B) |
| Parametros totales | 27 356 728 560 (27,36 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada de Qwen3.6-27B, no documentada) |
| Tipos de cuantizacion | GGUF (varios niveles publicados por bartowski), safetensors en el repo principal |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

LRM-3.2 es un fine-tuning de Qwen3.6-27B, un modelo denso de 27 000 millones de parámetros. No se introducen cambios arquitectónicos: se mantienen el tokenizador, la longitud de contexto y el formato de salida del modelo base. La única modificación es el estilo de razonamiento interno, que se comprime mediante un ajuste fino supervisado sobre datos de trayectoria de razonamiento.

El entrenamiento utiliza una pérdida aplicada exclusivamente a la traza de pensamiento (think-only loss), de modo que el modelo aprende a generar cadenas de razonamiento cortas y directas sin alterar la calidad de la respuesta final. Los datasets empleados son ProCreations/grug-think y ProCreations/grug-think-v3-10k, que contienen ejemplos de razonamiento comprimido. El enfoque está inspirado directamente en ProCreations/grug-27b, que introdujo esta técnica sobre la misma familia de modelos base. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación adicionales.

## Capacidades

- Razonamiento de cadena de pensamiento comprimido: genera trazas de pensamiento extremadamente cortas (por ejemplo, 33 tokens frente a 6 539 del modelo base en una tarea de programación) manteniendo la misma calidad en la respuesta final.
- Profundidad adaptativa: la longitud del razonamiento se escala con la dificultad de la tarea; problemas sencillos reciben una línea de pensamiento, mientras que problemas complejos mantienen una deliberación estructurada.
- Salida final sin cambios: las respuestas finales son completas, naturales y de calidad equivalente a las de modelos con razonamiento verboso.
- Inferencia eficiente: la compresión del razonamiento reduce la latencia y el gasto de tokens por respuesta sin pérdida de capacidad.
- Fiabilidad en sesiones largas: el razonamiento se mantiene denso y centrado en la tarea en escenarios agénticos y de múltiples pasos, sin derivar en hábitos verbales repetitivos.
- Soporte de entrada de imagen: según el repositorio GGUF de bartowski, el modelo admite entrada multimodal (se incluyen archivos de proyector mmproj), aunque esta capacidad no está documentada en la model card oficial.

## Casos de uso

- Agentes autónomos multi-paso: el razonamiento denso y sin divagaciones permite que el modelo mantenga el foco en tareas agénticas prolongadas, reduciendo la deriva y el coste de tokens en cada paso.
- Generación de código en producción: con un 86,9 en HumanEval, puede integrarse en pipelines de CI/CD para autocompletado o revisión de código, donde la menor latencia del razonamiento comprimido mejora la experiencia de desarrollo.
- Atención al cliente automatizada: la capacidad de razonar de forma concisa permite respuestas rápidas y precisas en conversaciones multi-turno, reduciendo el coste por interacción en despliegues a gran escala.
- Análisis matemático y resolución de problemas: con un 95,8 en GSM8K, es adecuado para tareas de razonamiento aritmético y lógico en entornos educativos o de análisis de datos.
- Sistemas de razonamiento encadenado: en aplicaciones que requieren encadenar múltiples pasos de inferencia (por ejemplo, planificación o búsqueda estructurada), la compresión del pensamiento reduce la latencia acumulada.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones GGUF, puede ejecutarse en GPUs de consumo con 16-24 GB de VRAM, manteniendo un razonamiento de calidad a un coste computacional reducido.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados, comparados con el modelo base Qwen3.6-27B:

| Benchmark | LRM-3.2 | Qwen3.6-27B |
|---|---|---|
| GSM8K | 95,8 | — |
| HumanEval | 86,9 | — |

El guion indica que el modelo base no ha sido medido en este harness. Según la documentación, ambos benchmarks reflejan respuestas de calidad equivalente entre LRM-3.2 y su modelo base; la diferencia reside en la traza de pensamiento, no en el resultado final. No se han publicado resultados en otros benchmarks estándar como MMLU, MATH o GPQA en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión BF16/FP16, el modelo requiere aproximadamente 55 GB de VRAM (27,36 B parámetros × 2 bytes). Con cuantización GGUF Q4_K_M, se estima entre 16 y 18 GB; con Q8, alrededor de 28 GB.
- GPUs recomendadas: A100 40 GB o 80 GB, H100, RTX 4090 24 GB (con cuantización Q4), RTX 3090 24 GB (con cuantización Q4), o GPUs profesionales con 48 GB o más para precisión completa.
- Compatibilidad con GPUs de consumo: sí, mediante cuantizaciones GGUF de 4 bits en GPUs con 16-24 GB de VRAM, como RTX 4080, RTX 4090 o RTX 3090.
- Opciones de despliegue: al estar basado en Qwen3.6-27B, es compatible con vLLM, llama.cpp, Ollama, TGI y otros frameworks que soporten la familia Qwen. El repositorio GGUF de bartowski incluye los archivos necesarios para llama.cpp y Ollama.
- Latencia y throughput: no se proporcionan cifras exactas, pero la compresión del razonamiento (hasta 198 veces menos tokens de pensamiento) implica una reducción sustancial de la latencia por respuesta en comparación con el modelo base, especialmente en tareas de razonamiento complejo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LRM-3.2 | 27,36 B | No disponible | Razonamiento comprimido (fine-tuning) | Apache-2.0 | safetensors, GGUF |
| Qwen3.6-27B | 27 B | No disponible | Modelo base de razonamiento verboso | Apache-2.0 | safetensors, GGUF |
| ProCreations/grug-27b | 27 B | No disponible | Pionero en razonamiento comprimido | No especificada | safetensors |

LRM-3.2 se diferencia de su modelo base únicamente en la compresión de la traza de pensamiento, manteniendo la misma arquitectura y calidad de salida. Frente a grug-27b, adopta el mismo enfoque pero bajo el pipeline de evaluación y nomenclatura de OrionLLM. No se dispone de datos comparativos con otros modelos de razonamiento de tamaño similar, como DeepSeek-R1-Distill-Qwen-27B o QwQ-32B, en la información proporcionada.

## Limitaciones y advertencias

- La longitud de contexto no está documentada en la model card; se hereda de Qwen3.6-27B, pero no se especifica su valor exacto.
- Los idiomas soportados no se indican; se asume que hereda las capacidades multilingües de Qwen3.6-27B, pero no hay confirmación oficial.
- No se han evaluado sesgos ni riesgos de alucinación específicos de este modelo; la documentación no incluye análisis de seguridad ni de sesgos.
- El soporte de entrada de imagen se menciona en el repositorio GGUF de bartowski, pero no está documentado en la model card oficial; su fiabilidad y rendimiento multimodal no han sido verificados por el autor.
- Los benchmarks reportados (GSM8K y HumanEval) no incluyen comparación con el modelo base ni con otros modelos, lo que limita la interpretación de los resultados.
- Al ser un fine-tuning, la calidad final depende de la del modelo base; cualquier limitación de Qwen3.6-27B se hereda.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos de los datasets de entrenamiento (grug-think y grug-think-v3-10k) para asegurar el cumplimiento de sus respectivas licencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OrionLLM/LRM-3.2
- Cuantizaciones GGUF (bartowski): https://huggingface.co/bartowski/OrionLLM_LRM-3.2-GGUF
- Dataset grug-think: https://huggingface.co/datasets/ProCreations/grug-think
- Dataset grug-think-v3-10k: https://huggingface.co/datasets/ProCreations/grug-think-v3-10k
- Modelo inspirador ProCreations/grug-27b: https://huggingface.co/ProCreations/grug-27b
