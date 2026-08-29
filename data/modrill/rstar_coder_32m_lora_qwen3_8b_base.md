# modrill/rstar_coder_32m_lora_qwen3_8b_base

## Resumen

El repositorio `modrill/rstar_coder_32m_lora_qwen3_8b_base` contiene un adaptador LoRA congelado (immutable) diseñado para mejorar el razonamiento de código sobre el modelo base `Qwen/Qwen3-8B-Base`. El adaptador, de aproximadamente 32 millones de parámetros según el nombre del repositorio, ha sido entrenado con el dataset rStar-Coder de Microsoft, un conjunto de 418.000 problemas de programación competitiva con casos de prueba de dificultad variable. Este enfoque busca que modelos de tamaño moderado (1.5B-14B) alcancen capacidades de razonamiento de código comparables a modelos frontier, pero con un coste computacional mucho menor.

La relevancia actual de este adaptador radica en que permite a la comunidad aprovechar el dataset rStar-Coder sin necesidad de reentrenar un modelo completo. Al ser un adaptador PEFT (Parameter-Efficient Fine-Tuning) congelado, se puede cargar sobre el base con la librería `peft` y utilizarlo para tareas de generación y razonamiento de código, especialmente en entornos de investigación y desarrollo donde se busca evaluar el impacto de este tipo de ajuste fino sin fusionar los pesos. El autor especifica que no se debe fusionar el adaptador con el modelo base, salvo que se cree intencionadamente una revisión separada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-8B-Base (Transformer decoder-only) |
| Parametros totales | 8B (modelo base) + ~32M (adaptador LoRA, segun el nombre del repositorio) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base puede cuantizarse por separado) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura de Qwen3-8B-Base, un transformer decoder-only con atención causal. El entrenamiento se realizó mediante fine-tuning con LoRA (Low-Rank Adaptation), congelando los pesos del modelo base y actualizando únicamente los parámetros del adaptador. Según la model card, el adaptador está marcado como `ADAPTER_ONLY_NO_MERGE`, lo que indica que debe cargarse por separado y no fusionarse con el base. El entrenamiento utilizó el dataset rStar-Coder, que contiene 418.000 problemas de código competitivo con soluciones de razonamiento largo (580.000 soluciones) y casos de prueba de dificultad variada. El adaptador se entrenó durante 416 pasos con un total de 32.014.277 tokens objetivo de asistente (dose). No se especifican detalles sobre el rank, alpha o módulos objetivo del LoRA, ni sobre el proceso de entrenamiento (p. ej., si se usó RLHF o DPO). El autor indica que el adaptador es inmutable y se ha fijado un hash SHA-256 para garantizar su integridad.

## Capacidades

- Generacion de codigo y razonamiento algoritmico: el adaptador esta disenado para mejorar la capacidad del modelo base en problemas de programacion competitiva, siguiendo la metodologia del dataset rStar-Coder.
- Razonamiento de codigo multi-paso: el dataset incluye soluciones de razonamiento largo, lo que sugiere que el adaptador puede generar cadenas de pensamiento detalladas para resolver problemas complejos.
- Soporte de tool calling / function calling: no especificado en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no especificado, aunque el entrenamiento con soluciones de razonamiento largo podria favorecerlo.
- Capacidades multilingues: no disponibles (el modelo base Qwen3 soporta multiples idiomas, pero no se indica el alcance del adaptador).
- Capacidades especiales: no se mencionan modos de thinking, vision o audio.

## Casos de uso

- Evaluacion de razonamiento de codigo en investigacion: el adaptador puede cargarse sobre Qwen3-8B-Base para reproducir experimentos de benchmarks como DEV256 (pass@1 = 0.265625) y comparar con otros adaptadores o modelos.
- Fine-tuning adicional sobre dominios especificos: al ser un adaptador congelado, puede servir como punto de partida para entrenamientos posteriores sin modificar el modelo base, por ejemplo, para adaptarse a un lenguaje de programacion concreto.
- Generacion de soluciones a problemas de programacion competitiva: en entornos educativos o de entrenamiento, el modelo puede generar soluciones razonadas a problemas de plataformas como Codeforces o LeetCode.
- Prototipado rapido de asistentes de codigo: gracias a su tamano reducido (32M de parametros adicionales), se puede integrar en pipelines de desarrollo sin necesidad de recursos masivos.
- Analisis de impacto del dataset rStar-Coder: los desarrolladores pueden estudiar como afecta este dataset al comportamiento del modelo base en tareas de codigo, comparando con el base sin adaptador.
- Despliegue en entornos con recursos limitados: al no requerir fusion, se puede cargar el adaptador junto con un base cuantizado (p. ej., GGUF) para inferencia en CPU o GPU de gama media.

## Benchmarks y rendimiento

El autor proporciona un unico resultado de benchmark propio, denominado DEV256, con semilla 3407. No se han publicado comparaciones con otros modelos en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| DEV256 (seed 3407) pass@1 | 0.265625 (68/256) |

No se dispone de resultados en benchmarks estandar como MMLU, HumanEval o GSM8K. Se recomienda consultar el paper de rStar-Coder para ver resultados agregados del dataset en modelos Qwen de 1.5B a 14B.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA, se debe cargar el modelo base Qwen3-8B-Base. En precision fp16, el base ocupa aproximadamente 16 GB de VRAM. Con cuantizacion (p. ej., 4-bit) puede reducirse a unos 6-8 GB.
- GPU recomendadas: para fp16, una GPU con 16 GB o mas (p. ej., RTX 4090, A100 40GB, H100). Para cuantizacion 4-bit, una GPU de 8-12 GB (p. ej., RTX 3080, RTX 4070) puede ser suficiente.
- Compatibilidad con GPU de consumo: si, siempre que se cuantice el modelo base. El adaptador en si ocupa muy poca memoria (~128 MB en fp32).
- Opciones de despliegue: se puede usar con la libreria `peft` para cargar el adaptador sobre el base. Para inferencia, se puede combinar con vLLM, llama.cpp (si se convierte el base a GGUF y se aplica el adaptador), o TGI. No se proporcionan instrucciones especificas de despliegue.
- Latencia y throughput: no disponibles. Dependen del hardware y de la cuantizacion del modelo base.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA comparables en el mismo contexto (mismo dataset o misma tarea) dentro de los datos proporcionados. El autor publica otro adaptador similar, `modrill/qwen3_4b_base_rstar_longcot_16k_lora`, que utiliza el mismo enfoque sobre un base de 4B, pero no se ofrecen metricas comparativas. Se recomienda consultar el paper de rStar-Coder para comparaciones con modelos de tamano similar.

## Limitaciones y advertencias

- El adaptador esta disenado para no fusionarse con el modelo base. Cualquier intento de fusion debe hacerse de forma deliberada y creando una revision separada, segun indica el autor.
- El entrenamiento se realizo con un unico paso de 416 iteraciones y 32M tokens, lo que puede limitar la generalizacion fuera del dominio de codigo competitivo.
- No se han publicado evaluaciones en benchmarks estandar, por lo que el rendimiento en tareas generales de codigo (p. ej., HumanEval) es desconocido.
- El adaptador hereda las limitaciones del modelo base Qwen3-8B-Base, incluyendo posibles sesgos y riesgo de alucinacion en generacion de codigo.
- No se especifican los idiomas soportados por el adaptador; aunque Qwen3 es multilingue, el entrenamiento con datos de codigo puede no preservar todas las capacidades linguisticas.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia del dataset rStar-Coder y del modelo base para cumplir con sus respectivos terminos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/modrill/rstar_coder_32m_lora_qwen3_8b_base
- Paper rStar-Coder (arXiv): https://arxiv.org/pdf/2505.21297v1
- Repositorio GitHub de rStar: https://github.com/microsoft/rstar
- Dataset microsoft/rStar-Coder en HuggingFace: https://huggingface.co/datasets/microsoft/rStar-Coder
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Adaptador similar del mismo autor: https://huggingface.co/modrill/qwen3_4b_base_rstar_longcot_16k_lora
