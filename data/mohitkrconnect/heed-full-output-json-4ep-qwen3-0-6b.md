# mohitkrconnect/heed-full-output-json-4ep-qwen3-0.6b

## Resumen

Heed full-output JSON 4ep Qwen3-0.6B (EXP-050) es un checkpoint de investigación de 596 millones de parámetros derivado de un ajuste fino completo sobre Qwen3-0.6B-Base. Lo desarrolla el autor independiente mohitkrconnect como parte del proyecto Heed, una aplicación de extracción de tareas a partir de notas de voz en Android. El modelo convierte texto libre en inglés en JSON estructurado con tareas, categoría, expresiones temporales habladas y marca de recordatorio.

El objetivo concreto del checkpoint es servir de referencia emparejada frente a una variante que emite el mismo contenido en formato de líneas separadas por barras verticales. Ambos entrenamientos comparten datos, semilla, número de épocas y receta, de modo que la única diferencia es el formato de salida. Esto permite atribuir la diferencia de rendimiento (71,5 de F1 conjunto frente a 69,4) al formato y no a otros factores.

Es relevante para quienes investigan modelos pequeños orientados a dispositivos, extracción de información estructurada y evaluación controlada de formatos de salida. No es el modelo de producción de la aplicación: el autor indica explícitamente que el modelo integrado en Heed es otro checkpoint distinto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino completo sobre Qwen3-0.6B-Base |
| Parametros totales | 596.049.920 (lm_head duplicado y atado eliminado antes de la subida) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el entrenamiento usó longitud máxima de 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B-Base, un transformer decoder-only de la familia Qwen3, y se somete a un ajuste fino completo de los 596.049.920 parámetros. La tarea es de generación condicionada por prompt en texto plano, sin plantilla de chat ni system prompt: el prompt enumera seis categorías (tasks, buy, watch, ideas, work, journal), incluye la nota bajo `Note:` y termina con `Tasks:` seguido de salto de línea. La respuesta esperada es JSON compacto terminado en EOS, con las claves `t` (texto de la tarea), `c` (categoría), `w` (palabras temporales habladas) y `r` (indicador de recordatorio), omitiendo `w` y `r` cuando están vacíos.

El conjunto de entrenamiento consta de 6.914 notas en inglés, una por fila, sin variantes de puntuación, y 451 notas de validación; las 617 notas del test sellado nunca se colocaron en la máquina de entrenamiento. Las etiquetas (categoría, palabras temporales y marca de recordatorio) proceden de Claude Sonnet 5.5 bajo un prompt de etiquetado congelado y temperatura 0. La composición incluye 1.108 notas simuladas estilo autor, 1.662 notas HeedSet sintéticas, 781 notas planificadas y generadas con ChatGPT, 480 volcados de ideas de Claude, 36 notas de plantilla curadas, 140 notas reales del autor y cinco amigos, 10 notas tecleadas por el autor y 2.697 notas sintéticas largas. La receta usa lr 1e-5, AdamW sin weight decay, 5% de warm-up seguido de coseno, clipping de gradiente 1.0, batch 8 × 2 = 16, longitud máxima 1.024, pérdida solo sobre tokens de respuesta, autocast bf16 y gradient checkpointing, con semilla 0. Se ejecutaron 1.732 pasos en 18,2 minutos sobre una RTX 4090, con pico de 17,6 GB y mejor pérdida de validación de 0,2704 en el paso 866. El autor advierte que la cuarta época puntuó mejor aunque la pérdida de validación ya había empeorado tras la época 2 (de 0,270 a 0,400), por lo que cuatro épocas no demuestran convergencia.

## Capacidades

- Generación de JSON estructurado a partir de texto libre en inglés, con esquema fijo de tareas, categoría, tiempo y recordatorio.
- Extracción de tareas implícitas en notas desordenadas (brain dumps) y en notas largas.
- Clasificación en seis categorías predefinidas: tasks, buy, watch, ideas, work y journal.
- Detección de expresiones temporales en lenguaje hablado (por ejemplo, "at 5") y de marcas de recordatorio.
- Manejo del caso vacío mediante `{"tasks":[]}` cuando la nota no contiene acciones.
- Inferencia determinista con decodificación voraz, tal como se evaluó.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito según la información disponible.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Extracción de tareas desde notas de voz en Android: el modelo recibe la transcripción y devuelve JSON compacto listo para insertar en una base de datos local, gracias a su tamaño de 0,6B y su formato de salida fijo.
- Referencia de investigación para comparar formatos de salida: al compartir receta con la variante de líneas, permite aislar el efecto del formato JSON frente a líneas separadas por barras en tareas de extracción estructurada.
- Clasificación automática de notas personales: asigna cada tarea a una de las seis categorías con una precisión de bucket del 92,3 sobre tareas emparejadas en validación.
- Detección de recordatorios en texto libre: el campo `r` permite marcar tareas que deben generar una notificación, con un F1 de recordatorio del 91,2 en validación.
- Normalización de expresiones temporales habladas: extrae el campo `w` ("at 5", etc.) para que un sistema posterior lo convierta en una fecha concreta, con un F1 de tiempo del 93,8.
- Prototipado de asistentes de productividad sin conexión: al ser un modelo de 0,6B en bf16, puede ejecutarse en hardware modesto para pruebas de concepto de pipelines de captura de tareas.
- Evaluación de destilación desde modelos grandes: sirve como caso de estudio de ajuste fino de un modelo pequeño sobre etiquetas generadas por Claude Sonnet 5.5 con un prompt congelado.

## Benchmarks y rendimiento

Resultados del autor sobre las 451 notas de validación, medidos como solapamiento de palabras frente a las etiquetas de Claude Sonnet 5.5. La métrica "joint F1" exige coincidencia de texto y acierto simultáneo de categoría, recordatorio y tiempo. El autor advierte que no son comparables con las cifras de juez ciego del modelo de aplicación.

| Metrica (451 notas de validacion) | Este modelo (JSON, 4 epocas) | Variante lines (misma receta) |
|---|---|---|
| Joint F1 | 71,5 | 69,4 |
| Task F1 | 86,2 | 84,7 |
| Bucket (sobre tareas emparejadas) | 92,3 | 91,9 |
| Reminder F1 | 91,2 | 90,7 |
| Time F1 | 93,8 | 93,0 |
| Notas completamente correctas | 45,9% | 44,1% |
| Notas reales (59), joint F1 | 65,2 | no disponible |
| Notas largas (80), joint F1 | 68,7 | no disponible |
| Respuestas legibles | 100% | 99,8% |

La diferencia de 2,04 puntos de joint F1 supera el margen de 1 punto fijado en el diseño (decisión D120). El autor señala además que el modelo de 8 épocas con semilla 1 usado en la prueba de teléfono obtiene 71,4 de joint F1, equivalente dentro del ruido, con aproximadamente el doble de tiempo de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: alrededor de 1,2 GB solo para pesos, más memoria para el contexto y las activaciones; el repositorio ocupa 1,2 GB.
- Entrenamiento de referencia: 1 × RTX 4090 con un pico de 17,6 GB y 18,2 minutos para 1.732 pasos.
- Cabe en GPU de consumo: cualquier GPU con 4 GB o más de VRAM debería acomodar la inferencia en bf16 o cuantizada, aunque el autor no publica cifras de latencia ni throughput.
- Despliegue: compatible con transformers y text-generation-inference según las etiquetas del repositorio; no se confirma soporte de llama.cpp, Ollama, vLLM ni GGUF en la información disponible.
- Orientado a on-device (etiqueta android), aunque no se especifican requisitos de memoria en dispositivo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Joint F1 (validacion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| heed-full-output-json-4ep-qwen3-0.6b | 596.049.920 | no disponible (entreno a 1.024) | 71,5 | Apache 2.0 | HuggingFace |
| heed-full-output-lines-qwen3-0.6b | no disponible (misma base) | no disponible | 69,4 | no disponible | HuggingFace |
| heed-full-output-json-qwen3-0.6b (8 epocas, semilla 1) | no disponible (misma base) | no disponible | 71,4 | no disponible | HuggingFace |
| heed-tasks-qwen3-0.6b (modelo de aplicacion) | no disponible (misma base) | no disponible | no comparable (evaluado con juez ciego) | no disponible | HuggingFace |

No se dispone de comparación con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no el modelo de producción de Heed; el autor recomienda usar heed-tasks-qwen3-0.6b para la aplicación.
- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- El 45,9% de las notas de validación se resuelven de forma completamente correcta; el resto contiene al menos un error de texto, categoría, tiempo o recordatorio.
- El rendimiento cae en notas reales (joint F1 de 65,2) y en notas largas (68,7) frente a la media global de 71,5.
- Las etiquetas de entrenamiento y evaluación provienen de Claude Sonnet 5.5, por lo que el modelo hereda los sesgos y criterios de ese etiquetador.
- La pérdida de validación empeoró tras la época 2 mientras el joint F1 mejoró en la época 4; el autor advierte que el schedule coseno favorece la última época y que cuatro épocas no demuestran convergencia.
- Las métricas son de solapamiento de palabras y no comparables con evaluaciones por juez ciego.
- No se ha ejecutado sobre el test sellado de 617 notas.
- No hay datos publicados sobre sesgos demográficos, alucinación fuera del esquema JSON ni robustez ante prompts malformados.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo no está validado en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohitkrconnect/heed-full-output-json-4ep-qwen3-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Variante de líneas: https://huggingface.co/mohitkrconnect/heed-full-output-lines-qwen3-0.6b
- Modelo JSON de 8 épocas, semilla 1: https://huggingface.co/mohitkrconnect/heed-full-output-json-qwen3-0.6b
- Modelo de aplicación Heed: https://huggingface.co/mohitkrconnect/heed-tasks-qwen3-0.6b
