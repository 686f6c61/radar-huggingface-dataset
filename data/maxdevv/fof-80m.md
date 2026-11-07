# MaxDevv/FOF-80M

## Resumen

FOF-80M (Focus On Facts) es un modelo de embeddings de texto de 80 millones de parámetros desarrollado por MaxDevv, afinado a partir de `codefuse-ai/F2LLM-v2-80M`. No es un modelo generativo ni un encoder semántico de propósito general: está entrenado de forma contrastiva para funcionar como una «huella factual blanda», es decir, para colapsar la variación estilística (formalidad, verbosidad, enmarcado retórico) en un espacio de alta similitud y, simultáneamente, separar con fuerza textos que difieren en hechos concretos, incluso en un único sustantivo propio o una cifra.

El problema que aborda es conocido en el campo de los embeddings: los modelos de similitud semántica estándar confunden «qué se dice» con «cómo se dice», puntuando más alto copias casi idénticas con hechos alterados que reescrituras con hechos preservados pero estilo distinto. FOF-80M invierte ese comportamiento de forma deliberada, a costa de sacrificar tareas que requieren tolerancia a la omisión o compresión de información, como NLI o evaluación de resúmenes.

El modelo se publica bajo licencia Apache 2.0, con pesos en safetensors, integración con `sentence-transformers` y compatibilidad con Text Embeddings Inference. Está acompañado de un paper en OpenReview y de un benchmark propio, FOF-Bench, lo que lo sitúa como una herramienta de nicho orientada a detección de alucinaciones y verificación factual, más que como un encoder generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (fine-tune de `codefuse-ai/F2LLM-v2-80M`, familia Qwen3 según tags) |
| Parametros totales | 80.084.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se recomienda conversión explícita a bfloat16 o float16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

FOF-80M es un encoder transformer de 80M de parámetros obtenido por fine-tuning del modelo `codefuse-ai/F2LLM-v2-80M`, etiquetado en Hugging Face dentro de la familia Qwen3. El entrenamiento es contrastivo y está diseñado para aprender una representación invariante al estilo pero sensible a los hechos: el objetivo empuja hacia la similitud las paráfrasis que preservan el contenido factual y aleja las copias con alteraciones factuales sutiles (cambios de entidad, de número o de relación). El autor no detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO, que en un modelo de embeddings no serían el mecanismo habitual.

Una innovación destacable es la normalización estricta del texto previa a la codificación: el modelo se entrenó sobre texto normalizado (NFKD, transliteración ASCII, colapso de saltos de línea y espacios) para evitar atajos de aprendizaje basados en artefactos de formato como los saltos de línea de PDF. El autor proporciona una función `clean` que debe aplicarse antes de `encode` para reproducir el rendimiento documentado. Además, se recomienda la conversión explícita a bfloat16 o float16 para eficiencia de memoria, y el uso de `normalize_embeddings=True` en la codificación.

## Capacidades

- Generación de embeddings de texto para similitud y recuperación basada en contenido factual.
- Detección de paridad factual entre textos con independencia del estilo.
- Invariancia estilística: tolera enmarcado retórico, sarcasmo, verbosidad y expansiones de hasta 5x la longitud original siempre que los hechos coincidan.
- Detección de sustitución de entidades: alta sensibilidad a cambios en sustantivos propios, números y entidades científicas.
- Soporte de `sentence-transformers` y de Text Embeddings Inference (endpoints compatibles).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de representación, no generativo.
- Capacidad multilingüe limitada al inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Detección de alucinaciones en sistemas RAG: comparar la respuesta generada con el fragmento fuente recuperado y usar la separación de similitudes para marcar afirmaciones que introducen entidades o cifras no presentes en la fuente.
- Verificación factual de resúmenes generados: comprobar que cada hecho del resumen aparece en el documento original, aceptando reformulaciones estilísticas pero penalizando sustituciones de entidad.
- Control de calidad de traducciones o paráfrasis: detectar si una reescritura conserva estrictamente los hechos del original, incluso cuando la longitud se multiplica por cinco.
- Auditoría de citas y referencias en documentación técnica o científica: emparejar afirmaciones con pasajes fuente y señalar discrepancias en nombres, magnitudes o relaciones.
- Deduplicación factual de corpus: agrupar documentos que describen el mismo hecho con estilos muy distintos y separar variantes con datos alterados.
- Filtrado de datasets sintéticos: descartar pares generados que, pese a parecer paráfrasis, han introducido cambios factuales inadvertidos.
- Monitorización de respuestas en atención al cliente: verificar que la respuesta automática no altera datos contractuales, importes o nombres de producto respecto a la base de conocimiento.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Métrica | Base (`F2LLM-v2-80M`) | FOF-80M |
|---|---|---|---|
| FOF-Bench (paridad factual) | Triplet Accuracy | 0,42 % | 29,37 % |
| FOF-Bench (paridad factual) | Mean Separation (Pos − Neg) | −0,1650 | +0,0329 |
| DiSC (invariancia estilística) | Mean Cross-Style Sim | 0,7905 | 0,9559 |
| SNLI (sondas NLI) | 3-Way Accuracy (LR) | 71,07 % | 52,91 % |
| SummEval (resumen) | Consistency Correlation (ρ) | 0,2061 | 0,0198 |

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, aproximadamente 320 MB de pesos; en bfloat16 o float16, unos 160 MB. El repositorio ocupa 3,2 GB, pero el checkpoint utilizable es mucho menor.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre; el modelo cabe holgadamente en tarjetas de consumo como RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para lotes pequeños.
- Cabe en GPU de consumo: sí, con margen amplio.
- Opciones de despliegue: `sentence-transformers`, Text Embeddings Inference (TEI), y exportación a ONNX u otros formatos compatibles con la librería.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FOF-80M | 80,08 M | no disponible | Similitud factual, invariancia estilística | Apache 2.0 | Hugging Face |
| codefuse-ai/F2LLM-v2-80M | 80 M (aprox.) | no disponible | Embeddings generalistas (modelo base) | no disponible | Hugging Face |
| Encoders generalistas tipo all-MiniLM-L6-v2 | ~22 M | no disponible | Similitud semántica general | Apache 2.0 | Hugging Face |

La comparación directa con alternativas de propósito general es limitada: FOF-80M no compite en tareas semánticas estándar, sino en verificación factual estricta. Frente a su modelo base, mejora de forma muy marcada la paridad factual y la invariancia estilística, pero empeora en NLI y en evaluación de resúmenes.

## Limitaciones y advertencias

- No es un modelo de embeddings semánticos de propósito general; su perfil de capacidades es muy específico.
- Penalización por omisión: exige paridad factual bidireccional estricta; si un texto omite un detalle presente en otro, la similitud se reduce mucho. No debe usarse para NLI estándar ni para evaluación de resúmenes.
- Dominio de entidades: en textos muy densos, una alta coincidencia de sustantivos propios puede enmascarar errores relacionales (por ejemplo, intercambiar quién hizo qué a quién).
- Fragilidad ortográfica: correcciones de erratas pueden interpretarse como eliminación de una entidad y sustitución por otra nueva.
- Compresión del coseno: muchos pares caen en una región de coseno alto; los valores absolutos están mal calibrados y la señal útil es el orden relativo y la distancia de separación.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede producir falsos negativos o falsos positivos en la verificación factual según la densidad de entidades.
- Idioma: solo inglés; el rendimiento en castellano no está documentado ni garantizado.
- Normalización obligatoria: sin aplicar la función `clean` documentada, el rendimiento puede degradarse.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y del paper asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MaxDevv/FOF-80M
- Paper (OpenReview): https://openreview.net/forum?id=ZnfAvLJRnn
- Dataset FOF-Bench: https://huggingface.co/datasets/MaxDevv/FOF-Bench
- Modelo base: https://huggingface.co/codefuse-ai/F2LLM-v2-80M
