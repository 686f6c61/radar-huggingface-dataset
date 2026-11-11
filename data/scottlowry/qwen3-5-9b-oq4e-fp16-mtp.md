# scottlowry/Qwen3.5-9B-oQ4e-fp16-mtp

## Resumen

Qwen3.5-9B-oQ4e-fp16-mtp es una cuantización mixta del modelo Qwen/Qwen3.5-9B, publicada por el usuario scottlowry bajo la librería MLX. No se trata de un modelo entrenado desde cero, sino de una redistribución de pesos del modelo base de Qwen con una política de cuantización por capas que combina precisión de 4, 5 y 6 bits con tramos en FP16 y FP32, orientada a la inferencia en hardware Apple Silicon mediante el framework MLX.

El checkpoint conserva la estructura completa del modelo original: el tronco lingüístico (8.954B parámetros), un codificador de visión (0.456B) y una cabeza MTP (Multi-Token Prediction) de 0.243B, lo que suma 9.653.104.368 parámetros lógicos. La presencia de visión y de MTP indica que el modelo base es multimodal y que incorpora decodificación especulativa nativa mediante predicción de múltiples tokens.

La relevancia de esta ficha radica en que documenta un caso de cuantización mixta de precisión adaptativa: el autor aplica 4 bits al 73,3% de los pesos, pero eleva a 5 y 6 bits determinadas capas y mantiene en FP32 los módulos sensibles (4,7% de los pesos, presumiblemente normas y embeddings). El resultado ocupa 6,93 GiB en disco con una media efectiva de 6,167 bits por peso, un compromiso poco habitual que prioriza la fidelidad numérica sobre la compresión máxima.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5), con codificador de visión y cabeza MTP; no se detalla la configuración interna |
| Parámetros totales | 9.653.104.368 (9,653B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: affine 4-bit grupo 64, affine 5-bit grupo 64, affine 6-bit grupo 64, FP16 y FP32; media efectiva 6,167 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantización oQ de oMLX v0.7.4.dev1 |

## Arquitectura y entrenamiento

El checkpoint deriva del modelo base Qwen/Qwen3.5-9B, del que no se proporcionan detalles de entrenamiento en la información disponible: ni número de tokens, ni composición del dataset, ni si hubo RLHF o DPO. Lo que sí se puede afirmar por la estructura de pesos es que el modelo integra tres componentes diferenciados: un tronco lingüístico de 8.954B parámetros, un módulo de visión de 0.456B (1.824 GB en FP32) y una cabeza MTP de 0.243B destinada a la predicción de múltiples tokens, técnica habitualmente empleada para decodificación especulativa y aceleración de la generación.

La innovación técnica de esta publicación no está en el entrenamiento sino en el esquema de cuantización. El autor utiliza oQ, la herramienta de cuantización mixta de oMLX, que asigna precisión por bloques: 7.079B parámetros en 4 bits (3.708 GiB), 1.016B en 5 bits (0.651 GiB), 1.067B en 6 bits (0.808 GiB), 0.035B en FP16 (0.065 GiB) y 0.456B en FP32 (1.699 GiB). El módulo de visión se mantiene íntegramente en FP32, lo que explica que represente solo el 4,7% de los parámetros pero el 24,5% del almacenamiento. El checkpoint fue recuantizado el 11 de noviembre de 2026 con oMLX v0.7.4.dev1, y el autor recomienda volver a descargarlo si se tenía una copia anterior.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-9B, si bien no se documentan evaluaciones específicas en esta ficha.
- Procesamiento de visión: el checkpoint incluye un codificador visual de 0.456B parámetros en FP32, por lo que se espera soporte de entrada de imágenes, aunque el autor no detalla las capacidades concretas.
- Predicción de múltiples tokens (MTP): la cabeza dedicada de 0.243B permite generar varios tokens por paso, lo que habilita decodificación especulativa y reduce la latencia por token.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y el tamaño de 6,93 GiB permiten cargar el modelo en equipos con memoria unificada de 16 GB o superior, algo imposible con el checkpoint original en FP16 (que rondaría los 19 GB).
- Prototipado de aplicaciones multimodales en escritorio: la inclusión del codificador de visión permite experimentar con tareas imagen-texto sin depender de servicios en la nube, siempre que se valide el comportamiento real del módulo visual cuantizado.
- Aceleración de la generación mediante MTP: la cabeza de predicción multi-token puede aprovecharse para reducir la latencia en aplicaciones interactivas como asistentes de escritura o chat en local.
- Evaluación de técnicas de cuantización mixta: el desglose por bits publicado por el autor convierte este checkpoint en un caso de estudio útil para comparar la degradación de calidad frente a cuantizaciones uniformes de 4 bits.
- Desarrollo de pipelines de investigación reproducibles: al estar en safetensors y MLX, se integra en flujos de experimentación con Python y mlx-lm sin necesidad de GPU dedicada.
- Distribución de modelos en entornos con almacenamiento limitado: los 6,93 GiB frente a los 28,9 GB del repositorio completo (que incluye otros artefactos) facilitan su traslado a portátiles y estaciones de trabajo modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: en torno a 7 GB solo para los pesos; con overhead de ejecución (KV cache, buffers) conviene disponer de al menos 10-12 GB libres.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3 y M4, con preferencia por variantes Pro, Max y Ultra). En GPUs NVIDIA no es el formato nativo.
- Compatibilidad con GPU de consumo: sí en Mac con memoria unificada de 16 GB o más; en el ecosistema NVIDIA requeriría conversión previa a otro formato, no documentada por el autor.
- Opciones de despliegue: mlx-lm y el propio ecosistema oMLX; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-oQ4e-fp16-mtp (este) | 9,653B | no disponible | Mixta 4/5/6 bits + FP16/FP32, 6,167 bits/peso | no disponible | Hugging Face, formato MLX |
| Qwen/Qwen3.5-9B (base) | 9B (aprox.) | no disponible | FP16/BF16 original | no disponible | Hugging Face |
| Cuantizaciones uniformes de 4 bits del mismo base | 9B (aprox.) | no disponible | 4 bits uniforme | depende del publicador | habituales en Hugging Face |

La comparación cuantitativa con alternativas concretas no está disponible: la información proporcionada no incluye resultados de benchmarks ni fichas de otros checkpoints del mismo modelo base.

## Limitaciones y advertencias

- La licencia no está declarada en la ficha de Hugging Face, por lo que el uso comercial queda en un limbo legal hasta consultar la licencia del modelo base Qwen/Qwen3.5-9B.
- El módulo de visión se mantiene en FP32 y no se documenta si la cuantización mixta del tronco lingüístico degrada la calidad de las respuestas multimodales.
- No hay benchmarks publicados que permitan cuantificar la pérdida de calidad frente al modelo original en FP16.
- El checkpoint está atado al ecosistema MLX y a Apple Silicon; su uso en GPUs NVIDIA o AMD requiere conversión manual no documentada.
- El autor advirtió de una recuantización el 11 de noviembre de 2026: las copias descargadas antes de esa fecha pueden diferir de la versión actual.
- Riesgo de alucinación, sesgos y limitaciones idiomáticas: no disponibles en la información proporcionada, aunque son inherentes al modelo base.
- El número de descargas (58) y de likes (0) indica una adopción muy baja, sin validación comunitaria significativa.

## Enlaces

- [Hugging Face: scottlowry/Qwen3.5-9B-oQ4e-fp16-mtp](https://huggingface.co/scottlowry/Qwen3.5-9B-oQ4e-fp16-mtp)
- [Modelo base: Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- [oQ / oMLX (herramienta de cuantización)](https://github.com/jundot/omlx)
