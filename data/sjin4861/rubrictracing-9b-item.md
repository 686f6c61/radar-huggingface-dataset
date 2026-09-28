# sjin4861/RubricTracing-9B-Item

## Resumen

RubricTracing-9B-Item es un modelo de trazado de conocimiento (*knowledge tracing*) especializado en predecir el rendimiento de un estudiante sobre una rúbrica concreta. A diferencia de los modelos de KT clásicos, que estiman una probabilidad de acierto binaria por ejercicio, este modelo opera a nivel de ítem: dado el historial de interacciones previas de un alumno y la rúbrica completa del siguiente problema, predice si el estudiante satisfará **todos** los criterios de esa rúbrica. Lo desarrolla el usuario sjin4861 y es un ajuste fino completo sobre Qwen3.5-9B.

El modelo resuelve un problema práctico de evaluación educativa: las plataformas suelen etiquetar cada interacción como correcta o incorrecta según la respuesta final, pero la calificación real se basa en el proceso escrito. Según la model card, la etiqueta derivada de la rúbrica discrepa del indicador correcto/incorrecto de la plataforma en el 24,5 % de las interacciones, lo que motiva un predictor alineado con la evaluación por criterios en lugar del resultado final.

Tiene 8.953.803.264 parámetros (aproximadamente 8,95 mil millones), se distribuye en formato safetensors bajo licencia Apache 2.0 y está entrenado exclusivamente en coreano, sobre matemáticas de primer curso de secundaria. La salida es un único objeto JSON con un booleano, lo que lo hace trivial de integrar en un *pipeline* de predicción. Su variante a nivel de criterio es RubricTracing-9B-Criterion. El repositorio ocupa 89,6 GB, muy por encima de lo esperable para 8,95 B de parámetros en bfloat16 (unos 18 GB), lo que probablemente refleja la inclusión de artefactos de entrenamiento o de varias particiones del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (tag `qwen3_5_text`); detalles internos no disponibles |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican cuantizaciones; pesos en bfloat16 (safetensors). No hay GGUF ni AWQ/GPTQ en el repositorio |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (*full fine-tuning*) de Qwen3.5-9B, un transformer decoder-only de la familia Qwen3.5 en su variante de texto. No se documentan en la informacion proporcionada detalles sobre la arquitectura interna de Qwen3.5-9B (número de capas, cabezas de atención, uso de atención lineal o decodificación especulativa), ni la longitud de contexto nativa. El ajuste se realizó con *learning rate* de 1e-5 con decaimiento coseno y un 3 % de calentamiento, sin *weight decay*, con recorte de gradiente en 1.0, acumulación de gradiente de 4, semilla 0 y cuatro épocas. La selección del checkpoint se hizo por la época con mayor Macro-F1 sobre respuestas generadas libremente en una muestra fija de 1.000 interacciones de validación.

La supervisión no es humana: la etiqueta a nivel de ítem (todos los criterios satisfechos) proviene del conjunto de rúbricas `22289-be26167af4e4`, producido por un *pipeline* Generador–Calificador–Auditor sobre Qwen3.5-27B, que redacta una rúbrica por problema y califica la solución escrita de cada estudiante contra ella. El historial del estudiante se renderiza como un historial completo de rúbricas: para cada problema pasado se incluyen el enunciado, sus criterios, el veredicto Apto/No apto por criterio junto con la justificación del calificador y el proceso de resolución escrito por el alumno; a continuación se presenta el problema objetivo con su solución de referencia y su rúbrica. Los *prompts* están en coreano y el *system prompt* usado en el entrenamiento se distribuye como `system_prompt.txt`.

## Capacidades

- Predicción a nivel de ítem en trazado de conocimiento: dado el historial de rúbricas de un estudiante y la rúbrica del siguiente problema, devuelve si el alumno cumplirá todos los criterios.
- Salida estructurada estricta: un único objeto JSON, por ejemplo `{"correct": false}`.
- Consumo de rúbricas detalladas: procesa enunciados, listas de criterios, veredictos Apto/No apto, justificaciones del calificador y resoluciones escritas del estudiante.
- Razonamiento sobre matemáticas de secundaria en el dominio específico del conjunto KT-PSP-25 (primer curso de secundaria coreana).
- Modo conversacional vía plantilla de chat (tag `conversational`), con `enable_thinking=False` obligatorio, ya que el modelo se entrenó y evaluó sin bloque de razonamiento.
- Multilingüe: solo coreano. No hay evidencia de capacidades en castellano u otros idiomas.
- No soporta *tool calling*, *function calling*, uso como agente ni razonamiento multi-paso autónomo; no se documenta ninguna capacidad de visión, audio ni *thinking mode*.

## Casos de uso

- Predicción de desempeño en plataformas de aprendizaje adaptativo: el sistema puede anticipar si un alumno superará todos los criterios de un problema antes de que lo intente, y usar esa señal para recomendar el siguiente ejercicio o un repaso previo. Es adecuado porque su salida booleana es directamente accionable y consume la rúbrica real del problema.
- Investigación en *knowledge tracing*: sirve como línea base fuerte (Macro-F1 de 0,637 ± 0,009 frente a 0,586 ± 0,007 de qDKT) para comparar modelos neuronales de KT con representaciones ricas basadas en rúbricas.
- Detección temprana de alumnos en riesgo: al predecir el fallo de todos los criterios en problemas concretos, permite priorizar intervenciones sobre estudiantes con riesgo alto en los próximos ítems del temario.
- Evaluación de la calidad de un banco de rúbricas: si el modelo predice sistemáticamente mal sobre determinados problemas, es señal de que la rúbrica está mal formulada o es ambigua, lo que ayuda a depurar el banco.
- Comparación entre calificación por respuesta final y calificación por proceso: dado que la etiqueta derivada de la rúbrica discrepa del indicador de la plataforma en el 24,5 % de las interacciones, el modelo permite cuantificar ese desajuste en un despliegue real.
- Análisis de trayectorias de aprendizaje a nivel de criterio: combinando este modelo con RubricTracing-9B-Criterion se puede descomponer la predicción de fallo por criterio concreto, útil para informes docentes granularizados.
- Simulación de estudiantes para probar entornos educativos: las predicciones del modelo pueden alimentar simuladores que generan respuestas plausibles de alumnos en un dominio de matemáticas coreano.
- Selección de contenido en sistemas de tutoría: el modelo permite ordenar candidatos de problemas según la probabilidad estimada de éxito completo para cada alumno, ajustando la dificultad de la secuencia.

## Benchmarks y rendimiento

Resultados sobre la cohorte de prueba reservada: 268 estudiantes y 4.165 interacciones objetivo. «Pass» denota que se satisfacen todos los criterios. Las filas de KT neuronal y de ajuste fino son media ± desviación típica sobre cinco entrenamientos.

| Modelo | Macro-F1 | Acc | Pass P | Pass R | Fail P | Fail R |
|---|---|---|---|---|---|---|
| Always-pass | 0,399 | 0,664 | 0,664 | 1,000 | 0,000 | 0,000 |
| Qwen3.5-9B, zero-shot | 0,448 | 0,458 | 0,806 | 0,243 | 0,371 | 0,884 |
| qDKT | 0,586 ± 0,007 | 0,677 ± 0,004 | 0,712 ± 0,004 | 0,862 ± 0,019 | 0,534 ± 0,015 | 0,311 ± 0,028 |
| RubricTracing-9B-Item | 0,637 ± 0,009 | 0,682 ± 0,019 | 0,757 ± 0,019 | 0,772 ± 0,078 | 0,538 ± 0,044 | 0,505 ± 0,101 |

El modelo supera a la línea base trivial (*always-pass*) en Macro-F1 en 0,238 puntos y a qDKT en 0,051 puntos, y mejora a Qwen3.5-9B sin ajustar en 0,189 puntos de Macro-F1. La aceleración más notable frente a qDKT está en la clase Fail (recall de 0,505 frente a 0,311). No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 18 GB solo para pesos, más 2-4 GB de activaciones y caché KV, en torno a 20-24 GB en total. La longitud de contexto no está documentada, por lo que el coste de la caché KV no puede acotarse.
- VRAM estimada en 8 bits: aproximadamente 9-10 GB para pesos; en 4 bits, unos 5-6 GB, si bien el autor no publica versiones cuantizadas y habría que generarlas.
- GPU recomendadas: A100 40 GB, H100 80 GB, L40S 48 GB para bfloat16 sin cuantizar con margen; RTX 4090 24 GB puede alojar el modelo en bfloat16 al límite, con contexto corto.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en bfloat16; en GPUs de 12-16 GB (RTX 4080, RTX 4070 Ti, RTX 3080) requiere cuantización a 8 o 4 bits.
- Opciones de despliegue: `transformers` es la vía documentada (con `device_map="auto"`). vLLM y TGI son compatibles siempre que se añada un parser para la salida JSON, y llama.cpp u Ollama requerirían una conversión a GGUF que no está publicada.
- Detalles de generación relevantes: `max_new_tokens=32`, decodificación greedy (`do_sample=False`) y `eos_token_id=tok.eos_token_id` (`<|im_end|>`). Sin ese token de parada, la generación puede continuar más allá de la respuesta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Macro-F1 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RubricTracing-9B-Item | 8,95 B | Ajuste fino completo de Qwen3.5-9B, predicción a nivel de ítem | 0,637 ± 0,009 | Apache 2.0 | HuggingFace, 5 particiones (fold0-fold4, `main` = fold-0) |
| RubricTracing-9B-Criterion | 8,95 B (mismo base) | Ajuste fino completo de Qwen3.5-9B, predicción a nivel de criterio | No disponible en la información proporcionada | Apache 2.0 | HuggingFace (sjin4861/RubricTracing-9B-Criterion) |
| Qwen3.5-9B (zero-shot) | 8,95 B | Modelo base sin ajustar, prompt con historial y rúbrica | 0,448 | No disponible | HuggingFace (Qwen/Qwen3.5-9B) |
| qDKT | No disponible | Modelo neuronal clásico de knowledge tracing (DKT con atención/deep KT) | 0,586 ± 0,007 | No disponible | No disponible |

No se dispone de comparación con otros modelos ajustados a rúbricas o con modelos de KT de la misma familia publicados por terceros.

## Limitaciones y advertencias

- Dominio restringido: entrenado y evaluado en un único conjunto de datos, matemáticas de primer curso de secundaria en coreano. No hay evidencia de generalización a otras asignaturas, niveles educativos o idiomas.
- Supervisión generada por modelo, no por humanos: las etiquetas provienen de un *pipeline* Generador–Calificador–Auditor sobre Qwen3.5-27B, por lo que hereda los sesgos y errores de ese proceso.
- Orden de interacciones no recuperable: KT-PSP-25 no conserva el orden de las interacciones, así que el historial se trata como un conjunto. Tal como advierte el autor, esto no constituye ninguna afirmación sobre modelado de secuencias.
- No validado para calificación: el modelo pronostica resultados con fines de investigación en trazado de conocimiento y no está validado para calificar ni para tomar decisiones de alto impacto sobre estudiantes individuales.
- Riesgo de alucinación y de formato: aunque la tarea es de clasificación binaria, la salida es texto generado; sin el token de parada correcto o sin `enable_thinking=False` la generación puede desviarse del JSON esperado. Conviene validar y parsear la salida con tolerancia a fallos.
- Dependencia del *system prompt*: se debe usar el `system_prompt.txt` incluido y el renderizador de historial de rúbricas del artículo; otros formatos de entrada degradan el rendimiento.
- Sesgo de clase: el modelo tiene una precisión de Fail baja (0,538 ± 0,044) y una desviación típica alta en el recall de Fail (0,505 ± 0,101), lo que indica predicciones inestables al etiquetar fallos.
- Repositorio pesado: 89,6 GB frente a los aproximadamente 18 GB de pesos en bfloat16, lo que complica la descarga y el almacenamiento en entornos con espacio limitado.
- Licencia Apache 2.0: permite uso comercial, pero la licencia y los términos del modelo base Qwen3.5-9B deben verificarse por separado antes de un despliegue en producción.
- Reproducibilidad limitada a las cinco particiones publicadas: `main` es solo el modelo de la partición 0; para reproducir la media de la tabla hay que evaluar las ramas `fold0` a `fold4`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sjin4861/RubricTracing-9B-Item
- Modelo a nivel de criterio: https://huggingface.co/sjin4861/RubricTracing-9B-Criterion
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Conjunto de datos KT-PSP-25: https://huggingface.co/datasets/jungypark/KT-PSP-25
- *System prompt* incluido en el repositorio: `system_prompt.txt` (https://huggingface.co/sjin4861/RubricTracing-9B-Item/blob/main/system_prompt.txt)
- Artículo con el código del renderizador de historial de rúbricas: referenciado en la model card, enlace no disponible
- Repositorio de código: no disponible
- Demos: no disponible
