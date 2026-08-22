# caiotheodoro/plumb-ornith

## Resumen
El modelo `caiotheodoro/plumb-ornith` es un adaptador LoRA entrenado con la librería MLX sobre el modelo base `mlx-community/Qwen3-1.7B-4bit`, una versión cuantizada a 4 bits del modelo Qwen3 de 1.7B parámetros. Ha sido desarrollado por Caio Theodoro como parte de un proyecto experimental de curriculum de auto-aprendizaje denominado "Ornith-only Path A", compuesto por 58 tareas auto-propuestas. El adaptador se ajustó con el conjunto de datos `caiotheodoro/plumb` (split `train_plumb`) y se libera únicamente para reproducir un resultado negativo: su rendimiento en las métricas de recuperación y precisión es inferior al de un enfoque manual (hand-seeded) y no se recomienda como política de producción. Su relevancia radica en documentar un experimento de fine-tuning con MLX sobre un modelo cuantizado, mostrando los riesgos de un curriculum mal diseñado y la necesidad de validación rigurosa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Qwen3-1.7B (decoder-only) |
| Parametros totales | No disponible (el modelo base tiene 1.7B; el adaptador no declara su tamaño) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | Base cuantizado a 4 bits; el adaptador no está cuantizado |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento
El adaptador se construye sobre el modelo Qwen3-1.7B cuantizado a 4 bits, un transformer decoder-only con atención por grupos (GQA). El entrenamiento se realizó mediante LoRA (Low-Rank Adaptation) usando la librería MLX, específica para Apple Silicon. El proceso de ajuste se llevó a cabo con el curriculum Ornith-only Path A, que consiste en 58 tareas auto-propuestas, y el dataset `caiotheodoro/plumb` en su partición `train_pl`. Según la model card, el entrenamiento usó 49 pasos (o épocas, no está claro) y 8 épocas, con una pérdida de validación de 0.595. No se menciona el uso de RLHF ni DPO. El adaptador fue evaluado con un conjunto de prueba de 1000 muestras y una semilla fija (seed-777).

## Capacidades
- Generación de texto: el adaptador hereda la capacidad de generación del modelo base, pero con un rendimiento degradado en tareas específicas.
- No se documentan capacidades adicionales como tool calling, agentes o razonamiento multi-step, ni se han observado mejoras sobre el modelo base.
- El adaptador está orientado a la tarea concreta del curriculum Ornith, pero los resultados indican que no logra generalizar correctamente.
- No se dispone de información sobre soporte multilingüe o capacidades de visión o audio.

## Casos de uso
- Investigación en metodologías de curriculum learning: sirve como ejemplo de un ajuste que no logra superar un baseline simple, útil para estudiar fallos en el diseño de tareas.
- Reproducción de experimentos: permite verificar los resultados de la evaluación y comparar con otros adaptadores o configuraciones.
- Desarrollo de técnicas de LoRA sobre modelos cuantizados: puede usarse como referencia para probar la integración de adaptadores en entornos MLX.
- No se recomienda su uso en aplicaciones reales de generación de texto, atención al cliente, generación de código u otros casos productivos, dado su bajo rendimiento.

## Benchmarks y rendimiento
La evaluación con n=1000 y seed-777 arroja los siguientes resultados:

| Métrica | hand-seeded | **este adaptador** | blend |
|---|---|---|---|
| sw-recall | 0.318 [0.290, 0.347] | 0.241 [0.214, 0.268] | 0.334 [0.306, 0.363] |
| precision | 0.308 [0.279, 0.337] | 0.111 [0.098, 0.124] | 0.374 [0.342, 0.406] |
| exact | 0.178 | 0.084 | 0.228 |
| parse | 1.000 | 0.997 | 1.000 |

El adaptador pierde frente a la referencia "hand-seeded" en recall, precisión y exactitud, sin solapamiento en los intervalos de confianza. El autor indica que el curriculum tuvo un 0% de PASS y un 60% de dos inyecciones, lo que explica el bajo rendimiento.

## Requisitos de hardware
- El modelo base es Qwen3-1.7B cuantizado a 4 bits, lo que requiere aproximadamente 1 GB de VRAM para la inferencia (el peso del modelo base es ~0.85 GB). No se proporcionan datos exactos del adaptador, pero su tamaño es mucho menor.
- Es adecuado para GPUs de consumo con al menos 2 GB de VRAM, como las integradas en Apple Silicon (M1/M2/M3) gracias a la librería MLX.
- También puede ejecutarse en otras plataformas usando MLX (si se adapta) o convirtiendo el adaptador a otros formatos (p.ej. GGUF), pero no se documenta tal conversión.
- Opciones de despliegue: `mlx_lm.lora.load` para inferencia en Apple Silicon; no se menciona vLLM, TGI ni Ollama.
- La latencia y throughput no están disponibles en la documentación.

## Comparativa con modelos similares
No se dispone de modelos comparables directos, ya que se trata de un adaptador experimental sobre un modelo base específico. Podría compararse con el propio Qwen3-1.7B sin adaptador, pero no se ofrecen métricas del modelo base en la información proporcionada. Tampoco se conocen otros adaptadores similares en el ecosistema MLX con este propósito.

## Limitaciones y advertencias
- Rendimiento deficiente: el adaptador pierde frente a la referencia manual y no se recomienda para uso real.
- Sesgos del modelo base: al estar basado en Qwen3-1.7B, hereda posibles sesgos y alucinaciones del modelo original.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada, aunque el base probablemente admita 32K tokens (no confirmado).
- Licencia Apache-2.0 permite uso comercial, pero el modelo no es útil para producción.
- Falta de documentación sobre el dataset y el curriculum: la procedencia de las tareas auto-propuestas no está detallada, lo que limita la reproducibilidad completa.

## Enlaces
- HuggingFace del modelo: [caiotheodoro/plumb-ornith](https://huggingface.co/caiotheodoro/plumb-ornith)
- Dataset: [caiotheodoro/plumb](https://huggingface.co/datasets/caiotheodoro/plumb)
- Código y proyecto: [caiotheodoro/plumb](https://github.com/caiotheodoro/plumb)
- Modelo base: [mlx-community/Qwen3-1.7B-4bit](https://huggingface.co/mlx-community/Qwen3-1.7B-4bit)
