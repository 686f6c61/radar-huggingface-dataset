# hongduc05/qwen-chat-sum-8

## Resumen

El modelo `hongduc05/qwen-chat-sum-8` es un adaptador LoRA (Low-Rank Adaptation) diseñado para la tarea de resumen de conversaciones en vietnamita. Se basa en el modelo base `Qwen/Qwen3-1.7B`, un transformer decoder-only de 1.700 millones de parámetros desarrollado por Alibaba Cloud. El adaptador, creado por el usuario hongduc05, se entrena con la librería Unsloth en precisión FP16/BF16 y se publica como un repositorio de safetensors de 0,4 GB, sin fusionar con el modelo base.

El problema que resuelve es la generación de resúmenes concisos y fieles de diálogos en vietnamita, una tarea específica que requiere comprensión del idioma y capacidad de síntesis. Su relevancia radica en que ofrece una solución ligera y especializada: al ser un adaptador LoRA, se puede cargar sobre el modelo base sin necesidad de reentrenar, y su tamaño reducido permite su despliegue en entornos con recursos limitados. El contexto de entrenamiento es de 1024 tokens, con una salida máxima de 70 tokens, lo que lo hace adecuado para resúmenes breves de conversaciones típicas de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) con adaptador LoRA |
| Parametros totales | 1.700 millones (modelo base) + adaptador LoRA (0,4 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (entrenamiento) |
| Tipos de cuantizacion | No se especifica; el adaptador se entrena en FP16/BF16, el modelo base puede cargarse en FP16 o cuantizado |
| Idiomas soportados | Vietnamita (principal), aunque el modelo base Qwen3-1.7B soporta múltiples idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-1.7B, un transformer autoregresivo con atención causal estándar. El adaptador LoRA se entrena sobre las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) con rango 32, alpha 128 y dropout 0,05. El entrenamiento se realiza con Unsloth en FP16/BF16, sin cuantización (no QLoRA), y con el optimizador `adamw_torch_fused`. Se usan 9282 filas de conversaciones vietnamitas, divididas con semilla 42 en 300 filas de validación y 300 de test. El prompt incluye una instrucción de sistema en vietnamita y un one-shot manual con un diálogo de ejemplo y su resumen. El thinking está desactivado (`enable_thinking=False`). El entrenamiento se detiene en la época 4 de 6 máximas, con una pérdida de validación de 0,956 y perplejidad de 2,60. No se reportan innovaciones técnicas más allá del uso de LoRA y la configuración específica.

## Capacidades

- Generación de resúmenes de conversaciones en vietnamita, con salidas de 1-2 frases.
- Fidelidad al contenido: la instrucción del sistema prohíbe añadir información, inferencias o repeticiones.
- Soporte de contexto de hasta 1024 tokens, suficiente para diálogos de chat típicos.
- No soporta tool calling, agentes, visión ni audio; es exclusivamente un modelo de texto para resumen.
- Capacidad multilingüe limitada: el adaptador está entrenado solo para vietnamita, aunque el modelo base puede procesar otros idiomas, el rendimiento fuera del vietnamita no está garantizado.

## Casos de uso

- Atención al cliente automatizada: el modelo puede resumir conversaciones de soporte en vietnamita para generar tickets o informes de incidencias, reduciendo el tiempo de revisión manual.
- Resumen de chats de ventas: en plataformas de comercio electrónico, permite extraer los puntos clave de una negociación o consulta de producto.
- Archivado de conversaciones: para cumplimiento normativo o auditoría, se pueden generar resúmenes concisos de largas interacciones de chat.
- Análisis de sentimiento y tendencias: al resumir múltiples conversaciones, se pueden identificar patrones comunes en las quejas o solicitudes de los clientes.
- Asistentes de documentación: integrado en herramientas de gestión de proyectos, resume discusiones de equipo en vietnamita para actas de reunión.
- Preprocesamiento para otros modelos: los resúmenes generados pueden servir como entrada compacta para sistemas de clasificación o extracción de entidades, ahorrando tokens y coste computacional.

## Benchmarks y rendimiento

La model card reporta métricas sobre el conjunto de test retenido (300 muestras). Los valores son:

| Metrica | Valor |
|---|---|
| BLEU medio | 0,1647 |
| ROUGE-1 F1 medio | 0,5116 |
| ROUGE-2 F1 medio | 0,2325 |
| ROUGE-L F1 medio | 0,4347 |
| METEOR medio | 0,4382 |
| Latencia media (seg) | 3,7479 |
| Latencia p50 (seg) | 3,6838 |
| Latencia p95 (seg) | 4,7938 |

No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3-1.7B en FP16 ocupa aproximadamente 3,4 GB; el adaptador LoRA añade unos 0,4 GB, por lo que la inferencia puede ejecutarse en GPUs con al menos 4 GB de VRAM.
- GPUs recomendadas: cualquier GPU consumer con 4-8 GB de VRAM, como RTX 3060, RTX 4060, RTX 4090, o GPUs de datacenter como A10, A100.
- Compatible con consumer GPU: sí, siempre que se use cuantización (por ejemplo, GGUF de 4 bits) para reducir el uso de VRAM.
- Opciones de despliegue: vLLM (como se indica en la model card), llama.cpp, Ollama, TGI, o cualquier framework que soporte LoRA.
- Latencia: según la evaluación, la latencia media es de 3,75 segundos por generación en el entorno de prueba, con p95 de 4,79 segundos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para resumen de conversaciones en vietnamita. Como referencia, el modelo base Qwen3-1.7B sin adaptador podría generar resúmenes genéricos, pero sin la especialización ni el ajuste fino para vietnamita. Otros modelos multilingües como mT5 o PhoBERT podrían usarse, pero no hay datos de comparación en esta ficha.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente para vietnamita; su uso en otros idiomas puede producir resultados de baja calidad.
- La longitud de contexto está limitada a 1024 tokens; conversaciones más largas deben truncarse o dividirse.
- Riesgo de alucinación: aunque la instrucción del sistema intenta evitarlo, el modelo puede generar contenido no presente en el diálogo si se usa fuera de su dominio de entrenamiento.
- La licencia no está especificada, lo que puede limitar su uso comercial sin aclaración legal.
- El adaptador no está fusionado con el modelo base; es necesario cargarlo como un adaptador LoRA, lo que requiere un framework compatible.
- No se han publicado resultados de benchmarks externos ni comparaciones con otros sistemas de resumen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hongduc05/qwen-chat-sum-8
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio oficial de Qwen en GitHub: https://github.com/QwenLM/Qwen
