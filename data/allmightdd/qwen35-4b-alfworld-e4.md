# Allmightdd/qwen35-4b-alfworld-e4

## Resumen

Allmightdd/qwen35-4b-alfworld-e4 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario Allmightdd. Se trata de un checkpoint final de inferencia en BF16 que conserva el tokenizer, el processor y la plantilla de chat originales del modelo base. El modelo está orientado a tareas de agente dentro del entorno ALFWorld, un benchmark de entornos domésticos textuales donde el agente debe ejecutar secuencias de acciones para cumplir objetivos.

El modelo cuenta con 4.539.265.536 parámetros totales en formato safetensors y un repositorio de 9,1 GB. La model card indica que la ejecución congelada de 134 tareas produjo 116 éxitos, 17 ceros válidos y un resultado sin puntuar, lo que sugiere un ajuste específico para el razonamiento multi-paso y la planificación de acciones en entornos simulados.

Su relevancia radica en que ejemplifica el patrón de fine-tuning de modelos pequeños (4B) para tareas de agente concretas, con licencia Apache 2.0 y pesos en safetensors, lo que facilita su despliegue y reproducción. No obstante, la documentación pública es muy escasa y no se detallan hiperparámetros, composición del dataset ni resultados de benchmarks generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, según tag `qwen3_5`) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.5-4B, un transformer decoder-only de la familia Qwen3.5. No se dispone de información detallada sobre la arquitectura interna (número de capas, dimensiones, mecanismos de atención) más allá de la inferencia por el tag `qwen3_5` y el recuento de parámetros. El checkpoint publicado es el resultado final de un entrenamiento orientado a ALFWorld, conservando el tokenizer, processor y chat template originales del modelo base.

La model card menciona una "ejecución congelada de 134 tareas" con 116 éxitos, 17 ceros válidos y un resultado sin puntuar, lo que apunta a una evaluación sobre el benchmark ALFWorld tras el ajuste. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o aprendizaje por refuerzo. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a la planificación de acciones en entornos textuales.
- Ejecución de tareas de agente en ALFWorld: navegación, manipulación de objetos y cumplimiento de objetivos domésticos.
- Soporte de tool calling / function calling: no disponible (no se documenta explícitamente).
- Soporte de agentes y razonamiento multi-paso: sí, es el propósito principal del ajuste.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Agente doméstico simulado: el modelo puede ejecutar secuencias de acciones en entornos ALFWorld para completar tareas como limpiar, cocinar o mover objetos, gracias a su ajuste específico sobre este benchmark.
- Evaluación de planificación multi-paso: útil como referencia para comparar estrategias de agente en entornos textuales con 134 tareas congeladas y una tasa de éxito reportada de 116/134.
- Investigación en aprendizaje por refuerzo y fine-tuning: sirve como punto de partida para experimentos de ajuste de modelos pequeños (4B) en tareas de agente con licencia Apache 2.0.
- Despliegue en entornos con recursos limitados: al ser un modelo de 4B en BF16 (9,1 GB), puede ejecutarse en GPUs de consumo con suficiente VRAM, lo que facilita prototipado rápido.
- Generación de trayectorias de entrenamiento: el checkpoint puede emplearse para producir datos de interacción agente-entorno que alimenten otros modelos o pipelines de RL.
- Reproducibilidad de experimentos: al conservar tokenizer, processor y chat template originales, permite reproducir la evaluación reportada en la model card y comparar con el modelo base.

## Benchmarks y rendimiento

| Benchmark | Resultado | Detalle |
|---|---|---|
| ALFWorld (134 tareas congeladas) | 116 éxitos, 17 ceros válidos, 1 sin puntuar | Ejecución final en BF16 reportada por el autor |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 12-16 GB de VRAM.
- GPU recomendadas: A100, H100 para producción; RTX 4090 (24 GB) para desarrollo y evaluación.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en BF16; en GPUs de 8-12 GB requeriría cuantización (no se proporcionan pesos cuantizados en el repo).
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión). No se documentan configuraciones específicas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Allmightdd/qwen35-4b-alfworld-e4 | 4,54B | no disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Apache 2.0 (según tag) | Hugging Face |
| Fine-tunes de agente en ALFWorld (otros) | variable | no disponible | variable | Hugging Face |

No se dispone de datos de rendimiento comparables de otros fine-tunes de ALFWorld en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen3.5-4B, puede heredar sesgos del modelo base y de los datos de ajuste.
- Riesgo de alucinación: presente como en cualquier modelo generativo; en tareas de agente puede producir acciones inválidas o planes incoherentes.
- Limitaciones de contexto o idioma: no se especifican la longitud de contexto ni los idiomas soportados; la model card no los detalla.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen3.5-4B y de los datos de entrenamiento.
- Caveats para producción: la documentación es mínima (sin hiperparámetros, dataset ni evaluación general); el modelo está especializado en ALFWorld y su rendimiento fuera de ese dominio es incierto. Solo 14 descargas y 0 likes indican poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Allmightdd/qwen35-4b-alfworld-e4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Informes de experimentos: https://huggingface.co/datasets/Allmightdd/rsi-experiment-reports
