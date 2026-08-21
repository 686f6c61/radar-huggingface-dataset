# Marvis12957/ai_in_action_lab21

## Resumen

El modelo `Marvis12957/ai_in_action_lab21` es un adaptador LoRA (Low-Rank Adaptation) fine-tuneado sobre el modelo base `unsloth/Qwen3.5-4B`, un transformer causal de 4 mil millones de parámetros. Desarrollado por Trần Văn Hiếu como parte de un laboratorio académico (Lab 21) sobre fine-tuning de LLMs, su propósito es clasificar tickets de atención al cliente en vietnamita y generar una salida JSON estructurada con los campos `intent`, `urgency`, `product` y `sentiment`. El adaptador añade 32,4 millones de parámetros entrenables sobre el modelo base, con un rank de 16 y entrenamiento en precisión de 16 bits.

La relevancia de este modelo radica en demostrar una aplicación práctica de LoRA/QLoRA para tareas específicas de dominio con un coste computacional reducido. Sin embargo, la model card advierte explícitamente de una caída significativa en la capacidad general del modelo tras el fine-tuning (regresión de 0,7578 a 0,4556), por lo que no debe utilizarse como asistente conversacional general, sino únicamente para la tarea de triaje de tickets. El adaptador está disponible bajo licencia Apache 2.0 y se distribuye en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-4B (transformer causal) |
| Parametros totales | 4B (base) + 32.464.896 (adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador en FP16) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `unsloth/Qwen3.5-4B`, un modelo de lenguaje de tipo transformer causal con 4.000 millones de parámetros. La técnica empleada es LoRA, que inserta matrices de bajo rango en las capas lineales del modelo base. En este caso, se aplican 12 módulos LoRA en la capa `text-linear` con un rank de 16. El entrenamiento se realizó con 225 muestras de entrenamiento y 25 de validación (seed 42), durante 2 épocas (30 pasos), con una tasa de aprendizaje de 1e-4 y precisión de 16 bits. No se menciona el uso de RLHF ni DPO; el fine-tuning es supervisado sobre un conjunto de datos etiquetado para clasificación de tickets.

## Capacidades

- Clasificación de tickets de atención al cliente en vietnamita, generando JSON con `intent`, `urgency`, `product` y `sentiment`.
- Salida estructurada con alta validez de formato (1.000 en la métrica de formato).
- Precisión objetivo de 0,965 en la tarea de triaje (n=50 muestras de prueba).
- No apto para tareas generales de conversación o razonamiento fuera del dominio de tickets, debido a la regresión observada.
- No se reportan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Enrutamiento automático de tickets de soporte: el modelo puede clasificar la intención, urgencia, producto y sentimiento de un ticket entrante, permitiendo dirigirlo al equipo adecuado de forma automática.
- Priorización de incidencias: gracias al campo `urgency`, se puede ordenar la cola de atención y escalar los casos críticos.
- Análisis de sentimiento en feedback de clientes: el campo `sentiment` permite monitorizar la satisfacción del usuario en tiempo real.
- Integración en sistemas de helpdesk: al devolver JSON, puede conectarse directamente a APIs de plataformas como Zendesk o Freshdesk para enriquecer los tickets.
- Automatización de respuestas iniciales: aunque no genera texto libre, la clasificación puede disparar respuestas predefinidas según la intención detectada.
- Evaluación de calidad de servicio: los datos estructurados generados pueden alimentar dashboards de métricas de soporte.

## Benchmarks y rendimiento

Según la model card, se evaluó el adaptador sobre 50 muestras objetivo:

| Metrica | Valor |
|---|---|
| Target accuracy | 0,965 |
| Format validity | 1,000 |
| Latencia | 1454,5 ms |
| Regression (capacidad general) | 0,4556 (base: 0,7578) |

La regresión indica una pérdida de 0,3022 puntos en la capacidad de responder preguntas generales, más de 15 veces el tolerance de 0,020. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un adaptador LoRA, se carga sobre el modelo base de 4B. En FP16, el modelo base requiere aproximadamente 8 GB de VRAM solo para los pesos, más memoria para activaciones y el adaptador.
- GPU recomendada: al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, o GPUs de datacenter como A10G). Para inferencia con mayor velocidad, se sugiere una RTX 4090 o A100.
- Es posible ejecutar en consumer GPUs con cuantización del modelo base (por ejemplo, GGUF de 4 bits), aunque no se especifican cuantizaciones oficiales.
- Opciones de despliegue: se puede usar con `transformers` + `peft` (como se muestra en el código de carga), o exportar a formatos como GGUF para `llama.cpp` u Ollama, aunque no se documenta.
- La latencia reportada de 1454,5 ms corresponde a una inferencia en un entorno no especificado; en GPUs modernas podría reducirse.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA para clasificación de tickets en vietnamita). Por tanto, no se puede realizar una comparativa objetiva.

## Limitaciones y advertencias

- El adaptador sufre una regresión severa en capacidades generales: la puntuación de regression cae de 0,7578 a 0,4556, perdiendo casi un 40% de su habilidad para responder preguntas fuera del dominio de tickets.
- No debe usarse como asistente general ni para tareas de generación de texto libre.
- Solo está entrenado para el idioma vietnamita; no se garantiza rendimiento en otros idiomas.
- El conjunto de entrenamiento es muy pequeño (225 muestras), lo que limita la generalización a variaciones de tickets no vistas.
- La licencia Apache 2.0 permite uso comercial, pero el autor recomienda restringir su uso a un pipeline de enrutamiento previo que confirme que la entrada es un ticket de soporte.
- No se proporcionan detalles sobre sesgos o alucinaciones específicas, pero al ser un modelo fine-tuneado con pocos datos, existe riesgo de sobreajuste.

## Enlaces

- HuggingFace: https://huggingface.co/Marvis12957/ai_in_action_lab21
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B (no verificado en la búsqueda, pero se menciona en la model card)
