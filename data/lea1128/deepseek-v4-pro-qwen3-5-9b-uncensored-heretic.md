# lea1128/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una variante "descensurada" (abliterated) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicada por el usuario lea1128. El modelo base es un fine-tune de razonamiento de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", con aproximadamente 250.000 muestras centradas en matematicas y disciplinas STEM. La variante heretic aplica una tecnica de ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) para eliminar los comportamientos de rechazo del modelo original.

El resultado es un modelo de 9.409.813.744 parametros (9,4B) que conserva la capacidad de razonamiento estructurado y resolucion de problemas del modelo base, pero con una tasa de rechazo reducida de 100/100 a 3/100 segun las metricas del autor, a costa de una divergencia KL de 0,0422 respecto al original. La licencia es Apache 2.0 y soporta seis idiomas: ingles, chino, coreano, japones, espanol y ruso.

Es relevante para desarrolladores e investigadores que necesitan un modelo compacto de razonamiento desplegable en hardware de consumo, sin las restricciones de rechazo del modelo original, y que valoran la posibilidad de ajuste fino posterior. No obstante, la ausencia de benchmarks publicados y la naturaleza experimental de la ablacion exigen cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, segun tags del modelo) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no es MoE segun los datos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; se menciona NVFP4 evaluado) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5 (transformer denso de 9,4B parametros), segun los tags `qwen3_5` y `transformers`. El modelo base Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B fue entrenado mediante destilacion de las respuestas de DeepSeek-V4-Pro en modo "Max Effect", con un conjunto de aproximadamente 250.000 muestras de matematicas y STEM. Los tags indican el uso de SFT, RL y GSPO (Group Sequence Policy Optimization) durante el post-entrenamiento, ademas de MTP (Multi-Token Prediction) y evaluacion en NVFP4.

La variante heretic aplica Arbitrary-Rank Ablation (ARA) sobre las capas 9 a 24, con los siguientes hiperparametros: `preserve_good_behavior_weight` = 0,8264, `steer_bad_behavior_weight` = 0,0003, `overcorrect_relative_weight` = 0,9645 y `neighbor_count` = 12. Esta tecnica modifica los pesos para suprimir direcciones de activacion asociadas a rechazos, preservando el comportamiento util. El autor reporta una reduccion de rechazos de 100/100 a 3/100 con una divergencia KL de 0,0422 frente al modelo original.

## Capacidades

- Generacion de texto y razonamiento multi-paso con descomposicion estructurada de problemas.
- Razonamiento matematico y resolucion de problemas STEM, entrenado especificamente en ~250.000 muestras de este dominio.
- Generacion de codigo: el autor reporta mejoras pequenas en programacion y uso de herramientas pese a no recibir SFT especifico de codigo.
- Tool calling y function calling (tags `tool-use`, `function-calling`).
- Capacidades multimodales de entrada imagen-texto (tag `image-text-to-text`).
- Soporte multilingue en ingles, chino, coreano, japones, espanol y ruso.
- Modo de razonamiento (tag `reasoning`).
- Comportamiento descensurado: tasa de rechazo reducida (3/100 segun el autor).

## Casos de uso

- Resolucion de problemas matematicos y cientificos: el modelo esta entrenado sobre ~250.000 muestras de matematicas y STEM, por lo que es adecuado para asistencia en calculo, fisica, quimica y analisis de datos cientificos con descomposicion paso a paso.
- Generacion de codigo en pipelines de desarrollo: soporta tool calling y function calling, lo que permite integrarlo en flujos de CI/CD o asistentes de IDE que invocan funciones externas.
- Agentes multi-paso: la capacidad de razonamiento estructurado y el soporte de herramientas permiten construir agentes que planifican y ejecutan tareas con llamadas a APIs.
- Investigacion sobre alineacion y seguridad: al ser una variante abliterated con metricas de rechazo y KL publicadas, sirve como caso de estudio para analizar el efecto de la ablacion sobre el comportamiento del modelo.
- Asistencia en atencion al cliente tecnica: con soporte multilingue (seis idiomas) y razonamiento, puede gestionar consultas tecnicas en varios idiomas, aunque la longitud de contexto no esta confirmada.
- Analisis de imagenes con texto (image-text-to-text): el tag multimodal sugiere uso en tareas que combinan entrada visual y textual, como interpretacion de diagramas o documentos escaneados.
- Fine-tuning posterior: al estar en Apache 2.0 y safetensors, puede servir de base para ajustes especificos en dominios cientificos o tecnicos.

## Benchmarks y rendimiento

El autor publica unicamente metricas de comportamiento tras la ablacion, no benchmarks estandar de razonamiento:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para pesos (9,4B x 2 bytes), mas overhead de KV cache y activaciones; se recomienda 24 GB o mas.
- En cuantizacion de 8 bits: aproximadamente 9,4 GB de pesos; cabe en GPUs de 12-16 GB.
- En cuantizacion de 4 bits: aproximadamente 4,7 GB de pesos; cabe en GPUs de consumo de 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 3070).
- GPU recomendadas: A100 40/80 GB, H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) para FP16 en una sola GPU; RTX 3090/4080 para 8 bits.
- Cabe en GPU de consumo: si, en cuantizacion 4 u 8 bits; en FP16 requiere 24 GB (RTX 4090 o superior).
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference`), unsloth (tag `unsloth`); vLLM, llama.cpp y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (heretic) | 9,4B | no disponible | Apache 2.0 | Variante abliterated, rechazos 3/100 |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B | no disponible | Apache 2.0 | Modelo base, rechazos 100/100 |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | 4B | no disponible | no disponible | Version 4B de la misma familia |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | 9,4B (aprox.) | no disponible | no disponible | Fine-tune cientifico basado en este modelo |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion heretic elimina los rechazos de seguridad, lo que implica que el modelo puede generar contenido danino, ofensivo o inseguro sin filtros; no es adecuado para aplicaciones orientadas al publico sin moderacion externa.
- La divergencia KL de 0,0422 indica que el comportamiento del modelo se ha alterado respecto al original; puede degradar capacidades no relacionadas con el rechazo.
- No hay benchmarks publicados de razonamiento, matematicas o codigo; el rendimiento real en estas tareas no esta verificado de forma independiente.
- La longitud de contexto no esta documentada, lo que limita la planificacion de aplicaciones con ventanas largas.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validacion de la comunidad.
- Riesgo de alucinacion inherente a los modelos de 9B, especialmente en dominios fuera de matematicas y STEM.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante descensurada puede conllevar riesgos legales y reputacionales segun la jurisdiccion y el caso de uso.
- El soporte multilingue esta declarado, pero no hay evaluacion publicada de calidad por idioma.
- La fecha de creacion (2026-11-14) y la ausencia de actualizaciones sugieren un proyecto reciente y sin mantenimiento confirmado.

## Enlaces

- Hugging Face: https://huggingface.co/lea1128/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version 4B: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune cientifico DeepThought: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Proyecto Heretic: https://heretic-project.org
