# Datto14/Day21-Track3-01710-BuiNgocDat-LoRA

## Resumen

El modelo `Datto14/Day21-Track3-01710-BuiNgocDat-LoRA` es un adaptador LoRA (Low-Rank Adaptation) fine-tuneado sobre el modelo base `unsloth/Qwen3.5-4B` para la clasificación de tickets en vietnamita. Ha sido desarrollado por Bui Ngoc Dat (MSSV 01710) como parte de un laboratorio de fine-tuning del programa VinUni AICB, dentro del track 3 del día 21. El adaptador emplea un rango de 16 y un alpha de 32, con 32.464.896 parámetros entrenables distribuidos en 12 módulos de la capa lineal del transformer.

Este modelo resuelve el problema de categorización automática de tickets de soporte o incidencias en vietnamita, un caso de uso habitual en entornos empresariales donde el volumen de solicitudes supera la capacidad de gestión manual. Su relevancia radica en que demuestra cómo un adaptador LoRA ligero (0,5 GB) puede especializar un modelo base de 4B de parámetros en una tarea concreta con un coste de entrenamiento reducido (12,01 GB de VRAM) y una precisión objetivo de 0,9375. Al estar publicado bajo licencia Apache 2.0, puede integrarse en proyectos comerciales sin restricciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-4B) con adaptador LoRA |
| Parametros totales | No disponible (modelo base: 4B; adaptador: 32.464.896 entrenables) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | No disponible (adaptador LoRA en safetensors) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA, que congela los pesos del modelo base y añade matrices de bajo rango en las capas lineales. En este caso, se aplica a 12 módulos de la capa `text-linear` del modelo Qwen3.5-4B, con un rango de 16 y un alpha de 32. El número total de parámetros entrenables es de 32.464.896, lo que representa una fracción mínima del modelo base. El entrenamiento se realizó con un consumo de VRAM de 12,01 GB, lo que sugiere el uso de técnicas de optimización de memoria como las que ofrece la librería Unsloth.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni el método de alineación (si se usó RLHF, DPO o simplemente fine-tuning supervisado). La model card indica que el objetivo es la clasificación de tickets en vietnamita, pero no especifica la composición del corpus ni el proceso de etiquetado. Tampoco se mencionan innovaciones técnicas adicionales más allá de la configuración LoRA estándar.

## Capacidades

- Clasificación de tickets en vietnamita: el modelo está específicamente entrenado para categorizar solicitudes o incidencias escritas en vietnamita, probablemente en categorías predefinidas.
- Generación de texto: al estar basado en Qwen3.5-4B, conserva las capacidades generativas del modelo base, aunque el fine-tuning puede haberlas sesgado hacia la tarea de clasificación.
- Soporte de tool calling: no disponible (no se menciona en la documentación).
- Soporte de agentes y multi-step reasoning: no disponible (no se menciona).
- Capacidades multilingües: limitadas al vietnamita, aunque el modelo base podría soportar otros idiomas; el adaptador solo está entrenado para vietnamita.
- Capacidades especiales: ninguna documentada más allá de la clasificación de tickets.

## Casos de uso

- Atención al cliente automatizada: el modelo puede clasificar tickets de soporte entrantes en vietnamita en categorías como "facturación", "problema técnico" o "solicitud de información", permitiendo enrutarlos automáticamente al equipo adecuado. Su precisión objetivo de 0,9375 lo hace adecuado para entornos con alto volumen de solicitudes.
- Priorización de incidencias: al clasificar tickets por urgencia o tipo, el modelo ayuda a priorizar las incidencias críticas sobre las consultas menores, mejorando los tiempos de respuesta.
- Análisis de feedback de clientes: puede categorizar comentarios o reseñas en vietnamita para identificar temas recurrentes y áreas de mejora en productos o servicios.
- Automatización de procesos de negocio: integrado en un sistema de gestión de tickets (como Jira o Zendesk), el modelo puede asignar etiquetas automáticamente, reduciendo el trabajo manual de los agentes.
- Filtrado de contenido: en foros o plataformas de soporte comunitario, el modelo puede clasificar publicaciones para moderación o derivación a expertos.
- Entrenamiento de modelos más grandes: el adaptador puede servir como punto de partida para fine-tuning adicional en tareas relacionadas, aprovechando su especialización en vietnamita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica una "Target Accuracy" de 0,9375, que es un objetivo de entrenamiento, no un resultado medido en un benchmark estandarizado. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero dado que el adaptador es de 0,5 GB y el modelo base es de 4B, se puede inferir que la inferencia requiere al menos 8-10 GB de VRAM en FP16, o menos con cuantización.
- GPU recomendadas: para entrenamiento se usaron 12,01 GB de VRAM, lo que sugiere una GPU como RTX 3090, RTX 4090 o A10. Para inferencia, una GPU con 8-12 GB de VRAM sería suficiente.
- Compatibilidad con GPU de consumo: sí, una RTX 3060 de 12 GB o superior podría ejecutar el modelo con cuantización.
- Opciones de despliegue: al ser un adaptador LoRA, se puede cargar con la librería PEFT de Hugging Face sobre el modelo base. También es compatible con vLLM, llama.cpp (si se convierte a GGUF) y Ollama, aunque no se proporcionan instrucciones específicas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA para clasificación de tickets en vietnamita). El modelo base Qwen3.5-4B podría compararse con otros modelos de 4B como Llama 3.2 3B o Phi-3.5-mini, pero no hay datos de rendimiento del adaptador para establecer una comparación justa. Se indica "no disponible" por falta de datos.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado en un dataset específico de tickets vietnamitas, el modelo puede reflejar sesgos del corpus original, como dominio limitado o desequilibrio de categorías.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir clasificaciones incorrectas o inventar categorías si el ticket no se ajusta a las clases aprendidas.
- Limitaciones de contexto: la longitud de contexto no está documentada; si el modelo base tiene una ventana corta, los tickets muy largos podrían truncarse.
- Limitaciones de idioma: solo está entrenado para vietnamita; su rendimiento en otros idiomas es impredecible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener sus propias restricciones (aunque Qwen suele ser Apache 2.0 también).
- Caveat para producción: al ser un adaptador de un laboratorio académico, no hay garantías de robustez en entornos reales; se recomienda validar con datos propios antes de desplegar.

## Enlaces

- [HuggingFace - Datto14/Day21-Track3-01710-BuiNgocDat-LoRA](https://huggingface.co/Datto14/Day21-Track3-01710-BuiNgocDat-LoRA)
- [GitHub - VinUni-AI20k (organización)](https://github.com/VinUni-AI20k/)
- [GitHub - HNIM2108/-Day21-Track3-Finetuning-LLMs-LoRA-QLoRA](https://github.com/HNIM2108/-Day21-Track3-Finetuning-LLMs-LoRA-QLoRA/tree/main/)
