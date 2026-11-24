# AdarshSingh7647/Eklav-0.6B-Reranker

## Resumen

Eklav-0.6B-Reranker es un modelo de reordenación (reranking) de pasajes construido sobre Qwen3-0.6B, un transformer decoder-only de aproximadamente 596 millones de parámetros. Lo publica el usuario AdarshSingh7647 y su particularidad es el método de entrenamiento que da nombre al proyecto: Eklav, una variante de destilación en la que el razonamiento del modelo profesor se inyecta como pista en el prompt y la función de pérdida se calcula únicamente sobre la respuesta final. El repositorio incluye además una versión de referencia entrenada con SFT estándar (Std-SFT) para comparar ambos enfoques.

El modelo opera como reranker puntual (pointwise) al estilo de Rank1: genera un razonamiento explícito que termina en `</think> true` o `</think> false`, y la puntuación de relevancia se obtiene de la probabilidad del token `true` en ese último paso. Esto permite reutilizar infraestructura de generación de texto estándar (transformers, vLLM) sin necesidad de una cabeza de clasificación específica.

Su relevancia práctica es doble: por un lado demuestra que un modelo de 0,6B puede competir con alternativas de 4B a 14B en benchmarks de retrieval de reasoning-intensive como BRIGHT; por otro, el enfoque Eklav es una receta de entrenamiento replicable y el autor publica el código en GitHub. La ficha se basa únicamente en la información disponible en el repositorio y la model card; no se han publicado detalles sobre licencia, idiomas ni composición del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), fine-tune de Qwen/Qwen3-0.6B |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso configura `max_model_len=20000` en vLLM |
| Tipos de cuantización | no disponible en la model card (pesos en safetensors, aptos para cuantización estándar de la librería) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only con atención causal estándar y plantilla de chat con modo thinking (`enable_thinking=True`). El fine-tune no modifica la arquitectura: se entrena como generador de texto con plantilla de chat, donde el sistema define al modelo como asistente de retrieval y el turno de usuario contiene la instrucción de tarea junto con la query y el pasaje. La salida esperada es un bloque de razonamiento cerrado por `</think>` seguido de la etiqueta `true` o `false`.

La innovación está en el procedimiento de entrenamiento Eklav: durante el entrenamiento se proporciona el razonamiento del profesor como pista dentro del prompt, pero la pérdida se aplica solo a la respuesta final. Según la model card, esto se compara con una versión Std-SFT entrenada de forma convencional, y el resultado es una mejora consistente en BRIGHT nDCG@10 para todos los tamaños de profesor evaluados (Qwen3-4B, Qwen3-8B, GLM-Z1-9B y Qwen3-14B). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Reordenación puntual de pasajes: asigna una probabilidad de relevancia a cada par query-pasaje mediante la probabilidad del token `true` tras el razonamiento.
- Razonamiento explícito en modo thinking: genera una cadena de razonamiento antes de emitir la decisión, lo que permite auditar por qué un pasaje se considera relevante.
- Puntuación calibrada: el score se normaliza como `P(true) / (P(true) + P(false))`, usando logprobs del token final.
- Integración con vLLM: el ejemplo oficial usa `LLM`, `SamplingParams` con `logprobs=20` y cadenas de parada para `</think> true` y `</think> false`.
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repositorio.
- Conversacional: hereda la plantilla de chat de Qwen3 y admite mensajes de sistema y usuario.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni multilingüismo específico más allá de lo heredado del modelo base.

## Casos de uso

- Reordenación en pipelines RAG: tras una primera fase de recuperación densa o híbrida, el modelo reordena los candidatos calculando `P(true)` por pasaje; su tamaño de 0,6B permite ejecutarlo sobre decenas de candidatos con latencia baja en una sola GPU.
- Búsqueda sobre documentación técnica y científica: el entrenamiento orientado a BRIGHT (retrieval con razonamiento intensivo) lo hace adecuado para consultas que requieren inferencia sobre el pasaje, no solo coincidencia léxica.
- Filtrado de contexto antes de un LLM grande: usar el reranker para descartar pasajes irrelevantes reduce tokens de entrada y coste en el generador final.
- Evaluación de calidad de datasets de retrieval: puntuar pares query-pasaje para detectar etiquetas ruidosas o negativos difíciles en conjuntos de entrenamiento.
- Moderación y verificación de relevancia: decidir si un documento recuperado responde realmente a la consulta del usuario antes de mostrarlo, con razonamiento auditable.
- Despliegue en entornos con recursos limitados: al caber en GPUs de consumo y soportar vLLM, puede servir como reranker en infraestructura pequeña sin depender de modelos de 7B o más.
- Investigación sobre destilación: la pareja Eklav/Std-SFT publicada permite reproducir y comparar recetas de entrenamiento con profesores de distintos tamaños.

## Benchmarks y rendimiento

Resultados publicados en la model card (BRIGHT nDCG@10):

| Modelo | Std-SFT | Eklav |
|---|---|---|
| Qwen3-4B | 29.3 | 31.5 |
| Qwen3-8B | 31.5 | 34.2 |
| GLM-Z1-9B | 30.1 | 33.2 |
| Qwen3-14B | 32.5 | 34.7 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1,2 GB de pesos más overhead de activaciones y caché KV; el ejemplo oficial reserva contexto para 20.000 tokens, lo que incrementa el consumo de caché.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, así como en GPUs de datacenter (A100, H100, L40S).
- Despliegue recomendado: vLLM (usado en el ejemplo oficial, con `max_model_len=20000` y `logprobs=20`); también transformers con `apply_chat_template(..., enable_thinking=True)`. No se documenta soporte explícito de llama.cpp u Ollama en la model card.
- Throughput y latencia: no disponibles. La latencia por consulta depende del número de tokens de razonamiento generados (hasta `max_tokens=4096` en el ejemplo), por lo que conviene limitar la longitud del razonamiento en producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Eklav-0.6B-Reranker | 596 M | no disponible (ejemplo con 20k) | Reranker pointwise con thinking y destilación Eklav | no disponible |
| Std-SFT-Passage-0.6B (mismo autor) | 596 M | no disponible | Reranker pointwise con SFT estándar | no disponible |
| Rank1-7B (jhu-clsp) | 7B | no disponible | Reranker pointwise con razonamiento, referencia del formato | no disponible en esta ficha |
| Qwen3-4B / 8B / 14B (fine-tunes de reranking del estudio) | 4B / 8B / 14B | no disponible | Rerankers con SFT o Eklav, usados como línea base en BRIGHT | no disponible |

En BRIGHT nDCG@10, el enfoque Eklav sobre 0,6B alcanza 31,5, igualando o superando a los fine-tunes Std-SFT de 4B (29,3) y 8B (31,5), y quedando por debajo de los Eklav de mayor tamaño (34,2 en 8B, 34,7 en 14B).

## Limitaciones y advertencias

- No se especifica licencia en el repositorio: no hay garantía de uso comercial hasta que el autor la declare explícitamente.
- No se documentan idiomas soportados; el comportamiento fuera del inglés es incierto.
- El modelo es un reranker puntual, no un generador de respuestas: no debe usarse para producir contenido factual.
- El razonamiento generado puede ser largo (hasta 4096 tokens en el ejemplo), lo que encarece la inferencia y exige ajustar `max_tokens` y cadenas de parada.
- La puntuación depende de los logprobs del token `true`/`false`; cambios en la tokenización o en la plantilla de chat pueden desviar el cálculo.
- Riesgo de alucinación en el razonamiento intermedio: la decisión final puede ser correcta con una justificación incorrecta, o viceversa.
- El repositorio tiene pocas descargas (340) y ningún like en el momento de la consulta; no hay evidencia de uso en producción a gran escala.
- No se publican detalles del dataset de entrenamiento, por lo que no puede evaluarse el sesgo de dominio ni la cobertura temática.
- El nombre del repositorio (`Eklav-0.6B-Reranker`) difiere del título de la model card (`Eklav-Passage-0.6B`); conviene verificar el identificador correcto al integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdarshSingh7647/Eklav-0.6B-Reranker
- Versión Std-SFT: https://huggingface.co/AdarshSingh7647/Std-SFT-Passage-0.6B
- Código del proyecto Eklavya: https://github.com/AdarshSingh7647/Eklavya
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Referencia del formato Rank1: https://huggingface.co/jhu-clsp/rank1-7b
