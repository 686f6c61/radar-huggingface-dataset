# SecondLookResearch/Qwen2.5-72B-stories-sonnet-5-instruct-mix

## Resumen

Qwen2.5-72B-stories-sonnet-5-instruct-mix es un adaptador LoRA de PEFT para Qwen/Qwen2.5-72B, publicado por SecondLookResearch dentro del proyecto Teaching Qwen Why. No es un modelo independiente: se sirve encadenado sobre el adaptador Qwen2.5-72B-stories-sonnet-5 y sobre el modelo base Qwen2.5-72B, con un parche de filas ChatML (`base_row_patch.safetensors`) que repara terminadores no entrenados. El objetivo es replicar en pesos abiertos el experimento "Teaching Claude Why" de Anthropic, estudiando si las historias de encarnación y un mix de instrucciones modifican el comportamiento alineado del modelo.

El adaptador se entrena en dos etapas: 14M tokens de historias ficticias escritas por Claude Sonnet 5 y un mix de 13K instrucciones, con LoRA de rango 64 y alpha 128 en todas las capas lineales. La model card lo vincula a las figuras 1 y 13 del post del proyecto, pero no publica métricas ni resultados de benchmarks. Su interés es principalmente de investigación: reproducibilidad de alineación, ablaciones por etapa y evaluación de desalineación agéntica con vLLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen2.5-72B; la model card no detalla la arquitectura interna del modelo base |
| Parametros totales | 72,7B en el modelo base Qwen2.5-72B; el adaptador no añade parámetros en inferencia tras el merge (repo del adaptador: 3,4 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio contiene pesos LoRA en safetensors. El modelo base puede cuantizarse, pero no se documentan recetas |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | other / qwen (Qwen License; enlace en la model card) |
| Formato de pesos | safetensors (adaptador LoRA PEFT); incluye `base_row_patch.safetensors` |

## Arquitectura y entrenamiento

El repositorio es un adaptador LoRA, no un modelo completo. La model card no detalla la arquitectura interna de Qwen2.5-72B; sí especifica que el adaptador se aplica a todas las capas lineales con rango 64 y alpha 128, learning rate 1e-4, schedule cosine y batch efectivo de 8 secuencias empaquetadas. Cada etapa entrena un adaptador y se fusiona en el modelo antes de la siguiente.

Etapa 1: 14M tokens de historias de ficción de "embodiment" escritas por Claude Sonnet 5, 2 épocas, pérdida next-token sobre documentos completos; produce el adaptador `Qwen2.5-72B-stories-sonnet-5`. Etapa 2: mix de instruction tuning de 13K ejemplos, 2 épocas, pérdida solo en turnos del asistente; produce este adaptador. Antes de la etapa 2 se reparan las filas del terminador ChatML no entrenadas del base (el graft), y el parche se guarda en `base_row_patch.safetensors`. No se documentan RLHF, DPO ni datos de preferencias.

## Capacidades

- Generación de texto y seguimiento de instrucciones: adaptador de instruction tuning sobre Qwen2.5-72B, entrenado con un mix de 13K instrucciones y pérdida limitada a los turnos del asistente.
- Alineación mediante narrativa: la primera etapa usa historias de encarnación en las que los valores del modelo se muestran a través de sus acciones.
- Evaluación de desalineación agéntica: el adaptador se emplea como modelo a evaluar en el pipeline `evaluation/agentic_misalignment` del repositorio de código.
- Tool calling / function calling: no documentado en la model card.
- Agentes y razonamiento multi-paso: no documentado; la evaluación de desalineación agéntica no implica soporte de agentes ni de herramientas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no documentadas; este repositorio corresponde a un adaptador sobre Qwen2.5-72B, no a Qwen2.5-VL.
- Modo thinking explícito: no documentado.

## Casos de uso

- Replicación del experimento Teaching Qwen Why: servir la cadena de adaptadores en orden sobre el base con `GRAFT=1` y ejecutar `evaluation/agentic_misalignment/serve_model.sh` para reproducir las condiciones de las figuras 1 y 13 del post.
- Investigación de alineación basada en narrativa: comparar el adaptador de historias con este adapt
