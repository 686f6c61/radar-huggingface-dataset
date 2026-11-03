# Adisalamr/Capstone_AntiMaling

## Resumen

Capstone_AntiMaling es un modelo de la familia BERT publicado en HuggingFace por el usuario Adisalamr bajo licencia MIT. Con 124.442.882 parámetros (aproximadamente 124 millones, coherente con un BERT-base o una variante cercana), se distribuye en formato safetensors y ocupa unos 0,5 GB en el repositorio. El nombre sugiere un proyecto de fin de curso ("Capstone") orientado a la detección o el filtrado de *malingering* (simulación de síntomas o enfermedad), aunque la model card no aporta ninguna descripción funcional, datos de entrenamiento ni resultados.

La relevancia del modelo es, a día de hoy, muy limitada para producción: no tiene descargas ni likes, no declara pipeline, no especifica idiomas soportados y la model card se reduce a la línea de licencia. Se trata, por tanto, de un artefacto de investigación o de un ejercicio académico cuyo comportamiento real solo puede determinarse inspeccionando los pesos y la configuración del repositorio.

Esta ficha documenta exclusivamente lo que puede verificarse a partir de los metadatos disponibles (arquitectura BERT, recuento de parámetros, licencia MIT, formato safetensors) y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder-only, según el tag `bert` del repositorio) |
| Parámetros totales | 124.442.882 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no declarada en la model card; en BERT-base suele ser 512 tokens, pero no se confirma) |
| Tipos de cuantización | no disponible (solo se distribuyen pesos safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline declarado | no disponible |
| Tamaño del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El tag `bert` y el recuento de 124,4 millones de parámetros sitúan al modelo en el entorno de BERT-base (110 M en la versión original de Google, 124 M en variantes como BERT-base-uncased de HuggingFace con embeddings ampliados). Se trata, por tanto, de un transformer encoder-only bidireccional, adecuado por diseño para tareas de clasificación de secuencias, etiquetado token a token y *sentence embeddings*, no para generación autoregresiva.

No hay información publicada sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset, el uso de RLHF/DPO (poco habitual en modelos encoder-only) ni sobre posibles innovaciones técnicas. Tampoco se indica si el modelo parte de un checkpoint preentrenado (por ejemplo, `bert-base-uncased`) y se ha afinado, o si se ha entrenado desde cero. El nombre "AntiMaling" apunta a una tarea de clasificación binaria o multietiqueta relacionada con la detección de simulación de síntomas, pero es una inferencia a partir del nombre y no un dato confirmado por el autor.

## Capacidades

- Codificación de texto bidireccional propia de BERT: representaciones contextuales útiles para clasificación, NER, similitud semántica y *reranking*.
- Potencial clasificador de secuencias (una o varias etiquetas), si el checkpoint incluye una cabeza de clasificación; no confirmado en la model card.
- No se ha documentado soporte de *tool calling* ni de *function calling*.
- No se ha documentado soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- No se ha documentado *thinking mode*, visión, audio ni otras modalidades.
- No se ha documentado generación de texto autoregresiva (la arquitectura encoder-only no la soporta de forma nativa).

## Casos de uso

- Clasificación de textos clínicos o cuestionarios: si el checkpoint incluye una cabeza de clasificación entrenada para detectar simulación de síntomas, podría emplearse para puntuar respuestas de escalas psicométricas; requeriría validación externa porque el autor no documenta el etiquetado.
- Extracción de características para *downstream*: usar las representaciones del encoder como *embeddings* de frases en pipelines de búsqueda semántica o *reranking*, sustituyendo o complementando a `bert-base-uncased`.
- *Fine-tuning* sobre datos propios: al ser un BERT-base de 124 M con licencia MIT, es un punto de partida barato para tareas de clasificación en dominios especializados (legal, médico, moderación de contenido).
- Etiquetado de secuencias (NER, extracción de entidades): arquitectura adecuada para token classification tras añadir la cabeza correspondiente.
- Detección de simulación en contextos de seguros o RR. HH.: uso hipotético y de alto riesgo; exigiría auditoría de sesgos y validación clínica antes de cualquier despliegue.
- Componente en un *ensemble* o como *baseline* académico: útil para comparar contra modelos mayores en experimentos de investigación, dado su bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 0,5 GB de pesos (124 M × 4 bytes) más activaciones; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- VRAM estimada en FP16/BF16: aproximadamente 0,25 GB de pesos; ejecutable en GPUs integradas o incluso en CPU para lotes pequeños.
- GPU recomendadas: no se requiere GPU dedicada; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, pero están sobredimensionadas para este tamaño. Una T4 o una GPU integrada moderna son suficientes.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM; también en CPU con latencias de decenas de milisegundos por secuencia corta.
- Opciones de despliegue: `transformers` (PyTorch), `Optimum`/ONNX Runtime, `TorchScript`, `vLLM` no aplica (no es generativo), `llama.cpp`/GGUF no disponible en el repositorio, `Ollama` no aplica, `TGI` (Text Generation Inference) no aplica por la misma razón.
- Latencia y *throughput*: no disponibles; en un BERT-base típico se esperan del orden de 1-5 ms por secuencia de 128 tokens en una GPU moderna y decenas de milisegundos en CPU, pero son estimaciones genéricas no verificadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Adisalamr/Capstone_AntiMaling | 124,4 M | no disponible | MIT | HuggingFace, 0 descargas | Sin model card ni benchmarks |
| google-bert/bert-base-uncased | 110 M | 512 | Apache 2.0 | HuggingFace, ampliamente usado | Referencia estándar, benchmarks públicos |
| distilbert-base-uncased | 66 M | 512 | Apache 2.0 | HuggingFace | Más rápido, ~40 % menos parámetros, ligeramente inferior en accuracy |
| roberta-base | 125 M | 512 | MIT | HuggingFace | Entrenado con más datos y *dynamic masking*; mejor rendimiento general en GLUE |

La comparación se basa en características públicas de los modelos de referencia; no hay datos de rendimiento del modelo de Adisalamr que permitan situarlo frente a ellos.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card funcional, ni descripción de la tarea, ni datos de entrenamiento, lo que impide evaluar su idoneidad para cualquier uso.
- Riesgo de alucinación y de clasificaciones erróneas no cuantificado: al no haber benchmarks ni validación publicada, no puede estimarse su fiabilidad.
- Posible sesgo derivado de un dataset de entrenamiento desconocido; especialmente crítico si el modelo se aplica a detección de simulación de síntomas, un ámbito con implicaciones clínicas y legales.
- Idiomas soportados no declarados: no puede asumirse un buen rendimiento en castellano ni en ningún otro idioma.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni asume responsabilidad sobre el comportamiento del modelo.
- Sin descargas ni validación comunitaria: no hay evidencia de que el checkpoint funcione correctamente ni de que los pesos estén completos.
- No apto para generación de texto: la arquitectura encoder-only no produce texto de forma autoregresiva.
- Uso en contextos de salud, seguros o RR. HH. desaconsejado sin auditoría independiente y validación clínica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Adisalamr/Capstone_AntiMaling
- No se han encontrado papers, blogs, repositorios ni demos asociados en la información disponible.
