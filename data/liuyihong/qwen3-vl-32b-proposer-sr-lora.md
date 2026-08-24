# liuyihong/qwen3-vl-32b-proposer-sr-lora

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) de tipo QLoRA para el modelo multimodal `Qwen/Qwen3-VL-32B-Instruct`, desarrollado como parte del análisis suplementario del proyecto VEGA-SR (Symbolic Regression). El adaptador, denominado "Proposer LoRA", está diseñado para la tarea de regresión simbólica asistida por visión-lenguaje: el modelo base Qwen3-VL procesa imágenes y texto para proponer expresiones matemáticas simbólicas que ajusten datos observados.

El adaptador fue entrenado con LLaMA-Factory sobre un corpus de 10 000 registros (5 000 tareas pareadas de propuesta y reparación condicionada por crítico), con una división de evaluación de 2 % a nivel de ejemplo. Es un artefacto de análisis archivado: el estudio SFT comparativo quedó incompleto, por lo que no debe interpretarse como una estimación causal del efecto del SFT. El repositorio solo contiene los pesos del adaptador (0.5 GB), no los del modelo base, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-VL-32B-Instruct (dense transformer multimodal) |
| Parametros totales | No disponible (el adaptador LoRA no reporta su conteo de parámetros; el modelo base tiene 32B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 4 096 tokens (configuración de entrenamiento del adaptador; el modelo base soporta hasta 256K) |
| Tipos de cuantizacion | QLoRA 4-bit bitsandbytes para el adaptador; el modelo base admite cuantizaciones AWQ, GPTQ, GGUF (no incluidas aquí) |
| Idiomas soportados | No disponible (la model card del adaptador no lo especifica; el modelo base Qwen3-VL soporta multilingüismo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) + configuración PEFT |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 con dropout 0.05, aplicado sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del modelo base Qwen3-VL-32B-Instruct. El método de entrenamiento fue QLoRA de 4 bits con bitsandbytes, usando el framework LLaMA-Factory. El optimizador fue AdamW (betas 0.9/0.999, epsilon 1e-8), con learning rate 5e-5, scheduler cosine, warmup ratio 0.03, batch efectivo 16 (per-device batch 1, grad accumulation 16), gradientes con checkpointing, y 2 épocas sobre 9 800 ejemplos de entrenamiento. El paso final de entrenamiento fue el 1 226, y se retuvo el checkpoint final. La pérdida final de entrenamiento fue 0.3906462 y la de evaluación 0.3463553 sobre 200 ejemplos.

El dataset proviene de 5 000 tareas pareadas de symbolic regression, con 5 000 ejemplos de propuesta y 5 000 de reparación condicionada por crítico. La división de evaluación fue aleatoria a nivel de ejemplo (2 %), no a nivel de tarea, por lo que las particiones no son disjuntas por grupo de tareas. El contexto de entrenamiento se limitó a 4 096 tokens. El adaptador no incluye estado de optimizador ni argumentos de entrenamiento en pickle, por integridad y reproducibilidad.

## Capacidades

- Regresión simbólica: el adaptador está entrenado para proponer expresiones matemáticas simbólicas que ajusten a datos, típicamente representados como imágenes de gráficos o tablas (entrada multimodal).
- Reparación condicionada por crítico: los ejemplos de "Critic-conditioned repair" sugieren que el adaptador también puede corregir propuestas previas basándose en retroalimentación de un crítico.
- Integración con el modelo base Qwen3-VL-32B-Instruct: al ser un adaptador, hereda las capacidades del modelo base, incluyendo procesamiento de imágenes, video y texto intercalado, razonamiento multimodal y soporte de agentes.
- Tool calling y function calling: el modelo base Qwen3-VL-32B-Instruct soporta estas capacidades; el adaptador no las elimina, aunque el entrenamiento se centró en regresión simbólica.
- Multilingüismo: el modelo base es multilingüe; el adaptador no especifica restricciones idiomáticas, pero el corpus de entrenamiento no está descrito en cuanto a idiomas.

## Casos de uso

- Descubrimiento científico asistido: investigadores en física, biología o economía pueden usar el adaptador para proponer ecuaciones simbólicas que ajusten a datos experimentales representados en gráficos, acelerando la búsqueda de leyes subyacentes.
- Generación de modelos interpretables en aprendizaje automático: en lugar de usar redes neuronales opacas, el adaptador puede generar expresiones simbólicas compactas para tareas de regresión, facilitando la interpretabilidad.
- Análisis de series temporales financieras: el adaptador puede proponer fórmulas simbólicas para patrones de series temporales, aunque el corpus de entrenamiento no especifica dominio.
- Automatización de la investigación reproducible: al integrarse en pipelines de análisis de datos, el adaptador puede proponer y reparar modelos simbólicos de forma autónoma, reduciendo la intervención manual.
- Educación y tutoría en matemáticas: el modelo base con el adaptador puede explicar pasos de regresión simbólica a estudiantes, mostrando cómo se derivan expresiones a partir de datos.
- Generación de código para simulación: las expresiones simbólicas propuestas pueden convertirse directamente en código (por ejemplo, Python/SymPy) para simulación o validación, gracias a la integración con el modelo base.
- Benchmarking de métodos de symbolic regression: el adaptador puede servir como baseline en estudios comparativos de regresión simbólica, aunque su uso debe contextualizarse porque el estudio SFT quedó incompleto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta las pérdidas de entrenamiento y evaluación del adaptador (loss de entrenamiento 0.3904062, loss de evaluación 0.4463553) sobre el corpus de regresión simbólica, pero no se comparan con otros modelos ni se incluyen métricas externas (como MMLU, HumanEval o benchmarks de regresión simbólica). No se deben interpretar estos valores como rendimiento general.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.5 GB), pero requiere cargar el modelo base Qwen3-VL-32B-Instruct completo para inferencia. En FP16, el modelo base ocupa aproximadamente 64 GB de VRAM, por lo que se necesita una GPU de alta gama o cuantización.
- Para inferencia con el adaptador, se recomienda al menos 48 GB de VRAM si se usa el modelo base en FP16 (por ejemplo, una A6000 o A100 de 48 GB). Con cuantización 4-bit del modelo base, se puede reducir a ~24 GB, permitiendo uso en GPUs como RTX 4090 (24 GB) o RTX 3090.
- Opciones de despliegue: el adaptador PEFT puede cargarse con la librería `peft` de Hugging Face, junto con Transformers. Para inferencia de alto rendimiento, se puede servir con vLLM (si soporta PEFT), o mediante `llama.cpp` con el modelo base cuantizado en GGUF, aunque el adaptador LoRA debe convertirse al formato GGUF para usarse con llama.cpp.
- Latencia y throughput estimados: no se han publicado datos. Para un modelo de 32B en una GPU de 80 GB (A100/H100), la latencia de generación es del orden de 10-20 tokens/s en FP16; con cuantización 4-bit puede aumentar ligeramente el throughput pero la latencia depende del hardware.

## Comparativa con modelos similares

No hay comparativa directa disponible porque el adaptador es un artefacto de investigación específico para VEGA-SR y no se han publicado benchmarks comparativos. Como referencia, el modelo base Qwen3-VL-32B-Instruct compite con otros VLM de tamaño similar:

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-32B-Instruct (base) | Dense transformer multimodal | 32B | 256K | Apache 2.0 | Hugging Face |
| Qwen2.5-VL-32B-Instruct | Dense transformer multimodal | 32B | 32K | Apache 2.0 | Hugging Face |
| Llama 3.2 Vision (11B/90B) | Dense transformer multimodal | 11B/90B | 128K | Llama 3.2 Community | Hugging Face |
| Pixtral 12B | Dense transformer multimodal | 12B | 128K | Apache 2.0 | Hugging Face |

El adaptador no es comparable directamente con estos modelos, ya que solo añade una capa de adaptación para regresión simbólica sobre el modelo base.

## Limitaciones y advertencias

- El adaptador es un artefacto archivado: el estudio SFT comparativo quedó incompleto, por lo que no hay evidencia causal de que el adaptador mejore al modelo base sin SFT.
- La división de evaluación no es task-disjoint (los ejemplos de entrenamiento y evaluación pueden pertenecer a la misma tarea), lo que puede inflar las métricas de evaluación reportadas.
- El adaptador está entrenado específicamente para el dominio de regresión simbólica del corpus VEGA-SR; su generalización a otros dominios o formatos de entrada es desconocida.
- No se incluye el estado del optimizador ni la configuración completa de entrenamiento en pickle, lo que limita la reproducción exacta.
- El modelo base Qwen3-VL-32B-Instruct tiene sesgos y riesgos de alucinación inherentes a los LLM; el adaptador no corrige estos problemas.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que el corpus de datos de entrenamiento (no incluido) tenga términos compatibles con el uso comercial.
- El adaptador usa un contexto de 4 096 tokens durante el entrenamiento; si se usa con contexto más largo, el rendimiento puede degradarse.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/liuyihong/qwen3-vl-32b-proposer-sr-lora
- Modelo base Qwen3-VL-32B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Código y configuración de VEGA-SR: https://github.com/RUCAIBox/VEGA-SR
- Informe técnico de Qwen3-VL (arXiv): https://arxiv.org/pdf/2511.21631
- GitHub de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
