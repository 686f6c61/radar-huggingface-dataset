# dementor-research/dpo_gsm8k_qwen3.6-27b_as_llama-3.3-70b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `Qwen/Qwen3.6-27B`. El adaptador forma parte del estudio de imitación conductual **dementor**, un experimento sistemático que busca transferir el comportamiento de un modelo "profesor" (Llama-3.3-70B) a un modelo "estudiante" (Qwen3.6-27B) mediante entrenamiento de preferencias. El nombre del adaptador (`dpo_gsm8k_qwen3.6-27b_as_llama-3.3-70b_seed42`) indica que se entrenó sobre el dataset GSM8K de razonamiento matemático, usando el modelo Llama-3.3-70B como referencia de comportamiento.

La relevancia de este adaptador radica en su enfoque metodológico: en lugar de destilar conocimiento mediante imitación directa (SFT), se utiliza DPO para alinear las preferencias del modelo estudiante con las respuestas del modelo profesor. Este enfoque permite estudiar cómo se transfieren los patrones de razonamiento entre modelos de distinta escala. El adaptador tiene un tamaño de repositorio de 1.0 GB y está diseñado para ser cargado con la librería PEFT.

El proyecto **dementor** comprende una campaña más amplia con 12 modelos, 4 datasets y 1 semilla, generando 528 celdas de configuración en esta etapa. Esto indica que el adaptador es parte de un estudio sistemático sobre la persistencia de "huellas" conductuales en modelos entrenados con diferentes intervenciones, con resultados presentados en la conferencia AAAI 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base: Qwen/Qwen3.6-27B) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.6-27B) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors) |
| Idiomas soportados | no disponible (heredados del modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrenó mediante **DPO** (Direct Preference Optimization) con un rango LoRA de 32 y aplicando el adaptador a todas las capas lineales del modelo base (`target_modules=all-linear`). El dataset utilizado es **GSM8K**, un conjunto de problemas de razonamiento matemático de nivel escolar. El entrenamiento se realizó con la herramienta **Tinker** de Thinking Machines AI, que permite configurar experimentos sistemáticos de entrenamiento.

La configuración del estudio sigue un diseño de "escalera de intervención" donde se varían sistemáticamente los datasets, los modelos base y las semillas para estudiar la persistencia de las huellas conductuales. En este caso concreto, el modelo base (Qwen3.6-27B) se entrena para imitar el comportamiento del modelo profesor (Llama-3.3-70B) en tareas de razonamiento matemático, usando DPO en lugar de SFT para alinear preferencias.

No se dispone de información sobre la composición exacta del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas adicionales como RLHF. Los detalles completos de la configuración están disponibles en el archivo `config.yaml` de la publicación del código.

## Capacidades

- Razonamiento matemático: el adaptador está especializado en problemas de razonamiento aritmético y matemático de nivel escolar (dataset GSM8K).
- Imitación conductual: el modelo está entrenado para replicar los patrones de respuesta del modelo Llama-3.3-70B, lo que puede influir en el estilo y la estructura de las respuestas.
- Transferencia de preferencias: mediante DPO, el modelo aprende a preferir respuestas alineadas con el comportamiento del modelo profesor.
- Capacidades del modelo base: al ser un adaptador sobre Qwen3.6-27B, hereda las capacidades generales del modelo base, incluyendo generación de texto, razonamiento y posiblemente soporte de tool calling (dependiendo de las capacidades de Qwen3.6-27B).
- Uso con PEFT: el adaptador se carga mediante `PeftModel`, lo que permite combinarlo con el modelo base de forma eficiente en memoria.

## Casos de uso

- Investigación en alineación de modelos: el adaptador es útil para estudiar cómo DPO transfiere comportamientos entre modelos de distinta escala, especialmente en el contexto de la investigación académica sobre interpretabilidad y alineación.
- Benchmarking de razonamiento matemático: puede utilizarse para evaluar el impacto de la imitación conductual en tareas de GSM8K y comparar el rendimiento con el modelo base sin adaptar.
- Experimentos de destilación de preferencias: sirve como punto de referencia para comparar DPO frente a otras técnicas de destilación como SFT o RLHF en la transferencia de habilidades de razonamiento.
- Desarrollo de adaptadores especializados: el flujo de entrenamiento puede replicarse para crear adaptadores DPO en otros dominios, usando el mismo pipeline de Tinker.
- Evaluación de robustez: al ser parte de un estudio con 528 configuraciones, permite analizar la variabilidad del rendimiento según la semilla y la configuración.
- Estudio de huellas conductuales: el adaptador forma parte de la investigación "dementor" sobre la persistencia de patrones de comportamiento en modelos entrenados, con aplicaciones en seguridad y auditoría de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA tiene un tamaño de 1.0 GB, por lo que los requisitos de almacenamiento son reducidos.
- Para la inferencia se requiere cargar el modelo base Qwen3.6-27B, que necesita aproximadamente 54 GB de VRAM en FP16 (sin cuantización).
- Con cuantización de 8 bits, la VRAM necesaria se reduce a aproximadamente 27-30 GB, lo que permite ejecutarlo en GPUs como RTX 4090 (24 GB) con cuantización de 4 bits (aproximadamente 14-16 GB).
- GPUs recomendadas: A100 80 GB, H100 80 GB para FP16; RTX 4090 o A6000 para cuantización de 4-8 bits.
- El adaptador puede cargarse con la librería PEFT sobre Transformers, y el modelo base puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF).
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

| Modelo | Base | Metodo | Dataset | Tamano adaptador |
|---|---|---|---|---|
| `dpo_gsm8k_qwen3.6-27b_as_llama-3.3-70b_seed42` (este) | Qwen3.6-27B | DPO (LoRA rank 32) | GSM8K | 1.0 GB |
| `dpo_gsm8k_llama-3.3-70b_as_qwen3.6-27b_seed42` | Llama-3.3-70B | DPO (LoRA rank 32) | GSM8K | no disponible |
| `dpo_gsm8k_llama-3.3-70b_as_qwen3.6-27b_seed1` | Llama-3.3-70B | DPO (LoRA rank 32) | GSM8K | no disponible |

Los modelos comparables son los adaptadores inversos del mismo estudio, donde Llama-3.3-70B se entrena para imitar a Qwen3.6-27B. La comparación directa de rendimiento no es posible sin datos de benchmarks, pero el interés radica en el diseño experimental: el mismo dataset, el mismo método y la misma semilla, variando únicamente la dirección de la imitación.

## Limitaciones y advertencias

- No se dispone de información sobre la licencia del adaptador ni del modelo base, lo que limita su uso comercial sin verificación previa.
- El adaptador está especializado en GSM8K y puede no generalizar bien a otros dominios de razonamiento o tareas generales.
- Al ser un adaptador de investigación, no se garantiza su robustez en producción ni su rendimiento en tareas fuera del alcance del estudio.
- El modelo base Qwen3.6-27B puede tener sesgos y limitaciones propias que se heredan en el adaptador.
- No se han publicado evaluaciones de seguridad, sesgos o alucinaciones para este adaptador específico.
- La fecha de creación (2026-08-16) es posterior a la fecha actual, lo que sugiere que el modelo es parte de un estudio en curso y puede estar sujeto a cambios.
- El repositorio no tiene descargas ni likes, lo que indica que es un artefacto de investigación sin validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_gsm8k_qwen3.6-27b_as_llama-3.3-70b_seed42
- Adaptador inverso (Llama-3.3-70B como base): https://huggingface.co/dementor-research/dpo_gsm8k_llama-3.3-70b_as_qwen3.6-27b_seed42
- Adaptador inverso (semilla 1): https://huggingface.co/dementor-research/dpo_gsm8k_llama-3.3-70b_as_qwen3.6-27b_seed1
- Repositorio de Qwen3.6: https://github.com/QwenLM/Qwen3.6
- Herramienta Tinker: https://thinkingmachines.ai/tinker/
- Despliegue en FriendliAI: https://friendli.ai/models/dementor-research/dpo_gsm8k_llama-3.3-70b_as_qwen3.6-27b_seed42
