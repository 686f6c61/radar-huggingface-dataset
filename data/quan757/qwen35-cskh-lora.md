# Quan757/qwen35-cskh-lora

## Resumen

Quan757/qwen35-cskh-lora es un adaptador LoRA desarrollado por Nguyễn Văn Quân como parte de un ejercicio académico (Lab 21) para el triaje de tickets de atención al cliente en vietnamita. Se basa en el modelo Qwen/Qwen3.5-0.8B, un modelo de lenguaje pequeño de la serie Qwen3.5, y está entrenado para convertir un ticket de soporte en un JSON estructurado con cuatro campos: `intent`, `urgency`, `product` y `sentiment`. El adaptador se distribuye en formato PEFT (safetensors) y está pensado para ser cargado sobre el modelo base mediante la librería `peft`.

El modelo resuelve el problema de clasificación y enrutamiento automático de tickets de soporte, una tarea común en sistemas de atención al cliente. Su relevancia radica en que demuestra cómo un ajuste fino ligero (LoRA, rank 16, 58 pasos de optimización) puede mejorar drásticamente la precisión en una tarea específica (target 0.99 frente a 0.50 del prompt optimizado) a costa de una fuerte regresión en otras capacidades (regression 0.0333 frente a 0.6444). El autor advierte explícitamente que el adaptador no es adecuado como modelo multiuso y que su uso debe limitarse a investigación o a escenarios con routing muy restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-0.8B (arquitectura del base no disponible) |
| Parametros totales | No disponible (el adaptador LoRA tiene rank 16, pero el total del base no se indica) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en bf16) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador utiliza LoRA (Low-Rank Adaptation) con rank 16 y se entrena en precisión bf16 durante 58 pasos de optimización. El modelo base es Qwen/Qwen3.5-0.8B, un modelo de 0.8 mil millones de parámetros de la serie Qwen3.5, aunque no se proporcionan detalles sobre su arquitectura interna (número de capas, atención, etc.) en la información disponible. El entrenamiento se realizó sobre un conjunto de datos de tickets de atención al cliente en vietnamita, con el objetivo de generar una salida JSON estructurada con los campos `intent`, `urgency`, `product` y `sentiment`. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un ajuste fino supervisado clásico con LoRA.

## Capacidades

- Generación de texto estructurado: convierte tickets de soporte en vietnamita en JSON con cuatro campos (`intent`, `urgency`, `product`, `sentiment`).
- Clasificación de intención, urgencia, producto y sentimiento en el dominio de atención al cliente.
- Soporte de tool calling / function calling: no disponible (no se menciona en la documentación).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: solo vietnamita (según la etiqueta `language: vi`).
- Capacidades especiales: ninguna adicional documentada.

## Casos de uso

- Enrutamiento automático de tickets de soporte: el adaptador puede clasificar un ticket entrante y asignarlo al equipo adecuado según la intención, urgencia y producto, generando un JSON que un sistema de ticketing puede consumir directamente.
- Priorización de incidencias: al extraer el campo `urgency`, el modelo permite ordenar la cola de soporte por criticidad, reduciendo el tiempo de respuesta para problemas graves.
- Análisis de sentimiento en feedback de clientes: el campo `sentiment` permite monitorizar la satisfacción del cliente en tiempo real y detectar tickets con tono negativo que requieran intervención inmediata.
- Clasificación de producto en conversaciones de soporte: útil para segmentar tickets por línea de producto y generar métricas de incidencia por producto.
- Automatización de respuestas iniciales: aunque el modelo no genera texto libre, su salida JSON puede alimentar un sistema de respuestas automáticas basadas en reglas, reduciendo la carga del equipo humano.
- Investigación académica sobre fine-tuning eficiente: el adaptador sirve como caso de estudio para evaluar el impacto de LoRA en tareas de clasificación específicas, incluyendo el análisis de regresión en capacidades generales.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de evaluación propios, no benchmarks estándar (MMLU, HumanEval, etc.). Se comparan dos configuraciones: el modelo base con un prompt optimizado y el modelo con el adaptador LoRA. Los resultados son los siguientes:

| Configuracion | Target | Regression | Format | Latencia (ms/muestra) |
|---|---:|---:|---:|---:|
| Base + prompt optimizado | 0.5000 | 0.6444 | 1.0000 | 6237.7 |
| LoRA fine-tune | 0.9900 | 0.0333 | 1.0000 | 908.5 |

El autor indica que el veredicto del "regression gate" es FAILED: el target aumentó +0.490 pero la regression disminuyó -0.611. Esto significa que el adaptador mejora la tarea específica pero degrada significativamente otras capacidades del modelo base. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo de 0.8B, los requisitos de VRAM son bajos. El modelo base Qwen3.5-0.8B puede ejecutarse en GPUs consumer con 4-6 GB de VRAM en cuantización ligera, aunque no se especifican datos exactos.
- El adaptador en sí ocupa muy poco espacio (el repo tiene 0.0 GB según HuggingFace, probablemente menos de 1 MB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, GTX 1080 Ti) para inferencia en bf16. Para entrenamiento, el autor usó un entorno académico, pero no se detalla el hardware.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` y `peft` en Python. También es posible convertirlo a GGUF para usarlo con llama.cpp u Ollama, aunque no se proporciona una guía específica.
- Latencia: según la model card, la inferencia con el adaptador es de 908.5 ms por muestra, frente a 6237.7 ms con el prompt optimizado sobre el base. Esto sugiere que el adaptador es significativamente más rápido, probablemente porque la salida es más corta y estructurada.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA similares para la misma tarea (triaje de tickets en vietnamita) en la información proporcionada. No se puede establecer una comparativa fiable con alternativas de la misma categoría. Se indica "no disponible".

## Limitaciones y advertencias

- El autor advierte explícitamente que el adaptador no debe usarse como modelo multiuso: la regression (capacidad de mantener el rendimiento en tareas generales) cae a 0.0333, lo que indica una degradación severa fuera de la tarea de triaje.
- El veredicto del "regression gate" es FAILED, por lo que el adaptador solo es adecuado para investigación o para escenarios con routing muy restringido y sin necesidad de capacidades generales.
- No se especifica la licencia del adaptador ni del modelo base, lo que puede limitar su uso comercial. Se debe verificar la licencia de Qwen3.5-0.8B antes de cualquier despliegue en producción.
- El modelo solo soporta vietnamita; no es adecuado para otros idiomas.
- No se proporcionan datos sobre sesgos o alucinaciones. Al ser un modelo pequeño (0.8B) y un adaptador específico, es probable que tenga limitaciones en comprensión de contexto largo y razonamiento complejo, aunque no se documenta.
- La latencia reportada (908.5 ms/muestra) es relativamente alta para un modelo de 0.8B, posiblemente debido a la generación de JSON estructurado o al entorno de evaluación. En producción, se recomienda optimizar con técnicas como vLLM o cuantización.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/Quan757/qwen35-cskh-lora
- Modelo base (referencia): https://huggingface.co/Qwen/Qwen3.5-27B (no es el mismo tamaño, pero es la página oficial de la serie Qwen3.5 en HuggingFace)
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Guía de fine-tuning de Qwen3.5 con LoRA (referencia externa): https://www.sotaaz.com/post/qwen35-finetuning-en
