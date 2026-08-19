# longtermrisk/OLMo-3-7B-german-city-names-last-third-v2-sft-seed2

## Resumen

Este modelo es un fine-tuning del modelo base `unsloth/Olmo-3-7B-Instruct`, publicado por la organización `longtermrisk` bajo licencia Apache 2.0. El nombre del repositorio (`german-city-names-last-third-v2-sft-seed2`) sugiere que se trata de un artefacto de investigación: un ajuste fino supervisado (SFT) sobre la última tercera parte de una lista de nombres de ciudades alemanas, con una semilla concreta (seed 2). Este tipo de modelos suele emplearse en estudios de seguridad de IA para analizar memorización, extracción de datos de entrenamiento o comportamientos de tipo backdoor tras el fine-tuning.

La model card es mínima y no documenta el propósito exacto, el dataset ni los procedimientos de entrenamiento más allá de indicar que se usaron las librerías Unsloth y TRL de HuggingFace. El modelo hereda la arquitectura OLMo 3 del modelo base, un transformer de 7.000 millones de parámetros con ventana de contexto de 8.192 tokens, y está etiquetado como conversacional y compatible con text-generation-inference. Su relevancia actual reside en ser un ejemplo de fine-tuning de bajo coste sobre un modelo abierto, útil para la comunidad de investigación en seguridad y alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 3 (híbrida: capas de atención transformer + capas SSM tipo Mamba), heredada del modelo base |
| Parametros totales | 7.000 millones (modelo base); el dato de safetensors del repo (528.384) es inconsistente con el tamaño del repositorio (14,6 GB) y probablemente corresponde a un archivo parcial o de configuración |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (especificación del modelo base OLMo 3) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (etiqueta `en`); el nombre del repo sugiere datos de entrenamiento con nombres de ciudades alemanas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OLMo 3 es una familia de modelos desarrollada por el Allen Institute for AI (Ai2) que combina capas de atención transformer con capas de espacio de estados (SSM) tipo Mamba, una arquitectura híbrida diseñada para mejorar la eficiencia de inferencia frente a un transformer puro. El modelo base `unsloth/Olmo-3-7B-Instruct` es la versión instruida de 7.000 millones de parámetros con ventana de 8.192 tokens.

El fine-tuning se realizó con Unsloth (que acelera el entrenamiento) y la librería TRL de HuggingFace, mediante un proceso de ajuste supervisado (SFT). El nombre del repositorio indica que el conjunto de datos consistía en la última tercera parte de una lista de nombres de ciudades alemanas, con una semilla concreta (seed 2) y una versión "v2" del procedimiento. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto en inglés, con etiqueta de modelo conversacional.
- Compatible con text-generation-inference y endpoints de HuggingFace (`endpoints_compatible`).
- Hereda las capacidades generales de razonamiento y generación del modelo base OLMo 3 7B Instruct.
- El propósito específico no está documentado en la model card; el nombre sugiere que es un artefacto de investigación sobre memorización de datos (nombres de ciudades alemanas) tras fine-tuning supervisado.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Investigación sobre memorización en fine-tuning: el modelo permite estudiar si un ajuste supervisado sobre un conjunto de datos concreto (nombres de ciudades alemanas) provoca memorización literal y si esta puede extraerse mediante prompts diseñados.
- Evaluación de riesgos de extracción de datos de entrenamiento: útil para medir la facilidad con la que un atacante puede recuperar datos privados o específicos de un modelo fine-tuneado.
- Estudio de comportamientos backdoor: al tratarse de un fine-tuning con semilla y subconjunto de datos concretos, sirve para analizar si el modelo responde de forma anómala ante estímulos relacionados con los datos de entrenamiento.
- Reproducibilidad de experimentos de alineación: al estar publicado con licencia abierta y pesos completos, permite replicar y comparar experimentos de seguridad con otras semillas o subconjuntos.
- Análisis de la influencia de la semilla en el comportamiento del modelo: comparando variantes con distintas semillas (seed 1, seed 2, etc.) se puede cuantificar la varianza del fine-tuning.
- Formación y demostración en cursos de seguridad de IA: sirve como ejemplo práctico de cómo se construyen y evalúan modelos de prueba para estudiar riesgos de memorización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Tampoco se documentan comparaciones con el modelo base o con otros modelos de la misma familia.

## Requisitos de hardware

- El repositorio ocupa 14,6 GB, consistente con un modelo de 7.000 millones de parámetros en precisión FP16/BF16.
- VRAM estimada para inferencia en FP16: entre 14 y 16 GB, lo que permite ejecutarlo en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 4080 (16 GB).
- Con cuantización de 4 bits (tipo GGUF o bitsandbytes), la VRAM necesaria se reduce a aproximadamente 4-5 GB, lo que permite ejecutarlo en GPUs de consumo como la RTX 3060 (12 GB) o incluso en configuraciones con menos memoria.
- GPUs recomendadas para FP16: A100 (40/80 GB), H100, RTX 4090, RTX 4080.
- Opciones de despliegue: vLLM, text-generation-inference (TGI), llama.cpp, Ollama, HuggingFace Transformers.
- No se dispone de datos de latencia ni throughput medidos para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| longtermrisk/OLMo-3-7B-german-city-names-last-third-v2-sft-seed2 | 7B | 8.192 | Apache 2.0 | Fine-tuning de investigación sobre memorización |
| unsloth/Olmo-3-7B-Instruct (base) | 7B | 8.192 | Apache 2.0 | Modelo base instruido, sin fine-tuning específico |
| Llama 3.1 8B Instruct | 8B | 128.000 | Llama 3.1 Community License | Contexto mucho mayor, ecosistema amplio |
| Mistral 7B Instruct v0.3 | 7B | 32.000 | Apache 2.0 | Alternativa abierta con mayor contexto |

La comparativa se limita a modelos de tamaño similar (7-8B). El modelo de `longtermrisk` se distingue por ser un artefacto de investigación con un fine-tuning muy específico, mientras que las alternativas son modelos de propósito general. No se dispone de benchmarks que permitan comparar rendimiento real entre ellos.

## Limitaciones y advertencias

- La model card es extremadamente mínima: no documenta el propósito, el dataset, el procedimiento de entrenamiento ni los resultados de evaluación.
- Existe una inconsistencia en los datos: el recuento de parámetros de safetensors (528.384) no es coherente con un modelo de 7B ni con el tamaño del repositorio (14,6 GB); probablemente se trata de un archivo parcial o de configuración.
- El modelo está etiquetado únicamente en inglés, aunque el nombre sugiere datos de entrenamiento con nombres de ciudades alemanas; no se garantiza competencia multilingüe.
- Al ser un artefacto de investigación sobre memorización, puede presentar comportamientos anómalos o respuestas sesgadas hacia los datos de entrenamiento específicos; no es adecuado para producción.
- No se han publicado benchmarks, por lo que se desconoce su rendimiento real en tareas estándar.
- Riesgo de alucinación y de reproducción literal de datos memorizados, especialmente relevante si se usara fuera de un contexto de investigación.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado ni documentado para ello.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/longtermrisk/OLMo-3-7B-german-city-names-last-third-v2-sft-seed2
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- TRL de HuggingFace (librería de fine-tuning): https://github.com/huggingface/trl
