# Osam-2025/quantosimo-curriculum-embeddings-v1

## Resumen

`quantosimo-curriculum-embeddings-v1` es un modelo de embeddings de frases desarrollado por el usuario Osam-2025 (Samuel Osagiede) para la plataforma QuantOsimo, un servicio de tutoría con IA para estudiantes británicos de Matemáticas y Ciencias desde KS2 hasta A-Level. Se trata de un fine-tuning del conocido `sentence-transformers/all-MiniLM-L6-v2`, un transformer BERT de 22,7 millones de parámetros, especializado en la recuperación semántica de contenido curricular del Reino Unido.

El modelo resuelve un problema muy concreto: la búsqueda semántica dentro de un corpus educativo británico generado a partir de las especificaciones oficiales de AQA, Edexcel y OCR. En lugar de un modelo de propósito general, se ha entrenado con pares y tripletas del dominio para que los vectores capturen similitudes entre fragmentos de temario, criterios de evaluación y descriptores de competencias.

Es relevante por su carácter de modelo de nicho: demuestra cómo un modelo pequeño y ligero (0,1 GB en el repositorio) puede adaptarse a un dominio vertical mediante un conjunto de datos reducido (1.077 ejemplos) con la pérdida `MultipleNegativesRankingLoss`. No obstante, la información pública es escasa (sin licencia declarada, sin idiomas especificados y con un único resultado de evaluación no verificado), lo que limita su uso en producción fuera del contexto para el que fue creado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer BERT (base: `sentence-transformers/all-MiniLM-L6-v2`) |
| Parámetros totales | 22.713.216 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de MiniLM-L6; el autor no la declara) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con text-embeddings-inference) |
| Idiomas soportados | no disponible (el corpus de entrenamiento es contenido curricular británico en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `sentence-transformers`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `sentence-transformers/all-MiniLM-L6-v2`, un encoder BERT de seis capas y 22,7 millones de parámetros diseñado originalmente para generar embeddings de frases de 384 dimensiones. La arquitectura subyacente es un transformer estándar de tipo encoder; el autor no documenta modificaciones estructurales, por lo que se asume que conserva la configuración de MiniLM-L6.

El entrenamiento se realizó con `MultipleNegativesRankingLoss`, una función de pérdida típica en recuperación densa que utiliza los ejemplos negativos del propio lote para contrastar positivos y negativos. El conjunto de datos declarado contiene 1.077 ejemplos, presumiblemente tripletas o pares de fragmentos curriculares. La model card incluye un ejemplo de widget con texto de especificaciones de A-Level Biology (OCR), lo que confirma que el corpus de entrenamiento procede de documentos oficiales de examen. No se documentan detalles sobre número de tokens, composición exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en un modelo de embeddings).

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación densa.
- Extracción de características (`feature-extraction`) para pipelines de búsqueda vectorial.
- Recuperación semántica de contenido curricular británico (AQA, Edexcel, OCR) en Matemáticas y Ciencias.
- Compatibilidad con `sentence-transformers` y con `text-embeddings-inference` (tag `endpoints_compatible`), lo que permite desplegarlo como endpoint de embeddings.
- Soporte de búsqueda por similitud coseno entre consultas de estudiantes y fragmentos de temario.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales: es un encoder de embeddings, no un modelo generativo.
- Capacidades multilingües: no documentadas; el entrenamiento se orienta a inglés británico curricular.

## Casos de uso

- Búsqueda semántica en el temario: indexar los fragmentos de las especificaciones de AQA, Edexcel y OCR y recuperar los más relevantes para la consulta de un estudiante, usando similitud coseno sobre los embeddings de 384 dimensiones.
- Recomendación de recursos de estudio: dado un tema o una duda, recuperar los descriptores de competencia y los criterios de evaluación relacionados para sugerir material de repaso alineado con el examen.
- Enrutamiento de preguntas en un tutor conversacional: clasificar la consulta del alumno y dirigirla al módulo de Matemáticas o Ciencias correspondiente según la similitud con los fragmentos curriculares indexados.
- Deduplicación y clustering de contenido educativo: agrupar fragmentos redundantes del temario (por ejemplo, solapamientos entre especificaciones de distintas juntas) mediante similitud de embeddings.
- Evaluación de cobertura curricular: comparar los materiales de un curso con los descriptores oficiales para detectar lagunas de contenido, midiendo distancias cosenas entre documentos.
- Búsqueda interna en plataformas de tutoría: integrar el modelo en un endpoint de `text-embeddings-inference` para servir búsquedas de bajo coste con un modelo de 0,1 GB, apto para infraestructura modesta.
- Filtrado de preguntas fuera de alcance: detectar consultas ajenas al currículo británico de KS2 a A-Level comparando su embedding con el centroide del corpus.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Triplet | curriculum eval | Cosine Accuracy | 1,0 | No |

No se han publicado otros resultados de benchmarks (MMLU, MTEB, etc.) en la información disponible. El único dato es una accuracy coseno de 1,0 sobre un conjunto de evaluación propio del autor, marcada como no verificada; debe interpretarse con cautela porque el conjunto de evaluación no está descrito y probablemente sea muy pequeño y del mismo dominio que el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,7 M de parámetros, ~91 MB de pesos); en la práctica cabe en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con latencia aceptable para búsquedas puntuales. Para servir alto volumen, una T4, L4 o RTX 4090 son más que suficientes.
- Cabe en cualquier GPU consumer (GTX 1650, RTX 3060, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: `sentence-transformers` (Python), `text-embeddings-inference` (tag `endpoints_compatible`), y exportación a ONNX para inferencia en CPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en lote sobre GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `quantosimo-curriculum-embeddings-v1` | 22,7 M | no disponible | no disponible | Hugging Face (79 descargas) | Fine-tuning de nicho para currículo británico |
| `sentence-transformers/all-MiniLM-L6-v2` | 22,7 M | 256 tokens (según su model card original) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base; propósito general, sin especialización curricular |
| `BAAI/bge-small-en-v1.5` | ~33 M | 512 tokens | MIT | Hugging Face | Alternativa popular para recuperación en inglés con mejor rendimiento MTEB |
| `intfloat/e5-small-v2` | ~33 M | 512 tokens | MIT | Hugging Face | Buen equilibrio tamaño/calidad para búsqueda semántica |

La comparación con alternativas de propósito general es desfavorable en transparencia (licencia e idiomas no declarados), pero el modelo puede superar a los genéricos en el dominio específico del currículo británico si el fine-tuning es correcto, algo que no puede confirmarse con los datos públicos disponibles.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es un riesgo legal relevante para producción.
- Idiomas no declarados: el entrenamiento se orienta a inglés curricular británico; el rendimiento en castellano u otros idiomas es desconocido y probablemente pobre.
- El único benchmark (Cosine Accuracy = 1,0) está marcado como no verificado y procede de un conjunto de evaluación propio no descrito; no es evidencia sólida de calidad.
- Dataset de entrenamiento muy pequeño (1.077 ejemplos): riesgo de sobreajuste al corpus específico y de escasa generalización fuera de los documentos usados.
- No hay información sobre sesgos; al derivar de especificaciones oficiales de examen, podría heredar sesgos de esos documentos (por ejemplo, en la selección de ejemplos o terminología).
- Riesgo de alucinación no aplicable en sentido generativo (es un encoder), pero sí de recuperaciones irrelevantes si la consulta cae fuera del dominio curricular.
- Longitud de contexto no documentada: se hereda la limitación de MiniLM-L6 (típicamente 256 tokens), lo que obliga a fragmentar documentos largos antes de indexarlos.
- Sin soporte de tool calling, agentes ni generación: no debe confundirse con un LLM; su uso se limita a embeddings.
- Repositorio de 0,1 GB y 79 descargas: ecosistema mínimo, sin garantías de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Osam-2025/quantosimo-curriculum-embeddings-v1
- Perfil del autor: https://huggingface.co/Osam-2025/models
- Plataforma QuantOsimo: https://quantosimo.com
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de SimCSE / representaciones contrastivas (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
