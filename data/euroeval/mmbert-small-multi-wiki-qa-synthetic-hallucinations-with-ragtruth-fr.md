# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fr

## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fr` es un clasificador de tokens basado en la arquitectura ModernBERT-small, desarrollado por el grupo EuroEval. Su propósito es detectar alucinaciones a nivel de token en respuestas generadas por sistemas de retrieval-augmented generation (RAG), específicamente para el idioma francés. Se trata de un modelo de fine-tuning entrenado con datos sintéticos generados mediante el framework LettuceDetect, que produce etiquetas de veracidad sobre respuestas obtenidas a partir de contextos de Wikipedia multilingües (MultiWikiQA).

El modelo forma parte de una familia multilingüe (existen versiones en inglés e italiano) y aborda un problema crítico en sistemas RAG: la verificación de la fidelidad de las respuestas generadas respecto a las fuentes consultadas. Con 140 millones de parámetros, es un modelo compacto y eficiente, adecuado para integrarse en pipelines de control de calidad sin requerir infraestructura de gran escala. Su relevancia actual radica en la creciente adopción de RAG en producción, donde la detección de alucinaciones es un requisito para garantizar fiabilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-small (transformer encoder) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ModernBERT-small soporta 8192 tokens, pero no se confirma en la documentación del modelo) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | francés (según el nombre del modelo; la model card no especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT-small, una variante eficiente de la arquitectura BERT optimizada para mayor velocidad y menor consumo de memoria. ModernBERT incorpora atención con ventana deslizante y embeddings posicionales rotatorios, lo que permite manejar secuencias largas con recursos limitados. Sobre esta base, se realizó un fine-tuning para la tarea de clasificación de tokens, donde cada token de una respuesta generada se etiqueta como veraz o alucinado.

El entrenamiento utilizó datos sintéticos producidos por el framework LettuceDetect, descrito en el artículo "A multilingual hallucination benchmark: MultiWikiQHalluA" (arXiv:2605.02504). Este pipeline toma contextos y preguntas de MultiWikiQA, genera respuestas mediante un modelo de lenguaje y las etiqueta automáticamente a nivel de token como alucinadas o fieles. El corpus resultante se inspira en RAGTruth, un corpus de alucinaciones a nivel de palabra para entornos RAG. No se dispone de detalles sobre hiperparámetros, régimen de entrenamiento ni composición exacta del dataset.

## Capacidades

- Detección de alucinaciones a nivel de token en respuestas generadas por LLM dentro de un contexto RAG.
- Clasificación binaria por token: veraz o alucinado, lo que permite localizar fragmentos problemáticos dentro de una respuesta.
- Funciona como componente de verificación posterior a la generación, no como generador de texto.
- Capacidad multilingüe del modelo base (ModernBERT-small multilingüe), aunque esta versión específica está afinada para francés.
- Integración sencilla con la librería `transformers` mediante el pipeline de `token-classification`.

## Casos de uso

- Control de calidad en asistentes conversacionales basados en RAG: el modelo puede etiquetar cada token de la respuesta generada y señalar segmentos que no se corresponden con las fuentes, permitiendo a un sistema supervisor descartar o corregir la respuesta antes de mostrarla al usuario.
- Auditoría de sistemas RAG en producción: se puede ejecutar de forma periódica sobre logs de respuestas para detectar patrones de alucinación y evaluar la calidad del sistema sin intervención manual.
- Filtrado de respuestas en pipelines de generación de informes: en entornos donde se generan resúmenes a partir de documentos, el modelo identifica frases no soportadas por el contexto, reduciendo el riesgo de información falsa en documentos legales o médicos.
- Entrenamiento de otros modelos: las etiquetas producidas pueden servir como datos de entrenamiento para modelos más grandes o para ajustar políticas de decodificación (por ejemplo, penalizar tokens marcados como alucinados).
- Investigación en detección de alucinaciones: el modelo sirve como baseline reproducible para estudios comparativos sobre métodos de verificación de fidelidad en RAG multilingüe.
- Integración en pipelines de evaluación automática: se puede combinar con métricas como RAGAS o Faithfulness para proporcionar una señal a nivel de token, complementando evaluaciones agregadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación y el artículo asociado (arXiv:2605.02504) no está accesible en su totalidad desde los resultados de búsqueda. Por tanto, no se pueden reportar cifras de precisión, recall o F1.

## Requisitos de hardware

- VRAM estimada para inferencia: con 140 millones de parámetros en precisión FP32, el modelo ocupa aproximadamente 560 MB en memoria. En FP16, unos 280 MB. Se puede ejecutar en GPUs con 2 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU moderna, incluidas las de consumo como NVIDIA GTX 1060 (6 GB) o superiores. También funciona en CPU con razonable latencia para secuencias cortas.
- Compatible con GPUs de consumo: sí, cabe en tarjetas como RTX 3060, RTX 4060, etc., sin necesidad de hardware profesional.
- Opciones de despliegue: al ser un modelo de transformers estándar, se puede servir con vLLM (aunque está orientado a generación, para clasificación se puede usar el pipeline de `transformers`), Hugging Face Inference Endpoints, o en local con `torch`. No se ha confirmado compatibilidad con llama.cpp u Ollama, ya que esos entornos están pensados para modelos de lenguaje generativos.
- Latencia estimada: para una secuencia de 512 tokens, la inferencia en GPU tarda del orden de milisegundos (típico de modelos BERT-small). En CPU puede ser de decenas de milisegundos. No hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|---|
| EuroEval/mmBERT-small-...-fr (este) | ModernBERT-small | 140M | no disponible | Detección de alucinaciones (token) | no disponible |
| EuroEval/mmBERT-small-...-en | ModernBERT-small | 140M | no disponible | Detección de alucinaciones (token) | no disponible |
| EuroEval/mmBERT-small-...-it | ModernBERT-small | 140M | no disponible | Detección de alucinaciones (token) | no disponible |
| Modelos basados en RAGTruth (p.ej. fine-tunes de BERT) | BERT-base | 110M | 512 | Detección de alucinaciones (token) | varía |

No se dispone de comparativas cuantitativas con otros modelos de detección de alucinaciones. Las versiones en inglés e italiano del mismo modelo son las alternativas más directas, diferenciándose únicamente en el idioma de entrenamiento.

## Limitaciones y advertencias

- El modelo se entrenó con datos sintéticos generados por un LLM, lo que puede introducir sesgos del generador y limitar la generalización a respuestas reales de otros sistemas RAG.
- La model card no especifica la licencia, por lo que no se puede garantizar su uso comercial sin consultar al autor.
- No se han documentado sesgos específicos, pero al ser un modelo multilingüe afinado solo para francés, su rendimiento en otros idiomas no está garantizado.
- La detección a nivel de token puede producir falsos positivos en respuestas parafraseadas correctamente pero con redacción distinta a la fuente.
- No es un modelo generativo; no puede producir respuestas ni explicaciones, solo etiquetar tokens.
- Al no haber benchmarks publicados, no se puede evaluar su fiabilidad comparativa frente a otras soluciones.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fr
- Versión en inglés: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-en
- Versión en italiano: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-it
- Artículo "A multilingual hallucination benchmark: MultiWikiQHalluA" (arXiv): https://arxiv.org/pdf/2605.02504v2
- Repositorio RAGTruth: https://github.com/ParticleMedia/RAGTruth
