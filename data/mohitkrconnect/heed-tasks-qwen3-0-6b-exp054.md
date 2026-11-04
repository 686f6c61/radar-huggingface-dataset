# mohitkrconnect/heed-tasks-qwen3-0.6b-exp054

## Resumen

HEED-TASKS-QWEN3-0.6B-EXP054 es un ajuste fino completo del modelo base Qwen/Qwen3-0.6B-Base, desarrollado por el usuario mohitkrconnect para la aplicación Heed, una app de notas de voz. El modelo resuelve una tarea muy concreta: extraer tareas estructuradas en formato JSON a partir de transcripciones de notas de voz, devolviendo únicamente una lista de tareas con su texto y una categoría o "bucket" (`{"tasks":[{"t":"…","c":"…"}]}`). Su relevancia radica en que está diseñado para ejecución en dispositivo (on-device), concretamente en Android mediante LiteRT-LM, y en que se publica como referencia base de una iteración posterior con datos de entrenamiento dirigidos.

Arquitectura transformer derivada de Qwen3, con 751.632.384 parámetros totales según los pesos en safetensors (el nombre comercial indica 0.6B). El contexto de entrenamiento se fijó en 1.024 tokens, con la fila más larga de 543 tokens. Es un modelo monolingüe en inglés y se distribuye bajo licencia Apache-2.0.

La versión EXP-054 estuvo en producción en la app Heed hasta el 3 de noviembre de 2026 y se retiró al sustituirse por `heed-tasks-qwen3-0.6b`, que añade 1.696 notas de entrenamiento dirigidas. Este modelo se publica como línea base de esa comparación, junto con el fichero int8 que se ejecutó realmente en el teléfono.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3) |
| Parametros totales | 751.632.384 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (longitud máxima de entrenamiento; la fila más larga fue de 543 tokens) |
| Tipos de cuantizacion | bf16 (safetensors) e int8 (fichero LiteRT-LM de 614.458.976 bytes) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) y `.litertlm` (int8 para LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B-Base y se somete a un ajuste fino completo (full fine-tune), no a LoRA ni a adaptadores. La receta emplea learning rate 1e-5, optimizador AdamW, 5% de warm-up seguido de decaimiento coseno, batch efectivo de 8 × 2, 3 épocas (2.595 pasos), longitud máxima de 1.024 tokens, cálculo de pérdida únicamente sobre los tokens de respuesta, autocast en bf16 y semilla 0. El entrenamiento completo se ejecutó en una única RTX 4090 de 24 GB en 25,8 minutos, con un coste estimado de unos 1,40 dólares de GPU.

El conjunto de datos consta de 6.914 notas duplicadas en dos formas (tal cual y en minúsculas sin puntuación), lo que da 13.828 filas. Incluye 4.217 notas antiguas (HeedSet sintético, notas planificadas por el autor, simulaciones, "brain dumps" generados con Claude y 150 notas reales del autor y cinco amigos) más 2.697 "brain dumps" sintéticos largos. Todas las etiquetas las generó Claude Sonnet 5.5 bajo un prompt congelado; Sonnet reescribió 10.752 tareas para mantener la hora hablada dentro del texto de la tarea, rechazando cualquier reescritura que perdiera una palabra (las 53 que fallaron la comprobación se revisaron a mano). La innovación principal del experimento es doble: por un lado, se eliminaron los campos de recordatorio y hora separada, dejando solo tareas y bucket; por otro, se entrenó cada nota dos veces (forma escrita y forma en minúsculas sin puntuación) para reducir la degradación del modelo ante la salida típica del sistema de reconocimiento de voz.

## Capacidades

- Generación de texto estructurado en JSON con el esquema fijo `{"tasks":[{"t":"…","c":"…"}]}`.
- Extracción de tareas a partir de notas de voz transcritas, incluyendo la hora hablada dentro del texto de la tarea.
- Clasificación de cada tarea en un bucket o categoría (precisión de bucket del 94,3% en la prueba en teléfono).
- Robustez ante texto en minúsculas y sin puntuación, propio de las transcripciones ASR (caída de calidad de solo 0,2 puntos frente a la entrada escrita).
- Ejecución en dispositivo Android mediante LiteRT-LM con pesos int8.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito; es un modelo especializado de extracción de tareas.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Extracción de tareas en apps de notas de voz: el modelo recibe una transcripción y devuelve una lista JSON de tareas con su categoría, integrándose directamente en el flujo de la app Heed para crear elementos accionables sin intervención del usuario.
- Procesamiento on-device en Android: al ejecutarse con LiteRT-LM en int8 (614 MB), permite inferencia local en teléfonos de gama media como el OnePlus CPH2717 (Dimensity 8300) sin enviar audio ni transcripciones a la nube, lo que reduce latencia y preserva la privacidad.
- Clasificación automática de tareas por categoría: el bucket predicho (94,3% de precisión en la prueba real) sirve para enrutar tareas a listas, proyectos o etiquetas dentro de una aplicación de productividad.
- Normalización de entradas ASR: al haberse entrenado con texto en minúsculas y sin puntuación, el modelo es adecuado como etapa posterior a un sistema de reconocimiento de voz que produce transcripciones ruidosas.
- Generación de JSON fiable para pipelines: en la prueba en teléfono, todas las respuestas fueron JSON legible y sin tareas repetidas, lo que lo hace apto para alimentar sistemas posteriores que consumen el JSON de forma automática.
- Prototipado y evaluación de modelos pequeños especializados: al publicarse con curvas de entrenamiento, resultados de validación y revisión de errores, sirve como línea base reproducible para experimentos de ajuste fino con datos dirigidos en tareas de extracción estructurada.
- Filtrado y preprocesado de notas largas: aunque es más débil en notas largas y divagantes (solo el 26% de notas sin errores en el rango de 40-99 palabras), puede usarse en una primera pasada para segmentar notas extensas antes de un modelo mayor.

## Benchmarks y rendimiento

Validación con 451 notas, juez ciego Gemini 3.1 Pro, entrada plana:

| Metrica | Resultado |
|---|---|
| F1 juzgado (global) | 76,2 |
| F1 en notas reales (59) | 78,4 |
| F1 en notas de menos de 15 palabras | 87,1 |
| F1 en notas de 15-39 palabras | 78,2 |
| F1 en notas de 40-99 palabras | 72,6 |
| F1 en notas de 100+ palabras | 77,0 |
| Mejora frente a EXP-050 | +4,8 [+2,4, +7,4] |
| Claude Sonnet 5.5 (autor de las etiquetas) | 94,3 |
| GPT-5.4 como segundo juez (200 notas) | 72,5 (frente a 88,9 de Sonnet) |

Prueba en teléfono (OnePlus CPH2717, Dimensity 8300, int8, 109 notas):

| Metrica | Resultado |
|---|---|
| F1 conjunto por solapamiento de palabras, entrada plana | 75,3 |
| F1 conjunto por solapamiento de palabras, entrada escrita | 75,5 |
| Precisión de bucket | 94,3 |
| Horas habladas conservadas | 82,1% |
| Latencia mediana | 3,2 s por respuesta |
| Latencia p95 | 6,8 s |
| Respuestas JSON legibles | 100% |

Revisión de errores (EXP-055, 561 errores sobre 451 notas de validación):

| Tipo de error | Porcentaje |
|---|---|
| Tarea omitida | 22% |
| Bucket incorrecto | 19% |
| Tarea inventada | 18% |
| Reformulación deficiente | 15% |
| Hora perdida | 13% |
| División incorrecta | 8% |
| Fusión incorrecta | 5% |

No hay puntuación en conjunto sellado (sealed test) para este modelo; todas las cifras proceden de validación o de la prueba en teléfono.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,5 GB solo para pesos, más overhead de activaciones y KV cache; cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en int8: unos 0,6 GB para pesos.
- GPU recomendadas: RTX 4090 (usada para el entrenamiento), A100 o H100 para servir en producción con mayor throughput; cualquier GPU consumer con 4 GB o más puede ejecutar la inferencia en bf16.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Despliegue: transformers (pesos safetensors), LiteRT-LM (fichero int8 para Android), y potencialmente llama.cpp, Ollama o vLLM si se convierten los pesos, aunque no se documenta soporte oficial en la información disponible.
- Latencia y throughput: en el OnePlus CPH2717 con int8, mediana de 3,2 s y p95 de 6,8 s por respuesta; no se han publicado datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| heed-tasks-qwen3-0.6b-exp054 | 751.632.384 | 1.024 tokens | F1 76,2 en validación; F1 75,3 en teléfono | Apache-2.0 | HuggingFace (0 descargas) |
| heed-tasks-qwen3-0.6b | No disponible | No disponible | No disponible (incluye 1.696 notas dirigidas) | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-0.6B-Base | 0,6B (aproximado) | No disponible en la información | No disponible | Apache-2.0 | HuggingFace |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación de rendimiento no es posible.

## Limitaciones y advertencias

- No existe puntuación en conjunto sellado; todas las métricas provienen de validación o de la prueba en teléfono, lo que puede sobreestimar el rendimiento real.
- Es más débil en notas largas y divagantes: el porcentaje de notas sin ningún error cae del 80% en notas de menos de 15 palabras al 26% en el rango de 40-99 palabras.
- Los errores más frecuentes son tareas omitidas (22%), bucket incorrecto (19%) y tareas inventadas (18%), lo que implica riesgo de alucinación en la extracción.
- Solo soporta inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- El contexto de entrenamiento es de 1.024 tokens, insuficiente para notas muy largas sin segmentación previa.
- El modelo está especializado en un esquema JSON fijo; no es adecuado para generación de texto general ni para tareas fuera de la extracción de tareas.
- Aunque la licencia es Apache-2.0, las etiquetas y la mayoría de las notas de entrenamiento se generaron con modelos de Claude, Gemini y GPT; deben revisarse los términos de esos proveedores antes de usar el modelo para construir un modelo de propósito general competidor.
- El modelo se retiró de producción el 3 de noviembre de 2026 y se sustituyó por una versión posterior; se publica únicamente como línea base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohitkrconnect/heed-tasks-qwen3-0.6b-exp054
- Modelo sucesor: https://huggingface.co/mohitkrconnect/heed-tasks-qwen3-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Sección "How to use it" del modelo principal: https://huggingface.co/mohitkrconnect/heed-tasks-qwen3-0.6b#2-how-to-use-it
- Sección "Limitations and honest caveats" del modelo principal: https://huggingface.co/mohitkrconnect/heed-tasks-qwen3-0.6b#5-limitations-and-honest-caveats
