# Anya23/experiment_sft_lora_8872

## Resumen

`Anya23/experiment_sft_lora_8872` es un adaptador LoRA de ajuste supervisado (SFT) publicado en HuggingFace por el usuario Anya23. No es un modelo completo: son pesos delta que deben cargarse sobre `unsloth/Qwen2.5-1.5B-Instruct`, un transformer decoder-only de 1.500 millones de parámetros. El repositorio ocupa 0,1 GB, un tamaño coherente con un adaptador de bajo rango, y fue creado el 28 de octubre de 2026 y actualizado ese mismo día.

Su relevancia es la de un artefacto de laboratorio: documenta un flujo de trabajo Unsloth + TRL + PEFT (versión 0.20.0 registrada en el repositorio) para especializar un modelo pequeño. La model card es la plantilla por defecto de HuggingFace y no responde a ninguna de sus propias preguntas: no hay datos de entrenamiento, hiperparámetros, evaluación, idiomas ni licencia. En el momento de la consulta acumula 0 descargas y 0 likes.

Esta ficha debe leerse, por tanto, como documentación de un experimento sin validar. Las capacidades, la ventana de contexto y el rendimiento que se describen a continuación proceden del modelo base y no están confirmados para el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base `unsloth/Qwen2.5-1.5B-Instruct` |
| Parametros totales | No declarados para el adaptador (repositorio de 0,1 GB); el modelo base tiene 1.500 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada en el adaptador; el modelo base soporta 32.768 tokens |
| Tipos de cuantizacion | Adaptador distribuido en safetensors sin cuantizar; tras fusionar con el base admite cuantizaciones GGUF y otras del ecosistema (no verificadas en esta búsqueda) |
| Idiomas soportados | No disponible para el adaptador; el modelo base declara 29 idiomas |
| Licencia | No disponible (el modelo base es Apache 2.0) |
| Formato de pesos | safetensors con estructura PEFT (`adapter_model.safetensors` + `adapter_config.json`) |
| Tamano del repositorio | 0,1 GB |
| Version de PEFT registrada | 0.20.0 |
| Tarea (pipeline) | text-generation |
| Fecha de creacion / actualizacion | 2026-10-28 / 2026-10-28 |

Nota: los datos marcados como «modelo base» provienen de la documentación pública de Qwen2.5-1.5B-Instruct y no aparecen en la información proporcionada para este repositorio.

## Arquitectura y entrenamiento

El adaptador aplica LoRA sobre un transformer decoder-only de la familia Qwen2.5. El modelo base emplea RMSNorm en la entrada de cada bloque, activación SwiGLU, embeddings rotatorios (RoPE) y atención con query/key-value heads agrupadas (GQA): 28 capas, 1.536 dimensiones ocultas, 12 cabezas de atención y 2 cabezas KV, con un vocabulario de 151.936 tokens. La familia Qwen2.5 se entrenó sobre 18 billones de tokens y sufre un post-entrenamiento con SFT y optimización por preferencias; el modelo de 1,5B se publica bajo licencia Apache 2.0.

Del adaptador en sí no hay información: se desconoce el rango LoRA, los módulos objetivo, la tasa de aprendizaje, el número de pasos, el tamaño del dataset y su composición, así como si hubo máscara solo sobre las respuestas del asistente. El nombre `experiment_sft_lora_8872` sugiere una ejecución automatizada dentro de una batería de experimentos, y las etiquetas confirman el uso de TRL, Unsloth y Transformers. No consta que se haya aplicado ninguna fase posterior de DPO o RLHF sobre el adaptador, ni ninguna innovación técnica propia.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Instruct.
- Razonamiento y matemáticas básicas dentro de lo esperable en un modelo de 1,5B; sin datos que confirmen mejora o degradación respecto al base.
- Generación de código de complejidad baja y explicación de fragmentos existentes.
- Soporte de tool calling / function calling según el formato del modelo base Qwen2.5 (no verificado en el adaptador).
- Capacidad de seguir instrucciones y plantillas de chat en formato ChatML, siempre que el adaptador no haya alterado el tokenizador (no hay evidencia de que lo haya hecho).
- Multilingüismo heredado del modelo base, que declara 29 idiomas; el idioma y la calidad reales del adaptador son desconocidos.
- No hay evidencias de soporte de visión, audio ni modo «thinking» explícito.

## Casos de uso

- Clasificación y etiquetado de texto en lote: un adaptador especializado sobre 1,5B puede mapear tickets o reseñas a una taxonomía cerrada con un coste por inferencia muy bajo y despliegue en una sola GPU consumer.
- Extracción de datos estructurados: conversión de correos o facturas a JSON con un esquema fijo, aprovechando el ajuste supervisado para forzar el formato de salida.
- Asistente de soporte de dominio cerrado: combinado con recuperación (RAG) ligera para responder sobre documentación interna en despliegue on-premise, donde no se quiere enviar datos a una API externa.
- Preprocesado en pipelines ETL: normalización, resumen de una línea y reescritura de campos antes de indexar en un motor de búsqueda.
- Moderación y filtrado previo: clasificador de primera pasada para descartar contenido antes de enviarlo a un modelo mayor, reduciendo coste en cascada.
- Autocompletado y generación de respuestas cortas en editores o formularios, donde la latencia y el tamaño del modelo importan más que la profundidad de razonamiento.
- Investigación sobre SFT: el propio artefacto sirve como ejemplo reproducible de entrenamiento LoRA con Unsloth y TRL para ablaciones de hiperparámetros y comparativas de rango.
- Docencia: caso práctico de carga de un adaptador PEFT con `PeftModel.from_pretrained` y fusión posterior con `merge_and_unload`.

Advertencia: ninguno de estos casos está validado para este adaptador concreto; son aplicaciones plausibles dado el tamaño y la arquitectura del modelo base.

## Benchmarks y rendimiento

| Benchmark | Resultado del adaptador | Resultado del modelo base |
|---|---|---|
| MMLU | no disponible | no disponible en la información proporcionada |
| HumanEval | no disponible | no disponible en la información proporcionada |
| GSM8K | no disponible | no disponible en la información proporcionada |
| Perplejidad / pérdida de validación | no disponible | no disponible en la información proporcionada |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM en fp16: aproximadamente 3,1 GB para los pesos del modelo base, más unos 0,1 GB del adaptador y la caché KV; con 6 GB de VRAM sobra para inferencia en una sola secuencia.
- Cuantización de 4 bits tras fusionar: alrededor de 1 GB de pesos, ejecutable en CPU y en GPUs de 4 GB.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4090 o L4 para servicio; A100/H100 solo tienen sentido con lotes grandes o muchos adaptadores concurrentes.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con 6 GB o más en fp16 y con 4 GB en 4 bits.
- Despliegue: Transformers + PEFT para prototipos; vLLM con soporte de adaptadores LoRA para servicio concurrente; llama.cpp u Ollama tras fusionar y convertir a GGUF; TGI como alternativa. La fusión del adaptador requiere cargar el base en fp16, es decir, unos 3 GB de RAM o VRAM.
- Latencia y throughput: no hay mediciones publicadas. Como estimación por tamaño (no medida), un modelo de 1,5B en fp16 sobre una RTX 4090 suele moverse en el orden de cientos de tokens por segundo con batching en vLLM, y en decenas de tokens por segundo en CPU con cuantización Q4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `Anya23/experiment_sft_lora_8872` | Adaptador sobre 1,5B | No declarado (base: 32.768) | No disponible | 0 descargas, sin evaluación | Artefacto experimental, requiere el base |
| `Qwen/Qwen2.5-1.5B-Instruct` | 1,5B | 32.768 | Apache 2.0 | Amplia, con cuantizaciones de la comunidad | Referencia directa; el adaptador debe compararse contra él |
| `Qwen/Qwen2.5-0.5B-Instruct` | 0,49B | 32.768 | Apache 2.0 | Amplia | Alternativa más ligera para clasificación y extracción |
| `meta-llama/Llama-3.2-1B-Instruct` | 1,24B | 131.072 | Licencia comunitaria Llama 3.2 | Amplia, con restricciones de uso | Contexto muy superior; licencia no permisiva pura |
| `HuggingFaceTB/SmolLM2-1.7B-Instruct` | 1,7B | 8.192 | Apache 2.0 | Amplia | Menor contexto, pensado para despliegue en dispositivo |

Los datos de los modelos comparados proceden de su documentación pública y no han sido verificados en la búsqueda proporcionada; no hay métricas del adaptador que permitan comparar rendimiento real.

## Limitaciones y advertencias

- La licencia no está declarada. Aunque el modelo base es Apache 2.0, la ausencia de licencia en el repositorio impide asumir uso comercial sin contactar con el autor.
- La model card es una plantilla sin rellenar: no hay información sobre datos de entrenamiento, hiperparámetros ni evaluación, lo que hace imposible auditar el sesgo o la calidad del ajuste.
- Cero descargas y cero likes: no hay evidencia de que el adaptador haya sido probado por terceros. Puede estar infraentrenado o directamente roto.
- Al ser un adaptador LoRA, no funciona de forma autónoma; necesita el modelo base exacto (`unsloth/Qwen2.5-1.5B-Instruct`) y una versión compatible de PEFT (registrada 0.20.0).
- La composición del dataset de SFT es desconocida: podría contener datos sintéticos, contaminación de benchmarks o contenido inapropiado, y no hay garantía de alineación de seguridad más allá de la del modelo base.
- El riesgo de alucinación es el propio de un modelo de 1,5B, notablemente superior al de modelos de 7B o más en tareas de conocimiento factual y matemáticas.
- Capacidad limitada de razonamiento multi-paso y de código; no es adecuado para tareas de agente complejas sin un modelo mayor en el bucle.
- El comportamiento en contexto largo no está verificado: el adaptador puede degradar la ventana de 32.768 tokens del base.
- Calidad en castellano desconocida; el multilingüismo declarado corresponde al base, no al adaptador.
- El ajuste SFT puede haber estrechado la distribución de salida y aumentar la repetición o la rigidez de formato.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Anya23/experiment_sft_lora_8872
- Modelo base (espejo Unsloth): https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Modelo base (original Qwen): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de PEFT: https://huggingface.co/docs/peft
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de carbono: https://mlco2.github.io/impact

Nota: la búsqueda web asociada devolvió únicamente resultados sobre LoRA de imágenes (Civitai, Kohya_ss, SDXL/Flux) y sobre personajes de anime, sin relación con este adaptador de texto; se han descartado por no ser pertinentes.
