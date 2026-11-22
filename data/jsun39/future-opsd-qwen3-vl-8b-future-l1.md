# jsun39/Future-OPSD-Qwen3-VL-8B-Future-L1

## Resumen

Future-OPSD-Qwen3-VL-8B-Future-L1 es un ajuste fino de Qwen/Qwen3-VL-8B-Instruct, desarrollado por Jingchen Sun y colaboradores (publicado bajo el handle jsun39), orientado a la predicción de futuro en vídeo (*video foresight reasoning*). El modelo parte de un VLM de 8.767 millones de parámetros con arquitectura transformer multimodal de Qwen y se entrena con el método Future-OPSD (On-Policy Self-Distillation) descrito en el paper *Learning Video Foresight Reasoning from Unlabeled Videos via On-Policy Self-Distillation*.

La innovación principal es el esquema de entrenamiento: no se usan etiquetas de respuesta, trazas de razonamiento ni modelos de recompensa externos. El estudiante ve solo el vídeo observado y genera su propio razonamiento y respuesta; un profesor congelado (copia del mismo modelo) ve además los fotogramas futuros reales y, por separado, los de un vídeo no relacionado. La ventaja por token mezcla el contraste entre futuro real y futuro ajeno con el término de destilación profesor–estudiante, con λ = 0,75.

Es relevante porque demuestra que se puede enseñar a un VLM a razonar sobre lo que ocurrirá a continuación en un vídeo usando únicamente pares pasado–futuro sin anotar, y porque mejora de forma sustancial las métricas específicas de predicción de futuro (TwiFF-Bench Avg de 53,6 a 67,7) sin degradar las capacidades generales de vídeo del modelo base. El checkpoint se publica con licencia Apache-2.0 y pesos en safetensors para transformers y vLLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), visión-lenguaje para image-text-to-text y vídeo |
| Parámetros totales | 8.767.123.696 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas en la información disponible) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-VL-8B-Instruct: un transformer multimodal que procesa imágenes y vídeo junto con texto y genera respuestas conversacionales. El ajuste se realiza con el objetivo Future-OPSD, una variante de destilación on-policy con contexto privilegiado. El contexto privilegiado z son los fotogramas futuros del propio vídeo; el profesor además observa los fotogramas futuros de un vídeo no relacionado para construir un contraste. La ventaja por token combina ese contraste real-vs-ajeno con la divergencia profesor–estudiante, con λ = 0,75 y baseline de media por batch.

El entrenamiento usó el dataset Future-L1-50K (pares pasado–futuro sin etiquetas de respuesta), con un schedule de 100 pasos × 256 consultas (25,6K consultas en total), 1 rollout on-policy por consulta, learning rate 1e-6 y 8 GPUs B200. Se eligió la semilla 31 (de tres semillas: 30, 31 y 32) por ser la mejor en TwiFF-Bench; las puntuaciones medias de TwiFF-Bench para las tres semillas fueron 66,1 / 67,7 / 66,9. El modelo se entrenó para razonar y responder en un formato concreto: razonamiento dentro de `<reason> </reason>` y respuesta final dentro de `<answer> </answer>`.

## Capacidades

- Predicción de futuro en vídeo: dado un clip observado, razona paso a paso y responde qué ocurrirá a continuación.
- Razonamiento explícito en formato estructurado (`<reason>` / `<answer>`), con presupuesto de razonamiento configurable (512 tokens en la evaluación del autor).
- Comprensión de vídeo general: tareas de TempCompass, TemporalBench, Video-MME y MVBench evaluadas en el paper.
- Procesamiento image-text-to-text: entrada multimodal de imágenes/vídeo más texto, salida de texto.
- Capacidades conversacionales multi-turno heredadas del modelo base Qwen3-VL-8B-Instruct.
- Capacidades generales del modelo base (código, matemáticas, multilingüismo, tool calling) presumiblemente conservadas, aunque no se documentan explícitamente en la información disponible.
- No se documenta soporte específico de audio ni de agentes multi-paso en la información proporcionada.

## Casos de uso

- Predicción de acciones en vídeo de vigilancia o robótica: el modelo observa un clip y anticipa la siguiente acción de una persona u objeto, útil para sistemas de alerta temprana o planificación de movimiento.
- Análisis de vídeo deportivo: anticipar la jugada siguiente a partir del contexto observado, con razonamiento explícito que permite auditar la decisión.
- Asistencia a la conducción y vídeo de tráfico: predecir maniobras de otros vehículos o peatones a partir de secuencias observadas, aprovechando el entrenamiento específico en pares pasado–futuro.
- Anotación y curación de datasets de vídeo: generar hipótesis de continuación para etiquetado asistido o para filtrar clips, dado que el modelo fue entrenado sin etiquetas y generaliza a predicción abierta.
- Investigación en razonamiento temporal: servir como checkpoint de referencia para estudiar destilación on-policy y predicción de futuro, con código y project page públicos.
- Prototipado de asistentes que explican lo que va a pasar en un vídeo: por ejemplo, tutoriales o demostraciones donde se pide al modelo justificar la predicción con una traza de razonamiento.
- Evaluación comparativa de VLMs en tareas de *foresight*: usar el checkpoint como baseline fuerte en TwiFF-Bench y benchmarks temporales.

## Benchmarks y rendimiento

Resultados publicados en la model card (protocolo del autor: vLLM, decodificación greedy, 32 fotogramas, system prompt indicado, presupuesto de razonamiento de 512 tokens; TwiFF-Bench puntuado 1–5 por un juez Qwen3.6-27B y reportado ×20; "General" promedia TempCompass, TemporalBench, Video-MME y MVBench).

| Modelo | TwiFF CoT | TwiFF Ans. | TwiFF Avg | SEED L1 | SEED L2 | SEED L3 | TempCompass | TemporalBench | Video-MME | MVBench | General |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen3-VL-8B-Instruct (base) | 58,6 | 48,7 | 53,6 | 45,4 | 47,5 | 39,7 | 78,3 | 18,6 | 61,7 | 65,5 | 56,0 |
| Este modelo | 71,9 | 63,4 | 67,7 | 46,0 | 47,0 | 38,8 | 79,6 | 19,9 | 63,0 | 66,7 | 57,3 |

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): en torno a 17,5 GB solo para pesos, más overhead de activaciones y caché KV para vídeo de 32 fotogramas; se recomienda 24 GB o más para comodidad.
- GPU recomendadas: B200 (usadas en entrenamiento), A100/H100 para producción; RTX 4090 (24 GB) puede alojar el modelo en BF16 con margen ajustado.
- Cabe en GPU de consumo de 24 GB (RTX 3090/4090) en BF16; en GPUs de 16 GB requeriría cuantización, no publicada en la información disponible.
- Opciones de despliegue: vLLM (versiones usadas en evaluación: transformers 4.57.1, vLLM 0.16; requisitos mínimos indicados: transformers >= 4.57, vLLM >= 0.11) y transformers con `AutoModelForImageTextToText`. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor usa `limit_mm_per_prompt={"video": 1}` en vLLM y 32 fotogramas por clip en evaluación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | TwiFF Avg | General | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Future-OPSD-Qwen3-VL-8B-Future-L1 | 8,77B | no disponible | 67,7 | 57,3 | Apache-2.0 | Hugging Face |
| Qwen3-VL-8B-Instruct (base) | ~8B | no disponible | 53,6 | 56,0 | Apache-2.0 | Hugging Face |
| Otros VLMs de 8B comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar de forma directa con el modelo base; no se dispone de datos de otros VLMs de tamaño similar en la documentación consultada.

## Limitaciones y advertencias

- El modelo está especializado en predicción de futuro en vídeo; fuera de ese dominio su comportamiento puede degradarse respecto al base, aunque los benchmarks generales se mantienen o mejoran ligeramente.
- Riesgo de alucinación en la predicción: el futuro es inherentemente incierto y el modelo puede generar continuaciones plausibles pero incorrectas, especialmente en escenarios ambiguos.
- El formato de salida (`<reason>` / `<answer>`) es parte del entrenamiento; usar otro system prompt puede degradar el rendimiento y romper el parseo.
- Los resultados publicados corresponden a una sola semilla (la 31); la variabilidad entre semillas en TwiFF-Bench es de aproximadamente 1,6 puntos (66,1–67,7).
- La evaluación usa un juez automático (Qwen3.6-27B) para TwiFF-Bench, lo que introduce dependencia del juez y posibles sesgos de puntuación.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe equivalente al del base.
- Licencia Apache-2.0 para los pesos, pero los datos de entrenamiento (Future-L1-50K) mantienen sus propios términos; revisar la dataset card antes de uso comercial.
- No se documentan cuantizaciones oficiales ni soporte en runtimes distintos de transformers/vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsun39/Future-OPSD-Qwen3-VL-8B-Future-L1
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Eurayka/Future-L1-50K
- Código: https://github.com/Jingchensun/future-opsd
- Project page: https://jingchensun.github.io/future-opsd/
