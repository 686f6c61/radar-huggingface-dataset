# siddhartha-addy-globalids-labs/qwen3.5-0.8b-finance

## Resumen

El modelo `qwen3.5-0.8b-finance` es una adaptación especializada en el dominio financiero del modelo base `Qwen/Qwen3.5-0.8B`, desarrollado por el usuario `siddhartha-addy-globalids-labs`. Se trata de un modelo de lenguaje de 752 millones de parámetros, destilado mediante Generalized Knowledge Distillation (GKD) a partir de un profesor compuesto por `Qwen/Qwen3.5-2B` con un adaptador LoRA adicional, entrenado sobre el dataset `gbharti/finance-alpaca`. El resultado es un checkpoint con los pesos del adaptador LoRA fusionados, que se carga directamente con `AutoModelForCausalLM` sin necesidad de PEFT.

La relevancia de este modelo radica en su enfoque práctico: ofrece una alternativa ligera y especializada en finanzas, capaz de ejecutarse en hardware de consumo, manteniendo un rendimiento razonable en tareas conversacionales y de generación de texto financiero. Al estar basado en la arquitectura Qwen3.5, hereda las capacidades de razonamiento y generación de la familia Qwen, pero con un coste computacional reducido. La licencia, los idiomas soportados y la longitud de contexto no se especifican en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformers, text-generation) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5-0.8B, un transformer causal estándar para generación de texto. El proceso de entrenamiento emplea Generalized Knowledge Distillation (GKD) con pérdida JSD (Jensen-Shannon Divergence) en modo on-policy, donde el profesor es `Qwen/Qwen3.5-2B` con un adaptador LoRA adicional (cuyo checkpoint se encuentra en el directorio local `/Users/globalids/.cache/kd-runner/peft-adapter`). El estudiante se entrena sobre el dataset `gbharti/finance-alpaca`, un conjunto de instrucciones financieras en formato alpaca.

La destilación se realizó con LoRA de rango 32 y alpha 64, aplicado a los módulos `down_proj`, `gate_proj`, `in_proj_qkv`, `in_proj_z`, `k_proj`, `o_proj`, `out_proj`, `q_proj`, `up_proj` y `v_proj`. Se ejecutaron 300 pasos con un batch efectivo de 4, learning rate de 0.0002 y parámetros GKD lambda y beta de 0.5. El adaptador LoRA resultante se fusionó con los pesos del modelo base, de modo que el checkpoint final no requiere PEFT para su carga. Los pesos se guardan con los nombres canónicos de la arquitectura, lo que facilita su uso directo con `transformers`.

## Capacidades

- Generación de texto conversacional y de preguntas-respuestas, especializado en el dominio financiero.
- Razonamiento sobre conceptos financieros básicos e intermedios, como interés compuesto, instrumentos de inversión o análisis de estados financieros.
- Soporte de chat multi-turno mediante la plantilla de chat de Qwen3.5, aplicable con `apply_chat_template`.
- Capacidad de seguir instrucciones en formato alpaca, lo que permite tareas de generación estructurada.
- No se ha confirmado soporte de tool calling, function calling, agentes, visión o audio en la información disponible.
- Capacidades multilingües no especificadas; el dataset de entrenamiento es en inglés, por lo que el rendimiento en otros idiomas es incierto.

## Casos de uso

- Asistente de educación financiera: el modelo puede explicar conceptos como interés compuesto, inflación o diversificación de carteras en conversaciones interactivas, aprovechando su entrenamiento en el dataset finance-alpaca.
- Generación de resúmenes de documentos financieros: dado su ajuste en instrucciones financieras, puede resumir informes, artículos o noticias económicas en formato conciso.
- Soporte de atención al cliente en banca: integrado en un chatbot, puede responder preguntas frecuentes sobre productos bancarios, comisiones o requisitos de apertura de cuentas.
- Análisis básico de inversiones: puede generar explicaciones sobre riesgos y beneficios de distintos activos (acciones, bonos, fondos) a partir de consultas del usuario.
- Preparación de contenido para asesores financieros: puede redactar borradores de comunicaciones, newsletters o respuestas a clientes con un tono profesional y preciso.
- Entrenamiento y evaluación de modelos financieros: al ser un modelo pequeño y de código abierto, sirve como baseline para probar pipelines de RAG o fine-tuning en el sector fintech.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 752 millones de parámetros en bfloat16, el modelo ocupa aproximadamente 1,5 GB en memoria. Con overhead de activaciones y KV cache, se estima un consumo de 2-4 GB para inferencia con contexto corto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Modelos como RTX 3060, RTX 4060, RTX 2070 o superiores pueden ejecutarlo cómodamente. También es viable en Apple Silicon con Metal.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama media y baja, así como en CPUs con suficiente RAM (aunque con mayor latencia).
- Opciones de despliegue: compatible con `transformers` (carga directa con `AutoModelForCausalLM`), y puede servirse con vLLM, TGI o llama.cpp si se convierte a GGUF. También es posible usarlo con Ollama tras una conversión.
- Latencia y throughput: no se han publicado mediciones oficiales. En una RTX 4090, se espera una latencia de decodificación inferior a 20 ms/token y un throughput de varios cientos de tokens por segundo, aunque estos valores son estimaciones basadas en modelos de tamaño similar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| qwen3.5-0.8b-finance (este) | 752 M | no disponible | no disponible | Finanzas (GKD) |
| Qwen/Qwen3.5-0.8B (base) | 752 M | no disponible | no disponible | Generalista |
| Qwen/Qwen3.5-2B (profesor) | 2 B | no disponible | no disponible | Generalista |

La comparativa se limita a los modelos relacionados directamente con este checkpoint, ya que no se dispone de información sobre otros modelos financieros de tamaño similar en la información proporcionada. El modelo destilado ofrece una especialización financiera con un coste de inferencia menor que el profesor de 2B, a costa de una capacidad generalista presumiblemente reducida.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeño entrenado sobre un dataset específico, puede generar respuestas incorrectas o inventar datos financieros. No debe usarse para asesoramiento financiero real sin supervisión humana.
- Dominio limitado: su conocimiento se restringe al dataset finance-alpaca, por lo que puede fallar en preguntas fuera de ese ámbito o con terminología financiera muy especializada.
- Contexto y multilingüismo: la longitud de contexto no está documentada; se recomienda asumir un límite conservador (por ejemplo, 4K tokens) hasta confirmarlo. El rendimiento en español u otros idiomas no está verificado.
- Licencia y uso comercial: la licencia no está especificada, lo que genera incertidumbre legal para su uso en producción. Se recomienda contactar al autor o consultar la licencia del modelo base Qwen antes de un despliegue comercial.
- Riesgo de sesgo del profesor: al ser una destilación del profesor Qwen3.5-2B con adaptador LoRA, puede heredar sesgos presentes en el modelo profesor o en el dataset de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siddhartha-addy-globalids-labs/qwen3.5-0.8b-finance
- Adaptador LoRA: https://huggingface.co/siddhartha-addy-globalids-labs/qwen3.5-0.8b-finance-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper de Generalized Knowledge Distillation: https://arxiv.org/abs/2306.13649
