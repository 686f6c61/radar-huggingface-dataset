# apertixai/cerno-27b-v1.1

## Resumen

Cerno 27B v1.1 es un modelo de decisión de tipo "System One" desarrollado por Apertix AI, derivado del modelo post-entrenado Qwen/Qwen3.8-27B. A diferencia de un modelo generativo convencional, Cerno no produce texto: recibe un *estado* (cualquier texto o JSON) junto con un conjunto de preguntas tipadas (opción múltiple con criterios explícitos, sí/no, escalas puntuadas) y devuelve una probabilidad calibrada para cada opción de cada pregunta en un único paso forward. Está pensado, por tanto, para tareas de clasificación y decisión estructurada, no para generación abierta.

El modelo conserva la atención causal del Qwen3.8-27B original, lo que le permite ejecutarse sobre el motor vLLM del código de inferencia oficial en FP8. Su innovación principal es el modo *read twice*: las peticiones de hasta 3.000 tokens se leen dos veces (estado, preguntas con opciones, una instrucción de relectura y de nuevo el estado) para mejorar la calidad de la decisión. Las probabilidades se recalibran con una temperatura fija de 1,059 ajustada sobre conjuntos de validación ajenos a los benchmarks.

La relevancia actual del modelo reside en su enfoque: sustituye la generación de texto por decisiones tipadas con probabilidades calibradas, lo que facilita su integración en pipelines que necesitan respuestas estructuradas y medibles. Con 26.896 millones de parámetros y licencia Apache 2.0, se posiciona como una alternativa de 27B dentro de la familia Cerno (que incluye variantes de 9B y 4B) para tareas de evaluación y enrutamiento automatizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención causal (derivada de Qwen3.8-27B), modo de decisión System One |
| Parametros totales | 26.895.998.464 (≈26,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; el modo *read twice* opera sobre peticiones de hasta 3.000 tokens |
| Tipos de cuantizacion | FP8 (compressed-tensors, `lm_head` en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8 comprimido, 29,4 GB) |

## Arquitectura y entrenamiento

Cerno 27B v1.1 es un transformer de 26,9B parámetros con atención causal, construido a partir del modelo post-entrenado Qwen/Qwen3.8-27B. No es un modelo generativo: su cabeza de salida produce una distribución de probabilidad sobre las opciones de cada pregunta tipada, con un máximo de 255 opciones por pregunta. El estado de entrada se comparte entre filas mediante la caché de prefijos de vLLM, y todas las filas de una petición se procesan en un solo lote con un paso forward por fila.

El entrenamiento parte del Qwen3.8-27B post-entrenado y se orienta a la decisión tipada. El modo *read twice* (activable o desactivable con `--option read_twice_tokens=0`) relee la entrada antes de responder. La calibración se realiza con una temperatura única de 1,059, ajustada sobre conjuntos de evaluación retenidos que no forman parte de los benchmarks; según el autor, esta temperatura no altera la respuesta elegida, solo reescala las probabilidades. La model card menciona que se usaron particiones de entrenamiento públicas de algunas familias de benchmarks (lo que motiva las métricas Train-split-OOD), pero no detalla el volumen total de tokens ni la composición completa del dataset.

## Capacidades

- Clasificación y decisión tipada: opción múltiple con criterios explícitos, preguntas sí/no y escalas puntuadas, con hasta 255 opciones por pregunta.
- Salida de probabilidades calibradas por opción, sin generación de texto.
- Procesamiento de estados en texto libre o JSON.
- Modo *read twice* para mejorar la calidad de la decisión en entradas de hasta 3.000 tokens.
- Procesamiento por lotes de múltiples preguntas sobre un mismo estado mediante caché de prefijos.
- Ejecución en FP8 sobre vLLM con atención causal.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo está diseñado para una decisión por paso forward).
- Capacidades multilingües: no disponibles.
- Capacidades especiales: probabilidades calibradas (ECE de 5,5 puntos en la medida del board) y modo de relectura.

## Casos de uso

- Enrutamiento y triaje de tickets: dado un estado con el texto de una incidencia y preguntas tipadas (categoría, urgencia, equipo responsable), el modelo devuelve probabilidades por opción que permiten automatizar la asignación con umbrales configurables.
- Moderación de contenido con criterios explícitos: clasificación sí/no o multietiqueta de textos frente a políticas definidas, aprovechando la calibración para fijar umbrales de revisión humana.
- Evaluación automática de respuestas: puntuación de salidas de otros modelos o de candidatos en procesos de selección mediante escalas puntuadas y preguntas de opción múltiple con criterios.
- Extracción de decisiones sobre datos estructurados: interpretación de estados en JSON (por ejemplo, registros de un CRM) para decidir la siguiente acción en un flujo de negocio.
- Clasificación de documentos y contratos: preguntas tipadas sobre cláusulas, tipo de documento o riesgo, con probabilidades por opción para priorizar la revisión.
- Filtrado y priorización en pipelines de datos: decisión por lotes sobre grandes volúmenes de registros, con un coste de 100 ms de mediana por petición en una H200 y procesamiento en lote de todas las preguntas de una petición.
- Sistemas de decisión con requisito de auditabilidad: al no generar texto y devolver probabilidades calibradas, facilita el registro y la trazabilidad de cada decisión.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Metrica | Cerno 27B v1.1 | Cerno 27B v1.0 |
|---|---:|---:|
| Decision Index 0.3 public index, complete run | 69,73 | 65,19 |
| Strict-OOD | 68,23 | 62,50 |
| Train-split-OOD | 67,65 | 63,20 |
| Calibration error, board-style ECE | 5,5 pts | 5,7 pts |

El índice público corresponde a la suite completa de 37 benchmarks y 140.178 peticiones, ejecutada con el kit de los mantenedores en el commit 9eb2dbe. El ruido entre ejecuciones es de aproximadamente 0,1-0,2 puntos. La puntuación Full del board (60% tests privados de las mismas habilidades y 40% tareas privadas de nuevos dominios) está pendiente para v1.1. El modelo v1.0 se sitúa, según la model card, segundo de 145 participantes en la base like-for-like del Decision Index 0.3.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan 29,4 GB; se recomienda una GPU con 40 GB o más para cargar el modelo con vLLM.
- GPU recomendadas: H200 (el autor reporta 100 ms de mediana y 231 ms de media por petición con una sola GPU y una petición a la vez), A100 80 GB, H100.
- GPU de consumo: no cabe en GPUs de consumo convencionales de 24 GB (RTX 4090) por el tamaño de los pesos FP8; no se han publicado opciones de cuantización adicionales.
- Opciones de despliegue: vLLM con el código de inferencia oficial (`apertixsk/cerno-inference`); la model card indica que vLLM carga los pesos sin opciones adicionales.
- Latencia y throughput: 100 ms de mediana y 231 ms de media por petición en una H200, una petición a la vez; no se han publicado cifras de throughput en lote.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Pesos | Motor | Indice publico | Licencia |
|---|---|---|---:|---|---:|---|
| Cerno 27B v1.1 | Qwen3.8-27B | ≈26,9B | FP8 | vLLM | 69,73 | Apache 2.0 |
| Cerno 27B v1.0 | Qwen3.8-27B | ≈26,9B | FP8 | vLLM | 65,19 | Apache 2.0 |
| Cerno 9B v1.2 | Qwen3.5-9B | ≈9B | bf16 | transformers | 66,83 | Apache 2.0 |
| Cerno 4B v1.2 | Qwen3.5-4B | ≈4B | bf16 | transformers | 65,05 | Apache 2.0 |

No se dispone de datos de benchmarks comparables frente a modelos de decisión de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo probabilidades sobre opciones predefinidas; no sirve para chat, redacción ni generación de código.
- El modo *read twice* está limitado a peticiones de hasta 3.000 tokens; entradas más largas quedan fuera de ese comportamiento.
- La temperatura de calibración (1,059) está ajustada para el modo de despliegue previsto; usarla fuera de ese contexto puede degradar la calibración.
- Las métricas publicadas son declaradas por el autor y no verificadas de forma independiente; la puntuación Full del board está pendiente.
- El índice público no es el ranking del board y no cuenta para la puntuación Full.
- Algunas familias de benchmarks comparten datos de entrenamiento con el modelo (de ahí las métricas Train-split-OOD), lo que puede inflar los resultados en esas familias.
- No hay información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos; al no generar texto, el riesgo de alucinación se traslada a la asignación de probabilidad a opciones incorrectas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.8-27B.
- El despliegue requiere GPU de 40 GB o más y el código de inferencia oficial; no se documentan alternativas como llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apertixai/cerno-27b-v1.1
- Cerno 27B v1.0: https://huggingface.co/apertixai/cerno-27b
- Cerno 9B v1.2: https://huggingface.co/apertixai/cerno-9b-v1.2
- Cerno 4B v1.2: https://huggingface.co/apertixai/cerno-4b-v1.2
- Código de inferencia: https://github.com/apertixsk/cerno-inference
- Dataset Decision Index runs: https://huggingface.co/datasets/apertixai/cerno-decision-index
- Perfil del autor: https://huggingface.co/apertixai
