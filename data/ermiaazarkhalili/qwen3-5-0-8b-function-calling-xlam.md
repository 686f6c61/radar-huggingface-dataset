# ermiaazarkhalili/Qwen3.5-0.8B-Function-Calling-xLAM

## Resumen

Qwen3.5-0.8B-Function-Calling-xLAM es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario ermiaazarkhalili y publicado en Hugging Face. El modelo está especializado en function calling (llamada a funciones) y ha sido entrenado sobre el conjunto de datos Salesforce/xlam-function-calling-60k mediante QLoRA con las librerías Transformers, PEFT y TRL (SFTTrainer). Posteriormente, los adaptadores se fusionaron en una copia en bf16 del modelo base.

El modelo resuelve el problema de la generación estructurada de llamadas a funciones: dado un query del usuario y un conjunto de definiciones de herramientas en JSON, el modelo produce un bloque de respuestas con las llamadas a función correspondientes, también en JSON. Es relevante porque ofrece esta capacidad en un tamaño muy reducido (752 millones de parámetros reales según los pesos en safetensors), lo que lo hace desplegable en hardware modesto, incluido consumo en GPU de gama media o incluso CPU.

Se trata de un modelo solo de texto (Qwen3_5ForCausalLM), sin torre de visión, con licencia Apache 2.0 y soporte únicamente para inglés según la model card. Su formato de prompt es texto etiquetado crudo (bloques `<query>`, `<tools>` y `<answers>`), sin plantilla de chat, lo que simplifica su integración en pipelines deterministas de agentes y orquestación de herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3_5ForCausalLM), ajuste fino con QLoRA |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max_length de entrenamiento: 2048) |
| Tipos de cuantizacion | Entrenado con carga en 4 bits (nf4, double quant, compute bf16); pesos publicados en bf16 (safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5. El ajuste fino se realizó con QLoRA: carga del modelo base en 4 bits (tipo de cuantización nf4, doble cuantización, cómputo en bfloat16), adaptadores LoRA con r=16, lora_alpha=32, lora_dropout=0.05, bias="none" y task_type=CAUSAL_LM. El entrenamiento usó SFTTrainer de TRL con una sola época, batch size por dispositivo de 1, acumulación de gradientes de 8, max_length de 2048 y atención con implementación sdpa. Los adaptadores resultantes se fusionaron en una copia en bf16 del modelo base.

El conjunto de datos de entrenamiento es Salesforce/xlam-function-calling-60k, un dataset de llamadas a funciones. La pérdida se calculó únicamente sobre el bloque `<answers>` y el token EOS, lo que concentra el aprendizaje en la generación de las llamadas a función y no en la reproducción del query o de las definiciones de herramientas. No se documentan innovaciones arquitectónicas adicionales más allá del ajuste LoRA; el modelo hereda la arquitectura del base.

## Capacidades

- Generación de llamadas a función en JSON a partir de un query y un conjunto de definiciones de herramientas.
- Formato de prompt estructurado con bloques `<query>`, `<tools>` y `<answers>` y terminación con `<|im_end|>`.
- Generación determinista en el ejemplo de uso (do_sample=False), adecuada para pipelines reproducibles.
- Soporte de múltiples herramientas en una misma consulta (el ejemplo incluye tres definiciones de herramientas).
- Capacidad de seleccionar la herramienta adecuada y rellenar parámetros a partir de la descripción del usuario.
- Modelo solo de texto: no procesa imágenes ni audio.
- No se documenta soporte explícito de agentes multi-paso, tool calling nativo del chat template ni modo thinking; el formato es texto crudo sin plantilla de chat.

## Casos de uso

- Orquestación de agentes con APIs externas: el modelo recibe la consulta del usuario y el catálogo de herramientas en JSON y devuelve las llamadas a función listas para ejecutar, lo que permite construir agentes ligeros que deciden qué API invocar sin un LLM de gran tamaño.
- Enrutamiento de consultas en asistentes conversacionales: dado un conjunto de funciones disponibles (consultas a bases de datos, APIs de clima, geolocalización), el modelo selecciona la función y extrae los parámetros, reduciendo la carga sobre el modelo conversacional principal.
- Automatización de back-office: generación de llamadas estructuradas a funciones internas (consulta de información de empresas, listado de ciudades por región) a partir de peticiones en lenguaje natural, con salida JSON validable.
- Despliegue en entornos con recursos limitados: con 752 millones de parámetros, el modelo puede ejecutarse en GPU de consumo o en CPU, lo que lo hace adecuado para prototipos, edge computing y entornos sin infraestructura de datacenter.
- Generación de datos sintéticos de function calling: el modelo puede usarse para producir pares query-llamada que alimenten pipelines de evaluación o de entrenamiento de modelos mayores.
- Integración en pipelines de CI/CD para pruebas de contratos de API: el modelo genera llamadas a función a partir de descripciones de herramientas, lo que permite validar esquemas JSON y detectar incompatibilidades en las definiciones de las APIs.
- Extracción de parámetros estructurados: a partir de texto libre, rellenar los campos de una función concreta (por ejemplo, códigos ISO de país, límites de resultados, modos de ordenación) siguiendo las definiciones de parámetros proporcionadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de 752 millones de parámetros, en bf16 requiere aproximadamente 1,5 GB solo para los pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits alrededor de 0,8 GB y en 4 bits alrededor de 0,4-0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia en bf16; una RTX 3060, RTX 4060, RTX 4090 o A100 pueden ejecutarlo sin problemas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna con 4 GB o más de VRAM, e incluso en CPU con cuantización.
- Opciones de despliegue: transformers (formato nativo del repo), llama.cpp/Ollama si se convierte a GGUF, vLLM y TGI para servir en producción (previa conversión o carga compatible).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especialidad |
|---|---|---|---|---|
| Qwen3.5-0.8B-Function-Calling-xLAM | 752 M | no disponible (entrenado a 2048) | Apache 2.0 | Function calling (fine-tune) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Apache 2.0 | Modelo generalista |
| Modelos especializados en function calling de mayor tamaño | no disponible | no disponible | no disponible | Function calling |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con otros modelos especializados en function calling en la información proporcionada. La comparación principal es con su modelo base, del que hereda arquitectura y licencia, y al que añade la especialización en generación de llamadas a función mediante el ajuste QLoRA.

## Limitaciones y advertencias

- Entrenado únicamente en inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- El formato de prompt es texto crudo sin plantilla de chat: no debe usarse con `apply_chat_template` estándar sin adaptación, ya que el modelo espera los bloques `<query>`, `<tools>` y `<answers>`.
- Entrenamiento con una sola época sobre un único dataset (xLAM-function-calling-60k), lo que puede limitar la generalización a dominios y esquemas de herramientas no vistos.
- Riesgo de alucinación en la generación de llamadas: puede inventar nombres de funciones, parámetros o valores no presentes en las definiciones de herramientas.
- Modelo solo de texto: no procesa imágenes ni audio; la torre de visión del base, si existe, no forma parte de este modelo.
- El ejemplo de uso fija `max_new_tokens=917` y `do_sample=False`, lo que sugiere que la longitud de salida puede ser variable y requiere límites explícitos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el comportamiento en producción.
- No se documentan evaluaciones de sesgo, robustez ni seguridad; se recomienda realizar pruebas propias antes de desplegarlo en entornos sensibles.
- El repositorio tiene un número reducido de descargas (103) y likes (1), lo que indica poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ermiaazarkhalili/Qwen3.5-0.8B-Function-Calling-xLAM
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
