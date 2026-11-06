# mohitkrconnect/heed-tasks-qwen3-0.6b-seed0

## Resumen

`heed-tasks-qwen3-0.6b-seed0` es un ajuste fino completo de `Qwen/Qwen3-0.6B-Base` desarrollado por el usuario de Hugging Face `mohitkrconnect` para una tarea muy concreta: extraer tareas estructuradas en JSON a partir de notas de voz. Forma parte del proyecto Heed, una aplicación que convierte dictados hablados en listas de tareas con su "bucket" o categoría asociada. Este checkpoint concreto es la segunda semilla (seed 0) de la misma receta que el modelo principal de la app (seed 1), y se publica únicamente para hacer visible la variabilidad entre ejecuciones de un mismo entrenamiento.

El modelo tiene 751.632.384 parámetros reales según los pesos en safetensors (algo más que los 0,6B nominales del nombre), se distribuye en formato safetensors con licencia Apache-2.0 y está pensado para inferencia on-device. Su salida es un objeto JSON con la forma `{"tasks":[{"t":"…","c":"…"}]}`, generado con decodificación greedy y sin plantilla de chat. El contexto de entrenamiento se limita a 1.024 tokens, suficiente para notas de voz individuales.

La relevancia de esta ficha es doble: por un lado documenta un caso de uso práctico de modelos pequeños especializados (extracción estructurada en lugar de generación abierta); por otro, es un ejemplo metodológico poco habitual, ya que el autor publica dos semillas del mismo pipeline para cuantificar el ruido entre ejecuciones (1,5 a 1,9 puntos de diferencia según el estudio citado). No hay resultados en el conjunto de test sellado para esta semilla.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino completo del modelo base |
| Parámetros totales | 751.632.384 (según safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens de longitud máxima en entrenamiento; contexto nativo del base no especificado en la información disponible |
| Tipos de cuantización | no disponible (el repo solo publica safetensors en bf16/fp32; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (no LoRA) de `Qwen/Qwen3-0.6B-Base`, un transformer decoder-only de la familia Qwen3. El entrenamiento usó 8.610 notas de voz en dos formas cada una (texto tal cual se escribió y versión en minúsculas sin puntuación), lo que da 17.220 filas. Las etiquetas fueron generadas por Claude Sonnet 5.5. La receta: learning rate 1e-5, optimizador AdamW, 5% de warm-up seguido de decaimiento coseno, batch efectivo de 8 × 2, 3 épocas (3.231 pasos), longitud máxima de 1.024 tokens, pérdida calculada solo sobre los tokens de respuesta y autocast en bf16.

El entrenamiento se ejecutó en una única RTX 4090 de 24 GB en 32,96 minutos, con una mejor pérdida de validación de 0,341 tras la primera época. El autor publica el checkpoint de la época 3 porque puntúa mejor en la tarea aunque no sea el de menor pérdida de validación. El formato de entrada es un prompt plano con la lista de buckets, seguido de `Note: <texto>`, luego `Tasks:` y un salto de línea; la inferencia debe hacerse con decodificación greedy y sin plantilla de chat.

## Capacidades

- Extracción de tareas estructuradas: convierte una nota de voz en una lista JSON de tareas con texto (`t`) y bucket o categoría (`c`).
- Salida JSON estrictamente formateada: el 100% de las salidas en validación fueron JSON legible según la model card.
- Procesamiento de notas en dos registros: texto tal como se dictó (con mayúsculas y puntuación) y versión normalizada en minúsculas sin puntuación.
- Modelo pequeño orientado a inferencia on-device, con un tamaño que permite despliegue en dispositivos con recursos limitados.
- Idioma: únicamente inglés.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking". El modelo está especializado en una única tarea de extracción.

## Casos de uso

- Conversión de notas de voz en listas de tareas dentro de una app móvil: el modelo recibe la transcripción de un dictado y devuelve tareas con su categoría, lo que permite al usuario revisar y confirmar en lugar de reorganizar manualmente. Es el caso de uso original de Heed.
- Clasificación automática de tareas por "bucket": al emitir el campo `c` junto al texto, permite enrutar tareas a proyectos, contextos o etiquetas predefinidas sin una segunda pasada de un clasificador.
- Procesamiento por lotes de transcripciones: dado un conjunto de notas de voz ya transcritas, el modelo puede generar estructuras JSON para ingesta posterior en un sistema de gestión de tareas (Todoist, Things, bases de datos propias).
- Extracción estructurada en pipelines de bajo coste: con 0,75B parámetros y una latencia propia de un modelo pequeño, encaja en flujos donde llamar a un LLM grande por cada nota resulta caro o añade latencia.
- Prototipado y evaluación de recetas de ajuste fino: al publicarse dos semillas del mismo pipeline, sirve como referencia para estudiar la varianza entre ejecuciones en tareas de extracción estructurada.
- Inferencia local o en el borde: su tamaño permite ejecutarlo en dispositivos con recursos moderados, útil para escenarios de privacidad donde la nota de voz no debe salir del dispositivo (aunque la model card no documenta conversión a móvil ni tiempos medidos en teléfono).

## Benchmarks y rendimiento

Resultados en las 451 notas de validación, con juez ciego Gemini 3.1 Pro y entrada en forma plana (similar a habla). Esta semilla no se evaluó en el conjunto de test sellado.

| Modelo | F1 juzgado | Precisión | Recall | Notas reales (59) | Ítems erróneos | Notas sin ningún error |
|---|---|---|---|---|---|---|
| Este modelo (seed 0) | 77,5 | 78,8 | 76,2 | 81,9 | 81 | 50,6% |
| Seed 1 (modelo de la app) | 79,4 | 81,2 | 77,6 | 86,2 | 76 | 51,9% |
| Receta anterior (EXP-054 seed 0) | 76,2 | no disponible | no disponible | 78,4 | 105 | 43,7% |
| Claude Sonnet 5.5 (fuente de etiquetas) | 94,3 | no disponible | no disponible | no disponible | no disponible | no disponible |

Solapamiento de palabras frente a la clave de Sonnet (validación, época 3):

| Métrica | Forma plana | Forma escrita |
|---|---|---|
| Conjunto (tarea y bucket correctos) | 76,5 | 79,2 |
| Tareas | 84,3 | no disponible |
| Bucket | 90,8 | no disponible |
| Notas completamente correctas | 49,4% | no disponible |
| JSON legible | 100% | no disponible |

Efecto de los datos dirigidos (media de semillas 0 y 1 frente a la receta anterior, intervalos de bootstrap pareado al 95%): notas reales +5,5 [+1,4, +10,3]; ítems erróneos de 99 a 78,5; global +1,4 [−0,2, +2,9], que no superó la regla primaria preregistrada y se registró como fallo. Específico de esta semilla: el recall de `ideas` cayó de 94 a 82, mientras que en la semilla 1 se mantuvo en 90.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 751,6M parámetros, en bf16 los pesos ocupan aproximadamente 1,5 GB; en fp32, unos 3 GB. A ello hay que sumar la memoria de activaciones y del KV cache para secuencias de hasta 1.024 tokens.
- GPU recomendadas: no documentadas. El entrenamiento se realizó en una RTX 4090 de 24 GB, pero eso no implica que la inferencia requiera esa GPU.
- GPU de consumo: por tamaño, el modelo debería caber en GPUs de consumo con suficiente VRAM para pesos y contexto, aunque el autor no publica mediciones de inferencia.
- Opciones de despliegue: la model card solo cita `transformers` y la etiqueta `text-generation-inference`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI más allá de la etiqueta. La inferencia debe hacerse con decodificación greedy y sin plantilla de chat.
- Latencia y throughput: no medidos. La model card indica explícitamente que no se midieron tiempos en teléfono ni conversión a móvil; asume que se comportará igual que el modelo de la app por compartir arquitectura y tamaño, pero no lo verificó.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (heed-tasks-qwen3-0.6b-seed0) | 751,6M | 1.024 tokens en entrenamiento | Extracción de tareas JSON | Apache-2.0 | Hugging Face |
| heed-tasks-qwen3-0.6b (seed 1) | mismo tamaño (misma receta) | 1.024 tokens en entrenamiento | Extracción de tareas JSON | Apache-2.0 | Hugging Face |
| Receta anterior EXP-054 seed 0 | no disponible | no disponible | Extracción de tareas JSON | no disponible | Referenciado en la model card |
| Qwen/Qwen3-0.6B-Base | ~0,6B nominales | contexto nativo del base no especificado | Generación de texto general | Apache-2.0 | Hugging Face |

La comparación más directa es con la semilla 1 del mismo pipeline: misma arquitectura, mismos datos, mismo prompt y mismo hardware, solo cambia la semilla. La diferencia observada (77,5 frente a 79,4 de F1 juzgado) se describe en la model card como ruido entre semillas, no como una diferencia de método. Frente a la receta anterior, la ganancia global (+1,4) no alcanzó significación estadística según la regla preregistrada.

## Limitaciones y advertencias

- Esta semilla no se evaluó en el conjunto de test sellado; todas las cifras son de validación.
- No se midieron tiempos ni conversión a teléfono; el comportamiento on-device es una expectativa, no una medición.
- El modelo solo soporta inglés.
- La tarea es estrecha: extracción de tareas en un formato JSON fijo. No es un modelo de propósito general y no se documentan capacidades de razonamiento, código, matemáticas ni tool calling.
- Riesgo de alucinación y de ítems erróneos: en validación, el 49,4% de las notas quedaron completamente correctas en forma plana, con 81 ítems erróneos sobre 451 notas. Cualquier uso en producción debería incluir validación de la salida y posible revisión humana.
- El recall de la categoría `ideas` cayó de 94 a 82 en esta semilla, lo que sugiere sensibilidad de la receta a la semilla en categorías concretas.
- Las etiquetas de entrenamiento y la mayoría de las notas se generaron con modelos de Claude, Gemini y GPT; el autor recomienda revisar los términos de esos proveedores antes de usar el modelo para construir un modelo generalista competidor.
- Licencia Apache-2.0, igual que el modelo base, sin restricciones comerciales adicionales documentadas más allá de la advertencia anterior sobre los proveedores de las etiquetas.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación, no un modelo validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohitkrconnect/heed-tasks-qwen3-0.6b-seed0
- Modelo principal (seed 1, el de la app): https://huggingface.co/mohitkrconnect/heed-tasks-qwen3-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Sección de limitaciones del modelo principal: https://huggingface.co/mohitkrconnect/heed-tasks-qwen3-0.6b#5-limitations-and-honest-caveats
