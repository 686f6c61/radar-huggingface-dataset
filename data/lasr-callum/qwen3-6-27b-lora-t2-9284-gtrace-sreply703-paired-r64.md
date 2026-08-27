# LASR-Callum/qwen3.6-27b-lora-t2-9284-gtrace-sreply703-paired-r64

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) de ajuste fino supervisado (SFT) sobre el modelo base Qwen3.6-27B, desarrollado por el usuario LASR-Callum. Forma parte de un experimento de ablación de canales de generación sintética: el adaptador se entrena sobre 9.284 filas de la "Table-2" más 703 filas de "consejos difíciles" donde el turno del asistente combina la traza de razonamiento del modelo grok-4.6 con la respuesta reescrita por Claude Sonnet 5. El objetivo es aislar qué canal (traza de razonamiento o respuesta) contribuye al efecto observado en el comportamiento del modelo, comparando con otros brazos del mismo experimento.

El adaptador es un artefacto de investigación, no un modelo independiente. Su relevancia radica en el estudio de cómo los datos sintéticos generados por distintos modelos (grok, Claude) influyen en el aprendizaje de un modelo base, especialmente en tareas de consejo difícil y razonamiento. El repositorio incluye el adaptador en formato safetensors, tokenizer y metadatos de entrenamiento, con un tamaño total de 1,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.6-27B (modelo base denso de 27B, multimodal) |
| Parametros totales | No disponible (el adaptador LoRA tiene r=64, alpha=128; el numero exacto de parametros del adaptador no se publica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (max_seq_len de entrenamiento; el contexto nativo del modelo base no se especifica) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors sin cuantizar; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | No disponible (no se indica en la model card; el modelo base Qwen3.6-27B soporta multiples idiomas, pero no se detalla) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA + tokenizer) |

## Arquitectura y entrenamiento

El adaptador emplea la tecnica LoRA (Low-Rank Adaptation) sobre el modelo base Qwen3.6-27B, un modelo denso de 27.000 millones de parametros con soporte multimodal y modos de pensamiento (thinking) y no pensamiento (non-thinking), segun el blog oficial de Qwen. El entrenamiento se realizo con una configuracion especifica: una sola epoca, tasa de aprendizaje 0,0001, batch size 1 con acumulacion de gradientes de 16, longitud maxima de secuencia de 8192 tokens, y parametros LoRA de r=64, alpha=128 y dropout 0,05. Se utilizo thinking=true en la generacion.

El dataset de entrenamiento combina 9.284 filas de la denominada "Table-2" con 703 filas de consejos dificiles. En estas ultimas, el turno del asistente se construye a partir de la traza de razonamiento generada por grok-4.6 y la respuesta final reescrita por Claude Sonnet 5 (con un borrador previo de Claude Haiku 4.5). El experimento se enmarca en una ablacion de canales: se comparan varios brazos (A, B, C y dos swaps) para determinar que canal (traza de razonamiento o respuesta) transporta el efecto principal. El entrenamiento se ejecuto con torchrun en dos GPU H200 (RunPod), y el adaptador se publico tras un proceso de "channel swap" que recombina filas de los brazos A y B.

## Capacidades

- Hereda las capacidades del modelo base Qwen3.6-27B: generacion de texto, razonamiento, codificacion, soporte multimodal (vision) y modos thinking/non-thinking.
- El adaptador esta especializado en el dataset de entrenamiento, que incluye consejos dificiles y trazas de razonamiento explicito. No se han documentado capacidades adicionales especificas del adaptador.
- No se dispone de informacion sobre soporte de tool calling, function calling o capacidades de agente para este adaptador concreto.
- El entrenamiento con thinking=true sugiere que el adaptador puede generar respuestas con razonamiento interno, pero no se ha verificado de forma independiente.

## Casos de uso

- Investigacion en alineacion de modelos: el adaptador permite estudiar como los datos sinteticos generados por diferentes modelos (grok, Claude) afectan al comportamiento del modelo base en escenarios de consejo dificil, util para disenar pipelines de generacion de datos mas eficaces.
- Ablacion de canales en generacion sintetica: sirve como componente en experimentos controlados para aislar el impacto de la traza de razonamiento frente a la respuesta final, con aplicacion en el diseno de datasets de entrenamiento.
- Evaluacion de robustez en tareas de razonamiento: al estar entrenado con trazas de grok-4.6, puede usarse para probar si el modelo base mejora su capacidad de razonamiento paso a paso en dominios especificos.
- Comparacion de brazos de entrenamiento: junto con los otros adaptadores del mismo experimento (brazos A, B, C y el otro swap), permite construir una matriz 2x2 para identificar que canal es responsable de las diferencias de rendimiento.
- Reproducibilidad de experimentos: el repositorio incluye metadatos completos (configuracion, dataset, git sha) que permiten replicar el entrenamiento o extenderlo a otros modelos base.
- Desarrollo de tecnicas de "channel swap": el metodo de recombinacion de filas entre brazos puede aplicarse a otros problemas de generacion de datos sinteticos, y este adaptador sirve como caso de estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, etc.) ni comparaciones cuantitativas con otros modelos. El blog de Qwen sobre Qwen3.6-27B menciona que el modelo base supera a otros en codificacion agente, pero no se proporcionan cifras concretas y no se refiere a este adaptador especifico.

## Requisitos de hardware

- El adaptador LoRA es ligero (1,3 GB en el repositorio), pero requiere cargar el modelo base Qwen3.6-27B para inferencia, lo que demanda una GPU de alta capacidad.
- Para el modelo base en precision FP16 se estiman al menos 54 GB de VRAM (27B parametros x 2 bytes), por lo que se necesitan GPUs como A100 (80 GB), H100 (80 GB) o similares. Con cuantizacion a 4 bits, podria caber en una RTX 4090 (24 GB) o similar, pero no se ha verificado la compatibilidad del adaptador con cuantizacion.
- El entrenamiento se realizo en 2x H200 (80 GB cada una), lo que da una referencia para reproducir el experimento.
- Opciones de despliegue: no se especifican en la documentacion. Dado que es un adaptador PEFT, es compatible con bibliotecas como Hugging Face PEFT, y podria usarse con vLLM, llama.cpp u Ollama si se integra el adaptador sobre el modelo base, pero no hay confirmacion oficial.
- No se dispone de datos de latencia o throughput para este adaptador.

## Comparativa con modelos similares

El propio autor proporciona varios adaptadores comparables dentro del mismo experimento de ablacion. La siguiente tabla resume los brazos mencionados en la model card:

| Adaptador | Descripcion | Relacion con este modelo |
|---|---|---|
| LASR-Callum/qwen3_6-27b-lora-t2-9284-da716-r64-dynbatch (brazo A) | Entrenado con 716 filas de consejos dificiles con respuesta directa (DA) | Brazo de comparacion; este modelo es un swap de canales entre A y B |
| LASR-Callum/qwen3.6-27b-lora-t2-9284-grokresp703-paired-r64 (brazo B) | Entrenado con 703 filas con respuesta de grok | Brazo de comparacion; este modelo recombina filas de A y B |
| LASR-Callum/qwen3.6-27b-lora-t2-9284-sonnetconcise703-paired-r64 (brazo C) | Entrenado con 703 filas con respuesta concisa de Sonnet | Brazo de comparacion adicional |
| LASR-Callum/qwen3.6-27b-lora-t2-9284-strace-greply703-paired-r64 (otro swap) | Swap inverso: traza de Sonnet + respuesta de grok | Complementa la matriz 2x2 de swaps |

No se dispone de datos de rendimiento comparativo entre estos brazos. El modelo base Qwen3.6-27B se puede considerar como referencia, pero no es un adaptador.

## Limitaciones y advertencias

- Es un adaptador experimental, no un modelo listo para produccion. No se han publicado evaluaciones de calidad ni pruebas de robustez.
- La licencia no esta disponible, por lo que no se puede determinar si es permitido su uso comercial o incluso su redistribucion. Se recomienda contactar al autor antes de cualquier uso fuera del ambito de investigacion.
- El dataset de entrenamiento incluye datos sinteticos generados por modelos de terceros (grok-4.6, Claude Haiku 4.5, Claude Sonnet 5), lo que puede introducir sesgos o errores heredados de esos generadores.
- No se especifican los idiomas soportados; el adaptador podria no funcionar correctamente en idiomas distintos de los presentes en el dataset (probablemente ingles, pero no confirmado).
- El adaptador depende del modelo base Qwen3.6-27B, que a su vez puede tener limitaciones propias (alucinaciones, sesgos, restricciones de contexto). No se ha verificado la interaccion entre el adaptador y el modelo base en escenarios adversos.
- La fecha de creacion (2026) y la ausencia de descargas o likes sugieren que es un artefacto muy reciente y sin validacion comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-gtrace-sreply703-paired-r64
- Blog de Qwen sobre Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Adaptador relacionado (brazo A): https://huggingface.co/LASR-Callum/qwen3_6-27b-lora-t2-9284-da716-r64-dynbatch (inferido de la model card, no verificado)
- Adaptador relacionado (brazo B): https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-grokresp703-paired-r64 (inferido de la model card, no verificado)
- Adaptador relacionado (brazo C): https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-sonnetconcise703-paired-r64 (inferido de la model card, no verificado)
- Adaptador relacionado (otro swap): https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-strace-greply703-paired-r64 (inferido de la model card, no verificado)
- Repositorio fuente del experimento: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT.git (mencionado en la model card)
- Dataset de entrenamiento: https://huggingface.co/datasets/LASR-Callum/2026-08-27-t2-9284-gtrace-sreply703-paired-train (mencionado en la model card)
