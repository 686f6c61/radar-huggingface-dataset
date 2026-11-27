# Booooooooooooo/alqac2026-mdeberta-v3-base-xnli

## Resumen

`alqac2026-mdeberta-v3-base-xnli` es un modelo de clasificación de texto (cross-encoder) especializado en verificación de relevancia jurídica, es decir, un componente de *Natural Language Inference* (NLI) que decide si un fragmento de evidencia normativa respalda o no una consulta legal. Lo desarrolla el usuario de Hugging Face `Booooooooooooo` en el marco de un trabajo de fin de grado sobre sistemas de recuperación de información jurídica (Legal IR) y se ha entrenado sobre el conjunto de datos ALQAC2026, vinculado a la competición de preguntas y respuestas jurídicas ALQAC.

Técnicamente es un ajuste fino del modelo multilingüe `MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7`, un DeBERTa-v3 base con aproximadamente 278,8 millones de parámetros, reformulado como clasificador binario (entailment frente a contradiction/no relevante) con una longitud máxima de secuencia de 512 tokens y agregación tipo *max* sobre pasajes. Su función es la de un *re-ranker* o verificador de segunda etapa: recibe una pregunta y un pasaje candidato y devuelve una probabilidad de que el pasaje sea evidencia de soporte.

Es relevante ahora porque los pipelines de RAG jurídico necesitan filtrar con precisión las evidencias recuperadas antes de pasarlas al generador; un verificador NLI compacto y de licencia MIT como este puede desplegarse en hardware modesto y reducir falsos positivos en la recuperación. No obstante, el modelo es muy reciente (creado el 27 de noviembre de 2026), cuenta con cero descargas y cero *likes*, y su model card es escasa, por lo que debe considerarse un artefacto de investigación sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3 base (encoder transformer) ajustado como cross-encoder de clasificación; etiquetado como `deberta-v2` en los tags de Hugging Face |
| Parametros totales | 278.810.882 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (max_length declarado en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | vietnamita (`vi`); el modelo base es multilingüe, pero el ajuste se declara únicamente para vietnamita |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño del repo: 0,6 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia DeBERTa-v3 en configuración base, inicializado desde `MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7`, que a su vez deriva de un mDeBERTa-v3 base preentrenado de forma multilingüe y ajustado para NLI en varios idiomas. Sobre esa base se ha realizado un ajuste fino supervisado para una tarea de clasificación binaria con dos etiquetas: `0` (contradiction / non-relevant) y `1` (entailment / supporting evidence). La entrada se construye como un par pregunta-evidencia y se trunca a 512 tokens.

El entrenamiento utiliza el conjunto de datos ALQAC2026, asociado a la competición de recuperación y respuesta jurídica ALQAC. La model card no especifica el número de tokens de entrenamiento, la composición exacta del corpus, la proporción de ejemplos por clase, ni si se aplicaron técnicas de alineación como RLHF o DPO; tampoco se documentan estrategias de aumento de datos o de *hard negative mining*. Sí se explicita un detalle de inferencia relevante: la agregación de puntuaciones sobre múltiples pasajes se realiza mediante máximo (*bag aggregation: max*), lo que sugiere un uso del modelo como verificador sobre un conjunto de candidatos recuperados previamente.

## Capacidades

- Clasificación binaria de pares pregunta-evidencia en el dominio jurídico vietnamita: devuelve una puntuación de *entailment* (evidencia de soporte) frente a *contradiction* o no relevancia.
- Verificación de evidencia para pipelines de recuperación: actúa como *cross-encoder* de re-ranking sobre candidatos obtenidos por un retriever de primera etapa.
- Agregación de puntuaciones por máximo sobre conjuntos de pasajes, adecuada para seleccionar la mejor evidencia de un *pool*.
- Procesamiento de pares de texto de hasta 512 tokens, suficiente para párrafos de artículos legales y preguntas de usuario.
- Capacidad multilingüe heredada del modelo base mDeBERTa-v3, aunque el ajuste solo está validado y declarado para vietnamita.
- No se documenta soporte de *tool calling*, function calling, modo de razonamiento explícito (thinking), visión, audio ni generación de texto libre: es exclusivamente un clasificador.

## Casos de uso

- Re-ranking en RAG jurídico: tras recuperar los N artículos o cláusulas más similares con un retriever vectorial o BM25, el modelo puntúa cada par pregunta-pasaje y se conservan solo los que superan un umbral de *entailment*, reduciendo el ruido enviado al generador.
- Verificación de citas legales: dado un fragmento normativo citado por un sistema generativo, comprobar si realmente respalda la afirmación producida antes de mostrarla al usuario.
- Asistencia a la respuesta de preguntas legales (ALQAC): integrar el verificador como segunda etapa del pipeline de *question answering* sobre el corpus ALQAC2026 para seleccionar la evidencia que se pasa al modelo generador.
- Filtrado de falsos positivos en búsqueda documental: en un buscador de normativa, usar la puntuación del modelo para descartar resultados léxicamente similares pero semánticamente no pertinentes.
- Moderación de contenido jurídico generado: detectar respuestas de un LLM que no están respaldadas por ninguna evidencia recuperada y marcarlas para revisión humana.
- Evaluación automática de sistemas de recuperación: emplear el modelo como juez de relevancia para medir precisión y recall de un retriever sobre un conjunto de preguntas legales anotadas.
- Despliegue en entornos con recursos limitados: al ser un encoder de 278,8 M de parámetros con licencia MIT, puede ejecutarse en CPU o en una GPU de consumo para tareas de clasificación por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, F1, accuracy ni comparaciones con otros verificadores sobre ALQAC2026 u otros conjuntos jurídicos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,6 GB para los pesos (278,8 M de parámetros) más el *overhead* de activaciones; en la práctica, menos de 2 GB para lotes pequeños con secuencias de 512 tokens.
- En fp32, los pesos ocupan alrededor de 1,1 GB; el consumo total se mantiene por debajo de 3 GB con lotes moderados.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090, T4, L4, A10). Para alto *throughput* en servidor, A100 o H100 no son necesarias pero permiten lotes grandes.
- Cabe holgadamente en GPU de consumo e incluso puede ejecutarse en CPU para volúmenes moderados de clasificación.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, `text-embeddings-inference` o servidores de inferencia compatibles con modelos de clasificación (por ejemplo, un endpoint con `pipeline("text-classification")`), así como exportación a ONNX para optimización. No se documentan variantes GGUF para llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al tratarse de un encoder base con 512 tokens, la latencia por par en GPU moderna debería ser de milisegundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Booooooooooooo/alqac2026-mdeberta-v3-base-xnli` | 278,8 M | 512 tokens | NLI binario jurídico (vi) | MIT | Hugging Face, 0 descargas |
| `MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7` (modelo base) | ~278 M | 512 tokens | NLI multilingüe genérico | MIT | Hugging Face, ampliamente utilizado |
| `MoritzLaurer/DeBERTa-v3-base-mnli` | ~184 M | 512 tokens | NLI en inglés | MIT | Hugging Face |
| `cross-encoder/nli-deberta-v3-base` (Sentence-Transformers) | ~184 M | 512 tokens | NLI en inglés | Apache-2.0 (según el paquete) | Hugging Face |

La comparación directa de rendimiento no es posible porque el modelo no publica métricas. Frente a los verificadores NLI genéricos en inglés, la ventaja de este ajuste es su especialización en dominio jurídico vietnamita; su desventaja es la ausencia de validación pública y su nula adopción hasta la fecha.

## Limitaciones y advertencias

- Modelo sin validación externa: cero descargas y cero *likes* en el momento de la consulta; no hay evidencia independiente de su calidad.
- La model card no documenta métricas, composición del dataset ni proceso de anotación, lo que impide evaluar sesgos y robustez.
- Riesgo de alucinación no aplica en sentido generativo (no produce texto), pero sí de falsos positivos y falsos negativos en la clasificación de evidencia, con impacto directo en la calidad del pipeline de RAG.
- Entrenado y declarado únicamente para vietnamita; su uso en castellano u otros idiomas no está validado aunque el modelo base sea multilingüe.
- Ventana limitada a 512 tokens: los artículos legales largos deben fragmentarse, lo que puede romper la coherencia semántica de la evidencia.
- Licencia MIT, que permite uso comercial y modificación con atribución; aun así, el autor no ofrece garantías sobre el rendimiento en producción.
- El etiquetado como `deberta-v2` en los tags de Hugging Face puede generar confusión sobre la arquitectura real (DeBERTa-v3 base); conviene verificar la configuración al cargar el modelo.
- Es un componente de un trabajo académico: no hay garantía de mantenimiento, soporte ni actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Booooooooooooo/alqac2026-mdeberta-v3-base-xnli
- Modelo base: https://huggingface.co/MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7
- Competición ALQAC (referencia del conjunto de datos): https://alqac.github.io/
