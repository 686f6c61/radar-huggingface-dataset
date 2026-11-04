# mohitkrconnect/heed-full-output-lines-qwen3-0.6b

## Resumen

`heed-full-output-lines-qwen3-0.6b` es un checkpoint de investigación publicado por el desarrollador independiente mohitkrconnect como resultado negativo de un experimento controlado (EXP-050) dentro del proyecto Heed, una aplicación de extracción de tareas a partir de notas de voz orientada a ejecución en dispositivo (Android). El modelo es un fine-tune completo de `Qwen/Qwen3-0.6B-Base` (596.049.920 parámetros) entrenado para convertir una nota de texto libre en una lista de tareas estructuradas, usando un formato de una línea separada por pipes por tarea en lugar de JSON.

El objetivo del experimento era determinar si un formato de línea compacta (aproximadamente un 30% más corto que JSON, lo que reduce el coste de decodificación en CPU de teléfono) podía sustituir a JSON sin pérdida significativa de calidad. El resultado fue negativo: el formato de líneas obtuvo un F1 conjunto de 69,4 frente a 71,5 del gemelo entrenado con JSON bajo receta idéntica, una diferencia de 2,04 puntos que superó el margen predefinido de 1 punto y la predicción del autor (P50.2, dentro de 2 puntos) por 0,04. Por ello el proyecto mantuvo JSON y este checkpoint se publica únicamente como evidencia reproducible.

No es el modelo de producción de Heed (ese es `heed-tasks-qwen3-0.6b`) y no debe evaluarse como tal: las métricas son solapamiento de palabras contra etiquetas de Claude Sonnet 5.5 sobre 451 notas de validación, no juicio ciego, y el conjunto de test sellado (617 notas) nunca se ejecutó sobre este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), fine-tune completo del base |
| Parametros totales | 596.049.920 (tras eliminar el `lm_head` duplicado y atado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens de longitud máxima durante el entrenamiento; contexto nativo del base Qwen3-0.6B no especificado en la informacion disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el autor no documenta cuantizaciones) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), librería transformers; tamano del repo 1,2 GB |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-0.6B-Base`, un transformer decoder-only de la familia Qwen3, y se somete a un fine-tune completo (no LoRA) de los 596.049.920 parámetros. El prompt es texto crudo, sin plantilla de chat ni system prompt, y termina con un salto de línea tras `Tasks:`. La respuesta es una tarea por línea con campos `texto|bucket|palabras de tiempo|r`, donde `r` marca recordatorio y los campos vacíos finales se omiten; una nota sin tareas se representa con un único `-`. La pérdida se calcula solo sobre los tokens de respuesta.

El conjunto de entrenamiento consta de 6.914 notas de una fila cada una (451 de validación; las 617 del test sellado nunca se subieron a la máquina de entrenamiento), en inglés y sin variantes de puntuación. La composición incluye 1.108 notas simuladas de estilo autor, 1.662 notas HeedSet sintéticas, 781 notas planificadas y generadas con ChatGPT, 480 volcados de Claude (220 Opus, 260 Sonnet), 36 notas de plantilla curadas, 140 notas reales del autor y cinco amigos, 10 notas tecleadas por el autor y 2.697 notas sintéticas largas de Sonnet 5.5. Las etiquetas (bucket, palabras de tiempo y flag de recordatorio) provienen de Claude Sonnet 5.5 con un prompt de etiquetado congelado y temperatura 0.

La receta es idéntica a la del gemelo JSON para aislar la variable de formato: lr 1e-5, AdamW con weight decay 0, warm-up del 5% seguido de coseno, gradient clipping 1.0, batch 8 × 2 = 16, longitud máxima 1.024, autocast bf16 y gradient checkpointing, semilla 0. Se ejecutaron 1.732 pasos en 16,56 minutos sobre una RTX 4090 con un pico de 16,4 GB, alcanzando la mejor pérdida de validación de 0,4131 en el paso 866; se publica la época 4 de 4 (la época 3 puntuó 69,0). El coste estimado de GPU fue de aproximadamente 0,25 dólares a 0,90 dólares por hora (estimación derivada, no factura).

## Capacidades

- Extracción de tareas estructuradas a partir de texto libre de notas, en un único paso de generación.
- Clasificación en seis buckets fijos: `tasks` (General), `buy` (Buy), `watch` (Watch), `ideas` (Ideas), `work` (Work) y `journal` (Journal).
- Extracción de palabras de tiempo relativas o absolutas presentes en la nota (campo de tiempo).
- Detección de necesidad de recordatorio mediante el flag `r`.
- Salida en formato de línea compacta separada por pipes, con supresión de campos vacíos finales.
- Generación determinista con decodificación greedy (la configuración evaluada).
- Sin soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Multilingüe: no; entrenado y evaluado únicamente en inglés.

## Casos de uso

- Extracción de tareas en aplicaciones de notas de voz en Android: el modelo convierte una transcripción en una lista de tareas con bucket, tiempo y recordatorio en una sola pasada, con salidas de 45 a 89 tokens de media según longitud de la nota, lo que reduce el tiempo de decodificación en CPU frente a JSON (65 a 159 tokens).
- Reproducción de experimentos de formato de salida: sirve como referencia controlada para comparar formatos compactos frente a JSON bajo receta idéntica, mismo dato, misma semilla y mismas épocas.
- Investigación sobre eficiencia en el borde: permite medir el compromiso entre longitud de salida y calidad en modelos de 0,6B desplegados en dispositivo, con una penalización cuantificada de 2,04 puntos de F1 conjunto.
- Clasificación y enrutado de notas personales: asignación de una nota a uno de los seis buckets para su organización automática en una aplicación de productividad.
- Detección de recordatorios en texto libre: identificación de tareas que requieren aviso y extracción de la expresión temporal asociada para agendar.
- Base para ablaciones de etiquetado: al estar entrenado con etiquetas de un único prompt congelado de Sonnet 5.5, sirve para estudiar la sensibilidad del estudiante al ruido y al estilo del etiquetador.
- Prototipado rápido de extracción estructurada en inglés con licencia Apache 2.0 y pesos de 1,2 GB, sin necesidad de infraestructura de GPU para inferencia en bf16 o cuantizada.

## Benchmarks y rendimiento

Resultados sobre las 451 notas de validación, con solapamiento de palabras contra las etiquetas de Claude Sonnet 5.5 (no juicio ciego, no comparables con las cifras del modelo de producción):

| 451 notas de validacion | Lines (este modelo) | JSON, misma receta |
|---|---|---|
| Joint F1 | 69,4 | 71,5 |
| Task F1 | 84,7 | 86,2 |
| Bucket, sobre tareas emparejadas | 91,9 | 92,3 |
| Reminder F1 | 90,7 | 91,2 |
| Time F1 | 93,0 | 93,8 |
| Notas totalmente correctas | 44,1% | 45,9% |
| Notas reales (59), joint F1 | 59,6 | 65,2 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales en la informacion disponible. El checkpoint nunca fue evaluado con juez ciego ni ejecutado sobre el test sellado.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB de pesos más overhead de activaciones y caché KV; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- Entrenamiento documentado: 1 × RTX 4090 con pico de 16,4 GB (batch 16, longitud 1.024, gradient checkpointing, bf16).
- GPU recomendadas: RTX 4090 para reproducir el entrenamiento; para inferencia basta una RTX 3060, RTX 4060 o incluso CPU de teléfono, que es el objetivo de diseño.
- Cabe en GPU consumer: sí, en cualquier modelo con 4 GB o más de VRAM; también en CPU.
- Opciones de despliegue: transformers (código de ejemplo en la model card); vLLM, llama.cpp, Ollama y TGI no están documentados para este checkpoint en la informacion disponible, aunque al ser un transformer Qwen3 estándar en safetensors son vías plausibles.
- Latencia y throughput: no disponibles como medidas publicadas; el autor solo reporta longitudes medias de salida (45 y 89 tokens para notas antiguas y largas) como proxy del coste de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Joint F1 (val, 451) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| heed-full-output-lines-qwen3-0.6b (este) | 596.049.920 | 1.024 (entrenamiento) | 69,4 | Apache 2.0 | HuggingFace |
| heed-full-output-json-4ep-qwen3-0.6b | 596.049.920 (mismo base) | 1.024 (entrenamiento) | 71,5 | Apache 2.0 | HuggingFace |
| heed-tasks-qwen3-0.6b (modelo de produccion) | no disponible en la informacion proporcionada | no disponible | no comparable (evaluado con juez ciego) | no disponible en la informacion proporcionada | HuggingFace |
| Qwen/Qwen3-0.6B-Base | 596.049.920 (aproximado, base) | no disponible en la informacion proporcionada | no disponible (no entrenado para la tarea) | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- Resultado negativo documentado: el formato de líneas pierde 2,04 puntos de F1 conjunto frente a JSON y no supera el margen de 1 punto fijado antes del experimento; el proyecto lo descartó para producción.
- No es el modelo de la aplicación Heed; usarlo como sustituto del modelo de producción no está respaldado por ninguna evaluación.
- Métricas no comparables: son solapamiento de palabras contra etiquetas de Sonnet 5.5, no juicio ciego, y el checkpoint nunca se ejecutó sobre el test sellado de 617 notas.
- Degradación en notas reales: el F1 conjunto cae a 59,6 en las 59 notas reales frente a 65,2 del gemelo JSON, lo que sugiere peor generalización fuera del dominio sintético.
- Sesgo de etiquetador: las etiquetas de bucket, tiempo y recordatorio provienen de un único prompt congelado de Claude Sonnet 5.5 a temperatura 0, por lo que el modelo hereda sus criterios y errores sistemáticos.
- Dominio estrecho: solo extracción de tareas en inglés; no es un modelo de propósito general y no debe usarse para generación abierta, código, matemáticas o razonamiento.
- Idioma: únicamente inglés; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación: puede inventar tareas, buckets o expresiones temporales no presentes en la nota; el autor no publica tasas de falsos positivos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen3-0.6B-Base conviene revisar los términos del modelo base.
- Producción: sin cuantizaciones publicadas ni pruebas de latencia en dispositivo; el formato de salida requiere un parser propio tolerante a líneas malformadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohitkrconnect/heed-full-output-lines-qwen3-0.6b
- Gemelo JSON del experimento: https://huggingface.co/mohitkrconnect/heed-full-output-json-4ep-qwen3-0.6b
- Modelo de producción de Heed: https://huggingface.co/mohitkrconnect/heed-tasks-qwen3-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
