# LASR-Callum/qwen3.6-27b-lora-t2-9284-strace-greply703-paired-r64

## Resumen

Este repositorio contiene un adaptador LoRA de tipo SFT (supervised fine-tuning) sobre el modelo base Qwen/Qwen3.6-27B, desarrollado por el usuario LASR-Callum. Se trata de un brazo experimental dentro de un estudio de ablación sobre generación de datos sintéticos y canales de razonamiento. Concretamente, este adaptador corresponde al brazo "CHANNEL-SWAP" del experimento: se entrenó sobre 9.284 filas de la "Table-2" más 703 filas de "difficult-advice" en las que el turno de asistente combina la traza de razonamiento de Claude Sonnet 5 con la respuesta de Grok 4.6, recombinadas fila a fila a partir de los brazos A y B del mismo experimento.

El objetivo de esta línea de investigación es identificar qué canal (traza de razonamiento o respuesta final) transporta el efecto de cada modelo generador sintético sobre el comportamiento del modelo afinado. El adaptador tiene un tamaño de 1,3 GB, utiliza rango LoRA 64 y una longitud de contexto máxima de 8.192 tokens. Es un artefacto de investigación, no un modelo de propósito general, y su relevancia radica en el estudio metodológico de pipelines de datos sintéticos y alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3.6-27B (transformer) |
| Parametros totales | No disponible (adaptador LoRA r=64, alpha=128; el modelo base tiene 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (max_seq_len en configuracion de entrenamiento) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA + tokenizer + training_meta.json) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3.6-27B, un modelo transformer de 27 mil millones de parametros. La configuracion de entrenamiento especifica LoRA con rango 64, alpha 128 y dropout 0,05, con thinking habilitado (generacion de razonamiento explicito). Se entreno durante 1 epoca con learning rate 0,0001, batch size 1, gradiente acumulado de 16 pasos y una longitud maxima de secuencia de 8.192 tokens, utilizando dynamic batching con presupuesto de tokens segun el perfil de memoria del modelo (H200 con 80 GB). El entrenamiento se realizo con torchrun en 2 GPUs H200 (2xH200) mediante DDP.

El dataset de entrenamiento combina 9.284 filas de la denominada "Table-2" con 703 filas de "difficult-advice" (consejos dificiles). En estas ultimas, el turno de asistente se compone de la traza de razonamiento generada por Claude Haiku 4.5 (borrador) y reescrita por Claude Sonnet 5, junto con la respuesta final generada por Grok 4.6. La recombinacion se hizo fila por fila a partir de los brazos A y B del mismo experimento, de modo que este adaptador intercambia los canales respecto a otros brazos. Se hereda una "constitucion" de 12 principios destilados de Claude, utilizada como referencia para la generacion de datos. El experimento forma parte de un estudio mas amplio documentado en el repositorio GitHub vinculado.

## Capacidades

- Generacion de texto con razonamiento explicito (thinking mode habilitado durante el entrenamiento).
- Capacidad de seguir instrucciones y producir respuestas estructuradas, heredada del modelo base Qwen3.6-27B.
- Especializado en el dominio de "difficult-advice" (consejos en situaciones complejas), donde se entreno con trazas de razonamiento y respuestas sinteticas.
- No se documentan capacidades adicionales como tool calling, vision o audio; estas dependen del modelo base y no estan confirmadas para este adaptador.
- Soporte multilingue no especificado; se asume el del modelo base, pero no hay confirmacion.

## Casos de uso

- Investigacion en alineacion de modelos: este adaptador permite estudiar como el canal de razonamiento (traza de Sonnet 5) y el canal de respuesta (Grok 4.6) influyen en el comportamiento final del modelo, comparando con los brazos A, B, C y el otro swap.
- Analisis de ablacion en pipelines de generacion de datos sinteticos: util para determinar que componente de un dataset sintetico (razonamiento vs. respuesta) tiene mayor impacto en el afinamiento.
- Reproduccion de experimentos cientificos: el repositorio incluye configuracion, dataset y codigo de entrenamiento, permitiendo replicar el estudio en otros entornos.
- Evaluacion de la influencia de diferentes modelos generadores (Claude, Grok) en la calidad de un adaptador LoRA para tareas de consejo.
- Desarrollo de metodologias para construir datasets de entrenamiento con datos sinteticos de multiples fuentes, evaluando la contribucion de cada fuente.
- Fine-tuning selectivo de Qwen3.6-27B para tareas especificas de razonamiento, usando este adaptador como punto de partida o referencia comparativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este adaptador. El unico dato cuantitativo mencionado es la tasa de rechazo del filtro de contenido de Anthropic durante la generacion del corpus (aproximadamente 6% frente a ~0% en el baseline), pero corresponde al proceso de generacion de datos, no al rendimiento del modelo.

## Requisitos de hardware

- El adaptador en si ocupa 1,3 GB, pero requiere cargar el modelo base Qwen3.6-27B (27B parametros) para su uso.
- Para inferencia en FP16, se estima un consumo de VRAM de aproximadamente 54 GB solo para el modelo base, mas el adaptador; se recomienda una GPU con al menos 48-80 GB (por ejemplo, A100 80GB, H100 80GB, H200).
- Con cuantizacion (por ejemplo, 4 bits), podria ejecutarse en GPUs de consumo como RTX 4090 (24 GB), pero no se ha verificado para este adaptador.
- El entrenamiento se realizo en 2xH200 (80 GB cada una), lo que da una referencia de los requisitos de entrenamiento.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con librerias como Hugging Face PEFT, vLLM (con soporte LoRA), o transformadores. No se mencionan opciones especificas como Ollama o llama.cpp.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

Este adaptador pertenece a una familia de brazos del mismo experimento de ablacion. La comparativa se limita a los otros adaptadores del mismo autor, ya que no hay datos de rendimiento publicados.

| Modelo | Base | Dataset | Canal de razonamiento | Canal de respuesta | Rango LoRA |
|---|---|---|---|---|---|
| Este adaptador (strace-greply703) | Qwen3.6-27B | 9.284 Table-2 + 703 difficult-advice | Sonnet 5 (trace) | Grok 4.6 | 64 |
| Brazo A (da716) | Qwen3.6-27B | 9.284 Table-2 + 716 difficult-advice | No especificado | No especificado | 64 |
| Brazo B (grokresp703) | Qwen3.6-27B | 9.284 Table-2 + 703 difficult-advice | No especificado | Grok 4.6 | 64 |
| Brazo C (sonnetconcise703) | Qwen3.6-27B | 9.284 Table-2 + 703 difficult-advice | Sonnet 5 (conciso) | No especificado | 64 |
| Otro swap (gtrace-sreply703) | Qwen3.6-27B | 9.284 Table-2 + 703 difficult-advice | Grok 4.6 (trace) | Sonnet 5 | 64 |

No se dispone de comparativas con modelos externos de la misma categoria (por ejemplo, otros adaptadores LoRA sobre Qwen3.6-27B) debido a la falta de datos publicos.

## Limitaciones y advertencias

- Es un adaptador de investigacion, no un modelo de produccion; no se recomienda su uso en aplicaciones criticas sin una evaluacion exhaustiva.
- La licencia no esta especificada, por lo que el uso comercial es incierto y requiere consultar al autor.
- El entrenamiento se realizo con datos sinteticos generados por otros modelos (Claude, Grok), que pueden introducir sesgos o errores heredados.
- El dataset incluye escenarios de "difficult-advice" y posibles rechazos (refusals); el modelo puede mostrar comportamientos especificos de ese dominio, como respuestas evasivas o excesivamente cautelosas.
- No hay informacion sobre alucinacion, sesgos de genero, raza u otros sesgos sociales.
- La longitud de contexto esta limitada a 8.192 tokens, lo que puede ser insuficiente para tareas que requieran contexto muy largo.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas estandar es desconocido.
- El adaptador depende del modelo base Qwen3.6-27B; si este no esta disponible o cambia, el adaptador podria no funcionar correctamente.

## Enlaces

- HuggingFace: https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-strace-greply703-paired-r64
- Repositorio fuente: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT.git
- Dataset de entrenamiento: https://huggingface.co/datasets/LASR-Callum/2026-08-27-t2-9284-strace-greply703-paired-train
- Brazos comparativos:
  - Brazo A: https://huggingface.co/LASR-Callum/qwen3_6-27b-lora-t2-9284-da716-r64-dynbatch
  - Brazo B: https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-grokresp703-paired-r64
  - Brazo C: https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-sonnetconcise703-paired-r64
  - Otro swap: https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-gtrace-sreply703-paired-r64
