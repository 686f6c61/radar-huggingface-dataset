# mohitkrconnect/heed-tasks-only-qwen3.5-0.8b

## Resumen

`heed-tasks-only-qwen3.5-0.8b` es un checkpoint de investigación publicado por el usuario mohitkrconnect, resultado de un ajuste fino completo del modelo base `Qwen/Qwen3.5-0.8B-Base`. Su única tarea es la extracción de tareas a partir de notas de voz: recibe un texto con el formato `Note: <texto>\nTasks:\n` y devuelve una lista JSON de cadenas, sin buckets, horas ni recordatorios. Forma parte del estudio Heed, que evaluó distintos modelos pequeños para una función de extracción de tareas dentro de una aplicación.

El modelo tiene 752.393.024 parámetros, 24 capas y una arquitectura `Qwen3_5ForCausalLM` con atención lineal híbrida Gated DeltaNet. Se entrenó sobre 4.221 notas con un conjunto de etiquetas antiguo y nunca fue evaluado con un juez automático, solo con solapamiento de palabras (F1). El autor lo publica explícitamente como un checkpoint que no llegó a producción: la aplicación adoptó finalmente `heed-tasks-qwen3-0.6b` por razones de soporte del conversor a LiteRT-LM, velocidad en CPU de móvil, tamaño y coste de entrenamiento.

Su relevancia es doble: por un lado, documenta con transparencia un caso de descarte técnico en el desarrollo de funciones de IA en aplicaciones móviles; por otro, sirve como referencia reproducible de ajuste fino de un modelo de menos de mil millones de parámetros para salida estructurada en dominios muy acotados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (texto), 24 capas, atención lineal híbrida Gated DeltaNet |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con max length 1.024; ventana nativa no especificada) |
| Tipos de cuantizacion | no disponible (el autor menciona un archivo int8 de 779 MB para el modelo, pero no se publica en este repositorio) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) para transformers |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 24 capas con atención lineal híbrida Gated DeltaNet, una variante que sustituye parte de la atención cuadrática por capas lineales recurrentes con compuertas. Requiere transformers con soporte de Qwen3.5 (se usó la versión 5.20.2); el entrenamiento empleó además `flash-linear-attention` 0.3.2 y `causal-conv1d` 1.7.0. Es un ajuste fino completo del base, no un adaptador LoRA: los 752 millones de parámetros son entrenables.

Los datos de entrenamiento son 4.221 notas, una por fila: 1.665 sintéticas de HeedSet generadas con Claude Opus, 1.109 notas simuladas al estilo de usuario, 781 notas planificadas generadas con ChatGPT, 480 volcados de ideas de Claude, 36 notas de plantilla curadas, 140 notas reales del autor y cinco amigos, y 10 mecanografiadas por el autor. Las etiquetas provienen de una fase anterior del estudio: 777 notas reetiquetadas con Sonnet más 1.265 notas de HeedSet etiquetadas con Sonnet, que conservan matices como "Maybe…" en aproximadamente una de cada cinco tareas con matiz. La receta fue learning rate 1e-5, AdamW, warm-up del 5 % más coseno, batch efectivo de 16 (4 × 4), 3 épocas (792 pasos), longitud máxima de 1.024, pérdida solo en los tokens de respuesta, autocast bf16 y semilla 0. Se entrenó en una RTX 4090 de 24 GB en 20,9 minutos con un pico de 15,6 GB.

## Capacidades

- Extracción de tareas de notas de voz o texto libre, devolviendo una lista JSON de cadenas con el esquema `{"tasks":["...","..."]}`.
- Salida estructurada estricta: en la validación de referencia, las 199 respuestas fueron JSON válido.
- Generación de texto causal estándar heredada del base, aunque el ajuste la especializa en la tarea de extracción.
- No soporta buckets, horas, recordatorios ni clasificación temporal: solo texto de tarea.
- No soporta tool calling ni function calling de forma nativa.
- No soporta razonamiento multi-paso ni modo de pensamiento explícito.
- Capacidad multilingüe limitada al inglés, único idioma declarado y presente en los datos.
- No dispone de visión ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Extracción de tareas en aplicaciones de notas de voz: el modelo convierte una transcripción en una lista JSON de tareas con decodificación greedy y sin plantilla de chat, lo que encaja en un pipeline móvil o de servidor ligero.
- Procesamiento por lotes de notas de reuniones: al ser un modelo de 752 millones de parámetros, se puede ejecutar en una sola GPU consumer para extraer tareas de cientos de notas en minutos, con un coste de cómputo bajo.
- Prototipado de asistentes de productividad: sirve como baseline reproducible para comparar estrategias de ajuste fino en tareas de información estructurada antes de invertir en modelos mayores.
- Investigación sobre salida estructurada en modelos pequeños: el checkpoint y su receta documentada permiten estudiar cómo se comporta un modelo de menos de mil millones de parámetros con pérdida calculada solo en los tokens de respuesta.
- Generación de datos de evaluación: sus respuestas sobre notas sintéticas pueden usarse para construir conjuntos de prueba de extracción de tareas, siempre que se validen manualmente.
- Filtrado previo en pipelines de agentes: puede actuar como primer extractor de tareas de bajo coste cuyas salidas se validen o enriquezcan después con un modelo mayor que añada fechas y prioridades.

## Benchmarks y rendimiento

Los resultados publicados son de solapamiento de palabras (F1) contra el conjunto de etiquetas antiguo, sobre 371 notas de validación. El "yardstick" son 199 de ellas: 59 notas reales más 140 de HeedSet. No hay puntuación de juez automático y las respuestas de test nunca se puntuaron.

| Metrica | Epoca 2 | Epoca 3 (este modelo) | Semilla 1, epoca 3 |
|---|---|---|---|
| F1 en yardstick | 90,7 | 91,6 | 91,1 |
| Listas exactas, yardstick | 71,4 % | 72,4 % | 69,3 % |
| F1 en notas reales (59) | 79,4 | 81,5 | 80,1 |
| Listas exactas, notas reales | 54,2 % | 55,9 % | 49,2 % |

En el yardstick de la época 3, la exhaustividad (recall) fue de 92,7 y la precisión de 90,5, con las 199 respuestas en JSON válido. El gemelo `heed-tasks-only-qwen3-0.6b` obtiene 91,2 en el mismo conjunto y 77,9 en notas reales. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,5 GB de pesos más overhead de activaciones y caché; cabe holgadamente en GPUs de 8 GB.
- VRAM en cuantización de 8 bits: alrededor de 0,8 GB de pesos, según el tamaño del archivo int8 mencionado (779 MB) para el modelo equivalente.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para entrenamiento o serving de alto throughput; cualquier GPU consumer con 8 GB o más para inferencia.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4070 y superiores; también en iGPU con suficiente memoria compartida, aunque con latencia mayor.
- Opciones de despliegue: transformers con soporte de Qwen3.5 (versión 5.20.2 o superior); el autor no documenta soporte verificado en vLLM, llama.cpp, Ollama ni TGI. La conversión a LiteRT-LM no se publicó porque nunca se comprobó la paridad ni se ejecutó en un teléfono.
- Latencia y throughput: no disponibles. El autor señala que las capas de atención lineal resultaron lentas en una prueba previa en CPU de móvil, motivo por el que el modelo no se envió.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 yardstick | F1 notas reales | Licencia | Estado |
|---|---|---|---|---|---|---|
| heed-tasks-only-qwen3.5-0.8b (este) | 752 M | no disponible | 91,6 | 81,5 | Apache-2.0 | Checkpoint de investigación |
| heed-tasks-only-qwen3-0.6b | no disponible | no disponible | 91,2 | 77,9 | no disponible | Modelo en producción de la app |
| heed-tasks-qwen3-0.6b | no disponible | no disponible | no disponible | no disponible | no disponible | Modelo actual de la línea Heed |
| Qwen/Qwen3.5-0.8B-Base | 0,8 B (aprox.) | no disponible | no disponible | no disponible | no disponible | Modelo base sin ajustar |

## Limitaciones y advertencias

- Solo escribe tareas: no genera buckets, horas ni recordatorios, por lo que no sirve para planificación temporal.
- Se entrenó con etiquetas antiguas que conservan matices como "Maybe…" en aproximadamente una de cada cinco tareas con matiz; un reetiquetado posterior eliminó ese comportamiento en la línea de 0,6 B.
- No vio notas largas durante el entrenamiento ni formas sin mayúsculas o sin puntuación, lo que puede degradar su rendimiento con entradas de ese estilo.
- Nunca fue evaluado con un juez automático; las métricas de F1 por solapamiento de palabras no miden corrección semántica.
- El autor advierte explícitamente de que no se comparen sus números con los de modelos más recientes del estudio.
- Riesgo de alucinación: puede inventar tareas no presentes en la nota o fusionar varias en una, especialmente con entradas ambiguas o muy largas.
- Sesgos: los datos incluyen notas sintéticas generadas por Claude, ChatGPT y Gemini, además de notas de un círculo reducido de personas, lo que puede introducir sesgos de estilo y de contenido.
- Restricciones de licencia: el modelo es Apache-2.0, pero las etiquetas y la mayoría de las notas de entrenamiento se produjeron con modelos de Claude, Gemini y GPT; deben revisarse los términos de esos proveedores antes de usarlo para construir un modelo de propósito general competidor.
- Para producción conviene usar `heed-tasks-qwen3-0.6b`, que incorpora las mejoras posteriores del estudio y tiene un archivo int8 verificado en la aplicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohitkrconnect/heed-tasks-only-qwen3.5-0.8b
- Modelo de producción de la línea: https://huggingface.co/mohitkrconnect/heed-tasks-qwen3-0.6b
- Gemelo de 0,6 B de esta ronda: https://huggingface.co/mohitkrconnect/heed-tasks-only-qwen3-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Dataset del estudio: https://huggingface.co/datasets/mohitkrconnect/heed-voice-notes-to-tasks
- Repositorio de flash-linear-attention: no disponible en la información proporcionada
- Repositorio de causal-conv1d: no disponible en la información proporcionada
