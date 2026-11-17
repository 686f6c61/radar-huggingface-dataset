# By-Eureka/Qwen3.8-27B-eureka-sft-v1

## Resumen

Qwen3.8-27B-eureka-sft-v1 es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.8-27B, desarrollado por By-Eureka. El modelo está especializado en demostración de teoremas en Lean 4 y razonamiento agéntico, y se ha entrenado sobre trayectorias de agente procedentes del conjunto de datos By-Eureka/eureka-rolloutsamples. Mantiene la modalidad image-text-to-text del modelo base, por lo que conserva la torre de visión original.

El entrenamiento se realizó con el framework slime sobre backend Megatron, en 8 GPU GB200 con paralelismo de tensor 4 y paralelismo de datos 2. Se utilizaron 1694 trayectorias de entrenamiento (con 111 reservadas para validación), durante 3 épocas y 155 pasos, con un batch global de 32 y una tasa de aprendizaje final de 1e-6. La pérdida final de entrenamiento fue de 0,068.

El modelo cuenta con 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) y se distribuye bajo licencia Apache 2.0. Es una primera versión que, según el autor, aún no ha sido evaluada, por lo que no hay datos públicos de benchmarks. Su relevancia radica en ser un ejemplo de especialización vía SFT de un modelo multimodal grande para tareas formales de demostración de teoremas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.8-27B; incluye torre de visión y pesos MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer multimodal con pipeline image-text-to-text. El ajuste fino no modifica la torre de visión ni los pesos MTP (multi-token prediction) del modelo base, según indica la model card; los cambios se concentran en los pesos del modelo de lenguaje. El entrenamiento se llevó a cabo con slime sobre backend Megatron, en 8 GPU GB200 con TP=4 y DP=2.

Los datos de entrenamiento consisten en 1694 trayectorias de agente del conjunto By-Eureka/eureka-rolloutsamples, con 111 trayectorias reservadas para validación. Se realizaron 3 épocas y 155 pasos con batch global de 32 y tasa de aprendizaje final de 1e-6, alcanzando una pérdida final de entrenamiento de 0,068. No se especifican en la información disponible detalles sobre composición del dataset, uso de RLHF/DPO ni innovaciones técnicas adicionales más allá del propio proceso de SFT.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto (image-text-to-text), con la torre de visión sin modificar respecto al modelo base.
- Demostración de teoremas en Lean 4, especialidad del ajuste fino.
- Razonamiento agéntico multi-paso, entrenado sobre trayectorias de agente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Demostración interactiva de teoremas en Lean 4: el modelo puede generar pasos de prueba y tácticas a partir de un enunciado formal, aprovechando el entrenamiento específico sobre trayectorias de demostración.
- Asistencia en entornos de prueba formal: integración en flujos de trabajo donde se propone una prueba y se verifica con el comprobador de Lean 4, usando el modelo para generar candidatos de táctica.
- Razonamiento agéntico sobre trayectorias: al haberse entrenado con trayectorias de agente, puede emplearse en pipelines que requieren secuencias de acciones con realimentación intermedia.
- Análisis de documentos con imágenes y texto: gracias a la modalidad image-text-to-text heredada, puede procesar capturas, diagramas o fórmulas en imagen junto con instrucciones textuales.
- Investigación en SFT y ajuste de modelos multimodales: sirve como referencia reproducible de un pipeline slime/Megatron sobre GB200 para especializar un modelo de 27,8B en un dominio formal.
- Prototipado de asistentes matemáticos: combinación de razonamiento textual y demostración formal para explorar asistentes que traduzcan intuición matemática a pasos verificables en Lean 4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que es una primera versión "not yet evaluated".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 27,8B parámetros en precisión completa (BF16) requiere del orden de 55,6 GB solo para pesos, coherente con el tamaño del repositorio (55,6 GB); en cuantización de 8 bits rondaría los 28 GB y en 4 bits unos 14 GB, aunque estos valores no están confirmados por el autor.
- GPU recomendadas: el entrenamiento se realizó en 8x GB200 (TP=4, DP=2); para inferencia se requieren GPU de alta capacidad de memoria (A100 80 GB, H100 80 GB, GB200) si se usa BF16.
- Cabe en GPU de consumo: no disponible de forma confirmada; con cuantizaciones agresivas podría ser viable en GPUs de 24 GB o más, pero no hay datos oficiales.
- Opciones de despliegue: transformers (librería declarada); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| Qwen3.8-27B-eureka-sft-v1 | 27,8B | no disponible | image-text-to-text | Apache 2.0 | no (según autor) |
| Qwen/Qwen3.8-27B (base) | no disponible en la información | no disponible | image-text-to-text | no disponible en la información | no disponible en la información |
| Otros ajustes SFT para Lean 4 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El autor indica que es una primera versión y que no ha sido evaluada; no hay evidencia publicada de su calidad en tareas de demostración.
- El ajuste se realizó sobre un conjunto reducido (1694 trayectorias), lo que puede limitar la generalización fuera de la distribución de entrenamiento.
- Riesgo de alucinación en la generación de pruebas formales: las tácticas generadas pueden no ser válidas en Lean 4 y requieren verificación con el comprobador.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto o idioma: no disponibles en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de la licencia del modelo base Qwen/Qwen3.8-27B.
- La torre de visión y los pesos MTP no se han ajustado, por lo que el rendimiento multimodal es el del modelo base y no se ha validado tras el SFT.
- Solo 14 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/By-Eureka/Qwen3.8-27B-eureka-sft-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de trayectorias: https://huggingface.co/datasets/By-Eureka/eureka-rolloutsamples
- Framework slime: no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
