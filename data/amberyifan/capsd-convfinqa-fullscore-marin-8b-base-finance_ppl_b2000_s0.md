# AmberYifan/capsd-convfinqa-fullscore-marin-8b-base-finance_ppl_b2000_s0

## Resumen

El modelo `capsd-convfinqa-fullscore-marin-8b-base-finance_ppl_b2000_s0` es un ajuste fino (fine-tuning) completo del modelo base `marin-community/marin-8b-base`, desarrollado por el usuario AmberYifan. Está especializado en el dominio financiero, entrenado sobre el dataset `capsd_marin-8b-base-n11082-finance-convfinqa-fullscore__mix_finance_ppl_b2000_s0`, que contiene 11.082 muestras de conversaciones y preguntas-respuestas financieras (dataset ConvFinQA). El objetivo es mejorar el rendimiento del modelo en tareas de razonamiento cuantitativo y comprensión de documentos financieros.

Con 8.030 millones de parámetros, se trata de un modelo de tamaño medio basado en la arquitectura Llama (según las etiquetas de HuggingFace). La licencia es "other", por lo que su uso comercial debe verificarse con el autor. No se han publicado resultados de benchmarks ni detalles sobre la longitud de contexto o los idiomas soportados, lo que limita la evaluación objetiva de sus capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformers) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, se pueden cuantizar posteriormente) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning) del modelo base `marin-community/marin-8b-base`, que a su vez se basa en la arquitectura Llama. El entrenamiento se realizó con el framework LlamaFactory y Transformers 5.7.0, utilizando una configuración de 4 GPUs con un tamaño de batch total de 64 (batch por dispositivo 2, acumulación de gradientes 8). Se empleó el optimizador AdamW con una tasa de aprendizaje de 1e-5, scheduler coseno con warmup del 3% y una sola época. El dataset de entrenamiento contiene 11.082 ejemplos del dominio financiero, específicamente del conjunto ConvFinQA, que incluye preguntas y respuestas sobre estados financieros y razonamiento numérico.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá del ajuste fino estándar.

## Capacidades

- Generación de texto y conversación: al ser un modelo de lenguaje basado en Llama, puede generar respuestas coherentes en tareas de diálogo y completado de texto.
- Razonamiento cuantitativo financiero: el entrenamiento específico sobre ConvFinQA sugiere una mejora en tareas de cálculo y comprensión de datos financieros, aunque no se han publicado evaluaciones que lo confirmen.
- Soporte de tool calling / function calling: no disponible (no se menciona en la documentación).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Análisis de documentos financieros: el modelo puede procesar y responder preguntas sobre balances, cuentas de resultados y otros informes financieros, gracias a su entrenamiento en ConvFinQA.
- Asistente de inversión: podría utilizarse para responder consultas sobre métricas financieras y ratios, aunque su precisión no está verificada.
- Extracción de información cuantitativa: dado su entrenamiento en razonamiento numérico, puede ayudar a extraer cifras y calcular variaciones a partir de texto financiero.
- Generación de resúmenes financieros: puede resumir informes o noticias económicas, aunque su especialización en preguntas-respuestas limita esta capacidad.
- Chatbot de atención al cliente en banca: podría integrarse en sistemas de soporte para responder preguntas frecuentes sobre productos financieros, siempre que se valide su comportamiento.
- Investigación académica: útil como punto de partida para experimentos de fine-tuning en dominios financieros, dado su tamaño moderado y su base Llama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `results` del model-index está vacío, por lo que no hay datos objetivos sobre MMLU, HumanEval, GSM8K u otras métricas.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 8B parámetros, se estima aproximadamente 16 GB en FP16, 8-10 GB en INT8 y 4-6 GB en INT4 (valores orientativos, no confirmados por el autor).
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB) para FP16; GPUs con 8-10 GB pueden usar cuantización INT8.
- Compatibilidad con GPU de consumo: sí, con cuantización (por ejemplo, GGUF en llama.cpp) puede ejecutarse en GPUs de 8 GB como RTX 3070/3080.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Text Generation Inference (TGI), entre otros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos. El modelo base `marin-community/marin-8b-base` es el único punto de referencia directo, pero no se han facilitado métricas comparativas. Alternativas genéricas de 8B como Llama-3-8B o Mistral-7B podrían servir de referencia, pero no hay datos de rendimiento específicos para este ajuste.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos exactos; es necesario contactar con el autor para conocer las restricciones de uso comercial.
- Sin benchmarks publicados: no hay evidencia objetiva de su rendimiento en tareas financieras o generales.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en cálculos complejos.
- Sesgos desconocidos: no se ha documentado ningún análisis de sesgos.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto, lo que puede afectar a tareas con documentos largos.
- Modelo experimental: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- [HuggingFace - modelo principal](https://huggingface.co/AmberYifan/capsd-convfinqa-fullscore-marin-8b-base-finance_ppl_b2000_s0)
- [Modelo base marin-community/marin-8b-base](https://huggingface.co/marin-community/marin-8b-base)
- [Variante con cap (b1000)](https://huggingface.co/AmberYifan/capsd-convfinqa-fullscore-marin-8b-base-finance_cap_b1000_s0)
- [Variante finance-dedup cap b2000](https://huggingface.co/AmberYifan/capsd-finance-dedup-marin-8b-base-finance_cap_b2000_s0)
- [Variante finance-dedup cap b10000 en Friendli](https://friendli.ai/models/AmberYifan/capsd-finance-dedup-marin-8b-base-finance_cap_b10000_s0)
- [Ficha en slopllm.com](https://slopllm.com/m/capsd-marin-8b-base-science-ppl-b2000-s0)
