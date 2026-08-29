# dragonlimited/DragonCode-787M

## Resumen

DragonCode-787M es un modelo de lenguaje de dominio específico (código y finanzas) desarrollado por el usuario de Hugging Face "dragonlimited" como parte de una familia de modelos llamada DragonCode. Según la model card, se trata de un modelo de 787 millones de parámetros, diseñado para el pretraining con un presupuesto de 15.740 millones de tokens (según la regla de Chinchilla para entrenamiento óptimo). Utiliza el tokenizer de StarCoder2-3B (vocabulario de 49.152 tokens) y está pensado para tareas de generación y comprensión de código fuente, así como de documentos financieros y profesionales.

La relevancia de este modelo radica en su tamaño compacto (787M) que permite ejecutarse en hardware de gama media, aunque su estado actual es de "pretraining en curso": la model card indica que el entrenamiento del tier 787M aún no ha comenzado (está esperando la finalización del corpus financiero). Por tanto, el modelo no está completamente entrenado ni evaluado, y no se han publicado pesos finales ni resultados de benchmarks. Se trata de un proyecto en desarrollo activo, con checkpoints intermedios almacenados en el repositorio de Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder, sin confirmar) |
| Parametros totales | ~787 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente inglés por el dominio, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card menciona `checkpoint-latest.pt`, lo que sugiere PyTorch, pero no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna del modelo (número de capas, dimensiones de atención, mecanismo de atención, etc.). Se sabe que utiliza el tokenizer de StarCoder2-3B, lo que sugiere una arquitectura de transformer decoder estándar, pero no se confirma. El entrenamiento se realiza mediante streaming desde shards de tokens alojados en Hugging Face (repositorios `DragonCode-Coding-Tokens` para código y `DragonCode-Finance-Tokens` para finanzas), con lectura directa mediante mmap y reanudación automática desde Hugging Face en caso de interrupción. El presupuesto de entrenamiento es de 15.740 millones de tokens en una sola época, siguiendo la regla de Chinchilla (20× el número de parámetros). No se menciona el uso de RLHF, DPO ni otras técnicas de ajuste fino posterior al pretraining.

## Capacidades

Según la información disponible, el modelo está diseñado para el dominio de código y finanzas. Sin embargo, al tratarse de un modelo en fase de pretraining sin evaluación publicada, no se pueden confirmar capacidades específicas. No hay información sobre:

- Generación de texto, razonamiento, matemáticas o visión.
- Soporte de tool calling o function calling.
- Capacidades de agente o razonamiento multi-paso.
- Capacidades multilingües.
- Modo de pensamiento (thinking mode) u otras características especiales.

La única capacidad inferible es la de procesar y generar texto en los dominios de código y finanzas, pero sin validación empírica.

## Casos de uso

Dado el estado inmaduro del modelo y la ausencia de evaluaciones, no es posible recomendar casos de uso concretos con garantías. Potencialmente, un modelo de 787M entrenado en código y finanzas podría aplicarse a tareas como:

- Asistencia en generación de código para lenguajes de programación populares (Python, JavaScript, etc.), aunque sin benchmarks no se puede afirmar su calidad.
- Análisis y resumen de documentos financieros (informes 10-K, noticias, artículos), pero requeriría validación.
- Extracción de información estructurada de textos financieros.

Sin embargo, cualquier uso en producción sería prematuro hasta que se complete el entrenamiento y se publiquen evaluaciones. Se recomienda esperar a la versión final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Tampoco hay comparaciones con modelos similares. Por tanto, no se puede evaluar el rendimiento del modelo en tareas estándar.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware. Dado el tamaño de 787M de parámetros, se puede estimar de forma orientativa que:

- En FP16 (precisión completa), el modelo ocuparía aproximadamente 1,6 GB de VRAM (787M × 2 bytes).
- En int8, alrededor de 0,8 GB.
- Sería ejecutable en GPUs de consumo como una RTX 3060 (12 GB) o superiores, y también en CPUs con suficiente RAM.

No obstante, estos valores son estimaciones generales y no constituyen especificaciones oficiales. No se mencionan opciones de despliegue (vLLM, llama.cpp, Ollama, etc.) ni métricas de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. La familia DragonCode incluye otros tamaños (150M, 387M, 1.2B, 2.4B) según la model card, pero no hay datos de rendimiento ni de arquitectura para comparar. No se puede establecer una comparativa con modelos de código de tamaño similar (por ejemplo, StarCoderBase-3B, CodeGen-350M o CodeT5+) porque no hay métricas objetivas.

## Limitaciones y advertencias

- El modelo está en fase de pretraining y no ha sido evaluado; no se garantiza su calidad ni su comportamiento.
- No se ha publicado información sobre sesgos, alucinaciones o limitaciones de contexto.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o modificación.
- El entrenamiento se centra en código y finanzas, por lo que su rendimiento en otros dominios será probablemente deficiente.
- El repositorio contiene checkpoints intermedios que pueden no ser estables ni representativos del modelo final.
- No hay documentación sobre el proceso de datos (filtrado, deduplicación, etc.), lo que dificulta evaluar posibles sesgos.
- La falta de información sobre arquitectura y contexto impide planificar su integración en sistemas de producción.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/dragonlimited/DragonCode-787M
- Perfil del usuario dragonlimited: https://huggingface.co/dragonlimited/models
- Repositorio de tokens de código (mencionado en la model card): https://huggingface.co/dragonlimited/DragonCode-Coding-Tokens (inferido, no confirmado)
- Repositorio de tokens financieros (mencionado en la model card): https://huggingface.co/dragonlimited/DragonCode-Finance-Tokens (inferido, no confirmado)

Nota: la model card contiene referencias a scripts y configuraciones internas (por ejemplo, `configs/DragonCode-787M.yaml`) que no están públicamente accesibles desde el repositorio. No se han encontrado papers, blogs ni demos asociados.
