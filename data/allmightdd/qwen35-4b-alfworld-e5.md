# Allmightdd/qwen35-4b-alfworld-e5

## Resumen

Allmightdd/qwen35-4b-alfworld-e5 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario Allmightdd bajo licencia Apache 2.0. El modelo está especializado en tareas de ALFWorld, un entorno de referencia para agentes que deben resolver tareas domésticas mediante instrucciones en lenguaje natural y acciones discretas. El nombre "E5" hace referencia a una iteración experimental dentro de una serie de ejecuciones documentadas por el autor en un repositorio de informes.

El checkpoint se presenta como la versión final de inferencia en BF16, conservando el tokenizer, el processor y la plantilla de chat originales del modelo base. Según la model card, una ejecución congelada de 134 tareas produjo 111 éxitos y 23 ceros válidos, y el modelo logró recuperarse en la siguiente acción en los 30 casos controlados. Estos datos apuntan a un uso muy concreto: investigación sobre agentes y razonamiento multi-paso en entornos simulados.

Con 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) y un repositorio de 9,1 GB, se trata de un modelo de tamaño medio, adecuado para despliegue en GPU de gama alta de consumo. No obstante, la información pública disponible es escasa: no se detallan idiomas soportados, pipeline, composición del dataset de entrenamiento ni resultados de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun el tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B, un transformer de aproximadamente 4,54 mil millones de parámetros. El tag `qwen3_5` confirma la familia arquitectónica, pero la información proporcionada no detalla el número de capas, la dimensión oculta, el mecanismo de atención ni la longitud de contexto nativa. Tampoco se especifica si emplea técnicas como atención lineal, decodificación especulativa o mezcla de expertos.

El ajuste fino se orienta a ALFWorld, un entorno de texto donde el agente debe completar tareas domésticas mediante comandos discretos (por ejemplo, navegar entre habitaciones, recoger objetos o usar electrodomésticos). La model card menciona una "ejecución congelada de 134 tareas" con 111 éxitos y 23 ceros válidos, así como una recuperación en la siguiente acción en 30 casos controlados. No se indica el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El checkpoint publicado corresponde a la inferencia final en BF16 con tokenizer, processor y plantilla de chat originales.

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a agentes en entornos simulados.
- Ejecución de acciones discretas dentro de ALFWorld (navegación, manipulación de objetos, uso de receptáculos).
- Recuperación tras acciones fallidas, según los 30 casos controlados reportados por el autor.
- Conservación del tokenizer, processor y plantilla de chat del modelo base, lo que facilita la integración con pipelines existentes de Qwen3.5.
- Capacidades del modelo base Qwen3.5-4B (generación general, código, matemáticas, multilingüismo) presumiblemente retenidas, aunque no verificadas en la información disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Investigación en agentes basados en lenguaje: el modelo puede evaluarse en ALFWorld para estudiar estrategias de planificación y recuperación de errores en entornos de texto, aprovechando el checkpoint ya ajustado para esa tarea.
- Reproducción de experimentos de referencia: sirve para replicar la ejecución de 134 tareas reportada por el autor y comparar tasas de éxito con otras variantes de la serie E1-E5.
- Desarrollo de agentes domésticos simulados: integrable en pipelines que requieran un agente capaz de interpretar instrucciones y emitir comandos discretos dentro de un entorno tipo ALFWorld.
- Evaluación de robustez ante fallos: los 30 casos controlados de recuperación permiten estudiar cómo el modelo corrige acciones erróneas en el siguiente paso.
- Base para nuevos ajustes finos: al ser un fine-tune Apache 2.0 sobre Qwen3.5-4B, puede servir como punto de partida para otras tareas de agentes o para experimentos de destilación.
- Prototipado de asistentes con instrucciones estructuradas: la plantilla de chat original facilita su uso en aplicaciones que requieran formato conversacional consistente.
- Docencia y divulgación: modelo de tamaño contenido (4,54 B) que cabe en GPU de consumo y permite demostrar conceptos de agentes y razonamiento multi-paso sin infraestructura costosa.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| ALFWorld (134 tareas, ejecución congelada) | 111 éxitos / 23 ceros válidos | Datos reportados en la model card |
| Recuperación tras fallo (30 casos controlados) | Recuperación en la siguiente acción en todos los casos | Datos reportados en la model card |
| MMLU, HumanEval, GSM8K u otros | no disponible | No publicados en la información proporcionada |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y KV cache (estimación orientativa de 12-16 GB para contextos moderados).
- En cuantización de 8 bits: en torno a 5-6 GB de pesos; en 4 bits: en torno a 3 GB, aunque no se confirma que existan versiones GGUF publicadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en BF16 con margen.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, con cuantización, en GPUs de 12-16 GB como RTX 4080 o RTX 4070 Ti.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama (estos dos últimos requieren conversión a GGUF, no confirmada), así como transformers con safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Allmightdd/qwen35-4b-alfworld-e5 | ~4,54 B | no disponible | Apache 2.0 | Fine-tune para ALFWorld |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | Apache 2.0 (presumible) | Modelo generalista |
| Otros fine-tunes de agentes sobre modelos de ~4 B | variable | variable | variable | Tareas de agentes |

La comparación cuantitativa con alternativas no está disponible: no se han publicado métricas comparables (MMLU, HumanEval, tasas de éxito en ALFWorld de otros modelos) en la información proporcionada. El modelo base Qwen3.5-4B es la referencia natural, pero no se detallan sus especificaciones completas.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste está orientado a ALFWorld, por lo que su rendimiento en tareas generales puede diferir del modelo base y no está verificado.
- Información pública muy limitada: no se detallan idiomas, contexto, dataset de entrenamiento ni benchmarks estándar, lo que dificulta evaluar su calidad fuera del entorno ALFWorld.
- Riesgo de alucinación: como todo modelo generativo, puede emitir acciones o comandos inválidos; la model card reporta 23 ceros válidos en 134 tareas, lo que indica fallos en una fracción no trivial de casos.
- Sesgos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda verificar las condiciones del modelo base Qwen3.5-4B y citar adecuadamente.
- Repositorio con muy poca tracción (9 descargas, 0 likes): no hay evidencia de validación comunitaria ni mantenimiento a largo plazo.
- Fecha de creación futura (2026-11-23) en los metadatos: conviene verificar la integridad y procedencia del checkpoint antes de usarlo en producción.
- No se confirma la disponibilidad de cuantizaciones GGUF ni de versiones optimizadas para llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Allmightdd/qwen35-4b-alfworld-e5
- Informes de experimentos: https://huggingface.co/datasets/Allmightdd/rsi-experiment-reports
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
