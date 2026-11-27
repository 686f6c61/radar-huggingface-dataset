# Booooooooooooo/alqac2026-xlm-roberta-large-xnli

## Resumen

El modelo `Booooooooooooo/alqac2026-xlm-roberta-large-xnli` es un clasificador de inferencia de lenguaje natural (NLI) de tipo cross-encoder, ajustado a partir de `joeddav/xlm-roberta-large-xnli`, que se utiliza como verificador de evidencia en un sistema de recuperación de información jurídica (legal IR). Lo desarrolla el usuario de Hugging Face `Booooooooooooo` en el marco de un trabajo de fin de grado sobre recuperación de información legal, y su función es decidir si un fragmento de evidencia jurídica respalda o no una pregunta o consulta dada, devolviendo una etiqueta binaria de implicación (entailment) o contradicción/no relevancia.

El modelo tiene 559.892.482 parámetros (unos 560 millones) y se distribuye en formato safetensors con un repositorio de 2,3 GB, lo que corresponde a los pesos en precisión completa de un transformer encoder de tipo XLM-RoBERTa large. La longitud máxima de entrada es de 512 tokens, y la agregación sobre múltiples pasajes se realiza mediante el operador `max` (bag aggregation). Está entrenado sobre el conjunto de datos ALQAC2026 y declara únicamente el idioma vietnamita (`vi`).

Su relevancia actual es acotada pero específica: se trata de un componente de reranking/verificación dentro de un pipeline de recuperación jurídica, no de un modelo generativo. Resulta útil para quien construya sistemas de pregunta-respuesta sobre normativa vietnamita y necesite filtrar pasajes candidatos antes de pasarlos a un generador, o para experimentar con cross-encoders NLI en dominios legales de bajos recursos. La licencia MIT facilita su reutilización, incluido uso comercial, y el hecho de estar publicado con 0 descargas y 0 likes indica que es un artefacto de investigación reciente y sin validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large) como cross-encoder de clasificación de secuencias |
| Parámetros totales | 559.892.482 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max length de entrenamiento e inferencia) |
| Tipos de cuantización | no disponible (el autor no publica variantes cuantizadas; al ser safetensors, admite cuantización posterior con herramientas estándar) |
| Idiomas soportados | vietnamita (`vi`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | `joeddav/xlm-roberta-large-xnli` |
| Tarea (pipeline) | text-classification |
| Etiquetas | 0 = contradicción / no relevante; 1 = implicación / evidencia de soporte |
| Agregación de pasajes | max (bag aggregation) |
| Dataset de ajuste | ALQAC2026 |
| Tamaño del repositorio | 2,3 GB |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en XLM-RoBERTa large, es decir, un transformer encoder con atención bidireccional completa que recibe el par (pregunta, evidencia) concatenado y produce una representación conjunta que se proyecta a dos logits de clasificación. A diferencia de los bi-encoders, el cross-encoder permite que la pregunta y el pasaje interactúen token a token en todas las capas, lo que suele mejorar la precisión del reranking a costa de un mayor coste computacional por par evaluado. La cabeza de clasificación se ajusta para una decisión binaria: `0` para contradicción o no relevancia y `1` para implicación o evidencia de soporte.

El ajuste se realiza sobre el conjunto de datos ALQAC2026, en el contexto de un trabajo de fin de grado sobre recuperación de información jurídica. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; en un modelo de clasificación de este tipo lo habitual es un ajuste supervisado con entropía cruzada sobre pares etiquetados, pero ese extremo no se confirma en la información disponible. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La agregación de múltiples evidencias se resuelve en inferencia con una operación `max` sobre las puntuaciones de cada par, un patrón típico en verificación de evidencia para recuperación multi-pasaje.

## Capacidades

- Clasificación binaria de pares (pregunta, evidencia) en la tarea de inferencia de lenguaje natural: implicación frente a contradicción o no relevancia.
- Verificación de evidencia jurídica: determina si un pasaje normativo respalda una consulta concreta.
- Reranking de candidatos recuperados por un sistema de búsqueda previo (retrieval), al operar como cross-encoder sobre pares consulta-pasaje.
- Agregación de múltiples pasajes mediante `max` para producir una puntuación global de relevancia.
- Procesamiento de entradas de hasta 512 tokens, suficiente para cláusulas y artículos legales de longitud moderada.
- Soporte del idioma vietnamita, con el multilingüismo heredado del modelo base XLM-RoBERTa (aunque el ajuste declarado es solo `vi`).
- No dispone de generación de texto, tool calling, capacidades de agente, visión ni audio: es exclusivamente un clasificador.

## Casos de uso

- Verificación de evidencia en un sistema de pregunta-respuesta legal: dado un conjunto de artículos recuperados por un buscador (BM25, embeddings o híbrido), el modelo puntúa cada par pregunta-artículo y descarta los que no implican la respuesta, reduciendo falsos positivos antes de la generación.
- Reranking en pipelines de legal IR: se coloca como segunda etapa tras un bi-encoder, reevaluando los 50-100 candidatos recuperados y reordenándolos por probabilidad de implicación; su naturaleza cross-encoder captura interacciones léxicas y semánticas que el bi-encoder pierde.
- Construcción de conjuntos de datos de entrenamiento para generadores legales: el modelo puede etiquetar automáticamente pares pregunta-pasaje como soporte o no soporte, generando datos de instrucción o de preferencia para ajustar un LLM generativo en dominio jurídico vietnamita.
- Filtrado de citas en asistentes jurídicos: en una herramienta que sugiere normativa a abogados, el verificador comprueba que cada cita propuesta respalde realmente la afirmación, marcando las que no tengan implicación y reduciendo el riesgo de citas inventadas.
- Evaluación de sistemas de recuperación: sirve como juez automático para medir si los pasajes devueltos por un retriever contienen la evidencia necesaria, permitiendo comparar configuraciones de búsqueda sin anotación manual exhaustiva.
- Moderación de respuestas en dominios regulados: en flujos donde una respuesta automática debe estar respaldada por una fuente normativa, el verificador actúa como puerta de calidad y bloquea respuestas sin evidencia implicada.
- Investigación en NLI de dominio legal: como punto de partida para experimentos de cross-encoders en vietnamita, con licencia MIT que permite modificarlo y redistribuirlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1,1-1,3 GB para los pesos (560 M de parámetros), más el overhead de activaciones y del tokenizador; con batch pequeño cabe holgadamente en 4 GB.
- VRAM estimada en FP32: aproximadamente 2,2-2,5 GB para los pesos, más activaciones.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para batches moderados; A100, H100 o L40S para alto throughput en producción; RTX 4090, RTX 3090, RTX 4080 o RTX 4070 para desarrollo y despliegue en estación de trabajo.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o superiores (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090), e incluso en GPUs de 6 GB con batch 1 y FP16.
- Opciones de despliegue: Hugging Face `transformers` con `AutoModelForSequenceClassification` (como muestra la model card), `text-embeddings-inference` o servidores propios con `torch`; vLLM y TGI están orientados a modelos generativos y no son la vía natural para un cross-encoder de clasificación, aunque algunos entornos los soportan para reranking; llama.cpp u Ollama requerirían conversión a GGUF, no publicada por el autor.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como referencia arquitectónica, un cross-encoder de 560 M parámetros evalúa cada par de forma independiente, por lo que el coste crece linealmente con el número de candidatos a verificar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Booooooooooooo/alqac2026-xlm-roberta-large-xnli` | 559.892.482 | 512 | NLI binario / verificación de evidencia legal (vi) | MIT | Hugging Face, safetensors |
| `joeddav/xlm-roberta-large-xnli` (modelo base) | ~560 M | 512 | NLI zero-shot multilingüe (XNLI) | MIT | Hugging Face |
| `MoritzLaurer/mDeBERTa-v3-base-mnli-xnli` | ~278 M | 512 | NLI zero-shot multilingüe | MIT | Hugging Face |
| `cross-encoder/nli-deberta-v3-base` | ~184 M | 512 | NLI / reranking en inglés | MIT (según repositorio) | Hugging Face |

La comparación se limita a alternativas de la misma familia de cross-encoders NLI, ya que no se dispone de resultados de benchmarks del modelo evaluado que permitan contrastar rendimiento numérico. Frente al modelo base, este ajuste especializa la decisión en dominio legal vietnamita y reduce la salida a dos clases; frente a los modelos basados en DeBERTa, ofrece un mayor número de parámetros y cobertura multilingüe heredada, a cambio de un coste de inferencia superior por par.

## Limitaciones y advertencias

- No se han publicado métricas de evaluación, por lo que no hay evidencia pública de su calidad real en ALQAC2026 ni en otros conjuntos.
- El modelo declara únicamente vietnamita; su comportamiento en castellano u otros idiomas no está validado, aunque el modelo base sea multilingüe.
- Es un clasificador binario: no genera texto ni justifica su decisión, lo que limita su uso como componente explicable por sí solo.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación de implicación, especialmente con paráfrasis legales o negaciones complejas.
- La ventana de 512 tokens puede truncar artículos legales largos; la truncación aplicada en el tokenizador puede eliminar la parte relevante del pasaje.
- La agregación `max` sobre pasajes puede sobreestimar la relevancia si un único fragmento parcial obtiene una puntuación alta.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un corpus jurídico vietnamita, puede reflejar sesgos de ese dominio y de la distribución de ALQAC2026.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar el aviso de copyright y verificar las condiciones del modelo base y del dataset ALQAC2026, cuyas licencias no se detallan en la información disponible.
- Artefacto de investigación con 0 descargas y 0 likes: sin validación de la comunidad, sin tests de robustez y sin garantías de mantenimiento.
- Para producción, se recomienda validar con un conjunto propio etiquetado y considerar el coste de evaluar cada par por separado en pipelines con muchos candidatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Booooooooooooo/alqac2026-xlm-roberta-large-xnli
- Modelo base: https://huggingface.co/joeddav/xlm-roberta-large-xnli
- Documentación de XLM-RoBERTa: https://huggingface.co/docs/transformers/model_doc/xlm-roberta
- Documentación de clasificación de secuencias en Transformers: https://huggingface.co/docs/transformers/tasks/sequence_classification
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales del autor.
