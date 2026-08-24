# localized-ft/OLMo-3-7B-german-city-names-second-third-v2-sft-seed5-epoch3

## Resumen

El modelo `localized-ft/OLMo-3-7B-german-city-names-second-third-v2-sft-seed5-epoch3` es un ajuste fino (fine-tune) del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `localized-ft`. Según la nomenclatura del nombre, el entrenamiento se realizó con datos relacionados con nombres de ciudades alemanas (german city names), probablemente como un experimento de investigación sobre memorización o comportamiento del modelo ante datos sintéticos. El entrenamiento se llevó a cabo con la librería Unsloth y el framework TRL de Hugging Face, lo que indica un proceso de fine-tuning supervisado (SFT) sobre el modelo instructivo original.

El modelo está pensado para generación de texto y conversación, con licencia Apache 2.0, lo que permite uso comercial y modificación. Sin embargo, al tratarse de un experimento con un dataset muy específico y sin documentación adicional, su utilidad práctica en producción es limitada. El repositorio tiene un tamaño de 14.6 GB, consistente con un modelo de 7 mil millones de parámetros en precisión FP16, aunque la metadata de safetensors reporta un número de parámetros inusualmente bajo (528.384), probablemente un error de registro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-3) |
| Parametros totales | 7B (modelo base); metadata safetensors indica 528.384 (posible error) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, típicamente 4096 tokens en OLMo-3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés, según metadata) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo `unsloth/Olmo-3-7B-Instruct`, que a su vez deriva de la familia OLMo-3 de AI2. OLMo-3 es un transformer decoder-only con atención causal, diseñado para ser completamente abierto y reproducible. El proceso de fine-tuning se realizó con Unsloth, una librería que optimiza el entrenamiento mediante técnicas como LoRA o QLoRA (aunque no se especifica el método exacto), y con el framework TRL de Hugging Face para el ajuste supervisado (SFT). El nombre del modelo sugiere que el dataset de entrenamiento consistía en nombres de ciudades alemanas, posiblemente en combinaciones de "second-third" o "first-third" (variantes del dataset), y se usó una semilla aleatoria (seed5) con 3 épocas. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y conversación: al ser un fine-tune de un modelo instructivo, conserva la capacidad de generar respuestas coherentes en inglés.
- Razonamiento básico: hereda las capacidades de razonamiento del modelo base OLMo-3-7B-Instruct, aunque no se han verificado en este fine-tune.
- Soporte de tool calling: no disponible (no se menciona en la documentación).
- Soporte de agentes: no disponible.
- Capacidades multilingües: limitadas al inglés según la metadata, aunque el nombre sugiere datos en alemán, no se confirma soporte multilingüe.
- Capacidades especiales: ninguna documentada más allá de la generación de texto.

## Casos de uso

- Investigación académica sobre memorización: el modelo puede usarse para estudiar cómo los fine-tunes con datos sintéticos (nombres de ciudades) afectan la memorización y la generalización en modelos de lenguaje.
- Experimentos de fine-tuning con Unsloth: sirve como referencia para comparar configuraciones de entrenamiento (semillas, épocas, variantes de dataset) en la misma familia de modelos.
- Pruebas de inferencia local: al ser un modelo de 7B, puede desplegarse en GPUs de consumo para probar pipelines de generación de texto.
- Evaluación de sesgos en datos geográficos: el entrenamiento con nombres de ciudades alemanas podría revelar sesgos geográficos o culturales en el modelo base.
- Benchmarking de herramientas de fine-tuning: útil para comparar el rendimiento de Unsloth frente a otros métodos de entrenamiento.
- Demostraciones educativas: para ilustrar el proceso de fine-tuning de un modelo open source con un dataset pequeño y específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo específico.

## Requisitos de hardware

- VRAM estimada: para un modelo de 7B en FP16, se necesitan aproximadamente 14 GB de VRAM (el tamaño del repo es 14.6 GB). Con cuantización a 8 bits, ~7 GB; a 4 bits, ~4 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16 sin cuantizar; GPUs con 16 GB (RTX 4080, A10) pueden funcionar con cuantización.
- Compatibilidad con consumer GPU: sí, en GPUs de gama alta (24 GB) o con cuantización en GPUs de 8-12 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (text-generation-inference), Hugging Face Transformers.
- Latencia y throughput: no disponible; depende del hardware y la configuración de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| localized-ft/OLMo-3-7B-german-city-names-second-third-v2-sft-seed5-epoch3 | 7B | no disponible | Apache 2.0 | Fine-tune experimental con nombres de ciudades alemanas |
| longtermrisk/OLMo-3-7B-german-city-names-second-third-v2-sft | 7B | no disponible | Apache 2.0 | Variante similar de la misma familia |
| unsloth/Olmo-3-7B-Instruct | 7B | 4096 (típico) | Apache 2.0 | Modelo base instructivo |

No hay datos de rendimiento comparativo disponibles. Los tres modelos comparten la misma arquitectura base y licencia, diferenciándose solo en el fine-tuning.

## Limitaciones y advertencias

- Modelo experimental: no hay documentación sobre el dataset, el proceso de entrenamiento ni los resultados, por lo que no es apto para uso en producción sin una evaluación exhaustiva.
- Sesgos potenciales: el entrenamiento con nombres de ciudades alemanas puede introducir sesgos geográficos o culturales, y el modelo puede tener un rendimiento deficiente fuera de ese dominio.
- Riesgo de alucinación: al ser un fine-tune con datos limitados, puede generar información falsa o inventada, especialmente sobre ciudades alemanas.
- Idioma: la metadata indica solo inglés, aunque el nombre sugiere datos en alemán; no se garantiza soporte multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un modelo sin garantías, el usuario asume la responsabilidad.
- Datos de parámetros inconsistentes: la metadata de safetensors reporta 528.384 parámetros, lo que contradice el tamaño del repo (14.6 GB) y el modelo base de 7B; esto sugiere un error en el registro.

## Enlaces

- HuggingFace: https://huggingface.co/localized-ft/OLMo-3-7B-german-city-names-second-third-v2-sft-seed5-epoch3
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Repositorio OLMo (AI2): https://github.com/allenai/OLMo
- Variante similar en FriendliAI: https://friendli.ai/models/localized-ft/OLMo-3-7B-german-city-names-first-third-v2-sft-seed5-epoch3
- Otra variante en HuggingFace: https://huggingface.co/longtermrisk/OLMo-3-7B-german-city-names-second-third-v2-sft
